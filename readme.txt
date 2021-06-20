=== Videopack (formerly Video Embed & Thumbnail Generator) ===
Contributors: kylegilman
Donate link: https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=kylegilman@gmail.com&item_name=Videopack%20Plugin%20Donation
Tags: video, video player, video gallery, video thumbnail, ffmpeg, resolution
Requires at least: 4.9
Tested up to: 5.7
Requires PHP: 5.6.0
Stable tag: 4.7.1
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Makes video thumbnails, allows resolution switching, and embeds responsive self-hosted videos and galleries.

== Description ==

= A plugin to make video players, thumbnails, multiple resolutions, and video galleries. =

Video Embed & Thumbnail Generator is now Videopack! This is a substantial update that includes new versions of Video.js and numerous fixes from years of neglect.

This video plugin adds several fields to any video uploaded to the WordPress Media Library. If your video can be played natively in your browser, or if you have FFMPEG installed on your server (optional), you can generate thumbnails from your video. Using either the "Generate" or "Randomize" buttons will create an array to choose from. Click "Insert into Post" and you'll get a shortcode in the post editor that will make a flexible, responsive video player.

If you provide multiple H.264 resolutions, the plugin can automatically select the one closest to the size of the player or a resolution of your choice, and provide a button for users to select the resolution manually. If FFMPEG is installed on your server the plugin can make the videos automatically.

You can also use the plugin to create a popup video gallery. The shortcode uses options similar to the <a href="https://codex.wordpress.org/Gallery_Shortcode">WordPress image gallery shortcode</a>. In its simplest form it will create a gallery of all videos attached to the post.

You can now add advertisements to your videos using the <a href="https://www.wordpressvideopack.com/add-ons/videopack-ads/">Videopack Ads</a> premium add-on which you can purchase from the Add-ons tab of the Videopack Settings page or on the <a href="https://www.wordpressvideopack.com/add-ons/videopack-ads/">Videopack website</a>.

Not compatible with the new Block Editor. Please continue to use the <a href="https://wordpress.org/plugins/classic-editor/">Classic Editor</a>.

Visit the <a href="https://www.wordpressvideopack.com/docs/">Videopack Documentation pages</a> for more info.

== Installation ==

1. Upload the unzipped folder `video-embed-thumbnail-generator` to the `/wp-content/plugins/` directory.
1. Activate the plugin through the 'Plugins' menu in WordPress.
1. Make sure you have all your MIME types configured correctly. Some servers don't have .mp4, .m4v, or .ogv configured, and more don't have .webm. There are a number of ways to do this. In your public_html directory you can edit your .htaccess file and add the following lines:
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

= 4.7.1 - June 20, 2021 =
* Updated Video.js to version 7.12.4
* Updated Embed Video From URL inserted shortcode to [videopack]
* Fixed bug that removed existing meta_query when loading attachments and broke Woocommerce image importing. 
* Fixed bug that caused errors when all default encode formats were diabled.
* Changed video encode queue page design to make it clearer when the queue is paused.

= 4.7 - March 16, 2021 =
* Changed plugin name to Videopack.
* The shortcode is now [videopack] by default but older [KGVID] shortcodes will still work.
* Added Freemius SDK to facilitate selling premium Videopack add-ons.
* Released a <a href="https://www.wordpressvideopack.com/add-ons/ads/">premium add-on for video ads</a>.
* Added Video.js v7 player option.
* Deprecated Video.js v5 player.
* Removed JW Player & Strobe Media Playback player options.
* Removed obsolete Video-js.swf Flash player and unused Video.js font files.
* Added GIF Mode setting to make videos behave like GIFs (autoplay, loop, muted, etc).
* Removed dashicons library from the front end and fixed multiple CSS issues.
* Added option to use an experimental cache for a complicated URL-to-ID database query that should speed up plugin execution on sites with large numbers of videos.
* Adding attachment 'id' attribute to shortcodes inserted into posts, and prioritizing the 'id' attribute over URLs when embedding videos to avoid making the URL-to-ID query when possible.
* Added option to automatically publish draft posts when attached videos are finished encoding.
* Renamed 'controlbar' option to 'controls' and 'mute' to 'muted' to match HTML5 terms.
* Improved bulk processing of videos using the "Generate thumbnails" or "Encode videos" buttons from the FFMPEG Settings tab.
* Added pause/resume control to video encode queue.
* Added automatic localization for Video.js player elements.
* Fixed bugs related to saving thumbnails with existing filenames and large thumbnails that are automatically scaled down and renamed by WordPress's large image resizing introduced in WordPress version 5.3.
* Fixed bugs that prevented clearing encode queue in non-multisite environments.
* Fixed bug that added videos to encode queue even if there was nothing to encode.
* Fixed bug that wouldn't show a sample video on the settings page if there were no posts in the WordPress database.

<a href="https://www.wordpressvideopack.com/docs/changelog/">See the full changelog on my website.</a>

== Upgrade Notice ==

= 4.7 =
"Video Embed & Thumbnail Generator" is now "Videopack" and I've removed old video players StrobeMediaPlayback and JW Player 6 that haven't been supported for several years. Freemius is also integrated on an opt-in basis to allow premium add-ons. More info in the <a href="https://wordpress.org/support/topic/removing-old-players-and-adding-freemius/">support forum</a>.