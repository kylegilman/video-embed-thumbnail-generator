<?php
/**
 * Tests for the QuickTime/Matroska/HLS/DASH codec restoration
 * (Video_Codec_Mov/Mkv/Hls/Dash) -- the same class of fix as Ogg Theora
 * (see VideoCodecOgvTest): Videopack 4.10 recognized .mov/.mkv/.m3u8/.mpd
 * as embeddable master video formats (Source::set_compatible() already
 * lists them), but the 5.0 rewrite's codec-object model silently dropped
 * every one of them from the player -- Player::set_sources() requires
 * get_codec() to return something, and none of the registered codecs
 * matched their mime types. None of these were ever v4 encode *targets*
 * (only h264/vp8/ogv were, per Video_Format::get_legacy_id()), so unlike
 * Ogg Theora there's no legacy child-attachment format to discover --
 * registering the codec is sufficient to restore a directly-embedded
 * master source of one of these types.
 */

use Videopack\Admin\Formats\Registry;
use Videopack\Admin\Options;
use Videopack\Admin\Ui;
use Videopack\Video_Source\Source_File;

class VideoCodecLegacyContainerTest extends WP_UnitTestCase {

	protected function options( array $overrides = array() ): array {
		return array_merge( get_option( 'videopack_options', array() ), $overrides );
	}

	protected function registry(): Registry {
		return new Registry( $this->options() );
	}

	public function codec_provider(): array {
		return array(
			'mov (QuickTime)' => array( 'mov', 'video/quicktime' ),
			'mkv (Matroska)'  => array( 'mkv', 'video/x-matroska' ),
			'm3u8 (HLS)'      => array( 'm3u8', 'application/x-mpegURL' ),
			'mpd (DASH)'      => array( 'mpd', 'application/dash+xml' ),
		);
	}

	/**
	 * @dataProvider codec_provider
	 */
	public function test_codec_is_registered_and_not_encodable( string $codec_id, string $mime ): void {
		$codec = $this->registry()->get_codec( $codec_id );

		$this->assertNotNull( $codec );
		$this->assertSame( $mime, $codec->get_mime_type() );
		$this->assertFalse( $codec->is_encodable() );
	}

	/**
	 * @dataProvider codec_provider
	 */
	public function test_codec_is_excluded_from_the_encode_format_matrix( string $codec_id ): void {
		$formats = $this->registry()->get_video_formats();

		foreach ( array_keys( $formats ) as $format_id ) {
			$this->assertStringStartsNotWith( $codec_id, $format_id );
		}
	}

	/**
	 * @dataProvider codec_provider
	 */
	public function test_codec_is_excluded_from_default_encode_options( string $codec_id ): void {
		$defaults = ( new Options() )->get_default();

		$this->assertArrayNotHasKey( $codec_id, $defaults['encode'] );
	}

	/**
	 * @dataProvider codec_provider
	 */
	public function test_codec_is_excluded_from_the_encoding_settings_ui( string $codec_id ): void {
		$options   = $this->options();
		$ui        = new Ui( $options, new Registry( $options ) );
		$codec_ids = array_column( $ui->get_videopack_config_data()['codecs'], 'id' );

		$this->assertNotContains( $codec_id, $codec_ids );
	}

	/**
	 * The actual regression fix: a master source of this type must resolve
	 * to a real codec, since Player::set_sources() silently drops any
	 * source whose get_codec() returns null.
	 *
	 * @dataProvider codec_provider
	 */
	public function test_a_master_source_of_this_type_resolves_to_the_codec( string $codec_id, string $mime ): void {
		$options = $this->options();
		$source  = new Source_File( '/var/www/html/wp-content/uploads/video.' . $codec_id, $options, new Registry( $options ) );

		$this->assertTrue( $source->is_compatible() );

		if ( empty( wp_check_filetype( 'video.' . $codec_id )['type'] ) ) {
			// On multisite, WordPress core's own check_upload_mimes() (hooked
			// to 'upload_mimes') strips any extension not listed in the
			// network's 'upload_filetypes' site option -- 'm3u8'/'mpd' aren't
			// in WP's own default list, and Videopack (like the 4.10 code
			// before it -- kgvid_add_mime_types() only ever hooked
			// 'mime_types', never 'upload_mimes') doesn't add them there
			// either. That's a pre-existing WordPress/network-configuration
			// limitation identical to 4.10's own behavior, not a regression
			// this fix can or should paper over.
			$this->markTestSkipped( "wp_check_filetype() doesn't recognize .{$codec_id} in this environment (likely a multisite upload_filetypes restriction, same as in 4.10)." );
		}

		$this->assertSame( $mime, $source->get_mime_type() );
		$this->assertNotNull( $source->get_codec() );
		$this->assertSame( $codec_id, $source->get_codec()->get_id() );
	}

	/**
	 * codecs_att is deliberately blank for all four (a container's actual
	 * codec varies, and a manifest has none of its own) -- confirms the
	 * <source type="..."> attribute won't get a bogus "codecs=" parameter
	 * appended (Player::get_source_elements() only appends one when
	 * $source['codecs'] is non-empty).
	 */
	public function test_codecs_att_is_blank_for_every_container_codec(): void {
		foreach ( $this->codec_provider() as list( $codec_id, $mime ) ) {
			$codec = $this->registry()->get_codec( $codec_id );
			$this->assertSame( '', $codec->get_codecs_att(), "codec '{$codec_id}'" );
		}
	}
}
