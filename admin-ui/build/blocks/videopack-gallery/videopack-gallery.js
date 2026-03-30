/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/blocks/videopack-gallery/GalleryBlock.js"
/*!******************************************************!*\
  !*** ./src/blocks/videopack-gallery/GalleryBlock.js ***!
  \******************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _components_Pagination_Pagination__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../components/Pagination/Pagination */ "./src/components/Pagination/Pagination.js");
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../utils/utils */ "./src/utils/utils.js");
/* harmony import */ var _components_VideoGallery_VideoGallery__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../components/VideoGallery/VideoGallery */ "./src/components/VideoGallery/VideoGallery.js");
/* harmony import */ var _hooks_useVideoQuery__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../hooks/useVideoQuery */ "./src/hooks/useVideoQuery.js");
/* harmony import */ var _components_InspectorControls_CollectionSettingsPanel__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../components/InspectorControls/CollectionSettingsPanel */ "./src/components/InspectorControls/CollectionSettingsPanel.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__);











const NOOP = () => {};

/**
 * GalleryBlock component for rendering a video gallery within the editor.
 *
 * @param {Object}   props                 Component props.
 * @param {Object}   props.attributes      Block attributes.
 * @param {Function} props.setAttributes   Function to update block attributes.
 * @param {Array}    props.videoChildren   List of video attachment records.
 * @param {Object}   props.options         Global plugin options.
 * @param {number}   props.previewPostId   ID of the post being previewed.
 * @param {boolean}  props.isSelected      Whether the block is selected.
 * @param {number}   props.currentPage     Current page number.
 * @param {Function} props.setCurrentPage  Function to set current page.
 * @param {number}   props.totalPages      Total number of pages.
 * @return {Object} The rendered component.
 */
const GalleryBlock = ({
  attributes,
  setAttributes,
  videoChildren,
  options,
  previewPostId,
  isSelected,
  currentPage,
  setCurrentPage,
  totalPages
}) => {
  const {
    isSiteEditor
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_3__.useSelect)(select => {
    const editor = select('core/editor');
    const postType = editor?.getCurrentPostType();
    return {
      isSiteEditor: postType === 'wp_template' || postType === 'wp_template_part'
    };
  }, []);
  const [fetchedOptions, setFetchedOptions] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(null);
  const effectiveOptions = options || fetchedOptions;
  const [showOverlay, setShowOverlay] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(!isSelected);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useEffect)(() => {
    setShowOverlay(!isSelected);
  }, [isSelected]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useEffect)(() => {
    if (!options) {
      (0,_utils_utils__WEBPACK_IMPORTED_MODULE_6__.getSettings)().then(settings => {
        setFetchedOptions(settings);
      });
    }
  }, [options]);
  const queryData = (0,_hooks_useVideoQuery__WEBPACK_IMPORTED_MODULE_8__["default"])(attributes, previewPostId);
  const handleRemoveItem = attachmentIdToRemove => {
    const currentExclude = attributes.gallery_exclude ? attributes.gallery_exclude.split(',').map(id => parseInt(id.trim(), 10)) : [];
    if (!currentExclude.includes(attachmentIdToRemove)) {
      currentExclude.push(attachmentIdToRemove);
    }
    const newGalleryExclude = currentExclude.join(',');
    const currentInclude = attributes.gallery_include ? attributes.gallery_include.split(',').map(id => parseInt(id.trim(), 10)) : [];
    const newGalleryInclude = currentInclude.filter(id => id !== attachmentIdToRemove).join(',');
    setAttributes({
      gallery_exclude: newGalleryExclude,
      gallery_include: newGalleryInclude
    });
  };
  const handleEditItem = (oldAttachmentId, newAttachment, currentVideos) => {
    let includeIds = [];
    if (attributes.gallery_include) {
      includeIds = attributes.gallery_include.split(',');
    } else {
      includeIds = currentVideos.map(video => video.attachment_id.toString());
    }
    const newGalleryInclude = includeIds.map(id => parseInt(id.trim(), 10) === oldAttachmentId ? newAttachment.id.toString() : id).join(',');
    setAttributes({
      gallery_include: newGalleryInclude,
      gallery_orderby: 'include'
    });
  };
  const effectiveTitleColor = attributes.title_color || effectiveOptions && effectiveOptions.title_color;
  const effectiveTitleBgColor = attributes.title_background_color || effectiveOptions && effectiveOptions.title_background_color;
  const effectivePlayButtonColor = attributes.play_button_color || effectiveOptions && effectiveOptions.play_button_color;
  const effectivePlayButtonIconColor = attributes.play_button_icon_color || effectiveOptions && effectiveOptions.play_button_icon_color;
  const effectiveControlBarBgColor = attributes.control_bar_bg_color || effectiveOptions && effectiveOptions.control_bar_bg_color;
  const effectiveControlBarColor = attributes.control_bar_color || effectiveOptions && effectiveOptions.control_bar_color;
  const effectivePaginationColor = attributes.pagination_color || effectiveOptions && effectiveOptions.pagination_color;
  const effectivePaginationBg = attributes.pagination_background_color || effectiveOptions && effectiveOptions.pagination_background_color;
  const effectivePaginationActiveBg = attributes.pagination_active_bg_color || effectiveOptions && effectiveOptions.pagination_active_bg_color;
  const effectivePaginationActiveColor = attributes.pagination_active_color || effectiveOptions && effectiveOptions.pagination_active_color;
  const effectiveAttributes = {
    ...attributes,
    gallery_id: queryData.effectiveGalleryId,
    play_button_color: effectivePlayButtonColor,
    play_button_icon_color: effectivePlayButtonIconColor,
    control_bar_color: effectiveControlBarColor,
    control_bar_bg_color: effectiveControlBarBgColor,
    title_color: effectiveTitleColor,
    title_background_color: effectiveTitleBgColor,
    pagination_color: effectivePaginationColor,
    pagination_background_color: effectivePaginationBg,
    pagination_active_color: effectivePaginationActiveColor,
    pagination_active_bg_color: effectivePaginationActiveBg
  };
  const customStyles = {};
  if (effectiveTitleColor) {
    customStyles['--videopack-title-color'] = effectiveTitleColor;
  }
  if (effectiveTitleBgColor) {
    customStyles['--videopack-title-background-color'] = effectiveTitleBgColor;
  }
  if (effectivePlayButtonColor) {
    customStyles['--videopack-play-button-color'] = effectivePlayButtonColor;
  }
  if (effectivePlayButtonIconColor) {
    customStyles['--videopack-play-button-icon-color'] = effectivePlayButtonIconColor;
  }
  if (effectiveControlBarBgColor) {
    customStyles['--videopack-control-bar-bg-color'] = effectiveControlBarBgColor;
  }
  if (effectiveControlBarColor) {
    customStyles['--videopack-control-bar-color'] = effectiveControlBarColor;
  }
  if (effectivePaginationColor) {
    customStyles['--videopack-pagination-color'] = effectivePaginationColor;
  }
  if (effectivePaginationBg) {
    customStyles['--videopack-pagination-bg'] = effectivePaginationBg;
  }
  if (effectivePaginationActiveBg) {
    customStyles['--videopack-pagination-active-bg'] = effectivePaginationActiveBg;
  }
  if (effectivePaginationActiveColor) {
    customStyles['--videopack-pagination-active-color'] = effectivePaginationActiveColor;
  }
  const blockProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__.useBlockProps)({
    style: customStyles
  });
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__.InspectorControls, {
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_components_InspectorControls_CollectionSettingsPanel__WEBPACK_IMPORTED_MODULE_9__["default"], {
        attributes: attributes,
        setAttributes: setAttributes,
        queryData: queryData,
        options: effectiveOptions,
        showGalleryOptions: true,
        isSiteEditor: isSiteEditor,
        blockType: "gallery"
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
      ...blockProps,
      onDragStart: e => e.stopPropagation(),
      children: [isSiteEditor && attributes.gallery_source !== 'manual' && !attributes.gallery_id && !attributes.gallery_include ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Placeholder, {
        icon: "format-video",
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Dynamic Videopack Gallery', 'video-embed-thumbnail-generator'),
        instructions: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('This gallery is currently configured to show videos dynamically based on the current post or archive. To select specific videos instead, use the options in the sidebar.', 'video-embed-thumbnail-generator')
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_components_VideoGallery_VideoGallery__WEBPACK_IMPORTED_MODULE_7__["default"], {
        attributes: effectiveAttributes,
        videoChildren: videoChildren,
        setAttributes: setAttributes,
        isEditing: true,
        onRemoveItem: handleRemoveItem,
        onEditItem: handleEditItem,
        galleryPage: currentPage,
        setGalleryPage: setCurrentPage,
        totalPages: totalPages,
        setTotalPages: NOOP // totalPages comes from edit.js useSelect
      }), attributes.gallery_pagination && totalPages > 1 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_components_Pagination_Pagination__WEBPACK_IMPORTED_MODULE_5__["default"], {
        currentPage: currentPage,
        totalPages: totalPages,
        onPageChange: setCurrentPage
      }), showOverlay && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
        className: "videopack-block-overlay"
      })]
    })]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (GalleryBlock);

/***/ },

/***/ "./src/blocks/videopack-gallery/edit.js"
/*!**********************************************!*\
  !*** ./src/blocks/videopack-gallery/edit.js ***!
  \**********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Edit)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _wordpress_notices__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/notices */ "@wordpress/notices");
/* harmony import */ var _wordpress_notices__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_notices__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/media.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/pencil.mjs");
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../utils/utils */ "./src/utils/utils.js");
/* harmony import */ var _assets_icon__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../assets/icon */ "./src/assets/icon.js");
/* harmony import */ var _GalleryBlock__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./GalleryBlock */ "./src/blocks/videopack-gallery/GalleryBlock.js");
/* harmony import */ var _editor_scss__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./editor.scss */ "./src/blocks/videopack-gallery/editor.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__);












function Edit({
  attributes,
  setAttributes,
  context,
  isSelected
}) {
  const ALLOWED_MEDIA_TYPES = ['video'];
  const [currentPage, setCurrentPage] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(1);
  const [options, setOptions] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)();
  const blockProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.useBlockProps)();
  const {
    createErrorNotice
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_4__.useDispatch)(_wordpress_notices__WEBPACK_IMPORTED_MODULE_5__.store);
  const {
    editorPostId,
    isArchiveTemplate
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_4__.useSelect)(select => {
    const editor = select('core/editor');
    const post = editor?.getCurrentPost();
    return {
      editorPostId: editor?.getCurrentPostId(),
      isArchiveTemplate: post?.type === 'wp_template' && (post?.slug?.includes('archive') || post?.slug?.includes('category') || post?.slug?.includes('tag') || post?.slug?.includes('taxonomy'))
    };
  }, []);
  const postId = context.postId || editorPostId;
  const {
    gallery_include,
    gallery_id,
    gallery_source,
    gallery_order,
    gallery_orderby,
    gallery_pagination,
    gallery_per_page,
    collection_video_limit,
    enable_collection_video_limit,
    gallery_category,
    gallery_tag
  } = attributes;
  const videoChildren = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_4__.useSelect)(select => {
    const query = {
      media_type: 'video',
      order: gallery_order,
      status: 'inherit'
    };
    if (gallery_orderby && gallery_orderby !== 'menu_order') {
      query.orderby = gallery_orderby;
    }
    if (gallery_pagination) {
      query.page = currentPage;
      query.per_page = gallery_per_page || 10;
    } else if (enable_collection_video_limit) {
      query.per_page = collection_video_limit && collection_video_limit !== -1 ? collection_video_limit : 10;
    } else {
      query.per_page = 10;
    }
    if (gallery_source === 'manual' && gallery_include) {
      query.include = gallery_include.split(',').map(Number);
    } else if (gallery_source === 'category' && gallery_category) {
      query.categories = gallery_category.split(',').map(Number);
    } else if (gallery_source === 'tag' && gallery_tag) {
      query.tags = gallery_tag.split(',').map(Number);
    } else if ((gallery_source === 'current' || gallery_source === 'archive') && postId && !isNaN(Number(postId))) {
      query.parent = postId;
    } else if (gallery_id && !isNaN(Number(gallery_id))) {
      query.parent = gallery_id;
    } else if (gallery_source === 'manual') {
      return null;
    }
    if (gallery_pagination) {
      query.page = currentPage;
    }
    const records = select('core').getEntityRecords('postType', 'attachment', query);
    return {
      videoChildren: records,
      totalPages: select('core').getEntityRecordsTotalPages('postType', 'attachment', query) || 0
    };
  }, [postId, gallery_include, gallery_id, gallery_source, gallery_order, gallery_orderby, gallery_pagination, gallery_per_page, collection_video_limit, enable_collection_video_limit, gallery_category, gallery_tag, currentPage]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useEffect)(() => {
    (0,_utils_utils__WEBPACK_IMPORTED_MODULE_8__.getSettings)().then(response => {
      setOptions(response);
    });
  }, []);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useEffect)(() => {
    if (isArchiveTemplate && gallery_source === 'current') {
      setAttributes({
        gallery_source: 'archive'
      });
    }
  }, [isArchiveTemplate, gallery_source, setAttributes]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useEffect)(() => {
    if (options) {
      const newAttributes = {};
      const settingsToSync = ['gallery_columns', 'gallery_order', 'gallery_orderby', 'gallery_pagination', 'gallery_per_page', 'gallery_title', 'gallery_end', 'skin'];
      settingsToSync.forEach(setting => {
        if (attributes[setting] === undefined && options[setting] !== undefined) {
          newAttributes[setting] = options[setting];
        }
      });
      if (attributes.align === undefined && options.gallery_align !== undefined) {
        newAttributes.align = options.gallery_align;
      }
      if (Object.keys(newAttributes).length > 0) {
        setAttributes(newAttributes);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);
  function setAttributesFromMedia(media) {
    const includeIds = media.map(item => item.id).join(',');
    setAttributes({
      gallery: true,
      gallery_include: includeIds
    });
  }
  function onSelectVideo(media) {
    const mediaArray = Array.isArray(media) ? media : [media];
    if (!mediaArray || !mediaArray.some(item => item.hasOwnProperty('url'))) {
      setAttributes({
        gallery_include: undefined,
        gallery_id: undefined
      });
      return;
    }
    setAttributesFromMedia(mediaArray);
  }
  function onAddVideos(media) {
    const mediaArray = Array.isArray(media) ? media : [media];
    const newIncludeIds = mediaArray.map(item => item.id.toString());
    let currentInclude = [];
    if (gallery_include) {
      currentInclude = gallery_include.split(',');
    } else if (videoChildren) {
      currentInclude = videoChildren.map(video => video.id.toString());
    }
    const combinedInclude = [...new Set([...currentInclude, ...newIncludeIds])].join(',');
    setAttributes({
      gallery: true,
      gallery_include: combinedInclude,
      gallery_source: 'manual'
    });
  }
  function onEditGallery(media) {
    const mediaArray = Array.isArray(media) ? media : [media];
    const newIncludeIds = mediaArray.map(item => item.id.toString()).join(',');
    setAttributes({
      gallery_include: newIncludeIds
    });
  }
  function onInsertCollection() {
    setAttributes({
      gallery: true
    });
  }
  function onUploadError(message) {
    createErrorNotice(message, {
      type: 'snackbar'
    });
  }
  const placeholder = content => {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Placeholder, {
      className: "block-editor-media-placeholder",
      withIllustration: true,
      icon: _assets_icon__WEBPACK_IMPORTED_MODULE_9__.videopack,
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Videopack Video Gallery', 'video-embed-thumbnail-generator'),
      instructions: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Select video files to create a gallery.', 'video-embed-thumbnail-generator'),
      children: [content, /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        __next40pxDefaultSize: true,
        className: "videopack-placeholder-gallery-button",
        variant: "secondary",
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Insert a collection of all videos uploaded to this post'),
        showTooltip: true,
        onClick: onInsertCollection,
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)("This post's videos", 'video-embed-thumbnail-generator')
      })]
    });
  };
  if (!gallery_id && !gallery_include && !postId) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
      ...blockProps,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.MediaPlaceholder, {
        icon: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.BlockIcon, {
          icon: _assets_icon__WEBPACK_IMPORTED_MODULE_9__.videopack
        }),
        onSelect: onSelectVideo,
        accept: "video/*",
        allowedTypes: ALLOWED_MEDIA_TYPES,
        value: attributes,
        onError: onUploadError,
        placeholder: placeholder,
        multiple: true
      })
    });
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.BlockControls, {
      group: "other",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToolbarGroup, {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.MediaUploadCheck, {
          children: gallery_source === 'manual' ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.MediaUpload, {
            onSelect: onEditGallery,
            allowedTypes: ALLOWED_MEDIA_TYPES,
            multiple: "add",
            value: gallery_include ? gallery_include.split(',').map(Number) : [],
            render: ({
              open
            }) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToolbarButton, {
              icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_7__["default"],
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Edit Gallery', 'video-embed-thumbnail-generator'),
              onClick: open
            })
          }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.MediaUpload, {
            onSelect: onAddVideos,
            allowedTypes: ALLOWED_MEDIA_TYPES,
            multiple: "add",
            render: ({
              open
            }) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToolbarButton, {
              icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_6__["default"],
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Media Library', 'video-embed-thumbnail-generator'),
              onClick: open
            })
          })
        })
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_GalleryBlock__WEBPACK_IMPORTED_MODULE_10__["default"], {
      setAttributes: setAttributes,
      attributes: attributes,
      options: options,
      videoChildren: videoChildren?.videoChildren,
      previewPostId: postId,
      isSelected: isSelected,
      currentPage: currentPage,
      setCurrentPage: setCurrentPage,
      totalPages: videoChildren?.totalPages
    })]
  });
}

/***/ },

/***/ "./src/blocks/videopack-gallery/index.js"
/*!***********************************************!*\
  !*** ./src/blocks/videopack-gallery/index.js ***!
  \***********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/blocks */ "@wordpress/blocks");
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _edit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./edit */ "./src/blocks/videopack-gallery/edit.js");
/* harmony import */ var _save__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./save */ "./src/blocks/videopack-gallery/save.js");
/* harmony import */ var _block_json__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./block.json */ "./src/blocks/videopack-gallery/block.json");
/* harmony import */ var _assets_icon__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../assets/icon */ "./src/assets/icon.js");
/**
 * Main entry point for the Videopack Gallery block.
 */






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

/***/ "./src/blocks/videopack-gallery/save.js"
/*!**********************************************!*\
  !*** ./src/blocks/videopack-gallery/save.js ***!
  \**********************************************/
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

/***/ "./src/blocks/videopack-gallery/editor.scss"
/*!**************************************************!*\
  !*** ./src/blocks/videopack-gallery/editor.scss ***!
  \**************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "react"
/*!************************!*\
  !*** external "React" ***!
  \************************/
(module) {

module.exports = window["React"];

/***/ },

/***/ "react-dom"
/*!***************************!*\
  !*** external "ReactDOM" ***!
  \***************************/
(module) {

module.exports = window["ReactDOM"];

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

/***/ "./src/blocks/videopack-gallery/block.json"
/*!*************************************************!*\
  !*** ./src/blocks/videopack-gallery/block.json ***!
  \*************************************************/
(module) {

module.exports = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"videopack/videopack-gallery","title":"Videopack Video Gallery","category":"media","icon":"format-video","description":"Display a dynamically-generated pop-up gallery of Videopack videos.","supports":{"html":false,"align":["left","right","center","wide","full"],"filter":{"duotone":true}},"selectors":{"filter":{"duotone":".wp-block-videopack-videopack-gallery .videopack-gallery-wrapper .videopack-gallery-items img"}},"attributes":{"gallery":{"type":"boolean","default":true},"gallery_id":{"type":"number","default":0},"gallery_source":{"type":"string","default":"current"},"gallery_category":{"type":"string","default":""},"gallery_tag":{"type":"string","default":""},"gallery_orderby":{"type":"string","default":"menu_order"},"gallery_order":{"type":"string","default":"asc"},"gallery_include":{"type":"string","default":""},"gallery_exclude":{"type":"string","default":""},"gallery_end":{"type":"string","default":""},"gallery_pagination":{"type":"boolean","default":false},"gallery_per_page":{"type":"number","default":6},"gallery_title":{"type":"boolean","default":true},"gallery_columns":{"type":"number","default":3},"collection_video_limit":{"type":"number","default":-1},"enable_collection_video_limit":{"type":"boolean","default":false},"pagination_color":{"type":"string"},"pagination_background_color":{"type":"string"},"pagination_active_bg_color":{"type":"string"},"pagination_active_color":{"type":"string"},"play_button_color":{"type":"string"},"play_button_icon_color":{"type":"string"},"control_bar_bg_color":{"type":"string"},"control_bar_color":{"type":"string"},"title_background_color":{"type":"string"}},"usesContext":["postId"],"example":{"attributes":{"gallery_columns":2,"gallery_pagination":false}},"textdomain":"video-embed-thumbnail-generator","editorScript":["file:./videopack-gallery.js"],"style":["file:./videopack-gallery.css"]}');

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
/******/ 			"blocks/videopack-gallery/videopack-gallery": 0
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
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["videopack-dndkit","videopack-videoplayer","videopack-videogallery","videopack-shared"], () => (__webpack_require__("./src/blocks/videopack-gallery/index.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=videopack-gallery.js.map