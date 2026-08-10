import { useRef } from '@wordpress/element';
import { buildStablePreviewBlocks } from '../utils/buildPreviewBlocks';

/**
 * Converts a template into real block instances (like buildPreviewBlocks),
 * but reuses each block's clientId across renders wherever the block
 * structure at a given position hasn't changed — see
 * buildStablePreviewBlocks for why this matters (avoids forcing blocks like
 * videopack/collection to re-run their own data-fetching effects for a plain
 * attribute/design change, which would otherwise happen because
 * useBlockPreview's internal store resets whenever the blocks array
 * reference changes, and an unmounted-then-remounted block loses all of its
 * own component state, including in-flight/cached query results).
 *
 * Only recomputes when `template` itself changes reference, matching the
 * semantics callers previously got from `useMemo(() => buildPreviewBlocks(
 * template), [template])`.
 *
 * @param {Array} template Template blocks, tuple or object shape.
 * @return {Array} Block instances, with clientIds stable across renders
 *                 where possible.
 */
export default function useStablePreviewBlocks( template ) {
	const prevBlocksRef = useRef( [] );
	const prevTemplateRef = useRef();

	if ( prevTemplateRef.current !== template ) {
		prevBlocksRef.current = buildStablePreviewBlocks(
			template,
			prevBlocksRef.current
		);
		prevTemplateRef.current = template;
	}

	return prevBlocksRef.current;
}
