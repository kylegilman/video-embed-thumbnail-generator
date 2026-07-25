import {
	groupSourcesByResolution,
	convertToTimecode,
	convertFromTimecode,
	stripTimeParams,
	addStartTimeParam,
} from './utils';

describe( 'groupSourcesByResolution', () => {
	it( 'groups sources by resolution and sorts descending', () => {
		const sources = [
			{ resolution: '480', type: 'video/mp4' },
			{ resolution: '1080', type: 'video/mp4' },
			{ resolution: '720', type: 'video/mp4' },
		];
		const groups = groupSourcesByResolution( sources );
		expect( groups.map( ( g ) => g.res ) ).toEqual( [ '1080', '720', '480' ] );
	} );

	it( 'keeps every candidate for a resolution offered by multiple codecs', () => {
		const sources = [
			{ resolution: '1080', type: 'video/webm' },
			{ resolution: '1080', type: 'video/mp4' },
			{ resolution: '480', type: 'video/mp4' },
		];
		const groups = groupSourcesByResolution( sources );
		expect( groups[ 0 ].res ).toBe( '1080' );
		expect( groups[ 0 ].candidates ).toHaveLength( 2 );
		expect( groups[ 1 ].candidates ).toHaveLength( 1 );
	} );

	it( 'falls back to data-res when resolution is absent', () => {
		const sources = [ { 'data-res': '360', type: 'video/mp4' } ];
		const groups = groupSourcesByResolution( sources );
		expect( groups ).toEqual( [ { res: '360', candidates: sources } ] );
	} );

	it( 'skips sources with no resolution info', () => {
		const sources = [ { type: 'video/mp4' }, { resolution: '720', type: 'video/mp4' } ];
		const groups = groupSourcesByResolution( sources );
		expect( groups ).toHaveLength( 1 );
		expect( groups[ 0 ].res ).toBe( '720' );
	} );

	it( 'returns an empty array for no sources', () => {
		expect( groupSourcesByResolution( [] ) ).toEqual( [] );
		expect( groupSourcesByResolution( null ) ).toEqual( [] );
	} );
} );

describe( 'convertToTimecode / convertFromTimecode', () => {
	it( 'converts seconds to mm:ss, zero-padded', () => {
		expect( convertToTimecode( 65 ) ).toBe( '01:05' );
		expect( convertToTimecode( 5 ) ).toBe( '00:05' );
		expect( convertToTimecode( 600 ) ).toBe( '10:00' );
	} );

	it( 'round-trips through convertFromTimecode', () => {
		expect( convertFromTimecode( '01:05' ) ).toBeCloseTo( 65 );
		expect( convertFromTimecode( '10:00' ) ).toBeCloseTo( 600 );
	} );

	it( 'handles an hours component', () => {
		expect( convertFromTimecode( '1:02:03' ) ).toBeCloseTo( 3723 );
	} );

	it( 'treats a bare seconds value as seconds', () => {
		expect( convertFromTimecode( '42' ) ).toBeCloseTo( 42 );
	} );
} );

describe( 'stripTimeParams', () => {
	it( 'removes an existing t param', () => {
		expect( stripTimeParams( 'https://example.com/?t=30' ) ).toBe( 'https://example.com/' );
	} );

	it( 'removes an existing start param', () => {
		expect( stripTimeParams( 'https://example.com/?start=30' ) ).toBe( 'https://example.com/' );
	} );

	it( 'preserves other query params', () => {
		expect( stripTimeParams( 'https://example.com/?foo=bar&t=30' ) ).toBe( 'https://example.com/?foo=bar' );
	} );

	it( 'leaves a URL with no time params unchanged', () => {
		expect( stripTimeParams( 'https://example.com/?foo=bar' ) ).toBe( 'https://example.com/?foo=bar' );
	} );
} );

describe( 'addStartTimeParam', () => {
	it( 'appends ?t=<seconds> when there is no existing query string', () => {
		expect( addStartTimeParam( 'https://example.com/', 30 ) ).toBe( 'https://example.com/?t=30' );
	} );

	it( 'appends &t=<seconds> when a query string already exists', () => {
		expect( addStartTimeParam( 'https://example.com/?foo=bar', 30 ) ).toBe( 'https://example.com/?foo=bar&t=30' );
	} );

	it( 'leaves the URL unchanged for zero or negative seconds', () => {
		expect( addStartTimeParam( 'https://example.com/', 0 ) ).toBe( 'https://example.com/' );
		expect( addStartTimeParam( 'https://example.com/', -5 ) ).toBe( 'https://example.com/' );
	} );
} );
