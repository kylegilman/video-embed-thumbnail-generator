import { createContext, useContext } from '@wordpress/element';

const VideopackContext = createContext({
	gallery_pagination: undefined,
	gallery_per_page: undefined,
	totalPages: undefined,
	currentPage: undefined,
});

export const VideopackProvider = VideopackContext.Provider;

export const useVideopackContext = () => useContext(VideopackContext);

export default VideopackContext;
