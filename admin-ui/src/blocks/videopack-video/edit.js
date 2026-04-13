/* global videopack_config */
import { getBlobByURL, isBlobURL } from '@wordpress/blob';
import {
	Placeholder,
	ProgressBar,
	ToolbarButton,
} from '@wordpress/components';
import {
	BlockControls,
	BlockIcon,
	InspectorControls,
	MediaPlaceholder,
	MediaReplaceFlow,
	useBlockProps,
	InnerBlocks,
	RichText,
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
import { caption as captionIcon } from '@wordpress/icons';
import apiFetch from '@wordpress/api-fetch';

import { getSettings } from '../../api/settings';
import { videopack as icon } from '../../assets/icon';
import VideoSettings from '../../components/VideoSettings/VideoSettings.js';
import Thumbnails from '../../components/Thumbnails/Thumbnails.js';
import AdditionalFormats from '../../components/AdditionalFormats/AdditionalFormats.js';
import useVideoProbe from '../../hooks/useVideoProbe.js';
import './editor.scss';

const ALLOWED_MEDIA_TYPES = ['video'];

const ALLOWED_BLOCKS = [
	'videopack/video-player-engine',
	'videopack/view-count',
];

/**
 * SingleVideoBlock component for rendering a single video within the editor.
 *
 * @param {Object}   props               Component props.
 * @param {string}   props.clientId      Block client ID.
 * @param {Function} props.setAttributes Function to update block attributes.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Object}   props.options       Global plugin options.
 * @param {boolean}  props.isSelected    Whether the block is selected.
 * @param {Object}   props.videoData     Video attachment data and state.
 * @return {Object}                      The rendered component.
 */
const SingleVideoBlock = ({
	clientId,
	setAttributes,
	attributes,
	options,
	isSelected,
	videoData,
}) => {
	const { src } = attributes;

	const { hasSelectedInnerBlock: innerBlockSelected } = useSelect(
		(select) => {
			const { hasSelectedInnerBlock: checkInnerSelection } =
				select(blockEditorStore);
			return {
				hasSelectedInnerBlock: checkInnerSelection(clientId, true),
			};
		},
		[clientId]
	);

	const [showOverlay, setShowOverlay] = useState(
		!isSelected && !innerBlockSelected
	);

	useEffect(() => {
		setShowOverlay(!isSelected && !innerBlockSelected);
	}, [isSelected, innerBlockSelected]);

	const { record: attachment } = videoData;
	const editorPostId = useSelect(
		(select) => select('core/editor')?.getCurrentPostId(),
		[]
	);
	const effectivePostId = attachment?.id || attributes.id || editorPostId;

	const { isProbing, probedMetadata } = useVideoProbe(src);
	const [probedMetadataOverride, setProbedMetadataOverride] = useState(null);

	// Sync metadata from attachment records when it loads
	useEffect(() => {
		if (attachment?.media_details && !probedMetadata) {
			const { width, height, duration } = attachment.media_details;
			setProbedMetadataOverride({
				width,
				height,
				duration,
				isTainted: false, // Internal media tags are never tainted
			});
		} else if (!src) {
			setProbedMetadataOverride(null);
		}
	}, [attachment, probedMetadata, src]);

	const effectiveMetadata = probedMetadataOverride || probedMetadata;

	// attributes are now provided via context to inner blocks
	// playerAttributes logic was moved to video-player-engine/edit.js

	const template = useMemo(() => {
		const globalOptions = videopack_config?.options || {};
		const showTitleBar = !!(
			globalOptions.overlay_title ||
			globalOptions.downloadlink ||
			globalOptions.embedcode
		);

		const engine_inner_blocks = [];

		if (showTitleBar) {
			engine_inner_blocks.push(['videopack/video-title', {}]);
		}

		if (globalOptions.watermark) {
			engine_inner_blocks.push(['videopack/video-watermark', {}]);
		}

		return [
			[
				'videopack/video-player-engine',
				{ lock: { remove: true, move: false } },
				engine_inner_blocks,
			],
			['videopack/view-count', {}],
		];
	}, []);

	return (
		<>
			<InspectorControls>
				<Thumbnails
					setAttributes={setAttributes}
					attributes={attributes}
					videoData={videoData}
					options={options}
					parentId={effectivePostId || 0}
					isProbing={isProbing}
					probedMetadata={effectiveMetadata}
				/>
				<VideoSettings
					setAttributes={setAttributes}
					attributes={attributes}
					options={options}
					isProbing={isProbing}
					probedMetadata={effectiveMetadata}
					fallbackTitle={attachment?.title?.rendered || ''}
					fallbackCaption={attachment?.caption?.rendered || ''}
					isBlockEditor={true}
				/>
				<AdditionalFormats
					key={attributes.id || src}
					attributes={attributes}
					options={options}
					isProbing={isProbing}
					probedMetadata={effectiveMetadata}
				/>
			</InspectorControls>
			<div
				className={`videopack-video-block-container videopack-wrapper${
					attributes.title_background_color
						? ' videopack-has-title-background-color'
						: ''
				}`}
			>
				<InnerBlocks
					template={template}
					templateLock={false}
					allowedBlocks={ALLOWED_BLOCKS}
				/>
				{showOverlay && <div className="videopack-block-overlay" />}
				{(attributes.caption || attributes.showCaption) && (
					<RichText
						tagName="p"
						className="wp-element-caption videopack-video-caption"
						value={attributes.caption}
						onChange={(value) => setAttributes({ caption: value })}
						placeholder={__(
							'Write caption…',
							'video-embed-thumbnail-generator'
						)}
					/>
				)}
			</div>
		</>
	);
};

/**
 * Edit component for the Videopack Video block.
 *
 * @param {Object}   props               Component props.
 * @param {Object}   props.attributes    Block attributes.
 * @param {string}   props.clientId      Block client ID.
 * @param {Function} props.setAttributes Function to update block attributes.
 * @param {boolean}  props.isSelected    Whether the block is currently selected.
 * @param {Object}   props.context       Block context.
 * @return {Object}                      The rendered component.
 */
const Edit = ({ clientId, attributes, setAttributes, isSelected, context }) => {
	const { id, src } = attributes;
	const { postId } = context;
	const [options, setOptions] = useState();
	const blockProps = useBlockProps();
	const hasAttemptedInitialUpload = useRef(false);
	const { createErrorNotice } = useDispatch(noticesStore);
	const { mediaUpload, isSiteEditor, editorPostId } = useSelect((select) => {
		const editorStore = select(blockEditorStore);
		const editor = select('core/editor');
		const postType = editor?.getCurrentPostType();
		return {
			mediaUpload: editorStore.getSettings()?.mediaUpload,
			isSiteEditor:
				postType === 'wp_template' || postType === 'wp_template_part',
			editorPostId: editor?.getCurrentPostId(),
		};
	}, []);

	const effectiveId =
		id ||
		(Number(postId) !== Number(editorPostId) || isSiteEditor
			? postId
			: undefined);

	const [attachment, setAttachment] = useState(null);
	const [hasResolved, setHasResolved] = useState(false);

	const videoData = useMemo(
		() => ({ record: attachment, setRecord: setAttachment, hasResolved }),
		[attachment, hasResolved]
	);

	const attributesRef = useRef(attributes);
	const lastFetchedIdRef = useRef(null);
	const isMountedRef = useRef(false);

	useEffect(() => {
		attributesRef.current = attributes;
	}, [attributes]);

	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	const setAttributesFromMedia = useCallback(
		(attachmentObject, shouldPersist = true) => {
			if (!isMountedRef.current) {
				return;
			}
			const media_attributes = {
				src: attachmentObject.source_url || attachmentObject.url,
				id: attachmentObject.id,
				poster:
					attachmentObject.videopack?.poster ||
					attachmentObject.meta?.['_videopack-meta']?.poster,
				total_thumbnails:
					attachmentObject.meta?.['_videopack-meta']
						?.total_thumbnails,
				featured: attachmentObject.meta?.['_videopack-meta']?.featured,
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
					? attachmentObject.link +
					  ( attachmentObject.link.includes( '?' ) ? '&' : '?' ) +
					  'videopack[enable]=true'
					: undefined,
				width: attachmentObject.media_details?.width,
				height: attachmentObject.media_details?.height,
				sources:
					attachmentObject.videopack?.sources ||
					(attachmentObject.source_url || attachmentObject.url
						? [
								{
									src:
										attachmentObject.source_url ||
										attachmentObject.url,
								},
						  ]
						: []),
				source_groups: attachmentObject.videopack?.source_groups || {},
				showCaption: !!(
					attachmentObject.caption?.raw ??
					attachmentObject.caption?.rendered
				),
			};

			const updatedAttributes = Object.keys(media_attributes).reduce(
				(acc, key) => {
					const newVal = media_attributes[key];
					const oldVal = attributesRef.current[key];

					// Handle deep comparison for arrays (e.g., text_tracks)
					const isDifferent = Array.isArray(newVal)
						? JSON.stringify(newVal) !== JSON.stringify(oldVal)
						: newVal !== oldVal;

					if (
						newVal !== undefined &&
						newVal !== null &&
						isDifferent
					) {
						// If shouldPersist is false, only update if the current attribute is falsy.
						// This allows background "hydration" of missing metadata without overwriting user overrides.
						if (shouldPersist || !oldVal) {
							acc[key] = newVal;
						}
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
		if (effectiveId && typeof effectiveId === 'number') {
			// Avoid redundant fetches if we already have the correct attachment
			// or if we've already tried fetching this specific ID.
			if (
				attachment?.id === effectiveId ||
				lastFetchedIdRef.current === effectiveId
			) {
				if (attachment?.id === effectiveId) {
					setHasResolved(true);
				}
				return;
			}

			lastFetchedIdRef.current = effectiveId;
			setHasResolved(false);

			apiFetch({ path: `/wp/v2/media/${effectiveId}?context=edit` })
				.then((record) => {
					if (!isMountedRef.current) {
						return;
					}
					setAttachment(record);
					setHasResolved(true);
					// Always hydrate missing metadata from the record to ensure the context
					// provided to inner blocks (like the player engine) is complete.
					setAttributesFromMedia(record, !id && !postId);
				})
				.catch((error) => {
					if (!isMountedRef.current) {
						return;
					}
					setAttachment(null);
					setHasResolved(true);
					if ((error.status === 404 || error.status === 403) && id) {
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
			lastFetchedIdRef.current = null;
		}
	}, [
		effectiveId,
		id,
		postId,
		setAttributesFromMedia,
		setAttributes,
		attachment,
	]);

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
			// Hydrate embed_method from global settings if it's missing from block attributes
			if (response?.embed_method && !attributesRef.current.embed_method) {
				setAttributes({ embed_method: response.embed_method });
			}
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
	}, [id, src, mediaUpload, onSelectVideo, onUploadError, setAttributes]);

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
			apiFetch({
				path: `/videopack/v1/sources?url=${encodeURIComponent(src)}`,
			}).catch((error) => {
				console.error('Error fetching video sources:', error);
			});
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
					'Upload a video file, pick one from your media library, or add one with a URL.',
					'video-embed-thumbnail-generator'
				)}
			>
				{content}
			</Placeholder>
		);
	};

	if (!src && !effectiveId) {
		return (
			<div {...blockProps}>
				{isSiteEditor ? (
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
		<div {...blockProps}>
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
			<BlockControls>
				<ToolbarButton
					icon={captionIcon}
					label={
						attributes.showCaption
							? __(
									'Remove caption',
									'video-embed-thumbnail-generator'
							  )
							: __(
									'Add caption',
									'video-embed-thumbnail-generator'
							  )
					}
					isPressed={attributes.showCaption}
				onClick={() =>
					setAttributes({
						showCaption: !attributes.showCaption,
					})
				}
			/>
			</BlockControls>
			<SingleVideoBlock
				clientId={clientId}
				setAttributes={setAttributes}
				attributes={attributes}
				options={options}
				isSelected={isSelected}
				videoData={videoData}
			/>
		</div>
	);
};

export default Edit;
