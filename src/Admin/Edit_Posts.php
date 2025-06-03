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

			$kgvid_postmeta = ( new Attachment_Meta( $this->options_manager ) )->get( $attachment_id );

			if ( $kgvid_postmeta['embed'] == 'Single Video' ) {
				$html                        = '';
				$kgvid_postmeta['url']       = apply_filters( 'videopack_send_to_editor_url', wp_get_attachment_url( $attachment_id ) );
				$kgvid_postmeta['title']     = get_the_title( $attachment_id );
				$kgvid_postmeta['poster']    = get_post_meta( $attachment_id, '_kgflashmediaplayer-poster', true );
				$kgvid_postmeta['poster-id'] = get_post_meta( $attachment_id, '_kgflashmediaplayer-poster-id', true );

				$html .= '[videopack id="' . esc_attr( $attachment_id ) . '"';
				if ( ! empty( $kgvid_postmeta['poster'] ) && empty( $kgvid_postmeta['poster-id'] ) ) {
					$html .= ' poster="' . esc_url( $kgvid_postmeta['poster'] ) . '"';
				}

				$insert_shortcode_atts = apply_filters(
					'videopack_insert_shortcode_atts',
					array(
						'width',
						'height',
					)
				);

				foreach ( $insert_shortcode_atts as $att ) {
					if ( array_key_exists( $att, $kgvid_postmeta ) && ! empty( $kgvid_postmeta[ $att ] ) ) {
						$html .= ' ' . esc_attr( $att ) . '="' . esc_attr( $kgvid_postmeta[ $att ] ) . '"';
					}
				}

				$html .= ']' . esc_url( $kgvid_postmeta['url'] ) . '[/videopack]<br />';
			} //if embed code is enabled

			if ( $kgvid_postmeta['embed'] == 'Video Gallery' ) {

				$post      = get_post( $attachment_id );
				$parent_id = $post->post_parent;

				$html  = '';
				$html .= '[videopack gallery="true"';
				if ( ! empty( $kgvid_postmeta['gallery_columns'] )
					&& $kgvid_postmeta['gallery_columns'] != $this->options['gallery_columns']
				) {
					$html .= ' gallery_thumb="' . esc_attr( $kgvid_postmeta['gallery_thumb'] ) . '"';
				}
				if ( ! empty( $kgvid_postmeta['gallery_exclude'] ) ) {
					$html .= ' gallery_exclude="' . esc_attr( $kgvid_postmeta['gallery_exclude'] ) . '"';
				}
				if ( ! empty( $kgvid_postmeta['gallery_include'] ) ) {
					$html .= ' gallery_include="' . esc_attr( $kgvid_postmeta['gallery_include'] ) . '"';
				}
				if ( ! empty( $kgvid_postmeta['gallery_orderby'] )
					&& $kgvid_postmeta['gallery_orderby'] != 'menu_order'
				) {
					$html .= ' gallery_orderby="' . esc_attr( $kgvid_postmeta['gallery_orderby'] ) . '"';
				}
				if ( ! empty( $kgvid_postmeta['gallery_order'] )
					&& $kgvid_postmeta['gallery_order'] != 'ASC'
				) {
					$html .= ' gallery_order="' . esc_attr( $kgvid_postmeta['gallery_order'] ) . '"';
				}
				if ( ! empty( $kgvid_postmeta['gallery_id'] )
					&& $kgvid_postmeta['gallery_id'] != $parent_id
				) {
					$html .= ' gallery_id="' . esc_attr( $kgvid_postmeta['gallery_id'] ) . '"';
				}
				$html .= '][/videopack]';
			}
		}

		return $html;
	}

	public function add_embedurl_tab( $tabs ) {
		$newtab = array( 'embedurl' => esc_html_x( 'Embed Video from URL', 'Title in "Add Media" popup sidebar', 'video-embed-thumbnail-generator' ) );
		if ( is_array( $tabs ) ) {
			return array_merge( $tabs, $newtab );
		} else {
			return $newtab;
		}
	}

	public function embedurl_page() {

		( new Assets( $this->options_manager ) )->enqueue_videopack_scripts();

		$checkboxes = kgvid_generate_encode_checkboxes( '', 'singleurl', 'attachment' );
		$maxheight  = $this->options['height'];
		$maxwidth   = $this->options['width'];

		media_upload_header();

		include __DIR__ . '/partials/embed-url-page.php';
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
