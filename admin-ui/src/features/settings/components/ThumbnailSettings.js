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
	getThumbnailCandidates,
	createThumbnailFromCanvas,
	setPosterImage,
} from '../../../utils/utils';
import {
	getVideoMetadata,
	calculateTimecodes,
	captureVideoFrame,
} from '../../../utils/video-capture';
import useBatchProcess from '../../../hooks/useBatchProcess';
import TextControlOnBlur from './TextControlOnBlur';

const ThumbnailSettings = ({ settings, changeHandlerFactory }) => {
	const {
		browser_thumbnails,
		ffmpeg_exists,
		poster,
		endofvideooverlay,
		thumb_watermark,
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
			() =>
				startBatchProcess('parents', { target_parent: thumb_parent }),
			() => getBatchProgress('parents'),
			__(
				'No thumbnails found to process.',
				'video-embed-thumbnail-generator'
			)
		);
	};

	const executeGenerateAllThumbnails = async () => {
		try {
			if (!ffmpeg_exists) {
				generationBatch.setIsProcessing(true);
				generationBatch.setProgress({ current: 0, total: 0 });

				const candidates = await getThumbnailCandidates();
				const total = candidates.length;

				if (total === 0) {
					generationBatch.setIsProcessing(false);
					generationBatch.showAlert(
						__(
							'No videos found to process.',
							'video-embed-thumbnail-generator'
						)
					);
					return;
				}

				generationBatch.setProgress({ current: 0, total });

				const totalThumbnails = Number(auto_thumb_number) || 1;
				const position = Number(auto_thumb_position) || 50;
				const watermarkOptions = thumb_watermark;

				for (let i = 0; i < total; i++) {
					const { id, url } = candidates[i];
					try {
						const video = await getVideoMetadata(url);
						const duration = video.duration;

						if (duration) {
							const timecodes = calculateTimecodes(duration, 1, {
								position,
							});
							// We only generate one thumbnail for batch processing to avoid overload
							if (timecodes.length > 0) {
								const canvas = await captureVideoFrame(
									video,
									timecodes[0],
									watermarkOptions
								);
								const response =
									await createThumbnailFromCanvas(
										canvas,
										id,
										url
									);
								if (response && response.thumb_url) {
									await setPosterImage(
										id,
										response.thumb_url
									);
								}
							}
						}
					} catch (e) {
						console.error(
							`Failed to generate thumbnail for video ${id}`,
							e
						);
					}
					generationBatch.setProgress((prev) => ({
						...prev,
						current: i + 1,
					}));
				}
				generationBatch.setIsProcessing(false);
			} else {
				// Server-side FFmpeg processing
				generationBatch.runPolling(
					() => startBatchProcess('thumbs'),
					() => getBatchProgress('thumbs'),
					__('No videos found to process.', 'video-embed-thumbnail-generator')
				);
			}
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
			label: __( 'Post', 'video-embed-thumbnail-generator' ),
		},
		{
			value: 'video',
			label: __( 'Video', 'video-embed-thumbnail-generator' ),
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
						{__( 'thumbnail from', 'video-embed-thumbnail-generator' )}
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
						{__( '% through the video', 'video-embed-thumbnail-generator' )}
					</>
				);
			}
			return (
				<>
					{__( 'thumbnails and set #', 'video-embed-thumbnail-generator' )}
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						className="videopack-setting-auto-thumb"
						type="number"
						value={auto_thumb_position}
						onChange={changeHandlerFactory.auto_thumb_position}
					/>
					{__( 'as the featured image.', 'video-embed-thumbnail-generator' )}
				</>
			);
		};

		return (
			<span>
				{__( 'Generate', 'video-embed-thumbnail-generator' )}
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
						label={__( 'Number of thumbnails to generate manually:', 'video-embed-thumbnail-generator' )}
						type="number"
						value={total_thumbnails}
						onChange={changeHandlerFactory.total_thumbnails}
					/>
				</div>
				<div className="videopack-setting-extra-margin">
					<span className="videopack-settings-label">
						{__( 'Auto-generate thumbnails on upload:', 'video-embed-thumbnail-generator' )}
					</span>
					<ToggleControl
						className="videopack-vertical-center"
						__nextHasNoMarginBottom
						label={autoThumbLabel()}
						onChange={changeHandlerFactory.auto_thumb}
						checked={!!auto_thumb}
					/>
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
				<div className="videopack-setting-reduced-width">
					<TextControlOnBlur
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__( 'Default thumbnail:', 'video-embed-thumbnail-generator' )}
						type="url"
						value={poster}
						onChange={changeHandlerFactory.poster}
					/>
					<Button
						className="videopack-library-button"
						variant="secondary"
					>
						{__( 'Choose from library', 'video-embed-thumbnail-generator' )}
					</Button>
				</div>
				<ToggleControl
					__nextHasNoMarginBottom
					label={__( 'Display thumbnail image again when video ends.', 'video-embed-thumbnail-generator' )}
					onChange={changeHandlerFactory.endofvideooverlaysame}
					checked={!!endofvideooverlaysame}
				/>
				<div className="videopack-setting-reduced-width">
					<TextControlOnBlur
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__( 'End of video image:', 'video-embed-thumbnail-generator' )}
						type="url"
						value={endofvideooverlay}
						onChange={changeHandlerFactory.endofvideooverlay}
						disabled={endofvideooverlaysame}
					/>
					<Button
						className="videopack-library-button"
						variant="secondary"
					>
						{__( 'Choose from library', 'video-embed-thumbnail-generator' )}
					</Button>
				</div>
				<div className="videopack-setting-reduced-width">
					<TextControlOnBlur
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__( 'Add watermark to generated thumbnails:', 'video-embed-thumbnail-generator' )}
						type="url"
						value={thumb_watermark?.url}
						onChange={changeHandlerFactory.thumb_watermark}
					/>
					<Button
						className="videopack-library-button"
						variant="secondary"
					>
						{__( 'Choose from library', 'video-embed-thumbnail-generator' )}
					</Button>
				</div>
				<ToggleControl
					__nextHasNoMarginBottom
					label={__(
						'Hide generated thumnbails from the Media Library.'
					)}
					onChange={changeHandlerFactory.hide_thumbnails}
					checked={!!hide_thumbnails}
				/>
				<div className="videopack-setting-extra-margin">
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'Set generated thumbnails as featured images.'
						)}
						onChange={changeHandlerFactory.featured}
						checked={!!featured}
					/>
					<Button
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
							: __( 'Set all as featured', 'video-embed-thumbnail-generator' )}
					</Button>
				</div>
				<div className="videopack-setting-extra-margin">
					<RadioControl
						label={__( 'Attach thumbnails to:', 'video-embed-thumbnail-generator' )}
						selected={thumb_parent}
						options={thumbParentOptions}
						onChange={changeHandlerFactory.thumb_parent}
						className="videopack-setting-radio-group"
					/>
					<Button
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
							: __( 'Set all parents', 'video-embed-thumbnail-generator' )}
					</Button>
				</div>
				<Button
					className="videopack-library-button no-vertical-align"
					variant="secondary"
					onClick={handleGenerateAllThumbnails}
					disabled={generationBatch.isProcessing}
				>
					{generationBatch.isProcessing
						? sprintf(
								/* translators: 1: current count, 2: total count */
								__(
									'Processing %1$d / %2$d',
									'video-embed-thumbnail-generator'
								),
								generationBatch.progress.current,
								generationBatch.progress.total
							)
						: __( 'Generate thumbnails for all videos', 'video-embed-thumbnail-generator' )}
				</Button>
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
