import { __experimentalUseBlockPreview as useBlockPreview } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';

/**
 * Renders a real, disabled preview of a block tree — built on the real Edit
 * components (via useBlockPreview) rather than a hand-maintained parallel
 * reimplementation, so the preview and the real thing can never drift apart.
 * Shared across Classic Editor, the Settings page, and Attachment Details —
 * none of these contexts have an "editable item" concept (unlike Loop's own
 * grid, which needs click-to-activate state), so this is a pure static
 * preview. Per-instance data (video title, views, colors, etc.) flows in
 * purely through the ambient BlockContextProvider the caller wraps this in —
 * this component takes no video-specific props at all.
 *
 * @param {Object} root0             Component props.
 * @param {Array}  root0.blocks      The real block instances to preview (see utils/buildPreviewBlocks.js).
 * @param {string} [root0.className] Optional extra class name for the preview wrapper.
 */
function RealBlockPreview( { blocks, className } ) {
	const previewProps = useBlockPreview( {
		blocks,
		props: { className },
	} );

	return <div { ...previewProps } />;
}

export default memo( RealBlockPreview );
