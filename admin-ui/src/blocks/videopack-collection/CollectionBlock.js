import {
	TextControl,
	SelectControl,
	ToggleControl,
	PanelBody,
	RadioControl,
	ComboboxControl,
	Button,
	Icon,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { useEffect, useState, useMemo } from '@wordpress/element';
import { useDebounce } from '@wordpress/compose';
import { close } from '@wordpress/icons';
import { decodeEntities } from '@wordpress/html-entities';
import { sortAscending, sortDescending } from '../../assets/icon';
import { getSettings } from '../../utils/utils';
import VideoGallery from '../../components/VideoGallery/VideoGallery';
import VideoList from '../../components/VideoList/VideoList';

const CollectionBlock = ({
	attributes,
	setAttributes,
	videoChildren,
	options,
	previewPostId,
	isSelected,
}) => {
	const {
		gallery_id,
		layout,
		gallery_orderby,
		gallery_order,
		gallery_include,
		gallery_exclude,
		gallery_end,
		gallery_pagination,
		gallery_per_page,
		gallery_title,
		gallery_columns,
		gallery_source,
		gallery_category,
		gallery_tag,
	} = attributes;

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
				layout: 'gallery',
				gallery_orderby: 'menu_order',
				gallery_order: 'ASC',
				gallery_pagination: false,
				gallery_per_page: 6,
				gallery_title: true,
				gallery_columns: 4,
				gallery_end: '',
			};

			const newAttributes = {};
			Object.keys(blockDefaults).forEach((key) => {
				if (attributes[key] === blockDefaults[key] && effectiveOptions[key] !== undefined && effectiveOptions[key] !== attributes[key]) {
					newAttributes[key] = effectiveOptions[key];
				}
			});

			if (Object.keys(newAttributes).length > 0) {
				setAttributes(newAttributes);
			}
		}
	}, [effectiveOptions]);

	// Use the previewPostId (from context) if no specific gallery_id is saved.
	// This allows the block to be dynamic in the Site Editor.
	let effectiveGalleryId = gallery_id;
	if (gallery_source === 'current') {
		if (!effectiveGalleryId) {
			effectiveGalleryId = previewPostId;
		}
	} else if (gallery_source !== 'custom') {
		effectiveGalleryId = undefined;
	}
	const effectiveAttributes = {
		...attributes,
		gallery_id: effectiveGalleryId,
	};

	const { categories, tags } = useSelect((select) => {
		const { getEntityRecords } = select('core');
		return {
			categories: getEntityRecords('taxonomy', 'category', {
				per_page: -1,
			}),
			tags: getEntityRecords('taxonomy', 'post_tag', { per_page: -1 }),
		};
	}, []);

	const mapTermsToOptions = (terms) => {
		if (!terms) {
			return [];
		}
		return terms.map((term) => ({ label: term.name, value: term.id }));
	};

	const [searchString, setSearchString] = useState('');
	const debouncedSetSearchString = useDebounce(setSearchString, 500);

	const { searchResults, currentPost, isResolving } = useSelect(
		(select) => {
			const { getEntityRecords, getPostTypes, isResolving } = select('core');
			const results = [];
			let resolving = false;

			const postTypes = getPostTypes({ per_page: -1 });
			let searchableTypes = ['post', 'page'];

			if (postTypes) {
				searchableTypes = postTypes
					.filter(
						(type) => type.viewable && type.slug !== 'attachment'
					)
					.map((type) => type.slug);
			}

			if (searchString) {
				const query = {
					search: searchString,
					per_page: 20,
					status: 'publish',
				};

				searchableTypes.forEach((type) => {
					const records = getEntityRecords('postType', type, query);
					if (records) {
						results.push(...records);
					}
					if (
						isResolving('getEntityRecords', ['postType', type, query])
					) {
						resolving = true;
					}
				});
			} else {
				const query = { per_page: 5, status: 'publish' };
				searchableTypes.forEach((type) => {
					const records = getEntityRecords('postType', type, query);
					if (records) {
						results.push(...records);
					}
					if (
						isResolving('getEntityRecords', ['postType', type, query])
					) {
						resolving = true;
					}
				});
			}
			let current = null;
			if (gallery_id) {
				const query = {
					include: [gallery_id],
					per_page: 1,
				};
				searchableTypes.forEach((type) => {
					const records = getEntityRecords('postType', type, query);
					if (records && records.length > 0) {
						current = records[0];
					}
				});
			}
			return {
				searchResults: results,
				currentPost: current,
				isResolving: resolving,
			};
		},
		[searchString, gallery_id]
	);

	const optionsForSelect = [];
	if (currentPost) {
		optionsForSelect.push({
			value: currentPost.id,
			label: currentPost.title.rendered,
		});
	}
	if (searchResults) {
		searchResults.forEach((post) => {
			if (!optionsForSelect.find((o) => o.value === post.id)) {
				optionsForSelect.push({
					value: post.id,
					label: post.title.rendered,
				});
			}
		});
	}

	const baseGalleryOrderbyOptions = [
		{
			value: 'menu_order',
			label: __('Default', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'title',
			label: __('Title', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'post_date',
			label: __('Date', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'rand',
			label: __('Random', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'ID',
			label: __('Video ID', 'video-embed-thumbnail-generator'),
		},
	];

	const filteredGalleryOrderbyOptions = gallery_include
		? [
				...baseGalleryOrderbyOptions,
				{
					value: 'include',
					label: __(
						'Manually Sorted',
						'video-embed-thumbnail-generator'
					),
				},
			]
		: baseGalleryOrderbyOptions;

	const attributeChangeFactory = (attributeName, isNumeric = false) => {
		return (newValue) => {
			let valueToSet = newValue;
			if (isNumeric) {
				const parsedValue = parseInt(newValue, 10);
				valueToSet = isNaN(parsedValue) ? undefined : parsedValue;
			}
			setAttributes({ [attributeName]: valueToSet });
		};
	};

	const handleRemoveItem = (attachmentIdToRemove) => {
		// Update gallery_exclude
		const currentExclude = gallery_exclude
			? gallery_exclude.split(',').map((id) => parseInt(id.trim(), 10))
			: [];
		if (!currentExclude.includes(attachmentIdToRemove)) {
			currentExclude.push(attachmentIdToRemove);
		}
		const newGalleryExclude = currentExclude.join(',');

		// Update gallery_include
		const currentInclude = gallery_include
			? gallery_include.split(',').map((id) => parseInt(id.trim(), 10))
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
		if (gallery_include) {
			includeIds = gallery_include.split(',');
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

	const handleUnexcludeItem = (idToRestore) => {
		const currentExclude = gallery_exclude
			? gallery_exclude.split(',').map((id) => parseInt(id.trim(), 10))
			: [];
		const newGalleryExclude = currentExclude
			.filter((id) => id !== idToRestore)
			.join(',');

		let newGalleryInclude = gallery_include;
		if (gallery_include) {
			const currentInclude = gallery_include
				.split(',')
				.map((id) => parseInt(id.trim(), 10));
			if (!currentInclude.includes(idToRestore)) {
				currentInclude.push(idToRestore);
				newGalleryInclude = currentInclude.join(',');
			}
		}

		setAttributes({
			gallery_exclude: newGalleryExclude,
			gallery_include: newGalleryInclude,
		});
	};

	const excludedIds = useMemo(() => {
		return gallery_exclude
			? gallery_exclude.split(',').map((id) => parseInt(id, 10))
			: [];
	}, [gallery_exclude]);

	const excludedVideos = useSelect(
		(select) => {
			if (excludedIds.length === 0) return [];
			return select('core').getEntityRecords('postType', 'attachment', {
				include: excludedIds,
				per_page: -1,
				media_type: 'video',
			});
		},
		[excludedIds]
	);

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={__(
						'Query Settings',
						'video-embed-thumbnail-generator'
					)}
					initialOpen={true}
				>
					<SelectControl
						label={__('Source', 'video-embed-thumbnail-generator')}
						value={gallery_source}
						options={[
							{
								label: __(
									'Current Post',
									'video-embed-thumbnail-generator'
								),
								value: 'current',
							},
							{
								label: __(
									'Other Post',
									'video-embed-thumbnail-generator'
								),
								value: 'custom',
							},
							{
								label: __(
									'Category',
									'video-embed-thumbnail-generator'
								),
								value: 'category',
							},
							{
								label: __(
									'Tag',
									'video-embed-thumbnail-generator'
								),
								value: 'tag',
							},
						]}
						onChange={(value) => {
							const newAttributes = { gallery_source: value };
							if (value !== 'custom') {
								newAttributes.gallery_id = 0;
							}
							setAttributes(newAttributes);
						}}
					/>

					{gallery_source === 'custom' && (
						<ComboboxControl
							label={__(
								'Search Posts',
								'video-embed-thumbnail-generator'
							)}
							value={gallery_id}
							options={optionsForSelect}
							onFilterValueChange={debouncedSetSearchString}
							onChange={(newValue) =>
								setAttributes({
									gallery_id: newValue
										? parseInt(newValue, 10)
										: undefined,
								})
							}
							help={__(
								'Start typing to search for a post or page.',
								'video-embed-thumbnail-generator'
							)}
							allowReset={true}
							isLoading={isResolving}
						/>
					)}

					{gallery_source === 'category' && (
						<SelectControl
							label={__(
								'Select Category',
								'video-embed-thumbnail-generator'
							)}
							value={gallery_category}
							options={[
								{
									label: __(
										'Select…',
										'video-embed-thumbnail-generator'
									),
									value: '',
								},
								...mapTermsToOptions(categories),
							]}
							onChange={attributeChangeFactory(
								'gallery_category'
							)}
						/>
					)}

					{gallery_source === 'tag' && (
						<SelectControl
							label={__(
								'Select Tag',
								'video-embed-thumbnail-generator'
							)}
							value={gallery_tag}
							options={[
								{
									label: __(
										'Select…',
										'video-embed-thumbnail-generator'
									),
									value: '',
								},
								...mapTermsToOptions(tags),
							]}
							onChange={attributeChangeFactory('gallery_tag')}
						/>
					)}
				</PanelBody>
				<PanelBody
					title={__(
						'Collection Settings',
						'video-embed-thumbnail-generator'
					)}
				>
					<RadioControl
						label={__('Layout', 'video-embed-thumbnail-generator')}
						selected={layout}
						options={[
							{
								label: __(
									'Pop-up gallery',
									'video-embed-thumbnail-generator'
								),
								value: 'gallery',
							},
							{
								label: __(
									'List',
									'video-embed-thumbnail-generator'
								),
								value: 'list',
							},
						]}
						onChange={(value) => setAttributes({ layout: value })}
					/>
					<div className="videopack-sort-control-wrapper">
						<SelectControl
							label={__('Sort by', 'video-embed-thumbnail-generator')}
							value={gallery_orderby}
							onChange={attributeChangeFactory('gallery_orderby')}
							options={filteredGalleryOrderbyOptions}
						/>
						<Button
							icon={gallery_order === 'ASC' ? sortAscending : sortDescending}
							label={gallery_order === 'ASC' ? __('Ascending', 'video-embed-thumbnail-generator') : __('Descending', 'video-embed-thumbnail-generator')}
							onClick={() => setAttributes({ gallery_order: gallery_order === 'ASC' ? 'DESC' : 'ASC' })}
							showTooltip
						/>
					</div>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'Paginate collection',
							'video-embed-thumbnail-generator'
						)}
						checked={!!gallery_pagination}
						onChange={attributeChangeFactory('gallery_pagination')}
					/>
					{gallery_pagination && (
						<TextControl
							label={__(
								'Number of videos per page',
								'video-embed-thumbnail-generator'
							)}
							type="number"
							value={gallery_per_page}
							onChange={attributeChangeFactory(
								'gallery_per_page',
								true
							)}
						/>
					)}
					{layout !== 'list' && (
						<>
							<TextControl
								label={__(
									'Columns',
									'video-embed-thumbnail-generator'
								)}
								type="number"
								value={gallery_columns}
								onChange={attributeChangeFactory(
									'gallery_columns',
									true
								)}
							/>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__(
									'Overlay video title on thumbnails',
									'video-embed-thumbnail-generator'
								)}
								onChange={attributeChangeFactory(
									'gallery_title'
								)}
								checked={!!gallery_title}
							/>
							<SelectControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label={__(
									'When gallery video finishes',
									'video-embed-thumbnail-generator'
								)}
								value={gallery_end}
								onChange={attributeChangeFactory('gallery_end')}
								options={[
									{
										label: __(
											'Stop and leave popup window open',
											'video-embed-thumbnail-generator'
										),
										value: '',
									},
									{
										label: __(
											'Autoplay next video',
											'video-embed-thumbnail-generator'
										),
										value: 'next',
									},
									{
										label: __(
											'Close popup window',
											'video-embed-thumbnail-generator'
										),
										value: 'close',
									},
								]}
							/>
						</>
					)}
					{excludedVideos && excludedVideos.length > 0 && (
						<div className="videopack-excluded-videos">
							<p>
								{__(
									'Excluded Videos',
									'video-embed-thumbnail-generator'
								)}
							</p>
							<div className="videopack-excluded-list">
								{excludedVideos.map((video) => (
									<div
										key={video.id}
										className="videopack-excluded-item"
									>
										<div className="videopack-excluded-thumbnail">
											{video.meta?.['_videopack-meta']?.poster ? (
												<img
													src={video.meta['_videopack-meta'].poster}
													alt={decodeEntities(video.title.rendered)}
												/>
											) : (
												<Icon icon="format-video" />
											)}
										</div>
										<span className="videopack-excluded-title">
											{decodeEntities(video.title.rendered)}
										</span>
										<Button
											icon={close}
											onClick={() =>
												handleUnexcludeItem(video.id)
											}
											label={__(
												'Restore',
												'video-embed-thumbnail-generator'
											)}
											className="videopack-restore-item"
											showTooltip
										/>
									</div>
								))}
							</div>
						</div>
					)}
				</PanelBody>
			</InspectorControls>
			<div {...useBlockProps()} onDragStart={(e) => e.stopPropagation()}>
				{layout === 'list' ? (
					<VideoList
						attributes={effectiveAttributes}
						setAttributes={setAttributes}
						isEditing={true}
						options={options}
						isSelected={isSelected}
						onRemoveItem={handleRemoveItem}
						onEditItem={handleEditItem}
					/>
				) : (
					<VideoGallery
						attributes={effectiveAttributes}
						videoChildren={videoChildren}
						setAttributes={setAttributes}
						isEditing={true}
						onRemoveItem={handleRemoveItem}
						onEditItem={handleEditItem}
					/>
				)}
			</div>
		</>
	);
};

export default CollectionBlock;
