import { Spinner } from '@wordpress/components';
import { useEntityRecord } from '@wordpress/core-data';
import { useState, useEffect, useCallback } from '@wordpress/element';
import Thumbnails from '../../../components/Thumbnails/Thumbnails.js';
import VideoSettings from '../../../blocks/videopack-video/VideoSettings.js';
import AdditionalFormats from '../../../components/AdditionalFormats/AdditionalFormats.js';
import { getSettings } from '../../../utils/utils.js';
import useVideoSettings from '../../../hooks/useVideoSettings.js';

const AttachmentDetails = ({ attachmentId, model }) => {
	const [options, setOptions] = useState();
	const [attributes, setRawAttributes] = useState();

	// Sync local attributes state to Backbone model for integration with other scripts (like TinyMCE).
	useEffect(() => {
		if (model && attributes) {
			model.set('videopack_attributes', attributes);
		}
	}, [model, attributes]);
	const attachment = useEntityRecord(
		'postType',
		'attachment',
		!isNaN(attachmentId) ? attachmentId : null
	);

	// Merging wrapper that mirrors the block editor's setAttributes behavior.
	// Prevents replacing the entire state when a single key changes.
	const mergeAttributes = useCallback((newAttrs) => {
		setRawAttributes((prev) => ({ ...prev, ...newAttrs }));
	}, []);

	useEffect(() => {
		getSettings().then((response) => {
			setOptions(response);
		});
	}, []);

	useEffect(() => {
		if (attachment.hasResolved && options && !attributes) {
			const videopackMeta =
				attachment.record?.meta?.['_videopack-meta'] || {};

			// Filter out null/undefined values from _videopack-meta so they
			// don't overwrite explicitly set values (e.g., poster from
			// _kgflashmediaplayer-poster).
			const filteredMeta = Object.fromEntries(
				Object.entries(videopackMeta).filter(
					([, v]) => v !== null && v !== undefined
				)
			);

			// Get initial attributes from model (passed from TinyMCE)
			const modelAttrs = model
				? model.get('videopack_attributes') || {}
				: {};

			// Simple type conversion for modelAttrs (shortcode values are strings)
			const parsedModelAttrs = {};
			Object.keys(modelAttrs).forEach((key) => {
				let val = modelAttrs[key];
				if (val === 'true') {
					val = true;
				} else if (val === 'false') {
					val = false;
				} else if (
					!isNaN(val) &&
					val !== '' &&
					typeof val === 'string'
				) {
					// Don't parse strings that should stay strings
					if (
						key !== 'id' &&
						key !== 'poster' &&
						key !== 'src' &&
						key !== 'title'
					) {
						val = Number(val);
					}
				}
				parsedModelAttrs[key] = val;
			});

			const combinedAttributes = {
				id: attachmentId,
				total_thumbnails:
					videopackMeta.total_thumbnails || options.total_thumbnails,
				src: attachment.record?.source_url,
				poster:
					attachment.record?.meta?.['_kgflashmediaplayer-poster'] ||
					attachment.record?.media_details?.sizes?.full?.source_url ||
					attachment.record?.image?.src,
				poster_id:
					attachment.record?.meta?.['_kgflashmediaplayer-poster-id'],
				// Merge any per-video overrides from _videopack-meta.
				// Only non-null values are included so they don't overwrite
				// values set above (like poster).
				...filteredMeta,
				// Prioritize shortcode attributes passed through the model
				...parsedModelAttrs,
			};
			setRawAttributes(combinedAttributes);
		}
	}, [options, attachment, attributes, attachmentId, model]);

	const { handleSettingChange } = useVideoSettings(
		attributes || {},
		mergeAttributes,
		options
	);

	if (attributes && attachment.hasResolved && options) {
		return (
			<div className="videopack-attachment-details">
				<Thumbnails
					setAttributes={handleSettingChange}
					attributes={attributes}
					videoData={attachment}
					options={options}
				/>
				<VideoSettings
					setAttributes={handleSettingChange}
					attributes={attributes}
					options={options}
				/>
				<AdditionalFormats attributes={attributes} options={options} />
			</div>
		);
	}
	return <Spinner />;
};

export default AttachmentDetails;
