import { useRef, useEffect, useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';
import { __, _x, _n, sprintf } from '@wordpress/i18n';
import MetaBar from './MetaBar';
import VideoJS from './VideoJs';
import BelowVideo from './BelowVideo';

import './VideoPlayer.scss';

const VideoPlayer = ( {
	attributes,
	onReady,
	attachmentRecord: propAttachmentRecord,
} ) => {
	const {
		embed_method,
		autoplay,
		controls,
		id,
		js_skin,
		loop,
		muted,
		playsinline,
		poster,
		preload,
		src,
		width,
		height,
		count_views,
		start,
		pauseothervideos,
		volume,
		endofvideooverlay,
		auto_res,
		pixel_ratio,
		right_click,
		playback_rate,
		fullwidth,
		view_count,
		caption,
	} = attributes;

	const [ renderReady, setRenderReady ] = useState( false );
	const [ sources, setSources ] = useState( {} );
	const [ videoJsOptions, setVideoJsOptions ] = useState( null );
	const [ metaBarVisible, setMetaBarVisible ] = useState( true );
	const playerRef = useRef( null );

	const videoJsSources = () => {
		const sourceArray = [];

		if ( sources?.sources_data ) {
			Object.values( sources.sources_data ).map( ( source, index ) =>
				sourceArray.push( {
					src: source.src,
					type: source.type,
				} )
			);
		} else {
			sourceArray.push( {
				src,
				type: 'video/mp4',
			} );
		}

		return sourceArray;
	};

	const attachmentRecord =
		propAttachmentRecord ||
		useSelect(
			( select ) => {
				if ( typeof id === 'number' ) {
					return select( 'core' ).getEntityRecord(
						'postType',
						'attachment',
						id
					);
				}
				return null;
			},
			[ id ]
		);

	useEffect( () => {
		if ( embed_method === 'WordPress Default' ) {
			let player = null;
			if ( playerRef.current ) {
				player = new MediaElementPlayer( playerRef.current );
			}

			return () => {
				if ( player ) {
					player.remove();
					player = null;
				}
			};
		}
	}, [ playerRef.current ] );

	useEffect( () => {
		if ( attachmentRecord && attachmentRecord?.videopack?.sources ) {
			setSources( attachmentRecord.videopack.sources );
			setRenderReady( true );
		} else if ( src && id ) {
			apiFetch( {
				path: '/videopack/v1/sources/?id=' + id + '&url=' + src,
				method: 'GET',
			} )
				.then( ( response ) => {
					setSources( response );
					setRenderReady( true );
				} )
				.catch( ( error ) => {
					console.log( error );
				} );
		}
	}, [ src, id, attachmentRecord ] );

	useEffect( () => {
		if ( embed_method === 'Video.js v8' ) {
			setVideoJsOptions( {
				autoplay,
				controls,
				fluid: true,
				responsive: true, //changes controls when the player is smaller
				muted,
				preload,
				poster,
				loop,
				playsinline,
				volume,
				playbackRates: playback_rate ? [ 0.5, 1, 1.25, 1.5, 2 ] : [],
				sources: videoJsSources(),
				userActions: {
					click: false,
				},
			} );
		}
	}, [
		src,
		autoplay,
		controls,
		muted,
		preload,
		poster,
		loop,
		playsinline,
		volume,
		playback_rate,
		sources,
		embed_method,
		videoJsSources,
	] );

	const videoSourceElements = () => {
		let sourceElements = [];

		if ( sources?.sources_data ) {
			sourceElements = Object.values( sources.sources_data ).map(
				( source, index ) => (
					<source
						key={ index }
						src={ source.src }
						type={ source.type }
					/>
				)
			);
		} else {
			sourceElements = [
				<source key={ 0 } src={ src } type="video/mp4" />,
			];
		}

		return sourceElements;
	};

	const GenericPlayer = () => {
		setRenderReady( true );

		return (
			<video
				poster={ poster }
				loop={ loop }
				autoPlay={ autoplay }
				preload={ preload }
				controls={ controls }
				muted={ muted }
				playsInline={ playsinline }
				width={ '100%' }
				height={ '100%' }
				className={
					embed_method === 'WordPress Default'
						? 'wp-video-shortcode'
						: null
				}
				ref={ playerRef }
			>
				{ videoSourceElements() }
				<a href={ src }>{ src }</a>
			</video>
		);
	};

	const WordPressDefaultPlayer = () => {
		return (
			<div className="wp-video">
				<GenericPlayer />
			</div>
		);
	};

	const handleVideoPlayerReady = ( player ) => {
		playerRef.current = player;

		player.on( 'loadedmetadata', () => {
			if ( embed_method === 'Video.js v8' ) {
				onReady( player.el().firstChild );
			} else {
				onReady( player );
			}
		} );

		// You can handle player events here, for example:
		player.on( 'waiting', () => {
			console.log( 'player is waiting' );
		} );

		player.on( 'dispose', () => {
			console.log( 'player will dispose' );
		} );
	};

	if ( renderReady ) {
		return (
			<div className="videopack-wrapper">
				<div className="videopack-player">
					<MetaBar
						attributes={ attributes }
						attachmentRecord={ attachmentRecord }
						metaBarVisible={ metaBarVisible }
					/>
					{ embed_method === 'Video.js v8' && videoJsOptions && (
						<VideoJS
							options={ videoJsOptions }
							onReady={ handleVideoPlayerReady }
							skin={ js_skin }
						/>
					) }
					{ embed_method === 'WordPress Default' && (
						<WordPressDefaultPlayer
							onReady={ handleVideoPlayerReady }
						/>
					) }
					{ embed_method === 'None' && (
						<GenericPlayer onReady={ handleVideoPlayerReady } />
					) }
				</div>
				<BelowVideo
					attributes={ attributes }
					attachmentRecord={ attachmentRecord }
				/>
			</div>
		);
	}
};

export default VideoPlayer;
