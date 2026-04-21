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
	BlockContextProvider,
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
import {
	caption as captionIcon,
	undo as resetIcon,
} from '@wordpress/icons';
import { createBlock } from '@wordpress/blocks';
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
	'videopack/video-caption',
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
	resolvedPostId,
	resolvedAttributes = attributes,
}) => {
	const { src } = resolvedAttributes;

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

	const contextValue = useMemo(() => {
		const result = {
			'videopack/postId': resolvedPostId,
			'videopack/isInsidePlayerBlock': true,
		};

		// Map all resolved attributes to videopack/ prefixed keys
		Object.entries(resolvedAttributes).forEach(([key, val]) => {
			if (key === 'id') {
				// id attribute maps to BOTH id and videopack/postId for children
				result.id = val;
				result['videopack/postId'] = val;
			} else {
				const contextKey = `videopack/${key}`;
				if (val !== undefined && val !== null) {
					result[contextKey] = val;
				}
			}
		});

		return result;
	}, [resolvedPostId, resolvedAttributes]);

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
					fallbackTitle={attachment?.title?.rendered || attachment?.title?.raw || resolvedAttributes.title || ''}
					fallbackCaption={attachment?.caption?.rendered || attachment?.caption?.raw || resolvedAttributes.caption || ''}
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
			<figure
				className={`videopack-video-block-container videopack-wrapper${
					attributes.title_background_color
						? ' videopack-has-title-background-color'
						: ''
				}${
					attributes.overlay_title || attributes.downloadlink || attributes.embedcode
						? ' videopack-video-title-visible'
						: ''
				}`}
			>
				<BlockContextProvider key={resolvedPostId} value={contextValue}>
					<InnerBlocks
						template={template}
						templateLock={false}
						allowedBlocks={ALLOWED_BLOCKS}
					/>
				</BlockContextProvider>
			</figure>
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
	const postId = context['videopack/postId'];
	const [options, setOptions] = useState();
	const config = typeof window !== 'undefined' ? window.videopack_config : undefined;
	const mejsSvgPath =
		config?.mejs_controls_svg ||
		(typeof window !== 'undefined'
			? `${window.location.origin}/wp-includes/js/mediaelement/mejs-controls.svg`
			: '');

	const blockProps = useBlockProps({
		style: {
			'--videopack-mejs-controls-svg': mejsSvgPath
				? `url("${mejsSvgPath}")`
				: undefined,
		},
	});
	const hasAttemptedInitialUpload = useRef(false);
	const { createErrorNotice } = useDispatch(noticesStore);
	const { insertBlock } = useDispatch(blockEditorStore);
	const { mediaUpload, isSiteEditor, editorPostId, innerBlocks } = useSelect((select) => {
		const editorStore = select(blockEditorStore);
		const editor = select('core/editor');
		const postType = editor?.getCurrentPostType();
		return {
			mediaUpload: editorStore.getSettings()?.mediaUpload,
			isSiteEditor:
				postType === 'wp_template' || postType === 'wp_template_part',
			editorPostId: editor?.getCurrentPostId(),
			innerBlocks: editorStore.getBlocks(clientId),
		};
	}, [clientId]);

	const isContextual = postId && (Number(postId) !== Number(editorPostId) || isSiteEditor);
	const resolvedPostId = isContextual ? postId : (id || undefined);

	const effectiveId = resolvedPostId;

	const [attachment, setAttachment] = useState(null);
	const [hasResolved, setHasResolved] = useState(false);

	const videoData = useMemo(
		() => ({ record: attachment, setRecord: setAttachment, hasResolved }),
		[attachment, hasResolved]
	);

	const resolvedAttributes = useMemo(() => {
		if (!isContextual || !attachment) {
			return attributes;
		}

		return {
			...attributes,
			src: attachment.source_url || attachment.url || attributes.src,
			id: attachment.id,
			poster:
				attachment.videopack?.poster ||
				attachment.meta?.['_videopack-meta']?.poster ||
				attributes.poster,
			total_thumbnails:
				attachment.meta?.['_videopack-meta']?.total_thumbnails ||
				attributes.total_thumbnails,
			featured:
				attachment.meta?.['_videopack-meta']?.featured ||
				attributes.featured,
			title:
				attachment.title?.raw ??
				attachment.title?.rendered ??
				attributes.title,
			caption:
				attachment.caption?.raw ??
				attachment.caption?.rendered ??
				attributes.caption,
			starts:
				attachment.meta?.['_videopack-meta']?.starts ||
				attributes.starts,
			text_tracks:
				attachment.meta?.['_videopack-meta']?.track ||
				attachment.meta?.['_videopack-meta']?.tracks ||
				attachment.meta?.track ||
				attachment.meta?.tracks ||
				attributes.text_tracks ||
				[],
			width:
				attachment.media_details?.width ||
				attributes.width,
			height:
				attachment.media_details?.height ||
				attributes.height,
			sources:
				attachment.videopack?.sources ||
				(attachment.source_url || attachment.url
					? [
							{
								src:
									attachment.source_url ||
									attachment.url,
							},
					  ]
					: attributes.sources || []),
			source_groups:
				attachment.videopack?.source_groups ||
				attributes.source_groups ||
				{},
			default_ratio:
				attachment.meta?.['_kgflashmediaplayer-ratio'] ||
				attributes.default_ratio,
			fixed_aspect:
				attachment.meta?.['_kgflashmediaplayer-fixedaspect'] ||
				attributes.fixed_aspect,
			fullwidth:
				attachment.meta?.['_kgflashmediaplayer-fullwidth'] ||
				attributes.fullwidth,
		};
	}, [attributes, attachment, isContextual]);

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

			if (Object.keys(updatedAttributes).length > 0 && shouldPersist) {
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
					setAttributesFromMedia(record, !isContextual);
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
			// We skip persistence if we are in a contextual (loop) environment
			if (response?.embed_method && !attributesRef.current.embed_method && !isContextual) {
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

	return (
		<figure {...blockProps}>
			{(!src && !effectiveId) ? (
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
			) : (!id && src && isBlobURL(src)) ? (
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
			) : (
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
						<ToolbarButton
							icon={resetIcon}
							label={__('Restart Video', 'video-embed-thumbnail-generator')}
							onClick={() =>
								setAttributes({
									restartCount: (attributes.restartCount || 0) + 1,
								})
							}
						/>
					</BlockControls>
					<BlockControls>
						<ToolbarButton
							icon={captionIcon}
							label={__('Add caption', 'video-embed-thumbnail-generator')}
							onClick={() => {
								const hasCaption = innerBlocks.some(
									(block) => block.name === 'videopack/video-caption'
								);
								if (!hasCaption) {
									insertBlock(
										createBlock('videopack/video-caption', {
											caption: attributes.caption || '',
										}),
										innerBlocks.length,
										clientId
									);
								}
							}}
						/>
					</BlockControls>
				</>
			)}

			<figure 
				style={{ display: (src || effectiveId) ? 'block' : 'none' }}
				aria-hidden={!(src || effectiveId)}
			>
				<SingleVideoBlock
					clientId={clientId}
					setAttributes={setAttributes}
					attributes={attributes}
					options={options}
					isSelected={isSelected}
					videoData={videoData}
					resolvedPostId={resolvedPostId}
					resolvedAttributes={resolvedAttributes}
				/>
			</figure>
		</figure>
	);
};

export default Edit;
