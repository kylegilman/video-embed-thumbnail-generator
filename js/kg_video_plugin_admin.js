var kgthumbnailTimeout = new Array();
var kgstopthumb;

function kg_set_dimension(postID, valuetochange, currentvalue) {
	var kg_aspect = (document.getElementById('attachments['+postID+'][kgflashmediaplayer-aspect]').value);
	var changeaspect = kg_aspect;
	if (valuetochange == "width") { changeaspect = 1/kg_aspect; }
	var changedvalue = Math.round(currentvalue*changeaspect);
	if (document.getElementById('attachments_'+postID+'_kgflashmediaplayer-lockaspect').checked == true && changedvalue != 0) { 
		document.getElementById('attachments_'+postID+'_kgflashmediaplayer-'+valuetochange).value = changedvalue; 
	}
	if(postID != "singleurl") { 
		document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-widthsave]')[0].value = document.getElementById('attachments_'+postID+'_kgflashmediaplayer-width').value;
		document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-heightsave]')[0].value = document.getElementById('attachments_'+postID+'_kgflashmediaplayer-height').value;
	}
}

function kg_set_aspect(postID, checked) {
	if (checked) { document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-aspect]')[0].value = document.getElementById('attachments_'+postID+'_kgflashmediaplayer-height').value / document.getElementById('attachments_'+postID+'_kgflashmediaplayer-width').value; 
	}
}

function kg_generate_thumb(postID, buttonPushed) {

	var kgflashmediaplayersecurity = document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-security]')[0].value;
	var kg_encode1080 = document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-encode1080]')[0].value;
	var kg_encode720 = document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-encode720]')[0].value;
	var kg_encodemobile = document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-encodemobile]')[0].value;
	var kg_encodeogg = document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-encodeogg]')[0].value;
	var kg_encodewebm = document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-encodewebm]')[0].value;
	var attachmentURL = document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-url]')[0].value;
	var howmanythumbs = document.getElementById('attachments_'+postID+'_numberofthumbs').value;
	var firstframethumb = document.getElementById('attachments_'+postID+'_firstframe').checked;
	var posterurl = document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-poster]')[0].value;
	var specifictimecode = document.getElementsByName('attachments['+postID+'][thumbtime]')[0].value;
	if (specifictimecode === "0") { specifictimecode = "firstframe"; }
	var thumbnailplaceholderid = "#attachments_"+postID+"_thumbnailplaceholder";
	var encodeplaceholderid = "#attachments_"+postID+"_encodeplaceholder";
	var encodeprogressplaceholderid = "#attachments_"+postID+"_encodeprogressplaceholder";
	var altembedselectid = "#attachments_"+postID+"_altembedselect";
	var thumbnailboxID = "#attachments_"+postID+"_kgflashmediaplayer-thumbnailbox";
	var thumbnailboxoverlayID = "#attachments_"+postID+"_kgflashmediaplayer-thumbnailboxoverlay";
	var cancelthumbdivID = '#attachments_'+postID+'_kgflashmediaplayer-cancelthumbsdiv';
	var widthID = 'attachments_'+postID+'_kgflashmediaplayer-width';
	var heightID = 'attachments_'+postID+'_kgflashmediaplayer-height';
	var widthsaveID = 'attachments['+postID+'][kgflashmediaplayer-widthsave]';
	var heightsaveID = 'attachments['+postID+'][kgflashmediaplayer-heightsave]';
	var maxwidthID = 'attachments['+postID+'][kgflashmediaplayer-maxwidth]';
	var maxheightID = 'attachments['+postID+'][kgflashmediaplayer-maxheight]';
	kgstopthumb = false;
	var i=1;
	var increaser = 0;
	var iincreaser = 0;

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
		jQuery(thumbnailplaceholderid).append('<strong>Choose Thumbnail: </strong><div style="display:inline-block;" id="attachments_'+postID+'_kgflashmediaplayer-cancelthumbsdiv" name="attachments_'+postID+'_kgflashmediaplayer-cancelthumbsdiv">	<input type="button" id="attachments_'+postID+'_kgflashmediaplayer-cancelencode" class="button-secondary" value="Cancel Generating" name="attachments_'+postID+'_cancelencode" onclick="kg_cancel_thumbs(\''+postID+'\');kgstopthumb=true;"></div><div id="attachments_'+postID+'_kgflashmediaplayer-thumbnailboxoverlay" name="attachments_'+postID+'_kgflashmediaplayer-thumbnailboxoverlay" class="kg_thumbnail_overlay"><div name="attachments_'+postID+'_kgflashmediaplayer-thumbnailbox" id="attachments_'+postID+'_kgflashmediaplayer-thumbnailbox" class="kg_thumbnail_box"></div></div>');
	}

	if (buttonPushed == "enqueue") {
		jQuery(encodeplaceholderid).empty();
		jQuery(encodeprogressplaceholderid).empty();
		jQuery(encodeplaceholderid).append('<strong>Loading...</strong>');
	}

	function kg_do_post() {

		iincreaser = i + increaser;

		jQuery.post(ajaxurl, { action:"kg_callffmpeg", security: kgflashmediaplayersecurity, movieurl: attachmentURL, numberofthumbs: howmanythumbs, thumbnumber:i, thumbnumberplusincreaser:iincreaser, ffmpeg_action: actionName, encode1080: kg_encode1080, encode720: kg_encode720, encodemobile: kg_encodemobile, encodeogg: kg_encodeogg, encodewebm: kg_encodewebm, attachmentID: postID, generate_button: buttonPushed, thumbtimecode: specifictimecode, dofirstframe: firstframethumb, poster: posterurl }, function(data) { 
	
			if (actionName == "generate") {
				jQuery(thumbnailboxID).append(data.thumbnaildisplaycode);
				var thumbnailselectID = "#attachments_"+postID+"_thumb"+i;
				jQuery(thumbnailselectID).css({display:"none"});
				//jQuery(thumbnailselectID).fadeIn(1000);
				jQuery(thumbnailselectID).animate({opacity: 'toggle', height: 'toggle', width: 'toggle'}, 1000);
				//jQuery(thumbnailselectID).animate({display:"inline-block"}, 2000);
				if (data.lastthumbnumber != "break" && kgstopthumb == false) { i = parseInt(data.lastthumbnumber); }
				else { i = howmanythumbs + 1; }
				increaser++;
				if ( i <= howmanythumbs ) { kgthumbnailTimeout[i] = setTimeout(function(){kg_do_post()}, 750); }
				else { 
					jQuery(thumbnailboxoverlayID).fadeTo(2000, 1);
					jQuery(cancelthumbdivID).animate({opacity: 0}, 500);
				}

				kg_aspect = data.movie_height/data.movie_width;
				document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-aspect]')[0].value = kg_aspect;
				if (parseInt(data.movie_width) < parseInt(document.getElementsByName(maxwidthID)[0].value) ) { document.getElementById(widthID).value = data.movie_width; }
				else { document.getElementsByName(widthID)[0].value = document.getElementsByName(maxwidthID)[0].value; }
				if (parseInt(data.movie_width) > parseInt(document.getElementsByName(maxwidthID)[0].value) ) { document.getElementById(heightID).value = Math.round(kg_aspect*parseInt(document.getElementsByName(maxwidthID)[0].value)); } 
				else { document.getElementsByName(heightID)[0].value = data.movie_height; }
				if(postID != "singleurl") { 
					document.getElementsByName(widthsaveID)[0].value = document.getElementById(widthID).value;
					document.getElementsByName(heightsaveID)[0].value = document.getElementById(heightID).value;
				}
				jQuery.post( ajaxurl , { action:"kg_schedule_cleanup_generated_files", security:kgflashmediaplayersecurity, thumbs:"true" } );
			}//if thumbnail button pressed
	
			if (buttonPushed == "enqueue") {
				jQuery(encodeplaceholderid).empty();
				jQuery(encodeprogressplaceholderid).empty();
				jQuery(encodeplaceholderid).append(data.embed_display);
				//jQuery(altembedselectid).empty();
				//jQuery(altembedselectid).append(data.altembedselect);
				jQuery.post( ajaxurl , { action:"kg_ajax_encode_videos", security:kgflashmediaplayersecurity } , function(data) {
					jQuery(encodeprogressplaceholderid).empty();
					jQuery(encodeplaceholderid).append(data.embed_display);
					jQuery.post( ajaxurl , { action:"kg_schedule_cleanup_generated_files", security:kgflashmediaplayersecurity, logfile:data.logfile } );
				}, "json");
				/*if ( data.encode_anything == "true" ) {
					var kg_start_time = new Date().getTime(); 
					
					if (data.serverOS != "windows" ) { 
						jQuery(encodeprogressplaceholderid).append('<div class="meter"><span style="width:0%;"></span></div>');
						setTimeout(function(){kg_check_encode_progress(postID, data.pid, data.logfile, data.movie_duration, data.altembedselect, kg_start_time)}, 1000);
					}
					else { //if it's Windows skip the progress bar
						jQuery(encodeprogressplaceholderid).append('<div class="meter_finished"><span style="width:100%;">100%</span></div>');
						jQuery(encodeplaceholderid).empty();
						jQuery(encodeplaceholderid).append('<strong>Encoding Complete</strong>');
					}
				}*/
			}//if encode button pressed
		}, "json");

	}// end kg_do_post function

	kg_do_post(); //actually call the loop
}

function kg_insert_shortcode() {

	var kgflashmediaplayersecurity = document.getElementsByName('attachments[singleurl][kgflashmediaplayer-security]')[0].value;
	var url = document.getElementsByName('attachments[singleurl][kgflashmediaplayer-url]')[0].value;
	var alturl = "";

	if ( document.getElementsByName('attachments[singleurl][kgflashmediaplayer-altembed]')[0] ) { alturl = document.getElementsByName('attachments[singleurl][kgflashmediaplayer-altembed]')[0].value; }
	if ( alturl != "" ) { url = alturl; }
	var validExtensions = new Array(".flv", ".f4v", ".mp4", ".mov", ".m4v", ".webm", ".ogg", ".ogv");
	var extension;
	var extensionExists = false;
	for (extension in validExtensions) {
		if (url.indexOf(extension) != -1) { extensionExists = true; break; }
	}
	if (extensionExists == false) { alert("Please enter a URL that points to a valid video file. Video sharing sites are not supported by this plugin.\nTo embed from YouTube, Vimeo, etc, just paste the link directly into the post window and WordPress will handle the rest."); return; }

	jQuery.post(ajaxurl, { action:'kg_callffmpeg', security: kgflashmediaplayersecurity, attachmentID: 'singleurl', movieurl: url, ffmpeg_action:'submit', poster: document.getElementsByName('attachments[singleurl][kgflashmediaplayer-poster]')[0].value }, function(data) {
		jQuery('attachments_singleurl_thumbnailplaceholder').empty();
	}, "json" );

	var shortcode = "";
	if (document.getElementsByName('videotitle')[0].value != "") {
		var titlecode = unescape(document.getElementsByName('attachments[singleurl][kgflashmediaplayer-titlecode]')[0].value);
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
		shortcode += titlecode + document.getElementsByName('videotitle')[0].value + endtitlecode + '<br />';
	}
	if (url !="") {
		shortcode += ' [FMP';
		if (document.getElementsByName('attachments[singleurl][kgflashmediaplayer-poster]')[0].value !="") { shortcode += ' poster="' + document.getElementsByName("attachments[singleurl][kgflashmediaplayer-poster]")[0].value + '"'; }
		if (document.getElementsByName('attachments_singleurl_kgflashmediaplayer-width')[0].value !="") { shortcode += ' width="' + document.getElementsByName("attachments_singleurl_kgflashmediaplayer-width")[0].value + '"'; }
		if (document.getElementsByName('attachments_singleurl_kgflashmediaplayer-height')[0].value !="") { shortcode += ' height="' + document.getElementsByName("attachments_singleurl_kgflashmediaplayer-height")[0].value + '"'; }
		shortcode += ']' + url + '[/FMP] '; }
		if (document.getElementsByName('downloadlink')[0].checked) { shortcode += '<br /><a href="' + document.getElementsByName("attachments[singleurl][kgflashmediaplayer-url]")[0].value + '">Right-click or ctrl-click this link to download</a>'; }

	parent.send_to_editor(shortcode);
}

function kg_check_encode_progress_old(postID, kg_pid, kg_logfile, kg_movie_duration, kg_altembedselect, kg_start_time) {
	var encodeprogressplaceholderid = "#attachments_"+postID+"_encodeprogressplaceholder";
	var encodeplaceholderid = "#attachments_"+postID+"_encodeplaceholder";
	var altembedselectid = "#attachments_"+postID+"_altembedselect";
	var kgflashmediaplayersecurity = document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-security]')[0].value;
	var stopChecking = false;

	jQuery.post(ajaxurl, { action:"kg_check_encode_progress", security: kgflashmediaplayersecurity, pid: kg_pid, logfile: kg_logfile, movie_duration: kg_movie_duration }, function(data) {

		var display_percent = "";
		if ( data.percent_done > 7 ) { display_percent = data.percent_done+"%"; }

		var kg_current_time = new Date().getTime();
		var kg_time_elapsed = Math.round( (kg_current_time - kg_start_time) / 1000 );
		if ( kg_time_elapsed >= 60 ) {
			kg_time_elapsed_minutes = Math.floor(kg_time_elapsed/60);
			kg_time_elapsed_seconds = kg_time_elapsed%60;
			kg_time_elapsed_seconds = (kg_time_elapsed_seconds < 10) ? ("0" + kg_time_elapsed_seconds) : kg_time_elapsed_seconds;
			kg_time_elapsed_display = kg_time_elapsed_minutes+':'+kg_time_elapsed_seconds;
		}
		else { kg_time_elapsed_display = kg_time_elapsed+' seconds'; }

		if ( data.percent_done != "" && data.percent_done != "100" ) {
			if ( parseInt(data.percent_done) < 100 ) { 
				var kg_time_remaining = Math.floor( (kg_time_elapsed / (data.percent_done/100) ) - kg_time_elapsed);
				if ( kg_time_remaining >= 60 ) {
					kg_time_remaining_minutes = Math.round(kg_time_remaining/60);
					kg_time_remaining_seconds = kg_time_remaining%60;
					kg_time_remaining_seconds = (kg_time_remaining_seconds < 10) ? ("0" + kg_time_remaining_seconds) : kg_time_remaining_seconds;
					kg_time_remaining_display = kg_time_remaining_minutes+':'+kg_time_remaining_seconds;
				}
				else { kg_time_remaining_display = kg_time_remaining+' seconds'; }
				jQuery(encodeprogressplaceholderid).empty();
				jQuery(encodeprogressplaceholderid).append('<div class="meter"><span style="width:'+data.percent_done+'%;">'+display_percent+'</span></div><div class="kg_cancel_button"><input type="button" id="attachments_'+postID+'_kgflashmediaplayer-cancelencode" class="button-secondary" value="Cancel" name="attachments_'+postID+'_cancelencode" onclick="kg_cancel_encode('+kg_pid+', \''+postID+'\');"></div><div style="display:block;"><small>Elapsed: '+kg_time_elapsed_display+'. Estimated Remaining: '+kg_time_remaining_display+'. FPS:'+data.fps+'</small></div>');
			}
			else {
				jQuery(encodeprogressplaceholderid).empty();
				jQuery(encodeprogressplaceholderid).append('<div class="kg_cancel_button"><input type="button" id="attachments_'+postID+'_kgflashmediaplayer-cancelencode" class="button-secondary" value="Cancel" name="attachments_'+postID+'_cancelencode" onclick="kg_cancel_encode('+kg_pid+', \''+postID+'\');"></div><div style="display:block;"><small>Elapsed: '+kg_time_elapsed_display+'. FPS:'+data.fps+'</small></div>');
			}
		}

		if (data.other_message != "") { 
			clearTimeout(percent_timeout);
			stopChecking = true;
			jQuery(encodeplaceholderid).empty();
			jQuery(encodeplaceholderid).append('<strong>Encoding Halted</strong>');
			jQuery(encodeprogressplaceholderid).empty();
			jQuery(encodeprogressplaceholderid).append('<strong><span style="color:red;">Message from FFMPEG: '+data.other_message+'</span></strong>');
		}

		if ( data.percent_done == "100" ) { 
			clearTimeout(percent_timeout);
			stopChecking = true;
			//delete window.kg_start_time_over;
			jQuery(encodeprogressplaceholderid).empty();
			jQuery(encodeprogressplaceholderid).append('<div class="meter_finished"><span style="width:100%;">100%</span></div><div style="display:block;"><small>Elapsed: '+kg_time_elapsed_display+'. Estimated Remaining: 0 seconds.</small></div>');
			jQuery(encodeplaceholderid).empty();
			jQuery(encodeplaceholderid).append('<strong>Encoding Complete</strong>');
		}
		//jQuery(encodeplaceholderid).empty();
		//jQuery(encodeplaceholderid).append(data.embed_display);

		if ( data.fps !== "" ) { 
			var kg_timetowait = Math.round(30000/parseInt(data.fps)); 
			if (kg_timetowait < 1000) { kg_timetowait = 1000; } 
		}
		else { var kg_timetowait = 2000; }

		if ( stopChecking != true ) { 
			percent_timeout = setTimeout(function(){kg_check_encode_progress(postID, kg_pid, kg_logfile, kg_movie_duration, kg_altembedselect, kg_start_time)}, kg_timetowait);
		}

	}, "json" );
}

function kg_cancel_encode(kg_pid, postID) {

	//var kgflashmediaplayersecurity = document.getElementById('attachments['+postID+'][kgflashmediaplayer-security]').value;
	var kgflashmediaplayersecurity = document.getElementsByName('video-embed-thumbnail-generator-nonce')[0].value;
	var cancelbuttonID = 'attachments_'+postID+'_kgflashmediaplayer-cancelencode';

	document.getElementsByName(cancelbuttonID)[0].disabled = true;
	document.getElementsByName(cancelbuttonID)[0].title = "Command sent. Be patient";
	
	jQuery.post(ajaxurl, { action:"kg_cancel_encode", security: kgflashmediaplayersecurity, kg_pid: kg_pid } );

}


function kg_cancel_thumbs(postID) {
		for( key in kgthumbnailTimeout ){ clearTimeout(kgthumbnailTimeout[key]); }
		var thumbnailboxoverlayID = "#attachments_"+postID+"_kgflashmediaplayer-thumbnailboxoverlay";
		jQuery(thumbnailboxoverlayID).fadeTo(2000, 1);
		var cancelthumbdivID = '#attachments_'+postID+'_kgflashmediaplayer-cancelthumbsdiv';
		jQuery(cancelthumbdivID).animate({opacity: 0}, 500);
		jQuery(cancelthumbdivID).remove;
	}

function kg_check_encode_progress(order, format) {
	var kgflashmediaplayersecurity = document.getElementById('video-embed-thumbnail-generator-nonce').value;
	jQuery.post(ajaxurl, { action:"kg_encode_progress", security: kgflashmediaplayersecurity, video_key: order, format: format }, function(data) {
			jQuery("#"+order+"_"+format+"").empty();
			jQuery("#"+order+"_"+format+"").append(data.embed_display);
	}, "json" );
	
}

function kg_encode_queue(action, order){

	var kgflashmediaplayersecurity = document.getElementById('video-embed-thumbnail-generator-nonce').value;

	if ( action == "delete" ) {
		jQuery.post(ajaxurl, { action:"kg_clear_queue_entry", security: kgflashmediaplayersecurity, index: order }, function(data) {
			jQuery('table.widefat > tbody').empty();
			jQuery('table.widefat > tbody').append(data);
		}, "json" );
	}
	
	if ( action == "clear_completed" ) {	
		jQuery.post(ajaxurl, { action:"kg_clear_completed_queue", security: kgflashmediaplayersecurity }, function(data) {
			jQuery('table.widefat > tbody').empty();
			jQuery('table.widefat > tbody').append(data);
		}, "json" );	
	}

}

function kg_hide_plugin_settings(selected_option) {
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

function kg_hide_ffmpeg_settings(video_app) {
	if (video_app == "ffmpeg") {
		jQuery("tr:contains(FFMPEG Options)").show();
	}
	if (video_app == "avconv") {
		jQuery("tr:contains(FFMPEG Options)").hide();
	}
}