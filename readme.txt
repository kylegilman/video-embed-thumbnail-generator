=== Videopack ===
Contributors: kylegilman
Donate link: https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=kylegilman@gmail.com&item_name=Videopack%20Plugin%20Donation
Tags: video, video player, video gallery, video thumbnail, ffmpeg, resolution
Requires at least: 5.0
Tested up to: 6.3
Requires PHP: 7.2.5
Stable tag: 4.9
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Makes video thumbnails, allows resolution switching, and embeds responsive self-hosted videos and galleries.

== Description ==

= A plugin to make video players, thumbnails, multiple resolutions, and video galleries. =

This video plugin adds several options to any video uploaded to the WordPress Media Library. If your video can be played natively in your browser, or if you have FFMPEG installed on your server (optional), you can generate thumbnails from your video. Using either the "Generate" or "Randomize" buttons will create a selection to choose from. Click "Insert into Post" and you'll get a shortcode in the post editor that will make a flexible, responsive video player.

If you provide multiple H.264 resolutions, Videopack can automatically select the one closest to the size of the player or a resolution of your choice, and provide a button for users to select the resolution manually. If FFMPEG is installed on your server Videopack can make the videos automatically.

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

= 4.9 - August XX, 2023 =
* Removed Video.js v5.
* Removed support for versions of FFMPEG older than approximately 10 years.
* Fixed bug that rotated vertical videos incorrectly when encoding video formats.
* Restored video thumbnail watermark previews on the settings page.
* Improved methods for determining the mime type of URLs and animated GIF detection.
* Revised FFMPEG scaling method to use the "scale" video filter instead of -s
* Removed width setting from custom video encoding formats. Width will be calculated automatically to match the aspect ratio of the original video.
* Added new sample video to plugin settings page.
* Updated Video.js to v8.5.2 and v7.21.5
* Updated Symfony/Process to v5.4.26

= 4.8.11 - July 5, 2023 =
* Fixed bug that always forced vertical videos into a 16:9 aspect ratio when using the Video.js player.
* Updated Freemius SDK to v2.5.10

= 4.8.10 - June 1, 2023 =
* Fixed thumbnail generation bugs introduced by WordPress 6.2.
* Updated Video.js to v8.3.0
* Updated Freemius SDK to v2.5.8
* Updated Symfony/Process to v5.4.24

= 4.8.9 - March 30, 2023 =
* Bumped version number because of files missing from the v4.8.8 distribution file.

= 4.8.8 - March 30, 2023 =
* Removed SimpleModal library for pop-up videos and re-wrote to use a custom jQuery pop-up.
* Restored missing "Default number of thumbnails to generate" setting.
* Fixed string divided by string errors.
* Fixed JavaScript error when adding media in block editor.
* Updated Freemius SDK to v2.5.6
* Updated Symfony/Process to v5.4.21

= 4.8.7 - February 17, 2023 =
* Added Video.js v8 player option which <a href="https://videojs.com/blog/videojs-8-and-vhs-3/">removes support for older browsers</a>. v7 is still available and will continue to be updated. v5 is deprecated and will be removed in a future update.
* Updated Video.js resolution selector plugin to work with v8.
* Added an option to hide Videopack-generated thumbnails from the Media Library.
* Added a check for non-square pixels (SAR) when generating thumbnails.
* Fixed bug that could cause an apparently empty video encode queue to crash admin pages.

= 4.8.6 - February 4, 2023 =
* Made improvements to oEmbed responses for better, more universally accepted embedded videos.
* Removed obsolete setting "Enable oEmbeds from unknown providers"
* Fixed bug that always returned the video attached to the most recent post when older posts or pages were embedded.
* Fixed bug that disabled navigation between attachments in the Media Library.
* Updated Video.js resolution switcher to newer API to avoid using deprecated .extend function.

= 4.8.5 - January 28, 2023 =
* Forgot to increase the plugin version number. This will stop endless Videopack updates available.

= 4.8.4 - January 28, 2023 =
* Fixed redirect validation error that caused "the link you followed has expired" errors.
* Updated Video.js to v7.21.1

= 4.8.3 - January 28, 2023 =
* Added try/catch when running FFMPEG for better error reporting and avoiding fatal errors on activation.
* Improved process for automatically setting featured post images when thumbnails are chosen.
* Added mkv as a supported file format. Playback will be inconsistent across browsers and devices.
* Changed single-click download link to use browser's 'download' attribute instead of PHP-based streaming from the server whenever possible.
* Restored settings "Always output stereo audio" and "Allow rewriting of WordPress attachment URLs"
* Made several stability improvements to the video encoding queue processes.
* Added Heartbeat API video encode queue check
* Changed WP-Cron scheduled daily video encode queue cleanup to a single event for easier deactivation.
* More escaping, sanitizing, and validation for security.
* Removed all inline <script> outputs from the plugin for security.
* Converted direct file functions like move() and rmdir() to WordPress Filesystem API.
* Broke up plugin functions into separate files.
* Changed all psuedo buttons to buttons.

= 4.8.2 - January 12, 2023 =
* Fixed bug that disabled the WordPress Default player.
* Fixed bug that made videos on later pages of paginated video galleries 640x360 when using the WordPress Default player.
* Fixed bug that broke resolution switching when using the WordPress Default player.
* Fixed bug that broke single-click download links.
* Fixed bug that caused errors when get_current_screen() was not defined.
* Removed all 'javascript:void(0)' hrefs from video players.
* More escaping and sanitizing for security.

= 4.8.1 - January 11, 2023 =
* Increased WordPress version requirement to 5.0
* More escaping and sanitizing for security.
* Fixed bug that caused a fatal error when checking for FFMPEG if proc_open isn't enabled.
* Added a check to remove partially encoded video files from video player source lists.
* Moved embedded video template into its own file.
* Replaced most references to global variables with associated WordPress functions.

= 4.8 - January 9, 2023 =
* Significant security update. There might be some features that break because I wasn't able to test every possible configuration. Use <a href="https://wordpress.org/plugins/wp-rollback/">WP Rollback</a> to return to version 4.7.5 if you encounter any big problems.
* Increased PHP requirement to 7.2.5
* Sanitized, escaped, and validated many user inputs and echoed variables.
* Now using more secure Symfony/Process library to escape and run FFMPEG commands instead of escapeshellcmd & exec. The PHP command proc_open must be enabled on your server to use FFMPEG functions.
* Stopped using setlocale when escaping filenames with multibyte characters.
* Enabled canceling encoding on Windows servers and added checks to ensure the correct process is being canceled on all platforms. Partially encoded video files are now deleted after encoding is canceled.
* Moved some encode progress updating to client-side to reduce server load, and generally attempted to improve stability of the encode queue.
* Fixed bug that did not update video's featured image if one had already been set.
* Fixed bug that disabled the Video.js big play button after switching resolutions.
* Fixed bug that prevented "Embed Video from URL" tab from working.
* Updated Freemius SDK to v2.5.3
* Fixed bug that caused timeouts when activating plugin on multisite networks.
* Fixed bug that paused encoding queue after updating network settings.
* Re-ordered AAC encoder library preferences to avoid using old, deprecated libraries libvo_aacenc and libfaac.
* Added Composer for package management and rearranged plugin file structure.

= 4.7.5 - October 19, 2022 =
* Changed official URL to https://www.videopack.video to avoid WordPress trademark violation.
* Updated Video.js to v7.20.3
* Adjusted video player script registration order to avoid undefined variables on page load.
* Modified CSS for video player info bar to prevent it from extending beyond the edge of the video.

= 4.7.4 - February 26, 2022 =
* Updated Video.js to v7.17.0
* Updated Freemius SDK to v2.4.3
* Added limited support for HLS and DASH streaming.
* Added Pause, Resume, and Seek Google Analytics event tracking.
* Fixed a bug that reported multiple Play events when videos not in the WordPress database resumed.
* Fixed some autoplay problems with Video.js v7.
* Fixed a bug that caused a PHP 8 warning when the plugin is first installed.

= 4.7.3 - August 16, 2021 =
* Updated Video.js to version 7.14.3
* Fixed bug that localized front-end JavaScript multiple times if multiple videos were embedded on the page.

= 4.7.2 - July 22, 2021 =
* Added video player option "None" which will disable all plugin-related CSS and JS on the front end.

= 4.7.1 - July 19, 2021 =
* Updated Video.js to version 7.13.3
* Fixed bug that removed existing meta_query when loading attachments, which broke Woocommerce image importing and most likely some other queries.
* Updated shortcode inserted via 'Embed Video From URL' tab from 'KGVID' to 'videopack'
* Fixed bug that caused errors when all default encode formats were disabled.
* Fixed bug that broke playback on Twitter Player Cards.
* Changed video encode queue page design to make it clearer when the queue is paused.
* Added fallback logic in case the Freemius SDK files are removed from the distribution. The Freemius SDK is not required to run Videopack unless you would like to use a premium add-on.
* Updated Admin styles to conform to standardized WordPress color palette.

= 4.7 - March 16, 2021 =
* Changed plugin name to Videopack.
* The shortcode is now [videopack] by default but older [KGVID] shortcodes will still work.
* Added Freemius SDK to facilitate selling premium Videopack add-ons.
* Released a <a href="https://www.videopack.video/add-ons/ads/">premium add-on for video ads</a>.
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

<a href="https://www.videopack.video/docs/changelog/">See the full changelog on the Videopack website.</a>

== Upgrade Notice ==

= 4.8 =
Videopack now requires PHP version 7.2.5. This Videopack update is a significant security update. There might be some features that break because I wasn't able to test every possible configuration. Use <a href="https://wordpress.org/plugins/wp-rollback/">WP Rollback</a> to return to version 4.7.5 if you encounter any big problems.

= 4.7 =
"Video Embed & Thumbnail Generator" is now "Videopack" and I've removed old video players StrobeMediaPlayback and JW Player 6 that haven't been supported for several years. Freemius is also integrated on an opt-in basis to allow premium add-ons. More info in the <a href="https://wordpress.org/support/topic/removing-old-players-and-adding-freemius/">support forum</a>.
