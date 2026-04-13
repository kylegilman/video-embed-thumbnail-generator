import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { Placeholder } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import Pagination from '../../components/Pagination/Pagination';
import { getSettings } from '../../api/settings';
import VideoGallery from '../../components/VideoGallery/VideoGallery';
import useVideoQuery from '../../hooks/useVideoQuery';
import CollectionSettingsPanel from '../../components/InspectorControls/CollectionSettingsPanel';

const NOOP = () => {};

/**
 * GalleryBlock component for rendering a video gallery within the editor.
 *
 * @param {Object}   props                 Component props.
 * @param {Object}   props.attributes      Block attributes.
 * @param {Function} props.setAttributes   Function to update block attributes.
 * @param {Array}    props.videoChildren   List of video attachment records.
 * @param {Object}   props.options         Global plugin options.
 * @param {number}   props.previewPostId   ID of the post being previewed.
 * @param {boolean}  props.isSelected      Whether the block is selected.
 * @param {number}   props.currentPage     Current page number.
 * @param {Function} props.setCurrentPage  Function to set current page.
 * @param {number}   props.totalPages      Total number of pages.
 * @return {Object} The rendered component.
 */
const GalleryBlock = ({
	attributes,
	setAttributes,
	videoChildren,
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
	const effectivePlayButtonColor =
		attributes.play_button_color ||
		(effectiveOptions && effectiveOptions.play_button_color);
	const effectivePlayButtonIconColor =
		attributes.play_button_icon_color ||
		(effectiveOptions && effectiveOptions.play_button_icon_color);
	const effectiveControlBarBgColor =
		attributes.control_bar_bg_color ||
		(effectiveOptions && effectiveOptions.control_bar_bg_color);
	const effectiveControlBarColor =
		attributes.control_bar_color ||
		(effectiveOptions && effectiveOptions.control_bar_color);
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

	const effectiveAttributes = {
		...attributes,
		gallery_id: queryData.effectiveGalleryId,
		play_button_color: effectivePlayButtonColor,
		play_button_icon_color: effectivePlayButtonIconColor,
		control_bar_color: effectiveControlBarColor,
		control_bar_bg_color: effectiveControlBarBgColor,
		title_color: effectiveTitleColor,
		title_background_color: effectiveTitleBgColor,
		pagination_color: effectivePaginationColor,
		pagination_background_color: effectivePaginationBg,
		pagination_active_color: effectivePaginationActiveColor,
		pagination_active_bg_color: effectivePaginationActiveBg,
	};

	const customStyles = {};
	if (effectiveTitleColor) {
		customStyles['--videopack-title-color'] = effectiveTitleColor;
	}
	if (effectiveTitleBgColor) {
		customStyles['--videopack-title-background-color'] =
			effectiveTitleBgColor;
	}
	if (effectivePlayButtonColor) {
		customStyles['--videopack-play-button-color'] =
			effectivePlayButtonColor;
	}
	if (effectivePlayButtonIconColor) {
		customStyles['--videopack-play-button-icon-color'] =
			effectivePlayButtonIconColor;
	}
	if (effectiveControlBarBgColor) {
		customStyles['--videopack-control-bar-bg-color'] =
			effectiveControlBarBgColor;
	}
	if (effectiveControlBarColor) {
		customStyles['--videopack-control-bar-color'] =
			effectiveControlBarColor;
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

	const blockProps = useBlockProps({ style: customStyles });

	return (
		<>
			<InspectorControls>
				<CollectionSettingsPanel
					attributes={attributes}
					setAttributes={setAttributes}
					queryData={queryData}
					options={effectiveOptions}
					showGalleryOptions={true}
					isSiteEditor={isSiteEditor}
					blockType="gallery"
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
							'Dynamic Videopack Gallery',
							'video-embed-thumbnail-generator'
						)}
						instructions={__(
							'This gallery is currently configured to show videos dynamically based on the current post or archive. To select specific videos instead, use the options in the sidebar.',
							'video-embed-thumbnail-generator'
						)}
					/>
				) : (
					<VideoGallery
						attributes={effectiveAttributes}
						videoChildren={videoChildren}
						setAttributes={setAttributes}
						isEditing={true}
						onRemoveItem={handleRemoveItem}
						onEditItem={handleEditItem}
						galleryPage={currentPage}
						setGalleryPage={setCurrentPage}
						totalPages={totalPages}
						setTotalPages={NOOP} // totalPages comes from edit.js useSelect
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

export default GalleryBlock;
