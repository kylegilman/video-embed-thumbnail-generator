import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { decodeEntities } from '@wordpress/html-entities';

export default function Edit({ attributes, setAttributes, context }) {
	const { caption: manualCaption } = attributes;
	const { postId, postType, 'videopack/caption': contextCaption } = context;

	const { fetchedExcerpt } = useSelect(
		(select) => {
			if (!postId) {
				return { fetchedExcerpt: '' };
			}
			const record = select('core').getEntityRecord(
				'postType',
				postType || 'attachment',
				postId
			);
			return {
				fetchedExcerpt:
					record?.excerpt?.rendered || record?.caption?.rendered || '',
			};
		},
		[postId, postType]
	);

	const { resolved: vpContext } = useVideopackContext(attributes, context);

	const displayCaption = decodeEntities(
		manualCaption ||
			( vpContext.prioritizePostData || vpContext.resolved.prioritizePostData
				? fetchedExcerpt || contextCaption
				: contextCaption || fetchedExcerpt ) ||
			''
	);

	const blockProps = useBlockProps({
		className: 'videopack-video-caption-block',
	});

	return (
		<div {...blockProps}>
			<RichText
				tagName="figcaption"
				className="wp-element-caption videopack-video-caption"
				value={displayCaption}
				onChange={(value) => setAttributes({ caption: value })}
				placeholder={__(
					'Enter Caption…',
					'video-embed-thumbnail-generator'
				)}
			/>
		</div>
	);
}
