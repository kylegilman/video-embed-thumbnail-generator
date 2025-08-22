import { Button, Placeholder } from '@wordpress/components';
import {
	BlockControls,
	BlockIcon,
	MediaPlaceholder,
	MediaReplaceFlow,
	useBlockProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';

import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';

import { getSettings } from '../../utils/utils';
import { videopack as icon } from '../../assets/icon';
import GalleryBlock from './GalleryBlock';

export default function edit({ attributes, setAttributes }) {
	const ALLOWED_MEDIA_TYPES = ['video'];
	const { gallery, gallery_include, gallery_id } = attributes;
	const [options, setOptions] = useState();
	const blockProps = useBlockProps();
	const { createErrorNotice } = useDispatch(noticesStore);
	const mediaUpload = useSelect(
		(select) => select(blockEditorStore).getSettings().mediaUpload,
		[]
	);

	const { postId } = useSelect(
		(select) => ({
			postId: select('core/editor').getCurrentPostId(),
		}),
		[]
	);

	const videoChildren = useSelect(
		(select) => {
			const attachments = select('core').getEntityRecords(
				'postType',
				'attachment',
				{ parent: postId, media_type: 'video' }
			);
			return attachments;
		},
		[postId]
	);

	useEffect(() => {
		getSettings().then((response) => {
			setOptions(response);
		});

		if (!gallery_id && !gallery_include && videoChildren) {
			const includeIds = videoChildren.map((item) => item.id).join(',');
			setAttributes({
				gallery: true,
				gallery_include: includeIds,
				gallery_id: postId,
			});
		}
	}, [gallery_id, gallery_include, videoChildren]);

	function setAttributesFromMedia(media) {
		const includeIds = media.map((item) => item.id).join(',');
		setAttributes({
			gallery: true,
			gallery_include: includeIds,
		});
	}

	function onSelectVideo(media) {
		const mediaArray = Array.isArray(media) ? media : [media];

		if (
			!mediaArray ||
			!mediaArray.some((item) => item.hasOwnProperty('url'))
		) {
			setAttributes({
				gallery: undefined,
				gallery_include: undefined,
				gallery_id: undefined,
			});
			return;
		}

		setAttributesFromMedia(mediaArray);
	}

	function onSelectURL(newSrc) {
		// This block is for galleries, so URL selection is less relevant.
		// However, keeping it for consistency if needed in the future.
		if (newSrc) {
			createErrorNotice(
				__('URL selection is not supported for galleries.'),
				{ type: 'snackbar' }
			);
		}
	}

	function onInsertGallery() {
		setAttributes({
			gallery: true,
			gallery_id: postId,
		});
	}

	function onUploadError(message) {
		createErrorNotice(message, { type: 'snackbar' });
	}

	const placeholder = (content) => {
		return (
			<Placeholder
				className="block-editor-media-placeholder"
				withIllustration={true}
				icon={icon}
				label={__('Videopack Video Gallery')}
				instructions={__(
					'Select multiple video files from your media library to create a gallery.'
				)}
			>
				{content}
				<Button
					__next40pxDefaultSize
					className="videopack-placeholder-gallery-button"
					variant="secondary"
					label={__(
						'Insert a gallery of all videos uploaded to this post'
					)}
					showTooltip
					onClick={onInsertGallery}
				>
					{__('Video Gallery')}
				</Button>
			</Placeholder>
		);
	};

	if (!gallery) {
		return (
			<div {...blockProps}>
				<MediaPlaceholder
					icon={<BlockIcon icon={icon} />}
					onSelect={onSelectVideo}
					onSelectURL={onSelectURL}
					accept="video/*"
					allowedTypes={ALLOWED_MEDIA_TYPES}
					value={attributes}
					onError={onUploadError}
					placeholder={placeholder}
					multiple={true}
				/>
			</div>
		);
	}

	return (
		<>
			<BlockControls group="other">
				<MediaReplaceFlow
					mediaId={gallery_id}
					mediaURL={gallery_include}
					allowedTypes={ALLOWED_MEDIA_TYPES}
					accept="video/*"
					onSelect={onSelectVideo}
					onSelectURL={onSelectURL}
					onError={onUploadError}
					multiple={true}
				/>
			</BlockControls>

			<GalleryBlock
				setAttributes={setAttributes}
				attributes={attributes}
				options={options}
				videoChildren={videoChildren}
			/>
		</>
	);
}
