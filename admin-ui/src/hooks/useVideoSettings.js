import { __, _x } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { useDebounce } from '@wordpress/compose';
import { useCallback, useEffect } from '@wordpress/element';

const useVideoSettings = (attributes, setAttributes) => {
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

	const handleSettingChange = (key, value) => {
		setAttributes({ [key]: value });

		if (id && ('title' === key || 'caption' === key)) {
			updateAttachment(key, value);
		}
	};

	const preloadOptions = [
		{ value: 'auto', label: __( 'Auto', 'video-embed-thumbnail-generator' ) },
		{ value: 'metadata', label: __( 'Metadata', 'video-embed-thumbnail-generator' ) },
		{ value: 'none', label: _x('None', 'Preload value') },
	];

	return {
		handleSettingChange,
		preloadOptions,
	};
};

export default useVideoSettings;
