import useVideopackContext from '../../hooks/useVideopackContext';

/**
 * Shared Player Container Component for Edit/Preview.
 *
 * @param {Object}  root0                      Component props.
 * @param {Node}    root0.children             Inner content.
 * @param {string}  root0.className            Additional CSS classes.
 * @param {Object}  root0.attributes           Block attributes.
 * @param {Object}  root0.context              Block context.
 * @param {string}  root0.resolvedDuotoneClass Duotone class to apply.
 * @param {string}  root0.tagName              HTML tag name (default: div).
 * @param {Object}  root0.style                Inline styles.
 * @param {boolean} root0.isPreview            Whether it's a preview.
 * @return {Element}                           The rendered container.
 */
export default function PlayerContainer({
	children,
	className,
	attributes = {},
	context = {},
	resolvedDuotoneClass,
	tagName: Tag = 'div',
	style,
	isPreview,
}) {
	const vpContext = useVideopackContext(attributes, context);
	const {
		resolved: { duotone: contextDuotone },
		classes: contextClasses,
		style: contextStyle,
	} = vpContext;

	const activeDuotone =
		style?.color?.duotone || attributes?.duotone || contextDuotone;
	let finalDuotoneClass = resolvedDuotoneClass || '';
	const loopDuotoneId = context['videopack/loopDuotoneId'];

	if (loopDuotoneId) {
		finalDuotoneClass = ''; // Loop handles the filter via its own class on the parent
	} else if (!finalDuotoneClass && activeDuotone) {
		if (
			typeof activeDuotone === 'string' &&
			activeDuotone.startsWith('var:preset|duotone|')
		) {
			finalDuotoneClass = `wp-duotone-${activeDuotone.split('|').pop()}`;
		} else if (Array.isArray(activeDuotone)) {
			// If it's a custom array, we expect a class to be passed in resolvedDuotoneClass
			// or we just leave it for the CustomDuotoneFilter to handle if rendered.
		}
	}

	const finalClasses =
		`videopack-video-block-container videopack-wrapper ${contextClasses} ${
			className || ''
		} ${finalDuotoneClass} ${
			isPreview || vpContext.resolved.isPreview ? 'is-preview' : ''
		}`.trim();

	const finalStyle = {
		...contextStyle,
		...style,
	};

	return (
		<Tag className={finalClasses} style={finalStyle}>
			{children}
		</Tag>
	);
}
