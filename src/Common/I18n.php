<?php

namespace Videopack\Common;

/**
 * Define the internationalization functionality.
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/includes
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class I18n {

	/**
	 * Load the plugin text domain for translation.
	 *
	 * @since    5.0.0
	 */
	public function load_plugin_textdomain() {

		load_plugin_textdomain(
			'video-embed-thumbnail-generator',
			false,
			VIDEOPACK_PLUGIN_DIR . '/languages/'
		);
	}
}
