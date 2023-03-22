<?php

namespace Videopack\admin\encode;

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
	protected $queued_formats;
	protected $queue_log;
	protected $is_attachment;
	protected $video_metadata;
	protected $encode_path;
	protected $codecs;

	/**
	 * Constructor.
	 *
	 * @param int    $id   The ID of the video attachment.
	 * @param string $url  The URL of the video.
	 */
	public function __construct( $id, $url ) {
		$this->id            = $id;
		$this->url           = $url;
		$this->options       = kgvid_get_options();
		$this->uploads       = wp_upload_dir();
		$this->video_formats = kgvid_video_formats();
		$this->queue_log     = array();
		$this->set_is_attachment();
		$this->load_queued_formats();
	}

	protected function set_is_attachment() {
		$this->is_attachment = get_post_type( $this->id ) === 'attachment';
		if ( $this->is_attachment ) {
			$this->encode_path = get_attached_file( $this->id );
		} else {
			$this->encode_path = $this->url;
		}
	}

	protected function load_queued_formats() {
		$formats         = array();
		$videopack_queue = get_post_meta( $this->id, 'videopack_queue', false );
		if ( $videopack_queue ) {
			foreach ( $videopack_queue as $queue_entry ) {
				$formats[] = Encode_Format::from_array( $queue_entry );
			}
		}
		$this->queued_formats = $formats;
	}

	public function get_queued_formats() {
		return $this->queued_formats;
	}

	public function get_encoding_formats() {
		$encoding_formats = array();
		if ( ! empty( $this->queued_formats ) ) {
			foreach ( $this->queued_formats as $format ) {
				if ( $format->get_status() === 'encoding' ) {
					$encoding_formats[] = $format;
				}
			}
		}
		return $encoding_formats;
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

	public function try_to_queue( $format ) {

		if ( $this->already_queued( $format ) ) {
			return 'already_queued';
		}

		$encode_info = $this->get_encode_info( $format );
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

	public function queue_new( $encode_format ) {
		$added = add_post_meta( $this->id, 'videopack_encode_queue', $encode_format->to_array() );
		if ( $added !== false ) {
			$this->load_queued_formats();
			return 'queued';
		}
		return 'error';
	}

	public function already_queued( $format ) {
		if ( $this->queued_formats ) {
			foreach ( $this->queued_formats as $queue_entry ) {
				if ( $queue_entry->get_format() === $format ) {
					return $queue_entry;
				}
			}
		}
		return false;
	}

	public function get_encode_info( $format ) {

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

		return apply_filters( 'kgvid_encodevideo_info', $encode_info, $movieurl, $this->id, $format );
	}

	private function get_attachment_children( $movieurl ) {
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

	private function process_children( &$encode_info, $children, $format ) {

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

	private function check_potential_locations( &$encode_info, $sanitized_url, $format ) {

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
				$this->check_url_exists( $encode_info, $sanitized_url, $format, $location );
			}
		}
	}

	private function check_url_exists( &$encode_info, $sanitized_url, $format, $location ) {

		$already_checked_url = get_post_meta( $this->id, '_kgflashmediaplayer-' . $sanitized_url['singleurl_id'] . '-' . $format, true );
		if ( empty( $already_checked_url ) ) {
			if ( kgvid_url_exists( esc_url_raw( str_replace( ' ', '%20', $location['url'] ) ) ) ) {
				$encode_info['exists'] = true;
				$encode_info['url']    = $location['url'];
				update_post_meta( $this->id, '_kgflashmediaplayer-' . $sanitized_url['singleurl_id'] . '-' . $format, $encode_info['url'] );
			} else {
				update_post_meta( $this->id, '_kgflashmediaplayer-' . $sanitized_url['singleurl_id'] . '-' . $format, 'not found' );
			}
		} elseif ( substr( $already_checked_url, 0, 4 ) == 'http' ) {
			$encode_info['exists'] = true;
			$encode_info['url']    = $already_checked_url;
		}
	}

	private function set_default_url_and_path( &$encode_info, $sanitized_url, $format ) {

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

		$get_info = new FFMPEG_process(
			array(
				$this->options['app_path'] . '/' . $this->options['video_app'],
				'-i',
				$this->encode_path,
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
		$ffmpeg_codecs = new FFMPEG_Process(
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
	public function cancel_job() {
		// Cancel the encoding job.
	}

	/**
	 * Delete the encoded file.
	 */
	public function delete_file() {
		// Delete the encoded file.
	}

	/**
	 * Other methods as needed.
	 */
}
