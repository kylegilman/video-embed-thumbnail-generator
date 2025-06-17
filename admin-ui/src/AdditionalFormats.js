import { __, _x, sprintf, } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import {
	Button,
	CheckboxControl,
	Dashicon,
	Icon,
	PanelBody,
	PanelRow,
	Spinner,
	__experimentalDivider as Divider,
	__experimentalConfirmDialog as ConfirmDialog,
} from '@wordpress/components';
import {
	MediaUpload,
	MediaUploadCheck,
	__experimentalGetElementClassName,
} from '@wordpress/block-editor';
import {
	useRef,
	useEffect,
	useState,
} from '@wordpress/element';
import { useSelect } from '@wordpress/data';

const AdditionalFormats = ( {
	setAttributes,
	attributes,
	attachmentRecord,
	options,
} ) => {

	const {
		id,
		src,
		height,
	} = attributes;
	const { ffmpeg_exists } = options;
	const [ videoFormats, setVideoFormats ] = useState();
	const [ encodeMessage, setEncodeMessage ] = useState();
	const [ formatToDelete, setFormatToDelete ] = useState();
	const [ isConfirmOpen, setIsConfirmOpen ] = useState( false );
	const [ isLoading, setIsLoading ] = useState( false );
	const checkboxTimerRef = useRef(null);
	const progressTimerRef = useRef(null);
	const queueApiPath = '/videopack/v1/queue';

	useEffect( () => {
		apiFetch({ path: '/videopack/v1/formats/' + id })
		.then( response => {
			setVideoFormats( response );
			console.log(response);
		});
	}, [id] );

	const isEmpty = (value) => {

		if( value === false
			|| value === null
			|| ( Array.isArray(value) && value.length === 0 )
			|| ( typeof value === 'object' && Object.keys(value).length === 0 )

		) {
			return true;
		}

		return false;
	};

	const deepEqual = (obj1, obj2) => {

		if (obj1 === obj2) {
			return true;
		}

		if (typeof obj1 !== 'object'
			|| typeof obj2 !== 'object'
			|| obj1 === null
			|| obj2 === null
		) {
			return false;
		}

		const keys1 = Object.keys(obj1);
		const keys2 = Object.keys(obj2);

		if (keys1.length !== keys2.length) {
			return false;
		}

		for (const key of keys1) {
			if (!keys2.includes(key)
				|| !deepEqual(obj1[key], obj2[key])
			) {
				return false;
			}
		}

		return true;
	};

	const siteSettings = useSelect( ( select ) => {
		return select( 'core' ).getSite();
	}, [] );

	const isEncodingNow = () => {
		if ( ! videoFormats ) {
			return false;
		}
		return Object.values(videoFormats).some(
			(format) => format.hasOwnProperty('encoding_now') && format.encoding_now
		);
	}

	const incrementEncodeProgress = () => {
		console.log('progress');
		if ( isEncodingNow() ) {
			const updatedVideoFormats = Object.entries(videoFormats).reduce((updated, [key, format]) => {
				if ( ! isEmpty( format.progress ) ) {

					const currentSeconds = format.progress.current_seconds + ( parseInt( format.progress.fps ) / 30 );

					let percentDone = Math.round( format.progress.current_seconds / parseInt( format.progress.duration ) * 100 );
					if ( percentDone > 100 ) {
						percentDone = 100;
					}

					if ( percentDone != 0 ) {
						format.progress.elapsed = format.progress.elapsed + 1;
						if ( ! isNaN( format.progress.remaining ) ) {
							if ( format.progress.remaining > 0 ) {
								format.progress.remaining--;
							} else {
								format.progress.remaing = 0;
							}
						}
					}

					updated[key] = {
						...format,
						progress: {
							...format.progress,
							current_seconds: currentSeconds,
							elapsed: format.progress.elapsed,
							percent_done: percentDone,
							remaining: format.progress.remaining,
						},
					};
				} else {
					updated[key] = format;
				}
				return updated;
			}, {} );

			setVideoFormats(updatedVideoFormats);
		}
	}

	const updateVideoFormats = () => {
		console.log('update');
		if ( src && id ) {
			apiFetch({
				path: '/videopack/v1/formats/' + id,
				method: 'GET',
			})
			.then( response => {
				if ( ! deepEqual( videoFormats, response ) ) {
					setVideoFormats(response);
				}
			} );
		}
	}

	useEffect( () => {

		checkboxTimerRef.current = setTimeout( updateVideoFormats, 5000 );

		if ( ! isEncodingNow() ) {
			clearInterval(progressTimerRef.current);
			progressTimerRef.current = null;

			return;
		}
		if (progressTimerRef.current === null) {
			progressTimerRef.current = setInterval(	incrementEncodeProgress, 1000 );
		}

		return () => {
			if (progressTimerRef.current !== null) {
				clearInterval(progressTimerRef.current);
				progressTimerRef.current = null;
			}
			if (checkboxTimerRef.current !== null) {
				clearTimeout(checkboxTimerRef.current);
				checkboxTimerRef.current = null;
			}
		};

	}, [videoFormats] );

	const somethingToEncode = () => {
		if ( videoFormats ) {
			return Object.values(videoFormats).some((obj) => obj.exists === false);
		}
		return false;
	};

	const buildVideoFormats = () => {
		let nextVideoFormats = videoFormats;
		if ( nextVideoFormats ) {
			// Hide video formats that are not enabled in the plugin settings.
			const visibleVideoFormats = () => {
				Object.keys( options.encode ).reduce( ( acc, key ) => {
					if ( nextVideoFormats.hasOwnProperty( key ) ) {
						acc[key] = nextVideoFormats[key];
					}
					return acc;
				} );
			}
			// Hide video formats that are higher resolution than the original video.
			const lowResVideoFormats = () => {
				Object.fromEntries(
					Object.entries(nextVideoFormats).filter( ( [key, format] ) => {
						return ! format.height || format.height === 0 || format.height > height;
					})
				);
			}
			if ( options.hide_video_formats ) {
				nextVideoFormats = visibleVideoFormats();
			}
			nextVideoFormats = lowResVideoFormats();
		}
	}

	const handleFormatCheckbox = ( event, format ) => {
		setVideoFormats(prevVideoFormats => {
			prevVideoFormats[format].checked = event;
			return { ...prevVideoFormats };
		});

		const currentKgvidMeta = attachmentRecord.meta?.['_kgvid-meta'] || {};
		const updatedKgvidMeta = {
			...currentKgvidMeta.encode,
			[format]: event ? true : 'notchecked',
		};
		attachmentRecord.edit( {
			meta: {
				'_kgvid-meta': {
					'encode': updatedKgvidMeta,
				}
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

	const onSelectFormat = ( media ) => {
		console.log('select');
	}

	const handleEncode = () => {

		setIsLoading(true);

		const kgvid_encode = Object.entries( videoFormats )
			.reduce( ( acc, [ key, value ] ) => {
				acc[key] = value.checked ? true : false;
				return acc;
			}, {}
		);

		apiFetch({
			path: queueApiPath + '/' + id,
			method: 'PUT',
			data: {
				movieurl: src,
				encodeformats: kgvid_encode,
				parent_id: attachmentRecord?.record?.post
			}
		})
		.then( response => {
			console.log(response);
			const queueMessage = () => {

				const queueList = ( () => {
					if ( response?.enqueue_data?.encode_list ) {
						return new Intl.ListFormat(
							siteSettings?.language ? siteSettings.language.replace('_', '-') : 'en-US',
							{ style: "long", type: "conjunction" }
						)
						.format( Object.values( response?.enqueue_data?.encode_list ) );
					}

					return '';
				})();

				if ( response?.enqueue_data?.new_queue_position == false ) {

					const queuePosition = response?.enqueue_data?.existing_queue_position;

					if ( ! JSON.stringify(response?.enqueue_data?.encode_list) !== '[]' ) {

						return sprintf( __( '%1$s updated in existing queue entry in position %2$s.' ),
							queueList,
							queuePosition
						);
					} else {

						return sprintf( __('Video is already %1$s in the queue.'), queuePosition );
					}
				} else {
					if ( response?.enqueue_data?.new_queue_position === 1 ) {

						return __( 'Starting...' );
					} else {

						const queuePosition = response?.enqueue_data?.new_queue_position;

						return sprintf( __( '%1$s added to queue in position %2$s.' ),
							queueList,
							queuePosition
						);
					}
				}
			}
			setEncodeMessage( queueMessage() );
			setIsLoading(false);
			updateVideoFormats();

		} )
		.catch( error => {
			console.error(error);
		} );
	}

	const formatPickable = ( format ) => {
		if ( videoFormats
			&& (
				! videoFormats[format].exists
				|| videoFormats[format].was_picked
			)
			&& ! videoFormats[format].encoding_now
		) {
			return true;
		}
		return false;
	}

	const handleFormatDelete = ( format ) => {

		apiFetch({
			path: `/wp/v2/media/${videoFormats[format].child_id}?force=true`,
			method: 'DELETE',
		  }).then(() => {
			setVideoFormats(prevVideoFormats => {
				prevVideoFormats[ format ] = {
					...prevVideoFormats[ format ],
					exists: false,
					status: 'deleted',
					status_l10n: __( 'deleted' ),
					deletable: false,
					checked: true,
				}
				return { ...prevVideoFormats };
			});
		  }).catch((error) => {
			console.error(error);
		  });
	}

	const confirmFormatDelete = ( format ) => {
		setFormatToDelete( format );
		setIsConfirmOpen( true );
	}
	const handleConfirm = () => {
		setIsConfirmOpen( false );
		handleFormatDelete( formatToDelete );
		setFormatToDelete( null );
	};
	const handleCancel = () => {
		setFormatToDelete( null );
		setIsConfirmOpen( false );
	};

	const convertToTimecode = ( time ) => {
		const padZero = (num) => num.toString().padStart(2, '0');

		const h = Math.floor(time / 3600);
		const m = Math.floor((time % 3600) / 60);
		const s = time % 60;

		const hh = h > 0 ? padZero(h) + ':' : '';
		const mm = padZero(m);
		const ss = padZero(s);

		return hh + mm + ':' + ss;
	}

	const EncodeProgress = ( { format } ) => {

		if ( ! isEmpty( videoFormats[format]?.progress ) ) {

			const percentText = sprintf( __( '%d%%' ), videoFormats[format].progress.percent_done );
			const onCancel = () => {
				console.log('cancel');
			}

			return(
				<div className='videopack-encode-progress'>
					<div className='videopack-meter'>
						<div
							className='videopack-meter-bar'
							style={ { width: percentText } }
						>
							<div className='videopack-meter-text'>
								{ videoFormats[format].progress.percent_done > 20 && percentText }
							</div>
						</div>
					</div>
					<Button
						onClick={ onCancel }
						variant='secondary'
						isDestructive
						size='small'
					>
						{ __( 'Cancel' ) }
					</Button>
					<div className='videopack-encode-progress-small-text'>
						<span>
							{ __( 'Elapsed:' ) + ' ' + convertToTimecode( videoFormats[format].progress.elapsed ) }
						</span>
						<span>
							{ __( 'Remaining:' ) + ' ' + convertToTimecode( videoFormats[format].progress.remaining ) }
						</span>
						<span>
							{ __( 'fps:' ) + ' ' + videoFormats[format].progress.fps }
						</span>
					</div>
				</div>
			);
		}
		return null;
	}

	const encodeButtonTitle = () => {
		if ( somethingToEncode() ) {
			return isLoading ? __( 'Loading...' ) : __( 'Encode selected formats' );
		}
		else {
			return __( 'Nothing to encode' );
		}
	}

	return (
		<>
		<PanelBody title={ __( 'Additional Formats' ) }>
			<MediaUploadCheck>
				<PanelRow>
					{ videoFormats
						? <>
						<ul className={ `videopack-formats-list${ ffmpeg_exists ? '' : ' no-ffmpeg' }` }>
							{ Object.keys( videoFormats ).map( ( format ) => (
								<li key={ format } >
									{ ( ffmpeg_exists && ! videoFormats[format].exists )
										? <CheckboxControl
											__nextHasNoMarginBottom
											className='videopack-format'
											label={ videoFormats[format].name }
											checked={ videoFormats[format].checked }
											disabled={ videoFormats[format].exists }
											onChange={ ( event ) => handleFormatCheckbox( event, format ) }
										/>
										: <span className='videopack-format'>
											{ videoFormats[format].name }
										</span>
									}
									{ videoFormats[format].status != 'notchecked' &&
										<span className='videopack-format-status'>
											{ videoFormats[format].status_l10n }
										</span>
									}
									{ formatPickable( format ) &&
										<MediaUpload
											title={ sprintf( __( 'Choose %s From Library' ), videoFormats[format].name ) }
											onSelect={ onSelectFormat }
											allowedTypes={ ['video'] }
											render={ ( { open } ) => (
											<Button
												variant="secondary"
												onClick={ open }
												className='videopack-format-button'
												size='small'
												title={ __( 'Choose From Library' ) }
											>
												{ videoFormats[format].was_picked
												? __( 'Replace' )
												: __( 'Pick' ) }
											</Button>
											) }
										/>
									}
									{ videoFormats[format].deletable &&
										<Button
											isBusy={ formatToDelete && formatToDelete === format }
											onClick={ () => confirmFormatDelete( format ) }
											variant='link'
											text={ __('Delete Permanently') }
											isDestructive
										/>
									}
									{ videoFormats[format].status === 'encoding' &&
										<EncodeProgress format={ format } />
									}
									<Divider />
								</li>
							) )
							}
						</ul>
						<ConfirmDialog
							isOpen={ isConfirmOpen }
							onConfirm={ handleConfirm }
							onCancel={ handleCancel }
						>
							{ sprintf( __( 'You are about to permanently delete the encoded %s video from your site. This action cannot be undone.' ), videoFormats?.[formatToDelete]?.name ) }
						</ConfirmDialog>
						</>
						: <><Spinner /></>
					}
				</PanelRow>
				{ ( ffmpeg_exists && videoFormats ) &&
					<PanelRow>
						<Button
							variant="secondary"
							onClick={ handleEncode }
							title={ encodeButtonTitle() }
							text={ __( 'Encode' ) }
							disabled={ ! somethingToEncode() }
						>
						</Button>
						{ isLoading && <Spinner /> }
						{ encodeMessage &&
							<span className='videopack-encode-message'>
								{ encodeMessage }
							</span>
						}
					</PanelRow>
				}
			</MediaUploadCheck>
		</PanelBody>
		</>
	);
}

export default AdditionalFormats;
