<?php
/*
Plugin Name: Video Embed & Thumbnail Generator
Plugin URI: http://www.kylegilman.net/2011/01/18/video-embed-thumbnail-generator-wordpress-plugin/
Description: Generates thumbnails, HTML5-compliant videos, and embed codes for locally hosted videos. Requires FFMPEG for thumbnails and encodes. <a href="options-general.php?page=video-embed-thumbnail-generator.php">Settings</a> | <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=kylegilman@gmail.com&item_name=Video%20Embed%20And%20Thumbnail%20Generator%20Plugin%20Donation/">Donate</a>
Version: 3.0	
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
2) Includes code adapted from Joshua Eldridge's Flash Media Player Plugin
   Website: http://wordpress.org/extend/plugins/flash-video-player/
3) Includes code adapted from Gary Cao's Make Shortcodes User-Friendly tutorial
   Website: http://www.wphardcore.com/2010/how-to-make-shortcodes-user-friendly/
4) Includes code adapted from Justin Gable's "Modifying Wordpress' Default Method for Inserting Media"
   Website: http://justingable.com/2008/10/03/modifying-wordpress-default-method-for-inserting-media/
5) Includes Video-JS Player
	Website: http://www.videojs.com/
	License: http://www.gnu.org/licenses/lgpl.html
*/

if ( ! defined( 'ABSPATH' ) )
	die( "Can't load this file directly" );
	
function kg_default_options_fn() {
	$options = array("version"=>3.0,
		"embed_method"=>"Video.js",
		"template"=>false,
		"encode_1080"=>"true",
		"encode_720"=>"true",
		"encode_mobile"=>"true",
		"encode_webm"=>false,
		"encode_ogg"=>false,
		"app_path"=>"/usr/local/bin",
		"video_app" => "ffmpeg",
		"ffmpeg_exists"=>"notchecked",
		"ffmpeg_vpre"=>false,
		"moov"=>"none",
		"generate_thumbs"=>4,
		"titlecode"=>"<strong>",
		"poster"=>"",
		"width"=>"640",
		"height"=>"360",
		"gallery_width"=>"960",
		"gallery_height"=>"540",
		"gallery_thumb"=>"250",
		"controlbar_style"=>"docked",
		"autoplay"=>false,
		"loop"=>false,
		"endOfVideoOverlay"=>"",
		"endOfVideoOverlaySame"=>"",
		"bgcolor"=>"",
		"configuration"=>"",
		"skin"=>plugins_url("", __FILE__)."/flash/skin/kg_skin.xml",
		"js_skin"=>"kg-video-js-skin",
		"stream_type"=>"liveOrRecorded",
		"scale_mode"=>"letterbox",
		"autohide"=>"true",
		"playbutton"=>"true");
	return $options;
}

function kg_register_default_options_fn() { //add default values for options
	$options = get_option('kg_video_embed_options');
    if( !is_array($options) ) {
		$input = kg_default_options_fn();
		update_option('kg_video_embed_options', $options);
	}
	if ( !isset($options['ffmpeg_exists']) || $options['ffmpeg_exists'] == "notchecked" ) { kg_check_ffmpeg_exists($options, true); }
}
register_activation_hook(__FILE__, 'kg_register_default_options_fn');

function kg_video_formats() {

	$video_formats = array(
		"1080" => array("name" => "1080p H.264", "width" => 1920, "height" => 1080, "type" => "h264", "suffix" => "-1080.m4v"),
		"720" => array("name" => "720p H.264", "width" => 1280, "height" => 720, "type" => "h264", "suffix" => "-720.m4v"),
		"mobile" => array("name" => "480p H.264", "width" => 640, "height" => 480, "type" => "h264", "suffix" => "-ipod.m4v"),
		"webm" => array("name" => "WEBM", "width" => 0, "height" => 0, "type" => "webm", "suffix" => ".webm"),
		"ogg" => array("name" => "OGV", "width" => 0, "height" => 0, "type" => "ogv", "suffix" => ".ogv")
	);
	return $video_formats;
	
}

function kg_add_upload_mimes ( $existing_mimes=array() ) {
 
	// allows uploading .webm videos
	$existing_mimes['webm'] = 'video/webm';
	return $existing_mimes;
 
}
add_filter('upload_mimes', 'kg_add_upload_mimes');

function kg_cron_add_minute( $schedules ) {
	// Adds every minute to the existing schedules.
	$schedules['minute'] = array(
		'interval' => 60,
		'display' => __( 'Every Minute' )
	);
	return $schedules;
}
add_filter( 'cron_schedules', 'kg_cron_add_minute' );

function kg_url_exists($url) {
    $hdrs = @get_headers($url);
    return is_array($hdrs) ? preg_match('/^HTTP\\/\\d+\\.\\d+\\s+2\\d\\d\\s+.*$/',$hdrs[0]) : false;
}

function kg_is_empty_dir($dir)
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

function kg_rrmdir($dir) {
   if (is_dir($dir)) {
     $objects = scandir($dir);
     foreach ($objects as $object) {
       if ($object != "." && $object != "..") {
         if (filetype($dir."/".$object) == "dir") kg_rrmdir($dir."/".$object); else unlink($dir."/".$object);
       }
     }
     reset($objects);
     rmdir($dir);
   }
}

function kg_check_ffmpeg_exists($options, $save) {
	$exec_enabled = false;
	$ffmpeg_exists = false;
	$output = array();
	$uploads = wp_upload_dir();

	if(function_exists('exec')) { 
		$exec_enabled = true;
		//$plugin_url = plugins_url("", __FILE__);
		//$plugin_url = str_replace("https://", "http://",  $plugin_url);
		exec ( $options['app_path'].'/'.$options['video_app'].' -i '.plugin_dir_path(__FILE__).'/flash/skin/images/PlayNormal.png '.$uploads['path'].'/ffmpeg_exists_test.jpg', $output, $returnvalue );
	} 

	if ( $exec_enabled == true && file_exists($uploads['path'].'/ffmpeg_exists_test.jpg') ) { //if FFMPEG has executed successfully
		$ffmpeg_exists = true;
		unlink($uploads['path'].'/ffmpeg_exists_test.jpg');
	}

	if ( $save == true ) {
		if ( $ffmpeg_exists == true ) { $options['ffmpeg_exists'] = "true"; }
		else { $options['ffmpeg_exists'] = "notinstalled"; }
		update_option('kg_video_embed_options', $options);
	}

	$output_output = implode("/n", $output);
	$arr = array ("exec_enabled"=>$exec_enabled, "ffmpeg_exists"=>$ffmpeg_exists, "return_value"=>$returnvalue, "output"=>$output_output);
	return $arr;
}

function kg_encodevideo_info($movieurl, $postID) {

	$options = get_option('kg_video_embed_options');
	$ffmpegPath = $options['app_path']."/".$options['video_app'];

	$uploads = wp_upload_dir();
	$movie_extension = pathinfo(parse_url($movieurl, PHP_URL_PATH), PATHINFO_EXTENSION);
	$movieurl_noextension = preg_replace("/\\.[^.\\s]{3,4}$/", "", $movieurl);
	$encodevideo_info['moviefilebasename'] = basename($movieurl,'.'.$movie_extension);
	$moviefilepath = str_replace(" ", "%20", $movieurl);
	$video_formats = kg_video_formats();

	if ($postID != "singleurl") { //if it's an attachment, not from URL
		$moviefile = get_attached_file($postID);
		$path_parts = pathinfo($moviefile);
		$encodevideo_info['encodepath'] = $path_parts['dirname']."/";
		$encodevideo_info['sameserver'] = true;
	}
	else { 
		$url_parts = parse_url($uploads['url']);
		if ( strpos($moviefilepath, $url_parts['host']) != false ) { //if we're on the same server
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

	if ( !is_writable($encodevideo_info['encodepath']) ) { //if the original directory is not writable use a directory in base wp_upload
		$encodevideo_info['encodepath'] = $uploads['basedir']."/html5encodes/";
		$encodevideo_info['html5encodes'] = true;
		foreach ( $video_formats as $format => $format_stats ) {
			$encodevideo_info[$format.'url'] = $uploads['baseurl']."/html5encodes/".$encodevideo_info['moviefilebasename'].$format_stats['suffix'];
		}
	}

	foreach ( $video_formats as $format => $format_stats ) { //loop through each format
		$encodevideo_info[$format.'url'] = $movieurl_noextension.$format_stats['suffix'];
		$encodevideo_info[$format.'filepath'] = $encodevideo_info['encodepath'].$encodevideo_info['moviefilebasename'].$format_stats['suffix'];
		$encodevideo_info[$format.'filepath_html5encodes'] = $uploads['basedir']."/html5encodes/".$encodevideo_info['moviefilebasename'].$format_stats['suffix'];

		if ( file_exists($encodevideo_info[$format.'filepath']) ) { $encodevideo_info[$format.'_exists'] = true; }
		else { 
			if ( file_exists($encodevideo_info[$format.'filepath_html5encodes']) ) { 
				$encodevideo_info[$format.'filepath'] = $encodevideo_info[$format.'filepath_html5encodes'];
				$encodevideo_info[$format.'_exists'] = true;
			}
			else { $encodevideo_info[$format.'_exists'] = false; }
		}

		if ( !$encodevideo_info['sameserver'] ) { //last resort if it's not on the same server, check url_exists
			if ( !file_exists($encodevideo_info[$format.'filepath']) ) { 
				if ( kg_url_exists($movieurl_noextension.$format_stats['suffix']) ) { 
					$encodevideo_info[$format.'_exists'] = true;
					$encodevideo_info[$format.'url'] = $movieurl_noextension.$format_stats['suffix']; ;
				}
				else { $encodevideo_info[$format.'_exists'] = false; }
			}
		}
	}

	return $encodevideo_info;
}

/**
* Get the dimensions of a video file
*
* @param unknown_type $video
* @return array(width,height)
* @author Jamie Scott
*/
function kg_get_video_dimensions($video = false) {
	$options = get_option('kg_video_embed_options');
	$ffmpegPath = $options['app_path']."/".$options['video_app'];
	
	$video = str_replace("https://", "http://",  $video);

	$command = $ffmpegPath . ' -i "' . $video . '" -codecs 2>&1';

	exec ( $command, $output );
	$lastline = end($output);
	$lastline = prev($output)."<br />".$lastline;  
	$output = implode("\n", $output);

	$result = ereg ( '[0-9]?[0-9][0-9][0-9]x[0-9][0-9][0-9][0-9]?', $output, $regs );

	if (isset ( $regs [0] )) {
		$vals = (explode ( 'x', $regs [0] ));
		$width = $vals [0] ? $vals [0] : null;
		$height = $vals [1] ? $vals [1] : null;
		preg_match('/Duration: (.*?),/', $output, $matches);
		$duration = $matches[1];
		preg_match('/rotate          : (.*?)\n/', $output, $matches);
		if ( array_key_exists(1, $matches) == true ) { $rotate = $matches[1]; }
		else $rotate = "0";
		$configuration = array();
		$lib_list = array('libfaac', 'libvo_aacenc', 'libtheora', 'libvorbis', 'libvpx', 'libx264');
		foreach ($lib_list as $lib) {
			if ( strpos($output, $lib) !== false ) { $configuration[$lib] = "true"; }
			else { $configuration[$lib] = "false"; }
		}

		return array ('width' => $width, 'height' => $height, 'duration' => $duration, 'configuration' => $configuration, 'rotate' => $rotate, 'worked'=>true );
	} else {
		return array ('output'=>$lastline, 'worked'=>false);
	}

}

class kg_Process{
    private $pid;
    private $command;

    public function __construct($cl=false){
        if ($cl != false){
            $this->command = $cl;
            $this->runCom();
        }
    }
    private function runCom(){

           //$command = 'nohup '.$this->command.' > /dev/null 2>&1 & echo $!'; //this is the original command

           $sys = strtoupper(PHP_OS); // Get OS Name
           if(substr($sys,0,3) == "WIN") { 
 	        $command = $this->command; 
		$this->OS = "windows";
           } //exec this way if it's Windows

           else { 
		$command = 'nohup nice '.$this->command;
		$this->OS = "linux";
	   }

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

function kg_video_embed_enqueue_scripts() {
	$options = get_option('kg_video_embed_options');
	if ( $options['embed_method'] == "Strobe Media Playback" ) {
		wp_enqueue_script( 'swfobject' );
	}
	
	if ( $options['embed_method'] == "Video.js" ) {
		wp_enqueue_script( 'video-js', plugins_url("", __FILE__).'/video-js/video.js' );
		wp_enqueue_style( 'video-js-css', plugins_url("", __FILE__).'/video-js/video-js.css' );
		wp_enqueue_style( 'video-js-kg-skin', plugins_url("", __FILE__).'/video-js/kg-video-js-skin.css' );
	}

	wp_enqueue_script( 'jquery-ui-dialog' );
	wp_enqueue_script( 'kg_video_embed', plugins_url("", __FILE__).'/js/kg_video_embed.js' );
	wp_localize_script( 'kg_video_embed', 'ajax_object', array( 'ajaxurl' => admin_url( 'admin-ajax.php' ) ) ); // setting ajaxurl
	
	//echo '<link rel="stylesheet" type="text/css" href="'.plugins_url("", __FILE__).'/shadowbox/shadowbox.css" />'."\n";
	//echo '<script type="text/javascript" src="'.plugins_url("", __FILE__).'/shadowbox/shadowbox.js"></script>'."\n";
	//echo '<script type="text/javascript">Shadowbox.init();</script>'."\n";
}
add_action('wp_enqueue_scripts', 'kg_video_embed_enqueue_scripts');

function kg_video_embed_print_scripts() {

	$options = get_option('kg_video_embed_options');

	if ( $options['embed_method'] == "Video.js" ) { echo '<script type="text/javascript">_V_.options.flash.swf = "'.plugins_url("", __FILE__).'/video-js/video-js.swf"</script>'."\n"; }

}
add_action('wp_head', 'kg_video_embed_print_scripts');


function KGVID_shortcode($atts, $content = ''){

	$options = get_option('kg_video_embed_options');
	
	// workaround for relative video URL (contributed by Lee Fernandes)
	if(substr($content, 0, 1) == '/') $content = get_bloginfo('url').$content;

	$query_atts = shortcode_atts(
					array('width' => $options['width'], 
						  'height' => $options['height'],
						  'controlbar' => $options['controlbar_style'],
						  'autohide' => $options['autohide'],
						  'poster' => $options['poster'],
						  'endOfVideoOverlay' => $options['endOfVideoOverlay'],
						  'endOfVideoOverlaySame' => $options['endOfVideoOverlaySame'],
						  'playbutton' => $options['playbutton'],
						  'loop' => $options['loop'],
						  'autoplay' => $options['autoplay'],
						  'streamtype' => $options['stream_type'],
						  'scalemode' => $options['scale_mode'],
						  'backgroundcolor' => $options['bgcolor'],
						  'configuration' => $options['configuration'],
						  'skin' => $options['skin'],
						  'gallery' => 'false',
						  'gallery_thumb' => $options['gallery_thumb']), $atts);

	if ( $query_atts["gallery"] != "true" ) {

		global $wpdb;
		$query = "SELECT ID FROM {$wpdb->posts} WHERE guid='{$content}'";
		$id = $wpdb->get_var($query);
		$moviefiletype = pathinfo(trim($content), PATHINFO_EXTENSION);
		$flashcompatible = array("flv", "f4v", "mp4", "mov", "m4v");
		$h264compatible = array("mp4", "mov", "m4v");
		$div_suffix = substr(uniqid(rand(), true),0,4);
			
		if ($id != "") {
			$div_suffix = $id;
			$encodevideo_info = kg_encodevideo_info(trim($content), $id); 
		}
		else { $encodevideo_info = kg_encodevideo_info(trim($content), 'singleurl'); }
		
		if ( $options['embed_method'] == "Strobe Media Playback" ) {
		
			$video_swf = plugins_url('', __FILE__)."/flash/StrobeMediaPlayback.swf";
			$minimum_flash = "10.1.0";
			
			if ( in_array($moviefiletype, $flashcompatible) ) { $flashvars = "{src:'".urlencode(trim($content))."'"; }
			else { $flashvars = "{src:'".urlencode(trim($encodevideo_info['mobileurl']))."'"; }
		
			if($query_atts["poster"] != '') {
				$flashvars .= ", poster:'".urlencode(trim($query_atts["poster"]))."'";
			}
			if($query_atts["endOfVideoOverlaySame"] == "true") { $query_atts["endOfVideoOverlay"] = $query_atts["poster"]; }
			if($query_atts["endOfVideoOverlay"] != '') {
				$flashvars .= ", endOfVideoOverlay:'".urlencode(trim($query_atts["endOfVideoOverlay"]))."'";
			}
			if($query_atts["controlbar"] != '') {
				$flashvars .= ", controlBarMode:'".$query_atts["controlbar"]."'";
			}
			if($query_atts["autohide"] != '') {
				$flashvars .= ", controlBarAutoHide:'".$query_atts["autohide"]."'";
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
			$flashvars .= ", verbose:'true'";
			$flashvars .= "}";
			
			$params = "{wmode:'opaque', allowfullscreen:'true', allowscriptaccess:'always', base:'".plugins_url("", __FILE__)."/flash/'}";
		} //if Strobe Media Playback
		
		//include_once dirname( __FILE__ ) .'/mdetect.php';
		//$uagent_obj = new uagent_info();
		//$isAndroid = $uagent_obj->DetectAndroid(); //determine if we're running on an Android device
		
		if ( in_array($moviefiletype, $h264compatible) ) { 
			$encodevideo_info["original_exists"] = true;
			$encodevideo_info["originalurl"] = trim($content);
		}
		else { $encodevideo_info["original_exists"] = false; }
		
		$video_formats = array(
			"original" => "mp4",
			"1080" => "mp4",
			"720" => "mp4",
			"mobile" => "mp4",
			"webm" => "webm",
			"ogg" => "ogg"
		);
		
		$sources = "";
		foreach ($video_formats as $name => $type) {
			if ( $encodevideo_info[$name."_exists"] ) { $sources .= "<source id='video_".$div_suffix."_src_".$name."' src='".$encodevideo_info[$name."url"]."' type='video/".$type."'>\n"; 
				if ( $type == "mp4" ) { $mp4_srcs["src_".$name] = $encodevideo_info[$name."url"]; }
			}
		}
		
		if ( $mp4_srcs ) { 
			$mp4_srcs["id"] = $div_suffix;
			$JSON_mp4_srcs = json_encode($mp4_srcs); 
		}

		$code = "<div id=\"video_".$div_suffix."_div\">";
		$code .= "<video id=\"video_".$div_suffix."\" ";
		if ($query_atts["loop"] == 'true') { $code .= "loop " ;}
		if ($query_atts["autoplay"] == 'true') { $code .= "autoplay " ;}
		if ($query_atts["controlbar"] != 'none') { $code .= "controls " ;}
		//if ($isAndroid) { $code .= "onclick='this.play();' "; }
		$code .= "preload='metadata' ";
		if($query_atts["poster"] != '' ) { $code .= "poster='".$query_atts["poster"]."' "; }
		$code .= "width='".$query_atts["width"]."' height='".$query_atts["height"]."'";
		if ( $options['embed_method'] == "Video.js" ) {
			if ( $options['js_skin'] == "" ) { $options['js_skin'] = "vjs-default-skin"; }
			if ( array_key_exists('skin', $atts) ) { $options['js_skin'] = $atts['skin']; } //allows user to set skin for individual videos using the same skin="" attribute
			$code .= " class='video-js ".$options['js_skin']."' data-setup='{}'"; 
		}
		$code .= ">\n";
		
		$code .= $sources; //add the <source> tags created earlier

		if ( !in_array($moviefiletype, $flashcompatible) && $encodevideo_info["mobile_exists"] && $options['embed_method'] == "Strobe Media Playback" ) { // Flash fallback if WEBM/OGV embed
			$flashvars_remove = array("{", "}", "'");
			$flashvars_reformat = str_replace($flashvars_remove, "", $flashvars);
			$flashvars_reformat = str_replace(":", "=", $flashvars_reformat);
			$flashvars_reformat = str_replace(", ", "&", $flashvars_reformat);
			$code .= '<object width="'.trim($query_atts["width"]).'" height="'.trim($query_atts["height"]).'" type="application/x-shockwave-flash" data="'.$video_swf.'">'."\n";
			$code .= '<param name="movie" value="'.$video_swf.'" /></param>'."\n";
			$code .= '<param name="flashvars" value="'.$flashvars_reformat.'" /></param>'."\n";
			$code .= '<param name="base" value="'.plugins_url('', __FILE__).'/flash/" /></param>'."\n";
			$code .= '<param name="allowFullScreen" value="true" /></param>'."\n";
			$code .= '<param name="allowscriptaccess" value="always" /></param>'."\n";
			$code .= '</object>';
		}
		$code .= "</video>\n";
		$code .= "</div>\n\n";
		//if ( $options['embed_method'] == "Video.js" ) {	$code .= "<script type='text/javascript'>_V_('video_".$div_suffix."').ready(kg_set_mp4_src($JSON_mp4_srcs));</script>\n"; }
		if ( $options['embed_method'] == "Video.js" ) {	
			if ($id != "") { 
				$plays = intval(get_post_meta($id, "_kgflashmediaplayer-starts", true));
				$ends = intval(get_post_meta($id, "_kgflashmediaplayer-completeviews", true));
			}
			else { 
				$plays = "not_countable";
				$ends = "not_countable";
			}
			$code .= "<input type='hidden' id='".$div_suffix."_played' value='not_played'><script type='text/javascript'>_V_('video_".$div_suffix."').ready(function(){
			this.addEvent('play', function(){
			kg_video_counter('".$div_suffix."', '".$plays."', '".$ends."', 'play');
			});
			});
			_V_('video_".$div_suffix."').ready(function(){
			this.addEvent('ended', function(){
			kg_video_counter('".$div_suffix."', '".$plays."', '".$ends."', 'ended');
			});
			});
			</script>\n"; 
		}
	
		/* if ($id !="") {
		   $iframeurl = site_url('/')."?attachment_id=".$id;
		   $iframecode = '<iframe src="'.$iframeurl.'" frameborder="0" scrolling="no" width="'.$query_atts['width'].'" height="'.$query_atts["height"].'"></iframe>';
		   $code .= "<div style='background-color:#e8e8e8; width:".$query_atts['width']."px; height:25px; margin-top:-25px; padding:5px; font-size:8pt;'>Embed code: <input style='height:10px; background-color:#f4f4f4;' type='text' value='".$iframecode."' width='10' onClick='this.select();'></div>\n";
		} */
			
		if ( in_array($moviefiletype, $flashcompatible) && $options['embed_method'] == "Strobe Media Playback" ) { 
			$code .= "<script type=\"text/javascript\">\n\t";
			$code .= "swfobject.embedSWF('".$video_swf."', 'video_".$div_suffix."_div', '".trim($query_atts['width'])."', '".trim($query_atts['height'])."', '".$minimum_flash."', '".plugins_url("", __FILE__)."/flash/expressInstall.swf', $flashvars, $params)\n";
			$code .= "</script>\n";
		}
		
	} //if not gallery
	
	else { //if gallery
		$code = "";
		$post_ID = get_the_ID();
		$args = array( 'post_type' => 'attachment', 'orderby' => 'menu_order', 'post_mime_type' => 'video', 'numberposts' => -1, 'post_status' => null, 'post_parent' => $post_ID );
		$attachments = get_posts($args);
		if ($attachments) {

			//echo '<style type="text/css">'."\n";
			//echo '.kg_video_gallery_thumb { position:relative; width:'.$query_atts["gallery_thumb"].'px; display: inline-block;	margin:10px; }'."\n";
			//echo '.kg_video_gallery_thumb img { padding:0px; margins:0px; width:'.$query_atts["gallery_thumb"].'px; }'."\n";
			//echo '.kg_video_gallery_thumb span { position:absolute; padding-top:10px; bottom:4px; left:0px; height:25px; width:100%; text-align:center; color:white; background-color: rgba(0,0,0,0.5); vertical-align:middle; letter-spacing:0.05em; font-size:10pt; }'."\n";
			//echo '</style>'."\n";
			foreach ( $attachments as $attachment ) {
				$thumbnail_url = get_post_meta($attachment->ID, "_kgflashmediaplayer-poster", true);
				$video_width = get_post_meta($attachment->ID, "_kgflashmediaplayer-width", true);
				$video_height = get_post_meta($attachment->ID, "_kgflashmediaplayer-height", true);
				if (!$thumbnail_url) { $thumbnail_url = $options['poster']; }
				//echo '<div class="kg_video_gallery_thumb"><a rel="shadowbox;width='.$video_width.';height='.$video_height.'" href="'.site_url('/').'?attachment_id='.$attachment->ID.'?kg_video_embed[gallery]=true"><img src="'.$thumbnail_url.'"></a><span class="videotitle">'.$attachment->post_title.'</span></div>';
				$code .= '<div class="kg_video_gallery_thumb" style="width:'.$query_atts["gallery_thumb"].'px"><a href="#" onclick="javascript:kg_SetVideo(\''.site_url('/').'?attachment_id='.$attachment->ID.'&kg_video_embed[gallery]=true\', \''.$video_width.'\', \''.$video_height.'\');return false;"><img src="'.$thumbnail_url.'"></a><span class="videotitle">'.$attachment->post_title.'</span></div>';
			}
			$code .= '<div id="kg_GalleryPlayerDiv"><iframe id="kg_GalleryVideo" src="" width="640" height="360" frameborder="0" webkitallowfullscreen="" allowfullscreen=""></iframe></div>';
			$code .=  '<script type="text/javascript">jQuery(document).ready(function() { jQuery(\'head\').append(\'<link rel="stylesheet" href="'.plugins_url("", __FILE__).'/css/kg_video_gallery.css" type="text/css" />\'); jQuery(\'#kg_GalleryPlayerDiv\').dialog({ zIndex: 10000, autoOpen: false, modal: true, resizable: false, dialogClass: \'notitle\' }); jQuery(\'#kg_GalleryPlayerDiv\').bind("dialogclose", function (event, ui) { jQuery(\'#kg_GalleryVideo\').attr(\'src\', \'\'); });});</script>';			
				
		} //if there are attachments
	} //if gallery
	return $code;
}
add_shortcode('FMP', 'KGVID_shortcode');
add_shortcode('KGVID', 'KGVID_shortcode');

function kg_generate_queue_table() {

	$html = "";

	$video_embed_queue = get_option('kg_video_embed_queue');

	if ( !empty($video_embed_queue) ) {
	
		$video_formats = kg_video_formats();
		
		foreach ( $video_embed_queue as $order => $video_entry ) {
			$html .= "\t<tr id='tr_".$order."'";
			foreach ( $video_formats as $format => $format_stats ) {
				if ( $video_entry['encode_formats'][$format]['status'] == "encoding" ) { 
					$html .= " class='currently_encoding' ";
					break;
				}
			}
			$html .= "><td id='td_".$order."'>".strval(intval($order)+1)."</td>\n";
			$thumbnail_url = get_post_meta($video_entry['attachmentID'], "_kgflashmediaplayer-poster", true);
			$thumbnail_html = "";
			if ($thumbnail_url != "" ) { 		
				$thumbnail_html = '<img width="100" src="'.$thumbnail_url.'">'; 
			}
			if ( $video_entry['attachmentID'] != "singleurl" ) { 
				$moviefilepath = get_attached_file($video_entry['attachmentID']);
				$attachmentlink = "media.php?attachment_id=".$video_entry['attachmentID']."&action=edit";
			}
			else { 
				$moviefilepath = $video_entry['movieurl']; 
				$attachmentlink = $video_entry['movieurl'];
			}
			$html .= "\t\t\t\t\t<td><a href='".$attachmentlink."'> ".$thumbnail_html."</a></td>\n"; 
			$html .= "\t\t\t\t\t<td><a id='".$moviefilepath."' href='".$attachmentlink."'>".basename($moviefilepath)."</a></td>\n";
			$html .= "\t\t\t\t\t<td class='queue_encode_formats' id='formats_".$order."'>";
			foreach ( $video_formats as $format => $format_stats ) {
				if ( $video_entry['encode_formats'][$format]['status'] != "lowres" ) {
					$html .= "<div id='".$order."_".$format."'>";
					if ( $video_entry['encode_formats'][$format]['status'] == "queued" || $video_entry['encode_formats'][$format]['status'] == "notchecked" ) {
						$html .= "<input type='checkbox' disabled"; 
						if ( $video_entry['encode_formats'][$format]['status'] == "queued" ) { $html .= " checked "; }
						$html .= "> ".$format_stats['name'];
					}
					if ( $video_entry['encode_formats'][$format]['status'] == "encoding" ) {
						$html .= "<input type='hidden' id='currently_encoding' value='".$format."'>";
						//$html .= "<strong>".$format_stats['name']." </strong>";
						$encode_progress = kg_encode_progress($order, $format);
						$html .= $encode_progress['embed_display'];
					}
					if ( $video_entry['encode_formats'][$format]['status'] == "encoded" ) {  
						$html .= "<strong>".$format_stats['name']." Encoded</strong>";
					}
					$html .= "</div>";
				}
			}
			$html .= "</td>\n";
			$html .= "\t\t\t\t\t<td><a class='submitdelete' href='javascript:void(0)' onclick='kg_encode_queue(\"delete\", ".$order.")'>Cancel</a></td></tr>\n";
		}
	}
	else { $html = "\t<tr><td colspan='5'>Queue is Empty</td></tr>\n"; }

return $html;

}

function kg_add_FFMPEG_Queue_Page() {
	$options = get_option('kg_video_embed_options');
	if ( $options['ffmpeg_exists'] == "true" ) { //only add the queue page if FFMPEG is installed
		add_submenu_page('tools.php', 'Video Embed & Thumbnail Generator Encoding Queue', 'Video Encode Queue', 'administrator', 'kg_video_encoding_queue', 'kg_FFMPEG_Queue_Page');
	}
}
add_action('admin_menu', 'kg_add_FFMPEG_Queue_page');

function kg_FFMPEG_Queue_Page() {
	
?>
	<div class="wrap">
		<script>
			jQuery(function() {
				jQuery( "#sortable tbody.rows" ).sortable({
					items: "tr:not(.currently_encoding)",
					containment: "parent",
					opacity: 0.6,
					helper: function(e, tr) {
						var $originals = tr.children();
						var $helper = tr.clone();
						$helper.children().each(function(index)
						{
						  // Set helper cell sizes to match the original sizes
						  jQuery(this).width($originals.eq(index).width())
						});
						return $helper;
					}
				});
				jQuery( "#sortable tbody.rows" ).disableSelection();
				jQuery( "#sortable tbody.rows" ).bind("sortupdate", function(event, ui) {
					  jQuery('table tr').each(function(){
					  	var $new_index = jQuery(this).index();
					  	var $new_ID = "tr_" + $new_index;
					  	jQuery(this).children('td:first-child').html($new_index);
					  	jQuery(this).attr("id", $new_ID);
					  	if ( $new_index == 0 ) { jQuery(this).addClass("currently_encoding"); }
					  	else { jQuery(this).removeClass("currently_encoding"); }
					  })
				});
			});
			
			jQuery("#sortable .submitdelete").live("click", function (e) {
				jQuery(this).closest("tr").fadeOut("slow", function(){ jQuery(this).remove(); });
				jQuery("#sortable tbody.rows").trigger("sortupdate");
			});
			
			
			
		</script>
		<div id="icon-tools" class="icon32"><br /></div>
		<h2>Video Embed & Thumbnail Generator Encoding Queue</h2>
		<p></p>
		<form method="post" action="tools.php?page=kg_video_encoding_queue">
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
			<?php echo kg_generate_queue_table(); ?>
			</tbody>
		</table>
		<!-- <input type='button' class='button-secondary' value='sort' onclick='jQuery("#sortable tbody.rows").trigger("sortupdate"); jQuery( "#sortable tbody.rows" ).sortable("refresh");'> -->
		<input type='button' class='button-secondary' value='Clear Completed' onclick='kg_encode_queue("clear_completed", 0);'>
		</form>
	</div>
<?php
} 

function kg_addFMPOptionsPage() {
		add_options_page('Video Embed & Thumbnail Generator', 'Video Embed & Thumbnail Generator', 'administrator', __FILE__, 'kg_FMPOptionsPage');
}
add_action('admin_menu', 'kg_addFMPOptionsPage');

function kg_FMPOptionsPage() {
?>
	<div class="wrap">
		<div class="icon32" id="icon-options-general"><br></div>
		<h2>Video Embed & Thumbnail Generator</h2>
		<form method="post" action="options.php">
		<?php settings_fields('kg_video_embed_options'); ?>
		<?php do_settings_sections(__FILE__); ?>
     	<p class='submit'>
   		   <?php submit_button('Save Changes', 'primary', 'submit', false); submit_button('Reset Options', 'secondary', 'video-embed-thumbnail-generator-reset', false); ?>
   		</p>
		</form>
		<script type="text/javascript">
			var embed_method = jQuery('#embed_method').val();
			var video_app = jQuery('#video_app').val();
			jQuery(document).ready(function() {
					kg_hide_plugin_settings(embed_method);
					kg_hide_ffmpeg_settings(video_app);
				}
			);
		</script>
	</div>
<?php
}

function kg_video_embed_options_init() {

	register_setting('kg_video_embed_options', 'kg_video_embed_options', 'kg_video_embed_options_validate' );
	
	$options = get_option('kg_video_embed_options');

	add_settings_section('kg_video_embed_plugin_settings', 'Plugin Settings', 'kg_plugin_settings_section_callback', __FILE__);
	add_settings_section('kg_video_embed_playback_settings', 'Default Video Playback Settings', 'kg_plugin_playback_settings_section_callback', __FILE__);
	add_settings_section('kg_video_embed_flash_settings', 'The following options will only affect Flash playback', 'kg_plugin_flash_settings_section_callback', __FILE__);


	add_settings_field('embed_method', 'Player:', 'kg_embed_method_callback', __FILE__, 'kg_video_embed_plugin_settings', array( 'label_for' => 'embed_method' ) );
	add_settings_field('template', 'Attachment Template Override:', 'kg_template_callback', __FILE__, 'kg_video_embed_plugin_settings', array( 'label_for' => 'template' ) );
	add_settings_field('encode_formats', 'Default Mobile/HTML5 Video encode formats:', 'kg_encode_formats_callback', __FILE__, 'kg_video_embed_plugin_settings');
	add_settings_field('app_path', 'Path to applications on server:', 'kg_app_path_callback', __FILE__, 'kg_video_embed_plugin_settings', array( 'label_for' => 'app_path' ) );
	add_settings_field('video_app', 'Application for thumbnails & encoding:', 'kg_video_app_callback', __FILE__, 'kg_video_embed_plugin_settings', array( 'label_for' => 'video_app' ) );
	add_settings_field('ffmpeg_vpre', 'FFMPEG Options:', 'kg_ffmpeg_vpre_callback', __FILE__, 'kg_video_embed_plugin_settings', array( 'label_for' => 'ffmpeg_vpre' ) );
	add_settings_field('moov', 'Application to fix encoded H.264 headers for streaming:', 'kg_moov_callback', __FILE__, 'kg_video_embed_plugin_settings', array( 'label_for' => 'moov' ) );
	add_settings_field('generate_thumbs', 'Default number of thumbnails to generate:', 'kg_generate_thumbs_callback', __FILE__, 'kg_video_embed_plugin_settings', array( 'label_for' => 'generate_thumbs' ) );
	add_settings_field('titlecode', 'Video Title Text HTML Formatting:', 'kg_titlecode_callback', __FILE__, 'kg_video_embed_plugin_settings', array( 'label_for' => 'titlecode' ) );
	add_settings_field('poster', 'Poster image:', 'kg_poster_callback', __FILE__, 'kg_video_embed_playback_settings', array( 'label_for' => 'poster' ) );
	add_settings_field('width', 'Max video width:', 'kg_width_callback', __FILE__, 'kg_video_embed_playback_settings', array( 'label_for' => 'width' ) );
	add_settings_field('height', 'Max video height:', 'kg_height_callback', __FILE__, 'kg_video_embed_playback_settings', array( 'label_for' => 'height' ) );
	add_settings_field('gallery_width', 'Max gallery video width:', 'kg_gallery_width_callback', __FILE__, 'kg_video_embed_playback_settings', array( 'label_for' => 'gallery_width' ) );
	add_settings_field('gallery_height', 'Max gallery video height:', 'kg_gallery_height_callback', __FILE__, 'kg_video_embed_playback_settings', array( 'label_for' => 'gallery_height' ) );
	add_settings_field('gallery_thumb', 'Gallery thumbnail width:', 'kg_gallery_thumb_callback', __FILE__, 'kg_video_embed_playback_settings', array( 'label_for' => 'gallery_thumb' ) );
	add_settings_field('controlbar_style', 'Controlbar style:', 'kg_controlbar_style_callback', __FILE__, 'kg_video_embed_playback_settings', array( 'label_for' => 'controlbar_style' ) );
	add_settings_field('autoplay', 'Autoplay behavior:', 'kg_autoplay_callback', __FILE__, 'kg_video_embed_playback_settings', array( 'label_for' => 'autoplay' ) );
	add_settings_field('loop', 'Loop behavior:', 'kg_loop_callback', __FILE__, 'kg_video_embed_playback_settings', array( 'label_for' => 'loop' ) );
	add_settings_field('js_skin', 'Skin Class:', 'kg_js_skin_callback', __FILE__, 'kg_video_embed_playback_settings', array( 'label_for' => 'js_skin' ) );
	add_settings_field('endOfVideoOverlay', 'End of video image:', 'kg_endOfVideoOverlay_callback', __FILE__, 'kg_video_embed_flash_settings' );
	add_settings_field('bgcolor', 'Background color:', 'kg_bgcolor_callback', __FILE__, 'kg_video_embed_flash_settings', array( 'label_for' => 'bgcolor' ) );
	add_settings_field('configuration', 'XML configuration file:', 'kg_configuration_callback', __FILE__, 'kg_video_embed_flash_settings', array( 'label_for' => 'configuration' ) );
	add_settings_field('skin', 'Video skin file:', 'kg_skin_callback', __FILE__, 'kg_video_embed_flash_settings', array( 'label_for' => 'skin' ) );
	add_settings_field('stream_type', 'Video stream type:', 'kg_stream_type_callback', __FILE__, 'kg_video_embed_flash_settings', array( 'label_for' => 'stream_type' ) );
	add_settings_field('scale_mode', 'Video scale mode:', 'kg_scale_mode_callback', __FILE__, 'kg_video_embed_flash_settings', array( 'label_for' => 'scale_mode' ) );
	add_settings_field('autohide', 'Autohide behavior:', 'kg_autohide_callback', __FILE__, 'kg_video_embed_flash_settings', array( 'label_for' => 'autohide' ) );
	add_settings_field('playbutton', 'Play button overlay:', 'kg_playbutton_callback', __FILE__, 'kg_video_embed_flash_settings', array( 'label_for' => 'playbutton' ) );
}
add_action('admin_init', 'kg_video_embed_options_init' );

function kg_update_settings() {

	$options = get_option('kg_video_embed_options');
	
	if ( !array_key_exists('version', $options) ) { // run if the version number setting doesn't exist yet (before version 3.0)

		$default_options = kg_default_options_fn();

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
				$options[$new_setting] = $old_setting_value;
				delete_option($old_setting);
			}
		}
		$wpdb->query( "DELETE FROM $wpdb->options WHERE option_name LIKE wp_FMP%%" );
		
		foreach ( $default_options as $key => $value ) { //apply default values for any settings that didn't exist before
			if ( !array_key_exists($key, $options) ) { $options[$key] = $value; }
		}
		
		update_option('kg_video_embed_options', $options);	
	}
}
add_action('init', 'kg_update_settings' );

function kg_video_embed_options_validate($input) { //validate & sanitize input from settings form

	$default_options = kg_default_options_fn();
	
	if (isset ($_POST["video-embed-thumbnail-generator-reset"])) {
		$input = $default_options;
		add_settings_error( __FILE__, "options-reset", "Video Embed & Thumbnail Generator settings reset to default values.", "updated" );
	}

	$ffmpeg_info = kg_check_ffmpeg_exists($input, false);
	
	if ( $ffmpeg_info['exec_enabled'] == false ) {
		add_settings_error( __FILE__, "exec-disabled", "EXEC function is disabled in PHP settings. You can embed existing videos, but video thumbnail generation and Mobile/HTML5 video encoding will not work. Contact your System Administrator to find out if you can enable EXEC.", "error");
		$input['ffmpeg_exists'] = "notinstalled";
	}
	elseif ( $ffmpeg_info['ffmpeg_exists'] == false ) {
		add_settings_error( __FILE__, "ffmpeg-not-found", strtoupper($input['video_app'])." not found at ".$input['app_path'].". You can embed existing videos, but video thumbnail generation and Mobile/HTML5 video encoding will not work.", "error"); 
		$input['ffmpeg_exists'] = "notinstalled";
	}
	if ( $ffmpeg_info['ffmpeg_exists'] == true ) { $input['ffmpeg_exists'] = "true"; }
	
	foreach ($input as &$option) { // sets checkboxes to "true" instead of "on"
		if ( $option == "on" ) { $option = "true"; }
	}
	
	$input['titlecode'] =  wp_kses_post( $input['titlecode'] );
	
	 // load all settings and make sure they get a value of false if they weren't entered into the form
	foreach ( $default_options as $key => $value ) {
		if ( !array_key_exists($key, $input) ) { $input[$key] = false; }
	}

	$input['version'] = $default_options['version']; //since this isn't user selectable it has to be re-entered every time
	
	return $input;
}

//callback functions generating HTML for the settings form

	function kg_plugin_settings_section_callback() { }
	function kg_plugin_playback_settings_section_callback() { }
	function kg_plugin_flash_settings_section_callback() { }
	
	function kg_embed_method_callback() {
		$options = get_option('kg_video_embed_options');
		$items = array("Strobe Media Playback", "Video.js");
		echo "<select onchange='kg_hide_plugin_settings(this.value);' id='embed_method' name='kg_video_embed_options[embed_method]'>";
		foreach($items as $item) {
			$selected = ($options['embed_method']==$item) ? 'selected="selected"' : '';
			echo "<option value='$item' $selected>$item</option>";
		}
		echo "</select> <a class='kg_tooltip' href='#'><img src='../wp-includes/images/blank.gif'><span class='kg_tooltip_classic'>This plugin has used Strobe Media Playback for Flash playback in the past, but you can choose to use the newer and lighter Video-js method which will only give priority to HTML5 and only use Flash as a fallback.</span></a>";
	}

	function kg_template_callback() {
		$options = get_option('kg_video_embed_options');
		echo "<input ".checked( $options['template'], "true", false )." id='template' name='kg_video_embed_options[template]' type='checkbox' /> <label for='template'>Enable minimalist video attachment template.</label><a class='kg_tooltip' href='#'><img src='../wp-includes/images/blank.gif'><span class='kg_tooltip_classic'>Allows easy iframe embedding on other sites. Will override any existing video attachment template page, which is usually a good thing.</span></a>";
	}
	
	function kg_encode_formats_callback() {
		$options = get_option('kg_video_embed_options');
		echo "<input ".checked( $options['encode_1080'], "true", false )." id='encode_1080' name='kg_video_embed_options[encode_1080]' type='checkbox' /> <label for='encode_1080'>1080p H.264 <small><em>(iPhone 4s+, iPad 2+, few Android, Windows Phone 8, Chrome, Safari, IE 9+)</em></small></label> <a class='kg_tooltip' href='#'><img src='../wp-includes/images/blank.gif'><span class='kg_tooltip_classic'>This is complicated. If you have FFMPEG/LIBAV and the proper libraries installed, you can choose to encode your uploaded video into as many as five additional formats depending on your original source. Different browsers have different playback capabilities. Most desktop browsers can play H.264, and all modern mobile devices can play at least 480p H.264. If you create multiple H.264 resolutions, the highest resolution supported by the device will be served up automatically. The plugin will not upconvert your video, so if you upload a 720p video, it will not waste your time creating a 1080p version. There was a time when it seemed like a good idea to provide OGV or WEBM for some desktop browsers, but even Firefox is planning to allow H.264 playback in the future and I no longer recommend encoding OGV or WEBM unless you expect a large number of no-Flash sticklers visiting your site.</span></a><br />";
		echo "<input ".checked( $options['encode_720'], "true", false )." id='encode_720' name='kg_video_embed_options[encode_720]' type='checkbox' /> <label for='encode_720'>720p H.264 <small><em>(iPhone 4+, iPad, some Android, Chrome, Safari, IE 9+)</em></small></label><br />";
		echo "<input ".checked( $options['encode_mobile'], "true", false )." id='encode_mobile' name='kg_video_embed_options[encode_mobile]' type='checkbox' /> <label for='encode_mobile'>480p H.264 <small><em>(iOS, Android, Windows Phone 7, Chrome, Safari, IE 9+)</em></small></label><br />";
		echo "<input ".checked( $options['encode_webm'], "true", false )." id='encode_webm' name='kg_video_embed_options[encode_webm]' type='checkbox' /> <label for='encode_webm'>WEBM <small><em>(Firefox, Chrome, Android 2.3+, Opera)</em></small></label><br />";
		echo "<input ".checked( $options['encode_ogg'], "true", false )." id='encode_ogg' name='kg_video_embed_options[encode_ogg]' type='checkbox' /> <label for='encode_ogg'>OGV <small><em>(Firefox, Chrome, Android 2.3+, Opera)</em></small></label>";
	}
	
	function kg_app_path_callback() {
		$options = get_option('kg_video_embed_options');
		echo "<input id='app_path' name='kg_video_embed_options[app_path]' size='40' type='text' value='".stripslashes($options['app_path'])."' /><a class='kg_tooltip' href='#'><img src='../wp-includes/images/blank.gif'><span class='kg_tooltip_classic'>Don't include trailing slash. Example: <code>/usr/local/bin</code>. On Windows servers, use / instead of C:\\";
	}

	function kg_video_app_callback() {
		$options = get_option('kg_video_embed_options');
		$items = array("FFMPEG"=>"ffmpeg", "LIBAV"=>"avconv");
		echo "<select onchange='kg_hide_ffmpeg_settings(this.value);' id='video_app' name='kg_video_embed_options[video_app]'>";
		foreach($items as $name => $value) {
			$selected = ($options['video_app']==$value) ? 'selected="selected"' : '';
			echo "<option value='$value' $selected>$name</option>";
		}
		echo "</select> <a class='kg_tooltip' href='#'><img src='../wp-includes/images/blank.gif'><span class='kg_tooltip_classic'>FFMPEG split into two separate branches in 2011. The new branch is called LIBAV. Both are still actively developed. Debian & Ubuntu users probably have LIBAV installed.</span></a>";
	}
	
	function kg_ffmpeg_vpre_callback() {
		$options = get_option('kg_video_embed_options');
		echo "<input ".checked( $options['ffmpeg_vpre'], "true", false )." id='ffmpeg_vpre' name='kg_video_embed_options[ffmpeg_vpre]' type='checkbox' /> <label for='ffmpeg_vpre'>Enable FFMPEG 'vpre' flags.</label> <a class='kg_tooltip' href='#'><img src='../wp-includes/images/blank.gif'><span class='kg_tooltip_classic'>Enable if your installed version of FFMPEG is old enough that libx264 requires vpre flags to operate (Dreamhost users must turn this on). This should help if you can encode WEBM or OGV files but H264/Mobile files fail. It will cause newer versions of FFMPEG to fail and probably won't work on Windows servers.</span></a>";
	}
	
	function kg_moov_callback() {
		$options = get_option('kg_video_embed_options');
		$items = array("none", "qt-faststart", "MP4Box");
		echo "<select id='moov' name='kg_video_embed_options[moov]'>";
		foreach($items as $item) {
			$selected = ($options['moov']==$item) ? 'selected="selected"' : '';
			echo "<option value='$item' $selected>$item</option>";
		}
		echo "</select> <a class='kg_tooltip' href='#'><img src='../wp-includes/images/blank.gif'><span class='kg_tooltip_classic'>FFMPEG & LIBAV place moov atoms at the end of H.264 encoded files, which forces the entire file to download before playback can start and prevents the Flash player from playing them at all. If either of these programs is installed in the application path, you can choose to run it after encoding is finished in order to allow playback while downloading.</span></a>";
	}

	function kg_generate_thumbs_callback() {
		$options = get_option('kg_video_embed_options');
		echo "<input id='generate_thumbs' name='kg_video_embed_options[generate_thumbs]' size='3' type='text' value='".strval($options['generate_thumbs'])."' />";
	}
	
	function kg_titlecode_callback() {
		$options = get_option('kg_video_embed_options');
		echo "<input id='titlecode' name='kg_video_embed_options[titlecode]' size='40' type='text' value='".htmlentities(stripslashes($options['titlecode']))."' /> <a class='kg_tooltip' href='#'><img src='../wp-includes/images/blank.gif'><span class='kg_tooltip_classic'>HTML tag applied to video titles inserted by the plugin. Ex: &lt;strong&gt;, &lt;em&gt;, &lt;H2&gt;, &lt;span class='videotitle'&gt;. Corresponding closing tags will be applied to the end of the title automatically.</span></a>";
	}
	
	function kg_poster_callback() {
		$options = get_option('kg_video_embed_options');
		echo "<input id='poster' name='kg_video_embed_options[poster]' size='60' type='text' value='".$options['poster']."' />";
	}
	
	function kg_width_callback() {
		$options = get_option('kg_video_embed_options');
		echo "<input id='width' name='kg_video_embed_options[width]' size='5' type='text' value='".$options['width']."' />";
	}
	
	function kg_height_callback() {
		$options = get_option('kg_video_embed_options');
		echo "<input id='height' name='kg_video_embed_options[height]' size='5' type='text' value='".$options['height']."' />";
	}
	
	function kg_gallery_width_callback() {
		$options = get_option('kg_video_embed_options');
		echo "<input id='width' name='kg_video_embed_options[gallery_width]' size='5' type='text' value='".$options['gallery_width']."' /> ";
	}
	
	function kg_gallery_height_callback() {
		$options = get_option('kg_video_embed_options');
		echo "<input id='width' name='kg_video_embed_options[gallery_height]' size='5' type='text' value='".$options['gallery_height']."' />";
	}
	
	function kg_gallery_thumb_callback() {
		$options = get_option('kg_video_embed_options');
		echo "<input id='width' name='kg_video_embed_options[gallery_thumb]' size='5' type='text' value='".$options['gallery_thumb']."' />";
	}
	
	function kg_controlbar_style_callback() {
		$options = get_option('kg_video_embed_options');
		$items = array("docked", "floating", "none");
		echo "<select id='controlbar_style' name='kg_video_embed_options[controlbar_style]'>";
		foreach($items as $item) {
			$selected = ($options['controlbar_style']==$item) ? 'selected="selected"' : '';
			echo "<option value='$item' $selected>$item</option>";
		}
		echo "</select> HTML5 video players only respond to the \"none\" option.";
	}
	
	function kg_autoplay_callback() {
		$options = get_option('kg_video_embed_options');
		echo "<input ".checked( $options['autoplay'], "true", false )." id='autoplay' name='kg_video_embed_options[autoplay]' type='checkbox' /> <label for='autoplay'>Play automatically when page loads.</label>";
	}
	
	function kg_loop_callback() {
		$options = get_option('kg_video_embed_options');
		echo "<input ".checked( $options['loop'], "true", false )." id='loop' name='kg_video_embed_options[loop]' type='checkbox' /> <label for='loop'>Loop to beginning when video ends.</label>";
	}
	
	function kg_js_skin_callback() {
		$options = get_option('kg_video_embed_options');
		echo "<input id='skin' name='kg_video_embed_options[js_skin]' size='60' type='text' value='".$options['js_skin']."' /><br /><em><small>Use <code>kg-video-js-skin</code> for a nice, circular play button. Leave blank for the default square play button. <a href='http://videojs.com/docs/skins/'>Or build your own CSS skin.</a></small></em>";
	}
	
	function kg_endOfVideoOverlay_callback() {
		$options = get_option('kg_video_embed_options');
		echo "<input ".checked( $options['endOfVideoOverlaySame'], "true", false )." id='endOfVideoOverlaySame' name='kg_video_embed_options[endOfVideoOverlaySame]' type='checkbox' onclick='if (this.checked == true) { document.getElementById(\"endOfVideoOverlay\").disabled=true; } else { document.getElementById(\"endOfVideoOverlay\").disabled=false; }'/> <label for='endOfVideoOverlaySame'>Display poster image again when video ends.</label><br />";
		echo "<input id='endOfVideoOverlay' name='kg_video_embed_options[endOfVideoOverlay]' size='60' ".disabled( $options['endOfVideoOverlaySame'], "true", false )." type='text' value='".$options['endOfVideoOverlay']."' /> Display alternate image when video ends.<br /><small><em>Leave blank to display the first frame of the video when video ends.</em></small>";
	}
	
	function kg_bgcolor_callback() {
		$options = get_option('kg_video_embed_options');
		echo "<input id='bgcolor' name='kg_video_embed_options[bgcolor]' size='8' type='text' value='".$options['bgcolor']."' /> #rrggbb";
	}
	
	function kg_configuration_callback() {
		$options = get_option('kg_video_embed_options');
		echo "<input id='configuration' name='kg_video_embed_options[configuration]' size='60' type='text' value='".$options['configuration']."' />";
	}
	
	function kg_skin_callback() {
		$options = get_option('kg_video_embed_options');
		echo "<input id='skin' name='kg_video_embed_options[skin]' size='60' type='text' value='".$options['skin']."' /><br /><em><small>Use <code>".plugins_url("", __FILE__)."/flash/skin/kg_skin.xml</code> for a modern, circular play button.<br /> Leave blank for the older style square play button.</small></em>";
	}
	
	function kg_stream_type_callback() {
		$options = get_option('kg_video_embed_options');
		$items = array("liveOrRecorded", "live", "recorded", "dvr");
		echo "<select id='stream_type' name='kg_video_embed_options[stream_type]'>";
		foreach($items as $item) {
			$selected = ($options['stream_type']==$item) ? 'selected="selected"' : '';
			echo "<option value='$item' $selected>$item</option>";
		}
		echo "</select>";
	}
	
	function kg_scale_mode_callback() {
		$options = get_option('kg_video_embed_options');
		$items = array("letterbox", "none", "stretch", "zoom");
		echo "<select id='scale_mode' name='kg_video_embed_options[scale_mode]'>";
		foreach($items as $item) {
			$selected = ($options['scale_mode']==$item) ? 'selected="selected"' : '';
			echo "<option value='$item' $selected>$item</option>";
		}
		echo "</select>";
	}
	
	function kg_autohide_callback() {
		$options = get_option('kg_video_embed_options');
		echo "<input ".checked( $options['autohide'], "true", false )." id='autohide' name='kg_video_embed_options[autohide]' type='checkbox' /> <label for='autohide'>Autohide controlbar.</label>";
	}
	
	function kg_playbutton_callback() {
		$options = get_option('kg_video_embed_options');
		echo "<input ".checked( $options['playbutton'], "true", false )." id='playbutton' name='kg_video_embed_options[playbutton]' type='checkbox' /> <label for='playbutton'>Overlay play button on poster frame.</label>";
	}
//end of settings page callback functions


/** 
 * Adding our custom fields to the $form_fields array 
 * 
 * @param array $form_fields 
 * @param object $post 
 * @return array 
 */  
function kg_image_attachment_fields_to_edit($form_fields, $post) { 

	$options = get_option('kg_video_embed_options');

	if( substr($post->post_mime_type, 0, 5) == 'video' ){ 

		$form_fields["kgflashmediaplayer-security"]["input"] = "hidden";
		$form_fields["kgflashmediaplayer-security"]["value"] = wp_create_nonce('video-embed-thumbnail-generator-nonce');

		$movieurl = wp_get_attachment_url($post->ID);
		$form_fields["kgflashmediaplayer-url"]["input"] = "hidden";
		$form_fields["kgflashmediaplayer-url"]["value"] = $movieurl;
		
		$encodeset['1080'] = get_post_meta($post->ID, "_kgflashmediaplayer-encode1080", true);
		if ($encodeset['1080'] == "") { $encodeset['1080'] = $options['encode_1080']; }
		$form_fields["kgflashmediaplayer-encode1080"]["input"] = "hidden";
		$form_fields["kgflashmediaplayer-encode1080"]["value"] = $encodeset['1080'];

		$encodeset['720'] = get_post_meta($post->ID, "_kgflashmediaplayer-encode720", true);
		if ($encodeset['720'] == "") { $encodeset['720'] = $options['encode_720']; }
		$form_fields["kgflashmediaplayer-encode720"]["input"] = "hidden";
		$form_fields["kgflashmediaplayer-encode720"]["value"] = $encodeset['720'];

		$encodeset['mobile'] = get_post_meta($post->ID, "_kgflashmediaplayer-encodemobile", true);
		if ($encodeset['mobile'] == "") { $encodeset['mobile'] = $options['encode_mobile']; }
		$form_fields["kgflashmediaplayer-encodemobile"]["input"] = "hidden";
		$form_fields["kgflashmediaplayer-encodemobile"]["value"] = $encodeset['mobile'];

		$encodeset['ogg'] = get_post_meta($post->ID, "_kgflashmediaplayer-encodeogg", true);
		if ($encodeset['ogg'] == "") { $encodeset['ogg'] = $options['encode_ogg']; }
		$form_fields["kgflashmediaplayer-encodeogg"]["input"] = "hidden";
		$form_fields["kgflashmediaplayer-encodeogg"]["value"] = $encodeset['ogg'];

		$encodeset['webm'] = get_post_meta($post->ID, "_kgflashmediaplayer-encodewebm", true);
		if ($encodeset['webm'] == "") { $encodeset['webm'] = $options['encode_webm']; }
		$form_fields["kgflashmediaplayer-encodewebm"]["input"] = "hidden";
		$form_fields["kgflashmediaplayer-encodewebm"]["value"] = $encodeset['webm'];

		$maxwidth = $options['width'];
		$widthset = get_post_meta($post->ID, "_kgflashmediaplayer-width", true);
		if ($widthset == "") { $widthset = $maxwidth; }
		$form_fields["kgflashmediaplayer-widthsave"]["input"] = "hidden";
		$form_fields["kgflashmediaplayer-widthsave"]["value"] = $widthset;

		$form_fields["kgflashmediaplayer-maxwidth"]["input"] = "hidden";
		$form_fields["kgflashmediaplayer-maxwidth"]["value"] = $maxwidth;

		$maxheight = $options['height'];
		$heightset = get_post_meta($post->ID, "_kgflashmediaplayer-height", true);
		if ($heightset == "") { $heightset = $maxheight; }
		$form_fields["kgflashmediaplayer-heightsave"]["input"] = "hidden";
		$form_fields["kgflashmediaplayer-heightsave"]["value"] = $heightset;

		$form_fields["kgflashmediaplayer-maxheight"]["input"] = "hidden";
		$form_fields["kgflashmediaplayer-maxheight"]["value"] = $maxheight;

		$actualwidth = get_post_meta($post->ID, "_kgflashmediaplayer-actualwidth", true);
		if ($actualwidth == "") { $actualwidth = $maxwidth; }
		$form_fields["kgflashmediaplayer-heightsave"]["input"] = "hidden";
		$form_fields["kgflashmediaplayer-heightsave"]["value"] = $actualwidth;
		
		$actualheight = get_post_meta($post->ID, "_kgflashmediaplayer-actualheight", true);
		if ($actualheight == "") { $actualheight = $maxheight; }
		$form_fields["kgflashmediaplayer-heightsave"]["input"] = "hidden";
		$form_fields["kgflashmediaplayer-heightsave"]["value"] = $actualheight;

		$form_fields["kgflashmediaplayer-aspect"]["input"] = "hidden";
		$form_fields["kgflashmediaplayer-aspect"]["value"] = $heightset/$widthset;

		$form_fields["kgflashmediaplayer-downloadsave"]["input"] = "hidden";
		$form_fields["kgflashmediaplayer-downloadsave"]["value"] = get_post_meta($post->ID, "_kgflashmediaplayer-download", true);

		$form_fields["kgflashmediaplayer-showtitlesave"]["input"] = "hidden";
		$form_fields["kgflashmediaplayer-showtitlesave"]["value"] = get_post_meta($post->ID, "_kgflashmediaplayer-showtitle", true);

		$embedset = get_post_meta($post->ID, "_kgflashmediaplayer-embed", true);
		if ($embedset == "") { $embedset = "Single Video"; }
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
		else { if ( !kg_url_exists($thumbnail_url) ) { $thumbnail_url = ""; } }

	$thumbnail_html = "";
		if ($thumbnail_url != "" ) { 		
		$thumbnail_html = '<div style="border-style:solid; border-color:#ccc; border-width:3px; width:200px; text-align:center; margin:10px;"><img width="200" src="'.$thumbnail_url.'?'.rand().'"></div>'; 
	}

	if (get_post_meta($post->ID, "_kgflashmediaplayer-thumbtime", true) != "") { $numberofthumbs_value = "1"; }
	else { $numberofthumbs_value = $options['generate_thumbs']; }

	if ( !isset($options['ffmpeg_exists']) || $options['ffmpeg_exists'] == "notchecked" ) { 
		kg_check_ffmpeg_exists($options, true);
	}

	if ( $options['ffmpeg_exists'] == "notinstalled" ) { $ffmpeg_disabled_text = 'disabled="disabled" title="'.strtoupper($options['video_app']).' not found at '.$options['app_path'].'"'; }
	else { $ffmpeg_disabled_text = ""; }
	
	if ( $options['embed_method'] == "Video.js" ) {
		
		$starts = intval(get_post_meta($post->ID, "_kgflashmediaplayer-starts", true));
		$completeviews = intval(get_post_meta($post->ID, "_kgflashmediaplayer-completeviews", true));
		
		$form_fields["views"]["label"] = __("Video Stats");
		$form_fields["views"]["input"] = "html";
		$form_fields["views"]["html"] = $starts." Starts, ".$completeviews." Complete Views";
	
	}

	$form_fields["generator"]["label"] = __("Thumbnails");
	$form_fields["generator"]["input"] = "html";
	$form_fields["generator"]["html"] = '<div id="attachments_'. $post->ID .'_thumbnailplaceholder">'. $thumbnail_html .'</div>
	<input id="attachments_'. $post->ID .'_numberofthumbs" type="text" value="'.$numberofthumbs_value.'" maxlength="2" size="4" style="width:25px;" onchange="document.getElementById(\'attachments-'.$post->ID.'-thumbtime\').value =\'\';" '.$ffmpeg_disabled_text.'/>
	<input type="button" id="attachments['. $post->ID .'][thumbgenerate]" class="button-secondary" value="Generate" name="thumbgenerate" onclick="kg_generate_thumb('. $post->ID .', \'generate\');" '.$ffmpeg_disabled_text.'/>
	<input type="button" id="thumbrandomize" class="button-secondary" value="Randomize" name="thumbrandomize" onclick="kg_generate_thumb('. $post->ID .', \'random\');" '.$ffmpeg_disabled_text.'/> <br />
	<input type="checkbox" id="attachments_'. $post->ID .'_firstframe" onchange="document.getElementById(\'attachments-'.$post->ID.'-thumbtime\').value =\'\';" '.$ffmpeg_disabled_text.'/>
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
	<input id="attachments_'. $post->ID .'_kgflashmediaplayer-height" type="text" value="'.$heightset.'" style="width:50px;" onchange="kg_set_dimension('.$post->ID.', \'width\', this.value);" onkeyup="kg_set_dimension('.$post->ID.', \'width\', this.value);"> <br />
	<input type="checkbox" id="attachments_'. $post->ID .'_kgflashmediaplayer-lockaspect" onclick="kg_set_aspect('.$post->ID.', this.checked);" checked> 
	<label for="attachments_'. $post->ID .'_kgflashmediaplayer-lockaspect"><small>Lock to Aspect Ratio</small></label>';
	$form_fields["kgflashmediaplayer-dimensions"]["helps"] = "<small>Leave blank to use <a href='options-general.php?page=video-embed-thumbnail-generator.php' target='_blank'>default dimensions</a>.</small>";

	$altembedset = get_post_meta($post->ID, "_kgflashmediaplayer-altembed", true);
	$encodevideo_info = kg_encodevideo_info($movieurl, $post->ID);

	$altembedselect = "";
	$originalselect = "";
	$replaceoptions = "";
	$checkboxes = "";
	$alt_file_exists = false;
	$original_extension = pathinfo($movieurl, PATHINFO_EXTENSION);
	$embeddable = array("flv", "f4v", "mp4", "mov", "m4v", "ogv", "ogg", "webm");
	$video_formats = array(
		"1080" => "1080p H.264",
		"720" => "720p H.264",
		"mobile" => "480p H.264",
		"webm" => "WEBM",
		"ogg" => "OGV"
	);
	if ( in_array($original_extension, $embeddable) ) { $originalselect = '<option value="'.$movieurl.'">original</option>'; }

	foreach($video_formats as $format => $name) {
		$selected = ( $altembedselect == $encodevideo_info[$format.'url'] ) ? 'selected="selected"' : '';
		if ($encodevideo_info[$format.'_exists']) { 
			$replaceoptions .= '<option '.$selected.' value="'.$encodevideo_info[$format.'url'].'">'.$name.'</option>';
			$alt_file_exists = true;
		}
		$checkboxes .= '<input type="checkbox" id="attachments['. $post->ID .'][kgflashmediaplayer-encode'.$format.'check]" name="attachments['. $post->ID .'][kgflashmediaplayer-encode'.$format.'check]" value="checked" onclick="if(this.checked) { document.getElementById(\'attachments['.$post->ID.'][kgflashmediaplayer-encode'.$format.']\').value = \'true\'; } else { document.getElementById(\'attachments['.$post->ID.'][kgflashmediaplayer-encode'.$format.']\').value = \'false\'; }" '.checked( $encodeset[$format], "true", false ).' '.$ffmpeg_disabled_text.'> <label for="attachments['. $post->ID .'][kgflashmediaplayer-encode'.$format.'check]">'.$name.' </label><br />';
	}

	//if ( $alt_file_exists ) { $altembedselect ='<span class="kg_embedselect">Embed <select name="attachments['.$post->ID.'][kgflashmediaplayer-altembed]" id="attachments['.$post->ID.'][kgflashmediaplayer-altembed]">'.$originalselect.$replaceoptions.'</select></span>'; }

	$form_fields["kgflashmediaplayer-encode"]["label"] = __("Additional Formats");
	$form_fields["kgflashmediaplayer-encode"]["input"] = "html";
	$form_fields["kgflashmediaplayer-encode"]["html"] = '<span class="kg_encodecheckboxes">'.$checkboxes.'</span>
		<input type="button" id="attachments['. $post->ID .'][kgflashmediaplayer-encode]" name="attachments['. $post->ID .'][kgflashmediaplayer-encode]" class="button-secondary" value="Encode" name="thumbgenerate" onclick="kg_generate_thumb('. $post->ID .', \'enqueue\');" '.$ffmpeg_disabled_text.'/>
	<div style="display:inline;" id="attachments_'. $post->ID .'_altembedselect">'.$altembedselect.'</div>
	<div style="display:block;" id="attachments_'. $post->ID .'_encodeplaceholder"></div>
	<div style="display:block;" id="attachments_'. $post->ID .'_encodeprogressplaceholder"></div>

	<small><em>Generates additional video formats compatible with most mobile & HTML5-compatible browsers.</em></small>';

	$showtitlechecked = get_post_meta($post->ID, "_kgflashmediaplayer-showtitle", true);
	$downloadlinkchecked = get_post_meta($post->ID, "_kgflashmediaplayer-download", true);
	$embed_option = get_post_meta($post->ID, "_kgflashmediaplayer-embed", true);

	$items = array("Single Video", "Video Gallery", "WordPress Default");
	$shortcode_select = '<select name="attachments['.$post->ID.'][kgflashmediaplayer-embed]" id="attachments['.$post->ID.'][kgflashmediaplayer-embed]" onchange="document.getElementsByName(\'attachments['.$post->ID.'][kgflashmediaplayer-embedsave]\')[0].value = this.value;" >';
	foreach($items as $item) {
		$selected = ($embed_option==$item) ? 'selected="selected"' : '';
		$shortcode_select .= "<option value='$item' $selected>$item</option>";
	}
	$shortcode_select .= "</select>";

	$form_fields["kgflashmediaplayer-options"]["label"] = __("Video Embed Options");
	$form_fields["kgflashmediaplayer-options"]["input"] = "html";
	$form_fields["kgflashmediaplayer-options"]["html"] = '<input type="checkbox" name="attachments['.$post->ID.'][kgflashmediaplayer-showtitle]" id="attachments-'.$post->ID.'-kgflashmediaplayer-showtitle" value="checked" onclick="if(this.checked) { document.getElementsByName(\'attachments['.$post->ID.'][kgflashmediaplayer-showtitlesave]\')[0].value = \'checked\'; } else { document.getElementsByName(\'attachments['.$post->ID.'][kgflashmediaplayer-showtitlesave]\')[0].value = \'unchecked\'; }" '.$showtitlechecked.'> 
	<label for="attachments-'.$post->ID.'-kgflashmediaplayer-showtitle">Include Title Above Video</label><br />

	<input type="checkbox" name="attachments['.$post->ID.'][kgflashmediaplayer-downloadlink]" id="attachments-'.$post->ID.'-kgflashmediaplayer-downloadlink" value="checked" onclick="if(this.checked) { document.getElementsByName(\'attachments['.$post->ID.'][kgflashmediaplayer-downloadsave]\').value = \'checked\'; } else { document.getElementsByName(\'attachments['.$post->ID.'][kgflashmediaplayer-downloadsave]\').value = \'unchecked\'; }" '.$downloadlinkchecked.'> 
	<label for="attachments-'.$post->ID.'-kgflashmediaplayer-downloadlink">Generate Download Link Below Video<em><small>(Makes it easier for users to download video file)</em></small></label><br />
	'.$shortcode_select.'
	<label for="attachments-'.$post->ID.'-kgflashmediaplayer-embed">Choose shortcode to insert</small></em></label>';

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
		$thumb_url = $attachment['kgflashmediaplayer-poster'];
		$posterfile = pathinfo($thumb_url, PATHINFO_BASENAME);
		$tmp_posterpath = $uploads['path'].'/thumb_tmp/'.$posterfile;
				if ( !is_file($uploads['path'].'/'.$posterfile) ) {
			if ( is_file($tmp_posterpath) ) { 
				copy($tmp_posterpath, $uploads['path'].'/'.$posterfile);
				$thumb_base = substr($tmp_posterpath, 0, -5);
				foreach (glob($thumb_base."?.jpg") as $thumbfilename) {
				   unlink($thumbfilename);
				}
			}
			if ( kg_is_empty_dir($uploads["path"].'/thumb_tmp') ) { kg_rrmdir($uploads["path"].'/thumb_tmp'); }
		}
		update_post_meta($post['ID'], '_kgflashmediaplayer-poster', $thumb_url);
		
		//insert the $thumb_url into the media library if it does not already exist
		
		global $wpdb;
		$query = "SELECT ID FROM {$wpdb->posts} WHERE guid='".$thumb_url."'"; //check for existing entry in the db
		$thumb_id = $wpdb->get_var($query);
		
		if ( !$thumb_id ) {

			$post_id = $post['ID'];
			$desc = $post['post_name'] . ' thumbnail';

			//is image in uploads directory?
			$upload_dir = wp_upload_dir();

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
			} else { //not in uploads so we'll have to sideload it
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
					update_post_meta($post['ID'], '_kgflashmediaplayer-poster', $local_src);
				}
					
			} //end sideload
				
		} //end get_attachment_id_from_src

		if(!is_wp_error($thumb_id)) {
			$thumb_id = intval( $thumb_id );
			update_post_meta($post['ID'], '_kgflashmediaplayer-poster-id', $thumb_id);
		}
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

    $options = get_option('kg_video_embed_options');
    $output = $html;

    $attachment['embed'] = get_post_meta($attachment_id, "_kgflashmediaplayer-embed", true);

    if ( $attachment['embed'] == "Single Video" ||  $attachment['embed'] == "checked" || $attachment_id == "singleurl" ) {
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
        if ($attachment['showtitle'] =="checked") {
		$titlecode = html_entity_decode(stripslashes($options['titlecode']));
		if ( substr($titlecode, 0, 1) != '<' ) { $titlecode = '<'.$titlecode; }
		if ( substr($titlecode, -1, 1) != '>' ) { $titlecode .= '>'; }
		$endtitlecode = str_replace("<", "</", $titlecode);
		$endtitlecode_array = explode(' ', $endtitlecode);
		if ( substr($endtitlecode_array[0], -1) != ">" ) { $endtitlecode = $endtitlecode_array[0].">"; }
		$output .= $titlecode.$attachment["title"].$endtitlecode.'<br />'; 
	}
        $output .= '[KGVID';
        if ($attachment['poster'] !="") { $output .= ' poster="'.$attachment["poster"].'"'; }
        if ($attachment['width'] !="") { $output .= ' width="'.$attachment["width"].'"'; }
        if ($attachment['height'] !="") { $output .= ' height="'.$attachment["height"].'"'; }
        $output .= ']'.$attachment["url"].'[/KGVID]<br />';
        if ($attachment['downloadlink'] == "checked") { $output .= '<a href="'.$attachment["url"].'">Right-click or ctrl-click this link to download.</a><br />'; }
    } //if embed code is enabled
    
    if ($attachment['embed'] == "Video Gallery" ) {
    	$output = "";
    	$output .= '[KGVID gallery="true"][/KGVID]';
    }
    
    return $output;  
  }  
}  
//instantiate the class  
$kgIM = new kgInsertMedia();  

function kg_embedurl_menu($tabs) {
	$newtab = array('embedurl' => __('Embed Video from URL', 'kgoutsidevideo'));
	return array_merge($tabs, $newtab);
}
add_filter('media_upload_tabs', 'kg_embedurl_menu');

function media_embedurl_process() {

	$options = get_option('kg_video_embed_options');
	
	if ( !isset($options['ffmpeg_exists']) || $options['ffmpeg_exists'] == "notchecked" ) { kg_check_ffmpeg_exists($options, true); }

	if ( $options['ffmpeg_exists'] == "notinstalled" ) { $ffmpeg_disabled_text = 'disabled="disabled" title="'.strtoupper($options['video_app']).' not found at '.$options['app_path'].'"'; }
	else { $ffmpeg_disabled_text = ""; }
	
	if ( $options['encode_mobile'] == "true" ) { $mobilechecked = "checked";  }
	else { $mobilechecked = ""; }
	if ( $options['encode_ogg'] == "true" ) { $oggchecked = "checked";  }
	else { $oggchecked = ""; }
	if ( $options['encode_webm'] == "true" ) { $webmchecked = "checked";  }
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
	$maxheight = $options['height'];
	$maxwidth = $options['width'];
	?>
	
	<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-security]' id='attachments[singleurl][kgflashmediaplayer-security]' value='<?php echo wp_create_nonce('video-embed-thumbnail-generator-nonce'); ?>' />
	<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-encodemobile]' id='attachments[singleurl][kgflashmediaplayer-encodemobile]' value='<?php echo $options['encode_mobile']; ?>' />
	<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-encodeogg]' id='attachments[singleurl][kgflashmediaplayer-encodeogg]' value='<?php echo $options['encode_ogg']; ?>' />
	<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-encodewebm]' id='attachments[singleurl][kgflashmediaplayer-encodewebm]' value='<?php echo $options['encode_webm']; ?>' />
	<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-maxheight]' id='attachments[singleurl][kgflashmediaplayer-maxheight]' value='<?php echo($maxheight); ?>' />
	<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-maxwidth]' id='attachments[singleurl][kgflashmediaplayer-maxwidth]' value='<?php echo($maxwidth); ?>' />
	<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-aspect]' id='attachments[singleurl][kgflashmediaplayer-aspect]' value='<?php echo($maxheight/$maxwidth); ?>' />
	<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-titlecode]' id='attachments[singleurl][kgflashmediaplayer-titlecode]' value='<?php echo $options['titlecode']; ?>' />
	</form>
	
	<?php
} //end media_embedurl_process

function kg_embedurl_handle() {
    return wp_iframe( 'media_embedurl_process');
}
add_action('media_upload_embedurl', 'kg_embedurl_handle');

function kg_parameter_queryvars( $qvars ) { //add kg_video_embed variable for passing information using URL queries
	$qvars[] = 'kg_video_embed';
	return $qvars;
}
add_filter('query_vars', 'kg_parameter_queryvars' );

function kg_video_attachment_template() {

	global $post;
	global $wp_query;

	$options = get_option('kg_video_embed_options');
	
	$kg_video_embed = "";
	if ( isset($wp_query->query_vars['kg_video_embed']) ) { $kg_video_embed = $wp_query->query_vars['kg_video_embed']; }
	
	if ( ($options['template'] == "true" && is_attachment()) || isset($kg_video_embed['gallery']) ) {

		$embed_enabled = get_post_meta($post->ID, "_kgflashmediaplayer-embed", true);
	
		if ($embed_enabled == "checked" ) {
			
			$poster = get_post_meta($post->ID, "_kgflashmediaplayer-poster", true);
			if (isset($kg_video_embed['width'])) { $width = $kg_video_embed['width']; }
			else { $width = get_post_meta($post->ID, "_kgflashmediaplayer-width", true); }
			if (isset($kg_video_embed['height'])) { $height = $kg_video_embed['height']; }
			else { $height = get_post_meta($post->ID, "_kgflashmediaplayer-height", true); }
			$url = wp_get_attachment_url($post->ID);

			$shortcode = '[KGVID';
			if ($poster !="" ) { $shortcode .= ' poster="'.$poster.'"';}
			if ($width !="" ) { $shortcode .= ' width="'.$width.'"';}
			if ($height !="" ) { $shortcode .= ' height="'.$height.'"';}
			if (isset($kg_video_embed["gallery"])) { $shortcode .= ' autoplay="true"'; }
			$shortcode .= ']'.$url.'[/KGVID]';
			echo "<html>\n<head>";
			if ( $options['embed_method'] == "Strobe Media Playback" ) {
				echo "\n<script src=\"".get_bloginfo('wpurl')."/wp-includes/js/swfobject.js\" type=\"text/javascript\"></script>\n";
			}
			if ( $options['embed_method'] == "Video.js" ) {
				echo "\n<script src=\"".plugins_url('', __FILE__)."/video-js/video.js\" type=\"text/javascript\"></script>\n";
				echo "<link rel='stylesheet' href='".plugins_url('', __FILE__)."/video-js/video-js.css' type='text/css' media='all' />\n";
				echo "<link rel='stylesheet' href='".plugins_url('', __FILE__)."/video-js/kg-video-js-skin.css' type='text/css' media='all' />\n";
			}
			echo "<script src='".plugins_url('', __FILE__)."/js/kg_video_embed.js' type='text/javascript' /></script>\n";
			echo "</head>\n<body>";
			echo do_shortcode( $shortcode );
			echo '</body></html>';
			exit;
		}
	}
}
add_action('template_redirect', 'kg_video_attachment_template');

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
	kg_rrmdir($uploads['path'].'/thumb_tmp'); //remove the whole tmp file directory
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
	
	if (isset($_POST['queue'])) { 
		$timestamp = wp_next_scheduled( 'kg_cleanup_queue' );
		wp_unschedule_event($timestamp, 'kg_cleanup_queue' );
		wp_schedule_single_event(time()+86400, 'kg_cleanup_queue');
	}
	
	die(); // this is required to return a proper result
}
add_action('wp_ajax_kg_schedule_cleanup_generated_files', 'kg_schedule_cleanup_generated_files');

function kg_callffmpeg() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	global $wpdb;

	$options = get_option('kg_video_embed_options');
	$ffmpegPath = $options['app_path']."/".$options['video_app'];
	$uploads = wp_upload_dir();
	if (isset($_POST['encode1080'])) { $encode_checked['1080'] = $_POST['encode1080']; }
	if (isset($_POST['encode720'])) { $encode_checked['720'] = $_POST['encode720']; }
	if (isset($_POST['encodemobile'])) { $encode_checked['mobile'] = $_POST['encodemobile']; }
	if (isset($_POST['encodeogg'])) { $encode_checked['ogg'] = $_POST['encodeogg']; }
	if (isset($_POST['encodewebm'])) { $encode_checked['webm'] = $_POST['encodewebm']; }
	if (isset($_POST['movieurl'])) { $movieurl = esc_url_raw($_POST['movieurl']); }
	if (isset($_POST['numberofthumbs'])) { $numberofthumbs = $_POST['numberofthumbs']; }
	if (isset($_POST['thumbnumber'])) { $i = $_POST['thumbnumber']; }
	if (isset($_POST['thumbnumberplusincreaser'])) { $iincreaser = $_POST['thumbnumberplusincreaser']; }
	if (isset($_POST['ffmpeg_action'])) { $action = $_POST['ffmpeg_action']; }
	if (isset($_POST['poster'])) { $poster = $_POST['poster']; }
	if (isset($_POST['attachmentID'])) { $postID = $_POST['attachmentID']; }
	if (isset($_POST['thumbtimecode'])) { $thumbtimecode = $_POST['thumbtimecode']; }
	if (isset($_POST['dofirstframe'])) { $dofirstframe = $_POST['dofirstframe']; }
	if (isset($_POST['generate_button'])) { $generate_button = $_POST['generate_button']; }
	
	if ($postID != "singleurl") { $moviefilepath = get_attached_file($postID); }
	else { 
		$moviefilepath = str_replace(" ", "%20", $movieurl);
		$moviefilepath = str_replace("https://", "http://",  $moviefilepath);
	}
	
	$movie_extension = pathinfo(parse_url($movieurl, PHP_URL_PATH), PATHINFO_EXTENSION);
	$moviefilebasename = basename($movieurl,'.'.$movie_extension);
	$thumbnailfilebase = $uploads['url']."/thumb_tmp/".$moviefilebasename;
	
	if ($action == "generate" || $action == "encode" || $action == "enqueue" ) {
	
		if ( $options['ffmpeg_exists'] == true ) { //if FFMPEG is installed
	
			$movie_info = kg_get_video_dimensions($moviefilepath);
	
			if ($movie_info['worked'] == true) { //if FFMPEG was able to open the file
	
				$movie_duration_hours = intval(substr($movie_info['duration'], -11, 2));
				$movie_duration_minutes = intval(substr($movie_info['duration'], -8, 2));
				$movie_duration_seconds = intval(substr($movie_info['duration'], -5, 2));
				$movie_duration_seconds = ($movie_duration_hours * 60 * 60) + ($movie_duration_minutes * 60) + $movie_duration_seconds;
				$movie_width = $movie_info['width'];
				$movie_height = $movie_info['height'];
	
				switch ($movie_info['rotate']) {
					case "90": $movie_rotate = '-vf "transpose=1"'; break;
					case "180": $movie_rotate = '-vf "hflip,vflip"'; break;
					case "270": $movie_rotate = '-vf "transpose=2"'; break;
					default: $movie_rotate = ""; break;
				}
	
				if ($action == "generate") {
	
					if (!file_exists($uploads['path'].'/thumb_tmp')) { mkdir($uploads['path'].'/thumb_tmp'); }
	
					$thumbnailheight = strval(round(floatval($movie_height) / floatval($movie_width) * 200));
	
					switch ($movie_info['rotate']) { //if it's a sideways mobile video
						case "90";
						case "270": $thumbnailheight = strval(round(floatval($movie_width) / floatval($movie_height) * 200));
					}
	
					$jpgpath = $uploads['path']."/thumb_tmp/";
					
					$movieoffset = round(($movie_duration_seconds * $iincreaser) / ($numberofthumbs * 2));
	
					if ($generate_button == "random") { //adjust offset random amount
						$movieoffset = $movieoffset - rand(0, round($movie_duration_seconds / $numberofthumbs));
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
	
					$thumbnailfilename[$i] = $jpgpath.$moviefilebasename."_thumb".$i.".jpg";
					$thumbnailfilename[$i] = str_replace(" ", "_", $thumbnailfilename[$i]);
					$ffmpeg_options = '-y -ss '.$movieoffset.' -i "'.$moviefilepath.'" '.$movie_rotate.' -vframes 1 "'.$thumbnailfilename[$i].'"';
					$thumbnailurl = $thumbnailfilebase."_thumb".$i.'.jpg';
					$thumbnailurl = str_replace(" ", "_", $thumbnailurl);
	
					exec($ffmpegPath." ".$ffmpeg_options);
	
					if (floatval($movieoffset) > 60) {
						$movieoffset_minutes = sprintf("%02s", intval(intval($movieoffset) / 60) );
						$movieoffset_seconds = sprintf("%02s", round(fmod( floatval($movieoffset), 60), 2) );
						$movieoffset_display = $movieoffset_minutes.":".$movieoffset_seconds;
					}
					else { $movieoffset_display = "00:".sprintf("%02s", $movieoffset); }
	
					$thumbnaildisplaycode = '<div class="kg_thumbnail_select" name="attachments_'.$postID.'_thumb'.$i.'" id="attachments_'.$postID.'_thumb'.$i.'"><label for="kgflashmedia_'.$postID.'_thumb'.$i.'"><img src="'.$thumbnailurl.'?'.rand().'" width="200" height="'.$thumbnailheight.'" class="kg_thumbnail"></label><br /><input type="radio" name="kgflashmedia-thumb" id="kgflashmedia_'.$postID.'_thumb'.$i.'" value="'.str_replace('/thumb_tmp/', '/', $thumbnailurl).'" onchange="getElementById(\'attachments-'. $postID .'-kgflashmediaplayer-poster\').value = this.value; getElementById(\'attachments-'. $postID .'-thumbtime\').value = \''. $movieoffset_display .'\'; getElementById(\'attachments_'. $postID .'_numberofthumbs\').value =\'1\';"></div>';
	
					switch ($movie_info['rotate']) {
						case "90";
						case "270": $movie_width ^= $movie_height ^= $movie_width ^= $movie_height; break; //swap height & width
					}
	
					$i++;
	
					$arr = array ( "thumbnaildisplaycode"=>$thumbnaildisplaycode, "movie_width"=>$movie_width, "movie_height"=>$movie_height, "lastthumbnumber"=>$i, "movieoffset"=>$movieoffset );
	
					echo json_encode($arr);
				}//if generate
	
				if ($action == "enqueue") {
	
					$embed_display = "";
					$start_encoding = false;
					$encode_these = array();
					$encode_list = array();
					$embeddable = array("flv", "f4v", "mp4", "mov", "m4v", "ogv", "ogg", "webm");
					$h264extensions = array("mp4", "m4v");
					$video_formats = kg_video_formats();
	
					$encodevideo_info = kg_encodevideo_info($movieurl, $postID);
					
					foreach ( $video_formats as $format => $format_stats ) {
						if ( $encode_checked[$format] == "true" ) {
							if ( !$encodevideo_info[$format.'_exists'] || ($encodevideo_info['sameserver'] && filesize($encodevideo_info[$format.'filepath']) < 24576) ) { 
								if ( ($format == "1080" && $movie_height <= 1080) || ($format == "720" && $movie_height <= 720) ) {  
									if ( in_array($movie_extension, $h264extensions) || $movie_height < intval($format) ) {
										$encode_formats[$format]['status'] = "lowres";
									} //skip if the resolution of an existing video is lower than the HD format
								}
								else { 
									$encode_formats[$format]['status'] = "queued"; 
									$encode_formats[$format]['name'] = $format_stats['name'];
									$encode_list[$format] = $format_stats['name'];
								}
							} // if video doesn't already exist
							else { $encode_formats[$format]['status'] = "encoded"; }
						} // if user wants to encode format
						else { $encode_formats[$format]['status'] = "notchecked"; }
					}
	
					if ( !empty($encode_list) ) {
						$video_embed_queue = get_option('kg_video_embed_queue');
						$queue_entry = array (
							'attachmentID'=>$postID,
							'movieurl' => $movieurl,
							'encode_formats'=> $encode_formats,
							'movie_info' => $movie_info
						);
						if ( !empty($video_embed_queue ) ) {
							foreach ($video_embed_queue as $index => $entry) {
								if ( $entry['movieurl'] == $movieurl ) { 
									$already_queued = $index; 
									foreach ( $entry['encode_formats'] as $format => $value ) {
										if ( $value['status'] == "queued" && array_key_exists($format, $encode_list) ) { unset($encode_list[$format]); }
										//if ( $value['status'] == "encoding" ) { $queue_entry['encode_formats'][$format] = $video_embed_queue[$already_queued][$format]; }
									}
								}
								else { $already_queued = false; }
							}
						}
						else { $already_queued = false; }
						
						if ( $already_queued !== false ) { 
							$video_embed_queue[$already_queued] = $queue_entry;
							update_option('kg_video_embed_queue', $video_embed_queue);
							if ( !empty($encode_list) ) { $embed_display = "<strong>".implode(", " , $encode_list)." updated in existing queue entry in position ".strval(intval($already_queued)+1).".</strong>"; }
							else { $embed_display = "<strong>Video is already queued in position ".strval(intval($already_queued)+1).".</strong>"; }
						}
						else { 
							$video_embed_queue[] = $queue_entry;
							update_option('kg_video_embed_queue', $video_embed_queue);
							$queue_position = intval(key( array_slice( $video_embed_queue, -1, 1, TRUE ) ));
							if ( $queue_position == 0 ) { $embed_display = "<strong>Starting ".strtoupper($options['video_app'])."... </strong>"; }
							else { $embed_display = "<strong>".implode(", " , $encode_list)." added to queue in position ".strval(intval($queue_position)+1).".</strong>";
							}
						}
						
					} //if any video formats don't already exist, add to queue
					else { $embed_display = "<strong>All selected formats already exist.</strong>"; }
					
					$replaceoptions = "";
					$originalselect = "";
					if ( in_array($movie_extension, $embeddable) ) { $originalselect = '<option value="'.$movieurl.'">original</option>'; }
					foreach($video_formats as $format => $format_stats) {
						if ($encodevideo_info[$format.'_exists']) { $replaceoptions .= '<option value="'.$encodevideo_info[$format.'url'].'">'.$format_stats['name'].'</option>'; }
					}
	
					//$altembedselect = '<span class="kg_embedselect">Embed <select name="attachments['.$postID.'][kgflashmediaplayer-altembed]" id="attachments['.$postID.'][kgflashmediaplayer-altembed]">'.$originalselect.$replaceoptions.'</select></span>';
	
					$arr = array ( "embed_display"=>$embed_display, "altembedselect"=>$altembedselect );
					echo json_encode($arr);
					
				}//if enqueue
				
			}//if ffmpeg can open movie
	
			else { $thumbnaildisplaycode = "<strong>Can't open movie file.</strong><br />".$movie_info['output'];
				$arr = array ( "thumbnaildisplaycode"=>$thumbnaildisplaycode, "embed_display"=>$thumbnaildisplaycode, "lastthumbnumber"=>"break" );
				echo json_encode($arr);
			} //can't open movie
	
		}//if ffmpeg exists
	
		else { $thumbnaildisplaycode = '<strong>Error: '.strtoupper($options["video_app"]).' not found. Verify that '.strtoupper($options["video_app"]).' is installed at '.strtoupper($options["app_path"]).' and check the <a href="options-general.php?page=video-embed-thumbnail-generator.php">application path plugin setting</a>.</strong>' ; 
			$arr = array ( "thumbnaildisplaycode"=>$thumbnaildisplaycode, "embed_display"=>$thumbnaildisplaycode, "lastthumbnumber"=>"break" );
			echo json_encode($arr);
		} //no ffmpeg
	
	
	}// if encoding or generating
	
	if ($action == "delete") { 
	
		if ($poster) { 
			$posterfile = pathinfo($poster, PATHINFO_BASENAME);
			$posterpath = $uploads['path'].'/'.$posterfile;
			if ( file_exists($posterpath) ) { unlink($posterpath); }
		}
		rrmdir($uploads['path'].'/thumb_tmp');
		$thumbnaildisplaycode = "<strong>Thumbnails Deleted</strong>";
		$arr = array ( "thumbnaildisplaycode"=>$thumbnaildisplaycode );
		echo json_encode($arr);
	
	}//if delete
	
	
	if ($action == "submit") { 
	
		$posterfile = pathinfo($poster, PATHINFO_BASENAME);
		$tmp_posterpath = $uploads['path'].'/thumb_tmp/'.$posterfile;
				if ( !is_file($uploads['path'].'/'.$posterfile) ) {
			if ( is_file($tmp_posterpath) ) { 
				copy($tmp_posterpath, $uploads['path'].'/'.$posterfile);
				$thumb_base = substr($tmp_posterpath, 0, -5);
				foreach (glob($thumb_base."?.jpg") as $thumbfilename) {
				   unlink($thumbfilename);
				}
			}
	
			if ( kg_is_empty_dir($uploads["path"].'/thumb_tmp') ) { rrmdir($uploads["path"].'/thumb_tmp'); }
		}
	
		//$arr = array ( "posterfile"=>$posterfile, "tmp_posterpath"=>$tmp_posterpath, "final_posterpath"=>$final_posterpath );
		//echo json_encode($arr);
	
	}//if submit
	 
	die(); // this is required to return a proper result
}
add_action('wp_ajax_kg_callffmpeg', 'kg_callffmpeg');

function kg_encode_videos() {

	$embed_display = "";
	$video = "";
	$video_key = "";
	$queued_format = "";
	$encoding = "";
	$video_embed_queue = get_option('kg_video_embed_queue');
	$video_formats = kg_video_formats();

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
	
			$options = get_option('kg_video_embed_options');
	
			$ffmpegPath = $options['app_path']."/".$options['video_app'];
			if ($video['attachmentID'] != "singleurl") { $moviefilepath = get_attached_file($video['attachmentID']); }
			else { 
				$moviefilepath = str_replace(" ", "%20", esc_url_raw($movieurl)); 
				$moviefilepath = str_replace("https://", "http://",  $moviefilepath);
			}
			
			
			$movie_info = $video['movie_info'];
			$encodevideo_info = kg_encodevideo_info($video['movieurl'], $video['attachmentID']);
			
			$logfile = "";
			$processPID = "";
			$serverOS = "";
			$ffmpeg_options = "";
	
			switch ($movie_info['rotate']) {
				case "90": $movie_rotate = '-vf "transpose=1"'; break;
				case "180": $movie_rotate = '-vf "hflip,vflip"'; break;
				case "270": $movie_rotate = '-vf "transpose=2"'; break;
				default: $movie_rotate = ""; break;
			}
		
			if ( ! file_exists($encodevideo_info['encodepath']) ) { mkdir($encodevideo_info['encodepath']); }
			
			if ( $options['video_app'] == "avconv" ) { 
				$video_bitrate_flag = "b:v";
				$audio_bitrate_flag = "b:a";
			}
			
			if ( $options['video_app'] == "ffmpeg" ) { 
				$video_bitrate_flag = "b";
				$audio_bitrate_flag = "ab";
			}
	
			if ( ($movie_info['configuration']['libfaac'] == "true" || $movie_info['configuration']['libvo_aacenc'] == "true" ) &&  $movie_info['configuration']['libx264'] == "true" ) {
				foreach( $video_formats as $format => $format_stats ) {
					if ( $queued_format == $format && $format_stats['type'] == "h264" ) {
						if ( ! $encodevideo_info[$format.'_exists'] || ($encodevideo_info['sameserver'] && filesize($encodevideo_info[$format.'filepath']) < 24576) ) {
			
							if ( intval($movie_info['width']) > $format_stats['width'] ) { $h264_movie_width = $format_stats['width']; }
							else { $h264_movie_width = $movie_info['width']; }
							$h264_movie_height = strval(round(floatval($movie_info['height']) / floatval($movie_info['width']) * $h264_movie_width));
							if ( intval($h264_movie_height) > $format_stats['height'] ) { $h264_movie_height = $format_stats['height']; }
							$h264_movie_width = strval(round(floatval($movie_info['width']) / floatval($movie_info['height']) * $h264_movie_height));
							
							if ($h264_movie_height % 2 != 0) { $h264_movie_height++; } //if it's odd, increase by 1 to make sure it's an even number
							if ($h264_movie_width % 2 != 0) { $h264_movie_width--; } //if it's odd, increase by 1 to make sure it's an even number
			
							if ( $movie_info['configuration']['libvo_aacenc'] == "true" ) { $aaclib = "libvo_aacenc"; }
							else { $aaclib = "libfaac"; }
		
							$h264bitrate = round($h264_movie_height * 2.75);
							$vpre_flags = "";
							if ( $options['ffmpeg_vpre'] == 'true' ) { $vpre_flags = '-vpre slow -vpre ipod640'; }
							
							/* $faststart = "";
							$faststart_app = get_option('wp_FMP_faststart');
							if ( $faststart_app = 'qt-faststart' ) {
								$faststart_tmp_file = str_replace('.m4v' '-faststart.m4v', $encodevideo_info['mobilefilepath']);
								$faststart = ' && '.get_option("wp_FMP_ffmpeg").'/'.$faststart_app.' '.$encodevideo_info["mobilefilepath"].' '.$faststart_tmp_file.' && rm '.$encodevideo_info["mobilefilepath"].' && mv '.$faststart_tmp_file.' '.$encodevideo_info["mobilefilepath"];
							}
							if ( $faststart_app = 'MP4Box' ) {
								$faststart = ' && '.get_option("wp_FMP_ffmpeg").'/'.$faststart_app.' -inter 500 '.$encodevideo_info["mobilefilepath"];
							} */
		
							$ffmpeg_options = ' -acodec '.$aaclib.' -'.$audio_bitrate_flag.' 128k -s '.$h264_movie_width.'x'.$h264_movie_height.' -vcodec libx264 '.$vpre_flags.' -threads 1 '.$movie_rotate.' -'.$video_bitrate_flag.' '.$h264bitrate.'k -bt 800k -f ipod "'.$encodevideo_info[$format.'filepath'].'"';
							$embed_display .= "<strong>Encoding ".$format_stats['name']."</strong>";
						}//if file doesn't already exist
						else { $embed_display .= "<strong>".$format_stats['name']." already encoded. </strong>"; }
						break; //don't bother looping through the rest if we already found the format
					}//if format is chosen for encoding
				}//H.264 loop
			}//if the x264 & AAC libraries are enabled
			else {
				$missing_libraries = "";
				if($movie_info['configuration']['libfaac'] == 'false') { $missing_libraries .= 'libfaac '; }
				if($movie_info['configuration']['libvo_aacenc'] == 'false') { $missing_libraries .= 'libvo-aacenc '; }
				if($movie_info['configuration']['libfaac'] == 'false') { $missing_libraries .= 'libx264 '; }
				$embed_display .= "<strong>".strtoupper($options['video_app'])." missing library ".$missing_libraries."required for H.264/AAC encoding. </strong>"; 
			}
	
			if ( $queued_format == "webm" ) {
				if ( ! $encodevideo_info['webm_exists'] || ($encodevideo_info['sameserver'] && filesize($encodevideo_info['webmfilepath']) < 24576) ) {
					if ( $movie_info['configuration']['libvorbis'] == "true" && $movie_info['configuration']['libvpx'] == "true" ) {
						$webmbitrate = $movie_info['height'] * 3;
						$ffmpeg_options = ' -'.$audio_bitrate_flag.' 128k -'.$video_bitrate_flag.' '.$webmbitrate.'k '.$movie_rotate.' -threads 1 "'.$encodevideo_info['webmfilepath'].'"';
						$embed_display .= "<strong>Encoding WEBM. </strong>";
					}//if the necessary webm libraries are enabled
					else {
						$missing_libraries = "";
						if($movie_info['configuration']['libvorbis'] == 'false') { $missing_libraries .= 'libvorbis '; }
						if($movie_info['configuration']['libvpx'] == 'false') { $missing_libraries .= 'libvpx '; }
						$embed_display .= "<strong>".strtoupper($options['video_app'])." missing library ".$missing_libraries."required for WEBM encoding. </strong>"; 
					}
				}//if webm doesn't already exist
				else { $embed_display .= "<strong>WEBM Already Encoded. </strong>"; }
			}//if encodewebm is checked
	
			if ( $queued_format == "ogg" ) {
				if ( ! $encodevideo_info['ogg_exists'] || ($encodevideo_info['sameserver'] && filesize($encodevideo_info['oggfilepath']) < 24576) ) {
	
					if ( $movie_info['configuration']['libvorbis'] == "true" && $movie_info['configuration']['libtheora'] == "true" ) {
						$ogvbitrate = $movie_info['height'] * 3;
						$ffmpeg_options = ' -acodec libvorbis -'.$audio_bitrate_flag.' 128k -vcodec libtheora -'.$video_bitrate_flag.' '.$ogvbitrate.'k '.$movie_rotate.' -threads 1 "'.$encodevideo_info['oggfilepath'].'"';
						$embed_display .= "<strong>Encoding OGV. </strong>";
					}//if the necessary OGV libraries are enabled
					else {
						$missing_libraries = "";
						if($movie_info['configuration']['libvorbis'] == 'false') { $missing_libraries .= 'libvorbis '; }
						if($movie_info['configuration']['libvtheora'] == 'false') { $missing_libraries .= 'libtheora '; }
						$embed_display .= "<strong>".strtoupper($options['video_app'])." missing library ".$missing_libraries."required for OGV encoding. </strong>"; 
					}
				}//if ogv doesn't already exist
				else { $embed_display .= "<strong>OGV Already Encoded. </strong>"; }
			}//if encodeogg is checked
	
			if ( !empty($ffmpeg_options) ) {
	
				$ffmpeg_args = '-y -i "'.$moviefilepath.'" '.$ffmpeg_options;
				$logfile = $encodevideo_info['encodepath'].str_replace(" ", "_", $encodevideo_info['moviefilebasename'])."_".$queued_format."_".sprintf("%04s",mt_rand(1, 1000))."_encode.txt";
				
				$cmd = escapeshellcmd($ffmpegPath." ".$ffmpeg_args);
				$cmd = $cmd." > ".$logfile." 2>&1 & echo $!";
			
				$process = new kg_Process($cmd);
		
				sleep(1);
		
				$processPID = $process->getPid();
				$serverOS = $process->OS;
				//$encodevideo_info = kg_encodevideo_info($movieurl, $postID); //update after encoding starts

				$video['encode_formats'][$queued_format] = array (
					'name' => $video_formats[$queued_format]['name'],
					'status' => 'encoding',
					'filepath' => $encodevideo_info[$queued_format.'filepath'],
					'logfile' => $logfile,
					'PID' => $processPID,
					'OS' => $serverOS,
					'started' => time()
				);

				$queue_entry = array (
					'attachmentID'=> $video['attachmentID'],
					'movieurl' => $video['movieurl'],
					'encode_formats'=> $video['encode_formats'],
					'movie_info' => $video['movie_info']
				);

				$video_embed_queue[$video_key] = $queue_entry;

				//$encoding = $video['encode_formats'][$queued_format];
	
				//$embed_display .= " <em><small>".$cmd."</small></em>";
				
			} //end if there's stuff to encode

			//$output_map = array_map(create_function('$key, $value', 'return $key.":".$value." # ";'), array_keys($process->output), array_values($process->output));
			//$output_implode = implode($output_map);
			//$embed_display .= "Command: ".$cmd." Output: ".$output_implode;

			update_option('kg_video_embed_queue', $video_embed_queue);
			kg_encode_progress($video_key, $queued_format);

		} //if there's a format to encode
		
	} //if there's a queue
	
	$arr = array ( "embed_display"=>$embed_display, "video_key"=>$video_key, "format"=>$queued_format );
	return $arr;

}

function kg_ajax_encode_videos() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	global $wpdb;
	$arr = kg_encode_videos();
	echo json_encode($arr);
	die();
	
}
add_action('wp_ajax_kg_ajax_encode_videos', 'kg_ajax_encode_videos');

function kg_encode_progress($video_key, $format) {

		$video_embed_queue = get_option('kg_video_embed_queue');
		
		$pid = $video_embed_queue[$video_key]['encode_formats'][$format]['PID'];
		$logfile = $video_embed_queue[$video_key]['encode_formats'][$format]['logfile'];
		$started = $video_embed_queue[$video_key]['encode_formats'][$format]['started'];
		//$name = $video_embed_queue[$video_key]['encode_formats'][$format]['name'];
		$movie_duration = $video_embed_queue[$video_key]['movie_info']['duration'];
		$embed_display = "";
		$percent_done = "";
		$time_remaining = "";
		$other_message = "";
		$logfilecontents = "";
		$lastline = "";
	
		if ( is_file($logfile) ) {
	
			//$logfilecontents = file_get_contents($logfile);
			$fp = fopen($logfile, 'r');
			//fclose($fp);
			//$lastlines = kg_explodeX(array("\r","\n"), $logfilecontents);
			//$lastlines_output = print_r($lastlines, true);
			//$lastline = end($lastlines);
			//if ( $lastline == "" ) { $lastline = prev($lastlines); }
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
		
			preg_match('/time=(.*?) /', $lastline, $time_matches);
		
			if ( array_key_exists(1, $time_matches) != true ) {
				preg_match('/video:(.*?) /', $lastline, $video_matches);
				preg_match('/libx264 (.*?) /', $lastline, $libx264_matches);
			}
		
			if ( array_key_exists(1, $time_matches) == true ) { //still encoding
				
				if ( strpos($time_matches[1], ':') !== false ) {
					$current_hours = intval(substr($time_matches[1], -11, 2));
					$current_minutes = intval(substr($time_matches[1], -8, 2));
					$current_seconds = intval(substr($time_matches[1], -5, 2));
					$current_seconds = ($current_hours * 60 * 60) + ($current_minutes * 60) + $current_seconds;
				}
				else { $current_seconds = $time_matches[1]; }
				
				$duration_hours = intval(substr($movie_duration, -11, 2));
				$duration_minutes = intval(substr($movie_duration, -8, 2));
				$duration_seconds = intval(substr($movie_duration, -5, 2));
				$movie_duration = ($duration_hours * 60 * 60) + ($duration_minutes * 60) + $duration_seconds;
	
				$percent_done = intval($current_seconds)/intval($movie_duration);
				$time_elapsed = time() - $started;
				if ( $percent_done != 0 ) { $time_remaining = date('H:i:s', round($time_elapsed / $percent_done) - $time_elapsed); }
				else $time_remaining = "unknown";
				$percent_done = round($percent_done*100);
		
				preg_match('/fps=\s+(.*?) /', $lastline, $fps_matches);
				if ( array_key_exists(1, $fps_matches) == true ) { 
					if ( $fps_matches[1] != 0 ) { $fps_match = $fps_matches[1]; }
					else {  $fps_match = "10"; }
				}
				else {  $fps_match = "10"; }
				$time_to_wait = strval(max(round(30000/intval($fps_match)), 1000)); //wait at least 1 second
				
				$args = array($video_key, $format);
				wp_schedule_single_event(time()+60, 'kg_cron_queue_check', $args);
				
				$embed_display = '<strong>'.$video_embed_queue[$video_key]['encode_formats'][$format]['name'].' Encoding</strong> <div class="meter"><span style="width:'.$percent_done.'%;">'.$percent_done.'%</span></div><div class="kg_cancel_button"><input type="button" id="'.$video_key.'_cancelencode" class="button-secondary" value="Cancel" name="'.$video_key.'_cancelencode" onclick="kg_cancel_encode('.$pid.', \''.$video_embed_queue[$video_key]["attachmentID"].'\');"></div><div style="display:block;"><small>Elapsed: '.date('H:i:s',$time_elapsed).'. Estimated Remaining: '.$time_remaining.'. FPS:'.$fps_match.'</small></div><script type="text/javascript">percent_timeout = setTimeout(function(){kg_check_encode_progress("'.$video_key.'", "'.$format.'")}, '.$time_to_wait.');</script>';
			}
			elseif ( array_key_exists(1, $video_matches) == true || array_key_exists(1, $libx264_matches) == true ) { //encoding complete
				$percent_done = 100;
				$ended = filemtime($logfile);
				$time_elapsed = $ended - $started;
				$time_remaining = "0";
				$fps_match = "10";				
				if ( array_key_exists(1, $libx264_matches) ) { kg_fix_moov_atom($video_key, $format); } //fix the moov atom if the file was encoded by libx264
				$video_embed_queue[$video_key]['encode_formats'][$format]['status'] = "encoded";
				$video_embed_queue[$video_key]['encode_formats'][$format]['ended'] = $ended;
				$video_embed_queue[$video_key]['encode_formats'][$format]['lastline'] = $lastline;
				update_option('kg_video_embed_queue', $video_embed_queue);
				if ( file_exists($logfile) ) { unlink($logfile); }
				$embed_display = '<strong>'.$video_embed_queue[$video_key]['encode_formats'][$format]['name'].' Encoded</strong>';
				$next_video = kg_encode_videos(); //start the next queued video
				if ( !empty($next_video['format']) ) {
					$embed_display .= '<script type="text/javascript">percent_timeout = setTimeout(function(){kg_check_encode_progress("'.$next_video['video_key'].'", "'.$next_video['format'].'")}, 1000);</script>';
				}
			}
			else { //there was an error";
				$video_embed_queue[$video_key]['encode_formats'][$format]['status'] = "error";
				$video_embed_queue[$video_key]['encode_formats'][$format]['lastline'] = $lastline;
				update_option('kg_video_embed_queue', $video_embed_queue);
				if ( file_exists($logfile) ) { unlink($logfile); }
				$other_message = $lastline;
				$embed_display = "<strong style='color:red'>Error: </strong>".$lastline;
				$next_video = kg_encode_videos(); //start the next queued video
				if ( !empty($next_video['format']) ) {
					$embed_display .= '<script type="text/javascript">percent_timeout = setTimeout(function(){kg_check_encode_progress("'.$next_video['video_key'].'", "'.$next_video['format'].'")}, 1000);</script>';
				}
			}
		
			//$embed_display .= $lastline;
			$arr = array ( "embed_display"=>$embed_display );
		}
		else { $arr = array ( "embed_display"=>"Encoding Failed" ); }

	return $arr;

}
add_action('kg_cron_queue_check', 'kg_encode_progress', 1, 2);

function kg_ajax_encode_progress() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	$video_key = $_POST['video_key'];
	$format = $_POST['format'];
	global $wpdb;
	$progress = kg_encode_progress($video_key, $format);
	echo json_encode($progress);
	die();
	
}
add_action('wp_ajax_kg_encode_progress', 'kg_ajax_encode_progress');

function kg_clear_completed_queue() {

	$video_embed_queue = get_option('kg_video_embed_queue');
	
	if ( !empty($video_embed_queue) ) {
	
		$keep = array();
		$cleared_video_queue = array();

		foreach ( $video_embed_queue as $video_key => $queue_entry ) {
			if ( !empty($queue_entry['formats']) ) {
				foreach ( $queue_entry['formats'] as $format => $value ) {
					if ( $value['status'] == "queued" || $value['status'] == "encoding" ) {
						$keep[$video_key] = true;
						break;
					}
				}
			}
		}
		
		foreach ( $keep as $video_key => $value ) {
			$cleared_video_queue[] = $video_embed_queue[$video_key];
		}
		sort($cleared_video_queue);

		update_option('kg_video_embed_queue', $cleared_video_queue);
	
	}
}
add_action('kg_cleanup_queue','kg_clear_completed_queue');

function kg_ajax_clear_completed_queue() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	global $wpdb;
	kg_clear_completed_queue();
	$table = kg_generate_queue_table();	
	echo json_encode($table);
	die();
	
}
add_action('wp_ajax_kg_clear_completed_queue', 'kg_ajax_clear_completed_queue');

function kg_ajax_clear_queue_entry() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	global $wpdb;
	$video_key = $_POST['index'];
	$video_embed_queue = get_option('kg_video_embed_queue');
	if ( array_key_exists($video_key, $video_embed_queue) ) { 
		unset($video_embed_queue[$video_key]);
		sort($video_embed_queue);
	}
	update_option('kg_video_embed_queue', $video_embed_queue);
	$table = kg_generate_queue_table();	
	echo json_encode($table);
	die();
	
}
add_action('wp_ajax_kg_clear_queue_entry', 'kg_ajax_clear_queue_entry');

function kg_fix_moov_atom($video_key, $format) {

	$options = get_option('kg_video_embed_options');
	
	if ( $options['moov'] != "none" ) {
	
		$video_embed_queue = get_option('kg_video_embed_queue');
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
		
		//$video_embed_queue[$video_key][$format]['status'] = "moov_fixed";
		//update_option('kg_video_embed_options');
			
	}//if there is an application selected for fixing moov atoms on libx264-encoded files.

}

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
    wp_enqueue_script( 'video_embed_thumbnail_generator_script', plugins_url('/js/kg_video_plugin_admin.js', __FILE__) );
    wp_enqueue_style( 'kg_progressbar_style', plugins_url('/css/video-embed-thumbnail-generator_admin.css', __FILE__) );
    wp_enqueue_script( 'jquery-ui-sortable' );
}
add_action('admin_enqueue_scripts', 'enqueue_kg_script');

add_action( 'wp_ajax_kg_count_play', 'kg_count_play' ); // ajax for logged in users
add_action( 'wp_ajax_nopriv_kg_count_play', 'kg_count_play' ); // ajax for not logged in users

function kg_count_play() {
	$post_id = $_POST['post_id'];
	$plays = $_POST['video_plays'];
	$complete_views = $_POST['complete_views'];
	// doing ajax stuff
	update_post_meta($post_id, '_kgflashmediaplayer-starts', $plays);
	update_post_meta($post_id, '_kgflashmediaplayer-completeviews', $complete_views);
	echo 'ajax submitted';
	die(); // stop executing script
}

?>