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
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _editor_scss__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./editor.scss */ "./src/blocks/play-button/editor.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__);




/**
 * A internal component to display a play button with correct styling.
 * This can be reused in previews (e.g. video loops).
 */

function PlayButton({
  skin
}) {
  const config = typeof window !== 'undefined' ? window.videopack_config : undefined;
  const embed_method = typeof config !== 'undefined' ? config.embed_method : 'Video.js';
  if ('WordPress Default' === embed_method) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
      className: "videopack-play-button mejs-overlay mejs-layer mejs-overlay-play",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
        className: "mejs-overlay-button",
        role: "button",
        tabIndex: "0",
        "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Play', 'video-embed-thumbnail-generator'),
        "aria-pressed": "false",
        style: {
          width: '80px',
          height: '80px'
        }
      })
    });
  }
  if ('None' === embed_method) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
      className: "play-button-container videopack-none",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("svg", {
        className: "videopack-none-play-button",
        viewBox: "0 0 100 100",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("circle", {
          className: "play-button-circle",
          cx: "50",
          cy: "50",
          r: "45"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("polygon", {
          className: "play-button-triangle",
          points: "40,30 70,50 40,70"
        })]
      })
    });
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
    className: `play-button-container video-js ${skin} vjs-big-play-centered vjs-paused vjs-controls-enabled`,
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("button", {
      className: "vjs-big-play-button",
      type: "button",
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Play Video', 'video-embed-thumbnail-generator'),
      "aria-disabled": "false",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("span", {
        className: "vjs-icon-placeholder",
        "aria-hidden": "true"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("span", {
        className: "vjs-control-text",
        "aria-live": "polite",
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Play Video', 'video-embed-thumbnail-generator')
      })]
    })
  });
}
function Edit({
  context
}) {
  const skin = context?.['videopack/skin'] || '';
  const blockProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__.useBlockProps)({
    className: 'videopack-play-button-block'
  });
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
    ...blockProps,
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(PlayButton, {
      skin: skin
    })
  });
}

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
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__);



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
  postId,
  skin,
  children,
  resolvedDuotoneClass
}) {
  const {
    thumbnailMedia,
    posterUrl,
    isResolving
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.useSelect)(select => {
    const {
      getEntityRecord,
      getMedia
    } = select('core');

    // Fetch the attachment record for the video
    const attachment = getEntityRecord('postType', 'attachment', postId);
    const videopackMeta = attachment?.meta?.['_videopack-meta'] || {};

    // The thumbnail ID is stored in poster_id, and URL in poster
    const mediaId = videopackMeta.poster_id;
    const directPoster = videopackMeta.poster;
    return {
      thumbnailMedia: mediaId ? getMedia(mediaId) : null,
      posterUrl: directPoster,
      isResolving: select('core/data').isResolving('core', 'getEntityRecord', ['postType', 'attachment', postId])
    };
  }, [postId]);
  if (isResolving) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Spinner, {});
  }
  const config = typeof window !== 'undefined' ? window.videopack_config : undefined;
  const defaultNoThumb = config ? `${config.url}/src/images/nothumbnail.jpg` : '';

  // Priority: 1. Direct poster URL from meta, 2. WordPress media object, 3. Default "no thumbnail"
  const thumbnailUrl = posterUrl || thumbnailMedia?.source_url || defaultNoThumb;
  const containerClass = `gallery-thumbnail videopack-gallery-item wp-block wp-block-videopack-thumbnail ${skin || ''} ${resolvedDuotoneClass || ''}`.trim();
  const imgStyle = resolvedDuotoneClass ? {
    filter: `url(#${resolvedDuotoneClass})`
  } : {};
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
    className: containerClass,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("img", {
      src: thumbnailUrl,
      alt: thumbnailMedia?.alt_text || '',
      className: resolvedDuotoneClass || '',
      style: imgStyle
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
      className: "videopack-inner-blocks-container",
      children: children
    })]
  });
}

/***/ },

/***/ "./src/blocks/video-duration/edit.js"
/*!*******************************************!*\
  !*** ./src/blocks/video-duration/edit.js ***!
  \*******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   VideoDuration: () => (/* binding */ VideoDuration),
/* harmony export */   "default": () => (/* binding */ Edit)
/* harmony export */ });
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__);



/**
 * A internal component to display the video duration with correct formatting and data.
 * This can be reused in previews (e.g. video loops).
 */

function VideoDuration({
  postId
}) {
  const {
    duration,
    isResolving
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    if (!postId) {
      return {
        duration: null,
        isResolving: false
      };
    }
    const {
      getEntityRecord,
      isResolving: isResolvingSelector
    } = select('core');
    const record = getEntityRecord('postType', 'attachment', postId);
    return {
      duration: record?.meta?.['_videopack-meta']?.duration,
      isResolving: isResolvingSelector('getEntityRecord', ['postType', 'attachment', postId])
    };
  }, [postId]);
  if (isResolving) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__.Spinner, {});
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
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
    className: "videopack-video-duration",
    children: duration ? formatDuration(duration) : '0:00'
  });
}
function Edit({
  clientId,
  context
}) {
  const {
    postId
  } = context;
  const {
    isInsideThumbnail
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    const {
      getBlockName,
      getBlockRootClientId
    } = select('core/block-editor');
    const rootId = getBlockRootClientId(clientId);
    const parentName = rootId ? getBlockName(rootId) : null;
    return {
      isInsideThumbnail: parentName === 'videopack/thumbnail'
    };
  }, [clientId]);
  const blockProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__.useBlockProps)({
    className: `videopack-video-duration-block ${isInsideThumbnail ? 'is-inside-thumbnail' : ''}`
  });
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
    ...blockProps,
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(VideoDuration, {
      postId: postId
    })
  });
}

/***/ },

/***/ "./src/blocks/video-loop/edit.js"
/*!***************************************!*\
  !*** ./src/blocks/video-loop/edit.js ***!
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
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _hooks_useVideoQuery__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../hooks/useVideoQuery */ "./src/hooks/useVideoQuery.js");
/* harmony import */ var _thumbnail_VideoThumbnailPreview__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../thumbnail/VideoThumbnailPreview */ "./src/blocks/thumbnail/VideoThumbnailPreview.js");
/* harmony import */ var _video_title_edit__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../video-title/edit */ "./src/blocks/video-title/edit.js");
/* harmony import */ var _video_duration_edit__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../video-duration/edit */ "./src/blocks/video-duration/edit.js");
/* harmony import */ var _view_count_edit__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../view-count/edit */ "./src/blocks/view-count/edit.js");
/* harmony import */ var _play_button_edit__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../play-button/edit */ "./src/blocks/play-button/edit.js");
/* harmony import */ var _components_VideoPlayer_VideoPlayer_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../components/VideoPlayer/VideoPlayer.js */ "./src/components/VideoPlayer/VideoPlayer.js");
/* harmony import */ var _api_settings__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../api/settings */ "./src/api/settings.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_14__);














/**
 * Helper component to render a custom SVG duotone filter.
 *
 * @param {Object} root0        Props
 * @param {Array}  root0.colors Array of two hex colors
 * @param {string} root0.id     Filter ID
 * @return {Element|null} SVG element
 */


const CustomDuotoneFilter = ({
  colors,
  id
}) => {
  if (!colors || colors.length < 2) {
    return null;
  }
  const parseColor = color => {
    if (!color) {
      return {
        r: 0,
        g: 0,
        b: 0,
        a: 1
      };
    }

    // Handle Hex colors (#RGB, #RGBA, #RRGGBB, #RRGGBBAA)
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
      } else if (hex.length === 4) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
        a = parseInt(hex[3] + hex[3], 16);
      } else if (hex.length === 6) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
      } else if (hex.length === 8) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
        a = parseInt(hex.slice(6, 8), 16);
      }
      return {
        r: r / 255,
        g: g / 255,
        b: b / 255,
        a: a / 255
      };
    }

    // Handle RGB/RGBA strings
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
  const c1 = parseColor(colors[0]);
  const c2 = parseColor(colors[1]);
  const rValues = `${c1.r} ${c2.r}`;
  const gValues = `${c1.g} ${c2.g}`;
  const bValues = `${c1.b} ${c2.b}`;
  const aValues = `${c1.a} ${c2.a}`;
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)("svg", {
    style: {
      position: 'absolute',
      width: 0,
      height: 0,
      visibility: 'hidden'
    },
    "aria-hidden": "true",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsxs)("filter", {
      id: id,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)("feColorMatrix", {
        type: "matrix",
        values: ".299 .587 .114 0 0 .299 .587 .114 0 0 .299 .587 .114 0 0 .299 .587 .114 0 0"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsxs)("feComponentTransfer", {
        colorInterpolationFilters: "sRGB",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)("feFuncR", {
          type: "table",
          tableValues: rValues
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)("feFuncG", {
          type: "table",
          tableValues: gValues
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)("feFuncB", {
          type: "table",
          tableValues: bValues
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)("feFuncA", {
          type: "table",
          tableValues: aValues
        })]
      })]
    })
  });
};

/**
 * The Edit component for the Video Loop block.
 *
 * @param {Object} props          Component props.
 * @param {Object} props.context  Block context.
 * @param {string} props.clientId Block client ID.
 * @return {Element}              The rendered component.
 */
function Edit({
  context,
  clientId
}) {
  const [options, setOptions] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useState)({});
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useEffect)(() => {
    (0,_api_settings__WEBPACK_IMPORTED_MODULE_12__.getSettings)().then(response => {
      setOptions(response);
    });
  }, []);

  // We get query-related attributes from the parent collection block via context.
  const queryAttributes = {
    gallery_source: context['videopack/gallery_source'],
    gallery_id: context['videopack/gallery_id'],
    gallery_category: context['videopack/gallery_category'],
    gallery_tag: context['videopack/gallery_tag'],
    gallery_orderby: context['videopack/gallery_orderby'],
    gallery_order: context['videopack/gallery_order'],
    gallery_include: context['videopack/gallery_include'],
    gallery_exclude: context['videopack/gallery_exclude'],
    gallery_pagination: context['videopack/gallery_pagination'],
    gallery_per_page: context['videopack/gallery_per_page'] || 12,
    page_number: context['videopack/currentPage'] || 1
  };
  const {
    presetDuotoneClass,
    customDuotoneColors,
    thumbClientId,
    previewPostId
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    const {
      getBlocks
    } = select('core/block-editor');
    const blocks = getBlocks(clientId) || [];

    // Helper to find a block by name recursively in the inner blocks tree
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
    const thumb = findBlockRecursive(blocks, 'videopack/thumbnail');
    const duotone = thumb?.attributes?.style?.color?.duotone;
    let presetClass = '';
    let customColors = null;
    if (typeof duotone === 'string' && duotone.startsWith('var:preset|duotone|')) {
      presetClass = `wp-duotone-${duotone.split('|').pop()}`;
    } else if (Array.isArray(duotone)) {
      customColors = duotone;
    }
    return {
      presetDuotoneClass: presetClass,
      customDuotoneColors: customColors,
      thumbClientId: thumb?.clientId,
      previewPostId: select('core/editor').getCurrentPostId()
    };
  }, [clientId]);
  const templateBlocks = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => select('core/block-editor').getBlocks(clientId) || [], [clientId]);

  // Generate a stable ID for custom filters to prevent flickering.
  // We use the Thumbnail block's ID so it matches what the Thumbnail block expects locally.
  const customFilterId = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useMemo)(() => thumbClientId ? `videopack-custom-duotone-${thumbClientId.split('-')[0]}` : '', [thumbClientId]);

  // Final duotone class resolution
  const resolvedDuotoneClass = presetDuotoneClass || (customDuotoneColors ? customFilterId : '');

  // We fetch query data to power the live preview template
  const {
    videoResults,
    isResolving
  } = (0,_hooks_useVideoQuery__WEBPACK_IMPORTED_MODULE_5__["default"])(queryAttributes, previewPostId);
  const layout = context['videopack/layout'] || 'grid';
  const columns = context['videopack/columns'] || 3;
  const blockProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__.useBlockProps)({
    className: `videopack-video-loop layout-${layout} columns-${columns}`
  });

  /**
   * Helper to render a high-fidelity preview of the template blocks
   *
   * @param {Array}  previewBlocks Template blocks to render
   * @param {Object} video         Video data
   * @param {string} skinName      Selected skin
   * @return {Array}               The rendered blocks.
   */
  const renderBlockPreview = (previewBlocks, video, skinName) => {
    return previewBlocks.map(block => {
      const {
        name,
        attributes: blockAttrs,
        innerBlocks,
        clientId: blockClientId
      } = block;
      const itemKey = `${video.id}-${blockClientId}`;
      switch (name) {
        case 'videopack/thumbnail':
          return /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_14__.createElement)(_thumbnail_VideoThumbnailPreview__WEBPACK_IMPORTED_MODULE_6__.VideoThumbnailPreview, {
            ...blockAttrs,
            postId: video.attachment_id,
            skin: skinName,
            resolvedDuotoneClass: resolvedDuotoneClass,
            key: itemKey
          }, innerBlocks?.length > 0 && renderBlockPreview(innerBlocks, video, skinName));
        case 'videopack/video-title':
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)("div", {
            className: "videopack-video-title",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_video_title_edit__WEBPACK_IMPORTED_MODULE_7__.VideoTitle, {
              ...blockAttrs,
              postId: video.attachment_id,
              isInsideThumbnail: true
            })
          }, itemKey);
        case 'videopack/video-duration':
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)("div", {
            className: "videopack-video-duration",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_video_duration_edit__WEBPACK_IMPORTED_MODULE_8__.VideoDuration, {
              postId: video.attachment_id
            })
          }, itemKey);
        case 'videopack/view-count':
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)("div", {
            className: "videopack-view-count",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_view_count_edit__WEBPACK_IMPORTED_MODULE_9__.ViewCount, {
              ...blockAttrs,
              postId: video.attachment_id,
              count: video.player_vars?.starts
            })
          }, itemKey);
        case 'videopack/play-button':
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_play_button_edit__WEBPACK_IMPORTED_MODULE_10__.PlayButton, {
            skin: skinName
          }, itemKey);
        case 'videopack/videopack-video':
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)("div", {
            className: "videopack-video-preview",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_components_VideoPlayer_VideoPlayer_js__WEBPACK_IMPORTED_MODULE_11__["default"], {
              attributes: {
                ...options,
                ...blockAttrs,
                id: video.attachment_id,
                title: video.title,
                skin: skinName,
                sources: video.player_vars?.sources,
                poster: video.poster_url,
                starts: video.player_vars?.starts
              }
            })
          }, itemKey);
        default:
          return null;
      }
    });
  };
  const videos = videoResults || [];
  if (isResolving && videos.length === 0) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)("div", {
      ...blockProps,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)("div", {
        className: "videopack-collection-loading",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Spinner, {})
      })
    });
  }
  if (!isResolving && videos.length === 0) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)("div", {
      ...blockProps,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)("div", {
        className: "videopack-no-videos",
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('No videos found for this source.', 'video-embed-thumbnail-generator')
      })
    });
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsxs)("div", {
    ...blockProps,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(CustomDuotoneFilter, {
      colors: customDuotoneColors,
      id: customFilterId
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)("div", {
      className: "videopack-collection-grid",
      children: videos.map((video, index) => {
        const isEditableTemplate = index === 0;
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)("div", {
          className: `videopack-collection-item ${isEditableTemplate ? 'is-editable' : 'is-preview'}`,
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__.BlockContextProvider, {
            value: {
              postId: video.attachment_id,
              'videopack/skin': context['videopack/skin'],
              'videopack/title_color': context['videopack/title_color'],
              'videopack/title_background_color': context['videopack/title_background_color'],
              'videopack/play_button_color': context['videopack/play_button_color'],
              'videopack/play_button_icon_color': context['videopack/play_button_icon_color'],
              'videopack/control_bar_bg_color': context['videopack/control_bar_bg_color'],
              'videopack/control_bar_color': context['videopack/control_bar_color']
            },
            children: isEditableTemplate ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__.InnerBlocks, {
              templateLock: false,
              renderAppender: _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__.InnerBlocks.ButtonBlockAppender
            }) : renderBlockPreview(templateBlocks, video, context['videopack/skin'], options)
          })
        }, `${video.attachment_id || index}-${index}`);
      })
    })]
  });
}

/***/ },

/***/ "./src/blocks/video-loop/save.js"
/*!***************************************!*\
  !*** ./src/blocks/video-loop/save.js ***!
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

/***/ "./src/blocks/video-title/edit.js"
/*!****************************************!*\
  !*** ./src/blocks/video-title/edit.js ***!
  \****************************************/
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
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__);
/* global videopack_config */










/**
 * An internal component to display the video title with correct styling and data.
 *
 * @param {Object}   props                Component props.
 * @param {Object}   props.blockProps     Merged Gutenberg block props.
 * @param {number}   props.postId         Post ID.
 * @param {string}   props.title          Manual title override.
 * @param {string}   props.tagName        HTML tag name.
 * @param {string}   props.textAlign      Text alignment.
 * @param {boolean}  props.isOverlay      Whether in overlay mode.
 * @param {boolean}  props.downloadlink   Whether download is enabled.
 * @param {boolean}  props.embeddable     Whether sharing is enabled.
 * @param {string}   props.embedlink      Base embed link.
 * @param {boolean}  props.showTitle      Whether to show title text.
 * @param {boolean}  props.showBackground Whether to show bar background.
 * @param {Function} props.onTitleChange  Callback for title changes.
 * @param {Object}   props.barStyle       Styles for the inner title bar.
 *
 * @return {Object} The component.
 */

function VideoTitle({
  blockProps,
  postId,
  title: manualTitle,
  tagName: Tag = 'h3',
  textAlign,
  isOverlay,
  downloadlink,
  embeddable,
  embedlink,
  showTitle = true,
  showBackground = true,
  onTitleChange,
  barStyle = {} // New prop for inner bar styling
}) {
  const {
    attachmentTitle,
    isResolving
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_3__.useSelect)(select => {
    if (!postId) {
      return {
        attachmentTitle: '',
        isResolving: false
      };
    }
    const {
      getEntityRecord,
      isResolving: isResolvingSelector
    } = select('core');
    const record = getEntityRecord('postType', 'attachment', postId);
    return {
      attachmentTitle: record?.title?.rendered,
      isResolving: isResolvingSelector('getEntityRecord', ['postType', 'attachment', postId, 'edit', record?.id])
    };
  }, [postId]);
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
  const displayTitle = (0,_wordpress_html_entities__WEBPACK_IMPORTED_MODULE_5__.decodeEntities)(manualTitle || attachmentTitle || '');
  const finalTextAlign = textAlign || (isOverlay ? 'left' : undefined);
  let placeholder = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Video Title', 'video-embed-thumbnail-generator');
  if (postId) {
    placeholder = attachmentTitle ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('(Untitled Video)', 'video-embed-thumbnail-generator') : '';
  }
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
  const titleClass = isOverlay ? 'videopack-title' : 'videopack-video-title';
  const iconsClass = 'videopack-meta-icons';
  const finalBlockProps = blockProps || {
    className: `videopack-video-title-block ${isOverlay ? 'video-title is-overlay' : 'video-title'}`
  };
  if (isResolving) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)("div", {
      ...finalBlockProps,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Spinner, {})
    });
  }
  const barClass = `videopack-video-title${!showBackground && isOverlay ? ' has-no-background' : ''}`;
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)("div", {
    ...finalBlockProps,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)("button", {
      className: `videopack-click-trap${shareIsOpen ? ' is-visible' : ''}`,
      onClick: () => {
        setShareIsOpen(false);
      },
      "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Close share overlay', 'video-embed-thumbnail-generator')
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)("div", {
      className: barClass,
      style: barStyle,
      children: [showTitle && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.RichText, {
        tagName: Tag,
        className: titleClass,
        value: displayTitle,
        onChange: onTitleChange,
        style: {
          margin: 0,
          textAlign: finalTextAlign,
          fontSize: 'inherit',
          color: 'inherit'
        },
        placeholder: placeholder
      }), isOverlay && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)("div", {
        className: iconsClass,
        children: [embeddable && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)("button", {
          className: `videopack-icons ${shareIsOpen ? 'close' : 'share'}`,
          onClick: () => setShareIsOpen(!shareIsOpen),
          title: shareIsOpen ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Close', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Share', 'video-embed-thumbnail-generator'),
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Icon, {
            icon: shareIsOpen ? _wordpress_icons__WEBPACK_IMPORTED_MODULE_7__["default"] : _wordpress_icons__WEBPACK_IMPORTED_MODULE_10__["default"],
            className: "videopack-icon-svg"
          })
        }), downloadlink && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)("button", {
          className: "videopack-icons download",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Icon, {
            icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_9__["default"],
            className: "videopack-icon-svg"
          })
        })]
      })]
    }), isOverlay && embeddable && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)("div", {
      className: `videopack-share-container${shareIsOpen ? ' is-visible' : ''}`,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)("span", {
        className: "videopack-embedcode-container",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)("span", {
          className: "videopack-icons embed",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Icon, {
            icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_8__["default"],
            className: "videopack-icon-svg"
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)("span", {
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Embed:', 'video-embed-thumbnail-generator')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)("span", {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)("input", {
            className: "videopack-embed-code",
            type: "text",
            value: currentEmbedCode,
            onClick: e => e.target.select(),
            readOnly: true
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)("span", {
        className: "videopack-start-at-container",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)("input", {
          type: "checkbox",
          className: "videopack-start-at-enable",
          id: `videopack-start-at-enable-block-${randomId}`,
          checked: startAtEnabled,
          onChange: e => setStartAtEnabled(e.target.checked)
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)("label", {
          htmlFor: `videopack-start-at-enable-block-${randomId}`,
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Start at:', 'video-embed-thumbnail-generator')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)("input", {
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
  const {
    postId
  } = context;
  const embedlink = context['videopack/embedlink'];
  const {
    title,
    tagName: Tag = 'h3',
    position = 'top',
    textAlign,
    downloadlink,
    embeddable,
    title_color,
    title_background_color,
    showTitle = true,
    showBackground = true
  } = attributes;
  const {
    isInsideThumbnail,
    isInsidePlayer
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_3__.useSelect)(select => {
    const {
      getBlockName,
      getBlockRootClientId
    } = select('core/block-editor');
    const rootId = getBlockRootClientId(clientId);
    const parentName = rootId ? getBlockName(rootId) : null;
    return {
      isInsideThumbnail: parentName === 'videopack/thumbnail',
      isInsidePlayer: parentName === 'videopack/videopack-video' || parentName === 'videopack/video-player-engine' || !!context['videopack/skin']
    };
  }, [clientId, context]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (isInsidePlayer && position !== 'top') {
      setAttributes({
        position: 'top'
      });
    }
  }, [isInsidePlayer, position, setAttributes]);

  // Auto-initialize attributes based on plugin settings if this is a new block
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (!isInsidePlayer || !videopack_config?.options) {
      return;
    }
    const {
      options
    } = videopack_config;
    const newAttributes = {};

    // Only sync if they are currently at block.json defaults (indicating a fresh insert)
    if (attributes.downloadlink === false && !!options.downloadlink) {
      newAttributes.downloadlink = true;
    }
    if (attributes.embeddable === false && !!options.embedcode) {
      newAttributes.embeddable = true;
    }
    // If overlay_title is explicitly false in settings, and showTitle is still at default true
    if (attributes.showTitle === true && Object.prototype.hasOwnProperty.call(options, 'overlay_title') && !options.overlay_title) {
      newAttributes.showTitle = false;
    }
    if (Object.keys(newAttributes).length > 0) {
      setAttributes(newAttributes);
    }
  }, []); // Only run once on mount

  const isOverlay = isInsideThumbnail || isInsidePlayer;
  const wrapperClass = 'videopack-video-title-wrapper';
  const titleColorFallback = context['videopack/title_color'];
  const titleBackgroundColorFallback = context['videopack/title_background_color'];
  const THEME_COLORS = videopack_config?.themeColors;
  const colorFallbacks = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_utils_colors__WEBPACK_IMPORTED_MODULE_13__.getColorFallbacks)({
    title_color: titleColorFallback,
    title_background_color: titleBackgroundColorFallback
  }), [titleColorFallback, titleBackgroundColorFallback]);
  const skin = context['videopack/skin'] || 'default';
  const blockProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.useBlockProps)({
    className: `videopack-video-title-block ${wrapperClass} ${skin} ${isOverlay ? `is-overlay position-${position}` : ''} ${isInsideThumbnail ? 'is-inside-thumbnail' : ''} ${isInsidePlayer ? 'is-inside-player' : ''} ${!postId && !title ? 'no-title' : ''} ${title_background_color || titleBackgroundColorFallback ? 'videopack-has-title-background-color' : ''}`,
    style: {
      '--videopack-title-color': title_color || titleColorFallback || undefined,
      '--videopack-title-background-color': title_background_color || titleBackgroundColorFallback || undefined,
      visibility: isOverlay ? 'visible' : undefined,
      opacity: isOverlay ? 1 : undefined,
      zIndex: isOverlay ? 110 : undefined,
      top: isOverlay && position === 'top' ? 0 : undefined,
      bottom: isOverlay && position === 'bottom' ? 0 : undefined,
      pointerEvents: isOverlay ? 'auto' : undefined
    }
  });
  const barStyle = {
    '--videopack-title-text-align': textAlign,
    textAlign,
    zIndex: 102,
    // Explicitly higher than Share Overlay (101)
    position: 'relative'
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.BlockControls, {
      group: "block",
      children: [!isInsideThumbnail && !isInsidePlayer && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.HeadingLevelDropdown, {
        value: Tag.replace('h', '') * 1,
        onChange: newLevel => setAttributes({
          tagName: `h${newLevel}`
        })
      }), isInsideThumbnail && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.BlockVerticalAlignmentControl, {
        value: position,
        onChange: nextPosition => {
          setAttributes({
            position: nextPosition || 'bottom'
          });
        }
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.AlignmentControl, {
        value: textAlign,
        onChange: nextAlign => {
          setAttributes({
            textAlign: nextAlign
          });
        }
      }), isInsidePlayer && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarGroup, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarButton, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_11__["default"],
          label: showTitle ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Hide Title', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Show Title', 'video-embed-thumbnail-generator'),
          isPressed: showTitle,
          onClick: () => setAttributes({
            showTitle: !showTitle
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarButton, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_10__["default"],
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Embed/Share Button', 'video-embed-thumbnail-generator'),
          isPressed: embeddable,
          onClick: () => setAttributes({
            embeddable: !embeddable
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarButton, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_9__["default"],
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Download Button', 'video-embed-thumbnail-generator'),
          isPressed: downloadlink,
          onClick: () => setAttributes({
            downloadlink: !downloadlink
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarButton, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_6__["default"],
          label: showBackground ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Hide Background Bar', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Show Background Bar', 'video-embed-thumbnail-generator'),
          isPressed: showBackground,
          onClick: () => setAttributes({
            showBackground: !showBackground
          })
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.InspectorControls, {
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Videopack: Design', 'video-embed-thumbnail-generator'),
        initialOpen: true,
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)("div", {
          className: "videopack-color-section",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)("p", {
            className: "videopack-settings-section-title",
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Title Bar', 'video-embed-thumbnail-generator')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)("div", {
            className: "videopack-color-flex-row",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_12__["default"], {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Text', 'video-embed-thumbnail-generator'),
                value: title_color,
                onChange: value => setAttributes({
                  title_color: value
                }),
                colors: THEME_COLORS,
                fallbackValue: colorFallbacks.title_color
              })
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_12__["default"], {
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
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(VideoTitle, {
      blockProps: blockProps,
      postId: postId,
      title: title,
      tagName: Tag,
      textAlign: textAlign,
      isOverlay: isOverlay,
      downloadlink: downloadlink,
      embeddable: embeddable,
      embedlink: embedlink,
      showTitle: showTitle,
      showBackground: showBackground,
      onTitleChange: value => setAttributes({
        title: value
      }),
      barStyle: barStyle
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
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__);
/* global videopack_config */










/**
 * A internal component to display the view count with correct styling and data.
 * This can be reused in previews (e.g. video loops).
 *
 * @param {Object}  props              Component props.
 * @param {Object}  props.blockProps   Merged Gutenberg block props.
 * @param {string}  props.iconType     The type of icon to display.
 * @param {boolean} props.showText     Whether to show the "views" text.
 * @param {number}  props.postId       The ID of the attachment to fetch meta for.
 * @param {number}  [props.count]      Optional pre-fetched count to display.
 */

function ViewCount({
  blockProps,
  iconType,
  showText,
  postId,
  count
}) {
  const {
    viewCount,
    isResolving
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_2__.useSelect)(select => {
    if (!postId || count !== undefined) {
      return {
        viewCount: count || 0,
        isResolving: false
      };
    }
    const {
      getEntityRecord,
      isResolving: isResolvingSelector
    } = select('core');
    const media = getEntityRecord('postType', 'attachment', postId);
    return {
      viewCount: media?.meta?.['_videopack-meta']?.starts,
      isResolving: isResolvingSelector('getEntityRecord', ['postType', 'attachment', postId, 'starts' // specifically for the meta key
      ])
    };
  }, [postId, count]);
  if (isResolving) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("div", {
      ...blockProps,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Spinner, {})
    });
  }
  const safeViewCount = viewCount !== undefined && viewCount !== null ? Number(viewCount) : 0;
  const displayValue = showText ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.sprintf)(/* translators: %s is the formatted number of views */
  (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__._n)('%s view', '%s views', safeViewCount, 'video-embed-thumbnail-generator'), safeViewCount.toLocaleString()) : safeViewCount.toLocaleString();
  const renderIcon = () => {
    switch (iconType) {
      case 'eye':
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Icon, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_6__["default"],
          style: {
            marginRight: '4px'
          }
        });
      case 'play':
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Icon, {
          icon: _assets_icon__WEBPACK_IMPORTED_MODULE_8__.play,
          size: 16,
          style: {
            marginRight: '4px'
          }
        });
      case 'playOutline':
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Icon, {
          icon: _assets_icon__WEBPACK_IMPORTED_MODULE_8__.playOutline,
          size: 16,
          style: {
            marginRight: '4px'
          }
        });
      default:
        return null;
    }
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("div", {
    ...blockProps,
    children: [renderIcon(), displayValue]
  });
}
function Edit({
  clientId,
  attributes,
  setAttributes,
  context
}) {
  const {
    postId
  } = context;
  const {
    iconType,
    showText,
    textAlign,
    title_color,
    title_background_color
  } = attributes;
  const {
    isInsidePlayer
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_2__.useSelect)(select => {
    const {
      getBlockName,
      getBlockRootClientId
    } = select('core/block-editor');
    const rootId = getBlockRootClientId(clientId);
    const parentName = rootId ? getBlockName(rootId) : null;
    return {
      isInsidePlayer: parentName === 'videopack/videopack-video'
    };
  }, [clientId]);
  const titleColorFallback = context['videopack/title_color'];
  const titleBackgroundColorFallback = context['videopack/title_background_color'];
  const THEME_COLORS = videopack_config?.themeColors;
  const colorFallbacks = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_utils_colors__WEBPACK_IMPORTED_MODULE_10__.getColorFallbacks)({
    title_color: titleColorFallback,
    title_background_color: titleBackgroundColorFallback
  }), [titleColorFallback, titleBackgroundColorFallback]);
  const finalTextAlign = textAlign || (isInsidePlayer ? 'right' : undefined);
  let justifyContent = 'flex-start';
  if (finalTextAlign === 'center') {
    justifyContent = 'center';
  } else if (finalTextAlign === 'right') {
    justifyContent = 'flex-end';
  }
  const blockProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.useBlockProps)({
    className: 'videopack-view-count-block',
    style: {
      display: 'flex',
      alignItems: 'center',
      textAlign: finalTextAlign,
      '--videopack-title-color': title_color || titleColorFallback || undefined,
      '--videopack-title-background-color': title_background_color || titleBackgroundColorFallback || undefined,
      justifyContent,
      flexGrow: 1
    }
  });
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.BlockControls, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.AlignmentControl, {
        value: textAlign,
        onChange: nextAlign => {
          setAttributes({
            textAlign: nextAlign
          });
        }
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToolbarGroup, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Icon Type', 'video-embed-thumbnail-generator'),
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToolbarButton, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_5__["default"],
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('No Icon', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            iconType: 'none'
          }),
          isPressed: iconType === 'none'
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToolbarButton, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_6__["default"],
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Eye Icon', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            iconType: 'eye'
          }),
          isPressed: iconType === 'eye'
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToolbarButton, {
          icon: _assets_icon__WEBPACK_IMPORTED_MODULE_8__.play,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Play Icon (Filled)', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            iconType: 'play'
          }),
          isPressed: iconType === 'play'
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToolbarButton, {
          icon: _assets_icon__WEBPACK_IMPORTED_MODULE_8__.playOutline,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Play Icon (Outline)', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            iconType: 'playOutline'
          }),
          isPressed: iconType === 'playOutline'
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToolbarGroup, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Display Options', 'video-embed-thumbnail-generator'),
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToolbarButton, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_4__["default"],
          label: showText ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Hide "views" text', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Show "views" text', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            showText: !showText
          }),
          isPressed: showText
        })
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.InspectorControls, {
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Videopack: Design', 'video-embed-thumbnail-generator'),
        initialOpen: true,
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("div", {
          className: "videopack-color-section",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("p", {
            className: "videopack-settings-section-title",
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Colors', 'video-embed-thumbnail-generator')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("div", {
            className: "videopack-color-flex-row",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_9__["default"], {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Text', 'video-embed-thumbnail-generator'),
                value: title_color,
                onChange: value => setAttributes({
                  title_color: value
                }),
                colors: THEME_COLORS,
                fallbackValue: colorFallbacks.title_color
              })
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_9__["default"], {
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
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(ViewCount, {
      blockProps: blockProps,
      iconType: iconType,
      showText: showText,
      postId: postId
    })]
  });
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
  sources,
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
          console.warn('Video.js plugin update error:', e);
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
        const videoElement = document.createElement('video');
        videoElement.className = `video-js ${skin || ''} vjs-big-play-centered`;
        videoElement.setAttribute('playsinline', '');
        videoRef.current.appendChild(videoElement);
        playerRef.current = videojs(videoElement, options, function () {
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
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/download.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/heading.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/share.mjs");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _wordpress_html_entities__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @wordpress/html-entities */ "@wordpress/html-entities");
/* harmony import */ var _wordpress_html_entities__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_wordpress_html_entities__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @wordpress/hooks */ "@wordpress/hooks");
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _GenericPlayer_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./GenericPlayer.js */ "./src/components/VideoPlayer/GenericPlayer.js");
/* harmony import */ var _VideoJs_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./VideoJs.js */ "./src/components/VideoPlayer/VideoJs.js");
/* harmony import */ var _WpMejsPlayer_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./WpMejsPlayer.js */ "./src/components/VideoPlayer/WpMejsPlayer.js");
/* harmony import */ var _VideoPlayer_scss__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./VideoPlayer.scss */ "./src/components/VideoPlayer/VideoPlayer.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__);
/**
 * Main VideoPlayer component that orchestrates different player engines and UI overlays.
 */










const DEFAULT_PLAYERS = {
  'Video.js': _VideoJs_js__WEBPACK_IMPORTED_MODULE_9__["default"],
  'WordPress Default': _WpMejsPlayer_js__WEBPACK_IMPORTED_MODULE_10__["default"],
  None: _GenericPlayer_js__WEBPACK_IMPORTED_MODULE_8__["default"]
};


// Make sure to pass isSelected from the block's edit component.

const noop = () => {};

/**
 * VideoPlayer component.
 *
 * @param {Object}   props               Component props.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Function to update block attributes.
 * @param {boolean}  props.isSelected    Whether the block is selected.
 * @param {boolean}  props.hideStaticOverlays Whether to hide site-wide static overlays (watermark, title).
 * @param {Function} props.onReady       Callback fired when the player engine is ready.
 * @param {Object}   props.children      Child components (InnerBlocks).
 * @return {Element|null} The rendered component.
 */
const VideoPlayer = ({
  attributes,
  setAttributes = noop,
  onReady = noop,
  isSelected = false,
  hideStaticOverlays = false,
  children
}) => {
  const [detectedDimensions, setDetectedDimensions] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)({
    width: null,
    height: null,
    src: null // Track which src these dimensions are for
  });

  // Reset dimensions when src changes
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    const {
      src
    } = attributes || {};
    if (src !== detectedDimensions.src) {
      setDetectedDimensions({
        width: null,
        height: null,
        src
      });
    }
  }, [attributes, detectedDimensions.src]);
  const onMetadataLoaded = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(dimensions => {
    if (dimensions.width === detectedDimensions.width && dimensions.height === detectedDimensions.height && attributes.src === detectedDimensions.src) {
      return;
    }
    setDetectedDimensions({
      ...dimensions,
      src: attributes.src
    });
  }, [detectedDimensions, attributes.src, setDetectedDimensions]);
  const decodedAttributes = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => ({
    ...attributes,
    title: attributes.title ? (0,_wordpress_html_entities__WEBPACK_IMPORTED_MODULE_6__.decodeEntities)(attributes.title) : attributes.title
  }), [attributes]);
  const {
    embed_method,
    autoplay,
    controls = true,
    skin,
    loop,
    muted,
    playsinline,
    poster,
    preload,
    src,
    volume,
    auto_res,
    auto_codec,
    sources = [],
    source_groups = {},
    text_tracks = [],
    playback_rate,
    watermark,
    watermark_styles,
    watermark_link_to,
    default_ratio,
    play_button_color,
    play_button_icon_color,
    control_bar_bg_color,
    control_bar_color,
    title_color,
    title_background_color,
    overlay_title,
    embeddable,
    downloadlink
  } = decodedAttributes;
  const players = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_7__.applyFilters)('videopack_admin_players', DEFAULT_PLAYERS), []);
  const isVertical = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    let vertical = false;
    // Use browser-detected dimensions if available
    if (detectedDimensions.width && detectedDimensions.height) {
      vertical = detectedDimensions.height > detectedDimensions.width;
    } else {
      // Fallback to database metadata
      vertical = Number(decodedAttributes.height) > Number(decodedAttributes.width) || [90, 270].includes(Number(decodedAttributes.rotate));
    }
    return vertical;
  }, [detectedDimensions.width, detectedDimensions.height, decodedAttributes.width, decodedAttributes.height, decodedAttributes.rotate]);
  const isFixedAspect = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    const verticalFixed = decodedAttributes.fixed_aspect === 'vertical' && isVertical;
    const alwaysFixed = decodedAttributes.fixed_aspect === 'always';
    return (alwaysFixed || verticalFixed) && (decodedAttributes.fullwidth !== true || verticalFixed);
  }, [decodedAttributes.fixed_aspect, decodedAttributes.fullwidth, isVertical]);
  const aspectRatio = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    let ratio;
    if (isFixedAspect) {
      ratio = (default_ratio || '16 / 9').replace(/\s\/\s/g, ':');
    } else if (detectedDimensions.width && detectedDimensions.height) {
      // If we have browser-detected dimensions and they aren't forced to fixed, use them
      ratio = `${detectedDimensions.width}:${detectedDimensions.height}`;
    } else if (decodedAttributes.width && decodedAttributes.height) {
      ratio = `${decodedAttributes.width}:${decodedAttributes.height}`;
    }
    return ratio;
  }, [isFixedAspect, default_ratio, detectedDimensions.width, detectedDimensions.height, decodedAttributes.width, decodedAttributes.height]);
  const playerStyles = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    const styles = {};
    const config = window.videopack_config || {};
    if (config.mejs_controls_svg) {
      styles['--videopack-mejs-controls-svg'] = `url(${config.mejs_controls_svg})`;
    }
    if (play_button_color) {
      styles['--videopack-play-button-color'] = play_button_color;
    }
    if (play_button_icon_color) {
      styles['--videopack-play-button-icon-color'] = play_button_icon_color;
    }
    if (control_bar_bg_color) {
      styles['--videopack-control-bar-bg-color'] = control_bar_bg_color;
    }
    if (control_bar_color) {
      styles['--videopack-control-bar-color'] = control_bar_color;
    }
    if (title_color) {
      styles['--videopack-title-color'] = title_color;
    }
    if (title_background_color) {
      styles['--videopack-title-background-color'] = title_background_color;
    }
    return styles;
  }, [play_button_color, play_button_icon_color, control_bar_bg_color, control_bar_color, title_color, title_background_color]);
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
  const wrapperClasses = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    const classes = ['videopack-wrapper', 'videopack-video-title-visible'];
    if (isFixedAspect || aspectRatio) {
      classes.push('videopack-has-aspect-ratio');
      if (isFixedAspect) {
        classes.push('videopack-is-fixed-aspect');
      }
    }
    if (play_button_color) {
      classes.push('videopack-has-play-button-color');
    }
    if (play_button_icon_color) {
      classes.push('videopack-has-play-button-icon-color');
    }
    if (control_bar_bg_color) {
      classes.push('videopack-has-control-bar-bg-color');
    }
    if (control_bar_color) {
      classes.push('videopack-has-control-bar-color');
    }
    if (title_color) {
      classes.push('videopack-has-title-color');
    }
    if (title_background_color) {
      classes.push('videopack-has-title-background-color');
    }
    return classes.join(' ');
  }, [play_button_color, play_button_icon_color, control_bar_bg_color, control_bar_color, title_color, title_background_color, isFixedAspect, aspectRatio]);
  const actualAutoplay = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    return autoplay;
  }, [autoplay]);
  const videoRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const playerInstanceRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const wrapperRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const allSources = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    if (Object.keys(source_groups).length > 0) {
      return Object.values(source_groups).flatMap(group => group.sources);
    }
    return sources;
  }, [sources, source_groups]);
  const finalizedSources = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    if (allSources && allSources.length > 0) {
      return allSources;
    }
    if (src) {
      return [{
        src,
        type: 'video/mp4'
      }]; // Basic fallback
    }
    return [];
  }, [allSources, src]);
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
    autoPlay: embed_method === 'WordPress Default' ? false : actualAutoplay
  }), [poster, loop, actualAutoplay, preload, controls, muted, volume, playsinline, src, finalizedSources, text_tracks, embed_method] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const videoJsOptions = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    const isVjs = (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_7__.applyFilters)('videopack_is_videojs_player', embed_method === 'Video.js', embed_method);
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
    const hasResolutions = finalizedSources.some(s => s.resolution);
    if (hasResolutions) {
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
  }, [embed_method, actualAutoplay, controls, muted, preload, poster, loop, playback_rate, playsinline, volume, auto_res, auto_codec, finalizedSources, source_groups, text_tracks, aspectRatio]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePlay = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    if (wrapperRef.current) {
      wrapperRef.current.classList.remove('videopack-video-title-visible');
    }
  }, []);
  const handlePause = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    if (wrapperRef.current) {
      wrapperRef.current.classList.add('videopack-video-title-visible');
    }
  }, []);
  const onReadyRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(onReady);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    onReadyRef.current = onReady;
  }, [onReady]);
  const handleVideoPlayerReady = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(player => {
    playerInstanceRef.current = player;
    player.on('loadedmetadata', () => {
      if (onReadyRef.current) {
        if (embed_method === 'Video.js') {
          onReadyRef.current(player.el().firstChild);
        } else {
          onReadyRef.current(player);
        }
      }
      if (actualAutoplay) {
        handlePlay();
      }
    });
  }, [embed_method, actualAutoplay, handlePlay]);
  const handleMejsReady = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(player => {
    playerInstanceRef.current = player;
    if (onReadyRef.current) {
      onReadyRef.current(player);
    }
  }, []);
  const renderReady = src || finalizedSources && finalizedSources.length > 0;
  if (!renderReady) {
    return null; // Or a loading spinner
  }
  const getWatermarkStyle = () => {
    const defaults = {
      scale: 10,
      align: 'right',
      valign: 'bottom',
      x: 5,
      y: 7
    };
    const styles = {
      ...defaults,
      ...watermark_styles
    };

    // Check if styles differ from defaults
    if (Number(styles.scale) === defaults.scale && styles.align === defaults.align && styles.valign === defaults.valign && Number(styles.x) === defaults.x && Number(styles.y) === defaults.y) {
      return null;
    }
    const css = {
      maxWidth: `${styles.scale}%`,
      width: '100%',
      height: 'auto',
      position: 'absolute'
    };
    const x = styles.x || 0;
    const y = styles.y || 0;
    if (styles.align === 'left') {
      css.left = `${x}%`;
    } else if (styles.align === 'right') {
      css.right = `${x}%`;
    } else {
      css.left = '50%';
      css.transform = 'translateX(-50%)';
      css.marginLeft = `${-x}%`;
    }
    if (styles.valign === 'top') {
      css.top = `${y}%`;
    } else if (styles.valign === 'bottom') {
      css.bottom = `${y}%`;
    } else {
      css.top = '50%';
      css.transform = css.transform ? 'translate(-50%, -50%)' : 'translateY(-50%)';
      css.marginTop = `${-y}%`;
    }
    return css;
  };
  const watermarkStyle = getWatermarkStyle();
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
    className: wrapperClasses,
    ref: wrapperRef,
    style: playerStyles,
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("div", {
      className: `videopack-player ${skin || ''}`,
      style: {
        ...innerPlayerStyles,
        position: 'relative'
      },
      children: [(() => {
        const PlayerComponent = players[embed_method] || players.None;
        if (embed_method === 'Video.js' && videoJsOptions) {
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(PlayerComponent, {
            options: videoJsOptions,
            skin: skin,
            onPlay: handlePlay,
            onPause: handlePause,
            onReady: handleVideoPlayerReady,
            onMetadataLoaded: onMetadataLoaded
          }, `videojs-${src}`);
        }
        if (embed_method === 'WordPress Default') {
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(PlayerComponent, {
            options: genericPlayerOptions,
            controls: controls,
            actualAutoplay: actualAutoplay,
            onReady: handleMejsReady,
            onPlay: handlePlay,
            playback_rate: playback_rate,
            aspectRatio: aspectRatio,
            onMetadataLoaded: onMetadataLoaded
          }, `wpvideo-${src}`);
        }
        if (embed_method === 'None') {
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(PlayerComponent, {
            ...genericPlayerOptions,
            ref: videoRef
          });
        }

        // Fallback for custom players
        if (PlayerComponent === _GenericPlayer_js__WEBPACK_IMPORTED_MODULE_8__["default"]) {
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.Fragment, {
            children: [!isSelected && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.Fragment, {
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.ToolbarButton, {
                icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_3__["default"],
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Toggle Title Overlay', 'video-embed-thumbnail-generator'),
                isPressed: overlay_title,
                onClick: () => setAttributes({
                  overlay_title: !overlay_title
                })
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.ToolbarButton, {
                icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_4__["default"],
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Toggle Share Button', 'video-embed-thumbnail-generator'),
                isPressed: embeddable,
                onClick: () => setAttributes({
                  embeddable: !embeddable
                })
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.ToolbarButton, {
                icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_2__["default"],
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Toggle Download Button', 'video-embed-thumbnail-generator'),
                isPressed: downloadlink,
                onClick: () => setAttributes({
                  downloadlink: !downloadlink
                })
              })]
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(PlayerComponent, {
              ...genericPlayerOptions,
              ref: videoRef
            }, `${embed_method}-fallback-${src}`)]
          });
        }
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(PlayerComponent, {
          options: videoJsOptions || genericPlayerOptions,
          skin: skin,
          attributes: decodedAttributes,
          onPlay: handlePlay,
          onPause: handlePause,
          onReady: handleVideoPlayerReady,
          onMetadataLoaded: onMetadataLoaded
        }, `${embed_method}-${src}`);
      })(), !hideStaticOverlays && watermark && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
        className: "videopack-watermark",
        children: watermark_link_to && watermark_link_to !== 'false' && watermark_link_to !== 'None' ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("a", {
          href: "#videopack-watermark-link",
          className: "videopack-watermark-link",
          onClick: e => e.preventDefault(),
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("img", {
            src: watermark,
            alt: "watermark",
            style: watermarkStyle
          })
        }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("img", {
          src: watermark,
          alt: "watermark",
          style: watermarkStyle
        })
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
    aspectRatio
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
          ...mejsSettings
        };

        // Ensure features is an array to avoid MEJS crashes in setResponsiveMode.
        if (!mejsOptions.features || !Array.isArray(mejsOptions.features)) {
          mejsOptions.features = ['playpause', 'progress', 'current', 'duration', 'tracks', 'volume', 'fullscreen'];
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
    page_number = 1
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
    const args = {
      gallery_orderby,
      gallery_order,
      gallery_per_page: gallery_pagination ? parseInt(gallery_per_page, 10) || 12 : 100,
      page_number: parseInt(page_number, 10) || 1,
      gallery_id,
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
      const query = {
        include: [gallery_id],
        per_page: 1
      };
      searchableTypes.forEach(type => {
        const records = getEntityRecords('postType', type, query);
        if (records && records.length > 0) {
          current = records[0];
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
    isResolving: isResolvingVideos || isResolvingSearch,
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

/***/ "./src/blocks/play-button/editor.scss"
/*!********************************************!*\
  !*** ./src/blocks/play-button/editor.scss ***!
  \********************************************/
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

/***/ "./src/components/VideoPlayer/VideoPlayer.scss"
/*!*****************************************************!*\
  !*** ./src/components/VideoPlayer/VideoPlayer.scss ***!
  \*****************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "react"
/*!************************!*\
  !*** external "React" ***!
  \************************/
(module) {

module.exports = window["React"];

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

/***/ "./node_modules/@wordpress/icons/build-module/library/heading.mjs"
/*!************************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/heading.mjs ***!
  \************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ heading_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/heading.tsx


var heading_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M6 5V18.5911L12 13.8473L18 18.5911V5H6Z" }) });

//# sourceMappingURL=heading.mjs.map


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

/***/ "./src/blocks/video-loop/block.json"
/*!******************************************!*\
  !*** ./src/blocks/video-loop/block.json ***!
  \******************************************/
(module) {

module.exports = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"videopack/video-loop","version":"0.1.0","title":"Video Loop","category":"theme","parent":["videopack/collection"],"description":"Video loop template.","supports":{"html":false,"reusable":false,"inserter":false},"usesContext":["postId","videopack/skin","videopack/layout","videopack/columns","videopack/gallery_source","videopack/gallery_id","videopack/gallery_category","videopack/gallery_tag","videopack/gallery_orderby","videopack/gallery_order","videopack/gallery_include","videopack/gallery_exclude","videopack/gallery_pagination","videopack/gallery_per_page","videopack/currentPage","videopack/totalPages","videopack/title_color","videopack/title_background_color","videopack/play_button_color","videopack/play_button_icon_color","videopack/control_bar_bg_color","videopack/control_bar_color"],"textdomain":"video-embed-thumbnail-generator","editorScript":"file:./index.js"}');

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
  !*** ./src/blocks/video-loop/index.js ***!
  \****************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/blocks */ "@wordpress/blocks");
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _block_json__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./block.json */ "./src/blocks/video-loop/block.json");
/* harmony import */ var _edit__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./edit */ "./src/blocks/video-loop/edit.js");
/* harmony import */ var _save__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./save */ "./src/blocks/video-loop/save.js");




(0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__.registerBlockType)(_block_json__WEBPACK_IMPORTED_MODULE_1__.name, {
  ..._block_json__WEBPACK_IMPORTED_MODULE_1__,
  edit: _edit__WEBPACK_IMPORTED_MODULE_2__["default"],
  save: _save__WEBPACK_IMPORTED_MODULE_3__["default"]
});
})();

/******/ })()
;
//# sourceMappingURL=index.js.map