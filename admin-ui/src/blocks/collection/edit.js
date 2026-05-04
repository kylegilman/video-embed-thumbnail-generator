/* global videopack_config */
import {
	InspectorControls,
	useBlockProps,
	InnerBlocks,
} from '@wordpress/block-editor';
import VideopackContextBridge from '../../components/VideopackContextBridge';
import { useSelect } from '@wordpress/data';
import { useEffect, useState, useMemo } from '@wordpress/element';
import { Spinner } from '@wordpress/components';
import { getSettings } from '../../api/settings';
import useVideoQuery from '../../hooks/useVideoQuery';
import CollectionInspectorControls from '../../components/InspectorControls/CollectionInspectorControls';
import useVideopackContext from '../../hooks/useVideopackContext';
import { VideopackProvider } from '../../utils/VideopackContext';
import {
	getGridTemplate,
	getListTemplate,
	getFeedTemplate,
} from '../../utils/templates';
import './editor.scss';

const ALLOWED_BLOCKS = ['videopack/loop', 'videopack/pagination'];

export default function Edit({ attributes, setAttributes, clientId, context }) {
	const [options, setOptions] = useState();
	const {
		layout = 'grid',
		columns = 3,
		currentPage = 1,
		gallery_per_page,
		isEditingAllPages = false,
		variation,
	} = attributes;

	// Resolve Effective Values for design and pagination (these follow global settings)
	const vpContext = useVideopackContext(attributes, context, {
		excludeHoverTrigger: true,
	});
	const {
		resolved: effectiveValues,
		style: contextStyle,
		classes: collectionClasses,
	} = vpContext;

	const { hasPaginationBlock, isNewlyInserted } = useSelect(
		(select) => {
			const { getBlocks, getBlock } = select('core/block-editor');
			const blocks = getBlocks(clientId) || [];
			const block = getBlock(clientId);
			return {
				hasPaginationBlock: blocks.some(
					(b) => b.name === 'videopack/pagination'
				),
				isNewlyInserted:
					block &&
					!block.attributes.gallery_id &&
					!block.attributes.gallery_category &&
					!block.attributes.gallery_tag &&
					!block.attributes.gallery_include,
			};
		},
		[clientId]
	);

	const previewPostId = useSelect(
		(select) => select('core/editor').getCurrentPostId(),
		[]
	);

	const queryParams = useMemo(() => {
		let galleryPerPage = -1;
		if (effectiveValues.isPreview) {
			galleryPerPage = 2;
		} else if (hasPaginationBlock) {
			galleryPerPage =
				gallery_per_page || effectiveValues.gallery_per_page;
		} else if (effectiveValues.enable_collection_video_limit) {
			galleryPerPage =
				effectiveValues.collection_video_limit ||
				effectiveValues.gallery_per_page;
		}

		return {
			...attributes,
			gallery_pagination: hasPaginationBlock,
			gallery_per_page: galleryPerPage,
			page_number: currentPage || 1,
		};
	}, [
		attributes,
		hasPaginationBlock,
		effectiveValues.isPreview,
		effectiveValues.gallery_per_page,
		effectiveValues.enable_collection_video_limit,
		effectiveValues.collection_video_limit,
		gallery_per_page,
		currentPage,
	]);
	// We fetch query data to power the live preview template and pagination info
	const queryData = useVideoQuery(queryParams, previewPostId);

	useEffect(() => {
		getSettings().then((response) => {
			setOptions(response);
		});
	}, []);

	// We no longer hydrate design attributes from options here to avoid bloat.
	// The VideopackContextBridge and useVideopackContext hook handle inheritance
	// dynamically, so we only save attributes that are explicitly changed.

	// Resolve blockGap value for use in internal grid spacing
	const resolvedBlockGap = useMemo(() => {
		const gap = attributes.style?.spacing?.blockGap;
		if (!gap) {
			return undefined;
		}

		// Handle Gutenberg preset variables: var:preset|spacing|X -> var(--wp--preset--spacing--X)
		if (typeof gap === 'string' && gap.startsWith('var:preset|spacing|')) {
			return (
				gap.replace(
					'var:preset|spacing|',
					'var(--wp--preset--spacing--'
				) + ')'
			);
		}

		return gap;
	}, [attributes.style?.spacing?.blockGap]);

	// Dynamic Template based on global settings (only used for new blocks)
	const dynamicTemplate = useMemo(() => {
		if (layout === 'list') {
			return getListTemplate(options);
		}
		// Base block (no variation) defaults to Feed template for grid layout
		if (layout === 'grid' && !variation) {
			return getFeedTemplate(options);
		}
		return getGridTemplate(options);
	}, [layout, variation, options]);

	const blockProps = useBlockProps({
		style: {
			...contextStyle,
			'--videopack-collection-columns': columns,
			'--videopack-collection-gap': resolvedBlockGap,
		},
		className: [
			'videopack-collection',
			'videopack-wrapper',
			`layout-${layout}`,
			`columns-${columns}`,
			// If no explicit align is set, apply the effective (global) align class
			!attributes.align && effectiveValues.align
				? `align${effectiveValues.align}`
				: '',
			effectiveValues.isPreview ? 'is-preview' : '',
			collectionClasses,
		]
			.filter(Boolean)
			.join(' '),
	});

	const videos = useMemo(() => {
		if (queryData.videoResults && queryData.videoResults.length > 0) {
			return queryData.videoResults;
		}

		if (effectiveValues.isPreview) {
			return [
				{
					attachment_id: 10001,
					title: 'Sample Video 1',
					poster_url:
						videopack_config.url +
						'/src/images/Adobestock_469037984_thumb1.jpg',
					url:
						videopack_config.url +
						'/src/images/Adobestock_469037984.mp4',
					player_vars: {
						sources: [
							{
								src:
									videopack_config.url +
									'/src/images/Adobestock_469037984.mp4',
							},
						],
					},
				},
				{
					attachment_id: 10002,
					title: 'Sample Video 2',
					poster_url:
						videopack_config.url +
						'/src/images/Adobestock_287460179_thumb1.jpg',
					url:
						videopack_config.url +
						'/src/images/Adobestock_287460179.mp4',
					player_vars: {
						sources: [
							{
								src:
									videopack_config.url +
									'/src/images/Adobestock_287460179.mp4',
							},
						],
					},
				},
				{
					attachment_id: 10003,
					title: 'Sample Video 3',
					poster_url:
						videopack_config.url +
						'/src/images/Adobestock_469037984_thumb1.jpg',
					url:
						videopack_config.url +
						'/src/images/Adobestock_469037984.mp4',
				},
				{
					attachment_id: 10004,
					title: 'Sample Video 4',
					poster_url:
						videopack_config.url +
						'/src/images/Adobestock_287460179_thumb1.jpg',
					url:
						videopack_config.url +
						'/src/images/Adobestock_287460179.mp4',
				},
				{
					attachment_id: 10005,
					title: 'Sample Video 5',
					poster_url:
						videopack_config.url +
						'/src/images/Adobestock_469037984_thumb1.jpg',
					url:
						videopack_config.url +
						'/src/images/Adobestock_469037984.mp4',
				},
				{
					attachment_id: 10006,
					title: 'Sample Video 6',
					poster_url:
						videopack_config.url +
						'/src/images/Adobestock_287460179_thumb1.jpg',
					url:
						videopack_config.url +
						'/src/images/Adobestock_287460179.mp4',
				},
			];
		}

		return [];
	}, [queryData.videoResults, effectiveValues.isPreview]);

	// The 'videos' array is used for live preview only and should not be persisted
	// to block attributes to avoid bloat. The PHP renderer fetches these dynamically.

	const videopackContextValue = {
		gallery_pagination: hasPaginationBlock,
		gallery_per_page: effectiveValues.gallery_per_page,
		totalPages: queryData.maxNumPages,
		currentPage,
		videos,
	};

	const bridgeOverrides = useMemo(
		() => ({
			'videopack/gallery_pagination': hasPaginationBlock,
			'videopack/totalPages': queryData.maxNumPages,
			'videopack/videos': videos,
		}),
		[hasPaginationBlock, queryData.maxNumPages, videos]
	);

	// If options haven't loaded yet for a newly inserted block, don't render InnerBlocks
	// to prevent the wrong template from being applied.
	// We skip this check for previews to ensure they render immediately.
	if (!options && isNewlyInserted && !effectiveValues.isPreview) {
		return (
			<div
				{...blockProps}
				className={
					(blockProps.className || '') + ' ' + collectionClasses
				}
			>
				<div className="videopack-collection-placeholder">
					<Spinner />
				</div>
			</div>
		);
	}

	return (
		<>
			<InspectorControls>
				<CollectionInspectorControls
					clientId={clientId}
					attributes={attributes}
					setAttributes={setAttributes}
					queryData={queryData}
					options={options}
					hasPaginationBlock={hasPaginationBlock}
					isEditingAllPages={isEditingAllPages}
				/>
			</InspectorControls>

			<div {...blockProps}>
				<VideopackContextBridge
					attributes={attributes}
					context={context}
					overrides={bridgeOverrides}
				>
					<VideopackProvider value={videopackContextValue}>
						<InnerBlocks
							allowedBlocks={ALLOWED_BLOCKS}
							template={dynamicTemplate}
						/>
					</VideopackProvider>
				</VideopackContextBridge>
			</div>
		</>
	);
}
