/**
 * Main entry point for the attachment details feature, handling React root injection and auto-generation logic.
 */
import { createRoot } from '@wordpress/element';
import AttachmentDetails from './components/AttachmentDetails';
import AttachmentPreview from './components/AttachmentPreview';
// No unused imports here now.
import './attachment-details.scss';

const config = window.videopack_config || {};

// Render on edit media screen.
const editMediaContainer = document.getElementById(
	'videopack-attachment-details-root'
);

if (editMediaContainer) {
	const urlParams = new URLSearchParams(window.location.search);
	const postId = urlParams.get('post');

	// Bridge native title/caption to React for real-time preview sync.
	const titleInput = document.getElementById('title');
	const captionInput = document.getElementById('excerpt');

	const syncMetadata = () => {
		const detail = {
			title: titleInput ? titleInput.value : '',
			caption: captionInput ? captionInput.value : '',
		};
		window.dispatchEvent(
			new CustomEvent('videopack_native_metadata_update', { detail })
		);
	};

	if (titleInput) {
		titleInput.addEventListener('input', syncMetadata);
	}
	if (captionInput) {
		captionInput.addEventListener('input', syncMetadata);
	}

	// 1. Handle Sidebar (Settings) Component
	const videopackReactRoot = createRoot(editMediaContainer);
	videopackReactRoot.render(<AttachmentDetails attachmentId={postId} />);

	// 2. Handle Preview Component (Replace native holder)
	const nativePreview = document.querySelector('.wp_attachment_holder');
	if (
		nativePreview &&
		config.replace_preview_video !== '' &&
		config.replace_preview_video !== false
	) {
		// Clean up native MediaElement.js players if they exist to prevent orphaned listeners.
		if (typeof window.mejs !== 'undefined' && window.mejs.players) {
			Object.keys(window.mejs.players).forEach((playerId) => {
				const player = window.mejs.players[playerId];
				if (
					player &&
					player.container &&
					(nativePreview.contains(player.container) ||
						nativePreview.contains(player.node) ||
						nativePreview.contains(player.media))
				) {
					try {
						// Trigger pause if playing to avoid orphaned audio.
						if (typeof player.pause === 'function') {
							player.pause();
						}
						player.remove();
					} catch (e) {
						// eslint-disable-next-line no-console
						console.warn(
							'Videopack: Failed to remove native MEJS player',
							e
						);
					}
				}
			});
		}

		nativePreview.innerHTML = '';
		const previewRootDiv = document.createElement('div');
		previewRootDiv.id = 'videopack-attachment-preview-root';
		nativePreview.appendChild(previewRootDiv);

		const previewRoot = createRoot(previewRootDiv);
		previewRoot.render(<AttachmentPreview attachmentId={postId} />);
	}
}

// --- Media Library (Modal/Grid) Extension ---

/**
 * Robustly extends wp.media.view.Attachment.Details with Videopack components.
 * Retries if wp.media core objects are not yet initialized.
 *
 * @param {number} attempts Number of attempts already made.
 */
function initVideopackMediaExtension(attempts = 0) {
	if (
		typeof wp === 'undefined' ||
		!wp.media ||
		!wp.media.view ||
		!wp.media.view.Attachment.Details
	) {
		if (attempts < 10) {
			window.requestAnimationFrame(() =>
				initVideopackMediaExtension(attempts + 1)
			);
		} else {
			// eslint-disable-next-line no-console
			console.error(
				'Videopack: wp.media.view.Attachment.Details is not available after multiple attempts.'
			);
		}
		return;
	}

	const originalAttachmentDetails = wp.media.view.Attachment.Details;

	const extendedAttachmentDetails = originalAttachmentDetails.extend({
		// A reference to the React root instances.
		videopackReactRoot: null,
		videopackPreviewRoot: null,

		initialize() {
			// Call the original initialize method.
			originalAttachmentDetails.prototype.initialize.apply(
				this,
				arguments
			);
			// Listen for the 'ready' event, which is fired after the view is rendered.
			this.on('ready', this.renderVideopackComponent, this);
			// Also listen for model changes in case type/metadata is fetched later.
			this.model.on('change', this.renderVideopackComponent, this);
		},

		renderVideopackComponent() {
			const attachmentId = this.model.attributes.id;

			// Don't re-render if it's already the same attachment.
			if (
				(this.videopackReactRoot || this.videopackPreviewRoot) &&
				this.renderedAttachmentId === attachmentId
			) {
				return;
			}

			// Check if the attachment is a video.
			const isVideo = this.model.attributes.type === 'video';
			const isAnimatedGif =
				this.model.attributes.subtype === 'gif' &&
				this.model.attributes.meta?.['_videopack-meta']?.animated;

			if (isVideo || isAnimatedGif) {
				// Use requestAnimationFrame to ensure the DOM is ready for our injected div.
				window.requestAnimationFrame(() => {
					// Verify we haven't been removed or changed since the frame was requested.
					if (this.model.attributes.id !== attachmentId) {
						return;
					}

					// Try different selectors for the settings sidebar.
					let settingsSection = this.$el.find('.settings');
					if (settingsSection.length === 0) {
						settingsSection = this.$el.find('.attachment-details');
					}
					if (settingsSection.length === 0) {
						settingsSection = this.$el.find('.attachment-info');
					}
					if (settingsSection.length === 0) {
						if (this.$el.hasClass('attachment-details')) {
							settingsSection = this.$el;
						}
					}

					if (settingsSection.length === 0) {
						return;
					}

					// 1. Handle Sidebar (Settings) Component
					// Cleanup existing root if any.
					if (this.videopackReactRoot) {
						this.videopackReactRoot.unmount();
						this.videopackReactRoot = null;
					}

					// Create and append the root div for our React component.
					const reactRootDiv = document.createElement('div');
					reactRootDiv.id = 'videopack-attachment-details-root';
					settingsSection.append(reactRootDiv);

					// Create a new React root and render the component.
					this.videopackReactRoot = createRoot(reactRootDiv);
					this.videopackReactRoot.render(
						<AttachmentDetails
							attachmentId={attachmentId}
							model={this.model}
						/>
					);

					// 2. Handle Preview Component
					const previewSection = this.$el.find(
						'.attachment-media-view'
					);
					if (
						previewSection.length > 0 &&
						config.replace_preview_video !== '' &&
						config.replace_preview_video !== false
					) {
						// Cleanup existing preview root if any.
						if (this.videopackPreviewRoot) {
							this.videopackPreviewRoot.unmount();
							this.videopackPreviewRoot = null;
						}

						// Clear the preview section thumbnail to make room for our component.
						const thumbnailDiv = previewSection.find('.thumbnail');
						if (thumbnailDiv.length > 0) {
							thumbnailDiv.empty();
							const previewRootDiv =
								document.createElement('div');
							previewRootDiv.id =
								'videopack-attachment-preview-root';
							thumbnailDiv.append(previewRootDiv);

							this.videopackPreviewRoot =
								createRoot(previewRootDiv);
							this.videopackPreviewRoot.render(
								<AttachmentPreview
									attachmentId={attachmentId}
									model={this.model}
								/>
							);
						}
					}

					this.renderedAttachmentId = attachmentId;
				});
			}
		},

		// We also need to override remove to clean up our React roots.
		remove() {
			// Unmount the React components when the view is removed.
			if (this.videopackReactRoot) {
				this.videopackReactRoot.unmount();
				this.videopackReactRoot = null;
			}
			if (this.videopackPreviewRoot) {
				this.videopackPreviewRoot.unmount();
				this.videopackPreviewRoot = null;
			}

			// Call the original remove method.
			return originalAttachmentDetails.prototype.remove.apply(
				this,
				arguments
			);
		},
	});

	// Replace the original view with our extended one.
	wp.media.view.Attachment.Details = extendedAttachmentDetails;
}

// Start the extension initialization.
initVideopackMediaExtension();

// --- Auto-Generation Logic ---
// Moved to Videopack Pro.
