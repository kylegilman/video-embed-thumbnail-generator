import { useEntityRecord } from '@wordpress/core-data';
import { useEffect } from '@wordpress/element';
import { __, _x, _n, } from '@wordpress/i18n';
import { InspectorControls, useBlockProps, } from '@wordpress/block-editor';
import VideoSettings from './VideoSettings';
import Thumbnails from './Thumbnails/Thumbnails';
import AdditionalFormats from './AdditionalFormats';
import VideoPlayer from './VideopackRender/player/VideoPlayer';

const SingleVideoBlock = ( {
	setAttributes,
	attributes,
	options,
} ) => {

	const {
		caption,
		id,
	} = attributes;

	const attachmentRecord = isNaN( id ) ? null : useEntityRecord( 'postType', 'attachment', id);
	useEffect( () => {
		if ( attachmentRecord && attachmentRecord.hasResolved ) {
			setAttributes({ videoTitle: attachmentRecord.record?.title?.raw } );
			if ( ! caption ) { setAttributes({ caption: attachmentRecord.record?.caption?.raw } ); }
		}
	}, [ attachmentRecord.hasResolved ] );

	const handleVideoPlayerReady = () => {

	}

	return (
		<>
		<InspectorControls>
			<Thumbnails
				setAttributes={ setAttributes }
				attributes={ attributes }
				attachmentRecord={ attachmentRecord }
				options={ options }
			/>
			<VideoSettings
				setAttributes={ setAttributes }
				attributes={ attributes }
			/>
			<AdditionalFormats
				setAttributes={ setAttributes }
				attributes={ attributes }
				attachmentRecord={ attachmentRecord }
				options={ options }
			/>
		</InspectorControls>
		<div { ...useBlockProps() }>
			<VideoPlayer
				attributes={ attributes }
				onReady={ handleVideoPlayerReady }
			/>
		</div>
		</>
	);

}

export default SingleVideoBlock;
