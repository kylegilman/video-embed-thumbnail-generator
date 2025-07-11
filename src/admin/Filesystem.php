<?php

namespace Videopack\Admin;

class Filesystem {

	public static function can_write_direct( $path ) {

		require_once ABSPATH . 'wp-admin/includes/file.php';

		if ( get_filesystem_method( array(), $path, true ) === 'direct' ) {
			$creds = request_filesystem_credentials( site_url() . '/wp-admin/', '', false, false, array() );
			if ( ! WP_Filesystem( $creds ) ) {
				return false;
			}
			return true;
		}

		return false;
	}
}
