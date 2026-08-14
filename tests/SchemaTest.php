<?php
/**
 * Tests for Schema -- JSON-LD VideoObject markup collected from post
 * content and either handed to an active SEO plugin's own graph, or
 * output as a standalone fallback <script> tag. Previously completely
 * untested despite real logic: content scanning/dedup, per-video field
 * resolution, and -- since this is one of the few places raw content
 * (a video's title, an embed's poster URL) gets echoed straight into
 * <head> -- the JSON-encoding actually has to be XSS-safe.
 */

use Videopack\Frontend\Schema;

class SchemaTest extends WP_UnitTestCase {

	/**
	 * A real uploaded video attachment, shared across the class.
	 *
	 * @var int
	 */
	protected static $attachment_id;

	public static function wpSetUpBeforeClass( $factory ) {
		$file                = dirname( __DIR__ ) . '/src/images/Adobestock_287460179.mp4';
		self::$attachment_id = $factory->attachment->create_upload_object( $file );
	}

	protected function options( array $overrides = array() ): array {
		return array_merge( get_option( 'videopack_options', array() ), $overrides );
	}

	protected function schema( array $options = array() ): Schema {
		return new Schema( $this->options( $options ) );
	}

	protected function go_to_post_with_content( string $content, array $extra = array() ): int {
		$post_id = self::factory()->post->create(
			array_merge( array( 'post_content' => $content, 'post_status' => 'publish' ), $extra )
		);
		$this->go_to( get_permalink( $post_id ) );
		return $post_id;
	}

	/**
	 * Sets a Schema instance's protected $videos collection directly, to
	 * test the SEO-integration/output formatting methods in isolation from
	 * content scanning and Source resolution.
	 */
	protected function with_videos( Schema $schema, array $videos ): Schema {
		$prop = new ReflectionProperty( Schema::class, 'videos' );
		$prop->setAccessible( true );
		$prop->setValue( $schema, $videos );
		return $schema;
	}

	// -----------------------------------------------------------------
	// init() gating.
	// -----------------------------------------------------------------

	public function test_init_does_nothing_when_schema_option_disabled(): void {
		$this->go_to_post_with_content( '[videopack id="' . self::$attachment_id . '"]' );

		$schema = $this->schema( array( 'schema' => false ) );
		$schema->init();

		$this->assertFalse( has_action( 'wp_head', array( $schema, 'output_fallback_json_ld' ) ) );
	}

	public function test_init_does_nothing_when_not_singular(): void {
		self::factory()->post->create( array( 'post_content' => '[videopack id="' . self::$attachment_id . '"]' ) );
		$this->go_to( home_url( '/' ) ); // The blog index, not a singular post.

		$schema = $this->schema();
		$schema->init();

		$this->assertFalse( has_action( 'wp_head', array( $schema, 'output_fallback_json_ld' ) ) );
	}

	public function test_init_does_nothing_when_content_has_no_video(): void {
		$this->go_to_post_with_content( '<p>Just some text, no video here.</p>' );

		$schema = $this->schema();
		$schema->init();

		$this->assertFalse( has_action( 'wp_head', array( $schema, 'output_fallback_json_ld' ) ) );
	}

	public function test_init_registers_fallback_output_for_a_real_video(): void {
		$this->go_to_post_with_content( '[videopack id="' . self::$attachment_id . '"]' );

		$schema = $this->schema();
		$schema->init();

		$this->assertNotFalse( has_action( 'wp_head', array( $schema, 'output_fallback_json_ld' ) ) );
	}

	public function test_init_does_not_register_fallback_when_seo_plugin_claims_integration(): void {
		$this->go_to_post_with_content( '[videopack id="' . self::$attachment_id . '"]' );

		add_filter( 'videopack_schema_integrated_with_seo', '__return_true' );
		$schema = $this->schema();
		$schema->init();
		remove_filter( 'videopack_schema_integrated_with_seo', '__return_true' );

		$this->assertFalse( has_action( 'wp_head', array( $schema, 'output_fallback_json_ld' ) ) );
	}

	// -----------------------------------------------------------------
	// Video collection: resolution, dedup.
	// -----------------------------------------------------------------

	public function test_collects_video_data_for_a_real_attachment(): void {
		$this->go_to_post_with_content( '[videopack id="' . self::$attachment_id . '"]' );

		$schema = $this->schema();
		$schema->init();

		$prop   = new ReflectionProperty( Schema::class, 'videos' );
		$prop->setAccessible( true );
		$videos = $prop->getValue( $schema );

		$this->assertCount( 1, $videos );
		$this->assertSame( 'VideoObject', $videos[0]['@type'] );
		$this->assertSame( (string) wp_get_attachment_url( self::$attachment_id ), $videos[0]['contentUrl'] );
		$this->assertStringContainsString( 'attachment_id=' . self::$attachment_id, $videos[0]['embedUrl'] );
	}

	public function test_dedupes_the_same_video_referenced_twice(): void {
		$content = '[videopack id="' . self::$attachment_id . '"][videopack id="' . self::$attachment_id . '"]';
		$this->go_to_post_with_content( $content );

		$schema = $this->schema();
		$schema->init();

		$prop   = new ReflectionProperty( Schema::class, 'videos' );
		$prop->setAccessible( true );
		$videos = $prop->getValue( $schema );

		$this->assertCount( 1, $videos );
	}

	public function test_url_only_source_has_no_embed_url(): void {
		// A non-existent remote URL won't resolve to a real, existing
		// Source, so this also proves nonexistent sources are skipped
		// rather than producing a broken schema entry.
		$this->go_to_post_with_content( '[videopack src="https://videos.example.test/nonexistent.mp4"]' );

		$schema = $this->schema();
		$schema->init();

		$prop   = new ReflectionProperty( Schema::class, 'videos' );
		$prop->setAccessible( true );
		$videos = $prop->getValue( $schema );

		$this->assertSame( array(), $videos );
	}

	// -----------------------------------------------------------------
	// SEO plugin integrations -- pure formatting, tested in isolation.
	// -----------------------------------------------------------------

	protected function sample_video(): array {
		return array(
			'@type'      => 'VideoObject',
			'name'       => 'Sample Video',
			'contentUrl' => 'https://example.com/video.mp4',
		);
	}

	public function test_rank_math_integration_appends_to_video_object_array(): void {
		$schema = $this->with_videos( $this->schema(), array( $this->sample_video() ) );

		$result = $schema->rank_math_integration( array() );

		$this->assertCount( 1, $result['VideoObject'] );
		$this->assertSame( 'Sample Video', $result['VideoObject'][0]['name'] );
	}

	public function test_rank_math_integration_preserves_existing_video_objects(): void {
		$schema = $this->with_videos( $this->schema(), array( $this->sample_video() ) );

		$result = $schema->rank_math_integration( array( 'VideoObject' => array( array( 'name' => 'Existing' ) ) ) );

		$this->assertCount( 2, $result['VideoObject'] );
	}

	public function test_yoast_integration_adds_context_and_appends_to_graph(): void {
		$schema = $this->with_videos( $this->schema(), array( $this->sample_video() ) );

		$result = $schema->yoast_integration( array( array( '@type' => 'WebPage' ) ) );

		$this->assertCount( 2, $result );
		$this->assertSame( 'https://schema.org', $result[1]['@context'] );
	}

	public function test_seopress_integration_appends_video_data(): void {
		$schema = $this->with_videos( $this->schema(), array( $this->sample_video() ) );

		$result = $schema->seopress_integration( array( array( '@type' => 'WebPage' ) ) );

		$this->assertCount( 2, $result );
	}

	public function test_aioseo_integration_appends_video_data(): void {
		$schema = $this->with_videos( $this->schema(), array( $this->sample_video() ) );

		$result = $schema->aioseo_integration( array( array( '@type' => 'WebPage' ) ) );

		$this->assertCount( 2, $result );
	}

	// -----------------------------------------------------------------
	// output_fallback_json_ld() -- output shape and XSS-safety.
	// -----------------------------------------------------------------

	public function test_output_fallback_json_ld_emits_valid_script_tag_per_video(): void {
		$schema = $this->with_videos( $this->schema(), array( $this->sample_video() ) );

		ob_start();
		$schema->output_fallback_json_ld();
		$output = ob_get_clean();

		$this->assertStringContainsString( '<script type="application/ld+json">', $output );
		preg_match( '#<script type="application/ld\+json">(.*?)</script>#s', $output, $matches );
		$decoded = json_decode( $matches[1] ?? '', true );
		$this->assertSame( 'https://schema.org', $decoded['@context'] );
		$this->assertSame( 'Sample Video', $decoded['name'] );
	}

	/**
	 * A video title containing a literal "</script>" must not be able to
	 * break out of the JSON-LD script tag -- wp_json_encode() escapes
	 * forward slashes by default, so "</script>" becomes "<\/script>" in
	 * the encoded output. This locks that in rather than relying on it
	 * silently continuing to be true.
	 */
	public function test_output_fallback_json_ld_escapes_script_breakout_attempt(): void {
		$malicious = array(
			'@type'      => 'VideoObject',
			'name'       => '</script><script>alert(1)</script>',
			'contentUrl' => 'https://example.com/video.mp4',
		);
		$schema = $this->with_videos( $this->schema(), array( $malicious ) );

		ob_start();
		$schema->output_fallback_json_ld();
		$output = ob_get_clean();

		$this->assertStringNotContainsString( '</script><script>alert(1)</script>', $output );
		$this->assertStringContainsString( '<\/script>', $output );

		// The overall output is still exactly one real script tag -- the
		// injected markup didn't create a second one.
		$this->assertSame( 1, substr_count( $output, '<script type="application/ld+json">' ) );
	}

	public function test_output_fallback_json_ld_emits_one_script_per_video(): void {
		$schema = $this->with_videos(
			$this->schema(),
			array(
				array( '@type' => 'VideoObject', 'name' => 'First', 'contentUrl' => 'https://example.com/1.mp4' ),
				array( '@type' => 'VideoObject', 'name' => 'Second', 'contentUrl' => 'https://example.com/2.mp4' ),
			)
		);

		ob_start();
		$schema->output_fallback_json_ld();
		$output = ob_get_clean();

		$this->assertSame( 2, substr_count( $output, '<script type="application/ld+json">' ) );
	}
}
