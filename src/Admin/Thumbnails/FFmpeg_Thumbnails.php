<?php

namespace Videopack\Admin\Thumbnails;

class FFmpeg_Thumbnails {

	protected $options_manager;
	protected $options;

	public function __construct( $options_manager ) {
		$this->options_manager = $options_manager;
		$this->options         = $options_manager->get_options();
	}

	public function process_thumb(
		$input,
		$output,
		$ffmpeg_path = false,
		$seek = '0',
		$rotate_array = array(),
		$filter_complex = array()
	) {

		if ( $ffmpeg_path === '' ) {
			$ffmpeg_path = 'ffmpeg';
		} elseif ( $ffmpeg_path === false ) {
			$ffmpeg_path = $this->options['app_path'] . '/ffmpeg';
		} else {
			$ffmpeg_path = $ffmpeg_path . '/ffmpeg';
		}

		$before_thumb_options = array(
			$ffmpeg_path,
			'-y',
			'-ss',
			$seek,
			'-i',
			$input,
		);

		if ( ! empty( $filter_complex['input'] ) ) {
			$before_thumb_options[] = '-i';
			$before_thumb_options[] = $filter_complex['input'];
		}

		$thumb_options = array(
			'-q:v',
			'2',
			'-vframes',
			'1',
			'-f',
			'mjpeg',
		);

		if ( ! empty( $rotate_array ) ) {
			$thumb_options = array_merge( $thumb_options, $rotate_array );
		}

		if ( ! empty( $filter_complex['input'] ) ) {
			$thumb_options[] = '-filter_complex';
			$thumb_options[] = $filter_complex['filter'];
		}

		$thumb_options[] = $output;

		$commandline = array_merge( $before_thumb_options, $thumb_options );
		$process     = new \Videopack\Admin\Encode\FFmpeg_process( $commandline );

		try {
			$process->run();
			return $process->getErrorOutput();
		} catch ( \Exception $e ) {
			return $e->getMessage();
		}
	}

	public function make( $post_id, $movieurl, $numberofthumbs, $i, $iincreaser, $thumbtimecode, $dofirstframe, $generate_button ) {

		$uploads         = wp_upload_dir();
		$attachment_meta = new \Videopack\Admin\Attachment_Meta();
		$validate        = new \Videopack\Common\Validate();

		if ( get_post_type( $post_id ) == 'attachment' ) {
			$moviefilepath = get_attached_file( $post_id );
			if ( ! file_exists( $moviefilepath ) ) {
				$moviefilepath = esc_url_raw( str_replace( ' ', '%20', $movieurl ) );
			}

			$kgvid_postmeta = $attachment_meta->get( $post_id );
			$keys           = array(
				'width'    => 'actualwidth',
				'height'   => 'actualheight',
				'duration' => 'duration',
				'rotate'   => 'rotate',
			);

			if ( empty( $kgvid_postmeta['duration'] ) ) {
				$movie_info = kgvid_get_movie_info( $moviefilepath ); //this is not a real function, it's a placeholder
				foreach ( $keys as $info => $meta ) {
					if ( ! empty( $movie_info[ $info ] ) ) {
						$kgvid_postmeta[ $meta ] = $movie_info[ $info ];
					}
				}
				$attachment_meta->save( $post_id, $kgvid_postmeta );
			} else { // post meta is already set
				$movie_info = array();
				foreach ( $keys as $info => $meta ) {
					$movie_info[ $info ] = $kgvid_postmeta[ $meta ];
				}
				$movie_info['worked'] = true;
			}
		} else {
			$moviefilepath = $validate->text_field( str_replace( ' ', '%20', $movieurl ) );
			$movie_info    = kgvid_get_movie_info( $moviefilepath ); //this is not a real function, it's a placeholder
		}

		if ( $movie_info['worked'] == true ) { // if FFmpeg was able to open the file

			$sanitized_url     = $validate->sanitize_url( $movieurl );
			$thumbnailfilebase = $uploads['url'] . '/thumb_tmp/' . $sanitized_url['basename'];

			$movie_width  = $movie_info['width'];
			$movie_height = $movie_info['height'];

			wp_mkdir_p( $uploads['path'] . '/thumb_tmp' );

			if ( $movie_info['rotate'] === false ) {
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

			$movieoffset = round( ( floatval( $movie_info['duration'] ) * $iincreaser ) / ( $numberofthumbs * 2 ), 3 );
			if ( $movieoffset > floatval( $movie_info['duration'] ) ) {
				$movieoffset = floatval( $movie_info['duration'] );
			}

			if ( $generate_button === 'random' ) { // adjust offset random amount
				$movieoffset = $movieoffset - wp_rand( 0, round( floatval( $movie_info['duration'] ), 3 ) / $numberofthumbs );
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

			$rotate_strings = $this->rotate_array( $movie_info['rotate'], $movie_info['width'], $movie_info['height'] );
			$filter_complex = $this->filter_complex( $this->options['ffmpeg_thumb_watermark'], $movie_height, true );

			$tmp_thumbnailurl   = $thumbnailfilebase . '_thumb' . $i . '.jpg';
			$tmp_thumbnailurl   = str_replace( ' ', '_', $tmp_thumbnailurl );
			$final_thumbnailurl = str_replace( '/thumb_tmp/', '/', $tmp_thumbnailurl );

			$thumbnail_generator = $this->process_thumb(
				$moviefilepath,
				$thumbnailfilename[ $i ],
				$this->options['app_path'],
				round( $movieoffset, 3 ),
				$rotate_strings['rotate'],
				$filter_complex
			);

			if ( is_file( $thumbnailfilename[ $i ] ) ) {
				$cleanup = new \Videopack\Admin\Cleanup();
				$cleanup->schedule( 'thumbs' );
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

	public function rotate_array( $rotate, $width, $height ) {

		$rotate_complex = '';

		if ( $rotate === false ) {
			$rotate = '';
		}

		switch ( $rotate ) { // if it's a sideways mobile video

			case 90:
				if ( empty( $this->options['ffmpeg_watermark']['url'] ) ) {
					$rotate_array = array(
						'-vf',
						'transpose=1,scale=' . $height . ':-1',
					);
				} else {
					$rotate_array   = array();
					$rotate_complex = 'transpose=1[rotate];[rotate]';
				}

				$rotate_array[] = '-metadata:s:v:0';
				$rotate_array[] = 'rotate=0';

				break;

			case 270:
				if ( empty( $this->options['ffmpeg_watermark']['url'] ) ) {
					$rotate_array = array(
						'-vf',
						'transpose=2',
					);
				} else {
					$rotate_array   = array();
					$rotate_complex = 'transpose=2[rotate];[rotate]';
				}

				$rotate_array[] = '-metadata:s:v:0';
				$rotate_array[] = 'rotate=0';

				break;

			case 180:
				if ( empty( $this->options['ffmpeg_watermark']['url'] ) ) {
					$rotate_array = array(
						'-vf',
						'hflip,vflip',
					);
				} else {
					$rotate_array   = array();
					$rotate_complex = 'hflip,vflip[rotate];[rotate]';
				}

				$rotate_array[] = '-metadata:s:v:0';
				$rotate_array[] = 'rotate=0';

				break;

			default:
				$rotate_array   = array();
				$rotate_complex = '';
				break;
		}

		$rotate_strings = array(
			'rotate'  => $rotate_array,
			'complex' => $rotate_complex,
			'width'   => $width,
			'height'  => $height,
		);

		return $rotate_strings;
	}

	public function filter_complex( $ffmpeg_watermark, $movie_height, $thumb = false ) {

		if ( is_array( $ffmpeg_watermark )
			&& array_key_exists( 'url', $ffmpeg_watermark )
			&& ! empty( $ffmpeg_watermark['url'] )
		) {

			$watermark_height = strval( round( intval( $movie_height ) * ( intval( $ffmpeg_watermark['scale'] ) / 100 ) ) );

			if ( $ffmpeg_watermark['align'] === 'right' ) {
				$watermark_align = 'main_w-overlay_w-';
			} elseif ( $ffmpeg_watermark['align'] === 'center' ) {
				$watermark_align = 'main_w/2-overlay_w/2-';
			} else {
				$watermark_align = '';
			} //left justified

			if ( $ffmpeg_watermark['valign'] === 'bottom' ) {
				$watermark_valign = 'main_h-overlay_h-';
			} elseif ( $ffmpeg_watermark['valign'] === 'center' ) {
				$watermark_valign = 'main_h/2-overlay_h/2-';
			} else {
				$watermark_valign = '';
			} //top justified

			if ( \Videopack\Common\Validate::filter_validate_url( $ffmpeg_watermark['url'] ) ) {
				$watermark_id = false;
				$watermark_id = ( new \Videopack\Admin\Attachment() )->url_to_id( $ffmpeg_watermark['url'] );
				if ( $watermark_id ) {
					$watermark_file = get_attached_file( $watermark_id );
					if ( file_exists( $watermark_file ) ) {
						$ffmpeg_watermark['url'] = $watermark_file;
					}
				}
			}

			$watermark_filters = '[1:v]scale=-1:' . $watermark_height . '[watermark];';
			if ( $thumb ) {
				$scale_main_video = '[0:v]scale=iw*sar:ih[scaled];';
			} else {
				$scale_main_video = '[0:v]scale=-2:' . $movie_height . '[scaled];';
			}
			$overlay_watermark = '[scaled][watermark]overlay=' . $watermark_align . 'main_w*' . round( intval( $ffmpeg_watermark['x'] ) / 100, 3 ) . ':' . $watermark_valign . 'main_w*' . round( intval( $ffmpeg_watermark['y'] ) / 100, 3 );

			$filter_complex['input']  = $ffmpeg_watermark['url'];
			$filter_complex['filter'] = $watermark_filters . $scale_main_video . $overlay_watermark;

		} else {
			$filter_complex['input'] = '';
			if ( $thumb ) {
				$filter_complex['filter'] = '[0:v]scale=iw*sar:ih';
			} else {
				$filter_complex['filter'] = '[0:v]scale=-2:' . $movie_height;
			}
		}

		return $filter_complex;
	}
}
