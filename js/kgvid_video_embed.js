function kgvid_SetVideo(source, width, height) {
	jQuery('#kgvid_GalleryVideo').attr('src', source);
	jQuery('#kgvid_GalleryVideo').attr('width', parseInt(width)+20);
	jQuery('#kgvid_GalleryVideo').attr('height', parseInt(height)+20);
	jQuery('#kgvid_GalleryPlayerDiv').dialog("option", "width", parseInt(width)+30);
	jQuery('#kgvid_GalleryPlayerDiv').closest('.ui-dialog').height(parseInt(height))
	jQuery('#kgvid_GalleryPlayerDiv').dialog('open');
	jQuery('.ui-widget-overlay').click(function () { jQuery('#kgvid_GalleryPlayerDiv').dialog('close'); });
}

function kgvid_video_counter(id, plays, ends, event) {

	var changed = false;
	
	if (plays != "not_countable" ) { //video is in the db
		var played = jQuery('#video_'+id+'_div').data("played") || "not played";
		if ( played == "not played" ) { plays++; changed = true; console.log("Played") }
		if ( event == "ended" ) { ends++; changed = true; }
		if ( changed == true ) {
			jQuery.post(ajax_object.ajaxurl, {
				action: 'kgvid_count_play',
				post_id: id,
				video_plays: plays,
				complete_views: ends
			}, function(data) {
			});
		}
	}
	
	jQuery('#video_'+id+'_div').data("played", "played");
	
}