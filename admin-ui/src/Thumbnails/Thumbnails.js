import apiFetch from '@wordpress/api-fetch';
import {
	BaseControl,
	Button,
	Dashicon,
	Icon,
	PanelBody,
	RangeControl,
	Spinner,
	TextControl,
} from '@wordpress/components';
import {
	MediaUpload,
	MediaUploadCheck,
	__experimentalGetElementClassName,
} from '@wordpress/block-editor';
import {
	useCallback,
	useRef,
	useEffect,
	useState,
} from '@wordpress/element';
import { uploadMedia } from '@wordpress/media-utils';
import { __, _x } from '@wordpress/i18n';
import { addQueryArgs, getFilename } from '@wordpress/url';
import { chevronUp, chevronDown } from '@wordpress/icons';
import './Thumbnails.scss';

const Thumbnails = ( {
	setAttributes,
	attributes,
	attachmentRecord,
	options,
} ) => {
	const { id, total_thumbnails, src, poster, poster_id } = attributes;
	const thumbVideoPanel = useRef();
	const videoRef = useRef();
	const currentThumb = useRef();
	const posterImageButton = useRef();
	const [isPlaying, setIsPlaying] = useState(false);
	const [isOpened, setIsOpened] = useState(false);
	const [currentTime, setCurrentTime] = useState(false);
	const [thumbChoices, setThumbChoices] = useState([]);
	const [isSaving, setIsSaving] = useState(false);
	const thumbApiPath = '/videopack/v1/thumbs';

	const VIDEO_POSTER_ALLOWED_MEDIA_TYPES = [ 'image' ];

	useEffect( () => {
		if ( ! poster ) {
			videoRef.current.addEventListener('loadedmetadata', () => { handleGenerate( 'generate' ) } );
		}
	}, [videoRef.current] );

	function onSelectPoster( image ) {
		setAttributes( { poster: image.url, poster_id: Number(image.id) } );
	}

	function onRemovePoster() {
		setAttributes( { poster: undefined } );

		// Move focus back to the Media Upload button.
		posterImageButton.current.focus();
	}

	const handleGenerate = async(type = 'generate') => {
		setIsSaving(true);
		if ( options?.ffmpeg_exists
			&& ! options?.browser_thumbnails
		) {
			const newThumbImages = [];
			for (let i = 1; i <= Number(total_thumbnails); i++) {
				const response = await generateThumb(i, type);
				const thumb = {
					src: response.real_thumb_url,
					type: 'ffmpeg',
				};
				newThumbImages.push(thumb);
				setThumbChoices([...newThumbImages]); // Update incrementally
			}
		} else {
			generateThumbCanvases(type);
		}
	}

	const generateThumbCanvases = useCallback(async (type) => {

		const thumbsInt = Number( total_thumbnails );

		const newThumbCanvases = [];
		const timePoints = [...Array(thumbsInt)].map(
			(_, i) => {
				let movieoffset = ( ( i + 1 ) / ( thumbsInt + 1 ) ) * videoRef.current.duration;
				if ( type === 'random' ) {
					const randomOffset = Math.floor(Math.random() * (videoRef.current.duration / thumbsInt));
					movieoffset = Math.max(movieoffset - randomOffset, 0);
				}
				return movieoffset;
			}
		);

		const timeupdateListener = () => {

			let thumb;
			drawCanvasThumb() // This now returns a Promise resolving to a canvas object
				.then( ( canvas ) => {
					try{
						thumb = {
							src: canvas.toDataURL(),
							type: 'canvas',
							canvasObject: canvas, // Store the canvas object for later upload
						}
					} catch (error) {
						console.error(error);
						videoRef.current.removeEventListener('timeupdate', timeupdateListener);
						setIsSaving(false);
						return;
					}
					newThumbCanvases.push(thumb);
					setThumbChoices([...newThumbCanvases]);
					if (newThumbCanvases.length === thumbsInt) {
						videoRef.current.removeEventListener('timeupdate', timeupdateListener);
						setIsSaving(false);
					} else {
						videoRef.current.currentTime = timePoints[newThumbCanvases.length];
					}
				} )
				.catch((error) => {
					console.error('Error processing canvas:', error);
				});
		}

		videoRef.current.addEventListener('timeupdate', timeupdateListener);
		videoRef.current.currentTime = timePoints[0];
	} );

	// function to toggle video playback
	const togglePlayback = () => {
		if ( videoRef.current?.paused ) {
			videoRef.current.play();
			setIsPlaying(true);
		} else {
			videoRef.current?.pause();
			setIsPlaying(false);
		}
	}

	const pauseVideo = () => {
		videoRef.current.pause();
		setIsPlaying( false );
	}

	const playVideo = () => {
		videoRef.current.play();
		setIsPlaying( true );
	}

	// function to handle slider changes
	const handleSliderChange = (value) => {
		videoRef.current.currentTime = value;
		setCurrentTime(value);
	}

	useEffect(() => {
		const handleTimeUpdate = () => {
			setCurrentTime(videoRef.current.currentTime); // update currentTime state variable
		};

		videoRef.current?.addEventListener('timeupdate', handleTimeUpdate);
		return () => {
			videoRef.current?.removeEventListener('timeupdate', handleTimeUpdate);
		};
	}, []);

	const drawCanvasThumb = async () => {
		const canvas = document.createElement('canvas');
		canvas.width = videoRef.current.videoWidth;
		canvas.height = videoRef.current.videoHeight;
		const ctx = canvas.getContext('2d');
		ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

		if ( options?.ffmpeg_thumb_watermark?.url ) {
			try {
				const watermarkCanvas = drawWatermarkOnCanvas( canvas );
				return watermarkCanvas;
			} catch (error) {
				console.error('Error drawing watermark:', error);
			}
		} else {
			return canvas;
		}
	}

	const handleSaveThumbnail = ( event, thumb, index ) => {
		event.currentTarget.classList.add('saving');
		setIsSaving(true);
		if( thumb.type === 'ffmpeg' ) {
			setImgAsPoster( thumb.src ); // Pass the canvas object directly
		} else {
			setCanvasAsPoster( thumb.canvasObject, index ); // Pass the canvas object directly
		}
	}

	const handleSaveAllThumbnails = async () => {
		setIsSaving(true); // Show spinner for the whole operation
		const firstThumbType = thumbChoices[0]?.type; // Assuming all generated thumbs are of the same type

		if (firstThumbType === 'canvas') {
			// For canvas thumbnails, upload each one individually using uploadMedia
			for (const [index, thumb] of thumbChoices.entries()) {
				try {
					const videoFilename = getFilename(src);
					const thumbBasename = videoFilename.substring(0, videoFilename.lastIndexOf('.')) || videoFilename;

					const file = await new Promise(resolve => thumb.canvasObject.toBlob(blob => {
						resolve(new File([blob], `${thumbBasename}_thumb_canvas_${index + 1}.png`, { type: "image/png" }));
					}, 'image/png'));

					await uploadMedia({ // No need to store response, just upload
						filesList: [file],
						allowedTypes: ['image/png'],
						title: `${thumbBasename} ${__('thumbnail')} ${index + 1}`,
					});
				} catch (error) {
					console.error(`Error uploading canvas thumbnail ${index + 1}:`, error);
					// Optionally, show a notice for individual failures.
				}
			}
			setThumbChoices([]); // Clear choices after saving
		} else if (firstThumbType === 'ffmpeg') {
			// For FFmpeg thumbnails, send their temporary URLs to the server to be saved
			const thumbUrls = thumbChoices.map(thumb => thumb.src);
			try {
				await apiFetch({
					path: `${thumbApiPath}/save_all`,
					method: 'POST',
					data: {
						attachment_id: id,
						thumb_urls: thumbUrls,
					}
				});
				setThumbChoices([]); // Clear choices after saving
			} catch (error) {
				console.error('Error saving all FFmpeg thumbnails:', error);
			}
		}
		setIsSaving(false); // Hide spinner after all operations complete
	};

	function drawWatermarkOnCanvas( canvas ) {
		return new Promise(async ( resolve, reject ) => {
			try {
				if ( ! options?.ffmpeg_thumb_watermark?.url ) {
					reject(new Error('No thumbnail watermark set'));
				}
				const ctx = canvas.getContext('2d');
				const watermarkImage = new Image();
				const {
					url,
					scale,
					align,
					x,
					valign,
					y,
				} = options.ffmpeg_thumb_watermark;

				watermarkImage.crossOrigin = 'Anonymous';
				watermarkImage.src = url;

				watermarkImage.onload = () => {
					const canvasWidth = canvas.width;
					const canvasHeight = canvas.height;
					const watermarkWidth = (canvasWidth * scale) / 100;
					const watermarkHeight = (canvasHeight * scale) / 100;

					const horizontalOffset = (canvasWidth * x) / 100;
					const verticalOffset = (canvasHeight * y) / 100;

					let xPos, yPos;

					switch (align) {
						case 'left':
						xPos = horizontalOffset;
						break;
						case 'center':
						xPos = (canvasWidth - watermarkWidth) / 2 + horizontalOffset;
						break;
						case 'right':
						xPos = canvasWidth - watermarkWidth - horizontalOffset;
						break;
						default:
						reject( new Error( __( 'Invalid horizontal alignment provided' ) ) );
						return;
					}

					switch (valign) {
						case 'top':
						yPos = verticalOffset;
						break;
						case 'center':
						yPos = (canvasHeight - watermarkHeight) / 2 + verticalOffset;
						break;
						case 'bottom':
						yPos = canvasHeight - watermarkHeight - verticalOffset;
						break;
						default:
						reject( new Error( __( 'Invalid vertical alignment provided') ) );
						return;
					}

					ctx.drawImage(watermarkImage, xPos, yPos, watermarkWidth, watermarkHeight);
					resolve( canvas );
				};

				watermarkImage.onerror = () => {
					reject(new Error( __('Failed to load watermark image') ) );
				};
			} catch (error) {
				reject(error);
			}
		});
	}

	const setCanvasAsPoster = async( canvasObject, thumbnailIndex = null ) => {

		const videoFilename = getFilename( src );
		const thumbBasename = videoFilename.substring(0, videoFilename.lastIndexOf('.')) || videoFilename;
		const filenameSuffix = thumbnailIndex !== null ? `_thumb_canvas_${thumbnailIndex + 1}.png` : '_thumb_canvas.png';
		const titleSuffix = thumbnailIndex !== null ? ` ${__('thumbnail')} ${thumbnailIndex + 1}` : ` ${__('thumbnail')}`;

		try {
			const file = await new Promise(resolve => canvasObject.toBlob(blob => {
				resolve(new File([blob], `${thumbBasename}${filenameSuffix}`, { type: "image/png" }));
			}, 'image/png'));

			setIsSaving(true);
			// uploadMedia returns a promise that resolves with the media object.
			const media = await uploadMedia( {
				filesList: [ file ],
				allowedTypes: [ 'image/png' ],
				title: `${thumbBasename}${titleSuffix}`,
			} );
			setPosterData(media.url, media.id);
			setIsSaving(false);
		} catch ( error ) {
			console.error( __('Upload error:'), error );
			// createErrorNotice( error, { type: 'snackbar' } ); // Assuming createErrorNotice is available if needed
		}
	}

	const setPosterData = ( new_poster, new_poster_id ) => {
		setAttributes( { poster: new_poster, poster_id: new_poster_id } );
		setThumbChoices([]);
		attachmentRecord?.edit( {
			featured_media: new_poster_id ? Number(new_poster_id) : null,
			meta: {
				'_kgflashmediaplayer-poster': new_poster,
				'_kgflashmediaplayer-poster-id': Number(new_poster_id),
			},
		} )
		.then( response => {
			attachmentRecord.save()
			.then( response => {
				console.log(attachmentRecord);
			});
		} )
		.catch( error => {
			console.error(error);
		});
	}

	const setImgAsPoster = async( thumb_url, index ) => {
		try{
			const response = await apiFetch({
				path: thumbApiPath,
				method: 'PUT',
				data: {
					attachment_id: id,
					thumburl: thumb_url,
					thumbnail_index: index,
				}
			});
			setPosterData(response.thumb_url, response.thumb_id);
		} catch ( error ) {
			console.error( error );
		}
	}

	const generateThumb = async( i, type ) => {
		try{
			const path = addQueryArgs(
				thumbApiPath,
				{
					url: src,
					total_thumbnails: total_thumbnails,
					thumbnail_index: i,
					attachment_id: id,
					generate_button: type,
				}
			);

			const response = await apiFetch({ path: path });

			return response;
		} catch ( error ) {
			console.error( error );
		}
	}

	const handleVideoKeyboardControl = ( event ) => {

		event.stopImmediatePropagation();

		switch (event.code) {
			case 'Space': // spacebar
				togglePlayback();
			break;

			case 'ArrowLeft': // left
				pauseVideo();
				videoRef.current.currentTime = videoRef.current.currentTime - 0.042;
			break;

			case 'ArrowRight': // right
				pauseVideo();
				videoRef.current.currentTime = videoRef.current.currentTime + 0.042;
			break;

			case 'KeyJ': //j
				if ( isPlaying ) {
					videoRef.current.playbackRate = Math.max( 0, videoRef.current.playbackRate - 1 );
				}
			break;

			case 'KeyK': // k
				pauseVideo();
			break;

			case 'KeyL': //l
				if ( isPlaying ) {
					videoRef.current.playbackRate = videoRef.current.playbackRate + 1;
				}
				playVideo();
			break;

			default: return; // exit this handler for other keys
		}
		event.preventDefault(); // prevent the default action (scroll / move caret)
	}

	const handleUseThisFrame = async () => {
		setIsSaving(true);
		const canvas = await drawCanvasThumb(); // Await the canvas object (no index for single frame)
		setCanvasAsPoster( canvas ); // Pass the canvas object directly, index will be null
	}

	const handleToggleVideoPlayer = ( event ) => {
		event.preventDefault();
		const next = ! isOpened;
		setIsOpened( next );
		if ( next && thumbVideoPanel.current ) {
			thumbVideoPanel.current.focus();
			thumbVideoPanel.current.addEventListener('keydown', handleVideoKeyboardControl);
		}
		else {
			thumbVideoPanel.current.addEventListener('keydown', handleVideoKeyboardControl);
		}
	}

	return (
		<div className='videopack-thumbnail-generator'>
		<PanelBody title={ __( 'Thumbnails' ) }>
			{ poster && <img
				className='videopack-current-thumbnail'
				src={ poster }
				ref={ currentThumb }
		/> }
			<BaseControl className="editor-video-poster-control">
			<BaseControl.VisualLabel>
				{ __( 'Video Thumbnail' ) }
			</BaseControl.VisualLabel>
			<MediaUpload
				title={ __( 'Select video thumbnail' ) }
				onSelect={ onSelectPoster }
				allowedTypes={
				VIDEO_POSTER_ALLOWED_MEDIA_TYPES
				}
				render={ ( { open } ) => (
				<Button
					variant="secondary"
					onClick={ open }
					ref={ posterImageButton }
				>
					{ ! poster
					? __( 'Select' )
					: __( 'Replace' ) }
				</Button>
				) }
			/>
			{ !! poster && (
				<Button
				onClick={ onRemovePoster }
				variant="tertiary"
				>
				{ __( 'Remove' ) }
				</Button>
			) }
			</BaseControl>
			<TextControl // This is the UI control for total_thumbnails.
				value={ total_thumbnails }
				onChange={ (value) => {
					if ( ! value ) {
						setAttributes( { total_thumbnails: '' } );
					} else {
						setAttributes( { total_thumbnails: Number(value) } );
					}
				} }
				className='videopack-numberofthumbs'
				disabled={ isSaving }
			/>
			<Button
				variant='secondary'
				onClick={ () => handleGenerate('generate') }
				className='videopack-generate'
				disabled={ isSaving }
			>
				{ __( 'Generate' ) }
			</Button>
			<Button
				variant='secondary'
				onClick={ () => handleGenerate('random') }
				className='videopack-generate'
				disabled={ isSaving }
			>
				{ __( 'Random' ) }
			</Button>
			{ thumbChoices.length > 0 &&
				<Button
					variant='primary'
					onClick={ handleSaveAllThumbnails }
					disabled={ isSaving }>
					{ __( 'Save All' ) }
				</Button>
			}
			{ thumbChoices.length > 0 &&
				<div className={ `videopack-thumbnail-holder${ isSaving ? ' disabled' : '' }` }>
					{ thumbChoices.map( ( thumb, index ) => (
						<div
							className={ 'videopack-thumbnail' }
							key={ index }
							onClick={ (event) => { handleSaveThumbnail( event, thumb, index ) } }
						>
							<img
								src={ thumb.src }
								alt={ `Thumbnail ${ index + 1 }` }
								title={ __('Save and set thumbnail') }
							/>
							<Spinner />
						</div>
					)) }
				</div>
			}
			<div
				className={ `components-panel__body videopack-thumb-video ${ isOpened ? 'is-opened' : '' }` }
			>
				<h2 className='components-panel__body-title'>
					<button
						className='components-button components-panel__body-toggle'
						type='button'
						onClick={ handleToggleVideoPlayer }
						aria-expanded={ isOpened }
					>
						<span aria-hidden="true">
							<Icon
								className="components-panel__arrow"
								icon={ isOpened ? chevronUp : chevronDown }
							/>
						</span>
						{ __( 'Choose From Video' ) }
					</button>
				</h2>
				<div
					className='videopack-thumb-video-panel'
					tabIndex={ 0 }
					ref={ thumbVideoPanel }
				>
					<video
						src={ src }
						ref={ videoRef }
						muted={ true }
						preload='metadata'
						onClick={ togglePlayback }
					/>
					<Button
						className="videopack-play-pause"
						onClick={ togglePlayback }
					>
						<Dashicon icon={ isPlaying ? 'controls-pause' : 'controls-play' } />
					</Button>
					{ ! isNaN(videoRef.current?.duration) && <RangeControl
						__nextHasNoMarginBottom
						min={ 0 }
						max={ videoRef.current.duration }
						step='any'
						initialPosition={ 0 }
						value={ videoRef.current.currentTime }
						onChange={ handleSliderChange }
						className='videopack-thumbvideo-slider'
						type='slider'
					/> }
					<Button
						variant='secondary'
						onClick={ handleUseThisFrame }
						disabled={ isSaving }
					>
						{ __( 'Use this frame' ) }
					</Button>
				</div>
			</div>
		</PanelBody>
	</div>
	);
}

export default Thumbnails;
