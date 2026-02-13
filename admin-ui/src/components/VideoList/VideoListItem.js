import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icon } from '@wordpress/components';
import { pencil, close, dragHandle } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import VideoPlayer from '../VideoPlayer/VideoPlayer';

const VideoListItem = ({
	video,
	attributes,
	options,
	isEditing,
	showOverlay,
	onEdit,
	onRemove,
}) => {
	const {
		attributes: sortableAttributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: video.attachment_id, disabled: !isEditing });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
		position: 'relative',
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...sortableAttributes}
			className={`videopack-list-item${isDragging ? ' is-dragging' : ''}`}
		>
			{showOverlay && <div className="videopack-block-overlay" />}
			{isEditing && (
				<div className="videopack-list-item-controls">
					<button
						className="videopack-drag-handle"
						{...listeners}
						title={__(
							'Drag to reorder',
							'video-embed-thumbnail-generator'
						)}
						type="button"
					>
						<Icon icon={dragHandle} />
					</button>
					<button
						className="videopack-edit-item"
						onClick={() => onEdit(video)}
						title={__( 'Edit', 'video-embed-thumbnail-generator' )}
						type="button"
					>
						<Icon icon={pencil} />
					</button>
					<button
						className="videopack-remove-item"
						onClick={() => onRemove(video.attachment_id)}
						title={__(
							'Remove',
							'video-embed-thumbnail-generator'
						)}
						type="button"
					>
						<Icon icon={close} />
					</button>
				</div>
			)}
			<VideoPlayer
				attributes={{
					...options,
					...video.player_vars,
					...attributes,
					autoplay: false,
				}}
				onReady={() => {}}
			/>
		</div>
	);
};

export default VideoListItem;
