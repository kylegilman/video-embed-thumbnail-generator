<?php
/**
 * Tests for Attachment_Meta::sanitize_meta_value() -- registered as the
 * sanitize_callback for the '_kgflashmediaplayer-*' post meta fields via
 * register_post_meta(). WP core's sanitize_meta() invokes a sanitize_callback
 * as (value, meta_key, object_type, object_subtype) whenever object_subtype
 * is set -- which it always is here ('attachment') -- so the real meta key
 * lands in the *second* argument, not the third. The method's signature
 * (named $request/$param, mirroring REST validation's calling convention)
 * used to read the key from the third argument unconditionally, so $key
 * ended up as the object_type ('post') instead of the real meta key for
 * every one of these 8 fields, silently falling through to a generic
 * sanitize_text_field() instead of the field's real schema-aware sanitizer.
 *
 * This was discovered by VideoSourceFinderTest's percent-encoding test: a
 * plain update_post_meta() call for '_kgflashmediaplayer-externalurl' was
 * corrupting URLs containing percent-encoded characters (e.g. "%20"),
 * because sanitize_text_field() -- unlike the field's real esc_url_raw()
 * sanitizer -- strips them.
 */

use Videopack\Admin\Attachment_Meta;

class AttachmentMetaSanitizeCallbackTest extends WP_UnitTestCase {

	protected function attachment_meta(): Attachment_Meta {
		return new Attachment_Meta( get_option( 'videopack_options', array() ) );
	}

	/**
	 * Mirrors WP core's actual sanitize_meta() invocation shape for a
	 * registered post meta key with a subtype: (value, meta_key,
	 * object_type, object_subtype). See wp-includes/meta.php's
	 * sanitize_meta() -- the 4-arg apply_filters() call used whenever
	 * $object_subtype is non-empty, which register_post_meta( 'attachment', ... )
	 * always sets it to here.
	 */
	protected function invoke_as_registered_meta_callback( $value, string $meta_key ) {
		return call_user_func( array( $this->attachment_meta(), 'sanitize_meta_value' ), $value, $meta_key, 'post', 'attachment' );
	}

	public function test_external_url_preserves_percent_encoded_characters(): void {
		$result = $this->invoke_as_registered_meta_callback(
			'https://videos.example.test/my%20video.mp4',
			'_kgflashmediaplayer-externalurl'
		);

		$this->assertSame( 'https://videos.example.test/my%20video.mp4', $result );
	}

	public function test_external_url_is_run_through_esc_url_raw_not_generic_text_sanitization(): void {
		// javascript: URLs are exactly what esc_url_raw() strips and a
		// generic sanitize_text_field() would not.
		$result = $this->invoke_as_registered_meta_callback( 'javascript:alert(1)', '_kgflashmediaplayer-externalurl' );

		$this->assertSame( '', $result );
	}

	public function test_poster_id_is_cast_to_an_integer_not_left_as_a_string(): void {
		$result = $this->invoke_as_registered_meta_callback( '42', '_kgflashmediaplayer-poster-id' );

		$this->assertSame( 42, $result );
	}

	public function test_via_a_real_update_post_meta_call_the_value_round_trips_unmangled(): void {
		// Exercises the real WP core code path (register_post_meta's
		// sanitize_callback firing from within update_metadata()), not a
		// direct method call -- proves the fix actually takes effect for
		// ordinary plugin code, not just when invoked with hand-crafted args.
		$attachment_id = self::factory()->attachment->create_object( array( 'file' => 'video.mp4', 'post_mime_type' => 'video/mp4' ) );
		$url           = 'https://videos.example.test/my%20video.mp4';

		update_post_meta( $attachment_id, '_kgflashmediaplayer-externalurl', $url );

		$this->assertSame( $url, get_post_meta( $attachment_id, '_kgflashmediaplayer-externalurl', true ) );
	}

	/**
	 * The method is also called directly (Screens::save_settings()) and as
	 * a REST schema property sanitize_callback (nested '_videopack-meta'
	 * object properties), both of which pass the real key as the *third*
	 * argument with $request as null or a WP_REST_Request -- must keep
	 * working exactly as before.
	 */
	public function test_direct_call_convention_with_key_in_third_argument_still_works(): void {
		$result = call_user_func(
			array( $this->attachment_meta(), 'sanitize_meta_value' ),
			array( 'url' => 'https://videos.example.test/my%20video.mp4' ),
			null,
			'_videopack-meta'
		);

		$this->assertSame( 'https://videos.example.test/my%20video.mp4', $result['url'] );
	}
}
