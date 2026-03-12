/* global videopack_config */
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs, getFilename } from '@wordpress/url';
import { applyFilters } from '@wordpress/hooks';

export const getQueue = async () => {
	const pre = applyFilters('videopack.utils.pre_getQueue', undefined);
	if (typeof pre !== 'undefined') {
		return pre;
	}
	try {
		const response = await apiFetch({
			path: '/videopack/v1/queue',
		});
		return applyFilters('videopack.utils.getQueue', response || []);
	} catch (error) {
		console.error('Error fetching queue:', error);
		throw error;
	}
};

export const toggleQueue = async (action) => {
	try {
		return await apiFetch({
			path: '/videopack/v1/queue/control',
			method: 'POST',
			data: { action },
		});
	} catch (error) {
		console.error('Error toggling queue:', error);
		throw error;
	}
};

export const clearQueue = async (type) => {
	try {
		return await apiFetch({
			path: '/videopack/v1/queue/clear',
			method: 'DELETE',
			data: { type },
		});
	} catch (error) {
		console.error('Error clearing queue:', error);
		throw error;
	}
};

export const deleteJob = async (jobId) => {
	try {
		return await apiFetch({
			path: `/videopack/v1/queue/${jobId}`,
			method: 'DELETE',
		});
	} catch (error) {
		console.error('Error deleting job:', error);
		throw error;
	}
};

export const removeJob = async (jobId) => {
	try {
		return await apiFetch({
			path: `/videopack/v1/queue/remove/${jobId}`,
			method: 'DELETE',
		});
	} catch (error) {
		console.error('Error removing job:', error);
		throw error;
	}
};

export const getVideoFormats = async (attachmentId, url = '') => {
	const pre = applyFilters(
		'videopack.utils.pre_getVideoFormats',
		undefined,
		attachmentId,
		url
	);
	if (typeof pre !== 'undefined') {
		return pre;
	}
	try {
		const path = addQueryArgs(`/videopack/v1/formats/${attachmentId}`, {
			url,
		});
		const response = await apiFetch({ path });
		return applyFilters(
			'videopack.utils.getVideoFormats',
			response,
			attachmentId,
			url
		);
	} catch (error) {
		console.error('Error fetching video formats:', error);
		throw error;
	}
};

export const enqueueJob = async (attachmentId, src, formats, parentId = 0) => {
	const pre = applyFilters(
		'videopack.utils.pre_enqueueJob',
		undefined,
		attachmentId,
		src,
		formats
	);
	if (typeof pre !== 'undefined') {
		return pre;
	}
	try {
		return await apiFetch({
			path: `/videopack/v1/queue/${attachmentId}`,
			method: 'POST',
			data: {
				url: src,
				formats,
				parent_id: parentId,
			},
		});
	} catch (error) {
		console.error('Error enqueuing job:', error);
		throw error;
	}
};

export const assignFormat = async (mediaId, formatId, parentId) => {
	try {
		return await apiFetch({
			path: `/wp/v2/media/${mediaId}`,
			method: 'POST',
			data: {
				meta: {
					'_kgflashmediaplayer-format': formatId,
					'_kgflashmediaplayer-parent': parentId,
				},
			},
		});
	} catch (error) {
		console.error('Error assigning format:', error);
		throw error;
	}
};

export const deleteFile = async (attachmentId) => {
	try {
		return await apiFetch({
			path: `/wp/v2/media/${attachmentId}?force=true`,
			method: 'DELETE',
		});
	} catch (error) {
		console.error('Error deleting file:', error);
		throw error;
	}
};

/**
 * Converts a canvas to a blob and uploads it as a thumbnail.
 *
 * @param {HTMLCanvasElement} canvas       The canvas element to upload.
 * @param {number}            attachmentId The ID of the video attachment.
 * @param {string}            videoSrc     The URL of the video (used for filename).
 * @param {number}            parentId     The ID of the parent post.
 * @return {Promise<Object>} The response from the upload endpoint.
 */
export const createThumbnailFromCanvas = (
	canvas,
	attachmentId,
	videoSrc,
	parentId = 0
) => {
	return new Promise((resolve, reject) => {
		canvas.toBlob(async (blob) => {
			if (!blob) {
				reject(new Error('Canvas is empty'));
				return;
			}
			try {
				const formData = new FormData();
				formData.append('file', blob, 'thumbnail.jpg');
				formData.append('attachment_id', attachmentId);
				formData.append('parent_id', parentId);
				formData.append('url', videoSrc);
				formData.append('post_name', getFilename(videoSrc));

				const response = await uploadThumbnail(formData);
				resolve(response);
			} catch (error) {
				reject(error);
			}
		}, 'image/jpeg');
	});
};

export const uploadThumbnail = async (formData) => {
	try {
		return await apiFetch({
			path: '/videopack/v1/thumbs/upload',
			method: 'POST',
			body: formData,
		});
	} catch (error) {
		console.error('Error uploading thumbnail:', error);
		throw error;
	}
};

export const saveAllThumbnails = async (
	attachment_id,
	thumb_urls,
	parent_id = 0,
	url = ''
) => {
	try {
		return await apiFetch({
			path: '/videopack/v1/thumbs/save_all',
			method: 'POST',
			data: {
				attachment_id,
				thumb_urls,
				parent_id,
				url,
			},
		});
	} catch (error) {
		console.error('Error saving all thumbnails:', error);
		throw error;
	}
};

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

export const getSettings = async () => {
	const pre = applyFilters('videopack.utils.pre_getSettings', undefined);
	if (typeof pre !== 'undefined') {
		return pre;
	}
	try {
		const allSettings = await apiFetch({ path: '/wp/v2/settings' });
		const settings = allSettings.videopack_options || {};
		return applyFilters('videopack.utils.getSettings', settings);
	} catch (error) {
		console.error('Error fetching settings:', error);
		throw error;
	}
};

export const saveWPSettings = async (newSettings) => {
	try {
		const response = await apiFetch({
			path: '/wp/v2/settings',
			method: 'POST',
			data: {
				videopack_options: newSettings,
			},
		});
		return response.videopack_options || {};
	} catch (error) {
		console.error('Error saving WP settings:', error);
		throw error;
	}
};

export const getNetworkSettings = async () => {
	try {
		return await apiFetch({ path: '/videopack/v1/network/settings' });
	} catch (error) {
		console.error('Error fetching network settings:', error);
		throw error;
	}
};

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

export const resetVideopackSettings = async () => {
	try {
		return await apiFetch({
			path: '/videopack/v1/defaults',
		});
	} catch (error) {
		console.error('Error resetting Videopack settings:', error);
		throw error;
	}
};

export const setPosterImage = async (
	attachment_id,
	thumb_url,
	parent_id = 0,
	url = ''
) => {
	try {
		return await apiFetch({
			path: '/videopack/v1/thumbs',
			method: 'PUT',
			data: {
				attachment_id,
				thumburl: thumb_url,
				parent_id,
				url,
			},
		});
	} catch (error) {
		console.error('Error setting poster image:', error);
		throw error;
	}
};

export const generateThumbnail = async (
	url,
	total_thumbnails,
	thumbnail_index,
	attachment_id,
	generate_button,
	parent_id = 0
) => {
	try {
		const path = addQueryArgs('/videopack/v1/thumbs', {
			url,
			total_thumbnails,
			thumbnail_index,
			attachment_id,
			generate_button,
			parent_id,
		});

		return await apiFetch({ path });
	} catch (error) {
		console.error('Error generating thumbnail:', error);
		throw error;
	}
};

export const startBatchProcess = async (type, additionalData = {}) => {
	const pre = applyFilters(
		'videopack.utils.pre_startBatchProcess',
		undefined,
		type,
		additionalData
	);
	if (typeof pre !== 'undefined') {
		return pre;
	}
	try {
		return await apiFetch({
			path: '/videopack/v1/batch/process',
			method: 'POST',
			data: { type, ...additionalData },
		});
	} catch (error) {
		console.error(`Error starting ${type} batch processing:`, error);
		throw error;
	}
};

export const getBatchProgress = async (type) => {
	try {
		return await apiFetch({
			path: `/videopack/v1/batch/progress?type=${type}`,
			method: 'GET',
		});
	} catch (error) {
		console.error(`Error fetching ${type} batch progress:`, error);
		throw error;
	}
};

export const getThumbnailCandidates = async () => {
	try {
		return await apiFetch({
			path: '/videopack/v1/thumbs/candidates',
			method: 'GET',
		});
	} catch (error) {
		console.error('Error fetching thumbnail candidates:', error);
		throw error;
	}
};

/**
 * Normalizes options/attributes to ensure booleans are actual booleans
 * and not 'on'/'off' strings.
 *
 * @param {Object} data The object to normalize.
 * @return {Object} Normalized object.
 */
export const normalizeOptions = (data) => {
	if (!data) {
		return {};
	}
	const normalized = {};
	Object.entries(data).forEach(([key, value]) => {
		if (value === 'on') {
			normalized[key] = true;
		} else if (value === 'off') {
			normalized[key] = false;
		} else {
			normalized[key] = value;
		}
	});
	return normalized;
};

/**
 * Generates the [videopack] shortcode string based on attributes.
 *
 * @param {Object} attributes The attributes to include in the shortcode.
 * @param {string} url        Optional URL for the video source.
 * @param {Object} options    Optional global options to compare against for defaults.
 * @return {string} The generated shortcode.
 */
export const generateShortcode = (attributes, url = '', options = null) => {
	const { id, gallery, ...rest } = attributes;
	let shortcode = '[videopack';

	const normalizedOptions = options ? normalizeOptions(options) : null;

	if (gallery) {
		shortcode += ' gallery="true"';
	} else if (id) {
		shortcode += ` id="${id}"`;
	}

	Object.entries(rest).forEach(([key, value]) => {
		// Only include if value is set and not null/undefined
		if (value !== undefined && value !== null && value !== '') {
			// Skip if value matches global option (default)
			if (normalizedOptions && normalizedOptions[key] !== undefined) {
				if (value === normalizedOptions[key]) {
					return;
				}
			}

			// Skip temporary UI-only attributes
			if (key === 'tinymce_edit') {
				return;
			}

			// Skip src attribute if we have an attachment id
			if (id && key === 'src') {
				return;
			}

			shortcode += ` ${key}="${value}"`;
		}
	});

	shortcode += ']';

	// Include URL content for clarity, even if we have an attachment id
	if (url && !gallery) {
		shortcode += url;
	}

	shortcode += '[/videopack]';

	return shortcode;
};
