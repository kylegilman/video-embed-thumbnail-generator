/**
 * A single item within the video list, displaying a player and controls.
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icon } from '@wordpress/components';
import { pencil, close, dragHandle } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import VideoPlayer from '../VideoPlayer/VideoPlayer';

/**
 * VideoListItem component.
 *
 * @param {Object}   props             Component props.
 * @param {Object}   props.video       Video data record.
 * @param {Object}   props.attributes  Block attributes.
 * @param {Object}   props.options     Global player options.
 * @param {boolean}  props.isEditing   Whether the item is in editing mode.
 * @param {boolean}  props.showOverlay Whether to show a block overlay.
 * @param {Function} props.onEdit      Callback to open the media modal for editing.
 * @param {Function} props.onRemove    Callback to remove the video item.
 * @return {JSX.Element} The VideoListItem component.
 */
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
						title={__('Edit', 'video-embed-thumbnail-generator')}
						type="button"
					>
						<Icon icon={pencil} />
					</button>
					<button
						className="videopack-remove-item"
						onClick={() => onRemove(video.attachment_id)}
						title={__('Remove', 'video-embed-thumbnail-generator')}
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
