import { __ } from '@wordpress/i18n';

/**
 * Captures a frame from a video element or URL.
 *
 * @param {HTMLVideoElement|string} source           Video element or URL.
 * @param {number}                  time             Time in seconds to capture.
 * @param {Object}                  watermarkOptions Watermark settings.
 * @return {Promise<HTMLCanvasElement>} The canvas with the captured frame.
 */
export const captureVideoFrame = (source, time, watermarkOptions = null) => {
	return new Promise((resolve, reject) => {
		let video;
		let isTempVideo = false;

		if (typeof source === 'string') {
			video = document.createElement('video');
			video.crossOrigin = 'anonymous';
			video.src = source;
			video.muted = true;
			video.preload = 'metadata';
			isTempVideo = true;
		} else {
			video = source;
		}

		const onSeeked = async () => {
			// Clean up listeners if we added them
			if (isTempVideo) {
				video.removeEventListener('seeked', onSeeked);
				video.removeEventListener('error', onError);
			}

			const canvas = document.createElement('canvas');
			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
			const ctx = canvas.getContext('2d');
			ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

			if (watermarkOptions && watermarkOptions.url) {
				try {
					await drawWatermark(canvas, watermarkOptions);
				} catch (e) {
					console.error('Watermark failed', e);
				}
			}

			resolve(canvas);

			if (isTempVideo) {
				video.src = '';
				video.load();
			}
		};

		const onError = (e) => {
			if (isTempVideo) {
				video.removeEventListener('seeked', onSeeked);
				video.removeEventListener('error', onError);
			}
			reject(e);
		};

		const onLoadedMetadata = () => {
			let seekTime = time;
			if (video.duration < seekTime) {
				seekTime = video.duration / 2;
			}
			video.currentTime = seekTime;
		};

		if (isTempVideo) {
			video.addEventListener('seeked', onSeeked);
			video.addEventListener('error', onError);
			video.addEventListener('loadedmetadata', onLoadedMetadata);
			// Trigger load
			video.load();
		} else {
			// For existing video element, just seek
			const oneShotSeek = async () => {
				video.removeEventListener('seeked', oneShotSeek);

				const canvas = document.createElement('canvas');
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				const ctx = canvas.getContext('2d');
				ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

				if (watermarkOptions && watermarkOptions.url) {
					try {
						await drawWatermark(canvas, watermarkOptions);
					} catch (e) {
						console.error('Watermark failed', e);
					}
				}

				resolve(canvas);
			};
			video.addEventListener('seeked', oneShotSeek);
			video.currentTime = time;
		}
	});
};

/**
 * Draws a watermark on the provided canvas.
 *
 * @param {HTMLCanvasElement} canvas  The canvas to draw on.
 * @param {Object}            options Watermark options (url, scale, align, x, valign, y).
 * @return {Promise<HTMLCanvasElement>}
 */
export const drawWatermark = (canvas, options) => {
	return new Promise((resolve, reject) => {
		const { url, scale, align, x, valign, y } = options;
		const ctx = canvas.getContext('2d');
		const img = new Image();
		img.crossOrigin = 'Anonymous';
		img.src = url;

		img.onload = () => {
			const canvasWidth = canvas.width;
			const canvasHeight = canvas.height;
			const watermarkWidth = (canvasWidth * scale) / 100;
			const watermarkHeight = (canvasHeight * scale) / 100;

			const horizontalOffset = (canvasWidth * x) / 100;
			const verticalOffset = (canvasHeight * y) / 100;

			let xPos, yPos;

			switch (align) {
				case 'left':
					xPos = horizontalOffset;
					break;
				case 'center':
					xPos =
						(canvasWidth - watermarkWidth) / 2 + horizontalOffset;
					break;
				case 'right':
					xPos = canvasWidth - watermarkWidth - horizontalOffset;
					break;
				default:
					xPos = horizontalOffset;
			}

			switch (valign) {
				case 'top':
					yPos = verticalOffset;
					break;
				case 'center':
					yPos =
						(canvasHeight - watermarkHeight) / 2 + verticalOffset;
					break;
				case 'bottom':
					yPos = canvasHeight - watermarkHeight - verticalOffset;
					break;
				default:
					yPos = verticalOffset;
			}

			ctx.drawImage(img, xPos, yPos, watermarkWidth, watermarkHeight);
			resolve(canvas);
		};

		img.onerror = () =>
			reject(
				new Error(
					__(
						'Failed to load watermark image',
						'video-embed-thumbnail-generator'
					)
				)
			);
	});
};

/**
 * Loads video metadata from a source.
 *
 * @param {string} source Video URL.
 * @return {Promise<HTMLVideoElement>} The video element with loaded metadata.
 */
export const getVideoMetadata = (source) => {
	return new Promise((resolve, reject) => {
		const video = document.createElement('video');
		video.preload = 'metadata';
		video.crossOrigin = 'anonymous';
		video.src = source;
		video.muted = true;

		const timeout = setTimeout(() => {
			reject(new Error('Video load timeout'));
		}, 30000);

		video.onloadedmetadata = () => {
			clearTimeout(timeout);
			resolve(video);
		};

		video.onerror = (e) => {
			clearTimeout(timeout);
			reject(e);
		};
	});
};

/**
 * Calculates timecodes for thumbnail generation.
 *
 * @param {number} duration Total video duration.
 * @param {number} count    Number of thumbnails.
 * @param {Object} options  Options { position: number (0-100), random: boolean }.
 * @return {number[]} Array of timecodes.
 */
export const calculateTimecodes = (duration, count, options = {}) => {
	const timecodes = [];
	const { position = 50, random = false } = options;

	if (count === 1 && !random) {
		timecodes.push(duration * (position / 100));
	} else {
		for (let i = 0; i < count; i++) {
			let time = ((i + 1) / (count + 1)) * duration;
			if (random) {
				const randomOffset = Math.floor(Math.random() * (duration / count));
				time = Math.max(time - randomOffset, 0);
			}
			timecodes.push(time);
		}
	}
	return timecodes;
};
