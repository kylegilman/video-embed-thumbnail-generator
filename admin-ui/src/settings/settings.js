import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import {
	Button,
	Icon,
	Panel,
	PanelRow,
	Spinner,
	TabPanel,
	Tooltip,
} from '@wordpress/components';
import { useDebounce } from '@wordpress/compose';
import { createRoot, useMemo, useState, useEffect } from '@wordpress/element';
import { videopack } from '../icon';
import PlayerSettings from './PlayerSettings';
import GallerySettings from './GallerySettings';
import ThumbnailSettings from './ThumbnailSettings';
import EncodingSettings from './EncodingSettings';
import AdminSettings from './AdminSettings';
import './settings.scss';

const VideopackSettingsPage = () => {
	const [ settings, setSettings ] = useState( {} );
	const [ isSettingsChanged, setIsSettingsChanged ] = useState( false );
	const [ ffmpegTest, setFfmpegTest ] = useState( {} );
	const [ roles, setRoles ] = useState( {} );
	const defaultTab = window.location.hash.substring( 1 ) || 'player';
	const [ activeTab, setActiveTab ] = useState( defaultTab );

	const testFfmpeg = ( format, rotate ) => {
		if ( activeTab === 'encoding' ) {
			apiFetch( {
				path:
					'/videopack/v1/ffmpeg-test/' + format + '?rotate=' + rotate,
			} )
				.then( ( response ) => {
					setFfmpegTest( response );
					console.log( response );
				} )
				.catch( ( error ) => {
					console.log( error );
				} );
		}
	};

	const updateSettingsState = ( response ) => {
		if ( response?.videopack_options ) {
			setSettings( response.videopack_options );
			testFfmpeg(
				response.videopack_options.sample_format,
				response.videopack_options.sample_rotate
			);
		}
		console.log( response );
	};

	useEffect( () => {
		if ( activeTab === 'encoding' ) {
			setFfmpegTest( {
				command: __( 'Running test…' ),
				output: __( 'Running test…' ),
			} );
		}
	}, [ settings ] );

	useEffect( () => {
		apiFetch( { path: '/wp/v2/settings' } )
			.then( ( response ) => {
				updateSettingsState( response );
			} )
			.catch( ( error ) => {
				console.log( error );
			} );

		apiFetch( { path: '/videopack/v1/roles' } )
			.then( ( response ) => {
				setRoles( response );
			} )
			.catch( ( error ) => {
				console.log( error );
			} );

		const handlePopState = () => {
			setActiveTab( window.location.hash.substring( 1 ) );
		};
		window.addEventListener( 'popstate', handlePopState );
		return () => {
			window.removeEventListener( 'popstate', handlePopState );
		};
	}, [] );

	const debouncedSaveSettings = useDebounce( ( newSettings ) => {
		apiFetch( {
			path: '/wp/v2/settings',
			method: 'POST',
			data: {
				videopack_options: newSettings,
			},
		} )
			.then( ( response ) => {
				updateSettingsState( response );
				setIsSettingsChanged( false );
				console.log( 'Settings updated successfully:', response );
			} )
			.catch( ( error ) => {
				console.error( 'Error updating settings:', error );
			} );
	}, 1000 );

	useEffect( () => {
		if ( isSettingsChanged ) {
			debouncedSaveSettings( settings );
		}
	}, [ debouncedSaveSettings, isSettingsChanged ] );

	const changeHandlerFactory = useMemo( () => {
		if ( ! settings || typeof settings !== 'object' ) {
			return {};
		}

		return Object.keys( settings ).reduce( ( acc, setting ) => {
			acc[ setting ] = ( newValue ) => {
				setSettings( ( prevSettings ) => ( {
					...prevSettings, // Spread existing properties of the settings state
					[ setting ]: newValue, // Update the specific property that changed
				} ) );
				setIsSettingsChanged( true );
			};
			return acc;
		}, {} );
	}, [ settings ] );

	const tabs = [
		{
			name: 'player',
			title: __( 'Video Player' ),
		},
		{
			name: 'thumbnails',
			title: __( 'Thumbnails' ),
		},
		{
			name: 'gallery',
			title: __( 'Video Gallery' ),
		},
		{
			name: 'encoding',
			title: __( 'Encoding' ),
		},
		{
			name: 'admin',
			title: __( 'Admin' ),
		},
	];

	const onTabSelect = ( tabName ) => {
		setActiveTab( tabName );
		window.history.pushState( null, '', `#${ tabName }` );
	};

	const renderTab = ( tab ) => {
		if ( settings && settings.hasOwnProperty( 'embed_method' ) ) {
			if ( tab.name === 'player' ) {
				return (
					<PlayerSettings
						settings={ settings }
						setSettings={ setSettings }
						changeHandlerFactory={ changeHandlerFactory }
					/>
				);
			}
			if ( tab.name === 'thumbnails' ) {
				return (
					<ThumbnailSettings
						settings={ settings }
						changeHandlerFactory={ changeHandlerFactory }
					/>
				);
			}
			if ( tab.name === 'gallery' ) {
				return (
					<GallerySettings
						settings={ settings }
						changeHandlerFactory={ changeHandlerFactory }
					/>
				);
			}
			if ( tab.name === 'encoding' ) {
				return (
					<EncodingSettings
						settings={ settings }
						changeHandlerFactory={ changeHandlerFactory }
						ffmpegTest={ ffmpegTest }
					/>
				);
			}
			if ( tab.name === 'admin' ) {
				return (
					<AdminSettings
						settings={ settings }
						changeHandlerFactory={ changeHandlerFactory }
						roles={ roles }
					/>
				);
			}
		} else {
			return <Spinner />;
		}
	};

	const resetSettings = () => {
		apiFetch( {
			path: '/videopack/v1/defaults',
		} )
			.then( ( response ) => {
				setSettings( response );
			} )
			.catch( ( error ) => {
				console.log( error );
			} );
	};

	return (
		<div className="wrap videopack-settings">
			<h1>
				<Icon
					className="videopack-settings-icon"
					icon={ videopack }
					size={ 40 }
				/>
				{ __( 'Videopack Settings' ) }
			</h1>
			<Panel>
				<TabPanel
					tabs={ tabs }
					initialTabName={ activeTab }
					onSelect={ onTabSelect }
				>
					{ ( tab ) => {
						return renderTab( tab );
					} }
				</TabPanel>
				<PanelRow>
					<Button
						variant="primary"
						onClick={ resetSettings }
						className={ 'videopack-settings-reset' }
					>
						{ __( 'Reset Settings' ) }
					</Button>
				</PanelRow>
			</Panel>
		</div>
	);
};

const el = document.getElementById( 'videopack-settings-root' );
const root = createRoot( el );
root.render( <VideopackSettingsPage /> );
