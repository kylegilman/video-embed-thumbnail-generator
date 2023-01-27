jQuery( kgvid_admin_page_ready() );

function kgvid_admin_page_ready() {

	if ( typeof pagenow !== 'undefined' ) {
		if ( pagenow == 'settings_page_video_embed_thumbnail_generator_settings'
			|| pagenow == 'settings_page_video_embed_thumbnail_generator_settings-network'
		) {
			if ( pagenow == 'settings_page_video_embed_thumbnail_generator_settings' ) {
				kgvid_switch_settings_tab(document.URL.substring(document.URL.indexOf('#')+1));
			}

			if ( pagenow == 'settings_page_video_embed_thumbnail_generator_settings-network' ) {
				kgvid_hide_plugin_settings();
				kgvid_moov_setting()
			}

			jQuery('form :input').on('change', function() {
				kgvid_save_plugin_settings(this);
			});

		}

		if ( pagenow == 'post' ) {
			if ( typeof wp.media != 'undefined' ) {
				wp.media.view.Modal.prototype.on('open', function() {
					wp.media.frame.on('selection:toggle', function() {
						if ( typeof wp.media.frame.state().get('selection').first() != 'undefined' ) {
							var attributes = wp.media.frame.state().get('selection').first().attributes;
							kgvid_attachment_selected(attributes);
						}
					});
					wp.media.frame.on('attachment:compat:ready', function() {
						var attributes = wp.media.frame.state().get('selection').first().attributes;
						var thumb_id = jQuery('#thumbnail-' + attributes.id).data('thumb_id');
						if ( jQuery('#thumbnail-'+attributes.id).data('featuredchanged') == true
							&& jQuery('#attachments-' + attributes.id + '-featured').attr('checked')
							&& thumb_id
						) {
							wp.media.featuredImage.set(thumb_id);
						}
					});
					wp.media.frame.state().get('library').on('reset', function() {
						wp.media.frame.trigger('selection:toggle');
					});
				});
			}
		}

		if ( pagenow == 'upload' ) {
			if ( typeof wp.media != 'undefined' ) {
				wp.media.view.Modal.prototype.on('open', function() {
					var attributes = wp.media.frame.state().attributes.model.attributes;
					kgvid_attachment_selected(attributes);
				});
			}
		}

		if ( pagenow == 'attachment' ) {
			var attributes = {
				id:     jQuery('#post_ID').val(),
				url:    jQuery('#attachment_url').val()
			};
			kgvid_attachment_selected(attributes);
		}

		if ( pagenow == 'settings_page_kgvid_network_video_encoding_queue-network'
			||pagenow == 'tools_page_kgvid_video_encoding_queue'
		) {
			setTimeout( function(){ kgvid_update_encode_queue() }, 5000 );
		}

	}

}

function kgvid_attachment_selected( attributes ) {
	kgvid_hide_standard_wordpress_display_settings(attributes.id);
	if ( jQuery('.kgvid_redraw_thumbnail_box').length ) {
		setTimeout(function(){ kgvid_redraw_thumbnail_box(attributes.id) }, 5000);
	}
	if ( jQuery('.kgvid_checkboxes_section').first().data('checkboxes') == 'redraw' ) {
		var percent_timeout = setTimeout(function(){ kgvid_redraw_encode_checkboxes(attributes.url, attributes.id, false) }, 2000);
		jQuery('#wpwrap').data('KGVIDCheckboxTimeout', percent_timeout);
	}
	if ( jQuery('.kgvid_checkboxes_section').first().data('checkboxes') == 'update' ) {
		var percent_timeout = setTimeout(function(){ kgvid_update_encode_queue() }, 2000);
	}
}

function kgvid_disable_thumb_buttons(postID, event) {

	if ( jQuery( '.compat-item' ).length > 0 ) { // only do this in the new media modal, not attachment page in media library
		if (event == "onblur") {
			document.getElementById( 'attachments-' + postID + '-thumbgenerate' ).disabled  = false;
			document.getElementById( 'attachments-' + postID + '-thumbrandomize' ).disabled = false;
		} else {
			document.getElementById( 'attachments-' + postID + '-thumbgenerate' ).disabled  = true;
			document.getElementById( 'attachments-' + postID + '-thumbrandomize' ).disabled = true;
		}

		if (event == "onchange") {
			document.getElementById( 'attachments-' + postID + '-thumbgenerate' ).value  = kgvidL10n.wait;
			document.getElementById( 'attachments-' + postID + '-thumbrandomize' ).value = kgvidL10n.wait;
		}
	}
}

function kgvid_set_dimension(postID, valuetochange, currentvalue) {
	var kgvid_aspect = (document.getElementsByName( 'attachments[' + postID + '][kgflashmediaplayer-aspect]' )[0].value);
	var changeaspect = kgvid_aspect;
	if (valuetochange == "width") {
		changeaspect = 1 / kgvid_aspect;
	}
	var changedvalue = Math.round( currentvalue * changeaspect );
	if (document.getElementById( 'attachments-' + postID + '-kgflashmediaplayer-lockaspect' ).checked == true && changedvalue != 0) {
		document.getElementById( 'attachments-' + postID + '-kgflashmediaplayer-' + valuetochange ).value = changedvalue;
	}
}

function kgvid_set_aspect(postID, checked) {
	if (checked) {
		document.getElementsByName( 'attachments[' + postID + '][kgflashmediaplayer-aspect]' )[0].value = document.getElementById( 'attachments-' + postID + '-kgflashmediaplayer-height' ).value / document.getElementById( 'attachments-' + postID + '-kgflashmediaplayer-width' ).value;
	}
}

function kgvid_convert_to_timecode(time, hours = false) {

	var time_display = '';

	if ( time ) {
		if ( hours ) {
			var hours = hours = Math.floor( time / 3600 );
			if ( hours < 10 ) {
				hours = "0" + hours;
			}
			var minutes = minutes = Math.floor( (time % 3600) / 60 );
		} else {
			var minutes = Math.floor( time / 60 );
		}
		var seconds = time % 60;
		if ( minutes < 10 ) {
			minutes = "0" + minutes;
		}
		if ( seconds < 10 ) {
			seconds = "0" + seconds;
		}
		if ( hours ) {
			time_display = hours + ':' + minutes + ':' + seconds;
		} else {
			time_display = minutes + ':' + seconds;
		}

	}

	if ( time === 0 ) {
		if ( hours ) {
			time_display = '00:00:00';
		} else {
			time_display = '00:00';
		}
	}

	return time_display;

}

function kgvid_convert_from_timecode(timecode) {

	var thumbtimecode = 0;

	if ( timecode ) {

		var timecode_array = timecode.split( ":" );
		timecode_array     = timecode_array.reverse();
		if ( timecode_array[1] ) {
			timecode_array[1] = timecode_array[1] * 60;
		}
		if ( timecode_array[2] ) {
			timecode_array[2] = timecode_array[2] * 3600;
		}

		jQuery.each(
			timecode_array,
			function() {
				thumbtimecode += parseFloat( this );
			}
		);

	}

	return thumbtimecode;

}

function kgvid_break_video_on_close(postID) {

	var video = document.getElementById( 'thumb-video-' + postID );

	if ( video != null ) {

		var playButton = jQuery( ".kgvid-play-pause" );

		playButton.off( "click.kgvid" );
		video.preload = "none";
		video.src     = "";
		video.load();
		jQuery( video ).data( 'setup', false );
		jQuery( video ).data( 'busy', false );
	}

};

function kgvid_thumb_video_loaded(postID) { // sets up mini custom player for making thumbnails

	var video = document.getElementById( 'thumb-video-' + postID );

	if ( video != null ) {
		var crossDomainTest = jQuery.get( video.currentSrc )
			.fail(
				function(){
					jQuery( '#thumb-video-' + postID + '-container' ).hide();
					jQuery( '#thumb-video-' + postID ).data( 'allowed', 'off' );
					kgvid_break_video_on_close( postID );
				}
			);
	}

	jQuery( '#attachments-' + postID + '-thumbgenerate' ).prop( 'disabled', false ).attr( 'title', '' );
	jQuery( '#attachments-' + postID + '-thumbrandomize' ).prop( 'disabled', false ).attr( 'title', '' );
	jQuery( '#attachments-' + postID + '-kgflashmediaplayer-numberofthumbs' ).prop( 'disabled', false ).attr( 'title', '' );

	jQuery( '#thumb-video-' + postID + '-container' ).show();

	if ( video != null && jQuery( video ).data( 'setup' ) != true ) {

		if ( typeof wp !== 'undefined' ) {
			ed_id        = wp.media.editor.id();
			var ed_media = wp.media.editor.get( ed_id ); // Then we try to first get the editor
			ed_media     = 'undefined' != typeof( ed_media ) ? ed_media : wp.media.editor.add( ed_id ); // If it hasn't been created yet, we create it

			if ( ed_media ) {
				ed_media.on(
					'escape',
					function(postID) {
						return function() {
							if ( jQuery( '#show-thumb-video-' + postID + ' .kgvid-show-video' ).html() == kgvidL10n.hidevideo ) {
								kgvid_reveal_thumb_video( postID );
							}
							// kgvid_break_video_on_close(postID);
						}
					}(postID)
				);
			}
		}

		video.removeAttribute( 'height' ); // disables changes made by mejs
		video.removeAttribute( 'style' );
		video.setAttribute( 'width', '200' );
		video.controls = '';

		var playButton   = jQuery( ".kgvid-play-pause" );
		var seekBar      = jQuery( ".kgvid-seek-bar" );
		var playProgress = jQuery( ".kgvid-play-progress" );
		var seekHandle   = jQuery( ".kgvid-seek-handle" );

		playButton.on(
			"click.kgvid",
			function() {
				if (video.paused == true) {
					// Play the video
					video.play();
				} else {
					// Pause the video
					video.pause();
					video.playbackRate = 1;
				}
			}
		);

		video.addEventListener(
			'play',
			function() {
				playButton.addClass( 'kgvid-playing' );
			}
		);

		video.addEventListener(
			'pause',
			function() {
				playButton.removeClass( 'kgvid-playing' );
			}
		);

		// update HTML5 video current play time
		video.addEventListener(
			'timeupdate',
			function() {
				var currentPos  = video.currentTime; // Get currenttime
				var maxduration = video.duration; // Get video duration
				var percentage  = 100 * currentPos / maxduration; // in %
				playProgress.css( 'width', percentage + '%' );
				seekHandle.css( 'left', percentage + '%' );
			}
		);

		var timeDrag = false;   /* Drag status */
		seekBar.on(
			'mousedown',
			function(e) {
				if ( video.paused == false ) {
					video.pause();
				}

				if ( video.currentTime == 0 ) {
					video.play(); // video won't seek in Chrome unless it has played once already
				}

				timeDrag = true;
				updatebar( e.pageX );
			}
		);
		jQuery( document ).on(
			'mouseup',
			function(e) {
				if (timeDrag) {
					timeDrag = false;
					updatebar( e.pageX );
				}
			}
		);
		jQuery( document ).on(
			'mousemove',
			function(e) {
				if (timeDrag) {
					updatebar( e.pageX );
				}
			}
		);
		// update Progress Bar control
		var updatebar = function(x) {
			var maxduration = video.duration; // Video duraiton
			var position    = x - seekBar.offset().left; // Click pos
			var percentage  = 100 * position / seekBar.width();
			// Check within range
			if (percentage > 100) {
				percentage = 100;
			}
			if (percentage < 0) {
				percentage = 0;
			}
			// Update progress bar and video currenttime
			playProgress.css( 'width', percentage + '%' );
			seekHandle.css( 'left', percentage + '%' );
			video.currentTime = maxduration * percentage / 100;

		};

		jQuery( video ).on(
			'loadedmetadata',
			function() {
				var currentTimecode = jQuery( '#attachments-' + postID + '-kgflashmediaplayer-thumbtime' ).val();
				if ( currentTimecode ) {
					video.currentTime = kgvid_convert_from_timecode( currentTimecode );
				}
			}
		);

		jQuery( '.kgvid-video-controls' ).on(
			'keydown.kgvid',
			function(e) {

				e.stopImmediatePropagation();

				switch (e.which) {
					case 32: // spacebar
						playButton.click();
					break;

					case 37: // left
						video.pause();
						video.currentTime = video.currentTime - 0.042;
					break;

					case 39: // right
						video.pause();
						video.currentTime = video.currentTime + 0.042;
					break;

					case 74: //j
						if ( video.paused == false ) {
							video.playbackRate = video.playbackRate - 1;
						}
						if ( video.playbackRate >= 0 ) {
							video.playbackRate = -1;
						}
						video.play();
					break;

					case 75: // k
						if ( video.paused == false ) {
							playButton.click();
						}
					break;

					case 76: //l
						if ( video.paused == false ) {
							video.playbackRate = video.playbackRate + 1;
						}
						if ( video.playbackRate <= 0 ) {
							video.playbackRate = 1;
						}
						video.play();
					break;

					default: return; // exit this handler for other keys
				}
				e.preventDefault(); // prevent the default action (scroll / move caret)
			}
		);

		jQuery( video ).on(
			'click',
			function(e){
				e.stopImmediatePropagation();
				playButton.click();
				jQuery( '.kgvid-video-controls' ).trigger( 'focus' );
			}
		);

		jQuery( '.kgvid-video-controls' ).trigger( 'focus' );
		jQuery( video ).data( 'setup', true );
		if ( jQuery( video ).data( 'busy' ) != true ) {
			kgvid_break_video_on_close( postID );
		}
	}
}

function kgvid_draw_thumb_canvas(canvas, canvas_source) {

	if ( canvas_source.nodeName.toLowerCase() === 'video' ) {
		canvas_width  = canvas_source.videoWidth;
		canvas_height = canvas_source.videoHeight;
	} else {
		canvas_width  = canvas_source.width;
		canvas_height = canvas_source.height;
	}

	canvas.width  = canvas_width;
	canvas.height = canvas_height;
	var context   = canvas.getContext( '2d' );
	context.fillRect( 0, 0, canvas_width, canvas_height );
	context.drawImage( canvas_source, 0, 0, canvas_width, canvas_height );

	return canvas;

}

function kgvid_reveal_video_stats(postID) {

	jQuery( '#show-video-stats-' + postID ).hide();
	jQuery( '#video-' + postID + '-stats' ).animate( {opacity: 'toggle', height: 'toggle'}, 500 );

}

function kgvid_remove_mejs_player(postID) {

	if ( jQuery( '#thumb-video-' + postID + '-player .mejs-container' ).attr( 'id' ) !== undefined && typeof mejs !== 'undefined' ) { // this is the Media Library pop-up introduced in WordPress 4.0

		var mejs_id     = jQuery( '#thumb-video-' + postID + '-player .mejs-container' ).attr( 'id' );
		var mejs_player = eval( 'mejs.players.' + mejs_id );
		if ( mejs_player.getSrc() !== null ) {
			if ( ! mejs_player.paused ) {
				mejs_player.pause();
			}
			mejs_player.remove();
		}

	}

}

function kgvid_reveal_thumb_video(postID) {

	jQuery( '#show-thumb-video-' + postID + ' :first' ).toggleClass( 'kgvid-down-arrow kgvid-right-arrow' );
	var text = jQuery( '#show-thumb-video-' + postID + ' .kgvid-show-video' );

	if ( text.html() == kgvidL10n.choosefromvideo ) { // video is being revealed

		kgvid_remove_mejs_player( postID );

		video = document.getElementById( 'thumb-video-' + postID );
		jQuery( video ).data( 'busy', true );
		video.src = document.getElementsByName( 'attachments[' + postID + '][kgflashmediaplayer-url]' )[0].value;
		jQuery( video ).attr( "preload", "metadata" );
		video.load();

		setTimeout(
			function(){ // wait for video to start loading

				if ( video.networkState == 1 || video.networkState == 2 ) {
					text.html( kgvidL10n.hidevideo );
					jQuery( '#attachments-' + postID + '-thumbnailplaceholder' ).slideUp();
					jQuery( video ).on(
						'timeupdate.kgvid',
						function() {
							if (video.currentTime != 0) {
								var thumbtimecode = kgvid_convert_to_timecode( document.getElementById( 'thumb-video-' + postID ).currentTime );
								jQuery( '#attachments-' + postID + '-kgflashmediaplayer-thumbtime' ).val( thumbtimecode );
							}
						}
					);
				} else {

					text.html( kgvidL10n.cantloadvideo );
					jQuery( '#thumb-video-' + postID + '-player' ).hide();
					jQuery( '#show-thumb-video-' + postID + ' :first' ).hide();

				}

			},
			1000
		);
	} else if ( text.html() == kgvidL10n.hidevideo ) { // video is being hidden

		video = document.getElementById( 'thumb-video-' + postID );
		video.pause();
		jQuery( '#thumb-video-' + postID ).off( 'timeupdate.kgvid' );
		kgvid_break_video_on_close( postID );
		text.html( kgvidL10n.choosefromvideo );

		if ( jQuery( '#attachments-' + postID + '-thumbnailplaceholder' ).is( ":visible" ) == false ) {
			jQuery( '#attachments-' + postID + '-thumbnailplaceholder' ).slideDown();
		}

	}

	if ( text.html() != kgvidL10n.cantloadvideo ) {

		jQuery( '#thumb-video-' + postID + '-player' ).animate( {opacity: 'toggle', height: 'toggle'}, 500 );
		jQuery( '#generate-thumb-' + postID + '-container' ).animate( {opacity: 'toggle', height: 'toggle'}, 500 );

	}

}

function kgvid_generate_thumb(postID, buttonPushed) {

	var kgflashmediaplayersecurity = document.getElementsByName( 'attachments[' + postID + '][kgflashmediaplayer-security]' )[0].value;
	var attachmentURL              = document.getElementsByName( 'attachments[' + postID + '][kgflashmediaplayer-url]' )[0].value;
	var howmanythumbs              = document.getElementById( 'attachments-' + postID + '-kgflashmediaplayer-numberofthumbs' ).value;
	var firstframethumb            = document.getElementById( 'attachments-' + postID + '-firstframe' ).checked;
	var posterurl                  = document.getElementsByName( 'attachments[' + postID + '][kgflashmediaplayer-poster]' )[0].value;

	var specifictimecode = document.getElementsByName( 'attachments[' + postID + '][kgflashmediaplayer-thumbtime]' )[0].value;
	if (specifictimecode === "0") {
		specifictimecode = "firstframe"; firstframethumb = true;
	}
	if (buttonPushed == "random" || howmanythumbs > 1) {
		specifictimecode = 0;
	}
	if (specifictimecode != 0 ) {
		howmanythumbs = 1;
	}

	var thumbnailplaceholderid = "#attachments-" + postID + "-thumbnailplaceholder";
	var thumbnailboxID         = "#attachments-" + postID + "-kgflashmediaplayer-thumbnailbox";
	var thumbnailboxoverlayID  = "#attachments-" + postID + "-kgflashmediaplayer-thumbnailboxoverlay";
	var cancelthumbdivID       = '#attachments-' + postID + '-kgflashmediaplayer-cancelthumbsdiv';
	var widthID                = 'attachments-' + postID + '-kgflashmediaplayer-width';
	var heightID               = 'attachments-' + postID + '-kgflashmediaplayer-height';
	var maxwidthID             = 'attachments[' + postID + '][kgflashmediaplayer-maxwidth]';
	var i                      = 1;
	var increaser              = 0;
	var iincreaser             = 0;
	var video_id               = 'thumb-video-' + postID;

	kgvid_remove_mejs_player( postID );

	if ( jQuery( '#' + video_id ).data( 'allowed' ) == "on" ) {

		video = document.getElementById( video_id );

		if ( video.preload == "none" ) {

			video.src     = document.getElementsByName( 'attachments[' + postID + '][kgflashmediaplayer-url]' )[0].value;
			video.preload = "metadata";
			video.load();
			jQuery( video ).data( 'busy', true );
			jQuery( video ).data( 'success', false );

			jQuery( video ).on(
				"loadedmetadata.kgvid",
				function() {
					jQuery( video ).data( 'success', true );
					kgvid_make_canvas_thumbs_loop();
				}
			);

		} else {
			kgvid_make_canvas_thumbs_loop();
		}

		setTimeout(
			function(){ // wait for video to start loading

				video = document.getElementById( video_id );

				if ( jQuery( video ).data( 'success' ) == false ) {

					if ( jQuery( '#generate-thumb-' + postID + '-container' ).data( 'ffmpeg' ) == 'on' ) {

						kgvid_ffmpeg_thumbs(); // call the FFMPEG loop if the browser can't do it

					} else { // there's no way to make thumbnails

						jQuery( '#attachments-' + postID + '-thumbgenerate, #attachments-' + postID + '-thumbrandomize, #attachments-' + postID + '-firstframe, #attachments-' + postID + '-kgflashmediaplayer-thumbtime, #attachments-' + postID + '-kgflashmediaplayer-numberofthumbs' ).prop( 'disabled', true ).attr( 'title', kgvidL10n.cantmakethumbs );

						jQuery( thumbnailplaceholderid ).empty();
						jQuery( '#thumb-video-' + postID + '-container' ).hide();

						alert( kgvidL10n.cantmakethumbs );

					}

				}

			},
			2000
		);

	}

	jQuery( thumbnailplaceholderid ).empty();
	jQuery( thumbnailplaceholderid ).append( '<strong>' + kgvidL10n.choosethumbnail + ' </strong><div style="display:inline-block;" id="attachments-' + postID + '-kgflashmediaplayer-cancelthumbsdiv" name="attachments-' + postID + '-kgflashmediaplayer-cancelthumbsdiv"> <input type="button" id="attachments-' + postID + '-kgflashmediaplayer-cancelencode" class="button-secondary" value="Cancel Generating" name="attachments-' + postID + '-cancelencode" onclick="kgvid_cancel_thumbs(\'' + postID + '\');"></div><div id="attachments-' + postID + '-kgflashmediaplayer-thumbnailboxoverlay" name="attachments-' + postID + '-kgflashmediaplayer-thumbnailboxoverlay" class="kgvid_thumbnail_overlay"><div name="attachments-' + postID + '-kgflashmediaplayer-thumbnailbox" id="attachments-' + postID + '-kgflashmediaplayer-thumbnailbox" class="kgvid_thumbnail_box"></div></div>' );

	function kgvid_ffmpeg_thumbs() {

		iincreaser = i + increaser;

		jQuery.post(
			ajaxurl,
			{ action:"kgvid_callffmpeg",
				security: kgflashmediaplayersecurity,
				movieurl: attachmentURL,
				numberofthumbs: howmanythumbs,
				thumbnumber: i,
				thumbnumberplusincreaser: iincreaser,
				ffmpeg_action: 'generate',
				attachmentID: postID,
				generate_button: buttonPushed,
				thumbtimecode: specifictimecode,
				dofirstframe: firstframethumb,
				poster: posterurl
			},
			function(data) {

				kgthumbnailTimeout = jQuery( thumbnailplaceholderid ).data( "kgthumbnailTimeouts" ) || null;
				jQuery( thumbnailboxID ).append( data.thumbnaildisplaycode );
				var thumbnailselectID = "#attachments-" + postID + "-thumb" + i;
				jQuery( thumbnailselectID ).css( {display:"none"} );
				jQuery( thumbnailselectID ).animate( {opacity: 'toggle', height: 'toggle', width: 'toggle'}, 1000 );
				if (data.lastthumbnumber == "break" || (kgthumbnailTimeout == null && i != 1) ) {
					i = parseInt( howmanythumbs ) + 1;
				} else {
					i = parseInt( data.lastthumbnumber );
				}
				increaser++;
				if ( i <= howmanythumbs ) {
					if ( kgthumbnailTimeout == null ) {
						kgthumbnailTimeout = new Array();
					}
					kgthumbnailTimeout[i] = setTimeout(
						function(){
							// jQuery(thumbnailplaceholderid).data("kgthumbnailTimeout", null);
							kgvid_ffmpeg_thumbs();
						},
						750
					);
					jQuery( thumbnailplaceholderid ).data( "kgthumbnailTimeouts", kgthumbnailTimeout );
				} else {
					jQuery( thumbnailboxoverlayID ).fadeTo( 2000, 1 );
					jQuery( cancelthumbdivID ).animate( {opacity: 'toggle', height: 'toggle'}, 500 );
					jQuery( thumbnailplaceholderid ).data( "kgthumbnailTimeouts", null );
					jQuery( thumbnailboxID ).prepend( '<div id="saveallthumbs-' + postID + '-div"><input style="display:none;" type="button" id="attachments-' + postID + '-saveallthumbs" class="button-secondary kgvid-centered-block" value="' + kgvidL10n.saveallthumbnails + '" name="attachments-' + postID + '-saveallthumbs" onclick="kgvid_saveall_thumbs(\'' + postID + '\');"></div>' );
					jQuery( '#attachments-' + postID + '-saveallthumbs' ).animate( {opacity: 'toggle', height: 'toggle'}, 1000 );
				}

				kgvid_aspect = data.movie_height / data.movie_width;
				document.getElementsByName( 'attachments[' + postID + '][kgflashmediaplayer-aspect]' )[0].value = kgvid_aspect;

				if (parseInt( data.movie_width ) < parseInt( document.getElementsByName( maxwidthID )[0].value )
					&& jQuery( '#attachments-' + postID + '-kgflashmediaplayer-width' ).data( 'minimum' ) != 'on'
				) {
					document.getElementById( widthID ).value = data.movie_width;
				} else {
					document.getElementById( widthID ).value = document.getElementsByName( maxwidthID )[0].value;
				}
				document.getElementById( heightID ).value = Math.round( kgvid_aspect * parseInt( document.getElementById( widthID ).value ) );

				kgvid_redraw_encode_checkboxes( attachmentURL, postID, false );

			},
			"json"
		);

	}// end kgvid_ffmpeg_thumbs function

	function kgvid_make_canvas_thumbs_loop() {

		if (video.networkState == 1 || video.networkState == 2 ) { // if the browser can load the video, use it to make thumbnails

			var video_width  = video.videoWidth;
			var video_height = video.videoHeight;
			var video_aspect = video_height / video_width;
			var thumbnails   = [];

			jQuery( '#' + video_id ).on(
				'seeked.kgvid',
				function(){ // when the video is finished seeking

					var thumbnail_saved = jQuery( video ).data( 'thumbnail_data' );
					if ( thumbnail_saved.length > 0 ) { // if there are any thumbnails that haven't been generated

						if ( video.paused == false ) {
							video.pause();
						}

						time_id = Math.round( video.currentTime * 100 );

						jQuery( thumbnailboxID ).append( '<div style="display:none;" class="kgvid_thumbnail_select" name="attachments[' + postID + '][thumb' + time_id + ']" id="attachments-' + postID + '-thumb' + time_id + '"><label for="kgflashmedia-' + postID + '-thumbradio' + time_id + '"><canvas class="kgvid_thumbnail" style="width:200px;height:' + Math.round( 200 * video_aspect ) + 'px;" id="' + postID + '_thumb_' + time_id + '" data-movieoffset="' + video.currentTime + '"></canvas></label><br /><input type="radio" name="attachments[' + postID + '][thumbradio' + time_id + ']" id="kgflashmedia-' + postID + '-thumbradio' + time_id + '" value="' + video.currentTime + '" onchange="kgvid_save_canvas_thumb(\'' + postID + '\', \'' + time_id + '\', 1, 0);"></div>' );
						var canvas = document.getElementById( postID + '_thumb_' + time_id );
						canvas     = kgvid_draw_thumb_canvas( canvas, video );
						jQuery( '#attachments-' + postID + '-thumb' + time_id ).animate( {opacity: 'toggle', height: 'toggle', width: 'toggle'}, 1000 );

						thumbnail_saved.splice( 0,1 );
						jQuery( video ).data( 'thumbnail_data', thumbnail_saved );
						if ( thumbnail_saved.length > 0 ) {
							video.currentTime = thumbnail_saved[0];
						} else {
							jQuery( video ).off( 'seeked.kgvid' );
							jQuery( video ).off( 'loadedmetadata.kgvid' );
							video.preload = "none";
							video.load();
							jQuery( thumbnailboxoverlayID ).fadeTo( 2000, 1 );
							jQuery( cancelthumbdivID ).animate( {opacity: 0, height: 'toggle'}, 500 );
							jQuery( thumbnailboxID ).prepend( '<div id="saveallthumbs-' + postID + '-div"><input style="display:none;" type="button" id="attachments-' + postID + '-saveallthumbs" class="button-secondary kgvid-centered-block" value="' + kgvidL10n.saveallthumbnails + '" name="attachments-' + postID + '-saveallthumbs" onclick="kgvid_saveall_thumbs(\'' + postID + '\');"></div>' );
							jQuery( '#attachments-' + postID + '-saveallthumbs' ).animate( {opacity: 'toggle', height: 'toggle'}, 500 );
							jQuery( video ).removeData( 'thumbnail_data' );
							kgvid_break_video_on_close( postID );
						}
					}
				}
			);

			for ( i; i <= howmanythumbs; i++ ) {
				iincreaser = i + increaser;
				increaser++;
				var movieoffset = Math.round( (video.duration * iincreaser) / (howmanythumbs * 2) * 100 ) / 100;

				if (buttonPushed == "random") { // adjust offset random amount
					var random_offset = Math.round( Math.random() * video.duration / howmanythumbs );
					movieoffset       = movieoffset - random_offset;
					if (movieoffset < 0) {
						movieoffset = 0;
					}
				}

				thumbnails.push( movieoffset ); // add offset to array
			}

			if ( firstframethumb ) {
				thumbnails[0] = 0;
			}

			if ( specifictimecode ) {
				var thumbtimecode = kgvid_convert_from_timecode( specifictimecode );
				thumbnails        = [thumbtimecode];
			}

			video.play();

			jQuery( video ).on(
				'loadeddata',
				function(){
					var thumbnail_saved = jQuery( video ).data( 'thumbnail_data' );
					if ( thumbnail_saved.length > 0 ) {
						video.currentTime = thumbnail_saved[0];
					}
				}
			);

			jQuery( video ).data( 'thumbnail_data', thumbnails );

		}

	}//end canvas thumb function

	if (
		(
			jQuery( '#thumb-video-' + postID ).data( 'allowed' ) != 'on'
			&& jQuery( '#generate-thumb-' + postID + '-container' ).data( 'ffmpeg' ) == 'on' // call the FFMPEG loop if the browser can't do it
		)
		|| jQuery( '#kgflashmediaplayer-table' ).length > 0 // or if it's the external URL dialog
	) {
		kgvid_ffmpeg_thumbs();
	}
}

function kgvid_select_thumbnail(thumb_url, post_id, movieoffset, thumbnail) {

	jQuery( '[name="attachments[' + post_id + '][kgflashmediaplayer-poster]"]' ).val( thumb_url ); // get this by name because it's the same before WP v3.5

	var unscaledThumb = new Image();
	unscaledThumb.src = thumbnail.src;
	var canvas        = document.createElement( "canvas" );
	canvas            = kgvid_draw_thumb_canvas( canvas, unscaledThumb );
	var thumb_dataurl = canvas.toDataURL( 'image/jpeg', 0.8 );

	kgvid_change_media_library_video_poster( post_id, thumb_dataurl );

	var time_display = kgvid_convert_to_timecode( movieoffset );
	jQuery( '#attachments-' + post_id + '-kgflashmediaplayer-thumbtime' ).val( time_display );
	jQuery( '#attachments-' + post_id + '-kgflashmediaplayer-numberofthumbs' ).val( '1' );

}

function kgvid_change_media_library_video_poster(post_id, thumb_url) {

	if ( jQuery( 'div[data-id=' + post_id + '] .wp-video-shortcode.mejs-container' ).length > 0 && typeof mejs !== 'undefined' ) {
		var mejs_id     = jQuery( 'div[data-id=' + post_id + '] .wp-video-shortcode.mejs-container' ).attr( 'id' );
		var mejs_player = eval( 'mejs.players.' + mejs_id );
		mejs_player.setPoster( thumb_url );
	}

}

function kgvid_save_canvas_thumb(postID, time_id, total, index) {

	var kgflashmediaplayersecurity = document.getElementsByName( 'attachments[' + postID + '][kgflashmediaplayer-security]' )[0].value;

	var video_url    = document.getElementsByName( 'attachments[' + postID + '][kgflashmediaplayer-url]' )[0].value;
	var canvas       = document.getElementById( postID + '_thumb_' + time_id );
	var png64dataURL = canvas.toDataURL( 'image/jpeg', 0.8 ); // this is what saves the image. Do this after selection.

	jQuery( '#attachments-' + postID + '-thumbnailplaceholder canvas' ).fadeTo( 500, .25 );
	jQuery( '#attachments-' + postID + '-thumbnailplaceholder input' ).prop( 'disabled', true );
	jQuery( '#attachments-' + postID + '-thumbnailplaceholder' ).prepend( '<div class="kgvid_save_overlay">' + kgvidL10n.saving + '</div>' )

	jQuery.ajax(
		{
			type: "POST",
			url: ajaxurl,
			data: { action:"kgvid_save_html5_thumb",
				security: kgflashmediaplayersecurity,
				url: video_url,
				offset: time_id,
				postID: postID,
				total: total,
				index: index,
				raw_png: png64dataURL
			},
			dataType: 'text'
		}
	)
	.done(
		function(data) {
			if ( data ) {
				if ( total == 1 ) {
					document.getElementsByName( 'attachments[' + postID + '][kgflashmediaplayer-autothumb-error]' )[0].value = '';

					jQuery( '#attachments-' + postID + '-kgflashmediaplayer-numberofthumbs' ).val( '1' );

					var time_display = kgvid_convert_to_timecode( canvas.dataset.movieoffset );
					jQuery( '#attachments-' + postID + '-kgflashmediaplayer-thumbtime' ).val( time_display );

					jQuery( '#attachments-' + postID + '-kgflashmediaplayer-poster' ).val( data ).trigger( 'change' );
					if ( typeof pagenow === 'undefined' || pagenow == 'attachment' ) {
						jQuery( '#publish' ).trigger( 'click' );
					}
					kgvid_change_media_library_video_poster( postID, png64dataURL );
				} else {
					kgvid_thumbnail_saveall_progress( postID, total );
				}
			}
		}
	)
	.fail(
		function(xhr, textStatus, errorThrown) {
			document.getElementsByName( 'attachments[' + postID + '][kgflashmediaplayer-autothumb-error]' )[0].value = errorThrown;
			jQuery( '#attachments-' + postID + '-thumbnailplaceholder' ).empty();
			jQuery( '#attachments-' + postID + '-thumbnailplaceholder' ).html( '<div class="kgvid_thumbnail_box kgvid_chosen_thumbnail_box">' + errorThrown + '</div>' );
		}
	);
}

function kgvid_thumbnail_saveall_progress(postID, total) {

		var percent_add  = 100 / total;
		var percent_done = parseInt( jQuery( '#saving_thumbs_meter .kgvid_meter_bar' )[0].style.width ) + percent_add;
		var number       = Math.round( percent_done / percent_add );
		jQuery( '#saving_thumbs_meter .kgvid_meter_bar' ).css( 'width', percent_done + '%' );
		jQuery( '#saving_thumbs_meter .kgvid_meter_text' ).html( number + '/' + total );

	if ( number == total ) {
		jQuery( '#saveallthumbs-' + postID + '-div' ).slideUp( 1000 );
		jQuery( '#attachments-' + postID + '-thumbnailplaceholder .kgvid_save_overlay' ).fadeOut( "normal", function(){ jQuery( this ).remove(); } );
		jQuery( '#attachments-' + postID + '-kgflashmediaplayer-thumbnailboxoverlay, #attachments-' + postID + '-thumbnailplaceholder canvas' ).fadeTo( 500, 1 );
		jQuery( '#attachments-' + postID + '-thumbnailplaceholder input' ).prop( 'disabled', false );
	}

}

function kgvid_saveall_thumbs(postID) {

	var kgflashmediaplayersecurity = document.getElementsByName( 'attachments[' + postID + '][kgflashmediaplayer-security]' )[0].value;
	var thumbnails                 = jQuery( '#attachments-' + postID + '-kgflashmediaplayer-thumbnailbox' ).find( '.kgvid_thumbnail' );
	var total                      = thumbnails.length;

	jQuery( '#saveallthumbs-' + postID + '-div' ).append( '<br><div style="margin:5px;" id="saving_thumbs_meter" class="kgvid_meter"><div class="kgvid_meter_bar" style="width:0%;"><div class="kgvid_meter_text"></div></div></div><span id="saving_thumbs_status"> ' + kgvidL10n.saving + '</span>' );

	jQuery.each(
		thumbnails,
		function(key, value) {
			if ( value.tagName.toLowerCase() == "canvas" ) {
				var time_id = value.id.split( "_" ).pop();
				setTimeout(
					function(time_id, key) {
						return function() {
								kgvid_save_canvas_thumb( postID, time_id, total, key );
						}
					}(time_id,
					key),
					0
				);
			} else { // thumbnails were made by ffmpeg

				thumb_url = value.src.split( "?" )[0].replace( '/thumb_tmp/', '/' );

				if ( isNaN( postID ) ) { // dealing with an external URL
					var postid = parent.document.getElementById( 'post_ID' ).value;
				}

				setTimeout(
					function(thumb_url, key) {
						return function() {
							jQuery.ajax(
								{
									type: "POST",
									url: ajaxurl,
									data: { action:'kgvid_save_thumb', security: kgflashmediaplayersecurity, post_id: postID, thumburl: thumb_url, index: key },
									async: false
								}
							)
							.done(
								function(thumb_url) {
									kgvid_thumbnail_saveall_progress( postID, total );
								}
							);
						}
					}(thumb_url,
					key),
					0
				);
			}
		}
	); // end each loop
}

function kgvid_thumb_video_manual(postID) {

	var video = document.getElementById( 'thumb-video-' + postID );

	if ( jQuery( '#thumb-video-' + postID + '-player .mejs-container' ).attr( 'id' ) !== undefined ) { // this is the Media Library pop-up introduced in WordPress 4.0;
		video = document.getElementById( 'thumb-video-' + postID + '_html5' );
	}

	var video_aspect = video.videoHeight / video.videoWidth;
	var time_id      = Math.round( video.currentTime );
	var time_display = kgvid_convert_to_timecode( video.currentTime );

	jQuery( '#thumb-video-' + postID + '-player .button-secondary' ).prop( 'disabled', true );
	jQuery( '#thumb-video-' + postID + '-player' ).fadeTo( 500, .25 );
	jQuery( '#thumb-video-' + postID + '-container' ).prepend( '<div class="kgvid_save_overlay">' + kgvidL10n.saving + '</div>' );

	document.getElementById( 'attachments-' + postID + '-kgflashmediaplayer-thumbtime' ).value = time_display;

	jQuery( "#attachments-" + postID + "-thumbnailplaceholder" ).html( '<div class="kgvid_thumbnail_box kgvid_chosen_thumbnail_box"><canvas style="height:' + Math.round( 200 * video_aspect ) + 'px;" id="' + postID + '_thumb_' + time_id + '"></canvas></div>' );

	var canvas = document.getElementById( postID + '_thumb_' + time_id );
	canvas     = kgvid_draw_thumb_canvas( canvas, video );

	setTimeout(
		function() { // redraw the canvas after a delay to avoid Safari bug
			canvas = kgvid_draw_thumb_canvas( canvas, video );
			kgvid_save_canvas_thumb( postID, time_id, 1, 0 );
		},
		250
	);

}

function kgvid_list_videos_to_encode(postID, blog) {

	var format_inputs = jQuery( '#attachments-' + blog.id_text + postID + '-kgflashmediaplayer-encodeboxes input[type=checkbox]' );
	var kgvid_encode  = new Object();

	jQuery.each(
		format_inputs,
		function(key,el) {
			var format           = jQuery( el ).data( 'format' );
			kgvid_encode[format] = "";
			if ( jQuery( '#attachments-' + blog.id_text + postID + '-kgflashmediaplayer-encode' + format ).length > 0) {
				kgvid_encode[format] = document.getElementById( 'attachments-' + blog.id_text + postID + '-kgflashmediaplayer-encode' + format ).checked;
			}
		}
	);

	return kgvid_encode;

}

function kgvid_enqueue_video_encode(postID, blogID) {

	var blog = kgvid_get_multisite_data( blogID );

	var kgflashmediaplayersecurity = document.getElementsByName( 'attachments' + blog.name_text + '[' + postID + '][kgflashmediaplayer-security]' )[0].value;
	var attachmentURL              = document.getElementsByName( 'attachments' + blog.name_text + '[' + postID + '][kgflashmediaplayer-url]' )[0].value;
	var parent_post_id             = jQuery( '#post_ID' ).val();
	if ( parent_post_id == undefined ) {
		parent_post_id = jQuery( '#post_ID', window.parent.document ).val();
	}
	var encodeplaceholderid         = "#attachments-" + blog.id_text + postID + "-encodeplaceholder";
	var encodeprogressplaceholderid = "#attachments-" + blog.id_text + postID + "-encodeprogressplaceholder";

	var document_url = document.URL;
	var page_check   = /[?&]page=([^&]+)/i;
	var match        = page_check.exec( document_url );
	if (match != null) {
		page = "queue";
	}

	var kgvid_encode = kgvid_list_videos_to_encode( postID, blog );

	jQuery( encodeplaceholderid ).empty();
	jQuery( encodeprogressplaceholderid ).empty();
	jQuery( encodeplaceholderid ).append( '<strong>' + kgvidL10n.loading + '</strong>' );

	jQuery.post(
		ajaxurl,
		{ action:"kgvid_callffmpeg",
			security: kgflashmediaplayersecurity,
			movieurl: attachmentURL,
			ffmpeg_action: 'enqueue',
			encodeformats: kgvid_encode,
			attachmentID: postID,
			parent_id: parent_post_id,
			blog_id: blogID },
		function(data) {
			jQuery( encodeplaceholderid ).empty();
			jQuery( encodeprogressplaceholderid ).empty();
			jQuery( encodeplaceholderid ).append( data.embed_display );
			jQuery.post(
				ajaxurl ,
				{ action:"kgvid_ajax_encode_videos",
					security:kgflashmediaplayersecurity
				},
				function(data) {
					jQuery( encodeprogressplaceholderid ).empty();
					jQuery( encodeplaceholderid ).append( data.embed_display );

					setTimeout(
						function(){
							jQuery( '#attachments-' + blog.id_text + postID + '-kgflashmediaplayer-encodeboxes' ).css( 'opacity', '0.5' );
							kgvid_redraw_encode_checkboxes( attachmentURL, postID, blogID );
						},
						2000
					);
				},
				"json"
			);

		},
		"json"
	);
}

function kgvid_hide_standard_wordpress_display_settings(postID) {
	if ( jQuery( '#attachments[' + postID + '][kgflashmediaplayer-embed]' ).value != "WordPress Default" ) {
		jQuery( '.attachment-display-settings' ).hide();
	}
}

function kgvid_change_singleurl(basename, oldbasename) {

	jQuery( '#kgvid-form :input' ).each(
		function(){
			if ( jQuery( this ).attr( "id" ) ) {
				var newid = this.getAttribute( "id" ).replace( oldbasename, basename );
				jQuery( this ).attr( "id", newid );
			}
			if ( jQuery( this ).attr( "name" ) ) {
				var newname = this.getAttribute( "name" ).replace( oldbasename, basename );
				jQuery( this ).attr( "name", newname );
			}
		}
	);
	jQuery( '#kgflashmediaplayer-table' ).data( "kgvid_attachment_id", basename );
	jQuery( '#attachments-' + oldbasename + '-kgflashmediaplayer-encodeboxes' ).attr( 'id', 'attachments-' + basename + '-kgflashmediaplayer-encodeboxes' );
	jQuery( '#attachments-' + oldbasename + '-thumbnailplaceholder' ).attr( 'id', 'attachments-' + basename + '-thumbnailplaceholder' );
	jQuery( '#attachments-' + basename + '-kgflashmediaplayer-numberofthumbs' ).attr( "onchange", "document.getElementById('attachments-" + basename + "-kgflashmediaplayer-thumbtime').value='';" );
	jQuery( '#attachments-' + basename + '-thumbgenerate' ).replaceWith( '<input disabled="disabled" type="button" id="attachments-' + basename + '-thumbgenerate" class="button-secondary" value="' + kgvidL10n.generate + '" name="thumbgenerate" onclick="kgvid_generate_thumb(\'' + basename + '\', \'generate\');" >' );
	jQuery( '#attachments-' + basename + '-thumbrandomize' ).replaceWith( '<input disabled="disabled" type="button" id="attachments-' + basename + '-thumbrandomize" class="button-secondary" value="' + kgvidL10n.randomize + '" name="thumbgenerate" onclick="kgvid_generate_thumb(\'' + basename + '\', \'random\');" >' );
	document.getElementById( 'attachments-' + basename + '-kgflashmediaplayer-width' ).setAttribute( "onchange", "kgvid_set_dimension('" + basename + "', 'height', this.value);" )
	document.getElementById( 'attachments-' + basename + '-kgflashmediaplayer-width' ).setAttribute( "onkeyup", "kgvid_set_dimension('" + basename + "', 'height', this.value);" );
	document.getElementById( 'attachments-' + basename + '-kgflashmediaplayer-height' ).setAttribute( "onchange", "kgvid_set_dimension('" + basename + "', 'width', this.value);" );
	document.getElementById( 'attachments-' + basename + '-kgflashmediaplayer-height' ).setAttribute( "onkeyup", "kgvid_set_dimension('" + basename + "', 'width', this.value);" );
	document.getElementById( 'attachments-' + basename + '-kgflashmediaplayer-lockaspect' ).setAttribute( "onclick", "kgvid_set_aspect('" + basename + "', this.checked);" );
	document.getElementById( 'singleurl-lockaspect-label' ).setAttribute( "for", "attachments-" + basename + "-kgflashmediaplayer-lockaspect" );

	if ( document.getElementById( 'attachments-' + basename + '-kgflashmediaplayer-ffmpegexists' ).value == "on" ) {
		document.getElementById( 'attachments-' + basename + '-thumbgenerate' ).disabled          = false;
		document.getElementById( 'attachments-' + basename + '-thumbgenerate' ).title             = "";
		document.getElementById( 'attachments-' + basename + '-thumbrandomize' ).disabled         = false;
		document.getElementById( 'attachments-' + basename + '-thumbrandomize' ).title            = "";
		document.getElementById( 'attachments-' + basename + '-kgflashmediaplayer-encode' ).title = kgvidL10n.loading;

	} else {
		jQuery( '#attachments-' + basename + '-thumbgenerate' ).attr( 'title', kgvidL10n.ffmpegnotfound );
		jQuery( 'attachments-' + basename + '-thumbrandomize' ).attr( 'title', kgvidL10n.ffmpegnotfound );
	}
	document.getElementById( 'insertonlybutton' ).disabled = false;
	document.getElementById( 'insertonlybutton' ).title    = "";

}

function kgvid_set_singleurl() {

	var oldbasename                = jQuery( '#kgflashmediaplayer-table' ).data( "kgvid_attachment_id" ) || "singleurl";
	var kgflashmediaplayersecurity = document.getElementsByName( 'attachments[' + oldbasename + '][kgflashmediaplayer-security]' )[0].value;
	var basename;
	var url = document.getElementById( 'attachments-' + oldbasename + '-kgflashmediaplayer-url' ).value;

	if ( url.length > 0 ) {
		jQuery.post(
			ajaxurl,
			{ action:"kgvid_sanitize_url",
				security: kgflashmediaplayersecurity,
				movieurl: url
			},
			function(data) {
				basename = data.singleurl_id;
				if ( url != data.movieurl ) {
					document.getElementById( 'attachments-' + oldbasename + '-kgflashmediaplayer-url' ).value = data.movieurl;
				}
				url = data.movieurl;
				kgvid_change_singleurl( basename, oldbasename );
				jQuery( '#attachments-' + basename + '-kgflashmediaplayer-encodeboxes' ).css( 'opacity', '0.5' );
				kgvid_redraw_encode_checkboxes( url, basename, false );
			},
			"json"
		);
	} else {
		basename = "singleurl";
		kgvid_change_singleurl( basename, oldbasename );
		document.getElementById( 'attachments-' + basename + '-thumbgenerate' ).disabled             = true;
		document.getElementById( 'attachments-' + basename + '-thumbgenerate' ).title                = kgvidL10n.pleasevalidurl;
		document.getElementById( 'attachments-' + basename + '-thumbrandomize' ).disabled            = true;
		document.getElementById( 'attachments-' + basename + '-thumbrandomize' ).title               = kgvidL10n.pleasevalidurl;
		document.getElementById( 'attachments-' + basename + '-kgflashmediaplayer-encode' ).disabled = true;
		document.getElementById( 'attachments-' + basename + '-kgflashmediaplayer-encode' ).title    = kgvidL10n.pleasevalidurl;
		document.getElementById( 'insertonlybutton' ).disabled                                       = true;
		document.getElementById( 'insertonlybutton' ).title = kgvidL10n.pleasevalidurl;
	}

}

function kgvid_insert_shortcode() {

	var basename                   = jQuery( '#kgflashmediaplayer-table' ).data( "kgvid_attachment_id" ) || "singleurl";
	var kgflashmediaplayersecurity = document.getElementsByName( 'attachments[' + basename + '][kgflashmediaplayer-security]' )[0].value;
	var url                        = document.getElementById( 'attachments-' + basename + '-kgflashmediaplayer-url' ).value;
	var posterurl                  = document.getElementById( 'attachments-' + basename + '-kgflashmediaplayer-poster' ).value;
	var postid                     = parent.document.getElementById( 'post_ID' ).value;
	if ( jQuery( '#attachments-' + basename + '-featured' ).is( ':checked' ) ) {
		var set_featured = "on";
	} else {
		var set_featured = false;
	}

	jQuery.post(
		ajaxurl,
		{ action:'kgvid_callffmpeg',
			security: kgflashmediaplayersecurity,
			attachmentID: basename,
			movieurl: url,
			ffmpeg_action:'submit',
			poster: posterurl,
			parent_id: postid,
			set_featured:
			set_featured },
		function() {

		},
		"json"
	);

	var shortcode = "";
	if (document.getElementById( 'videotitle' ).value != "") {
		var titlecode = decodeURIComponent( document.getElementsByName( 'attachments[' + basename + '][kgflashmediaplayer-titlecode]' )[0].value );
		titlecode     = titlecode.replace( /\\'/g,'\'' );
		titlecode     = titlecode.replace( /\\"/g,'"' );
		titlecode     = titlecode.replace( /\\0/g,'\0' );
		titlecode     = titlecode.replace( /\\\\/g,'\\' );
		if ( titlecode.substring( 0, 1 ) != '<' ) {
			titlecode = '<' + titlecode;
		}
		if ( titlecode.substring( -1, 1 ) != '>' ) {
			titlecode = titlecode + '>';
		}
		var endtitlecode = titlecode.replace( '<', '</' );
		endtitlecode     = endtitlecode.split( ' ' );
		endtitlecode     = endtitlecode[0];
		if ( endtitlecode.substring( -1, 1 ) != '>' ) {
			endtitlecode = endtitlecode + '>';
		}
		shortcode += titlecode + '<span itemprop="name">' + document.getElementById( 'videotitle' ).value + '</span>' + endtitlecode + '<br />';
	}
	if (url != "") {
		shortcode += ' [videopack';
		if (document.getElementById( 'attachments-' + basename + '-kgflashmediaplayer-poster' ).value != "") {
			shortcode += ' poster="' + document.getElementById( 'attachments-' + basename + '-kgflashmediaplayer-poster' ).value + '"';
		}
		if (document.getElementById( 'attachments-' + basename + '-kgflashmediaplayer-width' ).value != "") {
			shortcode += ' width="' + document.getElementById( 'attachments-' + basename + '-kgflashmediaplayer-width' ).value + '"';
		}
		if (document.getElementById( 'attachments-' + basename + '-kgflashmediaplayer-height' ).value != "") {
			shortcode += ' height="' + document.getElementById( 'attachments-' + basename + '-kgflashmediaplayer-height' ).value + '"';
		}
		if (document.getElementById( 'attachments-' + basename + '-kgflashmediaplayer-track_src' ).value != "") {
			shortcode += ' track_kind="' + document.getElementById( 'attachments-' + basename + '-kgflashmediaplayer-track_kind' ).value + '"';
			shortcode += ' track_src="' + document.getElementById( 'attachments-' + basename + '-kgflashmediaplayer-track_src' ).value + '"';
			if (document.getElementById( 'attachments-' + basename + '-kgflashmediaplayer-track_srclang' ).value != "") {
				shortcode += ' track_srclang="' + document.getElementById( 'attachments-' + basename + '-kgflashmediaplayer-track_srclang' ).value + '"';
			}
			if (document.getElementById( 'attachments-' + basename + '-kgflashmediaplayer-track_label' ).value != "") {
				shortcode += ' track_label="' + document.getElementById( 'attachments-' + basename + '-kgflashmediaplayer-track_label' ).value + '"';
			}
			if (document.getElementById( 'attachments-' + basename + '-kgflashmediaplayer-track_default' ).value == "default") {
				shortcode += ' track_default="default"';
			}
		}
		if (document.getElementById( 'downloadlink' ).checked ) {
			shortcode += ' downloadlink="true"';
		}
		shortcode += ']' + url + '[/videopack] ';
	}

	parent.send_to_editor( shortcode );
}

function kgvid_get_multisite_data(blogID) {

	var blog = {};

	if ( typeof pagenow !== 'undefined' && pagenow == 'settings_page_kgvid_network_video_encoding_queue-network' ) {
		blog.scope     = 'network';
		blog.name_text = '[' + blogID + ']';
		blog.id_text   = blogID + '-';
		blog.ID        = blogID;
	} else if ( typeof pagenow !== 'undefined' && pagenow == 'tools_page_kgvid_video_encoding_queue' && ! isNaN( parseInt( blogID ) ) ) {
		blog.scope     = 'site';
		blog.name_text = '[' + blogID + ']';
		blog.id_text   = blogID + '-';
		blog.ID        = blogID;
	} else {
		blog.scope     = 'site';
		blog.name_text = '';
		blog.id_text   = '';
		blog.ID        = false;
	}

	return blog;

}

function kgvid_cancel_encode(postID, video_key, format, blogID) {

	var blog = kgvid_get_multisite_data( blogID );

	var kgflashmediaplayersecurity = document.getElementsByName( 'attachments' + blog.name_text + '[' + postID + '][kgflashmediaplayer-security]' )[0].value;
	jQuery( '#attachments-' + blog.id_text + postID + '-kgflashmediaplayer-meta' + format ).empty();
	jQuery( '#attachments-' + blog.id_text + postID + '-kgflashmediaplayer-meta' + format ).append( '<strong>' + kgvidL10n.canceling + '</strong>' );
	jQuery.post(
		ajaxurl,
		{ action:"kgvid_cancel_encode", security: kgflashmediaplayersecurity, video_key: video_key, format: format },
		function(canceled) {
			if ( canceled ) {
				jQuery( '#attachments-' + blog.id_text + postID + '-kgflashmediaplayer-meta' + format ).empty();
				jQuery( '#attachments-' + blog.id_text + postID + '-kgflashmediaplayer-meta' + format ).append( '<strong>' + kgvidL10n.canceled + '</strong>' );
				setTimeout( function(){ kgvid_update_encode_queue() }, 3000 );
			}
		}
	);

}

function kgvid_delete_video(movieurl, postID, format, childID, blogID) {

	var delete_for_sure = confirm( kgvidL10n.deletemessage );

	if ( delete_for_sure == true ) {

		var blog                       = kgvid_get_multisite_data( blogID );
		var kgflashmediaplayersecurity = document.getElementsByName( 'attachments' + blog.name_text + '[' + postID + '][kgflashmediaplayer-security]' )[0].value;

		jQuery.post(
			ajaxurl,
			{ action: "kgvid_delete_video",
				security: kgflashmediaplayersecurity,
				movieurl: movieurl,
				format: format,
				childid: childID,
				blogid: blogID
			},
			function(deleted) {

				if ( deleted ) {
					jQuery( '#attachments-' + blog.id_text + postID + '-kgflashmediaplayer-encode' + format ).prop( 'disabled', false );
					jQuery( '#attachments-' + blog.id_text + postID + '-kgflashmediaplayer-encode' ).prop( 'disabled', false );
					jQuery( '#attachments-' + blog.id_text + postID + '-kgflashmediaplayer-encode' ).css( 'display', 'inline' );
					jQuery( '#attachments-' + blog.id_text + postID + '-kgflashmediaplayer-meta' + format ).empty();
					jQuery( '#attachments-' + blog.id_text + postID + '-kgflashmediaplayer-meta' + format ).append( '<strong>' + kgvidL10n.deleted + '</strong>' );
					jQuery( '#attachments-' + postID + '-kgflashmediaplayer-encode' + format ).trigger( 'change' );
					setTimeout( function(){ kgvid_redraw_encode_checkboxes( movieurl, postID, blogID ) }, 3000 );
				} else {
					jQuery( '#attachments-' + blog.id_text + postID + '-kgflashmediaplayer-meta' + format ).empty();
					jQuery( '#attachments-' + blog.id_text + postID + '-kgflashmediaplayer-meta' + format ).append( '<strong>' + kgvidL10n.not_deleted + '</strong>' );
				}

			},
			"text"
		);

	}
}

function kgvid_cancel_thumbs(postID) {

		var thumbnailplaceholderid = "#attachments-" + postID + "-thumbnailplaceholder";
		var thumbnailboxoverlayID  = "#attachments-" + postID + "-kgflashmediaplayer-thumbnailboxoverlay";
		var cancelthumbdivID       = '#attachments-' + postID + '-kgflashmediaplayer-cancelthumbsdiv';
		var kgthumbnailTimeout     = jQuery( thumbnailplaceholderid ).data( "kgthumbnailTimeouts" );

	for ( key in kgthumbnailTimeout ) {
		clearTimeout( kgthumbnailTimeout[key] ); }
		jQuery( '#thumb-video-' + postID ).off( 'seeked.kgvid' );
		jQuery( '#thumb-video-' + postID ).data( 'thumbnail_data', [] );
		jQuery( thumbnailplaceholderid ).data( "kgthumbnailTimeouts", null );

		jQuery( thumbnailboxoverlayID ).fadeTo( 2000, 1 );
		jQuery( cancelthumbdivID ).animate( {opacity: 0, height: 'toggle'}, 500 );

}

function kgvid_update_encode_queue() {

	if ( typeof pagenow !== 'undefined' && ( pagenow == 'tools_page_kgvid_video_encoding_queue' || pagenow == 'settings_page_kgvid_network_video_encoding_queue-network' ) ) {
		if ( pagenow == 'settings_page_kgvid_network_video_encoding_queue-network' ) {
			var page = 'network_queue';
		} else {
			var page = 'queue';
		}
		var kgflashmediaplayersecurity = jQuery( '#video-embed-thumbnail-generator-nonce' ).val();
		var container_element          = jQuery( '#kgvid_encode_queue_table' );
	} else {
		var page          = 'attachment';
		var checkboxes_id = jQuery( '.kgvid_checkboxes_section' ).first().attr( 'id' );
		if ( checkboxes_id ) {
			var post_id                    = checkboxes_id.match( "attachments-(.*)-kgflashmediaplayer-encodeboxes" );
			post_id                        = post_id[1];
			var kgflashmediaplayersecurity = document.getElementsByName( 'attachments[' + post_id + '][kgflashmediaplayer-security]' )[0].value;
			var container_element          = jQuery( '#attachments-' + post_id + '-kgflashmediaplayer-encodeboxes' );
		} else {
			return;
		}
	}

	var encode_queue_timeouts = container_element.data( 'encode_queue_timeouts' );
	for ( key in encode_queue_timeouts ) {
		clearTimeout( encode_queue_timeouts[key] );
	}
	container_element.removeData( 'encode_queue_timeouts' );

	if ( kgflashmediaplayersecurity ) { // sometimes this tries to run after the media modal is closed

		var queued = false;

		jQuery.post(
			ajaxurl,
			{ action:"kgvid_update_encode_queue",
				security: kgflashmediaplayersecurity,
				page: page
			},
			function(data) {

				var check_again = false;

				var time_to_wait = 10000;

				if ( data.queue.length !== 0 && data.queue.length !== undefined ) {
					jQuery.each(
						data.queue,
						function(video_key, video_entry) {

							var blog     = kgvid_get_multisite_data( video_entry.blog_id );
							var queue_id = blog.id_text + video_entry.attachmentID;

							if ( page != "queue"
								&& jQuery( '#attachments-' + queue_id + '-kgflashmediaplayer-encodeboxes' ).length == 0
							) {
								return true;
							}

							if ( video_entry.hasOwnProperty( 'encode_formats' ) ) {

								var currently_encoding = false;

								jQuery.each(
									video_entry.encode_formats,
									function(format, format_entry) {

										if ( format_entry.status == 'encoding' ) {

											currently_encoding = true;
											anything_encoding  = true;
											check_again        = true;

											if ( page == "queue" ) {

												if ( jQuery( '#clear-' + queue_id ).css( "display" ) != "none" ) {
													jQuery( '#clear-' + queue_id ).css( "display", "none" );
												}
												if ( ! jQuery( '#tr-' + queue_id ).hasClass( 'currently_encoding' ) ) {
													jQuery( '#tr-' + queue_id ).addClass( 'currently_encoding' );
												}
												if ( jQuery( '#tr-' + queue_id ).hasClass( 'kgvid_complete' ) ) {
													jQuery( '#tr-' + queue_id ).removeClass( 'kgvid_complete' );
												}

											}

										}

										if ( format_entry.status == 'queued' ) {
											queued = true;
											if ( jQuery( '#tr-' + queue_id ).hasClass( 'kgvid_complete' ) ) {
												jQuery( '#tr-' + queue_id ).removeClass( 'kgvid_complete' );
											}
										}

										if ( format_entry.hasOwnProperty( 'meta_array' ) ) {

											var meta_entry  = jQuery( '#attachments-' + queue_id + '-kgflashmediaplayer-meta' + format );
											var checkbox    = jQuery( '#attachments-' + queue_id + '-kgflashmediaplayer-encode' + format );
											var encode_data = jQuery( '#attachments-' + queue_id + '-kgflashmediaplayer-encodeboxes' ).data( format + '_interval_id' );

											if ( format_entry.status == 'encoding' && typeof encode_data === 'undefined' ) {
												var intervalId = setTimeout( function(){ kgvid_increment_encode_progress( video_entry.attachmentID, blog.id_text, format ) }, 1000 );
												jQuery( '#attachments-' + queue_id + '-kgflashmediaplayer-encodeboxes' ).data( format + '_interval_id', intervalId );
											}

											if ( meta_entry.html() != undefined && format_entry.meta_array.meta != meta_entry.html() ) {
												check_again = true;
												meta_entry.empty();
												meta_entry.html( format_entry.meta_array.meta );
											}

											if ( format_entry.status == "Encoding Complete" ) {
												checkbox.prop( 'checked', false );
											}

											if ( format_entry.meta_array.disabled != ''
												&& checkbox.prop( 'disabled' ) == false
											) {
												checkbox.prop( 'disabled', true );
											} else if ( format_entry.meta_array.disabled == ''
												&& checkbox.prop( 'disabled' ) == true
											) {
												checkbox.prop( 'disabled', false );
											}

										}

									}
								); // end loop through encode formats

							}

							if ( page == 'queue' && currently_encoding == false ) {

								if ( queued == false ) {
									jQuery( '#tr-' + queue_id ).addClass( 'kgvid_complete' );
								}

								if ( jQuery( '#tr-' + queue_id ).hasClass( 'currently_encoding' ) ) {
									jQuery( '#tr-' + queue_id ).removeClass( 'currently_encoding' );
								}
								if ( jQuery( '#tr-' + queue_id + ' #clear-' + queue_id ).css( "display" ) != "block" ) {
									jQuery( '#tr-' + queue_id + ' #clear-' + queue_id ).css( "display", "block" );
								}

							}

						}
					); // end loop through queue

					if ( (page == 'queue' || page == 'network_queue') && ! jQuery( '#kgvid-encode-queue-control' ).hasClass( 'kgvid-queue-control-updating' ) ) {

						var opposite_command = 'play';
						var title            = kgvidL10n.queue_play

						if ( data.queue_control == 'play' ) {
							opposite_command = 'pause';
							var title        = kgvidL10n.queue_pause;
							jQuery( '#kgvid_encode_queue_table, #kgvid_encode_queue_table th, #kgvid_encode_queue_table td' ).not( '.queue_encode_formats' )
								.removeClass( 'kgvid-encode-queue-paused' )
								.removeAttr( 'title' );
							jQuery( '.videopack-encode-button' )
								.removeAttr( 'title' );
						} else {
							jQuery( '#kgvid_encode_queue_table, #kgvid_encode_queue_table th, #kgvid_encode_queue_table td' ).not( '.queue_encode_formats' )
							.addClass( 'kgvid-encode-queue-paused' )
							.attr( 'title', kgvidL10n.queue_paused );
							jQuery( '.videopack-encode-button' )
							.attr( 'title', kgvidL10n.queue_paused );
						}

						jQuery( '#kgvid-encode-queue-control' )
						.removeClass( 'kgvid-encode-queue-control-disabled dashicons-controls-' + data.queue_control )
						.addClass( 'dashicons-controls-' + opposite_command )
						.attr( 'title', title )
						.off( 'click.kgvid' )
						.on( 'click.kgvid', kgvid_queue_control );

					}
				}

				if ( check_again == true ) {
					kgvid_check_queue_again( time_to_wait );
				}

			},
			"json"
		);

	}

}

function kgvid_check_queue_again(time_to_wait) {

	if ( typeof pagenow !== 'undefined'
		&& ( pagenow == 'tools_page_kgvid_video_encoding_queue'
			|| pagenow == 'settings_page_kgvid_network_video_encoding_queue-network'
		)
	) {
		var container_element = jQuery( '#kgvid_encode_queue_table' );
	} else {
		var checkboxes_id = jQuery( '.kgvid_checkboxes_section' ).first().attr( 'id' );
		if ( checkboxes_id ) {
			var post_id           = checkboxes_id.match( "attachments-(.*)-kgflashmediaplayer-encodeboxes" );
			post_id               = post_id[1];
			var container_element = jQuery( '#attachments-' + post_id + '-kgflashmediaplayer-encodeboxes' );
		} else {
			return;
		}
	}

	var encode_queue_timeouts = container_element.data( 'encode_queue_timeouts' );
	if ( encode_queue_timeouts == null ) {
		encode_queue_timeouts = new Array();
	}
	encode_queue_timeout = setTimeout( function(){ kgvid_update_encode_queue() }, time_to_wait );
	encode_queue_timeouts.push( encode_queue_timeout );
	container_element.data( 'encode_queue_timeouts', encode_queue_timeouts );

}

function kgvid_increment_encode_progress(attachmentID, blog_id, format) {

	var meta_entry    = jQuery( '#attachments-' + blog_id + attachmentID + '-kgflashmediaplayer-meta' + format );
	var encoding_time = meta_entry.find( '.kgvid_meter_bar' ).data( 'encoding_time' );

	if ( encoding_time ) {
		encoding_time.current_seconds = encoding_time.current_seconds + (parseInt( encoding_time.fps ) / 30);
		percent_done                  = Math.round( encoding_time.current_seconds / parseInt( encoding_time.duration ) * 100 );
		if ( percent_done > 100 ) {
			percent_done = 100;
		}

		if ( percent_done != 0 ) {
			encoding_time.elapsed++;
			if ( ! isNaN( encoding_time.remaining ) ) {
				if ( encoding_time.remaining > 0 ) {
					encoding_time.remaining--;
				} else {
					encoding_time.remaing = 0;
				}
				var remaining_text = kgvid_convert_to_timecode( encoding_time.remaining, true );
			} else {
				var remaining_text = encoding_time.remaining;
			}

			meta_entry.find( '.kgvid_meter_bar' ).attr( 'style', 'width:' + percent_done.toString() + '%' );
			if ( percent_done >= 20 ) {
				meta_entry.find( '.kgvid_meter_text' ).html( percent_done.toString() + '%' );
			}
			var small_text = kgvidL10n.elapsed + ' ' + kgvid_convert_to_timecode( encoding_time.elapsed, true ) + ' ' + kgvidL10n.remaining + ' ' + remaining_text + ' ' + kgvidL10n.fps + ' ' + encoding_time.fps;
			meta_entry.find( '.kgvid_encoding_small_text small' ).html( small_text );
			meta_entry.find( '.kgvid_meter_bar' ).data( 'encoding_time', encoding_time );
		}

	}

	var status = meta_entry.find( 'strong' ).data( 'status' );

	if ( typeof status !== 'undefined' && status != 'encoding' ) {
		var intervalId = meta_entry.parents( '.kgvid_checkboxes_section' ).data( format + '_interval_id' );
		if ( typeof intervalId !== 'undefined' ) {
			clearInterval( intervalId );
			meta_entry.parents( '.kgvid_checkboxes_section' ).removeData( format + '_interval_id' );
			kgvid_check_queue_again( 1000 );
		}

	}
	if ( typeof status !== 'undefined' && status == 'encoding' ) {
		meta_entry.parents( '.kgvid_checkboxes_section' ).data( format + '_interval_id', intervalId );
		var intervalId = setTimeout( function(){ kgvid_increment_encode_progress( attachmentID, blog_id, format ) }, 1000 );
	}

}

function kgvid_redraw_encode_checkboxes(movieurl, postID, blogID) {

	var blog = kgvid_get_multisite_data( blogID );

	if ( typeof pagenow !== 'undefined'
		&& ( pagenow == 'settings_page_kgvid_network_video_encoding_queue-network'
			|| pagenow == 'tools_page_kgvid_video_encoding_queue'
		)
	) {
		page = 'queue';
	} else {
		page = 'attachment';
	}

	var kgflashmediaplayersecurity = document.getElementsByName( 'attachments' + blog.name_text + '[' + postID + '][kgflashmediaplayer-security]' );

	if ( kgflashmediaplayersecurity.length
		&& typeof kgflashmediaplayersecurity[0].value != 'undefined'
	) { // sometimes this tries to run after the media modal is closed

		var kgvid_encode = kgvid_list_videos_to_encode( postID, blog );

		jQuery.post(
			ajaxurl,
			{ action:"kgvid_generate_encode_checkboxes",
				security: kgflashmediaplayersecurity[0].value,
				movieurl: movieurl,
				post_id: postID,
				page: page,
				blog_id: blog.ID,
				encodeformats: kgvid_encode
			},
			function(data) {

				var encodebox = '#attachments-' + blog.id_text + postID + '-kgflashmediaplayer-encodeboxes';
				checkboxData  = jQuery( encodebox ).data();
				jQuery( encodebox ).replaceWith( data.checkboxes );
				jQuery( encodebox ).data( checkboxData );

				if ( page == "queue" ) {
					jQuery( '#tr-' + blog.id_text + postID + '.currently_encoding' ).removeClass( 'currently_encoding' );
					jQuery( '#tr-' + blog.id_text + postID + ' #clear-' + postID ).css( "display", "block" );
					if ( data.encoding == true ) {
						jQuery( '#clear-' + blog.id_text + postID ).css( "display", "none" );
						jQuery( '#tr-' + blog.id_text + postID ).addClass( 'currently_encoding' );
					}

				}

				setTimeout( function(){ kgvid_update_encode_queue() }, 5000 ); // start the loop
				jQuery( encodebox ).removeAttr( 'style' );

				jQuery( document.body ).trigger( 'post-load' );

			},
			"json"
		);
	}
}

function kgvid_redraw_thumbnail_box(postID) {

	var kgflashmediaplayersecurity = document.getElementsByName( 'attachments[' + postID + '][kgflashmediaplayer-security]' );

	if ( kgflashmediaplayersecurity.length
		&& typeof kgflashmediaplayersecurity[0].value != 'undefined'
	) { // sometimes this tries to run after the media modal is closed

		jQuery.post(
			ajaxurl,
			{ action:"kgvid_redraw_thumbnail_box",
				security: kgflashmediaplayersecurity[0].value,
				post_id: postID
			},
			function(data) {
				if ( data.thumb_url ) {
					jQuery( '#attachments-' + postID + '-thumbnailplaceholder' ).html( '<div class="kgvid_thumbnail_box kgvid_chosen_thumbnail_box"><img width="200" src="' + data.thumb_url + '?' + Math.floor( Math.random() * 10000 ) + '"></div>' );
					jQuery( '#attachments-' + postID + '-kgflashmediaplayer-poster' ).val( data.thumb_url );
					if ( data.thumbnail_size_url ) {
						basename = data.thumb_url.substring( data.thumb_url.lastIndexOf( '/' ) + 1, data.thumb_url.indexOf( '_thumb' ) )
						jQuery( '.attachment-preview.type-video:contains(' + basename + ')' ).parent().find( 'img' )
						.attr( 'src', data.thumbnail_size_url + '?' + Math.floor( Math.random() * 10000 ) )
						.css( 'width', '100%' )
						.css( 'height', '100%' )
						.css( 'padding-top', '0' );
					}
					if ( data.thumb_id ) {
						wp.media.featuredImage.set(data.thumb_id);
					}
					jQuery( '#attachments-' + postID + '-kgflashmediaplayer-poster' ).trigger( 'change' );

				} else if ( data.thumb_error ) {
					jQuery( '#attachments-' + postID + '-thumbnailplaceholder' ).html( '<div class="kgvid_thumbnail_box kgvid_chosen_thumbnail_box"><span>' + data.thumb_error + '</span></div>' );
				} else {
					setTimeout( function(){ kgvid_redraw_thumbnail_box( postID ) }, 5000 );
				}

			},
			"json"
		);

	}
}

function kgvid_encode_queue(action, order, id, blogID) {

	var blog = kgvid_get_multisite_data( blogID );

	var CheckboxTimeout = jQuery( '#wpwrap' ).data( "KGVIDCheckboxTimeout" ) || null;
	if ( CheckboxTimeout ) {
		clearTimeout( CheckboxTimeout );
	}

	var kgflashmediaplayersecurity = jQuery( '#video-embed-thumbnail-generator-nonce' ).val();

	if ( action == "delete" ) {
		jQuery( '#tr-' + blog.id_text + id ).fadeTo( 'slow', 0.5 );
		jQuery.post(
			ajaxurl,
			{ action:"kgvid_clear_queue_entry",
				security: kgflashmediaplayersecurity,
				index: order,
				scope: blog.scope
			},
			function(data) {
				if ( data ) {
					jQuery( 'table.widefat > tbody' ).replaceWith( "<tbody class='rows'>" + data + "</tbody>" );
				}
			},
			"html"
		);
	}

	if ( action == "clear_completed" ) {
		jQuery( 'tbody > .kgvid_complete' ).fadeTo( 'slow', 0.5 );
		jQuery.post(
			ajaxurl,
			{ action:"kgvid_clear_completed_queue",
				security: kgflashmediaplayersecurity,
				type:"manual",
				scope: blog.scope
			},
			function(data) {
				if ( data ) {
					jQuery( 'table.widefat > tbody' ).replaceWith( "<tbody class='rows'>" + data + "</tbody>" );
				}
			},
			"html"
		);
	}

	if ( action == "clear_queued" ) {

		var clear_for_sure = confirm( kgvidL10n.clearqueuedwarning + "\n" + kgvidL10n.cancel_ok );

		if ( clear_for_sure == true ) {
			jQuery( 'tbody > .kgvid_queued' ).fadeTo( 'slow', 0.5 );
			jQuery.post(
				ajaxurl,
				{ action:"kgvid_clear_completed_queue",
					security: kgflashmediaplayersecurity,
					type:"queued", scope: blog.scope
				},
				function(data) {
					if ( data ) {
						jQuery( 'table.widefat > tbody' ).replaceWith( "<tbody class='rows'>" + data + "</tbody>" );
					}
				},
				"html"
			);
		}

	}

	if ( action == "clear_all" ) {

		var clear_for_sure = confirm( kgvidL10n.clearallwarning + "\n" + kgvidL10n.cancel_ok );

		if ( clear_for_sure == true ) {
			jQuery( 'tbody > .kgvid_queued' ).fadeTo( 'slow', 0.5 );
			jQuery.post(
				ajaxurl,
				{ action:"kgvid_clear_completed_queue",
					security: kgflashmediaplayersecurity,
					type:"all",
					scope: blog.scope
				},
				function(data) {
					if ( data ) {
						jQuery( 'table.widefat > tbody' ).replaceWith( "<tbody class='rows'>" + data + "</tbody>" );
					}
				},
				"html"
			);
		}

	}

}

function kgvid_queue_control() {

	var blog                       = kgvid_get_multisite_data( 1 ); // dummy blog id since we only need the scope
	var kgflashmediaplayersecurity = jQuery( '#video-embed-thumbnail-generator-nonce' ).val();
	var command                    = 'pause';
	var opposite_command           = 'play';
	var title                      = kgvidL10n.queue_play

	if ( jQuery( '#kgvid-encode-queue-control' ).hasClass( 'dashicons-controls-play' ) ) { // queue is paused
		var command          = 'play';
		var opposite_command = 'pause';
		var title            = kgvidL10n.queue_pause;
	}

	jQuery( '#kgvid-encode-queue-control' ).addClass( 'kgvid-encode-queue-control-disabled kgvid-queue-control-updating' ).attr( 'title', kgvidL10n.loading ).off( 'click.kgvid' );

	jQuery.post(
		ajaxurl,
		{ action:"kgvid_queue_control",
			security: kgflashmediaplayersecurity,
			command:command,
			scope: blog.scope
		},
		function(success) {
			if ( success ) {
				jQuery( '#kgvid-encode-queue-control' ).removeClass( 'kgvid-encode-queue-control-disabled kgvid-queue-control-updating dashicons-controls-' + command ).addClass( 'dashicons-controls-' + opposite_command ).attr( 'title', title ).on( 'click.kgvid', kgvid_queue_control );
				kgvid_check_queue_again( 250 );
			}
		},
		"html"
	);

}

function kgvid_save_plugin_settings(input_obj) {

	jQuery( '#setting-error-options-reset' ).fadeOut() // if settings were reset previously, clear the warning
	jQuery( '.settings-error' ).fadeOut(); // clear error messages

	var kgflashmediaplayersecurity = document.getElementById( "kgvid_settings_security" ).value;
	var setting_value              = input_obj.value;

	if ( input_obj.type == "checkbox" ) {
		if ( input_obj.checked ) {
			setting_value = "on";
		} else {
			setting_value = false;
		}
	}

	var save_span = '<span id="save_' + input_obj.id + '" class="attachment-details save-waiting kgvid_spinner"><span class="settings-save-status"><span class="spinner"></span><span class="saved">' + kgvidL10n.saved + '</span></span></span>';
	if ( jQuery( input_obj ).parents( ".kgvid_video_app_required" ).length ) {
		jQuery( input_obj ).parents( ".kgvid_video_app_required" ).append( save_span );
	} else {
		jQuery( input_obj ).parents( "td:first" ).append( save_span );
	}

	if ( jQuery( input_obj ).hasClass( 'affects_ffmpeg' ) == true ) {
		jQuery( '#ffmpeg_h264_sample,#ffmpeg_output' ).html( kgvidL10n.saving );  }

	function kgvid_ajax_save() {

		var disabled_fields = jQuery( 'form :disabled' ); // temporarily enable disabled fields so they can be serialized
		disabled_fields.prop( 'disabled', false );
		var all_settings = jQuery( 'form' ).serialize();
		disabled_fields.prop( 'disabled', true );

		jQuery.post(
			ajaxurl,
			{ action:"kgvid_save_settings",
				security: kgflashmediaplayersecurity,
				setting: save_queue[0].id,
				value: setting_value,
				all_settings: all_settings
			},
			function(data) {

				if ( data != false ) {

					if ( input_obj.type != "checkbox" ) {
						jQuery( input_obj ).val( data.validated_value );
					}

					if ( data.error_message != "" ) {
						jQuery( input_obj ).parents( "td:first" ).append( '<div class="error settings-error"><p><strong>' + data.error_message + '</strong></p>' );
					}
					if ( save_queue[0].id == "width" || save_queue[0].id == "height" ) {
						var dimension = "";
						if ( save_queue[0].id == "height" ) {
							dimension = parseInt( data.validated_value ) + 25;
						} else {
							dimension = data.validated_value
						}
						jQuery( '#kgvid_samplevideo' ).attr( save_queue[0].id, dimension );
						jQuery( '.kgvid_setting_nearvid' ).width( jQuery( '#width' ).val() );
					}
					if ( save_queue[0].id == "app_path" || save_queue[0].id == "video_app" ) {
						jQuery( '#app_path' ).val( data.app_path );
						jQuery( '#app_path' ).data( 'ffmpeg_exists', data.ffmpeg_exists );
						kgvid_hide_plugin_settings();
					}
					if ( jQuery( input_obj ).hasClass( 'affects_player' ) == true ) {
						jQuery( '#kgvid_samplevideo' ).attr( 'src', function ( i, val ) { return val; } ); // reload the video iframe
					}

					if ( data.auto_thumb_label != "" ) {
						jQuery( '#auto_thumb_label' ).html( data.auto_thumb_label );
						jQuery( '#auto_thumb_label :input' ).on( 'change', function() { kgvid_save_plugin_settings( this ); } );
					}

					if ( jQuery( '#app_path' ).data( 'ffmpeg_exists' ) == "on" && jQuery( input_obj ).hasClass( 'affects_ffmpeg' ) == true && jQuery( '#ffmpeg_output' ).length != 0 ) {

						if ( jQuery( '.kgvid_custom_format' ).filter( function() { return jQuery( this ).val(); } ).length == 0 ) { // if there's no custom format anymore
							if ( jQuery( '#sample_format' ).val() == 'custom' ) {
								jQuery( '#sample_format' ).val( 'mobile' );
							}
							jQuery( '#sample_format' ).find( 'option[value="custom"]' ).remove();
						} else {
							if ( jQuery( '#sample_format' ).find( 'option[value="custom"]' ).length == 0 ) {
								jQuery( '#sample_format' ).append( '<option value="custom">' + kgvidL10n.custom + '</option>' );
							}
						}

						jQuery( '#ffmpeg_output' ).html( kgvidL10n.runningtest );
						jQuery( '#ffmpeg_h264_sample' ).html( data.encode_string );
						jQuery( '#ffmpeg_watermark_example' ).slideUp( 'slow' );
						jQuery.post(
							ajaxurl,
							{ action: "kgvid_test_ffmpeg",
								security: kgflashmediaplayersecurity
							},
							function(data) {
								jQuery( '#ffmpeg_output' ).html( data.output );
								if ( 'watermark_preview' in data ) {
									jQuery( '#ffmpeg_watermark_example' ).empty().append( '<img src="' + data.watermark_preview + '?' + String( Math.floor( (Math.random() * 1000) + 1 ) ) + '" style="margin-top:10px;width:640px;">' ).slideDown( 'slow' );
								}
							},
							"json"
						);
					}

					if ( jQuery( '#ffmpeg_thumb_watermark_url' ).val() != '' && jQuery( '#app_path' ).data( 'ffmpeg_exists' ) == "on" && jQuery( input_obj ).hasClass( 'affects_ffmpeg_thumb_watermark' ) == true && jQuery( '#ffmpeg_output' ).length != 0 ) {
						jQuery( '#browser_thumbnails' ).prop( 'checked', false ).prop( 'disabled', true ); // can't allow in-browser thumbnails with FFMPEG watermark
						jQuery.post(
							ajaxurl,
							{ action: "kgvid_test_ffmpeg_thumb_watermark",
								security: kgflashmediaplayersecurity
							},
							function(thumb_url) {
								if ( thumb_url ) {
									jQuery( '#ffmpeg_thumb_watermark_example' ).empty().append( '<img src="' + thumb_url + '?' + String( Math.floor( (Math.random() * 1000) + 1 ) ) + '" style="margin-top:10px;width:640px;">' ).slideDown( 'slow' );
								}
							},
							"text"
						);
					} else {
						jQuery( '#ffmpeg_thumb_watermark_example' ).empty();
						jQuery( '#browser_thumbnails' ).prop( 'disabled', false );
					}

					jQuery( '#save_' + save_queue[0].id ).toggleClass( 'save-waiting save-complete' ).delay( 1500 ).fadeOut( 1000, function(){ jQuery( this ).remove(); } );

					save_queue = jQuery( '#wpbody-content' ).data( 'save_queue' );
					save_queue.splice( 0,1 );
					jQuery( '#wpbody-content' ).data( 'save_queue', save_queue );
					if ( save_queue.length > 0 ) {
						kgvid_ajax_save();
					}

				} else {
					jQuery( '#save_' + save_queue[0].id ).remove();
					jQuery( input_obj ).parents( "td:first" ).append( '<div class="error settings-error"><p><strong>' + kgvidL10n.not_saved + '</strong></p>' );
				}

			},
			"json"
		);

	}

	save_queue = jQuery( '#wpbody-content' ).data( 'save_queue' );
	if ( save_queue == undefined || save_queue.length == 0 ) {
		var save_queue = [{ 'id':input_obj.id, 'value':setting_value }];
	} else {
		save_queue.push( { 'id':input_obj.id, 'value':setting_value } );
	}
	jQuery( '#wpbody-content' ).data( 'save_queue', save_queue );
	if ( save_queue.length == 1 ) {
		kgvid_ajax_save();
	}

}

function kgvid_embeddable_switch(checked) {

	var overlay_embedcode = jQuery( "#overlay_embedcode" );
	var open_graph        = jQuery( "#open_graph" );
	var oembed_provider   = jQuery( "#oembed_provider" );

	if (checked == false) {
		overlay_embedcode[0].checked  = false;
		overlay_embedcode[0].disabled = true;
		overlay_embedcode.trigger( 'change' );
		open_graph[0].checked  = false;
		open_graph[0].disabled = true;
		open_graph.trigger( 'change' );
		oembed_provider[0].checked  = false;
		oembed_provider[0].disabled = true;
	} else {
		overlay_embedcode[0].disabled = false;
		open_graph[0].disabled        = false;
		oembed_provider[0].disabled   = false;
	}
}

function kgvid_switch_settings_tab(tab) {

	if ( tab == "encoding" ) {

		jQuery( "#general_tab" ).removeClass( "nav-tab-active" );
		jQuery( "#encoding_tab" ).addClass( "nav-tab-active" );

		jQuery( '#header_kgvid_video_embed_playback_settings, #header_kgvid_video_embed_plugin_settings' ).hide();
		jQuery( '#header_kgvid_video_embed_encode_settings' ).show();
		jQuery( '#header_kgvid_video_embed_encode_test_settings' ).show();

		jQuery( '#table_kgvid_video_embed_embed_method, #table_kgvid_video_embed_playback_settings, #table_kgvid_video_embed_flash_settings, #table_kgvid_video_embed_plugin_settings' ).hide();
		jQuery( ".kgvid_setting_nearvid" ).hide();
		jQuery( '#table_kgvid_video_embed_encode_settings' ).show();
		jQuery( '#table_kgvid_video_embed_encode_test_settings' ).show();

		if ( jQuery( '#app_path' ).data( 'ffmpeg_exists' ) == "on" && jQuery( '#ffmpeg_output' ).html() == "" ) {
			jQuery( '#ffmpeg_output' ).html( 'Running test...' );
			var kgflashmediaplayersecurity = document.getElementById( "kgvid_settings_security" ).value;
			jQuery.post(
				ajaxurl,
				{ action: "kgvid_test_ffmpeg",
					security: kgflashmediaplayersecurity
				},
				function(data) {
					jQuery( '#ffmpeg_output' ).html( data.output );
					jQuery( '#ffmpeg_watermark_example' ).empty();
					if ( 'watermark_preview' in data ) {
						jQuery( '#ffmpeg_watermark_example' ).append( '<img src="' + data.watermark_preview + '?' + String( Math.floor( (Math.random() * 1000) + 1 ) ) + '" style="margin-top:10px;width:640px;">' );
					}
				},
				"json"
			);
			if ( jQuery( '#ffmpeg_thumb_watermark_url' ).val() != '' ) {
				jQuery.post(
					ajaxurl,
					{ action: "kgvid_test_ffmpeg_thumb_watermark",
						security: kgflashmediaplayersecurity
					},
					function(thumb_url) {
						if ( thumb_url !== '' ) {
							jQuery( '#ffmpeg_thumb_watermark_example' ).empty().append( '<img src="' + thumb_url + '?' + String( Math.floor( (Math.random() * 1000) + 1 ) ) + '" style="margin-top:10px;width:640px;">' ).slideDown( 'slow' );
						}

					},
					"text"
				);
			}
		}
	} else { // General tab

		var playback_option = jQuery( '#embed_method' ).val();

		jQuery( "#general_tab" ).addClass( "nav-tab-active" );
		jQuery( "#encoding_tab" ).removeClass( "nav-tab-active" );

		jQuery( '#header_kgvid_video_embed_playback_settings, #header_kgvid_video_embed_plugin_settings' ).show();
		jQuery( '#header_kgvid_video_embed_encode_settings' ).hide();
		jQuery( '#header_kgvid_video_embed_encode_test_settings' ).hide();

		jQuery( '#table_kgvid_video_embed_embed_method, #table_kgvid_video_embed_playback_settings, #table_kgvid_video_embed_flash_settings, #table_kgvid_video_embed_plugin_settings' ).show();
		jQuery( ".kgvid_setting_nearvid" ).show();

		jQuery( '#table_kgvid_video_embed_encode_settings' ).hide();
		jQuery( '#table_kgvid_video_embed_encode_test_settings' ).hide();

	}

	kgvid_hide_plugin_settings();
	if ( jQuery( '#video_app' ).length > 0 ) {
		kgvid_hide_ffmpeg_settings();
	}

}

function kgvid_hide_plugin_settings() {

	var playback_option = jQuery( '#embed_method' ).val();
	var ffmpeg_exists   = jQuery( '#app_path' ).data( 'ffmpeg_exists' );
	var general_tab     = jQuery( '#general_tab' ).hasClass( 'nav-tab-active' );
	var encoding_tab    = jQuery( '#encoding_tab' ).hasClass( 'nav-tab-active' );

	if ( general_tab ) {

		if ( playback_option == "WordPress Default" ) {
			jQuery( '#nativecontrolsfortouch' ).parents().eq( 1 ).hide();
			jQuery( '#js_skin' ).parents().eq( 1 ).hide();
			jQuery( '#resize_div' ).hide();
		}

		if ( playback_option == "Video.js" || playback_option == "Video.js v7" ) {
			jQuery( '#nativecontrolsfortouch' ).parents().eq( 1 ).show();
			jQuery( '#js_skin' ).parents().eq( 1 ).show();
			jQuery( '#playback_rate' ).parents().eq( 1 ).show();
			jQuery( '#auto_res' ).parents().eq( 1 ).show();
			jQuery( '#resize_div' ).show();
		}

		if ( playback_option == "WordPress Default" ) {
			jQuery( '#auto_res' ).parents().eq( 1 ).show();
			jQuery( '#playback_rate' ).parents().eq( 1 ).show();
		}

		jQuery( '#endofvideooverlay' ).parents().eq( 1 ).show();

		if ( jQuery( '#twitter_button' ).prop( 'checked' ) || jQuery( '#twitter_card' ).prop( 'checked' ) ) {
			jQuery( '#twitter_username_div' ).slideDown();
		} else {
			jQuery( '#twitter_username_div' ).slideUp();
		}

		if ( jQuery( '#auto_res' ).val() == 'automatic' ) {
			jQuery( '#pixel_ratio_p' ).slideDown();
		} else {
			jQuery( '#pixel_ratio_p' ).slideUp();
		}

	}

	if ( encoding_tab ) {

		kgvid_moov_setting();

	}

	if ( ffmpeg_exists == "notinstalled" ) {
		jQuery( ".kgvid_video_app_required" ).addClass( "kgvid_thumbnail_overlay" );
		jQuery( ".kgvid_video_app_required" ).attr( 'title', kgvidL10n.ffmpegrequired );
		jQuery( ".kgvid_video_app_required :input" ).prop( 'disabled', true );
		jQuery( "#ffmpeg_sample_div" ).slideUp( 1000 );

	}
	if ( ffmpeg_exists == "on" ) {
		jQuery( ".kgvid_video_app_required" ).removeClass( "kgvid_thumbnail_overlay" );
		jQuery( ".kgvid_video_app_required :input" ).prop( 'disabled', false );
		jQuery( ".kgvid_video_app_required" ).removeAttr( 'title' );
		jQuery( "#ffmpeg_sample_div" ).slideDown( 1000 );
	}

	if ( jQuery( '#ffmpeg_thumb_watermark_url' ).val() !== '' ) {
		jQuery( '#browser_thumbnails' ).prop( 'disabled', true );
	}

}

function kgvid_hide_ffmpeg_settings() {

	var video_app = jQuery( '#video_app' ).val();

	if (video_app == "ffmpeg") {
		jQuery( '#video_bitrate_flag' ).parents().eq( 2 ).show();
	}
	if (video_app == "avconv") {
		jQuery( '#video_bitrate_flag' ).parents().eq( 2 ).hide();
		video_app = "libav";
	}

	jQuery( '.video_app_name' ).html( video_app.toUpperCase() );

}

function kgvid_moov_setting() {

	var moov = jQuery( '#moov' ).val();

	if ( moov == 'none' || moov == 'movflag' ) {
		jQuery( '#moov_path_p' ).hide();
	} else {
		jQuery( '.kgvid_moov_option' ).html( moov );
		jQuery( '#moov_path_p' ).show();
	}

}

function kgvid_change_replace_format() {

	var replace_format_text = jQuery( '#replace_format option:selected' ).text();
	jQuery( 'span.kgvid_replace_format' ).html( replace_format_text );

}

function kgvid_hide_watermark_url(obj) {

	if ( obj.value == 'custom' ) {
		jQuery( '#watermark_url' ).fadeIn().removeAttr( 'style' );
	} else {
		jQuery( '#watermark_url' ).fadeOut();
		if ( jQuery( '#watermark_url' ).val() != '' ) {
			jQuery( '#watermark_url' ).val( '' ).trigger( 'change' );
		}
	}

}

function kgvid_hide_paginate_gallery_setting(obj) {

	if ( obj.checked ) {
		jQuery( '#gallery_per_page' ).val( '9' );
		jQuery( '#gallery_per_page_span' ).fadeIn().removeAttr( 'style' );
	} else {
		jQuery( '#gallery_per_page_span' ).fadeOut();
		jQuery( '#gallery_per_page' ).val( '' );
	}

}

function kgvid_set_bitrate_display() {

	var resolutions = [1080, 720, 360];
	var multiplier  = jQuery( '#bitrate_multiplier' ).val();
	for (var i = 0;i < resolutions.length;i++) {
		var video_width = Math.round( resolutions[i] * 1.7777 );
		jQuery( '#' + resolutions[i] + '_bitrate' ).html( Math.round( resolutions[i] * video_width * 30 * multiplier / 1024 ) );
	}

}

function kgvid_set_all_featured() {

	var set_for_sure = confirm( kgvidL10n.featuredwarning + "\n" + kgvidL10n.cancel_ok );

	if ( set_for_sure == true ) {
		var kgflashmediaplayersecurity = document.getElementById( "kgvid_settings_security" ).value;
		jQuery( 'td:contains(Set all as featured)' ).append( '<div id="set_featured_meter" class="kgvid_meter"><div class="kgvid_meter_bar" style="width:0%;"><div class="kgvid_meter_text"></div></div></div><span id="set_featured_status"> ' + kgvidL10n.processing + '</span>' );
		jQuery.post(
			ajaxurl,
			{ action: "kgvid_get_set_featured",
				security: kgflashmediaplayersecurity
			},
			function(count) {
				jQuery.post(
					ajaxurl,
					{ action: "kgvid_set_featured",
						security: kgflashmediaplayersecurity
					}
				);
				var interval = setInterval( function(){kgvid_check_cms_progress( count, 'set_featured' )}, 1000 );
				jQuery( '#wpbody-content' ).data( 'set_featured_interval', interval );
			},
			"text"
		);
	}
}

function kgvid_switch_parents() {

	var new_parent = document.getElementById( "thumb_parent" ).value;
	var old_parent = "video";
	if (new_parent == "video") {
		old_parent       = "post";
		var set_for_sure = confirm( kgvidL10n.parentwarning_videos + "\n " + kgvidL10n.cancel_ok );
	} else {
		var set_for_sure = confirm( kgvidL10n.parentwarning_posts + "\n " + kgvidL10n.cancel_ok );
	}

	if ( set_for_sure == true ) {
		var kgflashmediaplayersecurity = document.getElementById( "kgvid_settings_security" ).value;
		jQuery( '#thumb_parent' ).parent().append( '<div id="switching_parents_meter" class="kgvid_meter"><div class="kgvid_meter_bar" style="width:0%;"><div class="kgvid_meter_text"></div></div></div><span id="switching_parents_status"> ' + kgvidL10n.processing + '</span>' );
		jQuery.post(
			ajaxurl,
			{ action: "kgvid_get_switch_parents",
				security: kgflashmediaplayersecurity,
				parent: new_parent
			},
			function(count) {
				jQuery.post( ajaxurl,
					{ action: "kgvid_switch_parents",
						security: kgflashmediaplayersecurity,
						parent: new_parent
					}
				);
				var interval = setInterval( function(){kgvid_check_cms_progress( count, 'switching_parents' )}, 1000 );
				jQuery( '#wpbody-content' ).data( 'switching_parents_interval', interval );
			},
			"text"
		);
	}
}

function kgvid_auto_generate_old(type) {

	var kgflashmediaplayersecurity = document.getElementById( "kgvid_settings_security" ).value;

	jQuery.post(
		ajaxurl,
		{ action: "kgvid_get_generating_old",
			type: type,
			security: kgflashmediaplayersecurity
		},
		function(attachments) {

			if ( parseInt( attachments ) > 0 ) {

				if ( type == 'thumbs' ) {
					var set_for_sure = confirm( kgvidL10n.autothumbnailwarning + attachments + "\n\n " + kgvidL10n.cancel_ok );
				}
				if ( type == 'encode' ) {
					var set_for_sure = confirm( kgvidL10n.autoencodewarning + "\n\n " + kgvidL10n.cancel_ok );
				}

				if ( set_for_sure == true ) {

					jQuery( '#generate_old_' + type + '_button' ).parent().append( '<div id="generating_old_' + type + '_meter" class="kgvid_meter"><div class="kgvid_meter_bar" style="width:0%;"><div class="kgvid_meter_text"></div></div></div><span id="generating_old_' + type + '_status"> ' + kgvidL10n.processing + '</span>' );

					jQuery.post( ajaxurl,
						{ action: "kgvid_generating_old",
							type: type,
							security: kgflashmediaplayersecurity
						}
					);
					var interval = setInterval( function(){kgvid_check_cms_progress( parseInt( attachments ), 'generating_old_' + type )}, 1000 );
					jQuery( '#wpbody-content' ).data( 'generating_old_' + type + '_interval', interval );

				}// end if sure

			}//end if any attachments
			else {
				alert( kgvidL10n.nothumbstomake );
			}

		},
		'text'
	);

}

function kgvid_check_cms_progress(total, cms_type) {
	var kgflashmediaplayersecurity = document.getElementById( "kgvid_settings_security" ).value;
	var interval                   = jQuery( '#wpbody-content' ).data( cms_type + '_interval' );
	if ( interval != "" ) {
		jQuery.post(
			ajaxurl,
			{ action: "kgvid_update_cms_progress",
				security: kgflashmediaplayersecurity,
				cms_type: cms_type
			},
			function(remaining) {
				var percent_done = Math.round( parseInt( total - remaining ) / parseInt( total ) * 100 ) + '%';
				jQuery( '#' + cms_type + '_meter .kgvid_meter_bar' ).css( 'width', percent_done );
				jQuery( '#' + cms_type + '_meter .kgvid_meter_text' ).html( total - remaining + '/' + total );
				if ( remaining == 0 ) {
					clearInterval( interval );
					jQuery( '#wpbody-content' ).data( cms_type + '_interval', '' );
					jQuery( '#' + cms_type + '_status' ).html( ' ' + kgvidL10n.complete );
					setTimeout( function(){ jQuery( '#' + cms_type + '_meter, #' + cms_type + '_status' ).fadeOut( "normal", function(){ jQuery( this ).remove(); } ); }, 3000 );
				}
			},
			"text"
		);
	}
}

function kgvid_clear_transient_cache() {

	var kgflashmediaplayersecurity = document.getElementById( "kgvid_settings_security" ).value;
	var button_text                = jQuery( '#clear_transient_cache' ).html();
	jQuery( '#clear_transient_cache' ).html( kgvidL10n.clearingcache );

	jQuery.post(
		ajaxurl,
		{ action: "kgvid_clear_transient_cache",
			security: kgflashmediaplayersecurity
		},
		function() {
			jQuery( '#clear_transient_cache' ).html( button_text );
		}
	);

}

function kgvid_pick_image(button) {

		var frame;

		jQuery(
			function() {

				// Build the choose from library frame.

				var $el = jQuery( button );
				if ( typeof event !== 'undefined' ) {
					event.preventDefault();
				}

				// If the media frame already exists, reopen it.
				if ( frame ) {
					frame.open();
					return;
				}

				// Create the media frame.
				frame = wp.media.frames.customHeader = wp.media(
					{
						// Set the title of the modal.
						title: $el.data( 'choose' ),

						// Tell the modal to show only images.
						library: {
							type: 'image'
						},

						// Customize the submit button.
						button: {
							// Set the text of the button.
							text: $el.data( 'update' ),
							close: true
						}
					}
				);

				// When an image is selected, run a callback.
				frame.on(
					'select',
					function() {
						// Grab the selected attachment.
						var attachment = frame.state().get( 'selection' ).first();
						jQuery( '#' + $el.data( 'change' ) ).val( attachment.attributes.url );
						if ( $el.data( 'change' ).substring( -25 ) == "kgflashmediaplayer-poster" ) {
							jQuery( '#' + $el.data( 'change' ).slice( 0, -25 ) + 'thumbnailplaceholder' ).html( '<div class="kgvid_thumbnail_box kgvid_chosen_thumbnail_box"><img width="200" src="' + attachment.attributes.url + '"></div>' );
						}
						jQuery( '#' + $el.data( 'change' ) ).trigger( 'change' );
					}
				);

				frame.open();
			}
		);

}

function kgvid_pick_attachment(button) {

		var frame;

		jQuery(
			function() {

				// Build the choose from library frame.

				var $el = jQuery( button );
				if ( typeof event !== 'undefined' ) {
					event.preventDefault();
				}

				// If the media frame already exists, reopen it.
				if ( frame ) {
					frame.open();
					return;
				}

				// Create the media frame.
				frame = wp.media.frames.customHeader = wp.media(
					{
						// Set the title of the modal.
						title: $el.data( 'choose' ),

						// Customize the submit button.
						button: {
							// Set the text of the button.
							text: $el.data( 'update' ),
							close: true
						}
					}
				);

				// When an image is selected, run a callback.
				frame.on(
					'select',
					function() {
						// Grab the selected attachment.
						var attachment = frame.state().get( 'selection' ).first();
						jQuery( '#' + $el.data( 'change' ) ).val( attachment.attributes.url );
						jQuery( '#' + $el.data( 'change' ) ).trigger( 'change' );
					}
				);

				frame.open();
			}
		);

}

function kgvid_pick_format(button, parentID, mime, format, movieurl, blog_id) {

		var frame;

		jQuery(
			function() {

				// Build the choose from library frame.

				var $el = jQuery( button );
				if ( typeof event !== 'undefined' ) {
					event.preventDefault();
				}

				// If the media frame already exists, reopen it.
				if ( frame ) {
					frame.open();
					return;
				}

				// Create the media frame.
				frame = wp.media.frames.customHeader = wp.media(
					{
						// Set the title of the modal.
						title: $el.data( 'choose' ),

						// Tell the modal to show only videos matching the mime type.
						library: {
							type: mime
						},

						// Customize the submit button.
						button: {
							// Set the text of the button.
							text: $el.data( 'update' ),
							close: true
						}
					}
				);

				// When an image is selected, run a callback.
				frame.on(
					'select',
					function() {
						// Grab the selected attachment.
						var video                      = frame.state().get( 'selection' ).first();
						var kgflashmediaplayersecurity = document.getElementsByName( 'attachments[' + parentID + '][kgflashmediaplayer-security]' )[0].value;

						jQuery.post(
							ajaxurl,
							{ action:"kgvid_update_child_format",
								security: kgflashmediaplayersecurity,
								parent_id: parentID,
								video_id: video.id,
								format: format,
								blog_id: blog_id
							},
							function(data) {
								kgvid_redraw_encode_checkboxes( movieurl, parentID, blog_id );
							},
							"json"
						);

					}
				);

				frame.open();
			}
		);

}

function kgvid_clear_video(movieurl, postID, video_id, blog_id) {

	var kgflashmediaplayersecurity = document.getElementsByName( 'attachments[' + postID + '][kgflashmediaplayer-security]' )[0].value;

	jQuery.post(
		ajaxurl,
		{ action:"kgvid_clear_child_format",
			security: kgflashmediaplayersecurity,
			video_id: video_id,
			blog_id: blog_id },
		function() {
			kgvid_redraw_encode_checkboxes( movieurl, postID, blog_id );
		},
		"json"
	);

}

function kgvid_add_subtitles(id) {
	var tracks   = jQuery( '#kgflashmediaplayer-' + id + '-trackdiv' );
	track_number = tracks.children().length;
	track_label  = track_number + 1;
	tracks.append( '<div id="kgflashmediaplayer-' + id + '-trackdiv-' + track_number + '" class="kgvid_thumbnail_box kgvid_track_box"><strong>Track ' + track_label + '</strong><span class="kgvid_track_box_removeable">X</span><br />' + kgvidL10n.tracktype + ' <select name="attachments[' + id + '][kgflashmediaplayer-track][' + track_number + '][kind]" id="attachments-' + id + '-kgflashmediaplayer-track_' + track_number + '_kind]"><option value="subtitles">' + kgvidL10n.subtitles + '</option><option value="captions">' + kgvidL10n.captions + '</option><option value="chapters">' + kgvidL10n.chapters + '</option></select><br /><span id="pick-track' + track_number + '" class="button-secondary" style="margin:10px 0;" data-choose="' + kgvidL10n.choosetextfile + '" data-update="' + kgvidL10n.settracksource + '" data-change="attachments-' + id + '-kgflashmediaplayer-track_' + track_number + '_src" onclick="kgvid_pick_attachment(this);">' + kgvidL10n.choosefromlibrary + '</span><br />URL: <input name="attachments[' + id + '][kgflashmediaplayer-track][' + track_number + '][src]" id="attachments-' + id + '-kgflashmediaplayer-track_' + track_number + '_src" type="text" value="" class="text" style="width:180px;"><br />' + kgvidL10n.languagecode + ' <input name="attachments[' + id + '][kgflashmediaplayer-track][' + track_number + '][srclang]" id="attachments-' + id + '-kgflashmediaplayer-track_' + track_number + '_srclang" type="text" value="" maxlength="2" style="width:40px;"><br />' + kgvidL10n.label + ' <input name="attachments[' + id + '][kgflashmediaplayer-track][' + track_number + '][label]" id="attachments-' + id + '-kgflashmediaplayer-track_' + track_number + '_label" type="text" value="" class="text" style="width:172px;"><br />' + kgvidL10n.trackdefault + ' <input name="attachments[' + id + '][kgflashmediaplayer-track][' + track_number + '][default]" id="attachments-' + id + '-kgflashmediaplayer-track_' + track_number + '_default" type="checkbox" value="default"></div>' );
	jQuery( '.kgvid_track_box_removeable' ).on( 'click', function() { jQuery( this ).parent().remove(); jQuery( 'form.compat-item input' ).first().trigger( 'change' ); } );
}
