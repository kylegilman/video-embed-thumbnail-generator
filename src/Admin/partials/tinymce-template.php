<?php
/**
 * TinyMCE View Underscore template for Videopack.
 */
?>
<script type="text/html" id="tmpl-videopack-tinymce-view">
	<# console.log('Videopack TinyMCE template data:', data); #>
	<div class="videopack-tinymce-container <# if ( data.isGallery ) { #> videopack-tinymce-gallery<# } #>" 
		title="<?php esc_attr_e( 'This is a placeholder. It will look different on the front end.', 'video-embed-thumbnail-generator' ); ?>">
		
		<# if ( data.videos && data.videos.length > 0 ) { #>
			<div class="videopack-tinymce-list">
				<# _.each( data.videos, function( video ) { #>
					<div class="videopack-tinymce-list-item">
						<# if ( video.poster ) { #>
							<div class="videopack-tinymce-poster-wrapper">
								<img src="{{ video.poster }}" class="videopack-tinymce-poster" />
								<div class="videopack-tinymce-overlay">
									<# if ( video.showTitle && video.title ) { #>
										<div class="videopack-tinymce-title-bar">
											<span class="title">{{ video.title }}</span>
										</div>
									<# } #>
									<div class="videopack-tinymce-play-button">
										<span class="dashicons dashicons-controls-play"></span>
									</div>
								</div>
							</div>
						<# } else { #>
							<div class="videopack-tinymce-icon">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
								<span>{{ video.title || '<?php esc_html_e( 'Videopack Video', 'video-embed-thumbnail-generator' ); ?>' }}</span>
							</div>
						<# } #>
					</div>
				<# } ); #>
			</div>
		<# } else if ( data.videos ) { #>
			<div class="videopack-tinymce-placeholder">
				<span><?php esc_html_e( 'Loading video list...', 'video-embed-thumbnail-generator' ); ?></span>
			</div>
		<# } else { #>
			<div class="videopack-tinymce-placeholder<# if ( data.isGallery ) { #> videopack-tinymce-gallery<# } #>">
				<# if ( data.poster ) { #>
					<img src="{{ data.poster }}" alt="<?php esc_attr_e( 'Videopack Poster', 'video-embed-thumbnail-generator' ); ?>" class="videopack-tinymce-poster" />
					<# if ( ! data.isGallery ) { #>
						<div class="videopack-tinymce-overlay">
							<# if ( data.showTitle && data.title ) { #>
								<div class="videopack-tinymce-title-bar">
									<span class="title">{{ data.title }}</span>
								</div>
							<# } #>
							<div class="videopack-tinymce-play-button">
								<span class="dashicons dashicons-controls-play"></span>
							</div>
						</div>
					<# } #>
				<# } else if ( data.isGallery ) { #>
					<div class="videopack-tinymce-icon videopack-tinymce-gallery-icon">
						<div class="videopack-gallery-grid-preview">
							<div class="grid-item"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg></div>
							<div class="grid-item"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg></div>
							<div class="grid-item"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg></div>
							<div class="grid-item"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg></div>
						</div>
						<span><?php esc_html_e( 'Videopack Gallery', 'video-embed-thumbnail-generator' ); ?></span>
					</div>
				<# } else { #>
					<div class="videopack-tinymce-icon">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
						<span><?php esc_html_e( 'Videopack Video', 'video-embed-thumbnail-generator' ); ?></span>
						<# if ( data.shortcodeContent ) { #>
							<small style="display:block; opacity: 0.7; margin-top: 5px;">{{ data.shortcodeContent }}</small>
						<# } #>
					</div>
				<# } #>
			</div>
		<# } #>
	</div>
</script>
