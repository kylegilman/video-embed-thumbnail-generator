import AttachmentDetails from "./AttachmentDetails";

jQuery( extend_attachment_details() );

function extend_attachment_details() {

	if (wp.media && wp.media.view && wp.media.view.Attachment.Details) {

        var originalAttachmentDetails = wp.media.view.Attachment.Details;

        wp.media.view.Attachment.Details = originalAttachmentDetails.extend( {
			render: function() {
                // Unmount existing React component if present
                if (this.videopackReactRootInstance) {
                    ReactDOM.unmountComponentAtNode(this.videopackReactRootInstance);
                    this.videopackReactRootInstance = null;
					console.log('unmount');
                }

                // Call original render method
                originalAttachmentDetails.prototype.render.apply(this, arguments);
				if (this.model.attributes.type === 'video'
					|| (
						this.model.attributes.subtype === 'gif'
						&& this.model.attributes.meta?.['_kgvid-meta']?.animated
					)
				) {
					// Add React root div and mount component
					var settingsSection = this.$el.find('.settings');
					if ( settingsSection.length > 0 ) {
						// Create a new div element for the React root
						const reactRootDiv = document.createElement('div');
						reactRootDiv.id = 'videopack-attachment-details-root'; // A unique ID for the React root
						settingsSection.append( reactRootDiv );

						var reactRoot = this.$el.find('#videopack-attachment-details-root').get(0);
						if (reactRoot) {
							this.videopackReactRootInstance = ReactDOM.createRoot(reactRoot);
							this.videopackReactRootInstance.render( <AttachmentDetails
								attachmentAttributes = { this.model.attributes }
							/> );

							// Save the root to unmount later
							this.reactComponentMounted = true;
						} else {
							console.error('Failed to initialize the React root element.');
						}
					}
				}
            },
			remove: function() {
				if (this.videopackReactRootInstance) {
                    this.videopackReactRootInstance.unmount();
                    this.videopackReactRootInstance = null;
                }
                originalAttachmentDetails.prototype.remove.call(this);
			}
        });
    }
}
