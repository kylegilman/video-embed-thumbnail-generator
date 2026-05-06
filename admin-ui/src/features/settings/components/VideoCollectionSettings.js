import { useMemo, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import {
	PanelBody,
	SelectControl,
	TextControl,
	ToggleControl,
	Button,
	Flex,
	FlexItem,
	Spinner,
} from '@wordpress/components';
import { sortAscending, sortDescending } from '../../../assets/icon';
import useVideoQuery from '../../../hooks/useVideoQuery';
import { BlockPreview, TemplatePreview } from '../../../components/Preview';
import PreviewIframe from '../../../components/PreviewIframe/PreviewIframe';
import CompactColorPicker from '../../../components/CompactColorPicker/CompactColorPicker';
import { getColorFallbacks } from '../../../utils/colors';
import VideopackTooltip from './VideopackTooltip';

/* global videopack_config */

// Color fallbacks are now handled by getColorFallbacks utility.

const VideoCollectionSettings = ({ settings, changeHandlerFactory }) => {
	const config = videopack_config;
	const embed_method = config?.embed_method || 'Video.js';

	const colorFallbacks = useMemo(
		() => getColorFallbacks(settings),
		[settings]
	);
	const [currentPage, setCurrentPage] = useState(1);

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
		gallery_align,
		title_color,
		title_background_color,
		play_button_color,
		play_button_secondary_color,
		pagination_color,
		pagination_background_color,
		pagination_active_bg_color,
		pagination_active_color,
		skin,
	} = settings;

	const skinOptions = useMemo(() => {
		const options = [
			{
				value: 'vjs-theme-videopack',
				label: __('Videopack', 'video-embed-thumbnail-generator'),
			},
			{
				value: 'kg-video-js-skin',
				label: __(
					'Videopack Classic',
					'video-embed-thumbnail-generator'
				),
			},
			{
				value: 'default',
				label: __(
					'Video.js default',
					'video-embed-thumbnail-generator'
				),
			},
			{
				value: 'vjs-theme-city',
				label: __('City', 'video-embed-thumbnail-generator'),
			},
			{
				value: 'vjs-theme-fantasy',
				label: __('Fantasy', 'video-embed-thumbnail-generator'),
			},
			{
				value: 'vjs-theme-forest',
				label: __('Forest', 'video-embed-thumbnail-generator'),
			},
			{
				value: 'vjs-theme-sea',
				label: __('Sea', 'video-embed-thumbnail-generator'),
			},
		];

		return applyFilters(
			'videopack_player_skin_options',
			options,
			embed_method
		);
	}, [embed_method]);

	const previewQueryAttributes = useMemo(() => {
		const isPaginationEnabled =
			gallery_pagination === true ||
			gallery_pagination === 1 ||
			gallery_pagination === '1';

		const attrs = {
			...settings,
			gallery_pagination: isPaginationEnabled,
			gallery_source: 'all', // Pull videos from the whole site for the preview
			page_number: currentPage,
		};

		// Safety restriction for the preview: if pagination is disabled, force a limit of 12
		if (!isPaginationEnabled) {
			attrs.enable_collection_video_limit = true;
			attrs.collection_video_limit = 12;
		}

		return attrs;
	}, [settings, currentPage, gallery_pagination]);

	const { videoResults, maxNumPages, isResolving } = useVideoQuery(
		previewQueryAttributes,
		0
	);

	// Sync total pages from the query results
	const handlers = useMemo(() => {
		const h = { ...changeHandlerFactory };
		['gallery_columns', 'gallery_per_page'].forEach((key) => {
			if (h[key]) {
				const original = h[key];
				h[key] = (val) => original(parseInt(val, 10) || 0);
			}
		});
		return h;
	}, [changeHandlerFactory]);

	// This is now derived directly in previewContext from maxNumPages

	const galleryTemplate = useMemo(() => {
		const template = [
			[
				'videopack/loop',
				{},
				[
					[
						'videopack/thumbnail',
						{ linkTo: 'none' },
						[
							['videopack/play-button', {}],
							gallery_title
								? [
										'videopack/title',
										{
											isOverlay: true,
											showBackground: true,
										},
								  ]
								: null,
						].filter(Boolean),
					],
				],
			],
		];

		if (gallery_pagination) {
			template.push(['videopack/pagination', {}]);
		}

		return template;
	}, [gallery_title, gallery_pagination]);

	const previewContext = useMemo(() => {
		const ctx = {
			'videopack/layout': 'grid',
			'videopack/columns': gallery_columns,
			'videopack/videos': videoResults,
			'videopack/gallery_pagination': !!gallery_pagination,
			'videopack/gallery_per_page': gallery_per_page,
			'videopack/currentPage': currentPage,
			'videopack/totalPages': maxNumPages,
			'videopack/onPageChange': (page) => setCurrentPage(page),
		};

		// Pass all global settings into the context bridge for child blocks
		Object.keys(settings).forEach((key) => {
			ctx[`videopack/${key}`] = settings[key];
		});

		// Ensure specific color fallbacks are applied for the preview bridge
		ctx['videopack/play_button_color'] =
			play_button_color || colorFallbacks.play_button_color;
		ctx['videopack/play_button_secondary_color'] =
			play_button_secondary_color ||
			colorFallbacks.play_button_secondary_color;
		ctx['videopack/title_color'] =
			title_color || colorFallbacks.title_color;
		ctx['videopack/title_background_color'] =
			title_background_color || colorFallbacks.title_background_color;

		ctx['videopack/pagination_color'] =
			pagination_color || colorFallbacks.pagination_color;
		ctx['videopack/pagination_background_color'] =
			pagination_background_color ||
			colorFallbacks.pagination_background_color;
		ctx['videopack/pagination_active_bg_color'] =
			pagination_active_bg_color ||
			colorFallbacks.pagination_active_bg_color;
		ctx['videopack/pagination_active_color'] =
			pagination_active_color || colorFallbacks.pagination_active_color;

		return ctx;
	}, [
		settings,
		gallery_columns,
		gallery_pagination,
		gallery_per_page,
		videoResults,
		maxNumPages,
		currentPage,
		colorFallbacks,
		play_button_color,
		play_button_secondary_color,
		title_color,
		title_background_color,
		pagination_color,
		pagination_background_color,
		pagination_active_bg_color,
		pagination_active_color,
	]);

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

	const alignOptions = [
		{
			value: '',
			label: videopack_config.contentSize
				? sprintf(
						/* translators: %s: Content size in pixels. */
						__(
							"None (use theme's default width: %s)",
							'video-embed-thumbnail-generator'
						),
						videopack_config.contentSize
					)
				: __(
						"None (use theme's default width)",
						'video-embed-thumbnail-generator'
					),
		},
		{
			value: 'wide',
			label: videopack_config.wideSize
				? sprintf(
						/* translators: %s: Wide size in pixels. */
						__(
							"Wide (use theme's wide width: %s)",
							'video-embed-thumbnail-generator'
						),
						videopack_config.wideSize
					)
				: __(
						"Wide (use theme's wide width)",
						'video-embed-thumbnail-generator'
					),
		},
		{
			value: 'full',
			label: __('Full width', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'left',
			label: __('Left', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'center',
			label: __('Center', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'right',
			label: __('Right', 'video-embed-thumbnail-generator'),
		},
	];

	return (
		<PanelBody>
			<ToggleControl
				__nextHasNoMarginBottom
				label={__('Paginate', 'video-embed-thumbnail-generator')}
				onChange={handlers.gallery_pagination}
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
						onChange={handlers.gallery_per_page}
					/>
				</div>
			)}
			{!gallery_pagination && (
				<>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'Limit number of videos',
							'video-embed-thumbnail-generator'
						)}
						onChange={(val) => {
							handlers.enable_collection_video_limit(
								val
							);
							if (!val) {
								handlers.collection_video_limit(-1);
							} else if (Number(collection_video_limit) === -1) {
								handlers.collection_video_limit(12);
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
									'Video Limit',
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
									handlers.collection_video_limit
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
							onChange={handlers.gallery_orderby}
							options={baseGalleryOrderbyOptions}
							__nextHasNoMarginBottom
							__next40pxDefaultSize
						/>
					</FlexItem>
					<FlexItem>
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
								handlers.gallery_order(
									gallery_order === 'asc' ? 'desc' : 'asc'
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
				<div className="videopack-setting-reduced-width">
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__(
							'Alignment / Width',
							'video-embed-thumbnail-generator'
						)}
						value={gallery_align}
						onChange={handlers.gallery_align}
						options={alignOptions}
					/>
				</div>
				<div className="videopack-setting-auto-width">
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__(
							'Max Columns',
							'video-embed-thumbnail-generator'
						)}
						type="number"
						value={gallery_columns}
						onChange={handlers.gallery_columns}
					/>
					<VideopackTooltip
						text={__(
							'The actual number of columns displayed may be lower than this value depending on the gallery alignment and the width of the container. Narrower widths will automatically collapse to fewer columns for better responsiveness.',
							'video-embed-thumbnail-generator'
						)}
					/>
				</div>
				<ToggleControl
					__nextHasNoMarginBottom
					label={__('Title', 'video-embed-thumbnail-generator')}
					onChange={handlers.gallery_title}
					checked={!!gallery_title}
				/>
				<div className="videopack-setting-auto-width videopack-setting-extra-margin">
					<SelectControl
						__next40pxDefaultSize
						label={__(
							'When current video ends',
							'video-embed-thumbnail-generator'
						)}
						value={gallery_end}
						onChange={handlers.gallery_end}
						options={galleryEndOptions}
					/>
				</div>
				<PanelBody
					title={__('Colors', 'video-embed-thumbnail-generator')}
					initialOpen={true}
				>
					<div className="videopack-setting-reduced-width">
						<SelectControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={__(
								'Skin',
								'video-embed-thumbnail-generator'
							)}
							value={skin}
							onChange={handlers.skin}
							options={skinOptions}
						/>
					</div>
					<div className="videopack-color-section">
						<p className="videopack-settings-section-title">
							{__('Title', 'video-embed-thumbnail-generator')}
						</p>
						<div className="videopack-color-flex-row">
							<div className="videopack-color-flex-item">
								<CompactColorPicker
									label={__(
										'Text',
										'video-embed-thumbnail-generator'
									)}
									value={title_color}
									onChange={handlers.title_color}
									colors={videopack_config.themeColors}
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
									onChange={
										handlers.title_background_color
									}
									colors={videopack_config.themeColors}
									fallbackValue={
										colorFallbacks.title_background_color
									}
								/>
							</div>
						</div>
					</div>

					<div className="videopack-color-section">
						<p className="videopack-settings-section-title">
							{__('Player', 'video-embed-thumbnail-generator')}
						</p>
						<div className="videopack-color-flex-row">
							<div className="videopack-color-flex-item">
								<CompactColorPicker
									label={
										embed_method === 'WordPress Default'
											? __(
													'Play Button Color',
													'video-embed-thumbnail-generator'
												)
											: __(
													'Play Button Icon',
													'video-embed-thumbnail-generator'
												)
									}
									value={play_button_color}
									onChange={
										handlers.play_button_color
									}
									colors={videopack_config.themeColors}
									fallbackValue={
										colorFallbacks.play_button_color
									}
								/>
							</div>
							<div className="videopack-color-flex-item">
								<CompactColorPicker
									label={
										embed_method === 'WordPress Default'
											? __(
													'Play Button Hover',
													'video-embed-thumbnail-generator'
												)
											: __(
													'Play Button Accent',
													'video-embed-thumbnail-generator'
												)
									}
									value={play_button_secondary_color}
									onChange={
										handlers.play_button_secondary_color
									}
									colors={videopack_config.themeColors}
									fallbackValue={
										colorFallbacks.play_button_secondary_color
									}
								/>
							</div>
						</div>
					</div>

					<div className="videopack-color-section">
						<p className="videopack-settings-section-title">
							{__(
								'Pagination',
								'video-embed-thumbnail-generator'
							)}
						</p>
						<div className="videopack-color-flex-row is-pagination">
							<div className="videopack-color-flex-item">
								<CompactColorPicker
									label={__(
										'Outline/Text',
										'video-embed-thumbnail-generator'
									)}
									value={pagination_color}
									onChange={
										handlers.pagination_color
									}
									colors={videopack_config.themeColors}
									fallbackValue={
										colorFallbacks.pagination_color
									}
								/>
							</div>
							<div className="videopack-color-flex-item">
								<CompactColorPicker
									label={__(
										'Background',
										'video-embed-thumbnail-generator'
									)}
									value={pagination_background_color}
									onChange={
										handlers.pagination_background_color
									}
									colors={videopack_config.themeColors}
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
									onChange={
										handlers.pagination_active_bg_color
									}
									colors={videopack_config.themeColors}
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
									onChange={
										handlers.pagination_active_color
									}
									colors={videopack_config.themeColors}
									fallbackValue={
										colorFallbacks.pagination_active_color
									}
								/>
							</div>
						</div>
					</div>
				</PanelBody>
				{previewContext && (
					<div className="videopack-sample-gallery">
						<div
							className={`videopack-sample-gallery-wrapper align${
								gallery_align || 'none'
							}`}
							style={{
								'--wp--style--global--content-size':
									videopack_config.contentSize || '800px',
								'--wp--style--global--wide-size':
									videopack_config.wideSize || '1000px',
							}}
						>
							<span className="videopack-settings-label">
								{__(
									'Sample Gallery',
									'video-embed-thumbnail-generator'
								)}
							</span>
							<PreviewIframe
								title={__(
									'Video Gallery Preview',
									'video-embed-thumbnail-generator'
								)}
								resizeDependencies={[gallery_align]}
								fullScreen={false}
							>
								<div className="videopack-preview-content-container">
									{isResolving && (
										<div className="videopack-preview-loader">
											<Spinner />
										</div>
									)}
									<BlockPreview
										name="videopack/collection"
										attributes={settings}
										context={previewContext}
									>
										<TemplatePreview
											template={galleryTemplate}
											context={previewContext}
										/>
									</BlockPreview>
								</div>
							</PreviewIframe>
						</div>
					</div>
				)}
			</PanelBody>
		</PanelBody>
	);
};

export default VideoCollectionSettings;
