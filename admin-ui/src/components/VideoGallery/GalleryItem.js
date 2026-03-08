/* global videopack_config, ResizeObserver */

import { useEffect, useState, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon } from '@wordpress/components';
import { pencil, close, dragHandle } from '@wordpress/icons';
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
	const embed_method =
		attributes.embed_method || videopack_config.embed_method;

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

	const buttonContainerRef = useRef(null);
	const mejsButtonRef = useRef(null);

	useEffect(() => {
		if (
			embed_method !== 'WordPress Default' ||
			!buttonContainerRef.current
		) {
			return;
		}

		const resizeObserver = new ResizeObserver((entries) => {
			if (!mejsButtonRef.current) {
				return;
			}

			for (const entry of entries) {
				const containerWidth = entry.contentRect.width;
				const desiredButtonWidth = containerWidth * 0.25;
				const initialButtonWidth = 80; // Default ME.js button width
				const finalButtonWidth = Math.min(desiredButtonWidth, 90);
				const scale = finalButtonWidth / initialButtonWidth;

				mejsButtonRef.current.style.transform = `translate(-50%, -50%) scale(${scale})`;
			}
		});

		resizeObserver.observe(buttonContainerRef.current);

		return () => {
			resizeObserver.disconnect();
		};
	}, [embed_method]);

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
			title: __('Edit Video', 'video-embed-thumbnail-generator'),
			button: {
				text: __('Update', 'video-embed-thumbnail-generator'),
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
			className={`gallery-thumbnail videopack-gallery-item ${skin || ''}`}
		>
			<div
				className="gallery-item-clickable-area"
				ref={buttonContainerRef}
				onClick={() => {
					setOpenVideo(videoRecord);
					setCurrentVideoIndex(videoIndex);
				}}
			>
				<img
					src={thumbnailUrl}
					srcSet={thumbnailSrcset}
					alt={decodeEntities(videoRecord.title)}
				/>
				{'WordPress Default' === embed_method ? (
					<div className="mejs-overlay mejs-layer mejs-overlay-play">
						<div
							ref={mejsButtonRef}
							className="mejs-overlay-button"
							role="button"
							tabIndex="0"
							aria-label={__(
								'Play',
								'video-embed-thumbnail-generator'
							)}
							aria-pressed="false"
						></div>
					</div>
				) : (
					<div
						className={`play-button-container video-js ${skin} vjs-big-play-centered vjs-paused vjs-controls-enabled`}
					>
						<button
							className="vjs-big-play-button"
							type="button"
							title={__(
								'Play Video',
								'video-embed-thumbnail-generator'
							)}
							aria-disabled="false"
						>
							<span
								className="vjs-icon-placeholder"
								aria-hidden="true"
							/>
							<span
								className="vjs-control-text"
								aria-live="polite"
							>
								{__(
									'Play Video',
									'video-embed-thumbnail-generator'
								)}
							</span>
						</button>
					</div>
				)}
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
						className="videopack-drag-handle"
						{...listeners}
						title={__(
							'Drag to reorder',
							'video-embed-thumbnail-generator'
						)}
					>
						<Icon icon={dragHandle} />
					</button>
					<div
						className="gallery-item-edit"
						onClick={(e) => {
							e.stopPropagation();
							openMediaModal();
						}}
						title={__('Edit', 'video-embed-thumbnail-generator')}
					>
						<button type="button" className="videopack-edit-item">
							<Icon icon={pencil} />
						</button>
					</div>
					<div
						className="gallery-item-remove"
						onClick={(e) => {
							e.stopPropagation();
							onRemove(videoRecord.attachment_id);
						}}
						title={__('Remove', 'video-embed-thumbnail-generator')}
					>
						<button type="button" className="videopack-remove-item">
							<Icon icon={close} />
						</button>
					</div>
				</>
			)}
			{isEditing && isLastItem && isHoveringGallery && (
				<button
					className="gallery-add-button"
					onClick={onAddVideo}
					title={__('Add video', 'video-embed-thumbnail-generator')}
				>
					<span className="dashicons dashicons-plus-alt" />
				</button>
			)}
		</div>
	);
};

export default GalleryItem;
