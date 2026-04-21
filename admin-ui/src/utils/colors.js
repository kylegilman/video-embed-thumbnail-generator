export const getColorFallbacks = (settings) => {
	const { embed_method = 'Video.js', skin = 'vjs-theme-videopack' } =
		settings || {};

	const fallbacks = {
		title_color: settings?.title_color || '#ffffff',
		title_background_color: settings?.title_background_color || '#2b333f',
		play_button_color: settings?.play_button_color || '#ffffff',
		play_button_secondary_color: settings?.play_button_secondary_color || '#ffffff',
		control_bar_bg_color: settings?.control_bar_bg_color || '#2b333f',
		control_bar_color: settings?.control_bar_color || '#ffffff',
		pagination_color: settings?.pagination_color || '#1e1e1e',
		pagination_background_color:
			settings?.pagination_background_color || '#ffffff',
		pagination_active_bg_color:
			settings?.pagination_active_bg_color || '#1e1e1e',
		pagination_active_color: settings?.pagination_active_color || '#ffffff',
	};

	if (embed_method === 'WordPress Default') {
		fallbacks.title_background_color = 'rgba(40, 40, 40, 0.95)';
		fallbacks.control_bar_bg_color = 'rgba(0, 0, 0, 0.35)';
		fallbacks.play_button_color = '#ffffff';
		fallbacks.play_button_secondary_color = '#ffffff';
	} else if (embed_method?.startsWith('Video.js')) {
		// Default skin (vjs-theme-videopack) defaults
		fallbacks.play_button_color = '#ffffff';
		fallbacks.play_button_secondary_color = '#2b333f'; // Videopack Grey accent

		switch (skin) {
			case 'vjs-theme-city':
				fallbacks.title_background_color = '#bf3b4d';
				fallbacks.control_bar_bg_color = '#000000';
				break;
			case 'vjs-theme-fantasy':
				fallbacks.title_background_color = '#9f44b4';
				fallbacks.play_button_secondary_color = '#9f44b4';
				break;
			case 'vjs-theme-forest':
				fallbacks.title_background_color = '#6fb04e';
				fallbacks.play_button_secondary_color = '#6fb04e';
				fallbacks.control_bar_bg_color = 'transparent';
				break;
			case 'vjs-theme-sea':
				fallbacks.title_background_color = '#4176bc';
				fallbacks.play_button_secondary_color = '#4176bc';
				fallbacks.control_bar_bg_color = 'rgba(255, 255, 255, 0.4)';
				break;
			case 'kg-video-js-skin':
				fallbacks.title_background_color = '#000000';
				fallbacks.play_button_secondary_color = '#000000';
				fallbacks.control_bar_bg_color = '#000000';
				break;
		}
	}

	return fallbacks;
};
