/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
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
/************************************************************************/

;// external ["wp","blocks"]
const external_wp_blocks_namespaceObject = window["wp"]["blocks"];
;// external ["wp","blockEditor"]
const external_wp_blockEditor_namespaceObject = window["wp"]["blockEditor"];
;// external ["wp","data"]
const external_wp_data_namespaceObject = window["wp"]["data"];
;// external ["wp","element"]
const external_wp_element_namespaceObject = window["wp"]["element"];
;// external ["wp","components"]
const external_wp_components_namespaceObject = window["wp"]["components"];
;// external ["wp","i18n"]
const external_wp_i18n_namespaceObject = window["wp"]["i18n"];
;// external ["wp","apiFetch"]
const external_wp_apiFetch_namespaceObject = window["wp"]["apiFetch"];
var external_wp_apiFetch_default = /*#__PURE__*/__webpack_require__.n(external_wp_apiFetch_namespaceObject);
;// external ["wp","hooks"]
const external_wp_hooks_namespaceObject = window["wp"]["hooks"];
;// ./src/api/settings.js
/* unused harmony import specifier */ var apiFetch;
/**
 * API service for managing Videopack settings.
 */



let cachedSettings = null;
let settingsPromise = null;

/**
 * Fetches global Videopack settings.
 */
const getSettings = async () => {
  const pre = (0,external_wp_hooks_namespaceObject.applyFilters)('videopack.utils.pre_getSettings', undefined);
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
    cachedSettings = allSettings.videopack_options || {};
    settingsPromise = null;
    return (0,external_wp_hooks_namespaceObject.applyFilters)('videopack.utils.getSettings', cachedSettings);
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
    const response = await apiFetch({
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
;// external ["wp","compose"]
const external_wp_compose_namespaceObject = window["wp"]["compose"];
;// external ["wp","url"]
const external_wp_url_namespaceObject = window["wp"]["url"];
;// ./src/api/gallery.js
/* unused harmony import specifier */ var gallery_apiFetch;
/* unused harmony import specifier */ var addQueryArgs;
/* unused harmony import specifier */ var applyFilters;
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
    return await gallery_apiFetch({
      path: addQueryArgs('/videopack/v1/presets', query),
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
  const pre = (0,external_wp_hooks_namespaceObject.applyFilters)('videopack.utils.pre_getVideoGallery', undefined, args);
  if (typeof pre !== 'undefined') {
    return pre;
  }
  try {
    const response = await external_wp_apiFetch_default()({
      path: (0,external_wp_url_namespaceObject.addQueryArgs)('/videopack/v1/video_gallery', args),
      method: 'GET'
    });
    return (0,external_wp_hooks_namespaceObject.applyFilters)('videopack.utils.getVideoGallery', response, args);
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
    return await gallery_apiFetch({
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
 * @param {number} rotate     The rotation angle.
 */
const testEncodeCommand = async (codec, resolution, rotate) => {
  const pre = applyFilters('videopack.utils.pre_testEncodeCommand', undefined, codec, resolution, rotate);
  if (typeof pre !== 'undefined') {
    return pre;
  }
  try {
    return await gallery_apiFetch({
      path: `/videopack/v1/ffmpeg-test/?codec=${codec}&resolution=${resolution}&rotate=${rotate}`
    });
  } catch (error) {
    console.error('Error testing encode command:', error);
    throw error;
  }
};
;// ./src/hooks/useVideoQuery.js





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
    collection_video_limit = 12,
    id
  } = attributes;
  const {
    categories,
    tags
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const core = select('core');
    if (!core) {
      return {
        categories: [],
        tags: []
      };
    }
    const {
      getEntityRecords
    } = core;
    return {
      categories: getEntityRecords('taxonomy', 'category', {
        per_page: -1
      }),
      tags: getEntityRecords('taxonomy', 'post_tag', {
        per_page: -1
      })
    };
  }, []);
  const [searchString, setSearchString] = (0,external_wp_element_namespaceObject.useState)('');
  const debouncedSetSearchString = (0,external_wp_compose_namespaceObject.useDebounce)(setSearchString, 500);
  const postTypes = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const core = select('core');
    return core ? core.getPostTypes({
      per_page: -1
    }) : [];
  }, []);
  const {
    isSaving,
    isAutosaving
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
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
  const searchableTypes = (0,external_wp_element_namespaceObject.useMemo)(() => {
    if (!postTypes) {
      return ['post', 'page'];
    }
    return postTypes.filter(type => type.viewable && type.slug !== 'attachment').map(type => type.slug);
  }, [postTypes]);
  const [videoResults, setVideoResults] = (0,external_wp_element_namespaceObject.useState)([]);
  const [totalResults, setTotalResults] = (0,external_wp_element_namespaceObject.useState)(0);
  const [maxNumPages, setMaxNumPages] = (0,external_wp_element_namespaceObject.useState)(1);
  const [isResolvingVideos, setIsResolvingVideos] = (0,external_wp_element_namespaceObject.useState)(false);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    if (isSaving || isAutosaving) {
      return;
    }
    const args = {
      gallery_orderby: gallery_orderby || 'post_date',
      gallery_order: gallery_order || 'DESC',
      gallery_per_page: gallery_pagination ? parseInt(gallery_per_page, 10) || 12 : enable_collection_video_limit ? parseInt(collection_video_limit, 10) || 12 : -1,
      page_number: parseInt(page_number, 10) || 1,
      gallery_id: gallery_id ? parseInt(gallery_id, 10) : previewPostId ? parseInt(previewPostId, 10) : undefined,
      gallery_include: gallery_include || id,
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
    getVideoGallery(args).then(response => {
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
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const core = select('core');
    if (!core) {
      return {
        searchResults: [],
        currentPost: null,
        isResolvingSearch: false
      };
    }
    const {
      getEntityRecord,
      getEntityRecords,
      isResolving: checkResolving
    } = core;
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
  const excludedIds = (0,external_wp_element_namespaceObject.useMemo)(() => {
    return gallery_exclude ? gallery_exclude.split(',').map(id => parseInt(id, 10)) : [];
  }, [gallery_exclude]);
  const excludedVideos = (0,external_wp_data_namespaceObject.useSelect)(select => {
    if (excludedIds.length === 0) {
      return [];
    }
    const core = select('core');
    if (!core) {
      return [];
    }
    const records = core.getEntityRecords('postType', 'attachment', {
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
;// external "ReactJSXRuntime"
const external_ReactJSXRuntime_namespaceObject = window["ReactJSXRuntime"];
;// ./src/assets/icon.js

const videopack = /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("svg", {
  width: "20px",
  height: "20px",
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 395.11 395.11",
  children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("g", {
    "data-name": "Ellipse 1",
    transform: "rotate(-45 -201.149 592.789)",
    children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("circle", {
      cx: "360.24",
      cy: "595.24",
      r: "182.56",
      fill: "none",
      stroke: "#cd0000",
      strokeWidth: "30"
    })
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    fill: "#cd0000",
    d: "M95.4 108.3h45.81l57.42 98.69 55.57-98.69h47.49L198.54 286.81 95.4 109.68"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    fill: "#f26a6b",
    d: "M254.2 108.3l-55.57 98.69-57.42-98.69"
  })]
});
const volumeDown = /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "currentColor",
  children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    d: "M0 0h24v24H0V0z",
    fill: "none"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    d: "M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"
  })]
});
const volumeUp = /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "currentColor",
  children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    d: "M0 0h24v24H0V0z",
    fill: "none"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    d: "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
  })]
});
const save = /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "currentColor",
  children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    d: "M0 0h24v24H0V0z",
    fill: "none"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    d: "M17 3H3v18h18V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"
  })]
});
const insertImage = /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "currentColor",
  children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    d: "M21 21V3H3v18h18zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
  })
});
const sortAscending = /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "currentColor",
  children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    d: "M19 17H22L18 21L14 17H17V3H19M2 17H12V19H2M6 5V7H2V5M2 11H9V13H2V11Z"
  })
});
const sortDescending = /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "currentColor",
  children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    d: "M19 7H22L18 3L14 7H17V21H19M2 17H12V19H2M6 5V7H2V5M2 11H9V13H2V11Z"
  })
});
const play = /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "currentColor",
  children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    d: "M8 5v14l11-7z"
  })
});
const pause = /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "currentColor",
  children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    d: "M6 19h4V5H6v14zm8-14v14h4V5h-4z"
  })
});
const playOutline = /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    d: "M8 5v14l11-7z",
    fill: "none"
  })
});

;// external ["wp","htmlEntities"]
const external_wp_htmlEntities_namespaceObject = window["wp"]["htmlEntities"];
;// ./src/components/InspectorControls/QuerySettings.js




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
      label: (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(currentPost.title.rendered)
    });
  }
  if (searchResults) {
    searchResults.forEach(post => {
      if (!optionsForSelect.find(o => o.value === post.id)) {
        optionsForSelect.push({
          value: post.id,
          label: (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(post.title.rendered)
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
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.SelectControl, {
      label: (0,external_wp_i18n_namespaceObject.__)('Source', 'video-embed-thumbnail-generator'),
      value: gallery_source,
      options: [{
        label: (0,external_wp_i18n_namespaceObject.__)('Current Post', 'video-embed-thumbnail-generator'),
        value: 'current'
      }, {
        label: (0,external_wp_i18n_namespaceObject.__)('Other Post', 'video-embed-thumbnail-generator'),
        value: 'custom'
      }, {
        label: (0,external_wp_i18n_namespaceObject.__)('Category', 'video-embed-thumbnail-generator'),
        value: 'category'
      }, {
        label: (0,external_wp_i18n_namespaceObject.__)('Tag', 'video-embed-thumbnail-generator'),
        value: 'tag'
      }, {
        label: (0,external_wp_i18n_namespaceObject.__)('Inherit from Global Query', 'video-embed-thumbnail-generator'),
        value: 'archive'
      }, showManualSource && {
        label: (0,external_wp_i18n_namespaceObject.__)('Manual', 'video-embed-thumbnail-generator'),
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
    }), gallery_source === 'custom' && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ComboboxControl, {
      label: (0,external_wp_i18n_namespaceObject.__)('Search Posts', 'video-embed-thumbnail-generator'),
      value: gallery_id,
      options: optionsForSelect,
      onFilterValueChange: debouncedSetSearchString,
      onChange: newValue => setAttributes({
        gallery_id: newValue ? parseInt(newValue, 10) : undefined
      }),
      help: (0,external_wp_i18n_namespaceObject.__)('Start typing to search for a post or page.', 'video-embed-thumbnail-generator'),
      allowReset: true,
      isLoading: isResolvingSearch
    }), gallery_source === 'category' && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.SelectControl, {
      label: (0,external_wp_i18n_namespaceObject.__)('Select Category', 'video-embed-thumbnail-generator'),
      value: gallery_category,
      options: [{
        label: (0,external_wp_i18n_namespaceObject.__)('Select…', 'video-embed-thumbnail-generator'),
        value: ''
      }, ...mapTermsToOptions(categories)],
      onChange: attributeChangeFactory('gallery_category')
    }), gallery_source === 'tag' && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.SelectControl, {
      label: (0,external_wp_i18n_namespaceObject.__)('Select Tag', 'video-embed-thumbnail-generator'),
      value: gallery_tag,
      options: [{
        label: (0,external_wp_i18n_namespaceObject.__)('Select…', 'video-embed-thumbnail-generator'),
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
    gallery_include,
    gallery_orderby,
    gallery_order,
    gallery_per_page,
    enable_collection_video_limit,
    collection_video_limit,
    gallery_pagination
  } = attributes;
  const baseGalleryOrderbyOptions = (0,external_wp_element_namespaceObject.useMemo)(() => [{
    value: 'post_date',
    label: (0,external_wp_i18n_namespaceObject.__)('Date', 'video-embed-thumbnail-generator')
  }, {
    value: 'menu_order',
    label: (0,external_wp_i18n_namespaceObject.__)('Default', 'video-embed-thumbnail-generator')
  }, {
    value: 'title',
    label: (0,external_wp_i18n_namespaceObject.__)('Title', 'video-embed-thumbnail-generator')
  }, {
    value: 'rand',
    label: (0,external_wp_i18n_namespaceObject.__)('Random', 'video-embed-thumbnail-generator')
  }, {
    value: 'ID',
    label: (0,external_wp_i18n_namespaceObject.__)('Video ID', 'video-embed-thumbnail-generator')
  }], []);
  const orderbyOptions = (0,external_wp_element_namespaceObject.useMemo)(() => {
    if (gallery_include) {
      return [...baseGalleryOrderbyOptions, {
        value: 'include',
        label: (0,external_wp_i18n_namespaceObject.__)('Manually Sorted', 'video-embed-thumbnail-generator')
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
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(QuerySettings, {
      attributes: attributes,
      setAttributes: setAttributes,
      queryData: queryData,
      showArchiveSource: isSiteEditor,
      showManualSource: showManualSource
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
      className: "videopack-sort-control-wrapper",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.SelectControl, {
        label: (0,external_wp_i18n_namespaceObject.__)('Sort by', 'video-embed-thumbnail-generator'),
        value: gallery_orderby,
        onChange: val => setAttributes({
          gallery_orderby: val
        }),
        options: orderbyOptions
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
        icon: gallery_order === 'asc' ? sortAscending : sortDescending,
        label: gallery_order === 'asc' ? (0,external_wp_i18n_namespaceObject.__)('Ascending', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_namespaceObject.__)('Descending', 'video-embed-thumbnail-generator'),
        onClick: () => setAttributes({
          gallery_order: gallery_order === 'asc' ? 'desc' : 'asc'
        }),
        showTooltip: true
      })]
    }), !!gallery_pagination || !!hasPaginationBlock ? /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.TextControl, {
      label: (0,external_wp_i18n_namespaceObject.__)('Number of videos per page', 'video-embed-thumbnail-generator'),
      type: "number",
      value: gallery_per_page ?? '',
      placeholder: options.gallery_per_page,
      onChange: val => updateNumericAttribute('gallery_per_page', val)
    }) : /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ToggleControl, {
        __nextHasNoMarginBottom: true,
        label: (0,external_wp_i18n_namespaceObject.__)('Limit number of videos', 'video-embed-thumbnail-generator'),
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
      }), !!enable_collection_video_limit && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.TextControl, {
        __nextHasNoMarginBottom: true,
        __next40pxDefaultSize: true,
        label: (0,external_wp_i18n_namespaceObject.__)('Video Limit', 'video-embed-thumbnail-generator'),
        help: (0,external_wp_i18n_namespaceObject.__)('Maximum number of videos to show when pagination is disabled.', 'video-embed-thumbnail-generator'),
        type: "number",
        value: Number(collection_video_limit) === -1 ? 12 : collection_video_limit ?? '',
        onChange: val => updateNumericAttribute('collection_video_limit', val)
      })]
    }), !hasPaginationBlock && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ToggleControl, {
      __nextHasNoMarginBottom: true,
      label: (0,external_wp_i18n_namespaceObject.__)('Enable Pagination', 'video-embed-thumbnail-generator'),
      checked: !!gallery_pagination,
      onChange: val => setAttributes({
        gallery_pagination: val
      })
    })]
  });
}
;// external ["wp","primitives"]
const external_wp_primitives_namespaceObject = window["wp"]["primitives"];
;// ./node_modules/@wordpress/icons/build-module/library/close.mjs
// packages/icons/src/library/close.tsx


var close_default = /* @__PURE__ */ (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, { d: "m13.06 12 6.47-6.47-1.06-1.06L12 10.94 5.53 4.47 4.47 5.53 10.94 12l-6.47 6.47 1.06 1.06L12 13.06l6.47 6.47 1.06-1.06L13.06 12Z" }) });

//# sourceMappingURL=close.mjs.map

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
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
    className: "videopack-excluded-videos",
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("p", {
      children: (0,external_wp_i18n_namespaceObject.__)('Excluded Videos', 'video-embed-thumbnail-generator')
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      className: "videopack-excluded-list",
      children: excludedVideos.map(video => /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
        className: "videopack-excluded-item",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
          className: "videopack-excluded-thumbnail",
          children: video.meta?.['_videopack-meta']?.poster ? /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("img", {
            src: video.meta['_videopack-meta'].poster,
            alt: (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(video.title.rendered)
          }) : /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Icon, {
            icon: "format-video"
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
          className: "videopack-excluded-title",
          children: (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(video.title.rendered)
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          icon: close_default,
          onClick: () => handleUnexcludeItem(video.id),
          label: (0,external_wp_i18n_namespaceObject.__)('Restore', 'video-embed-thumbnail-generator'),
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
    gallery_end,
    gallery_pagination
  } = attributes;
  const updateNumericAttribute = (name, value) => {
    const parsedValue = parseInt(value, 10);
    setAttributes({
      [name]: isNaN(parsedValue) ? undefined : parsedValue
    });
  };
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.TextControl, {
      label: (0,external_wp_i18n_namespaceObject.__)('Max Columns', 'video-embed-thumbnail-generator'),
      type: "number",
      value: gallery_columns ?? '',
      onChange: val => updateNumericAttribute('gallery_columns', val)
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ToggleControl, {
      __nextHasNoMarginBottom: true,
      label: (0,external_wp_i18n_namespaceObject.__)('Title overlay', 'video-embed-thumbnail-generator'),
      onChange: val => setAttributes({
        overlay_title: val
      }),
      checked: overlay_title ?? !!options.overlay_title
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.SelectControl, {
      __nextHasNoMarginBottom: true,
      __next40pxDefaultSize: true,
      label: (0,external_wp_i18n_namespaceObject.__)('When current video ends', 'video-embed-thumbnail-generator'),
      value: gallery_end,
      onChange: val => setAttributes({
        gallery_end: val
      }),
      options: [{
        label: (0,external_wp_i18n_namespaceObject.__)('Stop and leave popup window open', 'video-embed-thumbnail-generator'),
        value: ''
      }, {
        label: (0,external_wp_i18n_namespaceObject.__)('Autoplay next video', 'video-embed-thumbnail-generator'),
        value: 'next'
      }, {
        label: (0,external_wp_i18n_namespaceObject.__)('Close popup window', 'video-embed-thumbnail-generator'),
        value: 'close'
      }]
    })]
  });
}
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
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
    className: "videopack-color-picker-container",
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
      className: "videopack-color-picker-label",
      children: label
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Dropdown, {
      className: "videopack-color-dropdown",
      contentClassName: "videopack-color-dropdown-content",
      renderToggle: ({
        isOpen,
        onToggle
      }) => /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
        onClick: onToggle,
        "aria-expanded": isOpen,
        variant: "secondary",
        className: "videopack-color-picker-button",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ColorIndicator, {
          colorValue: displayColor
        })
      }),
      renderContent: () => /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
        className: "videopack-color-picker-palette-wrapper",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ColorPalette, {
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
/* harmony default export */ const CompactColorPicker_CompactColorPicker = (CompactColorPicker);
;// ./src/utils/colors.js
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
;// ./src/components/InspectorControls/CollectionColorSettings.js






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
  const effectiveValues = (0,external_wp_element_namespaceObject.useMemo)(() => ({
    ...options,
    ...attributes
  }), [options, attributes]);
  const colorFallbacks = (0,external_wp_element_namespaceObject.useMemo)(() => getColorFallbacks(effectiveValues), [effectiveValues]);
  const THEME_COLORS = videopack_config?.themeColors || options?.themeColors;
  const isGalleryOrList = blockType === 'gallery' || blockType === 'list' || blockType === 'grid';
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [isGalleryOrList && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      className: "videopack-skin-section",
      style: {
        marginBottom: '16px'
      },
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.SelectControl, {
        label: (0,external_wp_i18n_namespaceObject.__)('Player Skin', 'video-embed-thumbnail-generator'),
        value: skin || options.skin || '',
        options: [{
          label: (0,external_wp_i18n_namespaceObject.__)('Videopack', 'video-embed-thumbnail-generator'),
          value: 'vjs-theme-videopack'
        }, {
          label: (0,external_wp_i18n_namespaceObject.__)('Videopack Classic', 'video-embed-thumbnail-generator'),
          value: 'kg-video-js-skin'
        }, {
          label: (0,external_wp_i18n_namespaceObject.__)('Video.js default', 'video-embed-thumbnail-generator'),
          value: 'default'
        }, {
          label: (0,external_wp_i18n_namespaceObject.__)('City', 'video-embed-thumbnail-generator'),
          value: 'vjs-theme-city'
        }, {
          label: (0,external_wp_i18n_namespaceObject.__)('Fantasy', 'video-embed-thumbnail-generator'),
          value: 'vjs-theme-fantasy'
        }, {
          label: (0,external_wp_i18n_namespaceObject.__)('Forest', 'video-embed-thumbnail-generator'),
          value: 'vjs-theme-forest'
        }, {
          label: (0,external_wp_i18n_namespaceObject.__)('Sea', 'video-embed-thumbnail-generator'),
          value: 'vjs-theme-sea'
        }],
        onChange: value => setAttributes({
          skin: value
        })
      })
    }), isGalleryOrList && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
      className: "videopack-color-section",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("p", {
        className: "videopack-settings-section-title",
        children: (0,external_wp_i18n_namespaceObject.__)('Titles', 'video-embed-thumbnail-generator')
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
        className: "videopack-color-flex-row",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
          className: "videopack-color-flex-item",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(CompactColorPicker_CompactColorPicker, {
            label: (0,external_wp_i18n_namespaceObject.__)('Text', 'video-embed-thumbnail-generator'),
            value: title_color,
            onChange: value => setAttributes({
              title_color: value
            }),
            colors: THEME_COLORS,
            fallbackValue: colorFallbacks.title_color
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
          className: "videopack-color-flex-item",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(CompactColorPicker_CompactColorPicker, {
            label: (0,external_wp_i18n_namespaceObject.__)('Background', 'video-embed-thumbnail-generator'),
            value: title_background_color,
            onChange: value => setAttributes({
              title_background_color: value
            }),
            colors: THEME_COLORS,
            fallbackValue: colorFallbacks.title_background_color
          })
        })]
      })]
    }), isGalleryOrList && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
      className: "videopack-color-section",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("p", {
        className: "videopack-settings-section-title",
        children: (0,external_wp_i18n_namespaceObject.__)('Player', 'video-embed-thumbnail-generator')
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
        className: "videopack-color-flex-row",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
          className: "videopack-color-flex-item",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(CompactColorPicker_CompactColorPicker, {
            label: (0,external_wp_i18n_namespaceObject.__)('Play Button Icon', 'video-embed-thumbnail-generator'),
            value: play_button_color,
            onChange: value => setAttributes({
              play_button_color: value
            }),
            colors: THEME_COLORS,
            fallbackValue: colorFallbacks.play_button_color
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
          className: "videopack-color-flex-item",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(CompactColorPicker_CompactColorPicker, {
            label: (0,external_wp_i18n_namespaceObject.__)('Play Button Accent', 'video-embed-thumbnail-generator'),
            value: play_button_secondary_color,
            onChange: value => setAttributes({
              play_button_secondary_color: value
            }),
            colors: THEME_COLORS,
            fallbackValue: colorFallbacks.play_button_secondary_color
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
          className: "videopack-color-flex-item",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(CompactColorPicker_CompactColorPicker, {
            label: (0,external_wp_i18n_namespaceObject.__)('Control Bar Background', 'video-embed-thumbnail-generator'),
            value: control_bar_bg_color,
            onChange: value => setAttributes({
              control_bar_bg_color: value
            }),
            colors: THEME_COLORS,
            fallbackValue: colorFallbacks.control_bar_bg_color
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
          className: "videopack-color-flex-item",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(CompactColorPicker_CompactColorPicker, {
            label: (0,external_wp_i18n_namespaceObject.__)('Control Bar Icons', 'video-embed-thumbnail-generator'),
            value: control_bar_color,
            onChange: value => setAttributes({
              control_bar_color: value
            }),
            colors: THEME_COLORS,
            fallbackValue: colorFallbacks.control_bar_color
          })
        })]
      })]
    }), showPaginationSettings && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
      className: "videopack-color-section",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("p", {
        className: "videopack-settings-section-title",
        children: (0,external_wp_i18n_namespaceObject.__)('Pagination', 'video-embed-thumbnail-generator')
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
        className: "videopack-color-flex-row is-pagination",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
          className: "videopack-color-flex-item",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(CompactColorPicker_CompactColorPicker, {
            label: (0,external_wp_i18n_namespaceObject.__)('Outline/Text', 'video-embed-thumbnail-generator'),
            value: pagination_color,
            onChange: value => setAttributes({
              pagination_color: value
            }),
            colors: THEME_COLORS,
            fallbackValue: colorFallbacks.pagination_color
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
          className: "videopack-color-flex-item",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(CompactColorPicker_CompactColorPicker, {
            label: (0,external_wp_i18n_namespaceObject.__)('Background', 'video-embed-thumbnail-generator'),
            value: pagination_background_color,
            onChange: value => setAttributes({
              pagination_background_color: value
            }),
            colors: THEME_COLORS,
            fallbackValue: colorFallbacks.pagination_background_color
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
          className: "videopack-color-flex-item",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(CompactColorPicker_CompactColorPicker, {
            label: (0,external_wp_i18n_namespaceObject.__)('Active Background', 'video-embed-thumbnail-generator'),
            value: pagination_active_bg_color,
            onChange: value => setAttributes({
              pagination_active_bg_color: value
            }),
            colors: THEME_COLORS,
            fallbackValue: colorFallbacks.pagination_active_bg_color
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
          className: "videopack-color-flex-item",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(CompactColorPicker_CompactColorPicker, {
            label: (0,external_wp_i18n_namespaceObject.__)('Active Text', 'video-embed-thumbnail-generator'),
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
  hasPaginationBlock = true
}) {
  const {
    excludedVideos
  } = queryData;
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.PanelBody, {
      title: showGalleryOptions ? (0,external_wp_i18n_namespaceObject.__)('Query Settings', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_namespaceObject.__)('List Settings', 'video-embed-thumbnail-generator'),
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(CollectionQuerySettings, {
        attributes: attributes,
        setAttributes: setAttributes,
        queryData: queryData,
        options: options,
        showManualSource: showManualSource,
        isSiteEditor: isSiteEditor,
        hasPaginationBlock: hasPaginationBlock
      }), excludedVideos && excludedVideos.length > 0 && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(CollectionFilterSettings, {
        attributes: attributes,
        setAttributes: setAttributes,
        queryData: queryData
      })]
    }), showLayoutSettings && showGalleryOptions && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.PanelBody, {
      title: (0,external_wp_i18n_namespaceObject.__)('Layout Settings', 'video-embed-thumbnail-generator'),
      initialOpen: showGalleryOptions,
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(CollectionLayoutSettings, {
        attributes: attributes,
        setAttributes: setAttributes,
        options: options
      })
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.PanelBody, {
      title: (0,external_wp_i18n_namespaceObject.__)('Colors', 'video-embed-thumbnail-generator'),
      initialOpen: true,
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(CollectionColorSettings, {
        attributes: attributes,
        setAttributes: setAttributes,
        options: options,
        blockType: blockType,
        showPaginationSettings: showPaginationSettings
      })
    })]
  });
}
;// ./src/utils/context.js
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
  if (attrKey === 'skin') {
    return attributes.skin || context['videopack/skin'] || globalOptions.skin || globalDefaults.skin || 'vjs-theme-videopack';
  }
  const val = attributes[attrKey] ?? context[`videopack/${attrKey}`];
  if (val !== undefined && val !== null) {
    return val;
  }
  const fallback = globalOptions[attrKey] ?? globalDefaults[attrKey];
  if (attrKey === 'gallery_per_page') {
    console.log(`getEffectiveValue fallback for ${attrKey}:`, fallback);
  }
  return fallback;
};
;// ./src/utils/VideopackContext.js
/* unused harmony import specifier */ var useContext;

const VideopackContext = (0,external_wp_element_namespaceObject.createContext)({
  gallery_pagination: undefined,
  gallery_per_page: undefined,
  totalPages: undefined,
  currentPage: undefined
});
const VideopackProvider = VideopackContext.Provider;
const useVideopackContext = () => useContext(VideopackContext);
/* harmony default export */ const utils_VideopackContext = ((/* unused pure expression or super */ null && (VideopackContext)));
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
  }, [['videopack/play-button', {}], options?.overlay_title !== false ? ['videopack/video-title', {}] : null].filter(Boolean)]];
  const template = [['videopack/video-loop', {}, loopChildren]];
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
;// ./src/blocks/collection/edit.js













const ALLOWED_BLOCKS = ['videopack/video-loop', 'videopack/pagination'];
function Edit({
  attributes,
  setAttributes,
  clientId,
  context
}) {
  const [options, setOptions] = (0,external_wp_element_namespaceObject.useState)();
  const {
    layout = 'grid',
    columns = 3,
    currentPage = 1
  } = attributes;

  // Resolve Effective Values for design and pagination (these follow global settings)
  const effectiveValues = (0,external_wp_element_namespaceObject.useMemo)(() => {
    const keys = ['skin', 'align', 'gallery_pagination', 'gallery_per_page', 'enable_collection_video_limit', 'collection_video_limit', 'title_color', 'title_background_color', 'play_button_color', 'play_button_secondary_color', 'control_bar_bg_color', 'control_bar_color', 'views', 'overlay_title'];
    const resolved = {};
    keys.forEach(key => {
      resolved[key] = getEffectiveValue(key, attributes, context);
    });
    return resolved;
  }, [attributes, context]);
  const {
    hasPaginationBlock,
    isNewlyInserted
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getBlocks,
      getBlock
    } = select('core/block-editor');
    const blocks = getBlocks(clientId) || [];
    const block = getBlock(clientId);
    return {
      hasPaginationBlock: blocks.some(b => b.name === 'videopack/pagination'),
      isNewlyInserted: block && !block.attributes.gallery_id && !block.attributes.gallery_category && !block.attributes.gallery_tag && !block.attributes.gallery_include
    };
  }, [clientId]);
  const previewPostId = (0,external_wp_data_namespaceObject.useSelect)(select => select('core/editor').getCurrentPostId(), []);
  const queryParams = {
    ...attributes,
    gallery_pagination: hasPaginationBlock,
    gallery_per_page: hasPaginationBlock ? effectiveValues.gallery_per_page || 12 : effectiveValues.enable_collection_video_limit ? effectiveValues.collection_video_limit || 12 : -1,
    page_number: currentPage || 1
  };
  // We fetch query data to power the live preview template and pagination info
  const queryData = useVideoQuery(queryParams, previewPostId);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    getSettings().then(response => {
      setOptions(response);
    });
  }, []);

  // Sync structural state to attributes for persistence ONLY if needed for frontend.
  // We handle gallery_per_page here because it's a user setting that should persist.
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    if (attributes.gallery_per_page !== effectiveValues.gallery_per_page) {
      setAttributes({
        gallery_per_page: effectiveValues.gallery_per_page
      });
    }
  }, [effectiveValues.gallery_per_page, attributes.gallery_per_page, setAttributes]);

  // Resolve blockGap value for use in internal grid spacing
  const resolvedBlockGap = (0,external_wp_element_namespaceObject.useMemo)(() => {
    const gap = attributes.style?.spacing?.blockGap;
    if (!gap) return undefined;

    // Handle Gutenberg preset variables: var:preset|spacing|X -> var(--wp--preset--spacing--X)
    if (typeof gap === 'string' && gap.startsWith('var:preset|spacing|')) {
      return gap.replace('var:preset|spacing|', 'var(--wp--preset--spacing--') + ')';
    }
    return gap;
  }, [attributes.style?.spacing?.blockGap]);

  // Dynamic Template based on global settings (only used for new blocks)
  const dynamicTemplate = (0,external_wp_element_namespaceObject.useMemo)(() => {
    if (layout === 'list') {
      return getListTemplate(options);
    }
    return getGridTemplate(options);
  }, [layout, options]);
  const blockProps = (0,external_wp_blockEditor_namespaceObject.useBlockProps)({
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
  const collectionClasses = ['videopack-collection', 'videopack-wrapper', `layout-${layout}`, `columns-${columns}`,
  // If no explicit align is set, apply the effective (global) align class
  !attributes.align && effectiveValues.align ? `align${effectiveValues.align}` : '', effectiveValues.title_color ? 'videopack-has-title-color' : '', effectiveValues.title_background_color ? 'videopack-has-title-background-color' : '', effectiveValues.play_button_color ? 'videopack-has-play-button-color' : '', effectiveValues.play_button_secondary_color ? 'videopack-has-play-button-secondary-color' : '', effectiveValues.control_bar_bg_color ? 'videopack-has-control-bar-bg-color' : '', effectiveValues.control_bar_color ? 'videopack-has-control-bar-color' : ''].filter(Boolean).join(' ');
  const videopackContextValue = {
    gallery_pagination: hasPaginationBlock,
    gallery_per_page: effectiveValues.gallery_per_page,
    totalPages: queryData.maxNumPages,
    currentPage: currentPage
  };
  const providedContext = {
    ...context,
    'videopack/layout': layout,
    'videopack/columns': columns,
    'videopack/skin': effectiveValues.skin,
    'videopack/gallery_source': attributes.gallery_source,
    'videopack/gallery_id': attributes.gallery_id,
    'videopack/gallery_category': attributes.gallery_category,
    'videopack/gallery_tag': attributes.gallery_tag,
    'videopack/gallery_orderby': attributes.gallery_orderby,
    'videopack/gallery_order': attributes.gallery_order,
    'videopack/gallery_include': attributes.gallery_include,
    'videopack/gallery_exclude': attributes.gallery_exclude,
    'videopack/gallery_pagination': hasPaginationBlock,
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
  };

  // If options haven't loaded yet for a newly inserted block, don't render InnerBlocks 
  // to prevent the wrong template from being applied.
  if (!options && isNewlyInserted) {
    return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      ...blockProps,
      className: (blockProps.className || '') + ' ' + collectionClasses,
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
        className: "videopack-collection-placeholder",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Spinner, {})
      })
    });
  }
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_blockEditor_namespaceObject.InspectorControls, {
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.PanelBody, {
        title: (0,external_wp_i18n_namespaceObject.__)('Layout Settings', 'video-embed-thumbnail-generator'),
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.SelectControl, {
          label: (0,external_wp_i18n_namespaceObject.__)('Layout', 'video-embed-thumbnail-generator'),
          value: layout,
          options: [{
            label: (0,external_wp_i18n_namespaceObject.__)('Grid', 'video-embed-thumbnail-generator'),
            value: 'grid'
          }, {
            label: (0,external_wp_i18n_namespaceObject.__)('List', 'video-embed-thumbnail-generator'),
            value: 'list'
          }],
          onChange: value => setAttributes({
            layout: value
          })
        }), layout === 'grid' && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.RangeControl, {
          label: (0,external_wp_i18n_namespaceObject.__)('Columns', 'video-embed-thumbnail-generator'),
          value: columns,
          onChange: value => setAttributes({
            columns: value
          }),
          min: 1,
          max: 6
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(CollectionSettingsPanel, {
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
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      ...blockProps,
      className: (blockProps.className || '') + ' ' + collectionClasses,
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.BlockContextProvider, {
        value: providedContext,
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(VideopackProvider, {
          value: videopackContextValue,
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.InnerBlocks, {
            allowedBlocks: ALLOWED_BLOCKS,
            template: dynamicTemplate
          })
        })
      })
    })]
  });
}
;// ./src/blocks/collection/save.js


function save_save() {
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.InnerBlocks.Content, {});
}
;// ./src/blocks/collection/block.json
const block_namespaceObject = /*#__PURE__*/JSON.parse('{"UU":"videopack/collection"}');
;// ./src/blocks/collection/index.js





(0,external_wp_blocks_namespaceObject.registerBlockType)(block_namespaceObject.UU, {
  edit: Edit,
  save: save_save
});
(0,external_wp_blocks_namespaceObject.registerBlockVariation)(block_namespaceObject.UU, [{
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
/******/ })()
;