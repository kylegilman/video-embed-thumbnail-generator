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
import CollectionBlock from './CollectionBlock';
import './editor.scss';

export default function Edit({ attributes, setAttributes, context, isSelected }) {
	const ALLOWED_MEDIA_TYPES = ['video'];
	const { gallery_include, gallery_id } = attributes;
	const [options, setOptions] = useState();
	const blockProps = useBlockProps();
	const { createErrorNotice } = useDispatch(noticesStore);

	const { editorPostId } = useSelect(
		(select) => ({
			editorPostId: select('core/editor')?.getCurrentPostId(),
		}),
		[]
	);

	const postId = context.postId || editorPostId;

	const videoChildren = useSelect(
		(select) => {
			if ( ! postId ) return null;
			return select('core').getEntityRecords('postType', 'attachment', {
				parent: postId,
				media_type: 'video',
			});
		},
		[postId]
	);

	useEffect(() => {
		getSettings().then((response) => {
			setOptions(response);
		});
	}, [videoChildren]);

	useEffect(() => {
		if (options) {
			const newAttributes = {};
			const settingsToSync = [
				'gallery_columns',
				'gallery_order',
				'gallery_orderby',
				'gallery_pagination',
				'gallery_per_page',
				'gallery_title',
				'gallery_end',
				'skin',
			];

			settingsToSync.forEach((setting) => {
				if (
					attributes[setting] === undefined &&
					options[setting] !== undefined
				) {
					newAttributes[setting] = options[setting];
				}
			});

			if (Object.keys(newAttributes).length > 0) {
				setAttributes(newAttributes);
			}
		}
	}, [options]);

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
				gallery_include: undefined,
				gallery_id: undefined,
			});
			return;
		}

		setAttributesFromMedia(mediaArray);
	}

	function onInsertCollection() {
		setAttributes({
			gallery: true,
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
				label={__( 'Videopack Video Collection', 'video-embed-thumbnail-generator' )}
				instructions={__( 'Select video files to create a collection.', 'video-embed-thumbnail-generator' )}
			>
				{content}
				<Button
					__next40pxDefaultSize
					className="videopack-placeholder-gallery-button"
					variant="secondary"
					label={__(
						'Insert a collection of all videos uploaded to this post'
					)}
					showTooltip
					onClick={onInsertCollection}
				>
					{__( "This post's videos", 'video-embed-thumbnail-generator' )}
				</Button>
			</Placeholder>
		);
	};

	if (!gallery_id && !gallery_include && !postId) {
		return (
			<div {...blockProps}>
				<MediaPlaceholder
					icon={<BlockIcon icon={icon} />}
					onSelect={onSelectVideo}
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
					onError={onUploadError}
					multiple={true}
				/>
			</BlockControls>

			<CollectionBlock
				setAttributes={setAttributes}
				attributes={attributes}
				options={options}
				videoChildren={videoChildren}
				previewPostId={postId}
				isSelected={isSelected}
			/>
		</>
	);
}
