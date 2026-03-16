<?php

namespace Videopack\Frontend;

class Template {

	/**
	 * Videopack Options manager class instance
	 * @var \Videopack\Admin\Options $options_manager
	 */
	protected $options_manager;
	protected $options;
	protected $metadata;

	public function __construct( \Videopack\Admin\Options $options_manager ) {
		$this->options_manager = $options_manager;
		$this->options         = $options_manager->get_options();
		$this->metadata        = new \Videopack\Frontend\Metadata( $options_manager );
	}

	public function change_oembed_data( $data, $post, $width, $height ) {
		$first_embedded_video = $this->metadata->get_first_embedded_video( $post );

		if ( ! empty( $data )
			&& ! empty( $first_embedded_video['url'] )
			&& $this->options['oembed_provider'] === true
		) {
			$data['type']          = 'video';
			$data['version']       = '1.0';
			$data['provider_name'] = get_bloginfo( 'name' );
			$data['provider_url']  = home_url();

			if ( ! empty( $first_embedded_video['poster'] ) ) {
				$data['thumbnail_url']    = $first_embedded_video['poster'];
				$data['thumbnail_width']  = $width;
				$data['thumbnail_height'] = $height;
			}

			$embed_id = $first_embedded_video['id'] ?? ( is_object( $post ) ? $post->ID : $post );
			if ( is_numeric( $embed_id ) ) {
				$embed_url = add_query_arg( 'videopack[enable]', 'true', get_attachment_link( $embed_id ) );
			} else {
				$embed_url = $first_embedded_video['url'];
			}

			$iframe_title = sprintf(
				/* translators: %s is the video title */
				__( 'Video Player - %s', 'video-embed-thumbnail-generator' ),
				$first_embedded_video['title'] ?? ( is_object( $post ) ? $post->post_title : '' )
			);

			$data['html'] = sprintf(
				'<iframe src="%1$s" width="%2$d" height="%3$d" style="border:0;" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy" title="%4$s" referrerpolicy="strict-origin-when-cross-origin"></iframe>',
				esc_url( $embed_url ),
				esc_attr( $width ),
				esc_attr( $height ),
				esc_attr( $iframe_title )
			);
		}

		return apply_filters( 'videopack_change_oembed_data', $data, $post, $width, $height );
	}

	public function change_embed_template( $template ) {

		$current_post = get_post();

		if ( $this->options['oembed_provider'] === true ) {
			$first_embedded_video = $this->metadata->get_first_embedded_video( $current_post );
			if ( array_key_exists( 'id', $first_embedded_video ) ) {
				$template = __DIR__ . '/partials/embeddable-video.php';
			}
		}
		return $template;
	}

	public function filter_video_attachment_content( $content ) {

		$post = get_post();

		if ( isset( $post )
			&& strpos( $post->post_mime_type, 'video' ) !== false
		) {
			if ( doing_filter( 'get_the_excerpt' ) ) {
				return $content;
			}
			$videopack_query_var = array(); // No query set.
			$content             = ( new Shortcode( $this->options_manager ) )->generate_attachment_shortcode( $videopack_query_var );
			$content          .= '<p>' . $post->post_content . '</p>';
		}
		return $content;
	}

	public function enable_redirect() {

		$videopack_query_var = get_query_var( 'videopack' ) ? get_query_var( 'videopack' ) : get_query_var( 'kgvid_video_embed' );
		$videopack_query_var = is_array( $videopack_query_var ) ? $videopack_query_var : array( 'enable' => $videopack_query_var );

		// Default values.
		$videopack_query_var += array(
			'enable'   => 'false',
			'download' => 'false',
		);

		$post     = get_post();
		$is_video = is_attachment()
			&& is_object( $post )
			&& property_exists( $post, 'post_mime_type' )
			&& strpos( $post->post_mime_type, 'video' ) !== false;

		if ( ( $is_video
			&& (
				$videopack_query_var['enable'] === 'true'
				|| ( $videopack_query_var['download'] === 'true' && $this->options['click_download'] === true )
			) )
			|| array_key_exists( 'sample', $videopack_query_var )
		) {
			return $videopack_query_var;
		}

		return false;
	}

	public function redirect_canonical_attachment( $redirect_url, $requested_url ) {

		if ( get_option( 'wp_attachment_pages_enabled' ) === '0'
			&& is_attachment() // Keep original logic
			&& $this->enable_redirect() !== false
		) {
			// Return the original requested URL to cancel the redirect.
			return $requested_url;
		}

		// If the query vars are not set, continue with the default redirection.
		return $redirect_url;
	}

	public function attachment() {

		$videopack_query_var = $this->enable_redirect();

		if ( $videopack_query_var === false ) {
			return;
		}

		if ( $videopack_query_var['enable'] === 'true' ) {
			include __DIR__ . '/partials/embeddable-video.php';
			exit;
		}

		if ( $videopack_query_var['download'] === 'true' ) {

			$filepath = get_attached_file( get_the_ID() );
			$filetype = wp_check_filetype( $filepath );
			if ( ! isset( $filetype['type'] ) ) {
				$filetype['type'] = 'application/octet-stream';
			}
			if ( isset( $_SERVER['HTTP_USER_AGENT'] ) ) {
				$user_agent = sanitize_text_field( wp_unslash( $_SERVER['HTTP_USER_AGENT'] ) );
			} else {
				$user_agent = 'Mozilla'; // let's assume it's not IE
			}

			// Generate the server headers
			if ( strpos( $user_agent, 'MSIE' ) !== false ) {
				header( 'Content-Type: "' . esc_attr( $filetype['type'] ) . '"' );
				header( 'Content-Disposition: attachment; filename="' . esc_attr( basename( $filepath ) ) . '"' );
				header( 'Expires: 0' );
				header( 'Cache-Control: must-revalidate, post-check=0, pre-check=0' );
				header( 'Content-Transfer-Encoding: binary' );
				header( 'Pragma: public' );
				header( 'Content-Length: ' . esc_attr( filesize( $filepath ) ) );
			} else {
				header( 'Content-Type: "' . esc_attr( $filetype['type'] ) . '"' );
				header( 'Content-Disposition: attachment; filename="' . esc_attr( basename( $filepath ) ) . '"' );
				header( 'Content-Transfer-Encoding: binary' );
				header( 'Expires: 0' );
				header( 'Pragma: no-cache' );
				header( 'Content-Length: ' . esc_attr( filesize( $filepath ) ) );
			}

			$this->readfile_chunked( $filepath );
			exit;
		}
	}

	public function readfile_chunked( $file, $retbytes = true ) {
		// sends large files in chunks so PHP doesn't timeout

		$chunksize = 1 * ( 1024 * 1024 );
		$buffer    = '';
		$cnt       = 0;

		$handle = fopen( $file, 'r' );
		if ( $handle === false ) {
			return false;
		}

		$download_log = apply_filters( 'videopack_file_download_logger_start', false );

		$output_resource = fopen( 'php://output', 'w' );

		while ( ! feof( $handle ) ) {

			$buffer = fread( $handle, $chunksize );
			fwrite( $output_resource, $buffer );
			if ( ob_get_length() ) {
				ob_flush();
				flush();
			}

			if ( $retbytes ) {
				$cnt += strlen( $buffer );
			}
		}

		$status = fclose( $handle );

		if ( $download_log ) {
			if ( $cnt == filesize( $file ) ) {
				$complete = true;
			} else {
				$complete = false;
			}
			do_action( 'videopack_file_download_logger_end', $download_log, $complete );
		}

		if ( $retbytes && $status ) {
			return $cnt;
		}

		return $status;
	}
}
