import { __, sprintf } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import {
	Button,
	PanelBody,
	RadioControl,
	RangeControl,
	TextControl,
	ToggleControl,
	__experimentalConfirmDialog as ConfirmDialog,
} from '@wordpress/components';
import { startBatchProcess, getBatchProgress } from '../../../api/media';
import useBatchProcess from '../../../hooks/useBatchProcess';
import SelectFromLibrary from './SelectFromLibrary';
import WatermarkSettingsPanel from '../../../components/WatermarkSettingsPanel/WatermarkSettingsPanel';
import VideopackTooltip from './VideopackTooltip';

const config = window.videopack_config || {};

const ThumbnailSettings = ({ settings, changeHandlerFactory }) => {
	const {
		browser_thumbnails,
		ffmpeg_exists,
		poster,
		endofvideooverlay,
		ffmpeg_thumb_watermark,
		total_thumbnails,
		featured,
		thumb_parent,
		hide_thumbnails,
		endofvideooverlaysame,
		auto_thumb,
		auto_thumb_number,
		auto_thumb_position,
		active_encoder = 'ffmpeg',
	} = settings;

	const activeEncoderReady = applyFilters(
		'videopack.encoder.is_ready',
		!!config.isTranscodingServiceReady,
		active_encoder,
		settings
	);
	const effectiveFfmpegExists =
		(active_encoder !== 'ffmpeg' && activeEncoderReady) ||
		ffmpeg_exists === true ||
		ffmpeg_exists === 'true' ||
		ffmpeg_exists === 1 ||
		ffmpeg_exists === '1';

	const browserThumbnailsRequirement = applyFilters(
		'videopack.settings.browserThumbnailsRequirement',
		{ force: false, help: null },
		config
	);

	const featuredBatch = useBatchProcess();
	const parentsBatch = useBatchProcess();

	const handleSetAllFeatured = async () => {
		featuredBatch.confirmAndRun(
			__(
				'Are you sure you want to set all video thumbnails as featured images for their parent posts? This may overwrite existing featured images.',
				'video-embed-thumbnail-generator'
			),
			() => startBatchProcess('featured'),
			() => getBatchProgress('featured'),
			__('No videos found to process.', 'video-embed-thumbnail-generator')
		);
	};

	const handleSetAllParents = async () => {
		const confirmMessage =
			thumb_parent === 'video'
				? __(
						'Are you sure you want to attach all thumbnails to their parent videos?',
						'video-embed-thumbnail-generator'
					)
				: __(
						'Are you sure you want to attach all thumbnails to the parent posts?',
						'video-embed-thumbnail-generator'
					);

		parentsBatch.confirmAndRun(
			confirmMessage,
			() => startBatchProcess('parents', { target_parent: thumb_parent }),
			() => getBatchProgress('parents'),
			__(
				'No thumbnails found to process.',
				'video-embed-thumbnail-generator'
			)
		);
	};

	const thumbParentOptions = [
		{
			value: 'post',
			label: __('Post', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'video',
			label: __('Video', 'video-embed-thumbnail-generator'),
		},
	];

	const changeAutoThumbNumber = (value) => {
		const numVal = parseInt(value, 10) || 1;
		changeHandlerFactory.auto_thumb_number(numVal);
		if (numVal === 1) {
			changeHandlerFactory.auto_thumb_position('50');
		} else {
			changeHandlerFactory.auto_thumb_position('1');
		}
	};

	return (
		<>
			<PanelBody
				title={__(
					'Manual Generation',
					'video-embed-thumbnail-generator'
				)}
				initialOpen={true}
			>
				<div className="videopack-grid-row-align videopack-narrow-input">
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__(
							'Default to generate',
							'video-embed-thumbnail-generator'
						)}
						type="number"
						value={total_thumbnails}
						onChange={changeHandlerFactory.total_thumbnails}
					/>
				</div>
				{!!effectiveFfmpegExists && (
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							"When possible, use the browser's built-in video capabilities to generate thumbnails"
						)}
						value={browser_thumbnails}
						checked={
							!!browser_thumbnails ||
							!!browserThumbnailsRequirement.force
						}
						onChange={changeHandlerFactory.browser_thumbnails}
						disabled={!!browserThumbnailsRequirement.force}
						help={browserThumbnailsRequirement.help}
					/>
				)}
			</PanelBody>
			{!!effectiveFfmpegExists && (
				<PanelBody
					title={__(
						'Automatic Generation on Upload',
						'video-embed-thumbnail-generator'
					)}
					initialOpen={true}
				>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'Thumbnails',
							'video-embed-thumbnail-generator'
						)}
						onChange={changeHandlerFactory.auto_thumb}
						checked={!!auto_thumb}
					/>
					{!!auto_thumb && (
						<>
							<div className="videopack-grid-row-align videopack-narrow-input">
								<TextControl
									__nextHasNoMarginBottom
									__next40pxDefaultSize
									label={__(
										'Number of thumbnails',
										'video-embed-thumbnail-generator'
									)}
									type="number"
									min="1"
									max="99"
									value={auto_thumb_number}
									onChange={changeAutoThumbNumber}
								/>
							</div>
							{String(auto_thumb_number) === '1' ? (
								<div className="videopack-grid-row-align">
									<RangeControl
										__nextHasNoMarginBottom
										__next40pxDefaultSize
										label={__(
											'Video position',
											'video-embed-thumbnail-generator'
										)}
										value={Number(auto_thumb_position)}
										onChange={
											changeHandlerFactory.auto_thumb_position
										}
										min={0}
										max={100}
										step={1}
										help={sprintf(
											/* translators: %s is a percent sign. */
											__(
												'Where in the video to capture the thumbnail (e.g., 50%s for the exact middle).',
												'video-embed-thumbnail-generator'
											),
											'%'
										)}
									/>
									<span className="videopack-input-suffix">
										%
									</span>
								</div>
							) : (
								<div className="videopack-grid-row-align">
									<RangeControl
										__nextHasNoMarginBottom
										__next40pxDefaultSize
										label={__(
											'Featured thumbnail number',
											'video-embed-thumbnail-generator'
										)}
										value={Number(auto_thumb_position)}
										onChange={
											changeHandlerFactory.auto_thumb_position
										}
										min={1}
										max={Number(auto_thumb_number)}
										step={1}
										help={__(
											"Which of the generated thumbnails to set as the post's featured image.",
											'video-embed-thumbnail-generator'
										)}
									/>
								</div>
							)}
						</>
					)}
					{applyFilters(
						'videopack.settings.thumbnail.extra_controls',
						null,
						{
							settings,
							changeHandlerFactory,
							effectiveFfmpegExists,
						}
					)}
				</PanelBody>
			)}
			<PanelBody
				title={__('Defaults', 'video-embed-thumbnail-generator')}
				initialOpen={true}
			>
				<SelectFromLibrary
					label={__(
						'Default thumbnail',
						'video-embed-thumbnail-generator'
					)}
					type="url"
					value={poster}
					onChange={changeHandlerFactory.poster}
				/>
				<ToggleControl
					__nextHasNoMarginBottom
					label={__(
						'Display thumbnail image again when video ends',
						'video-embed-thumbnail-generator'
					)}
					onChange={changeHandlerFactory.endofvideooverlaysame}
					checked={!!endofvideooverlaysame}
				/>
				<SelectFromLibrary
					label={__(
						'End of video image',
						'video-embed-thumbnail-generator'
					)}
					type="url"
					value={endofvideooverlay}
					onChange={changeHandlerFactory.endofvideooverlay}
					disabled={endofvideooverlaysame}
				>
					<VideopackTooltip
						text={__(
							'Display alternate image when video ends.',
							'video-embed-thumbnail-generator'
						)}
					/>
				</SelectFromLibrary>
			</PanelBody>
			<WatermarkSettingsPanel
				title={__(
					'Add watermark to generated thumbnails',
					'video-embed-thumbnail-generator'
				)}
				watermarkSettings={ffmpeg_thumb_watermark}
				onChange={changeHandlerFactory.ffmpeg_thumb_watermark}
				initialOpen={true}
			/>
			<PanelBody
				title={__('Media Library', 'video-embed-thumbnail-generator')}
			>
				<ToggleControl
					__nextHasNoMarginBottom
					label={__(
						'Hide generated thumnbails from the Media Library'
					)}
					onChange={changeHandlerFactory.hide_thumbnails}
					checked={!!hide_thumbnails}
				/>
				<div className="videopack-setting-extra-margin">
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'Set generated thumbnails as featured images.',
							'video-embed-thumbnail-generator'
						)}
						onChange={changeHandlerFactory.featured}
						checked={!!featured}
					/>
					<div className="videopack-control-with-tooltip">
						<Button
							__next40pxDefaultSize
							variant="secondary"
							onClick={handleSetAllFeatured}
							disabled={featuredBatch.isProcessing}
						>
							{featuredBatch.isProcessing
								? sprintf(
										/* translators: 1: current count, 2: total count */
										__(
											'Processing %1$d / %2$d',
											'video-embed-thumbnail-generator'
										),
										featuredBatch.progress.current,
										featuredBatch.progress.total
									)
								: __(
										'Set all as featured',
										'video-embed-thumbnail-generator'
									)}
						</Button>
						<VideopackTooltip
							text={__(
								"If you've generated thumbnails before enabling this option, this will set all existing thumbnails as featured images.",
								'video-embed-thumbnail-generator'
							)}
						/>
					</div>
				</div>
				<div className="videopack-setting-extra-margin">
					<RadioControl
						label={
							<span className="videopack-label-with-tooltip">
								{__(
									'Attach thumbnails to',
									'video-embed-thumbnail-generator'
								)}
								<VideopackTooltip
									text={__(
										'This depends on your theme. Thumbnails generated by Videopack can be saved as children of the video attachment or the post. Some themes use an image attached to a post instead of the built-in featured image meta tag. Version 3.x of this plugin saved all thumbnails as children of the video.',
										'video-embed-thumbnail-generator'
									)}
								/>
							</span>
						}
						selected={thumb_parent}
						options={thumbParentOptions}
						onChange={changeHandlerFactory.thumb_parent}
						className="videopack-setting-radio-group"
					/>
					<div className="videopack-control-with-tooltip">
						<Button
							__next40pxDefaultSize
							variant="secondary"
							onClick={handleSetAllParents}
							disabled={parentsBatch.isProcessing}
						>
							{parentsBatch.isProcessing
								? sprintf(
										/* translators: 1: current count, 2: total count */
										__(
											'Processing %1$d / %2$d',
											'video-embed-thumbnail-generator'
										),
										parentsBatch.progress.current,
										parentsBatch.progress.total
									)
								: __(
										'Set all parents',
										'video-embed-thumbnail-generator'
									)}
						</Button>
						<VideopackTooltip
							text={__(
								"If you've generated thumbnails before changing this option, this will set all existing thumbnails as children of your currently selected option.",
								'video-embed-thumbnail-generator'
							)}
						/>
					</div>
				</div>
			</PanelBody>
			{featuredBatch.confirmDialog.isOpen && (
				<ConfirmDialog
					isOpen={true}
					onConfirm={() => {
						if (featuredBatch.confirmDialog.onConfirm) {
							featuredBatch.confirmDialog.onConfirm();
						}
						featuredBatch.closeConfirmDialog();
					}}
					onCancel={featuredBatch.closeConfirmDialog}
					confirmButtonText={
						featuredBatch.confirmDialog.isAlert
							? __('OK', 'video-embed-thumbnail-generator')
							: __('OK', 'video-embed-thumbnail-generator')
					}
				>
					{featuredBatch.confirmDialog.message}
				</ConfirmDialog>
			)}
			{parentsBatch.confirmDialog.isOpen && (
				<ConfirmDialog
					isOpen={true}
					onConfirm={() => {
						if (parentsBatch.confirmDialog.onConfirm) {
							parentsBatch.confirmDialog.onConfirm();
						}
						parentsBatch.closeConfirmDialog();
					}}
					onCancel={parentsBatch.closeConfirmDialog}
					confirmButtonText={
						parentsBatch.confirmDialog.isAlert
							? __('OK', 'video-embed-thumbnail-generator')
							: __('OK', 'video-embed-thumbnail-generator')
					}
				>
					{parentsBatch.confirmDialog.message}
				</ConfirmDialog>
			)}
		</>
	);
};

export default ThumbnailSettings;
