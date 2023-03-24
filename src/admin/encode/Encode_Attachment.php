<?php

namespace Videopack\admin\encode;

use Videopack\FFMPEG_Process;

class Encode_Attachment {
	/**
	 * The ID of the video attachment.
	 *
	 * @var int
	 */
	protected $id;

	/**
	 * The URL of the video.
	 *
	 * @var string
	 */
	protected $url;

	protected $options;
	protected $uploads;
	protected $video_formats;
	protected $encode_formats;
	protected $queue_log;
	protected $is_attachment;
	protected $video_metadata;
	protected $encode_input;
	protected $codecs;
	protected $encode_info = array();

	/**
	 * Constructor.
	 *
	 * @param int    $id   The ID of the video attachment.
	 * @param string $url  The URL of the video.
	 */
	public function __construct( int $id, string $url ) {
		$this->id            = $id;
		$this->url           = $url;
		$this->options       = kgvid_get_options();
		$this->uploads       = wp_upload_dir();
		$this->video_formats = kgvid_video_formats();
		$this->queue_log     = array();
		$this->set_is_attachment();
		$this->set_encode_formats();
	}

	protected function set_is_attachment() {
		$this->is_attachment = get_post_type( $this->id ) === 'attachment';
		if ( $this->is_attachment ) {
			$this->encode_input = get_attached_file( $this->id );
		} else {
			$this->encode_input = $this->url;
		}
	}

	protected function set_encode_formats() {
		$formats         = array();
		$videopack_queue = get_post_meta( $this->id, 'videopack_queue', false );
		if ( $videopack_queue ) {
			foreach ( $videopack_queue as $queue_entry ) {
				$formats[] = Encode_Format::from_array( $queue_entry );
			}
		}
		$this->encode_formats = $formats;
	}

	protected function save_format( Encode_Format $encode_format ) {
		$videopack_queue = get_post_meta( $this->id, 'videopack_queue', false );
		if ( $videopack_queue ) {
			foreach ( $videopack_queue as $queue_entry ) {
				if ( array_key_exists( 'format', $queue_entry )
					&& $queue_entry['format'] === $encode_format->get_format()
				) {
					update_post_meta( $this->id, 'videopack_queue', $encode_format->to_array(), $queue_entry );
				}
			}
		}

	}

	public function get_encoded_formats() {
		if ( empty( $this->encode_formats ) ) {
			$this->set_encode_formats();
		}
		return $this->encode_formats;
	}

	public function get_encode_format( string $format ) {
		if ( ! empty( $this->encode_formats ) ) {
			foreach ( $this->encode_formats as $encode_format ) {
				if ( $encode_format->get_format() === $format ) {
					return $encode_format;
				}
			}
		}
		return false;
	}

	public function get_formats_by_status( string $status ) {
		$formats = array();
		if ( ! empty( $this->encode_formats ) ) {
			foreach ( $this->encode_formats as $encode_format ) {
				if ( $encode_format->get_status() === $status ) {
					$formats[] = $encode_format;
				}
			}
		}
		return $formats;
	}

	public function start_next_format() {
		$formats = $this->get_formats_by_status( 'queued' );
		if ( empty( $formats ) ) {
			return false;
		} else {
			//grab the first queued Encode_Format object
			$next_format = reset( $formats );
			$this->start_encode( $next_format );
		}
	}

	protected function start_encode( Encode_Format $encode_format ) {

		$encode_array = $encode_format->get_encode_array();
		$process      = new FFmpeg_Process( $encode_array );
		try {
			$process->start();
			sleep( 1 );
			$pid = $process->getPID();
			$encode_format->set_encode_start( $pid, time() );
		} catch ( \Exception $e ) {
			$encode_format->set_error( $e->getMessage() );
		} finally {
			$this->save_format( $encode_format );
			return $encode_format;
		}
	}

	protected function get_encode_array( Encode_Format $encode_format ) {

		if ( empty( $encode_format->get_encode_array() ) ) {
			return $this->set_encode_array( $encode_format );
		} else {
			return $encode_format->get_encode_array();
		}
	}

	protected function set_encode_array( Encode_Format $encode_format ) {

		$format         = $encode_format->get_format();
		$video_metadata = $this->get_video_metadata();

		$width  = $video_metadata['actualwidth'];
		$height = $video_metadata['actualheight'];

		$rate_control_flag           = $this->get_rate_control_flag( $format );
		$watermark_array             = $this->get_watermark_array();
		$ffmpeg_options              = $this->get_encode_array_options( $format );
		$encode_array_before_options = $this->get_encode_array_before_options( $watermark_array );

		$encode_array_after_options = array(
			'-threads',
			$this->options['threads'],
		);

		if ( ! empty( $watermark_array['input'] ) ) {
			array_push(
				$encode_array_after_options,
				'-filter_complex',
				$watermark_array['filter'],
			);
		}

		$logfile = $this->uploads['path'] . '/' . sanitize_file_name( str_replace( ' ', '_', $video_metadata['moviefilebasename'] ) . '_' . $format . '_' . sprintf( '%04s', wp_rand( 1, 1000 ) ) . '_encode.txt' );

		array_push(
			$encode_array_after_options,
			'-progress',
			$logfile,
			$encode_format->get_path(),
		);

		$encode_array = array_merge(
			$encode_array_before_options,
			$ffmpeg_options,
			$rate_control_flag,
			$encode_array_after_options
		);

		$encode_array = apply_filters( 'kgvid_generate_encode_array', $encode_array, $this->encode_input, $encode_format->get_path(), $video_metadata, $format, $width, $height );

		$encode_format->set_encode_array( $encode_array );
		$encode_format->set_logfile( $logfile );
		$this->save_format( $encode_format );

		return $encode_array;
	}

	protected function get_rate_control_flag( string $format ) {

		$width  = $this->video_metadata['actualwidth'];
		$height = $this->video_metadata['actualheight'];

		if ( $this->options['rate_control'] === 'crf' ) {
			$crf_option = $this->video_formats[ $format ]['type'] . '_CRF';
			if ( $this->video_formats[ $format ]['type'] == 'vp9' ) {
				$this->options['vp9_CRF'] = round( ( -0.000002554 * $width * $height ) + 35 ); // formula to generate close to Google-recommended CRFs https://developers.google.com/media/vp9/settings/vod/
			}
			$crf_flag = 'crf';
			if ( $this->video_formats[ $format ]['type'] == 'ogv' ) { // ogg doesn't do CRF
				$crf_flag = 'q:v';
			}
			if ( isset( $this->options[ $crf_option ] ) ) {
				$rate_control_flag = array(
					'-' . $crf_flag,
					$this->options[ $crf_option ],
				);
			} else {
				$rate_control_flag = array();
			}
		} elseif ( $this->video_formats[ $format ]['type'] == 'vp9' ) {
			$average_bitrate   = round( 102 + 0.000876 * $width * $height + 1.554 * pow( 10, -10 ) * pow( $width * $height, 2 ) );
			$maxrate           = round( $average_bitrate * 1.45 );
			$minrate           = round( $average_bitrate * .5 );
			$rate_control_flag = array(
				'-b:v',
				$average_bitrate . 'k',
				'-maxrate',
				$maxrate . 'k',
				'-minrate',
				$minrate . 'k',
			);
		} else {
			$rate_control_flag = array(
				'-b:v',
				round( floatval( $this->options['bitrate_multiplier'] ) * $width * $height * 30 / 1024 ) . 'k',
			);
		}

		return $rate_control_flag;
	}

	protected function get_watermark_array() {

		if ( is_array( $this->options['ffmpeg_watermark'] )
			&& array_key_exists( 'url', $this->options['ffmpeg_watermark'] )
			&& ! empty( $this->options['ffmpeg_watermark']['url'] )
		) {

			$watermark_width = strval( round( intval( $this->video_metadata['actualwidth'] ) * ( intval( $this->options['ffmpeg_watermark']['scale'] ) / 100 ) ) );

			if ( $this->options['ffmpeg_watermark']['align'] == 'right' ) {
				$watermark_align = 'main_w-overlay_w-';
			} elseif ( $this->options['ffmpeg_watermark']['align'] == 'center' ) {
				$watermark_align = 'main_w/2-overlay_w/2-';
			} else {
				$watermark_align = '';
			} //left justified

			if ( $this->options['ffmpeg_watermark']['valign'] == 'bottom' ) {
				$watermark_valign = 'main_h-overlay_h-';
			} elseif ( $this->options['ffmpeg_watermark']['valign'] == 'center' ) {
				$watermark_valign = 'main_h/2-overlay_h/2-';
			} else {
				$watermark_valign = '';
			} //top justified

			if ( strpos( $this->options['ffmpeg_watermark']['url'], 'http://' ) === 0 ) {
				$watermark_id = false;
				$watermark_id = kgvid_url_to_id( $this->options['ffmpeg_watermark']['url'] );
				if ( $watermark_id ) {
					$watermark_file = get_attached_file( $watermark_id );
					if ( file_exists( $watermark_file ) ) {
						$this->options['ffmpeg_watermark']['url'] = $watermark_file;
					}
				}
			}

			$watermark_array['input']  = $this->options['ffmpeg_watermark']['url'];
			$watermark_array['filter'] = '[1:v]scale=' . $watermark_width . ':-1[watermark];[0:v] [watermark]overlay=' . $watermark_align . 'main_w*' . round( $this->options['ffmpeg_watermark']['x'] / 100, 3 ) . ':' . $watermark_valign . 'main_w*' . round( $this->options['ffmpeg_watermark']['y'] / 100, 3 );

		} else {

			$watermark_array['input']  = '';
			$watermark_array['filter'] = '';

		}

		return $watermark_array;
	}

	protected function get_encode_array_options( string $format ) {

		$width  = $this->video_metadata['actualwidth'];
		$height = $this->video_metadata['actualheight'];

		if ( $this->video_formats[ $format ]['type'] === 'h264' ) {
			$codecs    = $this->get_codecs();
			$aac_array = kgvid_aac_encoders();
			foreach ( $aac_array as $aaclib ) { // cycle through available AAC encoders in order of quality
				if ( $codecs[ $aaclib ] ) {
					break;
				}
			}

			$movflags = array();
			if ( $this->options['moov'] === 'movflag' ) {
				$movflags = array(
					'-movflags',
					'faststart',
				);
			}

			$profile_array = array();
			if ( $this->options['h264_profile'] !== 'none' ) {
				$profile_array = array(
					'-profile:v',
					$this->options['h264_profile'],
				);
				if ( $this->options['h264_profile'] != 'high422' && $this->options['h264_profile'] != 'high444' ) {
					$profile_array[] = '-pix_fmt';
					$profile_array[] = 'yuv420p'; // makes sure output is converted to 4:2:0
				}
			}

			$level_array = array();
			if ( $this->options['h264_level'] != 'none' ) {
				$level_array = array(
					'-level:v',
					round( floatval( $this->options['h264_level'] ) * 10 ),
				);
			}

			$ffmpeg_options = array(
				'-acodec',
				$aaclib,
				'-b:a',
				$this->options['audio_bitrate'] . 'k',
				'-s',
				$width . 'x' . $height,
				'-vcodec',
				'libx264',
			);

			$ffmpeg_options = array_merge(
				$ffmpeg_options,
				$movflags,
				$profile_array,
				$level_array
			);

		} else { // if it's not H.264 the settings are basically the same

			$ffmpeg_options = array(
				'-acodec',
				'libvorbis',
				'-b:a',
				$this->options['audio_bitrate'] . 'k',
				'-s',
				$width . 'x' . $height,
				'-vcodec',
				$this->video_formats[ $format ]['vcodec'],
			);

			if ( $this->options['rate_control'] == 'crf' ) {
				if ( $this->video_formats[ $format ]['type'] == 'webm' ) {
					$ffmpeg_options[] = '-b:v';
					$ffmpeg_options[] = round( floatval( $this->options['bitrate_multiplier'] ) * 1.25 * $width * $height * 30 / 1024 ) . 'k'; // set a max bitrate 25% larger than the ABR. Otherwise libvpx goes way too low.
				}
				if ( $this->video_formats[ $format ]['type'] == 'vp9' ) {
					$ffmpeg_options[] = '-b:v';
					$ffmpeg_options[] = '0';
				}
			}
		}

		return $ffmpeg_options;
	}

	protected function get_encode_array_before_options( array $watermark_array ) {
		$nice = '';
		$sys  = strtoupper( PHP_OS ); // Get OS Name
		if ( substr( $sys, 0, 3 ) != 'WIN' && $this->options['nice'] == 'on' ) {
			$nice = 'nice';
		}

		if ( ! empty( $this->options['htaccess_login'] )
			&& strpos( $this->encode_input, 'http://' ) === 0
		) {
			$this->encode_input = substr_replace( $this->encode_input, $this->options['htaccess_login'] . ':' . $this->options['htaccess_password'] . '@', 7, 0 );
		}

		$encode_array_before_options = array(
			$nice,
			$this->options['app_path'] . '/' . $this->options['video_app'],
			'-y',
			'-i',
			$this->encode_input,
		);

		if ( ! empty( $watermark_array['input'] ) ) {
			array_push(
				$encode_array_before_options,
				'-i',
				$watermark_array['input'],
			);
		}

		if ( $this->options['audio_channels'] == 'on' ) {
			array_push(
				$encode_array_before_options,
				'-ac',
				'2',
			);
		}

		return $encode_array_before_options;
	}

	public function get_video_metadata() {
		if ( empty( $this->video_metadata ) ) {
			$this->set_video_metadata();
		}
		return $this->video_metadata;
	}

	public function get_codecs() {
		if ( empty( $this->codecs ) ) {
			$this->set_codecs();
		}
		return $this->codecs;
	}

	public function try_to_queue( string $format ) {

		if ( $this->already_queued( $format ) ) {
			return 'already_queued';
		}

		$encode_info = $this->get_encode_info( $format, true );
		if ( $encode_info['exists'] ) {
			return 'already_exists';
		}

		$video_metadata = $this->get_video_metadata();
		if ( $this->video_formats[ $format ]['type'] === 'h264'
			&& $format != 'fullres'
			&& $video_metadata['actualheight'] <= $this->video_formats[ $format ]['height']
		) {
			return 'lowres';
		}

		$codecs = $this->get_codecs();
		if ( ! $codecs[ $this->video_formats[ $format ]['vcodec'] ] ) {
			return 'vcodec';
		}

		$encode_format = new Encode_Format( $format );
		$encode_format->set_queued(
			$encode_info['path'],
			$encode_info['url'],
			get_current_user_id(),
		);

		return $this->queue_new( $encode_format );
	}

	public function queue_new( Encode_Format $encode_format ) {
		$added = add_post_meta( $this->id, 'videopack_encode_queue', $encode_format->to_array() );
		if ( $added !== false ) {
			$this->set_encode_formats();
			return 'queued';
		}
		return 'error';
	}

	public function already_queued( string $format ) {
		if ( $this->encode_formats ) {
			foreach ( $this->encode_formats as $encode_format ) {
				if ( $encode_format->get_format() === $format ) {
					return $encode_format;
				}
			}
		}
		return false;
	}

	public function get_encode_info( string $format, bool $recheck = false ) {

		if ( ! array_key_exists( $format, $this->encode_info )
			|| $recheck
		) {
			$this->set_encode_info( $format );
		}
		return $this->encode_info[ $format ];
	}

	protected function set_encode_info( string $format ) {
		$sanitized_url = kgvid_sanitize_url( $this->url );
		$movieurl      = $sanitized_url['movieurl'];

		$encode_info ['moviefilebasename'] = $sanitized_url['basename'];
		$encode_info ['encodepath']        = $this->uploads['path'] . '/';

		$children = $this->get_attachment_children( $sanitized_url['movieurl'] );
		if ( $children ) {
			$encode_info = $this->process_children( $encode_info, $children, $format );
		}

		if ( ! $encode_info['exists'] ) {
			$encode_info = $this->check_potential_locations( $encode_info, $sanitized_url, $format );
		}

		if ( ! $encode_info['exists'] ) {
			$encode_info = $this->set_default_url_and_path( $encode_info, $sanitized_url, $format );
		}

		$this->encode_info[ $format ] = apply_filters( 'kgvid_encodevideo_info', $encode_info, $movieurl, $this->id, $format );
	}

	private function get_attachment_children( string $movieurl ) {
		if ( $this->is_attachment ) {
			$args = array(
				'numberposts' => '-1',
				'post_parent' => $this->id,
				'post_type'   => 'attachment',
			);
		} else {
			$args = array(
				'numberposts' => '-1',
				'post_type'   => 'attachment',
				'meta_key'    => '_kgflashmediaplayer-externalurl',
				'meta_value'  => $movieurl,
			);
		}

		$children = get_posts( $args );

		return $children;
	}

	private function process_children( array &$encode_info, array $children, string $format ) {

		foreach ( $children as $child ) {
			$wp_attached_file = get_attached_file( $child->ID );
			$video_meta       = wp_get_attachment_metadata( $child->ID );
			$meta_format      = get_post_meta( $child->ID, '_kgflashmediaplayer-format', true );

			if ( $meta_format == $format
				|| (
					substr( $wp_attached_file, -strlen( $this->video_formats[ $format ]['suffix'] ) ) === $this->video_formats[ $format ]['suffix']
					&& $meta_format == false
				)
			) {
				$encode_info['url']      = wp_get_attachment_url( $child->ID );
				$encode_info['path']     = $wp_attached_file;
				$encode_info['id']       = $child->ID;
				$encode_info['exists']   = true;
				$encode_info['writable'] = true;

				if ( is_array( $video_meta ) && array_key_exists( 'width', $video_meta ) ) {
					$encode_info['width'] = $video_meta['width'];
				}
				if ( is_array( $video_meta ) && array_key_exists( 'height', $video_meta ) ) {
					$encode_info['height'] = $video_meta['height'];
				}
				break;
			}
		}
	}

	private function check_potential_locations( array &$encode_info, array $sanitized_url, string $format ) {

		$potential_locations = array(
			'same_directory' => array(
				'url'  => $sanitized_url['noextension'] . $this->video_formats[ $format ]['suffix'],
				'path' => $encode_info['encodepath'] . $encode_info['moviefilebasename'] . $this->video_formats[ $format ]['suffix'],
			),
			'html5encodes'   => array(
				'url'  => $this->uploads['baseurl'] . '/html5encodes/' . $encode_info['moviefilebasename'] . $this->video_formats[ $format ]['old_suffix'],
				'path' => $this->uploads['basedir'] . '/html5encodes/' . $encode_info['moviefilebasename'] . $this->video_formats[ $format ]['old_suffix'],
			),
		);
		if ( array_key_exists( 'old_suffix', $this->video_formats[ $format ] ) ) {
			$potential_locations['same_directory_old_suffix'] = array(
				'url'  => $sanitized_url['noextension'] . $this->video_formats[ $format ]['old_suffix'],
				'path' => $encode_info['encodepath'] . $encode_info['moviefilebasename'] . $this->video_formats[ $format ]['old_suffix'],
			);
		}

		foreach ( $potential_locations as $name => $location ) {
			if ( file_exists( $location['path'] ) ) {
				$encode_info['exists'] = true;
				$encode_info['url']    = $location['url'];
				$encode_info['path']   = $location['path'];
				require_once ABSPATH . 'wp-admin/includes/file.php';
				if ( get_filesystem_method( array(), $location['path'], true ) === 'direct' ) {
					$encode_info['writable'] = true;
				}
				break;
			} else if ( ! empty( $this->id )
				&& ! $encode_info['sameserver']
				&& $name !== 'html5encodes'
			) {
				$this->check_url_exists( $encode_info, $sanitized_url, $format, $location['url'] );
			}
		}
	}

	private function check_url_exists( array &$encode_info, array $sanitized_url, string $format, string $url ) {

		$already_checked_url = get_post_meta( $this->id, '_kgflashmediaplayer-' . $sanitized_url['singleurl_id'] . '-' . $format, true );
		if ( empty( $already_checked_url ) ) {
			if ( kgvid_url_exists( esc_url_raw( str_replace( ' ', '%20', $url ) ) ) ) {
				$encode_info['exists'] = true;
				$encode_info['url']    = $url;
				update_post_meta( $this->id, '_kgflashmediaplayer-' . $sanitized_url['singleurl_id'] . '-' . $format, $encode_info['url'] );
			} else {
				update_post_meta( $this->id, '_kgflashmediaplayer-' . $sanitized_url['singleurl_id'] . '-' . $format, 'not found' );
			}
		} elseif ( substr( $already_checked_url, 0, 4 ) == 'http' ) {
			$encode_info['exists'] = true;
			$encode_info['url']    = $already_checked_url;
		}
	}

	private function set_default_url_and_path( array &$encode_info, array $sanitized_url, string $format ) {

		$moviefilename = $encode_info['moviefilebasename'] . $this->video_formats[ $format ]['suffix'];
		require_once ABSPATH . 'wp-admin/includes/file.php';
		if ( get_post_type( $this->id ) == 'attachment'
			&& get_filesystem_method( array(), $encode_info['encodepath'], true ) === 'direct'
		) {
			$encode_info['url']  = $sanitized_url['noextension'] . $this->video_formats[ $format ]['suffix'];
			$encode_info['path'] = $encode_info['encodepath'] . $moviefilename;
		} else {
			$encode_info['url']  = $this->uploads['url'] . '/' . $moviefilename;
			$encode_info['path'] = $this->uploads['path'] . '/' . $moviefilename;
		}
	}

	protected function set_video_metadata() {

		if ( $this->is_attachment ) {
			$kgvid_postmeta = kgvid_get_attachment_meta( $this->id );
			if ( array_key_exists( 'worked', $kgvid_postmeta )
			) {
				$this->video_metadata = $kgvid_postmeta;
				return;
			}
		}

		$metadata = array();
		$result   = null;

		$get_info = new FFmpeg_process(
			array(
				$this->options['app_path'] . '/' . $this->options['video_app'],
				'-i',
				$this->encode_input,
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
		}

		if ( ! empty( $result ) ) {

			$metadata['worked'] = true;
			$metadata['actualwidth']  = $regs [1] ? $regs [1] : null;
			$metadata['actualheight'] = $regs [2] ? $regs [2] : null;

			preg_match( '/Duration: (.*?),/', $output, $matches );
			$duration               = $matches[1];
			$movie_duration_hours   = intval( substr( $duration, -11, 2 ) );
			$movie_duration_minutes = intval( substr( $duration, -8, 2 ) );
			$movie_duration_seconds = floatval( substr( $duration, -5 ) );
			$metadata['duration']   = ( $movie_duration_hours * 60 * 60 ) + ( $movie_duration_minutes * 60 ) + $movie_duration_seconds;

			preg_match( '/rotate          : (.*?)\n/', $output, $matches );
			if ( is_array( $matches )
				&& array_key_exists( 1, $matches ) === true
			) {
				$rotate = $matches[1];
			} else {
				$rotate = '0';
			}

			switch ( $rotate ) {
				case '90':
					$metadata['rotate'] = 90;
					break;
				case '180':
					$metadata['rotate'] = 180;
					break;
				case '270':
					$metadata['rotate'] = 270;
					break;
				case '-90':
					$metadata['rotate'] = 270;
					break;
				default:
					$metadata['rotate'] = '';
					break;
			}
		} else {
			$metadata['worked'] = false;
		}

		if ( $this->is_attachment ) {
			$metadata = array_merge( $kgvid_postmeta, $metadata );
			kgvid_save_attachment_meta( $this->id, $metadata );
		}

		$this->video_metadata = $metadata;
	}

	public function set_codecs() {
		$ffmpeg_codecs = new FFmpeg_Process(
			array(
				$this->options['app_path'] . '/' . $this->options['video_app'],
				'-codecs',
			)
		);

		try {
			$ffmpeg_codecs->run();
			$codec_output = $ffmpeg_codecs->getOutput();
		} catch ( \Exception $e ) {
			$codec_output = $e->getMessage();
		}

		//need to set libvorbis because it isn't set in the video formats
		$video_lib_array = array( 'libvorbis' );

		foreach ( $this->video_formats as $format => $format_stats ) {
			if ( isset( $format_stats['vcodec'] ) ) {
				$video_lib_array[] = $format_stats['vcodec'];
			}
		}

		$aac_array = kgvid_aac_encoders();
		$lib_list  = array_merge( $video_lib_array, $aac_array );

		foreach ( $lib_list as $lib ) {
			if ( strpos( $codec_output, $lib ) !== false ) {
				$codec_list[ $lib ] = true;
			} else {
				$codec_list[ $lib ] = false;
			}
		}

		$this->codecs = $codec_list;
	}

	/**
	 * Cancel the encoding job.
	 */
	public function cancel_job( string $format ) {
		$canceled = false;
		if ( current_user_can( 'delete_posts' ) ) {
			$encode_format = $this->get_encode_format( $format );
			$pid           = $encode_format->get_pid();

			if ( '\\' !== DIRECTORY_SEPARATOR ) { // not Windows

				$check_pid_command = array(
					'ps',
					'--ppid',
					$pid,
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
					&& strpos( $output, $encode_format->get_path() ) !== false
				) {

					$canceled = posix_kill( $process_info[0], 15 );

				}
			} else { // Windows

				$check_pid_command = array(
					'powershell',
					'-Command',
					'Get-CimInstance Win32_Process -Filter "handle = ' . $pid . '" | Format-Table -Property CommandLine | Out-String -Width 10000',
				);

				$check_pid = new FFmpeg_process( $check_pid_command );

				try {
					$check_pid->run();
					$output = $check_pid->getOutput();
				} catch ( \Exception $e ) {
					$output = $e->getMessage();
				}

				if ( intval( $pid ) > 0
					&& strpos( $output, $this->options['app_path'] . '/ffmpeg' ) !== false
					&& strpos( $output, $encode_format->get_logfile() ) !== false
				) {

					$commandline = 'taskkill /F /T /PID "${:VIDEOPACK_PID}"';

					$kill_process = FFmpeg_Process::fromShellCommandline( $commandline );

					try {
						$kill_process->run( null, array( 'VIDEOPACK_PID' => $pid ) );
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
				$encode_format->set_canceled();
				$this->save_format( $encode_format );
			}
		}
		return $canceled;
	}

	/**
	 * Delete the encoded file.
	 */
	public function delete_format( string $format ) {
	}

	/**
	 * Other methods as needed.
	 */
}
