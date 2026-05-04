import { useSelect } from '@wordpress/data';
import {
	PanelBody,
	SelectControl,
	RangeControl,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import CollectionSettingsPanel from './CollectionSettingsPanel';

/**
 * Shared Inspector controls for Videopack collections.
 * Used by both the Collection parent block and the Video Loop child block.
 *
 * @param {Object}   root0                    Component props.
 * @param {string}   root0.clientId           Block client ID.
 * @param {Object}   root0.attributes         Block attributes.
 * @param {Function} root0.setAttributes      Attribute setter.
 * @param {Object}   root0.queryData          Query data.
 * @param {Object}   root0.options            Global options.
 * @param {boolean}  root0.hasPaginationBlock Whether the block has pagination.
 * @param {boolean}  root0.isEditingAllPages  Whether all pages are being edited.
 */
export default function CollectionInspectorControls({
	clientId, // The collection block's clientId
	attributes,
	setAttributes,
	queryData,
	options,
	hasPaginationBlock,
	isEditingAllPages,
}) {
	const { layout = 'grid', columns = 3 } = attributes;

	const {
		showPaginationSettings,
		showTitleSettings,
		showPlayerSettings,
		showSkinSettings,
	} = useSelect(
		(select) => {
			const { getBlocks } = select('core/block-editor');
			const blocks = getBlocks(clientId) || [];

			const findBlockRecursive = (blockList, name) => {
				for (const block of blockList) {
					if (block.name === name) {
						return block;
					}
					if (block.innerBlocks && block.innerBlocks.length > 0) {
						const found = findBlockRecursive(
							block.innerBlocks,
							name
						);
						if (found) {
							return found;
						}
					}
				}
				return null;
			};

			const hasPagination = blocks.some(
				(b) => b.name === 'videopack/pagination'
			);
			const thumbnailBlock = findBlockRecursive(
				blocks,
				'videopack/thumbnail'
			);
			const isLightbox =
				thumbnailBlock?.attributes?.linkTo === 'lightbox';

			// Check if specific blocks are INSIDE the thumbnail block
			const hasOverlayBlockInsideThumbnail =
				thumbnailBlock?.innerBlocks?.some((b) =>
					[
						'videopack/title',
						'videopack/duration',
						'videopack/view-count',
					].includes(b.name)
				) || false;

			const canShowTitle = isLightbox || hasOverlayBlockInsideThumbnail;
			const canShowPlayer = isLightbox;
			const canShowPagination = hasPagination;

			return {
				showPaginationSettings: canShowPagination,
				showTitleSettings: canShowTitle,
				showPlayerSettings: canShowPlayer,
				showSkinSettings:
					canShowTitle || canShowPlayer || canShowPagination,
			};
		},
		[clientId]
	);

	return (
		<>
			<PanelBody
				title={__('Layout Settings', 'video-embed-thumbnail-generator')}
			>
				{attributes.gallery_source === 'manual' &&
					hasPaginationBlock && (
						<ToggleControl
							label={__(
								'Edit All Pages',
								'video-embed-thumbnail-generator'
							)}
							help={__(
								'Show all videos in the collection at once for easier reordering.',
								'video-embed-thumbnail-generator'
							)}
							checked={isEditingAllPages}
							onChange={(value) =>
								setAttributes({ isEditingAllPages: value })
							}
							__nextHasNoMarginBottom
						/>
					)}
				<SelectControl
					label={__('Layout', 'video-embed-thumbnail-generator')}
					value={layout}
					options={[
						{
							label: __(
								'Grid',
								'video-embed-thumbnail-generator'
							),
							value: 'grid',
						},
						{
							label: __(
								'List',
								'video-embed-thumbnail-generator'
							),
							value: 'list',
						},
					]}
					onChange={(value) => setAttributes({ layout: value })}
				/>
				{layout === 'grid' && (
					<RangeControl
						label={__('Columns', 'video-embed-thumbnail-generator')}
						value={columns}
						onChange={(value) => setAttributes({ columns: value })}
						min={1}
						max={6}
					/>
				)}
			</PanelBody>
			<CollectionSettingsPanel
				attributes={attributes}
				setAttributes={setAttributes}
				queryData={queryData}
				options={options}
				showGalleryOptions={true}
				showPaginationToggle={false}
				showLayoutSettings={false}
				showPaginationSettings={showPaginationSettings}
				showTitleSettings={showTitleSettings}
				showPlayerSettings={showPlayerSettings}
				showSkinSettings={showSkinSettings}
				hasPaginationBlock={hasPaginationBlock}
			/>
		</>
	);
}
