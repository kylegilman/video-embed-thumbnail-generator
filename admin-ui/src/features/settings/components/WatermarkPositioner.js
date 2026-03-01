/* global Image */
import { __ } from '@wordpress/i18n';

import {
	useState,
	useEffect,
	useRef,
	useMemo,
	useCallback,
} from '@wordpress/element';

const WatermarkPositioner = ({ baseFrame, settings, onChange }) => {
	const containerRef = useRef(null);
	const watermarkRef = useRef(null);
	const [watermarkImage, setWatermarkImage] = useState(null);
	const [isDragging, setIsDragging] = useState(false);
	const [isResizing, setIsResizing] = useState(false);
	const [transientScale, setTransientScale] = useState(null);
	const [transientPosition, setTransientPosition] = useState(null); // { left, top } in pixels
	const [isFocused, setIsFocused] = useState(true);

	const dragStartRef = useRef({ x: 0, y: 0, initialLeft: 0, initialTop: 0 });

	useEffect(() => {
		if (settings.url) {
			const img = new Image();
			img.onload = () => setWatermarkImage(img);
			img.src = settings.url;
		}
	}, [settings.url]);

	const {
		left: propLeft,
		top: propTop,
		width: wmWidth,
		height: wmHeight,
	} = useMemo(() => {
		if (!baseFrame || !watermarkImage) {
			return { left: 0, top: 0, width: 0, height: 0, aspectRatio: 1 };
		}

		const containerWidth = baseFrame.width;
		const containerHeight = baseFrame.height;

		// Use transientScale if available, else settings.scale
		const scale =
			transientScale !== null
				? transientScale
				: Number(settings.scale || 50);
		const h = (containerHeight * scale) / 100;
		const aspectRatio = watermarkImage.width / watermarkImage.height;
		const w = h * aspectRatio;

		const xOffset = Number(settings.x || 0);
		const yOffset = Number(settings.y || 0);

		const hOffsetPx = (containerWidth * xOffset) / 100;
		const vOffsetPx = (containerHeight * yOffset) / 100;

		let l = 0;
		let t = 0;

		switch (settings.align) {
			case 'left':
				l = hOffsetPx;
				break;
			case 'right':
				l = containerWidth - w - hOffsetPx;
				break;
			case 'center':
			default:
				l = (containerWidth - w) / 2 - hOffsetPx;
				break;
		}

		switch (settings.valign) {
			case 'top':
				t = vOffsetPx;
				break;
			case 'bottom':
				t = containerHeight - h - vOffsetPx;
				break;
			case 'center':
			default:
				t = (containerHeight - h) / 2 - vOffsetPx;
				break;
		}
		return { left: l, top: t, width: w, height: h, aspectRatio };
	}, [baseFrame, watermarkImage, settings, transientScale]);

	const handleMouseDown = (e) => {
		e.preventDefault();
		if (watermarkRef.current) {
			watermarkRef.current.focus();
		}
		setIsDragging(true);
		// Initialize transient position with the current position derived from props
		setTransientPosition({ left: propLeft, top: propTop });
		dragStartRef.current = {
			x: e.clientX,
			y: e.clientY,
			initialLeft: propLeft,
			initialTop: propTop,
		};
	};

	const handleResizeStart = (e, handle) => {
		e.preventDefault();
		e.stopPropagation();
		if (watermarkRef.current) {
			watermarkRef.current.focus();
		}
		setIsResizing(true);

		const currentScale =
			transientScale !== null
				? transientScale
				: Number(settings.scale || 50);
		setTransientScale(currentScale);
		setTransientPosition({ left: propLeft, top: propTop });

		dragStartRef.current = {
			x: e.clientX,
			y: e.clientY,
			initialLeft: propLeft,
			initialTop: propTop,
			initialScale: currentScale,
			handle,
			aspectRatio: wmWidth / wmHeight,
		};
	};

	const finalizeInteraction = useCallback(() => {
		if (!isDragging && !isResizing) {
			return;
		}
		const wasResizing = isResizing;

		// The transient state is not set until a drag/resize starts.
		// If the user just clicks without moving, there's nothing to finalize.
		if (!baseFrame || !watermarkImage || !transientPosition) {
			setTransientPosition(null);
			setTransientScale(null);
			return;
		}

		setIsDragging(false);
		setIsResizing(false);

		const finalLeft = transientPosition.left;
		const finalTop = transientPosition.top;
		const containerWidth = baseFrame.width;
		const containerHeight = baseFrame.height;
		const finalScale =
			wasResizing && transientScale !== null
				? transientScale
				: Number(settings.scale || 50);

		// Recalculate dimensions based on finalScale for alignment logic
		const h = (containerHeight * finalScale) / 100;
		const aspectRatio = watermarkImage.width / watermarkImage.height;
		const w = h * aspectRatio;

		// Determine Horizontal Alignment and Offset
		let newAlign = 'center';
		let newX = 0;
		const centerPosH = (containerWidth - w) / 2;

		if (finalLeft > centerPosH) {
			newAlign = 'right';
			newX = ((containerWidth - w - finalLeft) / containerWidth) * 100;
		} else {
			const distToLeft = finalLeft;
			const distToCenter = centerPosH - finalLeft;
			if (distToLeft < distToCenter) {
				newAlign = 'left';
				newX = (finalLeft / containerWidth) * 100;
			} else {
				newAlign = 'center';
				newX = (distToCenter / containerWidth) * 100;
			}
		}

		// Determine Vertical Alignment and Offset
		let newValign = 'center';
		let newY = 0;
		const centerPosV = (containerHeight - h) / 2;

		if (finalTop > centerPosV) {
			newValign = 'bottom';
			newY = ((containerHeight - h - finalTop) / containerHeight) * 100;
		} else {
			const distToTop = finalTop;
			const distToCenter = centerPosV - finalTop;
			if (distToTop < distToCenter) {
				newValign = 'top';
				newY = (finalTop / containerHeight) * 100;
			} else {
				newValign = 'center';
				newY = (distToCenter / containerHeight) * 100;
			}
		}

		onChange({
			...settings,
			scale: Math.round(finalScale * 100) / 100,
			align: newAlign,
			valign: newValign,
			x: Math.round(newX * 100) / 100,
			y: Math.round(newY * 100) / 100,
		});

		setTransientPosition(null);
		setTransientScale(null);
	}, [
		isDragging,
		isResizing,
		baseFrame,
		watermarkImage,
		transientPosition,
		transientScale,
		settings,
		onChange,
	]);

	const handleFocus = useCallback(() => {
		setIsFocused(true);
	}, []);

	const handleBlur = useCallback(
		(e) => {
			if (e.currentTarget.contains(e.relatedTarget)) {
				return;
			}
			setIsFocused(false);
			finalizeInteraction();
		},
		[finalizeInteraction]
	);

	const handleDragKeyDown = (e) => {
		if (
			!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)
		) {
			return;
		}
		e.preventDefault();

		const currentLeft = transientPosition
			? transientPosition.left
			: propLeft;
		const currentTop = transientPosition ? transientPosition.top : propTop;

		let newLeft = currentLeft;
		let newTop = currentTop;
		const step = e.shiftKey ? 10 : 1; // Pixel-based step

		switch (e.key) {
			case 'ArrowUp':
				newTop -= step;
				break;
			case 'ArrowDown':
				newTop += step;
				break;
			case 'ArrowLeft':
				newLeft -= step;
				break;
			case 'ArrowRight':
				newLeft += step;
				break;
		}

		// Constrain
		const containerWidth = baseFrame.width;
		const containerHeight = baseFrame.height;
		newLeft = Math.max(0, Math.min(newLeft, containerWidth - wmWidth));
		newTop = Math.max(0, Math.min(newTop, containerHeight - wmHeight));

		setTransientPosition({ left: newLeft, top: newTop });
	};

	const handleResizeKeyDown = (e, handle) => {
		if (
			!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)
		) {
			return;
		}
		e.preventDefault();
		e.stopPropagation();

		const currentScale =
			transientScale !== null
				? transientScale
				: Number(settings.scale || 50);
		const { left: currentLeft, top: currentTop } = transientPosition || {
			left: propLeft,
			top: propTop,
		};

		const step = e.shiftKey ? 5 : 1; // Scale step
		let scaleDelta = 0;

		// For SE and NW handles, right/down increases size.
		if (handle === 'se' || handle === 'nw') {
			if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
				scaleDelta = step;
			} else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
				scaleDelta = -step;
			}
		}
		// For SW and NE handles, right/up increases size.
		else if (handle === 'sw' || handle === 'ne') {
			if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
				scaleDelta = step;
			} else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
				scaleDelta = -step;
			}
		}

		let newScale = currentScale + scaleDelta;
		newScale = Math.round(newScale * 100) / 100;
		newScale = Math.max(1, Math.min(100, newScale));

		if (newScale === currentScale) {
			return;
		}

		const containerHeight = baseFrame.height;
		const oldHeight = (containerHeight * currentScale) / 100;
		const oldWidth = oldHeight * (wmWidth / wmHeight);
		const newHeight = (containerHeight * newScale) / 100;
		const newWidth = newHeight * (wmWidth / wmHeight);

		let newLeft = currentLeft;
		let newTop = currentTop;

		if (handle === 'sw' || handle === 'nw') {
			newLeft = currentLeft + (oldWidth - newWidth);
		}
		if (handle === 'ne' || handle === 'nw') {
			newTop = currentTop + (oldHeight - newHeight);
		}
		setTransientScale(newScale);
		setTransientPosition({ left: newLeft, top: newTop });
	};

	const handleMouseMove = useCallback(
		(e) => {
			if (
				(!isDragging && !isResizing) ||
				!baseFrame ||
				!containerRef.current
			) {
				return;
			}
			const dragStart = dragStartRef.current;
			const containerWidth = baseFrame.width;
			const containerHeight = baseFrame.height;

			// Get the on-screen dimensions of the container
			const rect = containerRef.current.getBoundingClientRect();

			// Calculate the scaling factor between the on-screen container and the base canvas
			const scaleX = containerWidth / rect.width;
			const scaleY = containerHeight / rect.height;

			const dxCanvas = (e.clientX - dragStart.x) * scaleX;
			const dyCanvas = (e.clientY - dragStart.y) * scaleY;

			if (isDragging) {
				let newLeft = dragStart.initialLeft + dxCanvas;
				let newTop = dragStart.initialTop + dyCanvas;

				// Constrain to container
				newLeft = Math.max(
					0,
					Math.min(newLeft, containerWidth - wmWidth)
				);
				newTop = Math.max(
					0,
					Math.min(newTop, containerHeight - wmHeight)
				);

				setTransientPosition({ left: newLeft, top: newTop });
			} else if (isResizing) {
				const {
					initialScale,
					initialLeft,
					initialTop,
					aspectRatio,
					handle,
				} = dragStart;
				const initialHeight = (containerHeight * initialScale) / 100;
				const initialWidth = initialHeight * aspectRatio;

				let newHeight = initialHeight;
				if (handle === 'se' || handle === 'sw') {
					newHeight = initialHeight + dyCanvas;
				} else {
					newHeight = initialHeight - dyCanvas;
				}

				let newScale = (newHeight / containerHeight) * 100;
				newScale = Math.round(newScale * 100) / 100;
				// Constrain scale
				newScale = Math.max(1, Math.min(100, newScale));

				// Recalculate dimensions based on constrained scale
				newHeight = (containerHeight * newScale) / 100;
				const newWidth = newHeight * aspectRatio;

				let newLeft = initialLeft;
				let newTop = initialTop;

				if (handle === 'sw') {
					newLeft = initialLeft + (initialWidth - newWidth);
				} else if (handle === 'ne') {
					newTop = initialTop + (initialHeight - newHeight);
				} else if (handle === 'nw') {
					newLeft = initialLeft + (initialWidth - newWidth);
					newTop = initialTop + (initialHeight - newHeight);
				}

				setTransientScale(newScale);
				setTransientPosition({ left: newLeft, top: newTop });
			}
		},
		[isDragging, isResizing, baseFrame, wmWidth, wmHeight]
	);

	useEffect(() => {
		if (isDragging || isResizing) {
			window.addEventListener('mousemove', handleMouseMove, {
				passive: true,
			});
			window.addEventListener('mouseup', finalizeInteraction, {
				once: true,
			});
		}

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', finalizeInteraction);
		};
	}, [isDragging, isResizing, handleMouseMove, finalizeInteraction]);

	if (!baseFrame || !watermarkImage) {
		return null;
	}

	const containerWidth = baseFrame.width;
	const containerHeight = baseFrame.height;

	// Use transient position if dragging, otherwise use position derived from props
	const currentLeft = transientPosition ? transientPosition.left : propLeft;
	const currentTop = transientPosition ? transientPosition.top : propTop;

	return (
		<div
			ref={containerRef}
			style={{
				position: 'relative',
				width: '100%',
				aspectRatio: `${containerWidth} / ${containerHeight}`,
				backgroundImage: `url(${baseFrame.toDataURL()})`,
				backgroundSize: 'contain',
				backgroundRepeat: 'no-repeat',
				border: '1px solid #ddd',
				marginBottom: '1em',
				overflow: 'hidden',
				userSelect: 'none',
			}}
		>
			<div
				ref={watermarkRef}
				style={{
					position: 'absolute',
					left: `${(currentLeft / containerWidth) * 100}%`,
					top: `${(currentTop / containerHeight) * 100}%`,
					width: `${(wmWidth / containerWidth) * 100}%`,
					height: `${(wmHeight / containerHeight) * 100}%`,
				}}
				role="button"
				tabIndex="0"
				aria-label={__(
					'Move watermark',
					'video-embed-thumbnail-generator'
				)}
				onMouseDown={handleMouseDown}
				onKeyDown={handleDragKeyDown}
				onFocus={handleFocus}
				onBlur={handleBlur}
			>
				<img
					src={settings.url}
					alt="Watermark"
					style={{
						width: '100%',
						height: '100%',
						cursor: isDragging ? 'grabbing' : 'move',
						userSelect: 'none',
						display: 'block',
					}}
					draggable={false}
				/>
				{isFocused && (
					<>
						<div
							role="slider"
							tabIndex="0"
							aria-label={__(
								'Resize watermark from top left',
								'video-embed-thumbnail-generator'
							)}
							className="videopack-resize-handle nw"
							onMouseDown={(e) => handleResizeStart(e, 'nw')}
							onKeyDown={(e) => handleResizeKeyDown(e, 'nw')}
						/>
						<div
							role="slider"
							tabIndex="0"
							aria-label={__(
								'Resize watermark from top right',
								'video-embed-thumbnail-generator'
							)}
							className="videopack-resize-handle ne"
							onMouseDown={(e) => handleResizeStart(e, 'ne')}
							onKeyDown={(e) => handleResizeKeyDown(e, 'ne')}
						/>
						<div
							role="slider"
							tabIndex="0"
							aria-label={__(
								'Resize watermark from bottom left',
								'video-embed-thumbnail-generator'
							)}
							className="videopack-resize-handle sw"
							onMouseDown={(e) => handleResizeStart(e, 'sw')}
							onKeyDown={(e) => handleResizeKeyDown(e, 'sw')}
						/>
						<div
							role="slider"
							tabIndex="0"
							aria-label={__(
								'Resize watermark from bottom right',
								'video-embed-thumbnail-generator'
							)}
							className="videopack-resize-handle se"
							onMouseDown={(e) => handleResizeStart(e, 'se')}
							onKeyDown={(e) => handleResizeKeyDown(e, 'se')}
						/>
					</>
				)}
			</div>
		</div>
	);
};

export default WatermarkPositioner;
