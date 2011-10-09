// closure to avoid namespace collision

function tb_remove() {

    jQuery.post(kg_plugin_dir + '/kg_callffmpeg.php', { action: 'delete', uploads: kg_upload_dir } );
    jQuery("#TB_imageOff").unbind("click");
    jQuery("#TB_closeWindowButton").unbind("click");
    jQuery("#TB_window").fadeOut("fast",function(){jQuery('#TB_window,#TB_overlay,#TB_HideSelect').trigger("unload").unbind().remove();});
    jQuery("#TB_load").remove();
    if (typeof document.body.style.maxHeight == "undefined") {//if IE 6
        $("body","html").css({height: "auto", width: "auto"});
        $("html").css("overflow","");
    }
    document.onkeydown = "";
    document.onkeyup = "";
    jQuery('#thumbnailplaceholder').empty();
    jQuery('#html5placeholder').empty();
    jQuery('#kgflashmediaplayer-poster').val("");
    return false;

}


(function(){
	// creates the plugin
	tinymce.create('tinymce.plugins.kgvideoplayer', {
		// creates control instances based on the control's id.
		// our button's id is "kgvideoplayer_button"
		createControl : function(id, controlManager) {
			if (id == 'kgvideoplayer_button') {
				// creates the button
				var button = controlManager.createButton('kgvideoplayer_button', {
					title : 'Video Embed & Thumbnail Generator', // title of the button
					image : kg_plugin_dir+'/images/cameranoise_logo.png',  // path to the button's image
					onclick : function() {
						// triggers the thickbox
						var width = jQuery(window).width(), H = jQuery(window).height(), W = ( 720 < width ) ? 720 : width;
						W = W - 80;
						H = H - 84;
						tb_show( 'Video Embed & Thumbnail Generator', '#TB_inline?width=' + W + '&height=' + H + '&inlineId=kgflashmediaplayer-form' );
					}
				});
				return button;
			}
			return null;
		}
	});
	
	// registers the plugin. DON'T MISS THIS STEP!!!
	tinymce.PluginManager.add('kgvideoplayer', tinymce.plugins.kgvideoplayer);

	// executes this when the DOM is ready
	jQuery(function(){
		// creates a form to be displayed everytime the button is clicked
		// you should achieve this using AJAX instead of direct html code like this

		kg_aspect = (kg_height_option/kg_width_option);

		var form = jQuery('<div id="kgflashmediaplayer-form"><table id="kgflashmediaplayer-table" class="form-table">\
			<tr>\
				<th><label for="videotitle">Video Title</label></th>\
				<td><input type="text" id="videotitle" name="videotitle" value="" size="50" /><br />\
				<small>Add an optional header above the video.</small></td>\
			</tr>\
			<tr>\
				<th><label for="kgflashmediaplayer-url">Video URL</label></th>\
				<td><input type="text" id="kgflashmediaplayer-url" name="url" value="" size="50" onchange="document.getElementById(\'html5placeholder\').innerHTML = \'\';"/><br />\
				<small>Specify the URL of the video file you uploaded.</small></td>\
			</tr>\
			<tr><td colspan = "2"><div id="thumbnailplaceholder"></div></td></tr>\
			<tr>\
				<th><label for="numberofthumbs">Number of Thumbnails</label</th>\
				<td><input type="text" id="numberofthumbs" name="numberofthumbs" value="3" size="3" maxlength="2" /><input type="button" id="thumbgenerate" class="button-secondary" value="Generate" name="thumbgenerate" /><input type="button" id="thumbrandomize" class="button-secondary" value="Randomize" name="thumbrandomize" /><!--<input type="button" id="thumbdelete" class="button-secondary" value="Delete" name="thumbdelete" />--></td>\
			</tr>\
			<tr>\
				<th><label for="kgflashmediaplayer-poster">Poster URL</label></th>\
				<td><input type="text" name="poster" id="kgflashmediaplayer-poster" value="" size="50" /><br />\
				<small>Specify the URL of the poster image. Leave blank if you want to use the default.</small>\
			</tr>\
			<tr>\
				<th><label for="kgflashmediaplayer-width">Width</label></th>\
				<td><input type="text" name="width" id="kgflashmediaplayer-width" value="'+kg_width_option+'" size="4" maxlength="4" onchange="if (document.getElementById(\'lockaspect\').checked == true) { document.getElementById(\'kgflashmediaplayer-height\').value=Math.round(this.value*kg_aspect); }" /> <input type="checkbox" name="lockaspect" id="lockaspect" checked> <label for="lockaspect"><small>Lock Aspect Ratio</small></label><br />\
				<small>Specify the displayed width of the video.</small></td>\
			</tr>\
			<tr>\
				<th><label for="kgflashmediaplayer-height">Height</label></th>\
				<td><input type="text" name="height" id="kgflashmediaplayer-height" value="'+kg_height_option+'" onchange="if (document.getElementById(\'lockaspect\').checked == true) { document.getElementById(\'kgflashmediaplayer-width\').value=Math.round(this.value/kg_aspect); }" size="4" maxlength="4" /><br />\
				<small>Specify the displayed height of the video.</small></td>\
			</tr>\
			<tr>\
				<th><label for="downloadlink">Include Download Link</label></th>\
				<td><input type="checkbox" name="downloadlink" id="downloadlink" value="true" /><br /></td>\
			</tr>\
			<tr><td colspan = "2"><input type="button" id="html5" class="button-secondary" value="Generate HTML5 Videos" name="html5" /><div id="html5placeholder" style="display:inline-block;"></div></td></tr>\
		</table>\
		<p class="submit">\
			<input type="button" id="kgflashmediaplayer-submit" class="button-primary" value="Insert Flash Media Player" name="submit" />\
		</p>\
		</div>');

		var table = form.find('table');
		form.appendTo('body').hide();
		
		//handles the click event of the generate button
		form.find('#thumbgenerate').click(function(){
			jQuery('#thumbnailplaceholder').empty();
			jQuery('#thumbnailplaceholder').append('<strong>Loading...</strong>');
			jQuery.post(kg_plugin_dir + '/kg_callffmpeg.php', { movieurl: table.find('#kgflashmediaplayer-url').val(), numberofthumbs: table.find('#numberofthumbs').val(), action: 'generate', ffmpeg: kg_ffmpeg_path, uploads: kg_upload_dir }, function(data) { 
			jQuery('#thumbnailplaceholder').empty(); 
			jQuery('#thumbnailplaceholder').append(data.thumbnaildisplaycode);
			kg_aspect = data.movie_height/data.movie_width;
			if (parseInt(data.movie_width) < parseInt(kg_width_option) ) { jQuery('#kgflashmediaplayer-width').val(data.movie_width); } 
			else { jQuery('#kgflashmediaplayer-width').val(kg_width_option); }
			if (parseInt(data.movie_width) > parseInt(kg_width_option) ) { jQuery('#kgflashmediaplayer-height').val(Math.round(kg_aspect*kg_width_option)); } 
			else { jQuery('#kgflashmediaplayer-height').val(data.movie_height); }
			}, "json"); 
		});

		//handles the click event of the randomize button
		form.find('#thumbrandomize').click(function(){
			jQuery('#thumbnailplaceholder').empty();
			jQuery('#thumbnailplaceholder').append('<strong>Loading...</strong>');
			jQuery.post(kg_plugin_dir + '/kg_callffmpeg.php', { movieurl: table.find('#kgflashmediaplayer-url').val(), numberofthumbs: table.find('#numberofthumbs').val(), randomize: '1', action: 'generate', ffmpeg: kg_ffmpeg_path, uploads: kg_upload_dir }, function(data) { 
			jQuery('#thumbnailplaceholder').empty(); 
			jQuery('#thumbnailplaceholder').append(data.thumbnaildisplaycode);
			kg_aspect = data.movie_height/data.movie_width;
			if (parseInt(data.movie_width) < parseInt(kg_width_option) ) { jQuery('#kgflashmediaplayer-width').val(data.movie_width); } 
			else { jQuery('#kgflashmediaplayer-width').val(kg_width_option); }
			if (parseInt(data.movie_width) > parseInt(kg_width_option) ) { jQuery('#kgflashmediaplayer-height').val(Math.round(kg_aspect*kg_width_option)); } 
			else { jQuery('#kgflashmediaplayer-height').val(data.movie_height); }
			}, "json"); 
			//jQuery('#thumbnailplaceholder').load(kg_plugin_dir + '/kg_callffmpeg.php', { movieurl: table.find('#kgflashmediaplayer-url').val(), action: 'generate', poster: table.find('#kgflashmediaplayer-poster').val(), uploads: kg_upload_dir, ffmpeg: kg_ffmpeg_path, numberofthumbs: table.find('#numberofthumbs').val() } );
		});

		//handles the click event of the delete button
		form.find('#thumbdelete').click(function(){
			jQuery('#thumbnailplaceholder').empty();
			jQuery('#thumbnailplaceholder').append('<strong>Deleting...</strong>');
			jQuery('#thumbnailplaceholder').load(kg_plugin_dir + '/kg_callffmpeg.php', { movieurl: table.find('#kgflashmediaplayer-url').val(), action: 'delete', poster: table.find('#kgflashmediaplayer-poster').val(), uploads: kg_upload_dir } );
		});

		//handles the click event of the HTML5 button
		form.find('#html5').click(function(){
			jQuery('#html5placeholder').empty();
			jQuery('#html5placeholder').load(kg_plugin_dir + '/kg_callffmpeg.php', { movieurl: table.find('#kgflashmediaplayer-url').val(), action: 'encode', ffmpeg: kg_ffmpeg_path, uploads: kg_upload_dir } );
		});

		// handles the click event of the submit button
		form.find('#kgflashmediaplayer-submit').click(function(){
			//delete unused thumbnails
			jQuery.post(kg_plugin_dir + '/kg_callffmpeg.php', { movieurl: table.find('#kgflashmediaplayer-url').val(), action:'submit', poster:table.find('#kgflashmediaplayer-poster').val(), uploads: kg_upload_dir }, function(data) {
			//jQuery('#thumbnailplaceholder').append(data.thumbnaildisplaycode);
			jQuery('#thumbnailplaceholder').empty();
			}, "json" );

			// defines the options and their default values
			// again, this is not the most elegant way to do this
			// but well, this gets the job done nonetheless
			var options = { 
				'url'    : '',
				'poster'         : '',
				'width'       : '',
				'height'    : ''
				};

			var videotitle = '<p><strong>' + table.find('#videotitle').val() + '</strong></p>';
			var shortcode = '[FMP';
			
			for( var index in options) {
				var value = table.find('#kgflashmediaplayer-' + index).val();
				
				// attaches the attribute to the shortcode only if it's different from the default value
				if ( value !== options[index] )
				if ( index !== 'url' )
					shortcode += ' ' + index + '="' + value + '"';
			}
			
			shortcode += ']' + table.find('#kgflashmediaplayer-url').val();
			shortcode += '[/FMP]';
			if ( document.getElementById('downloadlink').checked == true )
			shortcode += '<p><a href="' + table.find('#kgflashmediaplayer-url').val() + '">Right-click this link to download</a></p>';
			
			// inserts the shortcode into the active editor
			if ( table.find('#videotitle').val() !== "") 
			tinyMCE.activeEditor.execCommand('mceInsertContent', 0, videotitle);

			tinyMCE.activeEditor.execCommand('mceInsertContent', 0, shortcode);
			
			// closes Thickbox
			tb_remove();
		});

	});
})()