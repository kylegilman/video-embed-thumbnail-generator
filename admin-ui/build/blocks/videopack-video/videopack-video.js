/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/blocks/videopack-video/SingleVideoBlock.js"
/*!********************************************************!*\
  !*** ./src/blocks/videopack-video/SingleVideoBlock.js ***!
  \********************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _components_VideoSettings_VideoSettings_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../components/VideoSettings/VideoSettings.js */ "./src/components/VideoSettings/VideoSettings.js");
/* harmony import */ var _components_Thumbnails_Thumbnails_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../components/Thumbnails/Thumbnails.js */ "./src/components/Thumbnails/Thumbnails.js");
/* harmony import */ var _components_AdditionalFormats_AdditionalFormats_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../components/AdditionalFormats/AdditionalFormats.js */ "./src/components/AdditionalFormats/AdditionalFormats.js");
/* harmony import */ var _components_VideoPlayer_VideoPlayer_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../components/VideoPlayer/VideoPlayer.js */ "./src/components/VideoPlayer/VideoPlayer.js");
/* harmony import */ var _hooks_useVideoProbe_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../hooks/useVideoProbe.js */ "./src/hooks/useVideoProbe.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__);









/**
 * SingleVideoBlock component for rendering a single video within the editor.
 *
 * @param {Object}   props                      Component props.
 * @param {Function} props.setAttributes        Function to update block attributes.
 * @param {Object}   props.attributes           Block attributes.
 * @param {Object}   props.options              Global plugin options.
 * @param {boolean}  props.isSelected           Whether the block is selected.
 * @param {Object}   props.externalSourceGroups External video sources if not in library.
 * @param {Object}   props.videoData            Video attachment data and state.
 * @return {Object}                             The rendered component.
 */

const SingleVideoBlock = ({
  setAttributes,
  attributes,
  options,
  isSelected,
  externalSourceGroups,
  videoData
}) => {
  const {
    src
  } = attributes;
  const [showOverlay, setShowOverlay] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(!isSelected);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    setShowOverlay(!isSelected);
  }, [isSelected]);
  const {
    record: attachment
  } = videoData;
  const postId = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => select('core/editor')?.getCurrentPostId(), []);
  const {
    isProbing,
    probedMetadata
  } = (0,_hooks_useVideoProbe_js__WEBPACK_IMPORTED_MODULE_7__["default"])(src);
  const [probedMetadataOverride, setProbedMetadataOverride] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(null);

  // Sync metadata from attachment records when it loads
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (attachment?.media_details && !probedMetadata) {
      const {
        width,
        height,
        duration
      } = attachment.media_details;
      setProbedMetadataOverride({
        width,
        height,
        duration,
        isTainted: false // Internal media is never tainted
      });
    } else if (!src) {
      setProbedMetadataOverride(null);
    }
  }, [attachment, probedMetadata, src]);
  const effectiveMetadata = probedMetadataOverride || probedMetadata;
  const playerAttributes = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    const newPlayerAttributes = {
      ...options,
      ...attributes
    };
    if (attachment && attachment.videopack?.sources) {
      newPlayerAttributes.sources = attachment.videopack.sources;
      newPlayerAttributes.source_groups = attachment.videopack.source_groups;

      // Pull width/height from attachment if not explicitly overridden in attributes
      if (!attributes.width && attachment.media_details?.width) {
        newPlayerAttributes.width = attachment.media_details.width;
      }
      if (!attributes.height && attachment.media_details?.height) {
        newPlayerAttributes.height = attachment.media_details.height;
      }
    } else if (src) {
      newPlayerAttributes.source_groups = externalSourceGroups || {};
      if (!externalSourceGroups || Object.keys(externalSourceGroups).length === 0) {
        newPlayerAttributes.sources = [{
          src
        }];
      }
    }
    return newPlayerAttributes;
  }, [options, attributes, attachment, externalSourceGroups, src]);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.InspectorControls, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_components_Thumbnails_Thumbnails_js__WEBPACK_IMPORTED_MODULE_4__["default"], {
        setAttributes: setAttributes,
        attributes: attributes,
        videoData: videoData,
        options: options,
        parentId: postId || 0,
        isProbing: isProbing,
        probedMetadata: effectiveMetadata
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_components_VideoSettings_VideoSettings_js__WEBPACK_IMPORTED_MODULE_3__["default"], {
        setAttributes: setAttributes,
        attributes: attributes,
        options: options,
        isProbing: isProbing,
        probedMetadata: effectiveMetadata,
        fallbackTitle: attachment?.title?.rendered || '',
        fallbackCaption: attachment?.caption?.rendered || ''
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_components_AdditionalFormats_AdditionalFormats_js__WEBPACK_IMPORTED_MODULE_5__["default"], {
        attributes: attributes,
        options: options,
        isProbing: isProbing,
        probedMetadata: effectiveMetadata
      }, attributes.id || src)]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
      ...(0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.useBlockProps)(),
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_components_VideoPlayer_VideoPlayer_js__WEBPACK_IMPORTED_MODULE_6__["default"], {
        attributes: playerAttributes
      }), showOverlay && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("div", {
        className: "videopack-block-overlay"
      })]
    })]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SingleVideoBlock);

/***/ },

/***/ "./src/blocks/videopack-video/edit.js"
/*!********************************************!*\
  !*** ./src/blocks/videopack-video/edit.js ***!
  \********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_blob__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/blob */ "@wordpress/blob");
/* harmony import */ var _wordpress_blob__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blob__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _wordpress_notices__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @wordpress/notices */ "@wordpress/notices");
/* harmony import */ var _wordpress_notices__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_wordpress_notices__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../utils/utils */ "./src/utils/utils.js");
/* harmony import */ var _assets_icon__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../assets/icon */ "./src/assets/icon.js");
/* harmony import */ var _SingleVideoBlock__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./SingleVideoBlock */ "./src/blocks/videopack-video/SingleVideoBlock.js");
/* harmony import */ var _editor_scss__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./editor.scss */ "./src/blocks/videopack-video/editor.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__);
/* global videopack_config */













const ALLOWED_MEDIA_TYPES = ['video'];

/**
 * Edit component for the Videopack Video block.
 *
 * @param {Object}   props               Component props.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Function to update block attributes.
 * @param {boolean}  props.isSelected    Whether the block is currently selected.
 * @return {Object}                      The rendered component.
 */
const Edit = ({
  attributes,
  setAttributes,
  isSelected
}) => {
  const {
    id,
    src
  } = attributes;
  const [options, setOptions] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)();
  const [externalSourceGroups, setExternalSourceGroups] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(null);
  const blockProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.useBlockProps)();
  const hasAttemptedInitialUpload = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useRef)(false);
  const {
    createErrorNotice
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_5__.useDispatch)(_wordpress_notices__WEBPACK_IMPORTED_MODULE_6__.store);
  const {
    mediaUpload,
    isSiteEditor
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_5__.useSelect)(select => {
    const editorStore = select(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.store);
    const editor = select('core/editor');
    const postType = editor?.getCurrentPostType();
    return {
      mediaUpload: editorStore.getSettings()?.mediaUpload,
      isSiteEditor: postType === 'wp_template' || postType === 'wp_template_part'
    };
  }, []);
  const [attachment, setAttachment] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(null);
  const [hasResolved, setHasResolved] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(false);
  const videoData = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useMemo)(() => ({
    record: attachment,
    hasResolved
  }), [attachment, hasResolved]);
  const attributesRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useRef)(attributes);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    attributesRef.current = attributes;
  }, [attributes]);
  const setAttributesFromMedia = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useCallback)(attachmentObject => {
    const media_attributes = {
      src: attachmentObject.source_url || attachmentObject.url,
      id: attachmentObject.id,
      poster: attachmentObject.meta?.['_videopack-meta']?.poster,
      total_thumbnails: attachmentObject.meta?.['_videopack-meta']?.total_thumbnails,
      featured: attachmentObject.meta?.['_videopack-meta']?.featured,
      title: attachmentObject.title?.raw ?? attachmentObject.title?.rendered,
      caption: attachmentObject.caption?.raw ?? attachmentObject.caption?.rendered,
      starts: attachmentObject.meta?.['_videopack-meta']?.starts,
      text_tracks: attachmentObject.meta?.['_videopack-meta']?.track || attachmentObject.meta?.['_videopack-meta']?.tracks || attachmentObject.meta?.track || attachmentObject.meta?.tracks || [],
      embedlink: attachmentObject.link ? attachmentObject.link + 'embed' : undefined,
      width: attachmentObject.media_details?.width,
      height: attachmentObject.media_details?.height
    };
    const updatedAttributes = Object.keys(media_attributes).reduce((acc, key) => {
      if (media_attributes[key] !== undefined && media_attributes[key] !== null && media_attributes[key] !== attributesRef.current[key]) {
        acc[key] = media_attributes[key];
      }
      return acc;
    }, {});
    if (Object.keys(updatedAttributes).length > 0) {
      setAttributes(updatedAttributes);
    }
  }, [setAttributes]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    if (id && typeof id === 'number') {
      setHasResolved(false);
      _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_7___default()({
        path: `/wp/v2/media/${id}?context=edit`
      }).then(record => {
        setAttachment(record);
        setHasResolved(true);
        setAttributesFromMedia(record);
      }).catch(error => {
        setAttachment(null);
        setHasResolved(true);
        if (error.status === 404 || error.status === 403) {
          setAttributes({
            id: undefined,
            src: undefined,
            poster: undefined,
            title: undefined,
            caption: undefined
          });
        }
      });
    } else {
      setAttachment(null);
      setHasResolved(false);
    }
  }, [id, setAttributesFromMedia, setAttributes]);
  const onUploadError = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useCallback)(message => {
    createErrorNotice(message, {
      type: 'snackbar'
    });
  }, [createErrorNotice]);
  const onSelectVideo = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useCallback)(video => {
    const videoArray = Array.isArray(video) ? video : [video];
    if (!videoArray || !videoArray.some(item => item.hasOwnProperty('url'))) {
      setAttributes({
        src: undefined,
        id: undefined,
        poster: undefined
      });
      return;
    }
    if (videoArray.length === 1) {
      if ((0,_wordpress_blob__WEBPACK_IMPORTED_MODULE_0__.isBlobURL)(videoArray[0].url)) {
        hasAttemptedInitialUpload.current = true;
      }
      setAttributesFromMedia(videoArray[0]);
    }
  }, [setAttributesFromMedia, setAttributes]);
  const onSelectURL = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useCallback)(newSrc => {
    if (newSrc !== src) {
      let filename = newSrc.split('?')[0].split('#')[0];
      filename = filename.split('/').pop();
      if (filename.includes('.')) {
        filename = filename.substring(0, filename.lastIndexOf('.'));
      }
      try {
        filename = decodeURIComponent(filename);
      } catch (e) {
        // Ignore decoding errors
      }
      setAttributes({
        src: newSrc,
        id: undefined,
        title: filename,
        caption: '',
        poster: '',
        starts: undefined,
        embedlink: ''
      });
    }
  }, [src, setAttributes]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    (0,_utils_utils__WEBPACK_IMPORTED_MODULE_8__.getSettings)().then(response => {
      setOptions(response);
    });
    if (!hasAttemptedInitialUpload.current && !id && (0,_wordpress_blob__WEBPACK_IMPORTED_MODULE_0__.isBlobURL)(src)) {
      hasAttemptedInitialUpload.current = true;
      const file = (0,_wordpress_blob__WEBPACK_IMPORTED_MODULE_0__.getBlobByURL)(src);
      if (file) {
        mediaUpload({
          filesList: [file],
          onFileChange: ([videoFile]) => onSelectVideo(videoFile),
          onError: onUploadError,
          allowedTypes: ALLOWED_MEDIA_TYPES
        });
      }
    }
  }, [id, src, mediaUpload, onSelectVideo, onUploadError]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    if (src === 'videopack-preview-video') {
      setAttributes({
        src: videopack_config.url + '/src/images/Adobestock_469037984.mp4'
      });
    } else if (!id && src && src !== 'videopack-preview-video' && !(0,_wordpress_blob__WEBPACK_IMPORTED_MODULE_0__.isBlobURL)(src)) {
      setExternalSourceGroups(null);
      _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_7___default()({
        path: `/videopack/v1/sources?url=${encodeURIComponent(src)}`
      }).then(data => {
        setExternalSourceGroups(data);
      }).catch(error => {
        console.error('Error fetching video sources:', error);
        setExternalSourceGroups({});
      });
    } else {
      setExternalSourceGroups(null);
    }
  }, [id, src, setAttributes]);
  const placeholder = content => {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Placeholder, {
      className: "block-editor-media-placeholder",
      withIllustration: true,
      icon: _assets_icon__WEBPACK_IMPORTED_MODULE_9__.videopack,
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Videopack Video', 'video-embed-thumbnail-generator'),
      instructions: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Upload a video file, pick one from your media library, or add one with a URL.'),
      children: content
    });
  };
  if (!src && !id) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
      ...blockProps,
      children: isSiteEditor ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.Fragment, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_SingleVideoBlock__WEBPACK_IMPORTED_MODULE_10__["default"], {
          setAttributes: setAttributes,
          attributes: attributes,
          options: options,
          isSelected: isSelected,
          externalSourceGroups: externalSourceGroups,
          videoData: videoData
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Placeholder, {
          icon: _assets_icon__WEBPACK_IMPORTED_MODULE_9__.videopack,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Dynamic Videopack Video', 'video-embed-thumbnail-generator'),
          instructions: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('This block is currently configured to show the most recent video from the current post. To select a specific video instead, use the options below.', 'video-embed-thumbnail-generator'),
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.MediaPlaceholder, {
            onSelect: onSelectVideo,
            onSelectURL: onSelectURL,
            accept: "video/*",
            allowedTypes: ALLOWED_MEDIA_TYPES,
            value: attributes,
            onError: onUploadError
          })
        })]
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.MediaPlaceholder, {
        icon: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.BlockIcon, {
          icon: _assets_icon__WEBPACK_IMPORTED_MODULE_9__.videopack
        }),
        onSelect: onSelectVideo,
        onSelectURL: onSelectURL,
        accept: "video/*",
        allowedTypes: ALLOWED_MEDIA_TYPES,
        value: attributes,
        onError: onUploadError,
        placeholder: placeholder
      })
    });
  }
  if (!id && src && (0,_wordpress_blob__WEBPACK_IMPORTED_MODULE_0__.isBlobURL)(src)) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
      ...blockProps,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("div", {
        className: "components-placeholder block-editor-media-placeholder is-large has-illustration",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("div", {
          className: "components-placeholder__label",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.BlockIcon, {
            icon: _assets_icon__WEBPACK_IMPORTED_MODULE_9__.videopack
          }), (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Videopack Video', 'video-embed-thumbnail-generator')]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
          className: "components-placeholder__fieldset",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("div", {
            className: "videopack-uploading-overlay-content",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("p", {
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Uploading…', 'video-embed-thumbnail-generator')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
              className: "videopack-progress-bar-container",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.ProgressBar, {})
            })]
          })
        })]
      })
    });
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.BlockControls, {
      group: "other",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.MediaReplaceFlow, {
        mediaId: id,
        mediaURL: src,
        allowedTypes: ALLOWED_MEDIA_TYPES,
        accept: "video/*",
        onSelect: onSelectVideo,
        onSelectURL: onSelectURL,
        onError: onUploadError
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_SingleVideoBlock__WEBPACK_IMPORTED_MODULE_10__["default"], {
      setAttributes: setAttributes,
      attributes: attributes,
      options: options,
      isSelected: isSelected,
      externalSourceGroups: externalSourceGroups,
      videoData: videoData
    })]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Edit);

/***/ },

/***/ "./src/blocks/videopack-video/index.js"
/*!*********************************************!*\
  !*** ./src/blocks/videopack-video/index.js ***!
  \*********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/blocks */ "@wordpress/blocks");
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _edit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./edit */ "./src/blocks/videopack-video/edit.js");
/* harmony import */ var _save__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./save */ "./src/blocks/videopack-video/save.js");
/* harmony import */ var _block_json__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./block.json */ "./src/blocks/videopack-video/block.json");
/* harmony import */ var _assets_icon__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../assets/icon */ "./src/assets/icon.js");





(0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__.registerBlockType)(_block_json__WEBPACK_IMPORTED_MODULE_3__.name, {
  icon: _assets_icon__WEBPACK_IMPORTED_MODULE_4__.videopack,
  /**
   * @see ./edit.js
   */
  edit: _edit__WEBPACK_IMPORTED_MODULE_1__["default"],
  /**
   * @see ./save.js
   */
  save: _save__WEBPACK_IMPORTED_MODULE_2__["default"]
});

/***/ },

/***/ "./src/blocks/videopack-video/save.js"
/*!********************************************!*\
  !*** ./src/blocks/videopack-video/save.js ***!
  \********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ save)
/* harmony export */ });
/**
 * The save function defines the way in which the different attributes should
 * be combined into the final markup, which is then serialized by the block
 * editor into `post_content`.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/block-edit-save/#save
 *
 * @param {Object} props            The properties passed to the component.
 * @param {Object} props.attributes The block attributes.
 * @return {WPElement} Element to render.
 */
function save({
  attributes
}) {
  // Returning null because this is a dynamic block.
  // The view is rendered on the server via a render_callback in PHP.
  return null;
}

/***/ },

/***/ "./src/blocks/videopack-video/editor.scss"
/*!************************************************!*\
  !*** ./src/blocks/videopack-video/editor.scss ***!
  \************************************************/
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

/***/ "@wordpress/blob"
/*!******************************!*\
  !*** external ["wp","blob"] ***!
  \******************************/
(module) {

module.exports = window["wp"]["blob"];

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

/***/ "@wordpress/notices"
/*!*********************************!*\
  !*** external ["wp","notices"] ***!
  \*********************************/
(module) {

module.exports = window["wp"]["notices"];

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

/***/ "./src/blocks/videopack-video/block.json"
/*!***********************************************!*\
  !*** ./src/blocks/videopack-video/block.json ***!
  \***********************************************/
(module) {

module.exports = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"videopack/videopack-video","title":"Videopack Video Player","category":"media","icon":"format-video","description":"Embed a single video with Videopack features.","supports":{"html":false,"align":true,"dimensions":{"aspectRatio":true,"height":true,"minHeight":true,"width":true},"spacing":{"margin":true,"padding":true},"filter":{"duotone":true}},"selectors":{"filter":{"duotone":".wp-block-videopack-videopack-video .videopack-wrapper .vjs-poster img, .wp-block-videopack-videopack-video .videopack-wrapper .mejs-poster"}},"example":{"attributes":{"src":"videopack-preview-video","title":"Sample Video","overlay_title":true}},"textdomain":"video-embed-thumbnail-generator","editorScript":["file:./videopack-video.js"],"style":["file:./videopack-video.css"]}');

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
/******/ 			"blocks/videopack-video/videopack-video": 0
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
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["videopack-videoplayer","videopack-shared"], () => (__webpack_require__("./src/blocks/videopack-video/index.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=videopack-video.js.map