<?php
/**
 * Tests for Metadata -- Open Graph video meta tag generation
 * (print_scripts()), first-embedded-video discovery
 * (get_first_embedded_video(), built on Video_Finder), and the
 * multi-source description fallback chain (generate_video_description()).
 * Previously completely untested.
 */

use Videopack\Frontend\Metadata;

class MetadataTest extends WP_UnitTestCase {

	/**
	 * A real uploaded video attachment, shared across the class.
	 *
	 * @var int
	 */
	protected static $video_id;

	public static function wpSetUpBeforeClass( $factory ) {
		$file           = dirname( __DIR__ ) . '/src/images/Adobestock_287460179.mp4';
		self::$video_id = $factory->attachment->create_upload_object( $file );
	}

	protected function options( array $overrides = array() ): array {
		return array_merge( get_option( 'videopack_options', array() ), $overrides );
	}

	protected function metadata( array $options = array() ): Metadata {
		return new Metadata( $this->options( $options ) );
	}

	// -----------------------------------------------------------------
	// build_paired_attributes()
	// -----------------------------------------------------------------

	public function test_build_paired_attributes_formats_a_key_value_pair(): void {
		$this->assertSame( 'width="640"', $this->metadata()->build_paired_attributes( '640', 'width' ) );
	}

	// -----------------------------------------------------------------
	// generate_video_description() -- priority chain.
	// -----------------------------------------------------------------

	public function test_description_attribute_wins_first(): void {
		$result = $this->metadata()->generate_video_description(
			array(
				'description' => 'Explicit description',
				'caption'     => 'A caption',
			)
		);

		$this->assertSame( 'Explicit description', $result );
	}

	public function test_caption_attribute_used_when_no_description(): void {
		$result = $this->metadata()->generate_video_description( array( 'caption' => 'A caption' ) );

		$this->assertSame( 'A caption', $result );
	}

	public function test_literal_string_false_description_is_treated_as_not_set(): void {
		$post_id = self::factory()->post->create( array( 'post_excerpt' => 'The excerpt' ) );
		$post    = get_post( $post_id );

		$result = $this->metadata()->generate_video_description(
			array(
				'description' => 'false',
				'caption'     => 'false',
			),
			$post
		);

		$this->assertSame( 'The excerpt', $result );
	}

	public function test_yoast_meta_description_wins_over_excerpt(): void {
		$post_id = self::factory()->post->create( array( 'post_excerpt' => 'The excerpt' ) );
		update_post_meta( $post_id, '_yoast_wpseo_metadesc', 'Yoast description' );
		$post = get_post( $post_id );

		$result = $this->metadata()->generate_video_description( array(), $post );

		$this->assertSame( 'Yoast description', $result );
	}

	public function test_aioseo_meta_description_used_when_no_yoast(): void {
		$post_id = self::factory()->post->create( array( 'post_excerpt' => 'The excerpt' ) );
		update_post_meta( $post_id, '_aioseop_description', 'AIOSEO description' );
		$post = get_post( $post_id );

		$result = $this->metadata()->generate_video_description( array(), $post );

		$this->assertSame( 'AIOSEO description', $result );
	}

	public function test_excerpt_used_when_no_seo_plugin_meta(): void {
		$post_id = self::factory()->post->create( array( 'post_excerpt' => 'The excerpt' ) );
		$post    = get_post( $post_id );

		$result = $this->metadata()->generate_video_description( array(), $post );

		$this->assertSame( 'The excerpt', $result );
	}

	public function test_content_used_as_final_fallback_with_shortcodes_stripped(): void {
		$post_id = self::factory()->post->create(
			array(
				'post_excerpt' => '',
				'post_content' => '[videopack id="1"] Some real content here for the description fallback.',
			)
		);
		$post = get_post( $post_id );

		$result = $this->metadata()->generate_video_description( array(), $post );

		$this->assertStringNotContainsString( '[videopack', $result );
		$this->assertStringContainsString( 'Some real content', $result );
	}

	public function test_falls_back_to_generic_video_label_when_nothing_else_available(): void {
		$result = $this->metadata()->generate_video_description( array(), null );

		$this->assertSame( 'Video', $result );
	}

	public function test_generate_video_description_is_filterable(): void {
		add_filter(
			'videopack_generate_video_description',
			static function () {
				return 'Filtered description';
			}
		);

		$result = $this->metadata()->generate_video_description( array( 'description' => 'Original' ) );

		remove_all_filters( 'videopack_generate_video_description' );

		$this->assertSame( 'Filtered description', $result );
	}

	// -----------------------------------------------------------------
	// get_first_embedded_video()
	// -----------------------------------------------------------------

	public function test_get_first_embedded_video_returns_empty_url_for_null_post(): void {
		$result = $this->metadata()->get_first_embedded_video( null );

		$this->assertSame( array( 'url' => '' ), $result );
	}

	public function test_get_first_embedded_video_returns_empty_url_for_empty_content(): void {
		$post = get_post( self::factory()->post->create( array( 'post_content' => '' ) ) );

		$this->assertSame( array( 'url' => '' ), $this->metadata()->get_first_embedded_video( $post ) );
	}

	public function test_get_first_embedded_video_returns_empty_url_when_no_video_found(): void {
		$post = get_post( self::factory()->post->create( array( 'post_content' => '<p>no videos here</p>' ) ) );

		$this->assertSame( array( 'url' => '' ), $this->metadata()->get_first_embedded_video( $post ) );
	}

	public function test_get_first_embedded_video_returns_empty_url_for_nonexistent_attachment(): void {
		$post = get_post( self::factory()->post->create( array( 'post_content' => '[videopack id="999999"]' ) ) );

		$this->assertSame( array( 'url' => '' ), $this->metadata()->get_first_embedded_video( $post ) );
	}

	public function test_get_first_embedded_video_resolves_a_real_attachment(): void {
		$post = get_post( self::factory()->post->create( array( 'post_content' => '[videopack id="' . self::$video_id . '"]' ) ) );

		$result = $this->metadata()->get_first_embedded_video( $post );

		$this->assertNotEmpty( $result['url'] );
		$this->assertSame( (string) self::$video_id, $result['id'] );
		$this->assertStringContainsString( 'video/', $result['mime_type'] );
		$this->assertNotEmpty( $result['description'] );
	}

	// -----------------------------------------------------------------
	// print_scripts()
	// -----------------------------------------------------------------

	public function test_print_scripts_outputs_nothing_when_open_graph_disabled(): void {
		$this->go_to( get_permalink( self::factory()->post->create( array( 'post_content' => '[videopack id="' . self::$video_id . '"]' ) ) ) );

		ob_start();
		$this->metadata( array( 'open_graph' => false ) )->print_scripts();
		$output = ob_get_clean();

		$this->assertSame( '', $output );
	}

	public function test_print_scripts_outputs_nothing_without_a_queried_post(): void {
		$this->go_to( home_url( '/' ) );

		ob_start();
		$this->metadata( array( 'open_graph' => true ) )->print_scripts();
		$output = ob_get_clean();

		$this->assertSame( '', $output );
	}

	public function test_print_scripts_outputs_nothing_when_no_video_in_post(): void {
		$this->go_to( get_permalink( self::factory()->post->create( array( 'post_content' => '<p>no video</p>' ) ) ) );

		ob_start();
		$this->metadata( array( 'open_graph' => true ) )->print_scripts();
		$output = ob_get_clean();

		$this->assertSame( '', $output );
	}

	public function test_print_scripts_outputs_og_tags_for_a_real_video(): void {
		$this->go_to( get_permalink( self::factory()->post->create( array( 'post_content' => '[videopack id="' . self::$video_id . '"]' ) ) ) );

		ob_start();
		$this->metadata( array( 'open_graph' => true ) )->print_scripts();
		$output = ob_get_clean();

		$this->assertStringContainsString( 'og:type', $output );
		$this->assertStringContainsString( 'og:video', $output );
		$this->assertStringContainsString( 'og:video:type', $output );
	}

	public function test_print_scripts_upgrades_secure_url_to_https(): void {
		$this->go_to( get_permalink( self::factory()->post->create( array( 'post_content' => '[videopack id="' . self::$video_id . '"]' ) ) ) );

		ob_start();
		$this->metadata( array( 'open_graph' => true ) )->print_scripts();
		$output = ob_get_clean();

		$this->assertMatchesRegularExpression( '/og:video:secure_url" content="https:/', $output );
	}

	public function test_print_scripts_escapes_title_and_description(): void {
		// get_the_title() runs through wptexturize (the default 'the_title'
		// filter), which converts straight quotes to curly-quote entities
		// before esc_attr() ever runs -- so this can't assert a specific
		// esc_attr() transformation of the raw title. What actually matters
		// is that no raw '"' from the title/description can break out of
		// the content="..." attribute; assert that structural property
		// directly instead.
		$this->go_to(
			get_permalink(
				self::factory()->post->create(
					array(
						'post_title'   => 'A "Quoted" Title',
						'post_content' => '[videopack id="' . self::$video_id . '"]',
					)
				)
			)
		);

		ob_start();
		$this->metadata( array( 'open_graph' => true ) )->print_scripts();
		$output = ob_get_clean();

		$this->assertMatchesRegularExpression( '/<meta property="og:title" content="[^"]*" >/', $output );
	}

	public function test_print_scripts_removes_jetpack_og_tags_action(): void {
		add_action( 'wp_head', 'jetpack_og_tags' );
		$this->assertNotFalse( has_action( 'wp_head', 'jetpack_og_tags' ) );

		$this->go_to( get_permalink( self::factory()->post->create( array( 'post_content' => '[videopack id="' . self::$video_id . '"]' ) ) ) );

		ob_start();
		$this->metadata( array( 'open_graph' => true ) )->print_scripts();
		ob_get_clean();

		$this->assertFalse( has_action( 'wp_head', 'jetpack_og_tags' ) );
	}
}
