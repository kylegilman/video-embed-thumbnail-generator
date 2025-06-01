<?php

namespace Videopack\Admin;

class Attachment {

	/**
	 * Videopack Options manager class instance
	 * @var Options $options_manager
	 */
	protected $options_manager;
	protected $video_formats;
	protected $attachment_meta;

	public function __construct( Options $options_manager ) {

		$this->options_manager = $options_manager;
		$this->video_formats   = $options_manager->get_video_formats();
		$this->attachment_meta = new Attachment_Meta( $options_manager );
	}

	public function url_to_id( $url ) {

		global $wpdb;
		$post_id    = false;
		$search_url = $this->get_transient_name( $url );

		if ( $this->options_manager->transient_cache === true ) {
			$post_id = get_transient( 'videopack_url_cache_' . md5( $search_url ) );
		}

		if ( $post_id === false ) {

			$post_id = (int) $wpdb->get_var(
				$wpdb->prepare(
					"SELECT post_id
					FROM $wpdb->postmeta
					WHERE meta_key = '_wp_attached_file'
					AND meta_value LIKE RIGHT(%s, CHAR_LENGTH(meta_value))
					AND LENGTH(meta_value) > 0",
					array(
						$search_url,
					)
				)
			);

			if ( ! $post_id && $this->options_manager->ffmpeg_exists === true
				&& $this->video_formats['fullres']['extension'] !== pathinfo( $url, PATHINFO_EXTENSION )
			) {
				$search_url = str_replace( pathinfo( $url, PATHINFO_EXTENSION ), $this->video_formats['fullres']['extension'], $url );
				$post_id    = (int) $wpdb->get_var(
					$wpdb->prepare(
						"SELECT post_id
						FROM $wpdb->postmeta
						WHERE meta_key = '_wp_attached_file'
						AND meta_value LIKE RIGHT(%s, CHAR_LENGTH(meta_value))
						AND LENGTH(meta_value) > 0",
						array(
							$search_url,
						)
					)
				);
				if ( $post_id ) {
					$kgvid_postmeta = $this->attachment_meta->get( $post_id );
				}
				if ( ! isset( $kgvid_postmeta )
					|| ! is_array( $kgvid_postmeta )
					|| ( is_array( $kgvid_postmeta )
						&& ! array_key_exists( 'original_replaced', $kgvid_postmeta )
					)
				) {
					$post_id = null;
				}
			}

			if ( $this->options_manager->transient_cache === true ) {
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

			if ( substr( $post->post_mime_type, 0, 5 ) === 'video'
				&& ( empty( $post->post_parent )
					|| ( strpos( get_post_mime_type( $post->post_parent ), 'video' ) === false
						&& get_post_meta( $post->ID, '_kgflashmediaplayer-externalurl', true ) == ''
					)
				)
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

			$video_encode_queue = kgvid_get_encode_queue();
			$parent_id          = get_post( $video_id )->post_parent;
			$wp_attached_file   = get_post_meta( $video_id, '_wp_attached_file', true );

			if ( ! empty( $video_encode_queue )
				&& is_array( $video_encode_queue )
			) { // remove any encode queue entry related to this attachment
				foreach ( $video_encode_queue as $video_key => $video_entry ) {
					if ( $video_entry['attachmentID'] == $video_id ) {

						foreach ( $video_entry['encode_formats'] as $format => $value ) {
							if ( $value['status'] == 'encoding' ) {
								kgvid_cancel_encode( $video_key, $format );
								if ( file_exists( $value['filepath'] ) ) {
									wp_delete_file( $value['filepath'] );
								}
							}
						}

						unset( $video_encode_queue[ $video_key ] );
						sort( $video_encode_queue );
						kgvid_save_encode_queue( $video_encode_queue );
						break;
					}//if the video is an original format
					if ( $video_entry['attachmentID'] == $parent_id
						|| get_post_meta( $video_id, '_kgflashmediaplayer-externalurl', true ) == $video_entry['movieurl']
					) {
						foreach ( $video_entry['encode_formats'] as $format => $value ) {
							if ( array_key_exists( 'filepath', $value ) ) {
								if ( strpos( $value['filepath'], $wp_attached_file ) !== false ) {
									$video_encode_queue[ $video_key ]['encode_formats'][ $format ]['status'] = 'deleted';
									kgvid_save_encode_queue( $video_encode_queue );
									break;
								}//if the format has filepath information
							}//if the encoded child format is in the database
						}//loop through formats
					}//if the video is a child format
				}
			}

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
					); // set post_parent field to the original video's post_parent
					if ( $this->options_manager->delete_children != 'none' ) {
						if ( $this->options_manager->delete_children == 'all' ) {
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
				if ( $this->options_manager->delete_children == 'none' ) { // find a child to be the new master video
					$video_formats = kgvid_video_formats();
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

		if ( $this->options_manager->auto_encode == true || $this->options_manager->auto_thumb == true ) {

			$this->schedule_attachment_processing( $post_id );

		}
	}

	public function schedule_attachment_processing( $post_id, $force = false, $x = 1 ) {

		$post     = get_post( $post_id );
		$is_video = $this->is_video( $post );

		if ( $is_video ) {

			$time_offset = ( $x * 3 );

			$already_scheduled = wp_get_scheduled_event( 'videopack_cron_new_attachment', array( $post_id, $force ) );

			if ( $already_scheduled === false ) {
				wp_schedule_single_event( time() + $time_offset, 'videopack_cron_new_attachment', array( $post_id, $force ) );
			}

			if ( $force === false ) {
				$transient = get_transient( 'videopack_new_attachment_transient' ); // error checking to avoid race conditions when using Add From Server
				if ( is_array( $transient ) ) {
					$transient[] = $post_id;
				} else {
					$transient = array( $post_id );
				}
				$transient = array_unique( $transient );
				set_transient( 'videopack_new_attachment_transient', $transient, DAY_IN_SECONDS );
			}
		}
	}

	public function cron_new_attachment_handler( $post_id, $force = false ) {

		$thumbnails        = new Thumbnails\Thumbnails( $this->options_manager );
		$ffmpeg_thumbnails = new Thumbnails\FFmpeg_Thumbnails( $this->options_manager );
		$auto_encode       = $this->options_manager->auto_encode;
		$auto_thumb        = $this->options_manager->auto_thumb;

		if ( $force != false ) {
			$auto_encode = false;
			$auto_thumb  = false;
		}

		$post        = get_post( $post_id );
		$movieurl    = wp_get_attachment_url( $post_id );
		$filepath    = get_attached_file( $post_id );
		$is_animated = false;
		if ( $post
			&& $post->post_mime_type == 'image/gif'
		) {
			$is_animated = $this->is_animated_gif( $filepath );
		}

		if ( $post
			&& $post->post_mime_type != 'image/gif'
			&& ( $force == 'thumbs'
				|| $auto_thumb == true
			)
		) {

			$thumb_output   = array();
			$thumb_id       = array();
			$numberofthumbs = intval( $this->options_manager->auto_thumb_number );

			if ( $numberofthumbs == 1 ) {

				switch ( $this->options_manager->auto_thumb_position ) {
					case 0:
						$imaginary_numberofthumbs = 1;
						$iincreaser               = 1;
						$thumbtimecode            = 'firstframe';
						$dofirstframe             = true;
						break;
					case 25:
						$imaginary_numberofthumbs = 8;
						$iincreaser               = 4;
						$thumbtimecode            = '';
						$dofirstframe             = false;
						break;
					case 50:
						$imaginary_numberofthumbs = 8;
						$iincreaser               = 8;
						$thumbtimecode            = '';
						$dofirstframe             = false;
						break;
					case 75:
						$imaginary_numberofthumbs = 8;
						$iincreaser               = 12;
						$thumbtimecode            = '';
						$dofirstframe             = false;
						break;
				}

				$thumb_output[1] = $ffmpeg_thumbnails->make( $post_id, $movieurl, $imaginary_numberofthumbs, 1, $iincreaser, $thumbtimecode, $dofirstframe, 'generate' );
				$thumb_key       = 1;

			}//end if just one auto_thumb

			if ( $numberofthumbs > 1 ) {

				$thumb_key = intval( $this->options_manager->auto_thumb_position );

				$i          = 1;
				$increaser  = 0;
				$iincreaser = 0;
				while ( $i <= $numberofthumbs ) {
					$iincreaser         = $i + $increaser;
					$thumb_output[ $i ] = $ffmpeg_thumbnails->make( $post_id, $movieurl, $numberofthumbs, $i, $iincreaser, '', false, 'generate' );
					if ( $thumb_output[ $i ]['lastthumbnumber'] == 'break' ) {
						$thumb_key = $i;
						break;
					}
					++$increaser;
					++$i;
				}
			}//end if more than one auto_thumb

			foreach ( $thumb_output as $key => $output ) {

				if ( $thumb_output[ $key ]['lastthumbnumber'] != 'break' ) {
					if ( $numberofthumbs == 1 ) {
						$index = false;
					} else {
						$index = $key;
					}
					$thumb_info       = $thumbnails->save( $post_id, $post->post_title, $thumb_output[ $key ]['thumb_url'], $index );
					$thumb_id[ $key ] = $thumb_info['thumb_id'];
					//end if there wasn't an error
				} else {
					$kgvid_postmeta                    = $this->attachment_meta->get( $post_id );
					$kgvid_postmeta['autothumb-error'] = $thumb_output[ $thumb_key ]['embed_display'];
					$this->attachment_meta->save( $post_id, $kgvid_postmeta );
				}
			}//end loop through generated thumbnails to save them in the database

			if ( ! empty( $thumb_id[ $thumb_key ] ) ) {
				$thumb_output[ $thumb_key ]['thumb_url'] = wp_get_attachment_url( $thumb_id[ $thumb_key ] );
				update_post_meta( $post_id, '_kgflashmediaplayer-poster', $thumb_output[ $thumb_key ]['thumb_url'] );
				update_post_meta( $post_id, '_kgflashmediaplayer-poster-id', $thumb_id[ $thumb_key ] );
				set_post_thumbnail( $post_id, $thumb_id[ $thumb_key ] );
				if ( $this->options_manager->featured == true && ! empty( $thumb_id[ $thumb_key ] ) ) {
					if ( ! empty( $post->post_parent ) ) {
						set_post_thumbnail( $post->post_parent, $thumb_id[ $thumb_key ] );
					} else { // video has no parent post yet
						wp_schedule_single_event( time() + 60, 'videopack_cron_check_post_parent', array( $post_id ) );
					}
				}
			}//end setting main thumbnail
		}//end if auto_thumb is on

		if ( $post
			&& ( $force == 'encode'
				|| $auto_encode == true
			)
			&& ( ! $is_animated
				|| $this->options_manager->auto_encode_gif == true
			)
		) {

			$video_formats       = kgvid_video_formats();
			$kgvid_postmeta      = $this->attachment_meta->get( $post_id );
			$extension           = pathinfo( $filepath, PATHINFO_EXTENSION );
			$something_to_encode = false;
			$encode_checked      = array();

			if ( substr( basename( $filepath, '.' . $extension ), -10 ) == '-noreplace'
				|| ( array_key_exists( 'original_replaced', $kgvid_postmeta ) && $kgvid_postmeta['original_replaced'] == $this->options_manager->replace_format )
			) {
				$this->options_manager->encode['fullres'] = false;
			}

			if ( $post->post_mime_type === 'image/gif' ) {
				$fullres_only  = array( 'fullres' );
				$video_formats = array_intersect_key( $video_formats, array_flip( $fullres_only ) );
			}

			foreach ( $video_formats as $format => $format_stats ) {

				if ( is_array( $this->options_manager->encode )
					&& array_key_exists( $format, $this->options_manager->encode )
					&& $this->options_manager->encode[ $format ] == true
				) {
					$encode_checked[ $format ] = 'true';
					$something_to_encode       = true;
				} else {
					$encode_checked[ $format ] = 'notchecked';
				}
			}

			if ( $something_to_encode ) {

				kgvid_enqueue_videos( $post_id, $movieurl, $encode_checked, $post->post_parent );
				kgvid_encode_videos();

			}
		}//end if auto_encode

		do_action( 'videopack_cron_new_attachment', $post_id );
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

			if ( $this->options_manager->thumb_parent === 'post' ) {
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
		if ( strlen( $search_url ) > 166 ) {
			$search_url = substr( $search_url, -162 );
		} //transients can't be more than 172 characters long. Including 'kgvid_' the URL has to be 162 characters or fewer

		return $search_url;
	}

	public function add_mime_types( $existing_mimes ) {

		$existing_mimes['mpd']  = 'application/dash+xml';
		$existing_mimes['m3u8'] = 'application/vnd.apple.mpegurl';

		return $existing_mimes;
	}
}
