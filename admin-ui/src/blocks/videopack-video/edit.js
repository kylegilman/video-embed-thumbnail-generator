import { getBlobByURL, isBlobURL } from '@wordpress/blob';
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
import SingleVideoBlock from './SingleVideoBlock';
import './editor.scss';

const ALLOWED_MEDIA_TYPES = ['video'];

const Edit = ({ attributes, setAttributes, isSelected }) => {
	const { id, src } = attributes;
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

	const { attachment } = useSelect(
		(select) => ({
			attachment:
				id && typeof id === 'number'
					? select('core').getMedia(id)
					: undefined,
		}),
		[id]
	);

	useEffect(() => {
		if (attachment) {
			setAttributesFromMedia(attachment);
		}
	}, [attachment]);

	useEffect(() => {
		getSettings().then((response) => {
			setOptions(response);
		});

		if (!id && isBlobURL(src)) {
			const file = getBlobByURL(src);
			if (file) {
				mediaUpload({
					filesList: [file],
					onFileChange: ([videoFile]) => onSelectVideo(videoFile),
					onError: onUploadError,
					allowedTypes: ALLOWED_MEDIA_TYPES,
				});
			}
		}
	}, []);

	function setAttributesFromMedia(attachmentObject) {
		console.log(attachmentObject);
		const media_attributes = {
			src: attachmentObject.url,
			id: attachmentObject.id,
			poster: attachmentObject.meta?.['_videopack-meta']?.poster,
			total_thumbnails:
				attachmentObject.meta?.['_videopack-meta']?.total_thumbnails,
			title: attachmentObject.title?.rendered,
			caption: attachmentObject.caption?.raw,
			starts: attachmentObject.meta?.['_videopack-meta']?.starts,
		};

		const updatedAttributes = Object.keys(media_attributes).reduce(
			(acc, key) => {
				if (media_attributes[key]) {
					acc[key] = media_attributes[key];
				}
				return acc;
			},
			{}
		);

		setAttributes(updatedAttributes);
	}

	function onSelectVideo(video) {
		const videoArray = Array.isArray(video) ? video : [video];

		if (
			!videoArray ||
			!videoArray.some((item) => item.hasOwnProperty('url'))
		) {
			setAttributes({
				src: undefined,
				id: undefined,
				poster: undefined,
			});
			return;
		}

		if (videoArray.length === 1) {
			setAttributesFromMedia(videoArray[0]);
		}
	}

	function onSelectURL(newSrc) {
		if (newSrc !== src) {
			setAttributes({ src: newSrc, id: false });
		}
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
				label={__('Videopack Video')}
				instructions={__(
					'Upload a video file, pick one from your media library, or add one with a URL.'
				)}
			>
				{content}
			</Placeholder>
		);
	};

	if (!src && !id) {
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
				/>
			</div>
		);
	}

	return (
		<>
			<BlockControls group="other">
				<MediaReplaceFlow
					mediaId={id}
					mediaURL={src}
					allowedTypes={ALLOWED_MEDIA_TYPES}
					accept="video/*"
					onSelect={onSelectVideo}
					onSelectURL={onSelectURL}
					onError={onUploadError}
				/>
			</BlockControls>
			<SingleVideoBlock
				setAttributes={setAttributes}
				attributes={attributes}
				options={options}
				isSelected={isSelected}
			/>
		</>
	);
};

export default Edit;
