<?php
/**
 * Admin edit posts handler.
 *
 * @package Videopack
 */

namespace Videopack\Admin;

use Videopack\Common\Hook_Subscriber;

/**
 * Class Edit_Posts
 *
 * Handles video insertion into the editor and custom media library tabs.
 *
 * This class provides functionality for modifying the HTML inserted into the
 * editor when a video attachment is selected, adding custom tabs to the media
 * library popup, and rendering the content for those tabs (Classic Editor support).
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Admin
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class Edit_Posts implements Hook_Subscriber {
	/**
	 * Plugin options.
	 *
	 * @var array $options
	 */
	protected $options;

	/**
	 * Video formats registry.
	 *
	 * @var \Videopack\Admin\Formats\Registry $format_registry
	 */
	protected $format_registry;

	/**
	 * Constructor.
	 *
	 * @param array                             $options         Plugin options.
	 * @param \Videopack\Admin\Formats\Registry $format_registry Video formats registry.
	 */
	public function __construct( array $options, \Videopack\Admin\Formats\Registry $format_registry = null ) {
		$this->options         = $options;
		$this->format_registry = $format_registry;
	}

	/**
	 * Returns an array of actions to subscribe to.
	 *
	 * @return array
	 */
	public function get_actions(): array {
		return array(
			array(
				'hook'     => 'media_upload_tabs',
				'callback' => 'add_embedurl_tab',
			),
			array(
				'hook'     => 'media_upload_embedurl',
				'callback' => 'embedurl_handle',
			),
			array(
				'hook'     => 'media_upload_embedgallery',
				'callback' => 'embedurl_handle',
			),
			array(
				'hook'     => 'media_upload_embedlist',
				'callback' => 'embedurl_handle',
			),
		);
	}

	/**
	 * Returns an array of filters to subscribe to.
	 *
	 * @return array
	 */
	public function get_filters(): array {
		return array(
			array(
				'hook'          => 'media_send_to_editor',
				'callback'      => 'modify_media_insert',
				'priority'      => 10,
				'accepted_args' => 3,
			),
		);
	}

	/**
	 * Modifies the HTML inserted into the editor for video attachments.
	 *
	 * @param string $html          The HTML to insert.
	 * @param int    $attachment_id The attachment ID.
	 * @param array  $attachment    The attachment array.
	 * @return string The modified HTML.
	 */
	public function modify_media_insert( $html, $attachment_id, $attachment ) {
		unset( $attachment );
		$mime_type = (string) get_post_mime_type( (int) $attachment_id );

		if ( 0 === strpos( $mime_type, 'video' ) ) {

			$videopack_postmeta = ( new Attachment_Meta( $this->options, (int) $attachment_id ) )->get();

			if ( (string) ( $videopack_postmeta['embed'] ?? '' ) === 'Single Video' ) {

				$source = new \Videopack\Video_Source\Source_Attachment_Local(
					(int) $attachment_id,
					$this->options,
					$this->format_registry
				);
				$url    = (string) $source->get_url();

				$shortcode_atts = array(
					'id' => (int) $attachment_id,
				);

				// Include poster only if set but without a poster-id.
				$poster    = (string) get_post_meta( (int) $attachment_id, '_kgflashmediaplayer-poster', true );
				$poster_id = (int) get_post_meta( (int) $attachment_id, '_kgflashmediaplayer-poster-id', true );
				if ( ! empty( $poster ) && empty( $poster_id ) ) {
					$shortcode_atts['poster'] = $poster;
				}

				// Only include legacy dimension attributes if enabled and different from defaults.
				if ( ! empty( $this->options['legacy_dimensions'] ) ) {
					if ( ! empty( $videopack_postmeta['width'] )
						&& (string) $videopack_postmeta['width'] !== (string) ( $this->options['width'] ?? '' )
					) {
						$shortcode_atts['width'] = (string) $videopack_postmeta['width'];
					}
					if ( ! empty( $videopack_postmeta['height'] )
						&& (string) $videopack_postmeta['height'] !== (string) ( $this->options['height'] ?? '' )
					) {
						$shortcode_atts['height'] = (string) $videopack_postmeta['height'];
					}
				}

				/**
				 * Filter the shortcode attributes before building the shortcode string.
				 *
				 * @param array $shortcode_atts     Associative array of attribute name => value.
				 * @param int   $attachment_id      The attachment ID.
				 * @param array $videopack_postmeta The attachment's Videopack metadata.
				 */
				$shortcode_atts = (array) apply_filters(
					'videopack_insert_shortcode_atts',
					$shortcode_atts,
					(int) $attachment_id,
					$videopack_postmeta
				);

				$html = '[videopack';
				foreach ( $shortcode_atts as $att_name => $att_value ) {
					$html .= ' ' . esc_attr( (string) $att_name ) . '="' . esc_attr( (string) $att_value ) . '"';
				}
				$html .= ']' . esc_url( $url ) . '[/videopack]<br />';

			}

			if ( (string) ( $videopack_postmeta['embed'] ?? '' ) === 'Video Gallery' ) {

				$post      = get_post( (int) $attachment_id );
				$parent_id = $post instanceof \WP_Post ? (int) $post->post_parent : 0;

				$html  = '';
				$html .= '[videopack gallery="true"';
				if ( ! empty( $videopack_postmeta['gallery_columns'] )
					&& (int) $videopack_postmeta['gallery_columns'] !== (int) ( $this->options['gallery_columns'] ?? 4 )
				) {
					$html .= ' gallery_columns="' . esc_attr( (string) $videopack_postmeta['gallery_columns'] ) . '"';
				}
				if ( ! empty( $videopack_postmeta['gallery_exclude'] ) ) {
					$html .= ' gallery_exclude="' . esc_attr( (string) $videopack_postmeta['gallery_exclude'] ) . '"';
				}
				if ( ! empty( $videopack_postmeta['gallery_include'] ) ) {
					$html .= ' gallery_include="' . esc_attr( (string) $videopack_postmeta['gallery_include'] ) . '"';
				}
				if ( ! empty( $videopack_postmeta['gallery_orderby'] )
					&& (string) $videopack_postmeta['gallery_orderby'] !== 'menu_order'
				) {
					$html .= ' gallery_orderby="' . esc_attr( (string) $videopack_postmeta['gallery_orderby'] ) . '"';
				}
				if ( ! empty( $videopack_postmeta['gallery_order'] )
					&& (string) $videopack_postmeta['gallery_order'] !== 'asc'
				) {
					$html .= ' gallery_order="' . esc_attr( (string) $videopack_postmeta['gallery_order'] ) . '"';
				}
				if ( ! empty( $videopack_postmeta['gallery_id'] )
					&& (int) $videopack_postmeta['gallery_id'] !== $parent_id
				) {
					$html .= ' gallery_id="' . esc_attr( (string) $videopack_postmeta['gallery_id'] ) . '"';
				}
				$html .= '][/videopack]';
			}
		}

		return (string) $html;
	}

	/**
	 * Adds Videopack tabs to the media library popup.
	 *
	 * @param array $tabs The existing tabs.
	 * @return array The updated tabs.
	 */
	public function add_embedurl_tab( $tabs ) {
		$tabs['embedurl']     = (string) esc_html_x( 'Videopack URL', 'Title in "Add Media" popup sidebar', 'video-embed-thumbnail-generator' );
		$tabs['embedgallery'] = (string) esc_html_x( 'Videopack Gallery', 'Title in "Add Media" popup sidebar', 'video-embed-thumbnail-generator' );
		$tabs['embedlist']    = (string) esc_html_x( 'Videopack Video List', 'Title in "Add Media" popup sidebar', 'video-embed-thumbnail-generator' );
		return (array) $tabs;
	}

	/**
	 * Outputs the content for the Videopack URL/Gallery tabs.
	 */
	public function embedurl_page() {
		wp_enqueue_media();
		wp_enqueue_style( 'media-upload' );
		wp_enqueue_style( 'deprecated-media' );

		$assets = new Assets( $this->options );
		$assets->enqueue_videopack_scripts();
		$assets->enqueue_classic_editor_assets();

		$post_id    = (int) filter_input( INPUT_GET, 'post_id', FILTER_SANITIZE_NUMBER_INT );
		$active_tab = (string) filter_input( INPUT_GET, 'tab', FILTER_SANITIZE_SPECIAL_CHARS );

		// Extract attributes passed from TinyMCE plugin for editing.
		$edit_attributes = array();

		// Detect if editing parameters are present.
		$has_edit_attributes = false;
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Only checking keys to determine if nonce verification is required for TinyMCE edit.
		foreach ( $_GET as $key => $value ) {
			if ( 0 === strpos( (string) $key, 'videopack_' ) && 'videopack_nonce' !== $key ) {
				$has_edit_attributes = true;
				break;
			}
		}

		if ( $has_edit_attributes ) {
			check_admin_referer( 'videopack_classic_embed', 'videopack_nonce' );
			foreach ( $_GET as $key => $value ) {
				if ( 0 === strpos( (string) $key, 'videopack_' ) && 'videopack_nonce' !== $key ) {
					$clean_key                     = (string) str_replace( 'videopack_', '', (string) $key );
					$edit_attributes[ $clean_key ] = (string) sanitize_text_field( (string) $value );
				}
			}
		}

		wp_localize_script(
			'videopack-classic-editor',
			'videopack_classic_editor_config',
			array(
				'options'        => (array) $this->options,
				'postId'         => $post_id ? $post_id : 0,
				'activeTab'      => ( 'embedgallery' === $active_tab ) ? 'gallery' : ( ( 'embedlist' === $active_tab ) ? 'list' : 'single' ),
				'editAttributes' => $edit_attributes,
			)
		);

		// Ensure videopack_config is also available for components that need it.
		( new \Videopack\Admin\Ui( $this->options, $this->format_registry ) )->localize_block_settings( 'videopack-classic-editor' );

		media_upload_header();
		?>
		<div id="videopack-classic-embed-root"></div>
		<?php
		if ( function_exists( 'wp_print_media_templates' ) ) {
			wp_print_media_templates();
		}
	}

	/**
	 * Handles the iframe for the Videopack tabs.
	 *
	 * @return mixed Result of wp_iframe call.
	 */
	public function embedurl_handle() {
		return wp_iframe( array( $this, 'embedurl_page' ) );
	}
}
