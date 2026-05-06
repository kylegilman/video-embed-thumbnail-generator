/* global videopack_config */
import { getBlobByURL, isBlobURL } from '@wordpress/blob';
import {
	Placeholder,
	ProgressBar,
	ToolbarButton,
	Spinner,
} from '@wordpress/components';
import {
	BlockControls,
	BlockIcon,
	InspectorControls,
	MediaPlaceholder,
	MediaReplaceFlow,
	useBlockProps,
	InnerBlocks,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import VideopackContextBridge from '../../components/VideopackContextBridge';

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
import { caption as captionIcon, undo as resetIcon } from '@wordpress/icons';
import { createBlock } from '@wordpress/blocks';
import apiFetch from '@wordpress/api-fetch';

import { getSettings } from '../../api/settings';
import { videopackVideo as icon } from '../../assets/icon';
import VideoSettings from '../../components/VideoSettings/VideoSettings.js';
import Thumbnails from '../../components/Thumbnails/Thumbnails.js';
import AdditionalFormats from '../../components/AdditionalFormats/AdditionalFormats.js';
import useVideoProbe from '../../hooks/useVideoProbe.js';
import useVideopackContext from '../../hooks/useVideopackContext';
import './editor.scss';

const ALLOWED_MEDIA_TYPES = ['video'];

const ALLOWED_BLOCKS = [
	'videopack/player',
	'videopack/view-count',
	'videopack/caption',
];

/**
 * Edit component for the Videopack Video block.
 *
 * @param {Object}   root0               Component props.
 * @param {Object}   root0.attributes    Block attributes.
 * @param {string}   root0.clientId      Block client ID.
 * @param {Function} root0.setAttributes Attribute setter.
 * @param {Object}   root0.context       Block context.
 * @return {Element}                     The rendered component.
 */
export default function Edit({ attributes, setAttributes, context, clientId }) {
	const { id, src } = attributes;
	const [options, setOptions] = useState();
	const config =
		typeof window !== 'undefined' ? window.videopack_config : undefined;
	const mejsSvgPath =
		config?.mejs_controls_svg ||
		(typeof window !== 'undefined'
			? `${window.location.origin}/wp-includes/js/mediaelement/mejs-controls.svg`
			: '');

	const globalOptions = config?.options || {};
	const effectiveAlign = attributes.align || globalOptions.align || '';

	const blockProps = useBlockProps({
		className: effectiveAlign ? `align${effectiveAlign}` : '',
		style: {
			'--videopack-mejs-controls-svg': mejsSvgPath
				? `url("${mejsSvgPath}")`
				: undefined,
		},
	});
	const hasAttemptedInitialUpload = useRef(false);
	const { createErrorNotice } = useDispatch(noticesStore);
	const { insertBlock } = useDispatch(blockEditorStore);
	const vpContext = useVideopackContext(attributes, context);
	const {
		resolved: effectiveDesign,
		style: contextStyle,
		classes: contextClasses,
	} = vpContext;

	const {
		attachmentId: resolvedAttachmentId,
		postId: resolvedPostIdFromContext,
		isDiscovering,
	} = effectiveDesign;

	const {
		mediaUpload,
		isSiteEditor,
		editorPostId,
		innerBlocks,
		attachmentFromStore,
	} = useSelect(
		(select) => {
			const editorStore = select(blockEditorStore);
			const editor = select('core/editor');
			const core = select('core');
			const postType = editor?.getCurrentPostType();
			const effectiveId =
				id || context['videopack/attachmentId'] || resolvedAttachmentId;

			return {
				mediaUpload: editorStore.getSettings()?.mediaUpload,
				isSiteEditor:
					postType === 'wp_template' ||
					postType === 'wp_template_part',
				editorPostId: editor?.getCurrentPostId(),
				innerBlocks: editorStore.getBlocks(clientId),
				attachmentFromStore:
					effectiveId && typeof effectiveId === 'number'
						? select('core').getEntityRecord(
								'postType',
								'attachment',
								effectiveId
						  )
						: null,
			};
		},
		[clientId, id, context['videopack/attachmentId'], resolvedAttachmentId]
	);

	const isDynamic =
		(context['videopack/postId'] || context.postId) &&
		(Number(context['videopack/postId'] || context.postId) !==
			Number(editorPostId) ||
			isSiteEditor);
	const isStandalone = !isDynamic;
	const effectiveId = resolvedAttachmentId;

	const [attachmentOverride, setAttachmentOverride] = useState(null);
	const attachment = attachmentOverride || attachmentFromStore;
	const hasResolved = !!attachment || (!effectiveId && !src);

	const videoData = useMemo(
		() => ({ record: attachment, setRecord: setAttachmentOverride, hasResolved }),
		[attachment, hasResolved]
	);

	const resolvedAttributes = useMemo(() => {
		if (!attachment) {
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
				attributes.title ||
				context['videopack/title'] ||
				attachment?.title?.raw ||
				attachment?.title?.rendered ||
				'',
			caption:
				attributes.caption ||
				context['videopack/caption'] ||
				attachment?.caption?.raw ||
				attachment?.caption?.rendered ||
				'',
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
			width: attachment.media_details?.width || attributes.width,
			height: attachment.media_details?.height || attributes.height,
			sources:
				attachment.videopack?.sources ||
				(attachment.source_url || attachment.url
					? [
							{
								src: attachment.source_url || attachment.url,
							},
						]
					: attributes.sources || []),
			source_groups:
				(attachment.videopack?.source_groups &&
				Object.keys(attachment.videopack.source_groups).length > 0
					? attachment.videopack.source_groups
					: null) ||
				(attributes.source_groups &&
				Object.keys(attributes.source_groups).length > 0
					? attributes.source_groups
					: null) ||
				{},
			default_ratio:
				attachment.meta?.['_kgflashmediaplayer-ratio'] ||
				attributes.default_ratio,
			fixed_aspect:
				attachment.meta?.['_kgflashmediaplayer-fixedaspect'] ||
				attributes.fixed_aspect,
			fullwidth: attributes.fullwidth,
			embed_method:
				attributes.embed_method ||
				options?.embed_method ||
				config?.embed_method,
			skin: attributes.skin || options?.skin || config?.skin,
			play_button_color:
				attributes.play_button_color ||
				options?.play_button_color ||
				config?.play_button_color,
			play_button_secondary_color:
				attributes.play_button_secondary_color ||
				options?.play_button_secondary_color ||
				config?.play_button_secondary_color,
			control_bar_bg_color:
				attributes.control_bar_bg_color ||
				options?.control_bar_bg_color ||
				config?.control_bar_bg_color,
			control_bar_color:
				attributes.control_bar_color ||
				options?.control_bar_color ||
				config?.control_bar_color,
			title_color:
				attributes.title_color ||
				options?.title_color ||
				config?.title_color,
			title_background_color:
				attributes.title_background_color ||
				effectiveDesign.title_background_color,
			embedlink:
				context['videopack/embedlink'] ||
				attachment?.videopack?.embed_url ||
				attributes.embedlink,
			showCaption:
				attributes.showCaption ||
				!!(
					attachment?.caption?.raw ||
					attachment?.caption?.rendered ||
					context['videopack/caption']
				),
		};
	}, [attributes, attachment, options, config, context, effectiveDesign]);

	const attributesRef = useRef(attributes);
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
		(attachmentObject, forcePersist = false) => {
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
						(attachmentObject.link.includes('?') ? '&' : '?') +
						'videopack[enable]=true'
					: undefined,
				width: attachmentObject.media_details?.width,
				height: attachmentObject.media_details?.height,
				showCaption: !!(
					attachmentObject.caption?.raw ??
					attachmentObject.caption?.rendered
				),
			};

			const updatedAttributes = {};
			const currentAttributes = attributesRef.current;

			Object.keys(media_attributes).forEach((key) => {
				const newVal = media_attributes[key];
				const oldVal = currentAttributes[key];

				if (newVal === undefined || newVal === null) {
					return;
				}

				const isDifferent = Array.isArray(newVal)
					? JSON.stringify(newVal) !== JSON.stringify(oldVal)
					: newVal !== oldVal;

				if (isDifferent) {
					const isMetadata = ['title', 'caption'].includes(key);
					if (isMetadata) {
						if (!oldVal) {
							updatedAttributes[key] = newVal;
						}
					} else if (forcePersist || !oldVal) {
						updatedAttributes[key] = newVal;
					}
				}
			});

			const dynamicKeys = [
				'src',
				'poster',
				'title',
				'caption',
				'width',
				'height',
				'embedlink',
				'sources',
				'source_groups',
				'text_tracks',
				'embed_method',
				'skin',
				'play_button_color',
				'play_button_secondary_color',
				'control_bar_bg_color',
				'control_bar_color',
				'title_color',
				'title_background_color',
				'total_thumbnails',
				'featured',
				'starts',
				'showCaption',
			];

			if (Object.keys(updatedAttributes).length > 0) {
				setAttributes(updatedAttributes);
			}
		},
		[setAttributes]
	);

	const processedIds = useRef(new Set());
	useEffect(() => {
		if (attachmentFromStore && isStandalone && !attachmentOverride) {
			const attachmentId = attachmentFromStore.id;
			// Only process each ID once to avoid infinite loops and keep attributes lean.
			if (!processedIds.current.has(attachmentId) || !id) {
				setAttributesFromMedia(attachmentFromStore, false);
				processedIds.current.add(attachmentId);
			}
		}
	}, [
		attachmentFromStore,
		isStandalone,
		id,
		attachmentOverride,
		setAttributesFromMedia,
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
				const selectedVideo = videoArray[0];
				if (isBlobURL(selectedVideo.url)) {
					hasAttemptedInitialUpload.current = true;
				}

				// Hydrate the block from the media object.
				// We don't force persistence here to keep the block markup lean if an ID is present.
				setAttributesFromMedia(selectedVideo, false);
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
				} catch {
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
	}, [
		id,
		src,
		mediaUpload,
		onSelectVideo,
		onUploadError,
		setAttributes,
		isStandalone,
	]);

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
			})
				.then((response) => {
					if (response && Object.keys(response).length > 0) {
						setAttributes({
							source_groups: response,
						});
					}
				})
				.catch((error) => {
					console.error('Error fetching video sources:', error);
				});
		}
	}, [id, src, setAttributes]);

	const { isProbing, probedMetadata } = useVideoProbe(src);
	const [probedMetadataOverride, setProbedMetadataOverride] = useState(null);

	useEffect(() => {
		if (attachment?.media_details && !probedMetadata) {
			const { width, height, duration } = attachment.media_details;
			setProbedMetadataOverride({
				width,
				height,
				duration,
				isTainted: false,
			});
		} else if (!src) {
			setProbedMetadataOverride(null);
		}
	}, [attachment, probedMetadata, src]);

	const effectiveMetadata = probedMetadataOverride || probedMetadata;

	const template = useMemo(() => {
		const globalOpts = videopack_config?.options || {};
		const showTitleBar = !!(
			globalOpts.overlay_title ||
			globalOpts.downloadlink ||
			globalOpts.embedcode
		);

		const engine_inner_blocks = [];

		if (showTitleBar) {
			engine_inner_blocks.push(['videopack/title', {}]);
		}

		if (globalOpts.watermark) {
			engine_inner_blocks.push(['videopack/watermark', {}]);
		}

		return [
			[
				'videopack/player',
				{ lock: { remove: true, move: false } },
				engine_inner_blocks,
			],
			['videopack/view-count', {}],
		];
	}, []);

	const bridgeOverrides = useMemo(() => {
		return {
			'videopack/isInsidePlayerContainer': true,
			'videopack/isStandalone': isStandalone,
			'videopack/attachmentId': effectiveId,
			'videopack/postType': isStandalone
				? 'attachment'
				: context['videopack/postType'] || context.postType || 'post',
		};
	}, [context, isStandalone, effectiveId]);

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

	let blockContent;

	if (isDiscovering && !effectiveId) {
		blockContent = (
			<div className="videopack-video-discovery-loading">
				<Placeholder
					icon={<BlockIcon icon={icon} />}
					label={__(
						'Videopack Video',
						'video-embed-thumbnail-generator'
					)}
				>
					<Spinner />
					<p>
						{__(
							'Searching for attached video…',
							'video-embed-thumbnail-generator'
						)}
					</p>
				</Placeholder>
			</div>
		);
	} else if (!src && !effectiveId) {
		blockContent = (
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
		);
	} else if (!id && src && isBlobURL(src)) {
		blockContent = (
			<div className="components-placeholder block-editor-media-placeholder is-large has-illustration">
				<div className="components-placeholder__label">
					<BlockIcon icon={icon} />
					{__('Videopack Video', 'video-embed-thumbnail-generator')}
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
		);
	} else {
		blockContent = (
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
						label={__(
							'Restart Video',
							'video-embed-thumbnail-generator'
						)}
						onClick={() =>
							setAttributes({
								restartCount:
									(attributes.restartCount || 0) + 1,
							})
						}
					/>
				</BlockControls>
				<BlockControls>
					<ToolbarButton
						icon={captionIcon}
						label={__(
							'Add caption',
							'video-embed-thumbnail-generator'
						)}
						onClick={() => {
							const hasCaption = innerBlocks.some(
								(block) => block.name === 'videopack/caption'
							);
							if (!hasCaption) {
								insertBlock(
									createBlock('videopack/caption', {
										caption: attributes.caption || '',
									}),
									innerBlocks.length,
									clientId
								);
							}
						}}
					/>
				</BlockControls>

				<figure
					style={{
						...contextStyle,
						display: src || effectiveId ? 'block' : 'none',
					}}
					aria-hidden={!(src || effectiveId)}
					className={`videopack-video-block-container videopack-wrapper ${contextClasses}${
						effectiveDesign.isPreview ? ' is-preview' : ''
					}`}
				>
					<VideopackContextBridge
						key={effectiveId || resolvedPostIdFromContext}
						attributes={resolvedAttributes}
						context={context}
						overrides={bridgeOverrides}
					>
						<InnerBlocks
							template={template}
							templateLock={false}
							allowedBlocks={ALLOWED_BLOCKS}
						/>
					</VideopackContextBridge>
				</figure>
			</>
		);
	}

	return (
		<>
			<InspectorControls>
				<Thumbnails
					setAttributes={setAttributes}
					attributes={attributes}
					videoData={videoData}
					options={options}
					parentId={
						effectiveId ||
						resolvedPostIdFromContext ||
						editorPostId ||
						0
					}
					isProbing={isProbing}
					probedMetadata={effectiveMetadata}
				/>
				<VideoSettings
					setAttributes={setAttributes}
					attributes={attributes}
					options={options}
					isProbing={isProbing}
					probedMetadata={effectiveMetadata}
					fallbackTitle={
						attachment?.title?.rendered ||
						attachment?.title?.raw ||
						resolvedAttributes.title ||
						''
					}
					fallbackCaption={
						attachment?.caption?.rendered ||
						attachment?.caption?.raw ||
						resolvedAttributes.caption ||
						''
					}
					isBlockEditor={true}
				/>
				<AdditionalFormats
					key={attributes.id || src}
					attributes={attributes}
					options={options}
					isProbing={isProbing}
					probedMetadata={effectiveMetadata}
					isDiscovering={isDiscovering}
				/>
			</InspectorControls>
			<figure {...blockProps}>{blockContent}</figure>
		</>
	);
}
