import VideoPlayer from "./player/VideoPlayer";
import VideoGallery from "./gallery/VideoGallery";
import { handle } from "@wordpress/icons";

const VideopackRender = ( { attributes } ) => {

	const { gallery } = attributes;

	const handleVideoPlayerReady = () => {

	}

	if ( gallery ) {
		return(
			<VideoGallery
				attributes={ attributes }
			/>
		);
	} else {
		return(
			<VideoPlayer
				attributes={ attributes }
				onReady={ handleVideoPlayerReady }
			/>
		);
	}

}

export default VideopackRender;
