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

function kgvid_generate_thumb_html5(postID, buttonPushed) { //make thumbnails with HTML5 <video> element

		var kgflashmediaplayersecurity = document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-security]')[0].value;
		var increaser = 0;
		var iincreaser = 0;
		var i = 1;
		
		var howmanythumbs = document.getElementById('attachments-'+postID+'-numberofthumbs').value;
		var video = document.getElementById('thumb_video_'+postID);
		var video_width = video.videoWidth;
		var video_height = video.videoHeight;
		var video_aspect = video_height/video_width;
		
		var thumbnails = [];
		
		jQuery('#canvas_holder_'+postID).empty();
		
		jQuery('#thumb_video_'+postID).on('seeked.kgvid', function(){ //when the video is finished seeking
		
			var thumbnail_saved = jQuery(video).data('thumbnail_data');
			if ( thumbnail_saved.length > 0 ) { //if there are any thumbnails that haven't been generated
				time_id = Math.round(video.currentTime);
				jQuery('#canvas_holder_'+postID).append('<div class="kgvid_thumbnail_select" name="attachments['+postID+'][thumb'+time_id+']" id="attachments-'+postID+'-thumb'+time_id+'"><label for="kgflashmedia-'+postID+'-thumbradio'+time_id+'"><canvas id="'+postID+'_thumb_'+time_id+'"></canvas></label><br /><input type="radio" name="attachments['+postID+'][thumbradio'+time_id+']" id="kgflashmedia-'+postID+'-thumbradio'+time_id+'" value="Update this to the URL" onchange="document.getElementById(\'attachments-'+postID+'-kgflashmediaplayer-poster\').value = this.value; document.getElementById(\'attachments-'+postID+'-thumbtime\').value = \''+video.currentTime+'\'; document.getElementById(\'attachments-'+postID+'-numberofthumbs\').value =\'1\';"></div>');
				var canvas = document.getElementById(postID+'_thumb_'+time_id);
				canvas.width = video_width;
				canvas.height = video_height;
				var context = canvas.getContext('2d');
				context.fillRect(0, 0, video_width, video_height);
				context.drawImage(video, 0, 0, video_width, video_height);
				
				var png64dataURL = canvas.toDataURL();
				jQuery.post(ajaxurl, { action:"kgvid_save_html5_thumb", security: kgflashmediaplayersecurity, raw_png: png64dataURL } );

				thumbnail_saved.splice(0,1);
				jQuery(video).data('thumbnail_data', thumbnail_saved);
				if ( thumbnail_saved.length > 0 ) { video.currentTime = thumbnail_saved[0]; }
				else { jQuery('#thumb_video_'+postID).off('seeked.kgvid'); }
			}
			
		});
		
		for (i; i<=howmanythumbs; i++) {
			iincreaser = i + increaser;
			increaser++;
			var movieoffset = Math.round((video.duration * iincreaser) / (howmanythumbs * 2));
			thumbnails.push(movieoffset);
		}
		video.currentTime = thumbnails[0];
		jQuery(video).data('thumbnail_data', thumbnails);
		
}

function kgvid_generate_thumb(postID, buttonPushed) {

	var kgflashmediaplayersecurity = document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-security]')[0].value;
	var attachmentURL = document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-url]')[0].value;
	var howmanythumbs = document.getElementById('attachments-'+postID+'-numberofthumbs').value;
	var firstframethumb = document.getElementById('attachments-'+postID+'-firstframe').checked;
	var posterurl = document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-poster]')[0].value;

	var specifictimecode = document.getElementsByName('attachments['+postID+'][thumbtime]')[0].value;
	if (specifictimecode === "0") { specifictimecode = "firstframe"; firstframethumb = true; }
	if (specifictimecode != 0 ) { howmanythumbs = 1; }
	if (buttonPushed == "random") { specifictimecode = 0; }
	
	var thumbnailplaceholderid = "#attachments-"+postID+"-thumbnailplaceholder";
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
	
	jQuery(thumbnailplaceholderid).empty();
	jQuery(thumbnailplaceholderid).append('<strong>Choose Thumbnail: </strong><div style="display:inline-block;" id="attachments-'+postID+'-kgflashmediaplayer-cancelthumbsdiv" name="attachments-'+postID+'-kgflashmediaplayer-cancelthumbsdiv">	<input type="button" id="attachments-'+postID+'-kgflashmediaplayer-cancelencode" class="button-secondary" value="Cancel Generating" name="attachments-'+postID+'-cancelencode" onclick="kgvid_cancel_thumbs(\''+postID+'\');"></div><div id="attachments-'+postID+'-kgflashmediaplayer-thumbnailboxoverlay" name="attachments-'+postID+'-kgflashmediaplayer-thumbnailboxoverlay" class="kgvid_thumbnail_overlay"><div name="attachments-'+postID+'-kgflashmediaplayer-thumbnailbox" id="attachments-'+postID+'-kgflashmediaplayer-thumbnailbox" class="kgvid_thumbnail_box"></div></div>');

	function kgvid_do_post() {

		iincreaser = i + increaser;

		jQuery.post(ajaxurl, { action:"kgvid_callffmpeg", security: kgflashmediaplayersecurity, movieurl: attachmentURL, numberofthumbs: howmanythumbs, thumbnumber:i, thumbnumberplusincreaser:iincreaser, ffmpeg_action: 'generate', attachmentID: postID, generate_button: buttonPushed, thumbtimecode: specifictimecode, dofirstframe: firstframethumb, poster: posterurl }, function(data) { 
	
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

		}, "json");

	}// end kgvid_do_post function
	
	var video = document.getElementById('thumb_video_'+postID);
	
	if ( video.networkState == 1 || video.networkState == 2 ) { //if the browser can load the video, use it to make thumbnails
		var video_width = video.videoWidth;
		var video_height = video.videoHeight;
		var video_aspect = video_height/video_width;
		var thumbnails = [];
				
		jQuery('#thumb_video_'+postID).on('seeked.kgvid', function(){ //when the video is finished seeking
		
			var thumbnail_saved = jQuery(video).data('thumbnail_data');
			if ( thumbnail_saved.length > 0 ) { //if there are any thumbnails that haven't been generated
				time_id = Math.round(video.currentTime);

				var minutes = Math.floor(video.currentTime / 60);
				var seconds = Math.round((video.currentTime - (minutes * 60))*100)/100;
				if (minutes < 10) {minutes = "0"+minutes;}
				if (seconds < 10) {seconds = "0"+seconds;}
				var time_display = minutes+':'+seconds;

				jQuery(thumbnailboxID).append('<div style="display:none;" class="kgvid_thumbnail_select" name="attachments['+postID+'][thumb'+time_id+']" id="attachments-'+postID+'-thumb'+time_id+'"><label for="kgflashmedia-'+postID+'-thumbradio'+time_id+'"><canvas class="kgvid_thumbnail" style="width:200px;height:'+Math.round(200*video_aspect)+'px;" id="'+postID+'_thumb_'+time_id+'"></canvas></label><br /><input type="radio" name="attachments['+postID+'][thumbradio'+time_id+']" id="kgflashmedia-'+postID+'-thumbradio'+time_id+'" value="'+video.currentTime+'" onchange="document.getElementById(\'attachments-'+postID+'-thumbtime\').value = \''+time_display+'\'; document.getElementById(\'attachments-'+postID+'-numberofthumbs\').value =\'1\';kgvid_save_canvas_thumb(\''+postID+'\', \''+time_id+'\');"></div>');
				var canvas = document.getElementById(postID+'_thumb_'+time_id);
				canvas.width = video_width;
				canvas.height = video_height;
				var context = canvas.getContext('2d');
				context.fillRect(0, 0, video_width, video_height);
				context.drawImage(video, 0, 0, video_width, video_height);
				jQuery('#attachments-'+postID+'-thumb'+time_id).animate({opacity: 'toggle', height: 'toggle', width: 'toggle'}, 1000); 

				thumbnail_saved.splice(0,1);
				jQuery(video).data('thumbnail_data', thumbnail_saved);
				if ( thumbnail_saved.length > 0 ) { video.currentTime = thumbnail_saved[0]; }
				else { 
					jQuery('#thumb_video_'+postID).off('seeked.kgvid'); 
					jQuery(thumbnailboxoverlayID).fadeTo(2000, 1);
					jQuery(cancelthumbdivID).animate({opacity: 0}, 500);
				}
			}
			
		});
		
		for (i; i<=howmanythumbs; i++) {
			iincreaser = i + increaser;
			increaser++;
			var movieoffset = Math.round((video.duration * iincreaser) / (howmanythumbs * 2));

			if (buttonPushed == "random") { //adjust offset random amount
				var random_offset = Math.round(Math.random() * video.duration / howmanythumbs);
				movieoffset = movieoffset - random_offset;
				if (movieoffset < 0) { movieoffset = 0; }
			}
			
			thumbnails.push(movieoffset); //add offset to array
		}
		
		if ( firstframethumb ) { thumbnails[0] = 0; }
		
		if ( specifictimecode ) {
			var timecode_array = specifictimecode.split(":");
			timecode_array = timecode_array.reverse();
			if ( timecode_array[1] ) { timecode_array[1] = timecode_array[1] * 60; }
			if ( timecode_array[2] ) { timecode_array[2] = timecode_array[2] * 3600; }
			var thumbtimecode = 0;
			jQuery.each(timecode_array,function() {
				thumbtimecode += parseFloat(this);
			});
			console.log(thumbtimecode);
			thumbnails = [thumbtimecode];
		}
		video.currentTime = thumbnails[0];
		jQuery(video).data('thumbnail_data', thumbnails);
	
	}
	else {
		kgvid_do_post(); //call the FFMPEG loop if the browser can't do it
	}
}

function kgvid_save_canvas_thumb(postID, time_id) {

	var kgflashmediaplayersecurity = document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-security]')[0].value;

	var video_url = document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-url]')[0].value;
	var canvas = document.getElementById(postID+'_thumb_'+time_id);
	var png64dataURL = canvas.toDataURL(); //this is what saves the image. Do this after selection.
	jQuery.post(ajaxurl, { action:"kgvid_save_html5_thumb", security: kgflashmediaplayersecurity, raw_png: png64dataURL, url: video_url, offset: time_id }, function(thumb_url) {
		jQuery('#attachments-'+postID+'-kgflashmediaplayer-poster').val(thumb_url);
	}, "text");
	
}

function kgvid_enqueue_video_encode(postID) {

	var kgflashmediaplayersecurity = document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-security]')[0].value;
	var attachmentURL = document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-url]')[0].value;
	var parent_post_id = jQuery('#post_ID').val();
	if ( parent_post_id == undefined ) { parent_post_id = jQuery('#post_ID', window.parent.document).val(); }
	var encodeplaceholderid = "#attachments-"+postID+"-encodeplaceholder";
	var encodeprogressplaceholderid = "#attachments-"+postID+"-encodeprogressplaceholder";

	var page = "attachment";	
	var document_url = document.URL;
	var page_check = /[?&]page=([^&]+)/i;
	var match = page_check.exec(document_url);
	if (match != null) {
		page = "queue";
	}
	
	var formats = new Array("rotated", "1080", "720", "mobile", "ogg", "webm");
	var kgvid_encode = new Object();
	jQuery.each(formats, function(key,formats) {
		kgvid_encode[formats] = "";
		if ( jQuery('#attachments-'+postID+'-kgflashmediaplayer-encode'+formats).length > 0) { 
			kgvid_encode[formats] = document.getElementById('attachments-'+postID+'-kgflashmediaplayer-encode'+formats).checked;
		}
	});
	JSON.stringify(kgvid_encode);
	
	jQuery(encodeplaceholderid).empty();
	jQuery(encodeprogressplaceholderid).empty();
	jQuery(encodeplaceholderid).append('<strong>Loading...</strong>');
	
	jQuery.post(ajaxurl, { action:"kgvid_callffmpeg", security: kgflashmediaplayersecurity, movieurl: attachmentURL, ffmpeg_action: 'enqueue', encodeformats: kgvid_encode, attachmentID: postID, parent_id: parent_post_id, }, function(data) { 

		jQuery(encodeplaceholderid).empty();
		jQuery(encodeprogressplaceholderid).empty();
		jQuery(encodeplaceholderid).append(data.embed_display);
		jQuery.post( ajaxurl , { action:"kgvid_ajax_encode_videos", security:kgflashmediaplayersecurity } , function(data) {
			jQuery(encodeprogressplaceholderid).empty();
			jQuery(encodeplaceholderid).append(data.embed_display);
			jQuery('#attachments-'+postID+'-kgflashmediaplayer-encodeboxes').css('opacity', '0.5');
			kgvid_redraw_encode_checkboxes(attachmentURL, postID, page);
		}, "json");
		
	}, "json");
}

function kgvid_hide_standard_wordpress_display_settings(postID) {
	if ( jQuery('#attachments['+postID+'][kgflashmediaplayer-embed]').value != "WordPress Default" ) {
		jQuery('.attachment-display-settings').hide();
	}
}

function kgvid_change_singleurl(url, basename, oldbasename) {

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
	

	if ( document.getElementById('attachments-'+basename+'-kgflashmediaplayer-ffmpegexists').value == "on" ) {
		document.getElementById('attachments-'+basename+'-thumbgenerate').disabled = false;
		document.getElementById('attachments-'+basename+'-thumbgenerate').title = "";
		document.getElementById('attachments-'+basename+'-thumbrandomize').disabled = false;
		document.getElementById('attachments-'+basename+'-thumbrandomize').title = "";
		//document.getElementById('attachments-'+basename+'-kgflashmediaplayer-encode').disabled = false;
		document.getElementById('attachments-'+basename+'-kgflashmediaplayer-encode').title = "Loading...";

	}
	else {
		document.getElementById('attachments-'+basename+'-thumbgenerate').title = "FFMPEG not found";
		document.getElementById('attachments-'+basename+'-thumbrandomize').title = "FFMPEG not found";
	}
	document.getElementById('insertonlybutton').disabled = false;
	document.getElementById('insertonlybutton').title = "";

}

function kgvid_set_singleurl() {

	var oldbasename = jQuery('#kgflashmediaplayer-table').data("kgvid_attachment_id") || "singleurl";
	var kgflashmediaplayersecurity = document.getElementsByName('attachments['+oldbasename+'][kgflashmediaplayer-security]')[0].value;
	var basename;
	var url = document.getElementById('attachments-'+oldbasename+'-kgflashmediaplayer-url').value;
	var validExtensions = new Array(".flv", ".f4v", ".mp4", ".mov", ".m4v", ".webm", ".ogg", ".ogv");
	var extensionExists = false;

	if ( url.length > 0 ) {
	
		for (var i = 0; i < validExtensions.length; i++) {
			if (url.indexOf(validExtensions[i]) != -1) { 
				extensionExists = true;
				jQuery.post(ajaxurl, { action:"kgvid_sanitize_url", security: kgflashmediaplayersecurity, movieurl: url }, function(data) {
					basename = data.singleurl_id;
					url = data.movieurl;
					kgvid_change_singleurl(url, basename, oldbasename);
					jQuery('#attachments-'+basename+'-kgflashmediaplayer-encodeboxes').css('opacity', '0.5');
					kgvid_redraw_encode_checkboxes(url, basename, 'attachment');
				}, "json");
				break;
			}
		}
	}
	
	if (extensionExists == false) { 
		if ( url != "" ) { alert("Please enter a URL that points to a valid video file. Video sharing sites are not supported by this plugin.\nTo embed from YouTube, Vimeo, etc, just paste the link directly into the post window and WordPress will handle the rest."); }
		basename = "singleurl";
		kgvid_change_singleurl(url, basename, oldbasename);
		document.getElementById('attachments-'+basename+'-thumbgenerate').disabled = true;
		document.getElementById('attachments-'+basename+'-thumbgenerate').title = "Please enter a valid video URL";
		document.getElementById('attachments-'+basename+'-thumbrandomize').disabled = true;
		document.getElementById('attachments-'+basename+'-thumbrandomize').title = "Please enter a valid video URL";
		document.getElementById('attachments-'+basename+'-kgflashmediaplayer-encode').disabled = true;
		document.getElementById('attachments-'+basename+'-kgflashmediaplayer-encode').title = "Please enter a valid video URL";
		document.getElementById('insertonlybutton').disabled = true;
		document.getElementById('insertonlybutton').title = "Please enter a valid video URL";
	}
	
}

function kgvid_insert_shortcode() {

	var basename = jQuery('#kgflashmediaplayer-table').data("kgvid_attachment_id") || "singleurl";
	var kgflashmediaplayersecurity = document.getElementsByName('attachments['+basename+'][kgflashmediaplayer-security]')[0].value;
	var url = document.getElementById('attachments-'+basename+'-kgflashmediaplayer-url').value;
	var posterurl = document.getElementById('attachments-'+basename+'-kgflashmediaplayer-poster').value;
	var postid = parent.document.getElementById('post_ID').value

	jQuery.post(ajaxurl, { action:'kgvid_callffmpeg', security: kgflashmediaplayersecurity, attachmentID: basename, movieurl: url, ffmpeg_action:'submit', poster: posterurl, parent_id: postid }, function(data) {
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
		shortcode += titlecode + '<span itemprop="name">' + document.getElementById('videotitle').value + '</span>' + endtitlecode + '<br />';
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

function kgvid_rescan_external_server(movieurl, postID) {

	var kgflashmediaplayersecurity = document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-security]')[0].value;
	jQuery('#attachments-'+postID+'-kgflashmediaplayer-rescanplaceholder').empty();
	jQuery('#attachments-'+postID+'-kgflashmediaplayer-rescanplaceholder').append('<strong>Scanning...</strong>');
	jQuery.post(ajaxurl, { action:"kgvid_rescan_external_server", security: kgflashmediaplayersecurity, movieurl:movieurl, postID:postID }, function() {
		jQuery('#attachments-'+postID+'-kgflashmediaplayer-encodeboxes').css('opacity', '0.5');
		kgvid_redraw_encode_checkboxes(movieurl, postID, 'queue');
		jQuery('#attachments-'+postID+'-kgflashmediaplayer-rescanplaceholder').empty();
	});
}

function kgvid_cancel_encode(kgvid_pid, postID, video_key, format) {

	var kgflashmediaplayersecurity = document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-security]')[0].value;
	jQuery('#attachments-'+postID+'-kgflashmediaplayer-meta'+format).empty();
	jQuery('#attachments-'+postID+'-kgflashmediaplayer-meta'+format).append('<strong>Canceling</strong>');
	jQuery.post(ajaxurl, { action:"kgvid_cancel_encode", security: kgflashmediaplayersecurity, kgvid_pid: kgvid_pid, video_key: video_key, format: format } );

}

function kgvid_delete_video(movieurl, postID, format, childID) {

	var delete_for_sure = confirm("You are about to permanently delete the encoded video.\n 'Cancel' to stop, 'OK' to delete.");
	
	if ( delete_for_sure == true ) {

		jQuery('#attachments-'+postID+'-kgflashmediaplayer-encode'+format).removeAttr('disabled');
		jQuery('#attachments-'+postID+'-kgflashmediaplayer-encode').removeAttr('disabled');
		jQuery('#attachments-'+postID+'-kgflashmediaplayer-encode').css('display', 'inline');
		jQuery('#attachments-'+postID+'-kgflashmediaplayer-meta'+format).empty();
		jQuery('#attachments-'+postID+'-kgflashmediaplayer-meta'+format).append('<strong>Deleted</strong>');
		var kgflashmediaplayersecurity = document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-security]')[0].value;
		
		jQuery.post(ajaxurl, { action: "kgvid_delete_video", security: kgflashmediaplayersecurity, movieurl: movieurl, postid: postID, format: format, childid: childID }, function(data) {
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
	var kgflashmediaplayersecurity = document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-security]')[0].value;
	
	var formats = new Array("rotated", "1080", "720", "mobile", "ogg", "webm");
	var kgvid_encode = new Object();
	jQuery.each(formats, function(key,formats) {
		kgvid_encode[formats] = "";
		if ( jQuery('#attachments-'+postID+'-kgflashmediaplayer-encode'+formats).length > 0) { 
			kgvid_encode[formats] = document.getElementById('attachments-'+postID+'-kgflashmediaplayer-encode'+formats).checked;		
		}
	});
	JSON.stringify(kgvid_encode);

	jQuery.post(ajaxurl, { action:"kgvid_generate_encode_checkboxes", security: kgflashmediaplayersecurity, movieurl: movieurl, post_id: postID, page: page, encodeformats: kgvid_encode }, function(data) {
			jQuery('#attachments-'+postID+'-kgflashmediaplayer-encodeboxes').empty();
			jQuery('#attachments-'+postID+'-kgflashmediaplayer-encodeboxes').append(data.embed_display);
			if ( page == "queue" ) {
				jQuery('tr.currently_encoding').removeClass('currently_encoding');
				jQuery('[id^=clear]').css("display", "block");
				if ( data.embed_display.indexOf('Elapsed') >= 0) {
					jQuery('#clear_'+postID).css("display", "none");
					jQuery('#tr_'+postID).addClass('currently_encoding');
				}
			}
			jQuery('#attachments-'+postID+'-kgflashmediaplayer-encodeboxes').removeAttr('style');
			/* if ( page == "attachment" && data.rotate_complete == true ) {
				var width = jQuery('#attachments-'+postID+'-kgflashmediaplayer-width').val();
				var height = jQuery('#attachments-'+postID+'-kgflashmediaplayer-height').val();
				jQuery('#attachments-'+postID+'-kgflashmediaplayer-width').val(height);
				jQuery('#attachments-'+postID+'-kgflashmediaplayer-height').val(width); 
			} */
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

function kgvid_save_plugin_settings(input_obj) {
	jQuery('#setting-error-options-reset').fadeOut() //if settings were reset, clear the warning
	var kgflashmediaplayersecurity = document.getElementById("kgvid_settings_security").value;
	var setting_value = input_obj.value;
	
	if ( input_obj.type == "checkbox" ) {
		if ( input_obj.checked ) { setting_value = "on"; }
		else { setting_value = false; }
	}
	jQuery('.settings-error').fadeOut(); //clear error messages
	jQuery('.settings-save-status').remove();
	var save_span = '<span class="settings-save-status kgvid_spinner"><span class="spinner" style="display:inline-block;"></span><span class="saved" style="display:none;">Saved.</span></span>';
	if ( jQuery(input_obj).parents(".kgvid_video_app_required").length ) { jQuery(input_obj).parents(".kgvid_video_app_required").append(save_span); }
	else { jQuery(input_obj).parents("td:first").append(save_span); }
	
	if ( jQuery(input_obj).hasClass('affects_ffmpeg') == true ) { jQuery('#ffmpeg_h264_sample,#ffmpeg_output').html('Saving...');  }
	
	jQuery.post(ajaxurl, { action:"kgvid_save_settings", security: kgflashmediaplayersecurity, setting: input_obj.id, value: setting_value }, function(data) {
		jQuery(input_obj).val(data.validated_value);
		if ( data.error_message != "" ) { jQuery(input_obj).parents("td:first").append('<div class="error settings-error"><p><strong>'+data.error_message+'</strong></p>'); }
		if ( input_obj.id == "width" || input_obj.id == "height" ) {
			var dimension = "";
			if ( input_obj.id == "height" ) { dimension = parseInt(data.validated_value) + 25; }
			else { dimension = data.validated_value }
			jQuery( '#kgvid_samplevideo' ).attr( input_obj.id, dimension);
			jQuery( '.kgvid_setting_nearvid' ).width( jQuery('#width').val() );
		}
		if ( input_obj.id == "app_path" || input_obj.id == "video_app" ) {
			jQuery('#app_path').data('ffmpeg_exists', data.ffmpeg_exists)
			kgvid_hide_plugin_settings();
		}
		if ( jQuery(input_obj).hasClass('affects_player') == true ) {
			jQuery( '#kgvid_samplevideo' ).attr( 'src', function ( i, val ) { return val; }); //reload the video iframe
		}
		if ( jQuery('#app_path').data('ffmpeg_exists') == "on" && jQuery(input_obj).hasClass('affects_ffmpeg') == true ) {
			jQuery('#ffmpeg_output').html('Running test...');
			jQuery('#ffmpeg_h264_sample').html(data.encode_string);
			jQuery.post(ajaxurl, { action: "kgvid_test_ffmpeg", security: kgflashmediaplayersecurity, command: data.encode_string }, function(output) {
				jQuery('#ffmpeg_output').html(output);
			}, "html" );
		}
		jQuery( '.spinner' ).css('display', 'none');
		jQuery( '.saved').css('display', 'inline-block');
		var save_timeout = jQuery( '#wpbody-content' ).data('saving');
		if ( save_timeout != undefined ) { clearTimeout(save_timeout); }
		save_timeout = setTimeout(function(){ jQuery('.settings-save-status').remove(); jQuery( '#wpbody-content' ).removeData('saving'); },1500);
		jQuery( '#wpbody-content' ).data('saving', save_timeout);
	}, "json" );
}

function kgvid_switch_settings_tab(tab) {

	if ( tab == "general" ) {
	
		var playback_option = jQuery('#embed_method').val();
	
		jQuery("#general_tab").addClass("nav-tab-active");
		jQuery("#encoding_tab").removeClass("nav-tab-active");
		jQuery("h3:contains(Default Video Playback Settings)").show();
		jQuery("table:contains(Video player:)").show();
		jQuery(".kgvid_setting_nearvid").show();
		jQuery("table:contains(End of video image)").show();
		jQuery("h3:contains(Plugin Settings)").show();
		jQuery("table:contains(Default number of thumbnails to generate)").show();
		jQuery("h3:contains(Video Encoding Settings)").hide();
		jQuery("table:contains(Path to applications on server)").hide();
	}
	
	if ( tab == "encoding" ) {
		
		jQuery("#general_tab").removeClass("nav-tab-active");
		jQuery("#encoding_tab").addClass("nav-tab-active");
		jQuery("h3:contains(Default Video Playback Settings)").hide();
		jQuery("table:contains(Video player:)").hide();
		jQuery(".kgvid_setting_nearvid").hide();
		jQuery("table:contains(End of video image)").hide();
		jQuery("h3:contains(Plugin Settings)").hide();
		jQuery("table:contains(Default number of thumbnails to generate)").hide();
		jQuery("table:contains(XML configuration file)").hide();
		jQuery("h3:contains(The following options will only affect Flash playback)").hide();
		jQuery("h3:contains(Video Encoding Settings)").show();
		jQuery("table:contains(Path to applications on server)").show();
		
		if ( jQuery('#app_path').data('ffmpeg_exists') == "on" && jQuery('#ffmpeg_output').html() == "" ) {
			jQuery('#ffmpeg_output').html('Running test...')
			var kgflashmediaplayersecurity = document.getElementById("kgvid_settings_security").value;
			jQuery.post(ajaxurl, { action: "kgvid_test_ffmpeg", security: kgflashmediaplayersecurity, command: jQuery('#ffmpeg_h264_sample').html() }, function(output) {
				jQuery('#ffmpeg_output').html(output);
			}, "html" );
		}
	}
	
	kgvid_hide_plugin_settings();
	kgvid_hide_ffmpeg_settings();

}

function kgvid_hide_plugin_settings() {

	var playback_option = jQuery('#embed_method').val();
	var ffmpeg_exists = jQuery('#app_path').data('ffmpeg_exists');
	var general_tab = jQuery('#general_tab').hasClass('nav-tab-active');
	var encoding_tab = jQuery('#encoding_tab').hasClass('nav-tab-active');
			
	if ( playback_option != "Strobe Media Playback" || encoding_tab ) {
		jQuery("table:contains(XML configuration file)").hide();
		jQuery("h3:contains(The following options will only affect Flash playback)").hide();
	}
	if ( playback_option == "Strobe Media Playback" && general_tab ) {
		jQuery("table:contains(XML configuration file)").show();
		jQuery("h3:contains(The following options will only affect Flash playback)").show();
	}

	if ( ffmpeg_exists == "notinstalled" ) {
		jQuery(".kgvid_video_app_required").addClass("kgvid_thumbnail_overlay");
		jQuery(".kgvid_video_app_required").attr('title', 'FFMPEG or LIBAV required for these functions');
		jQuery(".kgvid_video_app_required :input").attr('disabled', 'disabled');
		jQuery("#ffmpeg_sample_div").slideUp(1000);
	
	}
	if ( ffmpeg_exists == "on" ) {
		jQuery(".kgvid_video_app_required").removeClass("kgvid_thumbnail_overlay");
		jQuery(".kgvid_video_app_required :input").removeAttr('disabled');
		jQuery(".kgvid_video_app_required").removeAttr('title');
		jQuery("#ffmpeg_sample_div").slideDown(1000);
	}
}

function kgvid_hide_ffmpeg_settings() {

	var video_app = jQuery('#video_app').val();
	
	if (video_app == "ffmpeg") {
		jQuery("tr:contains(FFMPEG legacy options)").show();
	}
	if (video_app == "avconv") {
		jQuery("tr:contains(FFMPEG legacy options)").hide();
	}
	
	jQuery('.video_app_name').html(video_app.toUpperCase());
	
	var rate_control = jQuery('#rate_control').val();
	
	if ( rate_control == "crf" ) {
		jQuery("tr:contains(Constant Rate Factors)").show();
		jQuery("tr:contains(Average Bit Rate:)").hide();
	}
	
	if ( rate_control == "abr" ) {
		jQuery("tr:contains(Constant Rate Factors)").hide();
		jQuery("tr:contains(Average Bit Rate:)").show();
	}
	
}

function kgvid_set_bitrate_display() {

	var resolutions = [1080, 720, 360];
	var multiplier = jQuery('#bitrate_multiplier').val(); 
	for (var i=0;i<resolutions.length;i++) {
		var video_width = Math.round(resolutions[i] * 1.7777);
		jQuery('#'+resolutions[i]+'_bitrate').html(Math.round(resolutions[i]*video_width*30*multiplier/1024));
	}

}

function kgvid_set_all_featured() {

	var set_for_sure = confirm("You are about to set all existing video thumbnails previously generated by this plugin as the featured images for their posts. There is no 'undo' button, so proceed at your own risk. \n 'Cancel' to stop, 'OK' to proceed.");

	if ( set_for_sure == true ) {
		var kgflashmediaplayersecurity = document.getElementById("kgvid_settings_security").value;
		jQuery('td:contains(Set all as featured)').append('<div id="set_featured_meter" class="kgvid_meter"><div class="kgvid_meter_bar" style="width:0%;"><div class="kgvid_meter_text"></div></div></div><span id="set_featured_status"> Processing...</span>');
		jQuery.post(ajaxurl, { action: "kgvid_get_set_featured", security: kgflashmediaplayersecurity }, function(count) {
			jQuery.post(ajaxurl, { action: "kgvid_set_featured", security: kgflashmediaplayersecurity });
			var interval = setInterval(function(){kgvid_check_cms_progress(count, 'set_featured')}, 1000);
			jQuery( '#wpbody-content' ).data('set_featured_interval', interval);
		}, "text" );
	}
}

function kgvid_switch_parents() {

	var new_parent = document.getElementById("thumb_parent").value;
	var old_parent = "video";
	if (new_parent == "video") { old_parent = "post"; }

	var set_for_sure = confirm("You are about to set all existing video thumbnails previously generated by this plugin as attachments of their "+new_parent+"s rather than their associated "+old_parent+"s. Proceed at your own risk. \n 'Cancel' to stop, 'OK' to proceed.");

	if ( set_for_sure == true ) {
		var kgflashmediaplayersecurity = document.getElementById("kgvid_settings_security").value;
		jQuery('td:contains(Set all parents)').append('<div id="switching_parents_meter" class="kgvid_meter"><div class="kgvid_meter_bar" style="width:0%;"><div class="kgvid_meter_text"></div></div></div><span id="switching_parents_status"> Processing...</span>');
		jQuery.post(ajaxurl, { action: "kgvid_get_switch_parents", security: kgflashmediaplayersecurity, parent: new_parent }, function(count) {
			jQuery.post(ajaxurl, { action: "kgvid_switch_parents", security: kgflashmediaplayersecurity, parent: new_parent });
			var interval = setInterval(function(){kgvid_check_cms_progress(count, 'switching_parents')}, 1000);
			jQuery( '#wpbody-content' ).data('switching_parents_interval', interval);
		}, "text" );
	}
}

function kgvid_check_cms_progress(total, cms_type) {
	var kgflashmediaplayersecurity = document.getElementById("kgvid_settings_security").value;
	var interval = jQuery( '#wpbody-content' ).data(cms_type+'_interval');
	if ( interval != "" ) {
		jQuery.post(ajaxurl, { action: "kgvid_update_cms_progress", security: kgflashmediaplayersecurity, total: total, cms_type: cms_type }, function(remaining) {
			var percent_done = Math.round(parseInt(total-remaining)/parseInt(total)*100)+'%';
			jQuery('#'+cms_type+'_meter .kgvid_meter_bar').css('width', percent_done);
			jQuery('#'+cms_type+'_meter .kgvid_meter_text').html(total-remaining+'/'+total)
			if ( remaining == 0 ) {
				clearInterval(interval); 
				jQuery( '#wpbody-content' ).data(cms_type+'_interval', '');
				jQuery( '#'+cms_type+'_status' ).html(' Complete');
				setTimeout(function(){ jQuery('#'+cms_type+'_meter, #'+cms_type+'_status').fadeOut("normal", function(){ jQuery(this).remove(); }); }, 3000);
			}
		}, "text" );
	}
}

function kgvid_update_ffmpeg_options() {

		var kgflashmediaplayersecurity = document.getElementById("kgvid_settings_security").value;
		
		jQuery('#ffmpeg_output').html('');
		var old_string = jQuery('#ffmpeg_h264_sample').html();
		var video_path = old_string.match(/'(.*?)'/g);
		
		var nice_text = "";
		if ( jQuery('#nice').is(':checked') ) {
			nice_text = "nice ";
		}
		
		var vpre_flags = "";
		if ( jQuery('#ffmpeg_vpre').is(':checked') == true ) { vpre_flags = '-vpre fast -vpre ipod640'; }
		console.log(vpre_flags)
		
		if ( jQuery('#video_app').val() == "avconv" || jQuery('#video_bitrate_flag').is(':checked') == false ) { 
			var video_bitrate_flag = "b:v";
			var audio_bitrate_flag = "b:a";
			var profile_flag = "profile:v";
			var level_flag = "level:v";
			var qscale_flag = "q:v";
		}
		
		else { 
			var video_bitrate_flag = "b";
			var audio_bitrate_flag = "ab";
			var profile_flag = "profile";
			var level_flag = "level";
			var qscale_flag = "qscale";
		}
		
		var movflags = "";
		if ( jQuery('#moov').val() == "movflag" ) {
			movflags = " -movflags faststart";
		}
		
		var rate_control = jQuery('#rate_control').val();
		if ( rate_control == "crf" ) {
			rate_control_flag = " -crf "+jQuery('#x264_CRF').val();
		}
		else {
			rate_control_flag = " -"+video_bitrate_flag+" "+jQuery('#360_bitrate').html()+"k";
		}
		
		var profile_text = "";
		if ( jQuery('#h264_profile').val() != "none" ) {
			profile_text = " -"+profile_flag+" "+jQuery('#h264_profile').val();
		}
		
		var level_text = "";
		if ( jQuery('#h264_level').val() != "none" ) {
			level_text = " -"+level_flag+" "+jQuery('#h264_level').val();
		}
			
		var new_string = nice_text+jQuery('#app_path').val()+"/"+jQuery('#video_app').val()+" -y -i "+video_path[0]+" -acodec libfaac -"+audio_bitrate_flag+" "+jQuery('#audio_bitrate').val()+"k -s 640x360 -vcodec libx264 "+vpre_flags+" -threads "+jQuery('#threads').val()+rate_control_flag+movflags+profile_text+level_text+" "+video_path[1];
		
		jQuery('#ffmpeg_h264_sample').html(new_string);
		
		jQuery.post(ajaxurl, { action: "kgvid_test_ffmpeg", security: kgflashmediaplayersecurity, command: new_string }, function(output) {
			jQuery('#ffmpeg_output').html(output);
		}, "html" );
}