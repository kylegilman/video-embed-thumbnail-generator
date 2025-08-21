/* global Image */

import { useRef, useState, useEffect } from '@wordpress/element';

const InteractiveImageOverlay = (overlaySettings, setSettings) => {
	const canvasRef = useRef(null);
	const [overlayPosition, setOverlayPosition] = useState({
		x: overlaySettings.x,
		y: overlaySettings.y,
	});
	const [overlaySize, setOverlaySize] = useState(overlaySettings.scale);
	const [baseImage, setBaseImage] = useState(null);
	const [overlayImage, setOverlayImage] = useState(null);
	const [dragging, setDragging] = useState(false);
	const [resizing, setResizing] = useState(false);
	const [activeHandle, setActiveHandle] = useState(null);
	const handleSize = 8;

	useEffect(() => {
		const image = new Image();
		image.onload = () => {
			setBaseImage(image);
		};
		image.src = overlaySettings.url;
	}, []);

	useEffect(() => {
		const image = new Image();
		image.onload = () => {
			setOverlayImage(image);
		};
		image.src = overlaySettings.url;
	}, [overlaySettings.url]);

	// Helper function to draw resize handles on the overlay image
	const drawResizeHandles = (ctx) => {
		const { x, y, width, height } = overlayPosition;

		// Define the positions of the handles (top-left, top-right, bottom-left, bottom-right)
		const handlePositions = [
			{
				x: x - handleSize / 2,
				y: y - handleSize / 2,
				cursor: 'nw-resize',
			},
			{
				x: x + width - handleSize / 2,
				y: y - handleSize / 2,
				cursor: 'ne-resize',
			},
			{
				x: x - handleSize / 2,
				y: y + height - handleSize / 2,
				cursor: 'sw-resize',
			},
			{
				x: x + width - handleSize / 2,
				y: y + height - handleSize / 2,
				cursor: 'se-resize',
			},
		];

		// Draw the handles
		ctx.fillStyle = 'white';
		ctx.strokeStyle = 'black';
		handlePositions.forEach((handle) => {
			ctx.beginPath();
			ctx.rect(handle.x, handle.y, handleSize, handleSize);
			ctx.fill();
			ctx.stroke();
		});
	};

	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');
		if (baseImage && overlayImage) {
			const baseWidth = canvas.width;
			const baseHeight = canvas.height;
			const overlayX = baseWidth * overlayPosition.x; // Convert to pixels
			const overlayY = baseHeight * overlayPosition.y; // Convert to pixels
			const overlayHeight = baseHeight * (overlayWidth / aspectRatio); // Calculate height using aspect ratio

			ctx.clearRect(0, 0, baseWidth, baseHeight);
			ctx.drawImage(baseImage, 0, 0, baseWidth, baseHeight);
			ctx.drawImage(
				overlayImage,
				overlayX,
				overlayY,
				baseWidth * overlayWidth,
				overlayHeight
			);
			drawResizeHandles(ctx, {
				x: overlayX,
				y: overlayY,
				width: overlayWidth,
				height: overlayHeight,
			});
		}
	}, [baseImage, overlayImage, overlayPosition, overlaySize]);

	const handleMouseDown = (e) => {
		const rect = canvasRef.current.getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;
		const { x, y, width, height } = overlayPosition;

		// Determine if a resize handle is being clicked
		if (
			mouseX >= x - handleSize / 2 &&
			mouseX <= x + handleSize / 2 &&
			mouseY >= y - handleSize / 2 &&
			mouseY <= y + handleSize / 2
		) {
			// Top-left handle
			setActiveHandle('top-left');
			setResizing(true);
		} else if (
			mouseX >= x + width - handleSize / 2 &&
			mouseX <= x + width + handleSize / 2 &&
			mouseY >= y - handleSize / 2 &&
			mouseY <= y + handleSize / 2
		) {
			// Top-right handle
			setActiveHandle('top-right');
			setResizing(true);
		} else if (
			mouseX >= x - handleSize / 2 &&
			mouseX <= x + handleSize / 2 &&
			mouseY >= y + height - handleSize / 2 &&
			mouseY <= y + height + handleSize / 2
		) {
			// Bottom-left handle
			setActiveHandle('bottom-left');
			setResizing(true);
		} else if (
			mouseX >= x + width - handleSize / 2 &&
			mouseX <= x + width + handleSize / 2 &&
			mouseY >= y + height - handleSize / 2 &&
			mouseY <= y + height + handleSize / 2
		) {
			// Bottom-right handle
			setActiveHandle('bottom-right');
			setResizing(true);
		} else {
			// Clicked outside of handles, start dragging
			setDragging(true);
		}
	};

	const handleMouseUp = (e) => {
		setDragging(false);
		setResizing(false);
	};

	const handleMouseMove = (e) => {
		const rect = canvasRef.current.getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;
		const baseWidth = canvasRef.current.width;
		const baseHeight = canvasRef.current.height;

		// Calculate the aspect ratio of the overlay image
		const aspectRatio = overlayImage.width / overlayImage.height;

		if (dragging) {
			// Update overlay position as a fraction of the base image size
			setOverlayPosition({
				x: mouseX / baseWidth,
				y: mouseY / baseHeight,
			});
		} else if (resizing) {
			const { x, y } = overlayPosition;
			let newWidth;
			switch (activeHandle) {
				case 'top-left':
					newWidth = (x * baseWidth - mouseX) / baseWidth;
					newHeight = newWidth / aspectRatio;
					setOverlayPosition({
						x: mouseX / baseWidth,
						y:
							(y * baseHeight - newHeight * baseHeight) /
							baseHeight,
					});
					setOverlaySize(newWidth);
					break;
				case 'top-right':
					newWidth = (mouseX - x * baseWidth) / baseWidth;
					newHeight = newWidth / aspectRatio;
					setOverlayPosition({
						x,
						y:
							(y * baseHeight - newHeight * baseHeight) /
							baseHeight,
					});
					setOverlaySize(newWidth);
					break;
				case 'bottom-left':
					newWidth = (x * baseWidth - mouseX) / baseWidth;
					setOverlayPosition({ x: mouseX / baseWidth, y });
					setOverlaySize(newWidth);
					break;
				case 'bottom-right':
					newWidth = (mouseX - x * baseWidth) / baseWidth;
					setOverlaySize(newWidth);
					break;
				default:
					break;
			}
		}
	};

	return (
		<div>
			<canvas
				ref={canvasRef}
				width={640}
				height={480}
				onMouseDown={handleMouseDown}
				onMouseUp={handleMouseUp}
				onMouseMove={handleMouseMove}
			/>
		</div>
	);
};

export default InteractiveImageOverlay;
