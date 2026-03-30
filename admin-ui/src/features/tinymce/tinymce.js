/**
 * Features for integrating Videopack with the TinyMCE editor.
 */

import {
	createRoot,
	useState,
	useEffect,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';
import VideoGallery from '../../components/VideoGallery/VideoGallery';
import VideoList from '../../components/VideoList/VideoList';
import Pagination from '../../components/Pagination/Pagination';
/* global videopack_config, tinymce, MutationObserver */
import './tinymce.scss';

(function () {
	const PlaceHolderWrapper = ({ type, attributes, mountNode }) => {
		const [fullAttributes, setFullAttributes] = useState(attributes);
		const [isLoading, setIsLoading] = useState(type === 'Video');
		const [galleryPage, setGalleryPage] = useState(1);
		const [totalPages, setTotalPages] = useState(1);
		const [isSelected, setIsSelected] = useState(false);

		// Watch for selection changes on the wpview container
		useEffect(() => {
			const wpView = mountNode.closest('.wpview');
			if (!wpView) {
				return;
			}

			const updateSelection = () => {
				const selected = wpView.getAttribute('data-mce-selected');
				setIsSelected(selected === '1' || selected === '2');
			};

			updateSelection();

			const observer = new MutationObserver(updateSelection);
			observer.observe(wpView, {
				attributes: true,
				attributeFilter: ['data-mce-selected'],
			});

			return () => observer.disconnect();
		}, [mountNode]);

		// Fetch metadata for galleries/lists to get total pages
		useEffect(() => {
			if (type === 'Video') {
				return;
			}

			const args = {
				...attributes,
				gallery_pagination: true,
				gallery_per_page: attributes.gallery_per_page || 10,
				page_number: galleryPage,
			};

			apiFetch({
				path: `/videopack/v1/video_gallery?${new URLSearchParams(
					args
				).toString()}`,
			})
				.then((response) => {
					setFullAttributes((prev) => ({
						...prev,
						...(response.attributes || {}),
					}));
					setTotalPages(response.max_num_pages || 1);
				})
				.finally(() => setIsLoading(false));
		}, [type, attributes, galleryPage]);

		// Fetch metadata for single videos if only ID is provided
		useEffect(() => {
			if (type !== 'Video' || !attributes.id) {
				setIsLoading(false);
				return;
			}

			// If we have an ID, we almost always want to fetch its metadata to get sources/poster
			apiFetch({
				path: `/videopack/v1/video_gallery?gallery_include=${attributes.id}`,
			})
				.then((response) => {
					if (response.videos && response.videos.length > 0) {
						const video = response.videos[0];
						setFullAttributes((prev) => ({
							...video.player_vars,
							...prev,
							title: prev.title || video.title,
							poster: prev.poster || video.player_vars.poster,
							// Ensure the URL provided in the shortcode content (if any) takes precedence
							src: prev.url || prev.src || video.player_vars.src,
						}));
					}
				})
				.finally(() => setIsLoading(false));
		}, [type, attributes.id]);

		if (isLoading) {
			return (
				<div className="loading-placeholder">
					<div className="dashicons dashicons-admin-media"></div>
					<div className="wpview-loading">
						<ins></ins>
					</div>
				</div>
			);
		}

		let Component = VideoPlayer;
		if (type === 'Gallery') {
			Component = VideoGallery;
		} else if (type === 'List') {
			Component = VideoList;
		}

		const finalAttributes = {
			...(videopack_config?.options || {}),
			...(videopack_config?.defaults || {}),
			...fullAttributes,
			autoplay: false, // Never autoplay in TinyMCE preview
		};

		// If we only have a URL but no sources array, create a default one for the player
		if (
			finalAttributes.url &&
			(!finalAttributes.sources || finalAttributes.sources.length === 0)
		) {
			finalAttributes.src = finalAttributes.url;
			finalAttributes.sources = [
				{ src: finalAttributes.url, type: 'video/mp4' },
			];
		}

		const commonProps = {
			attributes: finalAttributes,
			isEditing: false,
			isSelected,
		};

		const galleryProps =
			type !== 'Video'
				? {
						galleryPage,
						setGalleryPage,
						totalPages,
						setTotalPages,
				  }
				: {};

		return (
			<div className="videopack-tinymce-wrapper">
				<Component {...commonProps} {...galleryProps} />
				{fullAttributes.gallery_pagination && totalPages > 1 && (
					<Pagination
						currentPage={galleryPage}
						totalPages={totalPages}
						onPageChange={setGalleryPage}
					/>
				)}
				{!isSelected && <div className="videopack-block-overlay" />}
			</div>
		);
	};

	/**
	 * Mounts a React component to a specific mount node within a container.
	 *
	 * @param {HTMLElement} container The container element (usually a WP View).
	 * @param {Object}      shortcode The shortcode object.
	 */
	function mountReactToNode(container, shortcode) {
		if (!container || typeof container.querySelector !== 'function') {
			return;
		}
		const mountNode = container.querySelector('.videopack-tinymce-mount');
		if (!mountNode || mountNode.dataset.videopackMounted) {
			return;
		}

		const attrs = { ...shortcode.attrs.named };
		const tag = shortcode.tag;

		// If the shortcode has content (e.g. [videopack]URL[/videopack]), map it to the url attribute
		if (shortcode.content && !attrs.url && !attrs.src) {
			attrs.url = shortcode.content.trim();
		}

		let type = 'Video';
		if (tag === 'videopack_gallery') {
			type = 'Gallery';
		} else if (tag === 'videopack_list') {
			type = 'List';
		} else {
			// [videopack] or legacy aliases
			const isGallery = attrs.gallery === 'true' || attrs.gallery === true;
			if (isGallery) {
				type = 'Gallery';
			} else {
				// Detect if it should be a list
				const hasMultipleIds = attrs.id && attrs.id.includes(',');
				const hasQuerySource =
					attrs.gallery_source ||
					attrs.gallery_category ||
					attrs.gallery_tag;
				const isEmptyAndNotUrl = !attrs.id && !attrs.url && !shortcode.content;
				const hasGalleryIdOnly =
					attrs.gallery_id &&
					!attrs.id &&
					!attrs.url &&
					!shortcode.content;

				if (
					hasMultipleIds ||
					hasQuerySource ||
					isEmptyAndNotUrl ||
					hasGalleryIdOnly
				) {
					type = 'List';
				} else {
					type = 'Video';
				}
			}
		}

		try {
			// Use createRoot for React 18+ compatibility
			if (!mountNode.__reactRoot) {
				mountNode.__reactRoot = createRoot(mountNode);
			}

			mountNode.__reactRoot.render(
				<PlaceHolderWrapper
					type={type}
					attributes={attrs}
					mountNode={mountNode}
				/>
			);
			mountNode.dataset.videopackMounted = 'true';
		} catch (e) {
			console.error('Videopack TinyMCE React render error:', e);
			mountNode.innerHTML =
				'<div class="videopack-render-error">Error rendering preview</div>';
		}
	}

	/**
	 * Scans all TinyMCE editors for Videopack mount points and mounts them.
	 */
	function scanAndMountAll() {
		if (
			typeof tinymce === 'undefined' ||
			!tinymce.editors ||
			typeof window.wp === 'undefined'
		) {
			return;
		}

		tinymce.editors.forEach((editor) => {
			const $doc = editor.getDoc();
			if (!$doc) {
				return;
			}

			// Find all WP Views for Videopack in this editor
			const views = editor.dom.select(
				'.wpview-wrap[data-wpview-type="videopack"], .wpview-wrap[data-wpview-type="KGVID"], .wpview-wrap[data-wpview-type="VIDEOPACK"], .wpview-wrap[data-wpview-type="FMP"], .wpview-wrap[data-wpview-type="videopack_gallery"], .wpview-wrap[data-wpview-type="videopack_list"]'
			);

			views.forEach((container) => {
				const viewText = container.getAttribute('data-wpview-text');
				if (!viewText) {
					return;
				}

				const shortcodeText = decodeURIComponent(viewText);
				const shortcodeMatch =
					window.wp.shortcode.next('videopack', shortcodeText) ||
					window.wp.shortcode.next('KGVID', shortcodeText) ||
					window.wp.shortcode.next('VIDEOPACK', shortcodeText) ||
					window.wp.shortcode.next('FMP', shortcodeText) ||
					window.wp.shortcode.next('videopack_gallery', shortcodeText) ||
					window.wp.shortcode.next('videopack_list', shortcodeText);

				if (shortcodeMatch && shortcodeMatch.shortcode) {
					mountReactToNode(container, shortcodeMatch.shortcode);
				}
			});
		});
	}

	/**
	 * Registers the Videopack views with TinyMCE.
	 */
	function registerVideopackViews() {
		// Prevent multiple registrations
		if (window.videopack_tinymce_registered) {
			return;
		}

		// Register Videopack views

		// Ensure we have access to wp.mce.views
		if (
			typeof window.wp === 'undefined' ||
			!window.wp.mce ||
			!window.wp.mce.views
		) {
			return;
		}

		const videopackViewConfig = {
			/**
			 * The template used to render the preview shell.
			 *
			 * @return {string} Template HTML.
			 */
			template() {
				return '<div class="videopack-tinymce-mount"></div>';
			},

			/**
			 * Called when the view is initialized.
			 * We trigger the render process here.
			 */
			initialize() {
				this.render(this.template());
			},

			/**
			 * Called after the view is inserted into the editor.
			 * We mount the React component here.
			 *
			 * @param {HTMLElement} container The container element.
			 */
			bind(container) {
				mountReactToNode(container, this.shortcode);
			},

			/**
			 * Called when the view is removed from the editor.
			 * We unmount the React component here for cleanup.
			 *
			 * @param {HTMLElement} container The container element.
			 */
			unbind(container) {
				if (!container || typeof container.querySelector !== 'function') {
					return;
				}
				const mountNode = container.querySelector(
					'.videopack-tinymce-mount'
				);
				if (mountNode && mountNode.__reactRoot) {
					try {
						mountNode.__reactRoot.unmount();
						delete mountNode.__reactRoot;
					} catch (e) {}
				}
			},

			/**
			 * Handles clicking the "Edit" button on the view.
			 *
			 * @param {string}   text           Shortcode text.
			 * @param {Function} updateCallback Callback to update the shortcode.
			 */
			edit(text, updateCallback) {
				if (typeof window.wp === 'undefined') {
					return;
				}
				const shortcode = window.wp.shortcode.next(
					this.shortcode.tag,
					text
				);
				const values = shortcode ? shortcode.shortcode.attrs.named : {};

				if (typeof window.wp.media === 'undefined') {
					return;
				}

				// If it's a single video with an ID, use the enhanced media modal
				if (values && values.id && values.id.indexOf(',') === -1) {
					const mediaFrame = window.wp.media({
						frame: 'select',
						title: __(
							'Edit Videopack Shortcode',
							'video-embed-thumbnail-generator'
						),
						button: {
							text: __(
								'Update',
								'video-embed-thumbnail-generator'
							),
						},
						multiple: false,
						library: {
							post__in: [values.id],
						},
					});

					const shortcodeTag = this.shortcode.tag;

					mediaFrame.on('open', function () {
						const selection = mediaFrame.state().get('selection');
						const attachment = window.wp.media.attachment(
							values.id
						);
						attachment.set('videopack_attributes', values);
						attachment.fetch().then(() => {
							selection.add([attachment]);
						});
					});

					mediaFrame.on('select', function () {
						const selection = mediaFrame
							.state()
							.get('selection')
							.first();
						if (!selection) {
							return;
						}

						const selectedId = selection.get('id');
						const videopackAttrs =
							selection.get('videopack_attributes') || {};
						const config = videopack_config || {};

						const finalAttrs = { id: selectedId };
						const possibleKeys = [
							'width',
							'height',
							'autoplay',
							'loop',
							'muted',
							'controls',
							'volume',
							'preload',
							'playback_rate',
							'playsinline',
							'poster',
							'downloadlink',
							'overlay_title',
							'play_button_color',
							'play_button_icon_color',
							'title_color',
							'title_background_color',
						];

						possibleKeys.forEach((key) => {
							const value = videopackAttrs[key];
							if (value !== undefined && value !== null) {
								const defaultValue = config.defaults?.[key];
								if (value !== defaultValue) {
									finalAttrs[key] = value;
								}
							}
						});

						const newShortcode = new window.wp.shortcode({
							tag: shortcodeTag,
							attrs: finalAttrs,
							type: 'closed',
						});

						updateCallback(newShortcode.string());
					});

					mediaFrame.open();
				} else {
					// Fallback to the Thickbox-based UI for galleries, lists, or non-attachment URLs
					const params = new URLSearchParams();
					params.append('videopack_tinymce_edit', '1');
					if (videopack_config?.classic_embed_nonce) {
						params.append(
							'videopack_nonce',
							videopack_config.classic_embed_nonce
						);
					}

					const urlValue = shortcode
						? (shortcode.shortcode.content
							? shortcode.shortcode.content.trim()
							: '')
						: '';

					for (const key in values) {
						if (Object.prototype.hasOwnProperty.call(values, key)) {
							params.append('videopack_' + key, values[key]);
						}
					}

					if (values.url) {
						params.append('videopack_url', values.url);
					} else if (
						urlValue &&
						values.id &&
						values.id.indexOf(',') !== -1
					) {
						params.append('videopack_id', values.id);
					} else if (urlValue && !values.id) {
						params.append('videopack_url', urlValue);
					}

					let thickboxTitle = __(
						'Edit Video',
						'video-embed-thumbnail-generator'
					);
					const isGallery = values.gallery === 'true';
					const urlValueToCheck = urlValue || '';
					let isListInEdit = false;
					if (!isGallery) {
						const hasMultipleIds =
							values.id && values.id.indexOf(',') !== -1;
						const hasMultipleContentElements =
							urlValueToCheck &&
							urlValueToCheck.indexOf(',') !== -1;
						const hasQuerySource =
							values.gallery_source ||
							values.gallery_category ||
							values.gallery_tag;
						const isEmptyAndNotUrl =
							!values.id && !values.url && !urlValueToCheck;
						const hasGalleryIdOnly =
							values.gallery_id &&
							!values.id &&
							!values.url &&
							!urlValueToCheck;

						isListInEdit =
							hasMultipleIds ||
							hasMultipleContentElements ||
							hasQuerySource ||
							isEmptyAndNotUrl ||
							hasGalleryIdOnly;
					}

					if (isGallery) {
						thickboxTitle = __(
							'Edit Gallery',
							'video-embed-thumbnail-generator'
						);
						params.set('tab', 'embedgallery');
					} else if (isListInEdit) {
						thickboxTitle = __(
							'Edit Video List',
							'video-embed-thumbnail-generator'
						);
						params.set('tab', 'embedlist');
					} else {
						params.set('tab', 'embedurl');
					}

					const tbUrl =
						window.ajaxurl.replace('admin-ajax.php', '') +
						'media-upload.php?type=embedurl&' +
						params.toString() +
						'&TB_iframe=true';

					window.videopack_tinymce_update_shortcode = (
						newShortcodeString
					) => {
						updateCallback(newShortcodeString);
						window.videopack_tinymce_update_shortcode = null;
						if (typeof window.tb_remove === 'function') {
							window.tb_remove();
						}
					};

					if (typeof window.tb_show === 'function') {
						window.tb_show(thickboxTitle, tbUrl);
					}
				}
			},
		};

		const tags = [
			'videopack',
			'VIDEOPACK',
			'KGVID',
			'FMP',
			'videopack_gallery',
			'videopack_list',
		];
		tags.forEach((tag) => {
			if (window.wp.mce.views.get(tag)) {
				window.wp.mce.views.unregister(tag);
			}
			window.wp.mce.views.register(tag, videopackViewConfig);
		});

		window.videopack_tinymce_registered = true;
	}

	// Register views initially if ready
	if (
		typeof window.wp !== 'undefined' &&
		window.wp.mce &&
		window.wp.mce.views
	) {
		registerVideopackViews();
	} else {
		document.addEventListener('DOMContentLoaded', registerVideopackViews);
	}

	/**
	 * Setup observers for TinyMCE editors to handle React mounting.
	 */
	function setupEditorObservers() {
		if (typeof tinymce === 'undefined') {
			return;
		}


		const initEditor = (editor) => {
			editor.on('init', () => {
				if (videopack_config?.globalStyles) {
					editor.dom.addStyle(videopack_config.globalStyles);
				}
				// Share videopack_config with the iframe window just in case
				editor.getWin().videopack_config = videopack_config;
			});

			editor.on('init setContent NodeChange', () => {
				setTimeout(scanAndMountAll, 100);
			});

			// Setup MutationObserver for the editor body
			const body = editor.getDoc()?.body;
			if (body) {
				const observer = new MutationObserver((mutations) => {
					let shouldScan = false;
					mutations.forEach((mutation) => {
						if (mutation.addedNodes.length > 0) {
							shouldScan = true;
						}
					});
					if (shouldScan) {
						scanAndMountAll();
					}
				});
				observer.observe(body, { childList: true, subtree: true });
			}
		};

		tinymce.on('AddEditor', (e) => {
			initEditor(e.editor);
		});

		// Initialize existing editors
		tinymce.editors.forEach((editor) => {
			initEditor(editor);
		});

		// Initial scan
		setTimeout(scanAndMountAll, 500);
	}

	// Wait for TinyMCE to be fully loaded
	if (typeof tinymce !== 'undefined') {
		setupEditorObservers();
	} else {
		document.addEventListener('DOMContentLoaded', setupEditorObservers);
	}
})();
