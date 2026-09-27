<?php
/**
 * Internationalization functionality for the plugin.
 *
 * @package Videopack
 */

namespace Videopack\Common;

/**
 * Class I18n
 *
 * Define the internationalization functionality.
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Common
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class I18n {

	/**
	 * Load the plugin text domain for translation.
	 *
	 * @since    5.0.0
	 * @return void
	 */
	public function load_plugin_textdomain() {

		// The third argument must be relative to WP_PLUGIN_DIR, not absolute --
		// passing VIDEOPACK_PLUGIN_DIR here silently doubled the path and made
		// this plugin's own bundled languages/ files unloadable.
		load_plugin_textdomain(
			'video-embed-thumbnail-generator',
			false,
			dirname( VIDEOPACK_BASENAME ) . '/languages'
		);
	}

	/**
	 * Format the view count with internationalization.
	 *
	 * @param int|string $views The number of views.
	 * @return string The formatted view count.
	 */
	public static function format_view_count( $views ) {
		return (string) sprintf(
			/* translators: %s is the number of views. */
			(string) _n( '%s view', '%s views', (int) $views, 'video-embed-thumbnail-generator' ),
			(string) number_format_i18n( (int) $views )
		);
	}
}
