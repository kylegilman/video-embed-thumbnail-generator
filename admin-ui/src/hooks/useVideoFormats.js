/**
 * Custom React hook for fetching video formats and sources.
 */

import { useState, useEffect, useCallback } from '@wordpress/element';
import { getVideoSources } from '../api/gallery';

/**
 * Hook to fetch and manage video sources for a given attachment.
 *
 * @param {number}  id             The attachment ID.
 * @param {string}  src            The video source URL.
 * @return {Object} Video sources data and loading state.
 */
export const useVideoFormats = (id, src) => {
	const [sources, setSources] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	const fetchSources = useCallback(
		async (signal = null) => {
			if (!id && !src) {
				return;
			}
			setIsLoading(true);
			try {
				const data = await getVideoSources(id, src, signal);
				setSources(data);
			} catch (error) {
				if (error.name !== 'AbortError') {
					console.error('Videopack: Error fetching video sources:', error);
				}
			} finally {
				setIsLoading(false);
			}
		},
		[id, src]
	);

	useEffect(() => {
		const controller = new AbortController();
		fetchSources(controller.signal);
		return () => controller.abort();
	}, [fetchSources]);

	return { formats: sources, isLoading, refetch: fetchSources };
};
