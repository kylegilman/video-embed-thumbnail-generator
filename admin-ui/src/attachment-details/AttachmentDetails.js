import apiFetch from '@wordpress/api-fetch';
import { Spinner } from '@wordpress/components';
import { useEntityRecord } from '@wordpress/core-data';
import { useState, useEffect } from '@wordpress/element';
import Thumbnails from '../Thumbnails/Thumbnails';
import AdditionalFormats from '../AdditionalFormats';
import './attachment-details.scss';

const AttachmentDetails = ({ attachmentId }) => {
	const [options, setOptions] = useState();
	const [attributes, setAttributes] = useState();
	const attachment = useEntityRecord(
		'postType',
		'attachment',
		!isNaN(attachmentId) ? attachmentId : null
	);

	useEffect(() => {
		console.log('Attachment component mounted.');
		apiFetch({
			path: '/videopack/v1/settings',
			method: 'GET',
		}).then((response) => {
			setOptions(response);
		});
		return () => console.log('Component unmounted!');
	}, []);

	useEffect(() => {
		if (attachment.hasResolved && !attributes) {
			const combinedAttributes = {
				id: attachmentId,
				total_thumbnails:
					attachment.record?.meta?.['_videopack-meta']?.total_thumbnails ||
					options?.total_thumbnails,
				src: attachment.record?.source_url,
				poster:
					attachment.record?.meta?.['_kgflashmediaplayer-poster'] ||
					attachment.record?.media_details?.sizes?.full?.source_url ||
					attachment.record?.image?.src,
				poster_id:
					attachment.record?.meta?.['_kgflashmediaplayer-poster-id'],
			};
			setAttributes(combinedAttributes);
		}
	}, [options, attachment, attributes]);

	if (attributes && attachment.hasResolved && options) {
		return (
			<div className="videopack-attachment-details">
				<Thumbnails
					setAttributes={setAttributes}
					attributes={attributes}
					attachment={attachment}
					options={options}
				/>
				<AdditionalFormats attributes={attributes} options={options} />
			</div>
		);
	}
	return <Spinner />;
};

export default AttachmentDetails;
