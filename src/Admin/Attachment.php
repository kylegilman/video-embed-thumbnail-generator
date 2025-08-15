<?php

namespace Videopack\Admin;

class Attachment {

	/**
	 * Videopack Options manager class instance
	 * @var Options $options_manager
	 */
	protected $options_manager;
	protected $options;
	protected $video_formats;
	protected $attachment_meta;

	public function __construct( Options $options_manager ) {

		$this->options_manager = $options_manager;
		$this->options         = $options_manager->get_options();
		$this->video_formats   = $options_manager->get_video_formats();
		$this->attachment_meta = new Attachment_Meta( $options_manager );
	}

	public function url_to_id( $url ) {

		$post_id    = false;
		$search_url = $this->get_transient_name( $url );

		if ( $this->options['transient_cache'] === true ) {
			$post_id = get_transient( 'videopack_url_cache_' . md5( $search_url ) );
		}

		if ( $post_id === false ) {

			$post_id = attachment_url_to_postid( $search_url );

			if ( $this->options['transient_cache'] === true ) {
				if ( ! $post_id ) {
					$post_id = 'not found'; // don't save a transient value that could evaluate as false
				}

				set_transient( 'videopack_url_cache_' . md5( $search_url ), $post_id, MONTH_IN_SECONDS );
			}
		}//end if

		if ( $post_id === 'not found' ) {
			$post_id = null;
		}

		/**
		 * Filters the post ID returned for a given URL.
		 * @param int|null $post_id The post ID.
		 * @param string $url The URL.
		 */
		return apply_filters( 'videopack_url_to_id', $post_id, $url );
	}

	public function is_animated_gif( $filename ) {
		// Attempt to use Imagick if available
		if ( class_exists( 'Imagick' ) ) {
			try {
				$image  = new \Imagick( $filename );
				$frames = $image->coalesceImages();

				$count = 0;
				foreach ( $frames as $frame ) {
					++$count;
					if ( $count > 1 ) {
						return true;
					}
				}
			} catch ( \Exception $e ) {
				return false;
			}
		}

		// Read file in chunks if Imagick isn't available.
		$fh = fopen( $filename, 'rb' );

		if ( ! $fh ) {
			return false;
		}

		$total_count = 0;
		$chunk       = '';

		while ( ! feof( $fh ) && $total_count < 2 ) {
			// Read 100kb at a time and append it to the remaining chunk.
			$chunk       .= fread( $fh, 1024 * 100 );
			$count        = preg_match_all( '#\x00\x21\xF9\x04.{4}\x00(\x2C|\x21)#s', $chunk, $matches );
			$total_count += $count;

			// Execute this block only if we found at least one match,
			// and if we did not reach the maximum number of matches needed.
			if ( $count > 0 && $total_count < 2 ) {
				// Get the last full expression match.
				$last_match = end( $matches[0] );
				// Get the string after the last match.
				$end   = strrpos( $chunk, $last_match ) + strlen( $last_match );
				$chunk = substr( $chunk, $end );
			}
		}

		fclose( $fh );

		return $total_count > 1;
	}

	public function is_video( $post ) {

		if ( $post && is_object( $post ) && property_exists( $post, 'post_mime_type' ) ) {

			if ( $post->post_mime_type == 'image/gif' ) {
				$moviefile      = get_attached_file( $post->ID );
				$kgvid_postmeta = $this->attachment_meta->get( $post->ID );
				if ( $kgvid_postmeta['animated'] === 'notchecked' ) {
					$kgvid_postmeta['animated'] = $this->is_animated_gif( $moviefile );
					$this->attachment_meta->save( $post->ID, $kgvid_postmeta );
				}
			} else {
				$kgvid_postmeta['animated'] = false;
			}

			if ( ( substr( $post->post_mime_type, 0, 5 ) === 'video'
				&& ( empty( $post->post_parent )
					|| ( strpos( get_post_mime_type( $post->post_parent ), 'video' ) === false
						&& get_post_meta( $post->ID, '_kgflashmediaplayer-externalurl', true ) == ''
					)
				) )
				|| $kgvid_postmeta['animated']
			) { // if the attachment is a video with no parent or if it has a parent the parent is not a video and the video doesn't have the externalurl post meta

				return true;

			}
		}

		return false;
	}

	public function generate_for_existing_attachments( $type ) {

		$queue = get_option( 'kgvid_video_embed_cms_switch' );

		if ( is_array( $queue )
			&& array_key_exists( 'generating_old_' . $type, $queue )
			&& is_array( $queue[ 'generating_old_' . $type ] )
		) {

			$x = 1;
			foreach ( $queue[ 'generating_old_' . $type ] as $video_id ) {

				$this->schedule_attachment_processing( $video_id, $type, $x );

				unset( $queue[ 'generating_old_' . $type ][ $video_id ] );
				update_option( 'kgvid_video_embed_cms_switch', $queue );
				++$x;
			}
			unset( $queue[ 'generating_old_' . $type ] );
			if ( empty( $queue ) ) {
				delete_option( 'kgvid_video_embed_cms_switch' );
			} else {
				update_option( 'kgvid_video_embed_cms_switch', $queue );
			}
		}
	}

	public function delete_video_attachment( $video_id ) {

		if ( strpos( get_post_mime_type( $video_id ), 'video' ) !== false
			|| get_post_meta( $video_id, '_kgflashmediaplayer-format', true )
		) { // only do this for videos or other child formats

			$encode_queue = new Encode\Encode_Queue_Controller( $this->options_manager );

			// If this is a child attachment, find the corresponding job and delete it.
			$parent_id = wp_get_post_parent_id( $video_id );
			if ( $parent_id ) {
				$format_id = get_post_meta( $video_id, '_kgflashmediaplayer-format', true );
				if ( $format_id ) {
					$encoder     = new Encode\Encode_Attachment( $this->options_manager, $parent_id );
					$encode_format = $encoder->get_encode_format( $format_id );
					if ( $encode_format && $encode_format->get_job_id() ) {
						$encode_queue->delete_job( $encode_format->get_job_id() );
					}
				}
			} else { // This is a parent attachment, delete all its jobs.
				$encoder = new Encode\Encode_Attachment( $this->options_manager, $video_id );
				$formats = $encoder->get_formats();
				foreach ( $formats as $format ) {
					if ( $format->get_job_id() ) {
						$encode_queue->delete_job( $format->get_job_id() );
					}
				}
			}

			$parent_id = get_post( $video_id )->post_parent;

			$args  = array(
				'post_parent' => $video_id,
				'post_type'   => 'attachment',
				'numberposts' => '-1',
			);
			$posts = get_posts( $args ); // find all children of the video in the database
			if ( $posts ) {
				$formats = array();
				foreach ( $posts as $post ) {
					wp_update_post(
						array(
							'ID'          => $post->ID,
							'post_parent' => $parent_id,
						)
					); // set post_parent field to the original video's post_parent //
					if ( $this->options['delete_children'] != 'none' ) {
						if ( $this->options['delete_children'] == 'all' ) {
							wp_delete_attachment( $post->ID, true );
						} elseif ( strpos( $post->post_mime_type, 'video' ) !== false ) {
							wp_delete_attachment( $post->ID, true );
						} //only delete videos
					} elseif ( strpos( $post->post_mime_type, 'video' ) !== false ) {
							$format = get_post_meta( $post->ID, '_kgflashmediaplayer-format', true );
						if ( $format ) {
							$formats[ $format ] = $post->ID;
						}
					}
				}//end loop
				if ( $this->options['delete_children'] == 'none' ) { // find a child to be the new master video
					$video_formats = $this->options_manager->get_video_formats();
					foreach ( $video_formats as $format => $format_stats ) {
						if ( array_key_exists( $format, $formats ) ) {
							$new_master = $formats[ $format ];
							unset( $formats[ $format ] );
							delete_post_meta( $new_master, '_kgflashmediaplayer-format' ); // master videos don't have the child format meta info
							wp_update_post(
								array(
									'ID'         => $new_master,
									'post_title' => get_the_title( $video_id ),
								)
							); // set the new master's title to the old master's title
							foreach ( $formats as $child_id ) {
								wp_update_post(
									array(
										'ID'          => $child_id,
										'post_parent' => $new_master,
									)
								); // set all the other children as the new master's child
							}
							break; // stop after the highest quality format;
						}
					}
				}
				//end if there are any children
			}
			//end if video or other child format
		} elseif ( strpos( get_post_mime_type( $video_id ), 'image' ) !== false ) {
			$args  = array(
				'numberposts' => '-1',
				'post_type'   => 'attachment',
				'meta_key'    => '_kgflashmediaplayer-poster-id',
				'meta_value'  => $video_id,
			);
			$posts = get_posts( $args ); // find all posts that have this thumbnail ID in their meta
			if ( $posts ) {
				foreach ( $posts as $post ) {
					delete_post_meta( $post->ID, '_kgflashmediaplayer-poster-id' );
					delete_post_meta( $post->ID, '_thumbnail-id' );
					delete_post_meta( $post->ID, '_kgflashmediaplayer-poster' );
				}
			}
		}

		$transient_name = $this->get_transient_name( wp_get_attachment_url( $video_id ) );
		delete_transient( 'kgvid_' . $transient_name );
	}

	public function add_attachment_handler( $post_id ) {
		if ( $this->options['auto_encode'] || $this->options['auto_thumb'] ) {
			$post = get_post( $post_id );
			if ( $this->is_video( $post ) ) {
				as_schedule_single_action( time() + 10, 'videopack_process_new_attachment', array( 'post_id' => $post_id ), 'videopack-attachments' );
				// After scheduling, immediately trigger the Action Scheduler to process pending jobs.
				do_action( 'action_scheduler_run_queue' );
			}
		}
	}

	public function process_new_attachment_action( $post_id ) {
		$post = get_post( $post_id );
		if ( ! $post ) {
			return;
		}

		// Thumbnail generation
		if ( $this->options['auto_thumb'] && $this->is_video( $post ) && $post->post_mime_type != 'image/gif' ) {
			$ffmpeg_thumbnails = new FFmpeg_Thumbnails( $this->options_manager );
			$filepath          = get_attached_file( $post_id );
			$thumb_ids         = array();
			$total_thumbs      = intval( $this->options['auto_thumb_number'] );

			if ( $total_thumbs === 1 ) {
				$ffmpeg_path    = ! empty( $this->options['app_path'] ) ? $this->options['app_path'] . '/ffmpeg' : 'ffmpeg';
				$video_metadata = new \Videopack\Admin\Encode\Video_Metadata( $post_id, $filepath, true, $ffmpeg_path, $this->options_manager );

				if ( $video_metadata->worked && $video_metadata->duration ) {
					$position = intval( $this->options['auto_thumb_position'] );
					$timecode = 0.1; // Default to 0.1s to avoid black frames
					if ( $position > 0 ) {
						$timecode = ( $position / 100 ) * $video_metadata->duration;
					}

					$thumb_data = $ffmpeg_thumbnails->generate_thumbnail_at_timecode( $post_id, $timecode );

					if ( ! is_wp_error( $thumb_data ) ) {
						$thumb_info = $ffmpeg_thumbnails->save( $post_id, $post->post_title, $thumb_data['url'], false );
						if ( isset( $thumb_info['thumb_id'] ) && $thumb_info['thumb_id'] && ! is_wp_error( $thumb_info['thumb_id'] ) ) {
							$thumb_ids[1] = $thumb_info['thumb_id'];
						}
					}
				}
			} else { // Multiple thumbnails
				for ( $i = 1; $i <= $total_thumbs; $i++ ) {
					$thumb_data = $ffmpeg_thumbnails->generate_single_thumbnail_data( $post_id, $total_thumbs, $i, false );

					if ( is_wp_error( $thumb_data ) ) {
						continue;
					}

					$thumb_info = $ffmpeg_thumbnails->save( $post_id, $post->post_title, $thumb_data['url'], $i );

					if ( isset( $thumb_info['thumb_id'] ) && $thumb_info['thumb_id'] && ! is_wp_error( $thumb_info['thumb_id'] ) ) {
						$thumb_ids[ $i ] = $thumb_info['thumb_id'];
					}
				}
			}

			if ( ! empty( $thumb_ids ) ) {
				$thumb_key = ( $total_thumbs > 1 ) ? intval( $this->options['auto_thumb_position'] ) : 1;
				if ( $thumb_key > $total_thumbs || $thumb_key <= 0 ) { // Sanity check
					$thumb_key = 1;
				}
				if ( array_key_exists( $thumb_key, $thumb_ids ) ) {
					set_post_thumbnail( $post_id, $thumb_ids[ $thumb_key ] );
					if ( $this->options['featured'] && ! empty( $post->post_parent ) ) {
						set_post_thumbnail( $post->post_parent, $thumb_ids[ $thumb_key ] );
					}
				}
			}
		}

		// Encoding
		if ( $this->options['auto_encode'] ) {
			$is_animated = ( $post->post_mime_type == 'image/gif' ) ? $this->is_animated_gif( get_attached_file( $post_id ) ) : false;
			if ( ( ! $is_animated || $this->options['auto_encode_gif'] ) && $this->is_video( $post ) ) {
				$encode_queue      = new Encode\Encode_Queue_Controller( $this->options_manager );
				$movieurl          = wp_get_attachment_url( $post_id );
				$encode_attachment = new Encode\Encode_Attachment( $this->options_manager, $post_id, $movieurl );
				
				$all_formats = $this->options_manager->get_video_formats();
				$formats_to_encode = array();

				foreach ( $all_formats as $format_id => $format_object ) {
					if ( $format_object->is_enabled() ) {
						$can_queue_status = $encode_attachment->check_if_can_queue( $format_id );
						if ( 'ok_to_queue' === $can_queue_status ) {
							$formats_to_encode[] = $format_id;
						}
					}
				}

				if ( ! empty( $formats_to_encode ) ) {
					$encode_queue->enqueue_encodes(
						array(
							'id'      => $post_id,
							'url'     => $movieurl,
							'formats' => $formats_to_encode,
						)
					);
				}
			}
		}
	}


	public function cron_check_post_parent_handler( $post_id ) {

		$post               = get_post( $post_id );
		$video_thumbnail_id = get_post_thumbnail_id( $post_id );
		$post_thumbnail_id  = get_post_thumbnail_id( $post->post_parent );

		if ( ! empty( $post->post_parent )
			&& ! empty( $video_thumbnail_id )
			&& empty( $post_thumbnail_id )
		) {
			set_post_thumbnail( $post->post_parent, $video_thumbnail_id );
		}
	}

	public function change_thumbnail_parent( $post_id, $parent_id ) {

		$args       = array(
			'post_type'      => 'attachment',
			'post_mime_type' => 'image',
			'numberposts'    => '-1',
			'meta_key'       => '_kgflashmediaplayer-video-id',
			'meta_value'     => $post_id,
		);
		$thumbnails = get_posts( $args ); // find all thumbnail children of the video in the database

		if ( $thumbnails ) {

			foreach ( $thumbnails as $thumbnail ) {

				if ( $thumbnail->post_parent != $parent_id ) {

					if ( empty( $parent_id ) ) {
						$thumbnail->post_parent = $post_id;
					} else { // parent post exists
						$thumbnail->post_parent = $parent_id;
					}

					wp_update_post( $thumbnail );
				}
			}//end loop through thumbnails
		}//end if thumbnails
	}

	public function validate_attachment_updated( $post_id ) {

		$post     = get_post( $post_id );
		$is_video = $this->is_video( $post );

		if ( $is_video ) {
			if ( $this->options['thumb_parent'] === 'post' ) {
				$this->change_thumbnail_parent( $post_id, $post->post_parent );
			}

			$featured_id    = get_post_meta( $post_id, '_kgflashmediaplayer-poster-id', true );
			$kgvid_postmeta = $this->attachment_meta->get( $post_id );
			//this doesn't always get set in the old Media Library view
			set_post_thumbnail( $post_id, $featured_id );
			if ( $kgvid_postmeta['featuredchanged'] === 'true'
				&& ! empty( $featured_id )
			) {
				set_post_thumbnail( $post->post_parent, $featured_id );
			}
		}
	}

	public function get_transient_name( $url ) {

		$url = str_replace( ' ', '', $url ); // in case a url with spaces got through
		// Get the path or the original size image by slicing the widthxheight off the end and adding the extension back.
		$search_url = preg_replace( '/-\d+x\d+(\.(?:png|jpg|gif))$/i', '.' . pathinfo( $url, PATHINFO_EXTENSION ), $url );

		return $search_url;
	}

	public function add_mime_types( $existing_mimes ) {

		$existing_mimes['mpd']  = 'application/dash+xml';
		$existing_mimes['m3u8'] = 'application/vnd.apple.mpegurl';

		return $existing_mimes;
	}

	public function add_extra_video_metadata( $metadata, $file, $file_format, $data ) {

		if ( isset( $data['video']['dataformat'] ) && $data['video']['dataformat'] !== 'quicktime' ) {
			$metadata['codec'] = str_replace( 'V_', '', $data['video']['dataformat'] );
		} elseif ( isset( $data['video']['fourcc'] ) ) {
			$metadata['codec'] = $data['video']['fourcc'];
		}

		if ( ! empty( $data['video']['frame_rate'] ) ) {
			$metadata['frame_rate'] = $data['video']['frame_rate'];
		}

		return $metadata;
	}
}
