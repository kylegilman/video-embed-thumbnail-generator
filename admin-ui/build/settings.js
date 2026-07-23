/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 8533
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* unused harmony export getPresets */
/* unused harmony import specifier */ var apiFetch;
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1455);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_url__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3832);
/* harmony import */ var _wordpress_url__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_url__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2619);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__);
/**
 * API service for video gallery and general media data.
 */

/* global videopack_config */




/**
 * Fetches encoding presets.
 *
 * @param {AbortSignal} signal Optional. Abort signal.
 */
const getPresets = async (signal = null) => {
  try {
    return await apiFetch({
      path: '/videopack/v1/presets',
      signal
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
 * Fetches already grouped and labeled video sources for a player.
 *
 * @param {number|string} attachmentId Optional. The video attachment ID.
 * @param {string}        url          Optional. The video source URL.
 * @param {AbortSignal}   signal       Optional. Abort signal.
 */
const getVideoSources = async (attachmentId = null, url = '', signal = null) => {
  try {
    const query = {
      attachment_id: attachmentId,
      url
    };
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: (0,_wordpress_url__WEBPACK_IMPORTED_MODULE_1__.addQueryArgs)('/videopack/v1/sources', query),
      signal
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }
    console.error('Error fetching video sources:', error);
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
const getVideoFormats = async (attachmentId, url = '', probedMetadata = null, signal = null) => {
  try {
    const query = {};
    if (url) {
      query.url = url;
    }
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
    const presets = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: (0,_wordpress_url__WEBPACK_IMPORTED_MODULE_1__.addQueryArgs)(`/videopack/v1/attachment/${attachmentId}/formats`, query),
      signal
    });
    const merged = {};
    presets.forEach(preset => {
      merged[preset.id] = {
        ...preset,
        format_id: preset.id,
        status: preset.status ? preset.status.toLowerCase() : 'not_encoded',
        id: preset.attachment_id || null
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
const getVideoGallery = async args => {
  /**
   * Filters the video gallery query. Returning a non-undefined value bypasses the REST API call.
   *
   * @since 5.0.0
   *
   * @param {undefined} pre  Defaults to undefined.
   * @param {Object}    args Query parameters.
   */
  const pre = (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__.applyFilters)('videopack.utils.pre_getVideoGallery', undefined, args);
  if (typeof pre !== 'undefined') {
    return pre;
  }
  try {
    const response = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: (0,_wordpress_url__WEBPACK_IMPORTED_MODULE_1__.addQueryArgs)('/videopack/v1/video_gallery', args),
      method: 'GET'
    });
    /**
     * Filters the list of media items returned for the video gallery.
     *
     * @since 5.0.0
     *
     * @param {Object} response REST API response containing video list.
     * @param {Object} args     Query parameters used for fetching.
     */
    return (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__.applyFilters)('videopack.utils.getVideoGallery', response, args);
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
const getUsersWithCapability = async capability => {
  try {
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: `/wp/v2/users?capability=${capability}`,
      method: 'GET'
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
const getFreemiusPage = async page => {
  try {
    let path = `/videopack/v1/freemius/${page}`;
    if (videopack_config.isNetworkAdmin || videopack_config.isNetworkActive) {
      path += '?_fs_network_admin=true';
    }
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path
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
 */
const testEncodeCommand = async (codec, resolution) => {
  /**
   * Filters the FFmpeg test command test response. Bypasses the REST API call if a non-undefined value is returned.
   *
   * @since 5.0.0
   *
   * @param {undefined} pre        Defaults to undefined.
   * @param {string}    codec      The codec to test.
   * @param {string}    resolution Resolution to test.
   */
  const pre = (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__.applyFilters)('videopack.utils.pre_testEncodeCommand', undefined, codec, resolution);
  if (typeof pre !== 'undefined') {
    return pre;
  }
  try {
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: `/videopack/v1/ffmpeg-test/?codec=${codec}&resolution=${resolution}`
    });
  } catch (error) {
    console.error('Error testing encode command:', error);
    throw error;
  }
};
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "EA", 0, /* binding */ getVideoFormats,
/* harmony export */   "M5", 0, /* binding */ getVideoGallery,
/* harmony export */   "UD", 0, /* binding */ testEncodeCommand,
/* harmony export */   "UP", 0, /* binding */ getVideoSources,
/* harmony export */   "V7", 0, /* binding */ getUsersWithCapability,
/* harmony export */   "y4", 0, /* binding */ getFreemiusPage
/* harmony export */ ]);


/***/ },

/***/ 104
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* unused harmony exports getQueue, toggleQueue, clearQueue, retryJob, removeJob, createJob, getJobStatus, resetJob */
/* unused harmony import specifier */ var apiFetch;
/* unused harmony import specifier */ var addQueryArgs;
/* unused harmony import specifier */ var applyFilters;
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1455);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_url__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3832);
/* harmony import */ var _wordpress_url__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_url__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2619);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__);
/**
 * API service for managing video encoding jobs.
 */





/**
 * Fetches the current video encoding queue.
 */
const getQueue = async () => {
  /**
   * Filters the queue listing before fetching from the REST API.
   *
   * @since 5.0.0
   *
   * @param {undefined} pre Defaults to undefined. If a non-undefined value is returned, fetching is bypassed.
   */
  const pre = applyFilters('videopack.utils.pre_getQueue', undefined);
  if (typeof pre !== 'undefined') {
    return pre;
  }
  try {
    const response = await listJobs();
    /**
     * Filters the list of encoding queue jobs retrieved from the server.
     *
     * @since 5.0.0
     *
     * @param {Array} response Array of job objects.
     */
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
const toggleQueue = async action => {
  try {
    return await apiFetch({
      path: '/videopack/v1/jobs/control',
      method: 'POST',
      data: {
        action
      }
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
const clearQueue = async type => {
  try {
    return await apiFetch({
      path: '/videopack/v1/jobs/clear',
      method: 'DELETE',
      data: {
        type
      }
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
const deleteJob = async jobId => {
  try {
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: (0,_wordpress_url__WEBPACK_IMPORTED_MODULE_1__.addQueryArgs)(`/videopack/v1/jobs/${jobId}`, {
        force: true
      }),
      method: 'DELETE'
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
const retryJob = async jobId => {
  try {
    return await apiFetch({
      path: `/videopack/v1/jobs/${jobId}`,
      method: 'POST'
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
const removeJob = async jobId => {
  try {
    return await apiFetch({
      path: addQueryArgs(`/videopack/v1/jobs/${jobId}`, {
        force: false
      }),
      method: 'DELETE'
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
const createJob = async (input, outputs, parentId = 0) => {
  try {
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: '/videopack/v1/jobs',
      method: 'POST',
      data: {
        input,
        outputs,
        parent_id: Number(parentId) || 0
      }
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
const getJobStatus = async jobId => {
  try {
    return await apiFetch({
      path: `/videopack/v1/jobs/${jobId}`
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
const listJobs = async (input = null) => {
  try {
    const path = input ? (0,_wordpress_url__WEBPACK_IMPORTED_MODULE_1__.addQueryArgs)('/videopack/v1/jobs', {
      input
    }) : '/videopack/v1/jobs';
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path
    });
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
const enqueueJob = async (attachmentId, src, formats, parentId = 0) => {
  const outputIds = Object.keys(formats).filter(id => formats[id]);
  try {
    const response = await createJob(attachmentId || src, outputIds, Number(parentId) || 0);
    return {
      ...response,
      attachment_id: attachmentId
    };
  } catch (error) {
    console.error('Error enqueuing job:', error);
    throw error;
  }
};

/**
 * Resets a stuck browser encoding job.
 *
 * @param {number|string} jobId The ID of the job to reset.
 */
const resetJob = async jobId => {
  try {
    return await apiFetch({
      path: `/videopack/v1/browser-queue/job/${jobId}/reset`,
      method: 'POST'
    });
  } catch (error) {
    console.error('Error resetting job:', error);
    throw error;
  }
};
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "Ix", 0, /* binding */ enqueueJob,
/* harmony export */   "N6", 0, /* binding */ listJobs,
/* harmony export */   "XX", 0, /* binding */ deleteJob
/* harmony export */ ]);


/***/ },

/***/ 4263
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* unused harmony export unassignFormat */
/* unused harmony import specifier */ var apiFetch;
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1455);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_url__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3832);
/* harmony import */ var _wordpress_url__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_url__WEBPACK_IMPORTED_MODULE_1__);
/**
 * API service for media attachment management.
 */




/**
 * Assigns an encoded file to a specific format on a parent video.
 *
 * @param {number|string} mediaId  The ID of the encoded media attachment.
 * @param {string}        formatId The format identifier.
 * @param {number|string} parentId The ID of the parent video attachment.
 */
const assignFormat = async (mediaId, formatId, parentId) => {
  try {
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: `/wp/v2/media/${mediaId}`,
      method: 'POST',
      data: {
        meta: {
          '_kgflashmediaplayer-format': formatId,
          '_kgflashmediaplayer-parent': parentId
        }
      }
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
const unassignFormat = async mediaId => {
  try {
    return await apiFetch({
      path: `/wp/v2/media/${mediaId}`,
      method: 'POST',
      data: {
        meta: {
          '_kgflashmediaplayer-format': '',
          '_kgflashmediaplayer-parent': 0
        }
      }
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
const deleteFile = async attachmentId => {
  try {
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: `/wp/v2/media/${attachmentId}?force=true`,
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Deletes a specific video format by ID.
 *
 * @param {number|string} attachmentId The ID of the parent attachment.
 * @param {string}        formatId     The format identifier.
 */
const deleteFormat = async (attachmentId, formatId) => {
  try {
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: `/videopack/v1/attachment/${attachmentId}/format/${formatId}`,
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error deleting format:', error);
    throw error;
  }
};

/**
 * Starts a batch process of a particular type.
 *
 * @param {string} type           The type of batch process to start.
 * @param {Object} additionalData Optional. Extra data for the process.
 */
const startBatchProcess = async (type, additionalData = {}) => {
  try {
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: '/videopack/v1/batch/process',
      method: 'POST',
      data: {
        type,
        ...additionalData
      }
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
const getBatchProgress = async type => {
  try {
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: (0,_wordpress_url__WEBPACK_IMPORTED_MODULE_1__.addQueryArgs)('/videopack/v1/batch/progress', {
        type
      })
    });
  } catch (error) {
    console.error(`Error fetching ${type} batch progress:`, error);
    throw error;
  }
};
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "AO", 0, /* binding */ startBatchProcess,
/* harmony export */   "P_", 0, /* binding */ assignFormat,
/* harmony export */   "Ww", 0, /* binding */ deleteFile,
/* harmony export */   "fH", 0, /* binding */ deleteFormat,
/* harmony export */   "wW", 0, /* binding */ getBatchProgress
/* harmony export */ ]);


/***/ },

/***/ 4602
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* unused harmony exports getNetworkSettings, saveNetworkSettings, resetNetworkSettings */
/* unused harmony import specifier */ var apiFetch;
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1455);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2619);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_1__);
/**
 * API service for managing Videopack settings.
 */



let cachedSettings = null;
let settingsPromise = null;

/**
 * Fetches global Videopack settings.
 */
const getSettings = async () => {
  /**
   * Filters the settings fetching process. Returning a non-undefined value bypasses the REST API call.
   *
   * @since 5.0.0
   *
   * @param {undefined} pre Defaults to undefined.
   */
  const pre = (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_1__.applyFilters)('videopack.utils.pre_getSettings', undefined);
  if (typeof pre !== 'undefined') {
    return pre;
  }
  if (cachedSettings) {
    return cachedSettings;
  }
  if (settingsPromise) {
    return settingsPromise;
  }
  settingsPromise = _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
    path: '/wp/v2/settings'
  }).then(allSettings => {
    const result = allSettings.videopack_options || {};
    cachedSettings = result;
    settingsPromise = null;
    /**
     * Filters the global settings object retrieved from the server.
     *
     * @since 5.0.0
     *
     * @param {Object} settings Global settings options.
     */
    return (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_1__.applyFilters)('videopack.utils.getSettings', cachedSettings);
  }).catch(error => {
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
const saveWPSettings = async newSettings => {
  try {
    const data = {
      videopack_options: newSettings
    };
    const response = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: '/wp/v2/settings',
      method: 'POST',
      data
    });
    const result = response.videopack_options || {};
    cachedSettings = result;
    return cachedSettings;
  } catch (error) {
    console.error('Error saving WP settings:', error);
    throw error;
  }
};

/**
 * Fetches network-wide Videopack settings (Multisite).
 */
const getNetworkSettings = async () => {
  try {
    return await apiFetch({
      path: '/videopack/v1/network/settings'
    });
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
const saveNetworkSettings = async newSettings => {
  try {
    return await apiFetch({
      path: '/videopack/v1/network/settings',
      method: 'POST',
      data: newSettings
    });
  } catch (error) {
    console.error('Error saving network settings:', error);
    throw error;
  }
};

/**
 * Resets network settings to their default values.
 */
const resetNetworkSettings = async () => {
  try {
    return await apiFetch({
      path: '/videopack/v1/network/settings/defaults'
    });
  } catch (error) {
    console.error('Error resetting network settings:', error);
    throw error;
  }
};

/**
 * Resets site-specific Videopack settings to their default values.
 */
const resetVideopackSettings = async () => {
  try {
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: '/videopack/v1/settings/defaults'
    });
  } catch (error) {
    console.error('Error resetting Videopack settings:', error);
    throw error;
  }
};

/**
 * Clears the URL to attachment ID cache.
 */
const clearUrlCache = async () => {
  try {
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: '/videopack/v1/settings/cache',
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error clearing URL cache:', error);
    throw error;
  }
};
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "CZ", 0, /* binding */ saveWPSettings,
/* harmony export */   "XI", 0, /* binding */ clearUrlCache,
/* harmony export */   "mt", 0, /* binding */ getSettings,
/* harmony export */   "zS", 0, /* binding */ resetVideopackSettings
/* harmony export */ ]);


/***/ },

/***/ 2186
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* unused harmony export uploadThumbnail */
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1455);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_url__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3832);
/* harmony import */ var _wordpress_url__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_url__WEBPACK_IMPORTED_MODULE_1__);
/**
 * API service for managing video thumbnails.
 */




/**
 * Converts a canvas to a blob and uploads it as a thumbnail.
 *
 * @param {HTMLCanvasElement} canvas       The canvas containing the frame.
 * @param {number|string}     attachmentId The ID of the video attachment.
 * @param {string}            videoSrc     The source URL of the video.
 * @param {number}            parentId     Optional. The parent post ID.
 * @param {boolean}           featured     Optional. Whether to set as featured image.
 * @param {Object}            extraData    Optional. Additional data to send.
 */
const createThumbnailFromCanvas = (canvas, attachmentId, videoSrc, parentId = 0, featured = null, extraData = {}) => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async blob => {
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
        formData.append('post_name', (0,_wordpress_url__WEBPACK_IMPORTED_MODULE_1__.getFilename)(videoSrc));
        if (featured !== null) {
          formData.append('featured', featured);
        }
        Object.keys(extraData).forEach(key => {
          formData.append(key, extraData[key]);
        });
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
const uploadThumbnail = async formData => {
  try {
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: '/videopack/v1/thumbs/upload',
      method: 'POST',
      body: formData
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
const saveAllThumbnails = async (attachment_id, thumb_urls, parent_id = 0, url = '', featured = null) => {
  try {
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: '/videopack/v1/thumbs/save_all',
      method: 'POST',
      data: {
        attachment_id,
        thumb_urls,
        parent_id: Number(parent_id) || 0,
        url,
        featured
      }
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
const setPosterImage = async (attachment_id, thumb_url, parent_id = 0, url = '', featured = null) => {
  try {
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: '/videopack/v1/thumbs',
      method: 'PUT',
      data: {
        attachment_id,
        thumburl: thumb_url,
        parent_id: Number(parent_id) || 0,
        url,
        featured
      }
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
const generateThumbnail = async (url, total_thumbnails, thumbnail_index, attachment_id, generate_button, parent_id = 0, featured = null, time = null) => {
  try {
    const query = {
      url,
      total_thumbnails,
      thumbnail_index,
      attachment_id,
      generate_button,
      parent_id: Number(parent_id) || 0,
      featured
    };
    if (time !== null && time !== '' && !isNaN(time)) {
      query.time = Number(time);
    }
    const path = (0,_wordpress_url__WEBPACK_IMPORTED_MODULE_1__.addQueryArgs)('/videopack/v1/thumbs', query);
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path,
      parse: false
    });
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw error;
  }
};
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "FD", 0, /* binding */ createThumbnailFromCanvas,
/* harmony export */   "H4", 0, /* binding */ setPosterImage,
/* harmony export */   "I6", 0, /* binding */ generateThumbnail,
/* harmony export */   "sW", 0, /* binding */ saveAllThumbnails
/* harmony export */ ]);


/***/ },

/***/ 9427
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* unused harmony exports insertImage, save, videopackCaption, videopackDuration */
/* unused harmony import specifier */ var _jsxs;
/* unused harmony import specifier */ var _jsx;
/* harmony import */ var _src_icons_json__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5125);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(790);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__);


const createIcon = name => {
  const icon = _src_icons_json__WEBPACK_IMPORTED_MODULE_0__[name];
  if (!icon) {
    return null;
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: icon.viewBox,
    className: "videopack-icon-svg",
    children: icon.paths.map((path, idx) => {
      const props = {};
      Object.keys(path).forEach(key => {
        const propName = key.includes('-') ? key.replace(/-([a-z])/g, g => g[1].toUpperCase()) : key;
        props[propName] = path[key];
      });
      return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
        ...props
      }, idx);
    })
  });
};
const videopack = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("g", {
    transform: "rotate(-45 200.518 199.773)",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("circle", {
      cx: 200.52,
      cy: 199.77,
      r: 182.56,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("circle", {
      cx: 200.52,
      cy: 199.77,
      r: 182.56,
      style: {
        fill: 'none',
        stroke: '#cd0000',
        strokeMiterlimit: 100,
        strokeWidth: 30
      }
    })]
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M98.37 124.52h45.81l57.42 98.69 55.57-98.69h47.48L201.51 303.03 98.37 125.9"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m257.17 124.52-55.57 98.69-57.42-98.69"
  })]
});
const videopackCaption = /*#__PURE__*/(/* unused pure expression or super */ null && (_jsxs("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/_jsx("path", {
    d: "M43.63 341.01c-12.65 0-23-9.2-23-22.61v-.77c0-13.03 9.97-22.61 23-22.61s23.38 9.2 23.38 22.61v.77c0 13.42-9.97 22.61-23.38 22.61m69.37 0c-12.65 0-23-9.2-23-22.61v-.77c0-13.03 9.97-22.61 23-22.61s23.38 9.2 23.38 22.61v.77c0 13.42-9.97 22.61-23.38 22.61m69.37 0c-12.65 0-23-9.2-23-22.61v-.77c0-13.03 9.97-22.61 23-22.61s23.38 9.2 23.38 22.61v.77c0 13.42-9.97 22.61-23.38 22.61",
    style: {
      fill: '#cd0000'
    }
  }), /*#__PURE__*/_jsx("circle", {
    cx: 198.31,
    cy: 159.72,
    r: 69.82,
    style: {
      fill: '#fff'
    }
  }), /*#__PURE__*/_jsx("circle", {
    cx: 198.31,
    cy: 159.72,
    r: 69.82,
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: '11.47px'
    }
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M169.53 198.78v-17.51l37.74-21.96-37.74-21.26v-18.16l68.27 39.45-67.74 39.44"
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m169.53 138.05 37.74 21.26-37.74 21.96"
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 19
    },
    d: "M14.4 55.65h372.22V264.9H14.4z"
  })]
})));
const videopackCollection = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 14
    },
    d: "M12.01 84.61h170.53v93.84H12.01zm210.09 0h170.53v93.84H222.1zM12.01 221.62h170.53v93.84H12.01zm210.09 0h170.53v93.84H222.1z"
  })
});
const videopackDuration = /*#__PURE__*/(/* unused pure expression or super */ null && (_jsx("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: /*#__PURE__*/_jsx("path", {
    d: "m67.87 129.5-8.65 32.21h26.11l8.65-32.21h15.26l-8.65 32.21h17.29v12.71H97.2L90.59 199h18.99v12.71H87.2l-8.31 31.36H63.63l8.31-31.36H45.83l-8.31 31.36H22.26l8.31-31.36H12.43V199h21.53l6.61-24.58H20.74v-12.71h23.22l8.65-32.21zm-18.65 69.51h26.11l6.61-24.58H55.83zm94.08-5.09c-5.59 0-10.17-4.07-10.17-10v-.34c0-5.76 4.41-10 10.17-10s10.34 4.07 10.34 10v.34c0 5.93-4.41 10-10.34 10m0 50.86c-5.59 0-10.17-4.07-10.17-10v-.34c0-5.76 4.41-10 10.17-10s10.34 4.07 10.34 10v.34c0 5.93-4.41 10-10.34 10m81.03-115.28-8.65 32.21h26.11l8.65-32.21h15.26l-8.65 32.21h17.29v12.71h-20.68L247.05 199h18.99v12.71h-22.38l-8.31 31.36h-15.26l8.31-31.36h-26.11l-8.31 31.36h-15.26l8.31-31.36h-18.14V199h21.53l6.61-24.58H177.2v-12.71h23.22l8.65-32.21zm-18.65 69.51h26.11l6.61-24.58h-26.11zm135.96-69.51-8.65 32.21h26.11l8.65-32.21h15.26l-8.65 32.21h17.29v12.71h-20.68L364.36 199h18.99v12.71h-22.38l-8.31 31.36H337.4l8.31-31.36H319.6l-8.31 31.36h-15.26l8.31-31.36H286.2V199h21.53l6.61-24.58h-19.83v-12.71h23.22l8.65-32.21zm-18.65 69.51h26.11l6.61-24.58H329.6z",
    style: {
      fill: '#cd0000'
    }
  })
})));
const videopackGallery = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 14
    },
    d: "M8.14 84.54h170.53v93.84H8.14z"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("g", {
    transform: "rotate(-5.65 92.234 131.62)",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("circle", {
      cx: 92.16,
      cy: 131.51,
      r: 34.87,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("circle", {
      cx: 92.16,
      cy: 131.51,
      r: 34.87,
      style: {
        fill: 'none',
        stroke: '#cd0000',
        strokeMiterlimit: 100,
        strokeWidth: '5.73px'
      }
    })]
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M77.79 151.02v-8.75l18.85-10.97-18.85-10.61v-9.07l34.1 19.7-33.84 19.7"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m77.79 120.69 18.85 10.61-18.85 10.97"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 14
    },
    d: "M220.87 84.54H391.4v93.84H220.87z"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("g", {
    transform: "rotate(-5.65 309.192 131.66)",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("circle", {
      cx: 308.89,
      cy: 131.51,
      r: 34.87,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("circle", {
      cx: 308.89,
      cy: 131.51,
      r: 34.87,
      style: {
        fill: 'none',
        stroke: '#cd0000',
        strokeMiterlimit: 100,
        strokeWidth: '5.73px'
      }
    })]
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M294.51 151.02v-8.75l18.85-10.97-18.85-10.61v-9.07l34.1 19.7-33.83 19.7"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m294.51 120.69 18.85 10.61-18.85 10.97"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 14
    },
    d: "M8.14 221.62h170.53v93.84H8.14z"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("g", {
    transform: "rotate(-5.65 92.268 268.846)",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("circle", {
      cx: 92.16,
      cy: 268.58,
      r: 34.87,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("circle", {
      cx: 92.16,
      cy: 268.58,
      r: 34.87,
      style: {
        fill: 'none',
        stroke: '#cd0000',
        strokeMiterlimit: 100,
        strokeWidth: '5.73px'
      }
    })]
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M77.79 288.09v-8.75l18.85-10.96-18.85-10.62v-9.07l34.1 19.7-33.84 19.7"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m77.79 257.76 18.85 10.62-18.85 10.96"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 14
    },
    d: "M220.87 221.62H391.4v93.84H220.87z"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("g", {
    transform: "rotate(-5.65 309.13 268.78)",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("circle", {
      cx: 308.89,
      cy: 268.58,
      r: 34.87,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("circle", {
      cx: 308.89,
      cy: 268.58,
      r: 34.87,
      style: {
        fill: 'none',
        stroke: '#cd0000',
        strokeMiterlimit: 100,
        strokeWidth: '5.73px'
      }
    })]
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M294.51 288.09v-8.75l18.85-10.96-18.85-10.62v-9.07l34.1 19.7-33.83 19.7"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m294.51 257.76 18.85 10.62-18.85 10.96"
  })]
});
const videopackList = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 14
    },
    d: "M111.79 6.56h185.1v101.85h-185.1z"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("g", {
    transform: "rotate(-5.65 205.384 57.57)",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("circle", {
      cx: 205.16,
      cy: 57.53,
      r: 37.85,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("circle", {
      cx: 205.16,
      cy: 57.53,
      r: 37.85,
      style: {
        fill: 'none',
        stroke: '#cd0000',
        strokeMiterlimit: 100,
        strokeWidth: '6.22px'
      }
    })]
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M189.56 78.71v-9.49l20.46-11.91-20.46-11.52v-9.84l37 21.38-36.72 21.38"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m189.56 45.79 20.46 11.52-20.46 11.91"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 14
    },
    d: "M111.79 148.88h185.1v101.85h-185.1z"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("g", {
    transform: "rotate(-5.65 205.365 199.974)",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("circle", {
      cx: 205.16,
      cy: 199.85,
      r: 37.85,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("circle", {
      cx: 205.16,
      cy: 199.85,
      r: 37.85,
      style: {
        fill: 'none',
        stroke: '#cd0000',
        strokeMiterlimit: 100,
        strokeWidth: '6.22px'
      }
    })]
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M189.56 221.03v-9.5l20.46-11.9-20.46-11.52v-9.85l37 21.39-36.72 21.38"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m189.56 188.11 20.46 11.52-20.46 11.9"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 14
    },
    d: "M111.79 290.2h185.1v101.85h-185.1z"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("g", {
    transform: "rotate(-5.65 205.392 341.466)",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("circle", {
      cx: 205.16,
      cy: 341.17,
      r: 37.85,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("circle", {
      cx: 205.16,
      cy: 341.17,
      r: 37.85,
      style: {
        fill: 'none',
        stroke: '#cd0000',
        strokeMiterlimit: 100,
        strokeWidth: '6.22px'
      }
    })]
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M189.56 362.35v-9.5l20.46-11.9-20.46-11.52v-9.85l37 21.38-36.72 21.39"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m189.56 329.43 20.46 11.52-20.46 11.9"
  })]
});
const videopackLoop = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    d: "M352.41 199.29c-.01 35.29-28.64 63.89-63.93 63.88-29.13-.01-54.56-19.72-61.85-47.92l-.17-.73-.24-.71-15.43-45.44-.1.05c-17.16-54.81-75.5-85.33-130.31-68.17-43.31 13.56-72.82 53.64-72.92 99.02-.01 57.4 46.51 103.95 103.91 103.97 13 0 25.88-2.43 37.98-7.18l-14.62-37.27c-32.86 12.87-69.94-3.33-82.81-36.19s3.33-69.94 36.19-82.81 69.94 3.33 82.81 36.19c.94 2.39 1.73 4.84 2.37 7.33l.24-.07 14.5 42.78c14.88 55.47 71.91 88.38 127.38 73.5 45.38-12.17 76.96-53.25 77.05-100.24.01-57.4-46.51-103.95-103.92-103.96-12.97 0-25.82 2.42-37.9 7.15l14.59 37.29c32.87-12.85 69.94 3.39 82.78 36.26 2.9 7.41 4.38 15.3 4.38 23.26",
    style: {
      fill: '#cd0000'
    }
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M90.65 230.42v-13.6l29.3-17.05-29.3-16.49v-14.1l52.99 30.62-52.58 30.62"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m90.65 183.28 29.3 16.49-29.3 17.05"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M266.39 230.42v-13.6l29.29-17.05-29.29-16.49v-14.1l52.99 30.62-52.58 30.62"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m266.39 183.28 29.29 16.49-29.29 17.05"
  })]
});
const videopackPagination = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("rect", {
    x: 4,
    y: 127.95,
    width: 117.18,
    height: 117.18,
    rx: 7,
    ry: 7,
    style: {
      fill: '#cd0000'
    }
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    d: "M69.1 210.32h-6.2v-38.03c-2.51 1.67-6.39 2.51-11.64 2.51v-4.88c7.59 0 11.94-2.92 13.06-8.77h4.78v49.18Z",
    style: {
      fill: '#fff'
    }
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("rect", {
    x: 145.36,
    y: 131.95,
    width: 109.18,
    height: 109.18,
    rx: 3,
    ry: 3,
    style: {
      fill: '#fff'
    }
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    d: "M250.54 135.95v101.18H149.36V135.95zm1-8H148.36c-3.87 0-7 3.13-7 7v103.18c0 3.87 3.13 7 7 7h103.18c3.87 0 7-3.13 7-7V134.95c0-3.87-3.13-7-7-7",
    style: {
      fill: '#cd0000'
    }
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    d: "M215.24 210.32h-32.03c0-2.95.91-5.76 2.74-8.44s5.17-5.99 10.04-9.91 8.21-7.06 10.01-9.4 2.7-5 2.7-7.97c0-2.66-.77-4.75-2.31-6.28s-3.71-2.29-6.5-2.29c-2.42 0-4.49.77-6.2 2.31s-2.68 3.8-2.9 6.79h-6.43c.35-4.24 1.92-7.64 4.7-10.17 2.78-2.54 6.44-3.81 10.97-3.81 4.82 0 8.53 1.29 11.15 3.88 2.62 2.58 3.92 5.82 3.92 9.71 0 3.52-.97 6.62-2.9 9.32-1.94 2.69-5.78 6.44-11.53 11.23q-8.625 7.185-8.79 9.3h23.35v5.74Z",
    style: {
      fill: '#cd0000'
    }
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("rect", {
    x: 282.73,
    y: 131.95,
    width: 109.18,
    height: 109.18,
    rx: 3,
    ry: 3,
    style: {
      fill: '#fff'
    }
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    d: "M387.91 135.95v101.18H286.73V135.95zm1-8H285.73c-3.87 0-7 3.13-7 7v103.18c0 3.87 3.13 7 7 7h103.18c3.87 0 7-3.13 7-7V134.95c0-3.87-3.13-7-7-7",
    style: {
      fill: '#cd0000'
    }
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    d: "m325.77 171.83 4.27-4.39 26.58 22.19-26.58 22.19-4.27-4.35 21.55-17.76z",
    style: {
      fill: '#cd0000'
    }
  })]
});
const videopackPlayButton = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("g", {
    transform: "rotate(-45 205.37 193.523)",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("circle", {
      cx: 205.37,
      cy: 193.52,
      r: 87.51,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("circle", {
      cx: 205.37,
      cy: 193.52,
      r: 87.51,
      style: {
        fill: 'none',
        stroke: '#cd0000',
        strokeMiterlimit: 100,
        strokeWidth: '14.38px'
      }
    })]
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M169.29 242.49v-21.96l47.31-27.52-47.31-26.64V143.6l85.58 49.45-84.91 49.44"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m169.29 166.37 47.31 26.64-47.31 27.52"
  })]
});
const videopackPlayer = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("circle", {
    cx: 197.8,
    cy: 200.99,
    r: 69.82,
    style: {
      fill: '#fff'
    }
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("circle", {
    cx: 197.8,
    cy: 200.99,
    r: 69.82,
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: '11.47px'
    }
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M169.02 240.06v-17.52l37.74-21.96-37.74-21.25v-18.16l68.27 39.44-67.74 39.45"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m169.02 179.33 37.74 21.25-37.74 21.96"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 19
    },
    d: "M13.89 96.92h372.22v209.25H13.89z"
  })]
});
const videopackThumbnail = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M170.16 207.08v-19.61l42.27-24.6-42.27-23.8v-20.34l76.46 44.18-75.86 44.17"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m170.16 139.07 42.27 23.8-42.27 24.6M46.7 364.45c-6.58 0-10.96-4.39-10.96-10.96v-52.62l89.9-65.78 65.78 41.66c6.58 4.39 15.35 4.39 19.73-2.19l76.74-74.55 76.74 74.55v78.94c0 6.58-4.39 10.96-10.96 10.96"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    d: "M353.83 2.67H46.85c-24.12 0-43.86 19.74-43.86 43.86v306.98c0 24.12 19.73 43.85 43.85 43.85h306.98c24.12 0 43.85-19.73 43.85-43.85V46.53c0-24.12-19.73-43.85-43.85-43.85Zm10.96 350.83c0 6.58-4.39 10.96-10.96 10.96H46.85c-6.58 0-10.96-4.39-10.96-10.96v-52.62l89.9-65.78 65.78 41.66c6.58 4.39 15.35 4.39 19.73-2.19l76.74-74.55 76.74 74.55v78.94Zm-85.63-188.64c-.79.64-1.49 1.39-2.08 2.27l-78.94 76.74-63.59-43.85c-.57-.38-1.14-.72-1.71-1.03a77 77 0 0 1-8.68-35.6c0-42.74 34.77-77.51 77.51-77.51s77.51 34.77 77.51 77.51c0 .49-.03.98-.04 1.48Zm85.63 65.85-65.68-63.49c.05-1.28.08-2.56.08-3.84 0-53.77-43.74-97.51-97.51-97.51s-97.51 43.74-97.51 97.51c0 14.16 3.04 27.63 8.49 39.78l-74.58 53.86V46.53c.05-5.27 2.19-10.96 8.77-10.96h306.98c6.58 0 10.96 4.39 10.96 10.96v184.19Z",
    style: {
      fill: '#cd0000'
    }
  })]
});
const videopackTitle = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M1.92 52.81h396.16v285.84H1.92z"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    d: "M295.68 87.22v44.5h-72.27V311.4h-53.54V131.72H97.6v-44.5z",
    style: {
      fill: '#fff'
    }
  })]
});
const videopackVideo = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("circle", {
    cx: 199.66,
    cy: 198.62,
    r: 47.96,
    style: {
      fill: '#fff'
    }
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("circle", {
    cx: 199.66,
    cy: 198.62,
    r: 47.96,
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: '7.88px'
    }
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M179.89 225.45v-12.03l25.92-15.09-25.92-14.59v-12.48l46.9 27.1-46.54 27.09"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m179.89 183.74 25.92 14.59-25.92 15.09"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: '13.05px'
    },
    d: "M73.32 127.13h255.7v143.75H73.32z"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: '7.16px'
    },
    d: "M3.38 3.56h393.28v393.28H3.38z"
  })]
});
const videopackViewCount = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m8.57 162.7 71.81 40.43-71.81 41.79"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M8.46 250.14V227.9l47.92-27.88-47.92-26.98v-23.05l86.68 50.07-86 50.08m169.59-93.16-6.47 24.1h19.53l6.47-24.1h11.41l-6.47 24.1h12.94v9.51h-15.47l-4.95 18.39h14.2v9.51h-16.74l-6.21 23.46h-11.41l6.21-23.46h-19.53l-6.21 23.46h-11.41l6.21-23.46h-13.57v-9.51h16.11l4.95-18.39h-14.84v-9.51h17.37l6.47-24.1zm-13.95 51.99h19.53l4.95-18.39h-19.53zm101.7-51.99-6.47 24.1h19.53l6.47-24.1h11.41l-6.47 24.1h12.94v9.51h-15.47l-4.95 18.39h14.2v9.51h-16.74l-6.21 23.46h-11.41l6.21-23.46h-19.53l-6.21 23.46h-11.41l6.21-23.46h-13.57v-9.51h16.11l4.95-18.39h-14.84v-9.51h17.37l6.47-24.1zm-13.95 51.99h19.53l4.95-18.39h-19.53zm101.7-51.99-6.47 24.1h19.53l6.47-24.1h11.41l-6.47 24.1h12.94v9.51h-15.47l-4.95 18.39h14.2v9.51h-16.74l-6.21 23.46h-11.41l6.21-23.46h-19.53l-6.21 23.46h-11.41l6.21-23.46h-13.57v-9.51h16.11l4.95-18.39h-14.84v-9.51h17.37l6.47-24.1zm-13.95 51.99h19.53l4.95-18.39h-19.53z"
  })]
});
const videopackWatermark = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("g", {
    style: {
      opacity: 0.2
    },
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("g", {
      transform: "rotate(-45 201.506 200.804)",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("circle", {
        cx: 201.51,
        cy: 200.8,
        r: 121.45,
        style: {
          fill: '#fff'
        }
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("circle", {
        cx: 201.51,
        cy: 200.8,
        r: 121.45,
        style: {
          fill: 'none',
          stroke: '#cd0000',
          strokeMiterlimit: 100,
          strokeWidth: '19.96px'
        }
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
      style: {
        fill: '#cd0000'
      },
      d: "M133.55 150.74h30.48l38.2 65.65 36.97-65.65h31.58l-68.61 118.75-68.62-117.83"
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
      style: {
        fill: '#ff9ca1'
      },
      d: "m239.2 150.74-36.97 65.65-38.2-65.65"
    })]
  })
});
const volumeDown = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "currentColor",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    d: "M0 0h24v24H0V0z",
    fill: "none"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    d: "M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"
  })]
});
const volumeUp = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "currentColor",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    d: "M0 0h24v24H0V0z",
    fill: "none"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    d: "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
  })]
});
const save = /*#__PURE__*/(/* unused pure expression or super */ null && (_jsxs("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "currentColor",
  children: [/*#__PURE__*/_jsx("path", {
    d: "M0 0h24v24H0V0z",
    fill: "none"
  }), /*#__PURE__*/_jsx("path", {
    d: "M17 3H3v18h18V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"
  })]
})));
const insertImage = /*#__PURE__*/(/* unused pure expression or super */ null && (_jsx("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "currentColor",
  children: /*#__PURE__*/_jsx("path", {
    d: "M21 21V3H3v18h18zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
  })
})));
const sortAscending = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "currentColor",
  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    d: "M19 17H22L18 21L14 17H17V3H19M2 17H12V19H2M6 5V7H2V5M2 11H9V13H2V11Z"
  })
});
const sortDescending = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "currentColor",
  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    d: "M19 7H22L18 3L14 7H17V21H19M2 17H12V19H2M6 5V7H2V5M2 11H9V13H2V11Z"
  })
});
const play = createIcon('play');
const pause = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "currentColor",
  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    d: "M6 19h4V5H6v14zm8-14v14h4V5h-4z"
  })
});
const playOutline = createIcon('playOutline');
const shareAlt1 = createIcon('iosShare');
const shareAlt2 = createIcon('external');
const shareAlt3 = createIcon('curveShare');
const download = createIcon('download');
const share = createIcon('share');
const close = createIcon('close');
const embed = createIcon('embed');
const copyLink = createIcon('copyLink');
const bluesky = createIcon('bluesky');
const threads = createIcon('threads');
const facebook = createIcon('facebook');
const reddit = createIcon('reddit');
const email = createIcon('email');

/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "D1", 0, /* binding */ videopackList,
/* harmony export */   "E6", 0, /* binding */ embed,
/* harmony export */   "Jm", 0, /* binding */ videopackWatermark,
/* harmony export */   "Kx", 0, /* binding */ volumeUp,
/* harmony export */   "L8", 0, /* binding */ sortDescending,
/* harmony export */   "L_", 0, /* binding */ shareAlt2,
/* harmony export */   "N8", 0, /* binding */ reddit,
/* harmony export */   "RG", 0, /* binding */ download,
/* harmony export */   "Rp", 0, /* binding */ email,
/* harmony export */   "S", 0, /* binding */ copyLink,
/* harmony export */   "SM", 0, /* binding */ shareAlt3,
/* harmony export */   "Sr", 0, /* binding */ shareAlt1,
/* harmony export */   "TI", 0, /* binding */ videopackLoop,
/* harmony export */   "Tv", 0, /* binding */ videopackCollection,
/* harmony export */   "U9", 0, /* binding */ videopackVideo,
/* harmony export */   "V0", 0, /* binding */ sortAscending,
/* harmony export */   "V2", 0, /* binding */ facebook,
/* harmony export */   "VN", 0, /* binding */ close,
/* harmony export */   "Vx", 0, /* binding */ videopackPlayButton,
/* harmony export */   "ZH", 0, /* binding */ play,
/* harmony export */   "Zp", 0, /* binding */ videopackThumbnail,
/* harmony export */   "bl", 0, /* binding */ videopackPagination,
/* harmony export */   "eD", 0, /* binding */ threads,
/* harmony export */   "i4", 0, /* binding */ videopackPlayer,
/* harmony export */   "nl", 0, /* binding */ videopackGallery,
/* harmony export */   "pZ", 0, /* binding */ volumeDown,
/* harmony export */   "uM", 0, /* binding */ share,
/* harmony export */   "uj", 0, /* binding */ bluesky,
/* harmony export */   "v0", 0, /* binding */ videopackViewCount,
/* harmony export */   "v7", 0, /* binding */ pause,
/* harmony export */   "vT", 0, /* binding */ videopackTitle,
/* harmony export */   "zT", 0, /* binding */ videopack,
/* harmony export */   "zs", 0, /* binding */ playOutline
/* harmony export */ ]);


/***/ },

/***/ 7957
(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {


// EXTERNAL MODULE: external ["wp","blocks"]
var external_wp_blocks_ = __webpack_require__(4997);
// EXTERNAL MODULE: external ["wp","blockEditor"]
var external_wp_blockEditor_ = __webpack_require__(4715);
// EXTERNAL MODULE: ./src/components/VideopackContextBridge.js
var VideopackContextBridge = __webpack_require__(4773);
// EXTERNAL MODULE: external ["wp","data"]
var external_wp_data_ = __webpack_require__(7143);
// EXTERNAL MODULE: external ["wp","element"]
var external_wp_element_ = __webpack_require__(6087);
// EXTERNAL MODULE: external ["wp","components"]
var external_wp_components_ = __webpack_require__(6427);
// EXTERNAL MODULE: ./node_modules/@wordpress/icons/build-module/library/plus.mjs
var plus = __webpack_require__(7809);
// EXTERNAL MODULE: external ["wp","i18n"]
var external_wp_i18n_ = __webpack_require__(7723);
// EXTERNAL MODULE: ./src/api/settings.js
var settings = __webpack_require__(4602);
// EXTERNAL MODULE: ./src/hooks/useVideoQuery.js
var useVideoQuery = __webpack_require__(7877);
// EXTERNAL MODULE: ./src/components/InspectorControls/CollectionInspectorControls.js
var CollectionInspectorControls = __webpack_require__(8806);
// EXTERNAL MODULE: ./src/hooks/useVideopackContext.js
var useVideopackContext = __webpack_require__(5633);
// EXTERNAL MODULE: ./src/utils/VideopackContext.js
var VideopackContext = __webpack_require__(5597);
// EXTERNAL MODULE: ./src/utils/galleryVideoSelection.js
var galleryVideoSelection = __webpack_require__(1087);
// EXTERNAL MODULE: ./src/utils/templates.js
var templates = __webpack_require__(2629);
// EXTERNAL MODULE: external "ReactJSXRuntime"
var external_ReactJSXRuntime_ = __webpack_require__(790);
;// ./src/blocks/collection/edit.js
/* global videopack_config */
















const ALLOWED_BLOCKS = ['videopack/loop', 'videopack/pagination'];

// Collection is a valid theme-context root (Overlays.scss) — nested blocks
// inherit the skin class/CSS vars from here rather than each needing their own.
const COLLECTION_CONTEXT_OPTS = {
  excludeHoverTrigger: true,
  classKeys: ['skin']
};
function Edit({
  attributes,
  setAttributes,
  clientId,
  context,
  isSelected
}) {
  const [options, setOptions] = (0,external_wp_element_.useState)();
  const {
    layout = 'grid',
    columns = 3,
    currentPage = 1,
    gallery_per_page,
    isEditingAllPages = false,
    variation
  } = attributes;

  // Resolve Effective Values for design and pagination (these follow global settings)
  const vpContext = (0,useVideopackContext/* default */.Ay)(attributes, context, COLLECTION_CONTEXT_OPTS);
  const {
    resolved: effectiveValues,
    style: contextStyle,
    classes: collectionClasses
  } = vpContext;
  const {
    hasPaginationBlock,
    isNewlyInserted,
    hasSelectedInnerBlock
  } = (0,external_wp_data_.useSelect)(select => {
    const {
      getBlocks,
      getBlock,
      hasSelectedInnerBlock: hasSelectedInner
    } = select('core/block-editor');
    const blocks = getBlocks(clientId) || [];
    const block = getBlock(clientId);
    return {
      hasPaginationBlock: blocks.some(b => b.name === 'videopack/pagination'),
      isNewlyInserted: block && !block.attributes.gallery_id && !block.attributes.gallery_category && !block.attributes.gallery_tag && !block.attributes.gallery_include,
      // Shallow (direct children only) — Collection's own appender
      // adds a sibling to Loop/Pagination at the top level, so it
      // should only show while working with that top-level
      // structure, not e.g. while deep inside editing a
      // thumbnail's title text. A deep check (like Thumbnail/Loop
      // use for their own, much narrower trees) would leave it
      // visible almost continuously, since nearly all editing
      // happens somewhere inside the collection's tree.
      hasSelectedInnerBlock: hasSelectedInner(clientId)
    };
  }, [clientId]);

  // Only show Collection's own "Add block" appender while this block (or
  // a direct child, Loop/Pagination) is actively selected.
  const showCollectionAppender = isSelected || hasSelectedInnerBlock;
  const previewPostId = (0,external_wp_data_.useSelect)(
  // core/editor is only registered inside a real post-editing screen —
  // undefined in other contexts this component can be previewed in.
  select => select('core/editor')?.getCurrentPostId?.() ?? null, []);

  // Signals the Loop child (which renders the visible grid via its own
  // useVideoQuery call) to refetch when a video is added but no attribute
  // actually changes — see handleSelectVideos below. Passed down through
  // the context bridge as videopack/refreshToken; a plain attribute touch
  // doesn't work here since useVideoQuery's fetch effect depends on
  // individual primitive fields, not object identity, so re-setting a
  // value to itself is a no-op as far as its dependency array is concerned.
  const [refreshToken, setRefreshToken] = (0,external_wp_element_.useState)(0);

  /**
   * Handles video(s) selected/uploaded via the "Add Video" toolbar button.
   * Mirrors the Loop block's own control (same shared decision logic) so
   * it doesn't matter which of the two a user reaches for.
   *
   * @param {Object|Array} media Selected attachment object(s).
   */
  const handleSelectVideos = (0,external_wp_element_.useCallback)(media => {
    const result = (0,galleryVideoSelection/* resolveGalleryVideoSelection */.i)({
      media,
      gallerySource: attributes.gallery_source,
      galleryInclude: attributes.gallery_include,
      previewPostId
    });
    if (result.type === 'update') {
      setAttributes(result.updates);
    } else if (result.type === 'no-change') {
      // A freshly uploaded file is already attached to this post,
      // so no attribute changes — just force the Loop child to refetch.
      setRefreshToken(prev => prev + 1);
    }
  }, [attributes.gallery_source, attributes.gallery_include, previewPostId, setAttributes]);

  /**
   * Opens the media frame for the "Add Video" toolbar button. Uses the raw
   * wp.media() API directly rather than the <MediaUpload> React component
   * — that component's componentWillUnmount calls frame.remove() whenever
   * it unmounts (e.g. when this block is deselected right after the modal
   * closes), which can race with an in-progress React render and crash
   * with "Attempted to synchronously unmount a root while React was
   * already rendering."
   */
  const openAddVideoFrame = (0,external_wp_element_.useCallback)(() => {
    const frame = window.wp.media({
      title: (0,external_wp_i18n_.__)('Add Video', 'video-embed-thumbnail-generator'),
      button: {
        text: (0,external_wp_i18n_.__)('Add', 'video-embed-thumbnail-generator')
      },
      multiple: true,
      library: {
        type: 'video'
      }
    });
    frame.on('select', () => {
      handleSelectVideos(frame.state().get('selection').toJSON());
    });
    frame.open();
  }, [handleSelectVideos]);
  const queryParams = (0,external_wp_element_.useMemo)(() => {
    let galleryPerPage = -1;
    if (effectiveValues.isPreview) {
      galleryPerPage = 2;
    } else if (hasPaginationBlock) {
      galleryPerPage = gallery_per_page || effectiveValues.gallery_per_page;
    } else if (effectiveValues.enable_collection_video_limit) {
      galleryPerPage = effectiveValues.collection_video_limit || effectiveValues.gallery_per_page;
    }
    return {
      ...attributes,
      gallery_pagination: hasPaginationBlock,
      gallery_per_page: galleryPerPage,
      page_number: currentPage || 1
    };
  }, [attributes, hasPaginationBlock, effectiveValues.isPreview, effectiveValues.gallery_per_page, effectiveValues.enable_collection_video_limit, effectiveValues.collection_video_limit, gallery_per_page, currentPage]);
  // We fetch query data to power the live preview template and pagination info
  const queryData = (0,useVideoQuery/* default */.A)(queryParams, previewPostId, refreshToken);
  (0,external_wp_element_.useEffect)(() => {
    (0,settings/* getSettings */.mt)().then(response => {
      setOptions(response);
    });
  }, []);

  // We no longer hydrate design attributes from options here to avoid bloat.
  // The VideopackContextBridge and useVideopackContext hook handle inheritance
  // dynamically, so we only save attributes that are explicitly changed.

  // Resolve blockGap value for use in internal grid spacing
  const resolvedBlockGap = (0,external_wp_element_.useMemo)(() => {
    const gap = attributes.style?.spacing?.blockGap;
    if (!gap) {
      return undefined;
    }

    // Handle Gutenberg preset variables: var:preset|spacing|X -> var(--wp--preset--spacing--X)
    if (typeof gap === 'string' && gap.startsWith('var:preset|spacing|')) {
      return gap.replace('var:preset|spacing|', 'var(--wp--preset--spacing--') + ')';
    }
    return gap;
  }, [attributes.style?.spacing?.blockGap]);

  // Dynamic Template based on global settings (only used for new blocks)
  const dynamicTemplate = (0,external_wp_element_.useMemo)(() => {
    if (layout === 'list') {
      return (0,templates/* getListTemplate */.bb)(options);
    }
    // Base block (no variation) defaults to Feed template for grid layout
    if (layout === 'grid' && !variation) {
      return (0,templates/* getFeedTemplate */.jV)(options);
    }
    return (0,templates/* getGridTemplate */.D9)(options);
  }, [layout, variation, options]);
  const blockProps = (0,external_wp_blockEditor_.useBlockProps)({
    style: {
      ...contextStyle,
      '--videopack-collection-columns': columns,
      '--videopack-collection-gap': resolvedBlockGap,
      containerType: 'inline-size'
    },
    className: ['videopack-collection', 'videopack-wrapper', `layout-${layout}`, `columns-${columns}`,
    // If no explicit align is set, apply the effective (global) align class
    !attributes.align && effectiveValues.align ? `align${effectiveValues.align}` : '', effectiveValues.isPreview ? 'is-preview' : '', collectionClasses].filter(Boolean).join(' ')
  });
  const videos = (0,external_wp_element_.useMemo)(() => {
    if (queryData.videoResults && queryData.videoResults.length > 0) {
      return queryData.videoResults;
    }
    if (effectiveValues.isPreview) {
      return [{
        attachment_id: 10001,
        title: 'Sample Video 1',
        poster_url: videopack_config.url + '/src/images/Adobestock_469037984_thumb1.jpg',
        url: videopack_config.url + '/src/images/Adobestock_469037984.mp4',
        player_vars: {
          sources: [{
            src: videopack_config.url + '/src/images/Adobestock_469037984.mp4'
          }]
        }
      }, {
        attachment_id: 10002,
        title: 'Sample Video 2',
        poster_url: videopack_config.url + '/src/images/Adobestock_287460179_thumb1.jpg',
        url: videopack_config.url + '/src/images/Adobestock_287460179.mp4',
        player_vars: {
          sources: [{
            src: videopack_config.url + '/src/images/Adobestock_287460179.mp4'
          }]
        }
      }, {
        attachment_id: 10003,
        title: 'Sample Video 3',
        poster_url: videopack_config.url + '/src/images/Adobestock_469037984_thumb1.jpg',
        url: videopack_config.url + '/src/images/Adobestock_469037984.mp4'
      }, {
        attachment_id: 10004,
        title: 'Sample Video 4',
        poster_url: videopack_config.url + '/src/images/Adobestock_287460179_thumb1.jpg',
        url: videopack_config.url + '/src/images/Adobestock_287460179.mp4'
      }, {
        attachment_id: 10005,
        title: 'Sample Video 5',
        poster_url: videopack_config.url + '/src/images/Adobestock_469037984_thumb1.jpg',
        url: videopack_config.url + '/src/images/Adobestock_469037984.mp4'
      }, {
        attachment_id: 10006,
        title: 'Sample Video 6',
        poster_url: videopack_config.url + '/src/images/Adobestock_287460179_thumb1.jpg',
        url: videopack_config.url + '/src/images/Adobestock_287460179.mp4'
      }];
    }
    return [];
  }, [queryData.videoResults, effectiveValues.isPreview]);

  // The 'videos' array is used for live preview only and should not be persisted
  // to block attributes to avoid bloat. The PHP renderer fetches these dynamically.

  const videopackContextValue = {
    gallery_pagination: hasPaginationBlock,
    gallery_per_page: effectiveValues.gallery_per_page,
    totalPages: queryData.maxNumPages,
    currentPage,
    videos
  };

  // Lets the Loop child's own "Add Video" button (when the upload is already
  // attached to this post and no attribute changes) trigger a refetch here
  // too — Collection's own query is what actually supplies `videos` above
  // in the common nested case, and context can't flow child-to-parent, so
  // this callback is how Loop reaches back up to it.
  const refreshVideos = (0,external_wp_element_.useCallback)(() => setRefreshToken(prev => prev + 1), []);
  const bridgeOverrides = (0,external_wp_element_.useMemo)(() => ({
    'videopack/gallery_pagination': hasPaginationBlock,
    'videopack/totalPages': queryData.maxNumPages,
    'videopack/videos': videos,
    'videopack/refreshVideos': refreshVideos
  }), [hasPaginationBlock, queryData.maxNumPages, videos, refreshVideos]);

  // If options haven't loaded yet for a newly inserted block, don't render InnerBlocks
  // to prevent the wrong template from being applied.
  // We skip this check for previews to ensure they render immediately.
  if (!options && isNewlyInserted && !effectiveValues.isPreview) {
    return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
      ...blockProps,
      className: (blockProps.className || '') + ' ' + collectionClasses,
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "videopack-collection-placeholder",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Spinner, {})
      })
    });
  }
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.InspectorControls, {
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CollectionInspectorControls/* default */.A, {
        clientId: clientId,
        attributes: attributes,
        setAttributes: setAttributes,
        queryData: queryData,
        options: options,
        hasPaginationBlock: hasPaginationBlock,
        isEditingAllPages: isEditingAllPages
      })
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.BlockControls, {
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarGroup, {
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          icon: plus/* default */.A,
          label: (0,external_wp_i18n_.__)('Add Video', 'video-embed-thumbnail-generator'),
          onClick: openAddVideoFrame
        })
      })
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
      ...blockProps,
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(VideopackContextBridge/* default */.A, {
        attributes: attributes,
        context: context,
        overrides: bridgeOverrides,
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(VideopackContext/* VideopackProvider */.Yh, {
          value: videopackContextValue,
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.InnerBlocks, {
            allowedBlocks: ALLOWED_BLOCKS,
            template: dynamicTemplate,
            renderAppender: showCollectionAppender ? external_wp_blockEditor_.InnerBlocks.ButtonBlockAppender : false
          })
        })
      })
    })]
  });
}
;// ./src/blocks/collection/save.js


function save() {
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.InnerBlocks.Content, {});
}
;// ./src/blocks/collection/block.json
const block_namespaceObject = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"videopack/collection","title":"Videopack Collection","category":"media","icon":"grid-view","description":"A composable grid or list layout for displaying videos.","supports":{"html":false,"align":["left","right","center","wide","full"],"color":{"background":true,"text":true,"link":true},"spacing":{"margin":true,"padding":true,"blockGap":true},"filter":{"duotone":true}},"selectors":{"filter":{"duotone":".wp-block-videopack-collection .videopack-thumbnail, .wp-block-videopack-collection .vjs-poster img, .wp-block-videopack-collection .vjs-poster, .wp-block-videopack-collection .mejs-poster img, .wp-block-videopack-collection .mejs-poster"}},"attributes":{"skin":{"type":"string"},"layout":{"type":"string","default":"grid"},"columns":{"type":"number","default":3},"gallery_source":{"type":"string","default":"current"},"gallery_id":{"type":"number","default":0},"gallery_category":{"type":"string","default":""},"gallery_tag":{"type":"string","default":""},"gallery_orderby":{"type":"string","default":"post_date"},"gallery_order":{"type":"string","default":"DESC"},"gallery_include":{"type":"string","default":""},"gallery_exclude":{"type":"string","default":""},"gallery_per_page":{"type":"number"},"currentPage":{"type":"number","default":1},"views":{"type":"boolean"},"overlay_title":{"type":"boolean"},"gallery_align":{"type":"string"},"enable_collection_video_limit":{"type":"boolean"},"collection_video_limit":{"type":"number"},"collectionId":{"type":"string"},"isEditingAllPages":{"type":"boolean","default":false},"prioritizePostData":{"type":"boolean","default":false},"variation":{"type":"string"},"isPreview":{"type":"boolean","default":false},"videos":{"type":"array"}},"example":{"attributes":{"gallery_source":"recent","gallery_per_page":2,"columns":2,"isPreview":true}},"textdomain":"video-embed-thumbnail-generator","editorScript":"file:./index.js","editorStyle":"file:./index.css"}');
// EXTERNAL MODULE: ./src/assets/icon.js
var icon = __webpack_require__(9427);
// EXTERNAL MODULE: ./src/blocks/shared/design-context.js
var design_context = __webpack_require__(6545);
;// ./src/blocks/collection/index.js






(0,external_wp_blocks_.registerBlockType)(block_namespaceObject.name, {
  ...block_namespaceObject,
  icon: icon/* videopackCollection */.Tv,
  attributes: {
    ...block_namespaceObject.attributes,
    ...design_context/* designAttributes */.qz
  },
  edit: Edit,
  save: save
});
(0,external_wp_blocks_.registerBlockVariation)(block_namespaceObject.name, [{
  name: 'gallery',
  title: 'Videopack Gallery',
  description: 'Display a modular grid of videos.',
  icon: icon/* videopackGallery */.nl,
  attributes: {
    layout: 'grid',
    variation: 'gallery'
  },
  scope: ['inserter', 'transform'],
  example: {
    attributes: {
      layout: 'grid',
      gallery_source: 'recent',
      columns: 2,
      gallery_per_page: 2,
      isPreview: true
    }
  },
  isActive: blockAttributes => blockAttributes.variation === 'gallery'
}, {
  name: 'list',
  title: 'Videopack List',
  description: 'Display a modular list of videos with overlays.',
  icon: icon/* videopackList */.D1,
  attributes: {
    layout: 'list',
    variation: 'list'
  },
  scope: ['inserter', 'transform'],
  example: {
    attributes: {
      layout: 'list',
      gallery_source: 'recent',
      gallery_per_page: 2,
      isPreview: true
    }
  },
  isActive: blockAttributes => blockAttributes.variation === 'list'
}]);

/***/ },

/***/ 7093
(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {


// EXTERNAL MODULE: external ["wp","blocks"]
var external_wp_blocks_ = __webpack_require__(4997);
// EXTERNAL MODULE: external ["wp","element"]
var external_wp_element_ = __webpack_require__(6087);
// EXTERNAL MODULE: external ["wp","blockEditor"]
var external_wp_blockEditor_ = __webpack_require__(4715);
// EXTERNAL MODULE: external ["wp","components"]
var external_wp_components_ = __webpack_require__(6427);
// EXTERNAL MODULE: ./node_modules/@wordpress/icons/build-module/icon/index.mjs
var build_module_icon = __webpack_require__(319);
// EXTERNAL MODULE: ./node_modules/@wordpress/icons/build-module/library/media-and-text.mjs
var media_and_text = __webpack_require__(7133);
// EXTERNAL MODULE: ./src/assets/icon.js
var assets_icon = __webpack_require__(9427);
// EXTERNAL MODULE: external ["wp","i18n"]
var external_wp_i18n_ = __webpack_require__(7723);
// EXTERNAL MODULE: ./src/components/CompactColorPicker/CompactColorPicker.js
var CompactColorPicker = __webpack_require__(6312);
// EXTERNAL MODULE: ./src/utils/colors.js
var colors = __webpack_require__(7068);
// EXTERNAL MODULE: ./src/hooks/useVideopackContext.js
var useVideopackContext = __webpack_require__(5633);
// EXTERNAL MODULE: ./src/hooks/useVideopackData.js
var useVideopackData = __webpack_require__(8516);
// EXTERNAL MODULE: ./src/hooks/useVideoFormats.js
var useVideoFormats = __webpack_require__(5869);
;// ./src/utils/downloadMenu.js
/**
 * Format a resolution value the same way as video-quality-selector.js res_label.
 *
 * @param {string|number} res Resolution value.
 * @return {string} Display label.
 */
function formatDownloadResolutionLabel(res) {
  if (res === undefined || res === null || res === '') {
    return '';
  }
  const value = String(res);
  if (/^\d+$/.test(value)) {
    return `${value}p`;
  }
  return value;
}

/**
 * Build a download item from a player source entry.
 *
 * @param {Object} source Player source object.
 * @return {{label: string, src: string}|null} Menu item or null if not downloadable.
 */
function sourceToDownloadItem(source) {
  const resolution = source.resolution || source['data-res'];
  const src = source.src || source.url || '';
  if (!resolution || !src) {
    return null;
  }
  return {
    label: formatDownloadResolutionLabel(resolution),
    src
  };
}

/**
 * Sort download items by resolution descending (matches quality selector).
 *
 * @param {Array} items Download items.
 * @return {Array} Sorted items.
 */
function sortDownloadItems(items) {
  return [...items].sort((a, b) => {
    const aNum = parseInt(String(a.label), 10);
    const bNum = parseInt(String(b.label), 10);
    if (Number.isNaN(aNum) || Number.isNaN(bNum)) {
      return 0;
    }
    return bNum - aNum;
  });
}

/**
 * Build download menu structure from player source_groups (same rules as quality selector).
 *
 * @param {Object} sourceGroups Grouped sources { codecId: { label, sources } }.
 * @return {{hasMultipleCodecs: boolean, groups: Array, flatItems: Array}} Menu structure.
 */
function buildDownloadMenuFromSourceGroups(sourceGroups) {
  if (!sourceGroups || typeof sourceGroups !== 'object' || Array.isArray(sourceGroups)) {
    return {
      hasMultipleCodecs: false,
      groups: [],
      flatItems: []
    };
  }
  const groupIds = Object.keys(sourceGroups);
  if (groupIds.length > 1) {
    const groups = groupIds.map(groupId => {
      const group = sourceGroups[groupId] || {};
      const items = sortDownloadItems((group.sources || []).map(sourceToDownloadItem).filter(Boolean));
      return {
        id: groupId,
        label: group.label || groupId,
        items
      };
    }).filter(group => group.items.length > 0);
    return {
      hasMultipleCodecs: groups.length > 1,
      groups,
      flatItems: []
    };
  }
  const flatItems = [];
  groupIds.forEach(groupId => {
    const group = sourceGroups[groupId] || {};
    (group.sources || []).forEach(source => {
      const item = sourceToDownloadItem(source);
      if (item) {
        flatItems.push(item);
      }
    });
  });
  return {
    hasMultipleCodecs: false,
    groups: [],
    flatItems: sortDownloadItems(flatItems)
  };
}

/**
 * Mock menu items for editor preview when no sources are loaded.
 *
 * @return {Array} Mock flat items.
 */
function getMockDownloadMenuItems() {
  return [{
    label: '1080p',
    src: '#'
  }, {
    label: '720p',
    src: '#'
  }, {
    label: '480p',
    src: '#'
  }];
}
// EXTERNAL MODULE: external "ReactJSXRuntime"
var external_ReactJSXRuntime_ = __webpack_require__(790);
;// ./src/blocks/download/edit.js
/* global videopack_config */













const CLASS_KEYS = ['title_color', 'title_background_color'];

/**
 * Edit component for the Videopack Video Download block.
 *
 * @param {Object}   root0               Component props.
 * @param {Object}   root0.attributes    Block attributes.
 * @param {Function} root0.setAttributes Attribute setter.
 * @param {Object}   root0.context       Block context.
 * @param {boolean}  root0.isSelected    Whether the block is selected.
 * @return {Element}                     The rendered component.
 */
function Edit({
  attributes,
  setAttributes,
  context,
  isSelected
}) {
  const vpContext = (0,useVideopackContext/* default */.Ay)(attributes, context, {
    classKeys: CLASS_KEYS
  });
  const {
    icon = true,
    text = false,
    styleType = 'text',
    downloadMode = 'direct',
    textAlign,
    title_color,
    title_background_color
  } = attributes;
  const isInsideThumbnail = !!context['videopack/isInsideThumbnail'];
  const isInsidePlayerOverlay = !!context['videopack/isInsidePlayerOverlay'];
  const isInsideTitleMeta = !!context['videopack/isInsideTitleMeta'];
  const isOverlay = isInsideThumbnail || isInsidePlayerOverlay && !isInsideTitleMeta;
  const colorFallbacks = (0,external_wp_element_.useMemo)(() => (0,colors/* getColorFallbacks */.l)({
    title_color: vpContext.resolved.title_color,
    title_background_color: vpContext.resolved.title_background_color
  }), [vpContext.resolved.title_color, vpContext.resolved.title_background_color]);
  const defaultAlign = (0,external_wp_element_.useMemo)(() => {
    if (isInsideThumbnail) {
      return 'center';
    }
    return 'left';
  }, [isInsideThumbnail]);
  const finalTextAlign = textAlign || context['videopack/textAlign'] || defaultAlign;
  const position = attributes.position || context['videopack/position'] || 'top';
  const attachmentId = vpContext.resolved.attachmentId;
  const videoSrc = vpContext.resolved.src;
  const {
    data: vpData,
    isResolving: isResolvingVideopack
  } = (0,useVideopackData/* default */.A)('videopack', context);
  const contextSourceGroups = context['videopack/source_groups'];
  const hasContextSourceGroups = contextSourceGroups && typeof contextSourceGroups === 'object' && !Array.isArray(contextSourceGroups) && Object.keys(contextSourceGroups).length > 0;

  // Skip in preview contexts — there's no real attachment behind the
  // hardcoded bundled sample video, so this can never resolve anything
  // useful, and previews get rebuilt on every unrelated settings change.
  const {
    formats: fetchedSourceGroups,
    isLoading: isLoadingSources
  } = (0,useVideoFormats/* useVideoFormats */.l)(!hasContextSourceGroups && attachmentId && !vpContext.resolved.isPreview ? attachmentId : null, !hasContextSourceGroups && !attachmentId && videoSrc && !vpContext.resolved.isPreview ? videoSrc : null);
  const sourceGroups = (0,external_wp_element_.useMemo)(() => {
    if (hasContextSourceGroups) {
      return contextSourceGroups;
    }
    if (vpData?.source_groups && Object.keys(vpData.source_groups).length > 0) {
      return vpData.source_groups;
    }
    if (fetchedSourceGroups && Object.keys(fetchedSourceGroups).length > 0) {
      return fetchedSourceGroups;
    }
    return {};
  }, [hasContextSourceGroups, contextSourceGroups, vpData, fetchedSourceGroups]);
  const downloadMenu = (0,external_wp_element_.useMemo)(() => {
    const menu = buildDownloadMenuFromSourceGroups(sourceGroups);
    if (menu.hasMultipleCodecs || menu.flatItems.length > 0) {
      return menu;
    }
    if (isLoadingSources || isResolvingVideopack) {
      return {
        hasMultipleCodecs: false,
        groups: [],
        flatItems: []
      };
    }
    return {
      hasMultipleCodecs: false,
      groups: [],
      flatItems: getMockDownloadMenuItems()
    };
  }, [sourceGroups, isLoadingSources, isResolvingVideopack]);
  const blockProps = (0,external_wp_blockEditor_.useBlockProps)({
    className: `videopack-download-block videopack-download-wrapper ${vpContext.classes} ${isOverlay ? `is-overlay position-${position}` : ''} ${isInsideThumbnail ? 'is-inside-thumbnail' : ''} ${isInsidePlayerOverlay ? 'is-inside-player' : ''} ${isInsideTitleMeta ? 'is-inside-title-meta' : ''} has-text-align-${finalTextAlign} mode-${downloadMode}`,
    style: {
      ...vpContext.style,
      display: 'inline-flex',
      alignItems: 'center'
    }
  });
  const THEME_COLORS = videopack_config?.themeColors;
  const [isOpen, setIsOpen] = (0,external_wp_element_.useState)(false);
  const [openSubmenu, setOpenSubmenu] = (0,external_wp_element_.useState)(null);
  const menuContainerRef = (0,external_wp_element_.useRef)(null);
  (0,external_wp_element_.useEffect)(() => {
    if (downloadMode !== 'menu') {
      setIsOpen(false);
      setOpenSubmenu(null);
    }
  }, [downloadMode]);
  (0,external_wp_element_.useEffect)(() => {
    if (!isOpen) {
      return undefined;
    }
    const handleOutside = event => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(event.target)) {
        setIsOpen(false);
        setOpenSubmenu(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);
  (0,external_wp_element_.useEffect)(() => {
    if (!isSelected) {
      setIsOpen(false);
      setOpenSubmenu(null);
    }
  }, [isSelected]);
  const triggerClassName = `videopack-download-trigger videopack-icons style-${styleType}${isOpen ? ' is-active' : ''}`;
  const linkClassName = `videopack-download-link videopack-icons style-${styleType}`;
  const renderTriggerContent = () => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
    children: [icon && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(build_module_icon/* default */.A, {
      icon: assets_icon/* download */.RG,
      className: "videopack-icon-svg download-icon"
    }), text && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
      className: "videopack-download-text-label",
      children: (0,external_wp_i18n_.__)('Download', 'video-embed-thumbnail-generator')
    })]
  });
  const renderFlatMenuItems = formats => formats.map((format, index) => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("li", {
    children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("button", {
      type: "button",
      onClick: e => e.preventDefault(),
      className: "videopack-download-link",
      children: format.label
    })
  }, index));
  const renderMenuList = () => {
    if (downloadMenu.hasMultipleCodecs) {
      return downloadMenu.groups.map(group => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("li", {
        className: `videopack-download-menu-item videopack-has-submenu${openSubmenu === group.id ? ' is-open' : ''}`,
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("button", {
          type: "button",
          className: "videopack-download-submenu-trigger",
          "aria-expanded": openSubmenu === group.id,
          onClick: e => {
            e.preventDefault();
            e.stopPropagation();
            setOpenSubmenu(openSubmenu === group.id ? null : group.id);
          },
          children: group.label
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("ul", {
          className: `videopack-download-submenu${openSubmenu === group.id ? ' is-visible' : ''}`,
          children: renderFlatMenuItems(group.items)
        })]
      }, group.id));
    }
    return renderFlatMenuItems(downloadMenu.flatItems);
  };
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_blockEditor_.BlockControls, {
      children: [isOverlay && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.BlockVerticalAlignmentControl, {
        value: position,
        onChange: nextPosition => {
          setAttributes({
            position: nextPosition || undefined
          });
        }
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.AlignmentControl, {
        value: finalTextAlign,
        onChange: nextAlign => {
          setAttributes({
            textAlign: nextAlign
          });
        }
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.ToolbarGroup, {
        label: (0,external_wp_i18n_.__)('Toggle Visuals', 'video-embed-thumbnail-generator'),
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          icon: assets_icon/* download */.RG,
          label: (0,external_wp_i18n_.__)('Toggle Icon', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            icon: !icon
          }),
          isPressed: icon
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          icon: media_and_text/* default */.A,
          label: (0,external_wp_i18n_.__)('Toggle Text', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            text: !text
          }),
          isPressed: text
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.ToolbarGroup, {
        label: (0,external_wp_i18n_.__)('Style Type', 'video-embed-thumbnail-generator'),
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          label: (0,external_wp_i18n_.__)('Link Style', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            styleType: 'text'
          }),
          isPressed: styleType === 'text',
          children: (0,external_wp_i18n_.__)('Link', 'video-embed-thumbnail-generator')
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          label: (0,external_wp_i18n_.__)('Button Style', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            styleType: 'button'
          }),
          isPressed: styleType === 'button',
          children: (0,external_wp_i18n_.__)('Button', 'video-embed-thumbnail-generator')
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.ToolbarGroup, {
        label: (0,external_wp_i18n_.__)('Download Mode', 'video-embed-thumbnail-generator'),
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          label: (0,external_wp_i18n_.__)('Direct Link', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            downloadMode: 'direct'
          }),
          isPressed: downloadMode === 'direct',
          children: (0,external_wp_i18n_.__)('Direct', 'video-embed-thumbnail-generator')
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          label: (0,external_wp_i18n_.__)('Quality Dropdown Menu', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            downloadMode: 'menu'
          }),
          isPressed: downloadMode === 'menu',
          children: (0,external_wp_i18n_.__)('Menu', 'video-embed-thumbnail-generator')
        })]
      })]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.InspectorControls, {
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelBody, {
        title: (0,external_wp_i18n_.__)('Colors', 'video-embed-thumbnail-generator'),
        initialOpen: true,
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "videopack-color-section",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("p", {
            className: "videopack-settings-section-title",
            children: (0,external_wp_i18n_.__)('Colors', 'video-embed-thumbnail-generator')
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            className: "videopack-color-flex-row",
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker/* default */.A, {
                label: (0,external_wp_i18n_.__)('Text', 'video-embed-thumbnail-generator'),
                value: title_color,
                onChange: value => setAttributes({
                  title_color: value
                }),
                colors: THEME_COLORS,
                fallbackValue: colorFallbacks.title_color
              })
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker/* default */.A, {
                label: (0,external_wp_i18n_.__)('Background', 'video-embed-thumbnail-generator'),
                value: title_background_color,
                onChange: value => setAttributes({
                  title_background_color: value
                }),
                colors: THEME_COLORS,
                fallbackValue: colorFallbacks.title_background_color
              })
            })]
          })]
        })
      })
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
      ...blockProps,
      children: downloadMode === 'menu' ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-download-menu-container",
        ref: menuContainerRef,
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("button", {
          type: "button",
          className: triggerClassName,
          "aria-expanded": isOpen,
          "aria-haspopup": "true",
          onClick: e => {
            e.preventDefault();
            setIsOpen(!isOpen);
            if (isOpen) {
              setOpenSubmenu(null);
            }
          },
          children: [renderTriggerContent(), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
            className: "videopack-caret",
            children: "\u25BC"
          })]
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
          className: `videopack-download-dropdown-menu${isOpen ? ' is-visible' : ''}`,
          onClick: e => e.stopPropagation(),
          onKeyDown: e => e.stopPropagation(),
          role: "presentation",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("ul", {
            children: renderMenuList()
          })
        })]
      }) : /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("button", {
        type: "button",
        className: linkClassName,
        onClick: e => e.preventDefault(),
        children: renderTriggerContent()
      })
    })]
  });
}
;// ./src/blocks/download/save.js
function save() {
  return null;
}
;// ./src/blocks/download/block.json
const block_namespaceObject = /*#__PURE__*/JSON.parse('{"UU":"videopack/download"}');
;// ./src/blocks/download/index.js







(0,external_wp_blocks_.registerBlockType)(block_namespaceObject.UU, {
  icon: assets_icon/* download */.RG,
  edit: Edit,
  save: save
});

/***/ },

/***/ 3185
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4715);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6087);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(790);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__);



/**
 * Renders a real, disabled preview of a grid item's template blocks — built on
 * the real Edit components (via useBlockPreview) rather than a hand-maintained
 * parallel reimplementation, so the preview and the real thing can never drift
 * apart. Mirrors core/post-template's own preview pattern. Per-video data
 * flows in purely through the ambient BlockContextProvider the caller already
 * wraps this in — this component takes no video-specific props at all.
 *
 * Shared between edit.js's static (preview-mode) grid and SortableGrid.js's
 * interactive (real-editor) grid, so both paths render each item identically.
 *
 * @param {Object}   root0            Component props.
 * @param {Array}    root0.blocks     The template blocks to preview.
 * @param {boolean}  root0.isHidden   Whether to hide (not unmount) this preview.
 * @param {Function} root0.onActivate Callback to make this item's video active.
 */

const LoopItemPreview = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.memo)(function LoopItemPreview({
  blocks,
  isHidden,
  onActivate
}) {
  const previewProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__.__experimentalUseBlockPreview)({
    blocks,
    props: {
      className: 'wp-block-videopack-loop__item-preview'
    }
  });
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
    ...previewProps,
    style: isHidden ? {
      display: 'none'
    } : undefined,
    onClick: onActivate,
    onKeyPress: onActivate,
    role: "button",
    tabIndex: 0
  });
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (LoopItemPreview);
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "A", 0, /* export default binding */ __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ ]);


/***/ },

/***/ 7678
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ buildItemContext)
/* harmony export */ });
/**
 * Builds the per-item BlockContextProvider value for one grid item in
 * videopack/loop's grid — shared between edit.js's static (preview-mode)
 * grid and SortableGrid.js's interactive (real-editor) grid, so both paths
 * feed identical per-video data to the templated blocks (thumbnail, title,
 * etc) and can never drift apart.
 *
 * @param {Object} video                          A single video record from the query results.
 * @param {Object} root1                           Extra context needed to compute values.
 * @param {Object} root1.context                   This Loop instance's own inherited block context.
 * @param {Object} root1.vpContext                 This Loop instance's resolved videopack context.
 * @param {string} root1.resolvedDuotoneClass       Duotone class shared across all items.
 * @param {number} root1.totalPagesCount            Total pages, for context consumers like Pagination.
 * @param {number} root1.totalResultsCount          Total results, for context consumers like Pagination.
 * @return {Object} The BlockContextProvider value for this item.
 */
function buildItemContext(video, {
  context,
  vpContext,
  resolvedDuotoneClass,
  totalPagesCount,
  totalResultsCount
}) {
  const targetPostId = vpContext.resolved.prioritizePostData && video.parent_id ? video.parent_id : video.attachment_id || video.id;
  const targetPostType = vpContext.resolved.prioritizePostData && video.parent_id ? 'post' : 'attachment';
  return {
    ...context,
    ...vpContext.sharedContext,
    postId: targetPostId,
    postType: targetPostType,
    'videopack/postId': targetPostId,
    'videopack/postType': targetPostType,
    'videopack/attachmentId': video.attachment_id || video.id,
    'videopack/title': video.title,
    'videopack/caption': video.caption,
    // Gallery.php's collection_page() only ever nests the view count inside
    // player_vars.starts — there's no top-level views/starts field on the
    // video object itself (unlike poster_url/duration, which do exist
    // top-level). Checking the wrong paths here always resolved to
    // undefined, forcing view-count to fall back to a REST fetch for
    // every item regardless of its actual count.
    'videopack/views': video.player_vars?.starts,
    'videopack/duration': video.duration || video.meta?.['_videopack-meta']?.duration,
    'videopack/embedlink': video.embed_url || video.player_vars?.full_player_html || '',
    'videopack/parentPostId': video.parent_id,
    'videopack/totalPages': totalPagesCount,
    'videopack/totalResults': totalResultsCount,
    'videopack/loopDuotoneId': resolvedDuotoneClass,
    'videopack/poster': video.poster_url || video.player_vars?.poster
  };
}

/***/ },

/***/ 2331
(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {


// EXTERNAL MODULE: external ["wp","blocks"]
var external_wp_blocks_ = __webpack_require__(4997);
;// ./src/blocks/loop/block.json
const block_namespaceObject = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"videopack/loop","version":"0.1.0","title":"Videopack Loop","category":"theme","parent":["videopack/collection"],"description":"Video loop template.","supports":{"html":false,"reusable":false,"inserter":false,"filter":{"duotone":true}},"selectors":{"filter":{"duotone":".wp-block-videopack-loop .videopack-thumbnail, .wp-block-videopack-loop .vjs-poster img, .wp-block-videopack-loop .vjs-poster, .wp-block-videopack-loop .mejs-poster img, .wp-block-videopack-loop .mejs-poster"}},"attributes":{"isPreview":{"type":"boolean","default":false}},"textdomain":"video-embed-thumbnail-generator","editorScript":"file:./index.js","editorStyle":"file:./index.css"}');
// EXTERNAL MODULE: external ["wp","blockEditor"]
var external_wp_blockEditor_ = __webpack_require__(4715);
// EXTERNAL MODULE: external ["wp","data"]
var external_wp_data_ = __webpack_require__(7143);
// EXTERNAL MODULE: external ["wp","i18n"]
var external_wp_i18n_ = __webpack_require__(7723);
// EXTERNAL MODULE: external ["wp","components"]
var external_wp_components_ = __webpack_require__(6427);
// EXTERNAL MODULE: external ["wp","element"]
var external_wp_element_ = __webpack_require__(6087);
// EXTERNAL MODULE: ./node_modules/@wordpress/icons/build-module/library/plus.mjs
var plus = __webpack_require__(7809);
// EXTERNAL MODULE: ./src/hooks/useVideoQuery.js
var useVideoQuery = __webpack_require__(7877);
// EXTERNAL MODULE: ./src/hooks/useVideopackContext.js
var useVideopackContext = __webpack_require__(5633);
// EXTERNAL MODULE: ./src/utils/VideopackContext.js
var VideopackContext = __webpack_require__(5597);
// EXTERNAL MODULE: ./src/utils/context.js
var utils_context = __webpack_require__(6225);
// EXTERNAL MODULE: ./src/api/settings.js
var settings = __webpack_require__(4602);
// EXTERNAL MODULE: ./src/api/gallery.js
var gallery = __webpack_require__(8533);
// EXTERNAL MODULE: ./src/utils/galleryVideoSelection.js
var galleryVideoSelection = __webpack_require__(1087);
// EXTERNAL MODULE: ./src/components/InspectorControls/CollectionInspectorControls.js
var CollectionInspectorControls = __webpack_require__(8806);
// EXTERNAL MODULE: ./src/blocks/loop/LoopItemPreview.js
var LoopItemPreview = __webpack_require__(3185);
// EXTERNAL MODULE: ./src/blocks/loop/buildItemContext.js
var buildItemContext = __webpack_require__(7678);
// EXTERNAL MODULE: external "ReactJSXRuntime"
var external_ReactJSXRuntime_ = __webpack_require__(790);
;// ./src/blocks/loop/edit.js


















// @dnd-kit (and the drag/reorder chrome it powers) is only ever functional
// in the real, editable block editor — never in a disabled preview (Settings
// page, Classic Editor, Attachment Details), where useBlockPreview makes
// everything inert anyway. Lazy-loading it here means webpack splits it into
// its own chunk that those preview-only bundles never request, since they
// always render the static grid branch below instead.

const SortableGrid = (0,external_wp_element_.lazy)(() => __webpack_require__.e(/* import() | loop-sortable-grid */ "loop-sortable-grid").then(__webpack_require__.bind(__webpack_require__, 1116)));

/**
 * @param {Object}   props               Component props.
 * @param {Object}   props.context       Block context.
 * @param {string}   props.clientId      Block client ID.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Block attributes setter.
 * @param            props.isSelected
 * @return {Element}              The rendered component.
 */
function Edit({
  attributes,
  setAttributes,
  context,
  clientId,
  isSelected
}) {
  const vpContext = (0,useVideopackContext/* default */.Ay)(attributes, context, {
    excludeHoverTrigger: true
  });
  const vpData = (0,VideopackContext/* useVideopackContext */.Vy)();
  const [options, setOptions] = (0,external_wp_element_.useState)({});
  // Which grid item currently shows real, editable InnerBlocks — keyed by
  // video/attachment ID (not array index) so it survives reorders/add/remove,
  // matching core/post-template's activeBlockContextId pattern.
  const [activeVideoKey, setActiveVideoKey] = (0,external_wp_element_.useState)(null);
  const {
    updateBlockAttributes
  } = (0,external_wp_data_.useDispatch)('core/block-editor');
  const prevInheritedDuotone = (0,external_wp_element_.useRef)();
  const {
    effectiveDuotone,
    inheritedDuotone,
    previewPostId,
    isSaving,
    isAutosaving,
    parentAttributes,
    hasPaginationBlock,
    isEditingAllPages,
    parentClientId,
    hasSelectedInnerBlock
  } = (0,external_wp_data_.useSelect)(select => {
    const {
      getBlocks,
      getBlockAttributes,
      getBlockRootClientId,
      hasSelectedInnerBlock: hasSelectedInner
    } = select('core/block-editor');
    // core/editor is only registered inside a real post-editing screen
    // (Gutenberg's own editor) — it's undefined in other contexts this
    // component can be previewed in (e.g. a real block preview mounted
    // outside a post editor), so every selector here must be optional.
    const editorStore = select('core/editor');
    const isSavingPost = editorStore?.isSavingPost;
    const isAutosavingPost = editorStore?.isAutosavingPost;
    const getCurrentPostId = editorStore?.getCurrentPostId;
    const parentId = getBlockRootClientId(clientId);
    const blocks = getBlocks(clientId) || [];
    const parentAttrs = parentId ? getBlockAttributes(parentId) : {};
    const parentBlocks = parentId ? getBlocks(parentId) : [];
    const hasPagination = parentBlocks.some(b => b.name === 'videopack/pagination');

    // Helper to find a block by name recursively in the inner blocks tree
    const findBlockRecursive = (blockList, names) => {
      const nameArray = Array.isArray(names) ? names : [names];
      for (const block of blockList) {
        if (nameArray.includes(block.name)) {
          return block;
        }
        if (block.innerBlocks && block.innerBlocks.length > 0) {
          const found = findBlockRecursive(block.innerBlocks, nameArray);
          if (found) {
            return found;
          }
        }
      }
      return null;
    };
    const childBlocks = findBlockRecursive(blocks, ['videopack/thumbnail', 'videopack/player-container']);
    const presetDuotone = attributes?.style?.color?.duotone || attributes?.duotone || parentAttrs?.duotone || parentAttrs?.style?.color?.duotone || childBlocks?.attributes?.duotone || childBlocks?.attributes?.style?.color?.duotone;
    const isEditingAll = !!parentAttrs.isEditingAllPages;
    return {
      effectiveDuotone: presetDuotone,
      inheritedDuotone: parentAttrs?.duotone || parentAttrs?.style?.color?.duotone || childBlocks?.attributes?.style?.color?.duotone || childBlocks?.attributes?.duotone,
      previewPostId: getCurrentPostId ? getCurrentPostId() : null,
      isSaving: isSavingPost ? isSavingPost() : false,
      isAutosaving: isAutosavingPost ? isAutosavingPost() : false,
      parentAttributes: parentAttrs,
      hasPaginationBlock: hasPagination,
      isEditingAllPages: isEditingAll,
      parentClientId: parentId,
      hasSelectedInnerBlock: hasSelectedInner(clientId)
    };
  }, [clientId, attributes?.duotone, attributes?.style?.color?.duotone]);

  // Only show Loop's own "Add block" appender while this block (or one of
  // its children) is actively selected, so it doesn't clutter the editor
  // whenever some unrelated block elsewhere on the page is selected.
  const showLoopAppender = isSelected || hasSelectedInnerBlock;

  // Drag-and-drop reordering (see SortableGrid.js) can't safely persist
  // gallery_source/gallery_include the instant a drag ends — it first has
  // to fetch the collection's full, unpaginated ID list so freezing into
  // manual mode doesn't silently drop videos that aren't on the current
  // page. That fetch is fast but not instant, so this flag lets the
  // Inspector's Source/Order-by fields show "Manual"/"Manually Sorted"
  // right away — purely a display override (see inspectorAttributes
  // below), never written to the real block attributes — so the label
  // doesn't lag a beat behind the reorder the user just saw happen.
  const [isReorderPending, setIsReorderPending] = (0,external_wp_element_.useState)(false);
  (0,external_wp_element_.useEffect)(() => {
    (0,settings/* getSettings */.mt)().then(response => {
      setOptions(response);
    });
  }, []);

  // We get query-related attributes from the parent collection block via context.
  const queryAttributes = (0,external_wp_element_.useMemo)(() => ({
    gallery_source: context['videopack/gallery_source'],
    gallery_id: context['videopack/gallery_id'],
    gallery_category: context['videopack/gallery_category'],
    gallery_tag: context['videopack/gallery_tag'],
    gallery_orderby: context['videopack/gallery_orderby'],
    gallery_order: context['videopack/gallery_order'],
    gallery_include: context['videopack/gallery_include'],
    gallery_exclude: context['videopack/gallery_exclude'],
    gallery_pagination: isEditingAllPages ? false : vpContext.resolved.gallery_pagination,
    gallery_per_page: isEditingAllPages ? -1 : vpContext.resolved.gallery_per_page,
    enable_collection_video_limit: vpContext.resolved.enable_collection_video_limit,
    collection_video_limit: vpContext.resolved.collection_video_limit,
    page_number: isEditingAllPages ? 1 : vpContext.currentPage || context['videopack/currentPage'] || 1,
    prioritizePostData: vpContext.resolved.prioritizePostData
  }), [context, isEditingAllPages, vpContext.resolved, vpContext.currentPage]);

  // Only used as a fallback when this Loop instance runs its own query
  // below (i.e. vpData.videos is empty) — in the common case, Collection's
  // own query is what actually supplies the rendered videos, so refreshing
  // after an upload goes through context['videopack/refreshVideos'] instead
  // (see handleSelectVideos).
  const [refreshToken, setRefreshToken] = (0,external_wp_element_.useState)(0);
  const queryData = (0,useVideoQuery/* default */.A)(vpData.videos && vpData.videos.length > 0 ? null : queryAttributes, previewPostId, refreshToken);
  const {
    videoResults: queryVideos,
    isResolving: isResolvingQuery,
    totalResults,
    maxNumPages
  } = queryData;
  const parentVideos = vpData.videos || context['videopack/videos'];
  const videos = parentVideos && parentVideos.length > 0 ? parentVideos : queryVideos;
  // Videos load asynchronously, so default to the first one lazily at render
  // time rather than in the useState initializer.
  const effectiveActiveKey = activeVideoKey ?? (videos?.[0] && (videos[0].attachment_id || videos[0].id));
  const totalResultsCount = parentVideos && parentVideos.length > 0 ? parentVideos.length : totalResults;
  const totalPagesCount = parentVideos && parentVideos.length > 0 ? 1 : maxNumPages;
  const templateBlocks = (0,external_wp_data_.useSelect)(select => clientId ? select('core/block-editor').getBlocks(clientId) : [], [clientId]);
  const previewVideos = queryVideos;
  const isPreviewResolving = isResolvingQuery;
  const layout = context['videopack/layout'] || 'grid';
  const columns = context['videopack/columns'] || 3;
  const presetDuotoneClass = (0,external_wp_element_.useMemo)(() => {
    if (typeof effectiveDuotone === 'string') {
      return `wp-duotone-${effectiveDuotone.replace('var:preset|duotone|', '')}`;
    }
    return '';
  }, [effectiveDuotone]);
  const blockProps = (0,external_wp_blockEditor_.useBlockProps)({
    className: `videopack-video-loop layout-${layout} columns-${columns} ${isPreviewResolving && !isSaving && !isAutosaving ? 'has-loading-state' : ''} ${isEditingAllPages ? 'is-editing-all-pages' : ''}`
  });

  // Find the duotone class that Gutenberg has applied to our block props.
  const duotoneClass = (0,external_wp_element_.useMemo)(() => {
    const classes = blockProps.className?.split(' ') || [];
    return classes.find(c => c.startsWith('wp-duotone-'));
  }, [blockProps.className]);
  const computedStyle = {};
  if (columns && layout === 'grid') {
    computedStyle['--videopack-collection-columns'] = columns;
  }
  computedStyle.containerType = 'inline-size';

  // Universal Solution: Fetch the actual attachment records to hydrate the store.
  // This ensures that BlockEdit and any inner blocks have the 'real' data they need.
  const videoIds = (0,external_wp_element_.useMemo)(() => {
    return (previewVideos || []).map(v => v.attachment_id).filter(Boolean);
  }, [previewVideos]);
  (0,external_wp_data_.useSelect)(select => {
    if (!videoIds.length) {
      return null;
    }
    return select('core').getEntityRecords('postType', 'attachment', {
      include: videoIds,
      per_page: -1
    });
  }, [videoIds]);

  // Synchronize child/parent duotone attributes to the Loop block itself
  // so that Gutenberg applies the necessary classes and SVG filters to the Loop wrapper.
  (0,external_wp_element_.useEffect)(() => {
    const loopDuotone = attributes.style?.color?.duotone || attributes.duotone;

    // 1. If we have a new inherited duotone, adopt it.
    if (inheritedDuotone && JSON.stringify(inheritedDuotone) !== JSON.stringify(loopDuotone)) {
      if (Array.isArray(inheritedDuotone)) {
        setAttributes({
          style: {
            ...attributes.style,
            color: {
              ...attributes.style?.color,
              duotone: inheritedDuotone
            }
          }
        });
      } else {
        setAttributes({
          duotone: inheritedDuotone
        });
      }
    }

    // 2. If the inheritance was JUST cleared, and our Loop still has that exact value, clear it.
    // This prevents "sticky" attributes while allowing local Loop-level filters to persist.
    const wasInherited = prevInheritedDuotone.current && JSON.stringify(loopDuotone) === JSON.stringify(prevInheritedDuotone.current);
    if (!inheritedDuotone && wasInherited) {
      setAttributes({
        duotone: undefined,
        style: attributes.style ? {
          ...attributes.style,
          color: attributes.style.color ? {
            ...attributes.style.color,
            duotone: undefined
          } : undefined
        } : undefined
      });
    }

    // Update our tracker for the next render
    prevInheritedDuotone.current = inheritedDuotone;
  }, [inheritedDuotone, attributes.duotone, attributes.style, setAttributes]);

  // Pass-through: resolve the duotone class by checking local settings then inherited ones.
  const resolvedDuotoneClass = (0,external_wp_element_.useMemo)(() => {
    return duotoneClass || presetDuotoneClass || '';
  }, [duotoneClass, presetDuotoneClass]);

  // Clears once the real persisted update (see SortableGrid.js's
  // handleDragEnd) actually lands — from that point the Inspector is
  // showing the real attributes anyway, so the override below becomes a
  // no-op; this just stops forcing it once it's no longer needed.
  (0,external_wp_element_.useEffect)(() => {
    if (parentAttributes.gallery_source === 'manual') {
      setIsReorderPending(false);
    }
  }, [parentAttributes.gallery_source]);

  // Purely a display override for CollectionInspectorControls below — never
  // passed to setAttributes, so it can't affect what actually gets saved.
  // gallery_include only needs to be non-empty for "Manually Sorted" to
  // appear as an available option (see CollectionQuerySettings.js); its
  // actual value here is never read as real IDs anywhere.
  const inspectorAttributes = isReorderPending ? {
    ...parentAttributes,
    gallery_source: 'manual',
    gallery_orderby: 'include',
    gallery_include: parentAttributes.gallery_include || 'pending'
  } : parentAttributes;
  const handleRemoveItem = (0,external_wp_element_.useCallback)(idToRemove => {
    const currentExclude = queryAttributes.gallery_exclude ? queryAttributes.gallery_exclude.split(',').map(id => id.trim()) : [];
    if (!currentExclude.includes(idToRemove.toString())) {
      currentExclude.push(idToRemove.toString());
    }
    const currentInclude = queryAttributes.gallery_include ? queryAttributes.gallery_include.split(',').map(id => id.trim()) : [];
    const newInclude = currentInclude.filter(id => id !== idToRemove.toString()).join(',');
    updateBlockAttributes(parentClientId, {
      gallery_exclude: currentExclude.join(','),
      gallery_include: newInclude
    });
  }, [queryAttributes, parentClientId, updateBlockAttributes]);
  const handleEditItem = (0,external_wp_element_.useCallback)(async oldId => {
    let currentInclude = queryAttributes.gallery_include ? queryAttributes.gallery_include.split(',').map(id => id.trim()) : [];
    if (queryAttributes.gallery_source !== 'manual') {
      try {
        const response = await (0,gallery/* getVideoGallery */.M5)({
          ...queryAttributes,
          gallery_id: queryAttributes.gallery_id || previewPostId,
          gallery_per_page: -1,
          page_number: undefined,
          gallery_pagination: false,
          skip_html: true
        });
        currentInclude = (response.videos || []).map(v => v.attachment_id.toString());
      } catch {
        currentInclude = (videos || []).map(v => v.attachment_id.toString());
      }
    }
    const frame = window.wp.media({
      title: (0,external_wp_i18n_.__)('Edit Video', 'video-embed-thumbnail-generator'),
      button: {
        text: (0,external_wp_i18n_.__)('Update', 'video-embed-thumbnail-generator')
      },
      multiple: false,
      library: {
        type: 'video'
      }
    });
    frame.on('open', () => {
      const selection = frame.state().get('selection');
      const attachment = window.wp.media.attachment(oldId);
      attachment.fetch().done(() => selection.add(attachment));
    });
    frame.on('select', () => {
      const newAttachment = frame.state().get('selection').first().toJSON();
      const newInclude = currentInclude.map(id => parseInt(id, 10) === oldId ? newAttachment.id.toString() : id).join(',');
      updateBlockAttributes(parentClientId, {
        gallery_include: newInclude,
        gallery_orderby: 'include',
        gallery_source: 'manual'
      });
    });
    frame.open();
  }, [queryAttributes, videos, parentClientId, updateBlockAttributes, previewPostId]);
  const handleAddVideo = (0,external_wp_element_.useCallback)(async () => {
    let currentInclude = queryAttributes.gallery_include ? queryAttributes.gallery_include.split(',').map(id => id.trim()) : [];

    // If we're not already in manual mode, we need to fetch ALL current IDs
    // from the server to ensure we don't lose items on other pages when freezing.
    if (queryAttributes.gallery_source !== 'manual') {
      try {
        const response = await (0,gallery/* getVideoGallery */.M5)({
          ...queryAttributes,
          gallery_id: queryAttributes.gallery_id || previewPostId,
          gallery_per_page: -1,
          // Get all IDs
          page_number: undefined,
          // Remove page limit
          gallery_pagination: false,
          skip_html: true
        });
        currentInclude = (response.videos || []).map(v => v.attachment_id.toString());
      } catch {
        // Fallback to current page results if fetch fails
        currentInclude = (videos || []).map(v => v.attachment_id.toString());
      }
    } else {
      // Already manual
    }
    const frame = window.wp.media({
      title: (0,external_wp_i18n_.__)('Add Videos to Collection', 'video-embed-thumbnail-generator'),
      button: {
        text: (0,external_wp_i18n_.__)('Add to Collection', 'video-embed-thumbnail-generator')
      },
      multiple: 'add',
      library: {
        type: 'video'
      }
    });
    frame.on('select', () => {
      const selection = frame.state().get('selection');
      const newIds = selection.map(attachment => attachment.id.toString());
      const combinedInclude = [...new Set([...currentInclude, ...newIds])].join(',');
      updateBlockAttributes(parentClientId, {
        gallery_include: combinedInclude,
        gallery_source: 'manual',
        gallery_orderby: 'include'
      });
    });
    frame.open();
  }, [queryAttributes, videos, parentClientId, updateBlockAttributes, previewPostId]);

  /**
   * Handles video(s) selected/uploaded via the "Add Video" toolbar button
   * or the empty-state placeholder. See resolveGalleryVideoSelection for
   * the shared decision logic (also used by the Collection block's own
   * matching control).
   *
   * @param {Object|Array} media Selected attachment object(s).
   */
  const handleSelectVideos = (0,external_wp_element_.useCallback)(media => {
    const result = (0,galleryVideoSelection/* resolveGalleryVideoSelection */.i)({
      media,
      gallerySource: queryAttributes.gallery_source,
      galleryInclude: queryAttributes.gallery_include,
      previewPostId
    });
    if (result.type === 'update') {
      updateBlockAttributes(parentClientId, result.updates);
    } else if (result.type === 'no-change') {
      // A freshly uploaded file is already attached to this post,
      // so no attribute changes. Refresh this instance's own query
      // (used when it's actually running one) and, since Collection's
      // query is what supplies the rendered videos in the common
      // case, ask it to refetch too.
      setRefreshToken(prev => prev + 1);
      context['videopack/refreshVideos']?.();
    }
  }, [queryAttributes, previewPostId, parentClientId, updateBlockAttributes, context]);

  /**
   * Opens the media frame for the "Add Video" toolbar button. Uses the raw
   * wp.media() API directly (like handleAddVideo/handleEditItem above)
   * rather than the <MediaUpload> React component — that component's
   * componentWillUnmount calls frame.remove() whenever it unmounts (e.g.
   * when this block is deselected right after the modal closes), which can
   * race with an in-progress React render and crash with "Attempted to
   * synchronously unmount a root while React was already rendering."
   */
  const openAddVideoFrame = (0,external_wp_element_.useCallback)(() => {
    const frame = window.wp.media({
      title: (0,external_wp_i18n_.__)('Add Video', 'video-embed-thumbnail-generator'),
      button: {
        text: (0,external_wp_i18n_.__)('Add', 'video-embed-thumbnail-generator')
      },
      multiple: true,
      library: {
        type: 'video'
      }
    });
    frame.on('select', () => {
      handleSelectVideos(frame.state().get('selection').toJSON());
    });
    frame.open();
  }, [handleSelectVideos]);
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.InspectorControls, {
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CollectionInspectorControls/* default */.A, {
        clientId: parentClientId,
        attributes: inspectorAttributes,
        setAttributes: newAttrs => updateBlockAttributes(parentClientId, newAttrs),
        queryData: queryData,
        options: options,
        hasPaginationBlock: hasPaginationBlock,
        isEditingAllPages: isEditingAllPages
      })
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.BlockControls, {
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarGroup, {
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          icon: plus/* default */.A,
          label: (0,external_wp_i18n_.__)('Add Video', 'video-embed-thumbnail-generator'),
          onClick: openAddVideoFrame
        })
      })
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("figure", {
      ...blockProps,
      style: computedStyle,
      children: [presetDuotoneClass && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("style", {
        children: `
							.${presetDuotoneClass} .vjs-poster,
							.${presetDuotoneClass} .vjs-poster img,
							.${presetDuotoneClass} .mejs-poster,
							.${presetDuotoneClass} .mejs-poster img,
							.${presetDuotoneClass} .videopack-thumbnail {
								filter: url(#${presetDuotoneClass}) !important;
							}
							.${presetDuotoneClass} .vjs-poster .vjs-poster,
							.${presetDuotoneClass} .mejs-poster .mejs-poster {
								filter: none !important;
							}
							.${presetDuotoneClass} .wp-block-videopack-player-container,
							.${presetDuotoneClass} .wp-block-videopack-thumbnail,
							.${presetDuotoneClass} [class*="wp-duotone-"] {
								filter: none !important;
							}
						`
      }), (() => {
        if (!videos || isPreviewResolving && videos.length === 0) {
          return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "videopack-collection-loading",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Spinner, {})
          });
        }

        // Whether this Loop instance is the real, editable block editor
        // (drag-reordering, InnerBlocks) versus a disabled preview
        // (Settings page, Classic Editor, Attachment Details) — the
        // latter renders a plain grid below with no @dnd-kit at all,
        // since drag can't function in a disabled preview anyway.
        const canEdit = !vpContext.resolved.isPreview && !(0,utils_context/* isTrue */.Hn)(context['videopack/isPreview']);
        if (videos.length === 0) {
          const showUploadPlaceholder = canEdit && (queryAttributes.gallery_source === 'current' || queryAttributes.gallery_source === 'manual' && !queryAttributes.gallery_include);
          if (showUploadPlaceholder) {
            return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.MediaPlaceholder, {
              icon: "video-alt3",
              labels: {
                title: (0,external_wp_i18n_.__)('Videopack Gallery', 'video-embed-thumbnail-generator'),
                instructions: (0,external_wp_i18n_.__)('Upload or select videos to attach to this post.', 'video-embed-thumbnail-generator')
              },
              onSelect: handleSelectVideos,
              accept: "video/*",
              allowedTypes: ['video'],
              multiple: true
            });
          }
          return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "videopack-collection-preview-placeholder",
            children: (0,external_wp_i18n_.__)('No videos found for this source.', 'video-embed-thumbnail-generator')
          });
        }
        if (!canEdit) {
          // Static, non-interactive grid — no dnd-kit, no real
          // InnerBlocks, since none of it can function in a
          // disabled preview anyway.
          return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "videopack-collection-grid",
            children: videos.map(video => {
              const videoKey = video.attachment_id || video.id;
              const itemContext = (0,buildItemContext/* default */.A)(video, {
                context,
                vpContext,
                resolvedDuotoneClass,
                totalPagesCount,
                totalResultsCount
              });
              return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("figure", {
                className: "videopack-collection-item videopack-hover-trigger is-preview",
                children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.BlockContextProvider, {
                  value: itemContext,
                  children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
                    className: resolvedDuotoneClass,
                    children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(LoopItemPreview/* default */.A, {
                      blocks: templateBlocks,
                      isHidden: false,
                      onActivate: () => {}
                    })
                  })
                })
              }, videoKey);
            })
          });
        }
        return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_element_.Suspense, {
          fallback: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "videopack-collection-loading",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Spinner, {})
          }),
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(SortableGrid, {
            videos: videos,
            effectiveActiveKey: effectiveActiveKey,
            setActiveVideoKey: setActiveVideoKey,
            context: context,
            vpContext: vpContext,
            templateBlocks: templateBlocks,
            resolvedDuotoneClass: resolvedDuotoneClass,
            totalPagesCount: totalPagesCount,
            totalResultsCount: totalResultsCount,
            showLoopAppender: showLoopAppender,
            handleRemoveItem: handleRemoveItem,
            handleEditItem: handleEditItem,
            handleAddVideo: handleAddVideo,
            queryAttributes: queryAttributes,
            parentClientId: parentClientId,
            updateBlockAttributes: updateBlockAttributes,
            previewPostId: previewPostId,
            onReorderStart: () => setIsReorderPending(true)
          })
        });
      })()]
    })]
  });
}
;// ./src/blocks/loop/save.js


function save() {
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.InnerBlocks.Content, {});
}
// EXTERNAL MODULE: ./src/assets/icon.js
var icon = __webpack_require__(9427);
;// ./src/blocks/loop/index.js





(0,external_wp_blocks_.registerBlockType)(block_namespaceObject.name, {
  ...block_namespaceObject,
  icon: icon/* videopackLoop */.TI,
  edit: Edit,
  save: save
});

/***/ },

/***/ 7453
(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {


// EXTERNAL MODULE: external ["wp","blocks"]
var external_wp_blocks_ = __webpack_require__(4997);
// EXTERNAL MODULE: external ["wp","blockEditor"]
var external_wp_blockEditor_ = __webpack_require__(4715);
// EXTERNAL MODULE: external ["wp","data"]
var external_wp_data_ = __webpack_require__(7143);
// EXTERNAL MODULE: external ["wp","components"]
var external_wp_components_ = __webpack_require__(6427);
// EXTERNAL MODULE: external ["wp","element"]
var external_wp_element_ = __webpack_require__(6087);
// EXTERNAL MODULE: external ["wp","i18n"]
var external_wp_i18n_ = __webpack_require__(7723);
// EXTERNAL MODULE: ./src/hooks/useVideopackContext.js
var useVideopackContext = __webpack_require__(5633);
// EXTERNAL MODULE: external "ReactJSXRuntime"
var external_ReactJSXRuntime_ = __webpack_require__(790);
;// ./src/components/Pagination/Pagination.js



/**
 * A standardized pagination component for use in both blocks and previews.
 *
 * @param {Object}   props              Component props.
 * @param {number}   props.currentPage  The current active page.
 * @param {number}   props.totalPages   The total number of pages.
 * @param {Function} props.onPageChange Callback when a page is changed.
 * @param {Object}   props.attributes   Optional. Block attributes for color resolution.
 * @param {Object}   props.context      Optional. Block context for color resolution.
 * @param {Object}   props.style        Optional. Additional styles.
 */

function Pagination({
  currentPage: propCurrentPage,
  totalPages: propTotalPages,
  onPageChange: propOnPageChange,
  attributes = {},
  context = {},
  style: propStyle
}) {
  const vpContext = (0,useVideopackContext/* default */.Ay)(attributes, context);
  const {
    pagination_color,
    pagination_background_color,
    pagination_active_bg_color,
    pagination_active_color,
    currentPage: contextPage,
    totalPages: contextTotal,
    onPageChange: contextOnChange
  } = vpContext.resolved;
  const current = propCurrentPage ?? contextPage ?? 1;
  const total = propTotalPages ?? contextTotal ?? 1;
  const onChange = propOnPageChange ?? contextOnChange ?? (() => {});
  if (total <= 1) {
    return null;
  }
  const style = {
    '--videopack-pagination-color': pagination_color,
    '--videopack-pagination-bg': pagination_background_color,
    '--videopack-pagination-active-bg': pagination_active_bg_color,
    '--videopack-pagination-active-color': pagination_active_color,
    ...propStyle
  };
  const getPageNumbers = () => {
    const pages = [];
    const showMax = 5; // Max number of page buttons to show around current page

    if (total <= showMax + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Always show page 1
      pages.push(1);
      let start = Math.max(2, current - 1);
      let end = Math.min(total - 1, current + 1);

      // Adjust start/end to always show 3 numbers in the middle if possible
      if (current <= 3) {
        end = 4;
      } else if (current >= total - 2) {
        start = total - 3;
      }
      if (start > 2) {
        pages.push('...');
      }
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (end < total - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(total);
    }
    return pages;
  };
  const pages = getPageNumbers();
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("nav", {
    className: "videopack-pagination",
    "aria-label": (0,external_wp_i18n_.__)('Pagination', 'video-embed-thumbnail-generator'),
    style: style,
    children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("ul", {
      className: "videopack-pagination-list",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("li", {
        className: "videopack-pagination-item",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("button", {
          className: `videopack-pagination-button prev page-numbers ${current <= 1 ? 'is-hidden videopack-hidden' : ''}`,
          onClick: () => current > 1 && onChange(current - 1),
          "aria-label": (0,external_wp_i18n_.__)('Previous Page', 'video-embed-thumbnail-generator'),
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
            className: "videopack-pagination-arrow",
            children: "<"
          })
        })
      }), pages.map((page, index) => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("li", {
        className: "videopack-pagination-item",
        children: page === '...' ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
          className: "page-numbers dots",
          children: page
        }) : /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("button", {
          className: `videopack-pagination-button page-numbers ${page === current ? 'is-active current' : ''}`,
          onClick: () => typeof page === 'number' && onChange(page),
          "aria-current": page === current ? 'page' : undefined,
          children: page
        })
      }, index)), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("li", {
        className: "videopack-pagination-item",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("button", {
          className: `videopack-pagination-button next page-numbers ${current >= total ? 'is-hidden videopack-hidden' : ''}`,
          onClick: () => current < total && onChange(current + 1),
          "aria-label": (0,external_wp_i18n_.__)('Next Page', 'video-embed-thumbnail-generator'),
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
            className: "videopack-pagination-arrow",
            children: ">"
          })
        })
      })]
    })
  });
}
// EXTERNAL MODULE: ./src/components/CompactColorPicker/CompactColorPicker.js
var CompactColorPicker = __webpack_require__(6312);
// EXTERNAL MODULE: ./src/utils/colors.js
var colors = __webpack_require__(7068);
// EXTERNAL MODULE: ./src/utils/VideopackContext.js
var VideopackContext = __webpack_require__(5597);
;// ./src/blocks/pagination/edit.js











/* global videopack_config */

function Edit({
  attributes,
  setAttributes,
  context,
  clientId,
  showPaginationSettings = true
}) {
  const {
    pagination_color,
    pagination_background_color,
    pagination_active_bg_color,
    pagination_active_color
  } = attributes;
  const vpData = (0,VideopackContext/* useVideopackContext */.Vy)();
  const {
    resolved
  } = (0,useVideopackContext/* default */.Ay)(attributes, context);
  const currentPage = vpData.currentPage || context['videopack/currentPage'] || 1;
  const totalPages = vpData.totalPages || context['videopack/totalPages'] || 1;
  const THEME_COLORS = videopack_config?.themeColors || [];
  const {
    updateBlockAttributes
  } = (0,external_wp_data_.useDispatch)('core/block-editor');
  const {
    parentClientId
  } = (0,external_wp_data_.useSelect)(select => {
    return {
      parentClientId: select('core/block-editor').getBlockRootClientId(clientId)
    };
  }, [clientId]);
  const fallbacks = (0,external_wp_element_.useMemo)(() => (0,colors/* getColorFallbacks */.l)(attributes), [attributes]);
  const handlePageChange = newPage => {
    if (parentClientId) {
      updateBlockAttributes(parentClientId, {
        currentPage: newPage
      });
    }
  };
  const blockProps = (0,external_wp_blockEditor_.useBlockProps)({
    className: 'videopack-pagination-block'
  });
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.InspectorControls, {
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelBody, {
        title: (0,external_wp_i18n_.__)('Pagination Colors', 'video-embed-thumbnail-generator'),
        children: showPaginationSettings && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "videopack-color-section",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("p", {
            className: "videopack-settings-section-title",
            children: (0,external_wp_i18n_.__)('Pagination', 'video-embed-thumbnail-generator')
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            className: "videopack-color-flex-row is-pagination",
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker/* default */.A, {
                label: (0,external_wp_i18n_.__)('Outline/Text', 'video-embed-thumbnail-generator'),
                value: pagination_color,
                onChange: value => setAttributes({
                  pagination_color: value
                }),
                colors: THEME_COLORS,
                fallbackValue: pagination_color === '' ? fallbacks.pagination_color : resolved.pagination_color || fallbacks.pagination_color
              })
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker/* default */.A, {
                label: (0,external_wp_i18n_.__)('Background', 'video-embed-thumbnail-generator'),
                value: pagination_background_color,
                onChange: value => setAttributes({
                  pagination_background_color: value
                }),
                colors: THEME_COLORS,
                fallbackValue: pagination_background_color === '' ? fallbacks.pagination_background_color : resolved.pagination_background_color || fallbacks.pagination_background_color
              })
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker/* default */.A, {
                label: (0,external_wp_i18n_.__)('Active Background', 'video-embed-thumbnail-generator'),
                value: pagination_active_bg_color,
                onChange: value => setAttributes({
                  pagination_active_bg_color: value
                }),
                colors: THEME_COLORS,
                fallbackValue: pagination_active_bg_color === '' ? fallbacks.pagination_active_bg_color : resolved.pagination_active_bg_color || fallbacks.pagination_active_bg_color
              })
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker/* default */.A, {
                label: (0,external_wp_i18n_.__)('Active Text', 'video-embed-thumbnail-generator'),
                value: pagination_active_color,
                onChange: value => setAttributes({
                  pagination_active_color: value
                }),
                colors: THEME_COLORS,
                fallbackValue: pagination_active_color === '' ? fallbacks.pagination_active_color : resolved.pagination_active_color || fallbacks.pagination_active_color
              })
            })]
          })]
        })
      })
    }), totalPages <= 1 ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
      ...blockProps,
      className: `${blockProps.className} is-placeholder`,
      title: (0,external_wp_i18n_.__)('Pagination Placeholder (Preview Only)', 'video-embed-thumbnail-generator'),
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(Pagination, {
        currentPage: 1,
        totalPages: 10,
        onPageChange: () => {},
        attributes: attributes,
        context: context
      })
    }) : /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
      ...blockProps,
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(Pagination, {
        currentPage: currentPage,
        totalPages: totalPages,
        onPageChange: handlePageChange,
        attributes: attributes,
        context: context
      })
    })]
  });
}
;// ./src/blocks/pagination/save.js
function save() {
  return null;
}
;// ./src/blocks/pagination/block.json
const block_namespaceObject = /*#__PURE__*/JSON.parse('{"UU":"videopack/pagination"}');
// EXTERNAL MODULE: ./src/assets/icon.js
var icon = __webpack_require__(9427);
;// ./src/blocks/pagination/index.js






(0,external_wp_blocks_.registerBlockType)(block_namespaceObject.UU, {
  icon: icon/* videopackPagination */.bl,
  edit: Edit,
  save: save
});

/***/ },

/***/ 9827
(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {


// EXTERNAL MODULE: external ["wp","blocks"]
var external_wp_blocks_ = __webpack_require__(4997);
// EXTERNAL MODULE: external ["wp","element"]
var external_wp_element_ = __webpack_require__(6087);
// EXTERNAL MODULE: external ["wp","blockEditor"]
var external_wp_blockEditor_ = __webpack_require__(4715);
// EXTERNAL MODULE: external ["wp","components"]
var external_wp_components_ = __webpack_require__(6427);
// EXTERNAL MODULE: external ["wp","i18n"]
var external_wp_i18n_ = __webpack_require__(7723);
// EXTERNAL MODULE: ./src/utils/colors.js
var colors = __webpack_require__(7068);
// EXTERNAL MODULE: ./src/components/CompactColorPicker/CompactColorPicker.js
var CompactColorPicker = __webpack_require__(6312);
// EXTERNAL MODULE: ./src/hooks/useVideopackContext.js
var useVideopackContext = __webpack_require__(5633);
// EXTERNAL MODULE: external ["wp","hooks"]
var external_wp_hooks_ = __webpack_require__(2619);
// EXTERNAL MODULE: external "ReactJSXRuntime"
var external_ReactJSXRuntime_ = __webpack_require__(790);
;// ./src/components/PlayButton/PlayButton.js




const CLASS_KEYS = ['play_button_color', 'play_button_secondary_color'];

/**
 * An internal component to display the play button with correct styling.
 *
 * @param {Object} root0            Component props.
 * @param {Object} root0.attributes Block attributes.
 * @param {Object} root0.context    Block context.
 * @return {Element}                Rendered play button.
 */
function PlayButton({
  attributes = {},
  context = {}
}) {
  const config = typeof window !== 'undefined' ? window.videopack_config : undefined;
  const embed_method = (typeof config !== 'undefined' ? config.options?.embed_method : null) || 'Video.js';
  const vpContext = (0,useVideopackContext/* default */.Ay)(attributes, context, {
    classKeys: CLASS_KEYS
  });

  /**
   * Filters the React element used to render the player play button.
   *
   * Allowing full custom HTML/React play buttons for specific setups or styling extensions.
   *
   * @since 5.0.0
   *
   * @param {Element|null} customButton Custom play button element, defaults to null.
   * @param {Object}       context      Context data including attributes, context, vpContext, and embed_method.
   */
  const customButton = (0,external_wp_hooks_.applyFilters)('videopack.playButtonElement', null, {
    attributes,
    context,
    vpContext,
    embed_method
  });
  if (customButton) {
    return customButton;
  }
  if ('WordPress Default' === embed_method) {
    const styles = {
      width: '80px',
      height: '80px',
      ...vpContext.style
    };
    const mejsSvgPath = config?.mejs_controls_svg || (typeof window !== 'undefined' ? `${window.location.origin}/wp-includes/js/mediaelement/mejs-controls.svg` : '');
    if (mejsSvgPath) {
      styles['--videopack-mejs-controls-svg'] = `url("${mejsSvgPath}")`;
    }
    return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
      className: `videopack-play-button mejs-overlay mejs-layer mejs-overlay-play play-button-container ${vpContext.classes}`,
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "mejs-overlay-button",
        role: "button",
        tabIndex: "0",
        "aria-label": (0,external_wp_i18n_.__)('Play', 'video-embed-thumbnail-generator'),
        "aria-pressed": "false",
        style: styles
      })
    });
  }
  if ('None' === embed_method) {
    return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
      className: "play-button-container videopack-none",
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("svg", {
        className: "videopack-none-play-button",
        viewBox: "0 0 100 100",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("circle", {
          className: "play-button-circle",
          cx: "50",
          cy: "50",
          r: "45"
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("polygon", {
          className: "play-button-triangle",
          points: "40,30 70,50 40,70"
        })]
      })
    });
  }
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
    className: `play-button-container video-js ${vpContext.classes} vjs-big-play-centered vjs-paused vjs-controls-enabled`,
    style: vpContext.style,
    children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("button", {
      className: "vjs-big-play-button",
      type: "button",
      title: (0,external_wp_i18n_.__)('Play Video', 'video-embed-thumbnail-generator'),
      "aria-disabled": "false",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
        className: "vjs-icon-placeholder",
        "aria-hidden": "true"
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
        className: "vjs-control-text",
        "aria-live": "polite",
        children: (0,external_wp_i18n_.__)('Play Video', 'video-embed-thumbnail-generator')
      })]
    })
  });
}
;// ./src/blocks/play-button/edit.js










/**
 * Play Button Edit Component.
 *
 * @param {Object}   root0               Component props.
 * @param {Object}   root0.attributes    Block attributes.
 * @param {Function} root0.setAttributes Attribute setter.
 * @param {Object}   root0.context       Block context.
 * @return {Element} Play Button edit component.
 */

function Edit({
  attributes,
  setAttributes,
  context
}) {
  const {
    play_button_color,
    play_button_secondary_color
  } = attributes;
  const isInsideThumbnail = !!context?.['videopack/isInsideThumbnail'];
  const isInsidePlayerOverlay = !!context?.['videopack/isInsidePlayerOverlay'];
  const config = typeof window !== 'undefined' ? window.videopack_config : undefined;
  const embed_method = (typeof config !== 'undefined' ? config.options?.embed_method : null) || 'Video.js';
  const THEME_COLORS = config?.themeColors;
  const {
    resolved
  } = (0,useVideopackContext/* default */.Ay)(attributes, context);
  const colorFallbacks = (0,external_wp_element_.useMemo)(() => (0,colors/* getColorFallbacks */.l)({
    play_button_color: resolved.play_button_color,
    play_button_secondary_color: resolved.play_button_secondary_color
  }), [resolved.play_button_color, resolved.play_button_secondary_color]);
  const overlayStyles = {};
  if (isInsidePlayerOverlay || isInsideThumbnail || resolved.isPreview) {
    overlayStyles.position = 'absolute';
    overlayStyles.top = 0;
    overlayStyles.left = 0;
    overlayStyles.right = 0;
    overlayStyles.bottom = 0;
    overlayStyles.zIndex = 115;
    overlayStyles.minHeight = '100px'; // Ensure it's visible in inserter
  }
  const blockProps = (0,external_wp_blockEditor_.useBlockProps)({
    className: `videopack-play-button-block ${isInsidePlayerOverlay ? 'is-overlay' : ''}`,
    style: overlayStyles
  });
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.InspectorControls, {
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelBody, {
        title: (0,external_wp_i18n_.__)('Colors', 'video-embed-thumbnail-generator'),
        initialOpen: true,
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
          className: "videopack-color-section",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            className: "videopack-color-flex-row",
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker/* default */.A, {
                label: 'WordPress Default' === embed_method ? (0,external_wp_i18n_.__)('Color', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_.__)('Icon', 'video-embed-thumbnail-generator'),
                value: play_button_color,
                onChange: value => setAttributes({
                  play_button_color: value
                }),
                colors: THEME_COLORS,
                fallbackValue: colorFallbacks.play_button_color
              })
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker/* default */.A, {
                label: 'WordPress Default' === embed_method ? (0,external_wp_i18n_.__)('Hover', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_.__)('Accent', 'video-embed-thumbnail-generator'),
                value: play_button_secondary_color,
                onChange: value => setAttributes({
                  play_button_secondary_color: value
                }),
                colors: THEME_COLORS,
                fallbackValue: colorFallbacks.play_button_secondary_color
              })
            })]
          })
        })
      })
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
      ...blockProps,
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(PlayButton, {
        attributes: attributes,
        context: context
      })
    })]
  });
}
;// ./src/blocks/play-button/save.js
function save() {
  return null;
}
;// ./src/blocks/play-button/block.json
const block_namespaceObject = /*#__PURE__*/JSON.parse('{"UU":"videopack/play-button"}');
// EXTERNAL MODULE: ./src/assets/icon.js
var icon = __webpack_require__(9427);
;// ./src/blocks/play-button/index.js





(0,external_wp_blocks_.registerBlockType)(block_namespaceObject.UU, {
  icon: icon/* videopackPlayButton */.Vx,
  edit: Edit,
  save: save
});

/***/ },

/***/ 4107
(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {


// EXTERNAL MODULE: external ["wp","blocks"]
var external_wp_blocks_ = __webpack_require__(4997);
;// external ["wp","blob"]
const external_wp_blob_namespaceObject = window["wp"]["blob"];
// EXTERNAL MODULE: external ["wp","components"]
var external_wp_components_ = __webpack_require__(6427);
// EXTERNAL MODULE: external ["wp","blockEditor"]
var external_wp_blockEditor_ = __webpack_require__(4715);
// EXTERNAL MODULE: ./src/components/VideopackContextBridge.js
var VideopackContextBridge = __webpack_require__(4773);
// EXTERNAL MODULE: external ["wp","element"]
var external_wp_element_ = __webpack_require__(6087);
// EXTERNAL MODULE: external ["wp","i18n"]
var external_wp_i18n_ = __webpack_require__(7723);
// EXTERNAL MODULE: external ["wp","data"]
var external_wp_data_ = __webpack_require__(7143);
;// external ["wp","notices"]
const external_wp_notices_namespaceObject = window["wp"]["notices"];
// EXTERNAL MODULE: ./node_modules/@wordpress/icons/build-module/library/undo.mjs
var undo = __webpack_require__(6123);
// EXTERNAL MODULE: external ["wp","primitives"]
var external_wp_primitives_ = __webpack_require__(5573);
// EXTERNAL MODULE: external "ReactJSXRuntime"
var external_ReactJSXRuntime_ = __webpack_require__(790);
;// ./node_modules/@wordpress/icons/build-module/library/caption.mjs
// packages/icons/src/library/caption.tsx


var caption_default = /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.Path, { fillRule: "evenodd", clipRule: "evenodd", d: "M6 5.5h12a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-.5.5H6a.5.5 0 0 1-.5-.5V6a.5.5 0 0 1 .5-.5ZM4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Zm4 10h2v-1.5H8V16Zm5 0h-2v-1.5h2V16Zm1 0h2v-1.5h-2V16Z" }) });

//# sourceMappingURL=caption.mjs.map

// EXTERNAL MODULE: external ["wp","apiFetch"]
var external_wp_apiFetch_ = __webpack_require__(1455);
var external_wp_apiFetch_default = /*#__PURE__*/__webpack_require__.n(external_wp_apiFetch_);
// EXTERNAL MODULE: ./src/api/settings.js
var settings = __webpack_require__(4602);
// EXTERNAL MODULE: ./src/assets/icon.js
var icon = __webpack_require__(9427);
// EXTERNAL MODULE: ./src/components/VideoSettings/VideoSettings.js
var VideoSettings = __webpack_require__(1602);
// EXTERNAL MODULE: ./src/components/Thumbnails/Thumbnails.js
var Thumbnails = __webpack_require__(8814);
// EXTERNAL MODULE: ./src/components/AdditionalFormats/AdditionalFormats.js
var AdditionalFormats = __webpack_require__(6022);
// EXTERNAL MODULE: ./src/hooks/useVideoProbe.js
var useVideoProbe = __webpack_require__(5711);
// EXTERNAL MODULE: ./src/hooks/useVideopackContext.js
var useVideopackContext = __webpack_require__(5633);
// EXTERNAL MODULE: ./src/utils/titleDownloadBlock.js
var titleDownloadBlock = __webpack_require__(1067);
;// ./src/blocks/player-container/edit.js
/* global videopack_config */





















const ALLOWED_MEDIA_TYPES = ['video', 'image/gif'];
const ALLOWED_BLOCKS = ['videopack/player', 'videopack/view-count', 'videopack/duration', 'videopack/caption', 'videopack/download', 'videopack/share'];
const PLAYER_CONTEXT_CLASS_KEYS = ['skin', 'control_bar_bg_color', 'control_bar_color', 'play_button_color', 'play_button_secondary_color'];

/**
 * Edit component for the Videopack Video block.
 *
 * @param {Object}   root0               Component props.
 * @param {Object}   root0.attributes    Block attributes.
 * @param {string}   root0.clientId      Block client ID.
 * @param {Function} root0.setAttributes Attribute setter.
 * @param {Object}   root0.context       Block context.
 * @return {Element}                     The rendered component.
 */
function Edit({
  attributes,
  setAttributes,
  context,
  clientId,
  isSelected
}) {
  const {
    id,
    src
  } = attributes;
  const [temporarySrc, setTemporarySrc] = (0,external_wp_element_.useState)((0,external_wp_blob_namespaceObject.isBlobURL)(src) ? src : null);
  const effectiveSrc = temporarySrc || src;
  const [options, setOptions] = (0,external_wp_element_.useState)();
  const config = typeof window !== 'undefined' ? window.videopack_config : undefined;
  const mejsSvgPath = config?.mejs_controls_svg || (typeof window !== 'undefined' ? `${window.location.origin}/wp-includes/js/mediaelement/mejs-controls.svg` : '');
  const globalOptions = config?.options || {};
  const effectiveAlign = attributes.align || globalOptions.align || '';
  const blockProps = (0,external_wp_blockEditor_.useBlockProps)({
    className: effectiveAlign ? `align${effectiveAlign}` : '',
    style: {
      '--videopack-mejs-controls-svg': mejsSvgPath ? `url("${mejsSvgPath}")` : undefined
    }
  });
  const hasAttemptedInitialUpload = (0,external_wp_element_.useRef)(false);
  const {
    createErrorNotice
  } = (0,external_wp_data_.useDispatch)(external_wp_notices_namespaceObject.store);
  const {
    insertBlock
  } = (0,external_wp_data_.useDispatch)(external_wp_blockEditor_.store);
  const vpContext = (0,useVideopackContext/* default */.Ay)(attributes, context, {
    classKeys: PLAYER_CONTEXT_CLASS_KEYS
  });
  const {
    resolved: effectiveDesign,
    style: contextStyle,
    classes: contextClasses
  } = vpContext;
  const {
    attachmentId: resolvedAttachmentId,
    postId: resolvedPostIdFromContext,
    isDiscovering
  } = effectiveDesign;
  const contextAttachmentId = context['videopack/attachmentId'];
  const {
    mediaUpload,
    isSiteEditor,
    editorPostId,
    innerBlocks,
    attachmentFromStore,
    attachmentError,
    hasSelectedInnerBlock
  } = (0,external_wp_data_.useSelect)(select => {
    const editorStore = select(external_wp_blockEditor_.store);
    const editor = select('core/editor');
    const postType = editor?.getCurrentPostType();
    const effectiveId = id || contextAttachmentId || resolvedAttachmentId;
    const isAttachmentIdValid = effectiveId && typeof effectiveId === 'number';
    return {
      mediaUpload: editorStore.getSettings()?.mediaUpload,
      isSiteEditor: postType === 'wp_template' || postType === 'wp_template_part',
      editorPostId: editor?.getCurrentPostId(),
      innerBlocks: editorStore.getBlocks(clientId),
      attachmentFromStore: isAttachmentIdValid ? select('core').getEntityRecord('postType', 'attachment', effectiveId) : null,
      attachmentError: isAttachmentIdValid ? select('core').getResolutionError('getEntityRecord', ['postType', 'attachment', effectiveId]) : null,
      hasSelectedInnerBlock: editorStore.hasSelectedInnerBlock(clientId)
    };
  }, [clientId, id, contextAttachmentId, resolvedAttachmentId]);

  // Only show this block's own "Add block" appender while it (or a child)
  // is actively selected — matches Thumbnail/Loop/Collection, so it doesn't
  // stay visible while an unrelated block elsewhere is selected.
  const showPlayerContainerAppender = isSelected || hasSelectedInnerBlock;
  const isDynamic = (context['videopack/postId'] || context.postId) && (Number(context['videopack/postId'] || context.postId) !== Number(editorPostId) || isSiteEditor);
  const isStandalone = !isDynamic;
  const effectiveId = resolvedAttachmentId;
  const [attachmentOverride, setAttachmentOverride] = (0,external_wp_element_.useState)(null);
  const attachment = attachmentOverride || attachmentFromStore;
  const hasResolved = !!attachment || !effectiveId && !effectiveSrc;
  const videoData = (0,external_wp_element_.useMemo)(() => ({
    record: attachment,
    setRecord: setAttachmentOverride,
    hasResolved
  }), [attachment, hasResolved]);
  const resolvedAttributes = (0,external_wp_element_.useMemo)(() => {
    if (!attachment) {
      return attributes;
    }
    return {
      ...attributes,
      src: attachment.source_url || attachment.url || effectiveSrc,
      id: attachment.id,
      poster: attachment.videopack?.poster || attachment.meta?.['_videopack-meta']?.poster || attributes.poster,
      total_thumbnails: attachment.meta?.['_videopack-meta']?.total_thumbnails || attributes.total_thumbnails,
      featured: attachment.meta?.['_videopack-meta']?.featured || attributes.featured,
      title: attributes.title || context['videopack/title'] || attachment?.title?.raw || attachment?.title?.rendered || '',
      caption: attributes.caption || context['videopack/caption'] || attachment?.caption?.raw || attachment?.caption?.rendered || '',
      views: attachment.videopack?.views || attachment.meta?.videopack_views || attachment.meta?.['_videopack-meta']?.starts || attributes.views || 0,
      duration: attachment.videopack?.duration || attachment.meta?.['_videopack-meta']?.duration || attributes.duration || '',
      videopack: attachment.videopack || null,
      starts: attachment.meta?.['_videopack-meta']?.starts || attributes.starts,
      text_tracks: attachment.meta?.['_videopack-meta']?.track || attachment.meta?.['_videopack-meta']?.tracks || attachment.meta?.track || attachment.meta?.tracks || attributes.text_tracks || [],
      width: attachment.media_details?.width || attributes.width,
      height: attachment.media_details?.height || attributes.height,
      sources: attachment.videopack?.sources || (attachment.source_url || attachment.url || effectiveSrc ? [{
        src: attachment.source_url || attachment.url || effectiveSrc
      }] : attributes.sources || []),
      source_groups: (attachment.videopack?.source_groups && Object.keys(attachment.videopack.source_groups).length > 0 ? attachment.videopack.source_groups : null) || (attributes.source_groups && Object.keys(attributes.source_groups).length > 0 ? attributes.source_groups : null) || {},
      default_ratio: attachment.meta?.['_kgflashmediaplayer-ratio'] || attributes.default_ratio,
      fixed_aspect: attachment.meta?.['_kgflashmediaplayer-fixedaspect'] || attributes.fixed_aspect,
      fullwidth: attributes.fullwidth,
      embed_method: attributes.embed_method || options?.embed_method || config?.embed_method,
      skin: attributes.skin || options?.skin || config?.skin,
      play_button_color: attributes.play_button_color || options?.play_button_color || config?.play_button_color,
      play_button_secondary_color: attributes.play_button_secondary_color || options?.play_button_secondary_color || config?.play_button_secondary_color,
      control_bar_bg_color: attributes.control_bar_bg_color || options?.control_bar_bg_color || config?.control_bar_bg_color,
      control_bar_color: attributes.control_bar_color || options?.control_bar_color || config?.control_bar_color,
      title_color: attributes.title_color || options?.title_color || config?.title_color,
      title_background_color: attributes.title_background_color || effectiveDesign.title_background_color,
      embedlink: context['videopack/embedlink'] || attachment?.videopack?.embed_url || attributes.embedlink,
      showCaption: attributes.showCaption || !!(attachment?.caption?.raw || attachment?.caption?.rendered || context['videopack/caption'])
    };
  }, [attributes, attachment, options, config, context, effectiveDesign, effectiveSrc]);
  const attributesRef = (0,external_wp_element_.useRef)(attributes);
  const isMountedRef = (0,external_wp_element_.useRef)(false);
  (0,external_wp_element_.useEffect)(() => {
    attributesRef.current = attributes;
  }, [attributes]);
  (0,external_wp_element_.useEffect)(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  const setAttributesFromMedia = (0,external_wp_element_.useCallback)((attachmentObject, forcePersist = false) => {
    if (!isMountedRef.current) {
      return;
    }
    const media_src = attachmentObject.source_url || attachmentObject.url;
    const media_attributes = {
      src: (0,external_wp_blob_namespaceObject.isBlobURL)(media_src) ? undefined : media_src,
      id: attachmentObject.id,
      poster: attachmentObject.videopack?.poster || attachmentObject.meta?.['_videopack-meta']?.poster,
      total_thumbnails: attachmentObject.meta?.['_videopack-meta']?.total_thumbnails,
      featured: attachmentObject.meta?.['_videopack-meta']?.featured,
      title: attachmentObject.title?.raw ?? attachmentObject.title?.rendered,
      caption: attachmentObject.caption?.raw ?? attachmentObject.caption?.rendered,
      starts: attachmentObject.meta?.['_videopack-meta']?.starts,
      text_tracks: attachmentObject.meta?.['_videopack-meta']?.track || attachmentObject.meta?.['_videopack-meta']?.tracks || attachmentObject.meta?.track || attachmentObject.meta?.tracks || [],
      embedlink: attachmentObject.link ? attachmentObject.link + (attachmentObject.link.includes('?') ? '&' : '?') + 'videopack[enable]=true' : undefined,
      width: attachmentObject.media_details?.width,
      height: attachmentObject.media_details?.height,
      showCaption: !!(attachmentObject.caption?.raw ?? attachmentObject.caption?.rendered)
    };
    if ((0,external_wp_blob_namespaceObject.isBlobURL)(media_src)) {
      setTemporarySrc(media_src);
    } else {
      setTemporarySrc(null);
    }
    const updatedAttributes = {};
    const currentAttributes = attributesRef.current;
    Object.keys(media_attributes).forEach(key => {
      const newVal = media_attributes[key];
      const oldVal = currentAttributes[key];
      if (newVal === undefined || newVal === null) {
        return;
      }
      const isDifferent = Array.isArray(newVal) ? JSON.stringify(newVal) !== JSON.stringify(oldVal) : newVal !== oldVal;
      if (isDifferent) {
        // Always persist ID and SRC.
        if (key === 'id' || key === 'src') {
          updatedAttributes[key] = newVal;
          return;
        }

        // For other attributes, only persist if forcePersist is true
        // or if we DON'T have an attachment ID (manual URL mode).
        if (forcePersist || !attachmentObject.id) {
          updatedAttributes[key] = newVal;
        }
      }
    });
    if (Object.keys(updatedAttributes).length > 0) {
      setAttributes(updatedAttributes);
    }
  }, [setAttributes]);
  const processedIds = (0,external_wp_element_.useRef)(new Set());
  (0,external_wp_element_.useEffect)(() => {
    if (attachmentFromStore && isStandalone && !attachmentOverride) {
      const attachmentId = attachmentFromStore.id;
      // Only process each ID once to avoid infinite loops and keep attributes lean.
      if (!processedIds.current.has(attachmentId) || !id) {
        setAttributesFromMedia(attachmentFromStore, false);
        processedIds.current.add(attachmentId);
      }
    }
  }, [attachmentFromStore, isStandalone, id, attachmentOverride, setAttributesFromMedia]);
  (0,external_wp_element_.useEffect)(() => {
    if (attachmentError) {
      const status = attachmentError.data?.status || attachmentError.status;
      if (status === 404 || attachmentError.code === 'rest_post_invalid_id') {
        setAttributes({
          id: undefined,
          src: undefined,
          poster: undefined,
          sources: [],
          source_groups: {}
        });
        createErrorNotice((0,external_wp_i18n_.__)('The selected video attachment could not be found and may have been deleted. Resetting block.', 'video-embed-thumbnail-generator'), {
          type: 'snackbar'
        });
      }
    }
  }, [attachmentError, setAttributes, createErrorNotice]);
  const onUploadError = (0,external_wp_element_.useCallback)(message => {
    createErrorNotice(message, {
      type: 'snackbar'
    });
  }, [createErrorNotice]);
  const onSelectVideo = (0,external_wp_element_.useCallback)(video => {
    const videoArray = Array.isArray(video) ? video : [video];
    if (!videoArray || !videoArray.some(item => item.hasOwnProperty('url'))) {
      setAttributes({
        src: undefined,
        id: undefined,
        poster: undefined
      });
      return;
    }
    if (videoArray.length === 1) {
      const selectedVideo = videoArray[0];
      if ((0,external_wp_blob_namespaceObject.isBlobURL)(selectedVideo.url)) {
        hasAttemptedInitialUpload.current = true;
      }

      // Hydrate the block from the media object.
      // We don't force persistence here to keep the block markup lean if an ID is present.
      setAttributesFromMedia(selectedVideo, false);
    }
  }, [setAttributesFromMedia, setAttributes]);
  const onSelectURL = (0,external_wp_element_.useCallback)(newSrc => {
    if (newSrc !== src) {
      let filename = newSrc.split('?')[0].split('#')[0];
      filename = filename.split('/').pop();
      if (filename.includes('.')) {
        filename = filename.substring(0, filename.lastIndexOf('.'));
      }
      try {
        filename = decodeURIComponent(filename);
      } catch {
        // Ignore decoding errors
      }
      setAttributes({
        src: newSrc,
        id: undefined,
        title: filename,
        caption: '',
        poster: '',
        starts: undefined,
        embedlink: ''
      });
    }
  }, [src, setAttributes]);
  (0,external_wp_element_.useEffect)(() => {
    (0,settings/* getSettings */.mt)().then(response => {
      setOptions(response);
    });
    if (!hasAttemptedInitialUpload.current && !id && (0,external_wp_blob_namespaceObject.isBlobURL)(src)) {
      hasAttemptedInitialUpload.current = true;
      const file = (0,external_wp_blob_namespaceObject.getBlobByURL)(src);
      setTemporarySrc(src);
      setAttributes({
        src: undefined
      });
      if (file) {
        mediaUpload({
          filesList: [file],
          onFileChange: ([videoFile]) => onSelectVideo(videoFile),
          onError: onUploadError,
          allowedTypes: ALLOWED_MEDIA_TYPES
        });
      }
    }
  }, [id, src, mediaUpload, onSelectVideo, onUploadError, setAttributes, isStandalone]);
  (0,external_wp_element_.useEffect)(() => {
    // Skip entirely in preview contexts (Settings/Classic-editor/Attachment
    // Details previews) — the hardcoded bundled sample asset never has real
    // transcoded source_groups to discover, and every one of these previews
    // gets rebuilt (and this block's attributes re-synced from its own
    // unresolved 'videopack-preview-video' default) on every unrelated
    // settings change, which was turning this into a self-perpetuating
    // resolve → refetch → resolve cascade on every keystroke.
    if (effectiveDesign.isPreview) {
      return;
    }
    if (src === 'videopack-preview-video') {
      setAttributes({
        src: videopack_config.url + '/src/images/Adobestock_469037984.mp4'
      });
    } else if (!id && src && src !== 'videopack-preview-video' && !(0,external_wp_blob_namespaceObject.isBlobURL)(src)) {
      external_wp_apiFetch_default()({
        path: `/videopack/v1/sources?url=${encodeURIComponent(src)}`
      }).then(response => {
        if (response && Object.keys(response).length > 0) {
          setAttributes({
            source_groups: response
          });
        }
      }).catch(error => {
        console.error('Error fetching video sources:', error);
      });
    }
  }, [id, src, setAttributes, effectiveDesign.isPreview]);
  const {
    isProbing,
    probedMetadata
  } = (0,useVideoProbe/* default */.A)(effectiveSrc);
  const [probedMetadataOverride, setProbedMetadataOverride] = (0,external_wp_element_.useState)(null);
  (0,external_wp_element_.useEffect)(() => {
    if (attachment?.media_details && !probedMetadata) {
      const {
        width,
        height,
        duration
      } = attachment.media_details;
      setProbedMetadataOverride({
        width,
        height,
        duration,
        isTainted: false
      });
    } else if (!effectiveSrc) {
      setProbedMetadataOverride(null);
    }
  }, [attachment, probedMetadata, effectiveSrc]);
  const effectiveMetadata = probedMetadataOverride || probedMetadata;
  const template = (0,external_wp_element_.useMemo)(() => {
    const globalOpts = videopack_config?.options || {};
    const showTitleBar = !!(globalOpts.overlay_title || globalOpts.downloadlink || globalOpts.embedcode);
    const engine_inner_blocks = [];
    if (showTitleBar) {
      engine_inner_blocks.push(['videopack/title', {}, (0,titleDownloadBlock/* getTitleInnerTemplate */.jM)(!!globalOpts.downloadlink, !!globalOpts.embedcode)]);
    }
    if (globalOpts.watermark) {
      engine_inner_blocks.push(['videopack/watermark', {}]);
    }
    return [['videopack/player', {
      lock: {
        remove: true,
        move: false
      }
    }, engine_inner_blocks], ['videopack/view-count', {}]];
  }, []);
  const bridgeOverrides = (0,external_wp_element_.useMemo)(() => {
    return {
      'videopack/isInsidePlayerContainer': true,
      'videopack/isStandalone': isStandalone,
      'videopack/attachmentId': effectiveId,
      'videopack/postType': isStandalone ? 'attachment' : context['videopack/postType'] || context.postType || 'post'
    };
  }, [context, isStandalone, effectiveId]);
  const placeholder = content => {
    return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Placeholder, {
      className: "block-editor-media-placeholder",
      withIllustration: true,
      icon: icon/* videopackVideo */.U9,
      label: (0,external_wp_i18n_.__)('Videopack Video', 'video-embed-thumbnail-generator'),
      instructions: (0,external_wp_i18n_.__)('Upload a video file, pick one from your media library, or add one with a URL.', 'video-embed-thumbnail-generator'),
      children: content
    });
  };
  let blockContent;
  if (isDiscovering && !effectiveId) {
    blockContent = /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
      className: "videopack-video-discovery-loading",
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.Placeholder, {
        icon: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.BlockIcon, {
          icon: icon/* videopackVideo */.U9
        }),
        label: (0,external_wp_i18n_.__)('Videopack Video', 'video-embed-thumbnail-generator'),
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Spinner, {}), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("p", {
          children: (0,external_wp_i18n_.__)('Searching for attached video…', 'video-embed-thumbnail-generator')
        })]
      })
    });
  } else if (!effectiveSrc && !effectiveId) {
    blockContent = /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.MediaPlaceholder, {
      icon: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.BlockIcon, {
        icon: icon/* videopackVideo */.U9
      }),
      onSelect: onSelectVideo,
      onSelectURL: onSelectURL,
      accept: "video/*,image/gif",
      allowedTypes: ALLOWED_MEDIA_TYPES,
      value: attributes,
      onError: onUploadError,
      placeholder: placeholder,
      query: {
        videopack_filter: 'select_video_source'
      }
    });
  } else if (!id && effectiveSrc && (0,external_wp_blob_namespaceObject.isBlobURL)(effectiveSrc)) {
    blockContent = /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      className: "components-placeholder block-editor-media-placeholder is-large has-illustration",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "components-placeholder__label",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.BlockIcon, {
          icon: icon/* videopackVideo */.U9
        }), (0,external_wp_i18n_.__)('Videopack Video', 'video-embed-thumbnail-generator')]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "components-placeholder__fieldset",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "videopack-uploading-overlay-content",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("p", {
            children: (0,external_wp_i18n_.__)('Uploading…', 'video-embed-thumbnail-generator')
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "videopack-progress-bar-container",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ProgressBar, {})
          })]
        })
      })]
    });
  } else {
    blockContent = /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_blockEditor_.BlockControls, {
        group: "other",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.MediaReplaceFlow, {
          mediaId: id,
          mediaURL: effectiveSrc,
          allowedTypes: ALLOWED_MEDIA_TYPES,
          accept: "video/*,image/gif",
          onSelect: onSelectVideo,
          onSelectURL: onSelectURL,
          onError: onUploadError,
          query: {
            videopack_filter: 'select_video_source'
          }
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          icon: undo/* default */.A,
          label: (0,external_wp_i18n_.__)('Restart Video', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            restartCount: (attributes.restartCount || 0) + 1
          })
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.BlockControls, {
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          icon: caption_default,
          label: (0,external_wp_i18n_.__)('Add caption', 'video-embed-thumbnail-generator'),
          onClick: () => {
            const hasCaption = innerBlocks.some(block => block.name === 'videopack/caption');
            if (!hasCaption) {
              insertBlock((0,external_wp_blocks_.createBlock)('videopack/caption', {
                caption: attributes.caption || ''
              }), innerBlocks.length, clientId);
            }
          }
        })
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("figure", {
        style: {
          ...contextStyle,
          display: effectiveSrc || effectiveId ? 'block' : 'none'
        },
        "aria-hidden": !(effectiveSrc || effectiveId),
        className: `videopack-video-block-container videopack-wrapper ${contextClasses}${effectiveDesign.isPreview ? ' is-preview' : ''}`,
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(VideopackContextBridge/* default */.A, {
          attributes: resolvedAttributes,
          context: context,
          overrides: bridgeOverrides,
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.InnerBlocks, {
            template: template,
            templateLock: false,
            allowedBlocks: ALLOWED_BLOCKS,
            renderAppender: showPlayerContainerAppender ? external_wp_blockEditor_.InnerBlocks.ButtonBlockAppender : false
          })
        }, effectiveId || resolvedPostIdFromContext)
      })]
    });
  }
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_blockEditor_.InspectorControls, {
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(Thumbnails/* default */.A, {
        setAttributes: setAttributes,
        attributes: attributes,
        videoData: videoData,
        options: options,
        parentId: resolvedPostIdFromContext || editorPostId || 0,
        isProbing: isProbing,
        probedMetadata: effectiveMetadata
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(VideoSettings/* default */.A, {
        setAttributes: setAttributes,
        attributes: attributes,
        options: options,
        isProbing: isProbing,
        probedMetadata: effectiveMetadata,
        fallbackTitle: attachment?.title?.rendered || attachment?.title?.raw || resolvedAttributes.title || '',
        fallbackCaption: attachment?.caption?.rendered || attachment?.caption?.raw || resolvedAttributes.caption || '',
        isBlockEditor: true
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(AdditionalFormats/* default */.A, {
        attributes: attributes,
        options: options,
        isProbing: isProbing,
        probedMetadata: effectiveMetadata,
        isDiscovering: isDiscovering
      }, attributes.id || effectiveSrc)]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("figure", {
      ...blockProps,
      children: blockContent
    })]
  });
}
;// ./src/blocks/player-container/save.js


/**
 * The save function defines the way in which the different attributes should
 * be combined into the final markup, which is then serialized by the block
 * editor into `post_content`.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/block-edit-save/#save
 */

function save() {
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.InnerBlocks.Content, {});
}
;// ./src/blocks/player-container/block.json
const block_namespaceObject = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"videopack/player-container","title":"Videopack Video","category":"media","icon":"format-video","description":"Embed a single video with Videopack features.","usesContext":["postId","postType"],"supports":{"html":false,"align":true,"dimensions":{"aspectRatio":false,"height":false,"minHeight":false,"width":false},"spacing":{"margin":true,"padding":true,"blockGap":true},"filter":{"duotone":true}},"selectors":{"filter":{"duotone":".wp-block-videopack-player-container .vjs-poster img, .wp-block-videopack-player-container .mejs-poster img, .wp-block-videopack-player-container .mejs-poster"}},"example":{"attributes":{"src":"videopack-preview-video","title":"Sample Video","overlay_title":true,"isPreview":true}},"attributes":{"id":{"type":"number"},"src":{"type":"string"},"poster":{"type":"string"},"title":{"type":"string"},"caption":{"type":"string"},"width":{"type":"number"},"height":{"type":"number"},"autoplay":{"type":"boolean","default":false},"controls":{"type":"boolean","default":true},"loop":{"type":"boolean","default":false},"muted":{"type":"boolean","default":false},"playsinline":{"type":"boolean","default":false},"preload":{"type":"string","default":"metadata"},"volume":{"type":"number","default":1},"auto_res":{"type":"string"},"sources":{"type":"array","default":[]},"source_groups":{"type":"object","default":{}},"text_tracks":{"type":"array","default":[]},"playback_rate":{"type":"boolean","default":false},"watermark":{"type":"string"},"watermark_styles":{"type":"object","default":{}},"watermark_link_to":{"type":"string","default":""},"default_ratio":{"type":"string","default":"16 / 9"},"fixed_aspect":{"type":"string","default":"false"},"fullwidth":{"type":"boolean","default":false},"textAlign":{"type":"string"},"downloadlink":{"type":"boolean"},"overlay_title":{"type":"boolean"},"views":{"type":"boolean"},"embedcode":{"type":"boolean"},"embedlink":{"type":"string"},"embed_method":{"type":"string"},"showCaption":{"type":"boolean","default":false},"showBackground":{"type":"boolean"},"title_position":{"type":"string","default":"top"},"isInsidePlayerOverlay":{"type":"boolean","default":false},"restartCount":{"type":"number","default":0},"isInsidePlayerContainer":{"type":"boolean","default":true},"isPreview":{"type":"boolean","default":false}},"textdomain":"video-embed-thumbnail-generator","editorScript":"file:./index.js","editorStyle":"file:./index.css"}');
// EXTERNAL MODULE: ./src/blocks/shared/design-context.js
var design_context = __webpack_require__(6545);
;// ./src/blocks/player-container/index.js








// usesContext is intentionally excluded from this spread: the static,
// build-time block.json only has this block's own ["postId", "postType"],
// but src/Admin/Ui.php merges that with a much larger, dynamically-computed
// videopack/* list at registration time (Ui.php:453) — server-registered
// metadata already carries both. Passing our own (smaller, stale) local
// copy here would replace, not merge with, that server-provided value.
const {
  usesContext: _localUsesContext,
  ...metadataWithoutUsesContext
} = block_namespaceObject;
(0,external_wp_blocks_.registerBlockType)(block_namespaceObject.name, {
  ...metadataWithoutUsesContext,
  icon: icon/* videopackVideo */.U9,
  attributes: {
    ...block_namespaceObject.attributes,
    ...design_context/* designAttributes */.qz
  },
  /**
   * @see ./edit.js
   */
  edit: Edit,
  /**
   * @see ./save.js
   */
  save: save
});

/***/ },

/***/ 7718
(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {


// EXTERNAL MODULE: external ["wp","blocks"]
var external_wp_blocks_ = __webpack_require__(4997);
// EXTERNAL MODULE: external ["wp","blockEditor"]
var external_wp_blockEditor_ = __webpack_require__(4715);
// EXTERNAL MODULE: ./src/components/VideopackContextBridge.js
var VideopackContextBridge = __webpack_require__(4773);
// EXTERNAL MODULE: external ["wp","element"]
var external_wp_element_ = __webpack_require__(6087);
// EXTERNAL MODULE: external ["wp","data"]
var external_wp_data_ = __webpack_require__(7143);
// EXTERNAL MODULE: ./src/hooks/useVideoFormats.js
var useVideoFormats = __webpack_require__(5869);
// EXTERNAL MODULE: ./src/hooks/useVideopackContext.js
var useVideopackContext = __webpack_require__(5633);
// EXTERNAL MODULE: ./src/hooks/useVideoProbe.js
var useVideoProbe = __webpack_require__(5711);
// EXTERNAL MODULE: ./src/api/settings.js
var settings = __webpack_require__(4602);
// EXTERNAL MODULE: external ["wp","i18n"]
var external_wp_i18n_ = __webpack_require__(7723);
// EXTERNAL MODULE: external ["wp","components"]
var external_wp_components_ = __webpack_require__(6427);
// EXTERNAL MODULE: ./node_modules/@wordpress/icons/build-module/library/undo.mjs
var undo = __webpack_require__(6123);
// EXTERNAL MODULE: ./src/components/VideoPlayer/VideoPlayer.js
var VideoPlayer = __webpack_require__(730);
// EXTERNAL MODULE: ./src/components/VideoSettings/VideoSettings.js
var VideoSettings = __webpack_require__(1602);
// EXTERNAL MODULE: ./src/components/Thumbnails/Thumbnails.js
var Thumbnails = __webpack_require__(8814);
// EXTERNAL MODULE: ./src/components/AdditionalFormats/AdditionalFormats.js
var AdditionalFormats = __webpack_require__(6022);
// EXTERNAL MODULE: external "ReactJSXRuntime"
var external_ReactJSXRuntime_ = __webpack_require__(790);
;// ./src/blocks/player/edit.js
/* global videopack_config */

















const ALLOWED_BLOCKS = ['videopack/watermark', 'videopack/title'];
const PLAYER_CONTEXT_CLASS_KEYS = ['skin', 'control_bar_bg_color', 'control_bar_color', 'play_button_color', 'play_button_secondary_color'];

/**
 * Edit component for the video player block.
 *
 * @param {Object} props         Component props.
 * @param {Object} props.context Block context.
 * @return {Object}              The rendered component.
 */
function Edit(props) {
  const {
    context,
    isSelected,
    clientId
  } = props;
  const [options, setOptions] = (0,external_wp_element_.useState)({});
  const [restartCount, setRestartCount] = (0,external_wp_element_.useState)(0);
  const {
    parentClientId,
    parentAttributes,
    hasTitleBlock,
    isAnySelected,
    editorPostId
  } = (0,external_wp_data_.useSelect)(select => {
    const {
      getBlockRootClientId,
      getBlockAttributes,
      getBlocks,
      isBlockSelected,
      hasSelectedInnerBlock
    } = select(external_wp_blockEditor_.store);
    const rootId = getBlockRootClientId(clientId);
    const blocks = getBlocks(clientId);
    const editor = select('core/editor');
    return {
      parentClientId: rootId,
      parentAttributes: rootId ? getBlockAttributes(rootId) : {},
      hasTitleBlock: blocks.some(block => block.name === 'videopack/title'),
      isAnySelected: isBlockSelected(clientId) || hasSelectedInnerBlock(clientId, true),
      editorPostId: editor?.getCurrentPostId()
    };
  }, [clientId]);
  const resetPlayer = (0,external_wp_element_.useCallback)(() => {
    setRestartCount(prev => prev + 1);
  }, []);
  (0,external_wp_element_.useEffect)(() => {
    (0,settings/* getSettings */.mt)().then(setOptions);
  }, []);
  const {
    updateBlockAttributes
  } = (0,external_wp_data_.useDispatch)(external_wp_blockEditor_.store);
  const setParentAttributes = (0,external_wp_element_.useCallback)(newAttrs => {
    if (parentClientId) {
      updateBlockAttributes(parentClientId, newAttrs);
    }
  }, [parentClientId, updateBlockAttributes]);
  const filteredAllowedBlocks = (0,external_wp_element_.useMemo)(() => {
    if (hasTitleBlock) {
      return ALLOWED_BLOCKS.filter(name => name !== 'videopack/title');
    }
    return ALLOWED_BLOCKS;
  }, [hasTitleBlock]);

  // These options would ideally come from the parent via context if we updated videopack-video to provide them,
  // but for now we'll fetch them or rely on the parent's attributes.
  const videoData = (0,external_wp_element_.useMemo)(() => ({
    record: null,
    setRecord: () => {},
    hasResolved: true
  }), []);
  const isSiteEditor = (0,external_wp_data_.useSelect)(select => {
    const postType = select('core/editor')?.getCurrentPostType();
    return postType === 'wp_template' || postType === 'wp_template_part';
  }, []);
  const postId = context['videopack/postId'];
  const isContextual = postId && (Number(postId) !== Number(editorPostId) || isSiteEditor);
  const resolvedPostId = isContextual ? postId : parentAttributes.id || undefined;

  // Use unified context hook for all design and behavior resolution
  const {
    resolved,
    style: contextStyles,
    classes: contextClasses
  } = (0,useVideopackContext/* default */.Ay)({
    ...parentAttributes,
    restartCount
  }, context, {
    classKeys: PLAYER_CONTEXT_CLASS_KEYS
  });
  const {
    src,
    skin,
    isDiscovering
  } = resolved;
  (0,useVideoProbe/* default */.A)(src);
  const hasSources = parentAttributes.sources && parentAttributes.sources.length > 0 || parentAttributes.source_groups && Object.keys(parentAttributes.source_groups).length > 0;

  // Skip in preview contexts — there's no real attachment behind the
  // hardcoded bundled sample video, so this can never resolve anything
  // useful, and previews get rebuilt on every unrelated settings change.
  const {
    formats
  } = (0,useVideoFormats/* useVideoFormats */.l)(!hasSources && src && !resolved.isPreview ? resolvedPostId : null, !hasSources && src && !resolved.isPreview ? src : null);
  (0,external_wp_element_.useEffect)(() => {
    resetPlayer();
  }, [skin, resetPlayer]);

  // Merge parent attributes with global options for mirroring panels
  const effectiveAttributes = (0,external_wp_element_.useMemo)(() => {
    const result = {
      ...options,
      ...parentAttributes,
      ...resolved,
      // Include all resolved values
      id: resolvedPostId
    };
    if (resolved.isPreview) {
      result.src = videopack_config.url + '/src/images/Adobestock_469037984.mp4';
      result.poster = videopack_config.url + '/src/images/Adobestock_469037984_thumb1.jpg';
    }
    return result;
  }, [options, parentAttributes, resolved, resolvedPostId]);
  const config = typeof window !== 'undefined' ? window.videopack_config : undefined;
  const mejsSvgPath = config?.mejs_controls_svg || (typeof window !== 'undefined' ? `${window.location.origin}/wp-includes/js/mediaelement/mejs-controls.svg` : '');
  const bridgeOverrides = (0,external_wp_element_.useMemo)(() => {
    const overrides = {
      'videopack/isInsidePlayerContainer': context['videopack/isInsidePlayerContainer'],
      'videopack/isStandalone': context['videopack/isStandalone'],
      'videopack/attachmentId': context['videopack/attachmentId'] || effectiveAttributes.id,
      'videopack/postType': context['videopack/isStandalone'] ? 'attachment' : context['videopack/postType'] || 'post',
      'videopack/isInsidePlayerOverlay': true,
      'videopack/postId': context['videopack/attachmentId'] || effectiveAttributes.id
    };
    const sourceGroups = parentAttributes.source_groups || context['videopack/source_groups'];
    const sources = parentAttributes.sources || context['videopack/sources'];
    if (sourceGroups && Object.keys(sourceGroups).length > 0) {
      overrides['videopack/source_groups'] = sourceGroups;
    }
    if (sources && sources.length > 0) {
      overrides['videopack/sources'] = sources;
    }
    return overrides;
  }, [context, effectiveAttributes.id, parentAttributes.source_groups, parentAttributes.sources]);
  const blockProps = (0,external_wp_blockEditor_.useBlockProps)({
    className: `videopack-video-player-engine-block videopack-wrapper ${contextClasses}`,
    style: {
      ...contextStyles,
      '--videopack-mejs-controls-svg': mejsSvgPath ? `url("${mejsSvgPath}")` : undefined
    }
  });
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
    ...blockProps,
    children: [isSelected && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.BlockControls, {
      group: "other",
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarGroup, {
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          icon: undo/* default */.A,
          label: (0,external_wp_i18n_.__)('Restart Video', 'video-embed-thumbnail-generator'),
          onClick: resetPlayer
        })
      })
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_blockEditor_.InspectorControls, {
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(Thumbnails/* default */.A, {
        setAttributes: setParentAttributes,
        attributes: effectiveAttributes,
        videoData: videoData,
        options: options,
        parentId: editorPostId || 0
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(VideoSettings/* default */.A, {
        setAttributes: setParentAttributes,
        attributes: effectiveAttributes,
        options: options,
        fallbackTitle: parentAttributes.title || '',
        isBlockEditor: true
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(AdditionalFormats/* default */.A, {
        attributes: effectiveAttributes,
        options: options,
        isDiscovering: isDiscovering
      }, parentAttributes.id || parentAttributes.src)]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(VideoPlayer/* default */.A, {
      attributes: {
        ...parentAttributes,
        restartCount,
        ...(formats && !hasSources ? {
          source_groups: formats
        } : {})
      },
      context: context,
      isSelected: isSelected,
      hideStaticOverlays: true,
      onReady: () => {},
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: `videopack-inner-blocks-overlay ${hasTitleBlock ? 'videopack-has-title-block' : ''}`,
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(VideopackContextBridge/* default */.A, {
          attributes: parentAttributes,
          context: context,
          overrides: bridgeOverrides,
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.InnerBlocks, {
            allowedBlocks: filteredAllowedBlocks,
            templateLock: false,
            renderAppender: isAnySelected ? external_wp_blockEditor_.InnerBlocks.ButtonBlockAppender : false
          })
        }, resolvedPostId)
      }), !isAnySelected && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "videopack-block-overlay"
      })]
    })]
  });
}
;// ./src/blocks/player/save.js


/**
 * The save function defines the way in which the different attributes should
 * be combined into the final markup, which is then serialized by the block
 * editor into `post_content`.
 *
 * @return {Object} The rendered component.
 */

function save() {
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.InnerBlocks.Content, {});
}
;// ./src/blocks/player/block.json
const block_namespaceObject = /*#__PURE__*/JSON.parse('{"UU":"videopack/player"}');
// EXTERNAL MODULE: ./src/assets/icon.js
var icon = __webpack_require__(9427);
;// ./src/blocks/player/index.js





(0,external_wp_blocks_.registerBlockType)(block_namespaceObject.UU, {
  icon: icon/* videopackPlayer */.i4,
  edit: Edit,
  save: save
});

/***/ },

/***/ 808
(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {


// EXTERNAL MODULE: external ["wp","blocks"]
var external_wp_blocks_ = __webpack_require__(4997);
// EXTERNAL MODULE: external ["wp","element"]
var external_wp_element_ = __webpack_require__(6087);
// EXTERNAL MODULE: external ["wp","blockEditor"]
var external_wp_blockEditor_ = __webpack_require__(4715);
// EXTERNAL MODULE: external ["wp","components"]
var external_wp_components_ = __webpack_require__(6427);
// EXTERNAL MODULE: ./node_modules/@wordpress/icons/build-module/icon/index.mjs
var icon = __webpack_require__(319);
// EXTERNAL MODULE: ./node_modules/@wordpress/icons/build-module/library/not-allowed.mjs
var not_allowed = __webpack_require__(6039);
// EXTERNAL MODULE: ./node_modules/@wordpress/icons/build-module/library/media-and-text.mjs
var media_and_text = __webpack_require__(7133);
// EXTERNAL MODULE: external ["wp","i18n"]
var external_wp_i18n_ = __webpack_require__(7723);
// EXTERNAL MODULE: ./src/assets/icon.js
var assets_icon = __webpack_require__(9427);
// EXTERNAL MODULE: ./src/components/CompactColorPicker/CompactColorPicker.js
var CompactColorPicker = __webpack_require__(6312);
// EXTERNAL MODULE: ./src/utils/colors.js
var colors = __webpack_require__(7068);
// EXTERNAL MODULE: ./src/hooks/useVideopackContext.js
var useVideopackContext = __webpack_require__(5633);
// EXTERNAL MODULE: external "ReactJSXRuntime"
var external_ReactJSXRuntime_ = __webpack_require__(790);
;// ./src/blocks/share/edit.js
/* global videopack_config */










const CLASS_KEYS = ['title_color', 'title_background_color'];

/**
 * Edit component for the Videopack Video Share block.
 *
 * @param {Object}   root0               Component props.
 * @param {Object}   root0.attributes    Block attributes.
 * @param {Function} root0.setAttributes Attribute setter.
 * @param {Object}   root0.context       Block context.
 * @param {boolean}  root0.isSelected    Whether the block is selected.
 * @return {Element}                     The rendered component.
 */
function Edit({
  attributes,
  setAttributes,
  context,
  isSelected
}) {
  const vpContext = (0,useVideopackContext/* default */.Ay)(attributes, context, {
    classKeys: CLASS_KEYS
  });
  const {
    iconType = 'share',
    showText = false,
    styleType = 'text',
    textAlign,
    title_color,
    title_background_color,
    shareCopyLink = true,
    shareNativeShare = true,
    shareBluesky = true,
    shareThreads = true,
    shareFacebook = true,
    shareReddit = true,
    shareEmail = true
  } = attributes;
  const isInsideThumbnail = !!context['videopack/isInsideThumbnail'];
  const isInsidePlayerOverlay = !!context['videopack/isInsidePlayerOverlay'];
  const isInsideTitleMeta = !!context['videopack/isInsideTitleMeta'];
  const isOverlay = isInsideThumbnail || isInsidePlayerOverlay && !isInsideTitleMeta;
  const shouldPortal = isInsideThumbnail || isInsidePlayerOverlay || isInsideTitleMeta;
  const colorFallbacks = (0,external_wp_element_.useMemo)(() => (0,colors/* getColorFallbacks */.l)({
    title_color: vpContext.resolved.title_color,
    title_background_color: vpContext.resolved.title_background_color
  }), [vpContext.resolved.title_color, vpContext.resolved.title_background_color]);
  const defaultAlign = (0,external_wp_element_.useMemo)(() => {
    if (isInsideThumbnail) {
      return 'center';
    }
    return 'left';
  }, [isInsideThumbnail]);
  const finalTextAlign = textAlign || context['videopack/textAlign'] || defaultAlign;
  const position = attributes.position || context['videopack/position'] || 'top';
  const blockProps = (0,external_wp_blockEditor_.useBlockProps)({
    className: `videopack-share-block videopack-share-wrapper ${vpContext.classes} ${isOverlay ? `is-overlay position-${position}` : ''} ${isInsideThumbnail ? 'is-inside-thumbnail' : ''} ${isInsidePlayerOverlay ? 'is-inside-player' : ''} ${isInsideTitleMeta ? 'is-inside-title-meta' : ''} has-text-align-${finalTextAlign}`,
    style: {
      ...vpContext.style,
      display: 'inline-flex',
      alignItems: 'center'
    }
  });
  const THEME_COLORS = videopack_config?.themeColors;
  const [isOpen, setIsOpen] = (0,external_wp_element_.useState)(false);
  const menuContainerRef = (0,external_wp_element_.useRef)(null);
  const [portalTarget, setPortalTarget] = (0,external_wp_element_.useState)(null);
  (0,external_wp_element_.useEffect)(() => {
    if (shouldPortal && menuContainerRef.current) {
      const target = menuContainerRef.current.closest('.wp-block-videopack-player') || menuContainerRef.current.closest('.wp-block-videopack-player-container') || menuContainerRef.current.closest('.videopack-player') || menuContainerRef.current.closest('.videopack-player-relative-wrapper') || menuContainerRef.current.closest('.videopack-thumbnail-wrapper') || menuContainerRef.current.closest('.videopack-video-block-container') || menuContainerRef.current.closest('.videopack-collection-item') || menuContainerRef.current.parentElement;
      setPortalTarget(target);
    }
  }, [shouldPortal, isOpen]);
  const combinedRef = node => {
    menuContainerRef.current = node;
    if (blockProps.ref) {
      if (typeof blockProps.ref === 'function') {
        blockProps.ref(node);
      } else if (typeof blockProps.ref === 'object') {
        blockProps.ref.current = node;
      }
    }
  };
  (0,external_wp_element_.useEffect)(() => {
    if (!isOpen) {
      return undefined;
    }
    const handleOutside = event => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);
  (0,external_wp_element_.useEffect)(() => {
    if (!isSelected) {
      setIsOpen(false);
    }
  }, [isSelected]);
  const getActiveShareIcon = () => {
    if (iconType === 'external') {
      return assets_icon/* shareAlt2 */.L_;
    }
    if (iconType === 'iosShare') {
      return assets_icon/* shareAlt1 */.Sr;
    }
    if (iconType === 'curveShare') {
      return assets_icon/* shareAlt3 */.SM;
    }
    return assets_icon/* share */.uM;
  };
  const renderIcon = () => {
    if (iconType === 'share') {
      return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(icon/* default */.A, {
        icon: isOpen ? assets_icon/* close */.VN : assets_icon/* share */.uM,
        className: "videopack-icon-svg"
      });
    }
    if (iconType === 'external') {
      return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(icon/* default */.A, {
        icon: assets_icon/* shareAlt2 */.L_,
        className: "videopack-icon-svg"
      });
    }
    if (iconType === 'iosShare') {
      return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(icon/* default */.A, {
        icon: assets_icon/* shareAlt1 */.Sr,
        className: "videopack-icon-svg"
      });
    }
    if (iconType === 'curveShare') {
      return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(icon/* default */.A, {
        icon: assets_icon/* shareAlt3 */.SM,
        className: "videopack-icon-svg"
      });
    }
    return null;
  };
  const renderTriggerContent = () => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
    children: [iconType !== 'none' && renderIcon(), (showText || iconType === 'none') && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
      className: "videopack-share-text-label",
      style: {
        marginLeft: iconType !== 'none' ? '4px' : '0'
      },
      children: (0,external_wp_i18n_.__)('Share', 'video-embed-thumbnail-generator')
    }), !isOverlay && !isInsideTitleMeta && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
      className: "videopack-caret",
      children: "\u25BC"
    })]
  });
  const linkClassName = `videopack-share-link videopack-icons style-${styleType}`;
  const shareContainerContent = /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
    className: `videopack-share-container${isOpen ? ' is-visible' : ''}`,
    onClick: e => e.stopPropagation(),
    onKeyDown: e => e.stopPropagation(),
    role: "presentation",
    children: [(shareCopyLink || shareNativeShare || shareBluesky || shareThreads || shareFacebook || shareReddit || shareEmail) && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      className: "videopack-share-services-grid",
      children: [shareCopyLink && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("button", {
        type: "button",
        className: "videopack-share-btn videopack-btn-copylink",
        title: (0,external_wp_i18n_.__)('Copy Link', 'video-embed-thumbnail-generator'),
        onClick: e => e.preventDefault(),
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(icon/* default */.A, {
          icon: assets_icon/* copyLink */.S
        })
      }), shareNativeShare && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("button", {
        type: "button",
        className: "videopack-share-btn videopack-btn-nativeshare",
        title: (0,external_wp_i18n_.__)('Share via Device', 'video-embed-thumbnail-generator'),
        onClick: e => e.preventDefault(),
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(icon/* default */.A, {
          icon: getActiveShareIcon()
        })
      }), shareBluesky && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("button", {
        type: "button",
        className: "videopack-share-btn videopack-btn-bluesky",
        title: (0,external_wp_i18n_.__)('Share on Bluesky', 'video-embed-thumbnail-generator'),
        onClick: e => e.preventDefault(),
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(icon/* default */.A, {
          icon: assets_icon/* bluesky */.uj
        })
      }), shareThreads && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("button", {
        type: "button",
        className: "videopack-share-btn videopack-btn-threads",
        title: (0,external_wp_i18n_.__)('Share on Threads', 'video-embed-thumbnail-generator'),
        onClick: e => e.preventDefault(),
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(icon/* default */.A, {
          icon: assets_icon/* threads */.eD
        })
      }), shareFacebook && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("button", {
        type: "button",
        className: "videopack-share-btn videopack-btn-facebook",
        title: (0,external_wp_i18n_.__)('Share on Facebook', 'video-embed-thumbnail-generator'),
        onClick: e => e.preventDefault(),
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(icon/* default */.A, {
          icon: assets_icon/* facebook */.V2
        })
      }), shareReddit && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("button", {
        type: "button",
        className: "videopack-share-btn videopack-btn-reddit",
        title: (0,external_wp_i18n_.__)('Share on Reddit', 'video-embed-thumbnail-generator'),
        onClick: e => e.preventDefault(),
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(icon/* default */.A, {
          icon: assets_icon/* reddit */.N8
        })
      }), shareEmail && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("button", {
        type: "button",
        className: "videopack-share-btn videopack-btn-email",
        title: (0,external_wp_i18n_.__)('Share via Email', 'video-embed-thumbnail-generator'),
        onClick: e => e.preventDefault(),
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(icon/* default */.A, {
          icon: assets_icon/* email */.Rp
        })
      })]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("span", {
      className: "videopack-embedcode-container",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
        className: "videopack-icons embed",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(icon/* default */.A, {
          icon: assets_icon/* embed */.E6,
          className: "videopack-icon-svg"
        })
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
        children: (0,external_wp_i18n_.__)('Embed:', 'video-embed-thumbnail-generator')
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("input", {
          className: "videopack-embed-code",
          type: "text",
          value: `<iframe src="https://example.com/embed" width="960" height="540" allow="autoplay; fullscreen" allowfullscreen loading="lazy"></iframe>`,
          readOnly: true
        })
      })]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("span", {
      className: "videopack-start-at-container",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("input", {
        type: "checkbox",
        className: "videopack-start-at-enable",
        id: "videopack-start-at-enable-editor"
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
        htmlFor: "videopack-start-at-enable-editor",
        children: (0,external_wp_i18n_.__)('Start at:', 'video-embed-thumbnail-generator')
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("input", {
        type: "text",
        className: "videopack-start-at",
        defaultValue: "00:00"
      })]
    })]
  });
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_blockEditor_.BlockControls, {
      children: [isOverlay && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.BlockVerticalAlignmentControl, {
        value: position,
        onChange: nextPosition => {
          setAttributes({
            position: nextPosition || undefined
          });
        }
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.AlignmentControl, {
        value: finalTextAlign,
        onChange: nextAlign => {
          setAttributes({
            textAlign: nextAlign
          });
        }
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.ToolbarGroup, {
        label: (0,external_wp_i18n_.__)('Icon Style', 'video-embed-thumbnail-generator'),
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          icon: not_allowed/* default */.A,
          label: (0,external_wp_i18n_.__)('No Icon', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            iconType: 'none'
          }),
          isPressed: iconType === 'none'
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          icon: assets_icon/* share */.uM,
          label: (0,external_wp_i18n_.__)('Standard Share Icon', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            iconType: 'share'
          }),
          isPressed: iconType === 'share'
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          icon: assets_icon/* shareAlt2 */.L_,
          label: (0,external_wp_i18n_.__)('External Link Icon', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            iconType: 'external'
          }),
          isPressed: iconType === 'external'
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          icon: assets_icon/* shareAlt1 */.Sr,
          label: (0,external_wp_i18n_.__)('iOS Style Share Icon', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            iconType: 'iosShare'
          }),
          isPressed: iconType === 'iosShare'
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          icon: assets_icon/* shareAlt3 */.SM,
          label: (0,external_wp_i18n_.__)('Curved Arrow Share Icon', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            iconType: 'curveShare'
          }),
          isPressed: iconType === 'curveShare'
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarGroup, {
        label: (0,external_wp_i18n_.__)('Display Options', 'video-embed-thumbnail-generator'),
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          icon: media_and_text/* default */.A,
          label: (0,external_wp_i18n_.__)('Toggle Text', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            showText: !showText
          }),
          isPressed: showText
        })
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.ToolbarGroup, {
        label: (0,external_wp_i18n_.__)('Style Type', 'video-embed-thumbnail-generator'),
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          label: (0,external_wp_i18n_.__)('Link Style', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            styleType: 'text'
          }),
          isPressed: styleType === 'text',
          children: (0,external_wp_i18n_.__)('Link', 'video-embed-thumbnail-generator')
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          label: (0,external_wp_i18n_.__)('Button Style', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            styleType: 'button'
          }),
          isPressed: styleType === 'button',
          children: (0,external_wp_i18n_.__)('Button', 'video-embed-thumbnail-generator')
        })]
      })]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_blockEditor_.InspectorControls, {
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelBody, {
        title: (0,external_wp_i18n_.__)('Colors', 'video-embed-thumbnail-generator'),
        initialOpen: true,
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "videopack-color-section",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("p", {
            className: "videopack-settings-section-title",
            children: (0,external_wp_i18n_.__)('Colors', 'video-embed-thumbnail-generator')
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            className: "videopack-color-flex-row",
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker/* default */.A, {
                label: (0,external_wp_i18n_.__)('Text', 'video-embed-thumbnail-generator'),
                value: title_color,
                onChange: value => setAttributes({
                  title_color: value
                }),
                colors: THEME_COLORS,
                fallbackValue: colorFallbacks.title_color
              })
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker/* default */.A, {
                label: (0,external_wp_i18n_.__)('Background', 'video-embed-thumbnail-generator'),
                value: title_background_color,
                onChange: value => setAttributes({
                  title_background_color: value
                }),
                colors: THEME_COLORS,
                fallbackValue: colorFallbacks.title_background_color
              })
            })]
          })]
        })
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
        title: (0,external_wp_i18n_.__)('Share Services', 'video-embed-thumbnail-generator'),
        initialOpen: true,
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
          label: (0,external_wp_i18n_.__)('Copy Link', 'video-embed-thumbnail-generator'),
          checked: shareCopyLink,
          onChange: val => setAttributes({
            shareCopyLink: val
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
          label: (0,external_wp_i18n_.__)('Native Share', 'video-embed-thumbnail-generator'),
          checked: shareNativeShare,
          onChange: val => setAttributes({
            shareNativeShare: val
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
          label: (0,external_wp_i18n_.__)('Bluesky', 'video-embed-thumbnail-generator'),
          checked: shareBluesky,
          onChange: val => setAttributes({
            shareBluesky: val
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
          label: (0,external_wp_i18n_.__)('Threads', 'video-embed-thumbnail-generator'),
          checked: shareThreads,
          onChange: val => setAttributes({
            shareThreads: val
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
          label: (0,external_wp_i18n_.__)('Facebook', 'video-embed-thumbnail-generator'),
          checked: shareFacebook,
          onChange: val => setAttributes({
            shareFacebook: val
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
          label: (0,external_wp_i18n_.__)('Reddit', 'video-embed-thumbnail-generator'),
          checked: shareReddit,
          onChange: val => setAttributes({
            shareReddit: val
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
          label: (0,external_wp_i18n_.__)('Email', 'video-embed-thumbnail-generator'),
          checked: shareEmail,
          onChange: val => setAttributes({
            shareEmail: val
          })
        })]
      })]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      ...blockProps,
      ref: combinedRef,
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("button", {
        type: "button",
        className: `${linkClassName}${isOpen ? ' is-active' : ''}`,
        onClick: e => {
          e.preventDefault();
          setIsOpen(!isOpen);
        },
        children: renderTriggerContent()
      }), shouldPortal && portalTarget ? (0,external_wp_element_.createPortal)(shareContainerContent, portalTarget) : shareContainerContent]
    })]
  });
}
;// ./src/blocks/share/save.js
function save() {
  return null;
}
;// ./src/blocks/share/block.json
const block_namespaceObject = /*#__PURE__*/JSON.parse('{"UU":"videopack/share"}');
;// ./src/blocks/share/index.js







(0,external_wp_blocks_.registerBlockType)(block_namespaceObject.UU, {
  icon: assets_icon/* share */.uM,
  edit: Edit,
  save: save
});

/***/ },

/***/ 6545
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* unused harmony exports providesDesignContext, usesDesignContext */
/**
 * Shared design attributes and context definitions for Videopack blocks.
 */

const designAttributes = {
  skin: {
    type: 'string'
  },
  title_color: {
    type: 'string'
  },
  title_background_color: {
    type: 'string'
  },
  play_button_color: {
    type: 'string'
  },
  play_button_secondary_color: {
    type: 'string'
  },
  control_bar_bg_color: {
    type: 'string'
  },
  control_bar_color: {
    type: 'string'
  },
  pagination_color: {
    type: 'string'
  },
  pagination_background_color: {
    type: 'string'
  },
  pagination_active_bg_color: {
    type: 'string'
  },
  pagination_active_color: {
    type: 'string'
  },
  watermark: {
    type: 'string'
  },
  watermark_styles: {
    type: 'object'
  },
  watermark_link_to: {
    type: 'string'
  }
};
const providesDesignContext = (/* unused pure expression or super */ null && ({
  'videopack/skin': 'skin',
  'videopack/title_color': 'title_color',
  'videopack/title_background_color': 'title_background_color',
  'videopack/play_button_color': 'play_button_color',
  'videopack/play_button_secondary_color': 'play_button_secondary_color',
  'videopack/control_bar_bg_color': 'control_bar_bg_color',
  'videopack/control_bar_color': 'control_bar_color',
  'videopack/pagination_color': 'pagination_color',
  'videopack/pagination_background_color': 'pagination_background_color',
  'videopack/pagination_active_bg_color': 'pagination_active_bg_color',
  'videopack/pagination_active_color': 'pagination_active_color',
  'videopack/watermark': 'watermark',
  'videopack/watermark_styles': 'watermark_styles',
  'videopack/watermark_link_to': 'watermark_link_to'
}));
const usesDesignContext = (/* unused pure expression or super */ null && (['videopack/skin', 'videopack/title_color', 'videopack/title_background_color', 'videopack/play_button_color', 'videopack/play_button_secondary_color', 'videopack/control_bar_bg_color', 'videopack/control_bar_color', 'videopack/pagination_color', 'videopack/pagination_background_color', 'videopack/pagination_active_bg_color', 'videopack/pagination_active_color', 'videopack/watermark', 'videopack/watermark_styles', 'videopack/watermark_link_to']));
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "qz", 0, /* binding */ designAttributes
/* harmony export */ ]);


/***/ },

/***/ 2673
(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {


// EXTERNAL MODULE: external ["wp","blocks"]
var external_wp_blocks_ = __webpack_require__(4997);
// EXTERNAL MODULE: external ["wp","blockEditor"]
var external_wp_blockEditor_ = __webpack_require__(4715);
// EXTERNAL MODULE: external ["wp","components"]
var external_wp_components_ = __webpack_require__(6427);
// EXTERNAL MODULE: external ["wp","i18n"]
var external_wp_i18n_ = __webpack_require__(7723);
// EXTERNAL MODULE: ./node_modules/@wordpress/icons/build-module/library/not-allowed.mjs
var not_allowed = __webpack_require__(6039);
// EXTERNAL MODULE: external ["wp","primitives"]
var external_wp_primitives_ = __webpack_require__(5573);
// EXTERNAL MODULE: external "ReactJSXRuntime"
var external_ReactJSXRuntime_ = __webpack_require__(790);
;// ./node_modules/@wordpress/icons/build-module/library/fullscreen.mjs
// packages/icons/src/library/fullscreen.tsx


var fullscreen_default = /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.Path, { d: "M6 4a2 2 0 0 0-2 2v3h1.5V6a.5.5 0 0 1 .5-.5h3V4H6Zm3 14.5H6a.5.5 0 0 1-.5-.5v-3H4v3a2 2 0 0 0 2 2h3v-1.5Zm6 1.5v-1.5h3a.5.5 0 0 0 .5-.5v-3H20v3a2 2 0 0 1-2 2h-3Zm3-16a2 2 0 0 1 2 2v3h-1.5V6a.5.5 0 0 0-.5-.5h-3V4h3Z" }) });

//# sourceMappingURL=fullscreen.mjs.map

// EXTERNAL MODULE: ./node_modules/@wordpress/icons/build-module/library/post.mjs
var post = __webpack_require__(227);
;// ./node_modules/@wordpress/icons/build-module/library/video.mjs
// packages/icons/src/library/video.tsx


var video_default = /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.Path, { d: "M18.7 3H5.3C4 3 3 4 3 5.3v13.4C3 20 4 21 5.3 21h13.4c1.3 0 2.3-1 2.3-2.3V5.3C21 4 20 3 18.7 3zm.8 15.7c0 .4-.4.8-.8.8H5.3c-.4 0-.8-.4-.8-.8V5.3c0-.4.4-.8.8-.8h13.4c.4 0 .8.4.8.8v13.4zM10 15l5-3-5-3v6z" }) });

//# sourceMappingURL=video.mjs.map

// EXTERNAL MODULE: ./node_modules/@wordpress/icons/build-module/library/page.mjs
var page = __webpack_require__(7884);
// EXTERNAL MODULE: external ["wp","data"]
var external_wp_data_ = __webpack_require__(7143);
// EXTERNAL MODULE: ./src/components/Duotone/CustomDuotoneFilter.js
var CustomDuotoneFilter = __webpack_require__(7221);
// EXTERNAL MODULE: ./src/hooks/useVideopackContext.js
var useVideopackContext = __webpack_require__(5633);
;// ./src/components/VideoThumbnailPreview/VideoThumbnailPreview.js




/**
 * Shared Video Thumbnail Component for Edit/Preview
 *
 * @param {Object} root0                      Component props
 * @param {number} root0.postId               Video Post ID (Attachment ID)
 * @param {string} root0.linkTo               Link to target.
 * @param {Node}   root0.children             Inner blocks
 * @param {string} root0.resolvedDuotoneClass Duotone class to apply
 * @param {Object} root0.context              Block context.
 * @param {Object} root0.video                Video data.
 * @param {Object} root0.style                Block styles.
 * @param {string} root0.clientId             Block client ID.
 * @param {Object} root0.attributes           Block attributes.
 * @return {Element}                          VideoThumbnail component
 */

function VideoThumbnailPreview({
  postId: propPostId,
  linkTo: propLinkTo,
  children,
  resolvedDuotoneClass: propResolvedDuotoneClass,
  context = {},
  video: manualVideo = {},
  style,
  clientId,
  attributes = {}
}) {
  const vpContext = (0,useVideopackContext/* default */.Ay)(attributes, context);
  const {
    resolved: {
      duotone: contextDuotone
    }
  } = vpContext;

  // Duotone resolution - prioritize direct prop, then local style, then context
  const duotone = style?.color?.duotone || attributes?.duotone || contextDuotone;

  /**
   * Derive the duotone class from attributes.
   */
  const loopDuotoneId = context['videopack/loopDuotoneId'];
  let resolvedDuotoneClass = propResolvedDuotoneClass || loopDuotoneId;
  if (!resolvedDuotoneClass) {
    if (typeof duotone === 'string' && duotone.startsWith('var:preset|duotone|')) {
      resolvedDuotoneClass = `wp-duotone-${duotone.split('|').pop()}`;
    } else if (Array.isArray(duotone)) {
      // Ensure a truly unique ID per instance in the editor
      const instanceId = clientId || Math.random().toString(36).substr(2, 9);
      resolvedDuotoneClass = `videopack-custom-duotone-${instanceId}`;
    }
  }
  const video = manualVideo && Object.keys(manualVideo).length > 0 ? manualVideo : context['videopack/video'] || {};
  // 'videopack/poster' is a properly registered context key (unlike
  // 'videopack/video', which only worked via ad hoc prop-passing in the old
  // custom preview system) — Loop's real block-context provides it per item.
  const contextPoster = context['videopack/poster'];
  const postId = vpContext.resolved.attachmentId || propPostId;
  const effectiveSkin = vpContext.resolved.skin;
  // Deliberately doesn't track/show an isResolving state here — this fires
  // once per grid item lacking its own poster_url/contextPoster, and
  // swapping this component's own output between a spinner and the real
  // image (even boxed identically) was still visibly flashing OTHER,
  // already-loaded items in the same grid each time any one of these
  // resolved elsewhere. Falling straight through to defaultNoThumb below
  // while unresolved, then swapping the <img>'s src in place once real
  // data lands, avoids that entirely — no structural/state branch left to
  // flash between.
  const {
    thumbnailMedia,
    posterUrl
  } = (0,external_wp_data_.useSelect)(select => {
    if (!postId || postId < 1 || video.poster_url || contextPoster) {
      return {
        thumbnailMedia: null,
        posterUrl: null
      };
    }
    const {
      getEntityRecord,
      getMedia
    } = select('core');

    // Fetch the attachment record for the video
    const attachment = getEntityRecord('postType', 'attachment', postId);
    const videopackMeta = attachment?.meta?.['_videopack-meta'] || {};
    const videopackData = attachment?.videopack || {};

    // The thumbnail ID is stored in poster_id, and URL in poster
    const mediaId = videopackMeta.poster_id;
    const directPoster = videopackData.poster || videopackMeta.poster;
    return {
      thumbnailMedia: mediaId ? getMedia(mediaId) : null,
      posterUrl: directPoster
    };
  }, [postId, video.poster_url, contextPoster]);
  const config = typeof window !== 'undefined' ? window.videopack_config : undefined;
  const defaultNoThumb = config ? `${config.url}/src/images/nothumbnail.jpg` : '';

  // Priority: 1. Manual video data (previews), 2. Context-provided poster
  // (Loop's grid previews), 3. Direct poster URL from meta, 4. WordPress
  // media object, 5. Default "no thumbnail"
  const thumbnailUrl = video.poster_url || contextPoster || posterUrl || thumbnailMedia?.source_url || defaultNoThumb;
  const {
    play_button_color,
    play_button_secondary_color,
    embed_method: effectiveEmbedMethod
  } = vpContext.resolved;
  const containerClass = `gallery-thumbnail videopack-gallery-item wp-block wp-block-videopack-thumbnail ${effectiveEmbedMethod === 'Video.js' ? effectiveSkin || '' : ''} ${!loopDuotoneId && resolvedDuotoneClass ? resolvedDuotoneClass : ''} ${play_button_color ? 'videopack-has-play-button-color' : ''} ${play_button_secondary_color ? 'videopack-has-play-button-secondary-color' : ''} ${(vpContext.resolved.linkTo || propLinkTo) !== 'none' ? 'has-link' : ''} ${vpContext.resolved.isPreview ? 'is-preview' : ''}`.trim();
  const imgStyle = resolvedDuotoneClass && !loopDuotoneId ? {
    filter: `url(#${resolvedDuotoneClass})`
  } : {};
  const containerStyle = {
    '--videopack-play-button-color': play_button_color,
    '--videopack-play-button-secondary-color': play_button_secondary_color
  };
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
    className: containerClass,
    style: containerStyle,
    children: [thumbnailUrl && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("img", {
      src: thumbnailUrl,
      alt: thumbnailMedia?.alt_text || '',
      className: "videopack-thumbnail",
      style: imgStyle
    }), Array.isArray(duotone) && resolvedDuotoneClass && !loopDuotoneId && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CustomDuotoneFilter/* default */.A, {
      colors: duotone,
      id: resolvedDuotoneClass
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
      className: "videopack-inner-blocks-container",
      children: children
    })]
  });
}
;// ./src/blocks/thumbnail/edit.js
/* global videopack_config */









/**
 * Thumbnail Edit Component
 *
 * @param {Object}   root0               Component props
 * @param {Object}   root0.attributes    Block attributes
 * @param {Function} root0.setAttributes Attribute setter
 * @param {Object}   root0.context       Block context
 * @param {string}   root0.clientId      Block client ID
 * @param {boolean}  root0.isSelected    Whether this block is currently selected
 * @return {Element} Thumbnail edit component
 */

function Edit({
  attributes,
  setAttributes,
  context,
  clientId,
  isSelected
}) {
  const vpContext = (0,useVideopackContext/* default */.Ay)(attributes, context);
  const attachmentId = vpContext.resolved.attachmentId;
  const isDiscovering = vpContext.resolved.isDiscovering;
  const {
    linkTo
  } = attributes;
  const blockProps = (0,external_wp_blockEditor_.useBlockProps)();
  const {
    latestVideoId,
    hasSelectedInnerBlock
  } = (0,external_wp_data_.useSelect)(select => {
    const {
      hasSelectedInnerBlock: hasSelectedInner
    } = select('core/block-editor');
    const result = {
      latestVideoId: null,
      hasSelectedInnerBlock: hasSelectedInner(clientId, true)
    };
    // Only discover a fallback video when we don't already have one —
    // otherwise every grid item in a real gallery preview (each with
    // its own known attachmentId) fires this query pointlessly.
    if (!vpContext.resolved.isPreview || vpContext.resolved.attachmentId) {
      return result;
    }
    const query = {
      post_type: 'attachment',
      mime_type: 'video',
      per_page: 1,
      _fields: 'id'
    };
    const media = select('core').getEntityRecords('postType', 'attachment', query);
    return {
      ...result,
      latestVideoId: media?.[0]?.id
    };
  }, [vpContext.resolved.isPreview, vpContext.resolved.attachmentId, clientId]);

  // Only show the thumbnail's own "Add block" appender while this block
  // (or one of its children) is actively selected, so it doesn't clutter
  // the editor whenever some unrelated block elsewhere is selected.
  const showThumbnailAppender = isSelected || hasSelectedInnerBlock;
  const effectiveAttachmentId = attachmentId || latestVideoId;

  // Note: resolvedDuotoneClass is now computed internally by VideoThumbnailPreview
  // from the style attribute.

  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.BlockControls, {
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.ToolbarGroup, {
        label: (0,external_wp_i18n_.__)('Link To', 'video-embed-thumbnail-generator'),
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          icon: not_allowed/* default */.A,
          label: (0,external_wp_i18n_.__)('No Link', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            linkTo: 'none'
          }),
          isPressed: linkTo === 'none'
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          icon: fullscreen_default,
          label: (0,external_wp_i18n_.__)('Open in Pop-up Player', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            linkTo: 'lightbox'
          }),
          isPressed: linkTo === 'lightbox'
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          icon: post/* default */.A,
          label: (0,external_wp_i18n_.__)('Link to Parent Post', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            linkTo: 'parent'
          }),
          isPressed: linkTo === 'parent'
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          icon: video_default,
          label: (0,external_wp_i18n_.__)('Link to Video File', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            linkTo: 'file'
          }),
          isPressed: linkTo === 'file'
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          icon: page/* default */.A,
          label: (0,external_wp_i18n_.__)('Link to Attachment Page', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            linkTo: 'post'
          }),
          isPressed: linkTo === 'post'
        })]
      })
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      ...blockProps,
      className: (blockProps.className || '') + ' videopack-thumbnail-block',
      children: [(() => {
        if (isDiscovering && !attachmentId) {
          return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            className: "videopack-thumbnail-discovery-loading",
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Spinner, {}), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("p", {
              children: (0,external_wp_i18n_.__)('Searching for attached video…', 'video-embed-thumbnail-generator')
            })]
          });
        }
        if (!attachmentId && !vpContext.resolved.isPreview) {
          return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Placeholder, {
            icon: video_default,
            label: (0,external_wp_i18n_.__)('Video Thumbnail', 'video-embed-thumbnail-generator'),
            instructions: (0,external_wp_i18n_.__)('This block displays a video thumbnail. Place it inside a Videopack Collection or a post with attached videos.', 'video-embed-thumbnail-generator')
          });
        }
        return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(VideoThumbnailPreview, {
          postId: effectiveAttachmentId,
          video: vpContext.resolved.isPreview && !effectiveAttachmentId ? {
            poster_url: videopack_config.url + '/src/images/Adobestock_469037984_thumb1.jpg'
          } : {},
          linkTo: linkTo,
          context: context,
          attributes: attributes,
          className: "videopack-thumbnail-preview",
          resolvedDuotoneClass: undefined,
          clientId: clientId,
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.BlockContextProvider, {
            value: {
              ...context,
              'videopack/isInsideThumbnail': true,
              'videopack/attachmentId': attachmentId,
              'videopack/downloadlink': false,
              'videopack/embedcode': false
            },
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.InnerBlocks, {
              templateLock: false,
              renderAppender: showThumbnailAppender ? external_wp_blockEditor_.InnerBlocks.ButtonBlockAppender : false
            })
          })
        });
      })(), !attachmentId && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        style: {
          display: 'none'
        },
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.BlockContextProvider, {
          value: {
            ...context,
            'videopack/isInsideThumbnail': true,
            'videopack/downloadlink': false,
            'videopack/embedcode': false
          },
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.InnerBlocks, {
            templateLock: false,
            renderAppender: external_wp_blockEditor_.InnerBlocks.ButtonBlockAppender
          })
        })
      })]
    })]
  });
}
;// ./src/blocks/thumbnail/save.js


function save() {
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.InnerBlocks.Content, {});
}
;// ./src/blocks/thumbnail/block.json
const block_namespaceObject = /*#__PURE__*/JSON.parse('{"UU":"videopack/thumbnail"}');
// EXTERNAL MODULE: ./src/assets/icon.js
var icon = __webpack_require__(9427);
;// ./src/blocks/thumbnail/index.js





(0,external_wp_blocks_.registerBlockType)(block_namespaceObject.UU, {
  icon: icon/* videopackThumbnail */.Zp,
  edit: Edit,
  save: save
});

/***/ },

/***/ 517
(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {


// EXTERNAL MODULE: external ["wp","blocks"]
var external_wp_blocks_ = __webpack_require__(4997);
// EXTERNAL MODULE: external ["wp","blockEditor"]
var external_wp_blockEditor_ = __webpack_require__(4715);
// EXTERNAL MODULE: external ["wp","element"]
var external_wp_element_ = __webpack_require__(6087);
// EXTERNAL MODULE: external ["wp","components"]
var external_wp_components_ = __webpack_require__(6427);
// EXTERNAL MODULE: external ["wp","i18n"]
var external_wp_i18n_ = __webpack_require__(7723);
// EXTERNAL MODULE: external ["wp","primitives"]
var external_wp_primitives_ = __webpack_require__(5573);
// EXTERNAL MODULE: external "ReactJSXRuntime"
var external_ReactJSXRuntime_ = __webpack_require__(790);
;// ./node_modules/@wordpress/icons/build-module/library/title.mjs
// packages/icons/src/library/title.tsx


var title_default = /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.Path, { d: "m4 5.5h2v6.5h1.5v-6.5h2v-1.5h-5.5zm16 10.5h-16v-1.5h16zm-7 4h-9v-1.5h9z" }) });

//# sourceMappingURL=title.mjs.map

;// ./node_modules/@wordpress/icons/build-module/library/background.mjs
// packages/icons/src/library/background.tsx


var background_default = /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.Path, { fillRule: "evenodd", clipRule: "evenodd", d: "M11.53 4.47a.75.75 0 1 0-1.06 1.06l8 8a.75.75 0 1 0 1.06-1.06l-8-8Zm5 1a.75.75 0 1 0-1.06 1.06l2 2a.75.75 0 1 0 1.06-1.06l-2-2Zm-11.06 10a.75.75 0 0 1 1.06 0l2 2a.75.75 0 1 1-1.06 1.06l-2-2a.75.75 0 0 1 0-1.06Zm.06-5a.75.75 0 0 0-1.06 1.06l8 8a.75.75 0 1 0 1.06-1.06l-8-8Zm-.06-3a.75.75 0 0 1 1.06 0l10 10a.75.75 0 1 1-1.06 1.06l-10-10a.75.75 0 0 1 0-1.06Zm3.06-2a.75.75 0 0 0-1.06 1.06l10 10a.75.75 0 1 0 1.06-1.06l-10-10Z" }) });

//# sourceMappingURL=background.mjs.map

// EXTERNAL MODULE: ./src/components/CompactColorPicker/CompactColorPicker.js
var CompactColorPicker = __webpack_require__(6312);
// EXTERNAL MODULE: external ["wp","htmlEntities"]
var external_wp_htmlEntities_ = __webpack_require__(8537);
// EXTERNAL MODULE: ./src/hooks/useVideopackContext.js
var useVideopackContext = __webpack_require__(5633);
// EXTERNAL MODULE: ./src/hooks/useVideopackData.js
var useVideopackData = __webpack_require__(8516);
// EXTERNAL MODULE: ./src/components/VideopackContextBridge.js
var VideopackContextBridge = __webpack_require__(4773);
;// ./src/components/VideoTitle/VideoTitle.js
/* global videopack_config */









const TITLE_CONTEXT_OPTS = {
  excludeKeys: ['downloadlink'],
  classKeys: ['skin', 'title_color', 'title_background_color']
};

/**
 * An internal component to display the video title with correct styling and data.
 *
 * @param {Object}   root0                       Component props.
 * @param {Object}   root0.blockProps            Block props.
 * @param {number}   root0.postId                Post ID.
 * @param {string}   root0.title                 Manual title override.
 * @param {string}   root0.tagName               HTML tag name.
 * @param {string}   root0.textAlign             Text alignment.
 * @param {boolean}  root0.isOverlay             Whether it's an overlay.
 * @param {Element}  root0.children              Optional preview children (e.g. download block).
 * @param {boolean}  root0.overlay_title         Whether to show title in overlay.
 * @param {boolean}  root0.showBackground        Whether to show background bar.
 * @param {Function} root0.onTitleChange         Callback for title change.
 * @param {boolean}  root0.isInsideThumbnail     Whether it's inside a thumbnail.
 * @param {boolean}  root0.isInsidePlayerOverlay Whether it's inside a player overlay.
 * @param {string}   root0.position              Position (top/bottom).
 * @param {Object}   root0.attributes            Block attributes.
 * @param {Object}   root0.context               Block context.
 * @param {boolean}  root0.usePostTitle          Whether to use parent post title.
 * @param {boolean}  root0.linkToPost            Whether to link to parent post.
 * @return {Element}                             The rendered component.
 */
function VideoTitle({
  blockProps,
  postId: propPostId,
  title: manualTitle,
  tagName: Tag = 'h3',
  textAlign,
  isOverlay = false,
  overlay_title,
  showBackground,
  onTitleChange,
  isInsideThumbnail,
  isInsidePlayerOverlay,
  position: attrPosition,
  attributes = {},
  context = {},
  usePostTitle = false,
  linkToPost = false,
  children
}) {
  const vpContext = (0,useVideopackContext/* default */.Ay)(attributes, context, TITLE_CONTEXT_OPTS);
  const {
    postId: resolvedPostId,
    attachmentId: resolvedAttachmentId,
    prioritizePostData
  } = vpContext.resolved;
  const postId = prioritizePostData || usePostTitle ? resolvedPostId || propPostId : resolvedAttachmentId || resolvedPostId || propPostId;
  const titleKey = prioritizePostData || usePostTitle ? 'parentTitle' : 'title';
  const {
    data: resolvedTitle,
    isResolving
  } = (0,useVideopackData/* default */.A)(titleKey, context);
  const displayTitle = (0,external_wp_htmlEntities_.decodeEntities)(manualTitle || resolvedTitle || '');
  const isLoadingTitle = isResolving && !displayTitle && !vpContext.resolved.isPreview;
  const position = attrPosition || (isInsideThumbnail ? 'bottom' : vpContext.resolved.title_position) || 'top';
  let defaultAlign = 'left';
  if (isInsideThumbnail) {
    defaultAlign = 'center';
  }
  const finalTextAlign = textAlign || defaultAlign;
  const globalOptions = videopack_config?.options || {};
  let finalOverlayTitle = true;
  if (overlay_title !== undefined) {
    finalOverlayTitle = !!overlay_title;
  } else if (globalOptions.overlay_title !== undefined) {
    finalOverlayTitle = !!globalOptions.overlay_title;
  }
  let placeholder = (0,external_wp_i18n_.__)('Video Title', 'video-embed-thumbnail-generator');
  if (postId) {
    placeholder = resolvedTitle ? (0,external_wp_i18n_.__)('(Untitled Video)', 'video-embed-thumbnail-generator') : '';
  }
  let titleClass = 'videopack-video-title';
  if (isInsideThumbnail) {
    titleClass = 'videopack-thumbnail-title-text';
  } else if (isOverlay) {
    titleClass = 'videopack-title';
  }
  const iconsClass = 'videopack-meta-icons';
  const barClass = `videopack-video-title videopack-video-title-visible ${isOverlay ? 'is-overlay' : ''} ${!showBackground && isOverlay ? 'has-no-background' : ''} ${isInsideThumbnail ? 'videopack-thumbnail-title' : ''} ${isInsidePlayerOverlay || isOverlay ? `position-${position}` : ''}`.trim();
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
    ...blockProps,
    children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      className: `${barClass} has-text-align-${finalTextAlign}`,
      children: [isLoadingTitle ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Spinner, {}) : finalOverlayTitle && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.RichText, {
        tagName: Tag,
        className: `${titleClass} ${vpContext.classes} ${linkToPost ? 'is-link' : ''}`,
        style: vpContext.style,
        value: displayTitle,
        onChange: onTitleChange,
        placeholder: placeholder,
        allowedFormats: ['core/bold', 'core/italic', 'core/strikethrough']
        // Only the real Edit component passes onTitleChange (it wires up
        // setAttributes). Everywhere else this renders — Loop's templated
        // preview items, the settings-page preview, the classic-editor
        // preview — has nowhere to persist an edit, so RichText must not
        // accept one; an editable field that silently discards changes
        // just looks broken to a user.
        ,
        readOnly: !onTitleChange
      }), !isLoadingTitle && isOverlay && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: iconsClass,
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(VideopackContextBridge/* default */.A, {
          attributes: attributes,
          context: context,
          overrides: {
            'videopack/isInsideTitleMeta': true,
            ...(context['videopack/source_groups'] && Object.keys(context['videopack/source_groups']).length > 0 ? {
              'videopack/source_groups': context['videopack/source_groups']
            } : {}),
            ...(context['videopack/sources']?.length > 0 ? {
              'videopack/sources': context['videopack/sources']
            } : {})
          },
          children: children || /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.InnerBlocks, {
            allowedBlocks: ['videopack/download', 'videopack/share'],
            template: [],
            templateLock: false
          })
        })
      })]
    })
  });
}
// EXTERNAL MODULE: ./src/utils/colors.js
var colors = __webpack_require__(7068);
;// ./src/blocks/title/edit.js
/* global videopack_config */











// Title is a valid theme-context root (Overlays.scss) and owns its own
// title/background colors — see the $badge-selectors comment in
// VideoDuration.js for why Duration/View-count also need these two.

const edit_TITLE_CONTEXT_OPTS = {
  excludeKeys: ['downloadlink'],
  classKeys: ['skin', 'title_color', 'title_background_color']
};

/**
 * Edit component for the Videopack Video Title block.
 *
 * @param {Object}   root0               Component props.
 * @param {string}   root0.clientId      Block client ID.
 * @param {Object}   root0.attributes    Block attributes.
 * @param {Function} root0.setAttributes Attribute setter.
 * @param {Object}   root0.context       Block context.
 * @return {Element}                     The rendered component.
 */
function Edit({
  clientId,
  attributes,
  setAttributes,
  context
}) {
  const vpContext = (0,useVideopackContext/* default */.Ay)(attributes, context, edit_TITLE_CONTEXT_OPTS);
  const {
    postId,
    postType
  } = vpContext.resolved;
  const embedlink = context['videopack/embedlink'];
  const {
    title,
    tagName: Tag = 'h3',
    position: attrPosition,
    isOverlay: explicitIsOverlay,
    textAlign: attrTextAlign,
    title_color,
    title_background_color,
    overlay_title,
    showBackground,
    usePostTitle,
    linkToPost
  } = attributes;
  const isInsideThumbnail = !!context['videopack/isInsideThumbnail'];
  const isInsidePlayerOverlay = !!context['videopack/isInsidePlayerOverlay'];
  const isInsidePlayerContainer = !!context['videopack/isInsidePlayerContainer'];

  // Derived defaults that don't fight with user saved attributes
  const position = attrPosition || (isInsideThumbnail ? 'bottom' : 'top');
  const textAlign = attrTextAlign || (isInsideThumbnail ? 'center' : 'left');
  const globalOptions = videopack_config?.options || {};
  const finalOverlayTitle = (0,external_wp_element_.useMemo)(() => {
    if (overlay_title !== undefined) {
      return !!overlay_title;
    }
    return globalOptions.overlay_title !== undefined ? !!globalOptions.overlay_title : true;
  }, [overlay_title, globalOptions.overlay_title]);
  const finalShowBackground = (0,external_wp_element_.useMemo)(() => {
    if (showBackground !== undefined) {
      return !!showBackground;
    }
    return globalOptions.showBackground !== undefined ? !!globalOptions.showBackground : true;
  }, [showBackground, globalOptions.showBackground]);
  const isOverlay = explicitIsOverlay !== undefined ? explicitIsOverlay : isInsideThumbnail || isInsidePlayerOverlay;
  const wrapperClass = 'videopack-video-title-wrapper';
  const THEME_COLORS = videopack_config?.themeColors;
  const colorFallbacks = (0,external_wp_element_.useMemo)(() => (0,colors/* getColorFallbacks */.l)({
    title_color: vpContext.resolved.title_color,
    title_background_color: vpContext.resolved.title_background_color
  }), [vpContext.resolved.title_color, vpContext.resolved.title_background_color]);
  const blockProps = (0,external_wp_blockEditor_.useBlockProps)({
    className: `videopack-video-title-block ${wrapperClass} ${vpContext.classes} ${isOverlay ? `is-overlay position-${position}` : ''} ${isInsideThumbnail ? 'is-inside-thumbnail' : ''} ${isInsidePlayerOverlay ? 'is-inside-player' : ''} ${!postId && !title ? 'no-title' : ''} has-text-align-${textAlign}`,
    style: vpContext.style
  });
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_blockEditor_.BlockControls, {
      group: "block",
      children: [!isInsideThumbnail && !isInsidePlayerOverlay && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.HeadingLevelDropdown, {
        value: Tag.replace('h', '') * 1,
        onChange: newLevel => setAttributes({
          tagName: `h${newLevel}`
        })
      }), isOverlay && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.BlockVerticalAlignmentControl, {
        value: position,
        onChange: nextPosition => {
          setAttributes({
            position: nextPosition || undefined
          });
        }
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.AlignmentControl, {
        value: textAlign,
        onChange: nextAlign => {
          setAttributes({
            textAlign: nextAlign
          });
        }
      }), (isInsidePlayerOverlay || isInsidePlayerContainer) && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.ToolbarGroup, {
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          icon: title_default,
          label: finalOverlayTitle ? (0,external_wp_i18n_.__)('Hide Title', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_.__)('Show Title', 'video-embed-thumbnail-generator'),
          isPressed: finalOverlayTitle,
          onClick: () => setAttributes({
            overlay_title: !finalOverlayTitle
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          icon: background_default,
          label: finalShowBackground ? (0,external_wp_i18n_.__)('Hide Background Bar', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_.__)('Show Background Bar', 'video-embed-thumbnail-generator'),
          isPressed: finalShowBackground,
          onClick: () => setAttributes({
            showBackground: !finalShowBackground
          })
        })]
      })]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_blockEditor_.InspectorControls, {
      children: [!vpContext.resolved.isStandalone && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
        title: (0,external_wp_i18n_.__)('Data Settings', 'video-embed-thumbnail-generator'),
        initialOpen: true,
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
          label: (0,external_wp_i18n_.__)('Use Post Title', 'video-embed-thumbnail-generator'),
          help: (0,external_wp_i18n_.__)('When enabled, this block will display the title of the parent post instead of the video title.', 'video-embed-thumbnail-generator'),
          checked: usePostTitle,
          onChange: value => setAttributes({
            usePostTitle: value
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
          label: (0,external_wp_i18n_.__)('Make title a link', 'video-embed-thumbnail-generator'),
          help: (0,external_wp_i18n_.__)('When enabled, the title will link to the parent post.', 'video-embed-thumbnail-generator'),
          checked: linkToPost,
          onChange: value => setAttributes({
            linkToPost: value
          })
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelBody, {
        title: (0,external_wp_i18n_.__)('Colors', 'video-embed-thumbnail-generator'),
        initialOpen: true,
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "videopack-color-section",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("p", {
            className: "videopack-settings-section-title",
            children: (0,external_wp_i18n_.__)('Title Bar', 'video-embed-thumbnail-generator')
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            className: "videopack-color-flex-row",
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker/* default */.A, {
                label: (0,external_wp_i18n_.__)('Text', 'video-embed-thumbnail-generator'),
                value: title_color,
                onChange: value => setAttributes({
                  title_color: value
                }),
                colors: THEME_COLORS,
                fallbackValue: colorFallbacks.title_color
              })
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker/* default */.A, {
                label: (0,external_wp_i18n_.__)('Background', 'video-embed-thumbnail-generator'),
                value: title_background_color,
                onChange: value => setAttributes({
                  title_background_color: value
                }),
                colors: THEME_COLORS,
                fallbackValue: colorFallbacks.title_background_color
              })
            })]
          })]
        })
      })]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(VideoTitle, {
      blockProps: blockProps,
      attributes: attributes,
      postId: postId,
      postType: postType,
      clientId: clientId,
      isInsideThumbnail: isInsideThumbnail,
      isInsidePlayerOverlay: isInsidePlayerOverlay,
      isOverlay: isOverlay,
      context: context,
      embedlink: embedlink,
      onTitleChange: newTitle => setAttributes({
        title: newTitle
      }),
      usePostTitle: usePostTitle,
      linkToPost: linkToPost,
      overlay_title: finalOverlayTitle
    })]
  });
}
;// ./src/blocks/title/block.json
const block_namespaceObject = /*#__PURE__*/JSON.parse('{"UU":"videopack/title"}');
// EXTERNAL MODULE: ./src/assets/icon.js
var icon = __webpack_require__(9427);
;// ./src/blocks/title/index.js






(0,external_wp_blocks_.registerBlockType)(block_namespaceObject.UU, {
  icon: icon/* videopackTitle */.vT,
  edit: Edit,
  save: () => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.InnerBlocks.Content, {}) // Dynamic block with inner blocks
});

/***/ },

/***/ 2373
(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {


// EXTERNAL MODULE: external ["wp","blocks"]
var external_wp_blocks_ = __webpack_require__(4997);
// EXTERNAL MODULE: external ["wp","element"]
var external_wp_element_ = __webpack_require__(6087);
// EXTERNAL MODULE: external ["wp","blockEditor"]
var external_wp_blockEditor_ = __webpack_require__(4715);
// EXTERNAL MODULE: external ["wp","components"]
var external_wp_components_ = __webpack_require__(6427);
// EXTERNAL MODULE: ./node_modules/@wordpress/icons/build-module/library/not-allowed.mjs
var not_allowed = __webpack_require__(6039);
// EXTERNAL MODULE: external ["wp","primitives"]
var external_wp_primitives_ = __webpack_require__(5573);
// EXTERNAL MODULE: external "ReactJSXRuntime"
var external_ReactJSXRuntime_ = __webpack_require__(790);
;// ./node_modules/@wordpress/icons/build-module/library/seen.mjs
// packages/icons/src/library/seen.tsx


var seen_default = /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.Path, { d: "M3.99961 13C4.67043 13.3354 4.6703 13.3357 4.67017 13.3359L4.67298 13.3305C4.67621 13.3242 4.68184 13.3135 4.68988 13.2985C4.70595 13.2686 4.7316 13.2218 4.76695 13.1608C4.8377 13.0385 4.94692 12.8592 5.09541 12.6419C5.39312 12.2062 5.84436 11.624 6.45435 11.0431C7.67308 9.88241 9.49719 8.75 11.9996 8.75C14.502 8.75 16.3261 9.88241 17.5449 11.0431C18.1549 11.624 18.6061 12.2062 18.9038 12.6419C19.0523 12.8592 19.1615 13.0385 19.2323 13.1608C19.2676 13.2218 19.2933 13.2686 19.3093 13.2985C19.3174 13.3135 19.323 13.3242 19.3262 13.3305L19.3291 13.3359C19.3289 13.3357 19.3288 13.3354 19.9996 13C20.6704 12.6646 20.6703 12.6643 20.6701 12.664L20.6697 12.6632L20.6688 12.6614L20.6662 12.6563L20.6583 12.6408C20.6517 12.6282 20.6427 12.6108 20.631 12.5892C20.6078 12.5459 20.5744 12.4852 20.5306 12.4096C20.4432 12.2584 20.3141 12.0471 20.1423 11.7956C19.7994 11.2938 19.2819 10.626 18.5794 9.9569C17.1731 8.61759 14.9972 7.25 11.9996 7.25C9.00203 7.25 6.82614 8.61759 5.41987 9.9569C4.71736 10.626 4.19984 11.2938 3.85694 11.7956C3.68511 12.0471 3.55605 12.2584 3.4686 12.4096C3.42484 12.4852 3.39142 12.5459 3.36818 12.5892C3.35656 12.6108 3.34748 12.6282 3.34092 12.6408L3.33297 12.6563L3.33041 12.6614L3.32948 12.6632L3.32911 12.664C3.32894 12.6643 3.32879 12.6646 3.99961 13ZM11.9996 16C13.9326 16 15.4996 14.433 15.4996 12.5C15.4996 10.567 13.9326 9 11.9996 9C10.0666 9 8.49961 10.567 8.49961 12.5C8.49961 14.433 10.0666 16 11.9996 16Z" }) });

//# sourceMappingURL=seen.mjs.map

// EXTERNAL MODULE: ./node_modules/@wordpress/icons/build-module/library/media-and-text.mjs
var media_and_text = __webpack_require__(7133);
// EXTERNAL MODULE: external ["wp","i18n"]
var external_wp_i18n_ = __webpack_require__(7723);
// EXTERNAL MODULE: ./src/assets/icon.js
var icon = __webpack_require__(9427);
// EXTERNAL MODULE: ./src/components/CompactColorPicker/CompactColorPicker.js
var CompactColorPicker = __webpack_require__(6312);
// EXTERNAL MODULE: ./src/hooks/useVideopackContext.js
var useVideopackContext = __webpack_require__(5633);
// EXTERNAL MODULE: ./src/hooks/useVideopackData.js
var useVideopackData = __webpack_require__(8516);
;// ./src/components/ViewCount/ViewCount.js







const CLASS_KEYS = ['title_color', 'title_background_color'];

/**
 * A internal component to display the view count with correct styling and data.
 *
 * @param {Object}  root0            Component props.
 * @param {Object}  root0.blockProps Block props.
 * @param {string}  root0.iconType   Type of icon to display.
 * @param {boolean} root0.showText   Whether to show the "views" text.
 * @param {number}  root0.count      Manual count override.
 * @param {Object}  root0.attributes Block attributes.
 * @param {Object}  root0.context    Block context.
 * @return {Element}                 The rendered component.
 */
function ViewCount({
  blockProps,
  iconType = 'none',
  showText = true,
  count,
  attributes = {},
  context = {}
}) {
  const vpContext = (0,useVideopackContext/* default */.Ay)(attributes, context, {
    classKeys: CLASS_KEYS
  });
  const {
    data: views,
    isResolving
  } = (0,useVideopackData/* default */.A)('views', context);
  const attachmentId = vpContext.resolved.attachmentId;
  if (vpContext.resolved.isDiscovering && !attachmentId) {
    return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
      ...blockProps,
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Spinner, {})
    });
  }
  if (!attachmentId && count === undefined && !vpContext.resolved.isPreview) {
    return null;
  }
  if (isResolving) {
    return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
      ...blockProps,
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Spinner, {})
    });
  }
  let safeViews = 0;
  if (count !== undefined) {
    safeViews = Number(count);
  } else if (views !== undefined && views !== null) {
    safeViews = Number(views);
  }
  const displayValue = showText ? (0,external_wp_i18n_.sprintf)(/* translators: %s is the formatted number of views */
  (0,external_wp_i18n_._n)('%s view', '%s views', safeViews, 'video-embed-thumbnail-generator'), safeViews.toLocaleString()) : safeViews.toLocaleString();
  const renderIcon = () => {
    switch (iconType) {
      case 'eye':
        return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Icon, {
          icon: seen_default,
          className: "videopack-icon-left-margin"
        });
      case 'play':
        return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Icon, {
          icon: icon/* play */.ZH,
          size: 16,
          className: "videopack-icon-left-margin"
        });
      case 'playOutline':
        return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Icon, {
          icon: icon/* playOutline */.zs,
          size: 16,
          className: "videopack-icon-left-margin"
        });
      default:
        return null;
    }
  };
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
    ...blockProps,
    children: [renderIcon(), displayValue]
  });
}
// EXTERNAL MODULE: ./src/utils/colors.js
var colors = __webpack_require__(7068);
;// ./src/blocks/view-count/edit.js
/* global videopack_config */











// View-count shares "badge" title/background colors with Title/Duration —
// see the $badge-selectors comment in VideoDuration.js.

const edit_CLASS_KEYS = ['title_color', 'title_background_color'];

/**
 * Edit component for the Videopack View Count block.
 *
 * @param {Object}   root0               Component props.
 * @param {Object}   root0.attributes    Block attributes.
 * @param {Function} root0.setAttributes Attribute setter.
 * @param {Object}   root0.context       Block context.
 * @return {Element}                     The rendered component.
 */
function Edit({
  attributes,
  setAttributes,
  context
}) {
  const vpContext = (0,useVideopackContext/* default */.Ay)(attributes, context, {
    classKeys: edit_CLASS_KEYS
  });
  const {
    iconType,
    showText,
    textAlign,
    title_color,
    title_background_color
  } = attributes;
  const isInsideThumbnail = !!context['videopack/isInsideThumbnail'];
  const isInsidePlayerOverlay = !!context['videopack/isInsidePlayerOverlay'];
  const isInsidePlayerContainer = !!context['videopack/isInsidePlayerContainer'];
  const isOverlay = isInsideThumbnail || isInsidePlayerOverlay;
  const colorFallbacks = (0,external_wp_element_.useMemo)(() => (0,colors/* getColorFallbacks */.l)({
    title_color: vpContext.resolved.title_color,
    title_background_color: vpContext.resolved.title_background_color
  }), [vpContext.resolved.title_color, vpContext.resolved.title_background_color]);
  const defaultAlign = (0,external_wp_element_.useMemo)(() => {
    if (isInsideThumbnail) {
      return 'right';
    }
    return isInsidePlayerOverlay || isInsidePlayerContainer ? 'right' : 'left';
  }, [isInsideThumbnail, isInsidePlayerOverlay, isInsidePlayerContainer]);
  const finalTextAlign = textAlign || context['videopack/textAlign'] || defaultAlign;
  const position = attributes.position || context['videopack/position'] || 'top';
  const blockProps = (0,external_wp_blockEditor_.useBlockProps)({
    className: `videopack-view-count videopack-view-count-block ${vpContext.classes} ${isOverlay ? 'is-overlay is-badge' : ''} ${isInsideThumbnail ? 'is-inside-thumbnail' : ''} ${isInsidePlayerOverlay ? 'is-inside-player' : ''} ${!vpContext.resolved.attachmentId ? 'no-title' : ''} position-${position} has-text-align-${finalTextAlign}`,
    style: vpContext.style
  });
  const THEME_COLORS = videopack_config?.themeColors;
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_blockEditor_.BlockControls, {
      children: [isOverlay && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.BlockVerticalAlignmentControl, {
        value: position,
        onChange: nextPosition => {
          setAttributes({
            position: nextPosition || undefined
          });
        }
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.AlignmentControl, {
        value: finalTextAlign,
        onChange: nextAlign => {
          setAttributes({
            textAlign: nextAlign
          });
        }
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.ToolbarGroup, {
        label: (0,external_wp_i18n_.__)('Icon Type', 'video-embed-thumbnail-generator'),
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          icon: not_allowed/* default */.A,
          label: (0,external_wp_i18n_.__)('No Icon', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            iconType: 'none'
          }),
          isPressed: iconType === 'none'
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          icon: seen_default,
          label: (0,external_wp_i18n_.__)('Eye Icon', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            iconType: 'eye'
          }),
          isPressed: iconType === 'eye'
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          icon: icon/* play */.ZH,
          label: (0,external_wp_i18n_.__)('Play Icon (Filled)', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            iconType: 'play'
          }),
          isPressed: iconType === 'play'
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          icon: icon/* playOutline */.zs,
          label: (0,external_wp_i18n_.__)('Play Icon (Outline)', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            iconType: 'playOutline'
          }),
          isPressed: iconType === 'playOutline'
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarGroup, {
        label: (0,external_wp_i18n_.__)('Display Options', 'video-embed-thumbnail-generator'),
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          icon: media_and_text/* default */.A,
          label: showText ? (0,external_wp_i18n_.__)('Hide "views" text', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_.__)('Show "views" text', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            showText: !showText
          }),
          isPressed: showText
        })
      })]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.InspectorControls, {
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelBody, {
        title: (0,external_wp_i18n_.__)('Colors', 'video-embed-thumbnail-generator'),
        initialOpen: true,
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "videopack-color-section",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("p", {
            className: "videopack-settings-section-title",
            children: (0,external_wp_i18n_.__)('Colors', 'video-embed-thumbnail-generator')
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            className: "videopack-color-flex-row",
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker/* default */.A, {
                label: (0,external_wp_i18n_.__)('Text', 'video-embed-thumbnail-generator'),
                value: title_color,
                onChange: value => setAttributes({
                  title_color: value
                }),
                colors: THEME_COLORS,
                fallbackValue: colorFallbacks.title_color
              })
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker/* default */.A, {
                label: (0,external_wp_i18n_.__)('Background', 'video-embed-thumbnail-generator'),
                value: title_background_color,
                onChange: value => setAttributes({
                  title_background_color: value
                }),
                colors: THEME_COLORS,
                fallbackValue: colorFallbacks.title_background_color
              })
            })]
          })]
        })
      })
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(ViewCount, {
      blockProps: blockProps,
      iconType: iconType,
      showText: showText,
      context: context,
      attributes: attributes
    })]
  });
}
;// ./src/blocks/view-count/save.js
function save() {
  return null;
}
;// ./src/blocks/view-count/block.json
const block_namespaceObject = /*#__PURE__*/JSON.parse('{"UU":"videopack/view-count"}');
;// ./src/blocks/view-count/index.js





(0,external_wp_blocks_.registerBlockType)(block_namespaceObject.UU, {
  icon: icon/* videopackViewCount */.v0,
  edit: Edit,
  save: save
});

/***/ },

/***/ 7405
(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {


// EXTERNAL MODULE: external ["wp","blocks"]
var external_wp_blocks_ = __webpack_require__(4997);
// EXTERNAL MODULE: external ["wp","i18n"]
var external_wp_i18n_ = __webpack_require__(7723);
// EXTERNAL MODULE: external ["wp","blockEditor"]
var external_wp_blockEditor_ = __webpack_require__(4715);
// EXTERNAL MODULE: external ["wp","components"]
var external_wp_components_ = __webpack_require__(6427);
// EXTERNAL MODULE: external ["wp","element"]
var external_wp_element_ = __webpack_require__(6087);
// EXTERNAL MODULE: ./src/components/WatermarkPositioner/WatermarkPositioner.js
var WatermarkPositioner = __webpack_require__(9486);
// EXTERNAL MODULE: external ["wp","primitives"]
var external_wp_primitives_ = __webpack_require__(5573);
// EXTERNAL MODULE: external "ReactJSXRuntime"
var external_ReactJSXRuntime_ = __webpack_require__(790);
;// ./node_modules/@wordpress/icons/build-module/library/image.mjs
// packages/icons/src/library/image.tsx


var image_default = /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.Path, { d: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 4.5h14c.3 0 .5.2.5.5v8.4l-3-2.9c-.3-.3-.8-.3-1 0L11.9 14 9 12c-.3-.2-.6-.2-.8 0l-3.6 2.6V5c-.1-.3.1-.5.4-.5zm14 15H5c-.3 0-.5-.2-.5-.5v-2.4l4.1-3 3 1.9c.3.2.7.2.9-.1L16 12l3.5 3.4V19c0 .3-.2.5-.5.5z" }) });

//# sourceMappingURL=image.mjs.map

// EXTERNAL MODULE: ./node_modules/@wordpress/icons/build-module/library/not-allowed.mjs
var not_allowed = __webpack_require__(6039);
;// ./node_modules/@wordpress/icons/build-module/library/home.mjs
// packages/icons/src/library/home.tsx


var home_default = /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.Path, { d: "M12 4L4 7.9V20h16V7.9L12 4zm6.5 14.5H14V13h-4v5.5H5.5V8.8L12 5.7l6.5 3.1v9.7z" }) });

//# sourceMappingURL=home.mjs.map

// EXTERNAL MODULE: ./node_modules/@wordpress/icons/build-module/library/post.mjs
var post = __webpack_require__(227);
;// ./node_modules/@wordpress/icons/build-module/library/download.mjs
// packages/icons/src/library/download.tsx


var download_default = /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.Path, { d: "M18 11.3l-1-1.1-4 4V3h-1.5v11.3L7 10.2l-1 1.1 6.2 5.8 5.8-5.8zm.5 3.7v3.5h-13V15H4v5h16v-5h-1.5z" }) });

//# sourceMappingURL=download.mjs.map

// EXTERNAL MODULE: ./node_modules/@wordpress/icons/build-module/library/page.mjs
var page = __webpack_require__(7884);
;// ./node_modules/@wordpress/icons/build-module/library/link.mjs
// packages/icons/src/library/link.tsx


var link_default = /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.Path, { d: "M10 17.389H8.444A5.194 5.194 0 1 1 8.444 7H10v1.5H8.444a3.694 3.694 0 0 0 0 7.389H10v1.5ZM14 7h1.556a5.194 5.194 0 0 1 0 10.39H14v-1.5h1.556a3.694 3.694 0 0 0 0-7.39H14V7Zm-4.5 6h5v-1.5h-5V13Z" }) });

//# sourceMappingURL=link.mjs.map

// EXTERNAL MODULE: ./src/hooks/useVideopackContext.js
var useVideopackContext = __webpack_require__(5633);
;// ./src/components/VideoWatermark/VideoWatermark.js



/**
 * Internal component to display the watermark with correct positioning and fallback.
 *
 * @param {Object}   root0               Component props.
 * @param {Object}   root0.attributes    Block attributes.
 * @param {Object}   root0.context       Block context.
 * @param {boolean}  root0.isBlockEditor Whether we are in the block editor.
 * @param {Function} root0.onDimensions  Callback for dimension detection.
 * @return {Element}                     The rendered component.
 */

function VideoWatermark({
  attributes = {},
  context = {},
  isBlockEditor = false,
  onDimensions = null
}) {
  const {
    resolved
  } = (0,useVideopackContext/* default */.Ay)(attributes, context);
  const {
    watermark: effectiveUrl,
    watermark_styles: styles = {},
    watermark_scale: attrScale,
    watermark_align: attrAlign,
    watermark_valign: attrValign,
    watermark_x: attrX,
    watermark_y: attrY,
    skin
  } = resolved;
  const actualScale = attrScale ?? styles.scale ?? styles.watermark_scale ?? 10;
  const actualAlign = attrAlign ?? styles.align ?? styles.watermark_align ?? 'right';
  const actualValign = attrValign ?? styles.valign ?? styles.watermark_valign ?? 'bottom';
  const actualX = attrX ?? styles.x ?? styles.watermark_x ?? 5;
  const actualY = attrY ?? styles.y ?? styles.watermark_y ?? 7;
  const style = {
    position: isBlockEditor ? 'relative' : 'absolute',
    width: effectiveUrl ? `${actualScale}%` : '260px',
    height: 'auto',
    pointerEvents: 'auto',
    transform: ''
  };

  // X Positioning
  if (actualAlign === 'center') {
    style.left = '50%';
    style.transform += 'translateX(-50%) ';
    style.marginLeft = `${-actualX}%`;
  } else {
    style[actualAlign] = `${actualX}%`;
  }

  // Y Positioning
  if (actualValign === 'center') {
    style.top = '50%';
    style.transform += 'translateY(-50%) ';
    style.marginTop = `${-actualY}%`;
  } else {
    style[actualValign] = `${actualY}%`;
  }
  if (!style.transform || isBlockEditor) {
    delete style.transform;
  }
  if (isBlockEditor) {
    delete style.left;
    delete style.right;
    delete style.top;
    delete style.bottom;
    delete style.marginLeft;
    delete style.marginTop;
    style.width = '100%'; // Inner container fills the outer block
  }
  if (!effectiveUrl) {
    return null;
  }
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
    className: `videopack-video-watermark ${skin}`,
    style: style,
    children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("img", {
      src: effectiveUrl,
      alt: (0,external_wp_i18n_.__)('Watermark', 'video-embed-thumbnail-generator'),
      style: {
        display: 'block',
        width: '100%',
        height: 'auto'
      },
      onLoad: e => {
        if (onDimensions && e.target.naturalWidth && e.target.naturalHeight) {
          const ratio = e.target.naturalWidth / e.target.naturalHeight;
          onDimensions(ratio);
        }
      }
    })
  });
}
;// ./src/blocks/watermark/edit.js
/* global ResizeObserver */











/**
 * Helper to calculate watermark positioning styles for the block wrapper.
 *
 * @param {Object} resolved Resolved context attributes.
 * @return {Object} Style object for the block wrapper.
 */

function getWatermarkBlockStyles(resolved) {
  const {
    watermark: effectiveUrl,
    watermark_scale: effectiveScale = 10,
    watermark_align: effectiveAlign = 'right',
    watermark_valign: effectiveValign = 'bottom',
    watermark_x: effectiveX = 5,
    watermark_y: effectiveY = 7
  } = resolved;
  if (!effectiveUrl) {
    return {};
  }
  const style = {
    position: 'absolute',
    width: `${effectiveScale}%`,
    minWidth: '20px',
    // Prevent total collapse
    minHeight: '20px',
    height: 'auto',
    transform: ''
  };
  if (effectiveAlign === 'center') {
    style.left = '50%';
    style.transform += 'translateX(-50%) ';
    style.marginLeft = `${-effectiveX}%`;
  } else {
    style[effectiveAlign] = `${effectiveX}%`;
  }
  if (effectiveValign === 'center') {
    style.top = '50%';
    style.transform += 'translateY(-50%) ';
    style.marginTop = `${-effectiveY}%`;
  } else {
    style[effectiveValign] = `${effectiveY}%`;
  }
  if (!style.transform) {
    delete style.transform;
  }
  return style;
}

/**
 * Watermark Edit Component.
 *
 * @param {Object}   root0               Component props.
 * @param {Object}   root0.attributes    Block attributes.
 * @param {Function} root0.setAttributes Attribute setter.
 * @param {Object}   root0.context       Block context.
 * @param {boolean}  root0.isSelected    Whether the block is selected.
 * @return {Element} Watermark edit component.
 */
function Edit({
  attributes,
  setAttributes,
  context,
  isSelected
}) {
  const containerRef = (0,external_wp_element_.useRef)(null);
  const [containerDimensions, setContainerDimensions] = (0,external_wp_element_.useState)(null);
  const [detectedAspectRatio, setDetectedAspectRatio] = (0,external_wp_element_.useState)(null);

  // Measure the parent container dimensions for accurate positioning.
  (0,external_wp_element_.useEffect)(() => {
    if (!containerRef.current) {
      return;
    }
    const updateDimensions = () => {
      if (!containerRef.current) {
        return;
      }
      const element = containerRef.current;

      // Find the most specific media container to ensure accurate pixel calculations
      const container = element.closest('.videopack-player, .videopack-video-thumbnail-preview, .videopack-wrapper, .videopack-video-block-container, .wp-block-videopack-player-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setContainerDimensions({
            width: rect.width,
            height: rect.height
          });
        }
      }
    };
    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    const container = containerRef.current.closest('.videopack-player, .videopack-video-thumbnail-preview, .videopack-wrapper, .videopack-video-block-container, .wp-block-videopack-player-container');
    if (container) {
      observer.observe(container);
    }
    return () => observer.disconnect();
  }, []);

  // Use unified context hook for all design and behavior resolution
  const {
    resolved
  } = (0,useVideopackContext/* default */.Ay)(attributes, context);
  const {
    watermark: effectiveUrl,
    watermark_scale: effectiveScale = 10,
    watermark_align: effectiveAlign = 'right',
    watermark_valign: effectiveValign = 'bottom',
    watermark_x: effectiveX = 5,
    watermark_y: effectiveY = 7,
    watermark_link_to: effectiveLinkToType = 'false',
    watermark_url: effectiveCustomLinkUrl = ''
  } = resolved;
  const isInsideThumbnail = !!context['videopack/isInsideThumbnail'];
  const isInsidePlayerOverlay = !!context['videopack/isInsidePlayerOverlay'];
  const isOverlay = isInsideThumbnail || isInsidePlayerOverlay;
  const overlayStyles = isOverlay || resolved.isPreview ? getWatermarkBlockStyles(resolved) : {};

  // Implementation of Full-Frame Selection mode:
  // When selected, the block expands to fill the entire container to allow dragging everywhere.
  const activeOverlayStyles = isOverlay && isSelected ? {
    ...overlayStyles,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    maxWidth: 'none',
    marginLeft: 0,
    marginTop: 0,
    transform: 'none'
  } : overlayStyles;
  const blockProps = (0,external_wp_blockEditor_.useBlockProps)({
    className: `videopack-video-watermark-block ${isOverlay ? 'is-overlay' : ''} ${isSelected ? 'is-selected' : ''}`,
    style: activeOverlayStyles
  });
  if (!effectiveUrl) {
    return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
      ...blockProps,
      className: "videopack-video-watermark-placeholder",
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.MediaPlaceholder, {
        icon: image_default,
        label: (0,external_wp_i18n_.__)('Watermark Image', 'video-embed-thumbnail-generator'),
        onSelect: media => setAttributes({
          watermark: media.url
        }),
        accept: "image/*",
        allowedTypes: ['image']
      })
    });
  }
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
    ...blockProps,
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_blockEditor_.BlockControls, {
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.MediaReplaceFlow, {
        mediaURL: effectiveUrl,
        allowedTypes: ['image'],
        accept: "image/*",
        onSelect: media => setAttributes({
          watermark: media.url
        }),
        name: (0,external_wp_i18n_.__)('Replace Watermark', 'video-embed-thumbnail-generator')
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.ToolbarGroup, {
        label: (0,external_wp_i18n_.__)('Link To', 'video-embed-thumbnail-generator'),
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          icon: not_allowed/* default */.A,
          label: (0,external_wp_i18n_.__)('No Link', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            watermark_link_to: 'false'
          }),
          isPressed: effectiveLinkToType === 'false'
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          icon: home_default,
          label: (0,external_wp_i18n_.__)('Link to Home Page', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            watermark_link_to: 'home'
          }),
          isPressed: effectiveLinkToType === 'home'
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          icon: post/* default */.A,
          label: (0,external_wp_i18n_.__)('Link to Parent Post', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            watermark_link_to: 'parent'
          }),
          isPressed: effectiveLinkToType === 'parent'
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          icon: download_default,
          label: (0,external_wp_i18n_.__)('Download Video', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            watermark_link_to: 'download'
          }),
          isPressed: effectiveLinkToType === 'download'
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
          icon: page/* default */.A,
          label: (0,external_wp_i18n_.__)('Link to Attachment Page', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            watermark_link_to: 'attachment'
          }),
          isPressed: effectiveLinkToType === 'attachment'
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Dropdown, {
          popoverProps: {
            position: 'bottom center',
            className: 'videopack-url-popover'
          },
          renderToggle: ({
            isOpen,
            onToggle
          }) => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToolbarButton, {
            icon: link_default,
            label: (0,external_wp_i18n_.__)('Link to Custom URL', 'video-embed-thumbnail-generator'),
            onClick: () => {
              setAttributes({
                watermark_link_to: 'custom'
              });
              onToggle();
            },
            "aria-expanded": isOpen,
            isPressed: effectiveLinkToType === 'custom'
          }),
          renderContent: () => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            style: {
              padding: '12px',
              minWidth: '260px'
            },
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.TextControl, {
              __nextHasNoMarginBottom: true,
              __next40pxDefaultSize: true,
              label: (0,external_wp_i18n_.__)('Custom URL', 'video-embed-thumbnail-generator'),
              value: effectiveCustomLinkUrl,
              placeholder: "https://...",
              onChange: value => setAttributes({
                watermark_url: value
              })
            })
          })
        })]
      })]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.InspectorControls, {
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
        title: (0,external_wp_i18n_.__)('Watermark Settings', 'video-embed-thumbnail-generator'),
        initialOpen: true,
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.RangeControl, {
          label: (0,external_wp_i18n_.__)('Scale (%)', 'video-embed-thumbnail-generator'),
          value: effectiveScale,
          onChange: value => setAttributes({
            watermark_scale: value
          }),
          min: 1,
          max: 100
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          style: {
            display: 'flex',
            gap: '10px'
          },
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
            label: (0,external_wp_i18n_.__)('Horizontal Align', 'video-embed-thumbnail-generator'),
            value: effectiveAlign,
            options: [{
              label: (0,external_wp_i18n_.__)('Left', 'video-embed-thumbnail-generator'),
              value: 'left'
            }, {
              label: (0,external_wp_i18n_.__)('Center', 'video-embed-thumbnail-generator'),
              value: 'center'
            }, {
              label: (0,external_wp_i18n_.__)('Right', 'video-embed-thumbnail-generator'),
              value: 'right'
            }],
            onChange: value => setAttributes({
              watermark_align: value
            }),
            style: {
              flex: 1
            }
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
            label: (0,external_wp_i18n_.__)('Vertical Align', 'video-embed-thumbnail-generator'),
            value: effectiveValign,
            options: [{
              label: (0,external_wp_i18n_.__)('Top', 'video-embed-thumbnail-generator'),
              value: 'top'
            }, {
              label: (0,external_wp_i18n_.__)('Center', 'video-embed-thumbnail-generator'),
              value: 'center'
            }, {
              label: (0,external_wp_i18n_.__)('Bottom', 'video-embed-thumbnail-generator'),
              value: 'bottom'
            }],
            onChange: value => setAttributes({
              watermark_valign: value
            }),
            style: {
              flex: 1
            }
          })]
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.RangeControl, {
          label: (0,external_wp_i18n_.__)('Horizontal Offset (%)', 'video-embed-thumbnail-generator'),
          value: effectiveX,
          onChange: value => setAttributes({
            watermark_x: value
          }),
          min: 0,
          max: 100,
          step: 0.01
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.RangeControl, {
          label: (0,external_wp_i18n_.__)('Vertical Offset (%)', 'video-embed-thumbnail-generator'),
          value: effectiveY,
          onChange: value => setAttributes({
            watermark_y: value
          }),
          min: 0,
          max: 100,
          step: 0.01
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,external_wp_i18n_.__)('Link to', 'video-embed-thumbnail-generator'),
          value: effectiveLinkToType,
          onChange: value => setAttributes({
            watermark_link_to: value
          }),
          options: [{
            value: 'false',
            label: (0,external_wp_i18n_.__)('None', 'video-embed-thumbnail-generator')
          }, {
            value: 'home',
            label: (0,external_wp_i18n_.__)('Home page', 'video-embed-thumbnail-generator')
          }, {
            value: 'parent',
            label: (0,external_wp_i18n_.__)('Parent post', 'video-embed-thumbnail-generator')
          }, {
            value: 'download',
            label: (0,external_wp_i18n_.__)('Download video', 'video-embed-thumbnail-generator')
          }, {
            value: 'attachment',
            label: (0,external_wp_i18n_.__)('Video attachment page', 'video-embed-thumbnail-generator')
          }, {
            value: 'custom',
            label: (0,external_wp_i18n_.__)('Custom URL', 'video-embed-thumbnail-generator')
          }]
        }), effectiveLinkToType === 'custom' && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,external_wp_i18n_.__)('Watermark URL', 'video-embed-thumbnail-generator'),
          value: effectiveCustomLinkUrl,
          onChange: value => setAttributes({
            watermark_url: value
          })
        })]
      })
    }), isOverlay && containerDimensions && isSelected ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
      ref: containerRef,
      style: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'auto'
      },
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(WatermarkPositioner/* default */.A, {
        containerDimensions: containerDimensions,
        settings: resolved,
        onChange: newAttrs => setAttributes(newAttrs),
        isSelected: isSelected,
        showBackground: false,
        aspectRatio: detectedAspectRatio,
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(VideoWatermark, {
          attributes: attributes,
          context: context,
          isBlockEditor: true,
          onDimensions: setDetectedAspectRatio
        })
      })
    }) : /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
      ref: containerRef,
      style: {
        ...(isOverlay ? {
          width: '100%',
          height: '100%',
          position: 'relative'
        } : {})
      },
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(VideoWatermark, {
        attributes: attributes,
        context: context,
        isBlockEditor: isOverlay,
        onDimensions: setDetectedAspectRatio
      })
    })]
  });
}
;// ./src/blocks/watermark/save.js
function save() {
  return null;
}
;// ./src/blocks/watermark/block.json
const block_namespaceObject = /*#__PURE__*/JSON.parse('{"UU":"videopack/watermark"}');
// EXTERNAL MODULE: ./src/assets/icon.js
var icon = __webpack_require__(9427);
;// ./src/blocks/watermark/index.js





(0,external_wp_blocks_.registerBlockType)(block_namespaceObject.UU, {
  icon: icon/* videopackWatermark */.Jm,
  edit: Edit,
  save: save
});

/***/ },

/***/ 6022
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7723);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6427);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6087);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(7143);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(2619);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _wordpress_core_data__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(3582);
/* harmony import */ var _wordpress_core_data__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_core_data__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _EncodeFormatStatus__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(5042);
/* harmony import */ var _api_gallery__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(8533);
/* harmony import */ var _api_jobs__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(104);
/* harmony import */ var _api_media__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(4263);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(790);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__);
/**
 * Component to manage additional video formats, including encoding and file management.
 */

/* global videopack_config */












/**
 * Helper to get the ordinal string for a number.
 *
 * @param {number} n      The number.
 * @param {string} locale The locale string.
 * @return {string} Ordinal string (e.g., "1st", "2nd").
 */

const getOrdinal = (n, locale = 'en-US') => {
  const pr = new Intl.PluralRules(locale.replace('_', '-'), {
    type: 'ordinal'
  });
  const rule = pr.select(n);
  switch (rule) {
    case 'one':
      /* translators: %d is a number. This is for the 1st position in a queue. */
      return (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('%dst', 'video-embed-thumbnail-generator'), n);
    case 'two':
      /* translators: %d is a number. This is for the 2nd position in a queue. */
      return (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('%dnd', 'video-embed-thumbnail-generator'), n);
    case 'few':
      /* translators: %d is a number. This is for the 3rd position in a queue. */
      return (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('%drd', 'video-embed-thumbnail-generator'), n);
    default:
      /* translators: %d is a number. This is for the 4th, 5th, etc. position in a queue. */
      return (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('%dth', 'video-embed-thumbnail-generator'), n);
  }
};

/**
 * AdditionalFormats component for managing alternative video files.
 *
 * @param {Object}   props                Component props.
 * @param {Function} props.setAttributes  Function to update block attributes.
 * @param {Object}   props.attributes     Block attributes.
 * @param {Object}   props.options        Global Videopack options.
 * @param {number}   props.parentId       ID of the parent attachment.
 * @param {string}   props.src            Video source URL.
 * @param {Object}   props.probedMetadata Metadata from video probing.
 * @param {boolean}  props.isProbing      Whether the video is currently being probed.
 * @param {boolean}  props.isDiscovering  Whether formats are being discovered.
 * @return {Element} The rendered component.
 */
const AdditionalFormats = ({
  setAttributes,
  attributes,
  options = {},
  parentId: providedParentId,
  src: propSrc,
  // Accept src as a separate prop
  probedMetadata,
  isProbing,
  isDiscovering = false
}) => {
  const parentId = providedParentId || attributes.id || 0;
  const src = propSrc || attributes.src;
  const {
    ffmpeg_exists,
    active_encoder = 'ffmpeg'
  } = options;
  const activeEncoderReady = (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_4__.applyFilters)('videopack.encoder.is_ready', !!videopack_config.isTranscodingServiceReady, active_encoder, options);
  const effectiveFfmpegExists = active_encoder !== 'ffmpeg' && activeEncoderReady || ffmpeg_exists === true || ffmpeg_exists === 'true' || ffmpeg_exists === 1 || ffmpeg_exists === '1';
  const [videoFormats, setVideoFormats] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(null);
  const isExternal = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useMemo)(() => {
    let isSrcExternal = false;
    if (src) {
      try {
        isSrcExternal = new URL(src).origin !== window.location.origin;
      } catch {
        // Relative URLs or invalid URLs are considered internal
      }
    }
    return !attributes.id || isSrcExternal;
  }, [attributes.id, src]);
  const [isOpen, setIsOpen] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(false);
  const [encodeMessage, setEncodeMessage] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)();
  const [itemToDelete, setItemToDelete] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(null); // { type: 'file'/'job', formatId: string, jobId?: int, id?: int, name?: string }
  const [deleteInProgress, setDeleteInProgress] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(null); // Stores formatId or jobId being deleted
  const [isConfirmOpen, setIsConfirmOpen] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(false);
  const [isLoading, setIsLoading] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(false);
  const [isProcessing, setIsProcessing] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(false);
  const [processingId, setProcessingId] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(null);
  const [isEncoding, setIsEncoding] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(false);
  const siteSettings = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_3__.useSelect)(select => {
    return select('core').getSite();
  }, []);
  const sanitizeError = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useCallback)(error => {
    let errorMessage = error?.data?.details ? error.data.details.join(', ') : error.message || '';

    // If the message contains HTML, it's likely a WordPress fatal error response
    if (/<[a-z][\s\S]*>/i.test(errorMessage)) {
      errorMessage = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('A server error occurred. Please check the PHP logs.', 'video-embed-thumbnail-generator');
    }
    return errorMessage;
  }, []);

  // Auto-clear success messages after 30 seconds.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useEffect)(() => {
    if (encodeMessage && (typeof encodeMessage !== 'string' || !encodeMessage.includes((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Error:', 'video-embed-thumbnail-generator')))) {
      const timer = setTimeout(() => {
        setEncodeMessage(null);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [encodeMessage]);
  const updateVideoFormats = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useCallback)(response => {
    setVideoFormats(currentVideoFormats => {
      if (response && response.constructor === Object) {
        const newFormats = {
          ...response
        };

        // If we have old data, try to preserve some client-side state
        Object.keys(newFormats).forEach(fId => {
          const newFormat = newFormats[fId];
          const oldFormat = currentVideoFormats?.[fId];

          // Carry over UI-only 'checked' state or initialize it.
          // If the status is one where encoding is already done or in progress, uncheck it.
          const isBusyOrDone = (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_4__.applyFilters)('videopack.busyOrDoneStatuses', ['queued', 'encoding', 'processing', 'completed', 'needs_insert', 'pending_replacement', 'remote_exists', 'browser_pending', 'browser_encoding']).includes(newFormat.status);
          newFormat.checked = oldFormat && !isBusyOrDone ? !!oldFormat.checked : false;
        });

        // Only update state if the formats have actually changed.
        // This check is important to prevent unnecessary re-renders.
        if (JSON.stringify(currentVideoFormats) !== JSON.stringify(newFormats)) {
          return newFormats;
        }
      } else if (JSON.stringify(currentVideoFormats) !== JSON.stringify(response)) {
        // Fallback for non-object responses
        return response;
      }
      return currentVideoFormats;
    });
  }, []);
  const fetchVideoFormats = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useCallback)(async (signal = null) => {
    const activeId = attributes.id || 0;
    if (!activeId || !src) {
      return;
    }
    if (!videoFormats) {
      setIsLoading(true);
    }
    try {
      const formats = await (0,_api_gallery__WEBPACK_IMPORTED_MODULE_7__/* .getVideoFormats */ .EA)(activeId, src, probedMetadata, signal);
      updateVideoFormats(formats);
    } catch (error) {
      if (error.name === 'AbortError') {
        return;
      }
      console.error('Error fetching video formats:', error);
      const errorMessage = sanitizeError(error);
      setEncodeMessage((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)(/* translators: %s is the error details */
      (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Error: %s', 'video-embed-thumbnail-generator'), errorMessage));
      setVideoFormats({});
    } finally {
      setIsLoading(false);
    }
  }, [attributes.id, src, updateVideoFormats, probedMetadata, sanitizeError, videoFormats]);
  const pollVideoFormats = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useCallback)(async (signal = null) => {
    const activeId = attributes.id || 0;
    if (src) {
      try {
        const formats = await (0,_api_gallery__WEBPACK_IMPORTED_MODULE_7__/* .getVideoFormats */ .EA)(activeId, src, probedMetadata, signal);
        updateVideoFormats(formats);
        return formats;
      } catch (error) {
        if (error.name === 'AbortError') {
          return null;
        }
        console.error('Error polling video formats:', error);
      }
    }
    return null;
  }, [src, attributes.id, updateVideoFormats, probedMetadata]);

  // Initial fetch
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useEffect)(() => {
    if (isProbing || !isOpen || isDiscovering) {
      return;
    }

    // Only fetch once. Polling handles updates if encoding.
    if (videoFormats) {
      return;
    }
    const controller = new AbortController();
    fetchVideoFormats(controller.signal);
    return () => controller.abort();
  }, [fetchVideoFormats, isProbing, isOpen, isDiscovering, videoFormats]);
  const shouldPoll = formats => {
    if (!formats) {
      return false;
    }
    // Poll only if at least one format is still in a state that requires updates.
    return Object.values(formats).some(format => format.status === 'queued' || format.status === 'browser_pending' || format.status === 'encoding' || format.status === 'processing' || format.status === 'needs_insert' || format.status === 'pending_replacement');
  };
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useEffect)(() => {
    setIsEncoding(shouldPoll(videoFormats));
  }, [videoFormats]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useEffect)(() => {
    let pollTimer = null;
    let isMounted = true;

    // Handle real-time progress updates from browser encoder via CustomEvents
    const handleBrowserProgress = event => {
      const {
        job_id,
        format_id,
        percent,
        fps,
        speed,
        elapsed,
        remaining
      } = event.detail;
      setVideoFormats(prevFormats => {
        if (!prevFormats) {
          return prevFormats;
        }
        const updatedFormats = {
          ...prevFormats
        };
        const format = updatedFormats[format_id];
        if (format && (Number(format.job_id) === Number(job_id) || !format.job_id && format.status === 'browser_pending')) {
          updatedFormats[format_id] = {
            ...format,
            job_id,
            status: 'encoding',
            encoding_now: true,
            progress: {
              ...(typeof format.progress === 'object' ? format.progress : {}),
              percent,
              fps,
              speed,
              elapsed,
              remaining,
              status: 'encoding'
            }
          };
          return updatedFormats;
        }
        return prevFormats;
      });
    };
    window.addEventListener('videopack_browser_progress', handleBrowserProgress);

    // Manage polling logic based on isEncoding state
    if (isEncoding && isOpen) {
      const runPoll = async () => {
        if (!isMounted) {
          return;
        }
        const formats = await pollVideoFormats();
        let delay = 15000;
        if (formats) {
          const isSlow = Object.values(formats).some(format => format.encoding_now && format.progress && format.progress.fps && parseFloat(format.progress.fps) < 5);
          if (isSlow) {
            delay = 30000;
          }
        }
        if (isMounted) {
          pollTimer = setTimeout(runPoll, delay);
        }
      };

      // Don't run immediately if we just mounted/changed state,
      // wait for the first interval.
      pollTimer = setTimeout(runPoll, 5000);
    }
    return () => {
      isMounted = false;
      window.removeEventListener('videopack_browser_progress', handleBrowserProgress);
      if (pollTimer) {
        clearTimeout(pollTimer);
      }
    };
  }, [isEncoding, isOpen, pollVideoFormats]);
  const handleFormatCheckbox = (formatId, isChecked) => {
    setVideoFormats(prevVideoFormats => {
      const updatedFormats = {
        ...prevVideoFormats
      };
      if (updatedFormats[formatId]) {
        // If a replacement format is checked, uncheck all other replacement formats.
        if (isChecked && updatedFormats[formatId].replaces_original) {
          Object.keys(updatedFormats).forEach(id => {
            if (id !== formatId && updatedFormats[id].replaces_original) {
              updatedFormats[id] = {
                ...updatedFormats[id],
                checked: false
              };
            }
          });
        }
        updatedFormats[formatId] = {
          ...updatedFormats[formatId],
          checked: isChecked
        };
      }

      // Allow extensions (Pro) to modify the state based on checkboxes.
      /**
       * Filters the updated video formats list after checking/unchecking a checkbox.
       *
       * Useful for extensions to perform custom validations or toggle other codecs accordingly.
       *
       * @since 5.0.0
       *
       * @param {Object}  updatedFormats Copy of the video formats state object.
       * @param {string}  formatId       The resolution format ID that was changed.
       * @param {boolean} isChecked      True if format is checked, false otherwise.
       */
      return (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_4__.applyFilters)('videopack.handle_format_checkbox', updatedFormats, formatId, isChecked);
    });
  };
  const handleEnqueue = async () => {
    if (!videopack_config) {
      return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Spinner, {});
    }
    setIsProcessing(true);

    // Get list of format IDs that are checked and available
    const formatsToEncode = Object.entries(videoFormats).filter(([, value]) => value.checked && !(0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_4__.applyFilters)('videopack.nonQueueableStatuses', ['queued', 'encoding', 'processing', 'completed', 'needs_insert', 'pending_replacement', 'remote_exists']).includes(value.status) && !value.exists).reduce((acc, [formatId]) => {
      acc[formatId] = true; // Backend expects an object { format_id: true, ... }
      return acc;
    }, {});
    try {
      const activeId = attributes.id || 0;
      const response = await (0,_api_jobs__WEBPACK_IMPORTED_MODULE_8__/* .enqueueJob */ .Ix)(activeId, src, formatsToEncode, parentId);
      if (response?.attachment_id && !attributes.id) {
        // Attachment was created on the fly
        setAttributes({
          ...attributes,
          id: Number(response.attachment_id)
        });
      }
      const jobCount = response?.encode_list?.length || 0;
      if (jobCount === 0) {
        const emptyMsg = response?.log?.length > 0 ? response.log.join(' ') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('No formats were added to the queue.', 'video-embed-thumbnail-generator');
        setEncodeMessage(emptyMsg);
      } else {
        const queuePosition = response?.new_queue_position;
        const startPosition = Math.max(1, queuePosition - jobCount + 1);
        const ordinalPosition = getOrdinal(startPosition, siteSettings?.language || 'en-US');
        const encodeList = response?.encode_list || [];
        const cmafPartsCount = encodeList.filter(item => item.id?.startsWith('cmaf_')).length;
        const otherJobsCount = encodeList.length - cmafPartsCount;
        const effectiveJobCount = (cmafPartsCount > 0 ? 1 : 0) + otherJobsCount;
        let successMsg = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("span", {
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)(/* translators: %1$d is the number of jobs. %2$s is the ordinal position (e.g. 1st, 2nd). */
          (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__._n)('%1$d job added to queue in %2$s position.', '%1$d jobs added to queue starting in %2$s position.', effectiveJobCount, 'video-embed-thumbnail-generator'), effectiveJobCount, ordinalPosition)
        });
        if (active_encoder === 'browser') {
          successMsg = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("p", {
              children: successMsg
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("p", {
              children: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Browser encoding is active. Processing will only occur while the Videopack Processing page is open.', 'video-embed-thumbnail-generator'), ' ', /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("a", {
                href: videopack_config.queue_url,
                children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Go to Processing Page', 'video-embed-thumbnail-generator')
              })]
            })]
          });
        }
        setEncodeMessage(successMsg);
      }
      window.dispatchEvent(new CustomEvent('videopack_check_jobs'));
      fetchVideoFormats(); // Re-fetch to update statuses
    } catch (error) {
      console.error(error);
      const errorMessage = sanitizeError(error);

      /* translators: %s is an error message */
      setEncodeMessage((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)(/* translators: %s is an error message */
      (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Error: %s.', 'video-embed-thumbnail-generator'), errorMessage));
      fetchVideoFormats(); // Re-fetch to ensure UI is consistent
    } finally {
      setIsProcessing(false);
      setProcessingId(null);
    }
  };
  const onSelectFormat = formatId => async media => {
    if (!media || !media.id || !formatId) {
      return;
    }
    setIsProcessing(true);
    setProcessingId(formatId);
    try {
      await (0,_api_media__WEBPACK_IMPORTED_MODULE_9__/* .assignFormat */ .P_)(media.id, formatId, attributes.id);
      setEncodeMessage((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Video format assigned successfully.', 'video-embed-thumbnail-generator'));
      fetchVideoFormats(); // Refresh the list
    } catch (error) {
      console.error('Error assigning video format:', error);
      const errorMessage = sanitizeError(error);
      setEncodeMessage((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)(/* translators: %s is an error message */
      (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Error: %s', 'video-embed-thumbnail-generator'), errorMessage));
    } finally {
      setIsProcessing(false);
      setProcessingId(null);
    }
  };

  // Deletes the actual media file (WP Attachment or orphaned file)
  const handleFileDelete = async formatId => {
    const formatData = videoFormats?.[formatId];
    if (!formatData) {
      return;
    }
    setDeleteInProgress(formatId); // Mark this formatId as being deleted
    try {
      if (formatData.id) {
        await (0,_api_media__WEBPACK_IMPORTED_MODULE_9__/* .deleteFile */ .Ww)(formatData.id);
      } else {
        // Cleanup orphaned file
        await (0,_api_media__WEBPACK_IMPORTED_MODULE_9__/* .deleteFormat */ .fH)(parentId, formatId);
      }
      setEncodeMessage((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('File deleted successfully.', 'video-embed-thumbnail-generator'));
      fetchVideoFormats(); // Re-fetch to get the latest status from backend
    } catch (error) {
      console.error('File delete failed:', error);
      const errorMessage = sanitizeError(error);
      setEncodeMessage((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)(/* translators: %s is an error message */
      (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Error deleting file: %s', 'video-embed-thumbnail-generator'), errorMessage));
      fetchVideoFormats(); // Re-fetch to get the latest status
    } finally {
      setDeleteInProgress(null);
    }
  };

  // Deletes/Cancels a queue job
  const handleJobDelete = async jobId => {
    if (!jobId) {
      setEncodeMessage((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Error: Cannot delete job, missing job ID.', 'video-embed-thumbnail-generator'));
      console.error('Cannot delete job: Missing job ID');
      return;
    }
    setDeleteInProgress(jobId); // Mark this jobId as being deleted
    try {
      await (0,_api_jobs__WEBPACK_IMPORTED_MODULE_8__/* .deleteJob */ .XX)(jobId);
      window.dispatchEvent(new CustomEvent('videopack_job_deleted', {
        detail: {
          job_id: jobId
        }
      }));
      setEncodeMessage((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Job canceled/deleted successfully.', 'video-embed-thumbnail-generator'));
      fetchVideoFormats(); // Re-fetch to get the latest status
    } catch (error) {
      console.error('Job delete failed:', error);
      const errorMessage = sanitizeError(error);
      setEncodeMessage((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)(/* translators: %s is an error message */
      (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Error deleting job: %s', 'video-embed-thumbnail-generator'), errorMessage));
      fetchVideoFormats(); // Re-fetch to get the latest status
    } finally {
      setDeleteInProgress(null);
    }
  };
  const openConfirmDialog = (type, formatId) => {
    const formatData = videoFormats?.[formatId];
    if (!formatData) {
      return;
    }
    setItemToDelete({
      type,
      // 'file' or 'job'
      formatId,
      jobId: formatData.job_id,
      id: formatData.id,
      name: formatData.name
    });
    setIsConfirmOpen(true);
  };
  const handleConfirm = () => {
    setIsConfirmOpen(false);
    if (itemToDelete) {
      if (itemToDelete.type === 'file') {
        handleFileDelete(itemToDelete.formatId);
      } else if (itemToDelete.type === 'job' && itemToDelete.jobId) {
        handleJobDelete(itemToDelete.jobId);
      }
    }
    setItemToDelete(null);
  };
  const handleCancel = () => {
    setItemToDelete(null);
    setIsConfirmOpen(false);
  };
  const somethingToEncode = () => {
    if (videoFormats) {
      // Check if any format is checked AND available AND not already in a terminal/pending state
      return Object.values(videoFormats).some(obj => obj.checked && !['queued', 'encoding', 'processing', 'completed', 'needs_insert', 'pending_replacement'].includes(obj.status) && !obj.exists);
    }
    return false;
  };
  const encodeButtonTitle = () => {
    if (somethingToEncode()) {
      return isLoading ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Loading…', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Encode selected formats', 'video-embed-thumbnail-generator');
    }
    return (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Select formats to encode', 'video-embed-thumbnail-generator');
  };
  const isEncodeButtonDisabled = isLoading || !effectiveFfmpegExists || !somethingToEncode();
  const confirmDialogMessage = () => {
    if (!itemToDelete) {
      return '';
    }
    if (itemToDelete.type === 'file') {
      return (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Are you sure you want to permanently delete this attachment? This action cannot be undone.', 'video-embed-thumbnail-generator');
    }
    if (itemToDelete.type === 'job') {
      return (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Are you sure you want to permanently delete this job record? This action cannot be undone.', 'video-embed-thumbnail-generator');
    }
  };
  const canUploadFiles = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_3__.useSelect)(select => {
    const activeId = attributes.id || 0;
    if (activeId) {
      return select(_wordpress_core_data__WEBPACK_IMPORTED_MODULE_5__.store).canUser('create', 'media', activeId);
    }
    // If no ID but we have a src, check general media creation permissions
    return !!src && select(_wordpress_core_data__WEBPACK_IMPORTED_MODULE_5__.store).canUser('create', 'media');
  }, [attributes.id, src]);
  (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_3__.useSelect)(select => {
    const activeId = attributes.id || 0;
    const editorSelector = select('core/editor');
    return !!activeId && !!editorSelector && editorSelector.isDeletingPost(activeId);
  }, [attributes.id]);
  const groupedFormats = videoFormats ? (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_4__.applyFilters)(
  /**
   * Filters the grouped formats list before rendering additional formats choices.
   *
   * Allows custom sorting, layout, or injecting custom codecs into grouped categories.
   *
   * @since 5.0.0
   *
   * @param {Object} groupedFormats Object mapping codec keys to arrays of formats.
   * @param {Object} videoFormats   The original flat video formats state object.
   */
  'videopack.grouped_formats', Object.values(videoFormats).reduce((acc, format) => {
    if (!format.codec || !format.codec.id) {
      return acc;
    }
    const codecId = format.codec.id;
    if (!acc[codecId]) {
      acc[codecId] = {
        name: format.codec.name,
        formats: []
      };
    }
    acc[codecId].formats.push(format);
    // sort formats by height
    acc[codecId].formats.sort((a, b) => {
      // Prioritize the replacement format to be at the top of its codec.
      if (a.replaces_original && !b.replaces_original) {
        return -1;
      }
      if (!a.replaces_original && b.replaces_original) {
        return 1;
      }
      // Prioritize the fullres format.
      if (a.resolution.id === 'fullres' && b.resolution.id !== 'fullres') {
        return -1;
      }
      if (a.resolution.id !== 'fullres' && b.resolution.id === 'fullres') {
        return 1;
      }
      // Otherwise, sort by resolution height in descending order.
      return (b.resolution.height || 0) - (a.resolution.height || 0);
    });
    return acc;
  }, {}), videoFormats) : {};
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.Fragment, {
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Additional Formats', 'video-embed-thumbnail-generator'),
      opened: isOpen,
      onToggle: () => setIsOpen(!isOpen),
      children: [!videoFormats ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
        className: "videopack-formats-loading",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Spinner, {}), isLoading && isExternal && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("span", {
          className: "videopack-external-check-notice",
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Checking URLs on external server…', 'video-embed-thumbnail-generator')
        })]
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
        className: "videopack-formats-container",
        children: [isLoading && isExternal && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
          className: "videopack-external-check-notice",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Spinner, {
            size: 16
          }), (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Checking URLs on external server…', 'video-embed-thumbnail-generator')]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("ul", {
          className: `videopack-formats-list${effectiveFfmpegExists ? '' : ' no-ffmpeg'}`,
          children: Object.keys(groupedFormats).sort((a, b) => {
            if (a === 'thumbnail') {
              return 1;
            }
            if (b === 'thumbnail') {
              return -1;
            }
            return a.localeCompare(b);
          }).map(codecId => {
            const codecGroup = groupedFormats[codecId];
            if (codecGroup.formats.length === 0) {
              return null;
            }
            return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("li", {
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("h4", {
                className: "videopack-codec-name",
                children: codecGroup.name
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("ul", {
                children: codecGroup.formats.map(formatData => {
                  const formatId = formatData.format_id;
                  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_EncodeFormatStatus__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .A, {
                    formatId: formatId,
                    parentId: parentId,
                    formatData: formatData,
                    ffmpegExists: effectiveFfmpegExists,
                    onCheckboxChange: handleFormatCheckbox,
                    onSelectFormat: onSelectFormat,
                    isProcessing: isProcessing,
                    processingId: processingId,
                    deleteInProgress: deleteInProgress,
                    onDeleteFile: () => openConfirmDialog('file', formatId),
                    onCancelJob: () => openConfirmDialog('job', formatId),
                    onRefresh: fetchVideoFormats
                  }, formatId);
                })
              })]
            }, codecId);
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.__experimentalConfirmDialog, {
          isOpen: isConfirmOpen,
          onConfirm: handleConfirm,
          onCancel: handleCancel,
          className: "videopack-confirm-dialog",
          children: confirmDialogMessage()
        })]
      }), !!effectiveFfmpegExists && videoFormats && canUploadFiles && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.Fragment, {
        children: [(0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_4__.applyFilters)(
        /**
         * Action filter hook to render extra custom UI inside the Additional Formats panel.
         *
         * @since 5.0.0
         *
         * @param {null}   empty   Null context value.
         * @param {Object} context Context object containing videoFormats, options, parentId.
         */
        'videopack.AdditionalFormats.extraContent', null, {
          videoFormats,
          options,
          parentId
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelRow, {
          className: "videopack-encode-button-row",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
            variant: "secondary",
            onClick: handleEnqueue,
            title: encodeButtonTitle(),
            text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Encode', 'video-embed-thumbnail-generator'),
            disabled: isEncodeButtonDisabled || isProcessing
          }), (isLoading || isProcessing) && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Spinner, {})]
        })]
      }), encodeMessage && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Notice, {
        status: typeof encodeMessage === 'string' && (encodeMessage.includes((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Error', 'video-embed-thumbnail-generator')) || encodeMessage.includes(':')) ? 'error' : 'success',
        isDismissible: true,
        onRemove: () => setEncodeMessage(null),
        style: {
          marginTop: '15px',
          marginBottom: '0'
        },
        children: encodeMessage
      })]
    })
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (AdditionalFormats);
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "A", 0, /* export default binding */ __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ ]);


/***/ },

/***/ 5042
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7723);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6427);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2619);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _EncodeProgress__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(1108);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(790);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__);
/**
 * Component to display the status and controls for a single video format.
 */







/**
 * EncodeFormatStatus component.
 *
 * @param {Object}   props                  Component props.
 * @param {string}   props.formatId         The format identifier.
 * @param {Object}   props.formatData       Data for the specific format.
 * @param {boolean}  props.ffmpegExists     Whether FFmpeg is available on the server.
 * @param {Function} props.onCheckboxChange Callback for checkbox toggles.
 * @param {Function} props.onSelectFormat   Callback for manual file selection.
 * @param {Function} props.onDeleteFile     Callback for file deletion.
 * @param {Function} props.onRemoveFormat   Callback for removing manual assignment.
 * @param {Function} props.onCancelJob      Callback for canceling an encoding job.
 * @param {string}   props.deleteInProgress The ID/JobId currently being deleted.
 * @param {Function} props.onRefresh        Callback to refresh format data.
 * @param {number}   props.parentId         ID of the parent video attachment.
 * @param {boolean}  props.showLabel        Whether to show the format label.
 * @param {boolean}  props.hideCancel       Whether to hide the cancel button.
 * @param {boolean}  props.isProcessing     Whether the format is currently being processed.
 * @param {string}   props.processingId     The ID of the format being processed.
 * @param {boolean}  props.hideButtons      Whether to hide control buttons.
 * @return {Element} The rendered component.
 */

const EncodeFormatStatus = ({
  formatId,
  formatData,
  ffmpegExists,
  onCheckboxChange,
  onSelectFormat,
  onDeleteFile,
  onRemoveFormat,
  onCancelJob,
  onRefresh,
  parentId,
  showLabel = true,
  hideCancel = false,
  isProcessing = false,
  processingId = null,
  deleteInProgress = null,
  hideButtons = false
}) => {
  const openMediaLibrary = (currentId = null) => {
    if (typeof window.wp === 'undefined' || !window.wp.media) {
      return;
    }
    const frame = window.wp.media({
      title: currentId ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)(/* translators: %s is the label of a video resolution (eg: 720p ) */
      (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Replace %s', 'video-embed-thumbnail-generator'), formatData.label) : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Select existing file', 'video-embed-thumbnail-generator'),
      button: {
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Select', 'video-embed-thumbnail-generator')
      },
      multiple: false,
      library: {
        type: 'video',
        videopack_parent_id: parentId,
        videopack_filter: 'show_children'
      }
    });
    frame.on('select', () => {
      const attachment = frame.state().get('selection').first().toJSON();
      onSelectFormat(formatId)(attachment);
    });
    frame.on('open', () => {
      const library = frame.state().get('library');
      if (library) {
        library.props.set({
          videopack_parent_id: parentId,
          videopack_filter: 'show_children'
        });
      }
      if (currentId) {
        const selection = frame.state().get('selection');
        const attachment = window.wp.media.attachment(currentId);
        attachment.fetch().then(() => {
          selection.add(attachment);
        });
      }
    });
    frame.open();
  };
  if (!formatData) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Spinner, {});
  }
  const getCheckboxCheckedState = data => {
    return !!data.checked;
  };
  const getCheckboxDisabledState = data => {
    if (isProcessing || !!deleteInProgress) {
      return true;
    }
    return data.exists && data.status !== 'error' || (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__.applyFilters)('videopack.busyOrDoneStatuses', ['queued', 'encoding', 'processing', 'completed', 'needs_insert', 'pending_replacement', 'remote_exists', 'browser_pending', 'browser_encoding']).includes(data.status);
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("li", {
    className: "videopack-format-row",
    children: [showLabel && (!!ffmpegExists ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.CheckboxControl, {
      __nextHasNoMarginBottom: true,
      className: "videopack-format",
      label: formatData.label,
      checked: getCheckboxCheckedState(formatData),
      disabled: getCheckboxDisabledState(formatData),
      onChange: value => onCheckboxChange(formatId, value)
    }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("span", {
      className: "videopack-format",
      children: formatData.label
    })), formatData.status !== 'not_encoded' && (formatData.status_l10n !== formatData.label || !showLabel) && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("span", {
      className: "videopack-format-status",
      children: formatData.status === 'browser_encoding' ? window.videopack_current_browser_job_id && Number(window.videopack_current_browser_job_id) === Number(formatData.job_id || formatData.id) ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Encoding (This Browser Tab)', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Encoding (Different Browser/Tab)', 'video-embed-thumbnail-generator') : formatData.status_l10n
    }), formatData.status === 'not_encoded' && !formatData.exists && !formatData.replaces_original && !hideButtons && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
      variant: "secondary",
      onClick: () => openMediaLibrary(),
      className: "videopack-format-button",
      size: "small",
      isBusy: processingId === formatId,
      disabled: isProcessing || !!deleteInProgress,
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Open the Media Library', 'video-embed-thumbnail-generator'),
      children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Choose', 'video-embed-thumbnail-generator')
    }), formatData.exists && !formatData.encoding_now && !hideButtons && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
      variant: "secondary",
      onClick: () => openMediaLibrary(formatData.id),
      className: "videopack-format-button",
      size: "small",
      isBusy: processingId === formatId,
      disabled: isProcessing || !!deleteInProgress,
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Open the Media Library', 'video-embed-thumbnail-generator'),
      children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Change', 'video-embed-thumbnail-generator')
    }), formatData.is_manual && formatData.id && !formatData.encoding_now && !hideButtons && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
      onClick: onRemoveFormat,
      variant: "secondary",
      size: "small",
      isBusy: processingId === formatId,
      disabled: isProcessing || !!deleteInProgress,
      text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Remove', 'video-embed-thumbnail-generator'),
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Removes manual selection. It will not be deleted.', 'video-embed-thumbnail-generator')
    }), formatData.deletable && !formatData.encoding_now && !hideButtons && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
      isBusy: deleteInProgress === formatId,
      disabled: isProcessing || !!deleteInProgress,
      onClick: onDeleteFile,
      variant: "link",
      text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Delete permanently', 'video-embed-thumbnail-generator'),
      isDestructive: true
    }), (formatData.encoding_now || formatData.status === 'browser_encoding' || formatData.status === 'failed' || formatData.status === 'error') && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_EncodeProgress__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, {
      formatData: formatData,
      onCancelJob: onCancelJob,
      deleteInProgress: deleteInProgress,
      onRefresh: onRefresh,
      hideCancel: hideCancel
    })]
  }, formatId);
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (EncodeFormatStatus);
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "A", 0, /* export default binding */ __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ ]);


/***/ },

/***/ 1108
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7723);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6087);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6427);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(9629);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(790);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__);
/**
 * Component to display and interpolate encoding progress for a video job.
 */







/**
 * EncodeProgress component.
 *
 * @param {Object}   props                  Component props.
 * @param {Object}   props.formatData       Data for the format being encoded.
 * @param {Function} props.onCancelJob      Callback to cancel the job.
 * @param {string}   props.deleteInProgress The ID/JobId currently being deleted.
 * @param {Function} props.onRefresh        Callback to refresh data.
 * @param {boolean}  props.hideCancel       Whether to hide the cancel button.
 * @return {Element} The rendered component.
 */

const EncodeProgress = ({
  formatData,
  onCancelJob,
  deleteInProgress,
  onRefresh,
  hideCancel = false
}) => {
  const hasTriggeredRefresh = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(false);
  const [interpolatedProgress, setInterpolatedProgress] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)({
    percent: 0,
    elapsed: 0,
    remaining: null
  });
  const [isExpanded, setIsExpanded] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const convertToTimecode = time => {
    if (time === null || time === undefined || isNaN(time)) {
      return '--:--';
    }
    const padZero = num => Math.floor(num).toString().padStart(2, '0');
    const h = Math.floor(time / 3600);
    const m = Math.floor(time % 3600 / 60);
    const s = Math.floor(time % 60);
    const hh = h > 0 ? padZero(h) + ':' : '';
    const mm = padZero(m);
    const ss = padZero(s);
    return hh + mm + ':' + ss;
  };

  // Sync local state when server data updates
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (formatData?.progress && typeof formatData.progress === 'object' && formatData.progress !== 'recheck') {
      setInterpolatedProgress(prev => {
        // Don't let progress jump backwards due to server polling lag
        if (formatData.progress.percent < prev.percent) {
          return prev;
        }
        return {
          percent: formatData.progress.percent || 0,
          elapsed: formatData.progress.elapsed || 0,
          remaining: formatData.progress.remaining
        };
      });
    }
  }, [formatData?.progress]);

  // Real-time updates from browser encoder
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    const handleBrowserProgress = event => {
      const {
        job_id,
        format_id,
        percent,
        elapsed,
        remaining
      } = event.detail;
      if (Number(formatData?.job_id) === Number(job_id) || formatData?.format_id === format_id && formatData?.status === 'browser_pending') {
        setInterpolatedProgress(prev => {
          if (percent < prev.percent) {
            return prev;
          }
          return {
            percent,
            elapsed: elapsed !== undefined ? elapsed : prev.elapsed,
            remaining: remaining !== undefined ? remaining : prev.remaining
          };
        });
      }
    };
    window.addEventListener('videopack_browser_progress', handleBrowserProgress);
    return () => window.removeEventListener('videopack_browser_progress', handleBrowserProgress);
  }, [formatData?.job_id, formatData?.format_id, formatData?.status]);

  // Internal interpolation timer
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    const isRunning = ['encoding', 'processing', 'needs_insert', 'pending_replacement'].includes(formatData?.status);
    if (!isRunning || !formatData?.progress || typeof formatData.progress !== 'object') {
      return;
    }
    const interval = setInterval(() => {
      setInterpolatedProgress(prev => {
        const now = new Date().getTime() / 1000;
        const started = formatData.progress?.started || formatData.started;
        const elapsed = started ? Math.max(0, now - started) : prev.elapsed + 1;
        let percent = parseFloat(prev.percent) || 0;
        let remaining = prev.remaining;
        const video_duration = formatData.progress?.video_duration || formatData.video_duration;
        if (video_duration && video_duration > 0) {
          const totalDurationInSeconds = video_duration / 1000000;
          const speedMatch = formatData.progress?.speed ? String(formatData.progress.speed).match(/(\d*\.?\d+)/) : null;
          const speed = speedMatch ? parseFloat(speedMatch[0]) : 0;
          if (speed > 0) {
            percent = elapsed * speed * 100 / totalDurationInSeconds;
          }
          if (percent > 0 && speed > 0) {
            remaining = totalDurationInSeconds * (100 - percent) / 100 / speed;
          } else {
            remaining = Math.max(0, totalDurationInSeconds - elapsed);
          }
        }
        if (percent >= 100) {
          remaining = 0;
        }
        return {
          percent: Math.min(100, Math.max(0, percent)),
          elapsed,
          remaining: remaining !== null ? Math.max(0, remaining) : null
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [formatData?.status, formatData?.progress, formatData?.started, formatData?.video_duration]);

  // Auto-refresh when finished
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    const percent = interpolatedProgress.percent;
    const isFinished = percent >= 100;
    if (isFinished && onRefresh && !hasTriggeredRefresh.current && formatData?.encoding_now) {
      hasTriggeredRefresh.current = true;
      onRefresh();
    } else if (!isFinished) {
      hasTriggeredRefresh.current = false;
    }
  }, [interpolatedProgress.percent, onRefresh, formatData?.encoding_now]);
  if (formatData?.encoding_now) {
    const percent = Math.round(interpolatedProgress.percent);
    const percentText = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)('%d%%', percent);
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("div", {
      className: "videopack-encode-progress",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("div", {
        className: "videopack-encode-progress-row",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("div", {
          className: "videopack-meter",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("div", {
            className: "videopack-meter-bar",
            style: {
              width: percentText
            },
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("div", {
              className: "videopack-meter-text",
              children: percentText
            })
          })
        }), !hideCancel && (formatData.progress?.job_id || formatData.job_id) && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
          onClick: () => onCancelJob(formatData.progress?.job_id || formatData.job_id),
          variant: "secondary",
          isDestructive: true,
          size: "small",
          className: "videopack-cancel-job",
          isBusy: deleteInProgress === (formatData.progress?.job_id || formatData.job_id),
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A,
          title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Cancel', 'video-embed-thumbnail-generator'),
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("span", {
            className: "videopack-button-text",
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Cancel', 'video-embed-thumbnail-generator')
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("div", {
        className: "videopack-encode-progress-small-text",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("span", {
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Elapsed:', 'video-embed-thumbnail-generator') + ' ' + convertToTimecode(interpolatedProgress.elapsed)
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("span", {
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Remaining:', 'video-embed-thumbnail-generator') + ' ' + convertToTimecode(interpolatedProgress.remaining)
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("span", {
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('fps:', 'video-embed-thumbnail-generator') + ' ' + (formatData.progress?.fps || '--')
        })]
      })]
    });
  }
  if (formatData?.status === 'failed' && formatData?.error_message) {
    const fullError = formatData.error_message;
    const firstLine = fullError.split('\n')[0] || fullError;
    const shortError = firstLine.length > 120 ? firstLine.substring(0, 120) + '...' : firstLine;
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("div", {
      className: "videopack-encode-error",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("div", {
        className: "videopack-encode-error-summary",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("span", {
          className: "videopack-encode-error-label",
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Error:', 'video-embed-thumbnail-generator')
        }), ' ', /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("span", {
          className: "videopack-encode-error-text-preview",
          children: shortError
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("div", {
        className: "videopack-encode-error-toggle-container",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
          onClick: () => setIsExpanded(!isExpanded),
          variant: "link",
          className: "videopack-encode-error-toggle",
          children: isExpanded ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Hide Details', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Show Details', 'video-embed-thumbnail-generator')
        })
      }), isExpanded && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("pre", {
        className: "videopack-encode-error-details",
        children: fullError
      }), hideCancel === false && formatData.job_id && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("div", {
        className: "videopack-encode-error-actions",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
          onClick: () => onCancelJob(formatData.job_id),
          variant: "secondary",
          isDestructive: true,
          isBusy: deleteInProgress === formatData.job_id,
          size: "small",
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Delete Job', 'video-embed-thumbnail-generator')
        })
      })]
    });
  }
  return null;
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (EncodeProgress);
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "A", 0, /* export default binding */ __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ ]);


/***/ },

/***/ 6312
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6427);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(790);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__);


/**
 * A compact color picker using a dropdown and color palette.
 *
 * @param {Object}   props               Component props.
 * @param {string}   props.label         Label for the color picker.
 * @param {string}   props.value         Current color value.
 * @param {Function} props.onChange      Callback for color change.
 * @param {Array}    props.colors        Available color palette.
 * @param {string}   props.fallbackValue Default color to show when value is empty.
 * @return {Element} The rendered component.
 */

const CompactColorPicker = ({
  label,
  value,
  onChange,
  colors,
  fallbackValue
}) => {
  const resolveValueToHex = val => {
    if (typeof val === 'string' && val.startsWith('var(--wp--preset--color--')) {
      const slug = val.replace('var(--wp--preset--color--', '').replace(')', '');
      const matched = colors?.find(c => c.slug === slug);
      if (matched) {
        return matched.color;
      }
    }
    return val;
  };
  const hexValue = resolveValueToHex(value);
  const displayColor = hexValue || resolveValueToHex(fallbackValue) || 'transparent';
  const handleOnChange = val => {
    if (val === undefined) {
      onChange('');
      return;
    }
    const matched = colors?.find(c => c.color === val);
    if (matched && matched.slug) {
      onChange(`var(--wp--preset--color--${matched.slug})`);
    } else {
      onChange(val);
    }
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("div", {
    className: "videopack-color-picker-container",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("span", {
      className: "videopack-color-picker-label",
      children: label
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Dropdown, {
      className: "videopack-color-dropdown",
      contentClassName: "videopack-color-dropdown-content",
      renderToggle: ({
        isOpen,
        onToggle
      }) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        onClick: onToggle,
        "aria-expanded": isOpen,
        variant: "secondary",
        className: "videopack-color-picker-button",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ColorIndicator, {
          colorValue: displayColor
        })
      }),
      renderContent: () => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("div", {
        className: "videopack-color-picker-palette-wrapper",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ColorPalette, {
          colors: colors,
          value: hexValue === '' ? undefined : hexValue,
          onChange: handleOnChange,
          disableCustomColors: false,
          clearable: true
        })
      })
    })]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (CompactColorPicker);
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "A", 0, /* export default binding */ __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ ]);


/***/ },

/***/ 7221
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* unused harmony export parseColor */
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6087);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(790);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__);


/**
 * Helper to parse hex/rgb colors into 0-1 range for SVG filters.
 * @param {string} color The color string to parse.
 */

const parseColor = color => {
  if (!color) {
    return {
      r: 0,
      g: 0,
      b: 0,
      a: 1
    };
  }
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    let r = 0,
      g = 0,
      b = 0;
    const a = 255;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    }
    return {
      r: r / 255,
      g: g / 255,
      b: b / 255,
      a: a / 255
    };
  }
  const rgbMatch = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10) / 255,
      g: parseInt(rgbMatch[2], 10) / 255,
      b: parseInt(rgbMatch[3], 10) / 255,
      a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1
    };
  }
  return {
    r: 0,
    g: 0,
    b: 0,
    a: 1
  };
};

/**
 * Shared component to render a custom SVG duotone filter.
 *
 * @param {Object} props        Component props
 * @param {Array}  props.colors Array of two hex/rgb colors
 * @param {string} props.id     Filter ID to use in url(#id)
 * @return {Element|null} SVG filter element
 */
const CustomDuotoneFilter = ({
  colors,
  id
}) => {
  const filterData = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    if (!colors || colors.length < 2) {
      return null;
    }
    const c1 = parseColor(colors[0]);
    const c2 = parseColor(colors[1]);
    return {
      rValues: `${c1.r} ${c2.r}`,
      gValues: `${c1.g} ${c2.g}`,
      bValues: `${c1.b} ${c2.b}`,
      aValues: `${c1.a} ${c2.a}`
    };
  }, [colors]);
  if (!filterData) {
    return null;
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("svg", {
    style: {
      position: 'absolute',
      width: 0,
      height: 0,
      visibility: 'hidden'
    },
    "aria-hidden": "true",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("filter", {
      id: id,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("feColorMatrix", {
        type: "matrix",
        values: ".299 .587 .114 0 0 .299 .587 .114 0 0 .299 .587 .114 0 0 .299 .587 .114 0 0"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("feComponentTransfer", {
        colorInterpolationFilters: "sRGB",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("feFuncR", {
          type: "table",
          tableValues: filterData.rValues
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("feFuncG", {
          type: "table",
          tableValues: filterData.gValues
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("feFuncB", {
          type: "table",
          tableValues: filterData.bValues
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("feFuncA", {
          type: "table",
          tableValues: filterData.aValues
        })]
      })]
    })
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (CustomDuotoneFilter);
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "A", 0, /* export default binding */ __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ ]);


/***/ },

/***/ 6967
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ CollectionColorSettings)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6427);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7723);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6087);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(6312);
/* harmony import */ var _utils_colors__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(7068);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(790);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__);






/* global videopack_config */

function CollectionColorSettings({
  attributes,
  setAttributes,
  options = {},
  blockType = 'gallery',
  showPaginationSettings = true,
  showTitleSettings = true,
  showPlayerSettings = true,
  showSkinSettings = true
}) {
  const {
    skin,
    title_color,
    title_background_color,
    play_button_color,
    play_button_secondary_color,
    control_bar_bg_color,
    control_bar_color,
    pagination_color,
    pagination_background_color,
    pagination_active_bg_color,
    pagination_active_color
  } = attributes;
  const effectiveValues = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useMemo)(() => ({
    ...options,
    ...attributes
  }), [options, attributes]);
  const colorFallbacks = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useMemo)(() => (0,_utils_colors__WEBPACK_IMPORTED_MODULE_4__/* .getColorFallbacks */ .l)(effectiveValues), [effectiveValues]);
  const THEME_COLORS = videopack_config?.themeColors || options?.themeColors;
  const isGalleryOrList = blockType === 'gallery' || blockType === 'list' || blockType === 'grid';
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.Fragment, {
    children: [isGalleryOrList && showSkinSettings && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
      className: "videopack-skin-section",
      style: {
        marginBottom: '16px'
      },
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SelectControl, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Player Skin', 'video-embed-thumbnail-generator'),
        value: skin || options.skin || '',
        options: [{
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Videopack', 'video-embed-thumbnail-generator'),
          value: 'vjs-theme-videopack'
        }, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Videopack Classic', 'video-embed-thumbnail-generator'),
          value: 'kg-video-js-skin'
        }, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Video.js default', 'video-embed-thumbnail-generator'),
          value: 'default'
        }, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('City', 'video-embed-thumbnail-generator'),
          value: 'vjs-theme-city'
        }, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Fantasy', 'video-embed-thumbnail-generator'),
          value: 'vjs-theme-fantasy'
        }, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Forest', 'video-embed-thumbnail-generator'),
          value: 'vjs-theme-forest'
        }, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Sea', 'video-embed-thumbnail-generator'),
          value: 'vjs-theme-sea'
        }],
        onChange: value => setAttributes({
          skin: value
        })
      })
    }), isGalleryOrList && showTitleSettings && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
      className: "videopack-color-section",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
        className: "videopack-settings-section-title",
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Titles', 'video-embed-thumbnail-generator')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
        className: "videopack-color-flex-row",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
          className: "videopack-color-flex-item",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Text', 'video-embed-thumbnail-generator'),
            value: title_color,
            onChange: value => setAttributes({
              title_color: value
            }),
            colors: THEME_COLORS,
            fallbackValue: colorFallbacks.title_color
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
          className: "videopack-color-flex-item",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Background', 'video-embed-thumbnail-generator'),
            value: title_background_color,
            onChange: value => setAttributes({
              title_background_color: value
            }),
            colors: THEME_COLORS,
            fallbackValue: colorFallbacks.title_background_color
          })
        })]
      })]
    }), isGalleryOrList && showPlayerSettings && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
      className: "videopack-color-section",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
        className: "videopack-settings-section-title",
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Player', 'video-embed-thumbnail-generator')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
        className: "videopack-color-flex-row",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
          className: "videopack-color-flex-item",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Play Button Icon', 'video-embed-thumbnail-generator'),
            value: play_button_color,
            onChange: value => setAttributes({
              play_button_color: value
            }),
            colors: THEME_COLORS,
            fallbackValue: colorFallbacks.play_button_color
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
          className: "videopack-color-flex-item",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Play Button Accent', 'video-embed-thumbnail-generator'),
            value: play_button_secondary_color,
            onChange: value => setAttributes({
              play_button_secondary_color: value
            }),
            colors: THEME_COLORS,
            fallbackValue: colorFallbacks.play_button_secondary_color
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
          className: "videopack-color-flex-item",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Control Bar Background', 'video-embed-thumbnail-generator'),
            value: control_bar_bg_color,
            onChange: value => setAttributes({
              control_bar_bg_color: value
            }),
            colors: THEME_COLORS,
            fallbackValue: colorFallbacks.control_bar_bg_color
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
          className: "videopack-color-flex-item",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Control Bar Icons', 'video-embed-thumbnail-generator'),
            value: control_bar_color,
            onChange: value => setAttributes({
              control_bar_color: value
            }),
            colors: THEME_COLORS,
            fallbackValue: colorFallbacks.control_bar_color
          })
        })]
      })]
    }), showPaginationSettings && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
      className: "videopack-color-section",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
        className: "videopack-settings-section-title",
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Pagination', 'video-embed-thumbnail-generator')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
        className: "videopack-color-flex-row is-pagination",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
          className: "videopack-color-flex-item",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Outline/Text', 'video-embed-thumbnail-generator'),
            value: pagination_color,
            onChange: value => setAttributes({
              pagination_color: value
            }),
            colors: THEME_COLORS,
            fallbackValue: colorFallbacks.pagination_color
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
          className: "videopack-color-flex-item",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Background', 'video-embed-thumbnail-generator'),
            value: pagination_background_color,
            onChange: value => setAttributes({
              pagination_background_color: value
            }),
            colors: THEME_COLORS,
            fallbackValue: colorFallbacks.pagination_background_color
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
          className: "videopack-color-flex-item",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Active Background', 'video-embed-thumbnail-generator'),
            value: pagination_active_bg_color,
            onChange: value => setAttributes({
              pagination_active_bg_color: value
            }),
            colors: THEME_COLORS,
            fallbackValue: colorFallbacks.pagination_active_bg_color
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
          className: "videopack-color-flex-item",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Active Text', 'video-embed-thumbnail-generator'),
            value: pagination_active_color,
            onChange: value => setAttributes({
              pagination_active_color: value
            }),
            colors: THEME_COLORS,
            fallbackValue: colorFallbacks.pagination_active_color
          })
        })]
      })]
    })]
  });
}

/***/ },

/***/ 6506
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ CollectionFilterSettings)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6427);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7723);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2023);
/* harmony import */ var _wordpress_html_entities__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(8537);
/* harmony import */ var _wordpress_html_entities__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_html_entities__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(790);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__);





function CollectionFilterSettings({
  attributes,
  setAttributes,
  queryData
}) {
  const {
    gallery_exclude,
    gallery_include
  } = attributes;
  const {
    excludedVideos
  } = queryData;
  if (!excludedVideos || excludedVideos.length === 0) {
    return null;
  }
  const handleUnexcludeItem = idToRestore => {
    const currentExclude = gallery_exclude ? gallery_exclude.split(',').map(id => parseInt(id.trim(), 10)) : [];
    const newGalleryExclude = currentExclude.filter(id => id !== idToRestore).join(',');
    let newGalleryInclude = gallery_include;
    if (gallery_include) {
      const currentInclude = gallery_include.split(',').map(id => parseInt(id.trim(), 10));
      if (!currentInclude.includes(idToRestore)) {
        currentInclude.push(idToRestore);
        newGalleryInclude = currentInclude.join(',');
      }
    }
    setAttributes({
      gallery_exclude: newGalleryExclude,
      gallery_include: newGalleryInclude
    });
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("div", {
    className: "videopack-excluded-videos",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("p", {
      children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Excluded Videos', 'video-embed-thumbnail-generator')
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("div", {
      className: "videopack-excluded-list",
      children: excludedVideos.map(video => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("div", {
        className: "videopack-excluded-item",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("div", {
          className: "videopack-excluded-thumbnail",
          children: video.meta?.['_videopack-meta']?.poster ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("img", {
            src: video.meta['_videopack-meta'].poster,
            alt: (0,_wordpress_html_entities__WEBPACK_IMPORTED_MODULE_3__.decodeEntities)(video.title.rendered)
          }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Icon, {
            icon: "format-video"
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("span", {
          className: "videopack-excluded-title",
          children: (0,_wordpress_html_entities__WEBPACK_IMPORTED_MODULE_3__.decodeEntities)(video.title.rendered)
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .A,
          onClick: () => handleUnexcludeItem(video.id),
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Restore', 'video-embed-thumbnail-generator'),
          className: "videopack-restore-item",
          showTooltip: true
        })]
      }, video.id))
    })]
  });
}

/***/ },

/***/ 8806
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ CollectionInspectorControls)
/* harmony export */ });
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7143);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6427);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(7723);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _CollectionSettingsPanel__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(6188);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(790);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__);





/**
 * Shared Inspector controls for Videopack collections.
 * Used by both the Collection parent block and the Video Loop child block.
 *
 * @param {Object}   root0                    Component props.
 * @param {string}   root0.clientId           Block client ID.
 * @param {Object}   root0.attributes         Block attributes.
 * @param {Function} root0.setAttributes      Attribute setter.
 * @param {Object}   root0.queryData          Query data.
 * @param {Object}   root0.options            Global options.
 * @param {boolean}  root0.hasPaginationBlock Whether the block has pagination.
 * @param {boolean}  root0.isEditingAllPages  Whether all pages are being edited.
 */

function CollectionInspectorControls({
  clientId,
  // The collection block's clientId
  attributes,
  setAttributes,
  queryData,
  options,
  hasPaginationBlock,
  isEditingAllPages
}) {
  const {
    layout = 'grid',
    columns = 3
  } = attributes;
  const {
    showPaginationSettings,
    showTitleSettings,
    showPlayerSettings,
    showSkinSettings
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.useSelect)(select => {
    const {
      getBlocks
    } = select('core/block-editor');
    const blocks = getBlocks(clientId) || [];
    const findBlockRecursive = (blockList, name) => {
      for (const block of blockList) {
        if (block.name === name) {
          return block;
        }
        if (block.innerBlocks && block.innerBlocks.length > 0) {
          const found = findBlockRecursive(block.innerBlocks, name);
          if (found) {
            return found;
          }
        }
      }
      return null;
    };
    const hasPagination = blocks.some(b => b.name === 'videopack/pagination');
    const thumbnailBlock = findBlockRecursive(blocks, 'videopack/thumbnail');
    const isLightbox = thumbnailBlock?.attributes?.linkTo === 'lightbox';

    // Check if specific blocks are INSIDE the thumbnail block
    const hasOverlayBlockInsideThumbnail = thumbnailBlock?.innerBlocks?.some(b => ['videopack/title', 'videopack/duration', 'videopack/view-count'].includes(b.name)) || false;
    const canShowTitle = isLightbox || hasOverlayBlockInsideThumbnail;
    const canShowPlayer = isLightbox;
    const canShowPagination = hasPagination;
    return {
      showPaginationSettings: canShowPagination,
      showTitleSettings: canShowTitle,
      showPlayerSettings: canShowPlayer,
      showSkinSettings: canShowTitle || canShowPlayer || canShowPagination
    };
  }, [clientId]);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("div", {
    className: "videopack-inspector-controls",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Layout Settings', 'video-embed-thumbnail-generator'),
      children: [attributes.gallery_source === 'manual' && hasPaginationBlock && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.ToggleControl, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Edit All Pages', 'video-embed-thumbnail-generator'),
        help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Show all videos in the collection at once for easier reordering.', 'video-embed-thumbnail-generator'),
        checked: isEditingAllPages,
        onChange: value => setAttributes({
          isEditingAllPages: value
        }),
        __nextHasNoMarginBottom: true
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.SelectControl, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Layout', 'video-embed-thumbnail-generator'),
        value: layout,
        options: [{
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Grid', 'video-embed-thumbnail-generator'),
          value: 'grid'
        }, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('List', 'video-embed-thumbnail-generator'),
          value: 'list'
        }],
        onChange: value => setAttributes({
          layout: value
        })
      }), layout === 'grid' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.RangeControl, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Columns', 'video-embed-thumbnail-generator'),
        value: columns,
        onChange: value => setAttributes({
          columns: value
        }),
        min: 1,
        max: 6
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_CollectionSettingsPanel__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, {
      attributes: attributes,
      setAttributes: setAttributes,
      queryData: queryData,
      options: options,
      showGalleryOptions: true,
      showPaginationToggle: false,
      showLayoutSettings: false,
      showPaginationSettings: showPaginationSettings,
      showTitleSettings: showTitleSettings,
      showPlayerSettings: showPlayerSettings,
      showSkinSettings: showSkinSettings,
      hasPaginationBlock: hasPaginationBlock,
      clientId: clientId
    })]
  });
}

/***/ },

/***/ 906
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ CollectionLayoutSettings)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6427);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7723);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(790);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__);



function CollectionLayoutSettings({
  attributes,
  setAttributes,
  options = {}
}) {
  const {
    gallery_columns,
    overlay_title,
    gallery_end
  } = attributes;
  const updateNumericAttribute = (name, value) => {
    const parsedValue = parseInt(value, 10);
    setAttributes({
      [name]: isNaN(parsedValue) ? undefined : parsedValue
    });
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Max Columns', 'video-embed-thumbnail-generator'),
      type: "number",
      value: gallery_columns ?? '',
      onChange: val => updateNumericAttribute('gallery_columns', val)
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
      __nextHasNoMarginBottom: true,
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Title overlay', 'video-embed-thumbnail-generator'),
      onChange: val => setAttributes({
        overlay_title: val
      }),
      checked: overlay_title ?? !!options.overlay_title
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SelectControl, {
      __nextHasNoMarginBottom: true,
      __next40pxDefaultSize: true,
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('When current video ends', 'video-embed-thumbnail-generator'),
      value: gallery_end,
      onChange: val => setAttributes({
        gallery_end: val
      }),
      options: [{
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Stop and leave popup window open', 'video-embed-thumbnail-generator'),
        value: ''
      }, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Autoplay next video', 'video-embed-thumbnail-generator'),
        value: 'next'
      }, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Close popup window', 'video-embed-thumbnail-generator'),
        value: 'close'
      }]
    })]
  });
}

/***/ },

/***/ 8520
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ CollectionQuerySettings)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6427);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7723);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6087);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(7143);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(4997);
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blocks__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _assets_icon__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(9427);
/* harmony import */ var _QuerySettings__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(1664);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(790);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__);








function CollectionQuerySettings({
  attributes,
  setAttributes,
  queryData,
  options = {},
  showManualSource = true,
  isSiteEditor = false,
  hasPaginationBlock = true,
  clientId
}) {
  const {
    insertBlock
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_3__.useDispatch)('core/block-editor');
  const {
    gallery_source,
    gallery_include,
    gallery_orderby,
    gallery_order,
    gallery_per_page,
    enable_collection_video_limit,
    collection_video_limit,
    gallery_pagination
  } = attributes;
  const baseGalleryOrderbyOptions = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useMemo)(() => [{
    value: 'post_date',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Date', 'video-embed-thumbnail-generator')
  }, {
    value: 'menu_order',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Default', 'video-embed-thumbnail-generator')
  }, {
    value: 'title',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Title', 'video-embed-thumbnail-generator')
  }, {
    value: 'rand',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Random', 'video-embed-thumbnail-generator')
  }, {
    value: 'ID',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Video ID', 'video-embed-thumbnail-generator')
  }], []);
  const orderbyOptions = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useMemo)(() => {
    if (gallery_include) {
      return [...baseGalleryOrderbyOptions, {
        value: 'include',
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Manually Sorted', 'video-embed-thumbnail-generator')
      }];
    }
    return baseGalleryOrderbyOptions;
  }, [gallery_include, baseGalleryOrderbyOptions]);
  const updateNumericAttribute = (name, value) => {
    const parsedValue = parseInt(value, 10);
    setAttributes({
      [name]: isNaN(parsedValue) ? undefined : parsedValue
    });
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_QuerySettings__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .A, {
      attributes: attributes,
      setAttributes: setAttributes,
      queryData: queryData,
      showArchiveSource: isSiteEditor,
      showManualSource: showManualSource
    }), gallery_source === 'archive' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Prioritize Post Data', 'video-embed-thumbnail-generator'),
      help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Use the title and date from the original post instead of the video attachment.', 'video-embed-thumbnail-generator'),
      checked: !!attributes.prioritizePostData,
      onChange: val => setAttributes({
        prioritizePostData: val
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
      className: "videopack-sort-control-wrapper",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SelectControl, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Sort by', 'video-embed-thumbnail-generator'),
        value: gallery_orderby,
        onChange: val => setAttributes({
          gallery_orderby: val
        }),
        options: orderbyOptions
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        icon: gallery_order === 'asc' ? _assets_icon__WEBPACK_IMPORTED_MODULE_5__/* .sortAscending */ .V0 : _assets_icon__WEBPACK_IMPORTED_MODULE_5__/* .sortDescending */ .L8,
        label: gallery_order === 'asc' ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Ascending', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Descending', 'video-embed-thumbnail-generator'),
        onClick: () => setAttributes({
          gallery_order: gallery_order === 'asc' ? 'desc' : 'asc'
        }),
        showTooltip: true
      })]
    }), !!gallery_pagination || !!hasPaginationBlock ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Number of videos per page', 'video-embed-thumbnail-generator'),
      type: "number",
      value: gallery_per_page ?? '',
      placeholder: options.gallery_per_page,
      onChange: val => updateNumericAttribute('gallery_per_page', val)
    }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.Fragment, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
        __nextHasNoMarginBottom: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Limit number of videos', 'video-embed-thumbnail-generator'),
        checked: !!enable_collection_video_limit,
        onChange: val => {
          const updates = {
            enable_collection_video_limit: val
          };
          if (!val) {
            updates.collection_video_limit = -1;
          } else if (Number(collection_video_limit) === -1) {
            updates.collection_video_limit = 12;
          }
          setAttributes(updates);
        }
      }), !!enable_collection_video_limit && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
        __nextHasNoMarginBottom: true,
        __next40pxDefaultSize: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Video Limit', 'video-embed-thumbnail-generator'),
        help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Maximum number of videos to show when pagination is disabled.', 'video-embed-thumbnail-generator'),
        type: "number",
        value: Number(collection_video_limit) === -1 ? 12 : collection_video_limit ?? '',
        onChange: val => updateNumericAttribute('collection_video_limit', val)
      })]
    }), !hasPaginationBlock && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
      __nextHasNoMarginBottom: true,
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Enable Pagination', 'video-embed-thumbnail-generator'),
      help: clientId ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Adds a Pagination block to the collection.', 'video-embed-thumbnail-generator') : undefined,
      checked: !!gallery_pagination,
      onChange: val => {
        setAttributes({
          gallery_pagination: val
        });
        // In the block editor, pagination display is driven by
        // an actual videopack/pagination child block, not just
        // this attribute — insert one so the toggle produces
        // visible controls. Classic Embed has no block tree
        // (no clientId), so it keeps the attribute-only behavior.
        if (val && clientId) {
          insertBlock((0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_4__.createBlock)('videopack/pagination'), undefined, clientId);
        }
      }
    })]
  });
}

/***/ },

/***/ 6188
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ CollectionSettingsPanel)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6427);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7723);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _CollectionQuerySettings__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8520);
/* harmony import */ var _CollectionFilterSettings__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(6506);
/* harmony import */ var _CollectionLayoutSettings__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(906);
/* harmony import */ var _CollectionColorSettings__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(6967);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(790);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__);








function CollectionSettingsPanel({
  attributes,
  setAttributes,
  queryData = {},
  options = {},
  showGalleryOptions = false,
  isSiteEditor = false,
  blockType = 'gallery',
  showManualSource = true,
  showLayoutSettings = true,
  showPaginationSettings = true,
  showTitleSettings = true,
  showPlayerSettings = true,
  showSkinSettings = true,
  hasPaginationBlock = true,
  clientId
}) {
  const {
    excludedVideos
  } = queryData;
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelBody, {
      title: showGalleryOptions ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Query Settings', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('List Settings', 'video-embed-thumbnail-generator'),
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_CollectionQuerySettings__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .A, {
        attributes: attributes,
        setAttributes: setAttributes,
        queryData: queryData,
        options: options,
        showManualSource: showManualSource,
        isSiteEditor: isSiteEditor,
        hasPaginationBlock: hasPaginationBlock,
        clientId: clientId
      }), excludedVideos && excludedVideos.length > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_CollectionFilterSettings__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, {
        attributes: attributes,
        setAttributes: setAttributes,
        queryData: queryData
      })]
    }), showLayoutSettings && showGalleryOptions && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Layout Settings', 'video-embed-thumbnail-generator'),
      initialOpen: showGalleryOptions,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_CollectionLayoutSettings__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .A, {
        attributes: attributes,
        setAttributes: setAttributes,
        options: options
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Colors', 'video-embed-thumbnail-generator'),
      initialOpen: true,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_CollectionColorSettings__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .A, {
        attributes: attributes,
        setAttributes: setAttributes,
        options: options,
        blockType: blockType,
        showPaginationSettings: showPaginationSettings,
        showTitleSettings: showTitleSettings,
        showPlayerSettings: showPlayerSettings,
        showSkinSettings: showSkinSettings
      })
    })]
  });
}

/***/ },

/***/ 1664
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ QuerySettings)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6427);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7723);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_html_entities__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8537);
/* harmony import */ var _wordpress_html_entities__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_html_entities__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(6087);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(1455);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(790);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__);






function QuerySettings({
  attributes,
  setAttributes,
  queryData,
  showManualSource = true
}) {
  const {
    gallery_source,
    gallery_id,
    gallery_category,
    gallery_tag
  } = attributes;
  const {
    categories,
    tags,
    debouncedSetSearchString,
    searchResults,
    isResolvingSearch
  } = queryData;
  const [currentPost, setCurrentPost] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(null);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    if (!gallery_id) {
      setCurrentPost(null);
      return;
    }

    // If we already have the correct post, don't fetch again
    if (currentPost && currentPost.id === gallery_id) {
      return;
    }

    // Check if it's in the search results
    const found = (searchResults || []).find(res => res.id === gallery_id);
    if (found) {
      setCurrentPost(found);
      return;
    }

    // Fetch from the search endpoint to support all post types
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_4___default()({
      path: `/wp/v2/search?include=${gallery_id}&type=post`
    }).then(results => {
      if (results && results.length > 0) {
        setCurrentPost({
          id: results[0].id,
          title: {
            rendered: results[0].title?.rendered || results[0].title || ''
          }
        });
      }
    }).catch(() => {
      setCurrentPost({
        id: gallery_id,
        title: {
          rendered: `#${gallery_id}`
        }
      });
    });
  }, [gallery_id, searchResults, currentPost]);
  const mapTermsToOptions = terms => {
    if (!terms) {
      return [];
    }
    return terms.map(term => ({
      label: term.name,
      value: term.id
    }));
  };
  const optionsForSelect = [];
  if (currentPost) {
    optionsForSelect.push({
      value: String(currentPost.id),
      label: (0,_wordpress_html_entities__WEBPACK_IMPORTED_MODULE_2__.decodeEntities)(currentPost.title.rendered)
    });
  }
  if (searchResults) {
    searchResults.forEach(post => {
      if (!optionsForSelect.find(o => String(o.value) === String(post.id))) {
        optionsForSelect.push({
          value: String(post.id),
          label: (0,_wordpress_html_entities__WEBPACK_IMPORTED_MODULE_2__.decodeEntities)(post.title.rendered)
        });
      }
    });
  }
  const attributeChangeFactory = (attributeName, isNumeric = false) => {
    return newValue => {
      let valueToSet = newValue;
      if (isNumeric) {
        const parsedValue = parseInt(newValue, 10);
        valueToSet = isNaN(parsedValue) ? undefined : parsedValue;
      }
      setAttributes({
        [attributeName]: valueToSet
      });
    };
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SelectControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Source', 'video-embed-thumbnail-generator'),
      value: gallery_source,
      options: [{
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Current Post', 'video-embed-thumbnail-generator'),
        value: 'current'
      }, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Other Post', 'video-embed-thumbnail-generator'),
        value: 'custom'
      }, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Category', 'video-embed-thumbnail-generator'),
        value: 'category'
      }, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Tag', 'video-embed-thumbnail-generator'),
        value: 'tag'
      }, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Inherit from Global Query', 'video-embed-thumbnail-generator'),
        value: 'archive'
      }, showManualSource && {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Manual', 'video-embed-thumbnail-generator'),
        value: 'manual'
      }].filter(Boolean),
      onChange: value => {
        const newAttributes = {
          gallery_source: value
        };
        if (value !== 'custom' && value !== 'manual') {
          newAttributes.gallery_id = 0;
        }
        if (value !== 'manual') {
          newAttributes.gallery_include = '';
        }
        setAttributes(newAttributes);
      }
    }), gallery_source === 'custom' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ComboboxControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Search Posts', 'video-embed-thumbnail-generator'),
      value: gallery_id ? String(gallery_id) : '',
      options: optionsForSelect,
      onFilterValueChange: debouncedSetSearchString,
      onChange: newValue => setAttributes({
        gallery_id: newValue ? parseInt(newValue, 10) : undefined
      }),
      help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Start typing to search for a post or page.', 'video-embed-thumbnail-generator'),
      allowReset: true,
      isLoading: isResolvingSearch
    }), gallery_source === 'category' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SelectControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Select Category', 'video-embed-thumbnail-generator'),
      value: gallery_category,
      options: [{
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Select…', 'video-embed-thumbnail-generator'),
        value: ''
      }, ...mapTermsToOptions(categories)],
      onChange: attributeChangeFactory('gallery_category')
    }), gallery_source === 'tag' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SelectControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Select Tag', 'video-embed-thumbnail-generator'),
      value: gallery_tag,
      options: [{
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Select…', 'video-embed-thumbnail-generator'),
        value: ''
      }, ...mapTermsToOptions(tags)],
      onChange: attributeChangeFactory('gallery_tag')
    })]
  });
}

/***/ },

/***/ 3830
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7723);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6427);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_media_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6480);
/* harmony import */ var _wordpress_media_utils__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_media_utils__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(2023);
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(7809);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(790);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__);





const TextTracks = ({
  tracks = [],
  onChange
}) => {
  const updateTrack = (index, newValues) => {
    const newTracks = [...tracks];
    newTracks[index] = {
      ...newTracks[index],
      ...newValues
    };
    onChange(newTracks);
  };
  const removeTrack = index => {
    const newTracks = tracks.filter((_, i) => i !== index);
    onChange(newTracks);
  };
  const addTrack = track => {
    const newTracks = [...tracks, track];
    onChange(newTracks);
  };
  const handleMediaSelect = media => {
    addTrack({
      src: media.url,
      kind: 'subtitles',
      srclang: '',
      label: media.title || '',
      default: false
    });
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelBody, {
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Text Tracks', 'video-embed-thumbnail-generator'),
    initialOpen: false,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
      className: "videopack-text-tracks-list",
      children: tracks.map((track, index) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
        className: "videopack-text-track-item",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
          className: "videopack-text-track-header",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("span", {
            className: "videopack-text-track-label",
            children: track.label || track.src.split('/').pop() || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Untitled Track', 'video-embed-thumbnail-generator')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
            icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A,
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Remove Track', 'video-embed-thumbnail-generator'),
            onClick: () => removeTrack(index),
            isDestructive: true,
            className: "videopack-remove-track"
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
          className: "videopack-text-track-settings",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
            className: "videopack-text-track-settings-row",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TextControl, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Source URL', 'video-embed-thumbnail-generator'),
              value: track.src,
              onChange: value => updateTrack(index, {
                src: value
              }),
              __nextHasNoMarginBottom: true
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
            className: "videopack-text-track-settings-row videopack-text-track-settings-row-split",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.SelectControl, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Kind', 'video-embed-thumbnail-generator'),
              value: track.kind,
              options: [{
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Subtitles', 'video-embed-thumbnail-generator'),
                value: 'subtitles'
              }, {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Captions', 'video-embed-thumbnail-generator'),
                value: 'captions'
              }, {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Descriptions', 'video-embed-thumbnail-generator'),
                value: 'descriptions'
              }, {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Chapters', 'video-embed-thumbnail-generator'),
                value: 'chapters'
              }, {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Metadata', 'video-embed-thumbnail-generator'),
                value: 'metadata'
              }],
              onChange: value => updateTrack(index, {
                kind: value
              }),
              __nextHasNoMarginBottom: true
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TextControl, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Language', 'video-embed-thumbnail-generator'),
              value: track.srclang,
              onChange: value => updateTrack(index, {
                srclang: value
              }),
              placeholder: "en",
              __nextHasNoMarginBottom: true
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
            className: "videopack-text-track-settings-row",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TextControl, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Label', 'video-embed-thumbnail-generator'),
              value: track.label,
              onChange: value => updateTrack(index, {
                label: value
              }),
              placeholder: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('e.g. English Subtitles', 'video-embed-thumbnail-generator'),
              __nextHasNoMarginBottom: true
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelRow, {
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.ToggleControl, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Default', 'video-embed-thumbnail-generator'),
              checked: track.default,
              onChange: value => {
                // If setting to true, uncheck others (only one default per track set)
                const newTracks = tracks.map((t, i) => ({
                  ...t,
                  default: i === index ? value : false
                }));
                onChange(newTracks);
              },
              __nextHasNoMarginBottom: true
            })
          })]
        })]
      }, index))
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
      className: "videopack-text-tracks-actions",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_media_utils__WEBPACK_IMPORTED_MODULE_2__.MediaUpload, {
        onSelect: handleMediaSelect,
        allowedTypes: ['text/vtt', 'application/vtt', 'text/plain'] // VTT files often detected as text/plain
        ,
        render: ({
          open
        }) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
          variant: "secondary",
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .A,
          onClick: open,
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Add from Library', 'video-embed-thumbnail-generator')
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
        variant: "tertiary",
        onClick: () => addTrack({
          src: '',
          kind: 'subtitles',
          srclang: '',
          label: '',
          default: false
        }),
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Add URL', 'video-embed-thumbnail-generator')
      })]
    })]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (TextTracks);
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "A", 0, /* export default binding */ __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ ]);


/***/ },

/***/ 8814
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6427);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7143);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2619);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(6087);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_media_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(6480);
/* harmony import */ var _wordpress_media_utils__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_media_utils__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(1455);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(7723);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _api_thumbnails__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(2186);
/* harmony import */ var _api_jobs__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(104);
/* harmony import */ var _utils_video_capture__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(266);
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(9383);
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(1152);
/* harmony import */ var _VideoPlayerInner__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(9349);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(790);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__);
/* global videopack_config */














const Thumbnails = ({
  setAttributes,
  attributes,
  videoData,
  options = {},
  parentId = 0,
  src: propSrc,
  isProbing,
  probedMetadata
}) => {
  const {
    id,
    poster: rawPoster
  } = attributes;
  const resolvedPoster = videoData?.record?.videopack?.poster || videoData?.record?.meta?.['_videopack-meta']?.poster || rawPoster;
  const src = propSrc || attributes.src;
  const total_thumbnails = attributes.total_thumbnails || videoData?.record?.total_thumbnails || options.total_thumbnails;
  const thumbVideoPanel = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useRef)();
  const videoRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useRef)();
  const modalVideoRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useRef)();
  const posterImageButton = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useRef)();
  const [isPlaying, setIsPlaying] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(false);
  const [isOpened, setIsOpened] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(false);
  const [currentTime, setCurrentTime] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(false);
  const [thumbChoices, setThumbChoices] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)([]);
  const [isSaving, setIsSaving] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(false);
  const [isModalOpen, setIsModalOpen] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(false);
  const [activeJobs, setActiveJobs] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)([]);
  const [showFailedNotice, setShowFailedNotice] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(true);

  // Poll for active thumbnail jobs if any exist
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    let pollInterval;
    const checkJobs = async () => {
      try {
        const jobs = await (0,_api_jobs__WEBPACK_IMPORTED_MODULE_8__/* .listJobs */ .N6)(id);
        const activeThumbnailJobs = jobs.filter(job => job.format_id === 'thumbnail' && ['queued', 'processing', 'encoding'].includes(job.status));
        setActiveJobs(activeThumbnailJobs);
      } catch (error) {
        console.error('Error polling jobs:', error);
      }
    };
    if (id) {
      checkJobs();
      pollInterval = setInterval(checkJobs, 10000); // Poll every 10 seconds
    }
    return () => clearInterval(pollInterval);
  }, [id]);
  const {
    active_encoder = 'ffmpeg'
  } = options;
  const activeEncoderReady = (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__.applyFilters)('videopack.encoder.is_ready', !!videopack_config.isTranscodingServiceReady, active_encoder, options);
  const effectiveFfmpegExists = active_encoder !== 'ffmpeg' && activeEncoderReady || !!videopack_config.ffmpeg_exists && videopack_config.ffmpeg_exists !== 'notinstalled';
  const ffmpegExists = effectiveFfmpegExists;
  const {
    editPost
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useDispatch)('core/editor') || {};
  // player/edit.js and player-container/edit.js both pass a videoData that
  // has no real .edit()/.save() (just a read-only record + a purely local
  // setRecord override), so the save below always takes the raw apiFetch
  // path — which writes to the server fine but never touches the `core`
  // data store, so nothing reading this attachment via getEntityRecord
  // (this block's own poster, other blocks on the same page, etc) knows to
  // re-render until a full reload re-fetches everything. Invalidating the
  // cached resolution after a successful save tells every mounted
  // useSelect consumer of this exact attachment to refetch and pick up the
  // change on its own.
  const {
    invalidateResolution
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useDispatch)('core');
  const isEditingAttachment = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => select('core/editor')?.getCurrentPostType() === 'attachment', []);
  const featured = (() => {
    if (attributes.featured !== undefined) {
      return attributes.featured;
    }
    if (videoData?.record?.featured !== undefined) {
      return videoData.record.featured;
    }
    if (videoData?.record?.meta?.['_videopack-meta']?.featured !== undefined) {
      return videoData.record.meta['_videopack-meta'].featured;
    }
    return options.featured;
  })();
  const VIDEO_POSTER_ALLOWED_MEDIA_TYPES = ['image'];
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    if (window.mejs && window.mejs.players && resolvedPoster) {
      // Find the MediaElement.js player within the media modal
      const mejsContainer = document.querySelector('.media-modal .mejs-container, .wp_attachment_holder .mejs-container');
      if (mejsContainer) {
        const mejsId = mejsContainer.id;
        if (mejsId && window.mejs.players[mejsId]) {
          const player = window.mejs.players[mejsId];
          player.setPoster(resolvedPoster);
        }
      }
    }
  }, [resolvedPoster]);
  function onSelectPoster(image) {
    const cleanUrl = image.url ? image.url.replace(/&amp;/g, '&') : '';
    const attachment = videoData?.record;
    const attachmentPoster = attachment?.videopack?.poster || attachment?.meta?.['_videopack-meta']?.poster || '';
    const attachmentPosterId = attachment?.meta?.['_videopack-meta']?.poster_id || attachment?.meta?.['_kgflashmediaplayer-poster-id'] || 0;
    const finalPoster = cleanUrl && cleanUrl !== attachmentPoster ? cleanUrl : undefined;
    const finalPosterId = image.id && Number(image.id) !== Number(attachmentPosterId) ? Number(image.id) : undefined;
    setAttributes({
      ...attributes,
      poster: finalPoster,
      poster_id: finalPosterId
    });
  }
  async function onRemovePoster() {
    await setPosterData('', '', '');

    // Move focus back to the Media Upload button.
    posterImageButton.current.focus();
  }
  const handleGenerate = async (type = 'generate') => {
    setIsSaving(true);
    setThumbChoices([]);
    const browserThumbnailsEnabled = videopack_config.options.browser_thumbnails;
    if (!browserThumbnailsEnabled && !!ffmpegExists) {
      // Browser thumbnails explicitly disabled, use FFmpeg directly
      const newThumbImages = [];
      let workingId = Number(id);
      for (let i = 1; i <= Number(total_thumbnails); i++) {
        const response = await generateThumb(i, type, workingId, featured);
        if (response?.attachment_id && workingId === 0) {
          workingId = parseInt(response.attachment_id, 10) || 0;
          setAttributes({
            ...attributes,
            id: workingId
          });
        }
        const thumb = {
          src: response ? response.real_thumb_url : null,
          type: 'ffmpeg'
        };
        if (thumb.src) {
          newThumbImages.push(thumb);
          setThumbChoices([...newThumbImages]); // Update incrementally
        }
      }
      setIsSaving(false);
    } else {
      // Attempt browser-based generation
      generateThumbCanvases(type);
    }
  };
  const srcIsExternal = (() => {
    try {
      const url = new URL(src, window.location.origin);
      return url.origin !== window.location.origin;
    } catch {
      return false;
    }
  })();
  const canvasTainted = probedMetadata?.isTainted || srcIsExternal && !isProbing && !probedMetadata;
  const generateThumb = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useCallback)(async (i, type, forceId = null, forceFeatured = null, time = null) => {
    try {
      const response = await (0,_api_thumbnails__WEBPACK_IMPORTED_MODULE_7__/* .generateThumbnail */ .I6)(src, total_thumbnails, i, forceId !== null ? forceId : id, type, parentId, forceFeatured !== null ? forceFeatured : featured, time);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
    }
  }, [src, total_thumbnails, id, parentId, featured]);
  const generateThumbCanvases = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useCallback)(async type => {
    const thumbsInt = Number(total_thumbnails);
    const newThumbCanvases = [];
    let workingId = parseInt(id, 10) || 0;
    const timePoints = (0,_utils_video_capture__WEBPACK_IMPORTED_MODULE_9__/* .calculateTimecodes */ .O0)(videoRef.current.duration, thumbsInt, {
      random: type === 'random'
    });
    for (let i = 0; i < timePoints.length; i++) {
      const time = timePoints[i];
      const index = i + 1;
      let thumb;
      try {
        let canvas;
        if (!canvasTainted) {
          canvas = await (0,_utils_video_capture__WEBPACK_IMPORTED_MODULE_9__/* .captureVideoFrame */ .$R)(src, time, options?.ffmpeg_thumb_watermark || {});
        } else {
          throw new Error('Canvas tainted, skipping browser capture.');
        }
        thumb = {
          src: canvas.toDataURL(),
          type: 'canvas',
          canvasObject: canvas
        };
        newThumbCanvases.push(thumb);
        setThumbChoices([...newThumbCanvases]); // Update incrementally
      } catch (error) {
        if (!canvasTainted) {
          console.error('Error generating canvas thumbnail:', error);
        }
        if (!!ffmpegExists) {
          try {
            const response = await generateThumb(index, type, workingId, featured);
            if (response?.attachment_id && workingId === 0) {
              workingId = parseInt(response.attachment_id, 10) || 0;
              setAttributes({
                ...attributes,
                id: workingId
              });
            }
            if (response?.real_thumb_url) {
              thumb = {
                src: response.real_thumb_url,
                type: 'ffmpeg'
              };
              newThumbCanvases.push(thumb);
              setThumbChoices([...newThumbCanvases]);
            }
          } catch {
            // Silently handle FFmpeg fallback errors
          }
        }
      }
    }
    setIsSaving(false);
  }, [attributes, featured, id, options.ffmpeg_thumb_watermark, setAttributes, total_thumbnails, generateThumb, ffmpegExists, src, canvasTainted]);

  // function to toggle video playback
  const togglePlayback = (ref = videoRef) => {
    if (ref.current?.paused) {
      ref.current.play();
      setIsPlaying(true);
    } else {
      ref.current?.pause();
      setIsPlaying(false);
    }
  };
  const pauseVideo = (ref = videoRef) => {
    ref.current?.pause();
    setIsPlaying(false);
  };
  const playVideo = (ref = videoRef) => {
    ref.current?.play();
    setIsPlaying(true);
  };

  // function to handle slider changes
  const handleSliderChange = (value, ref = videoRef) => {
    if (ref.current) {
      ref.current.currentTime = value;
    }
    setCurrentTime(value);
  };
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    const handleTimeUpdate = event => {
      setCurrentTime(event.target.currentTime); // update currentTime state variable
    };
    const mainVideo = videoRef.current;
    const modalVideo = modalVideoRef.current;
    mainVideo?.addEventListener('timeupdate', handleTimeUpdate);
    modalVideo?.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      mainVideo?.removeEventListener('timeupdate', handleTimeUpdate);
      modalVideo?.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [isModalOpen]); // Re-attach when modal state changes to catch modalVideoRef

  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    if (isModalOpen && modalVideoRef.current && videoRef.current) {
      modalVideoRef.current.currentTime = videoRef.current.currentTime;
    }
  }, [isModalOpen]);
  const handleSaveThumbnail = (event, thumb) => {
    event.currentTarget.classList.add('saving');
    setIsSaving(true);
    if (thumb.type === 'ffmpeg') {
      setImgAsPoster(thumb.src);
    } else {
      setCanvasAsPoster(thumb.canvasObject);
    }
  };
  const handleSaveAllThumbnails = async () => {
    setIsSaving(true); // Show spinner for the whole operation
    const firstThumbType = thumbChoices[0]?.type; // Assuming all generated thumbs are of the same type

    if (firstThumbType === 'canvas') {
      const uploadPromises = thumbChoices.map(thumb => {
        return (0,_api_thumbnails__WEBPACK_IMPORTED_MODULE_7__/* .createThumbnailFromCanvas */ .FD)(thumb.canvasObject, id, src, parentId, featured);
      });
      try {
        await Promise.all(uploadPromises);
      } catch (error) {
        console.error('Error saving all canvas thumbnails:', error);
      }
      setThumbChoices([]);
    } else if (firstThumbType === 'ffmpeg') {
      // For FFmpeg thumbnails, send their temporary URLs to the server to be saved
      const thumbUrls = thumbChoices.map(thumb => thumb.src);
      try {
        const response = await (0,_api_thumbnails__WEBPACK_IMPORTED_MODULE_7__/* .saveAllThumbnails */ .sW)(id, thumbUrls, parentId, src, featured);
        const firstResult = response?.[0];
        if (firstResult?.attachment_id && Number(id) === 0) {
          setAttributes({
            ...attributes,
            id: Number(firstResult.attachment_id)
          });
        }
        setThumbChoices([]); // Clear choices after saving
      } catch (error) {
        console.error('Error saving all FFmpeg thumbnails:', error);
      }
    }
    setIsSaving(false); // Hide spinner after all operations complete
  };
  const setCanvasAsPoster = async canvasObject => {
    setIsSaving(true);
    try {
      const response = await (0,_api_thumbnails__WEBPACK_IMPORTED_MODULE_7__/* .createThumbnailFromCanvas */ .FD)(canvasObject, id, src, parentId, featured);
      setPosterData(response.thumb_url, response.thumb_id, response.attachment_id);
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };
  const setPosterData = async (new_poster, new_poster_id, new_attachment_id) => {
    try {
      const cleanPoster = new_poster ? new_poster.replace(/&amp;/g, '&') : '';
      const existingMeta = videoData?.record?.meta?.['_videopack-meta'] || {};
      const metaData = {
        '_kgflashmediaplayer-poster': cleanPoster || '',
        '_kgflashmediaplayer-poster-id': new_poster_id ? Number(new_poster_id) : 0,
        '_videopack-meta': {
          ...existingMeta,
          poster: cleanPoster || '',
          poster_id: new_poster_id ? Number(new_poster_id) : 0
        }
      };
      if (attributes.featured !== undefined) {
        metaData['_videopack-meta'].featured = attributes.featured;
      }
      if (videoData?.edit) {
        await videoData.edit({
          featured_media: new_poster_id ? Number(new_poster_id) : null,
          meta: metaData
        });
        await videoData.save();
      } else if (id && Number(id) > 0) {
        // Fallback for contexts without a core-data entity record (e.g. attachment details pane)
        await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_5___default()({
          path: `/wp/v2/media/${id}`,
          method: 'POST',
          data: {
            featured_media: new_poster_id ? Number(new_poster_id) : null,
            meta: metaData
          }
        });
      }
      if (featured && parentId && editPost && !isEditingAttachment) {
        editPost({
          featured_media: new_poster_id ? Number(new_poster_id) : null
        });
      }

      // Reflects this save everywhere this attachment is currently
      // rendered (this block's own preview, other blocks on the page,
      // etc) without waiting for a reload — see the comment on
      // invalidateResolution above for why this is necessary even
      // though the save itself already succeeded.
      const savedAttachmentId = Number(new_attachment_id || id);
      if (savedAttachmentId > 0) {
        invalidateResolution('getEntityRecord', ['postType', 'attachment', savedAttachmentId]);
      }

      // Refresh the media library grid to show the updated thumbnail.
      if (wp.media && wp.media.frame) {
        if (wp.media.frame.content.get() && wp.media.frame.content.get().collection) {
          const collection = wp.media.frame.content.get().collection;
          collection.props.set({
            ignore: new Date().getTime()
          });
        } else if (wp.media.frame.library) {
          // Fallback for different states of the media modal.
          wp.media.frame.library.props.set({
            ignore: new Date().getTime()
          });
        }
      }
      const finalAttributes = {
        ...attributes,
        poster: undefined,
        poster_id: undefined
      };

      // If we just created the attachment, ensure the ID is included
      if (new_attachment_id && (!id || Number(id) === 0)) {
        finalAttributes.id = Number(new_attachment_id);
      }
      setAttributes(finalAttributes);
      setThumbChoices([]);
      setIsSaving(false);
    } catch (error) {
      console.error('Error updating attachment:', error);
      setIsSaving(false);
    }
  };
  const setImgAsPoster = async thumb_url => {
    try {
      const response = await (0,_api_thumbnails__WEBPACK_IMPORTED_MODULE_7__/* .setPosterImage */ .H4)(id, thumb_url, parentId, src, featured);
      setPosterData(response.thumb_url, response.thumb_id, response.attachment_id);
    } catch (error) {
      console.error(error);
    }
  };
  const handleVideoKeyboardControl = (event, ref = videoRef) => {
    switch (event.code) {
      case 'Space':
        // spacebar
        event.preventDefault();
        event.stopPropagation();
        togglePlayback(ref);
        break;
      case 'ArrowLeft':
        // left
        event.preventDefault();
        event.stopPropagation();
        pauseVideo(ref);
        if (ref.current) {
          ref.current.currentTime = ref.current.currentTime - 0.042;
        }
        break;
      case 'ArrowRight':
        // right
        event.preventDefault();
        event.stopPropagation();
        pauseVideo(ref);
        if (ref.current) {
          ref.current.currentTime = ref.current.currentTime + 0.042;
        }
        break;
      case 'KeyJ':
        //j
        event.preventDefault();
        event.stopPropagation();
        if (isPlaying && ref.current) {
          ref.current.playbackRate = Math.max(0, ref.current.playbackRate - 1);
        }
        break;
      case 'KeyK':
        // k
        event.preventDefault();
        event.stopPropagation();
        pauseVideo(ref);
        break;
      case 'KeyL':
        //l
        event.preventDefault();
        event.stopPropagation();
        if (isPlaying && ref.current) {
          ref.current.playbackRate = ref.current.playbackRate + 1;
        }
        playVideo(ref);
        break;
      default:
      // exit this handler for other keys
    }
  };
  const handleUseThisFrame = async (ref = videoRef) => {
    setIsSaving(true);
    const runFfmpegFallback = async () => {
      if (!!ffmpegExists) {
        try {
          const response = await generateThumb(1, 'generate', null, null, ref.current.currentTime);
          if (response?.real_thumb_url) {
            await setImgAsPoster(response.real_thumb_url);
          } else {
            setIsSaving(false);
          }
        } catch {
          console.error('FFmpeg pinpoint capture failed');
          setIsSaving(false);
        }
      } else {
        setIsSaving(false);
      }
    };
    const browserThumbnailsEnabled = videopack_config.options.browser_thumbnails;
    if (!browserThumbnailsEnabled || canvasTainted) {
      await runFfmpegFallback();
      return;
    }
    try {
      const canvas = await (0,_utils_video_capture__WEBPACK_IMPORTED_MODULE_9__/* .captureVideoFrame */ .$R)(ref.current, ref.current.currentTime, options?.ffmpeg_thumb_watermark || {});
      await setCanvasAsPoster(canvas); // Pass the canvas object directly, index will be null
    } catch (error) {
      console.warn('Canvas capture failed, attempting FFmpeg fallback:', error);
      await runFfmpegFallback();
    }
  };
  const handlePopOut = event => {
    event.preventDefault();
    pauseVideo(videoRef);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    if (modalVideoRef.current && videoRef.current) {
      videoRef.current.currentTime = modalVideoRef.current.currentTime;
    }
    pauseVideo(modalVideoRef);
    setIsModalOpen(false);
  };
  const handleToggleVideoPlayer = event => {
    event.preventDefault();
    const next = !isOpened;
    setIsOpened(next);
    if (next && thumbVideoPanel.current) {
      // Trigger a small delay to ensure the panel is visible before focusing
      setTimeout(() => {
        thumbVideoPanel.current?.focus();
      }, 50);
    }
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)("div", {
    className: "videopack-thumbnail-generator",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__.__)('Thumbnails', 'video-embed-thumbnail-generator'),
      children: [showFailedNotice && Number(videoData?.record?.meta?._videopack_browser_thumb_failed) === 1 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Notice, {
        status: "error",
        onRemove: () => setShowFailedNotice(false),
        isDismissible: true,
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__.__)('Automatic in-browser thumbnail generation failed for this video (possibly due to CORS or canvas limitations). You can try generating thumbnails manually below.', 'video-embed-thumbnail-generator')
      }), resolvedPoster && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)("img", {
        className: "videopack-current-thumbnail",
        src: resolvedPoster ? resolvedPoster.replace(/&amp;/g, '&') : '',
        alt: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__.__)('Current Thumbnail', 'video-embed-thumbnail-generator')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.BaseControl, {
        className: "editor-video-poster-control",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.BaseControl.VisualLabel, {
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__.__)('Video Thumbnail', 'video-embed-thumbnail-generator')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_wordpress_media_utils__WEBPACK_IMPORTED_MODULE_4__.MediaUpload, {
          title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__.__)('Select video thumbnail', 'video-embed-thumbnail-generator'),
          onSelect: onSelectPoster,
          allowedTypes: VIDEO_POSTER_ALLOWED_MEDIA_TYPES,
          render: ({
            open
          }) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
            variant: "secondary",
            onClick: open,
            ref: posterImageButton,
            children: !resolvedPoster ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__.__)('Select', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__.__)('Replace', 'video-embed-thumbnail-generator')
          })
        }), !!resolvedPoster && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
          onClick: onRemovePoster,
          variant: "tertiary",
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__.__)('Remove', 'video-embed-thumbnail-generator')
        })]
      }), activeJobs.length > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsxs)("div", {
        className: "videopack-active-jobs",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Spinner, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)("p", {
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__.__)('Thumbnail generation in progress…', 'video-embed-thumbnail-generator')
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__.__)("Set as post's featured image", 'video-embed-thumbnail-generator'),
        checked: !!featured,
        onChange: value => {
          setAttributes({
            ...attributes,
            featured: value
          });
        }
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsxs)("div", {
        className: "videopack-generation-controls",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.__experimentalNumberControl, {
          value: total_thumbnails,
          min: 1,
          max: 100,
          onChange: value => {
            if (isNaN(value) || value < 1) {
              setAttributes({
                ...attributes,
                total_thumbnails: 1
              });
            } else {
              setAttributes({
                ...attributes,
                total_thumbnails: Number(value)
              });
            }
          },
          className: "videopack-total-thumbnails",
          disabled: isSaving || (canvasTainted || isProbing) && !ffmpegExists,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__.__)('Total', 'video-embed-thumbnail-generator'),
          hideLabelFromVision: true
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsxs)("div", {
          className: "videopack-generation-actions",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
            variant: "secondary",
            onClick: () => handleGenerate('generate'),
            className: "videopack-generate",
            disabled: isSaving || (canvasTainted || isProbing) && !ffmpegExists,
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__.__)('Generate', 'video-embed-thumbnail-generator')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
            variant: "secondary",
            onClick: () => handleGenerate('random'),
            className: "videopack-generate",
            disabled: isSaving || (canvasTainted || isProbing) && !ffmpegExists,
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__.__)('Random', 'video-embed-thumbnail-generator')
          }), (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__.applyFilters)('videopack.thumbnail.actions', null, {
            id,
            src,
            parentId,
            isSaving,
            isProbing,
            ffmpegExists,
            canvasTainted,
            probedMetadata,
            options
          })]
        })]
      }), canvasTainted && !isProbing && !ffmpegExists && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)("div", {
        className: "videopack-security-error-notice",
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__.__)('Cross-origin resource sharing (CORS) policy on the external server is preventing thumbnail generation.', 'video-embed-thumbnail-generator')
      }), thumbChoices.length > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        variant: "primary",
        onClick: handleSaveAllThumbnails,
        disabled: isSaving,
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__.__)('Save All', 'video-embed-thumbnail-generator')
      }), thumbChoices.length > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)("div", {
        className: `videopack-thumbnail-holder${isSaving ? ' disabled' : ''}`,
        children: thumbChoices.map((thumb, index) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsxs)("button", {
          type: "button",
          className: 'videopack-thumbnail spinner-container',
          onClick: event => {
            handleSaveThumbnail(event, thumb, index);
          },
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)("img", {
            src: thumb.src,
            alt: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__.sprintf)(/* translators: %d is the thumbnail index */
            (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__.__)('Thumbnail %d', 'video-embed-thumbnail-generator'), index + 1),
            title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__.__)('Save and set thumbnail', 'video-embed-thumbnail-generator')
          }), isSaving && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Spinner, {})]
        }, index))
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsxs)("div", {
        className: `components-panel__body videopack-thumb-video ${isOpened ? 'is-opened' : ''}`,
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)("h2", {
          className: "components-panel__body-title",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsxs)("button", {
            className: "components-button components-panel__body-toggle",
            type: "button",
            onClick: handleToggleVideoPlayer,
            "aria-expanded": isOpened,
            disabled: (canvasTainted || isProbing) && !ffmpegExists,
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)("span", {
              "aria-hidden": "true",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Icon, {
                className: "components-panel__arrow",
                icon: isOpened ? _wordpress_icons__WEBPACK_IMPORTED_MODULE_11__/* ["default"] */ .A : _wordpress_icons__WEBPACK_IMPORTED_MODULE_10__/* ["default"] */ .A
              })
            }), (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__.__)('Choose From Video', 'video-embed-thumbnail-generator'), canvasTainted && !isProbing && !ffmpegExists && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Icon, {
              icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_11__/* ["default"] */ .A,
              style: {
                display: 'none'
              }
            })]
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)("div", {
          className: `videopack-thumb-video-container ${isOpened ? 'is-opened' : ''} ${(canvasTainted || isProbing) && !ffmpegExists ? 'disabled' : ''}`,
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_VideoPlayerInner__WEBPACK_IMPORTED_MODULE_12__/* ["default"] */ .A, {
            videoRef: videoRef,
            panelRef: thumbVideoPanel,
            src: src,
            isPlaying: isPlaying,
            currentTime: currentTime,
            isSaving: isSaving || (canvasTainted || isProbing) && !ffmpegExists,
            togglePlayback: togglePlayback,
            handleSliderChange: handleSliderChange,
            handleUseThisFrame: handleUseThisFrame,
            onPopOut: handlePopOut,
            onKeyDown: e => handleVideoKeyboardControl(e, videoRef),
            disabled: (canvasTainted || isProbing) && !ffmpegExists
          })
        })]
      }), isModalOpen && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Modal, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__.__)('Choose From Video', 'video-embed-thumbnail-generator'),
        onRequestClose: handleCloseModal,
        className: "videopack-video-modal",
        overlayClassName: "videopack-video-modal-overlay",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_VideoPlayerInner__WEBPACK_IMPORTED_MODULE_12__/* ["default"] */ .A, {
          videoRef: modalVideoRef,
          src: src,
          isPlaying: isPlaying,
          currentTime: currentTime,
          isSaving: isSaving,
          togglePlayback: togglePlayback,
          handleSliderChange: handleSliderChange,
          handleUseThisFrame: handleUseThisFrame,
          onKeyDown: e => handleVideoKeyboardControl(e, modalVideoRef),
          disabled: (canvasTainted || isProbing) && !ffmpegExists,
          isModal: true
        })
      })]
    })
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Thumbnails);
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "A", 0, /* export default binding */ __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ ]);


/***/ },

/***/ 9349
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6427);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6087);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(7723);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(2344);
/* harmony import */ var _assets_icon__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(9427);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(790);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__);






const VideoPlayerInner = ({
  videoRef,
  panelRef,
  src,
  isPlaying,
  currentTime,
  isSaving,
  togglePlayback,
  handleSliderChange,
  handleUseThisFrame,
  onPopOut,
  onKeyDown,
  isModal = false,
  disabled = false,
  onLoadedData
}) => {
  const localPanelRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)();
  const containerRef = panelRef || localPanelRef;
  const [duration, setDuration] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(videoRef.current?.duration || 0);
  const onLoadedMetadata = event => {
    setDuration(event.target.duration);
  };
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (videoRef.current?.duration) {
      setDuration(videoRef.current.duration);
    }
  }, [videoRef]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if ((isModal || containerRef === panelRef) && containerRef?.current) {
      // Trigger a small delay to ensure the panel is visible/ready before focusing
      const timer = setTimeout(() => {
        containerRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isModal, panelRef, containerRef]);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
    className: `videopack-thumb-video-panel spinner-container${isSaving ? ' saving' : ''} ${isModal ? 'is-modal' : ''} ${disabled ? 'disabled' : ''}`,
    tabIndex: 0,
    ref: containerRef,
    onKeyDown: onKeyDown,
    role: "button",
    "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Video Player', 'video-embed-thumbnail-generator'),
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("video", {
      src: src,
      ref: videoRef,
      muted: true,
      preload: "metadata",
      onClick: () => togglePlayback(videoRef),
      onLoadedMetadata: onLoadedMetadata,
      onLoadedData: onLoadedData,
      role: "button",
      "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Toggle Playback', 'video-embed-thumbnail-generator'),
      tabIndex: "-1"
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
      className: "videopack-thumb-video-controls",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        className: "videopack-play-pause",
        onClick: () => togglePlayback(videoRef),
        disabled: disabled,
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Icon, {
          icon: isPlaying ? _assets_icon__WEBPACK_IMPORTED_MODULE_4__/* .pause */ .v7 : _assets_icon__WEBPACK_IMPORTED_MODULE_4__/* .play */ .ZH
        })
      }), duration > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.RangeControl, {
        __nextHasNoMarginBottom: true,
        min: 0,
        max: duration,
        step: "any",
        initialPosition: 0,
        value: currentTime || 0,
        onChange: val => handleSliderChange(val, videoRef),
        className: "videopack-thumbvideo-slider",
        type: "slider"
      }), !isModal && onPopOut && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        className: "videopack-popout",
        onClick: onPopOut,
        icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Open in larger window', 'video-embed-thumbnail-generator'),
        showTooltip: true,
        disabled: disabled
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
      variant: "secondary",
      onClick: () => handleUseThisFrame(videoRef),
      className: "videopack-use-this-frame",
      disabled: isSaving || disabled,
      children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Use this frame', 'video-embed-thumbnail-generator')
    }), isSaving && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Spinner, {})]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (VideoPlayerInner);
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "A", 0, /* export default binding */ __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ ]);


/***/ },

/***/ 2584
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6087);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(790);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__);
/**
 * A generic HTML5 video player component.
 */



/**
 * GenericPlayer component.
 *
 * @param {Object}    props             Component props.
 * @param {string}    props.poster      URL for the video poster image.
 * @param {boolean}   props.loop        Whether the video should loop.
 * @param {boolean}   props.autoPlay    Whether the video should autoplay.
 * @param {string}    props.preload     Preload setting (auto, metadata, none).
 * @param {boolean}   props.controls    Whether to show video controls.
 * @param {boolean}   props.muted       Whether the video is muted.
 * @param {boolean}   props.playsInline Whether the video should play inline on mobile.
 * @param {string}    props.className   Additional CSS classes.
 * @param {Array}     props.sources     List of video source objects.
 * @param {string}    props.src         Primary video source URL.
 * @param {Array}     props.tracks      List of text track (label, src, kind, etc.) objects.
 * @param {React.Ref} ref               Reference to the video element.
 * @return {Element} The rendered component.
 */

const GenericPlayer = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.forwardRef)(({
  poster,
  loop,
  autoPlay,
  preload,
  controls,
  muted,
  playsInline,
  className,
  sources = [],
  src,
  tracks = [],
  onPlay,
  onPause,
  onEnded
}, ref) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("video", {
  onPlay: onPlay,
  onPause: onPause,
  onEnded: onEnded,
  poster: poster,
  loop: loop,
  autoPlay: autoPlay,
  preload: preload,
  controls: controls ? true : undefined,
  muted: muted,
  playsInline: playsInline,
  width: "100%",
  height: "100%",
  className: className,
  ref: ref,
  children: [sources.map((source, index) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("source", {
    src: source.src,
    type: source.type
  }, index)), tracks.map((track, index) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("track", {
    src: track.src,
    kind: track.kind,
    srcLang: track.srclang,
    label: track.label,
    default: track.default
  }, index)), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("a", {
    href: src,
    children: src
  })]
}));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (GenericPlayer);
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "A", 0, /* export default binding */ __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ ]);


/***/ },

/***/ 4216
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* unused harmony export VideoJS */
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6087);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(790);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__);
/**
 * A React wrapper for the Video.js player library.
 */

/* global videojs, ResizeObserver */



/**
 * Video.js React component.
 *
 * @param {Object}   props                  Component props.
 * @param {Object}   props.options          Video.js player options.
 * @param {string}   props.skin             CSS class name for the player skin.
 * @param {Function} props.onPlay           Callback for the play event.
 * @param {Function} props.onPause          Callback for the pause event.
 * @param {Function} props.onReady          Callback fired once the player is ready.
 * @param {Function} props.onMetadataLoaded Callback fired when metadata is loaded.
 */

const VideoJS = props => {
  const videoRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const playerRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const {
    options,
    skin,
    onPlay,
    onPause,
    onReady,
    onMetadataLoaded,
    onEnded
  } = props;
  const previousSkinRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(skin);
  const previousPluginsRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(options?.plugins);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    let initTimer;
    const player = playerRef.current;
    // When plugins change (e.g. resolution selector added after entity
    // record resolves), initialize the plugin on the existing player
    // rather than disposing. Disposing triggers a setTimeout reinit,
    // but by then the container is disconnected from the iframe.
    if (player && !player.isDisposed() && JSON.stringify(previousPluginsRef.current) !== JSON.stringify(options.plugins)) {
      previousPluginsRef.current = options.plugins;
      if (options.plugins && typeof player.resolutionSelector === 'function') {
        try {
          // Update sources first so the plugin sees all resolutions.
          if (options.sources && options.sources.length > 0) {
            const currentSrc = player.currentSrc();
            const newSrc = options.sources[0].src;
            if (currentSrc !== newSrc) {
              player.src(options.sources);
            }
          }
          player.resolutionSelector(options.plugins.resolutionSelector);
        } catch (e) {
          console.error('Videopack: Video.js plugin update error:', e);
        }
      }
    }

    // On initial render (or after dispose), wait for sources to be available before initializing.
    if (!player) {
      // Wrap initialization in a timeout to handle React Strict Mode double-mounts.
      // This ensures we don't init a player if the component is immediately unmounted.
      // We use a short delay (100ms) to allow layouts (like the WordPress Media Library modal)
      initTimer = setTimeout(() => {
        if (!options || !options.sources || options.sources.length === 0) {
          return; // Don't initialize until sources are ready.
        }
        if (!videoRef.current) {
          return;
        }

        // Ensure the container is empty before creating a new player.
        while (videoRef.current.firstChild) {
          videoRef.current.removeChild(videoRef.current.firstChild);
        }
        const doc = videoRef.current ? videoRef.current.ownerDocument : document;
        const win = doc.defaultView || window;
        const vjs = win.videojs || videojs;
        const videoElement = doc.createElement('video');
        videoElement.className = `video-js ${skin || ''} vjs-big-play-centered`;
        videoElement.setAttribute('playsinline', '');
        if (options.crossorigin) {
          videoElement.setAttribute('crossorigin', options.crossorigin);
        }
        videoRef.current.appendChild(videoElement);
        const playerOptions = {
          ...options,
          fluid: options.fluid !== undefined ? options.fluid : true
        };

        // Prevent error if resolutionSelector plugin is requested but not loaded in the editor.
        if (playerOptions.plugins && playerOptions.plugins.resolutionSelector && typeof vjs.getPlugin !== 'undefined' && !vjs.getPlugin('resolutionSelector')) {
          delete playerOptions.plugins.resolutionSelector;
        }
        playerRef.current = vjs(videoElement, playerOptions, function () {
          if (onReady) {
            onReady(this);
          }
          this.on('play', onPlay);
          this.on('pause', onPause);
          this.on('ended', onEnded);
          this.on('loadedmetadata', function () {
            if (typeof onMetadataLoaded === 'function') {
              onMetadataLoaded({
                width: this.videoWidth(),
                height: this.videoHeight()
              });
            }
          });
        });
      }, 250);
    } else if (player && !player.isDisposed()) {
      player.ready(function () {
        // Safeguard against missing tech (e.g. failed to load source)
        if (!player.tech(true)) {
          return;
        }

        // Update existing player options
        player.autoplay(options.autoplay);
        player.loop(options.loop);
        player.muted(options.muted);
        player.volume(options.volume);
        player.poster(options.poster);
        player.controls(options.controls);
        player.playbackRates(options.playback_rate ? [0.5, 1, 1.25, 1.5, 2] : []);
        player.preload(options.preload);
        if (previousSkinRef.current !== skin) {
          if (previousSkinRef.current) {
            player.removeClass(previousSkinRef.current);
          }
          if (skin) {
            player.addClass(skin);
          }
          previousSkinRef.current = skin;
        }

        // Only update src if it has actually changed to prevent reloading
        if (options.sources && options.sources.length > 0) {
          const currentSrc = player.currentSrc();
          const newSrc = options.sources[0].src;
          if (currentSrc !== newSrc) {
            player.src(options.sources);
          }
        }

        // Update aspect ratio if it changed
        if (options.aspectRatio && options.aspectRatio !== player.aspectRatio()) {
          player.aspectRatio(options.aspectRatio);
        }

        // Update tracks if they changed
        if (options.tracks) {
          const remoteTracks = player.remoteTextTracks();
          const currentTracks = [];
          for (let i = 0; i < remoteTracks.length; i++) {
            currentTracks.push({
              src: remoteTracks[i].src,
              kind: remoteTracks[i].kind,
              srclang: remoteTracks[i].language,
              label: remoteTracks[i].label,
              default: remoteTracks[i].default
            });
          }
          if (JSON.stringify(currentTracks) !== JSON.stringify(options.tracks)) {
            // Remove old remote tracks
            for (let i = remoteTracks.length - 1; i >= 0; i--) {
              player.removeRemoteTextTrack(remoteTracks[i]);
            }
            // Add new ones
            options.tracks.forEach(track => {
              player.addRemoteTextTrack(track, false);
            });
          }
        }
      });
    }
    return () => {
      clearTimeout(initTimer);
    };
  }, [options, skin, onPlay, onPause, onReady, onMetadataLoaded, onEnded]);

  // Dispose the player when the component unmounts
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.off('play', onPlay);
        playerRef.current.off('pause', onPause);
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [onPause, onPlay]);

  // Trigger a resize event on the player when the container's dimensions change.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    const container = videoRef.current;
    if (!container || typeof ResizeObserver === 'undefined') {
      return;
    }
    const resizeObserver = new ResizeObserver(() => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.trigger('resize');
      }
    });
    resizeObserver.observe(container);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Normalize aspect ratio from options (e.g. '16:9' -> '16 / 9') or fallback to width/height.
  let ratio = '16 / 9';
  if (options.aspectRatio) {
    ratio = options.aspectRatio.replace(':', ' / ');
  } else if (options.width && options.height) {
    ratio = `${options.width} / ${options.height}`;
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("div", {
    "data-vjs-player": true,
    ref: videoRef,
    style: {
      width: '100%',
      aspectRatio: ratio,
      overflow: 'hidden'
    }
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (VideoJS);
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "A", 0, /* export default binding */ __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ ]);


/***/ },

/***/ 730
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6087);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2619);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _hooks_useVideopackContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5633);
/* harmony import */ var _GenericPlayer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(2584);
/* harmony import */ var _VideoJs_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(4216);
/* harmony import */ var _WpMejsPlayer_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(8377);
/* harmony import */ var _Duotone_CustomDuotoneFilter__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(7221);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(790);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__);
/**
 * Main VideoPlayer component that orchestrates different player engines and UI overlays.
 */









const PLAYER_CONTEXT_CLASS_KEYS = ['skin', 'control_bar_bg_color', 'control_bar_color', 'play_button_color', 'play_button_secondary_color',
// On the frontend, Modular_Renderer::render_video_container() always
// stamps a videopack-embed-{method} class on the outer player wrapper
// (unconditionally, not gated by any classKeys scoping) — engine-specific
// stylesheets (e.g. a third-party add-on's Video.js 10 skin) key their
// title-overlay overrides off this class being present on an ancestor.
// This wrapper is the equivalent ancestor for the admin preview, so it
// needs the same class or those overrides never apply there.
'embed_method'];
const DEFAULT_PLAYERS = {
  'Video.js': _VideoJs_js__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .A,
  'WordPress Default': _WpMejsPlayer_js__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .A,
  None: _GenericPlayer_js__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A
};

// Make sure to pass isSelected from the block's edit component.
const noop = () => {};

/**
 * VideoPlayer component.
 *
 * @param {Object}   props                    Component props.
 * @param {Object}   props.attributes         Block attributes.
 * @param {Object}   props.context            Inherited block context.
 * @param {Function} props.setAttributes      Function to update block attributes.
 * @param {boolean}  props.isSelected         Whether the block is selected.
 * @param {boolean}  props.hideStaticOverlays Whether to hide site-wide static overlays (watermark, title).
 * @param {Function} props.onReady            Callback fired when the player engine is ready.
 * @param {Object}   props.children           Child components (InnerBlocks).
 * @return {Element|null} The rendered component.
 */
const VideoPlayer = ({
  attributes = {},
  context = {},
  onReady = noop,
  children,
  // Catch-all for non-DOM attributes that might leak from settings/block spreading
  ...otherProps
}) => {
  // Standardize attributes to ensure all block-level settings are here
  const blockAttributes = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => ({
    ...attributes,
    // If props are passed directly (e.g. from BlockPreview spreading), prioritize them
    ...otherProps
  }), [attributes, otherProps]);

  // Use unified context hook for all design and behavior resolution
  const {
    resolved,
    style: contextStyles,
    classes: contextClasses
  } = (0,_hooks_useVideopackContext__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Ay)(blockAttributes, context, {
    classKeys: PLAYER_CONTEXT_CLASS_KEYS
  });
  const wrapperRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const [detectedDimensions, setDetectedDimensions] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)({
    width: null,
    height: null,
    src: null // Track which src these dimensions are for
  });
  const [resetKey, setResetKey] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(0);
  const resetPlayer = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    setResetKey(prev => prev + 1);
  }, []);

  // Reset dimensions when src changes
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    const {
      src
    } = blockAttributes || {};
    if (src !== detectedDimensions.src) {
      setDetectedDimensions({
        width: null,
        height: null,
        src
      });
    }
  }, [blockAttributes, detectedDimensions.src]);

  // Handle external restart requests
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (blockAttributes?.restartCount > 0) {
      resetPlayer();
    }
  }, [blockAttributes?.restartCount, resetPlayer]);
  const onMetadataLoaded = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(dimensions => {
    if (dimensions.width === detectedDimensions.width && dimensions.height === detectedDimensions.height && blockAttributes.src === detectedDimensions.src) {
      return;
    }
    setDetectedDimensions({
      ...dimensions,
      src: blockAttributes.src
    });
  }, [detectedDimensions, blockAttributes.src, setDetectedDimensions]);
  const {
    autoplay,
    controls = true,
    loop,
    muted,
    playsinline,
    poster,
    preload,
    src,
    volume,
    auto_res,
    sources: incomingSources = [],
    source_groups: incomingSourceGroups = {},
    text_tracks = [],
    playback_rate,
    default_ratio,
    // Design settings resolved from context
    skin,
    embed_method = 'Video.js',
    duotone,
    fixed_aspect,
    fullwidth,
    loopDuotoneId,
    crossorigin
  } = resolved;
  const source_groups = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    // If we have valid groups, use them (handle empty array vs object)
    if (incomingSourceGroups && !Array.isArray(incomingSourceGroups) && Object.keys(incomingSourceGroups).length > 0) {
      return incomingSourceGroups;
    }

    // Fallback: Group flat sources by codec
    if (incomingSources.length > 0) {
      const groups = {};
      incomingSources.forEach(s => {
        const codec = s.codec || s.codecs || 'h264';
        if (!groups[codec]) {
          groups[codec] = {
            sources: [],
            label: codec.toUpperCase()
          };
        }
        groups[codec].sources.push(s);
      });
      return groups;
    }
    return {};
  }, [incomingSourceGroups, incomingSources]);
  const final_embed_method = embed_method;
  const final_skin = skin;

  // Duotone resolution
  const final_duotone = blockAttributes?.style?.color?.duotone || duotone;
  const instanceId = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    return `vp-player-${Math.random().toString(36).substr(2, 9)}`;
  }, []);
  let resolvedDuotoneClass = '';
  if (loopDuotoneId) {
    resolvedDuotoneClass = loopDuotoneId;
  } else if (typeof final_duotone === 'string' && final_duotone.startsWith('var:preset|duotone|')) {
    resolvedDuotoneClass = `wp-duotone-${final_duotone.split('|').pop()}`;
  } else if (Array.isArray(final_duotone)) {
    resolvedDuotoneClass = `videopack-custom-duotone-${instanceId}`;
  }
  const players = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_1__.applyFilters)(
  /**
   * Filters the registered admin preview player engines.
   *
   * @since 5.0.0
   *
   * @param {Object} players Object mapping player type names to React components.
   */
  'videopack_admin_players', DEFAULT_PLAYERS), []);
  const isVertical = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    let vertical = false;
    // Use browser-detected dimensions if available
    if (detectedDimensions.width && detectedDimensions.height) {
      vertical = detectedDimensions.height > detectedDimensions.width;
    } else {
      // Fallback to database metadata
      vertical = Number(resolved.height) > Number(resolved.width) || [90, 270].includes(Number(resolved.rotate));
    }
    return vertical;
  }, [detectedDimensions.width, detectedDimensions.height, resolved.width, resolved.height, resolved.rotate]);
  const isFixedAspect = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    const verticalFixed = fixed_aspect === 'vertical' && isVertical;
    const alwaysFixed = fixed_aspect === 'always';
    return (alwaysFixed || verticalFixed) && (fullwidth !== true || verticalFixed);
  }, [fixed_aspect, fullwidth, isVertical]);
  const aspectRatio = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    let ratio;
    if (isFixedAspect) {
      ratio = (default_ratio || '16 / 9').replace(/\s\/\s/g, ':');
    } else if (detectedDimensions.width && detectedDimensions.height) {
      // If we have browser-detected dimensions and they aren't forced to fixed, use them
      ratio = `${detectedDimensions.width}:${detectedDimensions.height}`;
    } else if (resolved.width && resolved.height) {
      ratio = `${resolved.width}:${resolved.height}`;
    }
    return ratio;
  }, [isFixedAspect, default_ratio, detectedDimensions.width, detectedDimensions.height, resolved.width, resolved.height]);
  const innerPlayerStyles = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    const styles = {};
    // Apply aspect ratio to the inner player if we know it (fixed or native)
    if (isFixedAspect) {
      styles.aspectRatio = default_ratio || '16 / 9';
    } else if (aspectRatio) {
      styles.aspectRatio = aspectRatio.replace(':', ' / ');
    }
    return styles;
  }, [isFixedAspect, default_ratio, aspectRatio]);
  const playerStyles = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    const styles = {
      ...contextStyles
    };
    const config = window.videopack_config || {};
    const mejsSvgPath = config.mejs_controls_svg || (typeof window !== 'undefined' ? `${window.location.origin}/wp-includes/js/mediaelement/mejs-controls.svg` : '');
    if (final_embed_method === 'WordPress Default' && mejsSvgPath) {
      styles['--videopack-mejs-controls-svg'] = `url("${mejsSvgPath}")`;
    }
    return styles;
  }, [final_embed_method, contextStyles]);
  const wrapperClasses = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    const classes = [...(typeof contextClasses === 'string' ? contextClasses.split(' ').filter(Boolean) : contextClasses), 'videopack-video-block-container', 'videopack-wrapper'];
    if (isFixedAspect || aspectRatio) {
      classes.push('videopack-has-aspect-ratio');
      if (isFixedAspect) {
        classes.push('videopack-is-fixed-aspect');
      }
    }
    if (resolvedDuotoneClass && !loopDuotoneId) {
      classes.push(resolvedDuotoneClass);
    }

    // Ensure unique classes and join
    return [...new Set(classes)].join(' ');
  }, [contextClasses, isFixedAspect, aspectRatio, resolvedDuotoneClass, loopDuotoneId]);
  const actualAutoplay = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    return autoplay;
  }, [autoplay]);
  const finalizedSources = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    // Priority 1: Sources from groups
    if (Object.keys(source_groups).length > 0) {
      const groupedSources = Object.values(source_groups).flatMap(g => g.sources || []);
      if (groupedSources.length > 0) {
        return groupedSources.filter(s => s && s.src);
      }
    }

    // Priority 2: Flat sources array
    if (incomingSources && incomingSources.length > 0) {
      return incomingSources.filter(s => s && s.src);
    }

    // Priority 3: Primary src attribute
    if (src) {
      return [{
        src,
        type: 'video/mp4'
      }];
    }
    return [];
  }, [source_groups, incomingSources, src]);

  // Only the id-based branch actually needs to react to source_groups
  // content (e.g. an async source-groups fetch landing for the same
  // attachment) — the no-id fallback (true for previews with no real
  // attachment) should stay stable for this component's whole lifetime.
  // Depending on source_groups for the fallback too meant every re-render
  // generated a brand new random string — source_groups defaults to a new
  // {} reference whenever unset, and even an unrelated settings change
  // (which recreates the context object passed in) counted as a
  // re-render — forcing Video.js to fully remount each time.
  const randomKeyRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)();
  if (!randomKeyRef.current) {
    randomKeyRef.current = Math.random().toString(36).substr(2, 9);
  }
  const uniqueKey = blockAttributes.id ? `${blockAttributes.id}-${JSON.stringify(source_groups)}` : randomKeyRef.current;
  const genericPlayerOptions = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    const config = window.videopack_config || {};
    const resolvedCrossorigin = config.with_credentials ? 'use-credentials' : crossorigin;
    return {
      poster,
      loop,
      preload,
      controls: !!controls,
      muted,
      playsInline: playsinline,
      className: 'videopack-video',
      sources: finalizedSources,
      src,
      tracks: text_tracks,
      volume,
      crossorigin: resolvedCrossorigin,
      autoPlay: final_embed_method === 'WordPress Default' ? false : actualAutoplay
    };
  }, [poster, loop, actualAutoplay, preload, controls, muted, volume, playsinline, src, finalizedSources, text_tracks, final_embed_method, crossorigin]);
  const videoJsOptions = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    const isVjs = (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_1__.applyFilters)(
    /**
     * Filters whether a specific player method should be treated as a Video.js engine.
     *
     * @since 5.0.0
     *
     * @param {boolean} isVideojs True if player method uses Video.js, false otherwise.
     * @param {string}  method    The selected player method name.
     */
    'videopack_is_videojs_player', final_embed_method === 'Video.js', final_embed_method);
    if (!isVjs) {
      return null;
    }
    const config = window.videopack_config || {};
    const resolvedCrossorigin = config.with_credentials ? 'use-credentials' : crossorigin;
    const options = {
      autoplay: actualAutoplay,
      controls,
      fluid: !aspectRatio,
      // Use fluid if no ratio specified
      fill: !!aspectRatio,
      // Use fill if we have a ratio (handled by CSS)
      responsive: true,
      aspectRatio,
      muted,
      preload,
      poster,
      loop,
      playsinline,
      volume,
      crossorigin: resolvedCrossorigin,
      playbackRates: playback_rate ? [0.5, 1, 1.25, 1.5, 2] : [],
      sources: finalizedSources.map(s => ({
        src: s.src,
        type: s.type,
        resolution: s.resolution
      })),
      tracks: text_tracks.map(t => ({
        src: t.src,
        kind: t.kind,
        srclang: t.srclang,
        label: t.label,
        default: t.default
      }))
    };
    options.source_groups = source_groups;
    const hasMultipleSources = finalizedSources.length > 1;
    const hasResolutions = finalizedSources.some(s => s.resolution || s['data-res']);
    const hasMultipleCodecs = Object.keys(source_groups).length > 1;
    if (hasResolutions || hasMultipleCodecs || hasMultipleSources) {
      options.plugins = {
        ...options.plugins,
        resolutionSelector: {
          force_types: ['video/mp4'],
          source_groups,
          default_res: auto_res
        }
      };
    }
    return options;
  }, [final_embed_method, actualAutoplay, controls, muted, preload, poster, loop, playback_rate, playsinline, volume, auto_res, finalizedSources, source_groups, text_tracks, aspectRatio, crossorigin]);
  const handlePlay = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    console.log('VideoPlayer: handlePlay triggered');
    if (wrapperRef.current) {
      const elements = Array.from(wrapperRef.current.querySelectorAll('.videopack-video-title, .videopack-meta-wrapper, .videopack-video-title-block, .videopack-video-title-wrapper'));
      const parent = wrapperRef.current.parentElement?.closest('.videopack-wrapper');
      if (parent) {
        Array.from(parent.querySelectorAll('.videopack-video-title, .videopack-meta-wrapper, .videopack-video-title-block, .videopack-video-title-wrapper')).forEach(el => {
          if (!elements.includes(el)) {
            elements.push(el);
          }
        });
      }
      elements.forEach(el => el.classList.remove('videopack-video-title-visible'));
    }
  }, []);
  const handlePause = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    console.log('VideoPlayer: handlePause triggered');
    if (wrapperRef.current) {
      const elements = Array.from(wrapperRef.current.querySelectorAll('.videopack-video-title, .videopack-meta-wrapper, .videopack-video-title-block, .videopack-video-title-wrapper'));
      const parent = wrapperRef.current.parentElement?.closest('.videopack-wrapper');
      if (parent) {
        Array.from(parent.querySelectorAll('.videopack-video-title, .videopack-meta-wrapper, .videopack-video-title-block, .videopack-video-title-wrapper')).forEach(el => {
          if (!elements.includes(el)) {
            elements.push(el);
          }
        });
      }
      elements.forEach(el => el.classList.add('videopack-video-title-visible'));
    }
  }, []);
  const handleEnded = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    handlePause();
  }, [handlePause]);
  const onReadyRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(onReady);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    onReadyRef.current = onReady;
  }, [onReady]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (typeof window !== 'undefined' && blockAttributes.id) {
      window.videopack = window.videopack || {};
      window.videopack.player_data = window.videopack.player_data || {};
      window.videopack.player_data[`videopack_player_${blockAttributes.id}`] = {
        source_groups
      };
    }
  }, [blockAttributes.id, source_groups]);
  const handleVideoPlayerReady = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(player => {
    player.on('loadedmetadata', () => {
      if (onReadyRef.current) {
        if (final_embed_method === 'Video.js') {
          onReadyRef.current(player.el().firstChild);
        } else {
          onReadyRef.current(player);
        }
      }
      if (actualAutoplay) {
        handlePlay();
      }
    });
  }, [final_embed_method, actualAutoplay, handlePlay]);
  const handleMejsReady = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(player => {
    if (onReadyRef.current) {
      onReadyRef.current(player);
    }
  }, []);
  const renderReady = src || finalizedSources && finalizedSources.length > 0;
  if (!renderReady) {
    return null; // Or a loading spinner
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
    className: wrapperClasses,
    ref: wrapperRef,
    style: playerStyles,
    id: instanceId,
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
      className: `videopack-player ${final_embed_method === 'Video.js' ? final_skin || '' : ''} ${!loopDuotoneId && resolvedDuotoneClass ? resolvedDuotoneClass : ''}`,
      style: {
        ...innerPlayerStyles,
        position: 'relative'
      },
      "data-id": blockAttributes.id,
      children: [(() => {
        const PlayerComponent = players[final_embed_method] || players.None;
        if (final_embed_method === 'Video.js') {
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(PlayerComponent, {
            options: videoJsOptions,
            skin: final_skin,
            onPlay: handlePlay,
            onPause: handlePause,
            onEnded: handleEnded,
            onReady: handleVideoPlayerReady,
            onMetadataLoaded: onMetadataLoaded
          }, `videojs-${src}-${resetKey}-${uniqueKey}-${blockAttributes.restartCount || 0}`);
        }
        if (final_embed_method === 'WordPress Default') {
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(PlayerComponent, {
            options: genericPlayerOptions,
            controls: controls,
            actualAutoplay: actualAutoplay,
            onReady: handleMejsReady,
            onPlay: handlePlay,
            onPause: handlePause,
            onEnded: handleEnded,
            playback_rate: playback_rate,
            aspectRatio: aspectRatio,
            onMetadataLoaded: onMetadataLoaded,
            source_groups: source_groups
          }, `wpvideo-${src}-${resetKey}-${uniqueKey}-${blockAttributes.restartCount || 0}`);
        }
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(PlayerComponent, {
          options: videoJsOptions || genericPlayerOptions,
          ...(PlayerComponent === _GenericPlayer_js__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A ? genericPlayerOptions : {}),
          skin: final_skin,
          onPlay: handlePlay,
          onPause: handlePause,
          onEnded: handleEnded,
          onReady: handleVideoPlayerReady,
          onMetadataLoaded: onMetadataLoaded,
          source_groups: source_groups
        }, `${final_embed_method}-${src}-${resetKey}-${uniqueKey}-${blockAttributes.restartCount || 0}`);
      })(), Array.isArray(final_duotone) && resolvedDuotoneClass && !loopDuotoneId && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.Fragment, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_Duotone_CustomDuotoneFilter__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .A, {
          colors: final_duotone,
          id: resolvedDuotoneClass
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("style", {
          children: `
								.${resolvedDuotoneClass} .vjs-poster:not(.vjs-poster .vjs-poster),
								.${resolvedDuotoneClass} .mejs-poster:not(.mejs-poster .mejs-poster),
								#${instanceId} .vjs-poster:not(.vjs-poster .vjs-poster),
								#${instanceId} .mejs-poster:not(.mejs-poster .mejs-poster) {
									filter: url(#${resolvedDuotoneClass}) !important;
								}
								#${instanceId} {
									filter: none !important;
								}
							`
        })]
      }), children]
    })
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (VideoPlayer);
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "A", 0, /* export default binding */ __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ ]);


/***/ },

/***/ 8377
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6087);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(790);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__);
/* global jQuery */


/**
 * Isolated MediaElement.js Player component.
 * Manually manages the video element to prevent DOM conflicts with React.
 */
/**
 * WpMejsPlayer component.
 *
 * @param {Object}   props                Component props.
 * @param {Object}   props.options        Player options (sources, tracks, poster, etc.).
 * @param {boolean}  props.controls       Whether to enable native controls.
 * @param {boolean}  props.actualAutoplay Whether to autoplay the video.
 * @param {Function} props.onReady        Callback fired when MEJS is ready.
 * @param {Function} props.onPlay         Callback fired on play event.
 * @param {boolean}  props.playback_rate  Whether to enable playback rate controls.
 * @return {Element} The rendered component.
 */

const WpMejsPlayer = props => {
  const {
    options,
    controls,
    actualAutoplay,
    aspectRatio,
    source_groups
  } = props;
  const playerRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const containerRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const propsRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(props);
  const reportedSrcRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const uniqueKey = JSON.stringify({
    src: options.src,
    poster: options.poster,
    sources: options.sources,
    tracks: options.tracks,
    controls,
    actualAutoplay,
    source_groups,
    option_source_groups: options.source_groups
  });
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    let isMounted = true;
    let timeoutId = null;
    const cleanupPlayer = () => {
      if (playerRef.current) {
        try {
          if (typeof playerRef.current.remove === 'function') {
            // Neuter sizing methods before removal to prevent async crashes
            // during the destruction process (mediaelement-and-player.js:4416).
            if (typeof playerRef.current.setPlayerSize === 'function') {
              playerRef.current.setPlayerSize = () => {};
            }
            if (typeof playerRef.current.setControlsSize === 'function') {
              playerRef.current.setControlsSize = () => {};
            }
            playerRef.current.remove();
          }
        } catch {
          // Ignore
        }
        playerRef.current = null;
      }
    };

    // Use a delay to handle Strict Mode and iframe context migration.
    // The 100ms timeout defers to a later tick, allowing DOM shuffling to settle.
    timeoutId = setTimeout(() => {
      const container = containerRef.current;
      if (!isMounted || !container || !container.ownerDocument.body.contains(container)) {
        return;
      }

      // Clean up any stale DOM.
      container.innerHTML = '';
      const {
        options: curOptions,
        controls: curControls,
        actualAutoplay: curAutoplay,
        onReady: curOnReady,
        onPlay: curOnPlay,
        onPause: curOnPause,
        onEnded: curOnEnded,
        playback_rate: curPlaybackRate
      } = propsRef.current;
      if (!curOptions || !curOptions.sources || curOptions.sources.length === 0) {
        return;
      }
      try {
        const videoElement = container.ownerDocument.createElement('video');
        videoElement.className = 'wp-video-shortcode videopack-video';
        videoElement.setAttribute('playsinline', '');
        videoElement.setAttribute('width', '100%');
        videoElement.setAttribute('height', '100%');
        if (curOptions.poster) {
          videoElement.setAttribute('poster', curOptions.poster);
        }
        if (curOptions.loop) {
          videoElement.setAttribute('loop', 'true');
        }
        if (curOptions.preload) {
          videoElement.setAttribute('preload', curOptions.preload);
        }
        const shouldBeMuted = !!curOptions.muted || !!curOptions.actualAutoplay;
        if (shouldBeMuted) {
          videoElement.setAttribute('muted', 'muted');
          videoElement.muted = true;
        }
        curOptions.sources.forEach(s => {
          const source = container.ownerDocument.createElement('source');
          source.src = s.src;
          source.type = s.type;
          if (s.resolution) {
            source.setAttribute('data-res', s.resolution);
          }
          if (s.default_res) {
            source.setAttribute('data-default_res', s.default_res);
          }
          videoElement.appendChild(source);
        });
        if (curOptions.tracks) {
          curOptions.tracks.forEach(t => {
            const track = container.ownerDocument.createElement('track');
            track.src = t.src;
            track.kind = t.kind;
            track.srclang = t.srclang;
            track.label = t.label;
            if (t.default) {
              track.setAttribute('default', 'true');
            }
            videoElement.appendChild(track);
          });
        }
        container.appendChild(videoElement);
        const mejsSettings = window._wpmejsSettings || {};
        const mejsOptions = {
          pluginPath: '/wp-includes/js/mediaelement/',
          ...mejsSettings,
          source_groups: source_groups || options.source_groups
        };

        // Ensure features is an array to avoid MEJS crashes in setResponsiveMode.
        if (!mejsOptions.features || !Array.isArray(mejsOptions.features)) {
          mejsOptions.features = ['playpause', 'progress', 'current', 'duration', 'tracks', 'sourcechooser', 'volume', 'fullscreen'];
        } else if (!mejsOptions.features.includes('sourcechooser')) {
          mejsOptions.features.push('sourcechooser');
        }
        if (!mejsOptions.stretching) {
          mejsOptions.stretching = 'responsive';
        }
        mejsOptions.videoWidth = '100%';
        mejsOptions.videoHeight = '100%';
        mejsOptions.startVolume = curOptions.volume !== undefined && curOptions.volume !== null ? curOptions.volume : 0.8;
        mejsOptions.startMuted = shouldBeMuted;
        if (!curControls) {
          mejsOptions.features = [];
          mejsOptions.controls = false;
        }
        if (curPlaybackRate) {
          mejsOptions.features.push('speed');
        }
        const onPlayHandler = e => {
          if (typeof curOnPlay === 'function') {
            curOnPlay(e);
          }
        };
        const onPauseHandler = e => {
          if (typeof curOnPause === 'function') {
            curOnPause(e);
          }
        };
        const onEndedHandler = e => {
          if (typeof curOnEnded === 'function') {
            curOnEnded(e);
          }
        };
        const autoPlayHandler = () => {
          if (curAutoplay && playerRef.current) {
            try {
              playerRef.current.play();
            } catch {
              // Browser blocked autoplay
            }
          }
        };
        mejsOptions.success = (media, domNode, player) => {
          if (!isMounted) {
            return;
          }
          playerRef.current = player;
          media.addEventListener('play', onPlayHandler);
          media.addEventListener('pause', onPauseHandler);
          media.addEventListener('ended', onEndedHandler);
          if (curOnReady) {
            if (typeof curOnReady === 'function') {
              curOnReady(player);
            } else if (curOnReady.current) {
              curOnReady.current(player);
            }
          }

          // Small delay to allow DOM normalization before sizing.
          setTimeout(() => {
            const targetPlayer = playerRef.current;
            if (!targetPlayer || !targetPlayer.media || !isMounted) {
              return;
            }

            // MEJS player instance container can be a jQuery object or a DOM node.
            // We must ensure it's a raw Node before calling .contains()
            let containerElement = targetPlayer.container || targetPlayer.media?.container;
            if (containerElement && containerElement.get) {
              containerElement = containerElement.get(0);
            } else if (containerElement && containerElement.jquery && containerElement[0]) {
              containerElement = containerElement[0];
            }
            const isAttached = containerElement && container.ownerDocument.body.contains(containerElement);
            if (targetPlayer && targetPlayer.media &&
            // Stricter guard: instance must have media
            containerElement && isAttached && typeof targetPlayer.setPlayerSize === 'function') {
              // Guard against MEJS internal crash if videoWidth/Height are not yet loaded.
              // mediaelement-and-player.js:4416 accesses videoWidth of undefined in setResponsiveMode.
              // Note: readyState >= 1 does NOT guarantee videoWidth is populated on the MEJS wrapper.
              // We check both the renderer wrapper (media) and the native node (domNode).
              try {
                const mediaWidth = media && media.videoWidth || domNode && domNode.videoWidth || media && media.width || domNode && domNode.width || 0;
                const mediaHeight = media && media.videoHeight || domNode && domNode.videoHeight || media && media.height || domNode && domNode.height || 0;
                const isRealSizing = mediaWidth > 0 && (mediaWidth !== 100 || mediaHeight !== 100 || media?.readyState >= 1);
                if (isRealSizing) {
                  try {
                    targetPlayer.setPlayerSize();
                    targetPlayer.setControlsSize();
                    const {
                      onMetadataLoaded: curOnMetadataLoaded
                    } = propsRef.current;
                    if (typeof curOnMetadataLoaded === 'function' && reportedSrcRef.current !== options.src) {
                      reportedSrcRef.current = options.src;
                      curOnMetadataLoaded({
                        width: mediaWidth,
                        height: mediaHeight
                      });
                    }
                  } catch {
                    targetPlayer.setPlayerSize();
                  }
                } else {
                  const sizeOnMetadata = () => {
                    try {
                      if (isMounted && targetPlayer && targetPlayer.media && typeof targetPlayer.setPlayerSize === 'function') {
                        const currentWidth = targetPlayer.media.videoWidth || domNode && domNode.videoWidth || targetPlayer.media.width || domNode && domNode.width;
                        const currentHeight = targetPlayer.media.videoHeight || domNode && domNode.videoHeight || targetPlayer.media.height || domNode && domNode.height;
                        const isRealMetadataSizing = currentWidth > 0 && (currentWidth !== 100 || currentHeight !== 100 || targetPlayer.media?.readyState >= 1);
                        if (isRealMetadataSizing) {
                          targetPlayer.setPlayerSize();
                          targetPlayer.setControlsSize();
                          const {
                            onMetadataLoaded: curOnMetadataLoaded
                          } = propsRef.current;
                          if (typeof curOnMetadataLoaded === 'function' && reportedSrcRef.current !== options.src) {
                            reportedSrcRef.current = options.src;
                            curOnMetadataLoaded({
                              width: currentWidth,
                              height: currentHeight
                            });
                          }
                        }
                      }
                    } catch {
                      // Silence metadata errors
                    }
                    if (media) {
                      media.removeEventListener('loadedmetadata', sizeOnMetadata);
                    }
                  };
                  media.addEventListener('loadedmetadata', sizeOnMetadata);
                }
              } catch {
                // Silence dimension detection errors
              }
            }
          }, 150);
          media.addEventListener('canplay', autoPlayHandler);
        };
        const $videoElement = jQuery(videoElement);
        // Stricter check before init
        if (isMounted && container.ownerDocument.body.contains(container)) {
          $videoElement.mediaelementplayer(mejsOptions);
        }
      } catch {
        // Silence init errors
      }
    }, 100);
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      cleanupPlayer();
    };
  }, [uniqueKey, options.src, options.source_groups, source_groups]);

  // Reactive updates for volume and muted without recreating the player.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    const media = playerRef.current;
    const shouldBeMuted = !!options.muted || !!actualAutoplay;
    if (media && typeof media.setMuted === 'function') {
      media.setMuted(shouldBeMuted);
    }
  }, [options.muted, actualAutoplay]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    const media = playerRef.current;
    if (media && typeof media.setVolume === 'function' && options.volume !== undefined && options.volume !== null) {
      media.setVolume(options.volume);
    }
  }, [options.volume]);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("div", {
    className: `wp-video-container${!controls ? ' videopack-no-controls' : ''}`,
    ref: containerRef,
    style: {
      width: '100%',
      aspectRatio: aspectRatio ? aspectRatio.replace(':', ' / ') : undefined
    }
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (WpMejsPlayer);
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "A", 0, /* export default binding */ __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ ]);


/***/ },

/***/ 1602
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6427);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7723);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6087);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(2619);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _assets_icon__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(9427);
/* harmony import */ var _hooks_useVideoSettings__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(8016);
/* harmony import */ var _CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(6312);
/* harmony import */ var _WatermarkSettingsPanel_WatermarkSettingsPanel_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(1166);
/* harmony import */ var _TextTracks_TextTracks_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(3830);
/* harmony import */ var _utils_helpers__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(2711);
/* harmony import */ var _utils_colors__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(7068);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(790);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__);
/* global videopack_config */













const VideoSettings = ({
  attributes,
  setAttributes,
  options = {},
  initialOpen = false,
  isBlockEditor = false
}) => {
  const {
    handleSettingChange,
    preloadOptions
  } = (0,_hooks_useVideoSettings__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .A)(attributes, setAttributes, options);
  const displayAttributes = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useMemo)(() => {
    const merged = {
      ...options,
      ...attributes
    };
    return (0,_utils_helpers__WEBPACK_IMPORTED_MODULE_9__/* .normalizeOptions */ .a5)(merged);
  }, [options, attributes]);
  const PLAYER_COLOR_FALLBACKS = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useMemo)(() => (0,_utils_colors__WEBPACK_IMPORTED_MODULE_10__/* .getColorFallbacks */ .l)(displayAttributes), [displayAttributes]);
  const THEME_COLORS = videopack_config?.themeColors || options?.themeColors;
  const showPlayButtonColors = (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_3__.applyFilters)('videopack.videoSettings.showPlayButtonColors', true, displayAttributes);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("div", {
    className: "videopack-video-settings",
    children: [!isBlockEditor && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Metadata', 'video-embed-thumbnail-generator'),
      initialOpen: initialOpen,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelRow, {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Overlay title', 'video-embed-thumbnail-generator'),
          onChange: value => handleSettingChange('overlay_title', value),
          checked: !!displayAttributes.overlay_title
        })
      }), displayAttributes.overlay_title && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("div", {
        className: "videopack-video-settings-input-wrapper",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Title', 'video-embed-thumbnail-generator'),
          value: displayAttributes.title || '',
          onChange: value => handleSettingChange('title', value)
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("div", {
        className: "videopack-video-settings-input-wrapper",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Caption', 'video-embed-thumbnail-generator'),
          value: displayAttributes.caption || '',
          onChange: value => handleSettingChange('caption', value)
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelRow, {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('View count', 'video-embed-thumbnail-generator'),
          onChange: value => handleSettingChange('views', value),
          checked: !!displayAttributes.views
        })
      }), (() => {
        const availableStats = [{
          key: 'starts',
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Starts', 'video-embed-thumbnail-generator'),
          val: displayAttributes.starts
        }, {
          key: 'play_25',
          label: '25%',
          val: displayAttributes.play_25
        }, {
          key: 'play_50',
          label: '50%',
          val: displayAttributes.play_50
        }, {
          key: 'play_75',
          label: '75%',
          val: displayAttributes.play_75
        }, {
          key: 'completeviews',
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Ends', 'video-embed-thumbnail-generator'),
          val: displayAttributes.completeviews
        }].filter(s => s.val > 0);
        if (availableStats.length === 0) {
          return null;
        }
        const isSingleStat = availableStats.length === 1;
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("div", {
          className: `videopack-video-stats-${isSingleStat ? 'simple' : 'funnel'}`,
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("p", {
            className: "videopack-settings-section-title",
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Views', 'video-embed-thumbnail-generator')
          }), isSingleStat ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("div", {
            className: "videopack-stat-simple-row",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("span", {
              className: "videopack-stat-label",
              children: [availableStats[0].label, ":"]
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("span", {
              className: "videopack-stat-value",
              children: availableStats[0].val.toLocaleString()
            })]
          }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("div", {
            className: "videopack-funnel-track",
            children: availableStats.map((stat, idx, arr) => {
              const retention = stat.key !== 'starts' && displayAttributes.starts > 0 ? Math.round(stat.val / displayAttributes.starts * 100) + '%' : null;
              return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("div", {
                className: "videopack-funnel-item",
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("div", {
                  className: "videopack-funnel-marker",
                  children: idx < arr.length - 1 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("div", {
                    className: "videopack-funnel-connector"
                  })
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("div", {
                  className: "videopack-funnel-label",
                  children: stat.label
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("div", {
                  className: "videopack-funnel-value",
                  children: stat.val.toLocaleString()
                }), retention && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("div", {
                  className: "videopack-funnel-retention",
                  children: retention
                })]
              }, stat.key);
            })
          })]
        });
      })()]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Player Settings', 'video-embed-thumbnail-generator'),
      initialOpen: initialOpen,
      children: [!displayAttributes.gifmode && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.Fragment, {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Flex, {
          "align-items": "flex-start",
          expanded: false,
          gap: 20,
          justify: "flex-start",
          className: "videopack-player-settings-flex",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.FlexItem, {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
              __nextHasNoMarginBottom: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Autoplay', 'video-embed-thumbnail-generator'),
              onChange: value => handleSettingChange('autoplay', value),
              checked: !!displayAttributes.autoplay,
              help: displayAttributes.autoplay && !displayAttributes.muted ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Autoplay is disabled while editing unless muted.') : null
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
              __nextHasNoMarginBottom: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Loop', 'video-embed-thumbnail-generator'),
              onChange: value => handleSettingChange('loop', value),
              checked: !!displayAttributes.loop
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
              __nextHasNoMarginBottom: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Muted', 'video-embed-thumbnail-generator'),
              onChange: value => handleSettingChange('muted', value),
              checked: !!displayAttributes.muted
            }), !displayAttributes.muted && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.RangeControl, {
              __nextHasNoMarginBottom: true,
              __next40pxDefaultSize: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Volume', 'video-embed-thumbnail-generator'),
              value: displayAttributes.volume,
              beforeIcon: _assets_icon__WEBPACK_IMPORTED_MODULE_4__/* .volumeDown */ .pZ,
              afterIcon: _assets_icon__WEBPACK_IMPORTED_MODULE_4__/* .volumeUp */ .Kx,
              initialPosition: 1,
              withInputField: false,
              onChange: value => handleSettingChange('volume', value),
              min: 0,
              max: 1,
              step: 0.05
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.FlexItem, {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
              __nextHasNoMarginBottom: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Controls', 'video-embed-thumbnail-generator'),
              onChange: value => handleSettingChange('controls', value),
              checked: !!displayAttributes.controls
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
              __nextHasNoMarginBottom: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Variable playback speeds', 'video-embed-thumbnail-generator'),
              onChange: value => handleSettingChange('playback_rate', value),
              checked: !!displayAttributes.playback_rate
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
              __nextHasNoMarginBottom: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Play inline on iPhones', 'video-embed-thumbnail-generator'),
              onChange: value => handleSettingChange('playsinline', value),
              checked: !!displayAttributes.playsinline
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SelectControl, {
              __nextHasNoMarginBottom: true,
              __next40pxDefaultSize: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Preload', 'video-embed-thumbnail-generator'),
              value: displayAttributes.preload,
              onChange: value => handleSettingChange('preload', value),
              options: preloadOptions
            })]
          })]
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
        __nextHasNoMarginBottom: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('GIF mode', 'video-embed-thumbnail-generator'),
        onChange: value => handleSettingChange('gifmode', value),
        checked: !!displayAttributes.gifmode,
        help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Video acts like an animated GIF. Enables autoplay, loop, mute, and disables controls.')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
        __nextHasNoMarginBottom: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Allow right-click on video', 'video-embed-thumbnail-generator'),
        onChange: value => handleSettingChange('right_click', value),
        checked: !!displayAttributes.right_click
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Colors', 'video-embed-thumbnail-generator'),
      initialOpen: false,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("div", {
        className: "videopack-skin-section",
        style: {
          marginBottom: '16px'
        },
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SelectControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Player Skin', 'video-embed-thumbnail-generator'),
          value: attributes.skin || options.skin || '',
          options: [{
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Videopack', 'video-embed-thumbnail-generator'),
            value: 'vjs-theme-videopack'
          }, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Videopack Classic', 'video-embed-thumbnail-generator'),
            value: 'kg-video-js-skin'
          }, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Video.js default', 'video-embed-thumbnail-generator'),
            value: 'default'
          }, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('City', 'video-embed-thumbnail-generator'),
            value: 'vjs-theme-city'
          }, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Fantasy', 'video-embed-thumbnail-generator'),
            value: 'vjs-theme-fantasy'
          }, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Forest', 'video-embed-thumbnail-generator'),
            value: 'vjs-theme-forest'
          }, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Sea', 'video-embed-thumbnail-generator'),
            value: 'vjs-theme-sea'
          }],
          onChange: value => handleSettingChange('skin', value)
        })
      }), !isBlockEditor && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("div", {
        className: "videopack-color-section",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("p", {
          className: "videopack-settings-section-title",
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Title overlay', 'video-embed-thumbnail-generator')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("div", {
          className: "videopack-color-flex-row",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .A, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Text', 'video-embed-thumbnail-generator'),
              value: displayAttributes.title_color,
              onChange: value => handleSettingChange('title_color', value),
              colors: THEME_COLORS,
              fallbackValue: PLAYER_COLOR_FALLBACKS.title_color
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .A, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Background', 'video-embed-thumbnail-generator'),
              value: displayAttributes.title_background_color,
              onChange: value => handleSettingChange('title_background_color', value),
              colors: THEME_COLORS,
              fallbackValue: PLAYER_COLOR_FALLBACKS.title_background_color
            })
          })]
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("div", {
        className: "videopack-color-section",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("p", {
          className: "videopack-settings-section-title",
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Player', 'video-embed-thumbnail-generator')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("div", {
          className: "videopack-color-flex-row",
          children: [showPlayButtonColors && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.Fragment, {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .A, {
                label: displayAttributes.embed_method === 'WordPress Default' ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Play Button Color', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Play Button Icon', 'video-embed-thumbnail-generator'),
                value: displayAttributes.play_button_color,
                onChange: value => handleSettingChange('play_button_color', value),
                colors: THEME_COLORS,
                fallbackValue: PLAYER_COLOR_FALLBACKS.play_button_color
              })
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .A, {
                label: displayAttributes.embed_method === 'WordPress Default' ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Play Button Hover', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Play Button Accent', 'video-embed-thumbnail-generator'),
                value: displayAttributes.play_button_secondary_color,
                onChange: value => handleSettingChange('play_button_secondary_color', value),
                colors: THEME_COLORS,
                fallbackValue: PLAYER_COLOR_FALLBACKS.play_button_secondary_color
              })
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .A, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Control Bar Background', 'video-embed-thumbnail-generator'),
              value: displayAttributes.control_bar_bg_color,
              onChange: value => handleSettingChange('control_bar_bg_color', value),
              colors: THEME_COLORS,
              fallbackValue: PLAYER_COLOR_FALLBACKS.control_bar_bg_color
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .A, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Control Bar Icons', 'video-embed-thumbnail-generator'),
              value: displayAttributes.control_bar_color,
              onChange: value => handleSettingChange('control_bar_color', value),
              colors: THEME_COLORS,
              fallbackValue: PLAYER_COLOR_FALLBACKS.control_bar_color
            })
          })]
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Dimensions', 'video-embed-thumbnail-generator'),
      initialOpen: false,
      children: [!isBlockEditor && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelRow, {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("div", {
          className: "videopack-video-settings-full-width",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SelectControl, {
            __nextHasNoMarginBottom: true,
            __next40pxDefaultSize: true,
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Align / Width', 'video-embed-thumbnail-generator'),
            value: displayAttributes.align || '',
            onChange: value => handleSettingChange('align', value),
            options: [{
              value: '',
              label: videopack_config.contentSize ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)(/* translators: %s: Content size in pixels. */
              (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)("None (use theme's default width: %s)", 'video-embed-thumbnail-generator'), videopack_config.contentSize) : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)("None (use theme's default width)", 'video-embed-thumbnail-generator')
            }, {
              value: 'wide',
              label: videopack_config.wideSize ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)(/* translators: %s: Wide size in pixels. */
              (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)("Wide (use theme's wide width: %s)", 'video-embed-thumbnail-generator'), videopack_config.wideSize) : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)("Wide (use theme's wide width)", 'video-embed-thumbnail-generator')
            }, {
              value: 'full',
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Full width', 'video-embed-thumbnail-generator')
            }, {
              value: 'left',
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Left', 'video-embed-thumbnail-generator')
            }, {
              value: 'center',
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Center', 'video-embed-thumbnail-generator')
            }, {
              value: 'right',
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Right', 'video-embed-thumbnail-generator')
            }]
          })
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelRow, {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.RadioControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Constrain to default aspect ratio', 'video-embed-thumbnail-generator'),
          selected: displayAttributes.fixed_aspect,
          onChange: value => handleSettingChange('fixed_aspect', value),
          options: [{
            value: 'false',
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('None', 'video-embed-thumbnail-generator')
          }, {
            value: 'true',
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('All', 'video-embed-thumbnail-generator')
          }, {
            value: 'vertical',
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Vertical Videos', 'video-embed-thumbnail-generator')
          }]
        })
      }), !isBlockEditor && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.Fragment, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelRow, {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
            __nextHasNoMarginBottom: true,
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Legacy dimension settings', 'video-embed-thumbnail-generator'),
            onChange: value => handleSettingChange('legacy_dimensions', value),
            checked: !!displayAttributes.legacy_dimensions
          })
        }), displayAttributes.legacy_dimensions && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.Fragment, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelRow, {
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
              __nextHasNoMarginBottom: true,
              __next40pxDefaultSize: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Width', 'video-embed-thumbnail-generator'),
              type: "number",
              value: displayAttributes.width,
              onChange: value => handleSettingChange('width', value)
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelRow, {
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
              __nextHasNoMarginBottom: true,
              __next40pxDefaultSize: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Height', 'video-embed-thumbnail-generator'),
              type: "number",
              value: displayAttributes.height,
              onChange: value => handleSettingChange('height', value)
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelRow, {
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
              __nextHasNoMarginBottom: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Shrink to fit', 'video-embed-thumbnail-generator'),
              onChange: value => handleSettingChange('resize', value),
              checked: !!displayAttributes.resize
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelRow, {
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
              __nextHasNoMarginBottom: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Expand to full width', 'video-embed-thumbnail-generator'),
              onChange: value => handleSettingChange('fullwidth', value),
              checked: !!displayAttributes.fullwidth
            })
          })]
        })]
      })]
    }), !isBlockEditor && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_WatermarkSettingsPanel_WatermarkSettingsPanel_js__WEBPACK_IMPORTED_MODULE_7__/* ["default"] */ .A, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Watermark Overlay', 'video-embed-thumbnail-generator'),
      watermarkSettings: {
        url: displayAttributes.watermark,
        ...displayAttributes.watermark_styles
      },
      onChange: newSettings => {
        const {
          url,
          ...styles
        } = newSettings;
        handleSettingChange('watermark', url);
        handleSettingChange('watermark_styles', styles);
      },
      initialOpen: false,
      children: [displayAttributes.watermark && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelRow, {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Link to', 'video-embed-thumbnail-generator'),
          value: displayAttributes.watermark_link_to || 'false',
          onChange: value => handleSettingChange('watermark_link_to', value),
          options: [{
            value: 'false',
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('None', 'video-embed-thumbnail-generator')
          }, {
            value: 'home',
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Home page', 'video-embed-thumbnail-generator')
          }, {
            value: 'custom',
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Custom URL', 'video-embed-thumbnail-generator')
          }]
        })
      }), displayAttributes.watermark && displayAttributes.watermark_link_to === 'custom' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelRow, {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Watermark URL', 'video-embed-thumbnail-generator'),
          value: displayAttributes.watermark_url || '',
          onChange: value => handleSettingChange('watermark_url', value)
        })
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_TextTracks_TextTracks_js__WEBPACK_IMPORTED_MODULE_8__/* ["default"] */ .A, {
      tracks: displayAttributes.text_tracks || [],
      onChange: newTracks => handleSettingChange('text_tracks', newTracks)
    }), (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_3__.applyFilters)(
    /**
     * Filters the extra custom panels appended to the block sidebar/settings.
     *
     * @since 5.0.0
     *
     * @param {Array}  panels  Array of panel React elements, defaults to empty array.
     * @param {Object} context Context details including attributes, setAttributes, options, displayAttributes, handleSettingChange, isBlockEditor.
     */
    'videopack.videoSettings.panels', [], {
      attributes,
      setAttributes,
      options,
      displayAttributes,
      handleSettingChange,
      isBlockEditor
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Sharing', 'video-embed-thumbnail-generator'),
      initialOpen: false,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelRow, {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Allow embedding / Show embed code', 'video-embed-thumbnail-generator'),
          onChange: value => handleSettingChange('embedcode', value),
          checked: !!displayAttributes.embedcode
        })
      }), displayAttributes.embedcode && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.Fragment, {
        children: !isBlockEditor && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.Fragment, {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelRow, {
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
              __nextHasNoMarginBottom: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Download link', 'video-embed-thumbnail-generator'),
              onChange: value => handleSettingChange('downloadlink', value),
              checked: !!displayAttributes.downloadlink
            })
          })
        })
      })]
    })]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (VideoSettings);
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "A", 0, /* export default binding */ __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ ]);


/***/ },

/***/ 4773
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ VideopackContextBridge)
/* harmony export */ });
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4715);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _hooks_useVideopackContext__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5633);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6087);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(790);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__);




/**
 * A wrapper component that resolves Videopack context and bridges it into Gutenberg's block context.
 *
 * @param {Object} root0             Component props.
 * @param {Object} root0.attributes  The block attributes.
 * @param {Object} root0.context     The block context.
 * @param {Object} [root0.overrides] Optional context overrides to merge into the shared context.
 * @param {Node}   root0.children    Children.
 * @return {Element} The rendered component with context bridge.
 */

function VideopackContextBridge({
  attributes,
  context,
  overrides = {},
  children
}) {
  const {
    sharedContext
  } = (0,_hooks_useVideopackContext__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .Ay)(attributes, context);

  // Every caller passes its own ambient `context` in expecting it to keep
  // flowing to its children (title/views/duration/poster/etc — whatever an
  // ancestor like Loop already resolved), layering sharedContext/overrides
  // on top for what *this* block specifically contributes or overrides.
  // Dropping `context` here (as this used to) forced every descendant to
  // fall back to a REST fetch for data an ancestor had already provided.
  const finalContext = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useMemo)(() => {
    const ctx = {
      ...context,
      ...sharedContext,
      ...overrides
    };
    return ctx;
  }, [context, sharedContext, overrides]);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__.BlockContextProvider, {
    value: finalContext,
    children: children
  });
}

/***/ },

/***/ 9486
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7723);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6087);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(790);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__);
/* global Image */



const WatermarkPositioner = ({
  containerDimensions,
  settings,
  onChange,
  isSelected = true,
  showBackground = false,
  backgroundDataUrl = null,
  imageUrl = '',
  aspectRatio: propAspectRatio = null,
  children
}) => {
  const containerRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);
  const watermarkRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);
  const [watermarkImage, setWatermarkImage] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [isDragging, setIsDragging] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [isResizing, setIsResizing] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [transientScale, setTransientScale] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [transientPercentages, setTransientPercentages] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null); // { x, y } in percentages
  const [isFocused, setIsFocused] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const lastAspectRatioRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(propAspectRatio || 1);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (watermarkImage) {
      lastAspectRatioRef.current = watermarkImage.width / watermarkImage.height;
    } else if (propAspectRatio) {
      lastAspectRatioRef.current = propAspectRatio;
    }
  }, [watermarkImage, propAspectRatio]);
  const dragStartRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)({
    x: 0,
    y: 0,
    initialLeft: 0,
    initialTop: 0
  });
  const stateRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)({});
  const effectiveImageUrl = imageUrl || settings?.url || settings?.watermark;
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (effectiveImageUrl) {
      const img = new Image();
      img.onload = () => setWatermarkImage(img);
      img.src = effectiveImageUrl;
    } else {
      setWatermarkImage(null);
    }
  }, [effectiveImageUrl]);
  const {
    wmStyle,
    wmWidth,
    wmHeight,
    aspectRatio
  } = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => {
    if (!containerDimensions) {
      return {
        wmStyle: {},
        wmWidth: 0,
        wmHeight: 0,
        aspectRatio: 1
      };
    }
    const containerWidth = containerDimensions.width;

    // Use transientScale if available, else settings.scale
    const currentScale = transientScale !== null ? transientScale : Number(settings.watermark_scale || settings.scale || 10);
    const currentX = transientPercentages?.x !== undefined && transientPercentages !== null ? transientPercentages.x : Number(settings.watermark_x || settings.x || 0);
    const currentY = transientPercentages?.y !== undefined && transientPercentages !== null ? transientPercentages.y : Number(settings.watermark_y || settings.y || 0);
    const currentAlign = settings.watermark_align || settings.align || 'center';
    const currentValign = settings.watermark_valign || settings.valign || 'center';
    const style = {
      position: 'absolute',
      width: `${currentScale}%`,
      height: 'auto',
      zIndex: 100,
      transform: ''
    };
    if (currentAlign === 'center') {
      style.left = '50%';
      style.transform += 'translateX(-50%) ';
      style.marginLeft = `${-currentX}%`;
    } else {
      style[currentAlign] = `${currentX}%`;
    }
    if (currentValign === 'center') {
      style.top = '50%';
      style.transform += 'translateY(-50%) ';
      style.marginTop = `${-currentY}%`;
    } else {
      style[currentValign] = `${currentY}%`;
    }
    if (!style.transform) {
      delete style.transform;
    }
    const w = containerWidth * currentScale / 100;
    const ratio = watermarkImage ? watermarkImage.width / watermarkImage.height : lastAspectRatioRef.current || 1;
    const h = w / ratio;
    return {
      wmStyle: style,
      wmWidth: w,
      wmHeight: h,
      aspectRatio: ratio
    };
  }, [containerDimensions, watermarkImage, settings, transientScale, transientPercentages]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    stateRef.current = {
      transientPercentages,
      transientScale,
      isDragging,
      isResizing,
      settings,
      containerDimensions,
      watermarkImage,
      wmWidth,
      wmHeight,
      aspectRatio,
      baseDeltaX: Number(settings.x || settings.watermark_x || 0),
      baseDeltaY: Number(settings.y || settings.watermark_y || 0)
    };
  }, [transientPercentages, transientScale, isDragging, isResizing, settings, containerDimensions, watermarkImage, wmWidth, wmHeight, aspectRatio]);
  const onChangeRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(onChange);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  const handleMouseDown = e => {
    if (!isSelected) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    if (watermarkRef.current) {
      watermarkRef.current.focus();
    }
    const initialX = Number(settings.watermark_x || settings.x || 0);
    const initialY = Number(settings.watermark_y || settings.y || 0);
    setIsDragging(true);
    setTransientPercentages({
      x: initialX,
      y: initialY
    });
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialX,
      initialY
    };
  };
  const handleResizeStart = (e, handle) => {
    e.preventDefault();
    e.stopPropagation();
    if (watermarkRef.current) {
      watermarkRef.current.focus();
    }
    setIsResizing(true);
    const currentScale = transientScale !== null ? transientScale : Number(settings.watermark_scale || settings.scale || 10);
    const initialX = Number(settings.watermark_x || settings.x || 0);
    const initialY = Number(settings.watermark_y || settings.y || 0);
    setTransientScale(currentScale);
    setTransientPercentages({
      x: initialX,
      y: initialY
    });
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialX,
      initialY,
      initialScale: currentScale,
      handle,
      aspectRatio: wmWidth / wmHeight
    };
  };
  const handleMouseMove = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(e => {
    const s = stateRef.current;
    if (!s.isDragging && !s.isResizing) {
      return;
    }
    const dragStart = dragStartRef.current;
    const containerWidth = s.containerDimensions.width;
    const containerHeight = s.containerDimensions.height;
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = containerWidth / rect.width;
    const scaleY = containerHeight / rect.height;
    const dxCanvas = (e.clientX - dragStart.x) * scaleX;
    const dyCanvas = (e.clientY - dragStart.y) * scaleY;
    const dxPct = dxCanvas / containerWidth * 100;
    const dyPct = dyCanvas / containerHeight * 100;
    if (s.isDragging) {
      const currentAlignment = s.settings.align || s.settings.watermark_align || 'center';
      const currentVerticalAlignment = s.settings.valign || s.settings.watermark_valign || 'bottom';
      let newX = dragStart.initialX;
      let newY = dragStart.initialY;
      if (currentAlignment === 'left') {
        newX = dragStart.initialX + dxPct;
      } else {
        // right or center offsets increase as we move left (negative dx)
        newX = dragStart.initialX - dxPct;
      }
      if (currentVerticalAlignment === 'top') {
        newY = dragStart.initialY + dyPct;
      } else {
        // bottom or center offsets increase as we move up (negative dy)
        newY = dragStart.initialY - dyPct;
      }
      setTransientPercentages({
        x: newX,
        y: newY
      });
    } else if (s.isResizing) {
      const {
        initialScale,
        aspectRatio: currentRatio,
        handle
      } = dragStart;
      let newWidth;
      if (handle === 'se' || handle === 'ne') {
        newWidth = containerWidth * initialScale / 100 + dxCanvas;
      } else {
        newWidth = containerWidth * initialScale / 100 - dxCanvas;
      }
      let newScale = newWidth / containerWidth * 100;
      newScale = Math.round(newScale * 100) / 100;
      newScale = Math.max(1, Math.min(100, newScale));
      const currentAlignment = settings.watermark_align || settings.align || 'center';
      const currentVerticalAlignment = settings.watermark_valign || settings.valign || 'center';
      let newX = dragStart.initialX;
      let newY = dragStart.initialY;
      const scaleDiff = newScale - initialScale;
      const vScaleFactor = containerWidth / containerHeight / currentRatio;
      const vScaleDiff = scaleDiff * vScaleFactor;

      // Horizontal anchoring
      if (handle === 'se' || handle === 'ne') {
        // Dragging Right side -> NW or SW corner fixed
        if (currentAlignment === 'right') {
          newX = dragStart.initialX - scaleDiff;
        } else if (currentAlignment === 'center') {
          newX = dragStart.initialX - scaleDiff / 2;
        }
      } else if (currentAlignment === 'left') {
        newX = dragStart.initialX + scaleDiff;
      } else if (currentAlignment === 'center') {
        newX = dragStart.initialX + scaleDiff / 2;
      }

      // Vertical anchoring
      if (handle === 'se' || handle === 'sw') {
        // Dragging Bottom side -> NW or NE corner fixed
        if (currentVerticalAlignment === 'bottom') {
          newY = dragStart.initialY - vScaleDiff;
        } else if (currentVerticalAlignment === 'center') {
          newY = dragStart.initialY - vScaleDiff / 2;
        }
      } else if (currentVerticalAlignment === 'top') {
        newY = dragStart.initialY + vScaleDiff;
      } else if (currentVerticalAlignment === 'center') {
        newY = dragStart.initialY + vScaleDiff / 2;
      }
      setTransientScale(newScale);
      setTransientPercentages({
        x: newX,
        y: newY
      });
    }
  }, []);
  const finalizeInteraction = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
    const s = stateRef.current;
    if (!s.isDragging && !s.isResizing) {
      return;
    }
    const wasResizing = s.isResizing;
    if (!s.containerDimensions || !s.transientPercentages) {
      setTransientPercentages(null);
      setTransientScale(null);
      setIsDragging(false);
      setIsResizing(false);
      return;
    }
    setIsDragging(false);
    setIsResizing(false);
    const finalX = s.transientPercentages.x;
    const finalY = s.transientPercentages.y;
    const finalScale = wasResizing && s.transientScale !== null ? s.transientScale : Number(s.settings.watermark_scale || s.settings.scale || 10);
    const currentRatio = s.aspectRatio;
    const {
      width: containerWidth,
      height: containerHeight
    } = s.containerDimensions;

    // Preserve attributes based on what's being used (settings vs block-editor styles)
    const isBlock = Object.prototype.hasOwnProperty.call(s.settings, 'watermark_scale') || Object.prototype.hasOwnProperty.call(s.settings, 'watermark');
    const currentAlign = s.settings.watermark_align || s.settings.align || 'center';
    const currentValign = s.settings.watermark_valign || s.settings.valign || 'bottom';

    // 1. Calculate absolute top-left percentage (L, T)
    let L = finalX;
    if (currentAlign === 'right') {
      L = 100 - finalScale - finalX;
    } else if (currentAlign === 'center') {
      L = 50 - finalScale / 2 - finalX;
    }
    const vScale = finalScale * (containerWidth / containerHeight) / currentRatio;
    let T = finalY;
    if (currentValign === 'bottom') {
      T = 100 - vScale - finalY;
    } else if (currentValign === 'center') {
      T = 50 - vScale / 2 - finalY;
    }

    // 2. Decide best new anchors based on center of mass
    let newAlign = 'center';
    const centerX = L + finalScale / 2;
    if (centerX < 33) {
      newAlign = 'left';
    } else if (centerX > 66) {
      newAlign = 'right';
    }
    let newValign = 'center';
    const centerY = T + vScale / 2;
    if (centerY < 33) {
      newValign = 'top';
    } else if (centerY > 66) {
      newValign = 'bottom';
    }

    // 3. Calculate new offsets relative to these new anchors
    let newX = L;
    if (newAlign === 'right') {
      newX = 100 - finalScale - L;
    } else if (newAlign === 'center') {
      newX = 50 - finalScale / 2 - L;
    }
    let newY = T;
    if (newValign === 'bottom') {
      newY = 100 - vScale - T;
    } else if (newValign === 'center') {
      newY = 50 - vScale / 2 - T;
    }
    const newSettings = isBlock ? {
      ...s.settings,
      watermark_scale: Math.round(finalScale * 100) / 100,
      watermark_align: newAlign,
      watermark_valign: newValign,
      watermark_x: Math.round(newX * 100) / 100,
      watermark_y: Math.round(newY * 100) / 100
    } : {
      ...s.settings,
      scale: Math.round(finalScale * 100) / 100,
      align: newAlign,
      valign: newValign,
      x: Math.round(newX * 100) / 100,
      y: Math.round(newY * 100) / 100
    };
    onChangeRef.current(newSettings);
    setTransientPercentages(null);
    setTransientScale(null);

    // Remove global listeners
    window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // Finalize interaction when selection is lost while dragging/resizing
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (!isSelected && (isDragging || isResizing)) {
      finalizeInteraction();
    }
  }, [isSelected, isDragging, isResizing, finalizeInteraction]);

  // Finalize interaction on unmount if anything was pending
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    return () => {
      const s = stateRef.current;
      if (s.isDragging || s.isResizing) {
        // We can't call finalizeInteraction here because of closure issues,
        // but the stateRef should have what we need.
        // However, finalizeInteraction is already memoized with its dependencies.
        // For now, the 'isSelected' effect above handles most cases.
      }
    };
  }, []);
  const handleFocus = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
    setIsFocused(true);
  }, []);
  const handleBlur = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(e => {
    if (e.currentTarget.contains(e.relatedTarget)) {
      return;
    }
    setIsFocused(false);
    finalizeInteraction();
  }, [finalizeInteraction]);
  const handleDragKeyDown = e => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      return;
    }
    e.preventDefault();
    const {
      x: currentX,
      y: currentY
    } = {
      x: stateRef.current.baseDeltaX,
      y: stateRef.current.baseDeltaY
    };
    let newX = currentX;
    let newY = currentY;
    const stepPx = e.shiftKey ? 10 : 1;
    const stepXPct = stepPx / containerDimensions.width * 100;
    const stepYPct = stepPx / containerDimensions.height * 100;
    const currentAlignment = settings.watermark_align || settings.align || 'center';
    const currentVerticalAlignment = settings.watermark_valign || settings.valign || 'center';
    switch (e.key) {
      case 'ArrowUp':
        newY += currentVerticalAlignment === 'top' ? -stepYPct : stepYPct;
        break;
      case 'ArrowDown':
        newY += currentVerticalAlignment === 'top' ? stepYPct : -stepYPct;
        break;
      case 'ArrowLeft':
        newX += currentAlignment === 'left' ? -stepXPct : stepXPct;
        break;
      case 'ArrowRight':
        newX += currentAlignment === 'left' ? stepXPct : -stepXPct;
        break;
    }
    setTransientPercentages({
      x: newX,
      y: newY
    });
  };
  const handleResizeKeyDown = e => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();

    // Keyboard resizing is temporarily disabled during percentage refactor for stability
  };
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    // Clean logs and ensure no leaking listeners
    return () => {};
  }, []);
  if (!containerDimensions) {
    return children || null;
  }
  const containerWidth = containerDimensions.width;
  const containerHeight = containerDimensions.height;
  const showHandles = isSelected || isFocused;
  let watermarkCursor = 'default';
  if (isDragging) {
    watermarkCursor = 'grabbing';
  } else if (isSelected) {
    watermarkCursor = 'move';
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
    ref: containerRef,
    className: "videopack-watermark-positioner",
    style: {
      width: '100%',
      maxWidth: `${containerWidth}px`,
      aspectRatio: `${containerWidth} / ${containerHeight}`,
      backgroundImage: showBackground && backgroundDataUrl ? `url(${backgroundDataUrl})` : 'none',
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center'
    },
    children: [(isDragging || isResizing) && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
      className: "videopack-interaction-overlay",
      role: "presentation",
      style: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        cursor: isDragging ? 'grabbing' : 'crosshair',
        pointerEvents: 'auto'
      },
      onMouseMove: handleMouseMove,
      onMouseUp: finalizeInteraction
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
      ref: watermarkRef,
      style: {
        ...wmStyle,
        outline: showHandles ? '1px dashed #757575' : 'none',
        cursor: watermarkCursor
      },
      role: "button",
      tabIndex: isSelected ? '0' : '-1',
      "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Move watermark', 'video-embed-thumbnail-generator'),
      onMouseDown: handleMouseDown,
      onKeyDown: handleDragKeyDown,
      onFocus: handleFocus,
      onBlur: handleBlur,
      children: [children ? children : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("img", {
        src: effectiveImageUrl,
        alt: "Watermark",
        style: {
          width: '100%',
          height: '100%',
          userSelect: 'none',
          display: 'block'
        },
        draggable: false
      }), showHandles && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.Fragment, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
          role: "slider",
          tabIndex: "0",
          "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Resize watermark from top left', 'video-embed-thumbnail-generator'),
          className: "videopack-resize-handle nw",
          onMouseDown: e => handleResizeStart(e, 'nw'),
          onKeyDown: e => handleResizeKeyDown(e, 'nw')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
          role: "slider",
          tabIndex: "0",
          "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Resize watermark from top right', 'video-embed-thumbnail-generator'),
          className: "videopack-resize-handle ne",
          onMouseDown: e => handleResizeStart(e, 'ne'),
          onKeyDown: e => handleResizeKeyDown(e, 'ne')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
          role: "slider",
          tabIndex: "0",
          "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Resize watermark from bottom left', 'video-embed-thumbnail-generator'),
          className: "videopack-resize-handle sw",
          onMouseDown: e => handleResizeStart(e, 'sw'),
          onKeyDown: e => handleResizeKeyDown(e, 'sw')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
          role: "slider",
          tabIndex: "0",
          "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Resize watermark from bottom right', 'video-embed-thumbnail-generator'),
          className: "videopack-resize-handle se",
          onMouseDown: e => handleResizeStart(e, 'se'),
          onKeyDown: e => handleResizeKeyDown(e, 'se')
        })]
      })]
    })]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (WatermarkPositioner);
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "A", 0, /* export default binding */ __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ ]);


/***/ },

/***/ 1166
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7723);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6087);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6427);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _utils_video_capture__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(266);
/* harmony import */ var _features_settings_components_SelectFromLibrary__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(2032);
/* harmony import */ var _WatermarkPositioner_WatermarkPositioner__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(9486);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(790);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__);
/* global videopack_config */







const WatermarkSettingsPanel = ({
  watermarkSettings,
  onChange,
  title,
  initialOpen = false,
  opened,
  children,
  disabled = false
}) => {
  const [baseFrame, setBaseFrame] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [settingsPanelOpen, setSettingsPanelOpen] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const prevWatermarkUrl = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(watermarkSettings?.url);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (watermarkSettings?.url && watermarkSettings.url !== prevWatermarkUrl.current) {
      setSettingsPanelOpen(true);
    }
    prevWatermarkUrl.current = watermarkSettings?.url;
  }, [watermarkSettings?.url]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (watermarkSettings?.url && !baseFrame) {
      const videoUrl = videopack_config.url + '/src/images/Adobestock_469037984.mp4';
      const videoOffset = Math.random() * 1.9;
      (0,_utils_video_capture__WEBPACK_IMPORTED_MODULE_3__/* .captureVideoFrame */ .$R)(videoUrl, videoOffset).then(canvas => {
        setBaseFrame(canvas);
      }).catch(e => console.error(e));
    }
  }, [watermarkSettings?.url, baseFrame]);
  const updateSetting = (key, value) => {
    const newSettings = {
      ...watermarkSettings,
      [key]: value
    };
    onChange(newSettings);
  };
  const panelProps = {
    title
  };
  if (opened !== undefined) {
    panelProps.opened = opened;
  } else {
    panelProps.initialOpen = initialOpen;
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
    ...panelProps,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_features_settings_components_SelectFromLibrary__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .A, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Watermark image URL', 'video-embed-thumbnail-generator'),
      type: "url",
      value: watermarkSettings?.url,
      onChange: url => onChange(typeof watermarkSettings === 'object' && watermarkSettings !== null ? {
        ...watermarkSettings,
        url
      } : {
        url
      }),
      disabled: disabled
    }), children, watermarkSettings?.url && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Watermark Settings', 'video-embed-thumbnail-generator'),
      opened: settingsPanelOpen,
      onToggle: () => setSettingsPanelOpen(!settingsPanelOpen),
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
        className: "videopack-watermark-settings",
        children: [baseFrame && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_WatermarkPositioner_WatermarkPositioner__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .A, {
          containerDimensions: {
            width: baseFrame.width,
            height: baseFrame.height
          },
          settings: watermarkSettings,
          onChange: onChange,
          isSelected: true,
          showBackground: true,
          backgroundDataUrl: baseFrame.toDataURL()
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.RangeControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Scale (%)', 'video-embed-thumbnail-generator'),
          value: Number(watermarkSettings.scale || 50),
          onChange: value => updateSetting('scale', value),
          min: 1,
          max: 100,
          step: 0.01,
          __nextHasNoMarginBottom: true,
          disabled: disabled
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Flex, {
          gap: 4,
          align: "flex-end",
          justify: "flex-start",
          style: {
            marginBottom: '10px'
          },
          className: "videopack-watermark-row",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.FlexItem, {
            className: "videopack-alignment-control",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
              __next40pxDefaultSize: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Horizontal Alignment', 'video-embed-thumbnail-generator'),
              value: watermarkSettings.align || 'center',
              options: [{
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Left', 'video-embed-thumbnail-generator'),
                value: 'left'
              }, {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Center', 'video-embed-thumbnail-generator'),
                value: 'center'
              }, {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Right', 'video-embed-thumbnail-generator'),
                value: 'right'
              }],
              onChange: value => updateSetting('align', value),
              __nextHasNoMarginBottom: true,
              disabled: disabled
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.FlexItem, {
            className: "videopack-offset-control",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.RangeControl, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Horizontal Offset (%)', 'video-embed-thumbnail-generator'),
              value: Number(watermarkSettings.x || 0),
              onChange: value => updateSetting('x', value),
              min: 0,
              max: 100,
              step: 0.01,
              __nextHasNoMarginBottom: true,
              disabled: disabled
            })
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Flex, {
          gap: 4,
          align: "flex-end",
          justify: "flex-start",
          className: "videopack-watermark-row",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.FlexItem, {
            className: "videopack-alignment-control",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
              __next40pxDefaultSize: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Vertical Alignment', 'video-embed-thumbnail-generator'),
              value: watermarkSettings.valign || 'center',
              options: [{
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Top', 'video-embed-thumbnail-generator'),
                value: 'top'
              }, {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Center', 'video-embed-thumbnail-generator'),
                value: 'center'
              }, {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Bottom', 'video-embed-thumbnail-generator'),
                value: 'bottom'
              }],
              onChange: value => updateSetting('valign', value),
              __nextHasNoMarginBottom: true,
              disabled: disabled
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.FlexItem, {
            className: "videopack-offset-control",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.RangeControl, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Vertical Offset (%)', 'video-embed-thumbnail-generator'),
              value: Number(watermarkSettings.y || 0),
              onChange: value => updateSetting('y', value),
              min: 0,
              max: 100,
              step: 0.01,
              __nextHasNoMarginBottom: true,
              disabled: disabled
            })
          })]
        })]
      })
    })]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (WatermarkSettingsPanel);
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "A", 0, /* export default binding */ __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ ]);


/***/ },

/***/ 2032
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7723);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6427);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _TextControlOnBlur__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(771);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(790);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__);




const SelectFromLibrary = ({
  value,
  onChange,
  label,
  children,
  ...props
}) => {
  const openMediaLibrary = () => {
    const frame = window.wp.media({
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Select Image', 'videopack-player-pro'),
      button: {
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Use this image', 'videopack-player-pro')
      },
      multiple: false,
      library: {
        type: 'image'
      }
    });
    frame.on('select', () => {
      const attachment = frame.state().get('selection').first().toJSON();
      onChange(attachment.url);
    });
    frame.open();
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
    className: "videopack-grid-row-align",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_TextControlOnBlur__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .A, {
      __nextHasNoMarginBottom: true,
      __next40pxDefaultSize: true,
      label: label,
      value: value,
      onChange: onChange,
      ...props
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
      className: "videopack-library-button-wrapper",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
        __next40pxDefaultSize: true,
        className: "videopack-library-button",
        variant: "secondary",
        onClick: openMediaLibrary,
        disabled: props.disabled,
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Select from library', 'video-embed-thumbnail-generator')
      }), value && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
        className: "videopack-select-from-library-preview",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("img", {
          src: value,
          alt: ""
        })
      }), children]
    })]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SelectFromLibrary);
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "A", 0, /* export default binding */ __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ ]);


/***/ },

/***/ 771
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6427);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6087);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(790);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__);



const TextControlOnBlur = ({
  value,
  onChange,
  ...props
}) => {
  const [innerValue, setInnerValue] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(value);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    setInnerValue(value);
  }, [value]);
  const handleOnChange = newValue => {
    setInnerValue(newValue);
  };
  const handleOnBlur = event => {
    onChange(innerValue);
    if (props.onBlur) {
      props.onBlur(event);
    }
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
    ...props,
    value: innerValue,
    onChange: handleOnChange,
    onBlur: handleOnBlur,
    type: "search"
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (TextControlOnBlur);
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "A", 0, /* export default binding */ __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ ]);


/***/ },

/***/ 5869
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6087);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _api_gallery__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8533);
/**
 * Custom React hook for fetching video formats and sources.
 */




/**
 * Hook to fetch and manage video sources for a given attachment.
 *
 * @param {number} id  The attachment ID.
 * @param {string} src The video source URL.
 * @return {Object} Video sources data and loading state.
 */
const useVideoFormats = (id, src) => {
  const [sources, setSources] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [isLoading, setIsLoading] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const fetchSources = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async (signal = null) => {
    if (!id && !src) {
      return;
    }
    setIsLoading(true);
    try {
      const data = await (0,_api_gallery__WEBPACK_IMPORTED_MODULE_1__/* .getVideoSources */ .UP)(id, src, signal);
      setSources(data);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Videopack: Error fetching video sources:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [id, src]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    const controller = new AbortController();
    fetchSources(controller.signal);
    return () => controller.abort();
  }, [fetchSources]);
  return {
    formats: sources,
    isLoading,
    refetch: fetchSources
  };
};
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "l", 0, /* binding */ useVideoFormats
/* harmony export */ ]);


/***/ },

/***/ 5711
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ useVideoProbe)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6087);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_video_capture__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(266);



/**
 * Custom hook to probe a video URL for metadata and CORS/canvas taint status.
 *
 * @param {string} videoUrl The URL of the video to probe.
 * @return {Object} An object containing { isProbing, probedMetadata }.
 */
function useVideoProbe(videoUrl) {
  const [state, setState] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)({
    url: null,
    isProbing: false,
    probedMetadata: null
  });

  // Derived state: Sync isProbing/metadata synchronously when the URL changes.
  // This prevents race conditions where effects in dependent components start
  // fetching before the probe actually sets isProbing to true.
  if (videoUrl !== state.url) {
    const isValidUrl = url => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    };
    setState({
      url: videoUrl,
      isProbing: !!videoUrl && isValidUrl(videoUrl),
      probedMetadata: null
    });
  }
  const {
    isProbing,
    probedMetadata
  } = state;
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (!isProbing || !videoUrl) {
      return;
    }
    const controller = new AbortController();
    const metadataPromise = (0,_utils_video_capture__WEBPACK_IMPORTED_MODULE_1__/* .getVideoMetadata */ .HY)(videoUrl, controller.signal).catch(() => null);
    const taintPromise = (0,_utils_video_capture__WEBPACK_IMPORTED_MODULE_1__/* .checkCanvasTaint */ .L$)(videoUrl, controller.signal).catch(() => true);
    const timeout = setTimeout(() => {
      controller.abort();
    }, 10000);
    Promise.all([metadataPromise, taintPromise]).then(([metadata, isTainted]) => {
      clearTimeout(timeout);
      if (controller.signal.aborted) {
        return;
      }
      setState(prev => {
        // Only update if URL still matches
        if (prev.url !== videoUrl) {
          return prev;
        }
        return {
          ...prev,
          isProbing: false,
          probedMetadata: metadata ? {
            ...metadata,
            isTainted
          } : null
        };
      });
    }).finally(() => {
      // No additional state update here; handled in .then
    });
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [videoUrl, isProbing]);
  return {
    isProbing,
    probedMetadata
  };
}

/***/ },

/***/ 7877
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ useVideoQuery)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6087);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7143);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(9491);
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_compose__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _api_gallery__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(8533);





/**
 * Hook to query and search for videos or other content types in the WordPress database.
 *
 * @param {Object} inputAttributes Block attributes.
 * @param {number} previewPostId   The ID of the post being previewed.
 * @param {number} refreshToken    Optional value to bump in order to force a refetch
 *                                 (e.g. after uploading a new video attachment).
 * @return {Object} Query results including search results, categories, and tags.
 */
function useVideoQuery(inputAttributes, previewPostId, refreshToken) {
  const attributes = inputAttributes || {};
  const {
    gallery_id,
    gallery_source = 'current',
    gallery_category,
    gallery_tag,
    gallery_orderby = 'post_date',
    gallery_order = 'DESC',
    gallery_include,
    gallery_exclude,
    gallery_pagination,
    gallery_per_page = 6,
    page_number = 1,
    enable_collection_video_limit = false,
    collection_video_limit = 6
  } = attributes;
  const [searchString, setSearchString] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const debouncedSetSearchString = (0,_wordpress_compose__WEBPACK_IMPORTED_MODULE_2__.useDebounce)(setSearchString, 500);

  // These four are only for InspectorControls' gallery-source dropdown UI
  // (category/tag/custom-gallery pickers) — never used to render the grid
  // itself. useBlockPreview sets isPreviewMode on the block-editor store's
  // own settings for every one of our disabled/read-only preview surfaces,
  // where no Inspector ever renders, so skip them there.
  const postTypes = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    if (select('core/block-editor').getSettings()?.isPreviewMode) {
      return [];
    }
    const core = select('core');
    return core ? core.getPostTypes({
      per_page: -1
    }) : [];
  }, []);
  const {
    isSaving,
    isAutosaving
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    const editorStore = select('core/editor');
    if (!editorStore) {
      return {
        isSaving: false,
        isAutosaving: false
      };
    }
    const {
      isSavingPost,
      isAutosavingPost
    } = editorStore;
    return {
      isSaving: isSavingPost ? isSavingPost() : false,
      isAutosaving: isAutosavingPost ? isAutosavingPost() : false
    };
  }, []);
  const [videoResults, setVideoResults] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [totalResults, setTotalResults] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(0);
  const [maxNumPages, setMaxNumPages] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(1);
  const [isResolvingVideos, setIsResolvingVideos] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [searchResults, setSearchResults] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [isResolvingSearch, setIsResolvingSearch] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const viewablePostTypes = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    return (postTypes || []).filter(type => type.viewable && type.slug !== 'attachment').map(type => type.slug);
  }, [postTypes]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (!searchString) {
      setSearchResults([]);
      setIsResolvingSearch(false);
      return;
    }
    setIsResolvingSearch(true);
    const path = `/wp/v2/search?search=${encodeURIComponent(searchString)}&type=post&subtype=${encodeURIComponent(viewablePostTypes.join(','))}&per_page=20`;
    const abortController = new window.AbortController();
    Promise.resolve(/* import() */).then(__webpack_require__.t.bind(__webpack_require__, 1455, 23)).then(({
      default: apiFetch
    }) => {
      apiFetch({
        path,
        signal: abortController.signal
      }).then(results => {
        setSearchResults(results.map(res => ({
          id: res.id,
          title: {
            rendered: res.title?.rendered || res.title || ''
          }
        })));
      }).catch(error => {
        if (error.name !== 'AbortError') {
          console.error('Post Search Error:', error);
        }
      }).finally(() => {
        setIsResolvingSearch(false);
      });
    });
    return () => abortController.abort();
  }, [searchString, viewablePostTypes]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (isSaving || isAutosaving) {
      return;
    }
    let resolvedGalleryId;
    if (gallery_source === 'custom') {
      if (gallery_id) {
        resolvedGalleryId = parseInt(gallery_id, 10);
      }
    } else if (gallery_source === 'current') {
      if (gallery_id) {
        resolvedGalleryId = parseInt(gallery_id, 10);
      } else if (previewPostId) {
        resolvedGalleryId = parseInt(previewPostId, 10);
      }
    }
    const args = {
      gallery_orderby: gallery_orderby || 'post_date',
      gallery_order: gallery_order || 'DESC',
      gallery_per_page: parseInt(gallery_per_page, 10) || 6,
      page_number: parseInt(page_number, 10) || 1,
      gallery_id: resolvedGalleryId,
      gallery_exclude: gallery_exclude || '',
      gallery_source: gallery_source || 'current',
      gallery_category: gallery_category || '',
      gallery_tag: gallery_tag || '',
      gallery_pagination: gallery_pagination ?? false,
      gallery_include: gallery_include || '',
      // addQueryArgs serializes `null` as an empty query-string value
      // (`id=`), which fails the REST route's `type: ['number','null']`
      // validation. Omit the key entirely (addQueryArgs drops
      // `undefined`) when there's no real post ID.
      id: previewPostId || undefined,
      prioritizePostData: attributes.prioritizePostData || false,
      skip_html: true
    };

    // Skip query if required parameters for the source are missing
    const isMissingCustomId = gallery_source === 'custom' && !gallery_id;
    const isMissingCategoryId = gallery_source === 'category' && !gallery_category;
    const isMissingTagId = gallery_source === 'tag' && !gallery_tag;
    const isMissingCurrentId = gallery_source === 'current' && !gallery_id && !previewPostId;
    const isMissingManualInclude = gallery_source === 'manual' && !gallery_include;
    const canQuery = !!inputAttributes && (['recent', 'all'].includes(gallery_source) || gallery_source && !isMissingCustomId && !isMissingCategoryId && !isMissingTagId && !isMissingCurrentId && !isMissingManualInclude);
    if (!canQuery) {
      setVideoResults([]);
      setTotalResults(0);
      setMaxNumPages(1);
      setIsResolvingVideos(false);
      return;
    }
    setIsResolvingVideos(true);
    (0,_api_gallery__WEBPACK_IMPORTED_MODULE_3__/* .getVideoGallery */ .M5)(args).then(response => {
      setVideoResults(response.videos || []);
      setTotalResults(response.total_count || response.videos?.length || 0);
      setMaxNumPages(response.max_num_pages || 1);
    }).catch(error => {
      console.error('Video Query Error:', error);
    }).finally(() => {
      setIsResolvingVideos(false);
    });
  }, [gallery_id, gallery_source, gallery_category, gallery_tag, gallery_orderby, gallery_order, gallery_include, gallery_exclude, gallery_pagination, gallery_per_page, page_number, enable_collection_video_limit, collection_video_limit, previewPostId, attributes.prioritizePostData, isSaving, isAutosaving, !!inputAttributes, refreshToken]);
  const categories = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    if (select('core/block-editor').getSettings()?.isPreviewMode) {
      return [];
    }
    const {
      getEntityRecords
    } = select('core');
    return getEntityRecords('taxonomy', 'category', {
      per_page: -1
    });
  }, []);
  const tags = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    if (select('core/block-editor').getSettings()?.isPreviewMode) {
      return [];
    }
    const {
      getEntityRecords
    } = select('core');
    return getEntityRecords('taxonomy', 'post_tag', {
      per_page: -1
    });
  }, []);
  const manualVideos = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    if (gallery_source !== 'manual' || !gallery_include) {
      return [];
    }
    const {
      getEntityRecords
    } = select('core');
    return getEntityRecords('postType', 'attachment', {
      include: gallery_include,
      per_page: -1
    });
  }, [gallery_source, gallery_include]);
  const {
    customGalleries
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    if (select('core/block-editor').getSettings()?.isPreviewMode) {
      return {
        customGalleries: []
      };
    }
    const {
      getEntityRecords
    } = select('core');
    return {
      customGalleries: getEntityRecords('postType', 'videopack_gallery', {
        per_page: -1
      })
    };
  }, []);
  return {
    isResolving: isResolvingVideos,
    isResolvingSearch,
    videoResults,
    totalResults,
    maxNumPages,
    searchResults,
    categories,
    tags,
    manualVideos,
    customGalleries,
    debouncedSetSearchString
  };
}

/***/ },

/***/ 8016
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7723);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1455);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(9491);
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_compose__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(6087);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_3__);
/**
 * Custom React hook for managing video settings.
 */






// Settings that can be stored per-video in _videopack-meta.
const metaKeys = ['width', 'height', 'downloadlink', 'autoplay', 'loop', 'muted', 'controls', 'volume', 'preload', 'playback_rate', 'playsinline', 'right_click', 'gifmode', 'fixed_aspect', 'align', 'legacy_dimensions', 'resize', 'fullwidth', 'embeddable', 'embedcode', 'overlay_title', 'views', 'starts', 'play_25', 'play_50', 'play_75', 'completeviews', 'watermark', 'watermark_link_to', 'watermark_url', 'poster', 'poster_id', 'total_thumbnails', 'track', 'title_color', 'title_background_color', 'play_button_color', 'play_button_secondary_color', 'control_bar_bg_color', 'control_bar_color'];

/**
 * Hook to manage video settings and synchronize them with attachment metadata.
 *
 * @param {Object}   attributes           Block attributes.
 * @param {Function} setAttributes        Function to update block attributes.
 * @param {Object}   options              Global options/settings.
 * @param {Object}   hookOptions          Hook options.
 * @param {boolean}  hookOptions.autoSave Whether to automatically save to the REST API.
 * @return {Object} Setting change handlers and options.
 */
const useVideoSettings = (attributes, setAttributes, options = {}, {
  autoSave = true
} = {}) => {
  const {
    id,
    gifmode
  } = attributes;
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    if (gifmode) {
      setAttributes({
        autoplay: true,
        loop: true,
        muted: true,
        controls: false
      });
    }
  }, [gifmode, setAttributes]);
  const updateAttachmentCallback = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useCallback)((key, value) => {
    if (id && autoSave) {
      _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_1___default()({
        path: `/wp/v2/media/${id}`,
        method: 'POST',
        data: {
          [key]: value
        }
      }).catch(() => {
        console.error(`Failed to update attachment ${id}`);
      });
    }
  }, [id, autoSave]);
  const updateAttachment = (0,_wordpress_compose__WEBPACK_IMPORTED_MODULE_2__.useDebounce)(updateAttachmentCallback, 1000);

  // Persist the consolidated _videopack-meta object to the REST API.
  // Since WordPress replaces the entire object meta field on POST,
  // we must send the full set of desired overrides ogni volta.
  const updateMetaCallback = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useCallback)(currentAttrs => {
    if (id && autoSave) {
      const metaToSave = {};
      metaKeys.forEach(key => {
        if (key in currentAttrs) {
          const value = currentAttrs[key];

          // Skip empty strings for the title key to allow fallback to attachment title.
          if (key === 'title' && value === '') {
            metaToSave[key] = null;
            return;
          }

          // Only store if it differs from the global option.
          if (options[key] !== undefined && value === options[key]) {
            metaToSave[key] = null;
          } else {
            metaToSave[key] = value;
          }
        }
      });
      _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_1___default()({
        path: `/wp/v2/media/${id}`,
        method: 'POST',
        data: {
          meta: {
            '_videopack-meta': metaToSave
          }
        }
      }).catch(() => {
        console.error(`Failed to update _videopack-meta for attachment ${id}`);
      });
    }
  }, [id, options, autoSave]);
  const updateMeta = (0,_wordpress_compose__WEBPACK_IMPORTED_MODULE_2__.useDebounce)(updateMetaCallback, 1000);
  const handleSettingChange = (key, value) => {
    let updatedAttrs;
    if (typeof key === 'object' && key !== null) {
      const processedKey = {
        ...key
      };
      if ('title' in processedKey && processedKey.title === '') {
        processedKey.title = undefined;
      }
      updatedAttrs = {
        ...attributes,
        ...processedKey
      };
      setAttributes(processedKey);
    } else {
      const processedValue = key === 'title' && value === '' ? undefined : value;
      updatedAttrs = {
        ...attributes,
        [key]: processedValue
      };
      setAttributes({
        [key]: processedValue
      });
    }
    if (id) {
      // Handle caption updates for the attachment record.
      if (typeof key === 'object' && key !== null) {
        if ('caption' in key) {
          updateAttachment('caption', key.caption);
        }
        if ('title' in key) {
          updateAttachment('title', key.title);
        }
      } else if ('caption' === key || 'title' === key) {
        updateAttachment(key, value);
      }

      // Check if any of the updated keys belong in _videopack-meta.
      const updatedKeys = typeof key === 'object' && key !== null ? Object.keys(key) : [key];
      const shouldUpdateMeta = updatedKeys.some(k => metaKeys.includes(k));
      if (shouldUpdateMeta) {
        updateMeta(updatedAttrs);
      }
    }
  };
  const preloadOptions = [{
    value: 'auto',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Auto', 'video-embed-thumbnail-generator')
  }, {
    value: 'metadata',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Metadata', 'video-embed-thumbnail-generator')
  }, {
    value: 'none',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__._x)('None', 'Preload value')
  }];
  return {
    handleSettingChange,
    preloadOptions
  };
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (useVideoSettings);
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "A", 0, /* export default binding */ __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ ]);


/***/ },

/***/ 5633
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Ay: () => (/* binding */ useVideopackContext)
/* harmony export */ });
/* unused harmony export VIDEOPACK_CONTEXT_KEYS */
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6087);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7143);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _utils_context__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6225);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(2619);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_3__);






// Stable reference for callers that don't pass their own excludeKeys — a
// literal `[]` default would be a new array every call (JS re-evaluates
// default param expressions per invocation), which would defeat the
// `initial` useMemo below on every render since excludeKeys is a dependency.
const EMPTY_EXCLUDE_KEYS = [];
const DEFAULT_CONTEXT_KEYS = ['skin', 'title_color', 'title_background_color', 'play_button_color', 'play_button_secondary_color', 'control_bar_bg_color', 'control_bar_color', 'pagination_color', 'pagination_background_color', 'pagination_active_bg_color', 'pagination_active_color', 'watermark', 'watermark_styles', 'watermark_align', 'watermark_valign', 'watermark_scale', 'watermark_x', 'watermark_y', 'watermark_link_to', 'align', 'gallery_per_page', 'gallery_source', 'gallery_id', 'gallery_category', 'gallery_tag', 'gallery_orderby', 'gallery_order', 'gallery_include', 'gallery_exclude', 'layout', 'columns', 'gallery_pagination', 'gallery_title', 'videos', 'enable_collection_video_limit', 'collection_video_limit', 'prioritizePostData', 'embed_method', 'isPreview', 'isStandalone', 'src', 'poster', 'title', 'views', 'duration', 'videopack', 'caption', 'width', 'height', 'autoplay', 'controls', 'loop', 'muted', 'playsinline', 'preload', 'volume', 'auto_res', 'sources', 'source_groups', 'text_tracks', 'playback_rate', 'downloadlink', 'embedcode', 'embedlink', 'showCaption', 'showBackground', 'title_position', 'restartCount', 'duotone', 'style', 'loopDuotoneId', 'fixed_aspect', 'fullwidth', 'rotate', 'default_ratio', 'currentPage', 'totalPages', 'onPageChange', 'isInsideThumbnail', 'isInsidePlayerOverlay', 'isInsidePlayerContainer', 'isInsideTitleMeta'];
const VIDEOPACK_CONTEXT_KEYS =
/**
 * Filters the list of Gutenberg block context keys that the hook listens to.
 *
 * @since 5.0.0
 *
 * @param {Array} contextKeys List of context key strings.
 */
(0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_3__.applyFilters)('videopack.contextKeys', DEFAULT_CONTEXT_KEYS);

/**
 * Hook to resolve Videopack design context and generate styles/classes.
 *
 * @param {Object} attributes Block attributes.
 * @param {Object} context    Block context.
 * @param {Object} options    Optional configuration.
 * @return {Object} Resolved values, styles, and classes.
 */
function useVideopackContext(attributes, context, options = {}) {
  const {
    excludeHoverTrigger: optionsExclude = false,
    excludeKeys = EMPTY_EXCLUDE_KEYS,
    // Restricts which resolved values become videopack-has-{key} classes /
    // --videopack-{key} CSS vars (unlike excludeKeys, resolved[key] is still
    // always computed — only the stamping is scoped). null means "stamp
    // everything", matching prior behavior for any caller that doesn't pass it.
    classKeys = null
  } = options;
  // The hover trigger exclusion should NOT be inherited from parents by default,
  // as containers (Collections/Loops) might opt-out while their children (Players) should still hover.
  const excludeHoverTrigger = optionsExclude || attributes.exclude_hover_trigger || false;

  // 1. Initial Synchronous Resolution
  const initial = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    const resolved = {};
    const style = {};
    const classes = [];
    VIDEOPACK_CONTEXT_KEYS.forEach(key => {
      if (excludeKeys.includes(key)) {
        return;
      }
      const value = (0,_utils_context__WEBPACK_IMPORTED_MODULE_2__/* .getEffectiveValue */ .tO)(key, attributes, context);
      resolved[key] = value;
      if (value && (classKeys === null || classKeys.includes(key))) {
        const cssKey = key.replace(/_/g, '-');
        if (typeof value === 'string' || typeof value === 'number') {
          const cssVar = `--videopack-${cssKey}`;
          style[cssVar] = value;
        }

        // Only add classes for colors/styles that are actually set
        if (key !== 'skin') {
          classes.push(`videopack-has-${cssKey}`);

          // Add specific class for embed method value
          if (key === 'embed_method') {
            const embedClass = `videopack-embed-${String(value).toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
            classes.push(embedClass);
          }
        }
      }
    });

    // Special handling for skin class
    if (resolved.skin && resolved.skin !== 'default') {
      classes.push(resolved.skin);
    }

    // Handle Gutenberg "style" attribute (typography, spacing, etc).
    if (attributes.style && typeof attributes.style === 'object') {
      // Typography Support
      if (attributes.style.typography) {
        const {
          fontSize,
          lineHeight,
          letterSpacing
        } = attributes.style.typography;
        if (fontSize) {
          if (fontSize.startsWith('var:preset|font-size|')) {
            const slug = fontSize.split('|').pop();
            style.fontSize = `var(--wp--preset--font-size--${slug})`;
          } else {
            style.fontSize = fontSize;
          }
        }
        if (lineHeight) {
          style.lineHeight = lineHeight;
        }
        if (letterSpacing) {
          style.letterSpacing = letterSpacing;
        }
      }

      // Spacing Support (Margin/Padding)
      if (attributes.style.spacing) {
        Object.entries(attributes.style.spacing).forEach(([type, values]) => {
          if (values && typeof values === 'object') {
            Object.entries(values).forEach(([dir, val]) => {
              let finalVal = val;
              if (typeof val === 'string' && val.startsWith('var:preset|spacing|')) {
                const slug = val.split('|').pop();
                finalVal = `var(--wp--preset--spacing--${slug})`;
              }
              style[`${type}${dir.charAt(0).toUpperCase()}${dir.slice(1)}`] = finalVal;
            });
          }
        });
      }
    }
    resolved.isEditingAllPages = (0,_utils_context__WEBPACK_IMPORTED_MODULE_2__/* .isTrue */ .Hn)((0,_utils_context__WEBPACK_IMPORTED_MODULE_2__/* .getEffectiveValue */ .tO)('isEditingAllPages', attributes, context));
    resolved.prioritizePostData = (0,_utils_context__WEBPACK_IMPORTED_MODULE_2__/* .isTrue */ .Hn)((0,_utils_context__WEBPACK_IMPORTED_MODULE_2__/* .getEffectiveValue */ .tO)('prioritizePostData', attributes, context));
    resolved.isStandalone = (0,_utils_context__WEBPACK_IMPORTED_MODULE_2__/* .isTrue */ .Hn)((0,_utils_context__WEBPACK_IMPORTED_MODULE_2__/* .getEffectiveValue */ .tO)('isStandalone', attributes, context));
    // Core data identification
    resolved.postId = (0,_utils_context__WEBPACK_IMPORTED_MODULE_2__/* .getEffectiveValue */ .tO)('postId', attributes, context);
    resolved.attachmentId = (0,_utils_context__WEBPACK_IMPORTED_MODULE_2__/* .getEffectiveValue */ .tO)('attachmentId', attributes, context);
    resolved.postType = (0,_utils_context__WEBPACK_IMPORTED_MODULE_2__/* .getEffectiveValue */ .tO)('postType', attributes, context);

    // Handle Gutenberg Typography Classes (Presets)
    if (attributes.fontSize) {
      classes.push(`has-${attributes.fontSize}-font-size`);
    }
    if (attributes.fontFamily) {
      classes.push(`has-${attributes.fontFamily}-font-family`);
    }
    if (!excludeHoverTrigger) {
      classes.push('videopack-hover-trigger');
    }
    return {
      resolved,
      style,
      classes
    };
  }, [attributes, context, excludeHoverTrigger, excludeKeys, classKeys]);

  // 2. Automatic Video Discovery
  // If we have a postId but no attachmentId, try to find the first video attachment.
  const {
    discoveredAttachmentId,
    isDiscovering
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    const {
      resolved
    } = initial;

    // If we already have an attachmentId, a manual src, or a saved id, we're not discovering.
    if (resolved.attachmentId || attributes.src || attributes.id) {
      return {
        discoveredAttachmentId: resolved.attachmentId || attributes.id,
        isDiscovering: false
      };
    }

    // If we don't even have a postId, we can't discover anything.
    if (!resolved.postId || resolved.postId < 1) {
      return {
        discoveredAttachmentId: null,
        isDiscovering: false
      };
    }

    // Avoid duplicates: Find IDs already used by other blocks
    const {
      getBlocks
    } = select('core/block-editor');
    const allBlocks = getBlocks();
    const usedIds = new Set();
    const findUsedIds = blocks => {
      blocks.forEach(block => {
        if (block.name === 'videopack/player-container' && block.attributes.id) {
          usedIds.add(Number(block.attributes.id));
        }
        if (block.innerBlocks) {
          findUsedIds(block.innerBlocks);
        }
      });
    };
    findUsedIds(allBlocks);

    // If the postId itself IS an attachment, then that's our attachmentId.
    if (resolved.postType === 'attachment') {
      const id = Number(resolved.postId);
      // Only use it if it's not already taken by another block
      if (!usedIds.has(id)) {
        return {
          discoveredAttachmentId: id,
          isDiscovering: false
        };
      }
    }

    // Otherwise, try to find a video attachment for this post that isn't already used.
    const {
      getEntityRecords
    } = select('core');
    const query = {
      parent: resolved.postId,
      media_type: 'video',
      per_page: 20,
      // Fetch more to allow skipping duplicates and non-videos
      _fields: 'id,mime_type'
    };
    const attachments = getEntityRecords('postType', 'attachment', query);
    const isResolving = select('core/data').isResolving('core', 'getEntityRecords', ['postType', 'attachment', query]);

    // Pick the first one that is a video AND isn't already used
    const foundId = attachments?.find(a => a.mime_type?.startsWith('video/') && !usedIds.has(Number(a.id)))?.id || null;
    return {
      discoveredAttachmentId: foundId,
      isDiscovering: isResolving || !foundId && attachments === undefined
    };
  }, [attributes.src, attributes.id, initial]);
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    const rawAttachmentId = initial.resolved.attachmentId || discoveredAttachmentId || attributes.id;

    // Safety: If the resolved attachment ID is the same as the post ID,
    // and we know the post is NOT an attachment, then it's a false resolution.
    const finalAttachmentId = rawAttachmentId && rawAttachmentId === initial.resolved.postId && initial.resolved.postType && initial.resolved.postType !== 'attachment' && !attributes.id ? null : rawAttachmentId;
    const finalResolved = {
      ...initial.resolved,
      attachmentId: finalAttachmentId,
      isDiscovering
    };

    // 3. Generate Shared Context Bridge
    const sharedContext = {};
    VIDEOPACK_CONTEXT_KEYS.forEach(key => {
      if (finalResolved[key] !== undefined && finalResolved[key] !== null) {
        sharedContext[`videopack/${key}`] = finalResolved[key];
      }
    });

    // Add core metadata to shared context
    sharedContext['videopack/postId'] = finalResolved.postId;
    sharedContext['videopack/attachmentId'] = finalResolved.attachmentId;
    sharedContext['videopack/postType'] = finalResolved.postType;
    sharedContext['videopack/isEditingAllPages'] = finalResolved.isEditingAllPages;
    sharedContext['videopack/prioritizePostData'] = finalResolved.prioritizePostData;
    sharedContext['videopack/isStandalone'] = finalResolved.isStandalone;
    return {
      resolved: finalResolved,
      style: initial.style,
      classes: initial.classes.join(' '),
      sharedContext
    };
  }, [initial, discoveredAttachmentId, isDiscovering, attributes.id]);
}

/***/ },

/***/ 8516
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ useVideopackData)
/* harmony export */ });
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7143);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_context__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6225);



/**
 * Hook to resolve specific video data from context or the WordPress database.
 *
 * @param {string} key     The data key to resolve (e.g., 'title', 'views', 'duration').
 * @param {Object} context The block context.
 * @return {*} The resolved data value.
 */
function useVideopackData(key, context = {}) {
  const contextKey = `videopack/${key}`;
  const contextValue = context[contextKey];
  const ctxAttachmentId = context['videopack/attachmentId'];
  const ctxPostId = context['videopack/postId'];
  const ctxPostType = context['videopack/postType'];
  const propPostId = context.postId;
  const propPostType = context.postType;
  const isStandalone = (0,_utils_context__WEBPACK_IMPORTED_MODULE_1__/* .isTrue */ .Hn)(context['videopack/isStandalone']);
  const resolvedData = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.useSelect)(select => {
    // 1. If context already has the value, we're done.
    if (contextValue !== undefined && contextValue !== null) {
      return {
        data: contextValue,
        isResolving: false
      };
    }

    // 2. Otherwise, we need an ID to fetch from the database.
    const isParentRequest = key === 'parentTitle';
    const attachmentId = isParentRequest ? ctxPostId || propPostId : ctxAttachmentId || (ctxPostType === 'attachment' ? ctxPostId : null) || (propPostType === 'attachment' ? propPostId : null);
    let postType = ctxPostType || propPostType || 'post';

    // If we are looking for a video (attachment) and we have an explicit attachmentId,
    // or we are in standalone mode, then the postType should be 'attachment'.
    if (!isParentRequest && (ctxAttachmentId || isStandalone)) {
      postType = 'attachment';
    }
    if (!attachmentId) {
      return {
        data: null,
        isResolving: false
      };
    }
    const {
      getEntityRecord
    } = select('core');
    const record = getEntityRecord('postType', postType, attachmentId);
    const isResolving = select('core/data').isResolving('core', 'getEntityRecord', ['postType', postType, attachmentId]);
    if (!record) {
      return {
        data: null,
        isResolving
      };
    }

    // 3. Map the requested key to the record's property.
    let data = null;
    switch (key) {
      case 'title':
      case 'parentTitle':
        data = record.title?.rendered || record.title || '';
        break;
      case 'caption':
        data = record.caption?.rendered || record.caption || '';
        break;
      case 'views':
        data = record.videopack?.views || record.meta?.videopack_views || record.meta?.['_videopack-meta']?.starts || 0;
        break;
      case 'duration':
        data = record.videopack?.duration || record.meta?.['_videopack-meta']?.duration || '';
        break;
      case 'embedlink':
        data = record.videopack?.embed_url || record.videopack?.embedlink || '';
        break;
      case 'videopack':
        data = record.videopack || null;
        break;
      default:
        data = record[key] || null;
    }
    return {
      data,
      isResolving
    };
  }, [key, contextValue, ctxAttachmentId, ctxPostId, ctxPostType, propPostId, propPostType, isStandalone]);
  return resolvedData || {
    data: null,
    isResolving: false
  };
}

/***/ },

/***/ 5597
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6087);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);

const VideopackContext = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createContext)({
  gallery_pagination: undefined,
  gallery_per_page: undefined,
  totalPages: undefined,
  currentPage: undefined
});
const VideopackProvider = VideopackContext.Provider;
const useVideopackContext = () => (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useContext)(VideopackContext);
/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = ((/* unused pure expression or super */ null && (VideopackContext)));
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "Vy", 0, /* binding */ useVideopackContext,
/* harmony export */   "Yh", 0, /* binding */ VideopackProvider
/* harmony export */ ]);


/***/ },

/***/ 7068
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2619);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__);

const getColorFallbacks = settings => {
  const globalOptions = typeof videopack_config !== 'undefined' ? videopack_config?.options || {} : {};
  const resolveColor = (key, skinDefault) => {
    if (settings && settings[key] !== undefined && settings[key] !== null && settings[key] !== '') {
      return settings[key];
    }
    if (globalOptions && globalOptions[key] !== undefined && globalOptions[key] !== null && globalOptions[key] !== '') {
      return globalOptions[key];
    }
    return skinDefault;
  };
  const {
    embed_method = 'Video.js',
    skin = 'vjs-theme-videopack'
  } = settings || globalOptions || {};
  const fallbacks = {
    title_color: resolveColor('title_color', '#ffffff'),
    title_background_color: resolveColor('title_background_color', '#2b333f'),
    play_button_color: resolveColor('play_button_color', '#ffffff'),
    play_button_secondary_color: resolveColor('play_button_secondary_color', '#ffffff'),
    control_bar_bg_color: resolveColor('control_bar_bg_color', '#2b333f'),
    control_bar_color: resolveColor('control_bar_color', '#ffffff'),
    pagination_color: resolveColor('pagination_color', '#1e1e1e'),
    pagination_background_color: resolveColor('pagination_background_color', '#ffffff'),
    pagination_active_bg_color: resolveColor('pagination_active_bg_color', '#1e1e1e'),
    pagination_active_color: resolveColor('pagination_active_color', '#ffffff')
  };
  if (embed_method === 'WordPress Default') {
    fallbacks.title_background_color = resolveColor('title_background_color', 'rgba(40, 40, 40, 0.95)');
    fallbacks.control_bar_bg_color = resolveColor('control_bar_bg_color', '#222222');
    fallbacks.play_button_color = resolveColor('play_button_color', '#ffffff');
    fallbacks.play_button_secondary_color = resolveColor('play_button_secondary_color', '#ffffff');
  } else if (embed_method?.startsWith('Video.js')) {
    // Default skin (vjs-theme-videopack) defaults
    fallbacks.play_button_color = resolveColor('play_button_color', '#ffffff');
    fallbacks.play_button_secondary_color = resolveColor('play_button_secondary_color', '#2b333f'); // Videopack Grey accent

    switch (skin) {
      case 'vjs-theme-city':
        fallbacks.title_background_color = resolveColor('title_background_color', '#bf3b4d');
        fallbacks.control_bar_bg_color = resolveColor('control_bar_bg_color', '#000000');
        fallbacks.pagination_active_bg_color = resolveColor('pagination_active_bg_color', '#bf3b4d');
        break;
      case 'vjs-theme-fantasy':
        fallbacks.title_background_color = resolveColor('title_background_color', '#9f44b4');
        fallbacks.play_button_color = resolveColor('play_button_color', '#9f44b4');
        fallbacks.play_button_secondary_color = resolveColor('play_button_secondary_color', '#ffffff');
        fallbacks.pagination_active_bg_color = resolveColor('pagination_active_bg_color', '#9f44b4');
        break;
      case 'vjs-theme-forest':
        fallbacks.title_background_color = resolveColor('title_background_color', '#6fb04e');
        fallbacks.play_button_secondary_color = resolveColor('play_button_secondary_color', '#6fb04e');
        fallbacks.control_bar_bg_color = resolveColor('control_bar_bg_color', 'transparent');
        fallbacks.pagination_active_bg_color = resolveColor('pagination_active_bg_color', '#6fb04e');
        break;
      case 'vjs-theme-sea':
        fallbacks.title_background_color = resolveColor('title_background_color', '#4176bc');
        fallbacks.play_button_secondary_color = resolveColor('play_button_secondary_color', '#4176bc');
        fallbacks.control_bar_bg_color = resolveColor('control_bar_bg_color', 'rgba(255, 255, 255, 0.4)');
        fallbacks.pagination_active_bg_color = resolveColor('pagination_active_bg_color', '#4176bc');
        break;
      case 'kg-video-js-skin':
        fallbacks.title_background_color = resolveColor('title_background_color', '#000000');
        fallbacks.play_button_secondary_color = resolveColor('play_button_secondary_color', '#000000');
        fallbacks.control_bar_bg_color = resolveColor('control_bar_bg_color', '#000000');
        fallbacks.pagination_active_bg_color = resolveColor('pagination_active_bg_color', '#000000');
        break;
    }
  }
  return (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.applyFilters)(
  /**
   * Filters the resolved color fallback values used for the player preview
   * and color picker placeholders when no explicit color has been chosen.
   *
   * @since 5.0.0
   *
   * @param {Object} fallbacks   Map of color fallback values.
   * @param {string} embed_method The selected player embed method.
   * @param {string} skin         The selected player skin.
   */
  'videopack.colorFallbacks', fallbacks, embed_method, skin);
};
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "l", 0, /* binding */ getColorFallbacks
/* harmony export */ ]);


/***/ },

/***/ 6225
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* unused harmony export normalizeSourceGroups */
/* global videopack_config */

/**
 * Helper to check if a value is truthy, handling both booleans and string values from PHP.
 *
 * @param {*} val Value to check.
 * @return {boolean} True if truthy.
 */
const isTrue = val => {
  if (val === true || val === 'true' || val === 1 || val === '1' || val === 'on' || val === 'yes') {
    return true;
  }
  return false;
};

/**
 * Resolves an effective design value by checking local overrides, inherited context,
 * and finally global plugin defaults.
 *
 * @param {string} key        The key to resolve (e.g., 'skin', 'title_color').
 * @param {Object} attributes The block's own attributes.
 * @param {Object} context    The inherited block context.
 * @return {*} The resolved value.
 */
const getEffectiveValue = (key, attributes = {}, context = {}) => {
  const contextKey = key.includes('/') ? key : `videopack/${key}`;
  const attrKey = key.includes('/') ? key.split('/')[1] : key;

  // Helper to check if a value is valid (not undefined, null, or empty string)
  const isValid = val => val !== undefined && val !== null && val !== '';

  // Mappings for settings that have different names in blocks vs global options
  const altAttrKey = {
    columns: 'gallery_columns',
    layout: 'gallery_layout',
    align: 'gallery_align',
    pagination: 'gallery_pagination',
    per_page: 'gallery_per_page'
  }[attrKey];

  // 1. Check local attribute override
  if (isValid(attributes[attrKey])) {
    // Special case for isPreview: if local is false but context is true, prefer context true
    if (attrKey === 'isPreview' && !attributes[attrKey] && isTrue(context[contextKey])) {
      return true;
    }
    return attributes[attrKey];
  }

  // 1b. Check mapped attribute (e.g. settings object from VideoCollectionSettings)
  if (altAttrKey && isValid(attributes[altAttrKey])) {
    return attributes[altAttrKey];
  }
  if (attrKey === 'postId' && isValid(attributes.id) && !isValid(context[contextKey])) {
    return attributes.id;
  }
  if (attrKey === 'attachmentId' && isValid(attributes.id)) {
    return attributes.id;
  }

  // 2. Check inherited context (from Collection or Video block)
  if (isValid(context[contextKey])) {
    return context[contextKey];
  }

  // If we are resolving postType and we have an attachmentId but no explicit postType context,
  // assume it's an attachment.
  if (attrKey === 'postType') {
    const attachmentId = getEffectiveValue('attachmentId', attributes, context);
    const postId = getEffectiveValue('postId', attributes, context);
    if (attachmentId && attachmentId === postId && !isValid(context[contextKey])) {
      return 'attachment';
    }
  }

  // 2b. Check standard Gutenberg context fallbacks
  if (attrKey === 'postType' && isValid(attributes.id) && !isValid(context[contextKey])) {
    return 'attachment';
  }
  if ((attrKey === 'postId' || attrKey === 'postType') && isValid(context[attrKey])) {
    return context[attrKey];
  }

  // 3. Fallback to global plugin defaults
  const globalOptions = videopack_config?.options || {};
  const globalDefaults = videopack_config?.defaults || {};
  if (attrKey === 'skin') {
    const localValue = attributes[attrKey] || context[contextKey];
    if (isValid(localValue)) {
      return localValue;
    }
    return globalOptions.skin || globalDefaults.skin || videopack_config?.skin || 'vjs-theme-videopack';
  }
  if (attrKey === 'layout') {
    const localValue = attributes[attrKey] || attributes.gallery_layout || context[contextKey];
    if (isValid(localValue)) {
      return localValue;
    }
    return globalOptions.gallery_layout || globalOptions.layout || globalDefaults.gallery_layout || globalDefaults.layout || 'grid';
  }
  if (attrKey === 'align') {
    const localValue = attributes[attrKey] || attributes.gallery_align || context[contextKey];
    if (isValid(localValue)) {
      return localValue;
    }
    // Collections use gallery_align as their global default
    const isCollection = attributes.layout || attributes.gallery_layout || context['videopack/layout'];
    if (isCollection) {
      return globalOptions.gallery_align || globalOptions.align || globalDefaults.align || '';
    }
    return globalOptions.align || globalDefaults.align || '';
  }
  if (attrKey === 'columns') {
    const localValue = attributes[attrKey] || attributes.gallery_columns || context[contextKey];
    if (isValid(localValue)) {
      return localValue;
    }
    const isCollection = attributes.layout || attributes.gallery_layout || context['videopack/layout'];
    if (isCollection) {
      return globalOptions.gallery_columns || globalDefaults.gallery_columns || 3;
    }
    return globalOptions.columns || globalDefaults.columns || 3;
  }
  if (attrKey === 'title_position') {
    // Priority logic for title_position is now partially handled in the component
    // to allow for context-aware defaults (like bottom for thumbnails).
    const localValue = attributes[attrKey] || context[contextKey];
    if (isValid(localValue)) {
      return localValue;
    }
    return globalOptions.title_position || globalDefaults.title_position || 'top';
  }
  const globalValue = globalOptions[attrKey] ?? globalDefaults[attrKey] ?? videopack_config?.[attrKey];
  const finalValue = isValid(globalValue) ? globalValue : undefined;
  return finalValue;
};

/**
 * Normalizes video sources from the API into source_groups for the player.
 *
 * @param {Object} videoSources Grouped sources returned from the API.
 * @return {Object} Grouped sources.
 */
const normalizeSourceGroups = videoSources => {
  if (!videoSources || typeof videoSources !== 'object') {
    return {};
  }

  // If it's already in the grouped format { codecId: { label, sources } }, return it
  return videoSources;
};
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "Hn", 0, /* binding */ isTrue,
/* harmony export */   "tO", 0, /* binding */ getEffectiveValue
/* harmony export */ ]);


/***/ },

/***/ 1087
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   i: () => (/* binding */ resolveGalleryVideoSelection)
/* harmony export */ });
/**
 * Shared decision logic for handling media selected/uploaded via the
 * Collection/Loop "Add Video" controls (toolbar button or empty-state
 * placeholder). Both blocks read/write the same gallery_source/gallery_include
 * attributes, just via different props (Collection owns them directly, Loop
 * receives them through block context and updates its parent) — this keeps
 * the actual selection/attach logic in one place.
 *
 * If the gallery is already in Manual mode, selected/uploaded videos are
 * simply added to the manual list (post_parent is irrelevant there).
 *
 * Otherwise (gallery_source is "current" or another dynamic source): a
 * freshly uploaded file is already attached to this post by the editor's own
 * upload handler, so no attribute change is needed — the query already picks
 * it up. But an item picked from the existing Media Library may belong to a
 * different post entirely — rather than silently reparenting someone else's
 * attachment, the gallery is switched to Manual mode with the selected
 * video(s) instead.
 *
 * @param {Object}       params
 * @param {Object|Array} params.media          Selected attachment object(s).
 * @param {string}       params.gallerySource  Current gallery_source value.
 * @param {string}       params.galleryInclude Current gallery_include value.
 * @param {number}       params.previewPostId  The current post's ID.
 * @return {{type: 'none'}|{type: 'no-change'}|{type: 'update', updates: Object}} Result.
 */
function resolveGalleryVideoSelection({
  media,
  gallerySource,
  galleryInclude,
  previewPostId
}) {
  const mediaArray = (Array.isArray(media) ? media : [media]).filter(item => item?.id);
  if (!mediaArray.length) {
    return {
      type: 'none'
    };
  }
  const newIds = mediaArray.map(item => item.id.toString());
  if (gallerySource === 'manual') {
    const currentInclude = galleryInclude ? galleryInclude.split(',').map(id => id.trim()) : [];
    return {
      type: 'update',
      updates: {
        gallery_include: [...new Set([...currentInclude, ...newIds])].join(','),
        gallery_orderby: 'include'
      }
    };
  }

  // The React <MediaUpload>/<MediaPlaceholder> components normalize the
  // uploaded-to-post field as `.parent`, but a raw wp.media() Backbone
  // frame's attachment.toJSON() exposes the same value as `.uploadedTo` —
  // check both since this function is used by both selection paths.
  const alreadyAttachedHere = mediaArray.every(item => (item.parent ?? item.uploadedTo) === previewPostId);
  if (alreadyAttachedHere) {
    return {
      type: 'no-change'
    };
  }
  return {
    type: 'update',
    updates: {
      gallery_include: newIds.join(','),
      gallery_source: 'manual',
      gallery_orderby: 'include'
    }
  };
}

/***/ },

/***/ 2711
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* unused harmony exports generateShortcode, parseShortcode, stripHtml */
/**
 * Helper functions for Videopack shortcodes and options.
 */

/**
 * Normalizes Videopack options, ensuring correct types and defaults.
 *
 * @param {Object} options The raw options to normalize.
 */
const normalizeOptions = options => {
  const normalized = {
    ...options
  };

  // Boolean conversions
  const booleans = ['autoplay', 'loop', 'muted', 'controls', 'playback_rate', 'playsinline', 'downloadlink', 'overlay_title', 'nativecontrolsfortouch', 'pauseothervideos', 'right_click', 'gallery_pagination', 'gallery_title', 'views', 'auto_res'];
  booleans.forEach(key => {
    if (Object.prototype.hasOwnProperty.call(normalized, key)) {
      const val = normalized[key];
      normalized[key] = val === 'true' || val === true || val === '1' || val === 1 || val === 'on';
    }
  });

  // Number conversions
  const numbers = ['width', 'height', 'auto_thumb_number', 'auto_thumb_position'];
  numbers.forEach(key => {
    if (Object.prototype.hasOwnProperty.call(normalized, key)) {
      normalized[key] = Number(normalized[key]);
    }
  });
  return normalized;
};

/**
 * Generates a WordPress shortcode string from an attributes object.
 *
 * @param {string} tag        The shortcode tag name.
 * @param {Object} attributes The attributes for the shortcode.
 * @param {string} content    Optional. The content enclosed by the shortcode.
 */
const generateShortcode = (tag, attributes, content = '') => {
  let shortcode = `[${tag}`;
  Object.keys(attributes).forEach(key => {
    const val = attributes[key];
    if (val !== undefined && val !== null && val !== '') {
      shortcode += ` ${key}="${val}"`;
    }
  });
  shortcode += `]${content}[/${tag}]`;
  return shortcode;
};

/**
 * Rudimentary parser for Videopack shortcodes.
 *
 * @param {string} shortcode The shortcode string to parse.
 */
const parseShortcode = shortcode => {
  const regex = /\[(\w+)\s+([^\]]+)\]/g;
  const match = regex.exec(shortcode);
  if (!match) {
    return null;
  }
  const tag = match[1];
  const attrString = match[2];
  const attributes = {};
  const attrRegex = /(\w+)="([^"]*)"/g;
  let attrMatch;
  while ((attrMatch = attrRegex.exec(attrString)) !== null) {
    attributes[attrMatch[1]] = attrMatch[2];
  }
  return {
    tag,
    attributes
  };
};

/**
 * Strips HTML tags from a string.
 *
 * @param {string} html The string to strip.
 * @return {string} The stripped string.
 */
const stripHtml = html => {
  if (typeof html !== 'string') {
    return html;
  }

  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
};
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "a5", 0, /* binding */ normalizeOptions
/* harmony export */ ]);


/***/ },

/***/ 2629
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var _titleDownloadBlock__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1067);
/**
 * Shared block templates for Videopack collections.
 */



/**
 * Returns the template for a grid/gallery layout.
 *
 * @param {Object} options Plugin or block options.
 * @return {Array} The block template.
 */
const getGridTemplate = options => {
  const loopChildren = [['videopack/thumbnail', {
    linkTo: 'lightbox'
  }, [['videopack/play-button', {}], options?.overlay_title !== false ? ['videopack/title', {}] : null].filter(Boolean)]];
  const template = [['videopack/loop', {}, loopChildren]];
  if (options?.gallery_pagination) {
    template.push(['videopack/pagination', {}]);
  }
  return template;
};

/**
 * Returns the template for a list layout.
 *
 * @param {Object} options Plugin or block options.
 * @return {Array} The block template.
 */
const getListTemplate = options => {
  const showTitleBar = !!(options?.overlay_title || options?.downloadlink || options?.embedcode);
  const engineChildren = [];
  if (showTitleBar) {
    engineChildren.push(['videopack/title', {}, (0,_titleDownloadBlock__WEBPACK_IMPORTED_MODULE_0__/* .getTitleInnerTemplate */ .jM)(!!options?.downloadlink, !!options?.embedcode)]);
  }
  if (options?.watermark) {
    engineChildren.push(['videopack/watermark', {}]);
  }
  const videoChildren = [['videopack/player', {
    lock: {
      remove: true,
      move: false
    }
  }, engineChildren]];
  if (options?.views) {
    videoChildren.push(['videopack/view-count', {}]);
  }
  const loopChildren = [['videopack/player-container', {}, videoChildren]];
  const template = [['videopack/loop', {}, loopChildren]];
  if (options?.gallery_pagination) {
    template.push(['videopack/pagination', {}]);
  }
  return template;
};
/**
 * Returns the template for a feed layout (rich metadata).
 *
 * @param {Object} options Plugin or block options.
 * @return {Array} The block template.
 */
const getFeedTemplate = options => {
  const loopChildren = [['videopack/thumbnail', {
    linkTo: 'parent'
  }, [['videopack/duration', {
    position: 'bottom',
    style: {
      typography: {
        fontSize: '14px'
      }
    }
  }]]], ['videopack/title', {}], ['core/post-date', {
    metadata: {
      bindings: {
        datetime: {
          source: 'core/post-data',
          args: {
            field: 'date'
          }
        }
      }
    }
  }], ['videopack/view-count', {
    iconType: 'playOutline'
  }]];
  const template = [['videopack/loop', {}, loopChildren]];
  if (options?.gallery_pagination) {
    template.push(['videopack/pagination', {}]);
  }
  return template;
};
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "D9", 0, /* binding */ getGridTemplate,
/* harmony export */   "bb", 0, /* binding */ getListTemplate,
/* harmony export */   "jV", 0, /* binding */ getFeedTemplate
/* harmony export */ ]);


/***/ },

/***/ 1067
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* unused harmony exports TITLE_DOWNLOAD_BLOCK_ATTRS, TITLE_SHARE_BLOCK_ATTRS */
/**
 * Default inner download block for the title meta bar (matches legacy shortcode output).
 */
const TITLE_DOWNLOAD_BLOCK_ATTRS = {
  icon: true,
  text: false,
  styleType: 'text',
  downloadMode: 'direct'
};
const TITLE_SHARE_BLOCK_ATTRS = {
  iconType: 'share',
  showText: false,
  styleType: 'text'
};

/**
 * InnerBlocks template for videopack/title when download and/or share should be shown.
 *
 * @param {boolean} includeDownload Whether to include the download block.
 * @param {boolean} includeShare    Whether to include the share block.
 * @return {Array} Block template array.
 */
const getTitleInnerTemplate = (includeDownload, includeShare) => {
  const template = [];
  if (includeDownload) {
    template.push(['videopack/download', TITLE_DOWNLOAD_BLOCK_ATTRS]);
  }
  if (includeShare) {
    template.push(['videopack/share', TITLE_SHARE_BLOCK_ATTRS]);
  }
  return template;
};
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "jM", 0, /* binding */ getTitleInnerTemplate
/* harmony export */ ]);


/***/ },

/***/ 266
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* unused harmony export drawWatermark */
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7723);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/**
 * Utility functions for capturing video frames and processing thumbnails.
 */

/* global Image */



/**
 * Captures a frame from a video element or URL.
 *
 * @param {HTMLVideoElement|string} source           Video element or URL.
 * @param {number}                  time             Time in seconds to capture.
 * @param {Object}                  watermarkOptions Watermark settings.
 * @return {Promise<HTMLCanvasElement>} The canvas with the captured frame.
 */
const captureVideoFrame = (source, time, watermarkOptions = null) => {
  return new Promise((resolve, reject) => {
    let video;
    let isTempVideo = false;
    if (typeof source === 'string') {
      video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = source;
      video.muted = true;
      video.preload = 'metadata';
      isTempVideo = true;
    } else {
      video = source;
    }
    const processFrame = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');

      // Use VideoFrame if supported for slightly better performance/memory
      if (window.VideoFrame) {
        try {
          const frame = new window.VideoFrame(video);
          ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
          frame.close();
        } catch {
          // Fallback to direct video drawing if VideoFrame fails
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
      } else {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      if (watermarkOptions && watermarkOptions.url) {
        try {
          await drawWatermark(canvas, watermarkOptions);
        } catch (e) {
          console.error('Watermark failed', e);
        }
      }
      resolve(canvas);
      if (isTempVideo) {
        video.src = '';
        video.load();
      }
    };
    const onFrameReady = () => {
      // Clean up listeners if we added them
      if (isTempVideo) {
        video.removeEventListener('seeked', onFrameReady);
        video.removeEventListener('error', onError);
      }
      processFrame();
    };
    const onError = e => {
      if (isTempVideo) {
        video.removeEventListener('seeked', onFrameReady);
        video.removeEventListener('error', onError);
      }
      reject(e);
    };
    const onLoadedMetadata = () => {
      let seekTime = time;
      if (video.duration < seekTime) {
        seekTime = video.duration / 2;
      }

      // Use requestVideoFrameCallback if available for frame-accurate capture
      if ('requestVideoFrameCallback' in video) {
        video.requestVideoFrameCallback(() => {
          onFrameReady();
        });
      } else {
        // Fallback to legacy seeked event
        video.addEventListener('seeked', onFrameReady);
      }
      video.currentTime = seekTime;
    };
    if (isTempVideo) {
      video.addEventListener('error', onError);
      video.addEventListener('loadedmetadata', onLoadedMetadata);
      video.load();
    } else {
      // For existing video element
      if ('requestVideoFrameCallback' in video) {
        video.requestVideoFrameCallback(() => {
          processFrame();
        });
      } else {
        const oneShotSeek = () => {
          video.removeEventListener('seeked', oneShotSeek);
          processFrame();
        };
        video.addEventListener('seeked', oneShotSeek);
      }
      video.currentTime = time;
    }
  });
};

/**
 * Draws a watermark on the provided canvas.
 *
 * @param {HTMLCanvasElement} canvas  The canvas to draw on.
 * @param {Object}            options Watermark options (url, scale, align, x, valign, y).
 * @return {Promise<HTMLCanvasElement>} The canvas with the captured frame.
 */
const drawWatermark = (canvas, options) => {
  return new Promise((resolve, reject) => {
    const {
      url,
      scale,
      align,
      x,
      valign,
      y
    } = options;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;
    img.onload = () => {
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const watermarkHeight = canvasHeight * scale / 100;
      const aspectRatio = img.width / img.height;
      const watermarkWidth = watermarkHeight * aspectRatio;
      const horizontalOffset = canvasWidth * x / 100;
      const verticalOffset = canvasHeight * y / 100;
      let xPos, yPos;
      switch (align) {
        case 'left':
          xPos = horizontalOffset;
          break;
        case 'center':
          xPos = (canvasWidth - watermarkWidth) / 2 - horizontalOffset;
          break;
        case 'right':
          xPos = canvasWidth - watermarkWidth - horizontalOffset;
          break;
        default:
          xPos = horizontalOffset;
      }
      switch (valign) {
        case 'top':
          yPos = verticalOffset;
          break;
        case 'center':
          yPos = (canvasHeight - watermarkHeight) / 2 - verticalOffset;
          break;
        case 'bottom':
          yPos = canvasHeight - watermarkHeight - verticalOffset;
          break;
        default:
          yPos = verticalOffset;
      }
      ctx.drawImage(img, xPos, yPos, watermarkWidth, watermarkHeight);
      resolve(canvas);
    };
    img.onerror = () => reject(new Error((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Failed to load watermark image', 'video-embed-thumbnail-generator')));
  });
};

/**
 * Loads video metadata from a source.
 *
 * @param {string}      source Video URL.
 * @param {AbortSignal} signal Optional AbortSignal to cancel the request.
 * @return {Promise<Object>} Object containing video metadata (width, height, duration).
 */
const getVideoMetadata = (source, signal = null) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    // We don't set crossOrigin here because video dimensions and duration
    // are accessible even for cross-origin videos without CORS headers.
    // Detailed frame capture (canvas) will still require CORS checks elsewhere.
    video.src = source;
    video.muted = true;
    const timeout = setTimeout(() => {
      reject(new Error('Video load timeout'));
    }, 30000);
    const cleanup = () => {
      clearTimeout(timeout);
      video.onloadedmetadata = null;
      video.onerror = null;
      video.src = '';
      // We don't call video.load() here as it can trigger unnecessary errors in some browsers when src is empty.
    };
    if (signal) {
      if (signal.aborted) {
        cleanup();
        reject(new Error('AbortError'));
        return;
      }
      signal.addEventListener('abort', () => {
        cleanup();
        reject(new Error('AbortError'));
      });
    }
    video.onloadedmetadata = () => {
      const metadata = {
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration
      };
      cleanup();
      resolve(metadata);
    };
    video.onerror = e => {
      const error = video.error;
      cleanup();
      reject(error || e);
    };
  });
};

/**
 * Checks if a video's frames can be exported from a canvas without tainting it.
 *
 * @param {string}      source Video URL.
 * @param {AbortSignal} signal Optional AbortSignal to cancel the check.
 * @return {Promise<boolean>} True if tainted (cannot export), false if clean.
 */
const checkCanvasTaint = (source, signal = null) => {
  return new Promise(resolve => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';
    video.src = source;
    video.muted = true;
    const timeout = setTimeout(() => {
      cleanup();
      resolve(true); // Assume tainted if it times out
    }, 10000);
    const cleanup = () => {
      clearTimeout(timeout);
      video.onloadedmetadata = null;
      video.onseeked = null;
      video.onerror = null;
      video.src = '';
      video.load();
    };
    if (signal) {
      signal.addEventListener('abort', () => {
        cleanup();
        resolve(true); // Treat as tainted if aborted
      });
    }
    const onSeeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      try {
        ctx.drawImage(video, 0, 0, 1, 1);
        canvas.toDataURL(); // This throws SecurityError if tainted
        cleanup();
        resolve(false);
      } catch {
        cleanup();
        resolve(true);
      }
    };
    const onError = () => {
      cleanup();
      resolve(true);
    };
    video.onloadedmetadata = () => {
      video.currentTime = 0.1;
    };
    video.onseeked = onSeeked;
    video.onerror = onError;
  });
};

/**
 * Calculates timecodes for thumbnail generation.
 *
 * @param {number} duration Total video duration.
 * @param {number} count    Number of thumbnails.
 * @param {Object} options  Options { position: number (0-100), random: boolean }.
 * @return {number[]} Array of timecodes.
 */
const calculateTimecodes = (duration, count, options = {}) => {
  const timecodes = [];
  const {
    position = 50,
    random = false
  } = options;
  if (count === 1 && !random) {
    timecodes.push(duration * (position / 100));
  } else {
    for (let i = 0; i < count; i++) {
      let time = (i + 1) / (count + 1) * duration;
      if (random) {
        const randomOffset = Math.floor(Math.random() * (duration / count));
        time = Math.max(time - randomOffset, 0);
      }
      timecodes.push(time);
    }
  }
  return timecodes;
};
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "$R", 0, /* binding */ captureVideoFrame,
/* harmony export */   "HY", 0, /* binding */ getVideoMetadata,
/* harmony export */   "L$", 0, /* binding */ checkCanvasTaint,
/* harmony export */   "O0", 0, /* binding */ calculateTimecodes
/* harmony export */ ]);


/***/ },

/***/ 1609
(module) {

module.exports = window["React"];

/***/ },

/***/ 5795
(module) {

module.exports = window["ReactDOM"];

/***/ },

/***/ 790
(module) {

module.exports = window["ReactJSXRuntime"];

/***/ },

/***/ 1455
(module) {

module.exports = window["wp"]["apiFetch"];

/***/ },

/***/ 4715
(module) {

module.exports = window["wp"]["blockEditor"];

/***/ },

/***/ 4997
(module) {

module.exports = window["wp"]["blocks"];

/***/ },

/***/ 6427
(module) {

module.exports = window["wp"]["components"];

/***/ },

/***/ 9491
(module) {

module.exports = window["wp"]["compose"];

/***/ },

/***/ 3582
(module) {

module.exports = window["wp"]["coreData"];

/***/ },

/***/ 7143
(module) {

module.exports = window["wp"]["data"];

/***/ },

/***/ 6087
(module) {

module.exports = window["wp"]["element"];

/***/ },

/***/ 2619
(module) {

module.exports = window["wp"]["hooks"];

/***/ },

/***/ 8537
(module) {

module.exports = window["wp"]["htmlEntities"];

/***/ },

/***/ 7723
(module) {

module.exports = window["wp"]["i18n"];

/***/ },

/***/ 6480
(module) {

module.exports = window["wp"]["mediaUtils"];

/***/ },

/***/ 5573
(module) {

module.exports = window["wp"]["primitives"];

/***/ },

/***/ 3832
(module) {

module.exports = window["wp"]["url"];

/***/ },

/***/ 319
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ icon_default)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6087);
// packages/icons/src/icon/index.ts

var icon_default = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.forwardRef)(
  ({ icon, size = 24, ...props }, ref) => {
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.cloneElement)(icon, {
      width: size,
      height: size,
      ...props,
      ref
    });
  }
);

//# sourceMappingURL=index.mjs.map


/***/ },

/***/ 9629
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ cancel_circle_filled_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5573);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(790);
// packages/icons/src/library/cancel-circle-filled.tsx


var cancel_circle_filled_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M12 4c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8Zm3.8 10.7-1.1 1.1-2.7-2.7-2.7 2.7-1.1-1.1 2.7-2.7-2.7-2.7 1.1-1.1 2.7 2.7 2.7-2.7 1.1 1.1-2.7 2.7 2.7 2.7Z" }) });

//# sourceMappingURL=cancel-circle-filled.mjs.map


/***/ },

/***/ 9383
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ chevron_down_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5573);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(790);
// packages/icons/src/library/chevron-down.tsx


var chevron_down_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M17.5 11.6L12 16l-5.5-4.4.9-1.2L12 14l4.5-3.6 1 1.2z" }) });

//# sourceMappingURL=chevron-down.mjs.map


/***/ },

/***/ 1152
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ chevron_up_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5573);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(790);
// packages/icons/src/library/chevron-up.tsx


var chevron_up_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M6.5 12.4L12 8l5.5 4.4-.9 1.2L12 10l-4.5 3.6-1-1.2z" }) });

//# sourceMappingURL=chevron-up.mjs.map


/***/ },

/***/ 2023
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ close_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5573);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(790);
// packages/icons/src/library/close.tsx


var close_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "m13.06 12 6.47-6.47-1.06-1.06L12 10.94 5.53 4.47 4.47 5.53 10.94 12l-6.47 6.47 1.06 1.06L12 13.06l6.47 6.47 1.06-1.06L13.06 12Z" }) });

//# sourceMappingURL=close.mjs.map


/***/ },

/***/ 2344
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ external_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5573);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(790);
// packages/icons/src/library/external.tsx


var external_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M19.5 4.5h-7V6h4.44l-5.97 5.97 1.06 1.06L18 7.06v4.44h1.5v-7Zm-13 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3H17v3a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h3V5.5h-3Z" }) });

//# sourceMappingURL=external.mjs.map


/***/ },

/***/ 7133
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ media_and_text_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5573);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(790);
// packages/icons/src/library/media-and-text.tsx


var media_and_text_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M3 6v11.5h8V6H3Zm11 3h7V7.5h-7V9Zm7 3.5h-7V11h7v1.5ZM14 16h7v-1.5h-7V16Z" }) });

//# sourceMappingURL=media-and-text.mjs.map


/***/ },

/***/ 6039
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ not_allowed_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5573);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(790);
// packages/icons/src/library/not-allowed.tsx


var not_allowed_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { fillRule: "evenodd", clipRule: "evenodd", d: "M12 18.5A6.5 6.5 0 0 1 6.93 7.931l9.139 9.138A6.473 6.473 0 0 1 12 18.5Zm5.123-2.498a6.5 6.5 0 0 0-9.124-9.124l9.124 9.124ZM4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0Z" }) });

//# sourceMappingURL=not-allowed.mjs.map


/***/ },

/***/ 7884
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ page_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5573);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(790);
// packages/icons/src/library/page.tsx


var page_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: [
  /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M15.5 7.5h-7V9h7V7.5Zm-7 3.5h7v1.5h-7V11Zm7 3.5h-7V16h7v-1.5Z" }),
  /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M17 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2ZM7 5.5h10a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-.5.5H7a.5.5 0 0 1-.5-.5V6a.5.5 0 0 1 .5-.5Z" })
] });

//# sourceMappingURL=page.mjs.map


/***/ },

/***/ 7809
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ plus_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5573);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(790);
// packages/icons/src/library/plus.tsx


var plus_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M11 12.5V17.5H12.5V12.5H17.5V11H12.5V6H11V11H6V12.5H11Z" }) });

//# sourceMappingURL=plus.mjs.map


/***/ },

/***/ 227
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ post_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5573);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(790);
// packages/icons/src/library/post.tsx


var post_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "m7.3 9.7 1.4 1.4c.2-.2.3-.3.4-.5 0 0 0-.1.1-.1.3-.5.4-1.1.3-1.6L12 7 9 4 7.2 6.5c-.6-.1-1.1 0-1.6.3 0 0-.1 0-.1.1-.3.1-.4.2-.6.4l1.4 1.4L4 11v1h1l2.3-2.3zM4 20h9v-1.5H4V20zm0-5.5V16h16v-1.5H4z" }) });

//# sourceMappingURL=post.mjs.map


/***/ },

/***/ 6123
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ undo_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5573);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(790);
// packages/icons/src/library/undo.tsx


var undo_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M18.3 11.7c-.6-.6-1.4-.9-2.3-.9H6.7l2.9-3.3-1.1-1-4.5 5L8.5 16l1-1-2.7-2.7H16c.5 0 .9.2 1.3.5 1 1 1 3.4 1 4.5v.3h1.5v-.2c0-1.5 0-4.3-1.5-5.7z" }) });

//# sourceMappingURL=undo.mjs.map


/***/ },

/***/ 5125
(module) {

module.exports = /*#__PURE__*/JSON.parse('{"download":{"viewBox":"0 0 24 24","paths":[{"d":"M18 11.3l-1-1.1-4 4V3h-1.5v11.3L7 10.2l-1 1.1 6.2 5.8 5.8-5.8zm.5 3.7v3.5h-13V15H4v5h16v-5h-1.5z"}]},"share":{"viewBox":"0 0 24 24","paths":[{"d":"M9 11.8l6.1-4.5c.1.4.4.7.9.7h2c.6 0 1-.4 1-1V5c0-.6-.4-1-1-1h-2c-.6 0-1 .4-1 1v.4l-6.4 4.8c-.2-.1-.4-.2-.6-.2H6c-.6 0-1 .4-1 1v2c0 .6.4 1 1 1h2c.2 0 .4-.1.6-.2l6.4 4.8v.4c0 .6.4 1 1 1h2c.6 0 1-.4 1-1v-2c0-.6-.4-1-1-1h-2c-.5 0-.8.3-.9.7L9 12.2v-.4z"}]},"close":{"viewBox":"0 0 24 24","paths":[{"d":"m13.06 12 6.47-6.47-1.06-1.06L12 10.94 5.53 4.47 4.47 5.53 10.94 12l-6.47 6.47 1.06 1.06L12 13.06l6.47 6.47 1.06-1.06L13.06 12Z"}]},"external":{"viewBox":"0 0 1080 1080","paths":[{"d":"M994.56 986.8H68.33V169.45h463.11v70H138.33V916.8h786.23V623.33h70z"},{"d":"M549.07 598.54h-70v-3.49c-.02-63.64-.04-142.85 49.5-207.82 56.32-73.87 162.4-109.79 324.25-109.79h.24c111.9.02 128.37-.04 135.4-.06 1.82 0 3-.01 5-.01v70c-1.89 0-3.01 0-4.74.01-7.07.03-23.63.09-135.67.06h-.22c-75.54 0-137.44 8.45-183.99 25.11-37.98 13.59-65.66 32.28-84.6 57.13-35.2 46.17-35.18 109.49-35.17 165.36v3.51Z"},{"d":"m873.68 499.79-52.2-46.63L946.4 313.31 823.14 183.75l50.72-48.25 167.74 176.32z"}]},"iosShare":{"viewBox":"0 0 1080 1080","paths":[{"d":"M760.96 270.67h170.07V979H126.25V270.67H312.3m226.28 367.29V89.31m-149.87 152 149.87-152 153.17 152","fill":"none","stroke":"currentColor","stroke-miterlimit":"10","stroke-width":"70"}]},"curveShare":{"viewBox":"0 0 512 512","paths":[{"d":"M512 241.7 273.643 3.343v156.152c-71.41 3.744-138.015 33.337-188.958 84.28C30.075 298.384 0 370.991 0 448.222v60.436l29.069-52.985c45.354-82.671 132.173-134.027 226.573-134.027 5.986 0 12.004.212 18.001.632v157.779zm-256.358 48.966c-84.543 0-163.661 36.792-217.939 98.885 26.634-114.177 129.256-199.483 251.429-199.483h15.489V78.131l163.568 163.568-163.568 163.568V294.531l-13.585-1.683a289 289 0 0 0-35.394-2.182"}]},"embed":{"viewBox":"0 0 24 24","paths":[{"d":"M20.8 10.7l-4.3-4.3-1.1 1.1 4.3 4.3c.1.1.1.3 0 .4l-4.3 4.3 1.1 1.1 4.3-4.3c.7-.8.7-1.9 0-2.6zM4.2 11.8l4.3-4.3-1-1-4.3 4.3c-.7.7-.7 1.8 0 2.5l4.3 4.3 1.1-1.1-4.3-4.3c-.2-.1-.2-.3-.1-.4z"}]},"eye":{"viewBox":"0 0 24 24","paths":[{"d":"M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"}]},"play":{"viewBox":"0 0 24 24","paths":[{"d":"M8 5v14l11-7z"}]},"playOutline":{"viewBox":"0 0 24 24","paths":[{"d":"M8 5v14l11-7z","fill":"none","stroke":"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}]},"copyLink":{"viewBox":"0 0 16 16","paths":[{"d":"M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z"},{"d":"M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z"}]},"bluesky":{"viewBox":"0 0 16 16","paths":[{"d":"M3.468 1.948C5.303 3.325 7.276 6.118 8 7.616c.725-1.498 2.698-4.29 4.532-5.668C13.855.955 16 .186 16 2.632c0 .489-.28 4.105-.444 4.692-.572 2.04-2.653 2.561-4.504 2.246 3.236.551 4.06 2.375 2.281 4.2-3.376 3.464-4.852-.87-5.23-1.98-.07-.204-.103-.3-.103-.218 0-.081-.033.014-.102.218-.379 1.11-1.855 5.444-5.231 1.98-1.778-1.825-.955-3.65 2.28-4.2-1.85.315-3.932-.205-4.503-2.246C.28 6.737 0 3.12 0 2.632 0 .186 2.145.955 3.468 1.948"}]},"threads":{"viewBox":"0 0 16 16","paths":[{"d":"M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948s.928 1.509 1.005 2.644q.492.207.905.484c1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.2 6.2 0 0 0-1.528-.161"}]},"facebook":{"viewBox":"0 0 16 16","paths":[{"d":"M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.8V16c3.824-.604 6.75-3.934 6.75-7.951z"}]},"reddit":{"viewBox":"0 0 16 16","paths":[{"d":"M6.167 8a.83.83 0 0 0-.83.83c0 .459.372.84.83.831a.831.831 0 0 0 0-1.661m1.843 3.647c.315 0 1.403-.038 1.976-.611a.23.23 0 0 0 0-.306.213.213 0 0 0-.306 0c-.353.363-1.126.487-1.67.487-.545 0-1.308-.124-1.671-.487a.213.213 0 0 0-.306 0 .213.213 0 0 0 0 .306c.564.563 1.652.61 1.977.61zm.992-2.807c0 .458.373.83.831.83s.83-.381.83-.83a.831.831 0 0 0-1.66 0z"},{"d":"M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.828-1.165c-.315 0-.602.124-.812.325-.801-.573-1.9-.945-3.121-.993l.534-2.501 1.738.372a.83.83 0 1 0 .83-.869.83.83 0 0 0-.744.468l-1.938-.41a.2.2 0 0 0-.153.028.2.2 0 0 0-.086.134l-.592 2.788c-1.24.038-2.358.41-3.17.992-.21-.2-.496-.324-.81-.324a1.163 1.163 0 0 0-.478 2.224q-.03.17-.029.353c0 1.795 2.091 3.256 4.669 3.256s4.668-1.451 4.668-3.256c0-.114-.01-.238-.029-.353.401-.181.688-.592.688-1.069 0-.65-.525-1.165-1.165-1.165"}]},"email":{"viewBox":"0 0 16 16","paths":[{"d":"M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.976-5.64-3.384L8 9.83l-1.326-.795-5.64 3.384A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.641ZM1 11.105l4.708-2.897L1 5.383v5.722Z"}]}}');

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	const __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		const cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		const module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			const getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/create fake namespace object */
/******/ 	(() => {
/******/ 		const getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
/******/ 		let leafPrototypes;
/******/ 		// create a fake namespace object
/******/ 		// mode & 1: value is a module id, require it
/******/ 		// mode & 2: merge all properties of value into the ns
/******/ 		// mode & 4: return value when already ns object
/******/ 		// mode & 16: return value when it's Promise-like
/******/ 		// mode & 8|1: behave like require
/******/ 		__webpack_require__.t = function(value, mode) {
/******/ 			if(mode & 1) value = this(value);
/******/ 			if(mode & 8) return value;
/******/ 			if(typeof value === 'object' && value) {
/******/ 				if((mode & 4) && value.__esModule) return value;
/******/ 				if((mode & 16) && typeof value.then === 'function') return value;
/******/ 			}
/******/ 			const ns = Object.create(null);
/******/ 			__webpack_require__.r(ns);
/******/ 			const def = {};
/******/ 			leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
/******/ 			for(var current = mode & 2 && value; (typeof current == 'object' || typeof current == 'function') && !~leafPrototypes.indexOf(current); current = getProto(current)) {
/******/ 				Object.getOwnPropertyNames(current).forEach((key) => (def[key] = () => (value[key])));
/******/ 			}
/******/ 			def['default'] = () => (value);
/******/ 			__webpack_require__.d(ns, def);
/******/ 			return ns;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter/value functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			if(Array.isArray(definition)) {
/******/ 				var i = 0;
/******/ 				while(i < definition.length) {
/******/ 					var key = definition[i++];
/******/ 					var binding = definition[i++];
/******/ 					if(!__webpack_require__.o(exports, key)) {
/******/ 						if(binding === 0) {
/******/ 							Object.defineProperty(exports, key, { enumerable: true, value: definition[i++] });
/******/ 						} else {
/******/ 							Object.defineProperty(exports, key, { enumerable: true, get: binding });
/******/ 						}
/******/ 					} else if(binding === 0) { i++; }
/******/ 				}
/******/ 			} else {
/******/ 				for(var key in definition) {
/******/ 					if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 						Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".js?ver=" + "427ad1994aed09edec05" + "";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get mini-css chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.miniCssF = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return undefined;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.hasOwn(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/load script */
/******/ 	(() => {
/******/ 		const inProgress = {};
/******/ 		const dataWebpackPrefix = "videopack-admin:";
/******/ 		// loadScript function to load a script via script tag
/******/ 		__webpack_require__.l = (url, done, key, chunkId) => {
/******/ 			if(inProgress[url]) { inProgress[url].push(done); return; }
/******/ 			let script, needAttach;
/******/ 			if(key !== undefined) {
/******/ 				const scripts = document.getElementsByTagName("script");
/******/ 				for(var i = 0; i < scripts.length; i++) {
/******/ 					const s = scripts[i];
/******/ 					if(s.getAttribute("src") == url || s.getAttribute("data-webpack") == dataWebpackPrefix + key) { script = s; break; }
/******/ 				}
/******/ 			}
/******/ 			if(!script) {
/******/ 				needAttach = true;
/******/ 				script = document.createElement('script');
/******/ 		
/******/ 				script.charset = 'utf-8';
/******/ 				if (__webpack_require__.nc) {
/******/ 					script.setAttribute("nonce", __webpack_require__.nc);
/******/ 				}
/******/ 				script.setAttribute("data-webpack", dataWebpackPrefix + key);
/******/ 		
/******/ 				script.src = url;
/******/ 			}
/******/ 			inProgress[url] = [done];
/******/ 			const onScriptComplete = (prev, event) => {
/******/ 				// avoid mem leaks in IE.
/******/ 				script.onerror = script.onload = null;
/******/ 				clearTimeout(timeout);
/******/ 				const doneFns = inProgress[url];
/******/ 				delete inProgress[url];
/******/ 				script.parentNode?.removeChild(script);
/******/ 				doneFns?.forEach((fn) => (fn(event)));
/******/ 				if(prev) return prev(event);
/******/ 			}
/******/ 			const timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
/******/ 			script.onerror = onScriptComplete.bind(null, script.onerror);
/******/ 			script.onload = onScriptComplete.bind(null, script.onload);
/******/ 			needAttach && document.head.appendChild(script);
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		let scriptUrl;
/******/ 		if (globalThis.importScripts) scriptUrl = globalThis.location + "";
/******/ 		const document = globalThis.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript?.tagName.toUpperCase() === 'SCRIPT')
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				const scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					let i = scripts.length - 1;
/******/ 					while (i > -1 && (!scriptUrl || !/^http(s?):/.test(scriptUrl))) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/^blob:/, "").replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		const installedChunks = {
/******/ 			"blocks/collection/index": 0,
/******/ 			"blocks/download/index": 0,
/******/ 			"blocks/loop/index": 0,
/******/ 			"blocks/pagination/index": 0,
/******/ 			"blocks/play-button/index": 0,
/******/ 			"blocks/player-container/index": 0,
/******/ 			"blocks/player/index": 0,
/******/ 			"blocks/share/index": 0,
/******/ 			"blocks/thumbnail/index": 0,
/******/ 			"blocks/title/index": 0,
/******/ 			"blocks/view-count/index": 0,
/******/ 			"blocks/watermark/index": 0,
/******/ 			"settings": 0
/******/ 		};
/******/ 		
/******/ 		__webpack_require__.f.j = (chunkId, promises) => {
/******/ 				// JSONP chunk loading for javascript
/******/ 				let installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
/******/ 				if(installedChunkData !== 0) { // 0 means "already installed".
/******/ 		
/******/ 					// a Promise means "currently loading".
/******/ 					if(installedChunkData) {
/******/ 						promises.push(installedChunkData[2]);
/******/ 					} else {
/******/ 						if(true) { // all chunks have JS
/******/ 							// setup Promise in chunk cache
/******/ 							const promise = new Promise((resolve, reject) => (installedChunkData = installedChunks[chunkId] = [resolve, reject]));
/******/ 							promises.push(installedChunkData[2] = promise);
/******/ 		
/******/ 							// start chunk loading
/******/ 							const url = __webpack_require__.p + __webpack_require__.u(chunkId);
/******/ 							// create error before stack unwound to get useful stacktrace later
/******/ 							const error = new Error();
/******/ 							const loadingEnded = (event) => {
/******/ 								if(__webpack_require__.o(installedChunks, chunkId)) {
/******/ 									installedChunkData = installedChunks[chunkId];
/******/ 									if(installedChunkData !== 0) installedChunks[chunkId] = undefined;
/******/ 									if(installedChunkData) {
/******/ 										const errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 										const realSrc = event && event.target && event.target.src;
/******/ 										error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 										error.name = 'ChunkLoadError';
/******/ 										error.type = errorType;
/******/ 										error.request = realSrc;
/******/ 										installedChunkData[1](error);
/******/ 									}
/******/ 								}
/******/ 							};
/******/ 							__webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 		};
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		const webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			let [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 		
/******/ 		}
/******/ 		
/******/ 		const chunkLoadingGlobal = globalThis["webpackChunkvideopack_admin"] ||= [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
let __webpack_exports__ = {};

// EXTERNAL MODULE: external ["wp","i18n"]
var external_wp_i18n_ = __webpack_require__(7723);
// EXTERNAL MODULE: external ["wp","hooks"]
var external_wp_hooks_ = __webpack_require__(2619);
// EXTERNAL MODULE: ./src/api/settings.js
var api_settings = __webpack_require__(4602);
// EXTERNAL MODULE: ./src/api/gallery.js
var gallery = __webpack_require__(8533);
// EXTERNAL MODULE: external ["wp","components"]
var external_wp_components_ = __webpack_require__(6427);
// EXTERNAL MODULE: external ["wp","compose"]
var external_wp_compose_ = __webpack_require__(9491);
// EXTERNAL MODULE: external ["wp","element"]
var external_wp_element_ = __webpack_require__(6087);
// EXTERNAL MODULE: ./src/assets/icon.js
var icon = __webpack_require__(9427);
// EXTERNAL MODULE: external ["wp","blockEditor"]
var external_wp_blockEditor_ = __webpack_require__(4715);
// EXTERNAL MODULE: external ["wp","blocks"]
var external_wp_blocks_ = __webpack_require__(4997);
;// ./src/utils/buildPreviewBlocks.js
/* unused harmony import specifier */ var createBlock;


/**
 * Recursively converts a template array — tuples `[name, attrs, children]`
 * (as produced by getGridTemplate/getListTemplate) or objects
 * `{name, attributes, innerBlocks}` — into real block instances via
 * createBlock(), so they can be rendered through the real, registered Edit
 * components (via useBlockPreview/RealBlockPreview) instead of the removed
 * custom preview registry's hand-picked display components.
 *
 * Template entries may be falsy (e.g. a conditional `condition && [...]`
 * tuple that evaluated to false) — these are filtered out before conversion.
 *
 * @param {Array} template Template blocks, tuple or object shape.
 * @return {Array} Real block instances, as returned by createBlock().
 */
function buildPreviewBlocks(template = []) {
  return template.filter(Boolean).map(block => {
    const [name, attributes = {}, innerBlocks = []] = Array.isArray(block) ? block : [block.name, block.attributes, block.innerBlocks];
    return createBlock(name, attributes || {}, buildPreviewBlocks(innerBlocks || []));
  });
}

/**
 * Like buildPreviewBlocks, but reuses each block's clientId from a
 * previously-built blocks array wherever the block name at that position
 * hasn't changed — only calling createBlock() (a fresh clientId) where the
 * structure actually differs (a block appearing, disappearing, or changing
 * type at that position).
 *
 * This matters because useBlockPreview's internal store syncs via
 * useBlockSync, which calls resetBlocks() any time the blocks array
 * reference changes (see @wordpress/block-editor's use-block-sync.js) — but
 * the rendered React component tree is still reconciled by clientId. Reusing
 * a clientId means the corresponding block's Edit() component isn't
 * unmounted/remounted, just re-rendered with updated attributes — so a block
 * with its own data-fetching effect (like videopack/collection's
 * useVideoQuery) only re-runs that effect if its OWN dependencies actually
 * changed, not just because some other block's design attribute changed
 * and forced this whole tree to be rebuilt.
 *
 * @param {Array} template   Template blocks, tuple or object shape.
 * @param {Array} prevBlocks The previously-built blocks array (from a prior
 *                           call) to diff against and reuse clientIds from.
 * @return {Array} Block instances, reusing clientIds where possible.
 */
function buildStablePreviewBlocks(template = [], prevBlocks = []) {
  return template.filter(Boolean).map((block, index) => {
    const [name, attributes = {}, innerBlocks = []] = Array.isArray(block) ? block : [block.name, block.attributes, block.innerBlocks];
    const prevBlock = prevBlocks[index];
    const childBlocks = buildStablePreviewBlocks(innerBlocks || [], prevBlock?.innerBlocks || []);
    if (prevBlock && prevBlock.name === name) {
      return {
        ...prevBlock,
        attributes: (0,external_wp_blocks_.sanitizeBlockAttributes)(name, attributes || {}),
        innerBlocks: childBlocks
      };
    }
    return (0,external_wp_blocks_.createBlock)(name, attributes || {}, childBlocks);
  });
}
;// ./src/hooks/useStablePreviewBlocks.js



/**
 * Converts a template into real block instances (like buildPreviewBlocks),
 * but reuses each block's clientId across renders wherever the block
 * structure at a given position hasn't changed — see
 * buildStablePreviewBlocks for why this matters (avoids forcing blocks like
 * videopack/collection to re-run their own data-fetching effects for a plain
 * attribute/design change, which would otherwise happen because
 * useBlockPreview's internal store resets whenever the blocks array
 * reference changes, and an unmounted-then-remounted block loses all of its
 * own component state, including in-flight/cached query results).
 *
 * Only recomputes when `template` itself changes reference, matching the
 * semantics callers previously got from `useMemo(() => buildPreviewBlocks(
 * template), [template])`.
 *
 * @param {Array} template Template blocks, tuple or object shape.
 * @return {Array} Block instances, with clientIds stable across renders
 *                 where possible.
 */
function useStablePreviewBlocks(template) {
  const prevBlocksRef = (0,external_wp_element_.useRef)([]);
  const prevTemplateRef = (0,external_wp_element_.useRef)();
  if (prevTemplateRef.current !== template) {
    prevBlocksRef.current = buildStablePreviewBlocks(template, prevBlocksRef.current);
    prevTemplateRef.current = template;
  }
  return prevBlocksRef.current;
}
// EXTERNAL MODULE: external "ReactJSXRuntime"
var external_ReactJSXRuntime_ = __webpack_require__(790);
;// ./src/components/RealBlockPreview.js



/**
 * Renders a real, disabled preview of a block tree — built on the real Edit
 * components (via useBlockPreview) rather than a hand-maintained parallel
 * reimplementation, so the preview and the real thing can never drift apart.
 * Shared across Classic Editor, the Settings page, and Attachment Details —
 * none of these contexts have an "editable item" concept (unlike Loop's own
 * grid, which needs click-to-activate state), so this is a pure static
 * preview. Per-instance data (video title, views, colors, etc.) flows in
 * purely through the ambient BlockContextProvider the caller wraps this in —
 * this component takes no video-specific props at all.
 *
 * @param {Object} root0             Component props.
 * @param {Array}  root0.blocks      The real block instances to preview (see utils/buildPreviewBlocks.js).
 * @param {string} [root0.className] Optional extra class name for the preview wrapper.
 */

function RealBlockPreview({
  blocks,
  className
}) {
  const previewProps = (0,external_wp_blockEditor_.__experimentalUseBlockPreview)({
    blocks,
    props: {
      className
    }
  });
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
    ...previewProps
  });
}
/* harmony default export */ const components_RealBlockPreview = ((0,external_wp_element_.memo)(RealBlockPreview));
// EXTERNAL MODULE: external ["wp","apiFetch"]
var external_wp_apiFetch_ = __webpack_require__(1455);
var external_wp_apiFetch_default = /*#__PURE__*/__webpack_require__.n(external_wp_apiFetch_);
;// ./src/components/PreviewIframe/PreviewIframe.js



let cachedGlobalStylesPromise = null;
const fetchGlobalStyles = () => {
  if (!cachedGlobalStylesPromise) {
    cachedGlobalStylesPromise = external_wp_apiFetch_default()({
      path: '/videopack/v1/global-styles'
    }).then(response => response.css || '').catch(() => '');
  }
  return cachedGlobalStylesPromise;
};

/**
 * PreviewIframe component to isolate frontend styles from the admin UI.
 *
 * @param {Object}  props                    Component props.
 * @param {Node}    props.children           Children to render inside the iframe.
 * @param {string}  props.title              Iframe title for accessibility.
 * @param {string}  props.className          Optional class name for the iframe.
 * @param {Array}   props.resizeDependencies Optional array of dependencies that trigger a resize when changed.
 * @param {boolean} props.fullScreen         Whether the iframe should occupy the full screen.
 */
const PreviewIframe = ({
  children,
  title = 'Preview',
  className = '',
  resizeDependencies = [],
  fullScreen = false
}) => {
  const [contentRef, setContentRef] = (0,external_wp_element_.useState)(null);
  // Mirrored styles land in a useEffect, which by definition runs after the
  // browser has already painted whatever was just portaled into the iframe
  // — so the very first paint of any content is briefly completely
  // unstyled (an <img> at its natural intrinsic size, etc). Keep the
  // iframe invisible until that first mirror pass completes so this flash
  // of unstyled content never reaches the screen.
  const [stylesReady, setStylesReady] = (0,external_wp_element_.useState)(false);
  const mountNode = contentRef?.contentWindow?.document?.body;
  const observerRef = (0,external_wp_element_.useRef)(null);
  // Debounces rapid-fire ResizeObserver callbacks (e.g. old content →
  // loading placeholder → new content, each a genuine height change) down
  // to a single, final resize — otherwise the iframe visibly snaps through
  // each intermediate height instead of just settling on the last one.
  const resizeDebounceRef = (0,external_wp_element_.useRef)(null);

  /**
   * Measure and apply the correct iframe height.
   */
  const resizeIframe = (0,external_wp_element_.useCallback)(() => {
    if (!contentRef || !mountNode || fullScreen) {
      return;
    }
    if (resizeDebounceRef.current) {
      clearTimeout(resizeDebounceRef.current);
    }
    resizeDebounceRef.current = setTimeout(() => {
      // Use requestAnimationFrame to ensure we measure after layout.
      window.requestAnimationFrame(() => {
        if (!contentRef || !mountNode || fullScreen) {
          return;
        }

        // Measure the content wrapper directly.
        const wrapper = mountNode.querySelector('.videopack-iframe-content-wrapper');
        const height = wrapper ? wrapper.offsetHeight : mountNode.scrollHeight;
        if (height && height > 50) {
          const currentHeight = parseInt(contentRef.style.height, 10);
          if (!currentHeight || Math.abs(height - currentHeight) > 5 && Math.abs(height - currentHeight) < 2000 || height < currentHeight) {
            contentRef.style.height = `${height}px`;
          }
        }
      });
    }, 120);
  }, [contentRef, mountNode, fullScreen]);
  const resizeDependenciesString = JSON.stringify(resizeDependencies);
  // Trigger resize when dependencies change (e.g. alignment).
  (0,external_wp_element_.useEffect)(() => {
    resizeIframe();
  }, [resizeIframe, resizeDependenciesString]);
  const handleIframeLoad = (0,external_wp_element_.useCallback)(() => {
    if (contentRef) {
      const doc = contentRef.contentWindow.document;
      const head = doc.head;

      // Clear existing mirrored styles to prevent duplicates on reload.
      head.querySelectorAll('.videopack-mirrored-style').forEach(el => el.remove());

      // Mirror plugin and block styles into the iframe.
      document.querySelectorAll('link[rel="stylesheet"], style').forEach(style => {
        // Skip our own internal iframe styles to avoid conflicts.
        // Also skip common WordPress admin styles that interfere with the preview.
        if (style.id !== 'videopack-isolated-global-styles' && style.id !== 'videopack-iframe-reset' && style.id !== 'videopack-global-styles' && !style.id?.startsWith('colors-css') && !style.id?.startsWith('common-css') && !style.id?.startsWith('admin-bar-css') && !style.id?.startsWith('wp-admin-css') && !style.id?.startsWith('buttons-css') && !style.id?.startsWith('dashicons-css') && !style.id?.startsWith('list-tables-css') && !style.id?.startsWith('edit-css') && !style.id?.startsWith('media-views-css') && !style.id?.startsWith('wp-color-picker-css')) {
          const clone = style.cloneNode(true);
          clone.classList.add('videopack-mirrored-style');
          head.appendChild(clone);
        }
      });

      // Add a basic reset and common styles to the iframe.
      if (!doc.getElementById('videopack-iframe-reset')) {
        const style = doc.createElement('style');
        style.id = 'videopack-iframe-reset';
        style.textContent = `
					html, body {
						margin: 0 !important;
						padding: 0 !important;
						overflow: hidden !important;
						height: auto !important;
					}
					.videopack-iframe-content-wrapper {
						display: flow-root;
						width: 100%;
						height: auto !important;
						padding: 20px !important;
						box-sizing: border-box !important;
					}
					/* Ensure some common block editor wrapper behaviors */
					.wp-block-videopack-videopack-gallery,
					.wp-block-videopack-player-container {
						max-width: 100% !important;
					}
					/* Prevent player children from inflating height during measurement */
					.videopack-video-player,
					.videopack-generic-player,
					.mejs-container,
					.video-js,
					video-player {
						max-width: 100% !important;
					}
					/* Specific to gallery modal overlay inside iframe */
					.videopack-modal-overlay {
						position: fixed !important;
						top: 0 !important;
						left: 0 !important;
						width: 100% !important;
						height: 100% !important;
						z-index: 99999 !important;
						background: rgba(0, 0, 0, 0.8) !important;
					}
				`;
        head.appendChild(style);
      }

      // Replicate global configuration context into the iframe.
      if (window.videopack_config) {
        contentRef.contentWindow.videopack_config = {
          ...window.videopack_config
        };
      }

      // Inject theme styles from WordPress global styles.
      if (!doc.getElementById('videopack-global-styles')) {
        const existingDOMStyles = window.parent?.document?.getElementById('global-styles-inline-css')?.textContent || window.videopack_config?.globalStyles || window.videopack_config?.global_styles;
        if (existingDOMStyles) {
          const themeStyle = doc.createElement('style');
          themeStyle.id = 'videopack-global-styles';
          themeStyle.textContent = existingDOMStyles;
          head.appendChild(themeStyle);
          setStylesReady(true);
        } else {
          fetchGlobalStyles().then(css => {
            if (css && !doc.getElementById('videopack-global-styles')) {
              const themeStyle = doc.createElement('style');
              themeStyle.id = 'videopack-global-styles';
              themeStyle.textContent = css;
              head.appendChild(themeStyle);
            }
            setStylesReady(true);
          });
        }
      } else {
        setStylesReady(true);
      }
    }
  }, [contentRef]);

  // Measure once on mount and whenever the content or width changes.
  (0,external_wp_element_.useEffect)(() => {
    if (!contentRef || !mountNode || fullScreen) {
      return;
    }
    handleIframeLoad();

    // Watch for height changes within the content wrapper.
    const wrapper = mountNode.querySelector('.videopack-iframe-content-wrapper');
    if (!wrapper) {
      return;
    }

    // First measurement — after initial render.
    const t1 = setTimeout(resizeIframe, 600);
    // Second measurement — catches any deferred rendering (like MEJS).
    const t2 = setTimeout(resizeIframe, 1500);
    if (!observerRef.current) {
      observerRef.current = new ResizeObserver(() => {
        resizeIframe();
      });
    }
    observerRef.current.observe(wrapper);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (resizeDebounceRef.current) {
        clearTimeout(resizeDebounceRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [contentRef, mountNode, handleIframeLoad, resizeIframe, fullScreen]);
  const iframeStyle = (0,external_wp_element_.useMemo)(() => {
    // Stays invisible until the first style-mirroring pass has landed, so
    // the unstyled first paint (see stylesReady above) never shows.
    const visibility = stylesReady ? 'visible' : 'hidden';
    if (fullScreen) {
      return {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 100000,
        border: 'none',
        background: 'transparent',
        visibility
      };
    }
    return {
      width: '100%',
      border: 'none',
      background: 'transparent',
      // Smooths over any height change that still slips through the
      // debounce above, instead of the iframe visibly snapping to size.
      transition: 'height 0.2s ease',
      visibility
    };
  }, [fullScreen, stylesReady]);
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("iframe", {
    ref: setContentRef,
    title: title,
    className: className,
    style: iframeStyle,
    onLoad: handleIframeLoad,
    scrolling: "no",
    children: mountNode && (0,external_wp_element_.createPortal)(/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
      className: "videopack-iframe-content-wrapper",
      children: children
    }), mountNode)
  });
};
/* harmony default export */ const PreviewIframe_PreviewIframe = (PreviewIframe);
// EXTERNAL MODULE: ./src/components/CompactColorPicker/CompactColorPicker.js
var CompactColorPicker = __webpack_require__(6312);
// EXTERNAL MODULE: ./src/utils/colors.js
var colors = __webpack_require__(7068);
;// ./src/utils/sharedDesignAttributes.js
/**
 * Builds the flat attribute set that videopack/collection, videopack/player-container,
 * and videopack/loop need on their OWN attributes to actually apply live design
 * values (colors, skin, watermark) in a preview.
 *
 * These three blocks are Ui.php's $receives_shared_attributes list
 * (register_videopack_block_context()) — Gutenberg's own providesContext
 * mechanism (@wordpress/block-editor's InnerBlocks) reads each of these keys
 * only from that block's own saved attribute, never from ambient/injected
 * React context, and this automatic wrapper is nested deeper than any manual
 * BlockContextProvider/VideopackContextBridge — so it always wins. Passing
 * these values only via an outer context provider silently gets overridden
 * back to undefined for any descendant.
 *
 * @param {Object} source    Settings-like object (global settings, or a
 *                           resolved design-value object such as
 *                           useVideopackContext's `resolved`) to read values
 *                           from.
 * @param {Object} fallbacks Optional live-computed color fallbacks (from
 *                           utils/colors.js's getColorFallbacks) to fall back
 *                           to for any color left unset in `source`. Without
 *                           this, an unset color falls through — via
 *                           getEffectiveValue's own "global defaults" step —
 *                           to videopack_config.options, which only reflects
 *                           the last *saved* value from page load, not this
 *                           session's live (possibly unsaved) skin/embed
 *                           method choice that getColorFallbacks accounts for.
 * @return {Object} Flat design attributes, omitting unset values.
 */
function getSharedDesignAttributes(source = {}, fallbacks = {}) {
  const attrs = {
    skin: source.skin,
    title_color: source.title_color || fallbacks.title_color,
    title_background_color: source.title_background_color || fallbacks.title_background_color,
    play_button_color: source.play_button_color || fallbacks.play_button_color,
    play_button_secondary_color: source.play_button_secondary_color || fallbacks.play_button_secondary_color,
    control_bar_bg_color: source.control_bar_bg_color || fallbacks.control_bar_bg_color,
    control_bar_color: source.control_bar_color || fallbacks.control_bar_color,
    pagination_color: source.pagination_color || fallbacks.pagination_color,
    pagination_background_color: source.pagination_background_color || fallbacks.pagination_background_color,
    pagination_active_bg_color: source.pagination_active_bg_color || fallbacks.pagination_active_bg_color,
    pagination_active_color: source.pagination_active_color || fallbacks.pagination_active_color,
    watermark: source.watermark,
    watermark_styles: source.watermark_styles,
    watermark_link_to: source.watermark_link_to,
    watermark_align: source.watermark_align ?? source.watermark_styles?.align,
    watermark_valign: source.watermark_valign ?? source.watermark_styles?.valign,
    watermark_scale: source.watermark_scale ?? source.watermark_styles?.scale,
    watermark_x: source.watermark_x ?? source.watermark_styles?.x,
    watermark_y: source.watermark_y ?? source.watermark_styles?.y
  };
  return Object.fromEntries(Object.entries(attrs).filter(([, value]) => value !== undefined));
}
// EXTERNAL MODULE: external ["wp","primitives"]
var external_wp_primitives_ = __webpack_require__(5573);
;// ./node_modules/@wordpress/icons/build-module/library/help.mjs
// packages/icons/src/library/help.tsx


var help_default = /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.Path, { d: "M12 4a8 8 0 1 1 .001 16.001A8 8 0 0 1 12 4Zm0 1.5a6.5 6.5 0 1 0-.001 13.001A6.5 6.5 0 0 0 12 5.5Zm.75 11h-1.5V15h1.5v1.5Zm-.445-9.234a3 3 0 0 1 .445 5.89V14h-1.5v-1.25c0-.57.452-.958.917-1.01A1.5 1.5 0 0 0 12 8.75a1.5 1.5 0 0 0-1.5 1.5H9a3 3 0 0 1 3.305-2.984Z" }) });

//# sourceMappingURL=help.mjs.map

;// ./src/features/settings/components/VideopackTooltip.js



const VideopackTooltip = ({
  text
}) => {
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Tooltip, {
    text: text,
    className: "videopack-tooltip",
    children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
      className: "videopack-tooltip-trigger",
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Icon, {
        icon: help_default
      })
    })
  });
};
/* harmony default export */ const components_VideopackTooltip = (VideopackTooltip);
;// ./src/features/settings/components/VideoCollectionSettings.js














/* global videopack_config */

// Color fallbacks are now handled by getColorFallbacks utility.

const VideoCollectionSettings = ({
  settings,
  changeHandlerFactory
}) => {
  const colorFallbacks = (0,external_wp_element_.useMemo)(() => (0,colors/* getColorFallbacks */.l)(settings), [settings]);
  const {
    enable_collection_video_limit,
    collection_video_limit,
    gallery_columns,
    gallery_end,
    gallery_per_page,
    gallery_title,
    gallery_pagination,
    gallery_orderby,
    gallery_order,
    gallery_align,
    title_color,
    title_background_color,
    play_button_color,
    play_button_secondary_color,
    pagination_color,
    pagination_background_color,
    pagination_active_bg_color,
    pagination_active_color,
    skin,
    embed_method
  } = settings;
  const skinOptions = (0,external_wp_element_.useMemo)(() => {
    const options = [{
      value: 'vjs-theme-videopack',
      label: (0,external_wp_i18n_.__)('Videopack', 'video-embed-thumbnail-generator')
    }, {
      value: 'kg-video-js-skin',
      label: (0,external_wp_i18n_.__)('Videopack Classic', 'video-embed-thumbnail-generator')
    }, {
      value: 'default',
      label: (0,external_wp_i18n_.__)('Video.js default', 'video-embed-thumbnail-generator')
    }, {
      value: 'vjs-theme-city',
      label: (0,external_wp_i18n_.__)('City', 'video-embed-thumbnail-generator')
    }, {
      value: 'vjs-theme-fantasy',
      label: (0,external_wp_i18n_.__)('Fantasy', 'video-embed-thumbnail-generator')
    }, {
      value: 'vjs-theme-forest',
      label: (0,external_wp_i18n_.__)('Forest', 'video-embed-thumbnail-generator')
    }, {
      value: 'vjs-theme-sea',
      label: (0,external_wp_i18n_.__)('Sea', 'video-embed-thumbnail-generator')
    }];
    return (0,external_wp_hooks_.applyFilters)(/** This filter is documented in src/features/settings/components/PlayerSettings.js */
    'videopack_player_skin_options', options, embed_method);
  }, [embed_method]);

  // videopack/collection always runs its own useVideoQuery internally
  // (using its own attributes) and re-provides its own VideopackProvider to
  // its children — it doesn't defer to anything supplied from outside. So
  // these have to be real attributes on the collection block itself, not
  // context/an outer query, or its internal fetch (defaulting to
  // gallery_source="current", which needs a real post) comes back empty and
  // silently overrides whatever we set up around it.
  //
  // This also covers colors/skin (via getSharedDesignAttributes):
  // videopack/collection is one of Ui.php's $receives_shared_attributes
  // blocks, so Gutenberg's own providesContext mechanism reads those only
  // from collection's own attributes too, never from previewContext below.
  // That does mean a color/skin change rebuilds the block tree the same
  // way a structural setting does — a brief flash, but colors actually apply.
  const collectionAttributes = (0,external_wp_element_.useMemo)(() => {
    const isPaginationEnabled = gallery_pagination === true || gallery_pagination === 1 || gallery_pagination === '1';
    const attrs = {
      ...getSharedDesignAttributes(settings, colorFallbacks),
      gallery_source: 'recent',
      // Pull videos from the whole site for the preview
      gallery_orderby,
      gallery_order,
      gallery_per_page,
      gallery_pagination: isPaginationEnabled,
      columns: gallery_columns,
      overlay_title: gallery_title
    };

    // Safety restriction for the preview: if pagination is disabled, force a limit of 12
    if (!isPaginationEnabled) {
      attrs.enable_collection_video_limit = true;
      attrs.collection_video_limit = 12;
    }
    return attrs;
  }, [settings, colorFallbacks, gallery_orderby, gallery_order, gallery_per_page, gallery_pagination, gallery_columns, gallery_title]);

  // Sync total pages from the query results
  const handlers = (0,external_wp_element_.useMemo)(() => {
    const h = {
      ...changeHandlerFactory
    };
    ['gallery_columns', 'gallery_per_page'].forEach(key => {
      if (h[key]) {
        const original = h[key];
        h[key] = val => original(parseInt(val, 10) || 0);
      }
    });
    return h;
  }, [changeHandlerFactory]);

  // This is now derived directly in previewContext from maxNumPages

  const galleryTemplate = (0,external_wp_element_.useMemo)(() => {
    const template = [['videopack/loop',
    // isPreview is a real declared attribute on videopack/loop's
    // own block.json (added specifically for this), so it
    // survives createBlock()'s sanitizeBlockAttributes() and
    // resolves directly from loop's own attribute — it keeps
    // loop/edit.js's canEdit false, so every grid item (including
    // the first/"active" one) renders through its static
    // LoopItemPreview path instead of real, persisted
    // <InnerBlocks>, which otherwise doesn't pick up attribute/
    // context changes on rebuild. Scoped to loop specifically:
    // videopack/collection only ever sees isPreview via context
    // fallback (it's never set as collection's own attribute
    // here), and forces gallery_per_page to 2 when true.
    {
      isPreview: true
    }, [['videopack/thumbnail', {
      linkTo: 'none'
    }, [['videopack/play-button', {}], gallery_title ? ['videopack/title', {
      isOverlay: true,
      showBackground: true
    }] : null].filter(Boolean)]]]];
    if (gallery_pagination) {
      template.push(['videopack/pagination', {}]);
    }
    return [['videopack/collection', collectionAttributes, template]];
  }, [gallery_title, gallery_pagination, collectionAttributes]);
  const previewBlocks = useStablePreviewBlocks(galleryTemplate);
  const previewContext = (0,external_wp_element_.useMemo)(() => {
    // Gallery query/structure attributes (source, per_page, columns, etc.)
    // live directly on the videopack/collection block itself now (see
    // collectionAttributes) — this context only needs to carry design
    // values (colors, watermark styles) that flow to children via
    // fallback, not anything collection's own query depends on.
    const ctx = {};

    // Pass all global settings into the context bridge for child blocks
    Object.keys(settings).forEach(key => {
      ctx[`videopack/${key}`] = settings[key];
    });

    // Ensure specific color fallbacks are applied for the preview bridge
    ctx['videopack/play_button_color'] = play_button_color || colorFallbacks.play_button_color;
    ctx['videopack/play_button_secondary_color'] = play_button_secondary_color || colorFallbacks.play_button_secondary_color;
    ctx['videopack/title_color'] = title_color || colorFallbacks.title_color;
    ctx['videopack/title_background_color'] = title_background_color || colorFallbacks.title_background_color;
    ctx['videopack/pagination_color'] = pagination_color || colorFallbacks.pagination_color;
    ctx['videopack/pagination_background_color'] = pagination_background_color || colorFallbacks.pagination_background_color;
    ctx['videopack/pagination_active_bg_color'] = pagination_active_bg_color || colorFallbacks.pagination_active_bg_color;
    ctx['videopack/pagination_active_color'] = pagination_active_color || colorFallbacks.pagination_active_color;
    return ctx;
  }, [settings, colorFallbacks, play_button_color, play_button_secondary_color, title_color, title_background_color, pagination_color, pagination_background_color, pagination_active_bg_color, pagination_active_color]);
  const galleryEndOptions = [{
    value: '',
    label: (0,external_wp_i18n_.__)('Stop and leave popup window open', 'video-embed-thumbnail-generator')
  }, {
    value: 'next',
    label: (0,external_wp_i18n_.__)('Autoplay next video', 'video-embed-thumbnail-generator')
  }, {
    value: 'close',
    label: (0,external_wp_i18n_.__)('Close popup window', 'video-embed-thumbnail-generator')
  }];
  const baseGalleryOrderbyOptions = [{
    value: 'menu_order',
    label: (0,external_wp_i18n_.__)('Default', 'video-embed-thumbnail-generator')
  }, {
    value: 'title',
    label: (0,external_wp_i18n_.__)('Title', 'video-embed-thumbnail-generator')
  }, {
    value: 'post_date',
    label: (0,external_wp_i18n_.__)('Date', 'video-embed-thumbnail-generator')
  }, {
    value: 'rand',
    label: (0,external_wp_i18n_.__)('Random', 'video-embed-thumbnail-generator')
  }, {
    value: 'ID',
    label: (0,external_wp_i18n_.__)('Video ID', 'video-embed-thumbnail-generator')
  }];
  const alignOptions = [{
    value: '',
    label: videopack_config.contentSize ? (0,external_wp_i18n_.sprintf)(/* translators: %s: Content size in pixels. */
    (0,external_wp_i18n_.__)("None (use theme's default width: %s)", 'video-embed-thumbnail-generator'), videopack_config.contentSize) : (0,external_wp_i18n_.__)("None (use theme's default width)", 'video-embed-thumbnail-generator')
  }, {
    value: 'wide',
    label: videopack_config.wideSize ? (0,external_wp_i18n_.sprintf)(/* translators: %s: Wide size in pixels. */
    (0,external_wp_i18n_.__)("Wide (use theme's wide width: %s)", 'video-embed-thumbnail-generator'), videopack_config.wideSize) : (0,external_wp_i18n_.__)("Wide (use theme's wide width)", 'video-embed-thumbnail-generator')
  }, {
    value: 'full',
    label: (0,external_wp_i18n_.__)('Full width', 'video-embed-thumbnail-generator')
  }, {
    value: 'left',
    label: (0,external_wp_i18n_.__)('Left', 'video-embed-thumbnail-generator')
  }, {
    value: 'center',
    label: (0,external_wp_i18n_.__)('Center', 'video-embed-thumbnail-generator')
  }, {
    value: 'right',
    label: (0,external_wp_i18n_.__)('Right', 'video-embed-thumbnail-generator')
  }];
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
      title: (0,external_wp_i18n_.__)('Pagination & Sorting', 'video-embed-thumbnail-generator'),
      initialOpen: true,
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
        __nextHasNoMarginBottom: true,
        label: (0,external_wp_i18n_.__)('Paginate', 'video-embed-thumbnail-generator'),
        onChange: handlers.gallery_pagination,
        checked: !!gallery_pagination
      }), gallery_pagination && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "videopack-setting-auto-width",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,external_wp_i18n_.__)('Videos per page', 'video-embed-thumbnail-generator'),
          type: "number",
          value: gallery_per_page,
          onChange: handlers.gallery_per_page
        })
      }), !gallery_pagination && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,external_wp_i18n_.__)('Limit number of videos', 'video-embed-thumbnail-generator'),
          onChange: val => {
            handlers.enable_collection_video_limit(val);
            if (!val) {
              handlers.collection_video_limit(-1);
            } else if (Number(collection_video_limit) === -1) {
              handlers.collection_video_limit(12);
            }
          },
          checked: !!enable_collection_video_limit
        }), !!enable_collection_video_limit && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
          className: "videopack-setting-auto-width",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.TextControl, {
            __nextHasNoMarginBottom: true,
            __next40pxDefaultSize: true,
            label: (0,external_wp_i18n_.__)('Video Limit', 'video-embed-thumbnail-generator'),
            help: (0,external_wp_i18n_.__)('Maximum number of videos to show in a gallery or list when pagination is disabled.', 'video-embed-thumbnail-generator'),
            type: "number",
            value: Number(collection_video_limit) === -1 ? 12 : collection_video_limit,
            onChange: handlers.collection_video_limit
          })
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "videopack-sort-settings",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.Flex, {
          align: "flex-end",
          className: "videopack-sort-controls",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.FlexItem, {
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
              label: (0,external_wp_i18n_.__)('Sort by', 'video-embed-thumbnail-generator'),
              value: gallery_orderby,
              onChange: handlers.gallery_orderby,
              options: baseGalleryOrderbyOptions,
              __nextHasNoMarginBottom: true,
              __next40pxDefaultSize: true
            })
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.FlexItem, {
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
              icon: gallery_order === 'asc' ? icon/* sortAscending */.V0 : icon/* sortDescending */.L8,
              label: gallery_order === 'asc' ? (0,external_wp_i18n_.__)('Ascending', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_.__)('Descending', 'video-embed-thumbnail-generator'),
              onClick: () => handlers.gallery_order(gallery_order === 'asc' ? 'desc' : 'asc'),
              showTooltip: true,
              variant: "secondary",
              __next40pxDefaultSize: true
            })
          })]
        })
      })]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
      title: (0,external_wp_i18n_.__)('Galleries', 'video-embed-thumbnail-generator'),
      initialOpen: true,
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "videopack-grid-row-align",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,external_wp_i18n_.__)('Alignment / Width', 'video-embed-thumbnail-generator'),
          value: gallery_align,
          onChange: handlers.gallery_align,
          options: alignOptions
        })
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-grid-row-align videopack-narrow-input",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,external_wp_i18n_.__)('Max Columns', 'video-embed-thumbnail-generator'),
          type: "number",
          value: gallery_columns,
          onChange: handlers.gallery_columns
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_VideopackTooltip, {
          text: (0,external_wp_i18n_.__)('The actual number of columns displayed may be lower than this value depending on the gallery Alignment / Width setting and the width of the container. Narrower widths will automatically collapse to fewer columns.', 'video-embed-thumbnail-generator')
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
        __nextHasNoMarginBottom: true,
        label: (0,external_wp_i18n_.__)('Overlay Title', 'video-embed-thumbnail-generator'),
        onChange: handlers.gallery_title,
        checked: !!gallery_title
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "videopack-setting-auto-width videopack-setting-extra-margin",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
          __next40pxDefaultSize: true,
          label: (0,external_wp_i18n_.__)('When current video ends', 'video-embed-thumbnail-generator'),
          value: gallery_end,
          onChange: handlers.gallery_end,
          options: galleryEndOptions
        })
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
        title: (0,external_wp_i18n_.__)('Design', 'video-embed-thumbnail-generator'),
        initialOpen: true,
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
          className: "videopack-grid-row-align",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
            __nextHasNoMarginBottom: true,
            __next40pxDefaultSize: true,
            label: (0,external_wp_i18n_.__)('Skin', 'video-embed-thumbnail-generator'),
            value: skin,
            onChange: handlers.skin,
            options: skinOptions
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "videopack-color-section",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("p", {
            className: "videopack-settings-section-title",
            children: (0,external_wp_i18n_.__)('Title', 'video-embed-thumbnail-generator')
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            className: "videopack-color-flex-row",
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker/* default */.A, {
                label: (0,external_wp_i18n_.__)('Text', 'video-embed-thumbnail-generator'),
                value: title_color,
                onChange: handlers.title_color,
                colors: videopack_config.themeColors,
                fallbackValue: colorFallbacks.title_color
              })
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker/* default */.A, {
                label: (0,external_wp_i18n_.__)('Background', 'video-embed-thumbnail-generator'),
                value: title_background_color,
                onChange: handlers.title_background_color,
                colors: videopack_config.themeColors,
                fallbackValue: colorFallbacks.title_background_color
              })
            })]
          })]
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "videopack-color-section",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("p", {
            className: "videopack-settings-section-title",
            children: (0,external_wp_i18n_.__)('Play button', 'video-embed-thumbnail-generator')
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            className: "videopack-color-flex-row",
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker/* default */.A, {
                label: embed_method === 'WordPress Default' ? (0,external_wp_i18n_.__)('Play Button Color', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_.__)('Play Button Icon', 'video-embed-thumbnail-generator'),
                value: play_button_color,
                onChange: handlers.play_button_color,
                colors: videopack_config.themeColors,
                fallbackValue: colorFallbacks.play_button_color
              })
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker/* default */.A, {
                label: embed_method === 'WordPress Default' ? (0,external_wp_i18n_.__)('Play Button Hover', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_.__)('Play Button Accent', 'video-embed-thumbnail-generator'),
                value: play_button_secondary_color,
                onChange: handlers.play_button_secondary_color,
                colors: videopack_config.themeColors,
                fallbackValue: colorFallbacks.play_button_secondary_color
              })
            })]
          })]
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "videopack-color-section",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("p", {
            className: "videopack-settings-section-title",
            children: (0,external_wp_i18n_.__)('Pagination', 'video-embed-thumbnail-generator')
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            className: "videopack-color-flex-row is-pagination",
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker/* default */.A, {
                label: (0,external_wp_i18n_.__)('Outline/Text', 'video-embed-thumbnail-generator'),
                value: pagination_color,
                onChange: handlers.pagination_color,
                colors: videopack_config.themeColors,
                fallbackValue: colorFallbacks.pagination_color
              })
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker/* default */.A, {
                label: (0,external_wp_i18n_.__)('Background', 'video-embed-thumbnail-generator'),
                value: pagination_background_color,
                onChange: handlers.pagination_background_color,
                colors: videopack_config.themeColors,
                fallbackValue: colorFallbacks.pagination_background_color
              })
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker/* default */.A, {
                label: (0,external_wp_i18n_.__)('Active Background', 'video-embed-thumbnail-generator'),
                value: pagination_active_bg_color,
                onChange: handlers.pagination_active_bg_color,
                colors: videopack_config.themeColors,
                fallbackValue: colorFallbacks.pagination_active_bg_color
              })
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker/* default */.A, {
                label: (0,external_wp_i18n_.__)('Active Text', 'video-embed-thumbnail-generator'),
                value: pagination_active_color,
                onChange: handlers.pagination_active_color,
                colors: videopack_config.themeColors,
                fallbackValue: colorFallbacks.pagination_active_color
              })
            })]
          })]
        })]
      }), previewContext && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "videopack-sample-gallery",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: `videopack-sample-gallery-wrapper align${gallery_align || 'none'}`,
          style: {
            '--wp--style--global--content-size': videopack_config.contentSize || '800px',
            '--wp--style--global--wide-size': videopack_config.wideSize || '1000px'
          },
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
            className: "videopack-settings-label",
            children: (0,external_wp_i18n_.__)('Sample Gallery', 'video-embed-thumbnail-generator')
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(PreviewIframe_PreviewIframe, {
            title: (0,external_wp_i18n_.__)('Video Gallery Preview', 'video-embed-thumbnail-generator'),
            resizeDependencies: [gallery_align],
            fullScreen: false,
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "videopack-preview-content-container",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.BlockContextProvider, {
                value: previewContext,
                children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_RealBlockPreview, {
                  blocks: previewBlocks
                })
              })
            })
          })]
        })
      })]
    })]
  });
};
/* harmony default export */ const components_VideoCollectionSettings = (VideoCollectionSettings);
// EXTERNAL MODULE: ./src/components/WatermarkSettingsPanel/WatermarkSettingsPanel.js
var WatermarkSettingsPanel = __webpack_require__(1166);
;// ./src/hooks/useResolutions.js
/**
 * Custom React hook for calculating video resolutions.
 */

/* global videopack_config */



/**
 * Hook to manage and calculate video resolutions, including a custom resolution option.
 *
 * @param {boolean}       enable_custom_resolution Whether to include the custom resolution in the list.
 * @param {string|number} custom_resolution        The height of the custom resolution.
 * @param {boolean}       onlyStandard             Whether to show only standard resolutions.
 * @return {Array} List of resolution objects.
 */
const useResolutions = (enable_custom_resolution, custom_resolution, onlyStandard = true) => {
  return (0,external_wp_element_.useMemo)(() => {
    // Filter based on whether we want only standard playback resolutions or all video resolutions.
    let resolutionsList = videopack_config.resolutions.filter(r => !r.is_custom && (onlyStandard ? r.is_standard !== false : r.is_video !== false));
    if (enable_custom_resolution) {
      const height = parseInt(custom_resolution, 10) || 900;
      const id = String(height);
      const width = Math.ceil(height * 16 / 9);
      const name = (0,external_wp_i18n_.sprintf)(/* translators: %s is the height of a custom video resolution. Example: 'Custom (4320p)' */
      (0,external_wp_i18n_.__)('Custom (%sp)', 'video-embed-thumbnail-generator'), height);

      // Remove any existing resolution with the same ID to avoid duplicates.
      resolutionsList = resolutionsList.filter(r => r.id !== id);
      resolutionsList.push({
        id,
        name,
        height,
        width,
        is_custom: true
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
  }, [enable_custom_resolution, custom_resolution, onlyStandard]);
};
/* harmony default export */ const hooks_useResolutions = (useResolutions);
// EXTERNAL MODULE: ./src/components/VideoPlayer/VideoPlayer.js
var VideoPlayer = __webpack_require__(730);
// EXTERNAL MODULE: ./src/utils/titleDownloadBlock.js
var titleDownloadBlock = __webpack_require__(1067);
;// ./src/features/settings/components/PlayerSettings.js
/* global videopack_config */


















const PlayerSettings = ({
  settings,
  setSettings,
  changeHandlerFactory
}) => {
  const {
    embed_method,
    overlay_title,
    watermark,
    watermark_styles,
    watermark_link_to,
    watermark_url,
    align,
    resize,
    auto_res,
    enable_custom_resolution,
    custom_resolution,
    pixel_ratio,
    find_formats,
    fullwidth,
    width,
    height,
    legacy_dimensions,
    fixed_aspect,
    controls,
    playsinline,
    pauseothervideos,
    volume,
    preload,
    skin,
    embeddable,
    embedcode,
    downloadlink,
    inline,
    views,
    autoplay,
    loop,
    muted,
    gifmode,
    playback_rate,
    encode,
    right_click,
    click_download,
    play_button_color,
    play_button_secondary_color,
    control_bar_bg_color,
    control_bar_color,
    title_color,
    title_background_color
  } = settings;
  const currentResolutions = hooks_useResolutions(enable_custom_resolution, custom_resolution);
  const changeGifmode = value => {
    setSettings(prevSettings => ({
      ...prevSettings,
      gifmode: value,
      autoplay: value,
      loop: value,
      muted: value
    }));
    if (value) {
      setSettings(prevSettings => ({
        ...prevSettings,
        controls: false,
        embeddable: false,
        overlay_title: false,
        views: false,
        playsinline: true
      }));
    } else {
      setSettings(prevSettings => ({
        ...prevSettings,
        controls: true,
        embeddable: true
      }));
    }
  };
  const handleCodecCheckboxChange = (codecId, isEnabled) => {
    const newEncode = JSON.parse(JSON.stringify(settings.encode || {}));
    const {
      codecs,
      resolutions
    } = videopack_config;
    const codecInfo = codecs.find(c => c.id === codecId);
    if (!newEncode[codecId]) {
      newEncode[codecId] = {
        resolutions: {}
      };
    }
    newEncode[codecId].enabled = !!isEnabled;
    if (isEnabled && codecInfo) {
      // Set default quality settings when enabling a codec for the first time
      if (!newEncode[codecId].rate_control) {
        newEncode[codecId].rate_control = codecInfo.supported_rate_controls[0];
        newEncode[codecId].crf = codecInfo.rate_control.crf.default;
        newEncode[codecId].vbr = codecInfo.rate_control.vbr.default;
      }
    }
    if (!isEnabled) {
      if (!newEncode[codecId].resolutions) {
        newEncode[codecId].resolutions = {};
      }
      resolutions.forEach(resolution => {
        newEncode[codecId].resolutions[resolution.id] = false;
      });
    }
    changeHandlerFactory.encode(newEncode);
  };
  const embedMethodOptions =
  /**
   * Filters the list of available embed player methods (e.g. Video.js, MediaElement).
   *
   * @since 5.0.0
   *
   * @param {Array} options Array of embed options containing value and label.
   */
  (0,external_wp_hooks_.applyFilters)('videopack_embed_method_options', [{
    value: 'Video.js',
    label: (0,external_wp_i18n_.__)('Video.js', 'video-embed-thumbnail-generator')
  }, {
    value: 'WordPress Default',
    label: (0,external_wp_i18n_.__)('WordPress Default', 'video-embed-thumbnail-generator')
  }, {
    value: 'None',
    label: (0,external_wp_i18n_.__)('None', 'video-embed-thumbnail-generator')
  }]);
  const preloadOptions = [{
    value: 'auto',
    label: (0,external_wp_i18n_.__)('Auto', 'video-embed-thumbnail-generator')
  }, {
    value: 'metadata',
    label: (0,external_wp_i18n_.__)('Metadata', 'video-embed-thumbnail-generator')
  }, {
    value: 'none',
    label: (0,external_wp_i18n_._x)('None', 'Preload value')
  }];
  const fixedAspectOptions = [{
    value: 'false',
    label: (0,external_wp_i18n_.__)('None', 'video-embed-thumbnail-generator')
  }, {
    value: 'true',
    label: (0,external_wp_i18n_.__)('All', 'video-embed-thumbnail-generator')
  }, {
    value: 'vertical',
    label: (0,external_wp_i18n_.__)('Vertical Videos', 'video-embed-thumbnail-generator')
  }];
  const watermarkLinkOptions = [{
    value: 'false',
    label: (0,external_wp_i18n_.__)('None', 'video-embed-thumbnail-generator')
  }, {
    value: 'home',
    label: (0,external_wp_i18n_.__)('Home page', 'video-embed-thumbnail-generator')
  }, {
    value: 'parent',
    label: (0,external_wp_i18n_.__)('Parent post', 'video-embed-thumbnail-generator')
  }, {
    value: 'download',
    label: (0,external_wp_i18n_.__)('Download video', 'video-embed-thumbnail-generator')
  }, {
    value: 'attachment',
    label: (0,external_wp_i18n_.__)('Video attachment page', 'video-embed-thumbnail-generator')
  }, {
    value: 'custom',
    label: (0,external_wp_i18n_.__)('Custom URL', 'video-embed-thumbnail-generator')
  }];
  const skinOptions = (0,external_wp_element_.useMemo)(() => {
    const options = [{
      value: 'vjs-theme-videopack',
      label: (0,external_wp_i18n_.__)('Videopack', 'video-embed-thumbnail-generator')
    }, {
      value: 'kg-video-js-skin',
      label: (0,external_wp_i18n_.__)('Videopack Classic', 'video-embed-thumbnail-generator')
    }, {
      value: 'default',
      label: (0,external_wp_i18n_.__)('Video.js default', 'video-embed-thumbnail-generator')
    }, {
      value: 'vjs-theme-city',
      label: (0,external_wp_i18n_.__)('City', 'video-embed-thumbnail-generator')
    }, {
      value: 'vjs-theme-fantasy',
      label: (0,external_wp_i18n_.__)('Fantasy', 'video-embed-thumbnail-generator')
    }, {
      value: 'vjs-theme-forest',
      label: (0,external_wp_i18n_.__)('Forest', 'video-embed-thumbnail-generator')
    }, {
      value: 'vjs-theme-sea',
      label: (0,external_wp_i18n_.__)('Sea', 'video-embed-thumbnail-generator')
    }];

    /**
     * Filters the list of available player skins based on the selected embed method.
     *
     * @since 5.0.0
     *
     * @param {Array}  options      List of skin option structures.
     * @param {string} embed_method The selected player embed method.
     */
    return (0,external_wp_hooks_.applyFilters)('videopack_player_skin_options', options, embed_method);
  }, [embed_method]);
  const alignOptions = [{
    value: '',
    label: videopack_config.contentSize ? (0,external_wp_i18n_.sprintf)(/* translators: %s: Content size in pixels. */
    (0,external_wp_i18n_.__)("None (use theme's default width: %s)", 'video-embed-thumbnail-generator'), videopack_config.contentSize) : (0,external_wp_i18n_.__)("None (use theme's default width)", 'video-embed-thumbnail-generator')
  }, {
    value: 'wide',
    label: videopack_config.wideSize ? (0,external_wp_i18n_.sprintf)(/* translators: %s: Wide size in pixels. */
    (0,external_wp_i18n_.__)("Wide (use theme's wide width: %s)", 'video-embed-thumbnail-generator'), videopack_config.wideSize) : (0,external_wp_i18n_.__)("Wide (use theme's wide width)", 'video-embed-thumbnail-generator')
  }, {
    value: 'full',
    label: (0,external_wp_i18n_.__)('Full width', 'video-embed-thumbnail-generator')
  }, {
    value: 'left',
    label: (0,external_wp_i18n_.__)('Left', 'video-embed-thumbnail-generator')
  }, {
    value: 'center',
    label: (0,external_wp_i18n_.__)('Center', 'video-embed-thumbnail-generator')
  }, {
    value: 'right',
    label: (0,external_wp_i18n_.__)('Right', 'video-embed-thumbnail-generator')
  }];
  const autoResOptions = () => {
    const items = [{
      value: 'automatic',
      label: (0,external_wp_i18n_.__)('Automatic', 'video-embed-thumbnail-generator')
    }, {
      value: 'highest',
      label: (0,external_wp_i18n_.__)('Highest', 'video-embed-thumbnail-generator')
    }, {
      value: 'lowest',
      label: (0,external_wp_i18n_.__)('Lowest', 'video-embed-thumbnail-generator')
    }];
    currentResolutions.forEach(resolution => {
      items.push({
        value: resolution.id,
        label: resolution.name
      });
    });
    return items;
  };
  const watermarkSettings = {
    url: watermark,
    ...watermark_styles
  };
  const handleWatermarkChange = newSettings => {
    const {
      url,
      ...styles
    } = newSettings;
    if (url !== undefined) {
      changeHandlerFactory.watermark(url);
    }
    changeHandlerFactory.watermark_styles({
      ...watermark_styles,
      ...styles
    });
  };
  const PLAYER_COLOR_FALLBACKS = (0,external_wp_element_.useMemo)(() => (0,colors/* getColorFallbacks */.l)(settings), [settings]);
  const showPlayButtonColors = (0,external_wp_hooks_.applyFilters)('videopack.videoSettings.showPlayButtonColors', true, settings);

  // Real attributes for the actual <VideoPlayer> instance — deliberately
  // the real, final URL rather than player-container/block.json's
  // 'videopack-preview-video' placeholder default — that string only
  // exists so a freshly-inserted real player-container block can swap
  // itself to a demo video via its own edit.js effect, which would
  // otherwise cascade REST requests here on every keystroke.
  const playerAttributes = (0,external_wp_element_.useMemo)(() => ({
    src: `${videopack_config.url}/src/images/Adobestock_469037984.mp4`,
    title: 'Sample Video',
    overlay_title: !!overlay_title,
    isPreview: true,
    embedlink: 'https://www.website.com/embed/',
    caption: (0,external_wp_i18n_.__)("If text is entered in the attachment's caption field it is displayed here automatically.")
  }), [overlay_title]);
  const previewContext = (0,external_wp_element_.useMemo)(() => {
    const ctx = {
      'videopack/isInsidePlayerContainer': true,
      'videopack/isPreview': true
    };
    // Add fallbacks first
    Object.keys(PLAYER_COLOR_FALLBACKS).forEach(key => {
      ctx[`videopack/${key}`] = PLAYER_COLOR_FALLBACKS[key];
    });
    // Override with actual settings
    Object.keys(settings).forEach(key => {
      if (settings[key] !== undefined && settings[key] !== null && settings[key] !== '') {
        ctx[`videopack/${key}`] = settings[key];
      }
    });

    // Flatten watermark styles for blocks that expect individual attributes
    if (settings.watermark_styles) {
      Object.entries(settings.watermark_styles).forEach(([key, val]) => {
        const contextKey = key.startsWith('watermark_') ? key : `watermark_${key}`;
        ctx[`videopack/${contextKey}`] = val;
      });
    }

    // Title/download/share blocks (rendered separately via
    // RealBlockPreview, not as real InnerBlocks descendants of a
    // player-container/player block) get the sample video's actual data
    // — title, caption, embedlink — only through this ambient context,
    // since useVideopackData reads context, not a block's own saved
    // attribute. See VideoTitle.js.
    Object.keys(playerAttributes).forEach(key => {
      ctx[`videopack/${key}`] = playerAttributes[key];
    });
    return ctx;
  }, [settings, PLAYER_COLOR_FALLBACKS, playerAttributes]);

  // The sample player itself is rendered directly via <VideoPlayer> (see
  // JSX below), not through useBlockPreview/RealBlockPreview — that hook
  // applies useDisabled() to everything it renders, which would leave the
  // sample video permanently unplayable and hide Video.js's control-bar
  // colors (only visible once playback has actually started). Only the
  // overlay chrome (title/watermark) and view-count, which don't need to
  // be interactive, go through RealBlockPreview — mirroring
  // AttachmentPreview.js's established pattern for the same tradeoff.
  const showTitleBar = !!(overlay_title || downloadlink || embeddable && embedcode);
  const overlayTemplate = (0,external_wp_element_.useMemo)(() => {
    const template = [];
    if (showTitleBar) {
      template.push(['videopack/title', {
        overlay_title: !!overlay_title,
        showBackground: true
      }, (0,titleDownloadBlock/* getTitleInnerTemplate */.jM)(!!downloadlink, !!(embeddable && embedcode))]);
    }
    if (watermark) {
      template.push(['videopack/watermark', {}]);
    }
    return template;
  }, [showTitleBar, overlay_title, downloadlink, embeddable, embedcode, watermark]);
  const overlayBlocks = useStablePreviewBlocks(overlayTemplate);
  const viewCountTemplate = (0,external_wp_element_.useMemo)(() => {
    if (!views) {
      return [];
    }
    return [['videopack/view-count', {}]];
  }, [views]);
  const viewCountBlocks = useStablePreviewBlocks(viewCountTemplate);

  // Title/Watermark render inside VideoPlayer's overlay chrome, so they
  // need the extra isInsidePlayerOverlay context their real edit.js
  // components check for — view-count (rendered as a sibling, outside
  // VideoPlayer) uses previewContext directly instead.
  const playerOverlayContext = (0,external_wp_element_.useMemo)(() => ({
    ...previewContext,
    'videopack/isInsidePlayerOverlay': true
  }), [previewContext]);

  // Mirrors player-container/edit.js's own effectiveAlign resolution so
  // the sample player keeps the same width/alignment behavior now that
  // it's no longer rendered through that block's own edit.js.
  const effectiveAlign = align || videopack_config?.options?.align || '';
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelBody, {
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-grid-row-align",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,external_wp_i18n_.__)('Video player', 'video-embed-thumbnail-generator'),
          value: embed_method,
          onChange: value => {
            changeHandlerFactory.embed_method(value);
            /**
             * Filters the default skin applied when selecting a player method.
             *
             * @since 5.0.0
             *
             * @param {string|undefined} default_skin Skin identifier.
             * @param {string}           value        The selected player method name.
             */
            const defaultSkin = (0,external_wp_hooks_.applyFilters)('videopack_default_skin', value === 'WordPress Default' ? 'vjs-theme-videopack' : undefined, value);
            if (defaultSkin) {
              changeHandlerFactory.skin(defaultSkin);
            }
          },
          options: embedMethodOptions
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_VideopackTooltip, {
          text: (0,external_wp_i18n_.__)('Video.js version 8 is the default player. You can also choose the WordPress Default Mediaelement.js player which may already be skinned to match your theme. Selecting "None" outputs a plain, unenhanced video tag, but does not currently prevent the plugin\'s CSS or JS from loading on the front end.', 'video-embed-thumbnail-generator')
        })]
      })
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelBody, {
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: `videopack-sample-video-player align${align || 'none'}`,
        style: {
          '--wp--style--global--content-size': videopack_config.contentSize || '800px',
          '--wp--style--global--wide-size': videopack_config.wideSize || '1000px'
        },
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelRow, {
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.Flex, {
            className: "videopack-flex-bottom",
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.FlexBlock, {
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
                __nextHasNoMarginBottom: true,
                label: (0,external_wp_i18n_.__)('Title', 'video-embed-thumbnail-generator'),
                onChange: changeHandlerFactory.overlay_title,
                checked: !!overlay_title
              })
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.FlexBlock, {
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
                __nextHasNoMarginBottom: true,
                label: (0,external_wp_i18n_.__)('Download', 'video-embed-thumbnail-generator'),
                onChange: changeHandlerFactory.downloadlink,
                checked: !!downloadlink
              })
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.FlexBlock, {
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.FlexItem, {
                children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
                  __nextHasNoMarginBottom: true,
                  label: (0,external_wp_i18n_.__)('Share', 'video-embed-thumbnail-generator'),
                  onChange: changeHandlerFactory.embedcode,
                  checked: !!embedcode,
                  disabled: !embeddable
                })
              })
            })]
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(PreviewIframe_PreviewIframe, {
          title: (0,external_wp_i18n_.__)('Video Player Preview', 'video-embed-thumbnail-generator'),
          resizeDependencies: [align],
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            className: `wp-block-videopack-player-container${effectiveAlign ? ` align${effectiveAlign}` : ''}`,
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(VideoPlayer/* default */.A, {
              attributes: playerAttributes,
              context: previewContext,
              children: overlayBlocks.length > 0 && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.BlockContextProvider, {
                value: playerOverlayContext,
                children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_RealBlockPreview, {
                  blocks: overlayBlocks
                })
              })
            }), viewCountBlocks.length > 0 && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_.BlockContextProvider, {
              value: previewContext,
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_RealBlockPreview, {
                blocks: viewCountBlocks
              })
            })]
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelRow, {
          className: "videopack-flex-right",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
            __nextHasNoMarginBottom: true,
            label: (0,external_wp_i18n_.__)('View count', 'video-embed-thumbnail-generator'),
            onChange: changeHandlerFactory.views,
            checked: !!views
          })
        })]
      })
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
      title: (0,external_wp_i18n_.__)('Design', 'video-embed-thumbnail-generator'),
      children: [embed_method.startsWith('Video.js') && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "videopack-grid-row-align",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,external_wp_i18n_.__)('Skin', 'video-embed-thumbnail-generator'),
          value: skin,
          onChange: changeHandlerFactory.skin,
          options: skinOptions
        })
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-color-section",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("p", {
          className: "videopack-settings-section-title",
          children: (0,external_wp_i18n_.__)('Title overlay', 'video-embed-thumbnail-generator')
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "videopack-color-flex-row",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker/* default */.A, {
              label: (0,external_wp_i18n_.__)('Text', 'video-embed-thumbnail-generator'),
              value: title_color,
              onChange: changeHandlerFactory.title_color,
              colors: videopack_config.themeColors,
              fallbackValue: PLAYER_COLOR_FALLBACKS.title_color
            })
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker/* default */.A, {
              label: (0,external_wp_i18n_.__)('Background', 'video-embed-thumbnail-generator'),
              value: title_background_color,
              onChange: changeHandlerFactory.title_background_color,
              colors: videopack_config.themeColors,
              fallbackValue: PLAYER_COLOR_FALLBACKS.title_background_color
            })
          })]
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-color-section",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("p", {
          className: "videopack-settings-section-title",
          children: (0,external_wp_i18n_.__)('Player', 'video-embed-thumbnail-generator')
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "videopack-color-flex-row",
          children: [showPlayButtonColors && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker/* default */.A, {
                label: embed_method === 'WordPress Default' ? (0,external_wp_i18n_.__)('Play Button Color', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_.__)('Play Button Icon', 'video-embed-thumbnail-generator'),
                value: play_button_color,
                onChange: changeHandlerFactory.play_button_color,
                colors: videopack_config.themeColors,
                fallbackValue: PLAYER_COLOR_FALLBACKS.play_button_color
              })
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker/* default */.A, {
                label: embed_method === 'WordPress Default' ? (0,external_wp_i18n_.__)('Play Button Hover', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_.__)('Play Button Accent', 'video-embed-thumbnail-generator'),
                value: play_button_secondary_color,
                onChange: changeHandlerFactory.play_button_secondary_color,
                colors: videopack_config.themeColors,
                fallbackValue: PLAYER_COLOR_FALLBACKS.play_button_secondary_color
              })
            })]
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker/* default */.A, {
              label: (0,external_wp_i18n_.__)('Control Bar Background', 'video-embed-thumbnail-generator'),
              value: control_bar_bg_color,
              onChange: changeHandlerFactory.control_bar_bg_color,
              colors: videopack_config.themeColors,
              fallbackValue: PLAYER_COLOR_FALLBACKS.control_bar_bg_color
            })
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker/* default */.A, {
              label: (0,external_wp_i18n_.__)('Control Bar Icons', 'video-embed-thumbnail-generator'),
              value: control_bar_color,
              onChange: changeHandlerFactory.control_bar_color,
              colors: videopack_config.themeColors,
              fallbackValue: PLAYER_COLOR_FALLBACKS.control_bar_color
            })
          })]
        })]
      })]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
      title: (0,external_wp_i18n_.__)('Default Playback', 'video-embed-thumbnail-generator'),
      initialOpen: true,
      className: "videopack-setting-default-playback",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.Flex, {
        "align-items": "flex-start",
        expanded: false,
        gap: 20,
        justify: "flex-start",
        className: "videopack-player-settings-flex",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.FlexItem, {
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
            __nextHasNoMarginBottom: true,
            label: (0,external_wp_i18n_.__)('Autoplay', 'video-embed-thumbnail-generator'),
            onChange: changeHandlerFactory.autoplay,
            checked: !!autoplay,
            disabled: gifmode,
            help: (0,external_wp_i18n_.__)('Most browsers will only autoplay if the video starts muted.')
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
            __nextHasNoMarginBottom: true,
            label: (0,external_wp_i18n_.__)('Pause other videos on page when starting a new video', 'video-embed-thumbnail-generator'),
            onChange: changeHandlerFactory.pauseothervideos,
            checked: !!pauseothervideos,
            disabled: gifmode
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
            __nextHasNoMarginBottom: true,
            label: (0,external_wp_i18n_.__)('Loop', 'video-embed-thumbnail-generator'),
            onChange: changeHandlerFactory.loop,
            checked: !!loop,
            disabled: gifmode
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
            __nextHasNoMarginBottom: true,
            label: (0,external_wp_i18n_.__)('Muted', 'video-embed-thumbnail-generator'),
            onChange: changeHandlerFactory.muted,
            checked: !!muted,
            disabled: gifmode
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.RangeControl, {
            __next40pxDefaultSize: true,
            __nextHasNoMarginBottom: true,
            className: "videopack-volume-control",
            label: (0,external_wp_i18n_.__)('Volume', 'video-embed-thumbnail-generator'),
            value: volume,
            beforeIcon: icon/* volumeDown */.pZ,
            afterIcon: icon/* volumeUp */.Kx,
            initialPosition: 1,
            withInputField: false,
            onChange: changeHandlerFactory.volume,
            min: 0,
            max: 1,
            step: 0.05,
            disabled: muted || gifmode
          })]
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.FlexItem, {
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
            __nextHasNoMarginBottom: true,
            label: (0,external_wp_i18n_.__)('Controls', 'video-embed-thumbnail-generator'),
            onChange: changeHandlerFactory.controls,
            checked: !!controls,
            disabled: gifmode
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
            __nextHasNoMarginBottom: true,
            label: (0,external_wp_i18n_.__)('Play inline', 'video-embed-thumbnail-generator'),
            onChange: changeHandlerFactory.playsinline,
            checked: !!playsinline,
            disabled: gifmode,
            help: (0,external_wp_i18n_.__)('Plays inline instead of fullscreen on iPhones.')
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
            __nextHasNoMarginBottom: true,
            label: (0,external_wp_i18n_.__)('Variable speeds', 'video-embed-thumbnail-generator'),
            onChange: changeHandlerFactory.playback_rate,
            disabled: gifmode,
            checked: !!playback_rate
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.RadioControl, {
            label: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("span", {
              className: "videopack-label-with-tooltip",
              children: [(0,external_wp_i18n_.__)('Preload', 'video-embed-thumbnail-generator'), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_VideopackTooltip, {
                text: (0,external_wp_i18n_.__)('Controls how much of a video to load before the user starts playback. Mobile browsers never preload any video information. Selecting "metadata" will load the height and width and format information along with a few seconds of the video in some desktop browsers. "Auto" will preload nearly a minute of video in most desktop browsers. "None" will prevent all data from preloading.', 'video-embed-thumbnail-generator')
              })]
            }),
            selected: preload,
            onChange: changeHandlerFactory.preload,
            options: preloadOptions,
            disabled: gifmode
          })]
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-control-with-tooltip",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,external_wp_i18n_.__)('GIF mode', 'video-embed-thumbnail-generator'),
          onChange: value => {
            changeGifmode(value);
          },
          checked: !!gifmode
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_VideopackTooltip, {
          text: (0,external_wp_i18n_.__)('Video acts like an animated GIF. Enables autoplay, loop, mute, and disables controls.', 'video-embed-thumbnail-generator')
        })]
      })]
    }), (0,external_wp_hooks_.applyFilters)(
    /**
     * Action filter hook to render custom settings components after playback options.
     *
     * @since 5.0.0
     *
     * @param {null}   empty   Null context value.
     * @param {Object} context Object containing settings and changeHandlerFactory.
     */
    'videopack.settings.player.after_playback', null, {
      settings,
      changeHandlerFactory
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
      title: (0,external_wp_i18n_.__)('Dimensions', 'video-embed-thumbnail-generator'),
      initialOpen: true,
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "videopack-grid-row-align",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,external_wp_i18n_.__)('Alignment / Width', 'video-embed-thumbnail-generator'),
          value: align,
          onChange: changeHandlerFactory.align,
          options: alignOptions
        })
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.RadioControl, {
        label: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("span", {
          className: "videopack-label-with-tooltip",
          children: [(0,external_wp_i18n_.__)('Constrain to default aspect ratio', 'video-embed-thumbnail-generator'), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_VideopackTooltip, {
            text: (0,external_wp_i18n_.__)('When set to "none," the video player will automatically adjust to the aspect ratio of the video, but in some cases a fixed aspect ratio is required, and vertical videos often fit better on the page when shown in a shorter window.', 'video-embed-thumbnail-generator')
          })]
        }),
        selected: fixed_aspect,
        onChange: changeHandlerFactory.fixed_aspect,
        options: fixedAspectOptions,
        className: "videopack-setting-radio-group"
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
        __nextHasNoMarginBottom: true,
        label: (0,external_wp_i18n_.__)('Use legacy dimension settings', 'video-embed-thumbnail-generator'),
        onChange: changeHandlerFactory.legacy_dimensions,
        checked: !!legacy_dimensions
      }), legacy_dimensions && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
          className: "videopack-setting-auto-width",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.TextControl, {
            __nextHasNoMarginBottom: true,
            __next40pxDefaultSize: true,
            label: (0,external_wp_i18n_.__)('Width', 'video-embed-thumbnail-generator'),
            type: "number",
            value: width,
            onChange: changeHandlerFactory.width
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
          className: "videopack-setting-auto-width",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.TextControl, {
            __nextHasNoMarginBottom: true,
            __next40pxDefaultSize: true,
            label: (0,external_wp_i18n_.__)('Height', 'video-embed-thumbnail-generator'),
            type: "number",
            value: height,
            onChange: changeHandlerFactory.height
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,external_wp_i18n_.__)('Make video display inline', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.inline,
          checked: !!inline
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Flex, {
          direction: "column",
          expanded: false,
          align: "flex-start",
          justify: "flex-start",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.FlexItem, {
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
              __nextHasNoMarginBottom: true,
              label: (0,external_wp_i18n_.__)('Shrink player to fit container', 'video-embed-thumbnail-generator'),
              onChange: changeHandlerFactory.resize,
              checked: !!resize
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
              className: "videopack-control-with-tooltip",
              children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
                __nextHasNoMarginBottom: true,
                label: (0,external_wp_i18n_.__)('Expand player to full width of container', 'video-embed-thumbnail-generator'),
                onChange: changeHandlerFactory.fullwidth,
                checked: !!fullwidth
              }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_VideopackTooltip, {
                text: (0,external_wp_i18n_.__)("Enabling this will ignore any other width settings and set the width of the video to the width of the container it's in.", 'video-embed-thumbnail-generator')
              })]
            })]
          })
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-grid-row-align",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,external_wp_i18n_.__)('Default resolution', 'video-embed-thumbnail-generator'),
          value: auto_res,
          onChange: changeHandlerFactory.auto_res,
          options: autoResOptions()
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_VideopackTooltip, {
          text: (0,external_wp_i18n_.__)('If multiple resolutions for a video are available, you can choose to load the highest or lowest available resolution by default, automatically select the resolution based on the size of the video window, or indicate a particular resolution to use every time.', 'video-embed-thumbnail-generator')
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-control-with-tooltip",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,external_wp_i18n_.__)('Use device pixel ratio for resolution calculation', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.pixel_ratio,
          checked: !!pixel_ratio
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_VideopackTooltip, {
          text: (0,external_wp_i18n_.__)('Most modern mobile devices and some very high-resolution desktop displays (what Apple calls a Retina display) use a pixel ratio to calculate the size of their viewport. Using the pixel ratio can result in a higher resolution being selected on mobile devices than on desktop devices. Because these devices actually have extremely high resolutions, and in a responsive design the video player usually takes up more of the screen than on a desktop browser, this is not a mistake, but your users might prefer to use less mobile data.', 'video-embed-thumbnail-generator')
        })]
      })]
    }), (0,external_wp_hooks_.applyFilters)(
    /**
     * Action filter hook to render custom settings components after dimensions options.
     *
     * @since 5.0.0
     *
     * @param {null}   empty   Null context value.
     * @param {Object} context Object containing settings and changeHandlerFactory.
     */
    'videopack.settings.player.after_dimensions', null, {
      settings,
      changeHandlerFactory
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
      title: (0,external_wp_i18n_.__)('Sharing', 'video-embed-thumbnail-generator'),
      initialOpen: true,
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
        __nextHasNoMarginBottom: true,
        label: (0,external_wp_i18n_.__)('Allow users to embed your videos on other sites'),
        onChange: changeHandlerFactory.embeddable,
        checked: !!embeddable
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-control-with-tooltip",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,external_wp_i18n_.__)('Allow right-clicking on videos', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.right_click,
          checked: !!right_click
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_VideopackTooltip, {
          text: (0,external_wp_i18n_.__)("We can't prevent a user from simply saving the downloaded video file from the browser's cache, but disabling right-clicking will make it more difficult for casual users to save your videos.", 'video-embed-thumbnail-generator')
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-control-with-tooltip",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,external_wp_i18n_.__)('Allow single-click download links', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.click_download,
          checked: !!click_download
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_VideopackTooltip, {
          text: (0,external_wp_i18n_.__)("Videopack creates a one-click method for users who want to allow easy video downloading, but if some of your videos are hidden or private, depending on the methods you use, someone who guesses a video's WordPress database ID could potentially use the method to download videos they might not otherwise have access to.", 'video-embed-thumbnail-generator')
        })]
      })]
    }), (0,external_wp_hooks_.applyFilters)(
    /**
     * Action filter hook to render custom settings components after sharing options.
     *
     * @since 5.0.0
     *
     * @param {null}   empty   Null context value.
     * @param {Object} context Object containing settings and changeHandlerFactory.
     */
    'videopack.settings.player.after_sharing', null, {
      settings,
      changeHandlerFactory
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(WatermarkSettingsPanel/* default */.A, {
      title: (0,external_wp_i18n_.__)('Watermark Overlay', 'video-embed-thumbnail-generator'),
      watermarkSettings: watermarkSettings,
      onChange: handleWatermarkChange,
      initialOpen: true,
      children: watermark && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-grid-row-align",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,external_wp_i18n_.__)('Link to', 'video-embed-thumbnail-generator'),
          value: watermark_link_to,
          onChange: changeHandlerFactory.watermark_link_to,
          options: watermarkLinkOptions
        }), watermark_link_to === 'custom' && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,external_wp_i18n_.__)('URL', 'video-embed-thumbnail-generator'),
          type: "url",
          value: watermark_url,
          onChange: changeHandlerFactory.watermark_url
        })]
      })
    }), (0,external_wp_hooks_.applyFilters)(
    /**
     * Action filter hook to render custom settings components after watermark options.
     *
     * @since 5.0.0
     *
     * @param {null}   empty   Null context value.
     * @param {Object} context Object containing settings and changeHandlerFactory.
     */
    'videopack.settings.player.after_watermark', null, {
      settings,
      changeHandlerFactory
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
      title: (0,external_wp_i18n_.__)('Video Sources', 'video-embed-thumbnail-generator'),
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
        __nextHasNoMarginBottom: true,
        label: (0,external_wp_i18n_.__)('Enable custom resolution', 'video-embed-thumbnail-generator'),
        onChange: changeHandlerFactory.enable_custom_resolution,
        checked: !!enable_custom_resolution
      }), enable_custom_resolution && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "videopack-setting-auto-width",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,external_wp_i18n_.__)('Custom Resolution Height', 'video-embed-thumbnail-generator'),
          type: "number",
          value: custom_resolution || '',
          onChange: value => changeHandlerFactory.custom_resolution(value === '' ? 0 : parseInt(value, 10))
        })
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-control-with-tooltip",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,external_wp_i18n_.__)('Automatically search for other formats of original file.', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.find_formats,
          checked: !!find_formats
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_VideopackTooltip, {
          text: (0,external_wp_i18n_.__)('Videos encoded by Videopack or manually assigned in the Media Library will always be found, but if this setting is enabled for a video named video.mp4, the player will also search for files with the naming pattern basename-codec_resolution. Eg: video-h264_720.mp4, video-vp9_1080.mp4, etc. Legacy filename structures (video-720.mp4, video-1080.mp4, etc.) are still supported.', 'video-embed-thumbnail-generator')
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.BaseControl, {
        label: (0,external_wp_i18n_.__)('Available Formats', 'video-embed-thumbnail-generator'),
        id: "videopack-find-formats-codecs",
        className: "videopack-setting-checkbox-group videopack-setting-extra-margin",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
          children: videopack_config.codecs.map(codec => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.CheckboxControl, {
            __nextHasNoMarginBottom: true,
            label: codec.name,
            checked: !!encode?.[codec.id]?.enabled,
            onChange: isChecked => handleCodecCheckboxChange(codec.id, isChecked)
          }, codec.id))
        })
      })]
    }), (0,external_wp_hooks_.applyFilters)(
    /**
     * Action filter hook to render custom settings components after sources options.
     *
     * @since 5.0.0
     *
     * @param {null}   empty   Null context value.
     * @param {Object} context Object containing settings and changeHandlerFactory.
     */
    'videopack.settings.player.after_sources', null, {
      settings,
      changeHandlerFactory
    })]
  });
};
/* harmony default export */ const components_PlayerSettings = (PlayerSettings);
// EXTERNAL MODULE: ./src/api/media.js
var media = __webpack_require__(4263);
;// ./src/hooks/useBatchProcess.js
/**
 * Custom React hook for managing batch processes.
 */




/**
 * Hook to manage batch processing of items with progress tracking and confirmation dialogs.
 *
 * @return {Object} Batch process state and controls.
 */
const useBatchProcess = () => {
  const [isProcessing, setIsProcessing] = (0,external_wp_element_.useState)(false);
  const [progress, setProgress] = (0,external_wp_element_.useState)({
    current: 0,
    total: 0
  });
  const [confirmDialog, setConfirmDialog] = (0,external_wp_element_.useState)({
    isOpen: false,
    message: '',
    onConfirm: null,
    isAlert: false
  });
  const intervalRef = (0,external_wp_element_.useRef)(null);

  // Cleanup interval on unmount
  (0,external_wp_element_.useEffect)(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  const closeConfirmDialog = (0,external_wp_element_.useCallback)(() => {
    setConfirmDialog(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);
  const showAlert = (0,external_wp_element_.useCallback)(message => {
    setConfirmDialog({
      isOpen: true,
      message,
      onConfirm: null,
      isAlert: true
    });
  }, []);
  const runPolling = (0,external_wp_element_.useCallback)(async (startFn, progressFn, noItemsMessage) => {
    setIsProcessing(true);
    setProgress({
      current: 0,
      total: 0
    });
    try {
      const response = await startFn();
      const total = response.total;
      if (total === 0) {
        setIsProcessing(false);
        showAlert(noItemsMessage);
        return;
      }
      setProgress({
        current: 0,
        total
      });
      intervalRef.current = setInterval(async () => {
        try {
          const progressData = await progressFn();
          const pending = progressData.pending + progressData['in-progress'];
          const completed = progressData.complete + progressData.failed;
          const currentTotal = pending + completed;
          setProgress({
            current: completed,
            total: currentTotal > 0 ? currentTotal : total
          });
          if (pending === 0) {
            clearInterval(intervalRef.current);
            setIsProcessing(false);
          }
        } catch (e) {
          console.error(e);
          clearInterval(intervalRef.current);
          setIsProcessing(false);
        }
      }, 2000);
    } catch (error) {
      console.error(error);
      showAlert((0,external_wp_i18n_.__)('An error occurred while processing.', 'video-embed-thumbnail-generator'));
      setIsProcessing(false);
    }
  }, [showAlert]);
  const confirmAndRun = (0,external_wp_element_.useCallback)((confirmMessage, startFn, progressFn, noItemsMessage = (0,external_wp_i18n_.__)('No items found to process.', 'video-embed-thumbnail-generator')) => {
    setConfirmDialog({
      isOpen: true,
      message: confirmMessage,
      onConfirm: () => runPolling(startFn, progressFn, noItemsMessage),
      isAlert: false
    });
  }, [runPolling]);
  return {
    isProcessing,
    setIsProcessing,
    progress,
    setProgress,
    confirmDialog,
    setConfirmDialog,
    closeConfirmDialog,
    runPolling,
    confirmAndRun,
    showAlert
  };
};
/* harmony default export */ const hooks_useBatchProcess = (useBatchProcess);
// EXTERNAL MODULE: ./src/features/settings/components/SelectFromLibrary.js
var SelectFromLibrary = __webpack_require__(2032);
;// ./src/features/settings/components/ThumbnailSettings.js









const config = window.videopack_config || {};
const ThumbnailSettings = ({
  settings,
  changeHandlerFactory
}) => {
  const {
    browser_thumbnails,
    ffmpeg_exists,
    poster,
    endofvideooverlay,
    ffmpeg_thumb_watermark,
    total_thumbnails,
    featured,
    thumb_parent,
    hide_thumbnails,
    endofvideooverlaysame,
    auto_thumb,
    auto_thumb_number,
    auto_thumb_position,
    active_encoder = 'ffmpeg'
  } = settings;
  const activeEncoderReady = (0,external_wp_hooks_.applyFilters)('videopack.encoder.is_ready', !!config.isTranscodingServiceReady, active_encoder, settings);
  const effectiveFfmpegExists = active_encoder !== 'ffmpeg' && activeEncoderReady || ffmpeg_exists === true || ffmpeg_exists === 'true' || ffmpeg_exists === 1 || ffmpeg_exists === '1';
  const browserThumbnailsRequirement = (0,external_wp_hooks_.applyFilters)('videopack.settings.browserThumbnailsRequirement', {
    force: false,
    help: null
  }, config);
  const featuredBatch = hooks_useBatchProcess();
  const parentsBatch = hooks_useBatchProcess();
  const handleSetAllFeatured = async () => {
    featuredBatch.confirmAndRun((0,external_wp_i18n_.__)('Are you sure you want to set all video thumbnails as featured images for their parent posts? This may overwrite existing featured images.', 'video-embed-thumbnail-generator'), () => (0,media/* startBatchProcess */.AO)('featured'), () => (0,media/* getBatchProgress */.wW)('featured'), (0,external_wp_i18n_.__)('No videos found to process.', 'video-embed-thumbnail-generator'));
  };
  const handleSetAllParents = async () => {
    const confirmMessage = thumb_parent === 'video' ? (0,external_wp_i18n_.__)('Are you sure you want to attach all thumbnails to their parent videos?', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_.__)('Are you sure you want to attach all thumbnails to the parent posts?', 'video-embed-thumbnail-generator');
    parentsBatch.confirmAndRun(confirmMessage, () => (0,media/* startBatchProcess */.AO)('parents', {
      target_parent: thumb_parent
    }), () => (0,media/* getBatchProgress */.wW)('parents'), (0,external_wp_i18n_.__)('No thumbnails found to process.', 'video-embed-thumbnail-generator'));
  };
  const thumbParentOptions = [{
    value: 'post',
    label: (0,external_wp_i18n_.__)('Post', 'video-embed-thumbnail-generator')
  }, {
    value: 'video',
    label: (0,external_wp_i18n_.__)('Video', 'video-embed-thumbnail-generator')
  }];
  const changeAutoThumbNumber = value => {
    const numVal = parseInt(value, 10) || 1;
    changeHandlerFactory.auto_thumb_number(numVal);
    if (numVal === 1) {
      changeHandlerFactory.auto_thumb_position('50');
    } else {
      changeHandlerFactory.auto_thumb_position('1');
    }
  };
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
      title: (0,external_wp_i18n_.__)('Manual Generation', 'video-embed-thumbnail-generator'),
      initialOpen: true,
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "videopack-grid-row-align videopack-narrow-input",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,external_wp_i18n_.__)('Default to generate', 'video-embed-thumbnail-generator'),
          type: "number",
          value: total_thumbnails,
          onChange: changeHandlerFactory.total_thumbnails
        })
      }), !!effectiveFfmpegExists && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
        __nextHasNoMarginBottom: true,
        label: (0,external_wp_i18n_.__)("When possible, use the browser's built-in video capabilities to generate thumbnails"),
        value: browser_thumbnails,
        checked: !!browser_thumbnails || !!browserThumbnailsRequirement.force,
        onChange: changeHandlerFactory.browser_thumbnails,
        disabled: !!browserThumbnailsRequirement.force,
        help: browserThumbnailsRequirement.help
      })]
    }), !!effectiveFfmpegExists && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
      title: (0,external_wp_i18n_.__)('Automatic Generation on Upload', 'video-embed-thumbnail-generator'),
      initialOpen: true,
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
        __nextHasNoMarginBottom: true,
        label: (0,external_wp_i18n_.__)('Thumbnails', 'video-embed-thumbnail-generator'),
        onChange: changeHandlerFactory.auto_thumb,
        checked: !!auto_thumb
      }), !!auto_thumb && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
          className: "videopack-grid-row-align videopack-narrow-input",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.TextControl, {
            __nextHasNoMarginBottom: true,
            __next40pxDefaultSize: true,
            label: (0,external_wp_i18n_.__)('Number of thumbnails', 'video-embed-thumbnail-generator'),
            type: "number",
            min: "1",
            max: "99",
            value: auto_thumb_number,
            onChange: changeAutoThumbNumber
          })
        }), String(auto_thumb_number) === '1' ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "videopack-grid-row-align",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.RangeControl, {
            __nextHasNoMarginBottom: true,
            __next40pxDefaultSize: true,
            label: (0,external_wp_i18n_.__)('Video position', 'video-embed-thumbnail-generator'),
            value: Number(auto_thumb_position),
            onChange: changeHandlerFactory.auto_thumb_position,
            min: 0,
            max: 100,
            step: 1,
            help: (0,external_wp_i18n_.sprintf)(/* translators: %s is a percent sign. */
            (0,external_wp_i18n_.__)('Where in the video to capture the thumbnail (e.g., 50%s for the exact middle).', 'video-embed-thumbnail-generator'), '%')
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
            className: "videopack-input-suffix",
            children: "%"
          })]
        }) : /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
          className: "videopack-grid-row-align",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.RangeControl, {
            __nextHasNoMarginBottom: true,
            __next40pxDefaultSize: true,
            label: (0,external_wp_i18n_.__)('Featured thumbnail number', 'video-embed-thumbnail-generator'),
            value: Number(auto_thumb_position),
            onChange: changeHandlerFactory.auto_thumb_position,
            min: 1,
            max: Number(auto_thumb_number),
            step: 1,
            help: (0,external_wp_i18n_.__)("Which of the generated thumbnails to set as the post's featured image.", 'video-embed-thumbnail-generator')
          })
        })]
      }), (0,external_wp_hooks_.applyFilters)('videopack.settings.thumbnail.extra_controls', null, {
        settings,
        changeHandlerFactory,
        effectiveFfmpegExists
      })]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
      title: (0,external_wp_i18n_.__)('Defaults', 'video-embed-thumbnail-generator'),
      initialOpen: true,
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(SelectFromLibrary/* default */.A, {
        label: (0,external_wp_i18n_.__)('Default thumbnail', 'video-embed-thumbnail-generator'),
        type: "url",
        value: poster,
        onChange: changeHandlerFactory.poster
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
        __nextHasNoMarginBottom: true,
        label: (0,external_wp_i18n_.__)('Display thumbnail image again when video ends', 'video-embed-thumbnail-generator'),
        onChange: changeHandlerFactory.endofvideooverlaysame,
        checked: !!endofvideooverlaysame
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(SelectFromLibrary/* default */.A, {
        label: (0,external_wp_i18n_.__)('End of video image', 'video-embed-thumbnail-generator'),
        type: "url",
        value: endofvideooverlay,
        onChange: changeHandlerFactory.endofvideooverlay,
        disabled: endofvideooverlaysame,
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_VideopackTooltip, {
          text: (0,external_wp_i18n_.__)('Display alternate image when video ends.', 'video-embed-thumbnail-generator')
        })
      })]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(WatermarkSettingsPanel/* default */.A, {
      title: (0,external_wp_i18n_.__)('Add watermark to generated thumbnails', 'video-embed-thumbnail-generator'),
      watermarkSettings: ffmpeg_thumb_watermark,
      onChange: changeHandlerFactory.ffmpeg_thumb_watermark,
      initialOpen: true
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
      title: (0,external_wp_i18n_.__)('Media Library', 'video-embed-thumbnail-generator'),
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
        __nextHasNoMarginBottom: true,
        label: (0,external_wp_i18n_.__)('Hide generated thumnbails from the Media Library'),
        onChange: changeHandlerFactory.hide_thumbnails,
        checked: !!hide_thumbnails
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-setting-extra-margin",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,external_wp_i18n_.__)('Set generated thumbnails as featured images.', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.featured,
          checked: !!featured
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "videopack-control-with-tooltip",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
            __next40pxDefaultSize: true,
            variant: "secondary",
            onClick: handleSetAllFeatured,
            disabled: featuredBatch.isProcessing,
            children: featuredBatch.isProcessing ? (0,external_wp_i18n_.sprintf)(/* translators: 1: current count, 2: total count */
            (0,external_wp_i18n_.__)('Processing %1$d / %2$d', 'video-embed-thumbnail-generator'), featuredBatch.progress.current, featuredBatch.progress.total) : (0,external_wp_i18n_.__)('Set all as featured', 'video-embed-thumbnail-generator')
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_VideopackTooltip, {
            text: (0,external_wp_i18n_.__)("If you've generated thumbnails before enabling this option, this will set all existing thumbnails as featured images.", 'video-embed-thumbnail-generator')
          })]
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-setting-extra-margin",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.RadioControl, {
          label: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("span", {
            className: "videopack-label-with-tooltip",
            children: [(0,external_wp_i18n_.__)('Attach thumbnails to', 'video-embed-thumbnail-generator'), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_VideopackTooltip, {
              text: (0,external_wp_i18n_.__)('This depends on your theme. Thumbnails generated by Videopack can be saved as children of the video attachment or the post. Some themes use an image attached to a post instead of the built-in featured image meta tag. Version 3.x of this plugin saved all thumbnails as children of the video.', 'video-embed-thumbnail-generator')
            })]
          }),
          selected: thumb_parent,
          options: thumbParentOptions,
          onChange: changeHandlerFactory.thumb_parent,
          className: "videopack-setting-radio-group"
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "videopack-control-with-tooltip",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
            __next40pxDefaultSize: true,
            variant: "secondary",
            onClick: handleSetAllParents,
            disabled: parentsBatch.isProcessing,
            children: parentsBatch.isProcessing ? (0,external_wp_i18n_.sprintf)(/* translators: 1: current count, 2: total count */
            (0,external_wp_i18n_.__)('Processing %1$d / %2$d', 'video-embed-thumbnail-generator'), parentsBatch.progress.current, parentsBatch.progress.total) : (0,external_wp_i18n_.__)('Set all parents', 'video-embed-thumbnail-generator')
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_VideopackTooltip, {
            text: (0,external_wp_i18n_.__)("If you've generated thumbnails before changing this option, this will set all existing thumbnails as children of your currently selected option.", 'video-embed-thumbnail-generator')
          })]
        })]
      })]
    }), featuredBatch.confirmDialog.isOpen && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.__experimentalConfirmDialog, {
      isOpen: true,
      onConfirm: () => {
        if (featuredBatch.confirmDialog.onConfirm) {
          featuredBatch.confirmDialog.onConfirm();
        }
        featuredBatch.closeConfirmDialog();
      },
      onCancel: featuredBatch.closeConfirmDialog,
      confirmButtonText: featuredBatch.confirmDialog.isAlert ? (0,external_wp_i18n_.__)('OK', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_.__)('OK', 'video-embed-thumbnail-generator'),
      children: featuredBatch.confirmDialog.message
    }), parentsBatch.confirmDialog.isOpen && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.__experimentalConfirmDialog, {
      isOpen: true,
      onConfirm: () => {
        if (parentsBatch.confirmDialog.onConfirm) {
          parentsBatch.confirmDialog.onConfirm();
        }
        parentsBatch.closeConfirmDialog();
      },
      onCancel: parentsBatch.closeConfirmDialog,
      confirmButtonText: parentsBatch.confirmDialog.isAlert ? (0,external_wp_i18n_.__)('OK', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_.__)('OK', 'video-embed-thumbnail-generator'),
      children: parentsBatch.confirmDialog.message
    })]
  });
};
/* harmony default export */ const components_ThumbnailSettings = (ThumbnailSettings);
// EXTERNAL MODULE: ./src/api/jobs.js
var jobs = __webpack_require__(104);
// EXTERNAL MODULE: ./src/api/thumbnails.js
var thumbnails = __webpack_require__(2186);
;// ./src/utils/utils.js
/**
 * Backward compatibility layer for Videopack utilities.
 * All API functions have been moved to the src/api directory.
 * Generic helpers have been moved to src/utils/helpers.js.
 */







// EXTERNAL MODULE: ./src/features/settings/components/TextControlOnBlur.js
var TextControlOnBlur = __webpack_require__(771);
;// ./src/features/settings/components/PerCodecQualitySettings.js
/* global videopack_config */








const PerCodecQualitySettings = ({
  codec,
  settings,
  changeHandlerFactory
}) => {
  const [bitrates, setBitrates] = (0,external_wp_element_.useState)([]);
  const {
    resolutions
  } = videopack_config;
  const {
    ffmpeg_exists,
    h264_profile,
    h264_level,
    h265_profile,
    h265_level,
    active_encoder = 'ffmpeg'
  } = settings;
  const activeEncoderReady = (0,external_wp_hooks_.applyFilters)('videopack.encoder.is_ready', !!videopack_config.isTranscodingServiceReady, active_encoder, settings);
  const effectiveFfmpegExists = active_encoder !== 'ffmpeg' && activeEncoderReady || ffmpeg_exists === true || ffmpeg_exists === 'true' || ffmpeg_exists === 1 || ffmpeg_exists === '1';
  const encodeKey = (0,external_wp_hooks_.applyFilters)(
  /**
   * Filters the settings array key used for storing encoder settings.
   *
   * @since 5.0.0
   *
   * @param {string} encodeKey The settings key (e.g. 'encode').
   * @param {string} encoder   The identifier of the active encoder.
   */
  'videopack.settings.encodeKey', 'encode', active_encoder);
  const currentEncode = settings[encodeKey] || {};
  const codecEncodeSettings = currentEncode[codec.id] || {};
  const {
    rate_control: currentRateControl = codec.supported_rate_controls[0],
    crf: currentCrf = codec.rate_control.crf.default,
    vbr: currentVbr = codec.rate_control.vbr.default
  } = codecEncodeSettings;
  const [localCrf, setLocalCrf] = (0,external_wp_element_.useState)(currentCrf);
  const [localVbr, setLocalVbr] = (0,external_wp_element_.useState)(currentVbr);
  const h264ProfileOptions = (0,external_wp_element_.useMemo)(() => [{
    value: 'none',
    label: (0,external_wp_i18n_.__)('None', 'video-embed-thumbnail-generator')
  }, {
    value: 'baseline',
    label: 'baseline'
  }, {
    value: 'main',
    label: 'main'
  }, {
    value: 'high',
    label: 'high'
  }, {
    value: 'high10',
    label: 'high10'
  }, {
    value: 'high422',
    label: 'high422'
  }, {
    value: 'high444',
    label: 'high444'
  }], []);
  const h265ProfileOptions = (0,external_wp_element_.useMemo)(() => [{
    value: 'none',
    label: (0,external_wp_i18n_.__)('None', 'video-embed-thumbnail-generator')
  }, {
    value: 'main',
    label: 'main'
  }, {
    value: 'main10',
    label: 'main10'
  }], []);
  const h265LevelOptions = (0,external_wp_element_.useMemo)(() => [{
    value: 'none',
    label: (0,external_wp_i18n_.__)('None', 'video-embed-thumbnail-generator')
  }, {
    value: '1',
    label: '1'
  }, {
    value: '2',
    label: '2'
  }, {
    value: '2.1',
    label: '2.1'
  }, {
    value: '3',
    label: '3'
  }, {
    value: '3.1',
    label: '3.1'
  }, {
    value: '4',
    label: '4'
  }, {
    value: '4.1',
    label: '4.1'
  }, {
    value: '5',
    label: '5'
  }, {
    value: '5.1',
    label: '5.1'
  }, {
    value: '5.2',
    label: '5.2'
  }, {
    value: '6',
    label: '6'
  }, {
    value: '6.1',
    label: '6.1'
  }, {
    value: '6.2',
    label: '6.2'
  }], []);
  const h264LevelOptions = (0,external_wp_element_.useMemo)(() => [{
    value: 'none',
    label: (0,external_wp_i18n_.__)('None', 'video-embed-thumbnail-generator')
  }, {
    value: '1',
    label: '1'
  }, {
    value: '1.1',
    label: '1.1'
  }, {
    value: '1.2',
    label: '1.2'
  }, {
    value: '1.3',
    label: '1.3'
  }, {
    value: '2',
    label: '2'
  }, {
    value: '2.1',
    label: '2.1'
  }, {
    value: '2.2',
    label: '2.2'
  }, {
    value: '3',
    label: '3'
  }, {
    value: '3.1',
    label: '3.1'
  }, {
    value: '3.2',
    label: '3.2'
  }, {
    value: '4',
    label: '4'
  }, {
    value: '4.1',
    label: '4.1'
  }, {
    value: '4.2',
    label: '4.2'
  }, {
    value: '5',
    label: '5'
  }, {
    value: '5.1',
    label: '5.1'
  }, {
    value: '5.2',
    label: '5.2'
  }, {
    value: '6',
    label: '6'
  }, {
    value: '6.1',
    label: '6.1'
  }, {
    value: '6.2',
    label: '6.2'
  }], []);
  const generateMarks = (0,external_wp_element_.useCallback)(type => {
    const rateControl = codec.rate_control[type];
    if (!rateControl) {
      return [];
    }
    if (type === 'vbr') {
      const marks = [{
        value: 0.1,
        label: (0,external_wp_i18n_.__)('0.1: lower quality', 'video-embed-thumbnail-generator')
      }, {
        value: 50,
        label: (0,external_wp_i18n_.__)('50: higher quality', 'video-embed-thumbnail-generator')
      }];
      if (rateControl.default) {
        const existingMark = marks.find(m => m.value === rateControl.default);
        const defaultLabel = (0,external_wp_i18n_.sprintf)(/* translators: %s: VBR value. */
        (0,external_wp_i18n_.__)('%s: default', 'video-embed-thumbnail-generator'), rateControl.default);
        if (existingMark) {
          existingMark.label = defaultLabel;
        } else {
          marks.push({
            value: rateControl.default,
            label: defaultLabel
          });
        }
      }
      for (let i = 5; i < 50; i += 5) {
        if (marks.find(m => m.value === i)) {
          continue;
        }
        if (rateControl.default) {
          if (Math.abs(i - rateControl.default) <= 2) {
            continue;
          }
        }
        marks.push({
          value: i,
          label: String(i)
        });
      }
      marks.sort((a, b) => a.value - b.value);
      return marks;
    }
    const {
      min,
      max,
      labels: originalLabels = {},
      default: defaultValue
    } = rateControl;
    const labels = {
      ...originalLabels
    }; // create a mutable copy

    // Add the 'Default' label if there isn't already a label for the default value
    if (defaultValue !== undefined && !labels[defaultValue]) {
      labels[defaultValue] = (0,external_wp_i18n_.sprintf)(/* translators: %d: CRF value. */
      (0,external_wp_i18n_.__)('%d: default', 'video-embed-thumbnail-generator'), defaultValue);
    }
    labels[min] = (0,external_wp_i18n_.sprintf)(/* translators: %d: CRF value. */
    (0,external_wp_i18n_.__)('%d: higher quality', 'video-embed-thumbnail-generator'), min);
    labels[max] = (0,external_wp_i18n_.sprintf)(/* translators: %d: CRF value. */
    (0,external_wp_i18n_.__)('%d: lower quality', 'video-embed-thumbnail-generator'), max);
    const marks = [];
    for (let i = min; i <= max; i++) {
      if (labels && labels[i]) {
        marks.push({
          value: i,
          label: labels[i]
        });
      } else if (i % 5 === 0) {
        const labelExistsNearby = Object.keys(labels).some(label => {
          const distance = Math.abs(i - label);
          return distance > 0 && distance < 5;
        });
        if (!labelExistsNearby) {
          marks.push({
            value: i,
            label: String(i)
          });
        }
      }
    }
    return marks;
  }, [codec]);
  const marks = (0,external_wp_hooks_.applyFilters)(
  /**
   * Filters the list of slider mark indicators for the quality/CRF slider.
   *
   * @since 5.0.0
   *
   * @param {Array|null} marks   Custom marks array or null to use defaults.
   * @param {Object}     context Context details: codec, active_encoder, rateControl, generateMarks.
   */
  'videopack.settings.qualityMarks', null, {
    codec,
    active_encoder,
    rateControl: currentRateControl,
    generateMarks
  });
  const qualityScale = (0,external_wp_hooks_.applyFilters)(
  /**
   * Filters the quality scale limits (min, max, step, marks) for the codec quality slider.
   *
   * @since 5.0.0
   *
   * @param {Object} scale   Configuration containing min, max, step, marks.
   * @param {Object} context Context details: codec, active_encoder, rateControl.
   */
  'videopack.settings.qualityScale', {
    min: currentRateControl === 'crf' ? codec.rate_control.crf.min : 0.1,
    max: currentRateControl === 'crf' ? codec.rate_control.crf.max : 50,
    step: currentRateControl === 'crf' ? 1 : 0.5,
    marks: marks || generateMarks(currentRateControl)
  }, {
    codec,
    active_encoder,
    rateControl: currentRateControl
  });
  (0,external_wp_element_.useEffect)(() => setLocalCrf(currentCrf), [currentCrf]);
  (0,external_wp_element_.useEffect)(() => setLocalVbr(currentVbr), [currentVbr]);
  const settingsRef = (0,external_wp_element_.useRef)(settings);
  const changeHandlerFactoryRef = (0,external_wp_element_.useRef)(changeHandlerFactory);
  (0,external_wp_element_.useEffect)(() => {
    settingsRef.current = settings;
    changeHandlerFactoryRef.current = changeHandlerFactory;
  }, [settings, changeHandlerFactory]);
  const performUpdate = (0,external_wp_element_.useCallback)((key, value) => {
    const encodeData = settingsRef.current[encodeKey] || {};
    changeHandlerFactoryRef.current[encodeKey]({
      ...encodeData,
      [codec.id]: {
        ...encodeData[codec.id],
        [key]: value
      }
    });
  }, [codec.id, encodeKey]);
  const debouncedUpdate = (0,external_wp_compose_.useDebounce)(performUpdate, 500);
  const handleSettingChange = (key, value) => {
    if (key === 'rate_control') {
      // Immediate update for radio buttons
      const encodeData = settings[encodeKey] || {};
      changeHandlerFactory[encodeKey]({
        ...encodeData,
        [codec.id]: {
          ...encodeData[codec.id],
          [key]: value
        }
      });
      return;
    }
    if (key === 'crf') {
      setLocalCrf(value);
    } else if (key === 'vbr') {
      setLocalVbr(value);
    }
    debouncedUpdate(key, value);
  };
  (0,external_wp_element_.useEffect)(() => {
    const newBitrates = [];
    const vbrSettings = codec.rate_control.vbr;
    resolutions.forEach(res => {
      let width = res.width;
      let height = res.height;
      if (!width || !height) {
        const parsedHeight = parseInt(res.id, 10);
        if (!isNaN(parsedHeight)) {
          height = parsedHeight;
          width = Math.ceil(height * 16 / 9);
        }
      }
      if (width && height) {
        const bitrate = Math.round(localVbr * 0.0001 * width * height + vbrSettings.constant);
        newBitrates.push({
          label: `${height}`,
          value: `${bitrate}`
        });
      }
    });
    setBitrates(newBitrates);
  }, [localVbr, codec, resolutions]);
  const rateControlOptions = (0,external_wp_hooks_.applyFilters)(
  /**
   * Filters the choices list for rate control (CRF vs ABR) on a specific codec.
   *
   * @since 5.0.0
   *
   * @param {Array}  options Options containing label and value.
   * @param {Object} context Context details: codec, active_encoder.
   */
  'videopack.settings.rateControlOptions', [{
    label: (0,external_wp_i18n_.__)('Constant Rate Factor (CRF)', 'video-embed-thumbnail-generator'),
    value: 'crf'
  }, {
    label: (0,external_wp_i18n_.__)('Average Bitrate (ABR)', 'video-embed-thumbnail-generator'),
    value: 'vbr'
  }], {
    codec,
    active_encoder
  });
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
    className: "videopack-per-codec-quality-settings",
    children: [rateControlOptions.length > 1 && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.RadioControl, {
      label: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("span", {
        className: "videopack-label-with-tooltip",
        children: [(0,external_wp_i18n_.__)('Primary rate control:', 'video-embed-thumbnail-generator'), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_VideopackTooltip, {
          text: (0,external_wp_i18n_.__)('CRF prioritizes a consistent level of quality over consistent file sizes. Lower numbers are better quality. ABR prioritizes consistent file sizes. If you choose ABR, Videopack will automatically calculate bitrates for different resolutions based on the relative quality you select.', 'video-embed-thumbnail-generator')
        })]
      }),
      selected: currentRateControl,
      onChange: value => handleSettingChange('rate_control', value),
      options: rateControlOptions,
      disabled: effectiveFfmpegExists !== true
    }), currentRateControl === 'crf' && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.RangeControl, {
      __nextHasNoMarginBottom: true,
      __next40pxDefaultSize: true,
      label: (0,external_wp_i18n_.__)('CRF:', 'video-embed-thumbnail-generator'),
      value: localCrf,
      className: "videopack-crf-slider",
      onChange: value => handleSettingChange('crf', value),
      min: qualityScale.min,
      max: qualityScale.max,
      step: qualityScale.step,
      marks: qualityScale.marks,
      disabled: effectiveFfmpegExists !== true
    }), currentRateControl === 'vbr' && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.RangeControl, {
      __nextHasNoMarginBottom: true,
      __next40pxDefaultSize: true,
      label: (0,external_wp_i18n_.__)('Quality:', 'video-embed-thumbnail-generator'),
      value: localVbr,
      className: "videopack-abr-slider",
      onChange: value => handleSettingChange('vbr', value),
      min: qualityScale.min,
      max: qualityScale.max,
      step: qualityScale.step,
      marks: qualityScale.marks,
      disabled: effectiveFfmpegExists !== true,
      help: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
        className: "videopack-bitrate-grid",
        children: bitrates.map((item, index) => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("span", {
          children: [item.label, "p =", ' ', /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("strong", {
            children: item.value
          }), " kbps"]
        }, index))
      })
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "videopack-grid-row-align",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,external_wp_i18n_.__)('H.264 profile', 'video-embed-thumbnail-generator'),
          value: h264_profile,
          onChange: changeHandlerFactory.h264_profile,
          options: h264ProfileOptions,
          disabled: effectiveFfmpegExists !== true
        })
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "videopack-grid-row-align",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,external_wp_i18n_.__)('H.264 level', 'video-embed-thumbnail-generator'),
          value: h264_level,
          onChange: changeHandlerFactory.h264_level,
          options: h264LevelOptions,
          disabled: effectiveFfmpegExists !== true
        })
      })]
    }), codec.id === 'h265' && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "videopack-grid-row-align",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,external_wp_i18n_.__)('H.265 profile', 'video-embed-thumbnail-generator'),
          value: h265_profile,
          onChange: changeHandlerFactory.h265_profile,
          options: h265ProfileOptions,
          disabled: effectiveFfmpegExists !== true
        })
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "videopack-grid-row-align",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,external_wp_i18n_.__)('H.265 level', 'video-embed-thumbnail-generator'),
          value: h265_level,
          onChange: changeHandlerFactory.h265_level,
          options: h265LevelOptions,
          disabled: effectiveFfmpegExists !== true
        })
      })]
    })]
  }, codec.id);
};
/* harmony default export */ const components_PerCodecQualitySettings = (PerCodecQualitySettings);
;// ./src/features/settings/components/EncodingSettings.js
/* global videopack_config */














/**
 * EncodingSettings component.
 *
 * @param {Object} props                      Component props.
 * @param {Object} props.settings             Plugin settings.
 * @param {Object} props.changeHandlerFactory Factory for creating change handlers.
 * @param {Object} props.ffmpegTest           Results of the FFmpeg test.
 * @return {Object} The rendered component.
 */

const EncodingSettings = ({
  settings,
  changeHandlerFactory,
  ffmpegTest
}) => {
  const {
    isNetworkActive
  } = videopack_config;
  const {
    app_path,
    encode,
    enable_custom_resolution,
    custom_resolution,
    error_email,
    ffmpeg_watermark,
    audio_bitrate,
    audio_channels,
    simultaneous_encodes,
    threads,
    nice,
    ffmpeg_exists,
    ffmpeg_error,
    auto_encode,
    auto_encode_gif,
    keep_gif_source,
    auto_publish_post,
    active_encoder = 'ffmpeg'
  } = settings;
  const activeEncoderReady = (0,external_wp_hooks_.applyFilters)('videopack.encoder.is_ready', !!videopack_config.isTranscodingServiceReady, active_encoder, settings);
  const effectiveFfmpegExists = active_encoder !== 'ffmpeg' && activeEncoderReady || ffmpeg_exists === true || ffmpeg_exists === 'true' || ffmpeg_exists === 1 || ffmpeg_exists === '1';
  const availableEncoders =
  /**
   * Filters the list of available encoders in the dropdown list.
   *
   * @since 5.0.0
   *
   * @param {Array} encoders List of active encoder choices.
   */
  (0,external_wp_hooks_.applyFilters)('videopack.settings.encoders', [{
    value: 'ffmpeg',
    label: (0,external_wp_i18n_.__)('Web Server FFmpeg', 'video-embed-thumbnail-generator')
  }], settings);
  const [users, setUsers] = (0,external_wp_element_.useState)(null);
  const encodingBatch = hooks_useBatchProcess();
  const handleEncodeAllVideos = () => {
    encodingBatch.confirmAndRun((0,external_wp_i18n_.__)("Are you sure you want to add all videos to the encoding queue? This will check every video in your library and add it to the queue if it hasn't been encoded yet.", 'video-embed-thumbnail-generator'), () => (0,media/* startBatchProcess */.AO)('encoding'), () => (0,media/* getBatchProgress */.wW)('encoding'), (0,external_wp_i18n_.__)('No videos found to process.', 'video-embed-thumbnail-generator'));
  };
  const filteredCodecs = (0,external_wp_element_.useMemo)(() => {
    const {
      codecs
    } = videopack_config;
    return codecs.filter(codec => {
      const defaultSupported = true;
      const isSupported = (0,external_wp_hooks_.applyFilters)(
      /**
       * Filters whether a specific video codec and resolution is supported by the active encoder.
       *
       * @since 5.0.0
       *
       * @param {boolean} supported      True if supported, false otherwise.
       * @param {string}  codecId        Video codec ID string.
       * @param {string}  active_encoder The active encoder identifier.
       * @param {Object}  settings       The global plugin settings object.
       */
      'videopack.settings.codec_supported', defaultSupported, codec.id, active_encoder, settings);
      if (!isSupported) {
        return false;
      }
      if (codec.id === 'thumbnail') {
        const rawFfmpegExists = settings.ffmpeg_exists;
        return rawFfmpegExists === true || rawFfmpegExists === 'true' || rawFfmpegExists === 1 || rawFfmpegExists === '1';
      }
      return true;
    });
  }, [active_encoder, settings]);
  (0,external_wp_element_.useEffect)(() => {
    if (!encode) {
      return;
    }
    let changed = false;
    const newEncode = {
      ...encode
    };

    // Auto-disable unsupported codecs
    Object.keys(encode).forEach(codecId => {
      if (encode[codecId]?.enabled) {
        const defaultSupported = true;
        const isSupported = (0,external_wp_hooks_.applyFilters)(/** This filter is documented in src/features/settings/components/EncodingSettings.js */
        'videopack.settings.codec_supported', defaultSupported, codecId, active_encoder, settings);
        if (!isSupported) {
          newEncode[codecId] = {
            ...newEncode[codecId],
            enabled: false
          };
          changed = true;
        }
      }
    });
    if (changed) {
      changeHandlerFactory.encode(newEncode);
    }
  }, [active_encoder, encode, changeHandlerFactory, settings]);
  (0,external_wp_element_.useEffect)(() => {
    const isDisabled = (0,external_wp_hooks_.applyFilters)(
    /**
     * Filters whether the animated GIF auto-transcode setting toggle should be disabled.
     *
     * @since 5.0.0
     *
     * @param {boolean} disabled       True if toggle should be disabled.
     * @param {boolean} ffmpegExists   True if FFmpeg is detected.
     * @param {string}  active_encoder The active encoder identifier.
     * @param {Object}  settings       The global plugin settings object.
     */
    'videopack.settings.auto_encode_gif.disabled', effectiveFfmpegExists !== true, active_encoder, settings);
    if (isDisabled && auto_encode_gif) {
      changeHandlerFactory.auto_encode_gif(false);
    }
  }, [active_encoder, auto_encode_gif, changeHandlerFactory, effectiveFfmpegExists, settings]);
  (0,external_wp_element_.useEffect)(() => {
    (0,gallery/* getUsersWithCapability */.V7)('edit_others_video_encodes').then(response => {
      setUsers(response);
    }).catch(error => {
      console.error(error);
    });
  }, []);
  const currentResolutions = hooks_useResolutions(enable_custom_resolution, custom_resolution, false);
  const EncodeFormatGrid = () => {
    const {
      codecs
    } = videopack_config;
    const {
      encode: currentEncode
    } = settings;
    const [replacementWarning, setReplacementWarning] = (0,external_wp_element_.useState)(false);
    const handleCheckboxChange = (codecId, resolutionId, isChecked) => {
      const newEncode = JSON.parse(JSON.stringify(currentEncode || {}));
      if (!newEncode[codecId]) {
        newEncode[codecId] = {
          resolutions: {}
        };
      } else if (!newEncode[codecId].resolutions) {
        newEncode[codecId].resolutions = {};
      }
      newEncode[codecId].resolutions[resolutionId] = !!isChecked;
      const formatId = `${codecId}_${resolutionId}`;
      if (!isChecked && settings.replace_format === formatId) {
        setReplacementWarning(true);
        return;
      }
      changeHandlerFactory.encode(newEncode);
    };
    const handleCodecEnableChange = (codecId, isEnabled) => {
      if (!isEnabled && settings.replace_format && settings.replace_format.startsWith(`${codecId}_`)) {
        setReplacementWarning(true);
        return;
      }
      const newEncode = JSON.parse(JSON.stringify(currentEncode || {}));
      const codecInfo = codecs.find(c => c.id === codecId);
      if (!newEncode[codecId]) {
        newEncode[codecId] = {
          resolutions: {}
        };
      }
      newEncode[codecId].enabled = !!isEnabled;
      if (isEnabled && codecInfo) {
        // Set default quality settings when enabling a codec for the first time
        if (!newEncode[codecId].rate_control) {
          newEncode[codecId].rate_control = codecInfo.supported_rate_controls[0];
          newEncode[codecId].crf = codecInfo.rate_control.crf.default;
          newEncode[codecId].vbr = codecInfo.rate_control.vbr.default;
        }
      }
      if (!isEnabled) {
        if (!newEncode[codecId].resolutions) {
          newEncode[codecId].resolutions = {};
        }
        currentResolutions.forEach(resolution => {
          newEncode[codecId].resolutions[resolution.id] = false;
        });
      }
      changeHandlerFactory.encode(newEncode);
    };
    const filteredResolutions = currentResolutions;
    return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
      children: [replacementWarning && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Notice, {
        status: "warning",
        isDismissible: true,
        onDismiss: () => setReplacementWarning(false),
        className: "videopack-notice-margin",
        children: (0,external_wp_i18n_.__)('The replacement format cannot be disabled.', 'video-embed-thumbnail-generator')
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "videopack-encode-grid",
        children: filteredCodecs.map(codec => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "videopack-encode-column",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "videopack-encode-grid-header-cell",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
              __nextHasNoMarginBottom: true,
              label: codec.name,
              checked: !!currentEncode?.[codec.id]?.enabled,
              onChange: isEnabled => handleCodecEnableChange(codec.id, isEnabled),
              disabled: !effectiveFfmpegExists
            })
          }), filteredResolutions.filter(resolution => !resolution.allowed_codecs || resolution.allowed_codecs.length === 0 || resolution.allowed_codecs.includes(codec.id)).filter(resolution => codec.id !== 'cmaf' || resolution.is_standard !== false).map(resolution => {
            const formatId = `${codec.id}_${resolution.id}`;
            const isReplacement = settings.replace_format === formatId;
            return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "videopack-encode-grid-row",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.CheckboxControl, {
                __nextHasNoMarginBottom: true,
                label: resolution.name,
                checked: isReplacement || !!currentEncode?.[codec.id]?.resolutions?.[resolution.id],
                onChange: isChecked => handleCheckboxChange(codec.id, resolution.id, isChecked),
                disabled: !effectiveFfmpegExists || !currentEncode?.[codec.id]?.enabled
              })
            }, formatId);
          })]
        }, codec.id))
      })]
    });
  };
  const errorEmailOptions = () => {
    const authorizedUsers = [{
      value: 'nobody',
      label: (0,external_wp_i18n_.__)('Nobody', 'video-embed-thumbnail-generator')
    }, {
      value: 'encoder',
      label: (0,external_wp_i18n_.__)('User who initiated encoding', 'video-embed-thumbnail-generator')
    }];
    if (users) {
      users.forEach(user => {
        authorizedUsers.push({
          value: user.id,
          label: user.name
        });
      });
    }
    return authorizedUsers;
  };
  const VideoReplacementSettings = () => {
    const {
      replace_format
    } = settings;
    const {
      codecs
    } = videopack_config;

    // Extract current codec and resolution
    let currentCodecId = 'none';
    let currentResolutionId = 'fullres';
    if (replace_format && replace_format !== 'none') {
      const parts = replace_format.split('_');
      if (parts.length >= 2) {
        currentCodecId = parts[0];
        currentResolutionId = parts.slice(1).join('_');
      }
    }
    const codecOptions = [{
      value: 'none',
      label: (0,external_wp_i18n_.__)('None', 'video-embed-thumbnail-generator')
    }, {
      value: 'same',
      label: (0,external_wp_i18n_.__)('Same format as original', 'video-embed-thumbnail-generator')
    }, ...codecs.filter(c => c.is_video !== false && c.id !== 'cmaf' && (0,external_wp_hooks_.applyFilters)(/** This filter is documented in src/features/settings/components/EncodingSettings.js */
    'videopack.settings.codec_supported', true, c.id, active_encoder, settings)).map(codec => ({
      value: codec.id,
      label: codec.name
    }))];
    const resolutionOptions = currentResolutions.filter(res => res.is_standard !== false && (currentCodecId === 'none' || currentCodecId === 'same' || !res.allowed_codecs || res.allowed_codecs.length === 0 || res.allowed_codecs.includes(currentCodecId))).map(res => ({
      value: res.id,
      label: res.name
    }));
    const handleCodecChange = newCodecId => {
      if (newCodecId === 'none') {
        changeHandlerFactory.replace_format('none');
      } else {
        changeHandlerFactory.replace_format(`${newCodecId}_${currentResolutionId}`);
      }
    };
    const handleResolutionChange = newResolutionId => {
      if (currentCodecId !== 'none') {
        changeHandlerFactory.replace_format(`${currentCodecId}_${newResolutionId}`);
      }
    };
    return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      className: "videopack-grid-row-align videopack-replacement-controls",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
        __nextHasNoMarginBottom: true,
        __next40pxDefaultSize: true,
        label: (0,external_wp_i18n_.__)('Replace original video with', 'video-embed-thumbnail-generator'),
        value: currentCodecId,
        options: codecOptions,
        onChange: handleCodecChange
      }), currentCodecId !== 'none' && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
        __nextHasNoMarginBottom: true,
        __next40pxDefaultSize: true,
        label: (0,external_wp_i18n_.__)('Resolution', 'video-embed-thumbnail-generator'),
        value: currentResolutionId,
        options: resolutionOptions,
        onChange: handleResolutionChange
      })]
    });
  };
  const SampleFormatSelects = () => {
    const {
      sample_codec,
      sample_resolution
    } = settings;
    const codecs = videopack_config.codecs.filter(c => !c.is_preview).map(codec => ({
      value: codec.id,
      label: codec.name
    }));
    const resolutions = currentResolutions.filter(res => !res.allowed_codecs || res.allowed_codecs.length === 0 || res.allowed_codecs.includes(sample_codec)).map(resolution => ({
      value: resolution.id,
      label: resolution.name
    }));
    return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      className: "videopack-flex-row-responsive",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "videopack-flex-col-responsive",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,external_wp_i18n_.__)('Codec', 'video-embed-thumbnail-generator'),
          value: sample_codec,
          options: codecs,
          onChange: changeHandlerFactory.sample_codec,
          disabled: !effectiveFfmpegExists
        })
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "videopack-flex-col-responsive",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,external_wp_i18n_.__)('Resolution', 'video-embed-thumbnail-generator'),
          value: sample_resolution,
          options: resolutions,
          onChange: changeHandlerFactory.sample_resolution,
          disabled: effectiveFfmpegExists !== true
        })
      })]
    });
  };
  const generateNonCrfMarks = type => {
    const marks = [];
    switch (type) {
      case 'simultaneous':
        for (let i = 1; i <= 10; i++) {
          marks.push({
            value: i,
            label: String(i)
          });
        }
        break;
      case 'threads':
        marks.push({
          value: 0,
          label: (0,external_wp_i18n_.__)('Auto', 'video-embed-thumbnail-generator')
        });
        for (let i = 2; i <= 16; i += 2) {
          marks.push({
            value: i,
            label: String(i)
          });
        }
        break;
    }
    return marks;
  };
  const audioBitrateOptions = [{
    value: '32',
    label: '32'
  }, {
    value: '64',
    label: '64'
  }, {
    value: '96',
    label: '96'
  }, {
    value: '128',
    label: '128'
  }, {
    value: '160',
    label: '160'
  }, {
    value: '192',
    label: '192'
  }, {
    value: '224',
    label: '224'
  }, {
    value: '256',
    label: '256'
  }, {
    value: '320',
    label: '320'
  }];
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
      children: [availableEncoders.length > 1 && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelRow, {
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,external_wp_i18n_.__)('Encoding service', 'video-embed-thumbnail-generator'),
          value: active_encoder,
          options: availableEncoders,
          onChange: changeHandlerFactory.active_encoder
        })
      }), (0,external_wp_hooks_.applyFilters)('videopack.settings.encoder_panel', null, {
        settings,
        changeHandlerFactory,
        active_encoder
      }), active_encoder === 'ffmpeg' && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_ReactJSXRuntime_.Fragment, {
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelRow, {
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(TextControlOnBlur/* default */.A, {
            __nextHasNoMarginBottom: true,
            __next40pxDefaultSize: true,
            label: (0,external_wp_i18n_.__)('Path to FFmpeg folder on server', 'video-embed-thumbnail-generator'),
            value: app_path,
            onChange: changeHandlerFactory.app_path,
            help: isNetworkActive ? (0,external_wp_i18n_.__)('This setting is controlled at the network level.', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_.__)('Leave blank if FFmpeg is in your system path.'),
            disabled: isNetworkActive,
            title: isNetworkActive ? (0,external_wp_i18n_.__)('This setting is controlled by the network administrator.', 'video-embed-thumbnail-generator') : null
          })
        })
      }), (() => {
        const isCloud = ['mediaconvert', 'aws_mediaconvert', 'google_transcoder'].includes(active_encoder);
        const isCloudWithFfmpegFallback = isCloud && settings?.cloud_fallback_encoder === 'ffmpeg';
        if (isCloudWithFfmpegFallback) {
          return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelRow, {
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(TextControlOnBlur/* default */.A, {
              __nextHasNoMarginBottom: true,
              __next40pxDefaultSize: true,
              label: (0,external_wp_i18n_.__)('Path to FFmpeg folder on server (Fallback)', 'video-embed-thumbnail-generator'),
              value: app_path,
              onChange: changeHandlerFactory.app_path,
              help: isNetworkActive ? (0,external_wp_i18n_.__)('This setting is controlled at the network level.', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_.__)('Leave blank if FFmpeg is in your system path.'),
              disabled: isNetworkActive,
              title: isNetworkActive ? (0,external_wp_i18n_.__)('This setting is controlled by the network administrator.', 'video-embed-thumbnail-generator') : null
            })
          });
        }
        return null;
      })()]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
      title: (0,external_wp_i18n_.__)('Video encode formats', 'video-embed-thumbnail-generator'),
      initialOpen: !!effectiveFfmpegExists,
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("span", {
          className: "videopack-label-with-tooltip",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("strong", {
            children: (0,external_wp_i18n_.__)('About formats', 'video-embed-thumbnail-generator')
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_VideopackTooltip, {
            text: (0,external_wp_i18n_.__)('If you have FFmpeg and the proper libraries installed, you can choose to replace your uploaded video with your preferred format, and also encode into several additional formats depending on the resolution of your original source. Videopack will not upconvert your video, so if you upload a 720p video, it will not waste your time creating a 1080p version. Different browsers have different playback capabilities. All browsers on all devices can play H.264. VP8 is an open-source codec supported by most devices, but not as effecient as the newer codecs H.265, VP9, and AV1, which are not as universally supported. AV1 can also be extremely CPU intensive to encode. If you must use AV1, make sure you have the libsvtav1 FFmpeg library installed. The reference libaom-av1 encoder is more commonly available in FFmpeg builds, but is much slower.', 'video-embed-thumbnail-generator')
          })]
        })
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(EncodeFormatGrid, {}), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(VideoReplacementSettings, {}), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
        __nextHasNoMarginBottom: true,
        label: (0,external_wp_i18n_.__)('Enable Custom Resolution', 'video-embed-thumbnail-generator'),
        onChange: changeHandlerFactory.enable_custom_resolution,
        checked: !!enable_custom_resolution
      }), enable_custom_resolution && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "videopack-setting-auto-width",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,external_wp_i18n_.__)('Custom Resolution Height', 'video-embed-thumbnail-generator'),
          type: "number",
          value: custom_resolution || '',
          onChange: value => changeHandlerFactory.custom_resolution(value === '' ? 0 : parseInt(value, 10))
        })
      })]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
      title: (0,external_wp_i18n_.__)('Do automatically on upload', 'video-embed-thumbnail-generator'),
      initialOpen: !!effectiveFfmpegExists,
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.BaseControl, {
        __nextHasNoMarginBottom: true,
        id: "autoEncode",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,external_wp_i18n_.__)('Encode default formats', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.auto_encode,
          checked: auto_encode,
          disabled: effectiveFfmpegExists !== true
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,external_wp_i18n_.__)('Convert animated GIFs to H.264', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.auto_encode_gif,
          checked: auto_encode_gif,
          disabled: (0,external_wp_hooks_.applyFilters)(/** This filter is documented in src/features/settings/components/EncodingSettings.js */
          'videopack.settings.auto_encode_gif.disabled', effectiveFfmpegExists !== true, active_encoder, settings),
          help: (0,external_wp_hooks_.applyFilters)(
          /**
           * Filters custom descriptive help text for the Auto Encode GIFs option.
           *
           * @since 5.0.0
           *
           * @param {string|null} helpText       Custom help text or null for default.
           * @param {string}      active_encoder Active encoder.
           * @param {Object}      settings       The global settings object.
           */
          'videopack.settings.auto_encode_gif.help', null, active_encoder, settings)
        }), auto_encode_gif && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,external_wp_i18n_.__)('Keep original GIF file as source', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.keep_gif_source,
          checked: keep_gif_source,
          disabled: (0,external_wp_hooks_.applyFilters)(
          /**
           * Filters whether the "Keep Original GIF" option toggle is disabled.
           *
           * @since 5.0.0
           *
           * @param {boolean} disabled       True to disable the toggle.
           * @param {boolean} ffmpegExists   True if FFmpeg is active.
           * @param {string}  active_encoder Active encoder.
           * @param {Object}  settings       The global settings object.
           */
          'videopack.settings.keep_gif_source.disabled', effectiveFfmpegExists !== true, active_encoder, settings),
          help: (0,external_wp_hooks_.applyFilters)(
          /**
           * Filters custom descriptive help text for the Keep Original GIF option.
           *
           * @since 5.0.0
           *
           * @param {string|null} helpText       Custom help text or null for default.
           * @param {string}      active_encoder Active encoder.
           * @param {Object}      settings       The global settings object.
           */
          'videopack.settings.keep_gif_source.help', null, active_encoder, settings)
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-control-with-tooltip",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,external_wp_i18n_.__)("Automatically publish video's parent post when encoding finishes"),
          onChange: changeHandlerFactory.auto_publish_post,
          checked: auto_publish_post,
          disabled: effectiveFfmpegExists !== true
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_VideopackTooltip, {
          text: (0,external_wp_i18n_.__)('If all videos in the encode queue attached to a draft post are completed, the draft post will be automatically published.', 'video-embed-thumbnail-generator')
        })]
      })]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelBody, {
      title: (0,external_wp_i18n_.__)('For previously uploaded videos', 'video-embed-thumbnail-generator'),
      initialOpen: !!effectiveFfmpegExists,
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-control-with-tooltip",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
          __next40pxDefaultSize: true,
          variant: "secondary",
          disabled: !effectiveFfmpegExists || encodingBatch.isProcessing,
          onClick: handleEncodeAllVideos,
          children: encodingBatch.isProcessing ? (0,external_wp_i18n_.sprintf)(/* translators: 1: current count, 2: total count */
          (0,external_wp_i18n_.__)('Processing %1$d / %2$d', 'video-embed-thumbnail-generator'), encodingBatch.progress.current, encodingBatch.progress.total) : (0,external_wp_i18n_.__)('Encode default formats', 'video-embed-thumbnail-generator')
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_VideopackTooltip, {
          text: (0,external_wp_i18n_.__)("Add every video in the Media Library to the encode queue if it hasn't already been encoded. Uses the default encode formats chosen above.", 'video-embed-thumbnail-generator')
        })]
      })
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(WatermarkSettingsPanel/* default */.A, {
      title: (0,external_wp_i18n_.__)('Watermark Overlay', 'video-embed-thumbnail-generator'),
      watermarkSettings: ffmpeg_watermark,
      onChange: changeHandlerFactory.ffmpeg_watermark,
      initialOpen: !!effectiveFfmpegExists,
      disabled: !effectiveFfmpegExists
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelBody, {
      title: (0,external_wp_i18n_.__)('Email encoding errors to', 'video-embed-thumbnail-generator'),
      initialOpen: !!effectiveFfmpegExists,
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "videopack-setting-auto-width",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          value: error_email,
          onChange: changeHandlerFactory.error_email,
          options: errorEmailOptions(),
          disabled: !effectiveFfmpegExists
        })
      })
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
      title: (0,external_wp_i18n_.__)('Video quality', 'video-embed-thumbnail-generator'),
      initialOpen: !!effectiveFfmpegExists,
      children: [(0,external_wp_hooks_.applyFilters)(
      /**
       * Action filter hook to render custom settings components before codec quality panels.
       *
       * @since 5.0.0
       *
       * @param {null}   empty   Null context value.
       * @param {Object} context Object containing settings, changeHandlerFactory, etc.
       */
      'videopack.settings.encoding.before_quality', null, {
        settings,
        changeHandlerFactory,
        ffmpegTest
      }), filteredCodecs.map(codec => {
        if (!encode?.[codec.id]?.enabled) {
          return null;
        }
        const content = (0,external_wp_hooks_.applyFilters)(
        /**
         * Filters the rendered settings panel for a codec block.
         *
         * Enables extensions to insert custom fields or override the quality settings layout entirely.
         *
         * @since 5.0.0
         *
         * @param {Element} panel   React element representing codec settings.
         * @param {Object}  context Object containing codec details, settings, and changeHandlerFactory.
         */
        'videopack.settings.encoding.codec_settings', /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_PerCodecQualitySettings, {
          codec: codec,
          settings: settings,
          changeHandlerFactory: changeHandlerFactory
        }, codec.id), {
          codec,
          settings,
          changeHandlerFactory
        });
        if (!content) {
          return null;
        }
        return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelBody, {
          title: codec.label || codec.name,
          initialOpen: false,
          children: content
        }, codec.id);
      })]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelBody, {
      title: (0,external_wp_i18n_.__)('Audio', 'video-embed-thumbnail-generator'),
      initialOpen: !!effectiveFfmpegExists,
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-grid-row-align",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,external_wp_i18n_.__)('Audio bitrate', 'video-embed-thumbnail-generator'),
          value: audio_bitrate,
          onChange: changeHandlerFactory.audio_bitrate,
          options: audioBitrateOptions,
          suffix: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.__experimentalInputControlSuffixWrapper, {
            children: "kbps"
          }),
          disabled: !effectiveFfmpegExists
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,external_wp_i18n_.__)('Always output stereo audio', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.audio_channels,
          checked: audio_channels,
          disabled: !effectiveFfmpegExists
        })]
      })
    }), active_encoder === 'ffmpeg' && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
      title: (0,external_wp_i18n_.__)('Execution', 'video-embed-thumbnail-generator'),
      initialOpen: !!effectiveFfmpegExists && !isNetworkActive,
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.RangeControl, {
        __nextHasNoMarginBottom: true,
        __next40pxDefaultSize: true,
        label: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("span", {
          className: "videopack-label-with-tooltip",
          children: [(0,external_wp_i18n_.__)('Simultaneous encodes', 'video-embed-thumbnail-generator'), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_VideopackTooltip, {
            text: (0,external_wp_i18n_.__)('Increasing the number will allow FFmpeg to encode more than one file at a time, but may lead to FFmpeg monopolizing system resources.', 'video-embed-thumbnail-generator')
          })]
        }),
        value: simultaneous_encodes,
        className: "videopack-settings-slider",
        onChange: changeHandlerFactory.simultaneous_encodes,
        min: 1,
        max: 10,
        step: 1,
        marks: generateNonCrfMarks('simultaneous'),
        disabled: isNetworkActive || effectiveFfmpegExists !== true,
        title: isNetworkActive ? (0,external_wp_i18n_.__)('This setting is controlled by the network administrator.', 'video-embed-thumbnail-generator') : null,
        help: isNetworkActive ? (0,external_wp_i18n_.__)('This setting is controlled at the network level.', 'video-embed-thumbnail-generator') : null
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.RangeControl, {
        __nextHasNoMarginBottom: true,
        __next40pxDefaultSize: true,
        label: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("span", {
          className: "videopack-label-with-tooltip",
          children: [(0,external_wp_i18n_.__)('Threads', 'video-embed-thumbnail-generator'), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_VideopackTooltip, {
            text: (0,external_wp_i18n_.__)('Default is 1, which limits encoding speed but prevents encoding from using too many system resources. Selecting 0 will allow FFmpeg to optimize the number of threads or you can set the number manually. This may lead to FFmpeg monopolizing system resources.', 'video-embed-thumbnail-generator')
          })]
        }),
        value: threads,
        className: "videopack-settings-slider",
        onChange: changeHandlerFactory.threads,
        min: 0,
        max: 16,
        step: 1,
        marks: generateNonCrfMarks('threads'),
        disabled: isNetworkActive || !effectiveFfmpegExists,
        title: isNetworkActive ? (0,external_wp_i18n_.__)('This setting is controlled by the network administrator.', 'video-embed-thumbnail-generator') : null,
        help: isNetworkActive ? (0,external_wp_i18n_.__)('This setting is controlled at the network level.', 'video-embed-thumbnail-generator') : null
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
        __nextHasNoMarginBottom: true,
        label: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("span", {
          className: "videopack-label-with-tooltip",
          children: [(0,external_wp_i18n_.__)('Run nice', 'video-embed-thumbnail-generator'), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_VideopackTooltip, {
            text: (0,external_wp_i18n_.__)('Tells FFmpeg to run at a lower priority on Linux/Unix systems to avoid monopolizing system resources.', 'video-embed-thumbnail-generator')
          })]
        }),
        className: "videopack-flex-align-center",
        onChange: changeHandlerFactory.nice,
        checked: nice,
        disabled: isNetworkActive || !effectiveFfmpegExists,
        title: isNetworkActive ? (0,external_wp_i18n_.__)('This setting is controlled by the network administrator.', 'video-embed-thumbnail-generator') : null,
        help: isNetworkActive ? (0,external_wp_i18n_.__)('This setting is controlled at the network level.', 'video-embed-thumbnail-generator') : null
      })]
    }), active_encoder === 'ffmpeg' && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
      title: (0,external_wp_i18n_.__)('Video Encoding Test', 'video-embed-thumbnail-generator'),
      initialOpen: !!effectiveFfmpegExists,
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.BaseControl, {
        __nextHasNoMarginBottom: true,
        label: (0,external_wp_i18n_.__)('Test encode command', 'video-embed-thumbnail-generator'),
        id: "sample-format-selects",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(SampleFormatSelects, {})
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.TextareaControl, {
        __nextHasNoMarginBottom: true,
        disabled: true,
        value: ffmpegTest?.command
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.TextareaControl, {
        __nextHasNoMarginBottom: true,
        label: (0,external_wp_i18n_.__)('FFmpeg test output', 'video-embed-thumbnail-generator'),
        rows: 20,
        disabled: true,
        value: ffmpegTest?.output
      })]
    }), encodingBatch.confirmDialog.isOpen && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.__experimentalConfirmDialog, {
      isOpen: true,
      onConfirm: () => {
        if (encodingBatch.confirmDialog.onConfirm) {
          encodingBatch.confirmDialog.onConfirm();
        }
        encodingBatch.closeConfirmDialog();
      },
      onCancel: encodingBatch.closeConfirmDialog,
      confirmButtonText: encodingBatch.confirmDialog.isAlert ? (0,external_wp_i18n_.__)('OK', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_.__)('OK', 'video-embed-thumbnail-generator'),
      children: encodingBatch.confirmDialog.message
    }), (0,external_wp_hooks_.applyFilters)(
    /**
     * Action filter hook to render custom settings components after encoding settings panels.
     *
     * @since 5.0.0
     *
     * @param {null}   empty   Null context value.
     * @param {Object} context Object containing settings, changeHandlerFactory, etc.
     */
    'videopack.settings.encoding.after_panels', null, {
      settings,
      changeHandlerFactory,
      ffmpegTest
    })]
  });
};
/* harmony default export */ const components_EncodingSettings = (EncodingSettings);
;// ./src/features/settings/components/AdminSettings.js







/**
 * AdminSettings component.
 *
 * @param {Object} props                      Component props.
 * @param {Object} props.settings             Plugin settings.
 * @param {Object} props.changeHandlerFactory Factory for creating change handlers.
 * @return {Object} The rendered component.
 */

const AdminSettings = ({
  settings,
  changeHandlerFactory
}) => {
  const {
    capabilities,
    embeddable,
    schema,
    delete_child_thumbnails,
    delete_child_encoded,
    open_graph,
    oembed_provider,
    count_views,
    alwaysloadscripts,
    replace_video_shortcode,
    replace_video_block,
    replace_preview_video,
    rewrite_attachment_url
  } = settings;
  const [isClearingCache, setIsClearingCache] = (0,external_wp_element_.useState)(false);
  const handleClearCache = () => {
    setIsClearingCache(true);
    (0,api_settings/* clearUrlCache */.XI)().then(() => {
      setIsClearingCache(false);
    }).catch(error => {
      console.error(error);
      setIsClearingCache(false);
    });
  };
  const countViewsOptions = [{
    value: 'quarters',
    label: (0,external_wp_i18n_.__)('Quarters (0%, 25%, 50%, 75%, and 100% of duration)', 'video-embed-thumbnail-generator')
  }, {
    value: 'start_complete',
    label: (0,external_wp_i18n_.__)('Start and complete', 'video-embed-thumbnail-generator')
  }, {
    value: 'start',
    label: (0,external_wp_i18n_.__)('Start only', 'video-embed-thumbnail-generator')
  }, {
    value: 'false',
    label: (0,external_wp_i18n_.__)('None', 'video-embed-thumbnail-generator')
  }];
  const capitalizeFirstLetter = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  const RolesCheckboxes = () => {
    // Define an onChange event handler
    const handleCapabilityChange = (roleName, capability, isChecked) => {
      const updatedCapabilities = {
        ...capabilities,
        [capability]: {
          ...capabilities[capability],
          [roleName]: isChecked
        }
      };
      changeHandlerFactory.capabilities(updatedCapabilities);
    };
    const getCapabilityLabel = capabilityKey => {
      const labels = {
        make_video_thumbnails: (0,external_wp_i18n_.__)('Can make thumbnails', 'video-embed-thumbnail-generator'),
        encode_videos: (0,external_wp_i18n_.__)('Can encode videos', 'video-embed-thumbnail-generator'),
        edit_others_video_encodes: (0,external_wp_i18n_.__)("Can edit other users' encoded videos", 'video-embed-thumbnail-generator'),
        view_full_length_video: (0,external_wp_i18n_.__)('Can view full length videos', 'videopack-pro')
      };
      return labels[capabilityKey] || capitalizeFirstLetter(capabilityKey.replace(/_/g, ' '));
    };
    return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelBody, {
      title: (0,external_wp_i18n_.__)('User capabilities', 'video-embed-thumbnail-generator'),
      initialOpen: true,
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Flex, {
        direction: "row",
        gap: 20,
        className: "videopack-setting-capabilities",
        children: Object.entries(capabilities).map(([capabilityKey, roles]) => {
          if (capabilityKey === 'view_full_length_video' && !settings.restrict_playback_by_capability) {
            return null;
          }
          return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.FlexItem, {
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("p", {
              children: getCapabilityLabel(capabilityKey)
            }), Object.entries(roles).map(([roleKey, isEnabled]) => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.CheckboxControl, {
              __nextHasNoMarginBottom: true,
              label: capitalizeFirstLetter(roleKey),
              checked: isEnabled,
              onChange: isChecked => handleCapabilityChange(roleKey, capabilityKey, isChecked)
            }, `${roleKey}-${capabilityKey}`))]
          }, capabilityKey);
        })
      })
    });
  };
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
      title: (0,external_wp_i18n_.__)('Structured Data', 'video-embed-thumbnail-generator'),
      initialOpen: true,
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-control-with-tooltip",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,external_wp_i18n_.__)('Generate Facebook Open Graph video tags', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.open_graph,
          checked: !!open_graph,
          disabled: !embeddable
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_VideopackTooltip, {
          text: (0,external_wp_i18n_.__)('Facebook and some other social media sites will use these tags to embed the first video in your post. Your video must be served via https in order to be embedded directly in Facebook and playback is handled by the unstyled built-in browser player. No statistics will be recorded for videos embedded this way and Open Graph tags generated by Jetpack will be disabled on pages with videos.', 'video-embed-thumbnail-generator')
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-control-with-tooltip",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,external_wp_i18n_.__)('Generate Schema.org metadata for search engines', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.schema,
          checked: !!schema
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_VideopackTooltip, {
          text: (0,external_wp_i18n_.__)('Helps your videos appear in search results.', 'video-embed-thumbnail-generator')
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-control-with-tooltip",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,external_wp_i18n_.__)('Change oEmbed to video instead of WordPress default photo/excerpt', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.oembed_provider,
          checked: !!oembed_provider
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_VideopackTooltip, {
          text: (0,external_wp_i18n_.__)('Allows users of other websites to embed your videos using just the post URL rather than the full iframe embed code, much like Vimeo or YouTube. However, most social media sites will not show videos through oEmbed unless your link is https.', 'video-embed-thumbnail-generator')
        })]
      })]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
      title: "Performance",
      initialOpen: true,
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-control-with-tooltip",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,external_wp_i18n_.__)('Always load plugin-related JavaScript and CSS', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.alwaysloadscripts,
          checked: !!alwaysloadscripts
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_VideopackTooltip, {
          text: (0,external_wp_i18n_.__)("Usually Videopack's JavaScript and CSS are only loaded if a video is present on the page. AJAX page loading can cause errors or unstyled players because those assets aren't loaded with the video content. Enabling this option will make sure the JavaScript and CSS are always loaded.", 'video-embed-thumbnail-generator')
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-control-with-tooltip",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
          __next40pxDefaultSize: true,
          className: "videopack-clear-button",
          variant: "secondary",
          onClick: handleClearCache,
          isBusy: isClearingCache,
          disabled: isClearingCache,
          children: (0,external_wp_i18n_.__)('Clear URL cache', 'video-embed-thumbnail-generator')
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_VideopackTooltip, {
          text: (0,external_wp_i18n_.__)("Recommended if your site's URL has changed.", 'video-embed-thumbnail-generator')
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.RadioControl, {
        className: "videopack-setting-radio-group",
        label: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("span", {
          className: "videopack-label-with-tooltip",
          children: [(0,external_wp_i18n_.__)('Record views in the WordPress database', 'video-embed-thumbnail-generator'), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_VideopackTooltip, {
            text: (0,external_wp_i18n_.__)('Recording views in the database requires writing to the database, which can overload a server getting a lot of views. To speed up page loading, only enable the level of view counting you need. If Google Analytics is loaded, quarter event tracking is always recorded because Google servers can handle it.', 'video-embed-thumbnail-generator')
          })]
        }),
        selected: count_views,
        options: countViewsOptions,
        onChange: changeHandlerFactory.count_views
      })]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
      title: (0,external_wp_i18n_.__)('Misc', 'video-embed-thumbnail-generator'),
      initialOpen: true,
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-control-with-tooltip",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,external_wp_i18n_.__)('Override any existing "[video]" shortcodes', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.replace_video_shortcode,
          checked: !!replace_video_shortcode
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_VideopackTooltip, {
          text: (0,external_wp_i18n_.__)("If you have posts or theme files that make use of the built-in WordPress video shortcode, Videopack can override them with this plugin's embedded video player.", 'video-embed-thumbnail-generator')
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-control-with-tooltip",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,external_wp_i18n_.__)('Override any existing Video blocks', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.replace_video_block,
          checked: !!replace_video_block
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_VideopackTooltip, {
          text: (0,external_wp_i18n_.__)("If you have posts that make use of the built-in WordPress Video block, Videopack can override them with this plugin's embedded video player on the frontend.", 'video-embed-thumbnail-generator')
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-control-with-tooltip",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,external_wp_i18n_.__)('Replace media library video preview with Videopack player', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.replace_preview_video,
          checked: !!replace_preview_video
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_VideopackTooltip, {
          text: (0,external_wp_i18n_.__)("Enhance the default WordPress video preview in the media library with Videopack's features and player settings.", 'video-embed-thumbnail-generator')
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-control-with-tooltip",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,external_wp_i18n_.__)('Allow video attachment URL rewriting', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.rewrite_attachment_url,
          checked: !!rewrite_attachment_url
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_VideopackTooltip, {
          text: (0,external_wp_i18n_.__)('If your videos are hosted on a CDN, WordPress might return incorrect URLs for attachments in the Media Library. Disable this setting if Videopack is changing your URLs to local files instead of the CDN.', 'video-embed-thumbnail-generator')
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Flex, {
        direction: "column",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.FlexItem, {
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.BaseControl, {
            __nextHasNoMarginBottom: true,
            label: (0,external_wp_i18n_.__)('When deleting videos, also delete associated', 'video-embed-thumbnail-generator'),
            id: 'videopack-delete-options',
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.CheckboxControl, {
              __nextHasNoMarginBottom: true,
              label: (0,external_wp_i18n_.__)('Thumbnails', 'video-embed-thumbnail-generator'),
              checked: delete_child_thumbnails,
              onChange: changeHandlerFactory.delete_child_thumbnails
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.CheckboxControl, {
              __nextHasNoMarginBottom: true,
              label: (0,external_wp_i18n_.__)('Encoded Videos', 'video-embed-thumbnail-generator'),
              checked: delete_child_encoded,
              onChange: changeHandlerFactory.delete_child_encoded
            })]
          })
        })
      })]
    }), capabilities && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(RolesCheckboxes, {}), (0,external_wp_hooks_.applyFilters)('videopack.settings.admin.after_capabilities', null, {
      settings,
      changeHandlerFactory
    })]
  });
};
/* harmony default export */ const components_AdminSettings = (AdminSettings);
;// ./src/features/settings/components/FreemiusPage.js




/**
 * A component to render Freemius pages fetched via the REST API.
 * It handles dangerously setting the HTML and executing any inline scripts.
 *
 * @param {Object} props      Component props.
 * @param {string} props.page The Freemius page slug ('account' or 'add-ons').
 * @return {Element} The rendered component.
 */

const FreemiusPage = ({
  page
}) => {
  const [content, setContent] = (0,external_wp_element_.useState)('');
  const [isLoading, setIsLoading] = (0,external_wp_element_.useState)(true);
  const containerRef = (0,external_wp_element_.useRef)(null);
  (0,external_wp_element_.useEffect)(() => {
    setIsLoading(true);
    (0,gallery/* getFreemiusPage */.y4)(page).then(response => {
      setContent(response.html);
      setIsLoading(false);
    }).catch(error => {
      console.error(`Error fetching Freemius page '${page}':`, error);
      setContent(`<div class="notice notice-error"><p>Error loading page: ${error.message}</p></div>`);
      setIsLoading(false);
    });
  }, [page]);

  // Effect to execute scripts after the HTML content is rendered.
  (0,external_wp_element_.useEffect)(() => {
    if (!content || !containerRef.current) {
      return;
    }
    const container = containerRef.current;
    const scripts = Array.from(container.querySelectorAll('script'));
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      for (const attr of oldScript.attributes) {
        newScript.setAttribute(attr.name, attr.value);
      }
      newScript.text = oldScript.text;
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }, [content]);
  if (isLoading) {
    return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Spinner, {});
  }
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
    className: "freemius-page-container",
    ref: containerRef,
    dangerouslySetInnerHTML: {
      __html: content
    }
  });
};
/* harmony default export */ const components_FreemiusPage = (FreemiusPage);
// EXTERNAL MODULE: ./src/blocks/player-container/index.js + 6 modules
var player_container = __webpack_require__(4107);
// EXTERNAL MODULE: ./src/blocks/player/index.js + 3 modules
var player = __webpack_require__(7718);
// EXTERNAL MODULE: ./src/blocks/title/index.js + 5 modules
var title = __webpack_require__(517);
// EXTERNAL MODULE: ./src/blocks/download/index.js + 4 modules
var download = __webpack_require__(7093);
// EXTERNAL MODULE: ./src/blocks/share/index.js + 3 modules
var share = __webpack_require__(808);
// EXTERNAL MODULE: ./src/blocks/watermark/index.js + 8 modules
var watermark = __webpack_require__(7405);
// EXTERNAL MODULE: ./src/blocks/view-count/index.js + 5 modules
var view_count = __webpack_require__(2373);
// EXTERNAL MODULE: ./src/blocks/loop/index.js + 3 modules
var loop = __webpack_require__(2331);
// EXTERNAL MODULE: ./src/blocks/thumbnail/index.js + 6 modules
var thumbnail = __webpack_require__(2673);
// EXTERNAL MODULE: ./src/blocks/play-button/index.js + 4 modules
var play_button = __webpack_require__(9827);
// EXTERNAL MODULE: ./src/blocks/pagination/index.js + 4 modules
var pagination = __webpack_require__(7453);
// EXTERNAL MODULE: ./src/blocks/collection/index.js + 3 modules
var collection = __webpack_require__(7957);
;// ./src/features/settings/settings.js
/**
 * Features for managing plugin settings.
 */

/* global videopack_config */

















// Registers every Videopack block type on this page (registerBlockType()
// side effects) — required for the real-block-preview system (buildPreviewBlocks
// + RealBlockPreview) used by PlayerSettings/VideoCollectionSettings. Full
// attribute/context schemas come from the server-side bootstrap injected by
// Assets::bootstrap_block_editor_definitions() (see src/Admin/Assets.php) —
// this page never loads the real post editor, which is the only thing that
// bootstrap normally runs for.













/**
 * VideopackSettingsPage component.
 *
 * @return {Object} The rendered component.
 */

const VideopackSettingsPage = () => {
  const [settings, setSettings] = (0,external_wp_element_.useState)({});
  const [ffmpegTest, setFfmpegTest] = (0,external_wp_element_.useState)({});
  const [isSettingsChanged, setIsSettingsChanged] = (0,external_wp_element_.useState)(false);
  const defaultTab = window.location.hash.substring(1) || 'player';
  const [activeTab, setActiveTab] = (0,external_wp_element_.useState)(defaultTab);
  const [isResetModalOpen, setIsResetModalOpen] = (0,external_wp_element_.useState)(false);
  const settingsRef = (0,external_wp_element_.useRef)(settings);
  (0,external_wp_element_.useEffect)(() => {
    settingsRef.current = settings;
  }, [settings]);
  const testFfmpeg = (0,external_wp_element_.useCallback)((codec, resolution) => {
    if (activeTab === 'encoding') {
      setFfmpegTest({
        command: (0,external_wp_i18n_.__)('Running test…', 'video-embed-thumbnail-generator'),
        output: (0,external_wp_i18n_.__)('Running test…', 'video-embed-thumbnail-generator')
      });
      (0,gallery/* testEncodeCommand */.UD)(codec, resolution).then(response => {
        setFfmpegTest(response);
      }).catch(error => {
        console.error(error);
      });
    }
  }, [activeTab]);
  (0,external_wp_element_.useEffect)(() => {
    if (!isSettingsChanged && activeTab === 'encoding' && settings.sample_codec && settings.sample_resolution && settings.ffmpeg_exists === true && (settings.active_encoder === 'ffmpeg' || !settings.active_encoder)) {
      testFfmpeg(settings.sample_codec, settings.sample_resolution);
    }
  }, [settings, activeTab, isSettingsChanged, testFfmpeg]);
  (0,external_wp_element_.useEffect)(() => {
    (0,api_settings/* getSettings */.mt)().then(response => {
      setSettings(response);
    }).catch(error => {
      console.error(error);
    });
    const handleHashChange = () => {
      setActiveTab(window.location.hash.substring(1) || 'player');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);
  const debouncedSaveSettings = (0,external_wp_compose_.useDebounce)(newSettings => {
    // Prepare settings for saving. Standalone options like videopack_cloud_secret_key
    // are stored alongside the main videopack_options object.
    (0,api_settings/* saveWPSettings */.CZ)(newSettings).then(response => {
      const currentSettings = settingsRef.current;
      const nextSettings = {
        ...response
      };
      let hasLocalChanges = false;
      Object.keys(currentSettings).forEach(key => {
        if (currentSettings[key] !== newSettings[key]) {
          nextSettings[key] = currentSettings[key];
          hasLocalChanges = true;
        }
      });
      setSettings(nextSettings);
      if (!hasLocalChanges) {
        setIsSettingsChanged(false);
      }
    }).catch(error => {
      console.error('Error updating settings:', error);
    });
  }, 1000);
  (0,external_wp_element_.useEffect)(() => {
    if (isSettingsChanged) {
      debouncedSaveSettings(settings);
    }
  }, [isSettingsChanged, debouncedSaveSettings, settings]);
  const changeHandlerFactory = (0,external_wp_element_.useMemo)(() => {
    if (!settings || typeof settings !== 'object') {
      return {};
    }
    const handlers = Object.keys(settings).reduce((acc, setting) => {
      acc[setting] = newValue => {
        setSettings(prevSettings => ({
          ...prevSettings,
          [setting]: newValue
        }));
        setIsSettingsChanged(true);
      };
      return acc;
    }, {});
    return handlers;
  }, [settings]);
  const tabs = (0,external_wp_element_.useMemo)(() => {
    const defaultTabs = [{
      name: 'player',
      title: (0,external_wp_i18n_.__)('Video Player', 'video-embed-thumbnail-generator'),
      component: components_PlayerSettings
    }, {
      name: 'thumbnails',
      title: (0,external_wp_i18n_.__)('Thumbnails', 'video-embed-thumbnail-generator'),
      component: components_ThumbnailSettings
    }, {
      name: 'gallery',
      title: (0,external_wp_i18n_.__)('Galleries & Lists', 'video-embed-thumbnail-generator'),
      component: components_VideoCollectionSettings
    }];
    if (!videopack_config.isFfmpegOverridden || videopack_config.isSuperAdmin) {
      defaultTabs.push({
        name: 'encoding',
        title: (0,external_wp_i18n_.__)('Encoding', 'video-embed-thumbnail-generator'),
        component: components_EncodingSettings
      });
    }
    defaultTabs.push({
      name: 'admin',
      title: (0,external_wp_i18n_.__)('Admin', 'video-embed-thumbnail-generator'),
      component: components_AdminSettings
    });
    if (videopack_config.freemiusEnabled) {
      defaultTabs.push({
        name: 'account',
        title: (0,external_wp_i18n_.__)('Freemius Account', 'video-embed-thumbnail-generator'),
        className: 'videopack-freemius-tab',
        component: () => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_FreemiusPage, {
          page: "account"
        })
      }, {
        name: 'add-ons',
        title: (0,external_wp_i18n_.__)('Add-ons', 'video-embed-thumbnail-generator'),
        className: 'videopack-freemius-tab',
        component: () => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_FreemiusPage, {
          page: "add-ons"
        })
      });
    }

    /**
     * Filters the active settings tabs array in the React Admin panel.
     *
     * @since 5.0.0
     *
     * @param {Array} defaultTabs Array of tab objects.
     */
    return (0,external_wp_hooks_.applyFilters)('videopack.settings.tabs', defaultTabs);
  }, []);
  const onTabSelect = tabName => {
    setActiveTab(tabName);
    window.history.pushState(null, '', `#${tabName}`);
  };
  const renderTab = tab => {
    if (settings && settings.hasOwnProperty('embed_method')) {
      if (tab.component) {
        const TabComponent = tab.component;
        return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(TabComponent, {
          settings: settings,
          setSettings: setSettings,
          changeHandlerFactory: changeHandlerFactory,
          ffmpegTest: ffmpegTest
        });
      }
    } else {
      return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Spinner, {});
    }
  };
  const resetSettings = () => {
    setIsResetModalOpen(true);
  };
  const handleConfirmReset = () => {
    (0,api_settings/* resetVideopackSettings */.zS)().then(response => {
      setSettings(response);
      setIsSettingsChanged(true);
    }).catch(error => {
      console.error(error);
    }).finally(() => {
      setIsResetModalOpen(false);
    });
  };
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
    className: "wrap videopack-settings",
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("h1", {
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Icon, {
        className: "videopack-settings-icon",
        icon: icon/* videopack */.zT,
        size: 40
      }), (0,external_wp_i18n_.__)('Videopack Settings', 'video-embed-thumbnail-generator'), isSettingsChanged && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("span", {
        className: "videopack-settings-saving",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Spinner, {}), (0,external_wp_i18n_.__)('Saving…', 'video-embed-thumbnail-generator')]
      })]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.Panel, {
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.TabPanel, {
        tabs: tabs,
        initialTabName: activeTab,
        onSelect: onTabSelect,
        children: tab => {
          return renderTab(tab);
        }
      }, activeTab), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelRow, {
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
          __next40pxDefaultSize: true,
          variant: "primary",
          onClick: resetSettings,
          className: 'videopack-settings-reset',
          children: (0,external_wp_i18n_.__)('Reset Settings', 'video-embed-thumbnail-generator')
        })
      })]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.__experimentalConfirmDialog, {
      isOpen: isResetModalOpen,
      title: (0,external_wp_i18n_.__)('Reset Settings?', 'video-embed-thumbnail-generator'),
      onConfirm: handleConfirmReset,
      onCancel: () => setIsResetModalOpen(false),
      confirmButtonText: (0,external_wp_i18n_.__)('Reset Settings', 'video-embed-thumbnail-generator'),
      cancelButtonText: (0,external_wp_i18n_.__)('Cancel', 'video-embed-thumbnail-generator'),
      children: (0,external_wp_i18n_.__)('Are you sure you want to reset all settings to their defaults? This action cannot be undone.', 'video-embed-thumbnail-generator')
    })]
  });
};
const el = document.getElementById('videopack-settings-root');
if (el) {
  const root = (0,external_wp_element_.createRoot)(el);
  root.render(/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(VideopackSettingsPage, {}));
}
/******/ })()
;