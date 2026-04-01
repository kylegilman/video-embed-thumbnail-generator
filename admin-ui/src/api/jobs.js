/**
 * API service for managing video encoding jobs.
 */

import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { applyFilters } from '@wordpress/hooks';

/**
 * Fetches the current video encoding queue.
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
 * @param {string} action The action to perform (play/pause).
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
 * @param {string} type The type of jobs to clear.
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
 * @param {number|string} jobId The ID of the job to delete.
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
 * @param {number|string} jobId The ID of the job to retry.
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
 * @param {number|string} jobId The ID of the job to remove.
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
 * Creates a new encoding job.
 *
 * @param {number|string} input    The input attachment ID or URL.
 * @param {Array}         outputs  Array of output format IDs.
 * @param {number}        parentId Optional. The parent post ID.
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
 * @param {number|string} jobId The ID of the job to check.
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
 * @param {number|string} input Optional. The input attachment ID or URL to filter by.
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
 * Enqueues a job for multiple video formats.
 *
 * @param {number|string} attachmentId The ID of the video attachment.
 * @param {string}        src          The video source URL.
 * @param {Object}        formats      Object where keys are format IDs and values are booleans.
 * @param {number}        parentId     Optional. The parent post ID.
 */
export const enqueueJob = async (attachmentId, src, formats, parentId = 0) => {
	const outputIds = Object.keys(formats).filter((id) => formats[id]);
	try {
		const response = await createJob(
			attachmentId || src,
			outputIds,
			Number(parentId) || 0
		);
		return {
			...response,
			attachment_id: attachmentId,
		};
	} catch (error) {
		console.error('Error enqueuing job:', error);
		throw error;
	}
};
