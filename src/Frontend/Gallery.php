<?php
/**
 * Frontend gallery handler.
 *
 * @package Videopack
 */

namespace Videopack\Frontend;

/**
 * Class Gallery
 *
 * Handles the display and pagination of video galleries on the frontend.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Frontend
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class Gallery {
	/**
	 * Video formats registry.
	 *
	 * @var \Videopack\Admin\Formats\Registry|null $format_registry
	 */
	protected $format_registry;

	/**
	 * Plugin options.
	 *
	 * @var array $options
	 */
	protected $options;

	/**
	 * Static counter for player instances on the page to ensure unique IDs.
	 *
	 * @var int $player_instance_counter
	 */
	private static $player_instance_counter = 0;

	/**
	 * Attachment meta handler.
	 *
	 * @var \Videopack\Admin\Attachment_Meta $attachment_meta
	 */
	protected $attachment_meta;

	/**
	 * Mapping of video attachment ID to parent post ID (for global query inheritance).
	 *
	 * @var array $video_to_post_mapping
	 */
	public $video_to_post_mapping = array();

	/**
	 * Constructor.
	 *
	 * @param array                                  $options         Videopack options array.
	 * @param \Videopack\Admin\Formats\Registry|null $format_registry Optional. Videopack video formats registry.
	 */
	public function __construct( array $options, \Videopack\Admin\Formats\Registry $format_registry = null ) {

		$this->options = $options;
		if ( ! $format_registry ) {
			$format_registry = new \Videopack\Admin\Formats\Registry( $options );
		}
		$this->format_registry = $format_registry;
		$this->attachment_meta = new \Videopack\Admin\Attachment_Meta( $options );
	}

	/**
	 * Retrieves the video attachments for a gallery based on query attributes.
	 *
	 * @param int|string $page_number The current page number for pagination.
	 * @param array      $query_atts  The gallery query attributes.
	 * @return \WP_Query The query result.
	 */
	public function get_gallery_videos( $page_number, array $query_atts ) {
		$page_number = (int) $page_number;

		if ( (string) ( $query_atts['gallery_orderby'] ?? '' ) === 'menu_order' ) {
			$query_atts['gallery_orderby'] = 'menu_order ID';
		}
		if ( (bool) ( $query_atts['gallery_pagination'] ?? ( $this->options['gallery_pagination'] ?? false ) ) !== true ) {
			if ( ! isset( $query_atts['gallery_per_page'] ) || -1 === (int) $query_atts['gallery_per_page'] ) {
				$query_atts['gallery_per_page'] = (int) ( $query_atts['collection_video_limit'] ?? ( $query_atts['videos'] ?? -1 ) );
			}
		} elseif ( (string) ( $query_atts['gallery_per_page'] ?? '' ) === 'false' ) {
			$query_atts['gallery_per_page'] = -1;
		}

		$args = array(
			'post_type'      => 'attachment',
			'orderby'        => (string) ( $query_atts['gallery_orderby'] ?? 'post_date' ),
			'order'          => (string) ( $query_atts['gallery_order'] ?? 'desc' ),
			'post_mime_type' => 'video',
			'posts_per_page' => (int) ( $query_atts['gallery_per_page'] ?? ( $this->options['gallery_per_page'] ?? -1 ) ),
			'paged'          => (int) $page_number,
			'post_status'    => 'inherit', // Attachments have status 'inherit', not 'published'.
			'post_parent'    => (int) ( $query_atts['gallery_id'] ?? 0 ),
		);

		// Exclude derivative preset formats from galleries.
		$args['meta_query'] = array(
			array(
				'key'     => '_kgflashmediaplayer-format',
				'compare' => 'NOT EXISTS',
			),
		);

		if ( ! empty( $query_atts['gallery_id'] ) ) {
			$args['post_parent'] = (int) $query_atts['gallery_id'];
		} elseif ( in_array( (string) ( $query_atts['gallery_source'] ?? '' ), array( 'recent', 'all' ), true ) ) {
			// For recent or all, we don't want to limit to a specific parent.
			unset( $args['post_parent'] );
		} elseif ( in_array( (string) ( $query_atts['gallery_source'] ?? '' ), array( 'current', 'custom' ), true ) ) {
			if ( empty( $query_atts['gallery_id'] ) && 'current' === ( $query_atts['gallery_source'] ?? '' ) ) {
				$args['post_parent'] = get_the_ID();

				// REST API fallback: get_the_ID() might return 0.
				if ( ! $args['post_parent'] && defined( 'REST_REQUEST' ) && REST_REQUEST ) {
					$args['post_parent'] = (int) ( $query_atts['id'] ?? 0 );
				}
			} else {
				// If source is custom but no ID is provided, or current but still no ID (e.g. not on a post), return empty.
				$args['post__in'] = array( 0 );
				unset( $args['post_parent'] );
			}
		} else {
			unset( $args['post_parent'] );
		}

		if ( ! empty( $query_atts['gallery_source'] ) ) {
			$archive_args       = array(
				'post_type'      => 'post', // Adjust if you want to support other post types.
				'fields'         => 'ids',
				'nopaging'       => true,
				'posts_per_page' => -1,
			);
			$has_archive_source = false;

			if ( 'category' === (string) $query_atts['gallery_source'] ) {
				if ( ! empty( $query_atts['gallery_category'] ) ) {
					$archive_args['cat'] = (int) $query_atts['gallery_category'];
					$has_archive_source  = true;
				} elseif ( is_category() ) {
					$archive_args['cat'] = get_queried_object_id();
					$has_archive_source  = true;
				} else {
					// Category source requested but no category found/provided.
					$args['post__in'] = array( 0 );
					return new \WP_Query( $args );
				}
			} elseif ( 'tag' === (string) $query_atts['gallery_source'] ) {
				if ( ! empty( $query_atts['gallery_tag'] ) ) {
					$archive_args['tag_id'] = (int) $query_atts['gallery_tag'];
					$has_archive_source     = true;
				} elseif ( is_tag() ) {
					$archive_args['tag_id'] = get_queried_object_id();
					$has_archive_source     = true;
				} else {
					// Tag source requested but no tag found/provided.
					$args['post__in'] = array( 0 );
					return new \WP_Query( $args );
				}
			} elseif ( 'archive' === (string) $query_atts['gallery_source'] ) {
				global $wp_query;
				if ( ! is_admin() && $wp_query && $wp_query->is_main_query() && 'attachment' !== $wp_query->get( 'post_type' ) && is_array( $wp_query->posts ) ) {
					$attachment_ids = array();
					foreach ( $wp_query->posts as $q_post ) {
						$video_id = $this->get_first_video_child( $q_post->ID );
						if ( $video_id ) {
							$attachment_ids[]                               = (int) $video_id;
							$this->video_to_post_mapping[ (int) $video_id ] = (int) $q_post->ID;
						}
					}
					if ( ! empty( $attachment_ids ) ) {
						$args['post__in'] = $attachment_ids;
						$args['orderby']  = 'post__in';
						unset( $args['post_parent'] );
						$has_archive_source = false; // We already handled it.
					}
				} elseif ( is_admin() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
					// Editor preview: fetch recent posts and map to their first videos.
					$preview_post_args = array(
						'post_type'      => 'post',
						'posts_per_page' => (int) ( $query_atts['gallery_per_page'] ?? 6 ),
						'post_status'    => 'publish',
					);
					if ( ! empty( $query_atts['gallery_category'] ) ) {
						$preview_post_args['cat'] = $query_atts['gallery_category'];
					} elseif ( ! empty( $query_atts['gallery_tag'] ) ) {
						$preview_post_args['tag_id'] = $query_atts['gallery_tag'];
					}

					$preview_posts  = get_posts( $preview_post_args );
					$attachment_ids = array();
					if ( is_array( $preview_posts ) ) {
						foreach ( $preview_posts as $q_post ) {
							$video_id = $this->get_first_video_child( $q_post->ID );
							if ( $video_id ) {
								$attachment_ids[]                               = (int) $video_id;
								$this->video_to_post_mapping[ (int) $video_id ] = (int) $q_post->ID;
							}
						}
					}

					if ( ! empty( $attachment_ids ) ) {
						$args['post__in'] = $attachment_ids;
						$args['orderby']  = 'post__in';
						unset( $args['post_parent'] );
						$has_archive_source = false;
					} else {
						$has_archive_source = true; // Fallback to attachments if no post-videos found.
					}
				} elseif ( is_category() ) {
					$archive_args['cat'] = get_queried_object_id();
					$has_archive_source  = true;
				} elseif ( is_tag() ) {
					$archive_args['tag_id'] = get_queried_object_id();
					$has_archive_source     = true;
				} elseif ( is_tax() ) {
					$queried_object = get_queried_object();
					if ( $queried_object instanceof \WP_Term ) {
						$archive_args['tax_query'] = array(
							array(
								'taxonomy' => $queried_object->taxonomy,
								'field'    => 'term_id',
								'terms'    => $queried_object->term_id,
							),
						);
						$has_archive_source        = true;
					}
				}
			}

			if ( $has_archive_source ) {
				$post_ids = get_posts( $archive_args );
				if ( ! empty( $post_ids ) ) {
					$args['post_parent__in'] = $post_ids;
					unset( $args['post_parent'] );
				} else {
					// No posts found, ensure an empty result.
					$args['post__in'] = array( 0 );
					unset( $args['post_parent'] );
				}
			}
		}

		if ( ! empty( $query_atts['gallery_exclude'] ) ) {
			$exclude_arr = (array) wp_parse_id_list( (string) $query_atts['gallery_exclude'] );
			if ( ! empty( $exclude_arr ) ) {
				$args['post__not_in'] = (array) $exclude_arr;
			}
		}

		if ( ! empty( $query_atts['gallery_include'] ) ) {
			$include_arr = (array) wp_parse_id_list( (string) $query_atts['gallery_include'] );
			if ( ! empty( $include_arr ) ) {
				$gallery_per_page = (int) ( $query_atts['gallery_per_page'] ?? -1 );

				// Ensure string 'false' from REST is evaluated as boolean false.
				$gallery_pagination = $query_atts['gallery_pagination'] ?? true;
				if ( is_string( $gallery_pagination ) && 'false' === strtolower( trim( $gallery_pagination ) ) ) {
					$gallery_pagination = false;
				} else {
					$gallery_pagination = filter_var( $gallery_pagination, FILTER_VALIDATE_BOOLEAN );
				}
				$bypass_pagination = false === $gallery_pagination;

				if ( ! $bypass_pagination && $gallery_per_page > 0 && count( (array) $include_arr ) > $gallery_per_page ) {
					$total_pages      = (int) ceil( count( (array) $include_arr ) / $gallery_per_page );
					$offset           = (int) ( ( (int) $page_number - 1 ) * $gallery_per_page );
					$args['post__in'] = (array) array_slice( (array) $include_arr, $offset, $gallery_per_page );
				} else {
					$args['post__in'] = (array) $include_arr;
				}
				unset( $args['paged'] );
				if ( (string) ( $args['orderby'] ?? '' ) === 'menu_order ID' || (string) ( $args['orderby'] ?? '' ) === 'include' ) {
					$args['orderby'] = 'post__in'; // Sort by order of IDs in the gallery_include parameter.
				}
				unset( $args['post_parent'] );
			}
		}

		$attachments = new \WP_Query( (array) $args );

		if ( ! empty( $include_arr ) && isset( $total_pages ) ) {
			$attachments->max_num_pages = (int) $total_pages;
		}

		if ( (bool) $attachments->have_posts() ) {
			return $attachments;
		}

		return new \WP_Query(
			array(
				'post__in' => array( 0 ), // No post has the ID of 0.
			)
		);
	}

	/**
	 * Retrieves the ID of the first video attachment for a given post.
	 *
	 * @param int $post_id The parent post ID.
	 * @return int|null The video attachment ID or null if not found.
	 */
	public function get_first_video_child( $post_id ) {
		$args = array(
			'post_type'      => 'attachment',
			'post_mime_type' => 'video',
			'post_status'    => 'inherit',
			'posts_per_page' => 1,
			'post_parent'    => (int) $post_id,
			'fields'         => 'ids',
			'orderby'        => 'menu_order ID',
			'order'          => 'ASC',
			'meta_query'     => array(
				array(
					'key'     => '_kgflashmediaplayer-format',
					'compare' => 'NOT EXISTS',
				),
			),
		);

		$children = get_posts( $args );
		return ! empty( $children ) ? (int) $children[0] : null;
	}

	/**
	 * Prepares video data for frontend JavaScript.
	 *
	 * @param array  $video      Video data array.
	 * @param array  $final_atts Final shortcode attributes.
	 * @param string $layout     Optional. The gallery layout. Default 'gallery'.
	 * @param bool   $skip_html  Optional. Whether to skip generating HTML. Default false.
	 * @return array Prepared video data.
	 */
	public function prepare_video_data_for_js( $video, $final_atts, $layout = 'gallery', $skip_html = false ) {

		if ( $video instanceof \WP_Post ) {
			$video_meta = $this->attachment_meta->set_post_id( (int) $video->ID );
			$video      = array(
				'id'          => (int) $video->ID,
				'url'         => (string) ( $video_meta['url'] ?? wp_get_attachment_url( $video->ID ) ),
				'poster'      => (string) ( $video_meta['poster'] ?? '' ),
				'title'       => (string) $video->post_title,
				'caption'     => (string) $video->post_excerpt,
				'description' => (string) $video->post_content,
				'countable'   => true, // Attachments are countable.
				'count_views' => true, // Default to true for attachments if not specified.
			);
		}

		// Normalize camelCase attributes to snake_case for the player.
		$extra_map = array(
			'titleColor'               => 'title_color',
			'titleBackgroundColor'     => 'title_background_color',
			'playButtonColor'          => 'play_button_color',
			'playButtonSecondaryColor' => 'play_button_secondary_color',
			'controlBarBgColor'        => 'control_bar_bg_color',
			'controlBarColor'          => 'control_bar_color',
			'collectionId'             => 'collection_id',
			'is_modular_engine'        => 'is_modular_engine',
		);
		foreach ( $extra_map as $camel => $snake ) {
			if ( isset( $final_atts[ $camel ] ) ) {
				$final_atts[ $snake ] = $final_atts[ $camel ];
			}
		}

		$autoplay = (bool) ( $final_atts['autoplay'] ?? false );

		// If this is a gallery, we force autoplay because it will be shown in a modal/popup when clicked.
		if ( 'gallery' === $layout && (bool) ( $final_atts['gallery'] ?? false ) === true ) {
			$autoplay = true;
		}

		$source = \Videopack\Video_Source\Source_Factory::create(
			array(
				'id'  => (int) ( $video['id'] ?? 0 ),
				'url' => (string) ( $video['url'] ?? '' ),
			),
			$this->options,
			$this->format_registry
		);
		if ( ! $source ) {
			return array();
		}

		$width  = (int) ( $final_atts['width'] ?? 0 );
		$height = (int) ( $final_atts['height'] ?? 0 );

		// If dimensions are missing or at their global defaults, use the specific attachment dimensions if available.
		if ( ( empty( $width ) || $width === (int) ( $this->options['width'] ?? 960 ) ) && (int) $source->get_width() > 0 ) {
			$width = (int) $source->get_width();
		}
		if ( ( empty( $height ) || $height === (int) ( $this->options['height'] ?? 540 ) ) && (int) $source->get_height() > 0 ) {
			$height = (int) $source->get_height();
		}

		$data = array(
			'id'          => (int) ( $video['id'] ?? 0 ),
			'url'         => (string) $source->get_url(),
			'poster'      => (string) ( $video['poster'] ?? '' ),
			'title'       => (string) ( $video['title'] ?? '' ),
			'caption'     => (string) ( $video['caption'] ?? '' ),
			'description' => (string) ( $video['description'] ?? '' ),
			'width'       => $width,
			'height'      => $height,
			'autoplay'    => $autoplay,
			'mute'        => (bool) ( $final_atts['muted'] ?? false ),
		);

		$video_meta = $this->attachment_meta->set_post_id( (int) $data['id'] );
		$poster_id  = $video_meta['poster_id'] ?? null;

		$poster_url = (string) ( $final_atts['poster'] ?? '' );
		if ( empty( $poster_url ) ) {
			if ( $poster_id ) {
				$poster_url = (string) wp_get_attachment_url( $poster_id );
			} else {
				$poster_url = (string) ( $video_meta['poster'] ?? '' );
			}
		}

		if ( empty( $poster_url ) ) {
			$poster_url = (string) $source->get_poster();
		}

		// No hardcoded fallback on the frontend. If empty, the player will handle it.
		if ( empty( $poster_url ) ) {
			$poster_url = '';
		}
		++self::$player_instance_counter;
		$instance_id = (string) self::$player_instance_counter;
		$player      = Video_Players\Player_Factory::create( (string) ( $this->options['embed_method'] ?? 'Video.js' ), $this->options, $this->format_registry );

		$collection_id = $final_atts['collection_id'] ?? $query_atts['collectionId'] ?? 'vp_gallery_default';
		$player->set_id( "gallery_{$data['id']}_{$collection_id}" );
		$player->set_source( $source );
		$player->set_atts(
			array_merge(
				(array) $final_atts,
				array(
					'id'            => (int) $data['id'],
					'width'         => $width,
					'height'        => $height,
					'autoplay'      => $autoplay,
					'controls'      => true,
					'title'         => $data['title'],
					'stats_title'   => $data['title'],
					'overlay_title' => $final_atts['overlay_title'] ?? true,
					'poster'        => $poster_url, // Ensure the player gets the resolved poster.
				)
			)
		);

		$player_vars = (array) $player->prepare_video_vars();
		$player->enqueue_scripts();
		if ( ! $skip_html ) {
			$player_vars['full_player_html'] = \Videopack\Frontend\Modular_Renderer::render_player_assembly( $player, $player->get_atts(), $source, $this->options );
		}
		$player_vars['sources']       = (array) $player->get_flat_sources();
		$player_vars['poster']        = $poster_url;
		$player_vars['attachment']    = (int) $data['id'];
		$player_vars['attachment_id'] = (int) $data['id'];
		$player_vars['parent_id']     = $this->video_to_post_mapping[ (int) $data['id'] ] ?? null;
		$player_vars['embed_url']     = (string) add_query_arg( 'videopack[enable]', 'true', (string) get_attachment_link( (int) $data['id'] ) );

		// Retrieve video statistics from attachment metadata if available.
		if ( isset( $video_meta['starts'] ) ) {
			$player_vars['starts'] = (int) $video_meta['starts'];
		} else {
			$player_vars['starts'] = (int) ( $final_atts['starts'] ?? 0 );
		}

		$video_data = array(
			'attachment_id' => (int) $data['id'],
			'title'         => (string) $data['title'],
			'date'          => (string) get_the_date( 'c', $data['id'] ),
			'poster_url'    => (string) $poster_url,
			'poster_srcset' => $poster_id ? (string) wp_get_attachment_image_srcset( (int) $poster_id, 'medium_large' ) : '',
			'player_vars'   => (array) $player_vars,
			'parent_id'     => $player_vars['parent_id'],
			'embed_url'     => $player_vars['embed_url'],
		);

		if ( ! empty( $video_meta['duration'] ) ) {
			$video_data['duration'] = $video_meta['duration'];
		}

		return $video_data;
	}

	/**
	 * Renders a collection page (gallery or list) and returns both HTML and video data.
	 *
	 * @param int|string $page_number The current page number.
	 * @param array      $query_atts  The query attributes.
	 * @param string     $layout      The layout type ('gallery' or 'list').
	 * @param bool       $skip_html   Optional. Whether to skip generating HTML. Default false.
	 * @return array {
	 *     @type string $html          The rendered HTML.
	 *     @type array  $videos        The prepared video data for JS.
	 *     @type int    $max_num_pages The total number of pages.
	 *     @type int    $current_page  The current page number.
	 * }
	 */
	public function collection_page( $page_number, array $query_atts, $layout = 'gallery', $skip_html = false ) {
		$page_number               = (int) $page_number;
		$query_atts['currentPage'] = $page_number;
		if ( empty( $query_atts['collectionId'] ) ) {
			$query_atts['collectionId'] = 'vp_gallery_' . ( $query_atts['gallery_id'] ?? 'default' );
		}
		$query_atts['layout'] = ( 'gallery' === $layout || 'grid' === $layout ) ? ( $query_atts['layout'] ?? 'grid' ) : 'list';

		/**
		 * 1. Simulate the block structure.
		 */
		$collection_id = 'vp_gallery_' . ( $query_atts['gallery_id'] ?? 'default' );
		$block_atts    = array_merge(
			$this->options,
			$query_atts,
			array(
				'columns'      => (int) ( $query_atts['gallery_columns'] ?? 3 ),
				'collectionId' => $collection_id,
			)
		);

		$inner_blocks_json = (string) ( $query_atts['inner_blocks_template'] ?? '' );
		$inner_blocks      = '';

		if ( ! empty( $inner_blocks_json ) ) {
			$template_data = json_decode( $inner_blocks_json, true );
			if ( is_array( $template_data ) && function_exists( 'serialize_blocks' ) ) {
				$inner_blocks = serialize_blocks( $template_data );
			}
		}

		// Fallback to default structure if no template is provided (e.g. legacy galleries).
		if ( empty( $inner_blocks ) ) {
			$grid_metadata = (string) ( $query_atts['grid_metadata'] ?? '' );
			$show_duration = strpos( $grid_metadata, 'duration' ) !== false || ! empty( $query_atts['showDuration'] );
			$show_views    = strpos( $grid_metadata, 'views' ) !== false || ! empty( $query_atts['views'] );
			$link_to       = $query_atts['grid_link_to'] ?? 'lightbox';

			$inner_blocks  = '<!-- wp:videopack/loop -->';
			$inner_blocks .= sprintf( '<!-- wp:videopack/thumbnail {"linkTo":"%s"} -->', esc_attr( $link_to ) );
			$inner_blocks .= '<!-- wp:videopack/play-button /-->';
			$inner_blocks .= '<!-- wp:videopack/title {"isOverlay":true} /-->';

			if ( $show_duration ) {
				$inner_blocks .= '<!-- wp:videopack/duration /-->';
			}
			if ( $show_views ) {
				$inner_blocks .= '<!-- wp:videopack/view-count /-->';
			}

			$inner_blocks .= '<!-- /wp:videopack/thumbnail -->';
			$inner_blocks .= '<!-- /wp:videopack/loop -->';

			if ( ! empty( $query_atts['gallery_pagination'] ) ) {
				$inner_blocks .= '<!-- wp:videopack/pagination /-->';
			}
		}

		$serialized = sprintf(
			'<!-- wp:videopack/collection %s -->%s<!-- /wp:videopack/collection -->',
			wp_json_encode( $query_atts ),
			$inner_blocks
		);

		/**
		 * 2. Render the block HTML.
		 */
		$html = '';
		if ( ! $skip_html ) {
			$html = do_blocks( $serialized );
		}

		/**
		 * 3. Return video data for AJAX lifecycle (lightbox init, etc).
		 *
		 * Even though we render via blocks now, we still need to return the array of
		 * video metadata for videopack.js to pick up and process.
		 */
		$attachments   = $this->get_gallery_videos( $page_number, $query_atts );
		$videos_data   = array();
		$max_num_pages = (int) ( $attachments->max_num_pages ?? 1 );

		if ( (bool) $attachments->have_posts() ) {
			foreach ( (array) $attachments->posts as $attachment ) {
				$video_data = (array) $this->prepare_video_data_for_js( $attachment, $query_atts, $layout, $skip_html );
				if ( ! empty( $video_data ) ) {
					$videos_data[] = (array) $video_data;
				}
			}
		}

		return array(
			'html'          => $html,
			'videos'        => $videos_data,
			'max_num_pages' => $max_num_pages,
			'current_page'  => $page_number,
		);
	}

	/**
	 * Renders the pagination HTML for the gallery.
	 *
	 * @param int $max_pages    The maximum number of pages.
	 * @param int $current_page The current active page.
	 * @return string The rendered pagination HTML.
	 */
	public function render_pagination_html( $max_pages, $current_page ) {
		return Modular_Renderer::render_pagination( $current_page, $max_pages );
	}
}
