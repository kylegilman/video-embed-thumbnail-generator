import { Spinner } from '@wordpress/components';
import useVideopackContext from '../../hooks/useVideopackContext';
import useVideopackData from '../../hooks/useVideopackData';

// Duration shares "badge" title/background colors with Title/View-count —
// see Overlays.scss's $badge-selectors. Module-level so the reference stays
// stable across renders (useVideopackContext depends on it for memoization).
const CLASS_KEYS = [ 'title_color', 'title_background_color' ];

/**
 * A internal component to display the video duration with correct formatting and data.
 *
 * @param {Object} root0            Component props.
 * @param {Object} root0.blockProps Block props from the parent Edit component.
 * @param {Object} root0.attributes Block attributes.
 * @param {Object} root0.context    Block context.
 * @return {Element}                The rendered component.
 */
export default function VideoDuration( {
	blockProps,
	attributes,
	context = {},
} ) {
	const vpContext = useVideopackContext( attributes, context, {
		classKeys: CLASS_KEYS,
	} );
	const { data: duration, isResolving } = useVideopackData(
		'duration',
		context
	);
	const attachmentId = vpContext.resolved.attachmentId;

	if ( ! attachmentId && ! vpContext.resolved.isPreview ) {
		return null;
	}

	if (
		( vpContext.resolved.isDiscovering && ! attachmentId ) ||
		isResolving
	) {
		return (
			<div { ...blockProps }>
				<Spinner />
			</div>
		);
	}

	const formatDuration = ( seconds ) => {
		if ( ! seconds ) {
			return '0:00';
		}
		const s = Math.floor( seconds );
		const h = Math.floor( s / 3600 );
		const m = Math.floor( ( s % 3600 ) / 60 );
		const sec = s % 60;
		if ( h > 0 ) {
			return `${ h }:${ m.toString().padStart( 2, '0' ) }:${ sec
				.toString()
				.padStart( 2, '0' ) }`;
		}
		return `${ m }:${ sec.toString().padStart( 2, '0' ) }`;
	};

	return (
		<div { ...blockProps }>
			{ duration ? formatDuration( duration ) : '0:00' }
		</div>
	);
}
