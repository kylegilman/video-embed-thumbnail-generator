/**
 * Features for integrating Videopack with the TinyMCE editor.
 */

import { createRoot, useState, useEffect, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { TemplatePreview } from '../../components/Preview';
import { getGridTemplate, getListTemplate } from '../../utils/templates';
import useVideopackContext from '../../hooks/useVideopackContext';
import useVideoQuery from '../../hooks/useVideoQuery';
/* global videopack_config, tinymce, MutationObserver, videojs */
import './tinymce.scss';

(function () {
	/**
	 * Robustly detects the current post ID in various WordPress editor environments.
	 *
	 * @return {number|null} The detected post ID or null if not found.
	 */
	const detectPostId = () => {
		const results = {};

		// 1. Explicitly localized config
		results.config = videopack_config?.postId;

		// 2. WordPress media view settings
		results.wpMedia = window.wp?.media?.view?.settings?.post?.id;

		// 3. Raw DOM element
		results.dom = document.getElementById('post_ID')?.value;

		// 4. URL Parameters
		results.url = new URLSearchParams(window.location.search).get('post');

		// 5. Parent Window (if in iframe like TinyMCE)
		try {
			if (window.parent && window.parent !== window) {
				results.parentDom =
					window.parent.document.getElementById('post_ID')?.value;
				results.parentUrl = new URLSearchParams(
					window.parent.location.search
				).get('post');
				results.parentWpMedia =
					window.parent.wp?.media?.view?.settings?.post?.id;
			}
		} catch {
			// Cross-origin issues, ignore
		}

		// 6. Gutenberg State (if active)
		try {
			const wpData = window.wp?.data || window.parent?.wp?.data;
			if (wpData) {
				results.gutenberg = wpData
					.select('core/editor')
					?.getCurrentPostId();
			}
		} catch {
			// ignore
		}

		for (const key in results) {
			const val = parseInt(results[key], 10);
			if (val && !isNaN(val)) {
				return val;
			}
		}

		return null;
	};

	const PlaceHolderWrapper = ({ type, attributes, mountNode }) => {
		const activePostId = useMemo(() => detectPostId(), []);
		// Use unified context hook for all design and behavior resolution.
		// TinyMCE doesn't have block context, so we pass an empty object.
		const vpContext = useVideopackContext(
			attributes,
			{},
			{ excludeHoverTrigger: true }
		);
		const mergedAttributes = useMemo(() => {
			const resolved = { ...vpContext.resolved };
			resolved.autoplay = false; // Never autoplay in TinyMCE preview

			// Fix for gallery_source="current" in TinyMCE/REST context where get_the_ID() is 0.
			if (
				resolved.gallery_source === 'current' &&
				(!resolved.gallery_id ||
					resolved.gallery_id === '0' ||
					parseInt(resolved.gallery_id, 10) === 0)
			) {
				if (activePostId) {
					resolved.gallery_id = activePostId;
				}
			}
			return resolved;
		}, [vpContext.resolved, activePostId]);

		const { videoResults, isResolving, maxNumPages } = useVideoQuery(
			{ ...mergedAttributes, page_number: 1 },
			activePostId
		);
		const [isSelected, setIsSelected] = useState(false);
		const themePresetsStyle = useMemo(() => {
			const colors = videopack_config?.themeColors || [];
			const styles = {};
			colors.forEach((c) => {
				styles[`--wp--preset--color--${c.slug}`] = c.color;
			});
			return styles;
		}, []);

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

		if (isResolving) {
			return (
				<div className="loading-placeholder">
					<div className="dashicons dashicons-admin-media"></div>
					<div className="wpview-loading">
						<ins></ins>
					</div>
				</div>
			);
		}

		// Resolve template
		let template;
		if (type === 'Video') {
			const showTitleBar = !!(
				mergedAttributes.overlay_title !== false ||
				mergedAttributes.downloadlink ||
				mergedAttributes.embedcode
			);

			const engineChildren = [];
			if (showTitleBar) {
				engineChildren.push(['videopack/title', {}]);
			}
			if (mergedAttributes.watermark) {
				engineChildren.push(['videopack/watermark', {}]);
			}

			const videoChildren = [['videopack/player', {}, engineChildren]];

			if (mergedAttributes.views) {
				videoChildren.push(['videopack/view-count', {}]);
			}

			template = [['videopack/player-container', {}, videoChildren]];
		} else if (type === 'Gallery') {
			template = getGridTemplate(mergedAttributes);
		} else {
			template = getListTemplate(mergedAttributes);
		}

		const contextValue = {
			...vpContext.sharedContext,
			'videopack/videos': videoResults,
			'videopack/layout': type === 'Gallery' ? 'grid' : 'list',
			'videopack/columns':
				parseInt(mergedAttributes.gallery_columns, 10) || 3,
			'videopack/totalPages': maxNumPages,
			'videopack/currentPage': 1,
		};

		return (
			<div
				className="videopack-tinymce-wrapper"
				style={themePresetsStyle}
			>
				{videopack_config?.globalStyles && (
					<style
						dangerouslySetInnerHTML={{
							__html: videopack_config.globalStyles,
						}}
					/>
				)}
				<TemplatePreview
					attributes={mergedAttributes}
					template={template}
					context={contextValue}
					video={videoResults[0]}
					postId={detectPostId()}
				/>
				{!isSelected && <div className="videopack-block-overlay" />}
			</div>
		);
	};

	/**
	 * Mounts a React component to a specific mount node within a container.
	 *
	 * @param {HTMLElement} container     The container element (usually a WP View).
	 * @param {Object}      shortcodeData The shortcode object or match.
	 */
	function mountReactToNode(container, shortcodeData) {
		if (!container || typeof container.querySelector !== 'function') {
			return;
		}

		// Normalize shortcode object
		const shortcode = shortcodeData.shortcode || shortcodeData;

		const mountNode = container.querySelector('.videopack-tinymce-mount');
		if (!mountNode) {
			// If not ready yet, we'll catch it in the next scan or bind call.
			return;
		}

		if (mountNode.dataset.videopackMounted) {
			return;
		}

		// Normalize attributes and tag
		const attrs = {
			...(shortcode.attrs && shortcode.attrs.named
				? shortcode.attrs.named
				: shortcode.attrs || {}),
		};

		// If the shortcode has content (e.g. [videopack]URL[/videopack]), map it to the src attribute ONLY if id is missing
		if (shortcode.content && !attrs.id && !attrs.src) {
			attrs.src = shortcode.content.trim();
		}

		let type = 'Video';
		// [videopack] or legacy aliases
		const isGallery = attrs.gallery === 'true' || attrs.gallery === true;
		if (isGallery) {
			type = 'Gallery';
		} else {
			// Detect if it should be a list
			const hasMultipleIds =
				attrs.id &&
				typeof attrs.id === 'string' &&
				attrs.id.includes(',');
			const hasQuerySource =
				attrs.gallery_source ||
				attrs.gallery_category ||
				attrs.gallery_tag;
			const isEmptyAndNotUrl =
				!attrs.id && !attrs.src && !shortcode.content;
			const hasGalleryIdOnly =
				attrs.gallery_id &&
				!attrs.id &&
				!attrs.src &&
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
		} catch (error) {
			console.error('Videopack TinyMCE React render error:', error);
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
				'.wpview-wrap[data-wpview-type="videopack"], .wpview-wrap[data-wpview-type="KGVID"], .wpview-wrap[data-wpview-type="VIDEOPACK"], .wpview-wrap[data-wpview-type="FMP"]'
			);

			views.forEach((container) => {
				try {
					const viewText = container.getAttribute('data-wpview-text');
					if (!viewText) {
						return;
					}

					const shortcodeText = decodeURIComponent(viewText);
					const tags = ['videopack', 'KGVID', 'VIDEOPACK', 'FMP'];

					let shortcodeMatch = null;
					for (const tag of tags) {
						// Using next() on the specific shortcodeText for the view.
						// This should be clean as shortcodeText is local to this view.
						const match = window.wp.shortcode.next(
							tag,
							shortcodeText
						);
						if (match && match.shortcode) {
							shortcodeMatch = match.shortcode;
							break;
						}
					}

					if (shortcodeMatch) {
						mountReactToNode(container, shortcodeMatch);
					}
				} catch (error) {
					console.error('Videopack scanAndMountAll error:', error);
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
				if (
					!container ||
					typeof container.querySelector !== 'function'
				) {
					return;
				}
				const mountNode = container.querySelector(
					'.videopack-tinymce-mount'
				);
				if (mountNode && mountNode.__reactRoot) {
					try {
						mountNode.__reactRoot.unmount();
						delete mountNode.__reactRoot;
					} catch {
						// ignore
					}
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
							'play_button_secondary_color',
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

					let urlValue = '';
					if (
						shortcode &&
						shortcode.shortcode &&
						shortcode.shortcode.content
					) {
						urlValue = shortcode.shortcode.content.trim();
					}

					for (const key in values) {
						if (Object.prototype.hasOwnProperty.call(values, key)) {
							params.append('videopack_' + key, values[key]);
						}
					}

					let urlValueToAppend = '';
					if (values.url) {
						urlValueToAppend = values.url;
					} else if (
						urlValue &&
						values.id &&
						values.id.indexOf(',') !== -1
					) {
						urlValueToAppend = values.id;
					} else if (urlValue && !values.id) {
						urlValueToAppend = urlValue;
					}

					if (urlValueToAppend) {
						params.append('videopack_url', urlValueToAppend);
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

		const tags = ['videopack', 'VIDEOPACK', 'KGVID', 'FMP'];
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

		let videopack_scan_timeout;
		const debouncedScan = () => {
			if (videopack_scan_timeout) {
				clearTimeout(videopack_scan_timeout);
			}
			videopack_scan_timeout = setTimeout(scanAndMountAll, 150);
		};

		const initEditor = (editor) => {
			editor.on('init', () => {
				if (typeof videojs !== 'undefined') {
					editor.getWin().videojs = videojs;
				}
				// Share videopack_config and videojs with the iframe window
				editor.getWin().videopack_config = videopack_config;
			});

			editor.on('init setContent NodeChange', () => {
				debouncedScan();
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
						debouncedScan();
					}
				});
				observer.observe(body, { childList: true, subtree: true });
			}
		};

		tinymce.on('AddEditor', (event) => {
			initEditor(event.editor);
		});

		// Initialize existing editors
		tinymce.editors.forEach((editor) => {
			initEditor(editor);
		});

		// Initial scan
		debouncedScan();
	}

	// Wait for TinyMCE to be fully loaded
	if (typeof tinymce !== 'undefined') {
		setupEditorObservers();
	} else {
		document.addEventListener('DOMContentLoaded', setupEditorObservers);
	}
})();
