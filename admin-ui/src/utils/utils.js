import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

export const getSettings = async () => {
	try {
		return await apiFetch({
			path: '/videopack/v1/settings',
			method: 'GET',
		});
	} catch (error) {
		console.error('Error fetching settings:', error);
		throw error;
	}
};

export const getQueue = async () => {
	try {
		const response = await apiFetch({
			path: '/videopack/v1/queue',
		});
		return response || [];
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

export const getVideoFormats = async (attachmentId) => {
	try {
		return await apiFetch({
			path: `/videopack/v1/formats/${attachmentId}`,
		});
	} catch (error) {
		console.error('Error fetching video formats:', error);
		throw error;
	}
};

export const enqueueJob = async (attachmentId, src, formats) => {
	try {
		return await apiFetch({
			path: `/videopack/v1/queue/${attachmentId}`,
			method: 'POST',
			data: {
				url: src,
				formats,
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

export const saveAllThumbnails = async (attachment_id, thumb_urls) => {
	try {
		return await apiFetch({
			path: '/videopack/v1/thumbs/save_all',
			method: 'POST',
			data: {
				attachment_id,
				thumb_urls,
			},
		});
	} catch (error) {
		console.error('Error saving all thumbnails:', error);
		throw error;
	}
};

export const getVideoGallery = async (args) => {
	try {
		return await apiFetch({
			path: addQueryArgs('/videopack/v1/video_gallery', args),
			method: 'GET',
		});
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
		return await apiFetch({
			path: `/videopack/v1/freemius/${page}`,
		});
	} catch (error) {
		console.error(`Error fetching Freemius page '${page}':`, error);
		throw error;
	}
};

export const getRecentVideos = async (posts) => {
	try {
		return await apiFetch({
			path: `/videopack/v1/recent_videos?posts=${posts}`,
			method: 'GET',
		});
	} catch (error) {
		console.error('Error fetching recent videos:', error);
		throw error;
	}
};

export const testFFmpegCommand = async (codec, resolution, rotate) => {
	try {
		return await apiFetch({
			path: `/videopack/v1/ffmpeg-test/?codec=${codec}&resolution=${resolution}&rotate=${rotate}`,
		});
	} catch (error) {
		console.error('Error testing FFmpeg command:', error);
		throw error;
	}
};

export const getWPSettings = async () => {
	try {
		return await apiFetch({ path: '/wp/v2/settings' });
	} catch (error) {
		console.error('Error fetching WP settings:', error);
		throw error;
	}
};

export const saveWPSettings = async (newSettings) => {
	try {
		return await apiFetch({
			path: '/wp/v2/settings',
			method: 'POST',
			data: {
				videopack_options: newSettings,
			},
		});
	} catch (error) {
		console.error('Error saving WP settings:', error);
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

export const setPosterImage = async (attachment_id, thumb_url) => {
	try {
		return await apiFetch({
			path: '/videopack/v1/thumbs',
			method: 'PUT',
			data: {
				attachment_id,
				thumburl: thumb_url,
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
	generate_button
) => {
	try {
		const path = addQueryArgs('/videopack/v1/thumbs', {
			url,
			total_thumbnails,
			thumbnail_index,
			attachment_id,
			generate_button,
		});

		return await apiFetch({ path });
	} catch (error) {
		console.error('Error generating thumbnail:', error);
		throw error;
	}
};
