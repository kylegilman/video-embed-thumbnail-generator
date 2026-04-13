<?php
/**
 * Frontend template and embed handler.
 *
 * @package Videopack
 */

namespace Videopack\Frontend;

use Videopack\Common\Hook_Subscriber;

/**
 * Class Template
 *
 * Handles custom templates, oEmbed data, and video attachment redirects.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Frontend
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class Template implements Hook_Subscriber {

	/**
	 * Returns an array of actions to subscribe to.
	 *
	 * @return array
	 */
	public function get_actions(): array {
		return array(
			array(
				'hook'     => 'template_redirect',
				'callback' => 'attachment',
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
				'hook'          => 'oembed_response_data',
				'callback'      => 'change_oembed_data',
				'priority'      => 10,
				'accepted_args' => 4,
			),
			array(
				'hook'     => 'embed_template',
				'callback' => 'change_embed_template',
			),
			array(
				'hook'     => 'the_content',
				'callback' => 'filter_video_attachment_content',
			),
			array(
				'hook'          => 'redirect_canonical',
				'callback'      => 'redirect_canonical_attachment',
				'priority'      => 10,
				'accepted_args' => 2,
			),
		);
	}

	/**
	 * Video formats registry.
	 *
	 * @var \Videopack\Admin\Formats\Registry|null $format_registry
	 */
	protected $format_registry;

	/**
	 * Plugin options.
	 *
	 * @var array $options
	 */
	protected $options;

	/**
	 * Metadata handler.
	 *
	 * @var \Videopack\Frontend\Metadata $metadata
	 */
	protected $metadata;

	/**
	 * Constructor.
	 *
	 * @param array                                  $options         Videopack options array.
	 * @param \Videopack\Admin\Formats\Registry|null $format_registry Optional. Videopack video formats registry.
	 */
	public function __construct( array $options, \Videopack\Admin\Formats\Registry $format_registry = null ) {
		$this->options = $options;
		if ( ! $format_registry ) {
			$format_registry = new \Videopack\Admin\Formats\Registry( $options );
		}
		$this->format_registry = $format_registry;
		$this->metadata        = new \Videopack\Frontend\Metadata( $options, $format_registry );
	}

	/**
	 * Modifies oEmbed data to include Videopack video information.
	 *
	 * @param array         $data   The oEmbed data.
	 * @param \WP_Post|null $post   The post object.
	 * @param int           $width  The requested width.
	 * @param int           $height The requested height.
	 * @return array The modified oEmbed data.
	 */
	public function change_oembed_data( $data, $post = null, $width = 0, $height = 0 ) {
		$first_embedded_video = $this->metadata->get_first_embedded_video( $post );

		if ( ! empty( $data )
			&& ! empty( $first_embedded_video['url'] )
			&& ! empty( $this->options['oembed_provider'] )
		) {
			$data['type']          = 'video';
			$data['version']       = '1.0';
			$data['provider_name'] = (string) get_bloginfo( 'name' );
			$data['provider_url']  = (string) home_url();

			if ( ! empty( $first_embedded_video['poster'] ) ) {
				$data['thumbnail_url']    = (string) $first_embedded_video['poster'];
				$data['thumbnail_width']  = (int) ( $first_embedded_video['width'] ?? $width );
				$data['thumbnail_height'] = (int) ( $first_embedded_video['height'] ?? $height );
			}

			$embed_id = $first_embedded_video['id'] ?? ( $post instanceof \WP_Post ? $post->ID : 0 );
			if ( is_numeric( $embed_id ) && (int) $embed_id > 0 ) {
				$embed_url = add_query_arg( 'videopack[enable]', 'true', (string) get_attachment_link( (int) $embed_id ) );
			} else {
				$embed_url = (string) $first_embedded_video['url'];
			}

			$iframe_title = sprintf(
				/* translators: %s is the video title */
				__( 'Video Player - %s', 'video-embed-thumbnail-generator' ),
				(string) ( $first_embedded_video['title'] ?? ( $post instanceof \WP_Post ? $post->post_title : '' ) )
			);

			$allow_policy   = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen';
			$sandbox_policy = 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation allow-forms';

			$data['html'] = sprintf(
				'<iframe src="%1$s" width="%2$d" height="%3$d" style="border:0;" allow="%4$s" allowfullscreen credentialless sandbox="%5$s" loading="lazy" title="%6$s" referrerpolicy="strict-origin-when-cross-origin"></iframe>',
				esc_url( (string) $embed_url ),
				(int) $width,
				(int) $height,
				esc_attr( $allow_policy ),
				esc_attr( $sandbox_policy ),
				esc_attr( (string) $iframe_title )
			);
		}

		/**
		 * Filters the modified oEmbed data.
		 *
		 * @param array         $data   The oEmbed data.
		 * @param \WP_Post|null $post   The post object.
		 * @param int           $width  The width.
		 * @param int           $height The height.
		 */
		return (array) apply_filters( 'videopack_change_oembed_data', (array) $data, $post, $width, $height );
	}

	/**
	 * Filters the path of the current template for embed requests.
	 *
	 * @param string $template The path to the template.
	 * @return string The modified template path.
	 */
	public function change_embed_template( $template ) {

		$current_post = get_post();

		if ( ! empty( $this->options['oembed_provider'] ) ) {
			$first_embedded_video = $this->metadata->get_first_embedded_video( $current_post );
			if ( isset( $first_embedded_video['id'] ) ) {
				$template = __DIR__ . '/partials/embeddable-video.php';
			}
		}
		return (string) $template;
	}

	/**
	 * Filters the content of video attachments to display the Videopack player.
	 *
	 * @param string $content The attachment content.
	 * @return string The modified content.
	 */
	public function filter_video_attachment_content( $content ) {

		$post = get_post();

		if ( isset( $post )
			&& strpos( (string) $post->post_mime_type, 'video' ) !== false
		) {
			if ( doing_filter( 'get_the_excerpt' ) ) {
				return $content;
			}
			$videopack_query_var = get_query_var( 'videopack' ) ? get_query_var( 'videopack' ) : array();
			$content             = ( new Shortcode( $this->options ) )->generate_attachment_shortcode( $videopack_query_var );
			$content            .= '<p>' . $post->post_content . '</p>';
		}
		return (string) $content;
	}

	/**
	 * Checks if a redirect to a Videopack video should be enabled.
	 *
	 * @return array|bool The query variables if redirect is enabled, false otherwise.
	 */
	public function enable_redirect() {

		$videopack_query_var = get_query_var( 'videopack' ) ? get_query_var( 'videopack' ) : get_query_var( 'kgvid_video_embed' );
		$videopack_query_var = is_array( $videopack_query_var ) ? $videopack_query_var : array( 'enable' => (string) $videopack_query_var );

		// Default values.
		$videopack_query_var += array(
			'enable'   => 'false',
			'download' => 'false',
		);

		$post     = get_post();
		$is_video = is_attachment()
			&& $post instanceof \WP_Post
			&& property_exists( $post, 'post_mime_type' )
			&& strpos( (string) $post->post_mime_type, 'video' ) !== false;

		if ( ( $is_video
			&& (
				$videopack_query_var['enable'] === 'true'
				|| ( $videopack_query_var['download'] === 'true' && ! empty( $this->options['click_download'] ) )
			) )
			|| array_key_exists( 'sample', $videopack_query_var )
		) {
			return $videopack_query_var;
		}

		return false;
	}

	/**
	 * Filters the canonical redirect for attachments.
	 *
	 * @param string $redirect_url  The redirect URL.
	 * @param string $requested_url The requested URL.
	 * @return string The modified redirect URL.
	 */
	public function redirect_canonical_attachment( $redirect_url, $requested_url ) {

		if ( get_option( 'wp_attachment_pages_enabled' ) === '0'
			&& is_attachment() // Keep original logic.
			&& $this->enable_redirect() !== false
		) {
			// Return the original requested URL to cancel the redirect.
			return (string) $requested_url;
		}

		// If the query vars are not set, continue with the default redirection.
		return (string) $redirect_url;
	}

	/**
	 * Handles the video attachment templeting and downloads.
	 */
	public function attachment() {

		$videopack_query_var = $this->enable_redirect();

		if ( $videopack_query_var === false ) {
			return;
		}

		if ( is_array( $videopack_query_var ) && $videopack_query_var['enable'] === 'true' ) {
			include __DIR__ . '/partials/embeddable-video.php';
			exit;
		}

		if ( is_array( $videopack_query_var ) && $videopack_query_var['download'] === 'true' ) {

			$filepath = get_attached_file( get_the_ID() );
			if ( ! $filepath || ! file_exists( $filepath ) ) {
				return;
			}
			$filetype = wp_check_filetype( $filepath );
			if ( ! isset( $filetype['type'] ) ) {
				$filetype['type'] = 'application/octet-stream';
			}
			if ( isset( $_SERVER['HTTP_USER_AGENT'] ) ) {
				$user_agent = sanitize_text_field( wp_unslash( $_SERVER['HTTP_USER_AGENT'] ) );
			} else {
				$user_agent = 'Mozilla'; // Let's assume it's not IE.
			}

			// Generate the server headers.
			if ( strpos( $user_agent, 'MSIE' ) !== false ) {
				header( 'Content-Type: "' . esc_attr( $filetype['type'] ) . '"' );
				header( 'Content-Disposition: attachment; filename="' . esc_attr( basename( (string) $filepath ) ) . '"' );
				header( 'Expires: 0' );
				header( 'Cache-Control: must-revalidate, post-check=0, pre-check=0' );
				header( 'Content-Transfer-Encoding: binary' );
				header( 'Pragma: public' );
				header( 'Content-Length: ' . (string) filesize( $filepath ) );
			} else {
				header( 'Content-Type: "' . esc_attr( $filetype['type'] ) . '"' );
				header( 'Content-Disposition: attachment; filename="' . esc_attr( basename( (string) $filepath ) ) . '"' );
				header( 'Content-Transfer-Encoding: binary' );
				header( 'Expires: 0' );
				header( 'Pragma: no-cache' );
				header( 'Content-Length: ' . (string) filesize( $filepath ) );
			}

			$this->readfile_chunked( $filepath );
			exit;
		}
	}

	/**
	 * Sends large files in chunks so PHP doesn't timeout.
	 *
	 * @param string $file     The path to the file.
	 * @param bool   $retbytes Optional. Whether to return the number of bytes sent. Default is true.
	 * @return int|bool The number of bytes sent or success status.
	 */
	public function readfile_chunked( $file, $retbytes = true ) {
		$chunksize = 1 * ( 1024 * 1024 );
		$cnt       = 0;

		$handle = fopen( $file, 'r' );
		if ( $handle === false ) {
			return false;
		}

		/**
		 * Filter to start file download logging.
		 *
		 * @param bool   $log  Whether to log the download.
		 * @param string $file The file path.
		 */
		$download_log = apply_filters( 'videopack_file_download_logger_start', false, $file );

		$output_resource = fopen( 'php://output', 'w' );

		if ( $output_resource ) {
			while ( ! feof( $handle ) ) {
				$buffer = fread( $handle, $chunksize );
				if ( $buffer ) {
					fwrite( $output_resource, $buffer );
					if ( ob_get_length() ) {
						ob_flush();
						flush();
					}

					if ( $retbytes ) {
						$cnt += strlen( $buffer );
					}
				}
			}
			fclose( $output_resource );
		}

		$status = fclose( $handle );

		if ( $download_log ) {
			if ( (int) $cnt === (int) filesize( $file ) ) {
				$complete = true;
			} else {
				$complete = false;
			}
			/**
			 * Action to end file download logging.
			 *
			 * @param mixed $download_log The log identifier.
			 * @param bool  $complete     Whether the download was complete.
			 */
			do_action( 'videopack_file_download_logger_end', $download_log, $complete );
		}

		if ( $retbytes && $status ) {
			return $cnt;
		}

		return $status;
	}
}
