import { BlockContextProvider } from '@wordpress/block-editor';
import useVideopackContext from '../hooks/useVideopackContext';
import { useMemo } from '@wordpress/element';

/**
 * A wrapper component that resolves Videopack context and bridges it into Gutenberg's block context.
 *
 * @param {Object} root0             Component props.
 * @param {Object} root0.attributes  The block attributes.
 * @param {Object} root0.context     The block context.
 * @param {Object} [root0.overrides] Optional context overrides to merge into the shared context.
 * @param {Node}   root0.children    Children.
 * @return {Element} The rendered component with context bridge.
 */
export default function VideopackContextBridge({
	attributes,
	context,
	overrides = {},
	children,
}) {
	const { sharedContext } = useVideopackContext(attributes, context);

	// Every caller passes its own ambient `context` in expecting it to keep
	// flowing to its children (title/views/duration/poster/etc — whatever an
	// ancestor like Loop already resolved), layering sharedContext/overrides
	// on top for what *this* block specifically contributes or overrides.
	// Dropping `context` here (as this used to) forced every descendant to
	// fall back to a REST fetch for data an ancestor had already provided.
	const finalContext = useMemo(() => {
		const ctx = {
			...context,
			...sharedContext,
			...overrides,
		};
		return ctx;
	}, [context, sharedContext, overrides]);

	return (
		<BlockContextProvider value={finalContext}>
			{children}
		</BlockContextProvider>
	);
}
