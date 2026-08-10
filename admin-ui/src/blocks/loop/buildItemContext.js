/**
 * Builds the per-item BlockContextProvider value for one grid item in
 * videopack/loop's grid — shared between edit.js's static (preview-mode)
 * grid and SortableGrid.js's interactive (real-editor) grid, so both paths
 * feed identical per-video data to the templated blocks (thumbnail, title,
 * etc) and can never drift apart.
 *
 * @param {Object} video                      A single video record from the query results.
 * @param {Object} root1                      Extra context needed to compute values.
 * @param {Object} root1.context              This Loop instance's own inherited block context.
 * @param {Object} root1.vpContext            This Loop instance's resolved videopack context.
 * @param {string} root1.resolvedDuotoneClass Duotone class shared across all items.
 * @param {number} root1.totalPagesCount      Total pages, for context consumers like Pagination.
 * @param {number} root1.totalResultsCount    Total results, for context consumers like Pagination.
 * @return {Object} The BlockContextProvider value for this item.
 */
export default function buildItemContext(
	video,
	{
		context,
		vpContext,
		resolvedDuotoneClass,
		totalPagesCount,
		totalResultsCount,
	}
) {
	const targetPostId =
		vpContext.resolved.prioritizePostData && video.parent_id
			? video.parent_id
			: video.attachment_id || video.id;
	const targetPostType =
		vpContext.resolved.prioritizePostData && video.parent_id
			? 'post'
			: 'attachment';

	return {
		...context,
		...vpContext.sharedContext,
		postId: targetPostId,
		postType: targetPostType,
		'videopack/postId': targetPostId,
		'videopack/postType': targetPostType,
		'videopack/attachmentId': video.attachment_id || video.id,
		'videopack/title': video.title,
		'videopack/caption': video.caption,
		// Gallery.php's collection_page() only ever nests the view count inside
		// player_vars.starts — there's no top-level views/starts field on the
		// video object itself (unlike poster_url/duration, which do exist
		// top-level). Checking the wrong paths here always resolved to
		// undefined, forcing view-count to fall back to a REST fetch for
		// every item regardless of its actual count.
		'videopack/views': video.player_vars?.starts,
		'videopack/duration':
			video.duration || video.meta?.[ '_videopack-meta' ]?.duration,
		'videopack/embedlink':
			video.embed_url || video.player_vars?.full_player_html || '',
		'videopack/parentPostId': video.parent_id,
		'videopack/totalPages': totalPagesCount,
		'videopack/totalResults': totalResultsCount,
		'videopack/loopDuotoneId': resolvedDuotoneClass,
		'videopack/poster': video.poster_url || video.player_vars?.poster,
	};
}
