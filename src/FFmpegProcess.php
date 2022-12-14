<?php

namespace Kylegilman\VideoEmbedThumbnailGenerator;

use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\RuntimeException;

class FFmpegProcess extends Process {

    private $options;
    private $video_app;
    private $ffmpeg_exec;

    public function __construct( $commandline = null, $cwd = null, array $env = null, $input = null, $timeout = 60, array $options = null ) {

		$this->options = kgvid_get_options();
        $this->video_app = $this->options['video_app'];
        $this->ffmpeg_exec = $this->options['app_path']."/".$this->video_app;

        parent::__construct( $commandline, $cwd, $env, $input, $timeout, $options );

	}

    /**
     * Avoid stopping the running process when SIGTERM is received
     */
    public function __destruct() {}

    public function getName() {
        return 'ffmpeg process';
    }

}