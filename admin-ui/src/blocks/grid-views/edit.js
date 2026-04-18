import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, ToggleControl, Spinner } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';

export default function Edit({ attributes, setAttributes, context }) {
	const postId = context['videopack/postId'];
	const { showLabel } = attributes;

	const { videoMeta, isResolving } = useSelect(
		(select) => {
			const { getEntityRecord, isResolving: isResolvingSelector } =
				select('core');
			return {
				videoMeta: getEntityRecord('postType', 'attachment', postId)
					?.meta?.['_videopack-meta'],
				isResolving: isResolvingSelector('getEntityRecord', [
					'postType',
					'attachment',
					postId,
				]),
			};
		},
		[postId]
	);

	const blockProps = useBlockProps({
		className: 'videopack-grid-views-block',
	});

	if (!postId) {
		return <div {...blockProps} />;
	}

	if (isResolving) {
		return (
			<div {...blockProps}>
				<Spinner />
			</div>
		);
	}

	const views = parseInt(videoMeta?.starts || 0, 10);
	const viewCountText = showLabel
		? sprintf(
				_n(
					'%s view',
					'%s views',
					views,
					'video-embed-thumbnail-generator'
				),
				views.toLocaleString()
			)
		: views.toLocaleString();

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={__(
						'View Settings',
						'video-embed-thumbnail-generator'
					)}
				>
					<ToggleControl
						label={__(
							'Show Label',
							'video-embed-thumbnail-generator'
						)}
						checked={showLabel}
						onChange={(val) => setAttributes({ showLabel: val })}
					/>
				</PanelBody>
			</InspectorControls>
			<div {...blockProps}>{viewCountText}</div>
		</>
	);
}
