import { SelectControl, ComboboxControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

export default function QuerySettings({
	attributes,
	setAttributes,
	queryData,
	showManualSource = true,
}) {
	const { gallery_source, gallery_id, gallery_category, gallery_tag } =
		attributes;
	const {
		categories,
		tags,
		debouncedSetSearchString,
		searchResults,
		isResolvingSearch,
	} = queryData;

	const [currentPost, setCurrentPost] = useState(null);

	useEffect(() => {
		if (!gallery_id) {
			setCurrentPost(null);
			return;
		}

		// If we already have the correct post, don't fetch again
		if (currentPost && currentPost.id === gallery_id) {
			return;
		}

		// Check if it's in the search results
		const found = (searchResults || []).find((res) => res.id === gallery_id);
		if (found) {
			setCurrentPost(found);
			return;
		}

		// Fetch from the search endpoint to support all post types
		apiFetch({
			path: `/wp/v2/search?include=${gallery_id}&type=post`,
		})
			.then((results) => {
				if (results && results.length > 0) {
					setCurrentPost({
						id: results[0].id,
						title: {
							rendered: results[0].title?.rendered || results[0].title || '',
						},
					});
				}
			})
			.catch(() => {
				setCurrentPost({
					id: gallery_id,
					title: { rendered: `#${gallery_id}` },
				});
			});
	}, [gallery_id, searchResults, currentPost]);

	const mapTermsToOptions = (terms) => {
		if (!terms) {
			return [];
		}
		return terms.map((term) => ({ label: term.name, value: term.id }));
	};

	const optionsForSelect = [];
	if (currentPost) {
		optionsForSelect.push({
			value: String(currentPost.id),
			label: decodeEntities(currentPost.title.rendered),
		});
	}
	if (searchResults) {
		searchResults.forEach((post) => {
			if (!optionsForSelect.find((o) => String(o.value) === String(post.id))) {
				optionsForSelect.push({
					value: String(post.id),
					label: decodeEntities(post.title.rendered),
				});
			}
		});
	}
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

	return (
		<>
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
						label: __('Tag', 'video-embed-thumbnail-generator'),
						value: 'tag',
					},
					{
						label: __(
							'Inherit from Global Query',
							'video-embed-thumbnail-generator'
						),
						value: 'archive',
					},
					showManualSource && {
						label: __('Manual', 'video-embed-thumbnail-generator'),
						value: 'manual',
					},
				].filter(Boolean)}
				onChange={(value) => {
					const newAttributes = { gallery_source: value };
					if (value !== 'custom' && value !== 'manual') {
						newAttributes.gallery_id = 0;
					}
					if (value !== 'manual') {
						newAttributes.gallery_include = '';
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
					value={gallery_id ? String(gallery_id) : ''}
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
					isLoading={isResolvingSearch}
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
					onChange={attributeChangeFactory('gallery_category')}
				/>
			)}

			{gallery_source === 'tag' && (
				<SelectControl
					label={__('Select Tag', 'video-embed-thumbnail-generator')}
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
		</>
	);
}
