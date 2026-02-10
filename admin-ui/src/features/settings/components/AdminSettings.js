import { __ } from '@wordpress/i18n';
import {
	BaseControl,
	Button,
	CheckboxControl,
	ExternalLink,
	Flex,
	FlexBlock,
	FlexItem,
	Icon,
	MediaUpload,
	MediaUploadCheck,
	Panel,
	PanelBody,
	PanelRow,
	RadioControl,
	RangeControl,
	SelectControl,
	TextControl,
	ToggleControl,
	Spinner,
	TabPanel,
	Tooltip,
} from '@wordpress/components';

const AdminSettings = ({ settings, changeHandlerFactory }) => {
	const {
		capabilities,
		embeddable,
		schema,
		twitter_button,
		twitter_username,
		right_click,
		delete_thumbnails,
		delete_encoded,
		template,
		open_graph,
		twitter_card,
		oembed_provider,
		count_views,
		alwaysloadscripts,
		replace_video_shortcode,
		transient_cache,
		rewrite_attachment_url,
	} = settings;

	const countViewsOptions = [
		{
			value: 'quarters',
			label: __( 'Quarters', 'video-embed-thumbnail-generator' ),
		},
		{
			value: 'start_complete',
			label: __( 'Start and complete', 'video-embed-thumbnail-generator' ),
		},
		{
			value: 'start',
			label: __( 'Start only', 'video-embed-thumbnail-generator' ),
		},
		{
			value: 'false',
			label: __( 'None', 'video-embed-thumbnail-generator' ),
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
			<PanelBody title={__( 'User capabilities:', 'video-embed-thumbnail-generator' )} initialOpen={true}>
				<Flex
					direction="row"
					gap={20}
					className="videopack-setting-capabilities"
				>
					<FlexItem>
						<p>{__( 'Can make thumbnails', 'video-embed-thumbnail-generator' )}</p>
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
						<p>{__( 'Can encode videos', 'video-embed-thumbnail-generator' )}</p>
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
						<p>{__( "Can edit other users' encoded videos", 'video-embed-thumbnail-generator' )}</p>
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
			<PanelBody title={__( 'Sharing', 'video-embed-thumbnail-generator' )} initialOpen={true}>
				<ToggleControl
					__nextHasNoMarginBottom
					label={__(
						'Allow users to embed your videos on other sites.'
					)}
					onChange={changeHandlerFactory.embeddable}
					checked={!!embeddable}
				/>
				<ToggleControl
					__nextHasNoMarginBottom
					label={__( 'Generate Facebook Open Graph video tags.', 'video-embed-thumbnail-generator' )}
					onChange={changeHandlerFactory.open_graph}
					checked={!!open_graph}
					disabled={!embeddable}
				/>
				<ToggleControl
					__nextHasNoMarginBottom
					label={__(
						'Generate Schema.org metadata for search engines.'
					)}
					onChange={changeHandlerFactory.schema}
					checked={!!schema}
				/>
				<ToggleControl
					__nextHasNoMarginBottom
					label={__( 'Enable Twitter Cards.', 'video-embed-thumbnail-generator' )}
					onChange={changeHandlerFactory.twitter_card}
					checked={!!twitter_card}
					disabled={!embeddable}
				/>
				{(twitter_card || twitter_button) && (
					<div className="videopack-setting-reduced-width">
						<TextControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={__( 'Twitter username:', 'video-embed-thumbnail-generator' )}
							value={twitter_username}
							onChange={changeHandlerFactory.twitter_username}
						/>
					</div>
				)}
				<ToggleControl
					__nextHasNoMarginBottom
					label={__( 'Allow right-clicking on videos.', 'video-embed-thumbnail-generator' )}
					onChange={changeHandlerFactory.right_click}
					checked={!!right_click}
				/>
				<ToggleControl
					__nextHasNoMarginBottom
					label={__( 'Allow single-click download links.', 'video-embed-thumbnail-generator' )}
					onChange={changeHandlerFactory.right_click}
					checked={!!right_click}
				/>
				<ToggleControl
					__nextHasNoMarginBottom
					label={__(
						'Change oEmbed to video instead of WordPress default photo/excerpt.'
					)}
					onChange={changeHandlerFactory.oembed_provider}
					checked={!!oembed_provider}
				/>
			</PanelBody>
			<PanelBody title="Performance" initialOpen={true}>
				<ToggleControl
					__nextHasNoMarginBottom
					label={__( 'Always load plugin-related JavaScripts.', 'video-embed-thumbnail-generator' )}
					onChange={changeHandlerFactory.alwaysloadscripts}
					checked={!!alwaysloadscripts}
				/>
				<ToggleControl
					__nextHasNoMarginBottom
					label={__( 'Use URL cache.', 'video-embed-thumbnail-generator' )}
					onChange={changeHandlerFactory.transient_cache}
					checked={!!transient_cache}
				/>
				<Button className="videopack-clear-button" variant="secondary">
					{__( 'Clear URL cache', 'video-embed-thumbnail-generator' )}
				</Button>
				<RadioControl
					className="videopack-setting-radio-group"
					label={__( 'Record views in the WordPress database:', 'video-embed-thumbnail-generator' )}
					selected={count_views}
					options={countViewsOptions}
					onChange={changeHandlerFactory.count_views}
				/>
			</PanelBody>
			<PanelBody title={__( 'Misc', 'video-embed-thumbnail-generator' )} initialOpen={true}>
				<ToggleControl
					__nextHasNoMarginBottom
					label={__( 'Override any existing "[video]" shortcodes.', 'video-embed-thumbnail-generator' )}
					onChange={changeHandlerFactory.replace_video_shortcode}
					checked={!!replace_video_shortcode}
				/>
				<ToggleControl
					__nextHasNoMarginBottom
					label={__( 'Allow video attachment URL rewriting.', 'video-embed-thumbnail-generator' )}
					onChange={changeHandlerFactory.rewrite_attachment_url}
					checked={!!rewrite_attachment_url}
				/>
				<Flex direction="column">
					<FlexItem>
						<ToggleControl
							__nextHasNoMarginBottom
							label={__(
								'Change attachment page design to match plugin settings.'
							)}
							onChange={changeHandlerFactory.template}
							checked={!!template}
						/>
					</FlexItem>
					<FlexItem>
						<BaseControl
							__nextHasNoMarginBottom
							label={__(
								'When deleting videos, also delete associated:'
							)}
						>
							<CheckboxControl
								__nextHasNoMarginBottom
								label={__( 'Thumbnails', 'video-embed-thumbnail-generator' )}
								checked={delete_thumbnails}
							/>
							<CheckboxControl
								__nextHasNoMarginBottom
								label={__( 'Encoded Videos', 'video-embed-thumbnail-generator' )}
								checked={delete_encoded}
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
