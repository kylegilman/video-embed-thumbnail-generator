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
	externalSourceGroups,
}) => {
	const { id, src } = attributes;
	const [showOverlay, setShowOverlay] = useState(!isSelected);

	useEffect(() => {
		setShowOverlay(!isSelected);
	}, [isSelected]);

	const videoData = useEntityRecord('postType', 'attachment', id);
	const { record: attachment, hasResolved } = videoData;

	useEffect(() => {
		if (id && hasResolved && attachment) {
			const newAttributes = {
				src: attachment.source_url,
				title: attachment.title?.raw,
				caption: attachment.caption?.raw,
				embedlink: attachment.link + '/embed',
				poster: attachment.meta?.['_videopack-meta']?.poster,
			};

			const updatedAttributes = Object.keys(newAttributes).reduce(
				(acc, key) => {
					// Only update if the new value is defined and different from the current attribute.
					if (
						newAttributes[key] !== undefined &&
						newAttributes[key] !== attributes[key]
					) {
						acc[key] = newAttributes[key];
					}
					return acc;
				},
				{},
			);

			if (Object.keys(updatedAttributes).length > 0) {
				setAttributes(updatedAttributes);
			}
		}
	}, [id, attachment, hasResolved, setAttributes, attributes]);

	const playerAttributes = useMemo(() => {
		const newPlayerAttributes = { ...options, ...attributes };

		if (attachment) {
			newPlayerAttributes.sources = attachment.videopack?.sources;
			newPlayerAttributes.source_groups =
				attachment.videopack?.source_groups;
		} else if (!id && src) {
			newPlayerAttributes.source_groups = externalSourceGroups || {};
			if (!externalSourceGroups || Object.keys(externalSourceGroups).length === 0)
				newPlayerAttributes.sources = [{ src }];
		}
		return newPlayerAttributes;
	}, [options, attributes, attachment, externalSourceGroups, id, src]);

	return (
		<>
			<InspectorControls>
				<Thumbnails
					setAttributes={setAttributes}
					attributes={attributes}
					videoData={videoData}
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
