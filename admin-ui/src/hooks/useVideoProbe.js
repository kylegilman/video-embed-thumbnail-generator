import { useState, useEffect } from '@wordpress/element';
import { getVideoMetadata, checkCanvasTaint } from '../utils/video-capture';

/**
 * Custom hook to probe a video URL for metadata and CORS/canvas taint status.
 *
 * @param {string} videoUrl The URL of the video to probe.
 * @return {Object} An object containing { isProbing, probedMetadata }.
 */
export default function useVideoProbe(videoUrl) {
	const [state, setState] = useState({
		url: null,
		isProbing: false,
		probedMetadata: null,
	});

	// Derived state: Sync isProbing/metadata synchronously when the URL changes.
	// This prevents race conditions where effects in dependent components start
	// fetching before the probe actually sets isProbing to true.
	if (videoUrl !== state.url) {
		const isValidUrl = (url) => {
			try {
				const parsed = new URL(url);
				return (
					parsed.protocol === 'http:' || parsed.protocol === 'https:'
				);
			} catch (e) {
				return false;
			}
		};

		setState({
			url: videoUrl,
			isProbing: !!videoUrl && isValidUrl(videoUrl),
			probedMetadata: null,
		});
	}

	const { isProbing, probedMetadata } = state;

	useEffect(() => {
		if (!isProbing || !videoUrl) {
			return;
		}

		const controller = new AbortController();

		const metadataPromise = getVideoMetadata(
			videoUrl,
			controller.signal
		).catch(() => null);

		const taintPromise = checkCanvasTaint(
			videoUrl,
			controller.signal
		).catch(() => true);

		const timeout = setTimeout(() => {
			controller.abort();
		}, 10000);

		Promise.all([metadataPromise, taintPromise])
			.then(([metadata, isTainted]) => {
				clearTimeout(timeout);
				if (controller.signal.aborted) {
					return;
				}
				setState((prev) => {
					// Only update if URL still matches
					if (prev.url !== videoUrl) {
						return prev;
					}
					return {
						...prev,
						isProbing: false,
						probedMetadata: metadata
							? { ...metadata, isTainted }
							: null,
					};
				});
			})
			.finally(() => {
				// No additional state update here; handled in .then
			});

		return () => {
			clearTimeout(timeout);
			controller.abort();
		};
	}, [videoUrl, isProbing]);

	return { isProbing, probedMetadata };
}
