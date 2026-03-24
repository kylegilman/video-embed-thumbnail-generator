<?php
/**
 * Encode Info class file.
 *
 * @package Videopack
 * @subpackage Admin/Encode
 */

namespace Videopack\Admin\Encode;

use Videopack\Admin\Sanitize_Url;
use Videopack\Video_Source\Video_Source_Finder;
use Videopack\Video_Source\Source_Factory;
use Videopack\Admin\Formats\Video_Format;

/**
 * Class Encode_Info
 *
 * Handles information about a video file to be encoded, including its path, URL,
 * and potential locations on the server.
 */
class Encode_Info {

	/**
	 * Output URL.
	 *
	 * @var string $url
	 */
	public $url;

	/**
	 * File basename.
	 *
	 * @var string $basename
	 */
	public $basename;

	/**
	 * File path.
	 *
	 * @var string $path
	 */
	public $path;

	/**
	 * Whether the file exists.
	 *
	 * @var bool $exists
	 */
	public $exists = false;

	/**
	 * Whether the file is writable.
	 *
	 * @var bool $writable
	 */
	public $writable = false;

	/**
	 * Whether the file is on the same server.
	 *
	 * @var bool $sameserver
	 */
	public $sameserver = false;

	/**
	 * Whether the file is deletable.
	 *
	 * @var bool $deletable
	 */
	public $deletable = false;

	/**
	 * Video width.
	 *
	 * @var int|null $width
	 */
	public $width;

	/**
	 * Video height.
	 *
	 * @var int|null $height
	 */
	public $height;

	/**
	 * Attachment ID.
	 *
	 * @var int $id
	 */
	public $id;

	/**
	 * Whether the source is an attachment.
	 *
	 * @var bool $is_attachment
	 */
	protected $is_attachment = false;

	/**
	 * Video format.
	 *
	 * @var Video_Format $format
	 */
	protected $format;

	/**
	 * Upload directory info.
	 *
	 * @var array $uploads
	 */
	protected $uploads;

	/**
	 * Sanitized URL object.
	 *
	 * @var Sanitize_Url $sanitized_url
	 */
	protected $sanitized_url;

	/**
	 * Video source object.
	 *
	 * @var \Videopack\Video_Source\Source $source
	 */
	protected $source;

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
	 * @param int                               $id              Attachment ID.
	 * @param string                            $input_url       Input URL.
	 * @param Video_Format                      $format          Video format.
	 * @param array                             $options         Plugin options.
	 * @param \Videopack\Admin\Formats\Registry $format_registry Video formats registry.
	 */
	public function __construct(
		$id,
		string $input_url,
		Video_Format $format,
		array $options,
		\Videopack\Admin\Formats\Registry $format_registry
	) {
		$this->id              = $id;
		$this->format          = $format;
		$this->url             = $input_url;
		$this->options         = $options;
		$this->format_registry = $format_registry;

		$this->source = Source_Factory::create( ! empty( $this->id ) ? $this->id : $this->url, $this->options, $this->format_registry );

		$this->sanitized_url = new Sanitize_Url( $this->url );
		$this->basename      = $this->sanitized_url->basename;
		$this->is_attachment = $this->source instanceof \Videopack\Video_Source\Source_Attachment_Local;
		$this->uploads       = wp_upload_dir();
		$this->path          = $this->uploads['path'] . '/';

		$this->set_encode_info();
	}

	/**
	 * Set encoding information by checking children and potential locations.
	 */
	protected function set_encode_info() {

		$children = Video_Source_Finder::find_attachment_children( $this->source );
		if ( $children ) {
			$this->process_children( $children );
		}

		if ( ! $this->exists ) {
			$this->check_potential_locations();
		}

		if ( ! $this->exists ) {
			$this->set_default_url_and_path();
		}
	}

	/**
	 * Process attachment children to find matches for the requested format.
	 *
	 * @param array $children Array of child attachment objects.
	 */
	protected function process_children( array $children ) {

		foreach ( $children as $child ) {
			$wp_attached_file = get_attached_file( $child->ID );
			$video_meta       = wp_get_attachment_metadata( $child->ID );
			$meta_format      = get_post_meta( $child->ID, '_kgflashmediaplayer-format', true );
			$legacy_id_exists = $this->format->get_legacy_id() !== false;

			if ( $meta_format == $this->format->get_id()
				|| ( $legacy_id_exists && $meta_format == $this->format->get_legacy_id() )
				|| ( $meta_format == false
					&& ( substr( $wp_attached_file, -strlen( $this->format->get_suffix() ) ) === $this->format->get_suffix()
						|| ( $legacy_id_exists && substr( $wp_attached_file, -strlen( $this->format->get_legacy_suffix() ) ) === $this->format->get_legacy_suffix()
						)
					)
				)
			) {
				$this->url        = wp_get_attachment_url( $child->ID );
				$this->path       = $wp_attached_file;
				$this->id         = $child->ID;
				$this->exists     = true;
				$this->writable   = true;
				$this->sameserver = true;

				if ( $child->post_author === get_current_user_id()
					|| current_user_can( 'edit_others_video_encodes' )
				) {
					$this->deletable = true;
				}

				if ( is_array( $video_meta ) && array_key_exists( 'width', $video_meta ) ) {
					$this->width = $video_meta['width'];
				}
				if ( is_array( $video_meta ) && array_key_exists( 'height', $video_meta ) ) {
					$this->height = $video_meta['height'];
				}
				break;
			}
		}
	}

	/**
	 * Check potential server locations for the encoded file.
	 */
	protected function check_potential_locations() {
		$potential_locations = array();

		if ( $this->source instanceof \Videopack\Video_Source\Source_File_Local || $this->source instanceof \Videopack\Video_Source\Source_Attachment_Local ) {
			$potential_locations['same_directory'] = array(
				'url'  => $this->sanitized_url->noextension . $this->format->get_suffix(),
				'path' => $this->source->get_dirname() . '/' . $this->basename . $this->format->get_suffix(),
			);
		}

		if ( $this->format->get_legacy_suffix() ) {
			$potential_locations['html5encodes']              = array(
				'url'  => $this->uploads['baseurl'] . '/html5encodes/' . $this->basename . $this->format->get_legacy_suffix(),
				'path' => $this->uploads['basedir'] . '/html5encodes/' . $this->basename . $this->format->get_legacy_suffix(),
			);
			$potential_locations['same_directory_old_suffix'] = array(
				'url'  => $this->sanitized_url->noextension . $this->format->get_legacy_suffix(),
				'path' => $this->path . $this->basename . $this->format->get_legacy_suffix(),
			);
		}

		foreach ( $potential_locations as $name => $location ) {
			if ( file_exists( $location['path'] ) ) {
				$this->exists = true;
				$this->url    = $location['url'];
				$this->path   = $location['path'];
				require_once ABSPATH . 'wp-admin/includes/file.php';
				if ( get_filesystem_method( array(), $location['path'], true ) === 'direct' ) {
					$this->writable = true;
				}
				break;
			} elseif ( $this->source instanceof \Videopack\Video_Source\Source_Url ) {
				$this->check_url_exists( $location['url'] );
			}
		}
	}

	/**
	 * Check if a URL exists, with transient caching.
	 *
	 * @param string $url The URL to check.
	 */
	protected function check_url_exists( $url ) {
		$cache_key = 'videopack_url_exists_' . md5( $url );
		$exists    = get_transient( $cache_key );

		if ( false === $exists ) {
			if ( $this->source->url_exists( $url ) ) {
				$exists = 'yes';
				set_transient( $cache_key, $exists, HOUR_IN_SECONDS );
			} else {
				$exists = 'no';
				set_transient( $cache_key, $exists, HOUR_IN_SECONDS );
			}
		}

		if ( 'yes' === $exists ) {
			$this->exists = true;
			$this->url    = $url;
		}
	}

	/**
	 * Set default URL and path for a new encode.
	 */
	protected function set_default_url_and_path() {

		$moviefilename = $this->basename . $this->format->get_suffix();
		require_once ABSPATH . 'wp-admin/includes/file.php';
		$local_file = get_attached_file( $this->id );
		if ( get_post_type( $this->id ) == 'attachment'
			&& $local_file
			&& file_exists( $local_file )
			&& get_filesystem_method( array(), $this->path, true ) === 'direct'
		) {
			$this->url  = $this->sanitized_url->noextension . $this->format->get_suffix();
			$this->path = $this->path . $moviefilename;
		} else {
			$this->url  = $this->uploads['url'] . '/' . $moviefilename;
			$this->path = $this->uploads['path'] . '/' . $moviefilename;
		}
	}
}
