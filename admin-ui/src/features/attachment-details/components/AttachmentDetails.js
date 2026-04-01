/**
 * Component to display attachment details and settings for a video.
 */

import { Spinner } from '@wordpress/components';
import { useState, useEffect, useCallback, useMemo } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import VideoSettings from '../../../components/VideoSettings/VideoSettings.js';
import Thumbnails from '../../../components/Thumbnails/Thumbnails.js';
import AdditionalFormats from '../../../components/AdditionalFormats/AdditionalFormats.js';
import { getSettings } from '../../../api/settings';
import useVideoSettings from '../../../hooks/useVideoSettings.js';
import useVideoProbe from '../../../hooks/useVideoProbe.js';

/**
 * AttachmentDetails component.
 *
 * @param {Object} props              Component props.
 * @param {number} props.attachmentId The ID of the attachment.
 * @param {Object} props.model        Backbone model for the attachment.
 * @return {Object} The rendered component.
 */
const AttachmentDetails = ({ attachmentId, model }) => {
	const [options, setOptions] = useState();
	const [attributes, setRawAttributes] = useState();
	const [record, setRecord] = useState(null);
	const [hasResolved, setHasResolved] = useState(false);
	const [, forceUpdate] = useState({});

	const { isProbing, probedMetadata } = useVideoProbe(attributes?.src);
	const [probedMetadataOverride, setProbedMetadataOverride] = useState(null);

	// Sync metadata from attachment records when it loads
	useEffect(() => {
		if (record?.media_details && !probedMetadata) {
			const { width, height, duration } = record.media_details;
			setProbedMetadataOverride({
				width,
				height,
				duration,
				isTainted: false, // Internal media is never tainted
			});
		} else if (!attributes?.src) {
			setProbedMetadataOverride(null);
		}
	}, [record, probedMetadata, attributes?.src]);

	const effectiveMetadata = probedMetadataOverride || probedMetadata;

	useEffect(() => {
		if (attributes && hasResolved) {
			if (model) {
				model.set('videopack_attributes', attributes);
			} else {
				// Standalone page: Update hidden field instead of REST API.
				const hiddenInput = document.getElementById(
					'videopack_meta_json'
				);
				if (hiddenInput) {
					const currentMeta = record?.meta?.['_videopack-meta'] || {};
					const newMeta = { ...currentMeta, ...attributes };
					hiddenInput.value = JSON.stringify(newMeta);
				}
			}
		}
	}, [model, attributes, hasResolved, record]);

	useEffect(() => {
		if (attributes && attributes.id && !model) {
			window.dispatchEvent(
				new CustomEvent('videopack_settings_update', {
					detail: attributes,
				})
			);
		}
	}, [attributes, model]);

	// Fetch the full media record from the REST API to get videopack metadata.
	useEffect(() => {
		if (!isNaN(attachmentId) && attachmentId > 0) {
			setHasResolved(false);
			setRecord(null); // Eagerly reset to prevent stale probes
			setRawAttributes(null); // Eagerly reset to prevent stale AdditionalFormats fetch
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

	const attachment = useMemo(
		() => ({ record, hasResolved }),
		[record, hasResolved]
	);

	// Fetch global plugin options.
	useEffect(() => {
		getSettings().then((response) => {
			setOptions(response);
		});
	}, []);

	// Listen for native title/caption changes on the Backbone model or DOM.
	useEffect(() => {
		const onNativeChange = () => {
			forceUpdate({});
		};

		if (model) {
			model.on('change:title change:caption', onNativeChange);
			return () => {
				model.off('change:title change:caption', onNativeChange);
			};
		}

		// DOM bridge for standalone page.
		const onDomChange = () => {
			forceUpdate({});
		};
		window.addEventListener(
			'videopack_native_metadata_update',
			onDomChange
		);
		return () => {
			window.removeEventListener(
				'videopack_native_metadata_update',
				onDomChange
			);
		};
	}, [model]);

	// Merging wrapper that mirrors the block editor's setAttributes behavior.
	const mergeAttributes = useCallback((newAttrs) => {
		setRawAttributes((prev) => ({ ...prev, ...newAttrs }));
	}, []);

	// Calculate and initialize the combined attributes object.
	useEffect(() => {
		if (attachment.hasResolved && options) {
			const recordId = attachment.record?.id;
			const videopackMeta =
				attachment.record?.meta?.['_videopack-meta'] || {};

			// Filter out null values so they don't overwrite defaults.
			const filteredMeta = Object.fromEntries(
				Object.entries(videopackMeta).filter(
					([, v]) => v !== null && v !== undefined
				)
			);

			// Prioritize attributes stored in the Backbone model (e.g., from a shortcode).
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

			// Clean up types for attributes coming from the model/shortcode.
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

			// Resolve caption with native Backbone model as priority.
			const nativeCaption = model ? model.get('caption') : '';

			const combinedAttributes = {
				...options,
				id: recordId,
				total_thumbnails:
					videopackMeta.total_thumbnails || options.total_thumbnails,
				title: attachment.record?.title?.rendered || '',
				caption: nativeCaption || '',
				src: attachment.record?.source_url,
				poster:
					attachment.record?.meta?.['_kgflashmediaplayer-poster'] ||
					attachment.record?.media_details?.sizes?.full?.source_url ||
					attachment.record?.image?.src,
				poster_id:
					attachment.record?.meta?.['_kgflashmediaplayer-poster-id'],
				sources:
					attachment.record?.videopack?.sources ||
					(attachment.record?.source_url
						? [{ src: attachment.record.source_url }]
						: []),
				source_groups:
					attachment.record?.videopack?.source_groups || {},
				...filteredMeta,
				...parsedModelAttrs,
			};

			setRawAttributes(combinedAttributes);
		}
	}, [options, attachment, record, model]); // attachment.record is specifically watched

	const { handleSettingChange } = useVideoSettings(
		attributes || {},
		mergeAttributes,
		options,
		{ autoSave: true }
	);

	if (attributes && attachment.hasResolved && options) {
		// Hide Videopack controls if editing a generated format.
		if (attachment.record?.meta?.['_kgflashmediaplayer-format']) {
			return null;
		}

		return (
			<div className="videopack-attachment-details">
				<Thumbnails
					setAttributes={handleSettingChange}
					attributes={attributes}
					videoData={attachment}
					options={options}
					parentId={attachment.record?.post || 0}
					isProbing={isProbing}
					probedMetadata={effectiveMetadata}
				/>
				<VideoSettings
					setAttributes={handleSettingChange}
					attributes={attributes}
					options={options}
					isProbing={isProbing}
					probedMetadata={effectiveMetadata}
					fallbackTitle={
						(model ? model.get('title') : '') ||
						attachment.record?.title?.rendered ||
						''
					}
					fallbackCaption={(model ? model.get('caption') : '') || ''}
				/>
				<AdditionalFormats
					key={attributes.id || attributes.src}
					attributes={attributes}
					options={options}
					isProbing={isProbing}
					probedMetadata={effectiveMetadata}
				/>
			</div>
		);
	}

	return <Spinner />;
};

export default AttachmentDetails;
