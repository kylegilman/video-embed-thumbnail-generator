<?php

namespace Kylegilman\VideoEmbedThumbnailGenerator;

if ( ! defined( 'ABSPATH' ) ) {
	die( "Can't load this file directly" );
}

use Symfony\Component\Process\Process;

class FFMPEG_Process extends Process {

	/**
	 * Avoid stopping the running process when SIGTERM is received
	 */
	public function __destruct() {}

	public function getName() {
		return 'ffmpeg process';
	}
}
