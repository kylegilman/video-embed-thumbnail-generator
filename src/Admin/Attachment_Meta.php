<?php

namespace Videopack\Admin;

class Attachment_Meta {

	/**
	 * Videopack Options manager class instance
	 * @var Options $options_manager
	 */
	protected $options_manager;
	protected $options;
	protected $meta_data = array();
	protected $post_id;

	public function __construct( Options $options_manager, $post_id = false ) {
		$this->options_manager = $options_manager;
		$this->options         = $options_manager->get_options();
		$this->post_id         = $post_id;
		$this->meta_data       = $this->get();
	}

	public function get_defaults() {
		// Default values for all meta fields
		// Many will come from the global plugin options
		return array(
			'embed'             => $this->options['default_insert'] ?? 'Single Video',
			'width'             => $this->options['width'] ?? null,
			'height'            => $this->options['height'] ?? null,
			'actualwidth'       => null,
			'actualheight'      => null,
			'downloadlink'      => $this->options['downloadlink'] ?? false,
			'track'             => array(),
			'starts'            => 0,
			'play_25'           => 0,
			'play_50'           => 0,
			'play_75'           => 0,
			'completeviews'     => 0,
			'pickedformat'      => null,
			'encode'            => $this->options['encode'] ?? array(),
			'rotate'            => null, // Rotation value for video.
			'autothumb_error'   => null,
			'total_thumbnails'  => $this->options['generate_thumbs'] ?? 4, // Default number of thumbnails to generate.
			'randomize'         => false,
			'forcefirst'        => false,
			'featured'          => $this->options['featured'] ?? true,
			'thumbtime'         => null, // Timecode for a single thumbnail.
			'lockaspect'        => true,
			'showtitle'         => true,
			'gallery_columns'   => $this->options['gallery_columns'] ?? 4,
			'gallery_exclude'   => null,
			'gallery_include'   => null,
			'gallery_orderby'   => 'menu_order ID',
			'gallery_order'     => 'ASC',
			'gallery_id'        => null,
			'duration'          => null,
			'aspect'            => null,
			'original_replaced' => null,
			'featuredchanged'   => false,
			'url'               => null, // This is the URL of the original video, not the attachment URL.
			'poster'            => null,
			'maxwidth'          => null,
			'maxheight'         => null,
			'animated'          => 'notchecked',
			'frame_rate'        => null,
			'codec'             => null,
			'worked'            => false,
		);
	}

	public function get() {
		$current_meta = get_post_meta( $this->post_id, '_videopack-meta', true );
		if ( ! is_array( $current_meta ) ) {
			$current_meta = array();
		}

		$defaults = $this->get_defaults();
		$migrated = false; // Flag to indicate if a migration happened

		// Attempt to migrate from _kgvid-meta if _videopack-meta is empty
		if ( empty( $current_meta ) ) {
			$legacy_kgvid_meta = get_post_meta( $this->post_id, '_kgvid-meta', true );
			if ( is_array( $legacy_kgvid_meta ) && ! empty( $legacy_kgvid_meta ) ) {
				$current_meta = $legacy_kgvid_meta;
				// Perform numberofthumbs migration
				if ( isset( $current_meta['numberofthumbs'] ) && ! isset( $current_meta['total_thumbnails'] ) ) {
					$current_meta['total_thumbnails'] = $current_meta['numberofthumbs'];
					unset( $current_meta['numberofthumbs'] );
				}
				$migrated = true;
				// Delete old meta after successful migration
				delete_post_meta( $this->post_id, '_kgvid-meta' );
			}
		}

		// Attempt to migrate from _kgflashmediaplayer- if _videopack-meta AND _kgvid-meta are empty
		if ( empty( $current_meta ) ) {
			$embed_old = get_post_meta( $this->post_id, '_kgflashmediaplayer-embed', true );
			if ( ! empty( $embed_old ) ) { // Old meta values exist
				$temp_migrated_meta = array();
				foreach ( $defaults as $key => $default_value ) {
					$old_meta_value = get_post_meta( $this->post_id, '_kgflashmediaplayer-' . $key, true );
					if ( $old_meta_value !== false && $old_meta_value !== null ) {
						$temp_migrated_meta[ $key ] = ( $old_meta_value === 'checked' ) ? true : $old_meta_value;
						// Delete old individual meta keys
						delete_post_meta( $this->post_id, '_kgflashmediaplayer-' . $key );
					}
				}
				// Handle old encode keys
				$old_meta_encode_keys = array(
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
					if ( array_key_exists( $old_key, $temp_migrated_meta ) ) {
						$format = str_replace( 'encode', '', $old_key );
						$temp_migrated_meta['encode'][ $format ] = $temp_migrated_meta[ $old_key ];
						unset( $temp_migrated_meta[ $old_key ] );
					}
				}
				// Perform numberofthumbs migration on this temp data
				if ( isset( $temp_migrated_meta['numberofthumbs'] ) && ! isset( $temp_migrated_meta['total_thumbnails'] ) ) {
					$temp_migrated_meta['total_thumbnails'] = $temp_migrated_meta['numberofthumbs'];
					unset( $temp_migrated_meta['numberofthumbs'] );
				}
				$current_meta = $temp_migrated_meta;
				$migrated = true;
			}
		}

		// If any migration happened, save the current_meta to _videopack-meta
		if ( $migrated ) {
			$this->save( $current_meta ); // This will save to _videopack-meta
		}

		// Merge database meta with defaults to ensure all keys are present
		$meta_data = array_merge( $defaults, $current_meta );

		$get_from_wp_meta = array(
			'actualwidth'  => 'width',
			'actualheight' => 'height',
			'duration'     => 'length',
			'codec'        => 'videocodec', //  'videocodec' from wp_read_video_metadata
			'frame_rate'   => 'frame_rate',
		);

		$video_meta = wp_get_attachment_metadata( $this->post_id );
		$changed    = false;

		foreach ( $get_from_wp_meta as $kgvid_key => $wp_key ) {
			if ( empty( $meta_data[ $kgvid_key ] ) && ! empty( $video_meta[ $wp_key ] ) ) {
				$meta_data[ $kgvid_key ] = $video_meta[ $wp_key ];
				$changed                 = true;
			}
		}

		// Fallback to wp_read_video_metadata if still missing codec or frame_rate
		if ( empty( $meta_data['codec'] ) || empty( $meta_data['frame_rate'] ) ) {
			$video_path = get_attached_file( $this->post_id );
			if ( $video_path ) {
				$video_info = wp_read_video_metadata( $video_path );
				if ( $video_info ) {
					if ( empty( $meta_data['codec'] ) && ! empty( $video_info['codec'] ) ) {
						$meta_data['codec'] = $video_info['codec'];
						$changed            = true;
					}
					if ( empty( $meta_data['codec'] ) && ! empty( $video_info['videocodec'] ) ) { // common key from wp_read_video_metadata
						$meta_data['codec'] = $video_info['videocodec'];
						$changed            = true;
					}
					if ( empty( $meta_data['frame_rate'] ) && ! empty( $video_info['frame_rate'] ) ) {
						$meta_data['frame_rate'] = $video_info['frame_rate'];
						$changed                 = true;
					}
				}
			}
		}

		if ( $changed ) {
			$this->save( $meta_data ); // Save to _videopack-meta
		}

		/**
		 * Filters the custom Videopack attachment meta array.
		 * @param array $kgvid_postmeta The custom Videopack attachment meta array.
		 * @param int   $post_id        The attachment ID.
		 */
		$this->meta_data = $meta_data; // Update instance property
		return apply_filters( 'videopack_attachment_meta', $this->meta_data, $this->post_id );
	}

	public function save( array $meta_to_save ) {
		if ( ! $this->post_id ) {
			return;
		}

		$defaults        = $this->get_defaults();
		$meta_to_persist = array();

		foreach ( $meta_to_save as $key => $value ) {
			// Only save if the key is not in defaults (custom meta) or if the value differs from the default.
			// Also, ensure empty arrays that are default as empty arrays are not saved unless they become non-empty.
			if (
				! array_key_exists( $key, $defaults )
				|| ( $value !== $defaults[ $key ] )
				|| ( is_array( $value ) && ! empty( $value ) && empty( $defaults[ $key ] ) )
			) {
				$meta_to_persist[ $key ] = $value;
			}
		}

		if ( empty( $meta_to_persist ) ) { // If no custom meta to save, delete the meta key.
			delete_post_meta( $this->post_id, '_videopack-meta' );
		} else {
			update_post_meta( $this->post_id, '_videopack-meta', $meta_to_persist );
		}
	}

	public function url_mime_type( $url, $post_id = false ) {

		$mime_info = array(
			'type' => '',
			'ext'  => '',
		);

		if ( empty( $url ) || ! is_string( $url ) ) {
			return $mime_info; // Return early if URL is not valid
		}

		$mime_info = wp_check_filetype( strtok( $url, '?' ) );

		if ( array_key_exists( 'type', $mime_info ) && ! empty( $mime_info['type'] ) ) {
			return $mime_info;
		}

		if ( $post_id ) {
			$sanitized_url = new Sanitize_Url( $url );
			$mime_info     = get_post_meta( $post_id, '_kgflashmediaplayer-' . $sanitized_url->singleurl_id . '-mime', true );

			if ( ! empty( $mime_info ) ) {
				return $mime_info;
			}
		}

		$args = array(
			'sslverify' => false,
			'method'    => 'HEAD',
		);

		$response = wp_remote_head( $url, $args );

		if ( is_wp_error( $response ) ) {
			return $mime_info;
		}

		$headers       = wp_remote_retrieve_headers( $response );
		$mime_type     = $headers['content-type'] ?? '';
		$url_extension = array_search( $mime_type, wp_get_mime_types() );
		$url_extension = explode( '|', $url_extension )[0];

		$mime_info = array(
			'type' => $mime_type,
			'ext'  => $url_extension,
		);

		if ( $post_id ) {
			update_post_meta( $post_id, '_kgflashmediaplayer-' . $sanitized_url->singleurl_id . '-mime', $mime_info );
		}

		return $mime_info;
	}

	public function register() {

		$kgflashmedia_fields = array(
			'poster'       => 'string',
			'poster-id'    => 'number',
			'format'       => 'string',
			'pickedformat' => 'string',
			'video-id'     => 'number',
			'externalurl'  => 'string',
		);

		foreach ( $kgflashmedia_fields as $field_name => $type ) {
			register_post_meta(
				'attachment',
				'_kgflashmediaplayer-' . $field_name,
				array(
					'type'          => $type,
					'single'        => true,
					'show_in_rest'  => true,
					'auth_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				)
			);
		}
		register_post_meta(
			'attachment',
			'_kgvid-meta',
			array( // This is the old meta key, keep it registered for migration purposes but don't show in REST.
				'type'          => 'object',
				'description'   => 'Videopack postmeta',
				'single'        => true,
				'show_in_rest'  => array(
					'schema' => array(
						'type'       => 'object',
						'properties' => $this->schema(),
					),
				),
				'auth_callback' => function () {
					return current_user_can( 'edit_posts' );
				},
			)
		);
		register_post_meta(
			'attachment',
			'_videopack-meta', // The new canonical meta key.
			array(
				'type'          => 'object',
				'description'   => 'Videopack postmeta (new format)',
				'single'        => true,
				'show_in_rest'  => array(
					'schema' => array(
						'type'       => 'object',
						'properties' => $this->schema(),
					),
				),
				'auth_callback' => function () {
					return current_user_can( 'edit_posts' );
				},
			)
		);
	}

	public function schema() {

		// Master list of all possible schema definitions
		$full_schema_definitions = array(
			'actualwidth'         => array(
				'type' => array( 'string', 'number', 'null' ),
			),
			'actualheight'        => array(
				'type' => array( 'string', 'number', 'null' ),
			),
			'aspect'              => array(
				'type' => array( 'string', 'number', 'null' ),
			),
			'autothumb_error'     => array(
				'type' => array( 'string', 'null' ),
			),
			'codec'               => array(
				'type' => array( 'string', 'null' ), // Video codec name, e.g., "h264"
			),
			'completeviews'       => array(
				'type' => array(
					'string',
					'number',
				), // Count of complete views
			),
			'downloadlink'        => array(
				'type' => array(
					'string',
					'boolean',
				), // Enable download link
			),
			'duration'            => array(
				'type' => array( 'string', 'number', 'null' ), // Duration in seconds, can be string or number
			),
			'embed'               => array(
				'type' => array(
					'string',
					'number',
				), // Embed type/method
			),
			'encode'              => array(
				'type'                 => 'object',
				'additionalProperties' => array(
					// This allows for dynamic keys like 'h264', 'vp9' etc.
					'type' => array(
						'string',
						'boolean',
					),
					'enum' => array(
						true,
						false,
						'notchecked',
					),
				), // Encode settings object
			),
			'featured'            => array(
				'type' => array(
					'string',
					'boolean',
				), // Set as featured image
			),
			'featuredchanged'     => array(
				'type' => array(
					'string',
					'boolean',
				), // Internal flag for featured image changes
			),
			'forcefirst'          => array(
				'type' => array(
					'string',
					'boolean',
				), // Force first frame for thumbnail
			),
			'frame_rate'          => array(
				'type' => array( 'string', 'number', 'null' ), // Frame rate, e.g., "29.97" or 25
			),
			'gallery_exclude'     => array(
				'type' => array(
					'string',
					'number',
				), // IDs to exclude from gallery
			),
			'gallery_id'          => array(
				'type' => array(
					'string',
					'number',
				), // Post ID for gallery source
			),
			'gallery_include'     => array(
				'type' => array(
					'string',
					'number',
				), // IDs to include in gallery
			),
			'gallery_order'       => array(
				'type' => array(
					'string',
					'number',
				), // Gallery order (ASC/DESC)
			),
			'gallery_orderby'     => array(
				'type' => array(
					'string',
					'number',
				), // Gallery orderby field
			),
			'gallery_thumb_width' => array(
				'type' => array(
					'string',
					'number',
				), // Gallery thumbnail width
			),
			'height'              => array(
				'type' => array(
					'string',
					'number',
					'null', // Player height
				),
			),
			'lockaspect'          => array(
				'type' => array(
					'string',
					'boolean',
				), // Lock aspect ratio
			),
			'maxheight'           => array(
				'type' => array( 'string', 'number', 'null' ), // Max height for player
			),
			'maxwidth'            => array(
				'type' => array( 'string', 'number', 'null' ), // Max width for player
			),
			'total_thumbnails'    => array(
				'type' => array(
					'string',
					'number',
				), // Number of thumbnails
			),
			'original_replaced'   => array(
				'type' => array( 'string', 'null' ), // ID of format that replaced original, or null
			),
			'pickedformat'        => array(
				'type' => array( 'string', 'null' ), // ID of the format picked as primary
			),
			'play_25'             => array(
				'type' => array(
					'string',
					'number',
				), // Play count at 25%
			),
			'play_50'             => array(
				'type' => array(
					'string',
					'number',
				), // Play count at 50%
			),
			'play_75'             => array(
				'type' => array(
					'string',
					'number',
				), // Play count at 75%
			),
			'poster'              => array(
				'type' => array( 'string', 'null' ), // URL to poster image
			),
			'rotate'              => array(
				'type' => array( 'string', 'number', 'null' ), // Rotation value
			),
			'showtitle'           => array(
				'type' => array(
					'string',
					'boolean',
				), // Show title overlay
			),
			'starts'              => array(
				'type' => array(
					'string',
					'number',
				), // Number of times video started
			),
			'thumbtime'           => array(
				'type' => array( 'string', 'number', 'null' ), // Timestamp for thumbnail
			),
			'track'               => array(
				'type'  => 'array',
				'items' => array(
					'type'       => 'object',
					'properties' => array(
						'src'     => array(
							'type' => array(
								'string',
								'number',
							),
						),
						'kind'    => array(
							'type' => array(
								'string',
								'number',
							),
						),
						'default' => array(
							'type' => array(
								'string',
								'boolean',
							),
						),
						'srclang' => array(
							'type' => array(
								'string',
								'number',
							),
						),
						'label'   => array(
							'type' => array(
								'string',
								'number',
							),
						),
					),
				),
			),
			'url'                 => array(
				'type' => array( 'string', 'null' ), // URL of the video if external or specific format
			),
			'width'               => array(
				'type' => array(
					'string',
					'number',
					'null', // Player width
				),
			),
			'worked'              => array(
				'type' => array(
					'string',
					'boolean',
				), // Indicates if metadata retrieval worked
			),
		);

		// Get the authoritative list of keys from get_defaults()
		$default_keys = array_keys( $this->get_defaults() );

		// Filter the full schema definitions to include only those keys present in defaults
		$final_schema = array_intersect_key( $full_schema_definitions, array_flip( $default_keys ) );

		// Ensure all default keys have at least a basic schema if not defined in full_schema_definitions

		return apply_filters( 'videopack_post_meta_schema', $final_schema );
	}
}
