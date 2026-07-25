import { pickTargetResolution, computeResizeWidth, registerResolutionHandler } from './resolution';

describe( 'pickTargetResolution', () => {
	const resolutionGroups = [
		{ res: '1080', candidates: [] },
		{ res: '720', candidates: [] },
		{ res: '480', candidates: [] },
	];

	it( 'returns null when there is nothing to switch between', () => {
		expect( pickTargetResolution( { containerWidth: 640, aspectRatio: 9 / 16, pixelRatio: false, devicePixelRatio: 1, resolutionGroups: [] } ) ).toBeNull();
		expect( pickTargetResolution( { containerWidth: 640, aspectRatio: 9 / 16, pixelRatio: false, devicePixelRatio: 1, resolutionGroups: [ resolutionGroups[ 0 ] ] } ) ).toBeNull();
	} );

	it( 'picks the smallest resolution that still meets the target height', () => {
		// 640 * (9/16) = 360 -> smallest res >= 360 is 480.
		const target = pickTargetResolution( { containerWidth: 640, aspectRatio: 9 / 16, pixelRatio: false, devicePixelRatio: 1, resolutionGroups } );
		expect( target ).toBe( '480' );
	} );

	it( 'falls back to the largest available resolution when the target exceeds all of them', () => {
		// A huge container needs more than 1080p is available -> falls back to the largest (1080).
		const target = pickTargetResolution( { containerWidth: 3000, aspectRatio: 9 / 16, pixelRatio: false, devicePixelRatio: 1, resolutionGroups } );
		expect( target ).toBe( '1080' );
	} );

	it( 'falls back to the smallest available resolution when the target is smaller than all of them', () => {
		const target = pickTargetResolution( { containerWidth: 100, aspectRatio: 9 / 16, pixelRatio: false, devicePixelRatio: 1, resolutionGroups } );
		expect( target ).toBe( '480' );
	} );

	it( 'scales the target width by devicePixelRatio when pixelRatio is enabled', () => {
		// Without pixel ratio: 400 * (9/16) = 225 -> 480 is enough.
		const withoutPixelRatio = pickTargetResolution( { containerWidth: 400, aspectRatio: 9 / 16, pixelRatio: false, devicePixelRatio: 2, resolutionGroups } );
		expect( withoutPixelRatio ).toBe( '480' );

		// With pixel ratio at 2x: (400*2) * (9/16) = 450 -> still 480, so bump width further to prove the branch is exercised.
		// (400*3) * (9/16) = 675 -> needs 720.
		const withPixelRatio = pickTargetResolution( { containerWidth: 400, aspectRatio: 9 / 16, pixelRatio: true, devicePixelRatio: 3, resolutionGroups } );
		expect( withPixelRatio ).toBe( '720' );
	} );

	it( 'ignores devicePixelRatio when pixelRatio is disabled, even on a high-DPI device', () => {
		// This is the bug from earlier in this project's history: v10 wasn't
		// respecting the pixel_ratio setting at all. Confirm a high-DPI
		// device with pixelRatio explicitly OFF doesn't scale the target.
		const target = pickTargetResolution( { containerWidth: 400, aspectRatio: 9 / 16, pixelRatio: false, devicePixelRatio: 3, resolutionGroups } );
		expect( target ).toBe( '480' );
	} );
} );

describe( 'computeResizeWidth', () => {
	it( 'uses the viewport width when the player itself is fullscreen', () => {
		// The core fullscreen fix: a fullscreen element's ancestors don't
		// reflow (only the element itself expands via browser compositing),
		// so parentOffsetWidth would otherwise stay stale at its pre-fullscreen
		// value — confirm the viewport is used instead whenever isFullscreen is true.
		const width = computeResizeWidth( {
			configuredWidth: 640,
			fullwidth: false,
			isFullscreen: true,
			parentIsBody: false,
			parentOffsetWidth: 300, // stale pre-fullscreen measurement
			viewportWidth: 1920,
		} );
		expect( width ).toBe( 1920 );
	} );

	it( 'uses the viewport width when embedded directly in <body>', () => {
		const width = computeResizeWidth( {
			configuredWidth: 640,
			fullwidth: false,
			isFullscreen: false,
			parentIsBody: true,
			parentOffsetWidth: 300,
			viewportWidth: 1920,
		} );
		expect( width ).toBe( 1920 );
	} );

	it( 'uses the parent width when fullwidth is enabled', () => {
		const width = computeResizeWidth( {
			configuredWidth: 640,
			fullwidth: true,
			isFullscreen: false,
			parentIsBody: false,
			parentOffsetWidth: 900,
			viewportWidth: 1920,
		} );
		expect( width ).toBe( 900 );
	} );

	it( 'uses the configured width when it fits within the parent', () => {
		const width = computeResizeWidth( {
			configuredWidth: 640,
			fullwidth: false,
			isFullscreen: false,
			parentIsBody: false,
			parentOffsetWidth: 900,
			viewportWidth: 1920,
		} );
		expect( width ).toBe( 640 );
	} );

	it( 'clamps to the parent width when the configured width overflows it', () => {
		const width = computeResizeWidth( {
			configuredWidth: 1000,
			fullwidth: false,
			isFullscreen: false,
			parentIsBody: false,
			parentOffsetWidth: 500,
			viewportWidth: 1920,
		} );
		expect( width ).toBe( 500 );
	} );
} );

describe( 'registerResolutionHandler', () => {
	it( 'registers without throwing', () => {
		expect( () => registerResolutionHandler( 'Video.js v10 Beta', () => {} ) ).not.toThrow();
	} );
} );
