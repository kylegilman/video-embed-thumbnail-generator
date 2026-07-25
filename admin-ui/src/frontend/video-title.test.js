import { setupVideoTitle } from './video-title';

function makeEmitter() {
	const handlers = {};
	return {
		on: jest.fn( ( event, handler ) => {
			handlers[ event ] = handler;
		} ),
		trigger: ( event ) => handlers[ event ] && handlers[ event ](),
	};
}

describe( 'setupVideoTitle', () => {
	beforeEach( () => {
		document.body.innerHTML = `
			<div class="videopack-player">
				<div class="videopack-video-title"></div>
			</div>
		`;
	} );

	it( 'hides the title on play and shows it on pause, for a Video.js-style player (player.on)', () => {
		const player = makeEmitter();
		const playerWrapper = document.querySelector( '.videopack-player' );
		const title = document.querySelector( '.videopack-video-title' );

		setupVideoTitle( playerWrapper, player, { embed_method: 'Video.js' } );

		player.trigger( 'play' );
		expect( title.classList.contains( 'videopack-video-title-visible' ) ).toBe( false );

		player.trigger( 'pause' );
		expect( title.classList.contains( 'videopack-video-title-visible' ) ).toBe( true );

		player.trigger( 'ended' );
		expect( title.classList.contains( 'videopack-video-title-visible' ) ).toBe( true );
	} );

	it( 'hides the title on play and shows it on pause, for a MediaElement.js player (player.media)', () => {
		document.body.innerHTML = `
			<div class="videopack-player">
				<div class="videopack-video-title"></div>
				<video></video>
			</div>
		`;
		const playerWrapper = document.querySelector( '.videopack-player' );
		const video = document.querySelector( 'video' );
		const title = document.querySelector( '.videopack-video-title' );
		const player = { media: video };

		setupVideoTitle( playerWrapper, player, { embed_method: 'WordPress Default' } );

		video.dispatchEvent( new Event( 'play' ) );
		expect( title.classList.contains( 'videopack-video-title-visible' ) ).toBe( false );

		video.dispatchEvent( new Event( 'pause' ) );
		expect( title.classList.contains( 'videopack-video-title-visible' ) ).toBe( true );
	} );

	it( 'also toggles a .videopack-meta-wrapper found in the parent .videopack-wrapper', () => {
		document.body.innerHTML = `
			<div class="videopack-wrapper">
				<div class="videopack-meta-wrapper"></div>
				<div class="videopack-player"></div>
			</div>
		`;
		const playerWrapper = document.querySelector( '.videopack-player' );
		const meta = document.querySelector( '.videopack-meta-wrapper' );
		const player = makeEmitter();

		setupVideoTitle( playerWrapper, player, { embed_method: 'Video.js' } );

		player.trigger( 'play' );
		expect( meta.classList.contains( 'videopack-video-title-visible' ) ).toBe( false );
		player.trigger( 'pause' );
		expect( meta.classList.contains( 'videopack-video-title-visible' ) ).toBe( true );
	} );
} );
