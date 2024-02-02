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
<div class="wrap">
	<h1>
	<?php
	esc_html_e( 'Videopack Encoding Queue', 'video-embed-thumbnail-generator' );
		echo wp_kses_post( $queue_control_html );
	?>
	</h1>
	<form method="post" action="tools.php?page=kgvid_video_encoding_queue">
	<?php wp_nonce_field( 'video-embed-thumbnail-generator-nonce', 'video-embed-thumbnail-generator-nonce' ); ?>
	<table class="widefat" id="kgvid_encode_queue_table">
		<thead>
			<?php echo wp_kses_post( kgvid_generate_queue_table_header() ); ?>
		</thead>
		<tfoot>
			<?php echo wp_kses_post( kgvid_generate_queue_table_header() ); ?>
		</tfoot>
		<tbody class="rows">
			<?php echo wp_kses( kgvid_generate_queue_table(), kgvid_allowed_html( 'admin' ) ); ?>
		</tbody>
	</table>
	<p>
		<?php
		if ( current_user_can( 'edit_others_video_encodes' ) ) {
			echo "<div class='attachment-info'><div class='actions'><button type='button' class='kgvid-queue-action' onclick='kgvid_encode_queue(\"clear_completed\", 0, 0);'>" . esc_html__( 'Clear All Completed', 'video-embed-thumbnail-generator' ) . "</button> | <button type='button' class='kgvid-queue-action' onclick='kgvid_encode_queue(\"clear_queued\", 0, 0, \"\");'>" . esc_html__( 'Clear All Queued', 'video-embed-thumbnail-generator' ) . "</button> | <button type='button' class='kgvid-queue-action' onclick='kgvid_encode_queue(\"clear_all\", 0, 0, \"\");'>" . esc_html__( 'Clear All', 'video-embed-thumbnail-generator' ) . "</button> <span class='kgvid_queue_clear_info'>" . esc_html__( 'Completed videos are cleared weekly, or daily if there are more than 50 entries in the queue.' ) . '</div></div>';
		}

		?>
	</p>
	</form>
</div>
