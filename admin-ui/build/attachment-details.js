/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@wordpress/icons/build-module/library/chevron-down.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/chevron-down.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__);
/**
 * WordPress dependencies
 */


const chevronDown = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, {
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg",
  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, {
    d: "M17.5 11.6L12 16l-5.5-4.4.9-1.2L12 14l4.5-3.6 1 1.2z"
  })
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (chevronDown);
//# sourceMappingURL=chevron-down.js.map

/***/ }),

/***/ "./node_modules/@wordpress/icons/build-module/library/chevron-up.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/chevron-up.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__);
/**
 * WordPress dependencies
 */


const chevronUp = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, {
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg",
  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, {
    d: "M6.5 12.4L12 8l5.5 4.4-.9 1.2L12 10l-4.5 3.6-1-1.2z"
  })
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (chevronUp);
//# sourceMappingURL=chevron-up.js.map

/***/ }),

/***/ "./src/AdditionalFormats.js":
/*!**********************************!*\
  !*** ./src/AdditionalFormats.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__);
/* global videopack */








const AdditionalFormats = ({
  setAttributes,
  attributes,
  attachmentRecord,
  options = {}
}) => {
  const {
    id,
    src,
    height
  } = attributes;
  const {
    ffmpeg_exists
  } = options;
  const [videoFormats, setVideoFormats] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useState)();
  const [encodeMessage, setEncodeMessage] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useState)();
  const [itemToDelete, setItemToDelete] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useState)(null); // { type: 'file'/'job', formatId: string, jobId?: int, id?: int, name?: string }
  const [deleteInProgress, setDeleteInProgress] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useState)(null); // Stores formatId or jobId being deleted
  const [isConfirmOpen, setIsConfirmOpen] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useState)(false);
  const [isLoading, setIsLoading] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useState)(false);
  const [isEncoding, setIsEncoding] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useState)(false);
  const checkboxTimerRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useRef)(null);
  const progressTimerRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useRef)(null);
  const queueApiPath = '/videopack/v1/queue';
  const deepEqual = (obj1, obj2) => {
    if (obj1 === obj2) {
      return true;
    }
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
      return false;
    }
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) {
      return false;
    }
    for (const key of keys1) {
      if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
        return false;
      }
    }
    return true;
  };
  const updateVideoFormats = response => {
    if (response && typeof response === 'object') {
      const newFormats = {
        ...response
      };
      Object.keys(newFormats).forEach(key => {
        // When updating, preserve the existing 'checked' state.
        // This prevents the UI from losing state on a poll refresh.
        newFormats[key].checked = videoFormats?.[key]?.checked || false;
      });

      // Only update state if the formats have actually changed.
      if (!deepEqual(videoFormats, newFormats)) {
        setVideoFormats(newFormats);
      }
    } else if (!deepEqual(videoFormats, response)) {
      // Fallback for non-object responses
      setVideoFormats(response);
    }
  };
  const fetchVideoFormats = () => {
    if (!id) {
      return;
    } // Don't fetch if there's no ID.
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_1___default()({
      path: '/videopack/v1/formats/' + id
    }).then(updateVideoFormats);
  };
  const pollVideoFormats = () => {
    console.log('update');
    if (src && id) {
      _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_1___default()({
        path: '/videopack/v1/formats/' + id,
        method: 'GET'
      }).then(updateVideoFormats).catch(error => console.error('Error polling video formats:', error));
    }
  };
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useEffect)(() => {
    fetchVideoFormats();
  }, [id]); // Fetch formats when the attachment ID changes

  const isEmpty = value => {
    if (value === false || value === null || Array.isArray(value) && value.length === 0 || typeof value === 'object' && Object.keys(value).length === 0) {
      return true;
    }
    return false;
  };
  const siteSettings = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_5__.useSelect)(select => {
    return select('core').getSite();
  }, []);
  const checkIsEncoding = formats => {
    if (!formats) {
      return false;
    }
    // Check if any format has status 'processing' or 'encoding'
    return Object.values(formats).some(format => format.hasOwnProperty('encoding_now') && format.encoding_now);
  };
  const incrementEncodeProgress = () => {
    console.log('progress');
    if (isEncoding) {
      // Use the state variable
      const updatedVideoFormats = Object.entries(videoFormats).reduce((updated, [key, format]) => {
        if (!isEmpty(format.progress)) {
          const currentSeconds = format.progress.current_seconds + parseInt(format.progress.fps) / 30;
          let percentDone = Math.round(format.progress.current_seconds / parseInt(format.progress.duration) * 100);
          if (percentDone > 100) {
            percentDone = 100;
          }
          if (percentDone !== 0) {
            format.progress.elapsed = format.progress.elapsed + 1;
            if (!isNaN(format.progress.remaining)) {
              if (format.progress.remaining > 0) {
                format.progress.remaining--;
              } else {
                format.progress.remaing = 0;
              }
            }
          }
          updated[key] = {
            ...format,
            progress: {
              ...format.progress,
              current_seconds: currentSeconds,
              elapsed: format.progress.elapsed,
              percent_done: percentDone,
              remaining: format.progress.remaining
            }
          };
        } else {
          updated[key] = format;
        }
        return updated;
      }, {});
      setVideoFormats(updatedVideoFormats);
    }
  };
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useEffect)(() => {
    setIsEncoding(checkIsEncoding(videoFormats));
  }, [videoFormats]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useEffect)(() => {
    // Schedule polling for updates
    checkboxTimerRef.current = setTimeout(pollVideoFormats, 5000);

    // Manage progress timer based on encoding state
    if (!isEncoding) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
      return;
    }
    if (progressTimerRef.current === null) {
      progressTimerRef.current = setInterval(incrementEncodeProgress, 1000);
    }
    return () => {
      if (progressTimerRef.current !== null) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
      if (checkboxTimerRef.current !== null) {
        clearTimeout(checkboxTimerRef.current);
        checkboxTimerRef.current = null;
      }
    };
  }, [isEncoding]); // Depend on isEncoding state

  const handleFormatCheckbox = (event, format) => {
    setVideoFormats(prevVideoFormats => {
      const updatedFormats = {
        ...prevVideoFormats
      };
      if (updatedFormats[format]) {
        updatedFormats[format].checked = event;
      }
      return updatedFormats;
    });
    // Note: Checkbox state is now purely UI. Saving to DB happens on "Encode" button click.
  };
  const onSelectFormat = media => {
    console.log('select');
  };
  const handleEnqueue = () => {
    setIsLoading(true);

    // Get list of format IDs that are checked and available
    const formatsToEncode = Object.entries(videoFormats).filter(([key, value]) => value.checked && value.status !== 'queued' && value.status !== 'processing' && value.status !== 'completed').reduce((acc, [key, value]) => {
      acc[key] = true; // Backend expects an object { format_id: true, ... }
      return acc;
    }, {});
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_1___default()({
      path: `${queueApiPath}/${id}`,
      method: 'POST',
      data: {
        url: src,
        formats: formatsToEncode
      }
    }).then(response => {
      console.log(response);
      const queueMessage = () => {
        const queueList = (() => {
          if (response?.enqueue_data?.encode_list) {
            return new Intl.ListFormat(siteSettings?.language ? siteSettings.language.replace('_', '-') : 'en-US', {
              style: 'long',
              type: 'conjunction'
            }).format(Object.values(response?.enqueue_data?.encode_list));
          }
          return '';
        })();
        if (response?.enqueue_data?.new_queue_position == false) {
          const queuePosition = response?.enqueue_data?.existing_queue_position;
          if (!JSON.stringify(response?.enqueue_data?.encode_list) !== '[]') {
            return (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('%1$s updated in existing queue entry in position %2$s.'), queueList, queuePosition);
          }
          return (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Video is already %1$s in the queue.'), queuePosition);
        }
        if (response?.enqueue_data?.new_queue_position === 1) {
          return (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Starting…');
        }
        const queuePosition = response?.enqueue_data?.new_queue_position;
        return (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('%1$s added to queue in position %2$s.'), queueList, queuePosition);
      };
      setEncodeMessage(queueMessage());
      setIsLoading(false);
      fetchVideoFormats(); // Re-fetch to update statuses
    }).catch(error => {
      console.error(error);
      // Use the detailed error messages from the server if available
      const errorMessage = error?.data?.details ? error.data.details.join(', ') : error.message;
      setEncodeMessage((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Error: %s'), errorMessage));
      setIsLoading(false);
      fetchVideoFormats(); // Re-fetch to ensure UI is consistent
    });
  };
  const formatPickable = format => {
    if (videoFormats && videoFormats[format] && (
    // A format is "pickable" if the file doesn't exist AND it's not already queued/processing/completed
    !videoFormats[format].exists && videoFormats[format].status === 'not_encoded' || videoFormats[format].was_picked) && !videoFormats[format].encoding_now) {
      return true;
    }
    return false;
  };

  // Deletes the actual media file (WP Attachment)
  const handleFileDelete = formatId => {
    const formatData = videoFormats?.[formatId];
    if (!formatData || !formatData.id) {
      setEncodeMessage((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Error: Cannot delete file, missing attachment ID.'));
      console.error('Cannot delete file: Missing id for format', formatId);
      return;
    }
    setDeleteInProgress(formatId); // Mark this formatId as being deleted
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_1___default()({
      path: `/wp/v2/media/${formatData.id}?force=true`,
      method: 'DELETE'
    }).then(() => {
      setEncodeMessage((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('File deleted successfully.'));
      fetchVideoFormats(); // Re-fetch to get the latest status from backend
    }).catch(error => {
      console.error('File delete failed:', error);
      setEncodeMessage((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Error deleting file: %s'), error.message));
      fetchVideoFormats(); // Re-fetch to get the latest status
    }).finally(() => {
      setDeleteInProgress(null);
    });
  };

  // Deletes/Cancels a queue job
  const handleJobDelete = jobId => {
    if (!jobId) {
      setEncodeMessage((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Error: Cannot delete job, missing job ID.'));
      console.error('Cannot delete job: Missing job ID');
      return;
    }
    setDeleteInProgress(jobId); // Mark this jobId as being deleted
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_1___default()({
      path: `${queueApiPath}/${jobId}`,
      method: 'DELETE'
    }).then(response => {
      setEncodeMessage((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Job cancelled/deleted successfully.'));
      fetchVideoFormats(); // Re-fetch to get the latest status
    }).catch(error => {
      console.error('Job delete failed:', error);
      setEncodeMessage((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Error deleting job: %s'), error.message));
      fetchVideoFormats(); // Re-fetch to get the latest status
    }).finally(() => {
      setDeleteInProgress(null);
    });
  };
  const openConfirmDialog = (type, formatId) => {
    const formatData = videoFormats?.[formatId];
    if (!formatData) {
      return;
    }
    setItemToDelete({
      type,
      // 'file' or 'job'
      formatId,
      jobId: formatData.job_id,
      id: formatData.id,
      name: formatData.name
    });
    setIsConfirmOpen(true);
  };
  const handleConfirm = () => {
    setIsConfirmOpen(false);
    if (itemToDelete) {
      if (itemToDelete.type === 'file' && itemToDelete.id) {
        handleFileDelete(itemToDelete.formatId);
      } else if (itemToDelete.type === 'job' && itemToDelete.jobId) {
        handleJobDelete(itemToDelete.jobId);
      }
    }
    setItemToDelete(null);
  };
  const handleCancel = () => {
    setItemToDelete(null);
    setIsConfirmOpen(false);
  };
  const convertToTimecode = time => {
    if (time === null || time === undefined || isNaN(time)) {
      return '--:--';
    }
    const padZero = num => Math.floor(num).toString().padStart(2, '0');
    const h = Math.floor(time / 3600);
    const m = Math.floor(time % 3600 / 60);
    const s = Math.floor(time % 60);
    const hh = h > 0 ? padZero(h) + ':' : '';
    const mm = padZero(m);
    const ss = padZero(s);
    return hh + mm + ':' + ss;
  };
  const EncodeProgress = ({
    format
  }) => {
    const formatData = videoFormats?.[format];
    if (formatData?.status === 'processing' && !isEmpty(formatData?.progress)) {
      const percentText = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('%d%%'), formatData.progress.percent_done);
      const onCancelJob = () => {
        if (formatData.job_id) {
          handleJobDelete(formatData.job_id);
        }
      };
      return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
        className: "videopack-encode-progress",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("div", {
          className: "videopack-meter",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("div", {
            className: "videopack-meter-bar",
            style: {
              width: percentText
            },
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("div", {
              className: "videopack-meter-text",
              children: formatData.progress.percent_done > 20 && percentText
            })
          })
        }), formatData.job_id && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
          onClick: onCancelJob,
          variant: "secondary",
          isDestructive: true,
          size: "small",
          isBusy: deleteInProgress === formatData.job_id,
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Cancel')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
          className: "videopack-encode-progress-small-text",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("span", {
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Elapsed:') + ' ' + convertToTimecode(formatData.progress.elapsed)
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("span", {
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Remaining:') + ' ' + convertToTimecode(formatData.progress.remaining)
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("span", {
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('fps:') + ' ' + formatData.progress.fps
          })]
        })]
      });
    }
    // Display error message if status is failed
    if (formatData?.status === 'failed' && !isEmpty(formatData?.error_message)) {
      return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
        className: "videopack-encode-error",
        children: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Error: %s'), formatData.error_message), formatData.job_id &&
        /*#__PURE__*/
        // Allow deleting failed jobs
        (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
          onClick: () => openConfirmDialog('job', format),
          variant: "link",
          text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Delete Job'),
          isDestructive: true,
          isBusy: deleteInProgress === formatData.job_id
        })]
      });
    }
    return null;
  };
  const somethingToEncode = () => {
    if (videoFormats) {
      // Check if any format is checked AND available AND not already in a terminal/pending state
      return Object.values(videoFormats).some(obj => obj.checked && obj.status !== 'queued' && obj.status !== 'processing' && obj.status !== 'completed' && obj.status !== 'pending_replacement');
    }
    return false;
  };
  const encodeButtonTitle = () => {
    if (somethingToEncode()) {
      return isLoading ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Loading…') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Encode selected formats');
    }
    return (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Select formats to encode');
  };
  const isEncodeButtonDisabled = isLoading || ffmpeg_exists !== true || !somethingToEncode();
  const confirmDialogMessage = () => {
    if (!itemToDelete) {
      return '';
    }
    if (itemToDelete.type === 'file') {
      return (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('You are about to permanently delete the encoded %s video file from your site. This action cannot be undone.'), itemToDelete.name);
    }
    if (itemToDelete.type === 'job') {
      return (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('You are about to permanently delete the encoding job for the %s video. This will also delete the encoded video file if it exists (if created by this job and not yet a separate attachment). This action cannot be undone.'), itemToDelete.name);
    }
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.Fragment, {
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Additional Formats'),
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.MediaUploadCheck, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelRow, {
          children: videoFormats ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.Fragment, {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("ul", {
              className: `videopack-formats-list${ffmpeg_exists === true ? '' : ' no-ffmpeg'}`,
              children: videopack.settings.codecs.map(codec => {
                if (!options.encode[codec.id] || !options.encode[codec.id].enabled) {
                  return null;
                }
                return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("li", {
                  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("h4", {
                    className: "videopack-codec-name",
                    children: codec.name
                  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("ul", {
                    children: videopack.settings.resolutions.map(resolution => {
                      const formatId = `${codec.id}_${resolution.id}`;
                      const formatData = videoFormats[formatId];
                      if (!formatData) {
                        return null;
                      }
                      if (options.hide_video_formats && !options.encode[codec.id].resolutions[resolution.id] || ffmpeg_exists !== true && resolution.id === 'fullres') {
                        return null;
                      }
                      const isCheckboxDisabled = ffmpeg_exists !== true || formatData.exists;
                      return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("li", {
                        children: [ffmpeg_exists === true ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.CheckboxControl, {
                          __nextHasNoMarginBottom: true,
                          className: "videopack-format",
                          label: formatData.label,
                          checked: formatData.checked,
                          disabled: isCheckboxDisabled,
                          onChange: event => handleFormatCheckbox(event, formatId)
                        }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("span", {
                          className: "videopack-format",
                          children: formatData.label
                        }), formatData.status !== 'not_encoded' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("span", {
                          className: "videopack-format-status",
                          children: formatData.status_l10n
                        }), formatData.status === 'not_encoded' && !formatData.was_picked && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
                          variant: "secondary",
                          onClick: () => onSelectFormat(formatData) // Implement onSelectFormat for linking
                          ,
                          className: "videopack-format-button",
                          size: "small",
                          title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Pick existing file'),
                          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Pick')
                        }), formatData.was_picked &&
                        /*#__PURE__*/
                        // Show "Replace" if it was manually picked/linked
                        (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.MediaUpload, {
                          title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Replace %s'), formatData.label),
                          onSelect: onSelectFormat // Implement replace logic
                          ,
                          allowedTypes: ['video'],
                          render: ({
                            open
                          }) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
                            variant: "secondary",
                            onClick: open,
                            className: "videopack-format-button",
                            size: "small",
                            title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Replace file'),
                            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Replace')
                          })
                        }), formatData.deletable && formatData.id &&
                        /*#__PURE__*/
                        // Delete FILE button
                        (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
                          isBusy: deleteInProgress === formatId,
                          onClick: () => openConfirmDialog('file', formatId),
                          variant: "link",
                          text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Delete Permanently'),
                          isDestructive: true
                        }), (formatData.status === 'processing' || formatData.status === 'failed') && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(EncodeProgress, {
                          format: formatId
                        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.__experimentalDivider, {})]
                      }, formatId);
                    })
                  })]
                }, codec.id);
              })
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.__experimentalConfirmDialog, {
              isOpen: isConfirmOpen,
              onConfirm: handleConfirm,
              onCancel: handleCancel,
              children: confirmDialogMessage()
            })]
          }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.Fragment, {
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Spinner, {})
          })
        }), ffmpeg_exists === true && videoFormats && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelRow, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
            variant: "secondary",
            onClick: handleEnqueue,
            title: encodeButtonTitle(),
            text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Encode'),
            disabled: isEncodeButtonDisabled
          }), isLoading && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Spinner, {}), encodeMessage && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("span", {
            className: "videopack-encode-message",
            children: encodeMessage
          })]
        })]
      })
    })
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (AdditionalFormats);

/***/ }),

/***/ "./src/Thumbnails/Thumbnails.js":
/*!**************************************!*\
  !*** ./src/Thumbnails/Thumbnails.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_media_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/media-utils */ "@wordpress/media-utils");
/* harmony import */ var _wordpress_media_utils__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_media_utils__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _wordpress_url__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @wordpress/url */ "@wordpress/url");
/* harmony import */ var _wordpress_url__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_wordpress_url__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/chevron-down.js");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/chevron-up.js");
/* harmony import */ var _Thumbnails_scss__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./Thumbnails.scss */ "./src/Thumbnails/Thumbnails.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__);
/* global videopack */











const Thumbnails = ({
  setAttributes,
  attributes,
  attachmentRecord,
  options = {}
}) => {
  const {
    id,
    src,
    poster,
    poster_id
  } = attributes;
  const total_thumbnails = attributes.total_thumbnails || options.total_thumbnails;
  const thumbVideoPanel = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useRef)();
  const videoRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useRef)();
  const currentThumb = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useRef)();
  const posterImageButton = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useRef)();
  const [isPlaying, setIsPlaying] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(false);
  const [isOpened, setIsOpened] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(false);
  const [currentTime, setCurrentTime] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(false);
  const [thumbChoices, setThumbChoices] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)([]);
  const [isSaving, setIsSaving] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(false);
  const thumbApiPath = '/videopack/v1/thumbs';
  const VIDEO_POSTER_ALLOWED_MEDIA_TYPES = ['image'];
  function onSelectPoster(image) {
    setAttributes({
      poster: image.url,
      poster_id: Number(image.id)
    });
  }
  function onRemovePoster() {
    setAttributes({
      poster: undefined
    });

    // Move focus back to the Media Upload button.
    posterImageButton.current.focus();
  }
  const handleGenerate = async (type = 'generate') => {
    setIsSaving(true);
    if (options?.ffmpeg_exists && !options?.browser_thumbnails) {
      const newThumbImages = [];
      for (let i = 1; i <= Number(total_thumbnails); i++) {
        const response = await generateThumb(i, type);
        const thumb = {
          src: response.real_thumb_url,
          type: 'ffmpeg'
        };
        newThumbImages.push(thumb);
        setThumbChoices([...newThumbImages]); // Update incrementally
      }
    } else {
      generateThumbCanvases(type);
    }
  };
  const generateThumbCanvases = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useCallback)(async type => {
    const thumbsInt = Number(total_thumbnails);
    const newThumbCanvases = [];
    const timePoints = [...Array(thumbsInt)].map((_, i) => {
      let movieoffset = (i + 1) / (thumbsInt + 1) * videoRef.current.duration;
      if (type === 'random') {
        const randomOffset = Math.floor(Math.random() * (videoRef.current.duration / thumbsInt));
        movieoffset = Math.max(movieoffset - randomOffset, 0);
      }
      return movieoffset;
    });
    const timeupdateListener = () => {
      let thumb;
      drawCanvasThumb() // This now returns a Promise resolving to a canvas object
      .then(canvas => {
        try {
          thumb = {
            src: canvas.toDataURL(),
            type: 'canvas',
            canvasObject: canvas // Store the canvas object for later upload
          };
        } catch (error) {
          console.error(error);
          videoRef.current.removeEventListener('timeupdate', timeupdateListener);
          setIsSaving(false);
          return;
        }
        newThumbCanvases.push(thumb);
        setThumbChoices([...newThumbCanvases]);
        if (newThumbCanvases.length === thumbsInt) {
          videoRef.current.removeEventListener('timeupdate', timeupdateListener);
          setIsSaving(false);
        } else {
          videoRef.current.currentTime = timePoints[newThumbCanvases.length];
        }
      }).catch(error => {
        console.error('Error processing canvas:', error);
      });
    };
    videoRef.current.addEventListener('timeupdate', timeupdateListener);
    videoRef.current.currentTime = timePoints[0];
  });

  // function to toggle video playback
  const togglePlayback = () => {
    if (videoRef.current?.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  };
  const pauseVideo = () => {
    videoRef.current.pause();
    setIsPlaying(false);
  };
  const playVideo = () => {
    videoRef.current.play();
    setIsPlaying(true);
  };

  // function to handle slider changes
  const handleSliderChange = value => {
    videoRef.current.currentTime = value;
    setCurrentTime(value);
  };
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    const handleTimeUpdate = () => {
      setCurrentTime(videoRef.current.currentTime); // update currentTime state variable
    };
    videoRef.current?.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      videoRef.current?.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);
  const drawCanvasThumb = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    if (options?.ffmpeg_thumb_watermark?.url) {
      try {
        const watermarkCanvas = drawWatermarkOnCanvas(canvas);
        return watermarkCanvas;
      } catch (error) {
        console.error('Error drawing watermark:', error);
      }
    } else {
      return canvas;
    }
  };
  const handleSaveThumbnail = (event, thumb, index) => {
    event.currentTarget.classList.add('saving');
    setIsSaving(true);
    if (thumb.type === 'ffmpeg') {
      setImgAsPoster(thumb.src); // Pass the canvas object directly
    } else {
      setCanvasAsPoster(thumb.canvasObject, index); // Pass the canvas object directly
    }
  };
  const handleSaveAllThumbnails = async () => {
    setIsSaving(true); // Show spinner for the whole operation
    const firstThumbType = thumbChoices[0]?.type; // Assuming all generated thumbs are of the same type

    if (firstThumbType === 'canvas') {
      // For canvas thumbnails, upload each one individually using uploadMedia
      for (const [index, thumb] of thumbChoices.entries()) {
        try {
          const videoFilename = (0,_wordpress_url__WEBPACK_IMPORTED_MODULE_6__.getFilename)(src);
          const thumbBasename = videoFilename.substring(0, videoFilename.lastIndexOf('.')) || videoFilename;
          const file = await new Promise(resolve => thumb.canvasObject.toBlob(blob => {
            resolve(new File([blob], `${thumbBasename}_thumb_canvas_${index + 1}.png`, {
              type: 'image/png'
            }));
          }, 'image/png'));
          await (0,_wordpress_media_utils__WEBPACK_IMPORTED_MODULE_4__.uploadMedia)({
            // No need to store response, just upload
            filesList: [file],
            allowedTypes: ['image/png'],
            title: `${thumbBasename} ${(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('thumbnail')} ${index + 1}`
          });
        } catch (error) {
          console.error(`Error uploading canvas thumbnail ${index + 1}:`, error);
          // Optionally, show a notice for individual failures.
        }
      }
      setThumbChoices([]); // Clear choices after saving
    } else if (firstThumbType === 'ffmpeg') {
      // For FFmpeg thumbnails, send their temporary URLs to the server to be saved
      const thumbUrls = thumbChoices.map(thumb => thumb.src);
      try {
        await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
          path: `${thumbApiPath}/save_all`,
          method: 'POST',
          data: {
            attachment_id: id,
            thumb_urls: thumbUrls
          }
        });
        setThumbChoices([]); // Clear choices after saving
      } catch (error) {
        console.error('Error saving all FFmpeg thumbnails:', error);
      }
    }
    setIsSaving(false); // Hide spinner after all operations complete
  };
  function drawWatermarkOnCanvas(canvas) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!options?.ffmpeg_thumb_watermark?.url) {
          reject(new Error('No thumbnail watermark set'));
        }
        const ctx = canvas.getContext('2d');
        const watermarkImage = new Image();
        const {
          url,
          scale,
          align,
          x,
          valign,
          y
        } = options.ffmpeg_thumb_watermark;
        watermarkImage.crossOrigin = 'Anonymous';
        watermarkImage.src = url;
        watermarkImage.onload = () => {
          const canvasWidth = canvas.width;
          const canvasHeight = canvas.height;
          const watermarkWidth = canvasWidth * scale / 100;
          const watermarkHeight = canvasHeight * scale / 100;
          const horizontalOffset = canvasWidth * x / 100;
          const verticalOffset = canvasHeight * y / 100;
          let xPos, yPos;
          switch (align) {
            case 'left':
              xPos = horizontalOffset;
              break;
            case 'center':
              xPos = (canvasWidth - watermarkWidth) / 2 + horizontalOffset;
              break;
            case 'right':
              xPos = canvasWidth - watermarkWidth - horizontalOffset;
              break;
            default:
              reject(new Error((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Invalid horizontal alignment provided')));
              return;
          }
          switch (valign) {
            case 'top':
              yPos = verticalOffset;
              break;
            case 'center':
              yPos = (canvasHeight - watermarkHeight) / 2 + verticalOffset;
              break;
            case 'bottom':
              yPos = canvasHeight - watermarkHeight - verticalOffset;
              break;
            default:
              reject(new Error((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Invalid vertical alignment provided')));
              return;
          }
          ctx.drawImage(watermarkImage, xPos, yPos, watermarkWidth, watermarkHeight);
          resolve(canvas);
        };
        watermarkImage.onerror = () => {
          reject(new Error((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Failed to load watermark image')));
        };
      } catch (error) {
        reject(error);
      }
    });
  }
  const setCanvasAsPoster = async (canvasObject, thumbnailIndex = null) => {
    const videoFilename = (0,_wordpress_url__WEBPACK_IMPORTED_MODULE_6__.getFilename)(src);
    const thumbBasename = videoFilename.substring(0, videoFilename.lastIndexOf('.')) || videoFilename;
    const filenameSuffix = thumbnailIndex !== null ? `_thumb_canvas_${thumbnailIndex + 1}.png` : '_thumb_canvas.png';
    const titleSuffix = thumbnailIndex !== null ? ` ${(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('thumbnail')} ${thumbnailIndex + 1}` : ` ${(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('thumbnail')}`;
    try {
      const file = await new Promise(resolve => canvasObject.toBlob(blob => {
        resolve(new File([blob], `${thumbBasename}${filenameSuffix}`, {
          type: 'image/png'
        }));
      }, 'image/png'));
      setIsSaving(true);
      // uploadMedia returns a promise that resolves with the media object.
      const media = await (0,_wordpress_media_utils__WEBPACK_IMPORTED_MODULE_4__.uploadMedia)({
        filesList: [file],
        allowedTypes: ['image/png'],
        title: `${thumbBasename}${titleSuffix}`
      });
      setPosterData(media.url, media.id);
      setIsSaving(false);
    } catch (error) {
      console.error((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Upload error:'), error);
      // createErrorNotice( error, { type: 'snackbar' } ); // Assuming createErrorNotice is available if needed
    }
  };
  const setPosterData = (new_poster, new_poster_id) => {
    setAttributes({
      poster: new_poster,
      poster_id: new_poster_id
    });
    setThumbChoices([]);
    attachmentRecord?.edit({
      featured_media: new_poster_id ? Number(new_poster_id) : null,
      meta: {
        '_kgflashmediaplayer-poster': new_poster,
        '_kgflashmediaplayer-poster-id': Number(new_poster_id)
      }
    }).then(response => {
      attachmentRecord.save().then(response => {
        console.log(attachmentRecord);
      });
    }).catch(error => {
      console.error(error);
    });
  };
  const setImgAsPoster = async (thumb_url, index) => {
    try {
      const response = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
        path: thumbApiPath,
        method: 'PUT',
        data: {
          attachment_id: id,
          thumburl: thumb_url,
          thumbnail_index: index
        }
      });
      setPosterData(response.thumb_url, response.thumb_id);
    } catch (error) {
      console.error(error);
    }
  };
  const generateThumb = async (i, type) => {
    try {
      const path = (0,_wordpress_url__WEBPACK_IMPORTED_MODULE_6__.addQueryArgs)(thumbApiPath, {
        url: src,
        total_thumbnails,
        thumbnail_index: i,
        attachment_id: id,
        generate_button: type
      });
      const response = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
        path
      });
      return response;
    } catch (error) {
      console.error(error);
    }
  };
  const handleVideoKeyboardControl = event => {
    event.stopImmediatePropagation();
    switch (event.code) {
      case 'Space':
        // spacebar
        togglePlayback();
        break;
      case 'ArrowLeft':
        // left
        pauseVideo();
        videoRef.current.currentTime = videoRef.current.currentTime - 0.042;
        break;
      case 'ArrowRight':
        // right
        pauseVideo();
        videoRef.current.currentTime = videoRef.current.currentTime + 0.042;
        break;
      case 'KeyJ':
        //j
        if (isPlaying) {
          videoRef.current.playbackRate = Math.max(0, videoRef.current.playbackRate - 1);
        }
        break;
      case 'KeyK':
        // k
        pauseVideo();
        break;
      case 'KeyL':
        //l
        if (isPlaying) {
          videoRef.current.playbackRate = videoRef.current.playbackRate + 1;
        }
        playVideo();
        break;
      default:
        return;
      // exit this handler for other keys
    }
    event.preventDefault(); // prevent the default action (scroll / move caret)
  };
  const handleUseThisFrame = async () => {
    setIsSaving(true);
    const canvas = await drawCanvasThumb(); // Await the canvas object (no index for single frame)
    setCanvasAsPoster(canvas); // Pass the canvas object directly, index will be null
  };
  const handleToggleVideoPlayer = event => {
    event.preventDefault();
    const next = !isOpened;
    setIsOpened(next);
    if (next && thumbVideoPanel.current) {
      thumbVideoPanel.current.focus();
      thumbVideoPanel.current.addEventListener('keydown', handleVideoKeyboardControl);
    } else {
      thumbVideoPanel.current.addEventListener('keydown', handleVideoKeyboardControl);
    }
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
    className: "videopack-thumbnail-generator",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Thumbnails'),
      children: [poster && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("img", {
        className: "videopack-current-thumbnail",
        src: poster,
        ref: currentThumb,
        alt: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Current Thumbnail')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.BaseControl, {
        className: "editor-video-poster-control",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.BaseControl.VisualLabel, {
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Video Thumbnail')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.MediaUpload, {
          title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Select video thumbnail'),
          onSelect: onSelectPoster,
          allowedTypes: VIDEO_POSTER_ALLOWED_MEDIA_TYPES,
          render: ({
            open
          }) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
            variant: "secondary",
            onClick: open,
            ref: posterImageButton,
            children: !poster ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Select') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Replace')
          })
        }), !!poster && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
          onClick: onRemovePoster,
          variant: "tertiary",
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Remove')
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TextControl // This is the UI control for total_thumbnails.
      , {
        value: total_thumbnails,
        onChange: value => {
          if (!value) {
            setAttributes({
              total_thumbnails: ''
            });
          } else {
            setAttributes({
              total_thumbnails: Number(value)
            });
          }
        },
        className: "videopack-total-thumbnails",
        disabled: isSaving
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
        variant: "secondary",
        onClick: () => handleGenerate('generate'),
        className: "videopack-generate",
        disabled: isSaving,
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Generate')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
        variant: "secondary",
        onClick: () => handleGenerate('random'),
        className: "videopack-generate",
        disabled: isSaving,
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Random')
      }), thumbChoices.length > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
        variant: "primary",
        onClick: handleSaveAllThumbnails,
        disabled: isSaving,
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Save All')
      }), thumbChoices.length > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
        className: `videopack-thumbnail-holder${isSaving ? ' disabled' : ''}`,
        children: thumbChoices.map((thumb, index) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("button", {
          type: "button",
          className: 'videopack-thumbnail',
          onClick: event => {
            handleSaveThumbnail(event, thumb, index);
          },
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("img", {
            src: thumb.src,
            alt: `Thumbnail ${index + 1}`,
            title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Save and set thumbnail')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Spinner, {})]
        }, index))
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
        className: `components-panel__body videopack-thumb-video ${isOpened ? 'is-opened' : ''}`,
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("h2", {
          className: "components-panel__body-title",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("button", {
            className: "components-button components-panel__body-toggle",
            type: "button",
            onClick: handleToggleVideoPlayer,
            "aria-expanded": isOpened,
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("span", {
              "aria-hidden": "true",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Icon, {
                className: "components-panel__arrow",
                icon: isOpened ? _wordpress_icons__WEBPACK_IMPORTED_MODULE_8__["default"] : _wordpress_icons__WEBPACK_IMPORTED_MODULE_7__["default"]
              })
            }), (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Choose From Video')]
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
          className: "videopack-thumb-video-panel",
          tabIndex: 0,
          ref: thumbVideoPanel,
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("video", {
            src: src,
            ref: videoRef,
            muted: true,
            preload: "metadata",
            onClick: togglePlayback
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
            className: "videopack-play-pause",
            onClick: togglePlayback,
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Dashicon, {
              icon: isPlaying ? 'controls-pause' : 'controls-play'
            })
          }), !isNaN(videoRef.current?.duration) && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.RangeControl, {
            __nextHasNoMarginBottom: true,
            min: 0,
            max: videoRef.current.duration,
            step: "any",
            initialPosition: 0,
            value: videoRef.current.currentTime,
            onChange: handleSliderChange,
            className: "videopack-thumbvideo-slider",
            type: "slider"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
            variant: "secondary",
            onClick: handleUseThisFrame,
            disabled: isSaving,
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Use this frame')
          })]
        })]
      })]
    })
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Thumbnails);

/***/ }),

/***/ "./src/Thumbnails/Thumbnails.scss":
/*!****************************************!*\
  !*** ./src/Thumbnails/Thumbnails.scss ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./src/attachment-details/AttachmentDetails.js":
/*!*****************************************************!*\
  !*** ./src/attachment-details/AttachmentDetails.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/compose */ "@wordpress/compose");
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_compose__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_core_data__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/core-data */ "@wordpress/core-data");
/* harmony import */ var _wordpress_core_data__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_core_data__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _icon__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../icon */ "./src/icon.js");
/* harmony import */ var _Thumbnails_Thumbnails__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../Thumbnails/Thumbnails */ "./src/Thumbnails/Thumbnails.js");
/* harmony import */ var _AdditionalFormats__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../AdditionalFormats */ "./src/AdditionalFormats.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__);










const AttachmentDetails = ({
  attachmentAttributes
}) => {
  const {
    id
  } = attachmentAttributes;
  const [options, setOptions] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_5__.useState)();
  const [attributes, setAttributes] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_5__.useState)();
  const attachmentRecord = isNaN(id) ? null : (0,_wordpress_core_data__WEBPACK_IMPORTED_MODULE_4__.useEntityRecord)('postType', 'attachment', id);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_5__.useEffect)(() => {
    console.log('Attachment component mounted.');
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_1___default()({
      path: '/videopack/v1/settings',
      method: 'GET'
    }).then(response => {
      setOptions(response);
    });
    return () => console.log('Component unmounted!');
  }, []);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_5__.useEffect)(() => {
    const combinedAttributes = {
      id,
      total_thumbnails: attachmentAttributes?.meta?.['_videopack-meta']?.total_thumbnails || options?.total_thumbnails,
      src: attachmentAttributes?.url,
      poster: attachmentAttributes?.meta?.['_kgflashmediaplayer-poster'] || attachmentAttributes?.image?.src,
      poster_id: attachmentAttributes?.meta?.['_kgflashmediaplayer-poster-id']
    };
    setAttributes(combinedAttributes);
  }, [options]);
  if (attributes && attachmentRecord.hasResolved && options) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)("div", {
      className: "videopack-attachment-details",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_Thumbnails_Thumbnails__WEBPACK_IMPORTED_MODULE_7__["default"], {
        setAttributes: setAttributes,
        attributes: attributes,
        attachmentRecord: attachmentRecord,
        options: options
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_AdditionalFormats__WEBPACK_IMPORTED_MODULE_8__["default"], {
        setAttributes: setAttributes,
        attributes: attributes,
        attachmentRecord: attachmentRecord,
        options: options
      })]
    });
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Spinner, {});
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (AttachmentDetails);

/***/ }),

/***/ "./src/icon.js":
/*!*********************!*\
  !*** ./src/icon.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   insertImage: () => (/* binding */ insertImage),
/* harmony export */   save: () => (/* binding */ save),
/* harmony export */   videopack: () => (/* binding */ videopack),
/* harmony export */   volumeDown: () => (/* binding */ volumeDown),
/* harmony export */   volumeUp: () => (/* binding */ volumeUp)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);

const videopack = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("svg", {
  width: "20px",
  height: "20px",
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 395.11 395.11",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("g", {
    "data-name": "Ellipse 1",
    transform: "rotate(-45 -201.149 592.789)",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("circle", {
      cx: "360.24",
      cy: "595.24",
      r: "182.56",
      fill: "none",
      stroke: "#cd0000",
      strokeWidth: "30"
    })
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    fill: "#cd0000",
    d: "M95.4 108.3h45.81l57.42 98.69 55.57-98.69h47.49L198.54 286.81 95.4 109.68"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    fill: "#f26a6b",
    d: "M254.2 108.3l-55.57 98.69-57.42-98.69"
  })]
});
const volumeDown = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "currentColor",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    d: "M0 0h24v24H0V0z",
    fill: "none"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    d: "M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"
  })]
});
const volumeUp = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "currentColor",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    d: "M0 0h24v24H0V0z",
    fill: "none"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    d: "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
  })]
});
const save = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "currentColor",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    d: "M0 0h24v24H0V0z",
    fill: "none"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    d: "M17 3H3v18h18V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"
  })]
});
const insertImage = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 0 24 24",
  width: "24px",
  fill: "currentColor",
  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    d: "M21 21V3H3v18h18zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
  })
});


/***/ }),

/***/ "@wordpress/api-fetch":
/*!**********************************!*\
  !*** external ["wp","apiFetch"] ***!
  \**********************************/
/***/ ((module) => {

module.exports = window["wp"]["apiFetch"];

/***/ }),

/***/ "@wordpress/block-editor":
/*!*************************************!*\
  !*** external ["wp","blockEditor"] ***!
  \*************************************/
/***/ ((module) => {

module.exports = window["wp"]["blockEditor"];

/***/ }),

/***/ "@wordpress/components":
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
/***/ ((module) => {

module.exports = window["wp"]["components"];

/***/ }),

/***/ "@wordpress/compose":
/*!*********************************!*\
  !*** external ["wp","compose"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["compose"];

/***/ }),

/***/ "@wordpress/core-data":
/*!**********************************!*\
  !*** external ["wp","coreData"] ***!
  \**********************************/
/***/ ((module) => {

module.exports = window["wp"]["coreData"];

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

/***/ "@wordpress/media-utils":
/*!************************************!*\
  !*** external ["wp","mediaUtils"] ***!
  \************************************/
/***/ ((module) => {

module.exports = window["wp"]["mediaUtils"];

/***/ }),

/***/ "@wordpress/primitives":
/*!************************************!*\
  !*** external ["wp","primitives"] ***!
  \************************************/
/***/ ((module) => {

module.exports = window["wp"]["primitives"];

/***/ }),

/***/ "@wordpress/url":
/*!*****************************!*\
  !*** external ["wp","url"] ***!
  \*****************************/
/***/ ((module) => {

module.exports = window["wp"]["url"];

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
/*!******************************************************!*\
  !*** ./src/attachment-details/attachment-details.js ***!
  \******************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _AttachmentDetails__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AttachmentDetails */ "./src/attachment-details/AttachmentDetails.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__);



jQuery(function ($) {
  // Ensure wp.media is loaded.
  if (typeof wp === 'undefined' || !wp.media || !wp.media.view || !wp.media.view.Attachment.Details) {
    console.error('Videopack: wp.media.view.Attachment.Details is not available.');
    return;
  }
  console.log('Videopack: Extending wp.media.view.Attachment.Details.');
  const originalAttachmentDetails = wp.media.view.Attachment.Details;
  wp.media.view.Attachment.Details = originalAttachmentDetails.extend({
    // A reference to the React root instance.
    videopackReactRoot: null,
    render: function () {
      console.log('Videopack: Rendering attachment details.');

      // First, call the original render method.
      originalAttachmentDetails.prototype.render.apply(this, arguments);

      // Unmount any existing React component before re-rendering.
      if (this.videopackReactRoot) {
        console.log('Videopack: Unmounting existing React component.');
        this.videopackReactRoot.unmount();
        this.videopackReactRoot = null;
      }

      // Check if the attachment is a video or an animated GIF with our meta.
      const isVideo = this.model.attributes.type === 'video';
      const isAnimatedGif = this.model.attributes.subtype === 'gif' && this.model.attributes.meta?.['_kgvid-meta']?.animated;
      if (isVideo || isAnimatedGif) {
        console.log('Videopack: Video or animated GIF detected. Mounting React component.');
        const settingsSection = this.$el.find('.settings');
        if (settingsSection.length === 0) {
          console.error('Videopack: Could not find the .settings section in the attachment details sidebar.');
          return;
        }

        // Create and append the root div for our React component.
        const reactRootDiv = document.createElement('div');
        reactRootDiv.id = 'videopack-attachment-details-root';
        settingsSection.append(reactRootDiv);

        // Create a new React root and render the component.
        this.videopackReactRoot = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createRoot)(reactRootDiv);
        this.videopackReactRoot.render(/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_AttachmentDetails__WEBPACK_IMPORTED_MODULE_1__["default"], {
          attachmentAttributes: this.model.attributes
        }));
        console.log('Videopack: React component mounted successfully.');
      } else {
        console.log('Videopack: Attachment is not a video, skipping React component.');
      }
      return this;
    },
    remove: function () {
      // Unmount the React component when the view is removed.
      if (this.videopackReactRoot) {
        console.log('Videopack: Unmounting React component on view removal.');
        this.videopackReactRoot.unmount();
        this.videopackReactRoot = null;
      }

      // Call the original remove method.
      return originalAttachmentDetails.prototype.remove.apply(this, arguments);
    }
  });
});
})();

/******/ })()
;
//# sourceMappingURL=attachment-details.js.map