<?php

namespace Videopack\Admin;

class Sanitize_Url {

	protected $url;

	public $noextension = '';
	public $basename = '';
	public $singleurl_id = '';
	public $movieurl = '';

	public function __construct( $url ) {
		$this->url = $url;
		$this->sanitize();
		$this->singleurl_id = 'singleurl_' . sanitize_key( $this->basename );
	}

	protected function sanitize() {

		$decoded_url    = rawurldecode( $this->url );
		$this->movieurl = esc_url_raw( $decoded_url );
		$parsed_url     = wp_parse_url( $decoded_url, PHP_URL_PATH );
		$path_info      = pathinfo( $parsed_url );

		if ( empty( $path_info['extension'] ) ) {
			$this->noextension = $this->url;
			$this->basename    = substr( $this->url, -20 );
			// Early return if no extension is found
			return;
		}

		$no_extension_url   = preg_replace( '/\\.[^.\\s]{3,4}$/', '', $decoded_url );
		$sanitized_basename = sanitize_file_name( $path_info['basename'] );
		$this->noextension  = $no_extension_url;
		$this->basename     = str_replace( '.' . $path_info['extension'], '', $sanitized_basename );
	}
}
