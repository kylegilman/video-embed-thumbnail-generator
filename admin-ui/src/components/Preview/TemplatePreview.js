import BlockPreview from './BlockPreview';

/**
 * Recursive engine for rendering a list of blocks (a template).
 *
 * @param {Object} props             Component props.
 * @param {Array}  props.template    Array of block structures.
 * @param {Object} props.video       The current video record context.
 * @param {Object} props.context     The inherited block context.
 * @param {Object} props.parentFlags Internal state flags for nesting logic.
 * @return {Array} Array of rendered block previews.
 */
export default function TemplatePreview({
	template = [],
	video = {},
	context = {},
	parentFlags = {},
}) {
	return template.map((block, index) => {
		const [name, attributes = {}, innerBlocks = []] = Array.isArray(block)
			? block
			: [block.name, block.attributes, block.innerBlocks];

		const itemKey = `${video.attachment_id || 'sample'}-${name}-${index}`;

		const currentFlags = { ...parentFlags };
		if (name === 'videopack/thumbnail') {
			currentFlags.isInsideThumbnail = true;
			currentFlags.downloadlink = false;
			currentFlags.embedcode = false;
		}
		if (name === 'videopack/video-player-engine') {
			currentFlags.isInsidePlayerOverlay = true;
			currentFlags.isInsidePlayerContainer = true;
		}

		const isOverlay =
			!!currentFlags.isInsideThumbnail || !!currentFlags.isInsidePlayerOverlay;

		const itemContext = {
			...context,
			...currentFlags,
			'videopack/isInsideThumbnail': currentFlags.isInsideThumbnail,
			'videopack/isInsidePlayerOverlay': currentFlags.isInsidePlayerOverlay,
			'videopack/isInsidePlayerContainer': currentFlags.isInsidePlayerContainer,
			'videopack/downloadlink': currentFlags.downloadlink,
			'videopack/embedcode': currentFlags.embedcode,
			'videopack/postId': video.attachment_id,
			'videopack/title': video.title,
		};

		return (
			<BlockPreview
				key={itemKey}
				name={name}
				attributes={attributes}
				postId={video.attachment_id}
				isOverlay={isOverlay}
				video={video}
				innerBlocks={innerBlocks}
				{...currentFlags}
				context={itemContext}
			>
				{innerBlocks.length > 0 && (
					<TemplatePreview
						template={innerBlocks}
						video={video}
						context={itemContext}
						parentFlags={currentFlags}
					/>
				)}
			</BlockPreview>
		);
	});
}
