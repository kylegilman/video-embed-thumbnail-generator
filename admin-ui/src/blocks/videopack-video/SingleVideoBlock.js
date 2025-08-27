import { useEntityRecord } from '@wordpress/core-data';
import { useEffect, useMemo, useState } from '@wordpress/element';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import VideoSettings from './VideoSettings.js';
import Thumbnails from '../../components/Thumbnails/Thumbnails.js';
import AdditionalFormats from '../../components/AdditionalFormats/AdditionalFormats.js';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer.js';

const SingleVideoBlock = ({
	setAttributes,
	attributes,
	options,
	isSelected,
}) => {
	const { id } = attributes;
	const [showOverlay, setShowOverlay] = useState(!isSelected);

	useEffect(() => {
		setShowOverlay(!isSelected);
	}, [isSelected]);

	const { record: attachment, hasResolved } = useEntityRecord(
		'postType',
		'attachment',
		id
	);

	useEffect(() => {
		if (hasResolved && attachment) {
			const newAttributes = {
				src: attachment.source_url,
				title: attachment.title?.raw,
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
					options={options}
				/>
				<AdditionalFormats attributes={attributes} options={options} />
			</InspectorControls>
			<div {...useBlockProps()}>
				{showOverlay && <div className="videopack-block-overlay" />}
				<VideoPlayer attributes={playerAttributes} />
			</div>
		</>
	);
};

export default SingleVideoBlock;
