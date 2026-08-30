/* global videopack_config */

import { useMemo } from '@wordpress/element';
import { __, _x, sprintf } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import {
	BaseControl,
	CheckboxControl,
	Flex,
	FlexBlock,
	FlexItem,
	PanelBody,
	PanelRow,
	RadioControl,
	RangeControl,
	SelectControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { BlockContextProvider } from '@wordpress/block-editor';
import { volumeUp, volumeDown } from '../../../assets/icon';
import PreviewIframe from '../../../components/PreviewIframe/PreviewIframe';
import CompactColorPicker from '../../../components/CompactColorPicker/CompactColorPicker';
import { getColorFallbacks } from '../../../utils/colors';
import VideopackTooltip from './VideopackTooltip';
import WatermarkSettingsPanel from '../../../components/WatermarkSettingsPanel/WatermarkSettingsPanel';
import useResolutions from '../../../hooks/useResolutions';
import useStablePreviewBlocks from '../../../hooks/useStablePreviewBlocks';
import RealBlockPreview from '../../../components/RealBlockPreview';
import VideoPlayer from '../../../components/VideoPlayer/VideoPlayer';
import { getTitleInnerTemplate } from '../../../utils/titleDownloadBlock';

const PlayerSettings = ( { settings, setSettings, changeHandlerFactory } ) => {
	const {
		embed_method,
		overlay_title,
		watermark,
		watermark_styles,
		watermark_link_to,
		watermark_url,
		align,
		resize,
		auto_res,
		enable_custom_resolution,
		custom_resolution,
		pixel_ratio,
		find_formats,
		fullwidth,
		width,
		height,
		legacy_dimensions,
		fixed_aspect,
		controls,
		playsinline,
		pauseothervideos,
		volume,
		preload,
		skin,
		embeddable,
		embedcode,
		downloadlink,
		inline,
		view_count,
		autoplay,
		loop,
		muted,
		gifmode,
		playback_rate,
		skip_buttons,
		skip_forward,
		skip_backward,
		encode,
		right_click,
		click_download,
		play_button_color,
		play_button_secondary_color,
		control_bar_bg_color,
		control_bar_color,
		title_color,
		title_background_color,
	} = settings;

	const currentResolutions = useResolutions(
		enable_custom_resolution,
		custom_resolution
	);

	const changeGifmode = ( value ) => {
		setSettings( ( prevSettings ) => ( {
			...prevSettings,
			gifmode: value,
			autoplay: value,
			loop: value,
			muted: value,
		} ) );
		if ( value ) {
			setSettings( ( prevSettings ) => ( {
				...prevSettings,
				controls: false,
				embeddable: false,
				overlay_title: false,
				view_count: false,
				playsinline: true,
			} ) );
		} else {
			setSettings( ( prevSettings ) => ( {
				...prevSettings,
				controls: true,
				embeddable: true,
			} ) );
		}
	};

	const handleCodecCheckboxChange = ( codecId, isEnabled ) => {
		const newEncode = JSON.parse( JSON.stringify( settings.encode || {} ) );
		const { codecs, resolutions } = videopack_config;
		const codecInfo = codecs.find( ( c ) => c.id === codecId );

		if ( ! newEncode[ codecId ] ) {
			newEncode[ codecId ] = { resolutions: {} };
		}

		newEncode[ codecId ].enabled = !! isEnabled;

		if ( isEnabled && codecInfo ) {
			// Set default quality settings when enabling a codec for the first time
			if ( ! newEncode[ codecId ].rate_control ) {
				newEncode[ codecId ].rate_control =
					codecInfo.supported_rate_controls[ 0 ];
				newEncode[ codecId ].crf = codecInfo.rate_control.crf.default;
				newEncode[ codecId ].vbr = codecInfo.rate_control.vbr.default;
			}
		}

		if ( ! isEnabled ) {
			if ( ! newEncode[ codecId ].resolutions ) {
				newEncode[ codecId ].resolutions = {};
			}
			resolutions.forEach( ( resolution ) => {
				newEncode[ codecId ].resolutions[ resolution.id ] = false;
			} );
		}
		changeHandlerFactory.encode( newEncode );
	};

	const embedMethodOptions =
		/**
		 * Filters the list of available embed player methods (e.g. Video.js, MediaElement).
		 *
		 * @since 5.0.0
		 *
		 * @param {Array} options Array of embed options containing value and label.
		 */
		applyFilters( 'videopack_embed_method_options', [
			{
				value: 'Video.js',
				label: __( 'Video.js', 'video-embed-thumbnail-generator' ),
			},
			{
				value: 'WordPress Default',
				label: __(
					'WordPress Default',
					'video-embed-thumbnail-generator'
				),
			},
			{
				value: 'None',
				label: __( 'None', 'video-embed-thumbnail-generator' ),
			},
		] );

	const preloadOptions = [
		{
			value: 'auto',
			label: __( 'Auto', 'video-embed-thumbnail-generator' ),
		},
		{
			value: 'metadata',
			label: __( 'Metadata', 'video-embed-thumbnail-generator' ),
		},
		{
			value: 'none',
			label: _x( 'None', 'Preload value' ),
		},
	];

	// Video.js v8's skipButtons option only accepts 5, 10, or 30 seconds
	// (https://legacy.videojs.org/guides/options/#skipbuttons) — other
	// values are silently ignored by the player, so this is a select, not
	// free numeric entry.
	const skipSecondsOptions = [
		{
			value: 5,
			label: __( '5 seconds', 'video-embed-thumbnail-generator' ),
		},
		{
			value: 10,
			label: __( '10 seconds', 'video-embed-thumbnail-generator' ),
		},
		{
			value: 30,
			label: __( '30 seconds', 'video-embed-thumbnail-generator' ),
		},
	];

	const fixedAspectOptions = [
		{
			value: 'false',
			label: __( 'None', 'video-embed-thumbnail-generator' ),
		},
		{
			value: 'true',
			label: __( 'All', 'video-embed-thumbnail-generator' ),
		},
		{
			value: 'vertical',
			label: __( 'Vertical Videos', 'video-embed-thumbnail-generator' ),
		},
	];

	const watermarkLinkOptions = [
		{
			value: 'false',
			label: __( 'None', 'video-embed-thumbnail-generator' ),
		},
		{
			value: 'home',
			label: __( 'Home page', 'video-embed-thumbnail-generator' ),
		},
		{
			value: 'parent',
			label: __( 'Parent post', 'video-embed-thumbnail-generator' ),
		},
		{
			value: 'download',
			label: __( 'Download video', 'video-embed-thumbnail-generator' ),
		},
		{
			value: 'attachment',
			label: __(
				'Video attachment page',
				'video-embed-thumbnail-generator'
			),
		},
		{
			value: 'custom',
			label: __( 'Custom URL', 'video-embed-thumbnail-generator' ),
		},
	];

	const skinOptions = useMemo( () => {
		const options = [
			{
				value: 'vjs-theme-videopack',
				label: __( 'Videopack', 'video-embed-thumbnail-generator' ),
			},
			{
				value: 'kg-video-js-skin',
				label: __(
					'Videopack Classic',
					'video-embed-thumbnail-generator'
				),
			},
			{
				value: 'default',
				label: __(
					'Video.js default',
					'video-embed-thumbnail-generator'
				),
			},
			{
				value: 'vjs-theme-city',
				label: __( 'City', 'video-embed-thumbnail-generator' ),
			},
			{
				value: 'vjs-theme-fantasy',
				label: __( 'Fantasy', 'video-embed-thumbnail-generator' ),
			},
			{
				value: 'vjs-theme-forest',
				label: __( 'Forest', 'video-embed-thumbnail-generator' ),
			},
			{
				value: 'vjs-theme-sea',
				label: __( 'Sea', 'video-embed-thumbnail-generator' ),
			},
		];

		/**
		 * Filters the list of available player skins based on the selected embed method.
		 *
		 * @since 5.0.0
		 *
		 * @param {Array}  options      List of skin option structures.
		 * @param {string} embed_method The selected player embed method.
		 */
		return applyFilters(
			'videopack_player_skin_options',
			options,
			embed_method
		);
	}, [ embed_method ] );

	const alignOptions = [
		{
			value: '',
			label: videopack_config.contentSize
				? sprintf(
						/* translators: %s: Content size in pixels. */
						__(
							"None (use theme's default width: %s)",
							'video-embed-thumbnail-generator'
						),
						videopack_config.contentSize
				  )
				: __(
						"None (use theme's default width)",
						'video-embed-thumbnail-generator'
				  ),
		},
		{
			value: 'wide',
			label: videopack_config.wideSize
				? sprintf(
						/* translators: %s: Wide size in pixels. */
						__(
							"Wide (use theme's wide width: %s)",
							'video-embed-thumbnail-generator'
						),
						videopack_config.wideSize
				  )
				: __(
						"Wide (use theme's wide width)",
						'video-embed-thumbnail-generator'
				  ),
		},
		{
			value: 'full',
			label: __( 'Full width', 'video-embed-thumbnail-generator' ),
		},
		{
			value: 'left',
			label: __( 'Left', 'video-embed-thumbnail-generator' ),
		},
		{
			value: 'center',
			label: __( 'Center', 'video-embed-thumbnail-generator' ),
		},
		{
			value: 'right',
			label: __( 'Right', 'video-embed-thumbnail-generator' ),
		},
	];

	const autoResOptions = () => {
		const items = [
			{
				value: 'automatic',
				label: __( 'Automatic', 'video-embed-thumbnail-generator' ),
			},
			{
				value: 'highest',
				label: __( 'Highest', 'video-embed-thumbnail-generator' ),
			},
			{
				value: 'lowest',
				label: __( 'Lowest', 'video-embed-thumbnail-generator' ),
			},
		];

		currentResolutions.forEach( ( resolution ) => {
			items.push( {
				value: resolution.id,
				label: resolution.name,
			} );
		} );

		return items;
	};

	const watermarkSettings = {
		url: watermark,
		...watermark_styles,
	};

	const handleWatermarkChange = ( newSettings ) => {
		const { url, ...styles } = newSettings;
		if ( url !== undefined ) {
			changeHandlerFactory.watermark( url );
		}
		changeHandlerFactory.watermark_styles( {
			...watermark_styles,
			...styles,
		} );
	};

	const PLAYER_COLOR_FALLBACKS = useMemo(
		() => getColorFallbacks( settings ),
		[ settings ]
	);

	const showPlayButtonColors = applyFilters(
		'videopack.videoSettings.showPlayButtonColors',
		true,
		settings
	);

	// skip_buttons only works with classic Video.js v8 (skipButtons is a
	// Video.js player option, only accepting 5/10/30 second values —
	// https://legacy.videojs.org/guides/options/#skipbuttons). Neither
	// MediaElement.js/WordPress Default nor Video.js v10 (which always shows
	// its own skip buttons regardless, with no configuration hook to match
	// this setting to) support it, so this only shows for the exact 'Video.js'
	// embed method rather than every Video.js-flavored one.
	const showSkipButtons = applyFilters(
		'videopack.videoSettings.showSkipButtons',
		embed_method === 'Video.js',
		settings
	);

	// Real attributes for the actual <VideoPlayer> instance — deliberately
	// the real, final URL rather than player-container/block.json's
	// 'videopack-preview-video' placeholder default — that string only
	// exists so a freshly-inserted real player-container block can swap
	// itself to a demo video via its own edit.js effect, which would
	// otherwise cascade REST requests here on every keystroke.
	const playerAttributes = useMemo(
		() => ( {
			src: `${ videopack_config.url }/src/images/Adobestock_469037984.mp4`,
			title: 'Sample Video',
			overlay_title: !! overlay_title,
			isPreview: true,
			embedlink: 'https://www.website.com/embed/',
			caption: __(
				"If text is entered in the attachment's caption field it is displayed here automatically."
			),
		} ),
		[ overlay_title ]
	);

	const previewContext = useMemo( () => {
		const ctx = {
			'videopack/isInsidePlayerContainer': true,
			'videopack/isPreview': true,
		};
		// Add fallbacks first
		Object.keys( PLAYER_COLOR_FALLBACKS ).forEach( ( key ) => {
			ctx[ `videopack/${ key }` ] = PLAYER_COLOR_FALLBACKS[ key ];
		} );
		// Override with actual settings
		Object.keys( settings ).forEach( ( key ) => {
			if (
				settings[ key ] !== undefined &&
				settings[ key ] !== null &&
				settings[ key ] !== ''
			) {
				ctx[ `videopack/${ key }` ] = settings[ key ];
			}
		} );

		// Flatten watermark styles for blocks that expect individual attributes
		if ( settings.watermark_styles ) {
			Object.entries( settings.watermark_styles ).forEach(
				( [ key, val ] ) => {
					const contextKey = key.startsWith( 'watermark_' )
						? key
						: `watermark_${ key }`;
					ctx[ `videopack/${ contextKey }` ] = val;
				}
			);
		}

		// Title/download/share blocks (rendered separately via
		// RealBlockPreview, not as real InnerBlocks descendants of a
		// player-container/player block) get the sample video's actual data
		// — title, caption, embedlink — only through this ambient context,
		// since useVideopackData reads context, not a block's own saved
		// attribute. See VideoTitle.js.
		Object.keys( playerAttributes ).forEach( ( key ) => {
			ctx[ `videopack/${ key }` ] = playerAttributes[ key ];
		} );

		return ctx;
	}, [ settings, PLAYER_COLOR_FALLBACKS, playerAttributes ] );

	// The sample player itself is rendered directly via <VideoPlayer> (see
	// JSX below), not through useBlockPreview/RealBlockPreview — that hook
	// applies useDisabled() to everything it renders, which would leave the
	// sample video permanently unplayable and hide Video.js's control-bar
	// colors (only visible once playback has actually started). Only the
	// overlay chrome (title/watermark) and view-count, which don't need to
	// be interactive, go through RealBlockPreview — mirroring
	// AttachmentPreview.js's established pattern for the same tradeoff.
	const showTitleBar = !! (
		overlay_title ||
		downloadlink ||
		( embeddable && embedcode )
	);

	const overlayTemplate = useMemo( () => {
		const template = [];
		if ( showTitleBar ) {
			template.push( [
				'videopack/title',
				{ overlay_title: !! overlay_title, showBackground: true },
				getTitleInnerTemplate(
					!! downloadlink,
					!! ( embeddable && embedcode )
				),
			] );
		}
		if ( watermark ) {
			template.push( [ 'videopack/watermark', {} ] );
		}
		return template;
	}, [
		showTitleBar,
		overlay_title,
		downloadlink,
		embeddable,
		embedcode,
		watermark,
	] );
	const overlayBlocks = useStablePreviewBlocks( overlayTemplate );

	const viewCountTemplate = useMemo( () => {
		if ( ! view_count ) {
			return [];
		}
		return [ [ 'videopack/view-count', {} ] ];
	}, [ view_count ] );
	const viewCountBlocks = useStablePreviewBlocks( viewCountTemplate );

	// Title/Watermark render inside VideoPlayer's overlay chrome, so they
	// need the extra isInsidePlayerOverlay context their real edit.js
	// components check for — view-count (rendered as a sibling, outside
	// VideoPlayer) uses previewContext directly instead.
	const playerOverlayContext = useMemo(
		() => ( {
			...previewContext,
			'videopack/isInsidePlayerOverlay': true,
		} ),
		[ previewContext ]
	);

	// Mirrors player-container/edit.js's own effectiveAlign resolution so
	// the sample player keeps the same width/alignment behavior now that
	// it's no longer rendered through that block's own edit.js.
	const effectiveAlign = align || videopack_config?.options?.align || '';

	return (
		<>
			<PanelBody>
				<div className="videopack-grid-row-align">
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __(
							'Video player',
							'video-embed-thumbnail-generator'
						) }
						value={ embed_method }
						onChange={ ( value ) => {
							changeHandlerFactory.embed_method( value );
							/**
							 * Filters the default skin applied when selecting a player method.
							 *
							 * @since 5.0.0
							 *
							 * @param {string|undefined} default_skin Skin identifier.
							 * @param {string}           value        The selected player method name.
							 */
							const defaultSkin = applyFilters(
								'videopack_default_skin',
								value === 'WordPress Default'
									? 'vjs-theme-videopack'
									: undefined,
								value
							);
							if ( defaultSkin ) {
								changeHandlerFactory.skin( defaultSkin );
							}
						} }
						options={ embedMethodOptions }
					/>
					<VideopackTooltip
						text={ __(
							'Video.js version 8 is the default player. You can also choose the WordPress Default Mediaelement.js player which may already be skinned to match your theme. Selecting "None" outputs a plain, unenhanced video tag, but does not currently prevent the plugin\'s CSS or JS from loading on the front end.',
							'video-embed-thumbnail-generator'
						) }
					/>
				</div>
			</PanelBody>
			<PanelBody>
				<div
					className={ `videopack-sample-video-player align${
						align || 'none'
					}` }
					style={ {
						'--wp--style--global--content-size':
							videopack_config.contentSize || '800px',
						'--wp--style--global--wide-size':
							videopack_config.wideSize || '1000px',
					} }
				>
					<PanelRow>
						<Flex className="videopack-flex-bottom">
							<FlexBlock>
								<ToggleControl
									__nextHasNoMarginBottom
									label={ __(
										'Title',
										'video-embed-thumbnail-generator'
									) }
									onChange={
										changeHandlerFactory.overlay_title
									}
									checked={ !! overlay_title }
								/>
							</FlexBlock>
							<FlexBlock>
								<ToggleControl
									__nextHasNoMarginBottom
									label={ __(
										'Download',
										'video-embed-thumbnail-generator'
									) }
									onChange={
										changeHandlerFactory.downloadlink
									}
									checked={ !! downloadlink }
								/>
							</FlexBlock>
							<FlexBlock>
								<FlexItem>
									<ToggleControl
										__nextHasNoMarginBottom
										label={ __(
											'Share',
											'video-embed-thumbnail-generator'
										) }
										onChange={
											changeHandlerFactory.embedcode
										}
										checked={ !! embedcode }
										disabled={ ! embeddable }
									/>
								</FlexItem>
							</FlexBlock>
						</Flex>
					</PanelRow>
					<PreviewIframe
						title={ __(
							'Video Player Preview',
							'video-embed-thumbnail-generator'
						) }
						resizeDependencies={ [ align ] }
					>
						<div
							className={ `wp-block-videopack-player-container${
								effectiveAlign
									? ` align${ effectiveAlign }`
									: ''
							}` }
						>
							<VideoPlayer
								attributes={ playerAttributes }
								context={ previewContext }
							>
								{ overlayBlocks.length > 0 && (
									<BlockContextProvider
										value={ playerOverlayContext }
									>
										<RealBlockPreview
											blocks={ overlayBlocks }
										/>
									</BlockContextProvider>
								) }
							</VideoPlayer>
							{ viewCountBlocks.length > 0 && (
								<BlockContextProvider value={ previewContext }>
									<RealBlockPreview
										blocks={ viewCountBlocks }
									/>
								</BlockContextProvider>
							) }
						</div>
					</PreviewIframe>

					<PanelRow className="videopack-flex-right">
						<ToggleControl
							__nextHasNoMarginBottom
							label={ __(
								'View count',
								'video-embed-thumbnail-generator'
							) }
							onChange={ changeHandlerFactory.view_count }
							checked={ !! view_count }
						/>
					</PanelRow>
				</div>
			</PanelBody>
			<PanelBody
				title={ __( 'Design', 'video-embed-thumbnail-generator' ) }
			>
				{ embed_method.startsWith( 'Video.js' ) && (
					<div className="videopack-grid-row-align">
						<SelectControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={ __(
								'Skin',
								'video-embed-thumbnail-generator'
							) }
							value={ skin }
							onChange={ changeHandlerFactory.skin }
							options={ skinOptions }
						/>
					</div>
				) }

				<div className="videopack-color-section">
					<p className="videopack-settings-section-title">
						{ __(
							'Title overlay',
							'video-embed-thumbnail-generator'
						) }
					</p>
					<div className="videopack-color-flex-row">
						<div className="videopack-color-flex-item">
							<CompactColorPicker
								label={ __(
									'Text',
									'video-embed-thumbnail-generator'
								) }
								value={ title_color }
								onChange={ changeHandlerFactory.title_color }
								colors={ videopack_config.themeColors }
								fallbackValue={
									PLAYER_COLOR_FALLBACKS.title_color
								}
							/>
						</div>
						<div className="videopack-color-flex-item">
							<CompactColorPicker
								label={ __(
									'Background',
									'video-embed-thumbnail-generator'
								) }
								value={ title_background_color }
								onChange={
									changeHandlerFactory.title_background_color
								}
								colors={ videopack_config.themeColors }
								fallbackValue={
									PLAYER_COLOR_FALLBACKS.title_background_color
								}
							/>
						</div>
					</div>
				</div>

				<div className="videopack-color-section">
					<p className="videopack-settings-section-title">
						{ __( 'Player', 'video-embed-thumbnail-generator' ) }
					</p>
					<div className="videopack-color-flex-row">
						{ showPlayButtonColors && (
							<>
								<div className="videopack-color-flex-item">
									<CompactColorPicker
										label={
											embed_method === 'WordPress Default'
												? __(
														'Play Button Color',
														'video-embed-thumbnail-generator'
												  )
												: __(
														'Play Button Icon',
														'video-embed-thumbnail-generator'
												  )
										}
										value={ play_button_color }
										onChange={
											changeHandlerFactory.play_button_color
										}
										colors={ videopack_config.themeColors }
										fallbackValue={
											PLAYER_COLOR_FALLBACKS.play_button_color
										}
									/>
								</div>
								<div className="videopack-color-flex-item">
									<CompactColorPicker
										label={
											embed_method === 'WordPress Default'
												? __(
														'Play Button Hover',
														'video-embed-thumbnail-generator'
												  )
												: __(
														'Play Button Accent',
														'video-embed-thumbnail-generator'
												  )
										}
										value={ play_button_secondary_color }
										onChange={
											changeHandlerFactory.play_button_secondary_color
										}
										colors={ videopack_config.themeColors }
										fallbackValue={
											PLAYER_COLOR_FALLBACKS.play_button_secondary_color
										}
									/>
								</div>
							</>
						) }
						<div className="videopack-color-flex-item">
							<CompactColorPicker
								label={ __(
									'Control Bar Background',
									'video-embed-thumbnail-generator'
								) }
								value={ control_bar_bg_color }
								onChange={
									changeHandlerFactory.control_bar_bg_color
								}
								colors={ videopack_config.themeColors }
								fallbackValue={
									PLAYER_COLOR_FALLBACKS.control_bar_bg_color
								}
							/>
						</div>
						<div className="videopack-color-flex-item">
							<CompactColorPicker
								label={ __(
									'Control Bar Icons',
									'video-embed-thumbnail-generator'
								) }
								value={ control_bar_color }
								onChange={
									changeHandlerFactory.control_bar_color
								}
								colors={ videopack_config.themeColors }
								fallbackValue={
									PLAYER_COLOR_FALLBACKS.control_bar_color
								}
							/>
						</div>
					</div>
				</div>
			</PanelBody>
			<PanelBody
				title={ __(
					'Default Playback',
					'video-embed-thumbnail-generator'
				) }
				initialOpen={ true }
				className="videopack-setting-default-playback"
			>
				<Flex
					align-items="flex-start"
					expanded={ false }
					gap={ 20 }
					justify="flex-start"
					className="videopack-player-settings-flex"
				>
					<FlexItem>
						<ToggleControl
							__nextHasNoMarginBottom
							label={ __(
								'Autoplay',
								'video-embed-thumbnail-generator'
							) }
							onChange={ changeHandlerFactory.autoplay }
							checked={ !! autoplay }
							disabled={ gifmode }
							help={ __(
								'Most browsers will only autoplay if the video starts muted.'
							) }
						/>
						<ToggleControl
							__nextHasNoMarginBottom
							label={ __(
								'Pause other videos on page when starting a new video',
								'video-embed-thumbnail-generator'
							) }
							onChange={ changeHandlerFactory.pauseothervideos }
							checked={ !! pauseothervideos }
							disabled={ gifmode }
						/>
						<ToggleControl
							__nextHasNoMarginBottom
							label={ __(
								'Loop',
								'video-embed-thumbnail-generator'
							) }
							onChange={ changeHandlerFactory.loop }
							checked={ !! loop }
							disabled={ gifmode }
						/>
						<ToggleControl
							__nextHasNoMarginBottom
							label={ __(
								'Muted',
								'video-embed-thumbnail-generator'
							) }
							onChange={ changeHandlerFactory.muted }
							checked={ !! muted }
							disabled={ gifmode }
						/>
						<RangeControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							className="videopack-volume-control"
							label={ __(
								'Volume',
								'video-embed-thumbnail-generator'
							) }
							value={ volume }
							beforeIcon={ volumeDown }
							afterIcon={ volumeUp }
							initialPosition={ 1 }
							withInputField={ false }
							onChange={ changeHandlerFactory.volume }
							min={ 0 }
							max={ 1 }
							step={ 0.05 }
							disabled={ muted || gifmode }
						/>
					</FlexItem>
					<FlexItem>
						<ToggleControl
							__nextHasNoMarginBottom
							label={ __(
								'Controls',
								'video-embed-thumbnail-generator'
							) }
							onChange={ changeHandlerFactory.controls }
							checked={ !! controls }
							disabled={ gifmode }
						/>

						<ToggleControl
							__nextHasNoMarginBottom
							label={ __(
								'Play inline',
								'video-embed-thumbnail-generator'
							) }
							onChange={ changeHandlerFactory.playsinline }
							checked={ !! playsinline }
							disabled={ gifmode }
							help={ __(
								'Plays inline instead of fullscreen on iPhones.'
							) }
						/>

						<ToggleControl
							__nextHasNoMarginBottom
							label={ __(
								'Variable speeds',
								'video-embed-thumbnail-generator'
							) }
							onChange={ changeHandlerFactory.playback_rate }
							disabled={ gifmode }
							checked={ !! playback_rate }
						/>
						{ showSkipButtons && (
							<div className="videopack-control-with-tooltip">
								<ToggleControl
									__nextHasNoMarginBottom
									label={ __(
										'Skip buttons',
										'video-embed-thumbnail-generator'
									) }
									onChange={
										changeHandlerFactory.skip_buttons
									}
									checked={ !! skip_buttons }
									disabled={ gifmode }
								/>
								<VideopackTooltip
									text={ __(
										'Adds buttons to skip forward and backward in the video by a set number of seconds.',
										'video-embed-thumbnail-generator'
									) }
								/>
							</div>
						) }
						{ showSkipButtons && skip_buttons && (
							<>
								<span className="videopack-setting-auto-width">
									<SelectControl
										__nextHasNoMarginBottom
										__next40pxDefaultSize
										label={ __(
											'Skip backward',
											'video-embed-thumbnail-generator'
										) }
										value={ skip_backward }
										onChange={ ( value ) =>
											changeHandlerFactory.skip_backward(
												parseInt( value, 10 )
											)
										}
										options={ skipSecondsOptions }
										disabled={ gifmode }
									/>
								</span>
								<span className="videopack-setting-auto-width">
									<SelectControl
										__nextHasNoMarginBottom
										__next40pxDefaultSize
										label={ __(
											'Skip forward',
											'video-embed-thumbnail-generator'
										) }
										value={ skip_forward }
										onChange={ ( value ) =>
											changeHandlerFactory.skip_forward(
												parseInt( value, 10 )
											)
										}
										options={ skipSecondsOptions }
										disabled={ gifmode }
									/>
								</span>
							</>
						) }
						<RadioControl
							label={
								<span className="videopack-label-with-tooltip">
									{ __(
										'Preload',
										'video-embed-thumbnail-generator'
									) }
									<VideopackTooltip
										text={ __(
											'Controls how much of a video to load before the user starts playback. Mobile browsers never preload any video information. Selecting "metadata" will load the height and width and format information along with a few seconds of the video in some desktop browsers. "Auto" will preload nearly a minute of video in most desktop browsers. "None" will prevent all data from preloading.',
											'video-embed-thumbnail-generator'
										) }
									/>
								</span>
							}
							selected={ preload }
							onChange={ changeHandlerFactory.preload }
							options={ preloadOptions }
							disabled={ gifmode }
						/>
					</FlexItem>
				</Flex>
				<div className="videopack-control-with-tooltip">
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __(
							'GIF mode',
							'video-embed-thumbnail-generator'
						) }
						onChange={ ( value ) => {
							changeGifmode( value );
						} }
						checked={ !! gifmode }
					/>
					<VideopackTooltip
						text={ __(
							'Video acts like an animated GIF. Enables autoplay, loop, mute, and disables controls.',
							'video-embed-thumbnail-generator'
						) }
					/>
				</div>
			</PanelBody>
			{ applyFilters(
				/**
				 * Action filter hook to render custom settings components after playback options.
				 *
				 * @since 5.0.0
				 *
				 * @param {null}   empty   Null context value.
				 * @param {Object} context Object containing settings and changeHandlerFactory.
				 */
				'videopack.settings.player.after_playback',
				null,
				{ settings, changeHandlerFactory }
			) }
			<PanelBody
				title={ __( 'Dimensions', 'video-embed-thumbnail-generator' ) }
				initialOpen={ true }
			>
				<div className="videopack-grid-row-align">
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __(
							'Alignment / Width',
							'video-embed-thumbnail-generator'
						) }
						value={ align }
						onChange={ changeHandlerFactory.align }
						options={ alignOptions }
					/>
				</div>
				<RadioControl
					label={
						<span className="videopack-label-with-tooltip">
							{ __(
								'Constrain to default aspect ratio',
								'video-embed-thumbnail-generator'
							) }
							<VideopackTooltip
								text={ __(
									'When set to "none," the video player will automatically adjust to the aspect ratio of the video, but in some cases a fixed aspect ratio is required, and vertical videos often fit better on the page when shown in a shorter window.',
									'video-embed-thumbnail-generator'
								) }
							/>
						</span>
					}
					selected={ fixed_aspect }
					onChange={ changeHandlerFactory.fixed_aspect }
					options={ fixedAspectOptions }
					className="videopack-setting-radio-group"
				/>
				<ToggleControl
					__nextHasNoMarginBottom
					label={ __(
						'Use legacy dimension settings',
						'video-embed-thumbnail-generator'
					) }
					onChange={ changeHandlerFactory.legacy_dimensions }
					checked={ !! legacy_dimensions }
				/>
				{ legacy_dimensions && (
					<>
						<span className="videopack-setting-auto-width">
							<TextControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label={ __(
									'Width',
									'video-embed-thumbnail-generator'
								) }
								type="number"
								value={ width }
								onChange={ changeHandlerFactory.width }
							/>
						</span>
						<span className="videopack-setting-auto-width">
							<TextControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label={ __(
									'Height',
									'video-embed-thumbnail-generator'
								) }
								type="number"
								value={ height }
								onChange={ changeHandlerFactory.height }
							/>
						</span>
						<ToggleControl
							__nextHasNoMarginBottom
							label={ __(
								'Make video display inline',
								'video-embed-thumbnail-generator'
							) }
							onChange={ changeHandlerFactory.inline }
							checked={ !! inline }
						/>
						<Flex
							direction="column"
							expanded={ false }
							align="flex-start"
							justify="flex-start"
						>
							<FlexItem>
								<ToggleControl
									__nextHasNoMarginBottom
									label={ __(
										'Shrink player to fit container',
										'video-embed-thumbnail-generator'
									) }
									onChange={ changeHandlerFactory.resize }
									checked={ !! resize }
								/>
								<div className="videopack-control-with-tooltip">
									<ToggleControl
										__nextHasNoMarginBottom
										label={ __(
											'Expand player to full width of container',
											'video-embed-thumbnail-generator'
										) }
										onChange={
											changeHandlerFactory.fullwidth
										}
										checked={ !! fullwidth }
									/>
									<VideopackTooltip
										text={ __(
											"Enabling this will ignore any other width settings and set the width of the video to the width of the container it's in.",
											'video-embed-thumbnail-generator'
										) }
									/>
								</div>
							</FlexItem>
						</Flex>
					</>
				) }
				<div className="videopack-grid-row-align">
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __(
							'Default resolution',
							'video-embed-thumbnail-generator'
						) }
						value={ auto_res }
						onChange={ changeHandlerFactory.auto_res }
						options={ autoResOptions() }
					/>
					<VideopackTooltip
						text={ __(
							'If multiple resolutions for a video are available, you can choose to load the highest or lowest available resolution by default, automatically select the resolution based on the size of the video window, or indicate a particular resolution to use every time.',
							'video-embed-thumbnail-generator'
						) }
					/>
				</div>
				<div className="videopack-control-with-tooltip">
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __(
							'Use device pixel ratio for resolution calculation',
							'video-embed-thumbnail-generator'
						) }
						onChange={ changeHandlerFactory.pixel_ratio }
						checked={ !! pixel_ratio }
					/>
					<VideopackTooltip
						text={ __(
							'Most modern mobile devices and some very high-resolution desktop displays (what Apple calls a Retina display) use a pixel ratio to calculate the size of their viewport. Using the pixel ratio can result in a higher resolution being selected on mobile devices than on desktop devices. Because these devices actually have extremely high resolutions, and in a responsive design the video player usually takes up more of the screen than on a desktop browser, this is not a mistake, but your users might prefer to use less mobile data.',
							'video-embed-thumbnail-generator'
						) }
					/>
				</div>
			</PanelBody>
			{ applyFilters(
				/**
				 * Action filter hook to render custom settings components after dimensions options.
				 *
				 * @since 5.0.0
				 *
				 * @param {null}   empty   Null context value.
				 * @param {Object} context Object containing settings and changeHandlerFactory.
				 */
				'videopack.settings.player.after_dimensions',
				null,
				{ settings, changeHandlerFactory }
			) }
			<PanelBody
				title={ __( 'Sharing', 'video-embed-thumbnail-generator' ) }
				initialOpen={ true }
			>
				<ToggleControl
					__nextHasNoMarginBottom
					label={ __(
						'Allow users to embed your videos on other sites'
					) }
					onChange={ changeHandlerFactory.embeddable }
					checked={ !! embeddable }
				/>
				<div className="videopack-control-with-tooltip">
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __(
							'Allow right-clicking on videos',
							'video-embed-thumbnail-generator'
						) }
						onChange={ changeHandlerFactory.right_click }
						checked={ !! right_click }
					/>
					<VideopackTooltip
						text={ __(
							"We can't prevent a user from simply saving the downloaded video file from the browser's cache, but disabling right-clicking will make it more difficult for casual users to save your videos.",
							'video-embed-thumbnail-generator'
						) }
					/>
				</div>
				<div className="videopack-control-with-tooltip">
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __(
							'Allow single-click download links',
							'video-embed-thumbnail-generator'
						) }
						onChange={ changeHandlerFactory.click_download }
						checked={ !! click_download }
					/>
					<VideopackTooltip
						text={ __(
							"Videopack creates a one-click method for users who want to allow easy video downloading, but if some of your videos are hidden or private, depending on the methods you use, someone who guesses a video's WordPress database ID could potentially use the method to download videos they might not otherwise have access to.",
							'video-embed-thumbnail-generator'
						) }
					/>
				</div>
			</PanelBody>
			{ applyFilters(
				/**
				 * Action filter hook to render custom settings components after sharing options.
				 *
				 * @since 5.0.0
				 *
				 * @param {null}   empty   Null context value.
				 * @param {Object} context Object containing settings and changeHandlerFactory.
				 */
				'videopack.settings.player.after_sharing',
				null,
				{ settings, changeHandlerFactory }
			) }
			<WatermarkSettingsPanel
				title={ __(
					'Watermark Overlay',
					'video-embed-thumbnail-generator'
				) }
				watermarkSettings={ watermarkSettings }
				onChange={ handleWatermarkChange }
				initialOpen={ true }
			>
				{ watermark && (
					<div className="videopack-grid-row-align">
						<SelectControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={ __(
								'Link to',
								'video-embed-thumbnail-generator'
							) }
							value={ watermark_link_to }
							onChange={ changeHandlerFactory.watermark_link_to }
							options={ watermarkLinkOptions }
						/>
						{ watermark_link_to === 'custom' && (
							<TextControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label={ __(
									'URL',
									'video-embed-thumbnail-generator'
								) }
								type="url"
								value={ watermark_url }
								onChange={ changeHandlerFactory.watermark_url }
							/>
						) }
					</div>
				) }
			</WatermarkSettingsPanel>
			{ applyFilters(
				/**
				 * Action filter hook to render custom settings components after watermark options.
				 *
				 * @since 5.0.0
				 *
				 * @param {null}   empty   Null context value.
				 * @param {Object} context Object containing settings and changeHandlerFactory.
				 */
				'videopack.settings.player.after_watermark',
				null,
				{ settings, changeHandlerFactory }
			) }
			<PanelBody
				title={ __(
					'Video Sources',
					'video-embed-thumbnail-generator'
				) }
			>
				<ToggleControl
					__nextHasNoMarginBottom
					label={ __(
						'Enable custom resolution',
						'video-embed-thumbnail-generator'
					) }
					onChange={ changeHandlerFactory.enable_custom_resolution }
					checked={ !! enable_custom_resolution }
				/>
				{ enable_custom_resolution && (
					<div className="videopack-setting-auto-width">
						<TextControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={ __(
								'Custom Resolution Height',
								'video-embed-thumbnail-generator'
							) }
							type="number"
							min={ 2 }
							value={ custom_resolution || '' }
							onChange={ ( value ) =>
								changeHandlerFactory.custom_resolution(
									value === '' ? 0 : parseInt( value, 10 )
								)
							}
						/>
					</div>
				) }
				<div className="videopack-control-with-tooltip">
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __(
							'Automatically search for other formats of original file.',
							'video-embed-thumbnail-generator'
						) }
						onChange={ changeHandlerFactory.find_formats }
						checked={ !! find_formats }
					/>

					<VideopackTooltip
						text={ __(
							'Videos encoded by Videopack or manually assigned in the Media Library will always be found, but if this setting is enabled for a video named video.mp4, the player will also search for files with the naming pattern basename-codec_resolution. Eg: video-h264_720.mp4, video-vp9_1080.mp4, etc. Legacy filename structures (video-720.mp4, video-1080.mp4, etc.) are still supported.',
							'video-embed-thumbnail-generator'
						) }
					/>
				</div>
				<BaseControl
					label={ __(
						'Available Formats',
						'video-embed-thumbnail-generator'
					) }
					id="videopack-find-formats-codecs"
					className="videopack-setting-checkbox-group videopack-setting-extra-margin"
				>
					<div>
						{ videopack_config.codecs.map( ( codec ) => (
							<CheckboxControl
								key={ codec.id }
								__nextHasNoMarginBottom
								label={ codec.name }
								checked={ !! encode?.[ codec.id ]?.enabled }
								onChange={ ( isChecked ) =>
									handleCodecCheckboxChange(
										codec.id,
										isChecked
									)
								}
							/>
						) ) }
					</div>
				</BaseControl>
			</PanelBody>
			{ applyFilters(
				/**
				 * Action filter hook to render custom settings components after sources options.
				 *
				 * @since 5.0.0
				 *
				 * @param {null}   empty   Null context value.
				 * @param {Object} context Object containing settings and changeHandlerFactory.
				 */
				'videopack.settings.player.after_sources',
				null,
				{ settings, changeHandlerFactory }
			) }
		</>
	);
};

export default PlayerSettings;
