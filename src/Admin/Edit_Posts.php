<?php

namespace Videopack\Admin;

class Edit_Posts {
	/**
	 * Videopack Options manager class instance
	 * @var Options $options_manager
	 */
	protected $options_manager;
	protected $options;

	public function __construct( Options $options_manager ) {
		$this->options_manager = $options_manager;
		$this->options         = $options_manager->get_options();
	}

	public function modify_media_insert( $html, $attachment_id, $attachment ) {
		$mime_type = get_post_mime_type( $attachment_id );

		if ( substr( $mime_type, 0, 5 ) == 'video' ) {

			$videopack_postmeta = ( new Attachment_Meta( $this->options_manager ) )->get( $attachment_id );

			if ( $videopack_postmeta['embed'] == 'Single Video' ) {

				$source = new \Videopack\Video_Source\Source_Attachment_Local(
					$attachment_id,
					$this->options_manager
				);
				$url    = $source->get_url();

				$shortcode_atts = array(
					'id' => $attachment_id,
				);

				// Include poster only if set but without a poster-id.
				$poster    = get_post_meta( $attachment_id, '_kgflashmediaplayer-poster', true );
				$poster_id = get_post_meta( $attachment_id, '_kgflashmediaplayer-poster-id', true );
				if ( ! empty( $poster ) && empty( $poster_id ) ) {
					$shortcode_atts['poster'] = $poster;
				}

				// Only include legacy dimension attributes if enabled and different from defaults.
				if ( $this->options['legacy_dimensions'] ) {
					if ( ! empty( $videopack_postmeta['width'] )
						&& $videopack_postmeta['width'] != $this->options['width']
					) {
						$shortcode_atts['width'] = $videopack_postmeta['width'];
					}
					if ( ! empty( $videopack_postmeta['height'] )
						&& $videopack_postmeta['height'] != $this->options['height']
					) {
						$shortcode_atts['height'] = $videopack_postmeta['height'];
					}
				}

				/**
				 * Filter the shortcode attributes before building the shortcode string.
				 *
				 * @param array $shortcode_atts Associative array of attribute name => value.
				 * @param int   $attachment_id  The attachment ID.
				 * @param array $videopack_postmeta The attachment's Videopack metadata.
				 */
				$shortcode_atts = apply_filters(
					'videopack_insert_shortcode_atts',
					$shortcode_atts,
					$attachment_id,
					$videopack_postmeta
				);

				$html = '[videopack';
				foreach ( $shortcode_atts as $att_name => $att_value ) {
					$html .= ' ' . esc_attr( $att_name ) . '="' . esc_attr( $att_value ) . '"';
				}
				$html .= ']' . esc_url( $url ) . '[/videopack]<br />';

			} //if embed code is enabled

			if ( $videopack_postmeta['embed'] == 'Video Gallery' ) {

				$post      = get_post( $attachment_id );
				$parent_id = $post->post_parent;

				$html  = '';
				$html .= '[videopack gallery="true"';
				if ( ! empty( $videopack_postmeta['gallery_columns'] )
					&& $videopack_postmeta['gallery_columns'] != $this->options['gallery_columns']
				) {
					$html .= ' gallery_thumb="' . esc_attr( $videopack_postmeta['gallery_thumb'] ) . '"';
				}
				if ( ! empty( $videopack_postmeta['gallery_exclude'] ) ) {
					$html .= ' gallery_exclude="' . esc_attr( $videopack_postmeta['gallery_exclude'] ) . '"';
				}
				if ( ! empty( $videopack_postmeta['gallery_include'] ) ) {
					$html .= ' gallery_include="' . esc_attr( $videopack_postmeta['gallery_include'] ) . '"';
				}
				if ( ! empty( $videopack_postmeta['gallery_orderby'] )
					&& $videopack_postmeta['gallery_orderby'] != 'menu_order'
				) {
					$html .= ' gallery_orderby="' . esc_attr( $videopack_postmeta['gallery_orderby'] ) . '"';
				}
				if ( ! empty( $videopack_postmeta['gallery_order'] )
					&& $videopack_postmeta['gallery_order'] != 'ASC'
				) {
					$html .= ' gallery_order="' . esc_attr( $videopack_postmeta['gallery_order'] ) . '"';
				}
				if ( ! empty( $videopack_postmeta['gallery_id'] )
					&& $videopack_postmeta['gallery_id'] != $parent_id
				) {
					$html .= ' gallery_id="' . esc_attr( $videopack_postmeta['gallery_id'] ) . '"';
				}
				$html .= '][/videopack]';
			}
		}

		return $html;
	}

	public function add_embedurl_tab( $tabs ) {
		$tabs['embedurl']     = esc_html_x( 'Videopack URL', 'Title in "Add Media" popup sidebar', 'video-embed-thumbnail-generator' );
		$tabs['embedgallery'] = esc_html_x( 'Videopack Gallery', 'Title in "Add Media" popup sidebar', 'video-embed-thumbnail-generator' );
		$tabs['embedlist']    = esc_html_x( 'Videopack Video List', 'Title in "Add Media" popup sidebar', 'video-embed-thumbnail-generator' );
		return $tabs;
	}

	public function embedurl_page() {
		wp_enqueue_media();
		wp_enqueue_style( 'media-upload' );
		wp_enqueue_style( 'deprecated-media' );

		( new Assets( $this->options_manager ) )->enqueue_videopack_scripts();

		// Check if we have the new build asset for classic-embed.
		$script_path = VIDEOPACK_PLUGIN_DIR . 'admin-ui/build/classic-embed.js';
		$asset_path  = VIDEOPACK_PLUGIN_DIR . 'admin-ui/build/classic-embed.asset.php';
		if ( file_exists( $script_path ) && file_exists( $asset_path ) ) {
			$asset = include $asset_path;
			wp_enqueue_script(
				'videopack-classic-embed',
				plugins_url( '/admin-ui/build/classic-embed.js', VIDEOPACK_PLUGIN_FILE ),
				$asset['dependencies'],
				$asset['version'],
				true
			);

			$post_id    = filter_input( INPUT_GET, 'post_id', FILTER_SANITIZE_NUMBER_INT );
			$active_tab = filter_input( INPUT_GET, 'tab', FILTER_SANITIZE_SPECIAL_CHARS );

			// Extract attributes passed from TinyMCE plugin for editing.
			$edit_attributes = array();
			foreach ( $_GET as $key => $value ) {
				if ( strpos( $key, 'videopack_' ) === 0 ) {
					$clean_key                     = str_replace( 'videopack_', '', $key );
					$edit_attributes[ $clean_key ] = sanitize_text_field( $value );
				}
			}

			wp_localize_script(
				'videopack-classic-embed',
				'videopack_classic_embed_config',
				array(
					'options'        => $this->options,
					'postId'         => $post_id ? $post_id : 0,
					'activeTab'      => ( 'embedgallery' === $active_tab ) ? 'gallery' : ( ( 'embedlist' === $active_tab ) ? 'list' : 'single' ),
					'editAttributes' => $edit_attributes,
				)
			);

			// Ensure videopack_config is also available for components that need it.
			( new Ui( $this->options_manager ) )->localize_block_settings( 'videopack-classic-embed' );

			wp_enqueue_style(
				'videopack-classic-embed',
				plugins_url( '/admin-ui/build/classic-embed.css', VIDEOPACK_PLUGIN_FILE ),
				array( 'wp-components' ),
				$asset['version']
			);
		}

		media_upload_header();
		?>
		<div id="videopack-classic-embed-root"></div>
		<?php
	}

	public function embedurl_handle() {
		return wp_iframe( array( $this, 'embedurl_page' ) );
	}

	public function render_post( $post_id ) {

		if ( ! wp_is_post_revision( $post_id ) && ! wp_is_post_autosave( $post_id )
			&& ( $this->options['open_graph'] == true )
		) {
			// render the post when it's saved in case there's a do_shortcode call in it so open graph metadata makes it into wp_head()
			$response = wp_remote_get( get_permalink( $post_id ), array( 'blocking' => false ) );
		}
	}
}
