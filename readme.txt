=== Plugin Name ===
Contributors: kylegilman
Tags: video, html5, shortcode, thumbnail, ffmpeg
Requires at least: 3.0
Tested up to: 3.2.1
Stable tag: 1.0

Generates thumbnails, HTML5-compliant videos, and embed codes for locally hosted videos. Requires FFMPEG for thumbnails and encodes.

== Description ==

This is a big re-write. You no longer have to manually choose the video URL. The visual-editor plugin with my icon is gone. Just click "Insert Video" to get things started.

I would appreciate any feedback you have.

A plugin for the Wordpress visual editor to make embedding videos, generating thumbnails, and encoding HTML5-compliant files a little bit easier.

The plugin adds several fields to any video attachment in the Media Library:

The embedded player will default to a Flash video player if you're using a Flash-compatible file (flv, f4v, mp4, mov, or m4v). Otherwise it will use an HTML5 video element. I highly recommend H.264 video and AAC audio in an MP4 container. If you're encoding with Apple's Compressor, the "Streaming" setting should be "Fast Start" (NOT Fast Start - Compressed Header). I've written up my recommended video encode settings in another post.

The plugin uses FFMPEG to generate thumbnails and encode HTML5/mobile videos. By default the plugin looks for FFMPEG in /usr/local/bin but if FFMPEG is installed in a different place on your server, you can point it to the correct place in the plugin settings.

If FFMPEG is installed on your server, you can generate thumbnails using either the "Generate" or "Randomize" buttons. The "Generate" button will always generate thumbnails from the same frames of your video, evenly spaced. If you don't like them you can randomize the results with the "Randomize" button. If you want to see the first frame of the video, check the "Force 1st Frame Thumbnail" button. If you want really fine control you can enter timecode in the "Thumbnail Timecode" field. Use mm:ss format. If you want even more control you can use decimals to approximate frames. For example, 23.5 will generate a thumbnail halfway between the 23rd and 24th seconds in the video. 02:23.25 would be one quarter of the way between the 143rd and 144th seconds. You can generate as many or as few as you need. The unused thumbnails will be deleted once you click "Insert into Post" or "Save Changes."

In the plugin settings you can set the default maximum width based on the width of your particular template and those values will be filled in when you open the window. If you generate thumbnails, the video display dimensions will be automatically adjusted to match the size and aspect ratio of the video file. You can make further adjustments if you want.

The "Encode" button is still a bit experimental. If you have FFMPEG on your server, clicking the button will start encoding an iPod/iPad/Android compliant H.264 video (which will also work in Safari and IE 9) and a Firefox/Chrome-compatible WEBM video in the same directory as your original file. You can choose to also encode OGV or turn off WEBM encoding in the Video Embed & Thumbnail Generator
plugin's settings page. Anyone using a modern browser who doesn't have a Flash plugin will see these files instead of the original. The files will encode in the background and will take several minutes to complete, depending on your server setup and the length and size of your video. Currently, if something goes wrong after the encode starts, the plugin will not tell you. It also won't tell you when the files are done. You just have to wait.

The plugin is currently favoring Flash instead of HTML5 because Flash is a better user experience in most cases. I'm particularly not a fan of some browsers' tendencies to auto-download HTML5 video elements. I may eventually include the option to favor HTML5.

Android viewers who don't use Flash will see a play button superimposed on the thumbnail instead of the default still image.

If you want to make it easier for people to save the video to their computers, you can choose to include a link by checking the "Generate Download Link Below Video" button.

Sometimes for various reasons you might need to embed video files that are not saved in the Wordpress Media Library. Maybe your file is too large to upload through the media upload form, or maybe it's hosted on another server. Either way, you can use the new tab "Embed from URL" which works much like the old version of the plugin.

Just enter the Video URL manually, and all other steps are the same as the Media Library options. If the video is in a directory that isn't writable, any encodes you make will go to an "html5encodes" subdirectory in the Wordpress uploads directory.

Once you've filled in all your options, click "Insert Flash Media Player" and you'll get a shortcode in the visual editor like this

`[FMP poster="http://www.kylegilman.net/wp-content/uploads/2011/10/Reel-11-10-10-web_thumb2.jpg" width="720" height="404"]http://www.kylegilman.net/wp-content/uploads/2011/10/Reel-11-10-10-web.mp4[/FMP]`

Once you save the post, the thumbnail file will be registered in the Wordpress Media Library and added to the post's attachments. Thumbnails are saved in the current Wordpress uploads directory. HTML5 videos are not yet registered with the media library.

I'm not really a software developer. I'm just a film editor with some time on his hands who wanted to post video for clients and wasn't happy with the current state of any available software. But I want to really make this thing work, so please help me out by posting your feedback in the comments. I'm developing the plugin on a VPS and I haven't tested it on any other FFMPEG-enabled servers yet, so I'm sure there are all kinds of things that only work because of my particular server setup.

== Installation ==

1. Upload the unzipped folder `video-embed-thumbnail-generator` to the `/wp-content/plugins/` directory.
1. Activate the plugin through the 'Plugins' menu in WordPress.
1. Follow instructions on the Description page.

== Frequently Asked Questions ==

= I'm on shared hosting and can't install software. Does this work without FFMPEG? =

Some of it will work without FFMPEG. You can generate embed codes for your videos on any host because that part of the plugin is JavaScript running in your browser. Without FFMPEG you won't be able to generate thumbnails or generate HTML5 videos. There is no way around this. A program has to read the video files in order to generate the thumbnails, and FFMPEG is the best one I've found to do that.


== Screenshots ==

1. Thumbnail & Embed Options in the Media Library/Insert Video page.
2. New "Embed by Url" tab.
3. Shortcode inserted into the post content by the plugin.

== Changelog ==
1.0.1 Quick fix to add mdetect.php to the plugin package from Wordpress
1.0 Huge re-write. Integrated with Wordpress Media Library and added WEBM support. Increased control over thumbnail generation. Added tab to Insert Video dialog box for adding by URL (like the old version).
0.2.1 Check made to ensure iPhone/iPod/Android compatible encode video height is an even number when HTML5 video encodes are made. 
0.2 First Release
