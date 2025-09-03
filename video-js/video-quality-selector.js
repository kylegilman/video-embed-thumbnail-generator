'use strict';

/**
 * ============================================================================
 * Video.js Quality Selector Plugin
 * ============================================================================
 */
if ( 'undefined' !== typeof window.videojs && 'undefined' === typeof window.videojs.getPlugin( 'resolutionSelector' ) ) {
	( function( videojs ) {
		const methods = {
			res_label: function( res ) {
				return ( /^\d+$/.test( res ) ) ? res + 'p' : res;
			},
		};

		// Add default english translations
		videojs.addLanguage( 'en', {
			'Quality': 'Quality',
			'Full': 'Full',
		} );

		const MenuItem = videojs.getComponent( 'MenuItem' );
		class ResolutionMenuItem extends MenuItem {
			call_count = 0;

			constructor( player, options ) {
				options.label = methods.res_label( options.res );
				options.selected = ( options.res.toString() === player.getCurrentRes().toString() );

				super( player, options );

				this.resolution = options.res;
				this.on( [ 'click', 'tap' ], this.onClick );

				player.on( 'changeRes', () => {
					this.selected( this.resolution === player.getCurrentRes() );
					this.call_count = 0;
				} );
			}

			onClick() {
				if ( this.call_count > 0 ) {
					return;
				}
				this.player().changeRes( this.resolution );
				this.call_count++;
			}
		}

		class ResolutionTitleMenuItem extends MenuItem {
			constructor( player, options ) {
				super( player, options );
				this.off( 'click' );
			}
		}

		const MenuButton = videojs.getComponent( 'MenuButton' );
		class ResolutionSelector extends MenuButton {
			constructor( player, options ) {
				player.availableRes = options.available_res;
				super( player, options );
			}

			buildCSSClass() {
				return 'vjs-res-button ' + super.buildCSSClass();
			}

			createItems() {
				const player = this.player();
				const items = [];

				for ( const current_res in player.availableRes ) {
					if ( 'length' === current_res ) {
						continue;
					}
					items.push( new ResolutionMenuItem( player, { res: current_res, selectable: true } ) );
				}

				items.sort( ( a, b ) => {
					if ( 'undefined' === typeof a.resolution ) {
						return -1;
					} else if ( a.resolution === player.localize('Full') ) {
						return -1;
					} else if ( b.resolution === player.localize('Full') ) {
						return 1;
					}
					return parseInt( b.resolution, 10 ) - parseInt( a.resolution, 10 );
				} );

				items.unshift( new ResolutionTitleMenuItem( player, {
					el: videojs.dom.createEl( 'li', {
						className: 'vjs-menu-title vjs-res-menu-title',
						innerHTML: player.localize('Quality'),
					} ),
				} ) );

				return items;
			}
		}

		videojs.registerPlugin( 'resolutionSelector', function( options ) {
			if ( ! this.el().firstChild.canPlayType ) {
				return;
			}

			const player = this;
			const sources = this.options_.sources;
			const available_res = { length: 0 };

							for ( let i = sources.length - 1; i >= 0; i-- ) {
				const source = sources[ i ];
				const current_res = source.resolution || source[ 'data-res' ];
				if ( ! current_res ) {
					continue;
				}

				if ( ! ( current_res in available_res ) ) {
					available_res.length++;
				}
				available_res[ current_res ] = source;

				if ( current_res === player.localize('Full') ) {
					player.on( 'loadedmetadata', function() {
						if ( ! Number.isNaN( player.videoHeight() ) ) {
							const resMenu = player.controlBar.getChild( 'resolutionSelector' );
							if ( resMenu ) {
								const fullResEl = resMenu.$( 'li.vjs-menu-item' ).find( ( el ) => el.textContent.includes( player.localize('Full') ) );
								if ( fullResEl ) {
									fullResEl.innerHTML = `${ player.videoHeight() }p`;
								}
							}
						}
					} );
				}
			}

			if ( available_res.length < 2 ) {
				return;
			}

			player.getCurrentRes = function() {
				return player.currentRes || ( sources[ 0 ] ? ( sources[ 0 ].resolution || sources[ 0 ][ 'data-res' ] ) : '' ) || '';
			};

			player.changeRes = function( target_resolution ) {
				if ( player.getCurrentRes() === target_resolution || ! player.availableRes || ! player.availableRes[ target_resolution ] ) {
					return;
				}

				const video = player.el().firstChild;
				const is_paused = player.paused();
				const current_time = player.currentTime();
				let canvas;

				if ( 'none' === video.preload ) {
					video.preload = 'metadata';
				}

				if ( current_time > 0 && ! is_paused ) {
					player.pause();
				}

				if ( current_time !== 0 ) {
					canvas = document.createElement( 'canvas' );
					canvas.className = 'videopack_temp_thumb';
					canvas.width = ( video.videoWidth > video.videoHeight ) ? video.offsetWidth : ( video.videoWidth / video.videoHeight ) * video.offsetHeight;
					canvas.height = ( video.videoWidth > video.videoHeight ) ? ( video.videoHeight / video.videoWidth ) * video.offsetWidth : video.offsetHeight;
					const topOffset = Math.round( ( video.offsetHeight - canvas.height ) / 2 );
					if ( topOffset > 2 ) { canvas.style.top = `${ topOffset }px`; }
					const leftOffset = Math.round( ( video.offsetWidth - canvas.width ) / 2 );
					if ( leftOffset > 2 ) { canvas.style.left = `${ leftOffset }px`; }
					const context = canvas.getContext( '2d' );
					context.drawImage( video, 0, 0, canvas.width, canvas.height );
					video.parentNode.appendChild( canvas );
				}

				player.src( player.availableRes[ target_resolution ] );
				player.one( 'loadedmetadata', function() {
					if ( current_time > 0 ) {
						player.currentTime( current_time );
					}
					if ( ! is_paused ) {
						player.play();
					}
				} );
				player.one( 'seeked', function() {
					if ( current_time !== 0 && canvas ) {
						canvas.parentNode.removeChild( canvas );
					}
				} );

				player.currentRes = target_resolution;
				player.trigger( 'changeRes' );
			};

			const resolutionSelector = new ResolutionSelector( player, { available_res } );
			player.ready( () => {
				player.getChild( 'controlBar' ).addChild( resolutionSelector, {}, 11 );
				const default_res = options.default_res;
				if ( default_res && available_res[ default_res ] ) {
					player.changeRes( default_res );
				}
			} );
		} );
	}( window.videojs ) );
}