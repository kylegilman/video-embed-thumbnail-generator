=== Video Embed & Thumbnail Generator ===
Contributors: kylegilman
Donate link: https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=kylegilman@gmail.com&item_name=Video%20Embed%20And%20Thumbnail%20Generator%20Plugin%20Donation
Tags: video, video player, video gallery, video thumbnail, ffmpeg, resolution
Requires at least: 4.4
Tested up to: 5.1
Stable tag: 4.6.24
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Makes video thumbnails, allows resolution switching, and embeds responsive self-hosted videos and galleries.

== Description ==

= A plugin to make embedding videos, generating thumbnails, and encoding files easier. =

Not compatible with the new Block Editor. Please continue to use the <a href="https://wordpress.org/plugins/classic-editor/">Classic Editor</a>.

Still 100% free, but some advanced features may be converted to premium add-ons in the future. More info in the <a href="https://wordpress.org/support/topic/version-50-will-convert-some-free-features-to-paid-add-ons">support forum</a>.

This plugin adds several fields to any video uploaded to the WordPress Media Library. Just choose a few options, make thumbnails, click "Insert into Post" and you'll get a shortcode in the post editor that will embed a flexible, responsive HTML5 video player with Flash fallback for unsupported browsers.

You have the option to use a few different video players:

* Video.js (files are included with the plugin)
* The WordPress default player using MediaElement.js, which was introduced in WordPress version 3.6
* JW Player 6 (if their old, discontinued plugin is already installed. This plugin does not work with JW Player 7 yet.)
* Adobe's Strobe Media Playback Flash player (deprecated)

No matter which player you use, the video will responsively resize to fit the container it's in. If you provide multiple H.264 resolutions, the plugin can automatically select the one closest to the size of the player or a resolution of your choice, and provide a button for users to select the resolution manually. If you have Google Analytics set up on your site, the plugin will automatically send Google Analytics Events when users start, reach 25%, 50%, 75%, and complete watching your videos.

You can also use the plugin to create a popup video gallery. The shortcode uses options similar to the WordPress image gallery shortcode. In its simplest form use the code `[KGVID gallery="true"]` to create a gallery of all videos attached to the post. Thumbnail size and video popup size can be set on the plugin settings page or in the shortcode. To make a custom gallery that includes videos that aren't attached to the current post you'll need to determine the video's ID, which is shown under the Video Stats section when viewing the attachment. Switch the "insert" option from "Single Video" to "Video Gallery" and you'll get a number of additional options (all of which are optional). Add a comma-separated list of video IDs in the "Include" field to create a gallery manually. Note: the "Create Gallery" section of the Add Media window is a built-in WordPress function and is only for making image galleries.

If your video can be <a href="http://en.wikipedia.org/wiki/HTML5_video#Browser_support">played natively in your browser</a>, or if you have FFMPEG or LIBAV installed on your server, you can generate thumbnails from your video. Using either the "Generate" or "Randomize" buttons will create an array to choose from. The "Generate" button will always generate thumbnails from the same frames of your video, evenly spaced. If you don't like them, you can randomize the results with the "Randomize" button. If you want to see the first frame of the video, check the "Force 1st Frame Thumbnail" button. You can generate as many or as few as you need (up to 99 at a time). After creating an array of thumbnails you can save them all using the "Save all thumbnails" button.

If you know which frame you want to use for your thumbnail, click "Choose from video..." to select it from the video. This will only work for <a href="http://en.wikipedia.org/wiki/HTML5_video#Browser_support">videos that can be played natively in your browser</a>. If you want really fine control you can enter timecode in the "Thumbnail timecode" field. Use `mm:ss` format. Use decimals to approximate frames. For example, `23.5` will generate a thumbnail halfway between the 23rd and 24th seconds in the video. `02:23.25` would be one quarter of the way between the 143rd and 144th seconds.

After you select a thumbnail it will be registered in the Wordpress Media Library and added to the video's attachments. Unused thumbnails will be deleted.

In the plugin settings you can set the default maximum video width and height based on the dimensions of your particular template and those values will be filled in when you open the window. If you generate thumbnails, the video display dimensions will be adjusted automatically to match the size and aspect ratio of the video file. You can make further adjustments if you want. There are options to always fill the width of the template or to always set videos to the maximum width setting regardless of their resolution.

If enabled in the plugin settings, Facebook, Twitter, and Schema.org video search engine metadata will be generated for your videos. If your site supports https, your videos can play directly in the Facebook timeline or on Twitter. Twitter requires whitelisting for each domain that provides player cards so you will be required to request whitelisting using the <a href="https://cards-dev.twitter.com/validator">Twitter Card Validator tool</a>. Once you've installed the plugin and enabled the Twitter Cards setting, go to the Twitter Card Validator, enter a secure URL from your site that has a video embedded using this plugin, click "Preview card" and you'll probably see a warning that your site isn't whitelisted. Request whitelisting and Twitter should approve you fairly quickly. Enabling the Facebook or Twitter metadata options will override Jetpack's corresponding metadata whenever a video is embedded on the page. However, your theme or SEO plugins might generate their own metadata that could conflict with this plugin's.

You can add subtitle and caption tracks by choosing properly formatted WebVTT files from the media library or entering a URL directly. Enter the two-letter language code and the label text that will be shown to users. Enabling the "default" option will turn the text track on when the page loads. The WordPress default player does not differentiate between captions and subtitles, but Video.js will show a different icon depending on the selection.

I highly recommend using <a href="http://handbrake.fr/">Handbrake</a> to make a file with H.264 video and AAC audio in an MP4 container before uploading. If you're encoding with Handbrake make sure that "Web Optimized" is checked. Using Apple's Compressor, the "Streaming" setting should be "Fast Start" (not Fast Start - Compressed Header).

The plugin can use FFMPEG or LIBAV to encode videos and make thumbnails if you have one of them installed on your server. You can choose to generate thumbnails and additional video formats automatically whenever a new video is uploaded to the media library, and there are buttons to generate thumbnails and additional video formats for every video already in the media library. If you want most videos to be re-encoded and replaced with a particular format but sometimes want to keep the original video, you can add the suffix '-noreplace' (awesomevid-noreplace.mp4) to your filename and the uploaded video will not be replaced. Other automatic formats will still encode.

By default the plugin looks for FFMPEG in `/usr/local/bin` but if the application is installed in a different place on your server, you can point it to the correct place in the plugin settings. Users running WordPress on Windows servers should try using Linux-style paths (with forward slashes instead of backslashes and a forward slash `/` instead of `C:\`). Multisite Super Admins must set the FFMPEG path in the Network settings page which will enable FFMPEG throughout the network.

If you have the proper libraries installed on your server, you can choose to replace your uploaded video with your preferred format, and generate as many as seven additional formats depending on your original source. 1080p, 720p, and 360p H.264, same resolution WEBM (VP9 or VP8) and OGV, and a custom format. Different browsers have different playback capabilities. Most desktop browsers can play H.264, and all modern mobile devices can play at least 360p H.264. If you create multiple H.264 resolutions, the highest resolution supported by the device will be served up automatically. The plugin will not upconvert your video, so if you upload a 720p video, it will not waste your time creating a 1080p version. There was a time when it seemed like a good idea to provide OGV or WEBM for some desktop browsers, but Firefox supports native H.264 playback in most operating systems now. I no longer recommend encoding OGV or WEBM unless you're making an open source principled stand against H.264. However, your needs may vary. VP9 WEBM is a next-generation codec not supported by many browsers, but it can make videos much smaller while still retaining quality.

The files will encode in the background and will take some time to complete, depending on your server setup and the length and size of your video. VP9 encoding will take much longer than any other format. The plugin adds a Video Encode Queue menu to the Tools menu. You will see encoding progress, the option to cancel an encoding job, and you should get an error message if something goes wrong. Users on Windows servers may get inconsistent results with the encoding queue.

Encoded H.264 files can be fixed for streaming using "movflags faststart" introduced in recent versions of FFMPEG/LIBAV, or qt-faststart or MP4Box if you have one of them installed on your server and select it in the plugin settings. Without one of these options enabled, FFMPEG/LIBAV will place moov atoms at the end of H.264 encoded files, which in some cases forces the entire file to download before playback can start.

If you want to make OGV, WEBM, or H.264 files available and can't use the FFMPEG encode button, you can upload your own files to the same directory as the original and the plugin will automatically find them. For example, if your main file is awesomevid.mp4, the plugin will look for awesomevid-1080.mp4, awesomevid-720.mp4, awesomevid-360.mp4, awesomevid.webm, awesomevid-vp9.webm, awesomevid.ogv, and awesomevid-custom.mp4 as well. If your videos don't conform to that naming structure, you can manually assign them from the media library. No matter what format your original video is, you can use it in the shortcode and the plugin will attempt to find all compatible formats related to it. For example, you might have an AVI called awesomevid.avi which is not compatible with any browser, but if you have other formats encoded already, `[KGVID]http://yoursite.com/awesomevid.avi[/KGVID]` will ignore the incompatible AVI file, but find those other formats and embed them.

If you want to make it easier for users to save your videos to their computers, you can choose to include a link by checking the "Generate Download Link Below Video" button.

Sometimes for various reasons you might need to embed video files that are not saved in the Wordpress Media Library. Maybe your file is too large to upload through the media upload form (if it is, I suggest the excellent "<a href='https://wordpress.org/plugins/add-from-server/'>Add From Server</a>" plugin), or maybe it's hosted on another server. Either way, you can use the tab "Embed Video From URL" in the Add Media window. Just enter the Video URL manually, and all other steps are the same as the Media Library options. The plugin will look for alternate encoded files in the same directory as the original, but this takes a long time when the video is on another server so it will only check for them once.

To embed videos on other sites you can use code like this.

`<iframe src='http://www.kylegilman.net/?attachment_id=2897&kgvid_video_embed[enable]=true' frameborder='0' scrolling='no' width='640' height='360'></iframe>`

If you enable oEmbed provider data in the plugin settings, the URL of a post with a video shortcode in it or the URL of the video's attachment page will be converted to an embedded video on sites that allow oEmbed discovery. For example, http://www.kylegilman.net/2011/01/18/video-embed-thumbnail-generator-wordpress-plugin/ is the URL for this plugin on my website, but it has the oEmbed header for the video embedded in it so the URL will be converted to an embedded video on sites with oEmbed discovery enabled. WordPress limits oEmbed providers to an internal whitelist for security reasons. This plugin has an option to enable oEmbed discovery for users with the unfiltered_html capability.

= Once you've filled in all your options, click "Insert into Post" and you'll get a shortcode in the visual editor like this =

`[KGVID]http://www.kylegilman.net/wp-content/uploads/2006/09/Reel-2012-05-15-720.mp4[/KGVID]`

<em>The JW Player 6 plugin has been removed from the WordPress plugin repository and JW Player 7 uses a very different system for embedding videos. JW Player 7 support is not available in this plugin yet. The Strobe Media Playback option hasn't been updated since 2011 and is not recommended, but I'm keeping it around for longtime users of this plugin who don't want to change. Most features of the plugin will work when using Strobe Media Playback, but new features will not be tested with it. Selecting Strobe Media Playback will default to a Flash video player if you're using a Flash-compatible file (flv, f4v, mp4, mov, or m4v). Otherwise it will use the Video.js player as a fallback.</em>

= Translations included: =

* Español por Andrew Kurtis de <a href="http://www.webhostinghub.com/">WebHostingHub</a>.
* Français par F.R. 'Friss' Ferry, friss.designs@gmail.com
* Българска от Емил Георгиев, svinqvmraka@gmail.com

I'm not really a software developer. I'm just a film editor with some time on his hands who wanted to post video for clients and wasn't happy with the current state of any available software. But I want to really make this thing work, so please help me out by posting your feedback on <a href="https://github.com/kylegilman/video-embed-thumbnail-generator/issues?state=open">Github</a>.

= If you want to further modify the way the video player works, you can add the following options inside the `[KGVID]` tag. These will override anything you've set in the plugin settings or attachment details. If the plugin is installed on your site, this documentation is also available in the post edit help screen. =

* `id="xxx"` video attachment ID (instead of using a URL).
* `videos="x"` number of attached videos to display if no URL or ID is given.
* `orderby="menu_order/title/post_date/rand/ID"` criteria for sorting attached videos if no URL or ID is given.
* `order="ASC/DESC"` sort order.
* `poster="http://www.example.com/image.jpg"` sets the thumbnail.
* `endofvideooverlay="http://www.example.com/end_image.jpg` sets the image shown when the video ends.
* `width="xxx"` preferred maximum width in pixels.
* `height="xxx"` preferred maximum height in pixels.
* `fullwidth="true/false"` set video to always expand to 100% of its container.
* `align="left/right/center"`
* `inline="true/false"` allow other content on the same line as the video
* `volume="0.x"` pre-sets the volume for unusually loud videos. Value between 0 and 1.
* `mute="true/false"` sets the mute button on or off.
* `controlbar="docked/floating/none"` sets the controlbar position. Video.js only responds to the "none" option.
* `loop="true/false"`
* `autoplay="true/false"`
* `pauseothervideos="true/false"` video will pause other videos on the page when it starts playing.
* `preload="metadata/auto/none"` indicate how much of the video should be loaded when the page loads.
* `start="mm:ss"` video will start playing at this timecode.
* `watermark="http://www.example.com/image.png"` or `"false"` to disable.
* `watermark_link_to=home/parent/attachment/download/false"`
* `watermark_url="http://www.example.com/"` or `"false"` to disable. If this is set, it will override the `watermark_link_to` setting.
* `title="Video Title"` or `"false"` to disable.
* `embedcode="html code"` changes text displayed in the embed code overlay in order to provide a custom method for embedding a video or `"false"` to disable.
* `view_count="true/false"` turns the view count on or off.
* `caption="Caption"` text that is displayed below the video (not subtitles or closed captioning)
* `description="Description"` Used for metadata only.
* `downloadlink="true/false"` generates a link below the video to make it easier for users to save the video file to their computers.
* `right_click="true/false"` allow or disable right-clicking on the video player.
* `resize="true/false"` allow or disable responsive resizing.
* `auto_res="automatic/highest/lowest"` specify the video resolution when the page loads.
* `pixel_ratio="true/false"` account for high-density (retina) displays when choosing automatic video resolution.
* `schema="true/false"` allow or disable Schema.org search engine metadata.

= These options will add a subtitle/caption track =

* `track_src="http://www.example.com/subtitles.vtt_.txt"` URL of the WebVTT file.
* `track_kind=subtitles/captions/chapters`
* `track_srclang=xx` the track's two-character language code (en, fr, es, etc)
* `track_label="Track Label"` text that will be shown to the user when selecting the track.
* `track_default="true/false"` track is enabled by default.

= These options will only affect Video.js playback =

* `skin="example-css-class"` Completely change the look of the video player. <a href="http://designer.videojs.com/">Video.js provides a custom skin designer here.</a>
* `nativecontrolsfortouch="true/false` disable Video.js styling and show the built-in video controls on mobile devices. This will disable the resolution selection button.

= These options will only affect Flash playback in Strobe Media Playback video elements. They will have no effect on other players. =

* `autohide="true/false"` specify whether to autohide the control bar after a few seconds.
* `playbutton="true/false"` turns the big play button overlay in the middle of the video on or off.
* `streamtype="live/recorded/DVR"` I honestly don't know what this is for.
* `scalemode="letterbox/none/stretch/zoom"` If the video display size isn't the same as the video file, this determines how the video will be scaled.
* `backgroundcolor="#rrggbb"` set the background color to whatever hex code you want.
* `configuration="http://www.example.com/config.xml"` Lets you specify all these flashvars in an XML file.
* `skin="http://www.example.com/skin.xml"` Completely change the look of the video player. <a href="http://www.longtailvideo.com/support/jw-player/jw-player-for-flash-v5/14/building-skins">Instructions here.</a>

= These options are available for video galleries (options work the same as standard WordPress image galleries) =

* `gallery="true"` turns on the gallery
* `gallery_thumb="xxx"` width in pixels to display gallery thumbnails
* `gallery_exclude="15,4322"` comma separated video attachment IDs. Excludes the videos from the gallery.
* `gallery_include="65,32,1533"` comma separated video attachment IDs. Includes only these videos in the gallery. Please note that include and exclude cannot be used together.
* `gallery_orderby="menu_order/title/post_date/rand/ID"` criteria for sorting the gallery.
* `gallery_order="ASC/DESC"` sort order.
* `gallery_id="241"` post ID to display a gallery made up of videos associated with a different post.
* `gallery_end="close/next"` either close the pop-up or start playing the next video when the current video finishes playing.
* `gallery_per_page="xx"` or `"false"` to disable pagination. Number of video thumbnails to show on each gallery page.
* `gallery_title="true/false"` display the title overlay on gallery thumbnails.

= These options can be added to the URL to further customize playback =

Using the `kgvid_video_embed` query string any of the following options will modify playback: auto_res, autoplay, default_res, fullwidth, height, mute, nativecontrolsfortouch, pixel_ratio, resize, set_volume, start, width

Example: `https://www.kylegilman.net/portfolio-item/bronx-warrants-pilot/?kgvid_video_embed[start]=29&kgvid_video_embed[autoplay]=true` autoplays the embedded video and starts 29 seconds in.


== Installation ==

1. Upload the unzipped folder `video-embed-thumbnail-generator` to the `/wp-content/plugins/` directory.
1. Activate the plugin through the 'Plugins' menu in WordPress.
1. Make sure you have all your MIME types configured correctly. Many servers don't have .mp4, .m4v, or .ogv configured, and even more don't have .webm. There are a number of ways to do this. In your public_html directory you can edit your .htaccess file and add the following lines:
`AddType video/ogg .ogv
AddType video/mp4 .mp4
AddType video/mp4 .m4v
AddType video/webm .webm`
Optional: `AddType video/mp4 .mov` will help with IE playback of .mov files but could interfere with other QuickTime players.

== Frequently Asked Questions ==

= Why doesn't my video play? =

Most of the time your video doesn't play because it's not encoded in the right format. Videos have containers like mp4, mov, ogv, mkv, flv, etc and within those containers there are video and audio codecs like H.264, MPEG-4, VP8, etc. The best option for this plugin is an mp4 container with H.264 video and AAC audio. It's confusing, but there is a codec usually identified simply as "MPEG-4" of "MPEG-4 Visual" which is not the same thing as H.264 even if it's in an mp4 container. mp4s with MPEG-4 video will not play in most browsers, and if you don't use AAC audio you won't get any audio. I highly recommend using <a href="http://handbrake.fr/">Handbrake</a> to make a file with H.264 video and AAC audio in an MP4 container.

Use <a href="http://mediaarea.net/en/MediaInfo">MediaInfo</a> to get really detailed information about your media files.

If your theme loads FitVids.js, it will break playback in Firefox. If you can figure out how to prevent your theme from loading FitVids.js you will not miss it.

= Why does my video have to download completely before it starts playing? =

mp4/m4v/mov files have something called a moov atom that gives the video player information about the content of the video (dimensions, duration, codecs, etc). Depending on the program you used to make your video, the moov atom can be at the beginning or the end of the file. Most video players will wait until they find the moov atom before starting playback. Otherwise it doesn't know how to display the information it's downloading. If it's at the beginning of the file, playback starts very soon after the user hits the play button. If it's at the end of the file, the whole video has to download before playback starts.

There are a number of ways to fix this problem. Most video encoding programs have an option like "Web optimized," "Streaming," "Fast start," or "Progressive download." Try to find and enable that option in your program. If you can't do that, there are programs designed to move the moov atom to the head of the file. Try <a href="http://renaun.com/blog/code/qtindexswapper/">QTIndexSwapper</a> for Adobe Air (cross platform), <a href="http://www.datagoround.com/lab/">MP4 Faststart</a> for Windows, or <a href="http://mac.softpedia.com/get/Video/QTFastStart.shtml">QTFastStart</a> for Mac.

FFMPEG puts the moov atom at the end of the file, so this can be a problem. The plugin will fix this problem on newly encoded H.264 videos if you have a recent version of FFMPEG and enable the "movflags faststart" option in the plugin settings or if you have qt-faststart or MP4Box installed on your server.

= Why doesn't this work with YouTube? =

WordPress already has <a href="http://codex.wordpress.org/Embeds">a built-in system for embedding videos from YouTube, Vimeo, Dailymotion, etc</a>. Just put the URL into your post and WordPress will automatically convert it to an embedded video using oEmbed. You don't need this plugin to do that. If you're trying to generate new thumbnails from YouTube videos, I'm not going to risk Google's wrath by providing that functionality. I'm not even sure I could figure out how to do it anyway.

= Why can't I make thumbnails? =

If you're like most users and don't have FFMPEG installed on your server, the plugin relies on your browser's built-in ability to play videos. Google Chrome is best when making thumbnails because it supports the most formats. Wikipedia has <a href="http://en.wikipedia.org/wiki/HTML5_video#Browser_support">a great chart that explains which browsers work with which video formats</a>.

If you were able to make thumbnails using FFMPEG before updating to version 4.2, try disabling in-browser thumbnail creation in the FFMPEG Settings tab of the plugin settings.

= How can I change the watermark's size or position? =

The watermark option is a simple image overlay and is styled using CSS. The default styling is

`.kgvid_watermark img {
  display: block;
  position: absolute;
  bottom: 7%;
  right: 5%;
  z-index: 1;
  margin: 0px;
  max-width: 10%;
  box-shadow: none;
}`

You can override any of those settings in either your theme's custom CSS area or using the Jetpack "Custom CSS" module. If you want to make the watermark bigger, try something like

`.kgvid_watermark img {
  max-width: 20%;
}`

If you want to put it in the upper left instead of the lower right, try something like this:

`.kgvid_watermark img {
  top: 7%;
  left: 5%;
}`

= I'm getting an error message FFMPEG not found at /usr/local/bin/. You can embed existing videos, but video thumbnail generation and Mobile/HTML5 video encoding is not possible without FFMPEG. =

First off, don't panic.

This plugin can use FFMPEG or LIBAV to make thumbnails and create alternate video formats. Unfortunately most servers don't have FFMPEG installed and most shared hosting plans don't allow you to install FFMPEG because of the system resources it requires. You're getting this error message because you don't have FFMPEG installed in the most common directory. If you know you have FFMPEG installed on your server, you'll need to find the actual path to the program and enter it in the plugin settings field `Path to applications on server`

Most of the features of the plugin will work without FFMPEG. You can generate embed shortcodes for your videos and make thumbnails on any host because that part of the plugin is JavaScript running in your browser. But without FFMPEG you won't be able to automatically generate thumbnails or encode alternate formats on the server. If you don't have your own VPS or dedicated server, Dreamhost and Arvixe are two of the few shared hosts I know of that has FFMPEG installed and available for users.

= How can I encode videos in directories protected by .htaccess passwords? =

Enter the username & password in the plugin settings "FFMPEG Settings" tab, or use the "Embed from URL" tab and enter the URL in this format http://username:password@yourdomain.com/uploads/2012/01/awesomevid.mp4 in the Video URL field.

== Screenshots ==

1. Thumbnails in the Add Media modal.
2. Video Options in the Add Media modal.
3. Encoding Queue.
4. Shortcode inserted into the post content by the plugin.

== Changelog ==

= 4.6.25 - April 4, 2019 =
* Fixed bug that broke pop-up galleries when video title had a space in the name.
* Now selectively enqueuing Video.js resolution selector JavaScript file.
* Better activation procedure that doesn't generate errors and disables FFMPEG functions if FFMPEG is not found.
* No longer turning on all video formats by default.
* Code changes to allow for future child formats that aren't videos.

= 4.6.24 - April 1, 2019 =
* Improved method for assigning Google Analytics Event labels.

= 4.6.23 - March 26, 2019 =
* Added option to override WordPress built-in [video] shortcodes.
* Fixed bug that prevented generating in-browser thumbnails more than once without reloading the page.
* Stopped deleting existing thumbnails that are selected from the library.
* Changed filename of manually selected thumbnails to thumb1.jpg

= 4.6.22 - January 30, 2019 =
* Modularized video file formats that can be encoded by the plugin to allow other plugins to modify, delete, or create new formats.
* Added Custom WEBM VP9 format option.
* Renamed WEBM format to WEBM VP8.
* Fixed bug that deleted unfinished video encode queue entries every 24 hours.
* Fixed bug that created duplicate encodes of non-H.264 files in some situations.
* Fixed bug that inconsistently prevented thumbnail generation in the Media Library.
* Fixed bug that disabled embed from URL "insert into post" button if FFMPEG was not set up on server.
* Stopped appending timecode numbers to thumbnail filenames.
* Stopped removing special characters from the end of filenames of generated thumbnails and encoded files.
* Attempting to fix misconfigured locale settings that can sometimes cause video files with diacritics (accent marks, umlauts, etc) to generate "File not found" errors when using FFMPEG.
* Removed old Media Library video thumbnail display functionality that was preventing some Media Libraries from loading.
* Now allowing https FFMPEG input.

= 4.6.21 - October 6, 2018 =
* Updated Video.js to version 5.20.5
* Added option to constrain video gallery thumbnail aspect ratios when mixed aspect ratios are present in the gallery.
* Added option to use FFMPEG to add a watermark to thumbnails.
* Fixed WordPress Default player default subtitles not enabled on page load.
* Fixed manual thumbnail selection in Media Library page and Safari.
* Added gtag Google Analytics support.
* Restored freeze-frame while resolution switching in WordPress Default player and now maintaining video aspect ratio while in fullscreen mode for both players.
* Added cron check to ensure the rest of the queue encodes when user does not see encoding start.

= 4.6.20 - November 14, 2017 =
* Updated WordPress Default player resizing methods and speed and resolution selector plugins for the new player included with WordPress 4.9.
* Added 480p resolution option.
* Added option to hide unwanted encode formats from the attachment pages and encode queue.
* Fixed bug that prevented 360p encoding for videos less than 480p.
* Fixed bug that did not automatically select default encoding formats.

= 4.6.19 - November 2, 2017 =
* Fixed shorthand array declaration to retain compatiblity with versions of PHP older than 5.4.

= 4.6.18 - November 2, 2017 =
* Updated Video.js to version 5.20.2
* No longer double encoding 360p formats for 360p or lower resolution original videos.
* Enabled subtitles for fullscreen iPhone videos when using the Video.js player.
* Now allowing external URLs without filename extensions.
* Fixed FFMPEG thumbnail generation when embedding videos from external URLs.
* Fixed "Warning illegal string offset 'id'" errors.

= 4.6.17 - June 10, 2017 =
* Updated Video.js to version 5.19.2
* Better fix for big play button overlay remaining visible on autoplay Video.js videos.

= 4.6.16 - March 19, 2017 =
* Updated Video.js to version 5.18.4
* Added option for variable playback rates in Video.js and WordPress Default players.
* Fixed bug that didn't save views when quarter counting was enabled (new installations only).
* Fixed bug that allowed big play button to remain on screen when videos autoplayed in Firefox and Edge.
* Fixed query for converting URLs to post IDs when a blank _wp_attached_file is present in the database.

= 4.6.15 - February 27, 2017 =
* Updated Video.js to version 5.16.0
* Changed source filetype checking to account for URLs with query strings, which allows for signed URLs.
* Changed VP9 encoding CRF value to the H.264 setting. Using the WEBM setting led to unnecessarily high bitrates.
* Removed French translation files from distribution to allow updated language packs.

= 4.6.14 - January 24, 2017 =
* Updated Video.js to version 5.15.1
* Added option to restrict video player aspect ratio to the default aspect ratio.
* Added option to disable view tracking in the WordPress database.
* Added option to use FFMPEG's auto rotation feature for vertical videos, available in recent versions of FFMPEG and added a rotated video for testing.
* Added check for Video.js version in case another application loads an older version. The resolution selector feature will not load if Video.js is not 5.x or above.
* Added check for a new parent post if a video thumbnail is auto generated before a corresponding post is created. If a new parent exists, the thumbnail is set as the featured image for the new post. This is usually only necessary when used with frontend uploaders.
* Fixed mixed content warnings in galleries with multiple pages.
* Changed all `button-secondary` styles to `button`.
* Added hook for download logging using the single-click download method. An alpha version of a download logging add-on plugin is <a href="https://github.com/kylegilman/file-download-logger">available on GitHub</a>.

= 4.6.13 - January 5, 2017 =
* Updated Video.js player to version 5.14.1
* Fixed bug that disabled gallery page switching.
* Delayed automatic resolution switching until playback starts and now sorting sources to make the default resolution the first element and prevent unnecessary source switching after the page loads.
* Fixed bug that disabled resolution switching if preload is set to "none"
* Added preload as a shortcode attribute.
* Delayed loading videos in attachment editing page until needed for thumbnail creation.
* Fixed manual thumbnail selection in pop-up Media Library windows.
* Fixed bug that deleted completed same-resolution video files if other video formats were added or removed from the queue before encoding of secondary formats was completed.
* Fixed deprecated class constructor warning in PHP 7.
* Removed unnecessary Video.js player re-initializations.

= 4.6.12 - September 25, 2016 =
* Restored Video.js resolution selection in pop-up video galleries.
* Fixed thumbnail creation bugs in Chrome browser.
* Fixed missing 'starts' error message when video had never been played.

= 4.6.11 - September 17, 2016 =
* Fixed broken video galleries in AJAX-loaded pages when the option to always load plugin-related JavaScripts is enabled.
* Fixed untranslated "views" text after video is played.

= 4.6.10 - September 14, 2016 =
* Updated Video.js to version 5.11.6
* Now forcing Video.js controls to display on mobile devices if the video is not muted. Otherwise autoplay doesn't work and there's no way for the user to start the video.
* Moved native controls z-index in front of watermark overlay and hid Video.js play button on Android when using native controls option.
* Fixed bug that constantly reset checkboxes and prevented removing individual formats from the video encode queue.
* Fixed divide by zero error when video encoding is slower than 1 fps.
* Fixed missing nonce error when clearing video encode queue.

= 4.6.9 - July 25, 2016 =
* Updated Video.js to version 5.10.7
* Fixed bug that sometimes prevented thumbnail generation.
* Fixed bug that prevented selection of encoding error email setting in Network admin page.
* Added visual feedback while saving manually selected thumbnails.

= 4.6.8 - June 22, 2016 =
* Added keyboard control of video thumbnail selector. Spacebar to play/pause, arrow keys to move one frame forward or back, and JKL playback control. Reverse playback only works in Safari.
* Added option to pause other videos on the page when starting a new video (or disable it for WP Default player).
* Added option to always load plugin-related JavaScripts to support AJAX page loading.
* Added functionality to dynamically embed attached videos outside of the loop.
* Added check for changed filename extension if a video has been replaced by a different format but is still embedded using the old filename.
* Fixed bug that disabled styling for WordPress Default video players on the page when embedded after an audio file.
* Fixed bug that didn't record Video.js pop-up video gallery views or JW Player quarter playback stats.
* Fixed bug that prevented automatic clearing of old encode queue entries.
* Fixed bug that doubled non-H.264 video source tags.
* Fixed bug that prevented encoding 1080p and 720p H.264 videos if original video is not H.264 and has the same resolution.
* Improved iframe-embedded vertical video resizing.
* Changed iPhone play button to match Video.js button style.
* Tweaked embed code overlay styles.
* Set WordPress Default bottom margin to 0.

= 4.6.7 - May 26, 2016 =
* Updated Video.js to version 5.10.2
* Fixed bug that set Video.js players to the highest resolution no matter what was set as the default.
* Added a system to change video playback settings via URL query strings.
* Added "start" shortcode attribute to start videos at a particular timecode and an option to set the start time in the embed code overlay.
* Added left/right arrow navigation through video galleries.
* Changed resizing method when responsive video is disabled.
* Delayed autoplay command until metadata is loaded in Video.js player.
* Fixed bug that re-enabled default subtitles in the Video.js player every time play restarted.
* Fixed bug that left room for captions on all gallery videos if the first video had a caption.
* Fixed bug that incorrectly resized pop-up gallery window for vertical videos.

= 4.6.6 - May 21, 2016 =
* Added support for Yoast's custom Universal Google Analytics variable name.
* Modified resizing method for WordPress Default player container again.
* Updated WordPress Default player's fullscreen resolution calculation to match Video.js change made in v4.6.3
* Added filter hook to modify FFMPEG-generated thumbnail options.
* Increased WordPress Default play button z-index.

= 4.6.5 - May 13, 2016 =
* Removed anonymous function to allow the plugin to run on PHP versions lower than 5.3.
* Added 25%, 50%, and 75% video view tracking to the WordPress admin area.
* Fixed width="100%" vertical video aspect ratio bug and now allowing other players to work with this still-not-recommended method.
* Modified resizing method for WordPress default player container.
* Fixed temporary thumbnail display when switching resolutions in a Video.js player that is set to a different aspect ratio from the video file.
* Disabled background page rendering request on autosaves and revisions.
* Adjusted title bar CSS again.

= 4.6.4 - May 5, 2016 =
* Fixed bug that caused an error when feed pages were generated, possibly interrupting autosaves.

= 4.6.3 - May 5, 2016 =
* Updated Video.js to version 5.9.2
* Changed method for calculating automatic resolution when switching to fullscreen so it's the same as a regular resize event instead of always selecting the highest resolution available.
* Fixed bug that disabled JW Player selection in the plugin settings page.
* Fixed bug that always showed text track type selector as "subtitles" in the attachment edit window.
* Fixed bug that cropped the video title overlay when no sharing icons were enabled.

= 4.6.2 - May 2, 2016 =
* Fixed bug that disabled subtitles/captions button in the WordPress Default player.
* Fixed bug that broke Video.js players set to width="100%". This has never worked for the WordPress Default player. Using the plugin setting "Set all videos to expand to 100% of their containers" or the shortcode attribute fullwidth="true" is the recommended method, but players will work again for people using width="100%".
* Changed description of fullwidth setting to make it more clear.

= 4.6.1 - May 1, 2016 =
* Fixed bug that changed the way Video.js players were resized when the specified dimensions did not match the video's actual dimensions.
* Adjusted CSS for video overlay bar and z-index of the Video.js play button.

= 4.6 - April 29, 2016 =
* Still 100% free. More info in the <a href="https://wordpress.org/support/topic/version-50-will-convert-some-free-features-to-paid-add-ons">support forum</a>.
* Updated Video.js to version 5.5.3 which includes a revised skin.
* Added resolution switching for WordPress Default player.
* Added Twitter Player Cards.
* Added animated GIF video conversion.
* Added option to select a specific video resolution when the page first loads.
* Added option to ignore pixel ratios when calculating automatic resolution selection in order to prioritize lower resolutions on mobile devices.
* Added '-noreplace' filename option to prevent automatic video encoding for some videos.
* Added button to clear the whole video encoding queue.
* Added option to send an email when there is a video encoding error.
* Added Google Analytics Event tracking when users watch 25%, 50%, and 75% of a video.
* Added several filter hooks to facilitate customization of the plugin.
* Added Twitter and Facebook share buttons.
* Significantly redesigned video sharing overlay appearance.
* Moved download link to an icon overlay and stopped inserting unnecessary downloadlink attribute in shortcode for videos in the WordPress database.
* Moved resolution switching icon to the left of the fullscreen button.
* Now showing paused video frame while switching resolutions instead of black frame or thumbnail (browser experience may vary).
* Updated oEmbed system to work with new oEmbed features introduced in WordPress 4.4.
* Revised Facebook Open Graph tags so they actually work on Facebook.
* Changed in-browser base64 thumbnail encoding to JPG in order to reduce data transferred when saving. Should reduce 404 errors.
* Improved user role security to prevent unauthorized users from modifying video settings or deleting encoded videos.
* Now using Yoast SEO or All In One SEO Pack post descriptions for description metadata, when available.
* Removed Spanish translation from the distribution in order to favor the new <a href="https://translate.wordpress.org/projects/wp-plugins/video-embed-thumbnail-generator">WordPress language packs</a>.
* Fixed several multisite encoding queue bugs, particularly when videos have identical post IDs on different sites.
* Fixed bug that broke FFMPEG sample encode output and video rotation when a watermark overlay was enabled.
* Fixed bug that incorrectly interpreted FFMPEG output as an error when the last line came from the AAC encoder.
* Fixed bug that didn't initialize the nativecontrolsfortouch plugin setting.
* Fixed bug that didn't set featured images on some videos uploaded using frontend uploaders.
* Fixed bug that hid the wrong headers on the plugin settings tabs in WordPress 4.4+.
* Fixed bug that disabled the text track remove button when editing videos in the media library.
* Fixed bug that redundantly localized the frontend script every time a video was embedded on a page.

<a href="http://www.kylegilman.net/2011/01/18/video-embed-thumbnail-generator-wordpress-plugin/">See the full changelog on my website.</a>

== Upgrade Notice ==

= 4.6.5 =
The plugin is still completely free until version 5.0. Video.js users will notice an updated player design if updating from 4.5.5.

= 4.6 =
The plugin is still completely free until version 5.0. Video.js users will notice an updated player design.
