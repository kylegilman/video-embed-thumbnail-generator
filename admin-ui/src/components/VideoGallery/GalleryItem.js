/* global videopack_config */

import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const GalleryItem = ({
	attributes,
	videoRecord,
	setOpenVideo,
	videoIndex,
	setCurrentVideoIndex,
	isEditing,
	onRemove,
	onEdit,
	isLastItem,
	onAddVideo,
	isHoveringGallery,
}) => {
	const { skin, gallery_title } = attributes;

	const {
		attributes: sortableAttributes,
		listeners,
		setNodeRef,
		transform,
		transition,
	} = useSortable({ id: videoRecord.attachment_id, disabled: !isEditing });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const [thumbnailUrl, setThumbnailUrl] = useState(
		videopack_config.url + '/src/images/nothumbnail.jpg'
	);
	const [thumbnailSrcset, setThumbnailSrcset] = useState(null);

	useEffect(() => {
		if (videoRecord?.poster_url) {
			setThumbnailUrl(videoRecord.poster_url);
		}
		if (videoRecord?.poster_srcset) {
			setThumbnailSrcset(videoRecord.poster_srcset);
		}
	}, [videoRecord]);

	const openMediaModal = () => {
		const frame = window.wp.media({
			title: __('Edit Video'),
			button: {
				text: __('Update'),
			},
			multiple: false,
			library: {
				type: 'video',
			},
		});

		frame.on('open', () => {
			const selection = frame.state().get('selection');
			if (videoRecord.attachment_id) {
				const attachment = window.wp.media.attachment(
					videoRecord.attachment_id
				);
				attachment.fetch().done(() => {
					selection.add(attachment);
				});
			}
		});

		frame.on('select', () => {
			const newAttachment = frame
				.state()
				.get('selection')
				.first()
				.toJSON();
			onEdit(videoRecord.attachment_id, newAttachment);
		});

		frame.open();
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...sortableAttributes}
			className="gallery-thumbnail videopack-gallery-item"
		>
			<div
				className="gallery-item-clickable-area"
				onClick={() => {
					if (!isEditing) {
						setOpenVideo(videoRecord);
						setCurrentVideoIndex(videoIndex);
					}
				}}
			>
				<img
					src={thumbnailUrl}
					srcSet={thumbnailSrcset}
					alt={decodeEntities(videoRecord.title)}
				/>
				<div className={`play-button-container ${skin}`}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 500 500"
					>
						<circle
							className="play-button-circle"
							cx="250"
							cy="250"
							r="230"
						/>
						<polygon
							className="play-button-triangle"
							points="374.68,250 188,142 188,358"
						/>
					</svg>
				</div>
				{gallery_title && (
					<div className="video-title">
						<div className="video-title-background" />
						<span className="video-title-text">
							{decodeEntities(videoRecord.title)}
						</span>
					</div>
				)}
			</div>
			{isEditing && (
				<>
					<button
						className="gallery-item-drag-handle"
						{...listeners}
						title={__('Drag to reorder')}
					>
						<span className="dashicons dashicons-move" />
					</button>
					<button
						className="gallery-item-edit"
						onClick={(e) => {
							e.stopPropagation();
							openMediaModal();
						}}
						title={__('Edit')}
					>
						<span className="dashicons dashicons-edit" />
					</button>
					<div
						className="gallery-item-remove"
						onClick={(e) => {
							e.stopPropagation();
							onRemove(videoRecord.attachment_id);
						}}
						title={__('Remove')}
					>
						X
					</div>
				</>
			)}
			{isEditing && isLastItem && isHoveringGallery && (
				<button
					className="gallery-add-button"
					onClick={onAddVideo}
					title={__('Add video')}
				>
					<span className="dashicons dashicons-plus-alt" />
				</button>
			)}
		</div>
	);
};

export default GalleryItem;
