/* global videopack_config */
import { getBlobByURL, isBlobURL } from '@wordpress/blob';
import { Placeholder, ProgressBar } from '@wordpress/components';
import {
	BlockControls,
	BlockIcon,
	MediaPlaceholder,
	MediaReplaceFlow,
	useBlockProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';

import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import apiFetch from '@wordpress/api-fetch';

import { getSettings } from '../../api/settings';
import { videopack as icon } from '../../assets/icon';
import SingleVideoBlock from './SingleVideoBlock';
import './editor.scss';

const ALLOWED_MEDIA_TYPES = ['video'];

/**
 * Edit component for the Videopack Video block.
 *
 * @param {Object}   props               Component props.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Function to update block attributes.
 * @param {boolean}  props.isSelected    Whether the block is currently selected.
 * @return {Object}                      The rendered component.
 */
const Edit = ({ attributes, setAttributes, isSelected }) => {
	const { id, src } = attributes;
	const [options, setOptions] = useState();
	const [externalSourceGroups, setExternalSourceGroups] = useState(null);
	const blockProps = useBlockProps();
	const hasAttemptedInitialUpload = useRef(false);
	const { createErrorNotice } = useDispatch(noticesStore);
	const { mediaUpload, isSiteEditor } = useSelect( (select) => {
		const editorStore = select(blockEditorStore);
		const editor = select('core/editor');
		const postType = editor?.getCurrentPostType();
		return {
			mediaUpload: editorStore.getSettings()?.mediaUpload,
			isSiteEditor: postType === 'wp_template' || postType === 'wp_template_part',
		};
	}, [] );

	const [attachment, setAttachment] = useState(null);
	const [hasResolved, setHasResolved] = useState(false);

	const videoData = useMemo(
		() => ({ record: attachment, hasResolved }),
		[attachment, hasResolved]
	);

	const attributesRef = useRef(attributes);
	useEffect(() => {
		attributesRef.current = attributes;
	}, [attributes]);

	const setAttributesFromMedia = useCallback(
		(attachmentObject) => {
			const media_attributes = {
				src: attachmentObject.source_url || attachmentObject.url,
				id: attachmentObject.id,
				poster: attachmentObject.meta?.['_videopack-meta']?.poster,
				total_thumbnails:
					attachmentObject.meta?.['_videopack-meta']
						?.total_thumbnails,
				featured:
					attachmentObject.meta?.['_videopack-meta']?.featured,
				title:
					attachmentObject.title?.raw ??
					attachmentObject.title?.rendered,
				caption:
					attachmentObject.caption?.raw ??
					attachmentObject.caption?.rendered,
				starts: attachmentObject.meta?.['_videopack-meta']?.starts,
				text_tracks:
					attachmentObject.meta?.['_videopack-meta']?.track ||
					attachmentObject.meta?.['_videopack-meta']?.tracks ||
					attachmentObject.meta?.track ||
					attachmentObject.meta?.tracks ||
					[],
				embedlink: attachmentObject.link
					? attachmentObject.link + 'embed'
					: undefined,
				width: attachmentObject.media_details?.width,
				height: attachmentObject.media_details?.height,
			};

			const updatedAttributes = Object.keys(media_attributes).reduce(
				(acc, key) => {
					if (
						media_attributes[key] !== undefined &&
						media_attributes[key] !== null &&
						media_attributes[key] !== attributesRef.current[key]
					) {
						acc[key] = media_attributes[key];
					}
					return acc;
				},
				{}
			);

			if (Object.keys(updatedAttributes).length > 0) {
				setAttributes(updatedAttributes);
			}
		},
		[setAttributes]
	);

	useEffect(() => {
		if (id && typeof id === 'number') {
			setHasResolved(false);
			apiFetch({ path: `/wp/v2/media/${id}?context=edit` })
				.then((record) => {
					setAttachment(record);
					setHasResolved(true);
					setAttributesFromMedia(record);
				})
				.catch((error) => {
					setAttachment(null);
					setHasResolved(true);
					if (error.status === 404 || error.status === 403) {
						setAttributes({
							id: undefined,
							src: undefined,
							poster: undefined,
							title: undefined,
							caption: undefined,
						});
					}
				});
		} else {
			setAttachment(null);
			setHasResolved(false);
		}
	}, [id, setAttributesFromMedia, setAttributes]);

	const onUploadError = useCallback(
		(message) => {
			createErrorNotice(message, { type: 'snackbar' });
		},
		[createErrorNotice]
	);

	const onSelectVideo = useCallback(
		(video) => {
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
				if (isBlobURL(videoArray[0].url)) {
					hasAttemptedInitialUpload.current = true;
				}
				setAttributesFromMedia(videoArray[0]);
			}
		},
		[setAttributesFromMedia, setAttributes]
	);

	const onSelectURL = useCallback(
		(newSrc) => {
			if (newSrc !== src) {
				let filename = newSrc.split('?')[0].split('#')[0];
				filename = filename.split('/').pop();
				if (filename.includes('.')) {
					filename = filename.substring(0, filename.lastIndexOf('.'));
				}
				try {
					filename = decodeURIComponent(filename);
				} catch (e) {
					// Ignore decoding errors
				}

				setAttributes({
					src: newSrc,
					id: undefined,
					title: filename,
					caption: '',
					poster: '',
					starts: undefined,
					embedlink: '',
				});
			}
		},
		[src, setAttributes]
	);

	useEffect(() => {
		getSettings().then((response) => {
			setOptions(response);
		});

		if (!hasAttemptedInitialUpload.current && !id && isBlobURL(src)) {
			hasAttemptedInitialUpload.current = true;
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
	}, [id, src, mediaUpload, onSelectVideo, onUploadError]);

	useEffect(() => {
		if (src === 'videopack-preview-video') {
			setAttributes({
				src:
					videopack_config.url +
					'/src/images/Adobestock_469037984.mp4',
			});
		} else if (
			!id &&
			src &&
			src !== 'videopack-preview-video' &&
			!isBlobURL(src)
		) {
			setExternalSourceGroups(null);
			apiFetch({
				path: `/videopack/v1/sources?url=${encodeURIComponent(src)}`,
			})
				.then((data) => {
					setExternalSourceGroups(data);
				})
				.catch((error) => {
					console.error('Error fetching video sources:', error);
					setExternalSourceGroups({});
				});
		} else {
			setExternalSourceGroups(null);
		}
	}, [id, src, setAttributes]);

	const placeholder = (content) => {
		return (
			<Placeholder
				className="block-editor-media-placeholder"
				withIllustration={true}
				icon={icon}
				label={__('Videopack Video', 'video-embed-thumbnail-generator')}
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
				{isSiteEditor ? (
					<>
						<SingleVideoBlock
							setAttributes={setAttributes}
							attributes={attributes}
							options={options}
							isSelected={isSelected}
							externalSourceGroups={externalSourceGroups}
							videoData={videoData}
						/>
						<Placeholder
							icon={icon}
							label={__(
								'Dynamic Videopack Video',
								'video-embed-thumbnail-generator'
							)}
							instructions={__(
								'This block is currently configured to show the most recent video from the current post. To select a specific video instead, use the options below.',
								'video-embed-thumbnail-generator'
							)}
						>
							<MediaPlaceholder
								onSelect={onSelectVideo}
								onSelectURL={onSelectURL}
								accept="video/*"
								allowedTypes={ALLOWED_MEDIA_TYPES}
								value={attributes}
								onError={onUploadError}
							/>
						</Placeholder>
					</>
				) : (
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
				)}
			</div>
		);
	}

	if (!id && src && isBlobURL(src)) {
		return (
			<div {...blockProps}>
				<div className="components-placeholder block-editor-media-placeholder is-large has-illustration">
					<div className="components-placeholder__label">
						<BlockIcon icon={icon} />
						{__(
							'Videopack Video',
							'video-embed-thumbnail-generator'
						)}
					</div>
					<div className="components-placeholder__fieldset">
						<div className="videopack-uploading-overlay-content">
							<p>
								{__(
									'Uploading…',
									'video-embed-thumbnail-generator'
								)}
							</p>
							<div className="videopack-progress-bar-container">
								<ProgressBar />
							</div>
						</div>
					</div>
				</div>
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
				externalSourceGroups={externalSourceGroups}
				videoData={videoData}
			/>
		</>
	);
};

export default Edit;
