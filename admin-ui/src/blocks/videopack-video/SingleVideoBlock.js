import { useEffect, useMemo, useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import VideoSettings from './VideoSettings.js';
import Thumbnails from '../../components/Thumbnails/Thumbnails.js';
import AdditionalFormats from '../../components/AdditionalFormats/AdditionalFormats.js';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer.js';

/**
 * SingleVideoBlock component for rendering a single video within the editor.
 *
 * @param {Object}   props                      Component props.
 * @param {Function} props.setAttributes        Function to update block attributes.
 * @param {Object}   props.attributes           Block attributes.
 * @param {Object}   props.options              Global plugin options.
 * @param {boolean}  props.isSelected           Whether the block is selected.
 * @param {Object}   props.externalSourceGroups External video sources if not in library.
 * @param {Object}   props.videoData            Video attachment data and state.
 * @return {Object}                             The rendered component.
 */
const SingleVideoBlock = ({
	setAttributes,
	attributes,
	options,
	isSelected,
	externalSourceGroups,
	videoData,
}) => {
	const { src } = attributes;
	const [showOverlay, setShowOverlay] = useState(!isSelected);

	useEffect(() => {
		setShowOverlay(!isSelected);
	}, [isSelected]);

	const { record: attachment } = videoData;
	const postId = useSelect(
		(select) => select('core/editor')?.getCurrentPostId(),
		[]
	);


	const playerAttributes = useMemo(() => {
		const newPlayerAttributes = { ...options, ...attributes };
		if (attachment && attachment.videopack?.sources) {
			newPlayerAttributes.sources = attachment.videopack.sources;
			newPlayerAttributes.source_groups =
				attachment.videopack.source_groups;
		} else if (src) {
			newPlayerAttributes.source_groups = externalSourceGroups || {};
			if (
				!externalSourceGroups ||
				Object.keys(externalSourceGroups).length === 0
			) {
				newPlayerAttributes.sources = [{ src }];
			}
		}
		return newPlayerAttributes;
	}, [options, attributes, attachment, externalSourceGroups, src]);

	return (
		<>
			<InspectorControls>
				<Thumbnails
					setAttributes={setAttributes}
					attributes={attributes}
					videoData={videoData}
					options={options}
					parentId={postId}
				/>
				<VideoSettings
					setAttributes={setAttributes}
					attributes={attributes}
					options={options}
				/>
				<AdditionalFormats attributes={attributes} options={options} />
			</InspectorControls>
			<div {...useBlockProps()}>
				<VideoPlayer attributes={playerAttributes} />
				{showOverlay && <div className="videopack-block-overlay" />}
			</div>
		</>
	);
};

export default SingleVideoBlock;
