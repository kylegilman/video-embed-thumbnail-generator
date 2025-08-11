import {
	TextControl,
	SelectControl,
	ToggleControl,
	PanelBody,
} from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import VideoGallery from './VideopackRender/gallery/VideoGallery';

const GalleryBlock = ({
	attributes,
	setAttributes,
	videoChildren,
	options,
}) => {
	useEffect(() => {
		if (options) {
			const newAttributes = {};
			const settingsToSync = [
				'gallery_columns',
				'gallery_title',
				'gallery_pagination',
				'gallery_per_page',
				'gallery_end',
				'skin',
			];

			settingsToSync.forEach((setting) => {
				if (
					attributes[setting] === undefined &&
					options[setting] !== undefined
				) {
					newAttributes[setting] = options[setting];
				}
			});

			if (Object.keys(newAttributes).length > 0) {
				setAttributes(newAttributes);
			}
		}
	}, [options]);

	const {
		gallery_orderby,
		gallery_order,
		gallery_include,
		gallery_exclude,
		gallery_end,
		gallery_pagination,
		gallery_per_page,
		gallery_title,
		gallery_columns,
	} = attributes;

	const galleryOrderbyOptions = [
		{ value: 'menu_order', label: __('Menu Order') },
		{ value: 'title', label: __('Title') },
		{ value: 'post_date', label: __('Date') },
		{ value: 'rand', label: __('Random') },
		{ value: 'ID', label: __('Video ID') },
	];

	const attributeChangeFactory = (attributeName, isNumeric = false) => {
		return (newValue) => {
			let valueToSet = newValue;
			if (isNumeric) {
				const parsedValue = parseInt(newValue, 10);
				valueToSet = isNaN(parsedValue) ? undefined : parsedValue;
			}
			setAttributes({ [attributeName]: valueToSet });
		};
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Gallery Settings')}>
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__('Include these videos in the gallery')}
						value={gallery_include}
						onChange={attributeChangeFactory('gallery_include')}
					/>
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__('Exclude these videos from the gallery')}
						value={gallery_exclude}
						onChange={attributeChangeFactory('gallery_exclude')}
					/>
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__('Sort by')}
						value={gallery_orderby}
						onChange={attributeChangeFactory('gallery_orderby')}
						options={galleryOrderbyOptions}
						hideCancelButton={true}
					/>
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__('Sort order')}
						value={gallery_order}
						onChange={attributeChangeFactory('gallery_order')}
						options={[
							{ label: __('Ascending'), value: 'ASC' },
							{ label: __('Descending'), value: 'DESC' },
						]}
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__('Paginate video gallery')}
						checked={!!gallery_pagination}
						onChange={attributeChangeFactory('gallery_pagination')}
					/>
					{gallery_pagination && (
						<TextControl
							label={__('Number of videos per page')}
							value={gallery_per_page}
							onChange={attributeChangeFactory(
								'gallery_per_page',
								true
							)}
						/>
					)}
					<TextControl
						label={__('Columns')}
						type="number"
						value={gallery_columns}
						onChange={attributeChangeFactory(
							'gallery_columns',
							true
						)}
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__('Show video title overlay on thumbnails')}
						onChange={attributeChangeFactory('gallery_title')}
						checked={!!gallery_title}
					/>
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__('When gallery video finishes')}
						value={gallery_end}
						onChange={attributeChangeFactory('gallery_end')}
						options={[
							{
								label: __('Stop, but leave popup window open'),
								value: '',
							},
							{
								label: __('Autoplay next video in the gallery'),
								value: 'next',
							},
							{ label: __('Close popup window'), value: 'close' },
						]}
					/>
				</PanelBody>
			</InspectorControls>
			<div {...useBlockProps()}>
				<VideoGallery
					attributes={attributes}
					videoChildren={videoChildren}
				/>
			</div>
		</>
	);
};

export default GalleryBlock;
