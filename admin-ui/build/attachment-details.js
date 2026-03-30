/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/features/attachment-details/attachment-details.js"
/*!***************************************************************!*\
  !*** ./src/features/attachment-details/attachment-details.js ***!
  \***************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_AttachmentDetails__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./components/AttachmentDetails */ "./src/features/attachment-details/components/AttachmentDetails.js");
/* harmony import */ var _components_AttachmentPreview__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components/AttachmentPreview */ "./src/features/attachment-details/components/AttachmentPreview.js");
/* harmony import */ var _utils_video_capture__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../utils/video-capture */ "./src/utils/video-capture.js");
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../utils/utils */ "./src/utils/utils.js");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _attachment_details_scss__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./attachment-details.scss */ "./src/features/attachment-details/attachment-details.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__);
/**
 * Main entry point for the attachment details feature, handling React root injection and auto-generation logic.
 */









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
  const videopackReactRoot = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createRoot)(editMediaContainer);
  videopackReactRoot.render(/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_components_AttachmentDetails__WEBPACK_IMPORTED_MODULE_1__["default"], {
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
            // eslint-disable-next-line no-console
            console.warn('Videopack: Failed to remove native MEJS player', e);
          }
        }
      });
    }
    nativePreview.innerHTML = '';
    const previewRootDiv = document.createElement('div');
    previewRootDiv.id = 'videopack-attachment-preview-root';
    nativePreview.appendChild(previewRootDiv);
    const previewRoot = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createRoot)(previewRootDiv);
    previewRoot.render(/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_components_AttachmentPreview__WEBPACK_IMPORTED_MODULE_2__["default"], {
      attachmentId: postId
    }));
  }
}

// Ensure wp.media is loaded.
if (typeof wp === 'undefined' || !wp.media || !wp.media.view || !wp.media.view.Attachment.Details) {
  console.error('Videopack: wp.media.view.Attachment.Details is not available.');
} else {
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
          let settingsSection = this.$el.find('.settings');
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
          this.videopackReactRoot = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createRoot)(reactRootDiv);
          this.videopackReactRoot.render(/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_components_AttachmentDetails__WEBPACK_IMPORTED_MODULE_1__["default"], {
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
              this.videopackPreviewRoot = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createRoot)(previewRootDiv);
              this.videopackPreviewRoot.render(/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_components_AttachmentPreview__WEBPACK_IMPORTED_MODULE_2__["default"], {
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

// --- Auto-Generation Logic ---
// Moved to Videopack Pro.

/***/ },

/***/ "./src/features/attachment-details/components/AttachmentDetails.js"
/*!*************************************************************************!*\
  !*** ./src/features/attachment-details/components/AttachmentDetails.js ***!
  \*************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _components_VideoSettings_VideoSettings_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../components/VideoSettings/VideoSettings.js */ "./src/components/VideoSettings/VideoSettings.js");
/* harmony import */ var _components_Thumbnails_Thumbnails_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../components/Thumbnails/Thumbnails.js */ "./src/components/Thumbnails/Thumbnails.js");
/* harmony import */ var _components_AdditionalFormats_AdditionalFormats_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../components/AdditionalFormats/AdditionalFormats.js */ "./src/components/AdditionalFormats/AdditionalFormats.js");
/* harmony import */ var _utils_utils_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../utils/utils.js */ "./src/utils/utils.js");
/* harmony import */ var _hooks_useVideoSettings_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../hooks/useVideoSettings.js */ "./src/hooks/useVideoSettings.js");
/* harmony import */ var _hooks_useVideoProbe_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../hooks/useVideoProbe.js */ "./src/hooks/useVideoProbe.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__);
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
  const [options, setOptions] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)();
  const [attributes, setRawAttributes] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)();
  const [record, setRecord] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [hasResolved, setHasResolved] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [, forceUpdate] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)({});
  const {
    isProbing,
    probedMetadata
  } = (0,_hooks_useVideoProbe_js__WEBPACK_IMPORTED_MODULE_8__["default"])(attributes?.src);
  const [probedMetadataOverride, setProbedMetadataOverride] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);

  // Sync metadata from attachment records when it loads
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
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
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
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
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (attributes && attributes.id && !model) {
      window.dispatchEvent(new CustomEvent('videopack_settings_update', {
        detail: attributes
      }));
    }
  }, [attributes, model]);

  // Fetch the full media record from the REST API to get videopack metadata.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (!isNaN(attachmentId) && attachmentId > 0) {
      setHasResolved(false);
      setRecord(null); // Eagerly reset to prevent stale probes
      setRawAttributes(null); // Eagerly reset to prevent stale AdditionalFormats fetch
      _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
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
  const attachment = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => ({
    record,
    hasResolved
  }), [record, hasResolved]);

  // Fetch global plugin options.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_6__.getSettings)().then(response => {
      setOptions(response);
    });
  }, []);

  // Listen for native title/caption changes on the Backbone model or DOM.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
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
  const mergeAttributes = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(newAttrs => {
    setRawAttributes(prev => ({
      ...prev,
      ...newAttrs
    }));
  }, []);

  // Calculate and initialize the combined attributes object.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
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
        // eslint-disable-next-line no-console
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
        ...options,
        id: recordId,
        total_thumbnails: videopackMeta.total_thumbnails || options.total_thumbnails,
        title: attachment.record?.title?.rendered || '',
        caption: nativeCaption || '',
        src: attachment.record?.source_url,
        poster: attachment.record?.meta?.['_kgflashmediaplayer-poster'] || attachment.record?.media_details?.sizes?.full?.source_url || attachment.record?.image?.src,
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
  } = (0,_hooks_useVideoSettings_js__WEBPACK_IMPORTED_MODULE_7__["default"])(attributes || {}, mergeAttributes, options, {
    autoSave: true
  });
  if (attributes && attachment.hasResolved && options) {
    // Hide Videopack controls if editing a generated format.
    if (attachment.record?.meta?.['_kgflashmediaplayer-format']) {
      return null;
    }
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)("div", {
      className: "videopack-attachment-details",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_components_Thumbnails_Thumbnails_js__WEBPACK_IMPORTED_MODULE_4__["default"], {
        setAttributes: handleSettingChange,
        attributes: attributes,
        videoData: attachment,
        options: options,
        parentId: attachment.record?.post || 0,
        isProbing: isProbing,
        probedMetadata: effectiveMetadata
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_components_VideoSettings_VideoSettings_js__WEBPACK_IMPORTED_MODULE_3__["default"], {
        setAttributes: handleSettingChange,
        attributes: attributes,
        options: options,
        isProbing: isProbing,
        probedMetadata: effectiveMetadata,
        fallbackTitle: (model ? model.get('title') : '') || attachment.record?.title?.rendered || '',
        fallbackCaption: (model ? model.get('caption') : '') || ''
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_components_AdditionalFormats_AdditionalFormats_js__WEBPACK_IMPORTED_MODULE_5__["default"], {
        attributes: attributes,
        options: options,
        isProbing: isProbing,
        probedMetadata: effectiveMetadata
      }, attributes.id || attributes.src)]
    });
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Spinner, {});
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (AttachmentDetails);

/***/ },

/***/ "./src/features/attachment-details/components/AttachmentPreview.js"
/*!*************************************************************************!*\
  !*** ./src/features/attachment-details/components/AttachmentPreview.js ***!
  \*************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_html_entities__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/html-entities */ "@wordpress/html-entities");
/* harmony import */ var _wordpress_html_entities__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_html_entities__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _components_VideoPlayer_VideoPlayer_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../components/VideoPlayer/VideoPlayer.js */ "./src/components/VideoPlayer/VideoPlayer.js");
/* harmony import */ var _components_PreviewIframe_PreviewIframe_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../components/PreviewIframe/PreviewIframe.js */ "./src/components/PreviewIframe/PreviewIframe.js");
/* harmony import */ var _utils_utils_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../utils/utils.js */ "./src/utils/utils.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__);
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
  const [options, setOptions] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)();
  const [record, setRecord] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(null);
  const [attributes, setAttributes] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(null);
  const [hasResolved, setHasResolved] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(false);
  const [nativeMetadata, setNativeMetadata] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)({
    title: model ? model.get('title') : '',
    caption: model ? model.get('caption') : ''
  });

  // Fetch the full media record from the REST API.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useEffect)(() => {
    if (!isNaN(attachmentId) && attachmentId > 0) {
      setHasResolved(false);
      _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3___default()({
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
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useEffect)(() => {
    (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_7__.getSettings)().then(response => {
      setOptions(response);
    });
  }, []);

  // Listen for native title/caption changes on the Backbone model or DOM.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useEffect)(() => {
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
  const initialAttributes = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useMemo)(() => {
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
      const defaultTitle = (0,_wordpress_html_entities__WEBPACK_IMPORTED_MODULE_4__.decodeEntities)(currentNativeTitle || fallbackTitle);
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
        source_groups: sourceGroups
      };
    }
    return null;
  }, [record, options, hasResolved, attachmentId, nativeMetadata]);

  // Helper to merge local attributes with Backbone model attributes safely.
  const getMergedAttributes = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useCallback)(baseAttrs => {
    if (!baseAttrs) {
      return null;
    }
    const modelAttrsRaw = model ? model.get('videopack_attributes') : null;
    let parsedModelAttrs = {};
    try {
      parsedModelAttrs = typeof modelAttrsRaw === 'string' ? JSON.parse(modelAttrsRaw || '{}') : modelAttrsRaw || {};
    } catch (e) {
      // eslint-disable-next-line no-console
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
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useEffect)(() => {
    if (initialAttributes) {
      const merged = getMergedAttributes(initialAttributes);
      setAttributes(merged);
    }
  }, [initialAttributes, getMergedAttributes]);

  // Listen for subsequent changes from the sidebar via the Backbone model.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useEffect)(() => {
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
  const containerStyle = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useMemo)(() => {
    const styles = {};
    if (videopackConfig.contentSize) {
      styles['--wp--style--global--content-size'] = videopackConfig.contentSize;
    }
    if (videopackConfig.wideSize) {
      styles['--wp--style--global--wide-size'] = videopackConfig.wideSize;
    }
    return styles;
  }, [videopackConfig.contentSize, videopackConfig.wideSize]);

  // Only render once we have resolved the record and calculated initial attributes.
  if (!hasResolved || !options || !attributes) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Spinner, {});
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("div", {
    className: `wp-block-videopack-videopack-video${attributes.align ? ` align${attributes.align}` : ''}`,
    style: containerStyle,
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_components_PreviewIframe_PreviewIframe_js__WEBPACK_IMPORTED_MODULE_6__["default"], {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Attachment Preview', 'video-embed-thumbnail-generator'),
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_components_VideoPlayer_VideoPlayer_js__WEBPACK_IMPORTED_MODULE_5__["default"], {
        attributes: attributes
      })
    })
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (AttachmentPreview);

/***/ },

/***/ "./src/features/attachment-details/attachment-details.scss"
/*!*****************************************************************!*\
  !*** ./src/features/attachment-details/attachment-details.scss ***!
  \*****************************************************************/
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

/***/ "@wordpress/compose"
/*!*********************************!*\
  !*** external ["wp","compose"] ***!
  \*********************************/
(module) {

module.exports = window["wp"]["compose"];

/***/ },

/***/ "@wordpress/core-data"
/*!**********************************!*\
  !*** external ["wp","coreData"] ***!
  \**********************************/
(module) {

module.exports = window["wp"]["coreData"];

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

/***/ "@wordpress/media-utils"
/*!************************************!*\
  !*** external ["wp","mediaUtils"] ***!
  \************************************/
(module) {

module.exports = window["wp"]["mediaUtils"];

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
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
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
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"attachment-details": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = globalThis["webpackChunkvideopack_admin"] = globalThis["webpackChunkvideopack_admin"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["videopack-videoplayer","videopack-shared"], () => (__webpack_require__("./src/features/attachment-details/attachment-details.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=attachment-details.js.map