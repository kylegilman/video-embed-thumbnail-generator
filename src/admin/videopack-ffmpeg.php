<?php
/**
 * The FFmpeg specific functionality of the Videopack plugin.
 *
 * @link       https://www.videopack.video
 *
 * @package    Videopack
 * @subpackage Videopack/admin
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */

use Videopack\admin\encode\FFmpeg_Process;

function kgvid_get_encode_queue() {

	if ( is_videopack_active_for_network() ) {
		$video_encode_queue = get_site_option( 'kgvid_video_embed_queue', array() );
	} else {
		$video_encode_queue = get_option( 'kgvid_video_embed_queue', array() );
	}

	if ( ! is_array( $video_encode_queue ) ) {
		$video_encode_queue = array();
	}

	return $video_encode_queue;
}

function kgvid_save_encode_queue( $video_encode_queue ) {

	if ( empty( $video_encode_queue )
		|| ! is_array( $video_encode_queue )
	) {
		$video_encode_queue = array();
	}

	if ( is_videopack_active_for_network() ) {
		update_site_option( 'kgvid_video_embed_queue', $video_encode_queue );
	} else {
		update_option( 'kgvid_video_embed_queue', $video_encode_queue );
	}
}

function kgvid_process_thumb( $input, $output, $ffmpeg_path = false, $seek = '0', $rotate_array = array(), $watermark_strings = array() ) {

	$options = kgvid_get_options();
	if ( empty( $options ) ) {
		$options = kgvid_default_options_fn();
	}

	if ( $ffmpeg_path === false ) {
		$ffmpeg_path = $options['app_path'] . '/' . $options['video_app'];
	} else {
		$ffmpeg_path = $ffmpeg_path . '/' . $options['video_app'];
	}

	$before_thumb_options = array(
		$ffmpeg_path,
		'-y',
		'-ss',
		$seek,
		'-i',
		$input,
	);

	if ( ! empty( $watermark_strings['input'] ) ) {
		$before_thumb_options[] = '-i';
		$before_thumb_options[] = $watermark_strings['input'];
	}

	$thumb_options = array(
		'-vf',
		'scale=iw*sar:ih',
		'-qscale',
		'1',
		'-vframes',
		'1',
		'-f',
		'mjpeg',
	);

	if ( ! empty( $rotate_array ) ) {
		$thumb_options = array_merge( $thumb_options, $rotate_array );
	}

	if ( ! empty( $watermark_strings['input'] ) ) {
		$thumb_options[] = '-filter_complex';
		$thumb_options[] = $watermark_strings['filter'];
	}

	$thumb_options[] = $output;

	$commandline = array_merge( $before_thumb_options, $thumb_options );
error_log(implode(' ', $commandline));
	$process = new FFmpeg_process( $commandline );

	try {
		$process->run();
		return $process->getErrorOutput();
	} catch ( \Exception $e ) {
		return $e->getMessage();
	}
}

function kgvid_aac_encoders() {

	$aac_array = array(
		'libfdk_aac',
		'aac',
		'libvo_aacenc',
		'libfaac',
	);

	return apply_filters( 'kgvid_aac_encoders', $aac_array );
}

function kgvid_check_ffmpeg_exists( $options, $save ) {

	$proc_open_enabled = false;
	$ffmpeg_exists     = false;
	$output            = array();
	$function          = '';
	$uploads           = wp_upload_dir();
	$test_path         = rtrim( $options['app_path'], '/' );

	if ( function_exists( 'proc_open' ) ) {

		$proc_open_enabled = true;

		$ffmpeg_test = kgvid_process_thumb(
			plugin_dir_path( __DIR__ ) . 'images/sample-video-h264.mp4',
			$uploads['path'] . '/ffmpeg_exists_test.jpg',
			$test_path
		);

		if ( ! file_exists( $uploads['path'] . '/ffmpeg_exists_test.jpg' )
			&& substr( $test_path, -strlen( $options['video_app'] ) ) == $options['video_app']
		) { // if FFmpeg has not executed successfully

			$test_path = substr( $test_path, 0, -strlen( $options['video_app'] ) - 1 );

			$ffmpeg_test = kgvid_process_thumb(
				plugin_dir_path( __DIR__ ) . 'images/sample-video-h264.mp4',
				$uploads['path'] . '/ffmpeg_exists_test.jpg',
				$test_path
			);

		}

		if ( file_exists( $uploads['path'] . '/ffmpeg_exists_test.jpg' ) ) { // FFMEG has executed successfully
			$ffmpeg_exists = true;
			wp_delete_file( $uploads['path'] . '/ffmpeg_exists_test.jpg' );
			$options['app_path'] = $test_path;
		}

		$output = explode( "\n", $ffmpeg_test );

	}

	if ( $save ) {

		if ( $ffmpeg_exists === true ) {
			$options['ffmpeg_exists'] = true;
		} else {
			$options['ffmpeg_exists']      = 'notinstalled';
			$options['browser_thumbnails'] = true; // if FFmpeg isn't around, this should be enabled
		}

		update_option( 'kgvid_video_embed_options', $options );

	}

	$arr = array(
		'proc_open_enabled' => $proc_open_enabled,
		'ffmpeg_exists'     => $ffmpeg_exists,
		'output'            => $output,
		'function'          => $function,
		'app_path'          => $options['app_path'],
	);

	return $arr;
}

function kgvid_set_video_dimensions( $id, $gallery = false ) {

	$options        = kgvid_get_options();
	$video_meta     = wp_get_attachment_metadata( $id );
	$kgvid_postmeta = kgvid_get_attachment_meta( $id );

	if ( is_array( $video_meta ) && array_key_exists( 'width', $video_meta ) ) {
		$kgvid_postmeta['actualwidth'] = $video_meta['width'];
	}
	if ( empty( $kgvid_postmeta['width'] ) ) {
		$kgvid_postmeta['width'] = $kgvid_postmeta['actualwidth'];
	}

	if ( is_array( $video_meta ) && array_key_exists( 'height', $video_meta ) ) {
		$kgvid_postmeta['actualheight'] = $video_meta['height'];
	}
	if ( empty( $kgvid_postmeta['height'] ) ) {
		$kgvid_postmeta['height'] = $kgvid_postmeta['actualheight'];
	}

	if ( ! empty( $kgvid_postmeta['width'] ) && ! empty( intval( $kgvid_postmeta['height'] ) ) ) {
		$aspect_ratio = intval( $kgvid_postmeta['height'] ) / intval( $kgvid_postmeta['width'] );
	} else {
		$aspect_ratio = intval( $options['height'] ) / intval( $options['width'] );
	}

	if ( $gallery ) {
		if ( ! empty( $kgvid_postmeta['actualwidth'] ) ) {
			$kgvid_postmeta['width'] = $kgvid_postmeta['actualwidth'];
		}
		if ( intval( $kgvid_postmeta['width'] ) > intval( $options['gallery_width'] ) ) {
			$kgvid_postmeta['width'] = $options['gallery_width'];
		}
	} elseif ( intval( $kgvid_postmeta['width'] ) > intval( $options['width'] )
		|| $options['minimum_width'] === true
	) {
			$kgvid_postmeta['width'] = $options['width'];
	}

	$kgvid_postmeta['height'] = round( intval( $kgvid_postmeta['width'] ) * $aspect_ratio );

	$dimensions = array(
		'width'        => strval( $kgvid_postmeta['width'] ),
		'height'       => strval( $kgvid_postmeta['height'] ),
		'actualwidth'  => strval( $kgvid_postmeta['actualwidth'] ),
		'actualheight' => strval( $kgvid_postmeta['actualheight'] ),
	);

	return $dimensions;
}

function kgvid_set_encode_dimensions( $movie_info, $format_stats ) {

	if ( $movie_info['worked'] ) {

		if ( empty( $format_stats['width'] )
			|| is_infinite( $format_stats['width'] )
		) {
			$format_stats['width'] = $movie_info['width'];
		}
		if ( empty( $format_stats['height'] )
			|| is_infinite( $format_stats['height'] )
		) {
			$format_stats['height'] = $movie_info['height'];
		}

		if ( intval( $movie_info['width'] ) > $format_stats['width'] ) {
			$encode_movie_width = intval( $format_stats['width'] );
		} else {
			$encode_movie_width = intval( $movie_info['width'] );
		}

		$encode_movie_height = round( intval( $movie_info['height'] ) / intval( $movie_info['width'] ) * $encode_movie_width );

		if ( $encode_movie_height % 2 !== 0 ) {
			--$encode_movie_height;
		} //if it's odd, decrease by 1 to make sure it's an even number

		if ( intval( $encode_movie_height ) > intval( $format_stats['height'] ) ) {

			$encode_movie_height = intval( $format_stats['height'] );
			$encode_movie_width  = strval( round( intval( $movie_info['width'] ) / intval( $movie_info['height'] ) * $encode_movie_height ) );

		}
		if ( $encode_movie_width % 2 !== 0 ) {
			--$encode_movie_width;
		} //if it's odd, decrease by 1 to make sure it's an even number

	} else { // set generic dimensions as a fallback
		$encode_movie_width  = 640;
		$encode_movie_height = 480;
	}

	$arr = array(
		'width'  => $encode_movie_width,
		'height' => $encode_movie_height,
	);

	return $arr;
}

function kgvid_encodevideo_info( $movieurl, $post_id ) {

	$uploads       = wp_upload_dir();
	$video_formats = kgvid_video_formats();
	$sanitized_url = kgvid_sanitize_url( $movieurl );
	$movieurl      = $sanitized_url['movieurl'];
	$moviefile     = '';

	$encodevideo_info['moviefilebasename'] = $sanitized_url['basename'];
	$encodevideo_info['encodepath']        = $uploads['path'] . '/';

	if ( get_post_type( $post_id ) == 'attachment' ) { // if it's an attachment, not from URL
		$moviefile = get_attached_file( $post_id );
		if ( $moviefile ) {
			$path_parts                     = pathinfo( $moviefile );
			$encodevideo_info['encodepath'] = $path_parts['dirname'] . '/';
			$encodevideo_info['sameserver'] = true;
			$args                           = array(
				'numberposts' => '-1',
				'post_parent' => $post_id,
				'post_type'   => 'attachment',
			);
		}
	} elseif ( $moviefile == ''
		|| ! is_file( $moviefile )
	) {

		$url_parts = wp_parse_url( $uploads['url'] );

		if ( is_array( $url_parts )
			&& array_key_exists( 'host', $url_parts )
			&& strpos( $movieurl, $url_parts['host'] ) !== false
			&& isset( $_SERVER['DOCUMENT_ROOT'] )
		) { // if we're on the same server
			$document_root                  = sanitize_text_field( wp_unslash( $_SERVER['DOCUMENT_ROOT'] ) );
			$encodevideo_info['sameserver'] = true;
			$decodedurl                     = urldecode( $movieurl );
			$parsed_url                     = wp_parse_url( $decodedurl );
			$fileinfo                       = pathinfo( $decodedurl );
			if ( array_key_exists( 'extension', $fileinfo ) ) {
				$parsed_url['extension'] = $fileinfo['extension'];
			}
			$parsed_url['filename']  = $fileinfo['basename'];
			$parsed_url['localpath'] = $document_root . $parsed_url['path'];
			// just in case there is a double slash created when joining document_root and path
			$parsed_url['localpath']        = preg_replace( '/\/\//', '/', $parsed_url['localpath'] );
			$encodevideo_info['encodepath'] = rtrim( $parsed_url['localpath'], $parsed_url['filename'] );
		} else {
			$encodevideo_info['sameserver'] = false;
		}

		$args = array(
			'numberposts' => '-1',
			'post_type'   => 'attachment',
			'meta_key'    => '_kgflashmediaplayer-externalurl',
			'meta_value'  => $sanitized_url['movieurl'],
		);

	}
	$children = get_posts( $args );

	foreach ( $video_formats as $format => $format_stats ) { // loop through each format

		$encodevideo_info[ $format ]['exists']   = false;
		$encodevideo_info[ $format ]['writable'] = false;
		$encodevideo_info[ $format ]['encoding'] = false;

		// start with the new database info before checking other locations

		if ( $children ) {
			foreach ( $children as $child ) {
				$mime_type        = get_post_mime_type( $child->ID );
				$wp_attached_file = get_attached_file( $child->ID );
				$video_meta       = wp_get_attachment_metadata( $child->ID );
				$meta_format      = get_post_meta( $child->ID, '_kgflashmediaplayer-format', true );

				if ( $meta_format == $format
					|| ( substr( $wp_attached_file, -strlen( $format_stats['suffix'] ) ) === $format_stats['suffix']
						&& $meta_format == false
					)
				) {

					$encodevideo_info[ $format ]['url']      = wp_get_attachment_url( $child->ID );
					$encodevideo_info[ $format ]['filepath'] = $wp_attached_file;
					$encodevideo_info[ $format ]['id']       = $child->ID;
					$encodevideo_info[ $format ]['exists']   = true;
					$encodevideo_info[ $format ]['writable'] = true;

					if ( is_array( $video_meta ) && array_key_exists( 'width', $video_meta ) ) {
						$encodevideo_info[ $format ]['width'] = $video_meta['width'];
					}
					if ( is_array( $video_meta ) && array_key_exists( 'height', $video_meta ) ) {
						$encodevideo_info[ $format ]['height'] = $video_meta['height'];
					}
					continue 2; // skip rest of children loop and format loop
				}
			}
		}

		// if the format's not in the database, check these places

		if ( array_key_exists( 'old_suffix', $format_stats ) ) {
			$old_suffix = $format_stats['old_suffix'];
		} else {
			$old_suffix = $format_stats['suffix'];
		}
		$potential_locations = array(
			'same_directory'            => array(
				'url'      => $sanitized_url['noextension'] . $format_stats['suffix'],
				'filepath' => $encodevideo_info['encodepath'] . $encodevideo_info['moviefilebasename'] . $format_stats['suffix'],
			),
			'same_directory_old_suffix' => array(
				'url'      => $sanitized_url['noextension'] . $old_suffix,
				'filepath' => $encodevideo_info['encodepath'] . $encodevideo_info['moviefilebasename'] . $old_suffix,
			),
			'html5encodes'              => array(
				'url'      => $uploads['baseurl'] . '/html5encodes/' . $encodevideo_info['moviefilebasename'] . $old_suffix,
				'filepath' => $uploads['basedir'] . '/html5encodes/' . $encodevideo_info['moviefilebasename'] . $old_suffix,
			),
		);
		if ( ! array_key_exists( 'old_suffix', $format_stats ) ) {
			unset( $potential_locations['same_directory_old_suffix'] );
		}

		foreach ( $potential_locations as $name => $location ) {

			if ( file_exists( $location['filepath'] ) ) {
				$encodevideo_info[ $format ]['exists']   = true;
				$encodevideo_info[ $format ]['url']      = $location['url'];
				$encodevideo_info[ $format ]['filepath'] = $location['filepath'];
				require_once ABSPATH . 'wp-admin/includes/file.php';
				if ( get_filesystem_method( array(), $location['filepath'], true ) === 'direct' ) {
					$encodevideo_info[ $format ]['writable'] = true;
				}
				break;
			} elseif ( ! empty( $post_id )
				&& ! $encodevideo_info['sameserver'] && $name !== 'html5encodes'
			) { // last resort if it's not on the same server, check url_exists

				$already_checked_url = get_post_meta( $post_id, '_kgflashmediaplayer-' . $sanitized_url['singleurl_id'] . '-' . $format, true );
				if ( empty( $already_checked_url ) ) {
					if ( kgvid_url_exists( esc_url_raw( str_replace( ' ', '%20', $location['url'] ) ) ) ) {
						$encodevideo_info[ $format ]['exists'] = true;
						$encodevideo_info[ $format ]['url']    = $location['url'];
						update_post_meta( $post_id, '_kgflashmediaplayer-' . $sanitized_url['singleurl_id'] . '-' . $format, $encodevideo_info[ $format ]['url'] );
					} else {
						update_post_meta( $post_id, '_kgflashmediaplayer-' . $sanitized_url['singleurl_id'] . '-' . $format, 'not found' );
					}
				} elseif ( substr( $already_checked_url, 0, 4 ) == 'http' ) { // url already checked
					// if it smells like a URL...
						$encodevideo_info[ $format ]['exists'] = true;
						$encodevideo_info[ $format ]['url']    = $already_checked_url;
				}
			}//end if not on same server
		}//end potential locations loop

		if ( $encodevideo_info[ $format ]['exists'] == false ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
			if ( get_post_type( $post_id ) == 'attachment'
				&& get_filesystem_method( array(), $encodevideo_info['encodepath'], true ) === 'direct'
			) {
				$encodevideo_info[ $format ]['url']      = $sanitized_url['noextension'] . $format_stats['suffix'];
				$encodevideo_info[ $format ]['filepath'] = $encodevideo_info['encodepath'] . $encodevideo_info['moviefilebasename'] . $format_stats['suffix'];
			} else {
				$encodevideo_info[ $format ]['url']      = $uploads['url'] . '/' . $encodevideo_info['moviefilebasename'] . $format_stats['suffix'];
				$encodevideo_info[ $format ]['filepath'] = $uploads['path'] . '/' . $encodevideo_info['moviefilebasename'] . $format_stats['suffix'];
			}
		} else { // if file exists, check if it's currently encoding

					$video_encode_queue = kgvid_get_encode_queue();

			if ( $video_encode_queue ) {

				foreach ( $video_encode_queue as $video_key => $video_entry ) {

					if ( array_key_exists( 'encode_formats', $video_entry )
					&& array_key_exists( $format, $video_entry['encode_formats'] )
					&& array_key_exists( 'filepath', $video_entry['encode_formats'][ $format ] )
					&& $video_entry['encode_formats'][ $format ]['filepath'] == $encodevideo_info[ $format ]['filepath']
					&& array_key_exists( 'status', $video_entry['encode_formats'][ $format ] )
					&& $video_entry['encode_formats'][ $format ]['status'] == 'encoding'
					) {
						$encodevideo_info[ $format ]['encoding'] = true; // this format is currently encoding
					}
				}
			}
		}
	}//end format loop

	return apply_filters( 'kgvid_encodevideo_info', $encodevideo_info, $movieurl, $post_id );
}

/**
 * Get the dimensions of a video file
 *
 * @param string $video
 * @return array(width,height)
 * @author Jamie Scott
 */
function kgvid_get_video_dimensions( $video = false ) {

	$options      = kgvid_get_options();
	$ffmpeg_path  = $options['app_path'] . '/' . $options['video_app'];
	$movie_info   = array();
	$codec_output = array();

	if ( strpos( $video, 'http' ) === 0 ) { // if it's a URL

		$video_id = kgvid_url_to_id( $video );

		if ( $video_id ) {

			$video_path = get_attached_file( $video_id );
			if ( file_exists( $video_path ) ) {
				$video = $video_path;
			}
		} elseif ( ! empty( $options['htaccess_login'] )
			&& strpos( $video, 'http' ) === 0
		) { // not in the database
				$video = substr_replace( $video, $options['htaccess_login'] . ':' . $options['htaccess_password'] . '@', 7, 0 );
		}
	}

	$get_info = new FFmpeg_process(
		array(
			$ffmpeg_path,
			'-i',
			$video,
		)
	);

	try {
		$get_info->run();
		$output = $get_info->getErrorOutput();
	} catch ( \Exception $e ) {
		$output = $e->getMessage();
	}

	$regex = '/([0-9]{2,4})x([0-9]{2,4})/';

	if ( ! empty( $output ) && preg_match( $regex, $output, $regs ) ) {
		$result = $regs[0];
	} else {
		$result = '';
	}

	if ( ! empty( $result ) ) {

		$movie_info['worked'] = true;
		$movie_info['width']  = $regs [1] ? $regs [1] : null;
		$movie_info['height'] = $regs [2] ? $regs [2] : null;

		preg_match( '/Duration: (.*?),/', $output, $matches );
		$duration               = $matches[1];
		$movie_duration_hours   = intval( substr( $duration, -11, 2 ) );
		$movie_duration_minutes = intval( substr( $duration, -8, 2 ) );
		$movie_duration_seconds = floatval( substr( $duration, -5 ) );
		$movie_info['duration'] = ( $movie_duration_hours * 60 * 60 ) + ( $movie_duration_minutes * 60 ) + $movie_duration_seconds;

		preg_match( '/rotate          : (.*?)\n/', $output, $matches );
		if ( $options['ffmpeg_vpre'] === false
			&& is_array( $matches )
			&& array_key_exists( 1, $matches ) === true
		) {
			$rotate = $matches[1];
		} else {
			$rotate = '0';
		}

		switch ( $rotate ) {
			case '90':
				$movie_info['rotate'] = 90;
				break;
			case '180':
				$movie_info['rotate'] = 180;
				break;
			case '270':
				$movie_info['rotate'] = 270;
				break;
			case '-90':
				$movie_info['rotate'] = 270;
				break;
			default:
				$movie_info['rotate'] = '';
				break;
		}

		$get_codecs = new FFmpeg_Process(
			array(
				$ffmpeg_path,
				'-i',
				$video,
				'-codecs',
			)
		);

		try {
			$get_codecs->run();
			$codec_output = $get_codecs->getOutput();
		} catch ( \Exception $e ) {
			$codec_output = $e->getMessage();
		}

		$video_lib_array = array( 'libvorbis' );
		$video_formats   = kgvid_video_formats();

		foreach ( $video_formats as $format => $format_stats ) {

			if ( isset( $format_stats['vcodec'] ) ) {

				$video_lib_array[] = $format_stats['vcodec'];

			}
		}

		$aac_array = kgvid_aac_encoders();
		$lib_list  = array_merge( $video_lib_array, $aac_array );

		foreach ( $lib_list as $lib ) {

			if ( strpos( $codec_output, $lib ) !== false ) {

				$movie_info['configuration'][ $lib ] = 'true';

			} else {

				$movie_info['configuration'][ $lib ] = 'false';

			}
		}
	} else {

		$movie_info['worked'] = false;
		$movie_info['output'] = $output;

	}

	return apply_filters( 'kgvid_get_video_dimensions', $movie_info, $video, $output, $codec_output );
}

function kgvid_ffmpeg_rotate_array( $rotate, $width, $height ) {

	$options = kgvid_get_options();

	if ( $rotate === false
	|| $options['ffmpeg_vpre'] === true ) {
		$rotate = '';
	}

	switch ( $rotate ) { // if it's a sideways mobile video

		case 90:
			if ( empty( $options['ffmpeg_watermark']['url'] ) ) {
				$rotate_array = array(
					'-vf',
					'transpose=1',
				);
			} else {
				$rotate_array   = array();
				$rotate_complex = 'transpose=1[rotate];[rotate]';
			}

			if ( $options['video_bitrate_flag'] == true || $options['ffmpeg_old_rotation'] == true ) {
				$rotate_array[] = '-metadata';
				$rotate_array[] = 'rotate=0';
			} else {
				$rotate_array[] = '-metadata:s:v:0';
				$rotate_array[] = 'rotate=0';

				// swap height & width
				$tmp    = $width;
				$width  = $height;
				$height = $tmp;

			}

			break;

		case 270:
			if ( empty( $options['ffmpeg_watermark']['url'] ) ) {
				$rotate_array = array(
					'-vf',
					'transpose=2',
				);
			} else {
				$rotate_array   = array();
				$rotate_complex = 'transpose=2[rotate];[rotate]';
			}

			if ( $options['video_bitrate_flag'] == true || $options['ffmpeg_old_rotation'] == true ) {
				$rotate_array[] = '-metadata';
				$rotate_array[] = 'rotate=0';
			} else {
				$rotate_array[] = '-metadata:s:v:0';
				$rotate_array[] = 'rotate=0';

				// swap height & width
				$tmp    = $width;
				$width  = $height;
				$height = $tmp;
			}

			break;

		case 180:
			if ( empty( $options['ffmpeg_watermark']['url'] ) ) {
				$rotate_array = array(
					'-vf',
					'hflip,vflip',
				);
			} else {
				$rotate_array   = array();
				$rotate_complex = 'hflip,vflip[rotate];[rotate]';
			}

			if ( $options['video_bitrate_flag'] == true || $options['ffmpeg_old_rotation'] == true ) {
				$rotate_array[] = '-metadata';
				$rotate_array[] = 'rotate=0';
			} else {
				$rotate_array[] = '-metadata:s:v:0';
				$rotate_array[] = 'rotate=0';
			}

			break;

		default:
			$rotate_array   = array();
			$rotate_complex = '';
			break;
	}

	if ( $options['ffmpeg_auto_rotate'] === true ) {
		$rotate         = '';
		$rotate_complex = '';
	}

	$rotate_strings = array(
		'rotate'  => $rotate_array,
		'complex' => $rotate_complex,
		'width'   => $width,
		'height'  => $height,
	);

	return $rotate_strings;
}

function kgvid_ffmpeg_watermark_strings( $ffmpeg_watermark, $movie_width, $rotate_complex = '' ) {

	if ( is_array( $ffmpeg_watermark ) && array_key_exists( 'url', $ffmpeg_watermark ) && ! empty( $ffmpeg_watermark['url'] ) ) {

		$watermark_width = strval( round( intval( $movie_width ) * ( intval( $ffmpeg_watermark['scale'] ) / 100 ) ) );

		if ( $ffmpeg_watermark['align'] == 'right' ) {
			$watermark_align = 'main_w-overlay_w-';
		} elseif ( $ffmpeg_watermark['align'] == 'center' ) {
			$watermark_align = 'main_w/2-overlay_w/2-';
		} else {
			$watermark_align = '';
		} //left justified

		if ( $ffmpeg_watermark['valign'] == 'bottom' ) {
			$watermark_valign = 'main_h-overlay_h-';
		} elseif ( $ffmpeg_watermark['valign'] == 'center' ) {
			$watermark_valign = 'main_h/2-overlay_h/2-';
		} else {
			$watermark_valign = '';
		} //top justified

		if ( strpos( $ffmpeg_watermark['url'], 'http://' ) === 0 ) {
			$watermark_id = false;
			$watermark_id = kgvid_url_to_id( $ffmpeg_watermark['url'] );
			if ( $watermark_id ) {
				$watermark_file = get_attached_file( $watermark_id );
				if ( file_exists( $watermark_file ) ) {
					$ffmpeg_watermark['url'] = $watermark_file;
				}
			}
		}

		$watermark_strings['input']  = '-i "' . $ffmpeg_watermark['url'] . '" ';
		$watermark_strings['filter'] = ' -filter_complex "[1:v]scale=' . $watermark_width . ':-1[watermark];[0:v]' . $rotate_complex . '[watermark]overlay=' . $watermark_align . 'main_w*' . round( intval( $ffmpeg_watermark['x'] ) / 100, 3 ) . ':' . $watermark_valign . 'main_w*' . round( intval( $ffmpeg_watermark['y'] ) / 100, 3 ) . '"';

	} else {

		$watermark_strings['input']  = '';
		$watermark_strings['filter'] = '';

	}

	return $watermark_strings;
}

function kgvid_ffmpeg_watermark_array( $ffmpeg_watermark, $movie_width, $rotate_complex = '' ) {

	if ( is_array( $ffmpeg_watermark ) && array_key_exists( 'url', $ffmpeg_watermark ) && ! empty( $ffmpeg_watermark['url'] ) ) {

		$watermark_width = strval( round( intval( $movie_width ) * ( intval( $ffmpeg_watermark['scale'] ) / 100 ) ) );

		if ( $ffmpeg_watermark['align'] == 'right' ) {
			$watermark_align = 'main_w-overlay_w-';
		} elseif ( $ffmpeg_watermark['align'] == 'center' ) {
			$watermark_align = 'main_w/2-overlay_w/2-';
		} else {
			$watermark_align = '';
		} //left justified

		if ( $ffmpeg_watermark['valign'] == 'bottom' ) {
			$watermark_valign = 'main_h-overlay_h-';
		} elseif ( $ffmpeg_watermark['valign'] == 'center' ) {
			$watermark_valign = 'main_h/2-overlay_h/2-';
		} else {
			$watermark_valign = '';
		} //top justified

		if ( strpos( $ffmpeg_watermark['url'], 'http://' ) === 0 ) {
			$watermark_id = false;
			$watermark_id = kgvid_url_to_id( $ffmpeg_watermark['url'] );
			if ( $watermark_id ) {
				$watermark_file = get_attached_file( $watermark_id );
				if ( file_exists( $watermark_file ) ) {
					$ffmpeg_watermark['url'] = $watermark_file;
				}
			}
		}

		$watermark_array['input']  = $ffmpeg_watermark['url'];
		$watermark_array['filter'] = '[1:v]scale=' . $watermark_width . ':-1[watermark];[0:v]' . $rotate_complex . '[watermark]overlay=' . $watermark_align . 'main_w*' . round( intval( $ffmpeg_watermark['x'] ) / 100, 3 ) . ':' . $watermark_valign . 'main_w*' . round( intval( $ffmpeg_watermark['y'] ) / 100, 3 );

	} else {

		$watermark_array['input']  = '';
		$watermark_array['filter'] = '';

	}

	return $watermark_array;
}

function kgvid_generate_encode_array( $input, $output, $movie_info, $format, $width, $height, $rotate ) {

	$options       = kgvid_get_options();
	$libraries     = $movie_info['configuration'];
	$encode_array  = array( strtoupper( $options['video_app'] ) . ' not found' );
	$video_formats = kgvid_video_formats();

	if ( $options['ffmpeg_exists'] === true && isset( $video_formats[ $format ] ) ) {

		if ( $options['video_app'] == 'avconv' || $options['video_bitrate_flag'] != true ) {
			$video_bitrate_flag = 'b:v';
			$audio_bitrate_flag = 'b:a';
			$profile_flag       = 'profile:v';
			$level_flag         = 'level:v';
			$qscale_flag        = 'q:v';
		} else {
			$video_bitrate_flag = 'b';
			$audio_bitrate_flag = 'ab';
			$profile_flag       = 'profile';
			$level_flag         = 'level';
			$qscale_flag        = 'qscale';
		}

		$rotate_strings = kgvid_ffmpeg_rotate_array( $rotate, $width, $height );
		$width          = $rotate_strings['width']; // in case rotation requires swapping height and width
		$height         = $rotate_strings['height'];

		if ( $options['rate_control'] === 'crf' ) {
			$crf_option = $video_formats[ $format ]['type'] . '_CRF';
			if ( $video_formats[ $format ]['type'] == 'vp9' ) {
				$options['vp9_CRF'] = round( ( -0.000002554 * $width * $height ) + 35 ); // formula to generate close to Google-recommended CRFs https://developers.google.com/media/vp9/settings/vod/
			}
			$crf_flag = 'crf';
			if ( $video_formats[ $format ]['type'] == 'ogv' ) { // ogg doesn't do CRF
				$crf_flag = $qscale_flag;
			}
			if ( isset( $options[ $crf_option ] ) ) {
				$rate_control_flag = array(
					'-' . $crf_flag,
					$options[ $crf_option ],
				);
			} else {
				$rate_control_flag = array();
			}
		} elseif ( $video_formats[ $format ]['type'] == 'vp9' ) {
				$average_bitrate   = round( 102 + 0.000876 * $width * $height + 1.554 * pow( 10, -10 ) * pow( $width * $height, 2 ) );
				$maxrate           = round( $average_bitrate * 1.45 );
				$minrate           = round( $average_bitrate * .5 );
				$rate_control_flag = ' -' . $video_bitrate_flag . ' ' . $average_bitrate . 'k -maxrate ' . $maxrate . 'k -minrate ' . $minrate . 'k';
		} else {
			$rate_control_flag = ' -' . $video_bitrate_flag . ' ' . round( floatval( $options['bitrate_multiplier'] ) * $width * $height * 30 / 1024 ) . 'k';
		}

		if ( $options['audio_channels'] === true ) {
			$audio_channels_flag = array(
				'-ac',
				'2',
			);
		} else {
			$audio_channels_flag = array();
		}

		$watermark_strings = kgvid_ffmpeg_watermark_array( $options['ffmpeg_watermark'], $movie_info['width'], $rotate_strings['complex'] );

		if ( $video_formats[ $format ]['type'] === 'h264' ) {

			$aac_array = kgvid_aac_encoders();
			foreach ( $aac_array as $aaclib ) { // cycle through available AAC encoders in order of quality
				if ( $libraries[ $aaclib ] == 'true' ) {
					break;
				}
			}

			$vpre_flags = array();
			if ( $options['ffmpeg_vpre'] == true ) {

				$vpre_flags = '-coder 0 -flags +loop -cmp +chroma -partitions +parti8x8+parti4x4+partp8x8+partb8x8 -me_method hex -subq 6 -me_range 16 -g 250 -keyint_min 25 -sc_threshold 40 -i_qfactor 0.71 -b_strategy 1 -qcomp 0.6 -qmin 10 -qmax 51 -qdiff 4 -bf 0 -refs 1 -trellis 1 -flags2 +bpyramid+mixed_refs-wpred-dct8x8+fastpskip -wpredp 0 -rc_lookahead 30 -maxrate 10000000 -bufsize 10000000';

				$vpre_flags = explode( ' ', $vpre_flags );

			}

			$movflags = array();
			if ( $options['moov'] == 'movflag' ) {
				$movflags = array(
					'-movflags',
					'faststart',
				);
			}

			$profile_array = array();
			if ( $options['h264_profile'] != 'none' ) {
				$profile_array = array(
					'-' . $profile_flag,
					$options['h264_profile'],
				);
				if ( $options['h264_profile'] != 'high422' && $options['h264_profile'] != 'high444' ) {
					$profile_array[] = '-pix_fmt';
					$profile_array[] = 'yuv420p'; // makes sure output is converted to 4:2:0
				}
			}

			$level_array = array();
			if ( $options['h264_level'] != 'none' ) {
				$level_array = array(
					'-' . $level_flag,
					round( floatval( $options['h264_level'] ) * 10 ),
				);
			}

			$ffmpeg_options = array(
				'-acodec',
				$aaclib,
				'-' . $audio_bitrate_flag,
				$options['audio_bitrate'] . 'k',
				'-s',
				$width . 'x' . $height,
				'-vcodec',
				'libx264',
			);

			$ffmpeg_options = array_merge(
				$ffmpeg_options,
				$vpre_flags,
				$movflags,
				$profile_array,
				$level_array
			);

		} else { // if it's not H.264 the settings are basically the same

			$ffmpeg_options = array(
				'-acodec',
				'libvorbis',
				'-' . $audio_bitrate_flag,
				$options['audio_bitrate'] . 'k',
				'-s',
				$width . 'x' . $height,
				'-vcodec',
				$video_formats[ $format ]['vcodec'],
			);

			if ( $options['rate_control'] == 'crf' ) {
				if ( $video_formats[ $format ]['type'] == 'webm' ) {
					$ffmpeg_options[] = '-' . $video_bitrate_flag;
					$ffmpeg_options[] = round( floatval( $options['bitrate_multiplier'] ) * 1.25 * $width * $height * 30 / 1024 ) . 'k'; // set a max bitrate 25% larger than the ABR. Otherwise libvpx goes way too low.
				}
				if ( $video_formats[ $format ]['type'] == 'vp9' ) {
					$ffmpeg_options[] = '-' . $video_bitrate_flag;
					$ffmpeg_options[] = '0';
				}
			}
		}

		$nice = '';
		$sys  = strtoupper( PHP_OS ); // Get OS Name
		if ( substr( $sys, 0, 3 ) != 'WIN' && $options['nice'] == true ) {
			$nice = 'nice';
		}

		if ( ! empty( $options['htaccess_login'] )
			&& strpos( $input, 'http://' ) === 0
		) {
			$input = substr_replace( $input, $options['htaccess_login'] . ':' . $options['htaccess_password'] . '@', 7, 0 );
		}

		$nostdin = '';
		if ( $options['nostdin'] === true
			&& $options['video_app'] === 'ffmpeg'
		) {
			$nostdin = '-nostdin';
		}

		$encode_array_before_options = array(
			$nice,
			$options['app_path'] . '/' . $options['video_app'],
			$nostdin,
			'-y',
			'-i',
			$input,
		);

		if ( ! empty( $watermark_strings['input'] ) ) {
			$encode_array_before_options[] = '-i';
			$encode_array_before_options[] = $watermark_strings['input'];
		}

		if ( $options['audio_channels'] == true ) {
			$encode_array_before_options[] = '-ac';
			$encode_array_before_options[] = '2';
		}

		$encode_array_after_options = array(
			'-threads',
			$options['threads'],
		);

		if ( ! empty( $watermark_strings['input'] ) ) {
			$encode_array_after_options[] = '-filter_complex';
			$encode_array_after_options[] = $watermark_strings['filter'];
		}

		$encode_array_after_options[] = $output;

		$encode_array = array_merge(
			$encode_array_before_options,
			$ffmpeg_options,
			$audio_channels_flag,
			$rate_control_flag,
			$rotate_strings['rotate'],
			$encode_array_after_options
		);

		$encode_array = apply_filters( 'kgvid_generate_encode_array', $encode_array, $input, $output, $movie_info, $format, $width, $height, $rotate, $nostdin );

	} //if FFmpeg is found

	$encode_array = array_filter( $encode_array, 'strlen' ); // remove empty elements

	$options['encode_array'] = $encode_array;
	update_option( 'kgvid_video_embed_options', $options );

	return $encode_array;
}

function kgvid_encode_format_meta( $encodevideo_info, $video_key, $format, $status, $lastline, $post_id, $movieurl ) {

	$options = kgvid_get_options();

	$encodeset              = 'false';
	$checked                = '';
	$meta                   = '';
	$disabled               = '';
	$child_id               = '';
	$something_to_encode    = false;
	$encoding_now           = false;
	$time_to_wait           = 5000;
	$user_delete_capability = false;
	$status_l10n            = $status;
	$deletable              = false;
	$was_picked             = false;
	$encoding_time_array    = false;

	if ( is_multisite() ) {
		$blog_id = get_current_blog_id();
	} else {
		$blog_id = false;
	}

	if ( get_post_type( $post_id ) === 'attachment' ) {
		$kgvid_postmeta = kgvid_get_attachment_meta( $post_id );
		if ( array_key_exists( 'encode', $kgvid_postmeta )
			&& is_array( $kgvid_postmeta['encode'] )
			&& array_key_exists( $format, $kgvid_postmeta['encode'] )
		) {
			$encodeset = $kgvid_postmeta['encode'][ $format ];
		} else {
			$encodeset = 'false';
		}
		$post         = get_post( $post_id );
		$current_user = wp_get_current_user();

		if ( ( $post && $current_user->ID == $post->post_author )
			|| current_user_can( 'edit_others_video_encodes' )
		) {
			$user_delete_capability = true;
		}
	}
	if ( $encodeset == 'false'
		&& strpos( $format, 'custom_' ) === false
	) {
		if ( is_array( $options['encode'] )
		&& array_key_exists( $format, $options['encode'] )
		) {
			$encodeset = true;
		} else {
			$encodeset = false;
		}
	}

	if ( $encodeset === true
		|| $status === 'queued'
	) {
		$checked = 'checked';
	}

	if ( $status !== 'notchecked' ) { // File is in queue

		switch ( $status ) {
			case 'lowres':
				$status_l10n = __( 'Low Resolution', 'video-embed-thumbnail-generator' );
				break;
			case 'queued':
				$status_l10n = __( 'queued', 'video-embed-thumbnail-generator' );
				break;
			case 'encoding':
				$status_l10n = __( 'encoding', 'video-embed-thumbnail-generator' );
				break;
			case 'encoded':
				$status_l10n = __( 'encoded', 'video-embed-thumbnail-generator' );
				break;
			case 'Encoding Complete':
				$status_l10n = __( 'Encoding Complete', 'video-embed-thumbnail-generator' );
				break;
			case 'canceling':
				$status_l10n = __( 'canceling', 'video-embed-thumbnail-generator' );
				break;
			case 'canceled':
				$status_l10n = __( 'canceled', 'video-embed-thumbnail-generator' );
				break;
			case 'error':
				$status_l10n = __( 'error', 'video-embed-thumbnail-generator' );
				break;
			case 'deleted':
				$status_l10n = __( 'deleted', 'video-embed-thumbnail-generator' );
				break;
			default:
				$status_l10n = $status;
		}

		$meta = ' <strong data-status="' . esc_attr( $status ) . '">' . esc_html( ucfirst( $status_l10n ) ) . '</strong>';
		if ( $status == 'error' && ! empty( $lastline ) ) {
			$meta .= ': <span class="kgvid_warning">' . esc_html( stripslashes( $lastline ) ) . '</span>';
		}
	}

	if ( ! empty( $encodevideo_info ) ) {

		if ( array_key_exists( $format, $encodevideo_info ) && $encodevideo_info[ $format ]['exists'] ) { // if the video file exists

			if ( array_key_exists( 'id', $encodevideo_info[ $format ] ) ) {
				$child_id   = $encodevideo_info[ $format ]['id'];
				$was_picked = get_post_meta( $child_id, '_kgflashmediaplayer-pickedformat', true );
			} else {
				$was_picked = false;
			}

			if ( $status != 'encoding' ) { // not currently encoding

				if ( $status === 'notchecked' ) {
					if ( $was_picked != false ) {
						$meta = ' <strong>' . esc_html__( 'Set:', 'video-embed-thumbnail-generator' ) . ' ' . esc_html( basename( $encodevideo_info[ $format ]['filepath'] ) ) . '</strong>';
					} else {
						$meta = ' <strong>' . __( 'Encoded', 'video-embed-thumbnail-generator' ) . '</strong>';
					}
				}
				if ( $status !== 'canceling'
					&& $encodevideo_info[ $format ]['writable']
					&& current_user_can( 'encode_videos' )
					&& $user_delete_capability == true
					&& $format != 'fullres'
				) {
					if ( $was_picked != false ) {
						$meta .= '<button type="button" id="unpick-' . esc_attr( $post_id ) . '-' . esc_attr( $format ) . '" class="kgvid_delete-format" onclick="kgvid_clear_video(\'' . esc_attr( $movieurl ) . '\', \'' . esc_attr( $post_id ) . '\', \'' . esc_attr( $child_id ) . '\', \'' . esc_attr( $blog_id ) . '\');">' . __( 'Clear Format', 'video-embed-thumbnail-generator' ) . '</button>';
					} else {
						$deletable = true;
						$meta .= '<button type="button" id="delete-' . esc_attr( $post_id ) . '-' . esc_attr( $format ) . '" class="kgvid_delete-format" onclick="kgvid_delete_video(\'' . esc_attr( $movieurl ) . '\', \'' . esc_attr( $post_id ) . '\', \'' . esc_attr( $format ) . '\', \'' . esc_attr( $child_id ) . '\', \'' . esc_attr( $blog_id ) . '\');">' . esc_html__( 'Delete Permanently', 'video-embed-thumbnail-generator' ) . '</button>';
					}
				}
				$disabled = ' disabled title="' . esc_attr__( 'Format already exists', 'video-embed-thumbnail-generator' ) . '"';
				$checked  = '';
			}
		} else {

			$something_to_encode = true;

		} //if the video file doesn't exist, there's something to encode
	}

	if ( $status === 'encoding' ) {
		$encoding_now = true;
		$disabled     = ' disabled title="' . esc_attr__( 'Currently encoding', 'video-embed-thumbnail-generator' ) . '"';
		$checked      = 'checked';
		$progress     = kgvid_encode_progress();
		if ( is_array( $progress )
			&& array_key_exists( $video_key, $progress )
			&& array_key_exists( $format, $progress[ $video_key ] )
		) {
			if ( array_key_exists( 'embed_display', $progress[ $video_key ][ $format ] ) ) {
				$meta = $progress[ $video_key ][ $format ]['embed_display'];
			}
			if ( array_key_exists( 'time_to_wait', $progress[ $video_key ][ $format ] ) ) {
				$time_to_wait = $progress[ $video_key ][ $format ]['time_to_wait'];
			}
			if ( array_key_exists( 'encoding_time_array', $progress[ $video_key ][ $format ] ) ) {
				$encoding_time_array = $progress[ $video_key ][ $format ]['encoding_time_array'];
			}
		}
	}

	if ( $status == 'Encoding Complete' ) {
		$disabled = ' disabled title="' . esc_attr__( 'Format already exists', 'video-embed-thumbnail-generator' ) . '"';
		$checked  = '';
	}

	if ( $checked == '' ) {
		$something_to_encode = true;
	}

	if ( ! current_user_can( 'encode_videos' ) ) {
		$disabled            = ' disabled title="' . esc_attr__( 'You don\'t have permission to encode videos', 'video-embed-thumbnail-generator' ) . '"';
		$something_to_encode = false;
	}

	$meta_array = array(
		'checked'             => $checked,
		'disabled'            => $disabled,
		'meta'                => $meta,
		'time_to_wait'        => $time_to_wait,
		'something_to_encode' => $something_to_encode,
		'encoding_now'        => $encoding_now,
		'blog_id'             => $blog_id,
		'status_l10n'         => $status_l10n,
		'was_picked'          => $was_picked,
		'deletable'           => $deletable,
		'child_id'            => $child_id,
		'progress'            => $encoding_time_array,
	);

	return $meta_array;
}

function kgvid_generate_encode_checkboxes( $movieurl, $post_id, $page, $blog_id = false ) {

	$user_ID = get_current_user_id();

	$options            = kgvid_get_options();
	$video_encode_queue = kgvid_get_encode_queue();
	$video_formats      = kgvid_video_formats();

	$video_queued        = false;
	$something_to_encode = false;
	$encoding_now        = false;
	$encode_disabled     = '';
	$post_mime_type      = '';
	$actualheight        = '1081';
	$encodevideo_info    = array();
	$is_attachment       = false;
	$checkbox            = array();
	$checkbox_data       = array();

	if ( ! empty( $blog_id ) && $blog_id != 'false' ) {
		switch_to_blog( $blog_id );
		$blog_name_text = '[' . $blog_id . ']';
		$blog_id_text   = $blog_id . '-';
	} else {
		$blog_name_text = '';
		$blog_id_text   = '';
	}

	if ( ! empty( $movieurl ) ) {

		$encodevideo_info = kgvid_encodevideo_info( $movieurl, $post_id );
		$sanitized_url    = kgvid_sanitize_url( $movieurl );
		$movieurl         = $sanitized_url['movieurl'];
		if ( get_post_type( $post_id ) === 'attachment' ) { // if the video is in the database
			$is_attachment  = true;
			$kgvid_postmeta = kgvid_get_attachment_meta( $post_id );
			$post_mime_type = get_post_mime_type( $post_id );
			$dimensions     = kgvid_set_video_dimensions( $post_id );
			$actualheight   = $dimensions['actualheight'];
			$post           = get_post( $post_id );
		} else { // video's not in the database
			$is_attachment = false;
			unset( $video_formats['fullres'] );

			$check_mime_type = kgvid_url_mime_type( $movieurl );

			$post_mime_type = $check_mime_type['type'];

			if ( ! empty( $video_encode_queue )
				&& is_array( $video_encode_queue )
			) {
				foreach ( $video_encode_queue as $video_key => $video_entry ) {
					if ( $video_entry['movieurl'] == $movieurl ) {
						if ( is_array( $video_entry )
							&& array_key_exists( 'movie_info', $video_entry )
						) {
							$actualheight = $video_entry['movie_info']['height'];
						}
						break;
					}
				}
				reset( $video_encode_queue );
			}
		}
		if ( $post_mime_type == 'video/m4v'
			|| $post_mime_type == 'video/quicktime'
		) {
			$post_mime_type = 'video/mp4';
		}
		//end if movieurl is set
	} else {
		$encode_disabled = ' disabled title="' . esc_attr__( 'Please enter a valid video URL', 'video-embed-thumbnail-generator' ) . '"';
		unset( $video_formats['fullres'] );
		unset( $video_formats['custom_h264'] );
		unset( $video_formats['custom_webm'] );
		unset( $video_formats['custom_ogg'] );
		unset( $video_formats['custom_vp9'] );
	}

	if ( $options['ffmpeg_exists'] === 'notinstalled' ) {
		/* translators: %s is the name of the video encoding application (usually FFmpeg). */
		$ffmpeg_disabled_text = 'disabled="disabled" title="' . sprintf( esc_attr_x( '%1$s not found at %2$s', 'ex: FFmpeg not found at /usr/local/bin', 'video-embed-thumbnail-generator' ), esc_attr( strtoupper( $options['video_app'] ) ), esc_attr( $options['app_path'] ) ) . '"';
	} else {
		$ffmpeg_disabled_text = '';
	}

	if ( ( $is_attachment
			&& $user_ID != $post->post_author
			&& ! current_user_can( 'edit_others_video_encodes' )
		)
		|| ! current_user_can( 'encode_videos' )
		) {
		$ffmpeg_disabled_text = ' disabled title="' . esc_attr__( 'Insufficient priveleges to encode this video', 'video-embed-thumbnail-generator' ) . '"';
		$security_disabled    = true;
	} else {
		$security_disabled = false;
	}

	$video_key = false;
	if ( ! empty( $video_encode_queue )
		&& is_array( $video_encode_queue )
		&& ! empty( $movieurl )
	) {
		foreach ( $video_encode_queue as $video_key => $video_entry ) {
			if ( $video_entry['movieurl'] == $movieurl ) {
				foreach ( $video_entry['encode_formats'] as $format => $value ) {
					if ( ! array_key_exists( $format, $video_formats )
						&& $value['status'] != 'notchecked'
					) {
						$video_formats[ $format ]['name'] = $value['name'];
						if ( array_key_exists( 'filepath', $value )
							&& file_exists( $value['filepath'] )
						) {
							$encodevideo_info[ $format ]['exists'] = true;
							if ( get_filesystem_method( array(), $value['filepath'], true ) === 'direct' ) {
								$encodevideo_info[ $format ]['writable'] = true;
							} else {
								$encodevideo_info[ $format ]['writable'] = false;
							}
						} else {
							$encodevideo_info[ $format ]['exists']   = false;
							$encodevideo_info[ $format ]['writable'] = false;
						}
						$video_formats[ $format ]['status'] = $value['status'];
					} elseif ( array_key_exists( $format, $video_formats ) ) { // don't recreate any formats that were previously unset
						$video_formats[ $format ]['status'] = $value['status'];
					}
					if ( array_key_exists( 'lastline', $video_entry['encode_formats'][ $format ] ) ) {
						$video_formats[ $format ]['lastline'] = $video_entry['encode_formats'][ $format ]['lastline'];
					}
				}
				$video_queued = true;
				break;
			}
		}
	}

	if ( $post_mime_type == 'image/gif' ) {
		$fullres_only  = array( 'fullres' );
		$video_formats = array_intersect_key( $video_formats, array_flip( $fullres_only ) );
	}

	foreach ( $video_formats as $format => $format_stats ) {

		if ( strpos( $post_mime_type, strval( $format ) ) != false ) {
			continue;
		} //skip webm or ogv checkbox if the video is webm or ogv

		if ( empty( $movieurl ) ) {
			$disabled[ $format ] = ' disabled title="' . esc_attr__( 'Please enter a valid video URL', 'video-embed-thumbnail-generator' ) . '"';
		}

		if ( ! array_key_exists( 'status', $format_stats ) ) {
			$format_stats['status'] = 'notchecked';
		} //if this video isn't in the queue

		if ( $format_stats['status'] == 'lowres' ||
			(
				$actualheight != ''
				&& $format_stats['type'] == 'h264'
				&& $format !== 'fullres'
				&& (
					( strpos( $post_mime_type, 'mp4' ) !== false
						&& $actualheight <= $format_stats['height']
					)
					|| ( strpos( $post_mime_type, 'mp4' ) === false
						&& $actualheight < $format_stats['height']
					)
				)
			)
		) {
			continue;
		} //if the format is bigger than the original video, skip the checkbox

		if ( ! empty( $encodevideo_info )
			&& ! $encodevideo_info[ $format ]['exists']
			&& (
				strpos( $format, 'custom_' ) === 0 // skip custom formats that don't exist
				|| ( $options['hide_video_formats']
					&& is_array( $options['encode'] )
					&& ! array_key_exists( $format, $options['encode'] )
				) // skip options disabled in settings
				|| ( $options['hide_video_formats']
					&& ! is_array( $options['encode'] )
				) // skip all options if they're all disabled
			)
		) {
			continue;
		}

		if ( $format == 'fullres' ) {

			if ( $encodevideo_info['fullres']['exists'] == true
				&& $format_stats['status'] != 'encoding'
				&& $format_stats['status'] != 'Encoding Complete'
			) {
				wp_delete_file( $encodevideo_info[ $format ]['filepath'] );
				$encodevideo_info['fullres']['exists'] = false;
			}

			if ( isset( $kgvid_postmeta )
				&& array_key_exists( 'original_replaced', $kgvid_postmeta )
				&& $kgvid_postmeta['original_replaced'] == $options['replace_format']
			) {
				/* translators: %s is the name of a video format. */
				$format_stats['name'] = sprintf( esc_html_x( '%s again', 'Replace original with full resolution format again', 'video-embed-thumbnail-generator' ), esc_html( $format_stats['name'] ) );
			}
		}

		if ( ! array_key_exists( 'lastline', $format_stats ) ) {
			$format_stats['lastline'] = '';
		}
		$meta_array = kgvid_encode_format_meta( $encodevideo_info, $video_key, $format, $format_stats['status'], $format_stats['lastline'], $post_id, $movieurl );

		if ( $meta_array['something_to_encode'] == true ) {
			$something_to_encode = true;
		}
		if ( $meta_array['encoding_now'] == true ) {
			$encoding_now = true;
		}
		$checkbox[ $format ] = "\n\t\t\t" . '<li><input class="kgvid_encode_checkbox" type="checkbox" id="attachments-' . esc_attr( $blog_id_text . $post_id ) . '-kgflashmediaplayer-encode' . esc_attr( $format ) . '" name="attachments' . esc_attr( $blog_name_text ) . '[' . esc_attr( $post_id ) . '][kgflashmediaplayer-encode][' . esc_attr( $format ) . ']" ' . esc_attr( $meta_array['checked'] ) . ' ' . $ffmpeg_disabled_text . $meta_array['disabled'] . ' data-format="' . esc_attr( $format ) . '"> <label for="attachments-' . esc_attr( $blog_id_text . $post_id ) . '-kgflashmediaplayer-encode' . $format . '">' . esc_html( $format_stats['name'] ) . '</label> <span id="attachments-' . esc_attr( $blog_id_text . $post_id ) . '-kgflashmediaplayer-meta' . esc_attr( $format ) . '" class="kgvid_format_meta">' . $meta_array['meta'] . '</span>';

		if ( ! $security_disabled
			&& $is_attachment
			&& empty( $meta_array['disabled'] )
			&& $format_stats['status'] != 'queued'
			&& $format != 'fullres'
			&& $page != 'queue'
		) {
			/* translators: %s is the name of a video format */
			$checkbox[ $format ] .= "<button type='button' id='pick-" . esc_attr( $post_id ) . '-' . esc_attr( $format ) . "' class='button kgvid_encode_checkbox_button' data-choose='" . sprintf( esc_attr__( 'Choose %s', 'video-embed-thumbnail-generator' ), esc_attr( $format_stats['name'] ) ) . "' data-update='" . sprintf( esc_attr__( 'Set as %s', 'video-embed-thumbnail-generator' ), esc_attr( $format_stats['name'] ) ) . "' onclick='kgvid_pick_format(this, \"" . esc_attr( $post_id ) . '", "' . esc_attr( $format_stats['mime'] ) . '", "' . esc_attr( $format ) . '", "' . esc_attr( $movieurl ) . '", "' . esc_attr( $blog_id ) . "\");'>" . esc_html__( 'Choose from Library', 'video-embed-thumbnail-generator' ) . '</button>';
		}
		$checkbox[ $format ] .= '</li>';

		$checkbox_data[ $format ] = array_merge(
			$meta_array,
			$format_stats,
			$encodevideo_info[ $format ],
		);

	}//end format loop

	$checkboxes = '<div id="attachments-' . esc_attr( $blog_id_text . $post_id ) . '-kgflashmediaplayer-encodeboxes" class="kgvid_checkboxes_section"';

	if ( $video_queued == true ) {
		$i = count( $video_formats );
		while ( $i > 0 ) {
			$last_format = array_pop( $video_formats );
			$i           = count( $video_formats );
			if ( array_key_exists( 'status', $last_format )
				&& $last_format['status'] !== 'notchecked'
			) {
				break;
			} //get the final queued format
		}
		if ( $page !== 'queue'
			&& ! $encoding_now
			&& ( $last_format['status'] === 'queued'
				|| $last_format['status'] === 'canceling'
			)
		) {
			$checkboxes .= ' data-checkboxes="redraw"';
		} else {
			$checkboxes .= ' data-checkboxes="update"';
		}
	} elseif ( $options['auto_encode'] === true
		&& time() - get_post_time( 'U', true, $post_id ) < 60
	) {
		$checkboxes .= ' data-checkboxes="redraw"';
	}

	$checkboxes .= '><ul>';
	$checkboxes .= implode( $checkbox );
	$checkboxes .= '</ul>';

	if ( $something_to_encode == false ) {
		$encode_disabled = ' disabled title="' . esc_attr__( 'Nothing to encode', 'video-embed-thumbnail-generator' ) . '" style="display:none;"';
	}

	if ( $page === 'queue' ) {
		$button_text = esc_attr_x( 'Update', 'Button text', 'video-embed-thumbnail-generator' );
		$checkboxes .= "\n\t\t\t" . '<input type="hidden" name="attachments' . esc_attr( $blog_name_text ) . '[' . esc_attr( $post_id ) . '][kgflashmediaplayer-url]" value="' . esc_attr( $movieurl ) . '">';
	} else {
		$button_text = esc_attr_x( 'Encode selected', 'Button text', 'video-embed-thumbnail-generator' );
	}

	// NOTE: $ffmpeg_disabled_text & $encode_disabled are already escaped and don't need to be escaped again
	$checkboxes .= '<input type="button" id="attachments-' . esc_attr( $blog_id_text . $post_id ) . '-kgflashmediaplayer-encode" name="attachments' . esc_attr( $blog_name_text ) . '[' . esc_attr( $post_id ) . '][kgflashmediaplayer-encode]" class="button videopack-encode-button" value="' . esc_attr( $button_text ) . '" onclick="kgvid_enqueue_video_encode(\'' . esc_attr( $post_id ) . '\', \'' . esc_attr( $blog_id ) . '\');" ' . $ffmpeg_disabled_text . $encode_disabled . '/><div style="display:block;" id="attachments-' . esc_attr( $blog_id_text . $post_id ) . '-encodeplaceholder"></div>';

	if ( $page != 'queue' ) {
		if ( is_array( $options['encode'] )
			|| $options['hide_video_formats'] == false
		) {
			$checkboxes .= '<small><em>' . esc_html__( 'Generates additional video formats', 'video-embed-thumbnail-generator' ) . '</em></small>';
		} else {
			$checkboxes .= '<em>' . esc_html__( 'All additional video formats are disabled in Videopack settings', 'video-embed-thumbnail-generator' ) . '</em>';
		}
	}

	$checkboxes .= '</div>'; // close encodeboxes div

	if ( ! empty( $blog_id )
		&& $blog_id != 'false'
	) {
		restore_current_blog();
	}

	$arr = array(
		'checkboxes' => $checkboxes,
		'encoding'   => $encoding_now,
		'data'       => $checkbox_data,
	);

	return $arr;
}

function kgvid_generate_queue_table_header() {

	$table_headers = array(
		esc_html_x( 'Order', 'noun, column header', 'video-embed-thumbnail-generator' ),
		esc_html_x( 'User', 'username, column header', 'video-embed-thumbnail-generator' ),
		esc_html_x( 'Thumbnail', 'noun, column header', 'video-embed-thumbnail-generator' ),
		esc_html_x( 'File', 'noun, column header', 'video-embed-thumbnail-generator' ),
		esc_html_x( 'Formats', 'noun, column header', 'video-embed-thumbnail-generator' ),
		esc_html_x( 'Actions', 'noun, column header', 'video-embed-thumbnail-generator' ),
	);

	if ( is_network_admin() ) {
		array_splice( $table_headers, 2, 0, array( esc_html_x( 'Site', 'multisite site name, column header', 'video-embed-thumbnail-generator' ) ) );
	}

	$code = '<tr>';
	foreach ( $table_headers as $header ) {
		$code .= '<th>' . esc_html( $header ) . '</th>';
	}
	$code .= "</tr>\n";

	return $code;
}

function kgvid_generate_queue_table( $scope = 'site' ) {

	$html               = '';
	$current_user       = wp_get_current_user();
	$video_encode_queue = kgvid_get_encode_queue();
	$nonce              = wp_create_nonce( 'video-embed-thumbnail-generator-nonce' );

	$crons = _get_cron_array();

	if ( $crons ) {
		foreach ( $crons as $timestamp => $cron_job ) {
			if ( is_array( $cron_job ) && array_key_exists( 'kgvid_cron_new_attachment', $cron_job ) ) {
				foreach ( $cron_job['kgvid_cron_new_attachment'] as $id => $cron_info ) {
					if ( is_array( $cron_info ) && array_key_exists( 'args', $cron_info ) ) {
						$post = get_post( $cron_info['args'][0] );
						if ( $post ) {
							$video_encode_queue[] = array(
								'attachmentID'   => $post->ID,
								'parent_id'      => $post->post_parent,
								'movieurl'       => wp_get_attachment_url( $post->ID ),
								'encode_formats' => 'temp',
							);
						}
					}
				}
			}
		}
	}

	if ( is_network_admin()
		|| 'network' === $scope
	) {
		$total_columns = 8;
	} else {
		$total_columns = 7;
	}

	if ( ! empty( $video_encode_queue )
		&& is_array( $video_encode_queue )
	) {

		$video_formats      = kgvid_video_formats();
		$currently_encoding = array();
		$queued             = array();

		foreach ( $video_encode_queue as $order => $video_entry ) {

			if ( array_key_exists( 'blog_id', $video_entry ) ) {

				$blog_id        = $video_entry['blog_id'];
				$blog_name_text = '[' . $blog_id . ']';
				$blog_id_text   = $blog_id . '-';

				$same_blog = true;

				if ( $video_entry['blog_id'] === get_current_blog_id() ) {
					$same_blog = true;
				} else {
					$same_blog = false;
					if ( is_network_admin() || $scope == 'network' ) {
						switch_to_blog( $blog_id );
					}
				}
			} else {
						$blog_id        = false;
						$blog_name_text = '';
						$blog_id_text   = '';
						$same_blog      = true;
			}

			$html .= "\t<tr id='tr-" . esc_attr( $blog_id_text . $video_entry['attachmentID'] ) . "'";

			if ( is_array( $video_entry['encode_formats'] ) ) {
				foreach ( $video_formats as $format => $format_stats ) {

					if ( array_key_exists( $format, $video_entry['encode_formats'] ) && array_key_exists( 'status', $video_entry['encode_formats'][ $format ] ) ) {

						if ( $video_entry['encode_formats'][ $format ]['status'] === 'encoding' ) {
							$currently_encoding[ $order ] = true;
							break;
						} elseif ( $video_entry['encode_formats'][ $format ]['status'] === 'queued' ) {
							$queued[ $order ] = true;
						} else {
							if ( ! array_key_exists( $order, $currently_encoding ) ) {
								$currently_encoding[ $order ] = false;
							}
							if ( ! array_key_exists( $order, $queued ) ) {
								$queued[ $order ] = false;
							}
						}
					}
				}
			} else {
				$currently_encoding[ $order ] = false;
				$queued[ $order ]             = false;
			}

			if ( $currently_encoding[ $order ] ) {
				$html .= " class='currently_encoding' ";
			} elseif ( $queued[ $order ] ) {
				$html .= " class='kgvid_queued' ";
			} else {
				$html .= " class='kgvid_complete' ";
			}

			$html .= '>';

			// Order
			$html .= "<td id='td-" . esc_attr( $blog_id_text . $video_entry['attachmentID'] ) . "'>" . esc_html( intval( $order ) + 1 ) . "</td>\n";

			// User
			$post = get_post( $video_entry['attachmentID'] );

			if ( ( is_network_admin() || 'network' == $scope )
			|| ( $same_blog && $post && $current_user->ID == $post->post_author )
			|| ( current_user_can( 'edit_others_video_encodes' ) && $same_blog )
			) {

				if ( array_key_exists( 'user_id', $video_entry ) && ! empty( $video_entry['user_id'] ) ) {
					$user  = get_userdata( $video_entry['user_id'] );
					$html .= '<td>' . esc_html( $user->display_name ) . "</td>\n";
				} elseif ( $post ) {
					$user  = get_userdata( $post->post_author );
					$html .= '<td>' . esc_html( $user->display_name ) . "</td>\n";
				} else {
					$html .= "<td></td>\n";
				}

				// Site
				if ( ( is_network_admin() || 'network' == $scope ) && $blog_id ) {
					$blog_details = get_bloginfo();
					$html        .= "<td><a href='" . esc_url( get_admin_url( $blog_id ) ) . "'>" . esc_html( $blog_details ) . "</a><input type='hidden' name='attachments[blog_id][" . $video_entry['attachmentID'] . "]' value='" . esc_attr( $blog_id ) . "'></td>\n";
				}

				// Thumbnail
				$thumbnail_url  = get_post_meta( $video_entry['attachmentID'], '_kgflashmediaplayer-poster', true );
				$thumbnail_html = '';
				if ( $thumbnail_url != '' ) {
					$thumbnail_html = '<img width="100" src="' . esc_attr( $thumbnail_url ) . '">';
				}

				// File
				if ( $post && $post->post_type == 'attachment' ) {
					$moviefilepath  = get_attached_file( $video_entry['attachmentID'] );
					$attachmentlink = get_admin_url() . 'post.php?post=' . $video_entry['attachmentID'] . '&action=edit';
				} else {
					$moviefilepath  = $video_entry['movieurl'];
					$attachmentlink = $video_entry['movieurl'];
				}
				$html     .= "\t\t\t\t\t<td><a href='" . esc_url( $attachmentlink ) . "'> " . $thumbnail_html . "</a></td>\n";
				$path_info = pathinfo( $moviefilepath );
				$file_name = basename( $moviefilepath, '.' . $path_info['extension'] );
				$html     .= "\t\t\t\t\t<td><a href='" . esc_url( $attachmentlink ) . "'>" . esc_html( urldecode( $file_name ) ) . "</a><input type='hidden' name='attachments" . esc_attr( $blog_name_text . '[' . $video_entry['attachmentID'] ) . "][kgflashmediaplayer-url]' value='" . esc_attr( $video_entry['movieurl'] ) . "'></td>\n";

				// Formats
				$html .= "\t\t\t\t\t<td class='queue_encode_formats' id='formats_" . esc_attr( $video_entry['attachmentID'] ) . "'>";
				$html .= "<input type='hidden' id='attachments-" . esc_attr( $blog_id_text . $video_entry['attachmentID'] ) . "-kgflashmediaplayer-security' name='attachments" . esc_attr( $blog_name_text . '[' . $video_entry['attachmentID'] ) . "][kgflashmediaplayer-security]' value='" . esc_attr( $nonce ) . "' />";

				if ( is_array( $video_entry['encode_formats'] ) ) {
					$checkboxes = kgvid_generate_encode_checkboxes( $video_entry['movieurl'], $video_entry['attachmentID'], 'queue', $blog_id );
				} else {
					$checkboxes = array( 'checkboxes' => esc_html__( 'Please wait while this video is automatically added to the queue...', 'video-embed-thumbnail-generator' ) );
				}
				$html .= $checkboxes['checkboxes'];
				$html .= "</td>\n";

				// Actions
				$html .= "\t\t\t\t\t<td>";
				$html .= "<button type='button' id='clear-" . esc_attr( $blog_id_text . $video_entry['attachmentID'] ) . "' class='submitdelete kgvid-queue-action' onclick='kgvid_encode_queue(\"delete\", " . esc_attr( $order ) . ', ' . esc_attr( $video_entry['attachmentID'] ) . ', "' . esc_attr( $blog_id ) . "\")'";
				if ( $currently_encoding[ $order ] ) {
					$html .= " style='display:none;'";
				}
				$html .= '>Clear</button>';
				//end if current user can see this stuff
			} elseif ( $same_blog == false ) {
				$html .= "<td colspan='" . esc_attr( $total_columns - 1 ) . "'><strong class='kgvid_queue_message'>" . esc_html__( "Other site's video", 'video-embed-thumbnail-generator' ) . '</strong></td>';
			} else {
				$html .= "<td colspan='" . esc_attr( $total_columns - 1 ) . "'><strong class='kgvid_queue_message'>" . esc_html__( "Other user's video", 'video-embed-thumbnail-generator' ) . '</strong></td>';
			}
			$html .= "</td></tr>\n";

			if ( ( is_network_admin()
				|| 'network' == $scope ) && $blog_id
			) {
				restore_current_blog();
			}
		}
	}

	if ( empty( $html ) ) {
		$html = "\t<tr><td colspan='" . esc_attr( $total_columns ) . "'><strong class='kgvid_queue_message'>" . esc_html__( 'Queue is empty', 'video-embed-thumbnail-generator' ) . "</strong></td></tr>\n";
	}

	return $html;
}

function kgvid_add_ffmpeg_queue_page() {
	$options = kgvid_get_options();
	if ( $options['ffmpeg_exists'] === true ) { // only add the queue page if FFmpeg is installed
		add_submenu_page( 'tools.php', esc_html_x( 'Videopack Encoding Queue', 'Tools page title', 'video-embed-thumbnail-generator' ), esc_html_x( 'Videopack Encode Queue', 'Title in admin sidebar', 'video-embed-thumbnail-generator' ), 'encode_videos', 'kgvid_video_encoding_queue', 'kgvid_ffmpeg_queue_page' );
	}
}
add_action( 'admin_menu', 'kgvid_add_ffmpeg_queue_page' );

function kgvid_add_network_queue_page() {
	if ( is_videopack_active_for_network() ) {
		add_submenu_page( 'settings.php', esc_html_x( 'Videopack Encoding Queue', 'Tools page title', 'video-embed-thumbnail-generator' ), esc_html_x( 'Network Video Encode Queue', 'Title in network admin sidebar', 'video-embed-thumbnail-generator' ), 'manage_network', 'kgvid_network_video_encoding_queue', 'kgvid_ffmpeg_queue_page' );
	}
}
add_action( 'network_admin_menu', 'kgvid_add_network_queue_page' );

function kgvid_ffmpeg_queue_page() {

	wp_enqueue_media();
	$options            = kgvid_get_options();
	$network_options    = get_site_option( 'kgvid_video_embed_network_options' );
	$queue_control_html = '';

	if ( current_user_can( 'edit_others_video_encodes' ) &&
		( ! is_multisite()
		|| is_network_admin()
		|| ( is_videopack_active_for_network()
			&& (
				(
					is_array( $network_options )
					&& array_key_exists( 'queue_control', $network_options )
					&& $network_options['queue_control'] == 'play'
				)
				|| is_super_admin()
				)
			)
		)
	) {

		if ( $options['queue_control'] == 'play' ) {
			$opposite_command = 'pause';
			$title_text       = esc_html__( 'Pause the queue. Any videos currently encoding will complete.', 'video-embed-thumbnail-generator' );
		} else {
			$opposite_command = 'play';
			$title_text       = esc_html__( 'Start encoding', 'video-embed-thumbnail-generator' );
		}

		$queue_control_html = '<span id="kgvid-encode-queue-control" class="kgvid-encode-queue dashicons dashicons-controls-' . esc_attr( $opposite_command ) . ' kgvid-encode-queue-control-disabled" title="' . esc_attr( $title_text ) . '"></span>';
	} elseif ( is_multisite()
		&& ! is_network_admin()
		&& is_videopack_active_for_network()
		&& is_array( $network_options )
		&& array_key_exists( 'queue_control', $network_options )
		&& $network_options['queue_control'] === 'pause'
		&& ! is_super_admin()
	) {
		$queue_control_html = '<span id="kgvid-encode-queue-control-disabled" class="kgvid-encode-queue dashicons dashicons-controls-play kgvid-encode-queue-control-disabled" title="' . esc_attr__( 'Queue is paused by Network Super Admin.', 'video-embed-thumbnail-generator' ) . '"></span>';
	}

	include __DIR__ . '/partials/encode-queue-page.php';

	kgvid_encode_videos();
}

function kgvid_validate_ffmpeg_settings( $input ) {

	$ffmpeg_info = kgvid_check_ffmpeg_exists( $input, false );
	if ( $ffmpeg_info['ffmpeg_exists'] === true ) {
		$input['ffmpeg_exists'] = true;
	}
	$input['app_path'] = $ffmpeg_info['app_path'];

	if ( $ffmpeg_info['proc_open_enabled'] == false ) {
		add_settings_error( 'video_embed_thumbnail_generator_settings', 'ffmpeg-disabled', esc_html__( 'proc_open is disabled in PHP settings. You can embed existing videos and make thumbnails with compatible browsers, but video encoding will not work. Contact your System Administrator to find out if you can enable proc_open.', 'video-embed-thumbnail-generator' ), 'updated' );
		$input['ffmpeg_exists'] = 'notinstalled';
	} elseif ( $ffmpeg_info['ffmpeg_exists'] === false ) {

		$textarea = '';
		if ( count( $ffmpeg_info['output'] ) > 2 ) {
			$textarea = '<br /><textarea rows="3" cols="70" disabled style="resize: none;">' . esc_textarea( implode( "\n", $ffmpeg_info['output'] ) ) . '</textarea>';
		}
		/* translators: %1$s is the name of the video encoding application (usually FFmpeg). %2$s is the path to the application. */
		add_settings_error( 'video_embed_thumbnail_generator_settings', 'ffmpeg-disabled', sprintf( esc_html__( '%1$s is not executing correctly at %2$s. You can embed existing videos and make thumbnails with compatible browsers, but video encoding is not possible without %1$s.', 'video-embed-thumbnail-generator' ), esc_html( strtoupper( $input['video_app'] ) ), esc_html( $input['app_path'] ) ) . '<br /><br />' . esc_html__( 'Error message:', 'video-embed-thumbnail-generator' ) . ' ' . esc_textarea( implode( ' ', array_slice( $ffmpeg_info['output'], -2, 2 ) ) ) . $textarea, 'updated' );

		$input['ffmpeg_exists'] = 'notinstalled';
	}

	return $input;
}

function kgvid_add_attachment_handler( $post_id ) {

	$options = kgvid_get_options();

	if ( $options['auto_encode'] == true || $options['auto_thumb'] == true ) {

		kgvid_schedule_attachment_processing( $post_id );

	}
}
add_action( 'add_attachment', 'kgvid_add_attachment_handler' );

function kgvid_schedule_attachment_processing( $post_id, $force = false, $x = 1 ) {

	$post     = get_post( $post_id );
	$is_video = kgvid_is_video( $post );

	if ( $is_video ) {

		$time_offset = ( $x * 3 );

		$already_scheduled = wp_get_scheduled_event( 'kgvid_cron_new_attachment', array( $post_id, $force ) );

		if ( $already_scheduled === false ) {
			wp_schedule_single_event( time() + $time_offset, 'kgvid_cron_new_attachment', array( $post_id, $force ) );
		}

		if ( $force === false ) {
			$transient = get_transient( 'kgvid_new_attachment_transient' ); // error checking to avoid race conditions when using Add From Server
			if ( is_array( $transient ) ) {
				$transient[] = $post_id;
			} else {
				$transient = array( $post_id );
			}
			$transient = array_unique( $transient );
			set_transient( 'kgvid_new_attachment_transient', $transient, DAY_IN_SECONDS );
		}
	}
}

function kgvid_cron_new_attachment_handler( $post_id, $force = false ) {

	$options = kgvid_get_options();

	if ( $force != false ) {
		$options['auto_encode'] = false;
		$options['auto_thumb']  = false;
	}

	$post        = get_post( $post_id );
	$movieurl    = wp_get_attachment_url( $post_id );
	$filepath    = get_attached_file( $post_id );
	$is_animated = false;
	if ( $post
		&& $post->post_mime_type == 'image/gif'
	) {
		$is_animated = kgvid_is_animated_gif( $filepath );
	}

	if ( $post
		&& $post->post_mime_type != 'image/gif'
		&& ( $force == 'thumbs'
			|| $options['auto_thumb'] == true
		)
	) {

		$thumb_output   = array();
		$thumb_id       = array();
		$numberofthumbs = intval( $options['auto_thumb_number'] );

		if ( $numberofthumbs == 1 ) {

			switch ( $options['auto_thumb_position'] ) {
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

			$thumb_output[1] = kgvid_make_thumbs( $post_id, $movieurl, $imaginary_numberofthumbs, 1, $iincreaser, $thumbtimecode, $dofirstframe, 'generate' );
			$thumb_key       = 1;

		}//end if just one auto_thumb

		if ( $numberofthumbs > 1 ) {

			$thumb_key = intval( $options['auto_thumb_position'] );

			$i          = 1;
			$increaser  = 0;
			$iincreaser = 0;
			while ( $i <= $numberofthumbs ) {
				$iincreaser         = $i + $increaser;
				$thumb_output[ $i ] = kgvid_make_thumbs( $post_id, $movieurl, $numberofthumbs, $i, $iincreaser, '', false, 'generate' );
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
				$thumb_info       = kgvid_save_thumb( $post_id, $post->post_title, $thumb_output[ $key ]['thumb_url'], $index );
				$thumb_id[ $key ] = $thumb_info['thumb_id'];
				//end if there wasn't an error
			} else {
				$kgvid_postmeta                    = kgvid_get_attachment_meta( $post_id );
				$kgvid_postmeta['autothumb-error'] = $thumb_output[ $thumb_key ]['embed_display'];
				kgvid_save_attachment_meta( $post_id, $kgvid_postmeta );
			}
		}//end loop through generated thumbnails to save them in the database

		if ( ! empty( $thumb_id[ $thumb_key ] ) ) {
			$thumb_output[ $thumb_key ]['thumb_url'] = wp_get_attachment_url( $thumb_id[ $thumb_key ] );
			update_post_meta( $post_id, '_kgflashmediaplayer-poster', $thumb_output[ $thumb_key ]['thumb_url'] );
			update_post_meta( $post_id, '_kgflashmediaplayer-poster-id', $thumb_id[ $thumb_key ] );
			set_post_thumbnail( $post_id, $thumb_id[ $thumb_key ] );
			if ( $options['featured'] == true && ! empty( $thumb_id[ $thumb_key ] ) ) {
				if ( ! empty( $post->post_parent ) ) {
					set_post_thumbnail( $post->post_parent, $thumb_id[ $thumb_key ] );
				} else { // video has no parent post yet
					wp_schedule_single_event( time() + 60, 'kgvid_cron_check_post_parent', array( $post_id ) );
				}
			}
		}//end setting main thumbnail
	}//end if auto_thumb is on

	if ( $post
		&& ( $force == 'encode'
			|| $options['auto_encode'] == true
		)
		&& ( ! $is_animated
			|| $options['auto_encode_gif'] == true
		)
	) {

		$video_formats       = kgvid_video_formats();
		$kgvid_postmeta      = kgvid_get_attachment_meta( $post_id );
		$extension           = pathinfo( $filepath, PATHINFO_EXTENSION );
		$something_to_encode = false;
		$encode_checked      = array();

		if ( substr( basename( $filepath, '.' . $extension ), -10 ) == '-noreplace'
			|| ( array_key_exists( 'original_replaced', $kgvid_postmeta ) && $kgvid_postmeta['original_replaced'] == $options['replace_format'] )
		) {
			$options['encode']['fullres'] = false;
		}

		if ( $post->post_mime_type === 'image/gif' ) {
			$fullres_only  = array( 'fullres' );
			$video_formats = array_intersect_key( $video_formats, array_flip( $fullres_only ) );
		}

		foreach ( $video_formats as $format => $format_stats ) {

			if ( is_array( $options['encode'] ) && array_key_exists( $format, $options['encode'] ) && $options['encode'][ $format ] == true ) {
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
}
add_action( 'kgvid_cron_new_attachment', 'kgvid_cron_new_attachment_handler', 10, 2 );

function kgvid_cleanup_generated_logfiles_handler( $logfile ) {
	$lastmodified = '';
	if ( strpos( $logfile, '_encode.txt' ) !== false
		&& file_exists( $logfile )
	) {
		$lastmodified = filemtime( $logfile );
	}
	if ( $lastmodified != false ) {
		if ( time() - $lastmodified > 120 ) {
			wp_delete_file( $logfile );
		} else {
			$timestamp = wp_next_scheduled( 'kgvid_cleanup_generated_logfiles' );
			wp_unschedule_event( $timestamp, 'kgvid_cleanup_generated_logfiles' );
			$args = array( 'logfile' => $logfile );
			wp_schedule_single_event( time() + 600, 'kgvid_cleanup_generated_logfiles', $args );
		}
	}
}
add_action( 'kgvid_cleanup_generated_logfiles', 'kgvid_cleanup_generated_logfiles_handler' );

function kgvid_cleanup_generated_thumbnails_handler() {
	$uploads = wp_upload_dir();

	if ( kgvid_can_write_direct( $uploads['path'] . '/thumb_tmp' ) ) {
		global $wp_filesystem;
		$wp_filesystem->rmdir( $uploads['path'] . '/thumb_tmp', true ); // remove the whole tmp file directory
	}
}
add_action( 'kgvid_cleanup_generated_thumbnails', 'kgvid_cleanup_generated_thumbnails_handler' );

function kgvid_schedule_cleanup_generated_files( $arg ) {
	// schedules deleting all tmp thumbnails or logfiles if no files are generated in an hour

	if ( $arg == 'thumbs' ) {
		$timestamp = wp_next_scheduled( 'kgvid_cleanup_generated_thumbnails' );
		wp_unschedule_event( $timestamp, 'kgvid_cleanup_generated_thumbnails' );
		wp_schedule_single_event( time() + 3600, 'kgvid_cleanup_generated_thumbnails' );
	} else {
		$timestamp = wp_next_scheduled( 'kgvid_cleanup_generated_logfiles' );
		wp_unschedule_event( $timestamp, 'kgvid_cleanup_generated_logfiles' );
		$args = array( 'logfile' => $arg );
		wp_schedule_single_event( time() + 600, 'kgvid_cleanup_generated_logfiles', $args );
	}
}

function kgvid_make_thumbs( $post_id, $movieurl, $numberofthumbs, $i, $iincreaser, $thumbtimecode, $dofirstframe, $generate_button ) {

	$options = kgvid_get_options();
	$uploads = wp_upload_dir();

	if ( get_post_type( $post_id ) == 'attachment' ) {
		$moviefilepath = get_attached_file( $post_id );
		if ( ! file_exists( $moviefilepath ) ) {
			$moviefilepath = esc_url_raw( str_replace( ' ', '%20', $movieurl ) );
		}

		$kgvid_postmeta = kgvid_get_attachment_meta( $post_id );
		$keys           = array(
			'width'    => 'actualwidth',
			'height'   => 'actualheight',
			'duration' => 'duration',
			'rotate'   => 'rotate',
		);

		if ( empty( $kgvid_postmeta['duration'] ) ) {
			$movie_info = kgvid_get_video_dimensions( $moviefilepath );
			foreach ( $keys as $info => $meta ) {
				if ( ! empty( $movie_info[ $info ] ) ) {
					$kgvid_postmeta[ $meta ] = $movie_info[ $info ];
				}
			}
			kgvid_save_attachment_meta( $post_id, $kgvid_postmeta );
		} else { // post meta is already set
			$movie_info = array();
			foreach ( $keys as $info => $meta ) {
				$movie_info[ $info ] = $kgvid_postmeta[ $meta ];
			}
			$movie_info['worked'] = true;
		}
	} else {
		$moviefilepath = esc_url_raw( str_replace( ' ', '%20', $movieurl ) );
		$movie_info    = kgvid_get_video_dimensions( $moviefilepath );
	}

	if ( $movie_info['worked'] == true ) { // if FFmpeg was able to open the file

		$sanitized_url     = kgvid_sanitize_url( $movieurl );
		$thumbnailfilebase = $uploads['url'] . '/thumb_tmp/' . $sanitized_url['basename'];

		$movie_width  = $movie_info['width'];
		$movie_height = $movie_info['height'];

		wp_mkdir_p( $uploads['path'] . '/thumb_tmp' );

		if ( $movie_info['rotate'] === false
			|| $options['ffmpeg_vpre'] == true
		) {
			$movie_info['rotate'] = '';
		}
		switch ( $movie_info['rotate'] ) { // if it's a sideways mobile video
			case 90:
			case 270:
				// swap height & width
				$tmp          = $movie_width;
				$movie_width  = $movie_height;
				$movie_height = $tmp;
				break;
		}

		$thumbnailheight = strval( round( floatval( $movie_height ) / floatval( $movie_width ) * 200 ) );

		$jpgpath = $uploads['path'] . '/thumb_tmp/';

		$movieoffset = round( ( floatval( $movie_info['duration'] ) * $iincreaser ) / ( $numberofthumbs * 2 ), 2 );
		if ( $movieoffset > floatval( $movie_info['duration'] ) ) {
			$movieoffset = floatval( $movie_info['duration'] );
		}

		if ( $generate_button === 'random' ) { // adjust offset random amount
			$movieoffset = $movieoffset - rand( 0, round( intval( $movie_info['duration'] ) / $numberofthumbs ) );
			if ( $movieoffset < 0 ) {
				$movieoffset = '0';
			}
		}
		if ( $thumbtimecode ) { // if a specific thumbnail timecode is set
			if ( $thumbtimecode === 'firstframe' ) {
				$thumbtimecode = '0';
			}
			$timecode_array = explode( ':', $thumbtimecode );
			$timecode_array = array_reverse( $timecode_array );
			if ( array_key_exists( 1, $timecode_array ) ) {
				$timecode_array[1] = $timecode_array[1] * 60;
			}
			if ( array_key_exists( 2, $timecode_array ) ) {
				$timecode_array[2] = $timecode_array[2] * 3600;
			}
			$thumbtimecode = array_sum( $timecode_array );
			$movieoffset   = $thumbtimecode;
			$i             = $numberofthumbs + 1;
		}

		if ( $dofirstframe == 'true' && $i == 1 ) {
			$movieoffset = '0';
		}

		$thumbnailfilename[ $i ] = str_replace( ' ', '_', $sanitized_url['basename'] . '_thumb' . $i . '.jpg' );
		$thumbnailfilename[ $i ] = $jpgpath . $thumbnailfilename[ $i ];

		if ( ! empty( $options['htaccess_login'] ) && strpos( $moviefilepath, 'http://' ) === 0 ) {
			$moviefilepath = substr_replace( $moviefilepath, $options['htaccess_login'] . ':' . $options['htaccess_password'] . '@', 7, 0 );
		}

		$rotate_strings    = kgvid_ffmpeg_rotate_array( $movie_info['rotate'], $movie_info['width'], $movie_info['height'] );
		$watermark_strings = kgvid_ffmpeg_watermark_array( $options['ffmpeg_thumb_watermark'], $movie_width, $rotate_strings['complex'] );

		$tmp_thumbnailurl   = $thumbnailfilebase . '_thumb' . $i . '.jpg';
		$tmp_thumbnailurl   = str_replace( ' ', '_', $tmp_thumbnailurl );
		$final_thumbnailurl = str_replace( '/thumb_tmp/', '/', $tmp_thumbnailurl );

		$thumbnail_generator = kgvid_process_thumb(
			$moviefilepath,
			$thumbnailfilename[ $i ],
			$options['app_path'],
			round( $movieoffset ),
			$rotate_strings['rotate'],
			$watermark_strings
		);

		if ( is_file( $thumbnailfilename[ $i ] ) ) {
			kgvid_schedule_cleanup_generated_files( 'thumbs' );
		}

		$thumbnaildisplaycode = '<div class="kgvid_thumbnail_select" name="attachments[' . esc_attr( $post_id ) . '][thumb' . esc_attr( $i ) . ']" id="attachments-' . esc_attr( $post_id ) . '-thumb' . esc_attr( $i ) . '"><label for="kgflashmedia-' . esc_attr( $post_id ) . '-thumbradio' . esc_attr( $i ) . '"><img src="' . esc_attr( $tmp_thumbnailurl ) . '?' . rand() . '" class="kgvid_thumbnail"></label><br /><input type="radio" name="attachments[' . esc_attr( $post_id ) . '][thumbradio_' . esc_attr( $post_id ) . ']" id="kgflashmedia-' . esc_attr( $post_id ) . '-thumbradio' . esc_attr( $i ) . '" value="' . esc_attr( $final_thumbnailurl ) . '" onchange="kgvid_select_thumbnail(this.value, \'' . esc_attr( $post_id ) . '\', ' . esc_attr( $movieoffset ) . ', jQuery(this).parent().find(\'img\')[0]);"></div>';

		++$i;

		$arr = array(
			'thumbnaildisplaycode' => $thumbnaildisplaycode,
			'movie_width'          => esc_html( $movie_width ),
			'movie_height'         => esc_html( $movie_height ),
			'lastthumbnumber'      => absint( $i ),
			'movieoffset'          => esc_html( $movieoffset ),
			'thumb_url'            => esc_url( $final_thumbnailurl ),
			'real_thumb_url'       => esc_url( $tmp_thumbnailurl ),
		);

		return $arr;
		//if ffmpeg can open movie
	} else {
		$thumbnaildisplaycode = '<strong>' . esc_html__( 'Can\'t open movie file.', 'video-embed-thumbnail-generator' ) . '</strong><br />' . wp_kses_post( $movie_info['output'] );
		$arr                  = array(
			'thumbnaildisplaycode' => $thumbnaildisplaycode,
			'embed_display'        => $thumbnaildisplaycode,
			'lastthumbnumber'      => 'break',
		);
		return $arr;
	} //can't open movie
}

function kgvid_enqueue_videos( $post_id, $movieurl, $encode_checked, $parent_id, $blog_id = false ) {

	if ( ! empty( $blog_id ) && $blog_id != 'false' ) {
		$old_blog_id = get_current_blog_id();
		if ( $blog_id != $old_blog_id ) {
			switch_to_blog( $blog_id );
		}
	}

	$options        = kgvid_get_options();
	$embed_display  = '';
	$encode_list    = array();
	$h264extensions = array( 'mp4', 'm4v', 'mov' );
	$video_formats  = kgvid_video_formats( false, false );
	$sanitized_url  = kgvid_sanitize_url( $movieurl );
	$movieurl       = $sanitized_url['movieurl'];
	$post_type      = get_post_type( $post_id );
	if ( $post_type === 'attachment' ) {
		$filepath = get_attached_file( $post_id );
	} else {
		$filepath = $movieurl;
	}
	$movie_info              = kgvid_get_video_dimensions( $filepath );
	$existing_queue_position = false;
	$new_queue_position      = false;
	$already_queued          = false;

	if ( $movie_info['worked'] == true ) { // if FFmpeg was able to open the file

		$movie_height = $movie_info['height'];

		if ( $post_type == 'attachment' ) { // if the video is in the database

			$kgvid_postmeta = kgvid_get_attachment_meta( $post_id );
			$keys           = array(
				'width'    => 'actualwidth',
				'height'   => 'actualheight',
				'duration' => 'duration',
				'rotate'   => 'rotate',
			);
			foreach ( $keys as $info => $meta ) {
				$kgvid_postmeta[ $meta ] = $movie_info[ $info ];
			}
		}

		$encodevideo_info = kgvid_encodevideo_info( $movieurl, $post_id );

		foreach ( $video_formats as $format => $format_stats ) {
			if ( is_array( $encode_checked )
				&& array_key_exists( $format, $encode_checked )
				&& $encode_checked[ $format ] == 'true'
			) {
				if ( ! $encodevideo_info[ $format ]['exists'] ) {
					$movie_extension = pathinfo( $movieurl, PATHINFO_EXTENSION );
					if ( $format_stats['type'] == 'h264'
					&& $format != 'fullres' && $movie_height <= $format_stats['height']
					&& (
						( array_key_exists( 'fullres', $encode_checked )
							&& $encode_checked['fullres'] == 'true'
						)
						|| in_array( $movie_extension, $h264extensions )
						|| $movie_height < $format_stats['height']
						)
					) {
						$encode_formats[ $format ]['status'] = 'lowres'; // skip if the resolution of an existing video is lower than the HD format
					} else {
						$encode_formats[ $format ]['status'] = 'queued';
						$encode_formats[ $format ]['name']   = $format_stats['name'];
						$encode_list[ $format ]              = $format_stats['name'];
						if ( isset( $kgvid_postmeta ) ) {
							$kgvid_postmeta['encode'][ $format ] = true;
						}
					}
					// end if video doesn't already exist
				} else {
					$encode_formats[ $format ]['status'] = 'encoded';
				}
				// end if user wants to encode format
			} else {
				$encode_formats[ $format ]['status'] = 'notchecked';
				if ( isset( $kgvid_postmeta ) ) {
					$kgvid_postmeta['encode'][ $format ] = 'notchecked';
				}
			}
		}//end loop through video formats

		if ( isset( $kgvid_postmeta ) ) {
			kgvid_save_attachment_meta( $post_id, $kgvid_postmeta );
		}

		$video_encode_queue = kgvid_get_encode_queue();
		if ( empty( $parent_id ) && $post_type == 'attachment' ) {
			$parent_id = get_post( $post_id )->post_parent;
		}
		$current_user_id = get_current_user_id();
		if ( $current_user_id == 0 && $post_type == 'attachment' ) {
			$current_user_id = get_post( $post_id )->post_author;
		}

		$queue_entry = array(
			'attachmentID'   => $post_id,
			'parent_id'      => $parent_id,
			'movieurl'       => $movieurl,
			'encode_formats' => $encode_formats,
			'movie_info'     => $movie_info,
			'user_id'        => $current_user_id,
		);
		if ( is_videopack_active_for_network() ) {
			$queue_entry['blog_id'] = get_current_blog_id();
		}

		if ( ! empty( $video_encode_queue )
			&& is_array( $video_encode_queue )
		) {
			foreach ( $video_encode_queue as $index => $entry ) {
				if ( $entry['movieurl'] == $movieurl ) {
					$already_queued = $index;
					foreach ( $entry['encode_formats'] as $format => $value ) {

						if ( $value['status'] == 'queued' && array_key_exists( $format, $encode_list ) ) {
							unset( $encode_list[ $format ] );
						} elseif (
						$value['status'] == 'queued' &&
						( array_key_exists( $format, $encode_checked ) && $encode_checked[ $format ] != 'true' )
						) {
							$queue_entry['encode_formats'][ $format ]['status'] = 'notchecked';
							$encode_list[ $format ]                             = $video_formats[ $format ]['name'];
						} elseif (
						$value['status'] == 'encoding' ||
						( array_key_exists( $format, $encode_checked ) && $encode_checked[ $format ] != 'true' )
						) {
							$queue_entry['encode_formats'][ $format ] = $entry['encode_formats'][ $format ];
						} //don't edit queue entry for anything that's currently encoding or not checked

						if ( $parent_id == 'check' ) {
							$parent_id                = $entry['parent_id'];
							$queue_entry['parent_id'] = $entry['parent_id'];
						}
					}//loop through formats

					if ( array_key_exists( 'blog_id', $entry ) ) { // reset the ids in case this is the network queue
						$queue_entry['parent_id'] = $entry['parent_id'];
						$queue_entry['blog_id']   = $entry['blog_id'];
					}
				}//url matches existing queue entry
			}//loop through queue
		}//if there's already a queue

		$imploded_encode_list = implode( ', ', $encode_list );

		if ( $already_queued !== false ) {
			$video_encode_queue[ $already_queued ] = $queue_entry;
			kgvid_save_encode_queue( $video_encode_queue );
			$existing_queue_position = strval( intval( $already_queued ) + 1 );
			if ( ! empty( $encode_list ) ) {
				/* translators: %1$s is a list of video formats. %2$s is a number. */
				$embed_display = '<strong>' . sprintf( esc_html__( '%1$s updated in existing queue entry in position %2$s.', 'video-embed-thumbnail-generator' ), esc_html( $imploded_encode_list ), esc_html( $existing_queue_position ) ) . ' </strong>';
			} else {
				/* translators: %s is a number */
				$embed_display = '<strong>' . sprintf( esc_html__( 'Video is already queued in position %s.', 'video-embed-thumbnail-generator' ), esc_html( $existing_queue_position ) ) . ' </strong>';
			}
		} elseif ( ! empty( $encode_list ) ) {
			$video_encode_queue[] = $queue_entry;
			kgvid_save_encode_queue( $video_encode_queue );
			$queue_position     = intval( key( array_slice( $video_encode_queue, -1, 1, true ) ) );
			$new_queue_position = strval( intval( $queue_position ) + 1 );
			if ( $queue_position == 0 ) {
				$embed_display = '<strong>' . esc_html__( 'Starting', 'video-embed-thumbnail-generator' ) . ' ' . esc_html( strtoupper( $options['video_app'] ) ) . '... </strong>';
			} else {
				/* translators: %1$s is a list of video formats. %2$s is a number. */
				$embed_display = '<strong>' . sprintf( esc_html__( '%1$s added to queue in position %2$s.', 'video-embed-thumbnail-generator' ), esc_html( $imploded_encode_list ), esc_html( $new_queue_position ) ) . ' </strong>';
			}
		}

		if ( empty( $encode_list ) ) {
			$embed_display = '<strong>' . esc_html__( 'Nothing to encode.', 'video-embed-thumbnail-generator' ) . '</strong>';
			$transient     = get_transient( 'kgvid_new_attachment_transient' );
			if ( is_array( $transient ) && in_array( $post_id, $transient ) ) {
				$key = array_search( $post_id, $transient );
				unset( $transient[ $key ] );
				if ( empty( $transient ) ) {
					delete_transient( 'kgvid_new_attachment_transient' );
				} else {
					set_transient( 'kgvid_new_attachment_transient', $transient, DAY_IN_SECONDS );
				}
			}
		}

		$transient = get_transient( 'kgvid_new_attachment_transient' ); // error checking to avoid race conditions when using Add From Server

		if ( is_array( $transient ) ) {

			$video_encode_queue = kgvid_get_encode_queue();

			if ( $video_encode_queue ) {
				foreach ( $video_encode_queue as $index => $entry ) {
					$key = array_search( $entry['attachmentID'], $transient );
					if ( $key !== false ) {
						unset( $transient[ $key ] );
					}
				}
			}

			if ( ! empty( $transient ) ) {
				foreach ( $transient as $id ) {
					$cron_scheduled = wp_next_scheduled( 'kgvid_cron_new_attachment', array( $id ) );
					if ( $cron_scheduled ) {
						continue;
					} else {
						wp_schedule_single_event( time() + rand( 0, 10 ), 'kgvid_cron_new_attachment', array( $id ) );
					}
				}
			}
		}

		if ( empty( $transient ) ) {
			delete_transient( 'kgvid_new_attachment_transient' );
		} else {
			set_transient( 'kgvid_new_attachment_transient', $transient, DAY_IN_SECONDS );
		}

		$arr = array(
			'embed_display' => $embed_display,
			'enqueue_data'  => array(
				'encode_list'             => $encode_list,
				'already_queued'          => $already_queued,
				'new_queue_position'      => $new_queue_position,
				'existing_queue_position' => $existing_queue_position,
			),
		);

		if ( isset( $old_blog_id ) ) {
			restore_current_blog();
		}

		return $arr;

	} else {

		$thumbnaildisplaycode = '<strong>' . esc_html__( 'Can\'t open movie file.', 'video-embed-thumbnail-generator' ) . '</strong><br />' . wp_kses_post( $movie_info['output'] );
		$arr                  = array(
			'thumbnaildisplaycode' => $thumbnaildisplaycode,
			'embed_display'        => $thumbnaildisplaycode,
			'lastthumbnumber'      => 'break',
		);

		if ( isset( $old_blog_id ) ) {
			restore_current_blog();
		}

		return $arr;

	} //can't open movie
}

function kgivd_save_singleurl_poster( $parent_id, $poster, $movieurl, $set_featured ) {
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
}//end kgivd_save_singleurl_poster()

/**
 * Escapes a string to be used as a shell argument.
 */
function kgvid_escape_argument( $argument ) {

	if ( '' === $argument || null === $argument ) {
		return '""';
	}
	if ( '\\' !== \DIRECTORY_SEPARATOR ) {
		return "'" . str_replace( "'", "'\\''", $argument ) . "'";
	}
	if ( str_contains( $argument, "\0" ) ) {
		$argument = str_replace( "\0", '?', $argument );
	}
	if ( ! preg_match( '/[\/()%!^"<>&|\s]/', $argument ) ) {
		return $argument;
	}
	$argument = preg_replace( '/(\\\\+)$/', '$1$1', $argument );

	return '"' . str_replace( array( '"', '^', '%', '!', "\n" ), array( '""', '"^^"', '"^%"', '"^!"', '!LF!' ), $argument ) . '"';
}

function kgvid_encode_videos() {

	$options = kgvid_get_options();

	$embed_display      = '';
	$video              = array();
	$video_key          = '';
	$queued_format      = '';
	$encoding           = array();
	$start_encoding     = array();
	$encode_array       = array();
	$uploads            = wp_upload_dir();
	$movie_info         = array(
		'width'  => '',
		'height' => '',
	);
	$video_encode_queue = kgvid_get_encode_queue();
	$video_formats      = kgvid_video_formats();

	if ( ! empty( $video_encode_queue )
		&& is_array( $video_encode_queue )
		&& $options['queue_control'] == 'play'
	) {

		$x = $options['simultaneous_encodes'];

		foreach ( $video_encode_queue as $video_key => $queue_entry ) { // search the queue for any encoding video
			foreach ( $queue_entry['encode_formats'] as $format => $value ) {

				if ( $value['status'] === 'encoding' ) {

					$video[]    = $video_encode_queue[ $video_key ];
					$encoding[] = array(
						'key'   => $video_encode_queue[ $video_key ],
						'value' => $value,
					);
					--$x;

					if ( 0 == $x ) {

						break 2;

					}
				}
			}
		}

		if ( count( $encoding ) < intval( $options['simultaneous_encodes'] ) ) {

			$x = count( $encoding );

			foreach ( $video_encode_queue as $video_key => $queue_entry ) {

				foreach ( $queue_entry['encode_formats'] as $format => $value ) {

					if ( $value['status'] == 'queued' ) {

						if ( array_key_exists( 'blog_id', $queue_entry ) ) {

							switch_to_blog( $queue_entry['blog_id'] );
							$blog_options = get_option( 'kgvid_video_embed_options' );
							restore_current_blog();

							if ( is_array( $blog_options ) && array_key_exists( 'queue_control', $blog_options ) && $blog_options['queue_control'] == 'pause' ) {

								break; // don't start encoding if the local queue is paused

							}
						}

						$start_encoding[] = array(
							'video_key'     => $video_key,
							'queued_format' => $format,
						);

						++$x;
						if ( $x == intval( $options['simultaneous_encodes'] ) ) {

							break 2;

						}
					}
				}
			}
		}

		if ( ! empty( $start_encoding ) ) {

			wp_schedule_single_event( time() + 60, 'kgvid_cron_queue_check' );

			foreach ( $start_encoding as $key => $queue_info ) {

				$video_key     = $queue_info['video_key'];
				$queued_format = $queue_info['queued_format'];
				$video         = $video_encode_queue[ $video_key ];

				if ( array_key_exists( 'blog_id', $video ) ) {
					switch_to_blog( $video['blog_id'] );
				}

				$moviefilepath = '';
				if ( get_post_type( $video['attachmentID'] ) == 'attachment' ) {

					$moviefilepath = get_attached_file( $video['attachmentID'] );

				} elseif ( empty( $moviefilepath ) || ! file_exists( $moviefilepath ) ) {

					$moviefilepath = str_replace( ' ', '%20', esc_url_raw( $video['movieurl'] ) );

				}

				$movie_info       = $video['movie_info'];
				$encodevideo_info = kgvid_encodevideo_info( $video['movieurl'], $video['attachmentID'] );
				$logfile          = '';
				$process_pid      = '';
				$aac_array        = kgvid_aac_encoders();
				$aac_available    = false;

				foreach ( $aac_array as $aaclib ) { // cycle through available AAC encoders in order of quality
					if ( $movie_info['configuration'][ $aaclib ] == 'true' ) {
						$aac_available = true;
						break;
					}
				}

				foreach ( $video_formats as $format => $format_stats ) {

					if ( $queued_format === $format ) {

						$encode_dimensions = kgvid_set_encode_dimensions( $movie_info, $format_stats );

						if ( $format_stats['type'] == 'h264' ) {
							if ( $movie_info['configuration']['libx264'] == 'true' && $aac_available ) {

								if ( ! $encodevideo_info[ $format ]['exists'] || ( $encodevideo_info['sameserver'] && filesize( $encodevideo_info[ $format ]['filepath'] ) < 24576 ) ) {

									$encode_array = kgvid_generate_encode_array( $moviefilepath, $encodevideo_info[ $format ]['filepath'], $movie_info, $queued_format, $encode_dimensions['width'], $encode_dimensions['height'], $movie_info['rotate'] );
									//end if file doesn't already exist
								} else {
									/* translators: %s is the name of a video format */
									$embed_display = sprintf( esc_html__( '%s already encoded', 'video-embed-thumbnail-generator' ), $format_stats['name'] );
									$video_encode_queue[ $video_key ]['encode_formats'][ $format ]['status'] = 'Encoding Complete';

								}
								break; // don't bother looping through the rest if we already found the format
								//end if the x264 library and an aac library is enabled
							} else {
								/* translators: %s is the name of the video encoding application (usually FFmpeg). */
								$lastline = sprintf( esc_html__( '%s missing library libx264 required for H.264 encoding', 'video-embed-thumbnail-generator' ), esc_html( strtoupper( $options['video_app'] ) ) );

								if ( ! $aac_available ) {

									array_pop( $aac_array ); // get rid of the built-in "aac" encoder since it can't really be "installed"
									$lastaac   = array_pop( $aac_array );
									$aac_list  = implode( ', ', $aac_array );
									$aac_list .= ', ' . esc_html__( 'or', 'video-embed-thumbnail-generator' ) . ' ' . $lastaac;
									/* translators: %s is the name of an AAC encoding library */
									$lastline .= ' ' . sprintf( esc_html__( 'and missing an AAC encoding library. Please install and enable libx264 and %s', 'video-embed-thumbnail-generator' ), $aac_list );

								}

								$video_encode_queue[ $video_key ]['encode_formats'][ $format ]['status']   = 'error';
								$video_encode_queue[ $video_key ]['encode_formats'][ $format ]['lastline'] = $lastline;
								$embed_display = esc_html__( 'Missing libraries', 'video-embed-thumbnail-generator' );

							}
						} //if it's H.264

						if (
							$format_stats['type'] === 'webm'
							|| $format_stats['type'] === 'ogv'
							|| $format_stats['type'] === 'vp9'
						) { // if it's not H.264 they both work essentially the same

							if (
								! $encodevideo_info[ $queued_format ]['exists']
								|| ( $encodevideo_info['sameserver']
								&& filesize( $encodevideo_info[ $queued_format ]['filepath'] ) < 24576 )
							) {

								if ( $movie_info['configuration']['libvorbis'] == 'true'
									&& $movie_info['configuration'][ $video_formats[ $queued_format ]['vcodec'] ] == 'true'
								) {

									$encode_array = kgvid_generate_encode_array( $moviefilepath, $encodevideo_info[ $queued_format ]['filepath'], $movie_info, $queued_format, $encode_dimensions['width'], $encode_dimensions['height'], $movie_info['rotate'] );
									/* translators: %s is the name of a video format */
									$embed_display = sprintf( esc_html__( 'Encoding %s', 'video-embed-thumbnail-generator' ), esc_html( $video_formats[ $queued_format ]['name'] ) );
									//end if the necessary libraries are enabled
								} else {

									$missing_libraries = array();

									if ( $movie_info['configuration']['libvorbis'] == 'false' ) {

										$missing_libraries[] = 'libvorbis';

									}

									if ( $movie_info['configuration'][ $video_formats[ $queued_format ]['vcodec'] ] == 'false' ) {

										$missing_libraries[] = $video_formats[ $queued_format ]['vcodec'];

									}
									/* translators: %1$s is the name of the video encoding application (usually FFmpeg). %2$s is a list of video encoding libraries. */
									$lastline = sprintf( esc_html__( '%1$s missing library %2$s required for %3$s encoding.', 'video-embed-thumbnail-generator' ), esc_html( strtoupper( $options['video_app'] ) ), esc_html( implode( ', ', $missing_libraries ) ), esc_html( $video_formats[ $queued_format ]['name'] ) );

									$video_encode_queue[ $video_key ]['encode_formats'][ $queued_format ]['status']   = 'error';
									$video_encode_queue[ $video_key ]['encode_formats'][ $queued_format ]['lastline'] = $lastline;
									$embed_display = esc_html__( 'Missing libraries', 'video-embed-thumbnail-generator' );

								}
								//end if file doesn't already exist
							} else {
								/* translators: %s is the name of a video format */
								$embed_display = sprintf( esc_html__( '%s already encoded.', 'video-embed-thumbnail-generator' ), esc_html( $video_formats[ $queued_format ]['name'] ) );

							}
						} elseif ( ! $encodevideo_info[ $queued_format ]['exists'] ) { // a format type we haven't accounted for yet
								$encode_array = kgvid_generate_encode_array( $moviefilepath, $encodevideo_info[ $queued_format ]['filepath'], $movie_info, $queued_format, $encode_dimensions['width'], $encode_dimensions['height'], $movie_info['rotate'] );
								/* translators: %s is the name of a video format */
								$embed_display = sprintf( esc_html__( 'Encoding %s', 'video-embed-thumbnail-generator' ), esc_html( $video_formats[ $queued_format ]['name'] ) );
						}
					}//if format is chosen for encoding

				}//format loop

				if ( ! empty( $encode_array ) ) {

					$logfile = $uploads['path'] . '/' . sanitize_file_name( str_replace( ' ', '_', $encodevideo_info['moviefilebasename'] ) . '_' . $queued_format . '_' . sprintf( '%04s', mt_rand( 1, 1000 ) ) . '_encode.txt' );

					$commandline   = implode( ' ', array_map( 'kgvid_escape_argument', $encode_array ) ); // escape each argument in the encode array
					$commandline   = $commandline . ' > "${:LOGFILE}" 2>&1';
					$shell_process = FFmpeg_Process::fromShellCommandline( $commandline );
					$shell_process->start( null, array( 'LOGFILE' => $logfile ) );

					sleep( 1 );

					$process_pid = $shell_process->getPID();

					$args = array( 'logfile' => $logfile );
					wp_schedule_single_event( time() + 600, 'kgvid_cleanup_generated_logfiles', $args );
					if ( ! wp_next_scheduled( 'kgvid_cleanup_queue', array( 'scheduled' ) ) ) {
						wp_schedule_single_event( time() + DAY_IN_SECONDS, 'kgvid_cleanup_queue', array( 'scheduled' ) );
					}

					$video_encode_queue[ $video_key ]['encode_formats'][ $queued_format ] = array(
						'name'          => $video_formats[ $queued_format ]['name'],
						'status'        => 'encoding',
						'filepath'      => $encodevideo_info[ $queued_format ]['filepath'],
						'url'           => $encodevideo_info[ $queued_format ]['url'],
						'logfile'       => $logfile,
						'PID'           => $process_pid,
						'started'       => time(),
						'encode_string' => trim( implode( ' ', $encode_array ) ),
					);

				} //end if there's stuff to encode

				if ( array_key_exists( 'blog_id', $video ) ) {
					restore_current_blog();
				}
			}//end loop

			kgvid_save_encode_queue( $video_encode_queue );

		} else {
			$video_key = '';
		}
	} //if there's a queue

	$arr = array(
		'embed_display' => '<strong>' . $embed_display . '</strong>',
		'video_key'     => $video_key,
		'format'        => $queued_format,
	);

	return $arr;
}

function kgvid_test_ffmpeg() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );

	$options       = kgvid_get_options();
	$uploads       = wp_upload_dir();
	$video_formats = kgvid_video_formats();
	$suffix        = $video_formats[ $options['sample_format'] ]['suffix'];

	if ( array_key_exists( 'encode_array', $options ) && is_array( $options['encode_array'] ) ) {

		$process = new FFmpeg_process( $options['encode_array'] );

		try {
			$process->run();
			$output = $process->getErrorOutput();
		} catch ( \Exception $e ) {
			$output = 'Error: ' . $e->getMessage();
		}

		$arr['output'] = esc_textarea( $output );

		if ( file_exists( $uploads['path'] . '/sample-video-h264' . $suffix ) ) {

			if ( $options['moov'] == 'qt-faststart' || $options['moov'] == 'MP4Box' ) {
				$arr['output'] .= kgvid_fix_moov_atom( $uploads['path'] . '/sample-video-h264' . $suffix );
			}

			if ( ! empty( $options['ffmpeg_watermark']['url'] ) ) {

				wp_mkdir_p( $uploads['path'] . '/thumb_tmp' );

				$watermark_test = kgvid_process_thumb(
					$uploads['path'] . '/sample-video-h264' . $suffix,
					$uploads['path'] . '/thumb_tmp/watermark_test.jpg'
				);

				kgvid_schedule_cleanup_generated_files( 'thumbs' );

				if ( file_exists( $uploads['path'] . '/thumb_tmp/watermark_test.jpg' ) ) {
					$arr['watermark_preview'] = $uploads['url'] . '/thumb_tmp/watermark_test.jpg';
				}
			}

			wp_delete_file( $uploads['path'] . '/sample-video-h264' . $suffix );

		}
	} else {
		/* translators: %1$s is the name of the video encoding application (usually FFmpeg). %2$s is the path to the application. */
		$arr['output'] = sprintf( esc_html__( '%1$s is not executing correctly at %2$s. You can embed existing videos and make thumbnails with compatible browsers, but video encoding is not possible without %1$s.', 'video-embed-thumbnail-generator' ), esc_html( strtoupper( $options['video_app'] ) ), esc_html( $options['app_path'] ) );
	}

	wp_send_json( $arr );
}
add_action( 'wp_ajax_kgvid_test_ffmpeg', 'kgvid_test_ffmpeg' );

function kgvid_test_ffmpeg_thumb_watermark() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );

	$options = get_option( 'kgvid_video_embed_options' );
	if ( $options['sample_rotate'] != false ) {
		$sample_video_path = plugin_dir_path( __DIR__ ) . 'images/sample-video-rotated-h264.mp4';
	} else {
		$sample_video_path = plugin_dir_path( __DIR__ ) . 'images/sample-video-h264.mp4';
	}

	$thumb = kgvid_make_thumbs( 'singleurl', $sample_video_path, 1, 1, 1, 0, true, 'generate' );

	if ( array_key_exists( 'real_thumb_url', $thumb ) ) {
		echo esc_url( $thumb['real_thumb_url'] );
	} else {
		echo false;
	}

	die;
}
add_action( 'wp_ajax_kgvid_test_ffmpeg_thumb_watermark', 'kgvid_test_ffmpeg_thumb_watermark' );

function kgvid_encode_progress() {

	$video_encode_queue  = kgvid_get_encode_queue();
	$encode_progress     = array();
	$encoding_time_array = array();
	$time_to_wait        = 10000; // default 10 seconds between checking encode progress

	if ( is_array( $video_encode_queue ) ) { // if there is an encode queue

		foreach ( $video_encode_queue as $video_key => $video_entry ) { // loop through encode queue

			if ( array_key_exists( 'blog_id', $video_entry ) ) {
				$blog_id = $video_entry['blog_id'];
				switch_to_blog( $blog_id );
			} else {
				$blog_id = false;
			}

			foreach ( $video_entry['encode_formats'] as $format => $format_info ) { // loop through formats

				$embed_display = '';

				if ( is_array( $format_info ) && array_key_exists( 'logfile', $format_info ) ) {

					$percent_done    = '';
					$time_remaining  = '';
					$lastline        = '';

					if ( $video_entry['encode_formats'][ $format ]['status'] != 'Encoding Complete' ) {

						clearstatcache(); // make sure the existence of the logfile isn't cached

						if ( is_file( $format_info['logfile'] ) ) {

							$fp     = fopen( $format_info['logfile'], 'r' );
							$c      = '';
							$read   = '';
							$offset = -1;
							$lines  = 2;
							if ( substr( strtoupper( PHP_OS ), 0, 3 ) === 'WIN' ) {
								$lines = 4;
							}
							while ( $lines && fseek( $fp, $offset, SEEK_END ) >= 0 ) {
								$c = fgetc( $fp );
								if ( $c == "\n" || $c == "\r" ) {
									--$lines;
								}
								$read .= $c;
								--$offset;
							}
							fclose( $fp );
							$lastline = strrev( rtrim( $read, "\n\r" ) );

							$time_matches    = '';
							$video_matches   = '';
							$libx264_matches = '';
							$fps_matches     = '';
							$fps_match       = '';

							preg_match( '/time=(.*?) /', $lastline, $time_matches );

							if ( is_array( $time_matches )
							&& array_key_exists( 1, $time_matches ) != true
							) { // if something other than the regular FFmpeg encoding output check for these
								preg_match( '/video:(.*?) /', $lastline, $video_matches );
								preg_match( '/libx264 (.*?) /', $lastline, $libx264_matches );
								preg_match( '/aac (.*?) /', $lastline, $aac_matches );
								$queue_match = preg_match( '/queue on closing/', $lastline );
							}

							if ( is_array( $time_matches )
								&& array_key_exists( 1, $time_matches ) == true
							) { // still encoding

								if ( strpos( $time_matches[1], ':' ) !== false ) {
									$current_hours   = intval( substr( $time_matches[1], -11, 2 ) );
									$current_minutes = intval( substr( $time_matches[1], -8, 2 ) );
									$current_seconds = intval( substr( $time_matches[1], -5, 2 ) );
									$current_seconds = ( $current_hours * 60 * 60 ) + ( $current_minutes * 60 ) + $current_seconds;
								} else {
									$current_seconds = $time_matches[1];
								}

								$percent_done_text = '';
								$percent_done      = intval( $current_seconds ) / intval( $video_entry['movie_info']['duration'] );
								$time_elapsed      = time() - $format_info['started'];
								if ( $percent_done != 0 ) {
									$time_remaining = round( $time_elapsed / $percent_done ) - $time_elapsed;
									if ( $time_remaining < 0 ) {
										$time_remaining = 0;
									}
								} else {
									$time_remaining = 60;
								}
								$percent_done = round( $percent_done * 100 );
								if ( $percent_done >= 20 ) {
									$percent_done_text = strval( $percent_done ) . '%';
								}

								preg_match( '/fps=\s?(.*?) /', $lastline, $fps_matches );
								if ( is_array( $fps_matches )
									&& array_key_exists( 1, $fps_matches ) == true
									&& $fps_matches[1] != 0
								) {
									$fps_match = $fps_matches[1];
								} else {
									$fps_match = 10;
								}

								wp_schedule_single_event( time() + 60, 'kgvid_cron_queue_check' );

								$encoding_time_array = array(
									'current_seconds' => $current_seconds,
									'duration'        => esc_html( $video_entry['movie_info']['duration'] ),
									'elapsed'         => $time_elapsed,
									'remaining'       => $time_remaining,
									'fps'             => esc_html( $fps_match ),
									'percent_done'    => $percent_done,
								);
								$encoding_time_json  = wp_json_encode( $encoding_time_array );

								$embed_display = '<strong data-status="encoding">' . esc_html__( 'Encoding', 'video-embed-thumbnail-generator' ) . '</strong><br /><div class="kgvid_meter"><div class="kgvid_meter_bar" data-encoding_time="' . esc_attr( $encoding_time_json ) . '" style="width:' . esc_attr( $percent_done ) . '%;"><div class="kgvid_meter_text">' . esc_html( $percent_done_text ) . '</div></div></div>';

								if ( current_user_can( 'encode_videos' ) && $format_info['PID'] ) {
									$embed_display .= '<button class="kgvid_cancel_button" type="button" id="attachments-' . esc_attr( $video_entry['attachmentID'] ) . '-kgflashmediaplayer-cancelencode" onclick="kgvid_cancel_encode(\'' . esc_attr( $video_entry['attachmentID'] ) . '\', \'' . esc_attr( $video_key ) . '\', \'' . esc_attr( $format ) . '\', \'' . esc_attr( $blog_id ) . '\');">' . esc_html__( 'Cancel', 'video-embed-thumbnail-generator' ) . '</button>';
								}

								$embed_display .= '<div class="kgvid_encoding_small_text"><small>' . esc_html__( 'Elapsed:', 'video-embed-thumbnail-generator' ) . ' ' . esc_html( date( 'H:i:s', $time_elapsed ) ) . ' ' . esc_html__( 'Remaining:', 'video-embed-thumbnail-generator' ) . ' ' . esc_html( date( 'H:i:s', $time_remaining ) ) . ' ' . esc_html_x( 'FPS:', 'Frames per second', 'video-embed-thumbnail-generator' ) . ' ' . esc_html( $fps_match ) . '</small></div>';
							} elseif ( time() - $format_info['started'] < 10 || ( file_exists( $format_info['filepath'] ) && time() - filemtime( $format_info['filepath'] ) < 10 ) ) { // not enough time has passed, so check again later
								$embed_display = '<strong data-status="encoding">' . esc_html__( 'Encoding', 'video-embed-thumbnail-generator' ) . '</strong>';
								$time_to_wait  = 1000;
								wp_schedule_single_event( time() + 60, 'kgvid_cron_queue_check' );
							} elseif (
								( is_array( $video_matches ) && array_key_exists( 1, $video_matches ) == true )
								|| ( is_array( $libx264_matches ) && array_key_exists( 1, $libx264_matches ) == true )
								|| ( is_array( $aac_matches ) && array_key_exists( 1, $aac_matches ) == true )
								|| ( $queue_match )
							) { // encoding complete

								$percent_done   = 100;
								$ended          = filemtime( $format_info['logfile'] );
								$time_elapsed   = $ended - $format_info['started'];
								$time_remaining = '0';
								$fps_match      = '10';
								if ( is_array( $libx264_matches ) && array_key_exists( 1, $libx264_matches ) ) {
									$moov_output = kgvid_fix_moov_atom( $format_info['filepath'] );
								} //fix the moov atom if the file was encoded by libx264
								$video_encode_queue[ $video_key ]['encode_formats'][ $format ]['status']   = 'Encoding Complete';
								$video_encode_queue[ $video_key ]['encode_formats'][ $format ]['ended']    = $ended;
								$video_encode_queue[ $video_key ]['encode_formats'][ $format ]['lastline'] = wp_kses_post( $lastline );

								kgvid_save_encode_queue( $video_encode_queue );

								if ( $format != 'fullres' && file_exists( $format_info['filepath'] ) ) {

									// insert the encoded video as a child attachment of the original video, or post if external original
									if ( get_post_type( $video_entry['attachmentID'] ) == 'attachment' ) { // if the original video is in the database set that as parent
										$parent_id = $video_entry['attachmentID'];
										$title     = get_the_title( $video_entry['attachmentID'] );
									} else { // otherwise set the post as the parent
										$parent_id     = $video_entry['parent_id'];
										$sanitized_url = kgvid_sanitize_url( $video_entry['movieurl'] );
										$title         = $sanitized_url['basename'];
									}

									$user_ID  = get_current_user_id();
									$video_id = kgvid_url_to_id( $video_encode_queue[ $video_key ]['encode_formats'][ $format ]['url'] );
									if ( ! $video_id ) {
										$wp_filetype = wp_check_filetype( basename( $format_info['filepath'] ), null );

										$title .= ' ' . $video_entry['encode_formats'][ $format ]['name'];

										if ( $user_ID == 0 ) {
											$parent_post = get_post( $parent_id );
											$user_ID     = $parent_post->post_author;
										}

										$attachment = array(
											'guid'         => $video_entry['encode_formats'][ $format ]['url'],
											'post_mime_type' => $wp_filetype['type'],
											'post_title'   => $title,
											'post_content' => '',
											'post_status'  => 'inherit',
											'post_author'  => $user_ID,
										);

										$new_id = wp_insert_attachment( $attachment, $format_info['filepath'], $parent_id );
										// you must first include the image.php file
										// for the function wp_generate_attachment_metadata() to work and media.php for wp_read_video_metadata() in WP 3.6+
										require_once ABSPATH . 'wp-admin/includes/image.php';
										require_once ABSPATH . 'wp-admin/includes/media.php';
										$attach_data = wp_generate_attachment_metadata( $new_id, $format_info['filepath'] );
										wp_update_attachment_metadata( $new_id, $attach_data );
										update_post_meta( $new_id, '_kgflashmediaplayer-format', $format );
										if ( get_post_type( $video_entry['attachmentID'] ) == false ) {
											update_post_meta( $new_id, '_kgflashmediaplayer-externalurl', $video_entry['movieurl'] );
										} //connect new video to external url
									}
								}

								// finish inserting attachment

								$embed_display = '<strong data-status="Encoding Complete">' . esc_html__( 'Encoding Complete', 'video-embed-thumbnail-generator' ) . '</strong>';

								$next_video = kgvid_encode_videos(); // start the next queued video

								if ( empty( $next_video['format'] )
									|| $next_video['video_key'] != $video_key
								) {

									if ( $video_encode_queue[ $video_key ]['encode_formats']['fullres']['status'] == 'Encoding Complete' ) {
										$new_movie_url = kgvid_replace_video( $video_key, 'fullres' );
									} //fullres encoding complete

									$options = kgvid_get_options();

									if ( $options['auto_publish_post'] == true ) {

										$post_parent_queue = $video_encode_queue;
										$publish_post      = true;

										foreach ( $post_parent_queue as $possible_video_key => $possible_parent_video ) {

											if ( $possible_parent_video['parent_id'] == $video_encode_queue[ $video_key ]['parent_id'] ) {

												foreach ( $possible_parent_video['encode_formats'] as $possible_format => $possible_format_info ) {

													if ( $possible_format_info['status'] == 'queued' || $possible_format_info['status'] == 'encoding' ) {

														$publish_post = false;

													}//a format for this video is not complete

												}//loop through the formats of the video

											}//if the encode queue has a video with the same parent ID

										}//loop through a copy of the encode queue

										if ( $publish_post ) {

											wp_update_post(
												array(
													'ID' => $video_encode_queue[ $video_key ]['parent_id'],
													'post_status' => 'publish',
												)
											);

										}
									}//auto publish post is on

									$embed_display = '<strong data-status="Encoding Complete">' . esc_html__( 'Encoding Complete', 'video-embed-thumbnail-generator' ) . '</strong>';

								}//all formats for this video are complete

							} else { // there was an unexpected output and the encoded file hasn't been modified in more than 10 seconds

								if ( strpos( $lastline, 'signal 15' ) !== false ) { // if the encoding was intentionally canceled
									$lastline = esc_html__( 'Encoding was canceled.', 'video-embed-thumbnail-generator' );
								}
								$video_encode_queue[ $video_key ]['encode_formats'][ $format ]['status'] = 'canceled';

							}
						} else {
							$video_encode_queue[ $video_key ]['encode_formats'][ $format ]['status'] = 'error';
							$lastline = esc_html__( 'No log file', 'video-embed-thumbnail-generator' );
						}

						if ( $video_encode_queue[ $video_key ]['encode_formats'][ $format ]['status'] === 'error'
							|| $video_encode_queue[ $video_key ]['encode_formats'][ $format ]['status'] === 'canceled'
						) {
							$video_encode_queue[ $video_key ]['encode_formats'][ $format ]['lastline'] = addslashes( $lastline );

							$embed_display = '<strong data-status="Error">' . esc_html__( 'Error:', 'video-embed-thumbnail-generator' ) . ' </strong><span class="kgvid_warning">' . esc_html( $lastline ) . '.</span>';

							if ( $video_encode_queue[ $video_key ]['encode_formats'][ $format ]['status'] == 'error' ) {

								$options = kgvid_get_options();

								if ( ( $options['error_email'] != 'nobody'
										|| ( array_key_exists( 'network_error_email', $options ) && $options['network_error_email'] != 'nobody' )
									)
									&& ! array_key_exists( 'mailed', $video_encode_queue[ $video_key ]['encode_formats'][ $format ] )
								) {
									$mailed     = false;
									$blog_title = get_bloginfo();
									$admin_url  = get_admin_url();
									$user       = false;
									$super_user = false;

									if ( $options['error_email'] == 'encoder'
										|| ( array_key_exists( 'network_error_email', $options ) && $options['network_error_email'] == 'encoder' )
									) {
										if ( ! empty( $video_encode_queue[ $video_key ]['user_id'] ) ) {
											$user = get_userdata( $video_encode_queue[ $video_key ]['user_id'] );
										}
									} elseif ( is_numeric( $options['error_email'] ) ) {
										$user = get_userdata( $options['error_email'] );
									}

									if ( array_key_exists( 'network_error_email', $options ) && is_numeric( $options['network_error_email'] ) ) {
										$super_user = get_userdata( $options['network_error_email'] );
									}

									$headers = array( 'Content-Type: text/html; charset=UTF-8' );

									if ( $user instanceof WP_User ) {
										$mailed = wp_mail(
											$user->user_email,
											esc_html__( 'Video Encode Error', 'video-embed-thumbnail-generator' ),
											/* translators: %1$s is the error message, %2$s is the filename, %3$s is the website name. */
											sprintf( esc_html__( 'Error message "%1$s" while encoding video file %2$s at %3$s', 'video-embed-thumbnail-generator' ), esc_html( $video_encode_queue[ $video_key ]['encode_formats'][ $format ]['lastline'] ), esc_html( basename( $video_encode_queue[ $video_key ]['encode_formats'][ $format ]['filepath'] ) ), '<a href="' . esc_url( $admin_url . '/tools.php?page=kgvid_video_encoding_queue' ) . '">' . esc_html( $blog_title ) . '</a>' ),
											$headers
										);
									}

									if ( $super_user instanceof WP_User && $super_user != $user ) {
										$network_info = get_current_site();
										$mailed       = wp_mail(
											$super_user->user_email,
											esc_html__( 'Video Encode Error', 'video-embed-thumbnail-generator' ),
											/* translators: %1$s is the error message, %2$s is the filename, %3$s is the website name. */
											sprintf( esc_html__( 'Error message "%1$s" while encoding video file %2$s at %3$s', 'video-embed-thumbnail-generator' ), esc_html( $video_encode_queue[ $video_key ]['encode_formats'][ $format ]['lastline'] ), esc_html( basename( $video_encode_queue[ $video_key ]['encode_formats'][ $format ]['filepath'] ) ), '<a href="' . esc_url( $admin_url . '/tools.php?page=kgvid_video_encoding_queue' ) . '">' . esc_html( $blog_title ) . '</a>' ) . ' ' . sprintf( esc_html_x( 'on the %s network.', 'on the [name of multisite network] network.', 'video-embed-thumbnail-generator' ), '<a href="' . network_admin_url( 'settings.php?page=kgvid_network_video_encoding_queue' ) . '">' . esc_html( $network_info->site_name ) . '</a>' ),
											$headers
										);
									}

									if ( $mailed ) {
										$video_encode_queue[ $video_key ]['encode_formats'][ $format ]['mailed'] = true;
									}
								}
							}

							kgvid_save_encode_queue( $video_encode_queue );

							$next_video = kgvid_encode_videos(); // start the next queued video

						}
					}//if not completed

				} elseif ( is_array( $format_info )
					&& array_key_exists( 'status', $format_info )
					&& $format_info['status'] !== 'notchecked'
				) {
					$embed_display = "<strong data-status='" . esc_attr( $video_encode_queue[ $video_key ]['encode_formats'][ $format ]['status'] ) . "'>" . esc_html( ucfirst( $video_encode_queue[ $video_key ]['encode_formats'][ $format ]['status'] ) ) . '</strong>';
				}

				if ( ! empty( $embed_display ) ) {
					$encode_progress[ $video_key ][ $format ] = array(
						'embed_display'       => $embed_display,
						'time_to_wait'        => $time_to_wait,
						'encoding_time_array' => $encoding_time_array,
					);
				}
			} //end loop through encode formats

			if ( $blog_id ) {
				restore_current_blog();
			}
		} //end loop through encode queue
	} //end if there's an encode queue

	return $encode_progress;
}
add_action( 'kgvid_cron_queue_check', 'kgvid_encode_progress' );

function kgvid_replace_video( $video_key, $format ) {

	$options            = kgvid_get_options();
	$video_encode_queue = kgvid_get_encode_queue();
	$video_formats      = kgvid_video_formats();
	$encoded_filename   = $video_encode_queue[ $video_key ]['encode_formats'][ $format ]['filepath'];
	$video_id           = $video_encode_queue[ $video_key ]['attachmentID'];
	$replace            = true;

	if ( ! empty( $video_encode_queue )
		&& is_array( $video_encode_queue )
	) {
		foreach ( $video_encode_queue[ $video_key ]['encode_formats'] as $encoding_format => $value ) { // make sure there isn't another encoding process using this original video
			if ( $value['status'] == 'encoding'
				|| $value['status'] == 'queued'
			) {
				$replace = false;
			}
		}//end loop
	}

	if ( $replace == false ) {
		wp_schedule_single_event( time() + 60, 'kgvid_cron_replace_video_check', array( $video_key, $format ) );
		return $video_encode_queue[ $video_key ]['movieurl'];
	} else {

		$original_filename = get_attached_file( $video_id );
		$path_parts        = pathinfo( $original_filename );

		if ( $path_parts['extension'] !== $video_formats[ $format ]['extension'] ) {
			$new_filename                                 = str_replace( '-fullres', '', $encoded_filename );
			$sanitized_url                                = kgvid_sanitize_url( $video_encode_queue[ $video_key ]['movieurl'] );
			$new_url                                      = $sanitized_url['noextension'] . '.' . $video_formats[ $format ]['extension'];
			$video_encode_queue[ $video_key ]['movieurl'] = $new_url;

			global $wpdb;
			// find posts that use the old filename
			$results = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT ID
					FROM $wpdb->posts
					WHERE `post_content` LIKE %s",
					'%' . $sanitized_url['basename'] . '.' . $path_parts['extension'] . '%'
				)
			);
			if ( $results ) {
				foreach ( $results as $result ) {
					$post               = get_post( $result->ID );
					$post->post_content = str_replace( $sanitized_url['noextension'] . '.' . $path_parts['extension'], $new_url, $post->post_content );
					wp_update_post( $post );
				}
			}
		} else {
			if ( strpos( $original_filename, 'http' ) !== false ) {
				$original_filename = str_replace( '-fullres', '', $encoded_filename );
			}
			$new_filename = $original_filename;
			$new_url      = $video_encode_queue[ $video_key ]['movieurl'];
		}

		if ( file_exists( $encoded_filename ) ) {
			if ( kgvid_can_write_direct( dirname( $new_filename ) ) ) {
				global $wp_filesystem;
				$wp_filesystem->move( $encoded_filename, $new_filename, true );
			}
			if ( get_post_mime_type( $video_id ) === 'image/gif' ) {
				$was_gif      = true;
				$gif_metadata = wp_get_attachment_metadata( $video_id );
				if ( array_key_exists( 'sizes', $gif_metadata ) ) {
					$uploads = wp_upload_dir();
					foreach ( $gif_metadata['sizes'] as $size => $info ) {
						$size_filename = $uploads['path'] . '/' . $info['file'];
						if ( file_exists( $size_filename ) ) {
							wp_delete_file( $size_filename );
						}
					}
				}
			}
		}
		$video_encode_queue[ $video_key ]['encode_formats'][ $format ]['url'] = $new_url;

		if ( $video_encode_queue[ $video_key ]['movie_info']['rotate'] != '' ) { // if the video needed rotating
			$video_encode_queue[ $video_key ]['movie_info']['rotate'] = ''; // clear rotation because we've just fixed that problem
			$kgvid_postmeta           = kgvid_get_attachment_meta( $video_encode_queue[ $video_key ]['attachmentID'] );
			$kgvid_postmeta['rotate'] = '';
			kgvid_save_attachment_meta( $video_encode_queue[ $video_key ]['attachmentID'], $kgvid_postmeta );

			$setwidth  = $video_encode_queue[ $video_key ]['movie_info']['width'];
			$setheight = $video_encode_queue[ $video_key ]['movie_info']['height'];
			if ( intval( $setwidth ) > intval( $setheight ) ) {  // swap the width and height meta if it hasn't already been done
				$kgvid_postmeta['actualwidth']                           = $video_encode_queue[ $video_key ]['movie_info']['height'];
				$kgvid_postmeta['width']                                 = $setheight;
				$video_encode_queue[ $video_key ]['movie_info']['width'] = $video_encode_queue[ $video_key ]['movie_info']['height'];

				$kgvid_postmeta['actualheight']                           = $video_encode_queue[ $video_key ]['movie_info']['width'];
				$kgvid_postmeta['height']                                 = $setwidth;
				$video_encode_queue[ $video_key ]['movie_info']['height'] = $video_encode_queue[ $video_key ]['movie_info']['width'];
			}

			kgvid_save_attachment_meta( $video_encode_queue[ $video_key ]['attachmentID'], $kgvid_postmeta );
		}

		kgvid_save_encode_queue( $video_encode_queue );

		// you must first include the image.php file
		// for the function wp_generate_attachment_metadata() to work and media.php for wp_read_video_metadata() in WP 3.6+
		require_once ABSPATH . 'wp-admin/includes/image.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		$attach_data = wp_generate_attachment_metadata( $video_id, $new_filename );
		wp_update_attachment_metadata( $video_id, $attach_data );
		update_attached_file( $video_id, $new_filename );

		$new_mime    = wp_check_filetype( $new_filename );
		$post_update = array(
			'ID'             => $video_id,
			'post_mime_type' => $new_mime['type'],
		);
		wp_update_post( $post_update );

		$kgvid_postmeta                      = kgvid_get_attachment_meta( $video_id );
		$kgvid_postmeta['original_replaced'] = $options['replace_format'];
		kgvid_save_attachment_meta( $video_id, $kgvid_postmeta );

		if ( $options['auto_thumb'] === true
			&& isset( $was_gif )
		) {
			kgvid_cron_new_attachment_handler( $video_id, 'thumbs' );
		}

		return $new_url;

	}//end replace true
}
add_action( 'kgvid_cron_replace_video_check', 'kgvid_replace_video', 10, 2 );

function kgvid_clear_completed_queue( $type, $scope = 'site' ) {

	$user_ID = get_current_user_id();

	$video_encode_queue = kgvid_get_encode_queue();

	if ( ! empty( $video_encode_queue )
		&& is_array( $video_encode_queue )
	) {

		$video_encode_queue  = array_reverse( $video_encode_queue );
		$keep                = array();
		$cleared_video_queue = array();

		foreach ( $video_encode_queue as $video_key => $queue_entry ) {

			if ( array_key_exists( 'encode_formats', $queue_entry ) && ! empty( $queue_entry['encode_formats'] ) ) {

				foreach ( $queue_entry['encode_formats'] as $format => $value ) {

					if ( $value['status'] == 'encoding' ) { // if it's not completed yet

						if ( $type != 'all' ) {
							$keep[ $video_key ] = true;
						} elseif ( ! is_multisite()
							|| ( is_network_admin() && $scope === 'network' )
							|| ( array_key_exists( 'blog_id', $queue_entry ) && $queue_entry['blog_id'] === get_current_blog_id() )
						) {
							kgvid_cancel_encode( $video_key, $format );
							if ( array_key_exists( 'filepath', $value ) && file_exists( $value['filepath'] ) ) {
								wp_delete_file( $value['filepath'] );
							}
						} else {
							$keep[ $video_key ] = true;
						}
					}

					if ( ( $type == 'manual' && $value['status'] === 'queued' )
						|| ( $type == 'queued' && $value['status'] === 'Encoding Complete' )
						|| ( $type == 'scheduled' && $value['status'] === 'queued' )
					) {
						$keep[ $video_key ] = true;
					}

					if ( $type == 'scheduled'
						&& $value['status'] == 'Encoding Complete'
						&& array_key_exists( 'ended', $value )
					) {
						if ( count( $keep ) < 50 && time() - intval( $value['ended'] ) < WEEK_IN_SECONDS ) { // if there are fewer than 50 entries left in the queue and it finished less than a week ago
							$keep[ $video_key ] = true;
						}
					}

					if ( is_multisite() && $type != 'scheduled' && current_user_can( 'encode_videos' ) &&
						(
							( $scope == 'site' && array_key_exists( 'blog_id', $queue_entry ) && $queue_entry['blog_id'] != get_current_blog_id() )
							|| ( ! current_user_can( 'edit_others_video_encodes' ) && $user_ID != $queue_entry['user_id'] )
							|| ( $scope != 'site' && ! current_user_can( 'manage_network' ) )
						)
					) { // only clear entries from current blog
						$keep[ $video_key ] = true;
						break;
					}
				}
			}
		}
		$keep = array_reverse( $keep );
		foreach ( $keep as $video_key => $value ) {
			$cleared_video_queue[] = $video_encode_queue[ $video_key ];
		}
		$cleared_video_queue = array_merge( $cleared_video_queue );

		if ( ! empty( $cleared_video_queue )
			&& ! wp_next_scheduled( 'kgvid_cleanup_queue', array( 'scheduled' ) )
		) {
			wp_schedule_single_event( time() + DAY_IN_SECONDS, 'kgvid_cleanup_queue', array( 'scheduled' ) );
		}

		kgvid_save_encode_queue( $cleared_video_queue );

	}
}
add_action( 'kgvid_cleanup_queue', 'kgvid_clear_completed_queue', 10, 2 );

function kgvid_execute_moov_fixer( $moov_fixer ) {

	try {
		$moov_fixer->run();
		$moov_error = $moov_fixer->getErrorOutput();
	} catch ( \Exception $e ) {
		$moov_error = $e->getMessage();
	}

	$output = "\n" . $moov_fixer->getCommandLine() . "\n";

	if ( ! empty( $moov_error ) ) {
		$output .= "\nError: " . $moov_error;
	}

	$output .= $moov_fixer->getOutput();

	return $output;
}

function kgvid_fix_moov_atom( $filepath ) {

	$options = kgvid_get_options();
	$output  = '';

	if ( $options['moov'] === 'qt-faststart'
		|| $options['moov'] === 'MP4Box'
	) {

		$output = "\n" . __( 'Fixing moov atom for streaming', 'video-embed-thumbnail-generator' );

		if ( ! empty( $options['moov_path'] ) ) {
			$options['app_path'] = $options['moov_path'];
		}
		if ( $options['moov'] == 'qt-faststart'
		&& file_exists( $filepath )
		) {
			$faststart_tmp_file = str_replace( '.mp4', '-faststart.mp4', $filepath );

			$moov_fixer = new FFmpeg_process(
				array(
					$options['app_path'] . '/' . $options['moov'],
					$filepath,
					$faststart_tmp_file,
				)
			);

			$output .= kgvid_execute_moov_fixer( $moov_fixer );

			if ( file_exists( $faststart_tmp_file ) ) {
				wp_delete_file( $filepath );
				if ( kgvid_can_write_direct( dirname( $filepath ) ) ) {
					global $wp_filesystem;
					$wp_filesystem->move( $faststart_tmp_file, $filepath, true );
				}
			}
		}//if qt-faststart is selected

		if ( $options['moov'] == 'MP4Box' ) {

			$moov_fixer = new FFmpeg_process(
				array(
					$options['app_path'] . '/' . $options['moov'],
					'-inter',
					'500',
					$filepath,
				)
			);

			$output .= kgvid_execute_moov_fixer( $moov_fixer );

		}//if MP4Box is selected

	}//if there is an application selected for fixing moov atoms on libx264-encoded files.

	return wp_kses_post( $output );
}

function kgvid_cancel_encode( $video_key, $format ) {

	$canceled = false;

	if ( current_user_can( 'encode_videos' ) ) {

		$options = kgvid_get_options();

		$video_encode_queue = kgvid_get_encode_queue();

		if ( is_array( $video_encode_queue )
			&& array_key_exists( $video_key, $video_encode_queue )
			&& array_key_exists( $format, $video_encode_queue[ $video_key ]['encode_formats'] )
			&& array_key_exists( 'PID', $video_encode_queue[ $video_key ]['encode_formats'][ $format ] )
		) {

			$kgvid_pid = intval( $video_encode_queue[ $video_key ]['encode_formats'][ $format ]['PID'] );
			$logfile   = $video_encode_queue[ $video_key ]['encode_formats'][ $format ]['logfile'];

			if ( '\\' !== DIRECTORY_SEPARATOR ) { // not Windows

				$check_pid_command = array(
					'ps',
					'--ppid',
					$kgvid_pid,
					'-o',
					'pid,cmd',
					'--no-headers',
				);

				$check_pid = new FFmpeg_process( $check_pid_command );

				try {
					$check_pid->run();
					$output = $check_pid->getOutput();
				} catch ( \Exception $e ) {
					$output = $e->getMessage();
				}

				$process_info = explode( ' ', trim( $output ) );

				if ( intval( $process_info[0] ) > 0
					&& strpos( $output, $video_encode_queue[ $video_key ]['encode_formats'][ $format ]['filepath'] ) !== false
				) {

					$canceled = posix_kill( $process_info[0], 15 );

				}
			} else { // Windows

				$check_pid_command = array(
					'powershell',
					'-Command',
					'Get-CimInstance Win32_Process -Filter "handle = ' . $kgvid_pid . '" | Format-Table -Property CommandLine | Out-String -Width 10000',
				);

				$check_pid = new FFmpeg_process( $check_pid_command );

				try {
					$check_pid->run();
					$output = $check_pid->getOutput();
				} catch ( \Exception $e ) {
					$output = $e->getMessage();
				}

				if ( intval( $kgvid_pid ) > 0
					&& strpos( $output, $options['app_path'] . '/' . $options['video_app'] ) !== false
					&& strpos( $output, $logfile ) !== false
				) {

					$commandline = 'taskkill /F /T /PID "${:KGVID_PID}"';

					$kill_process = FFmpeg_Process::fromShellCommandline( $commandline );

					try {
						$kill_process->run( null, array( 'KGVID_PID' => $kgvid_pid ) );
						$output = $kill_process->getOutput();
					} catch ( \Exception $e ) {
						$output = $e->getMessage();
					}

					if ( strpos( $output, 'SUCCESS' ) !== false ) {

						$canceled = true;

					}
				}
			}

			if ( $canceled ) {

				wp_delete_file( $video_encode_queue[ $video_key ]['encode_formats'][ $format ]['filepath'] );
				$video_encode_queue[ $video_key ]['encode_formats'][ $format ]['status']   = 'canceled';
				$video_encode_queue[ $video_key ]['encode_formats'][ $format ]['lastline'] = esc_html__( 'Encoding was canceled.', 'video-embed-thumbnail-generator' );
				kgvid_save_encode_queue( $video_encode_queue );
				kgvid_encode_videos();

			}
		}
	}

	return $canceled;
}
