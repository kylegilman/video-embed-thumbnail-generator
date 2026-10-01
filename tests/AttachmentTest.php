<?php
/**
 * Tests for Attachment -- url_to_id() (resolution + its transient
 * caching + the WordPress-resized-filename normalization that lets a
 * "-300x225" thumbnail variant resolve to the same attachment as its
 * original), is_animated_gif()'s manual byte-scan fallback (this
 * environment's Imagick has no GIF delegate at all -- confirmed via
 * Imagick::queryFormats('GIF') -- so its own try/catch always falls
 * through to the scanner here, same as it would on any install without
 * GIF support compiled in), is_video()'s full mime/parent/externalurl
 * decision tree, and the simpler filter_attachment_url()/
 * filter_attached_file()/add_mime_types()/add_extra_video_metadata() hook
 * callbacks. resolve_url_to_attachment() already has dedicated coverage
 * in AttachmentUrlResolutionTest.php.
 */

use Videopack\Admin\Attachment;
use Videopack\Admin\Attachment_Meta;
use Videopack\Admin\Formats\Registry;

class AttachmentTest extends WP_UnitTestCase {

	/**
	 * @var string[] Temp files created during a test, cleaned up in tear_down().
	 */
	protected $temp_files = array();

	public function tear_down() {
		foreach ( $this->temp_files as $file ) {
			if ( file_exists( $file ) ) {
				wp_delete_file( $file );
			}
		}
		$this->temp_files = array();
		remove_all_filters( 'videopack_url_to_id' );
		parent::tear_down();
	}

	protected function options( array $overrides = array() ): array {
		return array_merge( get_option( 'videopack_options', array() ), $overrides );
	}

	/**
	 * @return array{0: Attachment, 1: Attachment_Meta}
	 */
	protected function attachment_with_meta( array $options = array() ): array {
		$options         = $this->options( $options );
		$format_registry = new Registry( $options );
		$attachment_meta = new Attachment_Meta( $options );
		return array( new Attachment( $options, $format_registry, $attachment_meta ), $attachment_meta );
	}

	protected function attachment( array $options = array() ): Attachment {
		return $this->attachment_with_meta( $options )[0];
	}

	protected function video_attachment( array $extra = array() ): int {
		return self::factory()->attachment->create_object(
			array_merge(
				array(
					'file'           => 'video.mp4',
					'post_mime_type' => 'video/mp4',
					'post_status'    => 'inherit',
				),
				$extra
			)
		);
	}

	protected function image_attachment_file(): string {
		$file               = dirname( __DIR__ ) . '/src/images/Adobestock_287460179_thumb1.jpg';
		$temp               = (string) tempnam( sys_get_temp_dir(), 'videopack-attachment-test-' ) . '.jpg';
		copy( $file, $temp );
		$this->temp_files[] = $temp;
		return $temp;
	}

	/**
	 * Builds a minimal GIF byte stream with the given number of Graphic
	 * Control Extension + Image Descriptor frame markers. Not a real,
	 * renderable image (no actual LZW image data) -- but is_animated_gif()'s
	 * manual fallback scanner is a pure byte-pattern scan for exactly this
	 * marker sequence, not a real decoder, and class_exists('Imagick')
	 * being true doesn't guarantee Imagick was built with GIF delegate
	 * support (it isn't, in this environment -- confirmed via
	 * Imagick::queryFormats('GIF') returning empty); the method's own
	 * try/catch already falls back to this scanner whenever Imagick can't
	 * handle the file, which is exactly what happens here.
	 */
	protected function gif_bytes( int $frame_count ): string {
		$frame_marker = "\x00\x21\xF9\x04\x00\x00\x00\x00\x00\x2C";
		return 'GIF89a' . str_repeat( $frame_marker, $frame_count ) . "\x3B";
	}

	protected function static_gif_file(): string {
		$file               = (string) tempnam( sys_get_temp_dir(), 'videopack-gif-test-' ) . '.gif';
		$this->temp_files[] = $file;
		file_put_contents( $file, $this->gif_bytes( 1 ) ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		return $file;
	}

	protected function animated_gif_file(): string {
		$file               = (string) tempnam( sys_get_temp_dir(), 'videopack-gif-test-' ) . '.gif';
		$this->temp_files[] = $file;
		file_put_contents( $file, $this->gif_bytes( 2 ) ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		return $file;
	}

	// -----------------------------------------------------------------
	// url_to_id()
	// -----------------------------------------------------------------

	public function test_url_to_id_resolves_a_real_attachments_own_url(): void {
		$file          = $this->image_attachment_file();
		$attachment_id = self::factory()->attachment->create_upload_object( $file );

		$result = $this->attachment()->url_to_id( wp_get_attachment_url( $attachment_id ) );

		$this->assertSame( $attachment_id, $result );
	}

	public function test_url_to_id_normalizes_a_resized_image_variant_to_the_original(): void {
		$file          = $this->image_attachment_file();
		$attachment_id = self::factory()->attachment->create_upload_object( $file );
		$base_url      = wp_get_attachment_url( $attachment_id );
		$sized_url     = (string) preg_replace( '/(\.[a-z]+)$/i', '-300x225$1', $base_url );

		$result = $this->attachment()->url_to_id( $sized_url );

		$this->assertSame( $attachment_id, $result );
	}

	/**
	 * Note: the cache does NOT survive the attachment being deleted --
	 * Attachment_Deleter explicitly invalidates this exact transient on
	 * 'delete_attachment' (see its own get_transient_name()/delete_transient()
	 * calls), by design. So caching is verified directly against the
	 * transient itself rather than via a deletion-survival trick.
	 */
	public function test_url_to_id_caches_its_result_in_the_expected_transient(): void {
		$file          = $this->image_attachment_file();
		$attachment_id = self::factory()->attachment->create_upload_object( $file );
		$url           = wp_get_attachment_url( $attachment_id );

		$result = $this->attachment()->url_to_id( $url );
		$cached = get_transient( 'videopack_url_cache_' . md5( $url ) );

		$this->assertSame( $attachment_id, $result );
		$this->assertSame( $attachment_id, $cached, 'the resolved id should be cached under the expected transient key' );
	}

	public function test_url_to_id_returns_zero_for_an_unresolvable_url(): void {
		$result = $this->attachment()->url_to_id( 'https://example.test/videopack-test-never-existed.mp4' );

		$this->assertSame( 0, $result );
	}

	public function test_url_to_id_is_filterable(): void {
		add_filter(
			'videopack_url_to_id',
			static function () {
				return 999;
			}
		);

		$result = $this->attachment()->url_to_id( 'https://example.test/anything.mp4' );

		$this->assertSame( 999, $result );
	}

	// -----------------------------------------------------------------
	// is_animated_gif()
	// -----------------------------------------------------------------

	public function test_is_animated_gif_is_false_for_a_nonexistent_file(): void {
		$this->assertFalse( $this->attachment()->is_animated_gif( '/tmp/videopack-does-not-exist-' . wp_generate_password( 12, false ) . '.gif' ) );
	}

	public function test_is_animated_gif_is_false_for_a_single_frame_gif(): void {
		$this->assertFalse( $this->attachment()->is_animated_gif( $this->static_gif_file() ) );
	}

	public function test_is_animated_gif_is_true_for_a_multi_frame_gif(): void {
		$this->assertTrue( $this->attachment()->is_animated_gif( $this->animated_gif_file() ) );
	}

	// -----------------------------------------------------------------
	// is_video()
	// -----------------------------------------------------------------

	public function test_is_video_is_false_for_a_nonexistent_post(): void {
		$this->assertFalse( $this->attachment()->is_video( PHP_INT_MAX ) );
	}

	public function test_is_video_is_false_for_a_non_post_value(): void {
		$this->assertFalse( $this->attachment()->is_video( null ) );
	}

	public function test_is_video_is_true_for_an_unparented_video(): void {
		$video_id = $this->video_attachment();

		$this->assertTrue( $this->attachment()->is_video( $video_id ) );
		$this->assertTrue( $this->attachment()->is_video( get_post( $video_id ) ), 'should also accept a WP_Post object' );
	}

	public function test_is_video_is_true_when_parent_is_itself(): void {
		$video_id = $this->video_attachment();
		wp_update_post( array( 'ID' => $video_id, 'post_parent' => $video_id ) );

		$this->assertTrue( $this->attachment()->is_video( $video_id ) );
	}

	public function test_is_video_is_true_when_parent_is_not_a_video(): void {
		$parent_id = self::factory()->post->create();
		$video_id  = $this->video_attachment( array( 'post_parent' => $parent_id ) );

		$this->assertTrue( $this->attachment()->is_video( $video_id ) );
	}

	public function test_is_video_is_false_for_a_transcoded_child_of_another_video(): void {
		$parent_video_id = $this->video_attachment();
		$child_video_id  = $this->video_attachment( array( 'post_parent' => $parent_video_id ) );

		$this->assertFalse(
			$this->attachment()->is_video( $child_video_id ),
			'an encoded sibling format (child of another video) should not itself be treated as a standalone video'
		);
	}

	public function test_is_video_is_true_for_a_transcoded_child_with_an_external_url(): void {
		$parent_video_id = $this->video_attachment();
		$child_video_id  = $this->video_attachment( array( 'post_parent' => $parent_video_id ) );
		update_post_meta( $child_video_id, '_kgflashmediaplayer-externalurl', 'https://example.test/video.mp4' );

		$this->assertTrue( $this->attachment()->is_video( $child_video_id ) );
	}

	public function test_is_video_is_true_for_a_streaming_mime_type(): void {
		$stream_id = self::factory()->attachment->create_object( array( 'post_mime_type' => 'application/x-mpegURL' ) );

		$this->assertTrue( $this->attachment()->is_video( $stream_id ) );
	}

	public function test_is_video_is_false_for_a_non_video_non_gif_mime_type(): void {
		$image_id = self::factory()->attachment->create_object( array( 'post_mime_type' => 'image/jpeg' ) );

		$this->assertFalse( $this->attachment()->is_video( $image_id ) );
	}

	public function test_is_video_trusts_already_cached_animated_true_meta(): void {
		list( $attachment, $attachment_meta ) = $this->attachment_with_meta();
		$gif_id = self::factory()->attachment->create_object( array( 'post_mime_type' => 'image/gif' ) );
		$attachment_meta->set_post_id( $gif_id );
		$attachment_meta->save( array( 'animated' => true ) );

		$this->assertTrue( $attachment->is_video( $gif_id ) );
	}

	public function test_is_video_trusts_already_cached_animated_false_meta(): void {
		list( $attachment, $attachment_meta ) = $this->attachment_with_meta();
		$gif_id = self::factory()->attachment->create_object( array( 'post_mime_type' => 'image/gif' ) );
		$attachment_meta->set_post_id( $gif_id );
		$attachment_meta->save( array( 'animated' => false ) );

		$this->assertFalse( $attachment->is_video( $gif_id ) );
	}

	/**
	 * The 'notchecked' default (never-before-examined gif) triggers a real
	 * is_animated_gif() file check and persists the result, rather than
	 * re-examining the file on every single call.
	 */
	public function test_is_video_detects_and_persists_an_unchecked_animated_gif(): void {
		list( $attachment, $attachment_meta ) = $this->attachment_with_meta();
		$file   = $this->animated_gif_file();
		$gif_id = self::factory()->attachment->create_object(
			array(
				'file'           => $file,
				'post_mime_type' => 'image/gif',
			)
		);
		update_attached_file( $gif_id, $file );

		$this->assertTrue( $attachment->is_video( $gif_id ) );
		$attachment_meta->set_post_id( $gif_id );
		$this->assertTrue( $attachment_meta->get()['animated'], 'the detected result should be persisted, not just returned' );
	}

	// -----------------------------------------------------------------
	// filter_attachment_url() / filter_attached_file()
	// -----------------------------------------------------------------

	public function test_filter_attachment_url_substitutes_the_external_url_when_set(): void {
		$video_id = $this->video_attachment();
		update_post_meta( $video_id, '_kgflashmediaplayer-externalurl', 'https://example.test/remote.mp4' );

		$result = $this->attachment()->filter_attachment_url( 'https://local.test/original.mp4', $video_id );

		$this->assertSame( 'https://example.test/remote.mp4', $result );
	}

	public function test_filter_attachment_url_leaves_the_url_unchanged_without_an_external_url(): void {
		$video_id = $this->video_attachment();

		$result = $this->attachment()->filter_attachment_url( 'https://local.test/original.mp4', $video_id );

		$this->assertSame( 'https://local.test/original.mp4', $result );
	}

	public function test_filter_attached_file_substitutes_the_external_url_when_file_is_empty(): void {
		$video_id = $this->video_attachment();
		update_post_meta( $video_id, '_kgflashmediaplayer-externalurl', 'https://example.test/remote.mp4' );

		$result = $this->attachment()->filter_attached_file( '', $video_id );

		$this->assertSame( 'https://example.test/remote.mp4', $result );
	}

	public function test_filter_attached_file_leaves_a_real_file_path_unchanged(): void {
		$video_id = $this->video_attachment();
		update_post_meta( $video_id, '_kgflashmediaplayer-externalurl', 'https://example.test/remote.mp4' );

		$result = $this->attachment()->filter_attached_file( '/var/www/html/wp-content/uploads/video.mp4', $video_id );

		$this->assertSame( '/var/www/html/wp-content/uploads/video.mp4', $result );
	}

	// -----------------------------------------------------------------
	// add_mime_types()
	// -----------------------------------------------------------------

	public function test_add_mime_types_adds_mpd_and_m3u8_and_preserves_existing(): void {
		$result = $this->attachment()->add_mime_types( array( 'jpg' => 'image/jpeg' ) );

		$this->assertSame( 'image/jpeg', $result['jpg'] );
		$this->assertSame( 'application/dash+xml', $result['mpd'] );
		$this->assertSame( 'application/x-mpegURL', $result['m3u8'] );
	}

	// -----------------------------------------------------------------
	// add_extra_video_metadata()
	// -----------------------------------------------------------------

	public function test_add_extra_video_metadata_sets_codec_from_dataformat(): void {
		$result = $this->attachment()->add_extra_video_metadata(
			array(),
			'/path/video.mkv',
			'matroska',
			array( 'video' => array( 'dataformat' => 'V_MPEG4/ISO/AVC' ) )
		);

		$this->assertSame( 'MPEG4/ISO/AVC', $result['codec'] );
	}

	public function test_add_extra_video_metadata_skips_codec_for_quicktime_dataformat(): void {
		$result = $this->attachment()->add_extra_video_metadata(
			array(),
			'/path/video.mov',
			'quicktime',
			array( 'video' => array( 'dataformat' => 'quicktime' ) )
		);

		$this->assertArrayNotHasKey( 'codec', $result );
	}

	public function test_add_extra_video_metadata_falls_back_to_fourcc(): void {
		$result = $this->attachment()->add_extra_video_metadata(
			array(),
			'/path/video.avi',
			'riff',
			array( 'video' => array( 'fourcc' => 'XVID' ) )
		);

		$this->assertSame( 'XVID', $result['codec'] );
	}

	public function test_add_extra_video_metadata_sets_frame_rate_when_present(): void {
		$result = $this->attachment()->add_extra_video_metadata(
			array(),
			'/path/video.mp4',
			'quicktime',
			array( 'video' => array( 'frame_rate' => 29.97 ) )
		);

		$this->assertSame( '29.97', $result['frame_rate'] );
	}

	public function test_add_extra_video_metadata_preserves_existing_metadata_keys(): void {
		$result = $this->attachment()->add_extra_video_metadata(
			array( 'length' => 120 ),
			'/path/video.mp4',
			'quicktime',
			array()
		);

		$this->assertSame( 120, $result['length'] );
	}
}
