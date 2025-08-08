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
/* harmony import */ var _wordpress_media_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/media-utils */ "@wordpress/media-utils");
/* harmony import */ var _wordpress_media_utils__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_media_utils__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _wordpress_core_data__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @wordpress/core-data */ "@wordpress/core-data");
/* harmony import */ var _wordpress_core_data__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_wordpress_core_data__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _additional_formats_scss__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./additional-formats.scss */ "./src/additional-formats.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__);
/* global videopack */










const AdditionalFormats = ({
  attributes,
  options = {}
}) => {
  const {
    id,
    src
  } = attributes;
  const {
    ffmpeg_exists
  } = options;
  const [videoFormats, setVideoFormats] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useState)({});
  const [encodeMessage, setEncodeMessage] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useState)();
  const [itemToDelete, setItemToDelete] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useState)(null); // { type: 'file'/'job', formatId: string, jobId?: int, id?: int, name?: string }
  const [deleteInProgress, setDeleteInProgress] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useState)(null); // Stores formatId or jobId being deleted
  const [isConfirmOpen, setIsConfirmOpen] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useState)(false);
  const [isLoading, setIsLoading] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useState)(false);
  const [isEncoding, setIsEncoding] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useState)(false);
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
    setVideoFormats(currentVideoFormats => {
      if (response && typeof response === 'object') {
        const newFormats = {
          ...response
        };
        Object.keys(newFormats).forEach(key => {
          const newFormat = newFormats[key];
          const oldFormat = currentVideoFormats?.[key];

          // Preserve the existing 'checked' state to prevent UI flicker on poll refresh.
          newFormat.checked = oldFormat?.checked || false;

          // If the format is encoding, merge progress data carefully.
          if (newFormat.encoding_now && newFormat.progress) {
            // If there's old progress data, merge it to prevent flashes of 0%.
            if (oldFormat?.progress) {
              newFormat.progress = {
                ...oldFormat.progress,
                ...newFormat.progress
              };
            } else {
              // If no old progress, ensure we don't start with a negative percent.
              newFormat.progress.percent = newFormat.progress.percent > 0 ? newFormat.progress.percent : 0;
            }
          }
        });

        // Only update state if the formats have actually changed.
        if (!deepEqual(currentVideoFormats, newFormats)) {
          return newFormats;
        }
      } else if (!deepEqual(currentVideoFormats, response)) {
        // Fallback for non-object responses
        return response;
      }
      return currentVideoFormats;
    });
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
  const shouldPoll = formats => {
    if (!formats) {
      return false;
    }
    // Poll only if at least one format is still in a state that requires updates.
    return Object.values(formats).some(format => format.status === 'queued' || format.status === 'encoding' || format.status === 'processing' || format.status === 'needs_insert');
  };
  const incrementEncodeProgress = () => {
    setVideoFormats(currentVideoFormats => {
      if (!currentVideoFormats || !isEncoding) {
        return currentVideoFormats;
      }
      const updatedVideoFormats = {
        ...currentVideoFormats
      };
      Object.keys(updatedVideoFormats).forEach(key => {
        const format = updatedVideoFormats[key];
        if (format.encoding_now && format.progress) {
          const elapsed = new Date().getTime() / 1000 - format.started;
          let percent = format.progress.percent || 0;
          let remaining = null;

          // Only calculate remaining time if video_duration is available.
          if (format.video_duration) {
            const totalDurationInSeconds = format.video_duration / 1000000;
            const speedMatch = format.progress.speed ? String(format.progress.speed).match(/(\d*\.?\d+)/) : null;
            const speed = speedMatch ? parseFloat(speedMatch[0]) : 0;

            // Increment percent based on speed. This function runs every second.
            if (speed > 0) {
              const increment = 1 / totalDurationInSeconds * 100 * speed;
              percent += increment;
            }

            // Calculate remaining time based on current percent and speed
            if (percent > 0 && speed > 0) {
              const remainingPercent = 100 - percent;
              remaining = totalDurationInSeconds * (remainingPercent / 100) / speed;
            } else {
              remaining = totalDurationInSeconds - elapsed;
            }
          }

          // Clamp values to be within expected ranges.
          percent = Math.min(100, Math.max(0, percent));
          remaining = remaining !== null ? Math.max(0, remaining) : null;
          updatedVideoFormats[key] = {
            ...format,
            progress: {
              ...format.progress,
              elapsed,
              remaining,
              percent
            }
          };
        }
      });
      return updatedVideoFormats;
    });
  };
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useEffect)(() => {
    setIsEncoding(shouldPoll(videoFormats));
  }, [videoFormats]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useEffect)(() => {
    let pollTimer = null;
    // Manage progress timer based on encoding state
    if (isEncoding) {
      // Start polling immediately and then every 5 seconds
      pollVideoFormats(); // Initial poll
      pollTimer = setInterval(pollVideoFormats, 5000);
      if (progressTimerRef.current === null) {
        progressTimerRef.current = setInterval(incrementEncodeProgress, 1000);
      }
    } else {
      // Clear all timers if not encoding
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
      clearInterval(pollTimer);
      pollTimer = null;
    }
    return () => {
      if (progressTimerRef.current !== null) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
      if (pollTimer !== null) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    };
  }, [isEncoding]); // Depend on isEncoding state

  const handleFormatCheckbox = (event, formatId) => {
    setVideoFormats(prevVideoFormats => {
      const updatedFormats = {
        ...prevVideoFormats
      };
      if (updatedFormats[formatId]) {
        updatedFormats[formatId].checked = event;
      }
      return updatedFormats;
    });
    // Note: Checkbox state is now purely UI. Saving to DB happens on "Encode" button click.
  };
  const getCheckboxCheckedState = formatData => {
    return formatData.checked || formatData.status === 'queued';
  };
  const getCheckboxDisabledState = formatData => {
    return formatData.exists || formatData.status === 'queued' || formatData.status === 'encoding' || formatData.status === 'processing' || formatData.status === 'completed';
  };
  const handleEnqueue = () => {
    if (!window.videopack || !window.videopack.settings) {
      return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Spinner, {});
    }
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
          if (response?.encode_list && Array.isArray(response.encode_list) && response.encode_list.length > 0) {
            return new Intl.ListFormat(siteSettings?.language ? siteSettings.language.replace('_', '-') : 'en-US', {
              style: 'long',
              type: 'conjunction'
            }).format(response.encode_list);
          }
          return '';
        })();
        if (!queueList) {
          if (response?.log?.length > 0) {
            return response.log.join(' ');
          }
          return (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('No formats were added to the queue.');
        }
        const queuePosition = response?.new_queue_position;
        return (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)(/* translators: %1$s is a list of video formats. %2$s is a number */
        (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('%1$s added to queue in position %2$s.'), queueList, queuePosition);
      };
      setEncodeMessage(queueMessage());
      setIsLoading(false);
      fetchVideoFormats(); // Re-fetch to update statuses
    }).catch(error => {
      console.error(error);
      // Use the detailed error messages from the server if available
      const errorMessage = error?.data?.details ? error.data.details.join(', ') : error.message;
      /* translators: %s is an error message */
      setEncodeMessage((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Error: %s'), errorMessage));
      setIsLoading(false);
      fetchVideoFormats(); // Re-fetch to ensure UI is consistent
    });
  };
  const onSelectFormat = formatId => media => {
    if (!media || !media.id || !formatId) {
      return;
    }
    setIsLoading(true);
    const data = {
      meta: {
        '_kgflashmediaplayer-format': formatId,
        '_kgflashmediaplayer-parent': id
      }
    };
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_1___default()({
      path: `/wp/v2/media/${media.id}`,
      method: 'POST',
      data
    }).then(() => {
      setEncodeMessage((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Video format assigned successfully.'));
      setIsLoading(false);
      fetchVideoFormats(); // Refresh the list
    }).catch(error => {
      console.error('Error assigning video format:', error);
      setEncodeMessage((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)(/* translators: %s is an error message */
      (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Error: %s'), error.message));
      setIsLoading(false);
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
      setEncodeMessage(/* translators: %s is an error message */
      (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Error deleting file: %s'), error.message));
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
      setEncodeMessage(/* translators: %s is an error message */
      (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Error deleting job: %s'), error.message));
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
    if (formatData?.encoding_now && !isEmpty(formatData?.progress)) {
      const percent = Math.round(formatData.progress.percent);
      const percentText = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)('%d%%', percent);
      const onCancelJob = () => {
        if (formatData.job_id) {
          handleJobDelete(formatData.job_id);
        }
      };
      return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
        className: "videopack-encode-progress",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("div", {
          className: "videopack-meter",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("div", {
            className: "videopack-meter-bar",
            style: {
              width: percentText
            },
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("div", {
              className: "videopack-meter-text",
              children: percentText
            })
          })
        }), formatData.job_id && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
          onClick: onCancelJob,
          variant: "secondary",
          isDestructive: true,
          size: "small",
          isBusy: deleteInProgress === formatData.job_id,
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Cancel')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
          className: "videopack-encode-progress-small-text",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("span", {
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Elapsed:') + ' ' + convertToTimecode(formatData.progress.elapsed)
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("span", {
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Remaining:') + ' ' + convertToTimecode(formatData.progress.remaining)
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("span", {
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('fps:') + ' ' + formatData.progress.fps
          })]
        })]
      });
    }
    // Display error message if status is failed
    if (formatData?.status === 'failed' && !isEmpty(formatData?.error_message)) {
      return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
        className: "videopack-encode-error",
        children: [/* translators: %s is an error message */
        (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Error: %s'), formatData.error_message), formatData.job_id &&
        /*#__PURE__*/
        // Allow deleting failed jobs
        (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
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
      return (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)(/* translators: %s is the name of a video format (eg: H264 MP4 HD (720p) ) */
      (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('You are about to permanently delete the encoded %s video file from your site. This action cannot be undone.'), itemToDelete.name);
    }
    if (itemToDelete.type === 'job') {
      return (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)(/* translators: %s is the name of a video format (eg: H264 MP4 HD (720p) ) */
      (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('You are about to permanently delete the encoding job for the %s video. This will also delete the encoded video file if it exists (if created by this job and not yet a separate attachment). This action cannot be undone.'), itemToDelete.name);
    }
  };
  const canUploadFiles = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_5__.useSelect)(select => select(_wordpress_core_data__WEBPACK_IMPORTED_MODULE_6__.store).canUser('create', 'media', id), [id]);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.Fragment, {
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Additional Formats'),
      children: [canUploadFiles && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelRow, {
        children: videoFormats ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.Fragment, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("ul", {
            className: `videopack-formats-list${ffmpeg_exists === true ? '' : ' no-ffmpeg'}`,
            children: videopack.settings.codecs.map(codec => {
              if (options.encode[codec.id]?.enabled !== '1') {
                return null;
              }
              return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("li", {
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("h4", {
                  className: "videopack-codec-name",
                  children: codec.name
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("ul", {
                  children: videopack.settings.resolutions.map(resolution => {
                    const formatId = `${codec.id}_${resolution.id}`;
                    const formatData = videoFormats[formatId];
                    if (!formatData) {
                      return null;
                    }
                    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("li", {
                      children: [ffmpeg_exists === true ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.CheckboxControl, {
                        __nextHasNoMarginBottom: true,
                        className: "videopack-format",
                        label: formatData.label,
                        checked: getCheckboxCheckedState(formatData),
                        disabled: getCheckboxDisabledState(formatData),
                        onChange: event => handleFormatCheckbox(event, formatId)
                      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("span", {
                        className: "videopack-format",
                        children: formatData.label
                      }), formatData.status !== 'not_encoded' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("span", {
                        className: "videopack-format-status",
                        children: formatData.status_l10n
                      }), formatData.status === 'not_encoded' && !formatData.was_picked && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_media_utils__WEBPACK_IMPORTED_MODULE_3__.MediaUpload, {
                        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Pick existing file'),
                        onSelect: onSelectFormat(formatId),
                        allowedTypes: ['video'],
                        render: ({
                          open
                        }) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
                          variant: "secondary",
                          onClick: open,
                          className: "videopack-format-button",
                          size: "small",
                          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Pick')
                        })
                      }), formatData.was_picked &&
                      /*#__PURE__*/
                      // Show "Replace" if it was manually picked/linked
                      (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_media_utils__WEBPACK_IMPORTED_MODULE_3__.MediaUpload, {
                        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)(/* translators: %s is the label of a video resolution (eg: 720p ) */
                        (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Replace %s'), formatData.label),
                        onSelect: onSelectFormat(formatId) // Implement replace logic
                        ,
                        allowedTypes: ['video'],
                        render: ({
                          open
                        }) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
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
                      (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
                        isBusy: deleteInProgress === formatId,
                        onClick: () => openConfirmDialog('file', formatId),
                        variant: "link",
                        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Delete Permanently'),
                        isDestructive: true
                      }), (formatData.encoding_now || formatData.status === 'failed') && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(EncodeProgress, {
                        format: formatId
                      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.__experimentalDivider, {})]
                    }, formatId);
                  })
                })]
              }, codec.id);
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.__experimentalConfirmDialog, {
            isOpen: isConfirmOpen,
            onConfirm: handleConfirm,
            onCancel: handleCancel,
            children: confirmDialogMessage()
          })]
        }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.Fragment, {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Spinner, {})
        })
      }), ffmpeg_exists === true && videoFormats && canUploadFiles && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelRow, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
          variant: "secondary",
          onClick: handleEnqueue,
          title: encodeButtonTitle(),
          text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Encode'),
          disabled: isEncodeButtonDisabled
        }), isLoading && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Spinner, {}), encodeMessage && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("span", {
          className: "videopack-encode-message",
          children: encodeMessage
        })]
      })]
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
/* global Image */











const Thumbnails = ({
  setAttributes,
  attributes,
  attachment,
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
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    if (window.mejs && window.mejs.players && poster) {
      // Find the MediaElement.js player within the media modal
      const mejsContainer = document.querySelector('.media-modal .mejs-container, .wp_attachment_holder .mejs-container');
      if (mejsContainer) {
        const mejsId = mejsContainer.id;
        if (mejsId && window.mejs.players[mejsId]) {
          const player = window.mejs.players[mejsId];
          player.setPoster(poster);
        }
      }
    }
  }, [poster]);
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
            resolve(new File([blob], `${thumbBasename}${filenameSuffix}`, {
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

      // Wrap uploadMedia in a new Promise to ensure we wait for the upload to complete.
      const media = await new Promise((resolve, reject) => {
        (0,_wordpress_media_utils__WEBPACK_IMPORTED_MODULE_4__.uploadMedia)({
          filesList: [file],
          allowedTypes: ['image/png'],
          title: `${thumbBasename}${titleSuffix}`,
          onFileChange: mediaData => {
            if (mediaData[0].id) {
              resolve(mediaData[0]);
            }
          },
          onError: error => reject(error)
        });
      });
      if (media) {
        if (wp.media && wp.media.featuredImage && wp.media.featuredImage.set) {
          wp.media.featuredImage.set(media.id);
        }
        setPosterData(media.url, media.id);
      } else {
        // Handle case where upload succeeds but returns no media data
        throw new Error((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Media upload failed to return data.'));
      }
      setIsSaving(false);
    } catch (error) {
      console.error((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Upload error:'), error);
      setIsSaving(false);
      // createErrorNotice( error, { type: 'snackbar' } ); // Assuming createErrorNotice is available if needed
    }
  };
  const setPosterData = async (new_poster, new_poster_id) => {
    try {
      const metaData = {};
      if (new_poster) {
        // Only include if new_poster has a value
        metaData['_kgflashmediaplayer-poster'] = new_poster;
        metaData['_kgflashmediaplayer-poster-id'] = Number(new_poster_id);
      }
      await attachment?.edit({
        featured_media: new_poster_id ? Number(new_poster_id) : null,
        meta: metaData
      });
      await attachment?.save();
      setAttributes({
        poster: new_poster,
        poster_id: new_poster_id
      });
      setThumbChoices([]);
    } catch (error) {
      console.error('Error updating attachment:', error);
    }
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
          className: 'videopack-thumbnail spinner-container',
          onClick: event => {
            handleSaveThumbnail(event, thumb, index);
          },
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("img", {
            src: thumb.src,
            alt: `Thumbnail ${index + 1}`,
            title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Save and set thumbnail')
          }), isSaving && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Spinner, {})]
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
          className: `videopack-thumb-video-panel spinner-container${isSaving ? ' saving' : ''}`,
          tabIndex: 0,
          ref: thumbVideoPanel,
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("video", {
            src: src,
            ref: videoRef,
            muted: true,
            preload: "metadata",
            onClick: togglePlayback
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
            className: "videopack-thumb-video-controls",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
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
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
            variant: "secondary",
            onClick: handleUseThisFrame,
            className: "videopack-use-this-frame",
            disabled: isSaving,
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Use this frame')
          }), isSaving && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Spinner, {})]
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

/***/ "./src/additional-formats.scss":
/*!*************************************!*\
  !*** ./src/additional-formats.scss ***!
  \*************************************/
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
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_core_data__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/core-data */ "@wordpress/core-data");
/* harmony import */ var _wordpress_core_data__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_core_data__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _Thumbnails_Thumbnails__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../Thumbnails/Thumbnails */ "./src/Thumbnails/Thumbnails.js");
/* harmony import */ var _AdditionalFormats__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../AdditionalFormats */ "./src/AdditionalFormats.js");
/* harmony import */ var _attachment_details_scss__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./attachment-details.scss */ "./src/attachment-details/attachment-details.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__);








const AttachmentDetails = ({
  attachmentId
}) => {
  const [options, setOptions] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)();
  const [attributes, setAttributes] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)();
  const attachment = (0,_wordpress_core_data__WEBPACK_IMPORTED_MODULE_2__.useEntityRecord)('postType', 'attachment', !isNaN(attachmentId) ? attachmentId : null);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    console.log('Attachment component mounted.');
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: '/videopack/v1/settings',
      method: 'GET'
    }).then(response => {
      setOptions(response);
    });
    return () => console.log('Component unmounted!');
  }, []);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    if (attachment.hasResolved && !attributes) {
      const combinedAttributes = {
        id: attachmentId,
        total_thumbnails: attachment.record?.meta?.['_videopack-meta']?.total_thumbnails || options?.total_thumbnails,
        src: attachment.record?.source_url,
        poster: attachment.record?.meta?.['_kgflashmediaplayer-poster'] || attachment.record?.media_details?.sizes?.full?.source_url || attachment.record?.image?.src,
        poster_id: attachment.record?.meta?.['_kgflashmediaplayer-poster-id']
      };
      setAttributes(combinedAttributes);
    }
  }, [options, attachment, attributes]);
  if (attributes && attachment.hasResolved && options) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
      className: "videopack-attachment-details",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_Thumbnails_Thumbnails__WEBPACK_IMPORTED_MODULE_4__["default"], {
        setAttributes: setAttributes,
        attributes: attributes,
        attachment: attachment,
        options: options
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_AdditionalFormats__WEBPACK_IMPORTED_MODULE_5__["default"], {
        attributes: attributes,
        options: options
      })]
    });
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Spinner, {});
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (AttachmentDetails);

/***/ }),

/***/ "./src/attachment-details/attachment-details.scss":
/*!********************************************************!*\
  !*** ./src/attachment-details/attachment-details.scss ***!
  \********************************************************/
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



// render on edit media screen

const editMediaContainer = document.getElementById('videopack-attachment-details-root');
if (editMediaContainer) {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('post');

  // Create a new React root and render the component.
  const videopackReactRoot = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createRoot)(editMediaContainer);
  videopackReactRoot.render(/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_AttachmentDetails__WEBPACK_IMPORTED_MODULE_1__["default"], {
    attachmentId: postId
  }));
}

// Ensure wp.media is loaded.
if (typeof wp === 'undefined' || !wp.media || !wp.media.view || !wp.media.view.Attachment.Details) {
  console.error('Videopack: wp.media.view.Attachment.Details is not available.');
} else {
  console.log('Videopack: Extending wp.media.view.Attachment.Details.');
  const originalAttachmentDetails = wp.media.view.Attachment.Details;
  const extendedAttachmentDetails = originalAttachmentDetails.extend({
    // A reference to the React root instance.
    videopackReactRoot: null,
    initialize() {
      // Call the original initialize method.
      originalAttachmentDetails.prototype.initialize.apply(this, arguments);
      // Listen for the 'ready' event, which is fired after the view is rendered.
      this.on('ready', this.renderVideopackComponent, this);
    },
    renderVideopackComponent() {
      console.log('Videopack: Attachment details ready. Rendering React component.');

      // Unmount any existing React component before re-rendering.
      if (this.videopackReactRoot) {
        console.log('Videopack: Unmounting existing React component.');
        this.videopackReactRoot.unmount();
        this.videopackReactRoot = null;
      }

      // Check if the attachment is a video.
      const isVideo = this.model.attributes.type === 'video';
      const isAnimatedGif = this.model.attributes.subtype === 'gif' && this.model.attributes.meta?.['_kgvid-meta']?.animated;
      if (isVideo || isAnimatedGif) {
        console.log('Videopack: Video or animated GIF detected. Mounting React component.');

        // Find the .settings section in the attachment details sidebar.
        // Note: We use this.$el to scope the find to this view's element.
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
          attachmentId: this.model.attributes.id
        }));
        console.log('Videopack: React component mounted successfully.');
      } else {
        console.log('Videopack: Attachment is not a video, skipping React component.');
      }
    },
    // We also need to override remove to clean up our React root.
    remove() {
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

  // Replace the original view with our extended one.
  wp.media.view.Attachment.Details = extendedAttachmentDetails;
}
})();

/******/ })()
;
//# sourceMappingURL=attachment-details.js.map