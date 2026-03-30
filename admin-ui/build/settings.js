/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/features/settings/components/AdminSettings.js"
/*!***********************************************************!*\
  !*** ./src/features/settings/components/AdminSettings.js ***!
  \***********************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _VideopackTooltip__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./VideopackTooltip */ "./src/features/settings/components/VideopackTooltip.js");
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../utils/utils */ "./src/utils/utils.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__);






/**
 * AdminSettings component.
 *
 * @param {Object} props                      Component props.
 * @param {Object} props.settings             Plugin settings.
 * @param {Object} props.changeHandlerFactory Factory for creating change handlers.
 * @return {Object} The rendered component.
 */

const AdminSettings = ({
  settings,
  changeHandlerFactory
}) => {
  const {
    capabilities,
    embeddable,
    schema,
    delete_child_thumbnails,
    delete_child_encoded,
    open_graph,
    oembed_provider,
    count_views,
    alwaysloadscripts,
    replace_video_shortcode,
    replace_video_block,
    replace_preview_video,
    rewrite_attachment_url
  } = settings;
  const [isClearingCache, setIsClearingCache] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(false);
  const handleClearCache = () => {
    setIsClearingCache(true);
    (0,_utils_utils__WEBPACK_IMPORTED_MODULE_4__.clearUrlCache)().then(() => {
      setIsClearingCache(false);
    }).catch(error => {
      console.error(error);
      setIsClearingCache(false);
    });
  };
  const countViewsOptions = [{
    value: 'quarters',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Quarters (0%, 25%, 50%, 75%, and 100% of duration)', 'video-embed-thumbnail-generator')
  }, {
    value: 'start_complete',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Start and complete', 'video-embed-thumbnail-generator')
  }, {
    value: 'start',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Start only', 'video-embed-thumbnail-generator')
  }, {
    value: 'false',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('None', 'video-embed-thumbnail-generator')
  }];
  const capitalizeFirstLetter = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  const RolesCheckboxes = () => {
    // Define an onChange event handler
    const handleCapabilityChange = (roleName, capability, isChecked) => {
      const updatedCapabilities = {
        ...capabilities,
        [capability]: {
          ...capabilities[capability],
          [roleName]: isChecked
        }
      };
      changeHandlerFactory.capabilities(updatedCapabilities);
    };
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('User capabilities', 'video-embed-thumbnail-generator'),
      initialOpen: true,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Flex, {
        direction: "row",
        gap: 20,
        className: "videopack-setting-capabilities",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.FlexItem, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Can make thumbnails', 'video-embed-thumbnail-generator')
          }), Object.entries(capabilities.make_video_thumbnails).map(([roleKey, isEnabled]) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.CheckboxControl, {
            __nextHasNoMarginBottom: true,
            label: capitalizeFirstLetter(roleKey),
            checked: isEnabled,
            onChange: isChecked => handleCapabilityChange(roleKey, 'make_video_thumbnails', isChecked)
          }, `${roleKey}-make-thumbnails`))]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.FlexItem, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Can encode videos', 'video-embed-thumbnail-generator')
          }), Object.entries(capabilities.encode_videos).map(([roleKey, isEnabled]) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.CheckboxControl, {
            __nextHasNoMarginBottom: true,
            label: capitalizeFirstLetter(roleKey),
            checked: isEnabled,
            onChange: isChecked => handleCapabilityChange(roleKey, 'encode_videos', isChecked)
          }, `${roleKey}-encode-videos`))]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.FlexItem, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Can edit other users' encoded videos", 'video-embed-thumbnail-generator')
          }), Object.entries(capabilities.edit_others_video_encodes).map(([roleKey, isEnabled]) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.CheckboxControl, {
            __nextHasNoMarginBottom: true,
            label: capitalizeFirstLetter(roleKey),
            checked: isEnabled,
            onChange: isChecked => handleCapabilityChange(roleKey, 'edit_others_video_encodes', isChecked)
          }, `${roleKey}-edit-encodes`))]
        })]
      })
    });
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Structured Data', 'video-embed-thumbnail-generator'),
      initialOpen: true,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
        className: "videopack-control-with-tooltip",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Generate Facebook Open Graph video tags', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.open_graph,
          checked: !!open_graph,
          disabled: !embeddable
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_3__["default"], {
          text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Facebook and some other social media sites will use these tags to embed the first video in your post. Your video must be served via https in order to be embedded directly in Facebook and playback is handled by the unstyled built-in browser player. No statistics will be recorded for videos embedded this way and Open Graph tags generated by Jetpack will be disabled on pages with videos.', 'video-embed-thumbnail-generator')
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
        className: "videopack-control-with-tooltip",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Generate Schema.org metadata for search engines', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.schema,
          checked: !!schema
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_3__["default"], {
          text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Helps your videos appear in search results.', 'video-embed-thumbnail-generator')
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
        className: "videopack-control-with-tooltip",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Change oEmbed to video instead of WordPress default photo/excerpt', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.oembed_provider,
          checked: !!oembed_provider
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_3__["default"], {
          text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Allows users of other websites to embed your videos using just the post URL rather than the full iframe embed code, much like Vimeo or YouTube. However, most social media sites will not show videos through oEmbed unless your link is https.', 'video-embed-thumbnail-generator')
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelBody, {
      title: "Performance",
      initialOpen: true,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
        className: "videopack-control-with-tooltip",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Always load plugin-related JavaScripts', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.alwaysloadscripts,
          checked: !!alwaysloadscripts
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_3__["default"], {
          text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Usually Videopack's JavaScripts are only loaded if a video is present on the page. AJAX page loading can cause errors because the JavaScripts aren't loaded with the video content. Enabling this option will make sure the JavaScripts are always loaded.", 'video-embed-thumbnail-generator')
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
        className: "videopack-control-with-tooltip",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
          className: "videopack-clear-button",
          variant: "secondary",
          onClick: handleClearCache,
          isBusy: isClearingCache,
          disabled: isClearingCache,
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Clear URL cache', 'video-embed-thumbnail-generator')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_3__["default"], {
          text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Recommended if your site's URL has changed.", 'video-embed-thumbnail-generator')
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.RadioControl, {
        className: "videopack-setting-radio-group",
        label: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("span", {
          className: "videopack-label-with-tooltip",
          children: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Record views in the WordPress database', 'video-embed-thumbnail-generator'), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_3__["default"], {
            text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Recording views in the database requires writing to the database, which can overload a server getting a lot of views. To speed up page loading, only enable the level of view counting you need. If Google Analytics is loaded, quarter event tracking is always recorded because Google servers can handle it.', 'video-embed-thumbnail-generator')
          })]
        }),
        selected: count_views,
        options: countViewsOptions,
        onChange: changeHandlerFactory.count_views
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Misc', 'video-embed-thumbnail-generator'),
      initialOpen: true,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
        className: "videopack-control-with-tooltip",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Override any existing "[video]" shortcodes', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.replace_video_shortcode,
          checked: !!replace_video_shortcode
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_3__["default"], {
          text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("If you have posts or theme files that make use of the built-in WordPress video shortcode, Videopack can override them with this plugin's embedded video player.", 'video-embed-thumbnail-generator')
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
        className: "videopack-control-with-tooltip",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Override any existing Video blocks', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.replace_video_block,
          checked: !!replace_video_block
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_3__["default"], {
          text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("If you have posts that make use of the built-in WordPress Video block, Videopack can override them with this plugin's embedded video player on the frontend.", 'video-embed-thumbnail-generator')
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
        className: "videopack-control-with-tooltip",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Replace media library video preview with Videopack player', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.replace_preview_video,
          checked: !!replace_preview_video
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_3__["default"], {
          text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Enhance the default WordPress video preview in the media library with Videopack's features and player settings.", 'video-embed-thumbnail-generator')
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
        className: "videopack-control-with-tooltip",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Allow video attachment URL rewriting', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.rewrite_attachment_url,
          checked: !!rewrite_attachment_url
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_3__["default"], {
          text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('If your videos are hosted on a CDN, WordPress might return incorrect URLs for attachments in the Media Library. Disable this setting if Videopack is changing your URLs to local files instead of the CDN.', 'video-embed-thumbnail-generator')
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Flex, {
        direction: "column",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.FlexItem, {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.BaseControl, {
            __nextHasNoMarginBottom: true,
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('When deleting videos, also delete associated', 'video-embed-thumbnail-generator'),
            id: 'videopack-delete-options',
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.CheckboxControl, {
              __nextHasNoMarginBottom: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Thumbnails', 'video-embed-thumbnail-generator'),
              checked: delete_child_thumbnails,
              onChange: changeHandlerFactory.delete_child_thumbnails
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.CheckboxControl, {
              __nextHasNoMarginBottom: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Encoded Videos', 'video-embed-thumbnail-generator'),
              checked: delete_child_encoded,
              onChange: changeHandlerFactory.delete_child_encoded
            })]
          })
        })
      })]
    }), capabilities && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(RolesCheckboxes, {})]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (AdminSettings);

/***/ },

/***/ "./src/features/settings/components/EncodingSettings.js"
/*!**************************************************************!*\
  !*** ./src/features/settings/components/EncodingSettings.js ***!
  \**************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../utils/utils */ "./src/utils/utils.js");
/* harmony import */ var _hooks_useBatchProcess__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../hooks/useBatchProcess */ "./src/hooks/useBatchProcess.js");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _TextControlOnBlur__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./TextControlOnBlur */ "./src/features/settings/components/TextControlOnBlur.js");
/* harmony import */ var _PerCodecQualitySettings__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./PerCodecQualitySettings */ "./src/features/settings/components/PerCodecQualitySettings.js");
/* harmony import */ var _components_WatermarkSettingsPanel_WatermarkSettingsPanel__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../components/WatermarkSettingsPanel/WatermarkSettingsPanel */ "./src/components/WatermarkSettingsPanel/WatermarkSettingsPanel.js");
/* harmony import */ var _VideopackTooltip__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./VideopackTooltip */ "./src/features/settings/components/VideopackTooltip.js");
/* harmony import */ var _hooks_useResolutions__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../../hooks/useResolutions */ "./src/hooks/useResolutions.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__);
/* global videopack_config */












/**
 * EncodingSettings component.
 *
 * @param {Object} props                      Component props.
 * @param {Object} props.settings             Plugin settings.
 * @param {Object} props.changeHandlerFactory Factory for creating change handlers.
 * @param {Object} props.ffmpegTest           Results of the FFmpeg test.
 * @return {Object} The rendered component.
 */

const EncodingSettings = ({
  settings,
  changeHandlerFactory,
  ffmpegTest
}) => {
  const {
    isNetworkActive
  } = videopack_config;
  const {
    app_path,
    encode,
    hide_video_formats,
    enable_custom_resolution,
    custom_resolution,
    error_email,
    ffmpeg_watermark,
    audio_bitrate,
    audio_channels,
    simultaneous_encodes,
    threads,
    nice,
    ffmpeg_exists,
    ffmpeg_error,
    auto_encode,
    auto_encode_gif,
    sample_rotate,
    auto_publish_post
  } = settings;
  const [users, setUsers] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useState)(null);
  const encodingBatch = (0,_hooks_useBatchProcess__WEBPACK_IMPORTED_MODULE_2__["default"])();
  const handleEncodeAllVideos = () => {
    encodingBatch.confirmAndRun((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Are you sure you want to add all videos to the encoding queue? This will check every video in your library and add it to the queue if it hasn't been encoded yet.", 'video-embed-thumbnail-generator'), () => (0,_utils_utils__WEBPACK_IMPORTED_MODULE_1__.startBatchProcess)('encoding'), () => (0,_utils_utils__WEBPACK_IMPORTED_MODULE_1__.getBatchProgress)('encoding'), (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('No videos found to process.', 'video-embed-thumbnail-generator'));
  };
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useEffect)(() => {
    (0,_utils_utils__WEBPACK_IMPORTED_MODULE_1__.getUsersWithCapability)('edit_others_video_encodes').then(response => {
      setUsers(response);
    }).catch(error => {
      console.error(error);
    });
  }, []);
  const currentResolutions = (0,_hooks_useResolutions__WEBPACK_IMPORTED_MODULE_9__["default"])(enable_custom_resolution, custom_resolution);
  const EncodeFormatGrid = () => {
    const {
      codecs
    } = videopack_config;
    const {
      encode: currentEncode,
      ffmpeg_exists: ffmpegExists
    } = settings;
    const handleCheckboxChange = (codecId, resolutionId, isChecked) => {
      const newEncode = JSON.parse(JSON.stringify(currentEncode || {}));
      if (!newEncode[codecId]) {
        newEncode[codecId] = {
          resolutions: {}
        };
      } else if (!newEncode[codecId].resolutions) {
        newEncode[codecId].resolutions = {};
      }
      newEncode[codecId].resolutions[resolutionId] = !!isChecked;

      // If we're disabling the format that is currently the replacement format,
      // we should probably unset it or keep it enabled.
      // The backend ENSURES it is enabled if it's the replace_format,
      // but for UI consistency, let's keep it checked if it's selected as replacement.
      const formatId = `${codecId}_${resolutionId}`;
      if (!isChecked && settings.replace_format === formatId) {
        // Don't allow disabling the replacement format checkbox.
        // (Or we can allow it, but the backend will override).
        // Let's just make it enabled if it's the replacement.
      }
      changeHandlerFactory.encode(newEncode);
    };
    const handleCodecEnableChange = (codecId, isEnabled) => {
      const newEncode = JSON.parse(JSON.stringify(currentEncode || {}));
      const codecInfo = codecs.find(c => c.id === codecId);
      if (!newEncode[codecId]) {
        newEncode[codecId] = {
          resolutions: {}
        };
      }
      newEncode[codecId].enabled = !!isEnabled;
      if (isEnabled && codecInfo) {
        // Set default quality settings when enabling a codec for the first time
        if (!newEncode[codecId].rate_control) {
          newEncode[codecId].rate_control = codecInfo.supported_rate_controls[0];
          newEncode[codecId].crf = codecInfo.rate_control.crf.default;
          newEncode[codecId].vbr = codecInfo.rate_control.vbr.default;
        }
      }
      if (!isEnabled) {
        if (!newEncode[codecId].resolutions) {
          newEncode[codecId].resolutions = {};
        }
        currentResolutions.forEach(resolution => {
          newEncode[codecId].resolutions[resolution.id] = false;
        });
      }
      changeHandlerFactory.encode(newEncode);
    };
    const filteredResolutions = currentResolutions;
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
      className: "videopack-encode-grid",
      children: codecs.map(codec => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
        className: "videopack-encode-column",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
          className: "videopack-encode-grid-header-cell",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
            __nextHasNoMarginBottom: true,
            label: codec.name,
            checked: !!currentEncode?.[codec.id]?.enabled,
            onChange: isEnabled => handleCodecEnableChange(codec.id, isEnabled),
            disabled: ffmpegExists !== true
          })
        }), filteredResolutions.map(resolution => {
          const formatId = `${codec.id}_${resolution.id}`;
          const isReplacement = settings.replace_format === formatId;
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
            className: "videopack-encode-grid-row",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.CheckboxControl, {
              __nextHasNoMarginBottom: true,
              label: resolution.name,
              checked: isReplacement || !!currentEncode?.[codec.id]?.resolutions?.[resolution.id],
              onChange: isChecked => handleCheckboxChange(codec.id, resolution.id, isChecked),
              disabled: ffmpegExists !== true || !currentEncode?.[codec.id]?.enabled
            })
          }, formatId);
        })]
      }, codec.id))
    });
  };
  const errorEmailOptions = () => {
    const authorizedUsers = [{
      value: 'nobody',
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Nobody', 'video-embed-thumbnail-generator')
    }, {
      value: 'encoder',
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('User who initiated encoding', 'video-embed-thumbnail-generator')
    }];
    if (users) {
      users.forEach(user => {
        authorizedUsers.push({
          value: user.id,
          label: user.name
        });
      });
    }
    return authorizedUsers;
  };
  const VideoReplacementSettings = () => {
    const {
      replace_format
    } = settings;
    const {
      codecs
    } = videopack_config;

    // Extract current codec and resolution
    let currentCodecId = 'none';
    let currentResolutionId = 'fullres';
    if (replace_format && replace_format !== 'none') {
      const parts = replace_format.split('_');
      if (parts.length >= 2) {
        currentCodecId = parts[0];
        currentResolutionId = parts.slice(1).join('_');
      }
    }
    const codecOptions = [{
      value: 'none',
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('None', 'video-embed-thumbnail-generator')
    }, {
      value: 'same',
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Same format as original', 'video-embed-thumbnail-generator')
    }, ...codecs.map(codec => ({
      value: codec.id,
      label: codec.name
    }))];
    const resolutionOptions = currentResolutions.map(res => ({
      value: res.id,
      label: res.name
    }));
    const handleCodecChange = newCodecId => {
      if (newCodecId === 'none') {
        changeHandlerFactory.replace_format('none');
      } else {
        changeHandlerFactory.replace_format(`${newCodecId}_${currentResolutionId}`);
      }
    };
    const handleResolutionChange = newResolutionId => {
      if (currentCodecId !== 'none') {
        changeHandlerFactory.replace_format(`${currentCodecId}_${newResolutionId}`);
      }
    };
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
      className: "videopack-setting-reduced-width videopack-replacement-controls",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
        __nextHasNoMarginBottom: true,
        __next40pxDefaultSize: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Replace original video with', 'video-embed-thumbnail-generator'),
        value: currentCodecId,
        options: codecOptions,
        onChange: handleCodecChange
      }), currentCodecId !== 'none' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
        __nextHasNoMarginBottom: true,
        __next40pxDefaultSize: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Resolution', 'video-embed-thumbnail-generator'),
        value: currentResolutionId,
        options: resolutionOptions,
        onChange: handleResolutionChange
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_8__["default"], {
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Choose a format to replace the original uploaded video. If "None" is selected, the original video will be kept and additional formats will be created alongside it.', 'video-embed-thumbnail-generator')
      })]
    });
  };
  const SampleFormatSelects = () => {
    const {
      sample_codec,
      sample_resolution
    } = settings;
    const codecs = videopack_config.codecs.map(codec => ({
      value: codec.id,
      label: codec.name
    }));
    const resolutions = currentResolutions.map(resolution => ({
      value: resolution.id,
      label: resolution.name
    }));
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Flex, {
      className: 'videopack-setting-sample-formats',
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
        __nextHasNoMarginBottom: true,
        __next40pxDefaultSize: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Codec', 'video-embed-thumbnail-generator'),
        value: sample_codec,
        options: codecs,
        onChange: changeHandlerFactory.sample_codec,
        disabled: ffmpeg_exists !== true
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
        __nextHasNoMarginBottom: true,
        __next40pxDefaultSize: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Resolution', 'video-embed-thumbnail-generator'),
        value: sample_resolution,
        options: resolutions,
        onChange: changeHandlerFactory.sample_resolution,
        disabled: ffmpeg_exists !== true
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
        className: "videopack-control-with-tooltip",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Test vertical video rotation', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.sample_rotate,
          checked: sample_rotate,
          disabled: ffmpeg_exists !== true
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_8__["default"], {
          text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Tests FFmpeg's ability to rotate vertical videos shot on mobile devices.", 'video-embed-thumbnail-generator')
        })]
      })]
    });
  };
  const generateNonCrfMarks = type => {
    const marks = [];
    switch (type) {
      case 'simultaneous':
        for (let i = 1; i <= 10; i++) {
          marks.push({
            value: i,
            label: String(i)
          });
        }
        break;
      case 'threads':
        marks.push({
          value: 0,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Auto', 'video-embed-thumbnail-generator')
        });
        for (let i = 2; i <= 16; i += 2) {
          marks.push({
            value: i,
            label: String(i)
          });
        }
        break;
    }
    return marks;
  };
  const audioBitrateOptions = [{
    value: '32',
    label: '32'
  }, {
    value: '64',
    label: '64'
  }, {
    value: '96',
    label: '96'
  }, {
    value: '128',
    label: '128'
  }, {
    value: '160',
    label: '160'
  }, {
    value: '192',
    label: '192'
  }, {
    value: '224',
    label: '224'
  }, {
    value: '256',
    label: '256'
  }, {
    value: '320',
    label: '320'
  }];
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_TextControlOnBlur__WEBPACK_IMPORTED_MODULE_5__["default"], {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Path to FFmpeg folder on server', 'video-embed-thumbnail-generator'),
          value: app_path,
          onChange: changeHandlerFactory.app_path,
          help: isNetworkActive ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('This setting is controlled at the network level.', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Leave blank if FFmpeg is in your system path.'),
          disabled: isNetworkActive,
          title: isNetworkActive ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('This setting is controlled by the network administrator.', 'video-embed-thumbnail-generator') : null
        })
      }), ffmpeg_exists !== true && ffmpeg_error && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
        className: "notice notice-error videopack-ffmpeg-notice",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("p", {
          dangerouslySetInnerHTML: {
            __html: ffmpeg_error
          }
        })
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Default video encode formats', 'video-embed-thumbnail-generator'),
      initialOpen: ffmpeg_exists === true,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("span", {
          className: "videopack-label-with-tooltip",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("strong", {
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('About formats', 'video-embed-thumbnail-generator')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_8__["default"], {
            text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('If you have FFmpeg and the proper libraries installed, you can choose to replace your uploaded video with your preferred format, and also transcode into several additional formats depending on the resolution of your original source. Videopack will not upconvert your video, so if you upload a 720p video, it will not waste your time creating a 1080p version. Different browsers have different playback capabilities. All browsers on all devices can play H.264. VP8 is an open-source codec supported by most devices, but not as effecient as the newer codecs H.265, VP9, and AV1, which are not as universally supported. AV1 can also be extremely CPU intensive to encode. If you must use AV1, make sure you have the libsvtav1 FFmpeg library installed. The reference libaom-av1 encoder is more commonly available in FFmpeg builds, but is much slower.', 'video-embed-thumbnail-generator')
          })]
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(EncodeFormatGrid, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(VideoReplacementSettings, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
        __nextHasNoMarginBottom: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Enable Custom Resolution', 'video-embed-thumbnail-generator'),
        onChange: changeHandlerFactory.enable_custom_resolution,
        checked: !!enable_custom_resolution
      }), enable_custom_resolution && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
        className: "videopack-setting-auto-width",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Custom Resolution Height', 'video-embed-thumbnail-generator'),
          type: "number",
          value: custom_resolution || '',
          onChange: value => changeHandlerFactory.custom_resolution(value === '' ? 0 : parseInt(value, 10))
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
        className: "videopack-control-with-tooltip",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Show only default formats on admin pages'),
          onChange: changeHandlerFactory.hide_video_formats,
          checked: hide_video_formats,
          disabled: ffmpeg_exists !== true
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_8__["default"], {
          text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('To avoid cluttering the admin interface with too many options, you can choose to list only the default formats on WordPress admin pages.', 'video-embed-thumbnail-generator')
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Do automatically on upload', 'video-embed-thumbnail-generator'),
      initialOpen: ffmpeg_exists === true,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.BaseControl, {
        __nextHasNoMarginBottom: true,
        id: "autoEncode",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Encode default formats', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.auto_encode,
          checked: auto_encode,
          disabled: ffmpeg_exists !== true
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Convert animated GIFs to H.264', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.auto_encode_gif,
          checked: auto_encode_gif,
          disabled: ffmpeg_exists !== true
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
        className: "videopack-control-with-tooltip",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Automatically publish video's parent post when encoding finishes"),
          onChange: changeHandlerFactory.auto_publish_post,
          checked: auto_publish_post,
          disabled: ffmpeg_exists !== true
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_8__["default"], {
          text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('If all videos in the encode queue attached to a draft post are completed, the draft post will be automatically published.', 'video-embed-thumbnail-generator')
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('For previously uploaded videos', 'video-embed-thumbnail-generator'),
      initialOpen: ffmpeg_exists === true,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
        className: "videopack-control-with-tooltip",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
          __next40pxDefaultSize: true,
          variant: "secondary",
          disabled: ffmpeg_exists !== true || encodingBatch.isProcessing,
          onClick: handleEncodeAllVideos,
          children: encodingBatch.isProcessing ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)(/* translators: 1: current count, 2: total count */
          (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Processing %1$d / %2$d', 'video-embed-thumbnail-generator'), encodingBatch.progress.current, encodingBatch.progress.total) : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Encode default formats', 'video-embed-thumbnail-generator')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_8__["default"], {
          text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Add every video in the Media Library to the encode queue if it hasn't already been encoded. Uses the default encode formats chosen above.", 'video-embed-thumbnail-generator')
        })]
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_components_WatermarkSettingsPanel_WatermarkSettingsPanel__WEBPACK_IMPORTED_MODULE_7__["default"], {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Watermark Overlay', 'video-embed-thumbnail-generator'),
      watermarkSettings: ffmpeg_watermark,
      onChange: changeHandlerFactory.ffmpeg_watermark,
      initialOpen: ffmpeg_exists === true,
      disabled: ffmpeg_exists !== true
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Email encoding errors to', 'video-embed-thumbnail-generator'),
      initialOpen: ffmpeg_exists === true,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
        className: "videopack-setting-auto-width",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          value: error_email,
          onChange: changeHandlerFactory.error_email,
          options: errorEmailOptions(),
          disabled: ffmpeg_exists !== true
        })
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Video quality', 'video-embed-thumbnail-generator'),
      initialOpen: ffmpeg_exists === true,
      children: videopack_config.codecs.map(codec => !!encode?.[codec.id]?.enabled && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_PerCodecQualitySettings__WEBPACK_IMPORTED_MODULE_6__["default"], {
        codec: codec,
        settings: settings,
        changeHandlerFactory: changeHandlerFactory
      }, codec.id))
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Audio', 'video-embed-thumbnail-generator'),
      initialOpen: ffmpeg_exists === true,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
        className: "videopack-setting-reduced-width",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Audio bitrate', 'video-embed-thumbnail-generator'),
          value: audio_bitrate,
          onChange: changeHandlerFactory.audio_bitrate,
          options: audioBitrateOptions,
          suffix: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.__experimentalInputControlSuffixWrapper, {
            children: "kbps"
          }),
          disabled: ffmpeg_exists !== true
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Always output stereo audio', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.audio_channels,
          checked: audio_channels,
          disabled: ffmpeg_exists !== true
        })]
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Execution', 'video-embed-thumbnail-generator'),
      initialOpen: ffmpeg_exists === true && !isNetworkActive,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.RangeControl, {
        __nextHasNoMarginBottom: true,
        __next40pxDefaultSize: true,
        label: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("span", {
          className: "videopack-label-with-tooltip",
          children: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Simultaneous encodes', 'video-embed-thumbnail-generator'), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_8__["default"], {
            text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Increasing the number will allow FFmpeg to encode more than one file at a time, but may lead to FFmpeg monopolizing system resources.', 'video-embed-thumbnail-generator')
          })]
        }),
        value: simultaneous_encodes,
        className: "videopack-settings-slider",
        onChange: changeHandlerFactory.simultaneous_encodes,
        min: 1,
        max: 10,
        step: 1,
        marks: generateNonCrfMarks('simultaneous'),
        disabled: isNetworkActive || ffmpeg_exists !== true,
        title: isNetworkActive ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('This setting is controlled by the network administrator.', 'video-embed-thumbnail-generator') : null,
        help: isNetworkActive ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('This setting is controlled at the network level.', 'video-embed-thumbnail-generator') : null
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.RangeControl, {
        __nextHasNoMarginBottom: true,
        __next40pxDefaultSize: true,
        label: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("span", {
          className: "videopack-label-with-tooltip",
          children: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Threads', 'video-embed-thumbnail-generator'), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_8__["default"], {
            text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Default is 1, which limits encoding speed but prevents encoding from using too many system resources. Selecting 0 will allow FFmpeg to optimize the number of threads or you can set the number manually. This may lead to FFmpeg monopolizing system resources.', 'video-embed-thumbnail-generator')
          })]
        }),
        value: threads,
        className: "videopack-settings-slider",
        onChange: changeHandlerFactory.threads,
        min: 0,
        max: 16,
        step: 1,
        marks: generateNonCrfMarks('threads'),
        disabled: isNetworkActive || ffmpeg_exists !== true,
        title: isNetworkActive ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('This setting is controlled by the network administrator.', 'video-embed-thumbnail-generator') : null,
        help: isNetworkActive ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('This setting is controlled at the network level.', 'video-embed-thumbnail-generator') : null
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
        __nextHasNoMarginBottom: true,
        label: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("span", {
          className: "videopack-label-with-tooltip",
          children: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Run nice', 'video-embed-thumbnail-generator'), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_8__["default"], {
            text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Tells FFmpeg to run at a lower priority on Linux/Unix systems to avoid monopolizing system resources.', 'video-embed-thumbnail-generator')
          })]
        }),
        className: "videopack-flex-align-center",
        onChange: changeHandlerFactory.nice,
        checked: nice,
        disabled: isNetworkActive || ffmpeg_exists !== true,
        title: isNetworkActive ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('This setting is controlled by the network administrator.', 'video-embed-thumbnail-generator') : null,
        help: isNetworkActive ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('This setting is controlled at the network level.', 'video-embed-thumbnail-generator') : null
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Video Encoding Test', 'video-embed-thumbnail-generator'),
      initialOpen: ffmpeg_exists === true,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.BaseControl, {
        __nextHasNoMarginBottom: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Test encode command', 'video-embed-thumbnail-generator'),
        id: "sample-format-selects",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(SampleFormatSelects, {})
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextareaControl, {
        __nextHasNoMarginBottom: true,
        disabled: true,
        value: ffmpegTest?.command
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextareaControl, {
        __nextHasNoMarginBottom: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('FFmpeg test output', 'video-embed-thumbnail-generator'),
        rows: 20,
        disabled: true,
        value: ffmpegTest?.output
      })]
    }), encodingBatch.confirmDialog.isOpen && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.__experimentalConfirmDialog, {
      isOpen: true,
      onConfirm: () => {
        if (encodingBatch.confirmDialog.onConfirm) {
          encodingBatch.confirmDialog.onConfirm();
        }
        encodingBatch.closeConfirmDialog();
      },
      onCancel: encodingBatch.closeConfirmDialog,
      confirmButtonText: encodingBatch.confirmDialog.isAlert ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('OK', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('OK', 'video-embed-thumbnail-generator'),
      children: encodingBatch.confirmDialog.message
    })]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (EncodingSettings);

/***/ },

/***/ "./src/features/settings/components/FreemiusPage.js"
/*!**********************************************************!*\
  !*** ./src/features/settings/components/FreemiusPage.js ***!
  \**********************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../utils/utils */ "./src/utils/utils.js");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__);




/**
 * A component to render Freemius pages fetched via the REST API.
 * It handles dangerously setting the HTML and executing any inline scripts.
 *
 * @param {Object} props      Component props.
 * @param {string} props.page The Freemius page slug ('account' or 'add-ons').
 * @return {JSX.Element} The rendered component.
 */

const FreemiusPage = ({
  page
}) => {
  const [content, setContent] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const [isLoading, setIsLoading] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(true);
  const containerRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    setIsLoading(true);
    (0,_utils_utils__WEBPACK_IMPORTED_MODULE_1__.getFreemiusPage)(page).then(response => {
      setContent(response.html);
      setIsLoading(false);
    }).catch(error => {
      // eslint-disable-next-line no-console
      console.error(`Error fetching Freemius page '${page}':`, error);
      setContent(`<div class="notice notice-error"><p>Error loading page: ${error.message}</p></div>`);
      setIsLoading(false);
    });
  }, [page]);

  // Effect to execute scripts after the HTML content is rendered.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (!content || !containerRef.current) {
      return;
    }
    const container = containerRef.current;
    const scripts = Array.from(container.querySelectorAll('script'));
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      for (const attr of oldScript.attributes) {
        newScript.setAttribute(attr.name, attr.value);
      }
      newScript.text = oldScript.text;
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }, [content]);
  if (isLoading) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Spinner, {});
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
    className: "freemius-page-container",
    ref: containerRef,
    dangerouslySetInnerHTML: {
      __html: content
    }
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (FreemiusPage);

/***/ },

/***/ "./src/features/settings/components/PerCodecQualitySettings.js"
/*!*********************************************************************!*\
  !*** ./src/features/settings/components/PerCodecQualitySettings.js ***!
  \*********************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/compose */ "@wordpress/compose");
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_compose__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _VideopackTooltip__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./VideopackTooltip */ "./src/features/settings/components/VideopackTooltip.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__);
/* global videopack_config */







const PerCodecQualitySettings = ({
  codec,
  settings,
  changeHandlerFactory
}) => {
  const [bitrates, setBitrates] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)([]);
  const {
    resolutions
  } = videopack_config;
  const {
    encode,
    ffmpeg_exists,
    h264_profile,
    h264_level,
    h265_profile,
    h265_level
  } = settings;
  const codecEncodeSettings = encode[codec.id] || {};
  const {
    rate_control: currentRateControl = codec.supported_rate_controls[0],
    crf: currentCrf = codec.rate_control.crf.default,
    vbr: currentVbr = codec.rate_control.vbr.default
  } = codecEncodeSettings;
  const [localCrf, setLocalCrf] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(currentCrf);
  const [localVbr, setLocalVbr] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(currentVbr);
  const h264ProfileOptions = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useMemo)(() => [{
    value: 'none',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('None', 'video-embed-thumbnail-generator')
  }, {
    value: 'baseline',
    label: 'baseline'
  }, {
    value: 'main',
    label: 'main'
  }, {
    value: 'high',
    label: 'high'
  }, {
    value: 'high10',
    label: 'high10'
  }, {
    value: 'high422',
    label: 'high422'
  }, {
    value: 'high444',
    label: 'high444'
  }], []);
  const h265ProfileOptions = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useMemo)(() => [{
    value: 'none',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('None', 'video-embed-thumbnail-generator')
  }, {
    value: 'main',
    label: 'main'
  }, {
    value: 'main10',
    label: 'main10'
  }], []);
  const h265LevelOptions = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useMemo)(() => [{
    value: 'none',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('None', 'video-embed-thumbnail-generator')
  }, {
    value: '1',
    label: '1'
  }, {
    value: '2',
    label: '2'
  }, {
    value: '2.1',
    label: '2.1'
  }, {
    value: '3',
    label: '3'
  }, {
    value: '3.1',
    label: '3.1'
  }, {
    value: '4',
    label: '4'
  }, {
    value: '4.1',
    label: '4.1'
  }, {
    value: '5',
    label: '5'
  }, {
    value: '5.1',
    label: '5.1'
  }, {
    value: '5.2',
    label: '5.2'
  }, {
    value: '6',
    label: '6'
  }, {
    value: '6.1',
    label: '6.1'
  }, {
    value: '6.2',
    label: '6.2'
  }], []);
  const h264LevelOptions = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useMemo)(() => [{
    value: 'none',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('None', 'video-embed-thumbnail-generator')
  }, {
    value: '1',
    label: '1'
  }, {
    value: '1.1',
    label: '1.1'
  }, {
    value: '1.2',
    label: '1.2'
  }, {
    value: '1.3',
    label: '1.3'
  }, {
    value: '2',
    label: '2'
  }, {
    value: '2.1',
    label: '2.1'
  }, {
    value: '2.2',
    label: '2.2'
  }, {
    value: '3',
    label: '3'
  }, {
    value: '3.1',
    label: '3.1'
  }, {
    value: '3.2',
    label: '3.2'
  }, {
    value: '4',
    label: '4'
  }, {
    value: '4.1',
    label: '4.1'
  }, {
    value: '4.2',
    label: '4.2'
  }, {
    value: '5',
    label: '5'
  }, {
    value: '5.1',
    label: '5.1'
  }, {
    value: '5.2',
    label: '5.2'
  }, {
    value: '6',
    label: '6'
  }, {
    value: '6.1',
    label: '6.1'
  }, {
    value: '6.2',
    label: '6.2'
  }], []);
  const generateMarks = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useCallback)(type => {
    const rateControl = codec.rate_control[type];
    if (!rateControl) {
      return [];
    }
    if (type === 'vbr') {
      const marks = [{
        value: 0.1,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('0.1: lower quality', 'video-embed-thumbnail-generator')
      }, {
        value: 50,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('50: higher quality', 'video-embed-thumbnail-generator')
      }];
      if (rateControl.default) {
        const existingMark = marks.find(m => m.value === rateControl.default);
        const defaultLabel = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)(/* translators: %s: VBR value. */
        (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('%s: default', 'video-embed-thumbnail-generator'), rateControl.default);
        if (existingMark) {
          existingMark.label = defaultLabel;
        } else {
          marks.push({
            value: rateControl.default,
            label: defaultLabel
          });
        }
      }
      for (let i = 5; i < 50; i += 5) {
        if (marks.find(m => m.value === i)) {
          continue;
        }
        if (rateControl.default) {
          if (Math.abs(i - rateControl.default) <= 2) {
            continue;
          }
        }
        marks.push({
          value: i,
          label: String(i)
        });
      }
      marks.sort((a, b) => a.value - b.value);
      return marks;
    }
    const {
      min,
      max,
      labels: originalLabels = {},
      default: defaultValue
    } = rateControl;
    const labels = {
      ...originalLabels
    }; // create a mutable copy

    // Add the 'Default' label if there isn't already a label for the default value
    if (defaultValue !== undefined && !labels[defaultValue]) {
      labels[defaultValue] = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)(/* translators: %d: CRF value. */
      (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('%d: default', 'video-embed-thumbnail-generator'), defaultValue);
    }
    labels[min] = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)(/* translators: %d: CRF value. */
    (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('%d: higher quality', 'video-embed-thumbnail-generator'), min);
    labels[max] = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)(/* translators: %d: CRF value. */
    (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('%d: lower quality', 'video-embed-thumbnail-generator'), max);
    const marks = [];
    for (let i = min; i <= max; i++) {
      if (labels && labels[i]) {
        marks.push({
          value: i,
          label: labels[i]
        });
      } else if (i % 5 === 0) {
        const labelExistsNearby = Object.keys(labels).some(label => {
          const distance = Math.abs(i - label);
          return distance > 0 && distance < 5;
        });
        if (!labelExistsNearby) {
          marks.push({
            value: i,
            label: String(i)
          });
        }
      }
    }
    return marks;
  }, [codec]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => setLocalCrf(currentCrf), [currentCrf]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => setLocalVbr(currentVbr), [currentVbr]);
  const settingsRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useRef)(settings);
  const changeHandlerFactoryRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useRef)(changeHandlerFactory);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    settingsRef.current = settings;
    changeHandlerFactoryRef.current = changeHandlerFactory;
  }, [settings, changeHandlerFactory]);
  const performUpdate = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useCallback)((key, value) => {
    const currentEncode = settingsRef.current.encode;
    changeHandlerFactoryRef.current.encode({
      ...currentEncode,
      [codec.id]: {
        ...currentEncode[codec.id],
        [key]: value
      }
    });
  }, [codec.id]);
  const debouncedUpdate = (0,_wordpress_compose__WEBPACK_IMPORTED_MODULE_2__.useDebounce)(performUpdate, 500);
  const handleSettingChange = (key, value) => {
    if (key === 'rate_control') {
      // Immediate update for radio buttons
      changeHandlerFactory.encode({
        ...encode,
        [codec.id]: {
          ...encode[codec.id],
          [key]: value
        }
      });
      return;
    }
    if (key === 'crf') {
      setLocalCrf(value);
    } else if (key === 'vbr') {
      setLocalVbr(value);
    }
    debouncedUpdate(key, value);
  };
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    const newBitrates = [];
    const vbrSettings = codec.rate_control.vbr;
    resolutions.forEach(res => {
      let width = res.width;
      let height = res.height;
      if (!width || !height) {
        const parsedHeight = parseInt(res.id, 10);
        if (!isNaN(parsedHeight)) {
          height = parsedHeight;
          width = Math.ceil(height * 16 / 9);
        }
      }
      if (width && height) {
        const bitrate = Math.round(localVbr * 0.0001 * width * height + vbrSettings.constant);
        newBitrates.push({
          label: `${height}`,
          value: `${bitrate}`
        });
      }
    });
    setBitrates(newBitrates);
  }, [localVbr, codec]);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
    className: "videopack-per-codec-quality-settings",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("h4", {
      className: "videopack-codec-quality-header",
      children: codec.name
    }), codec.supported_rate_controls.length > 1 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.RadioControl, {
      label: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("span", {
        className: "videopack-label-with-tooltip",
        children: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Primary rate control:', 'video-embed-thumbnail-generator'), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_4__["default"], {
          text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('CRF prioritizes a consistent level of quality over consistent file sizes. Lower numbers are better quality. ABR prioritizes consistent file sizes. If you choose ABR, Videopack will automatically calculate bitrates for different resolutions based on the relative quality you select.', 'video-embed-thumbnail-generator')
        })]
      }),
      selected: currentRateControl,
      onChange: value => handleSettingChange('rate_control', value),
      options: [{
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Constant Rate Factor (CRF)', 'video-embed-thumbnail-generator'),
        value: 'crf'
      }, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Average Bitrate (ABR)', 'video-embed-thumbnail-generator'),
        value: 'vbr'
      }],
      disabled: ffmpeg_exists !== true
    }), currentRateControl === 'crf' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.RangeControl, {
      __nextHasNoMarginBottom: true,
      __next40pxDefaultSize: true,
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('CRF:', 'video-embed-thumbnail-generator'),
      value: localCrf,
      className: "videopack-crf-slider",
      onChange: value => handleSettingChange('crf', value),
      min: codec.rate_control.crf.min,
      max: codec.rate_control.crf.max,
      step: 1,
      marks: generateMarks('crf'),
      disabled: ffmpeg_exists !== true
    }), currentRateControl === 'vbr' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.RangeControl, {
      __nextHasNoMarginBottom: true,
      __next40pxDefaultSize: true,
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Quality:', 'video-embed-thumbnail-generator'),
      value: localVbr,
      className: "videopack-abr-slider",
      onChange: value => handleSettingChange('vbr', value),
      min: 0.1,
      max: 50,
      step: 0.5,
      marks: generateMarks('vbr'),
      disabled: ffmpeg_exists !== true,
      help: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("span", {
        className: "videopack-bitrate-grid",
        children: bitrates.map((item, index) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("span", {
          children: [item.label, "p =", ' ', /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("strong", {
            children: item.value
          }), " kbps"]
        }, index))
      })
    }), codec.id === 'h264' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
      className: "videopack-setting-reduced-width",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.SelectControl, {
        __nextHasNoMarginBottom: true,
        __next40pxDefaultSize: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('H.264 profile', 'video-embed-thumbnail-generator'),
        value: h264_profile,
        onChange: changeHandlerFactory.h264_profile,
        options: h264ProfileOptions,
        disabled: ffmpeg_exists !== true
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.SelectControl, {
        __nextHasNoMarginBottom: true,
        __next40pxDefaultSize: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('H.264 level', 'video-embed-thumbnail-generator'),
        value: h264_level,
        onChange: changeHandlerFactory.h264_level,
        options: h264LevelOptions,
        disabled: ffmpeg_exists !== true
      })]
    }), codec.id === 'h265' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
      className: "videopack-setting-reduced-width",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.SelectControl, {
        __nextHasNoMarginBottom: true,
        __next40pxDefaultSize: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('H.265 profile', 'video-embed-thumbnail-generator'),
        value: h265_profile,
        onChange: changeHandlerFactory.h265_profile,
        options: h265ProfileOptions,
        disabled: ffmpeg_exists !== true
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.SelectControl, {
        __nextHasNoMarginBottom: true,
        __next40pxDefaultSize: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('H.265 level', 'video-embed-thumbnail-generator'),
        value: h265_level,
        onChange: changeHandlerFactory.h265_level,
        options: h265LevelOptions,
        disabled: ffmpeg_exists !== true
      })]
    })]
  }, codec.id);
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PerCodecQualitySettings);

/***/ },

/***/ "./src/features/settings/components/PlayerSettings.js"
/*!************************************************************!*\
  !*** ./src/features/settings/components/PlayerSettings.js ***!
  \************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/hooks */ "@wordpress/hooks");
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _assets_icon__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../assets/icon */ "./src/assets/icon.js");
/* harmony import */ var _components_VideoPlayer_VideoPlayer__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../components/VideoPlayer/VideoPlayer */ "./src/components/VideoPlayer/VideoPlayer.js");
/* harmony import */ var _components_PreviewIframe_PreviewIframe__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../components/PreviewIframe/PreviewIframe */ "./src/components/PreviewIframe/PreviewIframe.js");
/* harmony import */ var _components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../components/CompactColorPicker/CompactColorPicker */ "./src/components/CompactColorPicker/CompactColorPicker.js");
/* harmony import */ var _utils_colors__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../utils/colors */ "./src/utils/colors.js");
/* harmony import */ var _VideopackTooltip__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./VideopackTooltip */ "./src/features/settings/components/VideopackTooltip.js");
/* harmony import */ var _components_WatermarkSettingsPanel_WatermarkSettingsPanel__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../../components/WatermarkSettingsPanel/WatermarkSettingsPanel */ "./src/components/WatermarkSettingsPanel/WatermarkSettingsPanel.js");
/* harmony import */ var _hooks_useResolutions__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../../hooks/useResolutions */ "./src/hooks/useResolutions.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__);
/* global videopack_config */














const PlayerSettings = ({
  settings,
  setSettings,
  changeHandlerFactory
}) => {
  const {
    embed_method,
    overlay_title,
    watermark,
    watermark_styles,
    watermark_link_to,
    watermark_url,
    align,
    resize,
    auto_res,
    enable_custom_resolution,
    custom_resolution,
    auto_codec,
    pixel_ratio,
    find_formats,
    fullwidth,
    width,
    height,
    legacy_dimensions,
    fixed_aspect,
    controls,
    playsinline,
    pauseothervideos,
    volume,
    preload,
    skin,
    embeddable,
    embedcode,
    downloadlink,
    inline,
    view_count,
    autoplay,
    loop,
    muted,
    gifmode,
    playback_rate,
    encode,
    right_click,
    click_download,
    play_button_color,
    play_button_icon_color,
    control_bar_bg_color,
    control_bar_color,
    title_color,
    title_background_color
  } = settings;
  const currentResolutions = (0,_hooks_useResolutions__WEBPACK_IMPORTED_MODULE_11__["default"])(enable_custom_resolution, custom_resolution);
  const changeGifmode = value => {
    setSettings(prevSettings => ({
      ...prevSettings,
      gifmode: value,
      autoplay: value,
      loop: value,
      muted: value
    }));
    if (value) {
      setSettings(prevSettings => ({
        ...prevSettings,
        controls: false,
        embeddable: false,
        overlay_title: false,
        view_count: false,
        playsinline: true
      }));
    } else {
      setSettings(prevSettings => ({
        ...prevSettings,
        controls: true,
        embeddable: true
      }));
    }
  };
  const handleCodecCheckboxChange = (codecId, isEnabled) => {
    const newEncode = JSON.parse(JSON.stringify(settings.encode || {}));
    const {
      codecs,
      resolutions
    } = videopack_config;
    const codecInfo = codecs.find(c => c.id === codecId);
    if (!newEncode[codecId]) {
      newEncode[codecId] = {
        resolutions: {}
      };
    }
    newEncode[codecId].enabled = !!isEnabled;
    if (isEnabled && codecInfo) {
      // Set default quality settings when enabling a codec for the first time
      if (!newEncode[codecId].rate_control) {
        newEncode[codecId].rate_control = codecInfo.supported_rate_controls[0];
        newEncode[codecId].crf = codecInfo.rate_control.crf.default;
        newEncode[codecId].vbr = codecInfo.rate_control.vbr.default;
      }
    }
    if (!isEnabled) {
      if (!newEncode[codecId].resolutions) {
        newEncode[codecId].resolutions = {};
      }
      resolutions.forEach(resolution => {
        newEncode[codecId].resolutions[resolution.id] = false;
      });
    }
    changeHandlerFactory.encode(newEncode);
  };
  const embedMethodOptions = (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__.applyFilters)('videopack_embed_method_options', [{
    value: 'Video.js',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Video.js', 'video-embed-thumbnail-generator')
  }, {
    value: 'WordPress Default',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('WordPress Default', 'video-embed-thumbnail-generator')
  }, {
    value: 'None',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('None', 'video-embed-thumbnail-generator')
  }]);
  const preloadOptions = [{
    value: 'auto',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Auto', 'video-embed-thumbnail-generator')
  }, {
    value: 'metadata',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Metadata', 'video-embed-thumbnail-generator')
  }, {
    value: 'none',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__._x)('None', 'Preload value')
  }];
  const fixedAspectOptions = [{
    value: 'false',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('None', 'video-embed-thumbnail-generator')
  }, {
    value: 'true',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('All', 'video-embed-thumbnail-generator')
  }, {
    value: 'vertical',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Vertical Videos', 'video-embed-thumbnail-generator')
  }];
  const watermarkLinkOptions = [{
    value: 'home',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Home page', 'video-embed-thumbnail-generator')
  }, {
    value: 'parent',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Parent post', 'video-embed-thumbnail-generator')
  }, {
    value: 'attachment',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Video attachment page', 'video-embed-thumbnail-generator')
  }, {
    value: 'download',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Download video', 'video-embed-thumbnail-generator')
  }, {
    value: 'custom',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Custom URL', 'video-embed-thumbnail-generator')
  }, {
    value: 'false',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('None', 'video-embed-thumbnail-generator')
  }];
  const skinOptions = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    const options = [{
      value: 'vjs-theme-videopack',
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Videopack', 'video-embed-thumbnail-generator')
    }, {
      value: 'kg-video-js-skin',
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Videopack Classic', 'video-embed-thumbnail-generator')
    }, {
      value: 'default',
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Video.js default', 'video-embed-thumbnail-generator')
    }, {
      value: 'vjs-theme-city',
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('City', 'video-embed-thumbnail-generator')
    }, {
      value: 'vjs-theme-fantasy',
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Fantasy', 'video-embed-thumbnail-generator')
    }, {
      value: 'vjs-theme-forest',
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Forest', 'video-embed-thumbnail-generator')
    }, {
      value: 'vjs-theme-sea',
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Sea', 'video-embed-thumbnail-generator')
    }];
    return (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__.applyFilters)('videopack_player_skin_options', options, embed_method);
  }, [embed_method]);
  const alignOptions = [{
    value: '',
    label: videopack_config.contentSize ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)(/* translators: %s: Content size in pixels. */
    (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)("None (use theme's default width: %s)", 'video-embed-thumbnail-generator'), videopack_config.contentSize) : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)("None (use theme's default width)", 'video-embed-thumbnail-generator')
  }, {
    value: 'wide',
    label: videopack_config.wideSize ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)(/* translators: %s: Wide size in pixels. */
    (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)("Wide (use theme's wide width: %s)", 'video-embed-thumbnail-generator'), videopack_config.wideSize) : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)("Wide (use theme's wide width)", 'video-embed-thumbnail-generator')
  }, {
    value: 'full',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Full width', 'video-embed-thumbnail-generator')
  }, {
    value: 'left',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Left', 'video-embed-thumbnail-generator')
  }, {
    value: 'center',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Center', 'video-embed-thumbnail-generator')
  }, {
    value: 'right',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Right', 'video-embed-thumbnail-generator')
  }];
  const autoResOptions = () => {
    const items = [{
      value: 'automatic',
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Automatic', 'video-embed-thumbnail-generator')
    }, {
      value: 'highest',
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Highest', 'video-embed-thumbnail-generator')
    }, {
      value: 'lowest',
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Lowest', 'video-embed-thumbnail-generator')
    }];
    currentResolutions.forEach(resolution => {
      items.push({
        value: resolution.id,
        label: resolution.name
      });
    });
    return items;
  };
  const autoCodecOptions = () => {
    const items = [];
    videopack_config.codecs.forEach(codec => {
      items.push({
        value: codec.id,
        label: codec.name
      });
    });
    return items;
  };
  const handleVideoPlayerReady = () => {};
  const watermarkSettings = {
    url: watermark,
    ...watermark_styles
  };
  const handleWatermarkChange = newSettings => {
    const {
      url,
      ...styles
    } = newSettings;
    changeHandlerFactory.watermark(url);
    changeHandlerFactory.watermark_styles(styles);
  };
  const PLAYER_COLOR_FALLBACKS = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_utils_colors__WEBPACK_IMPORTED_MODULE_8__.getColorFallbacks)(settings), [settings]);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, {
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("div", {
        className: "videopack-setting-reduced-width",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Video player', 'video-embed-thumbnail-generator'),
          value: embed_method,
          onChange: value => {
            changeHandlerFactory.embed_method(value);
            const defaultSkin = (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__.applyFilters)('videopack_default_skin', value === 'WordPress Default' ? 'vjs-theme-videopack' : undefined, value);
            if (defaultSkin) {
              changeHandlerFactory.skin(defaultSkin);
            }
          },
          options: embedMethodOptions
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_9__["default"], {
          text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Video.js version 8 is the default player. You can also choose the WordPress Default Mediaelement.js player which may already be skinned to match your theme. Selecting "None" will disable all plugin-related CSS and JS on the front end.', 'video-embed-thumbnail-generator')
        })]
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, {
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("div", {
        className: `videopack-sample-video-player align${align || 'none'}`,
        style: {
          '--wp--style--global--content-size': videopack_config.contentSize || '800px',
          '--wp--style--global--wide-size': videopack_config.wideSize || '1000px'
        },
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Flex, {
            className: "videopack-flex-bottom",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.FlexBlock, {
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
                __nextHasNoMarginBottom: true,
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Title', 'video-embed-thumbnail-generator'),
                onChange: changeHandlerFactory.overlay_title,
                checked: !!overlay_title
              })
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.FlexBlock, {
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
                __nextHasNoMarginBottom: true,
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Download link', 'video-embed-thumbnail-generator'),
                onChange: changeHandlerFactory.downloadlink,
                checked: !!downloadlink
              })
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.FlexBlock, {
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.FlexItem, {
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
                  __nextHasNoMarginBottom: true,
                  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Embed code', 'video-embed-thumbnail-generator'),
                  onChange: changeHandlerFactory.embedcode,
                  checked: !!embedcode,
                  disabled: !embeddable
                })
              })
            })]
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_components_PreviewIframe_PreviewIframe__WEBPACK_IMPORTED_MODULE_6__["default"], {
          title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Video Player Preview', 'video-embed-thumbnail-generator'),
          resizeDependencies: [align],
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
            className: `wp-block-videopack-videopack-video${align ? ` align${align}` : ''}`,
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_components_VideoPlayer_VideoPlayer__WEBPACK_IMPORTED_MODULE_5__["default"], {
              attributes: {
                ...settings,
                sources: [{
                  src: videopack_config.url + '/src/images/Adobestock_469037984.mp4',
                  type: 'video/mp4'
                }],
                id: 'sample-video',
                title: 'Sample Video',
                overlay_title,
                width: undefined,
                height: undefined,
                starts: 23,
                embedlink: 'https://www.website.com/embed/',
                caption: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)("If text is entered in the attachment's caption field it is displayed here automatically.")
              },
              onReady: handleVideoPlayerReady
            })
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, {
          className: "videopack-flex-right",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
            __nextHasNoMarginBottom: true,
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('View count', 'video-embed-thumbnail-generator'),
            onChange: changeHandlerFactory.view_count,
            checked: !!view_count
          })
        })]
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Colors', 'video-embed-thumbnail-generator'),
      children: [embed_method.startsWith('Video.js') && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
        className: "videopack-setting-reduced-width",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Skin', 'video-embed-thumbnail-generator'),
          value: skin,
          onChange: changeHandlerFactory.skin,
          options: skinOptions
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("div", {
        className: "videopack-color-section",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("p", {
          className: "videopack-settings-section-title",
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Title overlay', 'video-embed-thumbnail-generator')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("div", {
          className: "videopack-color-flex-row",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_7__["default"], {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Text', 'video-embed-thumbnail-generator'),
              value: title_color,
              onChange: changeHandlerFactory.title_color,
              colors: videopack_config.themeColors,
              fallbackValue: PLAYER_COLOR_FALLBACKS.title_color
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_7__["default"], {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Background', 'video-embed-thumbnail-generator'),
              value: title_background_color,
              onChange: changeHandlerFactory.title_background_color,
              colors: videopack_config.themeColors,
              fallbackValue: PLAYER_COLOR_FALLBACKS.title_background_color
            })
          })]
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("div", {
        className: "videopack-color-section",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("p", {
          className: "videopack-settings-section-title",
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Player', 'video-embed-thumbnail-generator')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("div", {
          className: "videopack-color-flex-row",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_7__["default"], {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Play Button (Accent)', 'video-embed-thumbnail-generator'),
              value: play_button_color,
              onChange: changeHandlerFactory.play_button_color,
              colors: videopack_config.themeColors,
              fallbackValue: PLAYER_COLOR_FALLBACKS.play_button_color
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_7__["default"], {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Play Button Icon', 'video-embed-thumbnail-generator'),
              value: play_button_icon_color,
              onChange: changeHandlerFactory.play_button_icon_color,
              colors: videopack_config.themeColors,
              fallbackValue: PLAYER_COLOR_FALLBACKS.play_button_icon_color
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_7__["default"], {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Control Bar Background', 'video-embed-thumbnail-generator'),
              value: control_bar_bg_color,
              onChange: changeHandlerFactory.control_bar_bg_color,
              colors: videopack_config.themeColors,
              fallbackValue: PLAYER_COLOR_FALLBACKS.control_bar_bg_color
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
            className: "videopack-color-flex-item",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_7__["default"], {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Control Bar Icons', 'video-embed-thumbnail-generator'),
              value: control_bar_color,
              onChange: changeHandlerFactory.control_bar_color,
              colors: videopack_config.themeColors,
              fallbackValue: PLAYER_COLOR_FALLBACKS.control_bar_color
            })
          })]
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Default Playback', 'video-embed-thumbnail-generator'),
      initialOpen: true,
      className: "videopack-setting-default-playback",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Flex, {
        "align-items": "flex-start",
        expanded: false,
        gap: 20,
        justify: "flex-start",
        className: "videopack-player-settings-flex",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.FlexItem, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
            __nextHasNoMarginBottom: true,
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Autoplay', 'video-embed-thumbnail-generator'),
            onChange: changeHandlerFactory.autoplay,
            checked: !!autoplay,
            disabled: gifmode,
            help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Most browsers will only autoplay if the video starts muted.')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
            __nextHasNoMarginBottom: true,
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Pause other videos on page when starting a new video', 'video-embed-thumbnail-generator'),
            onChange: changeHandlerFactory.pauseothervideos,
            checked: !!pauseothervideos,
            disabled: gifmode
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
            __nextHasNoMarginBottom: true,
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Loop', 'video-embed-thumbnail-generator'),
            onChange: changeHandlerFactory.loop,
            checked: !!loop,
            disabled: gifmode
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
            __nextHasNoMarginBottom: true,
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Muted', 'video-embed-thumbnail-generator'),
            onChange: changeHandlerFactory.muted,
            checked: !!muted,
            disabled: gifmode
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.RangeControl, {
            __next40pxDefaultSize: true,
            __nextHasNoMarginBottom: true,
            className: "videopack-volume-control",
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Volume', 'video-embed-thumbnail-generator'),
            value: volume,
            beforeIcon: _assets_icon__WEBPACK_IMPORTED_MODULE_4__.volumeDown,
            afterIcon: _assets_icon__WEBPACK_IMPORTED_MODULE_4__.volumeUp,
            initialPosition: 1,
            withInputField: false,
            onChange: changeHandlerFactory.volume,
            min: 0,
            max: 1,
            step: 0.05,
            disabled: muted || gifmode
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.FlexItem, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
            __nextHasNoMarginBottom: true,
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Controls', 'video-embed-thumbnail-generator'),
            onChange: changeHandlerFactory.controls,
            checked: !!controls,
            disabled: gifmode
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
            __nextHasNoMarginBottom: true,
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Play inline', 'video-embed-thumbnail-generator'),
            onChange: changeHandlerFactory.playsinline,
            checked: !!playsinline,
            disabled: gifmode,
            help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Plays inline instead of fullscreen on iPhones.')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
            __nextHasNoMarginBottom: true,
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Variable speeds', 'video-embed-thumbnail-generator'),
            onChange: changeHandlerFactory.playback_rate,
            disabled: gifmode,
            checked: !!playback_rate
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.RadioControl, {
            label: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("span", {
              className: "videopack-label-with-tooltip",
              children: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Preload', 'video-embed-thumbnail-generator'), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_9__["default"], {
                text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Controls how much of a video to load before the user starts playback. Mobile browsers never preload any video information. Selecting "metadata" will load the height and width and format information along with a few seconds of the video in some desktop browsers. "Auto" will preload nearly a minute of video in most desktop browsers. "None" will prevent all data from preloading.', 'video-embed-thumbnail-generator')
              })]
            }),
            selected: preload,
            onChange: changeHandlerFactory.preload,
            options: preloadOptions,
            disabled: gifmode
          })]
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("div", {
        className: "videopack-control-with-tooltip",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('GIF mode', 'video-embed-thumbnail-generator'),
          onChange: value => {
            changeGifmode(value);
          },
          checked: !!gifmode
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_9__["default"], {
          text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Video acts like an animated GIF. Enables autoplay, loop, mute, and disables controls.', 'video-embed-thumbnail-generator')
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Dimensions', 'video-embed-thumbnail-generator'),
      initialOpen: true,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
        className: "videopack-setting-reduced-width",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Alignment / Width', 'video-embed-thumbnail-generator'),
          value: align,
          onChange: changeHandlerFactory.align,
          options: alignOptions
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.RadioControl, {
        label: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("span", {
          className: "videopack-label-with-tooltip",
          children: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Constrain to default aspect ratio', 'video-embed-thumbnail-generator'), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_9__["default"], {
            text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('When set to "none," the video player will automatically adjust to the aspect ratio of the video, but in some cases a fixed aspect ratio is required, and vertical videos often fit better on the page when shown in a shorter window.', 'video-embed-thumbnail-generator')
          })]
        }),
        selected: fixed_aspect,
        onChange: changeHandlerFactory.fixed_aspect,
        options: fixedAspectOptions,
        className: "videopack-setting-radio-group"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
        __nextHasNoMarginBottom: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Use legacy dimension settings', 'video-embed-thumbnail-generator'),
        onChange: changeHandlerFactory.legacy_dimensions,
        checked: !!legacy_dimensions
      }), legacy_dimensions && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.Fragment, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("span", {
          className: "videopack-setting-auto-width",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextControl, {
            __nextHasNoMarginBottom: true,
            __next40pxDefaultSize: true,
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Width', 'video-embed-thumbnail-generator'),
            type: "number",
            value: width,
            onChange: changeHandlerFactory.width
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("span", {
          className: "videopack-setting-auto-width",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextControl, {
            __nextHasNoMarginBottom: true,
            __next40pxDefaultSize: true,
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Height', 'video-embed-thumbnail-generator'),
            type: "number",
            value: height,
            onChange: changeHandlerFactory.height
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Make video display inline', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.inline,
          checked: !!inline
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Flex, {
          direction: "column",
          expanded: false,
          align: "flex-start",
          justify: "flex-start",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.FlexItem, {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
              __nextHasNoMarginBottom: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Shrink player to fit container', 'video-embed-thumbnail-generator'),
              onChange: changeHandlerFactory.resize,
              checked: !!resize
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("div", {
              className: "videopack-control-with-tooltip",
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
                __nextHasNoMarginBottom: true,
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Expand player to full width of container', 'video-embed-thumbnail-generator'),
                onChange: changeHandlerFactory.fullwidth,
                checked: !!fullwidth
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_9__["default"], {
                text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)("Enabling this will ignore any other width settings and set the width of the video to the width of the container it's in.", 'video-embed-thumbnail-generator')
              })]
            })]
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("div", {
        className: "videopack-setting-reduced-width",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Default codec', 'video-embed-thumbnail-generator'),
          value: auto_codec,
          onChange: changeHandlerFactory.auto_codec,
          options: autoCodecOptions()
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Default resolution', 'video-embed-thumbnail-generator'),
          value: auto_res,
          onChange: changeHandlerFactory.auto_res,
          options: autoResOptions()
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_9__["default"], {
          text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('If multiple resolutions for a video are available, you can choose to load the highest or lowest available resolution by default, automatically select the resolution based on the size of the video window, or indicate a particular resolution to use every time.', 'video-embed-thumbnail-generator')
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("div", {
        className: "videopack-control-with-tooltip",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Use device pixel ratio for resolution calculation', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.pixel_ratio,
          checked: !!pixel_ratio
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_9__["default"], {
          text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Most modern mobile devices and some very high-resolution desktop displays (what Apple calls a Retina display) use a pixel ratio to calculate the size of their viewport. Using the pixel ratio can result in a higher resolution being selected on mobile devices than on desktop devices. Because these devices actually have extremely high resolutions, and in a responsive design the video player usually takes up more of the screen than on a desktop browser, this is not a mistake, but your users might prefer to use less mobile data.', 'video-embed-thumbnail-generator')
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Sharing', 'video-embed-thumbnail-generator'),
      initialOpen: true,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
        __nextHasNoMarginBottom: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Allow users to embed your videos on other sites'),
        onChange: changeHandlerFactory.embeddable,
        checked: !!embeddable
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("div", {
        className: "videopack-control-with-tooltip",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Allow right-clicking on videos', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.right_click,
          checked: !!right_click
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_9__["default"], {
          text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)("We can't prevent a user from simply saving the downloaded video file from the browser's cache, but disabling right-clicking will make it more difficult for casual users to save your videos.", 'video-embed-thumbnail-generator')
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("div", {
        className: "videopack-control-with-tooltip",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Allow single-click download links', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.click_download,
          checked: !!click_download
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_9__["default"], {
          text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)("Videopack creates a one-click method for users who want to allow easy video downloading, but if some of your videos are hidden or private, depending on the methods you use, someone who guesses a video's WordPress database ID could potentially use the method to download videos they might not otherwise have access to.", 'video-embed-thumbnail-generator')
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_components_WatermarkSettingsPanel_WatermarkSettingsPanel__WEBPACK_IMPORTED_MODULE_10__["default"], {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Watermark Overlay', 'video-embed-thumbnail-generator'),
      watermarkSettings: watermarkSettings,
      onChange: handleWatermarkChange,
      initialOpen: true,
      children: watermark && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("div", {
        className: "videopack-setting-reduced-width",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Link to', 'video-embed-thumbnail-generator'),
          value: watermark_link_to,
          onChange: changeHandlerFactory.watermark_link_to,
          options: watermarkLinkOptions
        }), watermark_link_to === 'custom' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('URL', 'video-embed-thumbnail-generator'),
          type: "url",
          value: watermark_url,
          onChange: changeHandlerFactory.watermark_url
        })]
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Video Sources', 'video-embed-thumbnail-generator'),
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
        __nextHasNoMarginBottom: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Enable custom resolution', 'video-embed-thumbnail-generator'),
        onChange: changeHandlerFactory.enable_custom_resolution,
        checked: !!enable_custom_resolution
      }), enable_custom_resolution && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
        className: "videopack-setting-auto-width",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Custom Resolution Height', 'video-embed-thumbnail-generator'),
          type: "number",
          value: custom_resolution || '',
          onChange: value => changeHandlerFactory.custom_resolution(value === '' ? 0 : parseInt(value, 10))
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("div", {
        className: "videopack-control-with-tooltip",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Automatically search for other formats of original file.', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.find_formats,
          checked: !!find_formats
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_9__["default"], {
          text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Videos encoded by Videopack or manually assigned in the Media Library will always be found, but if this setting is enabled for a video named video.mp4, the player will also search for files with the naming pattern basename-codec_resolution. Eg: video-h264_720.mp4, video-vp9_1080.mp4, etc. Legacy filename structures (video-720.mp4, video-1080.mp4, etc.) are still supported.', 'video-embed-thumbnail-generator')
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.BaseControl, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Available Formats', 'video-embed-thumbnail-generator'),
        id: "videopack-find-formats-codecs",
        className: "videopack-setting-checkbox-group videopack-setting-extra-margin",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
          children: videopack_config.codecs.map(codec => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.CheckboxControl, {
            __nextHasNoMarginBottom: true,
            label: codec.name,
            checked: !!encode?.[codec.id]?.enabled,
            onChange: isChecked => handleCodecCheckboxChange(codec.id, isChecked)
          }, codec.id))
        })
      })]
    })]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PlayerSettings);

/***/ },

/***/ "./src/features/settings/components/ThumbnailSettings.js"
/*!***************************************************************!*\
  !*** ./src/features/settings/components/ThumbnailSettings.js ***!
  \***************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../utils/utils */ "./src/utils/utils.js");
/* harmony import */ var _hooks_useBatchProcess__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../hooks/useBatchProcess */ "./src/hooks/useBatchProcess.js");
/* harmony import */ var _SelectFromLibrary__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./SelectFromLibrary */ "./src/features/settings/components/SelectFromLibrary.js");
/* harmony import */ var _components_WatermarkSettingsPanel_WatermarkSettingsPanel__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../components/WatermarkSettingsPanel/WatermarkSettingsPanel */ "./src/components/WatermarkSettingsPanel/WatermarkSettingsPanel.js");
/* harmony import */ var _VideopackTooltip__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./VideopackTooltip */ "./src/features/settings/components/VideopackTooltip.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__);








const config = window.videopack_config || {};
const ThumbnailSettings = ({
  settings,
  changeHandlerFactory
}) => {
  const {
    browser_thumbnails,
    ffmpeg_exists,
    poster,
    endofvideooverlay,
    ffmpeg_thumb_watermark,
    total_thumbnails,
    featured,
    thumb_parent,
    hide_thumbnails,
    endofvideooverlaysame,
    auto_thumb,
    auto_thumb_number,
    auto_thumb_position
  } = settings;
  const featuredBatch = (0,_hooks_useBatchProcess__WEBPACK_IMPORTED_MODULE_3__["default"])();
  const parentsBatch = (0,_hooks_useBatchProcess__WEBPACK_IMPORTED_MODULE_3__["default"])();
  const generationBatch = (0,_hooks_useBatchProcess__WEBPACK_IMPORTED_MODULE_3__["default"])();
  const handleSetAllFeatured = async () => {
    featuredBatch.confirmAndRun((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Are you sure you want to set all video thumbnails as featured images for their parent posts? This may overwrite existing featured images.', 'video-embed-thumbnail-generator'), () => (0,_utils_utils__WEBPACK_IMPORTED_MODULE_2__.startBatchProcess)('featured'), () => (0,_utils_utils__WEBPACK_IMPORTED_MODULE_2__.getBatchProgress)('featured'), (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('No videos found to process.', 'video-embed-thumbnail-generator'));
  };
  const handleSetAllParents = async () => {
    const confirmMessage = thumb_parent === 'video' ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Are you sure you want to attach all thumbnails to their parent videos?', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Are you sure you want to attach all thumbnails to the parent posts?', 'video-embed-thumbnail-generator');
    parentsBatch.confirmAndRun(confirmMessage, () => (0,_utils_utils__WEBPACK_IMPORTED_MODULE_2__.startBatchProcess)('parents', {
      target_parent: thumb_parent
    }), () => (0,_utils_utils__WEBPACK_IMPORTED_MODULE_2__.getBatchProgress)('parents'), (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('No thumbnails found to process.', 'video-embed-thumbnail-generator'));
  };
  const executeGenerateAllThumbnails = async () => {
    try {
      generationBatch.runPolling(() => (0,_utils_utils__WEBPACK_IMPORTED_MODULE_2__.startBatchProcess)('thumbs'), () => (0,_utils_utils__WEBPACK_IMPORTED_MODULE_2__.getBatchProgress)('thumbs'), (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('No videos found to process.', 'video-embed-thumbnail-generator'));
    } catch (error) {
      console.error(error);
      generationBatch.setIsProcessing(false);
      generationBatch.showAlert((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('An error occurred while processing.', 'video-embed-thumbnail-generator'));
    }
  };
  const handleGenerateAllThumbnails = () => {
    generationBatch.setConfirmDialog({
      isOpen: true,
      message: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Are you sure you want to generate thumbnails for all videos that do not currently have one?', 'video-embed-thumbnail-generator'),
      onConfirm: executeGenerateAllThumbnails,
      isAlert: false
    });
  };
  const thumbParentOptions = [{
    value: 'post',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Post', 'video-embed-thumbnail-generator')
  }, {
    value: 'video',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Video', 'video-embed-thumbnail-generator')
  }];
  const autoThumbLabel = () => {
    const changeAutoThumbNumberHandler = value => {
      changeHandlerFactory.auto_thumb_number(value);
      changeHandlerFactory.auto_thumb_position(String(value) === '1' ? '50' : '1');
    };
    const autoThumbPositionLabel = () => {
      if (String(auto_thumb_number) === '1') {
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.Fragment, {
          children: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('thumbnail from', 'video-embed-thumbnail-generator'), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.RangeControl, {
            __nextHasNoMarginBottom: true,
            __next40pxDefaultSize: true,
            className: "videopack-setting-auto-thumb",
            value: Number(auto_thumb_position),
            onChange: changeHandlerFactory.auto_thumb_position,
            min: 0,
            max: 100,
            step: 1
          }), (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('% through the video', 'video-embed-thumbnail-generator')]
        });
      }
      return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.Fragment, {
        children: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('thumbnails and set #', 'video-embed-thumbnail-generator'), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          className: "videopack-setting-auto-thumb",
          type: "number",
          value: auto_thumb_position,
          onChange: changeHandlerFactory.auto_thumb_position
        }), (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('as the featured image', 'video-embed-thumbnail-generator')]
      });
    };
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("span", {
      children: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Generate', 'video-embed-thumbnail-generator'), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TextControl, {
        __nextHasNoMarginBottom: true,
        __next40pxDefaultSize: true,
        className: "videopack-setting-auto-thumb",
        type: "number",
        min: "1",
        max: "99",
        value: auto_thumb_number,
        onChange: changeAutoThumbNumberHandler
      }), autoThumbPositionLabel()]
    });
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelBody, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Generating', 'video-embed-thumbnail-generator'),
        initialOpen: true,
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
          className: "videopack-setting-auto-width",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TextControl, {
            __nextHasNoMarginBottom: true,
            __next40pxDefaultSize: true,
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Number of thumbnails to generate manually', 'video-embed-thumbnail-generator'),
            type: "number",
            value: total_thumbnails,
            onChange: changeHandlerFactory.total_thumbnails
          })
        }), ffmpeg_exists === true || config.is_pro ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.Fragment, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
            className: "videopack-setting-extra-margin",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
              className: "videopack-settings-label",
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Auto-generate thumbnails on upload', 'video-embed-thumbnail-generator')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.ToggleControl, {
              className: "videopack-vertical-center",
              __nextHasNoMarginBottom: true,
              label: autoThumbLabel(),
              onChange: changeHandlerFactory.auto_thumb,
              checked: !!auto_thumb
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
            className: "videopack-setting-extra-margin",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
              className: "videopack-control-with-tooltip",
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
                __next40pxDefaultSize: true,
                variant: "secondary",
                onClick: handleGenerateAllThumbnails,
                disabled: generationBatch.isProcessing,
                children: generationBatch.isProcessing ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)(/* translators: %1$d: current count, %2$d: total count */
                (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Processing %1$d / %2$d', 'video-embed-thumbnail-generator'), generationBatch.progress.current, generationBatch.progress.total) : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Generate thumbnails for old videos', 'video-embed-thumbnail-generator')
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_6__["default"], {
                text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Automatically generate thumbnails for every video in the Media Library that doesn't already have them. Uses the automatic thumbnail settings above.", 'video-embed-thumbnail-generator')
              })]
            })
          })]
        }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
          className: "videopack-setting-extra-margin",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("p", {
            className: "description",
            style: {
              marginTop: 0
            },
            children: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Automatic thumbnail generation requires FFmpeg or Videopack Pro.', 'video-embed-thumbnail-generator'), ' ', /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.ExternalLink, {
              href: "https://www.videopack.video/pro/",
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Upgrade to Pro', 'video-embed-thumbnail-generator')
            })]
          })
        }), ffmpeg_exists === true && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("When possible, use the browser's built-in video capabilities to make thumbnails instead of FFmpeg"),
          value: browser_thumbnails,
          checked: !!browser_thumbnails,
          onChange: changeHandlerFactory.browser_thumbnails
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Video player images', 'video-embed-thumbnail-generator'),
        initialOpen: true,
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_SelectFromLibrary__WEBPACK_IMPORTED_MODULE_4__["default"], {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Default thumbnail', 'video-embed-thumbnail-generator'),
          type: "url",
          value: poster,
          onChange: changeHandlerFactory.poster
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Display thumbnail image again when video ends', 'video-embed-thumbnail-generator'),
          onChange: changeHandlerFactory.endofvideooverlaysame,
          checked: !!endofvideooverlaysame
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_SelectFromLibrary__WEBPACK_IMPORTED_MODULE_4__["default"], {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('End of video image', 'video-embed-thumbnail-generator'),
          type: "url",
          value: endofvideooverlay,
          onChange: changeHandlerFactory.endofvideooverlay,
          disabled: endofvideooverlaysame,
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_6__["default"], {
            text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Display alternate image when video ends.', 'video-embed-thumbnail-generator')
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_components_WatermarkSettingsPanel_WatermarkSettingsPanel__WEBPACK_IMPORTED_MODULE_5__["default"], {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Add watermark to generated thumbnails', 'video-embed-thumbnail-generator'),
        watermarkSettings: ffmpeg_thumb_watermark,
        onChange: changeHandlerFactory.ffmpeg_thumb_watermark,
        initialOpen: true
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Media Library', 'video-embed-thumbnail-generator'),
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Hide generated thumnbails from the Media Library'),
          onChange: changeHandlerFactory.hide_thumbnails,
          checked: !!hide_thumbnails
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
          className: "videopack-setting-extra-margin",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.ToggleControl, {
            __nextHasNoMarginBottom: true,
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Set generated thumbnails as featured images.', 'video-embed-thumbnail-generator'),
            onChange: changeHandlerFactory.featured,
            checked: !!featured
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
            className: "videopack-control-with-tooltip",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
              __next40pxDefaultSize: true,
              variant: "secondary",
              onClick: handleSetAllFeatured,
              disabled: featuredBatch.isProcessing,
              children: featuredBatch.isProcessing ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)(/* translators: 1: current count, 2: total count */
              (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Processing %1$d / %2$d', 'video-embed-thumbnail-generator'), featuredBatch.progress.current, featuredBatch.progress.total) : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Set all as featured', 'video-embed-thumbnail-generator')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_6__["default"], {
              text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("If you've generated thumbnails before enabling this option, this will set all existing thumbnails as featured images. Be careful!", 'video-embed-thumbnail-generator')
            })]
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
          className: "videopack-setting-extra-margin",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.RadioControl, {
            label: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("span", {
              className: "videopack-label-with-tooltip",
              children: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Attach thumbnails to', 'video-embed-thumbnail-generator'), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_6__["default"], {
                text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('This depends on your theme. Thumbnails generated by Videopack can be saved as children of the video attachment or the post. Some themes use an image attached to a post instead of the built-in featured image meta tag. Version 3.x of this plugin saved all thumbnails as children of the video.', 'video-embed-thumbnail-generator')
              })]
            }),
            selected: thumb_parent,
            options: thumbParentOptions,
            onChange: changeHandlerFactory.thumb_parent,
            className: "videopack-setting-radio-group"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
            className: "videopack-control-with-tooltip",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
              __next40pxDefaultSize: true,
              variant: "secondary",
              onClick: handleSetAllParents,
              disabled: parentsBatch.isProcessing,
              children: parentsBatch.isProcessing ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)(/* translators: 1: current count, 2: total count */
              (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Processing %1$d / %2$d', 'video-embed-thumbnail-generator'), parentsBatch.progress.current, parentsBatch.progress.total) : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Set all parents', 'video-embed-thumbnail-generator')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_VideopackTooltip__WEBPACK_IMPORTED_MODULE_6__["default"], {
              text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("If you've generated thumbnails before changing this option, this will set all existing thumbnails as children of your currently selected option.", 'video-embed-thumbnail-generator')
            })]
          })]
        })]
      })]
    }), featuredBatch.confirmDialog.isOpen && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.__experimentalConfirmDialog, {
      isOpen: true,
      onConfirm: () => {
        if (featuredBatch.confirmDialog.onConfirm) {
          featuredBatch.confirmDialog.onConfirm();
        }
        featuredBatch.closeConfirmDialog();
      },
      onCancel: featuredBatch.closeConfirmDialog,
      confirmButtonText: featuredBatch.confirmDialog.isAlert ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('OK', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('OK', 'video-embed-thumbnail-generator'),
      children: featuredBatch.confirmDialog.message
    }), parentsBatch.confirmDialog.isOpen && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.__experimentalConfirmDialog, {
      isOpen: true,
      onConfirm: () => {
        if (parentsBatch.confirmDialog.onConfirm) {
          parentsBatch.confirmDialog.onConfirm();
        }
        parentsBatch.closeConfirmDialog();
      },
      onCancel: parentsBatch.closeConfirmDialog,
      confirmButtonText: parentsBatch.confirmDialog.isAlert ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('OK', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('OK', 'video-embed-thumbnail-generator'),
      children: parentsBatch.confirmDialog.message
    }), generationBatch.confirmDialog.isOpen && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.__experimentalConfirmDialog, {
      isOpen: true,
      onConfirm: () => {
        if (generationBatch.confirmDialog.onConfirm) {
          generationBatch.confirmDialog.onConfirm();
        }
        generationBatch.closeConfirmDialog();
      },
      onCancel: generationBatch.closeConfirmDialog,
      confirmButtonText: generationBatch.confirmDialog.isAlert ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('OK', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('OK', 'video-embed-thumbnail-generator'),
      children: generationBatch.confirmDialog.message
    })]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ThumbnailSettings);

/***/ },

/***/ "./src/features/settings/components/VideoCollectionSettings.js"
/*!*********************************************************************!*\
  !*** ./src/features/settings/components/VideoCollectionSettings.js ***!
  \*********************************************************************/
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
/* harmony import */ var _assets_icon__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../assets/icon */ "./src/assets/icon.js");
/* harmony import */ var _components_VideoGallery_VideoGallery__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../components/VideoGallery/VideoGallery */ "./src/components/VideoGallery/VideoGallery.js");
/* harmony import */ var _components_PreviewIframe_PreviewIframe__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../components/PreviewIframe/PreviewIframe */ "./src/components/PreviewIframe/PreviewIframe.js");
/* harmony import */ var _components_Pagination_Pagination__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../components/Pagination/Pagination */ "./src/components/Pagination/Pagination.js");
/* harmony import */ var _components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../components/CompactColorPicker/CompactColorPicker */ "./src/components/CompactColorPicker/CompactColorPicker.js");
/* harmony import */ var _utils_colors__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../utils/colors */ "./src/utils/colors.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__);










/* global videopack_config */

// Color fallbacks are now handled by getColorFallbacks utility.

const VideoCollectionSettings = ({
  settings,
  changeHandlerFactory
}) => {
  const colorFallbacks = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_utils_colors__WEBPACK_IMPORTED_MODULE_8__.getColorFallbacks)(settings), [settings]);
  const [currentPage, setCurrentPage] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(1);
  const [totalPages, setTotalPages] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(1);
  const [isModalOpen, setIsModalOpen] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const {
    enable_collection_video_limit,
    collection_video_limit,
    gallery_columns,
    gallery_end,
    gallery_per_page,
    gallery_title,
    gallery_pagination,
    gallery_orderby,
    gallery_order,
    gallery_align,
    title_color,
    title_background_color,
    play_button_color,
    play_button_icon_color,
    pagination_color,
    pagination_background_color,
    pagination_active_bg_color,
    pagination_active_color
  } = settings;
  const limit = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    const parsedLimit = parseInt(collection_video_limit, 10);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      return 12;
    }
    return parsedLimit;
  }, [collection_video_limit]);
  const galleryAttributes = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    return {
      ...settings,
      gallery_source: '',
      gallery_id: '',
      videos: limit,
      gallery_include: ''
    };
  }, [settings, limit]);
  const galleryEndOptions = [{
    value: '',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Stop and leave popup window open', 'video-embed-thumbnail-generator')
  }, {
    value: 'next',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Autoplay next video', 'video-embed-thumbnail-generator')
  }, {
    value: 'close',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Close popup window', 'video-embed-thumbnail-generator')
  }];
  const baseGalleryOrderbyOptions = [{
    value: 'menu_order',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Default', 'video-embed-thumbnail-generator')
  }, {
    value: 'title',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Title', 'video-embed-thumbnail-generator')
  }, {
    value: 'post_date',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Date', 'video-embed-thumbnail-generator')
  }, {
    value: 'rand',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Random', 'video-embed-thumbnail-generator')
  }, {
    value: 'ID',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Video ID', 'video-embed-thumbnail-generator')
  }];
  const alignOptions = [{
    value: '',
    label: videopack_config.contentSize ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)(/* translators: %s: Content size in pixels. */
    (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)("None (use theme's default width: %s)", 'video-embed-thumbnail-generator'), videopack_config.contentSize) : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)("None (use theme's default width)", 'video-embed-thumbnail-generator')
  }, {
    value: 'wide',
    label: videopack_config.wideSize ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)(/* translators: %s: Wide size in pixels. */
    (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)("Wide (use theme's wide width: %s)", 'video-embed-thumbnail-generator'), videopack_config.wideSize) : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)("Wide (use theme's wide width)", 'video-embed-thumbnail-generator')
  }, {
    value: 'full',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Full width', 'video-embed-thumbnail-generator')
  }, {
    value: 'left',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Left', 'video-embed-thumbnail-generator')
  }, {
    value: 'center',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Center', 'video-embed-thumbnail-generator')
  }, {
    value: 'right',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Right', 'video-embed-thumbnail-generator')
  }];
  const customStyles = {
    '--videopack-title-color': title_color || colorFallbacks.title_color,
    '--videopack-title-background-color': title_background_color || colorFallbacks.title_background_color,
    '--videopack-play-button-color': play_button_color || colorFallbacks.play_button_color,
    '--videopack-play-button-icon-color': play_button_icon_color || colorFallbacks.play_button_icon_color,
    '--videopack-pagination-color': pagination_color || colorFallbacks.pagination_color,
    '--videopack-pagination-bg': pagination_background_color || colorFallbacks.pagination_background_color,
    '--videopack-pagination-active-bg': pagination_active_bg_color || colorFallbacks.pagination_active_bg_color,
    '--videopack-pagination-active-color': pagination_active_color || colorFallbacks.pagination_active_color
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToggleControl, {
      __nextHasNoMarginBottom: true,
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Paginate', 'video-embed-thumbnail-generator'),
      onChange: changeHandlerFactory.gallery_pagination,
      checked: !!gallery_pagination
    }), gallery_pagination && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
      className: "videopack-setting-auto-width",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextControl, {
        __nextHasNoMarginBottom: true,
        __next40pxDefaultSize: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Videos per page', 'video-embed-thumbnail-generator'),
        type: "number",
        value: gallery_per_page,
        onChange: changeHandlerFactory.gallery_per_page
      })
    }), !gallery_pagination && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.Fragment, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToggleControl, {
        __nextHasNoMarginBottom: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Limit number of videos', 'video-embed-thumbnail-generator'),
        onChange: val => {
          changeHandlerFactory.enable_collection_video_limit(val);
          if (!val) {
            changeHandlerFactory.collection_video_limit(-1);
          } else if (Number(collection_video_limit) === -1) {
            changeHandlerFactory.collection_video_limit(12);
          }
        },
        checked: !!enable_collection_video_limit
      }), !!enable_collection_video_limit && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
        className: "videopack-setting-auto-width",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Video Limit', 'video-embed-thumbnail-generator'),
          help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Maximum number of videos to show in a gallery or list when pagination is disabled.', 'video-embed-thumbnail-generator'),
          type: "number",
          value: Number(collection_video_limit) === -1 ? 12 : collection_video_limit,
          onChange: changeHandlerFactory.collection_video_limit
        })
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
      className: "videopack-sort-settings",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Flex, {
        align: "flex-end",
        className: "videopack-sort-controls",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.FlexItem, {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Sort by', 'video-embed-thumbnail-generator'),
            value: gallery_orderby,
            onChange: changeHandlerFactory.gallery_orderby,
            options: baseGalleryOrderbyOptions,
            __nextHasNoMarginBottom: true,
            __next40pxDefaultSize: true
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.FlexItem, {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
            icon: gallery_order === 'ASC' ? _assets_icon__WEBPACK_IMPORTED_MODULE_3__.sortAscending : _assets_icon__WEBPACK_IMPORTED_MODULE_3__.sortDescending,
            label: gallery_order === 'ASC' ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Ascending', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Descending', 'video-embed-thumbnail-generator'),
            onClick: () => changeHandlerFactory.gallery_order(gallery_order === 'ASC' ? 'DESC' : 'ASC'),
            showTooltip: true,
            variant: "secondary",
            __next40pxDefaultSize: true
          })
        })]
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Galleries', 'video-embed-thumbnail-generator'),
      initialOpen: true,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
        className: "videopack-setting-reduced-width",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Alignment / Width', 'video-embed-thumbnail-generator'),
          value: gallery_align,
          onChange: changeHandlerFactory.gallery_align,
          options: alignOptions
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
        className: "videopack-setting-auto-width",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Max Columns', 'video-embed-thumbnail-generator'),
          type: "number",
          value: gallery_columns,
          onChange: changeHandlerFactory.gallery_columns
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToggleControl, {
        __nextHasNoMarginBottom: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Title', 'video-embed-thumbnail-generator'),
        onChange: changeHandlerFactory.gallery_title,
        checked: !!gallery_title
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
        className: "videopack-setting-auto-width videopack-setting-extra-margin",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('When current video ends', 'video-embed-thumbnail-generator'),
          value: gallery_end,
          onChange: changeHandlerFactory.gallery_end,
          options: galleryEndOptions
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Colors', 'video-embed-thumbnail-generator'),
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)("div", {
          className: "videopack-color-section",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("p", {
            className: "videopack-settings-section-title",
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Title', 'video-embed-thumbnail-generator')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)("div", {
            className: "videopack-color-flex-row",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_7__["default"], {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Text', 'video-embed-thumbnail-generator'),
                value: title_color,
                onChange: changeHandlerFactory.title_color,
                colors: videopack_config.themeColors,
                fallbackValue: colorFallbacks.title_color
              })
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_7__["default"], {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Background', 'video-embed-thumbnail-generator'),
                value: title_background_color,
                onChange: changeHandlerFactory.title_background_color,
                colors: videopack_config.themeColors,
                fallbackValue: colorFallbacks.title_background_color
              })
            })]
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)("div", {
          className: "videopack-color-section",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("p", {
            className: "videopack-settings-section-title",
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Player', 'video-embed-thumbnail-generator')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)("div", {
            className: "videopack-color-flex-row",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_7__["default"], {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Play Button (Accent)', 'video-embed-thumbnail-generator'),
                value: play_button_color,
                onChange: changeHandlerFactory.play_button_color,
                colors: videopack_config.themeColors,
                fallbackValue: colorFallbacks.play_button_color
              })
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_7__["default"], {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Play Button Icon', 'video-embed-thumbnail-generator'),
                value: play_button_icon_color,
                onChange: changeHandlerFactory.play_button_icon_color,
                colors: videopack_config.themeColors,
                fallbackValue: colorFallbacks.play_button_icon_color
              })
            })]
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)("div", {
          className: "videopack-color-section",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("p", {
            className: "videopack-settings-section-title",
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Pagination', 'video-embed-thumbnail-generator')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)("div", {
            className: "videopack-color-flex-row is-pagination",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_7__["default"], {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Outline/Text', 'video-embed-thumbnail-generator'),
                value: pagination_color,
                onChange: changeHandlerFactory.pagination_color,
                colors: videopack_config.themeColors,
                fallbackValue: colorFallbacks.pagination_color
              })
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_7__["default"], {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Background', 'video-embed-thumbnail-generator'),
                value: pagination_background_color,
                onChange: changeHandlerFactory.pagination_background_color,
                colors: videopack_config.themeColors,
                fallbackValue: colorFallbacks.pagination_background_color
              })
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_7__["default"], {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Active Background', 'video-embed-thumbnail-generator'),
                value: pagination_active_bg_color,
                onChange: changeHandlerFactory.pagination_active_bg_color,
                colors: videopack_config.themeColors,
                fallbackValue: colorFallbacks.pagination_active_bg_color
              })
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_7__["default"], {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Active Text', 'video-embed-thumbnail-generator'),
                value: pagination_active_color,
                onChange: changeHandlerFactory.pagination_active_color,
                colors: videopack_config.themeColors,
                fallbackValue: colorFallbacks.pagination_active_color
              })
            })]
          })]
        })]
      }), galleryAttributes && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
        className: "videopack-sample-gallery",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)("div", {
          className: `videopack-sample-gallery-wrapper align${gallery_align || 'none'}`,
          style: {
            '--wp--style--global--content-size': videopack_config.contentSize || '800px',
            '--wp--style--global--wide-size': videopack_config.wideSize || '1000px'
          },
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("span", {
            className: "videopack-settings-label",
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Sample Gallery', 'video-embed-thumbnail-generator')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_components_PreviewIframe_PreviewIframe__WEBPACK_IMPORTED_MODULE_5__["default"], {
            title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Video Gallery Preview', 'video-embed-thumbnail-generator'),
            resizeDependencies: [gallery_align],
            fullScreen: isModalOpen,
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)("div", {
              className: `wp-block-videopack-videopack-gallery${gallery_align ? ` align${gallery_align}` : ''}`,
              style: customStyles,
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_components_VideoGallery_VideoGallery__WEBPACK_IMPORTED_MODULE_4__["default"], {
                attributes: galleryAttributes,
                galleryPage: currentPage,
                setGalleryPage: setCurrentPage,
                totalPages: totalPages,
                setTotalPages: setTotalPages,
                onModalToggle: setIsModalOpen
              }), gallery_pagination && totalPages > 1 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_components_Pagination_Pagination__WEBPACK_IMPORTED_MODULE_6__["default"], {
                currentPage: currentPage,
                totalPages: totalPages,
                onPageChange: setCurrentPage
              })]
            })
          })]
        })
      })]
    })]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (VideoCollectionSettings);

/***/ },

/***/ "./src/features/settings/components/VideopackTooltip.js"
/*!**************************************************************!*\
  !*** ./src/features/settings/components/VideopackTooltip.js ***!
  \**************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/help.mjs");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__);



const VideopackTooltip = ({
  text
}) => {
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Tooltip, {
    text: text,
    className: "videopack-tooltip",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("span", {
      className: "videopack-tooltip",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Icon, {
        icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_1__["default"]
      })
    })
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (VideopackTooltip);

/***/ },

/***/ "./src/features/settings/settings.js"
/*!*******************************************!*\
  !*** ./src/features/settings/settings.js ***!
  \*******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/hooks */ "@wordpress/hooks");
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/utils */ "./src/utils/utils.js");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/compose */ "@wordpress/compose");
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_compose__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _assets_icon__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../assets/icon */ "./src/assets/icon.js");
/* harmony import */ var _components_VideoCollectionSettings__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./components/VideoCollectionSettings */ "./src/features/settings/components/VideoCollectionSettings.js");
/* harmony import */ var _components_PlayerSettings__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./components/PlayerSettings */ "./src/features/settings/components/PlayerSettings.js");
/* harmony import */ var _components_ThumbnailSettings__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./components/ThumbnailSettings */ "./src/features/settings/components/ThumbnailSettings.js");
/* harmony import */ var _components_EncodingSettings__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./components/EncodingSettings */ "./src/features/settings/components/EncodingSettings.js");
/* harmony import */ var _components_AdminSettings__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./components/AdminSettings */ "./src/features/settings/components/AdminSettings.js");
/* harmony import */ var _components_FreemiusPage__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./components/FreemiusPage */ "./src/features/settings/components/FreemiusPage.js");
/* harmony import */ var _settings_scss__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./settings.scss */ "./src/features/settings/settings.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__);
/**
 * Features for managing plugin settings.
 */

/* global videopack_config */
















/**
 * VideopackSettingsPage component.
 *
 * @return {Object} The rendered component.
 */

const VideopackSettingsPage = () => {
  const [settings, setSettings] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_5__.useState)({});
  const [ffmpegTest, setFfmpegTest] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_5__.useState)({});
  const [isSettingsChanged, setIsSettingsChanged] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_5__.useState)(false);
  const defaultTab = window.location.hash.substring(1) || 'player';
  const [activeTab, setActiveTab] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_5__.useState)(defaultTab);
  const [isResetModalOpen, setIsResetModalOpen] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_5__.useState)(false);
  const settingsRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_5__.useRef)(settings);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_5__.useEffect)(() => {
    settingsRef.current = settings;
  }, [settings]);
  const testFfmpeg = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_5__.useCallback)((codec, resolution, rotate) => {
    if (activeTab === 'encoding') {
      setFfmpegTest({
        command: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Running test…', 'video-embed-thumbnail-generator'),
        output: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Running test…', 'video-embed-thumbnail-generator')
      });
      (0,_utils_utils__WEBPACK_IMPORTED_MODULE_2__.testEncodeCommand)(codec, resolution, rotate).then(response => {
        setFfmpegTest(response);
      }).catch(error => {
        console.error(error);
      });
    }
  }, [activeTab]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_5__.useEffect)(() => {
    if (!isSettingsChanged && activeTab === 'encoding' && settings.sample_codec && settings.sample_resolution && settings.ffmpeg_exists === true) {
      testFfmpeg(settings.sample_codec, settings.sample_resolution, settings.sample_rotate);
    }
  }, [settings, activeTab, isSettingsChanged, testFfmpeg]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_5__.useEffect)(() => {
    (0,_utils_utils__WEBPACK_IMPORTED_MODULE_2__.getSettings)().then(response => {
      setSettings(response);
    }).catch(error => {
      console.error(error);
    });
    const handlePopState = () => {
      setActiveTab(window.location.hash.substring(1));
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  const debouncedSaveSettings = (0,_wordpress_compose__WEBPACK_IMPORTED_MODULE_4__.useDebounce)(newSettings => {
    (0,_utils_utils__WEBPACK_IMPORTED_MODULE_2__.saveWPSettings)(newSettings).then(response => {
      const currentSettings = settingsRef.current;
      const nextSettings = {
        ...response
      };
      let hasLocalChanges = false;
      Object.keys(currentSettings).forEach(key => {
        if (currentSettings[key] !== newSettings[key]) {
          nextSettings[key] = currentSettings[key];
          hasLocalChanges = true;
        }
      });
      setSettings(nextSettings);
      if (!hasLocalChanges) {
        setIsSettingsChanged(false);
      }
    }).catch(error => {
      console.error('Error updating settings:', error);
    });
  }, 1000);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_5__.useEffect)(() => {
    if (isSettingsChanged) {
      debouncedSaveSettings(settings);
    }
  }, [isSettingsChanged, debouncedSaveSettings, settings]);
  const changeHandlerFactory = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_5__.useMemo)(() => {
    if (!settings || typeof settings !== 'object') {
      return {};
    }
    return Object.keys(settings).reduce((acc, setting) => {
      acc[setting] = newValue => {
        setSettings(prevSettings => ({
          ...prevSettings,
          [setting]: newValue
        }));
        setIsSettingsChanged(true);
      };
      return acc;
    }, {});
  }, [settings]);
  const tabs = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_5__.useMemo)(() => {
    const defaultTabs = [{
      name: 'player',
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Video Player', 'video-embed-thumbnail-generator'),
      component: _components_PlayerSettings__WEBPACK_IMPORTED_MODULE_8__["default"]
    }, {
      name: 'thumbnails',
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Thumbnails', 'video-embed-thumbnail-generator'),
      component: _components_ThumbnailSettings__WEBPACK_IMPORTED_MODULE_9__["default"]
    }, {
      name: 'gallery',
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Galleries & Lists', 'video-embed-thumbnail-generator'),
      component: _components_VideoCollectionSettings__WEBPACK_IMPORTED_MODULE_7__["default"]
    }];
    if (!videopack_config.isFfmpegOverridden || videopack_config.isSuperAdmin) {
      defaultTabs.push({
        name: 'encoding',
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Encoding', 'video-embed-thumbnail-generator'),
        component: _components_EncodingSettings__WEBPACK_IMPORTED_MODULE_10__["default"]
      });
    }
    defaultTabs.push({
      name: 'admin',
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Admin', 'video-embed-thumbnail-generator'),
      component: _components_AdminSettings__WEBPACK_IMPORTED_MODULE_11__["default"]
    });
    if (videopack_config.freemiusEnabled) {
      defaultTabs.push({
        name: 'account',
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Freemius Account', 'video-embed-thumbnail-generator'),
        className: 'videopack-freemius-tab',
        component: () => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_components_FreemiusPage__WEBPACK_IMPORTED_MODULE_12__["default"], {
          page: "account"
        })
      }, {
        name: 'add-ons',
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Add-ons', 'video-embed-thumbnail-generator'),
        className: 'videopack-freemius-tab',
        component: () => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_components_FreemiusPage__WEBPACK_IMPORTED_MODULE_12__["default"], {
          page: "add-ons"
        })
      });
    }
    return (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_1__.applyFilters)('videopack.settings.tabs', defaultTabs);
  }, []);
  const onTabSelect = tabName => {
    setActiveTab(tabName);
    window.history.pushState(null, '', `#${tabName}`);
  };
  const renderTab = tab => {
    if (settings && settings.hasOwnProperty('embed_method')) {
      if (tab.component) {
        const TabComponent = tab.component;
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(TabComponent, {
          settings: settings,
          setSettings: setSettings,
          changeHandlerFactory: changeHandlerFactory,
          ffmpegTest: ffmpegTest
        });
      }
    } else {
      return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Spinner, {});
    }
  };
  const resetSettings = () => {
    setIsResetModalOpen(true);
  };
  const handleConfirmReset = () => {
    (0,_utils_utils__WEBPACK_IMPORTED_MODULE_2__.resetVideopackSettings)().then(response => {
      setSettings(response);
      setIsSettingsChanged(true);
    }).catch(error => {
      console.error(error);
    }).finally(() => {
      setIsResetModalOpen(false);
    });
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)("div", {
    className: "wrap videopack-settings",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)("h1", {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Icon, {
        className: "videopack-settings-icon",
        icon: _assets_icon__WEBPACK_IMPORTED_MODULE_6__.videopack,
        size: 40
      }), (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Videopack Settings', 'video-embed-thumbnail-generator')]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Panel, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TabPanel, {
        tabs: tabs,
        initialTabName: activeTab,
        onSelect: onTabSelect,
        children: tab => {
          return renderTab(tab);
        }
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
          variant: "primary",
          onClick: resetSettings,
          className: 'videopack-settings-reset',
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Reset Settings', 'video-embed-thumbnail-generator')
        })
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.__experimentalConfirmDialog, {
      isOpen: isResetModalOpen,
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Reset Settings?', 'video-embed-thumbnail-generator'),
      onConfirm: handleConfirmReset,
      onCancel: () => setIsResetModalOpen(false),
      confirmButtonText: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Reset Settings', 'video-embed-thumbnail-generator'),
      cancelButtonText: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Cancel', 'video-embed-thumbnail-generator'),
      children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Are you sure you want to reset all settings to their defaults? This action cannot be undone.', 'video-embed-thumbnail-generator')
    })]
  });
};
const el = document.getElementById('videopack-settings-root');
const root = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_5__.createRoot)(el);
root.render(/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(VideopackSettingsPage, {}));

/***/ },

/***/ "./src/hooks/useBatchProcess.js"
/*!**************************************!*\
  !*** ./src/hooks/useBatchProcess.js ***!
  \**************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/**
 * Custom React hook for managing batch processes.
 */




/**
 * Hook to manage batch processing of items with progress tracking and confirmation dialogs.
 *
 * @return {Object} Batch process state and controls.
 */
const useBatchProcess = () => {
  const [isProcessing, setIsProcessing] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [progress, setProgress] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)({
    current: 0,
    total: 0
  });
  const [confirmDialog, setConfirmDialog] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)({
    isOpen: false,
    message: '',
    onConfirm: null,
    isAlert: false
  });
  const intervalRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);

  // Cleanup interval on unmount
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  const closeConfirmDialog = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    setConfirmDialog(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);
  const showAlert = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(message => {
    setConfirmDialog({
      isOpen: true,
      message,
      onConfirm: null,
      isAlert: true
    });
  }, []);
  const runPolling = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async (startFn, progressFn, noItemsMessage) => {
    setIsProcessing(true);
    setProgress({
      current: 0,
      total: 0
    });
    try {
      const response = await startFn();
      const total = response.total;
      if (total === 0) {
        setIsProcessing(false);
        showAlert(noItemsMessage);
        return;
      }
      setProgress({
        current: 0,
        total
      });
      intervalRef.current = setInterval(async () => {
        try {
          const progressData = await progressFn();
          const pending = progressData.pending + progressData['in-progress'];
          const completed = progressData.complete + progressData.failed;
          const currentTotal = pending + completed;
          setProgress({
            current: completed,
            total: currentTotal > 0 ? currentTotal : total
          });
          if (pending === 0) {
            clearInterval(intervalRef.current);
            setIsProcessing(false);
          }
        } catch (e) {
          console.error(e);
          clearInterval(intervalRef.current);
          setIsProcessing(false);
        }
      }, 2000);
    } catch (error) {
      console.error(error);
      showAlert((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('An error occurred while processing.', 'video-embed-thumbnail-generator'));
      setIsProcessing(false);
    }
  }, [showAlert]);
  const confirmAndRun = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)((confirmMessage, startFn, progressFn, noItemsMessage = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('No items found to process.', 'video-embed-thumbnail-generator')) => {
    setConfirmDialog({
      isOpen: true,
      message: confirmMessage,
      onConfirm: () => runPolling(startFn, progressFn, noItemsMessage),
      isAlert: false
    });
  }, [runPolling]);
  return {
    isProcessing,
    setIsProcessing,
    progress,
    setProgress,
    confirmDialog,
    setConfirmDialog,
    closeConfirmDialog,
    runPolling,
    confirmAndRun,
    showAlert
  };
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (useBatchProcess);

/***/ },

/***/ "./src/hooks/useResolutions.js"
/*!*************************************!*\
  !*** ./src/hooks/useResolutions.js ***!
  \*************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/**
 * Custom React hook for calculating video resolutions.
 */

/* global videopack_config */



/**
 * Hook to manage and calculate video resolutions, including a custom resolution option.
 *
 * @param {boolean}       enable_custom_resolution Whether to include the custom resolution in the list.
 * @param {string|number} custom_resolution        The height of the custom resolution.
 * @return {Array} List of resolution objects.
 */
const useResolutions = (enable_custom_resolution, custom_resolution) => {
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    // Filter out the custom resolution from the static list, as it will be re-added if enabled.
    let resolutionsList = videopack_config.resolutions.filter(r => !r.is_custom);
    if (enable_custom_resolution) {
      const height = parseInt(custom_resolution, 10) || 900;
      const id = String(height);
      const width = Math.ceil(height * 16 / 9);
      const name = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)(/* translators: %s is the height of a custom video resolution. Example: 'Custom (4320p)' */
      (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Custom (%sp)', 'video-embed-thumbnail-generator'), height);

      // Remove any existing resolution with the same ID to avoid duplicates.
      resolutionsList = resolutionsList.filter(r => r.id !== id);
      resolutionsList.push({
        id,
        name,
        height,
        width,
        is_custom: true
      });
    }
    return resolutionsList.sort((a, b) => {
      if (a.id === 'fullres') {
        return -1;
      }
      if (b.id === 'fullres') {
        return 1;
      }
      return b.height - a.height;
    });
  }, [enable_custom_resolution, custom_resolution]);
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (useResolutions);

/***/ },

/***/ "./src/features/settings/settings.scss"
/*!*********************************************!*\
  !*** ./src/features/settings/settings.scss ***!
  \*********************************************/
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

/***/ "@wordpress/compose"
/*!*********************************!*\
  !*** external ["wp","compose"] ***!
  \*********************************/
(module) {

module.exports = window["wp"]["compose"];

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

/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/help.mjs"
/*!*********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/help.mjs ***!
  \*********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ help_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/help.tsx


var help_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M12 4a8 8 0 1 1 .001 16.001A8 8 0 0 1 12 4Zm0 1.5a6.5 6.5 0 1 0-.001 13.001A6.5 6.5 0 0 0 12 5.5Zm.75 11h-1.5V15h1.5v1.5Zm-.445-9.234a3 3 0 0 1 .445 5.89V14h-1.5v-1.25c0-.57.452-.958.917-1.01A1.5 1.5 0 0 0 12 8.75a1.5 1.5 0 0 0-1.5 1.5H9a3 3 0 0 1 3.305-2.984Z" }) });

//# sourceMappingURL=help.mjs.map


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
/******/ 			"settings": 0
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
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["videopack-dndkit","videopack-videoplayer","videopack-videogallery","videopack-shared"], () => (__webpack_require__("./src/features/settings/settings.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=settings.js.map