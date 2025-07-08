/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/encode-queue.scss":
/*!*******************************!*\
  !*** ./src/encode-queue.scss ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "@wordpress/api-fetch":
/*!**********************************!*\
  !*** external ["wp","apiFetch"] ***!
  \**********************************/
/***/ ((module) => {

module.exports = window["wp"]["apiFetch"];

/***/ }),

/***/ "@wordpress/components":
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
/***/ ((module) => {

module.exports = window["wp"]["components"];

/***/ }),

/***/ "@wordpress/data":
/*!******************************!*\
  !*** external ["wp","data"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["data"];

/***/ }),

/***/ "@wordpress/element":
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["element"];

/***/ }),

/***/ "@wordpress/i18n":
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["i18n"];

/***/ }),

/***/ "react/jsx-runtime":
/*!**********************************!*\
  !*** external "ReactJSXRuntime" ***!
  \**********************************/
/***/ ((module) => {

module.exports = window["ReactJSXRuntime"];

/***/ })

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
/*!*****************************!*\
  !*** ./src/encode-queue.js ***!
  \*****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _encode_queue_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./encode-queue.scss */ "./src/encode-queue.scss");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__);







// Helper to format duration from seconds to HH:MM:SS

const formatDuration = seconds => {
  if (isNaN(seconds) || seconds < 0) {
    return '--:--';
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 60);
  const pad = num => num.toString().padStart(2, '0');
  return (h > 0 ? `${h}:` : '') + `${pad(m)}:${pad(s)}`;
};
const EncodeQueue = () => {
  const [queueData, setQueueData] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)([]);
  const [isLoading, setIsLoading] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(true);
  const [isQueuePaused, setIsQueuePaused] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(videopackEncodeQueueData.initialQueueState === 'pause');
  const [message, setMessage] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(null);
  const [isClearing, setIsClearing] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(false);
  const [isTogglingQueue, setIsTogglingQueue] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(false);
  const [deletingJobId, setDeletingJobId] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(null);
  const [retryingJobId, setRetryingJobId] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(null);
  const intervalRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useRef)(null);
  const pollInterval = 5000; // Poll every 5 seconds

  const {
    restUrl,
    nonce,
    ffmpegExists
  } = videopackEncodeQueueData;

  // Use core data to get site language for Intl.ListFormat
  const siteLanguage = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_5__.useSelect)(select => select('core').getSite()?.language);
  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const response = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3___default()({
        path: `${restUrl}queue`,
        headers: {
          'X-WP-Nonce': nonce
        }
      });
      setQueueData(response);
      // Check if any job is currently processing to determine if polling should continue
      const anyProcessing = response.some(job => job.status === 'processing');
      if (anyProcessing && !intervalRef.current) {
        intervalRef.current = setInterval(fetchQueue, pollInterval);
      } else if (!anyProcessing && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } catch (error) {
      console.error('Error fetching queue:', error);
      setMessage({
        type: 'error',
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Failed to load queue: %s', 'video-embed-thumbnail-generator'), error.message || error.code)
      });
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } finally {
      setIsLoading(false);
    }
  };
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useEffect)(() => {
    fetchQueue();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  const handleToggleQueue = async () => {
    setIsTogglingQueue(true);
    const action = isQueuePaused ? 'play' : 'pause';
    try {
      const response = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3___default()({
        path: `${restUrl}queue/control`,
        method: 'POST',
        headers: {
          'X-WP-Nonce': nonce
        },
        data: {
          action
        }
      });
      setIsQueuePaused(response.queue_state === 'pause');
      setMessage({
        type: 'success',
        text: response.message
      });
      fetchQueue(); // Refresh queue data after state change
    } catch (error) {
      console.error('Error toggling queue:', error);
      setMessage({
        type: 'error',
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Failed to toggle queue: %s', 'video-embed-thumbnail-generator'), error.message || error.code)
      });
    } finally {
      setIsTogglingQueue(false);
    }
  };
  const handleClearQueue = async type => {
    if (!confirm(type === 'all' ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Are you sure you want to clear all jobs?', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Are you sure you want to clear completed jobs?', 'video-embed-thumbnail-generator'))) {
      return;
    }
    setIsClearing(true);
    try {
      const response = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3___default()({
        path: `${restUrl}queue/clear`,
        method: 'DELETE',
        headers: {
          'X-WP-Nonce': nonce
        },
        data: {
          type
        }
      });
      setMessage({
        type: 'success',
        text: response.message
      });
      fetchQueue(); // Refresh queue data
    } catch (error) {
      console.error('Error clearing queue:', error);
      setMessage({
        type: 'error',
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Failed to clear queue: %s', 'video-embed-thumbnail-generator'), error.message || error.code)
      });
    } finally {
      setIsClearing(false);
    }
  };
  const handleDeleteJob = async jobId => {
    if (!confirm((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Are you sure you want to delete this job?', 'video-embed-thumbnail-generator'))) {
      return;
    }
    setDeletingJobId(jobId);
    try {
      const response = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3___default()({
        path: `${restUrl}queue/${jobId}`,
        method: 'DELETE',
        headers: {
          'X-WP-Nonce': nonce
        }
      });
      setMessage({
        type: 'success',
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Job %d deleted successfully.', 'video-embed-thumbnail-generator'), jobId)
      });
      fetchQueue(); // Refresh queue data
    } catch (error) {
      console.error('Error deleting job:', error);
      setMessage({
        type: 'error',
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Failed to delete job %d: %s', 'video-embed-thumbnail-generator'), jobId, error.message || error.code)
      });
    } finally {
      setDeletingJobId(null);
    }
  };
  const handleRetryJob = async jobId => {
    setRetryingJobId(jobId);
    try {
      await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3___default()({
        path: `${restUrl}queue/retry/${jobId}`,
        method: 'POST',
        headers: {
          'X-WP-Nonce': nonce
        }
      });
      setMessage({
        type: 'success',
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Job %d has been re-queued.', 'video-embed-thumbnail-generator'), jobId)
      });
      fetchQueue(); // Refresh queue data
    } catch (error) {
      console.error('Error retrying job:', error);
      setMessage({
        type: 'error',
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Failed to retry job %d: %s', 'video-embed-thumbnail-generator'), jobId, error.message || error.code)
      });
    } finally {
      setRetryingJobId(null);
    }
  };
  const getStatusDisplay = job => {
    if (job.status === 'processing' && job.progress) {
      const percent = job.progress.percent_done || 0;
      const elapsed = formatDuration(job.progress.elapsed);
      const remaining = formatDuration(job.progress.remaining);
      const fps = job.progress.fps || 0;
      return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("div", {
          className: "videopack-progress-bar-container",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("div", {
            className: "videopack-progress-bar",
            style: {
              width: `${percent}%`
            },
            children: percent > 5 && `${percent}%`
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("small", {
          children: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Elapsed: %s', 'video-embed-thumbnail-generator'), elapsed), " |", ' ', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Remaining: %s', 'video-embed-thumbnail-generator'), remaining), " |", ' ', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('FPS: %s', 'video-embed-thumbnail-generator'), fps)]
        })]
      });
    }
    return job.status_l10n || job.status;
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
    className: "wrap videopack-encode-queue",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("h1", {
      children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Videopack Encode Queue', 'video-embed-thumbnail-generator')
    }), message && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.Notice, {
      status: message.type,
      onRemove: () => setMessage(null),
      children: message.text
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.PanelBody, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
        className: "videopack-queue-controls",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.Button, {
          variant: "primary",
          onClick: handleToggleQueue,
          isBusy: isTogglingQueue,
          disabled: isLoading || isTogglingQueue || !ffmpegExists,
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.Dashicon, {
            icon: isQueuePaused ? 'play' : 'pause'
          }), isQueuePaused ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Play Queue', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Pause Queue', 'video-embed-thumbnail-generator')]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.Button, {
          variant: "secondary",
          onClick: () => handleClearQueue('completed'),
          isBusy: isClearing,
          disabled: isLoading || isClearing || !ffmpegExists,
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Clear Completed', 'video-embed-thumbnail-generator')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.Button, {
          variant: "tertiary",
          isDestructive: true,
          onClick: () => handleClearQueue('all'),
          isBusy: isClearing,
          disabled: isLoading || isClearing || !ffmpegExists,
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Clear All', 'video-embed-thumbnail-generator')
        }), isLoading && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.Spinner, {})]
      }), !ffmpegExists && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.Notice, {
        status: "warning",
        isDismissible: false,
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('FFmpeg is not detected or configured. Encoding functions are disabled.', 'video-embed-thumbnail-generator')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.__experimentalDivider, {}), isLoading && queueData.length === 0 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("p", {
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Loading queue...', 'video-embed-thumbnail-generator')
      }) : queueData.length === 0 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("p", {
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('The encode queue is empty.', 'video-embed-thumbnail-generator')
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.Table, {
        className: "videopack-queue-table",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TableHead, {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TableRow, {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TableHeader, {
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('ID', 'video-embed-thumbnail-generator')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TableHeader, {
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Thumbnail', 'video-embed-thumbnail-generator')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TableHeader, {
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Video Title', 'video-embed-thumbnail-generator')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TableHeader, {
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Format', 'video-embed-thumbnail-generator')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TableHeader, {
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Status', 'video-embed-thumbnail-generator')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TableHeader, {
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Actions', 'video-embed-thumbnail-generator')
            })]
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TableBody, {
          children: queueData.map(job => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TableRow, {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TableCell, {
              children: job.job_id
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TableCell, {
              children: job.poster_url && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("img", {
                src: job.poster_url,
                alt: job.video_title,
                style: {
                  maxWidth: '80px',
                  height: 'auto'
                }
              })
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TableCell, {
              children: job.video_title
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TableCell, {
              children: job.format_name
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TableCell, {
              children: getStatusDisplay(job)
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TableCell, {
              children: [job.status !== 'processing' && job.status !== 'queued' && job.status !== 'pending_replacement' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.Button, {
                size: "small",
                isDestructive: true,
                onClick: () => handleDeleteJob(job.job_id),
                isBusy: deletingJobId === job.job_id,
                children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Delete', 'video-embed-thumbnail-generator')
              }), (job.status === 'processing' || job.status === 'queued' || job.status === 'pending_replacement') && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.Button, {
                size: "small",
                isDestructive: true,
                onClick: () => handleDeleteJob(job.job_id),
                isBusy: deletingJobId === job.job_id,
                children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Cancel', 'video-embed-thumbnail-generator')
              }), job.status === 'failed' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.Button, {
                size: "small",
                variant: "secondary",
                onClick: () => handleRetryJob(job.job_id),
                isBusy: retryingJobId === job.job_id,
                children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Retry', 'video-embed-thumbnail-generator')
              })]
            })]
          }, job.job_id))
        })]
      })]
    })]
  });
};

// Render the component
document.addEventListener('DOMContentLoaded', function () {
  const rootElement = document.getElementById('videopack-queue-root');
  if (rootElement) {
    // Use createRoot for React 18+
    if (typeof ReactDOM !== 'undefined' && ReactDOM.createRoot) {
      const root = ReactDOM.createRoot(rootElement);
      root.render(/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(EncodeQueue, {}));
    } else if (typeof ReactDOM !== 'undefined' && ReactDOM.render) {
      // Fallback for older React versions
      ReactDOM.render(/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(EncodeQueue, {}), rootElement);
    } else {
      console.error('ReactDOM is not available. Cannot render React component.');
    }
  }
});
})();

/******/ })()
;
//# sourceMappingURL=encode-queue.js.map