import { __, _x } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { useDebounce } from '@wordpress/compose';
import { useCallback, useEffect } from '@wordpress/element';

// Settings that can be stored per-video in _videopack-meta.
const metaKeys = [
	'width',
	'height',
	'downloadlink',
	'autoplay',
	'loop',
	'muted',
	'controls',
	'volume',
	'preload',
	'playback_rate',
	'playsinline',
	'right_click',
	'gifmode',
	'fixed_aspect',
	'align',
	'legacy_dimensions',
	'resize',
	'fullwidth',
	'embeddable',
	'embedcode',
	'overlay_title',
	'view_count',
	'watermark',
	'watermark_link_to',
	'watermark_url',
	'poster',
	'poster_id',
	'total_thumbnails',
	'track',
];

const useVideoSettings = (attributes, setAttributes, options = {}) => {
	const { id, gifmode } = attributes;

	useEffect(() => {
		if (gifmode) {
			setAttributes({
				autoplay: true,
				loop: true,
				muted: true,
				controls: false,
			});
		}
	}, [gifmode]);

	const updateAttachmentCallback = useCallback(
		(key, value) => {
			if (id) {
				apiFetch({
					path: `/wp/v2/media/${id}`,
					method: 'POST',
					data: { [key]: value },
				}).catch(() => {
					// eslint-disable-next-line no-console
					console.error(`Failed to update attachment ${id}`);
				});
			}
		},
		[id]
	);

	const updateAttachment = useDebounce(updateAttachmentCallback, 1000);

	// Persist the consolidated _videopack-meta object to the REST API.
	// Since WordPress replaces the entire object meta field on POST,
	// we must send the full set of desired overrides ogni volta.
	const updateMetaCallback = useCallback(
		(currentAttrs) => {
			if (id) {
				const metaToSave = {};
				metaKeys.forEach((key) => {
					const value = currentAttrs[key];
					if (value !== undefined && value !== null) {
						// Only store if it differs from the global option.
						if (
							options[key] !== undefined &&
							value === options[key]
						) {
							metaToSave[key] = null;
						} else {
							metaToSave[key] = value;
						}
					}
				});

				apiFetch({
					path: `/wp/v2/media/${id}`,
					method: 'POST',
					data: {
						meta: {
							'_videopack-meta': metaToSave,
						},
					},
				}).catch(() => {
					// eslint-disable-next-line no-console
					console.error(
						`Failed to update _videopack-meta for attachment ${id}`
					);
				});
			}
		},
		[id, options]
	);

	const updateMeta = useDebounce(updateMetaCallback, 1000);

	const handleSettingChange = (key, value) => {
		let updatedAttrs;
		if (typeof key === 'object' && key !== null) {
			updatedAttrs = { ...attributes, ...key };
		} else {
			updatedAttrs = { ...attributes, [key]: value };
		}
		setAttributes(updatedAttrs);

		if (id) {
			// Handle title/caption updates for the attachment record.
			if (typeof key === 'object' && key !== null) {
				if ('title' in key) {
					updateAttachment('title', key.title);
				}
				if ('caption' in key) {
					updateAttachment('caption', key.caption);
				}
			} else if ('title' === key || 'caption' === key) {
				updateAttachment(key, value);
			}

			// Check if any of the updated keys belong in _videopack-meta.
			const updatedKeys =
				typeof key === 'object' && key !== null
					? Object.keys(key)
					: [key];

			const shouldUpdateMeta = updatedKeys.some((k) =>
				metaKeys.includes(k)
			);

			if (shouldUpdateMeta) {
				updateMeta(updatedAttrs);
			}
		}
	};

	const preloadOptions = [
		{ value: 'auto', label: __('Auto', 'video-embed-thumbnail-generator') },
		{
			value: 'metadata',
			label: __('Metadata', 'video-embed-thumbnail-generator'),
		},
		{ value: 'none', label: _x('None', 'Preload value') },
	];

	return {
		handleSettingChange,
		preloadOptions,
	};
};

export default useVideoSettings;

