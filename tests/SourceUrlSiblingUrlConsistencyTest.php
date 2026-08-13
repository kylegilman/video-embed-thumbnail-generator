<?php
/**
 * Regression test: Encode_Info::check_potential_locations() (the admin
 * Additional Formats panel's "is this format already encoded" check, and
 * what the url-cache-refresh button clears) and
 * Video_Source_Finder::find_format_in_same_url_directory() (the frontend
 * player's own alternate-format discovery, used when 'find_formats' is
 * enabled) must compute the exact same candidate sibling URL for the same
 * source + format -- otherwise they can disagree about whether a format
 * exists, and a cleared cache in one system leaves the other's answer
 * stale.
 *
 * They used to diverge: find_format_in_same_url_directory() built its
 * candidate via Source::get_filename(), which runs the result through
 * sanitize_file_name() (spaces -> hyphens, special characters stripped),
 * while Encode_Info uses Sanitize_Url::noextension, which preserves the
 * original, unsanitized filename via a regex-based extension strip --
 * matching what the real encoder (Encode_Attachment::set_encode_array(),
 * via plain pathinfo(), never sanitize_file_name()) actually names its
 * output. Fixed by having both go through Sanitize_Url.
 */

use Videopack\Admin\Encode\Encode_Info;
use Videopack\Admin\Encode\Encode_Queue_Controller;
use Videopack\Admin\Formats\Registry;
use Videopack\Video_Source\Source_Factory;
use Videopack\Video_Source\Video_Source_Finder;

class SourceUrlSiblingUrlConsistencyTest extends WP_UnitTestCase {

	public function set_up() {
		parent::set_up();
		( new Encode_Queue_Controller( $this->options() ) )->add_table();
	}

	public function tear_down() {
		remove_all_filters( 'videopack_url_exists' );
		parent::tear_down();
	}

	protected function options(): array {
		return get_option( 'videopack_options', array() );
	}

	protected function registry(): Registry {
		return new Registry( $this->options() );
	}

	/**
	 * A URL whose filename needs sanitize_file_name() to change it (a
	 * percent-encoded space) -- exactly the case where the two systems
	 * used to disagree. A literal, unencoded space isn't a valid URL at
	 * all (FILTER_VALIDATE_URL rejects it), which is why this is encoded.
	 */
	protected function tricky_url(): string {
		return 'https://videos.example.test/uploads/My%20Video%20File.mp4';
	}

	public function test_find_format_in_same_url_directory_and_encode_info_agree_on_the_candidate_url(): void {
		$url = $this->tricky_url();

		// Capture what find_format_in_same_url_directory() checks by
		// answering "yes" to whatever URL it asks about and recording it.
		$seen_url = null;
		add_filter(
			'videopack_url_exists',
			static function ( $default, $checked_url ) use ( &$seen_url ) {
				$seen_url = $checked_url;
				return true;
			},
			10,
			2
		);

		$source = Source_Factory::create( $url, $this->options(), $this->registry() );
		$format = $this->registry()->get_video_formats()['h264_720'];
		Video_Source_Finder::find_format_in_same_url_directory( $format, $source );

		$this->assertNotNull( $seen_url, 'find_format_in_same_url_directory() never called url_exists().' );

		// What Encode_Info computes for the same source URL + format.
		$encode_info = new Encode_Info( 0, $url, $format, $this->options(), $this->registry() );

		$this->assertSame( $encode_info->checked_url, $seen_url );
	}
}
