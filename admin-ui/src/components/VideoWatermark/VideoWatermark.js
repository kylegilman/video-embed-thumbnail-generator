import { __ } from '@wordpress/i18n';
import useVideopackContext from '../../hooks/useVideopackContext';

/**
 * Internal component to display the watermark with correct positioning and fallback.
 *
 * @param {Object}   root0               Component props.
 * @param {Object}   root0.attributes    Block attributes.
 * @param {Object}   root0.context       Block context.
 * @param {boolean}  root0.isBlockEditor Whether we are in the block editor.
 * @param {Function} root0.onDimensions  Callback for dimension detection.
 * @return {Element}                     The rendered component.
 */
export default function VideoWatermark({
	attributes = {},
	context = {},
	isBlockEditor = false,
	onDimensions = null,
}) {
	const { resolved } = useVideopackContext(attributes, context);

	const {
		watermark: effectiveUrl,
		watermark_styles: styles = {},
		watermark_scale: attrScale,
		watermark_align: attrAlign,
		watermark_valign: attrValign,
		watermark_x: attrX,
		watermark_y: attrY,
		skin,
	} = resolved;

	const actualScale =
		attrScale ?? styles.scale ?? styles.watermark_scale ?? 10;
	const actualAlign =
		attrAlign ?? styles.align ?? styles.watermark_align ?? 'right';
	const actualValign =
		attrValign ?? styles.valign ?? styles.watermark_valign ?? 'bottom';
	const actualX = attrX ?? styles.x ?? styles.watermark_x ?? 5;
	const actualY = attrY ?? styles.y ?? styles.watermark_y ?? 7;

	const style = {
		position: isBlockEditor ? 'relative' : 'absolute',
		width: effectiveUrl ? `${actualScale}%` : '260px',
		height: 'auto',
		pointerEvents: 'auto',
		transform: '',
	};

	// X Positioning
	if (actualAlign === 'center') {
		style.left = '50%';
		style.transform += 'translateX(-50%) ';
		style.marginLeft = `${-actualX}%`;
	} else {
		style[actualAlign] = `${actualX}%`;
	}

	// Y Positioning
	if (actualValign === 'center') {
		style.top = '50%';
		style.transform += 'translateY(-50%) ';
		style.marginTop = `${-actualY}%`;
	} else {
		style[actualValign] = `${actualY}%`;
	}

	if (!style.transform || isBlockEditor) {
		delete style.transform;
	}

	if (isBlockEditor) {
		delete style.left;
		delete style.right;
		delete style.top;
		delete style.bottom;
		delete style.marginLeft;
		delete style.marginTop;
		style.width = '100%'; // Inner container fills the outer block
	}

	if (!effectiveUrl) {
		return null;
	}

	return (
		<div className={`videopack-video-watermark ${skin}`} style={style}>
			<img
				src={effectiveUrl}
				alt={__('Watermark', 'video-embed-thumbnail-generator')}
				style={{ display: 'block', width: '100%', height: 'auto' }}
				onLoad={(e) => {
					if (
						onDimensions &&
						e.target.naturalWidth &&
						e.target.naturalHeight
					) {
						const ratio =
							e.target.naturalWidth / e.target.naturalHeight;
						onDimensions(ratio);
					}
				}}
			/>
		</div>
	);
}
