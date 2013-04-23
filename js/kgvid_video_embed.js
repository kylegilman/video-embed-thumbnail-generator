function kgvid_SetVideo(suffix, site_url, id, width, height) {
	jQuery('#kgvid_GalleryPlayerDiv_'+suffix).html('<iframe id="kgvid_GalleryVideo_'+id+'" src="'+site_url+'?attachment_id='+id+'&kgvid_video_embed[enable]=true&kgvid_video_embed[gallery]=true&kgvid_video_embed[width]='+width+'&kgvid_video_embed[height]='+height+'" scrolling="no" width="'+width+'" height="'+height+'" frameborder="0" webkitallowfullscreen="" allowfullscreen=""></iframe>');
	jQuery('#kgvid_GalleryPlayerDiv_'+suffix).dialog("option", "width", parseInt(width)+6);
	jQuery('#kgvid_GalleryPlayerDiv_'+suffix).dialog('open');
	jQuery('#kgvid_GalleryPlayerDiv_'+suffix).dialog("option", "height", parseInt(height)+10);
	jQuery('.ui-widget-overlay').click(function () { jQuery('#kgvid_GalleryPlayerDiv_'+suffix).dialog('close'); });
}

function kgvid_setup_video(id, player_type, set_volume) {
	var player = _V_('video_'+id);
	if ( player_type == "Video.js" ) {
		if ( set_volume != "" ) { player.volume(set_volume); }
	}
	if ( player_type == "Strobe Media Playback" ) {
		if ( set_volume != "" ) { document.getElementById('video_'+id+'html5_api').setVolume(set_volume); }
		jQuery('#video_'+id+'_div').hover(function(){ jQuery('#video_'+id+'_meta').addClass('kgvid_video_meta_hover'); },function(){ jQuery('#video_'+id+'_meta').removeClass('kgvid_video_meta_hover'); });
	}
	jQuery('#video_'+id+'_div').prepend(jQuery('#video_'+id+'_watermark'));
	jQuery('#video_'+id+'_watermark').attr('style', ''); //shows the hidden watermark div
	jQuery('#video_'+id+'_div').prepend(jQuery('#video_'+id+'_meta'));
	jQuery('#video_'+id+'_meta').attr('style', ''); //shows the hidden meta div
}

function kgvid_ios_player(id) {
	//var source = document.getElementById('video_'+id+'_html5_api').src;
	var player = _V_('video_'+id);
	var source = document.getElementById('video_'+id+'_html5_api').src
	var poster = player.options.poster;
	if ( source != "" ) {
		player.tag.src = '';
		player.tech.removeTriggers();
		player.load();
		player.destroy();
		var ios_video = '<video id="video_'+id+'" controls preload="metadata"';
		if ( poster != null ) { ios_video += ' poster="'+poster+'" '; }
		ios_video += '\><source src="'+source+'" type="video/mp4" /></video>';
	}
	else { var ios_video = '<div id="video_'+id+'" style="background-color:black;"><div class="kgvid_ios_novideo"></div>';
		if ( poster != null ) { ios_video += '<img class="kgvid_ios_novideo" src="'+poster+'">'; }
		ios_video += '</div>'; 
	}
	jQuery(player.el).remove();
	jQuery('#video_'+id+'_div').prepend(ios_video);
	if ( source != "" ) { document.getElementById('video_'+id).load(); }
}

function kgvid_resize_video(id, player_type, set_width, set_height) {
	var aspect_ratio = Math.round(set_height/set_width*1000)/1000
	var parent_width = jQuery('#kgvid_'+id+'_wrapper').parent().width();
	if ( parent_width < set_width ) { set_width = parent_width; }
	set_width = parseInt(set_width);

	if ( set_width != 0 ) {

		jQuery('#kgvid_'+id+'_wrapper').width(set_width);
		var set_height = Math.round(set_width * aspect_ratio);
		if ( player_type == "Video.js" ) {
			_V_('video_'+id).width(set_width).height(set_height);
			if ( set_width < 500 ) {
				var scale = Math.round(100*set_width/500)/100;
				jQuery('#kgvid_'+id+'_wrapper .vjs-big-play-button').css('-webkit-transform','scale('+scale+')').css('-o-transform','scale('+scale+')').css('-ms-transform','scale('+scale+')').css('transform','scale('+scale+')');
			}
		}
		if ( player_type == "Strobe Media Playback" ) {
			jQuery('#video_'+id+'_div').height(set_height);
			jQuery('#video_'+id+'_html5_api').attr('width',set_width).attr('height',set_height);
		}
		if ( player_type == "iOS" ) {
			jQuery('#video_'+id).attr('width',set_width).attr('height',set_height);
			jQuery('#video_'+id).width(set_width).height(set_height);
		}

	}
	
	var width_remove = 10;
	if ( jQuery('#video_'+id+'_embed').length ) {  width_remove = 180; }
	jQuery('#video_'+id+'_title').width(set_width-width_remove); //truncates long titles
	
	width_remove = 0;
	if ( jQuery('#video_'+id+'_viewcount').length ) { width_remove = jQuery('#video_'+id+'_viewcount').width()+20; }
	jQuery('#video_'+id+'_caption').width(set_width-width_remove); //wraps long captions
}

function kgvid_video_counter(id, plays, ends, event, title) {
	var changed = false;	
	
	var played = jQuery('#video_'+id+'_div').data("played") || "not played";
	if ( played == "not played" ) { 
		if (plays != "not_countable" ) { //video is in the db
			plays++; 
			changed = true; 
			jQuery('#video_'+id+'_div').data("played", "played");
		}
		if (typeof _gaq != "undefined") { _gaq.push(["_trackEvent", "Videos", "Play Start", title]); }
	}
	if ( event == "end" ) {
		if (ends != "not_countable" ) { //video is in the db 
			plays++;
			ends++;
			changed = true; 
		}
		if (typeof _gaq != 'undefined') { _gaq.push(['_trackEvent', 'Videos', 'Complete View', title]); }
	}
	if ( changed == true ) {
		jQuery.post(ajax_object.ajaxurl, {
			action: 'kgvid_count_play',
			post_id: id,
			video_plays: plays,
			complete_views: ends
		}, function(data) {
			jQuery('#video_'+id+'_viewcount').html(plays+' views');
		});
	}	
}