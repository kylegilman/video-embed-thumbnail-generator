import { Icon, Spinner } from '@wordpress/components';
import { seen } from '@wordpress/icons';
import { _n, sprintf } from '@wordpress/i18n';
import {
	play as playIcon,
	playOutline as playOutlineIcon,
} from '../../assets/icon';
import useVideopackContext from '../../hooks/useVideopackContext';
import useVideopackData from '../../hooks/useVideopackData';

const CLASS_KEYS = ['title_color', 'title_background_color'];

/**
 * A internal component to display the view count with correct styling and data.
 *
 * @param {Object}  root0            Component props.
 * @param {Object}  root0.blockProps Block props.
 * @param {string}  root0.iconType   Type of icon to display.
 * @param {boolean} root0.showText   Whether to show the "views" text.
 * @param {number}  root0.count      Manual count override.
 * @param {Object}  root0.attributes Block attributes.
 * @param {Object}  root0.context    Block context.
 * @return {Element}                 The rendered component.
 */
export default function ViewCount({
	blockProps,
	iconType = 'none',
	showText = true,
	count,
	attributes = {},
	context = {},
}) {
	const vpContext = useVideopackContext(attributes, context, {
		classKeys: CLASS_KEYS,
	});
	const { data: views, isResolving } = useVideopackData('views', context);
	const attachmentId = vpContext.resolved.attachmentId;

	if (vpContext.resolved.isDiscovering && !attachmentId) {
		return (
			<div {...blockProps}>
				<Spinner />
			</div>
		);
	}

	if (!attachmentId && count === undefined && !vpContext.resolved.isPreview) {
		return null;
	}

	if (isResolving) {
		return (
			<div {...blockProps}>
				<Spinner />
			</div>
		);
	}

	let safeViews = 0;
	if (count !== undefined) {
		safeViews = Number(count);
	} else if (views !== undefined && views !== null) {
		safeViews = Number(views);
	}

	const displayValue = showText
		? sprintf(
				/* translators: %s is the formatted number of views */
				_n(
					'%s view',
					'%s views',
					safeViews,
					'video-embed-thumbnail-generator'
				),
				safeViews.toLocaleString()
			)
		: safeViews.toLocaleString();

	const renderIcon = () => {
		switch (iconType) {
			case 'eye':
				return (
					<Icon icon={seen} className="videopack-icon-left-margin" />
				);
			case 'play':
				return (
					<Icon
						icon={playIcon}
						size={16}
						className="videopack-icon-left-margin"
					/>
				);
			case 'playOutline':
				return (
					<Icon
						icon={playOutlineIcon}
						size={16}
						className="videopack-icon-left-margin"
					/>
				);
			default:
				return null;
		}
	};

	return (
		<div {...blockProps}>
			{renderIcon()}
			{displayValue}
		</div>
	);
}
