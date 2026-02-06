import { useState, useCallback, useRef, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const useBatchProcess = () => {
	const [isProcessing, setIsProcessing] = useState(false);
	const [progress, setProgress] = useState({
		current: 0,
		total: 0,
	});
	const [confirmDialog, setConfirmDialog] = useState({
		isOpen: false,
		message: '',
		onConfirm: null,
		isAlert: false,
	});

	const intervalRef = useRef(null);

	// Cleanup interval on unmount
	useEffect(() => {
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, []);

	const closeConfirmDialog = useCallback(() => {
		setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
	}, []);

	const showAlert = useCallback((message) => {
		setConfirmDialog({
			isOpen: true,
			message,
			onConfirm: null,
			isAlert: true,
		});
	}, []);

	const runPolling = useCallback(
		async (startFn, progressFn, noItemsMessage) => {
			setIsProcessing(true);
			setProgress({ current: 0, total: 0 });

			try {
				const response = await startFn();
				const total = response.total;

				if (total === 0) {
					setIsProcessing(false);
					showAlert(noItemsMessage);
					return;
				}

				setProgress({ current: 0, total });

				intervalRef.current = setInterval(async () => {
					try {
						const progressData = await progressFn();
						const pending =
							progressData.pending + progressData['in-progress'];
						const completed =
							progressData.complete + progressData.failed;
						const currentTotal = pending + completed;

						setProgress({
							current: completed,
							total: currentTotal > 0 ? currentTotal : total,
						});

						if (pending === 0) {
							clearInterval(intervalRef.current);
							setIsProcessing(false);
						}
					} catch (e) {
						console.error(e);
						clearInterval(intervalRef.current);
						setIsProcessing(false);
					}
				}, 2000);
			} catch (error) {
				console.error(error);
				showAlert(
					__(
						'An error occurred while processing.',
						'video-embed-thumbnail-generator'
					)
				);
				setIsProcessing(false);
			}
		},
		[showAlert]
	);

	const confirmAndRun = useCallback(
		(
			confirmMessage,
			startFn,
			progressFn,
			noItemsMessage = __(
				'No items found to process.',
				'video-embed-thumbnail-generator'
			)
		) => {
			setConfirmDialog({
				isOpen: true,
				message: confirmMessage,
				onConfirm: () =>
					runPolling(startFn, progressFn, noItemsMessage),
				isAlert: false,
			});
		},
		[runPolling]
	);

	return {
		isProcessing,
		setIsProcessing,
		progress,
		setProgress,
		confirmDialog,
		setConfirmDialog,
		closeConfirmDialog,
		runPolling,
		confirmAndRun,
		showAlert,
	};
};

export default useBatchProcess;
