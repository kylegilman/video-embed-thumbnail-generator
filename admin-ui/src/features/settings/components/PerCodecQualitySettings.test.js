import { render, screen, fireEvent, act } from '@testing-library/react';
import PerCodecQualitySettings from './PerCodecQualitySettings';

const resolutions = [
	{ id: '240', width: 426, height: 240 },
	{ id: '360', width: 640, height: 360 },
	{ id: '720', width: 1280, height: 720 },
	{ id: '1080', width: 1920, height: 1080 },
];

// The tuning values the server sends in each codec's rate_control.vbr.
const vbrDefaults = {
	default: 1,
	min_bitrate: 50,
	high_fps: 48,
	high_fps_factor: 1.5,
};

const h264 = {
	id: 'h264',
	supported_rate_controls: [ 'crf', 'vbr' ],
	rate_control: {
		crf: { min: 0, max: 51, default: 23 },
		vbr: { ...vbrDefaults, coefficient: 0.004404, exponent: 0.92 },
	},
};

const av1 = {
	id: 'av1',
	supported_rate_controls: [ 'crf', 'vbr' ],
	rate_control: {
		crf: { min: 0, max: 63, default: 35 },
		vbr: { ...vbrDefaults, coefficient: 0.005214, exponent: 0.86 },
	},
};

function renderSettings( { codec = h264, encode = {}, extra = {} } = {} ) {
	const changeHandlerFactory = { encode: jest.fn() };
	const settings = {
		ffmpeg_exists: 'available',
		h264_profile: 'main',
		h264_level: '4.1',
		encode: { [ codec.id ]: encode },
		...extra,
	};

	const utils = render(
		<PerCodecQualitySettings
			codec={ codec }
			settings={ settings }
			changeHandlerFactory={ changeHandlerFactory }
		/>
	);

	return { ...utils, changeHandlerFactory };
}

// Reads the "360p = 378 kbps" preview into { 360: 378, ... }.
function previewBitrates( container ) {
	const grid = container.querySelector( '.videopack-bitrate-grid' );
	const result = {};
	grid.querySelectorAll( 'span' ).forEach( ( span ) => {
		const match = span.textContent.match( /^(\d+)p = (-?\d+) kbps$/ );
		if ( match ) {
			result[ match[ 1 ] ] = Number( match[ 2 ] );
		}
	} );
	return result;
}

describe( 'PerCodecQualitySettings', () => {
	beforeEach( () => {
		global.videopack_config = {
			resolutions,
			isTranscodingServiceReady: false,
		};
	} );

	afterEach( () => {
		delete global.videopack_config;
		jest.useRealTimers();
	} );

	describe( 'ABR mode', () => {
		const abr = { rate_control: 'vbr', crf: 23, vbr: 1 };

		it( 'previews the bitrate for each resolution at the default quality', () => {
			const { container } = renderSettings( { encode: abr } );

			// 0.004404 * (w*h)^0.92: 240p 179, 360p 378, 720p 1353, 1080p 2853.
			expect( previewBitrates( container ) ).toEqual( {
				240: 179,
				360: 378,
				720: 1353,
				1080: 2853,
			} );
		} );

		it( 'never previews a negative bitrate, even for AV1 at small sizes', () => {
			const { container } = renderSettings( {
				codec: av1,
				encode: abr,
			} );

			const bitrates = previewBitrates( container );
			// 0.005214 * (w*h)^0.86: 240p 106, 360p 213.
			expect( bitrates[ 240 ] ).toBe( 106 );
			expect( bitrates[ 360 ] ).toBe( 213 );
			Object.values( bitrates ).forEach( ( kbps ) =>
				expect( kbps ).toBeGreaterThanOrEqual( 50 )
			);
		} );

		it( 'scales the preview with a saved quality setting', () => {
			const { container } = renderSettings( {
				encode: { ...abr, vbr: 1.5 },
			} );

			// 1352.8 * 1.5 = 2029.2 at 720p.
			expect( previewBitrates( container )[ 720 ] ).toBe( 2029 );
		} );

		it( 'explains the high frame rate multiplier', () => {
			renderSettings( { encode: abr } );

			expect(
				screen.getByText(
					'For video at 48 fps or faster, bitrates are multiplied by 1.5.'
				)
			).toBeTruthy();
		} );

		it( 'offers a quality scale around the default of 1, not the old 0.1-50 range', () => {
			const { container } = renderSettings( { encode: abr } );

			const slider = container.querySelector(
				'.videopack-abr-slider input[type="range"]'
			);
			expect( slider.min ).toBe( '0.25' );
			expect( slider.max ).toBe( '3' );
			expect( slider.step ).toBe( '0.05' );
			expect( slider.value ).toBe( '1' );
		} );

		it( 'updates the preview as the slider moves, and saves after a pause', () => {
			jest.useFakeTimers();
			const { container, changeHandlerFactory } = renderSettings( {
				encode: abr,
			} );
			const slider = container.querySelector(
				'.videopack-abr-slider input[type="range"]'
			);

			fireEvent.change( slider, { target: { value: '2' } } );

			// 1352.8 * 2 = 2705.6 at 720p, shown immediately.
			expect( previewBitrates( container )[ 720 ] ).toBe( 2706 );
			expect( changeHandlerFactory.encode ).not.toHaveBeenCalled();

			act( () => {
				jest.advanceTimersByTime( 600 );
			} );

			expect( changeHandlerFactory.encode ).toHaveBeenCalledTimes( 1 );
			expect( changeHandlerFactory.encode ).toHaveBeenCalledWith( {
				h264: { ...abr, vbr: 2 },
			} );
		} );
	} );

	describe( 'CRF mode', () => {
		const crf = { rate_control: 'crf', crf: 23, vbr: 1 };

		it( 'shows the CRF slider with the codec range and no bitrate preview', () => {
			const { container } = renderSettings( { encode: crf } );

			const slider = container.querySelector(
				'.videopack-crf-slider input[type="range"]'
			);
			expect( slider.min ).toBe( '0' );
			expect( slider.max ).toBe( '51' );
			expect( slider.value ).toBe( '23' );
			expect(
				container.querySelector( '.videopack-bitrate-grid' )
			).toBeNull();
		} );

		it( 'switches to ABR immediately when the radio changes', () => {
			const { changeHandlerFactory } = renderSettings( { encode: crf } );

			fireEvent.click( screen.getByLabelText( /Average Bitrate/ ) );

			expect( changeHandlerFactory.encode ).toHaveBeenCalledWith( {
				h264: { ...crf, rate_control: 'vbr' },
			} );
		} );
	} );

	it( 'disables the rate control radios and the quality slider when no transcoder is available', () => {
		const { container } = renderSettings( {
			encode: { rate_control: 'vbr', crf: 23, vbr: 1 },
			extra: { ffmpeg_exists: 'unavailable' },
		} );

		const slider = container.querySelector(
			'.videopack-abr-slider input[type="range"]'
		);
		expect( slider.disabled ).toBe( true );

		// The radios are disabled through their fieldset in this copy of the
		// component, which reaches each input as :disabled rather than as its
		// own disabled property.
		const radios = container.querySelectorAll( 'input[type="radio"]' );
		expect( radios ).toHaveLength( 2 );
		radios.forEach( ( radio ) =>
			expect( radio.matches( ':disabled' ) ).toBe( true )
		);
	} );
} );
