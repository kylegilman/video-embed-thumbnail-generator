/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/features/classic-embed/classic-embed.js"
/*!*****************************************************!*\
  !*** ./src/features/classic-embed/classic-embed.js ***!
  \*****************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_ClassicEmbed__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./components/ClassicEmbed */ "./src/features/classic-embed/components/ClassicEmbed.js");
/* harmony import */ var _classic_embed_scss__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./classic-embed.scss */ "./src/features/classic-embed/classic-embed.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__);
/**
 * Main entry point for the classic embed feature.
 */





document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('videopack-classic-embed-root');
  if (container) {
    const config = window.videopack_classic_embed_config || {};
    const root = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createRoot)(container);
    root.render(/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_components_ClassicEmbed__WEBPACK_IMPORTED_MODULE_1__["default"], {
      options: config.options || {},
      postId: config.postId,
      activeTab: config.activeTab
    }));
  }
});

/***/ },

/***/ "./src/features/classic-embed/components/ClassicEmbed.js"
/*!***************************************************************!*\
  !*** ./src/features/classic-embed/components/ClassicEmbed.js ***!
  \***************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ClassicEmbed)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _components_VideoSettings_VideoSettings__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../components/VideoSettings/VideoSettings */ "./src/components/VideoSettings/VideoSettings.js");
/* harmony import */ var _components_InspectorControls_CollectionSettingsPanel__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../components/InspectorControls/CollectionSettingsPanel */ "./src/components/InspectorControls/CollectionSettingsPanel.js");
/* harmony import */ var _components_Thumbnails_Thumbnails_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../components/Thumbnails/Thumbnails.js */ "./src/components/Thumbnails/Thumbnails.js");
/* harmony import */ var _components_AdditionalFormats_AdditionalFormats_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../components/AdditionalFormats/AdditionalFormats.js */ "./src/components/AdditionalFormats/AdditionalFormats.js");
/* harmony import */ var _hooks_useVideoQuery__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../hooks/useVideoQuery */ "./src/hooks/useVideoQuery.js");
/* harmony import */ var _hooks_useVideoData__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../../hooks/useVideoData */ "./src/hooks/useVideoData.js");
/* harmony import */ var _hooks_useVideoProbe__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../../hooks/useVideoProbe */ "./src/hooks/useVideoProbe.js");
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../../utils/utils */ "./src/utils/utils.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__);
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
  const normalizedOptions = (0,_utils_utils__WEBPACK_IMPORTED_MODULE_11__.normalizeOptions)(options);

  // Retrieve editAttributes passed from PHP if editing an existing shortcode via TinyMCE
  const editAttributes = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => {
    const config = window.videopack_classic_embed_config || {};
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
  const [videoUrl, setVideoUrl] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(initialVideoUrl);
  const [debouncedVideoUrl, setDebouncedVideoUrl] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(initialVideoUrl);
  const [resolvedId, setResolvedId] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [isResolving, setIsResolving] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const {
    isProbing,
    probedMetadata
  } = (0,_hooks_useVideoProbe__WEBPACK_IMPORTED_MODULE_10__["default"])(debouncedVideoUrl);
  const [probedMetadataOverride, setProbedMetadataOverride] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);

  // Debounce the video URL for all downstream logic and rendering
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (videoUrl === debouncedVideoUrl) {
      return;
    }
    const timeoutId = setTimeout(() => {
      setIsResolving(true);
      setDebouncedVideoUrl(videoUrl);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [videoUrl, debouncedVideoUrl]);
  const [singleAttributes, setSingleAttributes] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)({
    autoplay: !!normalizedOptions.autoplay,
    loop: !!normalizedOptions.loop,
    muted: !!normalizedOptions.muted,
    controls: !!normalizedOptions.controls,
    downloadlink: !!normalizedOptions.downloadlink,
    preload: normalizedOptions.preload || 'metadata',
    ...editAttributes // override with whatever came from the shortcode
  });
  const [galleryAttributes, setGalleryAttributes] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)({
    gallery: true,
    gallery_orderby: normalizedOptions.gallery_orderby || 'menu_order',
    gallery_order: normalizedOptions.gallery_order || 'ASC',
    gallery_pagination: !!normalizedOptions.gallery_pagination,
    gallery_per_page: parseInt(normalizedOptions.gallery_per_page, 10) || 6,
    gallery_columns: parseInt(normalizedOptions.gallery_columns, 10) || 4,
    gallery_title: !!normalizedOptions.gallery_title,
    gallery_end: normalizedOptions.gallery_end || '',
    gallery_source: 'current',
    gallery_id: postId,
    ...editAttributes // override with whatever came from the shortcode
  });
  const [listAttributes, setListAttributes] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)({
    gallery: false,
    gallery_orderby: normalizedOptions.gallery_orderby || 'menu_order',
    gallery_order: normalizedOptions.gallery_order || 'ASC',
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
  const queryData = (0,_hooks_useVideoQuery__WEBPACK_IMPORTED_MODULE_8__["default"])(activeAttributes, postId);
  const videoData = (0,_hooks_useVideoData__WEBPACK_IMPORTED_MODULE_9__.useVideoData)(resolvedId, debouncedVideoUrl, !resolvedId);
  const [urlError, setUrlError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');

  // Validate URL
  const isValidUrl = url => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (e) {
      return false;
    }
  };

  // Resolve URL to Attachment ID
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
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

    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3___default()({
      path: '/videopack/v1/resolve-url',
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
      // eslint-disable-next-line no-console
      console.error('Error resolving video URL:', error);
      setResolvedId(null);
    }).finally(() => {
      setIsResolving(false);
    });
    return () => controller.abort();
  }, [debouncedVideoUrl, postId]);

  // Sync metadata from videoData when it loads
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
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
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
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
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (singleAttributes.id && singleAttributes.id !== resolvedId) {
      setResolvedId(singleAttributes.id);
    }
  }, [singleAttributes.id, resolvedId]);
  const onInsert = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(type => {
    let shortcode = '';
    if (type === 'single') {
      const finalAttributes = {
        ...singleAttributes
      };
      if (resolvedId && videoData) {
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
      shortcode = (0,_utils_utils__WEBPACK_IMPORTED_MODULE_11__.generateShortcode)(finalAttributes, videoUrl, options);
    } else if (type === 'gallery') {
      shortcode = (0,_utils_utils__WEBPACK_IMPORTED_MODULE_11__.generateShortcode)(galleryAttributes, '', options);
    } else {
      shortcode = (0,_utils_utils__WEBPACK_IMPORTED_MODULE_11__.generateShortcode)(listAttributes, '', options);
    }
    if (editAttributes.tinymce_edit && window.parent && window.parent.videopack_tinymce_update_shortcode) {
      window.parent.videopack_tinymce_update_shortcode(shortcode);
    } else if (window.parent && window.parent.send_to_editor) {
      window.parent.send_to_editor(shortcode);
    } else if (window.send_to_editor) {
      window.send_to_editor(shortcode);
    }
  }, [singleAttributes, videoUrl, galleryAttributes, listAttributes, options, editAttributes, resolvedId, videoData]);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
    className: "videopack-classic-embed",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("div", {
      className: "videopack-tab-content",
      children: [activeTab === 'single' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.Fragment, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelBody, {
          title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Video URL', 'video-embed-thumbnail-generator'),
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('URL', 'video-embed-thumbnail-generator'),
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
            help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Enter the URL of the video file (e.g., .mp4, .webm).', 'video-embed-thumbnail-generator')
          }), urlError && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
            style: {
              color: '#d94f4f',
              marginTop: '8px',
              fontSize: '13px'
            },
            children: urlError
          })]
        }), debouncedVideoUrl && isValidUrl(debouncedVideoUrl) && !isResolving && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.Fragment, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_components_Thumbnails_Thumbnails_js__WEBPACK_IMPORTED_MODULE_6__["default"], {
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
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_components_VideoSettings_VideoSettings__WEBPACK_IMPORTED_MODULE_4__["default"], {
            attributes: singleAttributes,
            setAttributes: newAttrs => setSingleAttributes(prev => ({
              ...prev,
              ...newAttrs
            })),
            options: options,
            isProbing: isProbing,
            probedMetadata: effectiveMetadata
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_components_AdditionalFormats_AdditionalFormats_js__WEBPACK_IMPORTED_MODULE_7__["default"], {
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
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
          className: "videopack-insert-button-wrapper",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
            variant: "primary",
            onClick: () => onInsert('single'),
            disabled: !videoUrl || !isValidUrl(videoUrl),
            children: editAttributes.tinymce_edit ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Update', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Insert into Post', 'video-embed-thumbnail-generator')
          })
        })]
      }), activeTab === 'gallery' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.Fragment, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_components_InspectorControls_CollectionSettingsPanel__WEBPACK_IMPORTED_MODULE_5__["default"], {
          attributes: galleryAttributes,
          setAttributes: newAttrs => setGalleryAttributes(prev => ({
            ...prev,
            ...newAttrs
          })),
          queryData: queryData,
          options: normalizedOptions,
          showGalleryOptions: true
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
          className: "videopack-insert-button-wrapper",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
            variant: "primary",
            onClick: () => onInsert('gallery'),
            children: editAttributes.tinymce_edit ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Update', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Insert into Post', 'video-embed-thumbnail-generator')
          })
        })]
      }), activeTab === 'list' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.Fragment, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_components_InspectorControls_CollectionSettingsPanel__WEBPACK_IMPORTED_MODULE_5__["default"], {
          attributes: listAttributes,
          setAttributes: newAttrs => setListAttributes(prev => ({
            ...prev,
            ...newAttrs
          })),
          queryData: queryData,
          options: normalizedOptions,
          showGalleryOptions: false
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
          className: "videopack-insert-button-wrapper",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
            variant: "primary",
            onClick: () => onInsert('list'),
            children: editAttributes.tinymce_edit ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Update', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Insert into Post', 'video-embed-thumbnail-generator')
          })
        })]
      })]
    })
  });
}

/***/ },

/***/ "./src/hooks/useVideoData.js"
/*!***********************************!*\
  !*** ./src/hooks/useVideoData.js ***!
  \***********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useVideoData: () => (/* binding */ useVideoData)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
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
  const [videoData, setVideoData] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)({
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
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
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
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
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
        error: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Could not find the video attachment.', 'video-embed-thumbnail-generator'),
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

/***/ },

/***/ "./src/features/classic-embed/classic-embed.scss"
/*!*******************************************************!*\
  !*** ./src/features/classic-embed/classic-embed.scss ***!
  \*******************************************************/
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
/******/ 			"classic-embed": 0
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
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["videopack-shared"], () => (__webpack_require__("./src/features/classic-embed/classic-embed.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=classic-embed.js.map