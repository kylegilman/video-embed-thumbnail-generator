<?php

namespace Videopack\admin\encode;

use ActionScheduler;

class Encode_Queue_Controller {

	protected $queued;
	protected $encoding_now;
	protected $queue_log;
	protected $options;

	public function __construct() {
		$this->queue_log = new Encode_Queue_Log();
		$this->options   = kgvid_get_options();
		$this->add_table();
		$this->set_queued();
		$this->set_encoding_now();
		$this->check_encoding();
	}

	private function add_table() {

		global $wpdb;
		$charset_collate = $wpdb->get_charset_collate();
		$table_name      = $wpdb->prefix . 'videopack_encoding_queue';

		$sql = "CREATE TABLE $table_name (
			id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
			attachment_id BIGINT UNSIGNED NOT NULL,
			url VARCHAR(255) NOT NULL,
			status ENUM('queued', 'processing', 'completed', 'failed') NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			started_at DATETIME,
			completed_at DATETIME,
			failed_at DATETIME,
			error_message TEXT,
			version BIGINT UNSIGNED DEFAULT 0
		) $charset_collate;";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		maybe_create_table( $table_name, $sql );
	}

	public function start_queue() {
		$this->options['queue_control'] = 'play';
		update_option( 'kgvid_video_embed_options', $this->options );
		$this->start_next_job();
	}

	public function pause_queue() {
		$this->options['queue_control'] = 'pause';
		update_option( 'kgvid_video_embed_options', $this->options );
	}

	/**
	 * Schedule the encoding job.
	 *
	 * @param array $formats The formats to encode.
	 */
	public function schedule_job( array $args ) {

		$required = array(
			'id',
			'url',
			'formats',
		);

		if ( $this->required_keys( $args, $required ) ) {

			$args      = kgvid_sanitize_text_field( $args );
			$action_id = as_enqueue_async_action(
				array( __CLASS__, 'add_to_queue' ),
				$args,
				'videopack',
			);

		}

		// Store the scheduled action's ID in your custom option
		//$this->store_action_id( $action_id );
	}

	protected function store_action_id( int $action_id ) {
		// Get the existing scheduled action IDs from the wp_options table
		$queued_action_ids = get_option( 'videopack_encode_queue', array() );

		// Add the new action ID to the array
		$queued_action_ids[] = $action_id;

		// Update the wp_options entry with the new array of action IDs
		update_option( 'videopack_encode_queue', $queued_action_ids );
	}

	protected function required_keys( array $args, array $required ) {
		if ( is_array( $args ) ) {
			foreach ( $required as $key ) {
				if ( ! array_key_exists( $key, $args ) ) {
					return false;
				}
			}
		}
		return true;
	}

	protected function store_queued_post_id( int $id, string $url ) {
		if ( ! in_array( $id, $this->queued ) ) {
			$this->queued[] = array(
				'id'  => $id,
				'url' => $url,
			);
			$this->save_queue();
		}
	}

	public function check_encoding() {
		$encoding_formats = array();
		$encoding         = $this->get_encoding_now();
		if ( $encoding ) {
			foreach ( $encoding as $key => $args ) {
				$encoder = new Encode_Attachment( $args['id'], $args['url'] );
				$formats = $encoder->get_formats();
				if ( $formats ) {
					foreach ( $formats as $format ) {
						switch ( $format->get_status() ) {
							case 'encoding':
								$encoding_formats[ $key ] = $format;
								break;
							case 'needs_insert':
								$encoder->insert_attachment( $format );
								break;
						}
					}
					if ( ! array_key_exists( $key, $encoding_formats ) ) {
						unset( $this->encoding_now[ $key ] );
						$this->save_encoding_now();
					}
				}
			}
		}
		$this->start_next_job();
		return $encoding_formats;
	}

	public function add_to_queue( array $args ) {
		$encoder = new Encode_Attachment( $args['id'], $args['url'] );
		foreach ( $args['formats'] as $format ) {
			$action = $encoder->try_to_queue( $format );
			if ( $action === 'queued' ) {
				$this->store_queued_post_id( $args['id'], $args['url'] );
			}
			$this->queue_log->add_to_log( $action, $format );
		}
		return $this->queue_log->get_log();
	}

	protected function start_next_job() {
		if ( count( $this->encoding_now ) < $this->options['simultaneous_encodes']
			&& $this->options['queue_control'] === 'play'
		) {
			$queue = $this->get_full_queue();
			if ( $queue ) {
				foreach ( $queue as $key => $args ) {
					$encoder = new Encode_Attachment( $args['id'], $args['url'] );
					$next    = $encoder->start_next_format();
					if ( $next ) {
						$this->encoding_now[] = $this->queued[ $key ];
						$this->save_encoding_now();
						unset( $this->queued[ $key ] );
						$this->save_queue();
					}
				}
			}
		}
	}

	protected function get_action_args_by_id( int $action_id ) {
		$action_args = array();

		// Get the scheduled action by ID
		$actions = ActionScheduler::store()->fetch_action( $action_id );

		if ( $actions ) {
			// Get the action arguments
			$action_args = $actions->get_args();
		}

		return $action_args;
	}

	public function get_full_queue() {
		$encoding = $this->get_encoding_now();
		$queued   = $this->get_queued();
		return array_merge( $encoding, $queued );
	}

	public function get_full_queue_array() {
		$queue_array = array();
		$full_queue  = $this->get_full_queue();
		if ( ! empty( $full_queue ) ) {
			foreach ( $full_queue as $key => $args ) {
				$encoder       = new Encode_Attachment( $args['id'], $args['url'] );
				$queue_array[] = array(
					'id'      => $args['id'],
					'url'     => $args['url'],
					'formats' => $encoder->get_formats_array(),
				);
			}
		}
		return $queue_array;
	}

	public function get_encoding_now() {
		$this->set_encoding_now();
		return $this->encoding_now;
	}

	public function get_queued() {
		$this->set_queued();
		return $this->queued;
	}

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

	protected function set_queued() {
		$this->queued = get_option( 'videopack_encode_queue', array() );
	}

	protected function set_encoding_now() {
		$this->encoding_now = get_option( 'videopack_encoding_now', array() );
	}

	protected function save_queue() {
		return update_option( 'videopack_encode_queue', $this->queued );
	}

	protected function save_encoding_now() {
		return update_option( 'videopack_encoding_now', $this->encoding_now );
	}
}
