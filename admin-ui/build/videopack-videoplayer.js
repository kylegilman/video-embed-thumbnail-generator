"use strict";
(globalThis["webpackChunkvideopack_admin"] = globalThis["webpackChunkvideopack_admin"] || []).push([["videopack-videoplayer"],{

/***/ "./src/components/VideoPlayer/BelowVideo.js"
/*!**************************************************!*\
  !*** ./src/components/VideoPlayer/BelowVideo.js ***!
  \**************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__);
/**
 * Component to display metadata below the video player, such as view counts and captions.
 */



/**
 * BelowVideo component.
 *
 * @param {Object} props            Component props.
 * @param {Object} props.attributes Block attributes.
 * @return {Element|null} The rendered component.
 */

const BelowVideo = ({
  attributes
}) => {
  const {
    view_count,
    caption
  } = attributes;
  let viewStarts = 0;
  if (attributes?.starts && view_count || caption) {
    if (attributes?.starts) {
      viewStarts = Number(attributes?.starts);
    }
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.Fragment, {
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("div", {
        className: "videopack-below-video",
        children: [view_count && viewStarts > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("div", {
          className: "videopack-viewcount",
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.sprintf)(/* translators: %d is number of views */
          (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__._n)('%d view', '%d views', viewStarts, 'video-embed-thumbnail-generator'), viewStarts)
        }), caption && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("div", {
          className: "videopack-caption",
          children: caption
        })]
      })
    });
  }
  return null;
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (BelowVideo);

/***/ },

/***/ "./src/components/VideoPlayer/GenericPlayer.js"
/*!*****************************************************!*\
  !*** ./src/components/VideoPlayer/GenericPlayer.js ***!
  \*****************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__);
/**
 * A generic HTML5 video player component.
 */



/**
 * GenericPlayer component.
 *
 * @param {Object}      props             Component props.
 * @param {string}      props.poster      URL for the video poster image.
 * @param {boolean}     props.loop        Whether the video should loop.
 * @param {boolean}     props.autoPlay    Whether the video should autoplay.
 * @param {string}      props.preload     Preload setting (auto, metadata, none).
 * @param {boolean}     props.controls    Whether to show video controls.
 * @param {boolean}     props.muted       Whether the video is muted.
 * @param {boolean}     props.playsInline Whether the video should play inline on mobile.
 * @param {string}      props.className   Additional CSS classes.
 * @param {Array}       props.sources     List of video source objects.
 * @param {string}      props.src         Primary video source URL.
 * @param {Array}       props.tracks      List of text track (label, src, kind, etc.) objects.
 * @param {React.Ref}   ref               Reference to the video element.
 * @return {Element} The rendered component.
 */

const GenericPlayer = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.forwardRef)(({
  poster,
  loop,
  autoPlay,
  preload,
  controls,
  muted,
  playsInline,
  className,
  sources,
  src,
  tracks = []
}, ref) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("video", {
  poster: poster,
  loop: loop,
  autoPlay: autoPlay,
  preload: preload,
  controls: controls ? true : undefined,
  muted: muted,
  playsInline: playsInline,
  width: "100%",
  height: "100%",
  className: className,
  ref: ref,
  children: [sources.map((source, index) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("source", {
    src: source.src,
    type: source.type
  }, index)), tracks.map((track, index) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("track", {
    src: track.src,
    kind: track.kind,
    srcLang: track.srclang,
    label: track.label,
    default: track.default
  }, index)), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("a", {
    href: src,
    children: src
  })]
}));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (GenericPlayer);

/***/ },

/***/ "./src/components/VideoPlayer/MetaBar.js"
/*!***********************************************!*\
  !*** ./src/components/VideoPlayer/MetaBar.js ***!
  \***********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/close.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/code.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/download.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/share.mjs");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__);
/**
 * Component to display the interactive meta bar on top of the video player.
 */






/**
 * MetaBar component.
 *
 * @param {Object}    props            Component props.
 * @param {Object}    props.attributes Block attributes.
 * @param {React.Ref} props.playerRef  Reference to the active video player instance.
 * @return {Object|null} The rendered component.
 */

const MetaBar = ({
  attributes,
  playerRef
}) => {
  const {
    overlay_title,
    title,
    embedcode,
    embeddable,
    downloadlink,
    twitter_button,
    facebook_button,
    embed_method
  } = attributes;
  const metaBarItems = [overlay_title, embedcode, downloadlink, twitter_button, facebook_button];
  const noTitleMeta = overlay_title ? '' : ' no-title';
  const randomId = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => Math.random().toString(36).substr(2, 9), []);
  const [startAtEnabled, setStartAtEnabled] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [startAtTime, setStartAtTime] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('00:00');
  const [shareIsOpen, setShareIsOpen] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const embedItems = () => {
    if (embeddable && embedcode) {
      return true;
    }
    return false;
  };
  const embedLink = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
    if (attributes?.embedlink) {
      return String(attributes?.embedlink);
    }
    return '';
  }, [attributes?.embedlink]);
  const [currentEmbedCode, setCurrentEmbedCode] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(embedLink());
  const convertToTimecode = time => {
    const minutes = Math.floor(time / 60);
    let seconds = Math.round(time - minutes * 60);
    if (seconds < 10) {
      seconds = `0${seconds}`;
    }
    let min_display = String(minutes);
    if (minutes < 10) {
      min_display = `0${minutes}`;
    }
    return `${min_display}:${seconds}`;
  };
  const handleStartAtChange = e => {
    const isChecked = e.target.checked;
    setStartAtEnabled(isChecked);
    if (isChecked && playerRef.current) {
      let currentTime = 0;
      if (embed_method === 'Video.js') {
        if (typeof playerRef.current.currentTime === 'function') {
          currentTime = playerRef.current.currentTime();
        }
      } else if (typeof playerRef.current.currentTime === 'number') {
        currentTime = playerRef.current.currentTime;
      }
      setStartAtTime(convertToTimecode(Math.floor(currentTime)));
    }
  };
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    const originalEmbedCode = embedLink();
    if (!originalEmbedCode) {
      setCurrentEmbedCode('');
      return;
    }
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = originalEmbedCode;
    const iframe = tempDiv.querySelector('iframe');
    if (!iframe) {
      setCurrentEmbedCode(originalEmbedCode);
      return;
    }
    let src = iframe.getAttribute('src');
    if (!src) {
      setCurrentEmbedCode(originalEmbedCode);
      return;
    }
    src = src.replace(/&?videopack\[start\]=[^&]*/, '');
    src = src.replace(/\?&/, '?').replace(/\?$/, '');
    if (startAtEnabled && startAtTime) {
      const separator = src.includes('?') ? '&' : '?';
      src += `${separator}videopack[start]=${encodeURIComponent(startAtTime)}`;
    }
    iframe.setAttribute('src', src);
    setCurrentEmbedCode(iframe.outerHTML);
  }, [startAtEnabled, startAtTime, attributes.embedlink, embedLink]);
  const EmbedElements = () => {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.Fragment, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("button", {
        className: `videopack-click-trap${shareIsOpen ? ' is-visible' : ''}`,
        onClick: () => {
          setShareIsOpen(!shareIsOpen);
        }
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
        className: `videopack-share-container${shareIsOpen ? ' is-visible' : ''}${noTitleMeta}`,
        children: embedItems() && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.Fragment, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("span", {
            className: "videopack-embedcode-container",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
              className: "videopack-icons embed",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Icon, {
                icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_4__["default"],
                className: "embed-icon"
              })
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Embed:', 'video-embed-thumbnail-generator')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("input", {
                className: "videopack-embed-code",
                type: "text",
                value: currentEmbedCode,
                onClick: event => {
                  event.target.select();
                },
                readOnly: true
              })
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("span", {
            className: "videopack-start-at-container",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("input", {
              type: "checkbox",
              className: "videopack-start-at-enable",
              id: `videopack-start-at-enable-block-${randomId}`,
              checked: startAtEnabled,
              onChange: handleStartAtChange
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("label", {
              htmlFor: `videopack-start-at-enable-block-${randomId}`,
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Start at:', 'video-embed-thumbnail-generator')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("input", {
              type: "text",
              className: "videopack-start-at",
              value: startAtTime,
              onChange: e => setStartAtTime(e.target.value)
            })]
          })]
        })
      })]
    });
  };
  if (metaBarItems.includes(true)) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.Fragment, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
        className: `videopack-meta-bar${noTitleMeta}`,
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("span", {
          className: 'videopack-meta-icons',
          children: [embedItems() && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("button", {
            type: "button",
            className: "videopack-meta-bar-button",
            onClick: () => {
              setShareIsOpen(!shareIsOpen);
            },
            title: shareIsOpen ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Close', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Share', 'video-embed-thumbnail-generator'),
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
              className: `videopack-icons ${shareIsOpen ? 'close' : 'share'}`,
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Icon, {
                icon: shareIsOpen ? _wordpress_icons__WEBPACK_IMPORTED_MODULE_3__["default"] : _wordpress_icons__WEBPACK_IMPORTED_MODULE_6__["default"],
                className: shareIsOpen ? 'close-icon' : 'share-icon'
              })
            })
          }), downloadlink && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("a", {
            className: "videopack-download-link",
            href: attributes.src,
            download: true,
            title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Click to download', 'video-embed-thumbnail-generator'),
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
              className: "videopack-icons download",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Icon, {
                icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_5__["default"],
                className: "download-icon"
              })
            })
          })]
        }), overlay_title && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
          className: "videopack-title",
          children: title
        })]
      }), embedItems() && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(EmbedElements, {})]
    });
  }
  return null;
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MetaBar);

/***/ },

/***/ "./src/components/VideoPlayer/VideoJs.js"
/*!***********************************************!*\
  !*** ./src/components/VideoPlayer/VideoJs.js ***!
  \***********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   VideoJS: () => (/* binding */ VideoJS),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__);
/**
 * A React wrapper for the Video.js player library.
 */

/* global videojs, ResizeObserver */



/**
 * Video.js React component.
 *
 * Uses setTimeout(fn, 0) to defer initialization to the next event loop tick.
 * This handles both React Strict Mode (cleanup cancels the timer) and the
 * WordPress Block Editor iframe migration (the container is in the correct
 * document by the time the timer fires).
 *
 * @param {Object}   props         Component props.
 * @param {Object}   props.options Video.js player options.
 * @param {string}   props.skin    CSS class name for the player skin.
 * @param {Function} props.onPlay  Callback for the play event.
 * @param {Function} props.onPause Callback for the pause event.
 * @param {Function} props.onReady Callback fired once the player is ready.
 */

const VideoJS = props => {
  const videoRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const playerRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const {
    options,
    skin,
    onPlay,
    onPause,
    onReady
  } = props;
  const previousSkinRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(skin);
  const previousPluginsRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(options?.plugins);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    let initTimer;
    const player = playerRef.current;
    // When plugins change (e.g. resolution selector added after entity
    // record resolves), initialize the plugin on the existing player
    // rather than disposing. Disposing triggers a setTimeout reinit,
    // but by then the container is disconnected from the iframe.
    if (player && !player.isDisposed() && JSON.stringify(previousPluginsRef.current) !== JSON.stringify(options.plugins)) {
      previousPluginsRef.current = options.plugins;
      if (options.plugins && typeof player.resolutionSelector === 'function') {
        try {
          // Update sources first so the plugin sees all resolutions.
          if (options.sources && options.sources.length > 0) {
            const currentSrc = player.currentSrc();
            const newSrc = options.sources[0].src;
            if (currentSrc !== newSrc) {
              player.src(options.sources);
            }
          }
          player.resolutionSelector(options.plugins.resolutionSelector);
        } catch (e) {
          console.warn('Video.js plugin update error:', e);
        }
      }
    }

    // On initial render (or after dispose), wait for sources to be available before initializing.
    if (!player) {
      // Wrap initialization in a timeout to handle React Strict Mode double-mounts.
      // This ensures we don't init a player if the component is immediately unmounted.
      // We use a short delay (100ms) to allow layouts (like the WordPress Media Library modal)
      initTimer = setTimeout(() => {
        if (!options || !options.sources || options.sources.length === 0) {
          return; // Don't initialize until sources are ready.
        }
        if (!videoRef.current) {
          return;
        }

        // Ensure the container is empty before creating a new player.
        while (videoRef.current.firstChild) {
          videoRef.current.removeChild(videoRef.current.firstChild);
        }
        const videoElement = document.createElement('video');
        videoElement.className = `video-js ${skin || ''} vjs-big-play-centered`;
        videoElement.setAttribute('playsinline', '');
        videoRef.current.appendChild(videoElement);
        playerRef.current = videojs(videoElement, options, function () {
          if (onReady) {
            onReady(this);
          }
          this.on('play', onPlay);
          this.on('pause', onPause);
        });
      }, 250);
    } else if (player && !player.isDisposed()) {
      player.ready(function () {
        // Safeguard against missing tech (e.g. failed to load source)
        if (!player.tech(true)) {
          return;
        }

        // Update existing player options
        player.autoplay(options.autoplay);
        player.loop(options.loop);
        player.muted(options.muted);
        player.volume(options.volume);
        player.poster(options.poster);
        player.controls(options.controls);
        player.playbackRates(options.playback_rate ? [0.5, 1, 1.25, 1.5, 2] : []);
        player.preload(options.preload);
        if (previousSkinRef.current !== skin) {
          if (previousSkinRef.current) {
            player.removeClass(previousSkinRef.current);
          }
          if (skin) {
            player.addClass(skin);
          }
          previousSkinRef.current = skin;
        }

        // Only update src if it has actually changed to prevent reloading
        if (options.sources && options.sources.length > 0) {
          const currentSrc = player.currentSrc();
          const newSrc = options.sources[0].src;
          if (currentSrc !== newSrc) {
            player.src(options.sources);
          }
        }

        // Update aspect ratio if it changed
        if (options.aspectRatio && options.aspectRatio !== player.aspectRatio()) {
          player.aspectRatio(options.aspectRatio);
        }

        // Update tracks if they changed
        if (options.tracks) {
          const remoteTracks = player.remoteTextTracks();
          const currentTracks = [];
          for (let i = 0; i < remoteTracks.length; i++) {
            currentTracks.push({
              src: remoteTracks[i].src,
              kind: remoteTracks[i].kind,
              srclang: remoteTracks[i].language,
              label: remoteTracks[i].label,
              default: remoteTracks[i].default
            });
          }
          if (JSON.stringify(currentTracks) !== JSON.stringify(options.tracks)) {
            // Remove old remote tracks
            for (let i = remoteTracks.length - 1; i >= 0; i--) {
              player.removeRemoteTextTrack(remoteTracks[i]);
            }
            // Add new ones
            options.tracks.forEach(track => {
              player.addRemoteTextTrack(track, false);
            });
          }
        }
      });
    }
    return () => {
      clearTimeout(initTimer);
    };
  }, [options, skin, onPlay, onPause, onReady]);

  // Dispose the player when the component unmounts
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.off('play', onPlay);
        playerRef.current.off('pause', onPause);
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [onPause, onPlay]);

  // Trigger a resize event on the player when the container's dimensions change.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    const container = videoRef.current;
    if (!container || typeof ResizeObserver === 'undefined') {
      return;
    }
    const resizeObserver = new ResizeObserver(() => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.trigger('resize');
      }
    });
    resizeObserver.observe(container);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Normalize aspect ratio from options (e.g. '16:9' -> '16 / 9') or fallback to width/height.
  let ratio = '16 / 9';
  if (options.aspectRatio) {
    ratio = options.aspectRatio.replace(':', ' / ');
  } else if (options.width && options.height) {
    ratio = `${options.width} / ${options.height}`;
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("div", {
    "data-vjs-player": true,
    ref: videoRef,
    style: {
      width: '100%',
      aspectRatio: ratio,
      overflow: 'hidden'
    }
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (VideoJS);

/***/ },

/***/ "./src/components/VideoPlayer/VideoPlayer.js"
/*!***************************************************!*\
  !*** ./src/components/VideoPlayer/VideoPlayer.js ***!
  \***************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_html_entities__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/html-entities */ "@wordpress/html-entities");
/* harmony import */ var _wordpress_html_entities__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_html_entities__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/hooks */ "@wordpress/hooks");
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _MetaBar__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./MetaBar */ "./src/components/VideoPlayer/MetaBar.js");
/* harmony import */ var _GenericPlayer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./GenericPlayer */ "./src/components/VideoPlayer/GenericPlayer.js");
/* harmony import */ var _VideoJs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./VideoJs */ "./src/components/VideoPlayer/VideoJs.js");
/* harmony import */ var _WpMejsPlayer__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./WpMejsPlayer */ "./src/components/VideoPlayer/WpMejsPlayer.js");
/* harmony import */ var _BelowVideo__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./BelowVideo */ "./src/components/VideoPlayer/BelowVideo.js");
/* harmony import */ var _VideoPlayer_scss__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./VideoPlayer.scss */ "./src/components/VideoPlayer/VideoPlayer.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__);
/**
 * Main VideoPlayer component that orchestrates different player engines and UI overlays.
 */









const DEFAULT_PLAYERS = {
  'Video.js': _VideoJs__WEBPACK_IMPORTED_MODULE_5__["default"],
  'WordPress Default': _WpMejsPlayer__WEBPACK_IMPORTED_MODULE_6__["default"],
  None: _GenericPlayer__WEBPACK_IMPORTED_MODULE_4__["default"]
};


// Make sure to pass isSelected from the block's edit component.

const noop = () => {};

/**
 * VideoPlayer component.
 *
 * @param {Object}   props            Component props.
 * @param {Object}   props.attributes Block attributes.
 * @param {Function} props.onReady    Callback fired when the player engine is ready.
 * @return {Element|null} The rendered component.
 */
const VideoPlayer = ({
  attributes,
  onReady = noop
}) => {
  const decodedAttributes = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => ({
    ...attributes,
    title: attributes.title ? (0,_wordpress_html_entities__WEBPACK_IMPORTED_MODULE_1__.decodeEntities)(attributes.title) : attributes.title
  }), [attributes]);
  const {
    embed_method,
    autoplay,
    controls = true,
    skin,
    loop,
    muted,
    playsinline,
    poster,
    preload,
    src,
    volume,
    auto_res,
    auto_codec,
    sources = [],
    source_groups = {},
    text_tracks = [],
    playback_rate,
    watermark,
    watermark_styles,
    watermark_link_to,
    fixed_aspect,
    default_ratio,
    play_button_color,
    play_button_icon_color,
    control_bar_bg_color,
    control_bar_color,
    title_color,
    title_background_color
  } = decodedAttributes;
  const isFixedAspect = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    if (fixed_aspect === 'true' || fixed_aspect === true) {
      return true;
    }
    if (fixed_aspect === 'vertical' && decodedAttributes.height > decodedAttributes.width) {
      return true;
    }
    return false;
  }, [fixed_aspect, decodedAttributes.width, decodedAttributes.height]);
  const aspectRatio = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    if (isFixedAspect) {
      return (default_ratio || '16 / 9').replace(/\s\/\s/g, ':');
    }
    if (decodedAttributes.width && decodedAttributes.height) {
      return `${decodedAttributes.width}:${decodedAttributes.height}`;
    }
    return undefined;
  }, [isFixedAspect, default_ratio, decodedAttributes.width, decodedAttributes.height]);
  const playerStyles = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    const styles = {};
    const config = window.videopack_config || {};
    if (config.mejs_controls_svg) {
      styles['--videopack-mejs-controls-svg'] = `url(${config.mejs_controls_svg})`;
    }
    if (play_button_color) {
      styles['--videopack-play-button-color'] = play_button_color;
    }
    if (play_button_icon_color) {
      styles['--videopack-play-button-icon-color'] = play_button_icon_color;
    }
    if (control_bar_bg_color) {
      styles['--videopack-control-bar-bg-color'] = control_bar_bg_color;
    }
    if (control_bar_color) {
      styles['--videopack-control-bar-color'] = control_bar_color;
    }
    if (title_color) {
      styles['--videopack-title-color'] = title_color;
    }
    if (title_background_color) {
      styles['--videopack-title-background-color'] = title_background_color;
    }
    return styles;
  }, [play_button_color, play_button_icon_color, control_bar_bg_color, control_bar_color, title_color, title_background_color]);
  const innerPlayerStyles = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    const styles = {};
    // Apply aspect ratio to the inner player if we know it (fixed or native)
    if (isFixedAspect) {
      styles.aspectRatio = default_ratio || '16 / 9';
    } else if (aspectRatio) {
      styles.aspectRatio = aspectRatio.replace(':', ' / ');
    }
    return styles;
  }, [isFixedAspect, default_ratio, aspectRatio]);
  const wrapperClasses = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    const classes = ['videopack-wrapper', 'videopack-meta-bar-visible'];
    if (isFixedAspect || aspectRatio) {
      classes.push('videopack-has-aspect-ratio');
      if (isFixedAspect) {
        classes.push('videopack-fixed-aspect');
      }
    }
    if (play_button_color) {
      classes.push('videopack-has-play-button-color');
    }
    if (play_button_icon_color) {
      classes.push('videopack-has-play-button-icon-color');
    }
    if (control_bar_bg_color) {
      classes.push('videopack-has-control-bar-bg-color');
    }
    if (control_bar_color) {
      classes.push('videopack-has-control-bar-color');
    }
    if (title_color) {
      classes.push('videopack-has-title-color');
    }
    if (title_background_color) {
      classes.push('videopack-has-title-background-color');
    }
    return classes.join(' ');
  }, [play_button_color, play_button_icon_color, control_bar_bg_color, control_bar_color, title_color, title_background_color, isFixedAspect, aspectRatio]);
  const actualAutoplay = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    return autoplay;
  }, [autoplay]);
  const videoRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const playerInstanceRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const wrapperRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const allSources = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    if (Object.keys(source_groups).length > 0) {
      return Object.values(source_groups).flatMap(group => group.sources);
    }
    return sources;
  }, [sources, source_groups]);
  const genericPlayerOptions = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => ({
    poster,
    loop,
    preload,
    controls: !!controls,
    muted,
    playsInline: playsinline,
    className: 'videopack-video',
    sources: allSources,
    src,
    tracks: text_tracks,
    volume,
    autoPlay: embed_method === 'WordPress Default' ? false : actualAutoplay
  }), [poster, loop, actualAutoplay, preload, controls, muted, volume, playsinline, src, allSources, text_tracks, embed_method] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const videoJsOptions = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    const isVjs = (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__.applyFilters)('videopack_is_videojs_player', embed_method === 'Video.js', embed_method);
    if (!isVjs) {
      return null;
    }
    const options = {
      autoplay: actualAutoplay,
      controls,
      fluid: !aspectRatio,
      // Use fluid if no ratio specified
      fill: !!aspectRatio,
      // Use fill if we have a ratio (handled by CSS)
      responsive: true,
      aspectRatio,
      muted,
      preload,
      poster,
      loop,
      playsinline,
      volume,
      playbackRates: playback_rate ? [0.5, 1, 1.25, 1.5, 2] : [],
      sources: allSources.map(s => ({
        src: s.src,
        type: s.type,
        resolution: s.resolution
      })),
      tracks: text_tracks.map(t => ({
        src: t.src,
        kind: t.kind,
        srclang: t.srclang,
        label: t.label,
        default: t.default
      }))
    };
    const hasResolutions = allSources.some(s => s.resolution);
    if (hasResolutions) {
      options.plugins = {
        ...options.plugins,
        resolutionSelector: {
          force_types: ['video/mp4'],
          source_groups,
          default_res: auto_res,
          default_codec: auto_codec
        }
      };
    }
    return options;
  }, [embed_method, actualAutoplay, controls, muted, preload, poster, loop, playback_rate, playsinline, volume, auto_res, auto_codec, allSources, source_groups, text_tracks, aspectRatio]); // eslint-disable-line react-hooks/exhaustive-deps

  const renderReady = allSources && allSources.length > 0 && allSources[0].src;
  const handlePlay = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    if (wrapperRef.current) {
      wrapperRef.current.classList.remove('videopack-meta-bar-visible');
    }
  }, []);
  const handlePause = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    if (wrapperRef.current) {
      wrapperRef.current.classList.add('videopack-meta-bar-visible');
    }
  }, []);
  const onReadyRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(onReady);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    onReadyRef.current = onReady;
  }, [onReady]);
  const handleVideoPlayerReady = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(player => {
    playerInstanceRef.current = player;
    player.on('loadedmetadata', () => {
      if (onReady) {
        if (embed_method === 'Video.js') {
          onReady(player.el().firstChild);
        } else {
          onReady(player);
        }
      }
      if (actualAutoplay) {
        handlePlay();
      }
    });
  }, [embed_method, actualAutoplay, onReady, handlePlay]);
  const handleMejsReady = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(player => {
    playerInstanceRef.current = player;
    if (onReady) {
      onReady(player);
    }
  }, [onReady]);
  if (!renderReady) {
    return null; // Or a loading spinner
  }
  const getWatermarkStyle = () => {
    const defaults = {
      scale: 10,
      align: 'right',
      valign: 'bottom',
      x: 5,
      y: 7
    };
    const styles = {
      ...defaults,
      ...watermark_styles
    };

    // Check if styles differ from defaults
    if (Number(styles.scale) === defaults.scale && styles.align === defaults.align && styles.valign === defaults.valign && Number(styles.x) === defaults.x && Number(styles.y) === defaults.y) {
      return null;
    }
    const css = {
      maxWidth: `${styles.scale}%`,
      width: '100%',
      height: 'auto',
      position: 'absolute'
    };
    const x = styles.x || 0;
    const y = styles.y || 0;
    if (styles.align === 'left') {
      css.left = `${x}%`;
    } else if (styles.align === 'right') {
      css.right = `${x}%`;
    } else {
      css.left = '50%';
      css.transform = 'translateX(-50%)';
      css.marginLeft = `${-x}%`;
    }
    if (styles.valign === 'top') {
      css.top = `${y}%`;
    } else if (styles.valign === 'bottom') {
      css.bottom = `${y}%`;
    } else {
      css.top = '50%';
      css.transform = css.transform ? 'translate(-50%, -50%)' : 'translateY(-50%)';
      css.marginTop = `${-y}%`;
    }
    return css;
  };
  const watermarkStyle = getWatermarkStyle();
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)("div", {
    className: wrapperClasses,
    ref: wrapperRef,
    style: playerStyles,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)("div", {
      className: `videopack-player ${skin || ''}`,
      style: innerPlayerStyles,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_MetaBar__WEBPACK_IMPORTED_MODULE_3__["default"], {
        attributes: decodedAttributes,
        playerRef: playerInstanceRef
      }), (() => {
        const players = (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__.applyFilters)('videopack_admin_players', DEFAULT_PLAYERS);
        const PlayerComponent = players[embed_method] || players.None;
        if (embed_method === 'Video.js' && videoJsOptions) {
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(PlayerComponent, {
            options: videoJsOptions,
            skin: skin,
            onPlay: handlePlay,
            onPause: handlePause,
            onReady: handleVideoPlayerReady
          }, `videojs-${src}`);
        }
        if (embed_method === 'WordPress Default') {
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(PlayerComponent, {
            options: genericPlayerOptions,
            controls: controls,
            actualAutoplay: actualAutoplay,
            onReady: handleMejsReady,
            onPlay: handlePlay,
            playback_rate: playback_rate,
            aspectRatio: aspectRatio
          }, `wpvideo-${src}`);
        }
        if (embed_method === 'None') {
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(PlayerComponent, {
            ...genericPlayerOptions,
            ref: videoRef
          });
        }

        // Fallback for custom players
        if (PlayerComponent === _GenericPlayer__WEBPACK_IMPORTED_MODULE_4__["default"]) {
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(PlayerComponent, {
            ...genericPlayerOptions,
            ref: videoRef
          }, `${embed_method}-fallback-${src}`);
        }
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(PlayerComponent, {
          options: videoJsOptions || genericPlayerOptions,
          skin: skin,
          attributes: decodedAttributes,
          onPlay: handlePlay,
          onPause: handlePause,
          onReady: handleVideoPlayerReady
        }, `${embed_method}-${src}`);
      })(), watermark && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
        className: "videopack-watermark",
        children: watermark_link_to && watermark_link_to !== 'false' && watermark_link_to !== 'None' ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("a", {
          href: "#videopack-watermark-link",
          className: "videopack-watermark-link",
          onClick: e => e.preventDefault(),
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("img", {
            src: watermark,
            alt: "watermark",
            style: watermarkStyle
          })
        }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("img", {
          src: watermark,
          alt: "watermark",
          style: watermarkStyle
        })
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_BelowVideo__WEBPACK_IMPORTED_MODULE_7__["default"], {
      attributes: decodedAttributes
    })]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (VideoPlayer);

/***/ },

/***/ "./src/components/VideoPlayer/WpMejsPlayer.js"
/*!****************************************************!*\
  !*** ./src/components/VideoPlayer/WpMejsPlayer.js ***!
  \****************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__);
/* global MediaElementPlayer */


/**
 * Isolated MediaElement.js Player component.
 * Manually manages the video element to prevent DOM conflicts with React.
 */
/**
 * WpMejsPlayer component.
 *
 * @param {Object}   props                Component props.
 * @param {Object}   props.options        Player options (sources, tracks, poster, etc.).
 * @param {boolean}  props.controls       Whether to enable native controls.
 * @param {boolean}  props.actualAutoplay Whether to autoplay the video.
 * @param {Function} props.onReady        Callback fired when MEJS is ready.
 * @param {Function} props.onPlay         Callback fired on play event.
 * @param {boolean}  props.playback_rate  Whether to enable playback rate controls.
 * @return {Element} The rendered component.
 */

const WpMejsPlayer = props => {
  const {
    options,
    controls,
    actualAutoplay,
    onReady,
    onPlay,
    playback_rate,
    aspectRatio
  } = props;
  const containerRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const playerRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const propsRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(props);

  // Keep propsRef current so the effect always reads the latest callbacks.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    propsRef.current = props;
  });
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    let isMounted = true;
    let timeoutId = null;
    const cleanupPlayer = () => {
      if (playerRef.current) {
        try {
          if (typeof playerRef.current.remove === 'function') {
            playerRef.current.remove();
          }
        } catch (e) {
          // Ignore
        }
        playerRef.current = null;
      }
    };

    // Use a delay to handle Strict Mode and iframe context migration.
    // The 100ms timeout defers to a later tick, allowing DOM shuffling to settle.
    timeoutId = setTimeout(() => {
      const container = containerRef.current;
      if (!container || !isMounted || !container.ownerDocument.body.contains(container)) {
        return;
      }

      // Clean up any stale DOM.
      container.innerHTML = '';
      const {
        options: curOptions,
        controls: curControls,
        actualAutoplay: curAutoplay,
        onReady: curOnReady,
        onPlay: curOnPlay,
        playback_rate: curPlaybackRate
      } = propsRef.current;
      if (!curOptions || !curOptions.sources || curOptions.sources.length === 0) {
        return;
      }
      try {
        const videoElement = container.ownerDocument.createElement('video');
        videoElement.className = 'wp-video-shortcode videopack-video';
        videoElement.setAttribute('playsinline', '');
        if (curOptions.poster) {
          videoElement.setAttribute('poster', curOptions.poster);
        }
        if (curOptions.loop) {
          videoElement.setAttribute('loop', 'true');
        }
        if (curOptions.preload) {
          videoElement.setAttribute('preload', curOptions.preload);
        }
        const shouldBeMuted = !!curOptions.muted || !!curAutoplay;
        if (shouldBeMuted) {
          videoElement.setAttribute('muted', 'muted');
          videoElement.muted = true;
        }
        curOptions.sources.forEach(s => {
          const source = container.ownerDocument.createElement('source');
          source.src = s.src;
          source.type = s.type;
          videoElement.appendChild(source);
        });
        if (curOptions.tracks) {
          curOptions.tracks.forEach(t => {
            const track = container.ownerDocument.createElement('track');
            track.src = t.src;
            track.kind = t.kind;
            track.srclang = t.srclang;
            track.label = t.label;
            if (t.default) {
              track.setAttribute('default', 'true');
            }
            videoElement.appendChild(track);
          });
        }
        container.appendChild(videoElement);
        const mejsSettings = window._wpmejsSettings || {};
        const mejsOptions = {
          pluginPath: '/wp-includes/js/mediaelement/',
          ...mejsSettings
        };

        // Ensure features is an array to avoid MEJS crashes in setResponsiveMode.
        if (!mejsOptions.features || !Array.isArray(mejsOptions.features)) {
          mejsOptions.features = ['playpause', 'progress', 'current', 'duration', 'tracks', 'volume', 'fullscreen'];
        }
        if (!mejsOptions.stretching) {
          mejsOptions.stretching = 'responsive';
        }
        mejsOptions.startVolume = curOptions.volume !== undefined && curOptions.volume !== null ? curOptions.volume : 0.8;
        mejsOptions.startMuted = shouldBeMuted;
        mejsOptions.success = media => {
          if (!isMounted) {
            return;
          }
          playerRef.current = media;
          if (curOnReady) {
            if (typeof curOnReady === 'function') {
              curOnReady(media);
            } else if (curOnReady.current) {
              curOnReady.current(media);
            }
          }

          // Small delay to allow DOM normalization before sizing.
          setTimeout(() => {
            if (isMounted && media.container && typeof media.setPlayerSize === 'function') {
              media.setPlayerSize();
              media.setControlsSize();
            }
          }, 100);
          if (curAutoplay) {
            const autoPlayHandler = () => {
              const playPromise = media.play();
              if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(e => {
                  if (e.name !== 'AbortError') {
                    // eslint-disable-next-line no-console
                    console.warn('Autoplay prevented:', e);
                  }
                });
              }
              media.removeEventListener('canplay', autoPlayHandler);
            };
            if (media.readyState >= 3) {
              autoPlayHandler();
            } else {
              media.addEventListener('canplay', autoPlayHandler);
            }
          }
          if (curOnPlay) {
            media.addEventListener('play', curOnPlay);
          }
        };
        mejsOptions.videoWidth = '100%';
        mejsOptions.videoHeight = '100%';
        if (!curControls) {
          mejsOptions.features = [];
          mejsOptions.controls = false;
        }
        if (curPlaybackRate) {
          if (!mejsOptions.features.includes('speed')) {
            mejsOptions.features.push('speed');
          }
          mejsOptions.speeds = ['0.5', '1', '1.25', '1.5', '2'];
        }

        // Final check before constructor.
        if (isMounted && container.ownerDocument.body.contains(container)) {
          new MediaElementPlayer(videoElement, mejsOptions);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('MEJS INIT ERROR:', e);
      }
    }, 100);
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      cleanupPlayer();
    };
  }, [options.src, options.poster, options.sources, options.tracks, controls, actualAutoplay, onReady, onPlay, playback_rate]);

  // Reactive updates for volume and muted without recreating the player.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    const media = playerRef.current;
    const shouldBeMuted = !!options.muted || !!actualAutoplay;
    if (media && typeof media.setMuted === 'function') {
      media.setMuted(shouldBeMuted);
    }
  }, [options.muted, actualAutoplay]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    const media = playerRef.current;
    if (media && typeof media.setVolume === 'function' && options.volume !== undefined && options.volume !== null) {
      media.setVolume(options.volume);
    }
  }, [options.volume]);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("div", {
    className: `wp-video-container${!controls ? ' videopack-no-controls' : ''}`,
    ref: containerRef,
    style: {
      aspectRatio: aspectRatio ? aspectRatio.replace(':', ' / ') : '16 / 9',
      width: '100%'
    }
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (WpMejsPlayer);

/***/ },

/***/ "./src/components/VideoPlayer/VideoPlayer.scss"
/*!*****************************************************!*\
  !*** ./src/components/VideoPlayer/VideoPlayer.scss ***!
  \*****************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }

}]);
//# sourceMappingURL=videopack-videoplayer.js.map