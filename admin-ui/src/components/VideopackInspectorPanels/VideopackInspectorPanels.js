import { useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import VideoSettings from '../../components/VideoSettings/VideoSettings.js';
import Thumbnails from '../../components/Thumbnails/Thumbnails.js';
import AdditionalFormats from '../../components/AdditionalFormats/AdditionalFormats.js';

/**
 * Shared component to display inspector panels for Videopack video blocks.
 *
 * @param {Object} props Component props.
 * @return {Object} The rendered component.
 */
export default function VideopackInspectorPanels({
	attributes,
	setAttributes,
	options,
	isProbing,
	probedMetadata,
	fallbackTitle,
	fallbackCaption,
	isDiscovering,
}) {
	const effectiveId = attributes.id;

	// Use the central data store to get the full attachment record.
	// This takes advantage of Gutenberg's built-in caching.
	const record = useSelect(
		(select) => {
			if (!effectiveId) {
				return null;
			}
			return select('core').getEntityRecord(
				'postType',
				'attachment',
				effectiveId
			);
		},
		[effectiveId]
	);

	// Some extensions might need to write to the record, but in the block editor
	// we shouldn't mutate the raw store record directly this way, so we provide a no-op fallback.
	// We'll let `setAttributes` handle all persistent changes.
	const setRecord = () => {};

	// Create videoData to pass down to standard components like Thumbnails
	const hasResolved = !!record || (!effectiveId && !attributes.src);
	const videoData = useMemo(
		() => ({
			record,
			setRecord,
			hasResolved,
		}),
		[record, hasResolved]
	);

	return (
		<div className="videopack-inspector-controls">
			{(window.videopackAttachmentDetailsExtensions || []).map(
				(Extension, idx) => (
					<Extension
						key={`ext-top-${idx}`}
						attachmentId={effectiveId}
						model={null}
						attributes={attributes}
						setAttributes={setAttributes}
						options={options}
						record={record}
						setRecord={setRecord}
					/>
				)
			)}
			<Thumbnails
				setAttributes={setAttributes}
				attributes={attributes}
				videoData={videoData}
				options={options}
				parentId={record?.post || 0}
				isProbing={isProbing}
				probedMetadata={probedMetadata}
			/>
			{(window.videopackAttachmentDetailsExtensionsBelowThumbnails || []).map(
				(Extension, idx) => (
					<Extension
						key={`ext-bottom-${idx}`}
						attachmentId={effectiveId}
						model={null}
						attributes={attributes}
						setAttributes={setAttributes}
						options={options}
						record={record}
						setRecord={setRecord}
					/>
				)
			)}
			<VideoSettings
				setAttributes={setAttributes}
				attributes={attributes}
				options={options}
				isProbing={isProbing}
				probedMetadata={probedMetadata}
				fallbackTitle={fallbackTitle}
				fallbackCaption={fallbackCaption}
				isBlockEditor={true}
			/>
			<AdditionalFormats
				key={attributes.id || attributes.src}
				attributes={attributes}
				options={options}
				isProbing={isProbing}
				probedMetadata={probedMetadata}
				isDiscovering={isDiscovering}
			/>
		</div>
	);
}
