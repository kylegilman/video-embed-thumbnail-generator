/**
 * API service for managing video thumbnails.
 */

import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs, getFilename } from '@wordpress/url';

/**
 * Converts a canvas to a blob and uploads it as a thumbnail.
 *
 * @param {HTMLCanvasElement} canvas       The canvas containing the frame.
 * @param {number|string}     attachmentId The ID of the video attachment.
 * @param {string}            videoSrc     The source URL of the video.
 * @param {number}            parentId     Optional. The parent post ID.
 * @param {boolean}           featured     Optional. Whether to set as featured image.
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
 * @param {FormData} formData The form data containing the file and metadata.
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
 * @param {number|string} attachment_id The ID of the video attachment.
 * @param {Array}         thumb_urls    Array of thumbnail URLs to save.
 * @param {number}        parent_id     Optional. The parent post ID.
 * @param {string}        url           Optional. The video source URL.
 * @param {boolean}       featured      Optional. Whether to set as featured image.
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
 * Sets a specific image as the poster for a video.
 *
 * @param {number|string} attachment_id The ID of the video attachment.
 * @param {string}        thumb_url     The URL of the thumbnail to use.
 * @param {number}        parent_id     Optional. The parent post ID.
 * @param {string}        url           Optional. The video source URL.
 * @param {boolean}       featured      Optional. Whether to set as featured image.
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
 * @param {string}        url              The video source URL.
 * @param {number}        total_thumbnails Number of thumbnails to generate.
 * @param {number}        thumbnail_index  The index of the thumbnail.
 * @param {number|string} attachment_id    The ID of the video attachment.
 * @param {string}        generate_button  The type of generation triggered.
 * @param {number}        parent_id        Optional. The parent post ID.
 * @param {boolean}       featured         Optional. Whether to set as featured image.
 * @param {number}        time             Optional. The specific timecode to capture.
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
