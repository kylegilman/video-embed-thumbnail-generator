import { useSelect } from '@wordpress/data';
import { Spinner } from '@wordpress/components';
import { getEffectiveValue } from '../../utils/context';

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
	postId,
	children,
	resolvedDuotoneClass,
	context = {},
	video = {},
}) {
	const effectiveSkin = getEffectiveValue('skin', {}, context);
	const { thumbnailMedia, posterUrl, isResolving } = useSelect(
		(select) => {
			if (!postId || postId < 1) {
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
			
			// The thumbnail ID is stored in poster_id, and URL in poster
			const mediaId = videopackMeta.poster_id;
			const directPoster = videopackMeta.poster;

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
		[postId]
	);

	if (isResolving && !video.poster_url) {
		return <Spinner />;
	}

	const config = typeof window !== 'undefined' ? window.videopack_config : undefined;
	const defaultNoThumb = config ? `${config.url}/src/images/nothumbnail.jpg` : '';

	// Priority: 1. Manual video data (previews), 2. Direct poster URL from meta, 3. WordPress media object, 4. Default "no thumbnail"
	const thumbnailUrl =
		video.poster_url ||
		posterUrl ||
		thumbnailMedia?.source_url ||
		defaultNoThumb;

	const play_button_color = getEffectiveValue(
		'play_button_color',
		{},
		context
	);
	const play_button_secondary_color = getEffectiveValue(
		'play_button_secondary_color',
		{},
		context
	);

	const containerClass = `gallery-thumbnail videopack-gallery-item wp-block wp-block-videopack-thumbnail ${
		effectiveSkin
	} ${resolvedDuotoneClass || ''} ${
		play_button_color ? 'videopack-has-play-button-color' : ''
	} ${
		play_button_secondary_color
			? 'videopack-has-play-button-secondary-color'
			: ''
	}`.trim();
	const imgStyle = resolvedDuotoneClass
		? { filter: `url(#${resolvedDuotoneClass})` }
		: {};

	const containerStyle = {
		...imgStyle,
		'--videopack-play-button-color': play_button_color,
		'--videopack-play-button-secondary-color': play_button_secondary_color,
	};


	return (
		<div className={containerClass} style={containerStyle}>
			<img
				src={thumbnailUrl}
				alt={thumbnailMedia?.alt_text || ''}
				className={resolvedDuotoneClass || ''}
				style={imgStyle}
			/>
			<div className="videopack-inner-blocks-container">{children}</div>
		</div>
	);
}
