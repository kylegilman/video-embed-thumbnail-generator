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

// NAMESPACE OBJECT: ./src/assets/icon.js
var icon_namespaceObject = {};
__webpack_require__.r(icon_namespaceObject);
__webpack_require__.d(icon_namespaceObject, {
  bluesky: () => (bluesky),
  close: () => (icon_close),
  copyLink: () => (copyLink),
  download: () => (download),
  email: () => (email),
  embed: () => (icon_embed),
  facebook: () => (facebook),
  insertImage: () => (insertImage),
  pause: () => (pause),
  play: () => (play),
  playOutline: () => (playOutline),
  reddit: () => (reddit),
  save: () => (save),
  share: () => (share),
  shareAlt1: () => (shareAlt1),
  shareAlt2: () => (shareAlt2),
  shareAlt3: () => (shareAlt3),
  sortAscending: () => (sortAscending),
  sortDescending: () => (sortDescending),
  threads: () => (threads),
  videopack: () => (videopack),
  videopackCaption: () => (videopackCaption),
  videopackCollection: () => (videopackCollection),
  videopackDuration: () => (videopackDuration),
  videopackGallery: () => (videopackGallery),
  videopackList: () => (videopackList),
  videopackLoop: () => (videopackLoop),
  videopackPagination: () => (videopackPagination),
  videopackPlayButton: () => (videopackPlayButton),
  videopackPlayer: () => (videopackPlayer),
  videopackThumbnail: () => (videopackThumbnail),
  videopackTitle: () => (videopackTitle),
  videopackVideo: () => (videopackVideo),
  videopackViewCount: () => (videopackViewCount),
  videopackWatermark: () => (videopackWatermark),
  volumeDown: () => (volumeDown),
  volumeUp: () => (volumeUp)
});

// NAMESPACE OBJECT: ./src/utils/video-capture.js
var video_capture_namespaceObject = {};
__webpack_require__.r(video_capture_namespaceObject);
__webpack_require__.d(video_capture_namespaceObject, {
  calculateTimecodes: () => (calculateTimecodes),
  captureVideoFrame: () => (captureVideoFrame),
  checkCanvasTaint: () => (checkCanvasTaint),
  drawWatermark: () => (drawWatermark),
  getVideoMetadata: () => (getVideoMetadata)
});

// NAMESPACE OBJECT: ./src/utils/utils.js
var utils_namespaceObject = {};
__webpack_require__.r(utils_namespaceObject);
__webpack_require__.d(utils_namespaceObject, {
  assignFormat: () => (assignFormat),
  clearQueue: () => (clearQueue),
  clearUrlCache: () => (clearUrlCache),
  createJob: () => (createJob),
  createThumbnailFromCanvas: () => (createThumbnailFromCanvas),
  deleteBrowserEncoderAssets: () => (deleteBrowserEncoderAssets),
  deleteFile: () => (deleteFile),
  deleteFormat: () => (deleteFormat),
  deleteJob: () => (deleteJob),
  downloadBrowserEncoderAssets: () => (downloadBrowserEncoderAssets),
  enqueueJob: () => (enqueueJob),
  generateShortcode: () => (generateShortcode),
  generateThumbnail: () => (generateThumbnail),
  getBatchProgress: () => (getBatchProgress),
  getFreemiusPage: () => (getFreemiusPage),
  getJobStatus: () => (getJobStatus),
  getNetworkSettings: () => (getNetworkSettings),
  getPresets: () => (getPresets),
  getQueue: () => (getQueue),
  getSettings: () => (getSettings),
  getUsersWithCapability: () => (getUsersWithCapability),
  getVideoFormats: () => (getVideoFormats),
  getVideoGallery: () => (getVideoGallery),
  getVideoSources: () => (getVideoSources),
  listJobs: () => (listJobs),
  normalizeOptions: () => (normalizeOptions),
  parseShortcode: () => (parseShortcode),
  removeJob: () => (removeJob),
  resetJob: () => (resetJob),
  resetNetworkSettings: () => (resetNetworkSettings),
  resetVideopackSettings: () => (resetVideopackSettings),
  retryJob: () => (retryJob),
  saveAllThumbnails: () => (saveAllThumbnails),
  saveNetworkSettings: () => (saveNetworkSettings),
  saveWPSettings: () => (saveWPSettings),
  setPosterImage: () => (setPosterImage),
  startBatchProcess: () => (startBatchProcess),
  stripHtml: () => (stripHtml),
  testEncodeCommand: () => (testEncodeCommand),
  toggleQueue: () => (toggleQueue),
  unassignFormat: () => (unassignFormat),
  uploadThumbnail: () => (uploadThumbnail)
});

;// external ["wp","i18n"]
const external_wp_i18n_namespaceObject = window["wp"]["i18n"];
;// external ["wp","element"]
const external_wp_element_namespaceObject = window["wp"]["element"];
;// external ["wp","data"]
const external_wp_data_namespaceObject = window["wp"]["data"];
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
;// external ["wp","hooks"]
const external_wp_hooks_namespaceObject = window["wp"]["hooks"];
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
(0,external_wp_hooks_namespaceObject.applyFilters)('videopack.contextKeys', DEFAULT_CONTEXT_KEYS);

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
  const initial = (0,external_wp_element_namespaceObject.useMemo)(() => {
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
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
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
  return (0,external_wp_element_namespaceObject.useMemo)(() => {
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
;// external "ReactJSXRuntime"
const external_ReactJSXRuntime_namespaceObject = window["ReactJSXRuntime"];
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
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("nav", {
    className: "videopack-pagination",
    "aria-label": (0,external_wp_i18n_namespaceObject.__)('Pagination', 'video-embed-thumbnail-generator'),
    style: style,
    children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("ul", {
      className: "videopack-pagination-list",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("li", {
        className: "videopack-pagination-item",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("button", {
          className: `videopack-pagination-button prev page-numbers ${current <= 1 ? 'is-hidden videopack-hidden' : ''}`,
          onClick: () => current > 1 && onChange(current - 1),
          "aria-label": (0,external_wp_i18n_namespaceObject.__)('Previous Page', 'video-embed-thumbnail-generator'),
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
            className: "videopack-pagination-arrow",
            children: "<"
          })
        })
      }), pages.map((page, index) => /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("li", {
        className: "videopack-pagination-item",
        children: page === '...' ? /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
          className: "page-numbers dots",
          children: page
        }) : /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("button", {
          className: `videopack-pagination-button page-numbers ${page === current ? 'is-active current' : ''}`,
          onClick: () => typeof page === 'number' && onChange(page),
          "aria-current": page === current ? 'page' : undefined,
          children: page
        })
      }, index)), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("li", {
        className: "videopack-pagination-item",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("button", {
          className: `videopack-pagination-button next page-numbers ${current >= total ? 'is-hidden videopack-hidden' : ''}`,
          onClick: () => current < total && onChange(current + 1),
          "aria-label": (0,external_wp_i18n_namespaceObject.__)('Next Page', 'video-embed-thumbnail-generator'),
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
            className: "videopack-pagination-arrow",
            children: ">"
          })
        })
      })]
    })
  });
}
;// external ["wp","components"]
const external_wp_components_namespaceObject = window["wp"]["components"];
;// ../src/icons.json
const icons_namespaceObject = /*#__PURE__*/JSON.parse('{"download":{"viewBox":"0 0 24 24","paths":[{"d":"M18 11.3l-1-1.1-4 4V3h-1.5v11.3L7 10.2l-1 1.1 6.2 5.8 5.8-5.8zm.5 3.7v3.5h-13V15H4v5h16v-5h-1.5z"}]},"share":{"viewBox":"0 0 24 24","paths":[{"d":"M9 11.8l6.1-4.5c.1.4.4.7.9.7h2c.6 0 1-.4 1-1V5c0-.6-.4-1-1-1h-2c-.6 0-1 .4-1 1v.4l-6.4 4.8c-.2-.1-.4-.2-.6-.2H6c-.6 0-1 .4-1 1v2c0 .6.4 1 1 1h2c.2 0 .4-.1.6-.2l6.4 4.8v.4c0 .6.4 1 1 1h2c.6 0 1-.4 1-1v-2c0-.6-.4-1-1-1h-2c-.5 0-.8.3-.9.7L9 12.2v-.4z"}]},"close":{"viewBox":"0 0 24 24","paths":[{"d":"m13.06 12 6.47-6.47-1.06-1.06L12 10.94 5.53 4.47 4.47 5.53 10.94 12l-6.47 6.47 1.06 1.06L12 13.06l6.47 6.47 1.06-1.06L13.06 12Z"}]},"external":{"viewBox":"0 0 1080 1080","paths":[{"d":"M994.56 986.8H68.33V169.45h463.11v70H138.33V916.8h786.23V623.33h70z"},{"d":"M549.07 598.54h-70v-3.49c-.02-63.64-.04-142.85 49.5-207.82 56.32-73.87 162.4-109.79 324.25-109.79h.24c111.9.02 128.37-.04 135.4-.06 1.82 0 3-.01 5-.01v70c-1.89 0-3.01 0-4.74.01-7.07.03-23.63.09-135.67.06h-.22c-75.54 0-137.44 8.45-183.99 25.11-37.98 13.59-65.66 32.28-84.6 57.13-35.2 46.17-35.18 109.49-35.17 165.36v3.51Z"},{"d":"m873.68 499.79-52.2-46.63L946.4 313.31 823.14 183.75l50.72-48.25 167.74 176.32z"}]},"iosShare":{"viewBox":"0 0 1080 1080","paths":[{"d":"M760.96 270.67h170.07V979H126.25V270.67H312.3m226.28 367.29V89.31m-149.87 152 149.87-152 153.17 152","fill":"none","stroke":"currentColor","stroke-miterlimit":"10","stroke-width":"70"}]},"curveShare":{"viewBox":"0 0 512 512","paths":[{"d":"M512 241.7 273.643 3.343v156.152c-71.41 3.744-138.015 33.337-188.958 84.28C30.075 298.384 0 370.991 0 448.222v60.436l29.069-52.985c45.354-82.671 132.173-134.027 226.573-134.027 5.986 0 12.004.212 18.001.632v157.779zm-256.358 48.966c-84.543 0-163.661 36.792-217.939 98.885 26.634-114.177 129.256-199.483 251.429-199.483h15.489V78.131l163.568 163.568-163.568 163.568V294.531l-13.585-1.683a289 289 0 0 0-35.394-2.182"}]},"embed":{"viewBox":"0 0 24 24","paths":[{"d":"M20.8 10.7l-4.3-4.3-1.1 1.1 4.3 4.3c.1.1.1.3 0 .4l-4.3 4.3 1.1 1.1 4.3-4.3c.7-.8.7-1.9 0-2.6zM4.2 11.8l4.3-4.3-1-1-4.3 4.3c-.7.7-.7 1.8 0 2.5l4.3 4.3 1.1-1.1-4.3-4.3c-.2-.1-.2-.3-.1-.4z"}]},"eye":{"viewBox":"0 0 24 24","paths":[{"d":"M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"}]},"play":{"viewBox":"0 0 24 24","paths":[{"d":"M8 5v14l11-7z"}]},"playOutline":{"viewBox":"0 0 24 24","paths":[{"d":"M8 5v14l11-7z","fill":"none","stroke":"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}]},"copyLink":{"viewBox":"0 0 16 16","paths":[{"d":"M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z"},{"d":"M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z"}]},"bluesky":{"viewBox":"0 0 16 16","paths":[{"d":"M3.468 1.948C5.303 3.325 7.276 6.118 8 7.616c.725-1.498 2.698-4.29 4.532-5.668C13.855.955 16 .186 16 2.632c0 .489-.28 4.105-.444 4.692-.572 2.04-2.653 2.561-4.504 2.246 3.236.551 4.06 2.375 2.281 4.2-3.376 3.464-4.852-.87-5.23-1.98-.07-.204-.103-.3-.103-.218 0-.081-.033.014-.102.218-.379 1.11-1.855 5.444-5.231 1.98-1.778-1.825-.955-3.65 2.28-4.2-1.85.315-3.932-.205-4.503-2.246C.28 6.737 0 3.12 0 2.632 0 .186 2.145.955 3.468 1.948"}]},"threads":{"viewBox":"0 0 16 16","paths":[{"d":"M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948s.928 1.509 1.005 2.644q.492.207.905.484c1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.2 6.2 0 0 0-1.528-.161"}]},"facebook":{"viewBox":"0 0 16 16","paths":[{"d":"M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.8V16c3.824-.604 6.75-3.934 6.75-7.951z"}]},"reddit":{"viewBox":"0 0 16 16","paths":[{"d":"M6.167 8a.83.83 0 0 0-.83.83c0 .459.372.84.83.831a.831.831 0 0 0 0-1.661m1.843 3.647c.315 0 1.403-.038 1.976-.611a.23.23 0 0 0 0-.306.213.213 0 0 0-.306 0c-.353.363-1.126.487-1.67.487-.545 0-1.308-.124-1.671-.487a.213.213 0 0 0-.306 0 .213.213 0 0 0 0 .306c.564.563 1.652.61 1.977.61zm.992-2.807c0 .458.373.83.831.83s.83-.381.83-.83a.831.831 0 0 0-1.66 0z"},{"d":"M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.828-1.165c-.315 0-.602.124-.812.325-.801-.573-1.9-.945-3.121-.993l.534-2.501 1.738.372a.83.83 0 1 0 .83-.869.83.83 0 0 0-.744.468l-1.938-.41a.2.2 0 0 0-.153.028.2.2 0 0 0-.086.134l-.592 2.788c-1.24.038-2.358.41-3.17.992-.21-.2-.496-.324-.81-.324a1.163 1.163 0 0 0-.478 2.224q-.03.17-.029.353c0 1.795 2.091 3.256 4.669 3.256s4.668-1.451 4.668-3.256c0-.114-.01-.238-.029-.353.401-.181.688-.592.688-1.069 0-.65-.525-1.165-1.165-1.165"}]},"email":{"viewBox":"0 0 16 16","paths":[{"d":"M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.976-5.64-3.384L8 9.83l-1.326-.795-5.64 3.384A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.641ZM1 11.105l4.708-2.897L1 5.383v5.722Z"}]}}');
;// ./src/assets/icon.js


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
const videopackCaption = /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    d: "M43.63 341.01c-12.65 0-23-9.2-23-22.61v-.77c0-13.03 9.97-22.61 23-22.61s23.38 9.2 23.38 22.61v.77c0 13.42-9.97 22.61-23.38 22.61m69.37 0c-12.65 0-23-9.2-23-22.61v-.77c0-13.03 9.97-22.61 23-22.61s23.38 9.2 23.38 22.61v.77c0 13.42-9.97 22.61-23.38 22.61m69.37 0c-12.65 0-23-9.2-23-22.61v-.77c0-13.03 9.97-22.61 23-22.61s23.38 9.2 23.38 22.61v.77c0 13.42-9.97 22.61-23.38 22.61",
    style: {
      fill: '#cd0000'
    }
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("circle", {
    cx: 198.31,
    cy: 159.72,
    r: 69.82,
    style: {
      fill: '#fff'
    }
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("circle", {
    cx: 198.31,
    cy: 159.72,
    r: 69.82,
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: '11.47px'
    }
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M169.53 198.78v-17.51l37.74-21.96-37.74-21.26v-18.16l68.27 39.45-67.74 39.44"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m169.53 138.05 37.74 21.26-37.74 21.96"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 19
    },
    d: "M14.4 55.65h372.22V264.9H14.4z"
  })]
});
const videopackCollection = /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 14
    },
    d: "M12.01 84.61h170.53v93.84H12.01zm210.09 0h170.53v93.84H222.1zM12.01 221.62h170.53v93.84H12.01zm210.09 0h170.53v93.84H222.1z"
  })
});
const videopackDuration = /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    d: "m67.87 129.5-8.65 32.21h26.11l8.65-32.21h15.26l-8.65 32.21h17.29v12.71H97.2L90.59 199h18.99v12.71H87.2l-8.31 31.36H63.63l8.31-31.36H45.83l-8.31 31.36H22.26l8.31-31.36H12.43V199h21.53l6.61-24.58H20.74v-12.71h23.22l8.65-32.21zm-18.65 69.51h26.11l6.61-24.58H55.83zm94.08-5.09c-5.59 0-10.17-4.07-10.17-10v-.34c0-5.76 4.41-10 10.17-10s10.34 4.07 10.34 10v.34c0 5.93-4.41 10-10.34 10m0 50.86c-5.59 0-10.17-4.07-10.17-10v-.34c0-5.76 4.41-10 10.17-10s10.34 4.07 10.34 10v.34c0 5.93-4.41 10-10.34 10m81.03-115.28-8.65 32.21h26.11l8.65-32.21h15.26l-8.65 32.21h17.29v12.71h-20.68L247.05 199h18.99v12.71h-22.38l-8.31 31.36h-15.26l8.31-31.36h-26.11l-8.31 31.36h-15.26l8.31-31.36h-18.14V199h21.53l6.61-24.58H177.2v-12.71h23.22l8.65-32.21zm-18.65 69.51h26.11l6.61-24.58h-26.11zm135.96-69.51-8.65 32.21h26.11l8.65-32.21h15.26l-8.65 32.21h17.29v12.71h-20.68L364.36 199h18.99v12.71h-22.38l-8.31 31.36H337.4l8.31-31.36H319.6l-8.31 31.36h-15.26l8.31-31.36H286.2V199h21.53l6.61-24.58h-19.83v-12.71h23.22l8.65-32.21zm-18.65 69.51h26.11l6.61-24.58H329.6z",
    style: {
      fill: '#cd0000'
    }
  })
});
const videopackGallery = /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 14
    },
    d: "M8.14 84.54h170.53v93.84H8.14z"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("g", {
    transform: "rotate(-5.65 92.234 131.62)",
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("circle", {
      cx: 92.16,
      cy: 131.51,
      r: 34.87,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("circle", {
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
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M77.79 151.02v-8.75l18.85-10.97-18.85-10.61v-9.07l34.1 19.7-33.84 19.7"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m77.79 120.69 18.85 10.61-18.85 10.97"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 14
    },
    d: "M220.87 84.54H391.4v93.84H220.87z"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("g", {
    transform: "rotate(-5.65 309.192 131.66)",
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("circle", {
      cx: 308.89,
      cy: 131.51,
      r: 34.87,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("circle", {
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
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M294.51 151.02v-8.75l18.85-10.97-18.85-10.61v-9.07l34.1 19.7-33.83 19.7"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m294.51 120.69 18.85 10.61-18.85 10.97"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 14
    },
    d: "M8.14 221.62h170.53v93.84H8.14z"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("g", {
    transform: "rotate(-5.65 92.268 268.846)",
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("circle", {
      cx: 92.16,
      cy: 268.58,
      r: 34.87,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("circle", {
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
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M77.79 288.09v-8.75l18.85-10.96-18.85-10.62v-9.07l34.1 19.7-33.84 19.7"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m77.79 257.76 18.85 10.62-18.85 10.96"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 14
    },
    d: "M220.87 221.62H391.4v93.84H220.87z"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("g", {
    transform: "rotate(-5.65 309.13 268.78)",
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("circle", {
      cx: 308.89,
      cy: 268.58,
      r: 34.87,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("circle", {
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
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M294.51 288.09v-8.75l18.85-10.96-18.85-10.62v-9.07l34.1 19.7-33.83 19.7"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m294.51 257.76 18.85 10.62-18.85 10.96"
  })]
});
const videopackList = /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 14
    },
    d: "M111.79 6.56h185.1v101.85h-185.1z"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("g", {
    transform: "rotate(-5.65 205.384 57.57)",
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("circle", {
      cx: 205.16,
      cy: 57.53,
      r: 37.85,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("circle", {
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
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M189.56 78.71v-9.49l20.46-11.91-20.46-11.52v-9.84l37 21.38-36.72 21.38"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m189.56 45.79 20.46 11.52-20.46 11.91"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 14
    },
    d: "M111.79 148.88h185.1v101.85h-185.1z"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("g", {
    transform: "rotate(-5.65 205.365 199.974)",
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("circle", {
      cx: 205.16,
      cy: 199.85,
      r: 37.85,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("circle", {
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
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M189.56 221.03v-9.5l20.46-11.9-20.46-11.52v-9.85l37 21.39-36.72 21.38"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m189.56 188.11 20.46 11.52-20.46 11.9"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 14
    },
    d: "M111.79 290.2h185.1v101.85h-185.1z"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("g", {
    transform: "rotate(-5.65 205.392 341.466)",
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("circle", {
      cx: 205.16,
      cy: 341.17,
      r: 37.85,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("circle", {
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
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M189.56 362.35v-9.5l20.46-11.9-20.46-11.52v-9.85l37 21.38-36.72 21.39"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m189.56 329.43 20.46 11.52-20.46 11.9"
  })]
});
const videopackLoop = /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    d: "M352.41 199.29c-.01 35.29-28.64 63.89-63.93 63.88-29.13-.01-54.56-19.72-61.85-47.92l-.17-.73-.24-.71-15.43-45.44-.1.05c-17.16-54.81-75.5-85.33-130.31-68.17-43.31 13.56-72.82 53.64-72.92 99.02-.01 57.4 46.51 103.95 103.91 103.97 13 0 25.88-2.43 37.98-7.18l-14.62-37.27c-32.86 12.87-69.94-3.33-82.81-36.19s3.33-69.94 36.19-82.81 69.94 3.33 82.81 36.19c.94 2.39 1.73 4.84 2.37 7.33l.24-.07 14.5 42.78c14.88 55.47 71.91 88.38 127.38 73.5 45.38-12.17 76.96-53.25 77.05-100.24.01-57.4-46.51-103.95-103.92-103.96-12.97 0-25.82 2.42-37.9 7.15l14.59 37.29c32.87-12.85 69.94 3.39 82.78 36.26 2.9 7.41 4.38 15.3 4.38 23.26",
    style: {
      fill: '#cd0000'
    }
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M90.65 230.42v-13.6l29.3-17.05-29.3-16.49v-14.1l52.99 30.62-52.58 30.62"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m90.65 183.28 29.3 16.49-29.3 17.05"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M266.39 230.42v-13.6l29.29-17.05-29.29-16.49v-14.1l52.99 30.62-52.58 30.62"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m266.39 183.28 29.29 16.49-29.29 17.05"
  })]
});
const videopackPagination = /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("rect", {
    x: 4,
    y: 127.95,
    width: 117.18,
    height: 117.18,
    rx: 7,
    ry: 7,
    style: {
      fill: '#cd0000'
    }
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    d: "M69.1 210.32h-6.2v-38.03c-2.51 1.67-6.39 2.51-11.64 2.51v-4.88c7.59 0 11.94-2.92 13.06-8.77h4.78v49.18Z",
    style: {
      fill: '#fff'
    }
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("rect", {
    x: 145.36,
    y: 131.95,
    width: 109.18,
    height: 109.18,
    rx: 3,
    ry: 3,
    style: {
      fill: '#fff'
    }
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    d: "M250.54 135.95v101.18H149.36V135.95zm1-8H148.36c-3.87 0-7 3.13-7 7v103.18c0 3.87 3.13 7 7 7h103.18c3.87 0 7-3.13 7-7V134.95c0-3.87-3.13-7-7-7",
    style: {
      fill: '#cd0000'
    }
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    d: "M215.24 210.32h-32.03c0-2.95.91-5.76 2.74-8.44s5.17-5.99 10.04-9.91 8.21-7.06 10.01-9.4 2.7-5 2.7-7.97c0-2.66-.77-4.75-2.31-6.28s-3.71-2.29-6.5-2.29c-2.42 0-4.49.77-6.2 2.31s-2.68 3.8-2.9 6.79h-6.43c.35-4.24 1.92-7.64 4.7-10.17 2.78-2.54 6.44-3.81 10.97-3.81 4.82 0 8.53 1.29 11.15 3.88 2.62 2.58 3.92 5.82 3.92 9.71 0 3.52-.97 6.62-2.9 9.32-1.94 2.69-5.78 6.44-11.53 11.23q-8.625 7.185-8.79 9.3h23.35v5.74Z",
    style: {
      fill: '#cd0000'
    }
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("rect", {
    x: 282.73,
    y: 131.95,
    width: 109.18,
    height: 109.18,
    rx: 3,
    ry: 3,
    style: {
      fill: '#fff'
    }
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    d: "M387.91 135.95v101.18H286.73V135.95zm1-8H285.73c-3.87 0-7 3.13-7 7v103.18c0 3.87 3.13 7 7 7h103.18c3.87 0 7-3.13 7-7V134.95c0-3.87-3.13-7-7-7",
    style: {
      fill: '#cd0000'
    }
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    d: "m325.77 171.83 4.27-4.39 26.58 22.19-26.58 22.19-4.27-4.35 21.55-17.76z",
    style: {
      fill: '#cd0000'
    }
  })]
});
const videopackPlayButton = /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("g", {
    transform: "rotate(-45 205.37 193.523)",
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("circle", {
      cx: 205.37,
      cy: 193.52,
      r: 87.51,
      style: {
        fill: '#fff'
      }
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("circle", {
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
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M169.29 242.49v-21.96l47.31-27.52-47.31-26.64V143.6l85.58 49.45-84.91 49.44"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m169.29 166.37 47.31 26.64-47.31 27.52"
  })]
});
const videopackPlayer = /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("circle", {
    cx: 197.8,
    cy: 200.99,
    r: 69.82,
    style: {
      fill: '#fff'
    }
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("circle", {
    cx: 197.8,
    cy: 200.99,
    r: 69.82,
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: '11.47px'
    }
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M169.02 240.06v-17.52l37.74-21.96-37.74-21.25v-18.16l68.27 39.44-67.74 39.45"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m169.02 179.33 37.74 21.25-37.74 21.96"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: 19
    },
    d: "M13.89 96.92h372.22v209.25H13.89z"
  })]
});
const videopackThumbnail = /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M170.16 207.08v-19.61l42.27-24.6-42.27-23.8v-20.34l76.46 44.18-75.86 44.17"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m170.16 139.07 42.27 23.8-42.27 24.6M46.7 364.45c-6.58 0-10.96-4.39-10.96-10.96v-52.62l89.9-65.78 65.78 41.66c6.58 4.39 15.35 4.39 19.73-2.19l76.74-74.55 76.74 74.55v78.94c0 6.58-4.39 10.96-10.96 10.96"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    d: "M353.83 2.67H46.85c-24.12 0-43.86 19.74-43.86 43.86v306.98c0 24.12 19.73 43.85 43.85 43.85h306.98c24.12 0 43.85-19.73 43.85-43.85V46.53c0-24.12-19.73-43.85-43.85-43.85Zm10.96 350.83c0 6.58-4.39 10.96-10.96 10.96H46.85c-6.58 0-10.96-4.39-10.96-10.96v-52.62l89.9-65.78 65.78 41.66c6.58 4.39 15.35 4.39 19.73-2.19l76.74-74.55 76.74 74.55v78.94Zm-85.63-188.64c-.79.64-1.49 1.39-2.08 2.27l-78.94 76.74-63.59-43.85c-.57-.38-1.14-.72-1.71-1.03a77 77 0 0 1-8.68-35.6c0-42.74 34.77-77.51 77.51-77.51s77.51 34.77 77.51 77.51c0 .49-.03.98-.04 1.48Zm85.63 65.85-65.68-63.49c.05-1.28.08-2.56.08-3.84 0-53.77-43.74-97.51-97.51-97.51s-97.51 43.74-97.51 97.51c0 14.16 3.04 27.63 8.49 39.78l-74.58 53.86V46.53c.05-5.27 2.19-10.96 8.77-10.96h306.98c6.58 0 10.96 4.39 10.96 10.96v184.19Z",
    style: {
      fill: '#cd0000'
    }
  })]
});
const videopackTitle = /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M1.92 52.81h396.16v285.84H1.92z"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    d: "M295.68 87.22v44.5h-72.27V311.4h-53.54V131.72H97.6v-44.5z",
    style: {
      fill: '#fff'
    }
  })]
});
const videopackVideo = /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("circle", {
    cx: 199.66,
    cy: 198.62,
    r: 47.96,
    style: {
      fill: '#fff'
    }
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("circle", {
    cx: 199.66,
    cy: 198.62,
    r: 47.96,
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: '7.88px'
    }
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M179.89 225.45v-12.03l25.92-15.09-25.92-14.59v-12.48l46.9 27.1-46.54 27.09"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m179.89 183.74 25.92 14.59-25.92 15.09"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: '13.05px'
    },
    d: "M73.32 127.13h255.7v143.75H73.32z"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: 'none',
      stroke: '#cd0000',
      strokeMiterlimit: 100,
      strokeWidth: '7.16px'
    },
    d: "M3.38 3.56h393.28v393.28H3.38z"
  })]
});
const videopackViewCount = /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: '#ff9ca1'
    },
    d: "m8.57 162.7 71.81 40.43-71.81 41.79"
  }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
    style: {
      fill: '#cd0000'
    },
    d: "M8.46 250.14V227.9l47.92-27.88-47.92-26.98v-23.05l86.68 50.07-86 50.08m169.59-93.16-6.47 24.1h19.53l6.47-24.1h11.41l-6.47 24.1h12.94v9.51h-15.47l-4.95 18.39h14.2v9.51h-16.74l-6.21 23.46h-11.41l6.21-23.46h-19.53l-6.21 23.46h-11.41l6.21-23.46h-13.57v-9.51h16.11l4.95-18.39h-14.84v-9.51h17.37l6.47-24.1zm-13.95 51.99h19.53l4.95-18.39h-19.53zm101.7-51.99-6.47 24.1h19.53l6.47-24.1h11.41l-6.47 24.1h12.94v9.51h-15.47l-4.95 18.39h14.2v9.51h-16.74l-6.21 23.46h-11.41l6.21-23.46h-19.53l-6.21 23.46h-11.41l6.21-23.46h-13.57v-9.51h16.11l4.95-18.39h-14.84v-9.51h17.37l6.47-24.1zm-13.95 51.99h19.53l4.95-18.39h-19.53zm101.7-51.99-6.47 24.1h19.53l6.47-24.1h11.41l-6.47 24.1h12.94v9.51h-15.47l-4.95 18.39h14.2v9.51h-16.74l-6.21 23.46h-11.41l6.21-23.46h-19.53l-6.21 23.46h-11.41l6.21-23.46h-13.57v-9.51h16.11l4.95-18.39h-14.84v-9.51h17.37l6.47-24.1zm-13.95 51.99h19.53l4.95-18.39h-19.53z"
  })]
});
const videopackWatermark = /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 400 400",
  children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("g", {
    style: {
      opacity: 0.2
    },
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("g", {
      transform: "rotate(-45 201.506 200.804)",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("circle", {
        cx: 201.51,
        cy: 200.8,
        r: 121.45,
        style: {
          fill: '#fff'
        }
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("circle", {
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
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
      style: {
        fill: '#cd0000'
      },
      d: "M133.55 150.74h30.48l38.2 65.65 36.97-65.65h31.58l-68.61 118.75-68.62-117.83"
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("path", {
      style: {
        fill: '#ff9ca1'
      },
      d: "m239.2 150.74-36.97 65.65-38.2-65.65"
    })]
  })
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
const play = createIcon('play');
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

;// external ["wp","htmlEntities"]
const external_wp_htmlEntities_namespaceObject = window["wp"]["htmlEntities"];
;// external ["wp","apiFetch"]
const external_wp_apiFetch_namespaceObject = window["wp"]["apiFetch"];
var external_wp_apiFetch_default = /*#__PURE__*/__webpack_require__.n(external_wp_apiFetch_namespaceObject);
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
  const [currentPost, setCurrentPost] = (0,external_wp_element_namespaceObject.useState)(null);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
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
      label: (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(currentPost.title.rendered)
    });
  }
  if (searchResults) {
    searchResults.forEach(post => {
      if (!optionsForSelect.find(o => String(o.value) === String(post.id))) {
        optionsForSelect.push({
          value: String(post.id),
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
        if (value !== 'custom' && value !== 'manual') {
          newAttributes.gallery_id = 0;
        }
        if (value !== 'manual') {
          newAttributes.gallery_include = '';
        }
        setAttributes(newAttributes);
      }
    }), gallery_source === 'custom' && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ComboboxControl, {
      label: (0,external_wp_i18n_namespaceObject.__)('Search Posts', 'video-embed-thumbnail-generator'),
      value: gallery_id ? String(gallery_id) : '',
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
    gallery_source,
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
    }), gallery_source === 'archive' && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ToggleControl, {
      label: (0,external_wp_i18n_namespaceObject.__)('Prioritize Post Data', 'video-embed-thumbnail-generator'),
      help: (0,external_wp_i18n_namespaceObject.__)('Use the title and date from the original post instead of the video attachment.', 'video-embed-thumbnail-generator'),
      checked: !!attributes.prioritizePostData,
      onChange: val => setAttributes({
        prioritizePostData: val
      })
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
    gallery_end
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
  const effectiveValues = (0,external_wp_element_namespaceObject.useMemo)(() => ({
    ...options,
    ...attributes
  }), [options, attributes]);
  const colorFallbacks = (0,external_wp_element_namespaceObject.useMemo)(() => getColorFallbacks(effectiveValues), [effectiveValues]);
  const THEME_COLORS = videopack_config?.themeColors || options?.themeColors;
  const isGalleryOrList = blockType === 'gallery' || blockType === 'list' || blockType === 'grid';
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [isGalleryOrList && showSkinSettings && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
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
    }), isGalleryOrList && showTitleSettings && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
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
    }), isGalleryOrList && showPlayerSettings && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
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
  showTitleSettings = true,
  showPlayerSettings = true,
  showSkinSettings = true,
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
        showPaginationSettings: showPaginationSettings,
        showTitleSettings: showTitleSettings,
        showPlayerSettings: showPlayerSettings,
        showSkinSettings: showSkinSettings
      })
    })]
  });
}
;// external ["wp","mediaUtils"]
const external_wp_mediaUtils_namespaceObject = window["wp"]["mediaUtils"];
;// external ["wp","url"]
const external_wp_url_namespaceObject = window["wp"]["url"];
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
        formData.append('post_name', (0,external_wp_url_namespaceObject.getFilename)(videoSrc));
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
    const path = (0,external_wp_url_namespaceObject.addQueryArgs)('/videopack/v1/thumbs', query);
    return await external_wp_apiFetch_default()({
      path,
      parse: false
    });
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw error;
  }
};
;// ./src/api/gallery.js
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
    return await external_wp_apiFetch_default()({
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
    return await external_wp_apiFetch_default()({
      path: (0,external_wp_url_namespaceObject.addQueryArgs)('/videopack/v1/sources', query),
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
    const presets = await external_wp_apiFetch_default()({
      path: (0,external_wp_url_namespaceObject.addQueryArgs)(`/videopack/v1/attachment/${attachmentId}/formats`, query),
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
  const pre = (0,external_wp_hooks_namespaceObject.applyFilters)('videopack.utils.pre_getVideoGallery', undefined, args);
  if (typeof pre !== 'undefined') {
    return pre;
  }
  try {
    const response = await external_wp_apiFetch_default()({
      path: (0,external_wp_url_namespaceObject.addQueryArgs)('/videopack/v1/video_gallery', args),
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
    return await external_wp_apiFetch_default()({
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
  const pre = (0,external_wp_hooks_namespaceObject.applyFilters)('videopack.utils.pre_testEncodeCommand', undefined, codec, resolution, rotate);
  if (typeof pre !== 'undefined') {
    return pre;
  }
  try {
    return await external_wp_apiFetch_default()({
      path: `/videopack/v1/ffmpeg-test/?codec=${codec}&resolution=${resolution}&rotate=${rotate}`
    });
  } catch (error) {
    console.error('Error testing encode command:', error);
    throw error;
  }
};
;// ./src/api/media.js
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
    return await external_wp_apiFetch_default()({
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
    return await external_wp_apiFetch_default()({
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
    return await external_wp_apiFetch_default()({
      path: (0,external_wp_url_namespaceObject.addQueryArgs)('/videopack/v1/batch/progress', {
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
    return await external_wp_apiFetch_default()({
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
    return await external_wp_apiFetch_default()({
      path: '/videopack/v1/browser-encoder/delete-assets',
      method: 'POST'
    });
  } catch (error) {
    console.error('Error deleting browser encoder assets:', error);
    throw error;
  }
};
;// ./src/api/jobs.js
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
  const pre = (0,external_wp_hooks_namespaceObject.applyFilters)('videopack.utils.pre_getQueue', undefined);
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
    return (0,external_wp_hooks_namespaceObject.applyFilters)('videopack.utils.getQueue', response || []);
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
    return await external_wp_apiFetch_default()({
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
    return await external_wp_apiFetch_default()({
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
      path: (0,external_wp_url_namespaceObject.addQueryArgs)(`/videopack/v1/jobs/${jobId}`, {
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
    return await external_wp_apiFetch_default()({
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
    return await external_wp_apiFetch_default()({
      path: (0,external_wp_url_namespaceObject.addQueryArgs)(`/videopack/v1/jobs/${jobId}`, {
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
    return await external_wp_apiFetch_default()({
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
    const path = input ? (0,external_wp_url_namespaceObject.addQueryArgs)('/videopack/v1/jobs', {
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
    return await external_wp_apiFetch_default()({
      path: `/videopack/v1/browser-queue/job/${jobId}/reset`,
      method: 'POST'
    });
  } catch (error) {
    console.error('Error resetting job:', error);
    throw error;
  }
};
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
    img.onerror = () => reject(new Error((0,external_wp_i18n_namespaceObject.__)('Failed to load watermark image', 'video-embed-thumbnail-generator')));
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
;// ./node_modules/@wordpress/icons/build-module/library/chevron-up.mjs
// packages/icons/src/library/chevron-up.tsx


var chevron_up_default = /* @__PURE__ */ (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, { d: "M6.5 12.4L12 8l5.5 4.4-.9 1.2L12 10l-4.5 3.6-1-1.2z" }) });

//# sourceMappingURL=chevron-up.mjs.map

;// ./node_modules/@wordpress/icons/build-module/library/chevron-down.mjs
// packages/icons/src/library/chevron-down.tsx


var chevron_down_default = /* @__PURE__ */ (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, { d: "M17.5 11.6L12 16l-5.5-4.4.9-1.2L12 14l4.5-3.6 1 1.2z" }) });

//# sourceMappingURL=chevron-down.mjs.map

;// ./node_modules/@wordpress/icons/build-module/library/external.mjs
// packages/icons/src/library/external.tsx


var external_default = /* @__PURE__ */ (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, { d: "M19.5 4.5h-7V6h4.44l-5.97 5.97 1.06 1.06L18 7.06v4.44h1.5v-7Zm-13 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3H17v3a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h3V5.5h-3Z" }) });

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
  const localPanelRef = (0,external_wp_element_namespaceObject.useRef)();
  const containerRef = panelRef || localPanelRef;
  const [duration, setDuration] = (0,external_wp_element_namespaceObject.useState)(videoRef.current?.duration || 0);
  const onLoadedMetadata = event => {
    setDuration(event.target.duration);
  };
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    if (videoRef.current?.duration) {
      setDuration(videoRef.current.duration);
    }
  }, [videoRef]);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    if ((isModal || containerRef === panelRef) && containerRef?.current) {
      // Trigger a small delay to ensure the panel is visible/ready before focusing
      const timer = setTimeout(() => {
        containerRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isModal, panelRef, containerRef]);
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
    className: `videopack-thumb-video-panel spinner-container${isSaving ? ' saving' : ''} ${isModal ? 'is-modal' : ''} ${disabled ? 'disabled' : ''}`,
    tabIndex: 0,
    ref: containerRef,
    onKeyDown: onKeyDown,
    role: "button",
    "aria-label": (0,external_wp_i18n_namespaceObject.__)('Video Player', 'video-embed-thumbnail-generator'),
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("video", {
      src: src,
      ref: videoRef,
      muted: true,
      preload: "metadata",
      onClick: () => togglePlayback(videoRef),
      onLoadedMetadata: onLoadedMetadata,
      onLoadedData: onLoadedData,
      role: "button",
      "aria-label": (0,external_wp_i18n_namespaceObject.__)('Toggle Playback', 'video-embed-thumbnail-generator'),
      tabIndex: "-1"
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
      className: "videopack-thumb-video-controls",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
        className: "videopack-play-pause",
        onClick: () => togglePlayback(videoRef),
        disabled: disabled,
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Icon, {
          icon: isPlaying ? pause : play
        })
      }), duration > 0 && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.RangeControl, {
        __nextHasNoMarginBottom: true,
        min: 0,
        max: duration,
        step: "any",
        initialPosition: 0,
        value: currentTime || 0,
        onChange: val => handleSliderChange(val, videoRef),
        className: "videopack-thumbvideo-slider",
        type: "slider"
      }), !isModal && onPopOut && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
        className: "videopack-popout",
        onClick: onPopOut,
        icon: external_default,
        label: (0,external_wp_i18n_namespaceObject.__)('Open in larger window', 'video-embed-thumbnail-generator'),
        showTooltip: true,
        disabled: disabled
      })]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
      variant: "secondary",
      onClick: () => handleUseThisFrame(videoRef),
      className: "videopack-use-this-frame",
      disabled: isSaving || disabled,
      children: (0,external_wp_i18n_namespaceObject.__)('Use this frame', 'video-embed-thumbnail-generator')
    }), isSaving && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Spinner, {})]
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
  const thumbVideoPanel = (0,external_wp_element_namespaceObject.useRef)();
  const videoRef = (0,external_wp_element_namespaceObject.useRef)();
  const modalVideoRef = (0,external_wp_element_namespaceObject.useRef)();
  const posterImageButton = (0,external_wp_element_namespaceObject.useRef)();
  const [isPlaying, setIsPlaying] = (0,external_wp_element_namespaceObject.useState)(false);
  const [isOpened, setIsOpened] = (0,external_wp_element_namespaceObject.useState)(false);
  const [currentTime, setCurrentTime] = (0,external_wp_element_namespaceObject.useState)(false);
  const [thumbChoices, setThumbChoices] = (0,external_wp_element_namespaceObject.useState)([]);
  const [isSaving, setIsSaving] = (0,external_wp_element_namespaceObject.useState)(false);
  const [isModalOpen, setIsModalOpen] = (0,external_wp_element_namespaceObject.useState)(false);
  const [spriteMessage, setSpriteMessage] = (0,external_wp_element_namespaceObject.useState)(null);
  const [cloudJobs, setCloudJobs] = (0,external_wp_element_namespaceObject.useState)([]);
  const [existingSprite, setExistingSprite] = (0,external_wp_element_namespaceObject.useState)(null); // { id, url, status }
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = (0,external_wp_element_namespaceObject.useState)(false);
  const [isDeleting, setIsDeleting] = (0,external_wp_element_namespaceObject.useState)(false);
  const [showFailedNotice, setShowFailedNotice] = (0,external_wp_element_namespaceObject.useState)(true);

  // Poll for active thumbnail jobs if any exist
  (0,external_wp_element_namespaceObject.useEffect)(() => {
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
  const fetchSpriteStatus = (0,external_wp_element_namespaceObject.useCallback)(async () => {
    if (!id || !src) {
      return;
    }
    try {
      const formats = await getVideoFormats(id, src, probedMetadata);
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
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    fetchSpriteStatus();
  }, [fetchSpriteStatus]);
  const {
    active_encoder = 'ffmpeg'
  } = options;
  const effectiveFfmpegExists = active_encoder !== 'ffmpeg' && (!!videopack_config.isTranscodingServiceReady || !!videopack_config.is_pro) || !!videopack_config.ffmpeg_exists && videopack_config.ffmpeg_exists !== 'notinstalled';
  const ffmpegExists = effectiveFfmpegExists;
  const {
    editPost
  } = (0,external_wp_data_namespaceObject.useDispatch)('core/editor') || {};
  const isEditingAttachment = (0,external_wp_data_namespaceObject.useSelect)(select => select('core/editor')?.getCurrentPostType() === 'attachment', []);
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
  (0,external_wp_element_namespaceObject.useEffect)(() => {
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
  (0,external_wp_element_namespaceObject.useEffect)(() => {
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
            text: (0,external_wp_i18n_namespaceObject.__)('Thumbnail generation enqueued in the cloud. This may take a few minutes.', 'video-embed-thumbnail-generator')
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
  const [spriteTiles, setSpriteTiles] = (0,external_wp_element_namespaceObject.useState)([]);
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
        let successMsg = (0,external_wp_i18n_namespaceObject.__)('Sprite generation enqueued. Check Additional Formats panel for progress.', 'video-embed-thumbnail-generator');
        if (videopack_config.active_encoder === 'browser') {
          successMsg = /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("p", {
              children: successMsg
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("p", {
              children: [(0,external_wp_i18n_namespaceObject.__)('Browser encoding is active. Processing will only occur while the Videopack Queue page is open.', 'video-embed-thumbnail-generator'), ' ', /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("a", {
                href: videopack_config.queue_url,
                children: (0,external_wp_i18n_namespaceObject.__)('Go to Queue Page', 'video-embed-thumbnail-generator')
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
          text: (0,external_wp_i18n_namespaceObject.__)('Error: Failed to enqueue sprite generation.', 'video-embed-thumbnail-generator')
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
        text: (0,external_wp_i18n_namespaceObject.__)('Sprite sheet deleted successfully.', 'video-embed-thumbnail-generator')
      });
    } catch (error) {
      console.error('Failed to delete sprite:', error);
      setSpriteMessage({
        type: 'error',
        text: (0,external_wp_i18n_namespaceObject.__)('Error: Failed to delete sprite sheet.', 'video-embed-thumbnail-generator')
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
  const generateThumb = (0,external_wp_element_namespaceObject.useCallback)(async (i, type, forceId = null, forceFeatured = null, time = null) => {
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
  const generateThumbCanvases = (0,external_wp_element_namespaceObject.useCallback)(async type => {
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
                text: (0,external_wp_i18n_namespaceObject.__)('Thumbnail generation enqueued in the cloud. This may take a few minutes.', 'video-embed-thumbnail-generator')
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
  (0,external_wp_element_namespaceObject.useEffect)(() => {
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

  (0,external_wp_element_namespaceObject.useEffect)(() => {
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
              text: (0,external_wp_i18n_namespaceObject.__)('Thumbnail generation enqueued in the cloud. This may take a few minutes.', 'video-embed-thumbnail-generator')
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
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
    className: "videopack-thumbnail-generator",
    children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.PanelBody, {
      title: (0,external_wp_i18n_namespaceObject.__)('Thumbnails', 'video-embed-thumbnail-generator'),
      children: [showFailedNotice && Number(videoData?.record?.meta?._videopack_browser_thumb_failed) === 1 && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Notice, {
        status: "error",
        onRemove: () => setShowFailedNotice(false),
        isDismissible: true,
        children: (0,external_wp_i18n_namespaceObject.__)('Automatic in-browser thumbnail generation failed for this video (possibly due to CORS or canvas limitations). You can try generating thumbnails manually below.', 'video-embed-thumbnail-generator')
      }), poster && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("img", {
        className: "videopack-current-thumbnail",
        src: poster,
        alt: (0,external_wp_i18n_namespaceObject.__)('Current Thumbnail', 'video-embed-thumbnail-generator')
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.BaseControl, {
        className: "editor-video-poster-control",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.BaseControl.VisualLabel, {
          children: (0,external_wp_i18n_namespaceObject.__)('Video Thumbnail', 'video-embed-thumbnail-generator')
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_mediaUtils_namespaceObject.MediaUpload, {
          title: (0,external_wp_i18n_namespaceObject.__)('Select video thumbnail', 'video-embed-thumbnail-generator'),
          onSelect: onSelectPoster,
          allowedTypes: VIDEO_POSTER_ALLOWED_MEDIA_TYPES,
          render: ({
            open
          }) => /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
            variant: "secondary",
            onClick: open,
            ref: posterImageButton,
            children: !poster ? (0,external_wp_i18n_namespaceObject.__)('Select', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_namespaceObject.__)('Replace', 'video-embed-thumbnail-generator')
          })
        }), !!poster && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          onClick: onRemovePoster,
          variant: "tertiary",
          children: (0,external_wp_i18n_namespaceObject.__)('Remove', 'video-embed-thumbnail-generator')
        })]
      }), cloudJobs.length > 0 && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
        className: "videopack-active-jobs",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Spinner, {}), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("p", {
          children: (0,external_wp_i18n_namespaceObject.__)('Cloud thumbnail generation in progress…', 'video-embed-thumbnail-generator')
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ToggleControl, {
        label: (0,external_wp_i18n_namespaceObject.__)("Set as post's featured image", 'video-embed-thumbnail-generator'),
        checked: !!featured,
        onChange: value => {
          setAttributes({
            ...attributes,
            featured: value
          });
        }
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
        className: "videopack-generation-controls",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalNumberControl, {
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
          label: (0,external_wp_i18n_namespaceObject.__)('Total', 'video-embed-thumbnail-generator'),
          hideLabelFromVision: true
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
          className: "videopack-generation-actions",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
            variant: "secondary",
            onClick: () => handleGenerate('generate'),
            className: "videopack-generate",
            disabled: isSaving || (canvasTainted || isProbing) && !ffmpegExists,
            children: (0,external_wp_i18n_namespaceObject.__)('Generate', 'video-embed-thumbnail-generator')
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
            variant: "secondary",
            onClick: () => handleGenerate('random'),
            className: "videopack-generate",
            disabled: isSaving || (canvasTainted || isProbing) && !ffmpegExists,
            children: (0,external_wp_i18n_namespaceObject.__)('Random', 'video-embed-thumbnail-generator')
          }), videopack_config.is_pro && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
            variant: "secondary",
            onClick: existingSprite ? () => setIsConfirmDeleteOpen(true) : handleGenerateSprite,
            className: existingSprite ? 'videopack-delete-sprite' : 'videopack-generate-sprite',
            disabled: isSaving || isProbing || canvasTainted && !ffmpegExists || isDeleting,
            isBusy: isDeleting,
            isDestructive: !!existingSprite,
            children: existingSprite ? (0,external_wp_i18n_namespaceObject.__)('Delete Sprite', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_namespaceObject.__)('Sprite', 'video-embed-thumbnail-generator')
          })]
        })]
      }), spriteMessage && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Notice, {
        status: spriteMessage.type,
        onRemove: () => setSpriteMessage(null),
        isDismissible: true,
        className: "videopack-sprite-notice",
        children: spriteMessage.text
      }), canvasTainted && !isProbing && !ffmpegExists && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
        className: "videopack-security-error-notice",
        children: (0,external_wp_i18n_namespaceObject.__)('Cross-origin resource sharing (CORS) policy on the external server is preventing thumbnail generation.', 'video-embed-thumbnail-generator')
      }), spriteTiles.length > 0 && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
        className: "videopack-sprite-generation-preview",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("p", {
          children: (0,external_wp_i18n_namespaceObject.sprintf)(/* translators: %d is the number of tiles captured */
          (0,external_wp_i18n_namespaceObject.__)('Capturing sprite tiles… (%d)', 'video-embed-thumbnail-generator'), spriteTiles.length)
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
          className: "videopack-sprite-tiles-grid",
          children: spriteTiles.map((tileSrc, index) => /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("img", {
            src: tileSrc,
            alt: ""
          }, index))
        })]
      }), thumbChoices.length > 0 && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
        variant: "primary",
        onClick: handleSaveAllThumbnails,
        disabled: isSaving,
        children: (0,external_wp_i18n_namespaceObject.__)('Save All', 'video-embed-thumbnail-generator')
      }), thumbChoices.length > 0 && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
        className: `videopack-thumbnail-holder${isSaving ? ' disabled' : ''}`,
        children: thumbChoices.map((thumb, index) => /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("button", {
          type: "button",
          className: 'videopack-thumbnail spinner-container',
          onClick: event => {
            handleSaveThumbnail(event, thumb, index);
          },
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("img", {
            src: thumb.src,
            alt: (0,external_wp_i18n_namespaceObject.sprintf)(/* translators: %d is the thumbnail index */
            (0,external_wp_i18n_namespaceObject.__)('Thumbnail %d', 'video-embed-thumbnail-generator'), index + 1),
            title: (0,external_wp_i18n_namespaceObject.__)('Save and set thumbnail', 'video-embed-thumbnail-generator')
          }), isSaving && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Spinner, {})]
        }, index))
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
        className: `components-panel__body videopack-thumb-video ${isOpened ? 'is-opened' : ''}`,
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("h2", {
          className: "components-panel__body-title",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("button", {
            className: "components-button components-panel__body-toggle",
            type: "button",
            onClick: handleToggleVideoPlayer,
            "aria-expanded": isOpened,
            disabled: (canvasTainted || isProbing) && !ffmpegExists,
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
              "aria-hidden": "true",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Icon, {
                className: "components-panel__arrow",
                icon: isOpened ? chevron_up_default : chevron_down_default
              })
            }), (0,external_wp_i18n_namespaceObject.__)('Choose From Video', 'video-embed-thumbnail-generator'), canvasTainted && !isProbing && !ffmpegExists && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Icon, {
              icon: chevron_up_default,
              style: {
                display: 'none'
              }
            })]
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
          className: `videopack-thumb-video-container ${isOpened ? 'is-opened' : ''} ${(canvasTainted || isProbing) && !ffmpegExists ? 'disabled' : ''}`,
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(Thumbnails_VideoPlayerInner, {
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
      }), isModalOpen && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Modal, {
        title: (0,external_wp_i18n_namespaceObject.__)('Choose From Video', 'video-embed-thumbnail-generator'),
        onRequestClose: handleCloseModal,
        className: "videopack-video-modal",
        overlayClassName: "videopack-video-modal-overlay",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(Thumbnails_VideoPlayerInner, {
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
      }), isConfirmDeleteOpen && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.Modal, {
        title: (0,external_wp_i18n_namespaceObject.__)('Delete Sprite Sheet', 'video-embed-thumbnail-generator'),
        onRequestClose: () => setIsConfirmDeleteOpen(false),
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("p", {
          children: (0,external_wp_i18n_namespaceObject.__)('Are you sure you want to permanently delete this sprite sheet? This action cannot be undone.', 'video-embed-thumbnail-generator')
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
          className: "videopack-modal-actions",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
            variant: "secondary",
            onClick: () => setIsConfirmDeleteOpen(false),
            children: (0,external_wp_i18n_namespaceObject.__)('Cancel', 'video-embed-thumbnail-generator')
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
            variant: "primary",
            isDestructive: true,
            onClick: handleDeleteSprite,
            disabled: isDeleting,
            children: isDeleting ? /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Spinner, {}) : (0,external_wp_i18n_namespaceObject.__)('Delete', 'video-embed-thumbnail-generator')
          })]
        })]
      })]
    })
  });
};
/* harmony default export */ const Thumbnails_Thumbnails = (Thumbnails);
;// ./src/api/settings.js
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
    const data = {
      videopack_options: newSettings
    };
    const response = await external_wp_apiFetch_default()({
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
    return await external_wp_apiFetch_default()({
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
    return await external_wp_apiFetch_default()({
      path: '/videopack/v1/settings/cache',
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error clearing URL cache:', error);
    throw error;
  }
};
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
;// ./src/utils/utils.js
/**
 * Backward compatibility layer for Videopack utilities.
 * All API functions have been moved to the src/api directory.
 * Generic helpers have been moved to src/utils/helpers.js.
 */







;// ./src/videopack-admin.js







window.videopack = Object.assign(window.videopack || {}, {
  components: {
    ...(window.videopack?.components || {}),
    Pagination: Pagination,
    CollectionSettingsPanel: CollectionSettingsPanel,
    CompactColorPicker: CompactColorPicker_CompactColorPicker,
    Thumbnails: Thumbnails_Thumbnails
  },
  utils: {
    ...(window.videopack?.utils || {}),
    ...utils_namespaceObject,
    ...video_capture_namespaceObject
  },
  icons: {
    ...(window.videopack?.icons || {}),
    ...icon_namespaceObject
  }
});
/******/ })()
;