<?php

namespace Kylegilman\VideoEmbedThumbnailGenerator;

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
