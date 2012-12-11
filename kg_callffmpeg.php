<?php
global $options;
$options = get_option('kg_video_embed_options');
global $ffmpegPath;
$ffmpegPath = $options['app_path']."/".$options['video_app'];
$uploads = wp_upload_dir();
if (isset($_POST['encode1080'])) { $encode_checked['1080'] = $_POST['encode1080']; }
if (isset($_POST['encode720'])) { $encode_checked['720'] = $_POST['encode720']; }
if (isset($_POST['encodemobile'])) { $encode_checked['mobile'] = $_POST['encodemobile']; }
if (isset($_POST['encodeogg'])) { $encode_checked['ogg'] = $_POST['encodeogg']; }
if (isset($_POST['encodewebm'])) { $encode_checked['webm'] = $_POST['encodewebm']; }
if (isset($_POST['movieurl'])) { $movieurl = $_POST['movieurl']; }
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
else { $moviefilepath = str_replace(" ", "%20", $movieurl); }
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

				$thumbnaildisplaycode = '<div class="kg_thumbnail_select" name="attachments_'.$postID.'_thumb'.$i.'" id="attachments_'.$postID.'_thumb'.$i.'"><label for="kgflashmedia_'.$postID.'_thumb'.$i.'"><img src="'.$thumbnailurl.'?'.rand().'" width="200" height="'.$thumbnailheight.'" class="kg_thumbnail"></label><br /><input type="radio" name="kgflashmedia-thumb" id="kgflashmedia_'.$postID.'_thumb'.$i.'" value="'.str_replace('/thumb_tmp/', '/', $thumbnailurl).'" onchange="getElementById(\'attachments['. $postID .'][kgflashmediaplayer-poster]\').value = this.value; getElementById(\'attachments['. $postID .'][thumbtime]\').value = \''. $movieoffset_display .'\'; getElementById(\'attachments_'. $postID .'_numberofthumbs\').value =\'1\';"></div>';

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
				$available_formats = array(
					"1080" => "1080p H.264",
					"720" => "720p H.264",
					"mobile" => "480p H.264",
					"webm" => "WEBM",
					"ogg" => "OGV"
				);

				$encodevideo_info = kg_encodevideo_info($movieurl, $postID);
				
				foreach ( $available_formats as $format => $name ) {
					if ( $encode_checked[$format] == "true" ) {
						if ( !$encodevideo_info[$format.'_exists'] || ($encodevideo_info['sameserver'] && filesize($encodevideo_info[$format.'filepath']) < 24576) ) { 
							if ( ($format == "1080" && $movie_height <= 1080) || ($format == "720" && $movie_height <= 720) ) {  
								if ( in_array($movie_extension, $h264extensions) || $movie_height < intval($format) ) {
									$encode_formats[$format]['status'] = "lowres";
								} //skip if the resolution of an existing video is lower than the HD format
							}
							else { 
								$encode_formats[$format]['status'] = "queued"; 
								$encode_list[$format] = $name;
							}
						} // if video doesn't already exist
						else { $encode_formats[$format]['status'] = "completed"; }
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
				foreach($available_formats as $format => $name) {
					if ($encodevideo_info[$format.'_exists']) { $replaceoptions .= '<option value="'.$encodevideo_info[$format.'url'].'">'.$name.'</option>'; }
				}

				$altembedselect = '<span class="kg_embedselect">Embed <select name="attachments['.$postID.'][kgflashmediaplayer-altembed]" id="attachments['.$postID.'][kgflashmediaplayer-altembed]">'.$originalselect.$replaceoptions.'</select></span>';

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

?>