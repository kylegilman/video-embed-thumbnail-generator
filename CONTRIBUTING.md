Hello and welcome! I'm glad you're using my plugin and I'm really sorry if you're having trouble.

This is a plugin that I developed for my own use in 2010 and since then it has grown larger and more complicated than I ever planned. I'm a film editor by day and I work on this in my spare time. I have made a valiant effort to add as many features as my own programming skills can provide. However, the world of web video is a scary and complicated place. Every browser handles things just a little bit differently. I try to make things work on every desktop browser, even in Internet Explorer, and on iOS and Android devices. Windows Mobile I'm not sure about. It might work but I don't know anyone who's tried it.

### I will not provide support to anyone I suspect of using my plugin to break US copyright laws. I'm concerned about opening myself up to legal action from the copyright holders and as a filmmaker I am personally opposed to any reposting of people's videos. I explained this on my blog in 2008 and my feelings back then have not changed: http://www.kylegilman.net/2008/08/04/why-its-not-ok-to-repost-videos/ ###

This plugin uses FFmpeg for some advanced features. This is an amazing program that is even more complicated and varied than the user experience of HTML5 video. I try to support as many versions and configurations of FFmpeg as possible on Linux and Windows servers. Most of you are on shared hosting and don't have the option to install FFmpeg. Those of you that have set up FFmpeg are in the minority. Unfortunately I don't have access to your server and I don't know how it's configured and I can not provide installation support.

But I want to help you. So please help me out and follow these rules when creating new issues:

### For front-end problems ###
_Videos won't play, the player looks funny, etc_

1. Post a link to your website so I can see the problem. Please don't be shy. It's really difficult to guess at what your problem is. Most problems can be solved if I can just look at them. If you don't want to post your site publicly, email it to me at kylegilman@gmail.com
1. Tell me very specifically what browsers you're having a problem with. You're not having an "IE problem," you're having an "IE 9 problem." You're not having a "mobile problem." You're having an "iPad 2 running iOS 7 problem."
1. Give me as much information as you can about how your videos were created. What program did you use to compress them and what settings did you use in that program? You would be surprised how many flavors of "H.264" there are.

### For back-end problems ###
_Can't make thumbnails, can't encode videos, etc_

1. If the plugin can't find FFmpeg at the path you entered, connect to your server via SSH and enter this command:
`/usr/local/bin/ffmpeg -i /path/to/wordpress/wp-content/plugins/video-embed-thumbnail-generator/images/sample-video-h264.mp4 -vframes 1 -f mjpeg /path/to/wordpress/wp-content/uploads/2013/10/ffmpeg_exists_test.jpg`
Replace `/usr/local/bin/` with the path to FFmpeg on your server if that's not where it's located and replace `/path/to/wordpress` with whatever the full path is to your WordPress installation. Usually that's something like `/home/username/public_html` but there are endless variations. On Linux servers you can get your current path by entering `pwd` at the command prompt.
Once you run FFmpeg, paste the entire text output into your issue.
1. If the plugin can find FFmpeg but videos aren't encoding, paste the full output of the FFmpeg test output area from the bottom of the FFmpeg Settings tab of the plugin settings page.
