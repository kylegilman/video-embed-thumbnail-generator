/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

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
/* harmony import */ var _EncodeProgress_scss__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./EncodeProgress.scss */ "./src/components/AdditionalFormats/EncodeProgress.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__);





const EncodeProgress = ({
  formatData,
  onCancelJob,
  deleteInProgress,
  onRefresh
}) => {
  const hasTriggeredRefresh = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(false);
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
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    const percent = formatData?.progress?.percent || 0;
    const isFinished = percent >= 100 || formatData?.progress?.progress === 'end';
    if (isFinished && onRefresh && !hasTriggeredRefresh.current && formatData?.encoding_now) {
      hasTriggeredRefresh.current = true;
      onRefresh();
    } else if (!isFinished) {
      hasTriggeredRefresh.current = false;
    }
  }, [formatData?.progress?.percent, formatData?.progress?.progress, onRefresh, formatData?.encoding_now]);
  if (formatData?.encoding_now && formatData?.progress) {
    const percent = Math.round(formatData.progress.percent);
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
        }), formatData.job_id && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
          onClick: onCancelJob,
          variant: "secondary",
          isDestructive: true,
          size: "small",
          className: "videopack-cancel-job",
          isBusy: deleteInProgress === formatData.job_id,
          icon: "no-alt",
          title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Cancel', 'video-embed-thumbnail-generator'),
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("span", {
            className: "videopack-button-text",
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Cancel', 'video-embed-thumbnail-generator')
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("div", {
        className: "videopack-encode-progress-small-text",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("span", {
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Elapsed:', 'video-embed-thumbnail-generator') + ' ' + convertToTimecode(formatData.progress.elapsed)
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("span", {
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Remaining:', 'video-embed-thumbnail-generator') + ' ' + convertToTimecode(formatData.progress.remaining)
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("span", {
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('fps:', 'video-embed-thumbnail-generator') + ' ' + formatData.progress.fps
        })]
      })]
    });
  }
  if (formatData?.status === 'failed' && formatData?.error_message) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("div", {
      className: "videopack-encode-error",
      children: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)(/* translators: %s is an error message */
      (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Error: %s.', 'video-embed-thumbnail-generator'), formatData.error_message), ' ', formatData.job_id && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
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

/***/ "./src/utils/utils.js"
/*!****************************!*\
  !*** ./src/utils/utils.js ***!
  \****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   assignFormat: () => (/* binding */ assignFormat),
/* harmony export */   clearQueue: () => (/* binding */ clearQueue),
/* harmony export */   createThumbnailFromCanvas: () => (/* binding */ createThumbnailFromCanvas),
/* harmony export */   deleteFile: () => (/* binding */ deleteFile),
/* harmony export */   deleteJob: () => (/* binding */ deleteJob),
/* harmony export */   enqueueJob: () => (/* binding */ enqueueJob),
/* harmony export */   generateShortcode: () => (/* binding */ generateShortcode),
/* harmony export */   generateThumbnail: () => (/* binding */ generateThumbnail),
/* harmony export */   getBatchProgress: () => (/* binding */ getBatchProgress),
/* harmony export */   getFreemiusPage: () => (/* binding */ getFreemiusPage),
/* harmony export */   getNetworkSettings: () => (/* binding */ getNetworkSettings),
/* harmony export */   getQueue: () => (/* binding */ getQueue),
/* harmony export */   getSettings: () => (/* binding */ getSettings),
/* harmony export */   getThumbnailCandidates: () => (/* binding */ getThumbnailCandidates),
/* harmony export */   getUsersWithCapability: () => (/* binding */ getUsersWithCapability),
/* harmony export */   getVideoFormats: () => (/* binding */ getVideoFormats),
/* harmony export */   getVideoGallery: () => (/* binding */ getVideoGallery),
/* harmony export */   normalizeOptions: () => (/* binding */ normalizeOptions),
/* harmony export */   removeJob: () => (/* binding */ removeJob),
/* harmony export */   resetNetworkSettings: () => (/* binding */ resetNetworkSettings),
/* harmony export */   resetVideopackSettings: () => (/* binding */ resetVideopackSettings),
/* harmony export */   saveAllThumbnails: () => (/* binding */ saveAllThumbnails),
/* harmony export */   saveNetworkSettings: () => (/* binding */ saveNetworkSettings),
/* harmony export */   saveWPSettings: () => (/* binding */ saveWPSettings),
/* harmony export */   setPosterImage: () => (/* binding */ setPosterImage),
/* harmony export */   startBatchProcess: () => (/* binding */ startBatchProcess),
/* harmony export */   testEncodeCommand: () => (/* binding */ testEncodeCommand),
/* harmony export */   toggleQueue: () => (/* binding */ toggleQueue),
/* harmony export */   uploadThumbnail: () => (/* binding */ uploadThumbnail)
/* harmony export */ });
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_url__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/url */ "@wordpress/url");
/* harmony import */ var _wordpress_url__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_url__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/hooks */ "@wordpress/hooks");
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__);
/* global videopack_config */



const getQueue = async () => {
  const pre = (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__.applyFilters)('videopack.utils.pre_getQueue', undefined);
  if (typeof pre !== 'undefined') {
    return pre;
  }
  try {
    const response = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: '/videopack/v1/queue'
    });
    return (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__.applyFilters)('videopack.utils.getQueue', response || []);
  } catch (error) {
    console.error('Error fetching queue:', error);
    throw error;
  }
};
const toggleQueue = async action => {
  try {
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: '/videopack/v1/queue/control',
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
const clearQueue = async type => {
  try {
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: '/videopack/v1/queue/clear',
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
const deleteJob = async jobId => {
  try {
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: `/videopack/v1/queue/${jobId}`,
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
};
const removeJob = async jobId => {
  try {
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: `/videopack/v1/queue/remove/${jobId}`,
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error removing job:', error);
    throw error;
  }
};
const getVideoFormats = async (attachmentId, url = '') => {
  const pre = (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__.applyFilters)('videopack.utils.pre_getVideoFormats', undefined, attachmentId, url);
  if (typeof pre !== 'undefined') {
    return pre;
  }
  try {
    const path = (0,_wordpress_url__WEBPACK_IMPORTED_MODULE_1__.addQueryArgs)(`/videopack/v1/formats/${attachmentId}`, {
      url
    });
    const response = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path
    });
    return (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__.applyFilters)('videopack.utils.getVideoFormats', response, attachmentId, url);
  } catch (error) {
    console.error('Error fetching video formats:', error);
    throw error;
  }
};
const enqueueJob = async (attachmentId, src, formats, parentId = 0) => {
  const pre = (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__.applyFilters)('videopack.utils.pre_enqueueJob', undefined, attachmentId, src, formats);
  if (typeof pre !== 'undefined') {
    return pre;
  }
  try {
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: `/videopack/v1/queue/${attachmentId}`,
      method: 'POST',
      data: {
        url: src,
        formats,
        parent_id: parentId
      }
    });
  } catch (error) {
    console.error('Error enqueuing job:', error);
    throw error;
  }
};
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
 * Converts a canvas to a blob and uploads it as a thumbnail.
 *
 * @param {HTMLCanvasElement} canvas       The canvas element to upload.
 * @param {number}            attachmentId The ID of the video attachment.
 * @param {string}            videoSrc     The URL of the video (used for filename).
 * @param {number}            parentId     The ID of the parent post.
 * @return {Promise<Object>} The response from the upload endpoint.
 */
const createThumbnailFromCanvas = (canvas, attachmentId, videoSrc, parentId = 0) => {
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
        formData.append('parent_id', parentId);
        formData.append('url', videoSrc);
        formData.append('post_name', (0,_wordpress_url__WEBPACK_IMPORTED_MODULE_1__.getFilename)(videoSrc));
        const response = await uploadThumbnail(formData);
        resolve(response);
      } catch (error) {
        reject(error);
      }
    }, 'image/jpeg');
  });
};
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
const saveAllThumbnails = async (attachment_id, thumb_urls, parent_id = 0, url = '') => {
  try {
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: '/videopack/v1/thumbs/save_all',
      method: 'POST',
      data: {
        attachment_id,
        thumb_urls,
        parent_id,
        url
      }
    });
  } catch (error) {
    console.error('Error saving all thumbnails:', error);
    throw error;
  }
};
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
const getSettings = async () => {
  const pre = (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__.applyFilters)('videopack.utils.pre_getSettings', undefined);
  if (typeof pre !== 'undefined') {
    return pre;
  }
  try {
    const allSettings = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: '/wp/v2/settings'
    });
    const settings = allSettings.videopack_options || {};
    return (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__.applyFilters)('videopack.utils.getSettings', settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
};
const saveWPSettings = async newSettings => {
  try {
    const response = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: '/wp/v2/settings',
      method: 'POST',
      data: {
        videopack_options: newSettings
      }
    });
    return response.videopack_options || {};
  } catch (error) {
    console.error('Error saving WP settings:', error);
    throw error;
  }
};
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
const resetVideopackSettings = async () => {
  try {
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: '/videopack/v1/defaults'
    });
  } catch (error) {
    console.error('Error resetting Videopack settings:', error);
    throw error;
  }
};
const setPosterImage = async (attachment_id, thumb_url, parent_id = 0, url = '') => {
  try {
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: '/videopack/v1/thumbs',
      method: 'PUT',
      data: {
        attachment_id,
        thumburl: thumb_url,
        parent_id,
        url
      }
    });
  } catch (error) {
    console.error('Error setting poster image:', error);
    throw error;
  }
};
const generateThumbnail = async (url, total_thumbnails, thumbnail_index, attachment_id, generate_button, parent_id = 0) => {
  try {
    const path = (0,_wordpress_url__WEBPACK_IMPORTED_MODULE_1__.addQueryArgs)('/videopack/v1/thumbs', {
      url,
      total_thumbnails,
      thumbnail_index,
      attachment_id,
      generate_button,
      parent_id
    });
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path
    });
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw error;
  }
};
const startBatchProcess = async (type, additionalData = {}) => {
  const pre = (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__.applyFilters)('videopack.utils.pre_startBatchProcess', undefined, type, additionalData);
  if (typeof pre !== 'undefined') {
    return pre;
  }
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
const getBatchProgress = async type => {
  try {
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: `/videopack/v1/batch/progress?type=${type}`,
      method: 'GET'
    });
  } catch (error) {
    console.error(`Error fetching ${type} batch progress:`, error);
    throw error;
  }
};
const getThumbnailCandidates = async () => {
  try {
    return await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: '/videopack/v1/thumbs/candidates',
      method: 'GET'
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
const normalizeOptions = data => {
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
const generateShortcode = (attributes, url = '', options = null) => {
  const {
    id,
    gallery,
    ...rest
  } = attributes;
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

/***/ },

/***/ "./src/components/AdditionalFormats/EncodeProgress.scss"
/*!**************************************************************!*\
  !*** ./src/components/AdditionalFormats/EncodeProgress.scss ***!
  \**************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "./src/features/encode-queue/encode-queue.scss"
/*!*****************************************************!*\
  !*** ./src/features/encode-queue/encode-queue.scss ***!
  \*****************************************************/
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

/***/ "@wordpress/components"
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
(module) {

module.exports = window["wp"]["components"];

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

/***/ "@wordpress/url"
/*!*****************************!*\
  !*** external ["wp","url"] ***!
  \*****************************/
(module) {

module.exports = window["wp"]["url"];

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
/******/ 		// Check if module exists (development only)
/******/ 		if (__webpack_modules__[moduleId] === undefined) {
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
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
/*!***************************************************!*\
  !*** ./src/features/encode-queue/encode-queue.js ***!
  \***************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _encode_queue_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./encode-queue.scss */ "./src/features/encode-queue/encode-queue.scss");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_html_entities__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/html-entities */ "@wordpress/html-entities");
/* harmony import */ var _wordpress_html_entities__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_html_entities__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _components_AdditionalFormats_EncodeProgress__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../components/AdditionalFormats/EncodeProgress */ "./src/components/AdditionalFormats/EncodeProgress.js");
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../utils/utils */ "./src/utils/utils.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__);
/* global videopack */









const JobRow = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.memo)(({
  job,
  index,
  isMultisite,
  openConfirmDialog,
  deletingJobId,
  fetchQueue
}) => {
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("tr", {
    className: job.status === 'encoding' || job.status === 'processing' ? 'videopack-job-encoding' : '',
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("td", {
      children: index + 1
    }), isMultisite && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("td", {
      children: job.blog_name
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("td", {
      children: job.user_name || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('N/A', 'video-embed-thumbnail-generator')
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("td", {
      children: job.poster_url ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("img", {
        src: job.poster_url,
        alt: job.video_title,
        className: "videopack-queue-attachment-poster"
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Icon, {
        icon: "format-video"
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("td", {
      children: job.attachment_link ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("a", {
        href: (0,_wordpress_html_entities__WEBPACK_IMPORTED_MODULE_4__.decodeEntities)(job.attachment_link),
        children: job.video_title
      }) : job.video_title
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("td", {
      children: job.format_name
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("td", {
      className: "videopack-status-cell",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
        children: job.status_l10n
      }), job.status === 'completed' && job.completed_at && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
        className: "videopack-completion-time",
        children: new Date(job.completed_at + 'Z').toLocaleString([], {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric'
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_components_AdditionalFormats_EncodeProgress__WEBPACK_IMPORTED_MODULE_5__["default"], {
        formatData: {
          ...job,
          encoding_now: job.status === 'encoding' || job.status === 'processing',
          job_id: job.id
        },
        onCancelJob: () => openConfirmDialog('delete', {
          jobId: job.id
        }),
        deleteInProgress: deletingJobId,
        onRefresh: () => fetchQueue()
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("td", {
      children: job.status !== 'encoding' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
        variant: "tertiary",
        isDestructive: true,
        onClick: () => openConfirmDialog('remove', {
          jobId: job.id
        }),
        isBusy: deletingJobId === job.id,
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Clear', 'video-embed-thumbnail-generator')
      })
    })]
  }, job.id);
});
const EncodeQueue = () => {
  const [queueData, setQueueData] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)([]);
  const [isLoading, setIsLoading] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(true);
  const [isQueuePaused, setIsQueuePaused] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(videopack.encodeQueueData.initialQueueState === 'pause');
  const [message, setMessage] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(null);
  const [isClearing, setIsClearing] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(false);
  const [isTogglingQueue, setIsTogglingQueue] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(false);
  const [isConfirmOpen, setIsConfirmOpen] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(false);
  const [itemToActOn, setItemToActOn] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(null); // { action: 'clear'/'delete'/'remove', type: 'completed'/'all', jobId: ? }
  const [deletingJobId, setDeletingJobId] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(null);
  const [batchProgress, setBatchProgress] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)({});
  const progressTimerRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useRef)(null);

  // Auto-clear success messages after 30 seconds.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useEffect)(() => {
    if (message && message.type === 'success') {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [message]);
  const isEncoding = queueData.some(job => job.status === 'encoding' || job.status === 'processing');
  const incrementEncodeProgress = () => {
    setQueueData(currentQueueData => {
      if (!currentQueueData) {
        return currentQueueData;
      }
      const anyActive = currentQueueData.some(job => job.status === 'encoding' || job.status === 'processing');
      if (!anyActive) {
        return currentQueueData;
      }
      const updatedQueueData = [...currentQueueData];
      const now = new Date().getTime() / 1000;
      updatedQueueData.forEach((job, index) => {
        if ((job.status === 'encoding' || job.status === 'processing') && job.progress && job.started) {
          // Handle potential clock drift between server and client
          const elapsed = Math.max(0, now - job.started);
          let percent = parseFloat(job.progress.percent) || 0;
          let remaining = job.progress.remaining;
          if (job.video_duration && job.video_duration > 0) {
            const totalDurationInSeconds = job.video_duration / 1000000;
            const speedMatch = job.progress.speed ? String(job.progress.speed).match(/(\d*\.?\d+)/) : null;
            const speed = speedMatch ? parseFloat(speedMatch[1]) : 1;

            // Interpolate progress
            const interpolatedPercent = elapsed * speed * 100 / totalDurationInSeconds;

            // Don't let interpolation go backwards or exceed 99%
            // 100% should only be set by the server response
            percent = Math.min(99, Math.max(percent, interpolatedPercent));
            const remainingSeconds = (totalDurationInSeconds - totalDurationInSeconds * percent / 100) / speed;
            remaining = Math.max(0, remainingSeconds);
          }
          updatedQueueData[index] = {
            ...job,
            progress: {
              ...job.progress,
              elapsed,
              remaining,
              percent
            }
          };
        }
      });
      return updatedQueueData;
    });
  };
  const fetchQueue = async () => {
    try {
      const newData = await (0,_utils_utils__WEBPACK_IMPORTED_MODULE_6__.getQueue)();
      setQueueData(prevData => {
        if (JSON.stringify(prevData) !== JSON.stringify(newData)) {
          return newData;
        }
        return prevData;
      });
      const progressData = await (0,_utils_utils__WEBPACK_IMPORTED_MODULE_6__.getBatchProgress)('all');
      setBatchProgress(progressData);
    } catch (error) {
      console.error('Error fetching queue:', error);
      setMessage({
        type: 'error',
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)(/* translators: %s is an error message */
        (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Failed to load queue: %s', 'video-embed-thumbnail-generator'), error.message || error.code)
      });
    } finally {
      setIsLoading(false);
    }
  };
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useEffect)(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, []);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useEffect)(() => {
    if (isEncoding) {
      if (progressTimerRef.current === null) {
        progressTimerRef.current = setInterval(incrementEncodeProgress, 1000);
      }
    } else {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    return () => {
      if (progressTimerRef.current !== null) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    };
  }, [isEncoding]);
  const handleToggleQueue = async () => {
    setIsTogglingQueue(true);
    const action = isQueuePaused ? 'play' : 'pause';
    try {
      const response = await (0,_utils_utils__WEBPACK_IMPORTED_MODULE_6__.toggleQueue)(action);
      setIsQueuePaused(response.queue_state === 'pause');
      setMessage({
        type: 'success',
        text: response.message
      });
      fetchQueue(); // Refresh queue data after state change
    } catch (error) {
      console.error('Error toggling queue:', error);
      setMessage({
        type: 'error',
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)(/* translators: %s is an error message */
        (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Failed to toggle queue: %s', 'video-embed-thumbnail-generator'), error.message || error.code)
      });
    } finally {
      setIsTogglingQueue(false);
    }
  };
  const openConfirmDialog = (action, details) => {
    setItemToActOn({
      action,
      ...details
    });
    setIsConfirmOpen(true);
  };
  const handleConfirm = () => {
    if (!itemToActOn) {
      return;
    }
    if (itemToActOn.action === 'clear') {
      handleClearQueue(itemToActOn.type);
    } else if (itemToActOn.action === 'delete') {
      handleDeleteJob(itemToActOn.jobId);
    } else if (itemToActOn.action === 'remove') {
      handleRemoveJob(itemToActOn.jobId);
    }
    setIsConfirmOpen(false);
    setItemToActOn(null);
  };
  const handleClearQueue = async type => {
    setIsClearing(true);
    try {
      const response = await (0,_utils_utils__WEBPACK_IMPORTED_MODULE_6__.clearQueue)(type);
      setMessage({
        type: 'success',
        text: response.message
      });
      fetchQueue(); // Refresh queue data
    } catch (error) {
      console.error('Error clearing queue:', error);
      setMessage({
        type: 'error',
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)(/* translators: %s is an error message */
        (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Failed to clear queue: %s', 'video-embed-thumbnail-generator'), error.message || error.code)
      });
    } finally {
      setIsClearing(false);
    }
  };
  const handleDeleteJob = async jobId => {
    setDeletingJobId(jobId);
    try {
      await (0,_utils_utils__WEBPACK_IMPORTED_MODULE_6__.deleteJob)(jobId);
      setMessage({
        type: 'success',
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Job deleted.', 'video-embed-thumbnail-generator')
      });
      fetchQueue();
    } catch (error) {
      console.error('Error deleting job:', error);
      setMessage({
        type: 'error',
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)(/* translators: %s is an error message */
        (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Error deleting job: %s', 'video-embed-thumbnail-generator'), error.message)
      });
    } finally {
      setDeletingJobId(null);
    }
  };
  const handleRemoveJob = async jobId => {
    setDeletingJobId(jobId);
    try {
      await (0,_utils_utils__WEBPACK_IMPORTED_MODULE_6__.removeJob)(jobId);
      setMessage({
        type: 'success',
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Job removed from queue.', 'video-embed-thumbnail-generator')
      });
      fetchQueue();
    } catch (error) {
      console.error('Error removing job:', error);
      setMessage({
        type: 'error',
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)(/* translators: %s is an error message */
        (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Error removing job: %s', 'video-embed-thumbnail-generator'), error.message)
      });
    } finally {
      setDeletingJobId(null);
    }
  };
  const isMultisite = videopack.isMultisite || videopack.encodeQueueData?.isNetwork;
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
    className: "wrap videopack-encode-queue",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("h1", {
      children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Videopack Queue', 'video-embed-thumbnail-generator')
    }), Object.entries(batchProgress).map(([type, progress]) => {
      if (!progress || progress.pending === 0 && progress['in-progress'] === 0) {
        return null;
      }
      const labels = {
        featured: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Setting Featured Images', 'video-embed-thumbnail-generator'),
        parents: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Updating Parents', 'video-embed-thumbnail-generator'),
        thumbs: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Generating Thumbnails (FFmpeg)', 'video-embed-thumbnail-generator'),
        encoding: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Bulk Encoding', 'video-embed-thumbnail-generator'),
        browser: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Pending In-Browser Thumbnails', 'video-embed-thumbnail-generator')
      };
      const label = labels[type] || type;
      return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, {
        title: label,
        initialOpen: true,
        className: "videopack-batch-progress-panel",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
          className: "videopack-batch-progress-content",
          children: type === 'browser' ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("p", {
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)(/* translators: %d: number of videos waiting for browser-side processing */
            (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Waiting for processing: %d', 'video-embed-thumbnail-generator'), progress.pending)
          }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.Fragment, {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
              className: "videopack-batch-stats",
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)(/* translators: %d: number of pending items */
                (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Pending: %d', 'video-embed-thumbnail-generator'), progress.pending)
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)(/* translators: %d: number of in-progress items */
                (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('In-Progress: %d', 'video-embed-thumbnail-generator'), progress['in-progress'])
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)(/* translators: %d: number of completed items */
                (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Completed: %d', 'video-embed-thumbnail-generator'), progress.complete)
              }), progress.failed > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                className: "videopack-failed-count",
                children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)(/* translators: %d: number of failed items */
                (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Failed: %d', 'video-embed-thumbnail-generator'), progress.failed)
              })]
            }), progress.total > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
              className: "videopack-meter",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
                className: "videopack-meter-bar",
                style: {
                  width: `${Math.round((progress.complete + progress.failed) / progress.total * 100)}%`
                }
              })
            })]
          })
        })
      }, type);
    }), message && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Notice, {
      status: message.type,
      onRemove: () => setMessage(null),
      children: message.text
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.__experimentalConfirmDialog, {
      isOpen: isConfirmOpen,
      onConfirm: handleConfirm,
      onCancel: () => setIsConfirmOpen(false),
      className: "videopack-confirm-dialog",
      children: itemToActOn?.action === 'clear' ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)(/* translators: %s: jobs type ('completed' or 'all') */
      (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Are you sure you want to clear %s jobs?', 'video-embed-thumbnail-generator'), itemToActOn.type) : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Are you sure you want to remove this job?', 'video-embed-thumbnail-generator')
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
        className: "videopack-queue-controls",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
          variant: "primary",
          onClick: handleToggleQueue,
          isBusy: isTogglingQueue,
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Icon, {
            icon: isQueuePaused ? 'controls-play' : 'controls-pause'
          }), isQueuePaused ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Play Queue', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Pause Queue', 'video-embed-thumbnail-generator')]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
          variant: "secondary",
          onClick: () => openConfirmDialog('clear', {
            type: 'completed'
          }),
          isBusy: isClearing,
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Clear Completed', 'video-embed-thumbnail-generator')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
          variant: "tertiary",
          isDestructive: true,
          onClick: () => openConfirmDialog('clear', {
            type: 'all'
          }),
          isBusy: isClearing,
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Clear All', 'video-embed-thumbnail-generator')
        }), isLoading && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Spinner, {})]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.__experimentalDivider, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("table", {
        className: `wp-list-table widefat striped table-view-list videopack-queue-table ${isMultisite ? 'is-multisite' : ''}`,
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("thead", {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("tr", {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("th", {
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Order', 'video-embed-thumbnail-generator')
            }), isMultisite && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("th", {
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Site', 'video-embed-thumbnail-generator')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("th", {
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('User', 'video-embed-thumbnail-generator')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("th", {
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Thumbnail', 'video-embed-thumbnail-generator')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("th", {
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('File', 'video-embed-thumbnail-generator')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("th", {
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Format', 'video-embed-thumbnail-generator')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("th", {
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Status', 'video-embed-thumbnail-generator')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("th", {
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Actions', 'video-embed-thumbnail-generator')
            })]
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("tbody", {
          children: [isLoading && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("tr", {
            className: "videopack-queue-message-row",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("td", {
              colSpan: isMultisite ? 8 : 7,
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Loading queue…', 'video-embed-thumbnail-generator')
            })
          }), !isLoading && queueData.length === 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("tr", {
            className: "videopack-queue-message-row",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("td", {
              colSpan: isMultisite ? 8 : 7,
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('The encode queue is empty.', 'video-embed-thumbnail-generator')
            })
          }), !isLoading && queueData.map((job, index) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(JobRow, {
            job: job,
            index: index,
            isMultisite: isMultisite,
            openConfirmDialog: openConfirmDialog,
            deletingJobId: deletingJobId,
            fetchQueue: fetchQueue
          }, job.id))]
        })]
      })]
    })]
  });
};

// Render the component
document.addEventListener('DOMContentLoaded', function () {
  const rootElement = document.getElementById('videopack-queue-root') || document.getElementById('videopack-network-queue-root');
  if (rootElement) {
    const root = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.createRoot)(rootElement);
    root.render(/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(EncodeQueue, {}));
  }
});
})();

/******/ })()
;
//# sourceMappingURL=encode-queue.js.map