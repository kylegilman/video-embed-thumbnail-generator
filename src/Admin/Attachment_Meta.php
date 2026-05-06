<?php
/**
 * Admin attachment meta handler.
 *
 * @package Videopack
 */

namespace Videopack\Admin;

use Videopack\Common\Hook_Subscriber;

/**
 * Class Attachment_Meta
 *
 * Handles video-specific attachment metadata.
 *
 * This class manages the retrieval, storage, migration, and sanitization of
 * custom metadata associated with video attachments. It supports legacy
 * migrations from older versions of the plugin and integrates with the
 * WordPress REST API.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Admin
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class Attachment_Meta implements Hook_Subscriber {

	/**
	 * Plugin options.
	 *
	 * @var array $options
	 */
	protected $options;

	/**
	 * Cached meta data for the current attachment.
	 *
	 * @var array $meta_data
	 */
	protected $meta_data = array();

	/**
	 * Current attachment ID.
	 *
	 * @var int|bool $post_id
	 */
	protected $post_id;

	/**
	 * Constructor.
	 *
	 * @param array    $options Plugin options.
	 * @param int|bool $post_id Optional. Attachment ID.
	 */
	public function __construct( array $options, $post_id = false ) {
		$this->options   = $options;
		$this->post_id   = $post_id;
		$this->meta_data = $this->get();
	}

	/**
	 * Sets the current attachment ID and refreshes metadata.
	 *
	 * @param int|bool $post_id Attachment ID.
	 * @return array The refreshed metadata.
	 */
	public function set_post_id( $post_id ) {
		$this->post_id   = $post_id;
		$this->meta_data = $this->get();
		return $this->meta_data;
	}

	/**
	 * Returns an array of actions to register.
	 *
	 * @return array
	 */
	public function get_actions(): array {
		return array(
			array(
				'hook'     => 'init',
				'callback' => 'register',
			),
		);
	}

	/**
	 * Returns an array of filters to register.
	 *
	 * @return array
	 */
	public function get_filters(): array {
		return array(
			array(
				'hook'          => 'rest_prepare_attachment',
				'callback'      => 'filter_rest_response_meta',
				'priority'      => 10,
				'accepted_args' => 3,
			),
			array(
				'hook'          => 'update_post_metadata',
				'callback'      => 'maybe_delete_empty_meta',
				'priority'      => 10,
				'accepted_args' => 5,
			),
		);
	}

	/**
	 * Gets default values for all meta fields.
	 *
	 * @return array Default meta values.
	 */
	public function get_defaults() {
		return (array) apply_filters( 'videopack_attachment_meta_defaults', array(
			'embed'                       => (string) ( $this->options['default_insert'] ?? 'Single Video' ),
			'width'                       => (string) ( $this->options['width'] ?? '' ),
			'height'                      => (string) ( $this->options['height'] ?? '' ),
			'actualwidth'                 => null,
			'actualheight'                => null,
			'downloadlink'                => (bool) ( $this->options['downloadlink'] ?? false ),
			'track'                       => array(),
			'starts'                      => 0,
			'play_25'                     => 0,
			'play_50'                     => 0,
			'play_75'                     => 0,
			'completeviews'               => 0,
			'pickedformat'                => null,
			'encode'                      => (array) ( $this->options['encode'] ?? array() ),
			'rotate'                      => null,
			'autothumb_error'             => null,
			'total_thumbnails'            => (int) ( $this->options['total_thumbnails'] ?? 4 ),
			'randomize'                   => false,
			'forcefirst'                  => false,
			'featured'                    => (bool) ( $this->options['featured'] ?? true ),
			'thumbtime'                   => null,
			'lockaspect'                  => true,
			'showtitle'                   => true,
			'gallery_columns'             => (int) ( $this->options['gallery_columns'] ?? 4 ),
			'gallery_exclude'             => null,
			'gallery_include'             => null,
			'gallery_orderby'             => 'menu_order ID',
			'gallery_order'               => 'asc',
			'gallery_id'                  => null,
			'duration'                    => null,
			'aspect'                      => null,
			'original_replaced'           => null,
			'featuredchanged'             => false,
			'url'                         => null,
			'poster'                      => null,
			'poster_id'                   => null,
			'maxwidth'                    => null,
			'maxheight'                   => null,
			'animated'                    => 'notchecked',
			'frame_rate'                  => null,
			'codec'                       => null,
			'worked'                      => false,
			// Player settings.
			'autoplay'                    => (bool) ( $this->options['autoplay'] ?? false ),
			'loop'                        => (bool) ( $this->options['loop'] ?? false ),
			'muted'                       => (bool) ( $this->options['muted'] ?? false ),
			'controls'                    => (bool) ( $this->options['controls'] ?? true ),
			'volume'                      => (float) ( $this->options['volume'] ?? 1.0 ),
			'preload'                     => (string) ( $this->options['preload'] ?? 'metadata' ),
			'playback_rate'               => (bool) ( $this->options['playback_rate'] ?? false ),
			'playsinline'                 => (bool) ( $this->options['playsinline'] ?? true ),
			'right_click'                 => (bool) ( $this->options['right_click'] ?? true ),
			'gifmode'                     => (bool) ( $this->options['gifmode'] ?? false ),
			'fixed_aspect'                => (string) ( $this->options['fixed_aspect'] ?? 'vertical' ),
			'align'                       => (string) ( $this->options['align'] ?? '' ),
			'fullwidth'                   => (bool) ( $this->options['fullwidth'] ?? false ),
			'resize'                      => (bool) ( $this->options['resize'] ?? true ),
			'inline'                      => (bool) ( $this->options['inline'] ?? false ),
			'embeddable'                  => (bool) ( $this->options['embeddable'] ?? false ),
			'embedcode'                   => (bool) ( $this->options['embedcode'] ?? false ),
			'overlay_title'               => (bool) ( $this->options['overlay_title'] ?? false ),
			'views'                       => (bool) ( $this->options['views'] ?? false ),
			'watermark'                   => (string) ( $this->options['watermark'] ?? '' ),
			'watermark_link_to'           => (string) ( $this->options['watermark_link_to'] ?? 'none' ),
			'watermark_url'               => (string) ( $this->options['watermark_url'] ?? '' ),
			'ffmpeg_watermark_url'        => null,
			'is_remote'                   => false,
			'legacy_dimensions'           => null,
			'title_color'                 => null,
			'title_background_color'      => null,
			'pagination_color'            => null,
			'pagination_background_color' => null,
			'pagination_active_bg_color'  => null,
			'pagination_active_color'     => null,
			'play_button_color'           => null,
			'play_button_secondary_color' => null,
			'control_bar_bg_color'        => null,
			'control_bar_color'           => null,
		) );
	}

	/**
	 * Retrieves and migrates attachment meta data.
	 *
	 * @return array The attachment meta data.
	 */
	public function get() {
		if ( ! $this->post_id ) {
			return $this->get_defaults();
		}

		$current_meta = get_post_meta( (int) $this->post_id, '_videopack-meta', true );
		if ( ! is_array( $current_meta ) ) {
			$current_meta = array();
		}
		$defaults = $this->get_defaults();
		$migrated = false;

		// Standardize terminology: migration from view_count to views.
		if ( array_key_exists( 'view_count', $current_meta ) ) {
			$current_meta['views'] = (bool) $current_meta['view_count'];
			unset( $current_meta['view_count'] );
			$migrated = true;
		}

		// Attempt to migrate from _kgvid-meta if _videopack-meta is empty.
		if ( empty( $current_meta ) ) {
			$legacy_kgvid_meta = get_post_meta( (int) $this->post_id, '_kgvid-meta', true );
			if ( is_array( $legacy_kgvid_meta ) && ! empty( $legacy_kgvid_meta ) ) {
				$current_meta = $legacy_kgvid_meta;
				if ( isset( $current_meta['numberofthumbs'] ) && ! isset( $current_meta['total_thumbnails'] ) ) {
					$current_meta['total_thumbnails'] = (int) $current_meta['numberofthumbs'];
					unset( $current_meta['numberofthumbs'] );
				}
				$migrated = true;
				delete_post_meta( (int) $this->post_id, '_kgvid-meta' );
			}
		}

		// Attempt to migrate from individual keys if still empty.
		if ( empty( $current_meta ) ) {
			$embed_old = get_post_meta( (int) $this->post_id, '_kgflashmediaplayer-embed', true );
			if ( ! empty( $embed_old ) ) {
				$temp_migrated_meta = array();
				foreach ( $defaults as $key => $default_value ) {
					$old_meta_value = get_post_meta( (int) $this->post_id, '_kgflashmediaplayer-' . (string) $key, true );
					if ( false !== $old_meta_value && null !== $old_meta_value ) {
						$temp_migrated_meta[ (string) $key ] = ( 'checked' === $old_meta_value ) ? true : $old_meta_value;
						delete_post_meta( (int) $this->post_id, '_kgflashmediaplayer-' . (string) $key );
					}
				}
				$old_meta_encode_keys         = array(
					'encodefullres',
					'encode1080',
					'encode720',
					'encode480',
					'encodemobile',
					'encodewebm',
					'encodeogg',
					'encodecustom',
				);
				$temp_migrated_meta['encode'] = $temp_migrated_meta['encode'] ?? array();
				foreach ( $old_meta_encode_keys as $old_key ) {
					if ( array_key_exists( (string) $old_key, $temp_migrated_meta ) ) {
						$format                                  = (string) str_replace( 'encode', '', (string) $old_key );
						$temp_migrated_meta['encode'][ $format ] = $temp_migrated_meta[ (string) $old_key ];
						unset( $temp_migrated_meta[ (string) $old_key ] );
					}
				}
				if ( isset( $temp_migrated_meta['numberofthumbs'] ) && ! isset( $temp_migrated_meta['total_thumbnails'] ) ) {
					$temp_migrated_meta['total_thumbnails'] = (int) $temp_migrated_meta['numberofthumbs'];
					unset( $temp_migrated_meta['numberofthumbs'] );
				}
				$current_meta = $temp_migrated_meta;
				$migrated     = true;
			}
		}

		if ( $migrated ) {
			$this->save( $current_meta );
		}

		$current_meta['is_remote'] = ( 'true' === get_post_meta( (int) $this->post_id, '_kgflashmediaplayer-external-remote', true ) );

		$meta_data = array_merge( $defaults, $current_meta );

		$get_from_wp_meta = array(
			'actualwidth'  => 'width',
			'actualheight' => 'height',
			'duration'     => 'length',
			'codec'        => 'videocodec',
			'frame_rate'   => 'frame_rate',
		);

		$video_meta = wp_get_attachment_metadata( (int) $this->post_id );
		$changed    = false;

		if ( is_array( $video_meta ) ) {
			foreach ( $get_from_wp_meta as $kgvid_key => $wp_key ) {
				if ( empty( $meta_data[ $kgvid_key ] ) && ! empty( $video_meta[ $wp_key ] ) ) {
					$meta_data[ $kgvid_key ] = $video_meta[ $wp_key ];
					$changed                 = true;
				}
			}
		}

		if ( empty( $meta_data['codec'] ) || empty( $meta_data['frame_rate'] ) || ( empty( $meta_data['actualwidth'] ) && ! empty( get_attached_file( (int) $this->post_id ) ) ) ) {
			$video_path = (string) get_attached_file( (int) $this->post_id );
			if ( $video_path && ! preg_match( '/^(https?:)?\/\//i', $video_path ) ) {
				if ( ! function_exists( 'wp_read_video_metadata' ) ) {
					require_once ABSPATH . 'wp-admin/includes/media.php';
				}
				$video_info = wp_read_video_metadata( $video_path );
				if ( is_array( $video_info ) ) {
					if ( empty( $meta_data['codec'] ) && ! empty( $video_info['codec'] ) ) {
						$meta_data['codec'] = (string) $video_info['codec'];
						$changed            = true;
					}
					if ( empty( $meta_data['codec'] ) && ! empty( $video_info['videocodec'] ) ) {
						$meta_data['codec'] = (string) $video_info['videocodec'];
						$changed            = true;
					}
					if ( empty( $meta_data['frame_rate'] ) && ! empty( $video_info['frame_rate'] ) ) {
						$meta_data['frame_rate'] = (string) $video_info['frame_rate'];
						$changed                 = true;
					}
				}
			} else {
				$external_url = get_post_meta( (int) $this->post_id, '_kgflashmediaplayer-externalurl', true );
				if ( $external_url && ( empty( $meta_data['actualwidth'] ) || empty( $meta_data['actualheight'] ) || empty( $meta_data['duration'] ) ) ) {
					$remote_metadata = $this->fetch_remote_metadata( (string) $external_url, (int) $this->post_id );
					if ( is_array( $remote_metadata ) ) {
						$meta_data = array_merge( $meta_data, $remote_metadata );
						$changed   = true;
					}
				}
			}
		}

		if ( $changed ) {
			$this->save( $meta_data );
		}

		$this->meta_data = (array) $meta_data;
		return (array) apply_filters( 'videopack_attachment_meta', $this->meta_data, $this->post_id );
	}

	/**
	 * Saves attachment meta data, only persisting non-default values.
	 *
	 * @param array $meta_to_save The meta data to save.
	 */
	public function save( array $meta_to_save ) {
		if ( ! $this->post_id ) {
			return;
		}

		$defaults        = $this->get_defaults();
		$meta_to_persist = array();

		foreach ( $meta_to_save as $key => $value ) {
			if ( array_key_exists( (string) $key, $defaults ) ) {
				// Only save if it differs from the default value.
				if ( ( $value !== $defaults[ (string) $key ] ) || ( is_array( $value ) && ! empty( $value ) && empty( $defaults[ (string) $key ] ) ) ) {
					$meta_to_persist[ (string) $key ] = $value;
				}
			}
		}

		if ( empty( $meta_to_persist ) ) {
			delete_post_meta( (int) $this->post_id, '_videopack-meta' );
		} else {
			update_post_meta( (int) $this->post_id, '_videopack-meta', $meta_to_persist );
		}
	}

	/**
	 * Increments a specific video statistic based on the event.
	 *
	 * @param string $video_event The event from the player (e.g., 'play', '25', 'end').
	 * @return array The updated meta array.
	 */
	public function increment_video_stat( string $video_event ): array {
		$meta = $this->get();

		$key_map = array(
			'play' => 'starts',
			'25'   => 'play_25',
			'50'   => 'play_50',
			'75'   => 'play_75',
			'end'  => 'completeviews',
		);

		if ( isset( $key_map[ $video_event ] ) ) {
			$key_to_increment = $key_map[ $video_event ];
			if ( array_key_exists( (string) $key_to_increment, $meta ) ) {
				$meta[ (string) $key_to_increment ] = (int) $meta[ (string) $key_to_increment ] + 1;
				$this->save( $meta );
			}
		}

		return (array) $meta;
	}

	/**
	 * Sanitizes a meta value based on its key or type.
	 *
	 * @param mixed            $value   The value to sanitize.
	 * @param \WP_REST_Request $request Optional. The REST request object.
	 * @param string           $param   Optional. The parameter name.
	 * @return mixed The sanitized value.
	 */
	public function sanitize_meta_value( $value, $request = null, $param = null ) {
		$key = (string) $param;

		if ( empty( $key ) ) {
			return $value;
		}

		$schema = $this->schema();

		if ( '_videopack-meta' === $key && is_array( $value ) ) {
			return \Videopack\Common\Sanitizer::sanitize_options_recursively( $value, $schema );
		}

		$field_name = (string) str_replace( '_kgflashmediaplayer-', '', $key );

		$key_map = array(
			'poster-id'         => 'poster_id',
			'video-id'          => 'video_id',
			'original-replaced' => 'original_replaced',
			'externalurl'       => 'url',
		);

		$actual_schema_key = $key_map[ $field_name ] ?? $field_name;

		if ( ! isset( $schema[ $actual_schema_key ] ) ) {
			$extra_defs = array(
				'video_id' => array( 'type' => 'number' ),
				'parent'   => array( 'type' => 'number' ),
				'format'   => array( 'type' => 'string' ),
			);
			if ( isset( $extra_defs[ $actual_schema_key ] ) ) {
				$schema[ $actual_schema_key ] = $extra_defs[ $actual_schema_key ];
			}
		}

		if ( isset( $schema[ $actual_schema_key ] ) ) {
			$sanitized = \Videopack\Common\Sanitizer::sanitize_options_recursively( array( $actual_schema_key => $value ), $schema );
			return $sanitized[ $actual_schema_key ];
		}

		return is_string( $value ) ? sanitize_text_field( $value ) : $value;
	}

	/**
	 * Checks the mime type of a URL, optionally caching the result.
	 *
	 * @param string   $url     The URL to check.
	 * @param int|bool $post_id Optional. Attachment ID for caching.
	 * @return array Mime type and extension.
	 */
	public function url_mime_type( $url, $post_id = false ) {
		$mime_info = array(
			'type' => '',
			'ext'  => '',
		);

		if ( empty( $url ) || ! is_string( $url ) ) {
			return $mime_info;
		}

		$query_stripped_url = (string) strtok( (string) $url, '?' );
		$mime_info          = wp_check_filetype( $query_stripped_url );

		if ( ! empty( $mime_info['type'] ) ) {
			return (array) $mime_info;
		}

		if ( $post_id ) {
			$sanitized_url = new \Videopack\Admin\Sanitize_Url( (string) $url );
			$cached_info   = get_post_meta( (int) $post_id, '_kgflashmediaplayer-' . (string) $sanitized_url->singleurl_id . '-mime', true );
			if ( is_array( $cached_info ) ) {
				return $cached_info;
			}
		}

		$args     = array(
			'sslverify' => false,
			'method'    => 'HEAD',
		);
		$response = wp_remote_head( (string) $url, $args );

		if ( ! is_wp_error( $response ) ) {
			$headers       = wp_remote_retrieve_headers( $response );
			$mime_type     = (string) ( $headers['content-type'] ?? '' );
			$url_extension = (string) array_search( $mime_type, wp_get_mime_types(), true );
			$url_extension = (string) explode( '|', $url_extension )[0];

			$mime_info = array(
				'type' => $mime_type,
				'ext'  => $url_extension,
			);

			if ( $post_id ) {
				$sanitized_url = new \Videopack\Admin\Sanitize_Url( (string) $url );
				update_post_meta( (int) $post_id, '_kgflashmediaplayer-' . (string) $sanitized_url->singleurl_id . '-mime', $mime_info );
			}
		}

		return (array) $mime_info;
	}

	/**
	 * Fetches metadata from a remote video URL.
	 *
	 * @param string $url           The remote video URL.
	 * @param int    $attachment_id The attachment ID.
	 * @return array|false The extracted metadata or false on failure.
	 */
	public function fetch_remote_metadata( $url, $attachment_id ) {
		if ( ! filter_var( $url, FILTER_VALIDATE_URL ) ) {
			return false;
		}

		$args = array(
			'timeout'   => 30,
			'sslverify' => false,
			'headers'   => array(
				'Range' => 'bytes=0-2097151',
			),
		);

		$response = wp_remote_get( (string) $url, $args );

		if ( is_wp_error( $response ) || wp_remote_retrieve_response_code( $response ) > 299 ) {
			unset( $args['headers']['Range'] );
			$response = wp_remote_get( (string) $url, $args );
			if ( is_wp_error( $response ) || wp_remote_retrieve_response_code( $response ) > 299 ) {
				return false;
			}
		}

		$body = wp_remote_retrieve_body( $response );
		if ( empty( $body ) ) {
			return false;
		}

		$temp_file = (string) wp_tempnam( (string) basename( (string) $url ) );
		if ( ! $temp_file ) {
			return false;
		}

		global $wp_filesystem;
		if ( empty( $wp_filesystem ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
			WP_Filesystem();
		}

		if ( $wp_filesystem instanceof \WP_Filesystem_Base ) {
			$wp_filesystem->put_contents( $temp_file, $body );
		} else {
			file_put_contents( $temp_file, $body );
		}

		if ( ! function_exists( 'wp_read_video_metadata' ) ) {
			require_once ABSPATH . 'wp-admin/includes/media.php';
		}

		$metadata = wp_read_video_metadata( $temp_file );
		wp_delete_file( $temp_file );

		if ( ! is_array( $metadata ) ) {
			return false;
		}

		wp_update_attachment_metadata( (int) $attachment_id, $metadata );

		return array(
			'actualwidth'  => $metadata['width'] ?? null,
			'actualheight' => $metadata['height'] ?? null,
			'duration'     => $metadata['length'] ?? null,
			'codec'        => $metadata['codec'] ?? ( $metadata['videocodec'] ?? null ),
			'frame_rate'   => $metadata['frame_rate'] ?? null,
			'worked'       => true,
		);
	}

	/**
	 * Filters REST response meta to remove empty legacy fields.
	 *
	 * @param \WP_REST_Response $response The REST response.
	 * @param \WP_Post          $post     Post object.
	 * @param \WP_REST_Request  $request  The request object.
	 * @return \WP_REST_Response The filtered response.
	 */
	public function filter_rest_response_meta( $response, $post, $request ) {
		unset( $request );
		$data = $response->get_data();

		if ( ! isset( $data['meta'] ) || ! is_array( $data['meta'] ) ) {
			return $response;
		}

		$meta_keys_to_check = array(
			'_kgflashmediaplayer-poster',
			'_kgflashmediaplayer-poster-id',
			'_kgflashmediaplayer-format',
			'_kgflashmediaplayer-pickedformat',
			'_kgflashmediaplayer-video-id',
			'_kgflashmediaplayer-externalurl',
			'_kgflashmediaplayer-parent',
			'_kgflashmediaplayer-original-replaced',
		);

		foreach ( $meta_keys_to_check as $key ) {
			if ( isset( $data['meta'][ $key ] ) ) {
				$db_value = get_post_meta( (int) $post->ID, $key, true );
				if ( empty( $db_value ) ) {
					unset( $data['meta'][ $key ] );
				}
			}
		}

		$response->set_data( $data );
		return $response;
	}

	/**
	 * Registers custom Videopack post meta fields.
	 */
	public function register() {
		$kgflashmedia_fields = array(
			'poster'            => 'string',
			'poster-id'         => 'number',
			'format'            => 'string',
			'pickedformat'      => 'string',
			'video-id'          => 'number',
			'externalurl'       => 'string',
			'parent'            => 'number',
			'original-replaced' => 'string',
		);

		foreach ( $kgflashmedia_fields as $field_name => $type ) {
			register_post_meta(
				'attachment',
				'_kgflashmediaplayer-' . (string) $field_name,
				array(
					'type'              => (string) $type,
					'single'            => true,
					'show_in_rest'      => true,
					'auth_callback'     => function () {
						return current_user_can( 'edit_posts' );
					},
					'sanitize_callback' => array( $this, 'sanitize_meta_value' ),
				)
			);
		}

		register_post_meta(
			'attachment',
			'_kgvid-meta',
			array(
				'type'          => 'object',
				'description'   => (string) __( 'Videopack postmeta', 'video-embed-thumbnail-generator' ),
				'single'        => true,
				'show_in_rest'  => false,
				'auth_callback' => function () {
					return current_user_can( 'edit_posts' );
				},
			)
		);

		register_post_meta(
			'attachment',
			'_videopack-meta',
			array(
				'type'          => 'object',
				'description'   => (string) __( 'Videopack postmeta (new format)', 'video-embed-thumbnail-generator' ),
				'single'        => true,
				'show_in_rest'  => array(
					'schema'          => array(
						'type'       => 'object',
						'properties' => $this->schema(),
					),
					'update_callback' => array( $this, 'merge_meta_value' ),
				),
				'auth_callback' => function () {
					return current_user_can( 'edit_posts' );
				},
			)
		);
	}

	/**
	 * Defines the schema for Videopack attachment metadata.
	 *
	 * @return array The JSON-LD inspired schema definition.
	 */
	public function schema() {
		$full_schema_definitions = array(
			'actualwidth'                 => array( 'type' => array( 'string', 'number', 'null' ) ),
			'actualheight'                => array( 'type' => array( 'string', 'number', 'null' ) ),
			'aspect'                      => array( 'type' => array( 'string', 'number', 'null' ) ),
			'autothumb_error'             => array( 'type' => array( 'string', 'null' ) ),
			'codec'                       => array( 'type' => array( 'string', 'null' ) ),
			'completeviews'               => array( 'type' => array( 'string', 'number' ) ),
			'downloadlink'                => array( 'type' => array( 'string', 'boolean', 'null' ) ),
			'duration'                    => array( 'type' => array( 'string', 'number', 'null' ) ),
			'embed'                       => array( 'type' => array( 'string', 'number' ) ),
			'encode'                      => array(
				'type'                 => 'object',
				'additionalProperties' => array(
					'type' => array( 'string', 'boolean' ),
					'enum' => array( true, false, 'notchecked' ),
				),
			),
			'featured'                    => array( 'type' => array( 'string', 'boolean', 'null' ) ),
			'featuredchanged'             => array( 'type' => array( 'string', 'boolean', 'null' ) ),
			'forcefirst'                  => array( 'type' => array( 'string', 'boolean', 'null' ) ),
			'frame_rate'                  => array( 'type' => array( 'string', 'number', 'null' ) ),
			'gallery_exclude'             => array( 'type' => array( 'string', 'number' ) ),
			'gallery_id'                  => array( 'type' => array( 'string', 'number' ) ),
			'gallery_include'             => array( 'type' => array( 'string', 'number' ) ),
			'gallery_order'               => array( 'type' => array( 'string', 'number' ) ),
			'gallery_orderby'             => array( 'type' => array( 'string', 'number' ) ),
			'gallery_thumb_width'         => array( 'type' => array( 'string', 'number' ) ),
			'height'                      => array( 'type' => array( 'string', 'number', 'null' ) ),
			'lockaspect'                  => array( 'type' => array( 'string', 'boolean', 'null' ) ),
			'maxheight'                   => array( 'type' => array( 'string', 'number', 'null' ) ),
			'maxwidth'                    => array( 'type' => array( 'string', 'number', 'null' ) ),
			'total_thumbnails'            => array( 'type' => array( 'string', 'number', 'null' ) ),
			'original_replaced'           => array( 'type' => array( 'string', 'null' ) ),
			'pickedformat'                => array( 'type' => array( 'string', 'null' ) ),
			'play_25'                     => array( 'type' => array( 'string', 'number' ) ),
			'play_50'                     => array( 'type' => array( 'string', 'number' ) ),
			'play_75'                     => array( 'type' => array( 'string', 'number' ) ),
			'poster'                      => array(
				'type'   => array( 'string', 'null' ),
				'format' => 'uri',
			),
			'poster_id'                   => array( 'type' => array( 'string', 'number', 'null' ) ),
			'rotate'                      => array( 'type' => array( 'string', 'number', 'null' ) ),
			'showtitle'                   => array( 'type' => array( 'string', 'boolean' ) ),
			'starts'                      => array( 'type' => array( 'string', 'number' ) ),
			'thumbtime'                   => array( 'type' => array( 'string', 'number', 'null' ) ),
			'track'                       => array(
				'type'  => 'array',
				'items' => array(
					'type'       => 'object',
					'properties' => array(
						'src'     => array( 'type' => array( 'string', 'number' ) ),
						'kind'    => array( 'type' => array( 'string', 'number' ) ),
						'default' => array( 'type' => array( 'string', 'boolean' ) ),
						'srclang' => array( 'type' => array( 'string', 'number' ) ),
						'label'   => array( 'type' => array( 'string', 'number' ) ),
					),
				),
			),
			'url'                         => array(
				'type'   => array( 'string', 'null' ),
				'format' => 'uri',
			),
			'width'                       => array( 'type' => array( 'string', 'number', 'null' ) ),
			'worked'                      => array( 'type' => array( 'string', 'boolean' ) ),
			'autoplay'                    => array( 'type' => array( 'string', 'boolean', 'null' ) ),
			'loop'                        => array( 'type' => array( 'string', 'boolean', 'null' ) ),
			'muted'                       => array( 'type' => array( 'string', 'boolean', 'null' ) ),
			'controls'                    => array( 'type' => array( 'string', 'boolean', 'null' ) ),
			'volume'                      => array( 'type' => array( 'string', 'number', 'null' ) ),
			'preload'                     => array( 'type' => array( 'string', 'null' ) ),
			'playback_rate'               => array( 'type' => array( 'string', 'boolean', 'null' ) ),
			'playsinline'                 => array( 'type' => array( 'string', 'boolean', 'null' ) ),
			'right_click'                 => array( 'type' => array( 'string', 'boolean', 'null' ) ),
			'gifmode'                     => array( 'type' => array( 'string', 'boolean', 'null' ) ),
			'fixed_aspect'                => array( 'type' => array( 'string', 'null' ) ),
			'align'                       => array( 'type' => array( 'string', 'null' ) ),
			'fullwidth'                   => array( 'type' => array( 'string', 'boolean', 'null' ) ),
			'resize'                      => array( 'type' => array( 'string', 'boolean', 'null' ) ),
			'inline'                      => array( 'type' => array( 'string', 'boolean', 'null' ) ),
			'embeddable'                  => array( 'type' => array( 'string', 'boolean', 'null' ) ),
			'embedcode'                   => array( 'type' => array( 'string', 'boolean', 'null' ) ),
			'overlay_title'               => array( 'type' => array( 'string', 'boolean', 'null' ) ),
			'views'                       => array( 'type' => array( 'string', 'boolean', 'null' ) ),
			'watermark'                   => array( 'type' => array( 'string', 'null' ) ),
			'watermark_link_to'           => array( 'type' => array( 'string', 'null' ) ),
			'watermark_url'               => array(
				'type'   => array( 'string', 'null' ),
				'format' => 'uri',
			),
			'ffmpeg_watermark_url'        => array(
				'type'   => array( 'string', 'null' ),
				'format' => 'uri',
			),
			'is_remote'                   => array( 'type' => array( 'boolean' ) ),
			'legacy_dimensions'           => array( 'type' => array( 'string', 'boolean', 'null' ) ),
			'title_color'                 => array( 'type' => array( 'string', 'null' ) ),
			'title_background_color'      => array( 'type' => array( 'string', 'null' ) ),
			'pagination_color'            => array( 'type' => array( 'string', 'null' ) ),
			'pagination_background_color' => array( 'type' => array( 'string', 'null' ) ),
			'pagination_active_bg_color'  => array( 'type' => array( 'string', 'null' ) ),
			'pagination_active_color'     => array( 'type' => array( 'string', 'null' ) ),
			'play_button_color'           => array( 'type' => array( 'string', 'null' ) ),
			'play_button_secondary_color' => array( 'type' => array( 'string', 'null' ) ),
			'control_bar_bg_color'        => array( 'type' => array( 'string', 'null' ) ),
			'control_bar_color'           => array( 'type' => array( 'string', 'null' ) ),
		);

		$default_keys = array_keys( $this->get_defaults() );
		$final_schema = array_intersect_key( $full_schema_definitions, array_flip( $default_keys ) );

		foreach ( $final_schema as $key => $value ) {
			$final_schema[ $key ]['sanitize_callback'] = array( $this, 'sanitize_meta_value' );
		}

		return (array) apply_filters( 'videopack_post_meta_schema', $final_schema );
	}

	/**
	 * Conditionally deletes empty meta fields during saving.
	 *
	 * @param mixed  $check      Existing check value.
	 * @param int    $object_id  Object ID.
	 * @param string $meta_key   Meta key.
	 * @param mixed  $meta_value Meta value.
	 * @param mixed  $prev_value Previous value.
	 * @return mixed Modified check value.
	 */
	public function maybe_delete_empty_meta( $check, $object_id, $meta_key, $meta_value, $prev_value ) {
		unset( $prev_value );
		if ( 0 !== strpos( (string) $meta_key, '_kgflashmediaplayer-' ) ) {
			return $check;
		}

		if ( empty( $meta_value ) && ! is_bool( $meta_value ) ) {
			delete_post_meta( (int) $object_id, (string) $meta_key );
			return true;
		}

		return $check;
	}

	/**
	 * Merges incoming metadata with existing metadata for the REST API.
	 *
	 * @param mixed            $value    The new value for the meta field.
	 * @param \WP_Post         $post     The post object.
	 * @param string           $meta_key The meta key.
	 * @param \WP_REST_Request $request  The REST request.
	 * @return bool True if successful, false otherwise.
	 */
	public function merge_meta_value( $value, $post, $meta_key, $request ) {
		if ( '_videopack-meta' !== $meta_key ) {
			return false;
		}

		$current_meta = get_post_meta( $post->ID, '_videopack-meta', true );
		if ( ! is_array( $current_meta ) ) {
			$current_meta = array();
		}

		// Merge incoming value with current meta.
		$merged_meta = array_merge( $current_meta, (array) $value );

		// Only save if it differs from the defaults (leveraging existing save logic).
		$this->post_id = $post->ID;
		$this->save( $merged_meta );

		return true;
	}
}
