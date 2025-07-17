import { useRef, useEffect, useState } from '@wordpress/element';
import { __, _x, _n, } from '@wordpress/i18n';

const GalleryItem = ( {
	attributes,
	videoRecord,
	setOpenVideo,
	videoIndex,
	setCurrentVideoIndex,
} ) => {

	const {
		embed_method,
		skin,
		gallery_columns,
		gallery_end,
		gallery_title,
		aspect_ratio,
	} = attributes;

	const [ thumbnailUrl, setThumbnailUrl ] = useState( videopack.settings.url + '/images/nothumbnail.jpg' );
	const [ thumbnailSrcset, setThumbnailSrcset ] = useState( null );

	useEffect(() => {
		const getThumbnail = async () => {
			if ( videoRecord?.image ) {
				const sourceUrl = videoRecord?.image?.src ?? null;
				if ( sourceUrl) {
					setThumbnailUrl( sourceUrl );
				}
				const videopackSrcset = videoRecord?.image?.srcset ?? null;
				if ( videopackSrcset ) {
					setThumbnailSrcset( videopackSrcset );
				}
			} else if (videoRecord?.meta?.['_kgflashmediaplayer-poster'] !== '') {
				if (videoRecord?.meta?.['_kgflashmediaplayer-poster-id'] !== '') {
					const posterRecord = await select('core').getEntityRecord('postType', 'attachment', videoRecord.meta['_kgflashmediaplayer-poster-id']);
					if ( posterRecord?.media_details?.sizes ) {
						setThumbnailUrl( getBestSize( posterRecord.media_details.sizes ) );
					}
					if ( posterRecord?.videopack?.srcset ) {
						setThumbnailSrcset( posterRecord.videopack?.srcset );
					}
				} else {
					setThumbnailUrl( videoRecord?.meta?.['_kgflashmediaplayer-poster'] );
				}
			}
		}

		getThumbnail();
	}, [attributes, videoRecord] );

	return(
		<button
			className='gallery-thumbnail'
			onClick={ () => {
				setOpenVideo( videoRecord );
				setCurrentVideoIndex( videoIndex );
			} }
		>
			<img
				src={ thumbnailUrl }
				srcSet={ thumbnailSrcset }
				alt={ videoRecord.title }
			/>
			<div
				className={ `play-button-container ${skin}` }
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500">
					<circle className="play-button-circle" cx="250" cy="250" r="230" />
					<polygon className="play-button-triangle" points="374.68,250 188,142 188,358" />
				</svg>
			</div>
			{ gallery_title &&
				<div
					className='video-title'
				>
					<div className='video-title-background' />
					<span className='video-title-text'>
						{ videoRecord.title }
					</span>
				</div>
			}
		</button>
	);

}

export default GalleryItem;
