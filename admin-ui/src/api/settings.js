/**
 * API service for managing Videopack settings.
 */

import apiFetch from '@wordpress/api-fetch';
import { applyFilters } from '@wordpress/hooks';

let cachedSettings = null;
let settingsPromise = null;

/**
 * Fetches global Videopack settings.
 */
export const getSettings = async () => {
	const pre = applyFilters('videopack.utils.pre_getSettings', undefined);
	if (typeof pre !== 'undefined') {
		return pre;
	}

	if (cachedSettings) {
		return cachedSettings;
	}

	if (settingsPromise) {
		return settingsPromise;
	}

	settingsPromise = apiFetch({ path: '/wp/v2/settings' })
		.then((allSettings) => {
			cachedSettings = allSettings.videopack_options || {};
			settingsPromise = null;
			return applyFilters('videopack.utils.getSettings', cachedSettings);
		})
		.catch((error) => {
			settingsPromise = null;
			console.error('Error fetching settings:', error);
			throw error;
		});

	return settingsPromise;
};

/**
 * Saves global Videopack settings.
 *
 * @param {Object} newSettings The settings object to save.
 */
export const saveWPSettings = async (newSettings) => {
	try {
		const response = await apiFetch({
			path: '/wp/v2/settings',
			method: 'POST',
			data: {
				videopack_options: newSettings,
			},
		});
		cachedSettings = response.videopack_options || {};
		return cachedSettings;
	} catch (error) {
		console.error('Error saving WP settings:', error);
		throw error;
	}
};

/**
 * Fetches network-wide Videopack settings (Multisite).
 */
export const getNetworkSettings = async () => {
	try {
		return await apiFetch({ path: '/videopack/v1/network/settings' });
	} catch (error) {
		console.error('Error fetching network settings:', error);
		throw error;
	}
};

/**
 * Saves network-wide Videopack settings (Multisite).
 *
 * @param {Object} newSettings The settings object to save.
 */
export const saveNetworkSettings = async (newSettings) => {
	try {
		return await apiFetch({
			path: '/videopack/v1/network/settings',
			method: 'POST',
			data: newSettings,
		});
	} catch (error) {
		console.error('Error saving network settings:', error);
		throw error;
	}
};

/**
 * Resets network settings to their default values.
 */
export const resetNetworkSettings = async () => {
	try {
		return await apiFetch({
			path: '/videopack/v1/network/settings/defaults',
		});
	} catch (error) {
		console.error('Error resetting network settings:', error);
		throw error;
	}
};

/**
 * Resets site-specific Videopack settings to their default values.
 */
export const resetVideopackSettings = async () => {
	try {
		return await apiFetch({
			path: '/videopack/v1/settings/defaults',
		});
	} catch (error) {
		console.error('Error resetting Videopack settings:', error);
		throw error;
	}
};

/**
 * Clears the URL to attachment ID cache.
 */
export const clearUrlCache = async () => {
	try {
		return await apiFetch({
			path: '/videopack/v1/settings/cache',
			method: 'DELETE',
		});
	} catch (error) {
		console.error('Error clearing URL cache:', error);
		throw error;
	}
};
