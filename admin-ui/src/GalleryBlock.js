import {
	TextControl,
	SelectControl,
	ToggleControl,
	PanelBody,
} from '@wordpress/components';
import { useRef, useEffect, useMemo, useState } from '@wordpress/element';
import { __, _x, _n } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import VideoGallery from './VideopackRender/gallery/VideoGallery';

const GalleryBlock = ({ attributes, setAttributes, videoChildren }) => {
	const {
		gallery_pagination,
		gallery_per_page,
		gallery_columns,
		gallery_orderby,
		gallery_order,
		gallery_include,
		gallery_exclude,
		gallery_end,
		gallery_title,
	} = attributes;

	const toggleFactory = useMemo(() => {
		const toggleAttribute = (attribute) => {
			return (newValue) => {
				setAttributes({ [attribute]: newValue });
			};
		};

		return {
			gallery_title: toggleAttribute('gallery_title'),
		};
	}, []);

	const galleryOrderbyOptions = [
		{ value: 'menu_order', label: __('Menu Order') },
		{ value: 'title', label: __('Title') },
		{ value: 'post_date', label: __('Date') },
		{ value: 'rand', label: __('Random') },
		{ value: 'ID', label: __('Video ID') },
	];

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Gallery Settings')}>
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__('Include these videos in the gallery')}
						value={gallery_include}
						onChange={(value) =>
							setAttributes({ gallery_include: value })
						}
					/>
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__('Sort by')}
						value={gallery_orderby}
						onChange={(value) =>
							setAttributes({ gallery_orderby: value })
						}
						options={galleryOrderbyOptions}
						hideCancelButton={true}
					/>
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__('Sort order')}
						value={gallery_order}
						onChange={(value) =>
							setAttributes({ gallery_order: value })
						}
						options={[
							{ label: __('Ascending'), value: 'ASC' },
							{ label: __('Descending'), value: 'DESC' },
						]}
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__('Paginate video gallery')}
						checked={!!gallery_pagination}
						onChange={(value) =>
							setAttributes({ gallery_pagination: value })
						}
					/>
					{gallery_pagination && (
						<TextControl
							label={__('Number of videos per page')}
							value={gallery_per_page}
							onChange={(value) =>
								setAttributes({ gallery_per_page: value })
							}
						/>
					)}
					<ToggleControl
						__nextHasNoMarginBottom
						label={__('Show video title overlay on thumbnails')}
						onChange={toggleFactory.gallery_title}
						checked={!!gallery_title}
					/>
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__('When gallery video finishes')}
						value={gallery_end}
						onChange={(value) =>
							setAttributes({ gallery_end: value })
						}
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
