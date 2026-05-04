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

	const finalContext = useMemo(() => {
		const ctx = {
			...sharedContext,
			...overrides,
		};
		return ctx;
	}, [sharedContext, overrides]);

	return (
		<BlockContextProvider value={finalContext}>
			{children}
		</BlockContextProvider>
	);
}
