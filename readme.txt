=== Video Embed & Thumbnail Generator ===
Contributors: kylegilman
Donate link: https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=kylegilman@gmail.com&item_name=Video%20Embed%20And%20Thumbnail%20Generator%20Plugin%20Donation/
Tags: video, video gallery, html5, shortcode, thumbnail, ffmpeg, libav, embed, mobile, webm, ogg, h.264
Requires at least: 3.2
Tested up to: 3.6
Stable tag: 4.0.3
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Generates thumbnails, HTML5-compliant videos, and embed codes for locally hosted videos. Requires FFMPEG or LIBAV for thumbnails and encodes.

== Description ==

= A plugin to make embedding videos, generating thumbnails, and encoding HTML5-compliant files a little bit easier. =

The plugin adds several fields to any video uploaded to the WordPress Media Library. Just choose a few options and click Insert into Post and you'll get a shortcode in the post editor that will embed a flexible HTML5/Flash video player with a preview image.

The plugin gives you the option to use either the lightweight, flexible Video.js HTML5 player or Adobe's Strobe Media Playback Flash player. The HTML5 player is styled the same in all browsers and is easily customizable. The Strobe Media Playback option will default to a Flash video player if you're using a Flash-compatible file (flv, f4v, mp4, mov, or m4v). Otherwise it will use the Video.js player as a fallback.

You can also use the plugin to create a popup video gallery. The shortcode uses options similar to the WordPress image gallery shortcode. In its simplest form use the code `[KGVID gallery="true"][/KGVID]` to create a gallery of all videos attached to the post. Thumbnail size and video popup size can be set on the plugin settings page.

If you have them installed on your server, the plugin can use FFMPEG or LIBAV to generate thumbnails and encode HTML5/mobile videos. By default the plugin looks for FFMPEG in `/usr/local/bin` but if the application is installed in a different place on your server, you can point it to the correct place in the plugin settings. Users running WordPress on Windows servers should try using Linux-style paths (with forward slashes instead of backslashes and a forward slash `/` instead of `C:\`)

If FFMPEG or LIBAV is set up correctly, you can generate thumbnails using either the "Generate" or "Randomize" buttons. The "Generate" button will always generate thumbnails from the same frames of your video, evenly spaced. If you don't like them you can randomize the results with the "Randomize" button. If you want to see the first frame of the video, check the "Force 1st Frame Thumbnail" button. If you want really fine control you can enter timecode in the "Thumbnail Timecode" field. Use `mm:ss` format. If you want even more control you can use decimals to approximate frames. For example, `23.5` will generate a thumbnail halfway between the 23rd and 24th seconds in the video. `02:23.25` would be one quarter of the way between the 143rd and 144th seconds. You can generate as many or as few as you need (up to 99 at a time). The unused thumbnails will be deleted after you click "Insert into Post" or "Save Changes."

In the plugin settings you can set the default maximum width and height based on the dimensions of your particular template and those values will be filled in when you open the window. If you generate thumbnails, the video display dimensions will be adjusted automatically to match the size and aspect ratio of the video file. You can make further adjustments if you want. After you choose a thumbnail it will be registered in the Wordpress Media Library and added to the post's attachments.

I highly recommend starting with H.264 video and AAC audio in an MP4 container. If you're encoding with Apple's Compressor, the "Streaming" setting should be "Fast Start" (NOT Fast Start - Compressed Header). I've written up my recommended video encode settings in <a href="http://www.kylegilman.net/2011/02/25/making-mp4-h-264-videos-in-apple-compressor/">a post on my website</a>.

If you have FFMPEG or LIBAV and the proper libraries installed, you can choose to encode your uploaded video into as many as five additional formats depending on your original source. 1080p, 720p, or up to 480p H.264, WEBM, and OGV. Different browsers have different playback capabilities. Most desktop browsers can play H.264, and all modern mobile devices can play at least 480p H.264. If you create multiple H.264 resolutions, the highest resolution supported by the device will be served up automatically. The plugin will not upconvert your video, so if you upload a 720p video, it will not waste your time creating a 1080p version. There was a time when it seemed like a good idea to provide OGV or WEBM for some desktop browsers, but even Firefox is planning to allow H.264 playback in the future and I no longer recommend encoding OGV or WEBM unless you expect a large number of no-Flash sticklers visiting your site. However, your mileage may vary.

The files will encode in the background and will take several minutes to complete, depending on your server setup and the length and size of your video. The plugin adds a Video Encode Queue menu to the Tools menu. You will see encoding progress, the option to cancel an encoding job, and you should get an error message if something goes wrong. Users on Windows servers may get inconsistent results with the encoding queue.

Encoded H.264 files will be fixed for streaming using qt-faststart or MP4Box if you have one of them installed in the same directory as your encoder and select it in the plugin settings. Without one of these applications, FFMPEG & LIBAV will place moov atoms at the end of H.264 encoded files, which forces the entire file to download before playback can start and prevents the Strobe Media player from playing them at all. 

If you want to make ogv, webm, or H.264 files available and can't use the FFMPEG encode button, you can upload your own files to the same directory as the original and the plugin will automatically find them. For example, if your main file is awesomevid.mp4, the plugin will look for awesomevid-1080.mp4, awesomevid-720.mp4, awesomevid-480.mp4 (up to 480p H.264), awesomevid.webm and awesomevid.ogv as well.

If you want to make it easier for people to save the video to their computers, you can choose to include a link by checking the "Generate Download Link Below Video" button.

Sometimes for various reasons you might need to embed video files that are not saved in the Wordpress Media Library. Maybe your file is too large to upload through the media upload form (if it is, I suggest the excellent "Add From Server" plugin), or maybe it's hosted on another server. Either way, you can use the tab "Embed Video From URL" in the Add Media window. Just enter the Video URL manually, and all other steps are the same as the Media Library options. The plugin will look for alternate encoded files in the same directory as the original, but this takes a long time when the video is on another server so it will only check for them once. If you add additional formats you can click the "Re-scan External Server" button in the meta box below the post you've embedded the video in to check again.

=To embed videos on other sites= you can use code like this.

<iframe src='http://www.kylegilman.net/?attachment_id=1906&kgvid_video_embed[enable]=true' frameborder='0' scrolling='no' width='640' height='360'></iframe>

<iframe width="960" height="540" frameborder="0" scrolling="no" src="http://www.kylegilman.net/?attachment_id=1906"></iframe>

= Once you've filled in all your options, click "Insert into Post" and you'll get a shortcode in the visual editor like this =

`[KGVID poster="http://www.kylegilman.net/wp-content/uploads/2011/10/Reel-11-10-10-web_thumb2.jpg" 
width="720" height="404"]http://www.kylegilman.net/wp-content/uploads/2011/10/Reel-11-10-10-web.mp4[/KGVID]`

= If you want to further modify the way the video player works, you can add the following options inside the [KGVID] tag. These will override anything you've set in the plugin settings or attachment details. =

* `poster="http://www.example.com/image.jpg"` sets the thumbnail.
* `width="xxx"`
* `height="xxx"`
* `align="left/right/center"`
* `volume="0.x"` pre-sets the volume for unusually loud videos. Value between 0 and 1.
* `controlbar="docked/floating/none"` sets the controlbar position. Video.js only responds to the "none" option.
* `loop="true/false"`
* `autoplay="true/false"`
* `watermark="http://www.example.com/image.png"`
* `title="Video Title"`
* `embedcode="html code"` changes text displayed in the embed code overlay in order to provide a custom method for embedding a video.
* `view_count="true/false"` turns the view count on or off.
* `caption="Caption"`
* `description="Description"` Used for metadata only.

= These options will only affect Video.js playback =

* `skin="example-css-class"` Completely change the look of the video player. <a href="https://github.com/zencoder/video-js/blob/master/docs/skins.md">Instructions here.</a>

= These options will only affect Flash playback in Strobe Media Playback video elements. They will have no effect on HTML5 or Video.js playback. =

* `endofvideooverlay="http://www.example.com/end_image.jpg` sets the image shown when the video ends.
* `autohide="true/false"` specify whether to autohide the control bar after a few seconds.
* `playbutton="true/false"` turns the big play button overlay in the middle of the video on or off.
* `streamtype="live/recorded/DVR"` I honestly don't know what this is for.
* `scalemode="letterbox/none/stretch/zoom"` If the video display size isnâ€™t the same as the video file, this determines how the video will be scaled.
* `backgroundcolor="#rrggbb"` set the background color to whatever hex code you want.
* `configuration="http://www.example.com/config.xml"` Lets you specify all these flashvars in an XML file.
* `skin="http://www.example.com/skin.xml"` Completely change the look of the video player. <a href="http://www.longtailvideo.com/support/jw-player/jw-player-for-flash-v5/14/building-skins">Instructions here.</a>

= These options are available for video galleries (options work the same as standard WordPress image galleries) =

* `gallery="true"` turns on the gallery
* `gallery_thumb="xxx"` width in pixels to display gallery thumbnails
* `gallery_exclude="15"` comma separated video attachment IDs. Excludes the videos from the gallery.
* `gallery_include="65"` comma separated video attachment IDs. Includes only these videos in the gallery. Please note that include and exclude cannot be used together.
* `gallery_orderby="menu_order/title/post_date/rand/ID"` criteria for sorting the gallery
* `gallery_order="ASC/DESC"` sort order
* `gallery_id="241"` post ID to display a gallery made up of videos associated with a different post

I'm not really a software developer. I'm just a film editor with some time on his hands who wanted to post video for clients and wasn't happy with the current state of any available software. But I want to really make this thing work, so please help me out by posting your feedback in the comments.

== Installation ==

1. Upload the unzipped folder `video-embed-thumbnail-generator` to the `/wp-content/plugins/` directory.
1. Activate the plugin through the 'Plugins' menu in WordPress.
1. Make sure you have all your MIME types configured correctly. Many servers don't have .mp4, .m4v, .ogv configured, and even more don't have .webm. There are a number of ways to do this. In your public_html directory you can edit your .htaccess file and add the following lines:
`AddType video/ogg .ogv
AddType video/mp4 .mp4
AddType video/mp4 .m4v
AddType video/webm .webm`

== Frequently Asked Questions ==

= Why doesn't my video play? =

Most of the time your video doesn't play because it's not encoded in the right format. Videos have containers like mp4, mov, ogv, mkv, flv, etc and within those containers there are video and audio codecs like H.264, MPEG-4, VP8, etc. The best option for this plugin is an mp4 container with H.264 video and AAC audio. mp4s with MPEG-4 video will not play in the Flash player, and if you don't use AAC audio you won't get any audio. 

If you recorded the video using a Samsung Galaxy S II phone, even though most programs will tell you it's H.264 video with AAC audio, there's a good chance that it's actually recorded in 3gp4 format, which won't work with the Flash player. Use MediaInfo Library to get really detailed information about your media files.

The Strobe Media Playback Flash player will not play mp4/m4v/mov files that don't have the MooV atom at the head of the file. FFMPEG puts the moov atom at the end of the file, so this can be a problem. The plugin will fix this problem on newly encoded H.264 videos if you have qt-faststart or MP4Box installed on your server.

= Why doesn't this work with YouTube? =

WordPress already has <a href="http://codex.wordpress.org/Embeds">a built-in system for embedding videos from YouTube, Vimeo, Dailymotion, etc</a>. Just put the URL into your post and WordPress will automatically convert it to an embedded video using oEmbed. You don't need this plugin to do that. If you're trying to generate new thumbnails from YouTube videos, I'm not going to risk Google's wrath by providing that functionality. I'm not even sure I could figure out how to do it anyway.

= I'm getting an error message `FFMPEG not found at /usr/local/bin/. You can embed existing videos, but video thumbnail generation and Mobile/HTML5 video encoding is not possible without FFMPEG.` =

First off, don't panic.

This plugin can use FFMPEG or LIBAV to make thumbnails and create alternate video formats compatible with HTML5 videos players. Unfortunately most servers don't have FFMPEG installed and most shared hosting plans don't allow you to install FFMPEG because of the system resources it requires. You're getting this error message because you don't have FFMPEG installed in the most common directory. If you know you have FFMPEG installed on your server, you'll need to find the actual path to the program and enter it in the plugin settings field `Path to applications on server`

Many of the features of the plugin will work without FFMPEG. You can generate embed shortcodes for your videos on any host because that part of the plugin is JavaScript running in your browser. But without FFMPEG you won't be able to generate thumbnails or encode alternate formats on the server. There is no way around this. A program has to read the video files in order to generate the thumbnails, and FFMPEG is the best one I've found to do that. Dreamhost is one of the few shared hosts I know of that has FFMPEG installed and available for users.

= How can I encode videos in directories protected by .htaccess passwords? =

Use the "Embed from URL" tab and enter the URL in this format http://username:password@yourdomain.com/uploads/2012/01/awesomevid.mp4 in the Video URL field.

== Screenshots ==

1. Thumbnails in the Add Media modal.
2. Video Options in the Add Media modal.
3. Encoding Queue.
4. Shortcode inserted into the post content by the plugin.

== Changelog ==

= 4.0.4 =
* Significantly reduced inline JavaScript generated by the plugin.
* Fixed bug that disabled Strobe Media Playback player and caused "TypeError: Error #1034" messages, especially in Internet Explorer.
* Fixed bug that caused view count to be replaced by complete views when the end of the video is reached.
* Removed square shadow behind Video.js play button in IE.
* Tweaked video resize method to support more kinds of themes.
* Added ability to turn off watermark on individual videos by entering `watermark="false"` in the shortcode.
* Added support for AAC library libfdk_aac.
* Renamed "Poster image" setting to "Default thumbnail"

= 4.0.3 - May 01, 2013 =
* Fixed bug that caused video control text to display below videos on iPhones.
* Changed method for saving video plays to the database. Now more secure and accurate.

= 4.0.2 - April 25, 2013 =
* Plugin settings are no longer re-saved to the database on every page load. Should speed things up a little.
* Changed CSS to discourage theme styles from overriding embed code overlay styles.

= 4.0.1 - April 23, 2013 =
* Added options to display video title and embed code overlays on video player, and captions and view counts below videos.
* Added option to filter your theme's video attachment page template to display the video instead of WordPress's default behavior of just showing the title of the video. For backwards compatibility retained old method of completely replacing the video attachment template with a video player.
* Redesigned settings page to save using AJAX, and added a sample video player so changes are seen immediately.
* Added validation to settings page to require maximum width & height values for embedded videos.
* Added iframe method to embed your videos on other websites.
* Additional video formats encoded by the plugin are now added to the WordPress database as video attachments. To avoid a Russian nesting doll scenario these child attachments do not have the fields for creating thumbnails and encoding additional formats.
* Changed encoded H.264 extensions from .m4v to .mp4 to increase compatibility with WordPress 3.6's new video capabilities. Existing M4V files will still work.
* Checks only one time for alternate video sources when videos are embedded from other servers. This should speed up page load times considerably.
* Added ability to rotate and replace the original file for videos recorded vertically on cell phones.
* Added post meta box to posts with embedded videos that lists alternate formats found for each video.
* Added option to set a post's featured image to the most recently generated thumbnail, and a button to set all previously generated thumbnails as featured images.
* Added option to save generated thumbnails as children of either the video or the post the video is attached to, and a button to convert all thumbnails to the chosen hierarchy.
* Added option to delete associated thumbnails and additional encoded video formats when original video attachment is deleted.
* Added backwards compatibility for WordPress versions 3.2 and above.
* If Strobe Media Playback player is selected, the Video.js player is used in situations where Flash doesn't work (webm, ogg playback) instead of the ugly default browser players.
* Added watermark, view counts, volume attribute, and Google Analytics event tracking when using Strobe Media Playback player.
* Added alignment option to center or right-justify videos.
* Revised video player setup to properly resize the player if the containing DIV is smaller than the video, and resize again if the window size changes (or orientation changes on Android).
* No matter which player is selected, iOS now displays the built-in controls so AirPlay works.
* Added schema.org videoobject markup for improved SEO.
* Fixed FLV embedding with Video.js player and improved selection of embedded formats for Strobe Media Playback.
* Adjusted video gallery CSS and added a play button overlay to gallery thumbnails.
* Adjusted watermark and Video.js play button CSS so the overlays don't overwhelm small videos.
* Set Video.js controls to fade out on autoplay and on iOS, without having to mouseover the video.
* Fixed endless "loading" spinner shown at the end of videos in some browsers in Video.js player.
* Clicking "Insert into post" immediately after upload without changing any options now inserts shortcode instead of just the title of the video.
* Inserting shortcode without a thumbnail no longer attempts to save the nonexistent thumbnail. Thumbnail cleanup is handled better.
* Fixed error message "array_key_exists() expects parameter 2 to be array" when shortcode didn't have attributes. 
* Escaped all shell commands for increased security.
* Fixed bug that made "Encode" button disappear if all formats were checked.
* Fixed missing argument for kgvid_clear_completed_queue() when scheduling cleanup.

= 4.0 - April 22, 2013 =
* Accidental release caused by programmer's incompetence.

= 3.1.1 - March 5, 2013 =
* Fixed missing ) in uninstall.php

= 3.1 - January 30, 2013 =
* Added video watermark overlay option. (Video.js only)
* Changed front-end CSS file name to kgvid_styles.css and made it always available, not just when galleries are on the page.
* Removed my watermark testing logo which was accidentally inserted above videos in version 3.0.3.
* Added option to choose -b:v or legacy -b flags when encoding. Recent FFMPEG versions only accept -b:v.
* Added automatic encode queue cleanup. Any completed entry older than a week will be removed.
* Added deactivation hook to remove queue and scheduled queue cleanup on deactivation.
* Added uninstall.php to remove settings from the database on uninstall.
* Disabled "Delete Permanently" link while encoding is canceling.
* Checked for escapeshellcmd. If it's disabled on the server, encoding can't start.
* Fixed insert title and download link checkboxes. They will actually insert something now.
* Changed method for determining if a video has been played or paused and played again, for counting purposes.
* Fixed check for mime type when generating H.264 video encode checkboxes to avoid showing options for QuickTime files that are higher resolution than the original video.

= 3.0.3 - January 29, 2013 =
* Fixed bug that added a blank line to JavaScript embedded in the page if "volume" wasn't set in the short code (Video.js only).
* If video player is set larger than the containing DIV and the player size is reduced to fit, the height is now rounded to the nearest integer.

= 3.0.2 - January 24, 2013 =
* Fixed bug that permanently disabled buttons on the Embed Video from URL tab.
* Disabled "Delete Permanently" option for encoded files found on other servers.
* Reduced the jQuery UI Dialog css and put it in its own scope to avoid conflicts with existing jQuery UI Dialog themes. 
* Cleaned out some leftover code.

= 3.0.1 - January 24, 2013 =
* Fixed bug that inserted empty options into gallery shortcodes.

= 3.0 - January 23, 2013 =
* Updated to provide compatibility with several media changes in WordPress 3.5. With this version, thumbnail generating & video encoding will only work in WordPress 3.5 and above.
* Added popup video gallery.
* Changed shortcode tag to [KGVID]. Retained [FMP] for backwards compatibility.
* Added Video.js player option. Older Strobe Media Playback Flash player is still included for backwards compatibility, but Video.js is highly recommended.
* Added video play counting which is recorded to the WordPress database (Video.js only).
* Added Google Analytics event tracking for video plays (Video.js only)
* Added ability to encode multiple H.264 video resolutions.
* Added video encoding queue.
* Added qt-faststart and MP4Box processing to MP4/M4V H.264 videos encoded by the plugin to allow playback of videos as they download.
* Added option to change default number of thumbnails generated by the plugin.
* Changed any https FFMPEG input to http.
* Thumbnail images are now added to the WordPress database as soon as they are selected.
* Added option to use LIBAV instead of FFMPEG for thumbnail generating and video encoding.
* Added wmode parameter to fix Chrome z-index issue. (Strobe Media Playback only)
* Improved swfobject.js script enqueuing method to prevent conflicts (Strobe Media Playback only)
* Rewrote plugin settings to work with the WordPress plugin settings API.
* Removed dropdown list for embedding alternate encoded formats of video. All formats are made available to the player and the browser chooses best compatible format.
* Removed mdetect.php and removed forced downgrading of quality when on mobile devices. Mobile browsers now automatically choose best compatible format.

= 2.0.6 - April 27, 2012 =
* Removed swfobject.js from the plugin package. Now using the one included with WordPress. WordPress 3.3.2 contains a security fix for swfobject.js and the plugin will use the fixed version if you have upgraded WordPress (which is highly recommended).
* Added setting to customize the formatting of titles inserted by the plugin.
* Added settings to display a custom image when videos end instead of the first frame of the video (Flash only).
* Fixed problem with embedded FLV files giving message "Argument Error Ð Invalid parameter passed to method" when loading poster images.

= 2.0.5 - April 20, 2012 =
* Fixed "Wrong datatype for second argument" error on line 339 and subsequent automatic replacement of original videos with Mobile/H.264 versions whether they exist or not.

= 2.0.4 - April 19, 2012 =
* Once again changed the process checking for FFMPEG installations. Should be universal now.
* Added setting to turn on vpre flags for users with installed versions of FFMPEG old enough that libx264 requires vpre flags to operate.
* Added setting to replace the video attachment template with a page containing only the code necessary to display the video. Makes embedding your hosted videos on other sites easier.
* Fixed progress bar for older versions of FFMPEG.
* Added Flash fallback when OGV or WEBM videos are embedded.
* Removed restriction on number of thumbnails that can be generated at once and added a cancel button while generating thumbnails.

= 2.0.3 - February 24, 2012 =
* When working with file formats that can't be embedded (WMV, AVI, etc) the option to embed the original file will be disabled if Mobile/H.264, WEBM, or OGV files are found.
* Changed encoding bitrate flag back to -b instead of -b:v to retain compatibility with older versions of FFMPEG.
* Cosmetic changes in encoding progress bar.
* No longer deleting encoded files if progress can't be properly established.
* Added "nice" to the encode commond (not on Windows) to prevent FFMPEG from overusing system resources.
* Updated plugin settings panel generation function to require "Administrator" role instead of deprecated capability number system.

= 2.0.2 - February 21, 2012 =
* Fixed check for FFMPEG again, to work with Windows.

= 2.0.1 - February 21, 2012 =
* Fixed check for FFMPEG again. Should be more universal.

= 2.0 - February 20, 2012 =
* Large rewrite to fix several security issues. Full server paths are no longer exposed in the Media Upload form, all AJAX calls are handled through wp_ajax, and nonces are checked.
* Added video encoding progress bar on Linux servers.
* Added button to cancel encoding.
* Added option to encode 720p or 1080p H.264 videos.
* Changed requirements for AAC encoding. Will work with libfaac or libvo-aacenc.
* Improved error reporting to help diagnose problems.
* Videos recorded on phones in portrait mode (tall and skinny) will not end up sideways if FFMPEG version .10 or later is installed.
* Thumbnail generation process uses fancy jQuery animation.
* Fixed check for FFMPEG. Should actually work in Windows now.
* Fixed unenclosed generate, embed, submit, delete strings in kg_call_ffmpeg

= 1.1 - January 8, 2012 =
* Includes Strobe Media Playback files so Flash Player is now hosted locally, which allows skinning.
* Added skin with new, more modern looking play button. Upgraders should check the plugin settings for more details.
* Fixed "Insert into Post" button in "Embed from URL" tab when editor is in HTML view mode. Used to do nothing! Now does something.
* Added option to override default Mobile/HTML5 encode formats for each video
* Added check for FFMPEG. Generate & Encode buttons are disabled if FFMPEG isn't found.

= 1.0.5 - November 6, 2011 =
* Fixed "Embed from URL" thumbnail creation. Generated thumbnails don't disappear anymore.

= 1.0.4 - November 4, 2011 =
* More thorough check made for existing attachments before registering poster images with the Wordpress Media Library. Avoids registering duplicates or medium/small/thumb image sizes if they're used as poster image.
* Added loop, autoplay, and controls options to HTML5 video elements.
* When saving attachments, won't try to delete thumb_tmp directory if it doesn't exist.

= 1.0.3 - October 27, 2011 =
* Revised thumbnail cleanup to make sure temp files aren't deleted when generating thumbnails for more than one video at a time.

= 1.0.2 - October 21, 2011 =
* Fixed a shocking number of unenclosed stings in get_options() calls. Bad programming. Didn't affect functionality, but will stop generating errors. 
* Removed clumsy check for FFMPEG running. Was preventing encoding if ANY user on the server was running FFMPEG. Be wary of overusing your system resources though.

= 1.0.1 - October 21, 2011 =
* Quick fix to add mdetect.php to the plugin package from Wordpress

= 1.0 - October 20, 2011 =
* Huge re-write. 
* Integrated with Wordpress Media Library and added WEBM support.
* Increased control over thumbnail generation.
* Added tab to Insert Video dialog box for adding by URL (like the old version).

= 0.2.1 - October 9, 2011 =
* Check made to ensure iPhone/iPod/Android compatible encode video height is an even number when HTML5 video encodes are made. 

= 0.2 - January 18, 2011 =
* First Release

== Upgrade Notice ==

= 3.0 =
Fixes thumbnails & encodes in WP 3.5. Not compatible with earlier WP versions.

= 2.0 =
Fixes several security issues.