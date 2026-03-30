/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/features/settings-network/settings-network.js"
/*!***********************************************************!*\
  !*** ./src/features/settings-network/settings-network.js ***!
  \***********************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/utils */ "./src/utils/utils.js");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/compose */ "@wordpress/compose");
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_compose__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _assets_icon__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../assets/icon */ "./src/assets/icon.js");
/* harmony import */ var _settings_components_TextControlOnBlur__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../settings/components/TextControlOnBlur */ "./src/features/settings/components/TextControlOnBlur.js");
/* harmony import */ var _settings_network_scss__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./settings-network.scss */ "./src/features/settings-network/settings-network.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__);
/**
 * Features for managing network-wide settings.
 */










/**
 * NetworkSettingsPage component.
 *
 * @return {Object} The rendered component.
 */

const NetworkSettingsPage = () => {
  const [settings, setSettings] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useState)(null);
  const [users, setUsers] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useState)(null);
  const [isSettingsChanged, setIsSettingsChanged] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useState)(false);
  const settingsRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useRef)(settings);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useEffect)(() => {
    settingsRef.current = settings;
  }, [settings]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useEffect)(() => {
    (0,_utils_utils__WEBPACK_IMPORTED_MODULE_1__.getNetworkSettings)().then(response => {
      setSettings(response);
    }).catch(error => {
      console.error('Error fetching network settings:', error);
    });
    (0,_utils_utils__WEBPACK_IMPORTED_MODULE_1__.getUsersWithCapability)('edit_others_video_encodes').then(response => {
      setUsers(response);
    }).catch(error => {
      console.error(error);
    });
  }, []);
  const debouncedSaveSettings = (0,_wordpress_compose__WEBPACK_IMPORTED_MODULE_3__.useDebounce)(newSettings => {
    (0,_utils_utils__WEBPACK_IMPORTED_MODULE_1__.saveNetworkSettings)(newSettings).then(response => {
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
      console.error('Error updating network settings:', error);
    });
  }, 1000);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useEffect)(() => {
    if (isSettingsChanged) {
      debouncedSaveSettings(settings);
    }
  }, [isSettingsChanged, debouncedSaveSettings, settings]);
  const changeHandlerFactory = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useMemo)(() => {
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
  const resetSettings = () => {
    (0,_utils_utils__WEBPACK_IMPORTED_MODULE_1__.resetNetworkSettings)().then(response => {
      setSettings(response);
      setIsSettingsChanged(true);
    }).catch(error => {
      console.error(error);
    });
  };
  const capitalizeFirstLetter = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  const RolesCheckboxes = () => {
    const handleCapabilityChange = (roleName, capability, isChecked) => {
      const updatedCapabilities = {
        ...settings.default_capabilities,
        [capability]: {
          ...settings.default_capabilities[capability],
          [roleName]: isChecked
        }
      };
      changeHandlerFactory.default_capabilities(updatedCapabilities);
    };
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('User capabilities for new sites', 'video-embed-thumbnail-generator'),
      initialOpen: true,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Flex, {
        direction: "row",
        gap: 20,
        className: "videopack-setting-capabilities",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.FlexItem, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("p", {
            className: "videopack-settings-label",
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Can make thumbnails', 'video-embed-thumbnail-generator')
          }), Object.entries(settings.default_capabilities.make_video_thumbnails).map(([roleKey, isEnabled]) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.CheckboxControl, {
            __nextHasNoMarginBottom: true,
            label: capitalizeFirstLetter(roleKey),
            checked: isEnabled,
            onChange: isChecked => handleCapabilityChange(roleKey, 'make_video_thumbnails', isChecked)
          }, `${roleKey}-make-thumbnails`))]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.FlexItem, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("p", {
            className: "videopack-settings-label",
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Can encode videos', 'video-embed-thumbnail-generator')
          }), Object.entries(settings.default_capabilities.encode_videos).map(([roleKey, isEnabled]) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.CheckboxControl, {
            __nextHasNoMarginBottom: true,
            label: capitalizeFirstLetter(roleKey),
            checked: isEnabled,
            onChange: isChecked => handleCapabilityChange(roleKey, 'encode_videos', isChecked)
          }, `${roleKey}-encode-videos`))]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.FlexItem, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("p", {
            className: "videopack-settings-label",
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Can edit other users' encoded videos", 'video-embed-thumbnail-generator')
          }), Object.entries(settings.default_capabilities.edit_others_video_encodes).map(([roleKey, isEnabled]) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.CheckboxControl, {
            __nextHasNoMarginBottom: true,
            label: capitalizeFirstLetter(roleKey),
            checked: isEnabled,
            onChange: isChecked => handleCapabilityChange(roleKey, 'edit_others_video_encodes', isChecked)
          }, `${roleKey}-edit-encodes`))]
        })]
      })
    });
  };
  if (!settings || Object.keys(settings).length === 0) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Spinner, {});
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
    className: "wrap videopack-settings-network",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("h1", {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Icon, {
        className: "videopack-settings-icon",
        icon: _assets_icon__WEBPACK_IMPORTED_MODULE_5__.videopack,
        size: 40
      }), (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Videopack Network Settings', 'video-embed-thumbnail-generator')]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Panel, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('FFmpeg Settings', 'video-embed-thumbnail-generator'),
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelRow, {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_settings_components_TextControlOnBlur__WEBPACK_IMPORTED_MODULE_6__["default"], {
            __nextHasNoMarginBottom: true,
            __next40pxDefaultSize: true,
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Path to FFmpeg folder on server', 'video-embed-thumbnail-generator'),
            value: settings.app_path,
            onChange: changeHandlerFactory.app_path,
            help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Leave blank if FFmpeg is in your system path.', 'video-embed-thumbnail-generator')
          })
        }), settings.ffmpeg_exists !== true && settings.ffmpeg_error && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("div", {
          className: "notice notice-error videopack-ffmpeg-notice",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("p", {
            dangerouslySetInnerHTML: {
              __html: settings.ffmpeg_error
            }
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Only Super Admins can change FFmpeg Settings', 'video-embed-thumbnail-generator'),
          checked: !!settings.superadmin_only_ffmpeg_settings,
          onChange: changeHandlerFactory.superadmin_only_ffmpeg_settings
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Execution', 'video-embed-thumbnail-generator'),
        opened: settings.ffmpeg_exists === true,
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.RangeControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Simultaneous encodes', 'video-embed-thumbnail-generator'),
          value: settings.simultaneous_encodes,
          className: "videopack-settings-slider",
          onChange: changeHandlerFactory.simultaneous_encodes,
          min: 1,
          max: 10,
          step: 1,
          marks: generateNonCrfMarks('simultaneous'),
          disabled: settings.ffmpeg_exists !== true
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.RangeControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Threads', 'video-embed-thumbnail-generator'),
          value: settings.threads,
          className: "videopack-settings-slider",
          onChange: changeHandlerFactory.threads,
          min: 0,
          max: 16,
          step: 1,
          marks: generateNonCrfMarks('threads'),
          disabled: settings.ffmpeg_exists !== true
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Run nice', 'video-embed-thumbnail-generator'),
          checked: !!settings.nice,
          onChange: changeHandlerFactory.nice,
          disabled: settings.ffmpeg_exists !== true
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Email Notifications', 'video-embed-thumbnail-generator'),
        opened: settings.ffmpeg_exists === true,
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("div", {
          className: "videopack-setting-auto-width",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
            __nextHasNoMarginBottom: true,
            __next40pxDefaultSize: true,
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Network Error Email', 'video-embed-thumbnail-generator'),
            value: settings.network_error_email,
            onChange: changeHandlerFactory.network_error_email,
            options: errorEmailOptions(),
            help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Receive encoding error notifications for all sites in the network.', 'video-embed-thumbnail-generator'),
            disabled: settings.ffmpeg_exists !== true
          })
        })
      }), settings.default_capabilities && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(RolesCheckboxes, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelRow, {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
          variant: "primary",
          onClick: resetSettings,
          className: 'videopack-settings-reset',
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Reset Settings', 'video-embed-thumbnail-generator')
        })
      })]
    })]
  });
};
const el = document.getElementById('videopack-network-settings-root');
if (el) {
  const root = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.createRoot)(el);
  root.render(/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(NetworkSettingsPage, {}));
}

/***/ },

/***/ "./src/features/settings-network/settings-network.scss"
/*!*************************************************************!*\
  !*** ./src/features/settings-network/settings-network.scss ***!
  \*************************************************************/
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

/***/ "@wordpress/i18n"
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
(module) {

module.exports = window["wp"]["i18n"];

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
/******/ 			"settings-network": 0
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
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["videopack-shared"], () => (__webpack_require__("./src/features/settings-network/settings-network.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=settings-network.js.map