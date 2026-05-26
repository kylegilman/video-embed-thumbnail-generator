/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// external ["wp","blocks"]
const external_wp_blocks_namespaceObject = window["wp"]["blocks"];
;// external ["wp","i18n"]
const external_wp_i18n_namespaceObject = window["wp"]["i18n"];
;// external ["wp","blockEditor"]
const external_wp_blockEditor_namespaceObject = window["wp"]["blockEditor"];
;// external ["wp","data"]
const external_wp_data_namespaceObject = window["wp"]["data"];
;// external ["wp","htmlEntities"]
const external_wp_htmlEntities_namespaceObject = window["wp"]["htmlEntities"];
;// external ["wp","element"]
const external_wp_element_namespaceObject = window["wp"]["element"];
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
;// ./src/blocks/caption/edit.js






function Edit({
  attributes,
  setAttributes,
  context
}) {
  const {
    caption: manualCaption
  } = attributes;
  const {
    postId,
    postType,
    'videopack/caption': contextCaption
  } = context;
  const {
    fetchedExcerpt
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    if (!postId) {
      return {
        fetchedExcerpt: ''
      };
    }
    const record = select('core').getEntityRecord('postType', postType || 'attachment', postId);
    return {
      fetchedExcerpt: record?.excerpt?.rendered || record?.caption?.rendered || ''
    };
  }, [postId, postType]);
  const {
    resolved: vpContext
  } = useVideopackContext(attributes, context);
  const displayCaption = (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(manualCaption || (vpContext.prioritizePostData ? fetchedExcerpt || contextCaption : contextCaption || fetchedExcerpt) || (vpContext.isPreview ? (0,external_wp_i18n_namespaceObject.__)('Sample Video Caption', 'video-embed-thumbnail-generator') : ''));
  const blockProps = (0,external_wp_blockEditor_namespaceObject.useBlockProps)({
    className: 'videopack-video-caption-block'
  });
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
    ...blockProps,
    children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.RichText, {
      tagName: "figcaption",
      className: "wp-element-caption videopack-video-caption",
      value: displayCaption,
      onChange: value => setAttributes({
        caption: value
      }),
      placeholder: (0,external_wp_i18n_namespaceObject.__)('Enter Caption…', 'video-embed-thumbnail-generator')
    })
  });
}
;// ./src/blocks/caption/save.js


function save({
  attributes
}) {
  const {
    caption
  } = attributes;
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.RichText.Content, {
    ...external_wp_blockEditor_namespaceObject.useBlockProps.save({
      className: 'wp-element-caption videopack-video-caption'
    }),
    tagName: "figcaption",
    value: caption
  });
}
;// ./src/blocks/caption/block.json
const block_namespaceObject = /*#__PURE__*/JSON.parse('{"UU":"videopack/caption"}');
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
const icon_save = /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("svg", {
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

;// ./src/blocks/caption/index.js





(0,external_wp_blocks_namespaceObject.registerBlockType)(block_namespaceObject.UU, {
  icon: videopackCaption,
  /**
   * @see ./edit.js
   */
  edit: Edit,
  /**
   * @see ./save.js
   */
  save: save
});
/******/ })()
;