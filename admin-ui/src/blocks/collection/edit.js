import { InspectorControls, useBlockProps, InnerBlocks, BlockContextProvider } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { useEffect, useState, useMemo } from '@wordpress/element';
import { PanelBody, SelectControl, RangeControl, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getSettings } from '../../api/settings';
import useVideoQuery from '../../hooks/useVideoQuery';
import CollectionSettingsPanel from '../../components/InspectorControls/CollectionSettingsPanel';
import { getEffectiveValue } from '../../utils/context';
import './editor.scss';

const ALLOWED_BLOCKS = [ 'videopack/video-loop', 'videopack/pagination' ];

// Default Template structure components
const getGalleryTemplate = ( options ) => {
	const loopChildren = [
		[
			'videopack/thumbnail',
			{ linkTo: 'lightbox' },
			[
				[ 'videopack/play-button', {} ],
				options?.overlay_title !== false ? [ 'videopack/video-title', {} ] : null,
			].filter( Boolean ),
		],
	];

	const template = [ [ 'videopack/video-loop', {}, loopChildren ] ];

	if ( options?.gallery_pagination ) {
		template.push( [ 'videopack/pagination', {} ] );
	}
	return template;
};

const getListTemplate = ( options ) => {
	const showTitleBar = !! (
		options?.overlay_title ||
		options?.downloadlink ||
		options?.embedcode
	);

	const engineChildren = [];
	if ( showTitleBar ) {
		engineChildren.push( [ 'videopack/video-title', {} ] );
	}
	if ( options?.watermark ) {
		engineChildren.push( [ 'videopack/video-watermark', {} ] );
	}

	const videoChildren = [
		[
			'videopack/video-player-engine',
			{ lock: { remove: true, move: false } },
			engineChildren,
		],
	];

	if ( options?.views ) {
		videoChildren.push( [ 'videopack/view-count', {} ] );
	}

	const loopChildren = [ [ 'videopack/videopack-video', {}, videoChildren ] ];

	const template = [ [ 'videopack/video-loop', {}, loopChildren ] ];

	if ( options?.gallery_pagination ) {
		template.push( [ 'videopack/pagination', {} ] );
	}

	return template;
};

export default function Edit( { attributes, setAttributes, clientId, context } ) {
	const [ options, setOptions ] = useState();
	const {
		layout = 'grid',
		columns = 3,
		currentPage = 1,
		totalPages,
	} = attributes;

	// Resolve Effective Values for design and pagination (these follow global settings)
	const effectiveValues = useMemo( () => {
		const keys = [
			'skin',
			'align',
			'gallery_pagination',
			'gallery_per_page',
			'enable_collection_video_limit',
			'collection_video_limit',
			'title_color',
			'title_background_color',
			'play_button_color',
			'play_button_icon_color',
			'control_bar_bg_color',
			'control_bar_color',
			'views',
			'overlay_title'
		];
		
		const resolved = {};
		keys.forEach( key => {
			resolved[key] = getEffectiveValue(key, attributes, context);
		});
		
		return resolved;
	}, [ attributes, context ] );

	const previewPostId = useSelect( ( select ) => select( 'core/editor' ).getCurrentPostId(), [] );

	// We fetch query data to power the live preview template and pagination info
	const queryData = useVideoQuery( {
		...attributes,
		gallery_pagination: effectiveValues.gallery_pagination,
		gallery_per_page: effectiveValues.gallery_pagination ? ( effectiveValues.gallery_per_page || 12 ) : ( effectiveValues.enable_collection_video_limit ? ( effectiveValues.collection_video_limit || 12 ) : -1 ),
		page_number: currentPage || 1,
	}, previewPostId );

	const { hasPaginationBlock, isNewlyInserted } = useSelect(
		( select ) => {
			const { getBlocks, getBlock } = select( 'core/block-editor' );
			const blocks = getBlocks( clientId ) || [];
			const block = getBlock( clientId );
			return {
				hasPaginationBlock: blocks.some( ( b ) => b.name === 'videopack/pagination' ),
				isNewlyInserted: blocks.length === 0 && block && block.isValid,
			};
		},
		[ clientId ]
	);

	// Sync local gallery_pagination attribute with presence of pagination block
	useEffect( () => {
		if ( hasPaginationBlock !== !!attributes.gallery_pagination ) {
			setAttributes( { gallery_pagination: hasPaginationBlock } );
		}
	}, [ hasPaginationBlock, attributes.gallery_pagination, setAttributes ] );

	useEffect( () => {
		if (
			queryData.maxNumPages !== undefined &&
			queryData.maxNumPages !== totalPages
		) {
			setAttributes( { totalPages: queryData.maxNumPages } );
		}
	}, [ queryData.maxNumPages, totalPages, setAttributes ] );


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
		return getGalleryTemplate( options );
	}, [ layout, options ] );

	const blockProps = useBlockProps( {
		className: [
			'videopack-collection',
			'videopack-wrapper',
			`layout-${ layout }`,
			`columns-${ columns }`,
			// If no explicit align is set, apply the effective (global) align class
			! attributes.align && effectiveValues.align ? `align${ effectiveValues.align }` : '',
			effectiveValues.title_color ? 'videopack-has-title-color' : '',
			effectiveValues.title_background_color ? 'videopack-has-title-background-color' : '',
			effectiveValues.play_button_color ? 'videopack-has-play-button-color' : '',
			effectiveValues.play_button_icon_color ? 'videopack-has-play-button-icon-color' : '',
			effectiveValues.control_bar_bg_color ? 'videopack-has-control-bar-bg-color' : '',
			effectiveValues.control_bar_color ? 'videopack-has-control-bar-color' : '',
		].filter( Boolean ).join( ' ' ),
		style: {
			'--videopack-title-color': effectiveValues.title_color,
			'--videopack-title-background-color': effectiveValues.title_background_color,
			'--videopack-play-button-color': effectiveValues.play_button_color,
			'--videopack-play-button-icon-color': effectiveValues.play_button_icon_color,
			'--videopack-control-bar-bg-color': effectiveValues.control_bar_bg_color,
			'--videopack-control-bar-color': effectiveValues.control_bar_color,
			'--videopack-collection-columns': columns,
			'--videopack-collection-gap': resolvedBlockGap,
		},
	} );

	// If options haven't loaded yet for a newly inserted block, don't render InnerBlocks 
	// to prevent the wrong template from being applied.
	if ( ! options && isNewlyInserted ) {
		return (
			<div { ...blockProps }>
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
					value={ {
						...context,
						'videopack/layout': layout,
						'videopack/columns': columns,
						'videopack/skin': effectiveValues.skin,
						'videopack/gallery_pagination': effectiveValues.gallery_pagination,
						'videopack/gallery_per_page': effectiveValues.gallery_per_page,
						'videopack/enable_collection_video_limit': effectiveValues.enable_collection_video_limit,
						'videopack/collection_video_limit': effectiveValues.collection_video_limit,
						'videopack/title_color': effectiveValues.title_color,
						'videopack/title_background_color': effectiveValues.title_background_color,
						'videopack/play_button_color': effectiveValues.play_button_color,
						'videopack/play_button_icon_color': effectiveValues.play_button_icon_color,
						'videopack/control_bar_bg_color': effectiveValues.control_bar_bg_color,
						'videopack/control_bar_color': effectiveValues.control_bar_color,
						'videopack/views': effectiveValues.views,
						'videopack/overlay_title': effectiveValues.overlay_title,
						'videopack/totalPages': queryData.maxNumPages,
					} }
				>
					<InnerBlocks
						allowedBlocks={ ALLOWED_BLOCKS }
						template={ dynamicTemplate }
					/>
				</BlockContextProvider>
			</div>
		</>
	);
}
