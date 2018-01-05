jQuery('.kgvid_videodiv').each(function(){ //setup individual videos. WordPress Default has its own success callback

	var video_vars = jQuery(this).data('kgvid_video_vars');

	if ( video_vars.player_type == "Video.js" ) {

		kgvid_load_videojs(video_vars);

	}
});

jQuery(document).ready(kgvid_document_ready());
jQuery(window).load(kgvid_window_load());

function kgvid_document_ready() {

	jQuery('.kgvid_videodiv').each(function(){ //setup individual videos. WordPress Default has its own success callback

		var video_vars = jQuery(this).data('kgvid_video_vars');

		if ( video_vars.player_type == "JWPlayer" ) {
			var player_id = jQuery('#video_'+video_vars.id+'_div').children('div[id^="jwplayer"]').attr('id');
			player_id = player_id.replace('_wrapper', ''); //Flash JW Players have wrapper in the id
			var player = jwplayer(player_id);
			player.onReady( kgvid_setup_video(video_vars.id) );
		}

		if ( video_vars.player_type == "StrobeMediaPlayback" ) {
			swfobject.embedSWF(video_vars.swfurl, 'video_'+video_vars.id, video_vars.width, video_vars.height, '10.1.0', video_vars.expressinstallswfurl, video_vars.flashvars, video_vars.params);
			kgvid_setup_video(video_vars.id);
		}

	});

}

function kgvid_window_load() {

	jQuery('.kgvid_gallerywrapper').each(function(){ //setup gallery thumbnails

		var gallery_id = this.id;
		kgvid_resize_gallery_play_button(gallery_id);
		jQuery(window).resize( function(){ kgvid_resize_gallery_play_button(gallery_id) } );
		setTimeout(function(){ kgvid_resize_gallery_play_button(gallery_id) }, 200);

	});

}

function kgvid_mejs_success(mediaElement, domObject) {
	if ( domObject.nodeName == "VIDEO" ) {
		var id = jQuery(domObject).parents('.kgvid_videodiv').data('id');
		if ( id != undefined ) { //make sure we're using KGVID shortcode
			kgvid_setup_video(id);
		}
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

function kgvid_SetVideo(id) { //for galleries

	//set the viewport meta tag so the gallery fits in iOS
	var viewport_meta = jQuery('meta[name="viewport"]').first();
	var viewport_original = "";
	if ( viewport_meta.length == 1 ) {
		var viewport_original = viewport_meta.attr('content');
		viewport_meta.attr('content', 'width=device-width, initial-scale=1');
	}
	else { jQuery('head').append('<meta name="viewport" content="width=device-width, initial-scale=1" id="kgvid_gallery_viewport">'); }

	var gallery_id = jQuery('#kgvid_video_gallery_thumb_'+id).parent().attr('id');

	var width = jQuery('#kgvid_video_gallery_thumb_'+id).data('width');
	var height = jQuery('#kgvid_video_gallery_thumb_'+id).data('height');
	var aspect_ratio = Math.round(height/width*1000)/1000
	var window_width = window.outerWidth;
	if ( window.outerWidth == 0 ) { window_width = window.innerWidth; }
	if ( width > window_width ) {
		width = window_width-60;
		height = Math.round(width * aspect_ratio);
	}
	if ( height > (jQuery(window).height() - 20) ) {
		height = jQuery(window).height() - 20;
		width = Math.round(height / aspect_ratio);
	}

	var frame_height = height;
	var meta = jQuery('#kgvid_video_gallery_thumb_'+id).data('meta');
	if ( meta > 0 ) { frame_height = parseInt(height)+Math.round(28*meta); }
	var frame_width = parseInt(width) + 10;
	frame_height = parseInt(frame_height) + 10;

	jQuery.modal("", {
		overlayId: 'kgvid-simplemodal-overlay',
		containerId: 'kgvid-simplemodal-container',
		opacity:70,
		minWidth:frame_width,
		minHeight:frame_height,
		autoResize: false,
		overlayClose:true,
		closeHTML:'<a class="modalCloseImg simplemodal-close" title="Close"><span class="dashicons dashicons-no-alt"></span></a>',
		zIndex:10000,
		onShow: function(dialog) {

			//build next/previous buttons

			var is_paginated = jQuery('#'+gallery_id+' .kgvid_gallery_pagination span').length > 0;

			var nav_code = '';
			if ( jQuery('#kgvid_video_gallery_thumb_'+id).prev('#'+gallery_id+' .kgvid_video_gallery_thumb').length  > 0 ||
				( is_paginated && jQuery('#'+gallery_id+' .kgvid_gallery_pagination_selected').html() != "1" )
			) {
				nav_code += '<a class="kgvid_gallery_nav kgvid_gallery_prev" title="'+kgvidL10n_frontend.previous+'">&#8592;</a>';
			}
			if ( jQuery('#kgvid_video_gallery_thumb_'+id).next('#'+gallery_id+' .kgvid_video_gallery_thumb').length  > 0 ||
				( is_paginated && jQuery('#'+gallery_id+' .kgvid_gallery_pagination span a').last().html() > jQuery('#'+gallery_id+' .kgvid_gallery_pagination_selected').html() )
			) {
				nav_code += '<a class="kgvid_gallery_nav kgvid_gallery_next" title="'+kgvidL10n_frontend.next+'">&#8594;</a>';
			}

			jQuery('#kgvid-simplemodal-container').prepend(nav_code);

			jQuery('.kgvid_gallery_next').click( function() {

				var next_thumb = jQuery('#kgvid_video_gallery_thumb_'+id).next('.kgvid_video_gallery_thumb');

				if ( next_thumb.length == 0 && is_paginated ) {
					var next_page = jQuery('#'+gallery_id+' .kgvid_gallery_pagination_selected').next();
					kgvid_switch_gallery_page(next_page[0], 'next');
				}
				else { //not switching pages
					jQuery.modal.close();
					next_thumb.trigger('click');
				}

			});

			jQuery('.kgvid_gallery_prev').click( function() {

				var prev_thumb = jQuery('#kgvid_video_gallery_thumb_'+id).prev('.kgvid_video_gallery_thumb');

				if ( prev_thumb.length == 0 && is_paginated ) {
					var prev_page = jQuery('#'+gallery_id+' .kgvid_gallery_pagination_selected').prev();
					kgvid_switch_gallery_page(prev_page[0], 'prev');
				}
				else { //not switching pages
					jQuery.modal.close();
					prev_thumb.trigger('click');
				}

			});
			jQuery('#simplemodal-data').prepend('<div id="kgvid_popup_video_holder_'+id+'"></div>');

			jQuery(document).on('keydown.kgvid', function(e) {
				switch(e.which) {
					case 37: // left
					jQuery('.kgvid_gallery_prev').click();
					break;

					case 39: // right
					jQuery('.kgvid_gallery_next').click();
					break;

					default: return; // exit this handler for other keys
				}
				e.preventDefault(); // prevent the default action (scroll / move caret)
			});

			//load the video player embed code

			if ( jQuery('#kgvid_popup_video_holder_'+id).length == 1 ) { //make sure the user hasn't moved on to another video

				var popup_code = jQuery('#kgvid_video_gallery_thumb_'+id).data('popupcode');
				var video_vars = jQuery('#kgvid_video_gallery_thumb_'+id).data('kgvid_video_vars');

				jQuery('#kgvid_popup_video_holder_'+id).html(popup_code);
				jQuery('#video_'+id+'_div').data('kgvid_video_vars', video_vars);

				if ( video_vars.player_type == "StrobeMediaPlayback" ) {
					swfobject.embedSWF(video_vars.swfurl, 'video_'+id, video_vars.width, video_vars.height, '10.1.0', video_vars.expressinstallswfurl, video_vars.flashvars, video_vars.params);
				}

				if ( video_vars.player_type == "Video.js" ) {
					setTimeout(function() { kgvid_load_videojs(video_vars); }, 0);
				}
				else { setTimeout(function() { kgvid_setup_video(id); }, 0); }

				dialog.wrap.css('overflow', 'hidden'); //disable scroll bars
				if ( meta > 0 ) {
					jQuery('#kgvid-simplemodal-container').css('color','white'); //show text if there's anything to see below the video
					meta_bump = 5;
					if ( video_vars.player_type == "JWPlayer" ) { meta_bump = 15; }
					jQuery('#kgvid-simplemodal-container').height(jQuery('#kgvid-simplemodal-container').height() + meta_bump);
					jQuery.modal.setPosition();
				}

				if ( video_vars.player_type == "WordPressDefault" ) {
					jQuery('#kgvid_'+id+'_wrapper video').mediaelementplayer({
						success: function(mediaElement, domObject) {
							if (mediaElement.pluginType == 'flash' || mediaElement.pluginType == 'silverlight') {
								mediaElement.addEventListener('canplay', function() {
									// Player is ready
									mediaElement.play();
								}, false);

								mediaElement.addEventListener('ended', function() {
									if ( jQuery('#kgvid_video_gallery_thumb_'+id).data('gallery_end') != "" && jQuery('#kgvid_video_gallery_thumb_'+id).data('gallery_end') != null ) {
										kgvid_video_gallery_end_action(id, jQuery('#kgvid_video_gallery_thumb_'+id).data('gallery_end'));
									}
								}, false);
							}//end if flash or silverlight
							else { mediaElement.play(); }
						},
						features : [ 'playpause', 'progress', 'volume', 'tracks', 'sourcechooser', 'fullscreen' ]
					});
				}//end if WordPress Default
			}//end check to make sure video still needs to load

		}, //end onShow function
		onClose: function(dialog) {

			if ( viewport_original != "" ) { viewport_meta.attr('content', viewport_original); }
			else { jQuery('#kgvid_gallery_viewport').remove(); }

			var video_vars = jQuery('#video_'+id+'_div').data('kgvid_video_vars');

			if ( video_vars !== undefined ) {
				if ( video_vars.player_type == "Video.js" ) {
					eval('videojs.players.video_'+id).pause();
					setTimeout(function() { eval('videojs.players.video_'+id).dispose(); }, 0);
				}
				if ( video_vars.player_type == "JWPlayer" ) {
					jwplayer(jQuery('#kgvid_'+id+'_wrapper .jwplayer').attr('id')).stop();
				}
			}

			jQuery(window).off('resize', kgvid_resize_video(id));
			jQuery(document).off('keydown.kgvid'); //disable left/right navigation
			jQuery.modal.close();
		}
	}); //end modal call

}

function kgvid_video_gallery_end_action(id, action) {
	jQuery.modal.close();
	if ( action == "next" ) {
		jQuery('#kgvid_video_gallery_thumb_'+id).next('#'+jQuery('#kgvid_video_gallery_thumb_'+id).parent().attr('id')+' .kgvid_video_gallery_thumb').trigger('click')
	}
}

function kgvid_timeupdate_poster() {
	jQuery('#'+this.id()+' > .vjs-poster').fadeOut();
}

function kgvid_add_hover(id) {

	jQuery('#video_'+id+'_div').hover(
		function(){
			jQuery('#video_'+id+'_meta').addClass('kgvid_video_meta_hover');
		},
		function(){
			jQuery('#video_'+id+'_meta').removeClass('kgvid_video_meta_hover');
		}
	);

	jQuery('#video_'+id+'_div').focus(
		function(){
			jQuery('#video_'+id+'_meta').addClass('kgvid_video_meta_hover');
		}
	)
	.focusout(
		function(){
			jQuery('#video_'+id+'_meta').removeClass('kgvid_video_meta_hover');
		}
	);

}

function kgvid_load_videojs(video_vars) {

	var videojs_options = { "language": video_vars.locale };

	if ( videojs.browser.IS_IPHONE == true ) {
		videojs_options.html5 = { "nativeTextTracks" : true };
	}
	else { videojs_options.html5 = { "nativeTextTracks" : false }; }

	if ( video_vars.resize == "true" || video_vars.fullwidth == "true" ) {
		videojs_options.fluid = true;
	}
	else {
		videojs_options.fluid = false;
	}
	if ( video_vars.width != undefined && video_vars.width.indexOf('%') === -1 && video_vars.height != undefined ) {
		videojs_options.aspectRatio = video_vars.width + ':' + video_vars.height;
	}
	if ( video_vars.nativecontrolsfortouch == "true" ) {
		videojs_options.nativeControlsForTouch = true;
	}
	if ( video_vars.playback_rate == "true" ) {
		videojs_options.playbackRates = [0.5, 1, 1.25, 1.5, 2];
	}
	if ( video_vars.enable_resolutions_plugin == "true" ) {

		if ( videojs.VERSION.split('.')[0] >= 5 ) {

			videojs_options.plugins = { "resolutionSelector" : { "force_types" : ["video/mp4"] } };
			if ( video_vars.default_res ) {
				videojs_options.plugins.resolutionSelector.default_res = video_vars.default_res;
			}

		}

		else {
			console.warn('Video Embed & Thumbnail Generator: Video.js version '+videojs.VERSION+' is loaded by another application. Resolution selection is not compatible with this older version and has been disabled.');
		}
	}

	videojs('video_'+video_vars.id, videojs_options ).ready(function(){ kgvid_setup_video(video_vars.id); });

}

function kgvid_setup_video(id) {

	var video_vars = jQuery('#video_'+id+'_div').data('kgvid_video_vars');

	if ( typeof (jQuery) == 'function' ) { jQuery.fn.fitVids=function(){}; }; //disable fitvids

	var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/i) ? true : false );
	if (iOS && video_vars.player_type == "StrobeMediaPlayback" ) { video_vars.player_type = "Video.js"; }

	jQuery('#video_'+id+'_div').prepend(jQuery('#video_'+id+'_watermark'));
	jQuery('#video_'+id+'_watermark').attr('style', ''); //shows the hidden watermark div
	jQuery('#video_'+id+'_div').prepend(jQuery('#video_'+id+'_meta'));
	jQuery('#video_'+id+'_embed, #click_trap_'+id).appendTo('#video_'+id+'_div');
	jQuery('#click_trap_'+id).on('click', function(){ kgvid_share_icon_click(id); });
	jQuery('#video_'+id+'_meta').attr('style', ''); //shows the hidden meta div
	if ( video_vars.autoplay == "true" ) {
		kgvid_video_counter(id, 'play');
		jQuery('#video_'+id+'_meta').removeClass('kgvid_video_meta_hover');
	}

	if ( video_vars.right_click != "on" ) {
		jQuery('#video_'+id+'_div').bind('contextmenu',function() { return false; });
	}

	if ( video_vars.player_type == "Video.js" ) {

		var player = eval('videojs.players.video_'+id);

		if ( jQuery('#video_'+id+'_flash_api').parent().is('.fluid-width-video-wrapper') ) { //disables fitVids.js
			jQuery('#video_'+id+'_flash_api').unwrap();
		}

		jQuery('#video_'+id).append(jQuery('#video_'+id+'_watermark'));

		if ( videojs.VERSION.split('.')[0] >= 5 && videojs.browser.TOUCH_ENABLED == true ) {

			if ( video_vars.nativecontrolsfortouch == "true" && videojs.browser.IS_ANDROID ) {
				jQuery('.vjs-big-play-button').hide();
			}

			if ( player.controls() == false && player.muted() == false ) { //mobile browsers allow autoplay only if the player is muted
				player.controls(true);
			}
		}

		if ( video_vars.autoplay == "true" && !player.paused() && player.hasClass('vjs-paused') ) {
			player.pause();
			player.play();
		}

		player.on('loadedmetadata', function(){

			if ( videojs.VERSION.split('.')[0] >= 5 ) {

				var text_tracks = player.textTracks();
				var track_elements = player.options_.tracks;
				var played = jQuery('#video_'+id+'_div').data("played") || "not played";

				if ( played == "not played" ) { //only turn on the default captions on first load

					if ( track_elements != null ) {
						jQuery(text_tracks).each(function(index, track) {
							if ( track_elements[index].default == true && track.mode != 'showing' ) { player.textTracks()[index].mode = 'showing'; }
						});
					}

					if ( video_vars.start != '' ) {
						player.currentTime(kgvid_convert_from_timecode(video_vars.start));
					}

				}

			}

			if ( video_vars.set_volume != "" ) { player.volume(video_vars.set_volume); }

			if ( video_vars.autoplay == "true" && player.paused() ) { player.play(); }

		});

		player.on('play', function kgvid_play_start(){
			player.off('timeupdate', kgvid_timeupdate_poster);
			if ( video_vars.meta ) {
				kgvid_add_hover(id);
				jQuery('#video_'+id+'_meta').removeClass('kgvid_video_meta_hover');
			}
			if ( video_vars.autoplay == "true" ) { jQuery('#video_'+id+' > .vjs-control-bar').removeClass('vjs-fade-in'); }
			if ( video_vars.endofvideooverlay != "" ) { jQuery('#video_'+id+' > .vjs-poster').hide(); }

			if ( video_vars.pauseothervideos == "true" && videojs.VERSION.split('.')[0] >= 5 ) {
				jQuery.each(videojs.getPlayers(), function(otherPlayerId, otherPlayer) {
					if ( player.id() != otherPlayerId && !otherPlayer.paused() && !otherPlayer.autoplay() ) {
						otherPlayer.pause();
					}
				});
			}

			kgvid_video_counter(id, 'play');

			player.on('timeupdate', function(){

				var percent_duration = Math.round(player.currentTime() / player.duration() * 100);

				if ( jQuery('#video_'+id+'_div').data("25") == undefined && percent_duration >= 25 && percent_duration < 50 ) {
					jQuery('#video_'+id+'_div').data("25", true);
					kgvid_video_counter(id, '25');
				}
				else if ( jQuery('#video_'+id+'_div').data("50") == undefined && percent_duration >= 50 && percent_duration < 75 ) {
					jQuery('#video_'+id+'_div').data("50", true);
					kgvid_video_counter(id, '50');
				}
				else if ( jQuery('#video_'+id+'_div').data("75") == undefined && percent_duration >= 75 && percent_duration < 100 ) {
					jQuery('#video_'+id+'_div').data("75", true);
					kgvid_video_counter(id, '75');

				}

			});

		});

		player.on('pause', function kgvid_play_pause(){
			jQuery('#video_'+id+'_meta').addClass('kgvid_video_meta_hover');
		});

		player.on('ended', function kgvid_play_end(){
			if ( jQuery('#video_'+id+'_div').data("end") == undefined ) {
				jQuery('#video_'+id+'_div').data("end", true);
				kgvid_video_counter(id, 'end');
			}
			setTimeout(function() { jQuery('#video_'+id+' > .vjs-loading-spinner').hide(); }, 250);
			if ( video_vars.endofvideooverlay != "" ) {
				jQuery('#video_'+id+' > .vjs-poster').css({
				'background-image':'url('+video_vars.endofvideooverlay+')'
				}).fadeIn();

				setTimeout(function() { player.on('timeupdate', kgvid_timeupdate_poster); }, 500);

			}
			if ( jQuery('#kgvid_video_gallery_thumb_'+id).data('gallery_end') != "" && jQuery('#kgvid_video_gallery_thumb_'+id).data('gallery_end') != null ) {
				kgvid_video_gallery_end_action(id, jQuery('#kgvid_video_gallery_thumb_'+id).data('gallery_end'));
			}
		});

		player.on('fullscreenchange', function(){

			var
				fullScreenApi = {
					supportsFullScreen: false,
					isFullScreen: function() { return false; },
					requestFullScreen: function() {},
					cancelFullScreen: function() {},
					fullScreenEventName: '',
					prefix: ''
				},
				browserPrefixes = 'webkit moz o ms khtml'.split(' ');

			// check for native support
			if (typeof document.cancelFullScreen != 'undefined') {
				fullScreenApi.supportsFullScreen = true;
			} else {
				// check for fullscreen support by vendor prefix
				for (var i = 0, il = browserPrefixes.length; i < il; i++ ) {
					fullScreenApi.prefix = browserPrefixes[i];
					if (typeof document[fullScreenApi.prefix + 'CancelFullScreen' ] != 'undefined' ) {
						fullScreenApi.supportsFullScreen = true;
						break;
					}
				}
			}

			if ( player.availableRes != undefined ) {
				 kgvid_resize_video(id);
			}

			if ( fullScreenApi.supportsFullScreen == false ) {
				if ( jQuery('#video_'+id).hasClass('vjs-fullscreen') ) {
					jQuery('#video_'+id+'_meta').hide();
					jQuery('#video_'+id+'_watermark img').css('position', 'fixed');
				}
				else {
					jQuery('#video_'+id+'_meta').show();
					jQuery('#video_'+id+'_watermark img').css('position', 'absolute');
				}
			}

		});

	} //end if Video.js

	if ( video_vars.player_type == "WordPressDefault" ) {

		var player = jQuery('#video_'+id+'_div video');
		var mejs_id = jQuery('#video_'+id+'_div .mejs-container').attr('id');

		player.on('loadedmetadata', function() {

			var mejs_player = eval('mejs.players.'+mejs_id);
			var resolutions = player.availableRes;
			var played = jQuery('#video_'+id+'_div').data("played") || "not played";

			if ( video_vars.set_volume != "" ) { player[0].volume = video_vars.set_volume; }
			if ( video_vars.mute == "true" ) { player[0].setMuted(true); }
			if ( video_vars.pauseothervideos == "false" ) { mejs_player.options.pauseOtherPlayers = false; }
			jQuery('#video_'+id+'_div .mejs-container').append(jQuery('#video_'+id+'_watermark'));

			if ( played == "not played" ) { //only turn on the default captions on first load

				jQuery.each(mejs_player.tracks, function(key, item) {
					if ( item.srclang == jQuery('#'+mejs_id+' track[default]').attr('srclang') ) {
						mejs_player.setTrack(item.srclang);
						jQuery('#'+mejs_id+' .mejs-captions-selector input[value="en"]').prop('checked',true);
					}
				});

				if ( video_vars.start != '' ) {
					player[0].setCurrentTime(kgvid_convert_from_timecode(video_vars.start));
				}

			}

		});

		player.on('play', function(){
			kgvid_add_hover(id);
			jQuery('#video_'+id+'_meta').removeClass('kgvid_video_meta_hover');

			kgvid_video_counter(id, 'play');

			player.on('timeupdate', function(){

				var percent_duration = Math.round(player[0].currentTime / player[0].duration * 100);

				if ( jQuery('#video_'+id+'_div').data("25") == undefined && percent_duration >= 25 && percent_duration < 50 ) {
					jQuery('#video_'+id+'_div').data("25", true);
					kgvid_video_counter(id, '25');
				}
				else if ( jQuery('#video_'+id+'_div').data("50") == undefined && percent_duration >= 50 && percent_duration < 75 ) {
					jQuery('#video_'+id+'_div').data("50", true);
					kgvid_video_counter(id, '50');
				}
				else if ( jQuery('#video_'+id+'_div').data("75") == undefined && percent_duration >= 75 && percent_duration < 100 ) {
					jQuery('#video_'+id+'_div').data("75", true);
					kgvid_video_counter(id, '75');
				}

			});

		});

		player.on('pause', function(){
			jQuery('#video_'+id+'_meta').addClass('kgvid_video_meta_hover');
		});

		jQuery(document).on('mozfullscreenchange webkitfullscreenchange fullscreenchange', function(){

			var mejs_player = eval('mejs.players.'+mejs_id);

			if ( mejs_player.isFullScreen ) {
				//mejs_player.enterFullScreen();
			}
		});

		player.on('ended', function(){
			if ( jQuery('#video_'+id+'_div').data("end") == undefined ) {
				jQuery('#video_'+id+'_div').data("end", true);
				kgvid_video_counter(id, 'end');
			}
			if ( video_vars.endofvideooverlay != "" ) {
				jQuery('#video_'+id+'_div .mejs-poster').css({
				'background-image':'url('+video_vars.endofvideooverlay+')'
				}).fadeIn();

				player.on('seeking.kgvid', function() {
					player = jQuery('#video_'+id+'_div video');
					if ( player[0].currentTime != 0) {
						jQuery('#video_'+id+'_div .mejs-poster').fadeOut();
						player.off('seeking.kgvid');
					}
				} );
			}
			if ( jQuery('#kgvid_video_gallery_thumb_'+id).data('gallery_end') != "" && jQuery('#kgvid_video_gallery_thumb_'+id).data('gallery_end') != null ) {
				kgvid_video_gallery_end_action(id, jQuery('#kgvid_video_gallery_thumb_'+id).data('gallery_end'));
			}
		});


	} //end if WordPress Default

	if (  video_vars.player_type == "JWPlayer" ) {
		var player_id = jQuery('#video_'+id+'_div').children('div[id^="jwplayer"]').attr('id');
		player_id = player_id.replace('_wrapper', ''); //Flash JW Players have wrapper in the id
		var player = jwplayer(player_id);

		if ( video_vars.set_volume != "" ) { player.setVolume(Math.round(video_vars.set_volume*100)); }
		if ( video_vars.mute == "true" ) { player.setMute(true); }

		player.onPlay( function() {
			kgvid_video_counter(id, 'play');

			if ( video_vars.meta ) {
				kgvid_add_hover(id);
				jQuery('#video_'+id+'_meta').removeClass('kgvid_video_meta_hover');
			}

			if ( video_vars.pauseothervideos == "true" ) {
				var i = 0;
				while (true) {
					var testplayer = jwplayer(i);
					if (!testplayer.id) {
						break;
					}
					else if ( testplayer.id == player.id ) {
						i++;
					}
					else {
						testplayer.pause(true);
						i++;
					}
				}//end loop through jwplayers
			}

			player.onTime( function(e){

				if ( jQuery('#video_'+id+'_div').data("25") == undefined && Math.round(e.position / e.duration * 100) == 25 ) {
					jQuery('#video_'+id+'_div').data("25", true);
					kgvid_video_counter(id, '25');
				}
				else if ( jQuery('#video_'+id+'_div').data("50") == undefined && Math.round(e.position / e.duration * 100) == 50 ) {
					jQuery('#video_'+id+'_div').data("50", true);
					kgvid_video_counter(id, '50');
				}
				else if ( jQuery('#video_'+id+'_div').data("75") == undefined && Math.round(e.position / e.duration * 100) == 75 ) {
					jQuery('#video_'+id+'_div').data("75", true);
					kgvid_video_counter(id, '75');

				}

			});

		});

		player.onComplete( function() {

			if ( jQuery('#video_'+id+'_div').data("end") == undefined ) {
				jQuery('#video_'+id+'_div').data("end", true);
				kgvid_video_counter(id, 'end');
			}

			if ( jQuery('#kgvid_video_gallery_thumb_'+id).data('gallery_end') != "" && jQuery('#kgvid_video_gallery_thumb_'+id).data('gallery_end') != null ) {
				kgvid_video_gallery_end_action(id, jQuery('#kgvid_video_gallery_thumb_'+id).data('gallery_end'));
			}

		});

		if ( video_vars.right_click != "on" ) {
			player.onReady( function() {
				jQuery('#video_'+id+'_div .jwclick').remove();
			});
		}

	}

	if ( video_vars.resize == "true" || window.location.search.indexOf("kgvid_video_embed[enable]=true") !== -1 ) {
		kgvid_resize_video(id);
		jQuery(window).resize( function(){ kgvid_resize_video(id) } );
	}

	if ( typeof jQuery.modal !== "undefined" && jQuery('#kgvid-simplemodal-container').length > 0 ) { jQuery.modal.setPosition(); }

}

function kgvid_resize_video(id) {

	if ( typeof kgvid_resize_video.counter == 'undefined' ) {
		kgvid_resize_video.counter = 0;
	}

	var video_vars = jQuery('#video_'+id+'_div').data('kgvid_video_vars');

	if ( video_vars !== undefined ) {

		var set_width = video_vars.width;
		var set_height = video_vars.height;
		var aspect_ratio = Math.round(set_height/set_width*1000)/1000
		var reference_div = jQuery('#kgvid_'+id+'_wrapper').parent();
		var window_width = jQuery(window).width();
		var window_height = jQuery(window).height();

		if ( reference_div.is('body') ) { //if the video is embedded
			parent_width = window.innerWidth;
			set_width = window.innerWidth;
		}
		else if ( reference_div.attr('id') == 'kgvid_popup_video_holder_'+id ) { //if it's a pop-up video
			parent_width = window_width-40;
		}
		else {
			parent_width = reference_div.width();
			if ( video_vars['fullwidth'] == 'true' ) { set_width = parent_width; }
		}
		if ( parent_width < set_width ) { set_width = parent_width; }

		if ( set_width != 0 && set_width < 30000 ) {

			jQuery('#kgvid_'+id+'_wrapper').width(set_width);
			var set_height = Math.round(set_width * aspect_ratio);

			if ( reference_div.attr('id') == 'kgvid_popup_video_holder_'+id && set_height > window_height-60 ) { //if it's a popup video
				set_height = window_height-60;
				set_width = Math.round(set_height / aspect_ratio);
			}

			if ( reference_div.is('body') && set_height > window.innerHeight ) { //if it's a tall embedded video
				set_height = window.innerHeight;
				var change_aspect = true;

			} //if the video is embedded

			if ( ( video_vars.player_type == "Video.js" && eval('videojs.players.video_'+id) != null ) ) {

				video_vars.player_type == "Video.js"

				var player = eval('videojs.players.video_'+id);
				if ( change_aspect ) { player.aspectRatio(Math.floor(set_width)+':'+Math.floor(set_height)); }
				player.width(set_width).height(set_height);
				if ( set_width < 500 ) {
					var scale = Math.round(100*set_width/500)/100;
					jQuery('#kgvid_'+id+'_wrapper .vjs-big-play-button').css('-webkit-transform','scale('+scale+')').css('-o-transform','scale('+scale+')').css('-ms-transform','scale('+scale+')').css('transform','scale('+scale+')');
					if ( set_width < 261 ) {
						jQuery('#video_'+id+' > .vjs-control-bar > .vjs-mute-control').css('display', 'none');
						if ( set_width < 221 ) {
							jQuery('#video_'+id+' > .vjs-control-bar > .vjs-volume-control').css('display', 'none');
							if ( set_width < 171 ) {
								jQuery('#video_'+id+' > .vjs-control-bar > .vjs-duration, #video_'+id+' > .vjs-control-bar > .vjs-time-divider').css('display', 'none');
							}
						}
					}
				}
				else { jQuery('#kgvid_'+id+'_wrapper .vjs-big-play-button').css('transform', ''); }
			}

			if ( video_vars.player_type == "StrobeMediaPlayback" ) {
				jQuery('#video_'+id+'_div').height(set_height);
				jQuery('#video_'+id).attr('width',set_width).attr('height',set_height);
				jQuery('#video_'+id+'_html5_api').attr('width',set_width).attr('height',set_height);
			}

			if ( video_vars.player_type == "WordPressDefault" && typeof mejs !== 'undefined' ) {

					player = eval('mejs.players.'+jQuery('#kgvid_'+id+'_wrapper div.wp-video-shortcode').attr('id'));

					if ( change_aspect ) {
						player.options.setDimensions = false;
						jQuery('#kgvid_'+id+'_wrapper div.wp-video-shortcode').css('height', set_height+'px');
					}

			}

			if ( ( video_vars.player_type == "Video.js" && eval('videojs.players.video_'+id) != null )
				||  ( video_vars.player_type == "WordPressDefault" && typeof mejs !== 'undefined' )
			) {
				if ( video_vars.auto_res == 'automatic' && player.availableRes !== undefined ) {

					var resolutions = player.availableRes;
					var resNumbers = new Array();

					jQuery.each(resolutions, function(key, value){
						if ( typeof key !== 'undefined' && !isNaN(parseInt(key)) ) {
							resNumbers.push(parseInt(key));
						}
					});
					var current_resolution = parseInt(player.getCurrentRes());
					if ( !isNaN(current_resolution) ) {
						if ( video_vars.pixel_ratio == "true" && window.devicePixelRatio != undefined ) {
							var pixel_ratio = window.devicePixelRatio;
						} //for retina displays
						else { pixel_ratio = 1; }

						if ( jQuery('#video_'+id).hasClass('vjs-fullscreen') || jQuery('#video_'+id+'_div .mejs-container').hasClass('mejs-container-fullscreen') ) {
							pixel_height = window_width * aspect_ratio * pixel_ratio;
						}
						else { pixel_height = set_width * aspect_ratio * pixel_ratio; }

						var res_options = jQuery.map(resNumbers, function(n) {
							if ( n >= pixel_height ) { return n; }
						});
						var set_res = Math.min.apply(Math,res_options);

						if ( set_res != current_resolution ) {

							if ( video_vars.player_type == "Video.js" ) {

								if ( player.paused() ) {
									player.one('play', function() {
										player.changeRes(set_res+'p');
										player.play();
									});
								}
								else {
									player.changeRes(set_res+'p');
								}

							}

							if ( video_vars.player_type == "WordPressDefault" ) {

								if ( player.media.paused ) {
									jQuery(player.media).one('play', function() {
										player.changeRes(set_res+'p');
									});
								}
								else {
									player.changeRes(set_res+'p');
								}

							}

						}

						if (  video_vars.player_type == "Video.js" && jQuery('#video_'+id).hasClass('vjs-has-started') == false ) {
							if ( player.muted() == true ) {
								player.muted(false);
								player.muted(true);
							} // reset volume and mute otherwise player doesn't display properly
							if ( player.volume() != 1 ) {
								var current_volume = player.volume();
								player.volume(1);
								player.volume(current_volume);
							}
						}

					} //automatic
				}
			}

			var meta = jQuery('#kgvid_video_gallery_thumb_'+id).data('meta');
			var extra_meta_height = Math.round(20*meta);
			jQuery('#kgvid-simplemodal-container').width(parseInt(set_width)+10);
			jQuery('#kgvid-simplemodal-container').height(parseInt(set_height)+10+extra_meta_height);
			jQuery('.simplemodal-wrap').css('overflow', 'hidden');

		}
		else if ( kgvid_resize_video.counter < 3 ) { setTimeout(function() { kgvid_resize_video(id); }, 250); } //if it's a wacky result, wait 1/4 second
	}

	++kgvid_resize_video.counter;

}

function kgvid_resize_gallery_play_button(gallery_id) {

	var video_vars = jQuery('#'+gallery_id+' .kgvid_video_gallery_thumb').first().data('kgvid_video_vars');
	var thumb_width = jQuery('#'+gallery_id+' .kgvid_video_gallery_thumb').first().width();

	if ( video_vars.player_type == "Video.js" || video_vars.player_type == "WordPressDefault" ) {

		var max_percent = 0.17;


		if ( video_vars.player_type == "Video.js" ) {
			var button_selector = '.vjs-big-play-button';
			var translate_y = 30;
		}

		if ( video_vars.player_type == "WordPressDefault" ) {
			var button_selector = '.mejs-overlay-button';
			var translate_y = 5;
		}

		var play_button_percent = jQuery('#'+gallery_id+' '+button_selector).width()/thumb_width;

		var unscaled_width = jQuery('#'+gallery_id+' '+button_selector)[0].offsetWidth;
		var scale_value = Math.round(thumb_width * max_percent / unscaled_width * 1000)/1000;

		if ( scale_value < 1 ) {
			var css_text = 'scale('+scale_value+') translateY(-'+translate_y+'px)';

			jQuery('#'+gallery_id+' '+button_selector).css({
				'transform' : css_text,
				'-webkit-transform' : css_text,
				'-o-transform' : css_text,
				'-ms-transform': css_text
			});
		}
		else { jQuery('#'+gallery_id+' '+button_selector).removeAttr('style'); }

	}

}

function kgvid_strobemedia_callback(id) {

	var player = document.getElementById('video_'+id);
	var video_vars = jQuery('#video_'+id+'_div').data('kgvid_video_vars');

	if ( player.getState() == 'buffering' || player.getState() == 'playing' ) {
		kgvid_video_counter(video_vars.id, 'play');
	}

	if ( player.getState() == 'uninitialized' && video_vars.set_volume != "" ) {
		player.setVolume(video_vars.set_volume);
	}

}

function kgvid_video_counter(id, event) {

	var video_vars = jQuery('#video_'+id+'_div').data('kgvid_video_vars');
	var changed = false;
	var title = jQuery('#kgvid_'+id+'_wrapper meta[itemprop=name]').attr('content');

	var played = jQuery('#video_'+id+'_div').data("played") || "not played";
	if ( played == "not played" ) {
		if (video_vars.countable) { //video is in the db
			changed = true;
			jQuery('#video_'+id+'_div').data("played", "played");
		}
		if (typeof gtag != "undefined") { 
			gtag("event", kgvidL10n_frontend.playstart, {
				'event_category': "Videos", 
				'event_label': title
			}); 
		}
		else if (typeof ga != "undefined") { ga("send", "event", "Videos", kgvidL10n_frontend.playstart, title); }
		else if (typeof __gaTracker != "undefined") { __gaTracker("send", "event", "Videos", kgvidL10n_frontend.playstart, title); } // Yoast renamed ga function
		else if (typeof _gaq != "undefined") { _gaq.push(["_trackEvent", "Videos", kgvidL10n_frontend.playstart, title]); }

	}

	if ( !isNaN(event) ) {

		if (video_vars.countable) { //video is in the db
			changed = true;
		}
		if (typeof gtag != "undefined") {
			gtag("event", event+"%", {
				'event_category': "Videos", 
				'event_label': title
			}); 
		}
		else if (typeof ga != "undefined") { ga("send", "event", "Videos", event+"%", title); }
		else if (typeof __gaTracker != "undefined") { __gaTracker("send", "event", "Videos", event+"%", title); } // Yoast renamed ga function
		else if (typeof _gaq != "undefined") { _gaq.push(["_trackEvent", "Videos", event+"%", title]); }

	}

	if ( event == "end" ) {

		if (video_vars.countable) { //video is in the db
			changed = true;
		}
		if (typeof gtag != "undefined") { 
			gtag("event", kgvidL10n_frontend.completeview, {
				'event_category': "Videos", 
				'event_label': title
			}); 
		}
		if (typeof ga != "undefined") { ga("send", "event", "Videos", kgvidL10n_frontend.completeview, title); }
		if (typeof __gaTracker != "undefined") { __gaTracker("send", "event", "Videos", kgvidL10n_frontend.completeview, title); } // Yoast renamed ga function
		else if (typeof _gaq != 'undefined') { _gaq.push(['_trackEvent', 'Videos', kgvidL10n_frontend.completeview, title]); }

	}

	if ( changed == true
		&& video_vars.count_views != 'false'
		&& (
			video_vars.count_views == 'quarters'
			|| ( video_vars.count_views == 'start_complete' && ( event == 'play' || event == 'end' ) )
			|| ( video_vars.count_views == 'start' && event == 'play' )
		)
	) {
		jQuery.post(kgvidL10n_frontend.ajaxurl, {
			action: 'kgvid_count_play',
			security: kgvidL10n_frontend.ajax_nonce,
			post_id: video_vars.attachment_id,
			video_event: event
		}, function(data) {
			if ( event == "play" ) { jQuery('#video_'+id+'_viewcount').html(data); }
		});
	}
}

function kgvid_switch_gallery_page(obj, post_action) {

	var gallery_id = jQuery(obj).parents('.kgvid_gallerywrapper').attr('id');
	var query_atts = jQuery('#'+gallery_id).data('query_atts');
	var page = jQuery(obj).children().first().html();
	var last_id = jQuery('.kgvid_videodiv, .kgvid_video_gallery_thumb').last().data('id').substr(6);

	jQuery('#'+gallery_id).fadeTo("fast", 0.5);

	jQuery.post(kgvidL10n_frontend.ajaxurl, {
		action: 'kgvid_switch_gallery_page',
		security: kgvidL10n_frontend.ajax_nonce,
		page: page,
		query_atts: query_atts,
		last_video_id: last_id
	}, function(data) {
		jQuery('#'+gallery_id).html(data);
		kgvid_document_ready();
		jQuery('#'+gallery_id).fadeTo("fast", 1);
		if ( post_action == "next" ) {
			jQuery.modal.close();
			jQuery('#'+gallery_id+' .kgvid_video_gallery_thumb').first().trigger('click');
		}
		if ( post_action == "prev" ) {
			jQuery.modal.close();
			jQuery('#'+gallery_id+' .kgvid_video_gallery_thumb').last().trigger('click');
		}
	}, "json");

}

function kgvid_share_icon_click(id) {

	var player_element;
	var event;

	if ( jQuery('#kgvid_'+id+'_shareicon').hasClass('dashicons-share') ) {
		event = 'turn on';
		jQuery('#kgvid_'+id+'_shareicon').removeClass('dashicons-share').addClass('dashicons-no');
	}
	else {
		event = 'turn off';
		jQuery('#kgvid_'+id+'_shareicon').removeClass('dashicons-no').addClass('dashicons-share');
	}

	var video_vars = jQuery('#video_'+id+'_div').data('kgvid_video_vars');

	if ( video_vars.player_type == "Video.js" ) {

		eval('videojs.players.video_'+id).pause();

		if ( jQuery('#video_'+id).hasClass('vjs-has-started') ) {
			player_element = ' .vjs-control-bar';
		}
		else { //hasn't started playing yet
			player_element = ' .vjs-big-play-button';
		}

		if ( jQuery('#video_'+id+'_div'+player_element).attr('style') == undefined ) {
		jQuery('#video_'+id+'_div'+player_element).hide();
		}
		else {
			jQuery('#video_'+id+'_div'+player_element).removeAttr('style');
		}

	}// if Video.js player
	else if ( video_vars.player_type == "WordPressDefault" ) {

		jQuery('#video_'+id+'_div video')[0].pause();
		jQuery('#video_'+id+'_div .mejs-overlay-button').toggle();

	}//if WordPress Default player
	else if ( video_vars.player_type == "JWPlayer" ) {
		var player_id = jQuery('#video_'+id+'_div').children('div[id^="jwplayer"]').attr('id');
		player_id = player_id.replace('_wrapper', ''); //Flash JW Players have wrapper in the id
		var player = jwplayer(player_id);
		player.pause(true);
	}

	if ( event == 'turn on' ) { jQuery('#video_'+id+'_div').off('mouseenter mouseleave focus focusout').addClass('kgvid_video_meta_hover'); }
	else { kgvid_add_hover(id); }

	jQuery('#video_'+id+'_embed, #click_trap_'+id).slideToggle();

}

function kgvid_set_start_at(id) {

	var video_vars = jQuery('#video_'+id+'_div').data('kgvid_video_vars');

	if ( jQuery('#video_'+id+'_embed .kgvid_start_at_enable').prop('checked') ) {

		if ( video_vars.player_type == "Video.js" ) {
			var current_time = eval('videojs.players.video_'+id).currentTime();
		}
		else if ( video_vars.player_type == "WordPressDefault" ) {
			var current_time = jQuery('#video_'+id+'_div video')[0].getCurrentTime();
		}

		jQuery('#video_'+id+'_embed .kgvid_start_at').val(kgvid_convert_to_timecode(Math.floor(current_time)));

	}

	kgvid_change_start_at(id);

}

function kgvid_change_start_at(id) {

	var embed_code = jQuery('#video_'+id+'_embed .kgvid_embedcode').val();
	parsed_embed_code = jQuery.parseHTML(embed_code);
	var old_src = jQuery(parsed_embed_code).attr('src');

	if ( old_src.indexOf('&kgvid_video_embed[start]=') !== -1 ) { //start value exists
		var src_array = old_src.split('&');
		old_src = src_array[0] + '&' + src_array[1];
	}

	if ( jQuery('#video_'+id+'_embed .kgvid_start_at_enable').prop('checked') ) {
		var new_src = old_src + '&kgvid_video_embed[start]='+jQuery('#video_'+id+'_embed .kgvid_start_at').val();
	}
	else {
		var new_src = old_src;
	}

	jQuery('#video_'+id+'_embed .kgvid_embedcode').val("<iframe allowfullscreen src='"+new_src+"' frameborder='0' scrolling='no' width='640' height='360'></iframe>");

}
