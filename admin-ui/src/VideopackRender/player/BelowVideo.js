import { _n, sprintf } from '@wordpress/i18n';

const BelowVideo = ({ attributes, attachment }) => {
	const { view_count, caption } = attributes;

	let viewStarts = 0;
	if (attachment && attachment.hasResolved && (view_count || caption)) {
		if (attachment.record?.meta?.['_kgvid-meta']?.starts) {
			viewStarts = Number(
				attachment.record?.meta?.['_kgvid-meta']?.starts
			);
		}
		return (
			<>
				<div className="videopack-below-video">
					{view_count && (
						<div className="viewcount">
							{sprintf(
								_n('%d view', '%d views', viewStarts),
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
