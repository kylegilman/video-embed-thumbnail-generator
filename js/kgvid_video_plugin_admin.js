function kgvid_disable_thumb_buttons(postID, event) {

	if ( jQuery('.compat-item').length > 0 ) { //only do this in the new media modal, not attachment page in media library
		if (event == "onblur") {
			document.getElementById('attachments-'+postID+'-thumbgenerate').disabled = false;
			document.getElementById('attachments-'+postID+'-thumbrandomize').disabled = false;
		}
		else {
			document.getElementById('attachments-'+postID+'-thumbgenerate').disabled = true;
			document.getElementById('attachments-'+postID+'-thumbrandomize').disabled = true;
		}
		
		if (event == "onchange") {
			document.getElementById('attachments-'+postID+'-thumbgenerate').value = "Wait";
			document.getElementById('attachments-'+postID+'-thumbrandomize').value = "Wait";
		}
	}
}

function kgvid_set_dimension(postID, valuetochange, currentvalue) {
	var kgvid_aspect = (document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-aspect]')[0].value);
	var changeaspect = kgvid_aspect;
	if (valuetochange == "width") { changeaspect = 1/kgvid_aspect; }
	var changedvalue = Math.round(currentvalue*changeaspect);
	if (document.getElementById('attachments-'+postID+'-kgflashmediaplayer-lockaspect').checked == true && changedvalue != 0) { 
		document.getElementById('attachments-'+postID+'-kgflashmediaplayer-'+valuetochange).value = changedvalue; 
	}
}

function kgvid_set_aspect(postID, checked) {
	if (checked) { document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-aspect]')[0].value = document.getElementById('attachments-'+postID+'-kgflashmediaplayer-height').value / document.getElementById('attachments-'+postID+'-kgflashmediaplayer-width').value; 
	}
}

function kgvid_generate_thumb(postID, buttonPushed) {

	var kgflashmediaplayersecurity = document.getElementsByName('attachments[kgflashmediaplayer-security]')[0].value;
	var attachmentURL = document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-url]')[0].value;
	var howmanythumbs = document.getElementById('attachments-'+postID+'-numberofthumbs').value;
	var firstframethumb = document.getElementById('attachments-'+postID+'-firstframe').checked;
	var posterurl = document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-poster]')[0].value;
	var specifictimecode = document.getElementsByName('attachments['+postID+'][thumbtime]')[0].value;
	if (specifictimecode === "0") { specifictimecode = "firstframe"; }
	var thumbnailplaceholderid = "#attachments-"+postID+"-thumbnailplaceholder";
	var encodeplaceholderid = "#attachments-"+postID+"-encodeplaceholder";
	var encodeprogressplaceholderid = "#attachments-"+postID+"-encodeprogressplaceholder";
	var altembedselectid = "#attachments-"+postID+"-altembedselect";
	var thumbnailboxID = "#attachments-"+postID+"-kgflashmediaplayer-thumbnailbox";
	var thumbnailboxoverlayID = "#attachments-"+postID+"-kgflashmediaplayer-thumbnailboxoverlay";
	var cancelthumbdivID = '#attachments-'+postID+'-kgflashmediaplayer-cancelthumbsdiv';
	var widthID = 'attachments-'+postID+'-kgflashmediaplayer-width';
	var heightID = 'attachments-'+postID+'-kgflashmediaplayer-height';
	var maxwidthID = 'attachments['+postID+'][kgflashmediaplayer-maxwidth]';
	var maxheightID = 'attachments['+postID+'][kgflashmediaplayer-maxheight]';
	var i=1;
	var increaser = 0;
	var iincreaser = 0;
	
	var page = "attachment";	
	var document_url = document.URL;
	var page_check = /[?&]page=([^&]+)/i;
	var match = page_check.exec(document_url);
	if (match != null) {
		page = "queue";
	}
	
	var formats = new Array("1080", "720", "mobile", "ogg", "webm");
	var kgvid_encode = new Object();
	for ( var key in formats ) {
		kgvid_encode[formats[key]] = "";
		if ( jQuery('#attachments-'+postID+'-kgflashmediaplayer-encode'+formats[key]).length > 0) { 
			kgvid_encode[formats[key]] = document.getElementById('attachments-'+postID+'-kgflashmediaplayer-encode'+formats[key]).checked;		
		}
	}
	JSON.stringify(kgvid_encode);

	if (buttonPushed == "generate" || buttonPushed == "random" ) { 
		actionName = "generate";
		if (specifictimecode != 0 ) { howmanythumbs = 1; }
	}
	else { 
		actionName = buttonPushed; 
		howmanythumbs = 1;
	}

	if (buttonPushed != "enqueue") {

		jQuery(thumbnailplaceholderid).empty();
		jQuery(thumbnailplaceholderid).append('<strong>Choose Thumbnail: </strong><div style="display:inline-block;" id="attachments-'+postID+'-kgflashmediaplayer-cancelthumbsdiv" name="attachments-'+postID+'-kgflashmediaplayer-cancelthumbsdiv">	<input type="button" id="attachments-'+postID+'-kgflashmediaplayer-cancelencode" class="button-secondary" value="Cancel Generating" name="attachments-'+postID+'-cancelencode" onclick="kgvid_cancel_thumbs(\''+postID+'\');"></div><div id="attachments-'+postID+'-kgflashmediaplayer-thumbnailboxoverlay" name="attachments-'+postID+'-kgflashmediaplayer-thumbnailboxoverlay" class="kgvid_thumbnail_overlay"><div name="attachments-'+postID+'-kgflashmediaplayer-thumbnailbox" id="attachments-'+postID+'-kgflashmediaplayer-thumbnailbox" class="kgvid_thumbnail_box"></div></div>');
	}

	if (buttonPushed == "enqueue") {
		jQuery(encodeplaceholderid).empty();
		jQuery(encodeprogressplaceholderid).empty();
		jQuery(encodeplaceholderid).append('<strong>Loading...</strong>');
	}

	function kgvid_do_post() {

		iincreaser = i + increaser;

		jQuery.post(ajaxurl, { action:"kgvid_callffmpeg", security: kgflashmediaplayersecurity, movieurl: attachmentURL, numberofthumbs: howmanythumbs, thumbnumber:i, thumbnumberplusincreaser:iincreaser, ffmpeg_action: actionName, encodeformats: kgvid_encode, attachmentID: postID, generate_button: buttonPushed, thumbtimecode: specifictimecode, dofirstframe: firstframethumb, poster: posterurl }, function(data) { 
	
			if (actionName == "generate") {
				kgthumbnailTimeout = jQuery(thumbnailplaceholderid).data("kgthumbnailTimeouts") || null;
				jQuery(thumbnailboxID).append(data.thumbnaildisplaycode);
				var thumbnailselectID = "#attachments-"+postID+"-thumb"+i;
				jQuery(thumbnailselectID).css({display:"none"});
				jQuery(thumbnailselectID).animate({opacity: 'toggle', height: 'toggle', width: 'toggle'}, 1000); 
				if (data.lastthumbnumber == "break" || (kgthumbnailTimeout == null && i != 1) ) { i = parseInt(howmanythumbs) + 1; }
				else { i = parseInt(data.lastthumbnumber); }
				increaser++;
				if ( i <= howmanythumbs ) {
					if ( kgthumbnailTimeout == null ) { kgthumbnailTimeout = new Array(); }
					kgthumbnailTimeout[i] = setTimeout(function(){
						//jQuery(thumbnailplaceholderid).data("kgthumbnailTimeout", null);
						kgvid_do_post();
					}, 750);
					jQuery(thumbnailplaceholderid).data("kgthumbnailTimeouts", kgthumbnailTimeout);
				}
				else { 
					jQuery(thumbnailboxoverlayID).fadeTo(2000, 1);
					jQuery(cancelthumbdivID).animate({opacity: 0}, 500);
					jQuery(thumbnailplaceholderid).data("kgthumbnailTimeouts", null);
				}

				kgvid_aspect = data.movie_height/data.movie_width;
				document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-aspect]')[0].value = kgvid_aspect;
				if (parseInt(data.movie_width) < parseInt(document.getElementsByName(maxwidthID)[0].value) ) { document.getElementById(widthID).value = data.movie_width; }
				else { document.getElementById(widthID).value = document.getElementsByName(maxwidthID)[0].value; }
				if (parseInt(data.movie_width) > parseInt(document.getElementsByName(maxwidthID)[0].value) ) { document.getElementById(heightID).value = Math.round(kgvid_aspect*parseInt(document.getElementsByName(maxwidthID)[0].value)); } 
				else { document.getElementById(heightID).value = data.movie_height; }
				jQuery.post( ajaxurl , { action:"kgvid_schedule_cleanup_generated_files", security:kgflashmediaplayersecurity, thumbs:"true" } );
				kgvid_redraw_encode_checkboxes(attachmentURL, postID, page);
			}//if thumbnail button pressed
	
			if (buttonPushed == "enqueue") {
				jQuery(encodeplaceholderid).empty();
				jQuery(encodeprogressplaceholderid).empty();
				jQuery(encodeplaceholderid).append(data.embed_display);
				jQuery.post( ajaxurl , { action:"kgvid_ajax_encode_videos", security:kgflashmediaplayersecurity } , function(data) {
					jQuery(encodeprogressplaceholderid).empty();
					jQuery(encodeplaceholderid).append(data.embed_display);
					kgvid_redraw_encode_checkboxes(attachmentURL, postID, page);
				}, "json");
			}//if encode button pressed
		}, "json");

	}// end kgvid_do_post function

	kgvid_do_post(); //actually call the loop
}

function kgvid_hide_standard_wordpress_display_settings(postID) {
	if ( jQuery('#attachments['+postID+'][kgflashmediaplayer-embed]').value != "WordPress Default" ) {
		jQuery('.attachment-display-settings').hide();
	}
}

function kgvid_set_singleurl() {

	var oldbasename = jQuery('#kgflashmediaplayer-table').data("kgvid_attachment_id") || "singleurl";
	var url = document.getElementById('attachments-'+oldbasename+'-kgflashmediaplayer-url').value;
	var validExtensions = new Array(".flv", ".f4v", ".mp4", ".mov", ".m4v", ".webm", ".ogg", ".ogv");
	var extensionExists = false;
	for (var i = 0; i < validExtensions.length; i++) {
		if (url.indexOf(validExtensions[i]) != -1) { 
			extensionExists = true;
			if ( document.getElementById('attachments-'+oldbasename+'-kgflashmediaplayer-ffmpegexists').value == "on" ) {
				document.getElementById('attachments-'+oldbasename+'-thumbgenerate').disabled = false;
				document.getElementById('attachments-'+oldbasename+'-thumbgenerate').title = "";
				document.getElementById('attachments-'+oldbasename+'-thumbrandomize').disabled = false;
				document.getElementById('attachments-'+oldbasename+'-thumbrandomize').title = "";
				document.getElementById('attachments-'+oldbasename+'-kgflashmediaplayer-encode').disabled = false;
				document.getElementById('attachments-'+oldbasename+'-kgflashmediaplayer-encode').title = "";
				var basename = "singleurl_"+url.replace(/^.*\/|\.[^.]*$/g, '');
				//jQuery('#kgflashmediaplayer-table :input').each(function(){ 
				jQuery('#kgvid-form :input').each(function(){ 
					var newid = jQuery(this).attr("id").replace(oldbasename, basename);
					jQuery(this).attr("id", newid);				
					if ( jQuery(this).attr("name") ) { 
						var newname = jQuery(this).attr("name").replace(oldbasename, basename);
						jQuery(this).attr("name", newname);
					}
				});
				jQuery('#kgflashmediaplayer-table').data("kgvid_attachment_id", basename);
				document.getElementById('attachments-'+oldbasename+'-kgflashmediaplayer-encodeboxes').id = 'attachments-'+basename+'-kgflashmediaplayer-encodeboxes';
				document.getElementById('attachments-'+oldbasename+'-thumbnailplaceholder').id = 'attachments-'+basename+'-thumbnailplaceholder';
				jQuery('#attachments-'+basename+'-thumbgenerate').replaceWith('<input type="button" id="attachments-'+basename+'-thumbgenerate" class="button-secondary" value="Generate" name="thumbgenerate" onclick="kgvid_generate_thumb(\''+basename+'\', \'generate\');" >');
				jQuery('#attachments-'+basename+'-thumbrandomize').replaceWith('<input type="button" id="attachments-'+basename+'-thumbrandomize" class="button-secondary" value="Randomize" name="thumbgenerate" onclick="kgvid_generate_thumb(\''+basename+'\', \'random\');" >');
			}
			else {
				document.getElementById('attachments-'+oldbasename+'-thumbgenerate').title = "FFMPEG not found";
				document.getElementById('attachments-'+oldbasename+'-thumbrandomize').title = "FFMPEG not found";
			}
			document.getElementById('insertonlybutton').disabled = false;
			document.getElementById('insertonlybutton').title = "";
			break;
		}
	}
	if (extensionExists == false) { 
		if ( url != "" ) { alert("Please enter a URL that points to a valid video file. Video sharing sites are not supported by this plugin.\nTo embed from YouTube, Vimeo, etc, just paste the link directly into the post window and WordPress will handle the rest."); }
		document.getElementById('attachments-'+oldbasename+'-thumbgenerate').disabled = true;
		document.getElementById('attachments-'+oldbasename+'-thumbgenerate').title = "Please enter a valid video URL";
		document.getElementById('attachments-'+oldbasename+'-thumbrandomize').disabled = true;
		document.getElementById('attachments-'+oldbasename+'-thumbrandomize').title = "Please enter a valid video URL";
		document.getElementById('attachments-'+oldbasename+'-kgflashmediaplayer-encode').disabled = true;
		document.getElementById('attachments-'+oldbasename+'-kgflashmediaplayer-encode').title = "Please enter a valid video URL";
		document.getElementById('insertonlybutton').disabled = true;
		document.getElementById('insertonlybutton').title = "Please enter a valid video URL";
		basename = "singleurl";
	}
	kgvid_redraw_encode_checkboxes(url, basename, 'attachment');
}

function kgvid_insert_shortcode() {

	var kgflashmediaplayersecurity = document.getElementsByName('attachments[kgflashmediaplayer-security]')[0].value;
	var basename = jQuery('#kgflashmediaplayer-table').data("kgvid_attachment_id") || "singleurl";
	var url = document.getElementById('attachments-'+basename+'-kgflashmediaplayer-url').value;
	var posterurl = document.getElementById('attachments-'+basename+'-kgflashmediaplayer-poster').value;
	
	var iframe_url = document.URL;
	var id_check = /[?&]post_id=([^&]+)/i;
	var match = id_check.exec(iframe_url);
	if (match != null) {
		postid = match[1];
	} else {
		postid = "";
	}

	jQuery.post(ajaxurl, { action:'kgvid_callffmpeg', security: kgflashmediaplayersecurity, attachmentID: basename, movieurl: url, ffmpeg_action:'submit', poster: posterurl, post_id: postid }, function(data) {
		//jQuery('attachments-singleurl-thumbnailplaceholder').empty();
	}, "json" );

	var shortcode = "";
	if (document.getElementById('videotitle').value != "") {
		var titlecode = unescape(document.getElementsByName('attachments['+basename+'][kgflashmediaplayer-titlecode]')[0].value);
		titlecode=titlecode.replace(/\\'/g,'\'');
		titlecode=titlecode.replace(/\\"/g,'"');
		titlecode=titlecode.replace(/\\0/g,'\0');
		titlecode=titlecode.replace(/\\\\/g,'\\');
		if ( titlecode.substr(0,1) != '<' ) { titlecode = '<'+titlecode; }
		if ( titlecode.substr(-1,1) != '>' ) { titlecode = titlecode+'>'; }
		var endtitlecode = titlecode.replace('<', '</');
		endtitlecode = endtitlecode.split(' ');
		endtitlecode = endtitlecode[0];
		if ( endtitlecode.substr(-1,1) != '>' ) { endtitlecode = endtitlecode+'>'; }
		shortcode += titlecode + document.getElementById('videotitle').value + endtitlecode + '<br />';
	}
	if (url !="") {
		shortcode += ' [KGVID';
		if (document.getElementById('attachments-'+basename+'-kgflashmediaplayer-poster').value !="") { shortcode += ' poster="' + document.getElementById('attachments-'+basename+'-kgflashmediaplayer-poster').value + '"'; }
		if (document.getElementById('attachments-'+basename+'-kgflashmediaplayer-width').value !="") { shortcode += ' width="' + document.getElementById('attachments-'+basename+'-kgflashmediaplayer-width').value + '"'; }
		if (document.getElementById('attachments-'+basename+'-kgflashmediaplayer-height').value !="") { shortcode += ' height="' + document.getElementById('attachments-'+basename+'-kgflashmediaplayer-height').value + '"'; }
		shortcode += ']' + url + '[/KGVID] '; }
		if (document.getElementById('downloadlink').checked) { shortcode += '<br /><a href="' + document.getElementById('attachments-'+basename+'-kgflashmediaplayer-url').value + '">Right-click or ctrl-click this link to download</a>'; }

	parent.send_to_editor(shortcode);
}

function kgvid_cancel_encode(kgvid_pid, postID, video_key, format) {

	var kgflashmediaplayersecurity = document.getElementsByName('attachments[kgflashmediaplayer-security]')[0].value;
	//var cancelbuttonID = '#attachments-'+postID+'-kgflashmediaplayer-cancelencode';

	//jQuery(cancelbuttonID).empty();
	//jQuery(cancelbuttonID).append("<em>Canceling...</em>");
	jQuery('#attachments-'+postID+'-kgflashmediaplayer-meta'+format).empty();
	jQuery('#attachments-'+postID+'-kgflashmediaplayer-meta'+format).append('<strong>Canceling</strong>');
	jQuery.post(ajaxurl, { action:"kgvid_cancel_encode", security: kgflashmediaplayersecurity, kgvid_pid: kgvid_pid, video_key: video_key, format: format } );

}

function kgvid_delete_video(movieurl, postID, format) {

	var delete_for_sure = confirm("You are about to permanently delete the encoded video.\n 'Cancel' to stop, 'OK' to delete.");
	
	if ( delete_for_sure == true ) {

		jQuery('#attachments-'+postID+'-kgflashmediaplayer-encode'+format).removeAttr('disabled');
		jQuery('#attachments-'+postID+'-kgflashmediaplayer-encode').removeAttr('disabled');
		jQuery('#attachments-'+postID+'-kgflashmediaplayer-encode').css('display', 'inline');
		jQuery('#attachments-'+postID+'-kgflashmediaplayer-meta'+format).empty();
		jQuery('#attachments-'+postID+'-kgflashmediaplayer-meta'+format).append('<strong>Deleted</strong>');
		var kgflashmediaplayersecurity = document.getElementsByName('attachments[kgflashmediaplayer-security]')[0].value;
		
		jQuery.post(ajaxurl, { action: "kgvid_delete_video", security: kgflashmediaplayersecurity, movieurl: movieurl, postid: postID, format: format }, function(data) {
			//document.getElementById('attachments-'+postID+'-kgflashmediaplayer-encode'+format).checked = true;
			//document.getElementById('attachments-'+postID+'-kgflashmediaplayer-encode'+format).disabled = false;
			//document.getElementById('attachments-'+postID+'-kgflashmediaplayer-encode').disabled = false;
			jQuery('#attachments-'+postID+'-kgflashmediaplayer-encode'+format).change();
		}, "json" );
	
	}
}

function kgvid_cancel_thumbs(postID) {
		var thumbnailplaceholderid = "#attachments-"+postID+"-thumbnailplaceholder";
		var thumbnailboxoverlayID = "#attachments-"+postID+"-kgflashmediaplayer-thumbnailboxoverlay";
		var cancelthumbdivID = '#attachments-'+postID+'-kgflashmediaplayer-cancelthumbsdiv';
		var kgthumbnailTimeout = jQuery(thumbnailplaceholderid).data("kgthumbnailTimeouts");
		
		for( key in kgthumbnailTimeout ){ clearTimeout(kgthumbnailTimeout[key]); }
		
		jQuery(thumbnailplaceholderid).data("kgthumbnailTimeouts", null);
		jQuery(thumbnailboxoverlayID).fadeTo(2000, 1);
		jQuery(cancelthumbdivID).animate({opacity: 0}, 500);
		jQuery(cancelthumbdivID).remove;
}

function kgvid_redraw_encode_checkboxes(movieurl, postID, page) {
	var kgflashmediaplayersecurity = document.getElementsByName('attachments[kgflashmediaplayer-security]')[0].value;
	
	var formats = new Array("1080", "720", "mobile", "ogg", "webm");
	var kgvid_encode = new Object();
	for ( var key in formats ) {
		kgvid_encode[formats[key]] = "";
		if ( jQuery('#attachments-'+postID+'-kgflashmediaplayer-encode'+formats[key]).length > 0) { 
			kgvid_encode[formats[key]] = document.getElementById('attachments-'+postID+'-kgflashmediaplayer-encode'+formats[key]).checked;		
		}
	}
	JSON.stringify(kgvid_encode);
	
	jQuery.post(ajaxurl, { action:"kgvid_generate_encode_checkboxes", security: kgflashmediaplayersecurity, movieurl: movieurl, post_id: postID, page: page, encodeformats: kgvid_encode }, function(data) {
			jQuery('#attachments-'+postID+'-kgflashmediaplayer-encodeboxes').empty();
			jQuery('#attachments-'+postID+'-kgflashmediaplayer-encodeboxes').append(data.embed_display);
			if ( page == "queue" && data.embed_display.indexOf('Elapsed') >= 0) {
				jQuery('tr.currently_encoding').removeClass('currently_encoding');
				jQuery('[id^=clear]').css("display", "block");
				jQuery('#clear_'+postID).css("display", "none");
				jQuery('#tr_'+postID).addClass('currently_encoding');
			}
	}, "json" );
}

function kgvid_encode_queue(action, order) {

	var kgflashmediaplayersecurity = document.getElementsByName('attachments[kgflashmediaplayer-security]')[0].value;
	
	var CheckboxTimeout = jQuery('#wpwrap').data("KGVIDCheckboxTimeout") || null;
	if ( CheckboxTimeout ) { clearTimeout(CheckboxTimeout); }

	if ( action == "delete" ) {
		jQuery.post(ajaxurl, { action:"kgvid_clear_queue_entry", security: kgflashmediaplayersecurity, index: order }, function(data) {
			jQuery('table.widefat > tbody').replaceWith("<tbody class='rows'>"+data+"</tbody>");
		}, "html" );
	}
	
	if ( action == "clear_completed" ) {	
		jQuery.post(ajaxurl, { action:"kgvid_clear_completed_queue", security: kgflashmediaplayersecurity }, function(data) {
			jQuery('table.widefat > tbody').replaceWith("<tbody class='rows'>"+data+"</tbody>");
		}, "html" );	
	}

}

function kgvid_hide_plugin_settings(selected_option) {
	if (selected_option == "Video.js") {
		jQuery("table:contains(End of video image)").hide();
		jQuery("h3:contains(The following options will only affect Flash playback)").hide();
		jQuery("tr:contains(Skin Class)").show();
	}
	if (selected_option == "Strobe Media Playback") {
		jQuery("table:contains(End of video image)").show();
		jQuery("h3:contains(The following options will only affect Flash playback)").show();
		jQuery("tr:contains(Skin Class)").hide();
	}
}

function kgvid_hide_ffmpeg_settings(video_app) {
	if (video_app == "ffmpeg") {
		jQuery("tr:contains(FFMPEG Options)").show();
	}
	if (video_app == "avconv") {
		jQuery("tr:contains(FFMPEG Options)").hide();
	}
}