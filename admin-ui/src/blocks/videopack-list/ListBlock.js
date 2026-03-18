import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { useEffect, useState } from '@wordpress/element';
import { getSettings } from '../../utils/utils';
import VideoList from '../../components/VideoList/VideoList';
import useVideoQuery from '../../hooks/useVideoQuery';
import CollectionSettingsPanel from '../../components/InspectorControls/CollectionSettingsPanel';

/**
 * ListBlock component for rendering a video list within the editor.
 *
 * @param {Object}   props               Component props.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Function to update block attributes.
 * @param {Object}   props.options       Global plugin options.
 * @param {number}   props.previewPostId ID of the post being previewed.
 * @param {boolean}  props.isSelected    Whether the block is selected.
 * @return {Object} The rendered component.
 */
const ListBlock = ({
	attributes,
	setAttributes,
	options,
	previewPostId,
	isSelected,
}) => {
	const [fetchedOptions, setFetchedOptions] = useState(null);
	const effectiveOptions = options || fetchedOptions;

	useEffect(() => {
		if (!options) {
			getSettings().then((settings) => {
				setFetchedOptions(settings);
			});
		}
	}, [options]);

	useEffect(() => {
		if (effectiveOptions) {
			const blockDefaults = {
				gallery_orderby: 'menu_order',
				gallery_order: 'ASC',
				gallery_pagination: false,
				gallery_per_page: 6,
			};

			const newAttributes = {};
			Object.keys(blockDefaults).forEach((key) => {
				if (
					attributes[key] === blockDefaults[key] &&
					effectiveOptions[key] !== undefined &&
					effectiveOptions[key] !== attributes[key]
				) {
					newAttributes[key] = effectiveOptions[key];
				}
			});

			if (Object.keys(newAttributes).length > 0) {
				setAttributes(newAttributes);
			}
		}
	}, [attributes, setAttributes, effectiveOptions]);

	const queryData = useVideoQuery(attributes, previewPostId);

	const handleRemoveItem = (attachmentIdToRemove) => {
		const currentExclude = attributes.gallery_exclude
			? attributes.gallery_exclude
					.split(',')
					.map((id) => parseInt(id.trim(), 10))
			: [];
		if (!currentExclude.includes(attachmentIdToRemove)) {
			currentExclude.push(attachmentIdToRemove);
		}
		const newGalleryExclude = currentExclude.join(',');

		const currentInclude = attributes.gallery_include
			? attributes.gallery_include
					.split(',')
					.map((id) => parseInt(id.trim(), 10))
			: [];
		const newGalleryInclude = currentInclude
			.filter((id) => id !== attachmentIdToRemove)
			.join(',');

		setAttributes({
			gallery_exclude: newGalleryExclude,
			gallery_include: newGalleryInclude,
		});
	};

	const handleEditItem = (oldAttachmentId, newAttachment, currentVideos) => {
		let includeIds = [];
		if (attributes.gallery_include) {
			includeIds = attributes.gallery_include.split(',');
		} else {
			includeIds = currentVideos.map((video) =>
				video.attachment_id.toString()
			);
		}

		const newGalleryInclude = includeIds
			.map((id) =>
				parseInt(id.trim(), 10) === oldAttachmentId
					? newAttachment.id.toString()
					: id
			)
			.join(',');

		setAttributes({
			gallery_include: newGalleryInclude,
			gallery_orderby: 'include',
		});
	};

	const effectiveAttributes = {
		...attributes,
		gallery_id: queryData.effectiveGalleryId,
	};

	return (
		<>
			<InspectorControls>
				<CollectionSettingsPanel
					attributes={attributes}
					setAttributes={setAttributes}
					queryData={queryData}
					showGalleryOptions={false}
				/>
			</InspectorControls>
			<div {...useBlockProps()} onDragStart={(e) => e.stopPropagation()}>
				<VideoList
					attributes={effectiveAttributes}
					setAttributes={setAttributes}
					isEditing={true}
					options={options}
					isSelected={isSelected}
					onRemoveItem={handleRemoveItem}
					onEditItem={handleEditItem}
				/>
			</div>
		</>
	);
};

export default ListBlock;
