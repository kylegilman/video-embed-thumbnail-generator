/**
 * Features for managing network-wide settings.
 */

import { __ } from '@wordpress/i18n';
import {
	saveNetworkSettings,
	getNetworkSettings,
	resetNetworkSettings,
} from '../../api/settings';
import { getUsersWithCapability } from '../../api/gallery';
import {
	Icon,
	Panel,
	PanelBody,
	PanelRow,
	Spinner,
	ToggleControl,
	RangeControl,
	SelectControl,
	Button,
	CheckboxControl,
	Flex,
	FlexItem,
	TextControl,
} from '@wordpress/components';
import { useDebounce } from '@wordpress/compose';
import {
	createRoot,
	useState,
	useEffect,
	useRef,
	useMemo,
} from '@wordpress/element';
import { videopack } from '../../assets/icon';
import TextControlOnBlur from '../settings/components/TextControlOnBlur';
import VideopackTooltip from '../settings/components/VideopackTooltip';
import './settings-network.scss';

const capitalizeFirstLetter = (string) => {
	return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * NetworkSettingsPage component.
 *
 * @return {Object} The rendered component.
 */
const NetworkSettingsPage = () => {
	const [settings, setSettings] = useState(null);
	const [users, setUsers] = useState(null);
	const [isSettingsChanged, setIsSettingsChanged] = useState(false);
	const settingsRef = useRef(settings);

	useEffect(() => {
		settingsRef.current = settings;
	}, [settings]);

	useEffect(() => {
		getNetworkSettings()
			.then((response) => {
				setSettings(response);
			})
			.catch((error) => {
				console.error('Error fetching network settings:', error);
			});

		getUsersWithCapability('edit_others_video_encodes')
			.then((response) => {
				setUsers(response);
			})
			.catch((error) => {
				console.error(error);
			});
	}, []);

	const debouncedSaveSettings = useDebounce((newSettings) => {
		saveNetworkSettings(newSettings)
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
				console.error('Error updating network settings:', error);
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

	const generateNonCrfMarks = (type) => {
		const marks = [];
		switch (type) {
			case 'simultaneous':
				for (let i = 1; i <= 10; i++) {
					marks.push({ value: i, label: String(i) });
				}
				break;
			case 'threads':
				marks.push({
					value: 0,
					label: __('Auto', 'video-embed-thumbnail-generator'),
				});
				for (let i = 2; i <= 16; i += 2) {
					marks.push({ value: i, label: String(i) });
				}
				break;
		}
		return marks;
	};

	const errorEmailOptions = () => {
		const authorizedUsers = [
			{
				value: 'nobody',
				label: __('Nobody', 'video-embed-thumbnail-generator'),
			},
			{
				value: 'encoder',
				label: __(
					'User who initiated encoding',
					'video-embed-thumbnail-generator'
				),
			},
		];
		if (users) {
			users.forEach((user) => {
				authorizedUsers.push({
					value: user.id,
					label: user.name,
				});
			});
		}
		return authorizedUsers;
	};

	const resetSettings = () => {
		resetNetworkSettings()
			.then((response) => {
				setSettings(response);
				setIsSettingsChanged(true);
			})
			.catch((error) => {
				console.error(error);
			});
	};

	const RolesCheckboxes = () => {
		const handleCapabilityChange = (roleName, capability, isChecked) => {
			const updatedCapabilities = {
				...settings.default_capabilities,
				[capability]: {
					...settings.default_capabilities[capability],
					[roleName]: isChecked,
				},
			};

			changeHandlerFactory.default_capabilities(updatedCapabilities);
		};

		const getCapabilityLabel = (capabilityKey) => {
			const labels = {
				make_video_thumbnails: __(
					'Can make thumbnails',
					'video-embed-thumbnail-generator'
				),
				encode_videos: __(
					'Can encode videos',
					'video-embed-thumbnail-generator'
				),
				edit_others_video_encodes: __(
					"Can edit other users' encoded videos",
					'video-embed-thumbnail-generator'
				),
				view_full_length_video: __(
					'Can view full length videos',
					'videopack-pro'
				),
			};

			return labels[capabilityKey] || capitalizeFirstLetter(capabilityKey.replace(/_/g, ' '));
		};

		return (
			<PanelBody
				title={__(
					'User capabilities for new sites',
					'video-embed-thumbnail-generator'
				)}
				initialOpen={true}
			>
				<Flex
					direction="row"
					gap={20}
					className="videopack-setting-capabilities"
				>
					{Object.entries(settings.default_capabilities).map(([capabilityKey, roles]) => {
						if (capabilityKey === 'view_full_length_video' && !settings.restrict_playback_by_capability) {
							return null;
						}
						return (
							<FlexItem key={capabilityKey}>
								<p className="videopack-settings-label">
									{getCapabilityLabel(capabilityKey)}
								</p>
								{Object.entries(roles).map(([roleKey, isEnabled]) => (
									<CheckboxControl
										__nextHasNoMarginBottom
										key={`${roleKey}-${capabilityKey}`}
										label={capitalizeFirstLetter(roleKey)}
										checked={isEnabled}
										onChange={(isChecked) =>
											handleCapabilityChange(
												roleKey,
												capabilityKey,
												isChecked
											)
										}
									/>
								))}
							</FlexItem>
						);
					})}
				</Flex>
			</PanelBody>
		);
	};

	if (!settings || Object.keys(settings).length === 0) {
		return <Spinner />;
	}

	return (
		<div className="wrap videopack-settings-network">
			<h1>
				<Icon
					className="videopack-settings-icon"
					icon={videopack}
					size={40}
				/>
				{__(
					'Videopack Network Settings',
					'video-embed-thumbnail-generator'
				)}
			</h1>
			<Panel>
				<PanelBody
					title={__(
						'FFmpeg Settings',
						'video-embed-thumbnail-generator'
					)}
				>
					<PanelRow>
						<TextControlOnBlur
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={__(
								'Path to FFmpeg folder on server',
								'video-embed-thumbnail-generator'
							)}
							value={settings.app_path}
							onChange={changeHandlerFactory.app_path}
							help={__(
								'Leave blank if FFmpeg is in your system path.',
								'video-embed-thumbnail-generator'
							)}
						/>
					</PanelRow>
					{settings.ffmpeg_exists !== true &&
						settings.ffmpeg_error && (
							<div className="notice notice-error videopack-ffmpeg-notice">
								<p
									dangerouslySetInnerHTML={{
										__html: settings.ffmpeg_error,
									}}
								/>
							</div>
						)}
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'Only Super Admins can change FFmpeg Settings',
							'video-embed-thumbnail-generator'
						)}
						checked={!!settings.superadmin_only_ffmpeg_settings}
						onChange={
							changeHandlerFactory.superadmin_only_ffmpeg_settings
						}
					/>
				</PanelBody>

				<PanelBody
					title={__('Execution', 'video-embed-thumbnail-generator')}
					opened={settings.ffmpeg_exists === true}
				>
					<RangeControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__(
							'Simultaneous encodes',
							'video-embed-thumbnail-generator'
						)}
						value={settings.simultaneous_encodes}
						className="videopack-settings-slider"
						onChange={changeHandlerFactory.simultaneous_encodes}
						min={1}
						max={10}
						step={1}
						marks={generateNonCrfMarks('simultaneous')}
						disabled={settings.ffmpeg_exists !== true}
					/>
					<RangeControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__('Threads', 'video-embed-thumbnail-generator')}
						value={settings.threads}
						className="videopack-settings-slider"
						onChange={changeHandlerFactory.threads}
						min={0}
						max={16}
						step={1}
						marks={generateNonCrfMarks('threads')}
						disabled={settings.ffmpeg_exists !== true}
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'Run nice',
							'video-embed-thumbnail-generator'
						)}
						checked={!!settings.nice}
						onChange={changeHandlerFactory.nice}
						disabled={settings.ffmpeg_exists !== true}
					/>
				</PanelBody>

				<PanelBody
					title={__(
						'Email Notifications',
						'video-embed-thumbnail-generator'
					)}
					opened={settings.ffmpeg_exists === true}
				>
					<div className="videopack-setting-auto-width">
						<SelectControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={__(
								'Network Error Email',
								'video-embed-thumbnail-generator'
							)}
							value={settings.network_error_email}
							onChange={changeHandlerFactory.network_error_email}
							options={errorEmailOptions()}
							help={__(
								'Receive encoding error notifications for all sites in the network.',
								'video-embed-thumbnail-generator'
							)}
							disabled={settings.ffmpeg_exists !== true}
						/>
					</div>
				</PanelBody>
				{settings.restrict_playback_by_capability !== undefined && (
					<PanelBody
						title={__(
							'Playback Restriction Settings for New Sites',
							'videopack-pro'
						)}
						initialOpen={true}
					>
						<div className="videopack-control-with-tooltip">
							<ToggleControl
								__nextHasNoMarginBottom
								label={__(
									'Restrict full-length video playback by capability',
									'videopack-pro'
								)}
								onChange={changeHandlerFactory.restrict_playback_by_capability}
								checked={!!settings.restrict_playback_by_capability}
							/>
							<VideopackTooltip
								text={__(
									'When enabled, only logged-in roles checked in the "User capabilities" checklist are allowed to view the full-length video. Guests and unprivileged users will be restricted to the trailer, or see the restricted overlay if no trailer is available.',
									'videopack-pro'
								)}
							/>
						</div>
						{settings.restrict_playback_by_capability && (
							<div className="videopack-setting-reduced-width" style={{ marginTop: '15px' }}>
								<TextControl
									__nextHasNoMarginBottom
									__next40pxDefaultSize
									label={__(
										'Restricted Playback Message',
										'videopack-pro'
									)}
									value={settings.view_restricted_message || ''}
									placeholder={__(
										'Log in or subscribe to see this video',
										'videopack-pro'
									)}
									onChange={changeHandlerFactory.view_restricted_message}
								/>
							</div>
						)}
					</PanelBody>
				)}
				{settings.default_capabilities && <RolesCheckboxes />}
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
const el = document.getElementById('videopack-network-settings-root');
if (el) {
	const root = createRoot(el);
	root.render(<NetworkSettingsPage />);
}
