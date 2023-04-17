<?php
/**
 * Template for the settings page
 *
 * @package Videopack
 */

if ( ! defined( 'ABSPATH' ) ) {
	die( "Can't load this file directly" );
}

?>
<div class="wrap videopack-settings">
	<h1><?php esc_html_e( 'Videopack Settings', 'video-embed-thumbnail-generator' ); ?></h1>
	<h2 class="nav-tab-wrapper">
		<a href="#general" id="general_tab" class="nav-tab" onclick="kgvid_switch_settings_tab('general');"><?php echo esc_html_x( 'General', 'Adjective, tab title', 'video-embed-thumbnail-generator' ); ?></a>
		<?php
		if ( ! is_multisite()
			|| ( is_videopack_active_for_network()
				&& $options['ffmpeg_exists'] === true
				&& is_array( $network_options )
				&& ( is_super_admin()
					|| $network_options['superadmin_only_ffmpeg_settings'] == false
				)
			)
		) {
			?>
		<a href="#encoding" id="encoding_tab" class="nav-tab" onclick="kgvid_switch_settings_tab('encoding');"><?php printf( esc_html_x( '%s Settings', 'FFmpeg Settings, tab title', 'video-embed-thumbnail-generator' ), "<span class='video_app_name'>" . esc_html( strtoupper( $video_app ) ) . '</span>' ); ?></a>
		<?php } ?>
	</h2>
	<form method="post" action="options.php" id="kgvid_settings_form">
	<?php settings_fields( 'kgvid_video_embed_options' ); ?>
	<input type="hidden" id="kgvid_settings_security" value="<?php echo esc_attr( wp_create_nonce( 'video-embed-thumbnail-generator-nonce' ) ); ?>">
	<?php kgvid_do_settings_sections( 'video_embed_thumbnail_generator_settings' ); ?>
	<p class='submit'>
			<?php submit_button( esc_html__( 'Save Changes', 'video-embed-thumbnail-generator' ), 'primary', 'kgvid_submit', false, array( 'onclick' => "jQuery('form :disabled').prop('disabled', false);" ) ); ?>
			<?php submit_button( esc_html__( 'Reset Options', 'video-embed-thumbnail-generator' ), 'secondary', 'video-embed-thumbnail-generator-reset', false ); ?>
		</p>
	</form>
	<div class="kgvid-donate-box wp-core-ui wp-ui-highlight">
	<span><?php esc_html_e( 'If you\'re getting some use out of this plugin, please consider donating a few dollars to support its future development.', 'video-embed-thumbnail-generator' ); ?></span>
	<a href="https://www.videopack.video/donate/"><img alt="<?php esc_html__( 'Donate', 'video-embed-thumbnail-generator' ); ?>" src="https://www.paypal.com/en_US/i/btn/btn_donateCC_LG.gif"></a>
	</form>
	</div>
</div>
