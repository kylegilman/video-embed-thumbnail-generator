function kgvid_set_mp4_src(mp4_srcs) {

	var player = _V_('video_'+mp4_srcs.id);

	var support_1080 = false;
	var support_720 = false;

	if ( screen.width >= 1080 || screen.height >= 1080 ) { support_1080 = true; support_720 = true; }
	else if ( screen.width >= 960 || screen.height >= 960 ) { support_720 = true; support_1080 = false; }
	else if ( screen.width < 960 && screen.height < 960 ) { support_1080 = false; support_720 = false; }

	if ( support_1080 == true ) {
		if ( typeof(mp4_srcs.src_original) != undefined )  { }
		else if ( typeof(mp4_srcs.src_1080) != undefined )  { player.src({ type: "video/mp4", src: mp4_srcs.src_1080 }); }
		else if ( typeof(mp4_srcs.src_720) != undefined )  { player.src({ type: "video/mp4", src: mp4_srcs.src_720 }); }
	}

	if ( support_720 == true && support_1080 == false ) {
		if ( typeof(mp4_srcs.src_720) != undefined )  { player.src({ type: "video/mp4", src: mp4_srcs.src_720 }); }
	}

	if ( support_720 == false && support_1080 == false ) {
		if ( typeof(mp4_srcs.mobile) != undefined ) { player.src({ type: "video/mp4", src: mp4_srcs.src_mobile }); } 
	}
	alert (support_720);
}

function kgvid_SetVideo(source, width, height) {
	jQuery('#kgvid_GalleryVideo').attr('src', source);
	jQuery('#kgvid_GalleryVideo').attr('width', parseInt(width)+20);
	jQuery('#kgvid_GalleryVideo').attr('height', parseInt(height)+20);
	jQuery('#kgvid_GalleryPlayerDiv').dialog("option", "width", parseInt(width)+30);
	jQuery('#kgvid_GalleryPlayerDiv').closest('.ui-dialog').height(parseInt(height))
	//jQuery('#kgvid_GalleryPlayerDiv').dialog("option", "height", parseInt(height)+30);
	jQuery('#kgvid_GalleryPlayerDiv').dialog('open');
	jQuery('.ui-widget-overlay').click(function () { jQuery('#kgvid_GalleryPlayerDiv').dialog('close'); });
}

function kgvid_video_counter(id, plays, ends, event) {

	//var player = _V_('video_'+id)
	//if ( player.currentTime() > 1 ) { alert ("Count"); }
	var changed = false;
	
	if (plays != "not_countable" ) { //video is in the db
		if ( document.getElementById(id+'_played').value == 'not_played' ) { plays++; changed = true; }
		if ( event == "ended" ) { ends++; changed = true; }
		if ( changed == true ) {
			jQuery.post(ajax_object.ajaxurl, {
				action: 'kgvid_count_play',
				post_id: id,
				video_plays: plays,
				complete_views: ends
			}, function(data) {
				//alert(data);
			});
		}
	}
	
	document.getElementById(id+'_played').value = 'played';
	
}