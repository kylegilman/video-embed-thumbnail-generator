import { Button, Placeholder, ToolbarGroup, ToolbarButton } from '@wordpress/components';
import {
	BlockControls,
	BlockIcon,
	MediaPlaceholder,
	MediaUpload,
	MediaUploadCheck,
	useBlockProps,
} from '@wordpress/block-editor';

import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { media as mediaIcon, pencil } from '@wordpress/icons';

import { getSettings } from '../../utils/utils';
import { videopack as icon } from '../../assets/icon';
import ListBlock from './ListBlock';
import './editor.scss';

export default function Edit({
	attributes,
	setAttributes,
	context,
	isSelected,
}) {
	const ALLOWED_MEDIA_TYPES = ['video'];
	const {
		gallery_include,
		gallery_id,
		gallery_source,
		gallery_order,
		gallery_orderby,
		gallery_pagination,
		gallery_per_page,
		collection_video_limit,
		enable_collection_video_limit,
		gallery_category,
		gallery_tag,
	} = attributes;

	const [options, setOptions] = useState();
	const [currentPage, setCurrentPage] = useState(1);
	const blockProps = useBlockProps();
	const { createErrorNotice } = useDispatch(noticesStore);

	const { editorPostId, isArchiveTemplate } = useSelect((select) => {
		const editor = select('core/editor');
		const post = editor?.getCurrentPost();
		return {
			editorPostId: editor?.getCurrentPostId(),
			isArchiveTemplate:
				post?.type === 'wp_template' &&
				(post?.slug?.includes('archive') ||
					post?.slug?.includes('category') ||
					post?.slug?.includes('tag') ||
					post?.slug?.includes('taxonomy')),
		};
	}, []);

	const postId = context.postId || editorPostId;

	useEffect(() => {
		if (isArchiveTemplate && gallery_source === 'current') {
			setAttributes({ gallery_source: 'archive' });
		}
	}, [isArchiveTemplate, gallery_source, setAttributes]);

	const videoChildren = useSelect(
		(select) => {
			const query = {
				media_type: 'video',
				order: gallery_order,
				status: 'inherit',
			};

			if (gallery_orderby && gallery_orderby !== 'menu_order') {
				query.orderby = gallery_orderby;
			}

			if (gallery_pagination) {
				query.page = currentPage;
				query.per_page = gallery_per_page || 10;
			} else if (enable_collection_video_limit) {
				query.per_page =
					collection_video_limit && collection_video_limit !== -1
						? collection_video_limit
						: 10;
			} else {
				query.per_page = 10;
			}

			if (gallery_source === 'manual' && gallery_include) {
				query.include = gallery_include.split(',').map(Number);
			} else if (gallery_source === 'category' && gallery_category) {
				query.categories = gallery_category.split(',').map(Number);
			} else if (gallery_source === 'tag' && gallery_tag) {
				query.tags = gallery_tag.split(',').map(Number);
			} else if (
				(gallery_source === 'current' || gallery_source === 'archive') &&
				postId &&
				!isNaN(Number(postId))
			) {
				query.parent = postId;
			} else if (gallery_id && !isNaN(Number(gallery_id))) {
				query.parent = gallery_id;
			} else if (gallery_source === 'manual') {
				return null;
			}

			if (gallery_pagination) {
				query.page = currentPage;
			}

			const records = select('core').getEntityRecords(
				'postType',
				'attachment',
				query
			);

			return {
				videoChildren: records,
				totalPages:
					select('core').getEntityRecordsTotalPages(
						'postType',
						'attachment',
						query
					) || 0,
			};
		},
		[
			postId,
			gallery_include,
			gallery_id,
			gallery_source,
			gallery_order,
			gallery_orderby,
			gallery_pagination,
			gallery_per_page,
			collection_video_limit,
			enable_collection_video_limit,
			gallery_category,
			gallery_tag,
			currentPage,
		]
	);

	useEffect(() => {
		getSettings().then((response) => {
			setOptions(response);
		});
	}, []);

	function setAttributesFromMedia(media) {
		const includeIds = media.map((item) => item.id).join(',');
		setAttributes({
			gallery: true,
			gallery_include: includeIds,
		});
	}

	function onSelectVideo(media) {
		const mediaArray = Array.isArray(media) ? media : [media];

		if (
			!mediaArray ||
			!mediaArray.some((item) => item.hasOwnProperty('url'))
		) {
			setAttributes({
				gallery_include: undefined,
				gallery_id: undefined,
			});
			return;
		}

		setAttributesFromMedia(mediaArray);
	}

	function onAddVideos(media) {
		const mediaArray = Array.isArray(media) ? media : [media];
		const newIncludeIds = mediaArray.map((item) => item.id.toString());

		let currentInclude = [];
		if (gallery_include) {
			currentInclude = gallery_include.split(',');
		} else if (videoChildren) {
			currentInclude = videoChildren.map((video) => video.id.toString());
		}

		const combinedInclude = [
			...new Set([...currentInclude, ...newIncludeIds]),
		].join(',');

		setAttributes({
			gallery: true,
			gallery_include: combinedInclude,
			gallery_source: 'manual',
		});
	}

	function onEditGallery(media) {
		const mediaArray = Array.isArray(media) ? media : [media];
		const newIncludeIds = mediaArray
			.map((item) => item.id.toString())
			.join(',');

		setAttributes({
			gallery_include: newIncludeIds,
		});
	}

	function onInsertCollection() {
		setAttributes({
			gallery: true,
		});
	}

	function onUploadError(message) {
		createErrorNotice(message, { type: 'snackbar' });
	}

	const placeholder = (content) => {
		return (
			<Placeholder
				icon={<BlockIcon icon={icon} />}
				label={__(
					'Videopack Video List',
					'video-embed-thumbnail-generator'
				)}
				instructions={__(
					"Select from your library or upload new videos to create a list.",
					'video-embed-thumbnail-generator'
				)}
			>
				{content}
				<Button
					__next40pxDefaultSize
					variant="secondary"
					onClick={onInsertCollection}
				>
					{__(
						"This post's videos",
						'video-embed-thumbnail-generator'
					)}
				</Button>
			</Placeholder>
		);
	};

	if (!gallery_id && !gallery_include && !postId) {
		return (
			<div {...blockProps}>
				<MediaPlaceholder
					icon={<BlockIcon icon={icon} />}
					onSelect={onSelectVideo}
					accept="video/*"
					allowedTypes={ALLOWED_MEDIA_TYPES}
					value={attributes}
					onError={onUploadError}
					placeholder={placeholder}
					multiple={true}
				/>
			</div>
		);
	}

	return (
		<>
			<BlockControls group="other">
				<ToolbarGroup>
					<MediaUploadCheck>
						{gallery_source === 'manual' ? (
							<MediaUpload
								onSelect={onEditGallery}
								allowedTypes={ALLOWED_MEDIA_TYPES}
								multiple="add"
								value={
									gallery_include
										? gallery_include
												.split(',')
												.map(Number)
										: []
								}
								render={({ open }) => (
									<ToolbarButton
										icon={pencil}
										label={__(
											'Edit Gallery',
											'video-embed-thumbnail-generator'
										)}
										onClick={open}
									/>
								)}
							/>
						) : (
							<MediaUpload
								onSelect={onAddVideos}
								allowedTypes={ALLOWED_MEDIA_TYPES}
								multiple="add"
								render={({ open }) => (
									<ToolbarButton
										icon={mediaIcon}
										label={__(
											'Media Library',
											'video-embed-thumbnail-generator'
										)}
										onClick={open}
									/>
								)}
							/>
						)}
					</MediaUploadCheck>
				</ToolbarGroup>
			</BlockControls>

			<ListBlock
				setAttributes={setAttributes}
				attributes={attributes}
				options={options}
				videoChildren={videoChildren?.videoChildren}
				previewPostId={postId}
				isSelected={isSelected}
				currentPage={currentPage}
				setCurrentPage={setCurrentPage}
				totalPages={videoChildren?.totalPages}
			/>
		</>
	);
}
