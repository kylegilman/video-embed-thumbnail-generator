/**
 * API service for media attachment management.
 */

import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

/**
 * Assigns an encoded file to a specific format on a parent video.
 *
 * @param {number|string} mediaId  The ID of the encoded media attachment.
 * @param {string}        formatId The format identifier.
 * @param {number|string} parentId The ID of the parent video attachment.
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
 * @param {number|string} mediaId The ID of the media attachment to unassign.
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
 * @param {number|string} attachmentId The ID of the attachment to delete.
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
 * Starts a batch process of a particular type.
 *
 * @param {string} type           The type of batch process to start.
 * @param {Object} additionalData Optional. Extra data for the process.
 */
export const startBatchProcess = async (type, additionalData = {}) => {
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
 * Fetches the progress of a batch process.
 *
 * @param {string} type The type of batch process to check.
 */
export const getBatchProgress = async (type) => {
	try {
		return await apiFetch({
			path: addQueryArgs('/videopack/v1/batch/progress', { type }),
		});
	} catch (error) {
		console.error(`Error fetching ${type} batch progress:`, error);
		throw error;
	}
};
