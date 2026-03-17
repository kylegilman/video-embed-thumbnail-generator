<?php
/**
 * Admin filesystem utility.
 *
 * @package Videopack
 */

namespace Videopack\Admin;

/**
 * Class Filesystem
 *
 * Provides utility methods for handling WordPress filesystem operations.
 *
 * This class abstracts the complexity of checking filesystem permissions
 * and initializing the WordPress Filesystem API for direct file operations.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Admin
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class Filesystem {

	/**
	 * Checks if the filesystem can be written to directly.
	 *
	 * This method ensures that the WordPress Filesystem API is initialized
	 * and that the 'direct' method is available for the given path.
	 *
	 * @param string $path The path to check for write access.
	 * @return bool True if direct writing is possible, false otherwise.
	 */
	public static function can_write_direct( $path ) {
		$path = (string) $path;

		if ( ! function_exists( 'get_filesystem_method' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
		}

		if ( 'direct' === get_filesystem_method( array(), $path, true ) ) {
			$creds = (array) request_filesystem_credentials( (string) site_url() . '/wp-admin/', '', false, false, array() );
			if ( ! WP_Filesystem( $creds ) ) {
				return false;
			}
			return true;
		}

		return false;
	}
}
