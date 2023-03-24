<?php
/**
 * Template for the network settings page
 *
 * @package Videopack
 */

if ( ! defined( 'ABSPATH' ) ) {
	die( "Can't load this file directly" );
}

?>
<div class="wrap videopack-settings">
	<h1>Videopack Network Settings</h1>
	<?php settings_errors( 'video_embed_thumbnail_generator_settings' ); ?>
	<form method="post" id="kgvid_settings_form">
	<input type="hidden" name="action" value="update_kgvid_network_settings" />
	<input type="hidden" name="kgvid_settings_security" id="kgvid_settings_security" value="<?php echo esc_attr( wp_create_nonce( 'video-embed-thumbnail-generator-nonce' ) ); ?>">
	<table class='form-table'>
		<tbody>
			<tr valign='middle'>
				<th scope='row'><label for='app_path'><?php esc_html_e( 'Path to applications on the server:', 'video-embed-thumbnail-generator' ); ?></label></th>
				<td><?php kgvid_app_path_callback(); ?></td>
			</tr>
				<th scope='row'><label for='video_app'><?php esc_html_e( 'Application for thumbnails & encoding:', 'video-embed-thumbnail-generator' ); ?></label></th>
				<td><?php kgvid_video_app_callback(); ?></td>
			</tr>
			<tr>
				<th scope='row'><label for='moov'><?php esc_html_e( 'Method to fix encoded H.264 headers for streaming:', 'video-embed-thumbnail-generator' ); ?></label></th>
				<td><?php kgvid_moov_callback(); ?></td>
			</tr>
			<tr>
				<th scope='row'><label for='video_bitrate_flag'><?php esc_html_e( 'FFmpeg legacy options:', 'video-embed-thumbnail-generator' ); ?></label></th>
				<td><?php kgvid_ffmpeg_options_callback(); ?></td>
			</tr>
			<tr>
				<th scope='row'><label for='video_app'><?php esc_html_e( 'Execution:', 'video-embed-thumbnail-generator' ); ?></label></th>
				<td><?php kgvid_execution_options_callback(); ?></td>
			</tr>
			<tr>
				<th scope='row'><label><?php esc_html_e( 'User capabilties for new sites:', 'video-embed-thumbnail-generator' ); ?></label></th>
				<td><?php kgvid_user_roles_callback( 'network' ); ?></td>
			</tr>
			<tr>
				<th scope='row'><label><?php esc_html_e( 'Super Admins only:', 'video-embed-thumbnail-generator' ); ?></label></th>
				<td><?php kgvid_superadmin_capabilities_callback(); ?></td>
			</tr>
		</tbody>
	</table>
	<p class='submit'>
			<?php submit_button( esc_html__( 'Save Changes', 'video-embed-thumbnail-generator' ), 'primary', 'kgvid_submit', false, array( 'onclick' => "jQuery('form :disabled').prop('disabled', false);" ) ); ?>
			<?php submit_button( esc_html__( 'Reset Options', 'video-embed-thumbnail-generator' ), 'secondary', 'video-embed-thumbnail-generator-reset', false ); ?>
		</p>
		</form>
		<div class="kgvid-donate-box wp-core-ui wp-ui-highlight">
	<span><?php esc_html_e( 'If you\'re getting some use out of this plugin, please consider donating a few dollars to support its future development.', 'video-embed-thumbnail-generator' ); ?></span>
	<a href="https://www.videopack.video/donate/"><img alt="<?php esc_html__( 'Donate', 'video-embed-thumbnail-generator' ); ?>" src="https://www.paypal.com/en_US/i/btn/btn_donateCC_LG.gif"></a>
	</div>
</div>
