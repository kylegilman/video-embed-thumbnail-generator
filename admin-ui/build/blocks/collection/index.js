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

/***/ "./src/blocks/collection/edit.js"
/*!***************************************!*\
  !*** ./src/blocks/collection/edit.js ***!
  \***************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Edit)
/* harmony export */ });
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _api_settings__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../api/settings */ "./src/api/settings.js");
/* harmony import */ var _hooks_useVideoQuery__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../hooks/useVideoQuery */ "./src/hooks/useVideoQuery.js");
/* harmony import */ var _components_InspectorControls_CollectionSettingsPanel__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../components/InspectorControls/CollectionSettingsPanel */ "./src/components/InspectorControls/CollectionSettingsPanel.js");
/* harmony import */ var _utils_context__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../utils/context */ "./src/utils/context.js");
/* harmony import */ var _editor_scss__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./editor.scss */ "./src/blocks/collection/editor.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__);











const ALLOWED_BLOCKS = ['videopack/video-loop', 'videopack/pagination'];

// Default Template structure components
const getGalleryTemplate = options => {
  const loopChildren = [['videopack/thumbnail', {
    linkTo: 'lightbox'
  }, [['videopack/play-button', {}], options?.overlay_title !== false ? ['videopack/video-title', {}] : null].filter(Boolean)]];
  const template = [['videopack/video-loop', {}, loopChildren]];
  if (options?.gallery_pagination) {
    template.push(['videopack/pagination', {}]);
  }
  return template;
};
const getListTemplate = options => {
  const showTitleBar = !!(options?.overlay_title || options?.downloadlink || options?.embedcode);
  const engineChildren = [];
  if (showTitleBar) {
    engineChildren.push(['videopack/video-title', {}]);
  }
  if (options?.watermark) {
    engineChildren.push(['videopack/video-watermark', {}]);
  }
  const videoChildren = [['videopack/video-player-engine', {
    lock: {
      remove: true,
      move: false
    }
  }, engineChildren]];
  if (options?.views) {
    videoChildren.push(['videopack/view-count', {}]);
  }
  const loopChildren = [['videopack/videopack-video', {}, videoChildren]];
  const template = [['videopack/video-loop', {}, loopChildren]];
  if (options?.gallery_pagination) {
    template.push(['videopack/pagination', {}]);
  }
  return template;
};
function Edit({
  attributes,
  setAttributes,
  clientId,
  context
}) {
  const [options, setOptions] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)();
  const {
    layout = 'grid',
    columns = 3,
    currentPage = 1,
    totalPages
  } = attributes;

  // Resolve Effective Values for design and pagination (these follow global settings)
  const effectiveValues = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useMemo)(() => {
    const keys = ['skin', 'align', 'gallery_pagination', 'gallery_per_page', 'enable_collection_video_limit', 'collection_video_limit', 'title_color', 'title_background_color', 'play_button_color', 'play_button_secondary_color', 'control_bar_bg_color', 'control_bar_color', 'views', 'overlay_title'];
    const resolved = {};
    keys.forEach(key => {
      resolved[key] = (0,_utils_context__WEBPACK_IMPORTED_MODULE_8__.getEffectiveValue)(key, attributes, context);
    });
    return resolved;
  }, [attributes, context]);
  const previewPostId = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => select('core/editor').getCurrentPostId(), []);

  // We fetch query data to power the live preview template and pagination info
  const queryData = (0,_hooks_useVideoQuery__WEBPACK_IMPORTED_MODULE_6__["default"])({
    ...attributes,
    gallery_pagination: effectiveValues.gallery_pagination,
    gallery_per_page: effectiveValues.gallery_pagination ? effectiveValues.gallery_per_page || 12 : effectiveValues.enable_collection_video_limit ? effectiveValues.collection_video_limit || 12 : -1,
    page_number: currentPage || 1
  }, previewPostId);
  const {
    hasPaginationBlock,
    isNewlyInserted
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    const {
      getBlocks,
      getBlock
    } = select('core/block-editor');
    const blocks = getBlocks(clientId) || [];
    const block = getBlock(clientId);
    return {
      hasPaginationBlock: blocks.some(b => b.name === 'videopack/pagination'),
      isNewlyInserted: blocks.length === 0 && block && block.isValid
    };
  }, [clientId]);

  // Sync local gallery_pagination attribute with presence of pagination block
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useEffect)(() => {
    if (hasPaginationBlock !== !!attributes.gallery_pagination) {
      setAttributes({
        gallery_pagination: hasPaginationBlock
      });
    }
  }, [hasPaginationBlock, attributes.gallery_pagination, setAttributes]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useEffect)(() => {
    if (queryData.maxNumPages !== undefined && queryData.maxNumPages !== totalPages) {
      setAttributes({
        totalPages: queryData.maxNumPages
      });
    }
  }, [queryData.maxNumPages, totalPages, setAttributes]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useEffect)(() => {
    (0,_api_settings__WEBPACK_IMPORTED_MODULE_5__.getSettings)().then(response => {
      setOptions(response);
    });
  }, []);

  // Resolve blockGap value for use in internal grid spacing
  const resolvedBlockGap = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useMemo)(() => {
    const gap = attributes.style?.spacing?.blockGap;
    if (!gap) return undefined;

    // Handle Gutenberg preset variables: var:preset|spacing|X -> var(--wp--preset--spacing--X)
    if (typeof gap === 'string' && gap.startsWith('var:preset|spacing|')) {
      return gap.replace('var:preset|spacing|', 'var(--wp--preset--spacing--') + ')';
    }
    return gap;
  }, [attributes.style?.spacing?.blockGap]);

  // Dynamic Template based on global settings (only used for new blocks)
  const dynamicTemplate = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useMemo)(() => {
    if (layout === 'list') {
      return getListTemplate(options);
    }
    return getGalleryTemplate(options);
  }, [layout, options]);
  const blockProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__.useBlockProps)({
    className: ['videopack-collection', 'videopack-wrapper', `layout-${layout}`, `columns-${columns}`,
    // If no explicit align is set, apply the effective (global) align class
    !attributes.align && effectiveValues.align ? `align${effectiveValues.align}` : '', effectiveValues.title_color ? 'videopack-has-title-color' : '', effectiveValues.title_background_color ? 'videopack-has-title-background-color' : '', effectiveValues.play_button_color ? 'videopack-has-play-button-color' : '', effectiveValues.play_button_secondary_color ? 'videopack-has-play-button-secondary-color' : '', effectiveValues.control_bar_bg_color ? 'videopack-has-control-bar-bg-color' : '', effectiveValues.control_bar_color ? 'videopack-has-control-bar-color' : ''].filter(Boolean).join(' '),
    style: {
      '--videopack-title-color': effectiveValues.title_color,
      '--videopack-title-background-color': effectiveValues.title_background_color,
      '--videopack-play-button-color': effectiveValues.play_button_color,
      '--videopack-play-button-secondary-color': effectiveValues.play_button_secondary_color,
      '--videopack-control-bar-bg-color': effectiveValues.control_bar_bg_color,
      '--videopack-control-bar-color': effectiveValues.control_bar_color,
      '--videopack-collection-columns': columns,
      '--videopack-collection-gap': resolvedBlockGap
    }
  });

  // If options haven't loaded yet for a newly inserted block, don't render InnerBlocks 
  // to prevent the wrong template from being applied.
  if (!options && isNewlyInserted) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
      ...blockProps,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
        className: "videopack-collection-placeholder",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Spinner, {})
      })
    });
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__.InspectorControls, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Layout Settings', 'video-embed-thumbnail-generator'),
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Layout', 'video-embed-thumbnail-generator'),
          value: layout,
          options: [{
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Grid', 'video-embed-thumbnail-generator'),
            value: 'grid'
          }, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('List', 'video-embed-thumbnail-generator'),
            value: 'list'
          }],
          onChange: value => setAttributes({
            layout: value
          })
        }), layout === 'grid' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.RangeControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Columns', 'video-embed-thumbnail-generator'),
          value: columns,
          onChange: value => setAttributes({
            columns: value
          }),
          min: 1,
          max: 6
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_components_InspectorControls_CollectionSettingsPanel__WEBPACK_IMPORTED_MODULE_7__["default"], {
        attributes: attributes,
        setAttributes: setAttributes,
        queryData: queryData,
        options: options,
        showGalleryOptions: true,
        showPaginationToggle: false,
        showLayoutSettings: false,
        showPaginationSettings: true,
        hasPaginationBlock: hasPaginationBlock
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
      ...blockProps,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__.BlockContextProvider, {
        value: {
          ...context,
          'videopack/layout': layout,
          'videopack/columns': columns,
          'videopack/skin': effectiveValues.skin,
          'videopack/gallery_pagination': effectiveValues.gallery_pagination,
          'videopack/gallery_per_page': effectiveValues.gallery_per_page,
          'videopack/enable_collection_video_limit': effectiveValues.enable_collection_video_limit,
          'videopack/collection_video_limit': effectiveValues.collection_video_limit,
          'videopack/title_color': effectiveValues.title_color,
          'videopack/title_background_color': effectiveValues.title_background_color,
          'videopack/play_button_color': effectiveValues.play_button_color,
          'videopack/play_button_secondary_color': effectiveValues.play_button_secondary_color,
          'videopack/control_bar_bg_color': effectiveValues.control_bar_bg_color,
          'videopack/control_bar_color': effectiveValues.control_bar_color,
          'videopack/views': effectiveValues.views,
          'videopack/overlay_title': effectiveValues.overlay_title,
          'videopack/totalPages': queryData.maxNumPages
        },
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__.InnerBlocks, {
          allowedBlocks: ALLOWED_BLOCKS,
          template: dynamicTemplate
        })
      })
    })]
  });
}

/***/ },

/***/ "./src/blocks/collection/save.js"
/*!***************************************!*\
  !*** ./src/blocks/collection/save.js ***!
  \***************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ save)
/* harmony export */ });
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__);


function save() {
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__.InnerBlocks.Content, {});
}

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
  showPaginationSettings = true
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
    children: [isGalleryOrList && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
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
    }), isGalleryOrList && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
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
    }), isGalleryOrList && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
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
  setAttributes
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
      checked: !!overlay_title
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
  showManualSource = true,
  isSiteEditor = false,
  hasPaginationBlock = true
}) {
  const {
    gallery_include,
    gallery_orderby,
    gallery_order,
    gallery_per_page,
    enable_collection_video_limit,
    collection_video_limit
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
    }), hasPaginationBlock && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Number of videos per page', 'video-embed-thumbnail-generator'),
      type: "number",
      value: gallery_per_page ?? '',
      onChange: val => updateNumericAttribute('gallery_per_page', val)
    }), !hasPaginationBlock && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.Fragment, {
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
      initialOpen: false,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_CollectionLayoutSettings__WEBPACK_IMPORTED_MODULE_4__["default"], {
        attributes: attributes,
        setAttributes: setAttributes
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Colors', 'video-embed-thumbnail-generator'),
      initialOpen: true,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_CollectionColorSettings__WEBPACK_IMPORTED_MODULE_5__["default"], {
        attributes: attributes,
        setAttributes: setAttributes,
        options: options,
        blockType: blockType,
        showPaginationSettings: showPaginationSettings
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
        if (value !== 'custom') {
          newAttributes.gallery_id = 0;
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
function useVideoQuery(attributes, previewPostId) {
  const {
    gallery_id,
    gallery_source,
    gallery_category,
    gallery_tag,
    gallery_orderby,
    gallery_order,
    gallery_include,
    gallery_exclude,
    gallery_pagination,
    gallery_per_page = 12,
    page_number = 1,
    enable_collection_video_limit = false,
    collection_video_limit = 12
  } = attributes;
  const {
    categories,
    tags
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    const {
      getEntityRecords
    } = select('core');
    return {
      categories: getEntityRecords('taxonomy', 'category', {
        per_page: -1
      }),
      tags: getEntityRecords('taxonomy', 'post_tag', {
        per_page: -1
      })
    };
  }, []);
  const [searchString, setSearchString] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const debouncedSetSearchString = (0,_wordpress_compose__WEBPACK_IMPORTED_MODULE_2__.useDebounce)(setSearchString, 500);
  const postTypes = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => select('core').getPostTypes({
    per_page: -1
  }), []);
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
  const searchableTypes = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    if (!postTypes) {
      return ['post', 'page'];
    }
    return postTypes.filter(type => type.viewable && type.slug !== 'attachment').map(type => type.slug);
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
      gallery_per_page: gallery_pagination ? parseInt(gallery_per_page, 10) || 12 : enable_collection_video_limit ? parseInt(collection_video_limit, 10) || 12 : -1,
      page_number: parseInt(page_number, 10) || 1,
      gallery_id: gallery_id ? parseInt(gallery_id, 10) : undefined,
      gallery_include,
      gallery_exclude,
      gallery_source,
      gallery_category,
      gallery_tag,
      gallery_pagination
    };

    // Skip query if required parameters for the source are missing
    const isMissingCustomId = gallery_source === 'custom' && !gallery_id;
    const isMissingCategoryId = gallery_source === 'category' && !gallery_category;
    const isMissingTagId = gallery_source === 'tag' && !gallery_tag;
    const isMissingCurrentId = gallery_source === 'current' && !gallery_id && !previewPostId;
    const isMissingManualInclude = gallery_source === 'manual' && !gallery_include;
    if (isMissingCustomId || isMissingCategoryId || isMissingTagId || isMissingCurrentId || isMissingManualInclude) {
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
      console.error('Error fetching videos:', error);
      setVideoResults([]);
      setTotalResults(0);
      setMaxNumPages(1);
    }).finally(() => {
      setIsResolvingVideos(false);
    });
  }, [gallery_id, gallery_source, gallery_category, gallery_tag, gallery_orderby, gallery_order, gallery_include, gallery_exclude, gallery_pagination, gallery_per_page, page_number, previewPostId]);
  const {
    searchResults,
    currentPost,
    isResolvingSearch
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    const {
      getEntityRecord,
      getEntityRecords,
      isResolving: checkResolving
    } = select('core');
    const results = [];
    let resolving = false;
    if (searchString) {
      const query = {
        search: searchString,
        per_page: 20,
        status: 'publish'
      };
      searchableTypes.forEach(type => {
        const records = getEntityRecords('postType', type, query);
        if (records) {
          results.push(...records);
        }
        if (checkResolving('getEntityRecords', ['postType', type, query])) {
          resolving = true;
        }
      });
    } else {
      const query = {
        per_page: 5,
        status: 'publish'
      };
      searchableTypes.forEach(type => {
        const records = getEntityRecords('postType', type, query);
        if (records) {
          results.push(...records);
        }
        if (checkResolving('getEntityRecords', ['postType', type, query])) {
          resolving = true;
        }
      });
    }
    let current = null;
    if (gallery_id) {
      // Use a plural query with a dummy ID (-1) to "force" the REST API to return an empty array 
      // instead of a 404 error if the ID doesn't exist for the specific post type.
      // We also use context="view" and _fields for better performance and silence.
      const query = {
        include: [gallery_id, -1],
        per_page: 2,
        context: 'view',
        _fields: 'id,title,type'
      };
      searchableTypes.forEach(type => {
        if (current) return;
        const records = getEntityRecords('postType', type, query);
        if (records && records.length > 0) {
          current = records.find(r => r.id === gallery_id);
        }
      });
    }
    return {
      searchResults: results,
      currentPost: current,
      isResolvingSearch: resolving
    };
  }, [searchString, gallery_id, searchableTypes]);
  const excludedIds = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    return gallery_exclude ? gallery_exclude.split(',').map(id => parseInt(id, 10)) : [];
  }, [gallery_exclude]);
  const excludedVideos = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    if (excludedIds.length === 0) {
      return [];
    }
    const records = select('core').getEntityRecords('postType', 'attachment', {
      include: excludedIds,
      per_page: -1,
      media_type: 'video'
    });
    return records || [];
  }, [excludedIds]);
  return {
    categories,
    tags,
    searchString,
    setSearchString,
    debouncedSetSearchString,
    videoResults,
    searchResults,
    currentPost,
    totalResults,
    maxNumPages,
    isResolving: isResolvingVideos,
    isResolvingSearch,
    excludedIds,
    excludedVideos
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
    fallbacks.control_bar_bg_color = 'rgba(0, 0, 0, 0.35)';
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
        break;
      case 'vjs-theme-fantasy':
        fallbacks.title_background_color = '#9f44b4';
        fallbacks.play_button_secondary_color = '#9f44b4';
        break;
      case 'vjs-theme-forest':
        fallbacks.title_background_color = '#6fb04e';
        fallbacks.play_button_secondary_color = '#6fb04e';
        fallbacks.control_bar_bg_color = 'transparent';
        break;
      case 'vjs-theme-sea':
        fallbacks.title_background_color = '#4176bc';
        fallbacks.play_button_secondary_color = '#4176bc';
        fallbacks.control_bar_bg_color = 'rgba(255, 255, 255, 0.4)';
        break;
      case 'kg-video-js-skin':
        fallbacks.title_background_color = '#000000';
        fallbacks.play_button_secondary_color = '#000000';
        fallbacks.control_bar_bg_color = '#000000';
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
/* harmony export */   getEffectiveValue: () => (/* binding */ getEffectiveValue)
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

  // 1. Check local attribute override
  if (attributes[attrKey] !== undefined && attributes[attrKey] !== null && attributes[attrKey] !== '') {
    return attributes[attrKey];
  }

  // 2. Check inherited context (from Collection or Video block)
  if (context[contextKey] !== undefined && context[contextKey] !== null && context[contextKey] !== '') {
    return context[contextKey];
  }

  // 3. Fallback to global plugin defaults
  const globalOptions = videopack_config?.options || {};
  const globalDefaults = videopack_config?.defaults || {};

  // Skin has special handling in some places, but we'll try to find it in options or defaults
  if (attrKey === 'skin') {
    return globalOptions.skin || globalDefaults.skin || 'vjs-theme-videopack';
  }
  return globalOptions[attrKey] ?? globalDefaults[attrKey];
};

/***/ },

/***/ "./src/blocks/collection/editor.scss"
/*!*******************************************!*\
  !*** ./src/blocks/collection/editor.scss ***!
  \*******************************************/
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

/***/ "./src/components/InspectorControls/CollectionSettingsPanel.scss"
/*!***********************************************************************!*\
  !*** ./src/components/InspectorControls/CollectionSettingsPanel.scss ***!
  \***********************************************************************/
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

/***/ "./src/blocks/collection/block.json"
/*!******************************************!*\
  !*** ./src/blocks/collection/block.json ***!
  \******************************************/
(module) {

module.exports = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"videopack/collection","title":"Videopack Collection","category":"media","icon":"grid-view","description":"A composable grid or list layout for displaying videos.","supports":{"html":false,"align":["left","right","center","wide","full"],"color":{"background":true,"text":true,"link":true},"spacing":{"margin":true,"padding":true,"blockGap":true}},"attributes":{"skin":{"type":"string"},"layout":{"type":"string","default":"grid"},"columns":{"type":"number","default":3},"gallery_source":{"type":"string","default":"current"},"gallery_id":{"type":"number","default":0},"gallery_category":{"type":"string","default":""},"gallery_tag":{"type":"string","default":""},"gallery_orderby":{"type":"string","default":"post_date"},"gallery_order":{"type":"string","default":"DESC"},"gallery_include":{"type":"string","default":""},"gallery_exclude":{"type":"string","default":""},"gallery_pagination":{"type":"boolean"},"gallery_per_page":{"type":"number"},"currentPage":{"type":"number","default":1},"totalPages":{"type":"number","default":1},"pagination_color":{"type":"string"},"pagination_background_color":{"type":"string"},"pagination_active_bg_color":{"type":"string"},"pagination_active_color":{"type":"string"},"title_color":{"type":"string"},"title_background_color":{"type":"string"},"play_button_color":{"type":"string"},"play_button_secondary_color":{"type":"string"},"control_bar_bg_color":{"type":"string"},"control_bar_color":{"type":"string"},"views":{"type":"boolean"},"overlay_title":{"type":"boolean"},"gallery_align":{"type":"string"},"enable_collection_video_limit":{"type":"boolean"},"collection_video_limit":{"type":"number"}},"providesContext":{"videopack/skin":"skin","videopack/layout":"layout","videopack/columns":"columns","videopack/gallery_source":"gallery_source","videopack/gallery_id":"gallery_id","videopack/gallery_category":"gallery_category","videopack/gallery_tag":"gallery_tag","videopack/gallery_orderby":"gallery_orderby","videopack/gallery_order":"gallery_order","videopack/gallery_include":"gallery_include","videopack/gallery_exclude":"gallery_exclude","videopack/gallery_pagination":"gallery_pagination","videopack/gallery_per_page":"gallery_per_page","videopack/enable_collection_video_limit":"enable_collection_video_limit","videopack/collection_video_limit":"collection_video_limit","videopack/currentPage":"currentPage","videopack/totalPages":"totalPages","videopack/pagination_color":"pagination_color","videopack/pagination_background_color":"pagination_background_color","videopack/pagination_active_bg_color":"pagination_active_bg_color","videopack/pagination_active_color":"pagination_active_color","videopack/title_color":"title_color","videopack/title_background_color":"title_background_color","videopack/play_button_color":"play_button_color","videopack/play_button_secondary_color":"play_button_secondary_color","videopack/control_bar_bg_color":"control_bar_bg_color","videopack/control_bar_color":"control_bar_color","videopack/views":"views","videopack/overlay_title":"overlay_title"},"textdomain":"video-embed-thumbnail-generator","editorScript":"file:./index.js","style":"file:./style.scss","editorStyle":"file:./index.css"}');

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
/*!****************************************!*\
  !*** ./src/blocks/collection/index.js ***!
  \****************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/blocks */ "@wordpress/blocks");
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _edit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./edit */ "./src/blocks/collection/edit.js");
/* harmony import */ var _save__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./save */ "./src/blocks/collection/save.js");
/* harmony import */ var _block_json__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./block.json */ "./src/blocks/collection/block.json");
/* harmony import */ var _assets_icon__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../assets/icon */ "./src/assets/icon.js");





(0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__.registerBlockType)(_block_json__WEBPACK_IMPORTED_MODULE_3__.name, {
  edit: _edit__WEBPACK_IMPORTED_MODULE_1__["default"],
  save: _save__WEBPACK_IMPORTED_MODULE_2__["default"]
});
(0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__.registerBlockVariation)(_block_json__WEBPACK_IMPORTED_MODULE_3__.name, [{
  name: 'gallery',
  title: 'Videopack Gallery',
  description: 'Display a modular grid of videos.',
  icon: 'format-video',
  attributes: {
    layout: 'grid'
  },
  scope: ['inserter', 'transform'],
  isActive: blockAttributes => blockAttributes.layout === 'grid'
}, {
  name: 'list',
  title: 'Videopack List',
  description: 'Display a modular list of videos with overlays.',
  icon: 'list-view',
  attributes: {
    layout: 'list'
  },
  scope: ['inserter', 'transform'],
  isActive: blockAttributes => blockAttributes.layout === 'list'
}]);
})();

/******/ })()
;
//# sourceMappingURL=index.js.map