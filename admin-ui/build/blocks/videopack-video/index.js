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
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var _api_settings__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../api/settings */ "./src/api/settings.js");
/* harmony import */ var _assets_icon__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../assets/icon */ "./src/assets/icon.js");
/* harmony import */ var _components_VideoSettings_VideoSettings_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../components/VideoSettings/VideoSettings.js */ "./src/components/VideoSettings/VideoSettings.js");
/* harmony import */ var _components_Thumbnails_Thumbnails_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../components/Thumbnails/Thumbnails.js */ "./src/components/Thumbnails/Thumbnails.js");
/* harmony import */ var _components_AdditionalFormats_AdditionalFormats_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../components/AdditionalFormats/AdditionalFormats.js */ "./src/components/AdditionalFormats/AdditionalFormats.js");
/* harmony import */ var _hooks_useVideoProbe_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../hooks/useVideoProbe.js */ "./src/hooks/useVideoProbe.js");
/* harmony import */ var _editor_scss__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./editor.scss */ "./src/blocks/videopack-video/editor.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__);
/* global videopack_config */

















const ALLOWED_MEDIA_TYPES = ['video'];
const ALLOWED_BLOCKS = ['videopack/video-player-engine', 'videopack/view-count'];

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
  videoData
}) => {
  const {
    src
  } = attributes;
  const {
    hasSelectedInnerBlock: innerBlockSelected
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_5__.useSelect)(select => {
    const {
      hasSelectedInnerBlock: checkInnerSelection
    } = select(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.store);
    return {
      hasSelectedInnerBlock: checkInnerSelection(clientId, true)
    };
  }, [clientId]);
  const [showOverlay, setShowOverlay] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(!isSelected && !innerBlockSelected);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    setShowOverlay(!isSelected && !innerBlockSelected);
  }, [isSelected, innerBlockSelected]);
  const {
    record: attachment
  } = videoData;
  const editorPostId = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_5__.useSelect)(select => select('core/editor')?.getCurrentPostId(), []);
  const effectivePostId = attachment?.id || attributes.id || editorPostId;
  const {
    isProbing,
    probedMetadata
  } = (0,_hooks_useVideoProbe_js__WEBPACK_IMPORTED_MODULE_14__["default"])(src);
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
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsxs)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.InspectorControls, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(_components_Thumbnails_Thumbnails_js__WEBPACK_IMPORTED_MODULE_12__["default"], {
        setAttributes: setAttributes,
        attributes: attributes,
        videoData: videoData,
        options: options,
        parentId: effectivePostId || 0,
        isProbing: isProbing,
        probedMetadata: effectiveMetadata
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(_components_VideoSettings_VideoSettings_js__WEBPACK_IMPORTED_MODULE_11__["default"], {
        setAttributes: setAttributes,
        attributes: attributes,
        options: options,
        isProbing: isProbing,
        probedMetadata: effectiveMetadata,
        fallbackTitle: attachment?.title?.rendered || '',
        fallbackCaption: attachment?.caption?.rendered || '',
        isBlockEditor: true
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(_components_AdditionalFormats_AdditionalFormats_js__WEBPACK_IMPORTED_MODULE_13__["default"], {
        attributes: attributes,
        options: options,
        isProbing: isProbing,
        probedMetadata: effectiveMetadata
      }, attributes.id || src)]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsxs)("div", {
      className: `videopack-video-block-container videopack-wrapper${attributes.title_background_color ? ' videopack-has-title-background-color' : ''}`,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.InnerBlocks, {
        template: template,
        templateLock: false,
        allowedBlocks: ALLOWED_BLOCKS
      }), showOverlay && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)("div", {
        className: "videopack-block-overlay"
      }), (attributes.caption || attributes.showCaption) && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.RichText, {
        tagName: "p",
        className: "wp-element-caption videopack-video-caption",
        value: attributes.caption,
        onChange: value => setAttributes({
          caption: value
        }),
        placeholder: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Write caption…', 'video-embed-thumbnail-generator')
      })]
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
  const {
    postId
  } = context;
  const [options, setOptions] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)();
  const blockProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.useBlockProps)();
  const hasAttemptedInitialUpload = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useRef)(false);
  const {
    createErrorNotice
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_5__.useDispatch)(_wordpress_notices__WEBPACK_IMPORTED_MODULE_6__.store);
  const {
    mediaUpload,
    isSiteEditor,
    editorPostId
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_5__.useSelect)(select => {
    const editorStore = select(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.store);
    const editor = select('core/editor');
    const postType = editor?.getCurrentPostType();
    return {
      mediaUpload: editorStore.getSettings()?.mediaUpload,
      isSiteEditor: postType === 'wp_template' || postType === 'wp_template_part',
      editorPostId: editor?.getCurrentPostId()
    };
  }, []);
  const effectiveId = id || (Number(postId) !== Number(editorPostId) || isSiteEditor ? postId : undefined);
  const [attachment, setAttachment] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(null);
  const [hasResolved, setHasResolved] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(false);
  const videoData = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useMemo)(() => ({
    record: attachment,
    setRecord: setAttachment,
    hasResolved
  }), [attachment, hasResolved]);
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
    if (Object.keys(updatedAttributes).length > 0) {
      setAttributes(updatedAttributes);
    }
  }, [setAttributes]);
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
      _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_8___default()({
        path: `/wp/v2/media/${effectiveId}?context=edit`
      }).then(record => {
        if (!isMountedRef.current) {
          return;
        }
        setAttachment(record);
        setHasResolved(true);
        // Always hydrate missing metadata from the record to ensure the context
        // provided to inner blocks (like the player engine) is complete.
        setAttributesFromMedia(record, !id && !postId);
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
    (0,_api_settings__WEBPACK_IMPORTED_MODULE_9__.getSettings)().then(response => {
      setOptions(response);
      // Hydrate embed_method from global settings if it's missing from block attributes
      if (response?.embed_method && !attributesRef.current.embed_method) {
        setAttributes({
          embed_method: response.embed_method
        });
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
      _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_8___default()({
        path: `/videopack/v1/sources?url=${encodeURIComponent(src)}`
      }).catch(error => {
        console.error('Error fetching video sources:', error);
      });
    }
  }, [id, src, setAttributes]);
  const placeholder = content => {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Placeholder, {
      className: "block-editor-media-placeholder",
      withIllustration: true,
      icon: _assets_icon__WEBPACK_IMPORTED_MODULE_10__.videopack,
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Videopack Video', 'video-embed-thumbnail-generator'),
      instructions: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Upload a video file, pick one from your media library, or add one with a URL.', 'video-embed-thumbnail-generator'),
      children: content
    });
  };
  if (!src && !effectiveId) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)("div", {
      ...blockProps,
      children: isSiteEditor ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Placeholder, {
        icon: _assets_icon__WEBPACK_IMPORTED_MODULE_10__.videopack,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Dynamic Videopack Video', 'video-embed-thumbnail-generator'),
        instructions: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('This block is currently configured to show the most recent video from the current post. To select a specific video instead, use the options below.', 'video-embed-thumbnail-generator'),
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.MediaPlaceholder, {
          onSelect: onSelectVideo,
          onSelectURL: onSelectURL,
          accept: "video/*",
          allowedTypes: ALLOWED_MEDIA_TYPES,
          value: attributes,
          onError: onUploadError
        })
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.MediaPlaceholder, {
        icon: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.BlockIcon, {
          icon: _assets_icon__WEBPACK_IMPORTED_MODULE_10__.videopack
        }),
        onSelect: onSelectVideo,
        onSelectURL: onSelectURL,
        accept: "video/*",
        allowedTypes: ALLOWED_MEDIA_TYPES,
        value: attributes,
        onError: onUploadError,
        placeholder: placeholder
      })
    });
  }
  if (!id && src && (0,_wordpress_blob__WEBPACK_IMPORTED_MODULE_0__.isBlobURL)(src)) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)("div", {
      ...blockProps,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsxs)("div", {
        className: "components-placeholder block-editor-media-placeholder is-large has-illustration",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsxs)("div", {
          className: "components-placeholder__label",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.BlockIcon, {
            icon: _assets_icon__WEBPACK_IMPORTED_MODULE_10__.videopack
          }), (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Videopack Video', 'video-embed-thumbnail-generator')]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)("div", {
          className: "components-placeholder__fieldset",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsxs)("div", {
            className: "videopack-uploading-overlay-content",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)("p", {
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Uploading…', 'video-embed-thumbnail-generator')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)("div", {
              className: "videopack-progress-bar-container",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.ProgressBar, {})
            })]
          })
        })]
      })
    });
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsxs)("div", {
    ...blockProps,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.BlockControls, {
      group: "other",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.MediaReplaceFlow, {
        mediaId: id,
        mediaURL: src,
        allowedTypes: ALLOWED_MEDIA_TYPES,
        accept: "video/*",
        onSelect: onSelectVideo,
        onSelectURL: onSelectURL,
        onError: onUploadError
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.BlockControls, {
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.ToolbarButton, {
        icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_7__["default"],
        label: attributes.showCaption ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Remove caption', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Add caption', 'video-embed-thumbnail-generator'),
        isPressed: attributes.showCaption,
        onClick: () => setAttributes({
          showCaption: !attributes.showCaption
        })
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(SingleVideoBlock, {
      clientId: clientId,
      setAttributes: setAttributes,
      attributes: attributes,
      options: options,
      isSelected: isSelected,
      videoData: videoData
    })]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Edit);

/***/ },

/***/ "./src/blocks/videopack-video/index.js"
/*!*********************************************!*\
  !*** ./src/blocks/videopack-video/index.js ***!
  \*********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/blocks */ "@wordpress/blocks");
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _edit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./edit */ "./src/blocks/videopack-video/edit.js");
/* harmony import */ var _save__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./save */ "./src/blocks/videopack-video/save.js");
/* harmony import */ var _block_json__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./block.json */ "./src/blocks/videopack-video/block.json");
/* harmony import */ var _editor_scss__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./editor.scss */ "./src/blocks/videopack-video/editor.scss");
/* harmony import */ var _style_scss__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./style.scss */ "./src/blocks/videopack-video/style.scss");
/* harmony import */ var _assets_icon__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../assets/icon */ "./src/assets/icon.js");







(0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__.registerBlockType)(_block_json__WEBPACK_IMPORTED_MODULE_3__.name, {
  icon: _assets_icon__WEBPACK_IMPORTED_MODULE_6__.videopack,
  /**
   * @see ./edit.js
   */
  edit: _edit__WEBPACK_IMPORTED_MODULE_1__["default"],
  /**
   * @see ./save.js
   */
  save: _save__WEBPACK_IMPORTED_MODULE_2__["default"]
});

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
/* harmony import */ var _AdditionalFormats_scss__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./AdditionalFormats.scss */ "./src/components/AdditionalFormats/AdditionalFormats.scss");
/* harmony import */ var _EncodeFormatStatus__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./EncodeFormatStatus */ "./src/components/AdditionalFormats/EncodeFormatStatus.js");
/* harmony import */ var _api_gallery__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../api/gallery */ "./src/api/gallery.js");
/* harmony import */ var _api_jobs__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../api/jobs */ "./src/api/jobs.js");
/* harmony import */ var _api_media__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../api/media */ "./src/api/media.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
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
      const formats = await (0,_api_gallery__WEBPACK_IMPORTED_MODULE_7__.getVideoFormats)(activeId, src, probedMetadata, signal);
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
        const formats = await (0,_api_gallery__WEBPACK_IMPORTED_MODULE_7__.getVideoFormats)(activeId, src, probedMetadata, signal);
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
      return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Spinner, {});
    }
    setIsLoading(true);

    // Get list of format IDs that are checked and available
    const formatsToEncode = Object.entries(videoFormats).filter(([, value]) => value.checked && !['queued', 'encoding', 'processing', 'completed', 'needs_insert', 'pending_replacement', 'remote_exists'].includes(value.status) && !value.exists).reduce((acc, [formatId]) => {
      acc[formatId] = true; // Backend expects an object { format_id: true, ... }
      return acc;
    }, {});
    try {
      const activeId = attributes.id || 0;
      const response = await (0,_api_jobs__WEBPACK_IMPORTED_MODULE_8__.enqueueJob)(activeId, src, formatsToEncode, parentId);
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
      await (0,_api_media__WEBPACK_IMPORTED_MODULE_9__.assignFormat)(media.id, formatId, attributes.id);
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
      await (0,_api_media__WEBPACK_IMPORTED_MODULE_9__.deleteFile)(formatData.id);
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
      await (0,_api_jobs__WEBPACK_IMPORTED_MODULE_8__.deleteJob)(jobId);
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
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.Fragment, {
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Additional Formats', 'video-embed-thumbnail-generator'),
      opened: isOpen,
      onToggle: () => setIsOpen(!isOpen),
      children: [isLoading || !videoFormats ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
        className: "videopack-formats-loading",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Spinner, {}), isLoading && isExternal && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("span", {
          className: "videopack-external-check-notice",
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Checking URLs on external server…', 'video-embed-thumbnail-generator')
        })]
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
        className: "videopack-formats-container",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("ul", {
          className: `videopack-formats-list${ffmpeg_exists === true ? '' : ' no-ffmpeg'}`,
          children: Object.keys(groupedFormats).map(codecId => {
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
                  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_EncodeFormatStatus__WEBPACK_IMPORTED_MODULE_6__["default"], {
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
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.__experimentalConfirmDialog, {
          isOpen: isConfirmOpen,
          onConfirm: handleConfirm,
          onCancel: handleCancel,
          className: "videopack-confirm-dialog",
          children: confirmDialogMessage()
        })]
      }), ffmpeg_exists === true && videoFormats && canUploadFiles && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelRow, {
        className: "videopack-encode-button-row",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
          variant: "secondary",
          onClick: handleEnqueue,
          title: encodeButtonTitle(),
          text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Encode', 'video-embed-thumbnail-generator'),
          disabled: isEncodeButtonDisabled
        }), isLoading && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Spinner, {}), encodeMessage && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("span", {
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
/* harmony import */ var _CompactColorPicker_scss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./CompactColorPicker.scss */ "./src/components/CompactColorPicker/CompactColorPicker.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__);



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
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
    className: "videopack-color-picker-container",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("span", {
      className: "videopack-color-picker-label",
      children: label
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Dropdown, {
      className: "videopack-color-dropdown",
      contentClassName: "videopack-color-dropdown-content",
      renderToggle: ({
        isOpen,
        onToggle
      }) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        onClick: onToggle,
        "aria-expanded": isOpen,
        variant: "secondary",
        className: "videopack-color-picker-button",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ColorIndicator, {
          colorValue: displayColor
        })
      }),
      renderContent: () => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
        className: "videopack-color-picker-palette-wrapper",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ColorPalette, {
          colors: colors,
          value: hexValue,
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
/* harmony import */ var _TextTracks_scss__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./TextTracks.scss */ "./src/components/TextTracks/TextTracks.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__);







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
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelBody, {
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Text Tracks', 'video-embed-thumbnail-generator'),
    initialOpen: false,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
      className: "videopack-text-tracks-list",
      children: tracks.map((track, index) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
        className: "videopack-text-track-item",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
          className: "videopack-text-track-header",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
            className: "videopack-text-track-label",
            children: track.label || track.src.split('/').pop() || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Untitled Track', 'video-embed-thumbnail-generator')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
            icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_4__["default"],
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Remove Track', 'video-embed-thumbnail-generator'),
            onClick: () => removeTrack(index),
            isDestructive: true,
            className: "videopack-remove-track"
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
          className: "videopack-text-track-settings",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
            className: "videopack-text-track-settings-row",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TextControl, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Source URL', 'video-embed-thumbnail-generator'),
              value: track.src,
              onChange: value => updateTrack(index, {
                src: value
              }),
              __nextHasNoMarginBottom: true
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
            className: "videopack-text-track-settings-row videopack-text-track-settings-row-split",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.SelectControl, {
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
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TextControl, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Language', 'video-embed-thumbnail-generator'),
              value: track.srclang,
              onChange: value => updateTrack(index, {
                srclang: value
              }),
              placeholder: "en",
              __nextHasNoMarginBottom: true
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
            className: "videopack-text-track-settings-row",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TextControl, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Label', 'video-embed-thumbnail-generator'),
              value: track.label,
              onChange: value => updateTrack(index, {
                label: value
              }),
              placeholder: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('e.g. English Subtitles', 'video-embed-thumbnail-generator'),
              __nextHasNoMarginBottom: true
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelRow, {
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.ToggleControl, {
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
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
      className: "videopack-text-tracks-actions",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_media_utils__WEBPACK_IMPORTED_MODULE_3__.MediaUpload, {
        onSelect: handleMediaSelect,
        allowedTypes: ['text/vtt', 'application/vtt', 'text/plain'] // VTT files often detected as text/plain
        ,
        render: ({
          open
        }) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
          variant: "secondary",
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_5__["default"],
          onClick: open,
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Add from Library', 'video-embed-thumbnail-generator')
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
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
/* harmony import */ var _Thumbnails_scss__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./Thumbnails.scss */ "./src/components/Thumbnails/Thumbnails.scss");
/* harmony import */ var _VideoPlayerInner__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./VideoPlayerInner */ "./src/components/Thumbnails/VideoPlayerInner.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__);
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
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("div", {
    className: "videopack-thumbnail-generator",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Thumbnails', 'video-embed-thumbnail-generator'),
      children: [poster && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("img", {
        className: "videopack-current-thumbnail",
        src: poster,
        alt: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Current Thumbnail', 'video-embed-thumbnail-generator')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.BaseControl, {
        className: "editor-video-poster-control",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.BaseControl.VisualLabel, {
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Video Thumbnail', 'video-embed-thumbnail-generator')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_media_utils__WEBPACK_IMPORTED_MODULE_3__.MediaUpload, {
          title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Select video thumbnail', 'video-embed-thumbnail-generator'),
          onSelect: onSelectPoster,
          allowedTypes: VIDEO_POSTER_ALLOWED_MEDIA_TYPES,
          render: ({
            open
          }) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
            variant: "secondary",
            onClick: open,
            ref: posterImageButton,
            children: !poster ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Select', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Replace', 'video-embed-thumbnail-generator')
          })
        }), !!poster && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
          onClick: onRemovePoster,
          variant: "tertiary",
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Remove', 'video-embed-thumbnail-generator')
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)("Set as post's featured image", 'video-embed-thumbnail-generator'),
        checked: !!featured,
        onChange: value => {
          setAttributes({
            ...attributes,
            featured: value
          });
        }
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.__experimentalNumberControl, {
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
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        variant: "secondary",
        onClick: () => handleGenerate('generate'),
        className: "videopack-generate",
        disabled: isSaving || (canvasTainted || isProbing) && !ffmpegExists,
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Generate', 'video-embed-thumbnail-generator')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        variant: "secondary",
        onClick: () => handleGenerate('random'),
        className: "videopack-generate",
        disabled: isSaving || (canvasTainted || isProbing) && !ffmpegExists,
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Random', 'video-embed-thumbnail-generator')
      }), canvasTainted && !isProbing && !ffmpegExists && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("div", {
        className: "videopack-security-error-notice",
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Cross-origin resource sharing (CORS) policy on the external server is preventing thumbnail generation.', 'video-embed-thumbnail-generator')
      }), thumbChoices.length > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        variant: "primary",
        onClick: handleSaveAllThumbnails,
        disabled: isSaving,
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Save All', 'video-embed-thumbnail-generator')
      }), thumbChoices.length > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("div", {
        className: `videopack-thumbnail-holder${isSaving ? ' disabled' : ''}`,
        children: thumbChoices.map((thumb, index) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("button", {
          type: "button",
          className: 'videopack-thumbnail spinner-container',
          onClick: event => {
            handleSaveThumbnail(event, thumb, index);
          },
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("img", {
            src: thumb.src,
            alt: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.sprintf)(/* translators: %d is the thumbnail index */
            (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Thumbnail %d', 'video-embed-thumbnail-generator'), index + 1),
            title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Save and set thumbnail', 'video-embed-thumbnail-generator')
          }), isSaving && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Spinner, {})]
        }, index))
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("div", {
        className: `components-panel__body videopack-thumb-video ${isOpened ? 'is-opened' : ''}`,
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("h2", {
          className: "components-panel__body-title",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("button", {
            className: "components-button components-panel__body-toggle",
            type: "button",
            onClick: handleToggleVideoPlayer,
            "aria-expanded": isOpened,
            disabled: (canvasTainted || isProbing) && !ffmpegExists,
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("span", {
              "aria-hidden": "true",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Icon, {
                className: "components-panel__arrow",
                icon: isOpened ? _wordpress_icons__WEBPACK_IMPORTED_MODULE_8__["default"] : _wordpress_icons__WEBPACK_IMPORTED_MODULE_7__["default"]
              })
            }), (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Choose From Video', 'video-embed-thumbnail-generator'), canvasTainted && !isProbing && !ffmpegExists && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Icon, {
              icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_8__["default"],
              style: {
                display: 'none'
              }
            })]
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("div", {
          className: `videopack-thumb-video-container ${isOpened ? 'is-opened' : ''} ${(canvasTainted || isProbing) && !ffmpegExists ? 'disabled' : ''}`,
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_VideoPlayerInner__WEBPACK_IMPORTED_MODULE_10__["default"], {
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
      }), isModalOpen && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Modal, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Choose From Video', 'video-embed-thumbnail-generator'),
        onRequestClose: handleCloseModal,
        className: "videopack-video-modal",
        overlayClassName: "videopack-video-modal-overlay",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_VideoPlayerInner__WEBPACK_IMPORTED_MODULE_10__["default"], {
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
/* harmony import */ var _Thumbnails_scss__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Thumbnails.scss */ "./src/components/Thumbnails/Thumbnails.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__);







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
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
    className: `videopack-thumb-video-panel spinner-container${isSaving ? ' saving' : ''} ${isModal ? 'is-modal' : ''} ${disabled ? 'disabled' : ''}`,
    tabIndex: 0,
    ref: containerRef,
    onKeyDown: onKeyDown,
    role: "button",
    "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Video Player', 'video-embed-thumbnail-generator'),
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("video", {
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
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
      className: "videopack-thumb-video-controls",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        className: "videopack-play-pause",
        onClick: () => togglePlayback(videoRef),
        disabled: disabled,
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Icon, {
          icon: isPlaying ? _assets_icon__WEBPACK_IMPORTED_MODULE_4__.pause : _assets_icon__WEBPACK_IMPORTED_MODULE_4__.play
        })
      }), duration > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.RangeControl, {
        __nextHasNoMarginBottom: true,
        min: 0,
        max: duration,
        step: "any",
        initialPosition: 0,
        value: currentTime || 0,
        onChange: val => handleSliderChange(val, videoRef),
        className: "videopack-thumbvideo-slider",
        type: "slider"
      }), !isModal && onPopOut && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        className: "videopack-popout",
        onClick: onPopOut,
        icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_3__["default"],
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Open in larger window', 'video-embed-thumbnail-generator'),
        showTooltip: true,
        disabled: disabled
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
      variant: "secondary",
      onClick: () => handleUseThisFrame(videoRef),
      className: "videopack-use-this-frame",
      disabled: isSaving || disabled,
      children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Use this frame', 'video-embed-thumbnail-generator')
    }), isSaving && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Spinner, {})]
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
/* harmony import */ var _VideoSettings_scss__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./VideoSettings.scss */ "./src/components/VideoSettings/VideoSettings.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
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
          onChange: value => handleSettingChange('view_count', value),
          checked: !!displayAttributes.view_count
        })
      })]
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
              beforeIcon: _assets_icon__WEBPACK_IMPORTED_MODULE_3__.volumeDown,
              afterIcon: _assets_icon__WEBPACK_IMPORTED_MODULE_3__.volumeUp,
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
      children: [!isBlockEditor && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("div", {
        className: "videopack-color-section",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("p", {
          className: "videopack-settings-section-title",
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Title overlay', 'video-embed-thumbnail-generator')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("div", {
          className: "videopack-color-flex-row",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_5__["default"], {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Text', 'video-embed-thumbnail-generator'),
              value: displayAttributes.title_color,
              onChange: value => handleSettingChange('title_color', value),
              colors: THEME_COLORS,
              fallbackValue: PLAYER_COLOR_FALLBACKS.title_color
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_5__["default"], {
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
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_5__["default"], {
              label: displayAttributes.embed_method === 'WordPress Default' ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Play Button', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Play Button (Accent)', 'video-embed-thumbnail-generator'),
              value: displayAttributes.play_button_color,
              onChange: value => handleSettingChange('play_button_color', value),
              colors: THEME_COLORS,
              fallbackValue: PLAYER_COLOR_FALLBACKS.play_button_color
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_5__["default"], {
              label: displayAttributes.embed_method === 'WordPress Default' ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Play Button (hover)', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Play Button Icon', 'video-embed-thumbnail-generator'),
              value: displayAttributes.play_button_icon_color,
              onChange: value => handleSettingChange('play_button_icon_color', value),
              colors: THEME_COLORS,
              fallbackValue: PLAYER_COLOR_FALLBACKS.play_button_icon_color
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_5__["default"], {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Control Bar Background', 'video-embed-thumbnail-generator'),
              value: displayAttributes.control_bar_bg_color,
              onChange: value => handleSettingChange('control_bar_bg_color', value),
              colors: THEME_COLORS,
              fallbackValue: PLAYER_COLOR_FALLBACKS.control_bar_bg_color
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_5__["default"], {
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
    }), !isBlockEditor && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_WatermarkSettingsPanel_WatermarkSettingsPanel_js__WEBPACK_IMPORTED_MODULE_6__["default"], {
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
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_TextTracks_TextTracks_js__WEBPACK_IMPORTED_MODULE_7__["default"], {
      tracks: displayAttributes.text_tracks || [],
      onChange: newTracks => handleSettingChange('text_tracks', newTracks)
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Sharing', 'video-embed-thumbnail-generator'),
      initialOpen: false,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelRow, {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Allow embedding on other sites', 'video-embed-thumbnail-generator'),
          onChange: value => handleSettingChange('embeddable', value),
          checked: !!displayAttributes.embeddable
        })
      }), displayAttributes.embeddable && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.Fragment, {
        children: !isBlockEditor && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.Fragment, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelRow, {
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
              __nextHasNoMarginBottom: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Download link', 'video-embed-thumbnail-generator'),
              onChange: value => handleSettingChange('downloadlink', value),
              checked: !!displayAttributes.downloadlink
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelRow, {
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
              __nextHasNoMarginBottom: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Embed code', 'video-embed-thumbnail-generator'),
              onChange: value => handleSettingChange('embedcode', value),
              checked: !!displayAttributes.embedcode
            })
          })]
        })
      })]
    })]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (VideoSettings);

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
/* harmony import */ var _components_WatermarkPositioner__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./components/WatermarkPositioner */ "./src/components/WatermarkSettingsPanel/components/WatermarkPositioner.js");
/* harmony import */ var _WatermarkSettingsPanel_scss__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./WatermarkSettingsPanel.scss */ "./src/components/WatermarkSettingsPanel/WatermarkSettingsPanel.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__);
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
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
    ...panelProps,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_features_settings_components_SelectFromLibrary__WEBPACK_IMPORTED_MODULE_4__["default"], {
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
    }), children, watermarkSettings?.url && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Watermark Settings', 'video-embed-thumbnail-generator'),
      opened: settingsPanelOpen,
      onToggle: () => setSettingsPanelOpen(!settingsPanelOpen),
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
        className: "videopack-watermark-settings",
        children: [baseFrame && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_components_WatermarkPositioner__WEBPACK_IMPORTED_MODULE_5__["default"], {
          baseFrame: baseFrame,
          settings: watermarkSettings,
          onChange: onChange
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.RangeControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Scale (%)', 'video-embed-thumbnail-generator'),
          value: Number(watermarkSettings.scale || 50),
          onChange: value => updateSetting('scale', value),
          min: 1,
          max: 100,
          step: 0.01,
          __nextHasNoMarginBottom: true,
          disabled: disabled
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Flex, {
          gap: 4,
          align: "flex-end",
          justify: "flex-start",
          style: {
            marginBottom: '10px'
          },
          className: "videopack-watermark-row",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.FlexItem, {
            className: "videopack-alignment-control",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
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
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.FlexItem, {
            className: "videopack-offset-control",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.RangeControl, {
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
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Flex, {
          gap: 4,
          align: "flex-end",
          justify: "flex-start",
          className: "videopack-watermark-row",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.FlexItem, {
            className: "videopack-alignment-control",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
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
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.FlexItem, {
            className: "videopack-offset-control",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.RangeControl, {
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

/***/ "./src/components/WatermarkSettingsPanel/components/WatermarkPositioner.js"
/*!*********************************************************************************!*\
  !*** ./src/components/WatermarkSettingsPanel/components/WatermarkPositioner.js ***!
  \*********************************************************************************/
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
  baseFrame,
  settings,
  onChange
}) => {
  const containerRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);
  const watermarkRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);
  const [watermarkImage, setWatermarkImage] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [isDragging, setIsDragging] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [isResizing, setIsResizing] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [transientScale, setTransientScale] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [transientPosition, setTransientPosition] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null); // { left, top } in pixels
  const [isFocused, setIsFocused] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(true);
  const dragStartRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)({
    x: 0,
    y: 0,
    initialLeft: 0,
    initialTop: 0
  });
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (settings.url) {
      const img = new Image();
      img.onload = () => setWatermarkImage(img);
      img.src = settings.url;
    }
  }, [settings.url]);
  const {
    left: propLeft,
    top: propTop,
    width: wmWidth,
    height: wmHeight
  } = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => {
    if (!baseFrame || !watermarkImage) {
      return {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        aspectRatio: 1
      };
    }
    const containerWidth = baseFrame.width;
    const containerHeight = baseFrame.height;

    // Use transientScale if available, else settings.scale
    const scale = transientScale !== null ? transientScale : Number(settings.scale || 50);
    const w = containerWidth * scale / 100;
    const aspectRatio = watermarkImage.width / watermarkImage.height;
    const h = w / aspectRatio;
    const xOffset = Number(settings.x || 0);
    const yOffset = Number(settings.y || 0);
    const hOffsetPx = containerWidth * xOffset / 100;
    const vOffsetPx = containerHeight * yOffset / 100;
    let l = 0;
    let t = 0;
    switch (settings.align) {
      case 'left':
        l = hOffsetPx;
        break;
      case 'right':
        l = containerWidth - w - hOffsetPx;
        break;
      case 'center':
      default:
        l = (containerWidth - w) / 2 - hOffsetPx;
        break;
    }
    switch (settings.valign) {
      case 'top':
        t = vOffsetPx;
        break;
      case 'bottom':
        t = containerHeight - h - vOffsetPx;
        break;
      case 'center':
      default:
        t = (containerHeight - h) / 2 - vOffsetPx;
        break;
    }
    return {
      left: l,
      top: t,
      width: w,
      height: h,
      aspectRatio
    };
  }, [baseFrame, watermarkImage, settings, transientScale]);
  const handleMouseDown = e => {
    e.preventDefault();
    if (watermarkRef.current) {
      watermarkRef.current.focus();
    }
    setIsDragging(true);
    // Initialize transient position with the current position derived from props
    setTransientPosition({
      left: propLeft,
      top: propTop
    });
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialLeft: propLeft,
      initialTop: propTop
    };
  };
  const handleResizeStart = (e, handle) => {
    e.preventDefault();
    e.stopPropagation();
    if (watermarkRef.current) {
      watermarkRef.current.focus();
    }
    setIsResizing(true);
    const currentScale = transientScale !== null ? transientScale : Number(settings.scale || 50);
    setTransientScale(currentScale);
    setTransientPosition({
      left: propLeft,
      top: propTop
    });
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialLeft: propLeft,
      initialTop: propTop,
      initialScale: currentScale,
      handle,
      aspectRatio: wmWidth / wmHeight
    };
  };
  const finalizeInteraction = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
    if (!isDragging && !isResizing) {
      return;
    }
    const wasResizing = isResizing;

    // The transient state is not set until a drag/resize starts.
    // If the user just clicks without moving, there's nothing to finalize.
    if (!baseFrame || !watermarkImage || !transientPosition) {
      setTransientPosition(null);
      setTransientScale(null);
      return;
    }
    setIsDragging(false);
    setIsResizing(false);
    const finalLeft = transientPosition.left;
    const finalTop = transientPosition.top;
    const containerWidth = baseFrame.width;
    const containerHeight = baseFrame.height;
    const finalScale = wasResizing && transientScale !== null ? transientScale : Number(settings.scale || 50);

    // Recalculate dimensions based on finalScale for alignment logic
    const w = containerWidth * finalScale / 100;
    const aspectRatio = watermarkImage.width / watermarkImage.height;
    const h = w / aspectRatio;

    // Determine Horizontal Alignment and Offset
    let newAlign = 'center';
    let newX = 0;
    const centerPosH = (containerWidth - w) / 2;
    if (finalLeft > centerPosH) {
      newAlign = 'right';
      newX = (containerWidth - w - finalLeft) / containerWidth * 100;
    } else {
      const distToLeft = finalLeft;
      const distToCenter = centerPosH - finalLeft;
      if (distToLeft < distToCenter) {
        newAlign = 'left';
        newX = finalLeft / containerWidth * 100;
      } else {
        newAlign = 'center';
        newX = distToCenter / containerWidth * 100;
      }
    }

    // Determine Vertical Alignment and Offset
    let newValign = 'center';
    let newY = 0;
    const centerPosV = (containerHeight - h) / 2;
    if (finalTop > centerPosV) {
      newValign = 'bottom';
      newY = (containerHeight - h - finalTop) / containerHeight * 100;
    } else {
      const distToTop = finalTop;
      const distToCenter = centerPosV - finalTop;
      if (distToTop < distToCenter) {
        newValign = 'top';
        newY = finalTop / containerHeight * 100;
      } else {
        newValign = 'center';
        newY = distToCenter / containerHeight * 100;
      }
    }
    onChange({
      ...settings,
      scale: Math.round(finalScale * 100) / 100,
      align: newAlign,
      valign: newValign,
      x: Math.round(newX * 100) / 100,
      y: Math.round(newY * 100) / 100
    });
    setTransientPosition(null);
    setTransientScale(null);
  }, [isDragging, isResizing, baseFrame, watermarkImage, transientPosition, transientScale, settings, onChange]);
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
    const currentLeft = transientPosition ? transientPosition.left : propLeft;
    const currentTop = transientPosition ? transientPosition.top : propTop;
    let newLeft = currentLeft;
    let newTop = currentTop;
    const step = e.shiftKey ? 10 : 1; // Pixel-based step

    switch (e.key) {
      case 'ArrowUp':
        newTop -= step;
        break;
      case 'ArrowDown':
        newTop += step;
        break;
      case 'ArrowLeft':
        newLeft -= step;
        break;
      case 'ArrowRight':
        newLeft += step;
        break;
    }

    // Constrain
    const containerWidth = baseFrame.width;
    const containerHeight = baseFrame.height;
    newLeft = Math.max(0, Math.min(newLeft, containerWidth - wmWidth));
    newTop = Math.max(0, Math.min(newTop, containerHeight - wmHeight));
    setTransientPosition({
      left: newLeft,
      top: newTop
    });
  };
  const handleResizeKeyDown = (e, handle) => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    const currentScale = transientScale !== null ? transientScale : Number(settings.scale || 50);
    const {
      left: currentLeft,
      top: currentTop
    } = transientPosition || {
      left: propLeft,
      top: propTop
    };
    const step = e.shiftKey ? 5 : 1; // Scale step
    let scaleDelta = 0;
    const containerWidth = baseFrame.width;

    // For SE and NW handles, right/down increases size.
    if (handle === 'se' || handle === 'nw') {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        scaleDelta = handle === 'se' ? step : -step;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        scaleDelta = -step;
      }
    }
    // For SW and NE handles, right/up increases size.
    else if (handle === 'sw' || handle === 'ne') {
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        scaleDelta = step;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        scaleDelta = -step;
      }
    }
    let newScale = currentScale + scaleDelta;
    newScale = Math.round(newScale * 100) / 100;
    newScale = Math.max(1, Math.min(100, newScale));
    if (newScale === currentScale) {
      return;
    }
    const aspectRatio = wmWidth / wmHeight;
    const oldWidth = containerWidth * currentScale / 100;
    const oldHeight = oldWidth / aspectRatio;
    const newWidth = containerWidth * newScale / 100;
    const newHeight = newWidth / aspectRatio;
    let newLeft = currentLeft;
    let newTop = currentTop;
    if (handle === 'sw' || handle === 'nw') {
      newLeft = currentLeft + (oldWidth - newWidth);
    }
    if (handle === 'ne' || handle === 'nw') {
      newTop = currentTop + (oldHeight - newHeight);
    }
    setTransientScale(newScale);
    setTransientPosition({
      left: newLeft,
      top: newTop
    });
  };
  const handleMouseMove = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(e => {
    if (!isDragging && !isResizing || !baseFrame || !containerRef.current) {
      return;
    }
    const dragStart = dragStartRef.current;
    const containerWidth = baseFrame.width;
    const containerHeight = baseFrame.height;

    // Get the on-screen dimensions of the container
    const rect = containerRef.current.getBoundingClientRect();

    // Calculate the scaling factor between the on-screen container and the base canvas
    const scaleX = containerWidth / rect.width;
    const scaleY = containerHeight / rect.height;
    const dxCanvas = (e.clientX - dragStart.x) * scaleX;
    const dyCanvas = (e.clientY - dragStart.y) * scaleY;
    if (isDragging) {
      let newLeft = dragStart.initialLeft + dxCanvas;
      let newTop = dragStart.initialTop + dyCanvas;

      // Constrain to container
      newLeft = Math.max(0, Math.min(newLeft, containerWidth - wmWidth));
      newTop = Math.max(0, Math.min(newTop, containerHeight - wmHeight));
      setTransientPosition({
        left: newLeft,
        top: newTop
      });
    } else if (isResizing) {
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
      // Constrain scale
      newScale = Math.max(1, Math.min(100, newScale));

      // Recalculate dimensions based on constrained scale
      newWidth = containerWidth * newScale / 100;
      const newHeight = newWidth / aspectRatio;
      let newLeft = initialLeft;
      let newTop = initialTop;
      if (handle === 'sw') {
        newLeft = initialLeft + (initialWidth - newWidth);
      } else if (handle === 'ne') {
        newTop = initialTop + (initialHeight - newHeight);
      } else if (handle === 'nw') {
        newLeft = initialLeft + (initialWidth - newWidth);
        newTop = initialTop + (initialHeight - newHeight);
      }
      setTransientScale(newScale);
      setTransientPosition({
        left: newLeft,
        top: newTop
      });
    }
  }, [isDragging, isResizing, baseFrame, wmWidth, wmHeight]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove, {
        passive: true
      });
      window.addEventListener('mouseup', finalizeInteraction, {
        once: true
      });
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', finalizeInteraction);
    };
  }, [isDragging, isResizing, handleMouseMove, finalizeInteraction]);
  if (!baseFrame || !watermarkImage) {
    return null;
  }
  const containerWidth = baseFrame.width;
  const containerHeight = baseFrame.height;

  // Use transient position if dragging, otherwise use position derived from props
  const currentLeft = transientPosition ? transientPosition.left : propLeft;
  const currentTop = transientPosition ? transientPosition.top : propTop;
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
    ref: containerRef,
    style: {
      position: 'relative',
      width: '100%',
      aspectRatio: `${containerWidth} / ${containerHeight}`,
      backgroundImage: `url(${baseFrame.toDataURL()})`,
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      border: '1px solid #ddd',
      marginBottom: '1em',
      overflow: 'hidden',
      userSelect: 'none'
    },
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
      ref: watermarkRef,
      style: {
        position: 'absolute',
        left: `${currentLeft / containerWidth * 100}%`,
        top: `${currentTop / containerHeight * 100}%`,
        width: `${wmWidth / containerWidth * 100}%`,
        height: `${wmHeight / containerHeight * 100}%`
      },
      role: "button",
      tabIndex: "0",
      "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Move watermark', 'video-embed-thumbnail-generator'),
      onMouseDown: handleMouseDown,
      onKeyDown: handleDragKeyDown,
      onFocus: handleFocus,
      onBlur: handleBlur,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("img", {
        src: settings.url,
        alt: "Watermark",
        style: {
          width: '100%',
          height: '100%',
          cursor: isDragging ? 'grabbing' : 'move',
          userSelect: 'none',
          display: 'block'
        },
        draggable: false
      }), isFocused && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.Fragment, {
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
    })
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (WatermarkPositioner);

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
const metaKeys = ['width', 'height', 'downloadlink', 'autoplay', 'loop', 'muted', 'controls', 'volume', 'preload', 'playback_rate', 'playsinline', 'right_click', 'gifmode', 'fixed_aspect', 'align', 'legacy_dimensions', 'resize', 'fullwidth', 'embeddable', 'embedcode', 'overlay_title', 'view_count', 'watermark', 'watermark_link_to', 'watermark_url', 'poster', 'poster_id', 'total_thumbnails', 'track', 'title_color', 'title_background_color', 'play_button_color', 'play_button_icon_color', 'control_bar_bg_color', 'control_bar_color'];

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
    } else {
      const processedValue = key === 'title' && value === '' ? undefined : value;
      updatedAttrs = {
        ...attributes,
        [key]: processedValue
      };
    }
    setAttributes(updatedAttrs);
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
    play_button_icon_color: settings?.play_button_icon_color || '#ffffff',
    control_bar_bg_color: settings?.control_bar_bg_color || '#2b333f',
    control_bar_color: settings?.control_bar_color || '#ffffff',
    pagination_color: settings?.pagination_color || '#1e1e1e',
    pagination_background_color: settings?.pagination_background_color || '#ffffff',
    pagination_active_bg_color: settings?.pagination_active_bg_color || '#1e1e1e',
    pagination_active_color: settings?.pagination_active_color || '#ffffff'
  };
  if (embed_method === 'WordPress Default') {
    fallbacks.title_background_color = 'rgba(40, 40, 40, 0.95)';
    fallbacks.control_bar_bg_color = 'rgba(0, 0, 0, 0.35)';
    fallbacks.play_button_color = '#ffffff';
    fallbacks.play_button_icon_color = '#ffffff';
  } else if (embed_method?.startsWith('Video.js')) {
    // Default skin (vjs-theme-videopack) defaults
    fallbacks.play_button_color = '#2b333f'; // Videopack Grey accent

    switch (skin) {
      case 'vjs-theme-city':
        fallbacks.title_background_color = '#bf3b4d';
        fallbacks.play_button_color = '#bf3b4d';
        fallbacks.control_bar_bg_color = '#000000';
        break;
      case 'vjs-theme-fantasy':
        fallbacks.title_background_color = '#9f44b4';
        fallbacks.play_button_color = '#9f44b4';
        fallbacks.play_button_icon_color = '#9f44b4';
        break;
      case 'vjs-theme-forest':
        fallbacks.title_background_color = '#6fb04e';
        fallbacks.play_button_color = '#6fb04e';
        fallbacks.control_bar_bg_color = 'transparent';
        break;
      case 'vjs-theme-sea':
        fallbacks.title_background_color = '#4176bc';
        fallbacks.play_button_color = '#4176bc';
        fallbacks.play_button_icon_color = '#ffffff';
        fallbacks.control_bar_bg_color = 'rgba(255, 255, 255, 0.4)';
        break;
      case 'kg-video-js-skin':
        fallbacks.title_background_color = '#000000';
        fallbacks.play_button_color = '#000000';
        fallbacks.control_bar_bg_color = '#000000';
        break;
    }
  }
  return fallbacks;
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
  const booleans = ['autoplay', 'loop', 'muted', 'controls', 'playback_rate', 'playsinline', 'downloadlink', 'overlay_title', 'nativecontrolsfortouch', 'pauseothervideos', 'right_click', 'auto_res', 'auto_codec'];
  booleans.forEach(key => {
    if (Object.prototype.hasOwnProperty.call(normalized, key)) {
      normalized[key] = normalized[key] === 'true' || normalized[key] === true;
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

/***/ "./src/blocks/videopack-video/style.scss"
/*!***********************************************!*\
  !*** ./src/blocks/videopack-video/style.scss ***!
  \***********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "./src/components/AdditionalFormats/AdditionalFormats.scss"
/*!*****************************************************************!*\
  !*** ./src/components/AdditionalFormats/AdditionalFormats.scss ***!
  \*****************************************************************/
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

/***/ "./src/components/CompactColorPicker/CompactColorPicker.scss"
/*!*******************************************************************!*\
  !*** ./src/components/CompactColorPicker/CompactColorPicker.scss ***!
  \*******************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "./src/components/TextTracks/TextTracks.scss"
/*!***************************************************!*\
  !*** ./src/components/TextTracks/TextTracks.scss ***!
  \***************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "./src/components/Thumbnails/Thumbnails.scss"
/*!***************************************************!*\
  !*** ./src/components/Thumbnails/Thumbnails.scss ***!
  \***************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "./src/components/VideoSettings/VideoSettings.scss"
/*!*********************************************************!*\
  !*** ./src/components/VideoSettings/VideoSettings.scss ***!
  \*********************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "./src/components/WatermarkSettingsPanel/WatermarkSettingsPanel.scss"
/*!***************************************************************************!*\
  !*** ./src/components/WatermarkSettingsPanel/WatermarkSettingsPanel.scss ***!
  \***************************************************************************/
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

/***/ "./src/blocks/videopack-video/block.json"
/*!***********************************************!*\
  !*** ./src/blocks/videopack-video/block.json ***!
  \***********************************************/
(module) {

module.exports = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"videopack/videopack-video","title":"Videopack Video Player","category":"media","icon":"format-video","description":"Embed a single video with Videopack features.","usesContext":["postId","videopack/skin","videopack/view_count","videopack/overlay_title","videopack/title_color","videopack/title_background_color","videopack/overlay_title","videopack/downloadlink","videopack/embeddable","videopack/play_button_color","videopack/play_button_icon_color","videopack/control_bar_bg_color","videopack/control_bar_color"],"providesContext":{"postId":"id","videopack/skin":"skin","videopack/autoplay":"autoplay","videopack/controls":"controls","videopack/loop":"loop","videopack/muted":"muted","videopack/playsinline":"playsinline","videopack/poster":"poster","videopack/preload":"preload","videopack/src":"src","videopack/volume":"volume","videopack/auto_res":"auto_res","videopack/auto_codec":"auto_codec","videopack/sources":"sources","videopack/source_groups":"source_groups","videopack/text_tracks":"text_tracks","videopack/playback_rate":"playback_rate","videopack/watermark":"watermark","videopack/watermark_styles":"watermark_styles","videopack/watermark_link_to":"watermark_link_to","videopack/default_ratio":"default_ratio","videopack/fixed_aspect":"fixed_aspect","videopack/fullwidth":"fullwidth","videopack/play_button_color":"play_button_color","videopack/play_button_icon_color":"play_button_icon_color","videopack/control_bar_bg_color":"control_bar_bg_color","videopack/control_bar_color":"control_bar_color","videopack/title_color":"title_color","videopack/title_background_color":"title_background_color","videopack/overlay_title":"overlay_title","videopack/view_count":"view_count","videopack/downloadlink":"downloadlink","videopack/embeddable":"embeddable","videopack/showCaption":"showCaption","videopack/showBackground":"showBackground","videopack/textAlign":"textAlign","videopack/embed_method":"embed_method","videopack/position":"title_position","videopack/embedlink":"embedlink"},"supports":{"html":false,"align":true,"dimensions":{"aspectRatio":false,"height":false,"minHeight":false,"width":false},"spacing":{"margin":true,"padding":true},"filter":{"duotone":true}},"selectors":{"filter":{"duotone":".wp-block-videopack-videopack-video .videopack-wrapper .vjs-poster img, .wp-block-videopack-videopack-video .videopack-wrapper .mejs-poster"}},"example":{"attributes":{"src":"videopack-preview-video","title":"Sample Video","overlay_title":true}},"attributes":{"id":{"type":"number"},"src":{"type":"string"},"poster":{"type":"string"},"title":{"type":"string"},"caption":{"type":"string"},"width":{"type":"number"},"height":{"type":"number"},"skin":{"type":"string"},"autoplay":{"type":"boolean","default":false},"controls":{"type":"boolean","default":true},"loop":{"type":"boolean","default":false},"muted":{"type":"boolean","default":false},"playsinline":{"type":"boolean","default":false},"preload":{"type":"string","default":"metadata"},"volume":{"type":"number","default":1},"auto_res":{"type":"string"},"auto_codec":{"type":"string"},"sources":{"type":"array","default":[]},"source_groups":{"type":"object","default":{}},"text_tracks":{"type":"array","default":[]},"playback_rate":{"type":"boolean","default":false},"watermark":{"type":"string"},"watermark_styles":{"type":"object"},"watermark_link_to":{"type":"string"},"default_ratio":{"type":"string","default":"16 / 9"},"fixed_aspect":{"type":"string","default":"false"},"fullwidth":{"type":"boolean","default":false},"play_button_color":{"type":"string"},"play_button_icon_color":{"type":"string"},"control_bar_bg_color":{"type":"string"},"control_bar_color":{"type":"string"},"title_color":{"type":"string"},"title_background_color":{"type":"string"},"textAlign":{"type":"string","default":"left"},"downloadlink":{"type":"boolean","default":false},"overlay_title":{"type":"boolean","default":true},"view_count":{"type":"boolean","default":false},"embeddable":{"type":"boolean","default":false},"embedlink":{"type":"string"},"embed_method":{"type":"string","default":"Video.js"},"showCaption":{"type":"boolean","default":false},"showBackground":{"type":"boolean","default":true},"title_position":{"type":"string","default":"top"}},"textdomain":"video-embed-thumbnail-generator","editorScript":"file:./index.js","editorStyle":"file:./index.css","style":"file:./style-index.css"}');

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
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
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
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"blocks/videopack-video/index": 0,
/******/ 			"blocks/videopack-video/style-index": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
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
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = globalThis["webpackChunkvideopack_admin"] = globalThis["webpackChunkvideopack_admin"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["blocks/videopack-video/style-index"], () => (__webpack_require__("./src/blocks/videopack-video/index.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=index.js.map