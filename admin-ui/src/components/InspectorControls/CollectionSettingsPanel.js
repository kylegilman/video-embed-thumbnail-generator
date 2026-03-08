import {
	TextControl,
	SelectControl,
	ToggleControl,
	PanelBody,
	Button,
	Icon,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { close } from '@wordpress/icons';
import { decodeEntities } from '@wordpress/html-entities';
import { sortAscending, sortDescending } from '../../assets/icon';
import QuerySettingsPanel from './QuerySettings';

export default function CollectionSettingsPanel({
	attributes,
	setAttributes,
	queryData,
	showGalleryOptions = false,
}) {
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
		collection_video_limit,
		enable_collection_video_limit,
	} = attributes;

	const { excludedVideos } = queryData;

	const baseGalleryOrderbyOptions = [
		{
			value: 'menu_order',
			label: __('Default', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'title',
			label: __('Title', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'post_date',
			label: __('Date', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'rand',
			label: __('Random', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'ID',
			label: __('Video ID', 'video-embed-thumbnail-generator'),
		},
	];

	const filteredGalleryOrderbyOptions = gallery_include
		? [
				...baseGalleryOrderbyOptions,
				{
					value: 'include',
					label: __(
						'Manually Sorted',
						'video-embed-thumbnail-generator'
					),
				},
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

	const handleUnexcludeItem = (idToRestore) => {
		const currentExclude = gallery_exclude
			? gallery_exclude.split(',').map((id) => parseInt(id.trim(), 10))
			: [];
		const newGalleryExclude = currentExclude
			.filter((id) => id !== idToRestore)
			.join(',');

		let newGalleryInclude = gallery_include;
		if (gallery_include) {
			const currentInclude = gallery_include
				.split(',')
				.map((id) => parseInt(id.trim(), 10));
			if (!currentInclude.includes(idToRestore)) {
				currentInclude.push(idToRestore);
				newGalleryInclude = currentInclude.join(',');
			}
		}

		setAttributes({
			gallery_exclude: newGalleryExclude,
			gallery_include: newGalleryInclude,
		});
	};

	return (
		<PanelBody
			title={
				showGalleryOptions
					? __('Gallery Settings', 'video-embed-thumbnail-generator')
					: __('List Settings', 'video-embed-thumbnail-generator')
			}
		>
			<QuerySettingsPanel
				attributes={attributes}
				setAttributes={setAttributes}
				queryData={queryData}
			/>
			<div className="videopack-sort-control-wrapper">
				<SelectControl
					label={__('Sort by', 'video-embed-thumbnail-generator')}
					value={gallery_orderby}
					onChange={attributeChangeFactory('gallery_orderby')}
					options={filteredGalleryOrderbyOptions}
				/>
				<Button
					icon={
						gallery_order === 'ASC' ? sortAscending : sortDescending
					}
					label={
						gallery_order === 'ASC'
							? __('Ascending', 'video-embed-thumbnail-generator')
							: __(
									'Descending',
									'video-embed-thumbnail-generator'
								)
					}
					onClick={() =>
						setAttributes({
							gallery_order:
								gallery_order === 'ASC' ? 'DESC' : 'ASC',
						})
					}
					showTooltip
				/>
			</div>
			<ToggleControl
				__nextHasNoMarginBottom
				label={__('Paginate', 'video-embed-thumbnail-generator')}
				checked={!!gallery_pagination}
				onChange={attributeChangeFactory('gallery_pagination')}
			/>
			{gallery_pagination && (
				<TextControl
					label={__(
						'Number of videos per page',
						'video-embed-thumbnail-generator'
					)}
					type="number"
					value={gallery_per_page}
					onChange={attributeChangeFactory('gallery_per_page', true)}
				/>
			)}
			{!gallery_pagination && (
				<>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'Limit number of videos',
							'video-embed-thumbnail-generator'
						)}
						checked={!!enable_collection_video_limit}
						onChange={(val) => {
							setAttributes({
								enable_collection_video_limit: val,
							});
							if (!val) {
								setAttributes({ collection_video_limit: -1 });
							} else if (Number(collection_video_limit) === -1) {
								setAttributes({ collection_video_limit: 12 });
							}
						}}
					/>
					{!!enable_collection_video_limit && (
						<TextControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={__(
								'Video Limit:',
								'video-embed-thumbnail-generator'
							)}
							type="number"
							value={
								Number(collection_video_limit) === -1
									? 12
									: collection_video_limit
							}
							onChange={attributeChangeFactory(
								'collection_video_limit',
								true
							)}
						/>
					)}
				</>
			)}
			{showGalleryOptions && (
				<>
					<TextControl
						label={__('Columns', 'video-embed-thumbnail-generator')}
						type="number"
						value={gallery_columns}
						onChange={attributeChangeFactory(
							'gallery_columns',
							true
						)}
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'Overlay video title on thumbnails',
							'video-embed-thumbnail-generator'
						)}
						onChange={attributeChangeFactory('gallery_title')}
						checked={!!gallery_title}
					/>
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__(
							'When gallery video finishes',
							'video-embed-thumbnail-generator'
						)}
						value={gallery_end}
						onChange={attributeChangeFactory('gallery_end')}
						options={[
							{
								label: __(
									'Stop and leave popup window open',
									'video-embed-thumbnail-generator'
								),
								value: '',
							},
							{
								label: __(
									'Autoplay next video',
									'video-embed-thumbnail-generator'
								),
								value: 'next',
							},
							{
								label: __(
									'Close popup window',
									'video-embed-thumbnail-generator'
								),
								value: 'close',
							},
						]}
					/>
				</>
			)}
			{excludedVideos && excludedVideos.length > 0 && (
				<div className="videopack-excluded-videos">
					<p>
						{__(
							'Excluded Videos',
							'video-embed-thumbnail-generator'
						)}
					</p>
					<div className="videopack-excluded-list">
						{excludedVideos.map((video) => (
							<div
								key={video.id}
								className="videopack-excluded-item"
							>
								<div className="videopack-excluded-thumbnail">
									{video.meta?.['_videopack-meta']?.poster ? (
										<img
											src={
												video.meta['_videopack-meta']
													.poster
											}
											alt={decodeEntities(
												video.title.rendered
											)}
										/>
									) : (
										<Icon icon="format-video" />
									)}
								</div>
								<span className="videopack-excluded-title">
									{decodeEntities(video.title.rendered)}
								</span>
								<Button
									icon={close}
									onClick={() =>
										handleUnexcludeItem(video.id)
									}
									label={__(
										'Restore',
										'video-embed-thumbnail-generator'
									)}
									className="videopack-restore-item"
									showTooltip
								/>
							</div>
						))}
					</div>
				</div>
			)}
		</PanelBody>
	);
}
