import {
	TextControl,
	SelectControl,
	ToggleControl,
	PanelBody,
	Button,
	Icon,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useMemo } from '@wordpress/element';
import { close } from '@wordpress/icons';
import { decodeEntities } from '@wordpress/html-entities';
import { sortAscending, sortDescending } from '../../assets/icon';
import CompactColorPicker from '../CompactColorPicker/CompactColorPicker';
import { getColorFallbacks } from '../../utils/colors';
import QuerySettingsPanel from './QuerySettings';
import './CollectionSettingsPanel.scss';

/* global videopack_config */

export default function CollectionSettingsPanel({
	attributes,
	setAttributes,
	queryData,
	options = {},
	showGalleryOptions = false,
	isSiteEditor = false,
	blockType = 'gallery', // 'gallery', 'grid', or 'list'
	showManualSource = true,
}) {
	const displayAttributes = useMemo(
		() => ({ ...options, ...attributes }),
		[options, attributes]
	);

	const colorFallbacks = useMemo(
		() => getColorFallbacks(displayAttributes),
		[displayAttributes]
	);

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
		play_button_color,
		play_button_icon_color,
		control_bar_bg_color,
		control_bar_color,
		title_color,
		title_background_color,
		pagination_color,
		pagination_background_color,
		pagination_active_bg_color,
		pagination_active_color,
	} = attributes;

	const { excludedVideos } = queryData;
	const THEME_COLORS = videopack_config?.themeColors || options?.themeColors;
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
		<>
			<PanelBody
				title={
					showGalleryOptions
						? __(
								'Gallery Settings',
								'video-embed-thumbnail-generator'
							)
						: __('List Settings', 'video-embed-thumbnail-generator')
				}
			>
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
						onChange={attributeChangeFactory('gallery_orderby')}
						options={filteredGalleryOrderbyOptions}
					/>
					<Button
						icon={
							gallery_order === 'asc'
								? sortAscending
								: sortDescending
						}
						label={
							gallery_order === 'asc'
								? __(
										'Ascending',
										'video-embed-thumbnail-generator'
									)
								: __(
										'Descending',
										'video-embed-thumbnail-generator'
									)
						}
						onClick={() =>
							setAttributes({
								gallery_order:
									gallery_order === 'asc' ? 'desc' : 'asc',
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
						value={gallery_per_page ?? ''}
						onChange={attributeChangeFactory(
							'gallery_per_page',
							true
						)}
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
									setAttributes({
										collection_video_limit: -1,
									});
								} else if (
									Number(collection_video_limit) === -1
								) {
									setAttributes({
										collection_video_limit: 12,
									});
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
										: (collection_video_limit ?? '')
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
							label={__(
								'Max Columns',
								'video-embed-thumbnail-generator'
							)}
							type="number"
							value={gallery_columns ?? ''}
							onChange={attributeChangeFactory(
								'gallery_columns',
								true
							)}
						/>
						<ToggleControl
							__nextHasNoMarginBottom
							label={__(
								'Title',
								'video-embed-thumbnail-generator'
							)}
							onChange={attributeChangeFactory('gallery_title')}
							checked={!!gallery_title}
						/>
						<SelectControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={__(
								'When current video ends',
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
										{video.meta?.['_videopack-meta']
											?.poster ? (
											<img
												src={
													video.meta[
														'_videopack-meta'
													].poster
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
			<PanelBody
				title={__('Colors', 'video-embed-thumbnail-generator')}
				initialOpen={false}
			>
				{(blockType === 'gallery' || blockType === 'list') && (
					<div className="videopack-color-section">
						<p className="videopack-settings-section-title">
							{__('Titles', 'video-embed-thumbnail-generator')}
						</p>
						<div className="videopack-color-flex-row">
							<div className="videopack-color-flex-item">
								<CompactColorPicker
									label={__(
										'Text',
										'video-embed-thumbnail-generator'
									)}
									value={title_color}
									onChange={(value) =>
										setAttributes({ title_color: value })
									}
									colors={THEME_COLORS}
									fallbackValue={colorFallbacks.title_color}
								/>
							</div>
							<div className="videopack-color-flex-item">
								<CompactColorPicker
									label={__(
										'Background',
										'video-embed-thumbnail-generator'
									)}
									value={title_background_color}
									onChange={(value) =>
										setAttributes({
											title_background_color: value,
										})
									}
									colors={THEME_COLORS}
									fallbackValue={
										colorFallbacks.title_background_color
									}
								/>
							</div>
						</div>
					</div>
				)}

				{(blockType === 'gallery' || blockType === 'list') && (
					<div className="videopack-color-section">
						<p className="videopack-settings-section-title">
							{__('Player', 'video-embed-thumbnail-generator')}
						</p>
						<div className="videopack-color-flex-row">
							<div className="videopack-color-flex-item">
								<CompactColorPicker
									label={__(
										'Play Button (Accent)',
										'video-embed-thumbnail-generator'
									)}
									value={play_button_color}
									onChange={(value) =>
										setAttributes({
											play_button_color: value,
										})
									}
									colors={THEME_COLORS}
									fallbackValue={
										colorFallbacks.play_button_color
									}
								/>
							</div>
							<div className="videopack-color-flex-item">
								<CompactColorPicker
									label={__(
										'Play Button Icon',
										'video-embed-thumbnail-generator'
									)}
									value={play_button_icon_color}
									onChange={(value) =>
										setAttributes({
											play_button_icon_color: value,
										})
									}
									colors={THEME_COLORS}
									fallbackValue={
										colorFallbacks.play_button_icon_color
									}
								/>
							</div>
							<div className="videopack-color-flex-item">
								<CompactColorPicker
									label={__(
										'Control Bar Background',
										'video-embed-thumbnail-generator'
									)}
									value={control_bar_bg_color}
									onChange={(value) =>
										setAttributes({
											control_bar_bg_color: value,
										})
									}
									colors={THEME_COLORS}
									fallbackValue={
										colorFallbacks.control_bar_bg_color
									}
								/>
							</div>
							<div className="videopack-color-flex-item">
								<CompactColorPicker
									label={__(
										'Control Bar Icons',
										'video-embed-thumbnail-generator'
									)}
									value={control_bar_color}
									onChange={(value) =>
										setAttributes({
											control_bar_color: value,
										})
									}
									colors={THEME_COLORS}
									fallbackValue={
										colorFallbacks.control_bar_color
									}
								/>
							</div>
						</div>
					</div>
				)}

				<div className="videopack-color-section">
					<p className="videopack-settings-section-title">
						{__('Pagination', 'video-embed-thumbnail-generator')}
					</p>
					<div className="videopack-color-flex-row is-pagination">
						<div className="videopack-color-flex-item">
							<CompactColorPicker
								label={__(
									'Outline/Text',
									'video-embed-thumbnail-generator'
								)}
								value={pagination_color}
								onChange={(value) =>
									setAttributes({ pagination_color: value })
								}
								colors={THEME_COLORS}
								fallbackValue={colorFallbacks.pagination_color}
							/>
						</div>
						<div className="videopack-color-flex-item">
							<CompactColorPicker
								label={__(
									'Background',
									'video-embed-thumbnail-generator'
								)}
								value={pagination_background_color}
								onChange={(value) =>
									setAttributes({
										pagination_background_color: value,
									})
								}
								colors={THEME_COLORS}
								fallbackValue={
									colorFallbacks.pagination_background_color
								}
							/>
						</div>
						<div className="videopack-color-flex-item">
							<CompactColorPicker
								label={__(
									'Active Background',
									'video-embed-thumbnail-generator'
								)}
								value={pagination_active_bg_color}
								onChange={(value) =>
									setAttributes({
										pagination_active_bg_color: value,
									})
								}
								colors={THEME_COLORS}
								fallbackValue={
									colorFallbacks.pagination_active_bg_color
								}
							/>
						</div>
						<div className="videopack-color-flex-item">
							<CompactColorPicker
								label={__(
									'Active Text',
									'video-embed-thumbnail-generator'
								)}
								value={pagination_active_color}
								onChange={(value) =>
									setAttributes({
										pagination_active_color: value,
									})
								}
								colors={THEME_COLORS}
								fallbackValue={
									colorFallbacks.pagination_active_color
								}
							/>
						</div>
					</div>
				</div>
			</PanelBody>
		</>
	);
}
