/**
 * Custom React hook for managing video settings.
 */

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
	'views',
	'starts',
	'play_25',
	'play_50',
	'play_75',
	'completeviews',
	'watermark',
	'watermark_link_to',
	'watermark_url',
	'poster',
	'poster_id',
	'total_thumbnails',
	'track',
	'title_color',
	'title_background_color',
	'play_button_color',
	'play_button_icon_color',
	'control_bar_bg_color',
	'control_bar_color',
];

/**
 * Hook to manage video settings and synchronize them with attachment metadata.
 *
 * @param {Object}   attributes    Block attributes.
 * @param {Function} setAttributes Function to update block attributes.
 * @param {Object}   options       Global options/settings.
 * @param {Object}   hookOptions   Hook options.
 * @param {boolean}  hookOptions.autoSave Whether to automatically save to the REST API.
 * @return {Object} Setting change handlers and options.
 */
const useVideoSettings = (
	attributes,
	setAttributes,
	options = {},
	{ autoSave = true } = {}
) => {
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
	}, [gifmode, setAttributes]);

	const updateAttachmentCallback = useCallback(
		(key, value) => {
			if (id && autoSave) {
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
		[id, autoSave]
	);

	const updateAttachment = useDebounce(updateAttachmentCallback, 1000);

	// Persist the consolidated _videopack-meta object to the REST API.
	// Since WordPress replaces the entire object meta field on POST,
	// we must send the full set of desired overrides ogni volta.
	const updateMetaCallback = useCallback(
		(currentAttrs) => {
			if (id && autoSave) {
				const metaToSave = {};
				metaKeys.forEach((key) => {
					if (key in currentAttrs) {
						const value = currentAttrs[key];

						// Skip empty strings for the title key to allow fallback to attachment title.
						if (key === 'title' && value === '') {
							metaToSave[key] = null;
							return;
						}

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
		[id, options, autoSave]
	);

	const updateMeta = useDebounce(updateMetaCallback, 1000);

	const handleSettingChange = (key, value) => {
		let updatedAttrs;
		if (typeof key === 'object' && key !== null) {
			const processedKey = { ...key };
			if ('title' in processedKey && processedKey.title === '') {
				processedKey.title = undefined;
			}
			updatedAttrs = { ...attributes, ...processedKey };
		} else {
			const processedValue =
				key === 'title' && value === '' ? undefined : value;
			updatedAttrs = { ...attributes, [key]: processedValue };
		}

		setAttributes(updatedAttrs);

		if (id) {
			// Handle caption updates for the attachment record.
			if (typeof key === 'object' && key !== null) {
				if ('caption' in key) {
					updateAttachment('caption', key.caption);
				}
				if ('title' in key) {
					updateAttachment('title', key.title);
				}
			} else if ('caption' === key || 'title' === key) {
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
