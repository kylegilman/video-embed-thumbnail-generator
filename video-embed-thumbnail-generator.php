<?php
/*
Plugin Name: Video Embed & Thumbnail Generator
Plugin URI: http://www.kylegilman.net/2011/01/18/video-embed-thumbnail-generator-wordpress-plugin/
Description: Generate video thumbnails, HTML5-compliant videos, and video embed shortcodes. Some functions require FFMPEG.
Version: 0.2.1
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

1) Includes Jeroen Wijering's FLV Media Player (Creative Commons "BY-NC-SA" License) v5.1
   Website: http://www.jeroenwijering.com/?item=JW_FLV_Player
   License: http://creativecommons.org/licenses/by-nc-sa/2.0/
2) Includes Geoff Stearns' SWFObject Javascript Library (MIT License) v2.1
   Website: http://code.google.com/p/swfobject/
   License: http://www.opensource.org/licenses/mit-license.php
3) Includes code adapted from Joshua Eldridge's Flash Media Player Plugin
   Website: http://www.mac-dev.net/
4) Includes code adapted from Gary Cao's Make Shortcodes User-Friendly tutorial
   Website: http://www.wphardcore.com/2010/how-to-make-shortcodes-user-friendly/
*/

if ( ! defined( 'ABSPATH' ) )
	die( "Can't load this file directly" );


function url_exists($url) {
    $hdrs = @get_headers($url);
    return is_array($hdrs) ? preg_match('/^HTTP\\/\\d+\\.\\d+\\s+2\\d\\d\\s+.*$/',$hdrs[0]) : false;
}


class KGvideoplayer
{
	function __construct() {
		add_action( 'admin_init', array( $this, 'kg_action_admin_init' ) );
	}
	
	function kg_action_admin_init() {
		// only hook up these filters if we're in the admin panel, and the current user has permission
		// to edit posts and pages
		if ( current_user_can( 'edit_posts' ) && current_user_can( 'edit_pages' ) ) {
			add_filter( 'mce_buttons', array( $this, 'filter_mce_button' ) );
			add_filter( 'mce_external_plugins', array( $this, 'filter_mce_plugin' ) );
		}
	}
	
	function filter_mce_button( $buttons ) {
		// add a separation before our button, here our button's id is "kgvideoplayer_button"
		array_push( $buttons, '|', 'kgvideoplayer_button' );
		return $buttons;
	}
	
	function filter_mce_plugin( $plugins ) {
		// this plugin file will work the magic of our button
		$plugins['kgvideoplayer'] = plugin_dir_url( __FILE__ ) . 'kg_video_plugin.js';
		return $plugins;
	}
}

$kgvideoplayer = new KGvideoplayer();


class uagent_info
{
   //Stores some info about the browser and device.
   var $useragent = "";

   //Stores info about what content formats the browser can display.
   var $httpaccept = ""; 

   // Standardized (and configurable) values for true and false.
   var $true = 1;
   var $false = 0;

   // A long list of strings which provide clues 
   //   about devices and capabilities.
   var $deviceAndroid = 'android';


   //**************************
   //The constructor. Initializes several default variables.
   function uagent_info()
   { 
       $this->useragent = strtolower($_SERVER['HTTP_USER_AGENT']);
       $this->httpaccept = strtolower($_SERVER['HTTP_ACCEPT']);
   }

   //**************************
   //Returns the contents of the User Agent value, in lower case.
   function Get_Uagent()
   { 
       return $this->useragent;
   }

   function DetectAndroid()
   {
      if (stripos($this->useragent, $this->deviceAndroid) > -1)
         return $this->true; 
      else
         return $this->false; 
   }

}

define("wp_FMP_swfobject_default", "true", true);
define("wp_FMP_flashplayer_default", "<strong>Please upgrade Flash Player</strong> This content is shown when the user does not have a correct Flash Player version installed.", true);
define("wp_FMP_default_width", "480", true);
define("wp_FMP_default_height", "360", true);
define("wp_FMP_default_HTML5", "true", true);
define("wp_FMP_default_controlbar_style", "docked", true);
define("wp_FMP_default_poster", "", true);
define("wp_FMP_default_autohide", "true", true);
define("wp_FMP_default_autoplay", "false", true);
define("wp_FMP_default_loop", "false", true);
define("wp_FMP_default_playbutton", "true", true);
define("wp_FMP_default_http_streaming", "false", true);
define("wp_FMP_default_stream_type", "liveOrRecorded", true);
define("wp_FMP_default_scale_mode", "letterbox", true);
define("wp_FMP_default_bgcolor", "", true);
define("wp_FMP_default_configuration", "", true);
define("wp_FMP_default_skin", "", true);
define("wp_FMP_default_ffmpeg", "/usr/local/bin", true);

add_option(wp_FMP_swfobject, wp_FMP_swfobject_default, 'Embed SWFObject');
add_option(wp_FMP_flashplayer, wp_FMP_flashplayer_default, 'Flash Player not installed message');
add_option(wp_FMP_width, wp_FMP_default_width, 'Default video width');
add_option(wp_FMP_height, wp_FMP_default_height, 'Default video height');
add_option(wp_FMP_HTML5, wp_FMP_default_HTML5, 'HTML5 video fallback');
add_option(wp_FMP_controlbar_style, wp_FMP_default_controlbar_style, 'Default controlbar style');
add_option(wp_FMP_poster, wp_FMP_default_poster, 'Default poster image');
add_option(wp_FMP_autohide, wp_FMP_default_autohide, 'Default autohide behavior');
add_option(wp_FMP_autoplay, wp_FMP_default_autoplay, 'Default autoplay behavior');
add_option(wp_FMP_loop, wp_FMP_default_loop, 'Default loop behavior');
add_option(wp_FMP_playbutton, wp_FMP_default_playbutton, 'Default play button overlay behavior');
add_option(wp_FMP_http_streaming, wp_FMP_default_http_streaming, 'Default HTTP streaming behavior');
add_option(wp_FMP_stream_type, wp_FMP_default_stream_type, 'Default video type');
add_option(wp_FMP_scale_mode, wp_FMP_default_scale_mode, 'Default video scale mode');
add_option(wp_FMP_bgcolor, wp_FMP_default_bgcolor, 'Default video background color');
add_option(wp_FMP_configuration, wp_FMP_default_configuration, 'Default video configuration file');
add_option(wp_FMP_skin, wp_FMP_default_skin, 'Default video skin file');
add_option(wp_FMP_ffmpeg, wp_FMP_default_ffmpeg, 'Path to FFMPEG');

	function addSWFObject() {
		if(get_option(wp_FMP_swfobject) == "true") {
			echo "\n<script src=\"http://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js\" type=\"text/javascript\"></script>\n";
		}
	}


if (is_admin()) {
	add_action('wp_print_scripts','KG_FMP_JS_VARS');
	function KG_FMP_JS_VARS() {
		?>
<script type="text/javascript">
  var kg_width_option= <?php echo json_encode(get_option('wp_FMP_width')); ?>;
  var kg_height_option= <?php echo json_encode(get_option('wp_FMP_height')); ?>;
  var kg_ffmpeg_path= <?php echo json_encode(get_option('wp_FMP_ffmpeg')); ?>;
  var kg_plugin_dir= <?php echo json_encode(plugins_url("", __FILE__)); ?>;
  var kg_upload_dir= <?php echo json_encode(wp_upload_dir()); ?>;
</script>
		<?php
	}
}

	
	function FMP_shortcode($atts, $content = ''){
	
		// workaround for relative video URL (contributed by Lee Fernandes)
		if(substr($content, 0, 1) == '/') $content = get_bloginfo('url').$content;
	
		$query_atts = shortcode_atts(
						array('width' => get_option(wp_FMP_width), 
							  'height' => get_option(wp_FMP_height),
							  'controlbar' => get_option(wp_FMP_controlbar_style),
							  'autohide' => get_option(wp_FMP_autohide),
							  'poster' => get_option(wp_FMP_poster),
							  'playbutton' => get_option(wp_FMP_playbutton),
							  'loop' => get_option(wp_FMP_loop),
							  'autoplay' => get_option(wp_FMP_autoplay),
							  'streamtype' => get_option(wp_FMP_stream_type),
							  'scalemode' => get_option(wp_FMP_scale_mode),
							  'backgroundcolor' => get_option(wp_FMP_bgcolor),
							  'configuration' => get_option(wp_FMP_configuration),
							  'skin' => get_option(wp_FMP_skin)), $atts); 

		$div_suffix = substr(uniqid(rand(), true),0,4);

		if(get_option(wp_FMP_http_streaming) != "true") {
			$video_swf = "http://fpdownload.adobe.com/strobe/FlashMediaPlayback.swf";
			$minimum_flash = "10.0.0";
		} else {
			$video_swf = "http://fpdownload.adobe.com/strobe/FlashMediaPlayback_101.swf";
			$minimum_flash = "10.1.0";
		}
		
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
		
		$params = "{allowfullscreen:'true', allowscriptaccess:'always'}";
		
		if(get_option(wp_FMP_HTML5) == "true") {
			$uagent_obj = new uagent_info();
			$isAndroid = $uagent_obj->DetectAndroid(); //determine if we're running on an Android device
			$encodedpath = dirname($query_atts["poster"]);
			$moviefilebasename = pathinfo(trim($content), PATHINFO_FILENAME);
			$moviefilebasename = str_replace(" ", "_", $moviefilebasename);
			//$ipodurl = plugins_url('/encodes/'.$moviefilebasename.'-ipod.m4v', __FILE__);
			//$ogvurl = plugins_url('/encodes/'.$moviefilebasename.'.ogv', __FILE__);
			$ipodurl = $encodedpath."/".$moviefilebasename."-ipod.m4v";
			$ogvurl = $encodedpath."/".$moviefilebasename.".ogv";
			$code = "<div id=\"flashcontent".$div_suffix."\">";
			$code .= "<video ";
			if ($isAndroid) { $code .= "onclick='this.play();' "; }
			$code .= "controls='controls'";
				if($query_atts["poster"] != '' && !$isAndroid) {
					$code .= " poster='".$query_atts["poster"]."' ";
				}
				if($query_atts["poster"] != '' && $isAndroid) {
					$code .= " poster='".plugins_url('', __FILE__)."/images/androidthumb.php?src=".$query_atts["poster"]."' ";
				}
			$code .= " width='".$query_atts["width"]."' height='".$query_atts["height"]."'";
			$code .= ">\n";
			if (url_exists($ipodurl)) { 
				$code .= "<source src='".$ipodurl."'";
				if (!$isAndroid) {
					$code.= " type='video/mp4'";
				}
				$code .=">\n";
			}
			else { $code .= "<source src='".$content."' type='video/mp4'>\n"; }
			if (url_exists($ogvurl)) { $code .= "<source src='".$ogvurl."' type='video/ogg'>\n"; }
			$code .= "</video>\n";
			$code .= "</div>\n\n";
		} else {
			$code = "<div id=\"flashcontent".$div_suffix."\">".get_option(wp_FMP_flashplayer)."</div>\n\n";
		}
		
		$code .= "<script type=\"text/javascript\">\n\t";
		$code .= "swfobject.embedSWF('".$video_swf."', 'flashcontent".$div_suffix."', '".trim($query_atts['width'])."', '".trim($query_atts['height'])."', '".$minimum_flash."', '".plugins_url("", __FILE__)."/expressinstall.swf', $flashvars, $params)\n";
		
		$code .= "</script>\n";

		return $code;
	}

	
	function addFMPOptionsPage() {
		add_options_page('Video Embed & Thumbnail Generator', 'Video Embed & Thumbnail Generator', 8, basename(__FILE__), 'FMPOptionsPage');
	}	

	function FMPOptionsPage() {

		if (isset($_POST['wp_FMP_reset'])) {
			update_option(wp_FMP_swfobject, wp_FMP_swfobject_default);
			update_option(wp_FMP_HTML5, wp_FMP_default_HTML5);
			update_option(wp_FMP_width, wp_FMP_default_width);
			update_option(wp_FMP_height, wp_FMP_default_height);
			update_option(wp_FMP_flashplayer, wp_FMP_flashplayer_default);
			update_option(wp_FMP_controlbar_style, wp_FMP_default_controlbar_style);
			update_option(wp_FMP_poster, wp_FMP_default_poster);
			update_option(wp_FMP_autohide, wp_FMP_default_autohide);
			update_option(wp_FMP_autoplay, wp_FMP_default_autoplay);
			update_option(wp_FMP_loop, wp_FMP_default_loop);
			update_option(wp_FMP_playbutton, wp_FMP_default_playbutton);
			update_option(wp_FMP_http_streaming, wp_FMP_default_http_streaming);
			update_option(wp_FMP_stream_type, wp_FMP_default_stream_type);
			update_option(wp_FMP_scale_mode, wp_FMP_default_scale_mode);
			update_option(wp_FMP_bgcolor, wp_FMP_default_bgcolor);
			update_option(wp_FMP_configuration, wp_FMP_default_configuration);
			update_option(wp_FMP_skin, wp_FMP_default_skin);	
			update_option(wp_FMP_ffmpeg, wp_FMP_default_ffmpeg);			
			
			echo "<div class='updated'><p><strong>Flash Media Playback plugin reset to default settings</strong></p></div>";	
		}	
	
		if (isset($_POST['wp_FMP_update'])) {
			check_admin_referer();
			$use_swfobject = $_POST[wp_FMP_swfobject];
			$use_html5fallback = $_POST[wp_FMP_HTML5];
			$use_autohide = $_POST[wp_FMP_autohide];
			$use_autoplay = $_POST[wp_FMP_autoplay];
			$use_loop = $_POST[wp_FMP_loop];
			$use_playbutton = $_POST[wp_FMP_playbutton];
			$use_http_streaming = $_POST[wp_FMP_http_streaming];
			
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

			if ($use_http_streaming == 'use') {
				update_option(wp_FMP_http_streaming, "true");
			} else {
				update_option(wp_FMP_http_streaming, "false");
			}			
			
			update_option(wp_FMP_width, $_POST[wp_FMP_width]);
			update_option(wp_FMP_height, $_POST[wp_FMP_height]);
			update_option(wp_FMP_bgcolor, $_POST[wp_FMP_bgcolor]);
			update_option(wp_FMP_configuration, $_POST[wp_FMP_configuration]);
			update_option(wp_FMP_skin, $_POST[wp_FMP_skin]);
			update_option(wp_FMP_flashplayer, $_POST[wp_FMP_flashplayer]);
			update_option(wp_FMP_controlbar_style, $_POST[wp_FMP_controlbar_style]);
			update_option(wp_FMP_stream_type, $_POST[wp_FMP_stream_type]);
			update_option(wp_FMP_scale_mode, $_POST[wp_FMP_scale_mode]);
			update_option(wp_FMP_poster, $_POST[wp_FMP_poster]);
			update_option(wp_FMP_ffmpeg, $_POST[wp_FMP_ffmpeg]);
			
			echo "<div class='updated'><p><strong>Video Embed & Thumbnail Generator plugin settings updated</strong></p></div>";
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
								if(get_option(wp_FMP_swfobject) == "true") {
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
								if(get_option(wp_FMP_HTML5) == "true") {
									echo "checked";
								}
								echo " />\n";
							?>
							Uncheck if you don't want HTML5 video fallback.
						</td>
					</tr>
					<tr>
						<th scope="row" valign="top" align="left">
							<label>Enable HTTP Streaming or Flash Access 2.0:</label>
						</th>
						<td width="10"></td>
						<td>
							<?php
								echo "<input type='checkbox' name='wp_FMP_http_streaming' id='wp_FMP_http_streaming' value='use' ";
								if(get_option(wp_FMP_http_streaming) == "true") {
									echo "checked";
								}
								echo " />\n";
							?>
							Check to support HTTP Streaming or Flash Access 2.0 (requires Flash Player 10.1)
						</td>	
					</tr>					
					<tr>
						<th scope="row" valign="top" align="left">
							<label>Flash Player not installed message:</label>
						</th>
						<td width="10"></td>
						<td>
							<textarea name="wp_FMP_flashplayer" id="wp_FMP_flashplayer" rows="5" cols="50"><?php echo get_option(wp_FMP_flashplayer) ?></textarea><br />
							<em>This message will only be shown if HTML5 video fallback is disabled</em>
						</td>	
					</tr>
					<tr align="left">
						<th></th>
						<td></td>
						<td align="left"><br />
								<div style="align:left"><input name="wp_FMP_update" value="Save Changes" type="submit" />&nbsp;&nbsp;&nbsp;<input name="wp_FMP_reset" value="Reset defaults" type="submit" /></div>
						</td>
					</tr>					
					<tr>
						<th colspan="2"><h3>Default argument values</h3></th><td>
						</td>
					</tr>
					<tr>
						<th scope="row" valign="top" align="left">
							<label>Path to FFMPEG:</label>
						</th>
						<td width="10"></td>
						<td>
							<input name="wp_FMP_ffmpeg" id="wp_FMP_ffmpeg" type="text" value="<?php echo get_option(wp_FMP_ffmpeg) ?>" /><br />
							<em>Don't include trailing slash. Example: /usr/local/bin</em>
						</td>	
					</tr>
					<tr>
						<th scope="row" valign="top" align="left">
							<label>Default max video width:</label>
						</th>
						<td width="10"></td>
						<td>
							<input name="wp_FMP_width" id="wp_FMP_width" type="text" value="<?php echo get_option(wp_FMP_width) ?>" />
						</td>	
					</tr>
					<tr>
						<th scope="row" valign="top" align="left">
							<label>Default video height:</label>
						</th>
						<td width="10"></td>
						<td>
							<input name="wp_FMP_height" id="wp_FMP_height" type="text" value="<?php echo get_option(wp_FMP_height) ?>" />
						</td>	
					</tr>
					<tr>
						<th scope="row" valign="top" align="left">
							<label>Default background color:</label>
						</th>
						<td width="10"></td>
						<td>
							<input name="wp_FMP_bgcolor" id="wp_FMP_bgcolor" type="text" value="<?php echo get_option(wp_FMP_bgcolor) ?>" />
						</td>	
					</tr>
					<tr>
						<th scope="row" valign="top" align="left">
							<label>Default XML configuration file:</label>
						</th>
						<td width="10"></td>
						<td>
							<input name="wp_FMP_configuration" id="wp_FMP_configuration" type="text" size="50" value="<?php echo get_option(wp_FMP_configuration) ?>" />
						</td>	
					</tr>
					<tr>
						<th scope="row" valign="top" align="left">
							<label>Default video skin file:</label>
						</th>
						<td width="10"></td>
						<td>
							<input name="wp_FMP_skin" id="wp_FMP_skin" type="text" size="50" value="<?php echo get_option(wp_FMP_skin) ?>" />
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
									
									if(get_option(wp_FMP_stream_type) == "liveOrRecorded") {
										$liveOrRecorded = " selected=\"selected\"";
									}
									if(get_option(wp_FMP_stream_type) == "live") {
										$live = " selected=\"selected\"";
									}
									if(get_option(wp_FMP_stream_type) == "recorded") {
										$recorded = " selected=\"selected\"";
									}
									if(get_option(wp_FMP_stream_type) == "dvr") {
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
									
									if(get_option(wp_FMP_scale_mode) == "letterbox") {
										$letterbox = " selected=\"selected\"";
									}
									if(get_option(wp_FMP_scale_mode) == "none") {
										$none = " selected=\"selected\"";
									}
									if(get_option(wp_FMP_scale_mode) == "stretch") {
										$stretch = " selected=\"selected\"";
									}
									if(get_option(wp_FMP_scale_mode) == "zoom") {
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
							<label>Default controlbar style:</label>
						</th>
						<td width="10"></td>
						<td>
							<select name="wp_FMP_controlbar_style" id="wp_FMP_controlbar_style">
								<?php 
									$docked = "";
									$floating = "";
									$none = "";
									if(get_option(wp_FMP_controlbar_style) == "docked") {
										$docked = " selected=\"selected\"";
									}
									if(get_option(wp_FMP_controlbar_style) == "floating") {
										$floating = " selected=\"selected\"";
									}
									if(get_option(wp_FMP_controlbar_style) == "none") {
										$none = " selected=\"selected\"";
									}
								?>
								<option value="docked"<?php echo $docked ?>>docked</option>
								<option value="floating"<?php echo $floating ?>>floating</option>
								<option value="none"<?php echo $none ?>>none</option>
							</select>
						</td>	
					</tr>
					<tr>
						<th scope="row" valign="top" align="left">
							<label>Default poster image:</label>
						</th>
						<td width="10"></td>
						<td>
							<input type='text' name='wp_FMP_poster' id='wp_FMP_poster' size='50' value='<?php echo get_option(wp_FMP_poster) ?>' />
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
								if(get_option(wp_FMP_autohide) == "true") {
									echo "checked";
								}
								echo " />\n";
							?>
							Uncheck if you do not want controlbar to hide when video is playing
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
								if(get_option(wp_FMP_autoplay) == "true") {
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
								if(get_option(wp_FMP_loop) == "true") {
									echo "checked";
								}
								echo " />\n";
							?>
							Check if you want video to loop
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
								if(get_option(wp_FMP_playbutton) == "true") {
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
								<div style="align:left"><input name="wp_FMP_update" value="Save Changes" type="submit" />&nbsp;&nbsp;&nbsp;<input name="wp_FMP_reset" value="Reset defaults" type="submit" /></div><br />&nbsp;<br />
						</td>
					</tr>
				</table>
				
		</div>
	</form>

<?php

}

function kg_addPostSave($post_id) {
	global $flag;
	if ($flag == 1) { //if draft already saved
		$current_post = get_post($post_id);
		preg_match_all('/poster="([^"\r\n]*)"/', $current_post->post_content, $matches);
		$uploads = wp_upload_dir();

		$post_children =& get_children('post_parent='.$post_id);
		$existing_attachment = array();
		$i=0;
		foreach ($post_children as $child) { 
			$existing_attachment[$i] = $child->guid;
			$i++; 
		}

		foreach ($matches[1] as $url) {
			if(!in_array($url, $existing_attachment)) { 
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

add_action('wp_head', 'addSWFObject');
add_action('admin_menu', 'addFMPOptionsPage');
add_action('save_post', 'kg_addPostSave');

add_shortcode('FMP', 'FMP_shortcode');

?>