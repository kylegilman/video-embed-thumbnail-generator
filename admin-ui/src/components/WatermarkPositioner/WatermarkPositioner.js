/* global Image */
import { __ } from '@wordpress/i18n';
import {
	useState,
	useEffect,
	useRef,
	useMemo,
	useCallback,
} from '@wordpress/element';

const WatermarkPositioner = ({
	containerDimensions,
	settings,
	onChange,
	isSelected = true,
	showBackground = false,
	backgroundDataUrl = null,
	imageUrl = '',
	aspectRatio: propAspectRatio = null,
	children,
}) => {
	const containerRef = useRef(null);
	const watermarkRef = useRef(null);
	const [watermarkImage, setWatermarkImage] = useState(null);
	const [isDragging, setIsDragging] = useState(false);
	const [isResizing, setIsResizing] = useState(false);
	const [transientScale, setTransientScale] = useState(null);
	const [transientPercentages, setTransientPercentages] = useState(null); // { x, y } in percentages
	const [isFocused, setIsFocused] = useState(false);

	const lastAspectRatioRef = useRef(propAspectRatio || 1);
	useEffect(() => {
		if (watermarkImage) {
			lastAspectRatioRef.current =
				watermarkImage.width / watermarkImage.height;
		} else if (propAspectRatio) {
			lastAspectRatioRef.current = propAspectRatio;
		}
	}, [watermarkImage, propAspectRatio]);

	const dragStartRef = useRef({ x: 0, y: 0, initialLeft: 0, initialTop: 0 });
	const stateRef = useRef({});

	const effectiveImageUrl = imageUrl || settings?.url || settings?.watermark;

	useEffect(() => {
		if (effectiveImageUrl) {
			const img = new Image();
			img.onload = () => setWatermarkImage(img);
			img.src = effectiveImageUrl;
		} else {
			setWatermarkImage(null);
		}
	}, [effectiveImageUrl]);

	const { wmStyle, wmWidth, wmHeight, aspectRatio } = useMemo(() => {
		if (!containerDimensions) {
			return {
				wmStyle: {},
				wmWidth: 0,
				wmHeight: 0,
				aspectRatio: 1,
			};
		}

		const containerWidth = containerDimensions.width;

		// Use transientScale if available, else settings.scale
		const currentScale =
			transientScale !== null
				? transientScale
				: Number(settings.scale || settings.watermark_scale || 10);

		const currentX =
			transientPercentages?.x !== undefined &&
			transientPercentages !== null
				? transientPercentages.x
				: Number(settings.x || settings.watermark_x || 0);
		const currentY =
			transientPercentages?.y !== undefined &&
			transientPercentages !== null
				? transientPercentages.y
				: Number(settings.y || settings.watermark_y || 0);

		const currentAlign =
			settings.align || settings.watermark_align || 'center';
		const currentValign =
			settings.valign || settings.watermark_valign || 'center';

		const style = {
			position: 'absolute',
			width: `${currentScale}%`,
			height: 'auto',
			zIndex: 100,
			transform: '',
		};

		if (currentAlign === 'center') {
			style.left = '50%';
			style.transform += 'translateX(-50%) ';
			style.marginLeft = `${-currentX}%`;
		} else {
			style[currentAlign] = `${currentX}%`;
		}

		if (currentValign === 'center') {
			style.top = '50%';
			style.transform += 'translateY(-50%) ';
			style.marginTop = `${-currentY}%`;
		} else {
			style[currentValign] = `${currentY}%`;
		}

		if (!style.transform) {
			delete style.transform;
		}

		const w = (containerWidth * currentScale) / 100;
		const ratio = watermarkImage
			? watermarkImage.width / watermarkImage.height
			: lastAspectRatioRef.current || 1;
		const h = w / ratio;

		return {
			wmStyle: style,
			wmWidth: w,
			wmHeight: h,
			aspectRatio: ratio,
		};
	}, [
		containerDimensions,
		watermarkImage,
		settings,
		transientScale,
		transientPercentages,
	]);

	useEffect(() => {
		stateRef.current = {
			transientPercentages,
			transientScale,
			isDragging,
			isResizing,
			settings,
			containerDimensions,
			watermarkImage,
			wmWidth,
			wmHeight,
			aspectRatio,
			baseDeltaX: Number(settings.x || settings.watermark_x || 0),
			baseDeltaY: Number(settings.y || settings.watermark_y || 0),
		};
	}, [
		transientPercentages,
		transientScale,
		isDragging,
		isResizing,
		settings,
		containerDimensions,
		watermarkImage,
		wmWidth,
		wmHeight,
		aspectRatio,
	]);

	const onChangeRef = useRef(onChange);
	useEffect(() => {
		onChangeRef.current = onChange;
	}, [onChange]);

	const handleMouseDown = (e) => {
		if (!isSelected) {
			return;
		}
		e.preventDefault();
		e.stopPropagation();

		if (watermarkRef.current) {
			watermarkRef.current.focus();
		}

		const initialX = Number(settings.x || settings.watermark_x || 0);
		const initialY = Number(settings.y || settings.watermark_y || 0);

		setIsDragging(true);
		setTransientPercentages({ x: initialX, y: initialY });
		dragStartRef.current = {
			x: e.clientX,
			y: e.clientY,
			initialX,
			initialY,
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
				: Number(settings.scale || settings.watermark_scale || 10);

		const initialX = Number(settings.x || settings.watermark_x || 0);
		const initialY = Number(settings.y || settings.watermark_y || 0);

		setTransientScale(currentScale);
		setTransientPercentages({ x: initialX, y: initialY });

		dragStartRef.current = {
			x: e.clientX,
			y: e.clientY,
			initialX,
			initialY,
			initialScale: currentScale,
			handle,
			aspectRatio: wmWidth / wmHeight,
		};
	};

	const finalizeInteraction = useCallback(() => {
		const s = stateRef.current;
		if (!s.isDragging && !s.isResizing) {
			return;
		}
		const wasResizing = s.isResizing;

		if (!s.containerDimensions || !s.transientPercentages) {
			setTransientPercentages(null);
			setTransientScale(null);
			setIsDragging(false);
			setIsResizing(false);
			return;
		}

		setIsDragging(false);
		setIsResizing(false);

		const finalX = s.transientPercentages.x;
		const finalY = s.transientPercentages.y;

		const finalScale =
			wasResizing && s.transientScale !== null
				? s.transientScale
				: Number(s.settings.scale || s.settings.watermark_scale || 10);

		const currentRatio = s.aspectRatio;
		const { width: containerWidth, height: containerHeight } =
			s.containerDimensions;

		// Preserve attributes based on what's being used (settings vs block-editor styles)
		const isBlock =
			Object.prototype.hasOwnProperty.call(
				s.settings,
				'watermark_scale'
			) || Object.prototype.hasOwnProperty.call(s.settings, 'watermark');

		const currentAlign =
			s.settings.align || s.settings.watermark_align || 'center';
		const currentValign =
			s.settings.valign || s.settings.watermark_valign || 'bottom';

		// 1. Calculate absolute top-left percentage (L, T)
		let L = finalX;
		if (currentAlign === 'right') {
			L = 100 - finalScale - finalX;
		} else if (currentAlign === 'center') {
			L = 50 - finalScale / 2 - finalX;
		}

		const vScale =
			(finalScale * (containerWidth / containerHeight)) / currentRatio;
		let T = finalY;
		if (currentValign === 'bottom') {
			T = 100 - vScale - finalY;
		} else if (currentValign === 'center') {
			T = 50 - vScale / 2 - finalY;
		}

		// 2. Decide best new anchors based on center of mass
		let newAlign = 'center';
		const centerX = L + finalScale / 2;
		if (centerX < 33) {
			newAlign = 'left';
		} else if (centerX > 66) {
			newAlign = 'right';
		}

		let newValign = 'center';
		const centerY = T + vScale / 2;
		if (centerY < 33) {
			newValign = 'top';
		} else if (centerY > 66) {
			newValign = 'bottom';
		}

		// 3. Calculate new offsets relative to these new anchors
		let newX = L;
		if (newAlign === 'right') {
			newX = 100 - finalScale - L;
		} else if (newAlign === 'center') {
			newX = 50 - finalScale / 2 - L;
		}

		let newY = T;
		if (newValign === 'bottom') {
			newY = 100 - vScale - T;
		} else if (newValign === 'center') {
			newY = 50 - vScale / 2 - T;
		}

		const newSettings = isBlock
			? {
					watermark_scale: Math.round(finalScale * 100) / 100,
					watermark_align: newAlign,
					watermark_valign: newValign,
					watermark_x: Math.round(newX * 100) / 100,
					watermark_y: Math.round(newY * 100) / 100,
				}
			: {
					scale: Math.round(finalScale * 100) / 100,
					align: newAlign,
					valign: newValign,
					x: Math.round(newX * 100) / 100,
					y: Math.round(newY * 100) / 100,
				};

		onChangeRef.current(newSettings);

		setTransientPercentages(null);
		setTransientScale(null);

		// Remove global listeners
		window.removeEventListener('mousemove', handleMouseMove);
	}, [handleMouseMove]);

	// Finalize interaction when selection is lost while dragging/resizing
	useEffect(() => {
		if (!isSelected && (isDragging || isResizing)) {
			finalizeInteraction();
		}
	}, [isSelected, isDragging, isResizing, finalizeInteraction]);

	// Finalize interaction on unmount if anything was pending
	useEffect(() => {
		return () => {
			const s = stateRef.current;
			if (s.isDragging || s.isResizing) {
				// We can't call finalizeInteraction here because of closure issues,
				// but the stateRef should have what we need.
				// However, finalizeInteraction is already memoized with its dependencies.
				// For now, the 'isSelected' effect above handles most cases.
			}
		};
	}, []);

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

		const { x: currentX, y: currentY } = {
			x: stateRef.current.baseDeltaX,
			y: stateRef.current.baseDeltaY,
		};

		let newX = currentX;
		let newY = currentY;
		const stepPx = e.shiftKey ? 10 : 1;
		const stepXPct = (stepPx / containerDimensions.width) * 100;
		const stepYPct = (stepPx / containerDimensions.height) * 100;

		const currentAlignment =
			settings.align || settings.watermark_align || 'center';
		const currentVerticalAlignment =
			settings.valign || settings.watermark_valign || 'center';

		switch (e.key) {
			case 'ArrowUp':
				newY +=
					currentVerticalAlignment === 'top' ? -stepYPct : stepYPct;
				break;
			case 'ArrowDown':
				newY +=
					currentVerticalAlignment === 'top' ? stepYPct : -stepYPct;
				break;
			case 'ArrowLeft':
				newX += currentAlignment === 'left' ? -stepXPct : stepXPct;
				break;
			case 'ArrowRight':
				newX += currentAlignment === 'left' ? stepXPct : -stepXPct;
				break;
		}

		setTransientPercentages({ x: newX, y: newY });
	};

	const handleResizeKeyDown = (e) => {
		if (
			!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)
		) {
			return;
		}
		e.preventDefault();
		e.stopPropagation();

		// Keyboard resizing is temporarily disabled during percentage refactor for stability
	};

	const handleMouseMove = useCallback((e) => {
		const s = stateRef.current;
		if (!s.isDragging && !s.isResizing) {
			return;
		}

		const dragStart = dragStartRef.current;
		const containerWidth = s.containerDimensions.width;
		const containerHeight = s.containerDimensions.height;

		const rect = containerRef.current.getBoundingClientRect();

		const scaleX = containerWidth / rect.width;
		const scaleY = containerHeight / rect.height;

		const dxCanvas = (e.clientX - dragStart.x) * scaleX;
		const dyCanvas = (e.clientY - dragStart.y) * scaleY;

		const dxPct = (dxCanvas / containerWidth) * 100;
		const dyPct = (dyCanvas / containerHeight) * 100;

		if (s.isDragging) {
			const currentAlignment =
				s.settings.align || s.settings.watermark_align || 'center';
			const currentVerticalAlignment =
				s.settings.valign || s.settings.watermark_valign || 'bottom';

			let newX = dragStart.initialX;
			let newY = dragStart.initialY;

			if (currentAlignment === 'left') {
				newX = dragStart.initialX + dxPct;
			} else {
				// right or center offsets increase as we move left (negative dx)
				newX = dragStart.initialX - dxPct;
			}

			if (currentVerticalAlignment === 'top') {
				newY = dragStart.initialY + dyPct;
			} else {
				// bottom or center offsets increase as we move up (negative dy)
				newY = dragStart.initialY - dyPct;
			}

			setTransientPercentages({ x: newX, y: newY });
		} else if (s.isResizing) {
			const {
				initialScale,
				aspectRatio: currentRatio,
				handle,
			} = dragStart;

			let newWidth;
			if (handle === 'se' || handle === 'ne') {
				newWidth = (containerWidth * initialScale) / 100 + dxCanvas;
			} else {
				newWidth = (containerWidth * initialScale) / 100 - dxCanvas;
			}

			let newScale = (newWidth / containerWidth) * 100;
			newScale = Math.round(newScale * 100) / 100;
			newScale = Math.max(1, Math.min(100, newScale));

			const currentAlignment =
				s.settings.align || s.settings.watermark_align || 'center';
			const currentVerticalAlignment =
				s.settings.valign || s.settings.watermark_valign || 'center';

			let newX = dragStart.initialX;
			let newY = dragStart.initialY;

			const scaleDiff = newScale - initialScale;
			const vScaleFactor =
				containerWidth / containerHeight / currentRatio;
			const vScaleDiff = scaleDiff * vScaleFactor;

			// Horizontal anchoring
			if (handle === 'se' || handle === 'ne') {
				// Dragging Right side -> NW or SW corner fixed
				if (currentAlignment === 'right') {
					newX = dragStart.initialX - scaleDiff;
				} else if (currentAlignment === 'center') {
					newX = dragStart.initialX - scaleDiff / 2;
				}
			} else if (currentAlignment === 'left') {
				newX = dragStart.initialX + scaleDiff;
			} else if (currentAlignment === 'center') {
				newX = dragStart.initialX + scaleDiff / 2;
			}

			// Vertical anchoring
			if (handle === 'se' || handle === 'sw') {
				// Dragging Bottom side -> NW or NE corner fixed
				if (currentVerticalAlignment === 'bottom') {
					newY = dragStart.initialY - vScaleDiff;
				} else if (currentVerticalAlignment === 'center') {
					newY = dragStart.initialY - vScaleDiff / 2;
				}
			} else if (currentVerticalAlignment === 'top') {
				newY = dragStart.initialY + vScaleDiff;
			} else if (currentVerticalAlignment === 'center') {
				newY = dragStart.initialY + vScaleDiff / 2;
			}

			setTransientScale(newScale);
			setTransientPercentages({ x: newX, y: newY });
		}
	}, []);

	useEffect(() => {
		// Clean logs and ensure no leaking listeners
		return () => {};
	}, []);

	if (!containerDimensions) {
		return children || null;
	}

	const containerWidth = containerDimensions.width;
	const containerHeight = containerDimensions.height;

	const showHandles = isSelected || isFocused;

	let watermarkCursor = 'default';
	if (isDragging) {
		watermarkCursor = 'grabbing';
	} else if (isSelected) {
		watermarkCursor = 'move';
	}

	return (
		<div
			ref={containerRef}
			className="videopack-watermark-positioner"
			style={{
				width: `${containerWidth}px`,
				height: `${containerHeight}px`,
				backgroundImage:
					showBackground && backgroundDataUrl
						? `url(${backgroundDataUrl})`
						: 'none',
				backgroundSize: 'contain',
				backgroundRepeat: 'no-repeat',
				backgroundPosition: 'center',
			}}
		>
			{(isDragging || isResizing) && (
				<div
					className="videopack-interaction-overlay"
					role="presentation"
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						zIndex: 999999,
						cursor: isDragging ? 'grabbing' : 'crosshair',
						pointerEvents: 'auto',
					}}
					onMouseMove={handleMouseMove}
					onMouseUp={finalizeInteraction}
				/>
			)}
			<div
				ref={watermarkRef}
				style={{
					...wmStyle,
					outline: showHandles ? '1px dashed #757575' : 'none',
					cursor: watermarkCursor,
				}}
				role="button"
				tabIndex={isSelected ? '0' : '-1'}
				aria-label={__(
					'Move watermark',
					'video-embed-thumbnail-generator'
				)}
				onMouseDown={handleMouseDown}
				onKeyDown={handleDragKeyDown}
				onFocus={handleFocus}
				onBlur={handleBlur}
			>
				{children ? (
					children
				) : (
					<img
						src={effectiveImageUrl}
						alt="Watermark"
						style={{
							width: '100%',
							height: '100%',
							userSelect: 'none',
							display: 'block',
						}}
						draggable={false}
					/>
				)}
				{showHandles && (
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
