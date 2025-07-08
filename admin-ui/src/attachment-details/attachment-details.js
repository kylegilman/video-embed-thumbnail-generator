import { createRoot } from '@wordpress/element';
import AttachmentDetails from './AttachmentDetails';

jQuery(function ($) {
    // Ensure wp.media is loaded.
    if (typeof wp === 'undefined' || !wp.media || !wp.media.view || !wp.media.view.Attachment.Details) {
        console.error('Videopack: wp.media.view.Attachment.Details is not available.');
        return;
    }

    console.log('Videopack: Extending wp.media.view.Attachment.Details.');

    const originalAttachmentDetails = wp.media.view.Attachment.Details;

    wp.media.view.Attachment.Details = originalAttachmentDetails.extend({
        // A reference to the React root instance.
        videopackReactRoot: null,

        render: function () {
            console.log('Videopack: Rendering attachment details.');

            // First, call the original render method.
            originalAttachmentDetails.prototype.render.apply(this, arguments);

            // Unmount any existing React component before re-rendering.
            if (this.videopackReactRoot) {
                console.log('Videopack: Unmounting existing React component.');
                this.videopackReactRoot.unmount();
                this.videopackReactRoot = null;
            }

            // Check if the attachment is a video or an animated GIF with our meta.
            const isVideo = this.model.attributes.type === 'video';
            const isAnimatedGif = this.model.attributes.subtype === 'gif' && this.model.attributes.meta?.['_kgvid-meta']?.animated;

            if (isVideo || isAnimatedGif) {
                console.log('Videopack: Video or animated GIF detected. Mounting React component.');

                const settingsSection = this.$el.find('.settings');
                if (settingsSection.length === 0) {
                    console.error('Videopack: Could not find the .settings section in the attachment details sidebar.');
                    return;
                }

                // Create and append the root div for our React component.
                const reactRootDiv = document.createElement('div');
                reactRootDiv.id = 'videopack-attachment-details-root';
                settingsSection.append(reactRootDiv);

                // Create a new React root and render the component.
                this.videopackReactRoot = createRoot(reactRootDiv);
                this.videopackReactRoot.render(
                    <AttachmentDetails
                        attachmentAttributes={this.model.attributes}
                    />
                );
                console.log('Videopack: React component mounted successfully.');
            } else {
                console.log('Videopack: Attachment is not a video, skipping React component.');
            }

            return this;
        },

        remove: function () {
            // Unmount the React component when the view is removed.
            if (this.videopackReactRoot) {
                console.log('Videopack: Unmounting React component on view removal.');
                this.videopackReactRoot.unmount();
                this.videopackReactRoot = null;
            }

            // Call the original remove method.
            return originalAttachmentDetails.prototype.remove.apply(this, arguments);
        },
    });
});