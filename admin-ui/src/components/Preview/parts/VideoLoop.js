import TemplatePreview from '../TemplatePreview';

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

	return (
		<div
			className={`videopack-video-loop layout-${layout} columns-${columns} ${
				play_button_color ? 'videopack-has-play-button-color' : ''
			} ${
				play_button_secondary_color ? 'videopack-has-play-button-secondary-color' : ''
			}`}
			style={{
				'--videopack-play-button-color': play_button_color || undefined,
				'--videopack-play-button-secondary-color': play_button_secondary_color || undefined,
				'--videopack-title-color': context['videopack/title_color'] || undefined,
				'--videopack-title-background-color': context['videopack/title_background_color'] || undefined,
			}}
		>
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
								context={context}
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
