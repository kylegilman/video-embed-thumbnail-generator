/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 533
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EA: () => (/* binding */ getVideoFormats),
/* harmony export */   M5: () => (/* binding */ getVideoGallery)
/* harmony export */ });
/* unused harmony exports getPresets, getVideoSources, getUsersWithCapability, getFreemiusPage, testEncodeCommand */
/* unused harmony import specifier */ var apiFetch;
/* unused harmony import specifier */ var addQueryArgs;
/* unused harmony import specifier */ var applyFilters;
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(455);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_url__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(832);
/* harmony import */ var _wordpress_url__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_url__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(619);
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
    return await apiFetch({
      path: addQueryArgs('/videopack/v1/sources', query),
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
    return await apiFetch({
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
    return await apiFetch({
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
  /**
   * Filters the FFmpeg test command test response. Bypasses the REST API call if a non-undefined value is returned.
   *
   * @since 5.0.0
   *
   * @param {undefined} pre        Defaults to undefined.
   * @param {string}    codec      The codec to test.
   * @param {string}    resolution Resolution to test.
   * @param {number}    rotate     Rotation angle.
   */
  const pre = applyFilters('videopack.utils.pre_testEncodeCommand', undefined, codec, resolution, rotate);
  if (typeof pre !== 'undefined') {
    return pre;
  }
  try {
    return await apiFetch({
      path: `/videopack/v1/ffmpeg-test/?codec=${codec}&resolution=${resolution}&rotate=${rotate}`
    });
  } catch (error) {
    console.error('Error testing encode command:', error);
    throw error;
  }
};

/***/ },

/***/ 427
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   pause: () => (/* binding */ pause),
/* harmony export */   play: () => (/* binding */ play),
/* harmony export */   playOutline: () => (/* binding */ playOutline),
/* harmony export */   sortAscending: () => (/* binding */ sortAscending),
/* harmony export */   sortDescending: () => (/* binding */ sortDescending),
/* harmony export */   volumeDown: () => (/* binding */ volumeDown),
/* harmony export */   volumeUp: () => (/* binding */ volumeUp)
/* harmony export */ });
/* unused harmony exports insertImage, save, shareAlt1, shareAlt2, shareAlt3, videopack, videopackCaption, videopackCollection, videopackDuration, videopackGallery, videopackList, videopackLoop, videopackPagination, videopackPlayButton, videopackPlayer, videopackThumbnail, videopackTitle, videopackVideo, videopackViewCount, videopackWatermark, download, share, close, embed, copyLink, bluesky, threads, facebook, reddit, email */
/* harmony import */ var _src_icons_json__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(125);
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
const videopackCaption = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    d: "M43.63 341.01c-12.65 0-23-9.2-23-22.61v-.77c0-13.03 9.97-22.61 23-22.61s23.38 9.2 23.38 22.61v.77c0 13.42-9.97 22.61-23.38 22.61m69.37 0c-12.65 0-23-9.2-23-22.61v-.77c0-13.03 9.97-22.61 23-22.61s23.38 9.2 23.38 22.61v.77c0 13.42-9.97 22.61-23.38 22.61m69.37 0c-12.65 0-23-9.2-23-22.61v-.77c0-13.03 9.97-22.61 23-22.61s23.38 9.2 23.38 22.61v.77c0 13.42-9.97 22.61-23.38 22.61",
    style: {
      fill: '#cd0000'
    }
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("circle", {
    cx: 198.31,
    cy: 159.72,
    r: 69.82,
    style: {
      fill: '#fff'
    }
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("circle", {
    cx: 198.31,
    cy: 159.72,
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
    d: "M169.53 198.78v-17.51l37.74-21.96-37.74-21.26v-18.16l68.27 39.45-67.74 39.44"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m169.53 138.05 37.74 21.26-37.74 21.96"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 19
    },
    d: "M14.4 55.65h372.22V264.9H14.4z"
  })]
});
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
const videopackDuration = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    d: "m67.87 129.5-8.65 32.21h26.11l8.65-32.21h15.26l-8.65 32.21h17.29v12.71H97.2L90.59 199h18.99v12.71H87.2l-8.31 31.36H63.63l8.31-31.36H45.83l-8.31 31.36H22.26l8.31-31.36H12.43V199h21.53l6.61-24.58H20.74v-12.71h23.22l8.65-32.21zm-18.65 69.51h26.11l6.61-24.58H55.83zm94.08-5.09c-5.59 0-10.17-4.07-10.17-10v-.34c0-5.76 4.41-10 10.17-10s10.34 4.07 10.34 10v.34c0 5.93-4.41 10-10.34 10m0 50.86c-5.59 0-10.17-4.07-10.17-10v-.34c0-5.76 4.41-10 10.17-10s10.34 4.07 10.34 10v.34c0 5.93-4.41 10-10.34 10m81.03-115.28-8.65 32.21h26.11l8.65-32.21h15.26l-8.65 32.21h17.29v12.71h-20.68L247.05 199h18.99v12.71h-22.38l-8.31 31.36h-15.26l8.31-31.36h-26.11l-8.31 31.36h-15.26l8.31-31.36h-18.14V199h21.53l6.61-24.58H177.2v-12.71h23.22l8.65-32.21zm-18.65 69.51h26.11l6.61-24.58h-26.11zm135.96-69.51-8.65 32.21h26.11l8.65-32.21h15.26l-8.65 32.21h17.29v12.71h-20.68L364.36 199h18.99v12.71h-22.38l-8.31 31.36H337.4l8.31-31.36H319.6l-8.31 31.36h-15.26l8.31-31.36H286.2V199h21.53l6.61-24.58h-19.83v-12.71h23.22l8.65-32.21zm-18.65 69.51h26.11l6.61-24.58H329.6z",
    style: {
      fill: '#cd0000'
    }
  })
});
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
const save = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "currentColor",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    d: "M0 0h24v24H0V0z",
    fill: "none"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    d: "M17 3H3v18h18V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"
  })]
});
const insertImage = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "currentColor",
  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("path", {
    d: "M21 21V3H3v18h18zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
  })
});
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


/***/ },

/***/ 877
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ useVideoQuery)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(87);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(143);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(491);
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_compose__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _api_gallery__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(533);





/**
 * Hook to query and search for videos or other content types in the WordPress database.
 *
 * @param {Object} inputAttributes Block attributes.
 * @param {number} previewPostId   The ID of the post being previewed.
 * @return {Object} Query results including search results, categories, and tags.
 */
function useVideoQuery(inputAttributes, previewPostId) {
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
    Promise.resolve(/* import() */).then(__webpack_require__.t.bind(__webpack_require__, 455, 23)).then(({
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
  }, [gallery_id, gallery_source, gallery_category, gallery_tag, gallery_orderby, gallery_order, gallery_include, gallery_exclude, gallery_pagination, gallery_per_page, page_number, enable_collection_video_limit, collection_video_limit, previewPostId, attributes.prioritizePostData, isSaving, isAutosaving, inputAttributes]);
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
  const {
    customGalleries
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
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

/***/ 790
(module) {

module.exports = window["ReactJSXRuntime"];

/***/ },

/***/ 455
(module) {

module.exports = window["wp"]["apiFetch"];

/***/ },

/***/ 808
(module) {

module.exports = window["wp"]["components"];

/***/ },

/***/ 491
(module) {

module.exports = window["wp"]["compose"];

/***/ },

/***/ 143
(module) {

module.exports = window["wp"]["data"];

/***/ },

/***/ 87
(module) {

module.exports = window["wp"]["element"];

/***/ },

/***/ 619
(module) {

module.exports = window["wp"]["hooks"];

/***/ },

/***/ 537
(module) {

module.exports = window["wp"]["htmlEntities"];

/***/ },

/***/ 723
(module) {

module.exports = window["wp"]["i18n"];

/***/ },

/***/ 573
(module) {

module.exports = window["wp"]["primitives"];

/***/ },

/***/ 832
(module) {

module.exports = window["wp"]["url"];

/***/ },

/***/ 125
(module) {

module.exports = /*#__PURE__*/JSON.parse('{"download":{"viewBox":"0 0 24 24","paths":[{"d":"M18 11.3l-1-1.1-4 4V3h-1.5v11.3L7 10.2l-1 1.1 6.2 5.8 5.8-5.8zm.5 3.7v3.5h-13V15H4v5h16v-5h-1.5z"}]},"share":{"viewBox":"0 0 24 24","paths":[{"d":"M9 11.8l6.1-4.5c.1.4.4.7.9.7h2c.6 0 1-.4 1-1V5c0-.6-.4-1-1-1h-2c-.6 0-1 .4-1 1v.4l-6.4 4.8c-.2-.1-.4-.2-.6-.2H6c-.6 0-1 .4-1 1v2c0 .6.4 1 1 1h2c.2 0 .4-.1.6-.2l6.4 4.8v.4c0 .6.4 1 1 1h2c.6 0 1-.4 1-1v-2c0-.6-.4-1-1-1h-2c-.5 0-.8.3-.9.7L9 12.2v-.4z"}]},"close":{"viewBox":"0 0 24 24","paths":[{"d":"m13.06 12 6.47-6.47-1.06-1.06L12 10.94 5.53 4.47 4.47 5.53 10.94 12l-6.47 6.47 1.06 1.06L12 13.06l6.47 6.47 1.06-1.06L13.06 12Z"}]},"external":{"viewBox":"0 0 1080 1080","paths":[{"d":"M994.56 986.8H68.33V169.45h463.11v70H138.33V916.8h786.23V623.33h70z"},{"d":"M549.07 598.54h-70v-3.49c-.02-63.64-.04-142.85 49.5-207.82 56.32-73.87 162.4-109.79 324.25-109.79h.24c111.9.02 128.37-.04 135.4-.06 1.82 0 3-.01 5-.01v70c-1.89 0-3.01 0-4.74.01-7.07.03-23.63.09-135.67.06h-.22c-75.54 0-137.44 8.45-183.99 25.11-37.98 13.59-65.66 32.28-84.6 57.13-35.2 46.17-35.18 109.49-35.17 165.36v3.51Z"},{"d":"m873.68 499.79-52.2-46.63L946.4 313.31 823.14 183.75l50.72-48.25 167.74 176.32z"}]},"iosShare":{"viewBox":"0 0 1080 1080","paths":[{"d":"M760.96 270.67h170.07V979H126.25V270.67H312.3m226.28 367.29V89.31m-149.87 152 149.87-152 153.17 152","fill":"none","stroke":"currentColor","stroke-miterlimit":"10","stroke-width":"70"}]},"curveShare":{"viewBox":"0 0 512 512","paths":[{"d":"M512 241.7 273.643 3.343v156.152c-71.41 3.744-138.015 33.337-188.958 84.28C30.075 298.384 0 370.991 0 448.222v60.436l29.069-52.985c45.354-82.671 132.173-134.027 226.573-134.027 5.986 0 12.004.212 18.001.632v157.779zm-256.358 48.966c-84.543 0-163.661 36.792-217.939 98.885 26.634-114.177 129.256-199.483 251.429-199.483h15.489V78.131l163.568 163.568-163.568 163.568V294.531l-13.585-1.683a289 289 0 0 0-35.394-2.182"}]},"embed":{"viewBox":"0 0 24 24","paths":[{"d":"M20.8 10.7l-4.3-4.3-1.1 1.1 4.3 4.3c.1.1.1.3 0 .4l-4.3 4.3 1.1 1.1 4.3-4.3c.7-.8.7-1.9 0-2.6zM4.2 11.8l4.3-4.3-1-1-4.3 4.3c-.7.7-.7 1.8 0 2.5l4.3 4.3 1.1-1.1-4.3-4.3c-.2-.1-.2-.3-.1-.4z"}]},"eye":{"viewBox":"0 0 24 24","paths":[{"d":"M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"}]},"play":{"viewBox":"0 0 24 24","paths":[{"d":"M8 5v14l11-7z"}]},"playOutline":{"viewBox":"0 0 24 24","paths":[{"d":"M8 5v14l11-7z","fill":"none","stroke":"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}]},"copyLink":{"viewBox":"0 0 16 16","paths":[{"d":"M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z"},{"d":"M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z"}]},"bluesky":{"viewBox":"0 0 16 16","paths":[{"d":"M3.468 1.948C5.303 3.325 7.276 6.118 8 7.616c.725-1.498 2.698-4.29 4.532-5.668C13.855.955 16 .186 16 2.632c0 .489-.28 4.105-.444 4.692-.572 2.04-2.653 2.561-4.504 2.246 3.236.551 4.06 2.375 2.281 4.2-3.376 3.464-4.852-.87-5.23-1.98-.07-.204-.103-.3-.103-.218 0-.081-.033.014-.102.218-.379 1.11-1.855 5.444-5.231 1.98-1.778-1.825-.955-3.65 2.28-4.2-1.85.315-3.932-.205-4.503-2.246C.28 6.737 0 3.12 0 2.632 0 .186 2.145.955 3.468 1.948"}]},"threads":{"viewBox":"0 0 16 16","paths":[{"d":"M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948s.928 1.509 1.005 2.644q.492.207.905.484c1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.2 6.2 0 0 0-1.528-.161"}]},"facebook":{"viewBox":"0 0 16 16","paths":[{"d":"M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.8V16c3.824-.604 6.75-3.934 6.75-7.951z"}]},"reddit":{"viewBox":"0 0 16 16","paths":[{"d":"M6.167 8a.83.83 0 0 0-.83.83c0 .459.372.84.83.831a.831.831 0 0 0 0-1.661m1.843 3.647c.315 0 1.403-.038 1.976-.611a.23.23 0 0 0 0-.306.213.213 0 0 0-.306 0c-.353.363-1.126.487-1.67.487-.545 0-1.308-.124-1.671-.487a.213.213 0 0 0-.306 0 .213.213 0 0 0 0 .306c.564.563 1.652.61 1.977.61zm.992-2.807c0 .458.373.83.831.83s.83-.381.83-.83a.831.831 0 0 0-1.66 0z"},{"d":"M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.828-1.165c-.315 0-.602.124-.812.325-.801-.573-1.9-.945-3.121-.993l.534-2.501 1.738.372a.83.83 0 1 0 .83-.869.83.83 0 0 0-.744.468l-1.938-.41a.2.2 0 0 0-.153.028.2.2 0 0 0-.086.134l-.592 2.788c-1.24.038-2.358.41-3.17.992-.21-.2-.496-.324-.81-.324a1.163 1.163 0 0 0-.478 2.224q-.03.17-.029.353c0 1.795 2.091 3.256 4.669 3.256s4.668-1.451 4.668-3.256c0-.114-.01-.238-.029-.353.401-.181.688-.592.688-1.069 0-.65-.525-1.165-1.165-1.165"}]},"email":{"viewBox":"0 0 16 16","paths":[{"d":"M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.976-5.64-3.384L8 9.83l-1.326-.795-5.64 3.384A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.641ZM1 11.105l4.708-2.897L1 5.383v5.722Z"}]}}');

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
/******/ 	/* webpack/runtime/create fake namespace object */
/******/ 	(() => {
/******/ 		var getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
/******/ 		var leafPrototypes;
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
/******/ 			var ns = Object.create(null);
/******/ 			__webpack_require__.r(ns);
/******/ 			var def = {};
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

// EXTERNAL MODULE: external ["wp","element"]
var external_wp_element_ = __webpack_require__(87);
// EXTERNAL MODULE: external ["wp","components"]
var external_wp_components_ = __webpack_require__(808);
// EXTERNAL MODULE: external ["wp","i18n"]
var external_wp_i18n_ = __webpack_require__(723);
// EXTERNAL MODULE: external ["wp","apiFetch"]
var external_wp_apiFetch_ = __webpack_require__(455);
var external_wp_apiFetch_default = /*#__PURE__*/__webpack_require__.n(external_wp_apiFetch_);
// EXTERNAL MODULE: external ["wp","hooks"]
var external_wp_hooks_ = __webpack_require__(619);
// EXTERNAL MODULE: ./src/assets/icon.js
var icon = __webpack_require__(427);
// EXTERNAL MODULE: external ["wp","compose"]
var external_wp_compose_ = __webpack_require__(491);
;// ./src/hooks/useVideoSettings.js
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
  (0,external_wp_element_.useEffect)(() => {
    if (gifmode) {
      setAttributes({
        autoplay: true,
        loop: true,
        muted: true,
        controls: false
      });
    }
  }, [gifmode, setAttributes]);
  const updateAttachmentCallback = (0,external_wp_element_.useCallback)((key, value) => {
    if (id && autoSave) {
      external_wp_apiFetch_default()({
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
  const updateAttachment = (0,external_wp_compose_.useDebounce)(updateAttachmentCallback, 1000);

  // Persist the consolidated _videopack-meta object to the REST API.
  // Since WordPress replaces the entire object meta field on POST,
  // we must send the full set of desired overrides ogni volta.
  const updateMetaCallback = (0,external_wp_element_.useCallback)(currentAttrs => {
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
      external_wp_apiFetch_default()({
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
  const updateMeta = (0,external_wp_compose_.useDebounce)(updateMetaCallback, 1000);
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
    label: (0,external_wp_i18n_.__)('Auto', 'video-embed-thumbnail-generator')
  }, {
    value: 'metadata',
    label: (0,external_wp_i18n_.__)('Metadata', 'video-embed-thumbnail-generator')
  }, {
    value: 'none',
    label: (0,external_wp_i18n_._x)('None', 'Preload value')
  }];
  return {
    handleSettingChange,
    preloadOptions
  };
};
/* harmony default export */ const hooks_useVideoSettings = (useVideoSettings);
// EXTERNAL MODULE: external "ReactJSXRuntime"
var external_ReactJSXRuntime_ = __webpack_require__(790);
;// ./src/components/CompactColorPicker/CompactColorPicker.js


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
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
    className: "videopack-color-picker-container",
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
      className: "videopack-color-picker-label",
      children: label
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Dropdown, {
      className: "videopack-color-dropdown",
      contentClassName: "videopack-color-dropdown-content",
      renderToggle: ({
        isOpen,
        onToggle
      }) => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
        onClick: onToggle,
        "aria-expanded": isOpen,
        variant: "secondary",
        className: "videopack-color-picker-button",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ColorIndicator, {
          colorValue: displayColor
        })
      }),
      renderContent: () => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "videopack-color-picker-palette-wrapper",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ColorPalette, {
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
/* harmony default export */ const CompactColorPicker_CompactColorPicker = (CompactColorPicker);
;// ./src/utils/video-capture.js
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
    img.onerror = () => reject(new Error((0,external_wp_i18n_.__)('Failed to load watermark image', 'video-embed-thumbnail-generator')));
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
;// ./src/features/settings/components/TextControlOnBlur.js




const TextControlOnBlur = ({
  value,
  onChange,
  ...props
}) => {
  const [innerValue, setInnerValue] = (0,external_wp_element_.useState)(value);
  (0,external_wp_element_.useEffect)(() => {
    setInnerValue(value);
  }, [value]);
  const handleOnChange = newValue => {
    setInnerValue(newValue);
  };
  const handleOnBlur = event => {
    console.log('TextControlOnBlur: blurred, calling onChange with:', innerValue);
    onChange(innerValue);
    if (props.onBlur) {
      props.onBlur(event);
    }
  };
  const handleOnFocus = event => {
    if (innerValue === (0,external_wp_i18n_.__)('No limit', 'video-embed-thumbnail-generator')) {
      setInnerValue('');
    }
    if (props.onFocus) {
      props.onFocus(event);
    }
  };
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.TextControl, {
    ...props,
    value: innerValue,
    onChange: handleOnChange,
    onBlur: handleOnBlur,
    onFocus: handleOnFocus
  });
};
/* harmony default export */ const components_TextControlOnBlur = (TextControlOnBlur);
;// ./src/features/settings/components/SelectFromLibrary.js




const SelectFromLibrary = ({
  value,
  onChange,
  label,
  children,
  ...props
}) => {
  const openMediaLibrary = () => {
    const frame = window.wp.media({
      title: (0,external_wp_i18n_.__)('Select Image', 'video-embed-thumbnail-generator'),
      button: {
        text: (0,external_wp_i18n_.__)('Use this image', 'video-embed-thumbnail-generator')
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
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
    className: "videopack-setting-reduced-width",
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_TextControlOnBlur, {
      __nextHasNoMarginBottom: true,
      __next40pxDefaultSize: true,
      label: label,
      value: value,
      onChange: onChange,
      ...props
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      className: "videopack-library-button-wrapper",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
        __next40pxDefaultSize: true,
        className: "videopack-library-button",
        variant: "secondary",
        onClick: openMediaLibrary,
        disabled: props.disabled,
        children: (0,external_wp_i18n_.__)('Select from library', 'video-embed-thumbnail-generator')
      }), children]
    })]
  });
};
/* harmony default export */ const components_SelectFromLibrary = (SelectFromLibrary);
;// ./src/components/WatermarkPositioner/WatermarkPositioner.js
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
  const containerRef = (0,external_wp_element_.useRef)(null);
  const watermarkRef = (0,external_wp_element_.useRef)(null);
  const [watermarkImage, setWatermarkImage] = (0,external_wp_element_.useState)(null);
  const [isDragging, setIsDragging] = (0,external_wp_element_.useState)(false);
  const [isResizing, setIsResizing] = (0,external_wp_element_.useState)(false);
  const [transientScale, setTransientScale] = (0,external_wp_element_.useState)(null);
  const [transientPercentages, setTransientPercentages] = (0,external_wp_element_.useState)(null); // { x, y } in percentages
  const [isFocused, setIsFocused] = (0,external_wp_element_.useState)(false);
  const lastAspectRatioRef = (0,external_wp_element_.useRef)(propAspectRatio || 1);
  (0,external_wp_element_.useEffect)(() => {
    if (watermarkImage) {
      lastAspectRatioRef.current = watermarkImage.width / watermarkImage.height;
    } else if (propAspectRatio) {
      lastAspectRatioRef.current = propAspectRatio;
    }
  }, [watermarkImage, propAspectRatio]);
  const dragStartRef = (0,external_wp_element_.useRef)({
    x: 0,
    y: 0,
    initialLeft: 0,
    initialTop: 0
  });
  const stateRef = (0,external_wp_element_.useRef)({});
  const effectiveImageUrl = imageUrl || settings?.url || settings?.watermark;
  (0,external_wp_element_.useEffect)(() => {
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
  } = (0,external_wp_element_.useMemo)(() => {
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
      aspectRatio: ratio
    };
  }, [containerDimensions, watermarkImage, settings, transientScale, transientPercentages]);
  (0,external_wp_element_.useEffect)(() => {
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
  const onChangeRef = (0,external_wp_element_.useRef)(onChange);
  (0,external_wp_element_.useEffect)(() => {
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
  const handleMouseMove = (0,external_wp_element_.useCallback)(e => {
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
      const currentAlignment = s.settings.align || s.settings.watermark_align || 'center';
      const currentVerticalAlignment = s.settings.valign || s.settings.watermark_valign || 'center';
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
  const finalizeInteraction = (0,external_wp_element_.useCallback)(() => {
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
    const currentRatio = s.aspectRatio;
    const {
      width: containerWidth,
      height: containerHeight
    } = s.containerDimensions;

    // Preserve attributes based on what's being used (settings vs block-editor styles)
    const isBlock = Object.prototype.hasOwnProperty.call(s.settings, 'watermark_scale') || Object.prototype.hasOwnProperty.call(s.settings, 'watermark');
    const currentAlign = s.settings.align || s.settings.watermark_align || 'center';
    const currentValign = s.settings.valign || s.settings.watermark_valign || 'bottom';

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
  (0,external_wp_element_.useEffect)(() => {
    if (!isSelected && (isDragging || isResizing)) {
      finalizeInteraction();
    }
  }, [isSelected, isDragging, isResizing, finalizeInteraction]);

  // Finalize interaction on unmount if anything was pending
  (0,external_wp_element_.useEffect)(() => {
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
  const handleFocus = (0,external_wp_element_.useCallback)(() => {
    setIsFocused(true);
  }, []);
  const handleBlur = (0,external_wp_element_.useCallback)(e => {
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
    const currentAlignment = settings.align || settings.watermark_align || 'center';
    const currentVerticalAlignment = settings.valign || settings.watermark_valign || 'center';
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
  (0,external_wp_element_.useEffect)(() => {
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
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
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
    children: [(isDragging || isResizing) && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
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
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      ref: watermarkRef,
      style: {
        ...wmStyle,
        outline: showHandles ? '1px dashed #757575' : 'none',
        cursor: watermarkCursor
      },
      role: "button",
      tabIndex: isSelected ? '0' : '-1',
      "aria-label": (0,external_wp_i18n_.__)('Move watermark', 'video-embed-thumbnail-generator'),
      onMouseDown: handleMouseDown,
      onKeyDown: handleDragKeyDown,
      onFocus: handleFocus,
      onBlur: handleBlur,
      children: [children ? children : /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("img", {
        src: effectiveImageUrl,
        alt: "Watermark",
        style: {
          width: '100%',
          height: '100%',
          userSelect: 'none',
          display: 'block'
        },
        draggable: false
      }), showHandles && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
          role: "slider",
          tabIndex: "0",
          "aria-label": (0,external_wp_i18n_.__)('Resize watermark from top left', 'video-embed-thumbnail-generator'),
          className: "videopack-resize-handle nw",
          onMouseDown: e => handleResizeStart(e, 'nw'),
          onKeyDown: e => handleResizeKeyDown(e, 'nw')
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
          role: "slider",
          tabIndex: "0",
          "aria-label": (0,external_wp_i18n_.__)('Resize watermark from top right', 'video-embed-thumbnail-generator'),
          className: "videopack-resize-handle ne",
          onMouseDown: e => handleResizeStart(e, 'ne'),
          onKeyDown: e => handleResizeKeyDown(e, 'ne')
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
          role: "slider",
          tabIndex: "0",
          "aria-label": (0,external_wp_i18n_.__)('Resize watermark from bottom left', 'video-embed-thumbnail-generator'),
          className: "videopack-resize-handle sw",
          onMouseDown: e => handleResizeStart(e, 'sw'),
          onKeyDown: e => handleResizeKeyDown(e, 'sw')
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
          role: "slider",
          tabIndex: "0",
          "aria-label": (0,external_wp_i18n_.__)('Resize watermark from bottom right', 'video-embed-thumbnail-generator'),
          className: "videopack-resize-handle se",
          onMouseDown: e => handleResizeStart(e, 'se'),
          onKeyDown: e => handleResizeKeyDown(e, 'se')
        })]
      })]
    })]
  });
};
/* harmony default export */ const WatermarkPositioner_WatermarkPositioner = (WatermarkPositioner);
;// ./src/components/WatermarkSettingsPanel/WatermarkSettingsPanel.js
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
  const [baseFrame, setBaseFrame] = (0,external_wp_element_.useState)(null);
  const [settingsPanelOpen, setSettingsPanelOpen] = (0,external_wp_element_.useState)(false);
  const prevWatermarkUrl = (0,external_wp_element_.useRef)(watermarkSettings?.url);
  (0,external_wp_element_.useEffect)(() => {
    if (watermarkSettings?.url && watermarkSettings.url !== prevWatermarkUrl.current) {
      setSettingsPanelOpen(true);
    }
    prevWatermarkUrl.current = watermarkSettings?.url;
  }, [watermarkSettings?.url]);
  (0,external_wp_element_.useEffect)(() => {
    if (watermarkSettings?.url && !baseFrame) {
      const videoUrl = videopack_config.url + '/src/images/Adobestock_469037984.mp4';
      const videoOffset = Math.random() * 1.9;
      captureVideoFrame(videoUrl, videoOffset).then(canvas => {
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
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
    ...panelProps,
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_SelectFromLibrary, {
      label: (0,external_wp_i18n_.__)('Watermark image URL', 'video-embed-thumbnail-generator'),
      type: "url",
      value: watermarkSettings?.url,
      onChange: url => onChange(typeof watermarkSettings === 'object' && watermarkSettings !== null ? {
        ...watermarkSettings,
        url
      } : {
        url
      }),
      disabled: disabled
    }), children, watermarkSettings?.url && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelBody, {
      title: (0,external_wp_i18n_.__)('Watermark Settings', 'video-embed-thumbnail-generator'),
      opened: settingsPanelOpen,
      onToggle: () => setSettingsPanelOpen(!settingsPanelOpen),
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-watermark-settings",
        children: [baseFrame && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(WatermarkPositioner_WatermarkPositioner, {
          containerDimensions: {
            width: baseFrame.width,
            height: baseFrame.height
          },
          settings: watermarkSettings,
          onChange: onChange,
          isSelected: true,
          showBackground: true,
          backgroundDataUrl: baseFrame.toDataURL()
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.RangeControl, {
          label: (0,external_wp_i18n_.__)('Scale (%)', 'video-embed-thumbnail-generator'),
          value: Number(watermarkSettings.scale || 50),
          onChange: value => updateSetting('scale', value),
          min: 1,
          max: 100,
          step: 0.01,
          __nextHasNoMarginBottom: true,
          disabled: disabled
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.Flex, {
          gap: 4,
          align: "flex-end",
          justify: "flex-start",
          style: {
            marginBottom: '10px'
          },
          className: "videopack-watermark-row",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.FlexItem, {
            className: "videopack-alignment-control",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
              __next40pxDefaultSize: true,
              label: (0,external_wp_i18n_.__)('Horizontal Alignment', 'video-embed-thumbnail-generator'),
              value: watermarkSettings.align || 'center',
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
              onChange: value => updateSetting('align', value),
              __nextHasNoMarginBottom: true,
              disabled: disabled
            })
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.FlexItem, {
            className: "videopack-offset-control",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.RangeControl, {
              label: (0,external_wp_i18n_.__)('Horizontal Offset (%)', 'video-embed-thumbnail-generator'),
              value: Number(watermarkSettings.x || 0),
              onChange: value => updateSetting('x', value),
              min: 0,
              max: 100,
              step: 0.01,
              __nextHasNoMarginBottom: true,
              disabled: disabled
            })
          })]
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.Flex, {
          gap: 4,
          align: "flex-end",
          justify: "flex-start",
          className: "videopack-watermark-row",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.FlexItem, {
            className: "videopack-alignment-control",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
              __next40pxDefaultSize: true,
              label: (0,external_wp_i18n_.__)('Vertical Alignment', 'video-embed-thumbnail-generator'),
              value: watermarkSettings.valign || 'center',
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
              onChange: value => updateSetting('valign', value),
              __nextHasNoMarginBottom: true,
              disabled: disabled
            })
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.FlexItem, {
            className: "videopack-offset-control",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.RangeControl, {
              label: (0,external_wp_i18n_.__)('Vertical Offset (%)', 'video-embed-thumbnail-generator'),
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
/* harmony default export */ const WatermarkSettingsPanel_WatermarkSettingsPanel = (WatermarkSettingsPanel);
;// external ["wp","mediaUtils"]
const external_wp_mediaUtils_namespaceObject = window["wp"]["mediaUtils"];
// EXTERNAL MODULE: external ["wp","primitives"]
var external_wp_primitives_ = __webpack_require__(573);
;// ./node_modules/@wordpress/icons/build-module/library/close.mjs
// packages/icons/src/library/close.tsx


var close_default = /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.Path, { d: "m13.06 12 6.47-6.47-1.06-1.06L12 10.94 5.53 4.47 4.47 5.53 10.94 12l-6.47 6.47 1.06 1.06L12 13.06l6.47 6.47 1.06-1.06L13.06 12Z" }) });

//# sourceMappingURL=close.mjs.map

;// ./node_modules/@wordpress/icons/build-module/library/plus.mjs
// packages/icons/src/library/plus.tsx


var plus_default = /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.Path, { d: "M11 12.5V17.5H12.5V12.5H17.5V11H12.5V6H11V11H6V12.5H11Z" }) });

//# sourceMappingURL=plus.mjs.map

;// ./src/components/TextTracks/TextTracks.js





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
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
    title: (0,external_wp_i18n_.__)('Text Tracks', 'video-embed-thumbnail-generator'),
    initialOpen: false,
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
      className: "videopack-text-tracks-list",
      children: tracks.map((track, index) => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-text-track-item",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "videopack-text-track-header",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
            className: "videopack-text-track-label",
            children: track.label || track.src.split('/').pop() || (0,external_wp_i18n_.__)('Untitled Track', 'video-embed-thumbnail-generator')
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
            icon: close_default,
            label: (0,external_wp_i18n_.__)('Remove Track', 'video-embed-thumbnail-generator'),
            onClick: () => removeTrack(index),
            isDestructive: true,
            className: "videopack-remove-track"
          })]
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "videopack-text-track-settings",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "videopack-text-track-settings-row",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.TextControl, {
              label: (0,external_wp_i18n_.__)('Source URL', 'video-embed-thumbnail-generator'),
              value: track.src,
              onChange: value => updateTrack(index, {
                src: value
              }),
              __nextHasNoMarginBottom: true
            })
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            className: "videopack-text-track-settings-row videopack-text-track-settings-row-split",
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
              label: (0,external_wp_i18n_.__)('Kind', 'video-embed-thumbnail-generator'),
              value: track.kind,
              options: [{
                label: (0,external_wp_i18n_.__)('Subtitles', 'video-embed-thumbnail-generator'),
                value: 'subtitles'
              }, {
                label: (0,external_wp_i18n_.__)('Captions', 'video-embed-thumbnail-generator'),
                value: 'captions'
              }, {
                label: (0,external_wp_i18n_.__)('Descriptions', 'video-embed-thumbnail-generator'),
                value: 'descriptions'
              }, {
                label: (0,external_wp_i18n_.__)('Chapters', 'video-embed-thumbnail-generator'),
                value: 'chapters'
              }, {
                label: (0,external_wp_i18n_.__)('Metadata', 'video-embed-thumbnail-generator'),
                value: 'metadata'
              }],
              onChange: value => updateTrack(index, {
                kind: value
              }),
              __nextHasNoMarginBottom: true
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.TextControl, {
              label: (0,external_wp_i18n_.__)('Language', 'video-embed-thumbnail-generator'),
              value: track.srclang,
              onChange: value => updateTrack(index, {
                srclang: value
              }),
              placeholder: "en",
              __nextHasNoMarginBottom: true
            })]
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "videopack-text-track-settings-row",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.TextControl, {
              label: (0,external_wp_i18n_.__)('Label', 'video-embed-thumbnail-generator'),
              value: track.label,
              onChange: value => updateTrack(index, {
                label: value
              }),
              placeholder: (0,external_wp_i18n_.__)('e.g. English Subtitles', 'video-embed-thumbnail-generator'),
              __nextHasNoMarginBottom: true
            })
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelRow, {
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
              label: (0,external_wp_i18n_.__)('Default', 'video-embed-thumbnail-generator'),
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
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      className: "videopack-text-tracks-actions",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_mediaUtils_namespaceObject.MediaUpload, {
        onSelect: handleMediaSelect,
        allowedTypes: ['text/vtt', 'application/vtt', 'text/plain'] // VTT files often detected as text/plain
        ,
        render: ({
          open
        }) => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
          variant: "secondary",
          icon: plus_default,
          onClick: open,
          children: (0,external_wp_i18n_.__)('Add from Library', 'video-embed-thumbnail-generator')
        })
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
        variant: "tertiary",
        onClick: () => addTrack({
          src: '',
          kind: 'subtitles',
          srclang: '',
          label: '',
          default: false
        }),
        children: (0,external_wp_i18n_.__)('Add URL', 'video-embed-thumbnail-generator')
      })]
    })]
  });
};
/* harmony default export */ const TextTracks_TextTracks = (TextTracks);
;// ./src/utils/helpers.js
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
;// ./src/utils/colors.js
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
;// ./src/components/VideoSettings/VideoSettings.js
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
  } = hooks_useVideoSettings(attributes, setAttributes, options);
  const displayAttributes = (0,external_wp_element_.useMemo)(() => {
    const merged = {
      ...options,
      ...attributes
    };
    return normalizeOptions(merged);
  }, [options, attributes]);
  const PLAYER_COLOR_FALLBACKS = (0,external_wp_element_.useMemo)(() => getColorFallbacks(displayAttributes), [displayAttributes]);
  const THEME_COLORS = videopack_config?.themeColors || options?.themeColors;
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
    className: "videopack-video-settings",
    children: [!isBlockEditor && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
      title: (0,external_wp_i18n_.__)('Metadata', 'video-embed-thumbnail-generator'),
      initialOpen: initialOpen,
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelRow, {
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,external_wp_i18n_.__)('Overlay title', 'video-embed-thumbnail-generator'),
          onChange: value => handleSettingChange('overlay_title', value),
          checked: !!displayAttributes.overlay_title
        })
      }), displayAttributes.overlay_title && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "videopack-video-settings-input-wrapper",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,external_wp_i18n_.__)('Title', 'video-embed-thumbnail-generator'),
          value: displayAttributes.title || '',
          onChange: value => handleSettingChange('title', value)
        })
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "videopack-video-settings-input-wrapper",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,external_wp_i18n_.__)('Caption', 'video-embed-thumbnail-generator'),
          value: displayAttributes.caption || '',
          onChange: value => handleSettingChange('caption', value)
        })
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelRow, {
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,external_wp_i18n_.__)('View count', 'video-embed-thumbnail-generator'),
          onChange: value => handleSettingChange('views', value),
          checked: !!displayAttributes.views
        })
      }), (() => {
        const availableStats = [{
          key: 'starts',
          label: (0,external_wp_i18n_.__)('Starts', 'video-embed-thumbnail-generator'),
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
          label: (0,external_wp_i18n_.__)('Ends', 'video-embed-thumbnail-generator'),
          val: displayAttributes.completeviews
        }].filter(s => s.val > 0);
        if (availableStats.length === 0) {
          return null;
        }
        const isSingleStat = availableStats.length === 1;
        return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: `videopack-video-stats-${isSingleStat ? 'simple' : 'funnel'}`,
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("p", {
            className: "videopack-settings-section-title",
            children: (0,external_wp_i18n_.__)('Views', 'video-embed-thumbnail-generator')
          }), isSingleStat ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            className: "videopack-stat-simple-row",
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("span", {
              className: "videopack-stat-label",
              children: [availableStats[0].label, ":"]
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
              className: "videopack-stat-value",
              children: availableStats[0].val.toLocaleString()
            })]
          }) : /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "videopack-funnel-track",
            children: availableStats.map((stat, idx, arr) => {
              const retention = stat.key !== 'starts' && displayAttributes.starts > 0 ? Math.round(stat.val / displayAttributes.starts * 100) + '%' : null;
              return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                className: "videopack-funnel-item",
                children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
                  className: "videopack-funnel-marker",
                  children: idx < arr.length - 1 && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
                    className: "videopack-funnel-connector"
                  })
                }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
                  className: "videopack-funnel-label",
                  children: stat.label
                }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
                  className: "videopack-funnel-value",
                  children: stat.val.toLocaleString()
                }), retention && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
                  className: "videopack-funnel-retention",
                  children: retention
                })]
              }, stat.key);
            })
          })]
        });
      })()]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
      title: (0,external_wp_i18n_.__)('Player Settings', 'video-embed-thumbnail-generator'),
      initialOpen: initialOpen,
      children: [!displayAttributes.gifmode && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_ReactJSXRuntime_.Fragment, {
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.Flex, {
          "align-items": "flex-start",
          expanded: false,
          gap: 20,
          justify: "flex-start",
          className: "videopack-player-settings-flex",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.FlexItem, {
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
              __nextHasNoMarginBottom: true,
              label: (0,external_wp_i18n_.__)('Autoplay', 'video-embed-thumbnail-generator'),
              onChange: value => handleSettingChange('autoplay', value),
              checked: !!displayAttributes.autoplay,
              help: displayAttributes.autoplay && !displayAttributes.muted ? (0,external_wp_i18n_.__)('Autoplay is disabled while editing unless muted.') : null
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
              __nextHasNoMarginBottom: true,
              label: (0,external_wp_i18n_.__)('Loop', 'video-embed-thumbnail-generator'),
              onChange: value => handleSettingChange('loop', value),
              checked: !!displayAttributes.loop
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
              __nextHasNoMarginBottom: true,
              label: (0,external_wp_i18n_.__)('Muted', 'video-embed-thumbnail-generator'),
              onChange: value => handleSettingChange('muted', value),
              checked: !!displayAttributes.muted
            }), !displayAttributes.muted && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.RangeControl, {
              __nextHasNoMarginBottom: true,
              __next40pxDefaultSize: true,
              label: (0,external_wp_i18n_.__)('Volume', 'video-embed-thumbnail-generator'),
              value: displayAttributes.volume,
              beforeIcon: icon.volumeDown,
              afterIcon: icon.volumeUp,
              initialPosition: 1,
              withInputField: false,
              onChange: value => handleSettingChange('volume', value),
              min: 0,
              max: 1,
              step: 0.05
            })]
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.FlexItem, {
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
              __nextHasNoMarginBottom: true,
              label: (0,external_wp_i18n_.__)('Controls', 'video-embed-thumbnail-generator'),
              onChange: value => handleSettingChange('controls', value),
              checked: !!displayAttributes.controls
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
              __nextHasNoMarginBottom: true,
              label: (0,external_wp_i18n_.__)('Variable playback speeds', 'video-embed-thumbnail-generator'),
              onChange: value => handleSettingChange('playback_rate', value),
              checked: !!displayAttributes.playback_rate
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
              __nextHasNoMarginBottom: true,
              label: (0,external_wp_i18n_.__)('Play inline on iPhones', 'video-embed-thumbnail-generator'),
              onChange: value => handleSettingChange('playsinline', value),
              checked: !!displayAttributes.playsinline
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
              __nextHasNoMarginBottom: true,
              __next40pxDefaultSize: true,
              label: (0,external_wp_i18n_.__)('Preload', 'video-embed-thumbnail-generator'),
              value: displayAttributes.preload,
              onChange: value => handleSettingChange('preload', value),
              options: preloadOptions
            })]
          })]
        })
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
        __nextHasNoMarginBottom: true,
        label: (0,external_wp_i18n_.__)('GIF mode', 'video-embed-thumbnail-generator'),
        onChange: value => handleSettingChange('gifmode', value),
        checked: !!displayAttributes.gifmode,
        help: (0,external_wp_i18n_.__)('Video acts like an animated GIF. Enables autoplay, loop, mute, and disables controls.')
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
        __nextHasNoMarginBottom: true,
        label: (0,external_wp_i18n_.__)('Allow right-click on video', 'video-embed-thumbnail-generator'),
        onChange: value => handleSettingChange('right_click', value),
        checked: !!displayAttributes.right_click
      })]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
      title: (0,external_wp_i18n_.__)('Colors', 'video-embed-thumbnail-generator'),
      initialOpen: false,
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "videopack-skin-section",
        style: {
          marginBottom: '16px'
        },
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
          label: (0,external_wp_i18n_.__)('Player Skin', 'video-embed-thumbnail-generator'),
          value: attributes.skin || options.skin || '',
          options: [{
            label: (0,external_wp_i18n_.__)('Videopack', 'video-embed-thumbnail-generator'),
            value: 'vjs-theme-videopack'
          }, {
            label: (0,external_wp_i18n_.__)('Videopack Classic', 'video-embed-thumbnail-generator'),
            value: 'kg-video-js-skin'
          }, {
            label: (0,external_wp_i18n_.__)('Video.js default', 'video-embed-thumbnail-generator'),
            value: 'default'
          }, {
            label: (0,external_wp_i18n_.__)('City', 'video-embed-thumbnail-generator'),
            value: 'vjs-theme-city'
          }, {
            label: (0,external_wp_i18n_.__)('Fantasy', 'video-embed-thumbnail-generator'),
            value: 'vjs-theme-fantasy'
          }, {
            label: (0,external_wp_i18n_.__)('Forest', 'video-embed-thumbnail-generator'),
            value: 'vjs-theme-forest'
          }, {
            label: (0,external_wp_i18n_.__)('Sea', 'video-embed-thumbnail-generator'),
            value: 'vjs-theme-sea'
          }],
          onChange: value => handleSettingChange('skin', value)
        })
      }), !isBlockEditor && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-color-section",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("p", {
          className: "videopack-settings-section-title",
          children: (0,external_wp_i18n_.__)('Title overlay', 'video-embed-thumbnail-generator')
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "videopack-color-flex-row",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker_CompactColorPicker, {
              label: (0,external_wp_i18n_.__)('Text', 'video-embed-thumbnail-generator'),
              value: displayAttributes.title_color,
              onChange: value => handleSettingChange('title_color', value),
              colors: THEME_COLORS,
              fallbackValue: PLAYER_COLOR_FALLBACKS.title_color
            })
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker_CompactColorPicker, {
              label: (0,external_wp_i18n_.__)('Background', 'video-embed-thumbnail-generator'),
              value: displayAttributes.title_background_color,
              onChange: value => handleSettingChange('title_background_color', value),
              colors: THEME_COLORS,
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
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker_CompactColorPicker, {
              label: displayAttributes.embed_method === 'WordPress Default' ? (0,external_wp_i18n_.__)('Play Button Color', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_.__)('Play Button Icon', 'video-embed-thumbnail-generator'),
              value: displayAttributes.play_button_color,
              onChange: value => handleSettingChange('play_button_color', value),
              colors: THEME_COLORS,
              fallbackValue: PLAYER_COLOR_FALLBACKS.play_button_color
            })
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker_CompactColorPicker, {
              label: displayAttributes.embed_method === 'WordPress Default' ? (0,external_wp_i18n_.__)('Play Button Hover', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_.__)('Play Button Accent', 'video-embed-thumbnail-generator'),
              value: displayAttributes.play_button_secondary_color,
              onChange: value => handleSettingChange('play_button_secondary_color', value),
              colors: THEME_COLORS,
              fallbackValue: PLAYER_COLOR_FALLBACKS.play_button_secondary_color
            })
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker_CompactColorPicker, {
              label: (0,external_wp_i18n_.__)('Control Bar Background', 'video-embed-thumbnail-generator'),
              value: displayAttributes.control_bar_bg_color,
              onChange: value => handleSettingChange('control_bar_bg_color', value),
              colors: THEME_COLORS,
              fallbackValue: PLAYER_COLOR_FALLBACKS.control_bar_bg_color
            })
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker_CompactColorPicker, {
              label: (0,external_wp_i18n_.__)('Control Bar Icons', 'video-embed-thumbnail-generator'),
              value: displayAttributes.control_bar_color,
              onChange: value => handleSettingChange('control_bar_color', value),
              colors: THEME_COLORS,
              fallbackValue: PLAYER_COLOR_FALLBACKS.control_bar_color
            })
          })]
        })]
      })]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
      title: (0,external_wp_i18n_.__)('Dimensions', 'video-embed-thumbnail-generator'),
      initialOpen: false,
      children: [!isBlockEditor && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelRow, {
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
          className: "videopack-video-settings-full-width",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
            __nextHasNoMarginBottom: true,
            __next40pxDefaultSize: true,
            label: (0,external_wp_i18n_.__)('Align / Width', 'video-embed-thumbnail-generator'),
            value: displayAttributes.align || '',
            onChange: value => handleSettingChange('align', value),
            options: [{
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
            }]
          })
        })
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelRow, {
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.RadioControl, {
          label: (0,external_wp_i18n_.__)('Constrain to default aspect ratio', 'video-embed-thumbnail-generator'),
          selected: displayAttributes.fixed_aspect,
          onChange: value => handleSettingChange('fixed_aspect', value),
          options: [{
            value: 'false',
            label: (0,external_wp_i18n_.__)('None', 'video-embed-thumbnail-generator')
          }, {
            value: 'true',
            label: (0,external_wp_i18n_.__)('All', 'video-embed-thumbnail-generator')
          }, {
            value: 'vertical',
            label: (0,external_wp_i18n_.__)('Vertical Videos', 'video-embed-thumbnail-generator')
          }]
        })
      }), !isBlockEditor && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelRow, {
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
            __nextHasNoMarginBottom: true,
            label: (0,external_wp_i18n_.__)('Legacy dimension settings', 'video-embed-thumbnail-generator'),
            onChange: value => handleSettingChange('legacy_dimensions', value),
            checked: !!displayAttributes.legacy_dimensions
          })
        }), displayAttributes.legacy_dimensions && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelRow, {
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.TextControl, {
              __nextHasNoMarginBottom: true,
              __next40pxDefaultSize: true,
              label: (0,external_wp_i18n_.__)('Width', 'video-embed-thumbnail-generator'),
              type: "number",
              value: displayAttributes.width,
              onChange: value => handleSettingChange('width', value)
            })
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelRow, {
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.TextControl, {
              __nextHasNoMarginBottom: true,
              __next40pxDefaultSize: true,
              label: (0,external_wp_i18n_.__)('Height', 'video-embed-thumbnail-generator'),
              type: "number",
              value: displayAttributes.height,
              onChange: value => handleSettingChange('height', value)
            })
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelRow, {
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
              __nextHasNoMarginBottom: true,
              label: (0,external_wp_i18n_.__)('Shrink to fit', 'video-embed-thumbnail-generator'),
              onChange: value => handleSettingChange('resize', value),
              checked: !!displayAttributes.resize
            })
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelRow, {
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
              __nextHasNoMarginBottom: true,
              label: (0,external_wp_i18n_.__)('Expand to full width', 'video-embed-thumbnail-generator'),
              onChange: value => handleSettingChange('fullwidth', value),
              checked: !!displayAttributes.fullwidth
            })
          })]
        })]
      })]
    }), !isBlockEditor && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(WatermarkSettingsPanel_WatermarkSettingsPanel, {
      title: (0,external_wp_i18n_.__)('Watermark Overlay', 'video-embed-thumbnail-generator'),
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
      children: [displayAttributes.watermark && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelRow, {
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,external_wp_i18n_.__)('Link to', 'video-embed-thumbnail-generator'),
          value: displayAttributes.watermark_link_to || 'false',
          onChange: value => handleSettingChange('watermark_link_to', value),
          options: [{
            value: 'false',
            label: (0,external_wp_i18n_.__)('None', 'video-embed-thumbnail-generator')
          }, {
            value: 'home',
            label: (0,external_wp_i18n_.__)('Home page', 'video-embed-thumbnail-generator')
          }, {
            value: 'custom',
            label: (0,external_wp_i18n_.__)('Custom URL', 'video-embed-thumbnail-generator')
          }]
        })
      }), displayAttributes.watermark && displayAttributes.watermark_link_to === 'custom' && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelRow, {
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,external_wp_i18n_.__)('Watermark URL', 'video-embed-thumbnail-generator'),
          value: displayAttributes.watermark_url || '',
          onChange: value => handleSettingChange('watermark_url', value)
        })
      })]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(TextTracks_TextTracks, {
      tracks: displayAttributes.text_tracks || [],
      onChange: newTracks => handleSettingChange('text_tracks', newTracks)
    }), (0,external_wp_hooks_.applyFilters)(
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
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
      title: (0,external_wp_i18n_.__)('Sharing', 'video-embed-thumbnail-generator'),
      initialOpen: false,
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelRow, {
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,external_wp_i18n_.__)('Allow embedding / Show embed code', 'video-embed-thumbnail-generator'),
          onChange: value => handleSettingChange('embedcode', value),
          checked: !!displayAttributes.embedcode
        })
      }), displayAttributes.embedcode && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_ReactJSXRuntime_.Fragment, {
        children: !isBlockEditor && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_ReactJSXRuntime_.Fragment, {
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelRow, {
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
              __nextHasNoMarginBottom: true,
              label: (0,external_wp_i18n_.__)('Download link', 'video-embed-thumbnail-generator'),
              onChange: value => handleSettingChange('downloadlink', value),
              checked: !!displayAttributes.downloadlink
            })
          })
        })
      })]
    })]
  });
};
/* harmony default export */ const VideoSettings_VideoSettings = (VideoSettings);
// EXTERNAL MODULE: external ["wp","htmlEntities"]
var external_wp_htmlEntities_ = __webpack_require__(537);
;// ./src/components/InspectorControls/QuerySettings.js






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
  const [currentPost, setCurrentPost] = (0,external_wp_element_.useState)(null);
  (0,external_wp_element_.useEffect)(() => {
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
    external_wp_apiFetch_default()({
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
      label: (0,external_wp_htmlEntities_.decodeEntities)(currentPost.title.rendered)
    });
  }
  if (searchResults) {
    searchResults.forEach(post => {
      if (!optionsForSelect.find(o => String(o.value) === String(post.id))) {
        optionsForSelect.push({
          value: String(post.id),
          label: (0,external_wp_htmlEntities_.decodeEntities)(post.title.rendered)
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
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
      label: (0,external_wp_i18n_.__)('Source', 'video-embed-thumbnail-generator'),
      value: gallery_source,
      options: [{
        label: (0,external_wp_i18n_.__)('Current Post', 'video-embed-thumbnail-generator'),
        value: 'current'
      }, {
        label: (0,external_wp_i18n_.__)('Other Post', 'video-embed-thumbnail-generator'),
        value: 'custom'
      }, {
        label: (0,external_wp_i18n_.__)('Category', 'video-embed-thumbnail-generator'),
        value: 'category'
      }, {
        label: (0,external_wp_i18n_.__)('Tag', 'video-embed-thumbnail-generator'),
        value: 'tag'
      }, {
        label: (0,external_wp_i18n_.__)('Inherit from Global Query', 'video-embed-thumbnail-generator'),
        value: 'archive'
      }, showManualSource && {
        label: (0,external_wp_i18n_.__)('Manual', 'video-embed-thumbnail-generator'),
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
    }), gallery_source === 'custom' && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ComboboxControl, {
      label: (0,external_wp_i18n_.__)('Search Posts', 'video-embed-thumbnail-generator'),
      value: gallery_id ? String(gallery_id) : '',
      options: optionsForSelect,
      onFilterValueChange: debouncedSetSearchString,
      onChange: newValue => setAttributes({
        gallery_id: newValue ? parseInt(newValue, 10) : undefined
      }),
      help: (0,external_wp_i18n_.__)('Start typing to search for a post or page.', 'video-embed-thumbnail-generator'),
      allowReset: true,
      isLoading: isResolvingSearch
    }), gallery_source === 'category' && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
      label: (0,external_wp_i18n_.__)('Select Category', 'video-embed-thumbnail-generator'),
      value: gallery_category,
      options: [{
        label: (0,external_wp_i18n_.__)('Select…', 'video-embed-thumbnail-generator'),
        value: ''
      }, ...mapTermsToOptions(categories)],
      onChange: attributeChangeFactory('gallery_category')
    }), gallery_source === 'tag' && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
      label: (0,external_wp_i18n_.__)('Select Tag', 'video-embed-thumbnail-generator'),
      value: gallery_tag,
      options: [{
        label: (0,external_wp_i18n_.__)('Select…', 'video-embed-thumbnail-generator'),
        value: ''
      }, ...mapTermsToOptions(tags)],
      onChange: attributeChangeFactory('gallery_tag')
    })]
  });
}
;// ./src/components/InspectorControls/CollectionQuerySettings.js






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
  const baseGalleryOrderbyOptions = (0,external_wp_element_.useMemo)(() => [{
    value: 'post_date',
    label: (0,external_wp_i18n_.__)('Date', 'video-embed-thumbnail-generator')
  }, {
    value: 'menu_order',
    label: (0,external_wp_i18n_.__)('Default', 'video-embed-thumbnail-generator')
  }, {
    value: 'title',
    label: (0,external_wp_i18n_.__)('Title', 'video-embed-thumbnail-generator')
  }, {
    value: 'rand',
    label: (0,external_wp_i18n_.__)('Random', 'video-embed-thumbnail-generator')
  }, {
    value: 'ID',
    label: (0,external_wp_i18n_.__)('Video ID', 'video-embed-thumbnail-generator')
  }], []);
  const orderbyOptions = (0,external_wp_element_.useMemo)(() => {
    if (gallery_include) {
      return [...baseGalleryOrderbyOptions, {
        value: 'include',
        label: (0,external_wp_i18n_.__)('Manually Sorted', 'video-embed-thumbnail-generator')
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
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(QuerySettings, {
      attributes: attributes,
      setAttributes: setAttributes,
      queryData: queryData,
      showArchiveSource: isSiteEditor,
      showManualSource: showManualSource
    }), gallery_source === 'archive' && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
      label: (0,external_wp_i18n_.__)('Prioritize Post Data', 'video-embed-thumbnail-generator'),
      help: (0,external_wp_i18n_.__)('Use the title and date from the original post instead of the video attachment.', 'video-embed-thumbnail-generator'),
      checked: !!attributes.prioritizePostData,
      onChange: val => setAttributes({
        prioritizePostData: val
      })
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      className: "videopack-sort-control-wrapper",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
        label: (0,external_wp_i18n_.__)('Sort by', 'video-embed-thumbnail-generator'),
        value: gallery_orderby,
        onChange: val => setAttributes({
          gallery_orderby: val
        }),
        options: orderbyOptions
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
        icon: gallery_order === 'asc' ? icon.sortAscending : icon.sortDescending,
        label: gallery_order === 'asc' ? (0,external_wp_i18n_.__)('Ascending', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_.__)('Descending', 'video-embed-thumbnail-generator'),
        onClick: () => setAttributes({
          gallery_order: gallery_order === 'asc' ? 'desc' : 'asc'
        }),
        showTooltip: true
      })]
    }), !!gallery_pagination || !!hasPaginationBlock ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.TextControl, {
      label: (0,external_wp_i18n_.__)('Number of videos per page', 'video-embed-thumbnail-generator'),
      type: "number",
      value: gallery_per_page ?? '',
      placeholder: options.gallery_per_page,
      onChange: val => updateNumericAttribute('gallery_per_page', val)
    }) : /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
        __nextHasNoMarginBottom: true,
        label: (0,external_wp_i18n_.__)('Limit number of videos', 'video-embed-thumbnail-generator'),
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
      }), !!enable_collection_video_limit && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.TextControl, {
        __nextHasNoMarginBottom: true,
        __next40pxDefaultSize: true,
        label: (0,external_wp_i18n_.__)('Video Limit', 'video-embed-thumbnail-generator'),
        help: (0,external_wp_i18n_.__)('Maximum number of videos to show when pagination is disabled.', 'video-embed-thumbnail-generator'),
        type: "number",
        value: Number(collection_video_limit) === -1 ? 12 : collection_video_limit ?? '',
        onChange: val => updateNumericAttribute('collection_video_limit', val)
      })]
    }), !hasPaginationBlock && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
      __nextHasNoMarginBottom: true,
      label: (0,external_wp_i18n_.__)('Enable Pagination', 'video-embed-thumbnail-generator'),
      checked: !!gallery_pagination,
      onChange: val => setAttributes({
        gallery_pagination: val
      })
    })]
  });
}
;// ./src/components/InspectorControls/CollectionFilterSettings.js





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
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
    className: "videopack-excluded-videos",
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("p", {
      children: (0,external_wp_i18n_.__)('Excluded Videos', 'video-embed-thumbnail-generator')
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
      className: "videopack-excluded-list",
      children: excludedVideos.map(video => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-excluded-item",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
          className: "videopack-excluded-thumbnail",
          children: video.meta?.['_videopack-meta']?.poster ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("img", {
            src: video.meta['_videopack-meta'].poster,
            alt: (0,external_wp_htmlEntities_.decodeEntities)(video.title.rendered)
          }) : /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Icon, {
            icon: "format-video"
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
          className: "videopack-excluded-title",
          children: (0,external_wp_htmlEntities_.decodeEntities)(video.title.rendered)
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
          icon: close_default,
          onClick: () => handleUnexcludeItem(video.id),
          label: (0,external_wp_i18n_.__)('Restore', 'video-embed-thumbnail-generator'),
          className: "videopack-restore-item",
          showTooltip: true
        })]
      }, video.id))
    })]
  });
}
;// ./src/components/InspectorControls/CollectionLayoutSettings.js



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
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.TextControl, {
      label: (0,external_wp_i18n_.__)('Max Columns', 'video-embed-thumbnail-generator'),
      type: "number",
      value: gallery_columns ?? '',
      onChange: val => updateNumericAttribute('gallery_columns', val)
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
      __nextHasNoMarginBottom: true,
      label: (0,external_wp_i18n_.__)('Title overlay', 'video-embed-thumbnail-generator'),
      onChange: val => setAttributes({
        overlay_title: val
      }),
      checked: overlay_title ?? !!options.overlay_title
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
      __nextHasNoMarginBottom: true,
      __next40pxDefaultSize: true,
      label: (0,external_wp_i18n_.__)('When current video ends', 'video-embed-thumbnail-generator'),
      value: gallery_end,
      onChange: val => setAttributes({
        gallery_end: val
      }),
      options: [{
        label: (0,external_wp_i18n_.__)('Stop and leave popup window open', 'video-embed-thumbnail-generator'),
        value: ''
      }, {
        label: (0,external_wp_i18n_.__)('Autoplay next video', 'video-embed-thumbnail-generator'),
        value: 'next'
      }, {
        label: (0,external_wp_i18n_.__)('Close popup window', 'video-embed-thumbnail-generator'),
        value: 'close'
      }]
    })]
  });
}
;// ./src/components/InspectorControls/CollectionColorSettings.js






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
  const effectiveValues = (0,external_wp_element_.useMemo)(() => ({
    ...options,
    ...attributes
  }), [options, attributes]);
  const colorFallbacks = (0,external_wp_element_.useMemo)(() => getColorFallbacks(effectiveValues), [effectiveValues]);
  const THEME_COLORS = videopack_config?.themeColors || options?.themeColors;
  const isGalleryOrList = blockType === 'gallery' || blockType === 'list' || blockType === 'grid';
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
    children: [isGalleryOrList && showSkinSettings && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
      className: "videopack-skin-section",
      style: {
        marginBottom: '16px'
      },
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.SelectControl, {
        label: (0,external_wp_i18n_.__)('Player Skin', 'video-embed-thumbnail-generator'),
        value: skin || options.skin || '',
        options: [{
          label: (0,external_wp_i18n_.__)('Videopack', 'video-embed-thumbnail-generator'),
          value: 'vjs-theme-videopack'
        }, {
          label: (0,external_wp_i18n_.__)('Videopack Classic', 'video-embed-thumbnail-generator'),
          value: 'kg-video-js-skin'
        }, {
          label: (0,external_wp_i18n_.__)('Video.js default', 'video-embed-thumbnail-generator'),
          value: 'default'
        }, {
          label: (0,external_wp_i18n_.__)('City', 'video-embed-thumbnail-generator'),
          value: 'vjs-theme-city'
        }, {
          label: (0,external_wp_i18n_.__)('Fantasy', 'video-embed-thumbnail-generator'),
          value: 'vjs-theme-fantasy'
        }, {
          label: (0,external_wp_i18n_.__)('Forest', 'video-embed-thumbnail-generator'),
          value: 'vjs-theme-forest'
        }, {
          label: (0,external_wp_i18n_.__)('Sea', 'video-embed-thumbnail-generator'),
          value: 'vjs-theme-sea'
        }],
        onChange: value => setAttributes({
          skin: value
        })
      })
    }), isGalleryOrList && showTitleSettings && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      className: "videopack-color-section",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("p", {
        className: "videopack-settings-section-title",
        children: (0,external_wp_i18n_.__)('Titles', 'video-embed-thumbnail-generator')
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-color-flex-row",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
          className: "videopack-color-flex-item",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker_CompactColorPicker, {
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
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker_CompactColorPicker, {
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
    }), isGalleryOrList && showPlayerSettings && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      className: "videopack-color-section",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("p", {
        className: "videopack-settings-section-title",
        children: (0,external_wp_i18n_.__)('Player', 'video-embed-thumbnail-generator')
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-color-flex-row",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
          className: "videopack-color-flex-item",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker_CompactColorPicker, {
            label: (0,external_wp_i18n_.__)('Play Button Icon', 'video-embed-thumbnail-generator'),
            value: play_button_color,
            onChange: value => setAttributes({
              play_button_color: value
            }),
            colors: THEME_COLORS,
            fallbackValue: colorFallbacks.play_button_color
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
          className: "videopack-color-flex-item",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker_CompactColorPicker, {
            label: (0,external_wp_i18n_.__)('Play Button Accent', 'video-embed-thumbnail-generator'),
            value: play_button_secondary_color,
            onChange: value => setAttributes({
              play_button_secondary_color: value
            }),
            colors: THEME_COLORS,
            fallbackValue: colorFallbacks.play_button_secondary_color
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
          className: "videopack-color-flex-item",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker_CompactColorPicker, {
            label: (0,external_wp_i18n_.__)('Control Bar Background', 'video-embed-thumbnail-generator'),
            value: control_bar_bg_color,
            onChange: value => setAttributes({
              control_bar_bg_color: value
            }),
            colors: THEME_COLORS,
            fallbackValue: colorFallbacks.control_bar_bg_color
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
          className: "videopack-color-flex-item",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker_CompactColorPicker, {
            label: (0,external_wp_i18n_.__)('Control Bar Icons', 'video-embed-thumbnail-generator'),
            value: control_bar_color,
            onChange: value => setAttributes({
              control_bar_color: value
            }),
            colors: THEME_COLORS,
            fallbackValue: colorFallbacks.control_bar_color
          })
        })]
      })]
    }), showPaginationSettings && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      className: "videopack-color-section",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("p", {
        className: "videopack-settings-section-title",
        children: (0,external_wp_i18n_.__)('Pagination', 'video-embed-thumbnail-generator')
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-color-flex-row is-pagination",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
          className: "videopack-color-flex-item",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker_CompactColorPicker, {
            label: (0,external_wp_i18n_.__)('Outline/Text', 'video-embed-thumbnail-generator'),
            value: pagination_color,
            onChange: value => setAttributes({
              pagination_color: value
            }),
            colors: THEME_COLORS,
            fallbackValue: colorFallbacks.pagination_color
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
          className: "videopack-color-flex-item",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker_CompactColorPicker, {
            label: (0,external_wp_i18n_.__)('Background', 'video-embed-thumbnail-generator'),
            value: pagination_background_color,
            onChange: value => setAttributes({
              pagination_background_color: value
            }),
            colors: THEME_COLORS,
            fallbackValue: colorFallbacks.pagination_background_color
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
          className: "videopack-color-flex-item",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker_CompactColorPicker, {
            label: (0,external_wp_i18n_.__)('Active Background', 'video-embed-thumbnail-generator'),
            value: pagination_active_bg_color,
            onChange: value => setAttributes({
              pagination_active_bg_color: value
            }),
            colors: THEME_COLORS,
            fallbackValue: colorFallbacks.pagination_active_bg_color
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
          className: "videopack-color-flex-item",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker_CompactColorPicker, {
            label: (0,external_wp_i18n_.__)('Active Text', 'video-embed-thumbnail-generator'),
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
;// ./src/components/InspectorControls/CollectionSettingsPanel.js








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
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
      title: showGalleryOptions ? (0,external_wp_i18n_.__)('Query Settings', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_.__)('List Settings', 'video-embed-thumbnail-generator'),
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CollectionQuerySettings, {
        attributes: attributes,
        setAttributes: setAttributes,
        queryData: queryData,
        options: options,
        showManualSource: showManualSource,
        isSiteEditor: isSiteEditor,
        hasPaginationBlock: hasPaginationBlock
      }), excludedVideos && excludedVideos.length > 0 && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CollectionFilterSettings, {
        attributes: attributes,
        setAttributes: setAttributes,
        queryData: queryData
      })]
    }), showLayoutSettings && showGalleryOptions && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelBody, {
      title: (0,external_wp_i18n_.__)('Layout Settings', 'video-embed-thumbnail-generator'),
      initialOpen: showGalleryOptions,
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CollectionLayoutSettings, {
        attributes: attributes,
        setAttributes: setAttributes,
        options: options
      })
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.PanelBody, {
      title: (0,external_wp_i18n_.__)('Colors', 'video-embed-thumbnail-generator'),
      initialOpen: true,
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CollectionColorSettings, {
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
// EXTERNAL MODULE: external ["wp","data"]
var external_wp_data_ = __webpack_require__(143);
// EXTERNAL MODULE: external ["wp","url"]
var external_wp_url_ = __webpack_require__(832);
;// ./src/api/thumbnails.js
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
        formData.append('post_name', (0,external_wp_url_.getFilename)(videoSrc));
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
    return await external_wp_apiFetch_default()({
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
    return await external_wp_apiFetch_default()({
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
    return await external_wp_apiFetch_default()({
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
    const path = (0,external_wp_url_.addQueryArgs)('/videopack/v1/thumbs', query);
    return await external_wp_apiFetch_default()({
      path,
      parse: false
    });
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw error;
  }
};
// EXTERNAL MODULE: ./src/api/gallery.js
var gallery = __webpack_require__(533);
;// ./src/api/media.js
/* unused harmony import specifier */ var apiFetch;
/* unused harmony import specifier */ var addQueryArgs;
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
    return await external_wp_apiFetch_default()({
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
    return await external_wp_apiFetch_default()({
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
    return await external_wp_apiFetch_default()({
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
    return await apiFetch({
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
    return await apiFetch({
      path: addQueryArgs('/videopack/v1/batch/progress', {
        type
      })
    });
  } catch (error) {
    console.error(`Error fetching ${type} batch progress:`, error);
    throw error;
  }
};
/**
 * Downloads the browser encoder assets (ffmpeg.wasm) to the local server.
 */
const downloadBrowserEncoderAssets = async () => {
  try {
    return await apiFetch({
      path: '/videopack/v1/browser-encoder/download-assets',
      method: 'POST'
    });
  } catch (error) {
    console.error('Error downloading browser encoder assets:', error);
    throw error;
  }
};

/**
 * Deletes the browser encoder assets from the local server.
 */
const deleteBrowserEncoderAssets = async () => {
  try {
    return await apiFetch({
      path: '/videopack/v1/browser-encoder/delete-assets',
      method: 'POST'
    });
  } catch (error) {
    console.error('Error deleting browser encoder assets:', error);
    throw error;
  }
};
;// ./src/api/jobs.js
/* unused harmony import specifier */ var jobs_apiFetch;
/* unused harmony import specifier */ var jobs_addQueryArgs;
/* unused harmony import specifier */ var applyFilters;
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
    return await jobs_apiFetch({
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
    return await jobs_apiFetch({
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
    return await external_wp_apiFetch_default()({
      path: (0,external_wp_url_.addQueryArgs)(`/videopack/v1/jobs/${jobId}`, {
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
    return await jobs_apiFetch({
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
    return await jobs_apiFetch({
      path: jobs_addQueryArgs(`/videopack/v1/jobs/${jobId}`, {
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
    return await external_wp_apiFetch_default()({
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
    return await jobs_apiFetch({
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
    const path = input ? (0,external_wp_url_.addQueryArgs)('/videopack/v1/jobs', {
      input
    }) : '/videopack/v1/jobs';
    return await external_wp_apiFetch_default()({
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
    return await jobs_apiFetch({
      path: `/videopack/v1/browser-queue/job/${jobId}/reset`,
      method: 'POST'
    });
  } catch (error) {
    console.error('Error resetting job:', error);
    throw error;
  }
};
;// ./node_modules/@wordpress/icons/build-module/library/chevron-up.mjs
// packages/icons/src/library/chevron-up.tsx


var chevron_up_default = /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.Path, { d: "M6.5 12.4L12 8l5.5 4.4-.9 1.2L12 10l-4.5 3.6-1-1.2z" }) });

//# sourceMappingURL=chevron-up.mjs.map

;// ./node_modules/@wordpress/icons/build-module/library/chevron-down.mjs
// packages/icons/src/library/chevron-down.tsx


var chevron_down_default = /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.Path, { d: "M17.5 11.6L12 16l-5.5-4.4.9-1.2L12 14l4.5-3.6 1 1.2z" }) });

//# sourceMappingURL=chevron-down.mjs.map

;// ./node_modules/@wordpress/icons/build-module/library/external.mjs
// packages/icons/src/library/external.tsx


var external_default = /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.Path, { d: "M19.5 4.5h-7V6h4.44l-5.97 5.97 1.06 1.06L18 7.06v4.44h1.5v-7Zm-13 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3H17v3a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h3V5.5h-3Z" }) });

//# sourceMappingURL=external.mjs.map

;// ./src/components/Thumbnails/VideoPlayerInner.js






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
  const localPanelRef = (0,external_wp_element_.useRef)();
  const containerRef = panelRef || localPanelRef;
  const [duration, setDuration] = (0,external_wp_element_.useState)(videoRef.current?.duration || 0);
  const onLoadedMetadata = event => {
    setDuration(event.target.duration);
  };
  (0,external_wp_element_.useEffect)(() => {
    if (videoRef.current?.duration) {
      setDuration(videoRef.current.duration);
    }
  }, [videoRef]);
  (0,external_wp_element_.useEffect)(() => {
    if ((isModal || containerRef === panelRef) && containerRef?.current) {
      // Trigger a small delay to ensure the panel is visible/ready before focusing
      const timer = setTimeout(() => {
        containerRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isModal, panelRef, containerRef]);
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
    className: `videopack-thumb-video-panel spinner-container${isSaving ? ' saving' : ''} ${isModal ? 'is-modal' : ''} ${disabled ? 'disabled' : ''}`,
    tabIndex: 0,
    ref: containerRef,
    onKeyDown: onKeyDown,
    role: "button",
    "aria-label": (0,external_wp_i18n_.__)('Video Player', 'video-embed-thumbnail-generator'),
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("video", {
      src: src,
      ref: videoRef,
      muted: true,
      preload: "metadata",
      onClick: () => togglePlayback(videoRef),
      onLoadedMetadata: onLoadedMetadata,
      onLoadedData: onLoadedData,
      role: "button",
      "aria-label": (0,external_wp_i18n_.__)('Toggle Playback', 'video-embed-thumbnail-generator'),
      tabIndex: "-1"
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      className: "videopack-thumb-video-controls",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
        className: "videopack-play-pause",
        onClick: () => togglePlayback(videoRef),
        disabled: disabled,
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Icon, {
          icon: isPlaying ? icon.pause : icon.play
        })
      }), duration > 0 && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.RangeControl, {
        __nextHasNoMarginBottom: true,
        min: 0,
        max: duration,
        step: "any",
        initialPosition: 0,
        value: currentTime || 0,
        onChange: val => handleSliderChange(val, videoRef),
        className: "videopack-thumbvideo-slider",
        type: "slider"
      }), !isModal && onPopOut && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
        className: "videopack-popout",
        onClick: onPopOut,
        icon: external_default,
        label: (0,external_wp_i18n_.__)('Open in larger window', 'video-embed-thumbnail-generator'),
        showTooltip: true,
        disabled: disabled
      })]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
      variant: "secondary",
      onClick: () => handleUseThisFrame(videoRef),
      className: "videopack-use-this-frame",
      disabled: isSaving || disabled,
      children: (0,external_wp_i18n_.__)('Use this frame', 'video-embed-thumbnail-generator')
    }), isSaving && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Spinner, {})]
  });
};
/* harmony default export */ const Thumbnails_VideoPlayerInner = (VideoPlayerInner);
;// ./src/components/Thumbnails/Thumbnails.js
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
  const thumbVideoPanel = (0,external_wp_element_.useRef)();
  const videoRef = (0,external_wp_element_.useRef)();
  const modalVideoRef = (0,external_wp_element_.useRef)();
  const posterImageButton = (0,external_wp_element_.useRef)();
  const [isPlaying, setIsPlaying] = (0,external_wp_element_.useState)(false);
  const [isOpened, setIsOpened] = (0,external_wp_element_.useState)(false);
  const [currentTime, setCurrentTime] = (0,external_wp_element_.useState)(false);
  const [thumbChoices, setThumbChoices] = (0,external_wp_element_.useState)([]);
  const [isSaving, setIsSaving] = (0,external_wp_element_.useState)(false);
  const [isModalOpen, setIsModalOpen] = (0,external_wp_element_.useState)(false);
  const [spriteMessage, setSpriteMessage] = (0,external_wp_element_.useState)(null);
  const [cloudJobs, setCloudJobs] = (0,external_wp_element_.useState)([]);
  const [existingSprite, setExistingSprite] = (0,external_wp_element_.useState)(null); // { id, url, status }
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = (0,external_wp_element_.useState)(false);
  const [isDeleting, setIsDeleting] = (0,external_wp_element_.useState)(false);
  const [showFailedNotice, setShowFailedNotice] = (0,external_wp_element_.useState)(true);

  // Poll for active thumbnail jobs if any exist
  (0,external_wp_element_.useEffect)(() => {
    let pollInterval;
    const checkJobs = async () => {
      try {
        const jobs = await listJobs(id);
        const activeThumbnailJobs = jobs.filter(job => (job.format_id === 'thumbnail' || job.format_id === 'thumbnail_sprite') && ['queued', 'processing', 'encoding', 'cloud_encoding'].includes(job.status));
        setCloudJobs(activeThumbnailJobs);
        if (activeThumbnailJobs.length === 0 && cloudJobs.length > 0) {
          fetchSpriteStatus();
          // Jobs just finished, maybe refresh the poster if it was just set
          if (id) {
            // Optionally trigger a refresh of videoData if needed
          }
        }
      } catch (error) {
        console.error('Error polling jobs:', error);
      }
    };
    if (id) {
      checkJobs();
      pollInterval = setInterval(checkJobs, 10000); // Poll every 10 seconds
    }
    return () => clearInterval(pollInterval);
  }, [id, cloudJobs.length, fetchSpriteStatus]);
  const fetchSpriteStatus = (0,external_wp_element_.useCallback)(async () => {
    if (!id || !src) {
      return;
    }
    try {
      const formats = await (0,gallery/* getVideoFormats */.EA)(id, src, probedMetadata);
      const spriteFormat = formats.thumbnail_sprite;
      console.log('Sprite detection:', {
        id,
        spriteFormat
      });
      if (spriteFormat && spriteFormat.exists) {
        setExistingSprite({
          id: spriteFormat.id,
          url: spriteFormat.url,
          status: spriteFormat.status
        });
      } else {
        setExistingSprite(null);
      }
    } catch (error) {
      console.error('Error fetching sprite status:', error);
    }
  }, [id, src, probedMetadata]);
  (0,external_wp_element_.useEffect)(() => {
    fetchSpriteStatus();
  }, [fetchSpriteStatus]);
  const {
    active_encoder = 'ffmpeg'
  } = options;
  const effectiveFfmpegExists = active_encoder !== 'ffmpeg' && (!!videopack_config.isTranscodingServiceReady || !!videopack_config.is_pro) || !!videopack_config.ffmpeg_exists && videopack_config.ffmpeg_exists !== 'notinstalled';
  const ffmpegExists = effectiveFfmpegExists;
  const {
    editPost
  } = (0,external_wp_data_.useDispatch)('core/editor') || {};
  const isEditingAttachment = (0,external_wp_data_.useSelect)(select => select('core/editor')?.getCurrentPostType() === 'attachment', []);
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
  (0,external_wp_element_.useEffect)(() => {
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
  (0,external_wp_element_.useEffect)(() => {
    if (spriteMessage && spriteMessage.type !== 'error') {
      const timer = setTimeout(() => {
        setSpriteMessage(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [spriteMessage]);
  function onSelectPoster(image) {
    setAttributes({
      ...attributes,
      poster: image.url,
      poster_id: Number(image.id)
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
    const browserThumbnailsEnabled = videopack_config.browser_thumbnails;
    if (!browserThumbnailsEnabled && !!ffmpegExists) {
      // Browser thumbnails explicitly disabled, use FFmpeg directly
      const newThumbImages = [];
      let workingId = Number(id);
      for (let i = 1; i <= Number(total_thumbnails); i++) {
        const response = await generateThumb(i, type, workingId, featured);
        if (response?.status === 'cloud_queued') {
          setSpriteMessage({
            type: 'success',
            text: (0,external_wp_i18n_.__)('Thumbnail generation enqueued in the cloud. This may take a few minutes.', 'video-embed-thumbnail-generator')
          });
          setIsSaving(false);
          return;
        }
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
  const [spriteTiles, setSpriteTiles] = (0,external_wp_element_.useState)([]);
  const handleGenerateSprite = async () => {
    setIsSaving(true);
    setSpriteTiles([]);
    const browserThumbnailsEnabled = videopack_config.browser_thumbnails;
    const rawFfmpegExists = !!videopack_config.ffmpeg_exists && videopack_config.ffmpeg_exists !== 'notinstalled';
    const activeEncoderIsCloud = active_encoder !== 'ffmpeg' && (!!videopack_config.isTranscodingServiceReady || !!videopack_config.is_pro);
    if (!browserThumbnailsEnabled && rawFfmpegExists && !activeEncoderIsCloud) {
      try {
        const activeId = id || 0;
        await enqueueJob(activeId, src, {
          thumbnail_sprite: true
        }, parentId);
        let successMsg = (0,external_wp_i18n_.__)('Sprite generation enqueued. Check Additional Formats panel for progress.', 'video-embed-thumbnail-generator');
        if (videopack_config.active_encoder === 'browser') {
          successMsg = /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("p", {
              children: successMsg
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("p", {
              children: [(0,external_wp_i18n_.__)('Browser encoding is active. Processing will only occur while the Videopack Queue page is open.', 'video-embed-thumbnail-generator'), ' ', /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("a", {
                href: videopack_config.queue_url,
                children: (0,external_wp_i18n_.__)('Go to Queue Page', 'video-embed-thumbnail-generator')
              })]
            })]
          });
        }
        setSpriteMessage({
          type: 'success',
          text: successMsg
        });
        // If we have an Additional Formats panel nearby, it will handle polling.
        fetchSpriteStatus(); // Initial check after enqueue
      } catch (error) {
        console.error('Sprite enqueue failed', error);
        setSpriteMessage({
          type: 'error',
          text: (0,external_wp_i18n_.__)('Error: Failed to enqueue sprite generation.', 'video-embed-thumbnail-generator')
        });
      } finally {
        setIsSaving(false);
      }
      return;
    }
    const tileWidth = 160;
    const columns = 10;
    const targetCount = 100;
    const duration = videoRef.current.duration;
    const spriteInterval = Math.max(1.0, duration / targetCount);
    const totalTiles = Math.ceil(duration / spriteInterval);
    const timePoints = [];
    for (let i = 0; i < totalTiles; i++) {
      timePoints.push(i * spriteInterval);
    }
    const canvases = [];
    try {
      for (const time of timePoints) {
        const canvas = await captureVideoFrame(src, time, options?.ffmpeg_thumb_watermark || {});
        // Resize canvas to tileWidth
        const tileCanvas = document.createElement('canvas');
        tileCanvas.width = tileWidth;
        tileCanvas.height = tileWidth * canvas.height / canvas.width;
        const tctx = tileCanvas.getContext('2d');
        tctx.drawImage(canvas, 0, 0, tileCanvas.width, tileCanvas.height);
        canvases.push(tileCanvas);
        setSpriteTiles(prev => [...prev, tileCanvas.toDataURL('image/jpeg', 0.6)]);
      }
      const rows = Math.ceil(canvases.length / columns);
      const tileHeight = canvases[0].height;
      const spriteCanvas = document.createElement('canvas');
      spriteCanvas.width = tileWidth * columns;
      spriteCanvas.height = tileHeight * rows;
      const ctx = spriteCanvas.getContext('2d');
      canvases.forEach((canvas, index) => {
        const x = index % columns * tileWidth;
        const y = Math.floor(index / columns) * tileHeight;
        ctx.drawImage(canvas, x, y);
      });
      await createThumbnailFromCanvas(spriteCanvas, id, src, parentId, false, {
        is_sprite: true,
        interval: spriteInterval,
        total_tiles: canvases.length,
        width: tileWidth,
        set_poster: false,
        filename_suffix: '_thumbnail-sprite'
      });
      fetchSpriteStatus();
    } catch (error) {
      console.error('Sprite generation failed', error);
    } finally {
      setIsSaving(false);
      setSpriteTiles([]);
    }
  };
  const handleDeleteSprite = async () => {
    if (!existingSprite || !existingSprite.id) {
      return;
    }
    setIsConfirmDeleteOpen(false);
    setIsDeleting(true);
    try {
      await deleteFile(existingSprite.id);
      setExistingSprite(null);
      setSpriteMessage({
        type: 'success',
        text: (0,external_wp_i18n_.__)('Sprite sheet deleted successfully.', 'video-embed-thumbnail-generator')
      });
    } catch (error) {
      console.error('Failed to delete sprite:', error);
      setSpriteMessage({
        type: 'error',
        text: (0,external_wp_i18n_.__)('Error: Failed to delete sprite sheet.', 'video-embed-thumbnail-generator')
      });
    } finally {
      setIsDeleting(false);
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
  const generateThumb = (0,external_wp_element_.useCallback)(async (i, type, forceId = null, forceFeatured = null, time = null) => {
    try {
      const response = await generateThumbnail(src, total_thumbnails, i, forceId !== null ? forceId : id, type, parentId, forceFeatured !== null ? forceFeatured : featured, time);
      if (response.status === 202) {
        return {
          status: 'cloud_queued'
        };
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
    }
  }, [src, total_thumbnails, id, parentId, featured]);
  const generateThumbCanvases = (0,external_wp_element_.useCallback)(async type => {
    const thumbsInt = Number(total_thumbnails);
    const newThumbCanvases = [];
    let workingId = parseInt(id, 10) || 0;
    const timePoints = calculateTimecodes(videoRef.current.duration, thumbsInt, {
      random: type === 'random'
    });
    for (let i = 0; i < timePoints.length; i++) {
      const time = timePoints[i];
      const index = i + 1;
      let thumb;
      try {
        let canvas;
        if (!canvasTainted) {
          canvas = await captureVideoFrame(src, time, options?.ffmpeg_thumb_watermark || {});
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
            if (response?.status === 'cloud_queued') {
              setSpriteMessage({
                type: 'success',
                text: (0,external_wp_i18n_.__)('Thumbnail generation enqueued in the cloud. This may take a few minutes.', 'video-embed-thumbnail-generator')
              });
              setIsSaving(false);
              return; // Stop the loop, it's offloaded to cloud
            }
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
  (0,external_wp_element_.useEffect)(() => {
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

  (0,external_wp_element_.useEffect)(() => {
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
        return createThumbnailFromCanvas(thumb.canvasObject, id, src, parentId, featured);
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
        const response = await saveAllThumbnails(id, thumbUrls, parentId, src, featured);
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
      const response = await createThumbnailFromCanvas(canvasObject, id, src, parentId, featured);
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
      const existingMeta = videoData?.record?.meta?.['_videopack-meta'] || {};
      const metaData = {
        '_kgflashmediaplayer-poster': new_poster || '',
        '_kgflashmediaplayer-poster-id': new_poster_id ? Number(new_poster_id) : 0,
        '_videopack-meta': {
          ...existingMeta,
          poster: new_poster || '',
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
        await external_wp_apiFetch_default()({
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
        poster: new_poster || undefined,
        poster_id: new_poster_id || undefined
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
      const response = await setPosterImage(id, thumb_url, parentId, src, featured);
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
          if (response?.status === 'cloud_queued') {
            setSpriteMessage({
              type: 'success',
              text: (0,external_wp_i18n_.__)('Thumbnail generation enqueued in the cloud. This may take a few minutes.', 'video-embed-thumbnail-generator')
            });
            setIsSaving(false);
          } else if (response?.real_thumb_url) {
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
    const browserThumbnailsEnabled = videopack_config.browser_thumbnails;
    if (!browserThumbnailsEnabled || canvasTainted) {
      await runFfmpegFallback();
      return;
    }
    try {
      const canvas = await captureVideoFrame(ref.current, ref.current.currentTime, options?.ffmpeg_thumb_watermark || {});
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
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
    className: "videopack-thumbnail-generator",
    children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
      title: (0,external_wp_i18n_.__)('Thumbnails', 'video-embed-thumbnail-generator'),
      children: [showFailedNotice && Number(videoData?.record?.meta?._videopack_browser_thumb_failed) === 1 && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Notice, {
        status: "error",
        onRemove: () => setShowFailedNotice(false),
        isDismissible: true,
        children: (0,external_wp_i18n_.__)('Automatic in-browser thumbnail generation failed for this video (possibly due to CORS or canvas limitations). You can try generating thumbnails manually below.', 'video-embed-thumbnail-generator')
      }), poster && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("img", {
        className: "videopack-current-thumbnail",
        src: poster,
        alt: (0,external_wp_i18n_.__)('Current Thumbnail', 'video-embed-thumbnail-generator')
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.BaseControl, {
        className: "editor-video-poster-control",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.BaseControl.VisualLabel, {
          children: (0,external_wp_i18n_.__)('Video Thumbnail', 'video-embed-thumbnail-generator')
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_mediaUtils_namespaceObject.MediaUpload, {
          title: (0,external_wp_i18n_.__)('Select video thumbnail', 'video-embed-thumbnail-generator'),
          onSelect: onSelectPoster,
          allowedTypes: VIDEO_POSTER_ALLOWED_MEDIA_TYPES,
          render: ({
            open
          }) => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
            variant: "secondary",
            onClick: open,
            ref: posterImageButton,
            children: !poster ? (0,external_wp_i18n_.__)('Select', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_.__)('Replace', 'video-embed-thumbnail-generator')
          })
        }), !!poster && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
          onClick: onRemovePoster,
          variant: "tertiary",
          children: (0,external_wp_i18n_.__)('Remove', 'video-embed-thumbnail-generator')
        })]
      }), cloudJobs.length > 0 && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-active-jobs",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Spinner, {}), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("p", {
          children: (0,external_wp_i18n_.__)('Cloud thumbnail generation in progress…', 'video-embed-thumbnail-generator')
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.ToggleControl, {
        label: (0,external_wp_i18n_.__)("Set as post's featured image", 'video-embed-thumbnail-generator'),
        checked: !!featured,
        onChange: value => {
          setAttributes({
            ...attributes,
            featured: value
          });
        }
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-generation-controls",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.__experimentalNumberControl, {
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
          label: (0,external_wp_i18n_.__)('Total', 'video-embed-thumbnail-generator'),
          hideLabelFromVision: true
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "videopack-generation-actions",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
            variant: "secondary",
            onClick: () => handleGenerate('generate'),
            className: "videopack-generate",
            disabled: isSaving || (canvasTainted || isProbing) && !ffmpegExists,
            children: (0,external_wp_i18n_.__)('Generate', 'video-embed-thumbnail-generator')
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
            variant: "secondary",
            onClick: () => handleGenerate('random'),
            className: "videopack-generate",
            disabled: isSaving || (canvasTainted || isProbing) && !ffmpegExists,
            children: (0,external_wp_i18n_.__)('Random', 'video-embed-thumbnail-generator')
          }), videopack_config.is_pro && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
            variant: "secondary",
            onClick: existingSprite ? () => setIsConfirmDeleteOpen(true) : handleGenerateSprite,
            className: existingSprite ? 'videopack-delete-sprite' : 'videopack-generate-sprite',
            disabled: isSaving || isProbing || canvasTainted && !ffmpegExists || isDeleting,
            isBusy: isDeleting,
            isDestructive: !!existingSprite,
            children: existingSprite ? (0,external_wp_i18n_.__)('Delete Sprite', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_.__)('Sprite', 'video-embed-thumbnail-generator')
          })]
        })]
      }), spriteMessage && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Notice, {
        status: spriteMessage.type,
        onRemove: () => setSpriteMessage(null),
        isDismissible: true,
        className: "videopack-sprite-notice",
        children: spriteMessage.text
      }), canvasTainted && !isProbing && !ffmpegExists && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "videopack-security-error-notice",
        children: (0,external_wp_i18n_.__)('Cross-origin resource sharing (CORS) policy on the external server is preventing thumbnail generation.', 'video-embed-thumbnail-generator')
      }), spriteTiles.length > 0 && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-sprite-generation-preview",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("p", {
          children: (0,external_wp_i18n_.sprintf)(/* translators: %d is the number of tiles captured */
          (0,external_wp_i18n_.__)('Capturing sprite tiles… (%d)', 'video-embed-thumbnail-generator'), spriteTiles.length)
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
          className: "videopack-sprite-tiles-grid",
          children: spriteTiles.map((tileSrc, index) => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("img", {
            src: tileSrc,
            alt: ""
          }, index))
        })]
      }), thumbChoices.length > 0 && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
        variant: "primary",
        onClick: handleSaveAllThumbnails,
        disabled: isSaving,
        children: (0,external_wp_i18n_.__)('Save All', 'video-embed-thumbnail-generator')
      }), thumbChoices.length > 0 && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: `videopack-thumbnail-holder${isSaving ? ' disabled' : ''}`,
        children: thumbChoices.map((thumb, index) => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("button", {
          type: "button",
          className: 'videopack-thumbnail spinner-container',
          onClick: event => {
            handleSaveThumbnail(event, thumb, index);
          },
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("img", {
            src: thumb.src,
            alt: (0,external_wp_i18n_.sprintf)(/* translators: %d is the thumbnail index */
            (0,external_wp_i18n_.__)('Thumbnail %d', 'video-embed-thumbnail-generator'), index + 1),
            title: (0,external_wp_i18n_.__)('Save and set thumbnail', 'video-embed-thumbnail-generator')
          }), isSaving && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Spinner, {})]
        }, index))
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: `components-panel__body videopack-thumb-video ${isOpened ? 'is-opened' : ''}`,
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("h2", {
          className: "components-panel__body-title",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("button", {
            className: "components-button components-panel__body-toggle",
            type: "button",
            onClick: handleToggleVideoPlayer,
            "aria-expanded": isOpened,
            disabled: (canvasTainted || isProbing) && !ffmpegExists,
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
              "aria-hidden": "true",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Icon, {
                className: "components-panel__arrow",
                icon: isOpened ? chevron_up_default : chevron_down_default
              })
            }), (0,external_wp_i18n_.__)('Choose From Video', 'video-embed-thumbnail-generator'), canvasTainted && !isProbing && !ffmpegExists && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Icon, {
              icon: chevron_up_default,
              style: {
                display: 'none'
              }
            })]
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
          className: `videopack-thumb-video-container ${isOpened ? 'is-opened' : ''} ${(canvasTainted || isProbing) && !ffmpegExists ? 'disabled' : ''}`,
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(Thumbnails_VideoPlayerInner, {
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
      }), isModalOpen && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Modal, {
        title: (0,external_wp_i18n_.__)('Choose From Video', 'video-embed-thumbnail-generator'),
        onRequestClose: handleCloseModal,
        className: "videopack-video-modal",
        overlayClassName: "videopack-video-modal-overlay",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(Thumbnails_VideoPlayerInner, {
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
      }), isConfirmDeleteOpen && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.Modal, {
        title: (0,external_wp_i18n_.__)('Delete Sprite Sheet', 'video-embed-thumbnail-generator'),
        onRequestClose: () => setIsConfirmDeleteOpen(false),
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("p", {
          children: (0,external_wp_i18n_.__)('Are you sure you want to permanently delete this sprite sheet? This action cannot be undone.', 'video-embed-thumbnail-generator')
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "videopack-modal-actions",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
            variant: "secondary",
            onClick: () => setIsConfirmDeleteOpen(false),
            children: (0,external_wp_i18n_.__)('Cancel', 'video-embed-thumbnail-generator')
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
            variant: "primary",
            isDestructive: true,
            onClick: handleDeleteSprite,
            disabled: isDeleting,
            children: isDeleting ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Spinner, {}) : (0,external_wp_i18n_.__)('Delete', 'video-embed-thumbnail-generator')
          })]
        })]
      })]
    })
  });
};
/* harmony default export */ const Thumbnails_Thumbnails = (Thumbnails);
;// external ["wp","coreData"]
const external_wp_coreData_namespaceObject = window["wp"]["coreData"];
;// ./node_modules/@wordpress/icons/build-module/library/cancel-circle-filled.mjs
// packages/icons/src/library/cancel-circle-filled.tsx


var cancel_circle_filled_default = /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.Path, { d: "M12 4c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8Zm3.8 10.7-1.1 1.1-2.7-2.7-2.7 2.7-1.1-1.1 2.7-2.7-2.7-2.7 1.1-1.1 2.7 2.7 2.7-2.7 1.1 1.1-2.7 2.7 2.7 2.7Z" }) });

//# sourceMappingURL=cancel-circle-filled.mjs.map

;// ./src/components/AdditionalFormats/EncodeProgress.js
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
  const hasTriggeredRefresh = (0,external_wp_element_.useRef)(false);
  const [interpolatedProgress, setInterpolatedProgress] = (0,external_wp_element_.useState)({
    percent: 0,
    elapsed: 0,
    remaining: null
  });
  const [isExpanded, setIsExpanded] = (0,external_wp_element_.useState)(false);
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
  (0,external_wp_element_.useEffect)(() => {
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
  (0,external_wp_element_.useEffect)(() => {
    const handleBrowserProgress = event => {
      const {
        job_id,
        format_id,
        percent
      } = event.detail;
      if (formatData?.job_id === job_id || formatData?.format_id === format_id && formatData?.status === 'browser_pending') {
        setInterpolatedProgress(prev => {
          if (percent < prev.percent) {
            return prev;
          }
          return {
            ...prev,
            percent
          };
        });
      }
    };
    window.addEventListener('videopack_browser_progress', handleBrowserProgress);
    return () => window.removeEventListener('videopack_browser_progress', handleBrowserProgress);
  }, [formatData?.job_id, formatData?.format_id, formatData?.status]);

  // Internal interpolation timer
  (0,external_wp_element_.useEffect)(() => {
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
  (0,external_wp_element_.useEffect)(() => {
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
    const percentText = (0,external_wp_i18n_.sprintf)('%d%%', percent);
    return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      className: "videopack-encode-progress",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-encode-progress-row",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
          className: "videopack-meter",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "videopack-meter-bar",
            style: {
              width: percentText
            },
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "videopack-meter-text",
              children: percentText
            })
          })
        }), !hideCancel && (formatData.progress?.job_id || formatData.job_id) && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
          onClick: () => onCancelJob(formatData.progress?.job_id || formatData.job_id),
          variant: "secondary",
          isDestructive: true,
          size: "small",
          className: "videopack-cancel-job",
          isBusy: deleteInProgress === (formatData.progress?.job_id || formatData.job_id),
          icon: cancel_circle_filled_default,
          title: (0,external_wp_i18n_.__)('Cancel', 'video-embed-thumbnail-generator'),
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
            className: "videopack-button-text",
            children: (0,external_wp_i18n_.__)('Cancel', 'video-embed-thumbnail-generator')
          })
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-encode-progress-small-text",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
          children: (0,external_wp_i18n_.__)('Elapsed:', 'video-embed-thumbnail-generator') + ' ' + convertToTimecode(interpolatedProgress.elapsed)
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
          children: (0,external_wp_i18n_.__)('Remaining:', 'video-embed-thumbnail-generator') + ' ' + convertToTimecode(interpolatedProgress.remaining)
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
          children: (0,external_wp_i18n_.__)('fps:', 'video-embed-thumbnail-generator') + ' ' + (formatData.progress.fps || '--')
        })]
      })]
    });
  }
  if (formatData?.status === 'failed' && formatData?.error_message) {
    const fullError = formatData.error_message;
    const firstLine = fullError.split('\n')[0] || fullError;
    const shortError = firstLine.length > 120 ? firstLine.substring(0, 120) + '...' : firstLine;
    return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      className: "videopack-encode-error",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-encode-error-summary",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
          className: "videopack-encode-error-label",
          children: (0,external_wp_i18n_.__)('Error:', 'video-embed-thumbnail-generator')
        }), ' ', /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
          className: "videopack-encode-error-text-preview",
          children: shortError
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "videopack-encode-error-toggle-container",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
          onClick: () => setIsExpanded(!isExpanded),
          variant: "link",
          className: "videopack-encode-error-toggle",
          children: isExpanded ? (0,external_wp_i18n_.__)('Hide Details', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_.__)('Show Details', 'video-embed-thumbnail-generator')
        })
      }), isExpanded && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("pre", {
        className: "videopack-encode-error-details",
        children: fullError
      }), hideCancel === false && formatData.job_id && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "videopack-encode-error-actions",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
          onClick: () => onCancelJob(formatData.job_id),
          variant: "secondary",
          isDestructive: true,
          isBusy: deleteInProgress === formatData.job_id,
          size: "small",
          children: (0,external_wp_i18n_.__)('Delete Job', 'video-embed-thumbnail-generator')
        })
      })]
    });
  }
  return null;
};
/* harmony default export */ const AdditionalFormats_EncodeProgress = (EncodeProgress);
;// ./src/components/AdditionalFormats/EncodeFormatStatus.js
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
      title: currentId ? (0,external_wp_i18n_.sprintf)(/* translators: %s is the label of a video resolution (eg: 720p ) */
      (0,external_wp_i18n_.__)('Replace %s', 'video-embed-thumbnail-generator'), formatData.label) : (0,external_wp_i18n_.__)('Select existing file', 'video-embed-thumbnail-generator'),
      button: {
        text: (0,external_wp_i18n_.__)('Select', 'video-embed-thumbnail-generator')
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
    return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Spinner, {});
  }
  const getCheckboxCheckedState = data => {
    return !!data.checked;
  };
  const getCheckboxDisabledState = data => {
    if (isProcessing || !!deleteInProgress) {
      return true;
    }
    return data.exists && data.status !== 'error' || ['queued', 'encoding', 'processing', 'completed', 'needs_insert', 'pending_replacement', 'remote_exists', 'browser_pending', 'browser_encoding'].includes(data.status);
  };
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("li", {
    className: "videopack-format-row",
    children: [showLabel && (!!ffmpegExists ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.CheckboxControl, {
      __nextHasNoMarginBottom: true,
      className: "videopack-format",
      label: formatData.label,
      checked: getCheckboxCheckedState(formatData),
      disabled: getCheckboxDisabledState(formatData),
      onChange: value => onCheckboxChange(formatId, value)
    }) : /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
      className: "videopack-format",
      children: formatData.label
    })), formatData.status !== 'not_encoded' && (formatData.status_l10n !== formatData.label || !showLabel) && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
      className: "videopack-format-status",
      children: formatData.status_l10n
    }), formatData.status === 'not_encoded' && !formatData.exists && !formatData.replaces_original && !hideButtons && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
      variant: "secondary",
      onClick: () => openMediaLibrary(),
      className: "videopack-format-button",
      size: "small",
      isBusy: processingId === formatId,
      disabled: isProcessing || !!deleteInProgress,
      title: (0,external_wp_i18n_.__)('Open the Media Library', 'video-embed-thumbnail-generator'),
      children: (0,external_wp_i18n_.__)('Choose', 'video-embed-thumbnail-generator')
    }), formatData.exists && !formatData.encoding_now && !hideButtons && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
      variant: "secondary",
      onClick: () => openMediaLibrary(formatData.id),
      className: "videopack-format-button",
      size: "small",
      isBusy: processingId === formatId,
      disabled: isProcessing || !!deleteInProgress,
      title: (0,external_wp_i18n_.__)('Open the Media Library', 'video-embed-thumbnail-generator'),
      children: (0,external_wp_i18n_.__)('Change', 'video-embed-thumbnail-generator')
    }), formatData.is_manual && formatData.id && !formatData.encoding_now && !hideButtons && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
      onClick: onRemoveFormat,
      variant: "secondary",
      size: "small",
      isBusy: processingId === formatId,
      disabled: isProcessing || !!deleteInProgress,
      text: (0,external_wp_i18n_.__)('Remove', 'video-embed-thumbnail-generator'),
      title: (0,external_wp_i18n_.__)('Removes manual selection. It will not be deleted.', 'video-embed-thumbnail-generator')
    }), formatData.deletable && !formatData.encoding_now && !hideButtons && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
      isBusy: deleteInProgress === formatId,
      disabled: isProcessing || !!deleteInProgress,
      onClick: onDeleteFile,
      variant: "link",
      text: (0,external_wp_i18n_.__)('Delete permanently', 'video-embed-thumbnail-generator'),
      isDestructive: true
    }), (formatData.encoding_now || formatData.status === 'browser_pending' || formatData.status === 'browser_encoding' || formatData.status === 'failed' || formatData.status === 'error') && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(AdditionalFormats_EncodeProgress, {
      formatData: formatData,
      onCancelJob: onCancelJob,
      deleteInProgress: deleteInProgress,
      onRefresh: onRefresh,
      hideCancel: hideCancel
    })]
  }, formatId);
};
/* harmony default export */ const AdditionalFormats_EncodeFormatStatus = (EncodeFormatStatus);
;// ./src/components/AdditionalFormats/AdditionalFormats.js
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
      return (0,external_wp_i18n_.sprintf)((0,external_wp_i18n_.__)('%dst', 'video-embed-thumbnail-generator'), n);
    case 'two':
      /* translators: %d is a number. This is for the 2nd position in a queue. */
      return (0,external_wp_i18n_.sprintf)((0,external_wp_i18n_.__)('%dnd', 'video-embed-thumbnail-generator'), n);
    case 'few':
      /* translators: %d is a number. This is for the 3rd position in a queue. */
      return (0,external_wp_i18n_.sprintf)((0,external_wp_i18n_.__)('%drd', 'video-embed-thumbnail-generator'), n);
    default:
      /* translators: %d is a number. This is for the 4th, 5th, etc. position in a queue. */
      return (0,external_wp_i18n_.sprintf)((0,external_wp_i18n_.__)('%dth', 'video-embed-thumbnail-generator'), n);
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
  const effectiveFfmpegExists = active_encoder !== 'ffmpeg' && (!!videopack_config.isTranscodingServiceReady || !!videopack_config.is_pro) || ffmpeg_exists === true || ffmpeg_exists === 'true' || ffmpeg_exists === 1 || ffmpeg_exists === '1';
  const [videoFormats, setVideoFormats] = (0,external_wp_element_.useState)(null);
  const isExternal = (0,external_wp_element_.useMemo)(() => {
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
  const [isOpen, setIsOpen] = (0,external_wp_element_.useState)(false);
  const [encodeMessage, setEncodeMessage] = (0,external_wp_element_.useState)();
  const [itemToDelete, setItemToDelete] = (0,external_wp_element_.useState)(null); // { type: 'file'/'job', formatId: string, jobId?: int, id?: int, name?: string }
  const [deleteInProgress, setDeleteInProgress] = (0,external_wp_element_.useState)(null); // Stores formatId or jobId being deleted
  const [isConfirmOpen, setIsConfirmOpen] = (0,external_wp_element_.useState)(false);
  const [isLoading, setIsLoading] = (0,external_wp_element_.useState)(false);
  const [isProcessing, setIsProcessing] = (0,external_wp_element_.useState)(false);
  const [processingId, setProcessingId] = (0,external_wp_element_.useState)(null);
  const [isEncoding, setIsEncoding] = (0,external_wp_element_.useState)(false);
  const siteSettings = (0,external_wp_data_.useSelect)(select => {
    return select('core').getSite();
  }, []);
  const sanitizeError = (0,external_wp_element_.useCallback)(error => {
    let errorMessage = error?.data?.details ? error.data.details.join(', ') : error.message || '';

    // If the message contains HTML, it's likely a WordPress fatal error response
    if (/<[a-z][\s\S]*>/i.test(errorMessage)) {
      errorMessage = (0,external_wp_i18n_.__)('A server error occurred. Please check the PHP logs.', 'video-embed-thumbnail-generator');
    }
    return errorMessage;
  }, []);

  // Auto-clear success messages after 30 seconds.
  (0,external_wp_element_.useEffect)(() => {
    if (encodeMessage && (typeof encodeMessage !== 'string' || !encodeMessage.includes((0,external_wp_i18n_.__)('Error:', 'video-embed-thumbnail-generator')))) {
      const timer = setTimeout(() => {
        setEncodeMessage(null);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [encodeMessage]);
  const updateVideoFormats = (0,external_wp_element_.useCallback)(response => {
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
          const isBusyOrDone = ['queued', 'encoding', 'processing', 'completed', 'needs_insert', 'pending_replacement', 'remote_exists', 'browser_pending', 'browser_encoding'].includes(newFormat.status);
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
  const fetchVideoFormats = (0,external_wp_element_.useCallback)(async (signal = null) => {
    const activeId = attributes.id || 0;
    if (!activeId || !src) {
      return;
    }
    if (!videoFormats) {
      setIsLoading(true);
    }
    try {
      const formats = await (0,gallery/* getVideoFormats */.EA)(activeId, src, probedMetadata, signal);
      updateVideoFormats(formats);
    } catch (error) {
      if (error.name === 'AbortError') {
        return;
      }
      console.error('Error fetching video formats:', error);
      const errorMessage = sanitizeError(error);
      setEncodeMessage((0,external_wp_i18n_.sprintf)(/* translators: %s is the error details */
      (0,external_wp_i18n_.__)('Error: %s', 'video-embed-thumbnail-generator'), errorMessage));
      setVideoFormats({});
    } finally {
      setIsLoading(false);
    }
  }, [attributes.id, src, updateVideoFormats, probedMetadata, sanitizeError, videoFormats]);
  const pollVideoFormats = (0,external_wp_element_.useCallback)(async (signal = null) => {
    const activeId = attributes.id || 0;
    if (src) {
      try {
        const formats = await (0,gallery/* getVideoFormats */.EA)(activeId, src, probedMetadata, signal);
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
  (0,external_wp_element_.useEffect)(() => {
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
    return Object.values(formats).some(format => format.status === 'queued' || format.status === 'encoding' || format.status === 'processing' || format.status === 'needs_insert' || format.status === 'pending_replacement');
  };
  (0,external_wp_element_.useEffect)(() => {
    setIsEncoding(shouldPoll(videoFormats));
  }, [videoFormats]);
  (0,external_wp_element_.useEffect)(() => {
    let pollTimer = null;
    let isMounted = true;

    // Handle real-time progress updates from browser encoder via CustomEvents
    const handleBrowserProgress = event => {
      const {
        job_id,
        format_id,
        percent
      } = event.detail;
      setVideoFormats(prevFormats => {
        if (!prevFormats) {
          return prevFormats;
        }
        const updatedFormats = {
          ...prevFormats
        };
        const format = updatedFormats[format_id];
        if (format && (format.job_id === job_id || !format.job_id && format.status === 'browser_pending')) {
          updatedFormats[format_id] = {
            ...format,
            status: 'encoding',
            encoding_now: true,
            progress: {
              ...(typeof format.progress === 'object' ? format.progress : {}),
              percent,
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
      return (0,external_wp_hooks_.applyFilters)('videopack.handle_format_checkbox', updatedFormats, formatId, isChecked);
    });
  };
  const handleEnqueue = async () => {
    if (!videopack_config) {
      return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Spinner, {});
    }
    setIsProcessing(true);

    // Get list of format IDs that are checked and available
    const formatsToEncode = Object.entries(videoFormats).filter(([, value]) => value.checked && !['queued', 'encoding', 'processing', 'completed', 'needs_insert', 'pending_replacement', 'remote_exists'].includes(value.status) && !value.exists).reduce((acc, [formatId]) => {
      acc[formatId] = true; // Backend expects an object { format_id: true, ... }
      return acc;
    }, {});
    try {
      const activeId = attributes.id || 0;
      const response = await enqueueJob(activeId, src, formatsToEncode, parentId);
      if (response?.attachment_id && !attributes.id) {
        // Attachment was created on the fly
        setAttributes({
          ...attributes,
          id: Number(response.attachment_id)
        });
      }
      const jobCount = response?.encode_list?.length || 0;
      if (jobCount === 0) {
        const emptyMsg = response?.log?.length > 0 ? response.log.join(' ') : (0,external_wp_i18n_.__)('No formats were added to the queue.', 'video-embed-thumbnail-generator');
        setEncodeMessage(emptyMsg);
      } else {
        const queuePosition = response?.new_queue_position;
        const startPosition = Math.max(1, queuePosition - jobCount + 1);
        const ordinalPosition = getOrdinal(startPosition, siteSettings?.language || 'en-US');
        const encodeList = response?.encode_list || [];
        const cmafPartsCount = encodeList.filter(item => item.id?.startsWith('cmaf_')).length;
        const otherJobsCount = encodeList.length - cmafPartsCount;
        const effectiveJobCount = (cmafPartsCount > 0 ? 1 : 0) + otherJobsCount;
        let successMsg = /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
          children: (0,external_wp_i18n_.sprintf)(/* translators: %1$d is the number of jobs. %2$s is the ordinal position (e.g. 1st, 2nd). */
          (0,external_wp_i18n_._n)('%1$d job added to queue in %2$s position.', '%1$d jobs added to queue starting in %2$s position.', effectiveJobCount, 'video-embed-thumbnail-generator'), effectiveJobCount, ordinalPosition)
        });
        if (active_encoder === 'browser') {
          successMsg = /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("p", {
              children: successMsg
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("p", {
              children: [(0,external_wp_i18n_.__)('Browser encoding is active. Processing will only occur while the Videopack Queue page is open.', 'video-embed-thumbnail-generator'), ' ', /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("a", {
                href: videopack_config.queue_url,
                children: (0,external_wp_i18n_.__)('Go to Queue Page', 'video-embed-thumbnail-generator')
              })]
            })]
          });
        }
        setEncodeMessage(successMsg);
      }
      fetchVideoFormats(); // Re-fetch to update statuses
    } catch (error) {
      console.error(error);
      const errorMessage = sanitizeError(error);

      /* translators: %s is an error message */
      setEncodeMessage((0,external_wp_i18n_.sprintf)(/* translators: %s is an error message */
      (0,external_wp_i18n_.__)('Error: %s.', 'video-embed-thumbnail-generator'), errorMessage));
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
      await assignFormat(media.id, formatId, attributes.id);
      setEncodeMessage((0,external_wp_i18n_.__)('Video format assigned successfully.', 'video-embed-thumbnail-generator'));
      fetchVideoFormats(); // Refresh the list
    } catch (error) {
      console.error('Error assigning video format:', error);
      const errorMessage = sanitizeError(error);
      setEncodeMessage((0,external_wp_i18n_.sprintf)(/* translators: %s is an error message */
      (0,external_wp_i18n_.__)('Error: %s', 'video-embed-thumbnail-generator'), errorMessage));
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
        await deleteFile(formatData.id);
      } else {
        // Cleanup orphaned file
        await deleteFormat(parentId, formatId);
      }
      setEncodeMessage((0,external_wp_i18n_.__)('File deleted successfully.', 'video-embed-thumbnail-generator'));
      fetchVideoFormats(); // Re-fetch to get the latest status from backend
    } catch (error) {
      console.error('File delete failed:', error);
      const errorMessage = sanitizeError(error);
      setEncodeMessage((0,external_wp_i18n_.sprintf)(/* translators: %s is an error message */
      (0,external_wp_i18n_.__)('Error deleting file: %s', 'video-embed-thumbnail-generator'), errorMessage));
      fetchVideoFormats(); // Re-fetch to get the latest status
    } finally {
      setDeleteInProgress(null);
    }
  };

  // Deletes/Cancels a queue job
  const handleJobDelete = async jobId => {
    if (!jobId) {
      setEncodeMessage((0,external_wp_i18n_.__)('Error: Cannot delete job, missing job ID.', 'video-embed-thumbnail-generator'));
      console.error('Cannot delete job: Missing job ID');
      return;
    }
    setDeleteInProgress(jobId); // Mark this jobId as being deleted
    try {
      await deleteJob(jobId);
      setEncodeMessage((0,external_wp_i18n_.__)('Job canceled/deleted successfully.', 'video-embed-thumbnail-generator'));
      fetchVideoFormats(); // Re-fetch to get the latest status
    } catch (error) {
      console.error('Job delete failed:', error);
      const errorMessage = sanitizeError(error);
      setEncodeMessage((0,external_wp_i18n_.sprintf)(/* translators: %s is an error message */
      (0,external_wp_i18n_.__)('Error deleting job: %s', 'video-embed-thumbnail-generator'), errorMessage));
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
      return isLoading ? (0,external_wp_i18n_.__)('Loading…', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_.__)('Encode selected formats', 'video-embed-thumbnail-generator');
    }
    return (0,external_wp_i18n_.__)('Select formats to encode', 'video-embed-thumbnail-generator');
  };
  const isEncodeButtonDisabled = isLoading || !effectiveFfmpegExists || !somethingToEncode();
  const confirmDialogMessage = () => {
    if (!itemToDelete) {
      return '';
    }
    if (itemToDelete.type === 'file') {
      return (0,external_wp_i18n_.__)('Are you sure you want to permanently delete this attachment? This action cannot be undone.', 'video-embed-thumbnail-generator');
    }
    if (itemToDelete.type === 'job') {
      return (0,external_wp_i18n_.__)('Are you sure you want to permanently delete this job record? This action cannot be undone.', 'video-embed-thumbnail-generator');
    }
  };
  const canUploadFiles = (0,external_wp_data_.useSelect)(select => {
    const activeId = attributes.id || 0;
    if (activeId) {
      return select(external_wp_coreData_namespaceObject.store).canUser('create', 'media', activeId);
    }
    // If no ID but we have a src, check general media creation permissions
    return !!src && select(external_wp_coreData_namespaceObject.store).canUser('create', 'media');
  }, [attributes.id, src]);
  (0,external_wp_data_.useSelect)(select => {
    const activeId = attributes.id || 0;
    const editorSelector = select('core/editor');
    return !!activeId && !!editorSelector && editorSelector.isDeletingPost(activeId);
  }, [attributes.id]);
  const groupedFormats = videoFormats ? (0,external_wp_hooks_.applyFilters)(
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
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_ReactJSXRuntime_.Fragment, {
    children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
      title: (0,external_wp_i18n_.__)('Additional Formats', 'video-embed-thumbnail-generator'),
      opened: isOpen,
      onToggle: () => setIsOpen(!isOpen),
      children: [encodeMessage && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Notice, {
        status: typeof encodeMessage === 'string' && (encodeMessage.includes((0,external_wp_i18n_.__)('Error', 'video-embed-thumbnail-generator')) || encodeMessage.includes(':')) ? 'error' : 'success',
        isDismissible: true,
        onRemove: () => setEncodeMessage(null),
        style: {
          marginBottom: '15px'
        },
        children: encodeMessage
      }), !videoFormats ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-formats-loading",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Spinner, {}), isLoading && isExternal && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
          className: "videopack-external-check-notice",
          children: (0,external_wp_i18n_.__)('Checking URLs on external server…', 'video-embed-thumbnail-generator')
        })]
      }) : /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-formats-container",
        children: [isLoading && isExternal && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "videopack-external-check-notice",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Spinner, {
            size: 16
          }), (0,external_wp_i18n_.__)('Checking URLs on external server…', 'video-embed-thumbnail-generator')]
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("ul", {
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
            return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("li", {
              children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("h4", {
                className: "videopack-codec-name",
                children: codecGroup.name
              }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("ul", {
                children: codecGroup.formats.map(formatData => {
                  const formatId = formatData.format_id;
                  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(AdditionalFormats_EncodeFormatStatus, {
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
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.__experimentalConfirmDialog, {
          isOpen: isConfirmOpen,
          onConfirm: handleConfirm,
          onCancel: handleCancel,
          className: "videopack-confirm-dialog",
          children: confirmDialogMessage()
        })]
      }), !!effectiveFfmpegExists && videoFormats && canUploadFiles && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
        children: [(0,external_wp_hooks_.applyFilters)(
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
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelRow, {
          className: "videopack-encode-button-row",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
            variant: "secondary",
            onClick: handleEnqueue,
            title: encodeButtonTitle(),
            text: (0,external_wp_i18n_.__)('Encode', 'video-embed-thumbnail-generator'),
            disabled: isEncodeButtonDisabled || isProcessing
          }), (isLoading || isProcessing) && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Spinner, {})]
        })]
      })]
    })
  });
};
/* harmony default export */ const AdditionalFormats_AdditionalFormats = (AdditionalFormats);
// EXTERNAL MODULE: ./src/hooks/useVideoQuery.js
var useVideoQuery = __webpack_require__(877);
;// ./src/hooks/useVideoData.js
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
  const [videoData, setVideoData] = (0,external_wp_element_.useState)({
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
  } = (0,external_wp_data_.useSelect)(select => {
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
  (0,external_wp_element_.useEffect)(() => {
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
        error: (0,external_wp_i18n_.__)('Could not find the video attachment.', 'video-embed-thumbnail-generator'),
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
;// ./src/hooks/useVideoProbe.js



/**
 * Custom hook to probe a video URL for metadata and CORS/canvas taint status.
 *
 * @param {string} videoUrl The URL of the video to probe.
 * @return {Object} An object containing { isProbing, probedMetadata }.
 */
function useVideoProbe(videoUrl) {
  const [state, setState] = (0,external_wp_element_.useState)({
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
  (0,external_wp_element_.useEffect)(() => {
    if (!isProbing || !videoUrl) {
      return;
    }
    const controller = new AbortController();
    const metadataPromise = getVideoMetadata(videoUrl, controller.signal).catch(() => null);
    const taintPromise = checkCanvasTaint(videoUrl, controller.signal).catch(() => true);
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
;// ./src/features/classic-embed/components/ClassicEmbed.js
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
  const normalizedOptions = normalizeOptions(options);

  // Retrieve editAttributes passed from PHP if editing an existing shortcode via TinyMCE
  const editAttributes = (0,external_wp_element_.useMemo)(() => {
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
  (0,external_wp_element_.useEffect)(() => {
    if (editAttributes.tinymce_edit) {
      document.body.classList.add('videopack-is-editing');
      return () => {
        document.body.classList.remove('videopack-is-editing');
      };
    }
  }, [editAttributes.tinymce_edit]);
  const [videoUrl, setVideoUrl] = (0,external_wp_element_.useState)(initialVideoUrl);
  const [debouncedVideoUrl, setDebouncedVideoUrl] = (0,external_wp_element_.useState)(initialVideoUrl);
  const [resolvedId, setResolvedId] = (0,external_wp_element_.useState)(null);
  const [isResolving, setIsResolving] = (0,external_wp_element_.useState)(false);
  const {
    isProbing,
    probedMetadata
  } = useVideoProbe(debouncedVideoUrl);
  const [probedMetadataOverride, setProbedMetadataOverride] = (0,external_wp_element_.useState)(null);

  // Debounce the video URL for all downstream logic and rendering
  (0,external_wp_element_.useEffect)(() => {
    if (videoUrl === debouncedVideoUrl) {
      return;
    }
    const timeoutId = setTimeout(() => {
      setIsResolving(true);
      setDebouncedVideoUrl(videoUrl);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [videoUrl, debouncedVideoUrl]);
  const [singleAttributes, setSingleAttributes] = (0,external_wp_element_.useState)({
    autoplay: !!normalizedOptions.autoplay,
    loop: !!normalizedOptions.loop,
    muted: !!normalizedOptions.muted,
    controls: !!normalizedOptions.controls,
    downloadlink: !!normalizedOptions.downloadlink,
    preload: normalizedOptions.preload || 'metadata',
    ...editAttributes // override with whatever came from the shortcode
  });
  const [galleryAttributes, setGalleryAttributes] = (0,external_wp_element_.useState)({
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
  const [listAttributes, setListAttributes] = (0,external_wp_element_.useState)({
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
  const queryData = (0,useVideoQuery/* default */.A)(activeAttributes, postId);
  const videoData = useVideoData(resolvedId, debouncedVideoUrl, !resolvedId);
  const [urlError, setUrlError] = (0,external_wp_element_.useState)('');

  // Validate URL
  const isValidUrl = url => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Resolve URL to Attachment ID
  (0,external_wp_element_.useEffect)(() => {
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

    external_wp_apiFetch_default()({
      path: '/videopack/v1/attachment/register-url',
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
      console.error('Error resolving video URL:', error);
      setResolvedId(null);
    }).finally(() => {
      setIsResolving(false);
    });
    return () => controller.abort();
  }, [debouncedVideoUrl, postId]);

  // Sync metadata from videoData when it loads
  (0,external_wp_element_.useEffect)(() => {
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
  (0,external_wp_element_.useEffect)(() => {
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
  (0,external_wp_element_.useEffect)(() => {
    if (singleAttributes.id && singleAttributes.id !== resolvedId) {
      setResolvedId(singleAttributes.id);
    }
  }, [singleAttributes.id, resolvedId]);
  const onInsert = (0,external_wp_element_.useCallback)(type => {
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
      shortcode = generateShortcode('videopack', filtered, videoUrl);
    } else if (type === 'gallery') {
      const filtered = filterAttributes(galleryAttributes, normalizedOptions);
      shortcode = generateShortcode('videopack', filtered);
    } else {
      // List type
      const filtered = filterAttributes(listAttributes, normalizedOptions);
      shortcode = generateShortcode('videopack', filtered);
    }
    if (editAttributes.tinymce_edit && window.parent && window.parent.videopack_tinymce_update_shortcode) {
      window.parent.videopack_tinymce_update_shortcode(shortcode);
    } else if (window.parent && window.parent.send_to_editor) {
      window.parent.send_to_editor(shortcode);
    } else if (window.send_to_editor) {
      window.send_to_editor(shortcode);
    }
  }, [singleAttributes, videoUrl, galleryAttributes, listAttributes, videoData, normalizedOptions, postId, resolvedId, editAttributes.tinymce_edit]);
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
    className: "videopack-classic-embed-outer",
    children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
      className: "videopack-classic-embed",
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-tab-content",
        children: [activeTab === 'single' && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_wp_components_.PanelBody, {
            title: (0,external_wp_i18n_.__)('Video URL', 'video-embed-thumbnail-generator'),
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.TextControl, {
              label: (0,external_wp_i18n_.__)('URL', 'video-embed-thumbnail-generator'),
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
              help: (0,external_wp_i18n_.__)('Enter the URL of the video file (e.g., .mp4, .webm).', 'video-embed-thumbnail-generator')
            }), urlError && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              style: {
                color: '#d94f4f',
                marginTop: '8px',
                fontSize: '13px'
              },
              children: urlError
            })]
          }), debouncedVideoUrl && isValidUrl(debouncedVideoUrl) && !isResolving && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(Thumbnails_Thumbnails, {
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
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(VideoSettings_VideoSettings, {
              attributes: singleAttributes,
              setAttributes: newAttrs => setSingleAttributes(prev => ({
                ...prev,
                ...newAttrs
              })),
              options: options,
              isProbing: isProbing,
              probedMetadata: effectiveMetadata
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(AdditionalFormats_AdditionalFormats, {
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
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "videopack-insert-button-wrapper",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
              variant: "primary",
              onClick: () => onInsert('single'),
              disabled: !videoUrl || !isValidUrl(videoUrl),
              children: editAttributes.tinymce_edit ? (0,external_wp_i18n_.__)('Update', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_.__)('Insert into Post', 'video-embed-thumbnail-generator')
            })
          })]
        }), activeTab === 'gallery' && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CollectionSettingsPanel, {
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
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "videopack-insert-button-wrapper",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
              variant: "primary",
              onClick: () => onInsert('gallery'),
              children: editAttributes.tinymce_edit ? (0,external_wp_i18n_.__)('Update', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_.__)('Insert into Post', 'video-embed-thumbnail-generator')
            })
          })]
        }), activeTab === 'list' && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CollectionSettingsPanel, {
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
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "videopack-insert-button-wrapper",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
              variant: "primary",
              onClick: () => onInsert('list'),
              children: editAttributes.tinymce_edit ? (0,external_wp_i18n_.__)('Update', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_.__)('Insert into Post', 'video-embed-thumbnail-generator')
            })
          })]
        })]
      })
    })
  });
}
;// ./src/features/classic-embed/classic-embed.js
/**
 * Main entry point for the classic embed feature.
 */





const initClassicEmbed = () => {
  const container = document.getElementById('videopack-classic-embed-root');
  if (container) {
    const config = window.videopack_classic_editor_config || {};
    const root = (0,external_wp_element_.createRoot)(container);
    root.render(/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(ClassicEmbed, {
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

// EXTERNAL MODULE: external ["wp","element"]
var external_wp_element_ = __webpack_require__(87);
// EXTERNAL MODULE: external ["wp","i18n"]
var external_wp_i18n_ = __webpack_require__(723);
;// external ["wp","blockEditor"]
const external_wp_blockEditor_namespaceObject = window["wp"]["blockEditor"];
// EXTERNAL MODULE: external ["wp","components"]
var external_wp_components_ = __webpack_require__(808);
// EXTERNAL MODULE: external ["wp","htmlEntities"]
var external_wp_htmlEntities_ = __webpack_require__(537);
// EXTERNAL MODULE: external ["wp","data"]
var external_wp_data_ = __webpack_require__(143);
;// ./src/utils/context.js
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
// EXTERNAL MODULE: external ["wp","hooks"]
var external_wp_hooks_ = __webpack_require__(619);
;// ./src/hooks/useVideopackContext.js





const DEFAULT_CONTEXT_KEYS = ['skin', 'title_color', 'title_background_color', 'play_button_color', 'play_button_secondary_color', 'control_bar_bg_color', 'control_bar_color', 'pagination_color', 'pagination_background_color', 'pagination_active_bg_color', 'pagination_active_color', 'watermark', 'watermark_styles', 'watermark_align', 'watermark_valign', 'watermark_scale', 'watermark_x', 'watermark_y', 'watermark_link_to', 'align', 'gallery_per_page', 'gallery_source', 'gallery_id', 'gallery_category', 'gallery_tag', 'gallery_orderby', 'gallery_order', 'gallery_include', 'gallery_exclude', 'layout', 'columns', 'gallery_pagination', 'gallery_title', 'videos', 'enable_collection_video_limit', 'collection_video_limit', 'prioritizePostData', 'embed_method', 'isPreview', 'isStandalone', 'src', 'poster', 'title', 'caption', 'width', 'height', 'autoplay', 'controls', 'loop', 'muted', 'playsinline', 'preload', 'volume', 'auto_res', 'sources', 'source_groups', 'text_tracks', 'playback_rate', 'downloadlink', 'embedcode', 'embedlink', 'showCaption', 'showBackground', 'title_position', 'restartCount', 'duotone', 'style', 'loopDuotoneId', 'fixed_aspect', 'fullwidth', 'rotate', 'default_ratio', 'currentPage', 'totalPages', 'onPageChange', 'isInsideThumbnail', 'isInsidePlayerOverlay', 'isInsidePlayerContainer', 'isInsideTitleMeta'];
const VIDEOPACK_CONTEXT_KEYS =
/**
 * Filters the list of Gutenberg block context keys that the hook listens to.
 *
 * @since 5.0.0
 *
 * @param {Array} contextKeys List of context key strings.
 */
(0,external_wp_hooks_.applyFilters)('videopack.contextKeys', DEFAULT_CONTEXT_KEYS);

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
    excludeKeys = []
  } = options;
  // The hover trigger exclusion should NOT be inherited from parents by default,
  // as containers (Collections/Loops) might opt-out while their children (Players) should still hover.
  const excludeHoverTrigger = optionsExclude || attributes.exclude_hover_trigger || false;

  // 1. Initial Synchronous Resolution
  const initial = (0,external_wp_element_.useMemo)(() => {
    const resolved = {};
    const style = {};
    const classes = [];
    VIDEOPACK_CONTEXT_KEYS.forEach(key => {
      if (excludeKeys.includes(key)) {
        return;
      }
      const value = getEffectiveValue(key, attributes, context);
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
    resolved.isEditingAllPages = isTrue(getEffectiveValue('isEditingAllPages', attributes, context));
    resolved.prioritizePostData = isTrue(getEffectiveValue('prioritizePostData', attributes, context));
    resolved.isStandalone = isTrue(getEffectiveValue('isStandalone', attributes, context));
    // Core data identification
    resolved.postId = getEffectiveValue('postId', attributes, context);
    resolved.attachmentId = getEffectiveValue('attachmentId', attributes, context);
    resolved.postType = getEffectiveValue('postType', attributes, context);

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
  }, [attributes, context, excludeHoverTrigger, excludeKeys]);

  // 2. Automatic Video Discovery
  // If we have a postId but no attachmentId, try to find the first video attachment.
  const {
    discoveredAttachmentId,
    isDiscovering
  } = (0,external_wp_data_.useSelect)(select => {
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
  return (0,external_wp_element_.useMemo)(() => {
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
;// ./src/hooks/useVideopackData.js



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
  const isStandalone = isTrue(context['videopack/isStandalone']);
  const resolvedData = (0,external_wp_data_.useSelect)(select => {
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
// EXTERNAL MODULE: external "ReactJSXRuntime"
var external_ReactJSXRuntime_ = __webpack_require__(790);
;// ./src/components/VideopackContextBridge.js




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
  } = useVideopackContext(attributes, context);
  const finalContext = (0,external_wp_element_.useMemo)(() => {
    const ctx = {
      ...sharedContext,
      ...overrides
    };
    return ctx;
  }, [sharedContext, overrides]);
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_namespaceObject.BlockContextProvider, {
    value: finalContext,
    children: children
  });
}
;// ./src/components/VideoTitle/VideoTitle.js
/* global videopack_config */









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
  const vpContext = useVideopackContext(attributes, context, {
    excludeKeys: ['downloadlink']
  });
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
  } = useVideopackData(titleKey, context);
  const displayTitle = (0,external_wp_htmlEntities_.decodeEntities)(manualTitle || resolvedTitle || '');
  if (isResolving && !displayTitle && !vpContext.resolved.isPreview) {
    return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Spinner, {});
  }
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
  const finalBlockProps = blockProps || {
    className: `videopack-video-title-block videopack-video-title-wrapper ${vpContext.classes} ${isOverlay ? `is-overlay position-${position}` : ''} ${isInsideThumbnail ? 'is-inside-thumbnail' : ''} ${isInsidePlayerOverlay ? 'is-inside-player' : ''} ${!postId && !manualTitle ? 'no-title' : ''} has-text-align-${finalTextAlign}`,
    style: vpContext.style
  };
  const barClass = `videopack-video-title videopack-video-title-visible ${isOverlay ? 'is-overlay' : ''} ${!showBackground && isOverlay ? 'has-no-background' : ''} ${isInsideThumbnail ? 'videopack-thumbnail-title' : ''} ${isInsidePlayerOverlay || isOverlay ? `position-${position}` : ''}`.trim();
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
    ...finalBlockProps,
    children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      className: `${barClass} has-text-align-${finalTextAlign}`,
      children: [finalOverlayTitle && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_namespaceObject.RichText, {
        tagName: Tag,
        className: `${titleClass} ${vpContext.classes} ${linkToPost ? 'is-link' : ''}`,
        style: vpContext.style,
        value: displayTitle,
        onChange: onTitleChange,
        placeholder: placeholder,
        allowedFormats: ['core/bold', 'core/italic', 'core/strikethrough']
      }), isOverlay && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: iconsClass,
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(VideopackContextBridge, {
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
          children: children || /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_blockEditor_namespaceObject.InnerBlocks, {
            allowedBlocks: ['videopack/download', 'videopack/share'],
            template: [],
            templateLock: false
          })
        })
      })]
    })
  });
}
// EXTERNAL MODULE: external ["wp","primitives"]
var external_wp_primitives_ = __webpack_require__(573);
;// ./node_modules/@wordpress/icons/build-module/library/seen.mjs
// packages/icons/src/library/seen.tsx


var seen_default = /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.Path, { d: "M3.99961 13C4.67043 13.3354 4.6703 13.3357 4.67017 13.3359L4.67298 13.3305C4.67621 13.3242 4.68184 13.3135 4.68988 13.2985C4.70595 13.2686 4.7316 13.2218 4.76695 13.1608C4.8377 13.0385 4.94692 12.8592 5.09541 12.6419C5.39312 12.2062 5.84436 11.624 6.45435 11.0431C7.67308 9.88241 9.49719 8.75 11.9996 8.75C14.502 8.75 16.3261 9.88241 17.5449 11.0431C18.1549 11.624 18.6061 12.2062 18.9038 12.6419C19.0523 12.8592 19.1615 13.0385 19.2323 13.1608C19.2676 13.2218 19.2933 13.2686 19.3093 13.2985C19.3174 13.3135 19.323 13.3242 19.3262 13.3305L19.3291 13.3359C19.3289 13.3357 19.3288 13.3354 19.9996 13C20.6704 12.6646 20.6703 12.6643 20.6701 12.664L20.6697 12.6632L20.6688 12.6614L20.6662 12.6563L20.6583 12.6408C20.6517 12.6282 20.6427 12.6108 20.631 12.5892C20.6078 12.5459 20.5744 12.4852 20.5306 12.4096C20.4432 12.2584 20.3141 12.0471 20.1423 11.7956C19.7994 11.2938 19.2819 10.626 18.5794 9.9569C17.1731 8.61759 14.9972 7.25 11.9996 7.25C9.00203 7.25 6.82614 8.61759 5.41987 9.9569C4.71736 10.626 4.19984 11.2938 3.85694 11.7956C3.68511 12.0471 3.55605 12.2584 3.4686 12.4096C3.42484 12.4852 3.39142 12.5459 3.36818 12.5892C3.35656 12.6108 3.34748 12.6282 3.34092 12.6408L3.33297 12.6563L3.33041 12.6614L3.32948 12.6632L3.32911 12.664C3.32894 12.6643 3.32879 12.6646 3.99961 13ZM11.9996 16C13.9326 16 15.4996 14.433 15.4996 12.5C15.4996 10.567 13.9326 9 11.9996 9C10.0666 9 8.49961 10.567 8.49961 12.5C8.49961 14.433 10.0666 16 11.9996 16Z" }) });

//# sourceMappingURL=seen.mjs.map

// EXTERNAL MODULE: ./src/assets/icon.js
var icon = __webpack_require__(427);
;// ./src/components/ViewCount/ViewCount.js







/**
 * A internal component to display the view count with correct styling and data.
 *
 * @param {Object}  root0                   Component props.
 * @param {Object}  root0.blockProps        Block props.
 * @param {string}  root0.iconType          Type of icon to display.
 * @param {boolean} root0.showText          Whether to show the "views" text.
 * @param {number}  root0.count             Manual count override.
 * @param {boolean} root0.isInsideThumbnail Whether it's inside a thumbnail.
 * @param {boolean} root0.isOverlay         Whether it's an overlay.
 * @param {string}  root0.textAlign         Text alignment.
 * @param {string}  root0.position          Position (top/bottom).
 * @param {Object}  root0.attributes        Block attributes.
 * @param {Object}  root0.context           Block context.
 * @return {Element}                        The rendered component.
 */

function ViewCount({
  blockProps,
  iconType = 'none',
  showText = true,
  count,
  isInsideThumbnail = false,
  isOverlay = false,
  textAlign,
  position = 'top',
  attributes = {},
  context = {}
}) {
  const vpContext = useVideopackContext(attributes, context);
  const {
    data: views,
    isResolving
  } = useVideopackData('views', context);
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
    return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
      ...finalBlockProps,
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Spinner, {})
    });
  }
  if (!attachmentId && count === undefined && !vpContext.resolved.isPreview) {
    return null;
  }
  if (isResolving) {
    return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
      ...finalBlockProps,
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
          icon: icon.play,
          size: 16,
          className: "videopack-icon-left-margin"
        });
      case 'playOutline':
        return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Icon, {
          icon: icon.playOutline,
          size: 16,
          className: "videopack-icon-left-margin"
        });
      default:
        return null;
    }
  };
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
    ...finalBlockProps,
    children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      className: "videopack-view-count",
      children: [renderIcon(), displayValue]
    })
  });
}
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
  } = useVideopackContext(attributes, context);
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
;// ./src/components/VideoDuration/VideoDuration.js




/**
 * A internal component to display the video duration with correct formatting and data.
 *
 * @param {Object}  root0                   Component props.
 * @param {boolean} root0.isOverlay         Whether it's an overlay.
 * @param {boolean} root0.isInsideThumbnail Whether it's inside a thumbnail.
 * @param {string}  root0.textAlign         Text alignment.
 * @param {string}  root0.position          Position (top/bottom).
 * @param {Object}  root0.attributes        Block attributes.
 * @param {Object}  root0.context           Block context.
 * @return {Element}                        The rendered component.
 */

function VideoDuration({
  isOverlay,
  isInsideThumbnail,
  textAlign,
  position,
  attributes,
  context = {}
}) {
  const vpContext = useVideopackContext(attributes, context);
  const {
    data: duration,
    isResolving
  } = useVideopackData('duration', context);
  const attachmentId = vpContext.resolved.attachmentId;
  if (vpContext.resolved.isDiscovering && !attachmentId) {
    return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
      className: `videopack-video-duration ${isInsideThumbnail || !!context['videopack/isInsidePlayerOverlay'] ? 'is-overlay' : ''}`,
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Spinner, {})
    });
  }
  if (!attachmentId && !vpContext.resolved.isPreview) {
    return null;
  }
  const actualIsOverlay = isOverlay !== undefined ? isOverlay : isInsideThumbnail || !!context['videopack/isInsidePlayerOverlay'];
  const isInsidePlayerContainer = !!context['videopack/isInsidePlayerContainer'];
  const defaultAlign = actualIsOverlay || isInsidePlayerContainer ? 'right' : 'left';
  if (isResolving) {
    return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
      className: `videopack-video-duration ${actualIsOverlay ? 'is-overlay' : ''}`,
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Spinner, {})
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
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
    className: `videopack-video-duration-block videopack-video-duration ${vpContext.classes} ${actualIsOverlay ? 'is-overlay is-badge' : ''} position-${position || 'top'} has-text-align-${textAlign || defaultAlign} ${vpContext.resolved.isPreview ? 'is-preview' : ''}`,
    style: vpContext.style,
    children: duration ? formatDuration(duration) : '0:00'
  });
}
;// ./src/components/PlayButton/PlayButton.js




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
  const embed_method = typeof config !== 'undefined' ? config.embed_method : 'Video.js';
  const vpContext = useVideopackContext(attributes, context);

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
;// ./src/components/Duotone/CustomDuotoneFilter.js


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
  const filterData = (0,external_wp_element_.useMemo)(() => {
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
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("svg", {
    style: {
      position: 'absolute',
      width: 0,
      height: 0,
      visibility: 'hidden'
    },
    "aria-hidden": "true",
    children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("filter", {
      id: id,
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("feColorMatrix", {
        type: "matrix",
        values: ".299 .587 .114 0 0 .299 .587 .114 0 0 .299 .587 .114 0 0 .299 .587 .114 0 0"
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("feComponentTransfer", {
        colorInterpolationFilters: "sRGB",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("feFuncR", {
          type: "table",
          tableValues: filterData.rValues
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("feFuncG", {
          type: "table",
          tableValues: filterData.gValues
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("feFuncB", {
          type: "table",
          tableValues: filterData.bValues
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("feFuncA", {
          type: "table",
          tableValues: filterData.aValues
        })]
      })]
    })
  });
};
/* harmony default export */ const Duotone_CustomDuotoneFilter = (CustomDuotoneFilter);
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
  const vpContext = useVideopackContext(attributes, context);
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
  const postId = vpContext.resolved.attachmentId || propPostId;
  const effectiveSkin = vpContext.resolved.skin;
  const {
    thumbnailMedia,
    posterUrl,
    isResolving
  } = (0,external_wp_data_.useSelect)(select => {
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
    return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Spinner, {});
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
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
    className: containerClass,
    style: containerStyle,
    children: [thumbnailUrl && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("img", {
      src: thumbnailUrl,
      alt: thumbnailMedia?.alt_text || '',
      className: "videopack-thumbnail",
      style: imgStyle
    }), Array.isArray(duotone) && resolvedDuotoneClass && !loopDuotoneId && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(Duotone_CustomDuotoneFilter, {
      colors: duotone,
      id: resolvedDuotoneClass
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
      className: "videopack-inner-blocks-container",
      children: children
    })]
  });
}
;// ./src/components/PlayerContainer/PlayerContainer.js


/**
 * Shared Player Container Component for Edit/Preview.
 *
 * @param {Object}  root0                      Component props.
 * @param {Node}    root0.children             Inner content.
 * @param {string}  root0.className            Additional CSS classes.
 * @param {Object}  root0.attributes           Block attributes.
 * @param {Object}  root0.context              Block context.
 * @param {string}  root0.resolvedDuotoneClass Duotone class to apply.
 * @param {string}  root0.tagName              HTML tag name (default: div).
 * @param {Object}  root0.style                Inline styles.
 * @param {boolean} root0.isPreview            Whether it's a preview.
 * @return {Element}                           The rendered container.
 */

function PlayerContainer({
  children,
  className,
  attributes = {},
  context = {},
  resolvedDuotoneClass,
  tagName: Tag = 'div',
  style,
  isPreview
}) {
  const vpContext = useVideopackContext(attributes, context);
  const {
    resolved: {
      duotone: contextDuotone
    },
    classes: contextClasses,
    style: contextStyle
  } = vpContext;
  const activeDuotone = style?.color?.duotone || attributes?.duotone || contextDuotone;
  let finalDuotoneClass = resolvedDuotoneClass || '';
  const loopDuotoneId = context['videopack/loopDuotoneId'];
  if (loopDuotoneId) {
    finalDuotoneClass = ''; // Loop handles the filter via its own class on the parent
  } else if (!finalDuotoneClass && activeDuotone) {
    if (typeof activeDuotone === 'string' && activeDuotone.startsWith('var:preset|duotone|')) {
      finalDuotoneClass = `wp-duotone-${activeDuotone.split('|').pop()}`;
    } else if (Array.isArray(activeDuotone)) {
      // If it's a custom array, we expect a class to be passed in resolvedDuotoneClass
      // or we just leave it for the CustomDuotoneFilter to handle if rendered.
    }
  }
  const finalClasses = `videopack-video-block-container videopack-wrapper ${contextClasses} ${className || ''} ${finalDuotoneClass} ${isPreview || vpContext.resolved.isPreview ? 'is-preview' : ''}`.trim();
  const finalStyle = {
    ...contextStyle,
    ...style
  };
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(Tag, {
    className: finalClasses,
    style: finalStyle,
    children: children
  });
}
;// ./src/components/VideoPlayer/GenericPlayer.js
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

const GenericPlayer = (0,external_wp_element_.forwardRef)(({
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
}, ref) => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("video", {
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
  children: [sources.map((source, index) => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("source", {
    src: source.src,
    type: source.type
  }, index)), tracks.map((track, index) => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("track", {
    src: track.src,
    kind: track.kind,
    srcLang: track.srclang,
    label: track.label,
    default: track.default
  }, index)), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("a", {
    href: src,
    children: src
  })]
}));
/* harmony default export */ const VideoPlayer_GenericPlayer = (GenericPlayer);
;// ./src/components/VideoPlayer/VideoJs.js
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
  const videoRef = (0,external_wp_element_.useRef)(null);
  const playerRef = (0,external_wp_element_.useRef)(null);
  const {
    options,
    skin,
    onPlay,
    onPause,
    onReady,
    onMetadataLoaded,
    onEnded
  } = props;
  const previousSkinRef = (0,external_wp_element_.useRef)(skin);
  const previousPluginsRef = (0,external_wp_element_.useRef)(options?.plugins);
  (0,external_wp_element_.useEffect)(() => {
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
  (0,external_wp_element_.useEffect)(() => {
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
  (0,external_wp_element_.useEffect)(() => {
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
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
    "data-vjs-player": true,
    ref: videoRef,
    style: {
      width: '100%',
      aspectRatio: ratio,
      overflow: 'hidden'
    }
  });
};
/* harmony default export */ const VideoJs = (VideoJS);
;// ./src/components/VideoPlayer/WpMejsPlayer.js
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
  const playerRef = (0,external_wp_element_.useRef)(null);
  const containerRef = (0,external_wp_element_.useRef)(null);
  const propsRef = (0,external_wp_element_.useRef)(props);
  const reportedSrcRef = (0,external_wp_element_.useRef)(null);
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
  (0,external_wp_element_.useEffect)(() => {
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
  (0,external_wp_element_.useEffect)(() => {
    const media = playerRef.current;
    const shouldBeMuted = !!options.muted || !!actualAutoplay;
    if (media && typeof media.setMuted === 'function') {
      media.setMuted(shouldBeMuted);
    }
  }, [options.muted, actualAutoplay]);
  (0,external_wp_element_.useEffect)(() => {
    const media = playerRef.current;
    if (media && typeof media.setVolume === 'function' && options.volume !== undefined && options.volume !== null) {
      media.setVolume(options.volume);
    }
  }, [options.volume]);
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
    className: `wp-video-container${!controls ? ' videopack-no-controls' : ''}`,
    ref: containerRef,
    style: {
      width: '100%',
      aspectRatio: aspectRatio ? aspectRatio.replace(':', ' / ') : undefined
    }
  });
};
/* harmony default export */ const VideoPlayer_WpMejsPlayer = (WpMejsPlayer);
;// ./src/components/VideoPlayer/VideoPlayer.js
/**
 * Main VideoPlayer component that orchestrates different player engines and UI overlays.
 */









const DEFAULT_PLAYERS = {
  'Video.js': VideoJs,
  'WordPress Default': VideoPlayer_WpMejsPlayer,
  None: VideoPlayer_GenericPlayer
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
  const blockAttributes = (0,external_wp_element_.useMemo)(() => ({
    ...attributes,
    // If props are passed directly (e.g. from BlockPreview spreading), prioritize them
    ...otherProps
  }), [attributes, otherProps]);

  // Use unified context hook for all design and behavior resolution
  const {
    resolved,
    style: contextStyles,
    classes: contextClasses
  } = useVideopackContext(blockAttributes, context);
  const wrapperRef = (0,external_wp_element_.useRef)(null);
  const [detectedDimensions, setDetectedDimensions] = (0,external_wp_element_.useState)({
    width: null,
    height: null,
    src: null // Track which src these dimensions are for
  });
  const [resetKey, setResetKey] = (0,external_wp_element_.useState)(0);
  const resetPlayer = (0,external_wp_element_.useCallback)(() => {
    setResetKey(prev => prev + 1);
  }, []);

  // Reset dimensions when src changes
  (0,external_wp_element_.useEffect)(() => {
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
  (0,external_wp_element_.useEffect)(() => {
    if (blockAttributes?.restartCount > 0) {
      resetPlayer();
    }
  }, [blockAttributes?.restartCount, resetPlayer]);
  const onMetadataLoaded = (0,external_wp_element_.useCallback)(dimensions => {
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
    loopDuotoneId
  } = resolved;
  const source_groups = (0,external_wp_element_.useMemo)(() => {
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
  const instanceId = (0,external_wp_element_.useMemo)(() => {
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
  const players = (0,external_wp_element_.useMemo)(() => (0,external_wp_hooks_.applyFilters)(
  /**
   * Filters the registered admin preview player engines.
   *
   * @since 5.0.0
   *
   * @param {Object} players Object mapping player type names to React components.
   */
  'videopack_admin_players', DEFAULT_PLAYERS), []);
  const isVertical = (0,external_wp_element_.useMemo)(() => {
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
  const isFixedAspect = (0,external_wp_element_.useMemo)(() => {
    const verticalFixed = fixed_aspect === 'vertical' && isVertical;
    const alwaysFixed = fixed_aspect === 'always';
    return (alwaysFixed || verticalFixed) && (fullwidth !== true || verticalFixed);
  }, [fixed_aspect, fullwidth, isVertical]);
  const aspectRatio = (0,external_wp_element_.useMemo)(() => {
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
  const innerPlayerStyles = (0,external_wp_element_.useMemo)(() => {
    const styles = {};
    // Apply aspect ratio to the inner player if we know it (fixed or native)
    if (isFixedAspect) {
      styles.aspectRatio = default_ratio || '16 / 9';
    } else if (aspectRatio) {
      styles.aspectRatio = aspectRatio.replace(':', ' / ');
    }
    return styles;
  }, [isFixedAspect, default_ratio, aspectRatio]);
  const playerStyles = (0,external_wp_element_.useMemo)(() => {
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
  const wrapperClasses = (0,external_wp_element_.useMemo)(() => {
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
  const actualAutoplay = (0,external_wp_element_.useMemo)(() => {
    return autoplay;
  }, [autoplay]);
  const finalizedSources = (0,external_wp_element_.useMemo)(() => {
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
  const uniqueKey = (0,external_wp_element_.useMemo)(() => {
    if (blockAttributes.id) {
      return `${blockAttributes.id}-${JSON.stringify(source_groups)}`;
    }
    return Math.random().toString(36).substr(2, 9);
  }, [blockAttributes.id, source_groups]);
  const genericPlayerOptions = (0,external_wp_element_.useMemo)(() => ({
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
  }), [poster, loop, actualAutoplay, preload, controls, muted, volume, playsinline, src, finalizedSources, text_tracks, final_embed_method]);
  const videoJsOptions = (0,external_wp_element_.useMemo)(() => {
    const isVjs = (0,external_wp_hooks_.applyFilters)(
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
          default_res: auto_res
        }
      };
    }
    return options;
  }, [final_embed_method, actualAutoplay, controls, muted, preload, poster, loop, playback_rate, playsinline, volume, auto_res, finalizedSources, source_groups, text_tracks, aspectRatio]);
  const handlePlay = (0,external_wp_element_.useCallback)(() => {
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
  const handlePause = (0,external_wp_element_.useCallback)(() => {
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
  const handleEnded = (0,external_wp_element_.useCallback)(() => {
    handlePause();
  }, [handlePause]);
  const onReadyRef = (0,external_wp_element_.useRef)(onReady);
  (0,external_wp_element_.useEffect)(() => {
    onReadyRef.current = onReady;
  }, [onReady]);
  (0,external_wp_element_.useEffect)(() => {
    if (typeof window !== 'undefined' && blockAttributes.id) {
      window.videopack = window.videopack || {};
      window.videopack.player_data = window.videopack.player_data || {};
      window.videopack.player_data[`videopack_player_${blockAttributes.id}`] = {
        source_groups
      };
    }
  }, [blockAttributes.id, source_groups]);
  const handleVideoPlayerReady = (0,external_wp_element_.useCallback)(player => {
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
  const handleMejsReady = (0,external_wp_element_.useCallback)(player => {
    if (onReadyRef.current) {
      onReadyRef.current(player);
    }
  }, []);
  const renderReady = src || finalizedSources && finalizedSources.length > 0;
  if (!renderReady) {
    return null; // Or a loading spinner
  }
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
    className: wrapperClasses,
    ref: wrapperRef,
    style: playerStyles,
    id: instanceId,
    children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      className: `videopack-player ${final_embed_method === 'Video.js' ? final_skin || '' : ''} ${!loopDuotoneId && resolvedDuotoneClass ? resolvedDuotoneClass : ''}`,
      style: {
        ...innerPlayerStyles,
        position: 'relative'
      },
      "data-id": blockAttributes.id,
      children: [(() => {
        const PlayerComponent = players[final_embed_method] || players.None;
        if (final_embed_method === 'Video.js') {
          return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(PlayerComponent, {
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
          return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(PlayerComponent, {
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
        return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(PlayerComponent, {
          options: videoJsOptions || genericPlayerOptions,
          ...(PlayerComponent === VideoPlayer_GenericPlayer ? genericPlayerOptions : {}),
          skin: final_skin,
          onPlay: handlePlay,
          onPause: handlePause,
          onEnded: handleEnded,
          onReady: handleVideoPlayerReady,
          onMetadataLoaded: onMetadataLoaded,
          source_groups: source_groups
        }, `${final_embed_method}-${src}-${resetKey}-${uniqueKey}-${blockAttributes.restartCount || 0}`);
      })(), Array.isArray(final_duotone) && resolvedDuotoneClass && !loopDuotoneId && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(Duotone_CustomDuotoneFilter, {
          colors: final_duotone,
          id: resolvedDuotoneClass
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("style", {
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
/* harmony default export */ const VideoPlayer_VideoPlayer = (VideoPlayer);
;// ./src/components/Preview/parts/CollectionWrapper.js


/**
 * Wrapper for Videopack Collection Previews.
 *
 * @param {Object} root0            Component props.
 * @param {Node}   root0.children   Children.
 * @param {Object} root0.attributes Block attributes.
 * @param {Object} root0.context    Block context.
 */

function CollectionWrapper({
  children,
  attributes = {},
  context = {}
}) {
  const {
    resolved,
    style,
    classes
  } = useVideopackContext(attributes, context);
  const {
    layout = 'grid',
    columns = 3,
    align = ''
  } = resolved;
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
    className: `videopack-collection videopack-wrapper layout-${layout} columns-${columns}${align ? ` align${align}` : ''} ${classes}`,
    style: {
      ...style,
      '--videopack-collection-columns': columns
    },
    children: children
  });
}
;// ./src/components/Preview/TemplatePreview.js


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
    return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(BlockPreview, {
      name: name,
      attributes: attributes,
      postId: video.attachment_id,
      isOverlay: isOverlay,
      video: video,
      innerBlocks: innerBlocks,
      ...currentFlags,
      context: itemContext,
      children: innerBlocks.length > 0 && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(TemplatePreview, {
        template: innerBlocks,
        video: video,
        context: itemContext,
        parentFlags: currentFlags
      })
    }, itemKey);
  });
}
;// ./src/components/Preview/parts/VideoLoop.js





/**
 * Loop component for rendering multiple Videopack items.
 *
 * @param {Object} root0             Component props.
 * @param {Node}   root0.children    Children.
 * @param {Object} root0.attributes  Block attributes.
 * @param {Object} root0.context     Block context.
 * @param {Array}  root0.innerBlocks Inner blocks data.
 */

function VideoLoop({
  children,
  attributes = {},
  context = {},
  innerBlocks
}) {
  const {
    resolved,
    style,
    classes
  } = useVideopackContext(attributes, context);
  const {
    videos = [],
    layout = 'grid',
    columns = 3,
    duotone
  } = resolved;
  const loopDuotoneId = (0,external_wp_element_.useMemo)(() => {
    if (!duotone || !Array.isArray(duotone)) {
      return null;
    }
    return `videopack-loop-duotone-${Math.random().toString(36).substr(2, 9)}`;
  }, [duotone]);
  const loopPresetClass = duotone && typeof duotone === 'string' && duotone.startsWith('var:preset|duotone|') ? `wp-duotone-${duotone.split('|').pop()}` : '';
  const loopContext = (0,external_wp_element_.useMemo)(() => {
    if (!loopDuotoneId) {
      return context;
    }
    return {
      ...context,
      'videopack/loopDuotoneId': loopDuotoneId
    };
  }, [context, loopDuotoneId]);
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
    className: `videopack-video-loop layout-${layout} columns-${columns} ${classes} ${loopDuotoneId || ''} ${loopPresetClass}`,
    style: style,
    children: [loopDuotoneId && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(Duotone_CustomDuotoneFilter, {
        colors: duotone,
        id: loopDuotoneId
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("style", {
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
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
      className: "videopack-collection-grid",
      children: videos.map((video, index) => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "videopack-collection-item",
        children: innerBlocks ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(TemplatePreview, {
          template: innerBlocks,
          video: video,
          context: loopContext
        }) : children
      }, video.attachment_id || index))
    })]
  });
}
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
  const vpContext = useVideopackContext(attributes, context);
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
;// ./node_modules/@wordpress/icons/build-module/icon/index.mjs
// packages/icons/src/icon/index.ts

var icon_default = (0,external_wp_element_.forwardRef)(
  ({ icon, size = 24, ...props }, ref) => {
    return (0,external_wp_element_.cloneElement)(icon, {
      width: size,
      height: size,
      ...props,
      ref
    });
  }
);

//# sourceMappingURL=index.mjs.map

;// ./node_modules/@wordpress/icons/build-module/library/download.mjs
// packages/icons/src/library/download.tsx


var download_default = /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.Path, { d: "M18 11.3l-1-1.1-4 4V3h-1.5v11.3L7 10.2l-1 1.1 6.2 5.8 5.8-5.8zm.5 3.7v3.5h-13V15H4v5h16v-5h-1.5z" }) });

//# sourceMappingURL=download.mjs.map

;// ./src/blocks/player-container/block.json
const block_namespaceObject = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"videopack/player-container","title":"Videopack Video","category":"media","icon":"format-video","description":"Embed a single video with Videopack features.","usesContext":["postId","postType"],"supports":{"html":false,"align":true,"dimensions":{"aspectRatio":false,"height":false,"minHeight":false,"width":false},"spacing":{"margin":true,"padding":true,"blockGap":true},"filter":{"duotone":true}},"selectors":{"filter":{"duotone":".wp-block-videopack-player-container .vjs-poster img, .wp-block-videopack-player-container .mejs-poster img, .wp-block-videopack-player-container .mejs-poster"}},"example":{"attributes":{"src":"videopack-preview-video","title":"Sample Video","overlay_title":true,"isPreview":true}},"attributes":{"id":{"type":"number"},"src":{"type":"string"},"poster":{"type":"string"},"title":{"type":"string"},"caption":{"type":"string"},"width":{"type":"number"},"height":{"type":"number"},"autoplay":{"type":"boolean","default":false},"controls":{"type":"boolean","default":true},"loop":{"type":"boolean","default":false},"muted":{"type":"boolean","default":false},"playsinline":{"type":"boolean","default":false},"preload":{"type":"string","default":"metadata"},"volume":{"type":"number","default":1},"auto_res":{"type":"string"},"sources":{"type":"array","default":[]},"source_groups":{"type":"object","default":{}},"text_tracks":{"type":"array","default":[]},"playback_rate":{"type":"boolean","default":false},"watermark":{"type":"string"},"watermark_styles":{"type":"object","default":{}},"watermark_link_to":{"type":"string","default":""},"default_ratio":{"type":"string","default":"16 / 9"},"fixed_aspect":{"type":"string","default":"false"},"fullwidth":{"type":"boolean","default":false},"textAlign":{"type":"string"},"downloadlink":{"type":"boolean"},"overlay_title":{"type":"boolean"},"views":{"type":"boolean"},"embedcode":{"type":"boolean"},"embedlink":{"type":"string"},"embed_method":{"type":"string"},"showCaption":{"type":"boolean","default":false},"showBackground":{"type":"boolean"},"title_position":{"type":"string","default":"top"},"isInsidePlayerOverlay":{"type":"boolean","default":false},"restartCount":{"type":"number","default":0},"isInsidePlayerContainer":{"type":"boolean","default":true},"isPreview":{"type":"boolean","default":false}},"textdomain":"video-embed-thumbnail-generator","editorScript":"file:./index.js","editorStyle":"file:./index.css"}');
;// ./src/blocks/thumbnail/block.json
const thumbnail_block_namespaceObject = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"videopack/thumbnail","title":"Videopack Thumbnail","category":"media","icon":"format-image","editorStyle":"file:./index.css","description":"Displays the video poster image. Can contain the play button and duration overlays.","attributes":{"linkTo":{"type":"string","default":"none"},"isInsideThumbnail":{"type":"boolean","default":true},"isPreview":{"type":"boolean","default":false}},"example":{"attributes":{"isPreview":true}},"usesContext":["postId","postType"],"supports":{"html":false,"align":true,"spacing":{"margin":true,"padding":true},"filter":{"duotone":true}},"selectors":{"filter":{"duotone":".wp-block-videopack-thumbnail img"}},"textdomain":"video-embed-thumbnail-generator","editorScript":"file:./index.js"}');
;// ./src/blocks/title/block.json
const title_block_namespaceObject = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"videopack/title","title":"Videopack Title","category":"media","parent":["videopack/player-container","videopack/player","videopack/thumbnail","videopack/loop"],"icon":"heading","description":"Overlay title and action buttons for the video player.","usesContext":["postId","postType"],"providesContext":{"videopack/isInsideTitleMeta":"isInsideTitleMeta"},"attributes":{"isInsideTitleMeta":{"type":"boolean","default":true},"title":{"type":"string","default":""},"tagName":{"type":"string","default":"h3"},"isOverlay":{"type":"boolean"},"title_color":{"type":"string"},"title_background_color":{"type":"string"},"position":{"type":"string"},"textAlign":{"type":"string"},"embedlink":{"type":"string"},"embedcode":{"type":"boolean"},"overlay_title":{"type":"boolean"},"showBackground":{"type":"boolean"},"usePostTitle":{"type":"boolean","default":false},"linkToPost":{"type":"boolean","default":false},"isPreview":{"type":"boolean","default":false}},"example":{"attributes":{"title":"Sample Video Title","isOverlay":true,"isPreview":true}},"supports":{"html":false,"reusable":false,"typography":{"fontSize":true,"lineHeight":true}},"textdomain":"video-embed-thumbnail-generator","editorScript":"file:./index.js","editorStyle":"file:./index.css"}');
;// ./src/blocks/download/block.json
const download_block_namespaceObject = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"videopack/download","title":"Videopack Video Download","category":"media","icon":"download","description":"Displays a dynamic download link, button, or quality dropdown list for the video.","parent":["videopack/title","videopack/player-container","videopack/player","videopack/thumbnail","videopack/loop"],"usesContext":["postId","postType","videopack/postId","videopack/attachmentId","videopack/isInsidePlayerOverlay","videopack/isInsidePlayerContainer","videopack/isInsideThumbnail","videopack/isInsideTitleMeta","videopack/textAlign","videopack/position","videopack/title_color","videopack/title_background_color"],"attributes":{"icon":{"type":"boolean"},"text":{"type":"boolean"},"styleType":{"type":"string"},"downloadMode":{"type":"string"},"textAlign":{"type":"string"},"position":{"type":"string"},"title_color":{"type":"string"},"title_background_color":{"type":"string"},"isPreview":{"type":"boolean","default":false}},"supports":{"html":false,"typography":{"fontSize":true,"lineHeight":true},"spacing":{"margin":true,"padding":true}},"textdomain":"video-embed-thumbnail-generator","editorScript":"file:./index.js","editorStyle":"file:./index.css"}');
;// ./src/blocks/share/block.json
const share_block_namespaceObject = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"videopack/share","title":"Videopack Video Share","category":"media","icon":"share","description":"Displays a share/embed toggle link or button for the video.","parent":["videopack/title","videopack/player-container","videopack/player","videopack/thumbnail","videopack/loop"],"usesContext":["postId","postType","videopack/postId","videopack/attachmentId","videopack/isInsidePlayerOverlay","videopack/isInsidePlayerContainer","videopack/isInsideThumbnail","videopack/isInsideTitleMeta","videopack/textAlign","videopack/position","videopack/title_color","videopack/title_background_color"],"attributes":{"iconType":{"type":"string","default":"share"},"showText":{"type":"boolean","default":false},"styleType":{"type":"string","default":"text"},"textAlign":{"type":"string"},"position":{"type":"string"},"title_color":{"type":"string"},"title_background_color":{"type":"string"},"isPreview":{"type":"boolean","default":false},"shareCopyLink":{"type":"boolean","default":true},"shareNativeShare":{"type":"boolean","default":true},"shareBluesky":{"type":"boolean","default":true},"shareThreads":{"type":"boolean","default":true},"shareFacebook":{"type":"boolean","default":true},"shareReddit":{"type":"boolean","default":true},"shareEmail":{"type":"boolean","default":true}},"supports":{"html":false,"typography":{"fontSize":true,"lineHeight":true},"spacing":{"margin":true,"padding":true}},"textdomain":"video-embed-thumbnail-generator","editorScript":"file:./index.js","editorStyle":"file:./index.css"}');
;// ./src/utils/titleDownloadBlock.js
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
;// ./src/blocks/duration/block.json
const duration_block_namespaceObject = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"videopack/duration","title":"Videopack Duration","category":"media","icon":"clock","description":"Displays the video duration.","usesContext":["postId","postType"],"attributes":{"position":{"type":"string"},"textAlign":{"type":"string"},"title_color":{"type":"string"},"title_background_color":{"type":"string"},"isPreview":{"type":"boolean","default":false}},"example":{"attributes":{"isPreview":true}},"supports":{"html":false,"typography":{"fontSize":true,"lineHeight":true},"spacing":{"margin":true,"padding":true}},"textdomain":"video-embed-thumbnail-generator","editorScript":"file:./index.js"}');
;// ./src/blocks/view-count/block.json
const view_count_block_namespaceObject = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"videopack/view-count","title":"Videopack View Count","category":"media","icon":"visibility","description":"Displays the view count of the video.","usesContext":["postId","postType"],"attributes":{"iconType":{"type":"string","default":"none"},"showText":{"type":"boolean","default":true},"textAlign":{"type":"string"},"title_color":{"type":"string"},"title_background_color":{"type":"string"},"isPreview":{"type":"boolean","default":false}},"example":{"attributes":{"iconType":"playOutline","isPreview":true}},"supports":{"html":false,"typography":{"fontSize":true,"lineHeight":true},"spacing":{"margin":true,"padding":true}},"textdomain":"video-embed-thumbnail-generator","editorScript":"file:./index.js"}');
;// ./src/blocks/watermark/block.json
const watermark_block_namespaceObject = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"videopack/watermark","title":"Videopack Watermark","category":"media","icon":"art","description":"Displays a watermark overlay on the video.","parent":["videopack/player-container","videopack/player"],"attributes":{"watermark":{"type":"string"},"watermark_link_to":{"type":"string","default":"false"},"watermark_url":{"type":"string"},"watermark_align":{"type":"string","default":"right"},"watermark_valign":{"type":"string","default":"bottom"},"watermark_scale":{"type":"number","default":10},"watermark_x":{"type":"number","default":5},"watermark_y":{"type":"number","default":7},"isPreview":{"type":"boolean","default":false}},"example":{"attributes":{"watermark":"https://s.w.org/style/images/about/WordPress-logotype-wmark.png","isPreview":true}},"supports":{"html":false,"reusable":false},"textdomain":"video-embed-thumbnail-generator","editorScript":"file:./index.js","editorStyle":"file:./index.css"}');
;// ./src/blocks/play-button/block.json
const play_button_block_namespaceObject = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"videopack/play-button","title":"Videopack Play Button","category":"media","icon":"controls-play","description":"Displays a play button overlay.","attributes":{"play_button_color":{"type":"string"},"play_button_secondary_color":{"type":"string"},"isPreview":{"type":"boolean","default":false}},"example":{"attributes":{"isPreview":true}},"supports":{"html":false},"textdomain":"video-embed-thumbnail-generator","editorScript":"file:./index.js"}');
;// ./src/blocks/shared/design-context.js
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
const usesDesignContext = (/* unused pure expression or super */ null && (['videopack/skin', 'videopack/title_color', 'videopack/title_background_color', 'videopack/play_button_color', 'videopack/play_button_secondary_color', 'videopack/control_bar_bg_color', 'videopack/control_bar_color', 'videopack/pagination_color', 'videopack/pagination_background_color', 'videopack/pagination_active_bg_color', 'videopack/pagination_active_color', 'videopack/watermark', 'videopack/watermark_styles', 'videopack/watermark_link_to']));
;// ./src/components/Preview/BlockPreview.js

























const BLOCK_METADATA = {
  'videopack/player-container': block_namespaceObject,
  'videopack/thumbnail': thumbnail_block_namespaceObject,
  'videopack/title': title_block_namespaceObject,
  'videopack/download': download_block_namespaceObject,
  'videopack/share': share_block_namespaceObject,
  'videopack/duration': duration_block_namespaceObject,
  'videopack/view-count': view_count_block_namespaceObject,
  'videopack/watermark': watermark_block_namespaceObject,
  'videopack/play-button': play_button_block_namespaceObject
};

/**
 * Get all registered attributes for a block name, including shared design attributes.
 * @param {string} name Block name.
 */
const getBlockAttributes = name => {
  const metadata = BLOCK_METADATA[name];
  const keys = [];
  if (metadata?.attributes) {
    keys.push(...Object.keys(metadata.attributes));
  }

  // Add shared design attributes that blocks might use via context but pass as props
  keys.push(...Object.keys(designAttributes || {}));

  // Global internal keys that should never hit the DOM
  keys.push('variation', 'isPreview', 'isOverlay', 'isInsideThumbnail', 'isInsidePlayerOverlay', 'isInsidePlayerContainer');
  return [...new Set(keys)];
};

/**
 * Filter props to only include standard DOM primitives.
 *
 * @param {Object} props Component props.
 * @param {string} name  Block name.
 * @return {Object} Clean DOM props.
 */
const getCleanDomProps = (props, name) => {
  const blockAttributeKeys = getBlockAttributes(name);
  const cleanDomProps = {};
  Object.keys(props).forEach(key => {
    if (key !== 'attributes' && !blockAttributeKeys.includes(key) && !key.startsWith('videopack/') && typeof props[key] !== 'object' && typeof props[key] !== 'function') {
      cleanDomProps[key] = props[key];
    }
  });
  return cleanDomProps;
};
const PREVIEW_COMPONENTS = {
  'videopack/player-container': props => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(PlayerContainer, {
    ...props,
    ...getCleanDomProps(props, 'videopack/player-container')
  }),
  'videopack/collection': CollectionWrapper,
  'videopack/loop': VideoLoop,
  'videopack/pagination': Pagination,
  'videopack/thumbnail': props => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(VideoThumbnailPreview, {
    ...props,
    ...getCleanDomProps(props, 'videopack/thumbnail')
  }),
  'videopack/title': props => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(VideoTitle, {
    ...props,
    ...getCleanDomProps(props, 'videopack/title')
  }),
  'videopack/download': props => {
    const attrs = {
      ...TITLE_DOWNLOAD_BLOCK_ATTRS,
      ...props.attributes
    };
    const styleType = attrs.styleType || 'text';
    return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
      className: `videopack-download-wrapper videopack-download-block is-inside-title-meta mode-${attrs.downloadMode || 'direct'}`,
      style: {
        display: 'inline-flex',
        alignItems: 'center'
      },
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("button", {
        type: "button",
        className: `videopack-download-link videopack-icons style-${styleType}`,
        children: attrs.icon !== false && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(icon_default, {
          icon: download_default,
          className: "videopack-icon-svg"
        })
      })
    });
  },
  'videopack/share': props => {
    const attrs = {
      iconType: 'share',
      showText: false,
      styleType: 'text',
      ...props.attributes
    };
    const styleType = attrs.styleType || 'text';
    const iconType = attrs.iconType || 'share';
    const shareIconSvg = /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("svg", {
      className: "videopack-icon-svg share-icon",
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      "aria-hidden": "true",
      focusable: "false",
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("path", {
        d: "M9 11.8l6.1-4.5c.1.4.4.7.9.7h2c.6 0 1-.4 1-1V5c0-.6-.4-1-1-1h-2c-.6 0-1 .4-1 1v.4l-6.4 4.8c-.2-.1-.4-.2-.6-.2H6c-.6 0-1 .4-1 1v2c0 .6.4 1 1 1h2c.2 0 .4-.1.6-.2l6.4 4.8v.4c0 .6.4 1 1 1h2c.6 0 1-.4 1-1v-2c0-.6-.4-1-1-1h-2c-.5 0-.8.3-.9.7L9 12.2v-.4z"
      })
    });
    const externalIconSvg = /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("svg", {
      className: "videopack-icon-svg external-icon",
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true",
      focusable: "false",
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("path", {
        d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
      })
    });
    const iosShareIconSvg = /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("svg", {
      className: "videopack-icon-svg ios-share-icon",
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true",
      focusable: "false",
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("path", {
        d: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"
      })
    });
    let activeIcon = null;
    if (iconType === 'share') {
      activeIcon = shareIconSvg;
    } else if (iconType === 'external') {
      activeIcon = externalIconSvg;
    } else if (iconType === 'iosShare') {
      activeIcon = iosShareIconSvg;
    }
    return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
      className: "videopack-share-wrapper videopack-share-block is-inside-title-meta",
      style: {
        display: 'inline-flex',
        alignItems: 'center'
      },
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("button", {
        type: "button",
        className: `videopack-share-link videopack-share-toggle videopack-icons style-${styleType}`,
        children: [iconType !== 'none' && activeIcon, (attrs.showText || iconType === 'none') && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
          className: "videopack-share-text-label",
          style: iconType !== 'none' ? {
            marginLeft: '4px'
          } : undefined,
          children: (0,external_wp_i18n_.__)('Share', 'video-embed-thumbnail-generator')
        })]
      })
    });
  },
  'videopack/duration': props => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(VideoDuration, {
    ...props,
    ...getCleanDomProps(props, 'videopack/duration')
  }),
  'videopack/view-count': props => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(ViewCount, {
    ...props,
    ...getCleanDomProps(props, 'videopack/view-count')
  }),
  'videopack/play-button': props => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(PlayButton, {
    ...props,
    ...getCleanDomProps(props, 'videopack/play-button')
  }),
  'videopack/watermark': props => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(VideoWatermark, {
    ...props,
    ...getCleanDomProps(props, 'videopack/watermark')
  }),
  'videopack/player': ({
    children,
    attributes,
    context,
    video
  }) => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
    className: "videopack-video-preview",
    children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(VideoPlayer_VideoPlayer, {
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
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(Component, {
    ...attributes,
    attributes: attributes,
    context: context,
    ...props,
    children: children
  });
}
;// ./src/components/Preview/index.js
/**
 * Barrel export for the Videopack Preview system.
 */






;// ./src/utils/templates.js
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
    engineChildren.push(['videopack/title', {}, getTitleInnerTemplate(!!options?.downloadlink, !!options?.embedcode)]);
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
// EXTERNAL MODULE: ./src/hooks/useVideoQuery.js
var useVideoQuery = __webpack_require__(877);
;// ./src/features/tinymce/tinymce.js
/**
 * Features for integrating Videopack with the TinyMCE editor.
 */








/* global videopack_config, tinymce, MutationObserver, videojs */


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
    } catch {
      // Cross-origin issues, ignore
    }

    // 6. Gutenberg State (if active)
    try {
      const wpData = window.wp?.data || window.parent?.wp?.data;
      if (wpData) {
        results.gutenberg = wpData.select('core/editor')?.getCurrentPostId();
      }
    } catch {
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
    const activePostId = (0,external_wp_element_.useMemo)(() => detectPostId(), []);
    // Use unified context hook for all design and behavior resolution.
    // TinyMCE doesn't have block context, so we pass an empty object.
    const vpContext = useVideopackContext(attributes, {}, {
      excludeHoverTrigger: true
    });
    const mergedAttributes = (0,external_wp_element_.useMemo)(() => {
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
    } = (0,useVideoQuery/* default */.A)({
      ...mergedAttributes,
      page_number: 1
    }, activePostId);
    const [isSelected, setIsSelected] = (0,external_wp_element_.useState)(false);
    const themePresetsStyle = (0,external_wp_element_.useMemo)(() => {
      const colors = videopack_config?.themeColors || [];
      const styles = {};
      colors.forEach(c => {
        styles[`--wp--preset--color--${c.slug}`] = c.color;
      });
      return styles;
    }, []);

    // Watch for selection changes on the wpview container
    (0,external_wp_element_.useEffect)(() => {
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
      return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "loading-placeholder",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
          className: "dashicons dashicons-admin-media"
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
          className: "wpview-loading",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("ins", {})
        })]
      });
    }

    // Resolve template
    let template;
    if (type === 'Video') {
      const showTitleBar = !!(mergedAttributes.overlay_title !== false || mergedAttributes.downloadlink || mergedAttributes.embedcode);
      const engineChildren = [];
      if (showTitleBar) {
        engineChildren.push(['videopack/title', {}, getTitleInnerTemplate(!!mergedAttributes.downloadlink, !!mergedAttributes.embedcode)]);
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
      template = getGridTemplate(mergedAttributes);
    } else {
      template = getListTemplate(mergedAttributes);
    }
    const contextValue = {
      ...vpContext.sharedContext,
      'videopack/videos': videoResults,
      'videopack/layout': type === 'Gallery' ? 'grid' : 'list',
      'videopack/columns': parseInt(mergedAttributes.gallery_columns, 10) || 3,
      'videopack/totalPages': maxNumPages,
      'videopack/currentPage': 1
    };
    return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      className: "videopack-tinymce-wrapper",
      style: themePresetsStyle,
      children: [videopack_config?.globalStyles && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("style", {
        dangerouslySetInnerHTML: {
          __html: videopack_config.globalStyles
        }
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(TemplatePreview, {
        attributes: mergedAttributes,
        template: template,
        context: contextValue,
        video: videoResults[0],
        postId: detectPostId()
      }), !isSelected && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "videopack-block-overlay"
      })]
    });
  };

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
        mountNode.__reactRoot = (0,external_wp_element_.createRoot)(mountNode);
      }
      mountNode.__reactRoot.render(/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(PlaceHolderWrapper, {
        type: type,
        attributes: attrs,
        mountNode: mountNode
      }));
      mountNode.dataset.videopackMounted = 'true';
    } catch (error) {
      console.error('Videopack TinyMCE React render error:', error);
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
        } catch (error) {
          console.error('Videopack scanAndMountAll error:', error);
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
          } catch {
            // ignore
          }
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
            title: (0,external_wp_i18n_.__)('Edit Videopack Shortcode', 'video-embed-thumbnail-generator'),
            button: {
              text: (0,external_wp_i18n_.__)('Update', 'video-embed-thumbnail-generator')
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
          let thickboxTitle = (0,external_wp_i18n_.__)('Edit Video', 'video-embed-thumbnail-generator');
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
            thickboxTitle = (0,external_wp_i18n_.__)('Edit Gallery', 'video-embed-thumbnail-generator');
            params.set('tab', 'embedgallery');
          } else if (isListInEdit) {
            thickboxTitle = (0,external_wp_i18n_.__)('Edit Video List', 'video-embed-thumbnail-generator');
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
    tinymce.on('AddEditor', event => {
      initEditor(event.editor);
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