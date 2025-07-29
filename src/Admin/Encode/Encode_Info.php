<?php

namespace Videopack\Admin\Encode;

class Encode_Info {

	public $url;
	public $basename;
	public $path;
	public $exists = false;
	public $writable = false;
	public $sameserver = false;
	public $deletable = false;
	public $width;
	public $height;
	public $id;

	protected $movieurl;
	protected $is_attachment = false;
	protected $format;
	protected $uploads;
	protected $sanitized_url;

	public function __construct(
		$id,
		string $input_url,
		bool $is_attachment,
		\Videopack\Admin\Formats\Video_Format $format
	) {
		$this->id            = $id;
		$this->sanitized_url = new \Videopack\Admin\Sanitize_Url( $input_url );
		$this->movieurl      = $this->sanitized_url->movieurl;
		$this->basename      = $this->sanitized_url->basename;
		$this->is_attachment = $is_attachment;
		$this->format        = $format;
		$this->uploads       = wp_upload_dir();
		$this->path          = $this->uploads['path'] . '/';

		$this->set_encode_info();
	}

	protected function set_encode_info() {

		$children = $this->get_attachment_children();
		if ( $children ) {
			$this->process_children( $children );
		}

		if ( ! $this->exists ) {
			$this->check_potential_locations();
		}

		if ( ! $this->exists ) {
			$this->set_default_url_and_path();
		}
	}

	protected function get_attachment_children() {
		if ( $this->is_attachment ) {
			$args = array(
				'numberposts' => '-1',
				'post_parent' => $this->id,
				'post_type'   => 'attachment',
			);
		} else {
			$args = array(
				'numberposts' => '-1',
				'post_type'   => 'attachment',
				'meta_key'    => '_kgflashmediaplayer-externalurl',
				'meta_value'  => $this->sanitized_url->movieurl,
			);
		}

		$children = get_posts( $args );

		return $children;
	}

	protected function process_children( array $children ) {

		foreach ( $children as $child ) {
			$wp_attached_file = get_attached_file( $child->ID );
			$video_meta       = wp_get_attachment_metadata( $child->ID );
			$meta_format      = get_post_meta( $child->ID, '_kgflashmediaplayer-format', true );

			if ( $meta_format == $this->format->get_id()
				|| $meta_format == $this->format->get_legacy_id()
				|| (
					substr( $wp_attached_file, -strlen( $this->format->get_suffix() ) ) === $this->format->get_suffix()
					&& $meta_format == false
				)
			) {
				$this->url        = wp_get_attachment_url( $child->ID );
				$this->path       = $wp_attached_file;
				$this->id         = $child->ID;
				$this->exists     = true;
				$this->writable   = true;
				$this->sameserver = true;

				if ( $child->post_author === get_current_user_id()
					|| current_user_can( 'edit_others_video_encodes' )
				) {
					$this->deletable = true;
				}

				if ( is_array( $video_meta ) && array_key_exists( 'width', $video_meta ) ) {
					$this->width = $video_meta['width'];
				}
				if ( is_array( $video_meta ) && array_key_exists( 'height', $video_meta ) ) {
					$this->height = $video_meta['height'];
				}
				break;
			}
		}
	}

	protected function check_potential_locations() {

		$potential_locations['same_directory'] = array(
			'url'  => $this->sanitized_url->noextension . $this->format->get_suffix(),
			'path' => $this->path . $this->basename . $this->format->get_suffix(),
		);
		if ( $this->format->get_legacy_suffix() ) {
			$potential_locations['html5encodes']              = array(
				'url'  => $this->uploads['baseurl'] . '/html5encodes/' . $this->basename . $this->format->get_legacy_suffix(),
				'path' => $this->uploads['basedir'] . '/html5encodes/' . $this->basename . $this->format->get_legacy_suffix(),
			);
			$potential_locations['same_directory_old_suffix'] = array(
				'url'  => $this->sanitized_url->noextension . $this->format->get_legacy_suffix(),
				'path' => $this->path . $this->basename . $this->format->get_legacy_suffix(),
			);
		}

		foreach ( $potential_locations as $name => $location ) {
			if ( file_exists( $location['path'] ) ) {
				$this->exists = true;
				$this->url    = $location['url'];
				$this->path   = $location['path'];
				require_once ABSPATH . 'wp-admin/includes/file.php';
				if ( get_filesystem_method( array(), $location['path'], true ) === 'direct' ) {
					$this->writable = true;
				}
				break;
			} elseif ( ! empty( $this->id )
				&& ! $this->sameserver
				&& $name !== 'html5encodes'
			) {
				$this->check_url_exists( $location['url'] );
			}
		}
	}

	protected function check_url_exists( $url ) {

		$already_checked_url = get_post_meta( $this->id, '_kgflashmediaplayer-' . $this->sanitized_url->singleurl_id . '-' . $this->format->get_id(), true );
		if ( empty( $already_checked_url ) ) {
			if ( $this->get_headers( esc_url_raw( str_replace( ' ', '%20', $url ) ) ) ) {
				$this->exists = true;
				$this->url    = $url;
				update_post_meta( $this->id, '_kgflashmediaplayer-' . $this->sanitized_url->singleurl_id . '-' . $this->format->get_id(), $this->url );
			} else {
				update_post_meta( $this->id, '_kgflashmediaplayer-' . $this->sanitized_url->singleurl_id . '-' . $this->format->get_id(), 'not found' );
			}
		} elseif ( substr( $already_checked_url, 0, 4 ) == 'http' ) {
			$this->exists = true;
			$this->url    = $already_checked_url;
		}
	}

	protected function get_headers( $url ) {

		$ssl_context_options = array(
			'ssl' => array(
				'verify_peer'      => false,
				'verify_peer_name' => false,
			),
		);
		$ssl_context         = stream_context_create( $ssl_context_options );

		$hdrs = @get_headers( $url, 0, $ssl_context );

		return is_array( $hdrs ) ? preg_match( '/^HTTP\\/\\d+\\.\\d+\\s+2\\d\\d\\s+.*$/', $hdrs[0] ) : false;
	}

	protected function set_default_url_and_path() {

		$moviefilename = $this->basename . $this->format->get_suffix();
		require_once ABSPATH . 'wp-admin/includes/file.php';
		if ( get_post_type( $this->id ) == 'attachment'
			&& get_filesystem_method( array(), $this->path, true ) === 'direct'
		) {
			$this->url  = $this->sanitized_url->noextension . $this->format->get_suffix();
			$this->path = $this->path . $moviefilename;
		} else {
			$this->url  = $this->uploads['url'] . '/' . $moviefilename;
			$this->path = $this->uploads['path'] . '/' . $moviefilename;
		}
	}
}
