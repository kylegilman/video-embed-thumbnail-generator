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
		<?php
		foreach ( $settings_tabs as $tab_id => $tab_title ) {
			echo '<a href="#' . esc_attr( str_replace( 'videopack_', '', $tab_id ) ) . '" id="' . esc_attr( $tab_id ) . '_tab" class="nav-tab" data-tab_id="' . esc_attr( $tab_id ) . '" onclick="kgvid_switch_settings_tab(this.id)">' . esc_html( $tab_title ) . '</a>';
		}
		?>
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
