/* global videopack_config */
import { applyFilters } from '@wordpress/hooks';

export const getColorFallbacks = ( settings ) => {
	const globalOptions =
		typeof videopack_config !== 'undefined'
			? videopack_config?.options || {}
			: {};

	const resolveColor = ( key, skinDefault ) => {
		const hasSettingsValue = !! settings && key in settings;

		if (
			hasSettingsValue &&
			settings[ key ] !== undefined &&
			settings[ key ] !== null &&
			settings[ key ] !== ''
		) {
			return settings[ key ];
		}

		// An explicitly cleared field ('') on the Settings page IS the
		// global option being edited -- there's no separate, more-global
		// source above it to defer to. Falling through to globalOptions
		// below in that case would just echo back videopack_config.options,
		// a snapshot frozen at page load, making "Clear" look like it did
		// nothing (still showing the pre-edit custom color) until the page
		// is reloaded. Only a settings key that's genuinely absent (e.g. a
		// block's already-resolved value, which is undefined rather than ''
		// when nothing resolved -- see getEffectiveValue's isValid()) should
		// fall through to the live global option.
		if ( hasSettingsValue && settings[ key ] === '' ) {
			return skinDefault;
		}

		if (
			globalOptions &&
			globalOptions[ key ] !== undefined &&
			globalOptions[ key ] !== null &&
			globalOptions[ key ] !== ''
		) {
			return globalOptions[ key ];
		}
		return skinDefault;
	};

	const { embed_method = 'Video.js', skin = 'vjs-theme-videopack' } =
		settings || globalOptions || {};

	const fallbacks = {
		title_color: resolveColor( 'title_color', '#ffffff' ),
		title_background_color: resolveColor(
			'title_background_color',
			'#2b333f'
		),
		play_button_color: resolveColor( 'play_button_color', '#ffffff' ),
		play_button_secondary_color: resolveColor(
			'play_button_secondary_color',
			'#ffffff'
		),
		control_bar_bg_color: resolveColor( 'control_bar_bg_color', '#2b333f' ),
		control_bar_color: resolveColor( 'control_bar_color', '#ffffff' ),
		pagination_color: resolveColor( 'pagination_color', '#1e1e1e' ),
		pagination_background_color: resolveColor(
			'pagination_background_color',
			'#ffffff'
		),
		pagination_active_bg_color: resolveColor(
			'pagination_active_bg_color',
			'#1e1e1e'
		),
		pagination_active_color: resolveColor(
			'pagination_active_color',
			'#ffffff'
		),
	};

	if ( embed_method === 'WordPress Default' ) {
		fallbacks.title_background_color = resolveColor(
			'title_background_color',
			'rgba(40, 40, 40, 0.95)'
		);
		fallbacks.control_bar_bg_color = resolveColor(
			'control_bar_bg_color',
			'#222222'
		);
		fallbacks.play_button_color = resolveColor(
			'play_button_color',
			'#ffffff'
		);
		fallbacks.play_button_secondary_color = resolveColor(
			'play_button_secondary_color',
			'#ffffff'
		);
	} else if ( embed_method?.startsWith( 'Video.js' ) ) {
		// Default skin (vjs-theme-videopack) defaults
		fallbacks.play_button_color = resolveColor(
			'play_button_color',
			'#ffffff'
		);
		fallbacks.play_button_secondary_color = resolveColor(
			'play_button_secondary_color',
			'#2b333f'
		); // Videopack Grey accent

		switch ( skin ) {
			case 'vjs-theme-city':
				fallbacks.title_background_color = resolveColor(
					'title_background_color',
					'#bf3b4d'
				);
				fallbacks.control_bar_bg_color = resolveColor(
					'control_bar_bg_color',
					'#000000'
				);
				fallbacks.pagination_active_bg_color = resolveColor(
					'pagination_active_bg_color',
					'#bf3b4d'
				);
				break;
			case 'vjs-theme-fantasy':
				fallbacks.title_background_color = resolveColor(
					'title_background_color',
					'#9f44b4'
				);
				fallbacks.play_button_color = resolveColor(
					'play_button_color',
					'#9f44b4'
				);
				fallbacks.play_button_secondary_color = resolveColor(
					'play_button_secondary_color',
					'#ffffff'
				);
				fallbacks.pagination_active_bg_color = resolveColor(
					'pagination_active_bg_color',
					'#9f44b4'
				);
				break;
			case 'vjs-theme-forest':
				fallbacks.title_background_color = resolveColor(
					'title_background_color',
					'#6fb04e'
				);
				fallbacks.play_button_secondary_color = resolveColor(
					'play_button_secondary_color',
					'#6fb04e'
				);
				fallbacks.control_bar_bg_color = resolveColor(
					'control_bar_bg_color',
					'transparent'
				);
				fallbacks.pagination_active_bg_color = resolveColor(
					'pagination_active_bg_color',
					'#6fb04e'
				);
				break;
			case 'vjs-theme-sea':
				fallbacks.title_background_color = resolveColor(
					'title_background_color',
					'#4176bc'
				);
				fallbacks.play_button_secondary_color = resolveColor(
					'play_button_secondary_color',
					'#4176bc'
				);
				fallbacks.control_bar_bg_color = resolveColor(
					'control_bar_bg_color',
					'rgba(255, 255, 255, 0.4)'
				);
				fallbacks.pagination_active_bg_color = resolveColor(
					'pagination_active_bg_color',
					'#4176bc'
				);
				break;
			case 'kg-video-js-skin':
				fallbacks.title_background_color = resolveColor(
					'title_background_color',
					'#000000'
				);
				fallbacks.play_button_secondary_color = resolveColor(
					'play_button_secondary_color',
					'#000000'
				);
				fallbacks.control_bar_bg_color = resolveColor(
					'control_bar_bg_color',
					'#000000'
				);
				fallbacks.pagination_active_bg_color = resolveColor(
					'pagination_active_bg_color',
					'#000000'
				);
				break;
		}
	}

	return applyFilters(
		/**
		 * Filters the resolved color fallback values used for the player preview
		 * and color picker placeholders when no explicit color has been chosen.
		 *
		 * @since 5.0.0
		 *
		 * @param {Object} fallbacks    Map of color fallback values.
		 * @param {string} embed_method The selected player embed method.
		 * @param {string} skin         The selected player skin.
		 */
		'videopack.colorFallbacks',
		fallbacks,
		embed_method,
		skin
	);
};
