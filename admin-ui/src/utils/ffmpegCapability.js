import { applyFilters } from '@wordpress/hooks';

/**
 * Checks whether the stored 'ffmpeg_exists' status indicates a detected
 * local FFmpeg binary. The value is a clean 3-value enum string
 * ('available' | 'unavailable' | 'unchecked') as normalized server-side
 * by Options::normalize_ffmpeg_status().
 *
 * @param {string} value ffmpeg_exists enum value.
 * @return {boolean} True if ffmpeg is available.
 */
export function isFfmpegAvailable( value ) {
	return value === 'available';
}

/**
 * Determines whether SOME transcoding-equivalent capability is ready:
 * local ffmpeg, or an add-on (Browser/Cloud Encoding) reporting its own
 * readiness via the `videopack.encoder.is_ready` JS filter (seeded by
 * the PHP-side `videopack_transcoding_service_ready` filter's result).
 * Mirrors Options::is_transcoding_capability_ready() on the PHP side.
 *
 * @param {Object}  settings                  Object with `ffmpeg_exists` and `active_encoder`.
 * @param {boolean} isTranscodingServiceReady Value of videopack_config.isTranscodingServiceReady.
 * @return {boolean} True if some transcoding-equivalent capability is ready.
 */
export function getEffectiveFfmpegExists(
	settings,
	isTranscodingServiceReady
) {
	const { ffmpeg_exists, active_encoder = 'ffmpeg' } = settings;
	const activeEncoderReady = applyFilters(
		'videopack.encoder.is_ready',
		!! isTranscodingServiceReady,
		active_encoder,
		settings
	);
	return (
		( active_encoder !== 'ffmpeg' && activeEncoderReady ) ||
		isFfmpegAvailable( ffmpeg_exists )
	);
}
