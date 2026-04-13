import { InspectorControls, useBlockProps, InnerBlocks, BlockContextProvider } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { useEffect, useState, useMemo } from '@wordpress/element';
import { PanelBody, SelectControl, RangeControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getSettings } from '../../api/settings';
import useVideoQuery from '../../hooks/useVideoQuery';
import CollectionSettingsPanel from '../../components/InspectorControls/CollectionSettingsPanel';
import './editor.scss';

const ALLOWED_BLOCKS = [ 'videopack/video-loop', 'videopack/pagination' ];
const TEMPLATE = [
	[
		'videopack/video-loop',
		{},
		[
			[
				'videopack/thumbnail',
				{ linkTo: 'lightbox' },
				[
					[ 'videopack/play-button', {} ],
					[ 'videopack/video-duration', {} ],
				],
			],
			[ 'videopack/video-title', {} ],
			[ 'videopack/view-count', {} ],
		],
	],
	[ 'videopack/pagination', {} ],
];

export default function Edit( { attributes, setAttributes, clientId } ) {
	const [ options, setOptions ] = useState();
	const {
		skin,
		layout = 'grid',
		columns = 3,
		currentPage = 1,
		title_color,
		title_background_color,
		play_button_color,
		play_button_icon_color,
		control_bar_bg_color,
		control_bar_color,
		gallery_pagination,
		gallery_per_page,
		totalPages,
	} = attributes;

	const previewPostId = useSelect( ( select ) => select( 'core/editor' ).getCurrentPostId(), [] );

	// We fetch query data to power the live preview template and pagination info
	const queryData = useVideoQuery( {
		...attributes,
		gallery_per_page: gallery_per_page || 12,
		page_number: currentPage || 1,
	}, previewPostId );

	const hasPaginationBlock = useSelect(
		( select ) => {
			const { getBlocks } = select( 'core/block-editor' );
			const blocks = getBlocks( clientId ) || [];
			return blocks.some( ( block ) => block.name === 'videopack/pagination' );
		},
		[ clientId ]
	);

	// Determine "effective" values by merging attributes with global options
	const effectiveValues = useMemo( () => {
		const values = { ...options, ...attributes };
		return {
			...values,
			skin: values.skin || 'vjs-theme-videopack',
			layout: values.layout || 'grid',
			columns: values.columns || 3,
		};
	}, [ options, attributes ] );

	useEffect( () => {
		if ( hasPaginationBlock !== !!gallery_pagination ) {
			setAttributes( { gallery_pagination: hasPaginationBlock } );
		}
	}, [ hasPaginationBlock, gallery_pagination, setAttributes ] );

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

	useEffect( () => {
		if ( options ) {
			const newAttributes = {};
			const settingsToSync = [
				'gallery_order',
				'gallery_orderby',
				'gallery_pagination',
				'gallery_per_page',
				'skin',
				'title_color',
				'title_background_color',
				'play_button_color',
				'play_button_icon_color',
				'control_bar_bg_color',
				'control_bar_color',
			];

			settingsToSync.forEach( ( setting ) => {
				if (
					attributes[ setting ] === undefined &&
					options[ setting ] !== undefined
				) {
					newAttributes[ setting ] = options[ setting ];
				}
			} );

			if ( Object.keys( newAttributes ).length > 0 ) {
				setAttributes( newAttributes );
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ options ] );

	const blockProps = useBlockProps( {
		className: [
			'videopack-collection',
			'videopack-wrapper',
			`layout-${ layout }`,
			`columns-${ columns }`,
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
		},
	} );

	return (
		<>
			<InspectorControls>
				<CollectionSettingsPanel
					attributes={ attributes }
					setAttributes={ setAttributes }
					queryData={ queryData }
					options={ options }
					showGalleryOptions={ true }
					showPaginationToggle={ false }
					showLayoutSettings={ false }
					showPaginationSettings={ false }
				/>

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
					<SelectControl
						label={ __( 'Player Skin', 'video-embed-thumbnail-generator' ) }
						value={ effectiveValues.skin }
						options={ [
							{ label: __( 'Videopack', 'video-embed-thumbnail-generator' ), value: 'vjs-theme-videopack' },
							{ label: __( 'Videopack Classic', 'video-embed-thumbnail-generator' ), value: 'kg-video-js-skin' },
							{ label: __( 'Video.js default', 'video-embed-thumbnail-generator' ), value: 'default' },
							{ label: __( 'City', 'video-embed-thumbnail-generator' ), value: 'vjs-theme-city' },
							{ label: __( 'Fantasy', 'video-embed-thumbnail-generator' ), value: 'vjs-theme-fantasy' },
							{ label: __( 'Forest', 'video-embed-thumbnail-generator' ), value: 'vjs-theme-forest' },
							{ label: __( 'Sea', 'video-embed-thumbnail-generator' ), value: 'vjs-theme-sea' },
						] }
						onChange={ ( value ) => setAttributes( { skin: value } ) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<BlockContextProvider
					value={ {
						'videopack/skin': effectiveValues.skin,
						'videopack/layout': layout,
						'videopack/columns': columns,
						'videopack/gallery_source': attributes.gallery_source,
						'videopack/gallery_id': attributes.gallery_id,
						'videopack/gallery_category': attributes.gallery_category,
						'videopack/gallery_tag': attributes.gallery_tag,
						'videopack/gallery_orderby': effectiveValues.gallery_orderby,
						'videopack/gallery_order': effectiveValues.gallery_order,
						'videopack/gallery_include': attributes.gallery_include,
						'videopack/gallery_exclude': attributes.gallery_exclude,
						'videopack/gallery_pagination': effectiveValues.gallery_pagination,
						'videopack/gallery_per_page': effectiveValues.gallery_per_page,
						'videopack/currentPage': currentPage,
						'videopack/totalPages': totalPages,
						'videopack/pagination_color': effectiveValues.pagination_color,
						'videopack/pagination_background_color': effectiveValues.pagination_background_color,
						'videopack/pagination_active_bg_color': effectiveValues.pagination_active_bg_color,
						'videopack/pagination_active_color': effectiveValues.pagination_active_color,
						'videopack/title_color': effectiveValues.title_color,
						'videopack/title_background_color': effectiveValues.title_background_color,
						'videopack/play_button_color': effectiveValues.play_button_color,
						'videopack/play_button_icon_color': effectiveValues.play_button_icon_color,
						'videopack/control_bar_bg_color': effectiveValues.control_bar_bg_color,
						'videopack/control_bar_color': effectiveValues.control_bar_color,
					} }
				>
					<InnerBlocks
						allowedBlocks={ ALLOWED_BLOCKS }
						template={ TEMPLATE }
					/>
				</BlockContextProvider>
			</div>
		</>
	);
}
