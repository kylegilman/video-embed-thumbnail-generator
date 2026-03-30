"use strict";
(globalThis["webpackChunkvideopack_admin"] = globalThis["webpackChunkvideopack_admin"] || []).push([["videopack-videogallery"],{

/***/ "./src/components/VideoGallery/GalleryItem.js"
/*!****************************************************!*\
  !*** ./src/components/VideoGallery/GalleryItem.js ***!
  \****************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/close.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/create.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/drag-handle.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/pencil.mjs");
/* harmony import */ var _wordpress_html_entities__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @wordpress/html-entities */ "@wordpress/html-entities");
/* harmony import */ var _wordpress_html_entities__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_wordpress_html_entities__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _dnd_kit_sortable__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @dnd-kit/sortable */ "./node_modules/@dnd-kit/sortable/dist/sortable.esm.js");
/* harmony import */ var _dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @dnd-kit/utilities */ "./node_modules/@dnd-kit/utilities/dist/utilities.esm.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__);
/**
 * A single item within the video gallery, displaying a thumbnail and overlay.
 */

/* global videopack_config, ResizeObserver */









/**
 * GalleryItem component.
 *
 * @param {Object}   props                      Component props.
 * @param {Object}   props.attributes           Block attributes.
 * @param {Object}   props.videoRecord          Video data record.
 * @param {Function} props.setOpenVideo         Function to open a video in the modal.
 * @param {number}   props.videoIndex           Index of the video in the gallery.
 * @param {Function} props.setCurrentVideoIndex Function to set the current video index.
 * @param {boolean}  props.isEditing            Whether the gallery is in editing mode.
 * @param {Function} props.onRemove             Callback to remove a video.
 * @param {Function} props.onEdit               Callback to edit a video's metadata.
 * @param {boolean}  props.isLastItem           Whether this is the last item in the gallery.
 * @param {Function} props.onAddVideo           Callback to add a new video.
 * @param {boolean}  props.isHoveringGallery    Whether the gallery is being hovered.
 * @return {Object} The GalleryItem component.
 */

const GalleryItem = ({
  attributes,
  videoRecord,
  setOpenVideo,
  videoIndex,
  setCurrentVideoIndex,
  isEditing,
  onRemove,
  onEdit,
  isLastItem,
  onAddVideo,
  isHoveringGallery
}) => {
  const {
    skin,
    gallery_title
  } = attributes;
  const embed_method = attributes.embed_method || videopack_config.embed_method;
  const {
    attributes: sortableAttributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = (0,_dnd_kit_sortable__WEBPACK_IMPORTED_MODULE_8__.useSortable)({
    id: videoRecord.attachment_id,
    disabled: !isEditing
  });
  const style = {
    transform: _dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_9__.CSS.Transform.toString(transform),
    transition
  };
  const [thumbnailUrl, setThumbnailUrl] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(videopack_config.url + '/src/images/nothumbnail.jpg');
  const [thumbnailSrcset, setThumbnailSrcset] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const buttonContainerRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const mejsButtonRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (embed_method !== 'WordPress Default' || !buttonContainerRef.current) {
      return;
    }
    const resizeObserver = new ResizeObserver(entries => {
      if (!mejsButtonRef.current) {
        return;
      }
      for (const entry of entries) {
        const containerWidth = entry.contentRect.width;
        const desiredButtonWidth = containerWidth * 0.25;
        const initialButtonWidth = 80; // Default ME.js button width
        const finalButtonWidth = Math.min(desiredButtonWidth, 90);
        const scale = finalButtonWidth / initialButtonWidth;
        mejsButtonRef.current.style.transform = `translate(-50%, -50%) scale(${scale})`;
      }
    });
    resizeObserver.observe(buttonContainerRef.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, [embed_method]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (videoRecord?.poster_url) {
      setThumbnailUrl(videoRecord.poster_url);
    }
    if (videoRecord?.poster_srcset) {
      setThumbnailSrcset(videoRecord.poster_srcset);
    }
  }, [videoRecord]);
  const openMediaModal = () => {
    const frame = window.wp.media({
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Edit Video', 'video-embed-thumbnail-generator'),
      button: {
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Update', 'video-embed-thumbnail-generator')
      },
      multiple: false,
      library: {
        type: 'video'
      }
    });
    frame.on('open', () => {
      const selection = frame.state().get('selection');
      if (videoRecord.attachment_id) {
        const attachment = window.wp.media.attachment(videoRecord.attachment_id);
        attachment.fetch().done(() => {
          selection.add(attachment);
        });
      }
    });
    frame.on('select', () => {
      const newAttachment = frame.state().get('selection').first().toJSON();
      onEdit(videoRecord.attachment_id, newAttachment);
    });
    frame.open();
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
    ref: setNodeRef,
    style: style,
    ...sortableAttributes,
    className: `gallery-thumbnail videopack-gallery-item ${skin || ''}`,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
      className: "gallery-item-clickable-area",
      ref: buttonContainerRef,
      onKeyDown: e => {
        if (e.key === 'Enter' || e.key === ' ') {
          setOpenVideo(videoRecord);
          setCurrentVideoIndex(videoIndex);
        }
      },
      onClick: () => {
        setOpenVideo(videoRecord);
        setCurrentVideoIndex(videoIndex);
      },
      tabIndex: "0",
      role: "button",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("img", {
        src: thumbnailUrl,
        srcSet: thumbnailSrcset,
        alt: (0,_wordpress_html_entities__WEBPACK_IMPORTED_MODULE_7__.decodeEntities)(videoRecord.title)
      }), 'WordPress Default' === embed_method ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
        className: "mejs-overlay mejs-layer mejs-overlay-play",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
          ref: mejsButtonRef,
          className: "mejs-overlay-button",
          role: "button",
          tabIndex: "0",
          "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Play', 'video-embed-thumbnail-generator'),
          "aria-pressed": "false"
        })
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
        className: `play-button-container video-js ${skin} vjs-big-play-centered vjs-paused vjs-controls-enabled`,
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("button", {
          className: "vjs-big-play-button",
          type: "button",
          title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Play Video', 'video-embed-thumbnail-generator'),
          "aria-disabled": "false",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("span", {
            className: "vjs-icon-placeholder",
            "aria-hidden": "true"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("span", {
            className: "vjs-control-text",
            "aria-live": "polite",
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Play Video', 'video-embed-thumbnail-generator')
          })]
        })
      }), gallery_title && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
        className: "video-title",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
          className: "video-title-background"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("span", {
          className: "video-title-text",
          children: (0,_wordpress_html_entities__WEBPACK_IMPORTED_MODULE_7__.decodeEntities)(videoRecord.title)
        })]
      })]
    }), isEditing && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.Fragment, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("button", {
        className: "videopack-drag-handle",
        ...listeners,
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Drag to reorder', 'video-embed-thumbnail-generator'),
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Icon, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_5__["default"]
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
        className: "gallery-item-edit",
        onKeyDown: e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
            openMediaModal();
          }
        },
        onClick: e => {
          e.stopPropagation();
          openMediaModal();
        },
        tabIndex: "0",
        role: "button",
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Edit', 'video-embed-thumbnail-generator'),
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("button", {
          type: "button",
          className: "videopack-edit-item",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Icon, {
            icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_6__["default"]
          })
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
        className: "gallery-item-remove",
        onKeyDown: e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
            onRemove(videoRecord.attachment_id);
          }
        },
        onClick: e => {
          e.stopPropagation();
          onRemove(videoRecord.attachment_id);
        },
        tabIndex: "0",
        role: "button",
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Remove', 'video-embed-thumbnail-generator'),
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("button", {
          type: "button",
          className: "videopack-remove-item",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Icon, {
            icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_3__["default"]
          })
        })
      })]
    }), isEditing && isLastItem && isHoveringGallery && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("button", {
      className: "gallery-add-button",
      onClick: onAddVideo,
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Add video', 'video-embed-thumbnail-generator'),
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Icon, {
        icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_4__["default"]
      })
    })]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (GalleryItem);

/***/ },

/***/ "./src/components/VideoGallery/VideoGallery.js"
/*!*****************************************************!*\
  !*** ./src/components/VideoGallery/VideoGallery.js ***!
  \*****************************************************/
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
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/arrow-left.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/arrow-right.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/close.mjs");
/* harmony import */ var _dnd_kit_core__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @dnd-kit/core */ "./node_modules/@dnd-kit/core/dist/core.esm.js");
/* harmony import */ var _dnd_kit_sortable__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @dnd-kit/sortable */ "./node_modules/@dnd-kit/sortable/dist/sortable.esm.js");
/* harmony import */ var _GalleryItem__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./GalleryItem */ "./src/components/VideoGallery/GalleryItem.js");
/* harmony import */ var _VideoPlayer_VideoPlayer__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../VideoPlayer/VideoPlayer */ "./src/components/VideoPlayer/VideoPlayer.js");
/* harmony import */ var _VideoGallery_scss__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./VideoGallery.scss */ "./src/components/VideoGallery/VideoGallery.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__);
/**
 * A gallery component that manages a collection of videos with drag-and-drop support.
 */












const noop = () => {};

/**
 * VideoGallery component.
 *
 * @param {Object}   props                Component props.
 * @param {Object}   props.attributes     Block attributes.
 * @param {Function} props.setAttributes  Function to update block attributes.
 * @param {boolean}  props.isEditing      Whether the gallery is in editing mode.
 * @param {Function} props.onRemoveItem   Callback to remove a video item.
 * @param {Function} props.onEditItem     Callback to edit a video item.
 * @param {number}   props.galleryPage    Current gallery page.
 * @param {Function} props.setGalleryPage Function to update gallery page.
 * @param {number}   props.totalPages     Total number of gallery pages.
 * @param {Function} props.setTotalPages  Function to update total gallery pages.
 * @param {Function} props.onModalToggle  Callback when the modal state changes.
 * @return {Object} The VideoGallery component.
 */
const VideoGallery = ({
  attributes,
  setAttributes = noop,
  isEditing = false,
  onRemoveItem = noop,
  onEditItem = noop,
  galleryPage = 1,
  setGalleryPage = noop,
  totalPages = 1,
  setTotalPages = noop,
  onModalToggle = noop
}) => {
  const {
    gallery_id,
    gallery_pagination,
    gallery_per_page,
    gallery_columns,
    gallery_orderby,
    gallery_order,
    gallery_include,
    gallery_exclude,
    gallery_end,
    gallery_source,
    gallery_category,
    gallery_tag,
    videos,
    collection_video_limit,
    play_button_color,
    play_button_icon_color,
    title_color,
    title_background_color
  } = attributes;
  const [galleryVideos, setGalleryVideos] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
  const [openVideo, setOpenVideo] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [currentVideoIndex, setCurrentVideoIndex] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [isPlayerReady, setIsPlayerReady] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(true);
  const [isHovering, setIsHovering] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [galleryVersion, setGalleryVersion] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(0);
  const [isLoading, setIsLoading] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(true);
  const sensors = (0,_dnd_kit_core__WEBPACK_IMPORTED_MODULE_7__.useSensors)((0,_dnd_kit_core__WEBPACK_IMPORTED_MODULE_7__.useSensor)(_dnd_kit_core__WEBPACK_IMPORTED_MODULE_7__.PointerSensor), (0,_dnd_kit_core__WEBPACK_IMPORTED_MODULE_7__.useSensor)(_dnd_kit_core__WEBPACK_IMPORTED_MODULE_7__.KeyboardSensor, {
    coordinateGetter: _dnd_kit_sortable__WEBPACK_IMPORTED_MODULE_8__.sortableKeyboardCoordinates
  }));
  const openVideoAttributes = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => {
    if (!openVideo) {
      return null;
    }
    return {
      ...attributes,
      ...openVideo.player_vars,
      autoplay: true
    };
  }, [attributes, openVideo]);
  function handleDragEnd(event) {
    const {
      active,
      over
    } = event;
    if (active && over && active.id !== over.id) {
      setGalleryVideos(items => {
        const oldIndex = items.findIndex(item => item.attachment_id === active.id);
        const newIndex = items.findIndex(item => item.attachment_id === over.id);
        const newItems = (0,_dnd_kit_sortable__WEBPACK_IMPORTED_MODULE_8__.arrayMove)(items, oldIndex, newIndex);
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
    let new_gallery_orderby = gallery_orderby;
    if (new_gallery_orderby === 'menu_order') {
      new_gallery_orderby = 'menu_order ID';
    } else if (new_gallery_orderby === 'rand') {
      new_gallery_orderby = 'RAND(' + Math.round(Math.random() * 10000) + ')';
    }
    const args = {
      gallery_orderby: new_gallery_orderby,
      gallery_order,
      gallery_per_page: !gallery_pagination || isNaN(gallery_per_page) ? -1 : gallery_per_page,
      page_number: galleryPage,
      gallery_id,
      gallery_include,
      gallery_exclude,
      gallery_source,
      gallery_category,
      gallery_tag,
      gallery_pagination,
      videos: videos !== undefined ? videos : collection_video_limit
    };
    setIsLoading(true);
    (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.getVideoGallery)(args).then(response => {
      setTotalPages(response.max_num_pages);
      setGalleryVideos(response.videos);
    }).catch(error => {
      if (error.status === 404 || error.data && error.data.status === 404) {
        setTotalPages(0);
        setGalleryVideos([]);
      } else {
        console.error('Error fetching videos:', error);
      }
    }).finally(() => {
      setIsLoading(false);
    });
  }, [gallery_id, gallery_pagination, gallery_per_page, gallery_orderby, gallery_order, gallery_include, gallery_exclude, gallery_source, gallery_category, gallery_tag, videos, collection_video_limit, galleryPage, galleryVersion, setTotalPages]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (!gallery_pagination) {
      if (setTotalPages) {
        setTotalPages(1);
      }
      setGalleryPage(1);
    }
  }, [gallery_pagination, setTotalPages, setGalleryPage]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (currentVideoIndex !== null && galleryVideos.length > 0) {
      setOpenVideo(galleryVideos[currentVideoIndex]);
    }
  }, [galleryVideos, currentVideoIndex]);
  const closeVideo = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
    setOpenVideo(null);
    setCurrentVideoIndex(null);
  }, []);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    onModalToggle(!!openVideo);
  }, [openVideo, onModalToggle]);
  const handleNavigationArrowClick = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(videoIndex => {
    if (isPlayerReady) {
      setIsPlayerReady(false);
    }
    if (videoIndex > galleryVideos.length - 1 && totalPages > 1) {
      setGalleryPage(galleryPage + 1);
      setCurrentVideoIndex(0);
    } else if (videoIndex < 0 && galleryPage > 1) {
      setGalleryPage(galleryPage - 1);
      setCurrentVideoIndex(galleryVideos.length - 1);
    } else {
      setOpenVideo(galleryVideos[videoIndex]);
      setCurrentVideoIndex(videoIndex);
    }
  }, [isPlayerReady, galleryVideos, totalPages, galleryPage, setGalleryPage]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    const handleNavigationKeyPress = e => {
      if (e.key === 'Escape') {
        closeVideo();
      }
      if (e.key === 'ArrowRight' && currentVideoIndex < galleryVideos.length - 1) {
        handleNavigationArrowClick(currentVideoIndex + 1);
      }
      if (e.key === 'ArrowLeft' && currentVideoIndex > 0) {
        handleNavigationArrowClick(currentVideoIndex - 1);
      }
    };
    if (openVideo) {
      document.addEventListener('keydown', handleNavigationKeyPress);
    } else {
      document.removeEventListener('keydown', handleNavigationKeyPress);
    }
    return () => {
      document.removeEventListener('keydown', handleNavigationKeyPress);
    };
  }, [openVideo, currentVideoIndex, galleryVideos, closeVideo, handleNavigationArrowClick]);
  const handleVideoClick = event => {
    event.stopPropagation();
  };
  const handleVideoPlayerReady = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(player => {
    setIsPlayerReady(true);
    player.addEventListener('ended', () => {
      if (gallery_end === 'next') {
        handleNavigationArrowClick(currentVideoIndex + 1);
      }
      if (gallery_end === 'close') {
        closeVideo();
      }
    });
  }, [gallery_end, currentVideoIndex, handleNavigationArrowClick, closeVideo]);
  const handleEditItem = (oldAttachmentId, newAttachment) => {
    if (oldAttachmentId === newAttachment.id) {
      setGalleryVersion(v => v + 1);
      return;
    }
    onEditItem(oldAttachmentId, newAttachment, galleryVideos);
  };
  const openMediaModalForNewVideos = () => {
    const frame = window.wp.media({
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Add Videos to Gallery', 'video-embed-thumbnail-generator'),
      button: {
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Add to Gallery', 'video-embed-thumbnail-generator')
      },
      multiple: 'add',
      library: {
        type: 'video'
      }
    });
    frame.on('select', () => {
      const selection = frame.state().get('selection');
      const newAttachmentIds = selection.map(attachment => attachment.id.toString());
      let currentInclude = [];
      if (gallery_include) {
        currentInclude = gallery_include.split(',');
      } else if (galleryVideos) {
        currentInclude = galleryVideos.map(video => video.attachment_id.toString());
      }
      const newGalleryInclude = [...new Set([...currentInclude, ...newAttachmentIds])].join(',');
      setAttributes({
        gallery_include: newGalleryInclude,
        gallery_source: 'manual'
      });
    });
    frame.open();
  };
  const renderGalleryContent = () => {
    if (isLoading) {
      return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
        style: {
          gridColumn: '1 / -1',
          display: 'flex',
          justifyContent: 'center',
          padding: '20px'
        },
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Spinner, {})
      });
    }
    if (galleryVideos && galleryVideos.length > 0) {
      return galleryVideos.map((videoRecord, index) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_GalleryItem__WEBPACK_IMPORTED_MODULE_9__["default"], {
        attributes: attributes,
        videoRecord: videoRecord,
        setOpenVideo: setOpenVideo,
        videoIndex: index,
        setCurrentVideoIndex: setCurrentVideoIndex,
        isEditing: isEditing,
        onRemove: onRemoveItem,
        onEdit: handleEditItem,
        isLastItem: index === galleryVideos.length - 1,
        onAddVideo: openMediaModalForNewVideos,
        isHoveringGallery: isHovering
      }, videoRecord.attachment_id));
    }
    if (isEditing) {
      return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
        style: {
          gridColumn: '1 / -1'
        },
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Placeholder, {
          icon: "format-video",
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('No videos found', 'video-embed-thumbnail-generator'),
          instructions: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Try adjusting your query settings.', 'video-embed-thumbnail-generator')
        })
      });
    }
    return null;
  };
  const wrapperClasses = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => {
    const classes = ['videopack-gallery-wrapper'];
    if (play_button_color) {
      classes.push('videopack-has-play-button-color');
    }
    if (play_button_icon_color) {
      classes.push('videopack-has-play-button-icon-color');
    }
    if (title_color) {
      classes.push('videopack-has-title-color');
    }
    if (title_background_color) {
      classes.push('videopack-has-title-background-color');
    }
    return classes.join(' ');
  }, [play_button_color, play_button_icon_color, title_color, title_background_color]);
  const galleryStyles = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => {
    const styles = {};
    const config = window.videopack_config || {};
    if (config.mejs_controls_svg) {
      styles['--videopack-mejs-controls-svg'] = `url(${config.mejs_controls_svg})`;
    }
    if (gallery_columns > 0) {
      styles['--gallery-columns'] = gallery_columns;
    }
    if (play_button_color) {
      styles['--videopack-play-button-color'] = play_button_color;
    }
    if (play_button_icon_color) {
      styles['--videopack-play-button-icon-color'] = play_button_icon_color;
    }
    if (title_color) {
      styles['--videopack-title-color'] = title_color;
    }
    if (title_background_color) {
      styles['--videopack-title-background-color'] = title_background_color;
    }
    return styles;
  }, [gallery_columns, play_button_color, play_button_icon_color, title_color, title_background_color]);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("div", {
    className: wrapperClasses,
    style: galleryStyles,
    onMouseEnter: () => !openVideo && setIsHovering(true),
    onMouseLeave: () => !openVideo && setIsHovering(false),
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_dnd_kit_core__WEBPACK_IMPORTED_MODULE_7__.DndContext, {
      sensors: sensors,
      collisionDetection: _dnd_kit_core__WEBPACK_IMPORTED_MODULE_7__.closestCenter,
      onDragEnd: handleDragEnd,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_dnd_kit_sortable__WEBPACK_IMPORTED_MODULE_8__.SortableContext, {
        items: galleryVideos.map(video => video.attachment_id),
        strategy: _dnd_kit_sortable__WEBPACK_IMPORTED_MODULE_8__.rectSortingStrategy,
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
          className: "videopack-gallery-items",
          style: gallery_columns > 0 ? {
            '--gallery-columns': gallery_columns
          } : {},
          children: renderGalleryContent()
        })
      })
    }), openVideo && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
      className: "videopack-modal-overlay is-visible",
      onClick: closeVideo,
      onKeyDown: e => {
        if (e.key === 'Enter' || e.key === ' ') {
          closeVideo();
        }
      },
      role: "button",
      tabIndex: 0,
      "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Close Overlay', 'video-embed-thumbnail-generator'),
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("div", {
        className: "videopack-modal-container",
        onClick: handleVideoClick,
        onKeyDown: e => e.stopPropagation(),
        role: "presentation",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("button", {
          type: "button",
          className: "modal-navigation modal-close",
          title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Close', 'video-embed-thumbnail-generator'),
          onClick: closeVideo,
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Icon, {
            icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_6__["default"]
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("button", {
          type: "button",
          className: `modal-navigation modal-next ${currentVideoIndex < galleryVideos.length - 1 || totalPages > galleryPage ? '' : 'is-hidden'}`,
          title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Next', 'video-embed-thumbnail-generator'),
          onClick: () => {
            handleNavigationArrowClick(currentVideoIndex + 1);
          },
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Icon, {
            icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_5__["default"]
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("button", {
          type: "button",
          className: `modal-navigation modal-previous ${currentVideoIndex > 0 || galleryPage > 1 ? '' : 'is-hidden'}`,
          title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Previous', 'video-embed-thumbnail-generator'),
          onClick: () => {
            handleNavigationArrowClick(currentVideoIndex - 1);
          },
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Icon, {
            icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_4__["default"]
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
          className: "modal-content",
          children: openVideoAttributes && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_VideoPlayer_VideoPlayer__WEBPACK_IMPORTED_MODULE_10__["default"], {
            attributes: openVideoAttributes,
            onReady: handleVideoPlayerReady
          }, openVideo?.attachment_id)
        })]
      })
    })]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (VideoGallery);

/***/ },

/***/ "./src/components/VideoGallery/VideoGallery.scss"
/*!*******************************************************!*\
  !*** ./src/components/VideoGallery/VideoGallery.scss ***!
  \*******************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }

}]);
//# sourceMappingURL=videopack-videogallery.js.map