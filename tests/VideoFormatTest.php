<?php
/**
 * Tests for Video_Format -- a codec+resolution pairing that derives its
 * own id/name/legacy-filename info from the two objects it wraps.
 * Previously completely untested. Codec and resolution objects are built
 * directly here (not via Registry) so each behavior can be tested in
 * isolation from the current real codec/resolution list.
 */

use Videopack\Admin\Formats\Video_Format;
use Videopack\Admin\Formats\Video_Resolution;
use Videopack\Admin\Formats\Codecs\Video_Codec;

class VideoFormatTest extends WP_UnitTestCase {

	protected function codec( array $overrides = array() ): Video_Codec {
		return new Video_Codec(
			array_merge(
				array(
					'id'        => 'h264',
					'name'      => 'H.264 MP4',
					'label'     => 'H.264',
					'container' => 'mp4',
				),
				$overrides
			)
		);
	}

	protected function resolution( array $overrides = array() ): Video_Resolution {
		return new Video_Resolution(
			array_merge(
				array(
					'height'         => 1080,
					'name'           => 'Full HD (1080p)',
					'default_encode' => true,
				),
				$overrides
			)
		);
	}

	// -----------------------------------------------------------------
	// get_id() / get_suffix()
	// -----------------------------------------------------------------

	public function test_id_combines_codec_and_resolution_ids(): void {
		$format = new Video_Format( $this->codec( array( 'id' => 'h264' ) ), $this->resolution( array( 'id' => '1080' ) ) );

		$this->assertSame( 'h264_1080', $format->get_id() );
	}

	public function test_suffix_combines_id_and_container(): void {
		$format = new Video_Format( $this->codec( array( 'id' => 'h264', 'container' => 'mp4' ) ), $this->resolution( array( 'id' => '1080' ) ) );

		$this->assertSame( '-h264_1080.mp4', $format->get_suffix() );
	}

	public function test_suffix_is_filterable(): void {
		add_filter(
			'videopack_video_format_suffix',
			static function () {
				return '-custom-suffix.mp4';
			}
		);

		$format = new Video_Format( $this->codec(), $this->resolution() );
		$suffix = $format->get_suffix();

		remove_all_filters( 'videopack_video_format_suffix' );

		$this->assertSame( '-custom-suffix.mp4', $suffix );
	}

	// -----------------------------------------------------------------
	// get_name() / get_short_name() -- combine codec+resolution naming,
	// wrap in "Replace original (...)" when replaces_original is true,
	// and are overridden entirely by an explicit label.
	// -----------------------------------------------------------------

	public function test_name_combines_codec_and_resolution_names(): void {
		$format = new Video_Format(
			$this->codec( array( 'name' => 'H.264 MP4' ) ),
			$this->resolution( array( 'name' => 'Full HD (1080p)' ) )
		);

		$this->assertSame( 'H.264 MP4 Full HD (1080p)', $format->get_name() );
	}

	public function test_short_name_combines_codec_and_resolution_labels(): void {
		$format = new Video_Format(
			$this->codec( array( 'label' => 'H.264' ) ),
			$this->resolution( array( 'label' => '1080p' ) )
		);

		$this->assertSame( 'H.264 1080p', $format->get_short_name() );
	}

	public function test_replaces_original_wraps_the_name(): void {
		$format = new Video_Format(
			$this->codec( array( 'name' => 'H.264 MP4' ) ),
			$this->resolution( array( 'name' => 'Full HD (1080p)' ) ),
			true,
			true
		);

		$this->assertSame( 'Replace original (H.264 MP4 Full HD (1080p))', $format->get_name() );
	}

	public function test_an_explicit_label_overrides_the_derived_name_entirely(): void {
		$format = new Video_Format( $this->codec(), $this->resolution(), true, true );
		$format->set_label( 'Custom Format Label' );

		$this->assertSame( 'Custom Format Label', $format->get_name() );
		$this->assertSame( 'Custom Format Label', $format->get_short_name() );
	}

	public function test_label_getter_returns_the_resolution_label_by_default(): void {
		$format = new Video_Format( $this->codec(), $this->resolution( array( 'label' => '1080p' ) ) );

		$this->assertSame( '1080p', $format->get_label() );
	}

	// -----------------------------------------------------------------
	// get_legacy_id() / get_legacy_suffix() -- mapping to the id/suffix
	// scheme used by Videopack v4, per codec.
	// -----------------------------------------------------------------

	public function test_h264_360p_legacy_id_is_mobile(): void {
		$format = new Video_Format( $this->codec( array( 'id' => 'h264' ) ), $this->resolution( array( 'height' => 360, 'id' => '360' ) ) );

		$this->assertSame( 'mobile', $format->get_legacy_id() );
	}

	public function test_h264_other_heights_legacy_id_is_the_resolution_id(): void {
		$format = new Video_Format( $this->codec( array( 'id' => 'h264' ) ), $this->resolution( array( 'height' => 720, 'id' => '720' ) ) );

		$this->assertSame( '720', $format->get_legacy_id() );
	}

	public function test_h264_legacy_suffix_is_dash_id_dot_mp4(): void {
		$format = new Video_Format( $this->codec( array( 'id' => 'h264' ) ), $this->resolution( array( 'id' => '720' ) ) );

		$this->assertSame( '-720.mp4', $format->get_legacy_suffix() );
	}

	public function test_vp8_legacy_id_and_suffix_are_webm(): void {
		$format = new Video_Format( $this->codec( array( 'id' => 'vp8' ) ), $this->resolution() );

		$this->assertSame( 'webm', $format->get_legacy_id() );
		$this->assertSame( '.webm', $format->get_legacy_suffix() );
	}

	public function test_vp9_legacy_id_is_false_but_suffix_is_distinct(): void {
		$format = new Video_Format( $this->codec( array( 'id' => 'vp9' ) ), $this->resolution() );

		$this->assertFalse( $format->get_legacy_id() );
		$this->assertSame( '-vp9.webm', $format->get_legacy_suffix() );
	}

	/**
	 * 'ogv' isn't among the codecs Registry::get_video_codecs() actually
	 * registers today (Ogg Theora output was dropped from the encoder
	 * list), so no real Video_Format from the registry can hit this
	 * branch -- 'ogv' only survives elsewhere as a normalized *source*
	 * codec identifier (see Encode_Attachment's theora->ogv mapping). This
	 * exercises the method's own logic directly with a synthetic codec, in
	 * case Ogg support (or migrating an old v4 site) ever needs it again.
	 */
	public function test_ogv_legacy_id_and_suffix(): void {
		$format = new Video_Format( $this->codec( array( 'id' => 'ogv' ) ), $this->resolution() );

		$this->assertSame( 'ogg', $format->get_legacy_id() );
		$this->assertSame( '.ogv', $format->get_legacy_suffix() );
	}

	public function test_unrecognized_codec_has_no_legacy_id_or_suffix(): void {
		$format = new Video_Format( $this->codec( array( 'id' => 'av1' ) ), $this->resolution() );

		$this->assertFalse( $format->get_legacy_id() );
		$this->assertFalse( $format->get_legacy_suffix() );
	}

	// -----------------------------------------------------------------
	// Simple accessors and to_array().
	// -----------------------------------------------------------------

	public function test_replaces_original_getter_and_setter(): void {
		$format = new Video_Format( $this->codec(), $this->resolution(), true, false );

		$this->assertFalse( $format->get_replaces_original() );

		$format->set_replaces_original( true );

		$this->assertTrue( $format->get_replaces_original() );
	}

	public function test_is_enabled_reflects_the_constructor_argument(): void {
		$enabled_format  = new Video_Format( $this->codec(), $this->resolution(), true );
		$disabled_format = new Video_Format( $this->codec(), $this->resolution(), false );

		$this->assertTrue( $enabled_format->is_enabled() );
		$this->assertFalse( $disabled_format->is_enabled() );
	}

	public function test_to_array_includes_the_formats_own_derived_fields(): void {
		$format = new Video_Format( $this->codec( array( 'id' => 'h264' ) ), $this->resolution( array( 'id' => '1080' ) ), true, false );

		$array = $format->to_array();

		$this->assertSame( 'h264_1080', $array['id'] );
		$this->assertSame( $format->get_name(), $array['name'] );
		$this->assertSame( $format->get_suffix(), $array['suffix'] );
		$this->assertSame( 'h264', $array['codec']['id'] );
		$this->assertSame( 1080, $array['resolution']['height'] );
		$this->assertTrue( $array['enabled'] );
	}
}
