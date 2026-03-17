<?php
/**
 * Video source finder utility class.
 *
 * @package Videopack
 */

namespace Videopack\Video_Source;

/**
 * Class Video_Source_Finder
 *
 * Provides utility methods for finding video sources and checking their existence.
 *
 * @since 5.0.0
 * @package Videopack\Video_Source
 */
class Video_Source_Finder {

	/**
	 * Checks if a URL exists.
	 *
	 * Uses a transient to cache the result for a day.
	 *
	 * @param string $url The URL to check.
	 * @return bool True if the URL exists, false otherwise.
	 */
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

	/**
	 * Finds attachment children for a given video source.
	 *
	 * @param Source $source The video source instance.
	 * @return array Array of attachment post objects.
	 */
	public static function find_attachment_children( Source $source ): array {
		if ( is_numeric( $source->get_source() ) ) {
			$parent_id = (int) $source->get_source();

			// 1. Get direct children (attachments with post_parent set).
			$direct_children = get_posts(
				array(
					'numberposts' => -1,
					'post_parent' => $parent_id,
					'post_type'   => 'attachment',
					'fields'      => 'ids',
				)
			);

			// 2. Get attachments linked via meta key (manual assignments).
			$linked_children = get_posts(
				array(
					'numberposts' => -1,
					'post_type'   => 'attachment',
					'meta_key'    => '_kgflashmediaplayer-parent',
					'meta_value'  => $parent_id,
					'fields'      => 'ids',
				)
			);

			$all_ids = array_unique( array_merge( (array) $direct_children, (array) $linked_children ) );

			if ( empty( $all_ids ) ) {
				return array();
			}

			return get_posts(
				array(
					'numberposts' => -1,
					'post_type'   => 'attachment',
					'post__in'    => $all_ids,
					'orderby'     => 'post__in',
				)
			);
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

	/**
	 * Finds a specific video format in a list of posts and adds it to the source as a child.
	 *
	 * @param array                               $posts  Array of attachment post objects.
	 * @param \Videopack\Admin\Formats\Video_Format $format The video format to find.
	 * @param Source                               $source The video source instance.
	 * @return bool True if found and added, false otherwise.
	 */
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

	/**
	 * Finds a video format file in the same directory as the source.
	 *
	 * @param \Videopack\Admin\Formats\Video_Format $format The video format to find.
	 * @param Source                               $source The video source instance.
	 * @return bool True if found and added, false otherwise.
	 */
	public static function find_format_in_same_directory( \Videopack\Admin\Formats\Video_Format $format, Source $source ) {

		$options = $source->get_options();
		if ( $options['encode'][ $format->get_codec()->get_id() ]['enabled'] ) {
			$file = $source->get_no_extension() . $format->get_suffix();
			if ( ! file_exists( $file ) ) {
				$legacy_file = $source->get_no_extension() . $format->get_legacy_suffix();
				if ( file_exists( $legacy_file ) ) {
					$file = $legacy_file;
				}
			}

			if ( file_exists( $file ) ) {

				$attachment_manager = new \Videopack\Admin\Attachment( $source->get_options_manager() );
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

	/**
	 * Finds a video format URL in the same directory as the source URL.
	 *
	 * @param \Videopack\Admin\Formats\Video_Format $format The video format to find.
	 * @param Source                               $source The video source instance.
	 * @return bool True if found and added, false otherwise.
	 */
	public static function find_format_in_same_url_directory( \Videopack\Admin\Formats\Video_Format $format, Source $source ) {

		$options = $source->get_options();
		if ( ! empty( $options['encode'][ $format->get_codec()->get_id() ]['enabled'] ) ) {
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

	/**
	 * Returns a Source instance for a specific format from a list of posts.
	 *
	 * @param array                               $posts           Array of attachment post objects.
	 * @param \Videopack\Admin\Formats\Video_Format $format          The video format to find.
	 * @param \Videopack\Admin\Options            $options_manager The options manager instance.
	 * @param int                                 $parent_id       The parent ID.
	 * @return Source|null The found Source instance or null.
	 */
	public static function get_source_from_posts( $posts, \Videopack\Admin\Formats\Video_Format $format, \Videopack\Admin\Options $options_manager, $parent_id ): ?Source {
		if ( $posts ) {
			foreach ( $posts as $post ) {
				if ( is_a( $post, 'WP_Post' ) ) {
					$meta_format = get_post_meta( $post->ID, '_kgflashmediaplayer-format', true );
					if ( $meta_format === $format->get_id() || $meta_format === $format->get_legacy_id() ) {
						return Source_Factory::create(
							$post->ID,
							$options_manager,
							$format->get_id(),
							true,
							$parent_id,
							'attachment_local'
						);
					}
				}
			}
		}
		return null;
	}

	/**
	 * Returns a Source instance for a specific format found in the same directory as the source.
	 *
	 * @param \Videopack\Admin\Formats\Video_Format $format     The video format to find.
	 * @param Source                               $source_obj The video source instance.
	 * @return Source|null The found Source instance or null.
	 */
	public static function get_source_from_same_directory( \Videopack\Admin\Formats\Video_Format $format, Source $source_obj ): ?Source {
		$options = $source_obj->get_options();
		if ( $options['encode'][ $format->get_codec()->get_id() ]['enabled'] ) {
			$file = $source_obj->get_no_extension() . $format->get_suffix();
			if ( ! file_exists( $file ) ) {
				$legacy_file = $source_obj->get_no_extension() . $format->get_legacy_suffix();
				if ( file_exists( $legacy_file ) ) {
					$file = $legacy_file;
				}
			}

			if ( file_exists( $file ) ) {
				$attachment_manager = new \Videopack\Admin\Attachment( $source_obj->get_options_manager() );
				$attachment_id      = $attachment_manager->url_to_id( $file );

				if ( $attachment_id ) {
					return Source_Factory::create(
						$attachment_id,
						$source_obj->get_options_manager(),
						$format->get_id(),
						true,
						$source_obj->get_parent_id(),
						'attachment_local'
					);
				}

				return Source_Factory::create(
					$file,
					$source_obj->get_options_manager(),
					$format->get_id(),
					true,
					$source_obj->get_parent_id(),
					'file_local'
				);
			}
		}
		return null;
	}

	/**
	 * Returns a Source instance for a specific format found in the same URL directory as the source.
	 *
	 * @param \Videopack\Admin\Formats\Video_Format $format     The video format to find.
	 * @param Source                               $source_obj The video source instance.
	 * @return Source|null The found Source instance or null.
	 */
	public static function get_source_from_same_url_directory( \Videopack\Admin\Formats\Video_Format $format, Source $source_obj ): ?Source {

		$options = $source_obj->get_options();
		if ( ! empty( $options['encode'][ $format->get_codec()->get_id() ]['enabled'] ) ) {
			$potential_url = $source_obj->get_no_extension() . $format->get_suffix();

			if ( self::url_exists( esc_url_raw( str_replace( ' ', '%20', $potential_url ) ) ) ) {
				return Source_Factory::create(
					$potential_url,
					$source_obj->get_options_manager(),
					$format->get_id(),
					true,
					$source_obj->get_parent_id(),
					'url'
				);
			}
		}
		return null;
	}
}
