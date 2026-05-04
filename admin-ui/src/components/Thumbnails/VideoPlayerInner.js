import { Button, Icon, RangeControl, Spinner } from '@wordpress/components';
import { useRef, useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { external } from '@wordpress/icons';
import { play, pause } from '../../assets/icon';

const VideoPlayerInner = ({
	videoRef,
	panelRef,
	src,
	isPlaying,
	currentTime,
	isSaving,
	togglePlayback,
	handleSliderChange,
	handleUseThisFrame,
	onPopOut,
	onKeyDown,
	isModal = false,
	disabled = false,
	onLoadedData,
}) => {
	const localPanelRef = useRef();
	const containerRef = panelRef || localPanelRef;
	const [duration, setDuration] = useState(videoRef.current?.duration || 0);

	const onLoadedMetadata = (event) => {
		setDuration(event.target.duration);
	};

	useEffect(() => {
		if (videoRef.current?.duration) {
			setDuration(videoRef.current.duration);
		}
	}, [videoRef]);

	useEffect(() => {
		if ((isModal || containerRef === panelRef) && containerRef?.current) {
			// Trigger a small delay to ensure the panel is visible/ready before focusing
			const timer = setTimeout(() => {
				containerRef.current?.focus();
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [isModal, panelRef, containerRef]);

	return (
		<div
			className={`videopack-thumb-video-panel spinner-container${
				isSaving ? ' saving' : ''
			} ${isModal ? 'is-modal' : ''} ${disabled ? 'disabled' : ''}`}
			tabIndex={0}
			ref={containerRef}
			onKeyDown={onKeyDown}
			role="button"
			aria-label={__('Video Player', 'video-embed-thumbnail-generator')}
		>
			<video
				src={src}
				ref={videoRef}
				muted={true}
				preload="metadata"
				onClick={() => togglePlayback(videoRef)}
				onLoadedMetadata={onLoadedMetadata}
				onLoadedData={onLoadedData}
				role="button"
				aria-label={__(
					'Toggle Playback',
					'video-embed-thumbnail-generator'
				)}
				tabIndex="-1"
			/>
			<div className="videopack-thumb-video-controls">
				<Button
					className="videopack-play-pause"
					onClick={() => togglePlayback(videoRef)}
					disabled={disabled}
				>
					<Icon icon={isPlaying ? pause : play} />
				</Button>
				{duration > 0 && (
					<RangeControl
						__nextHasNoMarginBottom
						min={0}
						max={duration}
						step="any"
						initialPosition={0}
						value={currentTime || 0}
						onChange={(val) => handleSliderChange(val, videoRef)}
						className="videopack-thumbvideo-slider"
						type="slider"
					/>
				)}
				{!isModal && onPopOut && (
					<Button
						className="videopack-popout"
						onClick={onPopOut}
						icon={external}
						label={__(
							'Open in larger window',
							'video-embed-thumbnail-generator'
						)}
						showTooltip={true}
						disabled={disabled}
					/>
				)}
			</div>
			<Button
				variant="secondary"
				onClick={() => handleUseThisFrame(videoRef)}
				className="videopack-use-this-frame"
				disabled={isSaving || disabled}
			>
				{__('Use this frame', 'video-embed-thumbnail-generator')}
			</Button>
			{isSaving && <Spinner />}
		</div>
	);
};

export default VideoPlayerInner;
