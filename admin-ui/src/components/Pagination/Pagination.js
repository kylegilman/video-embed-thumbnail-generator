import { __ } from '@wordpress/i18n';
import useVideopackContext from '../../hooks/useVideopackContext';

/**
 * A standardized pagination component for use in both blocks and previews.
 *
 * @param {Object}   props              Component props.
 * @param {number}   props.currentPage  The current active page.
 * @param {number}   props.totalPages   The total number of pages.
 * @param {Function} props.onPageChange Callback when a page is changed.
 * @param {Object}   props.attributes   Optional. Block attributes for color resolution.
 * @param {Object}   props.context      Optional. Block context for color resolution.
 * @param {Object}   props.style        Optional. Additional styles.
 */
export default function Pagination({
	currentPage: propCurrentPage,
	totalPages: propTotalPages,
	onPageChange: propOnPageChange,
	attributes = {},
	context = {},
	style: propStyle,
}) {
	const vpContext = useVideopackContext(attributes, context);
	const {
		pagination_color,
		pagination_background_color,
		pagination_active_bg_color,
		pagination_active_color,
		currentPage: contextPage,
		totalPages: contextTotal,
		onPageChange: contextOnChange,
	} = vpContext.resolved;

	const current = propCurrentPage ?? contextPage ?? 1;
	const total = propTotalPages ?? contextTotal ?? 1;
	const onChange = propOnPageChange ?? contextOnChange ?? (() => {});

	if (total <= 1) {
		return null;
	}

	const style = {
		'--videopack-pagination-color': pagination_color,
		'--videopack-pagination-bg': pagination_background_color,
		'--videopack-pagination-active-bg': pagination_active_bg_color,
		'--videopack-pagination-active-color': pagination_active_color,
		...propStyle,
	};

	const getPageNumbers = () => {
		const pages = [];
		const showMax = 5; // Max number of page buttons to show around current page

		if (total <= showMax + 2) {
			// Show all pages if total is small
			for (let i = 1; i <= total; i++) {
				pages.push(i);
			}
		} else {
			// Always show page 1
			pages.push(1);

			let start = Math.max(2, current - 1);
			let end = Math.min(total - 1, current + 1);

			// Adjust start/end to always show 3 numbers in the middle if possible
			if (current <= 3) {
				end = 4;
			} else if (current >= total - 2) {
				start = total - 3;
			}

			if (start > 2) {
				pages.push('...');
			}

			for (let i = start; i <= end; i++) {
				pages.push(i);
			}

			if (end < total - 1) {
				pages.push('...');
			}

			// Always show last page
			pages.push(total);
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
							current <= 1 ? 'is-hidden videopack-hidden' : ''
						}`}
						onClick={() => current > 1 && onChange(current - 1)}
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
									page === current ? 'is-active current' : ''
								}`}
								onClick={() =>
									typeof page === 'number' && onChange(page)
								}
								aria-current={
									page === current ? 'page' : undefined
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
							current >= total ? 'is-hidden videopack-hidden' : ''
						}`}
						onClick={() => current < total && onChange(current + 1)}
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
