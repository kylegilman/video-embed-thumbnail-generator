<?php
/**
 * Template for the Embed Video From URL page
 *
 * @package Videopack
 */

if ( ! defined( 'ABSPATH' ) ) {
	die( "Can't load this file directly" );
}

?>
<form class="media-upload-form type-form validate" id="kgvid-form" enctype="multipart/form-data" method="post" action="">

<div id="media-items">
<div class="media-item media-blank">
<table id="kgflashmediaplayer-table" class="describe videopack-settings">
<tbody>
			<tr>
				<th valign="top" scope="row" class="label"><span class="alignleft"><label for="videotitle"><?php esc_html_e( 'Video Title', 'video-embed-thumbnail-generator' ); ?></label></span></th>
				<td class="field"><input type="text" id="videotitle" name="videotitle" value="" size="50" />
				<p class="help"><small><?php esc_html_e( 'Add an optional header above the video.', 'video-embed-thumbnail-generator' ); ?></small></p></td>
			</tr>
			<tr>
				<th valign="top" scope="row" class="label"><label for="attachments-singleurl-kgflashmediaplayer-url"><?php esc_html_e( 'Video URL', 'video-embed-thumbnail-generator' ); ?></label></th>
				<td class="field"><input type="text" id="attachments-singleurl-kgflashmediaplayer-url" name="attachments[singleurl][kgflashmediaplayer-url]" value="" size="50" onchange="kgvid_set_singleurl();"/>
				<p class="help"><small><?php esc_html_e( 'Specify the URL of the video file.', 'video-embed-thumbnail-generator' ); ?></small></p></td>
			</tr>
			<?php if ( current_user_can( 'make_video_thumbnails' ) && $options['ffmpeg_exists'] === true ) { ?>
			<tr>
				<th valign="top" scope="row" class="label"><span class="alignleft"><label><?php esc_html_e( 'Thumbnails', 'video-embed-thumbnail-generator' ); ?></label></span></th>
				<td class="field">
					<input id="attachments-singleurl-kgflashmediaplayer-numberofthumbs" type="text" value="<?php echo esc_attr( $options['generate_thumbs'] ); ?>" maxlength="2" size="4" style="width:35px;text-align:center;" title="<?php esc_attr_e( 'Number of Thumbnails', 'video-embed-thumbnail-generator' ); ?>" onchange="document.getElementById('attachments-singleurl-kgflashmediaplayer-thumbtime').value='';" />
					<input type="button" id="attachments-singleurl-thumbgenerate" class="button" value="<?php esc_attr_e( 'Generate', 'video-embed-thumbnail-generator' ); ?>" name="thumbgenerate" onclick="kgvid_generate_thumb('singleurl', 'generate');" disabled title="<?php esc_attr_e( 'Please enter a valid video URL', 'video-embed-thumbnail-generator' ); ?>" />
					<input type="button" id="attachments-singleurl-thumbrandomize" class="button" value="<?php esc_attr_e( 'Randomize', 'video-embed-thumbnail-generator' ); ?>" name="thumbrandomize" onclick="kgvid_generate_thumb('singleurl', 'random');" disabled title="<?php esc_attr_e( 'Please enter a valid video URL', 'video-embed-thumbnail-generator' ); ?>" />
					<input type="checkbox" id="attachments-singleurl-firstframe" onchange="document.getElementById('attachments-singleurl-kgflashmediaplayer-thumbtime').value ='';" /><label for="attachments-singleurl-firstframe"><?php esc_html_e( 'Force 1st Frame Thumbnail', 'video-embed-thumbnail-generator' ); ?></label><br>
					<div id="attachments-singleurl-thumbnailplaceholder"></div>
					<span><?php esc_html_e( 'Thumbnail timecode:', 'video-embed-thumbnail-generator' ); ?></span> <input name="attachments[singleurl][kgflashmediaplayer-thumbtime]" id="attachments-singleurl-kgflashmediaplayer-thumbtime" type="text" value="" style="width:60px;"><br>
					<input type="checkbox" <?php echo checked( $options['featured'], true, false ); ?> id="attachments-singleurl-featured" name="attachments[singleurl][kgflashmediaplayer-featured]" /> <?php esc_html_e( 'Set thumbnail as featured image', 'video-embed-thumbnail-generator' ); ?>
				</td>
			</tr>
			<?php } ?>
			<tr>
				<th valign="top" scope="row" class="label"><span class="alignleft"><label for="attachments-singleurl_kgflashmediaplayer_poster"><?php esc_html_e( 'Thumbnail URL', 'video-embed-thumbnail-generator' ); ?></label></span></th>
				<td class="field"><input type="text" name="attachments[singleurl][kgflashmediaplayer-poster]" id="attachments-singleurl-kgflashmediaplayer-poster" value="" size="50" />
				<p class="help"><small><?php printf( esc_html__( 'Leave blank to use %sdefault thumbnail', 'video-embed-thumbnail-generator' ), '<a href="options-general.php?page=video_embed_thumbnail_generator_settings" target="_blank">' ); ?></a>.</small></p></td>
			</tr>
			<tr>
				<th valign="top" scope="row" class="label"><span class="alignleft"><label for="attachments-singleurl-kgflashmediaplayer-width"><?php esc_html_e( 'Dimensions', 'video-embed-thumbnail-generator' ); ?></label></span></th>
				<td class="field"><?php esc_html_e( 'Width:', 'video-embed-thumbnail-generator' ); ?> <input name="attachments[singleurl][kgflashmediaplayer-width]" type="text" value="<?php echo esc_attr( $maxwidth ); ?>" id="attachments-singleurl-kgflashmediaplayer-width" type="text" class="kgvid_50_width" onchange="kgvid_set_dimension('singleurl', 'height', this.value);" onkeyup="kgvid_set_dimension('singleurl', 'height', this.value);"> <?php esc_html_e( 'Height:', 'video-embed-thumbnail-generator' ); ?> <input name="attachments[singleurl][kgflashmediaplayer-height]" id="attachments-singleurl-kgflashmediaplayer-height" type="text" value="<?php echo esc_attr( $maxheight ); ?>" class="kgvid_50_width" onchange="kgvid_set_dimension('singleurl', 'width', this.value);" onkeyup="kgvid-set-dimension('singleurl', 'width', this.value);"> <input type="checkbox" name="attachments[singleurl][kgflashmediaplayer-lockaspect]" id="attachments-singleurl-kgflashmediaplayer-lockaspect" onclick="kgvid_set_aspect('singleurl', this.checked);" checked> <label id="singleurl-lockaspect-label" for="attachments-singleurl-kgflashmediaplayer-lockaspect"><small><?php esc_html_e( 'Lock to Aspect Ratio', 'video-embed-thumbnail-generator' ); ?></small></label>
				<p class="help"><small><?php printf( esc_html__( 'Leave blank to use %sdefault dimensions', 'video-embed-thumbnail-generator' ), '<a href="options-general.php?page=video_embed_thumbnail_generator_settings" target="_blank">' ); ?></a>.</small></p></td>
			</tr>
			<?php if ( current_user_can( 'encode_videos' ) ) { ?>
			<tr>
				<th valign="top" scope="row" class="label"><span class="alignleft"><label for="html5"><?php esc_html_e( 'Additional Formats', 'video-embed-thumbnail-generator' ); ?></span></label></th>
				<td><?php echo wp_kses( $checkboxes['checkboxes'], kgvid_allowed_html( 'admin' ) ); ?></td>
			</tr>
			<?php } ?>
			<tr>
				<th valign="top" scope="row" class="label"><span class="alignleft"><label><?php esc_html_e( 'Subtitles & Captions', 'video-embed-thumbnail-generator' ); ?></span></label></th>
				<td><div id="kgflashmediaplayer-singleurl-trackdiv" class="kgvid_thumbnail_box kgvid_track_box"><?php esc_html_e( 'Track type:', 'video-embed-thumbnail-generator' ); ?><select name="attachments[singleurl][kgflashmediaplayer-track][kind]" id="attachments-singleurl-kgflashmediaplayer-track_kind"><option value="subtitles"><?php esc_html_e( 'subtitles', 'video-embed-thumbnail-generator' ); ?></option><option value="captions"><?php esc_html_e( 'captions', 'video-embed-thumbnail-generator' ); ?></option><option value="chapters"><?php esc_html_e( 'chapters', 'video-embed-thumbnail-generator' ); ?></option></select><br /><?php esc_html_e( 'URL:', 'video-embed-thumbnail-generator' ); ?> <input name="attachments[singleurl][kgflashmediaplayer-track][src]" id="attachments-singleurl-kgflashmediaplayer-track_src" type="text" value="" class="text"><br /><?php esc_html_e( 'Language code:', 'video-embed-thumbnail-generator' ); ?> <input name="attachments[singleurl][kgflashmediaplayer-track][srclang]" id="attachments-singleurl-kgflashmediaplayer-track_srclang" type="text" value="" maxlength="2" style="width:40px;"><br /><?php esc_html_e( 'Label:', 'video-embed-thumbnail-generator' ); ?> <input name="attachments[singleurl][kgflashmediaplayer-track][label]" id="attachments-singleurl-kgflashmediaplayer-track_label" type="text" value="" class="text"><br /><?php esc_html_e( 'Default:', 'video-embed-thumbnail-generator' ); ?> <input name="attachments[singleurl][kgflashmediaplayer-track][default]" id="attachments-singleurl-kgflashmediaplayer-track_default" type="checkbox" value="default"></div></td>
			<tr>
				<th valign="top" scope="row" class="label"><span class="alignleft"><label>Options</span></label></th>
				<td><input type="checkbox" <?php echo checked( $options['downloadlink'], true, false ); ?> name="downloadlink" id="downloadlink" value="true" class="field" /><label for="downloadlink"><?php esc_html_e( 'Show download icon', 'video-embed-thumbnail-generator' ); ?><br /><small></em><?php esc_html_e( 'Makes it easier for users to download video file', 'video-embed-thumbnail-generator' ); ?></em></small></label></td>
			</tr>
			<tr class="submit">
				<td></td>
				<td>
					<input type="button" onclick="kgvid_insert_shortcode();" name="insertonlybutton" id="insertonlybutton" class="button" value="<?php esc_attr_e( 'Insert into Post', 'video-embed-thumbnail-generator' ); ?>" disabled title="<?php esc_attr_e( 'Please enter a valid video URL', 'video-embed-thumbnail-generator' ); ?>" />
				</td>
			</tr>
</tbody></table>
</div>
</div>

<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-security]' id='attachments-singleurl-kgflashmediaplayer-security' value='<?php echo esc_attr( wp_create_nonce( 'video-embed-thumbnail-generator-nonce' ) ); ?>' />
<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-maxwidth]' id='attachments-singleurl-kgflashmediaplayer-maxwidth' value='<?php echo esc_attr( $maxwidth ); ?>' />
<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-maxheight]' id='attachments-singleurl-kgflashmediaplayer-maxheight' value='<?php echo esc_attr( $maxheight ); ?>' />
<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-aspect]' id='attachments-singleurl-kgflashmediaplayer-aspect' value='<?php echo esc_attr( round( $maxheight / $maxwidth, 3 ) ); ?>' />
<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-titlecode]' id='attachments-singleurl-kgflashmediaplayer-titlecode' value='<?php echo esc_attr( $options['titlecode'] ); ?>' />
<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-ffmpegexists]' id='attachments-singleurl-kgflashmediaplayer-ffmpegexists' value='<?php echo esc_attr( $options['ffmpeg_exists'] ); ?>' />
</form>
