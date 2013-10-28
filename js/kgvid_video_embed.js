var kgvid_video_vars = {};

function kgvid_SetVideo(suffix, site_url, id, width, height, meta) {
	var aspect_ratio = Math.round(height/width*1000)/1000
	if ( width > screen.width ) {
		width = screen.width-6;
		height = Math.round(width * aspect_ratio);
	}
	var iframe_height = height;
	if ( meta > 0 ) { iframe_height = parseInt(height)+Math.round(20*meta); }

	jQuery('#kgvid_GalleryPlayerDiv_'+suffix).html('<iframe id="kgvid_GalleryVideo_'+id+'" src="'+site_url+'?attachment_id='+id+'&kgvid_video_embed[enable]=true&kgvid_video_embed[gallery]=true&kgvid_video_embed[width]='+width+'&kgvid_video_embed[height]='+height+'" scrolling="no" width="'+width+'" height="'+iframe_height+'" frameborder="0" webkitallowfullscreen="" allowfullscreen=""></iframe>');
	jQuery('#kgvid_GalleryPlayerDiv_'+suffix).dialog("option", "width", parseInt(width)+6);
	jQuery('#kgvid_GalleryPlayerDiv_'+suffix).dialog('open');
	jQuery('#kgvid_GalleryPlayerDiv_'+suffix).dialog("option", "height", parseInt(iframe_height)+10);
	jQuery('.ui-widget-overlay').click(function () { jQuery('#kgvid_GalleryPlayerDiv_'+suffix).dialog('close'); });
}

function kgvid_timeupdate() {

	jQuery('#'+this.id()+' > .vjs-poster').fadeOut();
}

function kgvid_setup_video(id) {
	var video_vars = kgvid_video_vars[id];
	var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/i) ? true : false );
	if (iOS && video_vars.player_type == "Strobe Media Playback" ) { video_vars.player_type = "Video.js"; }

	jQuery('#video_'+id+'_div').prepend(jQuery('#video_'+id+'_watermark'));
	jQuery('#video_'+id+'_watermark').attr('style', ''); //shows the hidden watermark div
	jQuery('#video_'+id+'_div').prepend(jQuery('#video_'+id+'_meta'));
	jQuery('#video_'+id+'_meta').attr('style', ''); //shows the hidden meta div

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
			if ( video_vars.endOfVideoOverlay != "" ) {
				jQuery('#video_'+id+' > .vjs-poster').css({
				'background-image':'url('+video_vars.endofvideooverlay+')'
				}).fadeIn();

				player.on('timeupdate', kgvid_timeupdate);
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

		if ( video_vars.autoplay == "true" ) { jQuery('#video_'+id+'_meta').removeClass('kgvid_video_meta_hover'); }
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

		if ( video_vars.autoplay == "true" ) { jQuery('#video_'+id+'_meta').removeClass('kgvid_video_meta_hover'); }

		if ( video_vars.meta ) {
			jQuery('#video_'+id+'_div').hover(
				function(){
					jQuery('#video_'+id+'_meta').addClass('kgvid_video_meta_hover');

				},
				function(){
					jQuery('#video_'+id+'_meta').removeClass('kgvid_video_meta_hover');
				}
			);
		}

		if ( video_vars.set_volume != "" ) { player[0].volume = video_vars.set_volume; }

		player.on('play', function kgvid_play_start(){
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
		});

	} //end if WordPress Default

	if ( video_vars.resize == "true" || window.location.search.indexOf("kgvid_video_embed[enable]=true") !== false ) {
		kgvid_resize_video(id);
		window.addEventListener('resize', kgvid_resize_all_videos, false);
	}
}

function kgvid_resize_all_videos() {
	for (var id in kgvid_video_vars) {
		kgvid_resize_video(id);
	}
}

function kgvid_resize_video(id) {

	var video_vars = kgvid_video_vars[id];
	var set_width = video_vars.width;
	var set_height = video_vars.height;
	var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/i) ? true : false );
	if ( iOS ) { video_vars.player_type = "iOS"; }
	var aspect_ratio = Math.round(set_height/set_width*1000)/1000
	var reference_div = jQuery('#kgvid_'+id+'_wrapper').parent();
	if ( reference_div.is('body') ) { parent_width = window.innerWidth; }
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

	var played = jQuery('#video_'+id+'_div').data("played") || "not played";
	if ( played == "not played" ) {
		if (video_vars.countable) { //video is in the db
			changed = true;
			jQuery('#video_'+id+'_div').data("played", "played");
		}
		if (typeof _gaq != "undefined") { _gaq.push(["_trackEvent", "Videos", "Play Start", video_vars.title]); }
	}
	if ( event == "end" ) {
		if (video_vars.countable) { //video is in the db
			changed = true;
		}
		if (typeof _gaq != 'undefined') { _gaq.push(['_trackEvent', 'Videos', 'Complete View', video_vars.title]); }
	}
	if ( changed == true ) {
		jQuery.post(ajax_object.ajaxurl, {
			action: 'kgvid_count_play',
			post_id: id,
			video_event: event
		}, function(data) {
			if ( event == "play" ) { jQuery('#video_'+id+'_viewcount').html(data+' views'); }
		});
	}
}
