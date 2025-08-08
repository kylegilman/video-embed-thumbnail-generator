import { useEntityRecord } from '@wordpress/core-data';
import { useEffect, useMemo } from '@wordpress/element';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import VideoSettings from './VideoSettings';
import Thumbnails from './Thumbnails/Thumbnails';
import AdditionalFormats from './AdditionalFormats';
import VideoPlayer from './VideopackRender/player/VideoPlayer';

const SingleVideoBlock = ({ setAttributes, attributes, options }) => {
	const { caption, id, videoTitle } = attributes;

	// useEntityRecord should be called unconditionally.
	const attachment = useEntityRecord('postType', 'attachment', id);

	useEffect(() => {
		// Check hasResolved and that the record exists.
		if (attachment.hasResolved && attachment.record) {
			const newAttributes = {};
			const newTitle = attachment.record?.title?.raw;
			const newCaption = attachment.record?.caption?.raw;

			// Only update if the new value is different from the old one.
			if (newTitle && newTitle !== videoTitle) {
				newAttributes.videoTitle = newTitle;
			}

			// Only update the caption if it's currently empty and a new one is available.
			if (!caption && newCaption) {
				newAttributes.caption = newCaption;
			}

			// Only call setAttributes if there are changes to apply.
			if (Object.keys(newAttributes).length > 0) {
				setAttributes(newAttributes);
			}
		}
	}, [attachment, caption, videoTitle, setAttributes]);

	const handleVideoPlayerReady = () => {};

	const playerAttributes = useMemo(() => {
		const newPlayerAttributes = { ...(options || {}), ...attributes };

		if (!newPlayerAttributes.embed_method && options) {
			newPlayerAttributes.embed_method = options.embed_method;
		}

		if (attachment.record?.videopack?.sources) {
			newPlayerAttributes.sources = attachment.record.videopack.sources;
		}
		return newPlayerAttributes;
	}, [options, attributes, attachment]);

	return (
		<>
			<InspectorControls>
				<Thumbnails
					setAttributes={setAttributes}
					attributes={attributes}
					attachment={attachment}
					options={options}
				/>
				<VideoSettings
					setAttributes={setAttributes}
					attributes={attributes}
				/>
				<AdditionalFormats
					setAttributes={setAttributes}
					attributes={attributes}
					attachment={attachment}
					options={options}
				/>
			</InspectorControls>
			<div {...useBlockProps()}>
				<VideoPlayer
					attributes={playerAttributes}
					onReady={handleVideoPlayerReady}
					attachment={attachment}
				/>
			</div>
		</>
	);
};

export default SingleVideoBlock;
