import VideoPlayer from './player/VideoPlayer';
import VideoGallery from './gallery/VideoGallery';

const VideopackRender = ({ attributes }) => {
	const { gallery } = attributes;

	const handleVideoPlayerReady = () => {};

	if (gallery) {
		return <VideoGallery attributes={attributes} />;
	}
	return (
		<VideoPlayer attributes={attributes} onReady={handleVideoPlayerReady} />
	);
};

export default VideopackRender;
