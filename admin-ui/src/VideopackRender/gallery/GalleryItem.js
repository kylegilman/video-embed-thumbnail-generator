import { useRef, useEffect, useState } from '@wordpress/element';
import { __, _x, _n, } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';

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
		if ( videoRecord?.poster_url ) {
			setThumbnailUrl( videoRecord.poster_url );
		}
		if ( videoRecord?.poster_srcset ) {
			setThumbnailSrcset( videoRecord.poster_srcset );
		}
	}, [videoRecord] );

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
				alt={ decodeEntities( videoRecord.title ) }
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
						{ decodeEntities( videoRecord.title ) }
					</span>
				</div>
			}
		</button>
	);

}

export default GalleryItem;
