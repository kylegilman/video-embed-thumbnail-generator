<?php
/*
Plugin Name: Video Embed & Thumbnail Generator
Plugin URI: http://www.kylegilman.net/2011/01/18/video-embed-thumbnail-generator-wordpress-plugin/
Description: Generates thumbnails, HTML5-compliant videos, and embed codes for locally hosted videos. Requires FFMPEG for thumbnails and encodes. <a href="options-general.php?page=video-embed-thumbnail-generator/video-embed-thumbnail-generator.php">Settings</a> | <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=kylegilman@gmail.com&item_name=Video%20Embed%20And%20Thumbnail%20Generator%20Plugin%20Donation/">Donate</a>
Version: 4.2
Author: Kyle Gilman
Author URI: http://www.kylegilman.net/

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
	GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA

1) Includes Strobe Media Playback Flash Player
   Website: http://osmf.org/strobe_mediaplayback.html
   License: http://creativecommons.org/licenses/by-nc/3.0/
2) Includes code adapted from Joshua Eldridge's Flash Media Player Plugin
   Website: http://wordpress.org/extend/plugins/flash-video-player/
3) Includes code adapted from Gary Cao's Make Shortcodes User-Friendly tutorial
   Website: http://www.wphardcore.com/2010/how-to-make-shortcodes-user-friendly/
4) Includes code adapted from Justin Gable's "Modifying Wordpress' Default Method for Inserting Media"
   Website: http://justingable.com/2008/10/03/modifying-wordpress-default-method-for-inserting-media/
5) Includes Video-JS Player
	Website: http://www.videojs.com/
	License: http://www.gnu.org/licenses/lgpl.html
6) Includes code adapted from Kathy Darling's custom solution for saving thumbnails
	Website: http://www.kathyisawesome.com/
*/

if ( ! defined( 'ABSPATH' ) )
	die( "Can't load this file directly" );
	
function kgvid_default_options_fn() {
	$options = array(
		"version"=>4.2,
		"embed_method"=>"Video.js",
		"template"=>false,
		"template_gentle"=>"on",
		"encode_1080"=>"on",
		"encode_720"=>"on",
		"encode_mobile"=>"on",
		"encode_webm"=>false,
		"encode_ogg"=>false,
		"app_path"=>"/usr/local/bin",
		"video_app" => "ffmpeg",
		"ffmpeg_exists"=>"notchecked",
		"video_bitrate_flag"=>false,
		"ffmpeg_vpre"=>false,
		"moov"=>"none",
		"generate_thumbs"=>4,
		"featured"=>"on",
		"thumb_parent"=>"video",
		"delete_children"=>"encoded videos only",
		"titlecode"=>"<strong>",
		"poster"=>"",
		"watermark"=>"",
		"overlay_title"=>"on",
		"overlay_embedcode"=>false,
		"view_count"=>false,
		"embeddable"=>"on",
		"inline"=>false,
		"align"=>"left",
		"width"=>"640",
		"height"=>"360",
		"gallery_width"=>"960",
		"gallery_height"=>"540",
		"gallery_thumb"=>"250",
		"controlbar_style"=>"docked",
		"autoplay"=>false,
		"loop"=>false,
		"endOfVideoOverlay"=>false,
		"endOfVideoOverlaySame"=>"",
		"bgcolor"=>"",
		"configuration"=>"",
		"skin"=>plugins_url("", __FILE__)."/flash/skin/kg_skin.xml",
		"js_skin"=>"kg-video-js-skin",
		"stream_type"=>"liveOrRecorded",
		"scale_mode"=>"letterbox",
		"autohide"=>"on",
		"playbutton"=>"on",
		"bitrate_multiplier"=>0.1,
		"h264_CRF"=>"23",
		"webm_CRF"=>"10",
		"ogv_CRF"=>"6",
		"audio_bitrate"=>160,
		"threads"=>1,
		"nice"=>"on",
		"browser_thumbnails"=>"on",
		"rate_control"=>"crf",
		"h264_profile"=>"baseline",
		"h264_level"=>"3.0"
	);
	return $options;
}

function kgvid_register_default_options_fn() { //add default values for options
	$options = get_option('kgvid_video_embed_options');
    if( !is_array($options) ) {
		$options = kgvid_default_options_fn();
		update_option('kgvid_video_embed_options', $options);
	}
	if ( !isset($options['ffmpeg_exists']) || $options['ffmpeg_exists'] == "notchecked" ) { kgvid_check_ffmpeg_exists($options, true); }
}
register_activation_hook(__FILE__, 'kgvid_register_default_options_fn');

function kgvid_video_formats() {

	$video_formats = array(
		"rotated" => array(
			"name" => "Replace original with rotated H.264",
			"width" => 4096,
			"height" => 2304,
			"type" => "h264",
			"suffix" => "-rotated.mp4",
			"vcodec" => "libx264"
		),
		"1080" => array(
			"name" => "1080p H.264", 
			"width" => 1920, 
			"height" => 1080, 
			"type" => "h264", 
			"suffix" => "-1080.mp4", 
			"old_suffix" => "-1080.m4v",
			"vcodec" => "libx264"
		),
		"720" => array(
			"name" => "720p H.264", 
			"width" => 1280, 
			"height" => 720, 
			"type" => "h264", 
			"suffix" => "-720.mp4", 
			"old_suffix" => "-720.m4v",
			"vcodec" => "libx264"
		),
		"mobile" => array(
			"name" => "480p H.264", 
			"width" => 640, 
			"height" => 480, 
			"type" => "h264", 
			"suffix" => "-480.mp4", 
			"old_suffix" => "-ipod.m4v",
			"vcodec" => "libx264"
		),
		"webm" => array(
			"name" => "WEBM", 
			"width" => 0, 
			"height" => 0, 
			"type" => "webm", 
			"suffix" => ".webm",
			"vcodec" => "libvpx",
		),
		"ogg" => array(
			"name" => "OGV", 
			"width" => 0, 
			"height" => 0, 
			"type" => "ogv", 
			"suffix" => ".ogv",
			"vcodec" => "libtheora"
		)
	);
	return $video_formats;
	
}

function kgvid_aac_encoders() {

	$aac_array = array("libfdk_aac", "libfaac", "libvo_aacenc", "aac");
	return $aac_array;

}

function kgvid_add_upload_mimes ( $existing_mimes=array() ) {
 
	// allows uploading .webm videos
	$existing_mimes['webm'] = 'video/webm';
	return $existing_mimes;
 
}
add_filter('upload_mimes', 'kgvid_add_upload_mimes');

function kgvid_url_exists($url) {
    $hdrs = @get_headers($url);
    return is_array($hdrs) ? preg_match('/^HTTP\\/\\d+\\.\\d+\\s+2\\d\\d\\s+.*$/',$hdrs[0]) : false;
}

function kgvid_is_empty_dir($dir)
{
    if ($dh = @opendir($dir))
    {
        while ($file = readdir($dh))
        {
            if ($file != '.' && $file != '..') {
                closedir($dh);
                return false;
            }
        }
        closedir($dh);
        return true;
    }
    else return false; // whatever the reason is : no such dir, not a dir, not readable
}

function kgvid_rrmdir($dir) {
   if (is_dir($dir)) {
     $objects = scandir($dir);
     foreach ($objects as $object) {
       if ($object != "." && $object != "..") {
         if (filetype($dir."/".$object) == "dir") kgvid_rrmdir($dir."/".$object); else unlink($dir."/".$object);
       }
     }
     reset($objects);
     rmdir($dir);
   }
}

function kgvid_check_for_shortcode_in_content() {
	global $post;
	$pattern = get_shortcode_regex();
	preg_match_all( '/'. $pattern .'/s', $post->post_content, $matches );
	if ( array_key_exists( 2, $matches ) && array_key_exists( 5, $matches ) ) {
		foreach ( $matches[2] as $shortcode_index => $shortcode ) { 
			if ( $shortcode == "KGVID" || $shortcode == "FMP" ) { continue; }
			else { 
				foreach ( $matches as $match_index => $shortcode_matches ) {
					unset($matches[$match_index][$shortcode_index]); 
				}			
			}
		}
		foreach ( $matches[5] as $index => $url ) {
			if ( empty($url) ) { unset($matches[5][$index]); }
		}
	}
	return $matches;
}

function kgvid_get_attachment_medium_url( $id )
{
    $medium_array = image_downsize( $id, 'medium' );
    $medium_path = $medium_array[0];

    return $medium_path;
}

function kgvid_backwards_compatible($post_id) {

	global $wp_version;
	$field_id = array();
	
	if ( $wp_version < 3.5 ) { 
		$field_id['poster'] = 'attachments['. $post_id .'][kgflashmediaplayer-poster]';
		$field_id['thumbtime'] = 'attachments['. $post_id .'][thumbtime]';
	}
	else { 
		$field_id['poster'] = 'attachments-'. $post_id .'-kgflashmediaplayer-poster'; 
		$field_id['thumbtime'] = 'attachments-'. $post_id .'-thumbtime';
	}
	return $field_id;
	
}

function kgvid_sanitize_url($movieurl) {
	$movieurl = rawurldecode($movieurl);
	$movie_extension = pathinfo(parse_url($movieurl, PHP_URL_PATH), PATHINFO_EXTENSION);
	$sanitized_url['noextension'] = preg_replace("/\\.[^.\\s]{3,4}$/", "", $movieurl);
	$sanitized_url['basename'] = sanitize_file_name(basename($movieurl,'.'.$movie_extension));;
	$sanitized_url['singleurl_id'] = "singleurl_".preg_replace('/[^a-zA-Z0-9]/', '_', $sanitized_url['basename']);
	$sanitized_url['movieurl'] = esc_url_raw(str_replace(" ", "%20", $movieurl));
	return $sanitized_url;
}

function kgvid_ajax_sanitize_url() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	$movieurl = $_POST['movieurl'];
	$sanitized_url = kgvid_sanitize_url($movieurl);
	echo json_encode($sanitized_url);
	die();

}
add_action('wp_ajax_kgvid_sanitize_url', 'kgvid_ajax_sanitize_url');

function kgvid_check_ffmpeg_exists($options, $save) {
	$exec_enabled = false;
	$ffmpeg_exists = false;
	$output = array();
	$function = "";
	$uploads = wp_upload_dir();

	if(function_exists('exec')) { 
		if (function_exists('escapeshellcmd')) {
			$exec_enabled = true;
			$cmd = escapeshellcmd($options['app_path'].'/'.$options['video_app'].' -i '.plugin_dir_path(__FILE__).'images/sample-video-h264.mp4 -vframes 1 -f mjpeg '.$uploads['path'].'/ffmpeg_exists_test.jpg');
			exec ( $cmd, $output, $returnvalue );
		}
		else { $function = "ESCAPESHELLCMD"; }
	}
	else { $function = "EXEC"; }

	if ( $exec_enabled == true && file_exists($uploads['path'].'/ffmpeg_exists_test.jpg') ) { //if FFMPEG has executed successfully
		$ffmpeg_exists = true;
		unlink($uploads['path'].'/ffmpeg_exists_test.jpg');
	}

	if ( $save == true ) {
		if ( $ffmpeg_exists == true ) { $options['ffmpeg_exists'] = "on"; }
		else { $options['ffmpeg_exists'] = "notinstalled"; }
		update_option('kgvid_video_embed_options', $options);
	}

	$output_output = implode("/n", $output);
	$arr = array ("exec_enabled"=>$exec_enabled, "ffmpeg_exists"=>$ffmpeg_exists, "output"=>$output_output, "function"=>$function);
	return $arr;
}

function kgvid_encodevideo_info($movieurl, $postID) {

	$options = get_option('kgvid_video_embed_options');

	$uploads = wp_upload_dir();
	$video_formats = kgvid_video_formats();
	$sanitized_url = kgvid_sanitize_url($movieurl);
	$movieurl = $sanitized_url['movieurl'];
	
	$encodevideo_info['moviefilebasename'] = $sanitized_url['basename'];	
	$encodevideo_info['encodepath'] = $uploads['path'];
	if ( get_post_type($postID) == "attachment" ) { //if it's an attachment, not from URL
		$moviefile = get_attached_file($postID);
		$path_parts = pathinfo($moviefile);
		$encodevideo_info['encodepath'] = $path_parts['dirname']."/";
		$encodevideo_info['sameserver'] = true;
		$args = array(
			'numberposts' => '-1',
			'post_parent' => $postID,
			'post_type' => 'attachment',
			'post_mime_type' => 'video'
		);
	}
	else {
	
		$url_parts = parse_url($uploads['url']);
		if ( array_key_exists('host', $url_parts) && strpos($movieurl, $url_parts['host']) !== false ) { //if we're on the same server
			$encodevideo_info['sameserver'] = true;
			$decodedurl = urldecode($movieurl);
			$parsed_url= parse_url($decodedurl);
			$fileinfo = pathinfo($decodedurl);
			$parsed_url['extension'] = $fileinfo['extension'];
			$parsed_url['filename'] = $fileinfo['basename'];
			$parsed_url['localpath'] = $_SERVER['DOCUMENT_ROOT'].$parsed_url['path'];
			// just in case there is a double slash created when joining document_root and path
			$parsed_url['localpath'] = preg_replace('/\/\//', '/', $parsed_url['localpath']);

			$encodevideo_info['encodepath'] = rtrim($parsed_url['localpath'], $parsed_url['filename']);
		}
		else { $encodevideo_info['sameserver'] = false; }
		
		$args = array(
			'numberposts' => '-1',
			'post_type' => 'attachment',
			'meta_key' => '_kgflashmediaplayer-externalurl',
			'meta_value' => $sanitized_url['movieurl'],
			'post_mime_type' => 'video'
		);

	}
	$children = get_posts( $args );

	foreach ( $video_formats as $format => $format_stats ) { //loop through each format

		$encodevideo_info[$format.'_exists'] = false;
		$encodevideo_info[$format.'_writable'] = false;
	
		//start with the new database info before checking other locations
		
		if ($children) {
			foreach ( $children as $child ) {
				$mime_type = get_post_mime_type($child->ID);
				$wp_attached_file = get_post_meta($child->ID, '_wp_attached_file', true);
				$wp_file_info = pathinfo($wp_attached_file);
				if ( substr($wp_attached_file, -strlen($format_stats['suffix'])) == $format_stats['suffix'] ) {
					$encodevideo_info[$format.'url'] = $uploads['baseurl'].'/'.$wp_attached_file;
					$encodevideo_info[$format.'filepath'] = $uploads['basedir'].'/'.$wp_attached_file;
					$encodevideo_info[$format.'id'] = $child->ID;
					$encodevideo_info[$format.'_exists'] = true;
					$encodevideo_info[$format.'_writable'] = true;
					continue 2; //skip rest of children loop and format loop
				}
			}
		}
		
		//if the format's not in the database, check these places
		if ( $format != 'rotated' ) {
		
			if ( array_key_exists('old_suffix', $format_stats) ) { $old_suffix = $format_stats['old_suffix']; }
			else { $old_suffix = $format_stats['suffix']; }		
			$potential_locations = array(
				"same_directory" => array(
					'url' => $sanitized_url['noextension'].$format_stats['suffix'], 
					'filepath' => $encodevideo_info['encodepath'].$encodevideo_info['moviefilebasename'].$format_stats['suffix'] ),
				"same_directory_old_suffix" => array(
					'url' => $sanitized_url['noextension'].$old_suffix, 
					'filepath' => $encodevideo_info['encodepath'].$encodevideo_info['moviefilebasename'].$old_suffix ),
				"html5encodes" => array(
					'url' => $uploads['baseurl']."/html5encodes/".$encodevideo_info['moviefilebasename'].$old_suffix,
					'filepath' => $uploads['basedir']."/html5encodes/".$encodevideo_info['moviefilebasename'].$old_suffix ),
			);		
			if ( !array_key_exists('old_suffix', $format_stats) ) { unset($potential_locations['same_directory_old_suffix']); }
		
			foreach ( $potential_locations as $name => $location ) {

				if ( file_exists($location['filepath']) ) { 
					$encodevideo_info[$format.'_exists'] = true; 
					$encodevideo_info[$format.'url'] = $location['url'];
					$encodevideo_info[$format.'filepath'] = $location['filepath'];
					if ( is_writable($location['filepath']) ) { $encodevideo_info[$format.'_writable'] = true; }
					break;
				}
				elseif ( !$encodevideo_info['sameserver'] &&  $name != "html5encodes" ) { //last resort if it's not on the same server, check url_exists

					$already_checked_url = get_post_meta($postID, '_kgflashmediaplayer-'.$sanitized_url['singleurl_id'].'-'.$format, true);
					if ( empty($already_checked_url) ) {
						if ( kgvid_url_exists(esc_url_raw(str_replace(" ", "%20", $location['url']))) ) {
							$encodevideo_info[$format.'_exists'] = true;
							$encodevideo_info[$format.'url'] = $location['url'];
							update_post_meta($postID, '_kgflashmediaplayer-'.$sanitized_url['singleurl_id'].'-'.$format, $encodevideo_info[$format.'url']);
						}
						else { 
							update_post_meta($postID, '_kgflashmediaplayer-'.$sanitized_url['singleurl_id'].'-'.$format, 'not found');
						}
					}
					else { //url already checked
						if ( substr($already_checked_url, 0, 4) == 'http' ) { //if it smells like a URL...
							$encodevideo_info[$format.'_exists'] = true;
							$encodevideo_info[$format.'url'] = $already_checked_url;
						}
					}
				}//end if not on same server
			}//end potential locations loop
		}
		
		if ( !$encodevideo_info[$format.'_exists'] ) {
			$encodevideo_info[$format.'url'] = $uploads['url'].'/'.$encodevideo_info['moviefilebasename'].$format_stats['suffix'];
			$encodevideo_info[$format.'filepath'] = $uploads['path'].'/'.$encodevideo_info['moviefilebasename'].$format_stats['suffix'];
		}
		
	}//end format loop
	
	return $encodevideo_info;
}

/**
* Get the dimensions of a video file
*
* @param unknown_type $video
* @return array(width,height)
* @author Jamie Scott
*/
function kgvid_get_video_dimensions($video = false) {
	$options = get_option('kgvid_video_embed_options');
	$ffmpegPath = $options['app_path']."/".$options['video_app'];
	
	$video = str_replace("https://", "http://",  $video);

	$command = escapeshellcmd($ffmpegPath . ' -i "' . $video . '"');
	$command = $command.' 2>&1';
	exec ( $command, $output );
	$lastline = end($output);
	$lastline = prev($output)."<br />".$lastline;  
	$output = implode("\n", $output);

	$regex = "/Video: ([^,]*), ([^,]*), ([0-9]{1,4})x([0-9]{1,4})/";
	if (preg_match($regex, $output, $regs)) { $result = $regs[0]; }
	else {	$result = ""; }

	if ( !empty($result) ) {
		$movie_info['worked'] = true;
		$movie_info['width'] = $regs [3] ? $regs [3] : null;
		$movie_info['height'] = $regs [4] ? $regs [4] : null;
		preg_match('/Duration: (.*?),/', $output, $matches);
		$duration = $matches[1];
		$movie_duration_hours = intval(substr($duration, -11, 2));
		$movie_duration_minutes = intval(substr($duration, -8, 2));
		$movie_duration_seconds = intval(substr($duration, -5, 2));
		$movie_info['duration'] = ($movie_duration_hours * 60 * 60) + ($movie_duration_minutes * 60) + $movie_duration_seconds;

		preg_match('/rotate          : (.*?)\n/', $output, $matches);
		if ( array_key_exists(1, $matches) == true ) { $rotate = $matches[1]; }
		else $rotate = "0";
		
		switch ($rotate) {
			case "90": $movie_info['rotate'] = '-vf "transpose=1"'; break;
			case "180": $movie_info['rotate'] = '-vf "hflip,vflip"'; break;
			case "270": $movie_info['rotate'] = '-vf "transpose=2"'; break;
			default: $movie_info['rotate'] = ""; break;
		}
		
		$command = escapeshellcmd($ffmpegPath . ' -i "' . $video . '" -codecs');
		$command = $command.' 2>&1';
		exec ( $command, $output );
		$output = implode("\n", $output);
		$configuration = array();
		$video_lib_array = array('libtheora', 'libvorbis', 'libvpx', 'libx264');
		$aac_array = kgvid_aac_encoders();
		$lib_list = array_merge($video_lib_array, $aac_array);
		foreach ($lib_list as $lib) {
			if ( strpos($output, $lib) !== false ) { $movie_info['configuration'][$lib] = "true"; }
			else { $movie_info['configuration'][$lib] = "false"; }
		}

		return $movie_info;
		
	} else {
		return array ('output'=>$lastline, 'worked'=>false);
	}

}

function kgvid_generate_encode_string($input, $output, $libraries, $format, $width, $height) {

	$options = get_option('kgvid_video_embed_options');
	$encode_string = strtoupper($options['video_app'])." not found";
		
	if ( $options['ffmpeg_exists'] == "on" ) {
	
		$video_formats = kgvid_video_formats();
		
		if ( $options['video_app'] == "avconv" || $options['video_bitrate_flag'] == false ) { 
			$video_bitrate_flag = "b:v";
			$audio_bitrate_flag = "b:a";
			$profile_flag = "profile:v";
			$level_flag = "level:v";
			$qscale_flag = "q:v";
		}
		
		else { 
			$video_bitrate_flag = "b";
			$audio_bitrate_flag = "ab";
			$profile_flag = "profile";
			$level_flag = "level";
			$qscale_flag = "qscale";
		}
		
		if ( $options['rate_control'] == "crf" ) {
			$crf_option = $video_formats[$format]['type'].'_CRF';
			$crf_flag = "crf";
			if ( $video_formats[$format]['type'] == 'ogv' ) { $crf_flag = $qscale_flag; } //ogg doesn't do CRF
			$rate_control_flag = " -".$crf_flag." ".$options[$crf_option];
		}
		else {
			$rate_control_flag = " -".$video_bitrate_flag." ".round(floatval($options['bitrate_multiplier'])*$width*$height*30/1024)."k";
		}
		
		if ( $video_formats[$format]['type'] == 'h264' ) {

			$aac_array = kgvid_aac_encoders();
			foreach ( $aac_array as $aaclib ) { //cycle through available AAC encoders in order of quality
				if ( $libraries[$aaclib] == "true" ) { break; } 
			}
			if ( $aaclib == "aac" ) { $aaclib = "aac -strict experimental"; } //the built-in aac encoder is considered experimental
		
			$vpre_flags = "";
			if ( $options['ffmpeg_vpre'] == 'on' ) { $vpre_flags = ' -vpre fast -vpre ipod640'; }
		
			$movflags = "";
			if ( $options['moov'] == "movflag" ) {
				$movflags = " -movflags faststart";
			}
		
			$profile_text = "";
			if ( $options['h264_profile'] != "none" ) {
				$profile_text = " -".$profile_flag." ".$options['h264_profile'];
			}
		
			$level_text = "";
			if ( $options['h264_level'] != "none" ) {
				if ( $options['video_app'] == "avconv" ) { $options['h264_level'] = round(floatval($options['h264_level'])*10); }
				$level_text = " -".$level_flag." ".$options['h264_level'];
			}

			$ffmpeg_options = "-acodec ".$aaclib." -".$audio_bitrate_flag." ".$options['audio_bitrate']."k -s ".$width."x".$height." -vcodec libx264".$vpre_flags.$movflags.$profile_text.$level_text;
		
		}
		else { //if it's not H.264 the settings are basically the same
			$ffmpeg_options = "-acodec libvorbis -".$audio_bitrate_flag." ".$options['audio_bitrate']."k -vcodec ".$video_formats[$format]['vcodec'];
			if ( $video_formats[$format]['type'] == 'webm' ) {  
				$ffmpeg_options .= " -".$video_bitrate_flag." ".round(floatval($options['bitrate_multiplier'])*1.25*$width*$height*30/1024)."k"; //set a max bitrate 25% larger than the ABR. Otherwise libvpx goes way too low.
			}
		}
		
		$nice = "";
		$sys = strtoupper(PHP_OS); // Get OS Name
		if( substr($sys,0,3) != "WIN" && $options['nice'] == "on" ) { $nice = "nice "; }
		
		$encode_string = $nice.$options['app_path']."/".$options['video_app']." -y -i '".$input."' ".$ffmpeg_options.$rate_control_flag." -threads ".$options['threads']." '".$output."'";

	} //if FFMPEG is found

	return $encode_string;

}

class kgvid_Process{
	
    private $pid;
    private $command;

    public function __construct($cl=false){
        if ($cl != false){
            $this->command = $cl;
            $this->runCom();
        }
    }
    private function runCom(){	
		$sys = strtoupper(PHP_OS); // Get OS Name
		if(substr($sys,0,3) == "WIN") { $this->OS = "windows"; }
		else { $this->OS = "linux";	}

		$command = $this->command;
		exec($command ,$op);
		$this->output = $op;
		if(substr($sys,0,3) != "WIN") { $this->pid = (int)$op[0]; }
    }

    public function setPid($pid){
        $this->pid = $pid;
    }

    public function getPid(){
        return $this->pid;
    }

    public function status(){
        $command = 'ps -p '.$this->pid;
        exec($command,$op);
        if (!isset($op[1]))return false;
        else return true;
    }

    public function start(){
        if ($this->command != '')$this->runCom();
        else return true;
    }

    public function stop(){
        $command = 'kill '.$this->pid;
        exec($command);
        if ($this->status() == false)return true;
        else return false;
    }
}// class Process

function kgvid_video_embed_enqueue_scripts() {
	$options = get_option('kgvid_video_embed_options');
	
	if ( $options['embed_method'] == "Strobe Media Playback" ) {
		wp_enqueue_script( 'swfobject' );
	}

	//Video.js script and skins
	wp_enqueue_script( 'video-js', plugins_url("", __FILE__).'/video-js/video.js', '', '4.2.0' );
	wp_enqueue_style( 'video-js-css', plugins_url("", __FILE__).'/video-js/video-js.css', '', '4.2.0' );
	wp_enqueue_style( 'video-js-kg-skin', plugins_url("", __FILE__).'/video-js/kg-video-js-skin.css', '', $options['version'] );

	//plugin-related frontend scripts and styles
	wp_enqueue_style( 'kgvid_video_styles', plugins_url("/css/kgvid_styles.css", __FILE__), '', $options['version'] );
	wp_enqueue_script( 'jquery-ui-dialog' );
	wp_enqueue_script( 'kgvid_video_embed', plugins_url("/js/kgvid_video_embed.js", __FILE__), '', $options['version'] );
	wp_localize_script( 'kgvid_video_embed', 'ajax_object', array( 'ajaxurl' => admin_url( 'admin-ajax.php' ) ) ); // setting ajaxurl
}
add_action('wp_enqueue_scripts', 'kgvid_video_embed_enqueue_scripts', 12);

function enqueue_kgvid_script() { //loads plugin-related scripts in the admin area

    wp_enqueue_script( 'video_embed_thumbnail_generator_script', plugins_url('/js/kgvid_video_plugin_admin.js', __FILE__) );
    wp_enqueue_style( 'video_embed_thumbnail_generator_style', plugins_url('/css/video-embed-thumbnail-generator_admin.css', __FILE__) );
    
}
add_action('admin_enqueue_scripts', 'enqueue_kgvid_script');

function kgvid_video_embed_print_scripts() {

	global $wp_query;
	global $wpdb;
    $posts = $wp_query->posts;
	$pattern = get_shortcode_regex();

	echo '<script type="text/javascript">videojs.options.flash.swf = "'.plugins_url("", __FILE__).'/video-js/video-js.swf?4.2.0"</script>'."\n";
	
	foreach ( $posts as $post ) {
		if ( preg_match_all( '/'. $pattern .'/s', $post->post_content, $matches )
        && array_key_exists( 2, $matches ) && array_key_exists( 5, $matches )
        && ( in_array( 'KGVID', $matches[2] ) || in_array( 'FMP', $matches[2] ) ) ) { //if KGVID or FMP shortcode is in posts on this page.
			$guid_convert = substr(str_replace(' ', '', $matches[5][0]), 12 );
			$query = "SELECT ID FROM {$wpdb->posts} WHERE guid LIKE '%{$guid_convert}'"; //GUID seems to be the only way to get a video URL
			$id = $wpdb->get_var($query);
			if ( $id != "" ) { //if the video is in the database
				echo '<meta property="og:video" content="'.site_url('/').'?attachment_id='.$id.'&amp;kgvid_video_embed[enable]=true" />'."\n";
				//echo '<meta property="og:video" content="'.$matches[5][0].'" />'."\n";
				echo '<meta property="og:video:width" content="640" />'."\n";
				echo '<meta property="og:video:height" content="360" />'."\n";
				break;
			}
		}
	}

}
add_action('wp_head', 'kgvid_video_embed_print_scripts', 99);

function KGVID_shortcode($atts, $content = ''){

	$options = get_option('kgvid_video_embed_options');
	if ( in_the_loop() ) { $post_ID = get_the_ID(); }
	else { $post_ID = 1; }

	$query_atts = shortcode_atts(
					array('width' => $options['width'], 
						  'height' => $options['height'],
						  'align' => $options['align'],
						  'controlbar' => $options['controlbar_style'],
						  'autohide' => $options['autohide'],
						  'poster' => $options['poster'],
						  'watermark' => $options['watermark'],
						  'endofvideooverlay' => $options['endOfVideoOverlay'],
						  'endofvideooverlaysame' => $options['endOfVideoOverlaySame'],
						  'playbutton' => $options['playbutton'],
						  'loop' => $options['loop'],
						  'autoplay' => $options['autoplay'],
						  'streamtype' => $options['stream_type'],
						  'scalemode' => $options['scale_mode'],
						  'backgroundcolor' => $options['bgcolor'],
						  'configuration' => $options['configuration'],
						  'skin' => $options['skin'],
						  'gallery' => 'false',
						  'gallery_thumb' => $options['gallery_thumb'],
						  'gallery_orderby' => 'menu_order',
						  'gallery_order' => 'ASC',
						  'gallery_exclude' => '',
						  'gallery_include' => '',
						  'gallery_id' => $post_ID,
						  'volume' => '',
						  'title' => $options['overlay_title'],
						  'embedcode' => $options['overlay_embedcode'],
						  'view_count' => $options['view_count'],
						  'caption' => '',
						  'description' => '',
						  'inline' => $options['inline'],
						  'downloadlink' => 'false'
						  ), $atts);
			  
	$checkbox_convert = array ( "autohide", "endofvideooverlaysame", "playbutton", "loop", "autoplay", "title", "embedcode", "view_count", "inline");
	foreach ( $checkbox_convert as $query ) {
		if ( $query_atts[$query] == "on" ) { $query_atts[$query] = "true"; }
		if ( $query_atts[$query] == false ) { $query_atts[$query] = "false"; }
	}
	
	if ( $options['js_skin'] == "" ) { $options['js_skin'] = "vjs-default-skin"; }
	if ( is_array($atts) ) {
		if ( array_key_exists('skin', $atts) ) { $options['js_skin'] = $atts['skin']; } //allows user to set skin for individual videos using the skin="" attribute
	}

	if ( $query_atts["gallery"] != "true" ) { //if this is just a single video
	
		// workaround for relative video URL (contributed by Lee Fernandes)
		if(substr($content, 0, 1) == '/') $content = get_bloginfo('url').$content;	
		$content = trim($content);
		$guid_convert = substr(str_replace(' ', '', $content), 12 );
		global $wpdb;
		$query = "SELECT ID FROM {$wpdb->posts} WHERE guid LIKE '%{$guid_convert}'"; //GUID seems to be the only way to get a video URL
		$id = $wpdb->get_var($query);

		$moviefiletype = pathinfo($content, PATHINFO_EXTENSION);
		if ( $moviefiletype == "mov" || $moviefiletype == "m4v" ) { $moviefiletype = "mp4"; }
		$video_formats = array(
			"original" => $moviefiletype,
			"1080" => "mp4",
			"720" => "mp4",
			"mobile" => "mp4",
			"webm" => "webm",
			"ogg" => "ogg"
		);
		$compatible = array("flv", "f4v", "mp4", "mov", "m4v", "ogv", "ogg", "webm");
		$flashcompatible = array("flv", "f4v", "mp4", "mov", "m4v");
		$h264compatible = array("mp4", "mov", "m4v");
			
		if ( !empty($id) ) { //if the video is an attachment in the WordPress db
			$div_suffix = $id;
			$encodevideo_info = kgvid_encodevideo_info($content, $id);
			$attachment_info = get_post( $id );
					
			$poster_id = get_post_meta($id, '_kgflashmediaplayer-poster-id', true);
			if ( !empty($poster_id) ) {
				//$poster_post = get_post($poster_id);
				$poster_image_src = wp_get_attachment_image_src($poster_id, 'full');
				if ( empty($query_atts['poster']) ) { $query_atts['poster'] = $poster_image_src[0]; } //if there's no poster URL set, use the database to set it automatically
				if ( $poster_image_src[0] == $query_atts['poster'] && intval($query_atts['width']) <= get_option('medium_size_h') ) { 
					$query_atts['poster'] = kgvid_get_attachment_medium_url($poster_id); 
				}
			}
			
			if ( $query_atts['title'] == "true" ) { 
				$query_atts['title'] = $attachment_info->post_title; 
				$stats_title = $query_atts['title']; 
			}
			else { $stats_title = $attachment_info->post_title; }
			if ( empty($query_atts['caption']) ) { $query_atts['caption'] = $attachment_info->post_excerpt; }
			if ( empty($query_atts['description']) ) { $query_atts['description'] = $attachment_info->post_content; }
			
			$countable = true;
		}
		else { //video is not in the database
			$div_suffix = substr(uniqid(rand(), true),0,4);
			$encodevideo_info = kgvid_encodevideo_info($content, $post_ID); //send the id of the post the video's embedded in
			if ( $query_atts['title'] == "true" ) { 
				$query_atts['title'] = "false";  
			}
			$stats_title = basename($content);
			if ( $query_atts['embedcode'] == "true" ) {
				$query_atts['embedcode'] = "false"; //can't use embed code with videos that are not in the database
			}
			
			$countable = false;
		}
		
		if ( in_array($moviefiletype, $compatible) ) { 
			$encodevideo_info["original_exists"] = true;
			$encodevideo_info["originalurl"] = $content;
		}
		else { $encodevideo_info["original_exists"] = false; }
		
		if($query_atts["endofvideooverlaysame"] == "true") { $query_atts["endofvideooverlay"] = $query_atts["poster"]; }
		
		/* if ( $query_atts['video_security'] && !empty($id) ) {
		
			$token = bin2hex(openssl_random_pseudo_bytes(32));
			foreach ($video_formats as $name => $type) {
				if ( $encodevideo_info[$name."_exists"] ) {
					$encodevideo_info[$name.'url'] = site_url('/')."?kgvid_video_embed[id]=".$id."&kgvid_video_embed[format]=".$name."&kgvid_video_embed[token]=".$token;
				}
			}
		}*/
		
		if ( $options['embed_method'] == "Strobe Media Playback" ) {
		
			$video_swf = plugins_url('', __FILE__)."/flash/StrobeMediaPlayback.swf";
			$minimum_flash = "10.1.0";
			
			if ( in_array($moviefiletype, $flashcompatible) ) { //if the original video is Flash video player compatible
				$flashvars = "{src:'".urlencode($content)."'"; 
				$flash_source_found = true;
			} 
			else {
				$flash_source_found = false;
				foreach ($video_formats as $name => $type) { //check if there's an H.264 format available and pick the highest quality one
					if ( $encodevideo_info[$name."_exists"] && $type == "mp4" ) { 
						$flashvars = "{src:'".urlencode(trim($encodevideo_info[$name.'url']))."'";
						$flash_source_found = true;
						break;
					}
				}
			}
			if ( $flash_source_found ) {
				if($query_atts["poster"] != '') { $flashvars .= ", poster:'".urlencode(trim($query_atts["poster"]))."'"; }
				if($query_atts["endofvideooverlay"] != '') { $flashvars .= ", endOfVideoOverlay:'".urlencode(trim($query_atts["endofvideooverlay"]))."'"; }
				if($query_atts["controlbar"] != '') { $flashvars .= ", controlBarMode:'".$query_atts["controlbar"]."'";	}
				if($query_atts["autohide"] != '') { $flashvars .= ", controlBarAutoHide:'".$query_atts["autohide"]."'"; }
				if($query_atts["playbutton"] != '') { $flashvars .= ", playButtonOverlay:'".$query_atts["playbutton"]."'"; }
				if($query_atts["loop"] != '') {	$flashvars .= ", loop:'".$query_atts["loop"]."'"; }
				if($query_atts["autoplay"] != '') { $flashvars .= ", autoPlay:'".$query_atts["autoplay"]."'"; }
				if($query_atts["streamtype"] != '') { $flashvars .= ", streamType:'".$query_atts["streamtype"]."'";	}
				if($query_atts["scalemode"] != '') { $flashvars .= ", scaleMode:'".$query_atts["scalemode"]."'"; }
				if($query_atts["backgroundcolor"] != '') { $flashvars .= ", backgroundColor:'".$query_atts["backgroundcolor"]."'"; }	
				if($query_atts["configuration"] != '') { $flashvars .= ", configuration:'".urlencode($query_atts["configuration"])."'"; }
				if($query_atts["skin"] != '') { $flashvars .= ", skin:'".urlencode($query_atts["skin"])."'"; }		
				$flashvars .= ", verbose:'true', javascriptCallbackFunction:'function(id){kgvid_strobemedia_callback(".$div_suffix.");}'"; //this is necessary to turn on the js API
				$flashvars .= "}";
				$params = "{wmode:'opaque', allowfullscreen:'true', allowScriptAccess:'always', base:'".plugins_url("", __FILE__)."/flash/'}";
			}
		} //if Strobe Media Playback
		
		$sources = array();
		foreach ($video_formats as $name => $type) {
			if ( $name != "original" && $encodevideo_info[$name."url"] == $content ) { unset($sources['original']); }
			if ( $encodevideo_info[$name."_exists"] ) { $sources[$name] = '<source src="'.$encodevideo_info[$name."url"].'" type="video/'.$type.'">'; }
		}
		
		if ( $query_atts['align'] != "left" || $query_atts['inline'] == "true" ) { 
			$aligncode = ' style="';
			if ( $query_atts['align'] != "left" ) { $aligncode .= 'margin-left:auto; '; }
			if ( $query_atts['align'] == "center" ) { $aligncode .= ' margin-right:auto;'; }
			if ( $query_atts['inline'] == "true" ) { $aligncode .= 'display:inline-block;'; }
			$aligncode .= '" ';
		}
		else { $aligncode = ""; }
		
		if ( $options['embed_method'] == "WordPress Default" ) {
			$code = "[video ";
			foreach ($video_formats as $name => $type) {
				if ( $name != "original" && $encodevideo_info[$name."url"] == $content ) { unset($sources['original']); }
				if ( $encodevideo_info[$name."_exists"] ) { $sources[$name] = $type.'="'.$encodevideo_info[$name."url"].'" '; }
			}
			$code .= implode($sources);
			if ( $query_atts["poster"] != '' ) { $code .= 'poster="'.$query_atts["poster"].'" '; }
			$code .= 'width="'.$query_atts["width"].'" height="'.$query_atts["height"].'"';
			if ( $query_atts["loop"] == 'true') { $code .= 'loop="true" '; }
			if ( $query_atts["autoplay"] == 'true') { $code .= 'autoplay="true" '; }
			$code .= "]";
			return do_shortcode($code);
		}
		
		$code = "";

		$code .= '<div id="kgvid_'.$div_suffix.'_wrapper" class="kgvid_wrapper"'.$aligncode.'>';
		$code .= '<div id="video_'.$div_suffix.'_div" class="kgvid_videodiv" itemscope itemtype="http://schema.org/VideoObject">';
		if ( $query_atts["poster"] != '' ) { $code .= '<meta itemprop="thumbnailURL" content="'.$query_atts["poster"].'" />'; }
		if ( !empty($id) ) { $schema_embedURL = site_url('/')."?attachment_id=".$id."&amp;kgvid_video_embed[enable]=true"; }
		else { $schema_embedURL = $content; }
		$code .= '<meta itemprop="embedURL" content="'.$schema_embedURL.'" />';
		
		if ( !empty($query_atts['title']) ) { $code .= '<meta itemprop="name" content="'.$query_atts['title'].'" />'; }
		if ( !empty($query_atts['description']) ) { $description = $query_atts['description']; }
		elseif ( !empty($query_atts['caption']) ) { $description = $query_atts['caption']; }
		else { $description = ""; }
		if ( !empty($description) ) { $code .= '<meta itemprop="description" content="'.esc_attr($description).'" />'; }

		$code .= '<video id="video_'.$div_suffix.'" ';
		if ( $query_atts["loop"] == 'true') { $code .= 'loop '; }
		if ( $query_atts["autoplay"] == 'true') { $code .= 'autoplay '; }
		if ( $query_atts["controlbar"] != 'none') { $code .= 'controls '; }
		$code .= 'preload="metadata" ';
		if ( $query_atts["poster"] != '' ) { $code .= 'poster="'.$query_atts["poster"].'" '; }
		$code .= 'width="'.$query_atts["width"].'" height="'.$query_atts["height"].'"';
		$code .= ' class="video-js '.$options['js_skin'].'" data-setup=\'{}\''; 
		$code .= ">\n";
		
		$code .= implode("\n", $sources); //add the <source> tags created earlier

		$code .= "</video>\n";
		$code .= "</div>";

		$show_views = false;
		if ( !empty($id) || !empty($query_atts['caption']) || $content == plugins_url('/images/sample-video-h264.mp4', __FILE__) ) { //generate content below the video
			$view_count = number_format(intval(get_post_meta($id, "_kgflashmediaplayer-starts", true)));
			if ( empty($view_count) ) { $view_count = "0"; } 
			if ( $content == plugins_url('/images/sample-video-h264.mp4', __FILE__) ) { $view_count = "XX"; }
			if ( $query_atts['view_count'] == "true" ) { $show_views = true; }
			if ( !empty($query_atts['caption']) || $show_views || $query_atts['downloadlink'] == "true" ) {
				$code .= '<div class="kgvid_below_video" id="video_'.$div_suffix.'_below">';
				if ( $show_views ) { $code .= '<div class="kgvid-viewcount" id="video_'.$div_suffix.'_viewcount">'.$view_count.' views</div>'; }
				if ( !empty($query_atts['caption']) || $query_atts['downloadlink'] == "true" ) { 
					$code .= '<div class="kgvid-caption" id="video_'.$div_suffix.'_caption">'.$query_atts['caption'];
					if ( $query_atts['downloadlink'] == "true" ) {
						if ( !empty($query_atts['caption']) ) { $code .= '<br>'; }
						$code .= '<a href="'.$content.'">Right-click or ctrl-click on this link to download.</a>';
					}
					$code .= '</div>'; 
				}
				$code .= '</div>';
			}
		}

		if ( $query_atts['title'] != "false" || $query_atts['embedcode'] != "false" ) { //generate content overlaid on video
			$kgvid_meta = true;		
			$code .= "<div style=\"display:none;\" id=\"video_".$div_suffix."_meta\" class=\"kgvid_video_meta kgvid_video_meta_hover\">";
			if ( $query_atts['embedcode'] != "false" ) {
				if ( $query_atts['embedcode'] == "true" ) { $iframeurl = site_url('/')."?attachment_id=".$id."&amp;kgvid_video_embed[enable]=true"; }
				else { $iframeurl = $query_atts['embedcode']; }
				$iframecode = "<iframe src='".$iframeurl."' frameborder='0' scrolling='no' width='".$query_atts['width']."' height='".$query_atts["height"]."'></iframe>";
				$code .= "<div id=\"video_".$div_suffix."_embed\" class=\"kgvid_share\"><span>Embed: </span><input type=\"text\" value=\"".$iframecode."\" onClick=\"this.select();\"></div>";
			}
			if ( $query_atts['title'] != "false" ) {
				$code .= "<div id='video_".$div_suffix."_title' class='kgvid_title'>".$query_atts['title']."</div>"; 
			}
			$code .= "</div>";
		}
		else { $kgvid_meta = false; }
		if ( !empty($query_atts["watermark"]) && $query_atts["watermark"] != "false" ) { $code .= "<div style=\"display:none;\" id='video_".$div_suffix."_watermark' class='kgvid_watermark'><img src='".$query_atts["watermark"]."' alt='watermark'></div>"; } //generate watermark
		$code .= "</div>"; //end kgvid_XXXX_wrapper div

		$video_variables = array(
			'id' => $div_suffix,
			'player_type' => $options['embed_method'],
			'width' => $query_atts['width'],
			'height' => $query_atts['height'],
			'countable' => $countable,
			'title' => esc_js($stats_title),
			'autoplay' => $query_atts['autoplay'],
			'set_volume' => $query_atts["volume"],
			'meta' => $kgvid_meta,
			'endofvideooverlay' => $query_atts['endofvideooverlay']
		);
		$json_video_variables = json_encode( $video_variables );
			
		$code .= "\n\t\t"."<script type='text/javascript'>
			kgvid_video_vars['".$div_suffix."'] = jQuery.parseJSON ( '".$json_video_variables."' );";
		if ( $options['embed_method'] == "Video.js" || ($options['embed_method'] == "Strobe Media Playback" && !$flash_source_found) ) {
		$code .= "\n\t\t\t"."if(typeof(jQuery)=='function'){(function($){\$.fn.fitVids=function(){}})(jQuery)};
			videojs('video_".$div_suffix."').ready(function(){ kgvid_setup_video('".$div_suffix."'); });";
		}
		if ( $options['embed_method'] == "Strobe Media Playback" && $flash_source_found ) {
			$code .= "\n\t\t\t"."swfobject.embedSWF('".$video_swf."', 'video_".$div_suffix."', '".trim($query_atts['width'])."', '".trim($query_atts['height'])."', '".$minimum_flash."', '".plugins_url("", __FILE__)."/flash/expressInstall.swf', $flashvars, $params, '', function(e) { kgvid_setup_video(".$div_suffix."); });";
		} //if Strobe Media
			
		/* if ( $query_atts["video_security"] == "on" ) { $code .= "\n\t\t\t"."jQuery('#video_".$div_suffix."').bind('contextmenu',function() { return false; });"; } */
		$code .= "\n\t\t"."</script>";
		
	} //if not gallery
	
	else { //if gallery
		$thumbnail_aspect = false;
		$code = "";
		$args = array( 
			'post_type' => 'attachment', 
			'orderby' => $query_atts['gallery_orderby'], 
			'order' => $query_atts['gallery_order'], 
			'post_mime_type' => 'video', 
			'numberposts' => -1, 
			'post_status' => null, 
			'post_parent' => $query_atts['gallery_id'], 
			'exclude' => $query_atts['gallery_exclude'] 
		);
		if ( !empty($query_atts['gallery_include']) ) { 
			$args['include'] = $query_atts['gallery_include'];
			unset($args['post_parent']);
		}
		$attachments = get_posts($args);
		if ($attachments) {
		
			$div_suffix = substr(uniqid(rand(), true),0,4);
			$code .= '<div class="kgvid_gallerywrapper">';
			foreach ( $attachments as $attachment ) {
				$thumbnail_url = get_post_meta($attachment->ID, "_kgflashmediaplayer-poster", true);
				$poster_id = get_post_meta($attachment->ID, '_kgflashmediaplayer-poster-id', true);
				if ( !empty($poster_id) && intval($query_atts['gallery_thumb']) <= get_option('medium_size_h') ) {
					$poster_post = get_post($poster_id);
					if ( $poster_post->guid == $thumbnail_url ) {
						$thumbnail_url = kgvid_get_attachment_medium_url($poster_id); 
						$thumbnail_info = wp_get_attachment_image_src($poster_id);
						$thumbnail_aspect = round($thumbnail_info[2]/$thumbnail_info[1], 4); //height/width
					} //use the "medium" size image if available
				}
				if (!$thumbnail_url) { $thumbnail_url = $options['poster']; } //use the default poster if no thumbnail set
				if (!$thumbnail_url) { $thumbnail_url = plugins_url('/images/nothumbnail.jpg', __FILE__);} //use the blank image if no other option
				
				$video_width = get_post_meta($attachment->ID, "_kgflashmediaplayer-actualwidth", true);
				if ( !$video_width ) { $video_width = get_post_meta($attachment->ID, "_kgflashmediaplayer-width", true); }
				if ( !$video_width || $video_width > intval($options['gallery_width']) ) { $video_width = $options['gallery_width']; }
				
				$video_height = get_post_meta($attachment->ID, "_kgflashmediaplayer-actualheight", true);
				if ( !$video_height ) { $video_height = get_post_meta($attachment->ID, "_kgflashmediaplayer-height", true); }
				if ( !$video_height || $video_height > intval($options['gallery_height']) ) { $video_height = $options['gallery_height']; }
				
				if ( !$thumbnail_aspect ) { $thumbnail_aspect = round($video_height/$video_width, 4); } //if the thumbnail's not an attachment, set the aspect ratio to the video's
				
				$play_scale = strval( round(intval($query_atts["gallery_thumb"])/600,2) );
				
				$downloadlink = get_post_meta($attachment->ID, "_kgflashmediaplayer-downloadlink", true);
				if ( empty($query_atts['caption']) ) { $query_atts['caption'] = $attachment->post_excerpt; }
				$below_video = 0;
				if ( !empty($query_atts['caption']) ) { $below_video = 1; }
				if ( $downloadlink == "checked" ) { ++$below_video; }
				
				$code .= '<div onclick="kgvid_SetVideo(\''.$div_suffix.'\', \''.site_url('/').'\', \''.$attachment->ID.'\', \''.$video_width.'\', \''.$video_height.'\', '.$below_video.');return false;" class="kgvid_video_gallery_thumb" style="width:'.$query_atts["gallery_thumb"].'px"><img src="'.$thumbnail_url.'"><div class="'.$options['js_skin'].'" ><div class="vjs-big-play-button" style="-webkit-transform: scale('.$play_scale.') translateY(-30px); -o-transform: scale('.$play_scale.') translateY(-30px); -ms-transform: scale('.$play_scale.') translateY(-30px); transform: scale('.$play_scale.') translateY(-30px);"><span></span></div></div><div class="titlebackground"><div class="videotitle">'.$attachment->post_title.'</div></div></div>'."\n\t\t\t";
			}
			
			$code .= '</div>'; //end wrapper div
			$code .= '<div id="kgvid_GalleryPlayerDiv_'.$div_suffix.'"></div>';
			$code .=  '<script type="text/javascript">jQuery(document).ready(function() { 
					jQuery(\'#kgvid_GalleryPlayerDiv_'.$div_suffix.'\').dialog({ 
						zIndex: 1000, 
						autoOpen: false, 
						modal: true, 
						resizable: false, 
						dialogClass: \'notitle\',
						create: function(event, ui){
							jQuery(\'.ui-dialog\').wrap(\'<div class="kgvid_gallery" />\');
						},
						open: function(event, ui){
							jQuery(\'.ui-widget-overlay\').wrap(\'<div class="kgvid_gallery" />\');
						},
						close: function(event, ui){
							jQuery(\'#kgvid_GalleryPlayerDiv_'.$div_suffix.'\').empty();
							jQuery(".kgvid_gallery").filter(function(){
								if (jQuery(this).text() == "") { return true; }
								return false;
							}).remove();
						} 
					}); 
				}); </script>';			
				
		} //if there are attachments
	} //if gallery
	return $code;
}
add_shortcode('FMP', 'KGVID_shortcode');
add_shortcode('KGVID', 'KGVID_shortcode');

function kgvid_ajax_generate_encode_checkboxes() {

	global $wpdb;

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	$movieurl = $_POST['movieurl'];
	$post_id = $_POST['post_id'];
	$page = $_POST['page'];
	
	if (isset($_POST['encodeformats'])) { 
		$encode_checked = $_POST['encodeformats'];
		foreach ( $encode_checked as $format => $checked ) {
			if ( $checked == "true" ) { update_post_meta($post_id, '_kgflashmediaplayer-encode'.$format, 'on'); }
			else { update_post_meta($post_id, '_kgflashmediaplayer-encode'.$format, 'notchecked'); }
		}
	}	

	$checkboxes = kgvid_generate_encode_checkboxes($movieurl, $post_id, $page);
	$arr = array("embed_display" => $checkboxes);
	echo json_encode($arr);
	die();
	
}
add_action('wp_ajax_kgvid_generate_encode_checkboxes', 'kgvid_ajax_generate_encode_checkboxes');

function kgvid_generate_encode_checkboxes($movieurl, $post_id, $page) {
	
	$options = get_option('kgvid_video_embed_options');
	$video_embed_queue = get_option('kgvid_video_embed_queue');
	$video_formats = kgvid_video_formats();
	
	$video_queued = false;
	$something_to_encode = false;
	$encoding_now = false;
	$encode_disabled = "";
	$post_mime_type = "";
	$actualwidth = "1921";
	$actualheight = "1081";
	$rotated = false;
	$encodevideo_info = array();
	
	if ( !empty($movieurl) ) {
		
		$encodevideo_info = kgvid_encodevideo_info($movieurl, $post_id);
		$sanitized_url = kgvid_sanitize_url($movieurl);
		$movieurl = $sanitized_url['movieurl'];
		if ( get_post_type($post_id) == "attachment" ) { //if the video is in the database
			$post_mime_type = get_post_mime_type($post_id);
			$actualwidth = get_post_meta($post_id, "_kgflashmediaplayer-actualwidth", true);
			$actualheight = get_post_meta($post_id, "_kgflashmediaplayer-actualheight", true);
			$rotated = get_post_meta($post_id, "_kgflashmediaplayer-rotate", true);
		}
		else { //video's not in the database
			
			$post_mime_type = "video/".pathinfo($movieurl, PATHINFO_EXTENSION);

			if ( !empty($video_embed_queue) ) {
				foreach ($video_embed_queue as $video_key => $video_entry) {
					if ( $video_entry['movieurl'] == $movieurl ) { 
						if ( array_key_exists('movie_info', $video_entry) ) {
							$actualwidth = $video_entry['movie_info']['width'];
							$actualheight = $video_entry['movie_info']['height'];
							$rotated = $video_entry['movie_info']['rotate'];
						}
						break;
					}
				}
			}
			reset($video_embed_queue);
			
			if ( $page == "queue" ) {
				//$info = pathinfo($movieurl); 
				//$post_id = 'singleurl_'.sanitize_title_with_dashes(urldecode(basename($movieurl,'.'.$info['extension'])));
			}
		}
		if ( $post_mime_type == "video/m4v" || $post_mime_type == "video/quicktime" ) { $post_mime_type = "video/mp4"; }
	}
	else {
		$encode_disabled = ' disabled title="Please enter a valid video URL"';
	}
	
	if ( $options['ffmpeg_exists'] == "notinstalled" ) { 
		$ffmpeg_disabled_text = 'disabled="disabled" title="'.strtoupper($options['video_app']).' not found at '.$options['app_path'].'"'; 
	}
	else { $ffmpeg_disabled_text = ""; }
	
	$video_key = false;
	$rotated_queue = false;
	if ( !empty($video_embed_queue) && !empty($movieurl) ) {
		foreach ($video_embed_queue as $video_key => $video_entry) {
			if ( $video_entry['movieurl'] == $movieurl ) { 
				foreach ( $video_entry['encode_formats'] as $format => $value ) {
					$video_formats[$format]['status'] = $value['status'];
					if ( $format == "rotated" && $value['status'] != 'notchecked') {
						$rotated_queue = true;
					}
				}
				$video_queued = true;
				break;
			}
		}
	}
	
	if ( (!$rotated && !$rotated_queue) || $post_mime_type != "video/mp4" )  { unset($video_formats['rotated']); }
	
	$checkboxes = '<div id="attachments-'.$post_id.'-kgflashmediaplayer-encodeboxes">';
	foreach ( $video_formats as $format => $format_stats ) {
		if ( strpos($post_mime_type, $format) !== false ) { continue; } //skip webm or ogv checkbox if the video is webm or ogv
		$encodeset[$format] = "";
		$checked[$format] = "";
		$meta[$format] = "";
		$disabled[$format] = "";
		$child_id[$format] = "";

		if ( !array_key_exists('status', $format_stats) ) { $format_stats['status'] = "notchecked"; } //if this video isn't in the queue

		if ( get_post_type($post_id) == "attachment" ) { $encodeset[$format] = get_post_meta($post_id, "_kgflashmediaplayer-encode".$format, true); }
		if ( $encodeset[$format] == "" && $format != "rotated" ) { $encodeset[$format] = $options['encode_'.$format]; }
	
		if ( $format_stats['status'] == "lowres" || ( $actualheight != "" && ($format == "1080" || $format == "720") && ( (strpos($post_mime_type, "mp4") !== false && $actualheight <= $format_stats['height']) || (strpos($post_mime_type, "mp4") === false && $actualheight < $format_stats['height']) ) ) ) { continue; } //if the format is bigger than the original video, skip the checkbox

		if ( $encodeset[$format] == "on" || $format_stats['status'] == "queued" ) { $checked[$format] = 'checked'; }

		if ( $format_stats['status'] != "notchecked" ) { //File is in queue
			$meta[$format] = ' <strong>'.ucfirst($format_stats['status']).'</strong>';
			if ( $format_stats['status'] == "error" ) { 
				$meta[$format] .= ': <span style="color:red;">'.$video_embed_queue[$video_key]['encode_formats'][$format]['lastline']."</span>";
			}
		}	
	
		if ( !empty($encodevideo_info) ) {
			if ( $encodevideo_info[$format.'_exists'] ) { //if the video file exists
				if ( $format_stats['status'] != "encoding" ) { // not currently encoding
					if ( $format_stats['status'] == "notchecked" ) { $meta[$format] = ' <strong>Encoded</strong>'; }
					if ( $format_stats['status'] != "canceling" ) {
						if ( array_key_exists($format.'id', $encodevideo_info) ) { $child_id[$format] = $encodevideo_info[$format.'id']; }
						if ( $encodevideo_info[$format.'_writable'] ) { $meta[$format] .= '<a id="delete-'.$post_id.'-'.$format.'" class="kgvid_delete-format" onclick="kgvid_delete_video(\''.$movieurl.'\', \''.$post_id.'\', \''.$format.'\', \''.$child_id[$format].'\');" href="javascript:void(0)">Delete Permanently</a>'; }
					}
					$disabled[$format] = ' disabled title="Format already exists"';
					$checked[$format] = '';
				}	
			}
			else { $something_to_encode = true; } //if the video file doesn't exist, there's something to encode
		}
		
		if ( $format_stats['status'] == "encoding" ) {
			$encoding_now = true;
			$disabled[$format] = ' disabled title="Currently Encoding"';
			$checked[$format] = 'checked';
			$progress = kgvid_encode_progress($video_key, $format, $page);
			$meta[$format] = $progress['embed_display'];
		}
		
		if ( $format_stats['status'] == "Encoding Complete" ) {
			$disabled[$format] = ' disabled title="Format already exists"';
			$checked[$format] = '';
		}
	
		if ( $checked[$format] == '' ) { $something_to_encode = true; }
 		
		$checkboxes .= "\n\t\t\t".'<input type="checkbox" id="attachments-'.$post_id.'-kgflashmediaplayer-encode'.$format.'" name="attachments['.$post_id.'][kgflashmediaplayer-encode'.$format.']" '.$checked[$format].' '.$ffmpeg_disabled_text.$disabled[$format].'> <label for="attachments-'.$post_id.'-kgflashmediaplayer-encode'.$format.'">'.$format_stats['name'].'</label> <span id="attachments-'.$post_id.'-kgflashmediaplayer-meta'.$format.'">'.$meta[$format].'</span><br />';

	}
	if ( $something_to_encode == false ) {
		$encode_disabled = ' disabled title="Nothing to encode" style="display:none;"';
	}
	
	if ( $page == "queue" ) { 
		$button_text = "Update";
		$checkboxes .= "\n\t\t\t".'<input type="hidden" name="attachments['.$post_id.'][kgflashmediaplayer-url]" value="'.$movieurl.'">';
	}
	else { $button_text = "Encode"; }
	
	$checkboxes .= '<input type="button" id="attachments-'.$post_id.'-kgflashmediaplayer-encode" name="attachments['.$post_id.'][kgflashmediaplayer-encode]" class="button-secondary" value="'.$button_text.'" onclick="kgvid_enqueue_video_encode(\''.$post_id.'\');" '.$ffmpeg_disabled_text.$encode_disabled.'/><div style="display:block;" id="attachments-'.$post_id.'-encodeplaceholder"></div>';
	
	if ( $page != "queue" ) { 
		$checkboxes .= '<small><em>Generates additional video formats compatible with most mobile & HTML5-compatible browsers.</em></small>';
	}
	
	if ( $video_queued == true ) {
		while ( count($video_formats) > 0 ) {
			$last_format = array_pop( $video_formats );
			if ( $last_format['status'] != "notchecked" ) { break; } //get the final queued format
		}
	
		if ( !$encoding_now && ($last_format['status'] == "queued" || $last_format['status'] == "canceling") ) {
			$checkboxes .= '<script type="text/javascript">percent_timeout = setTimeout(function(){ kgvid_redraw_encode_checkboxes("'.$video_entry['movieurl'].'", "'.$video_entry['attachmentID'].'", "'.$page.'") }, 10000); jQuery(\'#wpwrap\').data("KGVIDCheckboxTimeout", percent_timeout);</script>';
		}
	}
	$checkboxes .= '</div>'; //close encodeboxes div
	
	return $checkboxes;
}

function kgvid_generate_queue_table() {

	$html = "";

	$video_embed_queue = get_option('kgvid_video_embed_queue');
	$nonce = wp_create_nonce('video-embed-thumbnail-generator-nonce');

	if ( !empty($video_embed_queue) ) {
	
		$video_formats = kgvid_video_formats();
		$currently_encoding = array();
		$nonce = wp_create_nonce('video-embed-thumbnail-generator-nonce');
		$html .= "<input type='hidden' name='attachments[kgflashmediaplayer-security]' value='".$nonce."' />";
		
		foreach ( $video_embed_queue as $order => $video_entry ) {
			$html .= "\t<tr id='tr_".$video_entry['attachmentID']."'";
			foreach ( $video_formats as $format => $format_stats ) {
				if ( $video_entry['encode_formats'][$format]['status'] == "encoding" ) {
					$currently_encoding[$order] = true;
					$html .= " class='currently_encoding' ";
					break;
				}
				else { $currently_encoding[$order] = false; }
			}
			$html .= ">";
			$html .= "<td id='td_".$video_entry['attachmentID']."'>".strval(intval($order)+1)."</td>\n";
			$thumbnail_url = get_post_meta($video_entry['attachmentID'], "_kgflashmediaplayer-poster", true);
			$thumbnail_html = "";
			if ($thumbnail_url != "" ) { 		
				$thumbnail_html = '<img width="100" src="'.$thumbnail_url.'">'; 
			}
			if ( get_post_type($video_entry['attachmentID']) == "attachment" ) { 
				$moviefilepath = get_attached_file($video_entry['attachmentID']);
				$attachmentlink = "media.php?attachment_id=".$video_entry['attachmentID']."&action=edit";
			}
			else { 
				$moviefilepath = $video_entry['movieurl']; 
				$attachmentlink = $video_entry['movieurl'];
			}
			$html .= "\t\t\t\t\t<td><a href='".$attachmentlink."'> ".$thumbnail_html."</a></td>\n"; 
			$html .= "\t\t\t\t\t<td><a id='".$moviefilepath."' href='".$attachmentlink."'>".urldecode(basename($moviefilepath))."</a><input type='hidden' name='attachments[".$video_entry['attachmentID']."][kgflashmediaplayer-url]' value='".$video_entry['movieurl']."'></td>\n";
			$html .= "\t\t\t\t\t<td class='queue_encode_formats' id='formats_".$video_entry['attachmentID']."'>";
			$html .= "<input type='hidden' name='attachments[".$video_entry['attachmentID']."][kgflashmediaplayer-security]' value='".$nonce."' />";
			$html .= kgvid_generate_encode_checkboxes($video_entry['movieurl'], $video_entry['attachmentID'], 'queue');
			$html .= "</td>\n";
			$html .= "\t\t\t\t\t<td>";
			$html .= "<a id='clear_".$video_entry['attachmentID']."' class='submitdelete' href='javascript:void(0)' onclick='kgvid_encode_queue(\"delete\", ".$order.")'";
			if ( $currently_encoding[$order] ) { $html .= " style='display:none;'"; }
			$html .= ">Clear</a>";
			$html .= "</td></tr>\n"; 
		}
	}
	else { $html = "\t<tr><td colspan='5'>Queue is Empty</td></tr>\n"; }

return $html;

}

function kgvid_add_FFMPEG_Queue_Page() {
	$options = get_option('kgvid_video_embed_options');
	if ( $options['ffmpeg_exists'] == "on" ) { //only add the queue page if FFMPEG is installed
		add_submenu_page('tools.php', 'Video Embed & Thumbnail Generator Encoding Queue', 'Video Encode Queue', 'manage_options', 'kgvid_video_encoding_queue', 'kgvid_FFMPEG_Queue_Page');
	}
}
add_action('admin_menu', 'kgvid_add_FFMPEG_Queue_Page');

function kgvid_FFMPEG_Queue_Page() {
	
?>
	<div class="wrap">
		<div id="icon-tools" class="icon32"><br /></div>
		<h2>Video Embed & Thumbnail Generator Encoding Queue</h2>
		<p></p>
		<form method="post" action="tools.php?page=kgvid_video_encoding_queue">
		<?php wp_nonce_field('video-embed-thumbnail-generator-nonce','video-embed-thumbnail-generator-nonce'); ?>
		<table class="widefat">
			<thead>
				<tr>
				<th>Order</th>
				<th>Thumbnail</th>
				<th>File</th>
				<th>Formats</th>
				<th>Actions</th>
			</thead>
			<tfoot>
				<tr>
				<th>Order</th>
				<th>Thumbnail</th>
				<th>File</th>
				<th>Formats</th>
				<th>Actions</th>
			</tfoot>
			<tbody class="rows">
				<?php echo kgvid_generate_queue_table(); ?>
			</tbody>
		</table>
		<!-- <input type='button' class='button-secondary' value='sort' onclick='jQuery("#sortable tbody.rows").trigger("sortupdate"); jQuery( "#sortable tbody.rows" ).sortable("refresh");'> -->
		<p>
			
			<input type='button' class='button-secondary' value='Clear All Completed' onclick='kgvid_encode_queue("clear_completed", 0);'>
		</p>
		</form>
	</div>
<?php
} 

function kgvid_addFMPOptionsPage() {
		add_options_page('Video Embed & Thumbnail Generator', 'Video Embed & Thumbnail Generator', 'administrator', __FILE__, 'kgvid_FMPOptionsPage');
}
add_action('admin_menu', 'kgvid_addFMPOptionsPage');

function kgvid_FMPOptionsPage() {
	$options = get_option('kgvid_video_embed_options');
	?>
	<div class="wrap">
		<div class="icon32" id="icon-options-general"><br></div>
		<h2>Video Embed & Thumbnail Generator</h2>
		<h2 class="nav-tab-wrapper">  
			<a href="#" id="general_tab" class="nav-tab" onclick="kgvid_switch_settings_tab('general');">General</a>  
			<a href="#" id="encoding_tab" class="nav-tab" onclick="kgvid_switch_settings_tab('encoding');"><span class='video_app_name'><?php echo strtoupper($options['video_app']); ?></span> Settings</a>  
		</h2>  
		<form method="post" action="options.php">
		<?php settings_fields('kgvid_video_embed_options'); ?>
		<input type="hidden" id="kgvid_settings_security" value="<?php echo wp_create_nonce('video-embed-thumbnail-generator-nonce'); ?>">
		<?php do_settings_sections(__FILE__); ?>
     	<p class='submit'>
   		   <?php submit_button('Save Changes', 'primary', 'kgvid_submit', false); ?>
   		   <?php submit_button('Reset Options', 'secondary', 'video-embed-thumbnail-generator-reset', false); ?>
   		</p>
		</form>
		<?php echo "<script type='text/javascript'>
			jQuery(document).ready(function() {
					jQuery('#app_path').data('ffmpeg_exists', '".$options['ffmpeg_exists']."');
					kgvid_switch_settings_tab('general');
					jQuery('form :input').change(function() {
  						kgvid_save_plugin_settings(this);
					});
				}
			);
		</script>"; ?>
	</div>
<?php
}

function kgvid_video_embed_options_init() {

	register_setting('kgvid_video_embed_options', 'kgvid_video_embed_options', 'kgvid_video_embed_options_validate' );
	
	$options = get_option('kgvid_video_embed_options');
	
	add_settings_section('kgvid_video_embed_playback_settings', 'Default Video Playback Settings', 'kgvid_plugin_playback_settings_section_callback', __FILE__);
	add_settings_section('kgvid_video_embed_flash_settings', 'The following options will only affect Flash playback', 'kgvid_plugin_flash_settings_section_callback', __FILE__);
	add_settings_section('kgvid_video_embed_plugin_settings', 'Plugin Settings', 'kgvid_plugin_settings_section_callback', __FILE__);
	add_settings_section('kgvid_video_embed_encode_settings', 'Video Encoding Settings', 'kgvid_plugin_settings_section_callback', __FILE__);
	
	add_settings_field('poster', 'Default thumbnail:', 'kgvid_poster_callback', __FILE__, 'kgvid_video_embed_playback_settings', array( 'label_for' => 'poster' ) );
	add_settings_field('endOfVideoOverlay', 'End of video image:', 'kgvid_endOfVideoOverlay_callback', __FILE__, 'kgvid_video_embed_playback_settings' );
	add_settings_field('watermark', 'Watermark image:', 'kgvid_watermark_callback', __FILE__, 'kgvid_video_embed_playback_settings', array( 'label_for' => 'watermark' ) );
	add_settings_field('align', 'Video alignment:', 'kgvid_align_callback', __FILE__, 'kgvid_video_embed_playback_settings', array( 'label_for' => 'align' ) );
	add_settings_field('inline', 'Inline videos:', 'kgvid_inline_callback', __FILE__, 'kgvid_video_embed_playback_settings', array( 'label_for' => 'inline' ) );
	add_settings_field('dimensions', 'Max embedded video dimensions:', 'kgvid_dimensions_callback', __FILE__, 'kgvid_video_embed_playback_settings', array( 'label_for' => 'width' ) );
	add_settings_field('gallery_dimensions', 'Max gallery video dimensions:', 'kgvid_gallery_dimensions_callback', __FILE__, 'kgvid_video_embed_playback_settings', array( 'label_for' => 'gallery_width' ) );
	add_settings_field('gallery_thumb', 'Gallery thumbnail width:', 'kgvid_gallery_thumb_callback', __FILE__, 'kgvid_video_embed_playback_settings', array( 'label_for' => 'gallery_thumb' ) );
	add_settings_field('controlbar_style', 'Controlbar style:', 'kgvid_controlbar_style_callback', __FILE__, 'kgvid_video_embed_playback_settings', array( 'label_for' => 'controlbar_style' ) );
	add_settings_field('autoplay', 'Autoplay:', 'kgvid_autoplay_callback', __FILE__, 'kgvid_video_embed_playback_settings', array( 'label_for' => 'autoplay' ) );
	add_settings_field('loop', 'Loop:', 'kgvid_loop_callback', __FILE__, 'kgvid_video_embed_playback_settings', array( 'label_for' => 'loop' ) );
	add_settings_field('js_skin', 'Skin Class:', 'kgvid_js_skin_callback', __FILE__, 'kgvid_video_embed_playback_settings', array( 'label_for' => 'js_skin' ) );
	
	add_settings_field('bgcolor', 'Background color:', 'kgvid_bgcolor_callback', __FILE__, 'kgvid_video_embed_flash_settings', array( 'label_for' => 'bgcolor' ) );
	add_settings_field('configuration', 'XML configuration file:', 'kgvid_configuration_callback', __FILE__, 'kgvid_video_embed_flash_settings', array( 'label_for' => 'configuration' ) );
	add_settings_field('skin', 'Video skin file:', 'kgvid_skin_callback', __FILE__, 'kgvid_video_embed_flash_settings', array( 'label_for' => 'skin' ) );
	add_settings_field('stream_type', 'Video stream type:', 'kgvid_stream_type_callback', __FILE__, 'kgvid_video_embed_flash_settings', array( 'label_for' => 'stream_type' ) );
	add_settings_field('scale_mode', 'Video scale mode:', 'kgvid_scale_mode_callback', __FILE__, 'kgvid_video_embed_flash_settings', array( 'label_for' => 'scale_mode' ) );
	add_settings_field('autohide', 'Autohide:', 'kgvid_autohide_callback', __FILE__, 'kgvid_video_embed_flash_settings', array( 'label_for' => 'autohide' ) );
	add_settings_field('playbutton', 'Play button overlay:', 'kgvid_playbutton_callback', __FILE__, 'kgvid_video_embed_flash_settings', array( 'label_for' => 'playbutton' ) );
	
	add_settings_field('generate_thumbs', 'Default number of thumbnails to generate:', 'kgvid_generate_thumbs_callback', __FILE__, 'kgvid_video_embed_plugin_settings', array( 'label_for' => 'generate_thumbs' ) );
	add_settings_field('embeddable', 'Allow embedding:', 'kgvid_embeddable_callback', __FILE__, 'kgvid_video_embed_plugin_settings', array( 'label_for' => 'embeddable' ) );
	add_settings_field('featured', 'Featured Image:', 'kgvid_featured_callback', __FILE__, 'kgvid_video_embed_plugin_settings', array( 'label_for' => 'featured' ) );
	add_settings_field('thumb_parent', 'Attach thumbnails to:', 'kgvid_thumb_parent_callback', __FILE__, 'kgvid_video_embed_plugin_settings', array( 'label_for' => 'thumb_parent' ) );
	add_settings_field('delete_children', 'Delete associated attachments:', 'kgvid_delete_children_callback', __FILE__, 'kgvid_video_embed_plugin_settings', array( 'label_for' => 'delete_children' ) );
	/* add_settings_field('video_security', 'Attempt to secure video file:', 'kgvid_video_security_callback', __FILE__, 'kgvid_video_embed_plugin_settings', array( 'label_for' => 'video_security' ) ); */
	add_settings_field('titlecode', 'Video title text HTML formatting:', 'kgvid_titlecode_callback', __FILE__, 'kgvid_video_embed_plugin_settings', array( 'label_for' => 'titlecode' ) );
	add_settings_field('template', 'Attachment template display:', 'kgvid_template_callback', __FILE__, 'kgvid_video_embed_plugin_settings', array( 'label_for' => 'template' ) );
	
	add_settings_field('app_path', 'Path to applications on server:', 'kgvid_app_path_callback', __FILE__, 'kgvid_video_embed_encode_settings', array( 'label_for' => 'app_path' ) );
	add_settings_field('video_app', 'Application for thumbnails & encoding:', 'kgvid_video_app_callback', __FILE__, 'kgvid_video_embed_encode_settings', array( 'label_for' => 'video_app' ) );
	add_settings_field('browser_thumbnails', 'Enable in-browser thumbnails:', 'kgvid_browser_thumbnails_callback', __FILE__, 'kgvid_video_embed_encode_settings', array( 'label_for' => 'browser_thumbnails' ) );
	add_settings_field('encode_formats', 'Default Mobile/HTML5 Video encode formats:', 'kgvid_encode_formats_callback', __FILE__, 'kgvid_video_embed_encode_settings');
	add_settings_field('moov', 'Application to fix encoded H.264 headers for streaming:', 'kgvid_moov_callback', __FILE__, 'kgvid_video_embed_encode_settings', array( 'label_for' => 'moov' ) );
	add_settings_field('rate_control', 'Encode quality control method:', 'kgvid_rate_control_callback', __FILE__, 'kgvid_video_embed_encode_settings', array( 'label_for' => 'rate_control' ) );
	add_settings_field('CRFs', 'Constant Rate Factors (CRF):', 'kgvid_CRF_options_callback', __FILE__, 'kgvid_video_embed_encode_settings', array( 'label_for' => 'h264_CRF' ) );
	add_settings_field('bitrate_multiplier', 'Average Bit Rate:', 'kgvid_average_bitrate_callback', __FILE__, 'kgvid_video_embed_encode_settings', array( 'label_for' => 'bitrate_multiplier' ) );
	add_settings_field('h264_profile', 'H.264 profile:', 'kgvid_h264_profile_callback', __FILE__, 'kgvid_video_embed_encode_settings', array( 'label_for' => 'h264_profile' ) );
	add_settings_field('audio_bitrate', 'Audio bit rate:', 'kgvid_audio_bitrate_options_callback', __FILE__, 'kgvid_video_embed_encode_settings', array( 'label_for' => 'audio_bitrate' ) );
	add_settings_field('ffmpeg_options', 'FFMPEG legacy options:', 'kgvid_ffmpeg_options_callback', __FILE__, 'kgvid_video_embed_encode_settings', array( 'label_for' => 'video_bitrate_flag' ) );
	add_settings_field('execution', 'Execution:', 'kgvid_execution_options_callback', __FILE__, 'kgvid_video_embed_encode_settings', array( 'label_for' => 'threads' ) );

}
add_action('admin_init', 'kgvid_video_embed_options_init' );

//callback functions generating HTML for the settings form

	function kgvid_plugin_playback_settings_section_callback() {
		global $wp_version;
		$options = get_option('kgvid_video_embed_options');
		if ( $options['embeddable'] == "false" ) { $embed_disabled = "disabled"; }
		else { $embed_disabled = ""; }
		
		$items = array("Video.js", "Strobe Media Playback");
		if ( $wp_version >= 3.6 ) { $items[] = "WordPress Default"; }
		echo "<table class='form-table'><tbody><tr valign='middle'><th scope='row'><label for='embed_method'>Video player:</label></th><td><select class='affects_player' onchange='kgvid_hide_plugin_settings();' id='embed_method' name='kgvid_video_embed_options[embed_method]'>";
		foreach($items as $item) {
			$selected = ($options['embed_method']==$item) ? 'selected="selected"' : '';
			echo "<option value='$item' $selected>$item</option>";
		}
		echo "</select> <a class='kgvid_tooltip' href='javascript:void(0);'><img src='../wp-includes/images/blank.gif'><span class='kgvid_tooltip_classic'>This plugin used Strobe Media Playback for Flash playback in the past, but you can choose to use the newer and lighter Video.js method which will give priority to HTML5 and only use Flash as a fallback or if you're running WordPress version 3.6 or later you can use the built-in MediaElement.js video player.</span></a></td></tr></tbody></table>";
		
		$sampleheight = intval($options['height']) + 25;
		echo "<div class='kgvid_setting_nearvid' style='width:".$options['width']."px;'>";
		echo "<div style='float:left;'><input class='affects_player' ".checked( $options['overlay_title'], "on", false )." id='overlay_title' name='kgvid_video_embed_options[overlay_title]' type='checkbox' /> <label for='overlay_title'>Overlay video title</label></div>";
		echo "<div style='float:right;'><input class='affects_player' ".checked( $options['overlay_embedcode'], "on", false )." id='overlay_embedcode' name='kgvid_video_embed_options[overlay_embedcode]' type='checkbox' ".$embed_disabled."/> <label for='overlay_embedcode'>Overlay embed code</label></div>";
		$iframeurl = site_url('/')."?kgvid_video_embed[enable]=true&kgvid_video_embed[sample]=true";
		echo "<iframe id='kgvid_samplevideo' style='border:2px;' src='".$iframeurl."' scrolling='no' width='".$options['width']."' height='".$sampleheight."'></iframe>";
		echo "<div style='float:right;'><input class='affects_player' ".checked( $options['view_count'], "on", false )." id='view_count' name='kgvid_video_embed_options[view_count]' type='checkbox' /> <label for='view_count'>Show view count</label></div>";
		echo "</div>";
	}
	function kgvid_plugin_flash_settings_section_callback() { }
	function kgvid_plugin_settings_section_callback() { }
	
	function kgvid_poster_callback() {
		$options = get_option('kgvid_video_embed_options');
		echo "<input class='regular-text affects_player' id='poster' name='kgvid_video_embed_options[poster]' type='text' value='".$options['poster']."' />";
	}
	
	function kgvid_endOfVideoOverlay_callback() {
		$options = get_option('kgvid_video_embed_options');
		echo "<input class='affects_player' ".checked( $options['endOfVideoOverlaySame'], "true", false )." id='endOfVideoOverlaySame' name='kgvid_video_embed_options[endOfVideoOverlaySame]' type='checkbox' onclick='if (this.checked == true) { document.getElementById(\"endOfVideoOverlay\").disabled=true; } else { document.getElementById(\"endOfVideoOverlay\").disabled=false; }'/> <label for='endOfVideoOverlaySame'>Display thumbnail image again when video ends.</label><br />";
		echo "<input class='regular-text affects_player' id='endOfVideoOverlay' name='kgvid_video_embed_options[endOfVideoOverlay]' ".disabled( $options['endOfVideoOverlaySame'], "true", false )." type='text' value='".$options['endOfVideoOverlay']."' /> Display alternate image when video ends.<br /><small>";
	}
	
	function kgvid_watermark_callback() {
		$options = get_option('kgvid_video_embed_options');
		echo "<input class='regular-text affects_player' id='watermark' name='kgvid_video_embed_options[watermark]' type='text' value='".$options['watermark']."' />";
	}

	function kgvid_align_callback() {
		$options = get_option('kgvid_video_embed_options');
		$items = array("left", "center", "right");
		echo "<select id='align' name='kgvid_video_embed_options[align]'>";
		foreach($items as $item) {
			$selected = ($options['align']==$item) ? 'selected="selected"' : '';
			echo "<option value='$item' $selected>$item</option>";
		}
	}
	
	function kgvid_inline_callback() {
		$options = get_option('kgvid_video_embed_options');
		echo "<input ".checked( $options['inline'], "on", false )." id='inline' name='kgvid_video_embed_options[inline]' type='checkbox' /> <label for='inline'>Allow other content on the same line as the video.</label>";
	}
	
	function kgvid_dimensions_callback() {
		$options = get_option('kgvid_video_embed_options');
		echo "Width: <input class='small-text affects_player' id='width' name='kgvid_video_embed_options[width]' type='text' value='".$options['width']."' /> Height: <input class='small-text affects_player' id='height' name='kgvid_video_embed_options[height]' type='text' value='".$options['height']."' />";
	}
	
	function kgvid_gallery_dimensions_callback() {
		$options = get_option('kgvid_video_embed_options');
		echo "Width: <input class='small-text' id='gallery_width' name='kgvid_video_embed_options[gallery_width]' type='text' value='".$options['gallery_width']."' /> Width: <input class='small-text' id='gallery_height' name='kgvid_video_embed_options[gallery_height]' type='text' value='".$options['gallery_height']."' />";
	}
	
	function kgvid_gallery_thumb_callback() {
		$options = get_option('kgvid_video_embed_options');
		echo "<input class='small-text' id='gallery_thumb' name='kgvid_video_embed_options[gallery_thumb]' type='text' value='".$options['gallery_thumb']."' />";
	}
	
	function kgvid_controlbar_style_callback() {
		$options = get_option('kgvid_video_embed_options');
		$items = array("docked", "floating", "none");
		echo "<select class='affects_player' id='controlbar_style' name='kgvid_video_embed_options[controlbar_style]'>";
		foreach($items as $item) {
			$selected = ($options['controlbar_style']==$item) ? 'selected="selected"' : '';
			echo "<option value='$item' $selected>$item</option>";
		}
		echo "</select> HTML5 video players only respond to the \"none\" option.";
	}
	
	function kgvid_autoplay_callback() {
		$options = get_option('kgvid_video_embed_options');
		echo "<input class='affects_player' ".checked( $options['autoplay'], "on", false )." id='autoplay' name='kgvid_video_embed_options[autoplay]' type='checkbox' /> <label for='autoplay'>Play automatically when page loads.</label>";
	}
	
	function kgvid_loop_callback() {
		$options = get_option('kgvid_video_embed_options');
		echo "<input class='affects_player' ".checked( $options['loop'], "on", false )." id='loop' name='kgvid_video_embed_options[loop]' type='checkbox' /> <label for='loop'>Loop to beginning when video ends.</label>";
	}
	
	function kgvid_js_skin_callback() {
		$options = get_option('kgvid_video_embed_options');
		echo "<input class='regular-text code affects_player' id='js_skin' name='kgvid_video_embed_options[js_skin]' type='text' value='".$options['js_skin']."' /><br /><em><small>Use <code>kg-video-js-skin</code> for a nice, circular play button. Leave blank for the default square play button. <a href='http://videojs.com/docs/skins/'>Or build your own CSS skin.</a></small></em>";
	}
	
	function kgvid_bgcolor_callback() {
		$options = get_option('kgvid_video_embed_options');
		echo "<input class='small-text affects_player' id='bgcolor' name='kgvid_video_embed_options[bgcolor]' maxlength='7' type='text' value='".$options['bgcolor']."' /> #rrggbb";
	}
	
	function kgvid_configuration_callback() {
		$options = get_option('kgvid_video_embed_options');
		echo "<input class='regular-text affects_player' id='configuration' name='kgvid_video_embed_options[configuration]' type='text' value='".$options['configuration']."' />";
	}
	
	function kgvid_skin_callback() {
		$options = get_option('kgvid_video_embed_options');
		echo "<input class='regular-text affects_player' id='skin' name='kgvid_video_embed_options[skin]' type='text' value='".$options['skin']."' /><br /><em><small>Use <code>".plugins_url("", __FILE__)."/flash/skin/kgvid_skin.xml</code> for a modern, circular play button.<br /> Leave blank for the older style square play button.</small></em>";
	}
	
	function kgvid_stream_type_callback() {
		$options = get_option('kgvid_video_embed_options');
		$items = array("liveOrRecorded", "live", "recorded", "dvr");
		echo "<select class='affects_player' id='stream_type' name='kgvid_video_embed_options[stream_type]'>";
		foreach($items as $item) {
			$selected = ($options['stream_type']==$item) ? 'selected="selected"' : '';
			echo "<option value='$item' $selected>$item</option>";
		}
		echo "</select>";
	}
	
	function kgvid_scale_mode_callback() {
		$options = get_option('kgvid_video_embed_options');
		$items = array("letterbox", "none", "stretch", "zoom");
		echo "<select class='affects_player' id='scale_mode' name='kgvid_video_embed_options[scale_mode]'>";
		foreach($items as $item) {
			$selected = ($options['scale_mode']==$item) ? 'selected="selected"' : '';
			echo "<option value='$item' $selected>$item</option>";
		}
		echo "</select>";
	}
	
	function kgvid_autohide_callback() {
		$options = get_option('kgvid_video_embed_options');
		echo "<input ".checked( $options['autohide'], "on", false )." id='autohide' name='kgvid_video_embed_options[autohide]' type='checkbox' /> <label for='autohide'>Autohide controlbar.</label>";
	}
	
	function kgvid_playbutton_callback() {
		$options = get_option('kgvid_video_embed_options');
		echo "<input class='affects_player' ".checked( $options['playbutton'], "on", false )." id='playbutton' name='kgvid_video_embed_options[playbutton]' type='checkbox' /> <label for='playbutton'>Overlay play button on poster frame.</label>";
	}

	function kgvid_generate_thumbs_callback() {
		$options = get_option('kgvid_video_embed_options');
		echo "<input class='small-text' id='generate_thumbs' name='kgvid_video_embed_options[generate_thumbs]' maxlength='2' type='text' value='".strval($options['generate_thumbs'])."' />";
	}
	
	function kgvid_embeddable_callback() {
		$options = get_option('kgvid_video_embed_options');
		echo "<input ".checked( $options['embeddable'], "on", false )." id='embeddable' name='kgvid_video_embed_options[embeddable]' type='checkbox' onclick='var kgvid_overlay_embedcode = document.getElementById(\"overlay_embedcode\"); if (this.checked == false) { kgvid_overlay_embedcode.checked=false; kgvid_overlay_embedcode.disabled=true; kgvid_save_plugin_settings(kgvid_overlay_embedcode); } else { kgvid_overlay_embedcode.disabled=false; }' /> <label for='embeddable'>Allow users to embed your videos on other sites.</label>";
	}
	
	function kgvid_featured_callback() {
		$options = get_option('kgvid_video_embed_options');
		echo "<input ".checked( $options['featured'], "on", false )." id='featured' name='kgvid_video_embed_options[featured]' type='checkbox' /> <label for='featured'>Set generated video thumbnails as featured images.</label> <a class='kgvid_tooltip' href='javascript:void(0);'><img src='../wp-includes/images/blank.gif'><span class='kgvid_tooltip_classic'>If your theme uses the featured image meta tag, this will automatically set a video's parent post's featured image to the most recently saved thumbnail image.</span></a><br /> <a class='button-secondary' href='javascript:void(0);' onclick='kgvid_set_all_featured();'>Set all as featured</a> <a class='kgvid_tooltip' href='javascript:void(0);'><img src='../wp-includes/images/blank.gif'><span class='kgvid_tooltip_classic'>If you've generated thumbnails with previous versions of the plugin this will set all existing thumbnails as featured images. Be careful!</span></a>";
	}
	
	function kgvid_thumb_parent_callback() {
		$options = get_option('kgvid_video_embed_options');
		$items = array("post", "video");
		echo "<select id='thumb_parent' name='kgvid_video_embed_options[thumb_parent]'>";
		foreach($items as $item) {
			$selected = ($options['thumb_parent']==$item) ? 'selected="selected"' : '';
			echo "<option value='$item' $selected>$item</option>";
		}
		echo "</select> <a class='kgvid_tooltip' href='javascript:void(0);'><img src='../wp-includes/images/blank.gif'><span class='kgvid_tooltip_classic'>This depends on your theme. Thumbnails generated by the plugin can be saved as children of the video attachment or the post. Some themes use an image attached to a post instead of the built-in featured image meta tag. Version 3.x of this plugin saved all thumbnails as children of the video.</span></a><br /> <a class='button-secondary' href='javascript:void(0);' onclick='kgvid_switch_parents();'>Set all parents</a> <a class='kgvid_tooltip' href='javascript:void(0);'><img src='../wp-includes/images/blank.gif'><span class='kgvid_tooltip_classic'>If you've generated thumbnails before changing this option, this will set all existing thumbnails as children of your currently selected option.</span></a>";
	}
	
	function kgvid_delete_children_callback() {
		$options = get_option('kgvid_video_embed_options');
		$items = array("none", "all", "encoded videos only");
		echo "<select id='delete_children' name='kgvid_video_embed_options[delete_children]'>";
		foreach($items as $item) {
			$selected = ($options['delete_children']==$item) ? 'selected="selected"' : '';
			echo "<option value='$item' $selected>$item</option>";
		}
		echo "</select> <a class='kgvid_tooltip' href='javascript:void(0);'><img src='../wp-includes/images/blank.gif'><span class='kgvid_tooltip_classic'>If you delete the original video you can choose to delete all associated attachments (thumbnails & videos) or keep the thumbnail.</span></a>";
	}
	
	/* function kgvid_video_security_callback() {
		$options = get_option('kgvid_video_embed_options');
		echo "<input ".checked( $options['video_security'], "on", false )." id='video_security' name='kgvid_video_embed_options[video_security]' type='checkbox' /> <label for='video_security'>Disable right-clicking on video and obscure the video's URL.</label> <a class='kgvid_tooltip' href='javascript:void(0);'><img src='../wp-includes/images/blank.gif'><span class='kgvid_tooltip_classic'>We can't prevent a user from simply saving the downloaded video file from the browser's cache, but this will make it a little more difficult to download your videos.</span></a>";
	} */
	
	function kgvid_titlecode_callback() {
		$options = get_option('kgvid_video_embed_options');
		echo "<input class='regular-text code' id='titlecode' name='kgvid_video_embed_options[titlecode]' type='text' value='".htmlentities(stripslashes($options['titlecode']))."' /> <a class='kgvid_tooltip' href='javascript:void(0);'><img src='../wp-includes/images/blank.gif'><span class='kgvid_tooltip_classic'>HTML tag applied to titles inserted above the video. Ex: &lt;strong&gt;, &lt;em&gt;, &lt;H2&gt;, &lt;span class='videotitle'&gt;. Corresponding closing tags will be applied to the end of the title automatically.</span></a>";
	}
	
	function kgvid_template_callback() {
		$options = get_option('kgvid_video_embed_options');
		$items = array("Video title (WP default)"=>"none", "Video in existing template"=>"gentle", "Video only (deprecated)"=>"old");
		echo "<select id='template' name='kgvid_video_embed_options[template]'>";
		foreach($items as $name => $value) {
			$selected = ($options['template']==$value) ? 'selected="selected"' : '';
			echo "<option value='$value' $selected>$name</option>";
		}
		echo "</select> <a class='kgvid_tooltip' href='javascript:void(0);'><img src='../wp-includes/images/blank.gif'><span class='kgvid_tooltip_classic'>By default WordPress only displays a video's title on the attachment page. This plugin can filter your attachment page to display the video, or completely replace your attachment template to show only the video. If you were one of the few people using iframe embed codes before version 4.0 of this plugin then you should continue to use 'Video only' but otherwise it's not recommended.</span></a>";
	}
	
	function kgvid_app_path_callback() {
		$options = get_option('kgvid_video_embed_options');
		echo "<input class='affects_ffmpeg regular-text code' id='app_path' name='kgvid_video_embed_options[app_path]' type='text' value='".stripslashes($options['app_path'])."' /><a class='kgvid_tooltip' href='javascript:void(0);'><img src='../wp-includes/images/blank.gif'><span class='kgvid_tooltip_classic'>Don't include trailing slash. Example: <code>/usr/local/bin</code>. On Windows servers, use / instead of C:\\";
	}

	function kgvid_video_app_callback() {
		$options = get_option('kgvid_video_embed_options');
		echo "<select onchange='kgvid_hide_ffmpeg_settings();' class='affects_ffmpeg' id='video_app' name='kgvid_video_embed_options[video_app]'>";
		$items = array("FFMPEG"=>"ffmpeg", "AVCONV"=>"avconv");
		foreach($items as $name => $value) {
			$selected = ($options['video_app']==$value) ? 'selected="selected"' : '';
			echo "<option value='$value' $selected>$name</option>";
		}
		echo "</select> <a class='kgvid_tooltip' href='javascript:void(0);'><img src='../wp-includes/images/blank.gif'><span class='kgvid_tooltip_classic'>FFMPEG split into two separate branches in 2011. The new branch is called LIBAV and executes using 'avconv' instead of 'ffmpeg.' Both are still actively developed and FFMPEG frequently incorporates LIBAV features. Debian & Ubuntu users probably have LIBAV installed.</span></a>";
	}
	
	function kgvid_browser_thumbnails_callback() {
		$options = get_option('kgvid_video_embed_options');
		echo "<div class='kgvid_video_app_required'>"; 
		echo "<input ".checked( $options['browser_thumbnails'], "on", false )." id='browser_thumbnails' name='kgvid_video_embed_options[browser_thumbnails]' type='checkbox' /> <label for='browser_thumbnails'>When possible, use the browser's built-in video capabilities to make thumbnails instead of <strong class='video_app_name'>".strtoupper($options['video_app'])."</strong>.</label>";
		echo "</div>"; 
	}
	
	function kgvid_encode_formats_callback() {
		$options = get_option('kgvid_video_embed_options'); 
		echo "<div class='kgvid_video_app_required'>"; 
		echo "<input ".checked( $options['encode_1080'], "on", false )." id='encode_1080' name='kgvid_video_embed_options[encode_1080]' type='checkbox' /> <label for='encode_1080'>1080p H.264 <small><em>(iPhone 4s+, iPad 2+, few Android, Windows Phone 8, Chrome, Safari, IE 9+)</em></small></label> <a class='kgvid_tooltip' href='javascript:void(0);'><img src='../wp-includes/images/blank.gif'><span class='kgvid_tooltip_classic'>This is complicated. If you have FFMPEG/LIBAV and the proper libraries installed, you can choose to encode your uploaded video into as many as five additional formats depending on your original source. Different browsers have different playback capabilities. Most desktop browsers can play H.264, and all modern mobile devices can play at least 480p H.264. If you create multiple H.264 resolutions, the highest resolution supported by the device will be served up automatically. The plugin will not upconvert your video, so if you upload a 720p video, it will not waste your time creating a 1080p version. There was a time when it seemed like a good idea to provide OGV or WEBM for some desktop browsers, but even Firefox is planning to allow H.264 playback in the future and I no longer recommend encoding OGV or WEBM unless you expect a large number of no-Flash sticklers visiting your site.</span></a><br />";
		echo "<input ".checked( $options['encode_720'], "on", false )." id='encode_720' name='kgvid_video_embed_options[encode_720]' type='checkbox' /> <label for='encode_720'>720p H.264 <small><em>(iPhone 4+, iPad, some Android, Chrome, Safari, IE 9+)</em></small></label><br />";
		echo "<input ".checked( $options['encode_mobile'], "on", false )." id='encode_mobile' name='kgvid_video_embed_options[encode_mobile]' type='checkbox' /> <label for='encode_mobile'>480p H.264 <small><em>(iOS, Android, Windows Phone 7, Chrome, Safari, IE 9+)</em></small></label><br />";
		echo "<input ".checked( $options['encode_webm'], "on", false )." id='encode_webm' name='kgvid_video_embed_options[encode_webm]' type='checkbox' /> <label for='encode_webm'>WEBM <small><em>(Firefox, Chrome, Android 2.3+, Opera)</em></small></label><br />";
		echo "<input ".checked( $options['encode_ogg'], "on", false )." id='encode_ogg' name='kgvid_video_embed_options[encode_ogg]' type='checkbox' /> <label for='encode_ogg'>OGV <small><em>(Firefox, Chrome, Android 2.3+, Opera)</em></small></label>";
		echo '</div>';
	}
		
	function kgvid_moov_callback() {
		$options = get_option('kgvid_video_embed_options');
		echo "<div class='kgvid_video_app_required'>"; 
		$items = array("none"=>"none", strtoupper($options['video_app'])." movflag"=>"movflag", "qt-faststart"=>"qt-faststart", "MP4Box"=>"MP4Box");
		echo "<select id='moov' name='kgvid_video_embed_options[moov]' class='affects_ffmpeg'>";
		foreach($items as $name => $value) {
			$selected = ($options['moov']==$value) ? 'selected="selected"' : '';
			echo "<option value='$value' $selected>$name</option>";
		}
		echo "</select> <a class='kgvid_tooltip' href='javascript:void(0);'><img src='../wp-includes/images/blank.gif'><span class='kgvid_tooltip_classic'><strong class='video_app_name'>".strtoupper($options['video_app'])."</strong> places moov atoms at the end of H.264 encoded files, which forces the entire file to download before playback can start and can prevent Flash players from playing them at all. Since approximately October 2012 <strong class='video_app_name'>".strtoupper($options['video_app'])."</strong> can fix the problem at the end of the encoding process using `movflags faststart`. Older versions of ".strtoupper($options['video_app'])." will not work if you select the movflags option. If that is the case, select qt-faststart or MP4Box which will run after encoding is finished if they are installed on your server.</span></a>";
		echo "</div>";
	}
	
	function kgvid_rate_control_callback() {
		$options = get_option('kgvid_video_embed_options');
		echo "<div class='kgvid_video_app_required'>"; 
		echo "<select id='rate_control' name='kgvid_video_embed_options[rate_control]' onchange='kgvid_hide_ffmpeg_settings();' class='affects_ffmpeg'>";
		$items = array("Constant Rate Factor"=>"crf", "Average Bit Rate"=>"abr");
		foreach($items as $name => $value) {
			$selected = ($options['rate_control']==$value) ? 'selected="selected"' : '';
			echo "<option value='$value' $selected>$name</option>";
		}
		echo "</select> <a class='kgvid_tooltip' href='javascript:void(0);'><img src='../wp-includes/images/blank.gif'><span class='kgvid_tooltip_classic'>Constant Rate Factor (CRF) attempts to maintain a particular quality output for the entire video and only uses bits the encoder determines are necessary. Average Bit Rate is similar to the method used in previous versions of this plugin.</span></a>";
		echo "</div>";
	}
	
	function kgvid_CRF_options_callback() {
		$options = get_option('kgvid_video_embed_options');
		echo "<div class='kgvid_video_app_required'>"; 
		echo "<select id='h264_CRF' name='kgvid_video_embed_options[h264_CRF]' class='affects_ffmpeg'>";
		for ($i = 0; $i <= 51; $i++ ) {
			$selected = ($options['h264_CRF']==$i) ? 'selected="selected"' : '';
			echo "<option value='".$i."' $selected>".$i."</option>";
		}
		echo "</select> H.264 <a class='kgvid_tooltip' href='javascript:void(0);'><img src='../wp-includes/images/blank.gif'><span class='kgvid_tooltip_classic'>Lower values are higher quality. 18 is considered visually lossless. Default is 23.</span></a><br />";
		
		echo "<select id='webm_CRF' name='kgvid_video_embed_options[webm_CRF]' class='affects_ffmpeg'>";
		for ($i = 4; $i <= 63; $i++ ) {
			$selected = ($options['webm_CRF']==$i) ? 'selected="selected"' : '';
			echo "<option value='".$i."' $selected>".$i."</option>";
		}
		echo "</select> WEBM <a class='kgvid_tooltip' href='javascript:void(0);'><img src='../wp-includes/images/blank.gif'><span class='kgvid_tooltip_classic'>Lower values are higher quality. Default is 10.</span></a><br />";
		
		echo "<select id='ogv_CRF' name='kgvid_video_embed_options[ogv_CRF]' class='affects_ffmpeg'>";
		for ($i = 1; $i <= 10; $i++ ) {
			$selected = ($options['ogv_CRF']==$i) ? 'selected="selected"' : '';
			echo "<option value='".$i."' $selected>".$i."</option>";
		}
		echo "</select> OGV (qscale) <a class='kgvid_tooltip' href='javascript:void(0);'><img src='../wp-includes/images/blank.gif'><span class='kgvid_tooltip_classic'>Higher values are higher quality. Default is 6.</span></a>";
		echo "</div>"; 
	}
	
	function kgvid_average_bitrate_callback() {
		$options = get_option('kgvid_video_embed_options');
		echo "<div class='kgvid_video_app_required'>"; 
		echo "<select onchange='kgvid_set_bitrate_display();' id='bitrate_multiplier' name='kgvid_video_embed_options[bitrate_multiplier]' class='affects_ffmpeg'>";
		for ($i = 0.01; $i <= 0.31; $i=$i+0.01 ) {
			$selected = ($options['bitrate_multiplier']==strval($i)) ? 'selected="selected"' : '';
			echo "<option value='$i' $selected>$i</option>";
		}
		echo "</select> bits per pixel. <a class='kgvid_tooltip' href='javascript:void(0);'><img src='../wp-includes/images/blank.gif'><span class='kgvid_tooltip_classic'>Default is 0.1</span></a><br />";
		echo "<span class='kgvid_gray_text'>1080p = <span id='1080_bitrate'>".round(floatval($options['bitrate_multiplier'])*1920*1080*30/1024)."</span> kbps<br />";
		echo "720p = <span id='720_bitrate'>".round(floatval($options['bitrate_multiplier'])*1280*720*30/1024)."</span> kbps<br />";
		echo "480p = <span id='360_bitrate'>".round(floatval($options['bitrate_multiplier'])*640*360*30/1024)."</span> kbps</span>";
		echo "</div>"; 
	}
	
	function kgvid_h264_profile_callback() {
		$options = get_option('kgvid_video_embed_options');
		echo "<div class='kgvid_video_app_required'>"; 
		echo "<select id='h264_profile' name='kgvid_video_embed_options[h264_profile]' class='affects_ffmpeg'>";
		$items = array("none", "baseline", "main", "high");
		foreach($items as $item) {
			$selected = ($options['h264_profile']==$item) ? 'selected="selected"' : '';
			echo "<option value='$item' $selected>$item</option>";
		}
		echo "</select> <a class='kgvid_tooltip' href='javascript:void(0);'><img src='../wp-includes/images/blank.gif'><span class='kgvid_tooltip_classic'>Lower profiles will increase file sizes. This mostly depends on your need for compatability with Android devices. Main profile seems to work on recent phones, although officially Android only supports baseline. High profile is not recommended for mobile or Flash compatibility. Older versions of FFMPEG might ignore this setting altogether.</span></a><br />";
		echo "<select id='h264_level' name='kgvid_video_embed_options[h264_level]' class='affects_ffmpeg'>";
		$items = array("none", "1", "1.1", "1.2", "1.3", "2", "2.1", "2.2", "3", "3.1", "3.2", "4", "4.1", "4.2", "5", "5.1");
		foreach($items as $item) {
			$selected = ($options['h264_level']==$item) ? 'selected="selected"' : '';
			echo "<option value='$item' $selected>$item</option>";
		}
		echo "</select> <a class='kgvid_tooltip' href='javascript:void(0);'><img src='../wp-includes/images/blank.gif'><span class='kgvid_tooltip_classic'>3.0 is default. Lower levels will lower maximum bit rates and decoding complexity. This mostly depends on your need for compatability with mobile devices. Older versions of FFMPEG might ignore this setting altogether.</span></a>";		
		echo "</div>";
	}

	function kgvid_audio_bitrate_options_callback() {
		$options = get_option('kgvid_video_embed_options');
		echo "<div class='kgvid_video_app_required'>"; 
		$items = array(96, 112, 128, 160, 192, 224, 256, 320);
		echo "<select id='audio_bitrate' name='kgvid_video_embed_options[audio_bitrate]' class='affects_ffmpeg'>";
		foreach($items as $item) {
			$selected = ($options['audio_bitrate']==$item) ? 'selected="selected"' : '';
			echo "<option value='$item' $selected>$item</option>";
		}
		echo "</select> kbps";
		echo "</div>"; 
	}
	
	function kgvid_ffmpeg_options_callback() {
		$options = get_option('kgvid_video_embed_options');
		echo "<div class='kgvid_video_app_required'>"; 
		echo "<input class='affects_ffmpeg' onchange='if(jQuery(\"#ffmpeg_vpre\").attr(\"checked\")==\"checked\"){jQuery(\"#video_bitrate_flag\").attr(\"checked\", \"checked\");}' ".checked( $options['video_bitrate_flag'], "on", false )." id='video_bitrate_flag' name='kgvid_video_embed_options[video_bitrate_flag]' type='checkbox' /> <label for='video_bitrate_flag'>Enable legacy FFMPEG '-b' and '-ba' bitrate flags.</label> <a class='kgvid_tooltip' href='javascript:void(0);'><img src='../wp-includes/images/blank.gif'><span class='kgvid_tooltip_classic'>Enable if your installed version of FFMPEG is old enough that you can't use the newer -b:v flags (Dreamhost users must turn this on). It may cause newer versions of FFMPEG to fail.</span></a><br />
		<input class='affects_ffmpeg' onchange='if(jQuery(\"#ffmpeg_vpre\").attr(\"checked\")==\"checked\"){jQuery(\"#video_bitrate_flag\").attr(\"checked\", \"checked\");}' ".checked( $options['ffmpeg_vpre'], "on", false )." id='ffmpeg_vpre' name='kgvid_video_embed_options[ffmpeg_vpre]' type='checkbox' /> <label for='ffmpeg_vpre'>Enable FFMPEG 'vpre' flags.</label> <a class='kgvid_tooltip' href='javascript:void(0);'><img src='../wp-includes/images/blank.gif'><span class='kgvid_tooltip_classic'>Enable if your installed version of FFMPEG is old enough that libx264 requires vpre flags to operate (Dreamhost users must turn this on). This should help if you can encode WEBM or OGV files but H264/Mobile files fail. It will cause newer versions of FFMPEG to fail and probably won't work on Windows servers.</span></a>";
		echo "</div>";
	}
	
	function kgvid_execution_options_callback() {
		$options = get_option('kgvid_video_embed_options');
		echo "<div class='kgvid_video_app_required'>"; 
		$items = array(96, 112, 128, 160, 192, 224, 256, 320);
		echo "<select id='threads' name='kgvid_video_embed_options[threads]' class='affects_ffmpeg'>";
		for ($i = 0; $i <= 16; $i++ ) {
			$selected = ($options['threads']==$i) ? 'selected="selected"' : '';
			echo "<option value='".$i."' $selected>".$i."</option>";
		}
		echo "</select> threads <a class='kgvid_tooltip' href='javascript:void(0);'><img src='../wp-includes/images/blank.gif'><span class='kgvid_tooltip_classic'>Default is 1, which limits encoding speed but prevents encoding from using too many system resources. Selecting 0 will allow <strong class='video_app_name'>".strtoupper($options['video_app'])."</strong> to optimize the number of threads or you can set the number manually. This may lead to <strong class='video_app_name'>".strtoupper($options['video_app'])."</strong> monopolizing system resources.</span></a><br />";
		echo "<input ".checked( $options['nice'], "on", false )." id='nice' name='kgvid_video_embed_options[nice]' class='affects_ffmpeg' type='checkbox' /> <label for='nice'>Run <code>nice</code>.</label> <a class='kgvid_tooltip' href='javascript:void(0);'><img src='../wp-includes/images/blank.gif'><span class='kgvid_tooltip_classic'>Tells <strong class='video_app_name'>".strtoupper($options['video_app'])."</strong> to run at a lower priority to avoid monopolizing system resources.</span></a>";
		echo "</div>";

		$encode_string = "";
		if ( $options['ffmpeg_exists'] == "on" ) {		
			$movie_info = kgvid_get_video_dimensions(plugin_dir_url(__FILE__)."images/sample-video-h264.mp4");
			$uploads = wp_upload_dir();			
			$encode_string = kgvid_generate_encode_string(plugin_dir_url(__FILE__)."images/sample-video-h264.mp4", $uploads['path']."/sample-video-h264-480p.mp4", $movie_info['configuration'], 'mobile', 640, 360);
		}
		
		$display_div = "";
		if ( $options['ffmpeg_exists'] != "on" ) { $display_div = " style='display:none;'"; }
		
		echo "<div id='ffmpeg_sample_div'".$display_div."><p><strong class='video_app_name'>".strtoupper($options['video_app'])."</strong> sample H.264 encode command:<br /><textarea id='ffmpeg_h264_sample' class='ffmpeg_sample_code code' cols='100' rows='5' wrap='soft' readonly='yes'>".$encode_string."</textarea></p>";
		echo "<p><strong class='video_app_name'>".strtoupper($options['video_app'])."</strong> test output:<br /><textarea id='ffmpeg_output' class='ffmpeg_sample_code code' cols='100' rows='20' wrap='soft' readonly='yes'></textarea></p></div>"; 
	}

//end of settings page callback functions

function kgvid_update_settings() {
	
	global $wpdb;
	
	$options = get_option('kgvid_video_embed_options');
	$options_old = $options; //save the values that are in the db
	$default_options = kgvid_default_options_fn();
	
	if ( empty($options) ) { // run if the new settings don't exist yet (before version 3.0)
		
		$options = array();

		$old_setting_equivalents = array (
			"width"=>"wp_FMP_width",
			"height"=>"wp_FMP_height",
			"controlbar_style"=>"wp_FMP_controlbar_style",
			"poster"=>"wp_FMP_poster",
			"endOfVideoOverlay"=>"wp_FMP_endOfVideoOverlay",
			"autohide"=>"wp_FMP_autohide",
			"autoplay"=>"wp_FMP_autoplay",
			"loop"=>"wp_FMP_loop",
			"playbutton"=>"wp_FMP_playbutton",
			"stream_type"=>"wp_FMP_stream_type",
			"scale_mode"=>"wp_FMP_scale_mode",
			"bgcolor"=>"wp_FMP_bgcolor",
			"configuration"=>"wp_FMP_configuration",
			"skin"=>"wp_FMP_skin",
			"app_path"=>"wp_FMP_ffmpeg",
			"ffmpeg_exists"=>"wp_FMP_ffmpeg_exists",
			"encode_mobile"=>"wp_FMP_encodemobile",
			"encode_ogg"=>"wp_FMP_encodeogg",
			"encode_webm"=>"wp_FMP_encodewebm",
			"ffmpeg_vpre"=>"wp_FMP_vpre",
			"template"=>"wp_FMP_template",
			"titlecode"=>"wp_FMP_titlecode");

		foreach ($old_setting_equivalents as $new_setting => $old_setting) { //apply any old settings to the new database entry then delete them
			$old_setting_value = get_option($old_setting, "no_setting");
			if ( $old_setting_value != "no_setting" ) {
				if ( $old_setting_value == "true" ) { $old_setting_value = "on"; }
				$options[$new_setting] = $old_setting_value;
				delete_option($old_setting);
			}
		}
		$wpdb->query( "DELETE FROM $wpdb->options WHERE option_name LIKE 'wp_FMP%'" );
		
		foreach ( $default_options as $key => $value ) { //apply default values for any settings that didn't exist before
			if ( !array_key_exists($key, $options) ) { $options[$key] = $value; }
			$options['embed_method'] = "Strobe Media Playback";
		}
		
		update_option('kgvid_video_embed_options', $options);	
	}
	
	else { //user is already upgraded to version 3.0, but needs the extra options introduced in later versions
		if ( $options['version'] < 3.1 ) {
			$options['version'] = 3.1;
			if ( $options['ffmpeg_vpre'] == "on" ) { $options['video_bitrate_flag'] = "on"; } //if user has ffmpeg_vpre turned on, they need the old bitrate flags too
			else { $options['video_bitrate_flag'] = false; }
			$options['watermark'] = "";	
		}
		if ( $options['version'] < 4.0 ) {
			$options['version'] = 4.0;
			$options['overlay_title'] = false;
			$options['overlay_embedcode'] = false;
			$options['view_count'] = false;
			$options['align'] = "left";
			$options['featured'] = "on";
			$options['thumb_parent'] = "video";
			$options['delete_children'] = "encoded videos only";
			if ( $options['template'] == "on" ) { $options['template'] = "old"; }
			else { $options['template'] = "gentle"; }
			$checkbox_convert = array ( "autohide", "endOfVideoOverlaySame", "playbutton", "loop", "autoplay" );
			foreach ( $checkbox_convert as $option ) {
				if ( $options[$option] == "true" ) { $options[$option] = "on"; } //some checkboxes were incorrectly set to "true" in older versions
			}
			if ( wp_next_scheduled('kgvid_cleanup_queue') != false ) { //kgvid_cleanup_queue needs an argument!
				wp_clear_scheduled_hook('kgvid_cleanup_queue');
				wp_schedule_event( time()+86400, 'daily', 'kgvid_cleanup_queue', array ( 'scheduled' ) );
			}
			
		}
		if ( $options['version'] < 4.1 ) {
			$options['version'] = 4.1;
			$options['embeddable'] = "on";
			$options['inline'] = "on";
		}
		if ( $options['version'] < 4.2 ) {
			$options['version'] = 4.2;
			$options["bitrate_multiplier"] = 0.1;
			$options["h264_CRF"] = 23;
			$options["webm_CRF"] = 10;
			$options["ogv_CRF"] = 6;
			$options["audio_bitrate"] = 160;
			$options["threads"] = 1;
			$options["nice"] = "on";
			$options["browser_thumbnails"] = "on";
			$options["rate_control"] = "abr";
			$options["h264_profile"] = "none";
			$options["h264_level"] = "none";
		}
		
		if ( $options['version'] != $default_options['version'] ) { $options['version'] = $default_options['version']; }
		if ( $options !== $options_old ) { update_option('kgvid_video_embed_options', $options); }
	}
}
add_action('init', 'kgvid_update_settings' );

function kgvid_video_embed_options_validate($input) { //validate & sanitize input from settings form

	$options = get_option('kgvid_video_embed_options');
	$default_options = kgvid_default_options_fn();
	
	if (isset ($_POST["video-embed-thumbnail-generator-reset"])) {
		$input = $default_options;
		add_settings_error( __FILE__, "options-reset", "Video Embed & Thumbnail Generator settings reset to default values.", "updated" );
	}

	$ffmpeg_info = kgvid_check_ffmpeg_exists($input, false);
	
	if ( $ffmpeg_info['exec_enabled'] == false ) {
		add_settings_error( __FILE__, "ffmpeg-disabled", $ffmpeg_info['function']." is disabled in PHP settings. You can embed existing videos and make thumbnails with compatible browsers, but video encoding will not work. Contact your System Administrator to find out if you can enable ".$ffmpeg_info['function'].".", "updated");
		$input['ffmpeg_exists'] = "notinstalled";
	}
	elseif ( $ffmpeg_info['ffmpeg_exists'] == false ) {
		add_settings_error( __FILE__, "ffmpeg-disabled", strtoupper($input['video_app'])." not found at ".$input['app_path'].". You can embed existing videos and make thumbnails with compatible browsers, but video encoding is not possible without ".strtoupper($input['video_app']).".", "updated"); 
		$input['ffmpeg_exists'] = "notinstalled";
	}
	if ( $ffmpeg_info['ffmpeg_exists'] == true ) { $input['ffmpeg_exists'] = "on"; }
	
	if ( empty($input['width']) ) {	
		add_settings_error( __FILE__, "width-zero", "You must enter a value for the maximum video width.");
		$input['width'] = $options['width'];
	}
	if ( empty($input['height']) ) { 
		add_settings_error( __FILE__, "height-zero", "You must enter a value for the maximum video height.");
		$input['height'] = $options['height'];
	}
	if ( empty($input['gallery_width']) ) {	
		add_settings_error( __FILE__, "gallery-width-zero", "You must enter a value for the maximum gallery video width.");
		$input['gallery_width'] = $options['gallery_width'];
	}
	if ( empty($input['gallery_height']) ) { 
		add_settings_error( __FILE__, "gallery-height-zero", "You must enter a value for the maximum gallery video height.");
		$input['gallery_height'] = $options['gallery_height'];
	}
	
	$input['titlecode'] =  wp_kses_post( $input['titlecode'] );
	
	 // load all settings and make sure they get a value of false if they weren't entered into the form
	foreach ( $default_options as $key => $value ) {
		if ( !array_key_exists($key, $input) ) { $input[$key] = false; }
	}

	$input['version'] = $default_options['version']; //since this isn't user selectable it has to be re-entered every time
	
	return $input;
}

function kgvid_ajax_save_settings() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	$setting = $_POST['setting'];
	$value = $_POST['value'];
	$error_message = "";
	global $wpdb;
	global $wp_settings_errors;
	$options = get_option('kgvid_video_embed_options');
	$options[$setting] = $value;
	$validated_options = kgvid_video_embed_options_validate($options);
	update_option('kgvid_video_embed_options', $validated_options);
	if ( !empty($wp_settings_errors) ) { $error_message = $wp_settings_errors[0]['message']; }
	$encode_string = "";
	if ( $validated_options['ffmpeg_exists'] == "on" ) {
		$movie_info = kgvid_get_video_dimensions(plugin_dir_url(__FILE__)."images/sample-video-h264.mp4");
		$uploads = wp_upload_dir();
		$encode_string = kgvid_generate_encode_string(plugin_dir_url(__FILE__)."images/sample-video-h264.mp4", $uploads['path']."/sample-video-h264-480p.mp4", $movie_info['configuration'], 'mobile', 640, 360);
	}	
	$arr = array ( "error_message" => $error_message, "validated_value" => $validated_options[$setting], "ffmpeg_exists" => $validated_options['ffmpeg_exists'], "encode_string" => $encode_string );
	echo json_encode($arr);
	die();
	
}
add_action('wp_ajax_kgvid_save_settings', 'kgvid_ajax_save_settings');

/* function kgvid_add_attachment_handler($post_id) { // This will start encoding and thumbnail generating automatically in a future version

	$post = get_post($post_id);
	if ( substr($post->post_mime_type, 0, 5) == 'video' && (empty($post->post_parent) || (strpos(get_post_mime_type( $post->post_parent ), 'video') === false && get_post_meta($post->ID, '_kgflashmediaplayer-externalurl', true) == false)) ) {
		$args = array($post_id);
		wp_schedule_single_event(time(), 'kgvid_cron_new_attachment', $args);
		spawn_cron();
	}
	
}
add_action('add_attachment', 'kgvid_add_attachment_handler');

function kgvid_cron_new_attachment_handler($post_id) {

	$options = get_option('kgvid_video_embed_options');
	$post = get_post($post_id);
	error_log($post_id);
	$movieurl = wp_get_attachment_url($post_id);
	$video_formats = kgvid_video_formats();
	$encode_checked = array();
	unset($video_formats['rotated']);
	$encode_checked['rotated'] = "false";
	foreach ( $video_formats as $name => $format_stats ) {
		if ( $options['encode_'.$name] == "on" ) { $encode_checked[$name] = "true"; }
		else { $encode_checked[$name] = "false"; }
	}
	//kgvid_make_thumbs($post_id, $movieurl, $options['generate_thumbs'], 1, 1, '', '', 'generate');
	$output = kgvid_enqueue_videos($post_id, $movieurl, $encode_checked, $post->post_parent);
	$output = kgvid_encode_videos();
}
add_action('kgvid_cron_new_attachment', 'kgvid_cron_new_attachment_handler'); */

/** 
 * Adding our custom fields to the $form_fields array 
 * 
 * @param array $form_fields 
 * @param object $post 
 * @return array 
 */  
function kgvid_image_attachment_fields_to_edit($form_fields, $post) { 

	$options = get_option('kgvid_video_embed_options');

	if ( substr($post->post_mime_type, 0, 5) == 'video' && (empty($post->post_parent) || (strpos(get_post_mime_type( $post->post_parent ), 'video') === false && get_post_meta($post->ID, '_kgflashmediaplayer-externalurl', true) == false)) ) { //if the attachment is a video with no parent or if it has a parent the parent is not a video and the video doesn't have the externalurl post meta

		$field_id = kgvid_backwards_compatible($post->ID);

		$movieurl = wp_get_attachment_url($post->ID);
		$form_fields["kgflashmediaplayer-url"]["input"] = "hidden";
		$form_fields["kgflashmediaplayer-url"]["value"] = $movieurl;

		$maxwidth = $options['width'];
		$widthset = get_post_meta($post->ID, "_kgflashmediaplayer-width", true);
		if ($widthset == "") { $widthset = $maxwidth; }

		$form_fields["kgflashmediaplayer-maxwidth"]["input"] = "hidden";
		$form_fields["kgflashmediaplayer-maxwidth"]["value"] = $maxwidth;

		$maxheight = $options['height'];
		$heightset = get_post_meta($post->ID, "_kgflashmediaplayer-height", true);
		if ($heightset == "") { $heightset = $maxheight; }

		$form_fields["kgflashmediaplayer-maxheight"]["input"] = "hidden";
		$form_fields["kgflashmediaplayer-maxheight"]["value"] = $maxheight;

		$form_fields["kgflashmediaplayer-aspect"]["input"] = "hidden";
		$form_fields["kgflashmediaplayer-aspect"]["value"] = $heightset/$widthset;

		$embedset = get_post_meta($post->ID, "_kgflashmediaplayer-embed", true);
		if ($embedset == "") { 
			$embedset = "Single Video"; 
			update_post_meta($post->ID, '_kgflashmediaplayer-embed', $embedset); //make sure at least this value is set before attachment is inserted into post
		}

		$thumbnail_url = get_post_meta($post->ID, "_kgflashmediaplayer-poster", true);

		$uploads = wp_upload_dir();
		$url_parts = parse_url($uploads['baseurl']);
		$moviefiledirectory = dirname(parse_url(trim($thumbnail_url), PHP_URL_PATH));
		$moviefilebasename = pathinfo(trim($thumbnail_url), PATHINFO_BASENAME);
		$home_path = substr(strrev(strstr(strrev($uploads['basedir']), strrev("public_html"))), 0, -strlen("public_html"));
		if ( strpos( dirname(trim($thumbnail_url)), $url_parts['host']) != "" ) { //if it's on the current server
			$originalpath = $home_path."public_html".$moviefiledirectory."/".$moviefilebasename;
			if ( !file_exists($originalpath) ) { $thumbnail_url = ""; }
		}
		else { if ( !kgvid_url_exists($thumbnail_url) ) { $thumbnail_url = ""; } }

		$thumbnail_html = "";
		if ($thumbnail_url != "" ) { 		
			$thumbnail_html = '<div style="border-style:solid; border-color:#ccc; border-width:3px; width:200px; text-align:center; margin:10px;"><img width="200" src="'.$thumbnail_url.'?'.rand().'"></div>'; 
		}

		$numberofthumbs_value = get_post_meta($post->ID, "_kgflashmediaplayer-numberofthumbs", true);
		if (get_post_meta($post->ID, "_kgflashmediaplayer-thumbtime", true) != "") { $numberofthumbs_value = "1"; }
		if ( empty($numberofthumbs_value) ) { $numberofthumbs_value = $options['generate_thumbs']; }

		if ( !isset($options['ffmpeg_exists']) || $options['ffmpeg_exists'] == "notchecked" ) { 
			kgvid_check_ffmpeg_exists($options, true);
		}

		$forcefirstchecked = get_post_meta($post->ID, "_kgflashmediaplayer-forcefirst", true);

		$featuredchecked = get_post_meta($post->ID, "_kgflashmediaplayer-featured", true);
		if ( empty($featuredchecked) ) { $featuredchecked = $options['featured']; }
		if ( $featuredchecked == "on" ) { $featuredchecked = "checked"; }
		else { $featuredchecked = ""; }

		if ( $options['ffmpeg_exists'] == "notinstalled" ) { $ffmpeg_disabled_text = 'disabled="disabled" title="'.strtoupper($options['video_app']).' not found at '.$options['app_path'].'"'; }
		else { $ffmpeg_disabled_text = ""; }

		$nonce = wp_create_nonce('video-embed-thumbnail-generator-nonce');

		if ( $options['embed_method'] == "Video.js" ) {
	
			$starts = intval(get_post_meta($post->ID, "_kgflashmediaplayer-starts", true));
			$completeviews = intval(get_post_meta($post->ID, "_kgflashmediaplayer-completeviews", true));
	
			$form_fields["views"]["label"] = __("Video Stats");
			$form_fields["views"]["input"] = "html";
			$form_fields["views"]["html"] = $starts." Starts, ".$completeviews." Complete Views";

		}
		
		$video_for_thumbs = '<video onloadedmetadata="document.getElementById(\'attachments-'.$post->ID.'-thumbgenerate\').disabled=false; document.getElementById(\'attachments-'.$post->ID.'-thumbgenerate\').setAttribute(\'title\', \'\'); document.getElementById(\'attachments-'.$post->ID.'-thumbrandomize\').disabled=false; document.getElementById(\'attachments-'.$post->ID.'-thumbrandomize\').setAttribute(\'title\', \'\');" id="thumb_video_'.$post->ID.'" controls><source src="'.wp_get_attachment_url($post->ID).'"</src></video>';

		$form_fields["generator"]["label"] = __("Thumbnails");
		$form_fields["generator"]["input"] = "html";
		$form_fields["generator"]["html"] = '<div id="thumb_video_div" style="display:none;">'.$video_for_thumbs.'</div>
		<input type="hidden" name="attachments['.$post->ID.'][kgflashmediaplayer-security]" id="attachments-'.$post->ID.'-kgflashmediaplayer-security" value="'.$nonce.'" /><div id="attachments-'.$post->ID.'-thumbnailplaceholder">'. $thumbnail_html .'</div>
		<input id="attachments-'. $post->ID .'-numberofthumbs" name="attachments['.$post->ID.'][kgflashmediaplayer-numberofthumbs]" type="text" value="'.$numberofthumbs_value.'" maxlength="2" style="width:35px;text-align:center;" onchange="kgvid_disable_thumb_buttons(\''.$post->ID.'\', \'onchange\');document.getElementById(\''.$field_id['thumbtime'].'\').value =\'\';" '.$ffmpeg_disabled_text.'/>
		<input type="button" id="attachments-'. $post->ID .'-thumbgenerate" class="button-secondary" value="Generate" name="thumbgenerate" onclick="kgvid_generate_thumb('. $post->ID .', \'generate\');" '.$ffmpeg_disabled_text.'/>
		<input type="button" id="attachments-'. $post->ID .'-thumbrandomize" class="button-secondary" value="Randomize" name="thumbrandomize" onclick="kgvid_generate_thumb('. $post->ID .', \'random\');" '.$ffmpeg_disabled_text.'/> <br />
		<input type="checkbox" id="attachments-'. $post->ID .'-firstframe" name="attachments['.$post->ID.'][kgflashmediaplayer-forcefirst]" onchange="document.getElementById(\''.$field_id['thumbtime'].'\').value =\'\';" value="checked" '.$forcefirstchecked.' '.$ffmpeg_disabled_text.'/> <label for="attachments-'. $post->ID .'-firstframe">Force 1st frame thumbnail</label><br />
		<input type="checkbox" id="attachments-'. $post->ID .'-featured" name="attachments['.$post->ID.'][kgflashmediaplayer-featured]" '.$featuredchecked.' '.$ffmpeg_disabled_text.'/> <label for="attachments-'. $post->ID .'-featured">Set thumbnail as featured image</label>';

		$form_fields["thumbtime"]["label"] = __("Thumbnail Time");
		$form_fields["thumbtime"]["value"] = get_post_meta($post->ID, "_kgflashmediaplayer-thumbtime", true);
		$form_fields["thumbtime"]["helps"] = "<small>Optional: generates a single thumbnail at the specified time (hh:mm:ss, mm:ss, or s).</small>";

		$form_fields["kgflashmediaplayer-poster"]["label"] = __("Thumbnail URL");
		$form_fields["kgflashmediaplayer-poster"]["value"] = get_post_meta($post->ID, "_kgflashmediaplayer-poster", true);
		$form_fields["kgflashmediaplayer-poster"]["helps"] = "<small>Leave blank to use <a href='options-general.php?page=video-embed-thumbnail-generator/video-embed-thumbnail-generator.php' target='_blank'>default thumbnail</a>.</small>";

		$lockaspectchecked = get_post_meta($post->ID, "_kgflashmediaplayer-lockaspect", true);
		if ( $lockaspectchecked == "notchecked" ) { $lockaspectchecked = ""; }
		else { $lockaspectchecked = "checked"; }

		$form_fields["kgflashmediaplayer-dimensions"]["label"] = __("Video Embed Dimensions");
		$form_fields["kgflashmediaplayer-dimensions"]["input"] = "html";
		$form_fields["kgflashmediaplayer-dimensions"]["html"] = 'Width: <input name="attachments['. $post->ID .'][kgflashmediaplayer-width]" id="attachments-'. $post->ID .'-kgflashmediaplayer-width" type="text" value="'.$widthset.'" style="width:50px;" onchange="kgvid_set_dimension('.$post->ID.', \'height\', this.value);" onkeyup="kgvid_set_dimension('.$post->ID.', \'height\', this.value);"> Height: 
		<input name="attachments['. $post->ID .'][kgflashmediaplayer-height]" id="attachments-'. $post->ID .'-kgflashmediaplayer-height" type="text" value="'.$heightset.'" style="width:50px;" onchange="kgvid_set_dimension('.$post->ID.', \'width\', this.value);" onkeyup="kgvid_set_dimension('.$post->ID.', \'width\', this.value);"> <br />
		<input type="checkbox" name="attachments['. $post->ID .'][kgflashmediaplayer-lockaspect]" id="attachments-'. $post->ID .'-kgflashmediaplayer-lockaspect" onclick="kgvid_set_aspect('.$post->ID.', this.checked);" value="checked" '.$lockaspectchecked.'> 
		<label for="attachments-'. $post->ID .'-kgflashmediaplayer-lockaspect"><small>Lock to aspect ratio</small></label>';
		$form_fields["kgflashmediaplayer-dimensions"]["helps"] = "<small>Leave blank to use <a href='options-general.php?page=video-embed-thumbnail-generator/video-embed-thumbnail-generator.php' target='_blank'>default dimensions</a>.</small>";


		$checkboxes = kgvid_generate_encode_checkboxes($movieurl, $post->ID, "attachment");

		$form_fields["kgflashmediaplayer-encode"]["label"] = __("Additional Formats");
		$form_fields["kgflashmediaplayer-encode"]["input"] = "html";
		$form_fields["kgflashmediaplayer-encode"]["html"] = $checkboxes;

		$showtitlechecked = get_post_meta($post->ID, "_kgflashmediaplayer-showtitle", true);
		if ( $showtitlechecked == "notchecked" ) { $showtitlechecked = ""; }
		$downloadlinkchecked = get_post_meta($post->ID, "_kgflashmediaplayer-downloadlink", true);
		if ( $downloadlinkchecked == "notchecked" ) { $downloadlinkchecked = ""; }
		$embed_option = get_post_meta($post->ID, "_kgflashmediaplayer-embed", true);

		$items = array("Single Video", "Video Gallery", "WordPress Default");
		$shortcode_select = '<select name="attachments['.$post->ID.'][kgflashmediaplayer-embed]" id="attachments['.$post->ID.'][kgflashmediaplayer-embed]">';
		foreach($items as $item) {
			$selected = ($embed_option==$item) ? 'selected="selected"' : '';
			$shortcode_select .= "<option value='$item' $selected>$item</option>";
		}
		$shortcode_select .= "</select>";

		$form_fields["kgflashmediaplayer-options"]["label"] = __("Video Embed Options");
		$form_fields["kgflashmediaplayer-options"]["input"] = "html";
		$form_fields["kgflashmediaplayer-options"]["html"] = '<input type="checkbox" name="attachments['.$post->ID.'][kgflashmediaplayer-showtitle]" id="attachments-'.$post->ID.'-kgflashmediaplayer-showtitle" value="checked" '.$showtitlechecked.'> 
		<label for="attachments-'.$post->ID.'-kgflashmediaplayer-showtitle">Insert title above video</label><br />

		<input type="checkbox" name="attachments['.$post->ID.'][kgflashmediaplayer-downloadlink]" id="attachments-'.$post->ID.'-kgflashmediaplayer-downloadlink" value="checked" '.$downloadlinkchecked.'> 
		<label for="attachments-'.$post->ID.'-kgflashmediaplayer-downloadlink">Insert download link below video<em><small><br />Makes it easier for users to download file.</em></small></label><br />
		'.$shortcode_select.'
		<label for="attachments-'.$post->ID.'-kgflashmediaplayer-embed">Insert</small></em></label><script type="text/javascript">window.onload=kgvid_hide_standard_wordpress_display_settings('.$post->ID.');</script>';

		if ( get_post_meta($post->ID, "_kgflashmediaplayer-embed", true) == "Video Gallery" ) {

			$gallery_thumb_width = get_post_meta($post->ID, "_kgflashmediaplayer-gallery_thumb_width", true);
			if ( empty($gallery_thumb_width) ) { $gallery_thumb_width = $options['gallery_thumb']; }
	
			$gallery_exclude = get_post_meta($post->ID, "_kgflashmediaplayer-gallery_exclude", true);
			$gallery_include = get_post_meta($post->ID, "_kgflashmediaplayer-gallery_include", true);
			$gallery_orderby = get_post_meta($post->ID, "_kgflashmediaplayer-gallery_orderby", true);
			$gallery_order = get_post_meta($post->ID, "_kgflashmediaplayer-gallery_order", true);
	
			$gallery_id = get_post_meta($post->ID, "_kgflashmediaplayer-gallery_id", true);
			if ( empty($gallery_id) ) { $gallery_id = $post->post_parent; }
	
			$items = array("menu_order", "title", "post_date", "rand", "ID");
			$gallery_orderby_select = '<select name="attachments['.$post->ID.'][kgflashmediaplayer-gallery_orderby]" id="attachments-'.$post->ID.'-kgflashmediaplayer-gallery_orderby">';
			foreach($items as $item) {
				$selected = ($gallery_orderby==$item) ? 'selected="selected"' : '';
				$gallery_orderby_select .= "<option value='$item' $selected>$item</option>";
			}
			$gallery_orderby_select .= "</select>";
	
			$items = array("ASC", "DESC");
			$gallery_order_select = '<select name="attachments['.$post->ID.'][kgflashmediaplayer-gallery_order]" id="attachments-'.$post->ID.'-kgflashmediaplayer-gallery_order">';
			foreach($items as $item) {
				$selected = ($gallery_order==$item) ? 'selected="selected"' : '';
				$gallery_order_select .= "<option value='$item' $selected>$item</option>";
			}
			$gallery_order_select .= "</select>";

			$form_fields["kgflashmediaplayer-gallery"]["label"] = __("Gallery Settings (all optional)");
			$form_fields["kgflashmediaplayer-gallery"]["input"] = "html";
			$form_fields["kgflashmediaplayer-gallery"]["html"] = '<input name="attachments['.$post->ID.'][kgflashmediaplayer-gallery_thumb_width]" id="attachments-'.$post->ID.'-kgflashmediaplayer-gallery_thumb_width" type ="text" value="'.$gallery_thumb_width.'" style="width:50px;"> <label for="attachments-'.$post->ID.'-kgflashmediaplayer-gallery_thumb_width">Thumbnail Width</label><br />
			'.$gallery_orderby_select.' Order By<br />
			'.$gallery_order_select.' Sort Order<br />
			<input name="attachments['.$post->ID.'][kgflashmediaplayer-gallery_exclude]" id="attachments-'.$post->ID.'-kgflashmediaplayer-gallery_exclude" type ="text" value="'.$gallery_exclude.'" style="width:50px;"> <label for="attachments-'.$post->ID.'-kgflashmediaplayer-gallery_exclude">Exclude</label><br />
			<input name="attachments['.$post->ID.'][kgflashmediaplayer-gallery_include]" id="attachments-'.$post->ID.'-kgflashmediaplayer-gallery_include" type ="text" value="'.$gallery_include.'" style="width:50px;"> <label for="attachments-'.$post->ID.'-kgflashmediaplayer-gallery_include">Include</label><br />
			<input name="attachments['.$post->ID.'][kgflashmediaplayer-gallery_id]" id="attachments-'.$post->ID.'-kgflashmediaplayer-gallery_id" type ="text" value="'.$gallery_id.'" style="width:50px;"> <label for="attachments-'.$post->ID.'-kgflashmediaplayer-gallery_id">Post ID</label>
			';

		}//if video gallery	
	} //only add fields if attachment is the right kind of video
return $form_fields; 
}  
// attach our function to the correct hook  
add_filter("attachment_fields_to_edit", "kgvid_image_attachment_fields_to_edit", null, 2);  

function kgvid_ajax_save_html5_thumb() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	$uploads = wp_upload_dir();
	$raw_png = $_POST['raw_png'];
	$video_url = $_POST['url'];
	$movieoffset = $_POST['offset'];
	
	$posterfile = sanitize_file_name(pathinfo($video_url, PATHINFO_FILENAME)).'_thumb'.$movieoffset;
	if (!file_exists($uploads['path'].'/thumb_tmp')) { mkdir($uploads['path'].'/thumb_tmp'); }
	$tmp_posterpath = $uploads['path'].'/thumb_tmp/'.$posterfile.'.png';
	$thumb_url = $uploads['url'].'/'.$posterfile.'.jpg';
	
	$raw_png = str_replace('data:image/png;base64,', '', $raw_png);
	$raw_png = str_replace(' ', '+', $raw_png);
	$decoded_png = base64_decode($raw_png);
	$success = file_put_contents($tmp_posterpath, $decoded_png);

	$editor = wp_get_image_editor( $tmp_posterpath );
	$new_image_info = $editor->save( $uploads['path'].'/thumb_tmp/'.$posterfile.'.jpg', 'image/jpeg' );
	unlink($tmp_posterpath);
	echo ($thumb_url);
	die();

}
add_action('wp_ajax_kgvid_save_html5_thumb', 'kgvid_ajax_save_html5_thumb');

function kgvid_save_thumb($post_id, $post_name, $thumb_url) {
	
	$options = get_option('kgvid_video_embed_options');
	$uploads = wp_upload_dir();
	
	$posterfile = pathinfo($thumb_url, PATHINFO_BASENAME);
	$tmp_posterpath = $uploads['path'].'/thumb_tmp/'.$posterfile;
	$final_posterpath = $uploads['path'].'/'.$posterfile;
	if ( !is_file($final_posterpath) ) { //if the file doesn't already exist
		if ( is_file($tmp_posterpath) ) { 
			rename($tmp_posterpath, $final_posterpath);
			$thumb_base = substr($tmp_posterpath, 0, strpos($tmp_posterpath, '_thumb'));
			foreach (glob($thumb_base."*.jpg") as $thumbfilename) {
			   unlink($thumbfilename);
			}
		}
		if ( kgvid_is_empty_dir($uploads["path"].'/thumb_tmp') ) { kgvid_rrmdir($uploads["path"].'/thumb_tmp'); }
	}
		
	//insert the $thumb_url into the media library if it does not already exist
	
	global $wpdb;
	$query = "SELECT ID FROM {$wpdb->posts} WHERE guid='".$thumb_url."'"; //check for existing entry in the db
	$thumb_id = $wpdb->get_var($query);
	
	if ( !$thumb_id ) {
	
		$desc = $post_name . ' thumbnail';

		//is image in uploads directory?
		$upload_dir = wp_upload_dir();
			
		$video = get_post($post_id);		
		if ( $options['thumb_parent'] == "post" ) {
			if ( !empty($video->post_parent) ) { $post_id = $video->post_parent; }
		}

		if ( FALSE !== strpos( $thumb_url, $upload_dir['baseurl'] ) ) {
			$wp_filetype = wp_check_filetype(basename($thumb_url), null );
			$filename = preg_replace('/\.[^.]+$/', '', basename($thumb_url));

			$attachment = array(
			   'guid' => $thumb_url, 
			   'post_mime_type' => $wp_filetype['type'],
			   'post_title' => $desc,
			   'post_content' => '',
			   'post_status' => 'inherit'
			);

			$thumb_id = wp_insert_attachment( $attachment, $uploads['path'].'/'.$posterfile, $post_id );
			// you must first include the image.php file
			// for the function wp_generate_attachment_metadata() to work
			require_once(ABSPATH . 'wp-admin/includes/image.php');
			$attach_data = wp_generate_attachment_metadata( $thumb_id, $uploads['path'].'/'.$posterfile );
			wp_update_attachment_metadata( $thumb_id, $attach_data );
		} 
		else { //not in uploads so we'll have to sideload it
			$tmp = download_url( $thumb_url );

			// Set variables for storage
			// fix file filename for query strings
			preg_match('/[^\?]+\.(jpg|JPG|jpe|JPE|jpeg|JPEG|gif|GIF|png|PNG)/', $thumb_url, $matches);
			$file_array['name'] = basename($matches[0]);
			$file_array['tmp_name'] = $tmp;

			// If error storing temporarily, unlink
			if ( is_wp_error( $tmp ) ) {
				@unlink($file_array['tmp_name']);
				$file_array['tmp_name'] = '';
			}
	
			// do the validation and storage stuff
			$thumb_id = media_handle_sideload( $file_array, $post_id, $desc );

			// If error storing permanently, unlink
			if ( is_wp_error($thumb_id) ) {
				@unlink($file_array['tmp_name']);
				return $thumb_id;
			}

			if ( $local_src = wp_get_attachment_url( $thumb_id ) ) {
				update_post_meta($post_id, '_kgflashmediaplayer-poster', $local_src);
			}
				
		} //end sideload
		
		$thumb_id = intval( $thumb_id );		
		update_post_meta($post_id, '_kgflashmediaplayer-poster-id', $thumb_id);
		set_post_thumbnail($post_id, $thumb_id);
		update_post_meta($thumb_id, '_kgflashmediaplayer-video-id', $video->ID);
			
	} //end get_attachment_id_from_src

	if(!is_wp_error($thumb_id)) {
		
		return $thumb_id;
	}

}

    /** 
     * @param array $post 
     * @param array $attachment 
     * @return array 
     */  
function kgvid_video_attachment_fields_to_save($post, $attachment) {  
	// $attachment part of the form $_POST ($_POST[attachments][postID])  
	// $post attachments wp post array - will be saved after returned  
	//     $post['post_type'] == 'attachment'  
	if( !empty($post['ID']) ) {
		$thumb_id = "";
		if( isset($attachment['kgflashmediaplayer-poster']) ) {
			
			$thumb_url = $attachment['kgflashmediaplayer-poster'];
			if ( !empty($thumb_url) ) { $thumb_id = kgvid_save_thumb($post['ID'], $post['post_title'], $thumb_url); }
			update_post_meta($post['ID'], '_kgflashmediaplayer-poster', $thumb_url);
			
		}
		if( isset($attachment['kgflashmediaplayer-numberofthumbs']) ) { update_post_meta($post['ID'], '_kgflashmediaplayer-numberofthumbs', $attachment['kgflashmediaplayer-numberofthumbs']); }
		if( isset($attachment['kgflashmediaplayer-forcefirst']) ) { update_post_meta($post['ID'], '_kgflashmediaplayer-forcefirst', $attachment['kgflashmediaplayer-forcefirst']); }
		else { update_post_meta($post['ID'], '_kgflashmediaplayer-forcefirst', ""); }
		if( isset($attachment['kgflashmediaplayer-featured']) ) { 
			update_post_meta($post['ID'], '_kgflashmediaplayer-featured', $attachment['kgflashmediaplayer-featured']);
			if ( !empty($thumb_id) && array_key_exists('post_parent', $post) ) { set_post_thumbnail($post['post_parent'], $thumb_id); }
		}
		else { update_post_meta($post['ID'], '_kgflashmediaplayer-featured', "notchecked"); }
		if( isset($attachment['thumbtime']) ) {update_post_meta($post['ID'], '_kgflashmediaplayer-thumbtime', $attachment['thumbtime']); }
		if( isset($attachment['kgflashmediaplayer-width']) ) { update_post_meta($post['ID'], '_kgflashmediaplayer-width', $attachment['kgflashmediaplayer-width']); }
		if( isset($attachment['kgflashmediaplayer-height']) ) { update_post_meta($post['ID'], '_kgflashmediaplayer-height', $attachment['kgflashmediaplayer-height']); }
		if( isset($attachment['kgflashmediaplayer-aspect']) ) { update_post_meta($post['ID'], '_kgflashmediaplayer-aspect', $attachment['kgflashmediaplayer-aspect']); }
		if( isset($attachment['kgflashmediaplayer-lockaspect']) ) { update_post_meta($post['ID'], '_kgflashmediaplayer-lockaspect', $attachment['kgflashmediaplayer-lockaspect']); }
		else { update_post_meta($post['ID'], '_kgflashmediaplayer-lockaspect', "notchecked"); }
	
		$video_formats = kgvid_video_formats();			
		foreach ( $video_formats as $format => $format_stats ) {
			if( isset($attachment['kgflashmediaplayer-encode'.$format]) ) { update_post_meta($post['ID'], '_kgflashmediaplayer-encode'.$format, "on"); }
			elseif ( $format != "rotated" ) { update_post_meta($post['ID'], '_kgflashmediaplayer-encode'.$format, "notchecked"); } //don't save the fact that rotated isn't checked since it almost never is
			else {  delete_post_meta($post['ID'], '_kgflashmediaplayer-encode'.$format); } //if it used to be checked, delete that meta value
		}
	
		if( isset($attachment['kgflashmediaplayer-showtitle']) ) { update_post_meta($post['ID'], '_kgflashmediaplayer-showtitle', $attachment['kgflashmediaplayer-showtitle']); }
		else { update_post_meta($post['ID'], '_kgflashmediaplayer-showtitle', "notchecked"); }
		
		if( isset($attachment['kgflashmediaplayer-downloadlink']) ) { update_post_meta($post['ID'], '_kgflashmediaplayer-downloadlink', $attachment['kgflashmediaplayer-downloadlink']); }
		else { update_post_meta($post['ID'], '_kgflashmediaplayer-downloadlink', "notchecked"); }
		
		if( isset($attachment['kgflashmediaplayer-embed']) ) { update_post_meta($post['ID'], '_kgflashmediaplayer-embed', $attachment['kgflashmediaplayer-embed']); }
		if( isset($attachment['kgflashmediaplayer-gallery_thumb_width']) ) { update_post_meta($post['ID'], '_kgflashmediaplayer-gallery_thumb_width', $attachment['kgflashmediaplayer-gallery_thumb_width']); }
		if( isset($attachment['kgflashmediaplayer-gallery_exclude']) ) { update_post_meta($post['ID'], '_kgflashmediaplayer-gallery_exclude', $attachment['kgflashmediaplayer-gallery_exclude']); }
		if( isset($attachment['kgflashmediaplayer-gallery_include']) ) { update_post_meta($post['ID'], '_kgflashmediaplayer-gallery_include', $attachment['kgflashmediaplayer-gallery_include']); }
		if( isset($attachment['kgflashmediaplayer-gallery_orderby']) ) { update_post_meta($post['ID'], '_kgflashmediaplayer-gallery_orderby', $attachment['kgflashmediaplayer-gallery_orderby']); }
		if( isset($attachment['kgflashmediaplayer-gallery_order']) ) { update_post_meta($post['ID'], '_kgflashmediaplayer-gallery_order', $attachment['kgflashmediaplayer-gallery_order']); }
		if( isset($attachment['kgflashmediaplayer-gallery_id']) ) { update_post_meta($post['ID'], '_kgflashmediaplayer-gallery_id', $attachment['kgflashmediaplayer-gallery_id']); }
		
	}
	return $post;
}
add_filter("attachment_fields_to_save", "kgvid_video_attachment_fields_to_save", null, 2);

class kgInsertMedia {  
  //class constructor  
  function kgInsertMedia () {  
    add_filter('media_send_to_editor', array($this, 'kgmodifyMediaInsert') , 10, 3);  
  }  
  //function that does the modifying  
  function kgmodifyMediaInsert($html, $attachment_id, $attachment) {  

    $options = get_option('kgvid_video_embed_options');
    $output = $html;
    $attachment['embed'] = get_post_meta($attachment_id, "_kgflashmediaplayer-embed", true);

    if ( $attachment['embed'] == "Single Video" ) {
        $output = "";
        $attachment['url'] = wp_get_attachment_url($attachment_id);
        $attachment['title'] = get_the_title($attachment_id);
        $attachment['poster'] = get_post_meta($attachment_id, "_kgflashmediaplayer-poster", true);
        $attachment['width'] = get_post_meta($attachment_id, "_kgflashmediaplayer-width", true);
        $attachment['height'] = get_post_meta($attachment_id, "_kgflashmediaplayer-height", true);
        $attachment['downloadlink'] = get_post_meta($attachment_id, "_kgflashmediaplayer-downloadlink", true);
        $attachment['showtitle'] = get_post_meta($attachment_id, "_kgflashmediaplayer-showtitle", true);
        if ($attachment['showtitle'] =="checked") {
		$titlecode = html_entity_decode(stripslashes($options['titlecode']));
		if ( substr($titlecode, 0, 1) != '<' ) { $titlecode = '<'.$titlecode; }
		if ( substr($titlecode, -1, 1) != '>' ) { $titlecode .= '>'; }
		$endtitlecode = str_replace("<", "</", $titlecode);
		$endtitlecode_array = explode(' ', $endtitlecode);
		if ( substr($endtitlecode_array[0], -1) != ">" ) { $endtitlecode = $endtitlecode_array[0].">"; }
		$output .= $titlecode.'<span itemprop="name">'.$attachment["title"].'</span>'.$endtitlecode.'<br />'; 
	}
        $output .= '[KGVID';
        if ($attachment['poster'] !="") { $output .= ' poster="'.$attachment["poster"].'"'; }
        if ($attachment['width'] !="") { $output .= ' width="'.$attachment["width"].'"'; }
        if ($attachment['height'] !="") { $output .= ' height="'.$attachment["height"].'"'; }
        if ($attachment['downloadlink'] == "checked") { $output .= ' downloadlink="true"'; }
        $output .= ']'.$attachment["url"].'[/KGVID]<br />';
    } //if embed code is enabled
    
    if ($attachment['embed'] == "Video Gallery" ) {
    
    	$attachment['gallery_thumb'] = get_post_meta($attachment_id, "_kgflashmediaplayer-gallery_thumb_width", true);    	
    	$attachment['gallery_exclude'] = get_post_meta($attachment_id, "_kgflashmediaplayer-gallery_exclude", true);
    	$attachment['gallery_include'] = get_post_meta($attachment_id, "_kgflashmediaplayer-gallery_include", true);
    	$attachment['gallery_orderby'] = get_post_meta($attachment_id, "_kgflashmediaplayer-gallery_orderby", true);    	
    	$attachment['gallery_order'] = get_post_meta($attachment_id, "_kgflashmediaplayer-gallery_order", true);
    	$attachment['gallery_id'] = get_post_meta($attachment_id, "_kgflashmediaplayer-gallery_id", true);
    	$post = get_post($attachment_id);
    	$parent_id = $post->post_parent;
    	
    	$output = "";
    	$output .= '[KGVID gallery="true"';
    	if ( !empty($attachment['gallery_thumb']) && $attachment['gallery_thumb'] != $options['gallery_thumb'] ) { $output .= ' gallery_thumb="'.$attachment["gallery_thumb"].'"'; }
    	if ( !empty($attachment['gallery_exclude']) ) { $output .= ' gallery_exclude="'.$attachment["gallery_exclude"].'"'; }
    	if ( !empty($attachment['gallery_include']) ) { $output .= ' gallery_include="'.$attachment["gallery_include"].'"'; }
    	if ( !empty($attachment['gallery_orderby']) && $attachment['gallery_orderby'] != "menu_order" ) { $output .= ' gallery_orderby="'.$attachment["gallery_orderby"].'"'; }
    	if ( !empty($attachment['gallery_order']) && $attachment['gallery_order'] != "ASC" ) { $output .= ' gallery_order="'.$attachment["gallery_order"].'"'; }
    	if ( !empty($attachment['gallery_id']) && $attachment['gallery_id'] != $parent_id ) { $output .= ' gallery_id="'.$attachment["gallery_id"].'"'; }
    	$output .= '][/KGVID]';
    }
    
    return $output;  
  }  
}  
//instantiate the class  
$kgIM = new kgInsertMedia();  

function kgvid_embedurl_menu($tabs) {
	$newtab = array('embedurl' => __('Embed Video from URL', 'kgoutsidevideo'));
	return array_merge($tabs, $newtab);
}
add_filter('media_upload_tabs', 'kgvid_embedurl_menu');

function media_embedurl_process() {

	$options = get_option('kgvid_video_embed_options');
	
	if ( !isset($options['ffmpeg_exists']) || $options['ffmpeg_exists'] == "notchecked" ) { 
		kgvid_check_ffmpeg_exists($options, true);
		$options = get_option('kgvid_video_embed_options');
	}
	
	$video_formats = kgvid_video_formats();
	$checkboxes = kgvid_generate_encode_checkboxes("", "singleurl", "attachment");
	
	$maxheight = $options['height'];
	$maxwidth = $options['width'];
	
	media_upload_header();
	?>
	<form class="media-upload-form type-form validate" id="kgvid-form" enctype="multipart/form-data" method="post" action="">
	
	<div id="media-items">
	<div class="media-item media-blank">
	<table id="kgflashmediaplayer-table" class="describe">
	<tbody>
				<tr>
					<th valign="top" scope="row" class="label"><span class="alignleft"><label for="videotitle">Video Title</label></span></th>
					<td class="field"><input type="text" id="videotitle" name="videotitle" value="" size="50" />
					<p class="help"><small>Add an optional header above the video.</small></p></td>
				</tr>
				<tr>
					<th valign="top" scope="row" class="label"><label for="attachments-singleurl-kgflashmediaplayer-url">Video URL</label></th>
					<td class="field"><input type="text" id="attachments-singleurl-kgflashmediaplayer-url" name="attachments[singleurl][kgflashmediaplayer-url]" value="" size="50" onchange="kgvid_set_singleurl();"/>
					<p class="help"><small>Specify the URL of the video file.</small></p></td>
				</tr>
				<tr>
					<th valign="top" scope="row" class="label"><span class="alignleft"><label for="numberofthumbs">Thumbnails</label></span></th>
					<td class="field"><div id="attachments-singleurl-thumbnailplaceholder"></div>
					<input id="attachments-singleurl-numberofthumbs" type="text" value="<?php echo $options['generate_thumbs']; ?>" maxlength="2" size="4" style="width:35px;text-align:center;" title="Number of Thumbnails" onchange="document.getElementById('attachments-singleurl-thumbtime').value='';" />
					<input type="button" id="attachments-singleurl-thumbgenerate" class="button-secondary" value="Generate" name="thumbgenerate" onclick="kgvid_generate_thumb('singleurl', 'generate');" disabled title="Please enter a valid video URL" />
					<input type="button" id="attachments-singleurl-thumbrandomize" class="button-secondary" value="Randomize" name="thumbrandomize" onclick="kgvid_generate_thumb('singleurl', 'random');" disabled title="Please enter a valid video URL" /> 
					<input type="checkbox" id="attachments-singleurl-firstframe" onchange="document.getElementById('attachments-singleurl-thumbtime').value ='';" /><label for="attachments-singleurl-firstframe">Force 1st Frame Thumbnail</label></td>
				</tr>
				<tr>
					<th valign="top" scope="row" class="label"><span class="alignleft"><label for="attachments-singleurl-thumbtime">Thumbnail Time</span></label><br class="clear" /></th>
					<td class="field"><input type="text" name="attachments[singleurl][thumbtime]" id="attachments-singleurl-thumbtime" value="" size="50" />
					<p class="help"><small>Optional: generates a single thumbnail at the specified time (hh:mm:ss, mm:ss, or s).</small></p></td>
				</tr>
				<tr>
					<th valign="top" scope="row" class="label"><span class="alignleft"><label for="attachments-singleurl_kgflashmediaplayer_poster">Thumbnail URL</label></span></th>
					<td class="field"><input type="text" name="attachments[singleurl][kgflashmediaplayer-poster]" id="attachments-singleurl-kgflashmediaplayer-poster" value="" size="50" />
					<p class="help"><small>Leave blank to use <a href="options-general.php?page=video-embed-thumbnail-generator/video-embed-thumbnail-generator.php" target="_blank">default thumbnail</a>.</small></p></td>
				</tr>
				<tr>
					<th valign="top" scope="row" class="label"><span class="alignleft"><label for="attachments-singleurl-kgflashmediaplayer-width">Dimensions</label></span></th>
					<td class="field">Width: <input name="attachments[singleurl][kgflashmediaplayer-width]" type="text" value="<?php echo $maxwidth; ?>" id="attachments-singleurl-kgflashmediaplayer-width" type="text" style="width:50px;" onchange="kgvid_set_dimension('singleurl', 'height', this.value);" onkeyup="kgvid_set_dimension('singleurl', 'height', this.value);"> Height: <input name="attachments[singleurl][kgflashmediaplayer-height]" id="attachments-singleurl-kgflashmediaplayer-height" type="text" value="<?php echo $maxheight; ?>" style="width:50px;" onchange="kgvid_set_dimension('singleurl', 'width', this.value);" onkeyup="kgvid-set-dimension('singleurl', 'width', this.value);"> <input type="checkbox" name="attachments[singleurl][kgflashmediaplayer-lockaspect]" id="attachments-singleurl-kgflashmediaplayer-lockaspect" onclick="kgvid_set_aspect('singleurl', this.checked);" checked> <label for="attachments-singleurl-kgflashmediaplayer-lockaspect"><small>Lock to Aspect Ratio</small></label>
					<p class="help"><small>Leave blank to use <a href="options-general.php?page=video-embed-thumbnail-generator/video-embed-thumbnail-generator.php" target="_blank">default dimensions</a>.</small></p></td>
				</tr>
				<tr>
					<th valign="top" scope="row" class="label"><span class="alignleft"><label for="html5">HTML5 & Mobile</span></label></th>
					<td><?php echo $checkboxes; ?></td>
				</tr>
				<tr>
					<th valign="top" scope="row" class="label"><span class="alignleft"><label>Options</span></label></th>
					<td><input type="checkbox" name="downloadlink" id="downloadlink" value="true" class="field" /><label for="downloadlink">Generate Download Link Below Video <small>(Makes it easier for users to download video file)</small></label></td>				
				</tr>
				<tr class="submit">
					<td></td>
					<td>
						<input type="button" onclick="kgvid_insert_shortcode();" name="insertonlybutton" id="insertonlybutton" class="button" value="Insert into Post" disabled title="Please enter a valid video URL" />
					</td>
				</tr>
	</tbody></table>
	</div>
	</div>
	
	<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-security]' id='attachments-kgflashmediaplayer-security' value='<?php echo wp_create_nonce('video-embed-thumbnail-generator-nonce'); ?>' />
	<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-maxwidth]' id='attachments-singleurl-kgflashmediaplayer-maxwidth' value='<?php echo($maxwidth); ?>' />
	<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-maxheight]' id='attachments-singleurl-kgflashmediaplayer-maxheight' value='<?php echo($maxheight); ?>' />
	<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-aspect]' id='attachments-singleurl-kgflashmediaplayer-aspect' value='<?php echo(round($maxheight/$maxwidth, 3)); ?>' />
	<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-titlecode]' id='attachments-singleurl-kgflashmediaplayer-titlecode' value='<?php echo $options['titlecode']; ?>' />
	<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-titlecode]' id='attachments-singleurl-kgflashmediaplayer-titlecode' value='<?php echo $options['titlecode']; ?>' />
	<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-ffmpegexists]' id='attachments-singleurl-kgflashmediaplayer-ffmpegexists' value='<?php echo $options['ffmpeg_exists']; ?>' />
	</form>
	
	<?php
} //end media_embedurl_process

function kgvid_embedurl_handle() {
    return wp_iframe( 'media_embedurl_process' );
}
add_action('media_upload_embedurl', 'kgvid_embedurl_handle');

function kgvid_parameter_queryvars( $qvars ) { //add kgvid_video_embed variable for passing information using URL queries
	$qvars[] = 'kgvid_video_embed';
	return $qvars;
}
add_filter('query_vars', 'kgvid_parameter_queryvars' );

function kgvid_generate_attachment_shortcode($kgvid_video_embed) {

	global $post;
	global $wp_query;
	$options = get_option('kgvid_video_embed_options');

	if ( array_key_exists('sample', $kgvid_video_embed) ) { $url = plugins_url('/images/sample-video-h264.mp4', __FILE__); }
	else { $url = wp_get_attachment_url($post->ID); }
	
	$poster = get_post_meta($post->ID, "_kgflashmediaplayer-poster", true);
	$downloadlink = get_post_meta($post->ID, '_kgflashmediaplayer-downloadlink', true);
	
	if ( array_key_exists('width', $kgvid_video_embed) ) { $width = $kgvid_video_embed['width']; }
	else { $width = get_post_meta($post->ID, "_kgflashmediaplayer-width", true); }
	if ( !$width ) { $width = get_post_meta($post->ID, "_kgflashmediaplayer-actualwidth", true); }
	if ( !$width ) { $width = $options['width']; }
	
	if ( array_key_exists('height', $kgvid_video_embed) ) { $height = $kgvid_video_embed['height']; }
	else { $height = get_post_meta($post->ID, "_kgflashmediaplayer-height", true); }
	if ( !$height ) { $height = get_post_meta($post->ID, "_kgflashmediaplayer-actualheight", true); }
	if ( !$height ) { $width = $options['width']; }
	
	$shortcode = '[KGVID';
	if ( $poster !="" ) { $shortcode .= ' poster="'.$poster.'"'; }
	if ( $width !="" ) { $shortcode .= ' width="'.$width.'"'; }
	if ( $height !="" ) { $shortcode .= ' height="'.$height.'"'; }
	if ( $downloadlink == "checked" ) { $shortcode .= ' downloadlink="true"'; }
	if (array_key_exists('gallery', $kgvid_video_embed)) { $shortcode .= ' autoplay="true"'; }
	if (array_key_exists('sample', $kgvid_video_embed)) { 
		if ( $options['overlay_title'] == "on" ) { $shortcode .= ' title="Sample Video"'; }
		if ( $options['overlay_embedcode'] == "on" ) { $shortcode .= ' embedcode="Sample Embed Code"'; }
		$shortcode .= ' caption="Captions are shown automatically if entered."'; 
	}
	//else { $shortcode .= ' view_count="false"'; }
	$shortcode .= ']'.$url.'[/KGVID]';
	
	return $shortcode;

}

function kgvid_filter_video_attachment_content($content) {

	global $post;
	$options = get_option('kgvid_video_embed_options');
	
	if ( $options['template'] == "gentle" && strpos($post->post_mime_type, "video") !== false ) {
		$kgvid_video_embed = array(); //no query set
		$content = kgvid_generate_attachment_shortcode($kgvid_video_embed);
		$content .= '<p>'.$post->post_content.'</p>';
	}
	return $content;
}
add_filter( 'the_content', 'kgvid_filter_video_attachment_content' );

function kgvid_video_attachment_template() {

	global $post;
	global $wp_query;
	$options = get_option('kgvid_video_embed_options');

	$kgvid_video_embed = array ( 'enable' => 'false' ); //turned off by default
	if ( isset($wp_query->query_vars['kgvid_video_embed']) ) { $kgvid_video_embed = $wp_query->query_vars['kgvid_video_embed']; }
	if ( $options['template'] == "old" ) { $kgvid_video_embed['enable'] = 'true'; } //regardless of any query settings, if we're using the old method it's turned on
	if ( (!is_array($kgvid_video_embed) && $kgvid_video_embed == "true") ) { $kgvid_video_embed = array ( 'enable' => 'true' ); } //maintain backwards compatibility

	if ( $options['embeddable'] == 'false' && !array_key_exists('sample', $kgvid_video_embed) && !array_key_exists('gallery', $kgvid_video_embed) ) { $kgvid_video_embed['enable'] = 'false'; }
	
	if ( array_key_exists('enable', $kgvid_video_embed) && $kgvid_video_embed['enable'] == 'true' && (strpos($post->post_mime_type,"video") !== false || array_key_exists('sample', $kgvid_video_embed)) ) {
	
		remove_action('wp_head', '_admin_bar_bump_cb'); //don't show the WordPress admin bar if you're logged in
		
		$shortcode = kgvid_generate_attachment_shortcode($kgvid_video_embed);
		
		echo '<html style="background-color:transparent;"><head>';
		echo (wp_head());
		echo '<style>.kgvid_wrapper { margin:0; }';
		if ( array_key_exists('gallery', $kgvid_video_embed) ) { echo ' .kgvid_below_video { color:white; } .kgvid_below_video a { color:aaa; }'; }
		echo '</style>';
		echo '</head><body class="content" style="margin:0px; font-family: sans-serif; padding:0px; border:none;';
		if ( array_key_exists('gallery', $kgvid_video_embed) ) { echo 'background-color:black; '; }
		else { echo 'background-color:transparent; '; }
		echo '">';
		echo (do_shortcode( $shortcode ));
		echo '</body></html>';
		exit;
	}
}
add_action('template_redirect', 'kgvid_video_attachment_template');

/* function kgvid_serve_secure_video_files($wp) {
	if ( array_key_exists('kgvid_video_embed', $wp->query_vars) && array_key_exists('id', $wp->query_vars['kgvid_video_embed']) && array_key_exists('format', $wp->query_vars['kgvid_video_embed']) && array_key_exists('token', $wp->query_vars['kgvid_video_embed']) ) {
		$kgvid_video_embed = $wp->query_vars['kgvid_video_embed'];
		if ( $kgvid_video_embed['format'] == "original" ) { $video_id = $kgvid_video_embed['id']; }
		else { $video_id = get_post_meta($kgvid_video_embed['id'], '_kgflashmediaplayer-format', $kgvid_video_embed['format'] ); }
		$url = wp_get_attachment_url($video_id);
		$type = get_post_mime_type($video_id);
		error_log($url);
		header('Location: ' .$url);
		header('Content-type: '.$type);
		exit(0);
	}
}
add_action('parse_request', 'kgvid_serve_secure_video_files'); */

function kgvid_cleanup_generated_logfiles_handler($logfile) {
	$lastmodified = "";
	if ( file_exists($logfile) ) { $lastmodified = filemtime($logfile); }
		if ( $lastmodified != false ) {
			if ( time() - $lastmodified > 120 ) { unlink($logfile); }
			else {
				$timestamp = wp_next_scheduled( 'kgvid_cleanup_generated_logfiles' );
				wp_unschedule_event($timestamp, 'kgvid_cleanup_generated_logfiles' );
				$args = array('logfile'=>$logfile);
				wp_schedule_single_event(time()+600, 'kgvid_cleanup_generated_logfiles', $args);
			}
		}
}
add_action('kgvid_cleanup_generated_logfiles','kgvid_cleanup_generated_logfiles_handler');

function kgvid_cleanup_generated_thumbnails_handler() {
	$uploads = wp_upload_dir();
	kgvid_rrmdir($uploads['path'].'/thumb_tmp'); //remove the whole tmp file directory
}
add_action('kgvid_cleanup_generated_thumbnails','kgvid_cleanup_generated_thumbnails_handler');

function kgvid_schedule_cleanup_generated_files() { //schedules deleting all tmp thumbnails or logfiles if no files are generated in an hour	

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );

	if (isset($_POST['thumbs'])) { 
		$timestamp = wp_next_scheduled( 'kgvid_cleanup_generated_thumbnails' );
		wp_unschedule_event($timestamp, 'kgvid_cleanup_generated_thumbnails' );
		wp_schedule_single_event(time()+3600, 'kgvid_cleanup_generated_thumbnails');
	}

	if (isset($_POST['logfile'])) { 
		$timestamp = wp_next_scheduled( 'kgvid_cleanup_generated_logfiles' );
		wp_unschedule_event($timestamp, 'kgvid_cleanup_generated_logfiles' );
		$args = array('logfile'=>$_POST['logfile']);
		wp_schedule_single_event(time()+600, 'kgvid_cleanup_generated_logfiles', $args);	
	}
	
	die(); // this is required to return a proper result
}
add_action('wp_ajax_kgvid_schedule_cleanup_generated_files', 'kgvid_schedule_cleanup_generated_files');

function kgvid_make_thumbs($postID, $movieurl, $numberofthumbs, $i, $iincreaser, $thumbtimecode, $dofirstframe, $generate_button) {

	$options = get_option('kgvid_video_embed_options');
	$ffmpegPath = $options['app_path']."/".$options['video_app'];
	$uploads = wp_upload_dir();

	if ( get_post_type($postID) == "attachment" ) { 
		$moviefilepath = get_attached_file($postID);
		$movie_width = get_post_meta($postID, '_kgflashmediaplayer-actualwidth');
		if ( empty($movie_width) ) { 
			$movie_info = kgvid_get_video_dimensions($moviefilepath);
			update_post_meta($postID, '_kgflashmediaplayer-actualwidth', $movie_info['width']);
			update_post_meta($postID, '_kgflashmediaplayer-actualheight', $movie_info['height']);
			update_post_meta($postID, '_kgflashmediaplayer-duration', $movie_info['duration']);
			if ( !empty($movie_info['rotate']) ) { update_post_meta($postID, '_kgflashmediaplayer-rotate', $movie_info['rotate']);	}
		}
		else {
			$movie_info = array (
				'width' => get_post_meta($postID, '_kgflashmediaplayer-actualwidth', true),
				'height' => get_post_meta($postID, '_kgflashmediaplayer-actualheight', true),
				'duration' => get_post_meta($postID, '_kgflashmediaplayer-duration', true),
				'rotate' => get_post_meta($postID, '_kgflashmediaplayer-rotate', true),
				'worked' => true
			);
		}
	}
	else {
		$moviefilepath = esc_url_raw(str_replace(" ", "%20", $movieurl));
		$moviefilepath = str_replace("https://", "http://",  $moviefilepath);
		$movie_info = kgvid_get_video_dimensions($moviefilepath);
	}
	
	if ($movie_info['worked'] == true) { //if FFMPEG was able to open the file
			
		$movie_extension = pathinfo(parse_url($movieurl, PHP_URL_PATH), PATHINFO_EXTENSION);
		$moviefilebasename = sanitize_file_name(basename($movieurl,'.'.$movie_extension));
		$thumbnailfilebase = $uploads['url']."/thumb_tmp/".$moviefilebasename;
		
		$movie_width = $movie_info['width'];
		$movie_height = $movie_info['height'];

		if (!file_exists($uploads['path'].'/thumb_tmp')) { mkdir($uploads['path'].'/thumb_tmp'); }

		if ( $movie_info['rotate'] === false) { $movie_info['rotate'] = ""; }
		switch ($movie_info['rotate']) { //if it's a sideways mobile video
			case '-vf "transpose=1"': //90 degrees
			case '-vf "transpose=2"': //270 degrees
				$movie_width ^= $movie_height ^= $movie_width ^= $movie_height; break; //swap height & width
		}
		
		$thumbnailheight = strval(round(floatval($movie_height) / floatval($movie_width) * 200));

		$jpgpath = $uploads['path']."/thumb_tmp/";
		
		$movieoffset = round((intval($movie_info['duration']) * $iincreaser) / ($numberofthumbs * 2));

		if ($generate_button == "random") { //adjust offset random amount
			$movieoffset = $movieoffset - rand(0, round(intval($movie_info['duration']) / $numberofthumbs));
			if ($movieoffset < 0) { $movieoffset = "0"; }
		}

		if ($thumbtimecode) { //if a specific thumbnail timecode is set
			if ($thumbtimecode == "firstframe") { $thumbtimecode = "0"; }
			$timecode_array = explode(":", $thumbtimecode);
			$timecode_array = array_reverse($timecode_array);
			if ( array_key_exists(1, $timecode_array) ) { $timecode_array[1] = $timecode_array[1] * 60; }
			if ( array_key_exists(2, $timecode_array) ) { $timecode_array[2] = $timecode_array[2] * 3600; }
			$thumbtimecode = array_sum($timecode_array);
			$movieoffset = $thumbtimecode;
			$i = $numberofthumbs + 1;
		}

		if ($dofirstframe == "true" && $i == 1) { 
			$movieoffset = "0";
		}

		$thumbnailfilename[$i] = $jpgpath.$moviefilebasename."_thumb".$movieoffset.".jpg";
		$thumbnailfilename[$i] = str_replace(" ", "_", $thumbnailfilename[$i]);
		$ffmpeg_options = '-y -ss '.$movieoffset.' -i "'.$moviefilepath.'" '.$movie_info['rotate'].' -qscale 1 -vframes 1 -f mjpeg "'.$thumbnailfilename[$i].'"';
		$thumbnailurl = $thumbnailfilebase."_thumb".$movieoffset.'.jpg';
		$thumbnailurl = str_replace(" ", "_", $thumbnailurl);

		exec(escapeshellcmd($ffmpegPath." ".$ffmpeg_options));

		if (floatval($movieoffset) > 60) {
			$movieoffset_minutes = sprintf("%02s", intval(intval($movieoffset) / 60) );
			$movieoffset_seconds = sprintf("%02s", round(fmod( floatval($movieoffset), 60), 2) );
			$movieoffset_display = $movieoffset_minutes.":".$movieoffset_seconds;
		}
		else { $movieoffset_display = "00:".sprintf("%02s", $movieoffset); }
		
		$field_id = kgvid_backwards_compatible($postID);

		$thumbnaildisplaycode = '<div class="kgvid_thumbnail_select" name="attachments['.$postID.'][thumb'.$i.']" id="attachments-'.$postID.'-thumb'.$i.'"><label for="kgflashmedia-'.$postID.'-thumbradio'.$i.'"><img src="'.$thumbnailurl.'?'.rand().'" width="200" height="'.$thumbnailheight.'" class="kgvid_thumbnail"></label><br /><input type="radio" name="attachments['.$postID.'][thumbradio'.$i.']" id="kgflashmedia-'.$postID.'-thumbradio'.$i.'" value="'.str_replace('/thumb_tmp/', '/', $thumbnailurl).'" onchange="document.getElementById(\''.$field_id['poster'].'\').value = this.value; document.getElementById(\''.$field_id['thumbtime'].'\').value = \''. $movieoffset_display .'\'; document.getElementById(\'attachments-'. $postID .'-numberofthumbs\').value =\'1\';"></div>';

		$i++;

		$arr = array ( "thumbnaildisplaycode"=>$thumbnaildisplaycode, "movie_width"=>$movie_width, "movie_height"=>$movie_height, "lastthumbnumber"=>$i, "movieoffset"=>$movieoffset );

		echo json_encode($arr);
	
	}//if ffmpeg can open movie
	
	else { 
		$thumbnaildisplaycode = "<strong>Can't open movie file.</strong><br />".$movie_info['output'];
		$arr = array ( "thumbnaildisplaycode"=>$thumbnaildisplaycode, "embed_display"=>$thumbnaildisplaycode, "lastthumbnumber"=>"break" );
		echo json_encode($arr);
	} //can't open movie

}

function kgvid_enqueue_videos($postID, $movieurl, $encode_checked, $parent_id) {

	$options = get_option('kgvid_video_embed_options');
	$ffmpegPath = $options['app_path']."/".$options['video_app'];
	$uploads = wp_upload_dir();

	$embed_display = "";
	$start_encoding = false;
	$encode_these = array();
	$encode_list = array();
	$embeddable = array("flv", "f4v", "mp4", "mov", "m4v", "ogv", "ogg", "webm");
	$h264extensions = array("mp4", "m4v", "mov");
	$video_formats = kgvid_video_formats();
	$sanitized_url = kgvid_sanitize_url($movieurl);
	//$movieurl = esc_url_raw(str_replace(" ", "%20", $movieurl));
	$movieurl = $sanitized_url['movieurl'];
	$movieurl = str_replace("https://", "http://",  $movieurl);
	$movie_info = kgvid_get_video_dimensions($movieurl);
	
	if ($movie_info['worked'] == true) { //if FFMPEG was able to open the file
	
		$movie_width = $movie_info['width'];
		$movie_height = $movie_info['height'];
		if ( get_post_type($postID) == "attachment" ) {
			update_post_meta($postID, '_kgflashmediaplayer-actualheight', $movie_width);
			update_post_meta($postID, '_kgflashmediaplayer-actualheight', $movie_height);
			update_post_meta($postID, '_kgflashmediaplayer-duration', $movie_info['duration']);
			update_post_meta($postID, '_kgflashmediaplayer-rotate', $movie_info['rotate']);	
		}
		
		$encodevideo_info = kgvid_encodevideo_info($movieurl, $postID);
		
		foreach ( $video_formats as $format => $format_stats ) {
			if ( $encode_checked[$format] == "true" ) {
				if ( !$encodevideo_info[$format.'_exists'] ) { 
					if ( ($format == "1080" && $movie_height <= 1080) || ($format == "720" && $movie_height <= 720) ) {
						$movie_extension = pathinfo($movieurl, PATHINFO_EXTENSION);
						if ( in_array($movie_extension, $h264extensions) || $movie_height < intval($format) ) {
							$encode_formats[$format]['status'] = "lowres";
						} //skip if the resolution of an existing video is lower than the HD format
					}
					else { 
						$encode_formats[$format]['status'] = "queued";
						$encode_formats[$format]['name'] = $format_stats['name'];
						$encode_list[$format] = $format_stats['name'];
						update_post_meta($postID, '_kgflashmediaplayer-encode'.$format, 'on');
					}
				} // if video doesn't already exist
				else { $encode_formats[$format]['status'] = "encoded"; }
			} // if user wants to encode format
			else { 
				$encode_formats[$format]['status'] = "notchecked"; 
				update_post_meta($postID, '_kgflashmediaplayer-encode'.$format, 'notchecked');
			}
		}
	
		if ( !empty($encode_list) ) {
			$video_embed_queue = get_option('kgvid_video_embed_queue');
			if ( empty($parent_id) ) { $parent_id = get_post($postID)->post_parent; }
			$queue_entry = array (
				'attachmentID'=>$postID,
				'parent_id'=>$parent_id,
				'movieurl' => $movieurl,
				'encode_formats'=> $encode_formats,
				'movie_info' => $movie_info
			);
			$already_queued = false;
			if ( !empty($video_embed_queue ) ) {
				foreach ($video_embed_queue as $index => $entry) {
					if ( $entry['movieurl'] == $movieurl ) { 
						$already_queued = $index; 
						foreach ( $entry['encode_formats'] as $format => $value ) {
							if ( $value['status'] == "queued" && array_key_exists($format, $encode_list) ) { unset($encode_list[$format]); }
							if ( $value['status'] == "encoding" || $encode_checked[$format] != "true" ) { $queue_entry['encode_formats'][$format] = $entry['encode_formats'][$format]; } //don't edit queue entry for anything that's currently encoding or not checked
							if ( $parent_id == "check" ) { $parent_id = $entry['parent_id']; $queue_entry['parent_id'] = $entry['parent_id']; }
						}
					}
				}
			}
			
			if ( $already_queued !== false ) { 
				$video_embed_queue[$already_queued] = $queue_entry;
				update_option('kgvid_video_embed_queue', $video_embed_queue);
				if ( !empty($encode_list) ) { $embed_display = "<strong>".implode(", " , $encode_list)." updated in existing queue entry in position ".strval(intval($already_queued)+1).". </strong>"; }
				else { $embed_display = "<strong>Video is already queued in position ".strval(intval($already_queued)+1).". </strong>"; }
			}
			else { 
				$video_embed_queue[] = $queue_entry;
				update_option('kgvid_video_embed_queue', $video_embed_queue);
				$queue_position = intval(key( array_slice( $video_embed_queue, -1, 1, TRUE ) ));
				if ( $queue_position == 0 ) { $embed_display = "<strong>Starting ".strtoupper($options['video_app'])."... </strong>"; }
				else { $embed_display = "<strong>".implode(", " , $encode_list)." added to queue in position ".strval(intval($queue_position)+1). ". </strong>";
				}
			}				
		} //if any video formats don't already exist, add to queue
		else { $embed_display = "<strong>Nothing to encode.</strong>"; }
		
		$replaceoptions = "";
		$originalselect = "";
	
		$arr = array ( "embed_display"=>$embed_display );
		echo json_encode($arr);
	}
	else { 
		$thumbnaildisplaycode = "<strong>Can't open movie file.</strong><br />".$movie_info['output'];
		$arr = array ( "thumbnaildisplaycode"=>$thumbnaildisplaycode, "embed_display"=>$thumbnaildisplaycode, "lastthumbnumber"=>"break" );
		echo json_encode($arr);
	} //can't open movie	
}

function kgivd_save_singleurl_poster($parent_id, $poster, $movieurl) { //called by the "Embed Video from URL" tab when submitting

		$sanitized_url = kgvid_sanitize_url($movieurl);
		if ( !empty($poster) ) { kgvid_save_thumb($parent_id, $sanitized_url['basename'], $poster); }
		
}//if submit

function kgvid_callffmpeg() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	global $wpdb;

	$options = get_option('kgvid_video_embed_options');

	if (isset($_POST['attachmentID'])) { $postID = $_POST['attachmentID']; }
	if (isset($_POST['movieurl'])) { $movieurl = $_POST['movieurl']; }
	if (isset($_POST['numberofthumbs'])) { $numberofthumbs = $_POST['numberofthumbs']; }
	if (isset($_POST['thumbnumber'])) { $i = $_POST['thumbnumber']; }
	if (isset($_POST['thumbnumberplusincreaser'])) { $iincreaser = $_POST['thumbnumberplusincreaser']; }
	if (isset($_POST['thumbtimecode'])) { $thumbtimecode = $_POST['thumbtimecode']; }
	if (isset($_POST['dofirstframe'])) { $dofirstframe = $_POST['dofirstframe']; }
	if (isset($_POST['generate_button'])) { $generate_button = $_POST['generate_button']; }
	
	if (isset($_POST['encodeformats'])) { $encode_checked = $_POST['encodeformats']; }

	if (isset($_POST['poster'])) { $poster = $_POST['poster']; }
	if (isset($_POST['parent_id'])) { $parent_id = $_POST['parent_id']; }
	if ( !isset($parent_id) ) {	$parent_id = "check"; }

	if (isset($_POST['ffmpeg_action'])) { $action = $_POST['ffmpeg_action']; }
	
	if ( $options['ffmpeg_exists'] == true ) {
	
		if ( $action == "generate" ) { echo kgvid_make_thumbs($postID, $movieurl, $numberofthumbs, $i, $iincreaser, $thumbtimecode, $dofirstframe, $generate_button); }
		if ( $action == "enqueue" ) { echo kgvid_enqueue_videos($postID, $movieurl, $encode_checked, $parent_id); }
		if ( $action == "submit" ) { kgivd_save_singleurl_poster($parent_id, $poster, $movieurl); }
	}
	else {
			$thumbnaildisplaycode = '<strong>Error: '.strtoupper($options["video_app"]).' not found. Verify that '.strtoupper($options["video_app"]).' is installed at '.strtoupper($options["app_path"]).' and check the <a href="options-general.php?page=video-embed-thumbnail-generator/video-embed-thumbnail-generator.php">application path plugin setting</a>.</strong>' ; 
			$arr = array ( "thumbnaildisplaycode"=>$thumbnaildisplaycode, "embed_display"=>$thumbnaildisplaycode, "lastthumbnumber"=>"break" );
			echo json_encode($arr);
	}//no ffmpeg
	die(); // this is required to return a proper result
}
add_action('wp_ajax_kgvid_callffmpeg', 'kgvid_callffmpeg');

function kgvid_encode_videos() {

	$embed_display = "";
	$video = "";
	$video_key = "";
	$queued_format = "";
	$encoding = "";
	$uploads = wp_upload_dir();
	$movie_info = array("width"=>"", "height"=>"");
	$video_embed_queue = get_option('kgvid_video_embed_queue');
	$video_formats = kgvid_video_formats();

	if ( !empty($video_embed_queue) ) {
	
		$simultaneous = 1;
		
		foreach ( $video_embed_queue as $video_key => $queue_entry ) { //search the queue for any encoding video
			foreach ( $queue_entry['encode_formats'] as $format => $value ) {
				if ( $value['status'] == "encoding" ) {
					$video[] = $video_embed_queue[$video_key];
					$encoding[] = $value;
					$simultaneous--;
					if ( !empty($simultaneous) ) { break 2; }
				}
			}
		}
		
		if ( empty($encoding) ) {
			foreach ( $video_embed_queue as $video_key => $queue_entry ) { 
				foreach ( $queue_entry['encode_formats'] as $format => $value ) {
					if ( $value['status'] == "queued" ) { 
						$video = $video_embed_queue[$video_key];
						$queued_format = $format;
						break 2; 
					}
				}
			}
		}
		
		if ( !empty($queued_format) ) {
	
			$options = get_option('kgvid_video_embed_options');
	
			$ffmpegPath = $options['app_path']."/".$options['video_app'];
			if ( get_post_type($video['attachmentID']) == "attachment" ) { $moviefilepath = get_attached_file($video['attachmentID']); }
			else { 
				$moviefilepath = str_replace(" ", "%20", esc_url_raw($video['movieurl'])); 
				$moviefilepath = str_replace("https://", "http://",  $moviefilepath);
			}
			
			
			$movie_info = $video['movie_info'];
			$encodevideo_info = kgvid_encodevideo_info($video['movieurl'], $video['attachmentID']);
			
			$logfile = "";
			$processPID = "";
			$serverOS = "";
			$ffmpeg_options = "";
			
			if ( $options['video_app'] == "avconv" || $options['video_bitrate_flag'] == false ) { 
				$video_bitrate_flag = "b:v";
				$audio_bitrate_flag = "b:a";
				$profile_flag = "profile:v";
			}
			
			else { 
				$video_bitrate_flag = "b";
				$audio_bitrate_flag = "ab";
				$profile_flag = "profile";
			}
			
			$aac_array = kgvid_aac_encoders();
			$aac_available = false;
			foreach ( $aac_array as $aaclib ) { //cycle through available AAC encoders in order of quality
				if ( $movie_info['configuration'][$aaclib] == "true" ) { $aac_available = true; break; }
			}
	
			if ( $movie_info['configuration']['libx264'] == "true" && $aac_available ) {				
				foreach( $video_formats as $format => $format_stats ) {
					if ( $queued_format == $format && $format_stats['type'] == "h264" ) {
						if ( ! $encodevideo_info[$format.'_exists'] || ($encodevideo_info['sameserver'] && filesize($encodevideo_info[$format.'filepath']) < 24576) ) {
		
							if ( intval($movie_info['width']) > $format_stats['width'] ) { $h264_movie_width = $format_stats['width']; }
							else { $h264_movie_width = $movie_info['width']; }
							$h264_movie_height = strval(round(floatval($movie_info['height']) / floatval($movie_info['width']) * $h264_movie_width));
							if ( intval($h264_movie_height) > $format_stats['height'] ) { $h264_movie_height = $format_stats['height']; }
							$h264_movie_width = strval(round(floatval($movie_info['width']) / floatval($movie_info['height']) * $h264_movie_height));
						
							if ($h264_movie_height % 2 != 0) { $h264_movie_height++; } //if it's odd, increase by 1 to make sure it's an even number
							if ($h264_movie_width % 2 != 0) { $h264_movie_width--; } //if it's odd, decrease by 1 to make sure it's an even number
							
							$encode_string = kgvid_generate_encode_string($moviefilepath, $encodevideo_info[$format.'filepath'], $movie_info['configuration'], $queued_format, $h264_movie_width, $h264_movie_height);
							
						}//if file doesn't already exist
						else { $embed_display .= "<strong>".$format_stats['name']." already encoded. </strong>"; }
						break; //don't bother looping through the rest if we already found the format
					}//if format is chosen for encoding
				}//H.264 format loop
			}//if the x264 library and an aac library is enabled
			else {
				$embed_display .= "<strong>".strtoupper($options['video_app'])." missing library libx264 required for H.264 encoding";
				if ( !$aac_available ) {
					array_pop($aac_array); //get rid of the built-in "aac" encoder since it can't really be "installed"
					$lastaac = array_pop($aac_array);
					$aac_list = implode(", ", $aac_array);
					$aac_list .= " or ".$lastaac;
					$embed_display .= " and missing an AAC encoding library. Please install and enable ".$aac_list;
				}
				$embed_display .= ". </strong>";
			}
	
			if ( $queued_format == "webm" || $queued_format == "ogg" ) { //if it's not H.264 they both work essentially the same
				if ( ! $encodevideo_info[$queued_format.'_exists'] || ($encodevideo_info['sameserver'] && filesize($encodevideo_info[$queued_format.'filepath']) < 24576) ) {
					if ( $movie_info['configuration']['libvorbis'] == "true" && $movie_info['configuration'][$video_formats[$queued_format]['vcodec']] == "true" ) {
						$encode_string = kgvid_generate_encode_string($moviefilepath, $encodevideo_info[$queued_format.'filepath'], $movie_info['configuration'], $queued_format, $movie_info['width'], $movie_info['height']);
						$embed_display .= "<strong>Encoding ".$video_formats[$queued_format]['name'].". </strong>";
					}//if the necessary libraries are enabled
					else {
						$missing_libraries = array();
						if($movie_info['configuration']['libvorbis'] == 'false') { $missing_libraries[] = 'libvorbis'; }
						if($movie_info['configuration'][$video_formats[$queued_format]['vcodec']] == 'false') { $missing_libraries[] = $video_formats[$queued_format]['vcodec']; }
						$embed_display .= "<strong>".strtoupper($options['video_app'])." missing library ".implode(', ', $missing_libraries)."required for ".$video_formats[$queued_format]['name']." encoding. </strong>"; 
					}
				}//if file doesn't already exist
				else { $embed_display .= "<strong>".$video_formats[$queued_format]['vcodec']." already encoded. </strong>"; }
			}//if format is queued
	
			if ( !empty($encode_string) ) {
	
				$logfile = $uploads['path'].'/'.str_replace(" ", "_", $encodevideo_info['moviefilebasename'])."_".$queued_format."_".sprintf("%04s",mt_rand(1, 1000))."_encode.txt";
				
				$cmd = escapeshellcmd($encode_string);
				error_log($cmd);
				if ( !empty($cmd) ) { $cmd = $cmd." > ".$logfile." 2>&1 & echo $!"; }
				else {
					$arr = array ( "embed_display"=>"<span style='color:red;'>Error: Command 'escapeshellcmd' is disabled on your server.</span>" );
					return $arr;
				} 
				$process = new kgvid_Process($cmd);
		
				sleep(1);
		
				$processPID = $process->getPid();
				$serverOS = $process->OS;

				$args = array('logfile'=>$logfile);
				wp_schedule_single_event(time()+600, 'kgvid_cleanup_generated_logfiles', $args);
				if ( !wp_next_scheduled('kgvid_cleanup_queue', array ( 'scheduled' )) ) {
					wp_schedule_event( time()+86400, 'daily', 'kgvid_cleanup_queue', array ( 'scheduled' ) );
				}
				
				//update_post_meta($video['attachmentID'], '_kgflashmediaplayer-encode'.$format, 'on');

				$video['encode_formats'][$queued_format] = array (
					'name' => $video_formats[$queued_format]['name'],
					'status' => 'encoding',
					'filepath' => $encodevideo_info[$queued_format.'filepath'],
					'url' => $encodevideo_info[$queued_format.'url'],
					'logfile' => $logfile,
					'PID' => $processPID,
					'OS' => $serverOS,
					'started' => time()
				);

				$queue_entry = array (
					'attachmentID'=> $video['attachmentID'],
					'parent_id'=>$video['parent_id'],
					'movieurl' => $video['movieurl'],
					'encode_formats'=> $video['encode_formats'],
					'movie_info' => $video['movie_info']
				);

				$video_embed_queue[$video_key] = $queue_entry;
	
				//$embed_display .= "<script type='text/javascript'>alert('".$ffmpegPath." ".$ffmpeg_args."');</script>";
				
			} //end if there's stuff to encode

			//$output_map = array_map(create_function('$key, $value', 'return $key.":".$value." # ";'), array_keys($process->output), array_values($process->output));
			//$output_implode = implode($output_map);
			//$embed_display .= "Command: ".$cmd." Output: ".$output_implode;

			update_option('kgvid_video_embed_queue', $video_embed_queue);
			kgvid_encode_progress($video_key, $queued_format, "attachment");

		} //if there's a format to encode
		
	} //if there's a queue
	$arr = array ( "embed_display"=>$embed_display, "video_key"=>$video_key, "format"=>$queued_format, "actualwidth"=>$movie_info['width'], "actualheight"=>$movie_info['height'] );
	return $arr;

}

function kgvid_ajax_encode_videos() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	global $wpdb;
	$arr = kgvid_encode_videos();
	echo json_encode($arr);
	die();
	
}
add_action('wp_ajax_kgvid_ajax_encode_videos', 'kgvid_ajax_encode_videos');

function kgvid_test_ffmpeg() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	$cmd = $_POST['command'];
	$cmd=escapeshellcmd(stripcslashes($cmd));
	exec ( $cmd.' 2>&1', $output );
	$uploads = wp_upload_dir();
	if ( file_exists($uploads['path']."/sample-video-h264-480p.mp4") ) { unlink($uploads['path']."/sample-video-h264-480p.mp4"); }
	echo implode("\n", $output);
	die;

}
add_action('wp_ajax_kgvid_test_ffmpeg', 'kgvid_test_ffmpeg');

function kgvid_encode_progress($video_key, $format, $page) {

	$video_embed_queue = get_option('kgvid_video_embed_queue');
	
	if ( is_array($video_embed_queue) && array_key_exists($video_key, $video_embed_queue) ) {

		if ( array_key_exists('logfile', $video_embed_queue[$video_key]['encode_formats'][$format]) ) {
			$video_entry = $video_embed_queue[$video_key];
			$pid = $video_entry['encode_formats'][$format]['PID'];
			$logfile = $video_entry['encode_formats'][$format]['logfile'];
			$started = $video_entry['encode_formats'][$format]['started'];
			$movie_duration = $video_entry['movie_info']['duration'];
			$rotate_complete = false;
			$embed_display = "";
			$percent_done = "";
			$time_remaining = "";
			$other_message = "";
			$logfilecontents = "";
			$lastline = "";

			if ( $video_entry['encode_formats'][$format]['status'] != "Encoding Complete" ) {
	
				if ( is_file($logfile) ) {

					$fp = fopen($logfile, 'r');
					$c = '';
					$read = '';
					$offset = -1;
					$lines = 2;
					while ( $lines && fseek($fp, $offset, SEEK_END) >= 0 ) {
						$c = fgetc($fp);
						if( $c == "\n" || $c == "\r" ) {
							$lines--;
						}
						$read .= $c;
						$offset--;
					}
					fclose($fp);
					$lastline = strrev(rtrim($read,"\n\r"));
			
					$last_match = "";
					$time_matches = "";
					$video_matches = "";
					$libx264_matches = "";
					$fps_matches = "";
					$fps_match = "";
					$basename = "";
					
					$script_function = 'kgvid_redraw_encode_checkboxes("'.$video_entry['movieurl'].'", "'.$video_entry['attachmentID'].'", "'.$page.'")';
		
					preg_match('/time=(.*?) /', $lastline, $time_matches);
		
					if ( array_key_exists(1, $time_matches) != true ) { //if something other than the regular FFMPEG encoding output check for these
						preg_match('/video:(.*?) /', $lastline, $video_matches);
						preg_match('/libx264 (.*?) /', $lastline, $libx264_matches);
						//preg_match('/h264 (.*?) /', $lastline, $h264_matches);
						//preg_match('/Press (.*?) /', $lastline, $Press_matches);
						//preg_match('/buffer (.*?) /', $lastline, $buffer_matches);
					}
					if ( array_key_exists(1, $time_matches) == true ) { //still encoding
				
						if ( strpos($time_matches[1], ':') !== false ) {
							$current_hours = intval(substr($time_matches[1], -11, 2));
							$current_minutes = intval(substr($time_matches[1], -8, 2));
							$current_seconds = intval(substr($time_matches[1], -5, 2));
							$current_seconds = ($current_hours * 60 * 60) + ($current_minutes * 60) + $current_seconds;
						}
						else { $current_seconds = $time_matches[1]; }
	
						$percent_done = intval($current_seconds)/intval($movie_duration);
						$time_elapsed = time() - $started;
						if ( $percent_done != 0 ) { $time_remaining = date('H:i:s', round($time_elapsed / $percent_done) - $time_elapsed); }
						else $time_remaining = "unknown";
						$percent_done = round($percent_done*100);
						if ( $percent_done < 20 ) { $percent_done_text = ""; }
						else { $percent_done_text = strval($percent_done)."%"; }
		
						preg_match('/fps=\s+(.*?) /', $lastline, $fps_matches);
						if ( array_key_exists(1, $fps_matches) == true ) { 
							if ( $fps_matches[1] != 0 ) { $fps_match = $fps_matches[1]; }
							else {  $fps_match = "10"; }
						}
						else {  $fps_match = "10"; }
						$time_to_wait = strval(max(round(30000/intval($fps_match)), 1000)); //wait at least 1 second
						if ( intval($time_to_wait) > 10000 ) { //wait no more than 10 seconds
							$time_to_wait = 10000;
						}
				
						$args = array($video_key, $format, $page);
						wp_schedule_single_event(time()+60, 'kgvid_cron_queue_check', $args);

						$embed_display = '<strong>'.ucwords($video_entry['encode_formats'][$format]['status']).'</strong> <div class="kgvid_meter"><div class="kgvid_meter_bar" style="width:'.$percent_done.'%;"><div class="kgvid_meter_text">'.$percent_done_text.'</div></div></div><a href="javascript:void(0);" class="kgvid_cancel_button" id="attachments-'.$video_entry["attachmentID"].'-kgflashmediaplayer-cancelencode" onclick="kgvid_cancel_encode('.$pid.', \''.$video_entry["attachmentID"].'\', \''.$video_key.'\', \''.$format.'\');">Cancel</a><div style="display:block;"><small>Elapsed: '.date('H:i:s',$time_elapsed).'. Remaining: '.$time_remaining.'. FPS:'.$fps_match.'</small></div><script type="text/javascript">percent_timeout = setTimeout(function(){'.$script_function.'}, '.$time_to_wait.');</script>';
					}
					elseif ( time() - $started < 10 ) { //not enough time has passed, so check again later
						$args = array($video_key, $format, $page);
						$embed_display = '<strong>Encoding</strong> <script type="text/javascript">percent_timeout = setTimeout(function(){'.$script_function.'}, 1000);</script>';
						wp_schedule_single_event(time()+60, 'kgvid_cron_queue_check', $args);
					}
					elseif ( array_key_exists(1, $video_matches) == true || array_key_exists(1, $libx264_matches) == true ) { //encoding complete
						$percent_done = 100;
						$ended = filemtime($logfile);
						$time_elapsed = $ended - $started;
						$time_remaining = "0";
						$fps_match = "10";				
						if ( array_key_exists(1, $libx264_matches) ) { kgvid_fix_moov_atom($video_key, $format); } //fix the moov atom if the file was encoded by libx264
						$video_embed_queue[$video_key]['encode_formats'][$format]['status'] = "Encoding Complete";
						$video_embed_queue[$video_key]['encode_formats'][$format]['ended'] = $ended;
						$video_embed_queue[$video_key]['encode_formats'][$format]['lastline'] = $lastline;

						if ( $format == "rotated" ) {  
					
							$video_embed_queue[$video_key]['movie_info']['rotate'] = ""; //clear rotation because we've just fixed that problem
							delete_post_meta($video_entry['attachmentID'], '_kgflashmediaplayer-rotate');
						
							//$setwidth = get_post_meta($video_entry['attachmentID'], '_kgflashmediaplayer-width', true);
							//$setheight = get_post_meta($video_entry['attachmentID'], '_kgflashmediaplayer-height', true);
							$setwidth = $video_entry['movie_info']['width'];
							$setheight = $video_entry['movie_info']['height'];
							if ( intval($setwidth) > intval($setheight) ) {  //swap the width and height meta if it hasn't already been done
								update_post_meta($video_entry['attachmentID'], '_kgflashmediaplayer-actualwidth', $video_entry['movie_info']['height']);
								update_post_meta($video_entry['attachmentID'], '_kgflashmediaplayer-width', $setheight);
								$video_embed_queue[$video_key]['movie_info']['width'] = $video_entry['movie_info']['height'];
								update_post_meta($video_entry['attachmentID'], '_kgflashmediaplayer-actualheight', $video_entry['movie_info']['width']);
								update_post_meta($video_entry['attachmentID'], '_kgflashmediaplayer-height', $setwidth);
								$video_embed_queue[$video_key]['movie_info']['height'] = $video_entry['movie_info']['width'];
							}
							$video_embed_queue[$video_key]['encode_formats'][$format]['url'] = $video_embed_queue[$video_key]['movieurl'];
						
							$original_filename = get_attached_file($video_entry['attachmentID']);
							if (file_exists($video_embed_queue[$video_key]['encode_formats'][$format]['filepath'])) rename($video_embed_queue[$video_key]['encode_formats'][$format]['filepath'], $original_filename);
							// you must first include the image.php file
							// for the function wp_generate_attachment_metadata() to work and media.php for wp_read_video_metadata() in WP 3.6+
							require_once(ABSPATH . 'wp-admin/includes/image.php');
							global $wp_version;
							if ( $wp_version >= 3.6 ) { require_once(ABSPATH . 'wp-admin/includes/media.php'); }
							$attach_data = wp_generate_attachment_metadata( $video_entry['attachmentID'], $original_filename );
							wp_update_attachment_metadata( $video_entry['attachmentID'], $attach_data );
							$rotate_complete = true;
							
						} //end rotated video replacement
						update_option('kgvid_video_embed_queue', $video_embed_queue);
				
						//insert the encoded video as a child attachment of the original video, or post if external original
						if ( get_post_type($video_entry['attachmentID']) == "attachment" ) { //if the original video is in the database set that as parent
							$parent_id = $video_entry['attachmentID'];
							$title = get_the_title($video_entry['attachmentID']);
						}
						else { //otherwise set the post as the parent
							$parent_id = $video_entry['parent_id'];
							$sanitized_url = kgvid_sanitize_url($video_entry['movieurl']);
							$title = $sanitized_url['basename'];
						} 
						global $wpdb;
						$query = "SELECT ID FROM {$wpdb->posts} WHERE guid='".$video_embed_queue[$video_key]['encode_formats'][$format]['url']."'"; //check for existing entry in the db
						$video_id = $wpdb->get_var($query);
						if ( !$video_id ) {
							$wp_filetype = wp_check_filetype(basename($video_entry['encode_formats'][$format]['filepath']), null );
							$video_formats = kgvid_video_formats();
							$title .= " ".$video_formats[$format]['name'];
							$attachment = array(
							   'guid' => $video_entry['encode_formats'][$format]['url'], 
							   'post_mime_type' => $wp_filetype['type'],
							   'post_title' => $title,
							   'post_content' => '',
							   'post_status' => 'inherit'
							);
							$new_id = wp_insert_attachment( $attachment, $video_entry['encode_formats'][$format]['filepath'], $parent_id );
							// you must first include the image.php file
							// for the function wp_generate_attachment_metadata() to work and media.php for wp_read_video_metadata() in WP 3.6+
							require_once(ABSPATH . 'wp-admin/includes/image.php');
							global $wp_version;
							if ( $wp_version >= 3.6 ) { require_once(ABSPATH . 'wp-admin/includes/media.php'); }
							require_once(ABSPATH . 'wp-admin/includes/media.php');
							$attach_data = wp_generate_attachment_metadata( $new_id, $video_entry['encode_formats'][$format]['filepath'] );
							wp_update_attachment_metadata( $new_id, $attach_data );
							update_post_meta( $new_id, '_kgflashmediaplayer-format', $format );
							if ( get_post_type($video_entry['attachmentID']) == false ) { update_post_meta( $new_id, '_kgflashmediaplayer-externalurl', $video_entry['movieurl'] ); } //connect new video to external url
						}
					
						//finish inserting attachment
				
						$embed_display = '<strong>Encoding Complete</strong> <script type="text/javascript">percent_timeout = setTimeout(function(){'.$script_function.'}, 1000);</script>';
						$next_video = kgvid_encode_videos(); //start the next queued video
						if ( !empty($next_video['format']) ) {
							$args = array($next_video['video_key'], $next_video['format'], $page);
							wp_schedule_single_event(time()+60, 'kgvid_cron_queue_check', $args);
						}
					}
					else { //there was an error";
						if ( strpos($lastline, "signal 15") !== false ) { //if the encoding was intentionally canceled
							$lastline = "Encoding was canceled.";
						}
						$video_embed_queue[$video_key]['encode_formats'][$format]['status'] = "error";
						$video_embed_queue[$video_key]['encode_formats'][$format]['lastline'] = $lastline;
						update_option('kgvid_video_embed_queue', $video_embed_queue);
						$other_message = $lastline;
						$embed_display = '<strong>Error: </strong><span style="color:red;">'.$lastline.'.</span> <script type="text/javascript">percent_timeout = setTimeout(function(){'.$script_function.'}, 1000);</script>';
						$next_video = kgvid_encode_videos(); //start the next queued video
						if ( !empty($next_video['format']) ) {
							$args = array($next_video['video_key'], $next_video['format'], $page);
							wp_schedule_single_event(time()+60, 'kgvid_cron_queue_check', $args);
						}
					}
		
					//$embed_display .= $lastline;
					$arr = array ( "embed_display"=>$embed_display, "rotate_complete"=>$rotate_complete );
				}
				else { $arr = array ( "embed_display"=>"<strong>No log file</strong>" ); }
		
			}//if not completed
			else { $arr = array ( "embed_display"=>"<strong>".ucwords($video_embed_queue[$video_key]['encode_formats'][$format]['status'])."</strong>" ); }		
		} //if there's a queue and the video is encoding
		else { $arr = array ( "embed_display"=>"<strong>Waiting...</strong>" ); }
		return $arr;
		
	}//end if queue entry exists

}
add_action('kgvid_cron_queue_check', 'kgvid_encode_progress', 1, 3);

function kgvid_ajax_encode_progress() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	$video_key = $_POST['video_key'];
	$format = $_POST['format'];
	$page = $_POST['page'];
	global $wpdb;
	$progress = kgvid_encode_progress($video_key, $format, $page);
	echo json_encode($progress);
	die();
	
}
add_action('wp_ajax_kgvid_encode_progress', 'kgvid_ajax_encode_progress');

function kgvid_clear_completed_queue($type) {

	$video_embed_queue = get_option('kgvid_video_embed_queue');
	
	if ( !empty($video_embed_queue) ) {
	
		$keep = array();
		$cleared_video_queue = array();

		foreach ( $video_embed_queue as $video_key => $queue_entry ) {
			if ( !empty($queue_entry['encode_formats']) ) {
				foreach ( $queue_entry['encode_formats'] as $format => $value ) {
					if ( $value['status'] == "queued" || $value['status'] == "encoding" ) {
						$keep[$video_key] = true;
						break;
					}
					if ( $type == "scheduled" && $value['status'] == "Encoding Complete" ) {
						if ( time() - intval($value['ended']) < 604800 ) { //if it finished less than a week ago
							$keep[$video_key] = true;
							break;
						}
					}
				}
			}
		}
		
		foreach ( $keep as $video_key => $value ) {
			$cleared_video_queue[] = $video_embed_queue[$video_key];
		}
		sort($cleared_video_queue);

		update_option('kgvid_video_embed_queue', $cleared_video_queue);
	
	}
}
add_action('kgvid_cleanup_queue','kgvid_clear_completed_queue');

function kgvid_ajax_clear_completed_queue() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	global $wpdb;
	kgvid_clear_completed_queue('manual');
	$table = kgvid_generate_queue_table();	
	echo ($table);
	die();
	
}
add_action('wp_ajax_kgvid_clear_completed_queue', 'kgvid_ajax_clear_completed_queue');

function kgvid_ajax_clear_queue_entry() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	global $wpdb;
	$video_key = $_POST['index'];
	$video_embed_queue = get_option('kgvid_video_embed_queue');
	if ( array_key_exists($video_key, $video_embed_queue) ) { 
		unset($video_embed_queue[$video_key]);
		sort($video_embed_queue);
	}
	update_option('kgvid_video_embed_queue', $video_embed_queue);
	$table = kgvid_generate_queue_table();
	echo ($table);
	die();
	
}
add_action('wp_ajax_kgvid_clear_queue_entry', 'kgvid_ajax_clear_queue_entry');

function kgvid_cleanup_queue_handler() {
	kgvid_clear_completed_queue('scheduled');
}
add_action('kgvid_cleanup_queue', 'kgvid_cleanup_queue_handler');

function kgvid_fix_moov_atom($video_key, $format) {

	$options = get_option('kgvid_video_embed_options');
	
	if ( $options['moov'] == "qt-faststart" || $options['moov'] == "MP4Box" ) {
	
		$video_embed_queue = get_option('kgvid_video_embed_queue');
		$filepath = $video_embed_queue[$video_key][$format]['filepath'];

		if ( $options['moov'] == 'qt-faststart' && file_exists($filepath) ) {
			$faststart_tmp_file = str_replace('.m4v', '-faststart.m4v', $filepath);
			$cmd = escapeshellcmd($options['app_path']."/".$options['moov']." ".$filepath." ".$faststart_tmp_file);
			exec($cmd);
			if ( file_exists($faststart_tmp_file) ) {
				unlink($filepath);
				rename($faststart_tmp_file, $filepath);
			}
		}//if qt-faststart is selected
		
		if ( $options['moov'] == 'MP4Box' ) {
			$cmd = escapeshellcmd($options['app_path']."/".$options['moov']." -inter 500 ".$filepath);
			exec($cmd);
		}//if MP4Box is selected
			
	}//if there is an application selected for fixing moov atoms on libx264-encoded files.

}

function kgvid_cancel_encode() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );

	if (isset($_POST['kgvid_pid'])) { 
		$kgvid_pid = $_POST['kgvid_pid'];
		if ( intval($kgvid_pid) > 0 ) {
			posix_kill($kgvid_pid, 15);
		}
		$video_key = $_POST['video_key'];
		$format = $_POST['format'];
		$video_embed_queue = get_option('kgvid_video_embed_queue');
		$video_embed_queue[$video_key]['encode_formats'][$format]['status'] = "canceling";
		update_option('kgvid_video_embed_queue', $video_embed_queue);
	}
	die(); // this is required to return a proper result
}
add_action('wp_ajax_kgvid_cancel_encode', 'kgvid_cancel_encode');

function kgvid_ajax_delete_video() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	global $wpdb;
	$deleted = false;
	$attachment_id = "";
	if ( isset($_POST['movieurl']) ) { $movieurl = $_POST['movieurl']; }
	if ( isset($_POST['postid']) ) { $post_id = $_POST['postid']; }
	if ( isset($_POST['format']) ) { $format = $_POST['format']; }
	if ( isset($_POST['childid']) ) { $attachment_id = $_POST['childid']; }
	if ( empty($attachment_id) ) { //if there's no post_meta giving us the attachment to delete
		$encodevideo_info = kgvid_encodevideo_info($movieurl, $post_id);	
		if ( is_file($encodevideo_info[$format.'filepath']) ) {
				$deleted = unlink($encodevideo_info[$format.'filepath']);
		}
	}
	else { 
		$deleted = wp_delete_attachment($attachment_id);
		if ( !empty($deleted) ) { $deleted = true; }
	}
	echo($deleted);
	die();
	
}
add_action('wp_ajax_kgvid_delete_video', 'kgvid_ajax_delete_video');

function kgvid_delete_video_attachment($video_id) {

	if ( strpos(get_post_mime_type( $video_id ), 'video') !== false ) { //only do this for videos
		global $wpdb;
		$parent_post = get_post($video_id);
		$options = get_option('kgvid_video_embed_options');
		$video_embed_queue = get_option('kgvid_video_embed_queue');
		$parent_id = get_post($video_id)->post_parent;
		$wp_attached_file = get_post_meta($video_id, '_wp_attached_file', true);
		
		if ( !empty($video_embed_queue) ) { //remove any encode queue entry related to this attachment
			foreach ($video_embed_queue as $video_key => $video_entry) {
				if ( $video_entry['attachmentID'] == $video_id ) {
					unset($video_embed_queue[$video_key]);
					sort($video_embed_queue);
					update_option('kgvid_video_embed_queue', $video_embed_queue);
					break;
				}//if the video is an original format
				if ( $video_entry['attachmentID'] == $parent_id || get_post_meta($video_id, '_kgflashmediaplayer-externalurl', true) == $video_entry['movieurl'] ) {
					foreach ( $video_entry['encode_formats'] as $format => $value ) {
						if ( array_key_exists('filepath', $value) ) {
							if ( strpos($value['filepath'], $wp_attached_file) !== false ) { 
								$video_embed_queue[$video_key]['encode_formats'][$format]['status'] = "deleted";
								update_option('kgvid_video_embed_queue', $video_embed_queue);
								break;
							}//if the format has filepath information
						}//if the encoded child format is in the database
					}//loop through formats
				}//if the video is a child format
			}
		}
	
		$args = array( 
			'post_parent' => $video_id,
			'post_type' => 'attachment',
			'numberposts' => '-1'
		);
		$posts = get_posts( $args ); //find all children of the video in the database
		if ($posts) {
			foreach ($posts as $post) {
				wp_update_post( array( 'ID' => $post->ID, 'post_parent' => $parent_id ) ); //set post_parent field to the original video's post_parent
				if ( $options['delete_children'] != 'none' ) {
					if ( $options['delete_children'] == 'all' ) { wp_delete_attachment($post->ID, true); }
					else if ( strpos($post->post_mime_type, 'video') !== false ) { wp_delete_attachment($post->ID, true); } //only delete videos
				}
			}//end loop
		}//end if there are any children
    }//end if video

	elseif ( strpos(get_post_mime_type( $video_id ), 'image') !== false ) {
		$args = array(
			'numberposts' => '-1',
			'post_type' => 'attachment',
			'meta_key' => '_kgflashmediaplayer-poster-id',
			'meta_value' => $video_id
		);
		$posts = get_posts( $args ); //find all posts that have this thumbnail ID in their meta
		if ( $posts ) {
			foreach ($posts as $post) {
				delete_post_meta($post->ID, '_kgflashmediaplayer-poster-id');
				delete_post_meta($post->ID, '_thumbnail-id');
				delete_post_meta($post->ID, '_kgflashmediaplayer-poster');
			}
		}
	}
}
add_action('delete_attachment', 'kgvid_delete_video_attachment');

function kgvid_get_set_featured() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );

	global $wpdb;
	
	/* $querystr = "
		SELECT $wpdb->posts.* 
		FROM $wpdb->posts, $wpdb->postmeta
		WHERE $wpdb->posts.ID = $wpdb->postmeta.post_id 
		AND $wpdb->postmeta.meta_key = '_kgflashmediaplayer-poster-id' 
		ORDER BY $wpdb->posts.post_date ASC
 	";
	$videoposts = $wpdb->get_results($querystr, OBJECT); */
	
	$args = array(
		'post_type' => null,
		'numberposts' => -1,
		'meta_key' => '_kgflashmediaplayer-poster-id'
	);
	$videoposts = get_posts( $args );

	if ($videoposts) {
		foreach ($videoposts as $post) {
			if ( $post->post_type == "attachment" ) { $post_id = $post->post_parent; }
			else { $post_id = $post->ID; }
			$poster_id = get_post_meta($post->ID, "_kgflashmediaplayer-poster-id", true);
			if ( !empty($post_id) && !empty($poster_id) ) { $posts[$post_id] = $poster_id; }
		}//end loop
	}//end if posts
	
	$cms_switch_queue = get_option('kgvid_video_embed_cms_switch');
	$cms_switch_queue['set_featured'] = $posts;
	update_option('kgvid_video_embed_cms_switch', $cms_switch_queue);
	echo count($posts);
	die;
}
add_action('wp_ajax_kgvid_get_set_featured', 'kgvid_get_set_featured');

function kgvid_set_featured() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	$queue = get_option('kgvid_video_embed_cms_switch');
	if ( $queue['set_featured'] ) {
		foreach ( $queue['set_featured'] as $post_id => $poster_id ) {
			set_post_thumbnail($post_id, $poster_id);
			unset($queue['switching_parents'][$post_id]);
			update_option('kgvid_video_embed_cms_switch', $queue);
		}
		unset($queue['set_featured']);
		if ( empty($queue) ) { delete_option('kgvid_video_embed_cms_switch'); }
		else { update_option('kgvid_video_embed_cms_switch', $queue); }
	}
	die;
}
add_action('wp_ajax_kgvid_set_featured', 'kgvid_set_featured');

function kgvid_get_switch_parents() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	$new_parent = 'post';
	if (isset($_POST['parent'])) { $new_parent = $_POST['parent']; }
	$children = array();
	
	if ( $new_parent == 'post' ) {
	
		$args = array(
			'orderby' => 'post_date',
			'order' => 'ASC',
			'post_type' => 'attachment',
			'numberposts' => -1,
			'post_mime_type' => 'video'
		);
		$attachments = get_posts( $args );

		if ($attachments) {
			foreach ($attachments as $post) {
				if ( !empty($post->post_parent) ) { //if the video is attached to a post	
					$args = array(
						'orderby' => 'post_date',
						'order' => 'ASC',
						'post_parent' => $post->ID,
						'post_type' => 'attachment',
						'post_mime_type' => 'image',
						'numberposts' => -1
					);
					$thumbnails = get_posts( $args );
					if ($thumbnails) {
						foreach ( $thumbnails as $thumbnail ) {
							$children[$thumbnail->ID] = array( 'post_parent' => $post->post_parent, 'video_id' => $post->ID );
						}
					}//end if there are children
				}//end if it has a parent
			}//end loop
		}//end if posts
	}//end if new parent is post
	
	if ( $new_parent == 'video' ) {
	
		$args = array(
			'orderby' => 'post_date',
			'order' => 'ASC',
			'post_type' => 'attachment',
			'post_mime_type' => 'image',
			'meta_key' => '_kgflashmediaplayer-video-id',
			'numberposts' => -1
		);
		$thumbnails = get_posts( $args );
	
		if ( $thumbnails ) {
			foreach ($thumbnails as $thumbnail) {
				$video_id = get_post_meta($thumbnail->ID, '_kgflashmediaplayer-video-id', true);
				$children[$thumbnail->ID] = array( 'post_parent' => false, 'video_id' => $video_id );
			}
		}
	}
	$cms_switch_queue = get_option('kgvid_video_embed_cms_switch');
	$cms_switch_queue['switching_parents'] = $children;
	update_option('kgvid_video_embed_cms_switch', $cms_switch_queue);
	echo count($children);
	die;
}
add_action('wp_ajax_kgvid_get_switch_parents', 'kgvid_get_switch_parents');

function kgvid_switch_parents() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	$queue = get_option('kgvid_video_embed_cms_switch');
	if ( $queue['switching_parents'] ) {
		$new_parent = 'post';
		if (isset($_POST['parent'])) { $new_parent = $_POST['parent']; }
	
		foreach ( $queue['switching_parents'] as $thumbnail_id => $thumbnail ) {
			if ( $new_parent == 'post' ) {
				wp_update_post( array( 'ID' => $thumbnail_id, 'post_parent' => $thumbnail['post_parent'] ) );
				update_post_meta($thumbnail_id, '_kgflashmediaplayer-video-id', $thumbnail['video_id']);
			}
		
			if ( $new_parent == 'video' ) {
				wp_update_post( array( 'ID' => $thumbnail_id, 'post_parent' => $thumbnail['video_id'] ) );
			}
			unset($queue['switching_parents'][$thumbnail_id]);
			update_option('kgvid_video_embed_cms_switch', $queue);
		}
		unset($queue['switching_parents']);
		if ( empty($queue) ) { delete_option('kgvid_video_embed_cms_switch'); }
		else { update_option('kgvid_video_embed_cms_switch', $queue); }
	}
	die;
}
add_action('wp_ajax_kgvid_switch_parents', 'kgvid_switch_parents');

function kgvid_update_cms_progress() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	$remaining = 0;
	if (isset($_POST['cms_type'])) { $type = $_POST['cms_type']; }
	if (isset($_POST['total'])) { $total = $_POST['total']; }
	$queue = get_option('kgvid_video_embed_cms_switch');
	if ( is_array($queue) ) {
		if ( array_key_exists($type, $queue) ) { $remaining = count($queue[$type]); }
	}
	echo $remaining;
	die;
	
}
add_action('wp_ajax_kgvid_update_cms_progress', 'kgvid_update_cms_progress');

function kgvid_singleurl_meta_box($postType) {

	$matches = kgvid_check_for_shortcode_in_content();
	
	if ( $matches[5] ) {
		add_meta_box(
			'kgvid_singleurl_meta',
			'Video Embed & Thumbnail Generator',
			'kgvid_singleurl_inner_custom_box',
			$postType
		);
	}
}
//add_action( 'add_meta_boxes', 'kgvid_singleurl_meta_box' );

function kgvid_singleurl_inner_custom_box($post) {

	global $wpdb;

	$video_formats = kgvid_video_formats();
	$matches = kgvid_check_for_shortcode_in_content();
	$urls = array_unique($matches[5]);
	if ( $urls ) {
		$nonce = wp_create_nonce('video-embed-thumbnail-generator-nonce');
		echo '<h4>Alternate formats of embedded videos</h4>';
		foreach ( $urls as $movieurl ) {
			$query = "SELECT ID FROM {$wpdb->posts} WHERE guid='{$movieurl}'"; //GUID seems to be the only way to get a video URL
			$video_id = $wpdb->get_var($query);
			
			echo '<div class="kgvid_post_meta_boxes">';
			if ( empty($video_id) ) {
				$sanitized_url = kgvid_sanitize_url($movieurl);
				echo '<input type="hidden" name="attachments['.$sanitized_url['singleurl_id'].'][kgflashmediaplayer-security]" value="'.$nonce.'">';
				echo '<strong>'.$sanitized_url['basename'].'</strong>';
				echo kgvid_generate_encode_checkboxes($movieurl, $sanitized_url['singleurl_id'], 'queue');
				echo '<input type="button" id="attachments-'.$sanitized_url['singleurl_id'].'-kgflashmediaplayer-update" name="attachments['.$sanitized_url['singleurl_id'].'][kgflashmediaplayer-update]" class="button-secondary" value="Re-scan External Server" onclick="kgvid_rescan_external_server(\''.$movieurl.'\', \''.$sanitized_url['singleurl_id'].'\');" /><span id="attachments-'.$sanitized_url['singleurl_id'].'-kgflashmediaplayer-rescanplaceholder"></span>';
			}
			else {
				echo '<input type="hidden" name="attachments['.$video_id.'][kgflashmediaplayer-security]" value="'.$nonce.'">';
				echo '<strong>'.get_the_title($video_id).'</strong>';
				echo kgvid_generate_encode_checkboxes($movieurl, $video_id, 'queue'); 
			}
			echo '</div>';
		}//loop through KGVID URLs
	}//if there are any KGVID URLs
}

function kgvid_ajax_rescan_external_server() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	if (isset($_POST['movieurl'])) { $movieurl = $_POST['movieurl']; }
	if (isset($_POST['postID'])) { $post_id = $_POST['postID']; }
	$video_formats = kgvid_video_formats();
	$matching_posts = array();
	foreach ( $video_formats as $format => $format_stats ) {
		$args = array(
			'numberposts' => '-1',
			'post_type' => null,
			'meta_key' => '_kgflashmediaplayer-'.$post_id.'-'.$format
		);
		$posts = get_posts($args);
		if ( $posts ) {
			foreach ( $posts as $post ) {
				$matching_posts[$post->ID] = $post;
				delete_post_meta($post->ID, '_kgflashmediaplayer-'.$post_id.'-'.$format);
			}
		}
	}
	if ( $matching_posts ) {
		foreach ( $matching_posts as $post ) { kgvid_encodevideo_info($movieurl, $post->ID); }
	}
	die;
}
add_action('wp_ajax_kgvid_rescan_external_server', 'kgvid_ajax_rescan_external_server');

function kgvid_count_play() {
	$post_id = $_POST['post_id'];
	$event = $_POST['video_event'];
	if ( $event == "play" ) { $event = "starts"; }
	if ( $event == "end" ) { $event = "completeviews"; }
	$plays = get_post_meta($post_id, '_kgflashmediaplayer-'.$event, true);
	if ( !empty($plays) ) { $plays = intval($plays)+1; }
	else { $plays = 1; }
	update_post_meta($post_id, '_kgflashmediaplayer-'.$event, $plays);
	echo $plays;
	die(); // stop executing script
}
add_action( 'wp_ajax_kgvid_count_play', 'kgvid_count_play' ); // ajax for logged in users
add_action( 'wp_ajax_nopriv_kgvid_count_play', 'kgvid_count_play' ); // ajax for not logged in users

function kgvid_deactivate() {
	wp_clear_scheduled_hook('kgvid_cleanup_queue', array( 'scheduled' ) );
	delete_option('kgvid_video_embed_queue');
}
register_deactivation_hook( __FILE__, 'kgvid_deactivate' );

?>