import { sendGoogleAnalytics, videoCounter } from './analytics';

describe( 'sendGoogleAnalytics', () => {
	afterEach( () => {
		delete window.gtag;
	} );

	it( 'calls gtag when present', () => {
		window.gtag = jest.fn();
		sendGoogleAnalytics( 'Play Start', 'My Video' );
		expect( window.gtag ).toHaveBeenCalledWith( 'event', 'Play Start', {
			event_category: 'Videos',
			event_label: 'My Video',
		} );
	} );

	it( 'does not throw when gtag is absent', () => {
		expect( () =>
			sendGoogleAnalytics( 'Play Start', 'My Video' )
		).not.toThrow();
	} );

	it( 'always dispatches a generic videopack:analytics DOM event', () => {
		const handler = jest.fn();
		document.addEventListener( 'videopack:analytics', handler );
		sendGoogleAnalytics( 'Pause', 'My Video' );
		expect( handler ).toHaveBeenCalledTimes( 1 );
		expect( handler.mock.calls[ 0 ][ 0 ].detail ).toEqual( {
			event: 'Pause',
			label: 'My Video',
		} );
		document.removeEventListener( 'videopack:analytics', handler );
	} );
} );

describe( 'videoCounter', () => {
	let fetchMock;

	beforeEach( () => {
		document.body.innerHTML = `
			<div class="videopack-wrapper">
				<div class="videopack-view-count"><span>3 views</span></div>
				<div class="videopack-player" data-id="42"></div>
			</div>
		`;

		global.videopack_l10n = {
			playstart: 'Play Start',
			resume: 'Resume',
			pause: 'Pause',
			seek: 'Seek',
			end: 'Complete View',
		};
		global.videopack_config = {
			ajax_url: 'https://example.com/wp-admin/admin-ajax.php',
			count_play_nonce: 'test-nonce',
		};

		fetchMock = jest.fn( () =>
			Promise.resolve( {
				json: () =>
					Promise.resolve( {
						success: true,
						data: { views: '4 views' },
					} ),
			} )
		);
		global.fetch = fetchMock;

		window.videopack = {
			getPlayerVars: jest.fn( () => ( {
				title: 'My Video',
				countable: true,
				count_views: 'start',
				attachment_id: 7,
			} ) ),
		};
	} );

	afterEach( () => {
		delete global.videopack_l10n;
		delete global.videopack_config;
		delete global.fetch;
		delete window.videopack;
		jest.restoreAllMocks();
	} );

	it( 'does nothing if the player wrapper is not found', () => {
		videoCounter( 'does-not-exist', 'play' );
		expect( fetchMock ).not.toHaveBeenCalled();
	} );

	it( 'does nothing if getPlayerVars returns nothing', () => {
		window.videopack.getPlayerVars = jest.fn( () => null );
		videoCounter( '42', 'play' );
		expect( fetchMock ).not.toHaveBeenCalled();
	} );

	it( 'marks the player as played and counts on first play', () => {
		const wrapper = document.querySelector( '.videopack-player' );
		videoCounter( '42', 'play' );
		expect( wrapper.dataset.played ).toBe( 'played' );
		expect( fetchMock ).toHaveBeenCalledTimes( 1 );

		const [ url, options ] = fetchMock.mock.calls[ 0 ];
		expect( url ).toBe( 'https://example.com/wp-admin/admin-ajax.php' );
		expect( options.method ).toBe( 'POST' );
		const body = new URLSearchParams( options.body );
		expect( body.get( 'action' ) ).toBe( 'count_play' );
		expect( body.get( 'security' ) ).toBe( 'test-nonce' );
		expect( body.get( 'attachment_id' ) ).toBe( '7' );
		expect( body.get( 'video_event' ) ).toBe( 'play' );
	} );

	it( 'does not re-count a resumed play', () => {
		const wrapper = document.querySelector( '.videopack-player' );
		wrapper.dataset.played = 'played';
		videoCounter( '42', 'play' );
		expect( fetchMock ).not.toHaveBeenCalled();
	} );

	it( 'optimistically increments the displayed view count immediately', () => {
		videoCounter( '42', 'play' );
		const span = document.querySelector( '.videopack-view-count span' );
		expect( span.textContent ).toBe( '4 views' );
	} );

	it( 'overwrites the optimistic count with the authoritative server value', async () => {
		videoCounter( '42', 'play' );
		// Allow the mocked fetch promise chain to resolve.
		await Promise.resolve();
		await Promise.resolve();
		const span = document.querySelector( '.videopack-view-count span' );
		expect( span.innerHTML ).toBe( '4 views' );
	} );

	it( 'does not count when count_views is disabled', () => {
		window.videopack.getPlayerVars = jest.fn( () => ( {
			title: 'My Video',
			countable: true,
			count_views: false,
			attachment_id: 7,
		} ) );
		videoCounter( '42', 'play' );
		expect( fetchMock ).not.toHaveBeenCalled();
	} );

	it( 'counts quarter-play events when count_views is "quarters"', () => {
		window.videopack.getPlayerVars = jest.fn( () => ( {
			title: 'My Video',
			countable: true,
			count_views: 'quarters',
			attachment_id: 7,
		} ) );
		videoCounter( '42', '25' );
		expect( fetchMock ).toHaveBeenCalledTimes( 1 );
		const body = new URLSearchParams( fetchMock.mock.calls[ 0 ][ 1 ].body );
		expect( body.get( 'video_event' ) ).toBe( '25' );
	} );

	it( 'counts "end" for start_complete mode but not quarters', () => {
		window.videopack.getPlayerVars = jest.fn( () => ( {
			title: 'My Video',
			countable: true,
			count_views: 'start_complete',
			attachment_id: 7,
		} ) );
		videoCounter( '42', '25' );
		expect( fetchMock ).not.toHaveBeenCalled();

		videoCounter( '42', 'end' );
		expect( fetchMock ).toHaveBeenCalledTimes( 1 );
	} );
} );
