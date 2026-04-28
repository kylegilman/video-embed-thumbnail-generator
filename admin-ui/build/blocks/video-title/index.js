/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/blocks/video-title/edit.js"
/*!****************************************!*\
  !*** ./src/blocks/video-title/edit.js ***!
  \****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   VideoTitle: () => (/* binding */ VideoTitle),
/* harmony export */   "default": () => (/* binding */ Edit)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _wordpress_html_entities__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/html-entities */ "@wordpress/html-entities");
/* harmony import */ var _wordpress_html_entities__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_html_entities__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/background.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/close.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/code.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/download.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/share.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/title.mjs");
/* harmony import */ var _components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../components/CompactColorPicker/CompactColorPicker */ "./src/components/CompactColorPicker/CompactColorPicker.js");
/* harmony import */ var _utils_colors__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../utils/colors */ "./src/utils/colors.js");
/* harmony import */ var _hooks_useVideopackContext__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../hooks/useVideopackContext */ "./src/hooks/useVideopackContext.js");
/* harmony import */ var _editor_scss__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./editor.scss */ "./src/blocks/video-title/editor.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__);
/* global videopack_config */












/**
 * An internal component to display the video title with correct styling and data.
 */

function VideoTitle({
  blockProps,
  postId: propPostId,
  postType: propPostType,
  title: manualTitle,
  tagName: Tag = 'h3',
  textAlign,
  isOverlay = false,
  downloadlink,
  embedcode,
  embedlink,
  overlay_title,
  showBackground,
  onTitleChange,
  isInsideThumbnail,
  isInsidePlayerOverlay,
  position: attrPosition,
  attributes = {},
  context = {},
  usePostTitle = false,
  linkToPost = false
}) {
  const vpContext = (0,_hooks_useVideopackContext__WEBPACK_IMPORTED_MODULE_14__["default"])(attributes, context);
  const {
    postId: resolvedPostId,
    attachmentId: resolvedAttachmentId,
    postType: resolvedPostType,
    prioritizePostData
  } = vpContext.resolved;
  const postId = prioritizePostData || usePostTitle ? resolvedPostId || propPostId : resolvedAttachmentId || resolvedPostId || propPostId;
  const postType = prioritizePostData || usePostTitle ? resolvedPostType || propPostType : resolvedAttachmentId ? 'attachment' : resolvedPostType || propPostType;
  const {
    attachmentTitle,
    isResolving
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_3__.useSelect)(select => {
    if (!postId || postId < 1) {
      return {
        attachmentTitle: '',
        isResolving: false
      };
    }
    const {
      getEntityRecord,
      isResolving: isResolvingSelector
    } = select('core');
    const record = getEntityRecord('postType', postType, postId);
    return {
      attachmentTitle: record?.title?.rendered,
      isResolving: isResolvingSelector('getEntityRecord', ['postType', postType, postId])
    };
  }, [postId]);
  const [startAtEnabled, setStartAtEnabled] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [startAtTime, setStartAtTime] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)('00:00');
  const [shareIsOpen, setShareIsOpen] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const randomId = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => Math.random().toString(36).substr(2, 9), []);
  const baseEmbedLink = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    if (embedlink) {
      return String(embedlink);
    }
    return '';
  }, [embedlink]);
  const [currentEmbedCode, setCurrentEmbedCode] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(baseEmbedLink());
  const titleFromContext = context['videopack/title'];

  // If prioritizing post data, we use the title we fetched for the postId (which will be the parent post).
  // Otherwise, we prefer the title specifically passed in context (the video title).
  const displayTitle = (0,_wordpress_html_entities__WEBPACK_IMPORTED_MODULE_5__.decodeEntities)(manualTitle || (vpContext.resolved.prioritizePostData || usePostTitle ? attachmentTitle || titleFromContext : titleFromContext || attachmentTitle) || '');
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    const originalEmbedLink = baseEmbedLink();
    if (!originalEmbedLink) {
      setCurrentEmbedCode('');
      return;
    }

    // Normalize to a clean URL if it was already an iframe.
    let src = originalEmbedLink;
    if (originalEmbedLink.includes('<iframe')) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = originalEmbedLink;
      const iframe = tempDiv.querySelector('iframe');
      src = iframe ? iframe.getAttribute('src') : originalEmbedLink;
    }
    src = src.replace(/&?videopack\[start\]=[^&]*/, '');
    src = src.replace(/\?&/, '?').replace(/\?$/, '');
    if (startAtEnabled && startAtTime) {
      const separator = src.includes('?') ? '&' : '?';
      src += `${separator}videopack[start]=${encodeURIComponent(startAtTime)}`;
    }
    const allowPolicy = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen';
    const sandboxPolicy = 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation allow-forms';
    const iframeTitle = displayTitle ? `Video Player - ${displayTitle}` : 'Video Player';
    const newEmbedCode = `<iframe src="${src}" width="960" height="540" style="border:0; width:100%; aspect-ratio:16/9;" allow="${allowPolicy}" allowfullscreen credentialless sandbox="${sandboxPolicy}" loading="lazy" title="${iframeTitle}" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
    setCurrentEmbedCode(newEmbedCode);
  }, [startAtEnabled, startAtTime, baseEmbedLink, displayTitle]);
  if (isResolving && !displayTitle) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Spinner, {});
  }
  const position = attrPosition || (isInsideThumbnail ? 'bottom' : 'top');
  const defaultAlign = isInsideThumbnail ? 'center' : isOverlay ? 'left' : 'left';
  const finalTextAlign = textAlign || defaultAlign;
  const globalOptions = videopack_config?.options || {};
  const finalDownloadLink = isInsideThumbnail ? false : downloadlink !== undefined ? downloadlink : !!globalOptions.downloadlink;
  const finalEmbedCode = isInsideThumbnail ? false : embedcode !== undefined ? embedcode : !!globalOptions.embedcode;
  const finalOverlayTitle = overlay_title !== undefined ? overlay_title : globalOptions.overlay_title !== undefined ? !!globalOptions.overlay_title : true;
  const finalShowBackground = showBackground !== undefined ? showBackground : globalOptions.showBackground !== undefined ? !!globalOptions.showBackground : true;
  let placeholder = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Video Title', 'video-embed-thumbnail-generator');
  if (postId) {
    placeholder = attachmentTitle ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('(Untitled Video)', 'video-embed-thumbnail-generator') : '';
  }
  const titleClass = isInsideThumbnail ? 'videopack-thumbnail-title-text' : isOverlay ? 'videopack-title' : 'videopack-video-title';
  const iconsClass = 'videopack-meta-icons';
  const finalBlockProps = blockProps || {
    className: `videopack-video-title-block videopack-video-title-wrapper ${vpContext.classes} ${isOverlay ? `is-overlay position-${position}` : ''} ${isInsideThumbnail ? 'is-inside-thumbnail' : ''} ${isInsidePlayerOverlay ? 'is-inside-player' : ''} ${!postId && !manualTitle ? 'no-title' : ''} has-text-align-${finalTextAlign}`,
    style: vpContext.style
  };
  const barClass = `videopack-video-title ${isOverlay ? 'is-overlay' : ''} ${!showBackground && isOverlay ? 'has-no-background' : ''} ${isInsideThumbnail ? 'videopack-thumbnail-title' : ''} ${isInsidePlayerOverlay ? `videopack-title-${position}` : ''}`.trim();
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsxs)("div", {
    ...finalBlockProps,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)("button", {
      className: `videopack-click-trap${shareIsOpen ? ' is-visible' : ''}`,
      onClick: () => {
        setShareIsOpen(false);
      },
      "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Close share overlay', 'video-embed-thumbnail-generator')
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsxs)("div", {
      className: `${barClass} has-text-align-${finalTextAlign}`,
      children: [finalOverlayTitle && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.RichText, {
        tagName: Tag,
        className: `${titleClass} ${vpContext.classes} ${linkToPost ? 'is-link' : ''}`,
        style: vpContext.style,
        value: displayTitle,
        onChange: onTitleChange,
        placeholder: placeholder,
        allowedFormats: ['core/bold', 'core/italic', 'core/strikethrough']
      }), isOverlay && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsxs)("div", {
        className: iconsClass,
        children: [finalEmbedCode && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)("button", {
          className: `videopack-icons ${shareIsOpen ? 'close' : 'share'}`,
          onClick: () => setShareIsOpen(!shareIsOpen),
          title: shareIsOpen ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Close', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Share', 'video-embed-thumbnail-generator'),
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Icon, {
            icon: shareIsOpen ? _wordpress_icons__WEBPACK_IMPORTED_MODULE_7__["default"] : _wordpress_icons__WEBPACK_IMPORTED_MODULE_10__["default"],
            className: "videopack-icon-svg"
          })
        }), finalDownloadLink && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)("button", {
          className: "videopack-icons download",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Icon, {
            icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_9__["default"],
            className: "videopack-icon-svg"
          })
        })]
      })]
    }), isOverlay && finalEmbedCode && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsxs)("div", {
      className: `videopack-share-container${shareIsOpen ? ' is-visible' : ''}`,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsxs)("span", {
        className: "videopack-embedcode-container",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)("span", {
          className: "videopack-icons embed",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Icon, {
            icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_8__["default"],
            className: "videopack-icon-svg"
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)("span", {
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Embed:', 'video-embed-thumbnail-generator')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)("span", {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)("input", {
            className: "videopack-embed-code",
            type: "text",
            value: currentEmbedCode,
            onClick: e => e.target.select(),
            readOnly: true
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsxs)("span", {
        className: "videopack-start-at-container",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)("input", {
          type: "checkbox",
          className: "videopack-start-at-enable",
          id: `videopack-start-at-enable-block-${randomId}`,
          checked: startAtEnabled,
          onChange: e => setStartAtEnabled(e.target.checked)
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)("label", {
          htmlFor: `videopack-start-at-enable-block-${randomId}`,
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Start at:', 'video-embed-thumbnail-generator')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)("input", {
          type: "text",
          className: "videopack-start-at",
          value: startAtTime,
          onChange: e => setStartAtTime(e.target.value)
        })]
      })]
    })]
  });
}
function Edit(props) {
  const {
    clientId,
    attributes,
    setAttributes,
    context
  } = props;
  const vpContext = (0,_hooks_useVideopackContext__WEBPACK_IMPORTED_MODULE_14__["default"])(attributes, context);
  const {
    postId,
    postType
  } = vpContext.resolved;
  const embedlink = context['videopack/embedlink'];
  const {
    title,
    tagName: Tag = 'h3',
    position: attrPosition,
    isOverlay: explicitIsOverlay,
    textAlign: attrTextAlign,
    downloadlink,
    embedcode,
    title_color,
    title_background_color,
    overlay_title,
    showBackground,
    usePostTitle,
    linkToPost
  } = attributes;
  const isInsideThumbnail = !!context['videopack/isInsideThumbnail'];
  const isInsidePlayerOverlay = !!context['videopack/isInsidePlayerOverlay'];
  const isInsidePlayerContainer = !!context['videopack/isInsidePlayerContainer'];

  // Derived defaults that don't fight with user saved attributes
  const position = attrPosition || (isInsideThumbnail ? 'bottom' : 'top');
  const textAlign = attrTextAlign || (isInsideThumbnail ? 'center' : 'left');
  const globalOptions = videopack_config?.options || {};
  const finalDownloadLink = downloadlink !== undefined ? downloadlink : !!globalOptions.downloadlink;
  const finalEmbedCode = embedcode !== undefined ? embedcode : !!globalOptions.embedcode;
  const finalOverlayTitle = overlay_title !== undefined ? overlay_title : globalOptions.overlay_title !== undefined ? !!globalOptions.overlay_title : true;
  const finalShowBackground = showBackground !== undefined ? showBackground : globalOptions.showBackground !== undefined ? !!globalOptions.showBackground : true;

  // For thumbnails, we only disable share and download features
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (isInsideThumbnail) {
      const newAttributes = {};
      if (attributes.downloadlink) {
        newAttributes.downloadlink = false;
      }
      if (attributes.embedcode) {
        newAttributes.embedcode = false;
      }
      if (Object.keys(newAttributes).length > 0) {
        setAttributes(newAttributes);
      }
    }
  }, [isInsideThumbnail, attributes.downloadlink, attributes.embedcode, setAttributes]);
  const isOverlay = explicitIsOverlay !== undefined ? explicitIsOverlay : isInsideThumbnail || isInsidePlayerOverlay;
  const wrapperClass = 'videopack-video-title-wrapper';
  const THEME_COLORS = videopack_config?.themeColors;
  const colorFallbacks = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_utils_colors__WEBPACK_IMPORTED_MODULE_13__.getColorFallbacks)({
    title_color: vpContext.resolved.title_color,
    title_background_color: vpContext.resolved.title_background_color
  }), [vpContext.resolved.title_color, vpContext.resolved.title_background_color]);
  const blockProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.useBlockProps)({
    className: `videopack-video-title-block ${wrapperClass} ${vpContext.classes} ${isOverlay ? `is-overlay position-${position}` : ''} ${isInsideThumbnail ? 'is-inside-thumbnail' : ''} ${isInsidePlayerOverlay ? 'is-inside-player' : ''} ${!postId && !title ? 'no-title' : ''} has-text-align-${textAlign}`,
    style: vpContext.style
  });
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsxs)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.BlockControls, {
      group: "block",
      children: [!isInsideThumbnail && !isInsidePlayerOverlay && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.HeadingLevelDropdown, {
        value: Tag.replace('h', '') * 1,
        onChange: newLevel => setAttributes({
          tagName: `h${newLevel}`
        })
      }), isOverlay && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.BlockVerticalAlignmentControl, {
        value: position,
        onChange: nextPosition => {
          setAttributes({
            position: nextPosition || undefined
          });
        }
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.AlignmentControl, {
        value: textAlign,
        onChange: nextAlign => {
          setAttributes({
            textAlign: nextAlign
          });
        }
      }), (isInsidePlayerOverlay || isInsidePlayerContainer) && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarGroup, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarButton, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_11__["default"],
          label: finalOverlayTitle ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Hide Title', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Show Title', 'video-embed-thumbnail-generator'),
          isPressed: finalOverlayTitle,
          onClick: () => setAttributes({
            overlay_title: !finalOverlayTitle
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarButton, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_10__["default"],
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Embed/Share Button', 'video-embed-thumbnail-generator'),
          isPressed: finalEmbedCode,
          onClick: () => setAttributes({
            embedcode: !finalEmbedCode
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarButton, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_9__["default"],
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Download Button', 'video-embed-thumbnail-generator'),
          isPressed: finalDownloadLink,
          onClick: () => setAttributes({
            downloadlink: !finalDownloadLink
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarButton, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_6__["default"],
          label: finalShowBackground ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Hide Background Bar', 'video-embed-thumbnail-generator') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Show Background Bar', 'video-embed-thumbnail-generator'),
          isPressed: finalShowBackground,
          onClick: () => setAttributes({
            showBackground: !finalShowBackground
          })
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsxs)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.InspectorControls, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Data Settings', 'video-embed-thumbnail-generator'),
        initialOpen: true,
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToggleControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Use Post Title', 'video-embed-thumbnail-generator'),
          help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('When enabled, this block will display the title of the parent post instead of the video title.', 'video-embed-thumbnail-generator'),
          checked: usePostTitle,
          onChange: value => setAttributes({
            usePostTitle: value
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToggleControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Make title a link', 'video-embed-thumbnail-generator'),
          help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('When enabled, the title will link to the parent post.', 'video-embed-thumbnail-generator'),
          checked: linkToPost,
          onChange: value => setAttributes({
            linkToPost: value
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Colors', 'video-embed-thumbnail-generator'),
        initialOpen: true,
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsxs)("div", {
          className: "videopack-color-section",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)("p", {
            className: "videopack-settings-section-title",
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Title Bar', 'video-embed-thumbnail-generator')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsxs)("div", {
            className: "videopack-color-flex-row",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(_components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_12__["default"], {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Text', 'video-embed-thumbnail-generator'),
                value: title_color,
                onChange: value => setAttributes({
                  title_color: value
                }),
                colors: THEME_COLORS,
                fallbackValue: colorFallbacks.title_color
              })
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(_components_CompactColorPicker_CompactColorPicker__WEBPACK_IMPORTED_MODULE_12__["default"], {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Background', 'video-embed-thumbnail-generator'),
                value: title_background_color,
                onChange: value => setAttributes({
                  title_background_color: value
                }),
                colors: THEME_COLORS,
                fallbackValue: colorFallbacks.title_background_color
              })
            })]
          })]
        })
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__.jsx)(VideoTitle, {
      blockProps: blockProps,
      attributes: attributes,
      postId: postId,
      postType: postType,
      clientId: clientId,
      isInsideThumbnail: isInsideThumbnail,
      isInsidePlayerOverlay: isInsidePlayerOverlay,
      isOverlay: isOverlay,
      context: context,
      onTitleChange: newTitle => setAttributes({
        title: newTitle
      }),
      usePostTitle: usePostTitle,
      linkToPost: linkToPost
    })]
  });
}

/***/ },

/***/ "./src/components/CompactColorPicker/CompactColorPicker.js"
/*!*****************************************************************!*\
  !*** ./src/components/CompactColorPicker/CompactColorPicker.js ***!
  \*****************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__);


/**
 * A compact color picker using a dropdown and color palette.
 *
 * @param {Object}   props               Component props.
 * @param {string}   props.label         Label for the color picker.
 * @param {string}   props.value         Current color value.
 * @param {Function} props.onChange      Callback for color change.
 * @param {Array}    props.colors        Available color palette.
 * @param {string}   props.fallbackValue Default color to show when value is empty.
 * @return {Element} The rendered component.
 */

const CompactColorPicker = ({
  label,
  value,
  onChange,
  colors,
  fallbackValue
}) => {
  const resolveValueToHex = val => {
    if (typeof val === 'string' && val.startsWith('var(--wp--preset--color--')) {
      const slug = val.replace('var(--wp--preset--color--', '').replace(')', '');
      const matched = colors?.find(c => c.slug === slug);
      if (matched) {
        return matched.color;
      }
    }
    return val;
  };
  const hexValue = resolveValueToHex(value);
  const displayColor = hexValue || resolveValueToHex(fallbackValue) || 'transparent';
  const handleOnChange = val => {
    if (val === undefined) {
      onChange('');
      return;
    }
    const matched = colors?.find(c => c.color === val);
    if (matched && matched.slug) {
      onChange(`var(--wp--preset--color--${matched.slug})`);
    } else {
      onChange(val);
    }
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("div", {
    className: "videopack-color-picker-container",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("span", {
      className: "videopack-color-picker-label",
      children: label
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Dropdown, {
      className: "videopack-color-dropdown",
      contentClassName: "videopack-color-dropdown-content",
      renderToggle: ({
        isOpen,
        onToggle
      }) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        onClick: onToggle,
        "aria-expanded": isOpen,
        variant: "secondary",
        className: "videopack-color-picker-button",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ColorIndicator, {
          colorValue: displayColor
        })
      }),
      renderContent: () => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("div", {
        className: "videopack-color-picker-palette-wrapper",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ColorPalette, {
          colors: colors,
          value: hexValue === '' ? undefined : hexValue,
          onChange: handleOnChange,
          disableCustomColors: false,
          clearable: true
        })
      })
    })]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (CompactColorPicker);

/***/ },

/***/ "./src/hooks/useVideopackContext.js"
/*!******************************************!*\
  !*** ./src/hooks/useVideopackContext.js ***!
  \******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DESIGN_KEYS: () => (/* binding */ DESIGN_KEYS),
/* harmony export */   "default": () => (/* binding */ useVideopackContext)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _utils_context__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/context */ "./src/utils/context.js");



const DESIGN_KEYS = ['skin', 'title_color', 'title_background_color', 'play_button_color', 'play_button_secondary_color', 'control_bar_bg_color', 'control_bar_color', 'pagination_color', 'pagination_background_color', 'pagination_active_bg_color', 'pagination_active_color', 'watermark', 'watermark_styles', 'watermark_link_to', 'align', 'gallery_per_page', 'enable_collection_video_limit', 'collection_video_limit', 'prioritizePostData', 'embed_method'];

/**
 * Hook to resolve Videopack design context and generate styles/classes.
 *
 * @param {Object} attributes Block attributes.
 * @param {Object} context    Block context.
 * @return {Object} Resolved values, styles, and classes.
 */
function useVideopackContext(attributes, context) {
  // 1. Initial Synchronous Resolution
  const initial = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    const resolved = {};
    const style = {};
    const classes = [];
    DESIGN_KEYS.forEach(key => {
      const value = (0,_utils_context__WEBPACK_IMPORTED_MODULE_2__.getEffectiveValue)(key, attributes, context);
      resolved[key] = value;
      if (value) {
        const cssKey = key.replace(/_/g, '-');
        if (typeof value === 'string' || typeof value === 'number') {
          const cssVar = `--videopack-${cssKey}`;
          style[cssVar] = value;
        }

        // Only add classes for colors/styles that are actually set
        if (key !== 'skin') {
          classes.push(`videopack-has-${cssKey}`);
        }
      }
    });

    // Special handling for skin class
    if (resolved.skin && resolved.skin !== 'default') {
      classes.push(resolved.skin);
    }

    // Handle Gutenberg "style" attribute (typography, spacing, etc).
    if (attributes.style && typeof attributes.style === 'object') {
      // Typography Support
      if (attributes.style.typography) {
        const {
          fontSize,
          lineHeight,
          letterSpacing
        } = attributes.style.typography;
        if (fontSize) {
          if (fontSize.startsWith('var:preset|font-size|')) {
            const slug = fontSize.split('|').pop();
            style.fontSize = `var(--wp--preset--font-size--${slug})`;
          } else {
            style.fontSize = fontSize;
          }
        }
        if (lineHeight) style.lineHeight = lineHeight;
        if (letterSpacing) style.letterSpacing = letterSpacing;
      }

      // Spacing Support (Margin/Padding)
      if (attributes.style.spacing) {
        Object.entries(attributes.style.spacing).forEach(([type, values]) => {
          if (values && typeof values === 'object') {
            Object.entries(values).forEach(([dir, val]) => {
              let finalVal = val;
              if (typeof val === 'string' && val.startsWith('var:preset|spacing|')) {
                const slug = val.split('|').pop();
                finalVal = `var(--wp--preset--spacing--${slug})`;
              }
              style[`${type}${dir.charAt(0).toUpperCase()}${dir.slice(1)}`] = finalVal;
            });
          }
        });
      }
    }
    resolved.isEditingAllPages = !!(0,_utils_context__WEBPACK_IMPORTED_MODULE_2__.getEffectiveValue)('isEditingAllPages', attributes, context);
    resolved.prioritizePostData = !!(0,_utils_context__WEBPACK_IMPORTED_MODULE_2__.getEffectiveValue)('prioritizePostData', attributes, context);

    // Core data identification
    resolved.postId = (0,_utils_context__WEBPACK_IMPORTED_MODULE_2__.getEffectiveValue)('postId', attributes, context);
    resolved.attachmentId = (0,_utils_context__WEBPACK_IMPORTED_MODULE_2__.getEffectiveValue)('attachmentId', attributes, context);
    resolved.postType = (0,_utils_context__WEBPACK_IMPORTED_MODULE_2__.getEffectiveValue)('postType', attributes, context);

    // Handle Gutenberg Typography Classes (Presets)
    if (attributes.fontSize) {
      classes.push(`has-${attributes.fontSize}-font-size`);
    }
    if (attributes.fontFamily) {
      classes.push(`has-${attributes.fontFamily}-font-family`);
    }
    return {
      resolved,
      style,
      classes
    };
  }, [attributes, context]);

  // 2. Automatic Video Discovery
  // If we have a postId but no attachmentId, try to find the first video attachment.
  const {
    discoveredAttachmentId,
    isDiscovering
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    const {
      resolved
    } = initial;

    // If we already have an attachmentId, we're not discovering.
    if (resolved.attachmentId) {
      return {
        discoveredAttachmentId: resolved.attachmentId,
        isDiscovering: false
      };
    }

    // If we don't even have a postId, we can't discover anything.
    if (!resolved.postId || resolved.postId < 1) {
      return {
        discoveredAttachmentId: null,
        isDiscovering: false
      };
    }

    // If the postId itself IS an attachment, then that's our attachmentId.
    if (resolved.postType === 'attachment') {
      return {
        discoveredAttachmentId: resolved.postId,
        isDiscovering: false
      };
    }

    // Otherwise, try to find the first video attachment for this post.
    const {
      getEntityRecords
    } = select('core');
    const query = {
      parent: resolved.postId,
      mime_type: 'video',
      per_page: 1,
      _fields: 'id'
    };
    const attachments = getEntityRecords('postType', 'attachment', query);
    const isResolving = select('core/data').isResolving('core', 'getEntityRecords', ['postType', 'attachment', query]);
    const foundId = attachments?.[0]?.id || null;
    return {
      discoveredAttachmentId: foundId,
      isDiscovering: isResolving || !foundId && attachments === undefined
    };
  }, [initial.resolved.postId, initial.resolved.attachmentId, initial.resolved.postType]);
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    const rawAttachmentId = discoveredAttachmentId || initial.resolved.attachmentId;

    // Safety: If the resolved attachment ID is the same as the post ID, 
    // and we know the post is NOT an attachment, then it's a false resolution.
    const finalAttachmentId = rawAttachmentId && rawAttachmentId === initial.resolved.postId && initial.resolved.postType && initial.resolved.postType !== 'attachment' ? null : rawAttachmentId;
    const finalResolved = {
      ...initial.resolved,
      attachmentId: finalAttachmentId,
      isDiscovering
    };
    return {
      resolved: finalResolved,
      style: initial.style,
      classes: initial.classes.join(' ')
    };
  }, [initial, discoveredAttachmentId, isDiscovering]);
}

/***/ },

/***/ "./src/utils/colors.js"
/*!*****************************!*\
  !*** ./src/utils/colors.js ***!
  \*****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getColorFallbacks: () => (/* binding */ getColorFallbacks)
/* harmony export */ });
const getColorFallbacks = settings => {
  const {
    embed_method = 'Video.js',
    skin = 'vjs-theme-videopack'
  } = settings || {};
  const fallbacks = {
    title_color: settings?.title_color || '#ffffff',
    title_background_color: settings?.title_background_color || '#2b333f',
    play_button_color: settings?.play_button_color || '#ffffff',
    play_button_secondary_color: settings?.play_button_secondary_color || '#ffffff',
    control_bar_bg_color: settings?.control_bar_bg_color || '#2b333f',
    control_bar_color: settings?.control_bar_color || '#ffffff',
    pagination_color: settings?.pagination_color || '#1e1e1e',
    pagination_background_color: settings?.pagination_background_color || '#ffffff',
    pagination_active_bg_color: settings?.pagination_active_bg_color || '#1e1e1e',
    pagination_active_color: settings?.pagination_active_color || '#ffffff'
  };
  if (embed_method === 'WordPress Default') {
    fallbacks.title_background_color = 'rgba(40, 40, 40, 0.95)';
    fallbacks.control_bar_bg_color = '#222222';
    fallbacks.play_button_color = '#ffffff';
    fallbacks.play_button_secondary_color = '#ffffff';
  } else if (embed_method?.startsWith('Video.js')) {
    // Default skin (vjs-theme-videopack) defaults
    fallbacks.play_button_color = '#ffffff';
    fallbacks.play_button_secondary_color = '#2b333f'; // Videopack Grey accent

    switch (skin) {
      case 'vjs-theme-city':
        fallbacks.title_background_color = '#bf3b4d';
        fallbacks.control_bar_bg_color = '#000000';
        fallbacks.pagination_active_bg_color = settings?.pagination_active_bg_color || '#bf3b4d';
        break;
      case 'vjs-theme-fantasy':
        fallbacks.title_background_color = '#9f44b4';
        fallbacks.play_button_secondary_color = '#9f44b4';
        fallbacks.pagination_active_bg_color = settings?.pagination_active_bg_color || '#9f44b4';
        break;
      case 'vjs-theme-forest':
        fallbacks.title_background_color = '#6fb04e';
        fallbacks.play_button_secondary_color = '#6fb04e';
        fallbacks.control_bar_bg_color = 'transparent';
        fallbacks.pagination_active_bg_color = settings?.pagination_active_bg_color || '#6fb04e';
        break;
      case 'vjs-theme-sea':
        fallbacks.title_background_color = '#4176bc';
        fallbacks.play_button_secondary_color = '#4176bc';
        fallbacks.control_bar_bg_color = 'rgba(255, 255, 255, 0.4)';
        fallbacks.pagination_active_bg_color = settings?.pagination_active_bg_color || '#4176bc';
        break;
      case 'kg-video-js-skin':
        fallbacks.title_background_color = '#000000';
        fallbacks.play_button_secondary_color = '#000000';
        fallbacks.control_bar_bg_color = '#000000';
        fallbacks.pagination_active_bg_color = settings?.pagination_active_bg_color || '#000000';
        break;
    }
  }
  return fallbacks;
};

/***/ },

/***/ "./src/utils/context.js"
/*!******************************!*\
  !*** ./src/utils/context.js ***!
  \******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getEffectiveValue: () => (/* binding */ getEffectiveValue),
/* harmony export */   normalizeSourceGroups: () => (/* binding */ normalizeSourceGroups)
/* harmony export */ });
/* global videopack_config */

/**
 * Resolves an effective design value by checking local overrides, inherited context,
 * and finally global plugin defaults.
 *
 * @param {string} key      The key to resolve (e.g., 'skin', 'title_color').
 * @param {Object} attributes The block's own attributes.
 * @param {Object} context    The inherited block context.
 * @return {*} The resolved value.
 */
const getEffectiveValue = (key, attributes = {}, context = {}) => {
  const contextKey = key.includes('/') ? key : `videopack/${key}`;
  const attrKey = key.includes('/') ? key.split('/')[1] : key;

  // Helper to check if a value is valid (not undefined, null, or empty string)
  const isValid = val => val !== undefined && val !== null;

  // 1. Check local attribute override
  if (isValid(attributes[attrKey])) {
    return attributes[attrKey];
  }
  if (attrKey === 'attachmentId' && isValid(attributes.id)) {
    return attributes.id;
  }
  if (attrKey === 'postId' && isValid(attributes.id)) {
    return attributes.id;
  }

  // 2. Check inherited context (from Collection or Video block)
  if (isValid(context[contextKey])) {
    return context[contextKey];
  }

  // 2b. Check standard Gutenberg context fallbacks
  if ((attrKey === 'postId' || attrKey === 'postType') && isValid(context[attrKey])) {
    return context[attrKey];
  }

  // 3. Fallback to global plugin defaults
  const globalOptions = videopack_config?.options || {};
  const globalDefaults = videopack_config?.defaults || {};
  if (attrKey === 'skin') {
    const localValue = attributes[attrKey] || context[contextKey];
    if (isValid(localValue)) {
      return localValue;
    }
    return globalOptions.skin || globalDefaults.skin || videopack_config?.skin || 'vjs-theme-videopack';
  }
  if (attrKey === 'align') {
    const localValue = attributes[attrKey] || context[contextKey];
    if (isValid(localValue)) {
      return localValue;
    }
    // Collections use gallery_align as their global default
    const isCollection = attributes.layout || context['videopack/layout'];
    if (isCollection) {
      return globalOptions.gallery_align || globalOptions.align || globalDefaults.align || '';
    }
    return globalOptions.align || globalDefaults.align || '';
  }
  const globalValue = globalOptions[attrKey] ?? globalDefaults[attrKey] ?? videopack_config?.[attrKey];
  const finalValue = isValid(globalValue) ? globalValue : undefined;
  return finalValue;
};

/**
 * Normalizes video sources from the API into source_groups for the player.
 *
 * @param {Object} videoSources Grouped sources returned from the API.
 * @return {Object} Grouped sources.
 */
const normalizeSourceGroups = videoSources => {
  if (!videoSources || typeof videoSources !== 'object') {
    return {};
  }

  // If it's already in the grouped format { codecId: { label, sources } }, return it
  return videoSources;
};

/***/ },

/***/ "./src/blocks/video-title/editor.scss"
/*!********************************************!*\
  !*** ./src/blocks/video-title/editor.scss ***!
  \********************************************/
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

/***/ "@wordpress/block-editor"
/*!*************************************!*\
  !*** external ["wp","blockEditor"] ***!
  \*************************************/
(module) {

module.exports = window["wp"]["blockEditor"];

/***/ },

/***/ "@wordpress/blocks"
/*!********************************!*\
  !*** external ["wp","blocks"] ***!
  \********************************/
(module) {

module.exports = window["wp"]["blocks"];

/***/ },

/***/ "@wordpress/components"
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
(module) {

module.exports = window["wp"]["components"];

/***/ },

/***/ "@wordpress/data"
/*!******************************!*\
  !*** external ["wp","data"] ***!
  \******************************/
(module) {

module.exports = window["wp"]["data"];

/***/ },

/***/ "@wordpress/element"
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
(module) {

module.exports = window["wp"]["element"];

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

/***/ "./node_modules/@wordpress/icons/build-module/library/background.mjs"
/*!***************************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/background.mjs ***!
  \***************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ background_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/background.tsx


var background_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { fillRule: "evenodd", clipRule: "evenodd", d: "M11.53 4.47a.75.75 0 1 0-1.06 1.06l8 8a.75.75 0 1 0 1.06-1.06l-8-8Zm5 1a.75.75 0 1 0-1.06 1.06l2 2a.75.75 0 1 0 1.06-1.06l-2-2Zm-11.06 10a.75.75 0 0 1 1.06 0l2 2a.75.75 0 1 1-1.06 1.06l-2-2a.75.75 0 0 1 0-1.06Zm.06-5a.75.75 0 0 0-1.06 1.06l8 8a.75.75 0 1 0 1.06-1.06l-8-8Zm-.06-3a.75.75 0 0 1 1.06 0l10 10a.75.75 0 1 1-1.06 1.06l-10-10a.75.75 0 0 1 0-1.06Zm3.06-2a.75.75 0 0 0-1.06 1.06l10 10a.75.75 0 1 0 1.06-1.06l-10-10Z" }) });

//# sourceMappingURL=background.mjs.map


/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/close.mjs"
/*!**********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/close.mjs ***!
  \**********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ close_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/close.tsx


var close_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "m13.06 12 6.47-6.47-1.06-1.06L12 10.94 5.53 4.47 4.47 5.53 10.94 12l-6.47 6.47 1.06 1.06L12 13.06l6.47 6.47 1.06-1.06L13.06 12Z" }) });

//# sourceMappingURL=close.mjs.map


/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/code.mjs"
/*!*********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/code.mjs ***!
  \*********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ code_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/code.tsx


var code_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M20.8 10.7l-4.3-4.3-1.1 1.1 4.3 4.3c.1.1.1.3 0 .4l-4.3 4.3 1.1 1.1 4.3-4.3c.7-.8.7-1.9 0-2.6zM4.2 11.8l4.3-4.3-1-1-4.3 4.3c-.7.7-.7 1.8 0 2.5l4.3 4.3 1.1-1.1-4.3-4.3c-.2-.1-.2-.3-.1-.4z" }) });

//# sourceMappingURL=code.mjs.map


/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/download.mjs"
/*!*************************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/download.mjs ***!
  \*************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ download_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/download.tsx


var download_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M18 11.3l-1-1.1-4 4V3h-1.5v11.3L7 10.2l-1 1.1 6.2 5.8 5.8-5.8zm.5 3.7v3.5h-13V15H4v5h16v-5h-1.5z" }) });

//# sourceMappingURL=download.mjs.map


/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/share.mjs"
/*!**********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/share.mjs ***!
  \**********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ share_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/share.tsx


var share_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M9 11.8l6.1-4.5c.1.4.4.7.9.7h2c.6 0 1-.4 1-1V5c0-.6-.4-1-1-1h-2c-.6 0-1 .4-1 1v.4l-6.4 4.8c-.2-.1-.4-.2-.6-.2H6c-.6 0-1 .4-1 1v2c0 .6.4 1 1 1h2c.2 0 .4-.1.6-.2l6.4 4.8v.4c0 .6.4 1 1 1h2c.6 0 1-.4 1-1v-2c0-.6-.4-1-1-1h-2c-.5 0-.8.3-.9.7L9 12.2v-.4z" }) });

//# sourceMappingURL=share.mjs.map


/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/title.mjs"
/*!**********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/title.mjs ***!
  \**********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ title_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/title.tsx


var title_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "m4 5.5h2v6.5h1.5v-6.5h2v-1.5h-5.5zm16 10.5h-16v-1.5h16zm-7 4h-9v-1.5h9z" }) });

//# sourceMappingURL=title.mjs.map


/***/ },

/***/ "./src/blocks/video-title/block.json"
/*!*******************************************!*\
  !*** ./src/blocks/video-title/block.json ***!
  \*******************************************/
(module) {

module.exports = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"videopack/video-title","title":"Video Title","category":"media","parent":["videopack/videopack-video","videopack/video-player-engine","videopack/thumbnail","videopack/video-loop"],"icon":"heading","description":"Overlay title and action buttons for the video player.","usesContext":["postId","postType","videopack/postId","videopack/postType","videopack/parentPostId","videopack/prioritizePostData","videopack/skin","videopack/embedlink","videopack/title","videopack/isInsideThumbnail","videopack/isInsidePlayerOverlay","videopack/isInsidePlayerContainer"],"attributes":{"title":{"type":"string","default":""},"tagName":{"type":"string","default":"h3"},"isOverlay":{"type":"boolean"},"title_color":{"type":"string"},"title_background_color":{"type":"string"},"position":{"type":"string"},"textAlign":{"type":"string"},"embedlink":{"type":"string"},"embedcode":{"type":"boolean"},"downloadlink":{"type":"boolean"},"overlay_title":{"type":"boolean"},"showBackground":{"type":"boolean"},"usePostTitle":{"type":"boolean","default":false},"linkToPost":{"type":"boolean","default":false}},"supports":{"html":false,"reusable":false,"typography":{"fontSize":true,"lineHeight":true}},"textdomain":"video-embed-thumbnail-generator","editorScript":"file:./index.js","editorStyle":"file:./index.css"}');

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
  !*** ./src/blocks/video-title/index.js ***!
  \*****************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/blocks */ "@wordpress/blocks");
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _edit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./edit */ "./src/blocks/video-title/edit.js");
/* harmony import */ var _block_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./block.json */ "./src/blocks/video-title/block.json");



(0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__.registerBlockType)(_block_json__WEBPACK_IMPORTED_MODULE_2__.name, {
  edit: _edit__WEBPACK_IMPORTED_MODULE_1__["default"],
  save: () => null // Dynamic block
});
})();

/******/ })()
;
//# sourceMappingURL=index.js.map