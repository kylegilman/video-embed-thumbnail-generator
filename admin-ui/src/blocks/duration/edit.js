import {
	useBlockProps,
	BlockControls,
	BlockVerticalAlignmentControl,
	AlignmentControl,
	InspectorControls,
} from '@wordpress/block-editor';
import { ToolbarGroup } from '@wordpress/components';
import BackgroundToggleButton from '../../components/BackgroundToggleButton/BackgroundToggleButton';
import TitleColorPanel from '../../components/TitleColorPanel/TitleColorPanel';
import VideoDuration from '../../components/VideoDuration/VideoDuration';
import useVideopackContext from '../../hooks/useVideopackContext';
import useShowBackground from '../../hooks/useShowBackground';

// Duration shares "badge" title/background colors with Title/View-count —
// see Overlays.scss's $badge-selectors. Module-level so the reference stays
// stable across renders (useVideopackContext depends on it for memoization).
const CLASS_KEYS = ['title_color', 'title_background_color'];

/**
 * Edit component for the Videopack Video Duration block.
 *
 * @param {Object}   root0               Component props.
 * @param {Object}   root0.attributes    Block attributes.
 * @param {Function} root0.setAttributes Attribute setter.
 * @param {Object}   root0.context       Block context.
 * @return {Element}                     The rendered component.
 */
export default function Edit({ attributes, setAttributes, context }) {
	const vpContext = useVideopackContext(attributes, context, {
		classKeys: CLASS_KEYS,
	});
	const { textAlign, position: attrPosition } = attributes;

	const isInsideThumbnail = !!context['videopack/isInsideThumbnail'];
	const isInsidePlayerOverlay = !!context['videopack/isInsidePlayerOverlay'];
	const isInsidePlayerContainer =
		!!context['videopack/isInsidePlayerContainer'];
	const isOverlay = isInsideThumbnail || isInsidePlayerOverlay;
	const finalShowBackground = useShowBackground(
		attributes,
		context,
		isOverlay
	);

	let defaultAlign = 'left';
	if (isOverlay || isInsidePlayerContainer) {
		defaultAlign = 'right';
	}
	const finalTextAlign =
		textAlign || context['videopack/textAlign'] || defaultAlign;
	const position = attrPosition || context['videopack/position'] || 'top';

	const blockProps = useBlockProps({
		className: `videopack-video-duration-block ${vpContext.classes} ${
			isOverlay ? 'is-inside-thumbnail is-overlay is-badge' : ''
		} ${isOverlay && !finalShowBackground ? 'has-no-background' : ''} position-${position} has-text-align-${finalTextAlign}`,
		style: vpContext.style,
	});

	return (
		<>
			<BlockControls>
				{isOverlay && (
					<BlockVerticalAlignmentControl
						value={position}
						onChange={(nextPosition) => {
							setAttributes({
								position: nextPosition || undefined,
							});
						}}
					/>
				)}
				<AlignmentControl
					value={finalTextAlign}
					onChange={(nextAlign) => {
						setAttributes({ textAlign: nextAlign });
					}}
				/>
				{isOverlay && (
					<ToolbarGroup>
						<BackgroundToggleButton
							showBackground={finalShowBackground}
							onChange={(value) =>
								setAttributes({ showBackground: value })
							}
						/>
					</ToolbarGroup>
				)}
			</BlockControls>
			<InspectorControls>
				<TitleColorPanel
					attributes={attributes}
					setAttributes={setAttributes}
					resolved={vpContext.resolved}
				/>
			</InspectorControls>
			<VideoDuration
				blockProps={blockProps}
				attributes={attributes}
				context={context}
			/>
		</>
	);
}
