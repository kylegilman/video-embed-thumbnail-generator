<?php

namespace Videopack\Admin;

class Attachment_Meta {

	/**
	 * Videopack Options manager class instance
	 * @var Options $options_manager
	 */
	protected $options_manager;
	protected $options;
	protected $post_id;

	public $embed;
	public $width;
	public $height;
	public $actualwidth;
	public $actualheight;
	public $downloadlink;
	public $track;
	public $starts = 0;
	public $play_25 = 0;
	public $play_50 = 0;
	public $play_75 = 0;
	public $completeviews = 0;
	public $pickedformat;
	public $encode;
	public $rotate;
	public $autothumb_error;
	public $numberofthumbs;
	public $randomize;
	public $forcefirst;
	public $featured;
	public $thumbtime;
	public $lockaspect = true;
	public $showtitle;
	public $gallery_columns;
	public $gallery_exclude;
	public $gallery_include;
	public $gallery_orderby;
	public $gallery_order;
	public $gallery_id;
	public $duration;
	public $aspect;
	public $original_replaced;
	public $featuredchanged = false;
	public $url;
	public $poster;
	public $maxwidth;
	public $maxheight;
	public $animated = 'notchecked';
	public $frame_rate;
	public $codec;
	public $worked = false;

	public function __construct( Options $options_manager, $post_id = false ) {
		$this->options_manager = $options_manager;
		$this->options         = $options_manager->get_options();
		$this->post_id         = $post_id;
		$this->downloadlink    = $this->options['downloadlink'];
		$this->encode          = $this->options['encode'];
		$this->numberofthumbs  = $this->options['generate_thumbs'];
		$this->featured        = $this->options['featured'];
		$this->gallery_columns = $this->options['gallery_columns'];
		$this->get();
	}

	public function get() {

		$kgvid_postmeta = get_post_meta( $this->post_id, '_kgvid-meta', true );
		$meta_key_array = $this->get_defaults();

		if ( empty( $kgvid_postmeta ) ) {

			$kgvid_postmeta = array();

			$embed = get_post_meta( $this->post_id, '_kgflashmediaplayer-embed', true ); // this was always saved if you modified the attachment.

			if ( ! empty( $embed ) ) { // old meta values exist

				foreach ( $meta_key_array as $key => $value ) { // read old meta keys and delete them
					$kgvid_postmeta[ $key ] = get_post_meta( $this->post_id, '_kgflashmediaplayer-' . $key, true );
					if ( $kgvid_postmeta[ $key ] === 'checked' ) {
						$kgvid_postmeta[ $key ] = true;
					}
					delete_post_meta( $this->post_id, '_kgflashmediaplayer-' . $key );
				}

				foreach ( $kgvid_postmeta as $key => $value ) {
					if ( $value === null ) {
						unset( $kgvid_postmeta[ $key ] ); // remove empty elements
					}
				}

				$this->save( $this->post_id, $kgvid_postmeta );

			}

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

			$old_meta_exists = false;

			foreach ( $old_meta_encode_keys as $old_key ) {
				if ( array_key_exists( $old_key, $kgvid_postmeta ) ) {
					$format                              = str_replace( 'encode', '', $old_key );
					$kgvid_postmeta['encode'][ $format ] = $kgvid_postmeta[ $old_key ];
					unset( $kgvid_postmeta[ $old_key ] );
					$old_meta_exists = true;
				}
			}

			if ( $old_meta_exists ) {
				$this->save( $this->post_id, $kgvid_postmeta );
			}
		}

		$kgvid_postmeta = array_merge( $meta_key_array, $kgvid_postmeta ); // make sure all keys are set

		$get_from_wp_meta = array(
			'actualwidth'  => 'width',
			'actualheight' => 'height',
			'duration'     => 'length',
		);

		$video_meta = wp_get_attachment_metadata( $this->post_id );
		$changed    = false;

		foreach ( $get_from_wp_meta as $kgvid_key => $wp_key ) {
			if ( ! $kgvid_postmeta[ $kgvid_key ] && isset( $video_meta[ $wp_key ] ) ) {
				$kgvid_postmeta[ $kgvid_key ] = $video_meta[ $wp_key ];
				$changed                      = true;
			}
		}

		if ( ! $kgvid_postmeta['codec'] || ! $kgvid_postmeta['frame_rate'] ) {
			$video_path = get_attached_file( $this->post_id );
			$video_info = wp_read_video_metadata( $video_path );

			if ( ! $kgvid_postmeta['codec'] && isset( $video_info['codec'] ) ) {
				$kgvid_postmeta['codec'] = $video_info['codec'];
				$changed                 = true;
			}

			if ( ! $kgvid_postmeta['frame_rate'] && isset( $video_info['frame_rate'] ) ) {
				$kgvid_postmeta['frame_rate'] = $video_info['frame_rate'];
				$changed                      = true;
			}
		}

		if ( $changed ) {
			$this->save( $this->post_id, $kgvid_postmeta );
		}

		/**
		 * Filters the custom Videopack attachment meta array.
		 * @param array $kgvid_postmeta The custom Videopack attachment meta array.
		 * @param int   $post_id        The attachment ID.
		 */
		return apply_filters( 'videopack_attachment_meta', $kgvid_postmeta, $this->post_id );
	}

	public function save() {

		if ( is_array( $kgvid_postmeta ) ) {

			$kgvid_old_postmeta = $this->get( $this->post_id );
			$kgvid_postmeta     = array_merge( $kgvid_old_postmeta, $kgvid_postmeta ); // make sure all keys are saved

			foreach ( $kgvid_postmeta as $key => $meta ) { // don't save if it's the same as the default values or empty

				if ( ( array_key_exists( $key, $this->options )
						&& $meta === $this->options[ $key ]
					)
					|| ( ! is_array( $meta )
						&& ! is_bool( $meta )
						&& strlen( $meta ) === 0
						&& (
							( array_key_exists( $key, $this->options )
								&& strlen( $this->options[ $key ] ) === 0
							)
							|| ! array_key_exists( $key, $this->options )
						)
					)
				) {
					unset( $kgvid_postmeta[ $key ] );
				}
			}
			update_post_meta( $this->post_id, '_kgvid-meta', $kgvid_postmeta );
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
			array(
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
	}

	public function schema() {

		$schema = array(
			'actualheight'        => array(
				'type' => array(
					'string',
					'number',
				),
			),
			'actualwidth'         => array(
				'type' => array(
					'string',
					'number',
				),
			),
			'aspect'              => array(
				'type' => array(
					'string',
					'number',
				),
			),
			'autothumb-error'     => array(
				'type' => array(
					'string',
					'number',
				),
			),
			'completeviews'       => array(
				'type' => array(
					'string',
					'number',
				),
			),
			'downloadlink'        => array(
				'type' => array(
					'string',
					'boolean',
				),
			),
			'duration'            => array(
				'type' => array(
					'string',
					'number',
				),
			),
			'embed'               => array(
				'type' => array(
					'string',
					'number',
				),
			),
			'encode'              => array(
				'type'                 => 'object',
				'additionalProperties' => array(
					'type' => array(
						'string',
						'boolean',
					),
					'enum' => array(
						true,
						'notchecked',
						true,
						false,
					),
				),
			),
			'featured'            => array(
				'type' => array(
					'string',
					'boolean',
				),
			),
			'featuredchanged'     => array(
				'type' => array(
					'string',
					'boolean',
				),
			),
			'forcefirst'          => array(
				'type' => array(
					'string',
					'boolean',
				),
			),
			'gallery_exclude'     => array(
				'type' => array(
					'string',
					'number',
				),
			),
			'gallery_id'          => array(
				'type' => array(
					'string',
					'number',
				),
			),
			'gallery_include'     => array(
				'type' => array(
					'string',
					'number',
				),
			),
			'gallery_order'       => array(
				'type' => array(
					'string',
					'number',
				),
			),
			'gallery_orderby'     => array(
				'type' => array(
					'string',
					'number',
				),
			),
			'gallery_thumb_width' => array(
				'type' => array(
					'string',
					'number',
				),
			),
			'height'              => array(
				'type' => array(
					'string',
					'number',
				),
			),
			'lockaspect'          => array(
				'type' => array(
					'string',
					'boolean',
				),
			),
			'maxheight'           => array(
				'type' => array(
					'string',
					'number',
				),
			),
			'maxwidth'            => array(
				'type' => array(
					'string',
					'number',
				),
			),
			'numberofthumbs'      => array(
				'type' => array(
					'string',
					'number',
				),
			),
			'original_replaced'   => array(
				'type' => array(
					'string',
				),
			),
			'pickedformat'        => array(
				'type' => array(
					'string',
				),
			),
			'play_25'             => array(
				'type' => array(
					'string',
					'number',
				),
			),
			'play_50'             => array(
				'type' => array(
					'string',
					'number',
				),
			),
			'play_75'             => array(
				'type' => array(
					'string',
					'number',
				),
			),
			'poster'              => array(
				'type' => array(
					'string',
				),
			),
			'rotate'              => array(
				'type' => array(
					'string',
					'number',
				),
			),
			'showtitle'           => array(
				'type' => array(
					'string',
					'boolean',
				),
			),
			'starts'              => array(
				'type' => array(
					'string',
					'number',
				),
			),
			'thumbtime'           => array(
				'type' => array(
					'string',
					'number',
				),
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
				'type' => array(
					'string',
				),
			),
			'width'               => array(
				'type' => array(
					'string',
					'number',
				),
			),
			'worked'              => array(
				'type' => array(
					'string',
					'boolean',
				),
			),
		);

		return apply_filters( 'videopack_post_meta_schema', $schema );
	}
}
