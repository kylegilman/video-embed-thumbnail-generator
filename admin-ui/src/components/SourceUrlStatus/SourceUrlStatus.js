/**
 * Component showing a control to re-check a source's own master-URL
 * reachability, when a stale cached "no" answer might be why a page
 * visitor sees no player at all.
 *
 * Deliberately separate from AdditionalFormats (which is about encoded
 * alternate formats, a different concern) rather than folding this in --
 * kept as its own small, focused component so AdditionalFormats doesn't
 * grow responsibilities it isn't about.
 */

import { __ } from '@wordpress/i18n';
import { Button, Notice } from '@wordpress/components';
import { useState, useEffect, useCallback } from '@wordpress/element';

import {
	getAttachmentSourceStatus,
	clearAttachmentUrlCache,
} from '../../api/media';

/**
 * SourceUrlStatus component.
 *
 * @param {Object}        props              Component props.
 * @param {number|string} props.attachmentId ID of the attachment (0 for a
 *                                           URL-only source with no
 *                                           backing attachment).
 * @param {string}        props.src          The source URL.
 * @return {Element|null} The rendered component, or null when there's
 *                        nothing cached to refresh.
 */
const SourceUrlStatus = ( { attachmentId, src } ) => {
	const [ isCached, setIsCached ] = useState( false );
	const [ isRefreshing, setIsRefreshing ] = useState( false );
	const [ error, setError ] = useState( null );

	const activeId = attachmentId || 0;

	const fetchStatus = useCallback( async () => {
		if ( ! src ) {
			// Nothing to check anymore -- e.g. the source this was showing
			// a stale answer for got its attributes reset (deleted
			// attachment, etc). Don't leave a stale "cached" notice (and
			// its now-stale-props button) showing.
			setIsCached( false );
			return;
		}
		try {
			const status = await getAttachmentSourceStatus( activeId, src );
			setIsCached( !! status?.url_check_cached );
		} catch ( fetchError ) {
			// A failed status check isn't worth surfacing to the user --
			// the control just stays hidden, same as "nothing cached".
			console.error( fetchError );
		}
	}, [ activeId, src ] );

	useEffect( () => {
		fetchStatus();
	}, [ fetchStatus ] );

	const handleRefresh = async () => {
		if ( ! src ) {
			return;
		}
		setIsRefreshing( true );
		setError( null );
		try {
			await clearAttachmentUrlCache( activeId, src );
			await fetchStatus();
		} catch ( refreshError ) {
			console.error( refreshError );
			setError(
				refreshError?.message ||
					__(
						'Could not refresh the source URL check.',
						'video-embed-thumbnail-generator'
					)
			);
		} finally {
			setIsRefreshing( false );
		}
	};

	if ( ! isCached && ! error ) {
		return null;
	}

	return (
		<Notice
			status={ error ? 'error' : 'warning' }
			isDismissible={ false }
			className="videopack-source-url-status"
		>
			<p>
				{ error ||
					__(
						"Videopack has a cached answer for whether this video's source URL is reachable. If the video isn't playing and you've since fixed the remote host, re-check it now instead of waiting up to a day for the cache to expire.",
						'video-embed-thumbnail-generator'
					) }
			</p>
			<Button
				variant="secondary"
				size="small"
				onClick={ handleRefresh }
				isBusy={ isRefreshing }
				disabled={ isRefreshing }
				text={ __(
					'Re-check source URL',
					'video-embed-thumbnail-generator'
				) }
			/>
		</Notice>
	);
};

export default SourceUrlStatus;
