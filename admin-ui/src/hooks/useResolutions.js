/**
 * Custom React hook for calculating video resolutions.
 */

/* global videopack_config */
import { useMemo } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Hook to manage and calculate video resolutions, including a custom resolution option.
 *
 * @param {boolean}       enable_custom_resolution Whether to include the custom resolution in the list.
 * @param {string|number} custom_resolution        The height of the custom resolution.
 * @return {Array} List of resolution objects.
 */
const useResolutions = (enable_custom_resolution, custom_resolution) => {
	return useMemo(() => {
		// Filter out the custom resolution from the static list, as it will be re-added if enabled.
		let resolutionsList = videopack_config.resolutions.filter(
			(r) => !r.is_custom
		);

		if (enable_custom_resolution) {
			const height = parseInt(custom_resolution, 10) || 900;
			const id = String(height);
			const width = Math.ceil((height * 16) / 9);
			const name = sprintf(
				/* translators: %s is the height of a custom video resolution. Example: 'Custom (4320p)' */
				__('Custom (%sp)', 'video-embed-thumbnail-generator'),
				height
			);

			// Remove any existing resolution with the same ID to avoid duplicates.
			resolutionsList = resolutionsList.filter((r) => r.id !== id);

			resolutionsList.push({
				id,
				name,
				height,
				width,
				is_custom: true,
			});
		}

		return resolutionsList.sort((a, b) => {
			if (a.id === 'fullres') {
				return -1;
			}
			if (b.id === 'fullres') {
				return 1;
			}
			return b.height - a.height;
		});
	}, [enable_custom_resolution, custom_resolution]);
};

export default useResolutions;
