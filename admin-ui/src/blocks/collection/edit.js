import { InspectorControls, useBlockProps, InnerBlocks, BlockContextProvider } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { useEffect, useState, useMemo } from '@wordpress/element';
import { PanelBody, SelectControl, RangeControl, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getSettings } from '../../api/settings';
import useVideoQuery from '../../hooks/useVideoQuery';
import CollectionSettingsPanel from '../../components/InspectorControls/CollectionSettingsPanel';
import useVideopackContext from '../../hooks/useVideopackContext';
import { VideopackProvider } from '../../utils/VideopackContext';
import { getGridTemplate, getListTemplate } from '../../utils/templates';
import './editor.scss';

const ALLOWED_BLOCKS = [ 'videopack/video-loop', 'videopack/pagination' ];


export default function Edit( { attributes, setAttributes, clientId, context } ) {
	const [ options, setOptions ] = useState();
	const {
		layout = 'grid',
		columns = 3,
		currentPage = 1,
	} = attributes;

	// Resolve Effective Values for design and pagination (these follow global settings)
	const { resolved: effectiveValues, style: contextStyle, classes: collectionClasses } = useVideopackContext(attributes, context);

	const { hasPaginationBlock, isNewlyInserted } = useSelect(
		( select ) => {
			const { getBlocks, getBlock } = select( 'core/block-editor' );
			const blocks = getBlocks( clientId ) || [];
			const block = getBlock( clientId );
			return {
				hasPaginationBlock: blocks.some( ( b ) => b.name === 'videopack/pagination' ),
				isNewlyInserted: block && ! block.attributes.gallery_id && ! block.attributes.gallery_category && ! block.attributes.gallery_tag && ! block.attributes.gallery_include,
			};
		},
		[ clientId ]
	);

	const previewPostId = useSelect( ( select ) => select( 'core/editor' ).getCurrentPostId(), [] );

	const queryParams = {
		...attributes,
		gallery_pagination: hasPaginationBlock,
		gallery_per_page: hasPaginationBlock 
			? ( effectiveValues.gallery_per_page || 6 ) 
			: ( effectiveValues.enable_collection_video_limit ? ( effectiveValues.collection_video_limit || 6 ) : -1 ),
		page_number: currentPage || 1,
	};
	// We fetch query data to power the live preview template and pagination info
	const queryData = useVideoQuery( queryParams, previewPostId );

	useEffect( () => {
		getSettings().then( ( response ) => {
			setOptions( response );
		} );
	}, [] );

	// Resolve blockGap value for use in internal grid spacing
	const resolvedBlockGap = useMemo(() => {
		const gap = attributes.style?.spacing?.blockGap;
		if ( ! gap ) return undefined;
		
		// Handle Gutenberg preset variables: var:preset|spacing|X -> var(--wp--preset--spacing--X)
		if ( typeof gap === 'string' && gap.startsWith( 'var:preset|spacing|' ) ) {
			return gap.replace( 'var:preset|spacing|', 'var(--wp--preset--spacing--' ) + ')';
		}
		
		return gap;
	}, [ attributes.style?.spacing?.blockGap ] );

	// Dynamic Template based on global settings (only used for new blocks)
	const dynamicTemplate = useMemo( () => {
		if ( layout === 'list' ) {
			return getListTemplate( options );
		}
		return getGridTemplate( options );
	}, [ layout, options ] );

	const blockProps = useBlockProps( {
		style: {
			...contextStyle,
			'--videopack-collection-columns': columns,
			'--videopack-collection-gap': resolvedBlockGap,
		},
		className: [
			'videopack-collection',
			'videopack-wrapper',
			`layout-${ layout }`,
			`columns-${ columns }`,
			// If no explicit align is set, apply the effective (global) align class
			! attributes.align && effectiveValues.align ? `align${ effectiveValues.align }` : '',
			collectionClasses,
		].filter( Boolean ).join( ' ' ),
	} );

	const videopackContextValue = {
		gallery_pagination: hasPaginationBlock,
		gallery_per_page: effectiveValues.gallery_per_page,
		totalPages: queryData.maxNumPages,
		currentPage: currentPage,
	};

	const providedContext = {
		...context,
		'videopack/layout': layout,
		'videopack/columns': columns,
		'videopack/skin': effectiveValues.skin,
		'videopack/gallery_source': attributes.gallery_source,
		'videopack/gallery_id': attributes.gallery_id,
		'videopack/gallery_category': attributes.gallery_category,
		'videopack/gallery_tag': attributes.gallery_tag,
		'videopack/gallery_orderby': attributes.gallery_orderby,
		'videopack/gallery_order': attributes.gallery_order,
		'videopack/gallery_include': attributes.gallery_include,
		'videopack/gallery_exclude': attributes.gallery_exclude,
		'videopack/gallery_pagination': hasPaginationBlock,
		'videopack/gallery_per_page': effectiveValues.gallery_per_page,
		'videopack/enable_collection_video_limit': effectiveValues.enable_collection_video_limit,
		'videopack/collection_video_limit': effectiveValues.collection_video_limit,
		'videopack/title_color': effectiveValues.title_color,
		'videopack/title_background_color': effectiveValues.title_background_color,
		'videopack/play_button_color': effectiveValues.play_button_color,
		'videopack/play_button_secondary_color': effectiveValues.play_button_secondary_color,
		'videopack/control_bar_bg_color': effectiveValues.control_bar_bg_color,
		'videopack/control_bar_color': effectiveValues.control_bar_color,
		'videopack/views': effectiveValues.views,
		'videopack/overlay_title': effectiveValues.overlay_title,
		'videopack/totalPages': queryData.maxNumPages,
	};

	// If options haven't loaded yet for a newly inserted block, don't render InnerBlocks 
	// to prevent the wrong template from being applied.
	if ( ! options && isNewlyInserted ) {
		return (
			<div { ...blockProps } className={ ( blockProps.className || '' ) + ' ' + collectionClasses }>
				<div className="videopack-collection-placeholder">
					<Spinner />
				</div>
			</div>
		);
	}

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Layout Settings', 'video-embed-thumbnail-generator' ) }>
					<SelectControl
						label={ __( 'Layout', 'video-embed-thumbnail-generator' ) }
						value={ layout }
						options={ [
							{ label: __( 'Grid', 'video-embed-thumbnail-generator' ), value: 'grid' },
							{ label: __( 'List', 'video-embed-thumbnail-generator' ), value: 'list' },
						] }
						onChange={ ( value ) => setAttributes( { layout: value } ) }
					/>
					{ layout === 'grid' && (
						<RangeControl
							label={ __( 'Columns', 'video-embed-thumbnail-generator' ) }
							value={ columns }
							onChange={ ( value ) => setAttributes( { columns: value } ) }
							min={ 1 }
							max={ 6 }
						/>
					) }
				</PanelBody>
				<CollectionSettingsPanel
					attributes={ attributes }
					setAttributes={ setAttributes }
					queryData={ queryData }
					options={ options }
					showGalleryOptions={ true }
					showPaginationToggle={ false }
					showLayoutSettings={ false }
					showPaginationSettings={ true }
					hasPaginationBlock={ hasPaginationBlock }
				/>
			</InspectorControls>

			<div { ...blockProps }>
				<BlockContextProvider
					value={ providedContext }
				>
					<VideopackProvider value={ videopackContextValue }>
						<InnerBlocks
							allowedBlocks={ ALLOWED_BLOCKS }
							template={ dynamicTemplate }
						/>
					</VideopackProvider>
				</BlockContextProvider>
			</div>
		</>
	);
}
