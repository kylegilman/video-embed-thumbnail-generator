/* global videopack */

import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import {
	BaseControl,
	Button,
	CheckboxControl,
	ExternalLink,
	Flex,
	FlexBlock,
	FlexItem,
	Icon,
	__experimentalInputControlSuffixWrapper as InputControlSuffixWrapper,
	MediaUpload,
	MediaUploadCheck,
	Panel,
	PanelBody,
	PanelRow,
	RadioControl,
	RangeControl,
	SelectControl,
	TextControl,
	TextareaControl,
	ToggleControl,
	Spinner,
	TabPanel,
	Tooltip,
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';

const EncodingSettings = ( { settings, changeHandlerFactory, ffmpegTest } ) => {
	const {
		app_path,
		replace_format,
		encode,
		custom_format,
		hide_video_formats,
		auto_thumb_number,
		auto_thumb_position,
		error_email,
		htaccess_login,
		htaccess_password,
		ffmpeg_thumb_watermark,
		ffmpeg_watermark,
		rate_control,
		h264_CRF,
		webm_CRF,
		ogv_CRF,
		bitrate_multiplier,
		h264_profile,
		h264_level,
		audio_bitrate,
		audio_channels,
		simultaneous_encodes,
		threads,
		nice,
		sample_format,
		ffmpeg_exists,
		auto_encode,
		auto_encode_gif,
		auto_thumb,
		sample_rotate,
		auto_publish_post,
	} = settings;

	const [ users, setUsers ] = useState( null );
	const [ bitrates, setBitrates ] = useState( null );

	useEffect( () => {
		apiFetch( {
			path: '/videopack/v1/users/?capability=edit_others_video_encodes',
		} )
			.then( ( response ) => {
				setUsers( response );
			} )
			.catch( ( error ) => {
				console.log( error );
			} );
	}, [] );

	useEffect( () => {
		const resolutions = [ 2160, 1080, 720, 480, 360 ];
		const newBitrates = [];
		for ( let i = 0; i < resolutions.length; i++ ) {
			const video_width = Math.round( resolutions[ i ] * 1.7777 );
			const bitrate = Math.round(
				( resolutions[ i ] * video_width * 24 * bitrate_multiplier ) /
					1024
			);
			newBitrates.push( `${ resolutions[ i ] }p = ${ bitrate }kbps` );
		}
		setBitrates( newBitrates );
	}, [ bitrate_multiplier ] );

	const generateVideoFormatOptions = () => {
		return videopack.settings.formats.map( ( videoFormat ) => {
			if (
				videoFormat.format === 'fullres' ||
				videoFormat.name.startsWith( 'Custom' )
			) {
				return null;
			}
			return (
				<option key={ videoFormat.format } value={ videoFormat.format }>
					{ videoFormat.name }
				</option>
			);
		} );
	};

	const fullresReplaceSelect = () => {
		const fullresReplaceOptions = generateVideoFormatOptions();

		fullresReplaceOptions.unshift(
			<option key="fullres" value="fullres">
				{ __( 'same resolution H.264' ) }
			</option>
		);

		fullresReplaceOptions.push(
			<option key="custom" value="custom">
				{ __( 'Custom' ) }
			</option>
		);

		return (
			<span>
				{ __( 'Replace original with ' ) }
				<select
					value={ replace_format }
					onChange={ changeHandlerFactory.replace_format }
					disabled={ ffmpeg_exists !== true }
				>
					{ fullresReplaceOptions }
				</select>
			</span>
		);
	};

	const sampleFormatOptions = () => {
		const sampleFormats = generateVideoFormatOptions();
		sampleFormats.unshift(
			<option key="fullres" value="fullres">
				{ __( 'Replace' ) }
			</option>
		);
		return sampleFormats;
	};

	const errorEmailOptions = () => {
		const authorizedUsers = [
			{
				value: 'nobody',
				label: __( 'Nobody' ),
			},
			{
				value: 'encoder',
				label: __( 'User who initiated encoding' ),
			},
		];
		if ( users ) {
			Object.entries( users ).forEach( ( [ login, id ] ) => {
				authorizedUsers.push( {
					value: id,
					label: login,
				} );
			} );
		}
		return authorizedUsers;
	};

	const formatCheckboxes = videopack.settings.videoFormats.map(
		( videoFormat ) => {
			if (
				videoFormat.format === 'fullres' ||
				videoFormat.name.startsWith( 'Custom' )
			) {
				return null;
			}
			const isChecked = settings.encode?.[ videoFormat.format ] === true;
			return (
				<CheckboxControl
					key={ videoFormat.format }
					label={ videoFormat.name }
					checked={ isChecked }
					onChange={ ( newChecked ) => {
						// Update settings.encode[format.format] based on newChecked
						// ... (implement this functionality based on your application's state management)
					} }
					disabled={ ffmpeg_exists !== true }
				/>
			);
		}
	);

	const autoThumbLabel = () => {
		const changeAutoThumbNumberHandler = ( value ) => {
			changeHandlerFactory.auto_thumb_number( value );
			changeHandlerFactory.auto_thumb_position(
				String( value ) === '1' ? '50' : '1'
			);
		};

		const autoThumbPositionLabel = () => {
			if ( String( auto_thumb_number ) === '1' ) {
				return (
					<>
						{ __( 'thumbnail from' ) }
						<RangeControl
							__next40pxDefaultSize
							className="videopack-setting-auto-thumb"
							value={ Number( auto_thumb_position ) }
							onChange={
								changeHandlerFactory.auto_thumb_position
							}
							min={ 0 }
							max={ 100 }
							step={ 1 }
							disabled={ ffmpeg_exists !== true }
						/>
						{ __( '% through the video' ) }
					</>
				);
			}
			return (
				<>
					{ __( 'thumbnails and set #' ) }
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						className="videopack-setting-auto-thumb"
						type="number"
						value={ auto_thumb_position }
						onChange={ changeHandlerFactory.auto_thumb_position }
						disabled={ ffmpeg_exists !== true }
					/>
					{ __( 'as the featured image.' ) }
				</>
			);
		};

		return (
			<span>
				{ __( 'Generate' ) }
				<TextControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					className="videopack-setting-auto-thumb"
					type="number"
					min="1"
					max="99"
					value={ auto_thumb_number }
					onChange={ changeAutoThumbNumberHandler }
					disabled={ ffmpeg_exists !== true }
				/>
				{ autoThumbPositionLabel() }
			</span>
		);
	};

	const generateMarks = ( slider = false ) => {
		let existingLabels = {};
		let step = 1;

		if ( slider === 'h264' ) {
			existingLabels = {
				0: '0: lossless',
				5: '5',
				10: '10',
				15: '15',
				18: '18: visually lossless',
				23: '23: default',
				30: '30',
				35: '35',
				40: '40',
				45: '45',
				51: '51: lowest',
			};
		}
		if ( slider === 'vp8' ) {
			existingLabels = {
				4: '4: highest',
				10: '10: default',
				15: '15',
				20: '20',
				25: '25',
				30: '30',
				35: '35',
				40: '40',
				45: '45',
				50: '50',
				55: '55',
				60: '60',
				63: '63: lowest',
			};
		}
		if ( slider === 'ogv' ) {
			existingLabels = {
				1: '1: lowest',
				6: '6: default',
				10: '10: highest',
			};
		}
		if ( slider === 'bpp' ) {
			existingLabels = {
				0.01: '0.01',
				0.1: '0.1: default',
				0.15: '0.15',
				0.2: '0.2',
				0.25: '0.25',
				0.3: '0.3',
			};
			step = 0.01;
		}
		if ( slider === 'simultaneous' ) {
			existingLabels = {
				1: '1',
				10: '10',
			};
		}
		if ( slider === 'threads' ) {
			existingLabels = {
				0: 'auto',
				16: '16',
			};
		}

		const values = Object.keys( existingLabels ).map( Number );
		const min = Math.min( ...values );
		const max = Math.max( ...values );

		const marks = [];
		for ( let value = min; value <= max; value += step ) {
			marks.push( {
				value,
				label: existingLabels[ value ] || undefined,
			} );
		}
		return marks;
	};

	const h264ProfileOptions = [
		{ value: 'baseline', label: 'baseline' },
		{ value: 'main', label: 'main' },
		{ value: 'high', label: 'high' },
		{ value: 'high10', label: 'high10' },
		{ value: 'high422', label: 'high422' },
		{ value: 'high444', label: 'high444' },
	];

	const h264LevelOptions = [
		{ value: '1', label: '1' },
		{ value: '1.1', label: '1.1' },
		{ value: '1.2', label: '1.2' },
		{ value: '1.3', label: '1.3' },
		{ value: '2', label: '2' },
		{ value: '2.1', label: '2.1' },
		{ value: '2.2', label: '2.2' },
		{ value: '3', label: '3' },
		{ value: '3.1', label: '3.1' },
		{ value: '3.2', label: '3.2' },
		{ value: '4', label: '4' },
		{ value: '4.1', label: '4.1' },
		{ value: '4.2', label: '4.2' },
		{ value: '5', label: '5' },
		{ value: '5.1', label: '5.1' },
		{ value: '5.2', label: '5.2' },
		{ value: '6', label: '6' },
		{ value: '6.1', label: '6.1' },
		{ value: '6.2', label: '6.2' },
	];

	const audioBitrateOptions = [
		{ value: '32', label: '32' },
		{ value: '64', label: '64' },
		{ value: '96', label: '96' },
		{ value: '128', label: '128' },
		{ value: '160', label: '160' },
		{ value: '192', label: '192' },
		{ value: '224', label: '224' },
		{ value: '256', label: '256' },
		{ value: '320', label: '320' },
	];

	return (
		<>
			<PanelBody>
				<PanelRow>
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Path to FFmpeg folder on server:' ) }
						value={ app_path }
						onChange={ changeHandlerFactory.app_path }
						help={ __(
							'Leave blank if FFmpeg is in your system path.'
						) }
					/>
				</PanelRow>
			</PanelBody>
			<PanelBody>
				<Flex direction="column">
					<FlexItem>
						<BaseControl
							label={ __( 'Default video encode formats:' ) }
							id="fullresReplace"
						>
							<CheckboxControl
								label={ fullresReplaceSelect() }
								checked={ settings.encode?.fullres === true }
								disabled={ ffmpeg_exists !== true }
							/>
							{ formatCheckboxes }
						</BaseControl>
					</FlexItem>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __(
							'Only display default formats on admin pages.'
						) }
						onChange={ changeHandlerFactory.hide_video_formats }
						checked={ hide_video_formats }
						disabled={ ffmpeg_exists !== true }
					/>
					<BaseControl
						label={ __( 'Do automatically on upload:' ) }
						id="autoEncode"
					>
						<ToggleControl
							__nextHasNoMarginBottom
							label={ __( 'Encode default formats.' ) }
							onChange={ changeHandlerFactory.auto_encode }
							checked={ auto_encode }
							disabled={ ffmpeg_exists !== true }
						/>
						<ToggleControl
							__nextHasNoMarginBottom
							label={ __( 'Convert animated GIFs to H.264.' ) }
							onChange={ changeHandlerFactory.auto_encode_gif }
							checked={ hide_video_formats }
							disabled={ ffmpeg_exists !== true }
						/>
						<ToggleControl
							__nextHasNoMarginBottom
							label={ autoThumbLabel() }
							onChange={ changeHandlerFactory.auto_thumb }
							checked={ auto_thumb }
							disabled={ ffmpeg_exists !== true }
						/>
					</BaseControl>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __(
							"Automatically publish video's parent post when encoding finishes."
						) }
						onChange={ changeHandlerFactory.auto_publish_post }
						checked={ auto_publish_post }
						disabled={ ffmpeg_exists !== true }
					/>
					<div className="videopack-setting-auto-width">
						<SelectControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={ __( 'Email encoding errors to:' ) }
							value={ error_email }
							onChange={ changeHandlerFactory.error_email }
							options={ errorEmailOptions() }
							disabled={ ffmpeg_exists !== true }
						/>
					</div>
				</Flex>
			</PanelBody>
			<PanelBody>
				<BaseControl
					label={ __( 'For previously uploaded videos:' ) }
					id="previouslyUploaded"
				>
					<Button
						className="videopack-library-button no-vertical-align"
						variant="secondary"
						disabled={ ffmpeg_exists !== true }
					>
						{ __( 'Generate thumbnails' ) }
					</Button>
					<Button
						className="videopack-library-button no-vertical-align"
						variant="secondary"
						disabled={ ffmpeg_exists !== true }
					>
						{ __( 'Encode videos' ) }
					</Button>
				</BaseControl>
			</PanelBody>
			<PanelBody title={ __( 'Video quality' ) }>
				<div className="videopack-setting-radio-group">
					<RadioControl
						label={ __( 'Primary rate control:' ) }
						selected={ rate_control }
						onChange={ changeHandlerFactory.rate_control }
						options={ [
							{
								label: __( 'Constant Rate Factor' ),
								value: 'crf',
							},
							{ label: __( 'Average bitrate' ), value: 'abr' },
						] }
						disabled={ ffmpeg_exists !== true }
					/>
				</div>
				<BaseControl label={ __( 'Constant Rate Factors (CRF):' ) }>
					<RangeControl
						__next40pxDefaultSize
						label={ __( 'H.264' ) }
						value={ h264_CRF }
						className="videopack-settings-slider"
						onChange={ changeHandlerFactory.h264_CRF }
						min={ 0 }
						max={ 51 }
						step={ 1 }
						marks={ generateMarks( 'h264' ) }
						disabled={ ffmpeg_exists !== true }
					/>
					<RangeControl
						__next40pxDefaultSize
						label={ __( 'WEBM VP8' ) }
						value={ webm_CRF }
						className="videopack-settings-slider"
						onChange={ changeHandlerFactory.webm_CRF }
						min={ 4 }
						max={ 63 }
						step={ 1 }
						marks={ generateMarks( 'vp8' ) }
						disabled={ ffmpeg_exists !== true }
					/>
					<RangeControl
						__next40pxDefaultSize
						label={ __( 'OGV (qscale)' ) }
						value={ ogv_CRF }
						className="videopack-settings-slider"
						onChange={ changeHandlerFactory.ogv_CRF }
						min={ 1 }
						max={ 10 }
						step={ 1 }
						marks={ generateMarks( 'ogv' ) }
						disabled={ ffmpeg_exists !== true }
					/>
				</BaseControl>
				<BaseControl label={ __( 'Average bitrates:' ) }>
					<RangeControl
						__next40pxDefaultSize
						label={ __( 'bits per pixel' ) }
						value={ bitrate_multiplier }
						className="videopack-settings-slider"
						onChange={ changeHandlerFactory.bitrate_multiplier }
						min={ 0.01 }
						max={ 0.3 }
						step={ 0.01 }
						marks={ generateMarks( 'bpp' ) }
						disabled={ ffmpeg_exists !== true }
					/>
					<div className="videopack-setting-bitrate-examples">
						{ bitrates &&
							bitrates.map( ( text, index ) => (
								<span key={ index }>{ text }</span>
							) ) }
					</div>
				</BaseControl>
				<div className="videopack-setting-reduced-width">
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'H.264 profile' ) }
						value={ h264_profile }
						onChange={ changeHandlerFactory.h264_profile }
						options={ h264ProfileOptions }
						disabled={ ffmpeg_exists !== true }
					/>
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'H.264 level' ) }
						value={ h264_level }
						onChange={ changeHandlerFactory.h264_level }
						options={ h264LevelOptions }
						disabled={ ffmpeg_exists !== true }
					/>
				</div>
			</PanelBody>
			<PanelBody title={ __( 'Audio quality' ) }>
				<div className="videopack-setting-reduced-width">
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Audio bitrate:' ) }
						value={ audio_bitrate }
						onChange={ changeHandlerFactory.audio_bitrate }
						options={ audioBitrateOptions }
						suffix={
							<InputControlSuffixWrapper>
								kbps
							</InputControlSuffixWrapper>
						}
						disabled={ ffmpeg_exists !== true }
					/>
				</div>
				<ToggleControl
					__nextHasNoMarginBottom
					label={ __( 'Always output stereo audio.' ) }
					onChange={ changeHandlerFactory.audio_channels }
					checked={ audio_channels }
					disabled={ ffmpeg_exists !== true }
				/>
			</PanelBody>
			<PanelBody title={ __( 'Execution' ) }>
				<RangeControl
					__next40pxDefaultSize
					label={ __( 'Simultaneous encodes:' ) }
					value={ simultaneous_encodes }
					className="videopack-settings-slider"
					onChange={ changeHandlerFactory.simultaneous_encodes }
					min={ 1 }
					max={ 10 }
					step={ 1 }
					marks={ generateMarks( 'simultaneous' ) }
					disabled={ ffmpeg_exists !== true }
				/>
				<RangeControl
					__next40pxDefaultSize
					label={ __( 'Threads:' ) }
					value={ threads }
					className="videopack-settings-slider"
					onChange={ changeHandlerFactory.threads }
					min={ 0 }
					max={ 16 }
					step={ 1 }
					marks={ generateMarks( 'threads' ) }
					disabled={ ffmpeg_exists !== true }
				/>
				<ToggleControl
					__nextHasNoMarginBottom
					label={ __( 'Run nice.' ) }
					onChange={ changeHandlerFactory.nice }
					checked={ nice }
					disabled={ ffmpeg_exists !== true }
				/>
			</PanelBody>
			<PanelBody title={ __( 'Video Encoding Test' ) }>
				<SelectControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={ __( 'Test encode command:' ) }
					value={ sample_format }
					onChange={ changeHandlerFactory.sample_format }
					disabled={ ffmpeg_exists !== true }
				>
					{ sampleFormatOptions() }
				</SelectControl>
				<ToggleControl
					__nextHasNoMarginBottom
					label={ __( 'Test vertical video rotation.' ) }
					onChange={ changeHandlerFactory.sample_rotate }
					checked={ sample_rotate }
					disabled={ ffmpeg_exists !== true }
				/>
				<TextareaControl
					disabled={ true }
					value={ ffmpegTest?.command }
				/>
				<TextareaControl
					label={ __( 'FFmpeg test output:' ) }
					rows={ 20 }
					disabled={ true }
					value={ ffmpegTest?.output }
				/>
			</PanelBody>
		</>
	);
};

export default EncodingSettings;
