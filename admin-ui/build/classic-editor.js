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
/* harmony export */   videopackCaption: () => (/* binding */ videopackCaption),
/* harmony export */   videopackCollection: () => (/* binding */ videopackCollection),
/* harmony export */   videopackDuration: () => (/* binding */ videopackDuration),
/* harmony export */   videopackGallery: () => (/* binding */ videopackGallery),
/* harmony export */   videopackList: () => (/* binding */ videopackList),
/* harmony export */   videopackLoop: () => (/* binding */ videopackLoop),
/* harmony export */   videopackPagination: () => (/* binding */ videopackPagination),
/* harmony export */   videopackPlayButton: () => (/* binding */ videopackPlayButton),
/* harmony export */   videopackPlayer: () => (/* binding */ videopackPlayer),
/* harmony export */   videopackThumbnail: () => (/* binding */ videopackThumbnail),
/* harmony export */   videopackTitle: () => (/* binding */ videopackTitle),
/* harmony export */   videopackVideo: () => (/* binding */ videopackVideo),
/* harmony export */   videopackViewCount: () => (/* binding */ videopackViewCount),
/* harmony export */   videopackWatermark: () => (/* binding */ videopackWatermark),
/* harmony export */   volumeDown: () => (/* binding */ volumeDown),
/* harmony export */   volumeUp: () => (/* binding */ volumeUp)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);

const videopack = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("g", {
    transform: "rotate(-45 200.518 199.773)",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("circle", {
      cx: 200.52,
      cy: 199.77,
      r: 182.56,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("circle", {
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
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M98.37 124.52h45.81l57.42 98.69 55.57-98.69h47.48L201.51 303.03 98.37 125.9"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m257.17 124.52-55.57 98.69-57.42-98.69"
  })]
});
const videopackCaption = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    d: "M43.63 341.01c-12.65 0-23-9.2-23-22.61v-.77c0-13.03 9.97-22.61 23-22.61s23.38 9.2 23.38 22.61v.77c0 13.42-9.97 22.61-23.38 22.61m69.37 0c-12.65 0-23-9.2-23-22.61v-.77c0-13.03 9.97-22.61 23-22.61s23.38 9.2 23.38 22.61v.77c0 13.42-9.97 22.61-23.38 22.61m69.37 0c-12.65 0-23-9.2-23-22.61v-.77c0-13.03 9.97-22.61 23-22.61s23.38 9.2 23.38 22.61v.77c0 13.42-9.97 22.61-23.38 22.61",
    style: {
      fill: '#cd0000'
    }
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("circle", {
    cx: 198.31,
    cy: 159.72,
    r: 69.82,
    style: {
      fill: '#fff'
    }
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("circle", {
    cx: 198.31,
    cy: 159.72,
    r: 69.82,
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: '11.47px'
    }
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M169.53 198.78v-17.51l37.74-21.96-37.74-21.26v-18.16l68.27 39.45-67.74 39.44"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m169.53 138.05 37.74 21.26-37.74 21.96"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 19
    },
    d: "M14.4 55.65h372.22V264.9H14.4z"
  })]
});
const videopackCollection = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 14
    },
    d: "M12.01 84.61h170.53v93.84H12.01zm210.09 0h170.53v93.84H222.1zM12.01 221.62h170.53v93.84H12.01zm210.09 0h170.53v93.84H222.1z"
  })
});
const videopackDuration = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    d: "m67.87 129.5-8.65 32.21h26.11l8.65-32.21h15.26l-8.65 32.21h17.29v12.71H97.2L90.59 199h18.99v12.71H87.2l-8.31 31.36H63.63l8.31-31.36H45.83l-8.31 31.36H22.26l8.31-31.36H12.43V199h21.53l6.61-24.58H20.74v-12.71h23.22l8.65-32.21zm-18.65 69.51h26.11l6.61-24.58H55.83zm94.08-5.09c-5.59 0-10.17-4.07-10.17-10v-.34c0-5.76 4.41-10 10.17-10s10.34 4.07 10.34 10v.34c0 5.93-4.41 10-10.34 10m0 50.86c-5.59 0-10.17-4.07-10.17-10v-.34c0-5.76 4.41-10 10.17-10s10.34 4.07 10.34 10v.34c0 5.93-4.41 10-10.34 10m81.03-115.28-8.65 32.21h26.11l8.65-32.21h15.26l-8.65 32.21h17.29v12.71h-20.68L247.05 199h18.99v12.71h-22.38l-8.31 31.36h-15.26l8.31-31.36h-26.11l-8.31 31.36h-15.26l8.31-31.36h-18.14V199h21.53l6.61-24.58H177.2v-12.71h23.22l8.65-32.21zm-18.65 69.51h26.11l6.61-24.58h-26.11zm135.96-69.51-8.65 32.21h26.11l8.65-32.21h15.26l-8.65 32.21h17.29v12.71h-20.68L364.36 199h18.99v12.71h-22.38l-8.31 31.36H337.4l8.31-31.36H319.6l-8.31 31.36h-15.26l8.31-31.36H286.2V199h21.53l6.61-24.58h-19.83v-12.71h23.22l8.65-32.21zm-18.65 69.51h26.11l6.61-24.58H329.6z",
    style: {
      fill: '#cd0000'
    }
  })
});
const videopackGallery = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 14
    },
    d: "M8.14 84.54h170.53v93.84H8.14z"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("g", {
    transform: "rotate(-5.65 92.234 131.62)",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("circle", {
      cx: 92.16,
      cy: 131.51,
      r: 34.87,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("circle", {
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
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M77.79 151.02v-8.75l18.85-10.97-18.85-10.61v-9.07l34.1 19.7-33.84 19.7"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m77.79 120.69 18.85 10.61-18.85 10.97"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 14
    },
    d: "M220.87 84.54H391.4v93.84H220.87z"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("g", {
    transform: "rotate(-5.65 309.192 131.66)",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("circle", {
      cx: 308.89,
      cy: 131.51,
      r: 34.87,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("circle", {
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
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M294.51 151.02v-8.75l18.85-10.97-18.85-10.61v-9.07l34.1 19.7-33.83 19.7"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m294.51 120.69 18.85 10.61-18.85 10.97"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 14
    },
    d: "M8.14 221.62h170.53v93.84H8.14z"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("g", {
    transform: "rotate(-5.65 92.268 268.846)",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("circle", {
      cx: 92.16,
      cy: 268.58,
      r: 34.87,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("circle", {
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
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M77.79 288.09v-8.75l18.85-10.96-18.85-10.62v-9.07l34.1 19.7-33.84 19.7"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m77.79 257.76 18.85 10.62-18.85 10.96"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 14
    },
    d: "M220.87 221.62H391.4v93.84H220.87z"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("g", {
    transform: "rotate(-5.65 309.13 268.78)",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("circle", {
      cx: 308.89,
      cy: 268.58,
      r: 34.87,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("circle", {
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
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M294.51 288.09v-8.75l18.85-10.96-18.85-10.62v-9.07l34.1 19.7-33.83 19.7"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m294.51 257.76 18.85 10.62-18.85 10.96"
  })]
});
const videopackList = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 14
    },
    d: "M111.79 6.56h185.1v101.85h-185.1z"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("g", {
    transform: "rotate(-5.65 205.384 57.57)",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("circle", {
      cx: 205.16,
      cy: 57.53,
      r: 37.85,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("circle", {
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
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M189.56 78.71v-9.49l20.46-11.91-20.46-11.52v-9.84l37 21.38-36.72 21.38"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m189.56 45.79 20.46 11.52-20.46 11.91"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 14
    },
    d: "M111.79 148.88h185.1v101.85h-185.1z"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("g", {
    transform: "rotate(-5.65 205.365 199.974)",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("circle", {
      cx: 205.16,
      cy: 199.85,
      r: 37.85,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("circle", {
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
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M189.56 221.03v-9.5l20.46-11.9-20.46-11.52v-9.85l37 21.39-36.72 21.38"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m189.56 188.11 20.46 11.52-20.46 11.9"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 14
    },
    d: "M111.79 290.2h185.1v101.85h-185.1z"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("g", {
    transform: "rotate(-5.65 205.392 341.466)",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("circle", {
      cx: 205.16,
      cy: 341.17,
      r: 37.85,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("circle", {
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
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M189.56 362.35v-9.5l20.46-11.9-20.46-11.52v-9.85l37 21.38-36.72 21.39"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m189.56 329.43 20.46 11.52-20.46 11.9"
  })]
});
const videopackLoop = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    d: "M352.41 199.29c-.01 35.29-28.64 63.89-63.93 63.88-29.13-.01-54.56-19.72-61.85-47.92l-.17-.73-.24-.71-15.43-45.44-.1.05c-17.16-54.81-75.5-85.33-130.31-68.17-43.31 13.56-72.82 53.64-72.92 99.02-.01 57.4 46.51 103.95 103.91 103.97 13 0 25.88-2.43 37.98-7.18l-14.62-37.27c-32.86 12.87-69.94-3.33-82.81-36.19s3.33-69.94 36.19-82.81 69.94 3.33 82.81 36.19c.94 2.39 1.73 4.84 2.37 7.33l.24-.07 14.5 42.78c14.88 55.47 71.91 88.38 127.38 73.5 45.38-12.17 76.96-53.25 77.05-100.24.01-57.4-46.51-103.95-103.92-103.96-12.97 0-25.82 2.42-37.9 7.15l14.59 37.29c32.87-12.85 69.94 3.39 82.78 36.26 2.9 7.41 4.38 15.3 4.38 23.26",
    style: {
      fill: '#cd0000'
    }
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M90.65 230.42v-13.6l29.3-17.05-29.3-16.49v-14.1l52.99 30.62-52.58 30.62"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m90.65 183.28 29.3 16.49-29.3 17.05"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M266.39 230.42v-13.6l29.29-17.05-29.29-16.49v-14.1l52.99 30.62-52.58 30.62"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m266.39 183.28 29.29 16.49-29.29 17.05"
  })]
});
const videopackPagination = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("rect", {
    x: 4,
    y: 127.95,
    width: 117.18,
    height: 117.18,
    rx: 7,
    ry: 7,
    style: {
      fill: '#cd0000'
    }
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    d: "M69.1 210.32h-6.2v-38.03c-2.51 1.67-6.39 2.51-11.64 2.51v-4.88c7.59 0 11.94-2.92 13.06-8.77h4.78v49.18Z",
    style: {
      fill: '#fff'
    }
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("rect", {
    x: 145.36,
    y: 131.95,
    width: 109.18,
    height: 109.18,
    rx: 3,
    ry: 3,
    style: {
      fill: '#fff'
    }
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    d: "M250.54 135.95v101.18H149.36V135.95zm1-8H148.36c-3.87 0-7 3.13-7 7v103.18c0 3.87 3.13 7 7 7h103.18c3.87 0 7-3.13 7-7V134.95c0-3.87-3.13-7-7-7",
    style: {
      fill: '#cd0000'
    }
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    d: "M215.24 210.32h-32.03c0-2.95.91-5.76 2.74-8.44s5.17-5.99 10.04-9.91 8.21-7.06 10.01-9.4 2.7-5 2.7-7.97c0-2.66-.77-4.75-2.31-6.28s-3.71-2.29-6.5-2.29c-2.42 0-4.49.77-6.2 2.31s-2.68 3.8-2.9 6.79h-6.43c.35-4.24 1.92-7.64 4.7-10.17 2.78-2.54 6.44-3.81 10.97-3.81 4.82 0 8.53 1.29 11.15 3.88 2.62 2.58 3.92 5.82 3.92 9.71 0 3.52-.97 6.62-2.9 9.32-1.94 2.69-5.78 6.44-11.53 11.23q-8.625 7.185-8.79 9.3h23.35v5.74Z",
    style: {
      fill: '#cd0000'
    }
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("rect", {
    x: 282.73,
    y: 131.95,
    width: 109.18,
    height: 109.18,
    rx: 3,
    ry: 3,
    style: {
      fill: '#fff'
    }
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    d: "M387.91 135.95v101.18H286.73V135.95zm1-8H285.73c-3.87 0-7 3.13-7 7v103.18c0 3.87 3.13 7 7 7h103.18c3.87 0 7-3.13 7-7V134.95c0-3.87-3.13-7-7-7",
    style: {
      fill: '#cd0000'
    }
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    d: "m325.77 171.83 4.27-4.39 26.58 22.19-26.58 22.19-4.27-4.35 21.55-17.76z",
    style: {
      fill: '#cd0000'
    }
  })]
});
const videopackPlayButton = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("g", {
    transform: "rotate(-45 205.37 193.523)",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("circle", {
      cx: 205.37,
      cy: 193.52,
      r: 87.51,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("circle", {
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
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M169.29 242.49v-21.96l47.31-27.52-47.31-26.64V143.6l85.58 49.45-84.91 49.44"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m169.29 166.37 47.31 26.64-47.31 27.52"
  })]
});
const videopackPlayer = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("circle", {
    cx: 197.8,
    cy: 200.99,
    r: 69.82,
    style: {
      fill: '#fff'
    }
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("circle", {
    cx: 197.8,
    cy: 200.99,
    r: 69.82,
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: '11.47px'
    }
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M169.02 240.06v-17.52l37.74-21.96-37.74-21.25v-18.16l68.27 39.44-67.74 39.45"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m169.02 179.33 37.74 21.25-37.74 21.96"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 19
    },
    d: "M13.89 96.92h372.22v209.25H13.89z"
  })]
});
const videopackThumbnail = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M170.16 207.08v-19.61l42.27-24.6-42.27-23.8v-20.34l76.46 44.18-75.86 44.17"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m170.16 139.07 42.27 23.8-42.27 24.6M46.7 364.45c-6.58 0-10.96-4.39-10.96-10.96v-52.62l89.9-65.78 65.78 41.66c6.58 4.39 15.35 4.39 19.73-2.19l76.74-74.55 76.74 74.55v78.94c0 6.58-4.39 10.96-10.96 10.96"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    d: "M353.83 2.67H46.85c-24.12 0-43.86 19.74-43.86 43.86v306.98c0 24.12 19.73 43.85 43.85 43.85h306.98c24.12 0 43.85-19.73 43.85-43.85V46.53c0-24.12-19.73-43.85-43.85-43.85Zm10.96 350.83c0 6.58-4.39 10.96-10.96 10.96H46.85c-6.58 0-10.96-4.39-10.96-10.96v-52.62l89.9-65.78 65.78 41.66c6.58 4.39 15.35 4.39 19.73-2.19l76.74-74.55 76.74 74.55v78.94Zm-85.63-188.64c-.79.64-1.49 1.39-2.08 2.27l-78.94 76.74-63.59-43.85c-.57-.38-1.14-.72-1.71-1.03a77 77 0 0 1-8.68-35.6c0-42.74 34.77-77.51 77.51-77.51s77.51 34.77 77.51 77.51c0 .49-.03.98-.04 1.48Zm85.63 65.85-65.68-63.49c.05-1.28.08-2.56.08-3.84 0-53.77-43.74-97.51-97.51-97.51s-97.51 43.74-97.51 97.51c0 14.16 3.04 27.63 8.49 39.78l-74.58 53.86V46.53c.05-5.27 2.19-10.96 8.77-10.96h306.98c6.58 0 10.96 4.39 10.96 10.96v184.19Z",
    style: {
      fill: '#cd0000'
    }
  })]
});
const videopackTitle = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M1.92 52.81h396.16v285.84H1.92z"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    d: "M295.68 87.22v44.5h-72.27V311.4h-53.54V131.72H97.6v-44.5z",
    style: {
      fill: '#fff'
    }
  })]
});
const videopackVideo = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("circle", {
    cx: 199.66,
    cy: 198.62,
    r: 47.96,
    style: {
      fill: '#fff'
    }
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("circle", {
    cx: 199.66,
    cy: 198.62,
    r: 47.96,
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: '7.88px'
    }
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M179.89 225.45v-12.03l25.92-15.09-25.92-14.59v-12.48l46.9 27.1-46.54 27.09"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m179.89 183.74 25.92 14.59-25.92 15.09"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: '13.05px'
    },
    d: "M73.32 127.13h255.7v143.75H73.32z"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: '7.16px'
    },
    d: "M3.38 3.56h393.28v393.28H3.38z"
  })]
});
const videopackViewCount = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m8.57 162.7 71.81 40.43-71.81 41.79"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M8.46 250.14V227.9l47.92-27.88-47.92-26.98v-23.05l86.68 50.07-86 50.08m169.59-93.16-6.47 24.1h19.53l6.47-24.1h11.41l-6.47 24.1h12.94v9.51h-15.47l-4.95 18.39h14.2v9.51h-16.74l-6.21 23.46h-11.41l6.21-23.46h-19.53l-6.21 23.46h-11.41l6.21-23.46h-13.57v-9.51h16.11l4.95-18.39h-14.84v-9.51h17.37l6.47-24.1zm-13.95 51.99h19.53l4.95-18.39h-19.53zm101.7-51.99-6.47 24.1h19.53l6.47-24.1h11.41l-6.47 24.1h12.94v9.51h-15.47l-4.95 18.39h14.2v9.51h-16.74l-6.21 23.46h-11.41l6.21-23.46h-19.53l-6.21 23.46h-11.41l6.21-23.46h-13.57v-9.51h16.11l4.95-18.39h-14.84v-9.51h17.37l6.47-24.1zm-13.95 51.99h19.53l4.95-18.39h-19.53zm101.7-51.99-6.47 24.1h19.53l6.47-24.1h11.41l-6.47 24.1h12.94v9.51h-15.47l-4.95 18.39h14.2v9.51h-16.74l-6.21 23.46h-11.41l6.21-23.46h-19.53l-6.21 23.46h-11.41l6.21-23.46h-13.57v-9.51h16.11l4.95-18.39h-14.84v-9.51h17.37l6.47-24.1zm-13.95 51.99h19.53l4.95-18.39h-19.53z"
  })]
});
const videopackWatermark = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("g", {
    style: {
      opacity: 0.2
    },
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("g", {
      transform: "rotate(-45 201.506 200.804)",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("circle", {
        cx: 201.51,
        cy: 200.8,
        r: 121.45,
        style: {
          fill: '#fff'
        }
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("circle", {
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
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
      style: {
        fill: '#cd0000'
      },
      d: "M133.55 150.74h30.48l38.2 65.65 36.97-65.65h31.58l-68.61 118.75-68.62-117.83"
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
      style: {
        fill: '#ff9ca1'
      },
      d: "m239.2 150.74-36.97 65.65-38.2-65.65"
    })]
  })
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

/***/ "./src/blocks/duration/edit.js"
/*!*************************************!*\
  !*** ./src/blocks/duration/edit.js ***!
  \*************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   VideoDuration: () => (/* binding */ VideoDuration),
/* harmony export */   "default": () => (/* binding */ Edit)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _utils_colors__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../utils/colors */ "./src/utils/colors.js");
/* harmony import */ var _components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../components/CompactColorPicker/CompactColorPicker */ "./src/components/CompactColorPicker/CompactColorPicker.js");
/* harmony import */ var _hooks_useVideopackContext__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../hooks/useVideopackContext */ "./src/hooks/useVideopackContext.js");
/* harmony import */ var _hooks_useVideopackData__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../hooks/useVideopackData */ "./src/hooks/useVideopackData.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__);








/* global videopack_config */




/**
 * A internal component to display the video duration with correct formatting and data.
 */

function VideoDuration({
  postId: propPostId,
  isOverlay,
  isInsideThumbnail,
  textAlign,
  position,
  attributes,
  context = {}
}) {
  const vpContext = (0,_hooks_useVideopackContext__WEBPACK_IMPORTED_MODULE_7__["default"])(attributes, context);
  const {
    data: duration,
    isResolving
  } = (0,_hooks_useVideopackData__WEBPACK_IMPORTED_MODULE_8__["default"])('duration', context);
  const attachmentId = vpContext.resolved.attachmentId;
  if (vpContext.resolved.isDiscovering && !attachmentId) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
      className: `videopack-video-duration ${isInsideThumbnail || !!context['videopack/isInsidePlayerOverlay'] ? 'is-overlay' : ''}`,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Spinner, {})
    });
  }
  if (!attachmentId && !vpContext.resolved.isPreview) {
    return null;
  }
  const actualIsOverlay = isOverlay !== undefined ? isOverlay : isInsideThumbnail || !!context['videopack/isInsidePlayerOverlay'];
  const isInsidePlayerContainer = !!context['videopack/isInsidePlayerContainer'];
  const defaultAlign = actualIsOverlay || isInsidePlayerContainer ? 'right' : 'left';
  if (isResolving) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
      className: `videopack-video-duration ${actualIsOverlay ? 'is-overlay' : ''}`,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Spinner, {})
    });
  }
  const formatDuration = seconds => {
    if (!seconds) {
      return '0:00';
    }
    const s = Math.floor(seconds);
    const h = Math.floor(s / 3600);
    const m = Math.floor(s % 3600 / 60);
    const sec = s % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    }
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
    className: `videopack-video-duration-block videopack-video-duration ${vpContext.classes} ${actualIsOverlay ? 'is-overlay is-badge' : ''} position-${position || 'top'} has-text-align-${textAlign || defaultAlign} ${vpContext.resolved.isPreview ? 'is-preview' : ''}`,
    style: vpContext.style,
    children: duration ? formatDuration(duration) : '0:00'
  });
}
function Edit({
  attributes,
  setAttributes,
  context
}) {
  const vpContext = (0,_hooks_useVideopackContext__WEBPACK_IMPORTED_MODULE_7__["default"])(attributes, context);
  const postId = vpContext.resolved.attachmentId;
  const {
    textAlign,
    position: attrPosition,
    title_color,
    title_background_color
  } = attributes;
  const isInsideThumbnail = !!context['videopack/isInsideThumbnail'];
  const isInsidePlayerOverlay = !!context['videopack/isInsidePlayerOverlay'];
  const isInsidePlayerContainer = !!context['videopack/isInsidePlayerContainer'];
  const isOverlay = isInsideThumbnail || isInsidePlayerOverlay;
  const defaultAlign = isOverlay ? isInsideThumbnail ? 'right' : 'left' : isInsidePlayerContainer ? 'right' : 'left';
  const finalTextAlign = textAlign || context['videopack/textAlign'] || defaultAlign;
  const position = attrPosition || context['videopack/position'] || 'top';
  const THEME_COLORS = videopack_config?.themeColors;
  const colorFallbacks = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_utils_colors__WEBPACK_IMPORTED_MODULE_5__.getColorFallbacks)({
    title_color: vpContext.resolved.title_color,
    title_background_color: vpContext.resolved.title_background_color
  }), [vpContext.resolved.title_color, vpContext.resolved.title_background_color]);
  const {
    latestVideoId
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_4__.useSelect)(select => {
    if (!vpContext.resolved.isPreview) return {
      latestVideoId: null
    };
    const {
      getEntityRecords
    } = select('core');
    const query = {
      post_type: 'attachment',
      mime_type: 'video',
      per_page: 1,
      _fields: 'id'
    };
    const media = getEntityRecords('postType', 'attachment', query);
    return {
      latestVideoId: media?.[0]?.id
    };
  }, [vpContext.resolved.isPreview]);
  const effectiveAttachmentId = postId || latestVideoId;
  const blockProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.useBlockProps)({
    className: `videopack-video-duration-block ${vpContext.classes} ${isOverlay ? 'is-inside-thumbnail is-overlay is-badge' : ''} position-${position} has-text-align-${finalTextAlign}`,
    style: vpContext.style
  });
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.BlockControls, {
      children: [isOverlay && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.BlockVerticalAlignmentControl, {
        value: position,
        onChange: nextPosition => {
          setAttributes({
            position: nextPosition || undefined
          });
        }
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.AlignmentControl, {
        value: finalTextAlign,
        onChange: nextAlign => {
          setAttributes({
            textAlign: nextAlign
          });
        }
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.InspectorControls, {
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Colors', 'video-embed-thumbnail-generator'),
        initialOpen: true,
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
          className: "videopack-color-section",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)("div", {
            className: "videopack-color-flex-row",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_6__["default"], {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Text', 'video-embed-thumbnail-generator'),
                value: title_color,
                onChange: value => setAttributes({
                  title_color: value
                }),
                colors: THEME_COLORS,
                fallbackValue: colorFallbacks.title_color
              })
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_6__["default"], {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Background', 'video-embed-thumbnail-generator'),
                value: title_background_color,
                onChange: value => setAttributes({
                  title_background_color: value
                }),
                colors: THEME_COLORS,
                fallbackValue: colorFallbacks.title_background_color
              })
            })]
          })
        })
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
      ...blockProps,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(VideoDuration, {
        postId: effectiveAttachmentId,
        isOverlay: isOverlay,
        isInsideThumbnail: isInsideThumbnail,
        textAlign: finalTextAlign,
        position: position,
        attributes: attributes,
        context: context
      })
    })]
  });
}

/***/ },

/***/ "./src/blocks/play-button/edit.js"
/*!****************************************!*\
  !*** ./src/blocks/play-button/edit.js ***!
  \****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PlayButton: () => (/* binding */ PlayButton),
/* harmony export */   "default": () => (/* binding */ Edit)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _utils_colors__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../utils/colors */ "./src/utils/colors.js");
/* harmony import */ var _components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../components/CompactColorPicker/CompactColorPicker */ "./src/components/CompactColorPicker/CompactColorPicker.js");
/* harmony import */ var _hooks_useVideopackContext__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../hooks/useVideopackContext */ "./src/hooks/useVideopackContext.js");
/* harmony import */ var _editor_scss__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./editor.scss */ "./src/blocks/play-button/editor.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__);









/**
 * A internal component to display the play button with correct styling.
 */

function PlayButton({
  attributes = {},
  context = {}
}) {
  const config = typeof window !== 'undefined' ? window.videopack_config : undefined;
  const embed_method = typeof config !== 'undefined' ? config.embed_method : 'Video.js';
  const vpContext = (0,_hooks_useVideopackContext__WEBPACK_IMPORTED_MODULE_6__["default"])(attributes, context);
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
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("div", {
      className: `videopack-play-button mejs-overlay mejs-layer mejs-overlay-play play-button-container ${vpContext.classes}`,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("div", {
        className: "mejs-overlay-button",
        role: "button",
        tabIndex: "0",
        "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Play', 'video-embed-thumbnail-generator'),
        "aria-pressed": "false",
        style: styles
      })
    });
  }
  if ('None' === embed_method) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("div", {
      className: "play-button-container videopack-none",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("svg", {
        className: "videopack-none-play-button",
        viewBox: "0 0 100 100",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("circle", {
          className: "play-button-circle",
          cx: "50",
          cy: "50",
          r: "45"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("polygon", {
          className: "play-button-triangle",
          points: "40,30 70,50 40,70"
        })]
      })
    });
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("div", {
    className: `play-button-container video-js ${vpContext.classes} vjs-big-play-centered vjs-paused vjs-controls-enabled`,
    style: vpContext.style,
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("button", {
      className: "vjs-big-play-button",
      type: "button",
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Play Video', 'video-embed-thumbnail-generator'),
      "aria-disabled": "false",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("span", {
        className: "vjs-icon-placeholder",
        "aria-hidden": "true"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("span", {
        className: "vjs-control-text",
        "aria-live": "polite",
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Play Video', 'video-embed-thumbnail-generator')
      })]
    })
  });
}
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
  const embed_method = typeof config !== 'undefined' ? config.embed_method : 'Video.js';
  const THEME_COLORS = config?.themeColors;
  const {
    resolved
  } = (0,_hooks_useVideopackContext__WEBPACK_IMPORTED_MODULE_6__["default"])(attributes, context);
  const colorFallbacks = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_utils_colors__WEBPACK_IMPORTED_MODULE_4__.getColorFallbacks)({
    play_button_color: resolved.play_button_color,
    play_button_secondary_color: resolved.play_button_secondary_color
  }), [resolved.play_button_color, resolved.play_button_secondary_color]);
  const overlayStyles = {};
  if (isInsidePlayerOverlay || isInsideThumbnail || context.isPreview) {
    overlayStyles.position = 'absolute';
    overlayStyles.top = 0;
    overlayStyles.left = 0;
    overlayStyles.right = 0;
    overlayStyles.bottom = 0;
    overlayStyles.zIndex = 115;
    overlayStyles.minHeight = '100px'; // Ensure it's visible in inserter
  }
  const blockProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.useBlockProps)({
    className: `videopack-play-button-block ${isInsidePlayerOverlay ? 'is-overlay' : ''}`,
    style: overlayStyles
  });
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.InspectorControls, {
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Colors', 'video-embed-thumbnail-generator'),
        initialOpen: true,
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("div", {
          className: "videopack-color-section",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
            className: "videopack-color-flex-row",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_5__["default"], {
                label: 'WordPress Default' === embed_method ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Color', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Icon', 'video-embed-thumbnail-generator'),
                value: play_button_color,
                onChange: value => setAttributes({
                  play_button_color: value
                }),
                colors: THEME_COLORS,
                fallbackValue: colorFallbacks.play_button_color
              })
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_5__["default"], {
                label: 'WordPress Default' === embed_method ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Hover', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Accent', 'video-embed-thumbnail-generator'),
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
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("div", {
      ...blockProps,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(PlayButton, {
        attributes: attributes,
        context: context
      })
    })]
  });
}

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
  'videopack/pagination_active_color': 'pagination_active_color',
  'videopack/watermark': 'watermark',
  'videopack/watermark_styles': 'watermark_styles',
  'videopack/watermark_link_to': 'watermark_link_to'
};
const usesDesignContext = ['videopack/skin', 'videopack/title_color', 'videopack/title_background_color', 'videopack/play_button_color', 'videopack/play_button_secondary_color', 'videopack/control_bar_bg_color', 'videopack/control_bar_color', 'videopack/pagination_color', 'videopack/pagination_background_color', 'videopack/pagination_active_bg_color', 'videopack/pagination_active_color', 'videopack/watermark', 'videopack/watermark_styles', 'videopack/watermark_link_to'];

/***/ },

/***/ "./src/blocks/thumbnail/VideoThumbnailPreview.js"
/*!*******************************************************!*\
  !*** ./src/blocks/thumbnail/VideoThumbnailPreview.js ***!
  \*******************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   VideoThumbnailPreview: () => (/* binding */ VideoThumbnailPreview)
/* harmony export */ });
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _components_Duotone_CustomDuotoneFilter__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../components/Duotone/CustomDuotoneFilter */ "./src/components/Duotone/CustomDuotoneFilter.js");
/* harmony import */ var _hooks_useVideopackContext__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../hooks/useVideopackContext */ "./src/hooks/useVideopackContext.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__);





/**
 * Shared Video Thumbnail Component for Edit/Preview
 *
 * @param {Object} root0                        Component props
 * @param {number} root0.postId                 Video Post ID (Attachment ID)
 * @param {string} root0.skin                   Selected skin
 * @param {Node}   root0.children               Inner blocks
 * @param {string} root0.resolvedDuotoneClass   Duotone class to apply
 * @return {Element} VideoThumbnail component
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
  const vpContext = (0,_hooks_useVideopackContext__WEBPACK_IMPORTED_MODULE_3__["default"])({}, context);
  const {
    resolved: {
      attachmentId: resolvedAttachmentId,
      postId: resolvedPostIdFromContext,
      isDiscovering,
      duotone: contextDuotone
    },
    style: contextStyle
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
  const postId = vpContext.resolved.attachmentId || propPostId;
  const effectiveSkin = vpContext.resolved.skin;
  const {
    thumbnailMedia,
    posterUrl,
    isResolving
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.useSelect)(select => {
    if (!postId || postId < 1 || video.poster_url) {
      return {
        thumbnailMedia: null,
        posterUrl: null,
        isResolving: false
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
      posterUrl: directPoster,
      isResolving: select('core/data').isResolving('core', 'getEntityRecord', ['postType', 'attachment', postId])
    };
  }, [postId, video.poster_url]);
  if (isResolving && !video.poster_url) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Spinner, {});
  }
  const config = typeof window !== 'undefined' ? window.videopack_config : undefined;
  const defaultNoThumb = config ? `${config.url}/src/images/Adobestock_469037984_thumb1.jpg` : '';

  // Priority: 1. Manual video data (previews), 2. Direct poster URL from meta, 3. WordPress media object, 4. Default "no thumbnail"
  const thumbnailUrl = video.poster_url || posterUrl || thumbnailMedia?.source_url || defaultNoThumb;
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
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("div", {
    className: containerClass,
    style: containerStyle,
    children: [thumbnailUrl && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("img", {
      src: thumbnailUrl,
      alt: thumbnailMedia?.alt_text || '',
      className: "videopack-thumbnail",
      style: imgStyle
    }), Array.isArray(duotone) && resolvedDuotoneClass && !loopDuotoneId && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_components_Duotone_CustomDuotoneFilter__WEBPACK_IMPORTED_MODULE_2__["default"], {
      colors: duotone,
      id: resolvedDuotoneClass
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("div", {
      className: "videopack-inner-blocks-container",
      children: children
    })]
  });
}

/***/ },

/***/ "./src/blocks/title/edit.js"
/*!**********************************!*\
  !*** ./src/blocks/title/edit.js ***!
  \**********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   VideoTitle: () => (/* binding */ VideoTitle),
/* harmony export */   "default": () => (/* binding */ Edit)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _wordpress_html_entities__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/html-entities */ "@wordpress/html-entities");
/* harmony import */ var _wordpress_html_entities__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_html_entities__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/background.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/close.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/code.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/download.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/share.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/title.mjs");
/* harmony import */ var _components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../components/CompactColorPicker/CompactColorPicker */ "./src/components/CompactColorPicker/CompactColorPicker.js");
/* harmony import */ var _utils_colors__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../utils/colors */ "./src/utils/colors.js");
/* harmony import */ var _hooks_useVideopackContext__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../hooks/useVideopackContext */ "./src/hooks/useVideopackContext.js");
/* harmony import */ var _hooks_useVideopackData__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../../hooks/useVideopackData */ "./src/hooks/useVideopackData.js");
/* harmony import */ var _editor_scss__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./editor.scss */ "./src/blocks/title/editor.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__);
/* global videopack_config */













/**
 * An internal component to display the video title with correct styling and data.
 */

function VideoTitle({
  blockProps,
  postId: propPostId,
  postType: propPostType,
  title: manualTitle,
  tagName: Tag = 'h3',
  textAlign,
  isOverlay = false,
  downloadlink,
  embedcode,
  embedlink,
  overlay_title,
  showBackground,
  onTitleChange,
  isInsideThumbnail,
  isInsidePlayerOverlay,
  position: attrPosition,
  attributes = {},
  context = {},
  usePostTitle = false,
  linkToPost = false
}) {
  const vpContext = (0,_hooks_useVideopackContext__WEBPACK_IMPORTED_MODULE_14__["default"])(attributes, context);
  const {
    postId: resolvedPostId,
    attachmentId: resolvedAttachmentId,
    postType: resolvedPostType,
    prioritizePostData
  } = vpContext.resolved;
  const postId = prioritizePostData || usePostTitle ? resolvedPostId || propPostId : resolvedAttachmentId || resolvedPostId || propPostId;
  const postType = prioritizePostData || usePostTitle ? resolvedPostType || propPostType : resolvedAttachmentId ? 'attachment' : resolvedPostType || propPostType;
  const titleKey = prioritizePostData || usePostTitle ? 'parentTitle' : 'title';
  const {
    data: resolvedTitle,
    isResolving
  } = (0,_hooks_useVideopackData__WEBPACK_IMPORTED_MODULE_15__["default"])(titleKey, context);
  const displayTitle = (0,_wordpress_html_entities__WEBPACK_IMPORTED_MODULE_5__.decodeEntities)(manualTitle || resolvedTitle || '');
  const [startAtEnabled, setStartAtEnabled] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [startAtTime, setStartAtTime] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)('00:00');
  const [shareIsOpen, setShareIsOpen] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const randomId = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => Math.random().toString(36).substr(2, 9), []);
  const baseEmbedLink = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    if (embedlink) {
      return String(embedlink);
    }
    return '';
  }, [embedlink]);
  const [currentEmbedCode, setCurrentEmbedCode] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(baseEmbedLink());
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    const originalEmbedLink = baseEmbedLink();
    if (!originalEmbedLink) {
      setCurrentEmbedCode('');
      return;
    }

    // Normalize to a clean URL if it was already an iframe.
    let src = originalEmbedLink;
    if (originalEmbedLink.includes('<iframe')) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = originalEmbedLink;
      const iframe = tempDiv.querySelector('iframe');
      src = iframe ? iframe.getAttribute('src') : originalEmbedLink;
    }
    src = src.replace(/&?videopack\[start\]=[^&]*/, '');
    src = src.replace(/\?&/, '?').replace(/\?$/, '');
    if (startAtEnabled && startAtTime) {
      const separator = src.includes('?') ? '&' : '?';
      src += `${separator}videopack[start]=${encodeURIComponent(startAtTime)}`;
    }
    const allowPolicy = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen';
    const sandboxPolicy = 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation allow-forms';
    const iframeTitle = displayTitle ? `Video Player - ${displayTitle}` : 'Video Player';
    const newEmbedCode = `<iframe src="${src}" width="960" height="540" style="border:0; width:100%; aspect-ratio:16/9;" allow="${allowPolicy}" allowfullscreen credentialless sandbox="${sandboxPolicy}" loading="lazy" title="${iframeTitle}" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
    setCurrentEmbedCode(newEmbedCode);
  }, [startAtEnabled, startAtTime, baseEmbedLink, displayTitle]);
  if (isResolving && !displayTitle && !vpContext.resolved.isPreview) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Spinner, {});
  }
  const position = attrPosition || (isInsideThumbnail ? 'bottom' : 'top');
  const defaultAlign = isInsideThumbnail ? 'center' : isOverlay ? 'left' : 'left';
  const finalTextAlign = textAlign || defaultAlign;
  const globalOptions = videopack_config?.options || {};
  const finalDownloadLink = isInsideThumbnail ? false : downloadlink !== undefined ? downloadlink : !!globalOptions.downloadlink;
  const finalEmbedCode = isInsideThumbnail ? false : embedcode !== undefined ? embedcode : !!globalOptions.embedcode;
  const finalOverlayTitle = overlay_title !== undefined ? overlay_title : globalOptions.overlay_title !== undefined ? !!globalOptions.overlay_title : true;
  const finalShowBackground = showBackground !== undefined ? showBackground : globalOptions.showBackground !== undefined ? !!globalOptions.showBackground : true;
  let placeholder = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Video Title', 'video-embed-thumbnail-generator');
  if (postId) {
    placeholder = resolvedTitle ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('(Untitled Video)', 'video-embed-thumbnail-generator') : '';
  }
  const titleClass = isInsideThumbnail ? 'videopack-thumbnail-title-text' : isOverlay ? 'videopack-title' : 'videopack-video-title';
  const iconsClass = 'videopack-meta-icons';
  const finalBlockProps = blockProps || {
    className: `videopack-video-title-block videopack-video-title-wrapper ${vpContext.classes} ${isOverlay ? `is-overlay position-${position}` : ''} ${isInsideThumbnail ? 'is-inside-thumbnail' : ''} ${isInsidePlayerOverlay ? 'is-inside-player' : ''} ${!postId && !manualTitle ? 'no-title' : ''} has-text-align-${finalTextAlign}`,
    style: vpContext.style
  };
  const barClass = `videopack-video-title videopack-video-title-visible ${isOverlay ? 'is-overlay' : ''} ${!showBackground && isOverlay ? 'has-no-background' : ''} ${isInsideThumbnail ? 'videopack-thumbnail-title' : ''} ${isInsidePlayerOverlay ? `videopack-title-${position}` : ''}`.trim();
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsxs)("div", {
    ...finalBlockProps,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsx)("button", {
      className: `videopack-click-trap${shareIsOpen ? ' is-visible' : ''}`,
      onClick: () => {
        setShareIsOpen(false);
      },
      "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Close share overlay', 'video-embed-thumbnail-generator')
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsxs)("div", {
      className: `${barClass} has-text-align-${finalTextAlign}`,
      children: [finalOverlayTitle && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.RichText, {
        tagName: Tag,
        className: `${titleClass} ${vpContext.classes} ${linkToPost ? 'is-link' : ''}`,
        style: vpContext.style,
        value: displayTitle,
        onChange: onTitleChange,
        placeholder: placeholder,
        allowedFormats: ['core/bold', 'core/italic', 'core/strikethrough']
      }), isOverlay && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsxs)("div", {
        className: iconsClass,
        children: [finalEmbedCode && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsx)("button", {
          className: `videopack-icons ${shareIsOpen ? 'close' : 'share'}`,
          onClick: () => setShareIsOpen(!shareIsOpen),
          title: shareIsOpen ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Close', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Share', 'video-embed-thumbnail-generator'),
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Icon, {
            icon: shareIsOpen ? _wordpress_icons__WEBPACK_IMPORTED_MODULE_7__["default"] : _wordpress_icons__WEBPACK_IMPORTED_MODULE_10__["default"],
            className: "videopack-icon-svg"
          })
        }), finalDownloadLink && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsx)("button", {
          className: "videopack-icons download",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Icon, {
            icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_9__["default"],
            className: "videopack-icon-svg"
          })
        })]
      })]
    }), isOverlay && finalEmbedCode && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsxs)("div", {
      className: `videopack-share-container${shareIsOpen ? ' is-visible' : ''}`,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsxs)("span", {
        className: "videopack-embedcode-container",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsx)("span", {
          className: "videopack-icons embed",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Icon, {
            icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_8__["default"],
            className: "videopack-icon-svg"
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsx)("span", {
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Embed:', 'video-embed-thumbnail-generator')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsx)("span", {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsx)("input", {
            className: "videopack-embed-code",
            type: "text",
            value: currentEmbedCode,
            onClick: e => e.target.select(),
            readOnly: true
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsxs)("span", {
        className: "videopack-start-at-container",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsx)("input", {
          type: "checkbox",
          className: "videopack-start-at-enable",
          id: `videopack-start-at-enable-block-${randomId}`,
          checked: startAtEnabled,
          onChange: e => setStartAtEnabled(e.target.checked)
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsx)("label", {
          htmlFor: `videopack-start-at-enable-block-${randomId}`,
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Start at:', 'video-embed-thumbnail-generator')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsx)("input", {
          type: "text",
          className: "videopack-start-at",
          value: startAtTime,
          onChange: e => setStartAtTime(e.target.value)
        })]
      })]
    })]
  });
}
function Edit(props) {
  const {
    clientId,
    attributes,
    setAttributes,
    context
  } = props;
  const vpContext = (0,_hooks_useVideopackContext__WEBPACK_IMPORTED_MODULE_14__["default"])(attributes, context);
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
    downloadlink,
    embedcode,
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
  const finalDownloadLink = downloadlink !== undefined ? downloadlink : !!globalOptions.downloadlink;
  const finalEmbedCode = embedcode !== undefined ? embedcode : !!globalOptions.embedcode;
  const finalOverlayTitle = overlay_title !== undefined ? overlay_title : globalOptions.overlay_title !== undefined ? !!globalOptions.overlay_title : true;
  const finalShowBackground = showBackground !== undefined ? showBackground : globalOptions.showBackground !== undefined ? !!globalOptions.showBackground : true;

  // For thumbnails, we only disable share and download features
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (isInsideThumbnail) {
      const newAttributes = {};
      if (attributes.downloadlink) {
        newAttributes.downloadlink = false;
      }
      if (attributes.embedcode) {
        newAttributes.embedcode = false;
      }
      if (Object.keys(newAttributes).length > 0) {
        setAttributes(newAttributes);
      }
    }
  }, [isInsideThumbnail, attributes.downloadlink, attributes.embedcode, setAttributes]);
  const isOverlay = explicitIsOverlay !== undefined ? explicitIsOverlay : isInsideThumbnail || isInsidePlayerOverlay;
  const wrapperClass = 'videopack-video-title-wrapper';
  const THEME_COLORS = videopack_config?.themeColors;
  const colorFallbacks = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_utils_colors__WEBPACK_IMPORTED_MODULE_13__.getColorFallbacks)({
    title_color: vpContext.resolved.title_color,
    title_background_color: vpContext.resolved.title_background_color
  }), [vpContext.resolved.title_color, vpContext.resolved.title_background_color]);
  const blockProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.useBlockProps)({
    className: `videopack-video-title-block ${wrapperClass} ${vpContext.classes} ${isOverlay ? `is-overlay position-${position}` : ''} ${isInsideThumbnail ? 'is-inside-thumbnail' : ''} ${isInsidePlayerOverlay ? 'is-inside-player' : ''} ${!postId && !title ? 'no-title' : ''} has-text-align-${textAlign}`,
    style: vpContext.style
  });
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsxs)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.BlockControls, {
      group: "block",
      children: [!isInsideThumbnail && !isInsidePlayerOverlay && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.HeadingLevelDropdown, {
        value: Tag.replace('h', '') * 1,
        onChange: newLevel => setAttributes({
          tagName: `h${newLevel}`
        })
      }), isOverlay && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.BlockVerticalAlignmentControl, {
        value: position,
        onChange: nextPosition => {
          setAttributes({
            position: nextPosition || undefined
          });
        }
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.AlignmentControl, {
        value: textAlign,
        onChange: nextAlign => {
          setAttributes({
            textAlign: nextAlign
          });
        }
      }), (isInsidePlayerOverlay || isInsidePlayerContainer) && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarGroup, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarButton, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_11__["default"],
          label: finalOverlayTitle ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Hide Title', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Show Title', 'video-embed-thumbnail-generator'),
          isPressed: finalOverlayTitle,
          onClick: () => setAttributes({
            overlay_title: !finalOverlayTitle
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarButton, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_10__["default"],
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Embed/Share Button', 'video-embed-thumbnail-generator'),
          isPressed: finalEmbedCode,
          onClick: () => setAttributes({
            embedcode: !finalEmbedCode
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarButton, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_9__["default"],
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Download Button', 'video-embed-thumbnail-generator'),
          isPressed: finalDownloadLink,
          onClick: () => setAttributes({
            downloadlink: !finalDownloadLink
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarButton, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_6__["default"],
          label: finalShowBackground ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Hide Background Bar', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Show Background Bar', 'video-embed-thumbnail-generator'),
          isPressed: finalShowBackground,
          onClick: () => setAttributes({
            showBackground: !finalShowBackground
          })
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsxs)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.InspectorControls, {
      children: [!vpContext.resolved.isStandalone && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Data Settings', 'video-embed-thumbnail-generator'),
        initialOpen: true,
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToggleControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Use Post Title', 'video-embed-thumbnail-generator'),
          help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('When enabled, this block will display the title of the parent post instead of the video title.', 'video-embed-thumbnail-generator'),
          checked: usePostTitle,
          onChange: value => setAttributes({
            usePostTitle: value
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToggleControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Make title a link', 'video-embed-thumbnail-generator'),
          help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('When enabled, the title will link to the parent post.', 'video-embed-thumbnail-generator'),
          checked: linkToPost,
          onChange: value => setAttributes({
            linkToPost: value
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Colors', 'video-embed-thumbnail-generator'),
        initialOpen: true,
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsxs)("div", {
          className: "videopack-color-section",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsx)("p", {
            className: "videopack-settings-section-title",
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Title Bar', 'video-embed-thumbnail-generator')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsxs)("div", {
            className: "videopack-color-flex-row",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsx)(_components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_12__["default"], {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Text', 'video-embed-thumbnail-generator'),
                value: title_color,
                onChange: value => setAttributes({
                  title_color: value
                }),
                colors: THEME_COLORS,
                fallbackValue: colorFallbacks.title_color
              })
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsx)(_components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_12__["default"], {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Background', 'video-embed-thumbnail-generator'),
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
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_17__.jsx)(VideoTitle, {
      blockProps: blockProps,
      attributes: attributes,
      postId: postId,
      postType: postType,
      clientId: clientId,
      isInsideThumbnail: isInsideThumbnail,
      isInsidePlayerOverlay: isInsidePlayerOverlay,
      isOverlay: isOverlay,
      context: context,
      onTitleChange: newTitle => setAttributes({
        title: newTitle
      }),
      usePostTitle: usePostTitle,
      linkToPost: linkToPost
    })]
  });
}

/***/ },

/***/ "./src/blocks/view-count/edit.js"
/*!***************************************!*\
  !*** ./src/blocks/view-count/edit.js ***!
  \***************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ViewCount: () => (/* binding */ ViewCount),
/* harmony export */   "default": () => (/* binding */ Edit)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/media-and-text.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/not-allowed.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/seen.mjs");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _assets_icon__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../assets/icon */ "./src/assets/icon.js");
/* harmony import */ var _components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../components/CompactColorPicker/CompactColorPicker */ "./src/components/CompactColorPicker/CompactColorPicker.js");
/* harmony import */ var _utils_colors__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../utils/colors */ "./src/utils/colors.js");
/* harmony import */ var _hooks_useVideopackContext__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../hooks/useVideopackContext */ "./src/hooks/useVideopackContext.js");
/* harmony import */ var _hooks_useVideopackData__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../hooks/useVideopackData */ "./src/hooks/useVideopackData.js");
/* harmony import */ var _index_css__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./index.css */ "./src/blocks/view-count/index.css");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__);
/* global videopack_config */













/**
 * A internal component to display the view count with correct styling and data.
 */

function ViewCount({
  blockProps,
  iconType = 'none',
  showText = true,
  postId: propPostId,
  count,
  isInsideThumbnail = false,
  isOverlay = false,
  textAlign,
  position = 'top',
  attributes = {},
  context = {}
}) {
  const vpContext = (0,_hooks_useVideopackContext__WEBPACK_IMPORTED_MODULE_11__["default"])(attributes, context);
  const {
    data: views,
    isResolving
  } = (0,_hooks_useVideopackData__WEBPACK_IMPORTED_MODULE_12__["default"])('views', context);
  const attachmentId = vpContext.resolved.attachmentId;
  const actualIsOverlay = isOverlay !== undefined ? isOverlay : isInsideThumbnail || !!context['videopack/isInsidePlayerOverlay'];
  const isInsidePlayerContainer = !!context['videopack/isInsidePlayerContainer'];
  const defaultAlign = isInsideThumbnail || actualIsOverlay || isInsidePlayerContainer ? 'right' : 'left';
  const wrapperClass = `videopack-view-count-block videopack-view-count-wrapper ${vpContext.classes} ${actualIsOverlay ? 'is-overlay is-badge' : ''} ${isInsideThumbnail ? 'is-inside-thumbnail' : ''} ${actualIsOverlay ? `position-${position || 'top'}` : ''} has-text-align-${textAlign || defaultAlign} ${vpContext.resolved.isPreview ? 'is-preview' : ''}`;
  const finalBlockProps = blockProps || {
    className: wrapperClass,
    style: vpContext.style
  };
  if (vpContext.resolved.isDiscovering && !attachmentId) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)("div", {
      ...finalBlockProps,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Spinner, {})
    });
  }
  if (!attachmentId && count === undefined && !vpContext.resolved.isPreview) {
    return null;
  }
  if (isResolving) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)("div", {
      ...finalBlockProps,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Spinner, {})
    });
  }
  const safeViews = count !== undefined ? Number(count) : views !== undefined && views !== null ? Number(views) : 0;
  const displayValue = showText ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.sprintf)(/* translators: %s is the formatted number of views */
  (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__._n)('%s view', '%s views', safeViews, 'video-embed-thumbnail-generator'), safeViews.toLocaleString()) : safeViews.toLocaleString();
  const renderIcon = () => {
    switch (iconType) {
      case 'eye':
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Icon, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_6__["default"],
          className: "videopack-icon-left-margin"
        });
      case 'play':
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Icon, {
          icon: _assets_icon__WEBPACK_IMPORTED_MODULE_8__.play,
          size: 16,
          className: "videopack-icon-left-margin"
        });
      case 'playOutline':
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Icon, {
          icon: _assets_icon__WEBPACK_IMPORTED_MODULE_8__.playOutline,
          size: 16,
          className: "videopack-icon-left-margin"
        });
      default:
        return null;
    }
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)("div", {
    ...finalBlockProps,
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)("div", {
      className: "videopack-view-count",
      children: [renderIcon(), displayValue]
    })
  });
}
function Edit({
  attributes,
  setAttributes,
  context
}) {
  const vpContext = (0,_hooks_useVideopackContext__WEBPACK_IMPORTED_MODULE_11__["default"])(attributes, context);
  const postId = vpContext.resolved.attachmentId;
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
  const colorFallbacks = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_utils_colors__WEBPACK_IMPORTED_MODULE_10__.getColorFallbacks)({
    title_color: vpContext.resolved.title_color,
    title_background_color: vpContext.resolved.title_background_color
  }), [vpContext.resolved.title_color, vpContext.resolved.title_background_color]);
  const defaultAlign = isInsideThumbnail ? 'right' : isInsidePlayerOverlay || isInsidePlayerContainer ? 'right' : 'left';
  const finalTextAlign = textAlign || context['videopack/textAlign'] || defaultAlign;
  const {
    latestVideoId
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_2__.useSelect)(select => {
    if (!vpContext.resolved.isPreview) return {
      latestVideoId: null
    };
    const {
      getEntityRecords
    } = select('core');
    const query = {
      post_type: 'attachment',
      mime_type: 'video',
      per_page: 1,
      _fields: 'id'
    };
    const media = getEntityRecords('postType', 'attachment', query);
    return {
      latestVideoId: media?.[0]?.id
    };
  }, [vpContext.resolved.isPreview]);
  const effectiveAttachmentId = postId || latestVideoId;
  const position = attributes.position || context['videopack/position'] || 'top';
  const blockProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.useBlockProps)({
    className: `videopack-view-count-block videopack-view-count-wrapper ${vpContext.classes} ${isOverlay ? `is-overlay position-${position}` : ''} ${isInsideThumbnail ? 'is-inside-thumbnail' : ''} ${isInsidePlayerOverlay ? 'is-inside-player' : ''} ${!effectiveAttachmentId ? 'no-title' : ''} has-text-align-${finalTextAlign}`,
    style: vpContext.style
  });
  const THEME_COLORS = videopack_config?.themeColors;
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.BlockControls, {
      children: [isOverlay && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.BlockVerticalAlignmentControl, {
        value: position,
        onChange: nextPosition => {
          setAttributes({
            position: nextPosition || undefined
          });
        }
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.AlignmentControl, {
        value: finalTextAlign,
        onChange: nextAlign => {
          setAttributes({
            textAlign: nextAlign
          });
        }
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToolbarGroup, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Icon Type', 'video-embed-thumbnail-generator'),
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToolbarButton, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_5__["default"],
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('No Icon', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            iconType: 'none'
          }),
          isPressed: iconType === 'none'
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToolbarButton, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_6__["default"],
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Eye Icon', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            iconType: 'eye'
          }),
          isPressed: iconType === 'eye'
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToolbarButton, {
          icon: _assets_icon__WEBPACK_IMPORTED_MODULE_8__.play,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Play Icon (Filled)', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            iconType: 'play'
          }),
          isPressed: iconType === 'play'
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToolbarButton, {
          icon: _assets_icon__WEBPACK_IMPORTED_MODULE_8__.playOutline,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Play Icon (Outline)', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            iconType: 'playOutline'
          }),
          isPressed: iconType === 'playOutline'
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToolbarGroup, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Display Options', 'video-embed-thumbnail-generator'),
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToolbarButton, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_4__["default"],
          label: showText ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Hide "views" text', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Show "views" text', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            showText: !showText
          }),
          isPressed: showText
        })
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.InspectorControls, {
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Colors', 'video-embed-thumbnail-generator'),
        initialOpen: true,
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)("div", {
          className: "videopack-color-section",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)("p", {
            className: "videopack-settings-section-title",
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Colors', 'video-embed-thumbnail-generator')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)("div", {
            className: "videopack-color-flex-row",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_9__["default"], {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Text', 'video-embed-thumbnail-generator'),
                value: title_color,
                onChange: value => setAttributes({
                  title_color: value
                }),
                colors: THEME_COLORS,
                fallbackValue: colorFallbacks.title_color
              })
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_9__["default"], {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Background', 'video-embed-thumbnail-generator'),
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
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(ViewCount, {
      blockProps: blockProps,
      iconType: iconType,
      showText: showText,
      postId: effectiveAttachmentId,
      isInsideThumbnail: isInsideThumbnail,
      context: context
    })]
  });
}

/***/ },

/***/ "./src/blocks/watermark/edit.js"
/*!**************************************!*\
  !*** ./src/blocks/watermark/edit.js ***!
  \**************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   VideoWatermark: () => (/* binding */ VideoWatermark),
/* harmony export */   "default": () => (/* binding */ Edit),
/* harmony export */   getWatermarkBlockStyles: () => (/* binding */ getWatermarkBlockStyles)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _components_WatermarkPositioner_WatermarkPositioner__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../components/WatermarkPositioner/WatermarkPositioner */ "./src/components/WatermarkPositioner/WatermarkPositioner.js");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/download.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/home.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/image.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/link.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/not-allowed.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/page.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/post.mjs");
/* harmony import */ var _utils_context__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../utils/context */ "./src/utils/context.js");
/* harmony import */ var _hooks_useVideopackContext__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../hooks/useVideopackContext */ "./src/hooks/useVideopackContext.js");
/* harmony import */ var _editor_scss__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./editor.scss */ "./src/blocks/watermark/editor.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__);
/* global ResizeObserver */











/**
 * Internal component to display the watermark with correct positioning and fallback.
 *
 * @param {Object} props         Component props.
 * @param {Object} props.context Block context.
 * @return {Object} The rendered component.
 */

function VideoWatermark({
  attributes = {},
  context = {},
  isBlockEditor = false,
  onDimensions = null
}) {
  const {
    resolved
  } = (0,_hooks_useVideopackContext__WEBPACK_IMPORTED_MODULE_13__["default"])(attributes, context);
  const {
    watermark: effectiveUrl,
    watermark_scale: actualScale = 10,
    watermark_align: actualAlign = 'right',
    watermark_valign: actualValign = 'bottom',
    watermark_x: actualX = 5,
    watermark_y: actualY = 7,
    skin
  } = resolved;
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
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)("div", {
    className: `videopack-video-watermark ${skin}`,
    style: style,
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)("img", {
      src: effectiveUrl,
      alt: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Watermark', 'video-embed-thumbnail-generator'),
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

/**
 * Helper to calculate watermark positioning styles for the block wrapper.
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
  if (!style.transform) delete style.transform;
  return style;
}

/**
 * Edit component for the Video Watermark block.
 *
 * @param {Object}   props               Component props.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Function to update block attributes.
 * @param {Object}   props.context       Block context.
 *
 * @return {Object} The component.
 */
function Edit({
  attributes,
  setAttributes,
  context,
  isSelected
}) {
  const containerRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useRef)(null);
  const [containerDimensions, setContainerDimensions] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(null);
  const [detectedAspectRatio, setDetectedAspectRatio] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(null);

  // Measure the parent container dimensions for accurate positioning.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
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
  const {
    watermark,
    watermark_scale = 10,
    watermark_align = 'right',
    watermark_valign = 'bottom',
    watermark_x = 5,
    watermark_y = 7,
    watermark_link_to = 'false',
    watermark_url = ''
  } = attributes;

  // Use unified context hook for all design and behavior resolution
  const {
    resolved
  } = (0,_hooks_useVideopackContext__WEBPACK_IMPORTED_MODULE_13__["default"])(attributes, context);
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
  const overlayStyles = isOverlay || context.isPreview ? getWatermarkBlockStyles(resolved) : {};

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
  const blockProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.useBlockProps)({
    className: `videopack-video-watermark-block ${isOverlay ? 'is-overlay' : ''} ${isSelected ? 'is-selected' : ''}`,
    style: activeOverlayStyles
  });
  if (!effectiveUrl) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)("div", {
      ...blockProps,
      className: "videopack-video-watermark-placeholder",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.MediaPlaceholder, {
        icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_7__["default"],
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Watermark Image', 'video-embed-thumbnail-generator'),
        onSelect: media => setAttributes({
          watermark: media.url
        }),
        accept: "image/*",
        allowedTypes: ['image']
      })
    });
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsxs)("div", {
    ...blockProps,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsxs)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.BlockControls, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.MediaReplaceFlow, {
        mediaURL: watermark,
        allowedTypes: ['image'],
        accept: "image/*",
        onSelect: media => setAttributes({
          watermark: media.url
        }),
        name: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Replace Watermark', 'video-embed-thumbnail-generator')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarGroup, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Link To', 'video-embed-thumbnail-generator'),
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarButton, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_9__["default"],
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('No Link', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            watermark_link_to: 'false'
          }),
          isPressed: effectiveLinkToType === 'false'
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarButton, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_6__["default"],
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Link to Home Page', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            watermark_link_to: 'home'
          }),
          isPressed: effectiveLinkToType === 'home'
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarButton, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_11__["default"],
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Link to Parent Post', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            watermark_link_to: 'parent'
          }),
          isPressed: effectiveLinkToType === 'parent'
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarButton, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_5__["default"],
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Download Video', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            watermark_link_to: 'download'
          }),
          isPressed: effectiveLinkToType === 'download'
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarButton, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_10__["default"],
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Link to Attachment Page', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            watermark_link_to: 'attachment'
          }),
          isPressed: effectiveLinkToType === 'attachment'
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Dropdown, {
          popoverProps: {
            position: 'bottom center',
            className: 'videopack-url-popover'
          },
          renderToggle: ({
            isOpen,
            onToggle
          }) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarButton, {
            icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_8__["default"],
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Link to Custom URL', 'video-embed-thumbnail-generator'),
            onClick: () => {
              setAttributes({
                watermark_link_to: 'custom'
              });
              onToggle();
            },
            "aria-expanded": isOpen,
            isPressed: effectiveLinkToType === 'custom'
          }),
          renderContent: () => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)("div", {
            style: {
              padding: '12px',
              minWidth: '260px'
            },
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextControl, {
              __nextHasNoMarginBottom: true,
              __next40pxDefaultSize: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Custom URL', 'video-embed-thumbnail-generator'),
              value: watermark_url,
              placeholder: "https://...",
              onChange: value => setAttributes({
                watermark_url: value
              })
            })
          })
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.InspectorControls, {
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Watermark Settings', 'video-embed-thumbnail-generator'),
        initialOpen: true,
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.RangeControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Scale (%)', 'video-embed-thumbnail-generator'),
          value: effectiveScale,
          onChange: value => setAttributes({
            watermark_scale: value
          }),
          min: 1,
          max: 100
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsxs)("div", {
          style: {
            display: 'flex',
            gap: '10px'
          },
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Horizontal Align', 'video-embed-thumbnail-generator'),
            value: effectiveAlign,
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
            onChange: value => setAttributes({
              watermark_align: value
            }),
            style: {
              flex: 1
            }
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Vertical Align', 'video-embed-thumbnail-generator'),
            value: effectiveValign,
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
            onChange: value => setAttributes({
              watermark_valign: value
            }),
            style: {
              flex: 1
            }
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.RangeControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Horizontal Offset (%)', 'video-embed-thumbnail-generator'),
          value: effectiveX,
          onChange: value => setAttributes({
            watermark_x: value
          }),
          min: 0,
          max: 100,
          step: 0.01
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.RangeControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Vertical Offset (%)', 'video-embed-thumbnail-generator'),
          value: effectiveY,
          onChange: value => setAttributes({
            watermark_y: value
          }),
          min: 0,
          max: 100,
          step: 0.01
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Link to', 'video-embed-thumbnail-generator'),
          value: effectiveLinkToType,
          onChange: value => setAttributes({
            watermark_link_to: value
          }),
          options: [{
            value: 'false',
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('None', 'video-embed-thumbnail-generator')
          }, {
            value: 'home',
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Home page', 'video-embed-thumbnail-generator')
          }, {
            value: 'parent',
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Parent post', 'video-embed-thumbnail-generator')
          }, {
            value: 'download',
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Download video', 'video-embed-thumbnail-generator')
          }, {
            value: 'attachment',
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Video attachment page', 'video-embed-thumbnail-generator')
          }, {
            value: 'custom',
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Custom URL', 'video-embed-thumbnail-generator')
          }]
        }), effectiveLinkToType === 'custom' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Watermark URL', 'video-embed-thumbnail-generator'),
          value: effectiveCustomLinkUrl,
          onChange: value => setAttributes({
            watermark_url: value
          })
        })]
      })
    }), isOverlay && containerDimensions && isSelected ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)("div", {
      ref: containerRef,
      style: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'auto'
      },
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_components_WatermarkPositioner_WatermarkPositioner__WEBPACK_IMPORTED_MODULE_4__["default"], {
        containerDimensions: containerDimensions,
        settings: attributes,
        onChange: newAttrs => setAttributes(newAttrs),
        isSelected: isSelected,
        showBackground: false,
        aspectRatio: detectedAspectRatio,
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(VideoWatermark, {
          attributes: attributes,
          context: context,
          isBlockEditor: true,
          onDimensions: setDetectedAspectRatio
        })
      })
    }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)("div", {
      ref: containerRef,
      style: {
        ...(isOverlay ? {
          width: '100%',
          height: '100%',
          position: 'relative'
        } : {})
      },
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(VideoWatermark, {
        attributes: attributes,
        context: context,
        isBlockEditor: isOverlay,
        onDimensions: setDetectedAspectRatio
      })
    })]
  });
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

/***/ "./src/components/Duotone/CustomDuotoneFilter.js"
/*!*******************************************************!*\
  !*** ./src/components/Duotone/CustomDuotoneFilter.js ***!
  \*******************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   parseColor: () => (/* binding */ parseColor)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__);


/**
 * Helper to parse hex/rgb colors into 0-1 range for SVG filters.
 */

const parseColor = color => {
  if (!color) return {
    r: 0,
    g: 0,
    b: 0,
    a: 1
  };
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    let r = 0,
      g = 0,
      b = 0,
      a = 255;
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
    if (!colors || colors.length < 2) return null;
    const c1 = parseColor(colors[0]);
    const c2 = parseColor(colors[1]);
    return {
      rValues: `${c1.r} ${c2.r}`,
      gValues: `${c1.g} ${c2.g}`,
      bValues: `${c1.b} ${c2.b}`,
      aValues: `${c1.a} ${c2.a}`
    };
  }, [colors]);
  if (!filterData) return null;
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

/***/ },

/***/ "./src/components/InspectorControls/CollectionColorSettings.js"
/*!*********************************************************************!*\
  !*** ./src/components/InspectorControls/CollectionColorSettings.js ***!
  \*********************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ CollectionColorSettings)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../CompactColorPicker/CompactColorPicker */ "./src/components/CompactColorPicker/CompactColorPicker.js");
/* harmony import */ var _utils_colors__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../utils/colors */ "./src/utils/colors.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
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
  const colorFallbacks = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useMemo)(() => (0,_utils_colors__WEBPACK_IMPORTED_MODULE_4__.getColorFallbacks)(effectiveValues), [effectiveValues]);
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
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_3__["default"], {
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
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_3__["default"], {
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
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_3__["default"], {
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
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_3__["default"], {
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
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_3__["default"], {
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
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_3__["default"], {
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
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_3__["default"], {
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
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_3__["default"], {
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
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_3__["default"], {
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
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_3__["default"], {
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

/***/ "./src/components/InspectorControls/CollectionFilterSettings.js"
/*!**********************************************************************!*\
  !*** ./src/components/InspectorControls/CollectionFilterSettings.js ***!
  \**********************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ CollectionFilterSettings)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/close.mjs");
/* harmony import */ var _wordpress_html_entities__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/html-entities */ "@wordpress/html-entities");
/* harmony import */ var _wordpress_html_entities__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_html_entities__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
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
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_2__["default"],
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

/***/ "./src/components/InspectorControls/CollectionLayoutSettings.js"
/*!**********************************************************************!*\
  !*** ./src/components/InspectorControls/CollectionLayoutSettings.js ***!
  \**********************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ CollectionLayoutSettings)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__);



function CollectionLayoutSettings({
  attributes,
  setAttributes,
  options = {}
}) {
  const {
    gallery_columns,
    overlay_title,
    gallery_end,
    gallery_pagination
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

/***/ "./src/components/InspectorControls/CollectionQuerySettings.js"
/*!*********************************************************************!*\
  !*** ./src/components/InspectorControls/CollectionQuerySettings.js ***!
  \*********************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ CollectionQuerySettings)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _assets_icon__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../assets/icon */ "./src/assets/icon.js");
/* harmony import */ var _QuerySettings__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./QuerySettings */ "./src/components/InspectorControls/QuerySettings.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__);






function CollectionQuerySettings({
  attributes,
  setAttributes,
  queryData,
  options = {},
  showManualSource = true,
  isSiteEditor = false,
  hasPaginationBlock = true
}) {
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
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_QuerySettings__WEBPACK_IMPORTED_MODULE_4__["default"], {
      attributes: attributes,
      setAttributes: setAttributes,
      queryData: queryData,
      showArchiveSource: isSiteEditor,
      showManualSource: showManualSource
    }), gallery_source === 'archive' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Prioritize Post Data', 'video-embed-thumbnail-generator'),
      help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Use the title and date from the original post instead of the video attachment.', 'video-embed-thumbnail-generator'),
      checked: !!attributes.prioritizePostData,
      onChange: val => setAttributes({
        prioritizePostData: val
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
      className: "videopack-sort-control-wrapper",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SelectControl, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Sort by', 'video-embed-thumbnail-generator'),
        value: gallery_orderby,
        onChange: val => setAttributes({
          gallery_orderby: val
        }),
        options: orderbyOptions
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        icon: gallery_order === 'asc' ? _assets_icon__WEBPACK_IMPORTED_MODULE_3__.sortAscending : _assets_icon__WEBPACK_IMPORTED_MODULE_3__.sortDescending,
        label: gallery_order === 'asc' ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Ascending', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Descending', 'video-embed-thumbnail-generator'),
        onClick: () => setAttributes({
          gallery_order: gallery_order === 'asc' ? 'desc' : 'asc'
        }),
        showTooltip: true
      })]
    }), !!gallery_pagination || !!hasPaginationBlock ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Number of videos per page', 'video-embed-thumbnail-generator'),
      type: "number",
      value: gallery_per_page ?? '',
      placeholder: options.gallery_per_page,
      onChange: val => updateNumericAttribute('gallery_per_page', val)
    }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.Fragment, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
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
      }), !!enable_collection_video_limit && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
        __nextHasNoMarginBottom: true,
        __next40pxDefaultSize: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Video Limit', 'video-embed-thumbnail-generator'),
        help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Maximum number of videos to show when pagination is disabled.', 'video-embed-thumbnail-generator'),
        type: "number",
        value: Number(collection_video_limit) === -1 ? 12 : collection_video_limit ?? '',
        onChange: val => updateNumericAttribute('collection_video_limit', val)
      })]
    }), !hasPaginationBlock && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
      __nextHasNoMarginBottom: true,
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Enable Pagination', 'video-embed-thumbnail-generator'),
      checked: !!gallery_pagination,
      onChange: val => setAttributes({
        gallery_pagination: val
      })
    })]
  });
}

/***/ },

/***/ "./src/components/InspectorControls/CollectionSettingsPanel.js"
/*!*********************************************************************!*\
  !*** ./src/components/InspectorControls/CollectionSettingsPanel.js ***!
  \*********************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ CollectionSettingsPanel)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _CollectionQuerySettings__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./CollectionQuerySettings */ "./src/components/InspectorControls/CollectionQuerySettings.js");
/* harmony import */ var _CollectionFilterSettings__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./CollectionFilterSettings */ "./src/components/InspectorControls/CollectionFilterSettings.js");
/* harmony import */ var _CollectionLayoutSettings__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./CollectionLayoutSettings */ "./src/components/InspectorControls/CollectionLayoutSettings.js");
/* harmony import */ var _CollectionColorSettings__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./CollectionColorSettings */ "./src/components/InspectorControls/CollectionColorSettings.js");
/* harmony import */ var _CollectionSettingsPanel_scss__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./CollectionSettingsPanel.scss */ "./src/components/InspectorControls/CollectionSettingsPanel.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__);








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
  hasPaginationBlock = true
}) {
  const {
    excludedVideos
  } = queryData;
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelBody, {
      title: showGalleryOptions ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Query Settings', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('List Settings', 'video-embed-thumbnail-generator'),
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_CollectionQuerySettings__WEBPACK_IMPORTED_MODULE_2__["default"], {
        attributes: attributes,
        setAttributes: setAttributes,
        queryData: queryData,
        options: options,
        showManualSource: showManualSource,
        isSiteEditor: isSiteEditor,
        hasPaginationBlock: hasPaginationBlock
      }), excludedVideos && excludedVideos.length > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_CollectionFilterSettings__WEBPACK_IMPORTED_MODULE_3__["default"], {
        attributes: attributes,
        setAttributes: setAttributes,
        queryData: queryData
      })]
    }), showLayoutSettings && showGalleryOptions && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Layout Settings', 'video-embed-thumbnail-generator'),
      initialOpen: showGalleryOptions,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_CollectionLayoutSettings__WEBPACK_IMPORTED_MODULE_4__["default"], {
        attributes: attributes,
        setAttributes: setAttributes,
        options: options
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Colors', 'video-embed-thumbnail-generator'),
      initialOpen: true,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_CollectionColorSettings__WEBPACK_IMPORTED_MODULE_5__["default"], {
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

/***/ "./src/components/InspectorControls/QuerySettings.js"
/*!***********************************************************!*\
  !*** ./src/components/InspectorControls/QuerySettings.js ***!
  \***********************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ QuerySettings)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_html_entities__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/html-entities */ "@wordpress/html-entities");
/* harmony import */ var _wordpress_html_entities__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_html_entities__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__);




function QuerySettings({
  attributes,
  setAttributes,
  queryData,
  showArchiveSource = true,
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
    currentPost,
    isResolvingSearch
  } = queryData;
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
      value: currentPost.id,
      label: (0,_wordpress_html_entities__WEBPACK_IMPORTED_MODULE_2__.decodeEntities)(currentPost.title.rendered)
    });
  }
  if (searchResults) {
    searchResults.forEach(post => {
      if (!optionsForSelect.find(o => o.value === post.id)) {
        optionsForSelect.push({
          value: post.id,
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
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SelectControl, {
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
    }), gallery_source === 'custom' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ComboboxControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Search Posts', 'video-embed-thumbnail-generator'),
      value: gallery_id,
      options: optionsForSelect,
      onFilterValueChange: debouncedSetSearchString,
      onChange: newValue => setAttributes({
        gallery_id: newValue ? parseInt(newValue, 10) : undefined
      }),
      help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Start typing to search for a post or page.', 'video-embed-thumbnail-generator'),
      allowReset: true,
      isLoading: isResolvingSearch
    }), gallery_source === 'category' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SelectControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Select Category', 'video-embed-thumbnail-generator'),
      value: gallery_category,
      options: [{
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Select…', 'video-embed-thumbnail-generator'),
        value: ''
      }, ...mapTermsToOptions(categories)],
      onChange: attributeChangeFactory('gallery_category')
    }), gallery_source === 'tag' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SelectControl, {
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

/***/ "./src/components/Pagination/Pagination.js"
/*!*************************************************!*\
  !*** ./src/components/Pagination/Pagination.js ***!
  \*************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Pagination)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _hooks_useVideopackContext__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../hooks/useVideopackContext */ "./src/hooks/useVideopackContext.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__);



/**
 * A standardized pagination component for use in both blocks and previews.
 *
 * @param {Object}   props              Component props.
 * @param {number}   props.currentPage  The current active page.
 * @param {number}   props.totalPages   The total number of pages.
 * @param {Function} props.onPageChange Callback when a page is changed.
 * @param {Object}   props.attributes   Optional. Block attributes for color resolution.
 * @param {Object}   props.context      Optional. Block context for color resolution.
 */

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  attributes = {},
  context = {},
  style: propStyle
}) {
  const vpContext = (0,_hooks_useVideopackContext__WEBPACK_IMPORTED_MODULE_1__["default"])(attributes, context);
  if (totalPages <= 1) {
    return null;
  }
  const {
    pagination_color,
    pagination_background_color,
    pagination_active_bg_color,
    pagination_active_color
  } = vpContext.resolved;
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

    if (totalPages <= showMax + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show page 1
      pages.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust start/end to always show 3 numbers in the middle if possible
      if (currentPage <= 3) {
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }
      if (start > 2) {
        pages.push('...');
      }
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (end < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }
    return pages;
  };
  const pages = getPageNumbers();
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("nav", {
    className: "videopack-pagination",
    "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Pagination', 'video-embed-thumbnail-generator'),
    style: style,
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("ul", {
      className: "videopack-pagination-list",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("li", {
        className: "videopack-pagination-item",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("button", {
          className: `videopack-pagination-button prev page-numbers ${currentPage <= 1 ? 'is-hidden videopack-hidden' : ''}`,
          onClick: () => currentPage > 1 && onPageChange(currentPage - 1),
          "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Previous Page', 'video-embed-thumbnail-generator'),
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("span", {
            className: "videopack-pagination-arrow",
            children: "<"
          })
        })
      }), pages.map((page, index) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("li", {
        className: "videopack-pagination-item",
        children: page === '...' ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("span", {
          className: "page-numbers dots",
          children: page
        }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("button", {
          className: `videopack-pagination-button page-numbers ${page === currentPage ? 'is-active current' : ''}`,
          onClick: () => typeof page === 'number' && onPageChange(page),
          "aria-current": page === currentPage ? 'page' : undefined,
          children: page
        })
      }, index)), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("li", {
        className: "videopack-pagination-item",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("button", {
          className: `videopack-pagination-button next page-numbers ${currentPage >= totalPages ? 'is-hidden videopack-hidden' : ''}`,
          onClick: () => currentPage < totalPages && onPageChange(currentPage + 1),
          "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Next Page', 'video-embed-thumbnail-generator'),
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("span", {
            className: "videopack-pagination-arrow",
            children: ">"
          })
        })
      })]
    })
  });
}

/***/ },

/***/ "./src/components/Preview/BlockPreview.js"
/*!************************************************!*\
  !*** ./src/components/Preview/BlockPreview.js ***!
  \************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ BlockPreview)
/* harmony export */ });
/* harmony import */ var _blocks_title_edit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../blocks/title/edit */ "./src/blocks/title/edit.js");
/* harmony import */ var _blocks_view_count_edit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../blocks/view-count/edit */ "./src/blocks/view-count/edit.js");
/* harmony import */ var _blocks_watermark_edit__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../blocks/watermark/edit */ "./src/blocks/watermark/edit.js");
/* harmony import */ var _blocks_duration_edit__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../blocks/duration/edit */ "./src/blocks/duration/edit.js");
/* harmony import */ var _blocks_play_button_edit__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../blocks/play-button/edit */ "./src/blocks/play-button/edit.js");
/* harmony import */ var _blocks_thumbnail_VideoThumbnailPreview__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../blocks/thumbnail/VideoThumbnailPreview */ "./src/blocks/thumbnail/VideoThumbnailPreview.js");
/* harmony import */ var _utils_context__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../utils/context */ "./src/utils/context.js");
/* harmony import */ var _VideoPlayer_VideoPlayer__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../VideoPlayer/VideoPlayer */ "./src/components/VideoPlayer/VideoPlayer.js");
/* harmony import */ var _parts_CollectionWrapper__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./parts/CollectionWrapper */ "./src/components/Preview/parts/CollectionWrapper.js");
/* harmony import */ var _parts_VideoLoop__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./parts/VideoLoop */ "./src/components/Preview/parts/VideoLoop.js");
/* harmony import */ var _parts_Pagination__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./parts/Pagination */ "./src/components/Preview/parts/Pagination.js");
/* harmony import */ var _blocks_player_container_block_json__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../blocks/player-container/block.json */ "./src/blocks/player-container/block.json");
/* harmony import */ var _blocks_thumbnail_block_json__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../blocks/thumbnail/block.json */ "./src/blocks/thumbnail/block.json");
/* harmony import */ var _blocks_title_block_json__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../blocks/title/block.json */ "./src/blocks/title/block.json");
/* harmony import */ var _blocks_duration_block_json__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../blocks/duration/block.json */ "./src/blocks/duration/block.json");
/* harmony import */ var _blocks_view_count_block_json__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../../blocks/view-count/block.json */ "./src/blocks/view-count/block.json");
/* harmony import */ var _blocks_watermark_block_json__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../../blocks/watermark/block.json */ "./src/blocks/watermark/block.json");
/* harmony import */ var _blocks_play_button_block_json__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../../blocks/play-button/block.json */ "./src/blocks/play-button/block.json");
/* harmony import */ var _blocks_shared_design_context__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../../blocks/shared/design-context */ "./src/blocks/shared/design-context.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__);




















const BLOCK_METADATA = {
  'videopack/player-container': _blocks_player_container_block_json__WEBPACK_IMPORTED_MODULE_11__,
  'videopack/thumbnail': _blocks_thumbnail_block_json__WEBPACK_IMPORTED_MODULE_12__,
  'videopack/title': _blocks_title_block_json__WEBPACK_IMPORTED_MODULE_13__,
  'videopack/duration': _blocks_duration_block_json__WEBPACK_IMPORTED_MODULE_14__,
  'videopack/view-count': _blocks_view_count_block_json__WEBPACK_IMPORTED_MODULE_15__,
  'videopack/watermark': _blocks_watermark_block_json__WEBPACK_IMPORTED_MODULE_16__,
  'videopack/play-button': _blocks_play_button_block_json__WEBPACK_IMPORTED_MODULE_17__
};

/**
 * Get all registered attributes for a block name, including shared design attributes.
 */
const getBlockAttributes = name => {
  const metadata = BLOCK_METADATA[name];
  const keys = [];
  if (metadata?.attributes) {
    keys.push(...Object.keys(metadata.attributes));
  }

  // Add shared design attributes that blocks might use via context but pass as props
  keys.push(...Object.keys(_blocks_shared_design_context__WEBPACK_IMPORTED_MODULE_18__.designAttributes || {}));

  // Global internal keys that should never hit the DOM
  keys.push('variation', 'isPreview', 'isOverlay', 'isInsideThumbnail', 'isInsidePlayerOverlay', 'isInsidePlayerContainer');
  return [...new Set(keys)];
};
const PREVIEW_COMPONENTS = {
  'videopack/player-container': props => {
    const name = 'videopack/player-container';
    const {
      children,
      className,
      postId,
      postType,
      isOverlay,
      isInsideThumbnail,
      isInsidePlayerOverlay,
      isInsidePlayerContainer,
      downloadlink,
      embedcode,
      attributes = {},
      context = {},
      innerBlocks,
      video,
      resolvedDuotoneClass,
      isPreview,
      tagName: Tag = 'div',
      // Catch-all for everything else
      ...allProps
    } = props;

    // 1. Identify which keys are valid block attributes that should NOT go to the DOM
    const blockAttributeKeys = getBlockAttributes(name);

    // 2. Separate DOM props from Block props
    const cleanDomProps = {};
    const blockProps = {};
    Object.keys(allProps).forEach(key => {
      if (blockAttributeKeys.includes(key)) {
        blockProps[key] = allProps[key];
      } else if (!key.startsWith('videopack/') && typeof allProps[key] !== 'object' && typeof allProps[key] !== 'function') {
        // Only standard primitives that aren't videopack-internal keys go to DOM
        cleanDomProps[key] = allProps[key];
      }
    });
    const loopDuotoneId = context['videopack/loopDuotoneId'];
    const activeDuotone = blockProps.duotone || attributes?.style?.color?.duotone || attributes?.duotone;
    let finalDuotoneClass = resolvedDuotoneClass || '';
    if (loopDuotoneId) {
      finalDuotoneClass = ''; // Loop handles the filter via its own class on the parent
    } else if (!finalDuotoneClass && activeDuotone) {
      if (typeof activeDuotone === 'string' && activeDuotone.startsWith('var:preset|duotone|')) {
        finalDuotoneClass = `wp-duotone-${activeDuotone.split('|').pop()}`;
      } else if (Array.isArray(activeDuotone)) {
        const idPrefix = Math.random().toString(36).substr(2, 9);
        finalDuotoneClass = `videopack-custom-duotone-${idPrefix}`;
      }
    }
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsx)(Tag, {
      className: `videopack-video-block-container videopack-wrapper ${className || ''} ${finalDuotoneClass}`,
      ...cleanDomProps,
      children: children
    });
  },
  'videopack/collection': _parts_CollectionWrapper__WEBPACK_IMPORTED_MODULE_8__["default"],
  'videopack/loop': _parts_VideoLoop__WEBPACK_IMPORTED_MODULE_9__["default"],
  'videopack/pagination': _parts_Pagination__WEBPACK_IMPORTED_MODULE_10__["default"],
  'videopack/thumbnail': props => {
    const name = 'videopack/thumbnail';
    const {
      attributes = {},
      ...allProps
    } = props;
    const blockAttributeKeys = getBlockAttributes(name);
    const cleanDomProps = {};
    Object.keys(allProps).forEach(key => {
      if (!blockAttributeKeys.includes(key) && !key.startsWith('videopack/') && typeof allProps[key] !== 'object' && typeof allProps[key] !== 'function') {
        cleanDomProps[key] = allProps[key];
      }
    });
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsx)(_blocks_thumbnail_VideoThumbnailPreview__WEBPACK_IMPORTED_MODULE_5__.VideoThumbnailPreview, {
      ...props,
      ...cleanDomProps
    });
  },
  'videopack/title': props => {
    const name = 'videopack/title';
    const {
      attributes = {},
      ...allProps
    } = props;
    const blockAttributeKeys = getBlockAttributes(name);
    const cleanDomProps = {};
    Object.keys(allProps).forEach(key => {
      if (!blockAttributeKeys.includes(key) && !key.startsWith('videopack/') && typeof allProps[key] !== 'object' && typeof allProps[key] !== 'function') {
        cleanDomProps[key] = allProps[key];
      }
    });
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsx)(_blocks_title_edit__WEBPACK_IMPORTED_MODULE_0__.VideoTitle, {
      ...props,
      ...cleanDomProps
    });
  },
  'videopack/duration': props => {
    const name = 'videopack/duration';
    const {
      attributes = {},
      ...allProps
    } = props;
    const blockAttributeKeys = getBlockAttributes(name);
    const cleanDomProps = {};
    Object.keys(allProps).forEach(key => {
      if (!blockAttributeKeys.includes(key) && !key.startsWith('videopack/') && typeof allProps[key] !== 'object' && typeof allProps[key] !== 'function') {
        cleanDomProps[key] = allProps[key];
      }
    });
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsx)(_blocks_duration_edit__WEBPACK_IMPORTED_MODULE_3__.VideoDuration, {
      ...props,
      ...cleanDomProps
    });
  },
  'videopack/view-count': props => {
    const name = 'videopack/view-count';
    const {
      attributes = {},
      ...allProps
    } = props;
    const blockAttributeKeys = getBlockAttributes(name);
    const cleanDomProps = {};
    Object.keys(allProps).forEach(key => {
      if (!blockAttributeKeys.includes(key) && !key.startsWith('videopack/') && typeof allProps[key] !== 'object' && typeof allProps[key] !== 'function') {
        cleanDomProps[key] = allProps[key];
      }
    });
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsx)(_blocks_view_count_edit__WEBPACK_IMPORTED_MODULE_1__.ViewCount, {
      ...props,
      ...cleanDomProps
    });
  },
  'videopack/play-button': props => {
    const name = 'videopack/play-button';
    const {
      attributes = {},
      ...allProps
    } = props;
    const blockAttributeKeys = getBlockAttributes(name);
    const cleanDomProps = {};
    Object.keys(allProps).forEach(key => {
      if (!blockAttributeKeys.includes(key) && !key.startsWith('videopack/') && typeof allProps[key] !== 'object' && typeof allProps[key] !== 'function') {
        cleanDomProps[key] = allProps[key];
      }
    });
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsx)(_blocks_play_button_edit__WEBPACK_IMPORTED_MODULE_4__.PlayButton, {
      ...props,
      ...cleanDomProps
    });
  },
  'videopack/watermark': props => {
    const name = 'videopack/watermark';
    const {
      attributes = {},
      ...allProps
    } = props;
    const blockAttributeKeys = getBlockAttributes(name);
    const cleanDomProps = {};
    Object.keys(allProps).forEach(key => {
      if (!blockAttributeKeys.includes(key) && !key.startsWith('videopack/') && typeof allProps[key] !== 'object' && typeof allProps[key] !== 'function') {
        cleanDomProps[key] = allProps[key];
      }
    });
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsx)(_blocks_watermark_edit__WEBPACK_IMPORTED_MODULE_2__.VideoWatermark, {
      ...props,
      ...cleanDomProps
    });
  },
  'videopack/player': ({
    children,
    attributes,
    context,
    video
  }) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsx)("div", {
    className: "videopack-video-preview",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsx)(_VideoPlayer_VideoPlayer__WEBPACK_IMPORTED_MODULE_7__["default"], {
      attributes: {
        ...attributes,
        id: video?.attachment_id,
        title: video?.title,
        sources: video?.player_vars?.sources,
        poster: video?.poster_url || attributes.poster,
        starts: video?.player_vars?.starts,
        // Prioritize video URL from resolution over the raw attribute URL
        src: video?.url || (!attributes.id ? attributes.src : undefined),
        isInsidePlayerOverlay: true,
        isInsidePlayerContainer: true,
        duotone: attributes.duotone || context['videopack/duotone'],
        style: attributes.style || context['videopack/style']
      },
      context: context,
      isSelected: false,
      children: children
    })
  })
};

/**
 * Renders a preview for a single Videopack block by name.
 *
 * @param {Object} props            Component props.
 * @param {string} props.name       The name of the block (e.g., 'videopack/thumbnail').
 * @param {Object} props.attributes The block attributes.
 * @param {Object} props.context    The inherited context.
 * @param {Object} props.children   Child components/inner blocks.
 * @return {Element|null} The rendered component.
 */
function BlockPreview({
  name,
  attributes = {},
  context = {},
  children,
  ...props
}) {
  const Component = PREVIEW_COMPONENTS[name];
  if (!Component) {
    return children || null;
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_19__.jsx)(Component, {
    ...attributes,
    attributes: attributes,
    context: context,
    ...props,
    children: children
  });
}

/***/ },

/***/ "./src/components/Preview/TemplatePreview.js"
/*!***************************************************!*\
  !*** ./src/components/Preview/TemplatePreview.js ***!
  \***************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ TemplatePreview)
/* harmony export */ });
/* harmony import */ var _BlockPreview__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BlockPreview */ "./src/components/Preview/BlockPreview.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__);


/**
 * Recursive engine for rendering a list of blocks (a template).
 *
 * @param {Object} props             Component props.
 * @param {Array}  props.template    Array of block structures.
 * @param {Object} props.video       The current video record context.
 * @param {Object} props.context     The inherited block context.
 * @param {Object} props.parentFlags Internal state flags for nesting logic.
 * @return {Array} Array of rendered block previews.
 */

function TemplatePreview({
  template = [],
  video = {},
  context = {},
  parentFlags = {}
}) {
  return template.map((block, index) => {
    const [name, attributes = {}, innerBlocks = []] = Array.isArray(block) ? block : [block.name, block.attributes, block.innerBlocks];
    const itemKey = `${video.attachment_id || 'sample'}-${name}-${index}`;
    const currentFlags = {
      ...parentFlags
    };
    if (name === 'videopack/thumbnail') {
      currentFlags.isInsideThumbnail = true;
      currentFlags.downloadlink = false;
      currentFlags.embedcode = false;
    }
    if (name === 'videopack/player') {
      currentFlags.isInsidePlayerOverlay = true;
      currentFlags.isInsidePlayerContainer = true;
    }
    const isOverlay = !!currentFlags.isInsideThumbnail || !!currentFlags.isInsidePlayerOverlay;
    const itemContext = {
      ...context,
      ...currentFlags,
      'videopack/isInsideThumbnail': currentFlags.isInsideThumbnail,
      'videopack/isInsidePlayerOverlay': currentFlags.isInsidePlayerOverlay,
      'videopack/isInsidePlayerContainer': currentFlags.isInsidePlayerContainer,
      'videopack/downloadlink': currentFlags.downloadlink,
      'videopack/embedcode': currentFlags.embedcode,
      'videopack/postId': video.attachment_id,
      'videopack/title': video.title
    };
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_BlockPreview__WEBPACK_IMPORTED_MODULE_0__["default"], {
      name: name,
      attributes: attributes,
      postId: video.attachment_id,
      isOverlay: isOverlay,
      video: video,
      innerBlocks: innerBlocks,
      ...currentFlags,
      context: itemContext,
      children: innerBlocks.length > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(TemplatePreview, {
        template: innerBlocks,
        video: video,
        context: itemContext,
        parentFlags: currentFlags
      })
    }, itemKey);
  });
}

/***/ },

/***/ "./src/components/Preview/index.js"
/*!*****************************************!*\
  !*** ./src/components/Preview/index.js ***!
  \*****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BlockPreview: () => (/* reexport safe */ _BlockPreview__WEBPACK_IMPORTED_MODULE_0__["default"]),
/* harmony export */   CollectionWrapper: () => (/* reexport safe */ _parts_CollectionWrapper__WEBPACK_IMPORTED_MODULE_2__["default"]),
/* harmony export */   Pagination: () => (/* reexport safe */ _parts_Pagination__WEBPACK_IMPORTED_MODULE_4__["default"]),
/* harmony export */   TemplatePreview: () => (/* reexport safe */ _TemplatePreview__WEBPACK_IMPORTED_MODULE_1__["default"]),
/* harmony export */   VideoLoop: () => (/* reexport safe */ _parts_VideoLoop__WEBPACK_IMPORTED_MODULE_3__["default"])
/* harmony export */ });
/* harmony import */ var _BlockPreview__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BlockPreview */ "./src/components/Preview/BlockPreview.js");
/* harmony import */ var _TemplatePreview__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./TemplatePreview */ "./src/components/Preview/TemplatePreview.js");
/* harmony import */ var _parts_CollectionWrapper__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./parts/CollectionWrapper */ "./src/components/Preview/parts/CollectionWrapper.js");
/* harmony import */ var _parts_VideoLoop__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./parts/VideoLoop */ "./src/components/Preview/parts/VideoLoop.js");
/* harmony import */ var _parts_Pagination__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./parts/Pagination */ "./src/components/Preview/parts/Pagination.js");
/**
 * Barrel export for the Videopack Preview system.
 */







/***/ },

/***/ "./src/components/Preview/parts/CollectionWrapper.js"
/*!***********************************************************!*\
  !*** ./src/components/Preview/parts/CollectionWrapper.js ***!
  \***********************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ CollectionWrapper)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);

/**
 * Wrapper for Videopack Collection Previews.
 */
function CollectionWrapper({
  children,
  attributes = {},
  context = {}
}) {
  const layout = attributes.layout || context['videopack/layout'] || 'grid';
  const columns = attributes.columns || context['videopack/columns'] || 3;
  const align = attributes.align || context['videopack/align'] || '';
  const play_button_color = attributes.play_button_color || context['videopack/play_button_color'];
  const play_button_secondary_color = attributes.play_button_secondary_color || context['videopack/play_button_secondary_color'];
  const skin = attributes.skin || context['videopack/skin'] || '';
  const duotone = attributes?.style?.color?.duotone || attributes?.duotone || context['videopack/duotone'];
  let duotoneClass = '';
  if (duotone && typeof duotone === 'string' && duotone.startsWith('var:preset|duotone|')) {
    duotoneClass = `wp-duotone-${duotone.split('|').pop()}`;
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
    className: `videopack-collection videopack-wrapper layout-${layout} columns-${columns}${align ? ` align${align}` : ''} ${skin} ${play_button_color ? 'videopack-has-play-button-color' : ''} ${play_button_secondary_color ? 'videopack-has-play-button-secondary-color' : ''} ${duotoneClass}`,
    style: {
      '--videopack-collection-columns': columns,
      '--videopack-title-color': attributes.title_color || context['videopack/title_color'],
      '--videopack-title-background-color': attributes.title_background_color || context['videopack/title_background_color'],
      '--videopack-play-button-color': attributes.play_button_color || context['videopack/play_button_color'],
      '--videopack-play-button-secondary-color': attributes.play_button_secondary_color || context['videopack/play_button_secondary_color']
    },
    children: children
  });
}

/***/ },

/***/ "./src/components/Preview/parts/Pagination.js"
/*!****************************************************!*\
  !*** ./src/components/Preview/parts/Pagination.js ***!
  \****************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Pagination)
/* harmony export */ });
/* harmony import */ var _Pagination_Pagination__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../Pagination/Pagination */ "./src/components/Pagination/Pagination.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__);


/**
 * Preview component for Videopack Pagination.
 */

function Pagination({
  attributes = {},
  context = {}
}) {
  const paginationColor = attributes.pagination_color || context['videopack/pagination_color'];
  const paginationBg = attributes.pagination_background_color || context['videopack/pagination_background_color'];
  const paginationActiveColor = attributes.pagination_active_color || context['videopack/pagination_active_color'];
  const paginationActiveBg = attributes.pagination_active_bg_color || context['videopack/pagination_active_bg_color'];
  const currentPage = context['videopack/currentPage'] || 1;
  const totalPages = context['videopack/totalPages'] || 1;
  const onPageChange = context['videopack/onPageChange'] || (() => {});
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_Pagination_Pagination__WEBPACK_IMPORTED_MODULE_0__["default"], {
    currentPage: currentPage,
    totalPages: totalPages,
    onPageChange: onPageChange,
    style: {
      '--videopack-pagination-color': paginationColor,
      '--videopack-pagination-bg': paginationBg,
      '--videopack-pagination-active-color': paginationActiveColor,
      '--videopack-pagination-active-bg': paginationActiveBg
    }
  });
}

/***/ },

/***/ "./src/components/Preview/parts/VideoLoop.js"
/*!***************************************************!*\
  !*** ./src/components/Preview/parts/VideoLoop.js ***!
  \***************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ VideoLoop)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _TemplatePreview__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../TemplatePreview */ "./src/components/Preview/TemplatePreview.js");
/* harmony import */ var _Duotone_CustomDuotoneFilter__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../Duotone/CustomDuotoneFilter */ "./src/components/Duotone/CustomDuotoneFilter.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__);




/**
 * Loop component for rendering multiple Videopack items.
 */

function VideoLoop({
  children,
  attributes = {},
  context = {},
  innerBlocks
}) {
  const videos = context['videopack/videos'] || attributes.videos || [];
  const layout = context['videopack/layout'] || 'grid';
  const columns = context['videopack/columns'] || 3;
  const play_button_color = attributes.play_button_color || context['videopack/play_button_color'];
  const play_button_secondary_color = attributes.play_button_secondary_color || context['videopack/play_button_secondary_color'];
  const duotone = attributes?.style?.color?.duotone || attributes?.duotone || context['videopack/duotone'];
  const loopDuotoneId = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    if (!duotone || !Array.isArray(duotone)) return null;
    return `videopack-loop-duotone-${Math.random().toString(36).substr(2, 9)}`;
  }, [duotone]);
  const loopPresetClass = duotone && typeof duotone === 'string' && duotone.startsWith('var:preset|duotone|') ? `wp-duotone-${duotone.split('|').pop()}` : '';
  const loopContext = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    if (!loopDuotoneId) return context;
    return {
      ...context,
      'videopack/loopDuotoneId': loopDuotoneId
    };
  }, [context, loopDuotoneId]);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
    className: `videopack-video-loop layout-${layout} columns-${columns} ${play_button_color ? 'videopack-has-play-button-color' : ''} ${play_button_secondary_color ? 'videopack-has-play-button-secondary-color' : ''} ${loopDuotoneId || ''} ${loopPresetClass}`,
    style: {
      '--videopack-play-button-color': play_button_color || undefined,
      '--videopack-play-button-secondary-color': play_button_secondary_color || undefined,
      '--videopack-title-color': context['videopack/title_color'] || undefined,
      '--videopack-title-background-color': context['videopack/title_background_color'] || undefined
    },
    children: [loopDuotoneId && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.Fragment, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_Duotone_CustomDuotoneFilter__WEBPACK_IMPORTED_MODULE_2__["default"], {
        colors: duotone,
        id: loopDuotoneId
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("style", {
        children: `
							.${loopDuotoneId} .vjs-poster,
							.${loopDuotoneId} .mejs-poster,
							.${loopDuotoneId} .videopack-thumbnail {
								filter: url(#${loopDuotoneId}) !important;
							}
							.${loopDuotoneId} .vjs-poster .vjs-poster,
							.${loopDuotoneId} .mejs-poster .mejs-poster {
								filter: none !important;
							}
							.${loopDuotoneId} .wp-block-videopack-player-container,
							.${loopDuotoneId} .wp-block-videopack-thumbnail,
							.${loopDuotoneId} [class*="wp-duotone-"] {
								filter: none !important;
							}
						`
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
      className: "videopack-collection-grid",
      children: videos.map((video, index) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
        className: "videopack-collection-item",
        children: innerBlocks ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_TemplatePreview__WEBPACK_IMPORTED_MODULE_1__["default"], {
          template: innerBlocks,
          video: video,
          context: loopContext
        }) : children
      }, video.attachment_id || index))
    })]
  });
}

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

/***/ "./src/components/VideoPlayer/GenericPlayer.js"
/*!*****************************************************!*\
  !*** ./src/components/VideoPlayer/GenericPlayer.js ***!
  \*****************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__);
/**
 * A generic HTML5 video player component.
 */



/**
 * GenericPlayer component.
 *
 * @param {Object}      props             Component props.
 * @param {string}      props.poster      URL for the video poster image.
 * @param {boolean}     props.loop        Whether the video should loop.
 * @param {boolean}     props.autoPlay    Whether the video should autoplay.
 * @param {string}      props.preload     Preload setting (auto, metadata, none).
 * @param {boolean}     props.controls    Whether to show video controls.
 * @param {boolean}     props.muted       Whether the video is muted.
 * @param {boolean}     props.playsInline Whether the video should play inline on mobile.
 * @param {string}      props.className   Additional CSS classes.
 * @param {Array}       props.sources     List of video source objects.
 * @param {string}      props.src         Primary video source URL.
 * @param {Array}       props.tracks      List of text track (label, src, kind, etc.) objects.
 * @param {React.Ref}   ref               Reference to the video element.
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
  tracks = []
}, ref) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("video", {
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

/***/ },

/***/ "./src/components/VideoPlayer/VideoJs.js"
/*!***********************************************!*\
  !*** ./src/components/VideoPlayer/VideoJs.js ***!
  \***********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   VideoJS: () => (/* binding */ VideoJS),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
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
    onMetadataLoaded
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
        videoRef.current.appendChild(videoElement);
        const playerOptions = {
          ...options,
          fluid: options.fluid !== undefined ? options.fluid : true
        };
        playerRef.current = vjs(videoElement, playerOptions, function () {
          if (onReady) {
            onReady(this);
          }
          this.on('play', onPlay);
          this.on('pause', onPause);
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
  }, [options, skin, onPlay, onPause, onReady, onMetadataLoaded]);

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

/***/ },

/***/ "./src/components/VideoPlayer/VideoPlayer.js"
/*!***************************************************!*\
  !*** ./src/components/VideoPlayer/VideoPlayer.js ***!
  \***************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_html_entities__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/html-entities */ "@wordpress/html-entities");
/* harmony import */ var _wordpress_html_entities__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_html_entities__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/hooks */ "@wordpress/hooks");
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _hooks_useVideopackContext__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../hooks/useVideopackContext */ "./src/hooks/useVideopackContext.js");
/* harmony import */ var _GenericPlayer_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./GenericPlayer.js */ "./src/components/VideoPlayer/GenericPlayer.js");
/* harmony import */ var _VideoJs_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./VideoJs.js */ "./src/components/VideoPlayer/VideoJs.js");
/* harmony import */ var _WpMejsPlayer_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./WpMejsPlayer.js */ "./src/components/VideoPlayer/WpMejsPlayer.js");
/* harmony import */ var _Duotone_CustomDuotoneFilter__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../Duotone/CustomDuotoneFilter */ "./src/components/Duotone/CustomDuotoneFilter.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__);
/**
 * Main VideoPlayer component that orchestrates different player engines and UI overlays.
 */











const DEFAULT_PLAYERS = {
  'Video.js': _VideoJs_js__WEBPACK_IMPORTED_MODULE_6__["default"],
  'WordPress Default': _WpMejsPlayer_js__WEBPACK_IMPORTED_MODULE_7__["default"],
  None: _GenericPlayer_js__WEBPACK_IMPORTED_MODULE_5__["default"]
};

// Make sure to pass isSelected from the block's edit component.
const noop = () => {};

/**
 * VideoPlayer component.
 *
 * @param {Object}   props               Component props.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Object}   props.context       Inherited block context.
 * @param {Function} props.setAttributes Function to update block attributes.
 * @param {boolean}  props.isSelected    Whether the block is selected.
 * @param {boolean}  props.hideStaticOverlays Whether to hide site-wide static overlays (watermark, title).
 * @param {Function} props.onReady       Callback fired when the player engine is ready.
 * @param {Object}   props.children      Child components (InnerBlocks).
 * @return {Element|null} The rendered component.
 */
const VideoPlayer = ({
  attributes = {},
  context = {},
  setAttributes = noop,
  onReady = noop,
  isSelected = false,
  hideStaticOverlays = false,
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
  } = (0,_hooks_useVideopackContext__WEBPACK_IMPORTED_MODULE_4__["default"])(blockAttributes, context);
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
    auto_codec,
    sources: incomingSources = [],
    source_groups: incomingSourceGroups = {},
    text_tracks = [],
    playback_rate,
    default_ratio,
    // Design settings resolved from context
    play_button_color,
    play_button_secondary_color,
    control_bar_bg_color,
    control_bar_color,
    title_color,
    title_background_color,
    skin,
    embed_method = 'Video.js',
    duotone,
    title: rawTitle,
    caption,
    fixed_aspect,
    fullwidth,
    rotate,
    loopDuotoneId
  } = resolved;
  const title = rawTitle ? (0,_wordpress_html_entities__WEBPACK_IMPORTED_MODULE_2__.decodeEntities)(rawTitle) : rawTitle;
  const source_groups = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    // If we have valid groups, use them (handle empty array vs object)
    if (incomingSourceGroups && !Array.isArray(incomingSourceGroups) && Object.keys(incomingSourceGroups).length > 0) {
      return incomingSourceGroups;
    }

    // Fallback: Group flat sources by codec
    if (incomingSources.length > 0) {
      const groups = {};
      incomingSources.forEach(s => {
        const codec = s.codec || 'h264';
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
  const final_play_button_color = play_button_color;
  const final_play_button_secondary_color = play_button_secondary_color;
  const final_control_bar_bg_color = control_bar_bg_color;
  const final_control_bar_color = control_bar_color;
  const final_title_color = title_color;
  const final_title_background_color = title_background_color;

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
  const players = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_3__.applyFilters)('videopack_admin_players', DEFAULT_PLAYERS), []);
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
    const classes = [...contextClasses, 'videopack-video-block-container', 'videopack-wrapper'];
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
  const videoRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const finalizedSources = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    // Priority 1: Sources from groups
    if (Object.keys(source_groups).length > 0) {
      const groupedSources = Object.values(source_groups).flatMap(g => g.sources || []);
      if (groupedSources.length > 0) return groupedSources.filter(s => s && s.src);
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
  const uniqueKey = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    if (blockAttributes.id) {
      return `${blockAttributes.id}-${JSON.stringify(source_groups)}`;
    }
    return Math.random().toString(36).substr(2, 9);
  }, [blockAttributes.id, source_groups]);
  const genericPlayerOptions = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => ({
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
    autoPlay: final_embed_method === 'WordPress Default' ? false : actualAutoplay
  }), [poster, loop, actualAutoplay, preload, controls, muted, volume, playsinline, src, finalizedSources, text_tracks, final_embed_method] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const videoJsOptions = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    const isVjs = (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_3__.applyFilters)('videopack_is_videojs_player', final_embed_method === 'Video.js', final_embed_method);
    if (!isVjs) {
      return null;
    }
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
          default_res: auto_res,
          default_codec: auto_codec
        }
      };
    }
    return options;
  }, [final_embed_method, actualAutoplay, controls, muted, preload, poster, loop, playback_rate, playsinline, volume, auto_res, auto_codec, finalizedSources, source_groups, text_tracks, aspectRatio]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePlay = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    if (wrapperRef.current) {
      const metaElements = wrapperRef.current.querySelectorAll('.videopack-video-title, .videopack-meta-wrapper');
      metaElements.forEach(el => el.classList.remove('videopack-video-title-visible'));
    }
  }, []);
  const handlePause = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    if (wrapperRef.current) {
      const metaElements = wrapperRef.current.querySelectorAll('.videopack-video-title, .videopack-meta-wrapper');
      metaElements.forEach(el => el.classList.add('videopack-video-title-visible'));
    }
  }, []);
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
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
    className: wrapperClasses,
    ref: wrapperRef,
    style: playerStyles,
    id: instanceId,
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)("div", {
      className: `videopack-player ${final_embed_method === 'Video.js' ? final_skin || '' : ''} ${!loopDuotoneId && resolvedDuotoneClass ? resolvedDuotoneClass : ''}`,
      style: {
        ...innerPlayerStyles,
        position: 'relative'
      },
      "data-id": blockAttributes.id,
      children: [(() => {
        const PlayerComponent = players[final_embed_method] || players.None;
        if (final_embed_method === 'Video.js') {
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(PlayerComponent, {
            options: videoJsOptions,
            skin: final_skin,
            onPlay: handlePlay,
            onPause: handlePause,
            onReady: handleVideoPlayerReady,
            onMetadataLoaded: onMetadataLoaded
          }, `videojs-${src}-${resetKey}-${uniqueKey}-${blockAttributes.restartCount || 0}`);
        }
        if (final_embed_method === 'WordPress Default') {
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(PlayerComponent, {
            options: genericPlayerOptions,
            controls: controls,
            actualAutoplay: actualAutoplay,
            onReady: handleMejsReady,
            onPlay: handlePlay,
            playback_rate: playback_rate,
            aspectRatio: aspectRatio,
            onMetadataLoaded: onMetadataLoaded,
            source_groups: source_groups
          }, `wpvideo-${src}-${resetKey}-${uniqueKey}-${blockAttributes.restartCount || 0}`);
        }
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(PlayerComponent, {
          options: PlayerComponent === _VideoJs_js__WEBPACK_IMPORTED_MODULE_6__["default"] || PlayerComponent === _WpMejsPlayer_js__WEBPACK_IMPORTED_MODULE_7__["default"] ? videoJsOptions || genericPlayerOptions : undefined,
          ...(PlayerComponent === _GenericPlayer_js__WEBPACK_IMPORTED_MODULE_5__["default"] ? genericPlayerOptions : {}),
          skin: final_skin,
          onPlay: handlePlay,
          onPause: handlePause,
          onReady: handleVideoPlayerReady,
          onMetadataLoaded: onMetadataLoaded,
          source_groups: source_groups
        }, `${final_embed_method}-${src}-${resetKey}-${uniqueKey}-${blockAttributes.restartCount || 0}`);
      })(), Array.isArray(final_duotone) && resolvedDuotoneClass && !loopDuotoneId && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.Fragment, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_Duotone_CustomDuotoneFilter__WEBPACK_IMPORTED_MODULE_8__["default"], {
          colors: final_duotone,
          id: resolvedDuotoneClass
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("style", {
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

/***/ },

/***/ "./src/components/VideoPlayer/WpMejsPlayer.js"
/*!****************************************************!*\
  !*** ./src/components/VideoPlayer/WpMejsPlayer.js ***!
  \****************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
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
    actualAutoplay
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
        } catch (e) {
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
        const autoPlayHandler = () => {
          if (curAutoplay && playerRef.current) {
            try {
              playerRef.current.play();
            } catch (e) {
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
                  } catch (e) {
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
                    } catch (err) {
                      // Silence metadata errors
                    }
                    if (media) {
                      media.removeEventListener('loadedmetadata', sizeOnMetadata);
                    }
                  };
                  media.addEventListener('loadedmetadata', sizeOnMetadata);
                }
              } catch (outerErr) {
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
      } catch (e) {
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
  }, [uniqueKey]);

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

/***/ "./src/features/classic-embed/components/ClassicEmbed.js"
/*!***************************************************************!*\
  !*** ./src/features/classic-embed/components/ClassicEmbed.js ***!
  \***************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ClassicEmbed)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _components_VideoSettings_VideoSettings__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../components/VideoSettings/VideoSettings */ "./src/components/VideoSettings/VideoSettings.js");
/* harmony import */ var _components_InspectorControls_CollectionSettingsPanel__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../components/InspectorControls/CollectionSettingsPanel */ "./src/components/InspectorControls/CollectionSettingsPanel.js");
/* harmony import */ var _components_Thumbnails_Thumbnails_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../components/Thumbnails/Thumbnails.js */ "./src/components/Thumbnails/Thumbnails.js");
/* harmony import */ var _components_AdditionalFormats_AdditionalFormats_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../components/AdditionalFormats/AdditionalFormats.js */ "./src/components/AdditionalFormats/AdditionalFormats.js");
/* harmony import */ var _hooks_useVideoQuery__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../hooks/useVideoQuery */ "./src/hooks/useVideoQuery.js");
/* harmony import */ var _hooks_useVideoData__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../../hooks/useVideoData */ "./src/hooks/useVideoData.js");
/* harmony import */ var _hooks_useVideoProbe__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../../hooks/useVideoProbe */ "./src/hooks/useVideoProbe.js");
/* harmony import */ var _utils_helpers__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../../utils/helpers */ "./src/utils/helpers.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__);
/**
 * Component to handle classic embed logic and UI.
 */














/**
 * ClassicEmbed component.
 *
 * @param {Object} props           Component props.
 * @param {Object} props.options   Plugin options.
 * @param {number} props.postId    The ID of the current post.
 * @param {string} props.activeTab Initial active tab.
 * @return {Object} The rendered component.
 */

function ClassicEmbed({
  options,
  postId,
  activeTab
}) {
  const normalizedOptions = (0,_utils_helpers__WEBPACK_IMPORTED_MODULE_11__.normalizeOptions)(options);

  // Retrieve editAttributes passed from PHP if editing an existing shortcode via TinyMCE
  const editAttributes = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => {
    const config = window.videopack_classic_editor_config || {};
    const attrs = config.editAttributes || {};
    const normalized = {
      ...attrs
    };

    // Numeric fields
    const numericFields = ['gallery_id', 'gallery_per_page', 'gallery_columns', 'collection_video_limit'];
    numericFields.forEach(field => {
      if (normalized[field] !== undefined) {
        normalized[field] = parseInt(normalized[field], 10);
      }
    });

    // Boolean fields
    const booleanFields = ['gallery_pagination', 'gallery_title', 'enable_collection_video_limit', 'autoplay', 'loop', 'muted', 'controls', 'downloadlink'];
    booleanFields.forEach(field => {
      if (normalized[field] !== undefined) {
        normalized[field] = normalized[field] === 'true' || normalized[field] === '1';
      }
    });

    // Handle legacy 'videos' attribute (maps to collection_video_limit)
    if (normalized.videos !== undefined) {
      const videoLimit = parseInt(normalized.videos, 10);
      if (!isNaN(videoLimit)) {
        normalized.collection_video_limit = videoLimit;
        normalized.enable_collection_video_limit = true;
      }
    }
    return normalized;
  }, []);
  const initialVideoUrl = editAttributes.url || '';

  // Toggle a class on the body when in TinyMCE edit mode so we can hide headers/tabs
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (editAttributes.tinymce_edit) {
      document.body.classList.add('videopack-is-editing');
      return () => {
        document.body.classList.remove('videopack-is-editing');
      };
    }
  }, [editAttributes.tinymce_edit]);
  const [videoUrl, setVideoUrl] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(initialVideoUrl);
  const [debouncedVideoUrl, setDebouncedVideoUrl] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(initialVideoUrl);
  const [resolvedId, setResolvedId] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [isResolving, setIsResolving] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const {
    isProbing,
    probedMetadata
  } = (0,_hooks_useVideoProbe__WEBPACK_IMPORTED_MODULE_10__["default"])(debouncedVideoUrl);
  const [probedMetadataOverride, setProbedMetadataOverride] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);

  // Debounce the video URL for all downstream logic and rendering
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (videoUrl === debouncedVideoUrl) {
      return;
    }
    const timeoutId = setTimeout(() => {
      setIsResolving(true);
      setDebouncedVideoUrl(videoUrl);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [videoUrl, debouncedVideoUrl]);
  const [singleAttributes, setSingleAttributes] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)({
    autoplay: !!normalizedOptions.autoplay,
    loop: !!normalizedOptions.loop,
    muted: !!normalizedOptions.muted,
    controls: !!normalizedOptions.controls,
    downloadlink: !!normalizedOptions.downloadlink,
    preload: normalizedOptions.preload || 'metadata',
    ...editAttributes // override with whatever came from the shortcode
  });
  const [galleryAttributes, setGalleryAttributes] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)({
    gallery: true,
    gallery_orderby: normalizedOptions.gallery_orderby || 'menu_order',
    gallery_order: normalizedOptions.gallery_order || 'asc',
    gallery_pagination: !!normalizedOptions.gallery_pagination,
    gallery_per_page: parseInt(normalizedOptions.gallery_per_page, 10) || 6,
    gallery_columns: parseInt(normalizedOptions.gallery_columns, 10) || 4,
    gallery_title: !!normalizedOptions.gallery_title,
    gallery_end: normalizedOptions.gallery_end || '',
    gallery_source: 'current',
    gallery_id: postId,
    ...editAttributes // override with whatever came from the shortcode
  });
  const [listAttributes, setListAttributes] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)({
    gallery: false,
    gallery_orderby: normalizedOptions.gallery_orderby || 'menu_order',
    gallery_order: normalizedOptions.gallery_order || 'asc',
    gallery_pagination: !!normalizedOptions.gallery_pagination,
    gallery_per_page: parseInt(normalizedOptions.gallery_per_page, 10) || 6,
    gallery_title: !!normalizedOptions.gallery_title,
    gallery_end: normalizedOptions.gallery_end || '',
    gallery_source: 'current',
    gallery_id: postId,
    collection_video_limit: normalizedOptions.collection_video_limit || -1,
    enable_collection_video_limit: !!normalizedOptions.enable_collection_video_limit,
    ...editAttributes // override with whatever came from the shortcode
  });
  const activeAttributes = activeTab === 'gallery' ? galleryAttributes : listAttributes;
  const queryData = (0,_hooks_useVideoQuery__WEBPACK_IMPORTED_MODULE_8__["default"])(activeAttributes, postId);
  const videoData = (0,_hooks_useVideoData__WEBPACK_IMPORTED_MODULE_9__.useVideoData)(resolvedId, debouncedVideoUrl, !resolvedId);
  const [urlError, setUrlError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');

  // Validate URL
  const isValidUrl = url => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (e) {
      return false;
    }
  };

  // Resolve URL to Attachment ID
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    const controller = new AbortController();
    if (!debouncedVideoUrl || !isValidUrl(debouncedVideoUrl)) {
      setResolvedId(null);
      setIsResolving(false);
      setUrlError('');
      return;
    }
    setUrlError('');
    setIsResolving(true);
    // Note: We no longer setResolvedId(null) immediately.
    // This keeps the previous settings/thumbnails visible (though potentially stale)
    // until the new URL is resolved, preventing a jarring UI disappearance.

    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3___default()({
      path: '/videopack/v1/resolve-url',
      method: 'POST',
      data: {
        url: debouncedVideoUrl,
        post_id: postId
      },
      signal: controller.signal
    }).then(response => {
      if (response.attachment_id) {
        setResolvedId(response.attachment_id);
        setSingleAttributes(prev => ({
          ...prev,
          id: response.attachment_id
        }));
      } else {
        setResolvedId(null);
      }
    }).catch(error => {
      if (error.name === 'AbortError') {
        return;
      }
      // eslint-disable-next-line no-console
      console.error('Error resolving video URL:', error);
      setResolvedId(null);
    }).finally(() => {
      setIsResolving(false);
    });
    return () => controller.abort();
  }, [debouncedVideoUrl, postId]);

  // Sync metadata from videoData when it loads
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (videoData?.record?.media_details && !probedMetadata) {
      const {
        width,
        height,
        duration
      } = videoData.record.media_details;
      setProbedMetadataOverride({
        width,
        height,
        duration,
        isTainted: false // Internal media is never tainted
      });
    } else if (!debouncedVideoUrl) {
      setProbedMetadataOverride(null);
    }
  }, [videoData, probedMetadata, debouncedVideoUrl]);
  const effectiveMetadata = probedMetadataOverride || probedMetadata;

  // Sync metadata from videoData when it loads
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (videoData.attachment && resolvedId) {
      setSingleAttributes(prev => {
        // Avoid unnecessary updates
        if (prev.poster === videoData.poster && prev.poster_id === videoData.poster_id && prev.title === videoData.title && prev.caption === videoData.caption) {
          return prev;
        }
        return {
          ...prev,
          poster: videoData.poster !== undefined ? videoData.poster : prev.poster,
          poster_id: videoData.poster_id !== undefined ? videoData.poster_id : prev.poster_id,
          title: videoData.title !== undefined ? videoData.title : prev.title,
          caption: videoData.caption !== undefined ? videoData.caption : prev.caption
        };
      });
    }
  }, [videoData.attachment, videoData.poster, videoData.poster_id, videoData.title, videoData.caption, resolvedId]);

  // Keep resolvedId in sync with singleAttributes.id when updated by child components
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (singleAttributes.id && singleAttributes.id !== resolvedId) {
      setResolvedId(singleAttributes.id);
    }
  }, [singleAttributes.id, resolvedId]);
  const onInsert = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(type => {
    let shortcode = '';
    const filterAttributes = (current, defaults) => {
      const filtered = {};
      Object.keys(current).forEach(key => {
        let val = current[key];
        let defaultVal = defaults[key];

        // Normalize booleans/strings for comparison
        if (typeof val === 'boolean') {
          val = val ? 'true' : 'false';
        }
        if (typeof defaultVal === 'boolean') {
          defaultVal = defaultVal ? 'true' : 'false';
        }

        // Skip if it matches the default, unless it's a critical identifying attribute
        if (val === defaultVal && key !== 'gallery' && key !== 'id') {
          return;
        }

        // Special cases
        if (key === 'gallery_id' && Number(val) === Number(postId)) {
          return;
        }
        filtered[key] = current[key];
      });
      return filtered;
    };
    if (type === 'single') {
      const finalAttributes = {
        ...singleAttributes
      };
      if (resolvedId && videoData) {
        // Remove attributes that match the attachment's own metadata
        if (finalAttributes.poster === videoData.poster) {
          delete finalAttributes.poster;
        }
        if (finalAttributes.poster_id === videoData.poster_id) {
          delete finalAttributes.poster_id;
        }
        if (finalAttributes.title === videoData.title) {
          delete finalAttributes.title;
        }
        if (finalAttributes.caption === videoData.caption) {
          delete finalAttributes.caption;
        }
      }

      // Filter against plugin defaults
      const filtered = filterAttributes(finalAttributes, normalizedOptions);
      shortcode = (0,_utils_helpers__WEBPACK_IMPORTED_MODULE_11__.generateShortcode)('videopack', filtered, videoUrl);
    } else if (type === 'gallery') {
      const filtered = filterAttributes(galleryAttributes, normalizedOptions);
      shortcode = (0,_utils_helpers__WEBPACK_IMPORTED_MODULE_11__.generateShortcode)('videopack', filtered);
    } else {
      // List type
      const filtered = filterAttributes(listAttributes, normalizedOptions);
      shortcode = (0,_utils_helpers__WEBPACK_IMPORTED_MODULE_11__.generateShortcode)('videopack', filtered);
    }
    if (editAttributes.tinymce_edit && window.parent && window.parent.videopack_tinymce_update_shortcode) {
      window.parent.videopack_tinymce_update_shortcode(shortcode);
    } else if (window.parent && window.parent.send_to_editor) {
      window.parent.send_to_editor(shortcode);
    } else if (window.send_to_editor) {
      window.send_to_editor(shortcode);
    }
  }, [singleAttributes, videoUrl, galleryAttributes, listAttributes, videoData, normalizedOptions, postId, resolvedId, editAttributes.tinymce_edit]);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
    className: "videopack-classic-embed-outer",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
      className: "videopack-classic-embed",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("div", {
        className: "videopack-tab-content",
        children: [activeTab === 'single' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.Fragment, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelBody, {
            title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Video URL', 'video-embed-thumbnail-generator'),
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('URL', 'video-embed-thumbnail-generator'),
              value: videoUrl,
              onChange: newUrl => {
                setVideoUrl(newUrl);
                // Immediately clear ID and metadata to prevent stale association
                setResolvedId(null);
                setSingleAttributes(prev => ({
                  ...prev,
                  id: 0,
                  poster: undefined,
                  poster_id: undefined,
                  title: undefined,
                  caption: undefined
                }));
              },
              help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Enter the URL of the video file (e.g., .mp4, .webm).', 'video-embed-thumbnail-generator')
            }), urlError && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
              style: {
                color: '#d94f4f',
                marginTop: '8px',
                fontSize: '13px'
              },
              children: urlError
            })]
          }), debouncedVideoUrl && isValidUrl(debouncedVideoUrl) && !isResolving && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.Fragment, {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_components_Thumbnails_Thumbnails_js__WEBPACK_IMPORTED_MODULE_6__["default"], {
              attributes: singleAttributes,
              src: debouncedVideoUrl,
              setAttributes: newAttrs => setSingleAttributes(prev => ({
                ...prev,
                ...newAttrs
              })),
              videoData: videoData,
              options: options,
              parentId: postId || 0,
              isProbing: isProbing,
              probedMetadata: effectiveMetadata
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_components_VideoSettings_VideoSettings__WEBPACK_IMPORTED_MODULE_4__["default"], {
              attributes: singleAttributes,
              setAttributes: newAttrs => setSingleAttributes(prev => ({
                ...prev,
                ...newAttrs
              })),
              options: options,
              isProbing: isProbing,
              probedMetadata: effectiveMetadata
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_components_AdditionalFormats_AdditionalFormats_js__WEBPACK_IMPORTED_MODULE_7__["default"], {
              attributes: singleAttributes,
              src: debouncedVideoUrl,
              setAttributes: newAttrs => setSingleAttributes(prev => ({
                ...prev,
                ...newAttrs
              })),
              options: options,
              parentId: postId || 0,
              probedMetadata: effectiveMetadata,
              isProbing: isProbing
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
            className: "videopack-insert-button-wrapper",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
              variant: "primary",
              onClick: () => onInsert('single'),
              disabled: !videoUrl || !isValidUrl(videoUrl),
              children: editAttributes.tinymce_edit ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Update', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Insert into Post', 'video-embed-thumbnail-generator')
            })
          })]
        }), activeTab === 'gallery' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.Fragment, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_components_InspectorControls_CollectionSettingsPanel__WEBPACK_IMPORTED_MODULE_5__["default"], {
            attributes: galleryAttributes,
            setAttributes: newAttrs => setGalleryAttributes(prev => ({
              ...prev,
              ...newAttrs
            })),
            queryData: queryData,
            options: normalizedOptions,
            showGalleryOptions: true,
            showManualSource: false,
            hasPaginationBlock: false
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
            className: "videopack-insert-button-wrapper",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
              variant: "primary",
              onClick: () => onInsert('gallery'),
              children: editAttributes.tinymce_edit ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Update', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Insert into Post', 'video-embed-thumbnail-generator')
            })
          })]
        }), activeTab === 'list' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.Fragment, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_components_InspectorControls_CollectionSettingsPanel__WEBPACK_IMPORTED_MODULE_5__["default"], {
            attributes: listAttributes,
            setAttributes: newAttrs => setListAttributes(prev => ({
              ...prev,
              ...newAttrs
            })),
            queryData: queryData,
            options: normalizedOptions,
            showGalleryOptions: false,
            showManualSource: false,
            hasPaginationBlock: false
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
            className: "videopack-insert-button-wrapper",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
              variant: "primary",
              onClick: () => onInsert('list'),
              children: editAttributes.tinymce_edit ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Update', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Insert into Post', 'video-embed-thumbnail-generator')
            })
          })]
        })]
      })
    })
  });
}

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

/***/ "./src/hooks/useVideoData.js"
/*!***********************************!*\
  !*** ./src/hooks/useVideoData.js ***!
  \***********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useVideoData: () => (/* binding */ useVideoData)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/**
 * Custom React hook for fetching video data.
 */





/**
 * Hook to fetch and manage video attachment data from the WordPress core data store.
 *
 * @param {number}  id         The attachment ID.
 * @param {string}  src        The video source URL.
 * @param {boolean} isExternal Whether the video is from an external source.
 * @return {Object} Video data including poster, total thumbnails, and loading state.
 */
const useVideoData = (id, src, isExternal) => {
  const [videoData, setVideoData] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)({
    poster: undefined,
    poster_id: undefined,
    title: undefined,
    caption: undefined,
    total_thumbnails: undefined,
    attachment: undefined,
    error: null,
    isLoading: true
  });
  const {
    attachment,
    isResolving
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    if (!id || isExternal) {
      return {
        attachment: null,
        isResolving: false
      };
    }
    const coreSelector = select('core');
    return {
      attachment: coreSelector.getMedia(id),
      isResolving: coreSelector.isResolving('getMedia', [id])
    };
  }, [id, isExternal]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (isResolving) {
      setVideoData(prevData => ({
        ...prevData,
        isLoading: true
      }));
      return;
    }
    if (id && !isExternal && !attachment) {
      setVideoData({
        poster: undefined,
        total_thumbnails: undefined,
        attachment: null,
        error: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Could not find the video attachment.', 'video-embed-thumbnail-generator'),
        isLoading: false
      });
      return;
    }
    if (attachment) {
      setVideoData({
        poster: attachment?.meta?.['_videopack-meta']?.poster,
        poster_id: attachment?.meta?.['_videopack-meta']?.poster_id,
        title: attachment?.meta?.['_videopack-meta']?.title || attachment?.title?.rendered || attachment?.title || '',
        caption: (() => {
          const metaCaption = attachment?.meta?.['_videopack-meta']?.caption;
          if (metaCaption) {
            return metaCaption;
          }
          const rendered = attachment?.caption?.rendered || attachment?.caption || '';
          const externalUrl = attachment?.meta?.['_kgflashmediaplayer-externalurl'];
          if (externalUrl && rendered.trim().replace(/<\/?[^>]+(>|$)/g, '').trim() === externalUrl.trim()) {
            return '';
          }
          return rendered;
        })(),
        total_thumbnails: attachment?.meta?.['_videopack-meta']?.total_thumbnails,
        attachment,
        error: null,
        isLoading: false
      });
    } else {
      // This will handle external URLs and cases with no ID
      setVideoData({
        poster: undefined,
        poster_id: undefined,
        title: undefined,
        caption: undefined,
        total_thumbnails: undefined,
        attachment: null,
        error: null,
        isLoading: false
      });
    }
  }, [attachment, isResolving, id, isExternal, src]);
  return videoData;
};

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

/***/ "./src/hooks/useVideoQuery.js"
/*!************************************!*\
  !*** ./src/hooks/useVideoQuery.js ***!
  \************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ useVideoQuery)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/compose */ "@wordpress/compose");
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_compose__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _api_gallery__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../api/gallery */ "./src/api/gallery.js");





/**
 * Hook to query and search for videos or other content types in the WordPress database.
 *
 * @param {Object} attributes    Block attributes.
 * @param {number} previewPostId The ID of the post being previewed.
 * @return {Object} Query results including search results, categories, and tags.
 */
function useVideoQuery(attributes = {}, previewPostId) {
  if (!attributes) {
    attributes = {};
  }
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
  const postTypes = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
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
  const viewablePostTypes = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    return (postTypes || []).filter(type => type.viewable && type.slug !== 'attachment').map(type => type.slug);
  }, [postTypes]);
  const [videoResults, setVideoResults] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [totalResults, setTotalResults] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(0);
  const [maxNumPages, setMaxNumPages] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(1);
  const [isResolvingVideos, setIsResolvingVideos] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (isSaving || isAutosaving) {
      return;
    }
    const args = {
      gallery_orderby: gallery_orderby || 'post_date',
      gallery_order: gallery_order || 'DESC',
      gallery_per_page: parseInt(gallery_per_page, 10) || 6,
      page_number: parseInt(page_number, 10) || 1,
      gallery_id: ['current', 'custom'].includes(gallery_source) ? gallery_id ? parseInt(gallery_id, 10) : previewPostId ? parseInt(previewPostId, 10) : undefined : undefined,
      gallery_exclude: gallery_exclude || '',
      gallery_source: gallery_source || 'current',
      gallery_category: gallery_category || '',
      gallery_tag: gallery_tag || '',
      gallery_pagination: gallery_pagination ?? false,
      gallery_include: gallery_include || '',
      id: previewPostId,
      prioritizePostData: attributes.prioritizePostData || false,
      skip_html: true
    };

    // Skip query if required parameters for the source are missing
    const isMissingCustomId = gallery_source === 'custom' && !gallery_id;
    const isMissingCategoryId = gallery_source === 'category' && !gallery_category;
    const isMissingTagId = gallery_source === 'tag' && !gallery_tag;
    const isMissingCurrentId = gallery_source === 'current' && !gallery_id && !previewPostId;
    const isMissingManualInclude = gallery_source === 'manual' && !gallery_include;
    const canQuery = ['recent', 'all'].includes(gallery_source) || gallery_source && !isMissingCustomId && !isMissingCategoryId && !isMissingTagId && !isMissingCurrentId && !isMissingManualInclude;
    if (!canQuery) {
      setVideoResults([]);
      setTotalResults(0);
      setMaxNumPages(1);
      setIsResolvingVideos(false);
      return;
    }
    setIsResolvingVideos(true);
    (0,_api_gallery__WEBPACK_IMPORTED_MODULE_3__.getVideoGallery)(args).then(response => {
      setVideoResults(response.videos || []);
      setTotalResults(response.total_count || response.videos?.length || 0);
      setMaxNumPages(response.max_num_pages || 1);
    }).catch(error => {
      console.error('Video Query Error:', error);
    }).finally(() => {
      setIsResolvingVideos(false);
    });
  }, [gallery_id, gallery_source, gallery_category, gallery_tag, gallery_orderby, gallery_order, gallery_include, gallery_exclude, gallery_pagination, gallery_per_page, page_number, enable_collection_video_limit, collection_video_limit, previewPostId, attributes.prioritizePostData, isSaving, isAutosaving]);
  const searchResults = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    if (!searchString) {
      return [];
    }
    const {
      getEntityRecords
    } = select('core');
    return getEntityRecords('postType', viewablePostTypes, {
      s: searchString,
      per_page: 20
    });
  }, [searchString, viewablePostTypes]);
  const categories = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    const {
      getEntityRecords
    } = select('core');
    return getEntityRecords('taxonomy', 'category', {
      per_page: -1
    });
  }, []);
  const tags = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
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
  const customGalleries = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    const {
      getEntityRecords
    } = select('core');
    return getEntityRecords('postType', 'videopack_gallery', {
      per_page: -1
    });
  }, []);
  return {
    isResolving: isResolvingVideos,
    videoResults,
    totalResults,
    maxNumPages,
    searchResults,
    categories,
    tags,
    manualVideos,
    customGalleries,
    setSearch: debouncedSetSearchString
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
/* harmony export */   VIDEOPACK_CONTEXT_KEYS: () => (/* binding */ VIDEOPACK_CONTEXT_KEYS),
/* harmony export */   "default": () => (/* binding */ useVideopackContext),
/* harmony export */   isTrue: () => (/* reexport safe */ _utils_context__WEBPACK_IMPORTED_MODULE_2__.isTrue)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _utils_context__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/context */ "./src/utils/context.js");




const VIDEOPACK_CONTEXT_KEYS = ['skin', 'title_color', 'title_background_color', 'play_button_color', 'play_button_secondary_color', 'control_bar_bg_color', 'control_bar_color', 'pagination_color', 'pagination_background_color', 'pagination_active_bg_color', 'pagination_active_color', 'watermark', 'watermark_styles', 'watermark_link_to', 'align', 'gallery_per_page', 'gallery_source', 'gallery_id', 'gallery_category', 'gallery_tag', 'gallery_orderby', 'gallery_order', 'gallery_include', 'gallery_exclude', 'layout', 'columns', 'enable_collection_video_limit', 'collection_video_limit', 'prioritizePostData', 'embed_method', 'isPreview', 'isStandalone', 'src', 'poster', 'title', 'caption', 'width', 'height', 'autoplay', 'controls', 'loop', 'muted', 'playsinline', 'preload', 'volume', 'auto_res', 'auto_codec', 'sources', 'source_groups', 'text_tracks', 'playback_rate', 'downloadlink', 'embedcode', 'embedlink', 'showCaption', 'showBackground', 'title_position', 'restartCount', 'duotone', 'style', 'loopDuotoneId', 'fixed_aspect', 'fullwidth', 'rotate', 'default_ratio'];

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
    excludeHoverTrigger: optionsExclude = false
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
      const value = (0,_utils_context__WEBPACK_IMPORTED_MODULE_2__.getEffectiveValue)(key, attributes, context);
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
    resolved.isEditingAllPages = (0,_utils_context__WEBPACK_IMPORTED_MODULE_2__.isTrue)((0,_utils_context__WEBPACK_IMPORTED_MODULE_2__.getEffectiveValue)('isEditingAllPages', attributes, context));
    resolved.prioritizePostData = (0,_utils_context__WEBPACK_IMPORTED_MODULE_2__.isTrue)((0,_utils_context__WEBPACK_IMPORTED_MODULE_2__.getEffectiveValue)('prioritizePostData', attributes, context));
    resolved.isStandalone = (0,_utils_context__WEBPACK_IMPORTED_MODULE_2__.isTrue)((0,_utils_context__WEBPACK_IMPORTED_MODULE_2__.getEffectiveValue)('isStandalone', attributes, context));
    // Core data identification
    resolved.postId = (0,_utils_context__WEBPACK_IMPORTED_MODULE_2__.getEffectiveValue)('postId', attributes, context);
    resolved.attachmentId = (0,_utils_context__WEBPACK_IMPORTED_MODULE_2__.getEffectiveValue)('attachmentId', attributes, context);
    resolved.postType = (0,_utils_context__WEBPACK_IMPORTED_MODULE_2__.getEffectiveValue)('postType', attributes, context);

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
  }, [attributes, context, excludeHoverTrigger]);

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
  }, [initial.resolved.postId, initial.resolved.attachmentId, initial.resolved.postType, attributes.src]);
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
  }, [initial, discoveredAttachmentId, isDiscovering, excludeHoverTrigger]);
}

/***/ },

/***/ "./src/hooks/useVideopackData.js"
/*!***************************************!*\
  !*** ./src/hooks/useVideopackData.js ***!
  \***************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ useVideopackData)
/* harmony export */ });
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _utils_context__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/context */ "./src/utils/context.js");




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
    const isStandalone = (0,_utils_context__WEBPACK_IMPORTED_MODULE_2__.isTrue)(context['videopack/isStandalone']);
    const attachmentId = isParentRequest ? context['videopack/postId'] || context.postId : context['videopack/attachmentId'] || (context['videopack/postType'] === 'attachment' ? context['videopack/postId'] : null) || (context.postType === 'attachment' ? context.postId : null);
    let postType = context['videopack/postType'] || context.postType || 'post';
    const initialPostType = postType;

    // If we are looking for a video (attachment) and we have an explicit attachmentId, 
    // or we are in standalone mode, then the postType should be 'attachment'.
    if (!isParentRequest && (context['videopack/attachmentId'] || isStandalone)) {
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
      default:
        data = record[key] || null;
    }
    return {
      data,
      isResolving
    };
  }, [key, contextValue, context['videopack/attachmentId'], context.postId, context['videopack/postType']]);
  return resolvedData || {
    data: null,
    isResolving: false
  };
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
    title_color: '#ffffff',
    title_background_color: '#2b333f',
    play_button_color: '#ffffff',
    play_button_secondary_color: '#ffffff',
    control_bar_bg_color: '#2b333f',
    control_bar_color: '#ffffff',
    pagination_color: '#1e1e1e',
    pagination_background_color: '#ffffff',
    pagination_active_bg_color: '#1e1e1e',
    pagination_active_color: '#ffffff'
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
        fallbacks.pagination_active_bg_color = '#bf3b4d';
        break;
      case 'vjs-theme-fantasy':
        fallbacks.title_background_color = '#9f44b4';
        fallbacks.play_button_color = '#9f44b4';
        fallbacks.play_button_secondary_color = '#ffffff';
        fallbacks.pagination_active_bg_color = '#9f44b4';
        break;
      case 'vjs-theme-forest':
        fallbacks.title_background_color = '#6fb04e';
        fallbacks.play_button_secondary_color = '#6fb04e';
        fallbacks.control_bar_bg_color = 'transparent';
        fallbacks.pagination_active_bg_color = '#6fb04e';
        break;
      case 'vjs-theme-sea':
        fallbacks.title_background_color = '#4176bc';
        fallbacks.play_button_secondary_color = '#4176bc';
        fallbacks.control_bar_bg_color = 'rgba(255, 255, 255, 0.4)';
        fallbacks.pagination_active_bg_color = '#4176bc';
        break;
      case 'kg-video-js-skin':
        fallbacks.title_background_color = '#000000';
        fallbacks.play_button_secondary_color = '#000000';
        fallbacks.control_bar_bg_color = '#000000';
        fallbacks.pagination_active_bg_color = '#000000';
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
/* harmony export */   isTrue: () => (/* binding */ isTrue),
/* harmony export */   normalizeSourceGroups: () => (/* binding */ normalizeSourceGroups)
/* harmony export */ });
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
 * @param {string} key      The key to resolve (e.g., 'skin', 'title_color').
 * @param {Object} attributes The block's own attributes.
 * @param {Object} context    The inherited block context.
 * @return {*} The resolved value.
 */
const getEffectiveValue = (key, attributes = {}, context = {}) => {
  const contextKey = key.includes('/') ? key : `videopack/${key}`;
  const attrKey = key.includes('/') ? key.split('/')[1] : key;

  // Helper to check if a value is valid (not undefined, null, or empty string)
  const isValid = val => val !== undefined && val !== null && val !== '';

  // 1. Check local attribute override
  if (isValid(attributes[attrKey])) {
    // Special case for isPreview: if local is false but context is true, prefer context true
    if (attrKey === 'isPreview' && !attributes[attrKey] && isTrue(context[contextKey])) {
      return true;
    }
    return attributes[attrKey];
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

/***/ "./src/utils/templates.js"
/*!********************************!*\
  !*** ./src/utils/templates.js ***!
  \********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getFeedTemplate: () => (/* binding */ getFeedTemplate),
/* harmony export */   getGridTemplate: () => (/* binding */ getGridTemplate),
/* harmony export */   getListTemplate: () => (/* binding */ getListTemplate)
/* harmony export */ });
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
    engineChildren.push(['videopack/title', {}]);
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

/***/ "./src/blocks/view-count/index.css"
/*!*****************************************!*\
  !*** ./src/blocks/view-count/index.css ***!
  \*****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "./src/blocks/play-button/editor.scss"
/*!********************************************!*\
  !*** ./src/blocks/play-button/editor.scss ***!
  \********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "./src/blocks/title/editor.scss"
/*!**************************************!*\
  !*** ./src/blocks/title/editor.scss ***!
  \**************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "./src/blocks/watermark/editor.scss"
/*!******************************************!*\
  !*** ./src/blocks/watermark/editor.scss ***!
  \******************************************/
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

/***/ "./src/components/InspectorControls/CollectionSettingsPanel.scss"
/*!***********************************************************************!*\
  !*** ./src/components/InspectorControls/CollectionSettingsPanel.scss ***!
  \***********************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "./src/features/classic-embed/classic-embed.scss"
/*!*******************************************************!*\
  !*** ./src/features/classic-embed/classic-embed.scss ***!
  \*******************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "./src/features/tinymce/tinymce.scss"
/*!*******************************************!*\
  !*** ./src/features/tinymce/tinymce.scss ***!
  \*******************************************/
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

/***/ "@wordpress/block-editor"
/*!*************************************!*\
  !*** external ["wp","blockEditor"] ***!
  \*************************************/
(module) {

module.exports = window["wp"]["blockEditor"];

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

/***/ "@wordpress/html-entities"
/*!**************************************!*\
  !*** external ["wp","htmlEntities"] ***!
  \**************************************/
(module) {

module.exports = window["wp"]["htmlEntities"];

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

/***/ "./node_modules/@wordpress/icons/build-module/library/background.mjs"
/*!***************************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/background.mjs ***!
  \***************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ background_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/background.tsx


var background_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { fillRule: "evenodd", clipRule: "evenodd", d: "M11.53 4.47a.75.75 0 1 0-1.06 1.06l8 8a.75.75 0 1 0 1.06-1.06l-8-8Zm5 1a.75.75 0 1 0-1.06 1.06l2 2a.75.75 0 1 0 1.06-1.06l-2-2Zm-11.06 10a.75.75 0 0 1 1.06 0l2 2a.75.75 0 1 1-1.06 1.06l-2-2a.75.75 0 0 1 0-1.06Zm.06-5a.75.75 0 0 0-1.06 1.06l8 8a.75.75 0 1 0 1.06-1.06l-8-8Zm-.06-3a.75.75 0 0 1 1.06 0l10 10a.75.75 0 1 1-1.06 1.06l-10-10a.75.75 0 0 1 0-1.06Zm3.06-2a.75.75 0 0 0-1.06 1.06l10 10a.75.75 0 1 0 1.06-1.06l-10-10Z" }) });

//# sourceMappingURL=background.mjs.map


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

/***/ "./node_modules/@wordpress/icons/build-module/library/code.mjs"
/*!*********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/code.mjs ***!
  \*********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ code_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/code.tsx


var code_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M20.8 10.7l-4.3-4.3-1.1 1.1 4.3 4.3c.1.1.1.3 0 .4l-4.3 4.3 1.1 1.1 4.3-4.3c.7-.8.7-1.9 0-2.6zM4.2 11.8l4.3-4.3-1-1-4.3 4.3c-.7.7-.7 1.8 0 2.5l4.3 4.3 1.1-1.1-4.3-4.3c-.2-.1-.2-.3-.1-.4z" }) });

//# sourceMappingURL=code.mjs.map


/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/download.mjs"
/*!*************************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/download.mjs ***!
  \*************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ download_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/download.tsx


var download_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M18 11.3l-1-1.1-4 4V3h-1.5v11.3L7 10.2l-1 1.1 6.2 5.8 5.8-5.8zm.5 3.7v3.5h-13V15H4v5h16v-5h-1.5z" }) });

//# sourceMappingURL=download.mjs.map


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

/***/ "./node_modules/@wordpress/icons/build-module/library/home.mjs"
/*!*********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/home.mjs ***!
  \*********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ home_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/home.tsx


var home_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M12 4L4 7.9V20h16V7.9L12 4zm6.5 14.5H14V13h-4v5.5H5.5V8.8L12 5.7l6.5 3.1v9.7z" }) });

//# sourceMappingURL=home.mjs.map


/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/image.mjs"
/*!**********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/image.mjs ***!
  \**********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ image_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/image.tsx


var image_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 4.5h14c.3 0 .5.2.5.5v8.4l-3-2.9c-.3-.3-.8-.3-1 0L11.9 14 9 12c-.3-.2-.6-.2-.8 0l-3.6 2.6V5c-.1-.3.1-.5.4-.5zm14 15H5c-.3 0-.5-.2-.5-.5v-2.4l4.1-3 3 1.9c.3.2.7.2.9-.1L16 12l3.5 3.4V19c0 .3-.2.5-.5.5z" }) });

//# sourceMappingURL=image.mjs.map


/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/link.mjs"
/*!*********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/link.mjs ***!
  \*********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ link_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/link.tsx


var link_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M10 17.389H8.444A5.194 5.194 0 1 1 8.444 7H10v1.5H8.444a3.694 3.694 0 0 0 0 7.389H10v1.5ZM14 7h1.556a5.194 5.194 0 0 1 0 10.39H14v-1.5h1.556a3.694 3.694 0 0 0 0-7.39H14V7Zm-4.5 6h5v-1.5h-5V13Z" }) });

//# sourceMappingURL=link.mjs.map


/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/media-and-text.mjs"
/*!*******************************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/media-and-text.mjs ***!
  \*******************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ media_and_text_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/media-and-text.tsx


var media_and_text_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M3 6v11.5h8V6H3Zm11 3h7V7.5h-7V9Zm7 3.5h-7V11h7v1.5ZM14 16h7v-1.5h-7V16Z" }) });

//# sourceMappingURL=media-and-text.mjs.map


/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/not-allowed.mjs"
/*!****************************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/not-allowed.mjs ***!
  \****************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ not_allowed_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/not-allowed.tsx


var not_allowed_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { fillRule: "evenodd", clipRule: "evenodd", d: "M12 18.5A6.5 6.5 0 0 1 6.93 7.931l9.139 9.138A6.473 6.473 0 0 1 12 18.5Zm5.123-2.498a6.5 6.5 0 0 0-9.124-9.124l9.124 9.124ZM4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0Z" }) });

//# sourceMappingURL=not-allowed.mjs.map


/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/page.mjs"
/*!*********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/page.mjs ***!
  \*********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ page_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/page.tsx


var page_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: [
  /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M15.5 7.5h-7V9h7V7.5Zm-7 3.5h7v1.5h-7V11Zm7 3.5h-7V16h7v-1.5Z" }),
  /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M17 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2ZM7 5.5h10a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-.5.5H7a.5.5 0 0 1-.5-.5V6a.5.5 0 0 1 .5-.5Z" })
] });

//# sourceMappingURL=page.mjs.map


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

/***/ "./node_modules/@wordpress/icons/build-module/library/post.mjs"
/*!*********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/post.mjs ***!
  \*********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ post_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/post.tsx


var post_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "m7.3 9.7 1.4 1.4c.2-.2.3-.3.4-.5 0 0 0-.1.1-.1.3-.5.4-1.1.3-1.6L12 7 9 4 7.2 6.5c-.6-.1-1.1 0-1.6.3 0 0-.1 0-.1.1-.3.1-.4.2-.6.4l1.4 1.4L4 11v1h1l2.3-2.3zM4 20h9v-1.5H4V20zm0-5.5V16h16v-1.5H4z" }) });

//# sourceMappingURL=post.mjs.map


/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/seen.mjs"
/*!*********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/seen.mjs ***!
  \*********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ seen_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/seen.tsx


var seen_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M3.99961 13C4.67043 13.3354 4.6703 13.3357 4.67017 13.3359L4.67298 13.3305C4.67621 13.3242 4.68184 13.3135 4.68988 13.2985C4.70595 13.2686 4.7316 13.2218 4.76695 13.1608C4.8377 13.0385 4.94692 12.8592 5.09541 12.6419C5.39312 12.2062 5.84436 11.624 6.45435 11.0431C7.67308 9.88241 9.49719 8.75 11.9996 8.75C14.502 8.75 16.3261 9.88241 17.5449 11.0431C18.1549 11.624 18.6061 12.2062 18.9038 12.6419C19.0523 12.8592 19.1615 13.0385 19.2323 13.1608C19.2676 13.2218 19.2933 13.2686 19.3093 13.2985C19.3174 13.3135 19.323 13.3242 19.3262 13.3305L19.3291 13.3359C19.3289 13.3357 19.3288 13.3354 19.9996 13C20.6704 12.6646 20.6703 12.6643 20.6701 12.664L20.6697 12.6632L20.6688 12.6614L20.6662 12.6563L20.6583 12.6408C20.6517 12.6282 20.6427 12.6108 20.631 12.5892C20.6078 12.5459 20.5744 12.4852 20.5306 12.4096C20.4432 12.2584 20.3141 12.0471 20.1423 11.7956C19.7994 11.2938 19.2819 10.626 18.5794 9.9569C17.1731 8.61759 14.9972 7.25 11.9996 7.25C9.00203 7.25 6.82614 8.61759 5.41987 9.9569C4.71736 10.626 4.19984 11.2938 3.85694 11.7956C3.68511 12.0471 3.55605 12.2584 3.4686 12.4096C3.42484 12.4852 3.39142 12.5459 3.36818 12.5892C3.35656 12.6108 3.34748 12.6282 3.34092 12.6408L3.33297 12.6563L3.33041 12.6614L3.32948 12.6632L3.32911 12.664C3.32894 12.6643 3.32879 12.6646 3.99961 13ZM11.9996 16C13.9326 16 15.4996 14.433 15.4996 12.5C15.4996 10.567 13.9326 9 11.9996 9C10.0666 9 8.49961 10.567 8.49961 12.5C8.49961 14.433 10.0666 16 11.9996 16Z" }) });

//# sourceMappingURL=seen.mjs.map


/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/share.mjs"
/*!**********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/share.mjs ***!
  \**********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ share_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/share.tsx


var share_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M9 11.8l6.1-4.5c.1.4.4.7.9.7h2c.6 0 1-.4 1-1V5c0-.6-.4-1-1-1h-2c-.6 0-1 .4-1 1v.4l-6.4 4.8c-.2-.1-.4-.2-.6-.2H6c-.6 0-1 .4-1 1v2c0 .6.4 1 1 1h2c.2 0 .4-.1.6-.2l6.4 4.8v.4c0 .6.4 1 1 1h2c.6 0 1-.4 1-1v-2c0-.6-.4-1-1-1h-2c-.5 0-.8.3-.9.7L9 12.2v-.4z" }) });

//# sourceMappingURL=share.mjs.map


/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/title.mjs"
/*!**********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/title.mjs ***!
  \**********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ title_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/title.tsx


var title_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "m4 5.5h2v6.5h1.5v-6.5h2v-1.5h-5.5zm16 10.5h-16v-1.5h16zm-7 4h-9v-1.5h9z" }) });

//# sourceMappingURL=title.mjs.map


/***/ },

/***/ "./src/blocks/duration/block.json"
/*!****************************************!*\
  !*** ./src/blocks/duration/block.json ***!
  \****************************************/
(module) {

module.exports = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"videopack/duration","title":"Videopack Duration","category":"media","icon":"clock","description":"Displays the video duration.","usesContext":["postId","postType"],"attributes":{"position":{"type":"string"},"textAlign":{"type":"string"},"title_color":{"type":"string"},"title_background_color":{"type":"string"},"isPreview":{"type":"boolean","default":false}},"example":{"attributes":{"isPreview":true}},"supports":{"html":false,"typography":{"fontSize":true,"lineHeight":true},"spacing":{"margin":true,"padding":true}},"textdomain":"video-embed-thumbnail-generator","editorScript":"file:./index.js"}');

/***/ },

/***/ "./src/blocks/play-button/block.json"
/*!*******************************************!*\
  !*** ./src/blocks/play-button/block.json ***!
  \*******************************************/
(module) {

module.exports = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"videopack/play-button","title":"Videopack Play Button","category":"media","icon":"controls-play","description":"Displays a play button overlay.","attributes":{"play_button_color":{"type":"string"},"play_button_secondary_color":{"type":"string"},"isPreview":{"type":"boolean","default":false}},"example":{"attributes":{"isPreview":true}},"supports":{"html":false},"textdomain":"video-embed-thumbnail-generator","editorScript":"file:./index.js","editorStyle":"file:./index.css"}');

/***/ },

/***/ "./src/blocks/player-container/block.json"
/*!************************************************!*\
  !*** ./src/blocks/player-container/block.json ***!
  \************************************************/
(module) {

module.exports = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"videopack/player-container","title":"Videopack Video","category":"media","icon":"format-video","description":"Embed a single video with Videopack features.","usesContext":["postId","postType"],"supports":{"html":false,"align":true,"dimensions":{"aspectRatio":false,"height":false,"minHeight":false,"width":false},"spacing":{"margin":true,"padding":true,"blockGap":true},"filter":{"duotone":true}},"selectors":{"filter":{"duotone":".wp-block-videopack-player-container .vjs-poster img, .wp-block-videopack-player-container .mejs-poster img, .wp-block-videopack-player-container .mejs-poster"}},"example":{"attributes":{"src":"videopack-preview-video","title":"Sample Video","overlay_title":true,"isPreview":true}},"attributes":{"id":{"type":"number"},"src":{"type":"string"},"poster":{"type":"string"},"title":{"type":"string"},"caption":{"type":"string"},"width":{"type":"number"},"height":{"type":"number"},"autoplay":{"type":"boolean","default":false},"controls":{"type":"boolean","default":true},"loop":{"type":"boolean","default":false},"muted":{"type":"boolean","default":false},"playsinline":{"type":"boolean","default":false},"preload":{"type":"string","default":"metadata"},"volume":{"type":"number","default":1},"auto_res":{"type":"string"},"auto_codec":{"type":"string"},"sources":{"type":"array","default":[]},"source_groups":{"type":"object","default":{}},"text_tracks":{"type":"array","default":[]},"playback_rate":{"type":"boolean","default":false},"watermark":{"type":"string"},"watermark_styles":{"type":"object","default":{}},"watermark_link_to":{"type":"string","default":""},"default_ratio":{"type":"string","default":"16 / 9"},"fixed_aspect":{"type":"string","default":"false"},"fullwidth":{"type":"boolean","default":false},"textAlign":{"type":"string"},"downloadlink":{"type":"boolean"},"overlay_title":{"type":"boolean"},"views":{"type":"boolean"},"embedcode":{"type":"boolean"},"embedlink":{"type":"string"},"embed_method":{"type":"string"},"showCaption":{"type":"boolean","default":false},"showBackground":{"type":"boolean"},"title_position":{"type":"string","default":"top"},"isInsidePlayerOverlay":{"type":"boolean","default":false},"restartCount":{"type":"number","default":0},"isInsidePlayerContainer":{"type":"boolean","default":true},"isPreview":{"type":"boolean","default":false}},"textdomain":"video-embed-thumbnail-generator","editorScript":"file:./index.js","editorStyle":"file:./index.css"}');

/***/ },

/***/ "./src/blocks/thumbnail/block.json"
/*!*****************************************!*\
  !*** ./src/blocks/thumbnail/block.json ***!
  \*****************************************/
(module) {

module.exports = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"videopack/thumbnail","title":"Videopack Thumbnail","category":"media","icon":"format-image","editorStyle":"file:./index.css","description":"Displays the video poster image. Can contain the play button and duration overlays.","attributes":{"linkTo":{"type":"string","default":"none"},"isInsideThumbnail":{"type":"boolean","default":true},"isPreview":{"type":"boolean","default":false}},"example":{"attributes":{"isPreview":true}},"usesContext":["postId","postType"],"supports":{"html":false,"align":true,"spacing":{"margin":true,"padding":true},"filter":{"duotone":true}},"selectors":{"filter":{"duotone":".wp-block-videopack-thumbnail img"}},"textdomain":"video-embed-thumbnail-generator","editorScript":"file:./index.js"}');

/***/ },

/***/ "./src/blocks/title/block.json"
/*!*************************************!*\
  !*** ./src/blocks/title/block.json ***!
  \*************************************/
(module) {

module.exports = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"videopack/title","title":"Videopack Title","category":"media","parent":["videopack/player-container","videopack/player","videopack/thumbnail","videopack/loop"],"icon":"heading","description":"Overlay title and action buttons for the video player.","usesContext":["postId","postType"],"attributes":{"title":{"type":"string","default":""},"tagName":{"type":"string","default":"h3"},"isOverlay":{"type":"boolean"},"title_color":{"type":"string"},"title_background_color":{"type":"string"},"position":{"type":"string"},"textAlign":{"type":"string"},"embedlink":{"type":"string"},"embedcode":{"type":"boolean"},"downloadlink":{"type":"boolean"},"overlay_title":{"type":"boolean"},"showBackground":{"type":"boolean"},"usePostTitle":{"type":"boolean","default":false},"linkToPost":{"type":"boolean","default":false},"isPreview":{"type":"boolean","default":false}},"example":{"attributes":{"title":"Sample Video Title","isOverlay":true,"isPreview":true}},"supports":{"html":false,"reusable":false,"typography":{"fontSize":true,"lineHeight":true}},"textdomain":"video-embed-thumbnail-generator","editorScript":"file:./index.js","editorStyle":"file:./index.css"}');

/***/ },

/***/ "./src/blocks/view-count/block.json"
/*!******************************************!*\
  !*** ./src/blocks/view-count/block.json ***!
  \******************************************/
(module) {

module.exports = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"videopack/view-count","title":"Videopack View Count","category":"media","icon":"visibility","editorStyle":"file:./index.css","description":"Displays the view count of the video.","usesContext":["postId","postType"],"attributes":{"iconType":{"type":"string","default":"none"},"showText":{"type":"boolean","default":true},"textAlign":{"type":"string"},"title_color":{"type":"string"},"title_background_color":{"type":"string"},"isPreview":{"type":"boolean","default":false}},"example":{"attributes":{"iconType":"playOutline","isPreview":true}},"supports":{"html":false,"typography":{"fontSize":true,"lineHeight":true},"spacing":{"margin":true,"padding":true}},"textdomain":"video-embed-thumbnail-generator","editorScript":"file:./index.js"}');

/***/ },

/***/ "./src/blocks/watermark/block.json"
/*!*****************************************!*\
  !*** ./src/blocks/watermark/block.json ***!
  \*****************************************/
(module) {

module.exports = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"videopack/watermark","title":"Videopack Watermark","category":"media","icon":"art","description":"Displays a watermark overlay on the video.","parent":["videopack/player-container","videopack/player"],"attributes":{"watermark":{"type":"string"},"watermark_link_to":{"type":"string","default":"false"},"watermark_url":{"type":"string"},"watermark_align":{"type":"string","default":"right"},"watermark_valign":{"type":"string","default":"bottom"},"watermark_scale":{"type":"number","default":10},"watermark_x":{"type":"number","default":5},"watermark_y":{"type":"number","default":7},"isPreview":{"type":"boolean","default":false}},"example":{"attributes":{"watermark":"https://s.w.org/style/images/about/WordPress-logotype-wmark.png","isPreview":true}},"supports":{"html":false,"reusable":false},"textdomain":"video-embed-thumbnail-generator","editorScript":"file:./index.js","editorStyle":"file:./index.css"}');

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
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other entry modules.
(() => {
var __webpack_exports__ = {};
/*!*****************************************************!*\
  !*** ./src/features/classic-embed/classic-embed.js ***!
  \*****************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_ClassicEmbed__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./components/ClassicEmbed */ "./src/features/classic-embed/components/ClassicEmbed.js");
/* harmony import */ var _classic_embed_scss__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./classic-embed.scss */ "./src/features/classic-embed/classic-embed.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__);
/**
 * Main entry point for the classic embed feature.
 */





const initClassicEmbed = () => {
  const container = document.getElementById('videopack-classic-embed-root');
  if (container) {
    const config = window.videopack_classic_editor_config || {};
    const root = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createRoot)(container);
    root.render(/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_components_ClassicEmbed__WEBPACK_IMPORTED_MODULE_1__["default"], {
      options: config.options || {},
      postId: config.postId,
      activeTab: config.activeTab
    }));
  }
};
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initClassicEmbed();
} else {
  document.addEventListener('DOMContentLoaded', initClassicEmbed);
}
})();

// This entry needs to be wrapped in an IIFE because it needs to be isolated against other entry modules.
(() => {
/*!*****************************************!*\
  !*** ./src/features/tinymce/tinymce.js ***!
  \*****************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _components_Preview__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../components/Preview */ "./src/components/Preview/index.js");
/* harmony import */ var _utils_templates__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../utils/templates */ "./src/utils/templates.js");
/* harmony import */ var _hooks_useVideopackContext__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../hooks/useVideopackContext */ "./src/hooks/useVideopackContext.js");
/* harmony import */ var _hooks_useVideoQuery__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../hooks/useVideoQuery */ "./src/hooks/useVideoQuery.js");
/* harmony import */ var _utils_helpers__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../utils/helpers */ "./src/utils/helpers.js");
/* harmony import */ var _tinymce_scss__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./tinymce.scss */ "./src/features/tinymce/tinymce.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__);
/**
 * Features for integrating Videopack with the TinyMCE editor.
 */









/* global videopack_config, tinymce, MutationObserver */


(function () {
  /**
   * Robustly detects the current post ID in various WordPress editor environments.
   *
   * @return {number|null} The detected post ID or null if not found.
   */
  const detectPostId = () => {
    const results = {};

    // 1. Explicitly localized config
    results.config = videopack_config?.postId;

    // 2. WordPress media view settings
    results.wpMedia = window.wp?.media?.view?.settings?.post?.id;

    // 3. Raw DOM element
    results.dom = document.getElementById('post_ID')?.value;

    // 4. URL Parameters
    results.url = new URLSearchParams(window.location.search).get('post');

    // 5. Parent Window (if in iframe like TinyMCE)
    try {
      if (window.parent && window.parent !== window) {
        results.parentDom = window.parent.document.getElementById('post_ID')?.value;
        results.parentUrl = new URLSearchParams(window.parent.location.search).get('post');
        results.parentWpMedia = window.parent.wp?.media?.view?.settings?.post?.id;
      }
    } catch (e) {
      // Cross-origin issues, ignore
    }

    // 6. Gutenberg State (if active)
    try {
      const wpData = window.wp?.data || window.parent?.wp?.data;
      if (wpData) {
        results.gutenberg = wpData.select('core/editor')?.getCurrentPostId();
      }
    } catch (e) {
      // ignore
    }
    for (const key in results) {
      const val = parseInt(results[key], 10);
      if (val && !isNaN(val)) {
        return val;
      }
    }
    return null;
  };
  const PlaceHolderWrapper = ({
    type,
    attributes,
    mountNode
  }) => {
    const [fullAttributes, setFullAttributes] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(attributes);
    const activePostId = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => detectPostId(), []);
    // Use unified context hook for all design and behavior resolution.
    // TinyMCE doesn't have block context, so we pass an empty object.
    const vpContext = (0,_hooks_useVideopackContext__WEBPACK_IMPORTED_MODULE_5__["default"])(attributes, {}, {
      excludeHoverTrigger: true
    });
    const mergedAttributes = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
      const resolved = {
        ...vpContext.resolved
      };
      resolved.autoplay = false; // Never autoplay in TinyMCE preview

      // Fix for gallery_source="current" in TinyMCE/REST context where get_the_ID() is 0.
      if (resolved.gallery_source === 'current' && (!resolved.gallery_id || resolved.gallery_id === '0' || parseInt(resolved.gallery_id, 10) === 0)) {
        if (activePostId) {
          resolved.gallery_id = activePostId;
        }
      }
      return resolved;
    }, [vpContext.resolved, activePostId]);
    const {
      videoResults,
      isResolving,
      maxNumPages
    } = (0,_hooks_useVideoQuery__WEBPACK_IMPORTED_MODULE_6__["default"])({
      ...mergedAttributes,
      page_number: 1
    }, activePostId);
    const [isSelected, setIsSelected] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    const themePresetsStyle = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
      const colors = videopack_config?.themeColors || [];
      const styles = {};
      colors.forEach(c => {
        styles[`--wp--preset--color--${c.slug}`] = c.color;
      });
      return styles;
    }, []);

    // Watch for selection changes on the wpview container
    (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
      const wpView = mountNode.closest('.wpview');
      if (!wpView) {
        return;
      }
      const updateSelection = () => {
        const selected = wpView.getAttribute('data-mce-selected');
        setIsSelected(selected === '1' || selected === '2');
      };
      updateSelection();
      const observer = new MutationObserver(updateSelection);
      observer.observe(wpView, {
        attributes: true,
        attributeFilter: ['data-mce-selected']
      });
      return () => observer.disconnect();
    }, [mountNode]);
    if (isResolving) {
      return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)("div", {
        className: "loading-placeholder",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
          className: "dashicons dashicons-admin-media"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
          className: "wpview-loading",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("ins", {})
        })]
      });
    }

    // Resolve template
    let template;
    if (type === 'Video') {
      const showTitleBar = !!(mergedAttributes.overlay_title !== false || mergedAttributes.downloadlink || mergedAttributes.embedcode);
      const engineChildren = [];
      if (showTitleBar) {
        engineChildren.push(['videopack/title', {}]);
      }
      if (mergedAttributes.watermark) {
        engineChildren.push(['videopack/watermark', {}]);
      }
      const videoChildren = [['videopack/player', {}, engineChildren]];
      if (mergedAttributes.views) {
        videoChildren.push(['videopack/view-count', {}]);
      }
      template = [['videopack/player-container', {}, videoChildren]];
    } else if (type === 'Gallery') {
      template = (0,_utils_templates__WEBPACK_IMPORTED_MODULE_4__.getGridTemplate)(mergedAttributes);
    } else {
      template = (0,_utils_templates__WEBPACK_IMPORTED_MODULE_4__.getListTemplate)(mergedAttributes);
    }
    const contextValue = {
      ...vpContext.sharedContext,
      'videopack/videos': videoResults,
      'videopack/layout': type === 'Gallery' ? 'grid' : 'list',
      'videopack/columns': parseInt(mergedAttributes.gallery_columns, 10) || 3,
      'videopack/totalPages': maxNumPages,
      'videopack/currentPage': 1
    };
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)("div", {
      className: "videopack-tinymce-wrapper",
      style: themePresetsStyle,
      children: [videopack_config?.globalStyles && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("style", {
        dangerouslySetInnerHTML: {
          __html: videopack_config.globalStyles
        }
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_components_Preview__WEBPACK_IMPORTED_MODULE_3__.TemplatePreview, {
        attributes: mergedAttributes,
        template: template,
        context: contextValue,
        video: videoResults[0],
        postId: detectPostId()
      }), !isSelected && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
        className: "videopack-block-overlay"
      })]
    });
  };

  /**
   * Mounts a React component to a specific mount node within a container.
   *
   * @param {HTMLElement} container The container element (usually a WP View).
   * @param {Object}      shortcode The shortcode object.
   */
  /**
   * Mounts a React component to a specific mount node within a container.
   *
   * @param {HTMLElement} container     The container element (usually a WP View).
   * @param {Object}      shortcodeData The shortcode object or match.
   */
  function mountReactToNode(container, shortcodeData) {
    if (!container || typeof container.querySelector !== 'function') {
      return;
    }

    // Normalize shortcode object
    const shortcode = shortcodeData.shortcode || shortcodeData;
    const mountNode = container.querySelector('.videopack-tinymce-mount');
    if (!mountNode) {
      // If not ready yet, we'll catch it in the next scan or bind call.
      return;
    }
    if (mountNode.dataset.videopackMounted) {
      return;
    }

    // Normalize attributes and tag
    const attrs = {
      ...(shortcode.attrs && shortcode.attrs.named ? shortcode.attrs.named : shortcode.attrs || {})
    };
    const tag = shortcode.tag;

    // If the shortcode has content (e.g. [videopack]URL[/videopack]), map it to the src attribute ONLY if id is missing
    if (shortcode.content && !attrs.id && !attrs.src) {
      attrs.src = shortcode.content.trim();
    }
    let type = 'Video';
    // [videopack] or legacy aliases
    const isGallery = attrs.gallery === 'true' || attrs.gallery === true;
    if (isGallery) {
      type = 'Gallery';
    } else {
      // Detect if it should be a list
      const hasMultipleIds = attrs.id && typeof attrs.id === 'string' && attrs.id.includes(',');
      const hasQuerySource = attrs.gallery_source || attrs.gallery_category || attrs.gallery_tag;
      const isEmptyAndNotUrl = !attrs.id && !attrs.src && !shortcode.content;
      const hasGalleryIdOnly = attrs.gallery_id && !attrs.id && !attrs.src && !shortcode.content;
      if (hasMultipleIds || hasQuerySource || isEmptyAndNotUrl || hasGalleryIdOnly) {
        type = 'List';
      } else {
        type = 'Video';
      }
    }
    try {
      // Use createRoot for React 18+ compatibility
      if (!mountNode.__reactRoot) {
        mountNode.__reactRoot = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createRoot)(mountNode);
      }
      mountNode.__reactRoot.render(/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(PlaceHolderWrapper, {
        type: type,
        attributes: attrs,
        mountNode: mountNode
      }));
      mountNode.dataset.videopackMounted = 'true';
    } catch (e) {
      console.error('Videopack TinyMCE React render error:', e);
      mountNode.innerHTML = '<div class="videopack-render-error">Error rendering preview</div>';
    }
  }

  /**
   * Scans all TinyMCE editors for Videopack mount points and mounts them.
   */
  function scanAndMountAll() {
    if (typeof tinymce === 'undefined' || !tinymce.editors || typeof window.wp === 'undefined') {
      return;
    }
    tinymce.editors.forEach(editor => {
      const $doc = editor.getDoc();
      if (!$doc) {
        return;
      }

      // Find all WP Views for Videopack in this editor
      const views = editor.dom.select('.wpview-wrap[data-wpview-type="videopack"], .wpview-wrap[data-wpview-type="KGVID"], .wpview-wrap[data-wpview-type="VIDEOPACK"], .wpview-wrap[data-wpview-type="FMP"]');
      views.forEach(container => {
        try {
          const viewText = container.getAttribute('data-wpview-text');
          if (!viewText) {
            return;
          }
          const shortcodeText = decodeURIComponent(viewText);
          const tags = ['videopack', 'KGVID', 'VIDEOPACK', 'FMP'];
          let shortcodeMatch = null;
          for (const tag of tags) {
            // Using next() on the specific shortcodeText for the view.
            // This should be clean as shortcodeText is local to this view.
            const match = window.wp.shortcode.next(tag, shortcodeText);
            if (match && match.shortcode) {
              shortcodeMatch = match.shortcode;
              break;
            }
          }
          if (shortcodeMatch) {
            mountReactToNode(container, shortcodeMatch);
          }
        } catch (e) {
          console.error('Videopack scanAndMountAll error:', e);
        }
      });
    });
  }

  /**
   * Registers the Videopack views with TinyMCE.
   */
  function registerVideopackViews() {
    // Prevent multiple registrations
    if (window.videopack_tinymce_registered) {
      return;
    }

    // Register Videopack views

    // Ensure we have access to wp.mce.views
    if (typeof window.wp === 'undefined' || !window.wp.mce || !window.wp.mce.views) {
      return;
    }
    const videopackViewConfig = {
      /**
       * The template used to render the preview shell.
       *
       * @return {string} Template HTML.
       */
      template() {
        return '<div class="videopack-tinymce-mount"></div>';
      },
      /**
       * Called when the view is initialized.
       * We trigger the render process here.
       */
      initialize() {
        this.render(this.template());
      },
      /**
       * Called after the view is inserted into the editor.
       * We mount the React component here.
       *
       * @param {HTMLElement} container The container element.
       */
      bind(container) {
        mountReactToNode(container, this.shortcode);
      },
      /**
       * Called when the view is removed from the editor.
       * We unmount the React component here for cleanup.
       *
       * @param {HTMLElement} container The container element.
       */
      unbind(container) {
        if (!container || typeof container.querySelector !== 'function') {
          return;
        }
        const mountNode = container.querySelector('.videopack-tinymce-mount');
        if (mountNode && mountNode.__reactRoot) {
          try {
            mountNode.__reactRoot.unmount();
            delete mountNode.__reactRoot;
          } catch (e) {}
        }
      },
      /**
       * Handles clicking the "Edit" button on the view.
       *
       * @param {string}   text           Shortcode text.
       * @param {Function} updateCallback Callback to update the shortcode.
       */
      edit(text, updateCallback) {
        if (typeof window.wp === 'undefined') {
          return;
        }
        const shortcode = window.wp.shortcode.next(this.shortcode.tag, text);
        const values = shortcode ? shortcode.shortcode.attrs.named : {};
        if (typeof window.wp.media === 'undefined') {
          return;
        }

        // If it's a single video with an ID, use the enhanced media modal
        if (values && values.id && values.id.indexOf(',') === -1) {
          const mediaFrame = window.wp.media({
            frame: 'select',
            title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Edit Videopack Shortcode', 'video-embed-thumbnail-generator'),
            button: {
              text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Update', 'video-embed-thumbnail-generator')
            },
            multiple: false,
            library: {
              post__in: [values.id]
            }
          });
          const shortcodeTag = this.shortcode.tag;
          mediaFrame.on('open', function () {
            const selection = mediaFrame.state().get('selection');
            const attachment = window.wp.media.attachment(values.id);
            attachment.set('videopack_attributes', values);
            attachment.fetch().then(() => {
              selection.add([attachment]);
            });
          });
          mediaFrame.on('select', function () {
            const selection = mediaFrame.state().get('selection').first();
            if (!selection) {
              return;
            }
            const selectedId = selection.get('id');
            const videopackAttrs = selection.get('videopack_attributes') || {};
            const config = videopack_config || {};
            const finalAttrs = {
              id: selectedId
            };
            const possibleKeys = ['width', 'height', 'autoplay', 'loop', 'muted', 'controls', 'volume', 'preload', 'playback_rate', 'playsinline', 'poster', 'downloadlink', 'overlay_title', 'play_button_color', 'play_button_secondary_color', 'title_color', 'title_background_color'];
            possibleKeys.forEach(key => {
              const value = videopackAttrs[key];
              if (value !== undefined && value !== null) {
                const defaultValue = config.defaults?.[key];
                if (value !== defaultValue) {
                  finalAttrs[key] = value;
                }
              }
            });
            const newShortcode = new window.wp.shortcode({
              tag: shortcodeTag,
              attrs: finalAttrs,
              type: 'closed'
            });
            updateCallback(newShortcode.string());
          });
          mediaFrame.open();
        } else {
          // Fallback to the Thickbox-based UI for galleries, lists, or non-attachment URLs
          const params = new URLSearchParams();
          params.append('videopack_tinymce_edit', '1');
          if (videopack_config?.classic_embed_nonce) {
            params.append('videopack_nonce', videopack_config.classic_embed_nonce);
          }
          let urlValue = '';
          if (shortcode && shortcode.shortcode && shortcode.shortcode.content) {
            urlValue = shortcode.shortcode.content.trim();
          }
          for (const key in values) {
            if (Object.prototype.hasOwnProperty.call(values, key)) {
              params.append('videopack_' + key, values[key]);
            }
          }
          let urlValueToAppend = '';
          if (values.url) {
            urlValueToAppend = values.url;
          } else if (urlValue && values.id && values.id.indexOf(',') !== -1) {
            urlValueToAppend = values.id;
          } else if (urlValue && !values.id) {
            urlValueToAppend = urlValue;
          }
          if (urlValueToAppend) {
            params.append('videopack_url', urlValueToAppend);
          }
          let thickboxTitle = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Edit Video', 'video-embed-thumbnail-generator');
          const isGallery = values.gallery === 'true';
          const urlValueToCheck = urlValue || '';
          let isListInEdit = false;
          if (!isGallery) {
            const hasMultipleIds = values.id && values.id.indexOf(',') !== -1;
            const hasMultipleContentElements = urlValueToCheck && urlValueToCheck.indexOf(',') !== -1;
            const hasQuerySource = values.gallery_source || values.gallery_category || values.gallery_tag;
            const isEmptyAndNotUrl = !values.id && !values.url && !urlValueToCheck;
            const hasGalleryIdOnly = values.gallery_id && !values.id && !values.url && !urlValueToCheck;
            isListInEdit = hasMultipleIds || hasMultipleContentElements || hasQuerySource || isEmptyAndNotUrl || hasGalleryIdOnly;
          }
          if (isGallery) {
            thickboxTitle = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Edit Gallery', 'video-embed-thumbnail-generator');
            params.set('tab', 'embedgallery');
          } else if (isListInEdit) {
            thickboxTitle = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Edit Video List', 'video-embed-thumbnail-generator');
            params.set('tab', 'embedlist');
          } else {
            params.set('tab', 'embedurl');
          }
          const tbUrl = window.ajaxurl.replace('admin-ajax.php', '') + 'media-upload.php?type=embedurl&' + params.toString() + '&TB_iframe=true';
          window.videopack_tinymce_update_shortcode = newShortcodeString => {
            updateCallback(newShortcodeString);
            window.videopack_tinymce_update_shortcode = null;
            if (typeof window.tb_remove === 'function') {
              window.tb_remove();
            }
          };
          if (typeof window.tb_show === 'function') {
            window.tb_show(thickboxTitle, tbUrl);
          }
        }
      }
    };
    const tags = ['videopack', 'VIDEOPACK', 'KGVID', 'FMP'];
    tags.forEach(tag => {
      if (window.wp.mce.views.get(tag)) {
        window.wp.mce.views.unregister(tag);
      }
      window.wp.mce.views.register(tag, videopackViewConfig);
    });
    window.videopack_tinymce_registered = true;
  }

  // Register views initially if ready
  if (typeof window.wp !== 'undefined' && window.wp.mce && window.wp.mce.views) {
    registerVideopackViews();
  } else {
    document.addEventListener('DOMContentLoaded', registerVideopackViews);
  }

  /**
   * Setup observers for TinyMCE editors to handle React mounting.
   */
  function setupEditorObservers() {
    if (typeof tinymce === 'undefined') {
      return;
    }
    let videopack_scan_timeout;
    const debouncedScan = () => {
      if (videopack_scan_timeout) {
        clearTimeout(videopack_scan_timeout);
      }
      videopack_scan_timeout = setTimeout(scanAndMountAll, 150);
    };
    const initEditor = editor => {
      editor.on('init', () => {
        if (typeof videojs !== 'undefined') {
          editor.getWin().videojs = videojs;
        }
        // Share videopack_config and videojs with the iframe window
        editor.getWin().videopack_config = videopack_config;
      });
      editor.on('init setContent NodeChange', () => {
        debouncedScan();
      });

      // Setup MutationObserver for the editor body
      const body = editor.getDoc()?.body;
      if (body) {
        const observer = new MutationObserver(mutations => {
          let shouldScan = false;
          mutations.forEach(mutation => {
            if (mutation.addedNodes.length > 0) {
              shouldScan = true;
            }
          });
          if (shouldScan) {
            debouncedScan();
          }
        });
        observer.observe(body, {
          childList: true,
          subtree: true
        });
      }
    };
    tinymce.on('AddEditor', e => {
      initEditor(e.editor);
    });

    // Initialize existing editors
    tinymce.editors.forEach(editor => {
      initEditor(editor);
    });

    // Initial scan
    debouncedScan();
  }

  // Wait for TinyMCE to be fully loaded
  if (typeof tinymce !== 'undefined') {
    setupEditorObservers();
  } else {
    document.addEventListener('DOMContentLoaded', setupEditorObservers);
  }
})();
})();

/******/ })()
;
//# sourceMappingURL=classic-editor.js.map