<?php
global $ffmpegPath;
$ffmpegPath = get_option('wp_FMP_ffmpeg')."/ffmpeg";
$mobile_res = get_option('wp_FMP_mobile_res');
$uploads = wp_upload_dir();
if (isset($_POST['encodemobile'])) { $encodemobile = $_POST['encodemobile']; }
if (isset($_POST['encodeogg'])) { $encodeogg = $_POST['encodeogg']; }
if (isset($_POST['encodewebm'])) { $encodewebm = $_POST['encodewebm']; }
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


class Process{
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


/**
* Get the dimensions of a video file
*
* @param unknown_type $video
* @return array(width,height)
* @author Jamie Scott
*/
function get_video_dimensions($video = false) {
	global $ffmpegPath;

	$command = $ffmpegPath . ' -i "' . $video . '" -vstats 2>&1';

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
		preg_match('/configuration: (.*?)\n/', $output, $matches);
		$configuration = $matches[1];
		preg_match('/rotate          : (.*?)\n/', $output, $matches);
		if ( array_key_exists(1, $matches) == true ) { $rotate = $matches[1]; }
		else $rotate = "0";
		return array ('width' => $width, 'height' => $height, 'duration' => $duration, 'configuration' => $configuration, 'rotate' => $rotate, 'worked'=>true );
	} else {
		return array ('output'=>$lastline, 'worked'=>false);
	}

}

if ($action == "generate" || $action == "encode" ) {

	//exec($ffmpegPath.' /dev/null 2>&1', $output, $returnvalue); //attempt to execute FFMPEG
	$ffmpeg_info = kg_check_ffmpeg_exists();

	if ( $ffmpeg_info['ffmpeg_exists'] == true ) { //if FFMPEG executed

		$movie_info = get_video_dimensions($moviefilepath);

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

				switch ($movie_info['rotate']) { //if it's a sideways iPhone video
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
					$thumbtimecode = $timecode_array[0] + ($timecode_array[1] * 60) + ($timecode_array[2] * 3600);
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

				$thumbnaildisplaycode = '<div class="kg_thumbnail_select" name="attachments_'.$postID.'_thumb'.$i.'" id="attachments_'.$postID.'_thumb'.$i.'"><label for="kgflashmedia-thumb'.$i.'"><img src="'.$thumbnailurl.'?'.rand().'" width="200" height="'.$thumbnailheight.'" class="kg_thumbnail"></label><br /><input type="radio" name="kgflashmedia-thumb" id="kgflashmedia-thumb'.$i.'" value="'.str_replace('/thumb_tmp/', '/', $thumbnailurl).'" onchange="getElementById(\'attachments['. $postID .'][kgflashmediaplayer-poster]\').value = this.value; getElementById(\'attachments['. $postID .'][thumbtime]\').value = \''. $movieoffset_display .'\'; getElementById(\'attachments_'. $postID .'_numberofthumbs\').value =\'1\';"></div>';

				switch ($movie_info['rotate']) {
					case "90";
					case "270": $movie_width ^= $movie_height ^= $movie_width ^= $movie_height; break; //swap height & width
				}

				$i++;

				$arr = array ( "thumbnaildisplaycode"=>$thumbnaildisplaycode, "movie_width"=>$movie_width, "movie_height"=>$movie_height, "lastthumbnumber"=>$i, "movieoffset"=>$movieoffset );

				echo json_encode($arr);
			}//if generate

			if ($action == "encode") {

				//preferred encode path is the directory of the original file (likely in the wp_upload dir)
				$encodepath = "";
				$embed_display = "";
				$ffmpeg_ipod_options = "";
				$ffmpeg_ogv_options = "";
				$ffmpeg_webm_options = "";
				$logfile = "";
				$processPID = "";
				$serverOS = "";
								
				$encode_anything = "false";

				$encodevideo_info = kg_encodevideo_info($movieurl, $postID);

				if ($encodemobile == "true") {
				if ( ! $encodevideo_info['mobile_exists'] || ($encodevideo_info['sameserver'] && filesize($encodevideo_info['mobilefilepath']) < 24576) ) {

					switch($mobile_res) {
						case "480": $ipod_movie_max_width = 640; break;
						case "720": $ipod_movie_max_width = 1280; break;
						case "1080": $ipod_movie_max_width = 1920; break;
						default: $ipod_movie_max_width = 640;
					}

					if ( floatval($movie_width)  > $ipod_movie_max_width ) { $ipod_movie_width = strval($ipod_movie_max_width); }
					else { $ipod_movie_width = $movie_width; }
					$ipod_movie_height = strval(round(floatval($movie_height) / floatval($movie_width) * $ipod_movie_width)); 
					if ($ipod_movie_height % 2 != 0) { $ipod_movie_height++; } //make sure it's an even number

					if ( strpos($movie_info['configuration'], 'enable-libfaac') || strpos($movie_info['configuration'], 'enable-libvo-aacenc') &&  strpos($movie_info['configuration'], 'enable-libx264') ) {

						if ( strpos($movie_info['configuration'], 'enable-libfaac') ) { $aaclib = "libfaac"; }
						else { $aaclib = "libvo_aacenc"; }

						$ipodbitrate = $movie_height * 3;
						$vpre_flags = "";
						if ( get_option('wp_FMP_vpre') == 'true' ) { $vpre_flags = '-vpre slow -vpre ipod640'; }

						$ffmpeg_ipod_options = ' -acodec '.$aaclib.' -ab 128k -s '.$ipod_movie_width.'x'.$ipod_movie_height.' -vcodec libx264 '.$vpre_flags.' -threads 1 '.$movie_rotate.' -b '.$ipodbitrate.'k -bt 800k -f ipod "'.$encodevideo_info['mobilefilepath'].'"';
						$encode_anything = "true";
						$embed_display .= "<strong> Encoding Mobile M4V. </strong>";
					}//if the proper FFMPEG libraries are enabled
					else { $embed_display .= "<strong>FFMPEG missing library 'libfaac' 'libvo-aacenc' or 'libx264' required for Mobile M4V encoding. </strong>"; }
				}//if mobile file doesn't already exist
				else { $embed_display .= "<strong>Mobile M4V Already Encoded! </strong>"; }
				}//if mobile is checked

				if ($encodewebm == "true") {
				if ( ! $encodevideo_info['webm_exists'] || ($encodevideo_info['sameserver'] && filesize($encodevideo_info['webmfilepath']) < 24576) ) {
					if ( strpos($movie_info['configuration'], 'enable-libvorbis') &&  strpos($movie_info['configuration'], 'enable-libvpx') ) {
						$webmbitrate = $movie_height * 3;
						$ffmpeg_webm_options = ' -ab 128k -b '.$webmbitrate.'k '.$movie_rotate.' -threads 1 "'.$encodevideo_info['webmfilepath'].'"';
						$encode_anything = "true";
						$embed_display .= "<strong> Encoding WEBM. </strong>";
					}//if the proper FFMPEG libraries are enabled
					else { $embed_display .= "<strong>FFMPEG missing library 'libvorbis' or 'libvpx' required for WEBM encoding. </strong>"; }
				}//if webm doesn't already exist
				else { $embed_display .= "<strong>WEBM Already Encoded! </strong>"; }
				}//if encodewebm is checked

				if ($encodeogg == "true") {
				if ( ! $encodevideo_info['ogg_exists'] || ($encodevideo_info['sameserver'] && filesize($encodevideo_info['oggfilepath']) < 24576) ) {

					if ( strpos($movie_info['configuration'], 'enable-libvorbis') &&  strpos($movie_info['configuration'], 'enable-libtheora') ) {
						$ogvbitrate = $movie_height * 3;
						$ffmpeg_ogv_options = ' -acodec libvorbis -ab 128k -vcodec libtheora -b '.$ogvbitrate.'k '.$movie_rotate.' -threads 1 "'.$encodevideo_info['oggfilepath'].'"';
						$encode_anything = "true";
						$embed_display .= "<strong> Encoding OGV. </strong>";
					}//if the proper FFMPEG libraries are enabled
					else { $embed_display .= "<strong>FFMPEG missing library 'libvorbis' or 'libtheora' required for OGV encoding. </strong>"; }
				}//if ogv doesn't already exist
				else { $embed_display .= "<strong>OGV Already Encoded! </strong>"; }
				}//if encodeogg is checked


				if ( $encode_anything == "true" ) {

					if ( ! file_exists($encodevideo_info['encodepath']) ) { mkdir($encodevideo_info['encodepath']); }			

					$ffmpeg_options = '-y -i "'.$moviefilepath.'" '.$ffmpeg_ipod_options.$ffmpeg_ogv_options.$ffmpeg_webm_options;
					$logfile = $encodevideo_info['encodepath'].str_replace(" ", "_", $moviefilebasename)."_".sprintf("%04s",mt_rand(1, 1000))."_encode.txt";
					$cmd = escapeshellcmd($ffmpegPath." ".$ffmpeg_options);
					$cmd = $cmd." > ".$logfile." 2>&1 & echo $!";
					
					$process = new Process($cmd);

					sleep(1);

					$processPID = $process->getPid();
					$serverOS = $process->OS;
					$encodevideo_info = kg_encodevideo_info($movieurl, $postID); //update after encoding starts

					$embed_display .= " <em><small>(continues if window is closed)</small></em>";

					$output_map = array_map(create_function('$key, $value', 'return $key.":".$value." # ";'), array_keys($process->output), array_values($process->output));
					$output_implode = implode($output_map);
					
					//$embed_display .= "Command: ".$cmd." Output: ".$output_implode;

				}//if any HTML5 videos don't already exist

				$replaceoptions = "";
				$originalselect = "";
				$original_extension = pathinfo($movieurl, PATHINFO_EXTENSION);
				$embeddable = array("flv", "f4v", "mp4", "mov", "m4v", "ogv", "ogg", "webm");
				if ( in_array($original_extension, $embeddable) ) { $originalselect = '<option value="'.$movieurl.'">original</option>'; }
				if ( $encodevideo_info['mobile_exists'] ) { $replaceoptions .= '<option value="'.$encodevideo_info['mobileurl'].'">Mobile/H.264</option>'; }
				if ( $encodevideo_info['webm_exists'] ) { $replaceoptions .= '<option value="'.$encodevideo_info['webmurl'].'">WEBM</option>'; }
				if ( $encodevideo_info['ogg_exists'] ) { $replaceoptions .= '<option value="'.$encodevideo_info['oggurl'].'">OGV</option>'; }

				$altembedselect = '<span class="kg_embedselect">Embed <select name="attachments['.$postID.'][kgflashmediaplayer-altembed]" id="attachments['.$postID.'][kgflashmediaplayer-altembed]">'.$originalselect.$replaceoptions.'</select></span>';

				//$encodevideo_info_map = array_map(create_function('$key, $value', 'return $key.":".$value." # ";'), array_keys($encodevideo_info), array_values($encodevideo_info));
				//$encodevideo_info_implode = implode($encodevideo_info_map);

				$arr = array ( "embed_display"=>$embed_display, "pid"=>$processPID, "logfile"=>$logfile, "movie_duration"=>$movie_duration_seconds, "encode_anything"=>$encode_anything, "altembedselect"=>$altembedselect, "serverOS"=>$serverOS );
				echo json_encode($arr);
				
			}//if encode

		}//if ffmpeg can open movie

		else { $thumbnaildisplaycode = '<strong>Can\'t open movie file.</strong><br />'.$movie_info['output'];
			$arr = array ( "thumbnaildisplaycode"=>$thumbnaildisplaycode, "embed_display"=>$thumbnaildisplaycode, "lastthumbnumber"=>"break" );
			echo json_encode($arr);
		} //can't open movie

	}//if ffmpeg exists

	else { $thumbnaildisplaycode = '<strong>Error: FFMPEG not found. Verify that FFMPEG is installed and check the <a href="options-general.php?page=video-embed-thumbnail-generator.php">path to FFMPEG plugin setting</a>.</strong>' ; 
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

			if ( is_empty_dir($uploads["path"].'/thumb_tmp') ) { rrmdir($uploads["path"].'/thumb_tmp'); }
		}

	//$arr = array ( "posterfile"=>$posterfile, "tmp_posterpath"=>$tmp_posterpath, "final_posterpath"=>$final_posterpath );
	//echo json_encode($arr);

}//if submit


?>