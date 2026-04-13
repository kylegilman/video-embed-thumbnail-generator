import { __ } from '@wordpress/i18n';
import { 
	useBlockProps, 
	RichText 
} from '@wordpress/block-editor';

export default function Edit({ attributes, setAttributes }) {
	const { caption } = attributes;
	const blockProps = useBlockProps({
		className: 'videopack-video-caption-block'
	});

	return (
		<div {...blockProps}>
			<RichText
				tagName="p"
				className="wp-element-caption"
				value={caption}
				onChange={(value) => setAttributes({ caption: value })}
				placeholder={__('Enter Caption…', 'video-embed-thumbnail-generator')}
			/>
		</div>
	);
}
