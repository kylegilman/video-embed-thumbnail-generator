<?php

namespace Videopack\Admin;

class Option_Watermark {

	/**
	 * Watermark URL
	 * @var string $url
	 */
	public $url;

	/**
	 * Watermark scale
	 * @var int $scale
	 */
	public $scale;

	/**
	 * Watermark horizontal alignment
	 * @var string $align
	 */
	public $align;

	/**
	 * Watermark vertical alignment
	 * @var string $valign
	 */
	public $valign;

	/**
	 * Watermark horizontal offset
	 * @var int $x
	 */
	public $x;

	/**
	 * Watermark vertical offset
	 * @var int $y
	 */
	public $y;

	public function __construct(
		string $url = '',
		int $scale = 50,
		string $align = 'center',
		string $valign = 'center',
		int $x = 0,
		int $y = 0
	) {
		$this->url    = $url;
		$this->scale  = $scale;
		$this->align  = $align;
		$this->valign = $valign;
		$this->x      = $x;
		$this->y      = $y;
	}
}
