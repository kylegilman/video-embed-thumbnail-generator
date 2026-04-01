import { useState, useMemo } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { useDebounce } from '@wordpress/compose';

/**
 * Hook to query and search for videos or other content types in the WordPress database.
 *
 * @param {Object} attributes    Block attributes.
 * @param {number} previewPostId The ID of the post being previewed.
 * @return {Object} Query results including search results, categories, and tags.
 */
export default function useVideoQuery(attributes, previewPostId) {
	const { gallery_id, gallery_source, gallery_exclude } = attributes;

	// Determine effective Gallery ID
	let effectiveGalleryId = gallery_id;
	if (gallery_source === 'current') {
		if (!effectiveGalleryId) {
			effectiveGalleryId = previewPostId;
		}
	} else if (gallery_source !== 'custom') {
		effectiveGalleryId = undefined;
	}

	const { categories, tags } = useSelect((select) => {
		const { getEntityRecords } = select('core');
		return {
			categories: getEntityRecords('taxonomy', 'category', {
				per_page: -1,
			}),
			tags: getEntityRecords('taxonomy', 'post_tag', { per_page: -1 }),
		};
	}, []);

	const [searchString, setSearchString] = useState('');
	const debouncedSetSearchString = useDebounce(setSearchString, 500);

	const postTypes = useSelect(
		(select) => select('core').getPostTypes({ per_page: -1 }),
		[]
	);

	const searchableTypes = useMemo(() => {
		if (!postTypes) {
			return ['post', 'page'];
		}
		return postTypes
			.filter((type) => type.viewable && type.slug !== 'attachment')
			.map((type) => type.slug);
	}, [postTypes]);

	const { searchResults, currentPost, isResolving } = useSelect(
		(select) => {
			const { getEntityRecords, isResolving: checkResolving } =
				select('core');
			const results = [];
			let resolving = false;

			if (searchString) {
				const query = {
					search: searchString,
					per_page: 20,
					status: 'publish',
				};

				searchableTypes.forEach((type) => {
					const records = getEntityRecords('postType', type, query);
					if (records) {
						results.push(...records);
					}
					if (
						checkResolving('getEntityRecords', [
							'postType',
							type,
							query,
						])
					) {
						resolving = true;
					}
				});
			} else {
				const query = { per_page: 5, status: 'publish' };
				searchableTypes.forEach((type) => {
					const records = getEntityRecords('postType', type, query);
					if (records) {
						results.push(...records);
					}
					if (
						checkResolving('getEntityRecords', [
							'postType',
							type,
							query,
						])
					) {
						resolving = true;
					}
				});
			}
			let current = null;
			if (gallery_id) {
				const query = {
					include: [gallery_id],
					per_page: 1,
				};
				searchableTypes.forEach((type) => {
					const records = getEntityRecords('postType', type, query);
					if (records && records.length > 0) {
						current = records[0];
					}
				});
			}
			return {
				searchResults: results,
				currentPost: current,
				isResolving: resolving,
			};
		},
		[searchString, gallery_id, searchableTypes]
	);

	const excludedIds = useMemo(() => {
		return gallery_exclude
			? gallery_exclude.split(',').map((id) => parseInt(id, 10))
			: [];
	}, [gallery_exclude]);

	const excludedVideos = useSelect(
		(select) => {
			if (excludedIds.length === 0) {
				return [];
			}
			return select('core').getEntityRecords('postType', 'attachment', {
				include: excludedIds,
				per_page: -1,
				media_type: 'video',
			});
		},
		[excludedIds]
	);

	return {
		effectiveGalleryId,
		categories,
		tags,
		searchString,
		setSearchString,
		debouncedSetSearchString,
		searchResults,
		currentPost,
		isResolving,
		excludedIds,
		excludedVideos,
	};
}
