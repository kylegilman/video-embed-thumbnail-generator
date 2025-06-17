<?php

namespace Videopack\Admin;

class Ui {

	protected $options_manager;

	/**
	 * Initialize the class.
	 *
	 * @param Options $options_manager The options manager instance.
	 */
	public function __construct( Options $options_manager ) {
		$this->options_manager = $options_manager;
	}

	public function block_init() {

		$shortcode       = new \Videopack\Frontend\Shortcode( $this->options_manager );
		$default_atts    = $shortcode->atts( '' );
		$attachment_meta = new \Videopack\Admin\Attachment_Meta( $this->options_manager );
		$default_atts    = array_merge( $default_atts, $attachment_meta->get_defaults() );
		$attributes      = array();

		$type_number = array(
			'id',
			'numberofthumbs',
			'width',
			'height',
		);
		foreach ( $default_atts as $att => $value ) {
			$att_type = 'string';
			if ( $value === true ) {
				$value = 'true';
			}
			if ( $value === 'true' || $value === 'false' ) {
				$value    = filter_var( $value, FILTER_VALIDATE_BOOLEAN );
				$att_type = 'boolean';
			}
			if ( in_array( $att, $type_number ) ) {
				$att_type = 'number';
				$value    = intval( $value );
			}
			$attributes[ $att ] = array(
				'type'    => $att_type,
				'default' => $value,
			);
		}
		$attributes['align']['default'] = 'full';

		$extra_attributes = array(
			'src'        => array(
				'type' => 'string',
			),
			'poster_id'  => array(
				'type' => 'number',
			),
			'videoTitle' => array(
				'type' => 'string',
			),
		);
		$attributes       = array_merge( $attributes, $extra_attributes );

		register_block_type(
			__DIR__,
			array(
				'attributes' => $attributes,
			)
		);
	}

	public function enqueue_block_assets() {
		$player = \Videopack\Frontend\Video_Players\Player_Factory::create( $this->options_manager );
		$player->enqueue_styles();
		$player->enqueue_scripts();
		wp_enqueue_script( 'video-quality-selector' );

		wp_set_script_translations( 'videopack/videopack-block', 'video-embed-thumbnail-generator' );
	}

	public function enqueue_settings( $hook_suffix ) {

		if ( $hook_suffix === 'settings_page_video_embed_thumbnail_generator_settings' ) {

			$script_asset_path = __DIR__ . '/build/settings.asset.php';
			$settings_js       = 'build/settings.js';
			$script_asset      = require $script_asset_path;

			wp_enqueue_script(
				'videopack-settings',
				plugins_url( $settings_js, __FILE__ ),
				$script_asset['dependencies'],
				$script_asset['version'],
				true
			);
			wp_set_script_translations( 'videopack-settings', 'video-embed-thumbnail-generator' );

			$codecs      = $this->options_manager->get_video_codecs();
			$codec_array = array();
			foreach ( $codecs as $codec => $codec_class ) {
				$codec_array[ $codec ] = $codec_class->get_properties();
			}
			$inline_data = 'var videopack = videopack || {};
			videopack.settings = ' . wp_json_encode(
				array(
					'url'         => plugins_url( dirname( VIDEOPACK_BASENAME ) ),
					'codecs'      => $codec_array,
					'resolutions' => $this->options_manager->get_video_resolutions(),
				)
			) . ';';
			wp_add_inline_script( 'videopack-settings', $inline_data );

			$settings_css = 'build/settings.css';
			wp_enqueue_style(
				'videopack-settings',
				plugins_url( $settings_css, __FILE__ ),
				array( 'wp-components' ),
				filemtime( __DIR__ . '/$settings_css' )
			);
		}
	}

	public function enqueue_attachment_details() {

		$script_asset_path     = __DIR__ . '/build/attachment-details.asset.php';
		$attachment_details_js = 'build/attachment-details.js';
		$script_asset          = require $script_asset_path;

		wp_enqueue_script(
			'videopack-attachment-details',
			plugins_url( $attachment_details_js, __FILE__ ),
			$script_asset['dependencies'],
			$script_asset['version'],
			true
		);
		wp_set_script_translations( 'attachment-details', 'video-embed-thumbnail-generator' );

		$attachment_details_css = 'build/attachment-details.css';
		wp_enqueue_style(
			'videopack-attachment-details',
			plugins_url( $attachment_details_css, __FILE__ ),
			array( 'wp-components' ),
			filemtime( __DIR__ . '/$attachment_details_css' )
		);
	}
}
