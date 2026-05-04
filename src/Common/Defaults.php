<?php
/**
 * Global defaults for Videopack.
 *
 * @package Videopack
 * @subpackage Videopack/Common
 */

namespace Videopack\Common;

/**
 * Class Defaults
 *
 * Provides a single source of truth for global plugin defaults and attribute fallbacks.
 */
class Defaults {

	/**
	 * Returns the global plugin defaults.
	 *
	 * @param array $options Plugin options.
	 * @return array
	 */
	public static function get_all( array $options = array() ) {
		return array(
			'title_color'                   => (string) ( $options['title_color'] ?? '' ),
			'title_background_color'        => (string) ( $options['title_background_color'] ?? '' ),
			'pagination_color'              => (string) ( $options['pagination_color'] ?? '' ),
			'pagination_background_color'   => (string) ( $options['pagination_background_color'] ?? '' ),
			'pagination_active_bg_color'    => (string) ( $options['pagination_active_bg_color'] ?? '' ),
			'pagination_active_color'       => (string) ( $options['pagination_active_color'] ?? '' ),
			'play_button_color'             => (string) ( $options['play_button_color'] ?? '' ),
			'play_button_secondary_color'   => (string) ( $options['play_button_secondary_color'] ?? '' ),
			'control_bar_bg_color'          => (string) ( $options['control_bar_bg_color'] ?? '' ),
			'control_bar_color'             => (string) ( $options['control_bar_color'] ?? '' ),
			'width'                         => (int) ( $options['width'] ?? 960 ),
			'height'                        => (int) ( $options['height'] ?? 540 ),
			'fixed_aspect'                  => (string) ( $options['fixed_aspect'] ?? 'vertical' ),
			'default_ratio'                 => (string) ( (int) ( $options['width'] ?? 960 ) ) . ' / ' . (string) ( (int) ( $options['height'] ?? 540 ) ),
			'autoplay'                      => (bool) ( $options['autoplay'] ?? false ),
			'loop'                          => (bool) ( $options['loop'] ?? false ),
			'muted'                         => (bool) ( $options['muted'] ?? false ),
			'controls'                      => (bool) ( $options['controls'] ?? true ),
			'preload'                       => (string) ( $options['preload'] ?? 'metadata' ),
			'playback_rate'                 => (bool) ( $options['playback_rate'] ?? false ),
			'playsinline'                   => (bool) ( $options['playsinline'] ?? true ),
			'downloadlink'                  => (bool) ( $options['downloadlink'] ?? false ),
			'overlay_title'                 => (bool) ( $options['overlay_title'] ?? false ),
			'nativecontrolsfortouch'        => (bool) ( $options['nativecontrolsfortouch'] ?? false ),
			'pauseothervideos'              => (bool) ( $options['pauseothervideos'] ?? true ),
			'right_click'                   => (bool) ( $options['right_click'] ?? false ),
			'auto_res'                      => (string) ( $options['auto_res'] ?? 'automatic' ),
			'auto_codec'                    => (string) ( $options['auto_codec'] ?? 'h264' ),
			'skin'                          => (string) ( ! empty( $options['skin'] ) ? $options['skin'] : 'vjs-theme-videopack' ),
			'embed_method'                  => (string) ( ! empty( $options['embed_method'] ) ? $options['embed_method'] : 'Video.js' ),
			'watermark'                     => (string) ( ! empty( $options['watermark'] ) ? $options['watermark'] : '' ),
			'watermark_scale'               => (int) ( ! empty( $options['watermark_styles']['scale'] ) ? $options['watermark_styles']['scale'] : 10 ),
			'watermark_align'               => (string) ( ! empty( $options['watermark_styles']['align'] ) ? $options['watermark_styles']['align'] : 'right' ),
			'watermark_valign'              => (string) ( ! empty( $options['watermark_styles']['valign'] ) ? $options['watermark_styles']['valign'] : 'bottom' ),
			'watermark_x'                   => (float) ( isset( $options['watermark_styles']['x'] ) ? $options['watermark_styles']['x'] : 5.0 ),
			'watermark_y'                   => (float) ( isset( $options['watermark_styles']['y'] ) ? $options['watermark_styles']['y'] : 7.0 ),
			'gallery_pagination'            => (bool) ( ! empty( $options['gallery_pagination'] ) ? $options['gallery_pagination'] : false ),
			'gallery_per_page'              => (int) ( $options['gallery_per_page'] ?? 6 ),
			'enable_collection_video_limit' => (bool) ( $options['enable_collection_video_limit'] ?? false ),
			'collection_video_limit'        => (int) ( $options['collection_video_limit'] ?? -1 ),
		);
	}
}
