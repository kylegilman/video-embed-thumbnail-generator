/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// external ["wp","blocks"]
const external_wp_blocks_namespaceObject = window["wp"]["blocks"];
;// external ["wp","i18n"]
const external_wp_i18n_namespaceObject = window["wp"]["i18n"];
;// external ["wp","blockEditor"]
const external_wp_blockEditor_namespaceObject = window["wp"]["blockEditor"];
;// external "ReactJSXRuntime"
const external_ReactJSXRuntime_namespaceObject = window["ReactJSXRuntime"];
;// ./src/blocks/video-caption/edit.js



function Edit({
  attributes,
  setAttributes
}) {
  const {
    caption
  } = attributes;
  const blockProps = (0,external_wp_blockEditor_namespaceObject.useBlockProps)({
    className: 'videopack-video-caption-block'
  });
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
    ...blockProps,
    children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.RichText, {
      tagName: "figcaption",
      className: "wp-element-caption videopack-video-caption",
      value: caption,
      onChange: value => setAttributes({
        caption: value
      }),
      placeholder: (0,external_wp_i18n_namespaceObject.__)('Enter Caption…', 'video-embed-thumbnail-generator')
    })
  });
}
;// ./src/blocks/video-caption/save.js


function save({
  attributes
}) {
  const {
    caption
  } = attributes;
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.RichText.Content, {
    ...external_wp_blockEditor_namespaceObject.useBlockProps.save({
      className: 'wp-element-caption videopack-video-caption'
    }),
    tagName: "figcaption",
    value: caption
  });
}
;// ./src/blocks/video-caption/block.json
const block_namespaceObject = /*#__PURE__*/JSON.parse('{"UU":"videopack/video-caption"}');
;// ./src/blocks/video-caption/index.js




(0,external_wp_blocks_namespaceObject.registerBlockType)(block_namespaceObject.UU, {
  /**
   * @see ./edit.js
   */
  edit: Edit,
  /**
   * @see ./save.js
   */
  save: save
});
/******/ })()
;