<?php
/**
 * FFmpeg_Thumbnails::rotate_array() and filter_complex() are the two pure,
 * self-contained pieces of FFmpeg command-line construction in this class
 * -- no ffmpeg binary or filesystem access needed to exercise them, unlike
 * process_thumb()/generate_temp_thumbnail()/save()/create_thumbnail_image(),
 * which all shell out or touch the media library. Previously untested
 * despite building the exact -vf/-filter_complex strings that determine
 * whether a rotated or watermarked thumbnail comes out looking right.
 */

use Videopack\Admin\FFmpeg_Thumbnails;
use Videopack\Admin\Formats\Registry;

class FFmpegThumbnailFiltersTest extends WP_UnitTestCase {

	protected function options( array $overrides = array() ): array {
		return array_merge( get_option( 'videopack_options', array() ), $overrides );
	}

	protected function thumbnails( array $options = array() ): FFmpeg_Thumbnails {
		$options = $this->options( $options );
		return new FFmpeg_Thumbnails( $options, new Registry( $options ) );
	}

	// -----------------------------------------------------------------
	// rotate_array()
	// -----------------------------------------------------------------

	public function test_rotate_array_is_empty_for_no_rotation(): void {
		$result = $this->thumbnails()->rotate_array( 0, 640, 360 );

		$this->assertSame( array(), $result['rotate'] );
		$this->assertSame( '', $result['complex'] );
	}

	public function test_rotate_array_treats_false_the_same_as_zero(): void {
		$result = $this->thumbnails()->rotate_array( false, 640, 360 );

		$this->assertSame( array(), $result['rotate'] );
		$this->assertSame( '', $result['complex'] );
	}

	public function test_rotate_array_ignores_an_unrecognized_angle(): void {
		$result = $this->thumbnails()->rotate_array( 45, 640, 360 );

		$this->assertSame( array(), $result['rotate'] );
		$this->assertSame( '', $result['complex'] );
	}

	public function test_rotate_array_casts_width_and_height_to_integers(): void {
		$result = $this->thumbnails()->rotate_array( 0, '640', '360' );

		$this->assertSame( 640, $result['width'] );
		$this->assertSame( 360, $result['height'] );
	}

	public function test_rotate_90_without_a_watermark_uses_a_vf_transpose_and_scales_to_height(): void {
		$result = $this->thumbnails()->rotate_array( 90, 640, 360 );

		$this->assertSame(
			array( '-vf', 'transpose=1,scale=360:-1', '-metadata:s:v:0', 'rotate=0' ),
			$result['rotate']
		);
		$this->assertSame( '', $result['complex'], 'no -filter_complex should be built without a configured watermark' );
	}

	public function test_rotate_90_with_a_watermark_configured_uses_filter_complex_instead(): void {
		$thumbnails = $this->thumbnails( array( 'ffmpeg_thumb_watermark' => array( 'url' => 'https://example.test/logo.png' ) ) );

		$result = $thumbnails->rotate_array( 90, 640, 360 );

		$this->assertSame( 'transpose=1[rotate];[rotate]', $result['complex'] );
		// The -vf branch is skipped entirely -- only the metadata reset remains.
		$this->assertSame( array( '-metadata:s:v:0', 'rotate=0' ), $result['rotate'] );
	}

	public function test_rotate_270_without_a_watermark(): void {
		$result = $this->thumbnails()->rotate_array( 270, 640, 360 );

		$this->assertSame( array( '-vf', 'transpose=2', '-metadata:s:v:0', 'rotate=0' ), $result['rotate'] );
		$this->assertSame( '', $result['complex'] );
	}

	public function test_rotate_270_with_a_watermark_configured(): void {
		$thumbnails = $this->thumbnails( array( 'ffmpeg_thumb_watermark' => array( 'url' => 'https://example.test/logo.png' ) ) );

		$result = $thumbnails->rotate_array( 270, 640, 360 );

		$this->assertSame( 'transpose=2[rotate];[rotate]', $result['complex'] );
		$this->assertSame( array( '-metadata:s:v:0', 'rotate=0' ), $result['rotate'] );
	}

	public function test_rotate_180_without_a_watermark_flips_both_axes(): void {
		$result = $this->thumbnails()->rotate_array( 180, 640, 360 );

		$this->assertSame( array( '-vf', 'hflip,vflip', '-metadata:s:v:0', 'rotate=0' ), $result['rotate'] );
		$this->assertSame( '', $result['complex'] );
	}

	public function test_rotate_180_with_a_watermark_configured(): void {
		$thumbnails = $this->thumbnails( array( 'ffmpeg_thumb_watermark' => array( 'url' => 'https://example.test/logo.png' ) ) );

		$result = $thumbnails->rotate_array( 180, 640, 360 );

		$this->assertSame( 'hflip,vflip[rotate];[rotate]', $result['complex'] );
		$this->assertSame( array( '-metadata:s:v:0', 'rotate=0' ), $result['rotate'] );
	}

	// -----------------------------------------------------------------
	// filter_complex() -- no watermark configured.
	// -----------------------------------------------------------------

	public function test_filter_complex_without_a_watermark_scales_to_the_movie_height(): void {
		$result = $this->thumbnails()->filter_complex( array(), 360, false );

		$this->assertSame( '', $result['input'] );
		$this->assertSame( '[0:v]scale=-2:360', $result['filter'] );
	}

	public function test_filter_complex_without_a_watermark_for_a_thumbnail_preserves_sample_aspect_ratio(): void {
		$result = $this->thumbnails()->filter_complex( array(), 360, true );

		$this->assertSame( '', $result['input'] );
		$this->assertSame( '[0:v]scale=iw*sar:ih', $result['filter'] );
	}

	public function test_filter_complex_treats_false_watermark_as_no_watermark(): void {
		$result = $this->thumbnails()->filter_complex( false, 360, false );

		$this->assertSame( '[0:v]scale=-2:360', $result['filter'] );
	}

	public function test_filter_complex_treats_a_watermark_array_without_a_url_as_no_watermark(): void {
		$result = $this->thumbnails()->filter_complex( array( 'scale' => 20 ), 360, false );

		$this->assertSame( '[0:v]scale=-2:360', $result['filter'] );
	}

	// -----------------------------------------------------------------
	// filter_complex() -- with a watermark configured.
	// -----------------------------------------------------------------

	public function test_filter_complex_with_a_watermark_builds_the_overlay_chain(): void {
		$watermark = array( 'url' => '/var/www/html/wp-content/uploads/logo.png' );

		$result = $this->thumbnails()->filter_complex( $watermark, 360, false );

		$this->assertSame( '/var/www/html/wp-content/uploads/logo.png', $result['input'], 'a non-URL local path is passed through unchanged' );
		$this->assertSame(
			'[1:v]scale=-1:36[watermark];[0:v]scale=-2:360[scaled];[scaled][watermark]overlay=main_w*0:main_h*0',
			$result['filter']
		);
	}

	public function test_filter_complex_with_a_watermark_for_a_thumbnail_uses_the_sar_preserving_scale(): void {
		$watermark = array( 'url' => '/uploads/logo.png' );

		$result = $this->thumbnails()->filter_complex( $watermark, 360, true );

		$this->assertStringContainsString( '[0:v]scale=iw*sar:ih[scaled];', $result['filter'] );
	}

	public function test_filter_complex_default_scale_is_10_percent_of_movie_height(): void {
		$watermark = array( 'url' => '/uploads/logo.png' );

		$result = $this->thumbnails()->filter_complex( $watermark, 360, false );

		// 10% of 360 = 36.
		$this->assertStringContainsString( '[1:v]scale=-1:36[watermark]', $result['filter'] );
	}

	public function test_filter_complex_custom_scale_is_honored(): void {
		$watermark = array(
			'url'   => '/uploads/logo.png',
			'scale' => 25,
		);

		$result = $this->thumbnails()->filter_complex( $watermark, 360, false );

		// 25% of 360 = 90.
		$this->assertStringContainsString( '[1:v]scale=-1:90[watermark]', $result['filter'] );
	}

	public function test_filter_complex_align_right_and_valign_bottom(): void {
		$watermark = array(
			'url'    => '/uploads/logo.png',
			'align'  => 'right',
			'valign' => 'bottom',
		);

		$result = $this->thumbnails()->filter_complex( $watermark, 360, false );

		$this->assertStringContainsString( 'overlay=main_w-overlay_w-main_w*0:main_h-overlay_h-main_h*0', $result['filter'] );
	}

	public function test_filter_complex_align_center_and_valign_center(): void {
		$watermark = array(
			'url'    => '/uploads/logo.png',
			'align'  => 'center',
			'valign' => 'center',
		);

		$result = $this->thumbnails()->filter_complex( $watermark, 360, false );

		$this->assertStringContainsString( 'overlay=main_w/2-overlay_w/2-main_w*0:main_h/2-overlay_h/2-main_h*0', $result['filter'] );
	}

	public function test_filter_complex_x_and_y_offsets_are_rounded_to_four_decimals(): void {
		$watermark = array(
			'url' => '/uploads/logo.png',
			'x'   => 33.333333,
			'y'   => 12.5,
		);

		$result = $this->thumbnails()->filter_complex( $watermark, 360, false );

		$this->assertStringContainsString( 'main_w*0.3333:', $result['filter'] );
		$this->assertStringContainsString( 'main_h*0.125', $result['filter'] );
	}

	/**
	 * When the configured watermark "url" is a real, resolvable URL that
	 * maps back to a local media library attachment, filter_complex()
	 * substitutes the attachment's direct file path -- avoiding a redundant
	 * network fetch of the plugin's own site's own file for something
	 * ffmpeg needs local disk access to anyway.
	 */
	public function test_filter_complex_resolves_a_local_attachment_url_to_its_file_path(): void {
		$file          = dirname( __DIR__ ) . '/src/images/Adobestock_287460179_thumb1.jpg';
		$attachment_id = self::factory()->attachment->create_upload_object( $file );
		$url           = wp_get_attachment_url( $attachment_id );
		$local_path    = get_attached_file( $attachment_id );

		$result = $this->thumbnails()->filter_complex( array( 'url' => $url ), 360, false );

		$this->assertSame( $local_path, $result['input'] );
	}

	/**
	 * The converse: a URL that looks like a real URL but doesn't resolve to
	 * any local attachment is passed through unchanged, rather than being
	 * silently dropped or erroring.
	 */
	public function test_filter_complex_leaves_an_unresolvable_url_unchanged(): void {
		$url = 'https://example.test/does-not-exist-in-the-media-library.png';

		$result = $this->thumbnails()->filter_complex( array( 'url' => $url ), 360, false );

		$this->assertSame( $url, $result['input'] );
	}
}
