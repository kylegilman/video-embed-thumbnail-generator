import { useState, useMemo, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { useDebounce } from '@wordpress/compose';
import { getVideoGallery } from '../api/gallery';

/**
 * Hook to query and search for videos or other content types in the WordPress database.
 *
 * @param {Object} attributes    Block attributes.
 * @param {number} previewPostId The ID of the post being previewed.
 * @return {Object} Query results including search results, categories, and tags.
 */
export default function useVideoQuery(attributes, previewPostId) {
	const {
		gallery_id,
		gallery_source,
		gallery_category,
		gallery_tag,
		gallery_orderby,
		gallery_order,
		gallery_include,
		gallery_exclude,
		gallery_pagination,
		gallery_per_page = 12,
		page_number = 1,
	} = attributes;

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

	const [videoResults, setVideoResults] = useState([]);
	const [totalResults, setTotalResults] = useState(0);
	const [maxNumPages, setMaxNumPages] = useState(1);
	const [isResolvingVideos, setIsResolvingVideos] = useState(false);

	useEffect(() => {
		const args = {
			gallery_orderby,
			gallery_order,
			gallery_per_page: gallery_pagination ? parseInt(gallery_per_page, 10) || 12 : 100,
			page_number: parseInt(page_number, 10) || 1,
			gallery_id,
			gallery_include,
			gallery_exclude,
			gallery_source,
			gallery_category,
			gallery_tag,
			gallery_pagination,
		};

		// Skip query if required parameters for the source are missing
		const isMissingCustomId = gallery_source === 'custom' && !gallery_id;
		const isMissingCategoryId = gallery_source === 'category' && !gallery_category;
		const isMissingTagId = gallery_source === 'tag' && !gallery_tag;
		const isMissingCurrentId = gallery_source === 'current' && !gallery_id && !previewPostId;
		const isMissingManualInclude = gallery_source === 'manual' && !gallery_include;

		if (isMissingCustomId || isMissingCategoryId || isMissingTagId || isMissingCurrentId || isMissingManualInclude) {
			setVideoResults([]);
			setTotalResults(0);
			setMaxNumPages(1);
			setIsResolvingVideos(false);
			return;
		}

		setIsResolvingVideos(true);
		getVideoGallery(args)
			.then((response) => {
				setVideoResults(response.videos || []);
				setTotalResults(response.total_count || response.videos?.length || 0);
				setMaxNumPages(response.max_num_pages || 1);
			})
			.catch((error) => {
				console.error('Error fetching videos:', error);
				setVideoResults([]);
				setTotalResults(0);
				setMaxNumPages(1);
			})
			.finally(() => {
				setIsResolvingVideos(false);
			});
	}, [
		gallery_id,
		gallery_source,
		gallery_category,
		gallery_tag,
		gallery_orderby,
		gallery_order,
		gallery_include,
		gallery_exclude,
		gallery_pagination,
		gallery_per_page,
		page_number,
		previewPostId,
	]);

	const { searchResults, currentPost, isResolvingSearch } = useSelect(
		(select) => {
			const { getEntityRecords, isResolving: checkResolving } = select('core');
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
					if (checkResolving('getEntityRecords', ['postType', type, query])) {
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
					if (checkResolving('getEntityRecords', ['postType', type, query])) {
						resolving = true;
					}
				});
			}

			let current = null;
			if (gallery_id) {
				const query = { include: [gallery_id], per_page: 1 };
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
				isResolvingSearch: resolving,
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
			const records = select('core').getEntityRecords(
				'postType',
				'attachment',
				{
					include: excludedIds,
					per_page: -1,
					media_type: 'video',
				}
			);
			return records || [];
		},
		[excludedIds]
	);

	return {
		categories,
		tags,
		searchString,
		setSearchString,
		debouncedSetSearchString,
		videoResults,
		searchResults,
		currentPost,
		totalResults,
		maxNumPages,
		isResolving: isResolvingVideos || isResolvingSearch,
		excludedIds,
		excludedVideos,
	};
}
