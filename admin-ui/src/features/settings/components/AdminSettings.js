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
			label: __('Quarters'),
		},
		{
			value: 'start_complete',
			label: __('Start and complete'),
		},
		{
			value: 'start',
			label: __('Start only'),
		},
		{
			value: 'false',
			label: __('None'),
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
			<PanelBody title={__('User capabilities:')} initialOpen={true}>
				<Flex
					direction="row"
					gap={20}
					className="videopack-setting-capabilities"
				>
					<FlexItem>
						<p>{__('Can make thumbnails')}</p>
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
						<p>{__('Can encode videos')}</p>
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
						<p>{__("Can edit other users' encoded videos")}</p>
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
			<PanelBody title={__('Sharing')} initialOpen={true}>
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
					label={__('Generate Facebook Open Graph video tags.')}
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
					label={__('Enable Twitter Cards.')}
					onChange={changeHandlerFactory.twitter_card}
					checked={!!twitter_card}
					disabled={!embeddable}
				/>
				{(twitter_card || twitter_button) && (
					<div className="videopack-setting-reduced-width">
						<TextControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={__('Twitter username:')}
							value={twitter_username}
							onChange={changeHandlerFactory.twitter_username}
						/>
					</div>
				)}
				<ToggleControl
					__nextHasNoMarginBottom
					label={__('Allow right-clicking on videos.')}
					onChange={changeHandlerFactory.right_click}
					checked={!!right_click}
				/>
				<ToggleControl
					__nextHasNoMarginBottom
					label={__('Allow single-click download links.')}
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
					label={__('Always load plugin-related JavaScripts.')}
					onChange={changeHandlerFactory.alwaysloadscripts}
					checked={!!alwaysloadscripts}
				/>
				<ToggleControl
					__nextHasNoMarginBottom
					label={__('Use URL cache.')}
					onChange={changeHandlerFactory.transient_cache}
					checked={!!transient_cache}
				/>
				<Button className="videopack-clear-button" variant="secondary">
					{__('Clear URL cache')}
				</Button>
				<RadioControl
					className="videopack-setting-radio-group"
					label={__('Record views in the WordPress database:')}
					selected={count_views}
					options={countViewsOptions}
					onChange={changeHandlerFactory.count_views}
				/>
			</PanelBody>
			<PanelBody title={__('Misc')} initialOpen={true}>
				<ToggleControl
					__nextHasNoMarginBottom
					label={__('Override any existing "[video]" shortcodes.')}
					onChange={changeHandlerFactory.replace_video_shortcode}
					checked={!!replace_video_shortcode}
				/>
				<ToggleControl
					__nextHasNoMarginBottom
					label={__('Allow video attachment URL rewriting.')}
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
								label={__('Thumbnails')}
								checked={delete_thumbnails}
							/>
							<CheckboxControl
								__nextHasNoMarginBottom
								label={__('Encoded Videos')}
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
