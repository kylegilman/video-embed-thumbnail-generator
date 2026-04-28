/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/api/gallery.js"
/*!****************************!*\
  !*** ./src/api/gallery.js ***!
  \****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getFreemiusPage: () => (/* binding */ getFreemiusPage),
/* harmony export */   getPresets: () => (/* binding */ getPresets),
/* harmony export */   getUsersWithCapability: () => (/* binding */ getUsersWithCapability),
/* harmony export */   getVideoFormats: () => (/* binding */ getVideoFormats),
/* harmony export */   getVideoGallery: () => (/* binding */ getVideoGallery),
/* harmony export */   getVideoSources: () => (/* binding */ getVideoSources),
/* harmony export */   testEncodeCommand: () => (/* binding */ testEncodeCommand)
/* harmony export */ });
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_url__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/url */ "@wordpress/url");
/* harmony import */ var _wordpress_url__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_url__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/hooks */ "@wordpress/hooks");
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__);
/**
 * API service for video gallery and general media data.
 */

/* global videopack_config */




/**
 * Fetches encoding presets.
 *
 * @param {number|string} attachmentId   Optional. The video attachment ID.
 * @param {string}        url            Optional. The video source URL.
 * @param {Object}        probedMetadata Optional. Probed video dimensions/duration.
 * @param {AbortSignal}   signal         Optional. Abort signal.
 */
const getPresets = async (attachmentId = null, url = '', probedMetadata = null, signal = null) => {
  try {
    const query = {
      attachment_id: attachmentId,
      url
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
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: (0,_wordpress_url__WEBPACK_IMPORTED_MODULE_1__.addQueryArgs)('/videopack/v1/presets', query),
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
 * @param {number|string} attachmentId   Optional. The video attachment ID.
 * @param {string}        url            Optional. The video source URL.
 * @param {AbortSignal}   signal         Optional. Abort signal.
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
    const presets = await getPresets(attachmentId, url, probedMetadata, signal);
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
  const pre = (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__.applyFilters)('videopack.utils.pre_getVideoGallery', undefined, args);
  if (typeof pre !== 'undefined') {
    return pre;
  }
  try {
    const response = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: (0,_wordpress_url__WEBPACK_IMPORTED_MODULE_1__.addQueryArgs)('/videopack/v1/video_gallery', args),
      method: 'GET'
    });
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
 * @param {number} rotate     The rotation angle.
 */
const testEncodeCommand = async (codec, resolution, rotate) => {
  const pre = (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__.applyFilters)('videopack.utils.pre_testEncodeCommand', undefined, codec, resolution, rotate);
  if (typeof pre !== 'undefined') {
    return pre;
  }
  try {
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: `/videopack/v1/ffmpeg-test/?codec=${codec}&resolution=${resolution}&rotate=${rotate}`
    });
  } catch (error) {
    console.error('Error testing encode command:', error);
    throw error;
  }
};

/***/ },

/***/ "./src/api/jobs.js"
/*!*************************!*\
  !*** ./src/api/jobs.js ***!
  \*************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clearQueue: () => (/* binding */ clearQueue),
/* harmony export */   createJob: () => (/* binding */ createJob),
/* harmony export */   deleteJob: () => (/* binding */ deleteJob),
/* harmony export */   enqueueJob: () => (/* binding */ enqueueJob),
/* harmony export */   getJobStatus: () => (/* binding */ getJobStatus),
/* harmony export */   getQueue: () => (/* binding */ getQueue),
/* harmony export */   listJobs: () => (/* binding */ listJobs),
/* harmony export */   removeJob: () => (/* binding */ removeJob),
/* harmony export */   retryJob: () => (/* binding */ retryJob),
/* harmony export */   toggleQueue: () => (/* binding */ toggleQueue)
/* harmony export */ });
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_url__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/url */ "@wordpress/url");
/* harmony import */ var _wordpress_url__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_url__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/hooks */ "@wordpress/hooks");
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__);
/**
 * API service for managing video encoding jobs.
 */





/**
 * Fetches the current video encoding queue.
 */
const getQueue = async () => {
  const pre = (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__.applyFilters)('videopack.utils.pre_getQueue', undefined);
  if (typeof pre !== 'undefined') {
    return pre;
  }
  try {
    const response = await listJobs();
    return (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__.applyFilters)('videopack.utils.getQueue', response || []);
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
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
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
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
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
      path: `/videopack/v1/jobs/${jobId}`,
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
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
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
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: (0,_wordpress_url__WEBPACK_IMPORTED_MODULE_1__.addQueryArgs)(`/videopack/v1/jobs/${jobId}`, {
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
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
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

/***/ },

/***/ "./src/api/media.js"
/*!**************************!*\
  !*** ./src/api/media.js ***!
  \**************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   assignFormat: () => (/* binding */ assignFormat),
/* harmony export */   deleteFile: () => (/* binding */ deleteFile),
/* harmony export */   getBatchProgress: () => (/* binding */ getBatchProgress),
/* harmony export */   startBatchProcess: () => (/* binding */ startBatchProcess),
/* harmony export */   unassignFormat: () => (/* binding */ unassignFormat)
/* harmony export */ });
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_url__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/url */ "@wordpress/url");
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
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
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

/***/ },

/***/ "./src/api/settings.js"
/*!*****************************!*\
  !*** ./src/api/settings.js ***!
  \*****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clearUrlCache: () => (/* binding */ clearUrlCache),
/* harmony export */   getNetworkSettings: () => (/* binding */ getNetworkSettings),
/* harmony export */   getSettings: () => (/* binding */ getSettings),
/* harmony export */   resetNetworkSettings: () => (/* binding */ resetNetworkSettings),
/* harmony export */   resetVideopackSettings: () => (/* binding */ resetVideopackSettings),
/* harmony export */   saveNetworkSettings: () => (/* binding */ saveNetworkSettings),
/* harmony export */   saveWPSettings: () => (/* binding */ saveWPSettings)
/* harmony export */ });
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/hooks */ "@wordpress/hooks");
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
    cachedSettings = allSettings.videopack_options || {};
    settingsPromise = null;
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
    const response = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: '/wp/v2/settings',
      method: 'POST',
      data: {
        videopack_options: newSettings
      }
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
const getNetworkSettings = async () => {
  try {
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
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
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
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
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
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

/***/ },

/***/ "./src/api/thumbnails.js"
/*!*******************************!*\
  !*** ./src/api/thumbnails.js ***!
  \*******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createThumbnailFromCanvas: () => (/* binding */ createThumbnailFromCanvas),
/* harmony export */   generateThumbnail: () => (/* binding */ generateThumbnail),
/* harmony export */   saveAllThumbnails: () => (/* binding */ saveAllThumbnails),
/* harmony export */   setPosterImage: () => (/* binding */ setPosterImage),
/* harmony export */   uploadThumbnail: () => (/* binding */ uploadThumbnail)
/* harmony export */ });
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_url__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/url */ "@wordpress/url");
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
 */
const createThumbnailFromCanvas = (canvas, attachmentId, videoSrc, parentId = 0, featured = null) => {
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
      path
    });
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw error;
  }
};

/***/ },

/***/ "./src/assets/icon.js"
/*!****************************!*\
  !*** ./src/assets/icon.js ***!
  \****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   insertImage: () => (/* binding */ insertImage),
/* harmony export */   pause: () => (/* binding */ pause),
/* harmony export */   play: () => (/* binding */ play),
/* harmony export */   playOutline: () => (/* binding */ playOutline),
/* harmony export */   save: () => (/* binding */ save),
/* harmony export */   sortAscending: () => (/* binding */ sortAscending),
/* harmony export */   sortDescending: () => (/* binding */ sortDescending),
/* harmony export */   videopack: () => (/* binding */ videopack),
/* harmony export */   volumeDown: () => (/* binding */ volumeDown),
/* harmony export */   volumeUp: () => (/* binding */ volumeUp)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);

const videopack = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("svg", {
  width: "20px",
  height: "20px",
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 395.11 395.11",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("g", {
    "data-name": "Ellipse 1",
    transform: "rotate(-45 -201.149 592.789)",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("circle", {
      cx: "360.24",
      cy: "595.24",
      r: "182.56",
      fill: "none",
      stroke: "#cd0000",
      strokeWidth: "30"
    })
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    fill: "#cd0000",
    d: "M95.4 108.3h45.81l57.42 98.69 55.57-98.69h47.49L198.54 286.81 95.4 109.68"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    fill: "#f26a6b",
    d: "M254.2 108.3l-55.57 98.69-57.42-98.69"
  })]
});
const volumeDown = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "currentColor",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    d: "M0 0h24v24H0V0z",
    fill: "none"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    d: "M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"
  })]
});
const volumeUp = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "currentColor",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    d: "M0 0h24v24H0V0z",
    fill: "none"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    d: "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
  })]
});
const save = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "currentColor",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    d: "M0 0h24v24H0V0z",
    fill: "none"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    d: "M17 3H3v18h18V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"
  })]
});
const insertImage = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "currentColor",
  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    d: "M21 21V3H3v18h18zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
  })
});
const sortAscending = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "currentColor",
  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    d: "M19 17H22L18 21L14 17H17V3H19M2 17H12V19H2M6 5V7H2V5M2 11H9V13H2V11Z"
  })
});
const sortDescending = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "currentColor",
  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    d: "M19 7H22L18 3L14 7H17V21H19M2 17H12V19H2M6 5V7H2V5M2 11H9V13H2V11Z"
  })
});
const play = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "currentColor",
  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    d: "M8 5v14l11-7z"
  })
});
const pause = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "currentColor",
  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    d: "M6 19h4V5H6v14zm8-14v14h4V5h-4z"
  })
});
const playOutline = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    d: "M8 5v14l11-7z",
    fill: "none"
  })
});


/***/ },

/***/ "./src/blocks/shared/design-context.js"
/*!*********************************************!*\
  !*** ./src/blocks/shared/design-context.js ***!
  \*********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   designAttributes: () => (/* binding */ designAttributes),
/* harmony export */   providesDesignContext: () => (/* binding */ providesDesignContext),
/* harmony export */   usesDesignContext: () => (/* binding */ usesDesignContext)
/* harmony export */ });
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
  }
};
const providesDesignContext = {
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
  'videopack/pagination_active_color': 'pagination_active_color'
};
const usesDesignContext = ['videopack/skin', 'videopack/title_color', 'videopack/title_background_color', 'videopack/play_button_color', 'videopack/play_button_secondary_color', 'videopack/control_bar_bg_color', 'videopack/control_bar_color', 'videopack/pagination_color', 'videopack/pagination_background_color', 'videopack/pagination_active_bg_color', 'videopack/pagination_active_color'];

/***/ },

/***/ "./src/blocks/videopack-video/edit.js"
/*!********************************************!*\
  !*** ./src/blocks/videopack-video/edit.js ***!
  \********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_blob__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/blob */ "@wordpress/blob");
/* harmony import */ var _wordpress_blob__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blob__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _wordpress_notices__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @wordpress/notices */ "@wordpress/notices");
/* harmony import */ var _wordpress_notices__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_wordpress_notices__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/caption.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/undo.mjs");
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @wordpress/blocks */ "@wordpress/blocks");
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blocks__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var _api_settings__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../api/settings */ "./src/api/settings.js");
/* harmony import */ var _assets_icon__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../assets/icon */ "./src/assets/icon.js");
/* harmony import */ var _components_VideoSettings_VideoSettings_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../components/VideoSettings/VideoSettings.js */ "./src/components/VideoSettings/VideoSettings.js");
/* harmony import */ var _components_Thumbnails_Thumbnails_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../components/Thumbnails/Thumbnails.js */ "./src/components/Thumbnails/Thumbnails.js");
/* harmony import */ var _components_AdditionalFormats_AdditionalFormats_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../../components/AdditionalFormats/AdditionalFormats.js */ "./src/components/AdditionalFormats/AdditionalFormats.js");
/* harmony import */ var _hooks_useVideoProbe_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../../hooks/useVideoProbe.js */ "./src/hooks/useVideoProbe.js");
/* harmony import */ var _hooks_useVideopackContext__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../../hooks/useVideopackContext */ "./src/hooks/useVideopackContext.js");
/* harmony import */ var _editor_scss__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./editor.scss */ "./src/blocks/videopack-video/editor.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__);
/* global videopack_config */



















const ALLOWED_MEDIA_TYPES = ['video'];
const ALLOWED_BLOCKS = ['videopack/video-player-engine', 'videopack/view-count', 'videopack/video-caption'];

/**
 * SingleVideoBlock component for rendering a single video within the editor.
 *
 * @param {Object}   props               Component props.
 * @param {string}   props.clientId      Block client ID.
 * @param {Function} props.setAttributes Function to update block attributes.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Object}   props.options       Global plugin options.
 * @param {boolean}  props.isSelected    Whether the block is selected.
 * @param {Object}   props.videoData     Video attachment data and state.
 * @return {Object}                      The rendered component.
 */
const SingleVideoBlock = ({
  clientId,
  setAttributes,
  attributes,
  options,
  isSelected,
  videoData,
  resolvedPostId,
  resolvedAttributes = attributes,
  context = {}
}) => {
  const {
    src,
    id: effectiveId
  } = resolvedAttributes;
  const {
    record: attachment
  } = videoData;
  const editorPostId = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_5__.useSelect)(select => select('core/editor')?.getCurrentPostId(), []);
  const effectivePostId = attachment?.id || attributes.id || editorPostId;
  const {
    isProbing,
    probedMetadata
  } = (0,_hooks_useVideoProbe_js__WEBPACK_IMPORTED_MODULE_16__["default"])(src);
  const [probedMetadataOverride, setProbedMetadataOverride] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(null);

  // Sync metadata from attachment records when it loads
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
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
        isTainted: false // Internal media tags are never tainted
      });
    } else if (!src) {
      setProbedMetadataOverride(null);
    }
  }, [attachment, probedMetadata, src]);
  const effectiveMetadata = probedMetadataOverride || probedMetadata;

  // attributes are now provided via context to inner blocks
  // playerAttributes logic was moved to video-player-engine/edit.js

  const template = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useMemo)(() => {
    const globalOptions = videopack_config?.options || {};
    const showTitleBar = !!(globalOptions.overlay_title || globalOptions.downloadlink || globalOptions.embedcode);
    const engine_inner_blocks = [];
    if (showTitleBar) {
      engine_inner_blocks.push(['videopack/video-title', {}]);
    }
    if (globalOptions.watermark) {
      engine_inner_blocks.push(['videopack/video-watermark', {}]);
    }
    return [['videopack/video-player-engine', {
      lock: {
        remove: true,
        move: false
      }
    }, engine_inner_blocks], ['videopack/view-count', {}]];
  }, []);
  const {
    resolved: effectiveDesign,
    style: contextStyle,
    classes: contextClasses
  } = (0,_hooks_useVideopackContext__WEBPACK_IMPORTED_MODULE_17__["default"])(attributes, context);
  const contextValue = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useMemo)(() => {
    const result = {
      'videopack/postId': resolvedPostId,
      'videopack/isInsidePlayerContainer': true,
      'videopack/skin': effectiveDesign.skin,
      'videopack/title_color': effectiveDesign.title_color,
      'videopack/title_background_color': effectiveDesign.title_background_color,
      'videopack/play_button_color': effectiveDesign.play_button_color,
      'videopack/play_button_secondary_color': effectiveDesign.play_button_secondary_color,
      'videopack/control_bar_bg_color': effectiveDesign.control_bar_bg_color,
      'videopack/control_bar_color': effectiveDesign.control_bar_color
    };

    // Map other resolved attributes
    Object.entries(resolvedAttributes).forEach(([key, val]) => {
      if (key === 'id') {
        result.id = val;
        result['videopack/postId'] = val;
      } else if (!_hooks_useVideopackContext__WEBPACK_IMPORTED_MODULE_17__.DESIGN_KEYS.includes(key)) {
        const contextKey = `videopack/${key}`;
        // Only overwrite if the value is actually set and not an empty object/array
        if (val !== undefined && val !== null && (typeof val !== 'object' || (Array.isArray(val) ? val.length > 0 : Object.keys(val).length > 0))) {
          result[contextKey] = val;
        }
      }
    });
    return result;
  }, [resolvedPostId, resolvedAttributes, effectiveDesign]);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsxs)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.InspectorControls, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsx)(_components_Thumbnails_Thumbnails_js__WEBPACK_IMPORTED_MODULE_14__["default"], {
        setAttributes: setAttributes,
        attributes: attributes,
        videoData: videoData,
        options: options,
        parentId: effectivePostId || 0,
        isProbing: isProbing,
        probedMetadata: effectiveMetadata
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsx)(_components_VideoSettings_VideoSettings_js__WEBPACK_IMPORTED_MODULE_13__["default"], {
        setAttributes: setAttributes,
        attributes: attributes,
        options: options,
        isProbing: isProbing,
        probedMetadata: effectiveMetadata,
        fallbackTitle: attachment?.title?.rendered || attachment?.title?.raw || resolvedAttributes.title || '',
        fallbackCaption: attachment?.caption?.rendered || attachment?.caption?.raw || resolvedAttributes.caption || '',
        isBlockEditor: true
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsx)(_components_AdditionalFormats_AdditionalFormats_js__WEBPACK_IMPORTED_MODULE_15__["default"], {
        attributes: attributes,
        options: options,
        isProbing: isProbing,
        probedMetadata: effectiveMetadata
      }, attributes.id || src)]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsx)("figure", {
      style: {
        ...contextStyle,
        display: src || effectiveId ? 'block' : 'none'
      },
      "aria-hidden": !(src || effectiveId),
      className: `videopack-video-block-container videopack-wrapper ${contextClasses}${(attributes.overlay_title ?? videopack_config?.options?.overlay_title) || (attributes.downloadlink ?? videopack_config?.options?.downloadlink) || (attributes.embedcode ?? videopack_config?.options?.embedcode) ? ' videopack-video-title-visible' : ''}`,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.BlockContextProvider, {
        value: contextValue,
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.InnerBlocks, {
          template: template,
          templateLock: false,
          allowedBlocks: ALLOWED_BLOCKS
        })
      }, resolvedPostId)
    })]
  });
};

/**
 * Edit component for the Videopack Video block.
 *
 * @param {Object}   props               Component props.
 * @param {Object}   props.attributes    Block attributes.
 * @param {string}   props.clientId      Block client ID.
 * @param {Function} props.setAttributes Function to update block attributes.
 * @param {boolean}  props.isSelected    Whether the block is currently selected.
 * @param {Object}   props.context       Block context.
 * @return {Object}                      The rendered component.
 */
const Edit = ({
  clientId,
  attributes,
  setAttributes,
  isSelected,
  context
}) => {
  const {
    id,
    src
  } = attributes;
  const postId = context['videopack/postId'];
  const [options, setOptions] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)();
  const config = typeof window !== 'undefined' ? window.videopack_config : undefined;
  const mejsSvgPath = config?.mejs_controls_svg || (typeof window !== 'undefined' ? `${window.location.origin}/wp-includes/js/mediaelement/mejs-controls.svg` : '');
  const globalOptions = config?.options || {};
  const effectiveAlign = attributes.align || globalOptions.align || '';
  const blockProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.useBlockProps)({
    className: effectiveAlign ? `align${effectiveAlign}` : '',
    style: {
      '--videopack-mejs-controls-svg': mejsSvgPath ? `url("${mejsSvgPath}")` : undefined
    }
  });
  const hasAttemptedInitialUpload = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useRef)(false);
  const {
    createErrorNotice
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_5__.useDispatch)(_wordpress_notices__WEBPACK_IMPORTED_MODULE_6__.store);
  const {
    insertBlock
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_5__.useDispatch)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.store);
  const {
    mediaUpload,
    isSiteEditor,
    editorPostId,
    innerBlocks
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_5__.useSelect)(select => {
    const editorStore = select(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.store);
    const editor = select('core/editor');
    const postType = editor?.getCurrentPostType();
    return {
      mediaUpload: editorStore.getSettings()?.mediaUpload,
      isSiteEditor: postType === 'wp_template' || postType === 'wp_template_part',
      editorPostId: editor?.getCurrentPostId(),
      innerBlocks: editorStore.getBlocks(clientId)
    };
  }, [clientId]);
  const isContextual = postId && (Number(postId) !== Number(editorPostId) || isSiteEditor);
  const shouldPersist = !isContextual;
  const resolvedPostId = isContextual ? postId : id || undefined;
  const effectiveId = resolvedPostId;
  const [attachment, setAttachment] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(null);
  const [hasResolved, setHasResolved] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(false);
  const videoData = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useMemo)(() => ({
    record: attachment,
    setRecord: setAttachment,
    hasResolved
  }), [attachment, hasResolved]);
  const resolvedAttributes = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useMemo)(() => {
    if (!attachment) {
      return attributes;
    }
    return {
      ...attributes,
      src: attachment.source_url || attachment.url || attributes.src,
      id: attachment.id,
      poster: attachment.videopack?.poster || attachment.meta?.['_videopack-meta']?.poster || attributes.poster,
      total_thumbnails: attachment.meta?.['_videopack-meta']?.total_thumbnails || attributes.total_thumbnails,
      featured: attachment.meta?.['_videopack-meta']?.featured || attributes.featured,
      title: attachment.title?.raw ?? attachment.title?.rendered ?? attributes.title,
      caption: attachment.caption?.raw ?? attachment.caption?.rendered ?? attributes.caption,
      starts: attachment.meta?.['_videopack-meta']?.starts || attributes.starts,
      text_tracks: attachment.meta?.['_videopack-meta']?.track || attachment.meta?.['_videopack-meta']?.tracks || attachment.meta?.track || attachment.meta?.tracks || attributes.text_tracks || [],
      width: attachment.media_details?.width || attributes.width,
      height: attachment.media_details?.height || attributes.height,
      sources: attachment.videopack?.sources || (attachment.source_url || attachment.url ? [{
        src: attachment.source_url || attachment.url
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
      title_background_color: attributes.title_background_color || options?.title_background_color || config?.title_background_color
    };
  }, [attributes, attachment, options, config]);
  const attributesRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useRef)(attributes);
  const lastFetchedIdRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useRef)(null);
  const isMountedRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useRef)(false);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    attributesRef.current = attributes;
  }, [attributes]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  const setAttributesFromMedia = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useCallback)((attachmentObject, shouldPersist = true) => {
    if (!isMountedRef.current) {
      return;
    }
    const media_attributes = {
      src: attachmentObject.source_url || attachmentObject.url,
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
      sources: attachmentObject.videopack?.sources || (attachmentObject.source_url || attachmentObject.url ? [{
        src: attachmentObject.source_url || attachmentObject.url
      }] : []),
      source_groups: attachmentObject.videopack?.source_groups || {},
      text_tracks: attachmentObject.videopack?.text_tracks || [],
      showCaption: !!(attachmentObject.caption?.raw ?? attachmentObject.caption?.rendered)
    };
    const updatedAttributes = Object.keys(media_attributes).reduce((acc, key) => {
      const newVal = media_attributes[key];
      const oldVal = attributesRef.current[key];

      // Handle deep comparison for arrays (e.g., text_tracks)
      const isDifferent = Array.isArray(newVal) ? JSON.stringify(newVal) !== JSON.stringify(oldVal) : newVal !== oldVal;
      if (newVal !== undefined && newVal !== null && isDifferent) {
        // If shouldPersist is false, only update if the current attribute is falsy.
        // This allows background "hydration" of missing metadata without overwriting user overrides.
        if (shouldPersist || !oldVal) {
          acc[key] = newVal;
        }
      }
      return acc;
    }, {});
    const dynamicKeys = ['src', 'poster', 'title', 'caption', 'width', 'height', 'embedlink', 'sources', 'source_groups', 'text_tracks', 'embed_method', 'skin', 'play_button_color', 'play_button_secondary_color', 'control_bar_bg_color', 'control_bar_color', 'title_color', 'title_background_color'];
    if (Object.keys(updatedAttributes).length > 0) {
      const filteredUpdates = {
        ...updatedAttributes
      };

      // We always want to persist the ID if it's being set.
      // For other attributes, we only persist them if we are NOT in a contextual loop
      // AND they are not in the dynamicKeys list.
      if (attachmentObject.id) {
        dynamicKeys.forEach(key => {
          if (!shouldPersist || key in filteredUpdates) {
            delete filteredUpdates[key];
          }
        });
      }
      if (Object.keys(filteredUpdates).length > 0) {
        setAttributes(filteredUpdates);
      }
    }
  }, [setAttributes, shouldPersist]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    if (effectiveId && typeof effectiveId === 'number') {
      // Avoid redundant fetches if we already have the correct attachment
      // or if we've already tried fetching this specific ID.
      if (attachment?.id === effectiveId || lastFetchedIdRef.current === effectiveId) {
        if (attachment?.id === effectiveId) {
          setHasResolved(true);
        }
        return;
      }
      lastFetchedIdRef.current = effectiveId;
      setHasResolved(false);
      _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_10___default()({
        path: `/wp/v2/media/${effectiveId}?context=edit`
      }).then(record => {
        if (!isMountedRef.current) {
          return;
        }
        setAttachment(record);
        setHasResolved(true);
        // Always hydrate missing metadata from the record to ensure the context
        // provided to inner blocks (like the player engine) is complete.
        setAttributesFromMedia(record, !isContextual);
      }).catch(error => {
        if (!isMountedRef.current) {
          return;
        }
        setAttachment(null);
        setHasResolved(true);
        if ((error.status === 404 || error.status === 403) && id) {
          setAttributes({
            id: undefined,
            src: undefined,
            poster: undefined,
            title: undefined,
            caption: undefined
          });
        }
      });
    } else {
      setAttachment(null);
      setHasResolved(false);
      lastFetchedIdRef.current = null;
    }
  }, [effectiveId, id, postId, setAttributesFromMedia, setAttributes, attachment]);
  const onUploadError = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useCallback)(message => {
    createErrorNotice(message, {
      type: 'snackbar'
    });
  }, [createErrorNotice]);
  const onSelectVideo = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useCallback)(video => {
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
      if ((0,_wordpress_blob__WEBPACK_IMPORTED_MODULE_0__.isBlobURL)(videoArray[0].url)) {
        hasAttemptedInitialUpload.current = true;
      }
      setAttributesFromMedia(videoArray[0]);
    }
  }, [setAttributesFromMedia, setAttributes]);
  const onSelectURL = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useCallback)(newSrc => {
    if (newSrc !== src) {
      let filename = newSrc.split('?')[0].split('#')[0];
      filename = filename.split('/').pop();
      if (filename.includes('.')) {
        filename = filename.substring(0, filename.lastIndexOf('.'));
      }
      try {
        filename = decodeURIComponent(filename);
      } catch (e) {
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
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    (0,_api_settings__WEBPACK_IMPORTED_MODULE_11__.getSettings)().then(response => {
      setOptions(response);
      // Hydrate embed_method from global settings if it's missing from block attributes
      // We skip persistence if we are in a contextual (loop) environment
      if (response?.embed_method && !attributesRef.current.embed_method && !isContextual) {
        // We no longer call setAttributes here to keep the block markup clean
      }
    });
    if (!hasAttemptedInitialUpload.current && !id && (0,_wordpress_blob__WEBPACK_IMPORTED_MODULE_0__.isBlobURL)(src)) {
      hasAttemptedInitialUpload.current = true;
      const file = (0,_wordpress_blob__WEBPACK_IMPORTED_MODULE_0__.getBlobByURL)(src);
      if (file) {
        mediaUpload({
          filesList: [file],
          onFileChange: ([videoFile]) => onSelectVideo(videoFile),
          onError: onUploadError,
          allowedTypes: ALLOWED_MEDIA_TYPES
        });
      }
    }
  }, [id, src, mediaUpload, onSelectVideo, onUploadError, setAttributes]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    if (src === 'videopack-preview-video') {
      setAttributes({
        src: videopack_config.url + '/src/images/Adobestock_469037984.mp4'
      });
    } else if (!id && src && src !== 'videopack-preview-video' && !(0,_wordpress_blob__WEBPACK_IMPORTED_MODULE_0__.isBlobURL)(src)) {
      _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_10___default()({
        path: `/videopack/v1/sources?url=${encodeURIComponent(src)}`
      }).catch(error => {
        console.error('Error fetching video sources:', error);
      });
    }
  }, [id, src, setAttributes]);
  const placeholder = content => {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Placeholder, {
      className: "block-editor-media-placeholder",
      withIllustration: true,
      icon: _assets_icon__WEBPACK_IMPORTED_MODULE_12__.videopack,
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Videopack Video', 'video-embed-thumbnail-generator'),
      instructions: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Upload a video file, pick one from your media library, or add one with a URL.', 'video-embed-thumbnail-generator'),
      children: content
    });
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsxs)("figure", {
    ...blockProps,
    children: [!src && !effectiveId ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.MediaPlaceholder, {
      icon: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.BlockIcon, {
        icon: _assets_icon__WEBPACK_IMPORTED_MODULE_12__.videopack
      }),
      onSelect: onSelectVideo,
      onSelectURL: onSelectURL,
      accept: "video/*",
      allowedTypes: ALLOWED_MEDIA_TYPES,
      value: attributes,
      onError: onUploadError,
      placeholder: placeholder
    }) : !id && src && (0,_wordpress_blob__WEBPACK_IMPORTED_MODULE_0__.isBlobURL)(src) ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsxs)("div", {
      className: "components-placeholder block-editor-media-placeholder is-large has-illustration",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsxs)("div", {
        className: "components-placeholder__label",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.BlockIcon, {
          icon: _assets_icon__WEBPACK_IMPORTED_MODULE_12__.videopack
        }), (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Videopack Video', 'video-embed-thumbnail-generator')]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsx)("div", {
        className: "components-placeholder__fieldset",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsxs)("div", {
          className: "videopack-uploading-overlay-content",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsx)("p", {
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Uploading…', 'video-embed-thumbnail-generator')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsx)("div", {
            className: "videopack-progress-bar-container",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.ProgressBar, {})
          })]
        })
      })]
    }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.Fragment, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsxs)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.BlockControls, {
        group: "other",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.MediaReplaceFlow, {
          mediaId: id,
          mediaURL: src,
          allowedTypes: ALLOWED_MEDIA_TYPES,
          accept: "video/*",
          onSelect: onSelectVideo,
          onSelectURL: onSelectURL,
          onError: onUploadError
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.ToolbarButton, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_8__["default"],
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Restart Video', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            restartCount: (attributes.restartCount || 0) + 1
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.BlockControls, {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.ToolbarButton, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_7__["default"],
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Add caption', 'video-embed-thumbnail-generator'),
          onClick: () => {
            const hasCaption = innerBlocks.some(block => block.name === 'videopack/video-caption');
            if (!hasCaption) {
              insertBlock((0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_9__.createBlock)('videopack/video-caption', {
                caption: attributes.caption || ''
              }), innerBlocks.length, clientId);
            }
          }
        })
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsx)(SingleVideoBlock, {
      clientId: clientId,
      setAttributes: setAttributes,
      attributes: attributes,
      options: options,
      isSelected: isSelected,
      videoData: videoData,
      resolvedPostId: resolvedPostId,
      resolvedAttributes: resolvedAttributes,
      context: context
    })]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Edit);

/***/ },

/***/ "./src/blocks/videopack-video/save.js"
/*!********************************************!*\
  !*** ./src/blocks/videopack-video/save.js ***!
  \********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ save)
/* harmony export */ });
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__);


/**
 * The save function defines the way in which the different attributes should
 * be combined into the final markup, which is then serialized by the block
 * editor into `post_content`.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/block-edit-save/#save
 */

function save() {
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__.InnerBlocks.Content, {});
}

/***/ },

/***/ "./src/components/AdditionalFormats/AdditionalFormats.js"
/*!***************************************************************!*\
  !*** ./src/components/AdditionalFormats/AdditionalFormats.js ***!
  \***************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_core_data__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/core-data */ "@wordpress/core-data");
/* harmony import */ var _wordpress_core_data__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_core_data__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _EncodeFormatStatus__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./EncodeFormatStatus */ "./src/components/AdditionalFormats/EncodeFormatStatus.js");
/* harmony import */ var _api_gallery__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../api/gallery */ "./src/api/gallery.js");
/* harmony import */ var _api_jobs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../api/jobs */ "./src/api/jobs.js");
/* harmony import */ var _api_media__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../api/media */ "./src/api/media.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__);
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
  isProbing
}) => {
  const parentId = providedParentId || attributes.id || 0;
  const src = propSrc || attributes.src;
  const {
    ffmpeg_exists
  } = options;
  const [videoFormats, setVideoFormats] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(null);
  const isExternal = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useMemo)(() => {
    let isSrcExternal = false;
    if (src) {
      try {
        isSrcExternal = new URL(src).origin !== window.location.origin;
      } catch (e) {
        // Relative URLs or invalid URLs are considered internal
      }
    }
    return !attributes.id || isSrcExternal;
  }, [attributes.id, src]);
  const [isOpen, setIsOpen] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(isExternal ? false : ffmpeg_exists === true);
  const [encodeMessage, setEncodeMessage] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)();
  const [itemToDelete, setItemToDelete] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(null); // { type: 'file'/'job', formatId: string, jobId?: int, id?: int, name?: string }
  const [deleteInProgress, setDeleteInProgress] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(null); // Stores formatId or jobId being deleted
  const [isConfirmOpen, setIsConfirmOpen] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(false);
  const [isLoading, setIsLoading] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(false);
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
    if (encodeMessage && !encodeMessage.includes((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Error:', 'video-embed-thumbnail-generator'))) {
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
          const isBusyOrDone = ['queued', 'encoding', 'processing', 'completed', 'needs_insert', 'pending_replacement', 'remote_exists'].includes(newFormat.status);
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
    if (!activeId && !src) {
      return;
    } // Don't fetch if no ID and no URL.
    setIsLoading(true);
    try {
      const formats = await (0,_api_gallery__WEBPACK_IMPORTED_MODULE_6__.getVideoFormats)(activeId, src, probedMetadata, signal);
      updateVideoFormats(formats);
    } catch (error) {
      if (error.name === 'AbortError') {
        return;
      }
      console.error('Error fetching video formats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [attributes.id, src, probedMetadata, updateVideoFormats]);
  const pollVideoFormats = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useCallback)(async (signal = null) => {
    const activeId = attributes.id || 0;
    if (src) {
      try {
        const formats = await (0,_api_gallery__WEBPACK_IMPORTED_MODULE_6__.getVideoFormats)(activeId, src, probedMetadata, signal);
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
  }, [src, attributes.id, probedMetadata, updateVideoFormats]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useEffect)(() => {
    if (isProbing || !isOpen) {
      return;
    }
    const controller = new AbortController();
    fetchVideoFormats(controller.signal);
    return () => controller.abort();
  }, [fetchVideoFormats, isProbing, isOpen]); // Fetch formats when the attachment ID changes or panel is opened

  const shouldPoll = formats => {
    if (!formats) {
      return false;
    }
    // Poll only if at least one format is still in a state that requires updates.
    return Object.values(formats).some(format => format.status === 'queued' || format.status === 'encoding' || format.status === 'processing' || format.status === 'needs_insert' || format.status === 'pending_replacement');
  };
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useEffect)(() => {
    setIsEncoding(shouldPoll(videoFormats));
  }, [videoFormats]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useEffect)(() => {
    let pollTimer = null;
    // Manage polling logic based on isEncoding state
    if (isEncoding) {
      const runPoll = async () => {
        const formats = await pollVideoFormats();
        let delay = 15000;
        if (formats) {
          const isSlow = Object.values(formats).some(format => format.encoding_now && format.progress && format.progress.fps && parseFloat(format.progress.fps) < 5);
          if (isSlow) {
            delay = 30000;
          }
        }
        pollTimer = setTimeout(runPoll, delay);
      };
      runPoll();
    } else {
      clearTimeout(pollTimer);
      pollTimer = null;
    }
    return () => {
      if (pollTimer !== null) {
        clearTimeout(pollTimer);
        pollTimer = null;
      }
    };
  }, [isEncoding, pollVideoFormats]);
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
      return updatedFormats;
    });
    // Note: Checkbox state is now purely UI. Saving to DB happens on "Encode" button click.
  };
  const handleEnqueue = async () => {
    if (!videopack_config) {
      return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Spinner, {});
    }
    setIsLoading(true);

    // Get list of format IDs that are checked and available
    const formatsToEncode = Object.entries(videoFormats).filter(([, value]) => value.checked && !['queued', 'encoding', 'processing', 'completed', 'needs_insert', 'pending_replacement', 'remote_exists'].includes(value.status) && !value.exists).reduce((acc, [formatId]) => {
      acc[formatId] = true; // Backend expects an object { format_id: true, ... }
      return acc;
    }, {});
    try {
      const activeId = attributes.id || 0;
      const response = await (0,_api_jobs__WEBPACK_IMPORTED_MODULE_7__.enqueueJob)(activeId, src, formatsToEncode, parentId);
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
        setEncodeMessage((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)(/* translators: %1$d is the number of jobs. %2$s is the ordinal position (e.g. 1st, 2nd). */
        (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__._n)('%1$d job added to queue in %2$s position.', '%1$d jobs added to queue starting in %2$s position.', jobCount, 'video-embed-thumbnail-generator'), jobCount, ordinalPosition));
      }
      fetchVideoFormats(); // Re-fetch to update statuses
    } catch (error) {
      console.error(error);
      const errorMessage = sanitizeError(error);

      /* translators: %s is an error message */
      setEncodeMessage((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)(/* translators: %s is an error message */
      (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Error: %s.', 'video-embed-thumbnail-generator'), errorMessage));
      fetchVideoFormats(); // Re-fetch to ensure UI is consistent
    } finally {
      setIsLoading(false);
    }
  };
  const onSelectFormat = formatId => async media => {
    if (!media || !media.id || !formatId) {
      return;
    }
    setIsLoading(true);
    try {
      await (0,_api_media__WEBPACK_IMPORTED_MODULE_8__.assignFormat)(media.id, formatId, attributes.id);
      setEncodeMessage((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Video format assigned successfully.', 'video-embed-thumbnail-generator'));
      fetchVideoFormats(); // Refresh the list
    } catch (error) {
      console.error('Error assigning video format:', error);
      const errorMessage = sanitizeError(error);
      setEncodeMessage((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)(/* translators: %s is an error message */
      (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Error: %s', 'video-embed-thumbnail-generator'), errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  // Deletes the actual media file (WP Attachment)
  const handleFileDelete = async formatId => {
    const formatData = videoFormats?.[formatId];
    if (!formatData || !formatData.id) {
      setEncodeMessage((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Error: Cannot delete file, missing attachment ID.', 'video-embed-thumbnail-generator'));
      console.error('Cannot delete file: Missing id for format', formatId);
      return;
    }
    setDeleteInProgress(formatId); // Mark this formatId as being deleted
    try {
      await (0,_api_media__WEBPACK_IMPORTED_MODULE_8__.deleteFile)(formatData.id);
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
      await (0,_api_jobs__WEBPACK_IMPORTED_MODULE_7__.deleteJob)(jobId);
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
      if (itemToDelete.type === 'file' && itemToDelete.id) {
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
  const isEncodeButtonDisabled = isLoading || ffmpeg_exists !== true || !somethingToEncode();
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
      return select(_wordpress_core_data__WEBPACK_IMPORTED_MODULE_4__.store).canUser('create', 'media', activeId);
    }
    // If no ID but we have a src, check general media creation permissions
    return !!src && select(_wordpress_core_data__WEBPACK_IMPORTED_MODULE_4__.store).canUser('create', 'media');
  }, [attributes.id, src]);
  (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_3__.useSelect)(select => {
    const activeId = attributes.id || 0;
    const editorSelector = select('core/editor');
    return !!activeId && !!editorSelector && editorSelector.isDeletingPost(activeId);
  }, [attributes.id]);
  const groupedFormats = videoFormats ? Object.values(videoFormats).reduce((acc, format) => {
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
  }, {}) : {};
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.Fragment, {
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Additional Formats', 'video-embed-thumbnail-generator'),
      opened: isOpen,
      onToggle: () => setIsOpen(!isOpen),
      children: [isLoading || !videoFormats ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)("div", {
        className: "videopack-formats-loading",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Spinner, {}), isLoading && isExternal && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("span", {
          className: "videopack-external-check-notice",
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Checking URLs on external server…', 'video-embed-thumbnail-generator')
        })]
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)("div", {
        className: "videopack-formats-container",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("ul", {
          className: `videopack-formats-list${ffmpeg_exists === true ? '' : ' no-ffmpeg'}`,
          children: Object.keys(groupedFormats).map(codecId => {
            const codecGroup = groupedFormats[codecId];
            if (codecGroup.formats.length === 0) {
              return null;
            }
            return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)("li", {
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("h4", {
                className: "videopack-codec-name",
                children: codecGroup.name
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("ul", {
                children: codecGroup.formats.map(formatData => {
                  const formatId = formatData.format_id;
                  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_EncodeFormatStatus__WEBPACK_IMPORTED_MODULE_5__["default"], {
                    formatId: formatId,
                    parentId: parentId,
                    formatData: formatData,
                    ffmpegExists: ffmpeg_exists,
                    onCheckboxChange: handleFormatCheckbox,
                    onSelectFormat: onSelectFormat,
                    onDeleteFile: () => openConfirmDialog('file', formatId),
                    onCancelJob: () => openConfirmDialog('job', formatId),
                    deleteInProgress: deleteInProgress,
                    onRefresh: fetchVideoFormats
                  }, formatId);
                })
              })]
            }, codecId);
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.__experimentalConfirmDialog, {
          isOpen: isConfirmOpen,
          onConfirm: handleConfirm,
          onCancel: handleCancel,
          className: "videopack-confirm-dialog",
          children: confirmDialogMessage()
        })]
      }), ffmpeg_exists === true && videoFormats && canUploadFiles && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelRow, {
        className: "videopack-encode-button-row",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
          variant: "secondary",
          onClick: handleEnqueue,
          title: encodeButtonTitle(),
          text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Encode', 'video-embed-thumbnail-generator'),
          disabled: isEncodeButtonDisabled
        }), isLoading && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Spinner, {}), encodeMessage && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("span", {
          className: "videopack-encode-message",
          children: encodeMessage
        })]
      })]
    })
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (AdditionalFormats);

/***/ },

/***/ "./src/components/AdditionalFormats/EncodeFormatStatus.js"
/*!****************************************************************!*\
  !*** ./src/components/AdditionalFormats/EncodeFormatStatus.js ***!
  \****************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _EncodeProgress__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./EncodeProgress */ "./src/components/AdditionalFormats/EncodeProgress.js");
/* harmony import */ var _EncodeFormatStatus_scss__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./EncodeFormatStatus.scss */ "./src/components/AdditionalFormats/EncodeFormatStatus.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
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
  deleteInProgress,
  onRefresh,
  parentId,
  showLabel = true,
  hideCancel = false
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
    return data.exists && data.status !== 'error' || ['queued', 'encoding', 'processing', 'completed', 'needs_insert', 'pending_replacement', 'remote_exists'].includes(data.status);
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("li", {
    className: "videopack-format-row",
    children: [showLabel && (!!ffmpegExists && ffmpegExists !== 'notinstalled' ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.CheckboxControl, {
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
      children: formatData.status_l10n
    }), formatData.status === 'not_encoded' && !formatData.exists && !formatData.replaces_original && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
      variant: "secondary",
      onClick: () => openMediaLibrary(),
      className: "videopack-format-button",
      size: "small",
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Open the Media Library', 'video-embed-thumbnail-generator'),
      children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Choose', 'video-embed-thumbnail-generator')
    }), formatData.exists && !formatData.encoding_now && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
      variant: "secondary",
      onClick: () => openMediaLibrary(formatData.id),
      className: "videopack-format-button",
      size: "small",
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Open the Media Library', 'video-embed-thumbnail-generator'),
      children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Change', 'video-embed-thumbnail-generator')
    }), formatData.is_manual && formatData.id && !formatData.encoding_now && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
      onClick: onRemoveFormat,
      variant: "secondary",
      size: "small",
      text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Remove', 'video-embed-thumbnail-generator'),
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Removes manual selection. It will not be deleted.', 'video-embed-thumbnail-generator')
    }), formatData.deletable && formatData.id && !formatData.encoding_now && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
      isBusy: deleteInProgress === formatId,
      onClick: onDeleteFile,
      variant: "link",
      text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Delete permanently', 'video-embed-thumbnail-generator'),
      isDestructive: true
    }), (formatData.encoding_now || formatData.status === 'error') && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_EncodeProgress__WEBPACK_IMPORTED_MODULE_2__["default"], {
      formatData: formatData,
      onCancelJob: onCancelJob,
      deleteInProgress: deleteInProgress,
      onRefresh: onRefresh,
      hideCancel: hideCancel
    })]
  }, formatId);
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (EncodeFormatStatus);

/***/ },

/***/ "./src/components/AdditionalFormats/EncodeProgress.js"
/*!************************************************************!*\
  !*** ./src/components/AdditionalFormats/EncodeProgress.js ***!
  \************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/cancel-circle-filled.mjs");
/* harmony import */ var _EncodeProgress_scss__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./EncodeProgress.scss */ "./src/components/AdditionalFormats/EncodeProgress.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__);
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
  if (formatData?.encoding_now && formatData?.progress && typeof formatData.progress === 'object') {
    const percent = Math.round(interpolatedProgress.percent);
    const percentText = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)('%d%%', percent);
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
      className: "videopack-encode-progress",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
        className: "videopack-encode-progress-row",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
          className: "videopack-meter",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
            className: "videopack-meter-bar",
            style: {
              width: percentText
            },
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
              className: "videopack-meter-text",
              children: percentText
            })
          })
        }), !hideCancel && (formatData.progress?.job_id || formatData.job_id) && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
          onClick: () => onCancelJob(formatData.progress?.job_id || formatData.job_id),
          variant: "secondary",
          isDestructive: true,
          size: "small",
          className: "videopack-cancel-job",
          isBusy: deleteInProgress === (formatData.progress?.job_id || formatData.job_id),
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_3__["default"],
          title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Cancel', 'video-embed-thumbnail-generator'),
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("span", {
            className: "videopack-button-text",
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Cancel', 'video-embed-thumbnail-generator')
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
        className: "videopack-encode-progress-small-text",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("span", {
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Elapsed:', 'video-embed-thumbnail-generator') + ' ' + convertToTimecode(interpolatedProgress.elapsed)
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("span", {
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Remaining:', 'video-embed-thumbnail-generator') + ' ' + convertToTimecode(interpolatedProgress.remaining)
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("span", {
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('fps:', 'video-embed-thumbnail-generator') + ' ' + (formatData.progress.fps || '--')
        })]
      })]
    });
  }
  if (formatData?.status === 'failed' && formatData?.error_message) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
      className: "videopack-encode-error",
      children: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)(/* translators: %s is an error message */
      (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Error: %s.', 'video-embed-thumbnail-generator'), formatData.error_message), ' ', hideCancel === false && formatData.job_id && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
        onClick: () => onCancelJob(formatData.job_id),
        variant: "link",
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Delete Job', 'video-embed-thumbnail-generator'),
        isDestructive: true,
        isBusy: deleteInProgress === formatData.job_id
      })]
    });
  }
  return null;
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (EncodeProgress);

/***/ },

/***/ "./src/components/CompactColorPicker/CompactColorPicker.js"
/*!*****************************************************************!*\
  !*** ./src/components/CompactColorPicker/CompactColorPicker.js ***!
  \*****************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
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

/***/ },

/***/ "./src/components/TextTracks/TextTracks.js"
/*!*************************************************!*\
  !*** ./src/components/TextTracks/TextTracks.js ***!
  \*************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_media_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/media-utils */ "@wordpress/media-utils");
/* harmony import */ var _wordpress_media_utils__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_media_utils__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/close.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/plus.mjs");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__);






const TextTracks = ({
  tracks = [],
  onChange
}) => {
  const [isAdding, setIsAdding] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(false);
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
    setIsAdding(false);
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
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelBody, {
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Text Tracks', 'video-embed-thumbnail-generator'),
    initialOpen: false,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("div", {
      className: "videopack-text-tracks-list",
      children: tracks.map((track, index) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
        className: "videopack-text-track-item",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
          className: "videopack-text-track-header",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("span", {
            className: "videopack-text-track-label",
            children: track.label || track.src.split('/').pop() || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Untitled Track', 'video-embed-thumbnail-generator')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
            icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_4__["default"],
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Remove Track', 'video-embed-thumbnail-generator'),
            onClick: () => removeTrack(index),
            isDestructive: true,
            className: "videopack-remove-track"
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
          className: "videopack-text-track-settings",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("div", {
            className: "videopack-text-track-settings-row",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TextControl, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Source URL', 'video-embed-thumbnail-generator'),
              value: track.src,
              onChange: value => updateTrack(index, {
                src: value
              }),
              __nextHasNoMarginBottom: true
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
            className: "videopack-text-track-settings-row videopack-text-track-settings-row-split",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.SelectControl, {
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
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TextControl, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Language', 'video-embed-thumbnail-generator'),
              value: track.srclang,
              onChange: value => updateTrack(index, {
                srclang: value
              }),
              placeholder: "en",
              __nextHasNoMarginBottom: true
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("div", {
            className: "videopack-text-track-settings-row",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TextControl, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Label', 'video-embed-thumbnail-generator'),
              value: track.label,
              onChange: value => updateTrack(index, {
                label: value
              }),
              placeholder: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('e.g. English Subtitles', 'video-embed-thumbnail-generator'),
              __nextHasNoMarginBottom: true
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelRow, {
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.ToggleControl, {
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
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
      className: "videopack-text-tracks-actions",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_media_utils__WEBPACK_IMPORTED_MODULE_3__.MediaUpload, {
        onSelect: handleMediaSelect,
        allowedTypes: ['text/vtt', 'application/vtt', 'text/plain'] // VTT files often detected as text/plain
        ,
        render: ({
          open
        }) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
          variant: "secondary",
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_5__["default"],
          onClick: open,
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Add from Library', 'video-embed-thumbnail-generator')
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
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

/***/ },

/***/ "./src/components/Thumbnails/Thumbnails.js"
/*!*************************************************!*\
  !*** ./src/components/Thumbnails/Thumbnails.js ***!
  \*************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_media_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/media-utils */ "@wordpress/media-utils");
/* harmony import */ var _wordpress_media_utils__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_media_utils__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _api_thumbnails__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../api/thumbnails */ "./src/api/thumbnails.js");
/* harmony import */ var _utils_video_capture__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../utils/video-capture */ "./src/utils/video-capture.js");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/chevron-down.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/chevron-up.mjs");
/* harmony import */ var _VideoPlayerInner__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./VideoPlayerInner */ "./src/components/Thumbnails/VideoPlayerInner.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__);
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
    poster
  } = attributes;
  const src = propSrc || attributes.src;
  const total_thumbnails = attributes.total_thumbnails || videoData?.record?.total_thumbnails || options.total_thumbnails;
  const thumbVideoPanel = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useRef)();
  const videoRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useRef)();
  const modalVideoRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useRef)();
  const posterImageButton = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useRef)();
  const [isPlaying, setIsPlaying] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(false);
  const [isOpened, setIsOpened] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(false);
  const [currentTime, setCurrentTime] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(false);
  const [thumbChoices, setThumbChoices] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)([]);
  const [isSaving, setIsSaving] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(false);
  const [isModalOpen, setIsModalOpen] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(false);
  const ffmpegExists = !!videopack_config.ffmpeg_exists && videopack_config.ffmpeg_exists !== 'notinstalled';
  const {
    editPost
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useDispatch)('core/editor') || {};
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
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useEffect)(() => {
    if (window.mejs && window.mejs.players && poster) {
      // Find the MediaElement.js player within the media modal
      const mejsContainer = document.querySelector('.media-modal .mejs-container, .wp_attachment_holder .mejs-container');
      if (mejsContainer) {
        const mejsId = mejsContainer.id;
        if (mejsId && window.mejs.players[mejsId]) {
          const player = window.mejs.players[mejsId];
          player.setPoster(poster);
        }
      }
    }
  }, [poster]);
  function onSelectPoster(image) {
    setAttributes({
      ...attributes,
      poster: image.url,
      poster_id: Number(image.id)
    });
  }
  function onRemovePoster() {
    setAttributes({
      ...attributes,
      poster: undefined
    });

    // Move focus back to the Media Upload button.
    posterImageButton.current.focus();
  }
  const handleGenerate = async (type = 'generate') => {
    setIsSaving(true);
    setThumbChoices([]);
    const browserThumbnailsEnabled = videopack_config.browser_thumbnails;
    if (!browserThumbnailsEnabled && !!ffmpegExists && ffmpegExists !== 'notinstalled') {
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
    } catch (e) {
      return false;
    }
  })();
  const canvasTainted = probedMetadata?.isTainted || srcIsExternal && !isProbing && !probedMetadata;
  const generateThumb = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useCallback)(async (i, type, forceId = null, forceFeatured = null, time = null) => {
    try {
      const response = await (0,_api_thumbnails__WEBPACK_IMPORTED_MODULE_5__.generateThumbnail)(src, total_thumbnails, i, forceId !== null ? forceId : id, type, parentId, forceFeatured !== null ? forceFeatured : featured, time);
      return response;
    } catch (error) {
      console.error(error);
    }
  }, [src, total_thumbnails, id, parentId, featured]);
  const generateThumbCanvases = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useCallback)(async type => {
    const thumbsInt = Number(total_thumbnails);
    const newThumbCanvases = [];
    let workingId = parseInt(id, 10) || 0;
    const timePoints = (0,_utils_video_capture__WEBPACK_IMPORTED_MODULE_6__.calculateTimecodes)(videoRef.current.duration, thumbsInt, {
      random: type === 'random'
    });
    for (let i = 0; i < timePoints.length; i++) {
      const time = timePoints[i];
      const index = i + 1;
      let thumb;
      try {
        let canvas;
        if (!canvasTainted) {
          canvas = await (0,_utils_video_capture__WEBPACK_IMPORTED_MODULE_6__.captureVideoFrame)(src, time, options?.ffmpeg_thumb_watermark || {});
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
        if (!!ffmpegExists && ffmpegExists !== 'notinstalled') {
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
          } catch (ffmpegError) {
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
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useEffect)(() => {
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

  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useEffect)(() => {
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
        return (0,_api_thumbnails__WEBPACK_IMPORTED_MODULE_5__.createThumbnailFromCanvas)(thumb.canvasObject, id, src, parentId, featured);
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
        const response = await (0,_api_thumbnails__WEBPACK_IMPORTED_MODULE_5__.saveAllThumbnails)(id, thumbUrls, parentId, src, featured);
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
      const response = await (0,_api_thumbnails__WEBPACK_IMPORTED_MODULE_5__.createThumbnailFromCanvas)(canvasObject, id, src, parentId, featured);
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
      const metaData = {};
      if (new_poster) {
        // Only include if new_poster has a value
        metaData['_kgflashmediaplayer-poster'] = new_poster;
        metaData['_kgflashmediaplayer-poster-id'] = Number(new_poster_id);
        const existingMeta = videoData?.record?.meta?.['_videopack-meta'] || {};
        metaData['_videopack-meta'] = {
          ...existingMeta,
          poster: new_poster,
          poster_id: Number(new_poster_id)
        };
        if (attributes.featured !== undefined) {
          metaData['_videopack-meta'].featured = attributes.featured;
        }
      }
      if (videoData?.edit) {
        await videoData.edit({
          featured_media: new_poster_id ? Number(new_poster_id) : null,
          meta: metaData
        });
        await videoData.save();
      }
      if (featured && parentId && editPost && !isEditingAttachment) {
        editPost({
          featured_media: new_poster_id ? Number(new_poster_id) : null
        });
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
        poster: new_poster,
        poster_id: Number(new_poster_id)
      };

      // If we just created the attachment, ensure the ID is included
      if (new_attachment_id && Number(id) === 0) {
        finalAttributes.id = Number(new_attachment_id);
      }
      if (new_poster) {
        setAttributes(finalAttributes);
      }
      setThumbChoices([]);
      setIsSaving(false);
    } catch (error) {
      console.error('Error updating attachment:', error);
      setIsSaving(false);
    }
  };
  const setImgAsPoster = async thumb_url => {
    try {
      const response = await (0,_api_thumbnails__WEBPACK_IMPORTED_MODULE_5__.setPosterImage)(id, thumb_url, parentId, src, featured);
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
      if (!!ffmpegExists && ffmpegExists !== 'notinstalled') {
        try {
          const response = await generateThumb(1, 'generate', null, null, ref.current.currentTime);
          if (response?.real_thumb_url) {
            await setImgAsPoster(response.real_thumb_url);
          } else {
            setIsSaving(false);
          }
        } catch (ffmpegError) {
          console.error('FFmpeg pinpoint capture failed:', ffmpegError);
          setIsSaving(false);
        }
      } else {
        setIsSaving(false);
      }
    };
    if (canvasTainted) {
      await runFfmpegFallback();
      return;
    }
    try {
      const canvas = await (0,_utils_video_capture__WEBPACK_IMPORTED_MODULE_6__.captureVideoFrame)(ref.current, ref.current.currentTime, options?.ffmpeg_thumb_watermark || {});
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
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
    className: "videopack-thumbnail-generator",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Thumbnails', 'video-embed-thumbnail-generator'),
      children: [poster && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("img", {
        className: "videopack-current-thumbnail",
        src: poster,
        alt: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Current Thumbnail', 'video-embed-thumbnail-generator')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.BaseControl, {
        className: "editor-video-poster-control",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.BaseControl.VisualLabel, {
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Video Thumbnail', 'video-embed-thumbnail-generator')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_media_utils__WEBPACK_IMPORTED_MODULE_3__.MediaUpload, {
          title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Select video thumbnail', 'video-embed-thumbnail-generator'),
          onSelect: onSelectPoster,
          allowedTypes: VIDEO_POSTER_ALLOWED_MEDIA_TYPES,
          render: ({
            open
          }) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
            variant: "secondary",
            onClick: open,
            ref: posterImageButton,
            children: !poster ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Select', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Replace', 'video-embed-thumbnail-generator')
          })
        }), !!poster && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
          onClick: onRemovePoster,
          variant: "tertiary",
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Remove', 'video-embed-thumbnail-generator')
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)("Set as post's featured image", 'video-embed-thumbnail-generator'),
        checked: !!featured,
        onChange: value => {
          setAttributes({
            ...attributes,
            featured: value
          });
        }
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.__experimentalNumberControl, {
        __next40pxDefaultSize: true,
        min: 1,
        max: 99,
        required: true,
        value: total_thumbnails,
        onChange: value => {
          if (!value) {
            setAttributes({
              ...attributes,
              total_thumbnails: ''
            });
          } else {
            setAttributes({
              ...attributes,
              total_thumbnails: Number(value)
            });
          }
        },
        className: "videopack-total-thumbnails",
        disabled: isSaving || (canvasTainted || isProbing) && !ffmpegExists
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        variant: "secondary",
        onClick: () => handleGenerate('generate'),
        className: "videopack-generate",
        disabled: isSaving || (canvasTainted || isProbing) && !ffmpegExists,
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Generate', 'video-embed-thumbnail-generator')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        variant: "secondary",
        onClick: () => handleGenerate('random'),
        className: "videopack-generate",
        disabled: isSaving || (canvasTainted || isProbing) && !ffmpegExists,
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Random', 'video-embed-thumbnail-generator')
      }), canvasTainted && !isProbing && !ffmpegExists && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
        className: "videopack-security-error-notice",
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Cross-origin resource sharing (CORS) policy on the external server is preventing thumbnail generation.', 'video-embed-thumbnail-generator')
      }), thumbChoices.length > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        variant: "primary",
        onClick: handleSaveAllThumbnails,
        disabled: isSaving,
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Save All', 'video-embed-thumbnail-generator')
      }), thumbChoices.length > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
        className: `videopack-thumbnail-holder${isSaving ? ' disabled' : ''}`,
        children: thumbChoices.map((thumb, index) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("button", {
          type: "button",
          className: 'videopack-thumbnail spinner-container',
          onClick: event => {
            handleSaveThumbnail(event, thumb, index);
          },
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("img", {
            src: thumb.src,
            alt: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.sprintf)(/* translators: %d is the thumbnail index */
            (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Thumbnail %d', 'video-embed-thumbnail-generator'), index + 1),
            title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Save and set thumbnail', 'video-embed-thumbnail-generator')
          }), isSaving && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Spinner, {})]
        }, index))
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
        className: `components-panel__body videopack-thumb-video ${isOpened ? 'is-opened' : ''}`,
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("h2", {
          className: "components-panel__body-title",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("button", {
            className: "components-button components-panel__body-toggle",
            type: "button",
            onClick: handleToggleVideoPlayer,
            "aria-expanded": isOpened,
            disabled: (canvasTainted || isProbing) && !ffmpegExists,
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("span", {
              "aria-hidden": "true",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Icon, {
                className: "components-panel__arrow",
                icon: isOpened ? _wordpress_icons__WEBPACK_IMPORTED_MODULE_8__["default"] : _wordpress_icons__WEBPACK_IMPORTED_MODULE_7__["default"]
              })
            }), (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Choose From Video', 'video-embed-thumbnail-generator'), canvasTainted && !isProbing && !ffmpegExists && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Icon, {
              icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_8__["default"],
              style: {
                display: 'none'
              }
            })]
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
          className: `videopack-thumb-video-container ${isOpened ? 'is-opened' : ''} ${(canvasTainted || isProbing) && !ffmpegExists ? 'disabled' : ''}`,
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_VideoPlayerInner__WEBPACK_IMPORTED_MODULE_9__["default"], {
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
      }), isModalOpen && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Modal, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Choose From Video', 'video-embed-thumbnail-generator'),
        onRequestClose: handleCloseModal,
        className: "videopack-video-modal",
        overlayClassName: "videopack-video-modal-overlay",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_VideoPlayerInner__WEBPACK_IMPORTED_MODULE_9__["default"], {
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

/***/ },

/***/ "./src/components/Thumbnails/VideoPlayerInner.js"
/*!*******************************************************!*\
  !*** ./src/components/Thumbnails/VideoPlayerInner.js ***!
  \*******************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/external.mjs");
/* harmony import */ var _assets_icon__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../assets/icon */ "./src/assets/icon.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
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
          icon: isPlaying ? _assets_icon__WEBPACK_IMPORTED_MODULE_4__.pause : _assets_icon__WEBPACK_IMPORTED_MODULE_4__.play
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
        icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_3__["default"],
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

/***/ },

/***/ "./src/components/VideoSettings/VideoSettings.js"
/*!*******************************************************!*\
  !*** ./src/components/VideoSettings/VideoSettings.js ***!
  \*******************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _assets_icon__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../assets/icon */ "./src/assets/icon.js");
/* harmony import */ var _hooks_useVideoSettings__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../hooks/useVideoSettings */ "./src/hooks/useVideoSettings.js");
/* harmony import */ var _CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../CompactColorPicker/CompactColorPicker */ "./src/components/CompactColorPicker/CompactColorPicker.js");
/* harmony import */ var _WatermarkSettingsPanel_WatermarkSettingsPanel_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../WatermarkSettingsPanel/WatermarkSettingsPanel.js */ "./src/components/WatermarkSettingsPanel/WatermarkSettingsPanel.js");
/* harmony import */ var _TextTracks_TextTracks_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../TextTracks/TextTracks.js */ "./src/components/TextTracks/TextTracks.js");
/* harmony import */ var _utils_helpers__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../utils/helpers */ "./src/utils/helpers.js");
/* harmony import */ var _utils_colors__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../utils/colors */ "./src/utils/colors.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__);
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
  } = (0,_hooks_useVideoSettings__WEBPACK_IMPORTED_MODULE_4__["default"])(attributes, setAttributes, options);
  const displayAttributes = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useMemo)(() => {
    const merged = {
      ...options,
      ...attributes
    };
    return (0,_utils_helpers__WEBPACK_IMPORTED_MODULE_8__.normalizeOptions)(merged);
  }, [options, attributes]);
  const PLAYER_COLOR_FALLBACKS = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useMemo)(() => (0,_utils_colors__WEBPACK_IMPORTED_MODULE_9__.getColorFallbacks)(displayAttributes), [displayAttributes]);
  const THEME_COLORS = videopack_config?.themeColors || options?.themeColors;
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
    className: "videopack-video-settings",
    children: [!isBlockEditor && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Metadata', 'video-embed-thumbnail-generator'),
      initialOpen: initialOpen,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelRow, {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Overlay title', 'video-embed-thumbnail-generator'),
          onChange: value => handleSettingChange('overlay_title', value),
          checked: !!displayAttributes.overlay_title
        })
      }), displayAttributes.overlay_title && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
        className: "videopack-video-settings-input-wrapper",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Title', 'video-embed-thumbnail-generator'),
          value: displayAttributes.title || '',
          onChange: value => handleSettingChange('title', value)
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
        className: "videopack-video-settings-input-wrapper",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Caption', 'video-embed-thumbnail-generator'),
          value: displayAttributes.caption || '',
          onChange: value => handleSettingChange('caption', value)
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelRow, {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
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
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
          className: `videopack-video-stats-${isSingleStat ? 'simple' : 'funnel'}`,
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("p", {
            className: "videopack-settings-section-title",
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Views', 'video-embed-thumbnail-generator')
          }), isSingleStat ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
            className: "videopack-stat-simple-row",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("span", {
              className: "videopack-stat-label",
              children: [availableStats[0].label, ":"]
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("span", {
              className: "videopack-stat-value",
              children: availableStats[0].val.toLocaleString()
            })]
          }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
            className: "videopack-funnel-track",
            children: availableStats.map((stat, idx, arr) => {
              const retention = stat.key !== 'starts' && displayAttributes.starts > 0 ? Math.round(stat.val / displayAttributes.starts * 100) + '%' : null;
              return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
                className: "videopack-funnel-item",
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
                  className: "videopack-funnel-marker",
                  children: idx < arr.length - 1 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
                    className: "videopack-funnel-connector"
                  })
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
                  className: "videopack-funnel-label",
                  children: stat.label
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
                  className: "videopack-funnel-value",
                  children: stat.val.toLocaleString()
                }), retention && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
                  className: "videopack-funnel-retention",
                  children: retention
                })]
              }, stat.key);
            })
          })]
        });
      })()]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Player Settings', 'video-embed-thumbnail-generator'),
      initialOpen: initialOpen,
      children: [!displayAttributes.gifmode && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.Fragment, {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Flex, {
          "align-items": "flex-start",
          expanded: false,
          gap: 20,
          justify: "flex-start",
          className: "videopack-player-settings-flex",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.FlexItem, {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
              __nextHasNoMarginBottom: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Autoplay', 'video-embed-thumbnail-generator'),
              onChange: value => handleSettingChange('autoplay', value),
              checked: !!displayAttributes.autoplay,
              help: displayAttributes.autoplay && !displayAttributes.muted ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Autoplay is disabled while editing unless muted.') : null
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
              __nextHasNoMarginBottom: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Loop', 'video-embed-thumbnail-generator'),
              onChange: value => handleSettingChange('loop', value),
              checked: !!displayAttributes.loop
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
              __nextHasNoMarginBottom: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Muted', 'video-embed-thumbnail-generator'),
              onChange: value => handleSettingChange('muted', value),
              checked: !!displayAttributes.muted
            }), !displayAttributes.muted && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.RangeControl, {
              __nextHasNoMarginBottom: true,
              __next40pxDefaultSize: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Volume', 'video-embed-thumbnail-generator'),
              value: displayAttributes.volume,
              beforeIcon: _assets_icon__WEBPACK_IMPORTED_MODULE_3__.volumeDown,
              afterIcon: _assets_icon__WEBPACK_IMPORTED_MODULE_3__.volumeUp,
              initialPosition: 1,
              withInputField: false,
              onChange: value => handleSettingChange('volume', value),
              min: 0,
              max: 1,
              step: 0.05
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.FlexItem, {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
              __nextHasNoMarginBottom: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Controls', 'video-embed-thumbnail-generator'),
              onChange: value => handleSettingChange('controls', value),
              checked: !!displayAttributes.controls
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
              __nextHasNoMarginBottom: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Variable playback speeds', 'video-embed-thumbnail-generator'),
              onChange: value => handleSettingChange('playback_rate', value),
              checked: !!displayAttributes.playback_rate
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
              __nextHasNoMarginBottom: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Play inline on iPhones', 'video-embed-thumbnail-generator'),
              onChange: value => handleSettingChange('playsinline', value),
              checked: !!displayAttributes.playsinline
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SelectControl, {
              __nextHasNoMarginBottom: true,
              __next40pxDefaultSize: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Preload', 'video-embed-thumbnail-generator'),
              value: displayAttributes.preload,
              onChange: value => handleSettingChange('preload', value),
              options: preloadOptions
            })]
          })]
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
        __nextHasNoMarginBottom: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('GIF mode', 'video-embed-thumbnail-generator'),
        onChange: value => handleSettingChange('gifmode', value),
        checked: !!displayAttributes.gifmode,
        help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Video acts like an animated GIF. Enables autoplay, loop, mute, and disables controls.')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
        __nextHasNoMarginBottom: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Allow right-click on video', 'video-embed-thumbnail-generator'),
        onChange: value => handleSettingChange('right_click', value),
        checked: !!displayAttributes.right_click
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Colors', 'video-embed-thumbnail-generator'),
      initialOpen: false,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
        className: "videopack-skin-section",
        style: {
          marginBottom: '16px'
        },
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SelectControl, {
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
      }), !isBlockEditor && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
        className: "videopack-color-section",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("p", {
          className: "videopack-settings-section-title",
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Title overlay', 'video-embed-thumbnail-generator')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
          className: "videopack-color-flex-row",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_5__["default"], {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Text', 'video-embed-thumbnail-generator'),
              value: displayAttributes.title_color,
              onChange: value => handleSettingChange('title_color', value),
              colors: THEME_COLORS,
              fallbackValue: PLAYER_COLOR_FALLBACKS.title_color
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_5__["default"], {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Background', 'video-embed-thumbnail-generator'),
              value: displayAttributes.title_background_color,
              onChange: value => handleSettingChange('title_background_color', value),
              colors: THEME_COLORS,
              fallbackValue: PLAYER_COLOR_FALLBACKS.title_background_color
            })
          })]
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
        className: "videopack-color-section",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("p", {
          className: "videopack-settings-section-title",
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Player', 'video-embed-thumbnail-generator')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
          className: "videopack-color-flex-row",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_5__["default"], {
              label: displayAttributes.embed_method === 'WordPress Default' ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Play Button Color', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Play Button Icon', 'video-embed-thumbnail-generator'),
              value: displayAttributes.play_button_color,
              onChange: value => handleSettingChange('play_button_color', value),
              colors: THEME_COLORS,
              fallbackValue: PLAYER_COLOR_FALLBACKS.play_button_color
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_5__["default"], {
              label: displayAttributes.embed_method === 'WordPress Default' ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Play Button Hover', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Play Button Accent', 'video-embed-thumbnail-generator'),
              value: displayAttributes.play_button_secondary_color,
              onChange: value => handleSettingChange('play_button_secondary_color', value),
              colors: THEME_COLORS,
              fallbackValue: PLAYER_COLOR_FALLBACKS.play_button_secondary_color
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_5__["default"], {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Control Bar Background', 'video-embed-thumbnail-generator'),
              value: displayAttributes.control_bar_bg_color,
              onChange: value => handleSettingChange('control_bar_bg_color', value),
              colors: THEME_COLORS,
              fallbackValue: PLAYER_COLOR_FALLBACKS.control_bar_bg_color
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_5__["default"], {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Control Bar Icons', 'video-embed-thumbnail-generator'),
              value: displayAttributes.control_bar_color,
              onChange: value => handleSettingChange('control_bar_color', value),
              colors: THEME_COLORS,
              fallbackValue: PLAYER_COLOR_FALLBACKS.control_bar_color
            })
          })]
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Dimensions', 'video-embed-thumbnail-generator'),
      initialOpen: false,
      children: [!isBlockEditor && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelRow, {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
          className: "videopack-video-settings-full-width",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SelectControl, {
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
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelRow, {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.RadioControl, {
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
      }), !isBlockEditor && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.Fragment, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelRow, {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
            __nextHasNoMarginBottom: true,
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Legacy dimension settings', 'video-embed-thumbnail-generator'),
            onChange: value => handleSettingChange('legacy_dimensions', value),
            checked: !!displayAttributes.legacy_dimensions
          })
        }), displayAttributes.legacy_dimensions && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.Fragment, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelRow, {
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
              __nextHasNoMarginBottom: true,
              __next40pxDefaultSize: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Width', 'video-embed-thumbnail-generator'),
              type: "number",
              value: displayAttributes.width,
              onChange: value => handleSettingChange('width', value)
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelRow, {
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
              __nextHasNoMarginBottom: true,
              __next40pxDefaultSize: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Height', 'video-embed-thumbnail-generator'),
              type: "number",
              value: displayAttributes.height,
              onChange: value => handleSettingChange('height', value)
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelRow, {
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
              __nextHasNoMarginBottom: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Shrink to fit', 'video-embed-thumbnail-generator'),
              onChange: value => handleSettingChange('resize', value),
              checked: !!displayAttributes.resize
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelRow, {
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
              __nextHasNoMarginBottom: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Expand to full width', 'video-embed-thumbnail-generator'),
              onChange: value => handleSettingChange('fullwidth', value),
              checked: !!displayAttributes.fullwidth
            })
          })]
        })]
      })]
    }), !isBlockEditor && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_WatermarkSettingsPanel_WatermarkSettingsPanel_js__WEBPACK_IMPORTED_MODULE_6__["default"], {
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
      children: [displayAttributes.watermark && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelRow, {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SelectControl, {
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
      }), displayAttributes.watermark && displayAttributes.watermark_link_to === 'custom' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelRow, {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Watermark URL', 'video-embed-thumbnail-generator'),
          value: displayAttributes.watermark_url || '',
          onChange: value => handleSettingChange('watermark_url', value)
        })
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_TextTracks_TextTracks_js__WEBPACK_IMPORTED_MODULE_7__["default"], {
      tracks: displayAttributes.text_tracks || [],
      onChange: newTracks => handleSettingChange('text_tracks', newTracks)
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Sharing', 'video-embed-thumbnail-generator'),
      initialOpen: false,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelRow, {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Allow embedding / Show embed code', 'video-embed-thumbnail-generator'),
          onChange: value => handleSettingChange('embedcode', value),
          checked: !!displayAttributes.embedcode
        })
      }), displayAttributes.embedcode && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.Fragment, {
        children: !isBlockEditor && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.Fragment, {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelRow, {
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
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

/***/ },

/***/ "./src/components/WatermarkPositioner/WatermarkPositioner.js"
/*!*******************************************************************!*\
  !*** ./src/components/WatermarkPositioner/WatermarkPositioner.js ***!
  \*******************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
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
    x,
    y,
    scale,
    alignment,
    valign,
    aspectRatio
  } = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => {
    if (!containerDimensions) {
      return {
        wmStyle: {},
        wmWidth: 0,
        wmHeight: 0,
        x: 0,
        y: 0,
        scale: 10,
        alignment: 'center',
        valign: 'center',
        aspectRatio: 1
      };
    }
    const containerWidth = containerDimensions.width;

    // Use transientScale if available, else settings.scale
    const currentScale = transientScale !== null ? transientScale : Number(settings.scale || settings.watermark_scale || 10);
    const currentX = transientPercentages?.x !== undefined && transientPercentages !== null ? transientPercentages.x : Number(settings.x || settings.watermark_x || 0);
    const currentY = transientPercentages?.y !== undefined && transientPercentages !== null ? transientPercentages.y : Number(settings.y || settings.watermark_y || 0);
    const currentAlign = settings.align || settings.watermark_align || 'center';
    const currentValign = settings.valign || settings.watermark_valign || 'center';
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
      x: currentX,
      y: currentY,
      scale: currentScale,
      alignment: currentAlign,
      valign: currentValign,
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
      baseDeltaX: x,
      baseDeltaY: y
    };
  }, [transientPercentages, transientScale, isDragging, isResizing, settings, containerDimensions, watermarkImage, wmWidth, wmHeight, x, y, aspectRatio]);
  const onChangeRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(onChange);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  const handleMouseDown = e => {
    if (!isSelected) return;
    e.preventDefault();
    e.stopPropagation();
    if (watermarkRef.current) {
      watermarkRef.current.focus();
    }
    const initialX = Number(settings.x || settings.watermark_x || 0);
    const initialY = Number(settings.y || settings.watermark_y || 0);
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
    const currentScale = transientScale !== null ? transientScale : Number(settings.scale || settings.watermark_scale || 10);
    const initialX = Number(settings.x || settings.watermark_x || 0);
    const initialY = Number(settings.y || settings.watermark_y || 0);
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
    const finalScale = wasResizing && s.transientScale !== null ? s.transientScale : Number(s.settings.scale || s.settings.watermark_scale || 10);
    const aspectRatio = s.aspectRatio;
    const {
      width: containerWidth,
      height: containerHeight
    } = s.containerDimensions;

    // Preserve attributes based on what's being used (settings vs block-editor styles)
    const isBlock = s.settings.hasOwnProperty('watermark_scale') || s.settings.hasOwnProperty('watermark');
    const currentAlign = s.settings.align || s.settings.watermark_align || 'center';
    const currentValign = s.settings.valign || s.settings.watermark_valign || 'bottom';

    // 1. Calculate absolute top-left percentage (L, T)
    let L = finalX;
    if (currentAlign === 'right') {
      L = 100 - finalScale - finalX;
    } else if (currentAlign === 'center') {
      L = 50 - finalScale / 2 - finalX;
    }
    const vScale = finalScale * (containerWidth / containerHeight) / aspectRatio;
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
      watermark_scale: Math.round(finalScale * 100) / 100,
      watermark_align: newAlign,
      watermark_valign: newValign,
      watermark_x: Math.round(newX * 100) / 100,
      watermark_y: Math.round(newY * 100) / 100
    } : {
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
  }, []);

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
    const alignment = settings.align || settings.watermark_align || 'center';
    const verticalAlignment = settings.valign || settings.watermark_valign || 'center';
    switch (e.key) {
      case 'ArrowUp':
        newY += verticalAlignment === 'top' ? -stepYPct : stepYPct;
        break;
      case 'ArrowDown':
        newY += verticalAlignment === 'top' ? stepYPct : -stepYPct;
        break;
      case 'ArrowLeft':
        newX += alignment === 'left' ? -stepXPct : stepXPct;
        break;
      case 'ArrowRight':
        newX += alignment === 'left' ? stepXPct : -stepXPct;
        break;
    }
    setTransientPercentages({
      x: newX,
      y: newY
    });
  };
  const handleResizeKeyDown = (e, handle) => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();

    // Keyboard resizing is temporarily disabled during percentage refactor for stability
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
      const alignment = s.settings.align || s.settings.watermark_align || 'center';
      const verticalAlignment = s.settings.valign || s.settings.watermark_valign || 'bottom';
      let newX = dragStart.initialX;
      let newY = dragStart.initialY;
      if (alignment === 'left') {
        newX = dragStart.initialX + dxPct;
      } else {
        // right or center offsets increase as we move left (negative dx)
        newX = dragStart.initialX - dxPct;
      }
      if (verticalAlignment === 'top') {
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
        initialLeft,
        initialTop,
        aspectRatio,
        handle
      } = dragStart;
      const initialWidth = containerWidth * initialScale / 100;
      const initialHeight = initialWidth / aspectRatio;
      let newWidth = initialWidth;
      if (handle === 'se' || handle === 'ne') {
        newWidth = initialWidth + dxCanvas;
      } else {
        newWidth = initialWidth - dxCanvas;
      }
      let newScale = newWidth / containerWidth * 100;
      newScale = Math.round(newScale * 100) / 100;
      newScale = Math.max(1, Math.min(100, newScale));
      const alignment = s.settings.align || s.settings.watermark_align || 'center';
      const verticalAlignment = s.settings.valign || s.settings.watermark_valign || 'center';
      let newX = dragStart.initialX;
      let newY = dragStart.initialY;
      const scaleDiff = newScale - initialScale;
      const vScaleFactor = containerWidth / containerHeight / aspectRatio;
      const vScaleDiff = scaleDiff * vScaleFactor;

      // Horizontal anchoring
      if (handle === 'se' || handle === 'ne') {
        // Dragging Right side -> NW or SW corner fixed
        if (alignment === 'left') {
          // Left anchored -> X is fixed
        } else if (alignment === 'right') {
          newX = dragStart.initialX - scaleDiff;
        } else {
          newX = dragStart.initialX - scaleDiff / 2;
        }
      } else {
        // Dragging Left side -> NE or SE corner fixed
        if (alignment === 'left') {
          newX = dragStart.initialX + scaleDiff;
        } else if (alignment === 'right') {
          // Right anchored -> X is fixed
        } else {
          newX = dragStart.initialX + scaleDiff / 2;
        }
      }

      // Vertical anchoring
      if (handle === 'se' || handle === 'sw') {
        // Dragging Bottom side -> NW or NE corner fixed
        if (verticalAlignment === 'top') {
          // Top anchored -> Y is fixed
        } else if (verticalAlignment === 'bottom') {
          newY = dragStart.initialY - vScaleDiff;
        } else {
          newY = dragStart.initialY - vScaleDiff / 2;
        }
      } else {
        // Dragging Top side -> SW or SE corner fixed
        if (verticalAlignment === 'top') {
          newY = dragStart.initialY + vScaleDiff;
        } else if (verticalAlignment === 'bottom') {
          // Bottom anchored -> Y is fixed
        } else {
          newY = dragStart.initialY + vScaleDiff / 2;
        }
      }
      setTransientScale(newScale);
      setTransientPercentages({
        x: newX,
        y: newY
      });
    }
  }, []);
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
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
    ref: containerRef,
    className: "videopack-watermark-positioner",
    style: {
      width: `${containerWidth}px`,
      height: `${containerHeight}px`,
      backgroundImage: showBackground && backgroundDataUrl ? `url(${backgroundDataUrl})` : 'none',
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat'
    },
    children: [(isDragging || isResizing) && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
      className: "videopack-interaction-overlay",
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
        cursor: isDragging ? 'grabbing' : isSelected ? 'move' : 'default'
      },
      role: "button",
      tabIndex: isSelected ? "0" : "-1",
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

/***/ },

/***/ "./src/components/WatermarkSettingsPanel/WatermarkSettingsPanel.js"
/*!*************************************************************************!*\
  !*** ./src/components/WatermarkSettingsPanel/WatermarkSettingsPanel.js ***!
  \*************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _utils_video_capture__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../utils/video-capture */ "./src/utils/video-capture.js");
/* harmony import */ var _features_settings_components_SelectFromLibrary__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../features/settings/components/SelectFromLibrary */ "./src/features/settings/components/SelectFromLibrary.js");
/* harmony import */ var _WatermarkPositioner_WatermarkPositioner__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../WatermarkPositioner/WatermarkPositioner */ "./src/components/WatermarkPositioner/WatermarkPositioner.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
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
      (0,_utils_video_capture__WEBPACK_IMPORTED_MODULE_3__.captureVideoFrame)(videoUrl, videoOffset).then(canvas => {
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
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_features_settings_components_SelectFromLibrary__WEBPACK_IMPORTED_MODULE_4__["default"], {
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
        children: [baseFrame && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_WatermarkPositioner_WatermarkPositioner__WEBPACK_IMPORTED_MODULE_5__["default"], {
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

/***/ },

/***/ "./src/features/settings/components/SelectFromLibrary.js"
/*!***************************************************************!*\
  !*** ./src/features/settings/components/SelectFromLibrary.js ***!
  \***************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _TextControlOnBlur__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./TextControlOnBlur */ "./src/features/settings/components/TextControlOnBlur.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
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
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Select Image', 'video-embed-thumbnail-generator'),
      button: {
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Use this image', 'video-embed-thumbnail-generator')
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
    className: "videopack-setting-reduced-width",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_TextControlOnBlur__WEBPACK_IMPORTED_MODULE_2__["default"], {
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
      }), children]
    })]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SelectFromLibrary);

/***/ },

/***/ "./src/features/settings/components/TextControlOnBlur.js"
/*!***************************************************************!*\
  !*** ./src/features/settings/components/TextControlOnBlur.js ***!
  \***************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__);




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
  const handleOnBlur = () => {
    onChange(innerValue);
  };
  const handleOnFocus = event => {
    if (innerValue === (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('No limit', 'video-embed-thumbnail-generator')) {
      setInnerValue('');
    }
    if (props.onFocus) {
      props.onFocus(event);
    }
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
    ...props,
    value: innerValue,
    onChange: handleOnChange,
    onBlur: handleOnBlur,
    onFocus: handleOnFocus
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (TextControlOnBlur);

/***/ },

/***/ "./src/hooks/useVideoProbe.js"
/*!************************************!*\
  !*** ./src/hooks/useVideoProbe.js ***!
  \************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ useVideoProbe)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_video_capture__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/video-capture */ "./src/utils/video-capture.js");



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
      } catch (e) {
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
    const metadataPromise = (0,_utils_video_capture__WEBPACK_IMPORTED_MODULE_1__.getVideoMetadata)(videoUrl, controller.signal).catch(() => null);
    const taintPromise = (0,_utils_video_capture__WEBPACK_IMPORTED_MODULE_1__.checkCanvasTaint)(videoUrl, controller.signal).catch(() => true);
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

/***/ "./src/hooks/useVideoSettings.js"
/*!***************************************!*\
  !*** ./src/hooks/useVideoSettings.js ***!
  \***************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/compose */ "@wordpress/compose");
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_compose__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_3__);
/**
 * Custom React hook for managing video settings.
 */






// Settings that can be stored per-video in _videopack-meta.
const metaKeys = ['width', 'height', 'downloadlink', 'autoplay', 'loop', 'muted', 'controls', 'volume', 'preload', 'playback_rate', 'playsinline', 'right_click', 'gifmode', 'fixed_aspect', 'align', 'legacy_dimensions', 'resize', 'fullwidth', 'embeddable', 'embedcode', 'overlay_title', 'views', 'starts', 'play_25', 'play_50', 'play_75', 'completeviews', 'watermark', 'watermark_link_to', 'watermark_url', 'poster', 'poster_id', 'total_thumbnails', 'track', 'title_color', 'title_background_color', 'play_button_color', 'play_button_secondary_color', 'control_bar_bg_color', 'control_bar_color'];

/**
 * Hook to manage video settings and synchronize them with attachment metadata.
 *
 * @param {Object}   attributes    Block attributes.
 * @param {Function} setAttributes Function to update block attributes.
 * @param {Object}   options       Global options/settings.
 * @param {Object}   hookOptions   Hook options.
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
        // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
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

/***/ },

/***/ "./src/hooks/useVideopackContext.js"
/*!******************************************!*\
  !*** ./src/hooks/useVideopackContext.js ***!
  \******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DESIGN_KEYS: () => (/* binding */ DESIGN_KEYS),
/* harmony export */   "default": () => (/* binding */ useVideopackContext)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_context__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/context */ "./src/utils/context.js");


const DESIGN_KEYS = ['skin', 'title_color', 'title_background_color', 'play_button_color', 'play_button_secondary_color', 'control_bar_bg_color', 'control_bar_color', 'pagination_color', 'pagination_background_color', 'pagination_active_bg_color', 'pagination_active_color', 'watermark', 'watermark_styles', 'watermark_link_to', 'align', 'gallery_per_page', 'enable_collection_video_limit', 'collection_video_limit'];

/**
 * Hook to resolve Videopack design context and generate styles/classes.
 *
 * @param {Object} attributes Block attributes.
 * @param {Object} context    Block context.
 * @return {Object} Resolved values, styles, and classes.
 */
function useVideopackContext(attributes, context) {
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    const resolved = {};
    const style = {};
    const classes = [];
    DESIGN_KEYS.forEach(key => {
      const value = (0,_utils_context__WEBPACK_IMPORTED_MODULE_1__.getEffectiveValue)(key, attributes, context);
      resolved[key] = value;
      if (value) {
        const cssKey = key.replace(/_/g, '-');
        if (typeof value === 'string' || typeof value === 'number') {
          const cssVar = `--videopack-${cssKey}`;
          style[cssVar] = value;
        }

        // Only add classes for colors/styles that are actually set
        if (key !== 'skin') {
          classes.push(`videopack-has-${cssKey}`);
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
        if (lineHeight) style.lineHeight = lineHeight;
        if (letterSpacing) style.letterSpacing = letterSpacing;
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

    // Handle Gutenberg Typography Classes (Presets)
    if (attributes.fontSize) {
      classes.push(`has-${attributes.fontSize}-font-size`);
    }
    if (attributes.fontFamily) {
      classes.push(`has-${attributes.fontFamily}-font-family`);
    }
    return {
      resolved,
      style,
      classes: classes.join(' ')
    };
  }, [attributes, context]);
}

/***/ },

/***/ "./src/utils/colors.js"
/*!*****************************!*\
  !*** ./src/utils/colors.js ***!
  \*****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getColorFallbacks: () => (/* binding */ getColorFallbacks)
/* harmony export */ });
const getColorFallbacks = settings => {
  const {
    embed_method = 'Video.js',
    skin = 'vjs-theme-videopack'
  } = settings || {};
  const fallbacks = {
    title_color: settings?.title_color || '#ffffff',
    title_background_color: settings?.title_background_color || '#2b333f',
    play_button_color: settings?.play_button_color || '#ffffff',
    play_button_secondary_color: settings?.play_button_secondary_color || '#ffffff',
    control_bar_bg_color: settings?.control_bar_bg_color || '#2b333f',
    control_bar_color: settings?.control_bar_color || '#ffffff',
    pagination_color: settings?.pagination_color || '#1e1e1e',
    pagination_background_color: settings?.pagination_background_color || '#ffffff',
    pagination_active_bg_color: settings?.pagination_active_bg_color || '#1e1e1e',
    pagination_active_color: settings?.pagination_active_color || '#ffffff'
  };
  if (embed_method === 'WordPress Default') {
    fallbacks.title_background_color = 'rgba(40, 40, 40, 0.95)';
    fallbacks.control_bar_bg_color = '#222222';
    fallbacks.play_button_color = '#ffffff';
    fallbacks.play_button_secondary_color = '#ffffff';
  } else if (embed_method?.startsWith('Video.js')) {
    // Default skin (vjs-theme-videopack) defaults
    fallbacks.play_button_color = '#ffffff';
    fallbacks.play_button_secondary_color = '#2b333f'; // Videopack Grey accent

    switch (skin) {
      case 'vjs-theme-city':
        fallbacks.title_background_color = '#bf3b4d';
        fallbacks.control_bar_bg_color = '#000000';
        fallbacks.pagination_active_bg_color = settings?.pagination_active_bg_color || '#bf3b4d';
        break;
      case 'vjs-theme-fantasy':
        fallbacks.title_background_color = '#9f44b4';
        fallbacks.play_button_secondary_color = '#9f44b4';
        fallbacks.pagination_active_bg_color = settings?.pagination_active_bg_color || '#9f44b4';
        break;
      case 'vjs-theme-forest':
        fallbacks.title_background_color = '#6fb04e';
        fallbacks.play_button_secondary_color = '#6fb04e';
        fallbacks.control_bar_bg_color = 'transparent';
        fallbacks.pagination_active_bg_color = settings?.pagination_active_bg_color || '#6fb04e';
        break;
      case 'vjs-theme-sea':
        fallbacks.title_background_color = '#4176bc';
        fallbacks.play_button_secondary_color = '#4176bc';
        fallbacks.control_bar_bg_color = 'rgba(255, 255, 255, 0.4)';
        fallbacks.pagination_active_bg_color = settings?.pagination_active_bg_color || '#4176bc';
        break;
      case 'kg-video-js-skin':
        fallbacks.title_background_color = '#000000';
        fallbacks.play_button_secondary_color = '#000000';
        fallbacks.control_bar_bg_color = '#000000';
        fallbacks.pagination_active_bg_color = settings?.pagination_active_bg_color || '#000000';
        break;
    }
  }
  return fallbacks;
};

/***/ },

/***/ "./src/utils/context.js"
/*!******************************!*\
  !*** ./src/utils/context.js ***!
  \******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getEffectiveValue: () => (/* binding */ getEffectiveValue),
/* harmony export */   normalizeSourceGroups: () => (/* binding */ normalizeSourceGroups)
/* harmony export */ });
/* global videopack_config */

/**
 * Resolves an effective design value by checking local overrides, inherited context,
 * and finally global plugin defaults.
 *
 * @param {string} key      The key to resolve (e.g., 'skin', 'title_color').
 * @param {Object} attributes The block's own attributes.
 * @param {Object} context    The inherited block context.
 * @return {*} The resolved value.
 */
const getEffectiveValue = (key, attributes = {}, context = {}) => {
  const contextKey = key.includes('/') ? key : `videopack/${key}`;
  const attrKey = key.includes('/') ? key.split('/')[1] : key;

  // Helper to check if a value is valid (not undefined, null, or empty string)
  const isValid = val => val !== undefined && val !== null;

  // 1. Check local attribute override
  if (isValid(attributes[attrKey])) {
    return attributes[attrKey];
  }

  // 2. Check inherited context (from Collection or Video block)
  if (isValid(context[contextKey])) {
    return context[contextKey];
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
  if (attrKey === 'align') {
    const localValue = attributes[attrKey] || context[contextKey];
    if (isValid(localValue)) {
      return localValue;
    }
    // Collections use gallery_align as their global default
    const isCollection = attributes.layout || context['videopack/layout'];
    if (isCollection) {
      return globalOptions.gallery_align || globalOptions.align || globalDefaults.align || '';
    }
    return globalOptions.align || globalDefaults.align || '';
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

/***/ },

/***/ "./src/utils/helpers.js"
/*!******************************!*\
  !*** ./src/utils/helpers.js ***!
  \******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   generateShortcode: () => (/* binding */ generateShortcode),
/* harmony export */   normalizeOptions: () => (/* binding */ normalizeOptions),
/* harmony export */   parseShortcode: () => (/* binding */ parseShortcode)
/* harmony export */ });
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
  const booleans = ['autoplay', 'loop', 'muted', 'controls', 'playback_rate', 'playsinline', 'downloadlink', 'overlay_title', 'nativecontrolsfortouch', 'pauseothervideos', 'right_click', 'gallery_pagination', 'gallery_title', 'views', 'auto_res', 'auto_codec'];
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

/***/ },

/***/ "./src/utils/video-capture.js"
/*!************************************!*\
  !*** ./src/utils/video-capture.js ***!
  \************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   calculateTimecodes: () => (/* binding */ calculateTimecodes),
/* harmony export */   captureVideoFrame: () => (/* binding */ captureVideoFrame),
/* harmony export */   checkCanvasTaint: () => (/* binding */ checkCanvasTaint),
/* harmony export */   drawWatermark: () => (/* binding */ drawWatermark),
/* harmony export */   getVideoMetadata: () => (/* binding */ getVideoMetadata)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
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
    const onSeeked = async () => {
      // Clean up listeners if we added them
      if (isTempVideo) {
        video.removeEventListener('seeked', onSeeked);
        video.removeEventListener('error', onError);
      }
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
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
    const onError = e => {
      if (isTempVideo) {
        video.removeEventListener('seeked', onSeeked);
        video.removeEventListener('error', onError);
      }
      reject(e);
    };
    const onLoadedMetadata = () => {
      let seekTime = time;
      if (video.duration < seekTime) {
        seekTime = video.duration / 2;
      }
      video.currentTime = seekTime;
    };
    if (isTempVideo) {
      video.addEventListener('seeked', onSeeked);
      video.addEventListener('error', onError);
      video.addEventListener('loadedmetadata', onLoadedMetadata);
      // Trigger load
      video.load();
    } else {
      // For existing video element, just seek
      const oneShotSeek = async () => {
        video.removeEventListener('seeked', oneShotSeek);
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        if (watermarkOptions && watermarkOptions.url) {
          try {
            await drawWatermark(canvas, watermarkOptions);
          } catch (e) {
            console.error('Watermark failed', e);
          }
        }
        resolve(canvas);
      };
      video.addEventListener('seeked', oneShotSeek);
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
      } catch (e) {
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

/***/ },

/***/ "./src/blocks/videopack-video/editor.scss"
/*!************************************************!*\
  !*** ./src/blocks/videopack-video/editor.scss ***!
  \************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "./src/components/AdditionalFormats/EncodeFormatStatus.scss"
/*!******************************************************************!*\
  !*** ./src/components/AdditionalFormats/EncodeFormatStatus.scss ***!
  \******************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "./src/components/AdditionalFormats/EncodeProgress.scss"
/*!**************************************************************!*\
  !*** ./src/components/AdditionalFormats/EncodeProgress.scss ***!
  \**************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "react/jsx-runtime"
/*!**********************************!*\
  !*** external "ReactJSXRuntime" ***!
  \**********************************/
(module) {

module.exports = window["ReactJSXRuntime"];

/***/ },

/***/ "@wordpress/api-fetch"
/*!**********************************!*\
  !*** external ["wp","apiFetch"] ***!
  \**********************************/
(module) {

module.exports = window["wp"]["apiFetch"];

/***/ },

/***/ "@wordpress/blob"
/*!******************************!*\
  !*** external ["wp","blob"] ***!
  \******************************/
(module) {

module.exports = window["wp"]["blob"];

/***/ },

/***/ "@wordpress/block-editor"
/*!*************************************!*\
  !*** external ["wp","blockEditor"] ***!
  \*************************************/
(module) {

module.exports = window["wp"]["blockEditor"];

/***/ },

/***/ "@wordpress/blocks"
/*!********************************!*\
  !*** external ["wp","blocks"] ***!
  \********************************/
(module) {

module.exports = window["wp"]["blocks"];

/***/ },

/***/ "@wordpress/components"
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
(module) {

module.exports = window["wp"]["components"];

/***/ },

/***/ "@wordpress/compose"
/*!*********************************!*\
  !*** external ["wp","compose"] ***!
  \*********************************/
(module) {

module.exports = window["wp"]["compose"];

/***/ },

/***/ "@wordpress/core-data"
/*!**********************************!*\
  !*** external ["wp","coreData"] ***!
  \**********************************/
(module) {

module.exports = window["wp"]["coreData"];

/***/ },

/***/ "@wordpress/data"
/*!******************************!*\
  !*** external ["wp","data"] ***!
  \******************************/
(module) {

module.exports = window["wp"]["data"];

/***/ },

/***/ "@wordpress/element"
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
(module) {

module.exports = window["wp"]["element"];

/***/ },

/***/ "@wordpress/hooks"
/*!*******************************!*\
  !*** external ["wp","hooks"] ***!
  \*******************************/
(module) {

module.exports = window["wp"]["hooks"];

/***/ },

/***/ "@wordpress/i18n"
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
(module) {

module.exports = window["wp"]["i18n"];

/***/ },

/***/ "@wordpress/media-utils"
/*!************************************!*\
  !*** external ["wp","mediaUtils"] ***!
  \************************************/
(module) {

module.exports = window["wp"]["mediaUtils"];

/***/ },

/***/ "@wordpress/notices"
/*!*********************************!*\
  !*** external ["wp","notices"] ***!
  \*********************************/
(module) {

module.exports = window["wp"]["notices"];

/***/ },

/***/ "@wordpress/primitives"
/*!************************************!*\
  !*** external ["wp","primitives"] ***!
  \************************************/
(module) {

module.exports = window["wp"]["primitives"];

/***/ },

/***/ "@wordpress/url"
/*!*****************************!*\
  !*** external ["wp","url"] ***!
  \*****************************/
(module) {

module.exports = window["wp"]["url"];

/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/cancel-circle-filled.mjs"
/*!*************************************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/cancel-circle-filled.mjs ***!
  \*************************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ cancel_circle_filled_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/cancel-circle-filled.tsx


var cancel_circle_filled_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M12 4c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8Zm3.8 10.7-1.1 1.1-2.7-2.7-2.7 2.7-1.1-1.1 2.7-2.7-2.7-2.7 1.1-1.1 2.7 2.7 2.7-2.7 1.1 1.1-2.7 2.7 2.7 2.7Z" }) });

//# sourceMappingURL=cancel-circle-filled.mjs.map


/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/caption.mjs"
/*!************************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/caption.mjs ***!
  \************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ caption_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/caption.tsx


var caption_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { fillRule: "evenodd", clipRule: "evenodd", d: "M6 5.5h12a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-.5.5H6a.5.5 0 0 1-.5-.5V6a.5.5 0 0 1 .5-.5ZM4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Zm4 10h2v-1.5H8V16Zm5 0h-2v-1.5h2V16Zm1 0h2v-1.5h-2V16Z" }) });

//# sourceMappingURL=caption.mjs.map


/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/chevron-down.mjs"
/*!*****************************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/chevron-down.mjs ***!
  \*****************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ chevron_down_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/chevron-down.tsx


var chevron_down_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M17.5 11.6L12 16l-5.5-4.4.9-1.2L12 14l4.5-3.6 1 1.2z" }) });

//# sourceMappingURL=chevron-down.mjs.map


/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/chevron-up.mjs"
/*!***************************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/chevron-up.mjs ***!
  \***************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ chevron_up_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/chevron-up.tsx


var chevron_up_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M6.5 12.4L12 8l5.5 4.4-.9 1.2L12 10l-4.5 3.6-1-1.2z" }) });

//# sourceMappingURL=chevron-up.mjs.map


/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/close.mjs"
/*!**********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/close.mjs ***!
  \**********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ close_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/close.tsx


var close_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "m13.06 12 6.47-6.47-1.06-1.06L12 10.94 5.53 4.47 4.47 5.53 10.94 12l-6.47 6.47 1.06 1.06L12 13.06l6.47 6.47 1.06-1.06L13.06 12Z" }) });

//# sourceMappingURL=close.mjs.map


/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/external.mjs"
/*!*************************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/external.mjs ***!
  \*************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ external_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/external.tsx


var external_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M19.5 4.5h-7V6h4.44l-5.97 5.97 1.06 1.06L18 7.06v4.44h1.5v-7Zm-13 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3H17v3a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h3V5.5h-3Z" }) });

//# sourceMappingURL=external.mjs.map


/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/plus.mjs"
/*!*********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/plus.mjs ***!
  \*********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ plus_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/plus.tsx


var plus_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M11 12.5V17.5H12.5V12.5H17.5V11H12.5V6H11V11H6V12.5H11Z" }) });

//# sourceMappingURL=plus.mjs.map


/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/undo.mjs"
/*!*********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/undo.mjs ***!
  \*********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ undo_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/undo.tsx


var undo_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M18.3 11.7c-.6-.6-1.4-.9-2.3-.9H6.7l2.9-3.3-1.1-1-4.5 5L8.5 16l1-1-2.7-2.7H16c.5 0 .9.2 1.3.5 1 1 1 3.4 1 4.5v.3h1.5v-.2c0-1.5 0-4.3-1.5-5.7z" }) });

//# sourceMappingURL=undo.mjs.map


/***/ },

/***/ "./src/blocks/videopack-video/block.json"
/*!***********************************************!*\
  !*** ./src/blocks/videopack-video/block.json ***!
  \***********************************************/
(module) {

module.exports = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"videopack/videopack-video","title":"Videopack Video Player","category":"media","icon":"format-video","description":"Embed a single video with Videopack features.","usesContext":["videopack/postId","videopack/skin","videopack/views","videopack/overlay_title","videopack/title_color","videopack/title_background_color","videopack/downloadlink","videopack/embedcode","videopack/play_button_color","videopack/play_button_secondary_color","videopack/control_bar_bg_color","videopack/control_bar_color"],"providesContext":{"videopack/postId":"id","videopack/downloadlink":"downloadlink","videopack/embedcode":"embedcode","videopack/autoplay":"autoplay","videopack/controls":"controls","videopack/loop":"loop","videopack/muted":"muted","videopack/playsinline":"playsinline","videopack/preload":"preload","videopack/volume":"volume","videopack/isInsidePlayerOverlay":"isInsidePlayerOverlay","videopack/isInsidePlayerContainer":"isInsidePlayerContainer","videopack/watermark":"watermark","videopack/watermark_styles":"watermark_styles","videopack/watermark_link_to":"watermark_link_to","videopack/views":"views","videopack/overlay_title":"overlay_title","videopack/showBackground":"showBackground","videopack/sources":"sources","videopack/source_groups":"source_groups","videopack/text_tracks":"text_tracks","videopack/width":"width","videopack/height":"height","videopack/embed_method":"embed_method"},"supports":{"html":false,"align":true,"dimensions":{"aspectRatio":false,"height":false,"minHeight":false,"width":false},"spacing":{"margin":true,"padding":true},"filter":{"duotone":true}},"selectors":{"filter":{"duotone":".wp-block-videopack-videopack-video .vjs-poster img, .wp-block-videopack-videopack-video .mejs-poster img, .wp-block-videopack-videopack-video .mejs-poster"}},"example":{"attributes":{"src":"videopack-preview-video","title":"Sample Video","overlay_title":true}},"attributes":{"id":{"type":"number"},"src":{"type":"string"},"poster":{"type":"string"},"title":{"type":"string"},"caption":{"type":"string"},"width":{"type":"number"},"height":{"type":"number"},"autoplay":{"type":"boolean","default":false},"controls":{"type":"boolean","default":true},"loop":{"type":"boolean","default":false},"muted":{"type":"boolean","default":false},"playsinline":{"type":"boolean","default":false},"preload":{"type":"string","default":"metadata"},"volume":{"type":"number","default":1},"auto_res":{"type":"string"},"auto_codec":{"type":"string"},"sources":{"type":"array","default":[]},"source_groups":{"type":"object","default":{}},"text_tracks":{"type":"array","default":[]},"playback_rate":{"type":"boolean","default":false},"watermark":{"type":"string"},"watermark_styles":{"type":"object","default":{}},"watermark_link_to":{"type":"string","default":""},"default_ratio":{"type":"string","default":"16 / 9"},"fixed_aspect":{"type":"string","default":"false"},"fullwidth":{"type":"boolean","default":false},"textAlign":{"type":"string"},"downloadlink":{"type":"boolean"},"overlay_title":{"type":"boolean"},"views":{"type":"boolean"},"embedcode":{"type":"boolean"},"embedlink":{"type":"string"},"embed_method":{"type":"string"},"showCaption":{"type":"boolean","default":false},"showBackground":{"type":"boolean"},"title_position":{"type":"string","default":"top"},"isInsidePlayerOverlay":{"type":"boolean","default":false},"restartCount":{"type":"number","default":0},"isInsidePlayerContainer":{"type":"boolean","default":true}},"textdomain":"video-embed-thumbnail-generator","editorScript":"file:./index.js","editorStyle":"file:./index.css"}');

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*********************************************!*\
  !*** ./src/blocks/videopack-video/index.js ***!
  \*********************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/blocks */ "@wordpress/blocks");
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _edit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./edit */ "./src/blocks/videopack-video/edit.js");
/* harmony import */ var _save__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./save */ "./src/blocks/videopack-video/save.js");
/* harmony import */ var _block_json__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./block.json */ "./src/blocks/videopack-video/block.json");
/* harmony import */ var _editor_scss__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./editor.scss */ "./src/blocks/videopack-video/editor.scss");
/* harmony import */ var _assets_icon__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../assets/icon */ "./src/assets/icon.js");
/* harmony import */ var _shared_design_context__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../shared/design-context */ "./src/blocks/shared/design-context.js");







(0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__.registerBlockType)(_block_json__WEBPACK_IMPORTED_MODULE_3__.name, {
  ..._block_json__WEBPACK_IMPORTED_MODULE_3__,
  icon: _assets_icon__WEBPACK_IMPORTED_MODULE_5__.videopack,
  attributes: {
    ..._block_json__WEBPACK_IMPORTED_MODULE_3__.attributes,
    ..._shared_design_context__WEBPACK_IMPORTED_MODULE_6__.designAttributes
  },
  providesContext: {
    ..._block_json__WEBPACK_IMPORTED_MODULE_3__.providesContext,
    ..._shared_design_context__WEBPACK_IMPORTED_MODULE_6__.providesDesignContext
  },
  /**
   * @see ./edit.js
   */
  edit: _edit__WEBPACK_IMPORTED_MODULE_1__["default"],
  /**
   * @see ./save.js
   */
  save: _save__WEBPACK_IMPORTED_MODULE_2__["default"]
});
})();

/******/ })()
;
//# sourceMappingURL=index.js.map