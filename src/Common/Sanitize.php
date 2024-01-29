<?php

namespace Videopack\Common;

class Sanitize {

	public function allowed_html( $scope = 'public' ) {

		$allowed_html = wp_kses_allowed_html( 'post' );

		$videopack_allowed_html = array(
			'div'    => array(
				'class'     => true,
				'style'     => true,
				'id'        => true,
				'data-*'    => true,
				'itemprop'  => true,
				'itemscope' => true,
				'itemtype'  => true,
				'onclick'   => true,
			),
			'span'   => array(
				'id'      => true,
				'class'   => true,
				'onclick' => true,
				'style'   => true,
			),
			'meta'   => array(
				'itemprop' => true,
				'content'  => true,
			),
			'video'  => array(
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
			'source' => array(
				'src'    => true,
				'data-*' => true,
				'type'   => true,
			),
			'track'  => array(
				'id',
				'kind',
				'src',
				'srclang',
				'label',
				'default',
			),
			'a'      => array(
				'href'    => true,
				'title'   => true,
				'onclick' => true,
				'target'  => true,
			),
			'input'  => array(
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
			'img'    => array(
				'src'    => true,
				'srcset' => true,
				'alt'    => true,
			),
			'button' => array(
				'class'    => true,
				'style'    => true,
				'onclick'  => true,
				'id'       => true,
				'disabled' => true,
				'name'     => true,
				'type'     => true,
			),
		);

		if ( $scope === 'admin' ) {
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

			$videopack_allowed_html = $this->array_merge_recursive_overwrite( $videopack_allowed_html, $admin_allowed );
		}

		$allowed_html = $this->array_merge_recursive_overwrite( $allowed_html, $videopack_allowed_html );

		add_filter( 'safe_style_css', array( $this, 'safe_css' ) );

		return $allowed_html;
	}

	protected function array_merge_recursive_overwrite( $array1, $array2 ) {
		foreach ( $array2 as $key => $value ) {
			if ( array_key_exists( $key, $array1 ) && is_array( $value ) ) {
				$array1[ $key ] = $this->array_merge_recursive_overwrite( $array1[ $key ], $array2[ $key ] );
			} else {
				$array1[ $key ] = $value;
			}
		}
		return $array1;
	}

	public function safe_css( $styles ) {

		$styles[] = 'display'; // allow styles in the shortcode code that only have 'display'
		$styles[] = 'visibility';

		return $styles;
	}

	public static function text_field( $text_field ) {
		// recursively sanitizes user input.
		$old_field = $text_field;

		if ( is_array( $text_field ) ) {

			foreach ( $text_field as $key => &$value ) {
				if ( is_array( $value ) ) {
					$value = self::text_field( $value );
				} elseif ( $key === 'titlecode' ) {
					// special case for the titlecode Videopack setting.
					$value = wp_kses_post( $value );
				} elseif ( self::filter_validate_url( $value ) ) { // if it's a URL.
					$value = sanitize_url( $value );
				} else {
					$value = sanitize_text_field( $value );
				}
			}
		} elseif ( self::filter_validate_url( $text_field ) ) { // not an array, is a URL
				$text_field = sanitize_url( $text_field );
		} else {
			$text_field = sanitize_text_field( $text_field );
		}//end if

		return $text_field;
	}

	protected function filter_validate_url( $uri ) {
		// multibyte compatible check if string is a URL.

		$res = filter_var( $uri, FILTER_VALIDATE_URL );

		if ( $res ) {
			return true;
		}
		// Check if it has unicode chars.
		$l = mb_strlen( $uri );

		if ( $l !== strlen( $uri ) ) {

			// Replace wide chars by “X”.
			$s = str_repeat( ' ', $l );
			for ( $i = 0; $i < $l; ++$i ) {
				$ch       = mb_substr( $uri, $i, 1 );
				$s [ $i ] = strlen( $ch ) > 1 ? 'X' : $ch;
			}
			// Re-check now.
			$res = filter_var( $s, FILTER_VALIDATE_URL );
			if ( $res ) {
				$uri = $res;
				return true;
			}
		}
		return false;
	}

	public static function url( $movieurl ) {
		$sanitized_url = array();

		$decoded_movieurl = rawurldecode( $movieurl );
		$parsed_url       = wp_parse_url( $decoded_movieurl, PHP_URL_PATH );
		$path_info        = pathinfo( $parsed_url );

		if ( empty( $path_info['extension'] ) ) {
			$sanitized_url['noextension'] = $movieurl;
			$sanitized_url['basename']    = substr( $movieurl, -20 );
		} else {
			$no_extension_url   = preg_replace( '/\\.[^.\\s]{3,4}$/', '', $decoded_movieurl );
			$sanitized_basename = sanitize_file_name( $path_info['basename'] );

			$sanitized_url['noextension'] = $no_extension_url;
			$sanitized_url['basename']    = str_replace( '.' . $path_info['extension'], '', $sanitized_basename );
		}

		$sanitized_url['singleurl_id'] = 'singleurl_' . preg_replace( '/[^a-zA-Z0-9]/', '_', $sanitized_url['basename'] );
		$sanitized_url['movieurl']     = esc_url_raw( str_replace( ' ', '%20', $decoded_movieurl ) );

		return $sanitized_url;
	}
}
