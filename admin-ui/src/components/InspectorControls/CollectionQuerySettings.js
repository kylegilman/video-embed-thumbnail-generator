import {
	TextControl,
	SelectControl,
	Button,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useMemo } from '@wordpress/element';
import { sortAscending, sortDescending } from '../../assets/icon';
import QuerySettingsPanel from './QuerySettings';

export default function CollectionQuerySettings({
	attributes,
	setAttributes,
	queryData,
	options = {},
	showManualSource = true,
	isSiteEditor = false,
	hasPaginationBlock = true,
}) {
	const {
		gallery_include,
		gallery_orderby,
		gallery_order,
		gallery_per_page,
		enable_collection_video_limit,
		collection_video_limit,
		gallery_pagination,
	} = attributes;

	const baseGalleryOrderbyOptions = useMemo(
		() => [
			{
				value: 'post_date',
				label: __('Date', 'video-embed-thumbnail-generator'),
			},
			{
				value: 'menu_order',
				label: __('Default', 'video-embed-thumbnail-generator'),
			},
			{
				value: 'title',
				label: __('Title', 'video-embed-thumbnail-generator'),
			},
			{
				value: 'rand',
				label: __('Random', 'video-embed-thumbnail-generator'),
			},
			{
				value: 'ID',
				label: __('Video ID', 'video-embed-thumbnail-generator'),
			},
		],
		[]
	);

	const orderbyOptions = useMemo(() => {
		if (gallery_include) {
			return [
				...baseGalleryOrderbyOptions,
				{
					value: 'include',
					label: __(
						'Manually Sorted',
						'video-embed-thumbnail-generator'
					),
				},
			];
		}
		return baseGalleryOrderbyOptions;
	}, [gallery_include, baseGalleryOrderbyOptions]);

	const updateNumericAttribute = (name, value) => {
		const parsedValue = parseInt(value, 10);
		setAttributes({ [name]: isNaN(parsedValue) ? undefined : parsedValue });
	};

	return (
		<>
			<QuerySettingsPanel
				attributes={attributes}
				setAttributes={setAttributes}
				queryData={queryData}
				showArchiveSource={isSiteEditor}
				showManualSource={showManualSource}
			/>

			<div className="videopack-sort-control-wrapper">
				<SelectControl
					label={__('Sort by', 'video-embed-thumbnail-generator')}
					value={gallery_orderby}
					onChange={(val) => setAttributes({ gallery_orderby: val })}
					options={orderbyOptions}
				/>
				<Button
					icon={gallery_order === 'asc' ? sortAscending : sortDescending}
					label={
						gallery_order === 'asc'
							? __('Ascending', 'video-embed-thumbnail-generator')
							: __('Descending', 'video-embed-thumbnail-generator')
					}
					onClick={() =>
						setAttributes({
							gallery_order: gallery_order === 'asc' ? 'desc' : 'asc',
						})
					}
					showTooltip
				/>
			</div>

			{(!!gallery_pagination || !!hasPaginationBlock) ? (
				<TextControl
					label={__(
						'Number of videos per page',
						'video-embed-thumbnail-generator'
					)}
					type="number"
					value={gallery_per_page ?? ''}
					placeholder={options.gallery_per_page}
					onChange={(val) =>
						updateNumericAttribute('gallery_per_page', val)
					}
				/>
			) : (
				<>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'Limit number of videos',
							'video-embed-thumbnail-generator'
						)}
						checked={!!enable_collection_video_limit}
						onChange={(val) => {
							const updates = {
								enable_collection_video_limit: val,
							};
							if (!val) {
								updates.collection_video_limit = -1;
							} else if (
								Number(collection_video_limit) === -1
							) {
								updates.collection_video_limit = 12;
							}
							setAttributes(updates);
						}}
					/>
					{!!enable_collection_video_limit && (
						<TextControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={__(
								'Video Limit',
								'video-embed-thumbnail-generator'
							)}
							help={__(
								'Maximum number of videos to show when pagination is disabled.',
								'video-embed-thumbnail-generator'
							)}
							type="number"
							value={
								Number(collection_video_limit) === -1
									? 12
									: (collection_video_limit ?? '')
							}
							onChange={(val) =>
								updateNumericAttribute(
									'collection_video_limit',
									val
								)
							}
						/>
					)}
				</>
			)}

			{!hasPaginationBlock && (
				<ToggleControl
					__nextHasNoMarginBottom
					label={__(
						'Enable Pagination',
						'video-embed-thumbnail-generator'
					)}
					checked={!!gallery_pagination}
					onChange={(val) =>
						setAttributes({ gallery_pagination: val })
					}
				/>
			)}
		</>
	);
}
