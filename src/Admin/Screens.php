<?php

namespace Videopack\Admin;

class Screens {

	protected $options_manager;
	protected $options;

	public function __construct( $options_manager ) {
		$this->options_manager = $options_manager;
		$this->options         = $options_manager->get_options();
	}

	public function plugin_action_links( $links ) {

		$links[] = '<a href="' . get_admin_url( null, 'options-general.php?page=video_embed_thumbnail_generator_settings' ) . '">' . esc_html__( 'Settings', 'video-embed-thumbnail-generator' ) . '</a>';
		return $links;
	}

	public function plugin_meta_links( $links, $file ) {

		if ( $file == VIDEOPACK_BASENAME ) {
			return array_merge(
				$links,
				array( '<a href="https://www.videopack.video/donate/">' . esc_html__( 'Donate', 'video-embed-thumbnail-generator' ) . '</a>' )
			);
		}
		return $links;
	}

	public function upgrade_notification( $currentpluginmetadata, $newpluginmetadata ) {
		// check "upgrade_notice"
		if ( isset( $newpluginmetadata->upgrade_notice ) && strlen( trim( $newpluginmetadata->upgrade_notice ) ) > 0 ) {
			printf(
				'<div class="update-message">%s</div>',
				wp_kses_post( $newpluginmetadata->upgrade_notice )
			);
		}
	}

	public function add_settings_page() {
		$page_hook_suffix = add_options_page(
			esc_html_x( 'Videopack', 'Settings page title', 'video-embed-thumbnail-generator' ),
			esc_html_x( 'Videopack', 'Settings page title in admin sidebar', 'video-embed-thumbnail-generator' ),
			'manage_options',
			'video_embed_thumbnail_generator_settings',
			array( $this, 'output_settings_page' )
		);
		add_action( 'admin_print_scripts-' . $page_hook_suffix, array( $this, 'enqueue_settings_page_assets' ) );
	}

	public function enqueue_settings_page_assets() {

		wp_enqueue_script(
			'videopack-settings-page',
			plugins_url( '/build/build.js', __FILE__ ),
			array( 'wp-api', 'wp-i18n', 'wp-components', 'wp-element' ),
			VIDEOPACK_VERSION,
			true
		);

		wp_enqueue_style(
			'videopack-settings-page-styles',
			plugins_url( '/build/build.css', __FILE__ ),
			array( 'wp-components' ),
			VIDEOPACK_VERSION,
		);
	}

	public function output_settings_page() {
		wp_enqueue_media();
		wp_enqueue_global_styles();

		echo '<div id="videopack-settings-root"></div>';
	}

	public function add_encode_queue_page() {
		if ( $this->options['ffmpeg_exists'] === true ) { // only add the queue page if FFmpeg is installed
			add_submenu_page(
				'tools.php',
				esc_html_x( 'Videopack Encoding Queue', 'Tools page title', 'video-embed-thumbnail-generator' ),
				esc_html_x( 'Videopack Encode Queue', 'Title in admin sidebar', 'video-embed-thumbnail-generator' ),
				'encode_videos',
				'videopack_encode_queue',
				array( $this, 'output_encode_queue_page' )
			);
		}
	}

	public function output_encode_queue_page() {

		wp_enqueue_media();
		wp_enqueue_global_styles();
		kgvid_encode_videos();
		echo '<div id="videopack-queue-root"></div>';
	}

	public function add_video_stats_column( $cols ) {

		$cols['video_stats'] = esc_html__( 'Video Stats', 'video-embed-thumbnail-generator' );
		return $cols;
	}

	public function add_video_stats_column_content( $column_name, $id ) {

		if ( $column_name == 'video_stats' ) {

			$kgvid_postmeta = ( new Attachment_Meta( $this->options_manager ) )->get( $id );
			if ( is_array( $kgvid_postmeta ) && array_key_exists( 'starts', $kgvid_postmeta ) && intval( $kgvid_postmeta['starts'] ) > 0 ) {
				/* translators: Start refers to the number of times a video has been started */
				wp_kses_post( printf( esc_html( _n( '%1$s%2$d%3$s Play', '%1$s%2$d%3$s Plays', intval( $kgvid_postmeta['starts'] ), 'video-embed-thumbnail-generator' ) ), '<strong>', esc_html( intval( $kgvid_postmeta['starts'] ) ), '</strong>' ) );
				echo '<br><strong>' . esc_html( intval( $kgvid_postmeta['play_25'] ) ) . '</strong> 25%' .
				'<br><strong>' . esc_html( intval( $kgvid_postmeta['play_50'] ) ) . '</strong> 50%' .
				'<br><strong>' . esc_html( intval( $kgvid_postmeta['play_75'] ) ) . '</strong> 75%<br>';
				/* translators: %1$s%2$d%3$s is '<strong>', a number, '</strong>' */
				printf( esc_html( _n( '%1$s%2$d%3$s Complete View', '%1$s%2$d%3$s Complete Views', intval( $kgvid_postmeta['completeviews'] ), 'video-embed-thumbnail-generator' ) ), '<strong>', esc_html( $kgvid_postmeta['completeviews'] ), '</strong>' );

			}
		}
	}

	public function hide_video_children( $wp_query_obj ) {

		if ( is_admin()
			&& is_array( $wp_query_obj->query_vars )
			&& array_key_exists( 'post_type', $wp_query_obj->query_vars )
			&& $wp_query_obj->query_vars['post_type'] == 'attachment' // only deal with attachments
			&& ! array_key_exists( 'post_mime_type', $wp_query_obj->query_vars ) // show children when specifically displaying videos
			&& ( array_key_exists( 'posts_per_page', $wp_query_obj->query_vars ) && $wp_query_obj->query_vars['posts_per_page'] > 0 ) // hide children only when showing paged content (makes sure that -1 will actually return all attachments)
		) {

			$meta_query = $wp_query_obj->get( 'meta_query' );
			if ( ! is_array( $meta_query ) ) {
				$meta_query = array();
			}
			$meta_query['relation'] = 'AND';
			$meta_query[]           = array(
				'key'     => '_kgflashmediaplayer-format',
				'compare' => 'NOT EXISTS',
			);
			if ( $this->options['hide_thumbnails'] === true ) {
				$meta_query[] = array(
					'key'     => '_kgflashmediaplayer-video-id',
					'compare' => 'NOT EXISTS',
				);
			}
			$wp_query_obj->set(
				'meta_query',
				$meta_query
			);
		}
	}

	public function upload_page_change_thumbnail_parent( $location ) {

		if ( ! is_admin()
			|| ! function_exists( 'get_current_screen' )
		) {
			return $location;
		}

		$current_screen = get_current_screen();

		if ( is_object( $current_screen )
			&& 'upload' === $current_screen->id
			&& isset( $_GET['media'] )
			&& is_array( $_GET['media'] )
			&& $this->options['thumb_parent'] === 'post'
			&& check_admin_referer( 'bulk-media' )
		) {
			$media = \Videopack\Common\Validate::text_field( wp_unslash( $_GET['media'] ) );
			if ( isset( $_GET['found_post_id'] ) ) {
				$parent_id = (int) \Videopack\Common\Validate::text_field( wp_unslash( $_GET['found_post_id'] ) );
			} else {
				$parent_id = 0;
			}

			foreach ( $media as $post_id ) {

				( new Attachment( $this->options_manager ) )->change_thumbnail_parent( $post_id, $parent_id );

				if ( $this->options['featured'] == true
					&& ! has_post_thumbnail( $parent_id )
				) {
					$featured_id = get_post_meta( $post_id, '_kgflashmediaplayer-poster-id', true );
					if ( ! empty( $featured_id ) ) {
						set_post_thumbnail( $parent_id, $featured_id );
					}
				}
			}//end loop through modified attachments
		}//end if changed parent

		return $location;
	}

	public function add_contextual_help_tab() {

		$false_code = '<code>"false"</code>';
		/* translators: %s is '<code>"false"</code>' */
		get_current_screen()->add_help_tab(
			array(
				'id'      => 'kgvid-help-tab',
				'title'   => esc_html__( 'Videopack Shortcode Reference', 'video-embed-thumbnail-generator' ),
				'content' => '<p><strong>' . esc_html__( 'Use these optional attributes in the [videopack] shortcode:', 'video-embed-thumbnail-generator' ) . '</strong></p>
	<ul><li><code>id="xxx"</code> ' . esc_html__( 'video attachment ID (instead of using a URL).', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>videos="x"</code> ' . esc_html__( 'number of attached videos to display if no URL or ID is given.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>orderby="menu_order/title/post_date/rand/ID"</code> ' . esc_html__( 'criteria for sorting attached videos if no URL or ID is given.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>order="ASC/DESC"</code> ' . esc_html__( 'sort order.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>poster="https://www.example.com/image.jpg"</code> ' . esc_html__( 'sets the thumbnail.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>endofvideooverlay="https://www.example.com/end_image.jpg"</code> ' . esc_html__( 'sets the image shown when the video ends.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>width="xxx"</code></li>
	<li><code>height="xxx"</code></li>
	<li><code>fullwidth="true/false"</code> ' . esc_html__( 'set video to always expand to fill its container.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>fixed_aspect="false/vertical/true"</code> ' . esc_html__( 'set video to conform to the default aspect ratio. Vertical applies only if the video height is greater than the width.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>align="left/right/center"</code></li>
	<li><code>inline="true/false"</code> ' . esc_html__( 'allow other content on the same line as the video', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>volume="0.x"</code> ' . esc_html__( 'pre-sets the volume for unusually loud videos. Value between 0 and 1.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>muted="true/false"</code> ' . esc_html__( 'Mutes the audio.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>controls="true/false"</code> ' . esc_html__( 'Enables video controls.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>loop="true/false"</code></li>
	<li><code>autoplay="true/false"</code></li>
	<li><code>playsinline="true/false"</code> ' . esc_html__( 'Play inline on iPhones instead of fullscreen.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>skip_buttons="true/false"</code> ' . esc_html__( 'Add skip forward/backward buttons.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>gifmode="true/false"</code> ' . esc_html__( 'Videos behave like animated GIFs. autoplay, muted, loop, and playsinline will be enabled. Controls and other overlays will be disabled.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>pauseothervideos="true/false"</code> ' . esc_html__( 'video will pause other videos on the page when it starts playing.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>preload="metadata/auto/none"</code> ' . esc_html__( 'indicate how much of the video should be loaded when the page loads.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>start="mm:ss"</code> ' . esc_html__( 'video will start playing at this timecode.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>watermark="https://www.example.com/image.png"</code> ' . sprintf( esc_html__( 'or %s to disable.', 'video-embed-thumbnail-generator' ), $false_code ) . '</li>
	<li><code>watermark_link_to="home/parent/attachment/download/false"</code></li>
	<li><code>watermark_url="https://www.example.com/"</code> ' . sprintf( esc_html__( 'or %s to disable. If this is set, it will override the watermark_link_to setting.', 'video-embed-thumbnail-generator' ), $false_code ) . '</li>
	<li><code>title="Video Title"</code> ' . sprintf( esc_html__( 'or %s to disable.', 'video-embed-thumbnail-generator' ), $false_code ) . '</li>
	<li><code>embeddable="true/false"</code> ' . esc_html__( 'enable or disable video embedding and sharing icons.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>embedcode="html code"</code> ' . sprintf( esc_html__( 'changes text displayed in the embed code overlay in order to provide a custom method for embedding a video or %s to disable.', 'video-embed-thumbnail-generator' ), $false_code ) . '</li>
	<li><code>view_count="true/false"</code> ' . esc_html__( 'turns the view count on or off.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>count_views="quarters/start_complete/start/false"</code> ' . esc_html__( 'sets the level of video view counting.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>caption="Caption"</code> ' . esc_html__( 'text that is displayed below the video (not subtitles or closed captioning)', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>description="Description"</code> ' . esc_html__( 'Used for metadata only.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>downloadlink="true/false"</code> ' . esc_html__( 'shows a download icon overlay to make it easier for users to save the video file to their computers.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>right_click="true/false"</code> ' . esc_html__( 'allow or disable right-clicking on the video player.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>resize="true/false"</code> ' . esc_html__( 'allow or disable responsive resizing.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>auto_res="automatic/highest/lowest/1080p/720p/360p/custom"</code> ' . esc_html__( 'specify the video resolution when the page loads.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>pixel_ratio="true/false"</code> ' . esc_html__( 'account for high-density (retina) displays when choosing automatic video resolution.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>schema="true/false"</code> ' . esc_html__( 'allow or disable Schema.org search engine metadata.', 'video-embed-thumbnail-generator' ) . '</li></ul>

	<p><strong>' . esc_html__( 'These options will add a subtitle/caption track.', 'video-embed-thumbnail-generator' ) . '</strong></p>
	<ul><li><code>track_src="http://www.example.com/subtitles.vtt_.txt"</code> ' . esc_html__( 'URL of the WebVTT file.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>track_kind=subtitles/captions/chapters</code></li>
	<li><code>track_srclang=xx</code> ' . esc_html__( 'the track\'s two-character language code (en, fr, es, etc)', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>track_label="Track Label"</code> ' . esc_html__( 'text that will be shown to the user when selecting the track.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>track_default="default"</code> ' . esc_html__( 'track is enabled by default.', 'video-embed-thumbnail-generator' ) . '</li></ul>

	<p><strong>' . esc_html__( 'These options will only affect Video.js playback', 'video-embed-thumbnail-generator' ) . '</strong></p>
	<ul><li><code>skin="example-css-class"</code> ' . sprintf( esc_html__( 'Completely change the look of the video player. %sInstructions here.', 'video-embed-thumbnail-generator' ), '<a href="http://codepen.io/heff/pen/EarCt">' ) . '</a></li>
	<li><code>nativecontrolsfortouch="true/false"</code> ' . esc_html__( 'enables or disables native controls on touchscreen devices.', 'video-embed-thumbnail-generator' ) . '</li>
	</ul>

	<p><strong>' . esc_html__( 'These options are available for video galleries (options work the same as standard WordPress image galleries)', 'video-embed-thumbnail-generator' ) . '</p></strong>
	<ul><li><code>gallery="true"</code> ' . esc_html__( 'turns on the gallery', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>gallery_thumb="xxx"</code> ' . esc_html__( 'width in pixels to display gallery thumbnails', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>gallery_exclude="15"</code> ' . esc_html__( 'comma separated video attachment IDs. Excludes the videos from the gallery.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>gallery_include="65"</code> ' . esc_html__( 'comma separated video attachment IDs. Includes only these videos in the gallery. Please note that include and exclude cannot be used together.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>gallery_orderby="menu_order/title/post_date/rand/ID"</code> ' . esc_html__( 'criteria for sorting the gallery', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>gallery_order="ASC/DESC"</code> ' . esc_html__( 'sort order', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>gallery_id="241"</code> ' . esc_html__( 'post ID to display a gallery made up of videos associated with a different post.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>gallery_end="close/next"</code> ' . esc_html__( 'either close the pop-up or start playing the next video when the current video finishes playing.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>gallery_per_page="xx"</code> ' . sprintf( esc_html__( 'or %s to disable pagination. Number of video thumbnails to show on each gallery page.', 'video-embed-thumbnail-generator' ), $false_code ) . '</li>
	<li><code>gallery_title="true/false"</code> ' . esc_html__( 'display the title overlay on gallery thumbnails.', 'video-embed-thumbnail-generator' ) . '</li></ul>',
			)
		);
	}
}
