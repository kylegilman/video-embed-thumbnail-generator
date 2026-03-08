import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	PanelBody,
	SelectControl,
	TextControl,
	ToggleControl,
	Button,
	Flex,
	FlexItem,
} from '@wordpress/components';
import { sortAscending, sortDescending } from '../../../assets/icon';
import VideoGallery from '../../../components/VideoGallery/VideoGallery';

const VideoCollectionSettings = ({ settings, changeHandlerFactory }) => {
	const {
		enable_collection_video_limit,
		collection_video_limit,
		gallery_columns,
		gallery_end,
		gallery_per_page,
		gallery_title,
		gallery_pagination,
		gallery_orderby,
		gallery_order,
	} = settings;

	const limit = useMemo(() => {
		const parsedLimit = parseInt(collection_video_limit, 10);
		if (isNaN(parsedLimit) || parsedLimit <= 0) {
			return 12;
		}
		return parsedLimit;
	}, [collection_video_limit]);

	const galleryAttributes = useMemo(() => {
		return {
			...settings,
			gallery_source: '',
			gallery_id: '',
			videos: limit,
			gallery_include: '',
		};
	}, [settings, limit]);

	const galleryEndOptions = [
		{
			value: '',
			label: __(
				'Stop and leave popup window open',
				'video-embed-thumbnail-generator'
			),
		},
		{
			value: 'next',
			label: __('Autoplay next video', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'close',
			label: __('Close popup window', 'video-embed-thumbnail-generator'),
		},
	];

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

	return (
		<PanelBody>
			<ToggleControl
				__nextHasNoMarginBottom
				label={__(
					'Paginate video galleries & lists.',
					'video-embed-thumbnail-generator'
				)}
				onChange={changeHandlerFactory.gallery_pagination}
				checked={!!gallery_pagination}
			/>
			{gallery_pagination && (
				<div className="videopack-setting-auto-width">
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__(
							'Videos per page',
							'video-embed-thumbnail-generator'
						)}
						type="number"
						value={gallery_per_page}
						onChange={changeHandlerFactory.gallery_per_page}
					/>
				</div>
			)}
			{!gallery_pagination && (
				<>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'Limit number of videos in galleries & lists.',
							'video-embed-thumbnail-generator'
						)}
						onChange={(val) => {
							changeHandlerFactory.enable_collection_video_limit(
								val
							);
							if (!val) {
								changeHandlerFactory.collection_video_limit(-1);
							} else if (Number(collection_video_limit) === -1) {
								changeHandlerFactory.collection_video_limit(12);
							}
						}}
						checked={!!enable_collection_video_limit}
					/>
					{!!enable_collection_video_limit && (
						<div className="videopack-setting-auto-width">
							<TextControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label={__(
									'Video Limit:',
									'video-embed-thumbnail-generator'
								)}
								help={__(
									'Maximum number of videos to show in a gallery or list when pagination is disabled.',
									'video-embed-thumbnail-generator'
								)}
								type="number"
								value={
									Number(collection_video_limit) === -1
										? 12
										: collection_video_limit
								}
								onChange={
									changeHandlerFactory.collection_video_limit
								}
							/>
						</div>
					)}
				</>
			)}
			<div className="videopack-sort-settings">
				<Flex align="flex-end" className="videopack-sort-controls">
					<FlexItem>
						<SelectControl
							label={__(
								'Sort by',
								'video-embed-thumbnail-generator'
							)}
							value={gallery_orderby}
							onChange={changeHandlerFactory.gallery_orderby}
							options={baseGalleryOrderbyOptions}
							__nextHasNoMarginBottom
							__next40pxDefaultSize
						/>
					</FlexItem>
					<FlexItem>
						<Button
							icon={
								gallery_order === 'ASC'
									? sortAscending
									: sortDescending
							}
							label={
								gallery_order === 'ASC'
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
								changeHandlerFactory.gallery_order(
									gallery_order === 'ASC' ? 'DESC' : 'ASC'
								)
							}
							showTooltip
							variant="secondary"
							__next40pxDefaultSize
						/>
					</FlexItem>
				</Flex>
			</div>
			<PanelBody
				title={__('Galleries', 'video-embed-thumbnail-generator')}
				initialOpen={true}
			>
				<div className="videopack-setting-auto-width">
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__(
							'Columns:',
							'video-embed-thumbnail-generator'
						)}
						type="number"
						value={gallery_columns}
						onChange={changeHandlerFactory.gallery_columns}
					/>
				</div>
				<ToggleControl
					__nextHasNoMarginBottom
					label={__(
						'Overlay video title thumbnails.',
						'video-embed-thumbnail-generator'
					)}
					onChange={changeHandlerFactory.gallery_title}
					checked={!!gallery_title}
				/>
				<div className="videopack-setting-auto-width">
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__(
							'When current gallery video finishes:',
							'video-embed-thumbnail-generator'
						)}
						value={gallery_end}
						onChange={changeHandlerFactory.gallery_end}
						options={galleryEndOptions}
					/>
				</div>
				{galleryAttributes && (
					<div className="videopack-sample-gallery">
						<span className="videopack-settings-label">
							{__(
								'Sample Gallery:',
								'video-embed-thumbnail-generator'
							)}
						</span>
						<VideoGallery attributes={galleryAttributes} />
					</div>
				)}
			</PanelBody>
		</PanelBody>
	);
};

export default VideoCollectionSettings;
