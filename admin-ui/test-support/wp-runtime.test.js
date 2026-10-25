import * as components from '@wordpress/components';
import * as element from '@wordpress/element';
import React from 'react';
import * as ReactDOM from 'react-dom';

// Component tests are only meaningful if they render the controls WordPress
// itself loads. These fail if the Jest config ever falls back to the copies in
// node_modules, which differ from WordPress's (for example in how RadioControl
// applies `disabled`).
describe( "WordPress's runtime in Jest", () => {
	it( 'resolves @wordpress/components to the copy WordPress loads', () => {
		expect( components.RadioControl ).toBe(
			window.wp.components.RadioControl
		);
	} );

	it( 'resolves @wordpress/element to the copy WordPress loads', () => {
		expect( element.createElement ).toBe( window.wp.element.createElement );
	} );

	it( 'shares WordPress’s React with everything that imports it', () => {
		expect( React ).toBe( window.React );
		expect( ReactDOM.createRoot ).toBe( window.ReactDOM.createRoot );
	} );
} );
