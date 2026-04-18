import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import CollectionQuerySettings from './CollectionQuerySettings';
import CollectionFilterSettings from './CollectionFilterSettings';
import CollectionLayoutSettings from './CollectionLayoutSettings';
import CollectionColorSettings from './CollectionColorSettings';
import './CollectionSettingsPanel.scss';

export default function CollectionSettingsPanel({
	attributes,
	setAttributes,
	queryData = {},
	options = {},
	showGalleryOptions = false,
	isSiteEditor = false,
	blockType = 'gallery',
	showManualSource = true,
	showLayoutSettings = true,
	showPaginationSettings = true,
	hasPaginationBlock = true,
}) {
	const { excludedVideos } = queryData;

	return (
		<>
			<PanelBody
				title={
					showGalleryOptions
						? __('Query Settings', 'video-embed-thumbnail-generator')
						: __('List Settings', 'video-embed-thumbnail-generator')
				}
			>
				<CollectionQuerySettings
					attributes={attributes}
					setAttributes={setAttributes}
					queryData={queryData}
					showManualSource={showManualSource}
					isSiteEditor={isSiteEditor}
					hasPaginationBlock={hasPaginationBlock}
				/>

				{excludedVideos && excludedVideos.length > 0 && (
					<CollectionFilterSettings
						attributes={attributes}
						setAttributes={setAttributes}
						queryData={queryData}
					/>
				)}
			</PanelBody>

			{showLayoutSettings && showGalleryOptions && (
				<PanelBody
					title={__('Layout Settings', 'video-embed-thumbnail-generator')}
					initialOpen={false}
				>
					<CollectionLayoutSettings
						attributes={attributes}
						setAttributes={setAttributes}
					/>
				</PanelBody>
			)}

			<PanelBody
				title={__('Colors', 'video-embed-thumbnail-generator')}
				initialOpen={true}
			>
				<CollectionColorSettings
					attributes={attributes}
					setAttributes={setAttributes}
					options={options}
					blockType={blockType}
					showPaginationSettings={showPaginationSettings}
				/>
			</PanelBody>
		</>
	);
}
