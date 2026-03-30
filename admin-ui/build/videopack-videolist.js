"use strict";
(globalThis["webpackChunkvideopack_admin"] = globalThis["webpackChunkvideopack_admin"] || []).push([["videopack-videolist"],{

/***/ "./src/components/VideoList/VideoList.js"
/*!***********************************************!*\
  !*** ./src/components/VideoList/VideoList.js ***!
  \***********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/utils */ "./src/utils/utils.js");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _dnd_kit_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @dnd-kit/core */ "./node_modules/@dnd-kit/core/dist/core.esm.js");
/* harmony import */ var _dnd_kit_sortable__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @dnd-kit/sortable */ "./node_modules/@dnd-kit/sortable/dist/sortable.esm.js");
/* harmony import */ var _VideoListItem__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./VideoListItem */ "./src/components/VideoList/VideoListItem.js");
/* harmony import */ var _VideoList_scss__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./VideoList.scss */ "./src/components/VideoList/VideoList.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__);
/**
 * A vertical list component for managing a collection of videos.
 */










const noop = () => {};

/**
 * VideoList component.
 *
 * @param {Object}   props               Component props.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Callback to update attributes.
 * @param {boolean}  props.isEditing     Whether the list is in editing mode.
 * @param {Object}   props.options       Plugin options.
 * @param {boolean}  props.isSelected    Whether the list is selected.
 * @param {Function} props.onRemoveItem  Callback to remove a video item.
 * @param {Function} props.onEditItem    Callback to edit a video item.
 * @param {number}   props.currentPage   The current page number.
 * @return {Object} The VideoList component.
 */
const VideoList = ({
  attributes,
  setAttributes = noop,
  isEditing = false,
  options = {},
  isSelected = false,
  onRemoveItem = noop,
  onEditItem = noop,
  currentPage = 1
}) => {
  const {
    gallery_id,
    gallery_pagination,
    gallery_per_page,
    gallery_orderby,
    gallery_order,
    gallery_include,
    gallery_exclude,
    gallery_source,
    gallery_category,
    gallery_tag,
    videos,
    collection_video_limit,
    title_color,
    title_background_color
  } = attributes;
  const [listVideos, setListVideos] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
  const [isLoading, setIsLoading] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(true);
  const [showOverlay, setShowOverlay] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(!isSelected);
  const [refreshTrigger, setRefreshTrigger] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(0);
  const sensors = (0,_dnd_kit_core__WEBPACK_IMPORTED_MODULE_4__.useSensors)((0,_dnd_kit_core__WEBPACK_IMPORTED_MODULE_4__.useSensor)(_dnd_kit_core__WEBPACK_IMPORTED_MODULE_4__.PointerSensor), (0,_dnd_kit_core__WEBPACK_IMPORTED_MODULE_4__.useSensor)(_dnd_kit_core__WEBPACK_IMPORTED_MODULE_4__.KeyboardSensor, {
    coordinateGetter: _dnd_kit_sortable__WEBPACK_IMPORTED_MODULE_5__.sortableKeyboardCoordinates
  }));
  function handleDragEnd(event) {
    const {
      active,
      over
    } = event;
    if (active && over && active.id !== over.id) {
      setListVideos(items => {
        const oldIndex = items.findIndex(item => item.attachment_id === active.id);
        const newIndex = items.findIndex(item => item.attachment_id === over.id);
        const newItems = (0,_dnd_kit_sortable__WEBPACK_IMPORTED_MODULE_5__.arrayMove)(items, oldIndex, newIndex);
        const newGalleryInclude = newItems.map(video => video.attachment_id).join(',');
        setAttributes({
          gallery_include: newGalleryInclude,
          gallery_orderby: 'include'
        });
        return newItems;
      });
    }
  }
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    setShowOverlay(!isSelected);
  }, [isSelected]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    let new_gallery_orderby = gallery_orderby;
    if (new_gallery_orderby === 'menu_order') {
      new_gallery_orderby = 'menu_order ID';
    } else if (new_gallery_orderby === 'rand') {
      new_gallery_orderby = 'RAND(' + Math.round(Math.random() * 10000) + ')';
    }
    const args = {
      gallery_orderby: new_gallery_orderby,
      gallery_order,
      gallery_pagination,
      gallery_per_page: !gallery_pagination || isNaN(gallery_per_page) ? -1 : gallery_per_page,
      page_number: currentPage,
      gallery_id,
      gallery_include,
      gallery_exclude,
      gallery_source,
      gallery_category,
      gallery_tag,
      videos: videos !== undefined ? videos : collection_video_limit
    };
    setIsLoading(true);
    (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.getVideoGallery)(args).then(response => {
      setListVideos(response.videos);
    }).catch(error => {
      if (error.status === 404 || error.data && error.data.status === 404) {
        setListVideos([]);
      } else {
        console.error('Error fetching videos:', error);
      }
    }).finally(() => {
      setIsLoading(false);
    });
  }, [gallery_id, gallery_pagination, gallery_per_page, gallery_orderby, gallery_order, gallery_include, gallery_exclude, gallery_source, gallery_category, gallery_tag, videos, collection_video_limit, currentPage, refreshTrigger]);
  const openMediaModal = video => {
    const frame = window.wp.media({
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Edit Video', 'video-embed-thumbnail-generator'),
      button: {
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Update', 'video-embed-thumbnail-generator')
      },
      multiple: false,
      library: {
        type: 'video'
      }
    });
    frame.on('open', () => {
      const selection = frame.state().get('selection');
      if (video.attachment_id) {
        const attachment = window.wp.media.attachment(video.attachment_id);
        attachment.fetch().done(() => {
          selection.add(attachment);
        });
      }
    });
    frame.on('select', () => {
      const newAttachment = frame.state().get('selection').first().toJSON();
      if (video.attachment_id === newAttachment.id) {
        setRefreshTrigger(v => v + 1);
        return;
      }
      onEditItem(video.attachment_id, newAttachment, listVideos);
    });
    frame.open();
  };
  const listStyles = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => {
    const styles = {};
    if (title_color) {
      styles['--videopack-title-color'] = title_color;
    }
    if (title_background_color) {
      styles['--videopack-title-background-color'] = title_background_color;
    }
    return styles;
  }, [title_color, title_background_color]);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("div", {
    className: "videopack-video-list-wrapper",
    style: listStyles,
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
      className: "videopack-video-list",
      children: [isLoading && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("div", {
        className: "videopack-loading-container",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Spinner, {})
      }), !isLoading && listVideos && listVideos.length > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_dnd_kit_core__WEBPACK_IMPORTED_MODULE_4__.DndContext, {
        sensors: sensors,
        collisionDetection: _dnd_kit_core__WEBPACK_IMPORTED_MODULE_4__.closestCenter,
        onDragEnd: handleDragEnd,
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_dnd_kit_sortable__WEBPACK_IMPORTED_MODULE_5__.SortableContext, {
          items: listVideos.map(video => video.attachment_id),
          strategy: _dnd_kit_sortable__WEBPACK_IMPORTED_MODULE_5__.verticalListSortingStrategy,
          children: listVideos.map(video => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_VideoListItem__WEBPACK_IMPORTED_MODULE_6__["default"], {
            video: video,
            attributes: attributes,
            options: options,
            isEditing: isEditing,
            showOverlay: showOverlay,
            onEdit: openMediaModal,
            onRemove: onRemoveItem
          }, video.attachment_id))
        })
      }), !isLoading && (!listVideos || listVideos.length === 0) && isEditing && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Placeholder, {
        icon: "format-video",
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('No videos found', 'video-embed-thumbnail-generator'),
        instructions: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Try adjusting your query settings.', 'video-embed-thumbnail-generator')
      })]
    })
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (VideoList);

/***/ },

/***/ "./src/components/VideoList/VideoListItem.js"
/*!***************************************************!*\
  !*** ./src/components/VideoList/VideoListItem.js ***!
  \***************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _dnd_kit_sortable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @dnd-kit/sortable */ "./node_modules/@dnd-kit/sortable/dist/sortable.esm.js");
/* harmony import */ var _dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @dnd-kit/utilities */ "./node_modules/@dnd-kit/utilities/dist/utilities.esm.js");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/close.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/drag-handle.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/pencil.mjs");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _VideoPlayer_VideoPlayer__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../VideoPlayer/VideoPlayer */ "./src/components/VideoPlayer/VideoPlayer.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__);
/**
 * A single item within the video list, displaying a player and controls.
 */

/* global videopack_config, JSX */







/**
 * VideoListItem component.
 *
 * @param {Object}   props             Component props.
 * @param {Object}   props.video       Video data record.
 * @param {Object}   props.attributes  Block attributes.
 * @param {Object}   props.options     Global player options.
 * @param {boolean}  props.isEditing   Whether the item is in editing mode.
 * @param {boolean}  props.showOverlay Whether to show a block overlay.
 * @param {Function} props.onEdit      Callback to open the media modal for editing.
 * @param {Function} props.onRemove    Callback to remove the video item.
 * @return {JSX.Element} The VideoListItem component.
 */

const VideoListItem = ({
  video,
  attributes,
  options,
  isEditing,
  showOverlay,
  onEdit,
  onRemove
}) => {
  const {
    attributes: sortableAttributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = (0,_dnd_kit_sortable__WEBPACK_IMPORTED_MODULE_0__.useSortable)({
    id: video.attachment_id,
    disabled: !isEditing
  });
  const style = {
    transform: _dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_1__.CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative'
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
    ref: setNodeRef,
    style: style,
    ...sortableAttributes,
    className: `videopack-list-item${isDragging ? ' is-dragging' : ''}`,
    children: [showOverlay && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("div", {
      className: "videopack-block-overlay"
    }), isEditing && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
      className: "videopack-list-item-controls",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("button", {
        className: "videopack-drag-handle",
        ...listeners,
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__.__)('Drag to reorder', 'video-embed-thumbnail-generator'),
        type: "button",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Icon, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_4__["default"]
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("button", {
        className: "videopack-edit-item",
        onClick: () => onEdit(video),
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__.__)('Edit', 'video-embed-thumbnail-generator'),
        type: "button",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Icon, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_5__["default"]
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("button", {
        className: "videopack-remove-item",
        onClick: () => onRemove(video.attachment_id),
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__.__)('Remove', 'video-embed-thumbnail-generator'),
        type: "button",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Icon, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_3__["default"]
        })
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_VideoPlayer_VideoPlayer__WEBPACK_IMPORTED_MODULE_7__["default"], {
      attributes: {
        ...(videopack_config?.options || {}),
        ...(videopack_config?.defaults || {}),
        ...options,
        ...video.player_vars,
        ...attributes,
        // Ensure video-specific metadata wins if shortcode attributes are empty
        poster: attributes.poster || video.player_vars.poster,
        title: attributes.title || video.title || video.player_vars.title,
        autoplay: false
      },
      onReady: () => {}
    })]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (VideoListItem);

/***/ },

/***/ "./src/components/VideoList/VideoList.scss"
/*!*************************************************!*\
  !*** ./src/components/VideoList/VideoList.scss ***!
  \*************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }

}]);
//# sourceMappingURL=videopack-videolist.js.map