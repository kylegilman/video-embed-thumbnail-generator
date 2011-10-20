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
if (checked) { document.getElementById('attachments['+postID+'][kgflashmediaplayer-aspect]').value = document.getElementById('attachments_'+postID+'_kgflashmediaplayer-height').value / document.getElementById('attachments_'+postID+'_kgflashmediaplayer-width').value; }
}

function kg_generate_thumb(postID, buttonPushed) {

	var kg_ffmpeg_path = document.getElementById('attachments['+postID+'][kgflashmediaplayer-ffmpeg_path]').value;
	var kg_encodeogg = document.getElementById('attachments['+postID+'][kgflashmediaplayer-encodeogg]').value;
	var kg_encodewebm = document.getElementById('attachments['+postID+'][kgflashmediaplayer-encodewebm]').value;
	var kg_plugin_dir = document.getElementById('attachments['+postID+'][kgflashmediaplayer-plugin_dir]').value;
	var kg_upload_dir_url = document.getElementById('attachments['+postID+'][kgflashmediaplayer-upload_url]').value;
	var kg_upload_dir_path = document.getElementById('attachments['+postID+'][kgflashmediaplayer-upload_path]').value;
	var kg_upload_dir_basedir = document.getElementById('attachments['+postID+'][kgflashmediaplayer-upload_basedir]').value;
	var attachmentURL = document.getElementById('attachments['+postID+'][kgflashmediaplayer-url]').value;
	var howmanythumbs = document.getElementById('attachments_'+postID+'_numberofthumbs').value;
	var firstframethumb = document.getElementById('attachments_'+postID+'_firstframe').checked;
	var posterurl = document.getElementById('attachments['+postID+'][kgflashmediaplayer-poster]').value;
	var specifictimecode = document.getElementById('attachments['+postID+'][thumbtime]').value;
	if (specifictimecode === "0") { specifictimecode = "firstframe"; }
	var thumbnailplaceholderid = "#attachments_"+postID+"_thumbnailplaceholder";
	var encodeplaceholderid = "#attachments_"+postID+"_encodeplaceholder";
	var widthID = 'attachments_'+postID+'_kgflashmediaplayer-width';
	var heightID = 'attachments_'+postID+'_kgflashmediaplayer-height';
	var widthsaveID = 'attachments['+postID+'][kgflashmediaplayer-widthsave]';
	var heightsaveID = 'attachments['+postID+'][kgflashmediaplayer-heightsave]';
	var maxwidthID = 'attachments['+postID+'][kgflashmediaplayer-maxwidth]';
	var maxheightID = 'attachments['+postID+'][kgflashmediaplayer-maxheight]';


	if (buttonPushed == "generate" || buttonPushed == "random" ) { actionName = "generate"; }
	else { actionName = buttonPushed; }

	if (buttonPushed == "delete") { 
		document.getElementById('attachments['+postID+'][kgflashmediaplayer-poster]').value = ""; 
		document.getElementById('attachments['+postID+'][thumbtime]').value = "";
	}

	if (buttonPushed != "encode") {
		jQuery(thumbnailplaceholderid).empty();
		jQuery(thumbnailplaceholderid).append('<strong>Loading...</strong>');
	}

	if (buttonPushed == "encode") {
		jQuery(encodeplaceholderid).empty();
	}

	jQuery.post(kg_plugin_dir + '/kg_callffmpeg.php', { movieurl: attachmentURL, numberofthumbs: howmanythumbs, action: actionName, ffmpeg: kg_ffmpeg_path, encodeogg: kg_encodeogg, encodewebm: kg_encodewebm, uploads_path: kg_upload_dir_path, uploads_url: kg_upload_dir_url, uploads_basedir: kg_upload_dir_basedir, attachmentID: postID, generate_button: buttonPushed, thumbtimecode: specifictimecode, dofirstframe: firstframethumb, poster: posterurl }, function(data) { 

		if (buttonPushed != "encode") {
			jQuery(thumbnailplaceholderid).empty(); 
			jQuery(thumbnailplaceholderid).append(data.thumbnaildisplaycode);
		}

		if (actionName == "generate") { 
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
		}

		if (buttonPushed == "encode") {
			jQuery(encodeplaceholderid).append(data.embed_display);
		}

	}, "json");

}

function kg_insert_shortcode() {

	jQuery.post(document.getElementById('attachments[singleurl][kgflashmediaplayer-plugin_dir]').value + '/kg_callffmpeg.php', { 
		movieurl: document.getElementById('attachments[singleurl][kgflashmediaplayer-url]').value, action:'submit', poster: document.getElementById('attachments[singleurl][kgflashmediaplayer-poster]').value, uploads_path: document.getElementById('attachments[singleurl][kgflashmediaplayer-upload_path]').value }, function(data) {
		jQuery('attachments_singleurl_thumbnailplaceholder').empty();
	}, "json" );

	var shortcode = "";
	if (document.getElementById('videotitle').value != "") { shortcode += '<strong>' + document.getElementById('videotitle').value + '</strong><br />'; }
	if (document.getElementById('attachments[singleurl][kgflashmediaplayer-url]').value !="") {
		shortcode += ' [FMP';
		if (document.getElementById('attachments[singleurl][kgflashmediaplayer-poster]').value !="") { shortcode += ' poster="' + document.getElementById("attachments[singleurl][kgflashmediaplayer-poster]").value + '"'; }
		if (document.getElementById('attachments_singleurl_kgflashmediaplayer-width').value !="") { shortcode += ' width="' + document.getElementById("attachments_singleurl_kgflashmediaplayer-width").value + '"'; }
		if (document.getElementById('attachments_singleurl_kgflashmediaplayer-height').value !="") { shortcode += ' height="' + document.getElementById("attachments_singleurl_kgflashmediaplayer-height").value + '"'; }
		shortcode += ']' + document.getElementById('attachments[singleurl][kgflashmediaplayer-url]').value + '[/FMP] '; }
		if (document.getElementById('downloadlink').checked) { shortcode += '<br /><a href="' + document.getElementById("attachments[singleurl][kgflashmediaplayer-url]").value + '">Right-click or ctrl-click this link to download</a>'; }

	parent.tinyMCE.activeEditor.execCommand('mceInsertContent', 0, shortcode);
	//Close window
	parent.jQuery("#TB_closeWindowButton").click();
}