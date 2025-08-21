import { Icon, Tooltip } from '@wordpress/components';
import { help } from '@wordpress/icons';

const VideopackTooltip = ({ text }) => {
	return (
		<Tooltip text={text} className="videopack-tooltip">
			<span className="videopack-tooltip">
				<Icon icon={help} />
			</span>
		</Tooltip>
	);
};

export default VideopackTooltip;
