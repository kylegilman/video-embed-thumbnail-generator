/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// external ["wp","blocks"]
const external_wp_blocks_namespaceObject = window["wp"]["blocks"];
;// external ["wp","element"]
const external_wp_element_namespaceObject = window["wp"]["element"];
;// external ["wp","blockEditor"]
const external_wp_blockEditor_namespaceObject = window["wp"]["blockEditor"];
;// external ["wp","components"]
const external_wp_components_namespaceObject = window["wp"]["components"];
;// external ["wp","i18n"]
const external_wp_i18n_namespaceObject = window["wp"]["i18n"];
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
;// ./src/utils/colors.js
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
    fallbacks.control_bar_bg_color = 'rgba(0, 0, 0, 0.35)';
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
        break;
      case 'vjs-theme-fantasy':
        fallbacks.title_background_color = '#9f44b4';
        fallbacks.play_button_secondary_color = '#9f44b4';
        break;
      case 'vjs-theme-forest':
        fallbacks.title_background_color = '#6fb04e';
        fallbacks.play_button_secondary_color = '#6fb04e';
        fallbacks.control_bar_bg_color = 'transparent';
        break;
      case 'vjs-theme-sea':
        fallbacks.title_background_color = '#4176bc';
        fallbacks.play_button_secondary_color = '#4176bc';
        fallbacks.control_bar_bg_color = 'rgba(255, 255, 255, 0.4)';
        break;
      case 'kg-video-js-skin':
        fallbacks.title_background_color = '#000000';
        fallbacks.play_button_secondary_color = '#000000';
        fallbacks.control_bar_bg_color = '#000000';
        break;
    }
  }
  return fallbacks;
};
;// external "ReactJSXRuntime"
const external_ReactJSXRuntime_namespaceObject = window["ReactJSXRuntime"];
;// ./src/components/CompactColorPicker/CompactColorPicker.js



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
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
    className: "videopack-color-picker-container",
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
      className: "videopack-color-picker-label",
      children: label
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Dropdown, {
      className: "videopack-color-dropdown",
      contentClassName: "videopack-color-dropdown-content",
      renderToggle: ({
        isOpen,
        onToggle
      }) => /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
        onClick: onToggle,
        "aria-expanded": isOpen,
        variant: "secondary",
        className: "videopack-color-picker-button",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ColorIndicator, {
          colorValue: displayColor
        })
      }),
      renderContent: () => /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
        className: "videopack-color-picker-palette-wrapper",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ColorPalette, {
          colors: colors,
          value: hexValue,
          onChange: handleOnChange,
          disableCustomColors: false,
          clearable: true
        })
      })
    })]
  });
};
/* harmony default export */ const CompactColorPicker_CompactColorPicker = (CompactColorPicker);
;// ./src/blocks/play-button/edit.js









/* global videopack_config */

function PlayButton({
  attributes = {},
  context = {}
}) {
  const config = typeof window !== 'undefined' ? window.videopack_config : undefined;
  const embed_method = typeof config !== 'undefined' ? config.embed_method : 'Video.js';
  const effectivePlayColor = getEffectiveValue('play_button_color', attributes, context);
  const effectivePlaySecondaryColor = getEffectiveValue('play_button_secondary_color', attributes, context);
  if ('WordPress Default' === embed_method) {
    const styles = {
      width: '80px',
      height: '80px'
    };
    if (effectivePlayColor) {
      styles['--videopack-play-button-color'] = effectivePlayColor;
    }
    if (effectivePlaySecondaryColor) {
      styles['--videopack-play-button-secondary-color'] = effectivePlaySecondaryColor;
    }
    const mejsSvgPath = config?.mejs_controls_svg || (typeof window !== 'undefined' ? `${window.location.origin}/wp-includes/js/mediaelement/mejs-controls.svg` : '');
    if (mejsSvgPath) {
      styles['--videopack-mejs-controls-svg'] = `url("${mejsSvgPath}")`;
    }
    return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      className: `videopack-play-button mejs-overlay mejs-layer mejs-overlay-play play-button-container ${effectivePlayColor ? 'videopack-has-play-button-color' : ''} ${effectivePlaySecondaryColor ? 'videopack-has-play-button-secondary-color' : ''}`,
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
        className: "mejs-overlay-button",
        role: "button",
        tabIndex: "0",
        "aria-label": (0,external_wp_i18n_namespaceObject.__)('Play', 'video-embed-thumbnail-generator'),
        "aria-pressed": "false",
        style: styles
      })
    });
  }
  if ('None' === embed_method) {
    return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      className: "play-button-container videopack-none",
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("svg", {
        className: "videopack-none-play-button",
        viewBox: "0 0 100 100",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("circle", {
          className: "play-button-circle",
          cx: "50",
          cy: "50",
          r: "45"
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("polygon", {
          className: "play-button-triangle",
          points: "40,30 70,50 40,70"
        })]
      })
    });
  }
  const effectiveSkin = getEffectiveValue('skin', attributes, context);
  const styles = {
    '--videopack-play-button-color': effectivePlayColor || undefined,
    '--videopack-play-button-secondary-color': effectivePlaySecondaryColor || undefined
  };
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
    className: `play-button-container video-js ${effectiveSkin} vjs-big-play-centered vjs-paused vjs-controls-enabled ${effectivePlayColor ? 'videopack-has-play-button-color' : ''} ${effectivePlaySecondaryColor ? 'videopack-has-play-button-secondary-color' : ''}`,
    style: styles,
    children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("button", {
      className: "vjs-big-play-button",
      type: "button",
      title: (0,external_wp_i18n_namespaceObject.__)('Play Video', 'video-embed-thumbnail-generator'),
      "aria-disabled": "false",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
        className: "vjs-icon-placeholder",
        "aria-hidden": "true"
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
        className: "vjs-control-text",
        "aria-live": "polite",
        children: (0,external_wp_i18n_namespaceObject.__)('Play Video', 'video-embed-thumbnail-generator')
      })]
    })
  });
}
function Edit({
  attributes,
  setAttributes,
  context
}) {
  const {
    play_button_color,
    play_button_secondary_color
  } = attributes;
  const isInsideThumbnail = !!context?.['videopack/isInsideThumbnail'];
  const isInsidePlayer = !!context?.['videopack/isInsidePlayer'];
  const config = typeof window !== 'undefined' ? window.videopack_config : undefined;
  const embed_method = typeof config !== 'undefined' ? config.embed_method : 'Video.js';
  const THEME_COLORS = config?.themeColors;
  const colorFallbacks = (0,external_wp_element_namespaceObject.useMemo)(() => getColorFallbacks({
    play_button_color: getEffectiveValue('play_button_color', {}, context),
    play_button_secondary_color: getEffectiveValue('play_button_secondary_color', {}, context)
  }), [context]);
  const overlayStyles = {};
  if (isInsidePlayer || isInsideThumbnail) {
    overlayStyles.position = 'absolute';
    overlayStyles.top = '50%';
    overlayStyles.left = '50%';
    overlayStyles.transform = 'translate(-50%, -50%)';
    overlayStyles.zIndex = 115;
    overlayStyles.width = 'auto';
    overlayStyles.height = 'auto';
  }
  const blockProps = (0,external_wp_blockEditor_namespaceObject.useBlockProps)({
    className: `videopack-play-button-block ${isInsidePlayer ? 'is-overlay' : ''}`,
    style: overlayStyles
  });
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.InspectorControls, {
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.PanelBody, {
        title: (0,external_wp_i18n_namespaceObject.__)('Colors', 'video-embed-thumbnail-generator'),
        initialOpen: true,
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
          className: "videopack-color-section",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
            className: "videopack-color-flex-row",
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(CompactColorPicker_CompactColorPicker, {
                label: 'WordPress Default' === embed_method ? (0,external_wp_i18n_namespaceObject.__)('Color', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_namespaceObject.__)('Icon', 'video-embed-thumbnail-generator'),
                value: play_button_color,
                onChange: value => setAttributes({
                  play_button_color: value
                }),
                colors: THEME_COLORS,
                fallbackValue: colorFallbacks.play_button_color
              })
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(CompactColorPicker_CompactColorPicker, {
                label: 'WordPress Default' === embed_method ? (0,external_wp_i18n_namespaceObject.__)('Hover', 'video-embed-thumbnail-generator') : (0,external_wp_i18n_namespaceObject.__)('Accent', 'video-embed-thumbnail-generator'),
                value: play_button_secondary_color,
                onChange: value => setAttributes({
                  play_button_secondary_color: value
                }),
                colors: THEME_COLORS,
                fallbackValue: colorFallbacks.play_button_secondary_color
              })
            })]
          })
        })
      })
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      ...blockProps,
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(PlayButton, {
        attributes: attributes,
        context: context
      })
    })]
  });
}
;// ./src/blocks/play-button/save.js
function save() {
  return null;
}
;// ./src/blocks/play-button/block.json
const block_namespaceObject = /*#__PURE__*/JSON.parse('{"UU":"videopack/play-button"}');
;// ./src/blocks/play-button/index.js




(0,external_wp_blocks_namespaceObject.registerBlockType)(block_namespaceObject.UU, {
  edit: Edit,
  save: save
});
/******/ })()
;