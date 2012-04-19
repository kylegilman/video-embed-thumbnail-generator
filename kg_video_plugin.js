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
		document.getElementById('attachments['+postID+'][kgflashmediaplayer-widthsave]').value = document.getElementById('attachments_'+postID+'_kgflashmediaplayer-width').value;
		document.getElementById('attachments['+postID+'][kgflashmediaplayer-heightsave]').value = document.getElementById('attachments_'+postID+'_kgflashmediaplayer-height').value;
	}
}

function kg_set_aspect(postID, checked) {
	if (checked) { document.getElementById('attachments['+postID+'][kgflashmediaplayer-aspect]').value = document.getElementById('attachments_'+postID+'_kgflashmediaplayer-height').value / document.getElementById('attachments_'+postID+'_kgflashmediaplayer-width').value; 
	}
}

function kg_generate_thumb(postID, buttonPushed) {

	var kgflashmediaplayersecurity = document.getElementById('attachments['+postID+'][kgflashmediaplayer-security]').value;
	var kg_encodemobile = document.getElementById('attachments['+postID+'][kgflashmediaplayer-encodemobile]').value;
	var kg_encodeogg = document.getElementById('attachments['+postID+'][kgflashmediaplayer-encodeogg]').value;
	var kg_encodewebm = document.getElementById('attachments['+postID+'][kgflashmediaplayer-encodewebm]').value;
	var attachmentURL = document.getElementById('attachments['+postID+'][kgflashmediaplayer-url]').value;
	var howmanythumbs = document.getElementById('attachments_'+postID+'_numberofthumbs').value;
	var firstframethumb = document.getElementById('attachments_'+postID+'_firstframe').checked;
	var posterurl = document.getElementById('attachments['+postID+'][kgflashmediaplayer-poster]').value;
	var specifictimecode = document.getElementById('attachments['+postID+'][thumbtime]').value;
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

	if (buttonPushed != "encode") {

		jQuery(thumbnailplaceholderid).empty();
		jQuery(thumbnailplaceholderid).append('<strong>Choose Thumbnail: </strong><div style="display:inline-block;" id="attachments_'+postID+'_kgflashmediaplayer-cancelthumbsdiv" name="attachments_'+postID+'_kgflashmediaplayer-cancelthumbsdiv">	<input type="button" id="attachments_'+postID+'_kgflashmediaplayer-cancelencode" class="button-secondary" value="Cancel Generating" name="attachments_'+postID+'_cancelencode" onclick="kg_cancel_thumbs(\''+postID+'\');kgstopthumb=true;"></div><div id="attachments_'+postID+'_kgflashmediaplayer-thumbnailboxoverlay" name="attachments_'+postID+'_kgflashmediaplayer-thumbnailboxoverlay" class="kg_thumbnail_overlay"><div name="attachments_'+postID+'_kgflashmediaplayer-thumbnailbox" id="attachments_'+postID+'_kgflashmediaplayer-thumbnailbox" class="kg_thumbnail_box"></div></div>');
	}

	if (buttonPushed == "encode") {
		jQuery(encodeplaceholderid).empty();
		jQuery(encodeprogressplaceholderid).empty();
		jQuery(encodeplaceholderid).append('<strong>Encoding...</strong>');
	}

	function kg_do_post() {

		iincreaser = i + increaser;

		jQuery.post(ajaxurl, { action:"kg_callffmpeg", security: kgflashmediaplayersecurity, movieurl: attachmentURL, numberofthumbs: howmanythumbs, thumbnumber:i, thumbnumberplusincreaser:iincreaser, ffmpeg_action: actionName, encodemobile: kg_encodemobile, encodeogg: kg_encodeogg, encodewebm: kg_encodewebm, attachmentID: postID, generate_button: buttonPushed, thumbtimecode: specifictimecode, dofirstframe: firstframethumb, poster: posterurl }, function(data) { 
	
			if (buttonPushed != "encode") {
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
				document.getElementById('attachments['+postID+'][kgflashmediaplayer-aspect]').value = kg_aspect;
				if (parseInt(data.movie_width) < parseInt(document.getElementById(maxwidthID).value) ) { document.getElementById(widthID).value = data.movie_width; }
				else { document.getElementById(widthID).value = document.getElementById(maxwidthID).value; }
				if (parseInt(data.movie_width) > parseInt(document.getElementById(maxwidthID).value) ) { document.getElementById(heightID).value = Math.round(kg_aspect*parseInt(document.getElementById(maxwidthID).value)); } 
				else { document.getElementById(heightID).value = data.movie_height; }
				if(postID != "singleurl") { 
					document.getElementById(widthsaveID).value = document.getElementById(widthID).value;
					document.getElementById(heightsaveID).value = document.getElementById(heightID).value;
				}
				jQuery.post( ajaxurl ,  { action:"kg_schedule_cleanup_generated_files", security:kgflashmediaplayersecurity, thumbs:"true" } );
			}
	
			if (buttonPushed == "encode") {
				jQuery(encodeplaceholderid).empty();
				jQuery(encodeprogressplaceholderid).empty();
				jQuery(encodeplaceholderid).append(data.embed_display);
				jQuery(altembedselectid).empty();
				jQuery(altembedselectid).append(data.altembedselect);
				if ( data.encode_anything == "true" ) {
					var kg_start_time = new Date().getTime(); 
					jQuery.post( ajaxurl ,  { action:"kg_schedule_cleanup_generated_files", security:kgflashmediaplayersecurity, logfile:data.logfile } );
					if (data.serverOS != "windows" ) { 
						jQuery(encodeprogressplaceholderid).append('<div class="meter"><span style="width:0%;"></span></div>');
						setTimeout(function(){kg_check_encode_progress(postID, data.pid, data.logfile, data.movie_duration, data.altembedselect, kg_start_time)}, 1000);
					}
					else { //if it's Windows skip the progress bar
						jQuery(encodeprogressplaceholderid).append('<div class="meter_finished"><span style="width:100%;">100%</span></div>');
						jQuery(encodeplaceholderid).empty();
						jQuery(encodeplaceholderid).append('<strong>Encoding Complete</strong>');
					}
				}
			}
		}, "json");

	}// end kg_do_post function

	kg_do_post(); //actually call the loop
}

function kg_insert_shortcode() {

	var kgflashmediaplayersecurity = document.getElementById('attachments[singleurl][kgflashmediaplayer-security]').value;
	var url = document.getElementById('attachments[singleurl][kgflashmediaplayer-url]').value;
	var alturl = "";

	if ( document.getElementById('attachments[singleurl][kgflashmediaplayer-altembed]') ) { alturl = document.getElementById('attachments[singleurl][kgflashmediaplayer-altembed]').value; }
	if ( alturl != "" ) { url = alturl; }
	var validExtensions = new Array(".flv", ".f4v", ".mp4", ".mov", ".m4v", ".webm", ".ogg", ".ogv");
	var extension;
	var extensionExists = false;
	for (extension in validExtensions) {
		if (url.indexOf(extension) != -1) { extensionExists = true; break; }
	}
	if (extensionExists == false) { alert("Please enter a URL that points to a valid video file. Video sharing sites are not supported by this plugin.\nTo embed from YouTube, Vimeo, etc, just paste the link directly into the post window and WordPress will handle the rest."); return; }

	jQuery.post(ajaxurl, { action:'kg_callffmpeg', security: kgflashmediaplayersecurity, attachmentID: 'singleurl', movieurl: url, ffmpeg_action:'submit', poster: document.getElementById('attachments[singleurl][kgflashmediaplayer-poster]').value }, function(data) {
		jQuery('attachments_singleurl_thumbnailplaceholder').empty();
	}, "json" );

	var shortcode = "";
	if (document.getElementById('videotitle').value != "") { shortcode += '<strong>' + document.getElementById('videotitle').value + '</strong><br />'; }
	if (url !="") {
		shortcode += ' [FMP';
		if (document.getElementById('attachments[singleurl][kgflashmediaplayer-poster]').value !="") { shortcode += ' poster="' + document.getElementById("attachments[singleurl][kgflashmediaplayer-poster]").value + '"'; }
		if (document.getElementById('attachments_singleurl_kgflashmediaplayer-width').value !="") { shortcode += ' width="' + document.getElementById("attachments_singleurl_kgflashmediaplayer-width").value + '"'; }
		if (document.getElementById('attachments_singleurl_kgflashmediaplayer-height').value !="") { shortcode += ' height="' + document.getElementById("attachments_singleurl_kgflashmediaplayer-height").value + '"'; }
		shortcode += ']' + url + '[/FMP] '; }
		if (document.getElementById('downloadlink').checked) { shortcode += '<br /><a href="' + document.getElementById("attachments[singleurl][kgflashmediaplayer-url]").value + '">Right-click or ctrl-click this link to download</a>'; }

	parent.send_to_editor(shortcode);
}

function kg_check_encode_progress(postID, kg_pid, kg_logfile, kg_movie_duration, kg_altembedselect, kg_start_time) {
	var encodeprogressplaceholderid = "#attachments_"+postID+"_encodeprogressplaceholder";
	var encodeplaceholderid = "#attachments_"+postID+"_encodeplaceholder";
	var altembedselectid = "#attachments_"+postID+"_altembedselect";
	var kgflashmediaplayersecurity = document.getElementById('attachments['+postID+'][kgflashmediaplayer-security]').value;
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

	var kgflashmediaplayersecurity = document.getElementById('attachments['+postID+'][kgflashmediaplayer-security]').value;
	var cancelbuttonID = 'attachments_'+postID+'_kgflashmediaplayer-cancelencode';

	document.getElementById(cancelbuttonID).disabled = true;
	document.getElementById(cancelbuttonID).title = "Command sent. Be patient";
	
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