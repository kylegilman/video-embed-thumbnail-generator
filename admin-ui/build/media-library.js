/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 8533
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* unused harmony exports getPresets, getVideoGallery, getUsersWithCapability, getFreemiusPage, testEncodeCommand */
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
  const pre = applyFilters('videopack.utils.pre_getVideoGallery', undefined, args);
  if (typeof pre !== 'undefined') {
    return pre;
  }
  try {
    const response = await apiFetch({
      path: addQueryArgs('/videopack/v1/video_gallery', args),
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
    return applyFilters('videopack.utils.getVideoGallery', response, args);
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
  const pre = applyFilters('videopack.utils.pre_testEncodeCommand', undefined, codec, resolution);
  if (typeof pre !== 'undefined') {
    return pre;
  }
  try {
    return await apiFetch({
      path: `/videopack/v1/ffmpeg-test/?codec=${codec}&resolution=${resolution}`
    });
  } catch (error) {
    console.error('Error testing encode command:', error);
    throw error;
  }
};
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "EA", 0, /* binding */ getVideoFormats,
/* harmony export */   "UP", 0, /* binding */ getVideoSources
/* harmony export */ ]);


/***/ },

/***/ 9427
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* unused harmony exports insertImage, save, sortAscending, sortDescending, videopack, videopackCaption, videopackCollection, videopackDuration, videopackGallery, videopackList, videopackLoop, videopackPagination, videopackPlayButton, videopackPlayer, videopackThumbnail, videopackVideo */
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
const videopack = /*#__PURE__*/(/* unused pure expression or super */ null && (_jsxs("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/_jsxs("g", {
    transform: "rotate(-45 200.518 199.773)",
    children: [/*#__PURE__*/_jsx("circle", {
      cx: 200.52,
      cy: 199.77,
      r: 182.56,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/_jsx("circle", {
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
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M98.37 124.52h45.81l57.42 98.69 55.57-98.69h47.48L201.51 303.03 98.37 125.9"
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m257.17 124.52-55.57 98.69-57.42-98.69"
  })]
})));
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
const videopackCollection = /*#__PURE__*/(/* unused pure expression or super */ null && (_jsx("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: /*#__PURE__*/_jsx("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 14
    },
    d: "M12.01 84.61h170.53v93.84H12.01zm210.09 0h170.53v93.84H222.1zM12.01 221.62h170.53v93.84H12.01zm210.09 0h170.53v93.84H222.1z"
  })
})));
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
const videopackGallery = /*#__PURE__*/(/* unused pure expression or super */ null && (_jsxs("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/_jsx("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 14
    },
    d: "M8.14 84.54h170.53v93.84H8.14z"
  }), /*#__PURE__*/_jsxs("g", {
    transform: "rotate(-5.65 92.234 131.62)",
    children: [/*#__PURE__*/_jsx("circle", {
      cx: 92.16,
      cy: 131.51,
      r: 34.87,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/_jsx("circle", {
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
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M77.79 151.02v-8.75l18.85-10.97-18.85-10.61v-9.07l34.1 19.7-33.84 19.7"
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m77.79 120.69 18.85 10.61-18.85 10.97"
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 14
    },
    d: "M220.87 84.54H391.4v93.84H220.87z"
  }), /*#__PURE__*/_jsxs("g", {
    transform: "rotate(-5.65 309.192 131.66)",
    children: [/*#__PURE__*/_jsx("circle", {
      cx: 308.89,
      cy: 131.51,
      r: 34.87,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/_jsx("circle", {
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
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M294.51 151.02v-8.75l18.85-10.97-18.85-10.61v-9.07l34.1 19.7-33.83 19.7"
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m294.51 120.69 18.85 10.61-18.85 10.97"
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 14
    },
    d: "M8.14 221.62h170.53v93.84H8.14z"
  }), /*#__PURE__*/_jsxs("g", {
    transform: "rotate(-5.65 92.268 268.846)",
    children: [/*#__PURE__*/_jsx("circle", {
      cx: 92.16,
      cy: 268.58,
      r: 34.87,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/_jsx("circle", {
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
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M77.79 288.09v-8.75l18.85-10.96-18.85-10.62v-9.07l34.1 19.7-33.84 19.7"
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m77.79 257.76 18.85 10.62-18.85 10.96"
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 14
    },
    d: "M220.87 221.62H391.4v93.84H220.87z"
  }), /*#__PURE__*/_jsxs("g", {
    transform: "rotate(-5.65 309.13 268.78)",
    children: [/*#__PURE__*/_jsx("circle", {
      cx: 308.89,
      cy: 268.58,
      r: 34.87,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/_jsx("circle", {
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
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M294.51 288.09v-8.75l18.85-10.96-18.85-10.62v-9.07l34.1 19.7-33.83 19.7"
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m294.51 257.76 18.85 10.62-18.85 10.96"
  })]
})));
const videopackList = /*#__PURE__*/(/* unused pure expression or super */ null && (_jsxs("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/_jsx("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 14
    },
    d: "M111.79 6.56h185.1v101.85h-185.1z"
  }), /*#__PURE__*/_jsxs("g", {
    transform: "rotate(-5.65 205.384 57.57)",
    children: [/*#__PURE__*/_jsx("circle", {
      cx: 205.16,
      cy: 57.53,
      r: 37.85,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/_jsx("circle", {
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
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M189.56 78.71v-9.49l20.46-11.91-20.46-11.52v-9.84l37 21.38-36.72 21.38"
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m189.56 45.79 20.46 11.52-20.46 11.91"
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 14
    },
    d: "M111.79 148.88h185.1v101.85h-185.1z"
  }), /*#__PURE__*/_jsxs("g", {
    transform: "rotate(-5.65 205.365 199.974)",
    children: [/*#__PURE__*/_jsx("circle", {
      cx: 205.16,
      cy: 199.85,
      r: 37.85,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/_jsx("circle", {
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
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M189.56 221.03v-9.5l20.46-11.9-20.46-11.52v-9.85l37 21.39-36.72 21.38"
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m189.56 188.11 20.46 11.52-20.46 11.9"
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 14
    },
    d: "M111.79 290.2h185.1v101.85h-185.1z"
  }), /*#__PURE__*/_jsxs("g", {
    transform: "rotate(-5.65 205.392 341.466)",
    children: [/*#__PURE__*/_jsx("circle", {
      cx: 205.16,
      cy: 341.17,
      r: 37.85,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/_jsx("circle", {
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
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M189.56 362.35v-9.5l20.46-11.9-20.46-11.52v-9.85l37 21.38-36.72 21.39"
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m189.56 329.43 20.46 11.52-20.46 11.9"
  })]
})));
const videopackLoop = /*#__PURE__*/(/* unused pure expression or super */ null && (_jsxs("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/_jsx("path", {
    d: "M352.41 199.29c-.01 35.29-28.64 63.89-63.93 63.88-29.13-.01-54.56-19.72-61.85-47.92l-.17-.73-.24-.71-15.43-45.44-.1.05c-17.16-54.81-75.5-85.33-130.31-68.17-43.31 13.56-72.82 53.64-72.92 99.02-.01 57.4 46.51 103.95 103.91 103.97 13 0 25.88-2.43 37.98-7.18l-14.62-37.27c-32.86 12.87-69.94-3.33-82.81-36.19s3.33-69.94 36.19-82.81 69.94 3.33 82.81 36.19c.94 2.39 1.73 4.84 2.37 7.33l.24-.07 14.5 42.78c14.88 55.47 71.91 88.38 127.38 73.5 45.38-12.17 76.96-53.25 77.05-100.24.01-57.4-46.51-103.95-103.92-103.96-12.97 0-25.82 2.42-37.9 7.15l14.59 37.29c32.87-12.85 69.94 3.39 82.78 36.26 2.9 7.41 4.38 15.3 4.38 23.26",
    style: {
      fill: '#cd0000'
    }
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M90.65 230.42v-13.6l29.3-17.05-29.3-16.49v-14.1l52.99 30.62-52.58 30.62"
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m90.65 183.28 29.3 16.49-29.3 17.05"
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M266.39 230.42v-13.6l29.29-17.05-29.29-16.49v-14.1l52.99 30.62-52.58 30.62"
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m266.39 183.28 29.29 16.49-29.29 17.05"
  })]
})));
const videopackPagination = /*#__PURE__*/(/* unused pure expression or super */ null && (_jsxs("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/_jsx("rect", {
    x: 4,
    y: 127.95,
    width: 117.18,
    height: 117.18,
    rx: 7,
    ry: 7,
    style: {
      fill: '#cd0000'
    }
  }), /*#__PURE__*/_jsx("path", {
    d: "M69.1 210.32h-6.2v-38.03c-2.51 1.67-6.39 2.51-11.64 2.51v-4.88c7.59 0 11.94-2.92 13.06-8.77h4.78v49.18Z",
    style: {
      fill: '#fff'
    }
  }), /*#__PURE__*/_jsx("rect", {
    x: 145.36,
    y: 131.95,
    width: 109.18,
    height: 109.18,
    rx: 3,
    ry: 3,
    style: {
      fill: '#fff'
    }
  }), /*#__PURE__*/_jsx("path", {
    d: "M250.54 135.95v101.18H149.36V135.95zm1-8H148.36c-3.87 0-7 3.13-7 7v103.18c0 3.87 3.13 7 7 7h103.18c3.87 0 7-3.13 7-7V134.95c0-3.87-3.13-7-7-7",
    style: {
      fill: '#cd0000'
    }
  }), /*#__PURE__*/_jsx("path", {
    d: "M215.24 210.32h-32.03c0-2.95.91-5.76 2.74-8.44s5.17-5.99 10.04-9.91 8.21-7.06 10.01-9.4 2.7-5 2.7-7.97c0-2.66-.77-4.75-2.31-6.28s-3.71-2.29-6.5-2.29c-2.42 0-4.49.77-6.2 2.31s-2.68 3.8-2.9 6.79h-6.43c.35-4.24 1.92-7.64 4.7-10.17 2.78-2.54 6.44-3.81 10.97-3.81 4.82 0 8.53 1.29 11.15 3.88 2.62 2.58 3.92 5.82 3.92 9.71 0 3.52-.97 6.62-2.9 9.32-1.94 2.69-5.78 6.44-11.53 11.23q-8.625 7.185-8.79 9.3h23.35v5.74Z",
    style: {
      fill: '#cd0000'
    }
  }), /*#__PURE__*/_jsx("rect", {
    x: 282.73,
    y: 131.95,
    width: 109.18,
    height: 109.18,
    rx: 3,
    ry: 3,
    style: {
      fill: '#fff'
    }
  }), /*#__PURE__*/_jsx("path", {
    d: "M387.91 135.95v101.18H286.73V135.95zm1-8H285.73c-3.87 0-7 3.13-7 7v103.18c0 3.87 3.13 7 7 7h103.18c3.87 0 7-3.13 7-7V134.95c0-3.87-3.13-7-7-7",
    style: {
      fill: '#cd0000'
    }
  }), /*#__PURE__*/_jsx("path", {
    d: "m325.77 171.83 4.27-4.39 26.58 22.19-26.58 22.19-4.27-4.35 21.55-17.76z",
    style: {
      fill: '#cd0000'
    }
  })]
})));
const videopackPlayButton = /*#__PURE__*/(/* unused pure expression or super */ null && (_jsxs("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/_jsxs("g", {
    transform: "rotate(-45 205.37 193.523)",
    children: [/*#__PURE__*/_jsx("circle", {
      cx: 205.37,
      cy: 193.52,
      r: 87.51,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/_jsx("circle", {
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
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M169.29 242.49v-21.96l47.31-27.52-47.31-26.64V143.6l85.58 49.45-84.91 49.44"
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m169.29 166.37 47.31 26.64-47.31 27.52"
  })]
})));
const videopackPlayer = /*#__PURE__*/(/* unused pure expression or super */ null && (_jsxs("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/_jsx("circle", {
    cx: 197.8,
    cy: 200.99,
    r: 69.82,
    style: {
      fill: '#fff'
    }
  }), /*#__PURE__*/_jsx("circle", {
    cx: 197.8,
    cy: 200.99,
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
    d: "M169.02 240.06v-17.52l37.74-21.96-37.74-21.25v-18.16l68.27 39.44-67.74 39.45"
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m169.02 179.33 37.74 21.25-37.74 21.96"
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 19
    },
    d: "M13.89 96.92h372.22v209.25H13.89z"
  })]
})));
const videopackThumbnail = /*#__PURE__*/(/* unused pure expression or super */ null && (_jsxs("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/_jsx("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M170.16 207.08v-19.61l42.27-24.6-42.27-23.8v-20.34l76.46 44.18-75.86 44.17"
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m170.16 139.07 42.27 23.8-42.27 24.6M46.7 364.45c-6.58 0-10.96-4.39-10.96-10.96v-52.62l89.9-65.78 65.78 41.66c6.58 4.39 15.35 4.39 19.73-2.19l76.74-74.55 76.74 74.55v78.94c0 6.58-4.39 10.96-10.96 10.96"
  }), /*#__PURE__*/_jsx("path", {
    d: "M353.83 2.67H46.85c-24.12 0-43.86 19.74-43.86 43.86v306.98c0 24.12 19.73 43.85 43.85 43.85h306.98c24.12 0 43.85-19.73 43.85-43.85V46.53c0-24.12-19.73-43.85-43.85-43.85Zm10.96 350.83c0 6.58-4.39 10.96-10.96 10.96H46.85c-6.58 0-10.96-4.39-10.96-10.96v-52.62l89.9-65.78 65.78 41.66c6.58 4.39 15.35 4.39 19.73-2.19l76.74-74.55 76.74 74.55v78.94Zm-85.63-188.64c-.79.64-1.49 1.39-2.08 2.27l-78.94 76.74-63.59-43.85c-.57-.38-1.14-.72-1.71-1.03a77 77 0 0 1-8.68-35.6c0-42.74 34.77-77.51 77.51-77.51s77.51 34.77 77.51 77.51c0 .49-.03.98-.04 1.48Zm85.63 65.85-65.68-63.49c.05-1.28.08-2.56.08-3.84 0-53.77-43.74-97.51-97.51-97.51s-97.51 43.74-97.51 97.51c0 14.16 3.04 27.63 8.49 39.78l-74.58 53.86V46.53c.05-5.27 2.19-10.96 8.77-10.96h306.98c6.58 0 10.96 4.39 10.96 10.96v184.19Z",
    style: {
      fill: '#cd0000'
    }
  })]
})));
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
const videopackVideo = /*#__PURE__*/(/* unused pure expression or super */ null && (_jsxs("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/_jsx("circle", {
    cx: 199.66,
    cy: 198.62,
    r: 47.96,
    style: {
      fill: '#fff'
    }
  }), /*#__PURE__*/_jsx("circle", {
    cx: 199.66,
    cy: 198.62,
    r: 47.96,
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: '7.88px'
    }
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M179.89 225.45v-12.03l25.92-15.09-25.92-14.59v-12.48l46.9 27.1-46.54 27.09"
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m179.89 183.74 25.92 14.59-25.92 15.09"
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: '13.05px'
    },
    d: "M73.32 127.13h255.7v143.75H73.32z"
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: '7.16px'
    },
    d: "M3.38 3.56h393.28v393.28H3.38z"
  })]
})));
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
const sortAscending = /*#__PURE__*/(/* unused pure expression or super */ null && (_jsx("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "currentColor",
  children: /*#__PURE__*/_jsx("path", {
    d: "M19 17H22L18 21L14 17H17V3H19M2 17H12V19H2M6 5V7H2V5M2 11H9V13H2V11Z"
  })
})));
const sortDescending = /*#__PURE__*/(/* unused pure expression or super */ null && (_jsx("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "currentColor",
  children: /*#__PURE__*/_jsx("path", {
    d: "M19 7H22L18 3L14 7H17V21H19M2 17H12V19H2M6 5V7H2V5M2 11H9V13H2V11Z"
  })
})));
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
/* harmony export */   "E6", 0, /* binding */ embed,
/* harmony export */   "Jm", 0, /* binding */ videopackWatermark,
/* harmony export */   "Kx", 0, /* binding */ volumeUp,
/* harmony export */   "L_", 0, /* binding */ shareAlt2,
/* harmony export */   "N8", 0, /* binding */ reddit,
/* harmony export */   "RG", 0, /* binding */ download,
/* harmony export */   "Rp", 0, /* binding */ email,
/* harmony export */   "S", 0, /* binding */ copyLink,
/* harmony export */   "SM", 0, /* binding */ shareAlt3,
/* harmony export */   "Sr", 0, /* binding */ shareAlt1,
/* harmony export */   "V2", 0, /* binding */ facebook,
/* harmony export */   "VN", 0, /* binding */ close,
/* harmony export */   "ZH", 0, /* binding */ play,
/* harmony export */   "eD", 0, /* binding */ threads,
/* harmony export */   "pZ", 0, /* binding */ volumeDown,
/* harmony export */   "uM", 0, /* binding */ share,
/* harmony export */   "uj", 0, /* binding */ bluesky,
/* harmony export */   "v0", 0, /* binding */ videopackViewCount,
/* harmony export */   "v7", 0, /* binding */ pause,
/* harmony export */   "vT", 0, /* binding */ videopackTitle,
/* harmony export */   "zs", 0, /* binding */ playOutline
/* harmony export */ ]);


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
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.hasOwn(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
let __webpack_exports__ = {};

// EXTERNAL MODULE: external ["wp","element"]
var external_wp_element_ = __webpack_require__(6087);
// EXTERNAL MODULE: external ["wp","components"]
var external_wp_components_ = __webpack_require__(6427);
// EXTERNAL MODULE: external ["wp","apiFetch"]
var external_wp_apiFetch_ = __webpack_require__(1455);
var external_wp_apiFetch_default = /*#__PURE__*/__webpack_require__.n(external_wp_apiFetch_);
// EXTERNAL MODULE: external ["wp","i18n"]
var external_wp_i18n_ = __webpack_require__(7723);
// EXTERNAL MODULE: external ["wp","hooks"]
var external_wp_hooks_ = __webpack_require__(2619);
// EXTERNAL MODULE: ./src/assets/icon.js
var icon = __webpack_require__(9427);
;// external ["wp","compose"]
const external_wp_compose_namespaceObject = window["wp"]["compose"];
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
  const updateAttachment = (0,external_wp_compose_namespaceObject.useDebounce)(updateAttachmentCallback, 1000);

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
  const updateMeta = (0,external_wp_compose_namespaceObject.useDebounce)(updateMetaCallback, 1000);
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
// EXTERNAL MODULE: ./src/components/CompactColorPicker/CompactColorPicker.js
var CompactColorPicker = __webpack_require__(6312);
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
// EXTERNAL MODULE: external "ReactJSXRuntime"
var external_ReactJSXRuntime_ = __webpack_require__(790);
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
    onChange(innerValue);
    if (props.onBlur) {
      props.onBlur(event);
    }
  };
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.TextControl, {
    ...props,
    value: innerValue,
    onChange: handleOnChange,
    onBlur: handleOnBlur,
    type: "search"
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
      title: (0,external_wp_i18n_.__)('Select Image', 'videopack-player-pro'),
      button: {
        text: (0,external_wp_i18n_.__)('Use this image', 'videopack-player-pro')
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
    className: "videopack-grid-row-align",
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
      }), value && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "videopack-select-from-library-preview",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("img", {
          src: value,
          alt: ""
        })
      }), children]
    })]
  });
};
/* harmony default export */ const components_SelectFromLibrary = (SelectFromLibrary);
// EXTERNAL MODULE: ./src/components/WatermarkPositioner/WatermarkPositioner.js
var WatermarkPositioner = __webpack_require__(9486);
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
        children: [baseFrame && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(WatermarkPositioner/* default */.A, {
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
var external_wp_primitives_ = __webpack_require__(5573);
;// ./node_modules/@wordpress/icons/build-module/library/close.mjs
// packages/icons/src/library/close.tsx


var close_default = /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.Path, { d: "m13.06 12 6.47-6.47-1.06-1.06L12 10.94 5.53 4.47 4.47 5.53 10.94 12l-6.47 6.47 1.06 1.06L12 13.06l6.47 6.47 1.06-1.06L13.06 12Z" }) });

//# sourceMappingURL=close.mjs.map

;// ./node_modules/@wordpress/icons/build-module/library/plus.mjs
// packages/icons/src/library/plus.tsx


var plus_default = /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.Path, { d: "M11 12.5V17.5H12.5V12.5H17.5V11H12.5V6H11V11H6V12.5H11Z" }) });

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
// EXTERNAL MODULE: ./src/utils/colors.js
var colors = __webpack_require__(7068);
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
  const PLAYER_COLOR_FALLBACKS = (0,external_wp_element_.useMemo)(() => (0,colors/* getColorFallbacks */.l)(displayAttributes), [displayAttributes]);
  const THEME_COLORS = videopack_config?.themeColors || options?.themeColors;
  const showPlayButtonColors = (0,external_wp_hooks_.applyFilters)('videopack.videoSettings.showPlayButtonColors', true, displayAttributes);
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
              beforeIcon: icon/* volumeDown */.pZ,
              afterIcon: icon/* volumeUp */.Kx,
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
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker/* default */.A, {
              label: (0,external_wp_i18n_.__)('Text', 'video-embed-thumbnail-generator'),
              value: displayAttributes.title_color,
              onChange: value => handleSettingChange('title_color', value),
              colors: THEME_COLORS,
              fallbackValue: PLAYER_COLOR_FALLBACKS.title_color
            })
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker/* default */.A, {
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
          children: [showPlayButtonColors && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker/* default */.A, {
                label: displayAttributes.embed_method === 'WordPress Default' ? (0,external_wp_i18n_.__)('Play Button Color', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_.__)('Play Button Icon', 'video-embed-thumbnail-generator'),
                value: displayAttributes.play_button_color,
                onChange: value => handleSettingChange('play_button_color', value),
                colors: THEME_COLORS,
                fallbackValue: PLAYER_COLOR_FALLBACKS.play_button_color
              })
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker/* default */.A, {
                label: displayAttributes.embed_method === 'WordPress Default' ? (0,external_wp_i18n_.__)('Play Button Hover', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_.__)('Play Button Accent', 'video-embed-thumbnail-generator'),
                value: displayAttributes.play_button_secondary_color,
                onChange: value => handleSettingChange('play_button_secondary_color', value),
                colors: THEME_COLORS,
                fallbackValue: PLAYER_COLOR_FALLBACKS.play_button_secondary_color
              })
            })]
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker/* default */.A, {
              label: (0,external_wp_i18n_.__)('Control Bar Background', 'video-embed-thumbnail-generator'),
              value: displayAttributes.control_bar_bg_color,
              onChange: value => handleSettingChange('control_bar_bg_color', value),
              colors: THEME_COLORS,
              fallbackValue: PLAYER_COLOR_FALLBACKS.control_bar_bg_color
            })
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CompactColorPicker/* default */.A, {
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
// EXTERNAL MODULE: external ["wp","data"]
var external_wp_data_ = __webpack_require__(7143);
// EXTERNAL MODULE: external ["wp","url"]
var external_wp_url_ = __webpack_require__(3832);
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
;// ./src/api/jobs.js
/* unused harmony import specifier */ var apiFetch;
/* unused harmony import specifier */ var addQueryArgs;
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
    return await apiFetch({
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


var chevron_up_default = /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.Path, { d: "M6.5 12.4L12 8l5.5 4.4-.9 1.2L12 10l-4.5 3.6-1-1.2z" }) });

//# sourceMappingURL=chevron-up.mjs.map

;// ./node_modules/@wordpress/icons/build-module/library/chevron-down.mjs
// packages/icons/src/library/chevron-down.tsx


var chevron_down_default = /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.Path, { d: "M17.5 11.6L12 16l-5.5-4.4.9-1.2L12 14l4.5-3.6 1 1.2z" }) });

//# sourceMappingURL=chevron-down.mjs.map

;// ./node_modules/@wordpress/icons/build-module/library/external.mjs
// packages/icons/src/library/external.tsx


var external_default = /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.Path, { d: "M19.5 4.5h-7V6h4.44l-5.97 5.97 1.06 1.06L18 7.06v4.44h1.5v-7Zm-13 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3H17v3a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h3V5.5h-3Z" }) });

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
          icon: isPlaying ? icon/* pause */.v7 : icon/* play */.ZH
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
    poster: rawPoster
  } = attributes;
  const resolvedPoster = videoData?.record?.videopack?.poster || videoData?.record?.meta?.['_videopack-meta']?.poster || rawPoster;
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
  const [activeJobs, setActiveJobs] = (0,external_wp_element_.useState)([]);
  const [showFailedNotice, setShowFailedNotice] = (0,external_wp_element_.useState)(true);

  // Poll for active thumbnail jobs if any exist
  (0,external_wp_element_.useEffect)(() => {
    let pollInterval;
    const checkJobs = async () => {
      try {
        const jobs = await listJobs(id);
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
  const activeEncoderReady = (0,external_wp_hooks_.applyFilters)('videopack.encoder.is_ready', !!videopack_config.isTranscodingServiceReady, active_encoder, options);
  const effectiveFfmpegExists = active_encoder !== 'ffmpeg' && activeEncoderReady || !!videopack_config.ffmpeg_exists && videopack_config.ffmpeg_exists !== 'notinstalled';
  const ffmpegExists = effectiveFfmpegExists;
  const {
    editPost
  } = (0,external_wp_data_.useDispatch)('core/editor') || {};
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
  } = (0,external_wp_data_.useDispatch)('core');
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
  const generateThumb = (0,external_wp_element_.useCallback)(async (i, type, forceId = null, forceFeatured = null, time = null) => {
    try {
      const response = await generateThumbnail(src, total_thumbnails, i, forceId !== null ? forceId : id, type, parentId, forceFeatured !== null ? forceFeatured : featured, time);
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
      }), resolvedPoster && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("img", {
        className: "videopack-current-thumbnail",
        src: resolvedPoster ? resolvedPoster.replace(/&amp;/g, '&') : '',
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
            children: !resolvedPoster ? (0,external_wp_i18n_.__)('Select', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_.__)('Replace', 'video-embed-thumbnail-generator')
          })
        }), !!resolvedPoster && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Button, {
          onClick: onRemovePoster,
          variant: "tertiary",
          children: (0,external_wp_i18n_.__)('Remove', 'video-embed-thumbnail-generator')
        })]
      }), activeJobs.length > 0 && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "videopack-active-jobs",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Spinner, {}), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("p", {
          children: (0,external_wp_i18n_.__)('Thumbnail generation in progress…', 'video-embed-thumbnail-generator')
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
          }), (0,external_wp_hooks_.applyFilters)('videopack.thumbnail.actions', null, {
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
      }), canvasTainted && !isProbing && !ffmpegExists && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "videopack-security-error-notice",
        children: (0,external_wp_i18n_.__)('Cross-origin resource sharing (CORS) policy on the external server is preventing thumbnail generation.', 'video-embed-thumbnail-generator')
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
      })]
    })
  });
};
/* harmony default export */ const Thumbnails_Thumbnails = (Thumbnails);
;// external ["wp","coreData"]
const external_wp_coreData_namespaceObject = window["wp"]["coreData"];
;// ./node_modules/@wordpress/icons/build-module/library/cancel-circle-filled.mjs
// packages/icons/src/library/cancel-circle-filled.tsx


var cancel_circle_filled_default = /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0,external_ReactJSXRuntime_.jsx)(external_wp_primitives_.Path, { d: "M12 4c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8Zm3.8 10.7-1.1 1.1-2.7-2.7-2.7 2.7-1.1-1.1 2.7-2.7-2.7-2.7 1.1-1.1 2.7 2.7 2.7-2.7 1.1 1.1-2.7 2.7 2.7 2.7Z" }) });

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
  if (formatData?.encoding_now) {
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
          children: (0,external_wp_i18n_.__)('fps:', 'video-embed-thumbnail-generator') + ' ' + (formatData.progress?.fps || '--')
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
    return data.exists && data.status !== 'error' || (0,external_wp_hooks_.applyFilters)('videopack.busyOrDoneStatuses', ['queued', 'encoding', 'processing', 'completed', 'needs_insert', 'pending_replacement', 'remote_exists', 'browser_pending', 'browser_encoding']).includes(data.status);
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
      children: formatData.status === 'browser_encoding' ? window.videopack_current_browser_job_id && Number(window.videopack_current_browser_job_id) === Number(formatData.job_id || formatData.id) ? (0,external_wp_i18n_.__)('Encoding (This Browser Tab)', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_.__)('Encoding (Different Browser/Tab)', 'video-embed-thumbnail-generator') : formatData.status_l10n
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
    }), (formatData.encoding_now || formatData.status === 'browser_encoding' || formatData.status === 'failed' || formatData.status === 'error') && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(AdditionalFormats_EncodeProgress, {
      formatData: formatData,
      onCancelJob: onCancelJob,
      deleteInProgress: deleteInProgress,
      onRefresh: onRefresh,
      hideCancel: hideCancel
    })]
  }, formatId);
};
/* harmony default export */ const AdditionalFormats_EncodeFormatStatus = (EncodeFormatStatus);
// EXTERNAL MODULE: ./src/api/gallery.js
var gallery = __webpack_require__(8533);
;// ./src/api/media.js
/* unused harmony import specifier */ var media_apiFetch;
/* unused harmony import specifier */ var media_addQueryArgs;
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
    return await media_apiFetch({
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
    return await media_apiFetch({
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
    return await media_apiFetch({
      path: media_addQueryArgs('/videopack/v1/batch/progress', {
        type
      })
    });
  } catch (error) {
    console.error(`Error fetching ${type} batch progress:`, error);
    throw error;
  }
};
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
  const activeEncoderReady = (0,external_wp_hooks_.applyFilters)('videopack.encoder.is_ready', !!videopack_config.isTranscodingServiceReady, active_encoder, options);
  const effectiveFfmpegExists = active_encoder !== 'ffmpeg' && activeEncoderReady || ffmpeg_exists === true || ffmpeg_exists === 'true' || ffmpeg_exists === 1 || ffmpeg_exists === '1';
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
          const isBusyOrDone = (0,external_wp_hooks_.applyFilters)('videopack.busyOrDoneStatuses', ['queued', 'encoding', 'processing', 'completed', 'needs_insert', 'pending_replacement', 'remote_exists', 'browser_pending', 'browser_encoding']).includes(newFormat.status);
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
    return Object.values(formats).some(format => format.status === 'queued' || format.status === 'browser_pending' || format.status === 'encoding' || format.status === 'processing' || format.status === 'needs_insert' || format.status === 'pending_replacement');
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
      return (0,external_wp_hooks_.applyFilters)('videopack.handle_format_checkbox', updatedFormats, formatId, isChecked);
    });
  };
  const handleEnqueue = async () => {
    if (!videopack_config) {
      return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Spinner, {});
    }
    setIsProcessing(true);

    // Get list of format IDs that are checked and available
    const formatsToEncode = Object.entries(videoFormats).filter(([, value]) => value.checked && !(0,external_wp_hooks_.applyFilters)('videopack.nonQueueableStatuses', ['queued', 'encoding', 'processing', 'completed', 'needs_insert', 'pending_replacement', 'remote_exists']).includes(value.status) && !value.exists).reduce((acc, [formatId]) => {
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
              children: [(0,external_wp_i18n_.__)('Browser encoding is active. Processing will only occur while the Videopack Processing page is open.', 'video-embed-thumbnail-generator'), ' ', /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("a", {
                href: videopack_config.queue_url,
                children: (0,external_wp_i18n_.__)('Go to Processing Page', 'video-embed-thumbnail-generator')
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
      window.dispatchEvent(new CustomEvent('videopack_job_deleted', {
        detail: {
          job_id: jobId
        }
      }));
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
      children: [!videoFormats ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
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
      }), encodeMessage && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Notice, {
        status: typeof encodeMessage === 'string' && (encodeMessage.includes((0,external_wp_i18n_.__)('Error', 'video-embed-thumbnail-generator')) || encodeMessage.includes(':')) ? 'error' : 'success',
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
/* harmony default export */ const AdditionalFormats_AdditionalFormats = (AdditionalFormats);
;// ./src/api/settings.js
/* unused harmony import specifier */ var settings_apiFetch;
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
  const pre = (0,external_wp_hooks_.applyFilters)('videopack.utils.pre_getSettings', undefined);
  if (typeof pre !== 'undefined') {
    return pre;
  }
  if (cachedSettings) {
    return cachedSettings;
  }
  if (settingsPromise) {
    return settingsPromise;
  }
  settingsPromise = external_wp_apiFetch_default()({
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
    return (0,external_wp_hooks_.applyFilters)('videopack.utils.getSettings', cachedSettings);
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
    const response = await settings_apiFetch({
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
    return await settings_apiFetch({
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
    return await settings_apiFetch({
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
    return await settings_apiFetch({
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
    return await settings_apiFetch({
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
    return await settings_apiFetch({
      path: '/videopack/v1/settings/cache',
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error clearing URL cache:', error);
    throw error;
  }
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
;// ./src/features/attachment-details/components/AttachmentDetails.js
/**
 * Component to display attachment details and settings for a video.
 */











/**
 * AttachmentDetails component.
 *
 * @param {Object} props              Component props.
 * @param {number} props.attachmentId The ID of the attachment.
 * @param {Object} props.model        Backbone model for the attachment.
 * @return {Object} The rendered component.
 */

const AttachmentDetails = ({
  attachmentId,
  model
}) => {
  const [options, setOptions] = (0,external_wp_element_.useState)();
  const [attributes, setRawAttributes] = (0,external_wp_element_.useState)();
  const [record, setRecord] = (0,external_wp_element_.useState)(null);
  const [hasResolved, setHasResolved] = (0,external_wp_element_.useState)(false);
  const [, forceUpdate] = (0,external_wp_element_.useState)({});
  const {
    isProbing,
    probedMetadata
  } = useVideoProbe(attributes?.src);
  const [probedMetadataOverride, setProbedMetadataOverride] = (0,external_wp_element_.useState)(null);

  // Sync metadata from attachment records when it loads
  (0,external_wp_element_.useEffect)(() => {
    if (record?.media_details && !probedMetadata) {
      const {
        width,
        height,
        duration
      } = record.media_details;
      setProbedMetadataOverride({
        width,
        height,
        duration,
        isTainted: false // Internal media is never tainted
      });
    } else if (!attributes?.src) {
      setProbedMetadataOverride(null);
    }
  }, [record, probedMetadata, attributes?.src]);
  const effectiveMetadata = probedMetadataOverride || probedMetadata;
  (0,external_wp_element_.useEffect)(() => {
    if (attributes && hasResolved) {
      if (model) {
        model.set('videopack_attributes', attributes);
      } else {
        // Standalone page: Update hidden field instead of REST API.
        const hiddenInput = document.getElementById('videopack_meta_json');
        if (hiddenInput) {
          const currentMeta = record?.meta?.['_videopack-meta'] || {};
          const newMeta = {
            ...currentMeta,
            ...attributes
          };
          hiddenInput.value = JSON.stringify(newMeta);
        }
      }
    }
  }, [model, attributes, hasResolved, record]);
  (0,external_wp_element_.useEffect)(() => {
    if (attributes && attributes.id && !model) {
      window.dispatchEvent(new CustomEvent('videopack_settings_update', {
        detail: attributes
      }));
    }
  }, [attributes, model]);

  // Fetch the full media record from the REST API to get videopack metadata.
  (0,external_wp_element_.useEffect)(() => {
    if (!isNaN(attachmentId) && attachmentId > 0) {
      setHasResolved(false);
      setRecord(null); // Eagerly reset to prevent stale probes
      setRawAttributes(null); // Eagerly reset to prevent stale AdditionalFormats fetch
      external_wp_apiFetch_default()({
        path: `/wp/v2/media/${attachmentId}`
      }).then(data => {
        setRecord(data);
        setHasResolved(true);
      }).catch(() => {
        setRecord(null);
        setHasResolved(true);
      });
    } else {
      setRecord(null);
      setHasResolved(false);
    }
  }, [attachmentId]);
  const attachment = (0,external_wp_element_.useMemo)(() => ({
    record,
    hasResolved
  }), [record, hasResolved]);

  // Fetch global plugin options.
  (0,external_wp_element_.useEffect)(() => {
    getSettings().then(response => {
      setOptions(response);
    });
  }, []);

  // Listen for native title/caption changes on the Backbone model or DOM.
  (0,external_wp_element_.useEffect)(() => {
    const onNativeChange = () => {
      forceUpdate({});
    };
    if (model) {
      model.on('change:title change:caption', onNativeChange);
      return () => {
        model.off('change:title change:caption', onNativeChange);
      };
    }

    // DOM bridge for standalone page.
    const onDomChange = () => {
      forceUpdate({});
    };
    window.addEventListener('videopack_native_metadata_update', onDomChange);
    return () => {
      window.removeEventListener('videopack_native_metadata_update', onDomChange);
    };
  }, [model]);

  // Merging wrapper that mirrors the block editor's setAttributes behavior.
  const mergeAttributes = (0,external_wp_element_.useCallback)(newAttrs => {
    setRawAttributes(prev => {
      const updated = {
        ...prev,
        ...newAttrs
      };

      // Sync back to the record meta if it exists, to prevent the useEffect from reverting.
      if (record) {
        const currentMeta = record.meta?.['_videopack-meta'] || {};
        const updatedMeta = {
          ...currentMeta,
          ...updated
        };

        // We need to update the record state too so the initialization useEffect doesn't overwrite us.
        setRecord(prevRecord => ({
          ...prevRecord,
          meta: {
            ...prevRecord.meta,
            '_videopack-meta': updatedMeta,
            '_kgflashmediaplayer-poster': updated.poster !== undefined ? updated.poster : prevRecord.meta?.['_kgflashmediaplayer-poster'],
            '_kgflashmediaplayer-poster-id': updated.poster_id !== undefined ? updated.poster_id : prevRecord.meta?.['_kgflashmediaplayer-poster-id']
          }
        }));
      }
      return updated;
    });
  }, [record]);

  // Calculate and initialize the combined attributes object.
  (0,external_wp_element_.useEffect)(() => {
    if (attachment.hasResolved && options) {
      const recordId = attachment.record?.id;
      const videopackMeta = attachment.record?.meta?.['_videopack-meta'] || {};

      // Filter out null values so they don't overwrite defaults.
      const filteredMeta = Object.fromEntries(Object.entries(videopackMeta).filter(([, v]) => v !== null && v !== undefined));

      // Prioritize attributes stored in the Backbone model (e.g., from a shortcode).
      const modelAttrsRaw = model ? model.get('videopack_attributes') : null;
      let parsedModelAttrs = {};
      try {
        parsedModelAttrs = typeof modelAttrsRaw === 'string' ? JSON.parse(modelAttrsRaw || '{}') : modelAttrsRaw || {};
      } catch (e) {
        console.error('Failed to parse videopack_attributes', e);
      }

      // Clean up types for attributes coming from the model/shortcode.
      Object.keys(parsedModelAttrs).forEach(key => {
        let val = parsedModelAttrs[key];
        if (val === 'true') {
          val = true;
        } else if (val === 'false') {
          val = false;
        } else if (!isNaN(val) && val !== '' && typeof val === 'string') {
          if (!['id', 'poster', 'src', 'title'].includes(key)) {
            val = Number(val);
          }
        }
        parsedModelAttrs[key] = val;
      });

      // Resolve caption with native Backbone model as priority.
      const nativeCaption = model ? model.get('caption') : '';
      const combinedAttributes = {
        id: recordId,
        total_thumbnails: videopackMeta.total_thumbnails || options.total_thumbnails,
        title: attachment.record?.title?.rendered || '',
        caption: nativeCaption || '',
        src: attachment.record?.source_url,
        poster: attachment.record?.meta?.['_kgflashmediaplayer-poster'] || attachment.record?.meta?.['_videopack-meta']?.poster,
        poster_id: attachment.record?.meta?.['_kgflashmediaplayer-poster-id'],
        sources: attachment.record?.videopack?.sources || (attachment.record?.source_url ? [{
          src: attachment.record.source_url
        }] : []),
        source_groups: attachment.record?.videopack?.source_groups || {},
        ...filteredMeta,
        ...parsedModelAttrs
      };
      setRawAttributes(combinedAttributes);
    }
  }, [options, attachment, record, model]); // attachment.record is specifically watched

  const {
    handleSettingChange
  } = hooks_useVideoSettings(attributes || {}, mergeAttributes, options, {
    autoSave: true
  });
  if (attributes && attachment.hasResolved && options) {
    // Hide Videopack controls if editing a generated format.
    if (attachment.record?.meta?.['_kgflashmediaplayer-format']) {
      return null;
    }
    return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      className: "videopack-attachment-details",
      children: [(window.videopackAttachmentDetailsExtensions || []).map((Extension, idx) => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(Extension, {
        attachmentId: attachmentId,
        model: model,
        attributes: attributes,
        setAttributes: mergeAttributes,
        options: options,
        record: record,
        setRecord: setRecord
      }, idx)), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(Thumbnails_Thumbnails, {
        setAttributes: handleSettingChange,
        attributes: attributes,
        videoData: {
          ...attachment,
          edit: data => {
            if (data.meta?.['_videopack-meta']) {
              mergeAttributes(data.meta['_videopack-meta']);
            }
            if (data.featured_media !== undefined) {
              mergeAttributes({
                poster_id: data.featured_media
              });
            }
          },
          save: async () => {
            // AttachmentDetails uses useVideoSettings with autoSave: true,
            // so we don't need to do anything here as it's already debounced/saving.
            return attachment.record;
          }
        },
        options: options,
        parentId: attachment.record?.post || 0,
        isProbing: isProbing,
        probedMetadata: effectiveMetadata
      }), (window.videopackAttachmentDetailsExtensionsBelowThumbnails || []).map((Extension, idx) => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(Extension, {
        attachmentId: attachmentId,
        model: model,
        attributes: attributes,
        setAttributes: mergeAttributes,
        options: options,
        record: record,
        setRecord: setRecord
      }, `below-${idx}`)), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(VideoSettings_VideoSettings, {
        setAttributes: handleSettingChange,
        attributes: attributes,
        options: options,
        isProbing: isProbing,
        probedMetadata: effectiveMetadata,
        fallbackTitle: (model ? model.get('title') : '') || attachment.record?.title?.rendered || '',
        fallbackCaption: (model ? model.get('caption') : '') || ''
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(AdditionalFormats_AdditionalFormats, {
        attributes: attributes,
        options: options,
        isProbing: isProbing,
        probedMetadata: effectiveMetadata
      }, attributes.id || attributes.src)]
    });
  }
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Spinner, {});
};
/* harmony default export */ const components_AttachmentDetails = (AttachmentDetails);
// EXTERNAL MODULE: external ["wp","blockEditor"]
var external_wp_blockEditor_ = __webpack_require__(4715);
// EXTERNAL MODULE: external ["wp","htmlEntities"]
var external_wp_htmlEntities_ = __webpack_require__(8537);
// EXTERNAL MODULE: ./src/hooks/useVideopackContext.js
var useVideopackContext = __webpack_require__(5633);
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
;// ./src/components/VideoPlayer/VideoPlayer.js
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
  } = (0,useVideopackContext/* default */.Ay)(blockAttributes, context, {
    classKeys: PLAYER_CONTEXT_CLASS_KEYS
  });
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
    loopDuotoneId,
    crossorigin
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

  // Only the id-based branch actually needs to react to source_groups
  // content (e.g. an async source-groups fetch landing for the same
  // attachment) — the no-id fallback (true for previews with no real
  // attachment) should stay stable for this component's whole lifetime.
  // Depending on source_groups for the fallback too meant every re-render
  // generated a brand new random string — source_groups defaults to a new
  // {} reference whenever unset, and even an unrelated settings change
  // (which recreates the context object passed in) counted as a
  // re-render — forcing Video.js to fully remount each time.
  const randomKeyRef = (0,external_wp_element_.useRef)();
  if (!randomKeyRef.current) {
    randomKeyRef.current = Math.random().toString(36).substr(2, 9);
  }
  const uniqueKey = blockAttributes.id ? `${blockAttributes.id}-${JSON.stringify(source_groups)}` : randomKeyRef.current;
  const genericPlayerOptions = (0,external_wp_element_.useMemo)(() => {
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
;// ./src/features/attachment-details/components/AttachmentPreview.js
/**
 * Dedicated component to render a VideoPlayer within the WordPress Media Library preview area.
 */














/**
 * AttachmentPreview component.
 *
 * @param {Object} props              Component props.
 * @param {number} props.attachmentId The ID of the attachment.
 * @param {Object} props.model        Backbone model for the attachment.
 * @return {Object} The rendered component.
 */

const AttachmentPreview = ({
  attachmentId,
  model
}) => {
  const [options, setOptions] = (0,external_wp_element_.useState)();
  const [record, setRecord] = (0,external_wp_element_.useState)(null);
  const [attributes, setAttributes] = (0,external_wp_element_.useState)(null);
  const [hasResolved, setHasResolved] = (0,external_wp_element_.useState)(false);
  const [nativeMetadata, setNativeMetadata] = (0,external_wp_element_.useState)({
    title: model ? model.get('title') : '',
    caption: model ? model.get('caption') : ''
  });

  // Fetch the full media record from the REST API.
  (0,external_wp_element_.useEffect)(() => {
    if (!isNaN(attachmentId) && attachmentId > 0) {
      setHasResolved(false);
      external_wp_apiFetch_default()({
        path: `/wp/v2/media/${attachmentId}`
      }).then(data => {
        setRecord(data);
        setHasResolved(true);
      }).catch(() => {
        setRecord(null);
        setHasResolved(true);
      });
    } else {
      setRecord(null);
      setHasResolved(false);
    }
  }, [attachmentId]);

  // Fetch global plugin options.
  (0,external_wp_element_.useEffect)(() => {
    getSettings().then(response => {
      setOptions(response);
    });
  }, []);

  // Listen for native title/caption changes on the Backbone model or DOM.
  (0,external_wp_element_.useEffect)(() => {
    const onNativeChange = () => {
      if (model) {
        setNativeMetadata({
          title: model.get('title'),
          caption: model.get('caption')
        });
      }
    };
    if (model) {
      model.on('change:title change:caption', onNativeChange);
      return () => {
        model.off('change:title change:caption', onNativeChange);
      };
    }

    // DOM bridge for standalone page.
    const onDomUpdate = event => {
      setNativeMetadata(prev => ({
        ...prev,
        ...event.detail
      }));
    };
    window.addEventListener('videopack_native_metadata_update', onDomUpdate);

    // Listen for settings updates from the sidebar (React root bridge).
    const onSettingsUpdate = event => {
      // Filter out undefined values to prevent overwriting valid preview state.
      const updates = Object.fromEntries(Object.entries(event.detail).filter(([, v]) => v !== undefined));
      setAttributes(prev => ({
        ...prev,
        ...updates
      }));
    };
    window.addEventListener('videopack_settings_update', onSettingsUpdate);
    return () => {
      window.removeEventListener('videopack_native_metadata_update', onDomUpdate);
      window.removeEventListener('videopack_settings_update', onSettingsUpdate);
    };
  }, [model]);

  // Calculate initial attributes based on the record and options.
  const initialAttributes = (0,external_wp_element_.useMemo)(() => {
    if (hasResolved && record && options) {
      const videopackMeta = record.meta?.['_videopack-meta'] || {};
      const sources = record.videopack?.sources || [{
        src: record.source_url
      }];
      const sourceGroups = record.videopack?.source_groups || {};

      // Prioritize the live native metadata from the Backbone model if available,
      // falling back to the stale REST API record.
      const currentNativeTitle = nativeMetadata.title || '';
      const fallbackTitle = typeof record.title === 'string' ? record.title : record.title?.rendered || record.title?.raw || '';
      const defaultTitle = (0,external_wp_htmlEntities_.decodeEntities)(currentNativeTitle || fallbackTitle);
      const filteredMeta = Object.fromEntries(Object.entries(videopackMeta).filter(([, v]) => v !== null && v !== undefined));
      return {
        ...options,
        ...filteredMeta,
        id: attachmentId,
        title: videopackMeta.title || defaultTitle,
        caption: videopackMeta.caption || nativeMetadata.caption || '',
        src: record.source_url,
        poster: record.meta?.['_kgflashmediaplayer-poster'] || record.media_details?.sizes?.full?.source_url || record.image?.src,
        sources,
        source_groups: sourceGroups,
        embedlink: record.link,
        count: videopackMeta.starts || 0
      };
    }
    return null;
  }, [record, options, hasResolved, attachmentId, nativeMetadata]);

  // Helper to merge local attributes with Backbone model attributes safely.
  const getMergedAttributes = (0,external_wp_element_.useCallback)(baseAttrs => {
    if (!baseAttrs) {
      return null;
    }
    const modelAttrsRaw = model ? model.get('videopack_attributes') : null;
    let parsedModelAttrs = {};
    try {
      parsedModelAttrs = typeof modelAttrsRaw === 'string' ? JSON.parse(modelAttrsRaw || '{}') : modelAttrsRaw || {};
    } catch (e) {
      console.error('Failed to parse videopack_attributes', e);
    }

    // Clean up types (boolean/numbers) from model/shortcode.
    Object.keys(parsedModelAttrs).forEach(key => {
      let val = parsedModelAttrs[key];
      if (val === 'true') {
        val = true;
      } else if (val === 'false') {
        val = false;
      } else if (!isNaN(val) && val !== '' && typeof val === 'string') {
        if (!['id', 'poster', 'src', 'title'].includes(key)) {
          val = Number(val);
        }
      }
      parsedModelAttrs[key] = val;
    });
    const merged = {
      ...baseAttrs,
      ...parsedModelAttrs
    };
    if (!merged.title) {
      merged.title = baseAttrs.title;
    }
    return merged;
  }, [model]);

  // Update active attributes whenever initialAttributes change.
  (0,external_wp_element_.useEffect)(() => {
    if (initialAttributes) {
      const merged = getMergedAttributes(initialAttributes);
      setAttributes(merged);
    }
  }, [initialAttributes, getMergedAttributes]);

  // Listen for subsequent changes from the sidebar via the Backbone model.
  (0,external_wp_element_.useEffect)(() => {
    if (!model || !initialAttributes) {
      return;
    }
    const handleModelChange = () => {
      const merged = getMergedAttributes(initialAttributes);
      setAttributes(merged);
    };
    model.on('change:videopack_attributes', handleModelChange);
    return () => {
      model.off('change:videopack_attributes', handleModelChange);
    };
  }, [model, initialAttributes, getMergedAttributes]);
  const videopackConfig = window.videopack_config || {};
  const containerStyle = (0,external_wp_element_.useMemo)(() => {
    const styles = {};
    if (videopackConfig.contentSize) {
      styles['--wp--style--global--content-size'] = videopackConfig.contentSize;
    }
    if (videopackConfig.wideSize) {
      styles['--wp--style--global--wide-size'] = videopackConfig.wideSize;
    }
    return styles;
  }, [videopackConfig.contentSize, videopackConfig.wideSize]);

  // Base context, shared by everything rendered here — the view-count block
  // (a sibling of VideoPlayer, not inside its overlay) uses this directly.
  const previewContext = (0,external_wp_element_.useMemo)(() => {
    if (!attributes) {
      return {};
    }
    const ctx = {};
    Object.keys(attributes).forEach(key => {
      ctx[`videopack/${key}`] = attributes[key];
    });
    ctx['videopack/postId'] = attachmentId;
    ctx['videopack/attachmentId'] = attachmentId;
    ctx['videopack/isPreview'] = true;
    return ctx;
  }, [attributes, attachmentId]);

  // Title/Watermark render inside VideoPlayer's overlay chrome, so they need
  // the extra isInsidePlayerOverlay/isInsidePlayerContainer context that
  // their real edit.js components check for — view-count deliberately
  // doesn't get these (it's outside the player, left-aligned by default).
  const playerOverlayContext = (0,external_wp_element_.useMemo)(() => ({
    ...previewContext,
    'videopack/isInsidePlayerOverlay': true,
    'videopack/isInsidePlayerContainer': true
  }), [previewContext]);

  // These four determine the preview's block *structure* (which blocks/
  // inner-blocks exist) — everything else (colors, watermark image URL,
  // etc.) flows through playerOverlayContext/previewContext instead, so
  // changing them doesn't need to rebuild the block tree below. Depending
  // on the whole `attributes` object here would recompute overlayBlocks on
  // every settings change (attributes is a new object each time), forcing
  // useBlockPreview to tear down and remount its internal preview editor —
  // visible as the whole player flashing even for an unrelated color tweak.
  const overlayTitleAttr = attributes?.overlay_title;
  const downloadlinkAttr = attributes?.downloadlink;
  const embeddableAttr = attributes?.embeddable;
  const embedcodeAttr = attributes?.embedcode;
  const watermarkAttr = attributes?.watermark;
  const viewsAttr = attributes?.views;
  const showTitleBar = !!(overlayTitleAttr || downloadlinkAttr || embeddableAttr && embedcodeAttr);
  const overlayTemplate = (0,external_wp_element_.useMemo)(() => {
    const template = [];
    if (showTitleBar) {
      template.push(['videopack/title', {
        overlay_title: !!overlayTitleAttr,
        showBackground: true
      }, getTitleInnerTemplate(!!downloadlinkAttr, !!(embeddableAttr && embedcodeAttr))]);
    }
    if (watermarkAttr) {
      template.push(['videopack/watermark', {}]);
    }
    return template;
  }, [showTitleBar, overlayTitleAttr, downloadlinkAttr, embeddableAttr, embedcodeAttr, watermarkAttr]);
  const overlayBlocks = useStablePreviewBlocks(overlayTemplate);
  const viewCountTemplate = (0,external_wp_element_.useMemo)(() => {
    if (!viewsAttr) {
      return [];
    }
    return [['videopack/view-count', {
      iconType: 'none',
      showText: true
    }]];
  }, [viewsAttr]);
  const viewCountBlocks = useStablePreviewBlocks(viewCountTemplate);

  // Only render once we have resolved the record and calculated initial attributes.
  if (!hasResolved || !options || !attributes) {
    return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_wp_components_.Spinner, {});
  }
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(PreviewIframe_PreviewIframe, {
    title: (0,external_wp_i18n_.__)('Attachment Preview', 'video-embed-thumbnail-generator'),
    resizeDependencies: [attributes.align],
    children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      className: `wp-block-videopack-videopack-video${attributes.align ? ` align${attributes.align}` : ''}`,
      style: containerStyle,
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(VideoPlayer_VideoPlayer, {
        attributes: attributes,
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
  });
};
/* harmony default export */ const components_AttachmentPreview = (AttachmentPreview);
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
;// ./src/features/attachment-details/attachment-details.js
/**
 * Main entry point for the attachment details feature, handling React root injection and auto-generation logic.
 */



// No unused imports here now.


// Registers the block types AttachmentPreview's real-block-preview system
// needs (registerBlockType() side effects) — title/download/share/watermark/
// view-count only, since this screen previews overlay chrome over a real
// VideoPlayer directly, not the player-container/player/loop/collection
// family. Full attribute/context schemas come from the server-side bootstrap
// injected by Assets::bootstrap_block_editor_definitions() (see
// src/Admin/Assets.php) — this page never loads the real post editor, which
// is the only thing that bootstrap normally runs for.






const config = window.videopack_config || {};

// Render on edit media screen.
const editMediaContainer = document.getElementById('videopack-attachment-details-root');
if (editMediaContainer) {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('post');

  // Bridge native title/caption to React for real-time preview sync.
  const titleInput = document.getElementById('title');
  const captionInput = document.getElementById('excerpt');
  const syncMetadata = () => {
    const detail = {
      title: titleInput ? titleInput.value : '',
      caption: captionInput ? captionInput.value : ''
    };
    window.dispatchEvent(new CustomEvent('videopack_native_metadata_update', {
      detail
    }));
  };
  if (titleInput) {
    titleInput.addEventListener('input', syncMetadata);
  }
  if (captionInput) {
    captionInput.addEventListener('input', syncMetadata);
  }

  // 1. Handle Sidebar (Settings) Component
  const videopackReactRoot = (0,external_wp_element_.createRoot)(editMediaContainer);
  videopackReactRoot.render(/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_AttachmentDetails, {
    attachmentId: postId
  }));

  // 2. Handle Preview Component (Replace native holder)
  const nativePreview = document.querySelector('.wp_attachment_holder');
  if (nativePreview && config.replace_preview_video !== '' && config.replace_preview_video !== false) {
    // Clean up native MediaElement.js players if they exist to prevent orphaned listeners.
    if (typeof window.mejs !== 'undefined' && window.mejs.players) {
      Object.keys(window.mejs.players).forEach(playerId => {
        const player = window.mejs.players[playerId];
        if (player && player.container && (nativePreview.contains(player.container) || nativePreview.contains(player.node) || nativePreview.contains(player.media))) {
          try {
            // Trigger pause if playing to avoid orphaned audio.
            if (typeof player.pause === 'function') {
              player.pause();
            }
            player.remove();
          } catch (e) {
            console.warn('Videopack: Failed to remove native MEJS player', e);
          }
        }
      });
    }
    nativePreview.innerHTML = '';
    const previewRootDiv = document.createElement('div');
    previewRootDiv.id = 'videopack-attachment-preview-root';
    nativePreview.appendChild(previewRootDiv);
    const previewRoot = (0,external_wp_element_.createRoot)(previewRootDiv);
    previewRoot.render(/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_AttachmentPreview, {
      attachmentId: postId
    }));
  }
}

// --- Media Library (Modal/Grid) Extension ---

/**
 * Robustly extends wp.media.view.Attachment.Details with Videopack components.
 * Retries if wp.media core objects are not yet initialized.
 *
 * @param {number} attempts Number of attempts already made.
 */
function initVideopackMediaExtension(attempts = 0) {
  if (typeof wp === 'undefined' || !wp.media || !wp.media.view || !wp.media.view.Attachment.Details) {
    if (attempts < 10) {
      window.requestAnimationFrame(() => initVideopackMediaExtension(attempts + 1));
    } else {
      console.error('Videopack: wp.media.view.Attachment.Details is not available after multiple attempts.');
    }
    return;
  }
  const originalAttachmentDetails = wp.media.view.Attachment.Details;
  const extendedAttachmentDetails = originalAttachmentDetails.extend({
    // A reference to the React root instances.
    videopackReactRoot: null,
    videopackPreviewRoot: null,
    initialize() {
      // Call the original initialize method.
      originalAttachmentDetails.prototype.initialize.apply(this, arguments);
      // Listen for the 'ready' event, which is fired after the view is rendered.
      this.on('ready', this.renderVideopackComponent, this);
      // Also listen for model changes in case type/metadata is fetched later.
      this.model.on('change', this.renderVideopackComponent, this);
    },
    renderVideopackComponent() {
      const attachmentId = this.model.attributes.id;

      // Don't re-render if it's already the same attachment.
      if ((this.videopackReactRoot || this.videopackPreviewRoot) && this.renderedAttachmentId === attachmentId) {
        return;
      }

      // Check if the attachment is a video.
      const isVideo = this.model.attributes.type === 'video';
      const isAnimatedGif = this.model.attributes.subtype === 'gif' && this.model.attributes.meta?.['_videopack-meta']?.animated;
      if (isVideo || isAnimatedGif) {
        // Use requestAnimationFrame to ensure the DOM is ready for our injected div.
        window.requestAnimationFrame(() => {
          // Verify we haven't been removed or changed since the frame was requested.
          if (this.model.attributes.id !== attachmentId) {
            return;
          }

          // Try different selectors for the settings sidebar.
          let settingsSection = this.$el.find('.settings');
          if (settingsSection.length === 0) {
            settingsSection = this.$el.find('.attachment-details');
          }
          if (settingsSection.length === 0) {
            settingsSection = this.$el.find('.attachment-info');
          }
          if (settingsSection.length === 0) {
            if (this.$el.hasClass('attachment-details')) {
              settingsSection = this.$el;
            }
          }
          if (settingsSection.length === 0) {
            return;
          }

          // 1. Handle Sidebar (Settings) Component
          // Cleanup existing root if any.
          if (this.videopackReactRoot) {
            this.videopackReactRoot.unmount();
            this.videopackReactRoot = null;
          }

          // Create and append the root div for our React component.
          const reactRootDiv = document.createElement('div');
          reactRootDiv.id = 'videopack-attachment-details-root';
          settingsSection.append(reactRootDiv);

          // Create a new React root and render the component.
          this.videopackReactRoot = (0,external_wp_element_.createRoot)(reactRootDiv);
          this.videopackReactRoot.render(/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_AttachmentDetails, {
            attachmentId: attachmentId,
            model: this.model
          }));

          // 2. Handle Preview Component
          const previewSection = this.$el.find('.attachment-media-view');
          if (previewSection.length > 0 && config.replace_preview_video !== '' && config.replace_preview_video !== false) {
            // Cleanup existing preview root if any.
            if (this.videopackPreviewRoot) {
              this.videopackPreviewRoot.unmount();
              this.videopackPreviewRoot = null;
            }

            // Clear the preview section thumbnail to make room for our component.
            const thumbnailDiv = previewSection.find('.thumbnail');
            if (thumbnailDiv.length > 0) {
              thumbnailDiv.empty();
              const previewRootDiv = document.createElement('div');
              previewRootDiv.id = 'videopack-attachment-preview-root';
              thumbnailDiv.append(previewRootDiv);
              this.videopackPreviewRoot = (0,external_wp_element_.createRoot)(previewRootDiv);
              this.videopackPreviewRoot.render(/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(components_AttachmentPreview, {
                attachmentId: attachmentId,
                model: this.model
              }));
            }
          }
          this.renderedAttachmentId = attachmentId;
        });
      }
    },
    // We also need to override remove to clean up our React roots.
    remove() {
      // Unmount the React components when the view is removed.
      if (this.videopackReactRoot) {
        this.videopackReactRoot.unmount();
        this.videopackReactRoot = null;
      }
      if (this.videopackPreviewRoot) {
        this.videopackPreviewRoot.unmount();
        this.videopackPreviewRoot = null;
      }

      // Call the original remove method.
      return originalAttachmentDetails.prototype.remove.apply(this, arguments);
    }
  });

  // Replace the original view with our extended one.
  wp.media.view.Attachment.Details = extendedAttachmentDetails;
}

// Start the extension initialization.
initVideopackMediaExtension();
/******/ })()
;