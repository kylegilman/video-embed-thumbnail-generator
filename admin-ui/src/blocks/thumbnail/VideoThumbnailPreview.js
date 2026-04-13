import { useSelect } from '@wordpress/data';
import { Spinner } from '@wordpress/components';

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
	skin,
	children,
	resolvedDuotoneClass,
}) {
	const { thumbnailMedia, posterUrl, isResolving } = useSelect(
		(select) => {
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

	if (isResolving) {
		return <Spinner />;
	}

	const config = typeof window !== 'undefined' ? window.videopack_config : undefined;
	const defaultNoThumb = config ? `${config.url}/src/images/nothumbnail.jpg` : '';

	// Priority: 1. Direct poster URL from meta, 2. WordPress media object, 3. Default "no thumbnail"
	const thumbnailUrl =
		posterUrl ||
		thumbnailMedia?.source_url ||
		defaultNoThumb;

	const containerClass = `gallery-thumbnail videopack-gallery-item wp-block wp-block-videopack-thumbnail ${
		skin || ''
	} ${resolvedDuotoneClass || ''}`.trim();
	const imgStyle = resolvedDuotoneClass
		? { filter: `url(#${resolvedDuotoneClass})` }
		: {};


	return (
		<div className={containerClass}>
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
