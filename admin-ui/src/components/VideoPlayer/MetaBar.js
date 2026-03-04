import { __ } from '@wordpress/i18n';
import { useState, useEffect, useMemo } from '@wordpress/element';

const MetaBar = ({ attributes, playerRef }) => {
	const {
		overlay_title,
		title,
		embedcode,
		embeddable,
		downloadlink,
		twitter_button,
		facebook_button,
		embed_method,
	} = attributes;
	const metaBarItems = [
		overlay_title,
		embedcode,
		downloadlink,
		twitter_button,
		facebook_button,
	];
	const noTitleMeta = overlay_title ? '' : ' no-title';
	const randomId = useMemo(() => Math.random().toString(36).substr(2, 9), []);

	const [startAtEnabled, setStartAtEnabled] = useState(false);
	const [startAtTime, setStartAtTime] = useState('00:00');
	const [shareIsOpen, setShareIsOpen] = useState(false);

	const embedItems = () => {
		if (embeddable && embedcode) {
			return true;
		}
		return false;
	};

	const embedLink = () => {
		if (attributes?.embedlink) {
			return String(attributes?.embedlink);
		}
		return '';
	};
	const [currentEmbedCode, setCurrentEmbedCode] = useState(embedLink());

	const convertToTimecode = (time) => {
		const minutes = Math.floor(time / 60);
		let seconds = Math.round(time - minutes * 60);
		if (seconds < 10) {
			seconds = `0${seconds}`;
		}
		let min_display = String(minutes);
		if (minutes < 10) {
			min_display = `0${minutes}`;
		}
		return `${min_display}:${seconds}`;
	};

	const handleStartAtChange = (e) => {
		const isChecked = e.target.checked;
		setStartAtEnabled(isChecked);

		if (isChecked && playerRef.current) {
			let currentTime = 0;
			if (embed_method === 'Video.js') {
				if (typeof playerRef.current.currentTime === 'function') {
					currentTime = playerRef.current.currentTime();
				}
			} else if (typeof playerRef.current.currentTime === 'number') {
				currentTime = playerRef.current.currentTime;
			}
			setStartAtTime(convertToTimecode(Math.floor(currentTime)));
		}
	};

	useEffect(() => {
		const originalEmbedCode = embedLink();
		if (!originalEmbedCode) {
			setCurrentEmbedCode('');
			return;
		}

		const tempDiv = document.createElement('div');
		tempDiv.innerHTML = originalEmbedCode;
		const iframe = tempDiv.querySelector('iframe');
		if (!iframe) {
			setCurrentEmbedCode(originalEmbedCode);
			return;
		}

		let src = iframe.getAttribute('src');
		if (!src) {
			setCurrentEmbedCode(originalEmbedCode);
			return;
		}

		src = src.replace(/&?videopack\[start\]=[^&]*/, '');
		src = src.replace(/\?&/, '?').replace(/\?$/, '');

		if (startAtEnabled && startAtTime) {
			const separator = src.includes('?') ? '&' : '?';
			src += `${separator}videopack[start]=${encodeURIComponent(startAtTime)}`;
		}

		iframe.setAttribute('src', src);
		setCurrentEmbedCode(iframe.outerHTML);
	}, [startAtEnabled, startAtTime, attributes.embedlink]);

	const EmbedElements = () => {
		return (
			<>
				<button
					className={`click-trap${shareIsOpen ? ' is-visible' : ''}`}
					onClick={() => {
						setShareIsOpen(!shareIsOpen);
					}}
				/>
				<div
					className={`share-container${
						shareIsOpen ? ' is-visible' : ''
					}${noTitleMeta}`}
				>
					{embedItems() && (
						<>
							<span className="embedcode-container">
								<span className="videopack-icons embed"></span>
								<span>
									{__(
										'Embed:',
										'video-embed-thumbnail-generator'
									)}
								</span>
								<span>
									<input
										className="embedcode videopack-embed-code"
										type="text"
										value={currentEmbedCode}
										onClick={(event) => {
											event.target.select();
										}}
										readOnly
									/>
								</span>
							</span>
							<span className="videopack-start-at-container">
								<input
									type="checkbox"
									className="videopack-start-at-enable"
									id={`videopack-start-at-enable-block-${randomId}`}
									checked={startAtEnabled}
									onChange={handleStartAtChange}
								/>
								<label
									htmlFor={`videopack-start-at-enable-block-${randomId}`}
								>
									{__(
										'Start at:',
										'video-embed-thumbnail-generator'
									)}
								</label>{' '}
								<input
									type="text"
									className="videopack-start-at"
									value={startAtTime}
									onChange={(e) =>
										setStartAtTime(e.target.value)
									}
								/>
							</span>
						</>
					)}
				</div>
			</>
		);
	};

	if (metaBarItems.includes(true)) {
		return (
			<>
				<div className={`videopack-meta-bar${noTitleMeta}`}>
					<span className={'meta-icons'}>
						{embedItems() && (
							<button
								type={'button'}
								className={
									shareIsOpen
										? 'videopack-icons close'
										: 'videopack-icons share'
								}
								onClick={() => {
									setShareIsOpen(!shareIsOpen);
								}}
							/>
						)}
						{downloadlink && (
							<a
								className="download-link"
								href={attributes.src}
								download={true}
								title={__(
									'Click to download',
									'video-embed-thumbnail-generator'
								)}
							>
								<span className="videopack-icons download"></span>
							</a>
						)}
					</span>
					{overlay_title && <span className="title">{title}</span>}
				</div>
				{embedItems() && <EmbedElements />}
			</>
		);
	}
	return null;
};

export default MetaBar;
