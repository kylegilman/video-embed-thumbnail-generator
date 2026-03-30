<?php
/**
 * Input validation and sanitization utility.
 *
 * @package Videopack
 */

namespace Videopack\Common;

/**
 * Class Validate
 *
 * Provides methods for validating and sanitizing HTML, CSS, and other user inputs.
 *
 * @since 5.0.0
 * @package Videopack\Common
 */
class Validate {

	/**
	 * Returns the allowed HTML tags and attributes for a given scope.
	 *
	 * @param string $scope Optional. The scope of the allowed HTML (e.g., 'public', 'admin'). Default 'public'.
	 * @return array The allowed HTML configuration.
	 */
	public function allowed_html( $scope = 'public' ) {
		$scope        = (string) $scope;
		$allowed_html = (array) wp_kses_allowed_html( 'post' );

		$videopack_allowed_html = array(
			'div'     => array(
				'class'     => true,
				'style'     => true,
				'id'        => true,
				'data-*'    => true,
				'itemprop'  => true,
				'itemscope' => true,
				'itemtype'  => true,
				'onclick'   => true,
			),
			'span'    => array(
				'id'        => true,
				'class'     => true,
				'onclick'   => true,
				'style'     => true,
				'itemprop'  => true,
				'itemscope' => true,
				'itemtype'  => true,
			),
			'meta'    => array(
				'itemprop' => true,
				'content'  => true,
			),
			'video'   => array(
				'class'       => true,
				'id'          => true,
				'width'       => true,
				'height'      => true,
				'poster'      => true,
				'preload'     => true,
				'controls'    => true,
				'autoplay'    => true,
				'loop'        => true,
				'muted'       => true,
				'src'         => true,
				'playsinline' => true,
			),
			'source'  => array(
				'src'    => true,
				'data-*' => true,
				'type'   => true,
			),
			'track'   => array(
				'id'      => true,
				'kind'    => true,
				'src'     => true,
				'srclang' => true,
				'label'   => true,
				'default' => true,
			),
			'a'       => array(
				'href'    => true,
				'title'   => true,
				'onclick' => true,
				'target'  => true,
			),
			'input'   => array(
				'class'    => true,
				'type'     => true,
				'value'    => true,
				'onclick'  => true,
				'onkeyup'  => true,
				'checked'  => true,
				'disabled' => true,
				'id'       => true,
				'name'     => true,
				'data-*'   => true,
			),
			'img'     => array(
				'src'    => true,
				'srcset' => true,
				'alt'    => true,
			),
			'button'  => array(
				'class'    => true,
				'style'    => true,
				'onclick'  => true,
				'id'       => true,
				'disabled' => true,
				'name'     => true,
				'type'     => true,
			),
			'svg'     => array(
				'class'       => true,
				'xmlns'       => true,
				'viewbox'     => true,
				'width'       => true,
				'height'      => true,
				'aria-hidden' => true,
				'focusable'   => true,
			),
			'path'    => array(
				'd' => true,
			),
			'circle'  => array(
				'class' => true,
				'cx'    => true,
				'cy'    => true,
				'r'     => true,
			),
			'polygon' => array(
				'class'  => true,
				'points' => true,
			),
			'video-player' => array(
				'features' => true,
			),
			'video-skin' => array(
				'features' => true,
			),
			'video-minimal-skin' => array(
				'features' => true,
			),
		);

		if ( 'admin' === $scope ) {
			$admin_allowed = array(
				'select' => array(
					'id'       => true,
					'name'     => true,
					'class'    => true,
					'onchange' => true,
					'disabled' => true,
				),
				'option' => array(
					'value'    => true,
					'selected' => true,
					'id'       => true,
					'name'     => true,
				),
			);

			$videopack_allowed_html = (array) $this->array_merge_recursive_overwrite( (array) $videopack_allowed_html, (array) $admin_allowed );
		}

		$allowed_html = (array) $this->array_merge_recursive_overwrite( (array) $allowed_html, (array) $videopack_allowed_html );

		add_filter( 'safe_style_css', array( $this, 'safe_css' ) );

		return (array) $allowed_html;
	}

	/**
	 * Recursively merges two arrays, overwriting values from the first array with values from the second.
	 *
	 * @param array $array1 The first array.
	 * @param array $array2 The second array.
	 * @return array The merged array.
	 */
	protected function array_merge_recursive_overwrite( array $array1, array $array2 ) {
		foreach ( $array2 as $key => $value ) {
			if ( array_key_exists( $key, $array1 ) && is_array( $value ) ) {
				$array1[ $key ] = (array) $this->array_merge_recursive_overwrite( (array) $array1[ $key ], (array) $value );
			} else {
				$array1[ $key ] = $value;
			}
		}
		return (array) $array1;
	}

	/**
	 * Adds additional safe CSS properties to the allowed list.
	 *
	 * @param array $styles Existing safe CSS properties.
	 * @return array Modified safe CSS properties.
	 */
	public function safe_css( array $styles ) {
		$styles[] = 'display';
		$styles[] = 'visibility';

		return (array) $styles;
	}

	/**
	 * Recursively sanitizes a text field or array of text fields.
	 *
	 * @param mixed $text_field The text field or array to sanitize.
	 * @return mixed The sanitized text field or array.
	 */
	public static function text_field( $text_field ) {
		if ( is_array( $text_field ) ) {
			foreach ( $text_field as $key => &$value ) {
				if ( is_array( $value ) ) {
					$value = self::text_field( $value );
				} elseif ( (string) $key === 'titlecode' ) {
					$value = (string) wp_kses_post( (string) $value );
				} elseif ( (bool) self::filter_validate_url( (string) $value ) ) {
					$value = (string) sanitize_url( (string) $value );
				} else {
					$value = (string) sanitize_text_field( (string) $value );
				}
			}
		} elseif ( (bool) self::filter_validate_url( (string) $text_field ) ) {
			$text_field = (string) sanitize_url( (string) $text_field );
		} else {
			$text_field = (string) sanitize_text_field( (string) $text_field );
		}

		return $text_field;
	}

	/**
	 * Validates if a string is a valid URL, including multibyte characters.
	 *
	 * @param string $uri The URI to validate.
	 * @return bool True if valid, false otherwise.
	 */
	public static function filter_validate_url( $uri ) {
		$uri = (string) $uri;
		$res = filter_var( $uri, FILTER_VALIDATE_URL );

		if ( (bool) $res ) {
			return true;
		}

		$l = (int) mb_strlen( $uri );

		if ( $l !== (int) strlen( $uri ) ) {
			$s = (string) str_repeat( ' ', $l );
			for ( $i = 0; $i < $l; ++$i ) {
				$ch      = (string) mb_substr( $uri, $i, 1 );
				$s[ $i ] = (int) strlen( $ch ) > 1 ? 'X' : $ch;
			}
			$res = filter_var( $s, FILTER_VALIDATE_URL );
			if ( (bool) $res ) {
				return true;
			}
		}
		return false;
	}
}
