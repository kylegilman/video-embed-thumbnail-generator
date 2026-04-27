import { __ } from '@wordpress/i18n';
import { getEffectiveValue } from '../../utils/context';


/**
 * A standardized pagination component for use in both blocks and previews.
 *
 * @param {Object}   props              Component props.
 * @param {number}   props.currentPage  The current active page.
 * @param {number}   props.totalPages   The total number of pages.
 * @param {Function} props.onPageChange Callback when a page is changed.
 * @param {Object}   props.attributes   Optional. Block attributes for color resolution.
 * @param {Object}   props.context      Optional. Block context for color resolution.
 */
export default function Pagination({
	currentPage,
	totalPages,
	onPageChange,
	attributes = {},
	context = {},
	style: propStyle,
}) {
	if (totalPages <= 1) {
		return null;
	}

	const paginationColor = getEffectiveValue('pagination_color', attributes, context);
	const paginationBg = getEffectiveValue('pagination_background_color', attributes, context);
	const paginationActiveBg = getEffectiveValue('pagination_active_bg_color', attributes, context);
	const paginationActiveColor = getEffectiveValue('pagination_active_color', attributes, context);

	const style = {
		'--videopack-pagination-color': paginationColor,
		'--videopack-pagination-bg': paginationBg,
		'--videopack-pagination-active-bg': paginationActiveBg,
		'--videopack-pagination-active-color': paginationActiveColor,
		...propStyle,
	};

	const getPageNumbers = () => {
		const pages = [];
		const showMax = 5; // Max number of page buttons to show around current page

		if (totalPages <= showMax + 2) {
			// Show all pages if total is small
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Always show page 1
			pages.push(1);

			let start = Math.max(2, currentPage - 1);
			let end = Math.min(totalPages - 1, currentPage + 1);

			// Adjust start/end to always show 3 numbers in the middle if possible
			if (currentPage <= 3) {
				end = 4;
			} else if (currentPage >= totalPages - 2) {
				start = totalPages - 3;
			}

			if (start > 2) {
				pages.push('...');
			}

			for (let i = start; i <= end; i++) {
				pages.push(i);
			}

			if (end < totalPages - 1) {
				pages.push('...');
			}

			// Always show last page
			pages.push(totalPages);
		}

		return pages;
	};

	const pages = getPageNumbers();

	return (
		<nav
			className="videopack-pagination"
			aria-label={__('Pagination', 'video-embed-thumbnail-generator')}
			style={style}
		>
			<ul className="videopack-pagination-list">
				<li className="videopack-pagination-item">
					<button
						className={`videopack-pagination-button prev page-numbers ${
							currentPage <= 1 ? 'is-hidden videopack-hidden' : ''
						}`}
						onClick={() =>
							currentPage > 1 && onPageChange(currentPage - 1)
						}
						aria-label={__(
							'Previous Page',
							'video-embed-thumbnail-generator'
						)}
					>
						<span className="videopack-pagination-arrow">&lt;</span>
					</button>
				</li>

				{pages.map((page, index) => (
					<li key={index} className="videopack-pagination-item">
						{page === '...' ? (
							<span className="page-numbers dots">{page}</span>
						) : (
							<button
								className={`videopack-pagination-button page-numbers ${
									page === currentPage
										? 'is-active current'
										: ''
								}`}
								onClick={() =>
									typeof page === 'number' &&
									onPageChange(page)
								}
								aria-current={
									page === currentPage ? 'page' : undefined
								}
							>
								{page}
							</button>
						)}
					</li>
				))}

				<li className="videopack-pagination-item">
					<button
						className={`videopack-pagination-button next page-numbers ${
							currentPage >= totalPages
								? 'is-hidden videopack-hidden'
								: ''
						}`}
						onClick={() =>
							currentPage < totalPages &&
							onPageChange(currentPage + 1)
						}
						aria-label={__(
							'Next Page',
							'video-embed-thumbnail-generator'
						)}
					>
						<span className="videopack-pagination-arrow">&gt;</span>
					</button>
				</li>
			</ul>
		</nav>
	);
}
