import { __, } from '@wordpress/i18n';
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

const AdminSettings = ( { settings, changeHandlerFactory, roles } ) => {

	const {
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
			label: __( 'Quarters' ),
		},
		{
			value: 'start_complete',
			label: __( 'Start and complete' ),
		},
		{
			value: 'start',
			label: __( 'Start only' ),
		},
		{
			value: 'false',
			label: __( 'None' ),
		},
	];

	const RolesCheckboxes = () => {
		// Define an onChange event handler
		const handleCapabilityChange = ( roleName, capability, isChecked ) => {

			const updatedCapabilities = { ...settings.capabilities };

			if ( isChecked ) {
			if ( ! updatedCapabilities[ capability ] ) {
				updatedCapabilities[ capability ] = {};
			}
			updatedCapabilities[ capability ][ roleName ] = true;
			} else {
				if ( updatedCapabilities[ capability ] ) {
					delete updatedCapabilities[ capability ][ roleName ];
				}
			}

			changeHandlerFactory.capabilities( updatedCapabilities );
		};

		return (
			<PanelBody
				title={ __('User capabilities:') }
				initialOpen={ true }
			>
				<Flex
					direction='row'
					gap={ 20 }
					className='videopack-setting-capabilities'
				>
					<FlexItem>
						<p>{ __('Can make thumbnails') }</p>
						{ Object.entries(roles).map(([roleKey, roleData]) => (
						<CheckboxControl
							key={`${roleKey}-make-thumbnails`}
							label={roleData.name}
							checked={roleData.capabilities.make_video_thumbnails === true}
							onChange={(isChecked) =>
								handleCapabilityChange(roleData.name, 'make_video_thumbnails', isChecked)
							}
						/>
						))}
					</FlexItem>
					<FlexItem>
						<p>{ __('Can encode videos') }</p>
						{Object.entries(roles).map(([roleKey, roleData]) => (
						<CheckboxControl
							key={`${roleKey}-encode-videos`}
							label={roleData.name}
							checked={roleData.capabilities.encode_videos === true}
							onChange={(isChecked) =>
								handleCapabilityChange(roleData.name, 'encode_videos', isChecked)
							}
						/>
						))}
					</FlexItem>
					<FlexItem>
						<p>{ __( "Can edit other users' encoded videos" ) }</p>
						{Object.entries(roles).map(([roleKey, roleData]) => (
						<CheckboxControl
							key={`${roleKey}-edit-encodes`}
							label={roleData.name}
							checked={roleData.capabilities.edit_others_video_encodes === true}
							onChange={(isChecked) =>
								handleCapabilityChange(roleData.name, 'edit_others_video_encodes', isChecked)
							}
						/>
						))}
					</FlexItem>
				</Flex>
			</PanelBody>
		);
	};

	return(
		<>
		<PanelBody
			title={ __( 'Sharing' ) }
			initialOpen={ true }
		>
			<ToggleControl
				__nextHasNoMarginBottom
				label={ __( 'Allow users to embed your videos on other sites.' ) }
				onChange={ changeHandlerFactory.embeddable }
				checked={ !! embeddable }
			/>
			<ToggleControl
				__nextHasNoMarginBottom
				label={ __( 'Generate Facebook Open Graph video tags.' ) }
				onChange={ changeHandlerFactory.open_graph }
				checked={ !! open_graph }
				disabled={ ! embeddable }
			/>
			<ToggleControl
				__nextHasNoMarginBottom
				label={ __( 'Generate Schema.org metadata for search engines.' ) }
				onChange={ changeHandlerFactory.schema }
				checked={ !! schema }
			/>
			<ToggleControl
				__nextHasNoMarginBottom
				label={ __( 'Enable Twitter Cards.' ) }
				onChange={ changeHandlerFactory.twitter_card }
				checked={ !! twitter_card }
				disabled={ ! embeddable }
			/>
			{ ( twitter_card || twitter_button ) &&
				<div className='videopack-setting-reduced-width'>
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Twitter username:' ) }
						value={ twitter_username }
						onChange={ changeHandlerFactory.twitter_username }
					/>
				</div>
			}
			<ToggleControl
				__nextHasNoMarginBottom
				label={ __( 'Allow right-clicking on videos.' ) }
				onChange={ changeHandlerFactory.right_click }
				checked={ !! right_click }
			/>
			<ToggleControl
				__nextHasNoMarginBottom
				label={ __( 'Allow single-click download links.' ) }
				onChange={ changeHandlerFactory.right_click }
				checked={ !! right_click }
			/>
			<ToggleControl
				__nextHasNoMarginBottom
				label={ __( 'Change oEmbed to video instead of WordPress default photo/excerpt.' ) }
				onChange={ changeHandlerFactory.oembed_provider }
				checked={ !! oembed_provider }
			/>
		</PanelBody>
		<PanelBody
			title='Performance'
			initialOpen={ true }
		>
			<ToggleControl
				__nextHasNoMarginBottom
				label={ __( 'Always load plugin-related JavaScripts.' ) }
				onChange={ changeHandlerFactory.alwaysloadscripts }
				checked={ !! alwaysloadscripts }
			/>
			<ToggleControl
				__nextHasNoMarginBottom
				label={ __( 'Use URL cache.' ) }
				onChange={ changeHandlerFactory.transient_cache }
				checked={ !! transient_cache }
			/>
			<Button
				className='videopack-clear-button'
				variant='secondary'
			>
				{ __( 'Clear URL cache' )}
			</Button>
			<RadioControl
				className='videopack-setting-radio-group'
				label={ __( 'Record views in the WordPress database:' ) }
				selected={ count_views }
				options={ countViewsOptions }
				onChange={ changeHandlerFactory.count_views }
			/>
		</PanelBody>
		<PanelBody
			title={ __( 'Misc' ) }
			initialOpen={ true }
		>
			<ToggleControl
				__nextHasNoMarginBottom
				label={ __( 'Override any existing "[video]" shortcodes.' ) }
				onChange={ changeHandlerFactory.replace_video_shortcode }
				checked={ !! replace_video_shortcode }
			/>
			<ToggleControl
				__nextHasNoMarginBottom
				label={ __( 'Allow video attachment URL rewriting.' ) }
				onChange={ changeHandlerFactory.rewrite_attachment_url }
				checked={ !! rewrite_attachment_url }
			/>
			<Flex
				direction='column'
			>
				<FlexItem>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Change attachment page design to match plugin settings.' ) }
						onChange={ changeHandlerFactory.template }
						checked={ !! template }
					/>
				</FlexItem>
				<FlexItem>
					<BaseControl
						label={ __( 'When deleting videos, also delete associated:' ) }
					>
						<CheckboxControl
							label={ __( 'Thumbnails' ) }
							checked={ delete_thumbnails }
						/>
						<CheckboxControl
							label={ __( 'Encoded Videos' ) }
							checked={ delete_encoded }
						/>
					</BaseControl>
				</FlexItem>
			</Flex>
		</PanelBody>
		{ roles && <RolesCheckboxes /> }
		</>
	);
}

export default AdminSettings;
