import { useMemo, useEffect } from '@wordpress/element';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { Button, Placeholder } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { videopack as videopackIcon } from './icon';
import VideoSettings from './VideoSettings';
import Thumbnails from './Thumbnails/Thumbnails';
import AdditionalFormats from './AdditionalFormats/AdditionalFormats.js';
import VideoPlayer from './VideopackRender/player/VideoPlayer';
import { useVideoData } from './hooks/useVideoData';

const SingleVideoBlock = ({ setAttributes, attributes, options }) => {
	const { id, src, isExternal } = attributes;

	const { poster, total_thumbnails, attachment, isLoading, error } =
		useVideoData(id, src, isExternal);

	useEffect(() => {
		const newAttributes = {};
		if (poster !== attributes.poster) {
			newAttributes.poster = poster;
		}
		if (total_thumbnails !== attributes.total_thumbnails) {
			newAttributes.total_thumbnails = total_thumbnails;
		}
		if (attachment) {
			if (
				attachment.title?.raw &&
				attachment.title.rendered !== attributes.videoTitle
			) {
				newAttributes.videoTitle = attachment.title.raw;
			}
			if (
				attachment.caption?.raw &&
				attachment.caption.raw !== attributes.caption
			) {
				newAttributes.caption = attachment.caption.raw;
			}
			if (
				attachment.embedlink &&
				attachment.embedlink !== attributes.embedlink
			) {
				newAttributes.embedlink = attachment.embedlink;
			}
		}
		if (Object.keys(newAttributes).length > 0) {
			setAttributes(newAttributes);
		}
	}, [poster, total_thumbnails, attachment, attributes, setAttributes]);

	const handleVideoPlayerReady = () => {};

	const playerAttributes = useMemo(() => {
		const newPlayerAttributes = { ...(options || {}), ...attributes };

		if (!newPlayerAttributes.embed_method && options) {
			newPlayerAttributes.embed_method = options.embed_method;
		}

		if (attachment?.sources) {
			newPlayerAttributes.sources = attachment.sources;
		} else if (src) {
			newPlayerAttributes.sources = [{ src, type: 'video/mp4' }];
		}
		return newPlayerAttributes;
	}, [options, attributes, attachment, src]);

	const blockProps = useBlockProps();

	if (!options || isLoading) {
		return (
			<div {...blockProps}>
				<Placeholder
					className="block-editor-media-placeholder"
					icon={videopackIcon}
					label={__('Videopack')}
					instructions={__('Loading…')}
				/>
			</div>
		);
	}

	if (error) {
		return (
			<div {...blockProps}>
				<Placeholder
					className="block-editor-media-placeholder"
					icon={videopackIcon}
					label={__('Videopack')}
					instructions={sprintf(__('Error: %s'), error)}
				>
					<Button
						__next40pxDefaultSize
						variant="secondary"
						onClick={() => setAttributes({ id: 0, src: '' })}
					>
						{__('Reset Block')}
					</Button>
				</Placeholder>
			</div>
		);
	}

	return (
		<>
			<InspectorControls>
				<Thumbnails
					setAttributes={setAttributes}
					attributes={attributes}
					videoData={{ poster, total_thumbnails, attachment }}
					options={options}
				/>
				<VideoSettings
					setAttributes={setAttributes}
					attributes={{...options, ...attributes}}
				/>
				<AdditionalFormats
					setAttributes={setAttributes}
					attributes={attributes}
					videoData={{ poster, total_thumbnails, attachment }}
					options={options}
				/>
			</InspectorControls>
			<div {...blockProps}>
				<VideoPlayer
					attributes={playerAttributes}
					onReady={handleVideoPlayerReady}
				/>
			</div>
		</>
	);
};

export default SingleVideoBlock;
