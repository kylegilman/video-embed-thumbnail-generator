<?php
/**
 * Tests for Source_Attachment::set_url() -- resolving the URL used to serve
 * a "hybrid" attachment (a real WP attachment post whose file lives at an
 * external URL, e.g. offloaded to cloud storage) versus a plain local
 * attachment.
 *
 * This used to also cover a CDN-URL-rewrite/exemption mechanism
 * (rewrite_attachment_url option + a hardcoded exempt-CDN list), removed
 * as dead code: the only path that ever populated the value it operated on
 * was Source_Factory::determine_source_type()'s url_to_id() lookup
 * successfully matching a *cross-host* URL (e.g. a CDN mirror) to a local
 * attachment by relative path -- which stopped being possible when
 * url_to_id() was switched from a custom cross-host suffix-matching SQL
 * query to WordPress core's attachment_url_to_postid() (a deliberate,
 * confirmed-intentional performance tradeoff on large sites), which only
 * strips the *local* site's own upload baseurl prefix and so can never
 * match a foreign host. No other caller in the codebase ever constructs a
 * Source_Attachment with a URL differing from its own attachment ID.
 */

use Videopack\Video_Source\Source_Factory;
use Videopack\Admin\Formats\Registry;

class SourceAttachmentUrlTest extends WP_UnitTestCase {

	protected function options( array $overrides = array() ): array {
		return array_merge( get_option( 'videopack_options', array() ), $overrides );
	}

	protected function registry(): Registry {
		return new Registry( $this->options() );
	}

	/**
	 * A real attachment post with an external "hybrid" URL set via the
	 * legacy meta key (Attachment_Meta::sanitize_meta_value()'s key_map
	 * maps 'externalurl' -> 'url' in _videopack-meta).
	 */
	protected function hybrid_attachment( string $external_url ): int {
		$id = self::factory()->attachment->create_object(
			array(
				'file'           => 'video.mp4',
				'post_mime_type' => 'video/mp4',
			)
		);
		update_post_meta( $id, '_kgflashmediaplayer-externalurl', $external_url );
		return $id;
	}

	public function test_hybrid_attachment_always_uses_its_external_url(): void {
		$id     = $this->hybrid_attachment( 'https://cdn.example.com/videos/video.mp4' );
		$source = Source_Factory::create( $id, $this->options(), $this->registry() );

		$this->assertSame( 'https://cdn.example.com/videos/video.mp4', $source->get_url() );
	}

	public function test_non_hybrid_attachment_uses_the_plain_attachment_url(): void {
		$id     = self::factory()->attachment->create_object(
			array(
				'file'           => 'video.mp4',
				'post_mime_type' => 'video/mp4',
			)
		);
		$source = Source_Factory::create( $id, $this->options(), $this->registry() );

		$this->assertSame( wp_get_attachment_url( $id ), $source->get_url() );
	}
}
