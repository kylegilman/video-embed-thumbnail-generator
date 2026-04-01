/**
 * API service for video gallery and general media data.
 */

/* global videopack_config */
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { applyFilters } from '@wordpress/hooks';

/**
 * Fetches encoding presets.
 *
 * @param {number|string} attachmentId   Optional. The video attachment ID.
 * @param {string}        url            Optional. The video source URL.
 * @param {Object}        probedMetadata Optional. Probed video dimensions/duration.
 * @param {AbortSignal}   signal         Optional. Abort signal.
 */
export const getPresets = async (
	attachmentId = null,
	url = '',
	probedMetadata = null,
	signal = null
) => {
	try {
		const query = {
			attachment_id: attachmentId,
			url,
		};
		if (probedMetadata) {
			if (probedMetadata.width) {
				query.width = probedMetadata.width;
			}
			if (probedMetadata.height) {
				query.height = probedMetadata.height;
			}
			if (probedMetadata.duration) {
				query.duration = probedMetadata.duration;
			}
		}
		return await apiFetch({
			path: addQueryArgs('/videopack/v1/presets', query),
			signal,
		});
	} catch (error) {
		if (error.name === 'AbortError') {
			throw error;
		}
		console.error('Error fetching presets:', error);
		throw error;
	}
};

/**
 * Fetches available video formats and their encoding status for an attachment.
 *
 * @param {number|string} attachmentId   The video attachment ID.
 * @param {string}        url            Optional. The video source URL.
 * @param {Object}        probedMetadata Optional. Probed video dimensions/duration.
 * @param {AbortSignal}   signal         Optional. Abort signal.
 */
export const getVideoFormats = async (
	attachmentId,
	url = '',
	probedMetadata = null,
	signal = null
) => {
	try {
		const presets = await getPresets(
			attachmentId,
			url,
			probedMetadata,
			signal
		);

		const merged = {};
		presets.forEach((preset) => {
			merged[preset.id] = {
				...preset,
				format_id: preset.id,
				status: preset.status
					? preset.status.toLowerCase()
					: 'not_encoded',
				id: preset.attachment_id || null,
			};
		});

		return merged;
	} catch (error) {
		if (error.name === 'AbortError') {
			throw error;
		}
		console.error('Error fetching video formats:', error);
		throw error;
	}
};

/**
 * Fetches the video gallery content based on provided arguments.
 *
 * @param {Object} args The query arguments for the gallery.
 */
export const getVideoGallery = async (args) => {
	const pre = applyFilters(
		'videopack.utils.pre_getVideoGallery',
		undefined,
		args
	);
	if (typeof pre !== 'undefined') {
		return pre;
	}
	try {
		const response = await apiFetch({
			path: addQueryArgs('/videopack/v1/video_gallery', args),
			method: 'GET',
		});
		return applyFilters('videopack.utils.getVideoGallery', response, args);
	} catch (error) {
		console.error('Error fetching video gallery:', error);
		throw error;
	}
};

/**
 * Fetches users who have a specific capability.
 *
 * @param {string} capability The capability to check for.
 */
export const getUsersWithCapability = async (capability) => {
	try {
		return await apiFetch({
			path: `/wp/v2/users?capability=${capability}`,
			method: 'GET',
		});
	} catch (error) {
		console.error('Error fetching users:', error);
		throw error;
	}
};

/**
 * Fetches settings content for a specific Freemius page.
 *
 * @param {string} page The Freemius page identifier.
 */
export const getFreemiusPage = async (page) => {
	try {
		let path = `/videopack/v1/freemius/${page}`;
		if (
			videopack_config.isNetworkAdmin ||
			videopack_config.isNetworkActive
		) {
			path += '?_fs_network_admin=true';
		}
		return await apiFetch({
			path,
		});
	} catch (error) {
		console.error(`Error fetching Freemius page '${page}':`, error);
		throw error;
	}
};

/**
 * Tests an FFmpeg encoding command with specific parameters.
 *
 * @param {string} codec      The codec to test.
 * @param {string} resolution The resolution to test.
 * @param {number} rotate     The rotation angle.
 */
export const testEncodeCommand = async (codec, resolution, rotate) => {
	const pre = applyFilters(
		'videopack.utils.pre_testEncodeCommand',
		undefined,
		codec,
		resolution,
		rotate
	);
	if (typeof pre !== 'undefined') {
		return pre;
	}
	try {
		return await apiFetch({
			path: `/videopack/v1/ffmpeg-test/?codec=${codec}&resolution=${resolution}&rotate=${rotate}`,
		});
	} catch (error) {
		console.error('Error testing encode command:', error);
		throw error;
	}
};
