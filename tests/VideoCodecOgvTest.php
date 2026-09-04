<?php
/**
 * Tests for the Ogg Theora codec restoration: Video_Codec_Ogv is
 * registered so pre-existing/direct .ogv sources still resolve to a real
 * codec and get served to the player, but -- since Videopack no longer
 * offers Ogg Theora as an encoding target -- it must never enter the
 * codec x resolution matrix that drives the encode queue, default
 * options, or the encoding settings UI. Previously .ogv sources (both a
 * directly-uploaded master file and a v4-encoded child) silently failed
 * to resolve to any codec at all and were dropped by
 * Player::set_sources()'s `if ( $codec )` gate.
 */

use Videopack\Admin\Formats\Registry;
use Videopack\Admin\Options;
use Videopack\Admin\Ui;
use Videopack\Video_Source\Source_Factory;
use Videopack\Video_Source\Video_Source_Finder;

class VideoCodecOgvTest extends WP_UnitTestCase {

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

	protected function options( array $overrides = array() ): array {
		return array_merge( get_option( 'videopack_options', array() ), $overrides );
	}

	protected function registry( array $option_overrides = array() ): Registry {
		return new Registry( $this->options( $option_overrides ) );
	}

	// -----------------------------------------------------------------
	// Registry: codec is registered but excluded from the format matrix.
	// -----------------------------------------------------------------

	public function test_ogv_codec_is_registered_and_not_encodable(): void {
		$codec = $this->registry()->get_codec( 'ogv' );

		$this->assertNotNull( $codec );
		$this->assertSame( 'video/ogg', $codec->get_mime_type() );
		$this->assertFalse( $codec->is_encodable() );
	}

	public function test_other_codecs_remain_encodable(): void {
		$this->assertTrue( $this->registry()->get_codec( 'h264' )->is_encodable() );
	}

	public function test_get_video_formats_never_includes_an_ogv_format(): void {
		$formats = $this->registry()->get_video_formats();

		foreach ( array_keys( $formats ) as $format_id ) {
			$this->assertStringStartsNotWith( 'ogv', $format_id );
		}
	}

	// -----------------------------------------------------------------
	// Options: no meaningless 'ogv' bucket in the default encode settings.
	// -----------------------------------------------------------------

	public function test_default_options_have_no_ogv_encode_bucket(): void {
		$defaults = ( new Options() )->get_default();

		$this->assertArrayNotHasKey( 'ogv', $defaults['encode'] );
	}

	// -----------------------------------------------------------------
	// Ui: the encoding settings UI never offers an unusable ogv row.
	// -----------------------------------------------------------------

	public function test_config_data_codecs_list_excludes_ogv(): void {
		$options = $this->options();
		$ui      = new Ui( $options, new Registry( $options ) );

		$codec_ids = array_column( $ui->get_videopack_config_data()['codecs'], 'id' );

		$this->assertNotContains( 'ogv', $codec_ids );
	}

	// -----------------------------------------------------------------
	// Discovery: a legacy child attachment or sibling file is still found
	// and actually resolves to a playable source.
	// -----------------------------------------------------------------

	public function test_legacy_ogv_child_attachment_is_discovered_and_playable(): void {
		$parent_id = self::factory()->attachment->create_object( array( 'file' => 'video.mp4', 'post_mime_type' => 'video/mp4' ) );
		$ogv_id    = self::factory()->attachment->create_object(
			array(
				'file'           => 'video.ogv',
				'post_mime_type' => 'video/ogg',
				'post_parent'    => $parent_id,
			)
		);
		update_post_meta( $ogv_id, '_kgflashmediaplayer-format', 'ogg' );

		$source = Source_Factory::create( $parent_id, $this->options(), $this->registry() );
		$children = $source->get_child_sources();

		$this->assertArrayHasKey( 'ogv', $children );
		$this->assertSame( $ogv_id, (int) $children['ogv']->get_id() );
		$this->assertSame( 'video/ogg', $children['ogv']->get_mime_type() );
		$this->assertSame( 'ogv', $children['ogv']->get_codec()->get_id() );
	}

	/**
	 * Videopack v4 never resolution-tiered Ogg Theora (unlike h264/vp9/etc),
	 * so its legacy meta value 'ogg' is codec-level only. A second
	 * unrelated video-format child (which does not carry that meta) must
	 * not be mistaken for it.
	 */
	public function test_a_non_ogg_child_is_not_mistaken_for_the_legacy_ogv_format(): void {
		$parent_id = self::factory()->attachment->create_object( array( 'file' => 'video.mp4', 'post_mime_type' => 'video/mp4' ) );
		$h264_id   = self::factory()->attachment->create_object(
			array(
				'file'           => 'video-h264_720.mp4',
				'post_mime_type' => 'video/mp4',
				'post_parent'    => $parent_id,
			)
		);
		update_post_meta( $h264_id, '_kgflashmediaplayer-format', 'h264_720' );

		$found = Video_Source_Finder::find_legacy_ogv_child(
			array( get_post( $h264_id ) ),
			Source_Factory::create( $parent_id, $this->options(), $this->registry() )
		);

		$this->assertFalse( $found );
	}

	public function test_legacy_ogv_sibling_file_is_discovered_when_find_formats_is_enabled(): void {
		$options   = $this->options( array( 'find_formats' => true ) );
		$parent_id = self::factory()->attachment->create_object( array( 'file' => 'video.mp4', 'post_mime_type' => 'video/mp4' ) );

		// get_direct_path() only uses the real filesystem path (rather than
		// falling back to the attachment's URL) when the master file
		// actually exists on disk -- the attachment factory doesn't write
		// real bytes, so create both files for real.
		$attached_file = get_attached_file( $parent_id );
		$this->temp_files[] = $attached_file;
		file_put_contents( $attached_file, 'fake video content' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents

		$expected_path = pathinfo( $attached_file, PATHINFO_DIRNAME ) . '/' . pathinfo( $attached_file, PATHINFO_FILENAME ) . '.ogv';
		$this->temp_files[] = $expected_path;
		file_put_contents( $expected_path, 'fake ogg theora content' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents

		$source   = Source_Factory::create( $parent_id, $options, new Registry( $options ) );
		$children = $source->get_child_sources();

		$this->assertArrayHasKey( 'ogv', $children );
		$this->assertTrue( $children['ogv']->exists() );
	}

	public function test_no_ogv_child_is_added_when_neither_a_post_nor_a_file_is_found(): void {
		$parent_id = self::factory()->attachment->create_object( array( 'file' => 'video.mp4', 'post_mime_type' => 'video/mp4' ) );

		$source   = Source_Factory::create( $parent_id, $this->options( array( 'find_formats' => true ) ), $this->registry( array( 'find_formats' => true ) ) );
		$children = $source->get_child_sources();

		$this->assertArrayNotHasKey( 'ogv', $children );
	}
}
