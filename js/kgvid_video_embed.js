kgvid_video_vars = {};

jQuery(document).ready(function() {

	jQuery('.kgvid_videodiv').each(function(){ //setup individual videos
		var id = jQuery(this).data('id');
		var video_variable_name = 'kgvid_video_vars_'+id;
		kgvid_video_vars[id] = eval(video_variable_name);

		if ( kgvid_video_vars[id].player_type == "Strobe Media Playback" ) {
			swfobject.embedSWF(kgvid_video_vars[id].swfurl, 'video_'+id, kgvid_video_vars[id].width, kgvid_video_vars[id].height, '10.1.0', kgvid_video_vars[id].expressinstallswfurl, kgvid_video_vars[id].flashvars, kgvid_video_vars[id].params);
		}

		kgvid_setup_video(id);

	});

	jQuery('.kgvid_video_gallery_thumb').each(function(){ //add onclick for gallery thumbnails
		var id = jQuery(this).data('id');
		jQuery(this).on('click', function() { kgvid_SetVideo(id); } );
	});

});

function kgvid_SetVideo(id) {

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
	if ( width > window.outerWidth ) {
		width = window.outerWidth-60;
		height = Math.round(width * aspect_ratio);
	}
	var frame_height = height;
	var meta = jQuery('#kgvid_video_gallery_thumb_'+id).data('meta');
	if ( meta > 0 ) { frame_height = parseInt(height)+Math.round(24*meta); }
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
		closeHTML:'<a class="modalCloseImg simplemodal-close" title="Close">X</a>',
		zIndex:10000,
		onShow: function(dialog) {

			//build next/previous buttons

			var nav_code = '';
			if ( jQuery('#kgvid_video_gallery_thumb_'+id).prev('#'+gallery_id+' .kgvid_video_gallery_thumb').length  > 0 ) {
				nav_code += '<a class="kgvid_gallery_nav kgvid_gallery_prev" title="'+kgvidL10n_frontend.previous+'">&#8592;</a>';
			}
			if ( jQuery('#kgvid_video_gallery_thumb_'+id).next('#'+gallery_id+' .kgvid_video_gallery_thumb').length  > 0 ) {
				nav_code += '<a class="kgvid_gallery_nav kgvid_gallery_next" title="'+kgvidL10n_frontend.next+'">&#8594;</a>';
			}

			jQuery('#kgvid-simplemodal-container').prepend(nav_code);

			jQuery('.kgvid_gallery_next').click( function() {
				jQuery.modal.close();
				jQuery('#kgvid_video_gallery_thumb_'+id).next('.kgvid_video_gallery_thumb').trigger('click');
			});

			jQuery('.kgvid_gallery_prev').click( function() {
				jQuery.modal.close();
				jQuery('#kgvid_video_gallery_thumb_'+id).prev('.kgvid_video_gallery_thumb').trigger('click');
			});
			jQuery('#simplemodal-data').prepend('<div id="kgvid_popup_video_holder_'+id+'"></div>');

			//load the video player embed code
			jQuery.post(kgvid_ajax_object.ajaxurl, {
				action: 'kgvid_set_gallery_video',
				security: kgvid_ajax_object.ajax_nonce,
				video_id: id
			}, function(data) {

				if ( jQuery('#kgvid_popup_video_holder_'+id).length == 1 ) { //make sure the user hasn't moved on to another video

					kgvid_video_vars[id] = data.kgvid_video_vars;
					var video_vars = data.kgvid_video_vars;

					jQuery('#kgvid_popup_video_holder_'+id).html(data.code);

					if ( kgvid_video_vars[id].player_type == "Strobe Media Playback" ) {
								swfobject.embedSWF(kgvid_video_vars[id].swfurl, 'video_'+id, kgvid_video_vars[id].width, kgvid_video_vars[id].height, '10.1.0', kgvid_video_vars[id].expressinstallswfurl, kgvid_video_vars[id].flashvars, kgvid_video_vars[id].params);
					}

					kgvid_setup_video(id);
					jQuery.modal.setContainerDimensions();
					dialog.wrap.css('overflow', 'hidden'); //disable scroll bars
					if ( meta > 0 ) { jQuery('#kgvid-simplemodal-container').css('color','white'); } //show text if there's anything to see below the video

					if ( video_vars.player_type == "Video.js" ) {
						videojs('video_'+id).load();
						videojs('video_'+id).play();
					}//end if Video.js

					if ( video_vars.player_type == "WordPress Default" ) {
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
							}
						});
					}//end if WordPress Default
				}//end check to make sure video still needs to load
			},"json"); //end .post
		}, //end onShow function
		onClose: function(dialog) {

			if ( viewport_original != "" ) { viewport_meta.attr('content', viewport_original); }
			else { jQuery('#kgvid_gallery_viewport').remove(); }

			var video_vars = kgvid_video_vars[id];
			if ( video_vars !== undefined ) {
				if ( video_vars.player_type == "Video.js" ) {
					videojs('video_'+id).dispose();
				}
				if ( video_vars.player_type == "JW Player" ) {
					jwplayer(jQuery('#kgvid_'+id+'_wrapper .jwplayer').attr('id')).stop();
				}
			}
			try{
				delete kgvid_video_vars[id];
			}catch(e){} //gets around error thrown in IE 8

			jQuery(window).off('resize', kgvid_resize_video(id));

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

function kgvid_timeupdate() {
	jQuery('#'+this.id()+' > .vjs-poster').fadeOut();
}

function kgvid_setup_video(id) {

	var video_vars = kgvid_video_vars[id];

	if ( typeof (jQuery) == 'function' ) { jQuery.fn.fitVids=function(){}; }; //disable fitvids

	var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/i) ? true : false );
	if (iOS && video_vars.player_type == "Strobe Media Playback" ) { video_vars.player_type = "Video.js"; }

	jQuery('#video_'+id+'_div').prepend(jQuery('#video_'+id+'_watermark'));
	jQuery('#video_'+id+'_watermark').attr('style', ''); //shows the hidden watermark div
	jQuery('#video_'+id+'_div').prepend(jQuery('#video_'+id+'_meta'));
	jQuery('#video_'+id+'_meta').attr('style', ''); //shows the hidden meta div
	if ( video_vars.autoplay == "true" ) { jQuery('#video_'+id+'_meta').removeClass('kgvid_video_meta_hover'); }

	if ( video_vars.right_click != "on" ) {
		jQuery('#video_'+id+'_div').bind('contextmenu',function() { return false; });
	}

	if ( video_vars.player_type == "Video.js" ) {

		var player = videojs('video_'+id);

		if ( jQuery('#video_'+id+'_flash_api').parent().is('.fluid-width-video-wrapper') ) { //disables fitVids.js
			jQuery('#video_'+id+'_flash_api').unwrap();
		}

		if ( video_vars.set_volume != "" ) { player.volume(video_vars.set_volume); }

		player.on('play', function kgvid_play_start(){
			player.off('timeupdate', kgvid_timeupdate);
			if ( video_vars.meta ) {
				jQuery('#video_'+id+'_div').hover(
					function(){
						jQuery('#video_'+id+'_meta').addClass('kgvid_video_meta_hover');
					},
					function(){
						jQuery('#video_'+id+'_meta').removeClass('kgvid_video_meta_hover');
					}
				);
				jQuery('#video_'+id+'_meta').removeClass('kgvid_video_meta_hover');
			}
			if ( video_vars.autoplay == "true" ) { jQuery('#video_'+id+' > .vjs-control-bar').removeClass('vjs-fade-in'); }
			kgvid_video_counter(id, 'play');
		});

		player.on('ended', function kgvid_play_end(){
			kgvid_video_counter(id, 'end');
			setTimeout(function() { jQuery('#video_'+id+' > .vjs-loading-spinner').hide(); }, 250);
			if ( video_vars.endofvideooverlay != "" ) {
				jQuery('#video_'+id+' > .vjs-poster').css({
				'background-image':'url('+video_vars.endofvideooverlay+')'
				}).fadeIn();

				player.on('timeupdate', kgvid_timeupdate);

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

			if ( fullScreenApi.supportsFullScreen == true ) { jQuery('#video_'+id).removeClass('vjs-fullscreen'); }
			else if ( jQuery('#video_'+id).hasClass('vjs-fullscreen') ) {
				jQuery('#video_'+id+'_meta').hide();
				jQuery('#video_'+id+'_watermark img').css('position', 'fixed');
			}
			else {
				jQuery('#video_'+id+'_meta').show();
				jQuery('#video_'+id+'_watermark img').css('position', 'absolute');
			}

		});

	} //end if Video.js

	if ( video_vars.player_type == "Strobe Media Playback" || video_vars.player_type == "WordPress Default" ) {

		jQuery('#video_'+id+'_div').hover(
			function(){
				jQuery('#video_'+id+'_meta').addClass('kgvid_video_meta_hover');
				jQuery('#video_'+id+'_watermark').fadeOut(100);
			},
			function(){
				jQuery('#video_'+id+'_meta').removeClass('kgvid_video_meta_hover');
				setTimeout(function(){jQuery('#video_'+id+'_watermark').fadeIn('slow');},3000);
			}
		);
	} //end if Strobe Media Playback

	if ( video_vars.player_type == "WordPress Default" ) {

		player = jQuery('#video_'+id+'_div video');

		if ( video_vars.set_volume != "" ) { player[0].volume = video_vars.set_volume; }

		player.on('play', function kgvid_play_start(){
			jQuery('#video_'+id+'_meta').removeClass('kgvid_video_meta_hover');
			kgvid_video_counter(id, 'play');
		});

		player.on('ended', function kgvid_play_end(){
			kgvid_video_counter(id, 'end');
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

	if (  kgvid_video_vars[id].player_type == "JW Player" ) {
		player_id = jQuery('#video_'+id+'_div').children('div[id^="jwplayer"]').attr('id');
		var player = jwplayer(player_id);

		if ( video_vars.set_volume != "" ) { player.setVolume(Math.round(video_vars.set_volume*100)); }

		player.onPlay( function() {
			kgvid_video_counter(id, 'play');

			if ( video_vars.meta ) {
				jQuery('#video_'+id+'_div').hover(
					function(){
						jQuery('#video_'+id+'_meta').addClass('kgvid_video_meta_hover');
					},
					function(){
						jQuery('#video_'+id+'_meta').removeClass('kgvid_video_meta_hover');
					}
				);
				jQuery('#video_'+id+'_meta').removeClass('kgvid_video_meta_hover');
			}

		});

		player.onComplete( function() {
			kgvid_video_counter(id, 'end');

			if ( jQuery('#kgvid_video_gallery_thumb_'+id).data('gallery_end') != "" && jQuery('#kgvid_video_gallery_thumb_'+id).data('gallery_end') != null ) {
				kgvid_video_gallery_end_action(id, jQuery('#kgvid_video_gallery_thumb_'+id).data('gallery_end'));
			}

		});

	}

	if ( video_vars.resize == "true" || window.location.search.indexOf("kgvid_video_embed[enable]=true") !== false ) {
		kgvid_resize_video(id);
		jQuery(window).resize( function(){ kgvid_resize_video(id) } );
	}
}

function kgvid_resize_all_videos() {

	for (var id in kgvid_video_vars) {
		kgvid_resize_video(id);
	}

}

function kgvid_resize_video(id) {

	if ( kgvid_video_vars.hasOwnProperty(id) ) {
		var video_vars = kgvid_video_vars[id];
		var set_width = video_vars.width;
		var set_height = video_vars.height;
		var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/i) ? true : false );
		if ( iOS ) { video_vars.player_type = "iOS"; }
		var aspect_ratio = Math.round(set_height/set_width*1000)/1000
		var reference_div = jQuery('#kgvid_'+id+'_wrapper').parent();
		if ( reference_div.is('body') ) { parent_width = window.innerWidth; }
		if ( reference_div.is('#simplemodal-data') ) { parent_width = window.outerWidth-40; }
		else { parent_width = reference_div.width(); }
		if ( parent_width < set_width ) { set_width = parent_width; }

		if ( set_width != 0 ) {

			jQuery('#kgvid_'+id+'_wrapper').width(set_width);
			var set_height = Math.round(set_width * aspect_ratio);
			if (  video_vars.player_type == "Video.js" ) {
				videojs('video_'+id).width(set_width).height(set_height);
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
				else { jQuery('#kgvid_'+id+'_wrapper .vjs-big-play-button').removeAttr('style'); }
			}
			if ( video_vars.player_type == "Strobe Media Playback" ) {
				jQuery('#video_'+id+'_div').height(set_height);
				jQuery('#video_'+id).attr('width',set_width).attr('height',set_height);
				jQuery('#video_'+id+'_html5_api').attr('width',set_width).attr('height',set_height);
			}

			if ( video_vars.player_type == "iOS" ) {
				jQuery('#video_'+id).attr('width',set_width).attr('height',set_height);
				jQuery('#video_'+id).width(set_width).height(set_height);

				jQuery('#kgvid_'+id+'_wrapper').find('.wp-video-shortcode').attr('width',set_width).attr('height',set_height);
				jQuery('#kgvid_'+id+'_wrapper').find('.wp-video-shortcode').width(set_width).height(set_height);

			}

		}

		var meta = jQuery('#kgvid_video_gallery_thumb_'+id).data('meta');
		var extra_meta_height = Math.round(20*meta);
		jQuery('#kgvid-simplemodal-container').width(parseInt(set_width)+10);
		jQuery('#kgvid-simplemodal-container').height(parseInt(set_height)+10+extra_meta_height);
		jQuery('.simplemodal-wrap').css('overflow', 'hidden');
	}
}

function kgvid_strobemedia_callback(id) {

	var player = document.getElementById('video_'+id);
	var video_vars = kgvid_video_vars[id];

	if ( player.getState() == 'buffering' || player.getState() == 'playing' ) {
		kgvid_video_counter(video_vars.id, 'play');
	}

	if ( player.getState() == 'uninitialized' && video_vars.set_volume != "" ) {
		player.setVolume(video_vars.set_volume);
	}

}

function kgvid_video_counter(id, event) {

	var video_vars = kgvid_video_vars[id];
	var changed = false;
	var title = jQuery('#kgvid_'+id+'_wrapper meta[itemprop=name]').attr('content');

	var played = jQuery('#video_'+id+'_div').data("played") || "not played";
	if ( played == "not played" ) {
		if (video_vars.countable) { //video is in the db
			changed = true;
			jQuery('#video_'+id+'_div').data("played", "played");
		}
		if (typeof _gaq != "undefined") { _gaq.push(["_trackEvent", "Videos", kgvidL10n_frontend.playstart, title]); }
	}
	if ( event == "end" ) {
		if (video_vars.countable) { //video is in the db
			changed = true;
		}
		if (typeof _gaq != 'undefined') { _gaq.push(['_trackEvent', 'Videos', kgvidL10n_frontend.completeview, title]); }
	}
	if ( changed == true ) {
		jQuery.post(kgvid_ajax_object.ajaxurl, {
			action: 'kgvid_count_play',
			security: kgvid_ajax_object.ajax_nonce,
			post_id: id,
			video_event: event
		}, function(data) {
			if ( event == "play" ) { jQuery('#video_'+id+'_viewcount').html(data+' views'); }
		});
	}
}
