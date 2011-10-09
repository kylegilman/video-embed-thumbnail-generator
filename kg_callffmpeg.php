<?php

$ffmpegPath = $_POST['ffmpeg']."/ffmpeg";
$movieurl = $_POST['movieurl'];
$numberofthumbs = $_POST['numberofthumbs'];
$randomize = $_POST['randomize'];
$action = $_POST['action'];
$poster = $_POST['poster'];
$uploads = $_POST['uploads'];

$moviefilepath = str_replace(" ", "%20", $movieurl);
$movie_extension = pathinfo(parse_url($movieurl, PHP_URL_PATH), PATHINFO_EXTENSION);
$moviefilebasename = basename($movieurl,'.'.$movie_extension);
$moviefilebasename = str_replace(" ", "_", $moviefilebasename);
$thumbnailfilebase = $uploads[url]."/thumb_tmp/".$moviefilebasename;

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
	$command = $ffmpegPath . ' -i ' . $video . ' -vstats 2>&1';

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

				//chdir($uploads['path']);
				rrmdir($uploads['path'].'/thumb_tmp');
				if (!file_exists($uploads['path'].'/thumb_tmp')) { mkdir($uploads['path'].'/thumb_tmp'); }
				//foreach (glob($moviefilebasename."*.jpg") as $filename) {
				//	unlink($filename); // delete the old thumbnails
				//}

				$thumbnailheight = strval(round(floatval($movie_height) / floatval($movie_width) * 200));
				$jpgpath = $uploads[path]."/thumb_tmp/";

				$i = 1;
				$increaser = 0;

				while ($i <= $numberofthumbs) {
				
					$iincreaser = $i + $increaser;
					$movieoffset = round(($movie_duration_seconds * $iincreaser) / ($numberofthumbs * 2));

					if ($randomize == 1) { //adjust offset random amount
						$movieoffset = $movieoffset - rand(0, round($movie_duration_seconds / $numberofthumbs));
					}

					$thumbnailfilename[$i] = $jpgpath.$moviefilebasename.$i.".jpg";
					$ffmpeg_options = "-ss $movieoffset -i ".$moviefilepath." -vframes 1 ".$thumbnailfilename[$i];
					$thumbnailurl = $thumbnailfilebase.$i.'.jpg';

					//$process = new Process($ffmpegPath." ".$ffmpeg_options);
					//sleep(1);
					exec($ffmpegPath." ".$ffmpeg_options);
					$thumbnaildisplaycode = $thumbnaildisplaycode.'<div style="text-align:center; display:inline-block; margin:2px;"><label for="kgflashmedia-thumb'.$i.'"><img src="'.$thumbnailurl.'?'.rand().'" width="200" height="'.$thumbnailheight.'"></label><br /><input type="radio" name="kgflashmedia-thumb" id="kgflashmedia-thumb'.$i.'" value="'.str_replace('/thumb_tmp/', '/', $thumbnailurl).'" onchange="getElementById(\'kgflashmediaplayer-poster\').value = this.value;"></div>';

					$increaser++;
					$i++;
				}

				$arr = array ( "thumbnaildisplaycode"=>$thumbnaildisplaycode, "movie_width"=>$movie_width, "movie_height"=>$movie_height );

				echo json_encode($arr);
			}//if generate

			if ($action == encode) {
				$encodepath = $uploads[path]."/";
				$ipodfilepath = $encodepath.$moviefilebasename."-ipod.m4v";
				$ogvfilepath = $encodepath.$moviefilebasename.".ogv";

				if ( ! file_exists($ipodfilepath) ) {
					$ipod_movie_height = strval(round(floatval($movie_height) / floatval($movie_width) * 640));
					if ( strpos($movie_info['configuration'], 'enable-libfaac') &&  strpos($movie_info['configuration'], 'enable-libx264') ) {
						$ffmpeg_ipod_options = " -acodec libfaac -ab 128k -s 640x".$ipod_movie_height." -vcodec libx264 -vpre slow -vpre ipod640 -b 800k -bt 800k -threads 0 -f ipod ".$ipodfilepath;
						echo "<strong> Encoding iPod... </strong>";
					}//if the proper FFMPEG libraries are enabled
					else { echo "<strong>FFMPEG missing library 'libfaac' or 'libx264' required for iPod encoding. </strong></strong>"; }
				}//if iPod file doesn't already exist
				else { echo "<strong>iPod Already Encoded! </strong>"; }

				if ( ! file_exists($ogvfilepath) ) {
					if ( strpos($movie_info['configuration'], 'enable-libvorbis') &&  strpos($movie_info['configuration'], 'enable-libtheora') ) {
						$ogvbitrate = $movie_height * 3;
						$ffmpeg_ogv_options = " -acodec libvorbis -ab 128k -vcodec libtheora -b ".$ogvbitrate."k -threads 0 ".$ogvfilepath;
						echo "<strong> Encoding OGG... </strong>";
					}//if the proper FFMPEG libraries are enabled
					else { echo "<strong>FFMPEG missing library 'libvorbis' or 'libtheora' required for ogv encoding.</strong></strong>"; }
				}//if ogv doesn't already exist
				else { echo "<strong>OGG Already Encoded!</strong>"; }

				if ( ! file_exists($ogvfilepath) || ! file_exists($ipodfilepath) ) {
					$ffmpeg_options = "-i ".$moviefilepath.$ffmpeg_ipod_options.$ffmpeg_ogv_options;
					$process = new Process($ffmpegPath." ".$ffmpeg_options);
				}//if both HTML5 videos don't exist

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

	rrmdir($uploads['path'].'/thumb_tmp');
	echo ("<strong>Thumbnails Deleted</strong>");

}//if delete

if ($action == submit) { 

	$posterfile = pathinfo($poster, PATHINFO_BASENAME);
	copy($uploads['path'].'/thumb_tmp/'.$posterfile, $uploads['path'].'/'.$posterfile);
	//rrmdir($uploads['path'].'/thumb_tmp');

}//if submit

?>