import { __, sprintf } from '@wordpress/i18n';
import {
	Button,
	PanelBody,
	RadioControl,
	RangeControl,
	TextControl,
	ToggleControl,
	__experimentalConfirmDialog as ConfirmDialog,
} from '@wordpress/components';
import {
	startBatchProcess,
	getBatchProgress,
} from '../../../utils/utils';
import useBatchProcess from '../../../hooks/useBatchProcess';
import ChooseFromLibrary from './ChooseFromLibrary';
import WatermarkSettingsPanel from './WatermarkSettingsPanel';
import VideopackTooltip from './VideopackTooltip';

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
	} = settings;

	const featuredBatch = useBatchProcess();
	const parentsBatch = useBatchProcess();
	const generationBatch = useBatchProcess();

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

	const executeGenerateAllThumbnails = async () => {
		try {
			generationBatch.runPolling(
				() => startBatchProcess('thumbs'),
				() => getBatchProgress('thumbs'),
				__(
					'No videos found to process.',
					'video-embed-thumbnail-generator'
				)
			);
		} catch (error) {
			console.error(error);
			generationBatch.setIsProcessing(false);
			generationBatch.showAlert(
				__(
					'An error occurred while processing.',
					'video-embed-thumbnail-generator'
				)
			);
		}
	};

	const handleGenerateAllThumbnails = () => {
		generationBatch.setConfirmDialog({
			isOpen: true,
			message: __(
				'Are you sure you want to generate thumbnails for all videos that do not currently have one?',
				'video-embed-thumbnail-generator'
			),
			onConfirm: executeGenerateAllThumbnails,
			isAlert: false,
		});
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

	const autoThumbLabel = () => {
		const changeAutoThumbNumberHandler = (value) => {
			changeHandlerFactory.auto_thumb_number(value);
			changeHandlerFactory.auto_thumb_position(
				String(value) === '1' ? '50' : '1'
			);
		};

		const autoThumbPositionLabel = () => {
			if (String(auto_thumb_number) === '1') {
				return (
					<>
						{__(
							'thumbnail from',
							'video-embed-thumbnail-generator'
						)}
						<RangeControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							className="videopack-setting-auto-thumb"
							value={Number(auto_thumb_position)}
							onChange={changeHandlerFactory.auto_thumb_position}
							min={0}
							max={100}
							step={1}
						/>
						{__(
							'% through the video',
							'video-embed-thumbnail-generator'
						)}
					</>
				);
			}
			return (
				<>
					{__(
						'thumbnails and set #',
						'video-embed-thumbnail-generator'
					)}
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						className="videopack-setting-auto-thumb"
						type="number"
						value={auto_thumb_position}
						onChange={changeHandlerFactory.auto_thumb_position}
					/>
					{__(
						'as the featured image.',
						'video-embed-thumbnail-generator'
					)}
				</>
			);
		};

		return (
			<span>
				{__('Generate', 'video-embed-thumbnail-generator')}
				<TextControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					className="videopack-setting-auto-thumb"
					type="number"
					min="1"
					max="99"
					value={auto_thumb_number}
					onChange={changeAutoThumbNumberHandler}
				/>
				{autoThumbPositionLabel()}
			</span>
		);
	};

	return (
		<>
			<PanelBody>
				<div className="videopack-setting-auto-width">
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__(
							'Number of thumbnails to generate manually:',
							'video-embed-thumbnail-generator'
						)}
						type="number"
						value={total_thumbnails}
						onChange={changeHandlerFactory.total_thumbnails}
					/>
				</div>
				<div className="videopack-setting-extra-margin">
					<span className="videopack-settings-label">
						{__(
							'Auto-generate thumbnails on upload:',
							'video-embed-thumbnail-generator'
						)}
					</span>
					<ToggleControl
						className="videopack-vertical-center"
						__nextHasNoMarginBottom
						label={autoThumbLabel()}
						onChange={changeHandlerFactory.auto_thumb}
						checked={!!auto_thumb}
					/>
				</div>
				<div className="videopack-setting-extra-margin">
					<div className="videopack-control-with-tooltip">
						<Button
							__next40pxDefaultSize
							variant="secondary"
							onClick={handleGenerateAllThumbnails}
							disabled={generationBatch.isProcessing}
						>
							{generationBatch.isProcessing
								? sprintf(
									/* translators: %1$d: current count, %2$d: total count */
									__(
										'Processing %1$d / %2$d',
										'video-embed-thumbnail-generator'
									),
									generationBatch.progress.current,
									generationBatch.progress.total
								)
								: __(
									'Generate thumbnails for old videos',
									'video-embed-thumbnail-generator'
								)}
						</Button>
						<VideopackTooltip
							text={__(
								"Use FFmpeg to automatically generate thumbnails for every video in the Media Library that doesn't already have them. Uses the automatic thumbnail settings above. This could take a very long time if you have a lot of videos.",
								'video-embed-thumbnail-generator'
							)}
						/>
					</div>
				</div>
				{ffmpeg_exists === true && (
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							"When possible, use the browser's built-in video capabilities to make thumbnails instead of FFmpeg."
						)}
						value={browser_thumbnails}
						checked={!!browser_thumbnails}
						onChange={changeHandlerFactory.browser_thumbnails}
					/>
				)}
				<PanelBody
					title={__(
						'Video player images',
						'video-embed-thumbnail-generator'
					)}
					initialOpen={true}
				>
					<ChooseFromLibrary
						label={__(
							'Default thumbnail:',
							'video-embed-thumbnail-generator'
						)}
						type="url"
						value={poster}
						onChange={changeHandlerFactory.poster}
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'Display thumbnail image again when video ends.',
							'video-embed-thumbnail-generator'
						)}
						onChange={changeHandlerFactory.endofvideooverlaysame}
						checked={!!endofvideooverlaysame}
					/>
					<div className="videopack-control-with-tooltip">
						<ChooseFromLibrary
							label={__(
								'End of video image:',
								'video-embed-thumbnail-generator'
							)}
							type="url"
							value={endofvideooverlay}
							onChange={changeHandlerFactory.endofvideooverlay}
							disabled={endofvideooverlaysame}
						/>
						<VideopackTooltip
							text={__(
								'Display alternate image when video ends.',
								'video-embed-thumbnail-generator'
							)}
						/>
					</div>
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
				<ToggleControl
					__nextHasNoMarginBottom
					label={__(
						'Hide generated thumnbails from the Media Library.'
					)}
					onChange={changeHandlerFactory.hide_thumbnails}
					checked={!!hide_thumbnails}
				/>
				<div className="videopack-setting-extra-margin">
					<div className="videopack-control-with-tooltip">
						<ToggleControl
							__nextHasNoMarginBottom
							label={__(
								'Set generated thumbnails as featured images.',
								'video-embed-thumbnail-generator'
							)}
							onChange={changeHandlerFactory.featured}
							checked={!!featured}
						/>
						<VideopackTooltip
							text={__(
								"If your theme uses the featured image meta tag, this will automatically set a video's parent post's featured image to the most recently saved thumbnail image.",
								'video-embed-thumbnail-generator'
							)}
						/>
					</div>
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
								"If you've generated thumbnails before enabling this option, this will set all existing thumbnails as featured images. Be careful!",
								'video-embed-thumbnail-generator'
							)}
						/>
					</div>
				</div>
				<div className="videopack-setting-extra-margin">
					<RadioControl
						label={
							<span className="videopack-label-with-tooltip">
								{__('Attach thumbnails to:', 'video-embed-thumbnail-generator')}
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
			{generationBatch.confirmDialog.isOpen && (
				<ConfirmDialog
					isOpen={true}
					onConfirm={() => {
						if (generationBatch.confirmDialog.onConfirm) {
							generationBatch.confirmDialog.onConfirm();
						}
						generationBatch.closeConfirmDialog();
					}}
					onCancel={generationBatch.closeConfirmDialog}
					confirmButtonText={
						generationBatch.confirmDialog.isAlert
							? __('OK', 'video-embed-thumbnail-generator')
							: __('OK', 'video-embed-thumbnail-generator')
					}
				>
					{generationBatch.confirmDialog.message}
				</ConfirmDialog>
			)}
		</>
	);
};

export default ThumbnailSettings;
