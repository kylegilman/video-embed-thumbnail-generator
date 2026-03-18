/**
 * Main entry point for the attachment details feature, handling React root injection and auto-generation logic.
 */

import { createRoot } from '@wordpress/element';
import AttachmentDetails from './components/AttachmentDetails';
import {
	captureVideoFrame,
	getVideoMetadata,
	calculateTimecodes,
} from '../../utils/video-capture';
import { createThumbnailFromCanvas, setPosterImage } from '../../utils/utils';
import { __, sprintf } from '@wordpress/i18n';
import './attachment-details.scss';

// Render on edit media screen.
const editMediaContainer = document.getElementById(
	'videopack-attachment-details-root'
);

if (editMediaContainer) {
	const urlParams = new URLSearchParams(window.location.search);
	const postId = urlParams.get('post');

	// Create a new React root and render the component.
	const videopackReactRoot = createRoot(editMediaContainer);
	videopackReactRoot.render(<AttachmentDetails attachmentId={postId} />);
}

// Ensure wp.media is loaded.
if (
	typeof wp === 'undefined' ||
	!wp.media ||
	!wp.media.view ||
	!wp.media.view.Attachment.Details
) {
	console.error(
		'Videopack: wp.media.view.Attachment.Details is not available.'
	);
} else {
	const originalAttachmentDetails = wp.media.view.Attachment.Details;

	const extendedAttachmentDetails = originalAttachmentDetails.extend({
		// A reference to the React root instance.
		videopackReactRoot: null,

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
				this.videopackReactRoot &&
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

					let settingsSection = this.$el.find('.settings');
					if (settingsSection.length === 0) {
						if (this.$el.hasClass('attachment-details')) {
							settingsSection = this.$el;
						}
					}

					if (settingsSection.length === 0) {
						return;
					}

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
					this.renderedAttachmentId = attachmentId;
				});
			}
		},

		// We also need to override remove to clean up our React root.
		remove() {
			// Unmount the React component when the view is removed.
			if (this.videopackReactRoot) {
				this.videopackReactRoot.unmount();
				this.videopackReactRoot = null;
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

// --- Auto-Generation Logic ---

document.addEventListener('DOMContentLoaded', () => {
	if (typeof wp === 'undefined' || !wp.media) {
		return;
	}

	const config = window.videopack_config || {};

	// 1. Handle new uploads (hook into wp.media)
	// Only run if auto_thumb is enabled and FFmpeg is NOT handling it.
	if (config.auto_thumb && config.ffmpeg_exists !== true) {
		const { media } = wp;

		if (
			media.model &&
			media.model.Attachments &&
			media.model.Attachments.prototype.add
		) {
			const originalAdd = media.model.Attachments.prototype.add;

			media.model.Attachments.prototype.add = function (models, options) {
				const added = originalAdd.apply(this, [models, options]);

				if (!added) {
					return added;
				}
				const newModels = Array.isArray(added) ? added : [added];

				newModels.forEach((model) => {
					// Check if it's a video and currently uploading.
					if (
						model &&
						typeof model.get === 'function' &&
						model.get('type') === 'video' &&
						model.get('uploading') === true
					) {
						const onUploadComplete = () => {
							if (model.get('uploading') === false) {
								model.off('change:uploading', onUploadComplete);
								// Small delay to ensure processing is done and URL is valid.
								setTimeout(
									() =>
										processVideoItem(
											model.get('id'),
											model.get('url'),
											config,
											model
										),
									500
								);
							}
						};
						model.on('change:uploading', onUploadComplete);
					}
				});

				return added;
			};
		}
	}

	// 2. Handle pending attachments (flagged from backend)
	if (config.pending_attachments && config.pending_attachments.length > 0) {
		processPendingAttachments(config.pending_attachments, config);
	}
});

/**
 * Processes a list of pending attachments and polls for more when finished.
 *
 * @param {Array}  attachments List of attachment objects {id, url}.
 * @param {Object} config      Plugin configuration.
 */
async function processPendingAttachments(attachments, config) {
	if (!attachments || attachments.length === 0) {
		return;
	}

	const total = attachments.length;
	let count = 0;

	const notice = showNotice(
		sprintf(
			/* translators: %d: number of videos */
			__(
				'Generating thumbnails for %d videos…',
				'video-embed-thumbnail-generator'
			),
			total
		)
	);

	for (const att of attachments) {
		try {
			await processVideoItem(att.id, att.url, config);
			count++;
			notice.textContent = sprintf(
				/* translators: 1: current count, 2: total count */
				__(
					'Generating thumbnails: %1$d / %2$d',
					'video-embed-thumbnail-generator'
				),
				count,
				total
			);
		} catch (e) {
			console.error(
				'Videopack: Failed to process pending video',
				att.id,
				e
			);
		}
	}

	// Check for more pending attachments
	try {
		const nextBatch = await wp.apiFetch({
			path: '/videopack/v1/thumbs/browser-candidates',
		});
		if (nextBatch && nextBatch.length > 0) {
			processPendingAttachments(nextBatch, config);
		} else {
			notice.textContent = __(
				'Thumbnail generation complete.',
				'video-embed-thumbnail-generator'
			);
			setTimeout(() => {
				if (notice.parentNode) {
					notice.parentNode.removeChild(notice);
				}
			}, 3000);
		}
	} catch (e) {
		console.error('Videopack: Failed to fetch next batch of thumbnails', e);
	}
}

/**
 * Generates thumbnails for a video.
 *
 * @param {number}                    id     The attachment ID.
 * @param {string}                    src    The video URL.
 * @param {Object}                    config The plugin configuration.
 * @param {wp.media.model.Attachment} model  Optional. The attachment model to update.
 */
async function processVideoItem(id, src, config, model = null) {
	const totalThumbnails = Number(config.auto_thumb_number) || 1;
	const position = Number(config.auto_thumb_position) || 50;
	const watermarkOptions = config.ffmpeg_thumb_watermark;

	try {
		const video = await getVideoMetadata(src);
		const duration = video.duration;

		if (!duration) {
			throw new Error('Invalid duration');
		}

		const timecodes = calculateTimecodes(duration, totalThumbnails, {
			position,
		});
		const generatedThumbs = [];

		for (const time of timecodes) {
			try {
				const canvas = await captureVideoFrame(
					video,
					time,
					watermarkOptions
				);
				const response = await createThumbnailFromCanvas(
					canvas,
					id,
					src
				);
				if (response && response.thumb_url) {
					generatedThumbs.push(response);
				}
			} catch (e) {
				console.error('Videopack: Auto-thumbnail generation failed', e);
			}
		}

		if (generatedThumbs.length > 0) {
			// Determine which thumbnail should be the poster
			let posterIndex = 0;
			if (totalThumbnails > 1) {
				posterIndex = position - 1;
				if (posterIndex < 0) {
					posterIndex = 0;
				}
				if (posterIndex >= totalThumbnails) {
					posterIndex = totalThumbnails - 1;
				}
			}

			// The server automatically sets the last uploaded thumbnail as the featured image.
			// If the desired poster is NOT the last one, we must explicitly set it.
			if (posterIndex >= generatedThumbs.length) {
				posterIndex = generatedThumbs.length - 1;
			}

			if (posterIndex !== generatedThumbs.length - 1) {
				const posterThumb = generatedThumbs[posterIndex];
				try {
					await setPosterImage(id, posterThumb.thumb_url);
				} catch (e) {
					console.error('Videopack: Failed to set poster', e);
				}
			}

			// Update the model to reflect changes
			if (model) {
				await model.fetch();
			}
		}

		// Cleanup
		video.src = '';
		video.load();
	} catch (e) {
		console.error('Videopack: Video processing failed', e);
	}
}

/**
 * Displays a fixed notification.
 *
 * @param {string} message The message to display.
 * @return {HTMLElement} The notice element.
 */
function showNotice(message) {
	let notice = document.getElementById('videopack-auto-gen-notice');
	if (!notice) {
		notice = document.createElement('div');
		notice.id = 'videopack-auto-gen-notice';
		notice.style.cssText =
			'position: fixed; bottom: 20px; right: 20px; background: #fff; border-left: 4px solid #00a32a; box-shadow: 0 1px 1px 0 rgba(0,0,0,.1); padding: 10px 20px; z-index: 99999; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif; font-size: 13px;';
		document.body.appendChild(notice);
	}
	notice.textContent = message;
	notice.style.display = 'block';
	return notice;
}
