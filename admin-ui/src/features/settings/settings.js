/* global videopack_config */

import { __ } from '@wordpress/i18n';
import {
	getSettings,
	saveWPSettings,
	resetVideopackSettings,
	testFFmpegCommand,
} from '../../utils/utils';
import {
	Button,
	Icon,
	Panel,
	PanelRow,
	Spinner,
	TabPanel,
} from '@wordpress/components';
import { useDebounce } from '@wordpress/compose';
import { createRoot, useMemo, useState, useEffect } from '@wordpress/element';
import { videopack } from '../../assets/icon';
import PlayerSettings from './components/PlayerSettings';
import GallerySettings from './components/GallerySettings';
import ThumbnailSettings from './components/ThumbnailSettings';
import EncodingSettings from './components/EncodingSettings';
import AdminSettings from './components/AdminSettings';
import FreemiusPage from './components/FreemiusPage';
import './settings.scss';

const VideopackSettingsPage = () => {
	const [settings, setSettings] = useState({});
	const [ffmpegTest, setFfmpegTest] = useState({});
	const [isSettingsChanged, setIsSettingsChanged] = useState(false);
	const defaultTab = window.location.hash.substring(1) || 'player';
	const [activeTab, setActiveTab] = useState(defaultTab);

	const testFfmpeg = (codec, resolution, rotate) => {
		if (activeTab === 'encoding') {
			testFFmpegCommand(codec, resolution, rotate)
				.then((response) => {
					setFfmpegTest(response);
				})
				.catch((error) => {
					console.error(error);
				});
		}
	};

	useEffect(() => {
		if (
			activeTab === 'encoding' &&
			settings.sample_codec &&
			settings.sample_resolution &&
			settings.ffmpeg_exists === true
		) {
			setFfmpegTest({
				command: __('Running test…'),
				output: __('Running test…'),
			});
			testFfmpeg(
				settings.sample_codec,
				settings.sample_resolution,
				settings.sample_rotate
			);
		}
	}, [settings, activeTab]);

	useEffect(() => {
		getSettings()
			.then((response) => {
				setSettings(response);
			})
			.catch((error) => {
				console.error(error);
			});

		const handlePopState = () => {
			setActiveTab(window.location.hash.substring(1));
		};
		window.addEventListener('popstate', handlePopState);
		return () => {
			window.removeEventListener('popstate', handlePopState);
		};
	}, []);

	const debouncedSaveSettings = useDebounce((newSettings) => {
		saveWPSettings(newSettings)
			.then((response) => {
				setSettings(response);
				setIsSettingsChanged(false);
			})
			.catch((error) => {
				console.error('Error updating settings:', error);
			});
	}, 1000);

	useEffect(() => {
		if (isSettingsChanged) {
			debouncedSaveSettings(settings);
		}
	}, [isSettingsChanged, debouncedSaveSettings, settings]);

	const changeHandlerFactory = useMemo(() => {
		if (!settings || typeof settings !== 'object') {
			return {};
		}
		return Object.keys(settings).reduce((acc, setting) => {
			acc[setting] = (newValue) => {
				setSettings((prevSettings) => ({
					...prevSettings, // Spread existing properties of the settings state
					[setting]: newValue, // Update the specific property that changed
				}));
				setIsSettingsChanged(true);
			};
			return acc;
		}, {});
	}, [settings]);

	const tabs = [
		{
			name: 'player',
			title: __('Video Player'),
		},
		{
			name: 'thumbnails',
			title: __('Thumbnails'),
		},
		{
			name: 'gallery',
			title: __('Video Gallery'),
		},
		{
			name: 'encoding',
			title: __('Encoding'),
		},
		{
			name: 'admin',
			title: __('Admin'),
		},
	];

	if (videopack_config.freemiusEnabled) {
		tabs.push(
			{
				name: 'account',
				title: __('Freemius Account'),
				className: 'videopack-freemius-tab',
			},
			{
				name: 'add-ons',
				title: __('Add-ons'),
				className: 'videopack-freemius-tab',
			}
		);
	}

	const onTabSelect = (tabName) => {
		setActiveTab(tabName);
		window.history.pushState(null, '', `#${tabName}`);
	};

	const renderTab = (tab) => {
		if (settings && settings.hasOwnProperty('embed_method')) {
			if (tab.name === 'player') {
				return (
					<PlayerSettings
						settings={settings}
						setSettings={setSettings}
						changeHandlerFactory={changeHandlerFactory}
					/>
				);
			}
			if (tab.name === 'thumbnails') {
				return (
					<ThumbnailSettings
						settings={settings}
						changeHandlerFactory={changeHandlerFactory}
					/>
				);
			}
			if (tab.name === 'gallery') {
				return (
					<GallerySettings
						settings={settings}
						changeHandlerFactory={changeHandlerFactory}
					/>
				);
			}
			if (tab.name === 'encoding') {
				return (
					<EncodingSettings
						settings={settings}
						changeHandlerFactory={changeHandlerFactory}
						ffmpegTest={ffmpegTest}
					/>
				);
			}
			if (tab.name === 'admin') {
				return (
					<AdminSettings
						settings={settings}
						changeHandlerFactory={changeHandlerFactory}
					/>
				);
			}
			if (tab.name === 'account') {
				return <FreemiusPage page="account" />;
			}
			if (tab.name === 'add-ons') {
				return <FreemiusPage page="add-ons" />;
			}
		} else {
			return <Spinner />;
		}
	};

	const resetSettings = () => {
		resetVideopackSettings()
			.then((response) => {
				setSettings(response);
				setIsSettingsChanged(true);
			})
			.catch((error) => {
				console.error(error);
			});
	};

	return (
		<div className="wrap videopack-settings">
			<h1>
				<Icon
					className="videopack-settings-icon"
					icon={videopack}
					size={40}
				/>
				{__('Videopack Settings')}
			</h1>
			<Panel>
				<TabPanel
					tabs={tabs}
					initialTabName={activeTab}
					onSelect={onTabSelect}
				>
					{(tab) => {
						return renderTab(tab);
					}}
				</TabPanel>
				<PanelRow>
					<Button
						variant="primary"
						onClick={resetSettings}
						className={'videopack-settings-reset'}
					>
						{__('Reset Settings')}
					</Button>
				</PanelRow>
			</Panel>
		</div>
	);
};

const el = document.getElementById('videopack-settings-root');
const root = createRoot(el);
root.render(<VideopackSettingsPage />);
