import { useMemo } from '@wordpress/element';
import TemplatePreview from '../TemplatePreview';
import CustomDuotoneFilter from '../../Duotone/CustomDuotoneFilter';

/**
 * Loop component for rendering multiple Videopack items.
 */
export default function VideoLoop({
	children,
	attributes = {},
	context = {},
	innerBlocks,
}) {
	const videos = context['videopack/videos'] || attributes.videos || [];
	const layout = context['videopack/layout'] || 'grid';
	const columns = context['videopack/columns'] || 3;

	const play_button_color = attributes.play_button_color || context['videopack/play_button_color'];
	const play_button_secondary_color = attributes.play_button_secondary_color || context['videopack/play_button_secondary_color'];

	const duotone = attributes?.style?.color?.duotone || attributes?.duotone || context['videopack/duotone'];
	const loopDuotoneId = useMemo(() => {
		if (!duotone || !Array.isArray(duotone)) return null;
		return `videopack-loop-duotone-${Math.random().toString(36).substr(2, 9)}`;
	}, [duotone]);

	const loopPresetClass = (duotone && typeof duotone === 'string' && duotone.startsWith('var:preset|duotone|')) 
		? `wp-duotone-${duotone.split('|').pop()}` 
		: '';

	const loopContext = useMemo(() => {
		if (!loopDuotoneId) return context;
		return {
			...context,
			'videopack/loopDuotoneId': loopDuotoneId,
		};
	}, [context, loopDuotoneId]);

	return (
		<div
			className={`videopack-video-loop layout-${layout} columns-${columns} ${
				play_button_color ? 'videopack-has-play-button-color' : ''
			} ${
				play_button_secondary_color ? 'videopack-has-play-button-secondary-color' : ''
			} ${loopDuotoneId || ''} ${loopPresetClass}`}
			style={{
				'--videopack-play-button-color': play_button_color || undefined,
				'--videopack-play-button-secondary-color': play_button_secondary_color || undefined,
				'--videopack-title-color': context['videopack/title_color'] || undefined,
				'--videopack-title-background-color': context['videopack/title_background_color'] || undefined,
			}}
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
