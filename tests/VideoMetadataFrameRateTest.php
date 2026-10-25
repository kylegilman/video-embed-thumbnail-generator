<?php
/**
 * Tests for the frame rate Video_Metadata reads from FFmpeg and carries to
 * the encoder.
 *
 * Bitrates scale with frame rate (50/60 fps content needs about 1.5x the
 * bits of 24-30 fps), so the encoder needs a trustworthy value. These cover
 * parsing it out of `ffmpeg -i` output, normalizing the values getID3 and
 * older saved metadata hold, and the cascade: saved metadata and WordPress
 * core metadata are used without any probe, while a complete record that
 * lacks a frame rate gets a probe that touches only the frame rate.
 *
 * The probe scenarios run a small fake `ffmpeg` shell script that prints a
 * real-looking stream summary to stderr, so the true FFmpeg_Process path is
 * exercised without needing FFmpeg in the test container.
 */

use Videopack\Admin\Encode\Video_Metadata;
use Videopack\Admin\Attachment_Meta;

class VideoMetadataFrameRateTest extends WP_UnitTestCase {

	/**
	 * @var string[] Files created during a test, cleaned up in tear_down().
	 */
	protected $temp_files = array();

	public function tear_down() {
		foreach ( $this->temp_files as $file ) {
			if ( file_exists( $file ) ) {
				wp_delete_file( $file );
			}
		}
		$this->temp_files = array();
		parent::tear_down();
	}

	protected function options(): array {
		return get_option( 'videopack_options', array() );
	}

	protected function video_attachment(): int {
		$attachment_id      = self::factory()->attachment->create_object(
			array(
				'file'           => 'video.mp4',
				'post_mime_type' => 'video/mp4',
			)
		);
		$attached_file      = get_attached_file( $attachment_id );
		$this->temp_files[] = $attached_file;
		file_put_contents( $attached_file, 'fake video content' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents

		return $attachment_id;
	}

	/**
	 * Writes an executable stand-in for ffmpeg that prints a stream summary
	 * to stderr (where the real one does) and records that it ran.
	 *
	 * @param string $video_line The "Stream ... Video: ..." line to print.
	 * @return string Path to the script. A `.called` file appears next to it when it runs.
	 */
	protected function fake_ffmpeg( string $video_line ): string {
		$path               = wp_tempnam( 'fake-ffmpeg' );
		$this->temp_files[] = $path;
		$this->temp_files[] = $path . '.called';

		$script = "#!/bin/sh\n"
			. "touch \"\$0.called\"\n"
			. "echo 'Input #0, mov,mp4, from video.mp4:' >&2\n"
			. "echo '  Duration: 00:00:12.50, start: 0.000000, bitrate: 7000 kb/s' >&2\n"
			. "echo '" . $video_line . "' >&2\n"
			. "exit 1\n";

		file_put_contents( $path, $script ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		chmod( $path, 0755 ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_chmod

		return $path;
	}

	protected function video_metadata( int $id, string $ffmpeg_path ): Video_Metadata {
		return new Video_Metadata( $id, get_attached_file( $id ), true, $ffmpeg_path, $this->options() );
	}

	// -----------------------------------------------------------------
	// parse_frame_rate()
	// -----------------------------------------------------------------

	public function test_parses_the_fps_token_from_a_real_stream_line(): void {
		$output = "  Stream #0:0[0x1](und): Video: h264 (High) (avc1 / 0x31637661), yuv420p(tv, bt709, progressive), 1920x1080 [SAR 1:1 DAR 16:9], 7019 kb/s, 23.98 fps, 23.98 tbr, 24k tbn (default)\n";

		$this->assertSame( 23.98, Video_Metadata::parse_frame_rate( $output ) );
	}

	public function test_parses_whole_number_rates(): void {
		$this->assertSame( 60.0, Video_Metadata::parse_frame_rate( "Stream #0:0: Video: h264, yuv420p, 3840x2160, 60 fps, 60 tbr, 90k tbn\n" ) );
		$this->assertSame( 25.0, Video_Metadata::parse_frame_rate( "Stream #0:0: Video: vp9, yuv420p, 1280x720, 25 fps, 25 tbr, 1k tbn\n" ) );
	}

	public function test_uses_the_video_stream_not_other_streams(): void {
		$output = "  Stream #0:0: Audio: aac, 48000 Hz, stereo, fltp, 128 kb/s\n"
			. "  Stream #0:1: Video: h264, yuv420p, 1920x1080, 29.97 fps, 29.97 tbr, 30k tbn\n";

		$this->assertSame( 29.97, Video_Metadata::parse_frame_rate( $output ) );
	}

	public function test_falls_back_to_tbr_only_when_fps_is_missing(): void {
		$this->assertSame( 24.0, Video_Metadata::parse_frame_rate( "Stream #0:0: Video: mpeg4, yuv420p, 640x480, 24 tbr, 24 tbn\n" ) );
		$this->assertSame( 30.0, Video_Metadata::parse_frame_rate( "Stream #0:0: Video: h264, yuv420p, 640x480, 30 fps, 50 tbr, 90k tbn\n" ), 'fps wins over tbr' );
	}

	public function test_rejects_implausible_or_missing_rates(): void {
		// A variable-frame-rate file can report a 1000 tbr.
		$this->assertNull( Video_Metadata::parse_frame_rate( "Stream #0:0: Video: vp8, yuv420p, 640x360, 1k tbr, 1k tbn\n" ) );
		$this->assertNull( Video_Metadata::parse_frame_rate( "Stream #0:0: Video: h264, yuv420p, 640x360, 0 fps, 0 tbr\n" ) );
		$this->assertNull( Video_Metadata::parse_frame_rate( "Stream #0:0: Video: h264, yuv420p, 640x360\n" ) );
		$this->assertNull( Video_Metadata::parse_frame_rate( "Stream #0:0: Audio: aac, 48000 Hz, 29.97 fps\n" ), 'only a video stream counts' );
		$this->assertNull( Video_Metadata::parse_frame_rate( '' ) );
	}

	// -----------------------------------------------------------------
	// normalize_frame_rate()
	// -----------------------------------------------------------------

	public function test_normalizes_numeric_strings_and_numbers_to_float(): void {
		$this->assertSame( 23.976023976024, Video_Metadata::normalize_frame_rate( '23.976023976024' ) );
		$this->assertSame( 30.0, Video_Metadata::normalize_frame_rate( 30 ) );
		$this->assertSame( 60.0, Video_Metadata::normalize_frame_rate( '60' ) );
	}

	public function test_treats_unusable_values_as_unknown(): void {
		foreach ( array( null, '', 0, '0', -5, 'fast', 240.5, 1000, array() ) as $value ) {
			$this->assertNull( Video_Metadata::normalize_frame_rate( $value ), var_export( $value, true ) );
		}
		$this->assertSame( 240.0, Video_Metadata::normalize_frame_rate( 240 ), '240 fps is the highest accepted' );
	}

	// -----------------------------------------------------------------
	// Cascade: no probe when a source already has it.
	// -----------------------------------------------------------------

	public function test_saved_metadata_supplies_the_frame_rate_without_a_probe(): void {
		$id = $this->video_attachment();
		( new Attachment_Meta( $this->options(), $id ) )->save(
			array(
				'worked'       => true,
				'actualwidth'  => 1920,
				'actualheight' => 1080,
				'codec'        => 'h264',
				'duration'     => 12.5,
				'frame_rate'   => '59.94',
			)
		);
		$ffmpeg = $this->fake_ffmpeg( '  Stream #0:0: Video: h264, yuv420p, 1920x1080, 24 fps, 24 tbr' );

		$metadata = $this->video_metadata( $id, $ffmpeg );

		$this->assertSame( 59.94, $metadata->frame_rate );
		$this->assertFileDoesNotExist( $ffmpeg . '.called', 'a known frame rate must not trigger an FFmpeg run' );
	}

	public function test_wordpress_core_metadata_supplies_the_frame_rate_without_a_probe(): void {
		$id = $this->video_attachment();
		update_post_meta(
			$id,
			'_wp_attachment_metadata',
			array(
				'width'      => 640,
				'height'     => 360,
				'length'     => 30,
				'videocodec' => 'h264',
				'frame_rate' => '23.976',
			)
		);
		$ffmpeg = $this->fake_ffmpeg( '  Stream #0:0: Video: h264, yuv420p, 640x360, 60 fps, 60 tbr' );

		$metadata = $this->video_metadata( $id, $ffmpeg );

		$this->assertSame( 23.976, $metadata->frame_rate );
		$this->assertFileDoesNotExist( $ffmpeg . '.called' );
	}

	// -----------------------------------------------------------------
	// Cascade: a complete record with no frame rate gets a frame-rate-only probe.
	// -----------------------------------------------------------------

	public function test_missing_frame_rate_is_probed_and_saved_without_touching_other_fields(): void {
		$id = $this->video_attachment();
		( new Attachment_Meta( $this->options(), $id ) )->save(
			array(
				'worked'       => true,
				'actualwidth'  => 999,
				'actualheight' => 555,
				'codec'        => 'vp9',
				'duration'     => 12.5,
			)
		);
		// The probe reports a different size on purpose: only the frame rate may be taken from it.
		$ffmpeg = $this->fake_ffmpeg( '  Stream #0:0: Video: h264, yuv420p, 640x360, 25 fps, 25 tbr' );

		$metadata = $this->video_metadata( $id, $ffmpeg );

		$this->assertFileExists( $ffmpeg . '.called' );
		$this->assertSame( 25.0, $metadata->frame_rate );
		$this->assertSame( 999, $metadata->actualwidth );
		$this->assertSame( 555, $metadata->actualheight );
		$this->assertSame( 'vp9', $metadata->codec );
		$this->assertTrue( $metadata->worked );

		$saved = ( new Attachment_Meta( $this->options(), $id ) )->get();
		$this->assertSame( '25', (string) $saved['frame_rate'] );
		$this->assertSame( 999, $saved['actualwidth'] );
		$this->assertSame( 'vp9', $saved['codec'] );
	}

	public function test_a_failed_probe_leaves_complete_metadata_intact(): void {
		$id = $this->video_attachment();
		( new Attachment_Meta( $this->options(), $id ) )->save(
			array(
				'worked'       => true,
				'actualwidth'  => 999,
				'actualheight' => 555,
				'codec'        => 'vp9',
				'duration'     => 12.5,
			)
		);

		$metadata = $this->video_metadata( $id, '/nonexistent/ffmpeg' );

		$this->assertNull( $metadata->frame_rate );
		$this->assertTrue( $metadata->worked, 'losing the probe must not turn a good record into a failed one' );
		$this->assertSame( 999, $metadata->actualwidth );
	}

	public function test_no_probe_is_attempted_without_an_ffmpeg_path(): void {
		$id = $this->video_attachment();
		( new Attachment_Meta( $this->options(), $id ) )->save(
			array(
				'worked'       => true,
				'actualwidth'  => 999,
				'actualheight' => 555,
				'codec'        => 'vp9',
				'duration'     => 12.5,
			)
		);

		$metadata = $this->video_metadata( $id, '' );

		$this->assertNull( $metadata->frame_rate );
		$this->assertTrue( $metadata->worked );
	}

	// -----------------------------------------------------------------
	// Full probe path.
	// -----------------------------------------------------------------

	public function test_a_full_probe_reads_and_saves_the_frame_rate_with_everything_else(): void {
		$id     = $this->video_attachment();
		$ffmpeg = $this->fake_ffmpeg( '  Stream #0:0(und): Video: h264 (High), yuv420p, 1920x1080, 7019 kb/s, 29.97 fps, 29.97 tbr, 30k tbn' );

		$metadata = $this->video_metadata( $id, $ffmpeg );

		$this->assertTrue( $metadata->worked );
		$this->assertSame( 1920, $metadata->actualwidth );
		$this->assertSame( 29.97, $metadata->frame_rate );

		$saved = ( new Attachment_Meta( $this->options(), $id ) )->get();
		$this->assertSame( '29.97', (string) $saved['frame_rate'] );
	}

	public function test_a_full_probe_runs_ffmpeg_only_once(): void {
		$id     = $this->video_attachment();
		$ffmpeg = $this->fake_ffmpeg( '  Stream #0:0: Video: h264, yuv420p, 1280x720, 24 fps, 24 tbr' );

		$metadata = $this->video_metadata( $id, $ffmpeg );
		$this->assertSame( 24.0, $metadata->frame_rate );

		// The saved record is now complete, so a second instance needs no probe at all.
		wp_delete_file( $ffmpeg . '.called' );
		$again = $this->video_metadata( $id, $ffmpeg );

		$this->assertSame( 24.0, $again->frame_rate );
		$this->assertFileDoesNotExist( $ffmpeg . '.called' );
	}
}
