import { createRoot } from '@wordpress/element';
import AttachmentDetails from './AttachmentDetails';

// render on edit media screen
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
	console.log('Videopack: Extending wp.media.view.Attachment.Details.');

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
		},

		renderVideopackComponent() {
			console.log(
				'Videopack: Attachment details ready. Rendering React component.'
			);

			// Unmount any existing React component before re-rendering.
			if (this.videopackReactRoot) {
				console.log('Videopack: Unmounting existing React component.');
				this.videopackReactRoot.unmount();
				this.videopackReactRoot = null;
			}

			// Check if the attachment is a video.
			const isVideo = this.model.attributes.type === 'video';
			const isAnimatedGif =
				this.model.attributes.subtype === 'gif' &&
				this.model.attributes.meta?.['_kgvid-meta']?.animated;

			if (isVideo || isAnimatedGif) {
				console.log(
					'Videopack: Video or animated GIF detected. Mounting React component.'
				);

				// Find the .settings section in the attachment details sidebar.
				// Note: We use this.$el to scope the find to this view's element.
				const settingsSection = this.$el.find('.settings');
				if (settingsSection.length === 0) {
					console.error(
						'Videopack: Could not find the .settings section in the attachment details sidebar.'
					);
					return;
				}

				// Create and append the root div for our React component.
				const reactRootDiv = document.createElement('div');
				reactRootDiv.id = 'videopack-attachment-details-root';
				settingsSection.append(reactRootDiv);

				// Create a new React root and render the component.
				this.videopackReactRoot = createRoot(reactRootDiv);
				this.videopackReactRoot.render(
					<AttachmentDetails attachmentId={this.model.attributes.id} />
				);
				console.log('Videopack: React component mounted successfully.');
			} else {
				console.log(
					'Videopack: Attachment is not a video, skipping React component.'
				);
			}
		},

		// We also need to override remove to clean up our React root.
		remove() {
			// Unmount the React component when the view is removed.
			if (this.videopackReactRoot) {
				console.log(
					'Videopack: Unmounting React component on view removal.'
				);
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
