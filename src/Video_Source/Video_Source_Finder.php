<?php

namespace Videopack\Video_Source;

class Video_Source_Finder {

	public static function url_exists( $url ) {

		$transient_key = 'videopack_url_exists_' . md5( $url );
		$exists        = get_transient( $transient_key );

		if ( false !== $exists ) {
			return 'yes' === $exists;
		}

		$response = wp_remote_head( $url, array( 'redirection' => 5 ) );

		if ( is_wp_error( $response ) ) {
			set_transient( $transient_key, 'no', DAY_IN_SECONDS );
			return false;
		}

		$response_code = wp_remote_retrieve_response_code( $response );
		$is_ok         = ( $response_code >= 200 && $response_code < 300 );

		set_transient( $transient_key, $is_ok ? 'yes' : 'no', DAY_IN_SECONDS );

		return $is_ok;
	}

	public static function find_attachment_children( Source $source ): array {
		if ( is_numeric( $source->get_source() ) ) {
			$args = array(
				'numberposts' => -1,
				'post_parent' => $source->get_source(),
				'post_type'   => 'attachment',
			);

			return get_posts( $args );
		} else {
			$args = array(
				'numberposts' => -1,
				'post_type'   => 'attachment',
				'meta_key'    => '_kgflashmediaplayer-externalurl',
				'meta_value'  => esc_url_raw( rawurldecode( $source->get_url() ) ),
			);

			return get_posts( $args );
		}
	}

	public static function find_format_in_posts( $posts, \Videopack\Admin\Formats\Video_Format $format, Source $source ): bool {

		if ( $posts ) {
			foreach ( $posts as $post ) {
				if ( is_a( $post, 'WP_Post' ) ) {
					$meta_format = get_post_meta( $post->ID, '_kgflashmediaplayer-format', true );
					if ( $meta_format === $format->get_id()
						|| $meta_format === $format->get_legacy_id()
					) {
						$source->set_child_source(
							$format->get_id(),
							$post->ID,
							true,
							'attachment_local'
						);
						return true;
					}
				}
			}
		}
		return false;
	}

	public static function find_format_in_same_directory( \Videopack\Admin\Formats\Video_Format $format, Source $source ) {

		if ( $source->options['encode'][ $format->get_codec()->get_id() ]['enabled'] ) {
			$file = $source->get_no_extension() . $format->get_suffix();
			if ( ! file_exists( $file ) ) {
				$legacy_file = $source->get_no_extension() . $format->get_legacy_suffix();
				if ( file_exists( $legacy_file ) ) {
					$file = $legacy_file;
				}
			}

			if ( file_exists( $file ) ) {

				$attachment_manager = new \Videopack\Admin\Attachment( $source->options_manager );
				$attachment_id      = $attachment_manager->url_to_id( $file );

				if ( $attachment_id ) {
					$source->set_child_source(
						$format->get_id(),
						$attachment_id,
						true,
						'attachment_local'
					);
					return true;
				}

				$source->set_child_source(
					$format->get_id(),
					$file,
					true,
					'file_local'
				);
				return true;
			}
		}

		return false;
	}

	public static function find_format_in_same_url_directory( \Videopack\Admin\Formats\Video_Format $format, Source $source ) {

		if ( ! empty( $source->options['encode'][ $format->get_codec()->get_id() ]['enabled'] ) ) {
			$potential_url = $source->get_no_extension() . $format->get_suffix();

			if ( self::url_exists( esc_url_raw( str_replace( ' ', '%20', $potential_url ) ) ) ) {
				$source->set_child_source(
					$format->get_id(),
					$potential_url,
					true,
					'url'
				);
				return true;
			}
		}
		return false;
	}
}