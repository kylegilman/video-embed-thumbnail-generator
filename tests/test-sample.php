<?php

class SampleTest extends WP_UnitTestCase {

	public function test_wordpress_is_active() {
		$this->assertTrue( function_exists( 'wp_insert_post' ) );
	}

	public function test_plugin_is_loaded() {
		$this->assertTrue( class_exists( 'Videopack\Common\Sanitizer' ) );
	}

	public function test_create_post_with_factory() {
		// Use WP core factory helper to insert a post into the test database
		$post_id = $this->factory->post->create( array( 'post_title' => 'Test Post' ) );
		$this->assertGreaterThan( 0, $post_id );

		$post = get_post( $post_id );
		$this->assertEquals( 'Test Post', $post->post_title );
	}
}
