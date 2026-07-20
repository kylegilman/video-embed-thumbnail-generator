import useVideopackContext from '../../../hooks/useVideopackContext';

// Collection is a valid theme-context root (Overlays.scss) — nested blocks
// inherit the skin class/CSS vars from here rather than each needing their own.
const COLLECTION_CONTEXT_OPTS = {
	excludeHoverTrigger: true,
	classKeys: ['skin'],
};

/**
 * Wrapper for Videopack Collection Previews.
 *
 * @param {Object} root0            Component props.
 * @param {Node}   root0.children   Children.
 * @param {Object} root0.attributes Block attributes.
 * @param {Object} root0.context    Block context.
 */
export default function CollectionWrapper({
	children,
	attributes = {},
	context = {},
}) {
	const { resolved, style, classes } = useVideopackContext(
		attributes,
		context,
		COLLECTION_CONTEXT_OPTS
	);
	const { layout = 'grid', columns = 3, align = '' } = resolved;

	return (
		<div
			className={`videopack-collection videopack-wrapper layout-${layout} columns-${columns}${
				align ? ` align${align}` : ''
			} ${classes}`}
			style={{
				...style,
				'--videopack-collection-columns': columns,
			}}
		>
			{children}
		</div>
	);
}
