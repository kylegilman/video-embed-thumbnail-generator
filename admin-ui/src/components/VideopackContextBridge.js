import { BlockContextProvider } from '@wordpress/block-editor';
import useVideopackContext from '../hooks/useVideopackContext';
import { useMemo } from '@wordpress/element';

/**
 * A wrapper component that resolves Videopack context and bridges it into Gutenberg's block context.
 * 
 * @param {Object} props
 * @param {Object} props.attributes The block attributes.
 * @param {Object} props.context    The block context.
 * @param {Object} [props.overrides] Optional context overrides to merge into the shared context.
 * @param {React.ReactNode} props.children
 * @return {React.ReactElement}
 */
export default function VideopackContextBridge({ attributes, context, overrides = {}, children }) {
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
