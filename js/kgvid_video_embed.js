kgvid_video_vars = {};

jQuery(document).ready(kgvid_document_ready());

function kgvid_document_ready() {

	jQuery('.kgvid_videodiv').each(function(){ //setup individual videos
		var video_vars = jQuery(this).data('kgvid_video_vars');
		if ( video_vars.player_type == "Strobe Media Playback" ) {
			swfobject.embedSWF(video_vars.swfurl, 'video_'+video_vars.id, video_vars.width, video_vars.height, '10.1.0', video_vars.expressinstallswfurl, video_vars.flashvars, video_vars.params);
		}

		kgvid_setup_video(video_vars.id);

	});

	jQuery('.kgvid_gallerywrapper').each(function(){ //setup gallery thumbnails

		var gallery_id = this.id;
		kgvid_resize_gallery_play_button(gallery_id);
		jQuery(window).resize( function(){ kgvid_resize_gallery_play_button(gallery_id) } );

	});

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
		closeHTML:'<a class="modalCloseImg simplemodal-close" title="Close">X</a>',
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

			//load the video player embed code

			if ( jQuery('#kgvid_popup_video_holder_'+id).length == 1 ) { //make sure the user hasn't moved on to another video

				var popup_code = jQuery('#kgvid_video_gallery_thumb_'+id).data('popupcode');
				var video_vars = jQuery('#kgvid_video_gallery_thumb_'+id).data('kgvid_video_vars');

				jQuery('#kgvid_popup_video_holder_'+id).html(popup_code);
				jQuery('#video_'+id+'_div').data('kgvid_video_vars', video_vars);

				if ( video_vars.player_type == "Strobe Media Playback" ) {
					swfobject.embedSWF(video_vars.swfurl, 'video_'+id, video_vars.width, video_vars.height, '10.1.0', video_vars.expressinstallswfurl, video_vars.flashvars, video_vars.params);
				}

				jQuery.modal.setContainerDimensions();
				kgvid_setup_video(id);
				jQuery.modal.setPosition();

				dialog.wrap.css('overflow', 'hidden'); //disable scroll bars
				if ( meta > 0 ) {
					jQuery('#kgvid-simplemodal-container').css('color','white'); //show text if there's anything to see below the video
					meta_bump = 5;
					if ( video_vars.player_type == "JWPlayer" ) { meta_bump = 15; }
					jQuery('#kgvid-simplemodal-container').height(jQuery('#kgvid-simplemodal-container').height() + meta_bump);
				}

				if ( video_vars.player_type == "Video.js" ) {
					videojs('video_'+id).load();
					videojs('video_'+id).play();
				}//end if Video.js

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
						}
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
					videojs('video_'+id).pause();
					setTimeout(function() { videojs('video_'+id).dispose(); }, 0);
				}
				if ( video_vars.player_type == "JWPlayer" ) {
					jwplayer(jQuery('#kgvid_'+id+'_wrapper .jwplayer').attr('id')).stop();
				}
			}

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

	var video_vars = jQuery('#video_'+id+'_div').data('kgvid_video_vars');

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

		jQuery('#video_'+id).append(jQuery('#video_'+id+'_watermark'));

		player.on('loadedmetadata', function(){

			var text_tracks = player.textTracks();
			var default_track_id = jQuery('#video_'+id+'_div track[default]').first().attr('id');

			if ( default_track_id != null ) {
				jQuery(text_tracks).each(function(index, track) {
					if ( track.id == default_track_id && track.mode != 'showing' ) { player.textTracks()[index].mode = 'showing'; }
				});
			}

			if ( video_vars.set_volume != "" ) { player.volume(video_vars.set_volume); }
			if ( video_vars.mute == "true" ) { player.muted(true); }

		});

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
			if ( video_vars.endofvideooverlay != "" ) { jQuery('#video_'+id+' > .vjs-poster').hide(); }
			kgvid_video_counter(id, 'play');
		});

		player.on('ended', function kgvid_play_end(){
			kgvid_video_counter(id, 'end');
			setTimeout(function() { jQuery('#video_'+id+' > .vjs-loading-spinner').hide(); }, 250);
			if ( video_vars.endofvideooverlay != "" ) {
				jQuery('#video_'+id+' > .vjs-poster').css({
				'background-image':'url('+video_vars.endofvideooverlay+')'
				}).fadeIn();

				setTimeout(function() { player.on('timeupdate', kgvid_timeupdate); }, 500);

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

			if ( jQuery('#video_'+id).hasClass('vjs-fullscreen') ) {
				var resolutions = player.availableRes;
				var highest_res = Object.keys(resolutions)[Object.keys(resolutions).length - 1];
				player.changeRes(highest_res);
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

		player.on( 'changeRes', function() {
			if ( jQuery('#video_'+id).hasClass('vjs-has-started') == true ) {
				var poster = jQuery('#video_'+id+' video').attr('poster');
				jQuery('#video_'+id+' video').removeAttr('poster'); //prevents poster from showing during resolution switch
				player.on ( 'ended', function() { jQuery('#video_'+id+' video').attr('poster', poster); } );
			}
		});

		if ( video_vars.autoplay == "true" && player.paused() ) { player.play(); }

	} //end if Video.js

	if ( video_vars.player_type == "Strobe Media Playback" || video_vars.player_type == "WordPressDefault" ) {

		jQuery('#video_'+id+'_div').hover(
			function(){
				jQuery('#video_'+id+'_meta').addClass('kgvid_video_meta_hover');
			},
			function(){
				jQuery('#video_'+id+'_meta').removeClass('kgvid_video_meta_hover');
			}
		);
	} //end if Strobe Media Playback

	if ( video_vars.player_type == "WordPressDefault" ) {

		player = jQuery('#video_'+id+'_div video');

		player.on('loadedmetadata', function() {
			if ( video_vars.set_volume != "" ) { player[0].volume = video_vars.set_volume; }
			if ( video_vars.mute == "true" ) { player[0].setMuted(true); }
			jQuery('#video_'+id+'_div .mejs-container').append(jQuery('#video_'+id+'_watermark'));
		});

		jQuery('#video_'+id+'_div .wp-video').one('click', function(){
			jQuery('#video_'+id+'_meta').removeClass('kgvid_video_meta_hover');
		});

		player.on('play', function(){
			kgvid_video_counter(id, 'play');
		});

		player.on('ended', function(){
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

	if (  video_vars.player_type == "JWPlayer" ) {
		player_id = jQuery('#video_'+id+'_div').children('div[id^="jwplayer"]').attr('id');
		var player = jwplayer(player_id);

		if ( video_vars.set_volume != "" ) { player.setVolume(Math.round(video_vars.set_volume*100)); }
		if ( video_vars.mute == "true" ) { player.setMute(true); }

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

		if ( video_vars.right_click != "on" ) {
			player.onReady( function() {
				jQuery('#video_'+id+'_div .jwclick').remove();
			});
		}

	}

	if ( video_vars.resize == "true" || window.location.search.indexOf("kgvid_video_embed[enable]=true") !== false ) {
		kgvid_resize_video(id);
		jQuery(window).resize( function(){ kgvid_resize_video(id) } );
	}
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
		if ( reference_div.is('body') ) { parent_width = window.innerWidth; }
		else if ( reference_div.attr('id') == 'kgvid_popup_video_holder_'+id ) { //if it's a pop-up video
			var window_width = jQuery(window).width();
			var window_height = jQuery(window).height();
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

			if ( reference_div.attr('id') == 'kgvid_popup_video_holder_'+id && set_height > window_height-60 ) {
				set_height = window_height-60;
				set_width = Math.round(set_height / aspect_ratio);
			}

			if (  video_vars.player_type == "Video.js" && eval('videojs.players.video_'+id) != null ) {
				var player = videojs('video_'+id);
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
				else { jQuery('#kgvid_'+id+'_wrapper .vjs-big-play-button').removeAttr('style'); }

				if ( video_vars.auto_res == 'automatic' && player.availableRes !== undefined ) {
					var resolutions = player.availableRes;
					var resNumbers = [];
					jQuery.each(resolutions, function(){
						if ( this[0] != undefined && !isNaN(parseInt(this[0]['data-res'])) ) {
							resNumbers.push(parseInt(this[0]['data-res']));
						}
					});
					var current_resolution = parseInt(player.getCurrentRes());

					if ( !isNaN(current_resolution) ) {
						if ( window.devicePixelRatio != undefined ) { var pixel_height = set_height * window.devicePixelRatio; } //don't shortchange retina displays
						else { pixel_height = set_height; }
						var res_options = jQuery.map(resNumbers, function(n) {
							if ( n >= pixel_height ) { return n; }
						});
						var set_res = Math.min.apply(Math,res_options);
						if ( set_res != current_resolution && !jQuery('#video_'+id).hasClass('vjs-fullscreen') ) {
							 player.changeRes(set_res+'p');
						}
						if ( jQuery('#video_'+id).hasClass('vjs-has-started') == false ) {
							if ( player.muted() == true ) { player.muted(false); player.muted(true); } // reset volume and mute otherwise player doesn't display properly
							if ( player.volume() != 1 ) {
								var current_volume = player.volume();
								player.volume(1);
								player.volume(current_volume);
							}
						}
					}
				}

			}
			if ( video_vars.player_type == "Strobe Media Playback" ) {
				jQuery('#video_'+id+'_div').height(set_height);
				jQuery('#video_'+id).attr('width',set_width).attr('height',set_height);
				jQuery('#video_'+id+'_html5_api').attr('width',set_width).attr('height',set_height);
			}
			if ( video_vars.player_type == "WordPressDefault" ) {
				jQuery('#kgvid_'+id+'_wrapper').find('.wp-video').attr('style', 'width:'+set_width+'px; height:'+set_height+'px;');
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
		if (typeof ga != "undefined") { ga("send", "event", "Videos", kgvidL10n_frontend.playstart, title); }
		else if (typeof _gaq != "undefined") { _gaq.push(["_trackEvent", "Videos", kgvidL10n_frontend.playstart, title]); }

	}
	if ( event == "end" ) {
		if (video_vars.countable) { //video is in the db
			changed = true;
		}
		if (typeof ga != "undefined") { ga("send", "event", "Videos", kgvidL10n_frontend.completeview, title); }
		else if (typeof _gaq != 'undefined') { _gaq.push(['_trackEvent', 'Videos', kgvidL10n_frontend.completeview, title]); }
	}
	if ( changed == true ) {
		jQuery.post(kgvidL10n_frontend.ajaxurl, {
			action: 'kgvid_count_play',
			security: kgvidL10n_frontend.ajax_nonce,
			post_id: video_vars.attachment_id,
			video_event: event
		}, function(data) {
			if ( event == "play" ) { jQuery('#video_'+id+'_viewcount').html(data+' views'); }
		});
	}
}

function kgvid_switch_gallery_page(obj, post_action) {

	var gallery_id = jQuery(obj).parents('.kgvid_gallerywrapper').attr('id');
	var page = jQuery(obj).children().first().html();
	var last_id = jQuery('.kgvid_videodiv, .kgvid_video_gallery_thumb').last().data('id').substr(6);

	jQuery('#'+gallery_id).fadeTo("fast", 0.5);

	jQuery.post(kgvidL10n_frontend.ajaxurl, {
		action: 'kgvid_switch_gallery_page',
		security: kgvidL10n_frontend.ajax_nonce,
		page: page,
		query_atts: eval('kgvid_video_gallery_query_'+gallery_id.substr(14)),
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
