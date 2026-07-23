/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	const __webpack_require__ = {};
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

;// external ["wp","i18n"]
const external_wp_i18n_namespaceObject = window["wp"]["i18n"];
;// external ["wp","hooks"]
const external_wp_hooks_namespaceObject = window["wp"]["hooks"];
;// external ["wp","apiFetch"]
const external_wp_apiFetch_namespaceObject = window["wp"]["apiFetch"];
var external_wp_apiFetch_default = /*#__PURE__*/__webpack_require__.n(external_wp_apiFetch_namespaceObject);
;// ./src/api/settings.js
/* unused harmony import specifier */ var apiFetch;
/* unused harmony import specifier */ var applyFilters;
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
  const pre = applyFilters('videopack.utils.pre_getSettings', undefined);
  if (typeof pre !== 'undefined') {
    return pre;
  }
  if (cachedSettings) {
    return cachedSettings;
  }
  if (settingsPromise) {
    return settingsPromise;
  }
  settingsPromise = apiFetch({
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
    return applyFilters('videopack.utils.getSettings', cachedSettings);
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
    const response = await apiFetch({
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
    return await external_wp_apiFetch_default()({
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
    return await external_wp_apiFetch_default()({
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
    return await external_wp_apiFetch_default()({
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
    return await apiFetch({
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
    return await apiFetch({
      path: '/videopack/v1/settings/cache',
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error clearing URL cache:', error);
    throw error;
  }
};
;// external ["wp","url"]
const external_wp_url_namespaceObject = window["wp"]["url"];
;// ./src/api/gallery.js
/* unused harmony import specifier */ var gallery_apiFetch;
/* unused harmony import specifier */ var addQueryArgs;
/* unused harmony import specifier */ var gallery_applyFilters;
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
    return await gallery_apiFetch({
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
    return await gallery_apiFetch({
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
    const presets = await gallery_apiFetch({
      path: addQueryArgs(`/videopack/v1/attachment/${attachmentId}/formats`, query),
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
  const pre = gallery_applyFilters('videopack.utils.pre_getVideoGallery', undefined, args);
  if (typeof pre !== 'undefined') {
    return pre;
  }
  try {
    const response = await gallery_apiFetch({
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
    return gallery_applyFilters('videopack.utils.getVideoGallery', response, args);
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
    return await external_wp_apiFetch_default()({
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
    return await gallery_apiFetch({
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
  const pre = gallery_applyFilters('videopack.utils.pre_testEncodeCommand', undefined, codec, resolution);
  if (typeof pre !== 'undefined') {
    return pre;
  }
  try {
    return await gallery_apiFetch({
      path: `/videopack/v1/ffmpeg-test/?codec=${codec}&resolution=${resolution}`
    });
  } catch (error) {
    console.error('Error testing encode command:', error);
    throw error;
  }
};
;// external ["wp","components"]
const external_wp_components_namespaceObject = window["wp"]["components"];
;// external ["wp","compose"]
const external_wp_compose_namespaceObject = window["wp"]["compose"];
;// external ["wp","element"]
const external_wp_element_namespaceObject = window["wp"]["element"];
;// ../src/icons.json
const icons_namespaceObject = /*#__PURE__*/JSON.parse('{"download":{"viewBox":"0 0 24 24","paths":[{"d":"M18 11.3l-1-1.1-4 4V3h-1.5v11.3L7 10.2l-1 1.1 6.2 5.8 5.8-5.8zm.5 3.7v3.5h-13V15H4v5h16v-5h-1.5z"}]},"share":{"viewBox":"0 0 24 24","paths":[{"d":"M9 11.8l6.1-4.5c.1.4.4.7.9.7h2c.6 0 1-.4 1-1V5c0-.6-.4-1-1-1h-2c-.6 0-1 .4-1 1v.4l-6.4 4.8c-.2-.1-.4-.2-.6-.2H6c-.6 0-1 .4-1 1v2c0 .6.4 1 1 1h2c.2 0 .4-.1.6-.2l6.4 4.8v.4c0 .6.4 1 1 1h2c.6 0 1-.4 1-1v-2c0-.6-.4-1-1-1h-2c-.5 0-.8.3-.9.7L9 12.2v-.4z"}]},"close":{"viewBox":"0 0 24 24","paths":[{"d":"m13.06 12 6.47-6.47-1.06-1.06L12 10.94 5.53 4.47 4.47 5.53 10.94 12l-6.47 6.47 1.06 1.06L12 13.06l6.47 6.47 1.06-1.06L13.06 12Z"}]},"external":{"viewBox":"0 0 1080 1080","paths":[{"d":"M994.56 986.8H68.33V169.45h463.11v70H138.33V916.8h786.23V623.33h70z"},{"d":"M549.07 598.54h-70v-3.49c-.02-63.64-.04-142.85 49.5-207.82 56.32-73.87 162.4-109.79 324.25-109.79h.24c111.9.02 128.37-.04 135.4-.06 1.82 0 3-.01 5-.01v70c-1.89 0-3.01 0-4.74.01-7.07.03-23.63.09-135.67.06h-.22c-75.54 0-137.44 8.45-183.99 25.11-37.98 13.59-65.66 32.28-84.6 57.13-35.2 46.17-35.18 109.49-35.17 165.36v3.51Z"},{"d":"m873.68 499.79-52.2-46.63L946.4 313.31 823.14 183.75l50.72-48.25 167.74 176.32z"}]},"iosShare":{"viewBox":"0 0 1080 1080","paths":[{"d":"M760.96 270.67h170.07V979H126.25V270.67H312.3m226.28 367.29V89.31m-149.87 152 149.87-152 153.17 152","fill":"none","stroke":"currentColor","stroke-miterlimit":"10","stroke-width":"70"}]},"curveShare":{"viewBox":"0 0 512 512","paths":[{"d":"M512 241.7 273.643 3.343v156.152c-71.41 3.744-138.015 33.337-188.958 84.28C30.075 298.384 0 370.991 0 448.222v60.436l29.069-52.985c45.354-82.671 132.173-134.027 226.573-134.027 5.986 0 12.004.212 18.001.632v157.779zm-256.358 48.966c-84.543 0-163.661 36.792-217.939 98.885 26.634-114.177 129.256-199.483 251.429-199.483h15.489V78.131l163.568 163.568-163.568 163.568V294.531l-13.585-1.683a289 289 0 0 0-35.394-2.182"}]},"embed":{"viewBox":"0 0 24 24","paths":[{"d":"M20.8 10.7l-4.3-4.3-1.1 1.1 4.3 4.3c.1.1.1.3 0 .4l-4.3 4.3 1.1 1.1 4.3-4.3c.7-.8.7-1.9 0-2.6zM4.2 11.8l4.3-4.3-1-1-4.3 4.3c-.7.7-.7 1.8 0 2.5l4.3 4.3 1.1-1.1-4.3-4.3c-.2-.1-.2-.3-.1-.4z"}]},"eye":{"viewBox":"0 0 24 24","paths":[{"d":"M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"}]},"play":{"viewBox":"0 0 24 24","paths":[{"d":"M8 5v14l11-7z"}]},"playOutline":{"viewBox":"0 0 24 24","paths":[{"d":"M8 5v14l11-7z","fill":"none","stroke":"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}]},"copyLink":{"viewBox":"0 0 16 16","paths":[{"d":"M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z"},{"d":"M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z"}]},"bluesky":{"viewBox":"0 0 16 16","paths":[{"d":"M3.468 1.948C5.303 3.325 7.276 6.118 8 7.616c.725-1.498 2.698-4.29 4.532-5.668C13.855.955 16 .186 16 2.632c0 .489-.28 4.105-.444 4.692-.572 2.04-2.653 2.561-4.504 2.246 3.236.551 4.06 2.375 2.281 4.2-3.376 3.464-4.852-.87-5.23-1.98-.07-.204-.103-.3-.103-.218 0-.081-.033.014-.102.218-.379 1.11-1.855 5.444-5.231 1.98-1.778-1.825-.955-3.65 2.28-4.2-1.85.315-3.932-.205-4.503-2.246C.28 6.737 0 3.12 0 2.632 0 .186 2.145.955 3.468 1.948"}]},"threads":{"viewBox":"0 0 16 16","paths":[{"d":"M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948s.928 1.509 1.005 2.644q.492.207.905.484c1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.2 6.2 0 0 0-1.528-.161"}]},"facebook":{"viewBox":"0 0 16 16","paths":[{"d":"M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.8V16c3.824-.604 6.75-3.934 6.75-7.951z"}]},"reddit":{"viewBox":"0 0 16 16","paths":[{"d":"M6.167 8a.83.83 0 0 0-.83.83c0 .459.372.84.83.831a.831.831 0 0 0 0-1.661m1.843 3.647c.315 0 1.403-.038 1.976-.611a.23.23 0 0 0 0-.306.213.213 0 0 0-.306 0c-.353.363-1.126.487-1.67.487-.545 0-1.308-.124-1.671-.487a.213.213 0 0 0-.306 0 .213.213 0 0 0 0 .306c.564.563 1.652.61 1.977.61zm.992-2.807c0 .458.373.83.831.83s.83-.381.83-.83a.831.831 0 0 0-1.66 0z"},{"d":"M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.828-1.165c-.315 0-.602.124-.812.325-.801-.573-1.9-.945-3.121-.993l.534-2.501 1.738.372a.83.83 0 1 0 .83-.869.83.83 0 0 0-.744.468l-1.938-.41a.2.2 0 0 0-.153.028.2.2 0 0 0-.086.134l-.592 2.788c-1.24.038-2.358.41-3.17.992-.21-.2-.496-.324-.81-.324a1.163 1.163 0 0 0-.478 2.224q-.03.17-.029.353c0 1.795 2.091 3.256 4.669 3.256s4.668-1.451 4.668-3.256c0-.114-.01-.238-.029-.353.401-.181.688-.592.688-1.069 0-.65-.525-1.165-1.165-1.165"}]},"email":{"viewBox":"0 0 16 16","paths":[{"d":"M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.976-5.64-3.384L8 9.83l-1.326-.795-5.64 3.384A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.641ZM1 11.105l4.708-2.897L1 5.383v5.722Z"}]}}');
;// external "ReactJSXRuntime"
const external_ReactJSXRuntime_namespaceObject = window["ReactJSXRuntime"];
;// ./src/assets/icon.js
/* unused harmony import specifier */ var _jsxs;
/* unused harmony import specifier */ var _jsx;


const createIcon = name => {
  const icon = icons_namespaceObject[name];
  if (!icon) {
    return null;
  }
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: icon.viewBox,
    className: "videopack-icon-svg",
    children: icon.paths.map((path, idx) => {
      const props = {};
      Object.keys(path).forEach(key => {
        const propName = key.includes('-') ? key.replace(/-([a-z])/g, g => g[1].toUpperCase()) : key;
        props[propName] = path[key];
      });
      return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
        ...props
      }, idx);
    })
  });
};
const videopack = /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("g", {
    transform: "rotate(-45 200.518 199.773)",
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("circle", {
      cx: 200.52,
      cy: 199.77,
      r: 182.56,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("circle", {
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
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M98.37 124.52h45.81l57.42 98.69 55.57-98.69h47.48L201.51 303.03 98.37 125.9"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
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
const videopackTitle = /*#__PURE__*/(/* unused pure expression or super */ null && (_jsxs("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/_jsx("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M1.92 52.81h396.16v285.84H1.92z"
  }), /*#__PURE__*/_jsx("path", {
    d: "M295.68 87.22v44.5h-72.27V311.4h-53.54V131.72H97.6v-44.5z",
    style: {
      fill: '#fff'
    }
  })]
})));
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
const videopackViewCount = /*#__PURE__*/(/* unused pure expression or super */ null && (_jsxs("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/_jsx("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m8.57 162.7 71.81 40.43-71.81 41.79"
  }), /*#__PURE__*/_jsx("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M8.46 250.14V227.9l47.92-27.88-47.92-26.98v-23.05l86.68 50.07-86 50.08m169.59-93.16-6.47 24.1h19.53l6.47-24.1h11.41l-6.47 24.1h12.94v9.51h-15.47l-4.95 18.39h14.2v9.51h-16.74l-6.21 23.46h-11.41l6.21-23.46h-19.53l-6.21 23.46h-11.41l6.21-23.46h-13.57v-9.51h16.11l4.95-18.39h-14.84v-9.51h17.37l6.47-24.1zm-13.95 51.99h19.53l4.95-18.39h-19.53zm101.7-51.99-6.47 24.1h19.53l6.47-24.1h11.41l-6.47 24.1h12.94v9.51h-15.47l-4.95 18.39h14.2v9.51h-16.74l-6.21 23.46h-11.41l6.21-23.46h-19.53l-6.21 23.46h-11.41l6.21-23.46h-13.57v-9.51h16.11l4.95-18.39h-14.84v-9.51h17.37l6.47-24.1zm-13.95 51.99h19.53l4.95-18.39h-19.53zm101.7-51.99-6.47 24.1h19.53l6.47-24.1h11.41l-6.47 24.1h12.94v9.51h-15.47l-4.95 18.39h14.2v9.51h-16.74l-6.21 23.46h-11.41l6.21-23.46h-19.53l-6.21 23.46h-11.41l6.21-23.46h-13.57v-9.51h16.11l4.95-18.39h-14.84v-9.51h17.37l6.47-24.1zm-13.95 51.99h19.53l4.95-18.39h-19.53z"
  })]
})));
const videopackWatermark = /*#__PURE__*/(/* unused pure expression or super */ null && (_jsx("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: /*#__PURE__*/_jsxs("g", {
    style: {
      opacity: 0.2
    },
    children: [/*#__PURE__*/_jsxs("g", {
      transform: "rotate(-45 201.506 200.804)",
      children: [/*#__PURE__*/_jsx("circle", {
        cx: 201.51,
        cy: 200.8,
        r: 121.45,
        style: {
          fill: '#fff'
        }
      }), /*#__PURE__*/_jsx("circle", {
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
    }), /*#__PURE__*/_jsx("path", {
      style: {
        fill: '#cd0000'
      },
      d: "M133.55 150.74h30.48l38.2 65.65 36.97-65.65h31.58l-68.61 118.75-68.62-117.83"
    }), /*#__PURE__*/_jsx("path", {
      style: {
        fill: '#ff9ca1'
      },
      d: "m239.2 150.74-36.97 65.65-38.2-65.65"
    })]
  })
})));
const volumeDown = /*#__PURE__*/(/* unused pure expression or super */ null && (_jsxs("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "currentColor",
  children: [/*#__PURE__*/_jsx("path", {
    d: "M0 0h24v24H0V0z",
    fill: "none"
  }), /*#__PURE__*/_jsx("path", {
    d: "M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"
  })]
})));
const volumeUp = /*#__PURE__*/(/* unused pure expression or super */ null && (_jsxs("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "currentColor",
  children: [/*#__PURE__*/_jsx("path", {
    d: "M0 0h24v24H0V0z",
    fill: "none"
  }), /*#__PURE__*/_jsx("path", {
    d: "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
  })]
})));
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
const pause = /*#__PURE__*/(/* unused pure expression or super */ null && (_jsx("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "currentColor",
  children: /*#__PURE__*/_jsx("path", {
    d: "M6 19h4V5H6v14zm8-14v14h4V5h-4z"
  })
})));
const playOutline = createIcon('playOutline');
const shareAlt1 = createIcon('iosShare');
const shareAlt2 = createIcon('external');
const shareAlt3 = createIcon('curveShare');
const download = createIcon('download');
const share = createIcon('share');
const icon_close = createIcon('close');
const icon_embed = createIcon('embed');
const copyLink = createIcon('copyLink');
const bluesky = createIcon('bluesky');
const threads = createIcon('threads');
const facebook = createIcon('facebook');
const reddit = createIcon('reddit');
const email = createIcon('email');

;// ./src/features/settings/components/TextControlOnBlur.js



const TextControlOnBlur = ({
  value,
  onChange,
  ...props
}) => {
  const [innerValue, setInnerValue] = (0,external_wp_element_namespaceObject.useState)(value);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
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
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.TextControl, {
    ...props,
    value: innerValue,
    onChange: handleOnChange,
    onBlur: handleOnBlur,
    type: "search"
  });
};
/* harmony default export */ const components_TextControlOnBlur = (TextControlOnBlur);
;// ./src/features/settings/components/VideopackTooltip.js
/* unused harmony import specifier */ var Tooltip;
/* unused harmony import specifier */ var Icon;
/* unused harmony import specifier */ var help;
/* unused harmony import specifier */ var VideopackTooltip_jsx;



const VideopackTooltip = ({
  text
}) => {
  return /*#__PURE__*/VideopackTooltip_jsx(Tooltip, {
    text: text,
    className: "videopack-tooltip",
    children: /*#__PURE__*/VideopackTooltip_jsx("span", {
      className: "videopack-tooltip-trigger",
      children: /*#__PURE__*/VideopackTooltip_jsx(Icon, {
        icon: help
      })
    })
  });
};
/* harmony default export */ const components_VideopackTooltip = ((/* unused pure expression or super */ null && (VideopackTooltip)));
;// ./src/features/settings-network/settings-network.js
/**
 * Features for managing network-wide settings.
 */













const capitalizeFirstLetter = string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * NetworkSettingsPage component.
 *
 * @return {Object} The rendered component.
 */
const NetworkSettingsPage = () => {
  const [settings, setSettings] = (0,external_wp_element_namespaceObject.useState)(null);
  const [users, setUsers] = (0,external_wp_element_namespaceObject.useState)(null);
  const [isSettingsChanged, setIsSettingsChanged] = (0,external_wp_element_namespaceObject.useState)(false);
  const settingsRef = (0,external_wp_element_namespaceObject.useRef)(settings);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    settingsRef.current = settings;
  }, [settings]);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    getNetworkSettings().then(response => {
      setSettings(response);
    }).catch(error => {
      console.error('Error fetching network settings:', error);
    });
    getUsersWithCapability('edit_others_video_encodes').then(response => {
      setUsers(response);
    }).catch(error => {
      console.error(error);
    });
  }, []);
  const debouncedSaveSettings = (0,external_wp_compose_namespaceObject.useDebounce)(newSettings => {
    saveNetworkSettings(newSettings).then(response => {
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
      console.error('Error updating network settings:', error);
    });
  }, 1000);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    if (isSettingsChanged) {
      debouncedSaveSettings(settings);
    }
  }, [isSettingsChanged, debouncedSaveSettings, settings]);
  const changeHandlerFactory = (0,external_wp_element_namespaceObject.useMemo)(() => {
    if (!settings || typeof settings !== 'object') {
      return {};
    }
    return Object.keys(settings).reduce((acc, setting) => {
      acc[setting] = newValue => {
        setSettings(prevSettings => ({
          ...prevSettings,
          [setting]: newValue
        }));
        setIsSettingsChanged(true);
      };
      return acc;
    }, {});
  }, [settings]);
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
          label: (0,external_wp_i18n_namespaceObject.__)('Auto', 'video-embed-thumbnail-generator')
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
  const errorEmailOptions = () => {
    const authorizedUsers = [{
      value: 'nobody',
      label: (0,external_wp_i18n_namespaceObject.__)('Nobody', 'video-embed-thumbnail-generator')
    }, {
      value: 'encoder',
      label: (0,external_wp_i18n_namespaceObject.__)('User who initiated encoding', 'video-embed-thumbnail-generator')
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
  const resetSettings = () => {
    resetNetworkSettings().then(response => {
      setSettings(response);
      setIsSettingsChanged(true);
    }).catch(error => {
      console.error(error);
    });
  };
  const RolesCheckboxes = () => {
    const handleCapabilityChange = (roleName, capability, isChecked) => {
      const updatedCapabilities = {
        ...settings.default_capabilities,
        [capability]: {
          ...settings.default_capabilities[capability],
          [roleName]: isChecked
        }
      };
      changeHandlerFactory.default_capabilities(updatedCapabilities);
    };
    const getCapabilityLabel = capabilityKey => {
      const labels = {
        make_video_thumbnails: (0,external_wp_i18n_namespaceObject.__)('Can make thumbnails', 'video-embed-thumbnail-generator'),
        encode_videos: (0,external_wp_i18n_namespaceObject.__)('Can encode videos', 'video-embed-thumbnail-generator'),
        edit_others_video_encodes: (0,external_wp_i18n_namespaceObject.__)("Can edit other users' encoded videos", 'video-embed-thumbnail-generator'),
        view_full_length_video: (0,external_wp_i18n_namespaceObject.__)('Can view full length videos', 'videopack-pro')
      };
      return labels[capabilityKey] || capitalizeFirstLetter(capabilityKey.replace(/_/g, ' '));
    };
    return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.PanelBody, {
      title: (0,external_wp_i18n_namespaceObject.__)('User capabilities for new sites', 'video-embed-thumbnail-generator'),
      initialOpen: true,
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Flex, {
        direction: "row",
        gap: 20,
        className: "videopack-setting-capabilities",
        children: Object.entries(settings.default_capabilities).map(([capabilityKey, roles]) => {
          if (capabilityKey === 'view_full_length_video' && !settings.restrict_playback_by_capability) {
            return null;
          }
          return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.FlexItem, {
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("p", {
              className: "videopack-settings-label",
              children: getCapabilityLabel(capabilityKey)
            }), Object.entries(roles).map(([roleKey, isEnabled]) => /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.CheckboxControl, {
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
  if (!settings || Object.keys(settings).length === 0) {
    return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Spinner, {});
  }
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
    className: "wrap videopack-settings-network",
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("h1", {
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Icon, {
        className: "videopack-settings-icon",
        icon: videopack,
        size: 40
      }), (0,external_wp_i18n_namespaceObject.__)('Videopack Network Settings', 'video-embed-thumbnail-generator')]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.Panel, {
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.PanelBody, {
        title: (0,external_wp_i18n_namespaceObject.__)('FFmpeg Settings', 'video-embed-thumbnail-generator'),
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.PanelRow, {
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(components_TextControlOnBlur, {
            __nextHasNoMarginBottom: true,
            __next40pxDefaultSize: true,
            label: (0,external_wp_i18n_namespaceObject.__)('Path to FFmpeg folder on server', 'video-embed-thumbnail-generator'),
            value: settings.app_path,
            onChange: changeHandlerFactory.app_path,
            help: (0,external_wp_i18n_namespaceObject.__)('Leave blank if FFmpeg is in your system path.', 'video-embed-thumbnail-generator')
          })
        }), settings.ffmpeg_exists !== true && settings.ffmpeg_error && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
          className: "notice notice-error videopack-ffmpeg-notice",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("p", {
            dangerouslySetInnerHTML: {
              __html: settings.ffmpeg_error
            }
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,external_wp_i18n_namespaceObject.__)('Only Super Admins can change FFmpeg Settings', 'video-embed-thumbnail-generator'),
          checked: !!settings.superadmin_only_ffmpeg_settings,
          onChange: changeHandlerFactory.superadmin_only_ffmpeg_settings
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.PanelBody, {
        title: (0,external_wp_i18n_namespaceObject.__)('Execution', 'video-embed-thumbnail-generator'),
        opened: settings.ffmpeg_exists === true,
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.RangeControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,external_wp_i18n_namespaceObject.__)('Simultaneous encodes', 'video-embed-thumbnail-generator'),
          value: settings.simultaneous_encodes,
          className: "videopack-settings-slider",
          onChange: changeHandlerFactory.simultaneous_encodes,
          min: 1,
          max: 10,
          step: 1,
          marks: generateNonCrfMarks('simultaneous'),
          disabled: settings.ffmpeg_exists !== true
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.RangeControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,external_wp_i18n_namespaceObject.__)('Threads', 'video-embed-thumbnail-generator'),
          value: settings.threads,
          className: "videopack-settings-slider",
          onChange: changeHandlerFactory.threads,
          min: 0,
          max: 16,
          step: 1,
          marks: generateNonCrfMarks('threads'),
          disabled: settings.ffmpeg_exists !== true
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,external_wp_i18n_namespaceObject.__)('Run nice', 'video-embed-thumbnail-generator'),
          checked: !!settings.nice,
          onChange: changeHandlerFactory.nice,
          disabled: settings.ffmpeg_exists !== true
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.PanelBody, {
        title: (0,external_wp_i18n_namespaceObject.__)('Email Notifications', 'video-embed-thumbnail-generator'),
        opened: settings.ffmpeg_exists === true,
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
          className: "videopack-setting-auto-width",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.SelectControl, {
            __nextHasNoMarginBottom: true,
            __next40pxDefaultSize: true,
            label: (0,external_wp_i18n_namespaceObject.__)('Network Error Email', 'video-embed-thumbnail-generator'),
            value: settings.network_error_email,
            onChange: changeHandlerFactory.network_error_email,
            options: errorEmailOptions(),
            help: (0,external_wp_i18n_namespaceObject.__)('Receive encoding error notifications for all sites in the network.', 'video-embed-thumbnail-generator'),
            disabled: settings.ffmpeg_exists !== true
          })
        })
      }), settings.default_capabilities && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(RolesCheckboxes, {}), (0,external_wp_hooks_namespaceObject.applyFilters)('videopack.settings.network.panels', [], settings, changeHandlerFactory), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.PanelRow, {
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          variant: "primary",
          onClick: resetSettings,
          className: 'videopack-settings-reset',
          children: (0,external_wp_i18n_namespaceObject.__)('Reset Settings', 'video-embed-thumbnail-generator')
        })
      })]
    })]
  });
};
const el = document.getElementById('videopack-network-settings-root');
if (el) {
  const root = (0,external_wp_element_namespaceObject.createRoot)(el);
  root.render(/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(NetworkSettingsPage, {}));
}
/******/ })()
;