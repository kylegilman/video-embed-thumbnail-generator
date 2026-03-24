/* global ResizeObserver */

import {
	createPortal,
	useState,
	useCallback,
	useEffect,
	useRef,
	useMemo,
} from '@wordpress/element';

/**
 * PreviewIframe component to isolate frontend styles from the admin UI.
 *
 * @param {Object} props                    Component props.
 * @param {Node}   props.children              Children to render inside the iframe.
 * @param {string} props.title                 Iframe title for accessibility.
 * @param {string} props.className             Optional class name for the iframe.
 * @param {Array}  props.resizeDependencies    Optional array of dependencies that trigger a resize when changed.
 * @param {boolean} props.fullScreen           Whether the iframe should occupy the full screen.
 */
const PreviewIframe = ({
	children,
	title = 'Preview',
	className = '',
	resizeDependencies = [],
	fullScreen = false,
}) => {
	const [contentRef, setContentRef] = useState(null);
	const mountNode = contentRef?.contentWindow?.document?.body;

	const isResizingRef = useRef(false);

	/**
	 * Measure and apply the correct iframe height.
	 */
	const resizeIframe = useCallback(() => {
		if (!contentRef || !mountNode || fullScreen || isResizingRef.current) {
			return;
		}

		isResizingRef.current = true;

		window.requestAnimationFrame(() => {
			if (!contentRef || !mountNode || fullScreen) {
				isResizingRef.current = false;
				return;
			}

			// Measure the natural height of the content wrapper.
			const wrapper = mountNode.querySelector('.videopack-iframe-content-wrapper');
			if (wrapper) {
				const naturalHeight = wrapper.offsetHeight;
				console.log(`PreviewIframe: natural height = ${naturalHeight}px`);

				if (naturalHeight > 50) {
					contentRef.style.height = `${naturalHeight}px`;
				}
			}

			setTimeout(() => {
				isResizingRef.current = false;
			}, 100);
		});
	}, [contentRef, mountNode, fullScreen]);

	// Trigger resize when dependencies change (e.g. alignment).
	useEffect(() => {
		resizeIframe();
	}, [resizeIframe, ...resizeDependencies]);

	const handleIframeLoad = useCallback(() => {
		if (contentRef) {
			const doc = contentRef.contentWindow.document;
			const head = doc.head;

			// Clear existing mirrored styles to prevent duplicates on reload.
			head.querySelectorAll('.videopack-mirrored-style').forEach(el => el.remove());

			// Mirror plugin and block styles into the iframe.
			document
				.querySelectorAll('link[rel="stylesheet"], style')
				.forEach((style) => {
					// Skip our own internal iframe styles to avoid conflicts.
					if (
						style.id !== 'videopack-isolated-global-styles' &&
						style.id !== 'videopack-iframe-reset' &&
						style.id !== 'videopack-global-styles'
					) {
						const clone = style.cloneNode(true);
						clone.classList.add('videopack-mirrored-style');
						head.appendChild(clone);
					}
				});

			// Add a basic reset and common styles to the iframe.
			if (!doc.getElementById('videopack-iframe-reset')) {
				const style = doc.createElement('style');
				style.id = 'videopack-iframe-reset';
				style.textContent = `
					html, body {
						margin: 0 !important;
						padding: 0 !important;
						font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
						background: transparent !important;
						overflow: hidden !important;
						height: auto !important;
					}
					.videopack-iframe-content-wrapper {
						display: flow-root;
						width: 100%;
						height: auto !important;
					}
					/* Ensure some common block editor wrapper behaviors */
					.wp-block-videopack-videopack-gallery,
					.wp-block-videopack-videopack-video {
						max-width: 100% !important;
					}
					/* Prevent player children with 100% height from inflating height during measurement */
					.videopack-video-player,
					.videopack-generic-player,
					.mejs-container,
					.video-js {
						height: auto !important;
						aspect-ratio: 16 / 9;
					}
					/* Specific to gallery modal overlay inside iframe */
					.videopack-modal-overlay {
						position: fixed !important;
						top: 0 !important;
						left: 0 !important;
						width: 100% !important;
						height: 100% !important;
						z-index: 99999 !important;
						background: rgba(0, 0, 0, 0.8) !important;
					}
				`;
				head.appendChild(style);
			}

			// Inject theme styles from WordPress global styles.
			if (!doc.getElementById('videopack-global-styles')) {
				const globalStyles =
					window.videopack_config?.globalStyles ||
					window.videopack_config?.global_styles;
				if (globalStyles) {
					const themeStyle = doc.createElement('style');
					themeStyle.id = 'videopack-global-styles';
					themeStyle.textContent = globalStyles;
					head.appendChild(themeStyle);
				}
			}
		}
	}, [contentRef]);

	// Measure once on mount and whenever the content or width changes.
	useEffect(() => {
		if (!contentRef || !mountNode || fullScreen) {
			return;
		}

		handleIframeLoad();
		
		// Watch for height changes within the content wrapper.
		const wrapper = mountNode.querySelector('.videopack-iframe-content-wrapper');
		if (!wrapper) {
			return;
		}

		// First measurement — after initial render.
		const t1 = setTimeout(resizeIframe, 600);
		// Second measurement — catches any deferred rendering (like MEJS).
		const t2 = setTimeout(resizeIframe, 1500);

		const containerObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { width, height } = entry.contentRect;
				if (width > 0 || height > 0) {
					resizeIframe();
				}
			}
		});
		containerObserver.observe(wrapper);

		return () => {
			clearTimeout(t1);
			clearTimeout(t2);
			containerObserver.disconnect();
		};
	}, [contentRef, mountNode, handleIframeLoad, resizeIframe, fullScreen]);

	const iframeStyle = useMemo(() => {
		if (fullScreen) {
			return {
				position: 'fixed',
				top: 0,
				left: 0,
				width: '100vw',
				height: '100vh',
				zIndex: 100000,
				border: 'none',
				background: 'transparent',
			};
		}
		return {
			width: '100%',
			border: 'none',
			background: '#fff',
		};
	}, [fullScreen]);

	return (
		<iframe
			ref={setContentRef}
			title={title}
			className={className}
			style={iframeStyle}
			onLoad={handleIframeLoad}
			scrolling="no"
		>
			{mountNode &&
				createPortal(
					<div className="videopack-iframe-content-wrapper">
						{children}
					</div>,
					mountNode
				)}
		</iframe>
	);
};

export default PreviewIframe;
