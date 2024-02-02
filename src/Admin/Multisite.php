<?php

namespace Videopack\Admin;

use Videopack\Common\Validate;

class Multisite {

	protected $default_network_options;
	protected $options_manager;
	protected $default_options;

	public function __construct( $options_manager ) {
		$this->options_manager         = $options_manager;
		$this->default_options         = $options_manager->get_default();
		$this->default_network_options = $this->get_default();
	}

	public function get_default() {

		$default_network_options = array(
			'app_path'                        => $this->default_options['app_path'],
			'ffmpeg_exists'                   => $this->default_options['ffmpeg_exists'],
			'moov'                            => $this->default_options['moov'],
			'nostdin'                         => $this->default_options['nostdin'],
			'simultaneous_encodes'            => $this->default_options['simultaneous_encodes'],
			'threads'                         => $this->default_options['threads'],
			'nice'                            => $this->default_options['nice'],
			'default_capabilities'            => $this->default_options['capabilities'],
			'superadmin_only_ffmpeg_settings' => false,
			'network_error_email'             => $this->default_options['error_email'],
			'queue_control'                   => $this->default_options['queue_control'],
		);

		return $default_network_options;
	}

	public function init() {

		$network_options = get_site_option( 'kgvid_video_embed_network_options' );

		if ( ! is_array( $network_options ) ) { // if the network options haven't been set yet

			switch_to_blog( 1 );
			$options = get_option( 'kgvid_video_embed_options' );

			if ( is_array( $options ) ) {
				$network_options                         = array_intersect_key( $this->default_network_options, $options ); // copy options from main blog to network
				$network_options['default_capabilities'] = $options['capabilities'];
				if ( ! array_key_exists( 'simultaneous_encodes', $network_options ) ) {
					$network_options['simultaneous_encodes'] = 1;
				}
			}
			restore_current_blog();

			if ( ! isset( $network_options['ffmpeg_exists'] )
				|| $network_options['ffmpeg_exists'] === 'notchecked'
			) {
				$ffmpeg_info = $this->options_manager->check_ffmpeg_exists( $network_options, false );
				if ( $ffmpeg_info['ffmpeg_exists'] === true ) {
					$network_options['ffmpeg_exists'] = true;
				}
				$network_options['app_path'] = $ffmpeg_info['app_path'];
			}
			update_site_option( 'kgvid_video_embed_network_options', $network_options );
			//end setting initial network options
		} else { // network options introduced in version 4.3 exist already

			$network_options_old = $network_options;

			if ( ! array_key_exists( 'superadmin_only_ffmpeg_settings', $network_options ) ) {
				$network_options['superadmin_only_ffmpeg_settings'] = $this->default_network_options['superadmin_only_ffmpeg_settings'];
			}

			if ( ! array_key_exists( 'network_error_email', $network_options ) ) {
				$network_options['network_error_email'] = 'nobody';
			}

			if ( $network_options_old != $network_options ) {
				update_site_option( 'kgvid_video_embed_network_options', $network_options );
			}
		}

		$local_options = get_option( 'kgvid_video_embed_options' );

		if ( empty( $local_options ) ) {

			$options = $this->options_manager->get_default();
			$updated = update_option( 'kgvid_video_embed_options', $options );
			$this->options_manager->set_capabilities( $network_options['default_capabilities'] );

		}
	}

	public function is_videopack_active_for_network() {

		if ( ! is_multisite() ) {
			return false;
		}

		$plugins = get_site_option( 'active_sitewide_plugins' );
		if ( isset( $plugins[ VIDEOPACK_BASENAME ] ) ) {
			return true;
		}

		return false;
	}

	public function add_new_blog( $blog_id ) {

		switch_to_blog( $blog_id );

		$network_options = get_site_option( 'kgvid_video_embed_network_options' );
		$this->options_manager->set_capabilities( $network_options['default_capabilities'] );

		restore_current_blog();
	}

	public function network_admin_action_links( $links ) {

		$links[] = '<a href="' . network_admin_url() . 'settings.php?page=video_embed_thumbnail_generator_settings">' . esc_html__( 'Network Settings', 'video-embed-thumbnail-generator' ) . '</a>';
		return $links;
	}

	public function add_network_settings_page() {
		add_submenu_page(
			'settings.php',
			esc_html_x( 'Videopack', 'Settings page title', 'video-embed-thumbnail-generator' ),
			esc_html_x( 'Videopack', 'Settings page title in admin sidebar', 'video-embed-thumbnail-generator' ),
			'manage_network_options',
			'video_embed_thumbnail_generator_settings',
			'kgvid_network_settings_page'
		);
	}

	public function add_network_queue_page() {
		if ( $this->is_videopack_active_for_network() ) {
			add_submenu_page(
				'settings.php',
				esc_html_x( 'Videopack Encoding Queue', 'Tools page title', 'video-embed-thumbnail-generator' ),
				esc_html_x( 'Network Video Encode Queue', 'Title in network admin sidebar', 'video-embed-thumbnail-generator' ),
				'manage_network',
				'kgvid_network_video_encoding_queue',
				'kgvid_ffmpeg_queue_page'
			);
		}
	}

	public function validate_settings( $input ) {

		$options = get_site_option( 'kgvid_video_embed_network_options' );
		$input   = Validate::text_field( $input ); // recursively sanitizes all the settings

		if ( $input['app_path'] != $options['app_path'] ) {
			$input = $this->options_manager->validate_ffmpeg_settings( $input );
		} else {
			$input['ffmpeg_exists'] = $options['ffmpeg_exists'];
		}

		// load all settings and make sure they get a value of false if they weren't entered into the form
		foreach ( $this->default_network_options as $key => $value ) {
			if ( ! array_key_exists( $key, $input ) ) {
				$input[ $key ] = false;
			}
		}

		if ( ! $input['queue_control'] ) { // don't reset queue control when saving settings
			$input['queue_control'] = $options['queue_control'];
		}

		return $input;
	}

	public function settings_page() {

		if ( isset( $_POST['kgvid_settings_security'] )
			&& isset( $_POST['action'] )
		) {
			$nonce = Validate::text_field( wp_unslash( $_POST['kgvid_settings_security'] ) );
			if ( ! isset( $nonce )
				|| ! wp_verify_nonce( $nonce, 'video-embed-thumbnail-generator-nonce' )
			) {
				die;
			}

			if ( isset( $_POST['action'] ) ) {
				$action = Validate::text_field( wp_unslash( $_POST['action'] ) );
			} else {
				$action = false;
			}
			if ( isset( $_POST['video-embed-thumbnail-generator-reset'] ) ) {
				$reset = true;
			} else {
				$reset = false;
			}

			if ( $action === 'update_kgvid_network_settings'
				&& current_user_can( 'manage_network_options' )
			) {

				if ( $reset ) {
					// reset button pressed
					$options_updated = update_site_option( 'kgvid_video_embed_network_options', $this->default_network_options );
					add_settings_error( 'video_embed_thumbnail_generator_settings', 'options-reset', esc_html__( 'Videopack network settings reset to default values.', 'video-embed-thumbnail-generator' ), 'updated' );
				} else { // save button pressed
					if ( isset( $_POST['kgvid_video_embed_options'] ) ) {
						$input = Validate::text_field( wp_unslash( $_POST['kgvid_video_embed_options'] ) );
					}
					$validated_options = $this->validate_settings( $input );
					$options_updated   = update_site_option( 'kgvid_video_embed_network_options', $validated_options );
					add_settings_error( 'video_embed_thumbnail_generator_settings', 'options-saved', esc_html__( 'Videopack network settings saved.', 'video-embed-thumbnail-generator' ), 'updated' );
				}
			}
		}

		include __DIR__ . '/partials/network-settings-page.php';
	}

	public function kgvid_superadmin_capabilities_callback() {

		$network_options = get_site_option( 'kgvid_video_embed_network_options' );
		/* translators: %s is the name of the video encoding application (usually FFmpeg). */
		echo '<input ' . checked( $network_options['superadmin_only_ffmpeg_settings'], true, false ) . " id='superadmin_only_ffmpeg_settings' name='kgvid_video_embed_options[superadmin_only_ffmpeg_settings]' type='checkbox' /> <label for='superadmin_only_ffmpeg_settings'>" . esc_html__( 'Can access FFmpeg settings tab.', 'video-embed-thumbnail-generator' ) . '</label>';
		/* translators: %s is the name of the video encoding application (usually FFmpeg). */
		echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'Only Super admins will be allowed to view and modify FFmpeg settings.', 'video-embed-thumbnail-generator' ) ) );
		echo "\n\t";

		echo "<div class='kgvid_video_app_required'>";
		echo esc_html__( 'Email all encoding errors on the network to:', 'video-embed-thumbnail-generator' ) . " <select id='network_error_email' name='kgvid_video_embed_options[network_error_email]'>";
		$network_super_admins = get_super_admins();
		if ( $network_super_admins ) {
			$authorized_users = array();
			foreach ( $network_super_admins as $network_super_admin ) {
				$user                                     = get_user_by( 'login', $network_super_admin );
				$authorized_users[ $network_super_admin ] = $user->ID;
			}
		}
		$items = array_merge(
			array(
				__( 'Nobody', 'video-embed-thumbnail-generator' ) => 'nobody',
				__( 'User who initiated encoding', 'video-embed-thumbnail-generator' ) => 'encoder',
			),
			$authorized_users
		);
		foreach ( $items as $name => $value ) {
			$selected = ( $network_options['network_error_email'] === $value ) ? 'selected="selected"' : '';
			echo "<option value='" . esc_attr( $value ) . "' " . esc_attr( $selected ) . '>' . esc_html( $name ) . '</option>';
		}
		echo '</select>';
		echo wp_kses_post( kgvid_tooltip_html( esc_html__( "Can also be set on individual sites if the FFmpeg settings tab isn't disabled.", 'video-embed-thumbnail-generator' ) ) );
		echo "</div>\n\t";
	}
}
