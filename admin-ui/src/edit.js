/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-block-editor/#useBlockProps
 */

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

import { getSettings } from './utils';
import { videopack as videopackIcon } from './icon';
import SingleVideoBlock from './SingleVideoBlock';
import GalleryBlock from './GalleryBlock';

import './editor.scss';

const ALLOWED_MEDIA_TYPES = ['video'];

export default function Edit({ attributes, setAttributes }) {
	const { gallery, id, src } = attributes;
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

	useEffect(() => {
		getSettings().then((response) => {
			setOptions(response);
		});

		if (!id && isBlobURL(src)) {
			const file = getBlobByURL(src);
			if (file) {
				mediaUpload({
					filesList: [file],
					onFileChange: ([media]) => onSelectVideo(media),
					onError: onUploadError,
					allowedTypes: ALLOWED_MEDIA_TYPES,
				});
			}
		}
	}, []);

	function onSelectVideo(media) {
		if (!media || !media.length) {
			setAttributes({
				src: undefined,
				id: undefined,
				gallery: undefined,
				isExternal: undefined,
			});
			return;
		}

		if (media.length === 1) {
			setAttributes({
				src: media[0].url,
				id: media[0].id,
				isExternal: false,
				gallery: false,
			});
		} else {
			const includeIds = media.map((item) => item.id).join(',');
			setAttributes({
				gallery: true,
				gallery_include: includeIds,
				isExternal: false,
			});
		}
	}

	function onSelectURL(newSrc) {
		if (newSrc !== src) {
			setAttributes({
				src: newSrc,
				id: 0,
				isExternal: true,
				gallery: false,
			});
		}
	}

	function onInsertGallery() {
		setAttributes({
			gallery: true,
			id: 0,
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
				icon={videopackIcon}
				label={__('Videopack')}
				instructions={__(
					'Upload a video file, pick one from your media library, or add one with a URL.'
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

	if (!src && gallery === false) {
		return (
			<div {...blockProps}>
				<MediaPlaceholder
					icon={<BlockIcon icon={videopackIcon} />}
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
					mediaId={id}
					mediaURL={src}
					allowedTypes={ALLOWED_MEDIA_TYPES}
					accept="video/*"
					onSelect={onSelectVideo}
					onSelectURL={onSelectURL}
					onError={onUploadError}
					multiple={true}
				/>
			</BlockControls>
			{src && !gallery && (
				<SingleVideoBlock
					setAttributes={setAttributes}
					attributes={attributes}
					options={options}
				/>
			)}
			{gallery && (
				<GalleryBlock
					setAttributes={setAttributes}
					attributes={attributes}
					options={options}
				/>
			)}
		</>
	);
}
