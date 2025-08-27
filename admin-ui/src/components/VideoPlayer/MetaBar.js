import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';

const MetaBar = ({ attributes }) => {
	const {
		src,
		overlay_title,
		title,
		embedcode,
		embeddable,
		downloadlink,
		twitter_button,
		facebook_button,
	} = attributes;
	const metaBarItems = [
		overlay_title,
		embedcode,
		downloadlink,
		twitter_button,
		facebook_button,
	];
	const noTitleMeta = overlay_title ? '' : ' no-title';
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
								<span>{__('Embed:')}</span>
								<span>
									<input
										className="embedcode"
										type="text"
										value={embedLink()}
										onClick={(event) => {
											event.target.select();
										}}
										readOnly
									/>
								</span>
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
										? 'vjs-icon-cancel'
										: 'vjs-icon-share'
								}
								onClick={() => {
									setShareIsOpen(!shareIsOpen);
								}}
							/>
						)}
						{downloadlink && (
							<a
								className="download-link"
								href={src}
								download={true}
								title={__('Click to download')}
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
