import { useEntityRecord } from '@wordpress/core-data';
import { useEffect, useMemo } from '@wordpress/element';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import VideoSettings from './VideoSettings.js';
import Thumbnails from '../../components/Thumbnails/Thumbnails.js';
import AdditionalFormats from '../../components/AdditionalFormats/AdditionalFormats.js';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer.js';

const SingleVideoBlock = ({ setAttributes, attributes, options }) => {
	const { id } = attributes;

	const { record: attachment, hasResolved } = useEntityRecord(
		'postType',
		'attachment',
		id
	);

	useEffect(() => {
		if (hasResolved && attachment) {
			const newAttributes = {
				src: attachment.source_url,
				videoTitle: attachment.title?.raw,
				caption: attachment.caption?.raw,
				embedlink: attachment.link + '/embed',
				poster: attachment.meta?.['_videopack-meta']?.poster,
			};

			const updatedAttributes = Object.keys(newAttributes).reduce(
				(acc, key) => {
					if (
						newAttributes[key] &&
						newAttributes[key] !== attributes[key]
					) {
						acc[key] = newAttributes[key];
					}
					return acc;
				},
				{}
			);

			if (Object.keys(updatedAttributes).length > 0) {
				setAttributes(updatedAttributes);
			}
		}
	}, [attachment, hasResolved, setAttributes, attributes]);

	const playerAttributes = useMemo(() => {
		const newPlayerAttributes = { ...options, ...attributes };

		if (attachment?.videopack?.sources) {
			newPlayerAttributes.sources = attachment.videopack.sources;
		}
		return newPlayerAttributes;
	}, [options, attributes, attachment]);

	return (
		<>
			<InspectorControls>
				<Thumbnails
					setAttributes={setAttributes}
					attributes={attributes}
					videoData={attachment}
					options={options}
				/>
				<VideoSettings
					setAttributes={setAttributes}
					attributes={attributes}
				/>
				<AdditionalFormats attributes={attributes} options={options} />
			</InspectorControls>
			<div {...useBlockProps()}>
				<VideoPlayer attributes={playerAttributes} />
			</div>
		</>
	);
};

export default SingleVideoBlock;
