import { Button, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { close } from '@wordpress/icons';
import { decodeEntities } from '@wordpress/html-entities';

export default function CollectionFilterSettings({
	attributes,
	setAttributes,
	queryData,
}) {
	const { gallery_exclude, gallery_include } = attributes;
	const { excludedVideos } = queryData;

	if (!excludedVideos || excludedVideos.length === 0) {
		return null;
	}

	const handleUnexcludeItem = (idToRestore) => {
		const currentExclude = gallery_exclude
			? gallery_exclude.split(',').map((id) => parseInt(id.trim(), 10))
			: [];
		const newGalleryExclude = currentExclude
			.filter((id) => id !== idToRestore)
			.join(',');

		let newGalleryInclude = gallery_include;
		if (gallery_include) {
			const currentInclude = gallery_include
				.split(',')
				.map((id) => parseInt(id.trim(), 10));
			if (!currentInclude.includes(idToRestore)) {
				currentInclude.push(idToRestore);
				newGalleryInclude = currentInclude.join(',');
			}
		}

		setAttributes({
			gallery_exclude: newGalleryExclude,
			gallery_include: newGalleryInclude,
		});
	};

	return (
		<div className="videopack-excluded-videos">
			<p>{__('Excluded Videos', 'video-embed-thumbnail-generator')}</p>
			<div className="videopack-excluded-list">
				{excludedVideos.map((video) => (
					<div key={video.id} className="videopack-excluded-item">
						<div className="videopack-excluded-thumbnail">
							{video.meta?.['_videopack-meta']?.poster ? (
								<img
									src={video.meta['_videopack-meta'].poster}
									alt={decodeEntities(video.title.rendered)}
								/>
							) : (
								<Icon icon="format-video" />
							)}
						</div>
						<span className="videopack-excluded-title">
							{decodeEntities(video.title.rendered)}
						</span>
						<Button
							icon={close}
							onClick={() => handleUnexcludeItem(video.id)}
							label={__(
								'Restore',
								'video-embed-thumbnail-generator'
							)}
							className="videopack-restore-item"
							showTooltip
						/>
					</div>
				))}
			</div>
		</div>
	);
}
