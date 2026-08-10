<?php
/**
 * Tests for Attachment::resolve_url_to_attachment() -- backs the
 * /attachment/register-url REST endpoint (Attachment_Controller.php),
 * gated only by the fairly common 'upload_files' capability. Covers the
 * dedup lookup, the create-vs-lookup-only branches, the parent-post
 * ownership safety check (a caller shouldn't be able to attach externally-
 * hosted "attachments" to a post they can't edit), and URL sanitization.
 */

use Videopack\Admin\Attachment;
use Videopack\Admin\Attachment_Meta;
use Videopack\Admin\Formats\Registry;

class AttachmentUrlResolutionTest extends WP_UnitTestCase {

	/**
	 * @var Attachment
	 */
	protected $attachment;

	public function set_up() {
		parent::set_up();
		$options               = get_option( 'videopack_options', array() );
		$format_registry       = new Registry( $options );
		$attachment_meta       = new Attachment_Meta( $options );
		$this->attachment      = new Attachment( $options, $format_registry, $attachment_meta );
	}

	public function test_missing_url_returns_error() {
		$result = $this->attachment->resolve_url_to_attachment( '' );
		$this->assertWPError( $result );
	}

	public function test_existing_attachment_is_reused_not_recreated() {
		$url            = 'https://example.com/videos/existing.mp4';
		$existing_id     = self::factory()->attachment->create_object(
			array(
				'file'           => 'existing.mp4',
				'post_mime_type' => 'video/mp4',
			)
		);
		update_post_meta( $existing_id, '_kgflashmediaplayer-externalurl', $url );

		$before_count = wp_count_posts( 'attachment' )->inherit;
		$result       = $this->attachment->resolve_url_to_attachment( $url, 0, true );
		$after_count  = wp_count_posts( 'attachment' )->inherit;

		$this->assertSame( $existing_id, $result );
		$this->assertSame( $before_count, $after_count, 'Resolving a URL that already has a matching attachment must not create a duplicate.' );
	}

	public function test_create_false_with_no_existing_match_returns_null_and_creates_nothing() {
		$before_count = wp_count_posts( 'attachment' )->inherit;
		$result       = $this->attachment->resolve_url_to_attachment( 'https://example.com/videos/never-seen.mp4', 0, false );
		$after_count  = wp_count_posts( 'attachment' )->inherit;

		$this->assertNull( $result );
		$this->assertSame( $before_count, $after_count );
	}

	public function test_create_true_with_no_parent_creates_unparented_attachment() {
		$result = $this->attachment->resolve_url_to_attachment( 'https://example.com/videos/new-video.mp4', 0, true );

		$this->assertIsInt( $result );
		$post = get_post( $result );
		$this->assertSame( 0, (int) $post->post_parent );
		$this->assertSame( $result, (int) $result );
		$this->assertSame(
			'https://example.com/videos/new-video.mp4',
			get_post_meta( $result, '_kgflashmediaplayer-externalurl', true )
		);
	}

	public function test_create_true_attaches_to_parent_when_caller_can_edit_it() {
		$editor_id = self::factory()->user->create( array( 'role' => 'editor' ) );
		$parent_id = self::factory()->post->create( array( 'post_author' => $editor_id ) );

		$result = $this->attachment->resolve_url_to_attachment(
			'https://example.com/videos/own-post-video.mp4',
			$parent_id,
			true,
			$editor_id
		);

		$post = get_post( $result );
		$this->assertSame( $parent_id, (int) $post->post_parent );
	}

	/**
	 * Security-relevant: a caller who cannot edit the target post must not
	 * be able to get an externally-hosted "attachment" parented to it --
	 * the safe_parent_id fallback in resolve_url_to_attachment() should
	 * silently drop to 0 rather than honor the requested parent_id.
	 */
	public function test_create_true_ignores_parent_when_caller_cannot_edit_it() {
		$owner_id      = self::factory()->user->create( array( 'role' => 'author' ) );
		$other_post_id = self::factory()->post->create( array( 'post_author' => $owner_id ) );
		$subscriber_id = self::factory()->user->create( array( 'role' => 'subscriber' ) );

		$result = $this->attachment->resolve_url_to_attachment(
			'https://example.com/videos/not-your-post.mp4',
			$other_post_id,
			true,
			$subscriber_id
		);

		$post = get_post( $result );
		$this->assertSame( 0, (int) $post->post_parent, 'A caller who cannot edit the target post must not get their attachment parented to it.' );
	}

	public function test_javascript_scheme_url_is_stripped_by_sanitization() {
		$result = $this->attachment->resolve_url_to_attachment( 'javascript:alert(1)//video.mp4', 0, true );

		$this->assertIsInt( $result );
		$stored_url = (string) get_post_meta( $result, '_kgflashmediaplayer-externalurl', true );
		$this->assertStringNotContainsString( 'javascript:', $stored_url );
	}
}
