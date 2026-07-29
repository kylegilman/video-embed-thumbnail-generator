import { ToolbarButton } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { background as backgroundIcon } from '@wordpress/icons';

/**
 * Toolbar toggle for an overlay/badge block's background visibility.
 *
 * @param {Object}   root0               Component props.
 * @param {boolean}  root0.showBackground Current resolved value.
 * @param {Function} root0.onChange       Called with the new boolean value.
 * @return {Element} The rendered toolbar button.
 */
export default function BackgroundToggleButton({ showBackground, onChange }) {
	return (
		<ToolbarButton
			icon={backgroundIcon}
			label={
				showBackground
					? __('Hide Background Bar', 'video-embed-thumbnail-generator')
					: __('Show Background Bar', 'video-embed-thumbnail-generator')
			}
			isPressed={showBackground}
			onClick={() => onChange(!showBackground)}
		/>
	);
}
