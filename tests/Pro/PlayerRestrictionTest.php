<?php

use Videopack\Player_Pro\Player\Player_Restriction_Subscriber;

class PlayerRestrictionTest extends WP_UnitTestCase {

	protected $subscriber;

	protected function setUp(): void {
		parent::setUp();

		// Verify the Pro add-on class is actually loaded
		if ( ! class_exists( 'Videopack\Player_Pro\Player\Player_Restriction_Subscriber' ) ) {
			$this->markTestSkipped( 'Player Pro add-on is not loaded.' );
		}
	}

	public function test_add_restriction_capability() {
		$subscriber = new Player_Restriction_Subscriber( array() );
		$capabilities = $subscriber->add_restriction_capability( array() );

		$this->assertArrayHasKey( 'view_full_length_video', $capabilities );
		$this->assertEquals( 'read', $capabilities['view_full_length_video'] );
	}

	public function test_filter_sources_by_capability_when_restriction_is_disabled() {
		// restriction disabled (restrict_playback_by_capability => false)
		$subscriber = new Player_Restriction_Subscriber( array(
			'restrict_playback_by_capability' => false
		) );

		$sources = array(
			'1080p'          => 'full-1080p.mp4',
			'trailer_single' => 'trailer.mp4'
		);

		$filtered = $subscriber->filter_sources_by_capability( $sources, array(), null );

		// Should return all sources unmodified
		$this->assertEquals( $sources, $filtered );
	}

	public function test_filter_sources_by_capability_for_unauthorized_user() {
		$subscriber = new Player_Restriction_Subscriber( array(
			'restrict_playback_by_capability' => true
		) );

		// Set current user to a guest/anonymous user who has no capabilities
		wp_set_current_user( 0 );

		$sources = array(
			'1080p'           => 'full-1080p.mp4',
			'trailer_single'  => 'trailer.mp4',
			'trailer_montage' => 'montage.mp4'
		);

		$filtered = $subscriber->filter_sources_by_capability( $sources, array(), null );

		// Should filter out full length, and prioritize single clip trailer over montage
		$expected = array(
			'trailer_single' => 'trailer.mp4'
		);

		$this->assertEquals( $expected, $filtered );
	}

	public function test_filter_sources_by_capability_for_authorized_user() {
		$subscriber = new Player_Restriction_Subscriber( array(
			'restrict_playback_by_capability' => true
		) );

		// Create a standard administrator user and grant them the custom capability
		$admin_id = $this->factory->user->create( array( 'role' => 'administrator' ) );
		$user     = new WP_User( $admin_id );
		$user->add_cap( 'view_full_length_video' );
		wp_set_current_user( $admin_id );

		$sources = array(
			'1080p'          => 'full-1080p.mp4',
			'trailer_single' => 'trailer.mp4'
		);

		$filtered = $subscriber->filter_sources_by_capability( $sources, array(), null );

		// Authorized user should get access to all original sources
		$this->assertEquals( $sources, $filtered );
	}
}
