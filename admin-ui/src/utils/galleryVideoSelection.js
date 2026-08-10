/**
 * Shared decision logic for handling media selected/uploaded via the
 * Collection/Loop "Add Video" controls (toolbar button or empty-state
 * placeholder). Both blocks read/write the same gallery_source/gallery_include
 * attributes, just via different props (Collection owns them directly, Loop
 * receives them through block context and updates its parent) — this keeps
 * the actual selection/attach logic in one place.
 *
 * If the gallery is already in Manual mode, selected/uploaded videos are
 * simply added to the manual list (post_parent is irrelevant there).
 *
 * Otherwise (gallery_source is "current" or another dynamic source): a
 * freshly uploaded file is already attached to this post by the editor's own
 * upload handler, so no attribute change is needed — the query already picks
 * it up. But an item picked from the existing Media Library may belong to a
 * different post entirely — rather than silently reparenting someone else's
 * attachment, the gallery is switched to Manual mode with the selected
 * video(s) instead.
 *
 * @param {Object}       params
 * @param {Object|Array} params.media          Selected attachment object(s).
 * @param {string}       params.gallerySource  Current gallery_source value.
 * @param {string}       params.galleryInclude Current gallery_include value.
 * @param {number}       params.previewPostId  The current post's ID.
 * @return {{type: 'none'}|{type: 'no-change'}|{type: 'update', updates: Object}} Result.
 */
export function resolveGalleryVideoSelection( {
	media,
	gallerySource,
	galleryInclude,
	previewPostId,
} ) {
	const mediaArray = ( Array.isArray( media ) ? media : [ media ] ).filter(
		( item ) => item?.id
	);
	if ( ! mediaArray.length ) {
		return { type: 'none' };
	}

	const newIds = mediaArray.map( ( item ) => item.id.toString() );

	if ( gallerySource === 'manual' ) {
		const currentInclude = galleryInclude
			? galleryInclude.split( ',' ).map( ( id ) => id.trim() )
			: [];
		return {
			type: 'update',
			updates: {
				gallery_include: [
					...new Set( [ ...currentInclude, ...newIds ] ),
				].join( ',' ),
				gallery_orderby: 'include',
			},
		};
	}

	// The React <MediaUpload>/<MediaPlaceholder> components normalize the
	// uploaded-to-post field as `.parent`, but a raw wp.media() Backbone
	// frame's attachment.toJSON() exposes the same value as `.uploadedTo` —
	// check both since this function is used by both selection paths.
	const alreadyAttachedHere = mediaArray.every(
		( item ) => ( item.parent ?? item.uploadedTo ) === previewPostId
	);

	if ( alreadyAttachedHere ) {
		return { type: 'no-change' };
	}

	return {
		type: 'update',
		updates: {
			gallery_include: newIds.join( ',' ),
			gallery_source: 'manual',
			gallery_orderby: 'include',
		},
	};
}
