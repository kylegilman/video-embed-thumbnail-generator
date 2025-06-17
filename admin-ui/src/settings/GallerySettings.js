import apiFetch from '@wordpress/api-fetch';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	PanelBody,
	SelectControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import VideoGallery from '../VideopackRender/gallery/VideoGallery';

const GallerySettings = ( { settings, changeHandlerFactory } ) => {
	const {
		embed_method,
		gallery_width,
		gallery_columns,
		gallery_end,
		gallery_per_page,
		gallery_title,
		gallery_pagination,
		js_skin,
		width,
		height,
	} = settings;

	const [ galleryAttributes, setGalleryAttributes ] = useState( null );
	const [ recentVideos, setRecentVideos ] = useState( null );

	//const aspectRatio = ( width && height ) ? width / height : 1.77777;

	useEffect( () => {
		apiFetch( {
			path: '/videopack/v1/recent_videos?posts=' + '12',
			method: 'GET',
		} )
			.then( ( response ) => {
				setRecentVideos( response );
				console.log( response );
			} )
			.catch( ( error ) => {
				console.error( 'Error fetching videos:', error );
			} );
	}, [] );

	useEffect( () => {
		if ( recentVideos && Array.isArray( recentVideos ) ) {
			setGalleryAttributes( {
				...settings,
				gallery_include: recentVideos.join( ',' ),
			} );
		}
	}, [
		gallery_width,
		gallery_columns,
		gallery_end,
		gallery_per_page,
		gallery_title,
		gallery_pagination,
		recentVideos,
		js_skin,
	] );

	const galleryEndOptions = [
		{
			value: '',
			label: __( 'Stop and leave popup window open' ),
		},
		{
			value: 'next',
			label: __( 'Autoplay next video' ),
		},
		{
			value: 'close',
			label: __( 'Close popup window' ),
		},
	];

	return (
		<PanelBody>
			{ galleryAttributes && (
				<VideoGallery attributes={ galleryAttributes } />
			) }
			<div className="videopack-setting-reduced-width">
				<TextControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={ __( 'Maximum popup width:' ) }
					type="number"
					value={ gallery_width }
					onChange={ changeHandlerFactory.gallery_width }
				/>
			</div>
			<div className="videopack-setting-reduced-width">
				<TextControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={ __( 'Videos per row:' ) }
					type="number"
					value={ gallery_columns }
					onChange={ changeHandlerFactory.gallery_columns }
				/>
			</div>
			<ToggleControl
				__nextHasNoMarginBottom
				label={ __( 'Overlay video title on thumbnails.' ) }
				onChange={ changeHandlerFactory.gallery_title }
				checked={ !! gallery_title }
			/>
			<ToggleControl
				__nextHasNoMarginBottom
				label={ __( 'Paginate video galleries' ) }
				onChange={ changeHandlerFactory.gallery_pagination }
				checked={ !! gallery_pagination }
			/>
			{ gallery_pagination && (
				<div className="videopack-setting-auto-width">
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Videos per page' ) }
						type="number"
						value={ gallery_per_page }
						onChange={ changeHandlerFactory.gallery_per_page }
					/>
				</div>
			) }
			<div className="videopack-setting-auto-width">
				<SelectControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={ __( 'When current gallery video finishes:' ) }
					type="url"
					value={ gallery_end }
					onChange={ changeHandlerFactory.gallery_end }
					options={ galleryEndOptions }
				/>
			</div>
		</PanelBody>
	);
};

export default GallerySettings;
