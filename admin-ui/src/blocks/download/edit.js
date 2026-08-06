import { useMemo, useEffect, useRef, useState } from '@wordpress/element';
import {
	useBlockProps,
	BlockControls,
	BlockVerticalAlignmentControl,
	AlignmentControl,
	InspectorControls,
} from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import { Icon, mediaAndText } from '@wordpress/icons';
import { download as downloadIcon } from '../../assets/icon';
import { __ } from '@wordpress/i18n';
import BackgroundToggleButton from '../../components/BackgroundToggleButton/BackgroundToggleButton';
import TitleColorPanel from '../../components/TitleColorPanel/TitleColorPanel';
import useVideopackContext from '../../hooks/useVideopackContext';
import useShowBackground from '../../hooks/useShowBackground';
import useVideopackData from '../../hooks/useVideopackData';
import { useVideoFormats } from '../../hooks/useVideoFormats';
import {
	buildDownloadMenuFromSourceGroups,
	getMockDownloadMenuItems,
} from '../../utils/downloadMenu';

const CLASS_KEYS = ['title_color', 'title_background_color'];

/**
 * Edit component for the Videopack Video Download block.
 *
 * @param {Object}   root0               Component props.
 * @param {Object}   root0.attributes    Block attributes.
 * @param {Function} root0.setAttributes Attribute setter.
 * @param {Object}   root0.context       Block context.
 * @param {boolean}  root0.isSelected    Whether the block is selected.
 * @return {Element}                     The rendered component.
 */
export default function Edit({
	attributes,
	setAttributes,
	context,
	isSelected,
}) {
	const vpContext = useVideopackContext(attributes, context, {
		classKeys: CLASS_KEYS,
	});

	const {
		icon = true,
		text = false,
		downloadMode = 'direct',
		textAlign,
	} = attributes;

	const isInsideThumbnail = !!context['videopack/isInsideThumbnail'];
	const isInsidePlayerOverlay = !!context['videopack/isInsidePlayerOverlay'];
	const isInsideTitleMeta = !!context['videopack/isInsideTitleMeta'];
	const isOverlay =
		isInsideThumbnail || (isInsidePlayerOverlay && !isInsideTitleMeta);
	const finalShowBackground = useShowBackground(
		attributes,
		context,
		isOverlay
	);

	const defaultAlign = useMemo(() => {
		if (isInsideThumbnail) {
			return 'center';
		}
		return 'left';
	}, [isInsideThumbnail]);

	const finalTextAlign =
		textAlign || context['videopack/textAlign'] || defaultAlign;
	const position =
		attributes.position || context['videopack/position'] || 'top';

	const attachmentId = vpContext.resolved.attachmentId;
	const videoSrc = vpContext.resolved.src;

	const { data: vpData, isResolving: isResolvingVideopack } =
		useVideopackData('videopack', context);

	const contextSourceGroups = context['videopack/source_groups'];
	const hasContextSourceGroups =
		contextSourceGroups &&
		typeof contextSourceGroups === 'object' &&
		!Array.isArray(contextSourceGroups) &&
		Object.keys(contextSourceGroups).length > 0;

	// Skip in preview contexts — there's no real attachment behind the
	// hardcoded bundled sample video, so this can never resolve anything
	// useful, and previews get rebuilt on every unrelated settings change.
	const { formats: fetchedSourceGroups, isLoading: isLoadingSources } =
		useVideoFormats(
			!hasContextSourceGroups && attachmentId && !vpContext.resolved.isPreview
				? attachmentId
				: null,
			!hasContextSourceGroups &&
				!attachmentId &&
				videoSrc &&
				!vpContext.resolved.isPreview
				? videoSrc
				: null
		);

	const sourceGroups = useMemo(() => {
		if (hasContextSourceGroups) {
			return contextSourceGroups;
		}
		if (
			vpData?.source_groups &&
			Object.keys(vpData.source_groups).length > 0
		) {
			return vpData.source_groups;
		}
		if (
			fetchedSourceGroups &&
			Object.keys(fetchedSourceGroups).length > 0
		) {
			return fetchedSourceGroups;
		}
		return {};
	}, [
		hasContextSourceGroups,
		contextSourceGroups,
		vpData,
		fetchedSourceGroups,
	]);

	const downloadMenu = useMemo(() => {
		const menu = buildDownloadMenuFromSourceGroups(sourceGroups);
		if (menu.hasMultipleCodecs || menu.flatItems.length > 0) {
			return menu;
		}
		if (isLoadingSources || isResolvingVideopack) {
			return { hasMultipleCodecs: false, groups: [], flatItems: [] };
		}
		return {
			hasMultipleCodecs: false,
			groups: [],
			flatItems: getMockDownloadMenuItems(),
		};
	}, [sourceGroups, isLoadingSources, isResolvingVideopack]);

	const blockProps = useBlockProps({
		className: `videopack-download-block videopack-download-wrapper ${vpContext.classes} ${
			isOverlay ? `is-overlay position-${position}` : ''
		} ${isInsideThumbnail ? 'is-inside-thumbnail' : ''} ${
			isInsidePlayerOverlay ? 'is-inside-player' : ''
		} ${isInsideTitleMeta ? 'is-inside-title-meta' : ''} ${isOverlay && !finalShowBackground ? 'has-no-background' : ''} has-text-align-${finalTextAlign} mode-${downloadMode}`,
		style: {
			...vpContext.style,
			display: 'inline-flex',
			alignItems: 'center',
		},
	});

	const [isOpen, setIsOpen] = useState(false);
	const [openSubmenu, setOpenSubmenu] = useState(null);
	const menuContainerRef = useRef(null);

	useEffect(() => {
		if (downloadMode !== 'menu') {
			setIsOpen(false);
			setOpenSubmenu(null);
		}
	}, [downloadMode]);

	useEffect(() => {
		if (!isOpen) {
			return undefined;
		}
		const handleOutside = (event) => {
			if (
				menuContainerRef.current &&
				!menuContainerRef.current.contains(event.target)
			) {
				setIsOpen(false);
				setOpenSubmenu(null);
			}
		};
		document.addEventListener('mousedown', handleOutside);
		return () => document.removeEventListener('mousedown', handleOutside);
	}, [isOpen]);

	useEffect(() => {
		if (!isSelected) {
			setIsOpen(false);
			setOpenSubmenu(null);
		}
	}, [isSelected]);

	const triggerClassName = `videopack-download-trigger videopack-icons style-button${isOpen ? ' is-active' : ''}`;
	const linkClassName = 'videopack-download-link videopack-icons style-button';

	const renderTriggerContent = () => (
		<>
			{icon && (
				<Icon
					icon={downloadIcon}
					className="videopack-icon-svg download-icon"
				/>
			)}
			{text && (
				<span className="videopack-download-text-label">
					{__('Download', 'video-embed-thumbnail-generator')}
				</span>
			)}
		</>
	);

	const renderFlatMenuItems = (formats) =>
		formats.map((format, index) => (
			<li key={index}>
				<button
					type="button"
					onClick={(e) => e.preventDefault()}
					className="videopack-download-link"
				>
					{format.label}
				</button>
			</li>
		));

	const renderMenuList = () => {
		if (downloadMenu.hasMultipleCodecs) {
			return downloadMenu.groups.map((group) => (
				<li
					key={group.id}
					className={`videopack-download-menu-item videopack-has-submenu${
						openSubmenu === group.id ? ' is-open' : ''
					}`}
				>
					<button
						type="button"
						className="videopack-download-submenu-trigger"
						aria-expanded={openSubmenu === group.id}
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							setOpenSubmenu(
								openSubmenu === group.id ? null : group.id
							);
						}}
					>
						{group.label}
					</button>
					<ul
						className={`videopack-download-submenu${
							openSubmenu === group.id ? ' is-visible' : ''
						}`}
					>
						{renderFlatMenuItems(group.items)}
					</ul>
				</li>
			));
		}
		return renderFlatMenuItems(downloadMenu.flatItems);
	};

	return (
		<>
			<BlockControls>
				{isOverlay && (
					<BlockVerticalAlignmentControl
						value={position}
						onChange={(nextPosition) => {
							setAttributes({
								position: nextPosition || undefined,
							});
						}}
					/>
				)}
				<AlignmentControl
					value={finalTextAlign}
					onChange={(nextAlign) => {
						setAttributes({ textAlign: nextAlign });
					}}
				/>
				<ToolbarGroup
					label={__(
						'Toggle Visuals',
						'video-embed-thumbnail-generator'
					)}
				>
					<ToolbarButton
						icon={downloadIcon}
						label={__(
							'Toggle Icon',
							'video-embed-thumbnail-generator'
						)}
						onClick={() => setAttributes({ icon: !icon })}
						isPressed={icon}
					/>
					<ToolbarButton
						icon={mediaAndText}
						label={__(
							'Toggle Text',
							'video-embed-thumbnail-generator'
						)}
						onClick={() => setAttributes({ text: !text })}
						isPressed={text}
					/>
				</ToolbarGroup>
				{isOverlay && (
					<ToolbarGroup>
						<BackgroundToggleButton
							showBackground={finalShowBackground}
							onChange={(value) =>
								setAttributes({ showBackground: value })
							}
						/>
					</ToolbarGroup>
				)}
				<ToolbarGroup
					label={__(
						'Download Mode',
						'video-embed-thumbnail-generator'
					)}
				>
					<ToolbarButton
						label={__(
							'Direct Link',
							'video-embed-thumbnail-generator'
						)}
						onClick={() =>
							setAttributes({ downloadMode: 'direct' })
						}
						isPressed={downloadMode === 'direct'}
					>
						{__('Direct', 'video-embed-thumbnail-generator')}
					</ToolbarButton>
					<ToolbarButton
						label={__(
							'Quality Dropdown Menu',
							'video-embed-thumbnail-generator'
						)}
						onClick={() => setAttributes({ downloadMode: 'menu' })}
						isPressed={downloadMode === 'menu'}
					>
						{__('Menu', 'video-embed-thumbnail-generator')}
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>
			<InspectorControls>
				<TitleColorPanel
					attributes={attributes}
					setAttributes={setAttributes}
					resolved={vpContext.resolved}
				/>
			</InspectorControls>
			<div {...blockProps}>
				{downloadMode === 'menu' ? (
					<div
						className="videopack-download-menu-container"
						ref={menuContainerRef}
					>
						<button
							type="button"
							className={triggerClassName}
							aria-expanded={isOpen}
							aria-haspopup="true"
							onClick={(e) => {
								e.preventDefault();
								setIsOpen(!isOpen);
								if (isOpen) {
									setOpenSubmenu(null);
								}
							}}
						>
							{renderTriggerContent()}
							<span className="videopack-caret">▼</span>
						</button>
						<div
							className={`videopack-download-dropdown-menu${isOpen ? ' is-visible' : ''}`}
							onClick={(e) => e.stopPropagation()}
							onKeyDown={(e) => e.stopPropagation()}
							role="presentation"
						>
							<ul>{renderMenuList()}</ul>
						</div>
					</div>
				) : (
					<button
						type="button"
						className={linkClassName}
						onClick={(e) => e.preventDefault()}
					>
						{renderTriggerContent()}
					</button>
				)}
			</div>
		</>
	);
}
