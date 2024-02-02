<?php

namespace Videopack\Frontend;

class Template {

	protected $options;
	protected $metadata;

	public function __construct( $options_manager ) {
		$this->options  = $options_manager->get_options();
		$this->metadata = new \Videopack\Frontend\Metadata( $options_manager );
	}

	public function change_oembed_data( $data, $post, $width, $height ) {

		$first_embedded_video = $this->metadata->get_first_embedded_video( $post );

		if ( ! empty( $data )
			&& ! empty( $first_embedded_video['url'] )
			&& $this->options['oembed_provider'] == true
		) {

			$data['type'] = 'video';

			if ( ! empty( $first_embedded_video['poster'] ) ) {
				$data['thumbnail_url'] = $first_embedded_video['poster'];
			}
		}

		return apply_filters( 'kgvid_change_oembed_data', $data, $post, $width, $height );
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

		$post    = get_post();

		if ( $this->options['template'] == 'gentle'
			&& isset( $post )
			&& strpos( $post->post_mime_type, 'video' ) !== false
		) {
			$kgvid_video_embed = array(); // no query set
			$content           = ( new Shortcode() )->generate_attachment_shortcode( $kgvid_video_embed );
			$content          .= '<p>' . $post->post_content . '</p>';
		}
		return $content;
	}

	public function enable_redirect() {

		$kgvid_video_embed = get_query_var( 'videopack' ) ? get_query_var( 'videopack' ) : get_query_var( 'kgvid_video_embed' );
		$kgvid_video_embed = is_array( $kgvid_video_embed ) ? $kgvid_video_embed : array( 'enable' => $kgvid_video_embed );

		// Default values
		$kgvid_video_embed += array(
			'enable'   => $this->options['template'] === 'old' ? 'true' : 'false',
			'download' => 'false',
		);

		// Update enable condition
		if ( $this->options['embeddable'] === 'false' &&
			! array_key_exists( 'sample', $kgvid_video_embed ) &&
			! array_key_exists( 'gallery', $kgvid_video_embed ) ) {
			$kgvid_video_embed['enable'] = 'false';
		}

		$post     = get_post();
		$is_video = is_attachment()
			&& is_object( $post )
			&& property_exists( $post, 'post_mime_type' )
			&& strpos( $post->post_mime_type, 'video' ) !== false;

		if ( $is_video
			&& (
				$kgvid_video_embed['enable'] === 'true'
				|| ( $kgvid_video_embed['download'] === 'true' && $this->options['click_download'] === 'on' )
			)
			|| array_key_exists( 'sample', $kgvid_video_embed )
		) {
			return $kgvid_video_embed;
		}

		return false;
	}

	public function redirect_canonical_attachment( $redirect_url, $requested_url ) {

		if ( get_option( 'wp_attachment_pages_enabled' ) === '0'
			&& is_attachment()
			&& $this->enable_redirect() !== false
		) {
			// Return the original requested URL to cancel the redirect.
			return $requested_url;
		}

		// If the query vars are not set, continue with the default redirection.
		return $redirect_url;
	}

	public function attachment() {

		$kgvid_video_embed = $this->enable_redirect();

		if ( $kgvid_video_embed === false ) {
			return;
		}

		if ( $kgvid_video_embed['enable'] === 'true' ) {
			include __DIR__ . '/partials/embeddable-video.php';
			exit;
		}

		if ( $kgvid_video_embed['download'] === 'true' ) {

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

		$download_log = apply_filters( 'kg_file_download_logger_start', false );

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
			do_action( 'kg_file_download_logger_end', $download_log, $complete );
		}

		if ( $retbytes && $status ) {
			return $cnt;
		}

		return $status;
	}
}
