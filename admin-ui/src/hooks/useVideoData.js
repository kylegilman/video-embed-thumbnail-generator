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
			const coreSelector = select('core');
			return {
				attachment: coreSelector.getMedia(id),
				isResolving: coreSelector.isResolving('getMedia', [id]),
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
			console.log(attachment);
			setVideoData({
				poster: attachment?.meta?.['_videopack-meta']?.poster,
				total_thumbnails:
					attachment?.meta?.['_videopack-meta']?.total_thumbnails,
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
