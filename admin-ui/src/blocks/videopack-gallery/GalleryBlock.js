import {
	TextControl,
	SelectControl,
	ToggleControl,
	PanelBody,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import VideoGallery from '../../components/VideoGallery/VideoGallery';

const GalleryBlock = ({ attributes, setAttributes, videoChildren }) => {
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

	const baseGalleryOrderbyOptions = [
		{ value: 'menu_order', label: __( 'Menu Order', 'video-embed-thumbnail-generator' ) },
		{ value: 'title', label: __( 'Title', 'video-embed-thumbnail-generator' ) },
		{ value: 'post_date', label: __( 'Date', 'video-embed-thumbnail-generator' ) },
		{ value: 'rand', label: __( 'Random', 'video-embed-thumbnail-generator' ) },
		{ value: 'ID', label: __( 'Video ID', 'video-embed-thumbnail-generator' ) },
	];

	const filteredGalleryOrderbyOptions = gallery_include
		? [
				...baseGalleryOrderbyOptions,
				{ value: 'include', label: __( 'Manually Sorted', 'video-embed-thumbnail-generator' ) },
			]
		: baseGalleryOrderbyOptions;

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
				<PanelBody title={__( 'Gallery Settings', 'video-embed-thumbnail-generator' )}>
					{/* <TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__( 'Include these videos in the gallery', 'video-embed-thumbnail-generator' )}
						value={gallery_include ?? ''}
						onChange={attributeChangeFactory('gallery_include')}
					/>
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__( 'Exclude these videos from the gallery', 'video-embed-thumbnail-generator' )}
						value={gallery_exclude ?? ''}
						onChange={attributeChangeFactory('gallery_exclude')}
					/> */}
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__( 'Sort by', 'video-embed-thumbnail-generator' )}
						value={gallery_orderby}
						onChange={attributeChangeFactory('gallery_orderby')}
						options={filteredGalleryOrderbyOptions}
						hideCancelButton={true}
					/>
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__( 'Sort order', 'video-embed-thumbnail-generator' )}
						value={gallery_order}
						onChange={attributeChangeFactory('gallery_order')}
						options={[
							{ label: __( 'Ascending', 'video-embed-thumbnail-generator' ), value: 'ASC' },
							{ label: __( 'Descending', 'video-embed-thumbnail-generator' ), value: 'DESC' },
						]}
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__( 'Paginate video gallery', 'video-embed-thumbnail-generator' )}
						checked={!!gallery_pagination}
						onChange={attributeChangeFactory('gallery_pagination')}
					/>
					{gallery_pagination && (
						<TextControl
							label={__( 'Number of videos per page', 'video-embed-thumbnail-generator' )}
							type="number"
							value={gallery_per_page}
							onChange={attributeChangeFactory(
								'gallery_per_page',
								true
							)}
						/>
					)}
					<TextControl
						label={__( 'Columns', 'video-embed-thumbnail-generator' )}
						type="number"
						value={gallery_columns}
						onChange={attributeChangeFactory(
							'gallery_columns',
							true
						)}
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__( 'Show video title overlay on thumbnails', 'video-embed-thumbnail-generator' )}
						onChange={attributeChangeFactory('gallery_title')}
						checked={!!gallery_title}
					/>
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__( 'When gallery video finishes', 'video-embed-thumbnail-generator' )}
						value={gallery_end}
						onChange={attributeChangeFactory('gallery_end')}
						options={[
							{
								label: __( 'Stop, but leave popup window open', 'video-embed-thumbnail-generator' ),
								value: '',
							},
							{
								label: __( 'Autoplay next video in the gallery', 'video-embed-thumbnail-generator' ),
								value: 'next',
							},
							{ label: __( 'Close popup window', 'video-embed-thumbnail-generator' ), value: 'close' },
						]}
					/>
				</PanelBody>
			</InspectorControls>
			<div {...useBlockProps()} onDragStart={(e) => e.stopPropagation()}>
				<VideoGallery
					attributes={attributes}
					videoChildren={videoChildren}
					setAttributes={setAttributes}
					isEditing={true}
				/>
			</div>
		</>
	);
};

export default GalleryBlock;
