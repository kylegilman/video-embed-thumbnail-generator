import { useSelect } from '@wordpress/data';
import { Spinner } from '@wordpress/components';
import CustomDuotoneFilter from '../../components/Duotone/CustomDuotoneFilter';
import useVideopackContext from '../../hooks/useVideopackContext';

/**
 * Shared Video Thumbnail Component for Edit/Preview
 *
 * @param {Object} root0                        Component props
 * @param {number} root0.postId                 Video Post ID (Attachment ID)
 * @param {string} root0.skin                   Selected skin
 * @param {Node}   root0.children               Inner blocks
 * @param {string} root0.resolvedDuotoneClass   Duotone class to apply
 * @return {Element} VideoThumbnail component
 */
export function VideoThumbnailPreview({
	postId: propPostId,
	linkTo: propLinkTo,
	children,
	resolvedDuotoneClass: propResolvedDuotoneClass,
	context = {},
	video: manualVideo = {},
	style,
	clientId,
	attributes = {},
}) {
	const vpContext = useVideopackContext({}, context);

	const {
		resolved: {
			attachmentId: resolvedAttachmentId,
			postId: resolvedPostIdFromContext,
			isDiscovering,
			duotone: contextDuotone,
		},
		style: contextStyle,
	} = vpContext;

	// Duotone resolution - prioritize direct prop, then local style, then context
	const duotone = style?.color?.duotone || attributes?.duotone || contextDuotone;

	/**
	 * Derive the duotone class from attributes.
	 */
	const loopDuotoneId = context['videopack/loopDuotoneId'];
	let resolvedDuotoneClass = propResolvedDuotoneClass || loopDuotoneId;
	if ( ! resolvedDuotoneClass ) {
		if (
			typeof duotone === 'string' &&
			duotone.startsWith('var:preset|duotone|')
		) {
			resolvedDuotoneClass = `wp-duotone-${duotone.split('|').pop()}`;
		} else if (Array.isArray(duotone)) {
			// Ensure a truly unique ID per instance in the editor
			const instanceId = clientId || Math.random().toString(36).substr(2, 9);
			resolvedDuotoneClass = `videopack-custom-duotone-${instanceId}`;
		}
	}

	const video = (manualVideo && Object.keys(manualVideo).length > 0) ? manualVideo : (context['videopack/video'] || {});
	const postId = vpContext.resolved.attachmentId || propPostId;
	const effectiveSkin = vpContext.resolved.skin;
	const { thumbnailMedia, posterUrl, isResolving } = useSelect(
		(select) => {
			if (!postId || postId < 1 || video.poster_url) {
				return {
					thumbnailMedia: null,
					posterUrl: null,
					isResolving: false,
				};
			}
			const { getEntityRecord, getMedia } = select('core');
			
			// Fetch the attachment record for the video
			const attachment = getEntityRecord('postType', 'attachment', postId);
			const videopackMeta = attachment?.meta?.['_videopack-meta'] || {};
			const videopackData = attachment?.videopack || {};
			
			// The thumbnail ID is stored in poster_id, and URL in poster
			const mediaId = videopackMeta.poster_id;
			const directPoster = videopackData.poster || videopackMeta.poster;

			return {
				thumbnailMedia: mediaId ? getMedia(mediaId) : null,
				posterUrl: directPoster,
				isResolving: select('core/data').isResolving(
					'core',
					'getEntityRecord',
					['postType', 'attachment', postId]
				),
			};
		},
		[postId, video.poster_url]
	);

	if (isResolving && !video.poster_url) {
		return <Spinner />;
	}

	const config = typeof window !== 'undefined' ? window.videopack_config : undefined;
	const defaultNoThumb = config ? `${config.url}/src/images/Adobestock_469037984_thumb1.jpg` : '';

	// Priority: 1. Manual video data (previews), 2. Direct poster URL from meta, 3. WordPress media object, 4. Default "no thumbnail"
	const thumbnailUrl =
		video.poster_url ||
		posterUrl ||
		thumbnailMedia?.source_url ||
		defaultNoThumb;

	const {
		play_button_color,
		play_button_secondary_color,
		embed_method: effectiveEmbedMethod,
	} = vpContext.resolved;
	const containerClass = `gallery-thumbnail videopack-gallery-item wp-block wp-block-videopack-thumbnail ${
		effectiveEmbedMethod === 'Video.js' ? (effectiveSkin || '') : ''
	} ${!loopDuotoneId && resolvedDuotoneClass ? resolvedDuotoneClass : ''} ${
		play_button_color ? 'videopack-has-play-button-color' : ''
	} ${
		play_button_secondary_color
			? 'videopack-has-play-button-secondary-color'
			: ''
	} ${
		(vpContext.resolved.linkTo || propLinkTo) !== 'none' ? 'has-link' : ''
	} ${
		vpContext.resolved.isPreview ? 'is-preview' : ''
	}`.trim();

	const imgStyle = (resolvedDuotoneClass && !loopDuotoneId)
		? { filter: `url(#${resolvedDuotoneClass})` }
		: {};

	const containerStyle = {
		'--videopack-play-button-color': play_button_color,
		'--videopack-play-button-secondary-color': play_button_secondary_color,
	};


	return (
		<div className={containerClass} style={containerStyle}>
			{thumbnailUrl && (
				<img
					src={thumbnailUrl}
					alt={thumbnailMedia?.alt_text || ''}
					className="videopack-thumbnail"
					style={imgStyle}
				/>
			)}
			{Array.isArray(duotone) && resolvedDuotoneClass && !loopDuotoneId && (
				<CustomDuotoneFilter colors={duotone} id={resolvedDuotoneClass} />
			)}
			<div className="videopack-inner-blocks-container">{children}</div>
		</div>
	);
}
