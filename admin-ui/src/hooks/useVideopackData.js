import { useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
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

	const resolvedData = useSelect((select) => {
		// 1. If context already has the value, we're done.
		if (contextValue !== undefined && contextValue !== null) {
			return { data: contextValue, isResolving: false };
		}

		// 2. Otherwise, we need an ID to fetch from the database.
		const isParentRequest = key === 'parentTitle';
		const isStandalone = isTrue(context['videopack/isStandalone']);
		const attachmentId = isParentRequest 
			? (context['videopack/postId'] || context.postId) 
			: (context['videopack/attachmentId'] || (context['videopack/postType'] === 'attachment' ? context['videopack/postId'] : null) || (context.postType === 'attachment' ? context.postId : null));
		
		let postType = context['videopack/postType'] || context.postType || 'post';
		const initialPostType = postType;
		
		// If we are looking for a video (attachment) and we have an explicit attachmentId, 
		// or we are in standalone mode, then the postType should be 'attachment'.
		if (!isParentRequest && (context['videopack/attachmentId'] || isStandalone)) {
			postType = 'attachment';
		}

		if (!attachmentId) {
			return { data: null, isResolving: false };
		}

		const { getEntityRecord } = select('core');
		const record = getEntityRecord('postType', postType, attachmentId);
		const isResolving = select('core/data').isResolving('core', 'getEntityRecord', ['postType', postType, attachmentId]);

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
				data = record.videopack?.views || record.meta?.videopack_views || record.meta?.['_videopack-meta']?.starts || 0;
				break;
			case 'duration':
				data = record.videopack?.duration || record.meta?.['_videopack-meta']?.duration || '';
				break;
			case 'embedlink':
				data = record.videopack?.embed_url || record.videopack?.embedlink || '';
				break;
			default:
				data = record[key] || null;
		}

		return { data, isResolving };
	}, [key, contextValue, context['videopack/attachmentId'], context.postId, context['videopack/postType']]);

	return resolvedData || { data: null, isResolving: false };
}
