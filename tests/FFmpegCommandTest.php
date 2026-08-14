<?php
/**
 * Tests for FFmpeg_Command -- the fluent builder for FFmpeg command
 * arrays that real encoding actually executes (via
 * `new FFmpeg_Process((array) $encode_array)`, which bypasses the shell
 * entirely since Symfony Process's array-form constructor passes each
 * element as a literal argv entry). Previously completely untested
 * despite real, easy-to-silently-break logic: the "0 is a real value,
 * not empty" handling appears at two separate layers (parse_options()
 * and to_array()'s final cleanup), and from_array()'s round-trip parsing
 * has a subtle rule (options before the *first* -i are global, not
 * input-specific) that's easy to get backwards.
 *
 * Previously also had a to_string()/__toString()/escape_arg() string-form
 * convenience API with a hand-rolled, incomplete shell-escaping
 * implementation (only quoted on space/"/&, so e.g. a bare `` `cmd` ``
 * payload with no space would pass through unescaped). Confirmed unused
 * anywhere in this repo, both add-on repos (videopack-player-pro,
 * videopack-cloud-streaming), or tests -- removed rather than fixed,
 * since real execution never used the shell/string path at all and a
 * known-weak escaping primitive left sitting in the codebase is a latent
 * trap for whoever reaches for it next.
 */

use Videopack\Admin\Encode\FFmpeg_Command;

class FFmpegCommandTest extends WP_UnitTestCase {

	// -----------------------------------------------------------------
	// to_array() -- basic shape.
	// -----------------------------------------------------------------

	public function test_to_array_includes_executable_first(): void {
		$command = ( new FFmpeg_Command( '/usr/bin/ffmpeg' ) )->to_array();

		$this->assertSame( '/usr/bin/ffmpeg', $command[0] );
	}

	public function test_to_array_omits_executable_when_not_set(): void {
		$command = ( new FFmpeg_Command() )->add_input( 'in.mp4' )->to_array();

		$this->assertNotContains( null, $command );
		$this->assertSame( array( '-i', 'in.mp4' ), $command );
	}

	public function test_to_array_orders_global_options_before_inputs(): void {
		$command = ( new FFmpeg_Command( 'ffmpeg' ) )
			->add_global_option( '-y' )
			->add_input( 'in.mp4' )
			->to_array();

		$this->assertSame( array( 'ffmpeg', '-y', '-i', 'in.mp4' ), $command );
	}

	public function test_to_array_places_input_options_before_its_own_i_flag(): void {
		$command = ( new FFmpeg_Command( 'ffmpeg' ) )
			->add_input( 'in.mp4', array( '-ss', '10' ) )
			->to_array();

		$this->assertSame( array( 'ffmpeg', '-ss', '10', '-i', 'in.mp4' ), $command );
	}

	public function test_to_array_places_output_options_before_its_own_path(): void {
		$command = ( new FFmpeg_Command( 'ffmpeg' ) )
			->add_output( 'out.mp4', array( '-vcodec', 'libx264' ) )
			->to_array();

		$this->assertSame( array( 'ffmpeg', '-vcodec', 'libx264', 'out.mp4' ), $command );
	}

	public function test_to_array_handles_multiple_inputs_and_outputs_in_order(): void {
		$command = ( new FFmpeg_Command( 'ffmpeg' ) )
			->add_input( 'in1.mp4' )
			->add_input( 'in2.mp4' )
			->add_output( 'out1.mp4' )
			->add_output( 'out2.mp4' )
			->to_array();

		$this->assertSame(
			array( 'ffmpeg', '-i', 'in1.mp4', '-i', 'in2.mp4', 'out1.mp4', 'out2.mp4' ),
			$command
		);
	}

	// -----------------------------------------------------------------
	// add_input()/add_output() -- empty paths are rejected outright.
	// -----------------------------------------------------------------

	/**
	 * An empty input path used to survive into to_array() and get
	 * silently stripped by the final cleanup pass, leaving a dangling -i
	 * that would consume the *next* unrelated argument as its path --
	 * confirmed reproducible: add_input('', [])->add_output('out.mp4',
	 * ['-crf' => '23']) used to produce
	 * ['ffmpeg', '-i', '-crf', '23', 'out.mp4'], i.e. ffmpeg would try to
	 * open a file literally named "-crf". Rejecting the empty path
	 * outright makes that impossible.
	 */
	public function test_add_input_rejects_empty_path(): void {
		$this->expectException( \InvalidArgumentException::class );
		( new FFmpeg_Command( 'ffmpeg' ) )->add_input( '' );
	}

	public function test_add_input_rejects_whitespace_only_path(): void {
		$this->expectException( \InvalidArgumentException::class );
		( new FFmpeg_Command( 'ffmpeg' ) )->add_input( '   ' );
	}

	public function test_add_output_rejects_empty_path(): void {
		$this->expectException( \InvalidArgumentException::class );
		( new FFmpeg_Command( 'ffmpeg' ) )->add_output( '' );
	}

	// -----------------------------------------------------------------
	// parse_options() (via add_input/add_output) -- associative expansion
	// and the "0 is a real value" rule.
	// -----------------------------------------------------------------

	public function test_associative_option_expands_to_flag_and_value(): void {
		$command = ( new FFmpeg_Command( 'ffmpeg' ) )
			->add_output( 'out.mp4', array( '-crf' => '23' ) )
			->to_array();

		$this->assertSame( array( 'ffmpeg', '-crf', '23', 'out.mp4' ), $command );
	}

	public function test_associative_option_with_empty_string_value_is_dropped_entirely(): void {
		// Prevents an orphaned flag with no value shifting later arguments.
		$command = ( new FFmpeg_Command( 'ffmpeg' ) )
			->add_output( 'out.mp4', array( '-map_metadata' => '' ) )
			->to_array();

		$this->assertSame( array( 'ffmpeg', 'out.mp4' ), $command );
	}

	public function test_associative_option_with_zero_value_is_kept(): void {
		// 0 is a legitimate ffmpeg value (e.g. a CRF or stream index) and
		// must not be treated the same as an empty/unset value.
		$command = ( new FFmpeg_Command( 'ffmpeg' ) )
			->add_output( 'out.mp4', array( '-crf' => 0 ) )
			->to_array();

		$this->assertSame( array( 'ffmpeg', '-crf', '0', 'out.mp4' ), $command );
	}

	public function test_associative_option_with_string_zero_value_is_kept(): void {
		$command = ( new FFmpeg_Command( 'ffmpeg' ) )
			->add_output( 'out.mp4', array( '-crf' => '0' ) )
			->to_array();

		$this->assertSame( array( 'ffmpeg', '-crf', '0', 'out.mp4' ), $command );
	}

	public function test_sequential_options_pass_through_unchanged(): void {
		// Legacy/plain-flag-list behavior: no key => value expansion.
		$command = ( new FFmpeg_Command( 'ffmpeg' ) )
			->add_output( 'out.mp4', array( '-an', '-vn' ) )
			->to_array();

		$this->assertSame( array( 'ffmpeg', '-an', '-vn', 'out.mp4' ), $command );
	}

	/**
	 * A sequential (non-associative) empty-string entry survives
	 * parse_options() (which only filters *associative* empty pairs) but
	 * is still stripped by to_array()'s own final cleanup pass -- two
	 * separate layers doing related but distinct filtering.
	 */
	public function test_sequential_empty_string_entry_is_stripped_by_final_cleanup(): void {
		$command = ( new FFmpeg_Command( 'ffmpeg' ) )
			->add_output( 'out.mp4', array( '-an', '' ) )
			->to_array();

		$this->assertSame( array( 'ffmpeg', '-an', 'out.mp4' ), $command );
	}

	// -----------------------------------------------------------------
	// from_array() -- round-trip parsing.
	// -----------------------------------------------------------------

	public function test_from_array_detects_executable(): void {
		$builder = FFmpeg_Command::from_array( array( '/usr/bin/ffmpeg', '-i', 'in.mp4', 'out.mp4' ) );

		$this->assertSame( array( '/usr/bin/ffmpeg', '-i', 'in.mp4', 'out.mp4' ), $builder->to_array() );
	}

	public function test_from_array_does_not_treat_a_leading_flag_as_the_executable(): void {
		$builder = FFmpeg_Command::from_array( array( '-y', '-i', 'in.mp4', 'out.mp4' ) );

		$this->assertSame( array( '-y', '-i', 'in.mp4', 'out.mp4' ), $builder->to_array() );
	}

	/**
	 * Options appearing before the *first* -i become global options, not
	 * options specific to that first input -- an easy rule to invert.
	 */
	public function test_from_array_treats_options_before_first_input_as_global(): void {
		$builder = FFmpeg_Command::from_array( array( 'ffmpeg', '-y', '-i', 'in.mp4', 'out.mp4' ) );

		$this->assertSame( array( '-y' ), $builder->get_global_options() );
		$this->assertSame( array(), $builder->get_input_options( 0 ) );
	}

	public function test_from_array_treats_options_before_a_second_input_as_input_specific(): void {
		$builder = FFmpeg_Command::from_array(
			array( 'ffmpeg', '-i', 'in1.mp4', '-ss', '5', '-i', 'in2.mp4', 'out.mp4' )
		);

		$this->assertSame( array(), $builder->get_input_options( 0 ) );
		$this->assertSame( array( '-ss', '5' ), $builder->get_input_options( 1 ) );
	}

	public function test_from_array_treats_trailing_options_as_output_with_last_item_as_path(): void {
		$builder = FFmpeg_Command::from_array( array( 'ffmpeg', '-i', 'in.mp4', '-vcodec', 'libx264', 'out.mp4' ) );

		$this->assertSame( array( '-vcodec', 'libx264' ), $builder->get_output_options( 0 ) );
	}

	public function test_from_array_round_trips_a_built_command(): void {
		$original = ( new FFmpeg_Command( 'ffmpeg' ) )
			->add_global_option( '-y' )
			->add_input( 'in.mp4', array( '-ss' => '5' ) )
			->add_output( 'out.mp4', array( '-vcodec' => 'libx264', '-crf' => '0' ) )
			->to_array();

		$rebuilt = FFmpeg_Command::from_array( $original )->to_array();

		$this->assertSame( $original, $rebuilt );
	}

	public function test_from_array_of_empty_array_produces_empty_command(): void {
		$builder = FFmpeg_Command::from_array( array() );

		$this->assertSame( array(), $builder->to_array() );
	}

	// -----------------------------------------------------------------
	// Accessors and clear_*() mutators.
	// -----------------------------------------------------------------

	public function test_set_input_options_replaces_existing_options(): void {
		$builder = ( new FFmpeg_Command( 'ffmpeg' ) )->add_input( 'in.mp4', array( '-ss' => '5' ) );
		$builder->set_input_options( 0, array( '-ss' => '10' ) );

		$this->assertSame( array( '-ss', '10' ), $builder->get_input_options( 0 ) );
	}

	public function test_set_output_options_replaces_existing_options(): void {
		$builder = ( new FFmpeg_Command( 'ffmpeg' ) )->add_output( 'out.mp4', array( '-crf' => '23' ) );
		$builder->set_output_options( 0, array( '-crf' => '18' ) );

		$this->assertSame( array( '-crf', '18' ), $builder->get_output_options( 0 ) );
	}

	public function test_get_input_options_returns_empty_array_for_unknown_index(): void {
		$builder = new FFmpeg_Command( 'ffmpeg' );

		$this->assertSame( array(), $builder->get_input_options( 5 ) );
	}

	public function test_clear_inputs_removes_all_inputs(): void {
		$builder = ( new FFmpeg_Command( 'ffmpeg' ) )->add_input( 'in.mp4' )->add_output( 'out.mp4' );
		$builder->clear_inputs();

		$this->assertSame( array( 'ffmpeg', 'out.mp4' ), $builder->to_array() );
	}

	public function test_clear_outputs_removes_all_outputs(): void {
		$builder = ( new FFmpeg_Command( 'ffmpeg' ) )->add_input( 'in.mp4' )->add_output( 'out.mp4' );
		$builder->clear_outputs();

		$this->assertSame( array( 'ffmpeg', '-i', 'in.mp4' ), $builder->to_array() );
	}

	// -----------------------------------------------------------------
	// The string-form API no longer exists.
	// -----------------------------------------------------------------

	public function test_string_conversion_methods_were_removed(): void {
		$this->assertFalse( method_exists( FFmpeg_Command::class, 'to_string' ) );
		$this->assertFalse( method_exists( FFmpeg_Command::class, '__toString' ) );
	}
}
