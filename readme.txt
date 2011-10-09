=== Plugin Name ===
Contributors: kylegilman
Tags: video, html5, shortcode, thumbnail, ffmpeg
Requires at least: 3.0
Tested up to: 3.2.1
Stable tag: 0.2.1

Generates thumbnails, HTML5-compliant videos, and embed codes for locally hosted videos. Requires FFMPEG for thumbnails and encodes.

== Description ==

A plugin for the WordPress visual editor to make embedding videos, generating thumbnails, and encoding HTML5-compliant files a little bit easier.

The plugin adds a button to the visual editor in WordPress. The icon has a generic man & woman icon with a camera between them. Press the button to open the plugin's dialog box.

For now you’ll have to upload the video separately, then enter the URL into the Video URL box. The embedded player will default to a Flash video player, so it should be a Flash Video compatible file. You should be able to use FLV, but I haven’t tested it, so I strongly recommend H.264 video and AAC audio in an MP4 container. If you’re using Apple’s Compressor, the “Streaming” setting should be “Fast Start” (NOT Fast Start – Compressed Header).

The plugin uses FFMPEG to generate thumbnails and encode HTML5 videos. By default the plugin looks for FFMPEG in /usr/local/bin but if FFMPEG is installed in a different place on your server, you can point it to the correct place in the plugin settings.

If FFMPEG is installed on your server, you can generate thumbnails using either the “Generate” or “Randomize” buttons. The “Generate” button will always generate thumbnails from the same frames of your video. If you don’t like them you can randomize the results with the “Randomize” button. You can generate as many or as few as you need. The unused thumbnails will be deleted once you close the window.

In the plugin settings you can set the default maximum width based on the width of your particular template and those values will be filled in when you open the window. If you generate thumbnails, the video display dimensions will be automatically adjusted to match the size and aspect ratio of the video file. You can make further adjustments if you want.

The “Generate HTML5 Videos” button is still a bit experimental. If you have FFMPEG on your server, clicking the button will start encoding an iPod/iPad/Android compliant H.264 video (which will also work in Safari and current versions of Chrome) and a Firefox-compatible OGV video. Anyone using a modern browser who doesn’t have a Flash plugin will see these files instead of the original. The files will encode in the background and will take several minutes to complete, depending on your server setup, and the length of your video. In this beta version if something goes wrong after the encode starts, the plugin will not tell you.

The plugin is currently favoring Flash instead of HTML5 because Flash works better in my experience. It’s a better user experience in most cases. I’m particularly not a fan of some browsers’ tendencies to auto-download HTML5 video elements. I eventually plan to include the option to favor HTML5.

Android viewers who don’t use Flash will see a play button superimposed on the thumbnail instead of the default still image.

If you want to make it easier for people to save the video to their computers, you can choose to include a link to download by checking the “Include Download Link”

Click “Insert Flash Media Player” and you’ll get a shortcode in the visual editor that looks like this:

`[FMP poster="http://www.kylegilman.net/wp-content/uploads/2011/01/Reel_11-10-10-web1.jpg" width="720" height="404"]http://www.kylegilman.net/videos/Reel 11-10-10-web.mp4[/FMP]`

Once you save the post, the thumbnail file will be registered in the WordPress media library and added to the post’s attachments. Thumbnails and HTML5 videos are saved in the current “uploads” directory. HTML5 videos are not yet registered with the media library.

I’m not really a software developer. I’m just a film editor with some time on his hands who wanted to post video for clients and wasn’t happy with the current state of any available software. But I want to really make this thing work, so please help me out by posting your feedback. I’m developing the plugin on a VPS and I haven’t tested it on any other FFMPEG-enabled servers yet, so I’m sure there are all kinds of things that only work because of my particular server setup.

== Installation ==

1. Upload the unzipped folder `video-embed-thumbnail-generator` to the `/wp-content/plugins/` directory.
1. Activate the plugin through the 'Plugins' menu in WordPress.
1. Follow instructions on the Description page.

== Frequently Asked Questions ==

= I'm on shared hosting and can't install software. Does this work without FFMPEG? =

Some of it will work without FFMPEG. You can generate embed codes for your videos on any host because that part of the plugin is JavaScript running in your browser. Without FFMPEG you won't be able to generate thumbnails or generate HTML5 videos. There is no way around this. A program has to read the video files in order to generate the thumbnails, and FFMPEG is the best one I've found to do that.

= Why do I have to upload the video separately and then copy and paste the URL? =

Because I am not a great programmer, and this was too much for me to figure out. In the future I'm hoping to integrate the plugin with the upload dialog box to streamline the process.

== Screenshots ==

1. The button added to the visual editor.
2. Pressing the button opens a dialog box.
3. An example of a fully-filled dialog box.

== Changelog ==

0.2 First Release