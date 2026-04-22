import PaginationBase from '../../Pagination/Pagination';

/**
 * Preview component for Videopack Pagination.
 */
export default function Pagination({ attributes = {}, context = {} }) {
	const paginationColor =
		attributes.pagination_color || context['videopack/pagination_color'];
	const paginationBg =
		attributes.pagination_background_color ||
		context['videopack/pagination_background_color'];
	const paginationActiveColor =
		attributes.pagination_active_color ||
		context['videopack/pagination_active_color'];
	const paginationActiveBg =
		attributes.pagination_active_bg_color ||
		context['videopack/pagination_active_bg_color'];

	const currentPage = context['videopack/currentPage'] || 1;
	const totalPages = context['videopack/totalPages'] || 1;
	const onPageChange = context['videopack/onPageChange'] || (() => {});

	return (
		<div
			className="videopack-pagination-block"
			style={{
				'--videopack-pagination-color': paginationColor,
				'--videopack-pagination-bg': paginationBg,
				'--videopack-pagination-active-color': paginationActiveColor,
				'--videopack-pagination-active-bg': paginationActiveBg,
			}}
		>
			<PaginationBase
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={onPageChange}
			/>
		</div>
	);
}
