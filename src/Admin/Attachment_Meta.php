<?php

namespace Videopack\Admin;

class Attachment_Meta {

	protected $options;

	public function __construct() {
		$this->options = Options::get_instance()->get_options();
	}

	public function get_defaults() {

		$meta_key_array = array(
			'embed'             => $this->options['default_insert'],
			'width'             => '',
			'height'            => '',
			'actualwidth'       => '',
			'actualheight'      => '',
			'downloadlink'      => $this->options['downloadlink'],
			'track'             => '',
			'starts'            => '0',
			'play_25'           => '0',
			'play_50'           => '0',
			'play_75'           => '0',
			'completeviews'     => '0',
			'pickedformat'      => '',
			'encode'            => $this->options['encode'],
			'rotate'            => '',
			'autothumb-error'   => '',
			'numberofthumbs'    => $this->options['generate_thumbs'],
			'randomize'         => '',
			'forcefirst'        => '',
			'featured'          => $this->options['featured'],
			'thumbtime'         => '',
			'lockaspect'        => true,
			'showtitle'         => '',
			'gallery_columns'   => $this->options['gallery_columns'],
			'gallery_exclude'   => '',
			'gallery_include'   => '',
			'gallery_orderby'   => '',
			'gallery_order'     => '',
			'gallery_id'        => '',
			'duration'          => '',
			'aspect'            => '',
			'original_replaced' => '',
			'featuredchanged'   => 'false',
			'url'               => '',
			'poster'            => '',
			'maxwidth'          => '',
			'maxheight'         => '',
			'animated'          => 'notchecked',
		);

		return apply_filters( 'videopack_default_attachment_meta', $meta_key_array );
	}

	public function get( $post_id ) {

		$kgvid_postmeta = get_post_meta( $post_id, '_kgvid-meta', true );
		$meta_key_array = $this->get_default();

		if ( empty( $kgvid_postmeta ) ) {

			$kgvid_postmeta = array();

			$embed = get_post_meta( $post_id, '_kgflashmediaplayer-embed', true ); // this was always saved if you modified the attachment.

			if ( ! empty( $embed ) ) { // old meta values exist

				foreach ( $meta_key_array as $key => $value ) { // read old meta keys and delete them
					$kgvid_postmeta[ $key ] = get_post_meta( $post_id, '_kgflashmediaplayer-' . $key, true );
					if ( $kgvid_postmeta[ $key ] === 'checked' ) {
						$kgvid_postmeta[ $key ] = true;
					}
					delete_post_meta( $post_id, '_kgflashmediaplayer-' . $key );
				}

				foreach ( $kgvid_postmeta as $key => $value ) {
					if ( $value === null ) {
						unset( $kgvid_postmeta[ $key ] ); // remove empty elements
					}
				}

				$this->save( $post_id, $kgvid_postmeta );

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
				$this->save( $post_id, $kgvid_postmeta );
			}
		}//end if

		$kgvid_postmeta = array_merge( $meta_key_array, $kgvid_postmeta ); // make sure all keys are set

		return apply_filters( 'videopack_attachment_meta', $kgvid_postmeta );
	}

	public function save( $post_id, $kgvid_postmeta ) {

		if ( is_array( $kgvid_postmeta ) ) {

			$kgvid_old_postmeta = $this->get( $post_id );
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
			update_post_meta( $post_id, '_kgvid-meta', $kgvid_postmeta );
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
			$sanitized_url = \Videopack\Common\Sanitize::url( $url );
			$mime_info     = get_post_meta( $post_id, '_kgflashmediaplayer-' . $sanitized_url['singleurl_id'] . '-mime', true );

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
			update_post_meta( $post_id, '_kgflashmediaplayer-' . $sanitized_url['singleurl_id'] . '-mime', $mime_info );
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
						'type'  => 'object',
						'properties' => array(
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
							'maxheight'   => array(
								'type' => array(
									'string',
									'number',
								),
							),
							'maxwidth'   => array(
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
							'poster'   => array(
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
								'type' => 'array',
								'items' => array(
									'type' => 'object',
									'properties' => array(
										'src' => array(
											'type' => array(
												'string',
												'number',
											),
										),
										'kind' => array(
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
										'label' => array(
											'type' => array(
												'string',
												'number',
											),
										),
									),
								),
							),
							'url'   => array(
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
						),
					),
				),
				'auth_callback' => function () {
					return current_user_can( 'edit_posts' );
				},
			)
		);
	}
}
