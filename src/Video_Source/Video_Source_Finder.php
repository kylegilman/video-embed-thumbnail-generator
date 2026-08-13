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
	 * Builds the transient key used to cache a URL's existence check.
	 *
	 * @param string $url The URL that was (or would be) checked.
	 * @return string The transient key.
	 */
	protected static function url_exists_transient_key( string $url ): string {
		return 'videopack_url_exists_' . md5( $url );
	}

	/**
	 * Checks whether a cached existence-check result is currently stored
	 * for a URL, without running a new check. Used to decide whether a
	 * "refresh" control makes sense to show for a given source at all --
	 * there's nothing to refresh if nothing was ever cached.
	 *
	 * @param string $url The URL to check.
	 * @return bool True if a (not yet expired) cached result exists.
	 */
	public static function has_cached_url_check( string $url ): bool {
		return false !== get_transient( self::url_exists_transient_key( $url ) );
	}

	/**
	 * Clears a single URL's cached existence-check result, so the next
	 * url_exists() call for it re-checks rather than reusing a stale
	 * answer. Unlike Cleanup::delete_transients() (which finds transients
	 * via a direct SQL LIKE query against wp_options), this deletes a
	 * specific known key via delete_transient() -- correct regardless of
	 * whether an external object cache is active, since transients only
	 * live in wp_options when one isn't.
	 *
	 * @param string $url The URL whose cached result should be cleared.
	 */
	public static function clear_cached_url_check( string $url ): void {
		delete_transient( self::url_exists_transient_key( $url ) );
	}

	/**
	 * Checks if a URL exists.
	 *
	 * Uses a transient to cache the result for a day.
	 *
	 * @param string $url The URL to check.
	 * @return bool True if the URL exists, false otherwise.
	 */
	public static function url_exists( $url ) {

		$transient_key = self::url_exists_transient_key( $url );
		$exists        = get_transient( $transient_key );

		if ( false !== $exists ) {
			return 'yes' === $exists;
		}

		$exists = apply_filters( 'videopack_url_exists', null, $url );
		if ( null !== $exists ) {
			return (bool) $exists;
		}

		$response = wp_safe_remote_head(
			$url,
			array(
				'redirection' => 5,
				'timeout'     => 5,
			)
		);

		if ( is_wp_error( $response ) ) {
			set_transient( $transient_key, 'no', DAY_IN_SECONDS );
			return false;
		}

		$response_code = wp_remote_retrieve_response_code( $response );
		$is_ok         = false;
		if ( $response_code >= 200 && $response_code < 300 ) {
			$content_type = wp_remote_retrieve_header( $response, 'content-type' );
			$is_ok        = true;

			// Detect soft-404s where the server returns a 200 OK HTML page instead of a video.
			if ( ! empty( $content_type ) && strpos( $content_type, 'text/html' ) !== false ) {
				$is_ok = false;
			}
		}

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
					'meta_value'  => \strval( $parent_id ),
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
	 * @param array                                 $posts  Array of attachment post objects.
	 * @param \Videopack\Admin\Formats\Video_Format $format The video format to find.
	 * @param Source                                $source The video source instance.
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
							'attachment'
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
	 * @param Source                                $source The video source instance.
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

				$attachment_manager = new \Videopack\Admin\Attachment( $source->get_options(), $source->get_registry(), new \Videopack\Admin\Attachment_Meta( $source->get_options() ) );
				$attachment_id      = $attachment_manager->url_to_id( $file );

				if ( $attachment_id ) {
					$source->set_child_source(
						$format->get_id(),
						$attachment_id,
						true,
						'attachment'
					);
					return true;
				}

				$source->set_child_source(
					$format->get_id(),
					$file,
					true,
					'file'
				);
				return true;
			}
		}

		return false;
	}

	/**
	 * Finds a video format file for a URL-sourced job in the local WP
	 * uploads directory.
	 *
	 * Distinct from find_format_in_same_directory(): "same directory as
	 * this source" is meaningless for a Source_Url, since it's by
	 * construction always a genuinely different host (see
	 * Source_Factory::determine_source_type() -- a same-host URL becomes a
	 * Source_File with a real local path instead). Encode_Attachment
	 * writes encoded output for a URL-sourced job (no backing attachment)
	 * to the WP uploads root, since there's no local original to sit next
	 * to (see Encode_Info::set_default_url_and_path()'s fallback for a
	 * source with no attachment ID) -- so this checks that location
	 * explicitly, rather than overloading get_no_extension()'s meaning for
	 * this one source type.
	 *
	 * @param \Videopack\Admin\Formats\Video_Format $format The video format to find.
	 * @param Source                                $source The video source instance.
	 * @return bool True if found and added, false otherwise.
	 */
	public static function find_format_in_uploads_directory( \Videopack\Admin\Formats\Video_Format $format, Source $source ): bool {

		$options = $source->get_options();
		if ( empty( $options['encode'][ $format->get_codec()->get_id() ]['enabled'] ) ) {
			return false;
		}

		$uploads = wp_upload_dir();
		$file    = untrailingslashit( (string) $uploads['path'] ) . '/' . $source->get_filename() . $format->get_suffix();

		if ( ! file_exists( $file ) ) {
			return false;
		}

		$attachment_manager = new \Videopack\Admin\Attachment( $source->get_options(), $source->get_registry(), new \Videopack\Admin\Attachment_Meta( $source->get_options() ) );
		$attachment_id      = $attachment_manager->url_to_id( $file );

		if ( $attachment_id ) {
			$source->set_child_source( $format->get_id(), $attachment_id, true, 'attachment' );
			return true;
		}

		$source->set_child_source( $format->get_id(), $file, true, 'file' );
		return true;
	}

	/**
	 * Finds a video format URL in the same directory as the source URL.
	 *
	 * @param \Videopack\Admin\Formats\Video_Format $format The video format to find.
	 * @param Source                                $source The video source instance.
	 * @return bool True if found and added, false otherwise.
	 */
	public static function find_format_in_same_url_directory( \Videopack\Admin\Formats\Video_Format $format, Source $source ) {

		$options = $source->get_options();
		if ( ! empty( $options['encode'][ $format->get_codec()->get_id() ]['enabled'] ) ) {
			// Sanitize_Url, not get_no_extension() -- for a genuinely
			// cross-host Source_Url, that's the URL's own path with the
			// scheme+host stripped (see set_path_parts()), which would
			// produce a host-relative, non-absolute "URL" here. Sanitize_Url
			// is also what Encode_Info::check_potential_locations() uses to
			// build the identical candidate for its own "is this format
			// already encoded" check -- using it here too, rather than a
			// second, independently-computed version (e.g. one routed
			// through Source::get_filename(), which runs the result through
			// sanitize_file_name() and so can disagree with Sanitize_Url's
			// unsanitized filename for a URL with spaces or special
			// characters), keeps both checks -- and their cached
			// url_exists() results -- looking at the same URL for the same
			// source.
			$sanitized_url = new \Videopack\Admin\Sanitize_Url( (string) $source->get_url() );
			$potential_url = $sanitized_url->noextension . $format->get_suffix();

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
