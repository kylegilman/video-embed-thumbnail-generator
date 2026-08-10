import {
	getDownloadPlayerRect,
	alignDownloadDropdownMenu,
	alignDownloadSubmenu,
	getShareUrl,
	changeStartAt,
} from './meta-bar';

function mockRect( overrides ) {
	return {
		top: 0,
		left: 0,
		right: 100,
		bottom: 100,
		width: 100,
		height: 100,
		...overrides,
	};
}

describe( 'getDownloadPlayerRect', () => {
	it( 'returns the bounding rect of the closest player container', () => {
		document.body.innerHTML =
			'<div class="videopack-wrapper"><div class="inner"></div></div>';
		const inner = document.querySelector( '.inner' );
		const rect = mockRect( { right: 640 } );
		document.querySelector( '.videopack-wrapper' ).getBoundingClientRect =
			() => rect;
		expect( getDownloadPlayerRect( inner ) ).toBe( rect );
	} );

	it( 'returns null when no player container is found', () => {
		document.body.innerHTML = '<div class="inner"></div>';
		expect(
			getDownloadPlayerRect( document.querySelector( '.inner' ) )
		).toBeNull();
	} );
} );

describe( 'alignDownloadDropdownMenu', () => {
	it( 'adds align-right when the menu overflows the right edge', () => {
		document.body.innerHTML =
			'<div class="menu"></div><div class="trigger"></div>';
		const menu = document.querySelector( '.menu' );
		const trigger = document.querySelector( '.trigger' );
		menu.getBoundingClientRect = () =>
			mockRect( { right: 700, left: 500, top: 10, bottom: 50 } );
		const playerRect = mockRect( {
			left: 0,
			right: 640,
			top: 0,
			bottom: 400,
		} );

		alignDownloadDropdownMenu( menu, trigger, playerRect );

		expect( menu.classList.contains( 'align-right' ) ).toBe( true );
		expect( menu.classList.contains( 'align-left' ) ).toBe( false );
	} );

	it( 'adds opens-above when the menu overflows the bottom edge, unless that pushes it above the top', () => {
		document.body.innerHTML =
			'<div class="menu"></div><div class="trigger"></div>';
		const menu = document.querySelector( '.menu' );
		const trigger = document.querySelector( '.trigger' );
		menu.getBoundingClientRect = () =>
			mockRect( { top: 350, bottom: 450, left: 10, right: 100 } );
		const playerRect = mockRect( {
			left: 0,
			right: 640,
			top: 0,
			bottom: 400,
		} );

		alignDownloadDropdownMenu( menu, trigger, playerRect );

		expect( menu.classList.contains( 'opens-above' ) ).toBe( true );
	} );

	it( 'does nothing when any argument is missing', () => {
		expect( () =>
			alignDownloadDropdownMenu( null, null, null )
		).not.toThrow();
	} );
} );

describe( 'alignDownloadSubmenu', () => {
	it( 'opens right when there is more room on the right', () => {
		document.body.innerHTML =
			'<div class="submenu"></div><div class="trigger"></div>';
		const submenu = document.querySelector( '.submenu' );
		const trigger = document.querySelector( '.trigger' );
		Object.defineProperty( submenu, 'offsetWidth', {
			value: 150,
			configurable: true,
		} );
		trigger.getBoundingClientRect = () =>
			mockRect( { left: 50, right: 100 } );
		const playerRect = mockRect( { left: 0, right: 640 } );

		alignDownloadSubmenu( submenu, trigger, playerRect );

		expect( submenu.classList.contains( 'opens-right' ) ).toBe( true );
		expect( submenu.classList.contains( 'opens-left' ) ).toBe( false );
	} );

	it( 'flips to opens-left when the submenu is inside a title-meta area and there is more room on the left', () => {
		document.body.innerHTML =
			'<div class="is-inside-title-meta"><div class="submenu"></div><div class="trigger"></div></div>';
		const submenu = document.querySelector( '.submenu' );
		const trigger = document.querySelector( '.trigger' );
		Object.defineProperty( submenu, 'offsetWidth', {
			value: 50,
			configurable: true,
		} );
		trigger.getBoundingClientRect = () =>
			mockRect( { left: 500, right: 550 } );
		const playerRect = mockRect( { left: 0, right: 640 } );

		alignDownloadSubmenu( submenu, trigger, playerRect );

		expect( submenu.classList.contains( 'opens-left' ) ).toBe( true );
	} );
} );

describe( 'getShareUrl', () => {
	const originalLocation = window.location.href;

	afterEach( () => {
		window.history.replaceState( null, '', originalLocation );
	} );

	it( 'returns the current URL stripped of existing time params when start-at is not enabled', () => {
		window.history.replaceState( null, '', '/video/?t=30' );
		document.body.innerHTML = '<div class="wrapper"></div>';
		const url = getShareUrl( document.querySelector( '.wrapper' ) );
		expect( url ).not.toContain( 't=30' );
	} );

	it( 'appends the start-at time when the checkbox is enabled', () => {
		window.history.replaceState( null, '', '/video/' );
		document.body.innerHTML = `
			<div class="wrapper">
				<div class="videopack-share-container">
					<input type="checkbox" class="videopack-start-at-enable" checked>
					<input type="text" class="videopack-start-at" value="01:05">
				</div>
			</div>
		`;
		const url = getShareUrl( document.querySelector( '.wrapper' ) );
		expect( url ).toContain( 't=65' );
	} );

	it( 'does not append a time param when the checkbox is unchecked', () => {
		window.history.replaceState( null, '', '/video/' );
		document.body.innerHTML = `
			<div class="wrapper">
				<div class="videopack-share-container">
					<input type="checkbox" class="videopack-start-at-enable">
					<input type="text" class="videopack-start-at" value="01:05">
				</div>
			</div>
		`;
		const url = getShareUrl( document.querySelector( '.wrapper' ) );
		expect( url ).not.toContain( 't=' );
	} );
} );

describe( 'changeStartAt', () => {
	it( 'adds a videopack[start] param to the embedded iframe src when enabled', () => {
		document.body.innerHTML = `
			<div class="wrapper">
				<div class="videopack-share-container">
					<input type="checkbox" class="videopack-start-at-enable" checked>
					<input type="text" class="videopack-start-at" value="00:30">
					<textarea class="videopack-embed-code">&lt;iframe src="https://example.com/embed/42"&gt;&lt;/iframe&gt;</textarea>
				</div>
			</div>
		`;
		changeStartAt( document.querySelector( '.wrapper' ) );
		const textarea = document.querySelector( '.videopack-embed-code' );
		expect( textarea.value ).toContain( 'videopack[start]=00%3A30' );
	} );

	it( 'removes the videopack[start] param when disabled', () => {
		document.body.innerHTML = `
			<div class="wrapper">
				<div class="videopack-share-container">
					<input type="checkbox" class="videopack-start-at-enable">
					<input type="text" class="videopack-start-at" value="00:30">
					<textarea class="videopack-embed-code">&lt;iframe src="https://example.com/embed/42?videopack[start]=00:10"&gt;&lt;/iframe&gt;</textarea>
				</div>
			</div>
		`;
		changeStartAt( document.querySelector( '.wrapper' ) );
		const textarea = document.querySelector( '.videopack-embed-code' );
		expect( textarea.value ).not.toContain( 'videopack' );
	} );

	it( 'does nothing when the embed code has no iframe', () => {
		document.body.innerHTML = `
			<div class="wrapper">
				<div class="videopack-share-container">
					<input type="checkbox" class="videopack-start-at-enable">
					<input type="text" class="videopack-start-at" value="00:30">
					<textarea class="videopack-embed-code">not an iframe</textarea>
				</div>
			</div>
		`;
		expect( () =>
			changeStartAt( document.querySelector( '.wrapper' ) )
		).not.toThrow();
	} );
} );
