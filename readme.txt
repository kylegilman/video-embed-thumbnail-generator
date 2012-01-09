=== Plugin Name ===
Contributors: kylegilman
Tags: video, html5, shortcode, thumbnail, ffmpeg
Requires at least: 3.0
Tested up to: 3.3.1
Stable tag: 1.1

Generates thumbnails, HTML5-compliant videos, and embed codes for locally hosted videos. Requires FFMPEG for thumbnails and encodes.

== Description ==

= A plugin to make embedding videos, generating thumbnails, and encoding HTML5-compliant files a little bit easier. =

The plugin adds several fields to any video uploaded to the WordPress Media Library. Just choose a few options and click Insert into Post to and you'll get a shortcode in your post that will embed a flexible Flash & HTML5 video player with a preview image into your post.

The embedded player will default to a Flash video player if you're using a Flash-compatible file (flv, f4v, mp4, mov, or m4v). Otherwise it will use an HTML5 video element. I highly recommend H.264 video and AAC audio in an MP4 container. If you're encoding with Apple's Compressor, the "Streaming" setting should be "Fast Start" (NOT Fast Start - Compressed Header). I've written up my recommended video encode settings in <a href="http://www.kylegilman.net/2011/02/25/making-mp4-h-264-videos-in-apple-compressor/">a post on my website</a>.

The plugin uses FFMPEG to generate thumbnails and encode HTML5/mobile videos. By default the plugin looks for FFMPEG in `/usr/local/bin` but if FFMPEG is installed in a different place on your server, you can point it to the correct place in the plugin settings.

If FFMPEG is installed on your server, you can generate thumbnails using either the "Generate" or "Randomize" buttons. The "Generate" button will always generate thumbnails from the same frames of your video, evenly spaced. If you don't like them you can randomize the results with the "Randomize" button. If you want to see the first frame of the video, check the "Force 1st Frame Thumbnail" button. If you want really fine control you can enter timecode in the "Thumbnail Timecode" field. Use mm:ss format. If you want even more control you can use decimals to approximate frames. For example, `23.5` will generate a thumbnail halfway between the 23rd and 24th seconds in the video. `02:23.25` would be one quarter of the way between the 143rd and 144th seconds. You can generate as many or as few as you need (up to 9 at a time). The unused thumbnails will be deleted once you click "Insert into Post" or "Save Changes."

In the plugin settings you can set the default maximum width based on the width of your particular template and those values will be filled in when you open the window. If you generate thumbnails, the video display dimensions will be automatically adjusted to match the size and aspect ratio of the video file. You can make further adjustments if you want.

The "Encode" button is still a bit experimental. If you have FFMPEG on your server, clicking the button will start encoding an iPod/iPad/Android compliant H.264 video (which will also work in Safari and IE 9), or a Firefox/Chrome-compatible WEBM or OGV video in the same directory as your original file. Anyone using a modern browser who doesn't have a Flash plugin will see these files instead of the original. The files will encode in the background and will take several minutes to complete, depending on your server setup and the length and size of your video. Currently, if something goes wrong after the encode starts, the plugin will not tell you. It also won't tell you when the files are done. You just have to wait.

The plugin is currently favoring Flash instead of HTML5 because Flash is a better user experience in most cases. I'm particularly not a fan of some browsers' tendencies to auto-download HTML5 video elements. I may eventually include the option to favor HTML5. However, if you embed a non-Flash compatible file (like an ogv or webm file) then you will only get the HTML5 video element. If you want to make ogv, webm, or H.264 files available and can't use the FFMPEG encode button, you can upload your own files to the same directory as the original and the plugin will automatically find them. For example, if your main file is awesomevid.mp4, the plugin will look for awesomevid.webm and awesomevid.ogv as well. If you want to embed a high-res H.264 video but also make a mobile-compatible version available, add -ipod.m4v to the end of the filename (awesomevid-ipod.m4v) and it will be served up to most smartphones and tablets instead of the original.

Android viewers who don't use Flash will see a play button superimposed on the thumbnail to make it a little clearer that it's an embedded video.

If you want to make it easier for people to save the video to their computers, you can choose to include a link by checking the "Generate Download Link Below Video" button.

Sometimes for various reasons you might need to embed video files that are not saved in the Wordpress Media Library. Maybe your file is too large to upload through the media upload form, or maybe it's hosted on another server. Either way, you can use the tab "Embed from URL" in the Add Media window. Just enter the Video URL manually, and all other steps are the same as the Media Library options. If the video is in a directory that isn't writable, any encodes you make will go to an "html5encodes" subdirectory in the Wordpress uploads directory.

= Once you've filled in all your options, click "Insert into Post" and you'll get a shortcode in the visual editor like this =

`[FMP poster="http://www.kylegilman.net/wp-content/uploads/2011/10/Reel-11-10-10-web_thumb2.jpg" 
width="720" height="404"]http://www.kylegilman.net/wp-content/uploads/2011/10/Reel-11-10-10-web.mp4[/FMP]`

Once you save the post, the thumbnail file will be registered in the Wordpress Media Library and added to the post's attachments. Thumbnails are saved in the current Wordpress uploads directory. HTML5 videos are not yet registered with the media library.

= If you want to further modify the way the Flash video player works, you can add the following options inside the [FMP] tag. These will override anything you’ve set in the plugin settings. =

* `poster="http://www.example.com/image.jpg"` sets the thumbnail
* `width="xxx"`
* `height="xxx"`
* `controlbar="docked/floating/none"` sets the controlbar position. HTML5 videos only respond to the "none" option.
* `loop="true/false"`
* `autoplay="true/false"`

= These options will only affect Flash video elements. They will have no effect on HTML5 videos. =

* `autohide="true/false"` specify whether to autohide the control bar after a few seconds.
* `playbutton="true/false"` turns the big play button overlay in the middle of the video on or off.
* `streamtype="live/recorded/DVR"` I honestly don’t know what this is for.
* `scalemode="letterbox/none/stretch/zoom"` If the video display size isn’t the same as the video file, this determines how the video will be scaled.
* `backgroundcolor="#rrggbb"` set the background color to whatever hex code you want.
* `configuration="http://www.example.com/config.xml"` Lets you specify all these flashvars in an XML file.
* `skin="http://www.example.com/skin.xml"` Completely change the look of the video player. <a href="http://www.longtailvideo.com/support/jw-player/jw-player-for-flash-v5/14/building-skins">Instructions here.</a>

I'm not really a software developer. I'm just a film editor with some time on his hands who wanted to post video for clients and wasn't happy with the current state of any available software. But I want to really make this thing work, so please help me out by posting your feedback in the comments. I'm developing the plugin on a VPS and I haven't tested it on any other FFMPEG-enabled servers yet, so I'm sure there are all kinds of things that only work because of my particular server setup.

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

= Why doesn't this work with YouTube? =

WordPress already has <a href="http://codex.wordpress.org/Embeds">a built-in system for embedding videos from YouTube, Vimeo, Dailymotion, etc</a>. Just put the URL into your post and WordPress will automatically convert it to an embedded video using oEmbed. You don't need this plugin to do that. If you're trying to generate new thumbnails from YouTube videos, I'm not going to risk Google's wrath by providing that functionality. I'm not even sure I could figure out how to do it anyway.

= I'm on shared hosting and can't install software. Does this work without FFMPEG? =

Some of it will work without FFMPEG. You can generate embed codes for your videos on any host because that part of the plugin is JavaScript running in your browser. But without FFMPEG you won't be able to generate thumbnails or generate HTML5 videos. There is no way around this. A program has to read the video files in order to generate the thumbnails, and FFMPEG is the best one I've found to do that.

== Screenshots ==

1. Thumbnail & Embed Options in the Media Library/Insert Video page.
2. "Embed from Url" tab.
3. Shortcode inserted into the post content by the plugin.

== Changelog ==

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
