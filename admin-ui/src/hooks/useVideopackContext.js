import { useMemo } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { getEffectiveValue, isTrue } from '../utils/context';
export { isTrue };

export const VIDEOPACK_CONTEXT_KEYS = [
	'skin',
	'title_color',
	'title_background_color',
	'play_button_color',
	'play_button_secondary_color',
	'control_bar_bg_color',
	'control_bar_color',
	'pagination_color',
	'pagination_background_color',
	'pagination_active_bg_color',
	'pagination_active_color',
	'watermark',
	'watermark_styles',
	'watermark_link_to',
	'align',
	'gallery_per_page',
	'gallery_source',
	'gallery_id',
	'gallery_category',
	'gallery_tag',
	'gallery_orderby',
	'gallery_order',
	'gallery_include',
	'gallery_exclude',
	'layout',
	'columns',
	'enable_collection_video_limit',
	'collection_video_limit',
	'prioritizePostData',
	'embed_method',
	'isPreview',
	'isStandalone',
	'src',
	'poster',
	'title',
	'caption',
	'width',
	'height',
	'autoplay',
	'controls',
	'loop',
	'muted',
	'playsinline',
	'preload',
	'volume',
	'auto_res',
	'auto_codec',
	'sources',
	'source_groups',
	'text_tracks',
	'playback_rate',
	'downloadlink',
	'embedcode',
	'embedlink',
	'showCaption',
	'showBackground',
	'title_position',
	'restartCount',
	'duotone',
	'style',
	'loopDuotoneId',
	'fixed_aspect',
	'fullwidth',
	'rotate',
	'default_ratio',
];

/**
 * Hook to resolve Videopack design context and generate styles/classes.
 *
 * @param {Object} attributes Block attributes.
 * @param {Object} context    Block context.
 * @param {Object} options    Optional configuration.
 * @return {Object} Resolved values, styles, and classes.
 */
export default function useVideopackContext(attributes, context, options = {}) {
	const { excludeHoverTrigger: optionsExclude = false } = options;
	// The hover trigger exclusion should NOT be inherited from parents by default,
	// as containers (Collections/Loops) might opt-out while their children (Players) should still hover.
	const excludeHoverTrigger = optionsExclude || attributes.exclude_hover_trigger || false;

	// 1. Initial Synchronous Resolution
	const initial = useMemo(() => {
		const resolved = {};
		const style = {};
		const classes = [];

		VIDEOPACK_CONTEXT_KEYS.forEach((key) => {
			const value = getEffectiveValue(key, attributes, context);
			resolved[key] = value;

			if (value) {
				const cssKey = key.replace(/_/g, '-');
				if (typeof value === 'string' || typeof value === 'number') {
					const cssVar = `--videopack-${cssKey}`;
					style[cssVar] = value;
				}
				
				// Only add classes for colors/styles that are actually set
				if (key !== 'skin') {
					classes.push(`videopack-has-${cssKey}`);
				}
			}
		});

		// Special handling for skin class
		if (resolved.skin && resolved.skin !== 'default') {
			classes.push(resolved.skin);
		}

		// Handle Gutenberg "style" attribute (typography, spacing, etc).
		if (attributes.style && typeof attributes.style === 'object') {
			// Typography Support
			if (attributes.style.typography) {
				const { fontSize, lineHeight, letterSpacing } =
					attributes.style.typography;
				if (fontSize) {
					if (fontSize.startsWith('var:preset|font-size|')) {
						const slug = fontSize.split('|').pop();
						style.fontSize = `var(--wp--preset--font-size--${slug})`;
					} else {
						style.fontSize = fontSize;
					}
				}
				if (lineHeight) style.lineHeight = lineHeight;
				if (letterSpacing) style.letterSpacing = letterSpacing;
			}

			// Spacing Support (Margin/Padding)
			if (attributes.style.spacing) {
				Object.entries(attributes.style.spacing).forEach(
					([type, values]) => {
						if (values && typeof values === 'object') {
							Object.entries(values).forEach(([dir, val]) => {
								let finalVal = val;
								if (
									typeof val === 'string' &&
									val.startsWith('var:preset|spacing|')
								) {
									const slug = val.split('|').pop();
									finalVal = `var(--wp--preset--spacing--${slug})`;
								}
								style[`${type}${dir.charAt(0).toUpperCase()}${dir.slice(1)}`] = finalVal;
							});
						}
					}
				);
			}
		}

		resolved.isEditingAllPages = isTrue(getEffectiveValue('isEditingAllPages', attributes, context));
		resolved.prioritizePostData = isTrue(getEffectiveValue('prioritizePostData', attributes, context));
		resolved.isStandalone = isTrue(getEffectiveValue('isStandalone', attributes, context));
		// Core data identification
		resolved.postId = getEffectiveValue('postId', attributes, context);
		resolved.attachmentId = getEffectiveValue('attachmentId', attributes, context);
		resolved.postType = getEffectiveValue('postType', attributes, context);

		// Handle Gutenberg Typography Classes (Presets)
		if (attributes.fontSize) {
			classes.push(`has-${attributes.fontSize}-font-size`);
		}
		if (attributes.fontFamily) {
			classes.push(`has-${attributes.fontFamily}-font-family`);
		}

		if (!excludeHoverTrigger) {
			classes.push('videopack-hover-trigger');
		}

		return { resolved, style, classes };
	}, [attributes, context, excludeHoverTrigger]);

	// 2. Automatic Video Discovery
	// If we have a postId but no attachmentId, try to find the first video attachment.
	const { discoveredAttachmentId, isDiscovering } = useSelect((select) => {
		const { resolved } = initial;
		
		// If we already have an attachmentId, a manual src, or a saved id, we're not discovering.
		if (resolved.attachmentId || attributes.src || attributes.id) {
			return {
				discoveredAttachmentId: resolved.attachmentId || attributes.id,
				isDiscovering: false,
			};
		}

		// If we don't even have a postId, we can't discover anything.
		if (!resolved.postId || resolved.postId < 1) {
			return { discoveredAttachmentId: null, isDiscovering: false };
		}

		// Avoid duplicates: Find IDs already used by other blocks
		const { getBlocks } = select('core/block-editor');
		const allBlocks = getBlocks();
		
		const usedIds = new Set();
		const findUsedIds = (blocks) => {
			blocks.forEach((block) => {
				if (block.name === 'videopack/player-container' && block.attributes.id) {
					usedIds.add(Number(block.attributes.id));
				}
				if (block.innerBlocks) {
					findUsedIds(block.innerBlocks);
				}
			});
		};
		findUsedIds(allBlocks);

		// If the postId itself IS an attachment, then that's our attachmentId.
		if (resolved.postType === 'attachment') {
			const id = Number(resolved.postId);
			// Only use it if it's not already taken by another block
			if (!usedIds.has(id)) {
				return { discoveredAttachmentId: id, isDiscovering: false };
			}
		}

		// Otherwise, try to find a video attachment for this post that isn't already used.
		const { getEntityRecords } = select('core');
		const query = {
			parent: resolved.postId,
			media_type: 'video',
			per_page: 20, // Fetch more to allow skipping duplicates and non-videos
			_fields: 'id,mime_type',
		};
		const attachments = getEntityRecords('postType', 'attachment', query);
		const isResolving = select('core/data').isResolving('core', 'getEntityRecords', ['postType', 'attachment', query]);

		// Pick the first one that is a video AND isn't already used
		const foundId = attachments?.find((a) => 
			a.mime_type?.startsWith('video/') && !usedIds.has(Number(a.id))
		)?.id || null;

		return {
			discoveredAttachmentId: foundId,
			isDiscovering: isResolving || ( !foundId && attachments === undefined )
		};
	}, [initial.resolved.postId, initial.resolved.attachmentId, initial.resolved.postType, attributes.src]);

	return useMemo(() => {
		const rawAttachmentId = initial.resolved.attachmentId || discoveredAttachmentId || attributes.id;
		
		// Safety: If the resolved attachment ID is the same as the post ID, 
		// and we know the post is NOT an attachment, then it's a false resolution.
		const finalAttachmentId = ( rawAttachmentId && rawAttachmentId === initial.resolved.postId && initial.resolved.postType && initial.resolved.postType !== 'attachment' && !attributes.id )
			? null 
			: rawAttachmentId;

		const finalResolved = { 
			...initial.resolved,
			attachmentId: finalAttachmentId,
			isDiscovering
		};

		// 3. Generate Shared Context Bridge
		const sharedContext = {};
		VIDEOPACK_CONTEXT_KEYS.forEach((key) => {
			if (finalResolved[key] !== undefined && finalResolved[key] !== null) {
				sharedContext[`videopack/${key}`] = finalResolved[key];
			}
		});
		
		// Add core metadata to shared context
		sharedContext['videopack/postId'] = finalResolved.postId;
		sharedContext['videopack/attachmentId'] = finalResolved.attachmentId;
		sharedContext['videopack/postType'] = finalResolved.postType;
		sharedContext['videopack/isEditingAllPages'] = finalResolved.isEditingAllPages;
		sharedContext['videopack/prioritizePostData'] = finalResolved.prioritizePostData;
		sharedContext['videopack/isStandalone'] = finalResolved.isStandalone;

		return {
			resolved: finalResolved,
			style: initial.style,
			classes: initial.classes.join(' '),
			sharedContext,
		};
	}, [initial, discoveredAttachmentId, isDiscovering, excludeHoverTrigger]);
}
