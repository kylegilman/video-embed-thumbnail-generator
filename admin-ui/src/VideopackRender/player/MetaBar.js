import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';

const MetaBar = ({ attributes, attachment, metaBarVisible }) => {
	const {
		src,
		title,
		embedcode,
		embeddable,
		downloadlink,
		twitter_button,
		facebook_button,
		videoTitle,
	} = attributes;
	const metaBarItems = [
		title,
		embedcode,
		downloadlink,
		twitter_button,
		facebook_button,
	];
	const noTitleMeta = title ? '' : ' no-title';
	const [shareIsOpen, setShareIsOpen] = useState(false);

	const embedItems = () => {
		if (embeddable && (embedcode || twitter_button || facebook_button)) {
			return true;
		}
		return false;
	};

	const embedLink = () => {
		if (attachment.hasResolved) {
			return String(attachment?.record?.link + 'embed');
		}
		return '';
	};

	const socialIcons = () => {
		return twitter_button || facebook_button ? true : false;
	};

	const twitterLink = () => {
		if (attachment.hasResolved) {
			return String(
				'https://twitter.com/share?text=' +
					attachment.record.title.rendered +
					'&url='
			);
		}
		return '';
	};

	const openShareLink = (event) => {
		window.open(
			event.target.href,
			'',
			'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=260,width=600'
		);
		return false;
	};

	const facebookLink = () => {
		if (attachment.hasResolved) {
			return String('https://www.facebook.com/sharer/sharer.php?u=');
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
					{embedcode && (
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
					{socialIcons && (
						<div className="social-icons">
							{twitter_button && (
								<>
									<a
										title={__('Share on Twitter')}
										href={twitterLink()}
										onClick={openShareLink}
									>
										<span className="vjs-icon-twitter"></span>
									</a>
								</>
							)}
							{facebook_button && (
								<>
									<a
										title={__('Share on Facebook')}
										href={facebookLink()}
										onClick={openShareLink}
									>
										<span className="vjs-icon-facebook"></span>
									</a>
								</>
							)}
						</div>
					)}
				</div>
			</>
		);
	};

	if (metaBarItems.includes(true)) {
		return (
			<>
				<div
					className={`videopack-meta-bar${
						metaBarVisible ? ' is-visible' : ''
					}${noTitleMeta}`}
				>
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
					{title && <span className="title">{videoTitle}</span>}
				</div>
				{embedItems() && <EmbedElements />}
			</>
		);
	}
	return null;
};

export default MetaBar;
