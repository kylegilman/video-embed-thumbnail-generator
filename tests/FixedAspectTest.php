<?php
/**
 * The fixed_aspect setting ("None", "All", "Vertical Videos") and the
 * video-dimension handling it depends on.
 *
 * Previously get_final_atts() decided "portrait" by comparing the resolved
 * height against the resolved width, a pair that could mix a requested width
 * with the video's native height -- so a landscape 4:3 video requested at
 * width="640" was treated as portrait, and a portrait one requested wider
 * than its height wasn't. It also overwrote an explicit height, never
 * matched the string "true" ("All"), and used the stored (encoded)
 * width/height, which are reversed for the common phone-video case of a
 * landscape file carrying 90/270 degree rotation metadata.
 *
 * Rotation is only known when FFmpeg read it, so these tests build their
 * fixtures with an explicit stored rotation, and one test documents what
 * happens when none is known.
 */

use Videopack\Admin\Attachment_Meta;
use Videopack\Admin\Formats\Registry;
use Videopack\Frontend\Metadata;
use Videopack\Frontend\Shortcode;
use Videopack\Video_Source\Source_Factory;

class FixedAspectTest extends WP_UnitTestCase {

	protected function options( array $overrides = array() ): array {
		return array_merge( get_option( 'videopack_options', array() ), $overrides );
	}

	/**
	 * A video attachment with the given stored (encoded) size and rotation.
	 * codec/frame_rate are saved too so Attachment_Meta doesn't try to
	 * re-probe the nonexistent file and overwrite them.
	 *
	 * @param int      $width  Stored width.
	 * @param int      $height Stored height.
	 * @param int|null $rotate Stored rotation in degrees, or null if unknown.
	 */
	protected function video( int $width, int $height, ?int $rotate = null ): int {
		$id = self::factory()->attachment->create_object(
			array(
				'file'           => 'x.mp4',
				'post_mime_type' => 'video/mp4',
				'post_status'    => 'inherit',
			)
		);
		( new Attachment_Meta( $this->options(), $id ) )->save(
			array(
				'actualwidth'  => $width,
				'actualheight' => $height,
				'rotate'       => $rotate,
				'codec'        => 'h264',
				'frame_rate'   => '30',
				'worked'       => true,
			)
		);
		return $id;
	}

	/**
	 * Like video(), but backed by a real file so Source::exists() is true, as
	 * Open Graph discovery requires. The stored dimensions and rotation then
	 * replace whatever probing found for the real file.
	 */
	protected function real_video( int $width, int $height, ?int $rotate = null ): int {
		$id = self::factory()->attachment->create_upload_object( dirname( __DIR__ ) . '/src/images/Adobestock_287460179.mp4' );
		( new Attachment_Meta( $this->options(), $id ) )->save(
			array(
				'actualwidth'  => $width,
				'actualheight' => $height,
				'rotate'       => $rotate,
			)
		);
		return $id;
	}
	protected function source( int $id ) {
		$options = $this->options();
		return Source_Factory::create( $id, $options, new Registry( $options ) );
	}

	/**
	 * Resolved width and height for a video, with fixed_aspect passed in the
	 * attributes (explicit attributes always beat any option-derived default).
	 *
	 * @return array{0: int, 1: int}
	 */
	protected function final_size( int $id, array $atts = array() ): array {
		$options = $this->options();
		$final   = ( new Shortcode( $options, new Registry( $options ) ) )->get_final_atts( array_merge( array( 'id' => $id ), $atts ), $this->source( $id ) );
		return array( (int) $final['width'], (int) $final['height'] );
	}

	// -----------------------------------------------------------------
	// Source: display dimensions and rotation.
	// -----------------------------------------------------------------

	public function test_source_swaps_dimensions_for_90_and_270_rotation(): void {
		foreach ( array( 90, 270 ) as $rotate ) {
			$source = $this->source( $this->video( 1920, 1080, $rotate ) );

			$this->assertTrue( $source->has_swapped_dimensions(), "rotate={$rotate}" );
			$this->assertSame( 1080, $source->get_display_width(), "rotate={$rotate}" );
			$this->assertSame( 1920, $source->get_display_height(), "rotate={$rotate}" );
		}
	}

	public function test_source_does_not_swap_dimensions_for_0_180_or_unknown_rotation(): void {
		foreach ( array( null, 0, 180 ) as $rotate ) {
			$source = $this->source( $this->video( 1920, 1080, $rotate ) );

			$this->assertFalse( $source->has_swapped_dimensions(), 'rotate=' . var_export( $rotate, true ) );
			$this->assertSame( 1920, $source->get_display_width() );
			$this->assertSame( 1080, $source->get_display_height() );
		}
	}

	public function test_resolve_display_dimensions_uses_both_when_both_are_requested(): void {
		$source = $this->source( $this->video( 1920, 1080 ) );

		$this->assertSame( array( 'width' => 500, 'height' => 700 ), $source->resolve_display_dimensions( 500, 700 ) );
	}

	public function test_resolve_display_dimensions_keeps_the_videos_ratio_when_only_one_is_requested(): void {
		$source = $this->source( $this->video( 1920, 1440 ) ); // 4:3.

		$this->assertSame( array( 'width' => 640, 'height' => 480 ), $source->resolve_display_dimensions( 640, 0 ) );
		$this->assertSame( array( 'width' => 800, 'height' => 600 ), $source->resolve_display_dimensions( 0, 600 ) );
	}

	public function test_resolve_display_dimensions_uses_the_display_size_when_none_requested(): void {
		$source = $this->source( $this->video( 1920, 1080, 90 ) );

		$this->assertSame( array( 'width' => 1080, 'height' => 1920 ), $source->resolve_display_dimensions() );
	}

	public function test_resolve_display_dimensions_reports_zero_when_the_video_size_is_unknown(): void {
		$options = $this->options();
		$source  = Source_Factory::create( 'https://example.test/remote.mp4', $options, new Registry( $options ) );

		$this->assertSame( array( 'width' => 640, 'height' => 0 ), $source->resolve_display_dimensions( 640, 0 ) );
		$this->assertSame( array( 'width' => 0, 'height' => 360 ), $source->resolve_display_dimensions( 0, 360 ) );
	}

	// -----------------------------------------------------------------
	// A requested width alone no longer gets the unscaled native height.
	// -----------------------------------------------------------------

	public function test_a_requested_width_alone_follows_the_videos_aspect_ratio(): void {
		$id = $this->video( 1920, 1440 ); // 4:3.

		$this->assertSame( array( 640, 480 ), $this->final_size( $id, array( 'width' => 640, 'fixed_aspect' => 'false' ) ) );
	}

	// -----------------------------------------------------------------
	// "Vertical Videos".
	// -----------------------------------------------------------------

	public function test_vertical_leaves_a_landscape_video_alone_even_when_the_requested_width_is_below_its_native_height(): void {
		$id = $this->video( 1920, 1440 ); // 4:3 landscape: native height 1440 > requested width 640.

		$this->assertSame( array( 640, 480 ), $this->final_size( $id, array( 'width' => 640, 'fixed_aspect' => 'vertical' ) ) );
	}

	public function test_vertical_frames_a_portrait_video_in_the_default_ratio(): void {
		$id = $this->video( 1080, 1920 );

		// The default ratio is 960:540, so 1080 wide gets 607.5 -> 608 tall.
		$this->assertSame( array( 1080, 608 ), $this->final_size( $id, array( 'fixed_aspect' => 'vertical' ) ) );
	}

	public function test_vertical_frames_a_portrait_video_even_when_the_requested_width_exceeds_its_height(): void {
		$id = $this->video( 1080, 1920 );

		$this->assertSame( array( 2000, 1125 ), $this->final_size( $id, array( 'width' => 2000, 'fixed_aspect' => 'vertical' ) ) );
	}

	public function test_vertical_treats_a_landscape_file_with_90_degree_rotation_as_portrait(): void {
		$id = $this->video( 1920, 1080, 90 ); // Stored landscape, plays portrait.

		$this->assertSame( array( 1080, 608 ), $this->final_size( $id, array( 'fixed_aspect' => 'vertical' ) ) );
	}

	/**
	 * Documents the limit rather than endorsing it: with no rotation known
	 * (FFmpeg never read it) a landscape-stored portrait video can't be
	 * recognized here. The player JS, which sees the decoded video, is what
	 * actually applies "vertical" in that case.
	 */
	public function test_vertical_cannot_detect_rotation_that_was_never_read(): void {
		$id = $this->video( 1920, 1080, null );

		$this->assertSame( array( 1920, 1080 ), $this->final_size( $id, array( 'fixed_aspect' => 'vertical' ) ) );
	}

	public function test_vertical_never_overrides_an_explicit_height(): void {
		$id = $this->video( 1080, 1920 );

		$this->assertSame( array( 640, 900 ), $this->final_size( $id, array( 'width' => 640, 'height' => 900, 'fixed_aspect' => 'vertical' ) ) );
	}

	// -----------------------------------------------------------------
	// "All".
	// -----------------------------------------------------------------

	public function test_all_forces_the_default_ratio_on_a_landscape_video_that_has_another_ratio(): void {
		$id = $this->video( 1920, 1440 ); // 4:3.

		$this->assertSame( array( 1920, 1080 ), $this->final_size( $id, array( 'fixed_aspect' => 'true' ) ) );
		$this->assertSame( array( 640, 360 ), $this->final_size( $id, array( 'width' => 640, 'fixed_aspect' => 'true' ) ) );
	}

	public function test_all_also_accepts_a_real_boolean_true(): void {
		$id = $this->video( 1920, 1440 );

		$this->assertSame( array( 1920, 1080 ), $this->final_size( $id, array( 'fixed_aspect' => true ) ) );
	}

	public function test_all_never_overrides_an_explicit_height(): void {
		$id = $this->video( 1920, 1440 );

		$this->assertSame( array( 640, 800 ), $this->final_size( $id, array( 'width' => 640, 'height' => 800, 'fixed_aspect' => 'true' ) ) );
	}

	// -----------------------------------------------------------------
	// "None".
	// -----------------------------------------------------------------

	public function test_none_leaves_every_orientation_untouched(): void {
		$this->assertSame( array( 1080, 1920 ), $this->final_size( $this->video( 1080, 1920 ), array( 'fixed_aspect' => 'false' ) ) );
		$this->assertSame( array( 1920, 1440 ), $this->final_size( $this->video( 1920, 1440 ), array( 'fixed_aspect' => 'false' ) ) );
	}

	// -----------------------------------------------------------------
	// Open Graph reports the real video size, not the fixed-aspect box.
	// -----------------------------------------------------------------

	public function test_open_graph_reports_the_real_video_size_not_the_fixed_aspect_box(): void {
		$id   = $this->real_video( 1920, 1080, 90 ); // Plays as 1080x1920.
		$post = self::factory()->post->create_and_get( array( 'post_content' => '[videopack id="' . $id . '" fixed_aspect="vertical"]' ) );

		$video = ( new Metadata( $this->options() ) )->get_first_embedded_video( $post );

		$this->assertSame( 1080, (int) $video['width'] );
		$this->assertSame( 1920, (int) $video['height'], 'the player box would be 1080x608, but og:video:height is the video itself' );
	}

	public function test_open_graph_tags_carry_the_real_video_size(): void {
		$id   = $this->real_video( 1080, 1920 );
		$post = self::factory()->post->create_and_get( array( 'post_content' => '[videopack id="' . $id . '"]' ) );
		$GLOBALS['post'] = $post;

		ob_start();
		( new Metadata( $this->options( array( 'open_graph' => true ) ) ) )->print_scripts();
		$html = ob_get_clean();

		$this->assertStringContainsString( 'property="og:video:width" content="1080"', $html );
		$this->assertStringContainsString( 'property="og:video:height" content="1920"', $html );
	}
}
