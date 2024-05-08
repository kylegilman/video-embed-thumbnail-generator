=== Videopack ===
Contributors: kylegilman
Donate link: https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=kylegilman@gmail.com&item_name=Videopack%20Plugin%20Donation
Tags: video, video player, video gallery, thumbnail, resolutions
Requires at least: 5.0
Tested up to: 6.5
Requires PHP: 7.2
Stable tag: 4.10.2
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Makes video thumbnails, allows resolution switching, and embeds responsive self-hosted videos and galleries.

== Description ==

= A plugin to make video players, thumbnails, multiple resolutions, and video galleries. =

This video plugin adds several options to any video uploaded to the WordPress Media Library. If your video can be played natively in your browser, or if you have FFMPEG installed on your server (optional), you can generate thumbnails from your video. Using either the "Generate" or "Randomize" buttons will create a selection to choose from. Click "Insert into Post" and you'll get a shortcode in the post editor that will make a flexible, responsive video player.

If you provide multiple H.264 resolutions, Videopack can automatically select the one closest to the size of the player or a resolution of your choice, and provide a button for users to select the resolution manually. If FFMPEG is installed on your server, Videopack can encode the videos automatically.

You can also use Videopack to create a popup video gallery. The shortcode uses options similar to the <a href="https://codex.wordpress.org/Gallery_Shortcode">WordPress image gallery shortcode</a>. In its simplest form it will create a gallery of all videos attached to the post.

You can now add advertisements to your videos using the <a href="https://www.videopack.video/add-ons/videopack-ads/">Videopack Ads</a> premium add-on which you can purchase from the Add-ons tab of the Videopack Settings page or on the <a href="https://www.videopack.video/add-ons/videopack-ads/">Videopack website</a>.

Not compatible with the Block Editor. Please continue to use the <a href="https://wordpress.org/plugins/classic-editor/">Classic Editor</a>.

Visit the <a href="https://www.videopack.video/docs/">Videopack Documentation pages</a> for more info.

== Installation ==

1. Upload the unzipped folder `video-embed-thumbnail-generator` to the `/wp-content/plugins/` directory.
1. Activate the plugin through the 'Plugins' menu in WordPress.

== Frequently Asked Questions ==

= Why doesn't my video play? =

Most of the time your video doesn't play because it's not encoded in the right format. Videos have containers like mp4, mov, ogv, mkv, etc and within those containers there are video and audio codecs like H.264, MPEG-4, VP8, etc. The best option for this plugin is an mp4 container with H.264 video and AAC audio. It's confusing, but there is a codec usually identified simply as "MPEG-4" of "MPEG-4 Visual" which is not the same thing as H.264 even if it's in an mp4 container. mp4s with MPEG-4 video will not play in most browsers, and if you don't use AAC audio you won't get any audio. I highly recommend using <a href="http://handbrake.fr/">Handbrake</a> to make a file with H.264 video and AAC audio in an MP4 container.

Use <a href="http://mediaarea.net/en/MediaInfo">MediaInfo</a> to get really detailed information about your media files.

= Why does my video have to download completely before it starts playing? =

mp4/m4v/mov files have something called a moov atom that gives the video player information about the content of the video (dimensions, duration, codecs, etc). Depending on the program you used to make your video, the moov atom can be at the beginning or the end of the file. Most video players will wait until they find the moov atom before starting playback. Otherwise it doesn't know how to display the information it's downloading. If it's at the beginning of the file, playback starts very soon after the user hits the play button. If it's at the end of the file, the whole video has to download before playback starts.

There are a number of ways to fix this problem. Most video encoding programs have an option like "Web optimized," "Streaming," "Fast start," or "Progressive download." Try to find and enable that option in your program. If you can't do that, there are programs designed to move the moov atom to the head of the file. Try <a href="http://www.datagoround.com/lab/">MP4 Faststart</a> for Windows, or <a href="http://mac.softpedia.com/get/Video/QTFastStart.shtml">QTFastStart</a> for Mac.

FFMPEG puts the moov atom at the end of the file, so this can be a problem. Videopack will fix this problem on newly encoded H.264 videos if you have a recent version of FFMPEG and enable the "movflags faststart" option in the Videopack settings or if you have qt-faststart or MP4Box installed on your server.

= Why doesn't this work with YouTube? =

WordPress already has <a href="http://codex.wordpress.org/Embeds">a built-in system for embedding videos from YouTube, Vimeo, Dailymotion, etc</a>. Just put the URL into your post and WordPress will automatically convert it to an embedded video using oEmbed. You don't need this plugin to do that. If you're trying to generate new thumbnails from YouTube videos, I'm not going to risk Google's wrath by providing that functionality. I'm not even sure I could figure out how to do it anyway.

= Why can't I make thumbnails? =

If you're like most users and don't have FFMPEG installed on your server, Videopack relies on your browser's built-in ability to play videos. Google Chrome is best when making thumbnails because it supports the most formats. Wikipedia has <a href="http://en.wikipedia.org/wiki/HTML5_video#Browser_support">a great chart that explains which browsers work with which video formats</a>.

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

You can get instructions to install FFMPEG for several different Linux distributions at https://www.tecmint.com/install-ffmpeg-in-linux/ You do not need the obsolete <a href="https://ffmpeg-php.sourceforge.net/">FFMPEG-PHP module/extension</a>. It does not work with Videopack.

Videopack can use FFMPEG to make thumbnails and create alternate video formats. Unfortunately most servers don't have FFMPEG installed and most shared hosting plans don't allow you to install FFMPEG because of the system resources it requires. You're getting this error message because you don't have FFMPEG installed in the most common directory. If you know you have FFMPEG installed on your server, you'll need to find the actual path to the program and enter it in the Videopack settings field `Path to applications on server`.

Most of Videopack's features will work without FFMPEG. You can generate embed shortcodes for your videos and make thumbnails on any host because that part of Videopack is JavaScript running in your browser. But without FFMPEG you won't be able to automatically generate thumbnails or encode alternate formats on the server. If you don't have your own VPS or dedicated server, Dreamhost and Arvixe are two of the few shared hosts I know of that has FFMPEG installed and available for users.

= How can I encode videos in directories protected by .htaccess passwords? =

Enter the username & password in the Videopack settings page, "FFMPEG Settings" tab, or use the "Embed from URL" tab and enter the URL in this format http://username:password@yourdomain.com/uploads/2012/01/awesomevid.mp4 in the Video URL field.

== Screenshots ==

1. Thumbnails in the Add Media modal.
2. Video Options in the Add Media modal.
3. Encoding Queue.
4. Shortcode inserted into the post content by the plugin.

== Changelog ==

= 4.10.2 - May 8, 2024 =
* Fixed bug that prevented disabling the "Set all videos to expand to 100% of their containers" setting.
* Better resizing for the settings page sample video.

= 4.10.1 - April 7, 2024 =
* Switched custom database query for looking up attachment IDs via URLs to the WordPress function attachment_url_to_postid() which could result in some video URLs no longer returning attachment IDs when the video player code is generated. That would prevent features like video play recording in the WordPress database, and would only apply to shortcodes that don't include attachment IDs. Please let me know if this happens to you.
* Revised thumbnail generation to work with PNG as a fallback when GD is not configured to support JPG.
* Fixed "replace original" encoding when newly-encoded files are a different format from the original. Original formats are now deleted after the replacement encode format is complete.
* Added extra check that attachment files are deleted when deleting encoded video formats.
* Fixed bug that always enabled the custom format encode setting.
* Fixed typo in FFMPEG rotation test filename.
* Made sample video on the Videopack settings page responsive.
* Added WordPress Playground Blueprint for easy plugin previews.
* Added a VIDEOPACK_FREEMIUS_ENABLED constant to disable loading Freemius.
* Confirmed compatibility with FFMPEG v7.0
* Updated Freemius SDK to v2.7.0

= 4.10 - March 24, 2024 =
* Changed browser-thumbnail upload process to use blobs instead of data URLs and switched to wp_handle_upload instead of custom process for enhanced security.
* Removed Video.js v7
* Restored Freemius SDK after accidentally disabling it in 4.9.6.
* Changed audio codec for VP8/VP9 encoding from libvorbis to libopus.
* Updated FFMPEG status checking to account for log output changes in FFMPEG version 6.1
* Fixed errors when FFMPEG "Encode quality control method" was set to Average Bit Rate.
* Added custom hooks related to thumbnail generation.
* Updated Video.js to v8.10.0 and Symfony/Process to v5.4.36

= 4.9.6 - February 26, 2024 =
* Fixed uninstall routine for more complete cleanup when deleting the plugin.
* Disabled Chromecast overlay button on videos used to make thumbnails.
* Removed comma after final parameter in function call that caused errors in PHP versions earlier than 7.3.

= 4.9.5 - February 7, 2024 =
* Fixed bug that failed to save some Videopack settings when they were disabled.
* Fixed thumbnail rotation bug for vertical videos when using FFMPEG versions earlier than 6.0.
* Fixed bug that set the "FFMPEG Exists" option to an invalid value when upgrading to Videopack v4.8. If no settings that triggered a check for FFMPEG were changed in the year since then, FFMPEG would not execute.
* Improved options validation and FFMPEG test encode process.
* Removed "Insert title above video" option when inserting videos into posts.

= 4.9.4 - January 23, 2024 =
* Fixed bugs that interfered with Media Library functions that don't involve videos, including image gallery editing.
* Improved text track (subtitle/caption) box.

= 4.9.3 - January 22, 2024 =
* Multiple fixes for in-browser thumbnail generation to make the process more stable.
* Restored inline "autoplay" attribute to Video.js video elements.
* Enabled default Video.js keyboard controls.
* Prevented page scrolling while pop-up video gallery is open.
* Replaced WordPress Default player <source> elements with Videopack-generated ones for compatibility with URLs that contain query strings.
* Updated method for determining the location of FFMPEG on the server to allow automatic discovery in the system PATH.
* Updated Video.js to v8.9.0, Freemius SDK to v2.6.2 and Symfony/Process to v5.4.34.

= 4.9.2 - January 13, 2024 =
* Fixed unpausable audio on autoplayed Video.js players (including Video Galleries).
* Fixed WordPress Default player initialization.
* Fixed unnecessary override of some canonical redirect filters.
* Improved saving thumbnails generated by FFMPEG.
* Improved manual selection of thumbnails from the Media Library.
* Improved saving plugin settings.
* Added filters for customizing video source URLs, and removed unnecessary query strings.
* Removed unnecessary browser console debugging messages.

= 4.9.1 - November 10, 2023 =
* Improved in-browser thumbnail generating process.
* Improved animated GIF detection.
* Added option to change default behavior when inserting videos into a post.
* Added check for Videopack embed URLs to maintain embedding functionality after attachment pages were disabled in new WordPress 6.4 installations.
* Updated Video.js to v8.6.1 and Freemius SDK to v2.6.0.

= 4.9 - September 12, 2023 =
* Removed Video.js v5.
* Removed support for FFMPEG versions older than approximately 10 years.
* Added options for skip forward/backward buttons in Video.js v8 players.
* Fixed bug that rotated vertical videos incorrectly when encoding video formats.
* Restored video thumbnail watermark previews on the settings page.
* Improved methods for determining the mime type of URLs and animated GIF detection.
* Revised FFMPEG scaling method to use the "scale" video filter instead of -s
* Removed width setting from custom video encoding formats. Width will be calculated automatically to match the aspect ratio of the original video.
* Added new sample video to plugin settings page.
* Updated Video.js to v8.5.2 and v7.21.5
* Updated Freemius SDK to 2.5.12
* Updated Symfony/Process to v5.4.28

<a href="https://www.videopack.video/docs/changelog/">See the full changelog on the Videopack website.</a>

== Upgrade Notice ==

= 4.8 =
Videopack now requires PHP version 7.2.5. This Videopack update is a significant security update. There might be some features that break because I wasn't able to test every possible configuration. Use <a href="https://wordpress.org/plugins/wp-rollback/">WP Rollback</a> to return to version 4.7.5 if you encounter any big problems.

= 4.7 =
"Video Embed & Thumbnail Generator" is now "Videopack" and I've removed old video players StrobeMediaPlayback and JW Player 6 that haven't been supported for several years. Freemius is also integrated on an opt-in basis to allow premium add-ons. More info in the <a href="https://wordpress.org/support/topic/removing-old-players-and-adding-freemius/">support forum</a>.
