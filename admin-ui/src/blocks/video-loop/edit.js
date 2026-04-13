import {
	useBlockProps,
	InnerBlocks,
	BlockContextProvider,
} from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Spinner } from '@wordpress/components';
import { useMemo, useState, useEffect } from '@wordpress/element';
import useVideoQuery from '../../hooks/useVideoQuery';
import { VideoThumbnailPreview } from '../thumbnail/VideoThumbnailPreview';
import { VideoTitle } from '../video-title/edit';
import { VideoDuration } from '../video-duration/edit';
import { ViewCount } from '../view-count/edit';
import { PlayButton } from '../play-button/edit';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer.js';
import { getSettings } from '../../api/settings';

/**
 * Helper component to render a custom SVG duotone filter.
 *
 * @param {Object} root0        Props
 * @param {Array}  root0.colors Array of two hex colors
 * @param {string} root0.id     Filter ID
 * @return {Element|null} SVG element
 */
const CustomDuotoneFilter = ({ colors, id }) => {
	if (!colors || colors.length < 2) {
		return null;
	}

	const parseColor = (color) => {
		if (!color) {
			return { r: 0, g: 0, b: 0, a: 1 };
		}

		// Handle Hex colors (#RGB, #RGBA, #RRGGBB, #RRGGBBAA)
		if (color.startsWith('#')) {
			const hex = color.slice(1);
			let r = 0,
				g = 0,
				b = 0,
				a = 255;
			if (hex.length === 3) {
				r = parseInt(hex[0] + hex[0], 16);
				g = parseInt(hex[1] + hex[1], 16);
				b = parseInt(hex[2] + hex[2], 16);
			} else if (hex.length === 4) {
				r = parseInt(hex[0] + hex[0], 16);
				g = parseInt(hex[1] + hex[1], 16);
				b = parseInt(hex[2] + hex[2], 16);
				a = parseInt(hex[3] + hex[3], 16);
			} else if (hex.length === 6) {
				r = parseInt(hex.slice(0, 2), 16);
				g = parseInt(hex.slice(2, 4), 16);
				b = parseInt(hex.slice(4, 6), 16);
			} else if (hex.length === 8) {
				r = parseInt(hex.slice(0, 2), 16);
				g = parseInt(hex.slice(2, 4), 16);
				b = parseInt(hex.slice(4, 6), 16);
				a = parseInt(hex.slice(6, 8), 16);
			}
			return {
				r: r / 255,
				g: g / 255,
				b: b / 255,
				a: a / 255,
			};
		}

		// Handle RGB/RGBA strings
		const rgbMatch = color.match(
			/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/
		);
		if (rgbMatch) {
			return {
				r: parseInt(rgbMatch[1], 10) / 255,
				g: parseInt(rgbMatch[2], 10) / 255,
				b: parseInt(rgbMatch[3], 10) / 255,
				a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1,
			};
		}

		return { r: 0, g: 0, b: 0, a: 1 };
	};

	const c1 = parseColor(colors[0]);
	const c2 = parseColor(colors[1]);

	const rValues = `${c1.r} ${c2.r}`;
	const gValues = `${c1.g} ${c2.g}`;
	const bValues = `${c1.b} ${c2.b}`;
	const aValues = `${c1.a} ${c2.a}`;

	return (
		<svg
			style={{
				position: 'absolute',
				width: 0,
				height: 0,
				visibility: 'hidden',
			}}
			aria-hidden="true"
		>
			<filter id={id}>
				<feColorMatrix
					type="matrix"
					values=".299 .587 .114 0 0 .299 .587 .114 0 0 .299 .587 .114 0 0 .299 .587 .114 0 0"
				/>
				<feComponentTransfer colorInterpolationFilters="sRGB">
					<feFuncR type="table" tableValues={rValues} />
					<feFuncG type="table" tableValues={gValues} />
					<feFuncB type="table" tableValues={bValues} />
					<feFuncA type="table" tableValues={aValues} />
				</feComponentTransfer>
			</filter>
		</svg>
	);
};

/**
 * The Edit component for the Video Loop block.
 *
 * @param {Object} props          Component props.
 * @param {Object} props.context  Block context.
 * @param {string} props.clientId Block client ID.
 * @return {Element}              The rendered component.
 */
export default function Edit( { context, clientId } ) {
	const [options, setOptions] = useState({});

	useEffect(() => {
		getSettings().then((response) => {
			setOptions(response);
		});
	}, []);

	// We get query-related attributes from the parent collection block via context.
	const queryAttributes = {
		gallery_source: context['videopack/gallery_source'],
		gallery_id: context['videopack/gallery_id'],
		gallery_category: context['videopack/gallery_category'],
		gallery_tag: context['videopack/gallery_tag'],
		gallery_orderby: context['videopack/gallery_orderby'],
		gallery_order: context['videopack/gallery_order'],
		gallery_include: context['videopack/gallery_include'],
		gallery_exclude: context['videopack/gallery_exclude'],
		gallery_pagination: context['videopack/gallery_pagination'],
		gallery_per_page: context['videopack/gallery_per_page'] || 12,
		page_number: context['videopack/currentPage'] || 1,
	};

	const {
		presetDuotoneClass,
		customDuotoneColors,
		thumbClientId,
		previewPostId,
	} = useSelect(
		(select) => {
			const { getBlocks } = select('core/block-editor');
			const blocks = getBlocks(clientId) || [];

			// Helper to find a block by name recursively in the inner blocks tree
			const findBlockRecursive = (blockList, name) => {
				for (const block of blockList) {
					if (block.name === name) {
						return block;
					}
					if (block.innerBlocks && block.innerBlocks.length > 0) {
						const found = findBlockRecursive(
							block.innerBlocks,
							name
						);
						if (found) {
							return found;
						}
					}
				}
				return null;
			};

			const thumb = findBlockRecursive(blocks, 'videopack/thumbnail');
			const duotone = thumb?.attributes?.style?.color?.duotone;
			let presetClass = '';
			let customColors = null;

			if (
				typeof duotone === 'string' &&
				duotone.startsWith('var:preset|duotone|')
			) {
				presetClass = `wp-duotone-${duotone.split('|').pop()}`;
			} else if (Array.isArray(duotone)) {
				customColors = duotone;
			}

			return {
				presetDuotoneClass: presetClass,
				customDuotoneColors: customColors,
				thumbClientId: thumb?.clientId,
				previewPostId: select('core/editor').getCurrentPostId(),
			};
		},
		[clientId]
	);

	const templateBlocks = useSelect(
		(select) => select('core/block-editor').getBlocks(clientId) || [],
		[clientId]
	);

	// Generate a stable ID for custom filters to prevent flickering.
	// We use the Thumbnail block's ID so it matches what the Thumbnail block expects locally.
	const customFilterId = useMemo(
		() =>
			thumbClientId
				? `videopack-custom-duotone-${ thumbClientId.split( '-' )[ 0 ] }`
				: '',
		[ thumbClientId ]
	);

	// Final duotone class resolution
	const resolvedDuotoneClass =
		presetDuotoneClass || ( customDuotoneColors ? customFilterId : '' );

	// We fetch query data to power the live preview template
	const { videoResults, isResolving } = useVideoQuery(
		queryAttributes,
		previewPostId
	);

	const layout = context['videopack/layout'] || 'grid';
	const columns = context['videopack/columns'] || 3;

	const blockProps = useBlockProps({
		className: `videopack-video-loop layout-${layout} columns-${columns}`,
	});

	/**
	 * Helper to render a high-fidelity preview of the template blocks
	 *
	 * @param {Array}  previewBlocks Template blocks to render
	 * @param {Object} video         Video data
	 * @param {string} skinName      Selected skin
	 * @return {Array}               The rendered blocks.
	 */
	const renderBlockPreview = (previewBlocks, video, skinName) => {
		return previewBlocks.map((block) => {
			const {
				name,
				attributes: blockAttrs,
				innerBlocks,
				clientId: blockClientId,
			} = block;
			const itemKey = `${video.id}-${blockClientId}`;

			switch (name) {
				case 'videopack/thumbnail':
					return (
						<VideoThumbnailPreview
							{...blockAttrs}
							postId={video.attachment_id}
							skin={skinName}
							resolvedDuotoneClass={resolvedDuotoneClass}
							key={ itemKey }
						>
							{ innerBlocks?.length > 0 &&
								renderBlockPreview(
									innerBlocks,
									video,
									skinName
								) }
						</VideoThumbnailPreview>
					);
				case 'videopack/video-title':
					return (
						<div key={itemKey} className="videopack-video-title">
							<VideoTitle
								{...blockAttrs}
								postId={video.attachment_id}
								isInsideThumbnail={true}
							/>
						</div>
					);
				case 'videopack/video-duration':
					return (
						<div key={itemKey} className="videopack-video-duration">
							<VideoDuration postId={video.attachment_id} />
						</div>
					);
				case 'videopack/view-count':
					return (
						<div key={itemKey} className="videopack-view-count">
							<ViewCount
								{...blockAttrs}
								postId={video.attachment_id}
								count={video.player_vars?.starts}
							/>
						</div>
					);
				case 'videopack/play-button':
					return <PlayButton key={itemKey} skin={skinName} />;
				case 'videopack/videopack-video':
					return (
						<div key={itemKey} className="videopack-video-preview">
							<VideoPlayer
								attributes={{
									...options,
									...blockAttrs,
									id: video.attachment_id,
									title: video.title,
									skin: skinName,
									sources: video.player_vars?.sources,
									poster: video.poster_url,
									starts: video.player_vars?.starts,
								}}
							/>
						</div>
					);
				default:
					return null;
			}
		});
	};

	const videos = videoResults || [];

	if (isResolving && videos.length === 0) {
		return (
			<div {...blockProps}>
				<div className="videopack-collection-loading">
					<Spinner />
				</div>
			</div>
		);
	}

	if (!isResolving && videos.length === 0) {
		return (
			<div {...blockProps}>
				<div className="videopack-no-videos">
					{__(
						'No videos found for this source.',
						'video-embed-thumbnail-generator'
					)}
				</div>
			</div>
		);
	}

	return (
		<div { ...blockProps }>
			<CustomDuotoneFilter
				colors={ customDuotoneColors }
				id={ customFilterId }
			/>
			<div className="videopack-collection-grid">
				{videos.map((video, index) => {
					const isEditableTemplate = index === 0;

					return (
						<div
							key={`${video.attachment_id || index}-${index}`}
							className={`videopack-collection-item ${
								isEditableTemplate
									? 'is-editable'
									: 'is-preview'
							}`}
						>
							<BlockContextProvider
								value={{
									postId: video.attachment_id,
									'videopack/skin': context['videopack/skin'],
									'videopack/title_color':
										context['videopack/title_color'],
									'videopack/title_background_color':
										context[
											'videopack/title_background_color'
										],
									'videopack/play_button_color':
										context['videopack/play_button_color'],
									'videopack/play_button_icon_color':
										context[
											'videopack/play_button_icon_color'
										],
									'videopack/control_bar_bg_color':
										context[
											'videopack/control_bar_bg_color'
										],
									'videopack/control_bar_color':
										context['videopack/control_bar_color'],
								}}
							>
								{isEditableTemplate ? (
									<InnerBlocks
										templateLock={false}
										renderAppender={
											InnerBlocks.ButtonBlockAppender
										}
									/>
								) : (
									renderBlockPreview(
										templateBlocks,
										video,
										context['videopack/skin'],
										options
									)
								)}
							</BlockContextProvider>
						</div>
					);
				})}
			</div>
		</div>
	);
}
