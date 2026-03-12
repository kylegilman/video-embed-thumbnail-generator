<?php

namespace Videopack\Admin\Encode;

use Symfony\Component\Process\Process;

class FFmpeg_Process extends Process {

	public function __construct( $commandline, $cwd = null, array $env = null, $input = null, $timeout = 60 ) {
		parent::__construct( $commandline, $cwd, $env, $input, $timeout );
	}

	/**
	 * Avoid stopping the running process when SIGTERM is received
	 */
	public function __destruct() {}

	public function getName() {
		return 'ffmpeg process';
	}
}
