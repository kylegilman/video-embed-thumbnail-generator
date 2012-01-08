<?php

$ffmpegPath = $_POST['ffmpeg']."/ffmpeg";
$encodemobile = $_POST['encodemobile'];
$encodeogg = $_POST['encodeogg'];
$encodewebm = $_POST['encodewebm'];
$movieurl = $_POST['movieurl'];
$numberofthumbs = $_POST['numberofthumbs'];
//$randomize = $_POST['randomize'];
$action = $_POST['action'];
$poster = $_POST['poster'];
$uploads['path'] = $_POST['uploads_path'];
$uploads['url'] = $_POST['uploads_url'];
$uploads['basedir'] = $_POST['uploads_basedir'];
$postID = $_POST['attachmentID'];
$thumbtimecode = $_POST['thumbtimecode'];
$dofirstframe = $_POST['dofirstframe'];
$generate_button = $_POST['generate_button'];

$moviefilepath = str_replace(" ", "%20", $movieurl);
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
        $command = 'nohup '.$this->command.' > /dev/null 2>&1 & echo $!';
        //$command = 'nohup '.$this->command.' 1> /home/kylegilm/output.txt 2>&1';
        exec($command ,$op);
        $this->pid = (int)$op[0];
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
		return array ('width' => $width, 'height' => $height, 'duration' => $duration, 'configuration' => $configuration );
	} else {
		return false;
	}

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


if ($action == generate || $action == encode ) {

	exec($ffmpegPath.' /dev/null 2>&1', $output, $returnvalue); //attempt to execute FFMPEG

	if ($returnvalue < 126 ) { //if FFMPEG executed

		$movie_info = get_video_dimensions($moviefilepath);

		if ($movie_info != false) { //if FFMPEG was able to open the file

			$movie_duration_hours = intval(substr($movie_info['duration'], -11, 2));
			$movie_duration_minutes = intval(substr($movie_info['duration'], -8, 2));
			$movie_duration_seconds = intval(substr($movie_info['duration'], -5, 2));
			$movie_duration_seconds = ($movie_duration_hours * 60 * 60) + ($movie_duration_minutes * 60) + $movie_duration_seconds;
			$movie_width = $movie_info['width'];
			$movie_height = $movie_info['height'];

			if ($action == generate) {

				//rrmdir($uploads['path'].'/thumb_tmp');
				if (!file_exists($uploads['path'].'/thumb_tmp')) { mkdir($uploads['path'].'/thumb_tmp'); }

				$thumbnailheight = strval(round(floatval($movie_height) / floatval($movie_width) * 200));
				$jpgpath = $uploads['path']."/thumb_tmp/";

				$i = 1;
				$increaser = 0;

				$thumbnaildisplaycode = '<p><strong>Choose Thumbnail:</strong></p><div style="border-style:solid; border-color:#ccc; border-width:1px; width:425px; text-align:center; margin-bottom:10px; padding:5px;">';

				while ($i <= $numberofthumbs) {
				
					$iincreaser = $i + $increaser;
					$movieoffset = round(($movie_duration_seconds * $iincreaser) / ($numberofthumbs * 2));

					if ($generate_button == "random") { //adjust offset random amount
						$movieoffset = $movieoffset - rand(0, round($movie_duration_seconds / $numberofthumbs));
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
					$ffmpeg_options = '-y -ss '.$movieoffset.' -i "'.$moviefilepath.'" -vframes 1 "'.$thumbnailfilename[$i].'"';
					$thumbnailurl = $thumbnailfilebase."_thumb".$i.'.jpg';
					$thumbnailurl = str_replace(" ", "_", $thumbnailurl);

					exec($ffmpegPath." ".$ffmpeg_options);

					if (floatval($movieoffset) > 60) {
						$movieoffset_minutes = sprintf("%02s", intval(intval($movieoffset) / 60) );
						$movieoffset_seconds = sprintf("%02s", round(fmod( floatval($movieoffset), 60), 2) );
						$movieoffset_display = $movieoffset_minutes.":".$movieoffset_seconds;
					}
					else { $movieoffset_display = "00:".sprintf("%02s", $movieoffset); }

					$thumbnaildisplaycode = $thumbnaildisplaycode.'<div style="text-align:center; display:inline-block; margin:2px;"><label for="kgflashmedia-thumb'.$i.'"><img src="'.$thumbnailurl.'?'.rand().'" width="200" height="'.$thumbnailheight.'"></label><br /><input type="radio" name="kgflashmedia-thumb" id="kgflashmedia-thumb'.$i.'" value="'.str_replace('/thumb_tmp/', '/', $thumbnailurl).'" onchange="getElementById(\'attachments['. $postID .'][kgflashmediaplayer-poster]\').value = this.value; getElementById(\'attachments['. $postID .'][thumbtime]\').value = \''. $movieoffset_display .'\'; getElementById(\'attachments_'. $postID .'_numberofthumbs\').value =\'1\';"></div>';

					$increaser++;
					$i++;
				} //end thumbnail loop

				//$thumbnaildisplaycode = $thumbnaildisplaycode.'<p><input type="button" id="attachments['. $postID .'][confirmbutton]" class="button-secondary" value="Confirm" name="confirmbutton" onclick="kg_generate_thumb('. $postID .', \'confirm\');"/></p>';

				$arr = array ( "thumbnaildisplaycode"=>$thumbnaildisplaycode, "movie_width"=>$movie_width, "movie_height"=>$movie_height );

				echo json_encode($arr);
			}//if generate

			if ($action == encode) {

				//preferred encode path is the directory of the original file (likely in the wp_upload dir)
				$encodepath = "";
				$url_parts = parse_url($uploads['url']);
				if ( strpos($moviefilepath, $url_parts['host']) != "" ) { //if we're on the same server
					$home_path = substr(strrev(strstr(strrev($uploads['basedir']), strrev("public_html"))), 0, -strlen("public_html")); //home path of the current server
					$moviefiledirectory = dirname(parse_url($moviefilepath, PHP_URL_PATH)); //gets file's directory
					$encodepath = $home_path."public_html".$moviefiledirectory."/";
				}
				if ( !is_writable($encodepath) ) { //if the original directory is not writable use a directory in base wp_upload
					$encodepath = $uploads['basedir']."/html5encodes/";
					if ( !file_exists($encodepath) ) { mkdir($encodepath); }
				}

				$ipodfilepath = $encodepath.$moviefilebasename."-ipod.m4v";
				$ogvfilepath = $encodepath.$moviefilebasename.".ogv";
				$webmfilepath = $encodepath.$moviefilebasename.".webm";

				if ($encodemobile == "true") {
				if ( ! file_exists($ipodfilepath) || filesize($webmfilepath) < 24576 ) {
					$ipod_movie_height = strval(round(floatval($movie_height) / floatval($movie_width) * 640));
					if ($ipod_movie_height % 2 != 0) { $ipod_movie_height++; }
					if ( strpos($movie_info['configuration'], 'enable-libfaac') &&  strpos($movie_info['configuration'], 'enable-libx264') ) {
						$ffmpeg_ipod_options = ' -acodec libfaac -ab 128k -s 640x'.$ipod_movie_height.' -vcodec libx264 -vpre slow -vpre ipod640 -b 800k -bt 800k -threads 1 -f ipod "'.$ipodfilepath.'"';
						$embed_display .= "<strong> Encoding Mobile M4V... </strong>";
					}//if the proper FFMPEG libraries are enabled
					else { $embed_display .= "<strong>FFMPEG missing library 'libfaac' or 'libx264' required for iPod encoding. </strong>"; }
				}//if iPod file doesn't already exist
				else { $embed_display .= "<strong>Mobile M4V Already Encoded! </strong>"; }
				}//if mobile is checked

				if ($encodewebm == "true") {
				if ( ! file_exists($webmfilepath) || filesize($webmfilepath) < 24576 ) {
					if ( strpos($movie_info['configuration'], 'enable-libvorbis') &&  strpos($movie_info['configuration'], 'enable-libvpx') ) {
						$webmbitrate = $movie_height * 3;
						$ffmpeg_webm_options = ' -ab 128k -b '.$webmbitrate.'k -threads 1 "'.$webmfilepath.'"';
						$embed_display .= "<strong> Encoding WEBM... </strong>";
					}//if the proper FFMPEG libraries are enabled
					else { $embed_display .= "<strong>FFMPEG missing library 'libvorbis' or 'libvpx' required for WEBM encoding. </strong>"; }
				}//if webm doesn't already exist
				else { $embed_display .= "<strong>WEBM Already Encoded! </strong>"; }
				}//if encodewebm is checked

				if ($encodeogg == "true") {
				if ( ! file_exists($ogvfilepath) || filesize($webmfilepath) < 24576 ) {

					if ( strpos($movie_info['configuration'], 'enable-libvorbis') &&  strpos($movie_info['configuration'], 'enable-libtheora') ) {
						$ogvbitrate = $movie_height * 3;
						$ffmpeg_ogv_options = ' -acodec libvorbis -ab 128k -vcodec libtheora -b '.$ogvbitrate.'k -threads 1 "'.$ogvfilepath.'"';
						$embed_display .= "<strong> Encoding OGV... </strong>";
					}//if the proper FFMPEG libraries are enabled
					else { $embed_display .= "<strong>FFMPEG missing library 'libvorbis' or 'libtheora' required for OGV encoding. </strong>"; }
				}//if ogv doesn't already exist
				else { $embed_display .= "<strong>OGV Already Encoded! </strong>"; }
				}//if encodeogg is checked


				if ( ! file_exists($ogvfilepath) || ! file_exists($ipodfilepath) || ! file_exists($webmfilepath) ) {
					$ffmpeg_options = '-y -i "'.$moviefilepath.'"'.$ffmpeg_ipod_options.$ffmpeg_ogv_options.$ffmpeg_webm_options;

					$process = new Process($ffmpegPath." ".$ffmpeg_options);

				}//if any HTML5 videos don't already exist

				$arr = array ( "embed_display"=>$embed_display );

				echo json_encode($arr);

			}//if encode

		}//if ffmpeg can open movie

		else { $thumbnaildisplaycode = '<strong>Can\'t open movie file.</strong>' ; 
			$arr = array ( "thumbnaildisplaycode"=>$thumbnaildisplaycode );
			echo json_encode($arr);
		} //can't open movie

	}//if ffmpeg exists

	else { $thumbnaildisplaycode = '<strong>Error: FFMPEG not found. Verify that FFMPEG is installed and check the <a href="options-general.php?page=video-embed-thumbnail-generator.php">path to FFMPEG plugin setting</a>.</strong>' ; 
		$arr = array ( "thumbnaildisplaycode"=>$thumbnaildisplaycode );
		echo json_encode($arr);
	} //no ffmpeg


}// if encoding or generating

if ($action == delete) { 

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


if ($action == submit) { 

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
			if ( is_dir($uploads['path'].'/thumb_tmp') && ($files = @scandir($uploads['path'].'/thumb_tmp') && (count($files) < 2)) ) { rmdir($uploads['path'].'/thumb_tmp'); }
		}

	//$arr = array ( "posterfile"=>$posterfile, "tmp_posterpath"=>$tmp_posterpath, "final_posterpath"=>$final_posterpath );
	//echo json_encode($arr);

}//if submit


?>