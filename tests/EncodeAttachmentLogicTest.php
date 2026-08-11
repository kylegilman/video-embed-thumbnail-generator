<?php
/**
 * Tests for Encode_Attachment's pure decision-logic methods -- whether an
 * encode is unnecessary (upscale/same-codec-same-resolution), which format
 * ID a "replace original" setting resolves to, output dimension
 * calculation, and the already-queued/can-queue lookups. None of these
 * touch the filesystem or shell out to FFmpeg: metadata is short-circuited
 * via WP's own `_wp_attachment_metadata`, which `Video_Metadata` reads
 * before ever falling back to a real `ffmpeg -i` call.
 */

use Videopack\Admin\Encode\Encode_Attachment;
use Videopack\Admin\Encode\Encode_Queue_Controller;
use Videopack\Admin\Formats\Registry;
use Videopack\Admin\Formats\Video_Format;

class EncodeAttachmentLogicTest extends WP_UnitTestCase {

	protected function options( array $overrides = array() ): array {
		return array_merge( get_option( 'videopack_options', array() ), $overrides );
	}

	public function set_up() {
		parent::set_up();
		( new Encode_Queue_Controller( $this->options() ) )->add_table();
	}

	/**
	 * Creates a video attachment and seeds WP's own attachment metadata so
	 * Video_Metadata::set_video_metadata() resolves 'worked' from postmeta
	 * without ever invoking FFmpeg.
	 */
	protected function attachment_with_metadata( int $width, int $height, string $codec = 'h264', float $length = 60.0 ): int {
		$attachment_id = self::factory()->attachment->create_object(
			array(
				'file'           => 'video.mp4',
				'post_mime_type' => 'video/mp4',
			)
		);
		update_post_meta(
			$attachment_id,
			'_wp_attachment_metadata',
			array(
				'width'      => $width,
				'height'     => $height,
				'length'     => $length,
				'videocodec' => $codec,
			)
		);
		return $attachment_id;
	}

	protected function encoder( int $attachment_id, array $options = array() ): Encode_Attachment {
		$options  = $this->options( $options );
		$registry = new Registry( $options );
		return new Encode_Attachment( $options, $registry, $attachment_id );
	}

	protected function video_format( Registry $registry, string $codec_id, string $res_id, bool $replaces_original = false ): Video_Format {
		return new Video_Format( $registry->get_codec( $codec_id ), $registry->get_resolution( $res_id ), true, $replaces_original );
	}

	protected function call_is_unnecessary_encode( Encode_Attachment $encoder, Video_Format $format ): bool {
		$method = new ReflectionMethod( Encode_Attachment::class, 'is_unnecessary_encode' );
		$method->setAccessible( true );
		return (bool) $method->invoke( $encoder, $format );
	}

	// -----------------------------------------------------------------
	// is_unnecessary_encode()
	// -----------------------------------------------------------------

	public function test_downscale_is_not_unnecessary(): void {
		$attachment_id = $this->attachment_with_metadata( 1920, 1080, 'h264' );
		$encoder       = $this->encoder( $attachment_id );
		$registry      = $encoder->get_format_registry();

		$this->assertFalse( $this->call_is_unnecessary_encode( $encoder, $this->video_format( $registry, 'h264', '720' ) ) );
	}

	public function test_upscale_without_allow_upscale_is_unnecessary(): void {
		$attachment_id = $this->attachment_with_metadata( 1280, 720, 'h264' );
		$encoder       = $this->encoder( $attachment_id );
		$registry      = $encoder->get_format_registry();

		$this->assertTrue( $this->call_is_unnecessary_encode( $encoder, $this->video_format( $registry, 'h264', '1080' ) ) );
	}

	public function test_upscale_with_allow_upscale_is_not_unnecessary(): void {
		$attachment_id = $this->attachment_with_metadata( 1280, 720, 'h264' );
		$encoder       = $this->encoder( $attachment_id, array( 'allow_upscale' => true ) );
		$registry      = $encoder->get_format_registry();

		$this->assertFalse( $this->call_is_unnecessary_encode( $encoder, $this->video_format( $registry, 'h264', '1080' ) ) );
	}

	public function test_same_resolution_and_codec_is_unnecessary(): void {
		$attachment_id = $this->attachment_with_metadata( 1920, 1080, 'h264' );
		$encoder       = $this->encoder( $attachment_id );
		$registry      = $encoder->get_format_registry();

		$this->assertTrue( $this->call_is_unnecessary_encode( $encoder, $this->video_format( $registry, 'h264', '1080' ) ) );
	}

	public function test_same_resolution_different_codec_is_not_unnecessary(): void {
		$attachment_id = $this->attachment_with_metadata( 1920, 1080, 'h264' );
		$encoder       = $this->encoder( $attachment_id );
		$registry      = $encoder->get_format_registry();

		$this->assertFalse( $this->call_is_unnecessary_encode( $encoder, $this->video_format( $registry, 'h265', '1080' ) ) );
	}

	public function test_replaces_original_format_is_never_unnecessary_even_if_an_upscale(): void {
		$attachment_id = $this->attachment_with_metadata( 1280, 720, 'h264' );
		$encoder       = $this->encoder( $attachment_id );
		$registry      = $encoder->get_format_registry();

		$this->assertFalse( $this->call_is_unnecessary_encode( $encoder, $this->video_format( $registry, 'h264', '1080', true ) ) );
	}

	public function test_metadata_that_never_resolved_defaults_to_not_unnecessary(): void {
		// No metadata seeded at all -- Video_Metadata will fail to resolve
		// 'worked' from postmeta and (having no real file) fall through to
		// worked = false, without ever needing a real FFmpeg binary.
		$attachment_id = self::factory()->attachment->create_object(
			array(
				'file'           => 'video.mp4',
				'post_mime_type' => 'video/mp4',
			)
		);
		$encoder  = $this->encoder( $attachment_id );
		$registry = $encoder->get_format_registry();

		$this->assertFalse( $this->call_is_unnecessary_encode( $encoder, $this->video_format( $registry, 'h264', '1080' ) ) );
	}

	// -----------------------------------------------------------------
	// get_ideal_replacement_id()
	// -----------------------------------------------------------------

	public function test_get_ideal_replacement_id_returns_null_when_replace_format_is_none(): void {
		$attachment_id = $this->attachment_with_metadata( 1920, 1080, 'h264' );
		$encoder       = $this->encoder( $attachment_id, array( 'replace_format' => 'none' ) );

		$this->assertNull( $encoder->get_ideal_replacement_id() );
	}

	public function test_get_ideal_replacement_id_resolves_same_prefixed_setting_using_source_codec(): void {
		$attachment_id = $this->attachment_with_metadata( 1920, 1080, 'h264' );
		$encoder       = $this->encoder( $attachment_id, array( 'replace_format' => 'same_1080' ) );

		$this->assertSame( 'h264_1080', $encoder->get_ideal_replacement_id() );
	}

	public function test_get_ideal_replacement_id_normalizes_source_codec_name(): void {
		// hevc is FFmpeg's own name for h265 -- get_ideal_replacement_id()
		// must normalize it before building the format ID.
		$attachment_id = $this->attachment_with_metadata( 1920, 1080, 'hevc' );
		$encoder       = $this->encoder( $attachment_id, array( 'replace_format' => 'same_1080' ) );

		$this->assertSame( 'h265_1080', $encoder->get_ideal_replacement_id() );
	}

	public function test_get_ideal_replacement_id_same_fullres_short_circuits_before_upscale_check(): void {
		$attachment_id = $this->attachment_with_metadata( 640, 360, 'h264' );
		$encoder       = $this->encoder( $attachment_id, array( 'replace_format' => 'same_fullres' ) );

		$this->assertSame( 'h264_fullres', $encoder->get_ideal_replacement_id() );
	}

	public function test_get_ideal_replacement_id_falls_back_to_fullres_when_setting_would_upscale(): void {
		$attachment_id = $this->attachment_with_metadata( 1280, 720, 'h264' );
		$encoder       = $this->encoder( $attachment_id, array( 'replace_format' => 'h264_1080' ) );

		$this->assertSame( 'h264_fullres', $encoder->get_ideal_replacement_id() );
	}

	public function test_get_ideal_replacement_id_uses_setting_directly_when_not_an_upscale(): void {
		$attachment_id = $this->attachment_with_metadata( 1920, 1080, 'h264' );
		$encoder       = $this->encoder( $attachment_id, array( 'replace_format' => 'h264_720' ) );

		$this->assertSame( 'h264_720', $encoder->get_ideal_replacement_id() );
	}

	public function test_get_ideal_replacement_id_returns_null_for_unresolvable_setting(): void {
		$attachment_id = $this->attachment_with_metadata( 1920, 1080, 'h264' );
		$encoder       = $this->encoder( $attachment_id, array( 'replace_format' => 'not_a_real_format_id' ) );

		$this->assertNull( $encoder->get_ideal_replacement_id() );
	}

	// -----------------------------------------------------------------
	// get_encode_dimensions()
	// -----------------------------------------------------------------

	public function test_get_encode_dimensions_bounds_to_target_resolution_16x9(): void {
		$attachment_id = $this->attachment_with_metadata( 1920, 1080, 'h264' );
		$encoder       = $this->encoder( $attachment_id );

		$format_obj    = new \Videopack\Admin\Encode\Encode_Format( 'h264_720' );
		$result_format = $encoder->get_encode_dimensions( $format_obj );

		$this->assertSame( 1280, $result_format->get_encode_width() );
		$this->assertSame( 720, $result_format->get_encode_height() );
	}

	public function test_get_encode_dimensions_preserves_source_aspect_ratio_when_not_16x9(): void {
		$attachment_id = $this->attachment_with_metadata( 1000, 1000, 'h264' ); // 1:1.
		$encoder       = $this->encoder( $attachment_id );

		$format_obj    = new \Videopack\Admin\Encode\Encode_Format( 'h264_720' );
		$result_format = $encoder->get_encode_dimensions( $format_obj );

		// A 1:1 source is narrower than the 16:9 box's max width at this
		// target height, so the target height itself is what bounds it,
		// scaled down keeping the source's own 1:1 ratio -- not 1280x720.
		$this->assertSame( 720, $result_format->get_encode_width() );
		$this->assertSame( 720, $result_format->get_encode_height() );
	}

	public function test_get_encode_dimensions_defaults_when_metadata_never_resolved(): void {
		$attachment_id = self::factory()->attachment->create_object(
			array(
				'file'           => 'video.mp4',
				'post_mime_type' => 'video/mp4',
			)
		);
		$encoder = $this->encoder( $attachment_id );

		$format_obj    = new \Videopack\Admin\Encode\Encode_Format( 'h264_720' );
		$result_format = $encoder->get_encode_dimensions( $format_obj );

		$this->assertSame( 640, $result_format->get_encode_width() );
		$this->assertSame( 360, $result_format->get_encode_height() );
	}

	// -----------------------------------------------------------------
	// already_queued()
	// -----------------------------------------------------------------

	public function test_already_queued_returns_false_when_nothing_is_queued(): void {
		$attachment_id = $this->attachment_with_metadata( 1920, 1080, 'h264' );
		$encoder       = $this->encoder( $attachment_id );

		$this->assertFalse( $encoder->already_queued( 'h264_720' ) );
	}

	public function test_already_queued_returns_the_matching_format_for_a_queued_job(): void {
		global $wpdb;
		$attachment_id = $this->attachment_with_metadata( 1920, 1080, 'h264' );

		$wpdb->insert(
			$wpdb->prefix . 'videopack_encoding_queue',
			array(
				'blog_id'       => get_current_blog_id(),
				'attachment_id' => $attachment_id,
				'input_url'     => 'https://example.com/video.mp4',
				'format_id'     => 'h264_720',
				'status'        => 'queued',
				'user_id'       => 0,
			)
		);

		$encoder = $this->encoder( $attachment_id );

		$result = $encoder->already_queued( 'h264_720' );
		$this->assertNotFalse( $result );
		$this->assertSame( 'h264_720', $result->get_format_id() );
	}

	public function test_already_queued_returns_false_for_a_different_format_id(): void {
		global $wpdb;
		$attachment_id = $this->attachment_with_metadata( 1920, 1080, 'h264' );

		$wpdb->insert(
			$wpdb->prefix . 'videopack_encoding_queue',
			array(
				'blog_id'       => get_current_blog_id(),
				'attachment_id' => $attachment_id,
				'input_url'     => 'https://example.com/video.mp4',
				'format_id'     => 'h264_720',
				'status'        => 'queued',
				'user_id'       => 0,
			)
		);

		$encoder = $this->encoder( $attachment_id );

		$this->assertFalse( $encoder->already_queued( 'h264_1080' ) );
	}

	// -----------------------------------------------------------------
	// check_if_can_queue() -- branches reachable without a real FFmpeg
	// codec probe (the vcodec/acodec-availability branches require a real
	// `ffmpeg -codecs` call and aren't covered here).
	// -----------------------------------------------------------------

	public function test_check_if_can_queue_rejects_unknown_format_id(): void {
		$attachment_id = $this->attachment_with_metadata( 1920, 1080, 'h264' );
		$encoder       = $this->encoder( $attachment_id );

		$this->assertSame( 'error_invalid_format_key', $encoder->check_if_can_queue( 'not_a_real_format_id' ) );
	}

	public function test_check_if_can_queue_reports_lowres_for_an_upscale(): void {
		$attachment_id = $this->attachment_with_metadata( 640, 360, 'h264' );
		$encoder       = $this->encoder( $attachment_id );

		$this->assertSame( 'lowres', $encoder->check_if_can_queue( 'h264_1080' ) );
	}
}
