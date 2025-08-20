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
import { videopack as icon } from './icon';
import SingleVideoBlock from './SingleVideoBlock';
import GalleryBlock from './GalleryBlock';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */

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

	function setAttributesFromMedia(media) {
		setAttributes({
			src: media[0].url,
			id: media[0].id,
			poster: media[0].meta?.['_videopack-meta']?.poster,
			total_thumbnails:
				media[0].meta?.['_videopack-meta']?.total_thumbnails,
			gallery: false,
		});
	}

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
		if (!src && !gallery && videoChildren) {
			setAttributesFromMedia(videoChildren);
		}
	}, [src, gallery, videoChildren]);

	function onSelectVideo(media) {
		if (!media || !media.some((item) => item.hasOwnProperty('url'))) {
			// In this case there was an error
			// previous attributes should be removed
			// because they may be temporary blob urls.
			setAttributes({
				src: undefined,
				id: undefined,
				poster: undefined,
				gallery: undefined,
			});
			return;
		}

		// Sets the block's attribute and updates the edit component from the
		// selected media.
		if (media.length === 1) {
			setAttributesFromMedia(media);
			console.log(media[0]);
		} else if (media.length > 1) {
			const includeIds = media.map((item) => item.id).join(',');
			setAttributes({
				gallery: true,
				gallery_include: includeIds,
			});
		}
	}

	function onSelectURL(newSrc) {
		if (newSrc !== src) {
			setAttributes({ src: newSrc, id: false });
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
				icon={icon}
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
