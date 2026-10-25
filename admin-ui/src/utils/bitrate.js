/**
 * Calculates the ABR bitrate (kbps) the server will use for a video size.
 *
 * Mirrors Video_Codec::get_bitrate() in PHP. The tuning values (coefficient,
 * exponent, minimum, high frame rate factor) come from the codec's
 * rate_control.vbr settings sent by the server, so the numbers shown in the
 * settings screen are calculated from the same parameters the encoder uses.
 *
 * @param {Object} vbrSettings                 The codec's rate_control.vbr settings.
 * @param {number} vbrSettings.coefficient     Baseline kbps multiplier.
 * @param {number} vbrSettings.exponent        Power the pixel count is raised to.
 * @param {number} vbrSettings.min_bitrate     Lowest bitrate ever returned.
 * @param {number} vbrSettings.high_fps        Frame rate at and above which the bitrate is scaled up.
 * @param {number} vbrSettings.high_fps_factor Multiplier for high frame rate sources.
 * @param {number} width                       Video width in pixels.
 * @param {number} height                      Video height in pixels.
 * @param {number} quality                     The quality multiplier (1 is the default quality).
 * @param {number} frameRate                   Optional source frame rate. Unknown (0) counts as normal.
 * @return {number} The bitrate in kbps, rounded.
 */
export function calculateBitrate(
	vbrSettings,
	width,
	height,
	quality,
	frameRate = 0
) {
	const frameFactor =
		frameRate >= vbrSettings.high_fps ? vbrSettings.high_fps_factor : 1;

	return Math.max(
		vbrSettings.min_bitrate,
		Math.round(
			vbrSettings.coefficient *
				Math.pow( width * height, vbrSettings.exponent ) *
				frameFactor *
				quality
		)
	);
}
