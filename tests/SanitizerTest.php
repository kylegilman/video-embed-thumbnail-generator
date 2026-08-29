<?php
/**
 * Tests for Sanitizer::sanitize_options_recursively() -- the schema-driven
 * sanitizer that gates what actually gets persisted for plugin settings
 * (Options::validate_options(), Options.php:961), network settings
 * (Multisite::validate_network_settings(), Multisite.php:370), and
 * per-attachment video meta (Attachment_Meta::sanitize_meta_value(),
 * Attachment_Meta.php:680/706).
 */

use Videopack\Common\Sanitizer;

class SanitizerTest extends WP_UnitTestCase {

	// -----------------------------------------------------------------
	// Non-array input / no schema.
	// -----------------------------------------------------------------

	public function test_scalar_input_is_run_through_sanitize_text_field(): void {
		$result = Sanitizer::sanitize_options_recursively( '<script>alert(1)</script>' );

		$this->assertSame( sanitize_text_field( '<script>alert(1)</script>' ), $result );
	}

	public function test_object_input_is_treated_as_array(): void {
		$input  = (object) array( 'key' => 'value' );
		$result = Sanitizer::sanitize_options_recursively( $input );

		$this->assertSame( array( 'key' => 'value' ), $result );
	}

	public function test_keys_not_in_schema_are_recursively_sanitized_as_text(): void {
		$result = Sanitizer::sanitize_options_recursively( array( 'unknown_key' => '<b>bold</b>' ), array() );

		$this->assertSame( sanitize_text_field( '<b>bold</b>' ), $result['unknown_key'] );
	}

	public function test_nested_arrays_with_no_matching_schema_key_recurse(): void {
		$result = Sanitizer::sanitize_options_recursively(
			array( 'unknown_key' => array( 'nested' => '<i>x</i>' ) ),
			array()
		);

		$this->assertSame( sanitize_text_field( '<i>x</i>' ), $result['unknown_key']['nested'] );
	}

	// -----------------------------------------------------------------
	// 'string' type.
	// -----------------------------------------------------------------

	public function test_string_type_is_sanitized_with_sanitize_text_field(): void {
		$schema = array( 'title' => array( 'type' => 'string' ) );
		$result = Sanitizer::sanitize_options_recursively( array( 'title' => '<script>x</script>Hello' ), $schema );

		$this->assertSame( sanitize_text_field( '<script>x</script>Hello' ), $result['title'] );
	}

	public function test_string_type_with_uri_format_uses_esc_url_raw(): void {
		$schema = array(
			'poster' => array(
				'type'   => 'string',
				'format' => 'uri',
			),
		);
		$result = Sanitizer::sanitize_options_recursively( array( 'poster' => 'https://example.com/p.jpg?a=1&b=2' ), $schema );

		$this->assertSame( esc_url_raw( 'https://example.com/p.jpg?a=1&b=2' ), $result['poster'] );
	}

	public function test_null_value_for_string_type_becomes_empty_string(): void {
		$schema = array( 'title' => array( 'type' => 'string' ) );
		$result = Sanitizer::sanitize_options_recursively( array( 'title' => null ), $schema );

		$this->assertSame( '', $result['title'] );
	}

	// -----------------------------------------------------------------
	// 'boolean' type.
	// -----------------------------------------------------------------

	public function test_boolean_type_uses_rest_sanitize_boolean(): void {
		$schema = array( 'enabled' => array( 'type' => 'boolean' ) );

		$this->assertTrue( Sanitizer::sanitize_options_recursively( array( 'enabled' => true ), $schema )['enabled'] );
		$this->assertFalse( Sanitizer::sanitize_options_recursively( array( 'enabled' => false ), $schema )['enabled'] );
		$this->assertTrue( Sanitizer::sanitize_options_recursively( array( 'enabled' => 1 ), $schema )['enabled'] );
	}

	// -----------------------------------------------------------------
	// 'number' type.
	// -----------------------------------------------------------------

	public function test_number_type_integer_string_becomes_int(): void {
		$schema = array( 'threads' => array( 'type' => 'number' ) );
		$result = Sanitizer::sanitize_options_recursively( array( 'threads' => '4' ), $schema );

		$this->assertSame( 4, $result['threads'] );
		$this->assertIsInt( $result['threads'] );
	}

	public function test_number_type_decimal_string_becomes_float(): void {
		$schema = array( 'scale' => array( 'type' => 'number' ) );
		$result = Sanitizer::sanitize_options_recursively( array( 'scale' => '1.5' ), $schema );

		$this->assertSame( 1.5, $result['scale'] );
		$this->assertIsFloat( $result['scale'] );
	}

	public function test_number_type_non_numeric_value_defaults_to_zero(): void {
		$schema = array( 'threads' => array( 'type' => 'number' ) );
		$result = Sanitizer::sanitize_options_recursively( array( 'threads' => 'not-a-number' ), $schema );

		$this->assertSame( 0, $result['threads'] );
	}

	public function test_number_type_null_stays_null_when_null_is_allowed(): void {
		$schema = array( 'threads' => array( 'type' => array( 'number', 'null' ) ) );
		$result = Sanitizer::sanitize_options_recursively( array( 'threads' => null ), $schema );

		$this->assertNull( $result['threads'] );
	}

	// -----------------------------------------------------------------
	// 'null' type.
	// -----------------------------------------------------------------

	public function test_null_type_alone_always_returns_null(): void {
		$schema = array( 'field' => array( 'type' => 'null' ) );
		$result = Sanitizer::sanitize_options_recursively( array( 'field' => 'whatever' ), $schema );

		$this->assertNull( $result['field'] );
	}

	// -----------------------------------------------------------------
	// 'array' type.
	// -----------------------------------------------------------------

	public function test_array_type_with_typed_items_sanitizes_each_item(): void {
		$schema = array(
			'ids' => array(
				'type'  => 'array',
				'items' => array( 'type' => 'number' ),
			),
		);
		$result = Sanitizer::sanitize_options_recursively( array( 'ids' => array( '1', '2', 'x' ) ), $schema );

		$this->assertSame( array( 1, 2, 0 ), $result['ids'] );
	}

	public function test_array_type_with_object_items_recurses_into_each_item(): void {
		$schema = array(
			'track' => array(
				'type'  => 'array',
				'items' => array(
					'type'       => 'object',
					'properties' => array(
						'src' => array( 'type' => 'string' ),
					),
				),
			),
		);
		$result = Sanitizer::sanitize_options_recursively(
			array( 'track' => array( array( 'src' => '<b>a</b>' ), array( 'src' => '<b>b</b>' ) ) ),
			$schema
		);

		$this->assertSame( sanitize_text_field( '<b>a</b>' ), $result['track'][0]['src'] );
		$this->assertSame( sanitize_text_field( '<b>b</b>' ), $result['track'][1]['src'] );
	}

	public function test_array_type_with_non_array_value_becomes_empty_array(): void {
		$schema = array( 'ids' => array( 'type' => 'array' ) );
		$result = Sanitizer::sanitize_options_recursively( array( 'ids' => 'not-an-array' ), $schema );

		$this->assertSame( array(), $result['ids'] );
	}

	// -----------------------------------------------------------------
	// 'object' type.
	// -----------------------------------------------------------------

	public function test_object_type_with_declared_properties_recurses_using_them(): void {
		$schema = array(
			'watermark' => array(
				'type'       => 'object',
				'properties' => array(
					'url'   => array(
						'type'   => 'string',
						'format' => 'uri',
					),
					'scale' => array( 'type' => 'number' ),
				),
			),
		);
		$result = Sanitizer::sanitize_options_recursively(
			array(
				'watermark' => array(
					'url'   => 'https://example.com/w.png',
					'scale' => '0.5',
				),
			),
			$schema
		);

		$this->assertSame( esc_url_raw( 'https://example.com/w.png' ), $result['watermark']['url'] );
		$this->assertSame( 0.5, $result['watermark']['scale'] );
	}

	public function test_object_type_with_additional_properties_true_sanitizes_each_as_text(): void {
		$schema = array(
			'meta' => array(
				'type'                 => 'object',
				'additionalProperties' => true,
			),
		);
		$result = Sanitizer::sanitize_options_recursively(
			array( 'meta' => array( 'anything' => '<b>x</b>' ) ),
			$schema
		);

		$this->assertSame( sanitize_text_field( '<b>x</b>' ), $result['meta']['anything'] );
	}

	public function test_object_type_with_typed_additional_properties_applies_that_type(): void {
		// Matches Attachment_Meta::schema()'s 'encode' field: an object whose
		// keys are arbitrary format IDs, each sanitized as ['string','boolean'].
		$schema = array(
			'encode' => array(
				'type'                 => 'object',
				'additionalProperties' => array(
					'type' => 'boolean',
				),
			),
		);
		$result = Sanitizer::sanitize_options_recursively(
			array( 'encode' => array( 'h264_720' => true, 'h264_1080' => false ) ),
			$schema
		);

		$this->assertTrue( $result['encode']['h264_720'] );
		$this->assertFalse( $result['encode']['h264_1080'] );
	}

	public function test_object_type_with_non_array_value_falls_back_to_text_sanitization(): void {
		$schema = array( 'watermark' => array( 'type' => 'object' ) );
		$result = Sanitizer::sanitize_options_recursively( array( 'watermark' => '<b>oops</b>' ), $schema );

		$this->assertSame( sanitize_text_field( '<b>oops</b>' ), $result['watermark'] );
	}

	// -----------------------------------------------------------------
	// Union type resolution -- multiple allowed types for one property.
	// -----------------------------------------------------------------

	public function test_union_type_prefers_number_when_value_is_numeric(): void {
		$schema = array( 'field' => array( 'type' => array( 'number', 'string' ) ) );
		$result = Sanitizer::sanitize_options_recursively( array( 'field' => '42' ), $schema );

		$this->assertSame( 42, $result['field'] );
	}

	public function test_union_type_prefers_boolean_when_value_is_a_real_bool(): void {
		$schema = array( 'field' => array( 'type' => array( 'boolean', 'string' ) ) );
		$result = Sanitizer::sanitize_options_recursively( array( 'field' => true ), $schema );

		$this->assertTrue( $result['field'] );
	}

	/**
	 * Attachment_Meta::schema() declares several fields this way on purpose
	 * -- 'downloadlink', 'featured', 'featuredchanged', 'forcefirst',
	 * 'lockaspect', 'showtitle', and 'track[].default' are all typed
	 * ['string', 'boolean', ...] (Attachment_Meta.php:988-1035), which only
	 * makes sense as "accept a real boolean OR a string representation of
	 * one, and normalize to a real boolean either way." A recognizable
	 * boolean string (per rest_is_boolean()) is coerced via
	 * rest_sanitize_boolean() rather than stored as literal text -- a
	 * stored string "false" would otherwise be truthy in a loose PHP check
	 * (`if ( $value )`), the opposite of what was requested.
	 */
	public function test_union_boolean_or_string_type_coerces_a_recognizable_boolean_string(): void {
		$schema = array( 'downloadlink' => array( 'type' => array( 'string', 'boolean', 'null' ) ) );

		$false_result = Sanitizer::sanitize_options_recursively( array( 'downloadlink' => 'false' ), $schema );
		$true_result  = Sanitizer::sanitize_options_recursively( array( 'downloadlink' => '1' ), $schema );

		$this->assertFalse( $false_result['downloadlink'] );
		$this->assertTrue( $true_result['downloadlink'] );
	}

	public function test_union_boolean_or_string_type_still_accepts_a_non_boolean_string(): void {
		// Confirms the new boolean-string coercion doesn't swallow genuinely
		// arbitrary string content for the same union -- only values
		// rest_is_boolean() actually recognizes are coerced.
		$schema = array( 'field' => array( 'type' => array( 'string', 'boolean', 'null' ) ) );
		$result = Sanitizer::sanitize_options_recursively( array( 'field' => 'not-a-boolean' ), $schema );

		$this->assertSame( 'not-a-boolean', $result['field'] );
	}

	public function test_union_type_prefers_array_over_string_for_array_values(): void {
		$schema = array( 'field' => array( 'type' => array( 'array', 'string' ) ) );
		$result = Sanitizer::sanitize_options_recursively( array( 'field' => array( 'a', 'b' ) ), $schema );

		$this->assertSame( array( 'a', 'b' ), $result['field'] );
	}

	public function test_union_type_falls_back_to_first_listed_type_when_none_match(): void {
		// count( $allowed_types ) === 1 skips the union-resolution branch
		// entirely and uses $allowed_types[0] directly -- confirm that
		// single-type declarations (the common case) work as a sanity check
		// against the union logic above.
		$schema = array( 'field' => array( 'type' => array( 'number' ) ) );
		$result = Sanitizer::sanitize_options_recursively( array( 'field' => '7' ), $schema );

		$this->assertSame( 7, $result['field'] );
	}
}
