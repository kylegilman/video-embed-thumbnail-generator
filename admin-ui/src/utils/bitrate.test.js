import { calculateBitrate } from './bitrate';

// H.264's tuning values, as the server sends them.
const h264 = {
	default: 1,
	coefficient: 0.004404,
	exponent: 0.92,
	min_bitrate: 50,
	high_fps: 48,
	high_fps_factor: 1.5,
};

const av1 = { ...h264, coefficient: 0.005214, exponent: 0.86 };

describe( 'calculateBitrate', () => {
	it( 'uses coefficient * pixels^exponent at the default quality', () => {
		// 0.004404 * 921600^0.92 = 1352.8.
		expect( calculateBitrate( h264, 1280, 720, 1 ) ).toBe( 1353 );
		// 0.004404 * 230400^0.92 = 377.7.
		expect( calculateBitrate( h264, 640, 360, 1 ) ).toBe( 378 );
		// 0.004404 * 2073600^0.92 = 2852.6.
		expect( calculateBitrate( h264, 1920, 1080, 1 ) ).toBe( 2853 );
	} );

	it( 'scales linearly with the quality setting', () => {
		expect( calculateBitrate( h264, 1280, 720, 1.5 ) ).toBe( 2029 );
		expect( calculateBitrate( h264, 1280, 720, 0.5 ) ).toBe( 676 );
	} );

	it( 'follows each codec its own curve', () => {
		// 0.005214 * 2073600^0.86 = 1411.1.
		expect( calculateBitrate( av1, 1920, 1080, 1 ) ).toBe( 1411 );
	} );

	it( 'stays positive at small sizes instead of going negative', () => {
		// 0.005214 * 76800^0.86 = 82.9.
		expect( calculateBitrate( av1, 320, 240, 1 ) ).toBe( 83 );
	} );

	it( 'never returns less than the minimum bitrate', () => {
		expect( calculateBitrate( h264, 1280, 720, 0.01 ) ).toBe( 50 );
	} );

	it( 'scales high frame rate sources by the high frame rate factor', () => {
		expect( calculateBitrate( h264, 1280, 720, 1, 60 ) ).toBe( 2029 );
		expect( calculateBitrate( h264, 1280, 720, 1, 48 ) ).toBe( 2029 );
		expect( calculateBitrate( h264, 1280, 720, 1, 47.9 ) ).toBe( 1353 );
		expect( calculateBitrate( h264, 1280, 720, 1, 24 ) ).toBe( 1353 );
	} );
} );
