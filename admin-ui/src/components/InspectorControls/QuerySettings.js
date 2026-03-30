import { SelectControl, ComboboxControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';

export default function QuerySettings({
	attributes,
	setAttributes,
	queryData,
	showArchiveSource = true,
}) {
	const { gallery_source, gallery_id, gallery_category, gallery_tag } =
		attributes;
	const {
		categories,
		tags,
		debouncedSetSearchString,
		searchResults,
		currentPost,
		isResolving,
	} = queryData;

	const mapTermsToOptions = (terms) => {
		if (!terms) {
			return [];
		}
		return terms.map((term) => ({ label: term.name, value: term.id }));
	};

	const optionsForSelect = [];
	if (currentPost) {
		optionsForSelect.push({
			value: currentPost.id,
			label: decodeEntities(currentPost.title.rendered),
		});
	}
	if (searchResults) {
		searchResults.forEach((post) => {
			if (!optionsForSelect.find((o) => o.value === post.id)) {
				optionsForSelect.push({
					value: post.id,
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
					showArchiveSource && {
						label: __(
							'Archive Query',
							'video-embed-thumbnail-generator'
						),
						value: 'archive',
					},
					{
						label: __(
							'Manual',
							'video-embed-thumbnail-generator'
						),
						value: 'manual',
					},
				].filter(Boolean)}
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
