<?php
/**
 * Tests for I18n -- loading the plugin's text domain and formatting the
 * view count with WordPress's own singular/plural and number-formatting
 * rules. Previously completely untested.
 */

use Videopack\Common\I18n;

class I18nTest extends WP_UnitTestCase {

	/**
	 * As of WP 6.7, load_plugin_textdomain() no longer eagerly loads the
	 * .mo file -- it just registers a custom search path on the global
	 * WP_Textdomain_Registry and hands off to just-in-time loading (see
	 * wp-includes/l10n.php's own "@since 6.7.0" note on the sibling
	 * load_muplugin_textdomain()). So the only observable effect here is
	 * that custom path registration, read back via Reflection since the
	 * registry has no public getter for it.
	 */
	protected function registered_custom_path( string $domain ): ?string {
		global $wp_textdomain_registry;

		$property = new ReflectionProperty( $wp_textdomain_registry, 'custom_paths' );
		$property->setAccessible( true );
		$custom_paths = $property->getValue( $wp_textdomain_registry );

		return $custom_paths[ $domain ] ?? null;
	}

	// -----------------------------------------------------------------
	// load_plugin_textdomain()
	// -----------------------------------------------------------------

	/**
	 * Regression test: the third argument to load_plugin_textdomain() must
	 * be relative to WP_PLUGIN_DIR, not the absolute VIDEOPACK_PLUGIN_DIR --
	 * passing an absolute path there doubled it into a nonexistent
	 * directory, silently breaking this plugin's own bundled languages/
	 * translations.
	 */
	public function test_load_plugin_textdomain_registers_the_real_existing_languages_directory(): void {
		( new I18n() )->load_plugin_textdomain();

		$registered_path = $this->registered_custom_path( 'video-embed-thumbnail-generator' );

		$this->assertSame(
			WP_PLUGIN_DIR . '/video-embed-thumbnail-generator/languages',
			$registered_path
		);
		$this->assertDirectoryExists( $registered_path );
	}

	// -----------------------------------------------------------------
	// format_view_count()
	// -----------------------------------------------------------------

	public function test_format_view_count_uses_singular_for_exactly_one(): void {
		$this->assertSame( '1 view', I18n::format_view_count( 1 ) );
	}

	public function test_format_view_count_uses_plural_for_zero(): void {
		$this->assertSame( '0 views', I18n::format_view_count( 0 ) );
	}

	public function test_format_view_count_uses_plural_for_more_than_one(): void {
		$this->assertSame( '2 views', I18n::format_view_count( 2 ) );
	}

	public function test_format_view_count_applies_thousands_separator(): void {
		$this->assertSame( '1,000 views', I18n::format_view_count( 1000 ) );
	}

	public function test_format_view_count_casts_a_numeric_string(): void {
		$this->assertSame( '5 views', I18n::format_view_count( '5' ) );
	}
}
