import { __ } from '@wordpress/i18n';
import './Pagination.scss';

/**
 * Standardized Pagination Component.
 *
 * @param {Object}   props              Props.
 * @param {number}   props.currentPage  The current active page.
 * @param {number}   props.totalPages   The total number of pages.
 * @param {Function} props.onPageChange Callback when a page is changed.
 */
export default function Pagination({ currentPage, totalPages, onPageChange }) {
	if (totalPages <= 1) {
		return null;
	}

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
		<div className="videopack-pagination">
			<button
				className={`videopack-pagination-button ${
					currentPage <= 1 ? 'is-hidden' : ''
				}`}
				onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
				aria-label={__(
					'Previous Page',
					'video-embed-thumbnail-generator'
				)}
			>
				<span className="videopack-pagination-arrow">{'<'}</span>
			</button>

			{pages.map((page, index) => (
				<button
					key={index}
					className={`videopack-pagination-button ${
						page === currentPage ? 'is-active' : ''
					} ${page === '...' ? 'is-ellipsis' : ''}`}
					disabled={page === '...'}
					onClick={() =>
						typeof page === 'number' && onPageChange(page)
					}
				>
					{page}
				</button>
			))}

			<button
				className={`videopack-pagination-button ${
					currentPage >= totalPages ? 'is-hidden' : ''
				}`}
				onClick={() =>
					currentPage < totalPages && onPageChange(currentPage + 1)
				}
				aria-label={__('Next Page', 'video-embed-thumbnail-generator')}
			>
				<span className="videopack-pagination-arrow">{'>'}</span>
			</button>
		</div>
	);
}
