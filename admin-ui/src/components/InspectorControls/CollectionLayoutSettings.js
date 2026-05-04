import {
	TextControl,
	SelectControl,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function CollectionLayoutSettings({
	attributes,
	setAttributes,
	options = {},
}) {
	const { gallery_columns, overlay_title, gallery_end } = attributes;

	const updateNumericAttribute = (name, value) => {
		const parsedValue = parseInt(value, 10);
		setAttributes({ [name]: isNaN(parsedValue) ? undefined : parsedValue });
	};

	return (
		<>
			<TextControl
				label={__('Max Columns', 'video-embed-thumbnail-generator')}
				type="number"
				value={gallery_columns ?? ''}
				onChange={(val) =>
					updateNumericAttribute('gallery_columns', val)
				}
			/>
			<ToggleControl
				__nextHasNoMarginBottom
				label={__('Title overlay', 'video-embed-thumbnail-generator')}
				onChange={(val) => setAttributes({ overlay_title: val })}
				checked={overlay_title ?? !!options.overlay_title}
			/>
			<SelectControl
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				label={__(
					'When current video ends',
					'video-embed-thumbnail-generator'
				)}
				value={gallery_end}
				onChange={(val) => setAttributes({ gallery_end: val })}
				options={[
					{
						label: __(
							'Stop and leave popup window open',
							'video-embed-thumbnail-generator'
						),
						value: '',
					},
					{
						label: __(
							'Autoplay next video',
							'video-embed-thumbnail-generator'
						),
						value: 'next',
					},
					{
						label: __(
							'Close popup window',
							'video-embed-thumbnail-generator'
						),
						value: 'close',
					},
				]}
			/>
		</>
	);
}
