/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// external ["wp","blocks"]
const external_wp_blocks_namespaceObject = window["wp"]["blocks"];
;// external ["wp","blockEditor"]
const external_wp_blockEditor_namespaceObject = window["wp"]["blockEditor"];
;// external ["wp","data"]
const external_wp_data_namespaceObject = window["wp"]["data"];
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
;// external "ReactJSXRuntime"
const external_ReactJSXRuntime_namespaceObject = window["ReactJSXRuntime"];
;// ./src/components/Pagination/Pagination.js




/**
 * A standardized pagination component for use in both blocks and previews.
 *
 * @param {Object}   props              Component props.
 * @param {number}   props.currentPage  The current active page.
 * @param {number}   props.totalPages   The total number of pages.
 * @param {Function} props.onPageChange Callback when a page is changed.
 * @param {Object}   props.attributes   Optional. Block attributes for color resolution.
 * @param {Object}   props.context      Optional. Block context for color resolution.
 */

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  attributes = {},
  context = {},
  style: propStyle
}) {
  if (totalPages <= 1) {
    return null;
  }
  const paginationColor = getEffectiveValue('pagination_color', attributes, context);
  const paginationBg = getEffectiveValue('pagination_background_color', attributes, context);
  const paginationActiveBg = getEffectiveValue('pagination_active_bg_color', attributes, context);
  const paginationActiveColor = getEffectiveValue('pagination_active_color', attributes, context);
  const style = {
    '--videopack-pagination-color': paginationColor,
    '--videopack-pagination-bg': paginationBg,
    '--videopack-pagination-active-bg': paginationActiveBg,
    '--videopack-pagination-active-color': paginationActiveColor,
    ...propStyle
  };
  const getPageNumbers = () => {
    const pages = [];
    const showMax = 5; // Max number of page buttons to show around current page

    if (totalPages <= showMax + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show page 1
      pages.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust start/end to always show 3 numbers in the middle if possible
      if (currentPage <= 3) {
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }
      if (start > 2) {
        pages.push('...');
      }
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (end < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }
    return pages;
  };
  const pages = getPageNumbers();
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("nav", {
    className: "videopack-pagination",
    "aria-label": (0,external_wp_i18n_namespaceObject.__)('Pagination', 'video-embed-thumbnail-generator'),
    style: style,
    children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("ul", {
      className: "videopack-pagination-list",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("li", {
        className: "videopack-pagination-item",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("button", {
          className: `videopack-pagination-button prev page-numbers ${currentPage <= 1 ? 'is-hidden videopack-hidden' : ''}`,
          onClick: () => currentPage > 1 && onPageChange(currentPage - 1),
          "aria-label": (0,external_wp_i18n_namespaceObject.__)('Previous Page', 'video-embed-thumbnail-generator'),
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
            className: "videopack-pagination-arrow",
            children: "<"
          })
        })
      }), pages.map((page, index) => /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("li", {
        className: "videopack-pagination-item",
        children: page === '...' ? /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
          className: "page-numbers dots",
          children: page
        }) : /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("button", {
          className: `videopack-pagination-button page-numbers ${page === currentPage ? 'is-active current' : ''}`,
          onClick: () => typeof page === 'number' && onPageChange(page),
          "aria-current": page === currentPage ? 'page' : undefined,
          children: page
        })
      }, index)), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("li", {
        className: "videopack-pagination-item",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("button", {
          className: `videopack-pagination-button next page-numbers ${currentPage >= totalPages ? 'is-hidden videopack-hidden' : ''}`,
          onClick: () => currentPage < totalPages && onPageChange(currentPage + 1),
          "aria-label": (0,external_wp_i18n_namespaceObject.__)('Next Page', 'video-embed-thumbnail-generator'),
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
            className: "videopack-pagination-arrow",
            children: ">"
          })
        })
      })]
    })
  });
}
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
;// external ["wp","element"]
const external_wp_element_namespaceObject = window["wp"]["element"];
;// ./src/utils/VideopackContext.js

const VideopackContext = (0,external_wp_element_namespaceObject.createContext)({
  gallery_pagination: undefined,
  gallery_per_page: undefined,
  totalPages: undefined,
  currentPage: undefined
});
const VideopackProvider = VideopackContext.Provider;
const useVideopackContext = () => (0,external_wp_element_namespaceObject.useContext)(VideopackContext);
/* harmony default export */ const utils_VideopackContext = ((/* unused pure expression or super */ null && (VideopackContext)));
;// ./src/blocks/pagination/edit.js









/* global videopack_config */

function Edit({
  attributes,
  setAttributes,
  context,
  clientId,
  showPaginationSettings = true
}) {
  const {
    pagination_color,
    pagination_background_color,
    pagination_active_bg_color,
    pagination_active_color
  } = attributes;
  const vpContext = useVideopackContext();
  const currentPage = vpContext.currentPage || context['videopack/currentPage'] || 1;
  const totalPages = vpContext.totalPages || context['videopack/totalPages'] || 1;
  const THEME_COLORS = videopack_config?.themeColors || [];
  const {
    updateBlockAttributes
  } = (0,external_wp_data_namespaceObject.useDispatch)('core/block-editor');
  const {
    parentClientId
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    return {
      parentClientId: select('core/block-editor').getBlockRootClientId(clientId)
    };
  }, [clientId]);
  const handlePageChange = newPage => {
    if (parentClientId) {
      updateBlockAttributes(parentClientId, {
        currentPage: newPage
      });
    }
  };
  const blockProps = (0,external_wp_blockEditor_namespaceObject.useBlockProps)({
    className: 'videopack-pagination-block'
  });
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.InspectorControls, {
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.PanelBody, {
        title: (0,external_wp_i18n_namespaceObject.__)('Pagination Colors', 'video-embed-thumbnail-generator'),
        children: showPaginationSettings && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
          className: "videopack-color-section",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("p", {
            className: "videopack-settings-section-title",
            children: (0,external_wp_i18n_namespaceObject.__)('Pagination', 'video-embed-thumbnail-generator')
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
            className: "videopack-color-flex-row is-pagination",
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(CompactColorPicker_CompactColorPicker, {
                label: (0,external_wp_i18n_namespaceObject.__)('Outline/Text', 'video-embed-thumbnail-generator'),
                value: pagination_color,
                onChange: value => setAttributes({
                  pagination_color: value
                }),
                colors: THEME_COLORS,
                fallbackValue: getEffectiveValue('pagination_color', {}, context)
              })
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(CompactColorPicker_CompactColorPicker, {
                label: (0,external_wp_i18n_namespaceObject.__)('Background', 'video-embed-thumbnail-generator'),
                value: pagination_background_color,
                onChange: value => setAttributes({
                  pagination_background_color: value
                }),
                colors: THEME_COLORS,
                fallbackValue: getEffectiveValue('pagination_background_color', {}, context)
              })
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(CompactColorPicker_CompactColorPicker, {
                label: (0,external_wp_i18n_namespaceObject.__)('Active Background', 'video-embed-thumbnail-generator'),
                value: pagination_active_bg_color,
                onChange: value => setAttributes({
                  pagination_active_bg_color: value
                }),
                colors: THEME_COLORS,
                fallbackValue: getEffectiveValue('pagination_active_bg_color', {}, context)
              })
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
              className: "videopack-color-flex-item",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(CompactColorPicker_CompactColorPicker, {
                label: (0,external_wp_i18n_namespaceObject.__)('Active Text', 'video-embed-thumbnail-generator'),
                value: pagination_active_color,
                onChange: value => setAttributes({
                  pagination_active_color: value
                }),
                colors: THEME_COLORS,
                fallbackValue: getEffectiveValue('pagination_active_color', {}, context)
              })
            })]
          })]
        })
      })
    }), totalPages <= 1 ? /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      ...blockProps,
      className: `${blockProps.className} is-placeholder`,
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(Pagination, {
        currentPage: 1,
        totalPages: 10,
        onPageChange: () => {},
        attributes: attributes,
        context: context
      })
    }) : /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      ...blockProps,
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(Pagination, {
        currentPage: currentPage,
        totalPages: totalPages,
        onPageChange: handlePageChange,
        attributes: attributes,
        context: context
      })
    })]
  });
}
;// ./src/blocks/pagination/save.js
function save() {
  return null;
}
;// ./src/blocks/pagination/block.json
const block_namespaceObject = /*#__PURE__*/JSON.parse('{"UU":"videopack/pagination"}');
;// ./src/blocks/pagination/index.js




(0,external_wp_blocks_namespaceObject.registerBlockType)(block_namespaceObject.UU, {
  edit: Edit,
  save: save
});
/******/ })()
;