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

;// external ["wp","element"]
const external_wp_element_namespaceObject = window["wp"]["element"];
;// external ["wp","components"]
const external_wp_components_namespaceObject = window["wp"]["components"];
;// external ["wp","coreData"]
const external_wp_coreData_namespaceObject = window["wp"]["coreData"];
;// external ["wp","mediaUtils"]
const external_wp_mediaUtils_namespaceObject = window["wp"]["mediaUtils"];
;// external ["wp","i18n"]
const external_wp_i18n_namespaceObject = window["wp"]["i18n"];
;// external ["wp","url"]
const external_wp_url_namespaceObject = window["wp"]["url"];
;// external ["wp","apiFetch"]
const external_wp_apiFetch_namespaceObject = window["wp"]["apiFetch"];
var external_wp_apiFetch_default = /*#__PURE__*/__webpack_require__.n(external_wp_apiFetch_namespaceObject);
;// ./src/utils/utils.js


const getSettings = async () => {
  try {
    return await external_wp_apiFetch_default()({
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
    const response = await apiFetch({
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
    return await apiFetch({
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
    return await apiFetch({
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
    return await apiFetch({
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
    return await external_wp_apiFetch_default()({
      path: `/videopack/v1/formats/${attachmentId}`
    });
  } catch (error) {
    console.error('Error fetching video formats:', error);
    throw error;
  }
};
const enqueueJob = async (attachmentId, src, formats) => {
  try {
    return await external_wp_apiFetch_default()({
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
    return await external_wp_apiFetch_default()({
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
    return await external_wp_apiFetch_default()({
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
    return await external_wp_apiFetch_default()({
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
    return await external_wp_apiFetch_default()({
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
    return await external_wp_apiFetch_default()({
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
    const path = (0,external_wp_url_namespaceObject.addQueryArgs)('/videopack/v1/thumbs', {
      url,
      total_thumbnails,
      thumbnail_index,
      attachment_id,
      generate_button
    });
    return await external_wp_apiFetch_default()({
      path
    });
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw error;
  }
};
;// external ["wp","primitives"]
const external_wp_primitives_namespaceObject = window["wp"]["primitives"];
;// external "ReactJSXRuntime"
const external_ReactJSXRuntime_namespaceObject = window["ReactJSXRuntime"];
;// ./node_modules/@wordpress/icons/build-module/library/chevron-up.js
/**
 * WordPress dependencies
 */


const chevronUp = /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg",
  children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M6.5 12.4L12 8l5.5 4.4-.9 1.2L12 10l-4.5 3.6-1-1.2z"
  })
});
/* harmony default export */ const chevron_up = (chevronUp);
//# sourceMappingURL=chevron-up.js.map
;// ./node_modules/@wordpress/icons/build-module/library/chevron-down.js
/**
 * WordPress dependencies
 */


const chevronDown = /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg",
  children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M17.5 11.6L12 16l-5.5-4.4.9-1.2L12 14l4.5-3.6 1 1.2z"
  })
});
/* harmony default export */ const chevron_down = (chevronDown);
//# sourceMappingURL=chevron-down.js.map
;// ./src/components/Thumbnails/Thumbnails.js
/* global Image */










const Thumbnails = ({
  setAttributes,
  attributes,
  videoData,
  // Changed from attachment
  options = {}
}) => {
  const {
    id,
    src,
    poster,
    poster_id,
    isExternal
  } = attributes;
  const total_thumbnails = attributes.total_thumbnails || videoData?.total_thumbnails || options.total_thumbnails;
  const thumbVideoPanel = (0,external_wp_element_namespaceObject.useRef)();
  const videoRef = (0,external_wp_element_namespaceObject.useRef)();
  const currentThumb = (0,external_wp_element_namespaceObject.useRef)();
  const posterImageButton = (0,external_wp_element_namespaceObject.useRef)();
  const [isPlaying, setIsPlaying] = (0,external_wp_element_namespaceObject.useState)(false);
  const [isOpened, setIsOpened] = (0,external_wp_element_namespaceObject.useState)(false);
  const [currentTime, setCurrentTime] = (0,external_wp_element_namespaceObject.useState)(false);
  const [thumbChoices, setThumbChoices] = (0,external_wp_element_namespaceObject.useState)([]);
  const [isSaving, setIsSaving] = (0,external_wp_element_namespaceObject.useState)(false);
  const VIDEO_POSTER_ALLOWED_MEDIA_TYPES = ['image'];
  (0,external_wp_element_namespaceObject.useEffect)(() => {
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
      ...attributes,
      poster: image.url,
      poster_id: Number(image.id)
    });
  }
  function onRemovePoster() {
    setAttributes({
      ...attributes,
      poster: undefined
    });

    // Move focus back to the Media Upload button.
    posterImageButton.current.focus();
  }
  const handleGenerate = async (type = 'generate') => {
    setIsSaving(true);
    const ffmpegExists = window.videopack.settings.ffmpeg_exists;
    const browserThumbnailsEnabled = window.videopack.settings.browser_thumbnails;
    if (!browserThumbnailsEnabled && ffmpegExists) {
      // Browser thumbnails explicitly disabled, use FFmpeg directly
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
      setIsSaving(false);
    } else {
      // Attempt browser-based generation
      generateThumbCanvases(type);
    }
  };
  const generateThumbCanvases = (0,external_wp_element_namespaceObject.useCallback)(async type => {
    const thumbsInt = Number(total_thumbnails);
    const newThumbCanvases = [];
    const ffmpegExists = window.videopack.settings.ffmpeg_exists;
    const timePoints = [...Array(thumbsInt)].map((_, i) => {
      let movieoffset = (i + 1) / (thumbsInt + 1) * videoRef.current.duration;
      if (type === 'random') {
        const randomOffset = Math.floor(Math.random() * (videoRef.current.duration / thumbsInt));
        movieoffset = Math.max(movieoffset - randomOffset, 0);
      }
      return movieoffset;
    });
    const processNextThumbnail = async index => {
      if (index >= thumbsInt) {
        videoRef.current.removeEventListener('timeupdate', timeupdateListener);
        setIsSaving(false);
        return;
      }
      videoRef.current.currentTime = timePoints[index];
    };
    const timeupdateListener = async () => {
      let thumb;
      try {
        const canvas = await drawCanvasThumb();
        thumb = {
          src: canvas.toDataURL(),
          type: 'canvas',
          canvasObject: canvas
        };
        newThumbCanvases.push(thumb);
        setThumbChoices([...newThumbCanvases]);
        processNextThumbnail(newThumbCanvases.length);
      } catch (error) {
        console.error('Error generating canvas thumbnail:', error);
        if (ffmpegExists) {
          console.warn('Falling back to FFmpeg for thumbnail generation.');
          try {
            const response = await generateThumb(newThumbCanvases.length + 1, type);
            thumb = {
              src: response.real_thumb_url,
              type: 'ffmpeg'
            };
            newThumbCanvases.push(thumb);
            setThumbChoices([...newThumbCanvases]);
            processNextThumbnail(newThumbCanvases.length);
          } catch (ffmpegError) {
            console.error('FFmpeg fallback also failed:', ffmpegError);
            // Display a user-friendly error message if both methods fail
            // For now, just log and stop
            videoRef.current.removeEventListener('timeupdate', timeupdateListener);
            setIsSaving(false);
          }
        } else {
          console.error('Browser thumbnail generation failed and FFmpeg is not available.');
          // Display a user-friendly error message
          videoRef.current.removeEventListener('timeupdate', timeupdateListener);
          setIsSaving(false);
        }
      }
    };
    videoRef.current.addEventListener('timeupdate', timeupdateListener);
    processNextThumbnail(0); // Start the process
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
  (0,external_wp_element_namespaceObject.useEffect)(() => {
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
  const handleSaveThumbnail = (event, thumb) => {
    event.currentTarget.classList.add('saving');
    setIsSaving(true);
    if (thumb.type === 'ffmpeg') {
      setImgAsPoster(thumb.src);
    } else {
      setCanvasAsPoster(thumb.canvasObject);
    }
  };
  const handleSaveAllThumbnails = async () => {
    setIsSaving(true); // Show spinner for the whole operation
    const firstThumbType = thumbChoices[0]?.type; // Assuming all generated thumbs are of the same type

    if (firstThumbType === 'canvas') {
      const postName = (0,external_wp_url_namespaceObject.getFilename)(src);
      const uploadPromises = thumbChoices.map(thumb => {
        return new Promise((resolve, reject) => {
          thumb.canvasObject.toBlob(async blob => {
            try {
              const formData = new FormData();
              formData.append('file', blob, 'thumbnail.jpg');
              formData.append('attachment_id', id);
              formData.append('post_name', postName);

              // Don't need the response for "save all"
              await uploadThumbnail(formData);
              resolve();
            } catch (error) {
              reject(error);
            }
          }, 'image/jpeg');
        });
      });
      try {
        await Promise.all(uploadPromises);
      } catch (error) {
        console.error('Error saving all canvas thumbnails:', error);
      }
      setThumbChoices([]);
    } else if (firstThumbType === 'ffmpeg') {
      // For FFmpeg thumbnails, send their temporary URLs to the server to be saved
      const thumbUrls = thumbChoices.map(thumb => thumb.src);
      try {
        await saveAllThumbnails(id, thumbUrls);
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
              reject(new Error((0,external_wp_i18n_namespaceObject.__)('Invalid horizontal alignment provided')));
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
              reject(new Error((0,external_wp_i18n_namespaceObject.__)('Invalid vertical alignment provided')));
              return;
          }
          ctx.drawImage(watermarkImage, xPos, yPos, watermarkWidth, watermarkHeight);
          resolve(canvas);
        };
        watermarkImage.onerror = () => {
          reject(new Error((0,external_wp_i18n_namespaceObject.__)('Failed to load watermark image')));
        };
      } catch (error) {
        reject(error);
      }
    });
  }
  const setCanvasAsPoster = async canvasObject => {
    setIsSaving(true);
    try {
      const blob = await new Promise(resolve => canvasObject.toBlob(resolve, 'image/jpeg'));
      const formData = new FormData();
      formData.append('file', blob, 'thumbnail.jpg');
      formData.append('attachment_id', id);
      const postName = (0,external_wp_url_namespaceObject.getFilename)(src);
      formData.append('post_name', postName);
      const response = await uploadThumbnail(formData);
      setPosterData(response.thumb_url, response.thumb_id);
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
    } finally {
      setIsSaving(false);
    }
  };
  const setPosterData = async (new_poster, new_poster_id) => {
    try {
      const metaData = {};
      if (new_poster) {
        // Only include if new_poster has a value
        metaData['_kgflashmediaplayer-poster'] = new_poster;
        metaData['_kgflashmediaplayer-poster-id'] = Number(new_poster_id);
        metaData['_videopack-meta'] = {
          ...attachment?.meta?.['_videopack-meta'],
          poster: new_poster
        };
      }
      await attachment?.edit({
        featured_media: new_poster_id ? Number(new_poster_id) : null,
        meta: metaData
      });
      await attachment?.save();

      // Refresh the media library grid to show the updated thumbnail.
      if (wp.media && wp.media.frame) {
        if (wp.media.frame.content.get() && wp.media.frame.content.get().collection) {
          const collection = wp.media.frame.content.get().collection;
          collection.props.set({
            ignore: new Date().getTime()
          });
        } else if (wp.media.frame.library) {
          // Fallback for different states of the media modal.
          wp.media.frame.library.props.set({
            ignore: new Date().getTime()
          });
        }
      }
      setAttributes({
        ...attributes,
        poster: new_poster,
        poster_id: new_poster_id
      });
      setThumbChoices([]);
      setIsSaving(false);
    } catch (error) {
      console.error('Error updating attachment:', error);
      setIsSaving(false);
    }
  };
  const setImgAsPoster = async thumb_url => {
    try {
      const response = await setPosterImage(id, thumb_url);
      setPosterData(response.thumb_url, response.thumb_id);
    } catch (error) {
      console.error(error);
    }
  };
  const generateThumb = async (i, type) => {
    try {
      const response = await generateThumbnail(src, total_thumbnails, i, id, type);
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
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
    className: "videopack-thumbnail-generator",
    children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.PanelBody, {
      title: (0,external_wp_i18n_namespaceObject.__)('Thumbnails'),
      children: [poster && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("img", {
        className: "videopack-current-thumbnail",
        src: poster,
        alt: (0,external_wp_i18n_namespaceObject.__)('Current Thumbnail')
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.BaseControl, {
        className: "editor-video-poster-control",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.BaseControl.VisualLabel, {
          children: (0,external_wp_i18n_namespaceObject.__)('Video Thumbnail')
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_mediaUtils_namespaceObject.MediaUpload, {
          title: (0,external_wp_i18n_namespaceObject.__)('Select video thumbnail'),
          onSelect: onSelectPoster,
          allowedTypes: VIDEO_POSTER_ALLOWED_MEDIA_TYPES,
          render: ({
            open
          }) => /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
            variant: "secondary",
            onClick: open,
            ref: posterImageButton,
            children: !poster ? (0,external_wp_i18n_namespaceObject.__)('Select') : (0,external_wp_i18n_namespaceObject.__)('Replace')
          })
        }), !!poster && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          onClick: onRemovePoster,
          variant: "tertiary",
          children: (0,external_wp_i18n_namespaceObject.__)('Remove')
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.TextControl // This is the UI control for total_thumbnails.
      , {
        value: total_thumbnails,
        onChange: value => {
          if (!value) {
            setAttributes({
              ...attributes,
              total_thumbnails: ''
            });
          } else {
            setAttributes({
              ...attributes,
              total_thumbnails: Number(value)
            });
          }
        },
        className: "videopack-total-thumbnails",
        disabled: isSaving
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
        variant: "secondary",
        onClick: () => handleGenerate('generate'),
        className: "videopack-generate",
        disabled: isSaving,
        children: (0,external_wp_i18n_namespaceObject.__)('Generate')
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
        variant: "secondary",
        onClick: () => handleGenerate('random'),
        className: "videopack-generate",
        disabled: isSaving,
        children: (0,external_wp_i18n_namespaceObject.__)('Random')
      }), thumbChoices.length > 0 && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
        variant: "primary",
        onClick: handleSaveAllThumbnails,
        disabled: isSaving,
        children: (0,external_wp_i18n_namespaceObject.__)('Save All')
      }), thumbChoices.length > 0 && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
        className: `videopack-thumbnail-holder${isSaving ? ' disabled' : ''}`,
        children: thumbChoices.map((thumb, index) => /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("button", {
          type: "button",
          className: 'videopack-thumbnail spinner-container',
          onClick: event => {
            handleSaveThumbnail(event, thumb, index);
          },
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("img", {
            src: thumb.src,
            alt: `Thumbnail ${index + 1}`,
            title: (0,external_wp_i18n_namespaceObject.__)('Save and set thumbnail')
          }), isSaving && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Spinner, {})]
        }, index))
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
        className: `components-panel__body videopack-thumb-video ${isOpened ? 'is-opened' : ''}`,
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("h2", {
          className: "components-panel__body-title",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("button", {
            className: "components-button components-panel__body-toggle",
            type: "button",
            onClick: handleToggleVideoPlayer,
            "aria-expanded": isOpened,
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
              "aria-hidden": "true",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Icon, {
                className: "components-panel__arrow",
                icon: isOpened ? chevron_up : chevron_down
              })
            }), (0,external_wp_i18n_namespaceObject.__)('Choose From Video')]
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
          className: `videopack-thumb-video-panel spinner-container${isSaving ? ' saving' : ''}`,
          tabIndex: 0,
          ref: thumbVideoPanel,
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("video", {
            src: src,
            ref: videoRef,
            muted: true,
            preload: "metadata",
            onClick: togglePlayback
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
            className: "videopack-thumb-video-controls",
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
              className: "videopack-play-pause",
              onClick: togglePlayback,
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Dashicon, {
                icon: isPlaying ? 'controls-pause' : 'controls-play'
              })
            }), !isNaN(videoRef.current?.duration) && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.RangeControl, {
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
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
            variant: "secondary",
            onClick: handleUseThisFrame,
            className: "videopack-use-this-frame",
            disabled: isSaving,
            children: (0,external_wp_i18n_namespaceObject.__)('Use this frame')
          }), isSaving && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Spinner, {})]
        })]
      })]
    })
  });
};
/* harmony default export */ const Thumbnails_Thumbnails = (Thumbnails);
;// external ["wp","data"]
const external_wp_data_namespaceObject = window["wp"]["data"];
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
;// ./src/components/AdditionalFormats/EncodeFormatStatus.js





const EncodeFormatStatus = ({
  formatId,
  formatData,
  ffmpegExists,
  onCheckboxChange,
  onSelectFormat,
  onDeleteFile,
  onCancelJob,
  deleteInProgress
}) => {
  if (!formatData) {
    return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Spinner, {});
  }
  const getCheckboxCheckedState = data => {
    return data.checked || data.status === 'queued';
  };
  const getCheckboxDisabledState = data => {
    return data.exists || data.status === 'queued' || data.status === 'encoding' || data.status === 'processing' || data.status === 'completed';
  };
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("li", {
    children: [ffmpegExists ? /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.CheckboxControl, {
      __nextHasNoMarginBottom: true,
      className: "videopack-format",
      label: formatData.label,
      checked: getCheckboxCheckedState(formatData),
      disabled: getCheckboxDisabledState(formatData),
      onChange: event => onCheckboxChange(event, formatId)
    }) : /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
      className: "videopack-format",
      children: formatData.label
    }), formatData.status !== 'not_encoded' && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
      className: "videopack-format-status",
      children: formatData.status_l10n
    }), formatData.status === 'not_encoded' && !formatData.was_picked && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_mediaUtils_namespaceObject.MediaUpload, {
      title: (0,external_wp_i18n_namespaceObject.__)('Choose existing file'),
      onSelect: onSelectFormat(formatId),
      allowedTypes: ['video'],
      render: ({
        open
      }) => /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
        variant: "secondary",
        onClick: open,
        className: "videopack-format-button",
        size: "small",
        children: (0,external_wp_i18n_namespaceObject.__)('Select')
      })
    }), formatData.was_picked && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_mediaUtils_namespaceObject.MediaUpload, {
      title: (0,external_wp_i18n_namespaceObject.sprintf)(/* translators: %s is the label of a video resolution (eg: 720p ) */
      (0,external_wp_i18n_namespaceObject.__)('Replace %s'), formatData.label),
      onSelect: onSelectFormat(formatId),
      allowedTypes: ['video'],
      render: ({
        open
      }) => /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
        variant: "secondary",
        onClick: open,
        className: "videopack-format-button",
        size: "small",
        title: (0,external_wp_i18n_namespaceObject.__)('Replace file'),
        children: (0,external_wp_i18n_namespaceObject.__)('Replace')
      })
    }), formatData.deletable && formatData.id && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
      isBusy: deleteInProgress === formatId,
      onClick: onDeleteFile,
      variant: "link",
      text: (0,external_wp_i18n_namespaceObject.__)('Delete Permanently'),
      isDestructive: true
    }), (formatData.encoding_now || formatData.status === 'failed') && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(AdditionalFormats_EncodeProgress, {
      formatData: formatData,
      onCancelJob: onCancelJob,
      deleteInProgress: deleteInProgress
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalDivider, {})]
  }, formatId);
};
/* harmony default export */ const AdditionalFormats_EncodeFormatStatus = (EncodeFormatStatus);
;// ./src/components/AdditionalFormats/AdditionalFormats.js
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
  const [videoFormats, setVideoFormats] = (0,external_wp_element_namespaceObject.useState)({});
  const [encodeMessage, setEncodeMessage] = (0,external_wp_element_namespaceObject.useState)();
  const [itemToDelete, setItemToDelete] = (0,external_wp_element_namespaceObject.useState)(null); // { type: 'file'/'job', formatId: string, jobId?: int, id?: int, name?: string }
  const [deleteInProgress, setDeleteInProgress] = (0,external_wp_element_namespaceObject.useState)(null); // Stores formatId or jobId being deleted
  const [isConfirmOpen, setIsConfirmOpen] = (0,external_wp_element_namespaceObject.useState)(false);
  const [isLoading, setIsLoading] = (0,external_wp_element_namespaceObject.useState)(false);
  const [isEncoding, setIsEncoding] = (0,external_wp_element_namespaceObject.useState)(false);
  const progressTimerRef = (0,external_wp_element_namespaceObject.useRef)(null);
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
        if (JSON.stringify(currentVideoFormats) !== JSON.stringify(newFormats)) {
          return newFormats;
        }
      } else if (JSON.stringify(currentVideoFormats) !== JSON.stringify(response)) {
        // Fallback for non-object responses
        return response;
      }
      return currentVideoFormats;
    });
  };
  const fetchVideoFormats = async () => {
    if (!id) {
      return;
    } // Don't fetch if there's no ID.
    try {
      const formats = await getVideoFormats(id);
      updateVideoFormats(formats);
    } catch (error) {
      console.error('Error fetching video formats:', error);
    }
  };
  const pollVideoFormats = async () => {
    console.log('update');
    if (src && id) {
      try {
        const formats = await getVideoFormats(id);
        updateVideoFormats(formats);
      } catch (error) {
        console.error('Error polling video formats:', error);
      }
    }
  };
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    fetchVideoFormats();
  }, [id]); // Fetch formats when the attachment ID changes

  const isEmpty = value => {
    if (value === false || value === null || Array.isArray(value) && value.length === 0 || typeof value === 'object' && Object.keys(value).length === 0) {
      return true;
    }
    return false;
  };
  const siteSettings = (0,external_wp_data_namespaceObject.useSelect)(select => {
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
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    setIsEncoding(shouldPoll(videoFormats));
  }, [videoFormats]);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
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
  const handleEnqueue = async () => {
    if (!window.videopack || !window.videopack.settings) {
      return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Spinner, {});
    }
    setIsLoading(true);

    // Get list of format IDs that are checked and available
    const formatsToEncode = Object.entries(videoFormats).filter(([key, value]) => value.checked && value.status !== 'queued' && value.status !== 'processing' && value.status !== 'completed').reduce((acc, [key, value]) => {
      acc[key] = true; // Backend expects an object { format_id: true, ... }
      return acc;
    }, {});
    try {
      const response = await enqueueJob(id, src, formatsToEncode);
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
          return (0,external_wp_i18n_namespaceObject.__)('No formats were added to the queue.');
        }
        const queuePosition = response?.new_queue_position;
        return (0,external_wp_i18n_namespaceObject.sprintf)(/* translators: %1$s is a list of video formats. %2$s is a number */
        (0,external_wp_i18n_namespaceObject.__)('%1$s added to queue in position %2$s.'), queueList, queuePosition);
      };
      setEncodeMessage(queueMessage());
      fetchVideoFormats(); // Re-fetch to update statuses
    } catch (error) {
      console.error(error);
      // Use the detailed error messages from the server if available
      const errorMessage = error?.data?.details ? error.data.details.join(', ') : error.message;
      /* translators: %s is an error message */
      setEncodeMessage((0,external_wp_i18n_namespaceObject.sprintf)((0,external_wp_i18n_namespaceObject.__)('Error: %s'), errorMessage));
      fetchVideoFormats(); // Re-fetch to ensure UI is consistent
    } finally {
      setIsLoading(false);
    }
  };
  const onSelectFormat = formatId => async media => {
    if (!media || !media.id || !formatId) {
      return;
    }
    setIsLoading(true);
    try {
      await assignFormat(media.id, formatId, id);
      setEncodeMessage((0,external_wp_i18n_namespaceObject.__)('Video format assigned successfully.'));
      fetchVideoFormats(); // Refresh the list
    } catch (error) {
      console.error('Error assigning video format:', error);
      setEncodeMessage((0,external_wp_i18n_namespaceObject.sprintf)(/* translators: %s is an error message */
      (0,external_wp_i18n_namespaceObject.__)('Error: %s'), error.message));
    } finally {
      setIsLoading(false);
    }
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
  const handleFileDelete = async formatId => {
    const formatData = videoFormats?.[formatId];
    if (!formatData || !formatData.id) {
      setEncodeMessage((0,external_wp_i18n_namespaceObject.__)('Error: Cannot delete file, missing attachment ID.'));
      console.error('Cannot delete file: Missing id for format', formatId);
      return;
    }
    setDeleteInProgress(formatId); // Mark this formatId as being deleted
    try {
      await deleteFile(formatData.id);
      setEncodeMessage((0,external_wp_i18n_namespaceObject.__)('File deleted successfully.'));
      fetchVideoFormats(); // Re-fetch to get the latest status from backend
    } catch (error) {
      console.error('File delete failed:', error);
      setEncodeMessage(/* translators: %s is an error message */
      (0,external_wp_i18n_namespaceObject.sprintf)((0,external_wp_i18n_namespaceObject.__)('Error deleting file: %s'), error.message));
      fetchVideoFormats(); // Re-fetch to get the latest status
    } finally {
      setDeleteInProgress(null);
    }
  };

  // Deletes/Cancels a queue job
  const handleJobDelete = async jobId => {
    if (!jobId) {
      setEncodeMessage((0,external_wp_i18n_namespaceObject.__)('Error: Cannot delete job, missing job ID.'));
      console.error('Cannot delete job: Missing job ID');
      return;
    }
    setDeleteInProgress(jobId); // Mark this jobId as being deleted
    try {
      await deleteJob(jobId);
      setEncodeMessage((0,external_wp_i18n_namespaceObject.__)('Job cancelled/deleted successfully.'));
      fetchVideoFormats(); // Re-fetch to get the latest status
    } catch (error) {
      console.error('Job delete failed:', error);
      setEncodeMessage(/* translators: %s is an error message */
      (0,external_wp_i18n_namespaceObject.sprintf)((0,external_wp_i18n_namespaceObject.__)('Error deleting job: %s'), error.message));
      fetchVideoFormats(); // Re-fetch to get the latest status
    } finally {
      setDeleteInProgress(null);
    }
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
  const somethingToEncode = () => {
    if (videoFormats) {
      // Check if any format is checked AND available AND not already in a terminal/pending state
      return Object.values(videoFormats).some(obj => obj.checked && obj.status !== 'queued' && obj.status !== 'processing' && obj.status !== 'completed' && obj.status !== 'pending_replacement');
    }
    return false;
  };
  const encodeButtonTitle = () => {
    if (somethingToEncode()) {
      return isLoading ? (0,external_wp_i18n_namespaceObject.__)('Loading…') : (0,external_wp_i18n_namespaceObject.__)('Encode selected formats');
    }
    return (0,external_wp_i18n_namespaceObject.__)('Select formats to encode');
  };
  const isEncodeButtonDisabled = isLoading || ffmpeg_exists !== true || !somethingToEncode();
  const confirmDialogMessage = () => {
    if (!itemToDelete) {
      return '';
    }
    if (itemToDelete.type === 'file') {
      return (0,external_wp_i18n_namespaceObject.sprintf)(/* translators: %s is the name of a video format (eg: H264 MP4 HD (720p) ) */
      (0,external_wp_i18n_namespaceObject.__)('You are about to permanently delete the encoded %s video file from your site. This action cannot be undone.'), itemToDelete.name);
    }
    if (itemToDelete.type === 'job') {
      return (0,external_wp_i18n_namespaceObject.sprintf)(/* translators: %s is the name of a video format (eg: H264 MP4 HD (720p) ) */
      (0,external_wp_i18n_namespaceObject.__)('You are about to permanently delete the encoding job for the %s video. This will also delete the encoded video file if it exists (if created by this job and not yet a separate attachment). This action cannot be undone.'), itemToDelete.name);
    }
  };
  const canUploadFiles = (0,external_wp_data_namespaceObject.useSelect)(select => select(external_wp_coreData_namespaceObject.store).canUser('create', 'media', id), [id]);
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.PanelBody, {
      title: (0,external_wp_i18n_namespaceObject.__)('Additional Formats'),
      children: [canUploadFiles && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.PanelRow, {
        children: videoFormats ? /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("ul", {
            className: `videopack-formats-list${ffmpeg_exists === true ? '' : ' no-ffmpeg'}`,
            children: videopack.settings.codecs.map(codec => {
              if (options.encode[codec.id]?.enabled !== '1') {
                return null;
              }
              return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("li", {
                children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("h4", {
                  className: "videopack-codec-name",
                  children: codec.name
                }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("ul", {
                  children: videopack.settings.resolutions.map(resolution => {
                    const formatId = `${codec.id}_${resolution.id}`;
                    const formatData = videoFormats[formatId];
                    if (!formatData) {
                      return null;
                    }
                    return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(AdditionalFormats_EncodeFormatStatus, {
                      formatId: formatId,
                      formatData: formatData,
                      ffmpegExists: ffmpeg_exists,
                      onCheckboxChange: handleFormatCheckbox,
                      onSelectFormat: onSelectFormat,
                      onDeleteFile: () => openConfirmDialog('file', formatId),
                      onCancelJob: () => openConfirmDialog('job', formatId),
                      deleteInProgress: deleteInProgress
                    }, formatId);
                  })
                })]
              }, codec.id);
            })
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalConfirmDialog, {
            isOpen: isConfirmOpen,
            onConfirm: handleConfirm,
            onCancel: handleCancel,
            children: confirmDialogMessage()
          })]
        }) : /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_ReactJSXRuntime_namespaceObject.Fragment, {
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Spinner, {})
        })
      }), ffmpeg_exists === true && videoFormats && canUploadFiles && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.PanelRow, {
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          variant: "secondary",
          onClick: handleEnqueue,
          title: encodeButtonTitle(),
          text: (0,external_wp_i18n_namespaceObject.__)('Encode'),
          disabled: isEncodeButtonDisabled
        }), isLoading && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Spinner, {}), encodeMessage && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
          className: "videopack-encode-message",
          children: encodeMessage
        })]
      })]
    })
  });
};
/* harmony default export */ const AdditionalFormats_AdditionalFormats = (AdditionalFormats);
;// ./src/features/attachment-details/components/AttachmentDetails.js







const AttachmentDetails = ({
  attachmentId
}) => {
  const [options, setOptions] = (0,external_wp_element_namespaceObject.useState)();
  const [attributes, setAttributes] = (0,external_wp_element_namespaceObject.useState)();
  const attachment = (0,external_wp_coreData_namespaceObject.useEntityRecord)('postType', 'attachment', !isNaN(attachmentId) ? attachmentId : null);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    getSettings().then(response => {
      setOptions(response);
    });
  }, []);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
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
  }, [options, attachment, attributes, attachmentId]);
  if (attributes && attachment.hasResolved && options) {
    return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
      className: "videopack-attachment-details",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(Thumbnails_Thumbnails, {
        setAttributes: setAttributes,
        attributes: attributes,
        attachment: attachment,
        options: options
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(AdditionalFormats_AdditionalFormats, {
        attributes: attributes,
        options: options
      })]
    });
  }
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Spinner, {});
};
/* harmony default export */ const components_AttachmentDetails = (AttachmentDetails);
;// ./src/features/attachment-details/attachment-details.js




// render on edit media screen

const editMediaContainer = document.getElementById('videopack-attachment-details-root');
if (editMediaContainer) {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('post');

  // Create a new React root and render the component.
  const videopackReactRoot = (0,external_wp_element_namespaceObject.createRoot)(editMediaContainer);
  videopackReactRoot.render(/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(components_AttachmentDetails, {
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
        let settingsSection = this.$el.find('.settings');
        if (settingsSection.length === 0) {
          if (this.$el.hasClass('attachment-details')) {
            settingsSection = this.$el;
          }
        }
        if (settingsSection.length === 0) {
          console.error('Videopack: Could not find the .settings or .attachment-details section in the attachment details sidebar.');
          return;
        }

        // Create and append the root div for our React component.
        const reactRootDiv = document.createElement('div');
        reactRootDiv.id = 'videopack-attachment-details-root';
        settingsSection.append(reactRootDiv);

        // Create a new React root and render the component.
        this.videopackReactRoot = (0,external_wp_element_namespaceObject.createRoot)(reactRootDiv);
        this.videopackReactRoot.render(/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(components_AttachmentDetails, {
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
/******/ })()
;