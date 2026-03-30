/**
 * Component to handle classic embed logic and UI.
 */

import { TextControl, Button, PanelBody } from '@wordpress/components';
import { useState, useEffect, useCallback, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import VideoSettings from '../../../components/VideoSettings/VideoSettings';
import CollectionSettingsPanel from '../../../components/InspectorControls/CollectionSettingsPanel';
import Thumbnails from '../../../components/Thumbnails/Thumbnails.js';
import AdditionalFormats from '../../../components/AdditionalFormats/AdditionalFormats.js';
import useVideoQuery from '../../../hooks/useVideoQuery';
import { useVideoData } from '../../../hooks/useVideoData';
import useVideoProbe from '../../../hooks/useVideoProbe';
import { generateShortcode, normalizeOptions } from '../../../utils/utils';

/**
 * ClassicEmbed component.
 *
 * @param {Object} props           Component props.
 * @param {Object} props.options   Plugin options.
 * @param {number} props.postId    The ID of the current post.
 * @param {string} props.activeTab Initial active tab.
 * @return {Object} The rendered component.
 */
export default function ClassicEmbed({ options, postId, activeTab }) {
	const normalizedOptions = normalizeOptions(options);

	// Retrieve editAttributes passed from PHP if editing an existing shortcode via TinyMCE
	const editAttributes = useMemo(() => {
		const config = window.videopack_classic_embed_config || {};
		const attrs = config.editAttributes || {};

		const normalized = { ...attrs };

		// Numeric fields
		const numericFields = [
			'gallery_id',
			'gallery_per_page',
			'gallery_columns',
			'collection_video_limit',
		];
		numericFields.forEach((field) => {
			if (normalized[field] !== undefined) {
				normalized[field] = parseInt(normalized[field], 10);
			}
		});

		// Boolean fields
		const booleanFields = [
			'gallery_pagination',
			'gallery_title',
			'enable_collection_video_limit',
			'autoplay',
			'loop',
			'muted',
			'controls',
			'downloadlink',
		];
		booleanFields.forEach((field) => {
			if (normalized[field] !== undefined) {
				normalized[field] =
					normalized[field] === 'true' || normalized[field] === '1';
			}
		});

		// Handle legacy 'videos' attribute (maps to collection_video_limit)
		if (normalized.videos !== undefined) {
			const videoLimit = parseInt(normalized.videos, 10);
			if (!isNaN(videoLimit)) {
				normalized.collection_video_limit = videoLimit;
				normalized.enable_collection_video_limit = true;
			}
		}

		return normalized;
	}, []);
	const initialVideoUrl = editAttributes.url || '';

	const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
	const [debouncedVideoUrl, setDebouncedVideoUrl] = useState(initialVideoUrl);
	const [resolvedId, setResolvedId] = useState(null);
	const [isResolving, setIsResolving] = useState(false);
	const { isProbing, probedMetadata } = useVideoProbe(debouncedVideoUrl);
	const [probedMetadataOverride, setProbedMetadataOverride] = useState(null);

	// Debounce the video URL for all downstream logic and rendering
	useEffect(() => {
		if (videoUrl === debouncedVideoUrl) {
			return;
		}

		const timeoutId = setTimeout(() => {
			setIsResolving(true);
			setDebouncedVideoUrl(videoUrl);
		}, 1000);
		return () => clearTimeout(timeoutId);
	}, [videoUrl, debouncedVideoUrl]);

	const [singleAttributes, setSingleAttributes] = useState({
		autoplay: !!normalizedOptions.autoplay,
		loop: !!normalizedOptions.loop,
		muted: !!normalizedOptions.muted,
		controls: !!normalizedOptions.controls,
		downloadlink: !!normalizedOptions.downloadlink,
		preload: normalizedOptions.preload || 'metadata',
		...editAttributes, // override with whatever came from the shortcode
	});

	const [galleryAttributes, setGalleryAttributes] = useState({
		gallery: true,
		gallery_orderby: normalizedOptions.gallery_orderby || 'menu_order',
		gallery_order: normalizedOptions.gallery_order || 'ASC',
		gallery_pagination: !!normalizedOptions.gallery_pagination,
		gallery_per_page: parseInt(normalizedOptions.gallery_per_page, 10) || 6,
		gallery_columns: parseInt(normalizedOptions.gallery_columns, 10) || 4,
		gallery_title: !!normalizedOptions.gallery_title,
		gallery_end: normalizedOptions.gallery_end || '',
		gallery_source: 'current',
		gallery_id: postId,
		...editAttributes, // override with whatever came from the shortcode
	});

	const [listAttributes, setListAttributes] = useState({
		gallery: false,
		gallery_orderby: normalizedOptions.gallery_orderby || 'menu_order',
		gallery_order: normalizedOptions.gallery_order || 'ASC',
		gallery_pagination: !!normalizedOptions.gallery_pagination,
		gallery_per_page: parseInt(normalizedOptions.gallery_per_page, 10) || 6,
		gallery_title: !!normalizedOptions.gallery_title,
		gallery_end: normalizedOptions.gallery_end || '',
		gallery_source: 'current',
		gallery_id: postId,
		collection_video_limit: normalizedOptions.collection_video_limit || -1,
		enable_collection_video_limit:
			!!normalizedOptions.enable_collection_video_limit,
		...editAttributes, // override with whatever came from the shortcode
	});

	const activeAttributes =
		activeTab === 'gallery' ? galleryAttributes : listAttributes;
	const queryData = useVideoQuery(activeAttributes, postId);
	const videoData = useVideoData(resolvedId, debouncedVideoUrl, !resolvedId);
	const [urlError, setUrlError] = useState('');

	// Validate URL
	const isValidUrl = (url) => {
		try {
			const parsed = new URL(url);
			return parsed.protocol === 'http:' || parsed.protocol === 'https:';
		} catch (e) {
			return false;
		}
	};

	// Resolve URL to Attachment ID
	useEffect(() => {
		const controller = new AbortController();

		if (!debouncedVideoUrl || !isValidUrl(debouncedVideoUrl)) {
			setResolvedId(null);
			setIsResolving(false);
			setUrlError('');
			return;
		}

		setUrlError('');
		setIsResolving(true);
		// Note: We no longer setResolvedId(null) immediately.
		// This keeps the previous settings/thumbnails visible (though potentially stale)
		// until the new URL is resolved, preventing a jarring UI disappearance.

		apiFetch({
			path: '/videopack/v1/resolve-url',
			method: 'POST',
			data: { url: debouncedVideoUrl, post_id: postId },
			signal: controller.signal,
		})
			.then((response) => {
				if (response.attachment_id) {
					setResolvedId(response.attachment_id);
					setSingleAttributes((prev) => ({
						...prev,
						id: response.attachment_id,
					}));
				} else {
					setResolvedId(null);
				}
			})
			.catch((error) => {
				if (error.name === 'AbortError') {
					return;
				}
				// eslint-disable-next-line no-console
				console.error('Error resolving video URL:', error);
				setResolvedId(null);
			})
			.finally(() => {
				setIsResolving(false);
			});

		return () => controller.abort();
	}, [debouncedVideoUrl, postId]);

	// Sync metadata from videoData when it loads
	useEffect(() => {
		if (videoData?.record?.media_details && !probedMetadata) {
			const { width, height, duration } = videoData.record.media_details;
			setProbedMetadataOverride({
				width,
				height,
				duration,
				isTainted: false, // Internal media is never tainted
			});
		} else if (!debouncedVideoUrl) {
			setProbedMetadataOverride(null);
		}
	}, [videoData, probedMetadata, debouncedVideoUrl]);

	const effectiveMetadata = probedMetadataOverride || probedMetadata;

	// Sync metadata from videoData when it loads
	useEffect(() => {
		if (videoData.attachment && resolvedId) {
			setSingleAttributes((prev) => {
				// Avoid unnecessary updates
				if (
					prev.poster === videoData.poster &&
					prev.poster_id === videoData.poster_id &&
					prev.title === videoData.title &&
					prev.caption === videoData.caption
				) {
					return prev;
				}
				return {
					...prev,
					poster:
						videoData.poster !== undefined
							? videoData.poster
							: prev.poster,
					poster_id:
						videoData.poster_id !== undefined
							? videoData.poster_id
							: prev.poster_id,
					title:
						videoData.title !== undefined
							? videoData.title
							: prev.title,
					caption:
						videoData.caption !== undefined
							? videoData.caption
							: prev.caption,
				};
			});
		}
	}, [
		videoData.attachment,
		videoData.poster,
		videoData.poster_id,
		videoData.title,
		videoData.caption,
		resolvedId,
	]);

	// Keep resolvedId in sync with singleAttributes.id when updated by child components
	useEffect(() => {
		if (singleAttributes.id && singleAttributes.id !== resolvedId) {
			setResolvedId(singleAttributes.id);
		}
	}, [singleAttributes.id, resolvedId]);

	const onInsert = useCallback(
		(type) => {
			let shortcode = '';
			if (type === 'single') {
				const finalAttributes = { ...singleAttributes };

				if (resolvedId && videoData) {
					if (finalAttributes.poster === videoData.poster) {
						delete finalAttributes.poster;
					}
					if (finalAttributes.poster_id === videoData.poster_id) {
						delete finalAttributes.poster_id;
					}
					if (finalAttributes.title === videoData.title) {
						delete finalAttributes.title;
					}
					if (finalAttributes.caption === videoData.caption) {
						delete finalAttributes.caption;
					}
				}

				shortcode = generateShortcode(
					finalAttributes,
					videoUrl,
					options
				);
			} else if (type === 'gallery') {
				shortcode = generateShortcode(galleryAttributes, '', options);
			} else {
				shortcode = generateShortcode(listAttributes, '', options);
			}

			if (
				editAttributes.tinymce_edit &&
				window.parent &&
				window.parent.videopack_tinymce_update_shortcode
			) {
				window.parent.videopack_tinymce_update_shortcode(shortcode);
			} else if (window.parent && window.parent.send_to_editor) {
				window.parent.send_to_editor(shortcode);
			} else if (window.send_to_editor) {
				window.send_to_editor(shortcode);
			}
		},
		[
			singleAttributes,
			videoUrl,
			galleryAttributes,
			listAttributes,
			options,
			editAttributes,
			resolvedId,
			videoData,
		]
	);

	return (
		<div className="videopack-classic-embed">
			<div className="videopack-tab-content">
				{activeTab === 'single' && (
					<>
						<PanelBody
							title={__(
								'Video URL',
								'video-embed-thumbnail-generator'
							)}
						>
							<TextControl
								label={__(
									'URL',
									'video-embed-thumbnail-generator'
								)}
								value={videoUrl}
								onChange={(newUrl) => {
									setVideoUrl(newUrl);
									// Immediately clear ID and metadata to prevent stale association
									setResolvedId(null);
									setSingleAttributes((prev) => ({
										...prev,
										id: 0,
										poster: undefined,
										poster_id: undefined,
										title: undefined,
										caption: undefined,
									}));
								}}
								help={__(
									'Enter the URL of the video file (e.g., .mp4, .webm).',
									'video-embed-thumbnail-generator'
								)}
							/>
							{urlError && (
								<div
									style={{
										color: '#d94f4f',
										marginTop: '8px',
										fontSize: '13px',
									}}
								>
									{urlError}
								</div>
							)}
						</PanelBody>
						{debouncedVideoUrl &&
							isValidUrl(debouncedVideoUrl) &&
							!isResolving && (
								<>
									<Thumbnails
										attributes={singleAttributes}
										src={debouncedVideoUrl}
										setAttributes={(newAttrs) =>
											setSingleAttributes((prev) => ({
												...prev,
												...newAttrs,
											}))
										}
										videoData={videoData}
										options={options}
										parentId={postId || 0}
										isProbing={isProbing}
										probedMetadata={effectiveMetadata}
									/>
									<VideoSettings
										attributes={singleAttributes}
										setAttributes={(newAttrs) =>
											setSingleAttributes((prev) => ({
												...prev,
												...newAttrs,
											}))
										}
										options={options}
										isProbing={isProbing}
										probedMetadata={effectiveMetadata}
									/>
									<AdditionalFormats
										attributes={singleAttributes}
										src={debouncedVideoUrl}
										setAttributes={(newAttrs) =>
											setSingleAttributes((prev) => ({
												...prev,
												...newAttrs,
											}))
										}
										options={options}
										parentId={postId || 0}
										probedMetadata={effectiveMetadata}
										isProbing={isProbing}
									/>
								</>
							)}
						<div className="videopack-insert-button-wrapper">
							<Button
								variant="primary"
								onClick={() => onInsert('single')}
								disabled={!videoUrl || !isValidUrl(videoUrl)}
							>
								{editAttributes.tinymce_edit
									? __(
											'Update',
											'video-embed-thumbnail-generator'
										)
									: __(
											'Insert into Post',
											'video-embed-thumbnail-generator'
										)}
							</Button>
						</div>
					</>
				)}
				{activeTab === 'gallery' && (
					<>
						<CollectionSettingsPanel
							attributes={galleryAttributes}
							setAttributes={(newAttrs) =>
								setGalleryAttributes((prev) => ({
									...prev,
									...newAttrs,
								}))
							}
							queryData={queryData}
							options={normalizedOptions}
							showGalleryOptions={true}
						/>
						<div className="videopack-insert-button-wrapper">
							<Button
								variant="primary"
								onClick={() => onInsert('gallery')}
							>
								{editAttributes.tinymce_edit
									? __(
											'Update',
											'video-embed-thumbnail-generator'
										)
									: __(
											'Insert into Post',
											'video-embed-thumbnail-generator'
										)}
							</Button>
						</div>
					</>
				)}
				{activeTab === 'list' && (
					<>
						<CollectionSettingsPanel
							attributes={listAttributes}
							setAttributes={(newAttrs) =>
								setListAttributes((prev) => ({
									...prev,
									...newAttrs,
								}))
							}
							queryData={queryData}
							options={normalizedOptions}
							showGalleryOptions={false}
						/>
						<div className="videopack-insert-button-wrapper">
							<Button
								variant="primary"
								onClick={() => onInsert('list')}
							>
								{editAttributes.tinymce_edit
									? __(
											'Update',
											'video-embed-thumbnail-generator'
										)
									: __(
											'Insert into Post',
											'video-embed-thumbnail-generator'
										)}
							</Button>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
