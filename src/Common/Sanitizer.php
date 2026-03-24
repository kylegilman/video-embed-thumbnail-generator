<?php
/**
 * Sanitizer utility.
 *
 * @package Videopack
 */

namespace Videopack\Common;

/**
 * Class Sanitizer
 *
 * Provides utility methods for sanitizing data based on schemas.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Common
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class Sanitizer {

	/**
	 * Sanitizes options recursively based on schema.
	 *
	 * @param mixed $input             Input to sanitize.
	 * @param array $schema_properties Optional. Schema properties for validation.
	 * @return mixed Sanitized input.
	 */
	public static function sanitize_options_recursively( $input, $schema_properties = array() ) {
		if ( ! is_array( $input ) ) {
			return sanitize_text_field( (string) $input );
		}

		$sanitized_input = array();

		foreach ( $input as $key => $value ) {
			$key = (string) $key;

			if ( ! isset( $schema_properties[ $key ] ) ) {
				$sanitized_input[ $key ] = is_array( $value ) ? self::sanitize_options_recursively( $value ) : sanitize_text_field( (string) $value );
				continue;
			}

			$property_schema = (array) $schema_properties[ $key ];
			$allowed_types   = (array) ( is_array( $property_schema['type'] ) ? $property_schema['type'] : array( $property_schema['type'] ) );

			$type = (string) $allowed_types[0];
			if ( count( $allowed_types ) > 1 ) {
				if ( is_numeric( $value ) && in_array( 'number', $allowed_types, true ) ) {
					$type = 'number';
				} elseif ( is_bool( $value ) && in_array( 'boolean', $allowed_types, true ) ) {
					$type = 'boolean';
				} elseif ( is_array( $value ) ) {
					if ( in_array( 'object', $allowed_types, true ) ) {
						$type = 'object';
					} elseif ( in_array( 'array', $allowed_types, true ) ) {
						$type = 'array';
					}
				} elseif ( is_null( $value ) && in_array( 'null', $allowed_types, true ) ) {
					$type = 'null';
				} elseif ( in_array( 'string', $allowed_types, true ) ) {
					$type = 'string';
				}
			}

			switch ( $type ) {
				case 'object':
					$sanitized_input[ $key ] = is_array( $value ) ? self::sanitize_options_recursively( $value, (array) ( $property_schema['properties'] ?? array() ) ) : sanitize_text_field( (string) $value );
					break;
				case 'array':
					$sanitized_input[ $key ] = array();
					if ( is_array( $value ) ) {
						foreach ( $value as $item ) {
							$item_schema = (array) ( $property_schema['items'] ?? array() );
							if ( isset( $item_schema['type'] ) ) {
								$temp_sanitized            = self::sanitize_options_recursively( array( 'item' => $item ), array( 'item' => $item_schema ) );
								$sanitized_input[ $key ][] = $temp_sanitized['item'];
							} else {
								$sanitized_input[ $key ][] = is_array( $item ) ? self::sanitize_options_recursively( $item ) : sanitize_text_field( (string) $item );
							}
						}
					}
					break;
				case 'boolean':
					$sanitized_input[ $key ] = (bool) rest_sanitize_boolean( $value );
					break;
				case 'number':
					if ( is_numeric( $value ) ) {
						$sanitized_input[ $key ] = ( strpos( (string) $value, '.' ) === false ) ? (int) $value : (float) $value;
					} else {
						$sanitized_input[ $key ] = ( is_null( $value ) && in_array( 'null', $allowed_types, true ) ) ? null : 0;
					}
					break;
				case 'string':
					$str_value = is_null( $value ) ? '' : (string) $value;
					if ( isset( $property_schema['format'] ) && 'uri' === $property_schema['format'] ) {
						$sanitized_input[ $key ] = (string) esc_url_raw( $str_value );
					} else {
						$sanitized_input[ $key ] = (string) sanitize_text_field( $str_value );
					}
					break;
				case 'null':
					$sanitized_input[ $key ] = null;
					break;
				default:
					$sanitized_input[ $key ] = is_array( $value ) ? self::sanitize_options_recursively( $value ) : sanitize_text_field( (string) $value );
					break;
			}
		}
		return $sanitized_input;
	}
}
