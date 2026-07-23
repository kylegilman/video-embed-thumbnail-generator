import { __experimentalUseBlockPreview as useBlockPreview } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';

/**
 * Renders a real, disabled preview of a grid item's template blocks — built on
 * the real Edit components (via useBlockPreview) rather than a hand-maintained
 * parallel reimplementation, so the preview and the real thing can never drift
 * apart. Mirrors core/post-template's own preview pattern. Per-video data
 * flows in purely through the ambient BlockContextProvider the caller already
 * wraps this in — this component takes no video-specific props at all.
 *
 * Shared between edit.js's static (preview-mode) grid and SortableGrid.js's
 * interactive (real-editor) grid, so both paths render each item identically.
 *
 * @param {Object}   root0            Component props.
 * @param {Array}    root0.blocks     The template blocks to preview.
 * @param {boolean}  root0.isHidden   Whether to hide (not unmount) this preview.
 * @param {Function} root0.onActivate Callback to make this item's video active.
 */
const LoopItemPreview = memo(function LoopItemPreview({
	blocks,
	isHidden,
	onActivate,
}) {
	const previewProps = useBlockPreview({
		blocks,
		props: { className: 'wp-block-videopack-loop__item-preview' },
	});

	return (
		<div
			{...previewProps}
			style={isHidden ? { display: 'none' } : undefined}
			onClick={onActivate}
			onKeyPress={onActivate}
			role="button"
			tabIndex={0}
		/>
	);
});

export default LoopItemPreview;
