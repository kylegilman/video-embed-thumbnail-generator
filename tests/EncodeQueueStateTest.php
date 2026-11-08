<?php
/**
 * Encode_Queue_Controller's queue state: pausing and starting the queue, the
 * heartbeat scheduling, and the queue size and listing helpers.
 *
 * The state methods matter because the queue's play/pause control is the only
 * way an admin can stop encodes from running, and `schedule_heartbeats()` is
 * hooked to `rest_api_init`, so it runs on every REST request the admin screens make.
 */

use Videopack\Admin\Encode\Encode_Queue_Controller;

class EncodeQueueStateTest extends WP_UnitTestCase {

	protected function options(): array {
		return get_option( 'videopack_options', array() );
	}

	protected function controller(): Encode_Queue_Controller {
		return new Encode_Queue_Controller( $this->options() );
	}

	protected function table(): string {
		global $wpdb;
		return $wpdb->prefix . 'videopack_encoding_queue';
	}

	protected function queue_control(): string {
		return (string) ( $this->options()['queue_control'] ?? '' );
	}

	protected function set_queue_control( string $state ): void {
		$options                  = $this->options();
		$options['queue_control'] = $state;
		update_option( 'videopack_options', $options );
	}

	protected function insert_job( string $status, array $overrides = array() ): int {
		global $wpdb;
		$wpdb->insert(
			$this->table(),
			array_merge(
				array(
					'blog_id'       => get_current_blog_id(),
					'attachment_id' => 0,
					'input_url'     => 'https://example.com/video.mp4',
					'format_id'     => 'h264_720',
					'status'        => $status,
					'user_id'       => 0,
				),
				$overrides
			)
		);
		wp_cache_flush();
		return (int) $wpdb->insert_id;
	}

	public function set_up() {
		parent::set_up();
		$this->controller()->add_table();
		as_unschedule_all_actions( 'videopack_process_pending_jobs' );
	}

	public function tear_down() {
		as_unschedule_all_actions( 'videopack_process_pending_jobs' );
		wp_cache_flush();
		parent::tear_down();
	}

	// -----------------------------------------------------------------
	// Pausing and starting.
	// -----------------------------------------------------------------

	public function test_pause_saves_the_paused_state(): void {
		$this->set_queue_control( 'play' );

		$this->controller()->pause();

		$this->assertSame( 'pause', $this->queue_control() );
	}

	public function test_start_saves_the_play_state(): void {
		$this->set_queue_control( 'pause' );

		$this->controller()->start();

		$this->assertSame( 'play', $this->queue_control() );
	}

	public function test_scheduling_the_heartbeats_does_not_undo_a_pause(): void {
		$this->set_queue_control( 'pause' );

		$this->controller()->schedule_heartbeats();

		$this->assertSame( 'pause', $this->queue_control(), 'scheduling only schedules; it must not resume a paused queue' );
	}

	public function test_a_rest_request_does_not_undo_a_pause(): void {
		// schedule_heartbeats() is hooked to rest_api_init, which fires at the start of every
		// REST request, including the queue screen's own polling.
		$this->set_queue_control( 'pause' );

		do_action( 'rest_api_init', rest_get_server() );

		$this->assertSame( 'pause', $this->queue_control() );
	}

	public function test_scheduling_the_heartbeats_does_not_overwrite_settings_saved_since_it_was_built(): void {
		$controller = $this->controller(); // Holds the options as they were just now.

		$options          = $this->options();
		$options['width'] = 777;
		update_option( 'videopack_options', $options );

		$controller->schedule_heartbeats();

		$this->assertSame( 777, (int) $this->options()['width'], 'a stale copy of the options must not be written back' );
	}

	// -----------------------------------------------------------------
	// Heartbeat scheduling.
	// -----------------------------------------------------------------

	public function test_scheduling_the_heartbeats_adds_the_immediate_and_recurring_ones(): void {
		$this->controller()->schedule_heartbeats();

		$this->assertTrue( as_has_scheduled_action( 'videopack_process_pending_jobs', array(), 'videopack_queue_management' ), 'one-off heartbeat' );
		$this->assertTrue( as_has_scheduled_action( 'videopack_process_pending_jobs', array( 'interval' => 300 ), 'videopack_queue_management' ), 'recurring heartbeat' );
	}

	public function test_scheduling_the_heartbeats_repeatedly_does_not_pile_up_duplicates(): void {
		$controller = $this->controller();

		$controller->schedule_heartbeats();
		$controller->schedule_heartbeats();
		$controller->schedule_heartbeats();

		$pending = as_get_scheduled_actions(
			array(
				'hook'   => 'videopack_process_pending_jobs',
				'status' => ActionScheduler_Store::STATUS_PENDING,
			),
			'ids'
		);
		$this->assertCount( 2, $pending, 'exactly one one-off and one recurring heartbeat' );
	}

	public function test_the_immediate_heartbeat_is_a_few_seconds_out_not_instant(): void {
		$before = time();

		$this->controller()->schedule_immediate_heartbeat();

		$next = as_next_scheduled_action( 'videopack_process_pending_jobs', array(), 'videopack_queue_management' );
		$this->assertGreaterThanOrEqual( $before + 5, $next, 'delayed so simultaneous updates batch into one run' );
		$this->assertLessThanOrEqual( time() + 6, $next );
	}

	// -----------------------------------------------------------------
	// Queue size and listing.
	// -----------------------------------------------------------------

	public function test_queue_size_counts_only_active_jobs(): void {
		$this->insert_job( 'queued' );
		$this->insert_job( 'processing' );
		$this->insert_job( 'encoding' );
		$this->insert_job( 'completed' );
		$this->insert_job( 'failed' );
		$this->insert_job( 'canceled' );

		$this->assertSame( 3, $this->controller()->get_queue_size() );
	}

	public function test_queue_size_is_zero_for_an_empty_queue(): void {
		$this->assertSame( 0, $this->controller()->get_queue_size() );
	}

	public function test_queue_items_can_be_limited_to_one_blog_and_are_oldest_first(): void {
		$first  = $this->insert_job( 'queued', array( 'blog_id' => 1, 'created_at' => '2026-01-01 10:00:00' ) );
		$second = $this->insert_job( 'queued', array( 'blog_id' => 1, 'created_at' => '2026-01-01 11:00:00' ) );
		$other  = $this->insert_job( 'queued', array( 'blog_id' => 2, 'created_at' => '2026-01-01 09:00:00' ) );

		$controller = $this->controller();
		$blog_one   = array_map( 'intval', wp_list_pluck( $controller->get_queue_for_blog( 1 ), 'id' ) );
		$network    = array_map( 'intval', wp_list_pluck( $controller->get_queue_for_network(), 'id' ) );

		$this->assertSame( array( $first, $second ), $blog_one );
		$this->assertSame( array( $other, $first, $second ), $network, 'the whole network, oldest first' );
	}

	public function test_the_table_name_uses_the_site_prefix(): void {
		$this->assertSame( $this->table(), $this->controller()->get_table_name() );
	}
}
