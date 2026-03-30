<?php
/**
 * Admin screens handler.
 *
 * @package Videopack
 * @subpackage Videopack/Admin
 */

namespace Videopack\Admin;

/**
 * Class Screens
 *
 * Defines admin pages, menus, and behavior for the Videopack plugin.
 *
 * This class handles the registration of settings pages, tools pages,
 * media library columns, meta boxes, and filters for the media library
 * list and grid views. It also manages contextual help and plugin action links.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Admin
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class Screens {

	/**
	 * Plugin options.
	 *
	 * @var array $options
	 */
	protected $options;

	/**
	 * Video formats registry.
	 *
	 * @var \Videopack\Admin\Formats\Registry $format_registry
	 */
	protected $format_registry;

	/**
	 * Constructor.
	 *
	 * @param array                             $options         Plugin options.
	 * @param \Videopack\Admin\Formats\Registry $format_registry Video formats registry.
	 */
	public function __construct( array $options, \Videopack\Admin\Formats\Registry $format_registry = null ) {
		$this->options         = $options;
		$this->format_registry = $format_registry;
	}

	/**
	 * Adds a "Settings" link to the plugin action links on the plugins page.
	 *
	 * @param array $links Existing plugin action links.
	 * @return array Modified plugin action links.
	 */
	public function plugin_action_links( $links ) {
		$links[] = '<a href="' . (string) get_admin_url( null, 'options-general.php?page=video_embed_thumbnail_generator_settings' ) . '">' . (string) esc_html__( 'Settings', 'video-embed-thumbnail-generator' ) . '</a>';
		return (array) $links;
	}

	/**
	 * Adds a "Donate" link to the plugin meta links on the plugins page.
	 *
	 * @param array  $links Existing plugin meta links.
	 * @param string $file  Plugin file path.
	 * @return array Modified plugin meta links.
	 */
	public function plugin_meta_links( $links, $file ) {
		if ( (string) $file === VIDEOPACK_BASENAME ) {
			return (array) array_merge(
				(array) $links,
				array( '<a href="https://www.videopack.video/donate/">' . (string) esc_html__( 'Donate', 'video-embed-thumbnail-generator' ) . '</a>' )
			);
		}
		return (array) $links;
	}

	/**
	 * Displays an upgrade notification message if available.
	 *
	 * @param \stdClass $currentpluginmetadata Current plugin metadata.
	 * @param \stdClass $newpluginmetadata     New plugin metadata.
	 * @return void
	 */
	public function upgrade_notification( $currentpluginmetadata, $newpluginmetadata ) {
		if ( isset( $newpluginmetadata->upgrade_notice ) && strlen( trim( (string) $newpluginmetadata->upgrade_notice ) ) > 0 ) {
			printf(
				'<div class="update-message">%s</div>',
				wp_kses_post( (string) $newpluginmetadata->upgrade_notice )
			);
		}
	}

	/**
	 * Adds the Videopack settings page to the WordPress admin.
	 *
	 * @return void
	 */
	public function add_settings_page() {
		add_options_page(
			(string) esc_html_x( 'Videopack Settings', 'Settings page title', 'video-embed-thumbnail-generator' ),
			(string) esc_html_x( 'Videopack', 'Settings page title in admin sidebar', 'video-embed-thumbnail-generator' ),
			'manage_options',
			'video_embed_thumbnail_generator_settings',
			array( $this, 'output_settings_page' )
		);
	}

	/**
	 * Outputs the HTML container for the React-based settings page.
	 *
	 * @return void
	 */
	public function output_settings_page() {
		wp_enqueue_media();

		echo '<div id="videopack-settings-root"></div>';
	}

	/**
	 * Adds the Videopack encoding queue page to the WordPress admin tools menu.
	 *
	 * @return void
	 */
	public function add_encode_queue_page() {
		if ( (bool) ( $this->options['ffmpeg_exists'] ?? false ) && 'notinstalled' !== ( $this->options['ffmpeg_exists'] ?? '' ) ) {
			add_submenu_page(
				'tools.php',
				(string) esc_html_x( 'Videopack Queue', 'Tools page title', 'video-embed-thumbnail-generator' ),
				(string) esc_html_x( 'Videopack Queue', 'Title in admin sidebar', 'video-embed-thumbnail-generator' ),
				'encode_videos',
				'videopack_encode_queue',
				array( $this, 'output_encode_queue_page' )
			);
		}
	}

	/**
	 * Outputs the HTML container for the React-based encode queue page.
	 *
	 * @return void
	 */
	public function output_encode_queue_page() {
		echo '<div id="videopack-queue-root"></div>';
	}

	/**
	 * Adds a "Video Stats" column to the media library list view.
	 *
	 * @param array $cols Existing media columns.
	 * @return array Modified media columns.
	 */
	public function add_video_columns( $cols ) {
		$cols['video_stats'] = (string) esc_html__( 'Video Stats', 'video-embed-thumbnail-generator' );
		return (array) $cols;
	}

	/**
	 * Adds Videopack meta boxes to the attachment edit screen.
	 *
	 * @return void
	 */
	public function add_meta_boxes() {
		add_meta_box(
			'videopack-meta-box',
			(string) __( 'Videopack', 'video-embed-thumbnail-generator' ),
			array( $this, 'render_meta_box' ),
			'attachment',
			'normal',
			'high'
		);
	}

	/**
	 * Renders the meta box content (React root).
	 *
	 * @param \WP_Post $post The attachment post object.
	 * @return void
	 */
	public function render_meta_box( $post ) {
		$attachment_meta = new \Videopack\Admin\Attachment_Meta( $this->options, (int) $post->ID );
		$attachment      = new \Videopack\Admin\Attachment( $this->options, $this->format_registry, $attachment_meta );
		if ( $attachment->is_video( $post ) ) {
			echo '<div id="videopack-attachment-details-root"></div>';
			echo '<input type="hidden" name="videopack_meta_json" id="videopack_meta_json" value="' . (string) esc_attr( (string) wp_json_encode( (array) $attachment_meta->get() ) ) . '">';
			wp_nonce_field( 'videopack_save_meta_box', 'videopack_meta_box_nonce' );
		}
	}

	/**
	 * Saves Videopack metadata from the standalone attachment details meta box.
	 *
	 * @param int $post_id The attachment ID.
	 * @return void
	 */
	public function save_meta_box_data( $post_id ) {
		// Verify nonce.
		if ( ! isset( $_POST['videopack_meta_box_nonce'] ) || ! wp_verify_nonce( (string) $_POST['videopack_meta_box_nonce'], 'videopack_save_meta_box' ) ) {
			return;
		}

		// Don't save on autosave.
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}

		// Check permissions.
		if ( ! current_user_can( 'edit_post', (int) $post_id ) ) {
			return;
		}

		if ( isset( $_POST['videopack_meta_json'] ) ) {
			$meta = (array) json_decode( (string) wp_unslash( (string) $_POST['videopack_meta_json'] ), true );
			if ( is_array( $meta ) ) {
				$attachment_meta = new \Videopack\Admin\Attachment_Meta( $this->options, (int) $post_id );
				$attachment_meta->save( (array) $meta );
			}
		}
	}

	/**
	 * Outputs the content for the "Video Stats" column.
	 *
	 * @param string $column_name The column name.
	 * @param int    $id          The attachment ID.
	 * @return void
	 */
	public function add_video_column_content( $column_name, $id ) {
		if ( 'video_stats' === (string) $column_name ) {
			$external_url = (string) get_post_meta( (int) $id, '_kgflashmediaplayer-externalurl', true );
			if ( $external_url ) {
				echo '<strong>' . esc_html__( 'Remote Source:', 'video-embed-thumbnail-generator' ) . '</strong><br>';
				echo '<a href="' . esc_url( $external_url ) . '" target="_blank" rel="noopener noreferrer" style="word-break: break-all;">' . esc_html( $external_url ) . '</a><br><br>';
			}

			$videopack_postmeta = (array) ( new \Videopack\Admin\Attachment_Meta( $this->options ) )->get( (int) $id );
			if ( ! empty( $videopack_postmeta ) && array_key_exists( 'starts', $videopack_postmeta ) && (int) $videopack_postmeta['starts'] > 0 ) {
				/* translators: Start refers to the number of times a video has been started */
				wp_kses_post( printf( esc_html( _n( '%1$s%2$d%3$s Play', '%1$s%2$d%3$s Plays', (int) $videopack_postmeta['starts'], 'video-embed-thumbnail-generator' ) ), '<strong>', (int) $videopack_postmeta['starts'], '</strong>' ) );
				echo '<br><strong>' . (int) ( $videopack_postmeta['play_25'] ?? 0 ) . '</strong> 25%' .
				'<br><strong>' . (int) ( $videopack_postmeta['play_50'] ?? 0 ) . '</strong> 50%' .
				'<br><strong>' . (int) ( $videopack_postmeta['play_75'] ?? 0 ) . '</strong> 75%<br>';
				/* translators: %1$s%2$d%3$s is '<strong>', a number, '</strong>' */
				printf( esc_html( _n( '%1$s%2$d%3$s Complete View', '%1$s%2$d%3$s Complete Views', (int) ( $videopack_postmeta['completeviews'] ?? 0 ), 'video-embed-thumbnail-generator' ) ), '<strong>', (int) ( $videopack_postmeta['completeviews'] ?? 0 ), '</strong>' );
			}
		}
	}

	/**
	 * Filters the media query to show or hide child formats based on the filter.
	 *
	 * @param \WP_Query $wp_query_obj The WP_Query object.
	 * @return void
	 */
	public function hide_video_children( $wp_query_obj ) {
		if ( ! is_admin()
		|| ! is_array( $wp_query_obj->query_vars )
		|| ! array_key_exists( 'post_type', $wp_query_obj->query_vars )
		|| 'attachment' !== (string) $wp_query_obj->query_vars['post_type']
		) {
			return;
		}

		if ( ! current_user_can( 'upload_files' ) ) {
			return;
		}

		if ( ! empty( $wp_query_obj->get( 'post__in' ) ) ) {
			return;
		}

		$filter = '0';
		if ( isset( $_GET['videopack_filter'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$filter = (string) sanitize_text_field( wp_unslash( $_GET['videopack_filter'] ) );
		} elseif ( wp_doing_ajax() && isset( $_POST['query']['videopack_filter'] ) && check_ajax_referer( 'query-attachments', 'query-attachments-nonce', false ) ) {
			$filter = (string) sanitize_text_field( wp_unslash( $_POST['query']['videopack_filter'] ) );
		} elseif ( isset( $wp_query_obj->query_vars['videopack_filter'] ) ) {
			$filter = (string) $wp_query_obj->query_vars['videopack_filter'];
		}

		$videopack_parent_id = (int) $wp_query_obj->get( 'videopack_parent_id' );
		if ( empty( $videopack_parent_id ) && wp_doing_ajax() && isset( $_POST['query']['videopack_parent_id'] ) && check_ajax_referer( 'query-attachments', 'query-attachments-nonce', false ) ) {
			$videopack_parent_id = (int) $_POST['query']['videopack_parent_id'];
		}

		$meta_query = (array) $wp_query_obj->get( 'meta_query' );

		if ( 'only_children' === $filter ) {
			$meta_query['relation'] = 'AND';
			$meta_query[]           = array(
				'key'     => '_kgflashmediaplayer-format',
				'compare' => 'EXISTS',
			);
			$wp_query_obj->set( 'meta_query', $meta_query );
			return;
		}

		if ( 'only_remote' === $filter ) {
			$meta_query['relation'] = 'AND';
			$meta_query[]           = array(
				'relation' => 'OR',
				array(
					'key'     => '_kgflashmediaplayer-external-remote',
					'value'   => 'true',
					'compare' => '=',
				),
				array(
					'key'     => '_kgflashmediaplayer-externalurl',
					'compare' => 'EXISTS',
				),
			);
			$wp_query_obj->set( 'meta_query', $meta_query );
			return;
		}

		if ( 'show_children' === $filter || ! empty( $videopack_parent_id ) ) {
			if ( empty( $videopack_parent_id ) && 'show_children' === $filter ) {
				return;
			}

			$meta_query[] = array(
				'relation' => 'OR',
				array(
					'key'     => '_kgflashmediaplayer-format',
					'compare' => 'NOT EXISTS',
				),
				array(
					'key'     => '_kgflashmediaplayer-parent',
					'value'   => (int) $videopack_parent_id,
					'compare' => '=',
				),
			);

			add_filter(
				'posts_where',
				function ( $where, $query ) use ( $videopack_parent_id ) {
					global $wpdb;
					if ( ! empty( $videopack_parent_id ) && strpos( (string) $where, "post_parent = $videopack_parent_id" ) === false ) {
						$where .= (string) $wpdb->prepare( " OR ({$wpdb->posts}.post_parent = %d AND {$wpdb->posts}.post_type = 'attachment')", (int) $videopack_parent_id );
					}
					return (string) $where;
				},
				10,
				2
			);

			$wp_query_obj->set( 'meta_query', $meta_query );
			return;
		}

		if ( array_key_exists( 'posts_per_page', $wp_query_obj->query_vars ) && (int) $wp_query_obj->query_vars['posts_per_page'] > 0 ) {
			$meta_query['relation'] = 'AND';
			$meta_query[]           = array(
				'key'     => '_kgflashmediaplayer-format',
				'compare' => 'NOT EXISTS',
			);

			if ( true === ( $this->options['hide_thumbnails'] ?? false ) ) {
				$meta_query[] = array(
					'key'     => '_kgflashmediaplayer-video-id',
					'compare' => 'NOT EXISTS',
				);
			}
			$wp_query_obj->set( 'meta_query', $meta_query );
		}
	}

	/**
	 * Adds a dropdown to the Media Library list view to show/hide child formats.
	 *
	 * @return void
	 */
	public function add_media_filter_dropdown() {
		$screen = get_current_screen();
		if ( ! $screen instanceof \WP_Screen || 'upload' !== (string) $screen->id ) {
			return;
		}

		$selected = isset( $_GET['videopack_filter'] ) ? (string) sanitize_text_field( wp_unslash( $_GET['videopack_filter'] ) ) : '0'; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		?>
		<select name="videopack_filter" id="videopack_filter">
			<option value="0" <?php selected( $selected, '0' ); ?>><?php esc_html_e( 'Standard View', 'video-embed-thumbnail-generator' ); ?></option>
			<option value="show_children" <?php selected( $selected, 'show_children' ); ?>><?php esc_html_e( 'Show Child Formats', 'video-embed-thumbnail-generator' ); ?></option>
			<option value="only_remote" <?php selected( $selected, 'only_remote' ); ?>><?php esc_html_e( 'Remote Videos Only', 'video-embed-thumbnail-generator' ); ?></option>
		</select>
		<?php
	}

	/**
	 * Adds a "Child Formats" option to the Media Library grid view filter.
	 *
	 * @param array $settings The media view settings.
	 * @return array The filtered settings.
	 */
	public function add_grid_media_filter( $settings ) {
		$settings['mimeTypes']['videopack_child_formats'] = (string) esc_html__( 'Child Formats', 'video-embed-thumbnail-generator' );
		$settings['mimeTypes']['videopack_remote_videos'] = (string) esc_html__( 'Remote Videos', 'video-embed-thumbnail-generator' );
		return (array) $settings;
	}

	/**
	 * Filters the AJAX query for attachments to include Videopack filters.
	 *
	 * @param array $query The query arguments.
	 * @return array The filtered query arguments.
	 */
	public function filter_ajax_query_attachments( $query ) {
		if ( isset( $query['post_mime_type'] ) ) {
			$mime_type = is_array( $query['post_mime_type'] ) ? (string) reset( $query['post_mime_type'] ) : (string) $query['post_mime_type'];
			if ( 'videopack_child_formats' === $mime_type ) {
				$query['post_mime_type']   = 'video';
				$query['videopack_filter'] = 'only_children';
			} elseif ( 'videopack_remote_videos' === $mime_type ) {
				$query['post_mime_type']   = 'video';
				$query['videopack_filter'] = 'only_remote';
			}
		}

		$nonce_verified = (bool) check_ajax_referer( 'query-attachments', 'query-attachments-nonce', false );

		if ( $nonce_verified && ! isset( $query['videopack_parent_id'] ) && isset( $_POST['query']['videopack_parent_id'] ) ) {
			$query['videopack_parent_id'] = (int) $_POST['query']['videopack_parent_id'];
		}

		if ( $nonce_verified && ! isset( $query['videopack_filter'] ) && isset( $_POST['query']['videopack_filter'] ) ) {
			$query['videopack_filter'] = (string) sanitize_text_field( wp_unslash( $_POST['query']['videopack_filter'] ) );
		}

		if ( isset( $query['videopack_parent_id'] ) ) {
			$query['videopack_parent_id'] = (int) $query['videopack_parent_id'];
		}

		if ( isset( $query['videopack_filter'] ) ) {
			$query['videopack_filter'] = (string) sanitize_text_field( (string) $query['videopack_filter'] );
		}

		return (array) $query;
	}

	/**
	 * Adds Videopack query vars to the allowed list.
	 *
	 * @param array $vars Existing query vars.
	 * @return array Modified query vars.
	 */
	public function add_query_vars( $vars ) {
		$vars[] = 'videopack_filter';
		$vars[] = 'videopack_parent_id';
		return (array) $vars;
	}

	/**
	 * Handles changing the thumbnail parent when multiple videos are uploaded at once.
	 *
	 * @param string $location The redirect location.
	 * @return string The redirect location.
	 */
	public function upload_page_change_thumbnail_parent( $location ) {
		if ( ! is_admin() || ! function_exists( 'get_current_screen' ) ) {
			return (string) $location;
		}

		$current_screen = get_current_screen();
		$media          = array();
		if ( isset( $_GET['media'] ) && is_array( $_GET['media'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$media = (array) array_map( 'sanitize_text_field', wp_unslash( $_GET['media'] ) );
		}

		if ( $current_screen instanceof \WP_Screen
		&& 'upload' === (string) $current_screen->id
		&& ! empty( $media )
		&& (string) ( $this->options['thumb_parent'] ?? 'video' ) === 'post'
		&& check_admin_referer( 'bulk-media' )
		) {
			$parent_id = isset( $_GET['found_post_id'] ) ? (int) sanitize_text_field( wp_unslash( $_GET['found_post_id'] ) ) : 0;

			foreach ( $media as $post_id ) {
				$attachment_meta = new \Videopack\Admin\Attachment_Meta( $this->options, (int) $post_id );
				( new \Videopack\Admin\Attachment( $this->options, $this->format_registry, $attachment_meta ) )->change_thumbnail_parent( (int) $post_id, $parent_id );

				if ( true === ( $this->options['featured'] ?? false ) && ! has_post_thumbnail( $parent_id ) ) {
					$featured_id = (int) get_post_meta( (int) $post_id, '_kgflashmediaplayer-poster-id', true );
					if ( $featured_id > 0 ) {
						set_post_thumbnail( $parent_id, $featured_id );
					}
				}
			}
		}

		return (string) $location;
	}

	/**
	 * Adds a contextual help tab for the [videopack] shortcode.
	 *
	 * @return void
	 */
	public function add_contextual_help_tab() {
		$screen = get_current_screen();
		if ( ! $screen instanceof \WP_Screen ) {
			return;
		}

		$false_code = '<code>"false"</code>';
		/* translators: %s is '<code>"false"</code>' */
		$screen->add_help_tab(
			array(
				'id'      => 'videopack-help-tab',
				'title'   => (string) esc_html__( 'Videopack Shortcode Reference', 'video-embed-thumbnail-generator' ),
				'content' => '<p><strong>' . (string) esc_html__( 'Use these optional attributes in the [videopack] shortcode:', 'video-embed-thumbnail-generator' ) . '</strong></p>
	<ul><li><code>id="xxx"</code> ' . (string) esc_html__( 'video attachment ID (instead of using a URL).', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>videos="x"</code> ' . (string) esc_html__( 'number of attached videos to display if no URL or ID is given.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>orderby="menu_order/title/post_date/rand/ID"</code> ' . (string) esc_html__( 'criteria for sorting attached videos if no URL or ID is given.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>order="ASC/DESC"</code> ' . (string) esc_html__( 'sort order.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>poster="https://www.example.com/image.jpg"</code> ' . (string) esc_html__( 'sets the thumbnail.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>endofvideooverlay="https://www.example.com/end_image.jpg"</code> ' . (string) esc_html__( 'sets the image shown when the video ends.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>width="xxx"</code></li>
	<li><code>height="xxx"</code></li>
	<li><code>fullwidth="true/false"</code> ' . (string) esc_html__( 'set video to always expand to fill its container.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>fixed_aspect="false/vertical/true"</code> ' . (string) esc_html__( 'set video to conform to the default aspect ratio. Vertical applies only if the video height is greater than the width.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>align="left/right/center"</code></li>
	<li><code>inline="true/false"</code> ' . (string) esc_html__( 'allow other content on the same line as the video', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>volume="0.x"</code> ' . (string) esc_html__( 'pre-sets the volume for unusually loud videos. Value between 0 and 1.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>muted="true/false"</code> ' . (string) esc_html__( 'Mutes the audio.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>controls="true/false"</code> ' . (string) esc_html__( 'Enables video controls.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>loop="true/false"</code></li>
	<li><code>autoplay="true/false"</code></li>
	<li><code>playsinline="true/false"</code> ' . (string) esc_html__( 'Play inline on iPhones instead of fullscreen.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>skip_buttons="true/false"</code> ' . (string) esc_html__( 'Add skip forward/backward buttons.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>gifmode="true/false"</code> ' . (string) esc_html__( 'Videos behave like animated GIFs. autoplay, muted, loop, and playsinline will be enabled. Controls and other overlays will be disabled.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>pauseothervideos="true/false"</code> ' . (string) esc_html__( 'video will pause other videos on the page when it starts playing.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>preload="metadata/auto/none"</code> ' . (string) esc_html__( 'indicate how much of the video should be loaded when the page loads.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>start="mm:ss"</code> ' . (string) esc_html__( 'video will start playing at this timecode.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>watermark="https://www.example.com/image.png"</code> ' . sprintf( /* translators: %s is the word 'false' in code tags */ (string) esc_html__( 'or %s to disable.', 'video-embed-thumbnail-generator' ), $false_code ) . '</li>
	<li><code>watermark_link_to="home/parent/attachment/download/false"</code></li>
	<li><code>watermark_url="https://www.example.com/"</code> ' . sprintf( /* translators: %s is the word 'false' in code tags */ (string) esc_html__( 'or %s to disable. If this is set, it will override the watermark_link_to setting.', 'video-embed-thumbnail-generator' ), $false_code ) . '</li>
	<li><code>title="Video Title"</code> ' . sprintf( /* translators: %s is the word 'false' in code tags */ (string) esc_html__( 'or %s to disable.', 'video-embed-thumbnail-generator' ), $false_code ) . '</li>
	<li><code>embeddable="true/false"</code> ' . (string) esc_html__( 'enable or disable video embedding and sharing icons.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>embedcode="html code"</code> ' . sprintf( /* translators: %s is the word 'false' in code tags */ (string) esc_html__( 'changes text displayed in the embed code overlay in order to provide a custom method for embedding a video or %s to disable.', 'video-embed-thumbnail-generator' ), $false_code ) . '</li>
	<li><code>view_count="true/false"</code> ' . (string) esc_html__( 'turns the view count on or off.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>count_views="quarters/start_complete/start/false"</code> ' . (string) esc_html__( 'sets the level of video view counting.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>caption="Caption"</code> ' . (string) esc_html__( 'text that is displayed below the video (not subtitles or closed captioning)', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>description="Description"</code> ' . (string) esc_html__( 'Used for metadata only.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>downloadlink="true/false"</code> ' . (string) esc_html__( 'shows a download icon overlay to make it easier for users to save the video file to their computers.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>right_click="true/false"</code> ' . (string) esc_html__( 'allow or disable right-clicking on the video player.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>resize="true/false"</code> ' . (string) esc_html__( 'allow or disable responsive resizing.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>auto_res="automatic/highest/lowest/1080p/720p/360p/custom"</code> ' . (string) esc_html__( 'specify the video resolution when the page loads.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>pixel_ratio="true/false"</code> ' . (string) esc_html__( 'account for high-density (retina) displays when choosing automatic video resolution.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>schema="true/false"</code> ' . (string) esc_html__( 'allow or disable Schema.org search engine metadata.', 'video-embed-thumbnail-generator' ) . '</li></ul>
	<p><strong>' . (string) esc_html__( 'These options will add a subtitle/caption track.', 'video-embed-thumbnail-generator' ) . '</strong></p>
	<ul><li><code>track_src="http://www.example.com/subtitles.vtt_.txt"</code> ' . (string) esc_html__( 'URL of the WebVTT file.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>track_kind=subtitles/captions/chapters</code></li>
	<li><code>track_srclang=xx</code> ' . (string) esc_html__( 'the track\'s two-character language code (en, fr, es, etc)', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>track_label="Track Label"</code> ' . (string) esc_html__( 'text that will be shown to the user when selecting the track.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>track_default="default"</code> ' . (string) esc_html__( 'track is enabled by default.', 'video-embed-thumbnail-generator' ) . '</li></ul>
	<p><strong>' . (string) esc_html__( 'These options will only affect Video.js playback', 'video-embed-thumbnail-generator' ) . '</strong></p>
	<ul><li><code>skin="example-css-class"</code> ' . sprintf( /* translators: %s is an <a> link to instructions */ esc_html__( 'Completely change the look of the video player. %sInstructions here.', 'video-embed-thumbnail-generator' ), '<a href="http://codepen.io/heff/pen/EarCt">' ) . '</a></li>
	<li><code>nativecontrolsfortouch="true/false"</code> ' . (string) esc_html__( 'enables or disables native controls on touchscreen devices.', 'video-embed-thumbnail-generator' ) . '</li>
	</ul>
	<p><strong>' . (string) esc_html__( 'These options are available for video galleries (options work the same as standard WordPress image galleries)', 'video-embed-thumbnail-generator' ) . '</p></strong>
	<ul><li><code>gallery="true"</code> ' . (string) esc_html__( 'turns on the gallery', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>gallery_thumb="xxx"</code> ' . (string) esc_html__( 'width in pixels to display gallery thumbnails', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>gallery_exclude="15"</code> ' . (string) esc_html__( 'comma separated video attachment IDs. Excludes the videos from the gallery.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>gallery_include="65"</code> ' . (string) esc_html__( 'comma separated video attachment IDs. Includes only these videos in the gallery. Please note that include and exclude cannot be used together.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>gallery_orderby="menu_order/title/post_date/rand/ID"</code> ' . (string) esc_html__( 'criteria for sorting the gallery', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>gallery_order="ASC/DESC"</code> ' . (string) esc_html__( 'sort order', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>gallery_id="241"</code> ' . (string) esc_html__( 'post ID to display a gallery made up of videos associated with a different post.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>gallery_end="close/next"</code> ' . (string) esc_html__( 'either close the pop-up or start playing the next video when the current video finishes playing.', 'video-embed-thumbnail-generator' ) . '</li>
	<li><code>gallery_per_page="xx"</code> ' . sprintf( /* translators: %s is the word 'false' in code tags */ (string) esc_html__( 'or %s to disable pagination. Number of video thumbnails to show on each gallery page.', 'video-embed-thumbnail-generator' ), $false_code ) . '</li>
	<li><code>gallery_title="true/false"</code> ' . (string) esc_html__( 'display the title overlay on gallery thumbnails.', 'video-embed-thumbnail-generator' ) . '</li></ul>',
			)
		);
	}

	/**
	 * Filters the attachment data sent to the Media Library JS.
	 *
	 * @param array    $response   Array of prepared attachment data.
	 * @param \WP_Post $attachment Attachment object.
	 * @param array    $meta       Array of attachment meta data.
	 * @return array Modified attachment data.
	 */
	public function prepare_attachment_for_js( $response, $attachment, $meta ) {
		unset( $meta );
		$external_url = (string) get_post_meta( (int) $attachment->ID, '_kgflashmediaplayer-externalurl', true );
		if ( $external_url ) {
			$response['filename'] = (string) __( '[External URL]', 'video-embed-thumbnail-generator' ) . ' ' . (string) basename( $external_url );
			$response['url']      = $external_url;
		}

		$poster_id = (int) get_post_thumbnail_id( (int) $attachment->ID );
		if ( $poster_id > 0 ) {
			$poster_src = (array) wp_get_attachment_image_src( $poster_id, 'medium' );
			if ( ! empty( $poster_src ) ) {
				$response['videopack_poster_src'] = (string) $poster_src[0];
			}
		}
		return (array) $response;
	}
}
