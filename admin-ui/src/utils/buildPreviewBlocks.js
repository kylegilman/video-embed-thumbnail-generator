import { createBlock, sanitizeBlockAttributes } from '@wordpress/blocks';

/**
 * Recursively converts a template array — tuples `[name, attrs, children]`
 * (as produced by getGridTemplate/getListTemplate) or objects
 * `{name, attributes, innerBlocks}` — into real block instances via
 * createBlock(), so they can be rendered through the real, registered Edit
 * components (via useBlockPreview/RealBlockPreview) instead of the removed
 * custom preview registry's hand-picked display components.
 *
 * Template entries may be falsy (e.g. a conditional `condition && [...]`
 * tuple that evaluated to false) — these are filtered out before conversion.
 *
 * @param {Array} template Template blocks, tuple or object shape.
 * @return {Array} Real block instances, as returned by createBlock().
 */
export default function buildPreviewBlocks(template = []) {
	return template.filter(Boolean).map((block) => {
		const [name, attributes = {}, innerBlocks = []] = Array.isArray(block)
			? block
			: [block.name, block.attributes, block.innerBlocks];

		return createBlock(
			name,
			attributes || {},
			buildPreviewBlocks(innerBlocks || [])
		);
	});
}

/**
 * Like buildPreviewBlocks, but reuses each block's clientId from a
 * previously-built blocks array wherever the block name at that position
 * hasn't changed — only calling createBlock() (a fresh clientId) where the
 * structure actually differs (a block appearing, disappearing, or changing
 * type at that position).
 *
 * This matters because useBlockPreview's internal store syncs via
 * useBlockSync, which calls resetBlocks() any time the blocks array
 * reference changes (see @wordpress/block-editor's use-block-sync.js) — but
 * the rendered React component tree is still reconciled by clientId. Reusing
 * a clientId means the corresponding block's Edit() component isn't
 * unmounted/remounted, just re-rendered with updated attributes — so a block
 * with its own data-fetching effect (like videopack/collection's
 * useVideoQuery) only re-runs that effect if its OWN dependencies actually
 * changed, not just because some other block's design attribute changed
 * and forced this whole tree to be rebuilt.
 *
 * @param {Array} template   Template blocks, tuple or object shape.
 * @param {Array} prevBlocks The previously-built blocks array (from a prior
 *                           call) to diff against and reuse clientIds from.
 * @return {Array} Block instances, reusing clientIds where possible.
 */
export function buildStablePreviewBlocks(template = [], prevBlocks = []) {
	return template.filter(Boolean).map((block, index) => {
		const [name, attributes = {}, innerBlocks = []] = Array.isArray(block)
			? block
			: [block.name, block.attributes, block.innerBlocks];

		const prevBlock = prevBlocks[index];
		const childBlocks = buildStablePreviewBlocks(
			innerBlocks || [],
			prevBlock?.innerBlocks || []
		);

		if (prevBlock && prevBlock.name === name) {
			return {
				...prevBlock,
				attributes: sanitizeBlockAttributes(name, attributes || {}),
				innerBlocks: childBlocks,
			};
		}

		return createBlock(name, attributes || {}, childBlocks);
	});
}
