/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// external ["wp","blocks"]
const external_wp_blocks_namespaceObject = window["wp"]["blocks"];
;// external ["wp","i18n"]
const external_wp_i18n_namespaceObject = window["wp"]["i18n"];
;// external ["wp","blockEditor"]
const external_wp_blockEditor_namespaceObject = window["wp"]["blockEditor"];
;// external ["wp","components"]
const external_wp_components_namespaceObject = window["wp"]["components"];
;// external ["wp","element"]
const external_wp_element_namespaceObject = window["wp"]["element"];
;// external ["wp","data"]
const external_wp_data_namespaceObject = window["wp"]["data"];
;// external "ReactJSXRuntime"
const external_ReactJSXRuntime_namespaceObject = window["ReactJSXRuntime"];
;// ./src/components/WatermarkPositioner/WatermarkPositioner.js
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
  const containerRef = (0,external_wp_element_namespaceObject.useRef)(null);
  const watermarkRef = (0,external_wp_element_namespaceObject.useRef)(null);
  const [watermarkImage, setWatermarkImage] = (0,external_wp_element_namespaceObject.useState)(null);
  const [isDragging, setIsDragging] = (0,external_wp_element_namespaceObject.useState)(false);
  const [isResizing, setIsResizing] = (0,external_wp_element_namespaceObject.useState)(false);
  const [transientScale, setTransientScale] = (0,external_wp_element_namespaceObject.useState)(null);
  const [transientPercentages, setTransientPercentages] = (0,external_wp_element_namespaceObject.useState)(null); // { x, y } in percentages
  const [isFocused, setIsFocused] = (0,external_wp_element_namespaceObject.useState)(false);
  const lastAspectRatioRef = (0,external_wp_element_namespaceObject.useRef)(propAspectRatio || 1);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    if (watermarkImage) {
      lastAspectRatioRef.current = watermarkImage.width / watermarkImage.height;
    } else if (propAspectRatio) {
      lastAspectRatioRef.current = propAspectRatio;
    }
  }, [watermarkImage, propAspectRatio]);
  const dragStartRef = (0,external_wp_element_namespaceObject.useRef)({
    x: 0,
    y: 0,
    initialLeft: 0,
    initialTop: 0
  });
  const stateRef = (0,external_wp_element_namespaceObject.useRef)({});
  const effectiveImageUrl = imageUrl || settings?.url || settings?.watermark;
  (0,external_wp_element_namespaceObject.useEffect)(() => {
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
  } = (0,external_wp_element_namespaceObject.useMemo)(() => {
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
  (0,external_wp_element_namespaceObject.useEffect)(() => {
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
  const onChangeRef = (0,external_wp_element_namespaceObject.useRef)(onChange);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
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
  const finalizeInteraction = (0,external_wp_element_namespaceObject.useCallback)(() => {
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
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    if (!isSelected && (isDragging || isResizing)) {
      finalizeInteraction();
    }
  }, [isSelected, isDragging, isResizing, finalizeInteraction]);

  // Finalize interaction on unmount if anything was pending
  (0,external_wp_element_namespaceObject.useEffect)(() => {
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
  const handleFocus = (0,external_wp_element_namespaceObject.useCallback)(() => {
    setIsFocused(true);
  }, []);
  const handleBlur = (0,external_wp_element_namespaceObject.useCallback)(e => {
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
  const handleMouseMove = (0,external_wp_element_namespaceObject.useCallback)(e => {
    const s = stateRef.current;
    if (!s.isDragging && !s.isResizing) {
      return;
    }
    // console.log('[Videopack] mousemove');
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
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    // Clean logs and ensure no leaking listeners
    return () => {};
  }, []);
  if (!containerDimensions) {
    return children || null;
  }
  const containerWidth = containerDimensions.width;
  const containerHeight = containerDimensions.height;
  const showHandles = isSelected || isFocused;
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
    ref: containerRef,
    className: "videopack-watermark-positioner",
    style: {
      width: `${containerWidth}px`,
      height: `${containerHeight}px`,
      backgroundImage: showBackground && backgroundDataUrl ? `url(${backgroundDataUrl})` : 'none',
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat'
    },
    children: [(isDragging || isResizing) && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
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
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
      ref: watermarkRef,
      style: {
        ...wmStyle,
        outline: showHandles ? '1px dashed #757575' : 'none',
        cursor: isDragging ? 'grabbing' : isSelected ? 'move' : 'default'
      },
      role: "button",
      tabIndex: isSelected ? "0" : "-1",
      "aria-label": (0,external_wp_i18n_namespaceObject.__)('Move watermark', 'video-embed-thumbnail-generator'),
      onMouseDown: handleMouseDown,
      onKeyDown: handleDragKeyDown,
      onFocus: handleFocus,
      onBlur: handleBlur,
      children: [children ? children : /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("img", {
        src: effectiveImageUrl,
        alt: "Watermark",
        style: {
          width: '100%',
          height: '100%',
          userSelect: 'none',
          display: 'block'
        },
        draggable: false
      }), showHandles && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
          role: "slider",
          tabIndex: "0",
          "aria-label": (0,external_wp_i18n_namespaceObject.__)('Resize watermark from top left', 'video-embed-thumbnail-generator'),
          className: "videopack-resize-handle nw",
          onMouseDown: e => handleResizeStart(e, 'nw'),
          onKeyDown: e => handleResizeKeyDown(e, 'nw')
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
          role: "slider",
          tabIndex: "0",
          "aria-label": (0,external_wp_i18n_namespaceObject.__)('Resize watermark from top right', 'video-embed-thumbnail-generator'),
          className: "videopack-resize-handle ne",
          onMouseDown: e => handleResizeStart(e, 'ne'),
          onKeyDown: e => handleResizeKeyDown(e, 'ne')
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
          role: "slider",
          tabIndex: "0",
          "aria-label": (0,external_wp_i18n_namespaceObject.__)('Resize watermark from bottom left', 'video-embed-thumbnail-generator'),
          className: "videopack-resize-handle sw",
          onMouseDown: e => handleResizeStart(e, 'sw'),
          onKeyDown: e => handleResizeKeyDown(e, 'sw')
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
          role: "slider",
          tabIndex: "0",
          "aria-label": (0,external_wp_i18n_namespaceObject.__)('Resize watermark from bottom right', 'video-embed-thumbnail-generator'),
          className: "videopack-resize-handle se",
          onMouseDown: e => handleResizeStart(e, 'se'),
          onKeyDown: e => handleResizeKeyDown(e, 'se')
        })]
      })]
    })]
  });
};
/* harmony default export */ const WatermarkPositioner_WatermarkPositioner = (WatermarkPositioner);
;// external ["wp","primitives"]
const external_wp_primitives_namespaceObject = window["wp"]["primitives"];
;// ./node_modules/@wordpress/icons/build-module/library/image.mjs
// packages/icons/src/library/image.tsx


var image_default = /* @__PURE__ */ (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, { d: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 4.5h14c.3 0 .5.2.5.5v8.4l-3-2.9c-.3-.3-.8-.3-1 0L11.9 14 9 12c-.3-.2-.6-.2-.8 0l-3.6 2.6V5c-.1-.3.1-.5.4-.5zm14 15H5c-.3 0-.5-.2-.5-.5v-2.4l4.1-3 3 1.9c.3.2.7.2.9-.1L16 12l3.5 3.4V19c0 .3-.2.5-.5.5z" }) });

//# sourceMappingURL=image.mjs.map

;// ./src/utils/context.js
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

  // 1. Check local attribute override
  if (attributes[attrKey] !== undefined && attributes[attrKey] !== null && attributes[attrKey] !== '') {
    return attributes[attrKey];
  }

  // 2. Check inherited context (from Collection or Video block)
  if (context[contextKey] !== undefined && context[contextKey] !== null && context[contextKey] !== '') {
    return context[contextKey];
  }

  // 3. Fallback to global plugin defaults
  const globalOptions = videopack_config?.options || {};
  const globalDefaults = videopack_config?.defaults || {};
  if (attrKey === 'skin') {
    return attributes.skin || context['videopack/skin'] || globalOptions.skin || globalDefaults.skin || 'vjs-theme-videopack';
  }
  const val = attributes[attrKey] ?? context[`videopack/${attrKey}`];
  if (val !== undefined && val !== null) {
    return val;
  }
  const fallback = globalOptions[attrKey] ?? globalDefaults[attrKey];
  if (attrKey === 'gallery_per_page') {
    console.log(`getEffectiveValue fallback for ${attrKey}:`, fallback);
  }
  return fallback;
};
;// ./src/blocks/video-watermark/edit.js
/* global videopack_config */










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
  const effectiveUrl = getEffectiveValue('watermark', {
    watermark
  }, context);
  const getEffective = (attrKey, contextKey, fallback) => {
    if (watermarkProps[attrKey] !== undefined && watermarkProps[attrKey] !== null && watermarkProps[attrKey] !== '') {
      return watermarkProps[attrKey];
    }
    const styles = getEffectiveValue('watermark_styles', {}, context);
    if (styles && typeof styles === 'object' && styles[contextKey] !== undefined) {
      return styles[contextKey];
    }
    return getEffectiveValue(`watermark_${contextKey}`, {}, context) ?? fallback;
  };
  const effectiveScale = getEffective('watermark_scale', 'scale', 10);
  const effectiveAlign = getEffective('watermark_align', 'align', 'right');
  const effectiveValign = getEffective('watermark_valign', 'valign', 'bottom');
  const effectiveX = getEffective('watermark_x', 'x', 5);
  const effectiveY = getEffective('watermark_y', 'y', 7);
  const skin = getEffectiveValue('skin', {}, context);
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
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
    className: `videopack-video-watermark ${skin}`,
    style: style,
    children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("img", {
      src: effectiveUrl,
      alt: (0,external_wp_i18n_namespaceObject.__)('Watermark', 'video-embed-thumbnail-generator'),
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
  const watermark = attributes.watermark;
  const contextWatermark = context['videopack/watermark'];
  const effectiveUrl = getEffectiveValue('watermark', attributes, context);
  if (!effectiveUrl) return {};
  const getEffective = (attrKey, contextKey, fallback) => {
    if (attributes[attrKey] !== undefined && attributes[attrKey] !== null && attributes[attrKey] !== '') {
      return attributes[attrKey];
    }
    const styles = getEffectiveValue('watermark_styles', attributes, context);
    if (styles && typeof styles === 'object' && styles[contextKey] !== undefined) {
      return styles[contextKey];
    }
    return getEffectiveValue(`watermark_${contextKey}`, attributes, context) ?? fallback;
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
  const containerRef = (0,external_wp_element_namespaceObject.useRef)(null);
  const [containerDimensions, setContainerDimensions] = (0,external_wp_element_namespaceObject.useState)(null);
  const [detectedAspectRatio, setDetectedAspectRatio] = (0,external_wp_element_namespaceObject.useState)(null);

  // Measure the parent container dimensions for accurate positioning.
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    if (!containerRef.current) return;
    const updateDimensions = () => {
      if (!containerRef.current) return;
      const element = containerRef.current;

      // Find the most specific media container to ensure accurate pixel calculations
      const container = element.closest('.videopack-player, .videopack-video-thumbnail-preview, .videopack-wrapper');
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
    const container = containerRef.current.closest('.videopack-player, .videopack-video-thumbnail-preview, .videopack-wrapper');
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

  // Design attributes are now derived dynamically via getEffectiveValue in the render cycle.
  // We no longer auto-initialize attributes to prevent them from becoming "stale".

  // Resolve effective values with correct priority: 
  // Individual attribute -> Composite context object -> Individual context key -> Default
  const getEffective = (attrKey, contextKey, fallback) => {
    // 1. Local attribute ALWAYS wins if it's explicitly set (and not just defaulting)
    if (attributes[attrKey] !== undefined && attributes[attrKey] !== null && attributes[attrKey] !== '') {
      return attributes[attrKey];
    }
    // 2. Try the composite styles object from context
    const styles = getEffectiveValue('watermark_styles', attributes, context);
    if (styles && typeof styles === 'object' && styles[contextKey] !== undefined) {
      return styles[contextKey];
    }
    // 3. Try individual context key
    return getEffectiveValue(`watermark_${contextKey}`, attributes, context) ?? fallback;
  };
  const effectiveUrl = getEffectiveValue('watermark', attributes, context);
  const effectiveScale = getEffective('watermark_scale', 'scale', 10);
  const effectiveAlign = getEffective('watermark_align', 'align', 'right');
  const effectiveValign = getEffective('watermark_valign', 'valign', 'bottom');
  const effectiveX = getEffective('watermark_x', 'x', 5);
  const effectiveY = getEffective('watermark_y', 'y', 7);
  const effectiveLinkToType = getEffectiveValue('watermark_link_to', attributes, context) || 'false';
  const effectiveCustomLinkUrl = getEffectiveValue('watermark_url', attributes, context) || '';
  const isInsideThumbnail = !!context['videopack/isInsideThumbnail'];
  const isInsidePlayer = !!context['videopack/isInsidePlayer'];
  const isOverlay = isInsideThumbnail || isInsidePlayer;
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
  const blockProps = (0,external_wp_blockEditor_namespaceObject.useBlockProps)({
    className: `videopack-video-watermark-block ${isOverlay ? 'is-overlay' : ''} ${isSelected ? 'is-selected' : ''}`,
    style: activeOverlayStyles
  });
  if (!watermark && !context['videopack/watermark']) {
    return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      ...blockProps,
      className: "videopack-video-watermark-placeholder",
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.MediaPlaceholder, {
        icon: image_default,
        label: (0,external_wp_i18n_namespaceObject.__)('Watermark Image', 'video-embed-thumbnail-generator'),
        onSelect: media => setAttributes({
          watermark: media.url
        }),
        accept: "image/*",
        allowedTypes: ['image']
      })
    });
  }
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
    ...blockProps,
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.BlockControls, {
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.MediaReplaceFlow, {
        mediaURL: watermark,
        allowedTypes: ['image'],
        accept: "image/*",
        onSelect: media => setAttributes({
          watermark: media.url
        }),
        name: (0,external_wp_i18n_namespaceObject.__)('Replace Watermark', 'video-embed-thumbnail-generator')
      })
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.InspectorControls, {
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.PanelBody, {
        title: (0,external_wp_i18n_namespaceObject.__)('Watermark Settings', 'video-embed-thumbnail-generator'),
        initialOpen: true,
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.RangeControl, {
          label: (0,external_wp_i18n_namespaceObject.__)('Scale (%)', 'video-embed-thumbnail-generator'),
          value: effectiveScale,
          onChange: value => setAttributes({
            watermark_scale: value
          }),
          min: 1,
          max: 100
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
          style: {
            display: 'flex',
            gap: '10px'
          },
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.SelectControl, {
            label: (0,external_wp_i18n_namespaceObject.__)('Horizontal Align', 'video-embed-thumbnail-generator'),
            value: effectiveAlign,
            options: [{
              label: (0,external_wp_i18n_namespaceObject.__)('Left', 'video-embed-thumbnail-generator'),
              value: 'left'
            }, {
              label: (0,external_wp_i18n_namespaceObject.__)('Center', 'video-embed-thumbnail-generator'),
              value: 'center'
            }, {
              label: (0,external_wp_i18n_namespaceObject.__)('Right', 'video-embed-thumbnail-generator'),
              value: 'right'
            }],
            onChange: value => setAttributes({
              watermark_align: value
            }),
            style: {
              flex: 1
            }
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.SelectControl, {
            label: (0,external_wp_i18n_namespaceObject.__)('Vertical Align', 'video-embed-thumbnail-generator'),
            value: effectiveValign,
            options: [{
              label: (0,external_wp_i18n_namespaceObject.__)('Top', 'video-embed-thumbnail-generator'),
              value: 'top'
            }, {
              label: (0,external_wp_i18n_namespaceObject.__)('Center', 'video-embed-thumbnail-generator'),
              value: 'center'
            }, {
              label: (0,external_wp_i18n_namespaceObject.__)('Bottom', 'video-embed-thumbnail-generator'),
              value: 'bottom'
            }],
            onChange: value => setAttributes({
              watermark_valign: value
            }),
            style: {
              flex: 1
            }
          })]
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.RangeControl, {
          label: (0,external_wp_i18n_namespaceObject.__)('Horizontal Offset (%)', 'video-embed-thumbnail-generator'),
          value: effectiveX,
          onChange: value => setAttributes({
            watermark_x: value
          }),
          min: 0,
          max: 100,
          step: 0.01
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.RangeControl, {
          label: (0,external_wp_i18n_namespaceObject.__)('Vertical Offset (%)', 'video-embed-thumbnail-generator'),
          value: effectiveY,
          onChange: value => setAttributes({
            watermark_y: value
          }),
          min: 0,
          max: 100,
          step: 0.01
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,external_wp_i18n_namespaceObject.__)('Link to', 'video-embed-thumbnail-generator'),
          value: effectiveLinkToType,
          onChange: value => setAttributes({
            watermark_link_to: value
          }),
          options: [{
            value: 'false',
            label: (0,external_wp_i18n_namespaceObject.__)('None', 'video-embed-thumbnail-generator')
          }, {
            value: 'home',
            label: (0,external_wp_i18n_namespaceObject.__)('Home page', 'video-embed-thumbnail-generator')
          }, {
            value: 'custom',
            label: (0,external_wp_i18n_namespaceObject.__)('Custom URL', 'video-embed-thumbnail-generator')
          }]
        }), effectiveLinkToType === 'custom' && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,external_wp_i18n_namespaceObject.__)('Watermark URL', 'video-embed-thumbnail-generator'),
          value: effectiveCustomLinkUrl,
          onChange: value => setAttributes({
            watermark_url: value
          })
        })]
      })
    }), isOverlay && containerDimensions && isSelected ? /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      ref: containerRef,
      style: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'auto'
      },
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(WatermarkPositioner_WatermarkPositioner, {
        containerDimensions: containerDimensions,
        settings: attributes,
        onChange: newAttrs => setAttributes(newAttrs),
        isSelected: isSelected,
        showBackground: false,
        aspectRatio: detectedAspectRatio,
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(VideoWatermark, {
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
    }) : /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      ref: containerRef,
      style: {
        ...(isOverlay ? {
          width: '100%',
          height: '100%',
          position: 'relative'
        } : {})
      },
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(VideoWatermark, {
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
;// ./src/blocks/video-watermark/save.js
function save() {
  return null;
}
;// ./src/blocks/video-watermark/block.json
const block_namespaceObject = /*#__PURE__*/JSON.parse('{"UU":"videopack/video-watermark"}');
;// ./src/blocks/video-watermark/index.js




(0,external_wp_blocks_namespaceObject.registerBlockType)(block_namespaceObject.UU, {
  edit: Edit,
  save: save
});
/******/ })()
;