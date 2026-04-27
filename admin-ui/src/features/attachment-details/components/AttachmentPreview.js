/**
 * Dedicated component to render a VideoPlayer within the WordPress Media Library preview area.
 */

import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useMemo, useCallback } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { decodeEntities } from '@wordpress/html-entities';
import VideoPlayer from '../../../components/VideoPlayer/VideoPlayer.js';
import PreviewIframe from '../../../components/PreviewIframe/PreviewIframe.js';
import { getSettings } from '../../../api/settings';
import { BlockPreview } from '../../../components/Preview';

/**
 * AttachmentPreview component.
 *
 * @param {Object} props              Component props.
 * @param {number} props.attachmentId The ID of the attachment.
 * @param {Object} props.model        Backbone model for the attachment.
 * @return {Object} The rendered component.
 */
const AttachmentPreview = ({ attachmentId, model }) => {
	const [options, setOptions] = useState();
	const [record, setRecord] = useState(null);
	const [attributes, setAttributes] = useState(null);
	const [hasResolved, setHasResolved] = useState(false);

	const [nativeMetadata, setNativeMetadata] = useState({
		title: model ? model.get('title') : '',
		caption: model ? model.get('caption') : '',
	});

	// Fetch the full media record from the REST API.
	useEffect(() => {
		if (!isNaN(attachmentId) && attachmentId > 0) {
			setHasResolved(false);
			apiFetch({ path: `/wp/v2/media/${attachmentId}` })
				.then((data) => {
					setRecord(data);
					setHasResolved(true);
				})
				.catch(() => {
					setRecord(null);
					setHasResolved(true);
				});
		} else {
			setRecord(null);
			setHasResolved(false);
		}
	}, [attachmentId]);

	// Fetch global plugin options.
	useEffect(() => {
		getSettings().then((response) => {
			setOptions(response);
		});
	}, []);

	// Listen for native title/caption changes on the Backbone model or DOM.
	useEffect(() => {
		const onNativeChange = () => {
			if (model) {
				setNativeMetadata({
					title: model.get('title'),
					caption: model.get('caption'),
				});
			}
		};

		if (model) {
			model.on('change:title change:caption', onNativeChange);
			return () => {
				model.off('change:title change:caption', onNativeChange);
			};
		}

		// DOM bridge for standalone page.
		const onDomUpdate = (event) => {
			setNativeMetadata((prev) => ({
				...prev,
				...event.detail,
			}));
		};
		window.addEventListener(
			'videopack_native_metadata_update',
			onDomUpdate
		);

		// Listen for settings updates from the sidebar (React root bridge).
		const onSettingsUpdate = (event) => {
			// Filter out undefined values to prevent overwriting valid preview state.
			const updates = Object.fromEntries(
				Object.entries(event.detail).filter(([, v]) => v !== undefined)
			);
			setAttributes((prev) => ({
				...prev,
				...updates,
			}));
		};
		window.addEventListener('videopack_settings_update', onSettingsUpdate);

		return () => {
			window.removeEventListener(
				'videopack_native_metadata_update',
				onDomUpdate
			);
			window.removeEventListener(
				'videopack_settings_update',
				onSettingsUpdate
			);
		};
	}, [model]);

	// Calculate initial attributes based on the record and options.
	const initialAttributes = useMemo(() => {
		if (hasResolved && record && options) {
			const videopackMeta = record.meta?.['_videopack-meta'] || {};
			const sources = record.videopack?.sources || [
				{ src: record.source_url },
			];
			const sourceGroups = record.videopack?.source_groups || {};

			// Prioritize the live native metadata from the Backbone model if available,
			// falling back to the stale REST API record.
			const currentNativeTitle = nativeMetadata.title || '';
			const fallbackTitle =
				typeof record.title === 'string'
					? record.title
					: record.title?.rendered || record.title?.raw || '';

			const defaultTitle = decodeEntities(
				currentNativeTitle || fallbackTitle
			);
			const filteredMeta = Object.fromEntries(
				Object.entries(videopackMeta).filter(
					([, v]) => v !== null && v !== undefined
				)
			);
			return {
				...options,
				...filteredMeta,
				id: attachmentId,
				title: videopackMeta.title || defaultTitle,
				caption: videopackMeta.caption || nativeMetadata.caption || '',
				src: record.source_url,
				poster:
					record.meta?.['_kgflashmediaplayer-poster'] ||
					record.media_details?.sizes?.full?.source_url ||
					record.image?.src,
				sources,
				source_groups: sourceGroups,
				embedlink: record.link,
				count: videopackMeta.starts || 0,
			};
		}
		return null;
	}, [record, options, hasResolved, attachmentId, nativeMetadata]);

	// Helper to merge local attributes with Backbone model attributes safely.
	const getMergedAttributes = useCallback(
		(baseAttrs) => {
			if (!baseAttrs) {
				return null;
			}
			const modelAttrsRaw = model
				? model.get('videopack_attributes')
				: null;
			let parsedModelAttrs = {};
			try {
				parsedModelAttrs =
					typeof modelAttrsRaw === 'string'
						? JSON.parse(modelAttrsRaw || '{}')
						: modelAttrsRaw || {};
			} catch (e) {
				// eslint-disable-next-line no-console
				console.error('Failed to parse videopack_attributes', e);
			}

			// Clean up types (boolean/numbers) from model/shortcode.
			Object.keys(parsedModelAttrs).forEach((key) => {
				let val = parsedModelAttrs[key];
				if (val === 'true') {
					val = true;
				} else if (val === 'false') {
					val = false;
				} else if (
					!isNaN(val) &&
					val !== '' &&
					typeof val === 'string'
				) {
					if (!['id', 'poster', 'src', 'title'].includes(key)) {
						val = Number(val);
					}
				}
				parsedModelAttrs[key] = val;
			});

			const merged = {
				...baseAttrs,
				...parsedModelAttrs,
			};

			if (!merged.title) {
				merged.title = baseAttrs.title;
			}

			return merged;
		},
		[model]
	);

	// Update active attributes whenever initialAttributes change.
	useEffect(() => {
		if (initialAttributes) {
			const merged = getMergedAttributes(initialAttributes);
			setAttributes(merged);
		}
	}, [initialAttributes, getMergedAttributes]);

	// Listen for subsequent changes from the sidebar via the Backbone model.
	useEffect(() => {
		if (!model || !initialAttributes) {
			return;
		}

		const handleModelChange = () => {
			const merged = getMergedAttributes(initialAttributes);
			setAttributes(merged);
		};

		model.on('change:videopack_attributes', handleModelChange);
		return () => {
			model.off('change:videopack_attributes', handleModelChange);
		};
	}, [model, initialAttributes, getMergedAttributes]);

	const videopackConfig = window.videopack_config || {};
	const containerStyle = useMemo(() => {
		const styles = {};
		if (videopackConfig.contentSize) {
			styles['--wp--style--global--content-size'] =
				videopackConfig.contentSize;
		}
		if (videopackConfig.wideSize) {
			styles['--wp--style--global--wide-size'] = videopackConfig.wideSize;
		}
		return styles;
	}, [videopackConfig.contentSize, videopackConfig.wideSize]);

	const previewContext = useMemo(() => {
		if (!attributes) {
			return {};
		}
		const ctx = {};
		Object.keys(attributes).forEach((key) => {
			ctx[`videopack/${key}`] = attributes[key];
		});
		ctx['videopack/postId'] = attachmentId;
		return ctx;
	}, [attributes, attachmentId]);

	// Only render once we have resolved the record and calculated initial attributes.
	if (!hasResolved || !options || !attributes) {
		return <Spinner />;
	}

	return (
		<PreviewIframe
			title={__(
				'Attachment Preview',
				'video-embed-thumbnail-generator'
			)}
			resizeDependencies={[attributes.align]}
		>
			<div
				className={`wp-block-videopack-videopack-video${
					attributes.align ? ` align${attributes.align}` : ''
				}`}
				style={containerStyle}
			>
				<VideoPlayer attributes={attributes}>
					{(attributes.overlay_title ||
						attributes.downloadlink ||
						(attributes.embeddable && attributes.embedcode)) && (
						<BlockPreview
							name="videopack/video-title"
							attributes={{
								title: attributes.title,
								overlay_title: !!attributes.overlay_title,
								downloadlink: !!attributes.downloadlink,
								embedcode: !!(
									attributes.embeddable &&
									attributes.embedcode
								),
								showBackground: true,
							}}
							isInsidePlayerOverlay={true}
							isInsidePlayerContainer={true}
							isOverlay={true}
							context={previewContext}
						/>
					)}
					{attributes.watermark && (
						<BlockPreview
							name="videopack/video-watermark"
							isInsidePlayerOverlay={true}
							isInsidePlayerContainer={true}
							isOverlay={true}
							context={previewContext}
						/>
					)}
				</VideoPlayer>
				{attributes.views && (
					<BlockPreview
						name="videopack/view-count"
						attributes={{
							count: attributes.count,
							showText: true,
							iconType: 'none',
						}}
						context={previewContext}
					/>
				)}
			</div>
		</PreviewIframe>
	);
};

export default AttachmentPreview;
