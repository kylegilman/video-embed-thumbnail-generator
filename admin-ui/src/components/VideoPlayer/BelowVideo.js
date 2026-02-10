import { _n, sprintf } from '@wordpress/i18n';

const BelowVideo = ({ attributes }) => {
	const { view_count, caption } = attributes;

	let viewStarts = 0;
	if ((attributes?.starts && view_count) || caption) {
		if (attributes?.starts) {
			viewStarts = Number(attributes?.starts);
		}
		return (
			<>
				<div className="videopack-below-video">
					{view_count && viewStarts > 0 && (
						<div className="viewcount">
							{sprintf(
								/* translators: %d is number of views */
								_n(
									'%d view',
									'%d views',
									viewStarts,
									'video-embed-thumbnail-generator'
								),
								viewStarts
							)}
						</div>
					)}
					{caption && <div className="caption">{caption}</div>}
				</div>
			</>
		);
	}
	return null;
};

export default BelowVideo;
