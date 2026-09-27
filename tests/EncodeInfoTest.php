<?php
/**
 * Tests for Encode_Info -- figuring out where a given format's encoded file
 * for a video actually lives: a matching child attachment, a real file at
 * one of several legacy/current on-disk locations, or (if none of those
 * pan out) the location a fresh encode would be written to. Previously
 * only incidentally referenced in doc comments of other test files, never
 * actually exercised.
 */

use Videopack\Admin\Encode\Encode_Info;
use Videopack\Admin\Formats\Registry;
use Videopack\Admin\Formats\Video_Format;

class EncodeInfoTest extends WP_UnitTestCase {

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
		remove_all_filters( 'filesystem_method' );
		parent::tear_down();
	}

	protected function options(): array {
		return get_option( 'videopack_options', array() );
	}

	protected function h264_720_format( Registry $registry ): Video_Format {
		return new Video_Format( $registry->get_codec( 'h264' ), $registry->get_resolution( '720' ), true, false );
	}

	/**
	 * Source_Attachment::get_direct_path()/exists()/get_dirname() require a
	 * real file on disk -- the attachment factory only sets postmeta.
	 */
	protected function video_attachment( array $overrides = array() ): int {
		$attachment_id      = self::factory()->attachment->create_object(
			array_merge(
				array(
					'file'           => 'video.mp4',
					'post_mime_type' => 'video/mp4',
				),
				$overrides
			)
		);
		$attached_file      = get_attached_file( $attachment_id );
		$this->temp_files[] = $attached_file;
		file_put_contents( $attached_file, 'fake video content' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents

		return $attachment_id;
	}

	protected function encode_info( int $attachment_id, Video_Format $format ): Encode_Info {
		$options  = $this->options();
		$registry = new Registry( $options );
		return new Encode_Info( $attachment_id, (string) wp_get_attachment_url( $attachment_id ), $format, $options, $registry );
	}

	// -----------------------------------------------------------------
	// Default location (no child, no file anywhere) -- where a fresh
	// encode would be written.
	// -----------------------------------------------------------------

	public function test_defaults_to_a_new_path_in_the_same_directory_as_the_original(): void {
		$attachment_id = $this->video_attachment();
		$registry      = new Registry( $this->options() );
		$format        = $this->h264_720_format( $registry );

		$info = $this->encode_info( $attachment_id, $format );

		$this->assertFalse( $info->exists );
		$expected_filename = ( new \Videopack\Admin\Sanitize_Url( wp_get_attachment_url( $attachment_id ) ) )->basename . $format->get_suffix();
		$this->assertSame(
			trailingslashit( dirname( get_attached_file( $attachment_id ) ) ) . $expected_filename,
			$info->path
		);
		$this->assertSame(
			trailingslashit( dirname( wp_get_attachment_url( $attachment_id ) ) ) . $expected_filename,
			$info->url
		);
	}

	// -----------------------------------------------------------------
	// A matching child attachment.
	// -----------------------------------------------------------------

	public function test_finds_a_child_attachment_already_encoded_in_this_format(): void {
		$parent_id = $this->video_attachment();
		$registry  = new Registry( $this->options() );
		$format    = $this->h264_720_format( $registry );

		$child_id = $this->video_attachment(
			array(
				'post_parent'    => $parent_id,
				'post_mime_type' => 'video/mp4',
			)
		);
		update_post_meta( $child_id, '_kgflashmediaplayer-format', $format->get_id() );
		update_post_meta(
			$child_id,
			'_wp_attachment_metadata',
			array(
				'width'  => 1280,
				'height' => 720,
			)
		);

		$info = $this->encode_info( $parent_id, $format );

		$this->assertTrue( $info->exists );
		$this->assertSame( $child_id, $info->id );
		$this->assertSame( wp_get_attachment_url( $child_id ), $info->url );
		$this->assertSame( get_attached_file( $child_id ), $info->path );
		$this->assertSame( 1280, $info->width );
		$this->assertSame( 720, $info->height );
	}

	public function test_child_is_deletable_for_its_owner_with_the_encode_videos_capability(): void {
		$owner_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $owner_id );

		$parent_id = $this->video_attachment();
		$registry  = new Registry( $this->options() );
		$format    = $this->h264_720_format( $registry );

		$child_id = $this->video_attachment(
			array(
				'post_parent'    => $parent_id,
				'post_mime_type' => 'video/mp4',
				'post_author'    => $owner_id,
			)
		);
		update_post_meta( $child_id, '_kgflashmediaplayer-format', $format->get_id() );

		$info = $this->encode_info( $parent_id, $format );

		$this->assertTrue( $info->deletable );
	}

	public function test_child_is_not_deletable_for_an_unrelated_user(): void {
		$owner_id     = self::factory()->user->create( array( 'role' => 'administrator' ) );
		$non_owner_id = self::factory()->user->create( array( 'role' => 'subscriber' ) );
		wp_set_current_user( $non_owner_id );

		$parent_id = $this->video_attachment();
		$registry  = new Registry( $this->options() );
		$format    = $this->h264_720_format( $registry );

		$child_id = $this->video_attachment(
			array(
				'post_parent'    => $parent_id,
				'post_mime_type' => 'video/mp4',
				'post_author'    => $owner_id,
			)
		);
		update_post_meta( $child_id, '_kgflashmediaplayer-format', $format->get_id() );

		$info = $this->encode_info( $parent_id, $format );

		$this->assertFalse( $info->deletable );
	}

	// -----------------------------------------------------------------
	// A real file at one of the on-disk fallback locations.
	// -----------------------------------------------------------------

	public function test_finds_a_real_file_in_the_same_directory_as_the_original(): void {
		add_filter( 'filesystem_method', static fn() => 'direct' );

		$attachment_id = $this->video_attachment();
		$registry      = new Registry( $this->options() );
		$format        = $this->h264_720_format( $registry );
		$sanitized_url = new \Videopack\Admin\Sanitize_Url( wp_get_attachment_url( $attachment_id ) );

		$same_dir_path      = trailingslashit( dirname( get_attached_file( $attachment_id ) ) ) . $sanitized_url->basename . $format->get_suffix();
		$this->temp_files[] = $same_dir_path;
		file_put_contents( $same_dir_path, 'fake encoded video' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents

		$info = $this->encode_info( $attachment_id, $format );

		$this->assertTrue( $info->exists );
		$this->assertTrue( $info->sameserver );
		$this->assertSame( $same_dir_path, $info->path );
		$this->assertSame( $sanitized_url->noextension . $format->get_suffix(), $info->url );
		$this->assertTrue( $info->writable );
	}

	public function test_falls_back_to_the_legacy_html5encodes_directory(): void {
		$attachment_id = $this->video_attachment();
		$registry      = new Registry( $this->options() );
		$format        = $this->h264_720_format( $registry );
		$sanitized_url = new \Videopack\Admin\Sanitize_Url( wp_get_attachment_url( $attachment_id ) );

		$uploads = wp_upload_dir();
		wp_mkdir_p( $uploads['basedir'] . '/html5encodes' );
		$html5encodes_path  = $uploads['basedir'] . '/html5encodes/' . $sanitized_url->basename . $format->get_legacy_suffix();
		$this->temp_files[] = $html5encodes_path;
		file_put_contents( $html5encodes_path, 'legacy encoded video' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents

		$info = $this->encode_info( $attachment_id, $format );

		$this->assertTrue( $info->exists );
		$this->assertSame( $html5encodes_path, $info->path );
		$this->assertSame( $uploads['baseurl'] . '/html5encodes/' . $sanitized_url->basename . $format->get_legacy_suffix(), $info->url );
	}

	// -----------------------------------------------------------------
	// check_url_exists() dedup guard.
	// -----------------------------------------------------------------

	public function test_check_url_exists_skips_a_url_identical_to_the_original(): void {
		$attachment_id = $this->video_attachment();
		$registry      = new Registry( $this->options() );
		$format        = $this->h264_720_format( $registry );
		$info          = $this->encode_info( $attachment_id, $format );

		$original_url = $info->url;

		$method = new ReflectionMethod( Encode_Info::class, 'check_url_exists' );
		$method->setAccessible( true );
		$method->invoke( $info, $original_url . '?nocache=1' );

		$this->assertNull( $info->checked_url );
	}
}
