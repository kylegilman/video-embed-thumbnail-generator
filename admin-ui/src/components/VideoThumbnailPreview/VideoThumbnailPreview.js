import { useSelect } from '@wordpress/data';
import CustomDuotoneFilter from '../Duotone/CustomDuotoneFilter';
import useVideopackContext from '../../hooks/useVideopackContext';

/**
 * Shared Video Thumbnail Component for Edit/Preview
 *
 * @param {Object} root0                      Component props
 * @param {number} root0.postId               Video Post ID (Attachment ID)
 * @param {string} root0.linkTo               Link to target.
 * @param {Node}   root0.children             Inner blocks
 * @param {string} root0.resolvedDuotoneClass Duotone class to apply
 * @param {Object} root0.context              Block context.
 * @param {Object} root0.video                Video data.
 * @param {Object} root0.style                Block styles.
 * @param {string} root0.clientId             Block client ID.
 * @param {Object} root0.attributes           Block attributes.
 * @return {Element}                          VideoThumbnail component
 */
export default function VideoThumbnailPreview( {
	postId: propPostId,
	linkTo: propLinkTo,
	children,
	resolvedDuotoneClass: propResolvedDuotoneClass,
	context = {},
	video: manualVideo = {},
	style,
	clientId,
	attributes = {},
} ) {
	const vpContext = useVideopackContext( attributes, context );

	const {
		resolved: { duotone: contextDuotone },
	} = vpContext;

	// Duotone resolution - prioritize direct prop, then local style, then context
	const duotone =
		style?.color?.duotone || attributes?.duotone || contextDuotone;

	/**
	 * Derive the duotone class from attributes.
	 */
	const loopDuotoneId = context[ 'videopack/loopDuotoneId' ];
	let resolvedDuotoneClass = propResolvedDuotoneClass || loopDuotoneId;
	if ( ! resolvedDuotoneClass ) {
		if (
			typeof duotone === 'string' &&
			duotone.startsWith( 'var:preset|duotone|' )
		) {
			resolvedDuotoneClass = `wp-duotone-${ duotone.split( '|' ).pop() }`;
		} else if ( Array.isArray( duotone ) ) {
			// Ensure a truly unique ID per instance in the editor
			const instanceId =
				clientId || Math.random().toString( 36 ).substr( 2, 9 );
			resolvedDuotoneClass = `videopack-custom-duotone-${ instanceId }`;
		}
	}

	const video =
		manualVideo && Object.keys( manualVideo ).length > 0
			? manualVideo
			: context[ 'videopack/video' ] || {};
	// 'videopack/poster' is a properly registered context key (unlike
	// 'videopack/video', which only worked via ad hoc prop-passing in the old
	// custom preview system) — Loop's real block-context provides it per item.
	const contextPoster = context[ 'videopack/poster' ];
	const postId = vpContext.resolved.attachmentId || propPostId;
	const effectiveSkin = vpContext.resolved.skin;
	// Deliberately doesn't track/show an isResolving state here — this fires
	// once per grid item lacking its own poster_url/contextPoster, and
	// swapping this component's own output between a spinner and the real
	// image (even boxed identically) was still visibly flashing OTHER,
	// already-loaded items in the same grid each time any one of these
	// resolved elsewhere. Falling straight through to defaultNoThumb below
	// while unresolved, then swapping the <img>'s src in place once real
	// data lands, avoids that entirely — no structural/state branch left to
	// flash between.
	const { thumbnailMedia, posterUrl } = useSelect(
		( select ) => {
			if ( ! postId || postId < 1 || video.poster_url || contextPoster ) {
				return { thumbnailMedia: null, posterUrl: null };
			}
			const { getEntityRecord, getMedia } = select( 'core' );

			// Fetch the attachment record for the video
			const attachment = getEntityRecord(
				'postType',
				'attachment',
				postId
			);
			const videopackMeta = attachment?.meta?.[ '_videopack-meta' ] || {};
			const videopackData = attachment?.videopack || {};

			// The thumbnail ID is stored in poster_id, and URL in poster
			const mediaId = videopackMeta.poster_id;
			const directPoster = videopackData.poster || videopackMeta.poster;

			return {
				thumbnailMedia: mediaId ? getMedia( mediaId ) : null,
				posterUrl: directPoster,
			};
		},
		[ postId, video.poster_url, contextPoster ]
	);

	const config =
		typeof window !== 'undefined' ? window.videopack_config : undefined;
	const defaultNoThumb = config
		? `${ config.url }/src/images/nothumbnail.jpg`
		: '';

	// Priority: 1. Manual video data (previews), 2. Context-provided poster
	// (Loop's grid previews), 3. Direct poster URL from meta, 4. WordPress
	// media object, 5. Default "no thumbnail"
	const thumbnailUrl =
		video.poster_url ||
		contextPoster ||
		posterUrl ||
		thumbnailMedia?.source_url ||
		defaultNoThumb;

	const {
		play_button_color,
		play_button_secondary_color,
		embed_method: effectiveEmbedMethod,
	} = vpContext.resolved;
	const containerClass =
		`videopack-thumbnail-wrapper gallery-thumbnail videopack-gallery-item wp-block wp-block-videopack-thumbnail ${
			effectiveEmbedMethod === 'Video.js' ? effectiveSkin || '' : ''
		} ${
			! loopDuotoneId && resolvedDuotoneClass ? resolvedDuotoneClass : ''
		} ${ play_button_color ? 'videopack-has-play-button-color' : '' } ${
			play_button_secondary_color
				? 'videopack-has-play-button-secondary-color'
				: ''
		} ${
			( vpContext.resolved.linkTo || propLinkTo ) !== 'none'
				? 'has-link'
				: ''
		} ${ vpContext.resolved.isPreview ? 'is-preview' : '' } ${
			'auto' === vpContext.resolved.aspect_ratio
				? 'has-native-aspect-ratio'
				: ''
		}`.trim();

	const imgStyle =
		resolvedDuotoneClass && ! loopDuotoneId
			? { filter: `url(#${ resolvedDuotoneClass })` }
			: {};

	const containerStyle = {
		'--videopack-play-button-color': play_button_color,
		'--videopack-play-button-secondary-color': play_button_secondary_color,
	};

	return (
		<div className={ containerClass } style={ containerStyle }>
			{ thumbnailUrl && (
				<img
					src={ thumbnailUrl }
					alt={ thumbnailMedia?.alt_text || '' }
					className="videopack-thumbnail"
					style={ imgStyle }
				/>
			) }
			{ Array.isArray( duotone ) &&
				resolvedDuotoneClass &&
				! loopDuotoneId && (
					<CustomDuotoneFilter
						colors={ duotone }
						id={ resolvedDuotoneClass }
					/>
				) }
			<div className="videopack-inner-blocks-container">{ children }</div>
		</div>
	);
}
