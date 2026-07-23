/**
 * Builds the flat attribute set that videopack/collection, videopack/player-container,
 * and videopack/loop need on their OWN attributes to actually apply live design
 * values (colors, skin, watermark) in a preview.
 *
 * These three blocks are Ui.php's $receives_shared_attributes list
 * (register_videopack_block_context()) — Gutenberg's own providesContext
 * mechanism (@wordpress/block-editor's InnerBlocks) reads each of these keys
 * only from that block's own saved attribute, never from ambient/injected
 * React context, and this automatic wrapper is nested deeper than any manual
 * BlockContextProvider/VideopackContextBridge — so it always wins. Passing
 * these values only via an outer context provider silently gets overridden
 * back to undefined for any descendant.
 *
 * @param {Object} source    Settings-like object (global settings, or a
 *                           resolved design-value object such as
 *                           useVideopackContext's `resolved`) to read values
 *                           from.
 * @param {Object} fallbacks Optional live-computed color fallbacks (from
 *                           utils/colors.js's getColorFallbacks) to fall back
 *                           to for any color left unset in `source`. Without
 *                           this, an unset color falls through — via
 *                           getEffectiveValue's own "global defaults" step —
 *                           to videopack_config.options, which only reflects
 *                           the last *saved* value from page load, not this
 *                           session's live (possibly unsaved) skin/embed
 *                           method choice that getColorFallbacks accounts for.
 * @return {Object} Flat design attributes, omitting unset values.
 */
export default function getSharedDesignAttributes(source = {}, fallbacks = {}) {
	const attrs = {
		skin: source.skin,
		title_color: source.title_color || fallbacks.title_color,
		title_background_color:
			source.title_background_color || fallbacks.title_background_color,
		play_button_color:
			source.play_button_color || fallbacks.play_button_color,
		play_button_secondary_color:
			source.play_button_secondary_color ||
			fallbacks.play_button_secondary_color,
		control_bar_bg_color:
			source.control_bar_bg_color || fallbacks.control_bar_bg_color,
		control_bar_color:
			source.control_bar_color || fallbacks.control_bar_color,
		pagination_color: source.pagination_color || fallbacks.pagination_color,
		pagination_background_color:
			source.pagination_background_color ||
			fallbacks.pagination_background_color,
		pagination_active_bg_color:
			source.pagination_active_bg_color ||
			fallbacks.pagination_active_bg_color,
		pagination_active_color:
			source.pagination_active_color || fallbacks.pagination_active_color,
		watermark: source.watermark,
		watermark_styles: source.watermark_styles,
		watermark_link_to: source.watermark_link_to,
		watermark_align:
			source.watermark_align ?? source.watermark_styles?.align,
		watermark_valign:
			source.watermark_valign ?? source.watermark_styles?.valign,
		watermark_scale:
			source.watermark_scale ?? source.watermark_styles?.scale,
		watermark_x: source.watermark_x ?? source.watermark_styles?.x,
		watermark_y: source.watermark_y ?? source.watermark_styles?.y,
	};

	return Object.fromEntries(
		Object.entries(attrs).filter(([, value]) => value !== undefined)
	);
}
