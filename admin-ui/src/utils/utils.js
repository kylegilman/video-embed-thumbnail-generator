/**
 * Utility functions for interacting with the Videopack REST API and managing video jobs.
 */

/* global videopack_config */
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs, getFilename } from '@wordpress/url';
import { applyFilters } from '@wordpress/hooks';

/**
 * Fetches the current video encoding queue.
 *
 * @return {Promise<Array>} List of jobs in the queue.
 */
export const getQueue = async () => {
	const pre = applyFilters('videopack.utils.pre_getQueue', undefined);
	if (typeof pre !== 'undefined') {
		return pre;
	}
	try {
		const response = await listJobs();
		return applyFilters('videopack.utils.getQueue', response || []);
	} catch (error) {
		console.error('Error fetching queue:', error);
		throw error;
	}
};

/**
 * Controls the queue (start, stop, etc.).
 *
 * @param {string} action Control action to perform.
 * @return {Promise<Object>} API response.
 */
export const toggleQueue = async (action) => {
	try {
		return await apiFetch({
			path: '/videopack/v1/jobs/control',
			method: 'POST',
			data: { action },
		});
	} catch (error) {
		console.error('Error toggling queue:', error);
		throw error;
	}
};

/**
 * Clears jobs from the queue.
 *
 * @param {string} type Type of jobs to clear.
 * @return {Promise<Object>} API response.
 */
export const clearQueue = async (type) => {
	try {
		return await apiFetch({
			path: '/videopack/v1/jobs/clear',
			method: 'DELETE',
			data: { type },
		});
	} catch (error) {
		console.error('Error clearing queue:', error);
		throw error;
	}
};

/**
 * Deletes a specific job.
 *
 * @param {number|string} jobId ID of the job to delete.
 * @return {Promise<Object>} API response.
 */
export const deleteJob = async (jobId) => {
	try {
		return await apiFetch({
			path: `/videopack/v1/jobs/${jobId}`,
			method: 'DELETE',
		});
	} catch (error) {
		console.error('Error deleting job:', error);
		throw error;
	}
};

/**
 * Retries a specific job.
 *
 * @param {number|string} jobId ID of the job to retry.
 * @return {Promise<Object>} API response.
 */
export const retryJob = async (jobId) => {
	try {
		return await apiFetch({
			path: `/videopack/v1/jobs/${jobId}`,
			method: 'POST',
		});
	} catch (error) {
		console.error('Error retrying job:', error);
		throw error;
	}
};

/**
 * Removes a job from the queue without force.
 *
 * @param {number|string} jobId ID of the job to remove.
 * @return {Promise<Object>} API response.
 */
export const removeJob = async (jobId) => {
	try {
		return await apiFetch({
			path: addQueryArgs(`/videopack/v1/jobs/${jobId}`, { force: false }),
			method: 'DELETE',
		});
	} catch (error) {
		console.error('Error removing job:', error);
		throw error;
	}
};

/**
 * Fetches encoding presets.
 *
 * @param {number|null} attachmentId   Optional attachment ID to filter presets.
 * @param {string}      url            Optional URL to filter presets.
 * @param {Object}      probedMetadata Optional metadata from the browser probe.
 * @param {AbortSignal} signal         Optional AbortSignal to cancel the request.
 * @return {Promise<Array>} List of presets.
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
 * Creates a new encoding job.
 *
 * @param {number|string} input    Attachment ID or source URL.
 * @param {Array}         outputs  List of format IDs to encode.
 * @param {number}        parentId ID of the parent post.
 * @return {Promise<Object>} API response.
 */
export const createJob = async (input, outputs, parentId = 0) => {
	try {
		return await apiFetch({
			path: '/videopack/v1/jobs',
			method: 'POST',
			data: {
				input,
				outputs,
				parent_id: Number(parentId) || 0,
			},
		});
	} catch (error) {
		console.error('Error creating job:', error);
		throw error;
	}
};

/**
 * Fetches the status of a specific job.
 *
 * @param {number|string} jobId ID of the job to check.
 * @return {Promise<Object>} Job status data.
 */
export const getJobStatus = async (jobId) => {
	try {
		return await apiFetch({
			path: `/videopack/v1/jobs/${jobId}`,
		});
	} catch (error) {
		console.error('Error fetching job status:', error);
		throw error;
	}
};

/**
 * Lists jobs, optionally filtered by input.
 *
 * @param {number|string|null} input Optional attachment ID or URL to filter.
 * @return {Promise<Array>} List of jobs.
 */
export const listJobs = async (input = null) => {
	try {
		const path = input
			? addQueryArgs('/videopack/v1/jobs', { input })
			: '/videopack/v1/jobs';
		return await apiFetch({ path });
	} catch (error) {
		console.error('Error listing jobs:', error);
		throw error;
	}
};

/**
 * Fetches available video formats and their encoding status for an attachment.
 *
 * @param {number}      attachmentId   The attachment ID.
 * @param {string}      url            Optional source URL.
 * @param {Object}      probedMetadata Optional metadata from the browser probe.
 * @param {AbortSignal} signal         Optional AbortSignal to cancel the request.
 * @return {Promise<Object>} Map of format IDs to format objects.
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
				// Preserve the status from the server directly
				status: preset.status
					? preset.status.toLowerCase()
					: 'not_encoded',
				// The UI expects 'id' to be the WordPress attachment ID for deletion/metadata tracking
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
 * Enqueues a job for multiple video formats.
 *
 * @param {number} attachmentId The attachment ID.
 * @param {string} src          Source URL.
 * @param {Object} formats      Object mapping format IDs to boolean selection state.
 * @param {number} parentId     ID of the parent post.
 * @return {Promise<Object>} The response from the job creation.
 */
export const enqueueJob = async (attachmentId, src, formats, parentId = 0) => {
	// formats is an object { format_id: true, ... } from the UI
	const outputIds = Object.keys(formats).filter((id) => formats[id]);
	try {
		const response = await createJob(
			attachmentId || src,
			outputIds,
			Number(parentId) || 0
		);
		// The UI expects a certain shape for its message reporting
		return {
			...response,
			attachment_id: attachmentId,
		};
	} catch (error) {
		console.error('Error enqueuing job:', error);
		throw error;
	}
};

/**
 * Assigns an encoded file to a specific format on a parent video.
 *
 * @param {number} mediaId  ID of the encoded media attachment.
 * @param {string} formatId ID of the format to assign.
 * @param {number} parentId ID of the parent video attachment.
 * @return {Promise<Object>} API response.
 */
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

/**
 * Unassigns a media attachment from its video format role.
 *
 * @param {number} mediaId ID of the media attachment.
 * @return {Promise<Object>} API response.
 */
export const unassignFormat = async (mediaId) => {
	try {
		return await apiFetch({
			path: `/wp/v2/media/${mediaId}`,
			method: 'POST',
			data: {
				meta: {
					'_kgflashmediaplayer-format': '',
					'_kgflashmediaplayer-parent': 0,
				},
			},
		});
	} catch (error) {
		console.error('Error unassigning format:', error);
		throw error;
	}
};

/**
 * Deletes a media attachment file permanently.
 *
 * @param {number} attachmentId ID of the attachment to delete.
 * @return {Promise<Object>} API response.
 */
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
 * @param {boolean|null}      featured     Whether to set as featured image (overrides default).
 * @return {Promise<Object>} The response from the upload endpoint.
 */
export const createThumbnailFromCanvas = (
	canvas,
	attachmentId,
	videoSrc,
	parentId = 0,
	featured = null
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
				formData.append('parent_id', Number(parentId) || 0);
				formData.append('url', videoSrc);
				formData.append('post_name', getFilename(videoSrc));
				if (featured !== null) {
					formData.append('featured', featured);
				}

				const response = await uploadThumbnail(formData);
				resolve(response);
			} catch (error) {
				reject(error);
			}
		}, 'image/jpeg');
	});
};

/**
 * Uploads a thumbnail to the server.
 *
 * @param {FormData} formData Thumbnail data and metadata.
 * @return {Promise<Object>} API response.
 */
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

/**
 * Saves all thumbnails selected for a video.
 *
 * @param {number}  attachment_id ID of the video attachment.
 * @param {Array}   thumb_urls    List of thumbnail URLs to save.
 * @param {number}  parent_id     ID of the parent post.
 * @param {string}  url           Video source URL.
 * @param {boolean} featured      Whether to set one as featured.
 * @return {Promise<Object>} API response.
 */
export const saveAllThumbnails = async (
	attachment_id,
	thumb_urls,
	parent_id = 0,
	url = '',
	featured = null
) => {
	try {
		return await apiFetch({
			path: '/videopack/v1/thumbs/save_all',
			method: 'POST',
			data: {
				attachment_id,
				thumb_urls,
				parent_id: Number(parent_id) || 0,
				url,
				featured,
			},
		});
	} catch (error) {
		console.error('Error saving all thumbnails:', error);
		throw error;
	}
};

/**
 * Fetches the video gallery content based on provided arguments.
 *
 * @param {Object} args Gallery query arguments.
 * @return {Promise<Array>} List of videos in the gallery.
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
 * @return {Promise<Array>} List of users.
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
 * @param {string} page The Freemius page name.
 * @return {Promise<Object>} Page data.
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
 * @return {Promise<Object>} Test results.
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

let cachedSettings = null;
/**
 * Fetches global Videopack settings.
 *
 * @return {Promise<Object>} Videopack settings.
 */
export const getSettings = async () => {
	const pre = applyFilters('videopack.utils.pre_getSettings', undefined);
	if (typeof pre !== 'undefined') {
		return pre;
	}

	if (cachedSettings) {
		return cachedSettings;
	}

	try {
		const allSettings = await apiFetch({ path: '/wp/v2/settings' });
		cachedSettings = allSettings.videopack_options || {};
		return applyFilters('videopack.utils.getSettings', cachedSettings);
	} catch (error) {
		console.error('Error fetching settings:', error);
		throw error;
	}
};

/**
 * Saves global Videopack settings to the WordPress options.
 *
 * @param {Object} newSettings The new settings to save.
 * @return {Promise<Object>} Updated settings.
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
		return response.videopack_options || {};
	} catch (error) {
		console.error('Error saving WP settings:', error);
		throw error;
	}
};

/**
 * Fetches network-wide Videopack settings (Multisite).
 *
 * @return {Promise<Object>} Network settings.
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
 * @param {Object} newSettings The network settings to save.
 * @return {Promise<Object>} Updated network settings.
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
 *
 * @return {Promise<Object>} Default settings.
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
 *
 * @return {Promise<Object>} Default settings.
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
 *
 * @return {Promise<Object>} API response.
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

/**
 * Sets a specific image as the poster for a video.
 *
 * @param {number}  attachment_id ID of the video attachment.
 * @param {string}  thumb_url     URL of the thumbnail image.
 * @param {number}  parent_id     ID of the parent post.
 * @param {string}  url           Original video source URL.
 * @param {boolean} featured      Whether to set as featured image.
 * @return {Promise<Object>} API response.
 */
export const setPosterImage = async (
	attachment_id,
	thumb_url,
	parent_id = 0,
	url = '',
	featured = null
) => {
	try {
		return await apiFetch({
			path: '/videopack/v1/thumbs',
			method: 'PUT',
			data: {
				attachment_id,
				thumburl: thumb_url,
				parent_id: Number(parent_id) || 0,
				url,
				featured,
			},
		});
	} catch (error) {
		console.error('Error setting poster image:', error);
		throw error;
	}
};

/**
 * Generates a thumbnail for a video.
 *
 * @param {string}  url              Video source URL.
 * @param {number}  total_thumbnails Total number of thumbnails to generate.
 * @param {number}  thumbnail_index  Index of the thumbnail to generate.
 * @param {number}  attachment_id    ID of the video attachment.
 * @param {boolean} generate_button  Whether this was triggered by a manual button.
 * @param {number}  parent_id        ID of the parent post.
 * @param {boolean} featured         Whether to set as featured image.
 * @param {number}  time             The specific time (in seconds) to capture.
 * @return {Promise<Object>} API response.
 */
export const generateThumbnail = async (
	url,
	total_thumbnails,
	thumbnail_index,
	attachment_id,
	generate_button,
	parent_id = 0,
	featured = null,
	time = null
) => {
	try {
		const query = {
			url,
			total_thumbnails,
			thumbnail_index,
			attachment_id,
			generate_button,
			parent_id: Number(parent_id) || 0,
			featured,
		};

		if (time !== null && time !== '' && !isNaN(time)) {
			query.time = Number(time);
		}

		const path = addQueryArgs('/videopack/v1/thumbs', query);

		return await apiFetch({ path });
	} catch (error) {
		console.error('Error generating thumbnail:', error);
		throw error;
	}
};

/**
 * Starts a batch process of a particular type.
 *
 * @param {string} type           Type of batch process.
 * @param {Object} additionalData Extra data for the process.
 * @return {Promise<Object>} API response with process ID/status.
 */
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

/**
 * Fetches the progress of a running batch process.
 *
 * @param {string} type Type of batch process.
 * @return {Promise<Object>} Progress data.
 */
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

/**
 * Fetches candidate thumbnails for a video.
 *
 * @return {Promise<Array>} List of thumbnail candidates.
 */
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
