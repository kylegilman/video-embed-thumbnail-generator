/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/features/tinymce/tinymce.js"
/*!*****************************************!*\
  !*** ./src/features/tinymce/tinymce.js ***!
  \*****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _components_VideoPlayer_VideoPlayer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../components/VideoPlayer/VideoPlayer */ "./src/components/VideoPlayer/VideoPlayer.js");
/* harmony import */ var _components_VideoGallery_VideoGallery__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../components/VideoGallery/VideoGallery */ "./src/components/VideoGallery/VideoGallery.js");
/* harmony import */ var _components_VideoList_VideoList__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../components/VideoList/VideoList */ "./src/components/VideoList/VideoList.js");
/* harmony import */ var _components_Pagination_Pagination__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../components/Pagination/Pagination */ "./src/components/Pagination/Pagination.js");
/* harmony import */ var _tinymce_scss__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./tinymce.scss */ "./src/features/tinymce/tinymce.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__);
/**
 * Features for integrating Videopack with the TinyMCE editor.
 */








/* global videopack_config, tinymce, MutationObserver */


(function () {
  const PlaceHolderWrapper = ({
    type,
    attributes,
    mountNode
  }) => {
    const [fullAttributes, setFullAttributes] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(attributes);
    const [isLoading, setIsLoading] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(type === 'Video');
    const [galleryPage, setGalleryPage] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(1);
    const [totalPages, setTotalPages] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(1);
    const [isSelected, setIsSelected] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);

    // Watch for selection changes on the wpview container
    (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
      const wpView = mountNode.closest('.wpview');
      if (!wpView) {
        return;
      }
      const updateSelection = () => {
        const selected = wpView.getAttribute('data-mce-selected');
        setIsSelected(selected === '1' || selected === '2');
      };
      updateSelection();
      const observer = new MutationObserver(updateSelection);
      observer.observe(wpView, {
        attributes: true,
        attributeFilter: ['data-mce-selected']
      });
      return () => observer.disconnect();
    }, [mountNode]);

    // Fetch metadata for galleries/lists to get total pages
    (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
      if (type === 'Video') {
        return;
      }
      const args = {
        ...attributes,
        gallery_pagination: true,
        gallery_per_page: attributes.gallery_per_page || 10,
        page_number: galleryPage
      };
      _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
        path: `/videopack/v1/video_gallery?${new URLSearchParams(args).toString()}`
      }).then(response => {
        setFullAttributes(prev => ({
          ...prev,
          ...(response.attributes || {})
        }));
        setTotalPages(response.max_num_pages || 1);
      }).finally(() => setIsLoading(false));
    }, [type, attributes, galleryPage]);

    // Fetch metadata for single videos if only ID is provided
    (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
      if (type !== 'Video' || !attributes.id) {
        setIsLoading(false);
        return;
      }

      // If we have an ID, we almost always want to fetch its metadata to get sources/poster
      _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
        path: `/videopack/v1/video_gallery?gallery_include=${attributes.id}`
      }).then(response => {
        if (response.videos && response.videos.length > 0) {
          const video = response.videos[0];
          setFullAttributes(prev => ({
            ...video.player_vars,
            ...prev,
            title: prev.title || video.title,
            poster: prev.poster || video.player_vars.poster,
            // Ensure the URL provided in the shortcode content (if any) takes precedence
            src: prev.url || prev.src || video.player_vars.src
          }));
        }
      }).finally(() => setIsLoading(false));
    }, [type, attributes.id]);
    if (isLoading) {
      return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
        className: "loading-placeholder",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("div", {
          className: "dashicons dashicons-admin-media"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("div", {
          className: "wpview-loading",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("ins", {})
        })]
      });
    }
    let Component = _components_VideoPlayer_VideoPlayer__WEBPACK_IMPORTED_MODULE_3__["default"];
    if (type === 'Gallery') {
      Component = _components_VideoGallery_VideoGallery__WEBPACK_IMPORTED_MODULE_4__["default"];
    } else if (type === 'List') {
      Component = _components_VideoList_VideoList__WEBPACK_IMPORTED_MODULE_5__["default"];
    }
    const finalAttributes = {
      ...(videopack_config?.options || {}),
      ...(videopack_config?.defaults || {}),
      ...fullAttributes,
      autoplay: false // Never autoplay in TinyMCE preview
    };

    // If we only have a URL but no sources array, create a default one for the player
    if (finalAttributes.url && (!finalAttributes.sources || finalAttributes.sources.length === 0)) {
      finalAttributes.src = finalAttributes.url;
      finalAttributes.sources = [{
        src: finalAttributes.url,
        type: 'video/mp4'
      }];
    }
    const commonProps = {
      attributes: finalAttributes,
      isEditing: false,
      isSelected
    };
    const galleryProps = type !== 'Video' ? {
      galleryPage,
      setGalleryPage,
      totalPages,
      setTotalPages
    } : {};
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
      className: "videopack-tinymce-wrapper",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(Component, {
        ...commonProps,
        ...galleryProps
      }), fullAttributes.gallery_pagination && totalPages > 1 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_components_Pagination_Pagination__WEBPACK_IMPORTED_MODULE_6__["default"], {
        currentPage: galleryPage,
        totalPages: totalPages,
        onPageChange: setGalleryPage
      }), !isSelected && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("div", {
        className: "videopack-block-overlay"
      })]
    });
  };

  /**
   * Mounts a React component to a specific mount node within a container.
   *
   * @param {HTMLElement} container The container element (usually a WP View).
   * @param {Object}      shortcode The shortcode object.
   */
  function mountReactToNode(container, shortcode) {
    if (!container || typeof container.querySelector !== 'function') {
      return;
    }
    const mountNode = container.querySelector('.videopack-tinymce-mount');
    if (!mountNode || mountNode.dataset.videopackMounted) {
      return;
    }
    const attrs = {
      ...shortcode.attrs.named
    };
    const tag = shortcode.tag;

    // If the shortcode has content (e.g. [videopack]URL[/videopack]), map it to the url attribute
    if (shortcode.content && !attrs.url && !attrs.src) {
      attrs.url = shortcode.content.trim();
    }
    let type = 'Video';
    if (tag === 'videopack_gallery') {
      type = 'Gallery';
    } else if (tag === 'videopack_list') {
      type = 'List';
    } else {
      // [videopack] or legacy aliases
      const isGallery = attrs.gallery === 'true' || attrs.gallery === true;
      if (isGallery) {
        type = 'Gallery';
      } else {
        // Detect if it should be a list
        const hasMultipleIds = attrs.id && attrs.id.includes(',');
        const hasQuerySource = attrs.gallery_source || attrs.gallery_category || attrs.gallery_tag;
        const isEmptyAndNotUrl = !attrs.id && !attrs.url && !shortcode.content;
        const hasGalleryIdOnly = attrs.gallery_id && !attrs.id && !attrs.url && !shortcode.content;
        if (hasMultipleIds || hasQuerySource || isEmptyAndNotUrl || hasGalleryIdOnly) {
          type = 'List';
        } else {
          type = 'Video';
        }
      }
    }
    try {
      // Use createRoot for React 18+ compatibility
      if (!mountNode.__reactRoot) {
        mountNode.__reactRoot = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createRoot)(mountNode);
      }
      mountNode.__reactRoot.render(/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(PlaceHolderWrapper, {
        type: type,
        attributes: attrs,
        mountNode: mountNode
      }));
      mountNode.dataset.videopackMounted = 'true';
    } catch (e) {
      console.error('Videopack TinyMCE React render error:', e);
      mountNode.innerHTML = '<div class="videopack-render-error">Error rendering preview</div>';
    }
  }

  /**
   * Scans all TinyMCE editors for Videopack mount points and mounts them.
   */
  function scanAndMountAll() {
    if (typeof tinymce === 'undefined' || !tinymce.editors || typeof window.wp === 'undefined') {
      return;
    }
    tinymce.editors.forEach(editor => {
      const $doc = editor.getDoc();
      if (!$doc) {
        return;
      }

      // Find all WP Views for Videopack in this editor
      const views = editor.dom.select('.wpview-wrap[data-wpview-type="videopack"], .wpview-wrap[data-wpview-type="KGVID"], .wpview-wrap[data-wpview-type="VIDEOPACK"], .wpview-wrap[data-wpview-type="FMP"], .wpview-wrap[data-wpview-type="videopack_gallery"], .wpview-wrap[data-wpview-type="videopack_list"]');
      views.forEach(container => {
        const viewText = container.getAttribute('data-wpview-text');
        if (!viewText) {
          return;
        }
        const shortcodeText = decodeURIComponent(viewText);
        const shortcodeMatch = window.wp.shortcode.next('videopack', shortcodeText) || window.wp.shortcode.next('KGVID', shortcodeText) || window.wp.shortcode.next('VIDEOPACK', shortcodeText) || window.wp.shortcode.next('FMP', shortcodeText) || window.wp.shortcode.next('videopack_gallery', shortcodeText) || window.wp.shortcode.next('videopack_list', shortcodeText);
        if (shortcodeMatch && shortcodeMatch.shortcode) {
          mountReactToNode(container, shortcodeMatch.shortcode);
        }
      });
    });
  }

  /**
   * Registers the Videopack views with TinyMCE.
   */
  function registerVideopackViews() {
    // Prevent multiple registrations
    if (window.videopack_tinymce_registered) {
      return;
    }

    // Register Videopack views

    // Ensure we have access to wp.mce.views
    if (typeof window.wp === 'undefined' || !window.wp.mce || !window.wp.mce.views) {
      return;
    }
    const videopackViewConfig = {
      /**
       * The template used to render the preview shell.
       *
       * @return {string} Template HTML.
       */
      template() {
        return '<div class="videopack-tinymce-mount"></div>';
      },
      /**
       * Called when the view is initialized.
       * We trigger the render process here.
       */
      initialize() {
        this.render(this.template());
      },
      /**
       * Called after the view is inserted into the editor.
       * We mount the React component here.
       *
       * @param {HTMLElement} container The container element.
       */
      bind(container) {
        mountReactToNode(container, this.shortcode);
      },
      /**
       * Called when the view is removed from the editor.
       * We unmount the React component here for cleanup.
       *
       * @param {HTMLElement} container The container element.
       */
      unbind(container) {
        if (!container || typeof container.querySelector !== 'function') {
          return;
        }
        const mountNode = container.querySelector('.videopack-tinymce-mount');
        if (mountNode && mountNode.__reactRoot) {
          try {
            mountNode.__reactRoot.unmount();
            delete mountNode.__reactRoot;
          } catch (e) {}
        }
      },
      /**
       * Handles clicking the "Edit" button on the view.
       *
       * @param {string}   text           Shortcode text.
       * @param {Function} updateCallback Callback to update the shortcode.
       */
      edit(text, updateCallback) {
        if (typeof window.wp === 'undefined') {
          return;
        }
        const shortcode = window.wp.shortcode.next(this.shortcode.tag, text);
        const values = shortcode ? shortcode.shortcode.attrs.named : {};
        if (typeof window.wp.media === 'undefined') {
          return;
        }

        // If it's a single video with an ID, use the enhanced media modal
        if (values && values.id && values.id.indexOf(',') === -1) {
          const mediaFrame = window.wp.media({
            frame: 'select',
            title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Edit Videopack Shortcode', 'video-embed-thumbnail-generator'),
            button: {
              text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Update', 'video-embed-thumbnail-generator')
            },
            multiple: false,
            library: {
              post__in: [values.id]
            }
          });
          const shortcodeTag = this.shortcode.tag;
          mediaFrame.on('open', function () {
            const selection = mediaFrame.state().get('selection');
            const attachment = window.wp.media.attachment(values.id);
            attachment.set('videopack_attributes', values);
            attachment.fetch().then(() => {
              selection.add([attachment]);
            });
          });
          mediaFrame.on('select', function () {
            const selection = mediaFrame.state().get('selection').first();
            if (!selection) {
              return;
            }
            const selectedId = selection.get('id');
            const videopackAttrs = selection.get('videopack_attributes') || {};
            const config = videopack_config || {};
            const finalAttrs = {
              id: selectedId
            };
            const possibleKeys = ['width', 'height', 'autoplay', 'loop', 'muted', 'controls', 'volume', 'preload', 'playback_rate', 'playsinline', 'poster', 'downloadlink', 'overlay_title', 'play_button_color', 'play_button_icon_color', 'title_color', 'title_background_color'];
            possibleKeys.forEach(key => {
              const value = videopackAttrs[key];
              if (value !== undefined && value !== null) {
                const defaultValue = config.defaults?.[key];
                if (value !== defaultValue) {
                  finalAttrs[key] = value;
                }
              }
            });
            const newShortcode = new window.wp.shortcode({
              tag: shortcodeTag,
              attrs: finalAttrs,
              type: 'closed'
            });
            updateCallback(newShortcode.string());
          });
          mediaFrame.open();
        } else {
          // Fallback to the Thickbox-based UI for galleries, lists, or non-attachment URLs
          const params = new URLSearchParams();
          params.append('videopack_tinymce_edit', '1');
          if (videopack_config?.classic_embed_nonce) {
            params.append('videopack_nonce', videopack_config.classic_embed_nonce);
          }
          const urlValue = shortcode ? shortcode.shortcode.content ? shortcode.shortcode.content.trim() : '' : '';
          for (const key in values) {
            if (Object.prototype.hasOwnProperty.call(values, key)) {
              params.append('videopack_' + key, values[key]);
            }
          }
          if (values.url) {
            params.append('videopack_url', values.url);
          } else if (urlValue && values.id && values.id.indexOf(',') !== -1) {
            params.append('videopack_id', values.id);
          } else if (urlValue && !values.id) {
            params.append('videopack_url', urlValue);
          }
          let thickboxTitle = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Edit Video', 'video-embed-thumbnail-generator');
          const isGallery = values.gallery === 'true';
          const urlValueToCheck = urlValue || '';
          let isListInEdit = false;
          if (!isGallery) {
            const hasMultipleIds = values.id && values.id.indexOf(',') !== -1;
            const hasMultipleContentElements = urlValueToCheck && urlValueToCheck.indexOf(',') !== -1;
            const hasQuerySource = values.gallery_source || values.gallery_category || values.gallery_tag;
            const isEmptyAndNotUrl = !values.id && !values.url && !urlValueToCheck;
            const hasGalleryIdOnly = values.gallery_id && !values.id && !values.url && !urlValueToCheck;
            isListInEdit = hasMultipleIds || hasMultipleContentElements || hasQuerySource || isEmptyAndNotUrl || hasGalleryIdOnly;
          }
          if (isGallery) {
            thickboxTitle = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Edit Gallery', 'video-embed-thumbnail-generator');
            params.set('tab', 'embedgallery');
          } else if (isListInEdit) {
            thickboxTitle = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Edit Video List', 'video-embed-thumbnail-generator');
            params.set('tab', 'embedlist');
          } else {
            params.set('tab', 'embedurl');
          }
          const tbUrl = window.ajaxurl.replace('admin-ajax.php', '') + 'media-upload.php?type=embedurl&' + params.toString() + '&TB_iframe=true';
          window.videopack_tinymce_update_shortcode = newShortcodeString => {
            updateCallback(newShortcodeString);
            window.videopack_tinymce_update_shortcode = null;
            if (typeof window.tb_remove === 'function') {
              window.tb_remove();
            }
          };
          if (typeof window.tb_show === 'function') {
            window.tb_show(thickboxTitle, tbUrl);
          }
        }
      }
    };
    const tags = ['videopack', 'VIDEOPACK', 'KGVID', 'FMP', 'videopack_gallery', 'videopack_list'];
    tags.forEach(tag => {
      if (window.wp.mce.views.get(tag)) {
        window.wp.mce.views.unregister(tag);
      }
      window.wp.mce.views.register(tag, videopackViewConfig);
    });
    window.videopack_tinymce_registered = true;
  }

  // Register views initially if ready
  if (typeof window.wp !== 'undefined' && window.wp.mce && window.wp.mce.views) {
    registerVideopackViews();
  } else {
    document.addEventListener('DOMContentLoaded', registerVideopackViews);
  }

  /**
   * Setup observers for TinyMCE editors to handle React mounting.
   */
  function setupEditorObservers() {
    if (typeof tinymce === 'undefined') {
      return;
    }
    const initEditor = editor => {
      editor.on('init', () => {
        if (videopack_config?.globalStyles) {
          editor.dom.addStyle(videopack_config.globalStyles);
        }
        // Share videopack_config with the iframe window just in case
        editor.getWin().videopack_config = videopack_config;
      });
      editor.on('init setContent NodeChange', () => {
        setTimeout(scanAndMountAll, 100);
      });

      // Setup MutationObserver for the editor body
      const body = editor.getDoc()?.body;
      if (body) {
        const observer = new MutationObserver(mutations => {
          let shouldScan = false;
          mutations.forEach(mutation => {
            if (mutation.addedNodes.length > 0) {
              shouldScan = true;
            }
          });
          if (shouldScan) {
            scanAndMountAll();
          }
        });
        observer.observe(body, {
          childList: true,
          subtree: true
        });
      }
    };
    tinymce.on('AddEditor', e => {
      initEditor(e.editor);
    });

    // Initialize existing editors
    tinymce.editors.forEach(editor => {
      initEditor(editor);
    });

    // Initial scan
    setTimeout(scanAndMountAll, 500);
  }

  // Wait for TinyMCE to be fully loaded
  if (typeof tinymce !== 'undefined') {
    setupEditorObservers();
  } else {
    document.addEventListener('DOMContentLoaded', setupEditorObservers);
  }
})();

/***/ },

/***/ "./src/features/tinymce/tinymce.scss"
/*!*******************************************!*\
  !*** ./src/features/tinymce/tinymce.scss ***!
  \*******************************************/
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

/***/ "@wordpress/components"
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
(module) {

module.exports = window["wp"]["components"];

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
/******/ 			"tinymce": 0
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
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["videopack-dndkit","videopack-videoplayer","videopack-videogallery","videopack-videolist","videopack-shared"], () => (__webpack_require__("./src/features/tinymce/tinymce.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=tinymce.js.map