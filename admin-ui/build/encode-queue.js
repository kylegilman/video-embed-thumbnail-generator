/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
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
/************************************************************************/

;// external ["wp","i18n"]
const external_wp_i18n_namespaceObject = window["wp"]["i18n"];
;// external ["wp","element"]
const external_wp_element_namespaceObject = window["wp"]["element"];
;// external ["wp","components"]
const external_wp_components_namespaceObject = window["wp"]["components"];
;// external "ReactJSXRuntime"
const external_ReactJSXRuntime_namespaceObject = window["ReactJSXRuntime"];
;// ./src/components/AdditionalFormats/EncodeProgress.js



const EncodeProgress = ({
  formatData,
  onCancelJob,
  deleteInProgress
}) => {
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
  if (formatData?.encoding_now && formatData?.progress) {
    const percent = Math.round(formatData.progress.percent);
    const percentText = (0,external_wp_i18n_namespaceObject.sprintf)('%d%%', percent);
    return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
      className: "videopack-encode-progress",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
        className: "videopack-meter",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
          className: "videopack-meter-bar",
          style: {
            width: percentText
          },
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
            className: "videopack-meter-text",
            children: percentText
          })
        })
      }), formatData.job_id && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
        onClick: onCancelJob,
        variant: "secondary",
        isDestructive: true,
        size: "small",
        isBusy: deleteInProgress === formatData.job_id,
        children: (0,external_wp_i18n_namespaceObject.__)('Cancel')
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
        className: "videopack-encode-progress-small-text",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
          children: (0,external_wp_i18n_namespaceObject.__)('Elapsed:') + ' ' + convertToTimecode(formatData.progress.elapsed)
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
          children: (0,external_wp_i18n_namespaceObject.__)('Remaining:') + ' ' + convertToTimecode(formatData.progress.remaining)
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
          children: (0,external_wp_i18n_namespaceObject.__)('fps:') + ' ' + formatData.progress.fps
        })]
      })]
    });
  }
  if (formatData?.status === 'failed' && formatData?.error_message) {
    return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
      className: "videopack-encode-error",
      children: [(0,external_wp_i18n_namespaceObject.sprintf)((0,external_wp_i18n_namespaceObject.__)('Error: %s'), formatData.error_message), formatData.job_id && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
        onClick: () => onCancelJob(formatData.job_id),
        variant: "link",
        text: (0,external_wp_i18n_namespaceObject.__)('Delete Job'),
        isDestructive: true,
        isBusy: deleteInProgress === formatData.job_id
      })]
    });
  }
  return null;
};
/* harmony default export */ const AdditionalFormats_EncodeProgress = (EncodeProgress);
;// external ["wp","apiFetch"]
const external_wp_apiFetch_namespaceObject = window["wp"]["apiFetch"];
var external_wp_apiFetch_default = /*#__PURE__*/__webpack_require__.n(external_wp_apiFetch_namespaceObject);
;// external ["wp","url"]
const external_wp_url_namespaceObject = window["wp"]["url"];
;// ./src/utils/utils.js


const getSettings = async () => {
  try {
    return await apiFetch({
      path: '/videopack/v1/settings',
      method: 'GET'
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
};
const getQueue = async () => {
  try {
    const response = await external_wp_apiFetch_default()({
      path: '/videopack/v1/queue'
    });
    return response || [];
  } catch (error) {
    console.error('Error fetching queue:', error);
    throw error;
  }
};
const toggleQueue = async action => {
  try {
    return await external_wp_apiFetch_default()({
      path: '/videopack/v1/queue/control',
      method: 'POST',
      data: {
        action
      }
    });
  } catch (error) {
    console.error('Error toggling queue:', error);
    throw error;
  }
};
const clearQueue = async type => {
  try {
    return await external_wp_apiFetch_default()({
      path: '/videopack/v1/queue/clear',
      method: 'DELETE',
      data: {
        type
      }
    });
  } catch (error) {
    console.error('Error clearing queue:', error);
    throw error;
  }
};
const deleteJob = async jobId => {
  try {
    return await external_wp_apiFetch_default()({
      path: `/videopack/v1/queue/${jobId}`,
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
};
const removeJob = async jobId => {
  try {
    return await external_wp_apiFetch_default()({
      path: `/videopack/v1/queue/remove/${jobId}`,
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error removing job:', error);
    throw error;
  }
};
const getVideoFormats = async attachmentId => {
  try {
    return await apiFetch({
      path: `/videopack/v1/formats/${attachmentId}`
    });
  } catch (error) {
    console.error('Error fetching video formats:', error);
    throw error;
  }
};
const enqueueJob = async (attachmentId, src, formats) => {
  try {
    return await apiFetch({
      path: `/videopack/v1/queue/${attachmentId}`,
      method: 'POST',
      data: {
        url: src,
        formats
      }
    });
  } catch (error) {
    console.error('Error enqueuing job:', error);
    throw error;
  }
};
const assignFormat = async (mediaId, formatId, parentId) => {
  try {
    return await apiFetch({
      path: `/wp/v2/media/${mediaId}`,
      method: 'POST',
      data: {
        meta: {
          '_kgflashmediaplayer-format': formatId,
          '_kgflashmediaplayer-parent': parentId
        }
      }
    });
  } catch (error) {
    console.error('Error assigning format:', error);
    throw error;
  }
};
const deleteFile = async attachmentId => {
  try {
    return await apiFetch({
      path: `/wp/v2/media/${attachmentId}?force=true`,
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};
const uploadThumbnail = async formData => {
  try {
    return await apiFetch({
      path: '/videopack/v1/thumbs/upload',
      method: 'POST',
      body: formData
    });
  } catch (error) {
    console.error('Error uploading thumbnail:', error);
    throw error;
  }
};
const saveAllThumbnails = async (attachment_id, thumb_urls) => {
  try {
    return await apiFetch({
      path: '/videopack/v1/thumbs/save_all',
      method: 'POST',
      data: {
        attachment_id,
        thumb_urls
      }
    });
  } catch (error) {
    console.error('Error saving all thumbnails:', error);
    throw error;
  }
};
const getVideoGallery = async args => {
  try {
    return await apiFetch({
      path: addQueryArgs('/videopack/v1/video_gallery', args),
      method: 'GET'
    });
  } catch (error) {
    console.error('Error fetching video gallery:', error);
    throw error;
  }
};
const getUsersWithCapability = async capability => {
  try {
    return await apiFetch({
      path: `/wp/v2/users?capability=${capability}`,
      method: 'GET'
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};
const getFreemiusPage = async page => {
  try {
    return await apiFetch({
      path: `/videopack/v1/freemius/${page}`
    });
  } catch (error) {
    console.error(`Error fetching Freemius page '${page}':`, error);
    throw error;
  }
};
const getRecentVideos = async posts => {
  try {
    return await apiFetch({
      path: `/videopack/v1/recent_videos?posts=${posts}`,
      method: 'GET'
    });
  } catch (error) {
    console.error('Error fetching recent videos:', error);
    throw error;
  }
};
const testFFmpegCommand = async (codec, resolution, rotate) => {
  try {
    return await apiFetch({
      path: `/videopack/v1/ffmpeg-test/?codec=${codec}&resolution=${resolution}&rotate=${rotate}`
    });
  } catch (error) {
    console.error('Error testing FFmpeg command:', error);
    throw error;
  }
};
const getWPSettings = async () => {
  try {
    return await apiFetch({
      path: '/wp/v2/settings'
    });
  } catch (error) {
    console.error('Error fetching WP settings:', error);
    throw error;
  }
};
const saveWPSettings = async newSettings => {
  try {
    return await apiFetch({
      path: '/wp/v2/settings',
      method: 'POST',
      data: {
        videopack_options: newSettings
      }
    });
  } catch (error) {
    console.error('Error saving WP settings:', error);
    throw error;
  }
};
const resetVideopackSettings = async () => {
  try {
    return await apiFetch({
      path: '/videopack/v1/defaults'
    });
  } catch (error) {
    console.error('Error resetting Videopack settings:', error);
    throw error;
  }
};
const setPosterImage = async (attachment_id, thumb_url) => {
  try {
    return await apiFetch({
      path: '/videopack/v1/thumbs',
      method: 'PUT',
      data: {
        attachment_id,
        thumburl: thumb_url
      }
    });
  } catch (error) {
    console.error('Error setting poster image:', error);
    throw error;
  }
};
const generateThumbnail = async (url, total_thumbnails, thumbnail_index, attachment_id, generate_button) => {
  try {
    const path = addQueryArgs('/videopack/v1/thumbs', {
      url,
      total_thumbnails,
      thumbnail_index,
      attachment_id,
      generate_button
    });
    return await apiFetch({
      path
    });
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw error;
  }
};
;// ./src/features/encode-queue/encode-queue.js
/* global videopack */








const JobRow = (0,external_wp_element_namespaceObject.memo)(({
  job,
  index,
  isMultisite,
  openConfirmDialog,
  deletingJobId
}) => {
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("tr", {
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("td", {
      children: index + 1
    }), isMultisite && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("td", {
      children: job.blog_name
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("td", {
      children: job.user_name || (0,external_wp_i18n_namespaceObject.__)('N/A')
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("td", {
      children: job.poster_url ? /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("img", {
        src: job.poster_url,
        alt: job.video_title,
        className: "videopack-queue-attachment-poster"
      }) : /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Icon, {
        icon: "format-video"
      })
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("td", {
      children: job.attachment_link ? /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("a", {
        href: job.attachment_link,
        children: job.video_title
      }) : job.video_title
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("td", {
      children: job.format_name
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("td", {
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
        children: job.status_l10n
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(AdditionalFormats_EncodeProgress, {
        formatData: {
          ...job,
          encoding_now: job.status === 'encoding',
          job_id: job.id
        },
        onCancelJob: () => openConfirmDialog('delete', {
          jobId: job.id
        }),
        deleteInProgress: deletingJobId
      })]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("td", {
      children: job.status !== 'encoding' && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
        variant: "tertiary",
        isDestructive: true,
        onClick: () => openConfirmDialog('remove', {
          jobId: job.id
        }),
        isBusy: deletingJobId === job.id,
        children: (0,external_wp_i18n_namespaceObject.__)('Clear')
      })
    })]
  }, job.id);
});
const EncodeQueue = () => {
  const [queueData, setQueueData] = (0,external_wp_element_namespaceObject.useState)([]);
  const [isLoading, setIsLoading] = (0,external_wp_element_namespaceObject.useState)(true);
  const [isQueuePaused, setIsQueuePaused] = (0,external_wp_element_namespaceObject.useState)(videopack.encodeQueueData.initialQueueState === 'pause');
  const [message, setMessage] = (0,external_wp_element_namespaceObject.useState)(null);
  const [isClearing, setIsClearing] = (0,external_wp_element_namespaceObject.useState)(false);
  const [isTogglingQueue, setIsTogglingQueue] = (0,external_wp_element_namespaceObject.useState)(false);
  const [isConfirmOpen, setIsConfirmOpen] = (0,external_wp_element_namespaceObject.useState)(false);
  const [itemToActOn, setItemToActOn] = (0,external_wp_element_namespaceObject.useState)(null); // { action: 'clear'/'delete'/'remove', type: 'completed'/'all', jobId: ? }
  const [deletingJobId, setDeletingJobId] = (0,external_wp_element_namespaceObject.useState)(null);
  const fetchQueue = async () => {
    try {
      const newData = await getQueue();
      setQueueData(prevData => {
        if (JSON.stringify(prevData) !== JSON.stringify(newData)) {
          return newData;
        }
        return prevData;
      });
    } catch (error) {
      console.error('Error fetching queue:', error);
      setMessage({
        type: 'error',
        text: (0,external_wp_i18n_namespaceObject.sprintf)(/* translators: %s is an error message */
        (0,external_wp_i18n_namespaceObject.__)('Failed to load queue: %s'), error.message || error.code)
      });
    } finally {
      setIsLoading(false);
    }
  };
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, []);
  const handleToggleQueue = async () => {
    setIsTogglingQueue(true);
    const action = isQueuePaused ? 'play' : 'pause';
    try {
      const response = await toggleQueue(action);
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
        text: (0,external_wp_i18n_namespaceObject.sprintf)(/* translators: %s is an error message */
        (0,external_wp_i18n_namespaceObject.__)('Failed to toggle queue: %s'), error.message || error.code)
      });
    } finally {
      setIsTogglingQueue(false);
    }
  };
  const openConfirmDialog = (action, details) => {
    setItemToActOn({
      action,
      ...details
    });
    setIsConfirmOpen(true);
  };
  const handleConfirm = () => {
    if (!itemToActOn) {
      return;
    }
    if (itemToActOn.action === 'clear') {
      handleClearQueue(itemToActOn.type);
    } else if (itemToActOn.action === 'delete') {
      handleDeleteJob(itemToActOn.jobId);
    } else if (itemToActOn.action === 'remove') {
      handleRemoveJob(itemToActOn.jobId);
    }
    setIsConfirmOpen(false);
    setItemToActOn(null);
  };
  const handleClearQueue = async type => {
    setIsClearing(true);
    try {
      const response = await clearQueue(type);
      setMessage({
        type: 'success',
        text: response.message
      });
      fetchQueue(); // Refresh queue data
    } catch (error) {
      console.error('Error clearing queue:', error);
      setMessage({
        type: 'error',
        text: (0,external_wp_i18n_namespaceObject.sprintf)(/* translators: %s is an error message */
        (0,external_wp_i18n_namespaceObject.__)('Failed to clear queue: %s'), error.message || error.code)
      });
    } finally {
      setIsClearing(false);
    }
  };
  const handleDeleteJob = async jobId => {
    setDeletingJobId(jobId);
    try {
      await deleteJob(jobId);
      setMessage({
        type: 'success',
        text: (0,external_wp_i18n_namespaceObject.__)('Job deleted.')
      });
      fetchQueue();
    } catch (error) {
      console.error('Error deleting job:', error);
      setMessage({
        type: 'error',
        text: (0,external_wp_i18n_namespaceObject.sprintf)((0,external_wp_i18n_namespaceObject.__)('Error deleting job: %s'), error.message)
      });
    } finally {
      setDeletingJobId(null);
    }
  };
  const handleRemoveJob = async jobId => {
    setDeletingJobId(jobId);
    try {
      await removeJob(jobId);
      setMessage({
        type: 'success',
        text: (0,external_wp_i18n_namespaceObject.__)('Job removed from queue.')
      });
      fetchQueue();
    } catch (error) {
      console.error('Error removing job:', error);
      setMessage({
        type: 'error',
        text: (0,external_wp_i18n_namespaceObject.sprintf)((0,external_wp_i18n_namespaceObject.__)('Error removing job: %s'), error.message)
      });
    } finally {
      setDeletingJobId(null);
    }
  };
  const isMultisite = videopack.isMultisite;
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
    className: "wrap videopack-encode-queue",
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("h1", {
      children: (0,external_wp_i18n_namespaceObject.__)('Videopack Encode Queue')
    }), message && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Notice, {
      status: message.type,
      onRemove: () => setMessage(null),
      children: message.text
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalConfirmDialog, {
      isOpen: isConfirmOpen,
      onConfirm: handleConfirm,
      onCancel: () => setIsConfirmOpen(false),
      children: itemToActOn?.action === 'clear' ? (0,external_wp_i18n_namespaceObject.sprintf)((0,external_wp_i18n_namespaceObject.__)('Are you sure you want to clear %s jobs?'), itemToActOn.type) : (0,external_wp_i18n_namespaceObject.__)('Are you sure you want to remove this job?')
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.PanelBody, {
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
        className: "videopack-queue-controls",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.Button, {
          variant: "primary",
          onClick: handleToggleQueue,
          isBusy: isTogglingQueue,
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Icon, {
            icon: isQueuePaused ? 'controls-play' : 'controls-pause'
          }), isQueuePaused ? (0,external_wp_i18n_namespaceObject.__)('Play Queue') : (0,external_wp_i18n_namespaceObject.__)('Pause Queue')]
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          variant: "secondary",
          onClick: () => openConfirmDialog('clear', {
            type: 'completed'
          }),
          isBusy: isClearing,
          children: (0,external_wp_i18n_namespaceObject.__)('Clear Completed')
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          variant: "tertiary",
          isDestructive: true,
          onClick: () => openConfirmDialog('clear', {
            type: 'all'
          }),
          isBusy: isClearing,
          children: (0,external_wp_i18n_namespaceObject.__)('Clear All')
        }), isLoading && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Spinner, {})]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalDivider, {}), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("table", {
        className: "wp-list-table widefat fixed striped table-view-list videopack-queue-table",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("thead", {
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("tr", {
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("th", {
              children: (0,external_wp_i18n_namespaceObject.__)('Order')
            }), isMultisite && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("th", {
              children: (0,external_wp_i18n_namespaceObject.__)('Site')
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("th", {
              children: (0,external_wp_i18n_namespaceObject.__)('User')
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("th", {
              children: (0,external_wp_i18n_namespaceObject.__)('Thumbnail')
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("th", {
              children: (0,external_wp_i18n_namespaceObject.__)('File')
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("th", {
              children: (0,external_wp_i18n_namespaceObject.__)('Format')
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("th", {
              children: (0,external_wp_i18n_namespaceObject.__)('Status')
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("th", {
              children: (0,external_wp_i18n_namespaceObject.__)('Actions')
            })]
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("tbody", {
          children: [isLoading && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("tr", {
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("td", {
              colSpan: isMultisite ? 8 : 7,
              children: (0,external_wp_i18n_namespaceObject.__)('Loading queue…')
            })
          }), !isLoading && queueData.length === 0 && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("tr", {
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("td", {
              colSpan: isMultisite ? 8 : 7,
              children: (0,external_wp_i18n_namespaceObject.__)('The encode queue is empty.')
            })
          }), !isLoading && queueData.map((job, index) => /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(JobRow, {
            job: job,
            index: index,
            isMultisite: isMultisite,
            openConfirmDialog: openConfirmDialog,
            deletingJobId: deletingJobId
          }, job.id))]
        })]
      })]
    })]
  });
};

// Render the component
document.addEventListener('DOMContentLoaded', function () {
  const rootElement = document.getElementById('videopack-queue-root');
  if (rootElement) {
    const root = (0,external_wp_element_namespaceObject.createRoot)(rootElement);
    root.render(/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(EncodeQueue, {}));
  }
});
/******/ })()
;