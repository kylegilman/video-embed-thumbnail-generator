/**
 * Dedicated component to render a VideoPlayer within the WordPress Media Library preview area.
 */

import { Spinner } from '@wordpress/components';
import { BlockContextProvider } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useMemo, useCallback } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { decodeEntities } from '@wordpress/html-entities';
import VideoPlayer from '../../../components/VideoPlayer/VideoPlayer.js';
import PreviewIframe from '../../../components/PreviewIframe/PreviewIframe.js';
import { getSettings } from '../../../api/settings';
import useStablePreviewBlocks from '../../../hooks/useStablePreviewBlocks';
import RealBlockPreview from '../../../components/RealBlockPreview';
import { getTitleInnerTemplate } from '../../../utils/titleDownloadBlock';

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

	// Base context, shared by everything rendered here — the view-count block
	// (a sibling of VideoPlayer, not inside its overlay) uses this directly.
	const previewContext = useMemo(() => {
		if (!attributes) {
			return {};
		}
		const ctx = {};
		Object.keys(attributes).forEach((key) => {
			ctx[`videopack/${key}`] = attributes[key];
		});
		ctx['videopack/postId'] = attachmentId;
		ctx['videopack/attachmentId'] = attachmentId;
		ctx['videopack/isPreview'] = true;
		return ctx;
	}, [attributes, attachmentId]);

	// Title/Watermark render inside VideoPlayer's overlay chrome, so they need
	// the extra isInsidePlayerOverlay/isInsidePlayerContainer context that
	// their real edit.js components check for — view-count deliberately
	// doesn't get these (it's outside the player, left-aligned by default).
	const playerOverlayContext = useMemo(
		() => ({
			...previewContext,
			'videopack/isInsidePlayerOverlay': true,
			'videopack/isInsidePlayerContainer': true,
		}),
		[previewContext]
	);

	// These four determine the preview's block *structure* (which blocks/
	// inner-blocks exist) — everything else (colors, watermark image URL,
	// etc.) flows through playerOverlayContext/previewContext instead, so
	// changing them doesn't need to rebuild the block tree below. Depending
	// on the whole `attributes` object here would recompute overlayBlocks on
	// every settings change (attributes is a new object each time), forcing
	// useBlockPreview to tear down and remount its internal preview editor —
	// visible as the whole player flashing even for an unrelated color tweak.
	const overlayTitleAttr = attributes?.overlay_title;
	const downloadlinkAttr = attributes?.downloadlink;
	const embeddableAttr = attributes?.embeddable;
	const embedcodeAttr = attributes?.embedcode;
	const watermarkAttr = attributes?.watermark;
	const viewsAttr = attributes?.view_count;

	const showTitleBar = !!(
		overlayTitleAttr ||
		downloadlinkAttr ||
		(embeddableAttr && embedcodeAttr)
	);

	const overlayTemplate = useMemo(() => {
		const template = [];
		if (showTitleBar) {
			template.push([
				'videopack/title',
				{
					overlay_title: !!overlayTitleAttr,
					showBackground: true,
				},
				getTitleInnerTemplate(
					!!downloadlinkAttr,
					!!(embeddableAttr && embedcodeAttr)
				),
			]);
		}
		if (watermarkAttr) {
			template.push(['videopack/watermark', {}]);
		}
		return template;
	}, [
		showTitleBar,
		overlayTitleAttr,
		downloadlinkAttr,
		embeddableAttr,
		embedcodeAttr,
		watermarkAttr,
	]);
	const overlayBlocks = useStablePreviewBlocks(overlayTemplate);

	const viewCountTemplate = useMemo(() => {
		if (!viewsAttr) {
			return [];
		}
		return [['videopack/view-count', { iconType: 'none', showText: true }]];
	}, [viewsAttr]);
	const viewCountBlocks = useStablePreviewBlocks(viewCountTemplate);

	// Only render once we have resolved the record and calculated initial attributes.
	if (!hasResolved || !options || !attributes) {
		return <Spinner />;
	}

	return (
		<PreviewIframe
			title={__('Attachment Preview', 'video-embed-thumbnail-generator')}
			resizeDependencies={[attributes.align]}
		>
			<div
				className={`wp-block-videopack-videopack-video${
					attributes.align ? ` align${attributes.align}` : ''
				}`}
				style={containerStyle}
			>
				<VideoPlayer attributes={attributes}>
					{overlayBlocks.length > 0 && (
						<BlockContextProvider value={playerOverlayContext}>
							<RealBlockPreview blocks={overlayBlocks} />
						</BlockContextProvider>
					)}
				</VideoPlayer>
				{viewCountBlocks.length > 0 && (
					<BlockContextProvider value={previewContext}>
						<RealBlockPreview blocks={viewCountBlocks} />
					</BlockContextProvider>
				)}
			</div>
		</PreviewIframe>
	);
};

export default AttachmentPreview;
