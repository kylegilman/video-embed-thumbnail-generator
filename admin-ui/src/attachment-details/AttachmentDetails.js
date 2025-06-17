import { __, _x } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import {
	Button,
	Icon,
	Panel,
	PanelRow,
	Spinner,
	TabPanel,
	Tooltip,
} from '@wordpress/components';
import { useDebounce } from '@wordpress/compose';
import { useEntityRecord } from '@wordpress/core-data';
import {
	createRoot,
	useMemo,
	useState,
	useEffect,
} from '@wordpress/element';
import { videopack } from '../icon';
import Thumbnails from '../Thumbnails/Thumbnails';
import AdditionalFormats from '../AdditionalFormats';

const AttachmentDetails = ( { attachmentAttributes } ) => {
	const { id } = attachmentAttributes;
	const [options, setOptions] = useState();
	const [attributes, setAttributes] = useState();
	const attachmentRecord = isNaN( id ) ? null : useEntityRecord( 'postType', 'attachment', id);

	useEffect ( () => {
		console.log('Attachment component mounted.');
		apiFetch({
			path: '/videopack/v1/settings',
			method: 'GET',
		})
		.then( response => {
			setOptions(response);
		} );
		return ( () => console.log('Component unmounted!') );
	}, [] );

	useEffect ( () => {
		const combinedAttributes = {
			id: id,
			numberofthumbs: attachmentAttributes?.meta?.['_kgvid-meta']?.numberofthumbs || options?.numberofthumbs,
			src: attachmentAttributes?.url,
			poster: attachmentAttributes?.meta?.['_kgflashmediaplayer-poster'] || attachmentAttributes?.image?.src,
			poster_id: attachmentAttributes?.meta?.['_kgflashmediaplayer-poster-id'],
		}
		setAttributes( combinedAttributes );
	}, [ options ] );

	if ( attributes && attachmentRecord.hasResolved && options ) {
		return(
			<div className='videopack-attachment-details'>
			<Thumbnails
				setAttributes={ setAttributes }
				attributes={ attributes }
				attachmentRecord={ attachmentRecord }
				options={ options }
			/>
			<AdditionalFormats
				setAttributes={ setAttributes }
				attributes={ attributes }
				attachmentRecord={ attachmentRecord }
				options={ options }
			/>
			</div>
		);
	} else {
		return (
			<Spinner />
		);
	}
}

export default AttachmentDetails;
