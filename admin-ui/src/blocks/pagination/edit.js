import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { useSelect, useDispatch } from '@wordpress/data';
import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useMemo } from '@wordpress/element';
import Pagination from '../../components/Pagination/Pagination';
import CompactColorPicker from '../../components/CompactColorPicker/CompactColorPicker';
import { getColorFallbacks } from '../../utils/colors';

/* global videopack_config */

export default function Edit({
	attributes,
	setAttributes,
	context,
	clientId,
	showPaginationSettings = true,
}) {
	const {
		pagination_color,
		pagination_background_color,
		pagination_active_bg_color,
		pagination_active_color,
	} = attributes;

	const currentPage = context['videopack/currentPage'] || 1;
	const totalPages = context['videopack/totalPages'] || 1;

	const colorFallbacks = useMemo(() => {
		const contextSettings = {
			pagination_color: context['videopack/pagination_color'],
			pagination_background_color:
				context['videopack/pagination_background_color'],
			pagination_active_bg_color:
				context['videopack/pagination_active_bg_color'],
			pagination_active_color: context['videopack/pagination_active_color'],
		};
		return getColorFallbacks(contextSettings);
	}, [context]);

	const THEME_COLORS = videopack_config?.themeColors || [];

	const { updateBlockAttributes } = useDispatch('core/block-editor');
	const { parentClientId } = useSelect(
		(select) => {
			return {
				parentClientId:
					select('core/block-editor').getBlockRootClientId(clientId),
			};
		},
		[clientId]
	);

	const handlePageChange = (newPage) => {
		if (parentClientId) {
			updateBlockAttributes(parentClientId, { currentPage: newPage });
		}
	};

	const blockProps = useBlockProps({
		className: 'videopack-pagination-block',
		style: {
			'--videopack-pagination-color':
				pagination_color || colorFallbacks.pagination_color,
			'--videopack-pagination-bg':
				pagination_background_color ||
				colorFallbacks.pagination_background_color,
			'--videopack-pagination-active-bg':
				pagination_active_bg_color ||
				colorFallbacks.pagination_active_bg_color,
			'--videopack-pagination-active-color':
				pagination_active_color || colorFallbacks.pagination_active_color,
		},
	});

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={__('Pagination Colors', 'video-embed-thumbnail-generator')}
				>
					{showPaginationSettings && (
						<div className="videopack-color-section">
							<p className="videopack-settings-section-title">
								{__('Pagination', 'video-embed-thumbnail-generator')}
							</p>
							<div className="videopack-color-flex-row is-pagination">
								<div className="videopack-color-flex-item">
									<CompactColorPicker
										label={__(
											'Outline/Text',
											'video-embed-thumbnail-generator'
										)}
										value={pagination_color}
										onChange={(value) =>
											setAttributes({ pagination_color: value })
										}
										colors={THEME_COLORS}
										fallbackValue={colorFallbacks.pagination_color}
									/>
								</div>
								<div className="videopack-color-flex-item">
									<CompactColorPicker
										label={__(
											'Background',
											'video-embed-thumbnail-generator'
										)}
										value={pagination_background_color}
										onChange={(value) =>
											setAttributes({
												pagination_background_color: value,
											})
										}
										colors={THEME_COLORS}
										fallbackValue={
											colorFallbacks.pagination_background_color
										}
									/>
								</div>
								<div className="videopack-color-flex-item">
									<CompactColorPicker
										label={__(
											'Active Background',
											'video-embed-thumbnail-generator'
										)}
										value={pagination_active_bg_color}
										onChange={(value) =>
											setAttributes({
												pagination_active_bg_color: value,
											})
										}
										colors={THEME_COLORS}
										fallbackValue={
											colorFallbacks.pagination_active_bg_color
										}
									/>
								</div>
								<div className="videopack-color-flex-item">
									<CompactColorPicker
										label={__(
											'Active Text',
											'video-embed-thumbnail-generator'
										)}
										value={pagination_active_color}
										onChange={(value) =>
											setAttributes({
												pagination_active_color: value,
											})
										}
										colors={THEME_COLORS}
										fallbackValue={
											colorFallbacks.pagination_active_color
										}
									/>
								</div>
							</div>
						</div>
					)}
				</PanelBody>
			</InspectorControls>

			{totalPages <= 1 ? (
				<div
					{...blockProps}
					className={`${blockProps.className} is-placeholder`}
				>
					<Pagination
						currentPage={1}
						totalPages={10}
						onPageChange={() => {}}
					/>
				</div>
			) : (
				<div {...blockProps}>
					<Pagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={handlePageChange}
					/>
				</div>
			)}
		</>
	);
}
