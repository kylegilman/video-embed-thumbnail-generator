import { __ } from '@wordpress/i18n';
import {
	Button,
	PanelBody,
	PanelRow,
	SelectControl,
	TextControl,
	ToggleControl,
	Icon,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { MediaUpload } from '@wordpress/media-utils';
import { plus, close, dragHandle } from '@wordpress/icons';


const TextTracks = ({ tracks = [], onChange }) => {
	const [isAdding, setIsAdding] = useState(false);

	const updateTrack = (index, newValues) => {
		const newTracks = [...tracks];
		newTracks[index] = { ...newTracks[index], ...newValues };
		onChange(newTracks);
	};

	const removeTrack = (index) => {
		const newTracks = tracks.filter((_, i) => i !== index);
		onChange(newTracks);
	};

	const addTrack = (track) => {
		const newTracks = [...tracks, track];
		onChange(newTracks);
		setIsAdding(false);
	};

	const handleMediaSelect = (media) => {
		addTrack({
			src: media.url,
			kind: 'subtitles',
			srclang: '',
			label: media.title || '',
			default: false,
		});
	};

	return (
		<PanelBody
			title={__('Text Tracks', 'video-embed-thumbnail-generator')}
			initialOpen={false}
		>
			<div className="videopack-text-tracks-list">
				{tracks.map((track, index) => (
					<div key={index} className="videopack-text-track-item">
						<div className="videopack-text-track-header">
							<span className="videopack-text-track-label">
								{track.label ||
									track.src.split('/').pop() ||
									__(
										'Untitled Track',
										'video-embed-thumbnail-generator'
									)}
							</span>
							<Button
								icon={close}
								label={__(
									'Remove Track',
									'video-embed-thumbnail-generator'
								)}
								onClick={() => removeTrack(index)}
								isDestructive
								className="videopack-remove-track"
							/>
						</div>
						<div className="videopack-text-track-settings">
							<div className="videopack-text-track-settings-row">
								<TextControl
									label={__(
										'Source URL',
										'video-embed-thumbnail-generator'
									)}
									value={track.src}
									onChange={(value) =>
										updateTrack(index, { src: value })
									}
									__nextHasNoMarginBottom
								/>
							</div>
							<div className="videopack-text-track-settings-row videopack-text-track-settings-row-split">
								<SelectControl
									label={__(
										'Kind',
										'video-embed-thumbnail-generator'
									)}
									value={track.kind}
									options={[
										{
											label: __(
												'Subtitles',
												'video-embed-thumbnail-generator'
											),
											value: 'subtitles',
										},
										{
											label: __(
												'Captions',
												'video-embed-thumbnail-generator'
											),
											value: 'captions',
										},
										{
											label: __(
												'Descriptions',
												'video-embed-thumbnail-generator'
											),
											value: 'descriptions',
										},
										{
											label: __(
												'Chapters',
												'video-embed-thumbnail-generator'
											),
											value: 'chapters',
										},
										{
											label: __(
												'Metadata',
												'video-embed-thumbnail-generator'
											),
											value: 'metadata',
										},
									]}
									onChange={(value) =>
										updateTrack(index, { kind: value })
									}
									__nextHasNoMarginBottom
								/>
								<TextControl
									label={__(
										'Language',
										'video-embed-thumbnail-generator'
									)}
									value={track.srclang}
									onChange={(value) =>
										updateTrack(index, { srclang: value })
									}
									placeholder="en"
									__nextHasNoMarginBottom
								/>
							</div>
							<div className="videopack-text-track-settings-row">
								<TextControl
									label={__(
										'Label',
										'video-embed-thumbnail-generator'
									)}
									value={track.label}
									onChange={(value) =>
										updateTrack(index, { label: value })
									}
									placeholder={__(
										'e.g. English Subtitles',
										'video-embed-thumbnail-generator'
									)}
									__nextHasNoMarginBottom
								/>
							</div>
							<PanelRow>
								<ToggleControl
									label={__(
										'Default',
										'video-embed-thumbnail-generator'
									)}
									checked={track.default}
									onChange={(value) => {
										// If setting to true, uncheck others (only one default per track set)
										const newTracks = tracks.map(
											(t, i) => ({
												...t,
												default:
													i === index ? value : false,
											})
										);
										onChange(newTracks);
									}}
									__nextHasNoMarginBottom
								/>
							</PanelRow>
						</div>
					</div>
				))}
			</div>

			<div className="videopack-text-tracks-actions">
				<MediaUpload
					onSelect={handleMediaSelect}
					allowedTypes={['text/vtt', 'application/vtt', 'text/plain']} // VTT files often detected as text/plain
					render={({ open }) => (
						<Button variant="secondary" icon={plus} onClick={open}>
							{__(
								'Add from Library',
								'video-embed-thumbnail-generator'
							)}
						</Button>
					)}
				/>
				<Button
					variant="tertiary"
					onClick={() =>
						addTrack({
							src: '',
							kind: 'subtitles',
							srclang: '',
							label: '',
							default: false,
						})
					}
				>
					{__('Add URL', 'video-embed-thumbnail-generator')}
				</Button>
			</div>
		</PanelBody>
	);
};

export default TextTracks;
