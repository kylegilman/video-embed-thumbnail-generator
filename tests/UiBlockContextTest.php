<?php
/**
 * Tests for Ui::register_videopack_block_context() -- the block_type_metadata
 * filter that wires up Gutenberg's providesContext/usesContext for every
 * Videopack block, and shared design attributes (skin, colors, watermark
 * settings) for the blocks that carry them. Previously completely
 * untested despite being real, substantial logic: get this wrong and
 * child blocks silently stop receiving shared styling/data from their
 * parent player block.
 */

use Videopack\Admin\Ui;
use Videopack\Admin\Formats\Registry;

class UiBlockContextTest extends WP_UnitTestCase {

	protected function options(): array {
		return get_option( 'videopack_options', array() );
	}

	protected function ui(): Ui {
		return new Ui( $this->options(), new Registry( $this->options() ) );
	}

	public function tear_down() {
		remove_all_filters( 'videopack_shared_attributes' );
		remove_all_filters( 'videopack_provides_context' );
		remove_all_filters( 'videopack_uses_context' );
		parent::tear_down();
	}

	// -----------------------------------------------------------------
	// Non-Videopack blocks are left alone entirely.
	// -----------------------------------------------------------------

	public function test_non_videopack_block_is_returned_unchanged(): void {
		$metadata = array( 'name' => 'core/paragraph', 'attributes' => array( 'content' => array( 'type' => 'string' ) ) );

		$this->assertSame( $metadata, $this->ui()->register_videopack_block_context( $metadata ) );
	}

	public function test_metadata_with_no_name_is_returned_unchanged(): void {
		$metadata = array( 'attributes' => array() );

		$this->assertSame( $metadata, $this->ui()->register_videopack_block_context( $metadata ) );
	}

	// -----------------------------------------------------------------
	// Blocks that receive shared design attributes (skin, colors,
	// watermark, etc.) -- collection, player-container, loop.
	// -----------------------------------------------------------------

	public function test_receives_shared_attributes_block_gets_shared_attributes_merged_in(): void {
		$metadata = array(
			'name'       => 'videopack/collection',
			'attributes' => array( 'existingAttr' => array( 'type' => 'string' ) ),
		);

		$result = $this->ui()->register_videopack_block_context( $metadata );

		$this->assertArrayHasKey( 'existingAttr', $result['attributes'], 'must not drop attributes the block already declared' );
		$this->assertArrayHasKey( 'skin', $result['attributes'] );
		$this->assertArrayHasKey( 'watermark_scale', $result['attributes'] );
	}

	public function test_receives_shared_attributes_block_provides_the_full_context_map(): void {
		$metadata = array(
			'name'       => 'videopack/collection',
			'attributes' => array(),
		);

		$result = $this->ui()->register_videopack_block_context( $metadata );

		$this->assertSame( 'skin', $result['providesContext']['videopack/skin'] );
		$this->assertSame( 'watermark_scale', $result['providesContext']['videopack/watermark_scale'] );
	}

	public function test_receives_shared_attributes_preserves_existing_provides_context(): void {
		$metadata = array(
			'name'            => 'videopack/player-container',
			'attributes'      => array(),
			'providesContext' => array( 'videopack/customThing' => 'customThing' ),
		);

		$result = $this->ui()->register_videopack_block_context( $metadata );

		$this->assertSame( 'customThing', $result['providesContext']['videopack/customThing'] );
		$this->assertArrayHasKey( 'videopack/skin', $result['providesContext'] );
	}

	// -----------------------------------------------------------------
	// Other Videopack blocks only provide context for attributes they
	// natively declare -- not the full shared map.
	// -----------------------------------------------------------------

	public function test_non_shared_block_only_provides_context_for_attributes_it_natively_has(): void {
		$metadata = array(
			'name'       => 'videopack/some-other-block',
			'attributes' => array( 'sources' => array( 'type' => 'array' ) ),
		);

		$result = $this->ui()->register_videopack_block_context( $metadata );

		$this->assertSame( array( 'videopack/sources' => 'sources' ), $result['providesContext'] );
	}

	public function test_non_shared_block_with_no_matching_attributes_gets_no_provides_context(): void {
		$metadata = array(
			'name'       => 'videopack/some-other-block',
			'attributes' => array( 'unrelatedAttr' => array( 'type' => 'string' ) ),
		);

		$result = $this->ui()->register_videopack_block_context( $metadata );

		$this->assertArrayNotHasKey( 'providesContext', $result );
	}

	public function test_context_id_mapping_only_added_when_block_declares_the_attribute(): void {
		$with_id = array(
			'name'       => 'videopack/some-other-block',
			'attributes' => array( 'id' => array( 'type' => 'number' ) ),
		);
		$without_id = array(
			'name'       => 'videopack/some-other-block',
			'attributes' => array(),
		);

		$result_with    = $this->ui()->register_videopack_block_context( $with_id );
		$result_without = $this->ui()->register_videopack_block_context( $without_id );

		$this->assertSame( 'id', $result_with['providesContext']['videopack/postId'] );
		$this->assertArrayNotHasKey( 'providesContext', $result_without );
	}

	/**
	 * src/poster/title/caption context mappings are only added on the
	 * frontend (! is_admin()), not the editor -- the editor handles these
	 * manually via VideopackContextBridge instead. is_admin() is false
	 * throughout this test environment (no wp-admin bootstrap), so this
	 * exercises the frontend branch; the admin branch isn't reachable here.
	 */
	public function test_content_attribute_mappings_are_added_on_the_frontend(): void {
		$metadata = array(
			'name'       => 'videopack/some-other-block',
			'attributes' => array( 'src' => array( 'type' => 'string' ) ),
		);

		$result = $this->ui()->register_videopack_block_context( $metadata );

		$this->assertFalse( is_admin(), 'sanity: this test environment is not in wp-admin context' );
		$this->assertSame( 'src', $result['providesContext']['videopack/src'] );
	}

	// -----------------------------------------------------------------
	// usesContext -- only for the fixed list of consumer blocks.
	// -----------------------------------------------------------------

	public function test_consumer_block_gets_uses_context_populated(): void {
		$metadata = array( 'name' => 'videopack/thumbnail', 'attributes' => array() );

		$result = $this->ui()->register_videopack_block_context( $metadata );

		$this->assertContains( 'videopack/skin', $result['usesContext'] );
		$this->assertContains( 'videopack/postId', $result['usesContext'] );
	}

	public function test_uses_context_merges_with_and_deduplicates_existing_values(): void {
		$metadata = array(
			'name'        => 'videopack/thumbnail',
			'attributes'  => array(),
			'usesContext' => array( 'videopack/skin', 'videopack/customExisting' ),
		);

		$result = $this->ui()->register_videopack_block_context( $metadata );

		$this->assertContains( 'videopack/customExisting', $result['usesContext'] );
		$this->assertSame( count( array_unique( $result['usesContext'] ) ), count( $result['usesContext'] ), 'usesContext must not contain duplicates' );
	}

	public function test_non_consumer_block_does_not_get_uses_context(): void {
		$metadata = array( 'name' => 'videopack/some-other-block', 'attributes' => array() );

		$result = $this->ui()->register_videopack_block_context( $metadata );

		$this->assertArrayNotHasKey( 'usesContext', $result );
	}

	// -----------------------------------------------------------------
	// Filterability.
	// -----------------------------------------------------------------

	public function test_shared_attributes_are_filterable(): void {
		add_filter(
			'videopack_shared_attributes',
			static function ( $attrs ) {
				$attrs['my_custom_attr'] = array( 'type' => 'string' );
				return $attrs;
			}
		);

		$metadata = array( 'name' => 'videopack/collection', 'attributes' => array() );
		$result   = $this->ui()->register_videopack_block_context( $metadata );

		$this->assertArrayHasKey( 'my_custom_attr', $result['attributes'] );
	}

	public function test_provides_context_is_filterable(): void {
		add_filter(
			'videopack_provides_context',
			static function ( $ctx ) {
				$ctx['videopack/myCustomAttr'] = 'myCustomAttr';
				return $ctx;
			}
		);

		$metadata = array( 'name' => 'videopack/some-other-block', 'attributes' => array( 'myCustomAttr' => array( 'type' => 'string' ) ) );
		$result   = $this->ui()->register_videopack_block_context( $metadata );

		$this->assertSame( 'myCustomAttr', $result['providesContext']['videopack/myCustomAttr'] );
	}

	public function test_uses_context_is_filterable(): void {
		add_filter(
			'videopack_uses_context',
			static function ( $ctx ) {
				$ctx[] = 'videopack/myCustomContext';
				return $ctx;
			}
		);

		$metadata = array( 'name' => 'videopack/thumbnail', 'attributes' => array() );
		$result   = $this->ui()->register_videopack_block_context( $metadata );

		$this->assertContains( 'videopack/myCustomContext', $result['usesContext'] );
	}
}
