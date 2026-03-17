<?php
/**
 * Admin URL sanitizer.
 *
 * @package Videopack
 * @subpackage Videopack/Admin
 */

namespace Videopack\Admin;

/**
 * Class Sanitize_Url
 *
 * Utility class for parsing and sanitizing video URLs.
 *
 * This class handles the extraction of file basenames and identifiers from
 * video URLs, ensuring they are properly sanitized for use in WordPress
 * meta keys and post identifiers.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Admin
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class Sanitize_Url {

	/**
	 * Original URL.
	 *
	 * @var string $url
	 */
	protected $url;

	/**
	 * URL without extension.
	 *
	 * @var string $noextension
	 */
	public $noextension = '';

	/**
	 * Basename of the URL without extension.
	 *
	 * @var string $basename
	 */
	public $basename = '';

	/**
	 * Unique ID based on the basename.
	 *
	 * @var string $singleurl_id
	 */
	public $singleurl_id = '';

	/**
	 * Escaped movie URL.
	 *
	 * @var string $movieurl
	 */
	public $movieurl = '';

	/**
	 * Constructor.
	 *
	 * @param string $url The URL to sanitize.
	 */
	public function __construct( $url ) {
		$this->url = (string) $url;
		$this->sanitize();
		$this->singleurl_id = (string) ( 'singleurl_' . sanitize_key( (string) $this->basename ) );
	}

	/**
	 * Sanitizes the URL and extracts basename and no-extension version.
	 *
	 * @return void
	 */
	protected function sanitize() {

		$decoded_url    = (string) rawurldecode( $this->url );
		$this->movieurl = (string) esc_url_raw( $decoded_url );
		$parsed_url     = (string) wp_parse_url( $decoded_url, PHP_URL_PATH );
		$path_info      = (array) pathinfo( $parsed_url );

		if ( empty( $path_info['extension'] ) ) {
			$this->noextension = $this->url;
			$this->basename    = (string) substr( $this->url, -20 );
			return;
		}

		$no_extension_url   = (string) preg_replace( '/\\.[^.\\s]{3,4}$/', '', $decoded_url );
		$sanitized_basename = (string) sanitize_file_name( (string) ( $path_info['basename'] ?? '' ) );
		$this->noextension  = (string) $no_extension_url;
		$this->basename     = (string) str_replace( '.' . (string) $path_info['extension'], '', $sanitized_basename );
	}
}
