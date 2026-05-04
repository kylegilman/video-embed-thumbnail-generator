import { useMemo } from '@wordpress/element';
import TemplatePreview from '../TemplatePreview';
import CustomDuotoneFilter from '../../Duotone/CustomDuotoneFilter';
import useVideopackContext from '../../../hooks/useVideopackContext';

/**
 * Loop component for rendering multiple Videopack items.
 *
 * @param {Object} root0             Component props.
 * @param {Node}   root0.children    Children.
 * @param {Object} root0.attributes  Block attributes.
 * @param {Object} root0.context     Block context.
 * @param {Array}  root0.innerBlocks Inner blocks data.
 */
export default function VideoLoop({
	children,
	attributes = {},
	context = {},
	innerBlocks,
}) {
	const { resolved, style, classes } = useVideopackContext(
		attributes,
		context
	);
	const { videos = [], layout = 'grid', columns = 3, duotone } = resolved;

	const loopDuotoneId = useMemo(() => {
		if (!duotone || !Array.isArray(duotone)) {
			return null;
		}
		return `videopack-loop-duotone-${Math.random().toString(36).substr(2, 9)}`;
	}, [duotone]);

	const loopPresetClass =
		duotone &&
		typeof duotone === 'string' &&
		duotone.startsWith('var:preset|duotone|')
			? `wp-duotone-${duotone.split('|').pop()}`
			: '';

	const loopContext = useMemo(() => {
		if (!loopDuotoneId) {
			return context;
		}
		return {
			...context,
			'videopack/loopDuotoneId': loopDuotoneId,
		};
	}, [context, loopDuotoneId]);

	return (
		<div
			className={`videopack-video-loop layout-${layout} columns-${columns} ${classes} ${loopDuotoneId || ''} ${loopPresetClass}`}
			style={style}
		>
			{loopDuotoneId && (
				<>
					<CustomDuotoneFilter colors={duotone} id={loopDuotoneId} />
					<style>
						{`
							.${loopDuotoneId} .vjs-poster,
							.${loopDuotoneId} .mejs-poster,
							.${loopDuotoneId} .videopack-thumbnail {
								filter: url(#${loopDuotoneId}) !important;
							}
							.${loopDuotoneId} .vjs-poster .vjs-poster,
							.${loopDuotoneId} .mejs-poster .mejs-poster {
								filter: none !important;
							}
							.${loopDuotoneId} .wp-block-videopack-player-container,
							.${loopDuotoneId} .wp-block-videopack-thumbnail,
							.${loopDuotoneId} [class*="wp-duotone-"] {
								filter: none !important;
							}
						`}
					</style>
				</>
			)}
			<div className="videopack-collection-grid">
				{videos.map((video, index) => (
					<div
						key={video.attachment_id || index}
						className="videopack-collection-item"
					>
						{innerBlocks ? (
							<TemplatePreview
								template={innerBlocks}
								video={video}
								context={loopContext}
							/>
						) : (
							children
						)}
					</div>
				))}
			</div>
		</div>
	);
}
