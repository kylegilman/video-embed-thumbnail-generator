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
			document.getElementById('attachments-'+postID+'-thumbgenerate').value = kgvidL10n.wait;
			document.getElementById('attachments-'+postID+'-thumbrandomize').value = kgvidL10n.wait;
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

function kgvid_convert_to_timecode(time) {

	var minutes = Math.floor(time / 60);
	var seconds = Math.round((time - (minutes * 60))*100)/100;
	if (minutes < 10) {minutes = "0"+minutes;}
	if (seconds < 10) {seconds = "0"+seconds;}
	var time_display = minutes+':'+seconds;
	return time_display;

}

function kgvid_convert_from_timecode(timecode) {

	var timecode_array = timecode.split(":");
	timecode_array = timecode_array.reverse();
	if ( timecode_array[1] ) { timecode_array[1] = timecode_array[1] * 60; }
	if ( timecode_array[2] ) { timecode_array[2] = timecode_array[2] * 3600; }
	var thumbtimecode = 0;
	jQuery.each(timecode_array,function() {
		thumbtimecode += parseFloat(this);
	});
	return thumbtimecode;

}

function kgvid_break_video_on_close(postID) {

	var video = document.getElementById('thumb-video-'+postID);

	if ( video != null ) {

		var playButton = jQuery(".kgvid-play-pause");

		playButton.off("click.kgvid");
		video.preload = "none";
		video.src = "";
		video.load();
		jQuery(video).data('setup', false);
		jQuery(video).data('busy', false);
	}

};

function kgvid_thumb_video_loaded(postID) { //sets up mini custom player for making thumbnails

	var video = document.getElementById('thumb-video-'+postID);

	if ( video != null ) {
		var crossDomainTest = jQuery.get( video.currentSrc )
			.fail( function(){
				jQuery('#thumb-video-'+postID+'-container').hide();
				jQuery('#thumb-video-'+postID).data('allowed', 'off');
				kgvid_break_video_on_close(postID);
			});
	}

	jQuery('#attachments-'+postID+'-thumbgenerate').prop('disabled', false).attr('title', '');
	jQuery('#attachments-'+postID+'-thumbrandomize').prop('disabled', false).attr('title', '');
	jQuery('#attachments-'+postID+'-kgflashmediaplayer-numberofthumbs').prop('disabled', false).attr('title', '');

	if ( jQuery('#thumb-video-'+postID+'-player .mejs-container').attr('id') !== undefined ) {  //this is the Media Library pop-up introduced in WordPress 4.0
		var mep_id = jQuery('#thumb-video-'+postID+'-player .mejs-container').attr('id');
		mejs.players[mep_id].remove();
		var current_source = video.currentSrc;
		video.src = current_source.split("?")[0];
		video.load();
	}

	jQuery('#thumb-video-'+postID+'-container').show();

	if ( video != null && jQuery(video).data('setup') != true ) {

		if ( typeof wp !== 'undefined' ) {
			ed_id = wp.media.editor.id();
			var ed_media = wp.media.editor.get( ed_id ); // Then we try to first get the editor
			ed_media = 'undefined' != typeof( ed_media ) ? ed_media : wp.media.editor.add( ed_id ); // If it hasn't been created yet, we create it

			if ( ed_media ) {
				ed_media.on( 'escape',
				function(postID) {
					return function() {
						if ( jQuery('#show-thumb-video-'+postID+' :nth-child(2)').html() == kgvidL10n.hidevideo ) {
							kgvid_reveal_thumb_video(postID);
						}
						//kgvid_break_video_on_close(postID);
					}
				}(postID) );
			}
		}

		video.removeAttribute("controls");
		video.muted=true;

		var playButton = jQuery(".kgvid-play-pause");
		var seekBar = jQuery(".kgvid-seek-bar");
		var playProgress = jQuery(".kgvid-play-progress");
		var seekHandle = jQuery(".kgvid-seek-handle");

		playButton.on("click.kgvid", function() {
		  if (video.paused == true) {
			// Play the video
			video.play();
		  }
		  else {
			// Pause the video
			video.pause();
		  }
		});

		video.addEventListener('play', function() {
			playButton.addClass('kgvid-playing');
		});

		video.addEventListener('pause', function() {
			playButton.removeClass('kgvid-playing');
		});

		//update HTML5 video current play time
		video.addEventListener('timeupdate', function() {
		   var currentPos = video.currentTime; //Get currenttime
		   var maxduration = video.duration; //Get video duration
		   var percentage = 100 * currentPos / maxduration; //in %
		   playProgress.css('width', percentage+'%');
		   seekHandle.css('left', percentage+'%');
		});

		var timeDrag = false;   /* Drag status */
		seekBar.mousedown(function(e) {
			video.pause();

		   timeDrag = true;
		   updatebar(e.pageX);
		});
		jQuery(document).mouseup(function(e) {
		   if(timeDrag) {
			  timeDrag = false;
			  updatebar(e.pageX);
		   }
		});
		jQuery(document).mousemove(function(e) {
		   if(timeDrag) {
			  updatebar(e.pageX);
		   }
		});
		//update Progress Bar control
		var updatebar = function(x) {
		   var maxduration = video.duration; //Video duraiton
		   var position = x - seekBar.offset().left; //Click pos
		   var percentage = 100 * position / seekBar.width();
		   //Check within range
		   if(percentage > 100) {
			  percentage = 100;
		   }
		   if(percentage < 0) {
			  percentage = 0;
		   }
		   //Update progress bar and video currenttime
		   playProgress.css('width', percentage+'%');
		   seekHandle.css('left', percentage+'%');
		   video.currentTime = maxduration * percentage / 100;
		};

		jQuery(video).data('setup', true);
		if ( jQuery(video).data('busy') != true ) { kgvid_break_video_on_close(postID); }
	}
}

function kgvid_reveal_thumb_video(postID) {
	jQuery('#show-thumb-video-'+postID+' :first').toggleClass( 'kgvid-down-arrow kgvid-right-arrow' );
	var text = jQuery('#show-thumb-video-'+postID+' :nth-child(2)');
	video = document.getElementById('thumb-video-'+postID);

	if ( text.html() == kgvidL10n.choosefromvideo ) { //video is being revealed
		jQuery(video).data('busy', true);
		jQuery(video).removeAttr('src');
		jQuery(video).attr("preload", "metadata");
		video.load();

		setTimeout(function(){ //wait for video to start loading

			if ( video.networkState == 1 || video.networkState == 2 ) {
				text.html(kgvidL10n.hidevideo);
				jQuery('#attachments-'+postID+'-thumbnailplaceholder').empty();
				jQuery('#thumb-video-'+postID).on('timeupdate.kgvid', function() {
					if (document.getElementById('thumb-video-'+postID).currentTime != 0) {
					   var thumbtimecode = kgvid_convert_to_timecode(document.getElementById('thumb-video-'+postID).currentTime);
					   jQuery('#attachments-'+postID+'-kgflashmediaplayer-thumbtime').val(thumbtimecode);
					}
				});
			}
			else { text.html(kgvidL10n.cantloadvideo); }

		}, 1000);
	}
	else { //video is being hidden

		video.pause();
		jQuery('#thumb-video-'+postID).off('timeupdate.kgvid');
		kgvid_break_video_on_close(postID);
		text.html(kgvidL10n.choosefromvideo);

	}
	jQuery('#thumb-video-'+postID+'-player').animate({opacity: 'toggle', height: 'toggle'}, 500);
	jQuery('#generate-thumb-'+postID+'-container').animate({opacity: 'toggle', height: 'toggle'}, 500);

}

function kgvid_generate_thumb(postID, buttonPushed) {

	var kgflashmediaplayersecurity = document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-security]')[0].value;
	var attachmentURL = document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-url]')[0].value;
	var howmanythumbs = document.getElementById('attachments-'+postID+'-kgflashmediaplayer-numberofthumbs').value;
	var firstframethumb = document.getElementById('attachments-'+postID+'-firstframe').checked;
	var posterurl = document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-poster]')[0].value;

	var specifictimecode = document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-thumbtime]')[0].value;
	if (specifictimecode === "0") { specifictimecode = "firstframe"; firstframethumb = true; }
	if (buttonPushed == "random" || howmanythumbs > 1) { specifictimecode = 0; }
	if (specifictimecode != 0 ) { howmanythumbs = 1; }

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
	jQuery(thumbnailplaceholderid).append('<strong>'+kgvidL10n.choosethumbnail+' </strong><div style="display:inline-block;" id="attachments-'+postID+'-kgflashmediaplayer-cancelthumbsdiv" name="attachments-'+postID+'-kgflashmediaplayer-cancelthumbsdiv"> <input type="button" id="attachments-'+postID+'-kgflashmediaplayer-cancelencode" class="button-secondary" value="Cancel Generating" name="attachments-'+postID+'-cancelencode" onclick="kgvid_cancel_thumbs(\''+postID+'\');"></div><div id="attachments-'+postID+'-kgflashmediaplayer-thumbnailboxoverlay" name="attachments-'+postID+'-kgflashmediaplayer-thumbnailboxoverlay" class="kgvid_thumbnail_overlay"><div name="attachments-'+postID+'-kgflashmediaplayer-thumbnailbox" id="attachments-'+postID+'-kgflashmediaplayer-thumbnailbox" class="kgvid_thumbnail_box"></div></div>');

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
				jQuery(cancelthumbdivID).animate({opacity: 'toggle', height: 'toggle'}, 500);
				jQuery(thumbnailplaceholderid).data("kgthumbnailTimeouts", null);
				jQuery(thumbnailboxID).prepend('<div id="saveallthumbs-'+postID+'-div"><input style="display:none;" type="button" id="attachments-'+postID+'-saveallthumbs" class="button-secondary kgvid-centered-block" value="'+kgvidL10n.saveallthumbnails+'" name="attachments-'+postID+'-saveallthumbs" onclick="kgvid_saveall_thumbs(\''+postID+'\');"></div>');
				jQuery('#attachments-'+postID+'-saveallthumbs').animate({opacity: 'toggle', height: 'toggle'}, 1000);
			}

			kgvid_aspect = data.movie_height/data.movie_width;
			document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-aspect]')[0].value = kgvid_aspect;

			if (parseInt(data.movie_width) < parseInt(document.getElementsByName(maxwidthID)[0].value) && jQuery('#attachments-'+postID+'-kgflashmediaplayer-width').data('minimum') != 'on' ) { document.getElementById(widthID).value = data.movie_width; }
			else { document.getElementById(widthID).value = document.getElementsByName(maxwidthID)[0].value; }
			document.getElementById(heightID).value = Math.round(kgvid_aspect*parseInt(document.getElementById(widthID).value));

			kgvid_redraw_encode_checkboxes(attachmentURL, postID, page);

		}, "json");

	}// end kgvid_do_post function

	if ( jQuery('#thumb-video-'+postID).data('allowed') == "on" && jQuery('#thumb-video-'+postID).data('setup') != undefined ) {

		video = document.getElementById('thumb-video-'+postID);
		jQuery(video).data('busy', true);

		if ( video.preload == "none" ) {
			jQuery(video).removeAttr('src');
			jQuery(video).attr("preload", "metadata");
			video.load();
			jQuery(video).on( "loadedmetadata.kgvid", function() { kgvid_make_canvas_thumbs_loop(); } );
		}
		else { kgvid_make_canvas_thumbs_loop(); }

		function kgvid_make_canvas_thumbs_loop() {

			if (video.networkState == 1 || video.networkState == 2 ) { //if the browser can load the video, use it to make thumbnails

				var video_width = video.videoWidth;
				var video_height = video.videoHeight;
				var video_aspect = video_height/video_width;
				var thumbnails = [];

				jQuery('#thumb-video-'+postID).on('seeked.kgvid', function(){ //when the video is finished seeking

					var thumbnail_saved = jQuery(video).data('thumbnail_data');
					if ( thumbnail_saved.length > 0 ) { //if there are any thumbnails that haven't been generated

						time_id = Math.round(video.currentTime*100);
						var time_display = kgvid_convert_to_timecode(video.currentTime);

						jQuery(thumbnailboxID).append('<div style="display:none;" class="kgvid_thumbnail_select" name="attachments['+postID+'][thumb'+time_id+']" id="attachments-'+postID+'-thumb'+time_id+'"><label for="kgflashmedia-'+postID+'-thumbradio'+time_id+'"><canvas class="kgvid_thumbnail" style="width:200px;height:'+Math.round(200*video_aspect)+'px;" id="'+postID+'_thumb_'+time_id+'"></canvas></label><br /><input type="radio" name="attachments['+postID+'][thumbradio'+time_id+']" id="kgflashmedia-'+postID+'-thumbradio'+time_id+'" value="'+video.currentTime+'" onchange="document.getElementById(\'attachments-'+postID+'-kgflashmediaplayer-thumbtime\').value = \''+time_display+'\'; document.getElementById(\'attachments-'+postID+'-kgflashmediaplayer-numberofthumbs\').value =\'1\';kgvid_save_canvas_thumb(\''+postID+'\', \''+time_id+'\', 1, 1);"></div>');
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
							jQuery(video).off('seeked.kgvid');
							jQuery(video).off('loadedmetadata.kgvid');
							video.preload="none";
							video.load();
							jQuery(thumbnailboxoverlayID).fadeTo(2000, 1);
							jQuery(cancelthumbdivID).animate({opacity: 0, height: 'toggle'}, 500);
							jQuery(thumbnailboxID).prepend('<div id="saveallthumbs-'+postID+'-div"><input style="display:none;" type="button" id="attachments-'+postID+'-saveallthumbs" class="button-secondary kgvid-centered-block" value="'+kgvidL10n.saveallthumbnails+'" name="attachments-'+postID+'-saveallthumbs" onclick="kgvid_saveall_thumbs(\''+postID+'\');"></div>');
							jQuery('#attachments-'+postID+'-saveallthumbs').animate({opacity: 'toggle', height: 'toggle'}, 500);
							kgvid_break_video_on_close(postID);
						}
					}

				});

				for (i; i<=howmanythumbs; i++) {
					iincreaser = i + increaser;
					increaser++;
					var movieoffset = Math.round((video.duration * iincreaser) / (howmanythumbs * 2)*100)/100;

					if (buttonPushed == "random") { //adjust offset random amount
						var random_offset = Math.round(Math.random() * video.duration / howmanythumbs);
						movieoffset = movieoffset - random_offset;
						if (movieoffset < 0) { movieoffset = 0; }
					}

					thumbnails.push(movieoffset); //add offset to array
				}

				if ( firstframethumb ) { thumbnails[0] = 0; }

				if ( specifictimecode ) {
					var thumbtimecode = kgvid_convert_from_timecode(specifictimecode);
					thumbnails = [thumbtimecode];
				}
				video.currentTime = thumbnails[0];
				jQuery(video).data('thumbnail_data', thumbnails);

			}

		}//end canvas thumb function
	}
	else {
		kgvid_do_post(); //call the FFMPEG loop if the browser can't do it
	}
}

function kgvid_select_thumbnail(thumb_url, post_id, movieoffset) {
	jQuery('[name="attachments['+post_id+'][kgflashmediaplayer-poster]"]').val(thumb_url); //get this by name because it's the same before WP v3.5
	var time_display = kgvid_convert_to_timecode(movieoffset);
	jQuery('#attachments-'+post_id+'-kgflashmediaplayer-thumbtime').val(time_display);
	jQuery('#attachments-'+post_id+'-kgflashmediaplayer-numberofthumbs').val('1');
}

function kgvid_save_canvas_thumb(postID, time_id, total, index) {

	var kgflashmediaplayersecurity = document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-security]')[0].value;

	var video_url = document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-url]')[0].value;
	var canvas = document.getElementById(postID+'_thumb_'+time_id);
	var png64dataURL = canvas.toDataURL(); //this is what saves the image. Do this after selection.

	jQuery('#attachments-'+postID+'-thumbnailplaceholder canvas').fadeTo(500, .25);
	jQuery('#attachments-'+postID+'-thumbnailplaceholder input').attr('disabled', true);
	jQuery('#attachments-'+postID+'-thumbnailplaceholder').prepend('<div class="kgvid_save_overlay">'+kgvidL10n.saving+'</div>')

	jQuery.ajax({
		type: "POST",
		url: ajaxurl,
		data: { action:"kgvid_save_html5_thumb", security: kgflashmediaplayersecurity, raw_png: png64dataURL, url: video_url, offset: time_id, postID: postID, total: total, index: index }
		})
		.done( function(thumb_url) {
			if ( total == 1 ) {
				document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-autothumb-error]')[0].value = '';
				jQuery('#attachments-'+postID+'-kgflashmediaplayer-poster').val(thumb_url).change();
				if ( pagenow == 'attachment' ) { jQuery('#publish').click(); }
			}
			else {
				kgvid_thumbnail_saveall_progress(postID, total);
			}
		})
		.fail( function(xhr, textStatus, errorThrown) {
			document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-autothumb-error]')[0].value = errorThrown;
			jQuery('#attachments-'+postID+'-thumbnailplaceholder').empty();
			jQuery('#attachments-'+postID+'-thumbnailplaceholder').html('<div class="kgvid_thumbnail_box kgvid_chosen_thumbnail_box">'+errorThrown+'</div>');
		});
}

function kgvid_thumbnail_saveall_progress(postID, total) {

		var percent_add = 100/total;
		var percent_done = parseInt(jQuery('#saving_thumbs_meter .kgvid_meter_bar')[0].style.width)+percent_add;
		var number = Math.round(percent_done/percent_add);
		jQuery('#saving_thumbs_meter .kgvid_meter_bar').css('width', percent_done+'%');
		jQuery('#saving_thumbs_meter .kgvid_meter_text').html(number+'/'+total);

		if ( number == total ) {
			jQuery('#saveallthumbs-'+postID+'-div').slideUp(1000);
			jQuery('#attachments-'+postID+'-thumbnailplaceholder .kgvid_save_overlay').fadeOut();
			jQuery('#attachments-'+postID+'-kgflashmediaplayer-thumbnailboxoverlay').fadeTo(500, 1);
			jQuery('#attachments-'+postID+'-thumbnailplaceholder input').removeAttr('disabled');
		}

}

function kgvid_saveall_thumbs(postID) {

	var kgflashmediaplayersecurity = document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-security]')[0].value;
	var thumbnails = jQuery('#attachments-'+postID+'-kgflashmediaplayer-thumbnailbox').find('.kgvid_thumbnail');
	var total = thumbnails.length;

	jQuery('#saveallthumbs-'+postID+'-div').append('<br><div style="margin:5px;" id="saving_thumbs_meter" class="kgvid_meter"><div class="kgvid_meter_bar" style="width:0%;"><div class="kgvid_meter_text"></div></div></div><span id="saving_thumbs_status"> '+kgvidL10n.saving+'</span>');

	jQuery.each(thumbnails, function(key, value) {
		if ( value.tagName.toLowerCase() == "canvas" ) {
			var time_id = value.id.split("_").pop();
			setTimeout( function(time_id, key) {
				return function() {
					kgvid_save_canvas_thumb(postID, time_id, total, key);
				}
			}(time_id, key), 0);
		}
		else { //thumbnails were made by ffmpeg

			thumb_url = value.src.split("?")[0].replace('/thumb_tmp/', '/');

			if ( isNaN(postID) ) { //dealing with an external URL
				var postid = parent.document.getElementById('post_ID').value;
			}

			setTimeout( function(thumb_url, key) {
				return function() {
					jQuery.ajax({
						type: "POST",
						url: ajaxurl,
						data: { action:'kgvid_save_thumb', security: kgflashmediaplayersecurity, post_id: postID, thumburl: thumb_url, index: key },
						async: false
						})
						.done( function(thumb_url) {
							kgvid_thumbnail_saveall_progress(postID, total);
						}
					);
				}
			}(thumb_url, key), 0);
		}
	}); //end each loop
}

function kgvid_thumb_video_manual(postID) {

	var video = document.getElementById('thumb-video-'+postID);
	var video_aspect = video.videoHeight/video.videoWidth;
	var time_id = Math.round(video.currentTime);
	var time_display = kgvid_convert_to_timecode(video.currentTime);
	document.getElementById('attachments-'+postID+'-kgflashmediaplayer-thumbtime').value = time_display;
	jQuery("#attachments-"+postID+"-thumbnailplaceholder").html('<div class="kgvid_thumbnail_box kgvid_chosen_thumbnail_box"><canvas style="height:'+Math.round(200*video_aspect)+'px;" id="'+postID+'_thumb_'+time_id+'"></canvas></div>');
	var canvas = document.getElementById(postID+'_thumb_'+time_id);
	canvas.width = video.videoWidth;
	canvas.height = video.videoHeight;
	var context = canvas.getContext('2d');
	context.fillRect(0, 0, video.videoWidth, video.videoHeight);
	context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
	kgvid_save_canvas_thumb(postID, time_id, 1, 1);

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

	var formats = new Array("fullres", "1080", "720", "mobile", "ogg", "webm", "vp9", "custom");
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
	jQuery(encodeplaceholderid).append('<strong>'+kgvidL10n.loading+'</strong>');

	jQuery.post(ajaxurl, { action:"kgvid_callffmpeg", security: kgflashmediaplayersecurity, movieurl: attachmentURL, ffmpeg_action: 'enqueue', encodeformats: kgvid_encode, attachmentID: postID, parent_id: parent_post_id }, function(data) {

		jQuery(encodeplaceholderid).empty();
		jQuery(encodeprogressplaceholderid).empty();
		jQuery(encodeplaceholderid).append(data.embed_display);
		jQuery.post( ajaxurl , { action:"kgvid_ajax_encode_videos", security:kgflashmediaplayersecurity } , function(data) {
			jQuery(encodeprogressplaceholderid).empty();
			jQuery(encodeplaceholderid).append(data.embed_display);

			setTimeout(function(){
				jQuery('#attachments-'+postID+'-kgflashmediaplayer-encodeboxes').css('opacity', '0.5');
				kgvid_redraw_encode_checkboxes(attachmentURL, postID, page);
			}, 2000);
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
	jQuery('#attachments-'+oldbasename+'-kgflashmediaplayer-encodeboxes').attr('id', 'attachments-'+basename+'-kgflashmediaplayer-encodeboxes');
	document.getElementById('attachments-'+oldbasename+'-thumbnailplaceholder').id = 'attachments-'+basename+'-thumbnailplaceholder';
	//document.getElementById('attachments-'+basename+'-thumbnailplaceholder').setAttribute("onchange", "document.getElementById('attachments-"+basename+"-kgflashmediaplayer-thumbtime').value='';");
	document.getElementById('attachments-'+basename+'-kgflashmediaplayer-numberofthumbs').setAttribute("onchange", "document.getElementById('attachments-"+basename+"-kgflashmediaplayer-thumbtime').value='';");
	jQuery('#attachments-'+basename+'-thumbgenerate').replaceWith('<input disabled="disabled" type="button" id="attachments-'+basename+'-thumbgenerate" class="button-secondary" value="'+kgvidL10n.generate+'" name="thumbgenerate" onclick="kgvid_generate_thumb(\''+basename+'\', \'generate\');" >');
	jQuery('#attachments-'+basename+'-thumbrandomize').replaceWith('<input disabled="disabled" type="button" id="attachments-'+basename+'-thumbrandomize" class="button-secondary" value="'+kgvidL10n.randomize+'" name="thumbgenerate" onclick="kgvid_generate_thumb(\''+basename+'\', \'random\');" >');
	document.getElementById('attachments-'+basename+'-kgflashmediaplayer-width').setAttribute("onchange", "kgvid_set_dimension('"+basename+"', 'height', this.value);")
	document.getElementById('attachments-'+basename+'-kgflashmediaplayer-width').setAttribute("onkeyup", "kgvid_set_dimension('"+basename+"', 'height', this.value);");
	document.getElementById('attachments-'+basename+'-kgflashmediaplayer-height').setAttribute("onchange", "kgvid_set_dimension('"+basename+"', 'width', this.value);");
	document.getElementById('attachments-'+basename+'-kgflashmediaplayer-height').setAttribute("onkeyup", "kgvid_set_dimension('"+basename+"', 'width', this.value);");
	document.getElementById('attachments-'+basename+'-kgflashmediaplayer-lockaspect').setAttribute("onclick", "kgvid_set_aspect('"+basename+"', this.checked);");
	document.getElementById('singleurl-lockaspect-label').setAttribute("for", "attachments-"+basename+"-kgflashmediaplayer-lockaspect");

	if ( document.getElementById('attachments-'+basename+'-kgflashmediaplayer-ffmpegexists').value == "on" ) {
		document.getElementById('attachments-'+basename+'-thumbgenerate').disabled = false;
		document.getElementById('attachments-'+basename+'-thumbgenerate').title = "";
		document.getElementById('attachments-'+basename+'-thumbrandomize').disabled = false;
		document.getElementById('attachments-'+basename+'-thumbrandomize').title = "";
		//document.getElementById('attachments-'+basename+'-kgflashmediaplayer-encode').disabled = false;
		document.getElementById('attachments-'+basename+'-kgflashmediaplayer-encode').title = kgvidL10n.loading;

	}
	else {
		document.getElementById('attachments-'+basename+'-thumbgenerate').title = kgvidL10n.ffmpegnotfound;
		document.getElementById('attachments-'+basename+'-thumbrandomize').title = kgvidL10n.ffmpegnotfound;
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
					if ( url != data.movieurl )  { document.getElementById('attachments-'+oldbasename+'-kgflashmediaplayer-url').value = data.movieurl; }
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
		if ( url != "" ) { alert(kgvidL10n.validurlalert); }
		basename = "singleurl";
		kgvid_change_singleurl(url, basename, oldbasename);
		document.getElementById('attachments-'+basename+'-thumbgenerate').disabled = true;
		document.getElementById('attachments-'+basename+'-thumbgenerate').title = kgvidL10n.pleasevalidurl;
		document.getElementById('attachments-'+basename+'-thumbrandomize').disabled = true;
		document.getElementById('attachments-'+basename+'-thumbrandomize').title = kgvidL10n.pleasevalidurl;
		document.getElementById('attachments-'+basename+'-kgflashmediaplayer-encode').disabled = true;
		document.getElementById('attachments-'+basename+'-kgflashmediaplayer-encode').title = kgvidL10n.pleasevalidurl;
		document.getElementById('insertonlybutton').disabled = true;
		document.getElementById('insertonlybutton').title = kgvidL10n.pleasevalidurl;
	}

}

function kgvid_insert_shortcode() {

	var basename = jQuery('#kgflashmediaplayer-table').data("kgvid_attachment_id") || "singleurl";
	var kgflashmediaplayersecurity = document.getElementsByName('attachments['+basename+'][kgflashmediaplayer-security]')[0].value;
	var url = document.getElementById('attachments-'+basename+'-kgflashmediaplayer-url').value;
	var posterurl = document.getElementById('attachments-'+basename+'-kgflashmediaplayer-poster').value;
	var postid = parent.document.getElementById('post_ID').value;
	if ( jQuery('#attachments-'+basename+'-featured').is(':checked') ) { var set_featured = "on"; }
	else { var set_featured = false; }

	jQuery.post(ajaxurl, { action:'kgvid_callffmpeg', security: kgflashmediaplayersecurity, attachmentID: basename, movieurl: url, ffmpeg_action:'submit', poster: posterurl, parent_id: postid, set_featured: set_featured }, function(data) {

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
		if (document.getElementById('attachments-'+basename+'-kgflashmediaplayer-track_src').value !="") {
			shortcode += ' track_kind="' + document.getElementById('attachments-'+basename+'-kgflashmediaplayer-track_kind').value + '"';
			shortcode += ' track_src="' + document.getElementById('attachments-'+basename+'-kgflashmediaplayer-track_src').value + '"';
			if (document.getElementById('attachments-'+basename+'-kgflashmediaplayer-track_srclang').value !="") { shortcode += ' track_srclang="' + document.getElementById('attachments-'+basename+'-kgflashmediaplayer-track_srclang').value + '"'; }
			if (document.getElementById('attachments-'+basename+'-kgflashmediaplayer-track_label').value !="") { shortcode += ' track_label="' + document.getElementById('attachments-'+basename+'-kgflashmediaplayer-track_label').value + '"'; }
			if (document.getElementById('attachments-'+basename+'-kgflashmediaplayer-track_default').value == "default") { shortcode += ' track_default="default"'; }
		}
		if (document.getElementById('downloadlink').checked ) { shortcode += ' downloadlink="true"'; }
		shortcode += ']' + url + '[/KGVID] '; }

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

function kgvid_delete_video(movieurl, postID, format, childID, blogID) {

	var delete_for_sure = confirm(kgvidL10n.deletemessage);

	if ( delete_for_sure == true ) {

		jQuery('#attachments-'+postID+'-kgflashmediaplayer-encode'+format).removeAttr('disabled');
		jQuery('#attachments-'+postID+'-kgflashmediaplayer-encode').removeAttr('disabled');
		jQuery('#attachments-'+postID+'-kgflashmediaplayer-encode').css('display', 'inline');
		jQuery('#attachments-'+postID+'-kgflashmediaplayer-meta'+format).empty();
		jQuery('#attachments-'+postID+'-kgflashmediaplayer-meta'+format).append('<strong>Deleted</strong>');
		var kgflashmediaplayersecurity = document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-security]')[0].value;

		jQuery.post(ajaxurl, { action: "kgvid_delete_video", security: kgflashmediaplayersecurity, movieurl: movieurl, postid: postID, format: format, childid: childID, blogid: blogID }, function(data) {
			jQuery('#attachments-'+postID+'-kgflashmediaplayer-encode'+format).change();
			if ( pagenow == 'settings_page_kgvid_network_video_encoding_queue-network' || pagenow == 'tools_page_kgvid_video_encoding_queue' ) { page = 'queue'; }
			else { page = 'attachment'; }
			kgvid_redraw_encode_checkboxes(movieurl, postID, page, blogID);
		}, "json" );

	}
}

function kgvid_cancel_thumbs(postID) {

		var thumbnailplaceholderid = "#attachments-"+postID+"-thumbnailplaceholder";
		var thumbnailboxoverlayID = "#attachments-"+postID+"-kgflashmediaplayer-thumbnailboxoverlay";
		var cancelthumbdivID = '#attachments-'+postID+'-kgflashmediaplayer-cancelthumbsdiv';
		var kgthumbnailTimeout = jQuery(thumbnailplaceholderid).data("kgthumbnailTimeouts");

		for( key in kgthumbnailTimeout ){ clearTimeout(kgthumbnailTimeout[key]); }
		jQuery('#thumb-video-'+postID).off('seeked.kgvid');
		jQuery('#thumb-video-'+postID).data('thumbnail_data', []);
		jQuery(thumbnailplaceholderid).data("kgthumbnailTimeouts", null);

		jQuery(thumbnailboxoverlayID).fadeTo(2000, 1);
		jQuery(cancelthumbdivID).animate({opacity: 0, height: 'toggle'}, 500);

}

function kgvid_update_encode_queue() {

	if ( pagenow == 'tools_page_kgvid_video_encoding_queue' || pagenow == 'settings_page_kgvid_network_video_encoding_queue-network' ) {
		var page = 'queue';
		var kgflashmediaplayersecurity = document.getElementsByName('attachments[kgflashmediaplayer-security]')[0].value;
	}
	else {
		var page = 'attachment';
		var checkboxes_id = jQuery('.kgvid_checkboxes_section').first().attr('id');
		if ( checkboxes_id ) {
			var post_id = checkboxes_id.match("attachments-(.*)-kgflashmediaplayer-encodeboxes");
			post_id = post_id[1];
			var kgflashmediaplayersecurity = document.getElementsByName('attachments['+post_id+'][kgflashmediaplayer-security]')[0].value;
		}
	}

	if ( page == 'queue') { var container_element = jQuery('#kgvid_encode_queue_table'); }
	else { var container_element = jQuery('#attachments-'+post_id+'-kgflashmediaplayer-encodeboxes'); }
	var encode_queue_timeouts = container_element.data('encode_queue_timeouts');
	for( key in encode_queue_timeouts ){ clearTimeout(encode_queue_timeouts[key]); }
	container_element.removeData('encode_queue_timeouts');

	if ( kgflashmediaplayersecurity ) { //sometimes this tries to run after the media modal is closed

		jQuery.post(ajaxurl, { action:"kgvid_update_encode_queue", security: kgflashmediaplayersecurity, page: page }, function(data) {

			var check_again = false;
			var queued = false;
			var time_to_wait = 5000;

			jQuery.each(data.queue, function(video_key, video_entry) {

				if ( page != "queue" && jQuery('#attachments-'+video_entry.attachmentID+'-kgflashmediaplayer-encodeboxes').length == 0 ) { return true; }

				if ( video_entry.hasOwnProperty('encode_formats') ) {

					var currently_encoding = false;

					jQuery.each(video_entry.encode_formats, function(format, format_entry) {

						if ( format_entry.status == 'encoding' ) {

							currently_encoding = true;
							check_again = true;

							if ( page == "queue" ) {

								if ( jQuery('#clear_'+video_entry.attachmentID).css("display") != "none" ) {
									jQuery('#clear_'+video_entry.attachmentID).css("display", "none");
								}
								if ( !jQuery('#tr_'+video_entry.attachmentID).hasClass('currently_encoding') ) {
									jQuery('#tr_'+video_entry.attachmentID).addClass('currently_encoding');
								}
								if ( jQuery('#tr_'+video_entry.attachmentID).hasClass('kgvid_complete') )  {
									jQuery('#tr_'+video_entry.attachmentID).removeClass('kgvid_complete');
								}

							}

						}

						if ( format_entry.status == 'queued' ) {
							queued = true;
						}

						if ( format_entry.hasOwnProperty('meta_array') ) {

							var meta_entry = jQuery('#attachments-'+video_entry.attachmentID+'-kgflashmediaplayer-meta'+format);
							var checkbox = jQuery('#attachments-'+video_entry.attachmentID+'-kgflashmediaplayer-encode'+format);

							if ( format_entry.status == 'encoding') { time_to_wait = format_entry.meta_array.time_to_wait; }

							if ( meta_entry.html() != undefined && format_entry.meta_array.meta != meta_entry.html() ) {
								check_again = true;
								meta_entry.empty();
								meta_entry.html(format_entry.meta_array.meta);
							}

							if ( format_entry.meta_array.checked != '' ) {
								checkbox.attr('checked', true);
							}
							else if ( format_entry.status == 'Encoding Complete' ) { checkbox.removeAttr('checked'); }

							if ( format_entry.meta_array.disabled != '' ) {
								checkbox.attr('disabled', true);
							}
							else { checkbox.removeAttr('disabled'); }

						}

					}); //end loop through encode formats

				}

				if ( page == 'queue' && currently_encoding == false ) {

					if ( queued == false ) { jQuery('#tr_'+video_entry.attachmentID).addClass('kgvid_complete'); }

					if ( jQuery('#tr_'+video_entry.attachmentID).hasClass('currently_encoding') ) {
						jQuery('#tr_'+video_entry.attachmentID).removeClass('currently_encoding');
					}
					if ( jQuery('#tr_'+video_entry.attachmentID+' #clear_'+video_entry.attachmentID).css("display") != "block" ) {
						jQuery('#tr_'+video_entry.attachmentID+' #clear_'+video_entry.attachmentID).css("display", "block");
					}

				}

			}); //end loop through queue

			if ( check_again == true ) {
				var encode_queue_timeouts = container_element.data('encode_queue_timeouts');
				if ( encode_queue_timeouts == null ) { encode_queue_timeouts = new Array(); }
				encode_queue_timeout = setTimeout(function(){ kgvid_update_encode_queue() }, time_to_wait);
				encode_queue_timeouts.push(encode_queue_timeout);
				container_element.data('encode_queue_timeouts', encode_queue_timeouts);
			}

		}, "json" );

	}

}

function kgvid_redraw_encode_checkboxes(movieurl, postID, page, blogID) {

	var kgflashmediaplayersecurity = jQuery('#attachments-'+postID+'-kgflashmediaplayer-security').val();

	if ( kgflashmediaplayersecurity ) { //sometimes this tries to run after the media modal is closed

		var formats = new Array("fullres", "1080", "720", "mobile", "ogg", "webm");
		var kgvid_encode = new Object();
		jQuery.each(formats, function(key,formats) {
			kgvid_encode[formats] = "";
			if ( jQuery('#attachments-'+postID+'-kgflashmediaplayer-encode'+formats).length > 0) {
				kgvid_encode[formats] = document.getElementById('attachments-'+postID+'-kgflashmediaplayer-encode'+formats).checked;
			}
		});
		JSON.stringify(kgvid_encode);

		jQuery.post(ajaxurl, { action:"kgvid_generate_encode_checkboxes", security: kgflashmediaplayersecurity, movieurl: movieurl, post_id: postID, page: page, blog_id: blogID, encodeformats: kgvid_encode }, function(data) {
			jQuery('#attachments-'+postID+'-kgflashmediaplayer-encodeboxes').empty();
			jQuery('#attachments-'+postID+'-kgflashmediaplayer-encodeboxes').append(data.checkboxes);
			if ( page == "queue" ) {
				jQuery('#tr_'+postID+'.currently_encoding').removeClass('currently_encoding');
				jQuery('#tr_'+postID+' #clear_'+postID).css("display", "block");
				if ( data.encoding == true ) {
					jQuery('#clear_'+postID).css("display", "none");
					jQuery('#tr_'+postID).addClass('currently_encoding');
				}

			}

			setTimeout( function(){ kgvid_update_encode_queue() }, 3000 ); //start the loop

			jQuery('#attachments-'+postID+'-kgflashmediaplayer-encodeboxes').removeAttr('style');
		}, "json" );
	}
}

function kgvid_redraw_thumbnail_box(postID) {

	var kgflashmediaplayersecurity = jQuery('#attachments-'+postID+'-kgflashmediaplayer-security').val();

	if ( kgflashmediaplayersecurity ) {

		jQuery.post(ajaxurl, { action:"kgvid_redraw_thumbnail_box", security: kgflashmediaplayersecurity, post_id: postID }, function(data) {
			if ( data.thumb_url ) {
				jQuery('#attachments-'+postID+'-thumbnailplaceholder').html('<div class="kgvid_thumbnail_box kgvid_chosen_thumbnail_box"><img width="200" src="'+data.thumb_url+'"></div>');
				jQuery('#attachments-'+postID+'-kgflashmediaplayer-poster').val(data.thumb_url);
				if ( data.thumbnail_size_url ) {
					basename = data.thumb_url.substring(data.thumb_url.lastIndexOf('/')+1, data.thumb_url.indexOf('_thumb'))
					jQuery('.attachment-preview.type-video:contains('+basename+')').parent().find('img')
						.attr('src', data.thumbnail_size_url)
						.css('width', '100%')
						.css('height', '100%')
						.css('padding-top', '0');
				}
				jQuery('#attachments-'+postID+'-kgflashmediaplayer-poster').change();
			}
			else if ( data.thumb_error ) { jQuery('#attachments-'+postID+'-thumbnailplaceholder').html('<div class="kgvid_thumbnail_box kgvid_chosen_thumbnail_box"><span>'+data.thumb_error+'</span></div>'); }
			else { setTimeout(function(){ kgvid_redraw_thumbnail_box(postID) }, 5000); }

		}, "json" );

	}
}

function kgvid_encode_queue(action, order, id) {

	var kgflashmediaplayersecurity = document.getElementsByName('attachments[kgflashmediaplayer-security]')[0].value;

	var CheckboxTimeout = jQuery('#wpwrap').data("KGVIDCheckboxTimeout") || null;
	if ( CheckboxTimeout ) { clearTimeout(CheckboxTimeout); }

	var scope = 'blog';
	if ( pagenow == 'settings_page_kgvid_network_video_encoding_queue-network' ) { scope = 'network' }

	if ( action == "delete" ) {
		jQuery('#tr_'+id).fadeTo('slow', 0.5);
		jQuery.post(ajaxurl, { action:"kgvid_clear_queue_entry", security: kgflashmediaplayersecurity, index: order, scope: scope }, function(data) {
			jQuery('table.widefat > tbody').replaceWith("<tbody class='rows'>"+data+"</tbody>");
		}, "html" );
	}

	if ( action == "clear_completed" ) {
		jQuery('tbody > .kgvid_complete').fadeTo('slow', 0.5);
		jQuery.post(ajaxurl, { action:"kgvid_clear_completed_queue", security: kgflashmediaplayersecurity, type:"manual", scope: scope }, function(data) {
			jQuery('table.widefat > tbody').replaceWith("<tbody class='rows'>"+data+"</tbody>");
		}, "html" );
	}

	if ( action == "clear_queued" ) {

		var clear_for_sure = confirm(kgvidL10n.clearqueuedwarning+"\n"+kgvidL10n.cancel_ok);

		if ( clear_for_sure == true ) {
			jQuery('tbody > .kgvid_queued').fadeTo('slow', 0.5);
			jQuery.post(ajaxurl, { action:"kgvid_clear_completed_queue", security: kgflashmediaplayersecurity, type:"queued", scope: scope }, function(data) {
				jQuery('table.widefat > tbody').replaceWith("<tbody class='rows'>"+data+"</tbody>");
			}, "html" );
		}

	}

}

function kgvid_save_plugin_settings(input_obj) {

	jQuery('#setting-error-options-reset').fadeOut() //if settings were reset previously, clear the warning
	jQuery('.settings-error').fadeOut(); //clear error messages

	var kgflashmediaplayersecurity = document.getElementById("kgvid_settings_security").value;
	var setting_value = input_obj.value;

	if ( input_obj.type == "checkbox" ) {
		if ( input_obj.checked ) { setting_value = "on"; }
		else { setting_value = false; }
	}

	var save_span = '<span id="save_'+input_obj.id+'" class="settings-save-status kgvid_spinner"><span class="spinner" style="display:inline-block;"></span><span class="saved" style="display:none;">'+kgvidL10n.saved+'</span></span>';
	if ( jQuery(input_obj).parents(".kgvid_video_app_required").length ) { jQuery(input_obj).parents(".kgvid_video_app_required").append(save_span); }
	else { jQuery(input_obj).parents("td:first").append(save_span); }

	if ( jQuery(input_obj).hasClass('affects_ffmpeg') == true ) { jQuery('#ffmpeg_h264_sample,#ffmpeg_output').html(kgvidL10n.saving);  }

	function kgvid_ajax_save() {

		var disabled_fields = jQuery('form :disabled'); //temporarily enable disabled fields so they can be serialized
		disabled_fields.prop('disabled', false);
		var all_settings = jQuery('form').serialize();
		disabled_fields.prop('disabled', true);

		jQuery.post(ajaxurl, { action:"kgvid_save_settings", security: kgflashmediaplayersecurity, setting: save_queue[0].id, value: setting_value, all_settings: all_settings }, function(data) {

			if ( input_obj.type != "checkbox" ) { jQuery(input_obj).val(data.validated_value); }

			if ( data.error_message != "" ) { jQuery(input_obj).parents("td:first").append('<div class="error settings-error"><p><strong>'+data.error_message+'</strong></p>'); }
			if ( save_queue[0].id == "width" || save_queue[0].id == "height" ) {
				var dimension = "";
				if ( save_queue[0].id == "height" ) { dimension = parseInt(data.validated_value) + 25; }
				else { dimension = data.validated_value }
				jQuery( '#kgvid_samplevideo' ).attr( save_queue[0].id, dimension);
				jQuery( '.kgvid_setting_nearvid' ).width( jQuery('#width').val() );
			}
			if ( save_queue[0].id == "app_path" || save_queue[0].id == "video_app" ) {
				jQuery('#app_path').val(data.app_path);
				jQuery('#app_path').data('ffmpeg_exists', data.ffmpeg_exists);
				kgvid_hide_plugin_settings();
			}
			if ( jQuery(input_obj).hasClass('affects_player') == true ) {
				jQuery( '#kgvid_samplevideo' ).attr( 'src', function ( i, val ) { return val; }); //reload the video iframe
			}

			if ( data.auto_thumb_label != "" ) {
				jQuery('#auto_thumb_label').html(data.auto_thumb_label);
				jQuery('#auto_thumb_label :input').change(function() { kgvid_save_plugin_settings(this); } );
			}

			if ( jQuery('#app_path').data('ffmpeg_exists') == "on" && jQuery(input_obj).hasClass('affects_ffmpeg') == true && jQuery('#ffmpeg_output').length != 0 ) {

				if ( jQuery('.kgvid_custom_format').filter(function() { return jQuery(this).val(); }).length == 0 ) { //if there's no custom format anymore
					if ( jQuery('#sample_format').val() == 'custom' ) { jQuery('#sample_format').val('mobile'); }
					jQuery('#sample_format').find('option[value="custom"]').remove();
				}
				else {
					if ( jQuery('#sample_format').find('option[value="custom"]').length == 0 ) { jQuery('#sample_format').append('<option value="custom">'+kgvidL10n.custom+'</option>'); }
				}

				jQuery('#ffmpeg_output').html(kgvidL10n.runningtest);
				jQuery('#ffmpeg_h264_sample').html(data.encode_string);
				jQuery('#ffmpeg_watermark_example').slideUp('slow');
				jQuery.post(ajaxurl, { action: "kgvid_test_ffmpeg", security: kgflashmediaplayersecurity }, function(data) {
					jQuery('#ffmpeg_output').html(data.output);
					if ( 'watermark_preview' in data ) {
						jQuery('#ffmpeg_watermark_example').empty().append('<img src="'+data.watermark_preview+'?'+String(Math.floor((Math.random()*1000)+1))+'" style="margin-top:10px;width:640px;">').slideDown('slow');
					}

				}, "json" );
			}

			jQuery( '#save_'+save_queue[0].id+' > .spinner' ).fadeOut(500).delay(500).next().delay(500).fadeIn(500).delay(1500).fadeOut(1000, function(){ jQuery(this).remove(); });

			save_queue = jQuery( '#wpbody-content' ).data('save_queue');
			save_queue.splice(0,1);
			jQuery( '#wpbody-content' ).data('save_queue', save_queue);
			if ( save_queue.length > 0 ) { kgvid_ajax_save(); }

		}, "json" );

	}

	save_queue = jQuery( '#wpbody-content' ).data('save_queue');
	if ( save_queue == undefined || save_queue.length == 0 ) { var save_queue = [{ 'id':input_obj.id, 'value':setting_value }]; }
	else { save_queue.push({ 'id':input_obj.id, 'value':setting_value }); }
	jQuery( '#wpbody-content' ).data('save_queue', save_queue);
	if ( save_queue.length == 1 ) { kgvid_ajax_save(); }
}

function kgvid_embeddable_switch(checked) {

	var overlay_embedcode = jQuery("#overlay_embedcode");
	var open_graph = jQuery("#open_graph");
	var oembed_provider = jQuery("#oembed_provider");

	if (checked == false) {
		overlay_embedcode[0].checked=false;
		overlay_embedcode[0].disabled=true;
		overlay_embedcode.change();
		open_graph[0].checked=false;
		open_graph[0].disabled=true;
		open_graph.change();
		oembed_provider[0].checked=false;
		oembed_provider[0].disabled=true;
	}
	else {
		overlay_embedcode[0].disabled=false;
		open_graph[0].disabled=false;
		oembed_provider[0].disabled=false;
	}
}

function kgvid_switch_settings_tab(tab) {

	if ( tab == "encoding" ) {

		jQuery("#general_tab").removeClass("nav-tab-active");
		jQuery("#encoding_tab").addClass("nav-tab-active");

		jQuery('h3:eq(0), h3:eq(2)').hide();
		jQuery('table:eq(0), table:eq(1), table:eq(2), table:eq(3)').hide();
		jQuery(".kgvid_setting_nearvid").hide();
		jQuery('h3:eq(3)').show();
		jQuery('table:eq(4)').show();

		if ( jQuery('#app_path').data('ffmpeg_exists') == "on" && jQuery('#ffmpeg_output').html() == "" ) {
			jQuery('#ffmpeg_output').html('Running test...');
			var kgflashmediaplayersecurity = document.getElementById("kgvid_settings_security").value;
			jQuery.post(ajaxurl, { action: "kgvid_test_ffmpeg", security: kgflashmediaplayersecurity }, function(data) {
				jQuery('#ffmpeg_output').html(data.output);
				jQuery('#ffmpeg_watermark_example').empty();
				if ( 'watermark_preview' in data ) {
					jQuery('#ffmpeg_watermark_example').append('<img src="'+data.watermark_preview+'?'+String(Math.floor((Math.random()*1000)+1))+'" style="margin-top:10px;width:640px;">');
				}
			}, "json" );
		}
	}

	else { //General tab

		var playback_option = jQuery('#embed_method').val();

		jQuery("#general_tab").addClass("nav-tab-active");
		jQuery("#encoding_tab").removeClass("nav-tab-active");
		jQuery('h3:eq(0), h3:eq(2)').show();
		jQuery('table:eq(0), table:eq(1), table:eq(3)').show();
		jQuery(".kgvid_setting_nearvid").show();
		jQuery('h3:eq(3)').hide();
		jQuery('table:eq(4)').hide();

	}

	kgvid_hide_plugin_settings();
	if ( jQuery('#video_app').length > 0 ) { kgvid_hide_ffmpeg_settings(); }

}

function kgvid_hide_plugin_settings() {

	var playback_option = jQuery('#embed_method').val();
	var ffmpeg_exists = jQuery('#app_path').data('ffmpeg_exists');
	var general_tab = jQuery('#general_tab').hasClass('nav-tab-active');
	var encoding_tab = jQuery('#encoding_tab').hasClass('nav-tab-active');

	if ( playback_option != "Strobe Media Playback" || encoding_tab ) {
		jQuery('table:eq(2)').hide();
		jQuery('h3:eq(1)').hide();
	}

	if ( general_tab ) {

		if ( playback_option == "Strobe Media Playback" ) {
			jQuery('table:eq(2)').show();
			jQuery('h3:eq(1)').show();
		}

		if ( playback_option == "WordPress Default" || playback_option == "JW Player" ) {
			jQuery('#nativecontrolsfortouch').parents().eq(1).hide();
			jQuery('#js_skin').parents().eq(1).hide();
			jQuery('#chromecast').parents().eq(1).hide();
			jQuery('#auto_res').parents().eq(1).hide();
		}

		if ( playback_option == "Video.js" || playback_option == "Strobe Media Playback" ) {
			jQuery('#nativecontrolsfortouch').parents().eq(1).show();
			jQuery('#js_skin').parents().eq(1).show();
			jQuery('#chromecast').parents().eq(1).show();
			jQuery('#auto_res').parents().eq(1).show();
		}

		if ( playback_option == "JW Player" ) {
			jQuery('#endofvideooverlay').parents().eq(1).hide();
			jQuery('#jw_player_id_select').fadeIn();
		}
		else {
			jQuery('#endofvideooverlay').parents().eq(1).show();
			jQuery('#jw_player_id_select').fadeOut();
		}

	}

	if ( encoding_tab ) {

		var moov = jQuery('#moov').val();

		if ( moov == 'none' || moov == 'movflag' ) {
			jQuery('#moov_path_p').hide();
		}
		else {
			jQuery('.kgvid_moov_option').html(moov);
			jQuery('#moov_path_p').show();
		}

	}

	if ( ffmpeg_exists == "notinstalled" ) {
		jQuery(".kgvid_video_app_required").addClass("kgvid_thumbnail_overlay");
		jQuery(".kgvid_video_app_required").attr('title', kgvidL10n.ffmpegrequired);
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
		jQuery('#video_bitrate_flag').parents().eq(2).show();
	}
	if (video_app == "avconv") {
		jQuery('#video_bitrate_flag').parents().eq(2).hide();
		video_app = "libav";
	}

	jQuery('.video_app_name').html(video_app.toUpperCase());

}

function kgvid_hide_watermark_url(obj) {

	if ( obj.value == 'custom' ) {
		jQuery('#watermark_url').fadeIn().removeAttr('style');
	}
	else {
		jQuery('#watermark_url').fadeOut();
		if ( jQuery('#watermark_url').val() != '' ) { jQuery('#watermark_url').val('').change(); }
	}

}

function kgvid_hide_paginate_gallery_setting(obj) {

	if ( obj.checked ) {
		jQuery('#gallery_per_page').val('9');
		jQuery('#gallery_per_page_span').fadeIn().removeAttr('style');
	}
	else {
		jQuery('#gallery_per_page_span').fadeOut();
		jQuery('#gallery_per_page').val('');
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

	var set_for_sure = confirm(kgvidL10n.featuredwarning+"\n"+kgvidL10n.cancel_ok);

	if ( set_for_sure == true ) {
		var kgflashmediaplayersecurity = document.getElementById("kgvid_settings_security").value;
		jQuery('td:contains(Set all as featured)').append('<div id="set_featured_meter" class="kgvid_meter"><div class="kgvid_meter_bar" style="width:0%;"><div class="kgvid_meter_text"></div></div></div><span id="set_featured_status"> '+kgvidL10n.processing+'</span>');
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
	if (new_parent == "video") {
		old_parent = "post";
		var set_for_sure = confirm(kgvidL10n.parentwarning_videos+"\n "+kgvidL10n.cancel_ok);
	}
	else { var set_for_sure = confirm(kgvidL10n.parentwarning_posts+"\n "+kgvidL10n.cancel_ok); }

	if ( set_for_sure == true ) {
		var kgflashmediaplayersecurity = document.getElementById("kgvid_settings_security").value;
		jQuery('#thumb_parent').parent().append('<div id="switching_parents_meter" class="kgvid_meter"><div class="kgvid_meter_bar" style="width:0%;"><div class="kgvid_meter_text"></div></div></div><span id="switching_parents_status"> '+kgvidL10n.processing+'</span>');
		jQuery.post(ajaxurl, { action: "kgvid_get_switch_parents", security: kgflashmediaplayersecurity, parent: new_parent }, function(count) {
			jQuery.post(ajaxurl, { action: "kgvid_switch_parents", security: kgflashmediaplayersecurity, parent: new_parent });
			var interval = setInterval(function(){kgvid_check_cms_progress(count, 'switching_parents')}, 1000);
			jQuery( '#wpbody-content' ).data('switching_parents_interval', interval);
		}, "text" );
	}
}

function kgvid_auto_generate_old(type) {

	var kgflashmediaplayersecurity = document.getElementById("kgvid_settings_security").value;

	jQuery.post(ajaxurl, { action: "kgvid_get_generating_old", type: type, security: kgflashmediaplayersecurity }, function(count) {

		if ( count > 0 ) {

			if ( type == 'thumbs' ) { var set_for_sure = confirm(kgvidL10n.autothumbnailwarning+count+"\n\n "+kgvidL10n.cancel_ok); }
			if ( type == 'encode' ) { var set_for_sure = confirm(kgvidL10n.autoencodewarning+"\n\n "+kgvidL10n.cancel_ok); }

			if ( set_for_sure == true ) {

				jQuery('#generate_old_'+type+'_button').parent().append('<div id="generating_old_'+type+'_meter" class="kgvid_meter"><div class="kgvid_meter_bar" style="width:0%;"><div class="kgvid_meter_text"></div></div></div><span id="generating_old_'+type+'_status"> '+kgvidL10n.processing+'</span>');

				jQuery.post(ajaxurl, { action: "kgvid_generating_old", type: type, security: kgflashmediaplayersecurity });
				var interval = setInterval(function(){kgvid_check_cms_progress(count, 'generating_old_'+type)}, 1000);
				jQuery( '#wpbody-content' ).data('generating_old_'+type+'_interval', interval);

			}// end if sure

		}//end if count
		else { alert(kgvidL10n.nothumbstomake); }

	}, "text" );

}

function kgvid_check_cms_progress(total, cms_type) {
	var kgflashmediaplayersecurity = document.getElementById("kgvid_settings_security").value;
	var interval = jQuery( '#wpbody-content' ).data(cms_type+'_interval');
	if ( interval != "" ) {
		jQuery.post(ajaxurl, { action: "kgvid_update_cms_progress", security: kgflashmediaplayersecurity, total: total, cms_type: cms_type }, function(remaining) {
			var percent_done = Math.round(parseInt(total-remaining)/parseInt(total)*100)+'%';
			jQuery('#'+cms_type+'_meter .kgvid_meter_bar').css('width', percent_done);
			jQuery('#'+cms_type+'_meter .kgvid_meter_text').html(total-remaining+'/'+total);
			if ( remaining == 0 ) {
				clearInterval(interval);
				jQuery( '#wpbody-content' ).data(cms_type+'_interval', '');
				jQuery( '#'+cms_type+'_status' ).html(' '+kgvidL10n.complete);
				setTimeout(function(){ jQuery('#'+cms_type+'_meter, #'+cms_type+'_status').fadeOut("normal", function(){ jQuery(this).remove(); }); }, 3000);
			}
		}, "text" );
	}
}

function kgvid_pick_image(button) {

		var frame;

		jQuery( function() {

			// Build the choose from library frame.

				var $el = jQuery(button);
				if ( typeof event !== 'undefined' ) { event.preventDefault(); }

				// If the media frame already exists, reopen it.
				if ( frame ) {
					frame.open();
					return;
				}

				// Create the media frame.
				frame = wp.media.frames.customHeader = wp.media({
					// Set the title of the modal.
					title: $el.data('choose'),

					// Tell the modal to show only images.
					library: {
						type: 'image'
					},

					// Customize the submit button.
					button: {
						// Set the text of the button.
						text: $el.data('update'),
						close: true
					}
				});

				// When an image is selected, run a callback.
				frame.on( 'select', function() {
					// Grab the selected attachment.
					var attachment = frame.state().get('selection').first();
					jQuery('#'+$el.data('change')).val(attachment.attributes.url);
					if ( $el.data('change').substr(-25) == "kgflashmediaplayer-poster" ) { jQuery('#'+$el.data('change').slice(0, -25)+'thumbnailplaceholder').html('<div class="kgvid_thumbnail_box kgvid_chosen_thumbnail_box"><img width="200" src="'+attachment.attributes.url+'"></div>'); }
					jQuery('#'+$el.data('change')).change();
				});

				frame.open();
		});

}

function kgvid_pick_attachment(button) {

		var frame;

		jQuery( function() {

			// Build the choose from library frame.

				var $el = jQuery(button);
				if ( typeof event !== 'undefined' ) { event.preventDefault(); }

				// If the media frame already exists, reopen it.
				if ( frame ) {
					frame.open();
					return;
				}

				// Create the media frame.
				frame = wp.media.frames.customHeader = wp.media({
					// Set the title of the modal.
					title: $el.data('choose'),

					// Customize the submit button.
					button: {
						// Set the text of the button.
						text: $el.data('update'),
						close: true
					}
				});

				// When an image is selected, run a callback.
				frame.on( 'select', function() {
					// Grab the selected attachment.
					var attachment = frame.state().get('selection').first();
					jQuery('#'+$el.data('change')).val(attachment.attributes.url);
					jQuery('#'+$el.data('change')).change();
				});

				frame.open();
		});

}

function kgvid_pick_format(button, parentID, mime, format, movieurl) {

		var frame;

		jQuery( function() {

			// Build the choose from library frame.

				var $el = jQuery(button);
				if ( typeof event !== 'undefined' ) { event.preventDefault(); }

				// If the media frame already exists, reopen it.
				if ( frame ) {
					frame.open();
					return;
				}

				// Create the media frame.
				frame = wp.media.frames.customHeader = wp.media({
					// Set the title of the modal.
					title: $el.data('choose'),

					// Tell the modal to show only videos matching the mime type.
					library: {
						type: mime
					},

					// Customize the submit button.
					button: {
						// Set the text of the button.
						text: $el.data('update'),
						close: true
					}
				});

				// When an image is selected, run a callback.
				frame.on( 'select', function() {
					// Grab the selected attachment.
					var video = frame.state().get('selection').first();
					var kgflashmediaplayersecurity = document.getElementsByName('attachments['+parentID+'][kgflashmediaplayer-security]')[0].value;

					jQuery.post(ajaxurl, { action:"kgvid_update_child_format", security: kgflashmediaplayersecurity, parent_id: parentID, video_id: video.id, format: format }, function(data) {
						kgvid_redraw_encode_checkboxes(movieurl, parentID, 'attachment');
					}, "json");

				});

				frame.open();
		});

}

function kgvid_clear_video(movieurl, postID, video_id, blog_id) {

	var kgflashmediaplayersecurity = document.getElementsByName('attachments['+postID+'][kgflashmediaplayer-security]')[0].value;

	jQuery.post(ajaxurl, { action:"kgvid_clear_child_format", security: kgflashmediaplayersecurity, video_id: video_id, blog_id: blog_id }, function(data) {
		kgvid_redraw_encode_checkboxes(movieurl, postID, 'attachment');
	}, "json");

}

function kgvid_media_library_icon_overlay() {
	var thumbnails = jQuery('.attachment-80x60, .attachment-preview.type-video .icon');
	jQuery.each(thumbnails, function(key, value) {
		if ( value.src.split("?")[1] == "kgvid" ) {
			jQuery(value).wrap('<div class="kgvid-media-icon-overlay"></div>')
		}
	});
	jQuery('.kgvid-media-icon-overlay').prepend('<div class="kgvid-media-icon-play"><span></span></div>');
}

function kgvid_add_subtitles(id) {
	var tracks = jQuery('#kgflashmediaplayer-'+id+'-trackdiv');
	track_number = tracks.children().length;
	track_label = track_number+1;
	tracks.append('<div id="kgflashmediaplayer-'+id+'-trackdiv-'+track_number+'" class="kgvid_thumbnail_box kgvid_track_box"><strong>Track '+track_label+'</strong><span class="kgvid_track_box_removeable">X</span><br />'+kgvidL10n.tracktype+' <select name="attachments['+id+'][kgflashmediaplayer-track]['+track_number+'][kind]" id="attachments-'+id+'-kgflashmediaplayer-track_'+track_number+'_kind]"><option value="subtitles">'+kgvidL10n.subtitles+'</option><option value="captions">'+kgvidL10n.captions+'</option><option value="chapters">'+kgvidL10n.chapters+'</option></select><br /><span id="pick-track'+track_number+'" class="button-secondary" style="margin:10px 0;" data-choose="'+kgvidL10n.choosetextfile+'" data-update="'+kgvidL10n.settracksource+'" data-change="attachments-'+id+'-kgflashmediaplayer-track_'+track_number+'_src" onclick="kgvid_pick_attachment(this);">'+kgvidL10n.choosefromlibrary+'</span><br />URL: <input name="attachments['+id+'][kgflashmediaplayer-track]['+track_number+'][src]" id="attachments-'+id+'-kgflashmediaplayer-track_'+track_number+'_src" type="text" value="" class="text" style="width:180px;"><br />'+kgvidL10n.languagecode+' <input name="attachments['+id+'][kgflashmediaplayer-track]['+track_number+'][srclang]" id="attachments-'+id+'-kgflashmediaplayer-track_'+track_number+'_srclang" type="text" value="" maxlength="2" style="width:40px;"><br />'+kgvidL10n.label+' <input name="attachments['+id+'][kgflashmediaplayer-track]['+track_number+'][label]" id="attachments-'+id+'-kgflashmediaplayer-track_'+track_number+'_label" type="text" value="" class="text" style="width:172px;"><br />'+kgvidL10n.trackdefault+' <input name="attachments['+id+'][kgflashmediaplayer-track]['+track_number+'][default]" id="attachments-'+id+'-kgflashmediaplayer-track_'+track_number+'_default" type="checkbox" value="default"></div>');
	jQuery('.kgvid_track_box_removeable').click(function() { jQuery(this).parent().remove(); jQuery('form.compat-item input').first().change(); });
}
