import { __, _x, _n, sprintf, } from '@wordpress/i18n';

const BelowVideo = ( {
	attributes,
	attachmentRecord
} ) => {

	const {
		view_count,
		caption,
	} = attributes;

	let viewStarts = 0;
	if ( attachmentRecord && attachmentRecord.hasResolved
		&& (
			view_count
			|| caption
			)
	) {
		if ( attachmentRecord.record?.meta?.['_kgvid-meta']?.starts ) {
			viewStarts = Number( attachmentRecord.record?.meta?.['_kgvid-meta']?.starts );
		}
		return(
			<>
			<div
				className='videopack-below-video'
			>
				{ view_count &&
					<div
						className='viewcount'
					>
						{ sprintf( _n( '%d view', '%d views', viewStarts ), viewStarts ) }
					</div>
				}
				{ caption &&
					<div
						className='caption'
					>
						{ caption }
					</div>
				}
			</div>
			</>
		);
	}
	return null;

}

export default BelowVideo;
