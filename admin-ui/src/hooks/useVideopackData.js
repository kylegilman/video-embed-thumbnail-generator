import { useSelect } from '@wordpress/data';
import { isTrue } from '../utils/context';

/**
 * Hook to resolve specific video data from context or the WordPress database.
 *
 * @param {string} key     The data key to resolve (e.g., 'title', 'views', 'duration').
 * @param {Object} context The block context.
 * @return {*} The resolved data value.
 */
export default function useVideopackData(key, context = {}) {
	const contextKey = `videopack/${key}`;
	const contextValue = context[contextKey];

	const ctxAttachmentId = context['videopack/attachmentId'];
	const ctxPostId = context['videopack/postId'];
	const ctxPostType = context['videopack/postType'];
	const propPostId = context.postId;
	const propPostType = context.postType;
	const isStandalone = isTrue(context['videopack/isStandalone']);

	const resolvedData = useSelect(
		(select) => {
			// 1. If context already has the value, we're done.
			if (contextValue !== undefined && contextValue !== null) {
				return { data: contextValue, isResolving: false };
			}

			// 2. Otherwise, we need an ID to fetch from the database.
			const isParentRequest = key === 'parentTitle';
			const attachmentId = isParentRequest
				? ctxPostId || propPostId
				: ctxAttachmentId ||
					(ctxPostType === 'attachment' ? ctxPostId : null) ||
					(propPostType === 'attachment' ? propPostId : null);

			let postType = ctxPostType || propPostType || 'post';

			// If we are looking for a video (attachment) and we have an explicit attachmentId,
			// or we are in standalone mode, then the postType should be 'attachment'.
			if (!isParentRequest && (ctxAttachmentId || isStandalone)) {
				postType = 'attachment';
			}

			if (!attachmentId) {
				return { data: null, isResolving: false };
			}

			const { getEntityRecord } = select('core');
			const record = getEntityRecord('postType', postType, attachmentId);
			const isResolving = select('core/data').isResolving(
				'core',
				'getEntityRecord',
				['postType', postType, attachmentId]
			);

			if (!record) {
				return { data: null, isResolving };
			}

			// 3. Map the requested key to the record's property.
			let data = null;
			switch (key) {
				case 'title':
				case 'parentTitle':
					data = record.title?.rendered || record.title || '';
					break;
				case 'caption':
					data = record.caption?.rendered || record.caption || '';
					break;
				case 'views':
					data =
						record.videopack?.views ||
						record.meta?.videopack_views ||
						record.meta?.['_videopack-meta']?.starts ||
						0;
					break;
				case 'duration':
					data =
						record.videopack?.duration ||
						record.meta?.['_videopack-meta']?.duration ||
						'';
					break;
				case 'embedlink':
					data =
						record.videopack?.embed_url ||
						record.videopack?.embedlink ||
						'';
					break;
				default:
					data = record[key] || null;
			}

			return { data, isResolving };
		},
		[
			key,
			contextValue,
			ctxAttachmentId,
			ctxPostId,
			ctxPostType,
			propPostId,
			propPostType,
			isStandalone,
		]
	);

	return resolvedData || { data: null, isResolving: false };
}
