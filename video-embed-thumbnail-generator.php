<?php
/*
Plugin Name: Video Embed & Thumbnail Generator
Plugin URI: http://www.kylegilman.net/2011/01/18/video-embed-thumbnail-generator-wordpress-plugin/
Description: Generates thumbnails, HTML5-compliant videos, and embed codes for locally hosted videos. Requires FFMPEG for thumbnails and encodes. <a href="options-general.php?page=video-embed-thumbnail-generator.php">Settings</a> | <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=kylegilman@gmail.com&item_name=Video%20Embed%20And%20Thumbnail%20Generator%20Plugin%20Donation/">Donate</a>
Version: 2.0.2	
Author: Kyle Gilman
Author URI: http://www.kylegilman.net/

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA

1) Includes Strobe Media Playback Flash Player
   Website: http://osmf.org/strobe_mediaplayback.html
   License: http://creativecommons.org/licenses/by-nc/3.0/
2) Includes Geoff Stearns' SWFObject Javascript Library (MIT License) v2.1
   Website: http://code.google.com/p/swfobject/
   License: http://www.opensource.org/licenses/mit-license.php
3) Includes code adapted from Joshua Eldridge's Flash Media Player Plugin
   Website: http://wordpress.org/extend/plugins/flash-video-player/
4) Includes code adapted from Gary Cao's Make Shortcodes User-Friendly tutorial
   Website: http://www.wphardcore.com/2010/how-to-make-shortcodes-user-friendly/
5) Includes code adapted from Justin Gable's "Modifying Wordpress' Default Method for Inserting Media"
   Website: http://justingable.com/2008/10/03/modifying-wordpress-default-method-for-inserting-media/
6) Includes MobileESP class, Apache License 2.0
   Website: http://blog.mobileesp.com/

*/

if ( ! defined( 'ABSPATH' ) )
	die( "Can't load this file directly" );

function kg_add_upload_mimes ( $existing_mimes=array() ) {
 
	// allows uploading .webm videos
	$existing_mimes['webm'] = 'video/webm';
	return $existing_mimes;
 
}

add_filter('upload_mimes', 'kg_add_upload_mimes');


function url_exists($url) {
    $hdrs = @get_headers($url);
    return is_array($hdrs) ? preg_match('/^HTTP\\/\\d+\\.\\d+\\s+2\\d\\d\\s+.*$/',$hdrs[0]) : false;
}

function is_empty_dir($dir)
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

function kg_explodeX($delimiters,$string)
{
    $return_array = Array($string); // The array to return
    $d_count = 0;
    while (isset($delimiters[$d_count])) // Loop to loop through all delimiters
    {
        $new_return_array = Array();
        foreach($return_array as $el_to_split) // Explode all returned elements by the next delimiter
        {
            $put_in_new_return_array = explode($delimiters[$d_count],$el_to_split);
            foreach($put_in_new_return_array as $substr) // Put all the exploded elements in array to return
            {
                $new_return_array[] = $substr;
            }
        }
        $return_array = $new_return_array; // Replace the previous return array by the next version
        $d_count++;
    }
    return $return_array; // Return the exploded elements
} 

function rrmdir($dir) {
   if (is_dir($dir)) {
     $objects = scandir($dir);
     foreach ($objects as $object) {
       if ($object != "." && $object != "..") {
         if (filetype($dir."/".$object) == "dir") rrmdir($dir."/".$object); else unlink($dir."/".$object);
       }
     }
     reset($objects);
     rmdir($dir);
   }
}

function kg_check_ffmpeg_exists() {

		$exec_enabled = false;
		$ffmpeg_exists = false;
		$output = array();

		if(function_exists('exec')) { $exec_enabled = true; } 

		$ffmpeg_path = get_option('wp_FMP_ffmpeg');

		if ( $exec_enabled == true && ( file_exists($ffmpeg_path.'/ffmpeg') || file_exists($ffmpeg_path.'/ffmpeg.exe') ) ) { //if FFMPEG exists
			update_option('wp_FMP_ffmpeg_exists', "true");
			$ffmpeg_exists = true;
		}
		else { 	update_option('wp_FMP_ffmpeg_exists', "notinstalled"); }

		$output_output = implode("/n", $output);

		$arr = array ("exec_enabled"=>$exec_enabled, "ffmpeg_exists"=>$ffmpeg_exists, "return_value"=>$returnvalue, "output"=>$output_output);

		return $arr;
}

function kg_encodevideo_info($movieurl, $postID) {

	$uploads = wp_upload_dir();
	$movie_extension = pathinfo(parse_url($movieurl, PHP_URL_PATH), PATHINFO_EXTENSION);
	$encodevideo_info['moviefilebasename'] = basename($movieurl,'.'.$movie_extension);
	$moviefilepath = str_replace(" ", "%20", $movieurl);

	if ($postID != "singleurl") { //if it's an attachment, not from URL
		$moviefile = get_attached_file($postID);
		$path_parts = pathinfo($moviefile);
		$encodevideo_info['encodepath'] = $path_parts['dirname']."/";
		$encodevideo_info['sameserver'] = true;
	}
	else { 
		$url_parts = parse_url($uploads['url']);
		if ( strpos($moviefilepath, $url_parts['host']) != "" ) { //if we're on the same server
			$encodevideo_info['sameserver'] = true;
			$filename = urldecode($moviefilepath);
			$parsed_url= parse_url($filename);
			$fileinfo = pathinfo($filename);
			$parsed_url['extension'] = $fileinfo['extension'];
			$parsed_url['filename'] = $fileinfo['basename'];
			$parsed_url['localpath'] = $_SERVER['DOCUMENT_ROOT'].$parsed_url['path'];
			// just in case there is a double slash created when joining document_root and path
			$parsed_url['localpath'] = preg_replace('/\/\//', '/', $parsed_url['localpath']);

			$encodevideo_info['encodepath'] = rtrim($parsed_url['localpath'], $parsed_url['filename']);
		}
		else {
			$encodevideo_info['sameserver'] = false; 
			$encodevideo_info['encodepath'] = $uploads['basedir']."/html5encodes/";
		}
	}

	$movieurl_noextension = preg_replace("/\\.[^.\\s]{3,4}$/", "", $movieurl);
	$encodevideo_info['mobileurl'] = $movieurl_noextension."-ipod.m4v";
	$encodevideo_info['oggurl'] = $movieurl_noextension.".ogv";
	$encodevideo_info['webmurl'] = $movieurl_noextension.".webm";

	if ( !is_writable($encodevideo_info['encodepath']) ) { //if the original directory is not writable use a directory in base wp_upload
		$encodevideo_info['encodepath'] = $uploads['basedir']."/html5encodes/";
		$encodevideo_info['html5encodes'] = true;
		$encodevideo_info['mobileurl'] = $uploads['baseurl']."/html5encodes/".$encodevideo_info['moviefilebasename']."-ipod.m4v";
		$encodevideo_info['oggurl'] = $uploads['baseurl']."/html5encodes/".$encodevideo_info['moviefilebasename'].".ogv";
		$encodevideo_info['webmurl'] = $uploads['baseurl']."/html5encodes/".$encodevideo_info['moviefilebasename'].".webm";
	}

	$encodevideo_info['mobilefilepath'] = $encodevideo_info['encodepath'].$encodevideo_info['moviefilebasename']."-ipod.m4v";
	$encodevideo_info['oggfilepath'] = $encodevideo_info['encodepath'].$encodevideo_info['moviefilebasename'].".ogv";
	$encodevideo_info['webmfilepath'] = $encodevideo_info['encodepath'].$encodevideo_info['moviefilebasename'].".webm";

	$encodevideo_info['mobilefilepath_html5encodes'] = $uploads['basedir']."/html5encodes/".$encodevideo_info['moviefilebasename']."-ipod.m4v";
	$encodevideo_info['oggfilepath_html5encodes'] = $uploads['basedir']."/html5encodes/".$encodevideo_info['moviefilebasename'].".ogv";
	$encodevideo_info['webmfilepath_html5encodes'] = $uploads['basedir']."/html5encodes/".$encodevideo_info['moviefilebasename'].".webm";

	if ( file_exists($encodevideo_info['mobilefilepath']) ) { $encodevideo_info['mobile_exists'] = true; }
	else { 
		if ( file_exists($encodevideo_info['mobilefilepath_html5encodes']) ) { 
			$encodevideo_info['mobilefilepath'] = $encodevideo_info['mobilefilepath_html5encodes'];
			$encodevideo_info['mobile_exists'] = true;
		}
		else { $encodevideo_info['mobile_exists'] = false; }
	}
	if ( file_exists($encodevideo_info['oggfilepath']) ) { $encodevideo_info['ogg_exists'] = true; }
	else { 
		if ( file_exists($encodevideo_info['oggfilepath_html5encodes']) ) { 
			$encodevideo_info['oggfilepath'] = $encodevideo_info['oggfilepath_html5encodes'];
			$encodevideo_info['ogg_exists'] = true;
		}
		else { $encodevideo_info['ogg_exists'] = false; }
	}
	if ( file_exists($encodevideo_info['webmfilepath']) ) { $encodevideo_info['webm_exists'] = true; }
	else { 
		if ( file_exists($encodevideo_info['webmfilepath_html5encodes']) ) { 
			$encodevideo_info['webmfilepath'] = $encodevideo_info['webmfilepath_html5encodes'];
			$encodevideo_info['webm_exists'] = true;
		}
		else { $encodevideo_info['webm_exists'] = false; }
	}

	if ( !$encodevideo_info['sameserver'] ) { //last resort if it's not on the same server, check url_exists
		if ( !file_exists($encodevideo_info['mobilefilepath']) ) { 
			if ( url_exists($movieurl_noextension."-ipod.m4v") ) { 
				$encodevideo_info['mobile_exists'] = true;
				$encodevideo_info['mobileurl'] = $movieurl_noextension."-ipod.m4v"; ;
			}
			else { $encodevideo_info['mobile_exists'] = false; }
		}
		if ( !file_exists($encodevideo_info['oggfilepath']) ) { 
			if ( url_exists($movieurl_noextension.".ogv") ) { 
				$encodevideo_info['ogg_exists'] = true;
				$encodevideo_info['oggurl'] = $movieurl_noextension.".ogv"; ;
			}
			else { $encodevideo_info['ogg_exists'] = false; }
		}
		if ( !file_exists($encodevideo_info['webmfilepath']) ) { 
			if ( url_exists($movieurl_noextension.".webm") ) { 
				$encodevideo_info['webm_exists'] = true;
				$encodevideo_info['webmurl'] = $movieurl_noextension.".webm"; ;
			}
		}
	}

	return $encodevideo_info;
}

function video_embed_thumbnail_generator_activate() {

   define("wp_FMP_swfobject_default", "true", true);
   define("wp_FMP_flashplayer_default", "<strong>Please upgrade Flash Player</strong> This content is shown when the user does not have a correct Flash Player version installed.", true);
   define("wp_FMP_default_width", "640", true);
   define("wp_FMP_default_height", "360", true);
   define("wp_FMP_default_HTML5", "true", true);
   define("wp_FMP_default_controlbar_style", "docked", true);
   define("wp_FMP_default_poster", "", true);
   define("wp_FMP_default_autohide", "true", true);
   define("wp_FMP_default_autoplay", "false", true);
   define("wp_FMP_default_loop", "false", true);
   define("wp_FMP_default_playbutton", "true", true);
   define("wp_FMP_default_stream_type", "liveOrRecorded", true);
   define("wp_FMP_default_scale_mode", "letterbox", true);
   define("wp_FMP_default_bgcolor", "", true);
   define("wp_FMP_default_configuration", "", true);
   define("wp_FMP_default_skin", plugins_url("", __FILE__)."/flash/skin/kg_skin.xml", true);
   define("wp_FMP_default_ffmpeg", "/usr/local/bin", true);
   define("wp_FMP_default_ffmpeg_exists", "notchecked", true);
   define("wp_FMP_default_encodemobile", "true", true);
   define("wp_FMP_default_mobile_res", "480", true);
   define("wp_FMP_default_encodeogg", "false", true);
   define("wp_FMP_default_encodewebm", "true", true);

   add_option('wp_FMP_swfobject', wp_FMP_swfobject_default);
   add_option('wp_FMP_flashplayer', wp_FMP_flashplayer_default);
   add_option('wp_FMP_width', wp_FMP_default_width);
   add_option('wp_FMP_height', wp_FMP_default_height);
   add_option('wp_FMP_HTML5', wp_FMP_default_HTML5);
   add_option('wp_FMP_controlbar_style', wp_FMP_default_controlbar_style);
   add_option('wp_FMP_poster', wp_FMP_default_poster);
   add_option('wp_FMP_autohide', wp_FMP_default_autohide);
   add_option('wp_FMP_autoplay', wp_FMP_default_autoplay);
   add_option('wp_FMP_loop', wp_FMP_default_loop);
   add_option('wp_FMP_playbutton', wp_FMP_default_playbutton);
   add_option('wp_FMP_stream_type', wp_FMP_default_stream_type);
   add_option('wp_FMP_scale_mode', wp_FMP_default_scale_mode);
   add_option('wp_FMP_bgcolor', wp_FMP_default_bgcolor);
   add_option('wp_FMP_configuration', wp_FMP_default_configuration);
   add_option('wp_FMP_skin', wp_FMP_default_skin);
   add_option('wp_FMP_ffmpeg', wp_FMP_default_ffmpeg);
   add_option('wp_FMP_ffmpeg_exists', wp_FMP_default_ffmpeg_exists);
   add_option('wp_FMP_mobile_res', wp_FMP_default_mobile_res);
   add_option('wp_FMP_encodemobile', wp_FMP_default_encodemobile);
   add_option('wp_FMP_encodeogg', wp_FMP_default_encodeogg);
   add_option('wp_FMP_encodewebm', wp_FMP_default_encodewebm);

   kg_check_ffmpeg_exists();

}

register_activation_hook( __FILE__, 'video_embed_thumbnail_generator_activate' );

function addSWFObject() {
	if(get_option('wp_FMP_swfobject') == "true") {
		echo "\n<script src=\"".plugins_url("", __FILE__)."/flash/swfobject.js\" type=\"text/javascript\"></script>\n";
	}
}


function FMP_shortcode($atts, $content = ''){
	
		// workaround for relative video URL (contributed by Lee Fernandes)
		if(substr($content, 0, 1) == '/') $content = get_bloginfo('url').$content;
	
		$query_atts = shortcode_atts(
						array('width' => get_option('wp_FMP_width'), 
							  'height' => get_option('wp_FMP_height'),
							  'controlbar' => get_option('wp_FMP_controlbar_style'),
							  'autohide' => get_option('wp_FMP_autohide'),
							  'poster' => get_option('wp_FMP_poster'),
							  'playbutton' => get_option('wp_FMP_playbutton'),
							  'loop' => get_option('wp_FMP_loop'),
							  'autoplay' => get_option('wp_FMP_autoplay'),
							  'streamtype' => get_option('wp_FMP_stream_type'),
							  'scalemode' => get_option('wp_FMP_scale_mode'),
							  'backgroundcolor' => get_option('wp_FMP_bgcolor'),
							  'configuration' => get_option('wp_FMP_configuration'),
							  'skin' => get_option('wp_FMP_skin')), $atts); 

		$div_suffix = substr(uniqid(rand(), true),0,4);


		$video_swf = plugins_url('', __FILE__)."/flash/StrobeMediaPlayback.swf";
		$minimum_flash = "10.1.0";
		
		$flashvars = "{src:'".urlencode(trim($content))."'";
		
		if($query_atts["controlbar"] != '') {
			$flashvars .= ", controlBarMode:'".$query_atts["controlbar"]."'";
		}
		if($query_atts["autohide"] != '') {
			$flashvars .= ", controlBarAutoHide:'".$query_atts["autohide"]."'";
		}
		if($query_atts["poster"] != '') {
			$flashvars .= ", poster:'".$query_atts["poster"]."'";
		}
		if($query_atts["playbutton"] != '') {
			$flashvars .= ", playButtonOverlay:'".$query_atts["playbutton"]."'";
		}
		if($query_atts["loop"] != '') {
			$flashvars .= ", loop:'".$query_atts["loop"]."'";
		}
		if($query_atts["autoplay"] != '') {
			$flashvars .= ", autoPlay:'".$query_atts["autoplay"]."'";
		}
		if($query_atts["streamtype"] != '') {
			$flashvars .= ", streamType:'".$query_atts["streamtype"]."'";
		}
		if($query_atts["scalemode"] != '') {
			$flashvars .= ", scaleMode:'".$query_atts["scalemode"]."'";
		}
		if($query_atts["backgroundcolor"] != '') {
			$flashvars .= ", backgroundColor:'".$query_atts["backgroundcolor"]."'";
		}	
		if($query_atts["configuration"] != '') {
			$flashvars .= ", configuration:'".urlencode($query_atts["configuration"])."'";
		}
		if($query_atts["skin"] != '') {
			$flashvars .= ", skin:'".urlencode($query_atts["skin"])."'";
		}		
		
		$flashvars .= "}";
		
		$params = "{allowfullscreen:'true', allowscriptaccess:'always', base:'".plugins_url("", __FILE__)."/flash/'}";
		
		if(get_option('wp_FMP_HTML5') == "true") {
			include_once dirname( __FILE__ ) .'/mdetect.php';
			$uagent_obj = new uagent_info();
			$isAndroid = $uagent_obj->DetectAndroid(); //determine if we're running on an Android device
			$isTierIphone = $uagent_obj->DetectTierIphone(); //determine if we're running on a mobile device that plays iPhone-optimized video
			$moviefilebasename = pathinfo(trim($content), PATHINFO_FILENAME);
			//$moviefilebasename = str_replace(" ", "_", $moviefilebasename);
			$moviefiletype = pathinfo(trim($content), PATHINFO_EXTENSION);
			$flashcompatible = array("flv", "f4v", "mp4", "mov", "m4v");
			$h264compatible = array("mp4", "mov", "m4v");

			$encodevideo_info = kg_encodevideo_info(trim($content), 'singleurl');

			$code = "<div id=\"flashcontent".$div_suffix."\">";
			$code .= "<video ";
			if ($query_atts["loop"] == 'true') { $code .= "loop='loop' " ;}
			if ($query_atts["autoplay"] == 'true') { $code .= "autoplay='autoplay' " ;}
			if ($query_atts["controlbar"] != 'none') { $code .= "controls='controls' " ;}
			if ($isAndroid) { $code .= "onclick='this.play();' "; }
			$code .= "preload='metadata' ";
				if($query_atts["poster"] != '' && !$isAndroid) {
					$code .= "poster='".$query_atts["poster"]."' ";
				}
				if($query_atts["poster"] != '' && $isAndroid) {
					$code .= "poster='".plugins_url('', __FILE__)."/images/androidthumb.php?src=".$query_atts["poster"]."' ";
				}
			$code .= "width='".$query_atts["width"]."' height='".$query_atts["height"]."'";
			$code .= ">\n";

			if ( in_array($moviefiletype, $h264compatible) ) {
				if ( $encodevideo_info["mobile_exists"] && $isTierIphone ) { 
					$code .= "<source src='".$encodevideo_info["mobileurl"]."'";
				}
				else { $code .= "<source src='".trim($content)."'"; }
				if (!$isAndroid) { $code.= " type='video/mp4'";	} 
				$code .=">\n";
			}
			else { if ( $encodevideo_info["mobile_exists"] ) { 
				$code .= "<source src='".$encodevideo_info["mobileurl"]."'";
				if (!$isAndroid) { $code.= " type='video/mp4'";	} 
				$code .=">\n";
			} }
			if ( $encodevideo_info["webm_exists"] ) { $code .= "<source src='".$encodevideo_info["webmurl"]."' type='video/webm'>\n"; }
			if ( $encodevideo_info["ogg_exists"] ) { $code .= "<source src='".$encodevideo_info["oggurl"]."' type='video/ogg'>\n"; }
			$code .= "</video>\n";
			$code .= "</div>\n\n";
		} else {
			if ( in_array($moviefiletype, $flashcompatible) ) { $code = "<div id=\"flashcontent".$div_suffix."\">".get_option('wp_FMP_flashplayer')."</div>\n\n"; }
		}
		
		if ( in_array($moviefiletype, $flashcompatible) ) { 
			$code .= "<script type=\"text/javascript\">\n\t";
			$code .= "swfobject.embedSWF('".$video_swf."', 'flashcontent".$div_suffix."', '".trim($query_atts['width'])."', '".trim($query_atts['height'])."', '".$minimum_flash."', '".plugins_url("", __FILE__)."/flash/expressInstall.swf', $flashvars, $params)\n";
			$code .= "</script>\n";
		}

		return $code;
}
add_shortcode('FMP', 'FMP_shortcode');
	
function addFMPOptionsPage() {
		add_options_page('Video Embed & Thumbnail Generator', 'Video Embed & Thumbnail Generator', 8, basename(__FILE__), 'FMPOptionsPage');
	}	

function FMPOptionsPage() {

   define("wp_FMP_swfobject_default", "true", true);
   define("wp_FMP_flashplayer_default", "<strong>Please upgrade Flash Player</strong> This content is shown when the user does not have a correct Flash Player version installed.", true);
   define("wp_FMP_default_width", "640", true);
   define("wp_FMP_default_height", "360", true);
   define("wp_FMP_default_HTML5", "true", true);
   define("wp_FMP_default_controlbar_style", "docked", true);
   define("wp_FMP_default_poster", "", true);
   define("wp_FMP_default_autohide", "true", true);
   define("wp_FMP_default_autoplay", "false", true);
   define("wp_FMP_default_loop", "false", true);
   define("wp_FMP_default_playbutton", "true", true);
   define("wp_FMP_default_stream_type", "liveOrRecorded", true);
   define("wp_FMP_default_scale_mode", "letterbox", true);
   define("wp_FMP_default_bgcolor", "", true);
   define("wp_FMP_default_configuration", "", true);
   define("wp_FMP_default_skin", plugins_url("", __FILE__)."/flash/skin/kg_skin.xml", true);
   define("wp_FMP_default_ffmpeg", "/usr/local/bin", true);
   define("wp_FMP_default_mobile_res", "480", true);
   define("wp_FMP_default_encodemobile", "true", true);
   define("wp_FMP_default_encodeogg", "false", true);
   define("wp_FMP_default_encodewebm", "true", true);

		if (isset($_POST['wp_FMP_reset'])) {
			update_option('wp_FMP_swfobject', wp_FMP_swfobject_default);
			update_option('wp_FMP_HTML5', wp_FMP_default_HTML5);
			update_option('wp_FMP_width', wp_FMP_default_width);
			update_option('wp_FMP_height', wp_FMP_default_height);
			update_option('wp_FMP_flashplayer', wp_FMP_flashplayer_default);
			update_option('wp_FMP_controlbar_style', wp_FMP_default_controlbar_style);
			update_option('wp_FMP_poster', wp_FMP_default_poster);
			update_option('wp_FMP_autohide', wp_FMP_default_autohide);
			update_option('wp_FMP_autoplay', wp_FMP_default_autoplay);
			update_option('wp_FMP_loop', wp_FMP_default_loop);
			update_option('wp_FMP_playbutton', wp_FMP_default_playbutton);
			update_option('wp_FMP_stream_type', wp_FMP_default_stream_type);
			update_option('wp_FMP_scale_mode', wp_FMP_default_scale_mode);
			update_option('wp_FMP_bgcolor', wp_FMP_default_bgcolor);
			update_option('wp_FMP_configuration', wp_FMP_default_configuration);
			update_option('wp_FMP_skin', wp_FMP_default_skin);	
			update_option('wp_FMP_ffmpeg', wp_FMP_default_ffmpeg);
			update_option('wp_FMP_mobile_res', wp_FMP_default_mobile_res);
			update_option('wp_FMP_encodemobile', wp_FMP_default_encodemobile);
			update_option('wp_FMP_encodeogg', wp_FMP_default_encodeogg);	
			update_option('wp_FMP_encodewebm', wp_FMP_default_encodewebm);	
		
			echo "<div class='updated'><p><strong>Video Embed & Thumbnail Generator plugin reset to default settings</strong></p></div>";

			$ffmpeg_info = kg_check_ffmpeg_exists();

			if ( $ffmpeg_info['exec_enabled'] == false ) {
				echo "<div class='error'><p><strong>EXEC function is disabled in PHP settings. Embed codes will work, but video thumbnail generation and Mobile/HTML5 encoding will not. Contact your System Administrator to find out if you can enable EXEC</strong></p></div>"; 
			}
			elseif ( $ffmpeg_info['ffmpeg_exists'] == false ) { 
				echo "<div class='error'><p><strong>FFMPEG not found at ".get_option('wp_FMP_ffmpeg').". Embed codes will work, but video thumbnail generation and Mobile/HTML5 encoding will not.</strong></p></div>"; 
			}
	
		}	
	
		if (isset($_POST['wp_FMP_update'])) {
			check_admin_referer();
			$use_swfobject = $_POST[wp_FMP_swfobject];
			$use_html5fallback = $_POST[wp_FMP_HTML5];
			$use_autohide = $_POST[wp_FMP_autohide];
			$use_autoplay = $_POST[wp_FMP_autoplay];
			$use_loop = $_POST[wp_FMP_loop];
			$use_playbutton = $_POST[wp_FMP_playbutton];
			$use_encodemobile = $_POST[wp_FMP_encodemobile];
			$use_encodeogg = $_POST[wp_FMP_encodeogg];
			$use_encodewebm = $_POST[wp_FMP_encodewebm];
			
			if ($use_swfobject == 'use') {
				update_option(wp_FMP_swfobject, "true");
			} else {
				update_option(wp_FMP_swfobject, "false");
			}
			
			if ($use_html5fallback == 'use') {
				update_option(wp_FMP_HTML5, "true");
			} else {
				update_option(wp_FMP_HTML5, "false");
			}
			
			if ($use_autohide == 'use') {
				update_option(wp_FMP_autohide, "true");
			} else {
				update_option(wp_FMP_autohide, "false");
			}		

			if ($use_autoplay == 'use') {
				update_option(wp_FMP_autoplay, "true");
			} else {
				update_option(wp_FMP_autoplay, "false");
			}
			
			if ($use_loop == 'use') {
				update_option(wp_FMP_loop, "true");
			} else {
				update_option(wp_FMP_loop, "false");
			}		

			if ($use_playbutton == 'use') {
				update_option(wp_FMP_playbutton, "true");
			} else {
				update_option(wp_FMP_playbutton, "false");
			}	


			if ($use_encodemobile == 'use') {
				update_option(wp_FMP_encodemobile, "true");
			} else {
				update_option(wp_FMP_encodemobile, "false");
			}

			if ($use_encodeogg == 'use') {
				update_option(wp_FMP_encodeogg, "true");
			} else {
				update_option(wp_FMP_encodeogg, "false");
			}	

			if ($use_encodewebm == 'use') {
				update_option(wp_FMP_encodewebm, "true");
			} else {
				update_option(wp_FMP_encodewebm, "false");
			}		

			update_option('wp_FMP_mobile_res', $_POST[wp_FMP_mobile_res]);			
			update_option('wp_FMP_width', $_POST[wp_FMP_width]);
			update_option('wp_FMP_height', $_POST[wp_FMP_height]);
			update_option('wp_FMP_bgcolor', $_POST[wp_FMP_bgcolor]);
			update_option('wp_FMP_configuration', $_POST[wp_FMP_configuration]);
			update_option('wp_FMP_skin', $_POST[wp_FMP_skin]);
			update_option('wp_FMP_flashplayer', $_POST[wp_FMP_flashplayer]);
			update_option('wp_FMP_controlbar_style', $_POST[wp_FMP_controlbar_style]);
			update_option('wp_FMP_stream_type', $_POST[wp_FMP_stream_type]);
			update_option('wp_FMP_scale_mode', $_POST[wp_FMP_scale_mode]);
			update_option('wp_FMP_poster', $_POST[wp_FMP_poster]);
			update_option('wp_FMP_ffmpeg', $_POST[wp_FMP_ffmpeg]);

			echo "<div class='updated'><p><strong>Video Embed & Thumbnail Generator plugin settings updated</strong></p></div>";


			$ffmpeg_info = kg_check_ffmpeg_exists();

			if ( $ffmpeg_info['exec_enabled'] == false ) {
				echo "<div class='error'><p><strong>EXEC function is disabled in PHP settings. Embed codes will work, but video thumbnail generation and Mobile/HTML5 encoding will not. Contact your System Administrator to find out if you can enable EXEC</strong></p></div>"; 
			}
			elseif ( $ffmpeg_info['ffmpeg_exists'] == false ) { 
				echo "<div class='error'><p><strong>FFMPEG not found at ".get_option('wp_FMP_ffmpeg').". Embed codes will work, but video thumbnail generation and Mobile/HTML5 encoding will not.</strong></p></div>"; 
			}
		}

?>	

	<form method="post" action="options-general.php?page=video-embed-thumbnail-generator.php">
		<div class="wrap">
			<h2>Video Embed & Thumbnail Generator</h2>
				
				<table class="form-table">
					<tr>
						<th colspan="2"><h3>Plugin settings</h3></th><td>
						</td>
					</tr>				
					<tr>
						<th scope="row" valign="top" align="left">
							<label>Embed SWFObject:</label>
						</th>
						<td width="10"></td>
						<td>
							<?php
								echo "<input type='checkbox' name='wp_FMP_swfobject' id='wp_FMP_swfobject' value='use' ";
								if(get_option('wp_FMP_swfobject') == "true") {
									echo "checked";
								}
								echo " />\n";
							?>
							Uncheck if you already have SWFObject embedded
						</td>
					</tr>
					<tr>
						<th scope="row" valign="top" align="left">
							<label>Enable HTML5 video fallback:</label>
						</th>
						<td width="10"></td>
						<td>
							<?php
								echo "<input type='checkbox' name='wp_FMP_HTML5' id='wp_FMP_HTML5' value='use' ";
								if(get_option('wp_FMP_HTML5') == "true") {
									echo "checked";
								}
								echo " />\n";
							?>
							Uncheck if you don't want HTML5 video fallback when Flash isn't installed.
						</td>
					</tr>
					<tr>
						<th scope="row" valign="top" align="left">
							<label>Default Mobile/HTML5 Video Encode Formats:</label>
						</th>
						<td width="10"></td>
						<td>
							<?php
								echo "<input type='checkbox' name='wp_FMP_encodemobile' id='wp_FMP_encodemobile' value='use' ";
								if(get_option('wp_FMP_encodemobile') == "true") {
									echo "checked";
								}
								echo " />\n";
							?>
							H264/Mobile <small><em>(iOS, Android, Safari, IE 9)</em></small><br />
							<?php
								echo "<input type='checkbox' name='wp_FMP_encodewebm' id='wp_FMP_encodewebm' value='use' ";
								if(get_option('wp_FMP_encodewebm') == "true") {
									echo "checked";
								}
								echo " />\n";
							?>
							WEBM <small><em>(Firefox, Chrome, Android 2.3+, Opera)</em></small><br />
							<?php
								echo "<input type='checkbox' name='wp_FMP_encodeogg' id='wp_FMP_encodeogg' value='use' ";
								if(get_option('wp_FMP_encodeogg') == "true") {
									echo "checked";
								}
								echo " />\n";
							?>
							OGV <small><em>(Firefox, Chrome, Android 2.3+, Opera)</em></small><br />
							<em>Requires FFMPEG.</em>
						</td>
					</tr>
					<tr>
						<th scope="row" valign="top" align="left">
							<label>Maximum H.264/Mobile Encode Resolution:</label>
						</th>
						<td width="10"></td>
						<td>
							<select name="wp_FMP_mobile_res" id="wp_FMP_mobile_res">
								<?php 
									$res_480 = "";
									$res_720 = "";
									$res_1080 = "";
									if(get_option('wp_FMP_mobile_res') == "480") {
										$res_480 = " selected=\"selected\"";
									}
									if(get_option('wp_FMP_mobile_res') == "720") {
										$res_720 = " selected=\"selected\"";
									}
									if(get_option('wp_FMP_mobile_res') == "1080") {
										$res_1080 = " selected=\"selected\"";
									}
								?>
								<option value="480"<?php echo $res_480 ?>>480p</option>
								<option value="720"<?php echo $res_720 ?>>720p</option>
								<option value="1080"<?php echo $res_1080 ?>>1080p</option>
							</select> 
							<em>Newer mobile devices can display HD video (iPhone 4/iPad 1/some Android play 720p, iPhone 4s/iPad 2 play 1080p) but many older devices (iPhone 3Gs/older Android) can't play higher than 480p. Increase at your own risk.</em>
						</td>	
					</tr>
					<tr>
						<th scope="row" valign="top" align="left">
							<label>Path to FFMPEG:</label>
						</th>
						<td width="10"></td>
						<td>
							<input name="wp_FMP_ffmpeg" id="wp_FMP_ffmpeg" type="text" value="<?php echo get_option('wp_FMP_ffmpeg') ?>" /><br />
							<em>Don't include trailing slash. Example: /usr/local/bin</em>
						</td>	
					</tr>
					<tr>
						<th scope="row" valign="top" align="left">
							<label>Flash Player not installed message:</label>
						</th>
						<td width="10"></td>
						<td>
							<textarea name="wp_FMP_flashplayer" id="wp_FMP_flashplayer" rows="5" cols="50"><?php echo get_option('wp_FMP_flashplayer') ?></textarea><br />
							<em>This message will only be shown if HTML5 video fallback is disabled</em>
						</td>	
					</tr>
					<tr align="left">
						<th></th>
						<td></td>
						<td align="left"><br />
								<div style="align:left"><input name="wp_FMP_update" value="Save Changes" type="submit" />&nbsp;&nbsp;&nbsp;<input name="wp_FMP_reset" value="Reset to defaults" type="submit" /></div>
						</td>
					</tr>					
					<tr>
						<th colspan="2"><h3>Default video playback settings</h3></th><td>
						</td>
					</tr>
					<tr>
						<th scope="row" valign="top" align="left">
							<label>Default poster image:</label>
						</th>
						<td width="10"></td>
						<td>
							<input type='text' name='wp_FMP_poster' id='wp_FMP_poster' size='50' value='<?php echo get_option('wp_FMP_poster') ?>' />
						</td>	
					</tr>
					<tr>
						<th scope="row" valign="top" align="left">
							<label>Default max video width:</label>
						</th>
						<td width="10"></td>
						<td>
							<input name="wp_FMP_width" id="wp_FMP_width" type="text" value="<?php echo get_option('wp_FMP_width') ?>" />
						</td>	
					</tr>
					<tr>
						<th scope="row" valign="top" align="left">
							<label>Default max video height:</label>
						</th>
						<td width="10"></td>
						<td>
							<input name="wp_FMP_height" id="wp_FMP_height" type="text" value="<?php echo get_option('wp_FMP_height') ?>" />
						</td>	
					</tr>
					<tr>
						<th scope="row" valign="top" align="left">
							<label>Default controlbar style:</label>
						</th>
						<td width="10"></td>
						<td>
							<select name="wp_FMP_controlbar_style" id="wp_FMP_controlbar_style">
								<?php 
									$docked = "";
									$floating = "";
									$none = "";
									if(get_option('wp_FMP_controlbar_style') == "docked") {
										$docked = " selected=\"selected\"";
									}
									if(get_option('wp_FMP_controlbar_style') == "floating") {
										$floating = " selected=\"selected\"";
									}
									if(get_option('wp_FMP_controlbar_style') == "none") {
										$none = " selected=\"selected\"";
									}
								?>
								<option value="docked"<?php echo $docked ?>>docked</option>
								<option value="floating"<?php echo $floating ?>>floating</option>
								<option value="none"<?php echo $none ?>>none</option>
							</select> HTML5 videos only respond to the "none" option.
						</td>	
					</tr>
					<tr>
						<th scope="row" valign="top" align="left">
							<label>Default autoplay behavior:</label>
						</th>
						<td width="10"></td>
						<td>
							<?php
								echo "<input type='checkbox' name='wp_FMP_autoplay' id='wp_FMP_autoplay' value='use' ";
								if(get_option('wp_FMP_autoplay') == "true") {
									echo "checked";
								}
								echo " />\n";
							?>
							Check if you want video to automatically play when loaded
						</td>	
					</tr>
					<tr>
						<th scope="row" valign="top" align="left">
							<label>Default loop behavior:</label>
						</th>
						<td width="10"></td>
						<td>
							<?php
								echo "<input type='checkbox' name='wp_FMP_loop' id='wp_FMP_loop' value='use' ";
								if(get_option('wp_FMP_loop') == "true") {
									echo "checked";
								}
								echo " />\n";
							?>
							Check if you want video to loop
						</td>	
					</tr>
					<tr>
						<th colspan="3"><h4>The following options will only affect Flash playback</h4></th><td>
						</td>
					</tr>				
					<tr>
						<th scope="row" valign="top" align="left">
							<label>Default background color:</label>
						</th>
						<td width="10"></td>
						<td>
							<input name="wp_FMP_bgcolor" id="wp_FMP_bgcolor" type="text" value="<?php echo get_option('wp_FMP_bgcolor') ?>" /> #rrggbb
						</td>	
					</tr>
					<tr>
						<th scope="row" valign="top" align="left">
							<label>Default XML configuration file:</label>
						</th>
						<td width="10"></td>
						<td>
							<input name="wp_FMP_configuration" id="wp_FMP_configuration" type="text" size="50" value="<?php echo get_option('wp_FMP_configuration') ?>" />
						</td>	
					</tr>
					<tr>
						<th scope="row" valign="top" align="left">
							<label>Default video skin file:</label>
						</th>
						<td width="10"></td>
						<td>
							<input name="wp_FMP_skin" id="wp_FMP_skin" type="text" size="50" value="<?php echo get_option('wp_FMP_skin') ?>" /><br />
<em><small>Use <?php echo plugins_url("", __FILE__)."/flash/skin/kg_skin.xml" ?> for a modern, circular play button.<br />
Leave blank for the older, square play button.</small></em>
						</td>	
					</tr>					
					<tr>
						<th scope="row" valign="top" align="left">
							<label>Default video stream type:</label>
						</th>
						<td width="10"></td>
						<td>
							<select name="wp_FMP_stream_type" id="wp_FMP_stream_type">
								<?php 
									$liveOrRecorded = "";
									$live = "";
									$recorded = "";
									$dvr = "";
									
									if(get_option('wp_FMP_stream_type') == "liveOrRecorded") {
										$liveOrRecorded = " selected=\"selected\"";
									}
									if(get_option('wp_FMP_stream_type') == "live") {
										$live = " selected=\"selected\"";
									}
									if(get_option('wp_FMP_stream_type') == "recorded") {
										$recorded = " selected=\"selected\"";
									}
									if(get_option('wp_FMP_stream_type') == "dvr") {
										$dvr = " selected=\"selected\"";
									}
									
								?>
								<option value="liveOrRecorded"<?php echo $liveOrRecorded ?>>live or recorded</option>
								<option value="live"<?php echo $live ?>>live</option>
								<option value="recorded"<?php echo $recorded ?>>recorded</option>
								<option value="dvr"<?php echo $dvr ?>>DVR</option>
							</select>
						</td>	
					</tr>
					<tr>
						<th scope="row" valign="top" align="left">
							<label>Default video scale mode:</label>
						</th>
						<td width="10"></td>
						<td>
							<select name="wp_FMP_scale_mode" id="wp_FMP_scale_mode">
								<?php 
									$letterbox = "";
									$none = "";
									$stretch = "";
									$zoom = "";
									
									if(get_option('wp_FMP_scale_mode') == "letterbox") {
										$letterbox = " selected=\"selected\"";
									}
									if(get_option('wp_FMP_scale_mode') == "none") {
										$none = " selected=\"selected\"";
									}
									if(get_option('wp_FMP_scale_mode') == "stretch") {
										$stretch = " selected=\"selected\"";
									}
									if(get_option('wp_FMP_scale_mode') == "zoom") {
										$zoom = " selected=\"selected\"";
									}
									
								?>
								<option value="letterbox"<?php echo $letterbox ?>>letterbox</option>
								<option value="none"<?php echo $none ?>>none</option>
								<option value="stretch"<?php echo $stretch ?>>stretch</option>
								<option value="zoom"<?php echo $zoom ?>>zoom</option>
							</select>
						</td>	
					</tr>					
					<tr>
						<th scope="row" valign="top" align="left">
							<label>Default autohide behavior:</label>
						</th>
						<td width="10"></td>
						<td>
							<?php
								echo "<input type='checkbox' name='wp_FMP_autohide' id='wp_FMP_autohide' value='use' ";
								if(get_option('wp_FMP_autohide') == "true") {
									echo "checked";
								}
								echo " />\n";
							?>
							Uncheck if you do not want controlbar to hide when video is playing
						</td>	
					</tr>					
					<tr>
						<th scope="row" valign="top" align="left">
							<label>Default play button overlay:</label>
						</th>
						<td width="10"></td>
						<td>
							<?php
								echo "<input type='checkbox' name='wp_FMP_playbutton' id='wp_FMP_playbutton' value='use' ";
								if(get_option('wp_FMP_playbutton') == "true") {
									echo "checked";
								}
								echo " />\n";
							?>
							Uncheck if you do not want a play button overlay
						</td>	
					</tr>					
					<tr align="left">
						<th></th>
						<td></td>
						<td align="left"><br />
								<div style="align:left"><input name="wp_FMP_update" value="Save Changes" type="submit" />&nbsp;&nbsp;&nbsp;<input name="wp_FMP_reset" value="Reset to defaults" type="submit" /></div><br />&nbsp;<br />
						</td>
					</tr>
				</table>
				
		</div>
	</form>

<?php

}

function kg_addPostSave($post_id) { //saves the poster image as an attachment
	global $flag;
	if ($flag == 1) { //if draft already saved. Helps prevent duplicates.
		$current_post = get_post($post_id);
		$uploads = wp_upload_dir();

		preg_match_all('/poster="([^"\r\n]*)"/', $current_post->post_content, $matches);

		if (!empty($matches[1])) {
			$args = array( 'post_type' => 'attachment', 'numberposts' => -1, 'post_status' => null, 'post_parent' => null, 'post_mime_type' => 'image' ); 
			$post_children = get_posts( $args );
			$existing_attachment = array();
			$i=0;
			foreach ($post_children as $child) { 
				$existing_attachment[$i] = $child->guid;
				$i++;
				$kg_image_sizes = get_intermediate_image_sizes();
				foreach ($kg_image_sizes as $size_name) {
					$current_image_size_src = wp_get_attachment_image_src($child->ID, $size_name);
					$existing_attachment[$i] = $current_image_size_src[0];
					$i++;
				}//each image size URL
			}//each attachment
		}//if there are any poster urls set in the post

		foreach ($matches[1] as $url) {
			if(!in_array($url, $existing_attachment) && !is_local_attachment($url) ) { 
				$filename_baseurl = substr($url, 0, strlen($uploads['baseurl']));
				if ( $filename_baseurl == $uploads['baseurl'] ) {
					$filename = str_replace($filename_baseurl, $uploads['basedir'], $url);
					if (file_exists($filename)) {
						$wp_filetype = wp_check_filetype(basename($filename), null );
						$attachment = array(
							'post_mime_type' => $wp_filetype['type'],
							'post_title' => preg_replace('/\.[^.]+$/', '', basename($filename)),
							'post_content' => '',
							'post_status' => 'inherit',
							'guid' => $url
						);
						$attach_id = wp_insert_attachment( $attachment, $filename, $post_id );
						// you must first include the image.php file
						// for the function wp_generate_attachment_metadata() to work
						require_once(ABSPATH . "wp-admin" . '/includes/image.php');
						$attach_data = wp_generate_attachment_metadata( $attach_id, $filename );
						wp_update_attachment_metadata( $attach_id,  $attach_data );
					}//if file exists
				}//if url is in the uploads directory
			}//if url is not already an attachment
		}//foreach
	}//if post not already saved
	$flag = 1;
}
add_action('save_post', 'kg_addPostSave');


    /** 
     * Adding our custom fields to the $form_fields array 
     * 
     * @param array $form_fields 
     * @param object $post 
     * @return array 
     */  
    function kg_image_attachment_fields_to_edit($form_fields, $post) {  
      if( substr($post->post_mime_type, 0, 5) == 'video' ){ 

        $form_fields["kgflashmediaplayer-security"]["input"] = "hidden";
        $form_fields["kgflashmediaplayer-security"]["value"] = wp_create_nonce('video-embed-thumbnail-generator-nonce');

        $movieurl = wp_get_attachment_url($post->ID);
        $form_fields["kgflashmediaplayer-url"]["input"] = "hidden";
        $form_fields["kgflashmediaplayer-url"]["value"] = $movieurl;

        $encodemobileset = get_post_meta($post->ID, "_kgflashmediaplayer-encodemobile", true);
        if ($encodemobileset == "") { $encodemobileset = get_option('wp_FMP_encodemobile'); }
        $form_fields["kgflashmediaplayer-encodemobile"]["input"] = "hidden";
        $form_fields["kgflashmediaplayer-encodemobile"]["value"] = $encodemobileset;

        $encodeoggset = get_post_meta($post->ID, "_kgflashmediaplayer-encodeogg", true);
        if ($encodeoggset == "") { $encodeoggset = get_option('wp_FMP_encodeogg'); }
        $form_fields["kgflashmediaplayer-encodeogg"]["input"] = "hidden";
        $form_fields["kgflashmediaplayer-encodeogg"]["value"] = $encodeoggset;

        $encodewebmset = get_post_meta($post->ID, "_kgflashmediaplayer-encodewebm", true);
        if ($encodewebmset == "") { $encodewebmset = get_option('wp_FMP_encodewebm'); }
        $form_fields["kgflashmediaplayer-encodewebm"]["input"] = "hidden";
        $form_fields["kgflashmediaplayer-encodewebm"]["value"] = $encodewebmset;

        $encoded = get_post_meta($post->ID, "_kgflashmediaplayer-encoded", true);
        $form_fields["kgflashmediaplayer-encoded"]["input"] = "hidden";
        $form_fields["kgflashmediaplayer-encoded"]["value"] = $encoded;

        $maxwidth = get_option('wp_FMP_width');
        $widthset = get_post_meta($post->ID, "_kgflashmediaplayer-width", true);
        if ($widthset == "") { $widthset = $maxwidth; }
        $form_fields["kgflashmediaplayer-widthsave"]["input"] = "hidden";
        $form_fields["kgflashmediaplayer-widthsave"]["value"] = $widthset;

        $form_fields["kgflashmediaplayer-maxwidth"]["input"] = "hidden";
        $form_fields["kgflashmediaplayer-maxwidth"]["value"] = $maxwidth;

        $maxheight = get_option('wp_FMP_height');
        $heightset = get_post_meta($post->ID, "_kgflashmediaplayer-height", true);
        if ($heightset == "") { $heightset = $maxheight; }
        $form_fields["kgflashmediaplayer-heightsave"]["input"] = "hidden";
        $form_fields["kgflashmediaplayer-heightsave"]["value"] = $heightset;

        $form_fields["kgflashmediaplayer-maxheight"]["input"] = "hidden";
        $form_fields["kgflashmediaplayer-maxheight"]["value"] = $maxheight;

        $form_fields["kgflashmediaplayer-aspect"]["input"] = "hidden";
        $form_fields["kgflashmediaplayer-aspect"]["value"] = $heightset/$widthset;

        $form_fields["kgflashmediaplayer-downloadsave"]["input"] = "hidden";
        $form_fields["kgflashmediaplayer-downloadsave"]["value"] = get_post_meta($post->ID, "_kgflashmediaplayer-download", true);

        $form_fields["kgflashmediaplayer-showtitlesave"]["input"] = "hidden";
        $form_fields["kgflashmediaplayer-showtitlesave"]["value"] = get_post_meta($post->ID, "_kgflashmediaplayer-showtitle", true);

        $embedset = get_post_meta($post->ID, "_kgflashmediaplayer-embed", true);
        if ($embedset == "") { $embedset = "checked"; }
        $form_fields["kgflashmediaplayer-embedsave"]["input"] = "hidden";
        $form_fields["kgflashmediaplayer-embedsave"]["value"] = $embedset;

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
		else { if ( !url_exists($thumbnail_url) ) { $thumbnail_url = ""; } }

	$thumbnail_html = "";
        if ($thumbnail_url != "" ) { 		
		$thumbnail_html = '<div style="border-style:solid; border-color:#ccc; border-width:3px; width:200px; text-align:center; margin:10px;"><img width="200" src="'.$thumbnail_url.'"></div>'; 
	}

	if (get_post_meta($post->ID, "_kgflashmediaplayer-thumbtime", true) != "") { $numberofthumbs_value = "1"; }
	else { $numberofthumbs_value = "4"; }

	if ( get_option('wp_FMP_ffmpeg_exists') == false ) { kg_check_ffmpeg_exists(); } //make sure the new ffmpeg_exists option exists

	if ( get_option('wp_FMP_ffmpeg_exists') == "notinstalled" ) { $ffmpeg_disabled_text = 'disabled="disabled" title="FFMPEG not found at '.get_option('wp_FMP_ffmpeg').'"'; }
	else { $ffmpeg_disabled_text = ""; }

	$form_fields["generator"]["label"] = __("Thumbnails");
        $form_fields["generator"]["input"] = "html";
        $form_fields["generator"]["html"] = '<div id="attachments_'. $post->ID .'_thumbnailplaceholder">'. $thumbnail_html .'</div>
        <input id="attachments_'. $post->ID .'_numberofthumbs" type="text" value="'.$numberofthumbs_value.'" maxlength="1" size="4" style="width:25px;" onchange="document.getElementById(\'attachments['.$post->ID.'][thumbtime]\').value =\'\';" '.$ffmpeg_disabled_text.'/>
        <input type="button" id="attachments['. $post->ID .'][thumbgenerate]" class="button-secondary" value="Generate" name="thumbgenerate" onclick="kg_generate_thumb('. $post->ID .', \'generate\');" '.$ffmpeg_disabled_text.'/>
        <input type="button" id="thumbrandomize" class="button-secondary" value="Randomize" name="thumbrandomize" onclick="kg_generate_thumb('. $post->ID .', \'random\');" '.$ffmpeg_disabled_text.'/> 
        <input type="checkbox" id="attachments_'. $post->ID .'_firstframe" onchange="document.getElementById(\'attachments['.$post->ID.'][thumbtime]\').value =\'\';" '.$ffmpeg_disabled_text.'/>
        <label for="attachments_'. $post->ID .'_firstframe">Force 1st Frame Thumbnail</label>';

        $form_fields["thumbtime"]["label"] = __("Thumbnail Timecode");
        $form_fields["thumbtime"]["value"] = get_post_meta($post->ID, "_kgflashmediaplayer-thumbtime", true);
        $form_fields["thumbtime"]["helps"] = "<small>Optional: generates a single thumbnail at the specified time (hh:mm:ss, mm:ss, or s).</small>";

        $form_fields["kgflashmediaplayer-poster"]["label"] = __("Thumbnail URL");
        $form_fields["kgflashmediaplayer-poster"]["value"] = get_post_meta($post->ID, "_kgflashmediaplayer-poster", true);
        $form_fields["kgflashmediaplayer-poster"]["helps"] = "<small>Leave blank to use <a href='options-general.php?page=video-embed-thumbnail-generator.php' target='_blank'>default thumbnail</a>.</small>";

        $form_fields["kgflashmediaplayer-dimensions"]["label"] = __("Video Embed Dimensions");
        $form_fields["kgflashmediaplayer-dimensions"]["input"] = "html";
        $form_fields["kgflashmediaplayer-dimensions"]["html"] = 'Width: <input name="attachments_'. $post->ID .'_kgflashmediaplayer-width" type="text" value="'.$widthset.'" id="attachments_'. $post->ID .'_kgflashmediaplayer-width" type="text" style="width:50px;" onchange="kg_set_dimension('.$post->ID.', \'height\', this.value);" onkeyup="kg_set_dimension('.$post->ID.', \'height\', this.value);"> Height: 
        <input id="attachments_'. $post->ID .'_kgflashmediaplayer-height" type="text" value="'.$heightset.'" style="width:50px;" onchange="kg_set_dimension('.$post->ID.', \'width\', this.value);" onkeyup="kg_set_dimension('.$post->ID.', \'width\', this.value);"> 
        <input type="checkbox" id="attachments_'. $post->ID .'_kgflashmediaplayer-lockaspect" onclick="kg_set_aspect('.$post->ID.', this.checked);" checked> 
        <label for="attachments_'. $post->ID .'_kgflashmediaplayer-lockaspect"><small>Lock to Aspect Ratio</small></label>';
        $form_fields["kgflashmediaplayer-dimensions"]["helps"] = "<small>Leave blank to use <a href='options-general.php?page=video-embed-thumbnail-generator.php' target='_blank'>default dimensions</a>.</small>";

        if ($encodemobileset == "false") { $mobilechecked = ""; }
        else { $mobilechecked = "checked"; }
        if ($encodeoggset == "false") { $oggchecked = ""; }
        else { $oggchecked = "checked"; }
        if ($encodewebmset == "false") { $webmchecked = ""; }
        else { $webmchecked = "checked"; }

        $replaceoptions = "";

	$altembedset = get_post_meta($post->ID, "_kgflashmediaplayer-altembed", true);
	$encodevideo_info = kg_encodevideo_info($movieurl, $post->ID);

	$altembedselect = "";
        $selected = ' selected="selected" ';
        $mobileselected = "";
        $oggselected = "";
        $webmselected = "";
        if ($altembedset == $encodevideo_info['mobileurl']) { $mobileselected = $selected; }
        if ($altembedset == $encodevideo_info['oggurl']) { $oggselected = $selected; }
        if ($altembedset == $encodevideo_info['webmurl']) { $webmselected = $selected; }

        if ( $encodevideo_info['mobile_exists'] ) { $replaceoptions .= '<option '.$mobileselected.' value="'.$encodevideo_info['mobileurl'].'">Mobile/H.264</option>'; }
        if ( $encodevideo_info['webm_exists'] ) { $replaceoptions .= '<option '.$webmselected.' value="'.$encodevideo_info['webmurl'].'">WEBM</option>'; }
        if ( $encodevideo_info['ogg_exists'] ) { $replaceoptions .= '<option '.$oggselected.' value="'.$encodevideo_info['oggurl'].'">OGV</option>'; }
        if ( $encodevideo_info['mobile_exists'] || $encodevideo_info['webm_exists'] || $encodevideo_info['ogg_exists'] ) { $altembedselect ='<span class="kg_embedselect">Embed <select name="attachments['.$post->ID.'][kgflashmediaplayer-altembed]" id="attachments['.$post->ID.'][kgflashmediaplayer-altembed]"><option value="'.$movieurl.'">original</option>'.$replaceoptions.'</select></span>'; }

        $form_fields["kgflashmediaplayer-encode"]["label"] = __("HTML5 & Mobile");
        $form_fields["kgflashmediaplayer-encode"]["input"] = "html";
        $form_fields["kgflashmediaplayer-encode"]["html"] = '<input type="button" id="attachments['. $post->ID .'][kgflashmediaplayer-encode]" name="attachments['. $post->ID .'][kgflashmediaplayer-encode]" class="button-secondary" value="Encode" name="thumbgenerate" onclick="kg_generate_thumb('. $post->ID .', \'encode\');" '.$ffmpeg_disabled_text.'/> 

	<input type="checkbox" id="attachments['. $post->ID .'][kgflashmediaplayer-encodemobilecheck]" name="attachments['. $post->ID .'][kgflashmediaplayer-encodemobilecheck]" value="checked" onclick="if(this.checked) { document.getElementById(\'attachments['.$post->ID.'][kgflashmediaplayer-encodemobile]\').value = \'true\'; } else { document.getElementById(\'attachments['.$post->ID.'][kgflashmediaplayer-encodemobile]\').value = \'false\'; }" '.$mobilechecked.' '.$ffmpeg_disabled_text.'>
	<label for="attachments['. $post->ID .'][kgflashmediaplayer-encodemobilecheck]">Mobile/H.264</label> 

	<input type="checkbox" id="attachments['. $post->ID .'][kgflashmediaplayer-encodewebmcheck]" name="attachments['. $post->ID .'][kgflashmediaplayer-encodewebmcheck]" value="checked" onclick="if(this.checked) { document.getElementById(\'attachments['.$post->ID.'][kgflashmediaplayer-encodewebm]\').value = \'true\'; } else { document.getElementById(\'attachments['.$post->ID.'][kgflashmediaplayer-encodewebm]\').value = \'false\'; }" '.$webmchecked.' '.$ffmpeg_disabled_text.'>
	<label for="attachments['. $post->ID .'][kgflashmediaplayer-encodewebmcheck]">WEBM</label> 

	<input type="checkbox" id="attachments['. $post->ID .'][kgflashmediaplayer-encodeoggcheck]" name="attachments['. $post->ID .'][kgflashmediaplayer-encodeoggcheck]" value="checked" onclick="if(this.checked) { document.getElementById(\'attachments['.$post->ID.'][kgflashmediaplayer-encodeogg]\').value = \'true\'; } else { document.getElementById(\'attachments['.$post->ID.'][kgflashmediaplayer-encodeogg]\').value = \'false\'; }" '.$oggchecked.' '.$ffmpeg_disabled_text.'>
	<label for="attachments['. $post->ID .'][kgflashmediaplayer-encodeoggcheck]">OGV</label>

	<div style="display:inline;" id="attachments_'. $post->ID .'_altembedselect">'.$altembedselect.'</div>
	<div style="display:block;" id="attachments_'. $post->ID .'_encodeplaceholder"></div>
	<div style="display:block;" id="attachments_'. $post->ID .'_encodeprogressplaceholder"></div>

<small><em>(Experimental) Generates video files compatible with most mobile & HTML5-compatible browsers.</em></small>';

        $showtitlechecked = get_post_meta($post->ID, "_kgflashmediaplayer-showtitle", true);
        $downloadlinkchecked = get_post_meta($post->ID, "_kgflashmediaplayer-download", true);
        $embedchecked = get_post_meta($post->ID, "_kgflashmediaplayer-embed", true);
        if ($embedchecked == "unchecked") { $embedchecked = ""; }
        else { $embedchecked = "checked"; }
        $form_fields["kgflashmediaplayer-options"]["label"] = __("Video Embed Options");
        $form_fields["kgflashmediaplayer-options"]["input"] = "html";
        $form_fields["kgflashmediaplayer-options"]["html"] = '<input type="checkbox" name="attachments['.$post->ID.'][kgflashmediaplayer-showtitle]" id="attachments['.$post->ID.'][kgflashmediaplayer-showtitle]" value="checked" onclick="if(this.checked) { document.getElementById(\'attachments['.$post->ID.'][kgflashmediaplayer-showtitlesave]\').value = \'checked\'; } else { document.getElementById(\'attachments['.$post->ID.'][kgflashmediaplayer-showtitlesave]\').value = \'unchecked\'; }"" '.$showtitlechecked.'> 
	<label for="attachments['.$post->ID.'][kgflashmediaplayer-showtitle]">Include Title Above Video</label><br />

	<input type="checkbox" name="attachments['.$post->ID.'][kgflashmediaplayer-downloadlink]" id="attachments['.$post->ID.'][kgflashmediaplayer-downloadlink]" value="checked" onclick="if(this.checked) { document.getElementById(\'attachments['.$post->ID.'][kgflashmediaplayer-downloadsave]\').value = \'checked\'; } else { document.getElementById(\'attachments['.$post->ID.'][kgflashmediaplayer-downloadsave]\').value = \'unchecked\'; }" '.$downloadlinkchecked.'> 
	<label for="attachments['.$post->ID.'][kgflashmediaplayer-downloadlink]">Generate Download Link Below Video<em><small>(Makes it easier for users to download video file)</em></small></label><br />

	<input type="checkbox" name="attachments['.$post->ID.'][kgflashmediaplayer-embed]" id="attachments['.$post->ID.'][kgflashmediaplayer-embed]" value="checked" onclick="if(this.checked) { document.getElementById(\'attachments['.$post->ID.'][kgflashmediaplayer-embedsave]\').value = \'checked\'; } else { document.getElementById(\'attachments['.$post->ID.'][kgflashmediaplayer-embedsave]\').value = \'unchecked\'; }" '.$embedchecked.'> 
	<label for="attachments['.$post->ID.'][kgflashmediaplayer-embed]">Generate Embed Shortcode <em><small>(Turn off checkbox to use default WordPress video embedding)</small></em></label>';

        //$form_fields["kgflashmediaplayer-attachment"]["label"] = __("All Meta");
        //$form_fields["kgflashmediaplayer-attachment"]["value"] = get_post_meta($post->ID, "_kgflashmediaplayer-attachment", true);

      } //only add fields if attachment is video
    return $form_fields; 
    }  
    // attach our function to the correct hook  
    add_filter("attachment_fields_to_edit", "kg_image_attachment_fields_to_edit", null, 2);  

    /** 
     * @param array $post 
     * @param array $attachment 
     * @return array 
     */  
    function kg_video_attachment_fields_to_save($post, $attachment) {  
        // $attachment part of the form $_POST ($_POST[attachments][postID])  
        // $post attachments wp post array - will be saved after returned  
        //     $post['post_type'] == 'attachment'  
        if( isset($attachment['kgflashmediaplayer-poster']) ) {
		$uploads = wp_upload_dir();
		$posterfile = pathinfo($attachment['kgflashmediaplayer-poster'], PATHINFO_BASENAME);
		$tmp_posterpath = $uploads['path'].'/thumb_tmp/'.$posterfile;
                if ( !is_file($uploads['path'].'/'.$posterfile) ) {
			if ( is_file($tmp_posterpath) ) { 
				copy($tmp_posterpath, $uploads['path'].'/'.$posterfile);
				$thumb_base = substr($tmp_posterpath, 0, -5);
				foreach (glob($thumb_base."?.jpg") as $thumbfilename) {
				   unlink($thumbfilename);
				}
			}
			if ( is_empty_dir($uploads["path"].'/thumb_tmp') ) { rrmdir($uploads["path"].'/thumb_tmp'); }
		}
		update_post_meta($post['ID'], '_kgflashmediaplayer-poster', $attachment['kgflashmediaplayer-poster']); 
	}
        if( isset($attachment['thumbtime']) ) {update_post_meta($post['ID'], '_kgflashmediaplayer-thumbtime', $attachment['thumbtime']); }
        if( isset($attachment['kgflashmediaplayer-widthsave']) ) { update_post_meta($post['ID'], '_kgflashmediaplayer-width', $attachment['kgflashmediaplayer-widthsave']); }
        if( isset($attachment['kgflashmediaplayer-heightsave']) ) { update_post_meta($post['ID'], '_kgflashmediaplayer-height', $attachment['kgflashmediaplayer-heightsave']); }
        if( isset($attachment['kgflashmediaplayer-aspect']) ) { update_post_meta($post['ID'], '_kgflashmediaplayer-aspect', $attachment['kgflashmediaplayer-aspect']); }
        if( isset($attachment['kgflashmediaplayer-encodemobile']) ) { update_post_meta($post['ID'], '_kgflashmediaplayer-encodemobile', $attachment['kgflashmediaplayer-encodemobile']); }
        if( isset($attachment['kgflashmediaplayer-encodeogg']) ) { update_post_meta($post['ID'], '_kgflashmediaplayer-encodeogg', $attachment['kgflashmediaplayer-encodeogg']); }
        if( isset($attachment['kgflashmediaplayer-encodewebm']) ) { update_post_meta($post['ID'], '_kgflashmediaplayer-encodewebm', $attachment['kgflashmediaplayer-encodewebm']); }
        if( isset($attachment['kgflashmediaplayer-embedsave']) ) { update_post_meta($post['ID'], '_kgflashmediaplayer-embed', $attachment['kgflashmediaplayer-embedsave']); }
        if( isset($attachment['kgflashmediaplayer-downloadsave']) ) { update_post_meta($post['ID'], '_kgflashmediaplayer-download', $attachment['kgflashmediaplayer-downloadsave']); }
        if( isset($attachment['kgflashmediaplayer-showtitlesave']) ) { update_post_meta($post['ID'], '_kgflashmediaplayer-showtitle', $attachment['kgflashmediaplayer-showtitlesave']); }
        if( isset($attachment['kgflashmediaplayer-altembed']) ) { update_post_meta($post['ID'], '_kgflashmediaplayer-altembed', $attachment['kgflashmediaplayer-altembed']); }
       /* if( isset($attachment['kgflashmediaplayer-encoded']) ) { update_post_meta($post['ID'], '_kgflashmediaplayer-encoded', $attachment['kgflashmediaplayer-encoded']); } */

        //$attachment_printr = print_r($attachment, true);
        //update_post_meta($post['ID'], '_kgflashmediaplayer-attachment', $attachment_printr );

        return $post;  
    }
    add_filter("attachment_fields_to_save", "kg_video_attachment_fields_to_save", null, 2);


class kgInsertMedia {  
  //class constructor  
  function kgInsertMedia () {  
    add_filter('media_send_to_editor', array($this, 'kgmodifyMediaInsert') , 10, 3);  
  }  
  //function that does the modifying  
  function kgmodifyMediaInsert($html, $attachment_id, $attachment) {  

    $output = $html;

    $attachment['embed'] = get_post_meta($attachment_id, "_kgflashmediaplayer-embed", true);

    if ($attachment['embed'] == "checked" || $attachment_id == "singleurl" ) {
        $output = "";
        $attachment['altembed'] = get_post_meta($attachment_id, "_kgflashmediaplayer-altembed", true);
        if ( $attachment['altembed'] != "" ) { $attachment['url'] = $attachment['altembed']; } 
        else { $attachment['url'] = wp_get_attachment_url($attachment_id); }
        $attachment['title'] = get_the_title($attachment_id);
        $attachment['poster'] = get_post_meta($attachment_id, "_kgflashmediaplayer-poster", true);
        $attachment['width'] = get_post_meta($attachment_id, "_kgflashmediaplayer-width", true);
        $attachment['height'] = get_post_meta($attachment_id, "_kgflashmediaplayer-height", true);
        $attachment['downloadlink'] = get_post_meta($attachment_id, "_kgflashmediaplayer-download", true);
        $attachment['showtitle'] = get_post_meta($attachment_id, "_kgflashmediaplayer-showtitle", true);
        if ($attachment['showtitle'] =="checked") { $output .= '<strong>'.$attachment["title"].'</strong><br />'; }
        $output .= '[FMP';
        if ($attachment['poster'] !="") { $output .= ' poster="'.$attachment["poster"].'"'; }
        if ($attachment['width'] !="") { $output .= ' width="'.$attachment["width"].'"'; }
        if ($attachment['height'] !="") { $output .= ' height="'.$attachment["height"].'"'; }
        $output .= ']'.$attachment["url"].'[/FMP]<br />';
        if ($attachment['downloadlink'] == "checked") { $output .= '<a href="'.$attachment["url"].'">Right-click or ctrl-click this link to download.</a><br />'; }
    } //if embed code is enabled 
    return $output;  
  }  
}  
//instantiate the class  
$kgIM = new kgInsertMedia();  


//add_filter('video_send_to_editor_url', 'kg_filter_video_url', 20, 3);

//function kg_filter_video_url($html, $href, $title) { //when inserting via URL only
//    $html = '[FMP]'.$href.'"[/FMP]';
//    return $html;
//}

function kg_embedurl_menu($tabs) {
$newtab = array('embedurl' => __('Embed from URL', 'kgoutsidevideo'));
return array_merge($tabs, $newtab);
}
add_filter('media_upload_tabs', 'kg_embedurl_menu');

function media_embedurl_process() {

if ( get_option('wp_FMP_ffmpeg_exists') == false ) { kg_check_ffmpeg_exists(); } //make sure the new ffmpeg_exists option exists

if ( get_option('wp_FMP_ffmpeg_exists') == "notinstalled" ) { $ffmpeg_disabled_text = 'disabled="disabled" title="FFMPEG not found at '.get_option('wp_FMP_ffmpeg').'"'; }
else { $ffmpeg_disabled_text = ""; }

if ( get_option('wp_FMP_encodemobile') == "true" ) { $mobilechecked = "checked";  }
else { $mobilechecked = ""; }
if ( get_option('wp_FMP_encodeogg') == "true" ) { $oggchecked = "checked";  }
else { $oggchecked = ""; }
if ( get_option('wp_FMP_encodewebm') == "true" ) { $webmchecked = "checked";  }
else { $webmchecked = ""; }

media_upload_header();
?>
<form class="media-upload-form type-form validate" id="video-form" enctype="multipart/form-data" method="post" action="">

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
				<th valign="top" scope="row" class="label"><label for="attachments[singleurl][kgflashmediaplayer-url]">Video URL</label></th>
				<td class="field"><input type="text" id="attachments[singleurl][kgflashmediaplayer-url]" name="attachments[singleurl][kgflashmediaplayer-url]" value="" size="50" onchange="document.getElementById('attachments_singleurl_encodeplaceholder').innerHTML = '';"/>
				<p class="help"><small>Specify the URL of the video file.</small></p></td>
			</tr>
			<tr>
				<th valign="top" scope="row" class="label"><span class="alignleft"><label for="numberofthumbs">Thumbnails</label></span></th>
				<td class="field"><div id="attachments_singleurl_thumbnailplaceholder"></div>
<input id="attachments_singleurl_numberofthumbs" type="text" value="4" maxlength="2" size="4" style="width:25px;" title="Number of Thumbnails" onchange="document.getElementById('attachments[singleurl][thumbtime]').value='';" <?php echo $ffmpeg_disabled_text; ?> />
<input type="button" id="attachments[singleurl][thumbgenerate]" class="button-secondary" value="Generate" name="thumbgenerate" onclick="kg_generate_thumb('singleurl', 'generate');" <?php echo $ffmpeg_disabled_text; ?> />
<input type="button" id="thumbrandomize" class="button-secondary" value="Randomize" name="thumbrandomize" onclick="kg_generate_thumb('singleurl', 'random');" <?php echo $ffmpeg_disabled_text; ?> /> 
<input type="checkbox" id="attachments_singleurl_firstframe" onchange="document.getElementById('attachments[singleurl][thumbtime]').value ='';" <?php echo $ffmpeg_disabled_text; ?> /><label for="attachments_singleurl_firstframe">Force 1st Frame Thumbnail</label></td>
			</tr>
			<tr>
				<th valign="top" scope="row" class="label"><span class="alignleft"><label for="attachments[singleurl][thumbtime]">Thumbnail Timecode</span></label><br class="clear" /></th>
				<td class="field"><input type="text" name="attachments[singleurl][thumbtime]" id="attachments[singleurl][thumbtime]" value="" size="50" />
				<p class="help"><small>Optional: generates a single thumbnail at the specified time (hh:mm:ss, mm:ss, or s).</small></p></td>
			</tr>
			<tr>
				<th valign="top" scope="row" class="label"><span class="alignleft"><label for="attachments[singleurl][kgflashmediaplayer-poster]">Thumbnail URL</label></span></th>
				<td class="field"><input type="text" name="attachments[singleurl][kgflashmediaplayer-poster]" id="attachments[singleurl][kgflashmediaplayer-poster]" value="" size="50" />
				<p class="help"><small>Leave blank to use <a href="options-general.php?page=video-embed-thumbnail-generator.php" target="_blank">default thumbnail</a>.</small></p></td>
			</tr>
			<tr>
				<th valign="top" scope="row" class="label"><span class="alignleft"><label for="attachments[singleurl][kgflashmediaplayer-width]">Dimensions</label></span></th>
				<td class="field">Width: <input name="attachments_singleurl_kgflashmediaplayer-width" type="text" value="" id="attachments_singleurl_kgflashmediaplayer-width" type="text" style="width:50px;" onchange="kg_set_dimension('singleurl', 'height', this.value);" onkeyup="kg_set_dimension('singleurl', 'height', this.value);"> Height: <input id="attachments_singleurl_kgflashmediaplayer-height" type="text" value="" style="width:50px;" onchange="kg_set_dimension('singleurl', 'width', this.value);" onkeyup="kg_set_dimension('singleurl', 'width', this.value);"> <input type="checkbox" id="attachments_singleurl_kgflashmediaplayer-lockaspect" onclick="kg_set_aspect('singleurl', this.checked);" checked> <label for="attachments_singleurl_kgflashmediaplayer-lockaspect"><small>Lock to Aspect Ratio</small></label>
				<p class="help"><small>Leave blank to use <a href="options-general.php?page=video-embed-thumbnail-generator.php" target="_blank">default dimensions</a>.</small></p></td>
			</tr>
			<tr>
				<th valign="top" scope="row" class="label"><span class="alignleft"><label for="html5">HTML5 & Mobile</span></label></th>
				<td><input type="button" id="html5" class="button-secondary" value="Encode" name="html5" onclick="kg_generate_thumb('singleurl', 'encode');" <?php echo $ffmpeg_disabled_text; ?> />

	<input type="checkbox" id="attachments[singleurl][kgflashmediaplayer-encodemobilecheck]" name="attachments[singleurl][kgflashmediaplayer-encodemobilecheck]" value="checked" onclick="if(this.checked) { document.getElementById('attachments[singleurl][kgflashmediaplayer-encodemobile]').value = 'true'; } else { document.getElementById('attachments[singleurl][kgflashmediaplayer-encodemobile]').value = 'false'; }" <?php echo ($mobilechecked." ".$ffmpeg_disabled_text); ?> />
	<label for="attachments[singleurl][kgflashmediaplayer-encodemobilecheck]">Mobile/H.264</label> 

	<input type="checkbox" id="attachments[singleurl][kgflashmediaplayer-encodewebmcheck]" name="attachments[singleurl][kgflashmediaplayer-encodewebmcheck]" value="checked" onclick="if(this.checked) { document.getElementById('attachments[singleurl][kgflashmediaplayer-encodewebm]').value = 'true'; } else { document.getElementById('attachments[singleurl][kgflashmediaplayer-encodewebm]').value = 'false'; }" <?php echo ($webmchecked." ".$ffmpeg_disabled_text); ?> />
	<label for="attachments[singleurl][kgflashmediaplayer-encodewebmcheck]">WEBM</label> 

	<input type="checkbox" id="attachments[singleurl][kgflashmediaplayer-encodeoggcheck]" name="attachments[singleurl][kgflashmediaplayer-encodeoggcheck]" value="checked" onclick="if(this.checked) { document.getElementById('attachments[singleurl][kgflashmediaplayer-encodeogg]').value = 'true'; } else { document.getElementById('attachments[singleurl][kgflashmediaplayer-encodeogg]').value = 'false'; }" <?php echo ($oggchecked." ".$ffmpeg_disabled_text); ?> />
	<label for="attachments[singleurl][kgflashmediaplayer-encodeoggcheck]">OGV</label>

	<div style="display:inline;" id="attachments_singleurl_altembedselect"></div>
	<div style="display:block;" id="attachments_singleurl_encodeplaceholder"></div>
	<div style="display:block;" id="attachments_singleurl_encodeprogressplaceholder"></div>

	<small><em>(Experimental) Generates video files compatible with most mobile & HTML5-compatible browsers.</em></small></td>
			</tr>
			<tr>
				<th valign="top" scope="row" class="label"><span class="alignleft"><label>Options</span></label></th>
				<td><input type="checkbox" name="downloadlink" id="downloadlink" value="true" class="field" /><label for="downloadlink">Generate Download Link Below Video <small>(Makes it easier for users to download video file)</small></label></td>				
			</tr>
			<tr class="submit">
				<td></td>
				<td>
					<input type="button" onclick="kg_insert_shortcode();" name="insertonlybutton" id="insertonlybutton" class="button" value="Insert into Post"  />
				</td>
			</tr>
</tbody></table>
</div>
</div>

<?php 
$uploads = wp_upload_dir(); 
$maxheight = get_option('wp_FMP_height');
$maxwidth = get_option('wp_FMP_width');
?>

<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-security]' id='attachments[singleurl][kgflashmediaplayer-security]' value='<?php echo wp_create_nonce('video-embed-thumbnail-generator-nonce'); ?>' />
<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-encodemobile]' id='attachments[singleurl][kgflashmediaplayer-encodemobile]' value='<?php echo get_option('wp_FMP_encodemobile'); ?>' />
<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-encodeogg]' id='attachments[singleurl][kgflashmediaplayer-encodeogg]' value='<?php echo get_option('wp_FMP_encodeogg'); ?>' />
<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-encodewebm]' id='attachments[singleurl][kgflashmediaplayer-encodewebm]' value='<?php echo get_option('wp_FMP_encodewebm'); ?>' />
<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-maxheight]' id='attachments[singleurl][kgflashmediaplayer-maxheight]' value='<?php echo($maxheight); ?>' />
<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-maxwidth]' id='attachments[singleurl][kgflashmediaplayer-maxwidth]' value='<?php echo($maxwidth); ?>' />
<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-aspect]' id='attachments[singleurl][kgflashmediaplayer-aspect]' value='<?php  echo($maxheight/$maxwidth); ?>' />
</form>

<?php
} //end media_embedurl_process

function kg_embedurl_handle() {
    return wp_iframe( 'media_embedurl_process');
}
add_action('media_upload_embedurl', 'kg_embedurl_handle');

function kg_cleanup_generated_logfiles_handler($logfile) {
	$lastmodified = "";
	if ( file_exists($logfile) ) { $lastmodified = filemtime($logfile); }
		if ( $lastmodified != false ) {
			if ( time() - $lastmodified > 120 ) { unlink($logfile); }
			else {
				$timestamp = wp_next_scheduled( 'kg_cleanup_generated_logfiles' );
				wp_unschedule_event($timestamp, 'kg_cleanup_generated_logfiles' );
				$args = array('logfile'=>$logfile);
				wp_schedule_single_event(time()+600, 'kg_cleanup_generated_logfiles', $args);
			}
		}
}
add_action('kg_cleanup_generated_logfiles','kg_cleanup_generated_logfiles_handler');

function kg_cleanup_generated_thumbnails_handler() {
	$uploads = wp_upload_dir();
	rrmdir($uploads['path'].'/thumb_tmp'); //remove the whole tmp file directory
}
add_action('kg_cleanup_generated_thumbnails','kg_cleanup_generated_thumbnails_handler');

function kg_schedule_cleanup_generated_files() { //schedules deleting all tmp thumbnails or logfiles if no files are generated in an hour	

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );

	if (isset($_POST['thumbs'])) { 
		$timestamp = wp_next_scheduled( 'kg_cleanup_generated_thumbnails' );
		wp_unschedule_event($timestamp, 'kg_cleanup_generated_thumbnails' );
		wp_schedule_single_event(time()+3600, 'kg_cleanup_generated_thumbnails');
	}

	if (isset($_POST['logfile'])) { 
		$timestamp = wp_next_scheduled( 'kg_cleanup_generated_logfiles' );
		wp_unschedule_event($timestamp, 'kg_cleanup_generated_logfiles' );
		$args = array('logfile'=>$_POST['logfile']);
		wp_schedule_single_event(time()+600, 'kg_cleanup_generated_logfiles', $args);
	}
	die(); // this is required to return a proper result
}
add_action('wp_ajax_kg_schedule_cleanup_generated_files', 'kg_schedule_cleanup_generated_files');

function kg_callffmpeg() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	global $wpdb;
	include_once dirname( __FILE__ ) .'/kg_callffmpeg.php'; 
	die(); // this is required to return a proper result
}

add_action('wp_ajax_kg_callffmpeg', 'kg_callffmpeg');

function kg_check_encode_progress() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	global $wpdb;
	$pid = $_POST['pid'];
	$logfile = $_POST['logfile'];
	$movie_duration = $_POST['movie_duration'];
	$embed_display = "";
	$percent_done = "";
	$other_message = "";
	$logfilecontents = "";
	$lastline = "";

	if ( is_file($logfile) ) {

		$logfilecontents = file_get_contents($logfile);
		$fp = fopen($logfile, 'w');
		fclose($fp);
		$lastlines = kg_explodeX(array("\r","\n"), $logfilecontents);
		$lastlines_output = print_r($lastlines, true);
		$lastline = end($lastlines);
		if ( $lastline == "" ) { $lastline = prev($lastlines); }
	
		$last_match = "";
		$time_matches = "";
		$video_matches = "";
		$libx264_matches = "";
		$fps_matches = "";
		$fps_match = "";
		$basename = "";
	
		preg_match('/time=(.*?) /', $lastline, $time_matches);
	
		if ( array_key_exists(1, $time_matches) != true ) {
			preg_match('/video:(.*?) /', $lastline, $video_matches);
			preg_match('/libx264 (.*?) /', $lastline, $libx264_matches);
		}
	
		if ( array_key_exists(1, $time_matches) == true ) {
			$current_hours = intval(substr($time_matches[1], -11, 2));
			$current_minutes = intval(substr($time_matches[1], -8, 2));
			$current_seconds = intval(substr($time_matches[1], -5, 2));
			$current_seconds = ($current_hours * 60 * 60) + ($current_minutes * 60) + $current_seconds; 
			$percent_done = round(intval($current_seconds)/intval($movie_duration)*100);
	
			preg_match('/fps=\s+(.*?) /', $lastline, $fps_matches);
			if ( array_key_exists(1, $fps_matches) == true ) { $fps_match = $fps_matches[1]; }
			else {  $fps_match = "10"; }
		}
		elseif ( array_key_exists(1, $video_matches) == true || array_key_exists(1, $libx264_matches) == true ) {
			$percent_done = 100;
		}
		else { 
			$other_message = $lastline;
			$basename = substr($logfile, 0, -16);
			if ( is_file($basename."-ipod.m4v") ) { 
				if ( (time() - filemtime($basename."-ipod.m4v")) < 30 ) { unlink($basename."-ipod.m4v"); }
			}
			if ( is_file($basename.".ogv") ) { 
				if ( (time() - filemtime($basename.".ogv")) < 30 ) { unlink($basename.".ogv"); }
			}
			if ( is_file($basename.".webm") ) { 
				if ( (time() - filemtime($basename.".webm")) < 30 ) { //unlink($basename.".webm"); 
}
			}
		}
	
		if ( $percent_done == "100" || $other_message != "" ) { if ( file_exists($logfile) ) { unlink($logfile); } }
	
		$embed_display .= $lastline;
		$arr = array ( "embed_display"=>$embed_display, "percent_done"=>$percent_done, "other_message"=>$other_message, "fps"=>$fps_match );
	}
	else { $arr = array ( "other_message"=>"Encoding Failed" ); }

	echo json_encode($arr);

	die(); // this is required to return a proper result
}
add_action('wp_ajax_kg_check_encode_progress', 'kg_check_encode_progress');

function kg_cancel_encode() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );

	if (isset($_POST['kg_pid'])) { 
		$kg_pid = $_POST['kg_pid'];
		if ( intval($kg_pid) > 0 ) {
			//$command = escapeshellcmd('kill '.$kg_pid);
			//exec($command);
			posix_kill($kg_pid, 15);
		}
	}

	die(); // this is required to return a proper result
}
add_action('wp_ajax_kg_cancel_encode', 'kg_cancel_encode');

function enqueue_kg_script() { //loads plugin-related javascripts
    wp_enqueue_script( 'video_embed_thumbnail_generator_script', plugins_url('/kg_video_plugin.js', __FILE__) );
}
add_action('admin_enqueue_scripts', 'enqueue_kg_script');

function enqueue_kg_style() { //loads plugin-related CSS
	$myStyleUrl = plugins_url('video-embed-thumbnail-generator.css', __FILE__);
	wp_enqueue_style('kg_progressbar_style', $myStyleUrl);
}
add_action('admin_print_styles', 'enqueue_kg_style');

add_action('wp_head', 'addSWFObject');
add_action('admin_menu', 'addFMPOptionsPage');

?>