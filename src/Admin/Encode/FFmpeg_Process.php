<?php
/**
 * FFmpeg Process class file.
 *
 * @package Videopack
 * @subpackage Admin/Encode
 */

namespace Videopack\Admin\Encode;

use Symfony\Component\Process\Process;

/**
 * Class FFmpeg_Process
 *
 * Extends Symfony Process to handle FFmpeg execution, ensuring it doesn't
 * stop prematurely on SIGTERM.
 */
class FFmpeg_Process extends Process {



	/**
	 * Destructor.
	 *
	 * Avoid stopping the running process when SIGTERM is received.
	 */
	public function __destruct() {}

	/**
	 * Get the name of the process.
	 *
	 * @return string
	 */
	public function getName() {
		return 'ffmpeg process';
	}
}
