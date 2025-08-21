import { useState, useEffect, useRef } from '@wordpress/element';
import { getFreemiusPage } from '../../../utils/utils';
import { Spinner } from '@wordpress/components';

/**
 * A component to render Freemius pages fetched via the REST API.
 * It handles dangerously setting the HTML and executing any inline scripts.
 *
 * @param {Object} props      Component props.
 * @param {string} props.page The Freemius page slug ('account' or 'add-ons').
 * @return {JSX.Element} The rendered component.
 */
const FreemiusPage = ({ page }) => {
	const [content, setContent] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const containerRef = useRef(null);

	useEffect(() => {
		setIsLoading(true);
		getFreemiusPage(page)
			.then((response) => {
				setContent(response.html);
				setIsLoading(false);
			})
			.catch((error) => {
				// eslint-disable-next-line no-console
				console.error(`Error fetching Freemius page '${page}':`, error);
				setContent(
					`<div class="notice notice-error"><p>Error loading page: ${error.message}</p></div>`
				);
				setIsLoading(false);
			});
	}, [page]);

	// Effect to execute scripts after the HTML content is rendered.
	useEffect(() => {
		if (!content || !containerRef.current) {
			return;
		}

		const container = containerRef.current;
		const scripts = Array.from(container.querySelectorAll('script'));

		scripts.forEach((oldScript) => {
			const newScript = document.createElement('script');
			for (const attr of oldScript.attributes) {
				newScript.setAttribute(attr.name, attr.value);
			}
			newScript.text = oldScript.text;
			oldScript.parentNode.replaceChild(newScript, oldScript);
		});
	}, [content]);

	if (isLoading) {
		return <Spinner />;
	}

	return (
		<div
			className="freemius-page-container"
			ref={containerRef}
			dangerouslySetInnerHTML={{ __html: content }}
		/>
	);
};

export default FreemiusPage;
