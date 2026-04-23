/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// external ["wp","blocks"]
const external_wp_blocks_namespaceObject = window["wp"]["blocks"];
;// external ["wp","blockEditor"]
const external_wp_blockEditor_namespaceObject = window["wp"]["blockEditor"];
;// external ["wp","components"]
const external_wp_components_namespaceObject = window["wp"]["components"];
;// external ["wp","i18n"]
const external_wp_i18n_namespaceObject = window["wp"]["i18n"];
;// external ["wp","data"]
const external_wp_data_namespaceObject = window["wp"]["data"];
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
;// external "ReactJSXRuntime"
const external_ReactJSXRuntime_namespaceObject = window["ReactJSXRuntime"];
;// ./src/blocks/thumbnail/VideoThumbnailPreview.js




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
  children,
  resolvedDuotoneClass,
  context = {},
  video = {}
}) {
  const effectiveSkin = getEffectiveValue('skin', {}, context);
  const {
    thumbnailMedia,
    posterUrl,
    isResolving
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    if (!postId || postId < 1) {
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
  }, [postId]);
  if (isResolving && !video.poster_url) {
    return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Spinner, {});
  }
  const config = typeof window !== 'undefined' ? window.videopack_config : undefined;
  const defaultNoThumb = config ? `${config.url}/src/images/nothumbnail.jpg` : '';

  // Priority: 1. Manual video data (previews), 2. Direct poster URL from meta, 3. WordPress media object, 4. Default "no thumbnail"
  const thumbnailUrl = video.poster_url || posterUrl || thumbnailMedia?.source_url || defaultNoThumb;
  const play_button_color = getEffectiveValue('play_button_color', {}, context);
  const play_button_secondary_color = getEffectiveValue('play_button_secondary_color', {}, context);
  const containerClass = `gallery-thumbnail videopack-gallery-item wp-block wp-block-videopack-thumbnail ${effectiveSkin} ${resolvedDuotoneClass || ''} ${play_button_color ? 'videopack-has-play-button-color' : ''} ${play_button_secondary_color ? 'videopack-has-play-button-secondary-color' : ''}`.trim();
  const imgStyle = resolvedDuotoneClass ? {
    filter: `url(#${resolvedDuotoneClass})`
  } : {};
  const containerStyle = {
    ...imgStyle,
    '--videopack-play-button-color': play_button_color,
    '--videopack-play-button-secondary-color': play_button_secondary_color
  };
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
    className: containerClass,
    style: containerStyle,
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("img", {
      src: thumbnailUrl,
      alt: thumbnailMedia?.alt_text || '',
      className: resolvedDuotoneClass || '',
      style: imgStyle
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      className: "videopack-inner-blocks-container",
      children: children
    })]
  });
}
;// ./src/blocks/thumbnail/edit.js






/**
 * Thumbnail Edit Component
 *
 * @param {Object}   root0               Component props
 * @param {Object}   root0.attributes    Block attributes
 * @param {Function} root0.setAttributes Attribute setter
 * @param {Object}   root0.context       Block context
 * @param            root0.clientId
 * @return {Element} Thumbnail edit component
 */

function Edit({
  attributes,
  setAttributes,
  context,
  clientId
}) {
  const postId = context['videopack/postId'];
  const {
    linkTo,
    style
  } = attributes;
  const blockProps = (0,external_wp_blockEditor_namespaceObject.useBlockProps)();

  /**
   * For the template preview itself, we can derive the duotone class from attributes.
   * This is essentially a local version of the sync logic in VideoLoop.
   */
  const duotone = style?.color?.duotone;
  let resolvedDuotoneClass = '';
  if (typeof duotone === 'string' && duotone.startsWith('var:preset|duotone|')) {
    resolvedDuotoneClass = `wp-duotone-${duotone.split('|').pop()}`;
  } else if (Array.isArray(duotone)) {
    // For custom duotones in the template, we'll let Gutenberg's native block-item class handle the filter.
    // However, we use a stable prefix for previews to match VideoLoop's custom filter logic.
    resolvedDuotoneClass = `videopack-custom-duotone-${clientId.split('-')[0]}`;
  }
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.InspectorControls, {
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.PanelBody, {
        title: (0,external_wp_i18n_namespaceObject.__)('Thumbnail Settings', 'video-embed-thumbnail-generator'),
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.SelectControl, {
          label: (0,external_wp_i18n_namespaceObject.__)('Link To', 'video-embed-thumbnail-generator'),
          value: linkTo,
          options: [{
            label: (0,external_wp_i18n_namespaceObject.__)('None', 'video-embed-thumbnail-generator'),
            value: 'none'
          }, {
            label: (0,external_wp_i18n_namespaceObject.__)('Lightbox', 'video-embed-thumbnail-generator'),
            value: 'lightbox'
          }, {
            label: (0,external_wp_i18n_namespaceObject.__)('Direct Link', 'video-embed-thumbnail-generator'),
            value: 'file'
          }, {
            label: (0,external_wp_i18n_namespaceObject.__)('Attachment Page', 'video-embed-thumbnail-generator'),
            value: 'post'
          }],
          onChange: value => setAttributes({
            linkTo: value
          })
        })
      })
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
      ...blockProps,
      className: (blockProps.className || '') + ' videopack-thumbnail-block',
      children: [!postId ? /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Placeholder, {
        icon: "format-video",
        label: (0,external_wp_i18n_namespaceObject.__)('Video Thumbnail', 'video-embed-thumbnail-generator'),
        instructions: (0,external_wp_i18n_namespaceObject.__)('This block displays the video thumbnail when placed inside a Videopack Collection.', 'video-embed-thumbnail-generator')
      }) : /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(VideoThumbnailPreview, {
        postId: postId,
        resolvedDuotoneClass: resolvedDuotoneClass,
        context: context,
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.BlockContextProvider, {
          value: {
            ...context,
            'videopack/isInsideThumbnail': true,
            'videopack/downloadlink': false,
            'videopack/embedcode': false
          },
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.InnerBlocks, {
            templateLock: false,
            renderAppender: external_wp_blockEditor_namespaceObject.InnerBlocks.ButtonBlockAppender
          })
        })
      }), !postId && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
        style: {
          display: 'none'
        },
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.BlockContextProvider, {
          value: {
            ...context,
            'videopack/isInsideThumbnail': true,
            'videopack/downloadlink': false,
            'videopack/embedcode': false
          },
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.InnerBlocks, {
            templateLock: false,
            renderAppender: external_wp_blockEditor_namespaceObject.InnerBlocks.ButtonBlockAppender
          })
        })
      })]
    })]
  });
}
;// ./src/blocks/thumbnail/save.js


function save() {
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.InnerBlocks.Content, {});
}
;// ./src/blocks/thumbnail/block.json
const block_namespaceObject = /*#__PURE__*/JSON.parse('{"UU":"videopack/thumbnail"}');
;// ./src/blocks/thumbnail/index.js




(0,external_wp_blocks_namespaceObject.registerBlockType)(block_namespaceObject.UU, {
  edit: Edit,
  save: save
});
/******/ })()
;