<?php
namespace Videopack\Tests;

use PHPUnit\Framework\TestCase;
use Videopack\Common\Validate;

class ValidateTest extends TestCase {

	public function test_filter_validate_url_with_standard_url() {
		$this->assertTrue( Validate::filter_validate_url( 'https://example.com' ) );
		$this->assertTrue( Validate::filter_validate_url( 'https://sub.example.com/path?query=val' ) );
	}

	public function test_filter_validate_url_with_invalid_url() {
		$this->assertFalse( Validate::filter_validate_url( 'not-a-url' ) );
		$this->assertFalse( Validate::filter_validate_url( 'http://' ) );
	}

	public function test_filter_validate_url_with_multibyte_characters() {
		// Validates that international domains containing non-ASCII characters resolve successfully
		$this->assertTrue( Validate::filter_validate_url( 'https://münchen.de' ) );
		$this->assertTrue( Validate::filter_validate_url( 'https://域.com' ) );
	}
}
