<?php
/**
 * FFmpeg Command Builder class file.
 *
 * @package Videopack
 * @subpackage Admin/Encode
 */

namespace Videopack\Admin\Encode;

/**
 * Class FFmpeg_Command
 *
 * A fluent builder for FFmpeg command arrays.
 */
class FFmpeg_Command {

	/**
	 * Path to FFmpeg executable.
	 *
	 * @var string $executable
	 */
	private $executable;

	/**
	 * Global options (before any input).
	 *
	 * @var array $global_options
	 */
	private $global_options = array();

	/**
	 * Input files and their specific options.
	 *
	 * @var array $inputs
	 */
	private $inputs = array();

	/**
	 * Output files and their specific options.
	 *
	 * @var array $outputs
	 */
	private $outputs = array();

	/**
	 * Constructor.
	 *
	 * @param string|null $executable Optional path to FFmpeg executable.
	 */
	public function __construct( string $executable = null ) {
		$this->executable = $executable;
	}

	/**
	 * Set the FFmpeg executable path.
	 *
	 * @param string $path Path to FFmpeg.
	 * @return $this
	 */
	public function set_executable( string $path ) {
		$this->executable = $path;
		return $this;
	}

	/**
	 * Add a global option (appears before any -i).
	 *
	 * @param string      $option Option name (e.g., '-y', '-threads').
	 * @param string|null $value  Optional option value.
	 * @return $this
	 */
	public function add_global_option( string $option, $value = null ) {
		$this->global_options[] = $option;
		if ( null !== $value ) {
			$this->global_options[] = (string) $value;
		}
		return $this;
	}

	/**
	 * Get the global options array.
	 *
	 * @return array
	 */
	public function get_global_options() {
		return $this->global_options;
	}

	/**
	 * Parses an options array, expanding associative keys into sequential items,
	 * while safely dropping pairs that have empty values to prevent argument shifting.
	 *
	 * @param array $options The options array to parse.
	 * @return array
	 */
	private function parse_options( array $options ) {
		$parsed = array();
		foreach ( $options as $key => $value ) {
			if ( is_string( $key ) ) {
				// Associative key-value pair.
				if ( $value === 0 || $value === '0' || ( is_string( $value ) && trim( $value ) !== '' ) || is_numeric( $value ) ) {
					$parsed[] = $key;
					$parsed[] = (string) $value;
				}
			} else {
				// Sequential item (legacy behavior).
				$parsed[] = $value;
			}
		}
		return $parsed;
	}

	/**
	 * Add an input file.
	 *
	 * @param string $path    Path or URL to input file.
	 * @param array  $options Optional array of flags to place before this -i. Can be associative for safe pairing.
	 * @return $this
	 */
	public function add_input( string $path, array $options = array() ) {
		$this->inputs[] = array(
			'path'    => $path,
			'options' => $this->parse_options( $options ),
		);
		return $this;
	}

	/**
	 * Add an output file.
	 *
	 * @param string $path    Path to output file.
	 * @param array  $options Array of flags to place before this output path. Can be associative for safe pairing.
	 * @return $this
	 */
	public function add_output( string $path, array $options = array() ) {
		$this->outputs[] = array(
			'path'    => $path,
			'options' => $this->parse_options( $options ),
		);
		return $this;
	}

	/**
	 * Convert the command to a clean array.
	 *
	 * @return array
	 */
	public function to_array() {
		$command = array();

		if ( $this->executable ) {
			$command[] = $this->executable;
		}

		// Add global options.
		$command = array_merge( $command, $this->global_options );

		// Add inputs.
		foreach ( $this->inputs as $input ) {
			$command   = array_merge( $command, $input['options'] );
			$command[] = '-i';
			$command[] = $input['path'];
		}

		// Add outputs.
		foreach ( $this->outputs as $output ) {
			$command   = array_merge( $command, $output['options'] );
			$command[] = $output['path'];
		}

		// Final cleanup: filter empty values and re-index.
		$command = array_filter(
			$command,
			function ( $value ) {
				return (
					$value === 0
					|| $value === '0'
					|| ( is_string( $value ) && trim( $value ) !== '' )
					|| is_numeric( $value )
				);
			}
		);

		return array_values( $command );
	}

	/**
	 * Creates an FFmpeg_Command instance from a raw command array.
	 *
	 * @param array $command Raw command array.
	 * @return self
	 */
	public static function from_array( array $command ) {
		$builder = new self();
		if ( empty( $command ) ) {
			return $builder;
		}

		// The first argument is typically the executable path if it doesn't start with '-'
		$first = reset( $command );
		if ( $first && strpos( $first, '-' ) !== 0 ) {
			$executable = array_shift( $command );
			$builder->set_executable( $executable );
		}

		$current_options = array();
		$has_inputs = false;

		while ( ! empty( $command ) ) {
			$arg = array_shift( $command );
			if ( $arg === '-i' ) {
				$input_path = array_shift( $command );
				if ( ! $has_inputs ) {
					// Options before the first input are global options
					foreach ( $current_options as $opt ) {
						$builder->add_global_option( $opt );
					}
					$builder->add_input( $input_path );
					$has_inputs = true;
				} else {
					$builder->add_input( $input_path, $current_options );
				}
				$current_options = array();
			} else {
				$current_options[] = $arg;
			}
		}

		if ( ! empty( $current_options ) ) {
			$output_path = array_pop( $current_options );
			$builder->add_output( $output_path, $current_options );
		}

		return $builder;
	}

	/**
	 * Gets options for a specific input.
	 *
	 * @param int $index Input index.
	 * @return array
	 */
	public function get_input_options( int $index ) {
		return isset( $this->inputs[ $index ] ) ? $this->inputs[ $index ]['options'] : array();
	}

	/**
	 * Sets options for a specific input.
	 *
	 * @param int   $index   Input index.
	 * @param array $options Options to set.
	 * @return $this
	 */
	public function set_input_options( int $index, array $options ) {
		if ( isset( $this->inputs[ $index ] ) ) {
			$this->inputs[ $index ]['options'] = $this->parse_options( $options );
		}
		return $this;
	}

	/**
	 * Convert the command to a string for display or shell execution.
	 *
	 * @return string
	 */
	public function to_string() {
		return implode( ' ', array_map( array( $this, 'escape_arg' ), $this->to_array() ) );
	}

	/**
	 * Magic method for string conversion.
	 *
	 * @return string
	 */
	public function __toString() {
		return $this->to_string();
	}

	/**
	 * Escapes a command line argument if it contains spaces or special characters.
	 *
	 * @param string $arg The argument to escape.
	 * @return string The escaped argument.
	 */
	private function escape_arg( $arg ) {
		if ( strpos( $arg, ' ' ) !== false || strpos( $arg, '"' ) !== false || strpos( $arg, '&' ) !== false ) {
			return '"' . str_replace( '"', '\\"', $arg ) . '"';
		}
		return $arg;
	}
}
