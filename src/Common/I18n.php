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

		load_plugin_textdomain(
			'video-embed-thumbnail-generator',
			false,
			(string) ( VIDEOPACK_PLUGIN_DIR . '/languages/' )
		);
	}

	/**
	 * Format the view count with internationalization.
	 *
	 * @param int|string $view_count The number of views.
	 * @return string The formatted view count.
	 */
	public static function format_view_count( $view_count ) {
		return (string) sprintf(
			/* translators: %s is the number of views. */
			(string) _n( '%s view', '%s views', (int) $view_count, 'video-embed-thumbnail-generator' ),
			(string) number_format_i18n( (int) $view_count )
		);
	}
}
