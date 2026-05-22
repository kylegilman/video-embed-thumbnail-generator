/* global videopack_config */
import { useMemo, useState, useEffect, useRef, createPortal } from '@wordpress/element';
import {
	useBlockProps,
	BlockControls,
	BlockVerticalAlignmentControl,
	AlignmentControl,
	InspectorControls,
} from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton, PanelBody, ToggleControl } from '@wordpress/components';
import { Icon, mediaAndText, notAllowed as noneIcon } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import {
	shareAlt1,
	shareAlt2,
	shareAlt3,
	share as shareIcon,
	close as closeIcon,
	embed as embedIcon,
	copyLink,
	bluesky,
	threads,
	facebook,
	reddit,
	email,
} from '../../assets/icon';
import CompactColorPicker from '../../components/CompactColorPicker/CompactColorPicker';
import { getColorFallbacks } from '../../utils/colors';
import useVideopackContext from '../../hooks/useVideopackContext';

/**
 * Edit component for the Videopack Video Share block.
 *
 * @param {Object}   root0               Component props.
 * @param {Object}   root0.attributes    Block attributes.
 * @param {Function} root0.setAttributes Attribute setter.
 * @param {Object}   root0.context       Block context.
 * @return {Element}                     The rendered component.
 */
export default function Edit( { attributes, setAttributes, context, isSelected } ) {
	const vpContext = useVideopackContext( attributes, context );

	const {
		iconType = 'share',
		showText = false,
		styleType = 'text',
		textAlign,
		title_color,
		title_background_color,
		shareCopyLink = true,
		shareNativeShare = true,
		shareBluesky = true,
		shareThreads = true,
		shareFacebook = true,
		shareReddit = true,
		shareEmail = true,
	} = attributes;

	const isInsideThumbnail = !! context[ 'videopack/isInsideThumbnail' ];
	const isInsidePlayerOverlay = !! context[ 'videopack/isInsidePlayerOverlay' ];
	const isInsideTitleMeta = !! context[ 'videopack/isInsideTitleMeta' ];
	const isOverlay =
		isInsideThumbnail || ( isInsidePlayerOverlay && ! isInsideTitleMeta );
	const shouldPortal = isInsideThumbnail || isInsidePlayerOverlay || isInsideTitleMeta;

	const colorFallbacks = useMemo(
		() =>
			getColorFallbacks( {
				title_color: vpContext.resolved.title_color,
				title_background_color: vpContext.resolved.title_background_color,
			} ),
		[
			vpContext.resolved.title_color,
			vpContext.resolved.title_background_color,
		]
	);

	const defaultAlign = useMemo( () => {
		if ( isInsideThumbnail ) {
			return 'center';
		}
		return 'left';
	}, [ isInsideThumbnail ] );

	const finalTextAlign = textAlign || context[ 'videopack/textAlign' ] || defaultAlign;
	const position = attributes.position || context[ 'videopack/position' ] || 'top';

	const blockProps = useBlockProps( {
		className: `videopack-share-block videopack-share-wrapper ${ vpContext.classes } ${
			isOverlay ? `is-overlay position-${ position }` : ''
		} ${ isInsideThumbnail ? 'is-inside-thumbnail' : '' } ${
			isInsidePlayerOverlay ? 'is-inside-player' : ''
		} ${ isInsideTitleMeta ? 'is-inside-title-meta' : '' } has-text-align-${ finalTextAlign }`,
		style: {
			...vpContext.style,
			display: 'inline-flex',
			alignItems: 'center',
		},
	} );

	const THEME_COLORS = videopack_config?.themeColors;

	const [ isOpen, setIsOpen ] = useState( false );
	const menuContainerRef = useRef( null );
	const [ portalTarget, setPortalTarget ] = useState( null );

	useEffect( () => {
		if ( shouldPortal && menuContainerRef.current ) {
			const target = menuContainerRef.current.closest( '.wp-block-videopack-player' ) ||
				menuContainerRef.current.closest( '.wp-block-videopack-player-container' ) ||
				menuContainerRef.current.closest( '.videopack-player' ) ||
				menuContainerRef.current.closest( '.videopack-player-relative-wrapper' ) ||
				menuContainerRef.current.closest( '.videopack-thumbnail-wrapper' ) ||
				menuContainerRef.current.closest( '.videopack-video-block-container' ) ||
				menuContainerRef.current.closest( '.videopack-collection-item' ) ||
				menuContainerRef.current.parentElement;
			setPortalTarget( target );
		}
	}, [ shouldPortal, isOpen ] );

	const combinedRef = ( node ) => {
		menuContainerRef.current = node;
		if ( blockProps.ref ) {
			if ( typeof blockProps.ref === 'function' ) {
				blockProps.ref( node );
			} else if ( typeof blockProps.ref === 'object' ) {
				blockProps.ref.current = node;
			}
		}
	};

	useEffect( () => {
		if ( ! isOpen ) {
			return undefined;
		}
		const handleOutside = ( event ) => {
			if ( menuContainerRef.current && ! menuContainerRef.current.contains( event.target ) ) {
				setIsOpen( false );
			}
		};
		document.addEventListener( 'mousedown', handleOutside );
		return () => document.removeEventListener( 'mousedown', handleOutside );
	}, [ isOpen ] );

	useEffect( () => {
		if ( ! isSelected ) {
			setIsOpen( false );
		}
	}, [ isSelected ] );

	const getActiveShareIcon = () => {
		if ( iconType === 'external' ) {
			return shareAlt2;
		}
		if ( iconType === 'iosShare' ) {
			return shareAlt1;
		}
		if ( iconType === 'curveShare' ) {
			return shareAlt3;
		}
		return shareIcon;
	};

	const renderIcon = () => {
		if ( iconType === 'share' ) {
			return <Icon icon={ isOpen ? closeIcon : shareIcon } className="videopack-icon-svg" />;
		}
		if ( iconType === 'external' ) {
			return <Icon icon={ shareAlt2 } className="videopack-icon-svg" />;
		}
		if ( iconType === 'iosShare' ) {
			return <Icon icon={ shareAlt1 } className="videopack-icon-svg" />;
		}
		if ( iconType === 'curveShare' ) {
			return <Icon icon={ shareAlt3 } className="videopack-icon-svg" />;
		}
		return null;
	};

	const renderTriggerContent = () => (
		<>
			{ iconType !== 'none' && renderIcon() }
			{ ( showText || iconType === 'none' ) && (
				<span className="videopack-share-text-label" style={{ marginLeft: iconType !== 'none' ? '4px' : '0' }}>
					{ __( 'Share', 'video-embed-thumbnail-generator' ) }
				</span>
			) }
			{ ! isOverlay && ! isInsideTitleMeta && (
				<span className="videopack-caret">▼</span>
			) }
		</>
	);

	const linkClassName = `videopack-share-link videopack-icons style-${ styleType }`;

	const shareContainerContent = (
		<div
			className={ `videopack-share-container${ isOpen ? ' is-visible' : '' }` }
			onClick={ ( e ) => e.stopPropagation() }
		>
			{ ( shareCopyLink || shareNativeShare || shareBluesky || shareThreads || shareFacebook || shareReddit || shareEmail ) && (
				<div className="videopack-share-services-grid">
					{ shareCopyLink && (
						<button type="button" className="videopack-share-btn videopack-btn-copylink" title={ __( 'Copy Link', 'video-embed-thumbnail-generator' ) } onClick={ ( e ) => e.preventDefault() }>
							<Icon icon={ copyLink } />
						</button>
					) }
					{ shareNativeShare && (
						<button type="button" className="videopack-share-btn videopack-btn-nativeshare" title={ __( 'Share via Device', 'video-embed-thumbnail-generator' ) } onClick={ ( e ) => e.preventDefault() }>
							<Icon icon={ getActiveShareIcon() } />
						</button>
					) }
					{ shareBluesky && (
						<button type="button" className="videopack-share-btn videopack-btn-bluesky" title={ __( 'Share on Bluesky', 'video-embed-thumbnail-generator' ) } onClick={ ( e ) => e.preventDefault() }>
							<Icon icon={ bluesky } />
						</button>
					) }
					{ shareThreads && (
						<button type="button" className="videopack-share-btn videopack-btn-threads" title={ __( 'Share on Threads', 'video-embed-thumbnail-generator' ) } onClick={ ( e ) => e.preventDefault() }>
							<Icon icon={ threads } />
						</button>
					) }
					{ shareFacebook && (
						<button type="button" className="videopack-share-btn videopack-btn-facebook" title={ __( 'Share on Facebook', 'video-embed-thumbnail-generator' ) } onClick={ ( e ) => e.preventDefault() }>
							<Icon icon={ facebook } />
						</button>
					) }
					{ shareReddit && (
						<button type="button" className="videopack-share-btn videopack-btn-reddit" title={ __( 'Share on Reddit', 'video-embed-thumbnail-generator' ) } onClick={ ( e ) => e.preventDefault() }>
							<Icon icon={ reddit } />
						</button>
					) }
					{ shareEmail && (
						<button type="button" className="videopack-share-btn videopack-btn-email" title={ __( 'Share via Email', 'video-embed-thumbnail-generator' ) } onClick={ ( e ) => e.preventDefault() }>
							<Icon icon={ email } />
						</button>
					) }
				</div>
			) }
			<span className="videopack-embedcode-container">
				<span className="videopack-icons embed">
					<Icon icon={ embedIcon } className="videopack-icon-svg" />
				</span>
				<span>{ __( 'Embed:', 'video-embed-thumbnail-generator' ) }</span>
				<span>
					<input
						className="videopack-embed-code"
						type="text"
						value={ `<iframe src="https://example.com/embed" width="960" height="540" allow="autoplay; fullscreen" allowfullscreen loading="lazy"></iframe>` }
						readOnly
					/>
				</span>
			</span>
			<span className="videopack-start-at-container">
				<input
					type="checkbox"
					className="videopack-start-at-enable"
					id="videopack-start-at-enable-editor"
				/>
				<label htmlFor="videopack-start-at-enable-editor">
					{ __( 'Start at:', 'video-embed-thumbnail-generator' ) }
				</label>
				<input
					type="text"
					className="videopack-start-at"
					defaultValue="00:00"
				/>
			</span>
		</div>
	);

	return (
		<>
			<BlockControls>
				{ isOverlay && (
					<BlockVerticalAlignmentControl
						value={ position }
						onChange={ ( nextPosition ) => {
							setAttributes( {
								position: nextPosition || undefined,
							} );
						} }
					/>
				) }
				<AlignmentControl
					value={ finalTextAlign }
					onChange={ ( nextAlign ) => {
						setAttributes( { textAlign: nextAlign } );
					} }
				/>
				<ToolbarGroup label={ __( 'Icon Style', 'video-embed-thumbnail-generator' ) }>
					<ToolbarButton
						icon={ noneIcon }
						label={ __( 'No Icon', 'video-embed-thumbnail-generator' ) }
						onClick={ () => setAttributes( { iconType: 'none' } ) }
						isPressed={ iconType === 'none' }
					/>
					<ToolbarButton
						icon={ shareIcon }
						label={ __( 'Standard Share Icon', 'video-embed-thumbnail-generator' ) }
						onClick={ () => setAttributes( { iconType: 'share' } ) }
						isPressed={ iconType === 'share' }
					/>
					<ToolbarButton
						icon={ shareAlt2 }
						label={ __( 'External Link Icon', 'video-embed-thumbnail-generator' ) }
						onClick={ () => setAttributes( { iconType: 'external' } ) }
						isPressed={ iconType === 'external' }
					/>
					<ToolbarButton
						icon={ shareAlt1 }
						label={ __( 'iOS Style Share Icon', 'video-embed-thumbnail-generator' ) }
						onClick={ () => setAttributes( { iconType: 'iosShare' } ) }
						isPressed={ iconType === 'iosShare' }
					/>
					<ToolbarButton
						icon={ shareAlt3 }
						label={ __( 'Curved Arrow Share Icon', 'video-embed-thumbnail-generator' ) }
						onClick={ () => setAttributes( { iconType: 'curveShare' } ) }
						isPressed={ iconType === 'curveShare' }
					/>
				</ToolbarGroup>
				<ToolbarGroup label={ __( 'Display Options', 'video-embed-thumbnail-generator' ) }>
					<ToolbarButton
						icon={ mediaAndText }
						label={ __( 'Toggle Text', 'video-embed-thumbnail-generator' ) }
						onClick={ () => setAttributes( { showText: ! showText } ) }
						isPressed={ showText }
					/>
				</ToolbarGroup>
				<ToolbarGroup label={ __( 'Style Type', 'video-embed-thumbnail-generator' ) }>
					<ToolbarButton
						label={ __( 'Link Style', 'video-embed-thumbnail-generator' ) }
						onClick={ () => setAttributes( { styleType: 'text' } ) }
						isPressed={ styleType === 'text' }
					>
						{ __( 'Link', 'video-embed-thumbnail-generator' ) }
					</ToolbarButton>
					<ToolbarButton
						label={ __( 'Button Style', 'video-embed-thumbnail-generator' ) }
						onClick={ () => setAttributes( { styleType: 'button' } ) }
						isPressed={ styleType === 'button' }
					>
						{ __( 'Button', 'video-embed-thumbnail-generator' ) }
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>
			<InspectorControls>
				<PanelBody title={ __( 'Colors', 'video-embed-thumbnail-generator' ) } initialOpen={ true }>
					<div className="videopack-color-section">
						<p className="videopack-settings-section-title">
							{ __( 'Colors', 'video-embed-thumbnail-generator' ) }
						</p>
						<div className="videopack-color-flex-row">
							<div className="videopack-color-flex-item">
								<CompactColorPicker
									label={ __( 'Text', 'video-embed-thumbnail-generator' ) }
									value={ title_color }
									onChange={ ( value ) => setAttributes( { title_color: value } ) }
									colors={ THEME_COLORS }
									fallbackValue={ colorFallbacks.title_color }
								/>
							</div>
							<div className="videopack-color-flex-item">
								<CompactColorPicker
									label={ __( 'Background', 'video-embed-thumbnail-generator' ) }
									value={ title_background_color }
									onChange={ ( value ) =>
										setAttributes( { title_background_color: value } )
									}
									colors={ THEME_COLORS }
									fallbackValue={ colorFallbacks.title_background_color }
								/>
							</div>
						</div>
					</div>
				</PanelBody>
				<PanelBody title={ __( 'Share Services', 'video-embed-thumbnail-generator' ) } initialOpen={ true }>
					<ToggleControl
						label={ __( 'Copy Link', 'video-embed-thumbnail-generator' ) }
						checked={ shareCopyLink }
						onChange={ ( val ) => setAttributes( { shareCopyLink: val } ) }
					/>
					<ToggleControl
						label={ __( 'Native Share', 'video-embed-thumbnail-generator' ) }
						checked={ shareNativeShare }
						onChange={ ( val ) => setAttributes( { shareNativeShare: val } ) }
					/>
					<ToggleControl
						label={ __( 'Bluesky', 'video-embed-thumbnail-generator' ) }
						checked={ shareBluesky }
						onChange={ ( val ) => setAttributes( { shareBluesky: val } ) }
					/>
					<ToggleControl
						label={ __( 'Threads', 'video-embed-thumbnail-generator' ) }
						checked={ shareThreads }
						onChange={ ( val ) => setAttributes( { shareThreads: val } ) }
					/>
					<ToggleControl
						label={ __( 'Facebook', 'video-embed-thumbnail-generator' ) }
						checked={ shareFacebook }
						onChange={ ( val ) => setAttributes( { shareFacebook: val } ) }
					/>
					<ToggleControl
						label={ __( 'Reddit', 'video-embed-thumbnail-generator' ) }
						checked={ shareReddit }
						onChange={ ( val ) => setAttributes( { shareReddit: val } ) }
					/>
					<ToggleControl
						label={ __( 'Email', 'video-embed-thumbnail-generator' ) }
						checked={ shareEmail }
						onChange={ ( val ) => setAttributes( { shareEmail: val } ) }
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps } ref={ combinedRef }>
				<button
					type="button"
					className={ `${ linkClassName }${ isOpen ? ' is-active' : '' }` }
					onClick={ ( e ) => {
						e.preventDefault();
						setIsOpen( ! isOpen );
					} }
				>
					{ renderTriggerContent() }
				</button>
				{ shouldPortal && portalTarget
					? createPortal( shareContainerContent, portalTarget )
					: shareContainerContent }
			</div>
		</>
	);
}
