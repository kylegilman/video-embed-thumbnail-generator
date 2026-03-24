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
	 * Constructor.
	 *
	 * @param mixed       $commandline The command line to run.
	 * @param string|null $cwd         The working directory.
	 * @param array|null  $env         The environment variables.
	 * @param mixed       $input       The input.
	 * @param int         $timeout     The timeout in seconds.
	 */
	public function __construct( $commandline, $cwd = null, array $env = null, $input = null, $timeout = 60 ) {
		parent::__construct( $commandline, $cwd, $env, $input, $timeout );
	}

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
