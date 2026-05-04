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
export default function useVideoQuery(attributes = {}, previewPostId) {
	if (!attributes) {
		attributes = {};
	}
	const {
		gallery_id,
		gallery_source = 'current',
		gallery_category,
		gallery_tag,
		gallery_orderby = 'post_date',
		gallery_order = 'DESC',
		gallery_include,
		gallery_exclude,
		gallery_pagination,
		gallery_per_page = 6,
		page_number = 1,
		enable_collection_video_limit = false,
		collection_video_limit = 6,
	} = attributes;

	const [searchString, setSearchString] = useState('');
	const debouncedSetSearchString = useDebounce(setSearchString, 500);

	const postTypes = useSelect((select) => {
		const core = select('core');
		return core ? core.getPostTypes({ per_page: -1 }) : [];
	}, []);

	const { isSaving, isAutosaving } = useSelect((select) => {
		const editorStore = select('core/editor');
		if (!editorStore) {
			return { isSaving: false, isAutosaving: false };
		}
		const { isSavingPost, isAutosavingPost } = editorStore;
		return {
			isSaving: isSavingPost ? isSavingPost() : false,
			isAutosaving: isAutosavingPost ? isAutosavingPost() : false,
		};
	}, []);

	const viewablePostTypes = useMemo(() => {
		return (postTypes || [])
			.filter((type) => type.viewable && type.slug !== 'attachment')
			.map((type) => type.slug);
	}, [postTypes]);

	const [videoResults, setVideoResults] = useState([]);
	const [totalResults, setTotalResults] = useState(0);
	const [maxNumPages, setMaxNumPages] = useState(1);
	const [isResolvingVideos, setIsResolvingVideos] = useState(false);

	useEffect(() => {
		if (isSaving || isAutosaving) {
			return;
		}

		let resolvedGalleryId;
		if (['current', 'custom'].includes(gallery_source)) {
			if (gallery_id) {
				resolvedGalleryId = parseInt(gallery_id, 10);
			} else if (previewPostId) {
				resolvedGalleryId = parseInt(previewPostId, 10);
			}
		}

		const args = {
			gallery_orderby: gallery_orderby || 'post_date',
			gallery_order: gallery_order || 'DESC',
			gallery_per_page: parseInt(gallery_per_page, 10) || 6,
			page_number: parseInt(page_number, 10) || 1,
			gallery_id: resolvedGalleryId,
			gallery_exclude: gallery_exclude || '',
			gallery_source: gallery_source || 'current',
			gallery_category: gallery_category || '',
			gallery_tag: gallery_tag || '',
			gallery_pagination: gallery_pagination ?? false,
			gallery_include: gallery_include || '',
			id: previewPostId,
			prioritizePostData: attributes.prioritizePostData || false,
			skip_html: true,
		};

		// Skip query if required parameters for the source are missing
		const isMissingCustomId = gallery_source === 'custom' && !gallery_id;
		const isMissingCategoryId =
			gallery_source === 'category' && !gallery_category;
		const isMissingTagId = gallery_source === 'tag' && !gallery_tag;
		const isMissingCurrentId =
			gallery_source === 'current' && !gallery_id && !previewPostId;
		const isMissingManualInclude =
			gallery_source === 'manual' && !gallery_include;

		const canQuery =
			['recent', 'all'].includes(gallery_source) ||
			(gallery_source &&
				!isMissingCustomId &&
				!isMissingCategoryId &&
				!isMissingTagId &&
				!isMissingCurrentId &&
				!isMissingManualInclude);

		if (!canQuery) {
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
				setTotalResults(
					response.total_count || response.videos?.length || 0
				);
				setMaxNumPages(response.max_num_pages || 1);
			})
			.catch((error) => {
				console.error('Video Query Error:', error);
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
		enable_collection_video_limit,
		collection_video_limit,
		previewPostId,
		attributes.prioritizePostData,
		isSaving,
		isAutosaving,
	]);

	const searchResults = useSelect(
		(select) => {
			if (!searchString) {
				return [];
			}
			const { getEntityRecords } = select('core');
			return getEntityRecords('postType', viewablePostTypes, {
				s: searchString,
				per_page: 20,
			});
		},
		[searchString, viewablePostTypes]
	);

	const categories = useSelect((select) => {
		const { getEntityRecords } = select('core');
		return getEntityRecords('taxonomy', 'category', { per_page: -1 });
	}, []);

	const tags = useSelect((select) => {
		const { getEntityRecords } = select('core');
		return getEntityRecords('taxonomy', 'post_tag', { per_page: -1 });
	}, []);

	const manualVideos = useSelect(
		(select) => {
			if (gallery_source !== 'manual' || !gallery_include) {
				return [];
			}
			const { getEntityRecords } = select('core');
			return getEntityRecords('postType', 'attachment', {
				include: gallery_include,
				per_page: -1,
			});
		},
		[gallery_source, gallery_include]
	);

	const customGalleries = useSelect((select) => {
		const { getEntityRecords } = select('core');
		return getEntityRecords('postType', 'videopack_gallery', {
			per_page: -1,
		});
	}, []);

	return {
		isResolving: isResolvingVideos,
		videoResults,
		totalResults,
		maxNumPages,
		searchResults,
		categories,
		tags,
		manualVideos,
		customGalleries,
		setSearch: debouncedSetSearchString,
	};
}
