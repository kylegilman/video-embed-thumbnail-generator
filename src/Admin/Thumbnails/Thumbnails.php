<?php

namespace Videopack\Admin\Thumbnails;

class Thumbnails {

	protected $options;

	public function __construct() {
		$this->options = \Videopack\Admin\Options::get_instance()->get_options();
	}

	public function decode_base64_png( $raw_png, $tmp_posterpath ) {

		$raw_png     = str_replace( 'data:image/png;base64,', '', $raw_png );
		$raw_png     = str_replace( 'data:image/jpeg;base64,', '', $raw_png );
		$raw_png     = str_replace( ' ', '+', $raw_png );
		$decoded_png = base64_decode( $raw_png );

		if ( \Videopack\Admin\Filesystem::can_write_direct( dirname( $tmp_posterpath ) ) ) {
			global $wp_filesystem;
			$success = $wp_filesystem->put_contents( $tmp_posterpath, $decoded_png );

			$editor = wp_get_image_editor( $tmp_posterpath );
			if ( is_wp_error( $editor ) ) {
				$wp_filesystem->delete( $tmp_posterpath );
			}

			return $editor;
		}

		return false;
	}

	public function save_canvas_thumb( $raw_png, $post_id, $video_url, $total, $index ) {

		$uploads       = wp_upload_dir();
		$sanitized_url = kgvid_sanitize_url( $video_url );
		$posterfile    = $sanitized_url['basename'] . '_thumb' . $index;
		wp_mkdir_p( $uploads['path'] . '/thumb_tmp' );
		$tmp_posterpath = $uploads['path'] . '/thumb_tmp/' . $posterfile . '.png';
		$thumb_url      = $uploads['url'] . '/' . $posterfile . '.jpg';
		$thumb_info = array(
			'thumb_id'  => false,
			'thumb_url' => $thumb_url,
		);

		$editor = $this->decode_base64_png( $raw_png, $tmp_posterpath );

		if ( is_wp_error( $editor ) ) { // couldn't open the image. Try the alternate php://input

			$raw_post = file_get_contents( 'php://input' );
			parse_str( $raw_post, $alt_post );
			$editor = $this->decode_base64_png( $alt_post['raw_png'], $tmp_posterpath );

		}

		if ( is_wp_error( $editor ) ) {
			$thumb_url = false;
		} else {
			$thumb_dimensions = $editor->get_size();
			if ( $thumb_dimensions ) {
				$kgvid_postmeta                 = kgvid_get_attachment_meta( $post_id );
				$kgvid_postmeta['actualwidth']  = $thumb_dimensions['width'];
				$kgvid_postmeta['actualheight'] = $thumb_dimensions['height'];
				kgvid_save_attachment_meta( $post_id, $kgvid_postmeta );
			}
			$editor->set_quality( 90 );
			$new_image_info = $editor->save( $uploads['path'] . '/thumb_tmp/' . $posterfile . '.jpg', 'image/jpeg' );
			wp_delete_file( $tmp_posterpath ); // delete png
			if ( $total > 1 ) {
				$post_name  = get_the_title( $post_id );
				$thumb_info = kgvid_save_thumb( $post_id, $post_name, $thumb_url, $index );
			}
		}

		kgvid_schedule_cleanup_generated_files( 'thumbs' );

		return $thumb_info;
	}

	public function save( $post_id, $post_name, $thumb_url, $index = false ) {

		$user_ID = get_current_user_id();
		$uploads = wp_upload_dir();

		$existing_thumb_id = attachment_url_to_postid( $thumb_url );
		$posterfile        = pathinfo( $thumb_url, PATHINFO_BASENAME );
		$tmp_posterpath    = $uploads['path'] . '/thumb_tmp/' . $posterfile;
		$final_posterpath  = $uploads['path'] . '/' . $posterfile;

		if ( ! is_file( $final_posterpath ) && $existing_thumb_id !== 0 ) {
			return array(
				'thumb_id'  => $existing_thumb_id,
				'thumb_url' => $thumb_url,
			);
		} elseif ( is_file( $final_posterpath ) ) {

			$existing_thumb_id = attachment_url_to_postid( $thumb_url );

			if ( ! $existing_thumb_id ) { // should be there but check if it was so big it was scaled down
				$existing_thumb_id = attachment_url_to_postid( str_replace( '.jpg', '-scaled.jpg', $thumb_url ) );
			}

			if ( $existing_thumb_id ) {

				$existing_posterpath = wp_get_original_image_path( $existing_thumb_id );

				if ( is_file( $tmp_posterpath )
					&& abs( filemtime( $tmp_posterpath ) - filemtime( $existing_posterpath ) ) > 10 // file modified time more than 10 seconds different
					&& abs( filesize( $tmp_posterpath ) - filesize( $existing_posterpath ) ) > 100 // filesize is more than 100 bytes different means it's probably a different image
				) {

					$posterfile_noextension = pathinfo( $thumb_url, PATHINFO_FILENAME );

					$thumb_index = $index;
					if ( $thumb_index === false ) {
						$thumb_index = substr( $posterfile_noextension, strpos( $posterfile_noextension, '_thumb' ) + 6 );
					}

					if ( $thumb_index === false ) { // nothing after "_thumb"
						$thumb_index        = 1;
						$posterfile_noindex = $posterfile_noextension;
					} else {
						$posterfile_noindex = str_replace( '_thumb' . $thumb_index, '_thumb', $posterfile_noextension );
						$thumb_index        = intval( $thumb_index );
						++$thumb_index;
					}

					while ( is_file( $uploads['path'] . '/' . $posterfile_noindex . $thumb_index . '.jpg' ) ) {
						++$thumb_index; // increment the filename until we get one that doesn't exist
					}

					$final_posterpath = $uploads['path'] . '/' . $posterfile_noindex . $thumb_index . '.jpg';
					$thumb_url        = $uploads['url'] . '/' . $posterfile_noindex . $thumb_index . '.jpg';

				} elseif ( is_file( $tmp_posterpath ) ) { // if a new thumbnail was just entered that's exactly the same as the old one, use the old one

					$arr = array(
						'thumb_id'  => false,
						'thumb_url' => $thumb_url,
					);
					return $arr;

				} else {
					$arr = array(
						'thumb_id'  => $existing_thumb_id,
						'thumb_url' => $thumb_url,
					);
					return $arr;
				}
			}
		}

		$success = false;
		if ( ! is_file( $final_posterpath ) && is_file( $tmp_posterpath ) ) { // if the file doesn't already exist and the tmp one does
			$success = copy( $tmp_posterpath, $final_posterpath );
		}

		// insert the $thumb_url into the media library if it does not already exist

		if ( $success ) { // new file was copied into uploads directory

			wp_delete_file( $tmp_posterpath );

			$desc = $post_name . ' ' . esc_html_x( 'thumbnail', 'text appended to newly created thumbnail titles', 'video-embed-thumbnail-generator' );
			if ( $index ) {
				$desc .= ' ' . $index;
			}

			// is image in uploads directory?
			$upload_dir = wp_upload_dir();

			$video = get_post( $post_id );
			if ( $options['thumb_parent'] === 'post' ) {
				if ( ! empty( $video->post_parent ) ) {
					$post_id = $video->post_parent;
				}
			}

			if ( false !== strpos( $thumb_url, $upload_dir['baseurl'] ) ) {
				$wp_filetype = wp_check_filetype( basename( $thumb_url ), null );
				if ( $user_ID == 0 ) {
					$user_ID = $video->post_author;
				}

				$attachment = array(
					'guid'           => $thumb_url,
					'post_mime_type' => $wp_filetype['type'],
					'post_title'     => $desc,
					'post_content'   => '',
					'post_status'    => 'inherit',
					'post_author'    => $user_ID,
				);

				$thumb_id = wp_insert_attachment( $attachment, $final_posterpath, $post_id );
				// you must first include the image.php file
				// for the function wp_generate_attachment_metadata() to work
				require_once ABSPATH . 'wp-admin/includes/image.php';
				$attach_data = wp_generate_attachment_metadata( $thumb_id, $final_posterpath );
				wp_update_attachment_metadata( $thumb_id, $attach_data );
			} else { // not in uploads so we'll have to sideload it
				$tmp = download_url( $thumb_url );

				// Set variables for storage
				// fix file filename for query strings
				preg_match( '/[^\?]+\.(jpg|JPG|jpe|JPE|jpeg|JPEG|gif|GIF|png|PNG)/', $thumb_url, $matches );
				$file_array['name']     = basename( $matches[0] );
				$file_array['tmp_name'] = $tmp;

				// If error storing temporarily, delete
				if ( is_wp_error( $tmp ) ) {
					wp_delete_file( $file_array['tmp_name'] );
					$file_array['tmp_name'] = '';
				}

				// do the validation and storage stuff
				$thumb_id = media_handle_sideload( $file_array, $post_id, $desc );

				// If error storing permanently, delete
				if ( is_wp_error( $thumb_id ) ) {
					wp_delete_file( $file_array['tmp_name'] );
					$arr = array(
						'thumb_id'  => $thumb_id,
						'thumb_url' => $thumb_url,
					);
					return $arr;
				}

				if ( $local_src === wp_get_attachment_url( $thumb_id ) ) {
					update_post_meta( $post_id, '_kgflashmediaplayer-poster', $local_src );
				}
			} //end sideload

			$thumb_id = intval( $thumb_id );
			update_post_meta( $post_id, '_kgflashmediaplayer-poster-id', $thumb_id );
			update_post_meta( $thumb_id, '_kgflashmediaplayer-video-id', $video->ID );
			//end copied new file into uploads directory
		} else {
			$thumb_id = false;
		}

		$arr = array(
			'thumb_id'  => $thumb_id,
			'thumb_url' => $thumb_url,
		);
		return $arr;
	}

	public function kgivd_save_singleurl_poster( $parent_id, $poster, $movieurl, $set_featured ) {
		// called by the "Embed Video from URL" tab when submitting

			$sanitized_url = kgvid_sanitize_url( $movieurl );
		if ( ! empty( $poster ) ) {
			$thumb_info = kgvid_save_thumb( $parent_id, $sanitized_url['basename'], $poster );
		}
		if ( ! empty( $thumb_info['thumb_id'] )
			&& $set_featured === true
		) {
			set_post_thumbnail( $parent_id, $thumb_info['thumb_id'] );
		}
	}
}
