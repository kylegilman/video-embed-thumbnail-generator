import { useState, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

export const useVideoData = (id, src, isExternal) => {
	const [videoData, setVideoData] = useState({
		poster: undefined,
		total_thumbnails: undefined,
		attachment: undefined,
		error: null,
		isLoading: true,
	});

	const { attachment, isResolving } = useSelect(
		(select) => {
			if (!id || isExternal) {
				return { attachment: null, isResolving: false };
			}
			const { getMedia, isResolving } = select('core');
			return {
				attachment: getMedia(id),
				isResolving: isResolving('getMedia', [id]),
			};
		},
		[id, isExternal]
	);

	useEffect(() => {
		if (isResolving) {
			setVideoData((prevData) => ({ ...prevData, isLoading: true }));
			return;
		}

		if (id && !isExternal && !attachment) {
			setVideoData({
				poster: undefined,
				total_thumbnails: undefined,
				attachment: null,
				error: __('Could not find the video attachment.'),
				isLoading: false,
			});
			return;
		}

		if (attachment) {
			setVideoData({
				poster: attachment.poster || attachment.media_details?.poster,
				total_thumbnails: attachment.meta?.total_thumbnails,
				attachment,
				error: null,
				isLoading: false,
			});
		} else {
			// This will handle external URLs and cases with no ID
			setVideoData({
				poster: undefined,
				total_thumbnails: undefined,
				attachment: null,
				error: null,
				isLoading: false,
			});
		}
	}, [attachment, isResolving, id, isExternal, src]);

	return videoData;
};
