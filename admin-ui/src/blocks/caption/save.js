import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function save({ attributes }) {
	const { caption } = attributes;
	return (
		<RichText.Content
			{...useBlockProps.save({
				className: 'wp-element-caption videopack-video-caption',
			})}
			tagName="figcaption"
			value={caption}
		/>
	);
}
