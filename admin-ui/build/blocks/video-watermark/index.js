/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/blocks/video-watermark/edit.js"
/*!********************************************!*\
  !*** ./src/blocks/video-watermark/edit.js ***!
  \********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   VideoWatermark: () => (/* binding */ VideoWatermark),
/* harmony export */   "default": () => (/* binding */ Edit),
/* harmony export */   getWatermarkBlockStyles: () => (/* binding */ getWatermarkBlockStyles)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _components_WatermarkPositioner_WatermarkPositioner__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../components/WatermarkPositioner/WatermarkPositioner */ "./src/components/WatermarkPositioner/WatermarkPositioner.js");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/download.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/home.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/image.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/link.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/not-allowed.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/page.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/post.mjs");
/* harmony import */ var _utils_context__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../utils/context */ "./src/utils/context.js");
/* harmony import */ var _editor_scss__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./editor.scss */ "./src/blocks/video-watermark/editor.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__);
/* global ResizeObserver */










/**
 * Internal component to display the watermark with correct positioning and fallback.
 *
 * @param {Object} props         Component props.
 * @param {Object} props.context Block context.
 * @return {Object} The rendered component.
 */

function VideoWatermark({
  watermark,
  watermark_scale,
  watermark_align,
  watermark_valign,
  watermark_x,
  watermark_y,
  context = {},
  isBlockEditor = false,
  onDimensions = null
}) {
  const watermarkProps = {
    watermark,
    watermark_scale,
    watermark_align,
    watermark_valign,
    watermark_x,
    watermark_y
  };
  const effectiveUrl = (0,_utils_context__WEBPACK_IMPORTED_MODULE_12__.getEffectiveValue)('watermark', {
    watermark
  }, context);
  const getEffective = (attrKey, contextKey, fallback) => {
    if (watermarkProps[attrKey] !== undefined && watermarkProps[attrKey] !== null && watermarkProps[attrKey] !== '') {
      return watermarkProps[attrKey];
    }
    const styles = (0,_utils_context__WEBPACK_IMPORTED_MODULE_12__.getEffectiveValue)('watermark_styles', {}, context);
    if (styles && typeof styles === 'object' && styles[contextKey] !== undefined) {
      return styles[contextKey];
    }
    return (0,_utils_context__WEBPACK_IMPORTED_MODULE_12__.getEffectiveValue)(`watermark_${contextKey}`, {}, context) ?? fallback;
  };
  const effectiveScale = getEffective('watermark_scale', 'scale', 10);
  const effectiveAlign = getEffective('watermark_align', 'align', 'right');
  const effectiveValign = getEffective('watermark_valign', 'valign', 'bottom');
  const effectiveX = getEffective('watermark_x', 'x', 5);
  const effectiveY = getEffective('watermark_y', 'y', 7);
  const skin = (0,_utils_context__WEBPACK_IMPORTED_MODULE_12__.getEffectiveValue)('skin', {}, context);
  const actualAlign = effectiveAlign || 'right';
  const actualValign = effectiveValign || 'bottom';
  const actualX = effectiveX !== undefined && effectiveX !== '' ? effectiveX : 5;
  const actualY = effectiveY !== undefined && effectiveY !== '' ? effectiveY : 7;
  const actualScale = effectiveScale !== undefined && effectiveScale !== '' ? effectiveScale : 10;
  const style = {
    position: isBlockEditor ? 'relative' : 'absolute',
    width: effectiveUrl ? `${actualScale}%` : '260px',
    height: 'auto',
    pointerEvents: 'auto',
    transform: ''
  };

  // X Positioning
  if (actualAlign === 'center') {
    style.left = '50%';
    style.transform += 'translateX(-50%) ';
    style.marginLeft = `${-actualX}%`;
  } else {
    style[actualAlign] = `${actualX}%`;
  }

  // Y Positioning
  if (actualValign === 'center') {
    style.top = '50%';
    style.transform += 'translateY(-50%) ';
    style.marginTop = `${-actualY}%`;
  } else {
    style[actualValign] = `${actualY}%`;
  }
  if (!style.transform || isBlockEditor) {
    delete style.transform;
  }
  if (isBlockEditor) {
    delete style.left;
    delete style.right;
    delete style.top;
    delete style.bottom;
    delete style.marginLeft;
    delete style.marginTop;
    style.width = '100%'; // Inner container fills the outer block
  }
  if (!effectiveUrl) {
    return null;
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)("div", {
    className: `videopack-video-watermark ${skin}`,
    style: style,
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)("img", {
      src: effectiveUrl,
      alt: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Watermark', 'video-embed-thumbnail-generator'),
      style: {
        display: 'block',
        width: '100%',
        height: 'auto'
      },
      onLoad: e => {
        if (onDimensions && e.target.naturalWidth && e.target.naturalHeight) {
          const ratio = e.target.naturalWidth / e.target.naturalHeight;
          onDimensions(ratio);
        }
      }
    })
  });
}

/**
 * Helper to calculate watermark positioning styles for the block wrapper.
 */
function getWatermarkBlockStyles(attributes, context) {
  const effectiveUrl = (0,_utils_context__WEBPACK_IMPORTED_MODULE_12__.getEffectiveValue)('watermark', attributes, context);
  if (!effectiveUrl) {
    return {};
  }
  const getEffective = (attrKey, contextKey, fallback) => {
    if (attributes[attrKey] !== undefined && attributes[attrKey] !== null && attributes[attrKey] !== '') {
      return attributes[attrKey];
    }
    const styles = (0,_utils_context__WEBPACK_IMPORTED_MODULE_12__.getEffectiveValue)('watermark_styles', attributes, context);
    if (styles && typeof styles === 'object' && styles[contextKey] !== undefined) {
      return styles[contextKey];
    }
    return (0,_utils_context__WEBPACK_IMPORTED_MODULE_12__.getEffectiveValue)(`watermark_${contextKey}`, attributes, context) ?? fallback;
  };
  const effectiveScale = getEffective('watermark_scale', 'scale', 10);
  const effectiveAlign = getEffective('watermark_align', 'align', 'right');
  const effectiveValign = getEffective('watermark_valign', 'valign', 'bottom');
  const effectiveX = getEffective('watermark_x', 'x', 5);
  const effectiveY = getEffective('watermark_y', 'y', 7);
  const style = {
    position: 'absolute',
    width: `${effectiveScale}%`,
    minWidth: '20px',
    // Prevent total collapse
    minHeight: '20px',
    height: 'auto',
    transform: ''
  };
  if (effectiveAlign === 'center') {
    style.left = '50%';
    style.transform += 'translateX(-50%) ';
    style.marginLeft = `${-effectiveX}%`;
  } else {
    style[effectiveAlign] = `${effectiveX}%`;
  }
  if (effectiveValign === 'center') {
    style.top = '50%';
    style.transform += 'translateY(-50%) ';
    style.marginTop = `${-effectiveY}%`;
  } else {
    style[effectiveValign] = `${effectiveY}%`;
  }
  if (!style.transform) delete style.transform;
  return style;
}

/**
 * Edit component for the Video Watermark block.
 *
 * @param {Object}   props               Component props.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Function to update block attributes.
 * @param {Object}   props.context       Block context.
 *
 * @return {Object} The component.
 */
function Edit({
  attributes,
  setAttributes,
  context,
  isSelected
}) {
  const containerRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useRef)(null);
  const [containerDimensions, setContainerDimensions] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(null);
  const [detectedAspectRatio, setDetectedAspectRatio] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(null);

  // Measure the parent container dimensions for accurate positioning.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    if (!containerRef.current) {
      return;
    }
    const updateDimensions = () => {
      if (!containerRef.current) {
        return;
      }
      const element = containerRef.current;

      // Find the most specific media container to ensure accurate pixel calculations
      const container = element.closest('.videopack-player, .videopack-video-thumbnail-preview, .videopack-wrapper, .videopack-video-block-container, .wp-block-videopack-videopack-video');
      if (container) {
        const rect = container.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setContainerDimensions({
            width: rect.width,
            height: rect.height
          });
        }
      }
    };
    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    const container = containerRef.current.closest('.videopack-player, .videopack-video-thumbnail-preview, .videopack-wrapper, .videopack-video-block-container, .wp-block-videopack-videopack-video');
    if (container) {
      observer.observe(container);
    }
    return () => observer.disconnect();
  }, []);
  const {
    watermark,
    watermark_scale = 10,
    watermark_align = 'right',
    watermark_valign = 'bottom',
    watermark_x = 5,
    watermark_y = 7,
    watermark_link_to = 'false',
    watermark_url = ''
  } = attributes;

  // Resolve effective values with correct priority:
  // Individual attribute -> Composite context object -> Individual context key -> Default
  const getEffective = (attrKey, contextKey, fallback) => {
    // 1. Local attribute ALWAYS wins if it's explicitly set (and not just defaulting)
    if (attributes[attrKey] !== undefined && attributes[attrKey] !== null && attributes[attrKey] !== '') {
      return attributes[attrKey];
    }
    // 2. Try the composite styles object from context
    const styles = (0,_utils_context__WEBPACK_IMPORTED_MODULE_12__.getEffectiveValue)('watermark_styles', attributes, context);
    if (styles && typeof styles === 'object' && styles[contextKey] !== undefined) {
      return styles[contextKey];
    }
    // 3. Try individual context key
    return (0,_utils_context__WEBPACK_IMPORTED_MODULE_12__.getEffectiveValue)(`watermark_${contextKey}`, attributes, context) ?? fallback;
  };
  const effectiveUrl = (0,_utils_context__WEBPACK_IMPORTED_MODULE_12__.getEffectiveValue)('watermark', attributes, context);
  const effectiveScale = getEffective('watermark_scale', 'scale', 10);
  const effectiveAlign = getEffective('watermark_align', 'align', 'right');
  const effectiveValign = getEffective('watermark_valign', 'valign', 'bottom');
  const effectiveX = getEffective('watermark_x', 'x', 5);
  const effectiveY = getEffective('watermark_y', 'y', 7);
  const effectiveLinkToType = (0,_utils_context__WEBPACK_IMPORTED_MODULE_12__.getEffectiveValue)('watermark_link_to', attributes, context) || 'false';
  const effectiveCustomLinkUrl = (0,_utils_context__WEBPACK_IMPORTED_MODULE_12__.getEffectiveValue)('watermark_url', attributes, context) || '';
  const isInsideThumbnail = !!context['videopack/isInsideThumbnail'];
  const isInsidePlayerOverlay = !!context['videopack/isInsidePlayerOverlay'];
  const isOverlay = isInsideThumbnail || isInsidePlayerOverlay;
  const overlayStyles = isOverlay ? getWatermarkBlockStyles(attributes, context) : {};

  // Implementation of Full-Frame Selection mode:
  // When selected, the block expands to fill the entire container to allow dragging everywhere.
  const activeOverlayStyles = isOverlay && isSelected ? {
    ...overlayStyles,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    maxWidth: 'none',
    marginLeft: 0,
    marginTop: 0,
    transform: 'none'
  } : overlayStyles;
  const blockProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.useBlockProps)({
    className: `videopack-video-watermark-block ${isOverlay ? 'is-overlay' : ''} ${isSelected ? 'is-selected' : ''}`,
    style: activeOverlayStyles
  });
  if (!effectiveUrl) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)("div", {
      ...blockProps,
      className: "videopack-video-watermark-placeholder",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.MediaPlaceholder, {
        icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_7__["default"],
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Watermark Image', 'video-embed-thumbnail-generator'),
        onSelect: media => setAttributes({
          watermark: media.url
        }),
        accept: "image/*",
        allowedTypes: ['image']
      })
    });
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)("div", {
    ...blockProps,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.BlockControls, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.MediaReplaceFlow, {
        mediaURL: watermark,
        allowedTypes: ['image'],
        accept: "image/*",
        onSelect: media => setAttributes({
          watermark: media.url
        }),
        name: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Replace Watermark', 'video-embed-thumbnail-generator')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarGroup, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Link To', 'video-embed-thumbnail-generator'),
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarButton, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_9__["default"],
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('No Link', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            watermark_link_to: 'false'
          }),
          isPressed: effectiveLinkToType === 'false'
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarButton, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_6__["default"],
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Link to Home Page', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            watermark_link_to: 'home'
          }),
          isPressed: effectiveLinkToType === 'home'
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarButton, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_11__["default"],
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Link to Parent Post', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            watermark_link_to: 'parent'
          }),
          isPressed: effectiveLinkToType === 'parent'
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarButton, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_5__["default"],
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Download Video', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            watermark_link_to: 'download'
          }),
          isPressed: effectiveLinkToType === 'download'
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarButton, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_10__["default"],
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Link to Attachment Page', 'video-embed-thumbnail-generator'),
          onClick: () => setAttributes({
            watermark_link_to: 'attachment'
          }),
          isPressed: effectiveLinkToType === 'attachment'
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Dropdown, {
          popoverProps: {
            position: 'bottom center',
            className: 'videopack-url-popover'
          },
          renderToggle: ({
            isOpen,
            onToggle
          }) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarButton, {
            icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_8__["default"],
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Link to Custom URL', 'video-embed-thumbnail-generator'),
            onClick: () => {
              setAttributes({
                watermark_link_to: 'custom'
              });
              onToggle();
            },
            "aria-expanded": isOpen,
            isPressed: effectiveLinkToType === 'custom'
          }),
          renderContent: () => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)("div", {
            style: {
              padding: '12px',
              minWidth: '260px'
            },
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextControl, {
              __nextHasNoMarginBottom: true,
              __next40pxDefaultSize: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Custom URL', 'video-embed-thumbnail-generator'),
              value: watermark_url,
              placeholder: "https://...",
              onChange: value => setAttributes({
                watermark_url: value
              })
            })
          })
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.InspectorControls, {
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Watermark Settings', 'video-embed-thumbnail-generator'),
        initialOpen: true,
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.RangeControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Scale (%)', 'video-embed-thumbnail-generator'),
          value: effectiveScale,
          onChange: value => setAttributes({
            watermark_scale: value
          }),
          min: 1,
          max: 100
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)("div", {
          style: {
            display: 'flex',
            gap: '10px'
          },
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Horizontal Align', 'video-embed-thumbnail-generator'),
            value: effectiveAlign,
            options: [{
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Left', 'video-embed-thumbnail-generator'),
              value: 'left'
            }, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Center', 'video-embed-thumbnail-generator'),
              value: 'center'
            }, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Right', 'video-embed-thumbnail-generator'),
              value: 'right'
            }],
            onChange: value => setAttributes({
              watermark_align: value
            }),
            style: {
              flex: 1
            }
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Vertical Align', 'video-embed-thumbnail-generator'),
            value: effectiveValign,
            options: [{
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Top', 'video-embed-thumbnail-generator'),
              value: 'top'
            }, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Center', 'video-embed-thumbnail-generator'),
              value: 'center'
            }, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Bottom', 'video-embed-thumbnail-generator'),
              value: 'bottom'
            }],
            onChange: value => setAttributes({
              watermark_valign: value
            }),
            style: {
              flex: 1
            }
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.RangeControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Horizontal Offset (%)', 'video-embed-thumbnail-generator'),
          value: effectiveX,
          onChange: value => setAttributes({
            watermark_x: value
          }),
          min: 0,
          max: 100,
          step: 0.01
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.RangeControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Vertical Offset (%)', 'video-embed-thumbnail-generator'),
          value: effectiveY,
          onChange: value => setAttributes({
            watermark_y: value
          }),
          min: 0,
          max: 100,
          step: 0.01
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Link to', 'video-embed-thumbnail-generator'),
          value: effectiveLinkToType,
          onChange: value => setAttributes({
            watermark_link_to: value
          }),
          options: [{
            value: 'false',
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('None', 'video-embed-thumbnail-generator')
          }, {
            value: 'home',
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Home page', 'video-embed-thumbnail-generator')
          }, {
            value: 'parent',
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Parent post', 'video-embed-thumbnail-generator')
          }, {
            value: 'download',
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Download video', 'video-embed-thumbnail-generator')
          }, {
            value: 'attachment',
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Video attachment page', 'video-embed-thumbnail-generator')
          }, {
            value: 'custom',
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Custom URL', 'video-embed-thumbnail-generator')
          }]
        }), effectiveLinkToType === 'custom' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Watermark URL', 'video-embed-thumbnail-generator'),
          value: effectiveCustomLinkUrl,
          onChange: value => setAttributes({
            watermark_url: value
          })
        })]
      })
    }), isOverlay && containerDimensions && isSelected ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)("div", {
      ref: containerRef,
      style: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'auto'
      },
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_components_WatermarkPositioner_WatermarkPositioner__WEBPACK_IMPORTED_MODULE_4__["default"], {
        containerDimensions: containerDimensions,
        settings: attributes,
        onChange: newAttrs => setAttributes(newAttrs),
        isSelected: isSelected,
        showBackground: false,
        aspectRatio: detectedAspectRatio,
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(VideoWatermark, {
          watermark: watermark,
          watermark_scale: watermark_scale,
          watermark_align: watermark_align,
          watermark_valign: watermark_valign,
          watermark_x: watermark_x,
          watermark_y: watermark_y,
          context: context,
          isBlockEditor: true,
          onDimensions: setDetectedAspectRatio
        })
      })
    }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)("div", {
      ref: containerRef,
      style: {
        ...(isOverlay ? {
          width: '100%',
          height: '100%',
          position: 'relative'
        } : {})
      },
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(VideoWatermark, {
        watermark: watermark,
        watermark_scale: watermark_scale,
        watermark_align: watermark_align,
        watermark_valign: watermark_valign,
        watermark_x: watermark_x,
        watermark_y: watermark_y,
        context: context,
        isBlockEditor: isOverlay,
        onDimensions: setDetectedAspectRatio
      })
    })]
  });
}

/***/ },

/***/ "./src/blocks/video-watermark/save.js"
/*!********************************************!*\
  !*** ./src/blocks/video-watermark/save.js ***!
  \********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ save)
/* harmony export */ });
function save() {
  return null;
}

/***/ },

/***/ "./src/components/WatermarkPositioner/WatermarkPositioner.js"
/*!*******************************************************************!*\
  !*** ./src/components/WatermarkPositioner/WatermarkPositioner.js ***!
  \*******************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__);
/* global Image */



const WatermarkPositioner = ({
  containerDimensions,
  settings,
  onChange,
  isSelected = true,
  showBackground = false,
  backgroundDataUrl = null,
  imageUrl = '',
  aspectRatio: propAspectRatio = null,
  children
}) => {
  const containerRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);
  const watermarkRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);
  const [watermarkImage, setWatermarkImage] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [isDragging, setIsDragging] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [isResizing, setIsResizing] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [transientScale, setTransientScale] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [transientPercentages, setTransientPercentages] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null); // { x, y } in percentages
  const [isFocused, setIsFocused] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const lastAspectRatioRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(propAspectRatio || 1);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (watermarkImage) {
      lastAspectRatioRef.current = watermarkImage.width / watermarkImage.height;
    } else if (propAspectRatio) {
      lastAspectRatioRef.current = propAspectRatio;
    }
  }, [watermarkImage, propAspectRatio]);
  const dragStartRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)({
    x: 0,
    y: 0,
    initialLeft: 0,
    initialTop: 0
  });
  const stateRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)({});
  const effectiveImageUrl = imageUrl || settings?.url || settings?.watermark;
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (effectiveImageUrl) {
      const img = new Image();
      img.onload = () => setWatermarkImage(img);
      img.src = effectiveImageUrl;
    } else {
      setWatermarkImage(null);
    }
  }, [effectiveImageUrl]);
  const {
    wmStyle,
    wmWidth,
    wmHeight,
    x,
    y,
    scale,
    alignment,
    valign,
    aspectRatio
  } = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => {
    if (!containerDimensions) {
      return {
        wmStyle: {},
        wmWidth: 0,
        wmHeight: 0,
        x: 0,
        y: 0,
        scale: 10,
        alignment: 'center',
        valign: 'center',
        aspectRatio: 1
      };
    }
    const containerWidth = containerDimensions.width;

    // Use transientScale if available, else settings.scale
    const currentScale = transientScale !== null ? transientScale : Number(settings.scale || settings.watermark_scale || 10);
    const currentX = transientPercentages?.x !== undefined && transientPercentages !== null ? transientPercentages.x : Number(settings.x || settings.watermark_x || 0);
    const currentY = transientPercentages?.y !== undefined && transientPercentages !== null ? transientPercentages.y : Number(settings.y || settings.watermark_y || 0);
    const currentAlign = settings.align || settings.watermark_align || 'center';
    const currentValign = settings.valign || settings.watermark_valign || 'center';
    const style = {
      position: 'absolute',
      width: `${currentScale}%`,
      height: 'auto',
      zIndex: 100,
      transform: ''
    };
    if (currentAlign === 'center') {
      style.left = '50%';
      style.transform += 'translateX(-50%) ';
      style.marginLeft = `${-currentX}%`;
    } else {
      style[currentAlign] = `${currentX}%`;
    }
    if (currentValign === 'center') {
      style.top = '50%';
      style.transform += 'translateY(-50%) ';
      style.marginTop = `${-currentY}%`;
    } else {
      style[currentValign] = `${currentY}%`;
    }
    if (!style.transform) {
      delete style.transform;
    }
    const w = containerWidth * currentScale / 100;
    const ratio = watermarkImage ? watermarkImage.width / watermarkImage.height : lastAspectRatioRef.current || 1;
    const h = w / ratio;
    return {
      wmStyle: style,
      wmWidth: w,
      wmHeight: h,
      x: currentX,
      y: currentY,
      scale: currentScale,
      alignment: currentAlign,
      valign: currentValign,
      aspectRatio: ratio
    };
  }, [containerDimensions, watermarkImage, settings, transientScale, transientPercentages]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    stateRef.current = {
      transientPercentages,
      transientScale,
      isDragging,
      isResizing,
      settings,
      containerDimensions,
      watermarkImage,
      wmWidth,
      wmHeight,
      aspectRatio,
      baseDeltaX: x,
      baseDeltaY: y
    };
  }, [transientPercentages, transientScale, isDragging, isResizing, settings, containerDimensions, watermarkImage, wmWidth, wmHeight, x, y, aspectRatio]);
  const onChangeRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(onChange);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  const handleMouseDown = e => {
    if (!isSelected) return;
    e.preventDefault();
    e.stopPropagation();
    if (watermarkRef.current) {
      watermarkRef.current.focus();
    }
    const initialX = Number(settings.x || settings.watermark_x || 0);
    const initialY = Number(settings.y || settings.watermark_y || 0);
    setIsDragging(true);
    setTransientPercentages({
      x: initialX,
      y: initialY
    });
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialX,
      initialY
    };
  };
  const handleResizeStart = (e, handle) => {
    e.preventDefault();
    e.stopPropagation();
    if (watermarkRef.current) {
      watermarkRef.current.focus();
    }
    setIsResizing(true);
    const currentScale = transientScale !== null ? transientScale : Number(settings.scale || settings.watermark_scale || 10);
    const initialX = Number(settings.x || settings.watermark_x || 0);
    const initialY = Number(settings.y || settings.watermark_y || 0);
    setTransientScale(currentScale);
    setTransientPercentages({
      x: initialX,
      y: initialY
    });
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialX,
      initialY,
      initialScale: currentScale,
      handle,
      aspectRatio: wmWidth / wmHeight
    };
  };
  const finalizeInteraction = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
    const s = stateRef.current;
    if (!s.isDragging && !s.isResizing) {
      return;
    }
    const wasResizing = s.isResizing;
    if (!s.containerDimensions || !s.transientPercentages) {
      setTransientPercentages(null);
      setTransientScale(null);
      setIsDragging(false);
      setIsResizing(false);
      return;
    }
    setIsDragging(false);
    setIsResizing(false);
    const finalX = s.transientPercentages.x;
    const finalY = s.transientPercentages.y;
    const finalScale = wasResizing && s.transientScale !== null ? s.transientScale : Number(s.settings.scale || s.settings.watermark_scale || 10);
    const aspectRatio = s.aspectRatio;
    const {
      width: containerWidth,
      height: containerHeight
    } = s.containerDimensions;

    // Preserve attributes based on what's being used (settings vs block-editor styles)
    const isBlock = s.settings.hasOwnProperty('watermark_scale') || s.settings.hasOwnProperty('watermark');
    const currentAlign = s.settings.align || s.settings.watermark_align || 'center';
    const currentValign = s.settings.valign || s.settings.watermark_valign || 'bottom';

    // 1. Calculate absolute top-left percentage (L, T)
    let L = finalX;
    if (currentAlign === 'right') {
      L = 100 - finalScale - finalX;
    } else if (currentAlign === 'center') {
      L = 50 - finalScale / 2 - finalX;
    }
    const vScale = finalScale * (containerWidth / containerHeight) / aspectRatio;
    let T = finalY;
    if (currentValign === 'bottom') {
      T = 100 - vScale - finalY;
    } else if (currentValign === 'center') {
      T = 50 - vScale / 2 - finalY;
    }

    // 2. Decide best new anchors based on center of mass
    let newAlign = 'center';
    const centerX = L + finalScale / 2;
    if (centerX < 33) {
      newAlign = 'left';
    } else if (centerX > 66) {
      newAlign = 'right';
    }
    let newValign = 'center';
    const centerY = T + vScale / 2;
    if (centerY < 33) {
      newValign = 'top';
    } else if (centerY > 66) {
      newValign = 'bottom';
    }

    // 3. Calculate new offsets relative to these new anchors
    let newX = L;
    if (newAlign === 'right') {
      newX = 100 - finalScale - L;
    } else if (newAlign === 'center') {
      newX = 50 - finalScale / 2 - L;
    }
    let newY = T;
    if (newValign === 'bottom') {
      newY = 100 - vScale - T;
    } else if (newValign === 'center') {
      newY = 50 - vScale / 2 - T;
    }
    const newSettings = isBlock ? {
      watermark_scale: Math.round(finalScale * 100) / 100,
      watermark_align: newAlign,
      watermark_valign: newValign,
      watermark_x: Math.round(newX * 100) / 100,
      watermark_y: Math.round(newY * 100) / 100
    } : {
      scale: Math.round(finalScale * 100) / 100,
      align: newAlign,
      valign: newValign,
      x: Math.round(newX * 100) / 100,
      y: Math.round(newY * 100) / 100
    };
    onChangeRef.current(newSettings);
    setTransientPercentages(null);
    setTransientScale(null);

    // Remove global listeners
    window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Finalize interaction when selection is lost while dragging/resizing
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (!isSelected && (isDragging || isResizing)) {
      finalizeInteraction();
    }
  }, [isSelected, isDragging, isResizing, finalizeInteraction]);

  // Finalize interaction on unmount if anything was pending
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    return () => {
      const s = stateRef.current;
      if (s.isDragging || s.isResizing) {
        // We can't call finalizeInteraction here because of closure issues,
        // but the stateRef should have what we need.
        // However, finalizeInteraction is already memoized with its dependencies.
        // For now, the 'isSelected' effect above handles most cases.
      }
    };
  }, []);
  const handleFocus = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
    setIsFocused(true);
  }, []);
  const handleBlur = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(e => {
    if (e.currentTarget.contains(e.relatedTarget)) {
      return;
    }
    setIsFocused(false);
    finalizeInteraction();
  }, [finalizeInteraction]);
  const handleDragKeyDown = e => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      return;
    }
    e.preventDefault();
    const {
      x: currentX,
      y: currentY
    } = {
      x: stateRef.current.baseDeltaX,
      y: stateRef.current.baseDeltaY
    };
    let newX = currentX;
    let newY = currentY;
    const stepPx = e.shiftKey ? 10 : 1;
    const stepXPct = stepPx / containerDimensions.width * 100;
    const stepYPct = stepPx / containerDimensions.height * 100;
    const alignment = settings.align || settings.watermark_align || 'center';
    const verticalAlignment = settings.valign || settings.watermark_valign || 'center';
    switch (e.key) {
      case 'ArrowUp':
        newY += verticalAlignment === 'top' ? -stepYPct : stepYPct;
        break;
      case 'ArrowDown':
        newY += verticalAlignment === 'top' ? stepYPct : -stepYPct;
        break;
      case 'ArrowLeft':
        newX += alignment === 'left' ? -stepXPct : stepXPct;
        break;
      case 'ArrowRight':
        newX += alignment === 'left' ? stepXPct : -stepXPct;
        break;
    }
    setTransientPercentages({
      x: newX,
      y: newY
    });
  };
  const handleResizeKeyDown = (e, handle) => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();

    // Keyboard resizing is temporarily disabled during percentage refactor for stability
  };
  const handleMouseMove = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(e => {
    const s = stateRef.current;
    if (!s.isDragging && !s.isResizing) {
      return;
    }
    const dragStart = dragStartRef.current;
    const containerWidth = s.containerDimensions.width;
    const containerHeight = s.containerDimensions.height;
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = containerWidth / rect.width;
    const scaleY = containerHeight / rect.height;
    const dxCanvas = (e.clientX - dragStart.x) * scaleX;
    const dyCanvas = (e.clientY - dragStart.y) * scaleY;
    const dxPct = dxCanvas / containerWidth * 100;
    const dyPct = dyCanvas / containerHeight * 100;
    if (s.isDragging) {
      const alignment = s.settings.align || s.settings.watermark_align || 'center';
      const verticalAlignment = s.settings.valign || s.settings.watermark_valign || 'bottom';
      let newX = dragStart.initialX;
      let newY = dragStart.initialY;
      if (alignment === 'left') {
        newX = dragStart.initialX + dxPct;
      } else {
        // right or center offsets increase as we move left (negative dx)
        newX = dragStart.initialX - dxPct;
      }
      if (verticalAlignment === 'top') {
        newY = dragStart.initialY + dyPct;
      } else {
        // bottom or center offsets increase as we move up (negative dy)
        newY = dragStart.initialY - dyPct;
      }
      setTransientPercentages({
        x: newX,
        y: newY
      });
    } else if (s.isResizing) {
      const {
        initialScale,
        initialLeft,
        initialTop,
        aspectRatio,
        handle
      } = dragStart;
      const initialWidth = containerWidth * initialScale / 100;
      const initialHeight = initialWidth / aspectRatio;
      let newWidth = initialWidth;
      if (handle === 'se' || handle === 'ne') {
        newWidth = initialWidth + dxCanvas;
      } else {
        newWidth = initialWidth - dxCanvas;
      }
      let newScale = newWidth / containerWidth * 100;
      newScale = Math.round(newScale * 100) / 100;
      newScale = Math.max(1, Math.min(100, newScale));
      const alignment = s.settings.align || s.settings.watermark_align || 'center';
      const verticalAlignment = s.settings.valign || s.settings.watermark_valign || 'center';
      let newX = dragStart.initialX;
      let newY = dragStart.initialY;
      const scaleDiff = newScale - initialScale;
      const vScaleFactor = containerWidth / containerHeight / aspectRatio;
      const vScaleDiff = scaleDiff * vScaleFactor;

      // Horizontal anchoring
      if (handle === 'se' || handle === 'ne') {
        // Dragging Right side -> NW or SW corner fixed
        if (alignment === 'left') {
          // Left anchored -> X is fixed
        } else if (alignment === 'right') {
          newX = dragStart.initialX - scaleDiff;
        } else {
          newX = dragStart.initialX - scaleDiff / 2;
        }
      } else {
        // Dragging Left side -> NE or SE corner fixed
        if (alignment === 'left') {
          newX = dragStart.initialX + scaleDiff;
        } else if (alignment === 'right') {
          // Right anchored -> X is fixed
        } else {
          newX = dragStart.initialX + scaleDiff / 2;
        }
      }

      // Vertical anchoring
      if (handle === 'se' || handle === 'sw') {
        // Dragging Bottom side -> NW or NE corner fixed
        if (verticalAlignment === 'top') {
          // Top anchored -> Y is fixed
        } else if (verticalAlignment === 'bottom') {
          newY = dragStart.initialY - vScaleDiff;
        } else {
          newY = dragStart.initialY - vScaleDiff / 2;
        }
      } else {
        // Dragging Top side -> SW or SE corner fixed
        if (verticalAlignment === 'top') {
          newY = dragStart.initialY + vScaleDiff;
        } else if (verticalAlignment === 'bottom') {
          // Bottom anchored -> Y is fixed
        } else {
          newY = dragStart.initialY + vScaleDiff / 2;
        }
      }
      setTransientScale(newScale);
      setTransientPercentages({
        x: newX,
        y: newY
      });
    }
  }, []);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    // Clean logs and ensure no leaking listeners
    return () => {};
  }, []);
  if (!containerDimensions) {
    return children || null;
  }
  const containerWidth = containerDimensions.width;
  const containerHeight = containerDimensions.height;
  const showHandles = isSelected || isFocused;
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
    ref: containerRef,
    className: "videopack-watermark-positioner",
    style: {
      width: `${containerWidth}px`,
      height: `${containerHeight}px`,
      backgroundImage: showBackground && backgroundDataUrl ? `url(${backgroundDataUrl})` : 'none',
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat'
    },
    children: [(isDragging || isResizing) && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
      className: "videopack-interaction-overlay",
      style: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        cursor: isDragging ? 'grabbing' : 'crosshair',
        pointerEvents: 'auto'
      },
      onMouseMove: handleMouseMove,
      onMouseUp: finalizeInteraction
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
      ref: watermarkRef,
      style: {
        ...wmStyle,
        outline: showHandles ? '1px dashed #757575' : 'none',
        cursor: isDragging ? 'grabbing' : isSelected ? 'move' : 'default'
      },
      role: "button",
      tabIndex: isSelected ? "0" : "-1",
      "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Move watermark', 'video-embed-thumbnail-generator'),
      onMouseDown: handleMouseDown,
      onKeyDown: handleDragKeyDown,
      onFocus: handleFocus,
      onBlur: handleBlur,
      children: [children ? children : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("img", {
        src: effectiveImageUrl,
        alt: "Watermark",
        style: {
          width: '100%',
          height: '100%',
          userSelect: 'none',
          display: 'block'
        },
        draggable: false
      }), showHandles && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.Fragment, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
          role: "slider",
          tabIndex: "0",
          "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Resize watermark from top left', 'video-embed-thumbnail-generator'),
          className: "videopack-resize-handle nw",
          onMouseDown: e => handleResizeStart(e, 'nw'),
          onKeyDown: e => handleResizeKeyDown(e, 'nw')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
          role: "slider",
          tabIndex: "0",
          "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Resize watermark from top right', 'video-embed-thumbnail-generator'),
          className: "videopack-resize-handle ne",
          onMouseDown: e => handleResizeStart(e, 'ne'),
          onKeyDown: e => handleResizeKeyDown(e, 'ne')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
          role: "slider",
          tabIndex: "0",
          "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Resize watermark from bottom left', 'video-embed-thumbnail-generator'),
          className: "videopack-resize-handle sw",
          onMouseDown: e => handleResizeStart(e, 'sw'),
          onKeyDown: e => handleResizeKeyDown(e, 'sw')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
          role: "slider",
          tabIndex: "0",
          "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Resize watermark from bottom right', 'video-embed-thumbnail-generator'),
          className: "videopack-resize-handle se",
          onMouseDown: e => handleResizeStart(e, 'se'),
          onKeyDown: e => handleResizeKeyDown(e, 'se')
        })]
      })]
    })]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (WatermarkPositioner);

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

  // 2. Check inherited context (from Collection or Video block)
  if (isValid(context[contextKey])) {
    return context[contextKey];
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

/***/ "./src/blocks/video-watermark/editor.scss"
/*!************************************************!*\
  !*** ./src/blocks/video-watermark/editor.scss ***!
  \************************************************/
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

/***/ "@wordpress/element"
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
(module) {

module.exports = window["wp"]["element"];

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

/***/ "./node_modules/@wordpress/icons/build-module/library/home.mjs"
/*!*********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/home.mjs ***!
  \*********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ home_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/home.tsx


var home_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M12 4L4 7.9V20h16V7.9L12 4zm6.5 14.5H14V13h-4v5.5H5.5V8.8L12 5.7l6.5 3.1v9.7z" }) });

//# sourceMappingURL=home.mjs.map


/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/image.mjs"
/*!**********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/image.mjs ***!
  \**********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ image_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/image.tsx


var image_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 4.5h14c.3 0 .5.2.5.5v8.4l-3-2.9c-.3-.3-.8-.3-1 0L11.9 14 9 12c-.3-.2-.6-.2-.8 0l-3.6 2.6V5c-.1-.3.1-.5.4-.5zm14 15H5c-.3 0-.5-.2-.5-.5v-2.4l4.1-3 3 1.9c.3.2.7.2.9-.1L16 12l3.5 3.4V19c0 .3-.2.5-.5.5z" }) });

//# sourceMappingURL=image.mjs.map


/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/link.mjs"
/*!*********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/link.mjs ***!
  \*********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ link_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/link.tsx


var link_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M10 17.389H8.444A5.194 5.194 0 1 1 8.444 7H10v1.5H8.444a3.694 3.694 0 0 0 0 7.389H10v1.5ZM14 7h1.556a5.194 5.194 0 0 1 0 10.39H14v-1.5h1.556a3.694 3.694 0 0 0 0-7.39H14V7Zm-4.5 6h5v-1.5h-5V13Z" }) });

//# sourceMappingURL=link.mjs.map


/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/not-allowed.mjs"
/*!****************************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/not-allowed.mjs ***!
  \****************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ not_allowed_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/not-allowed.tsx


var not_allowed_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { fillRule: "evenodd", clipRule: "evenodd", d: "M12 18.5A6.5 6.5 0 0 1 6.93 7.931l9.139 9.138A6.473 6.473 0 0 1 12 18.5Zm5.123-2.498a6.5 6.5 0 0 0-9.124-9.124l9.124 9.124ZM4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0Z" }) });

//# sourceMappingURL=not-allowed.mjs.map


/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/page.mjs"
/*!*********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/page.mjs ***!
  \*********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ page_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/page.tsx


var page_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: [
  /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M15.5 7.5h-7V9h7V7.5Zm-7 3.5h7v1.5h-7V11Zm7 3.5h-7V16h7v-1.5Z" }),
  /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M17 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2ZM7 5.5h10a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-.5.5H7a.5.5 0 0 1-.5-.5V6a.5.5 0 0 1 .5-.5Z" })
] });

//# sourceMappingURL=page.mjs.map


/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/post.mjs"
/*!*********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/post.mjs ***!
  \*********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ post_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/post.tsx


var post_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "m7.3 9.7 1.4 1.4c.2-.2.3-.3.4-.5 0 0 0-.1.1-.1.3-.5.4-1.1.3-1.6L12 7 9 4 7.2 6.5c-.6-.1-1.1 0-1.6.3 0 0-.1 0-.1.1-.3.1-.4.2-.6.4l1.4 1.4L4 11v1h1l2.3-2.3zM4 20h9v-1.5H4V20zm0-5.5V16h16v-1.5H4z" }) });

//# sourceMappingURL=post.mjs.map


/***/ },

/***/ "./src/blocks/video-watermark/block.json"
/*!***********************************************!*\
  !*** ./src/blocks/video-watermark/block.json ***!
  \***********************************************/
(module) {

module.exports = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"videopack/video-watermark","title":"Video Watermark","category":"media","icon":"art","description":"Displays a watermark overlay on the video.","parent":["videopack/videopack-video","videopack/video-player-engine"],"usesContext":["videopack/postId","videopack/watermark","videopack/watermark_link_to","videopack/watermark_styles","videopack/isInsideThumbnail","videopack/isInsidePlayerOverlay"],"attributes":{"watermark":{"type":"string"},"watermark_link_to":{"type":"string","default":"false"},"watermark_url":{"type":"string"},"watermark_align":{"type":"string","default":"right"},"watermark_valign":{"type":"string","default":"bottom"},"watermark_scale":{"type":"number","default":10},"watermark_x":{"type":"number","default":5},"watermark_y":{"type":"number","default":7}},"supports":{"html":false,"reusable":false},"textdomain":"video-embed-thumbnail-generator","editorScript":"file:./index.js","editorStyle":"file:./index.css"}');

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
/*!*********************************************!*\
  !*** ./src/blocks/video-watermark/index.js ***!
  \*********************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/blocks */ "@wordpress/blocks");
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _edit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./edit */ "./src/blocks/video-watermark/edit.js");
/* harmony import */ var _save__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./save */ "./src/blocks/video-watermark/save.js");
/* harmony import */ var _block_json__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./block.json */ "./src/blocks/video-watermark/block.json");




(0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__.registerBlockType)(_block_json__WEBPACK_IMPORTED_MODULE_3__.name, {
  edit: _edit__WEBPACK_IMPORTED_MODULE_1__["default"],
  save: _save__WEBPACK_IMPORTED_MODULE_2__["default"]
});
})();

/******/ })()
;
//# sourceMappingURL=index.js.map