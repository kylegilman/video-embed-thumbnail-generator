/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/features/tinymce/tinymce.scss"
/*!*******************************************!*\
  !*** ./src/features/tinymce/tinymce.scss ***!
  \*******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "@wordpress/i18n"
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
(module) {

module.exports = window["wp"]["i18n"];

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
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*****************************************!*\
  !*** ./src/features/tinymce/tinymce.js ***!
  \*****************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _tinymce_scss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./tinymce.scss */ "./src/features/tinymce/tinymce.scss");
/**
 * Videopack TinyMCE integration for visual shortcode previews.
 */


(function () {
  /* global tinymce, videopack_config */

  const decodeEntities = text => {
    if (typeof text !== 'string') {
      return text;
    }
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  /**
   * Registers the Videopack views with TinyMCE.
   */
  function registerVideopackViews() {
    // Ensure we have access to wp.mce.views
    if (typeof wp === 'undefined' || !wp.mce || !wp.mce.views) {
      return false;
    }
    let mediaFrame;
    const wrapPlaceholder = (html, isGallery = false) => {
      const className = 'videopack-tinymce-container' + (isGallery ? ' videopack-tinymce-gallery' : '');
      const title = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('This is a placeholder. It will look different on the front end.', 'video-embed-thumbnail-generator');
      return `<div class="${className}" title="${title}">${html}</div>`;
    };
    const videopackViewConfig = {
      /**
       * The template used to render the preview.
       *
       * @param {Object} data Template data.
       * @return {string} Template HTML.
       */
      template(data) {
        try {
          const tmpl = wp.template('videopack-tinymce-view');
          return tmpl(data);
        } catch (e) {
          console.error('Videopack TinyMCE template error:', e);
          const posterHtml = data.poster ? '<img src="' + data.poster + '" style="max-width:100%; height:auto;" />' : '<span>' + (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Videopack Video', 'video-embed-thumbnail-generator') + '</span>';
          return wrapPlaceholder(posterHtml, data.isGallery);
        }
      },
      /**
       * Called when the view is initialized.
       * We handle the data fetching and rendering here.
       */
      initialize() {
        const self = this;
        const attrs = this.shortcode.attrs.named;
        const isGallery = attrs.gallery === 'true';
        const data = {
          poster: attrs.poster || '',
          title: decodeEntities(attrs.title || ''),
          isGallery,
          shortcodeContent: this.shortcode.content || '',
          // Default to showing title unless explicitly disabled
          showTitle: attrs.overlay_title !== 'false'
        };

        // Simple wrapper to call render
        const finalizeRender = renderData => {
          self.render(self.template(renderData));
        };

        // If it's a gallery, try to fetch the actual HTML from the server
        if (isGallery && typeof wp !== 'undefined' && wp.apiFetch) {
          const params = {
            attrs,
            content: this.shortcode.content || ''
          };
          wp.apiFetch({
            path: '/videopack/v1/render-shortcode' + wp.url.addQueryArgs('', params),
            method: 'GET'
          }).then(result => {
            if (result && result.html) {
              const wrappedHtml = '<div class="videopack-tinymce-container videopack-tinymce-gallery" title="' + (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('This is a placeholder. It will look different on the front end.', 'video-embed-thumbnail-generator') + '">' + result.html + '</div>';
              self.render(wrappedHtml);
            } else {
              finalizeRender(data);
            }
          }).catch(() => {
            finalizeRender(data);
          });
          return;
        }
        const isList = !isGallery && (attrs.id && attrs.id.indexOf(',') !== -1 || this.shortcode.content && this.shortcode.content.indexOf(',') !== -1 || attrs.gallery_source || attrs.gallery_category || attrs.gallery_tag || !attrs.id && !attrs.url && !this.shortcode.content || attrs.gallery_id && !attrs.id && !attrs.url && !this.shortcode.content);

        // If it's a list (not a gallery), fetch data for all IDs
        if (isList && typeof wp.media !== 'undefined') {
          const idString = attrs.id || this.shortcode.content || '';
          const ids = idString.split(',').map(id => id.trim()).filter(id => id.length > 0);

          // Dynamic list (based on source/category/tag/parent)
          if (ids.length === 0 && typeof wp !== 'undefined' && wp.apiFetch) {
            const fetchParams = {
              ...attrs
            };
            // Fallback to current post ID if no gallery_id is set and no source is specified
            if (!fetchParams.gallery_id && !fetchParams.gallery_source && typeof videopack_config !== 'undefined' && videopack_config.postId) {
              fetchParams.gallery_id = videopack_config.postId;
            }
            wp.apiFetch({
              path: wp.url.addQueryArgs('/videopack/v1/video_gallery', fetchParams),
              method: 'GET'
            }).then(response => {
              const videos = (response.videos || []).map(v => {
                return {
                  id: v.attachment_id,
                  poster: v.poster_url,
                  title: decodeEntities(v.title),
                  showTitle: attrs.overlay_title !== 'false'
                };
              });
              finalizeRender({
                ...data,
                videos
              });
            }).catch(err => {
              console.error('Videopack TinyMCE dynamic list fetch failed:', err);
              finalizeRender(data);
            });
            return;
          }
          const videoDataList = [];
          let pending = ids.length;
          if (pending === 0) {
            finalizeRender({
              ...data,
              videos: []
            });
            return;
          }
          const listTimeout = setTimeout(() => {
            if (pending > 0) {
              pending = 0; // Force stop
              finalizeRender({
                ...data,
                videos: videoDataList.filter(v => !!v)
              });
            }
          }, 5000);
          const getPosterSrc = attach => {
            return attach.get('image') && attach.get('image').src || attach.get('videopack_poster_src') || attach.get('thumb') && attach.get('thumb').src || '';
          };
          ids.forEach((id, index) => {
            const attachment = wp.media.attachment(id);
            const updateItem = attach => {
              videoDataList[index] = {
                id,
                poster: getPosterSrc(attach) || '',
                title: decodeEntities(attach.get('title') || ''),
                showTitle: attrs.overlay_title !== 'false'
              };
              pending--;
              if (pending === 0) {
                clearTimeout(listTimeout);
                finalizeRender({
                  ...data,
                  videos: videoDataList
                });
              }
            };
            if (attachment.get('title') || attachment.get('image')) {
              updateItem(attachment);
            } else {
              attachment.fetch().always(() => updateItem(attachment));
            }
          });
          return;
        }

        // If we have an ID, try to enrich data from the attachment (title and poster)
        if (attrs.id && !isGallery && typeof wp.media !== 'undefined') {
          const attachment = wp.media.attachment(attrs.id);
          const getPosterSrc = attach => {
            // Full size first, then specific poster meta, then thumb
            return attach.get('image') && attach.get('image').src || attach.get('videopack_poster_src') || attach.get('thumb') && attach.get('thumb').src || '';
          };
          const enrichData = attach => {
            if (!data.poster) {
              data.poster = getPosterSrc(attach);
            }
            if (!data.title) {
              data.title = attach.get('title');
            }
            finalizeRender(data);
          };

          // Check cache
          if (attachment.get('title') || attachment.get('image')) {
            enrichData(attachment);
            return;
          }

          // Fetch from server
          let timeoutFired = false;
          const timeout = setTimeout(() => {
            timeoutFired = true;
            finalizeRender(data); // Render fallback
          }, 3000);
          attachment.fetch().done(() => {
            if (timeoutFired) {
              return;
            }
            clearTimeout(timeout);
            enrichData(attachment);
          }).fail(() => {
            if (timeoutFired) {
              return;
            }
            clearTimeout(timeout);
            finalizeRender(data);
          });
        } else {
          // No attachment ID or not a video shortcode
          setTimeout(() => finalizeRender(data), 0);
        }
      },
      /**
       * Handles clicking the "Edit" button on the view.
       *
       * @param {string}   text           Shortcode text.
       * @param {Function} updateCallback Callback to update the shortcode with new content.
       */
      edit(text, updateCallback) {
        const shortcode = wp.shortcode.next(this.shortcode.tag, text);
        const values = shortcode ? shortcode.shortcode.attrs.named : {};
        if (typeof wp.media === 'undefined') {
          return;
        }
        if (values && values.id) {
          if (mediaFrame) {
            try {
              mediaFrame.dispose();
            } catch (e) {}
            mediaFrame = null;
          }
          mediaFrame = wp.media({
            frame: 'select',
            title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Edit Videopack Shortcode', 'video-embed-thumbnail-generator'),
            button: {
              text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Update', 'video-embed-thumbnail-generator')
            },
            multiple: false,
            library: {
              post__in: [values.id]
            }
          });
          const shortcodeTag = this.shortcode.tag;
          mediaFrame.on('open', function () {
            const selection = mediaFrame.state().get('selection');
            const attachment = wp.media.attachment(values.id);
            // Pass the current shortcode attributes to the media model so the React sidebar can use them
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
            const config = window.videopack_config || {};

            // Build shortcode attributes
            const finalAttrs = {
              id: selectedId
            };

            // List of keys we might want to include in the shortcode if they differ from global config
            const possibleKeys = ['width', 'height', 'autoplay', 'loop', 'muted', 'controls', 'volume', 'preload', 'playback_rate', 'playsinline', 'poster', 'downloadlink', 'overlay_title'];
            possibleKeys.forEach(key => {
              const value = videopackAttrs[key];
              if (value !== undefined && value !== null) {
                const defaultValue = config[key];
                // Only add to shortcode if it differs from global default
                if (value !== defaultValue) {
                  finalAttrs[key] = value;
                }
              }
            });

            // Generate new shortcode string
            const newShortcode = new wp.shortcode({
              tag: shortcodeTag,
              attrs: finalAttrs,
              type: 'closed'
            });
            const newShortcodeString = newShortcode.string();
            if (typeof updateCallback === 'function') {
              updateCallback(newShortcodeString);
            }
          });
          mediaFrame.open();
        } else {
          // Open ClassicEmbed Thickbox
          const params = new URLSearchParams();
          params.append('videopack_tinymce_edit', '1');
          const urlValue = shortcode.shortcode.content ? shortcode.shortcode.content.trim() : '';
          for (const key in values) {
            if (Object.prototype.hasOwnProperty.call(values, key)) {
              params.append('videopack_' + key, values[key]);
            }
          }
          if (values.url) {
            params.append('videopack_url', values.url);
          } else if (urlValue && !values.id) {
            params.append('videopack_url', urlValue);
          }
          let thickboxTitle = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Edit Video', 'video-embed-thumbnail-generator');
          const isGallery = values.gallery === 'true';
          const isList = !isGallery && (values.id && values.id.indexOf(',') !== -1 || urlValue && urlValue.indexOf(',') !== -1 || values.gallery_source || values.gallery_category || values.gallery_tag || !values.id && !values.url && !urlValue || values.gallery_id && !values.id && !values.url && !urlValue);
          if (isGallery) {
            thickboxTitle = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Edit Gallery', 'video-embed-thumbnail-generator');
            params.set('tab', 'embedgallery');
          } else if (isList) {
            thickboxTitle = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Edit Video List', 'video-embed-thumbnail-generator');
            params.set('tab', 'embedlist');
          } else {
            params.set('tab', 'embedurl');
          }
          const tbUrl = window.ajaxurl.replace('admin-ajax.php', '') + 'media-upload.php?type=embedurl&' + params.toString() + '&TB_iframe=true';
          window.videopack_tinymce_update_shortcode = newShortcodeString => {
            if (typeof updateCallback === 'function') {
              updateCallback(newShortcodeString);
            }
            // Clear the callback to avoid accidental reuse in new popups
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
    const tags = ['videopack', 'VIDEOPACK', 'KGVID', 'FMP'];
    tags.forEach(tag => {
      if (wp.mce.views.get(tag)) {
        wp.mce.views.unregister(tag);
      }
      wp.mce.views.register(tag, videopackViewConfig);
    });
    return true;
  }

  // Register as a TinyMCE plugin
  if (typeof tinymce !== 'undefined' && typeof tinymce.PluginManager !== 'undefined') {
    tinymce.PluginManager.add('videopack-tinymce', function () {
      registerVideopackViews();
    });
  }

  // Initial registration attempt
  registerVideopackViews();
})();
})();

/******/ })()
;
//# sourceMappingURL=tinymce.js.map