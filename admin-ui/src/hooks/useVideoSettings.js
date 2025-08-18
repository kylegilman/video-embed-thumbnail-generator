import { __, _x } from '@wordpress/i18n';

const useVideoSettings = (attributes, setAttributes) => {
	const handleSettingChange = (key, value) => {
		setAttributes({ [key]: value });
	};

	const preloadOptions = [
		{ value: 'auto', label: __('Auto') },
		{ value: 'metadata', label: __('Metadata') },
		{ value: 'none', label: _x('None', 'Preload value') },
	];

	return {
		handleSettingChange,
		preloadOptions,
	};
};

export default useVideoSettings;
