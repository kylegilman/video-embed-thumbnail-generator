import { __ } from '@wordpress/i18n';
import {
	BaseControl,
	Button,
	CheckboxControl,
	Flex,
	FlexItem,
	PanelBody,
	RadioControl,
	ToggleControl,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import VideopackTooltip from './VideopackTooltip';
import { clearUrlCache } from '../../../api/settings';

/**
 * AdminSettings component.
 *
 * @param {Object} props                      Component props.
 * @param {Object} props.settings             Plugin settings.
 * @param {Object} props.changeHandlerFactory Factory for creating change handlers.
 * @return {Object} The rendered component.
 */
const AdminSettings = ({ settings, changeHandlerFactory }) => {
	const {
		capabilities,
		embeddable,
		schema,
		delete_child_thumbnails,
		delete_child_encoded,
		open_graph,
		oembed_provider,
		count_views,
		alwaysloadscripts,
		replace_video_shortcode,
		replace_video_block,
		replace_preview_video,
		rewrite_attachment_url,
	} = settings;

	const [isClearingCache, setIsClearingCache] = useState(false);

	const handleClearCache = () => {
		setIsClearingCache(true);
		clearUrlCache()
			.then(() => {
				setIsClearingCache(false);
			})
			.catch((error) => {
				console.error(error);
				setIsClearingCache(false);
			});
	};

	const countViewsOptions = [
		{
			value: 'quarters',
			label: __(
				'Quarters (0%, 25%, 50%, 75%, and 100% of duration)',
				'video-embed-thumbnail-generator'
			),
		},
		{
			value: 'start_complete',
			label: __('Start and complete', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'start',
			label: __('Start only', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'false',
			label: __('None', 'video-embed-thumbnail-generator'),
		},
	];

	const capitalizeFirstLetter = (string) => {
		return string.charAt(0).toUpperCase() + string.slice(1);
	};

	const RolesCheckboxes = () => {
		// Define an onChange event handler
		const handleCapabilityChange = (roleName, capability, isChecked) => {
			const updatedCapabilities = {
				...capabilities,
				[capability]: {
					...capabilities[capability],
					[roleName]: isChecked,
				},
			};

			changeHandlerFactory.capabilities(updatedCapabilities);
		};

		return (
			<PanelBody
				title={__(
					'User capabilities',
					'video-embed-thumbnail-generator'
				)}
				initialOpen={true}
			>
				<Flex
					direction="row"
					gap={20}
					className="videopack-setting-capabilities"
				>
					<FlexItem>
						<p>
							{__(
								'Can make thumbnails',
								'video-embed-thumbnail-generator'
							)}
						</p>
						{Object.entries(capabilities.make_video_thumbnails).map(
							([roleKey, isEnabled]) => (
								<CheckboxControl
									__nextHasNoMarginBottom
									key={`${roleKey}-make-thumbnails`}
									label={capitalizeFirstLetter(roleKey)}
									checked={isEnabled}
									onChange={(isChecked) =>
										handleCapabilityChange(
											roleKey,
											'make_video_thumbnails',
											isChecked
										)
									}
								/>
							)
						)}
					</FlexItem>
					<FlexItem>
						<p>
							{__(
								'Can encode videos',
								'video-embed-thumbnail-generator'
							)}
						</p>
						{Object.entries(capabilities.encode_videos).map(
							([roleKey, isEnabled]) => (
								<CheckboxControl
									__nextHasNoMarginBottom
									key={`${roleKey}-encode-videos`}
									label={capitalizeFirstLetter(roleKey)}
									checked={isEnabled}
									onChange={(isChecked) =>
										handleCapabilityChange(
											roleKey,
											'encode_videos',
											isChecked
										)
									}
								/>
							)
						)}
					</FlexItem>
					<FlexItem>
						<p>
							{__(
								"Can edit other users' encoded videos",
								'video-embed-thumbnail-generator'
							)}
						</p>
						{Object.entries(
							capabilities.edit_others_video_encodes
						).map(([roleKey, isEnabled]) => (
							<CheckboxControl
								__nextHasNoMarginBottom
								key={`${roleKey}-edit-encodes`}
								label={capitalizeFirstLetter(roleKey)}
								checked={isEnabled}
								onChange={(isChecked) =>
									handleCapabilityChange(
										roleKey,
										'edit_others_video_encodes',
										isChecked
									)
								}
							/>
						))}
					</FlexItem>
				</Flex>
			</PanelBody>
		);
	};

	return (
		<>
			<PanelBody
				title={__('Structured Data', 'video-embed-thumbnail-generator')}
				initialOpen={true}
			>
				<div className="videopack-control-with-tooltip">
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'Generate Facebook Open Graph video tags',
							'video-embed-thumbnail-generator'
						)}
						onChange={changeHandlerFactory.open_graph}
						checked={!!open_graph}
						disabled={!embeddable}
					/>
					<VideopackTooltip
						text={__(
							'Facebook and some other social media sites will use these tags to embed the first video in your post. Your video must be served via https in order to be embedded directly in Facebook and playback is handled by the unstyled built-in browser player. No statistics will be recorded for videos embedded this way and Open Graph tags generated by Jetpack will be disabled on pages with videos.',
							'video-embed-thumbnail-generator'
						)}
					/>
				</div>
				<div className="videopack-control-with-tooltip">
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'Generate Schema.org metadata for search engines',
							'video-embed-thumbnail-generator'
						)}
						onChange={changeHandlerFactory.schema}
						checked={!!schema}
					/>
					<VideopackTooltip
						text={__(
							'Helps your videos appear in search results.',
							'video-embed-thumbnail-generator'
						)}
					/>
				</div>
				<div className="videopack-control-with-tooltip">
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'Change oEmbed to video instead of WordPress default photo/excerpt',
							'video-embed-thumbnail-generator'
						)}
						onChange={changeHandlerFactory.oembed_provider}
						checked={!!oembed_provider}
					/>
					<VideopackTooltip
						text={__(
							'Allows users of other websites to embed your videos using just the post URL rather than the full iframe embed code, much like Vimeo or YouTube. However, most social media sites will not show videos through oEmbed unless your link is https.',
							'video-embed-thumbnail-generator'
						)}
					/>
				</div>
			</PanelBody>
			<PanelBody title="Performance" initialOpen={true}>
				<div className="videopack-control-with-tooltip">
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'Always load plugin-related JavaScripts',
							'video-embed-thumbnail-generator'
						)}
						onChange={changeHandlerFactory.alwaysloadscripts}
						checked={!!alwaysloadscripts}
					/>
					<VideopackTooltip
						text={__(
							"Usually Videopack's JavaScripts are only loaded if a video is present on the page. AJAX page loading can cause errors because the JavaScripts aren't loaded with the video content. Enabling this option will make sure the JavaScripts are always loaded.",
							'video-embed-thumbnail-generator'
						)}
					/>
				</div>
				<div className="videopack-control-with-tooltip">
					<Button
						className="videopack-clear-button"
						variant="secondary"
						onClick={handleClearCache}
						isBusy={isClearingCache}
						disabled={isClearingCache}
					>
						{__(
							'Clear URL cache',
							'video-embed-thumbnail-generator'
						)}
					</Button>
					<VideopackTooltip
						text={__(
							"Recommended if your site's URL has changed.",
							'video-embed-thumbnail-generator'
						)}
					/>
				</div>
				<RadioControl
					className="videopack-setting-radio-group"
					label={
						<span className="videopack-label-with-tooltip">
							{__(
								'Record views in the WordPress database',
								'video-embed-thumbnail-generator'
							)}
							<VideopackTooltip
								text={__(
									'Recording views in the database requires writing to the database, which can overload a server getting a lot of views. To speed up page loading, only enable the level of view counting you need. If Google Analytics is loaded, quarter event tracking is always recorded because Google servers can handle it.',
									'video-embed-thumbnail-generator'
								)}
							/>
						</span>
					}
					selected={count_views}
					options={countViewsOptions}
					onChange={changeHandlerFactory.count_views}
				/>
			</PanelBody>
			<PanelBody
				title={__('Misc', 'video-embed-thumbnail-generator')}
				initialOpen={true}
			>
				<div className="videopack-control-with-tooltip">
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'Override any existing "[video]" shortcodes',
							'video-embed-thumbnail-generator'
						)}
						onChange={changeHandlerFactory.replace_video_shortcode}
						checked={!!replace_video_shortcode}
					/>
					<VideopackTooltip
						text={__(
							"If you have posts or theme files that make use of the built-in WordPress video shortcode, Videopack can override them with this plugin's embedded video player.",
							'video-embed-thumbnail-generator'
						)}
					/>
				</div>
				<div className="videopack-control-with-tooltip">
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'Override any existing Video blocks',
							'video-embed-thumbnail-generator'
						)}
						onChange={changeHandlerFactory.replace_video_block}
						checked={!!replace_video_block}
					/>
					<VideopackTooltip
						text={__(
							"If you have posts that make use of the built-in WordPress Video block, Videopack can override them with this plugin's embedded video player on the frontend.",
							'video-embed-thumbnail-generator'
						)}
					/>
				</div>
				<div className="videopack-control-with-tooltip">
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'Replace media library video preview with Videopack player',
							'video-embed-thumbnail-generator'
						)}
						onChange={changeHandlerFactory.replace_preview_video}
						checked={!!replace_preview_video}
					/>
					<VideopackTooltip
						text={__(
							"Enhance the default WordPress video preview in the media library with Videopack's features and player settings.",
							'video-embed-thumbnail-generator'
						)}
					/>
				</div>
				<div className="videopack-control-with-tooltip">
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'Allow video attachment URL rewriting',
							'video-embed-thumbnail-generator'
						)}
						onChange={changeHandlerFactory.rewrite_attachment_url}
						checked={!!rewrite_attachment_url}
					/>
					<VideopackTooltip
						text={__(
							'If your videos are hosted on a CDN, WordPress might return incorrect URLs for attachments in the Media Library. Disable this setting if Videopack is changing your URLs to local files instead of the CDN.',
							'video-embed-thumbnail-generator'
						)}
					/>
				</div>
				<Flex direction="column">
					<FlexItem>
						<BaseControl
							__nextHasNoMarginBottom
							label={__(
								'When deleting videos, also delete associated',
								'video-embed-thumbnail-generator'
							)}
							id={'videopack-delete-options'}
						>
							<CheckboxControl
								__nextHasNoMarginBottom
								label={__(
									'Thumbnails',
									'video-embed-thumbnail-generator'
								)}
								checked={delete_child_thumbnails}
								onChange={
									changeHandlerFactory.delete_child_thumbnails
								}
							/>
							<CheckboxControl
								__nextHasNoMarginBottom
								label={__(
									'Encoded Videos',
									'video-embed-thumbnail-generator'
								)}
								checked={delete_child_encoded}
								onChange={
									changeHandlerFactory.delete_child_encoded
								}
							/>
						</BaseControl>
					</FlexItem>
				</Flex>
			</PanelBody>
			{capabilities && <RolesCheckboxes />}
		</>
	);
};

export default AdminSettings;
