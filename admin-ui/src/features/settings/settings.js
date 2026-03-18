/**
 * Features for managing plugin settings.
 */

/* global videopack_config */

import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import {
	getSettings,
	saveWPSettings,
	resetVideopackSettings,
	testEncodeCommand,
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
import {
	createRoot,
	useMemo,
	useState,
	useEffect,
	useRef,
	useCallback,
} from '@wordpress/element';
import { videopack } from '../../assets/icon';
import PlayerSettings from './components/PlayerSettings';
import VideoCollectionSettings from './components/VideoCollectionSettings';
import ThumbnailSettings from './components/ThumbnailSettings';
import EncodingSettings from './components/EncodingSettings';
import AdminSettings from './components/AdminSettings';
import FreemiusPage from './components/FreemiusPage';
import './settings.scss';

/**
 * VideopackSettingsPage component.
 *
 * @return {Object} The rendered component.
 */
const VideopackSettingsPage = () => {
	const [settings, setSettings] = useState({});
	const [ffmpegTest, setFfmpegTest] = useState({});
	const [isSettingsChanged, setIsSettingsChanged] = useState(false);
	const defaultTab = window.location.hash.substring(1) || 'player';
	const [activeTab, setActiveTab] = useState(defaultTab);
	const settingsRef = useRef(settings);

	useEffect(() => {
		settingsRef.current = settings;
	}, [settings]);

	const testFfmpeg = useCallback(
		(codec, resolution, rotate) => {
			if (activeTab === 'encoding') {
				setFfmpegTest({
					command: __(
						'Running test…',
						'video-embed-thumbnail-generator'
					),
					output: __(
						'Running test…',
						'video-embed-thumbnail-generator'
					),
				});
				testEncodeCommand(codec, resolution, rotate)
					.then((response) => {
						setFfmpegTest(response);
					})
					.catch((error) => {
						console.error(error);
					});
			}
		},
		[activeTab]
	);

	useEffect(() => {
		if (
			!isSettingsChanged &&
			activeTab === 'encoding' &&
			settings.sample_codec &&
			settings.sample_resolution &&
			settings.ffmpeg_exists === true
		) {
			testFfmpeg(
				settings.sample_codec,
				settings.sample_resolution,
				settings.sample_rotate
			);
		}
	}, [settings, activeTab, isSettingsChanged, testFfmpeg]);

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
				const currentSettings = settingsRef.current;
				const nextSettings = { ...response };
				let hasLocalChanges = false;

				Object.keys(currentSettings).forEach((key) => {
					if (currentSettings[key] !== newSettings[key]) {
						nextSettings[key] = currentSettings[key];
						hasLocalChanges = true;
					}
				});
				setSettings(nextSettings);
				if (!hasLocalChanges) {
					setIsSettingsChanged(false);
				}
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
					...prevSettings,
					[setting]: newValue,
				}));
				setIsSettingsChanged(true);
			};
			return acc;
		}, {});
	}, [settings]);

	const tabs = useMemo(() => {
		const defaultTabs = [
			{
				name: 'player',
				title: __('Video Player', 'video-embed-thumbnail-generator'),
				component: PlayerSettings,
			},
			{
				name: 'thumbnails',
				title: __('Thumbnails', 'video-embed-thumbnail-generator'),
				component: ThumbnailSettings,
			},
			{
				name: 'gallery',
				title: __(
					'Galleries & Lists',
					'video-embed-thumbnail-generator'
				),
				component: VideoCollectionSettings,
			},
		];

		if (
			!videopack_config.isFfmpegOverridden ||
			videopack_config.isSuperAdmin
		) {
			defaultTabs.push({
				name: 'encoding',
				title: __('Encoding', 'video-embed-thumbnail-generator'),
				component: EncodingSettings,
			});
		}

		defaultTabs.push({
			name: 'admin',
			title: __('Admin', 'video-embed-thumbnail-generator'),
			component: AdminSettings,
		});

		if (videopack_config.freemiusEnabled) {
			defaultTabs.push(
				{
					name: 'account',
					title: __(
						'Freemius Account',
						'video-embed-thumbnail-generator'
					),
					className: 'videopack-freemius-tab',
					component: () => <FreemiusPage page="account" />,
				},
				{
					name: 'add-ons',
					title: __('Add-ons', 'video-embed-thumbnail-generator'),
					className: 'videopack-freemius-tab',
					component: () => <FreemiusPage page="add-ons" />,
				}
			);
		}

		return applyFilters('videopack.settings.tabs', defaultTabs);
	}, []);

	const onTabSelect = (tabName) => {
		setActiveTab(tabName);
		window.history.pushState(null, '', `#${tabName}`);
	};

	const renderTab = (tab) => {
		if (settings && settings.hasOwnProperty('embed_method')) {
			if (tab.component) {
				const TabComponent = tab.component;
				return (
					<TabComponent
						settings={settings}
						setSettings={setSettings}
						changeHandlerFactory={changeHandlerFactory}
						ffmpegTest={ffmpegTest}
					/>
				);
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
				{__('Videopack Settings', 'video-embed-thumbnail-generator')}
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
						{__(
							'Reset Settings',
							'video-embed-thumbnail-generator'
						)}
					</Button>
				</PanelRow>
			</Panel>
		</div>
	);
};

const el = document.getElementById('videopack-settings-root');
const root = createRoot(el);
root.render(<VideopackSettingsPage />);
