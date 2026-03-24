import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { Placeholder } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import Pagination from '../../components/Pagination/Pagination';
import { getSettings } from '../../utils/utils';
import VideoList from '../../components/VideoList/VideoList';
import useVideoQuery from '../../hooks/useVideoQuery';
import CollectionSettingsPanel from '../../components/InspectorControls/CollectionSettingsPanel';

/**
 * ListBlock component for rendering a video list within the editor.
 *
 * @param {Object}   props                Component props.
 * @param {Object}   props.attributes     Block attributes.
 * @param {Function} props.setAttributes  Function to update block attributes.
 * @param {Object}   props.options        Global plugin options.
 * @param {number}   props.previewPostId  ID of the post being previewed.
 * @param {boolean}  props.isSelected     Whether the block is selected.
 * @param {number}   props.currentPage    The current page number.
 * @param {Function} props.setCurrentPage Callback when page changes.
 * @param {number}   props.totalPages     Total number of pages.
 * @return {Object} The rendered component.
 */
const ListBlock = ({
	attributes,
	setAttributes,
	options,
	previewPostId,
	isSelected,
	currentPage,
	setCurrentPage,
	totalPages,
}) => {
	const { isSiteEditor } = useSelect((select) => {
		const editor = select('core/editor');
		const postType = editor?.getCurrentPostType();
		return {
			isSiteEditor:
				postType === 'wp_template' || postType === 'wp_template_part',
		};
	}, []);

	const [fetchedOptions, setFetchedOptions] = useState(null);
	const effectiveOptions = options || fetchedOptions;
	const [showOverlay, setShowOverlay] = useState(!isSelected);

	useEffect(() => {
		setShowOverlay(!isSelected);
	}, [isSelected]);

	useEffect(() => {
		if (!options) {
			getSettings().then((settings) => {
				setFetchedOptions(settings);
			});
		}
	}, [options]);

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

	const effectiveTitleColor =
		attributes.title_color ||
		(effectiveOptions && effectiveOptions.title_color);
	const effectiveTitleBgColor =
		attributes.title_background_color ||
		(effectiveOptions && effectiveOptions.title_background_color);
	const effectivePaginationColor =
		attributes.pagination_color ||
		(effectiveOptions && effectiveOptions.pagination_color);
	const effectivePaginationBg =
		attributes.pagination_background_color ||
		(effectiveOptions && effectiveOptions.pagination_background_color);
	const effectivePaginationActiveBg =
		attributes.pagination_active_bg_color ||
		(effectiveOptions && effectiveOptions.pagination_active_bg_color);
	const effectivePaginationActiveColor =
		attributes.pagination_active_color ||
		(effectiveOptions && effectiveOptions.pagination_active_color);
	const effectivePlayButtonColor =
		attributes.play_button_color ||
		(effectiveOptions && effectiveOptions.play_button_color);
	const effectivePlayButtonIconColor =
		attributes.play_button_icon_color ||
		(effectiveOptions && effectiveOptions.play_button_icon_color);

	const effectiveAttributes = {
		...attributes,
		gallery_id: queryData.effectiveGalleryId,
		title_color: effectiveTitleColor,
		title_background_color: effectiveTitleBgColor,
		pagination_color: effectivePaginationColor,
		pagination_background_color: effectivePaginationBg,
		pagination_active_color: effectivePaginationActiveColor,
		pagination_active_bg_color: effectivePaginationActiveBg,
		play_button_color: effectivePlayButtonColor,
		play_button_icon_color: effectivePlayButtonIconColor,
	};

	const customStyles = {};

	if (effectiveTitleColor) {
		customStyles['--videopack-title-color'] = effectiveTitleColor;
	}
	if (effectiveTitleBgColor) {
		customStyles['--videopack-title-background-color'] =
			effectiveTitleBgColor;
	}
	if (effectivePaginationColor) {
		customStyles['--videopack-pagination-color'] = effectivePaginationColor;
	}
	if (effectivePaginationBg) {
		customStyles['--videopack-pagination-bg'] = effectivePaginationBg;
	}
	if (effectivePaginationActiveBg) {
		customStyles['--videopack-pagination-active-bg'] =
			effectivePaginationActiveBg;
	}
	if (effectivePaginationActiveColor) {
		customStyles['--videopack-pagination-active-color'] =
			effectivePaginationActiveColor;
	}
	if (effectivePlayButtonColor) {
		customStyles['--videopack-play-button-color'] =
			effectivePlayButtonColor;
	}
	if (effectivePlayButtonIconColor) {
		customStyles['--videopack-play-button-icon-color'] =
			effectivePlayButtonIconColor;
	}

	const blockProps = useBlockProps({ style: customStyles });

	return (
		<>
			<InspectorControls>
				<CollectionSettingsPanel
					attributes={attributes}
					setAttributes={setAttributes}
					queryData={queryData}
					options={effectiveOptions}
					showGalleryOptions={false}
					isSiteEditor={isSiteEditor}
					blockType="list"
				/>
			</InspectorControls>
			<div {...blockProps} onDragStart={(e) => e.stopPropagation()}>
				{isSiteEditor &&
				attributes.gallery_source !== 'manual' &&
				!attributes.gallery_id &&
				!attributes.gallery_include ? (
					<Placeholder
						icon="format-video"
						label={__(
							'Dynamic Videopack List',
							'video-embed-thumbnail-generator'
						)}
						instructions={__(
							'This list is currently configured to show videos dynamically based on the current post or archive. To select specific videos instead, use the options in the sidebar.',
							'video-embed-thumbnail-generator'
						)}
					/>
				) : (
					<VideoList
						attributes={effectiveAttributes}
						setAttributes={setAttributes}
						isEditing={true}
						options={options}
						isSelected={isSelected}
						onRemoveItem={handleRemoveItem}
						onEditItem={handleEditItem}
						currentPage={currentPage}
					/>
				)}

				{attributes.gallery_pagination && totalPages > 1 && (
					<Pagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={setCurrentPage}
					/>
				)}

				{showOverlay && <div className="videopack-block-overlay" />}
			</div>
		</>
	);
};

export default ListBlock;
