# Upgrading to Videopack 5.0

Videopack 5.0 includes significant updates, modernizations, and parameter standardizations. Read this guide before updating from Videopack 4.x.

---

## Key Breaking Changes

### 1. Shortcode Parameter Prefixing
All shortcode attributes have been standardized to use the `videopack_` prefix (or clean standard names). While legacy `kgvid_` shortcodes (`[kgvid ...]`) and attributes will continue to work via backwards-compatibility aliases, we strongly recommend updating shortcodes to `[videopack ...]`.

| Legacy 4.x Parameter | Videopack 5.0 Parameter | Description |
|---|---|---|
| `[kgvid ...]` | `[videopack ...]` | Primary shortcode tag |
| `kgvid_video_gallery` | `videopack_video_gallery` | Gallery shortcode tag |
| `gallery_thumb_width` | `columns` | Replaced fixed pixel widths with dynamic grid columns |
| `aspect` | Removed | Container aspect ratio is now calculated dynamically |

---

## 2. Developer Action & Filter Hooks Rename

All custom WordPress hooks have transitioned from the legacy `kgvid_` prefix to `videopack_`.

### Example Hook Changes:

```php
// Legacy 4.x Filter
add_filter( 'kgvid_default_options', 'my_custom_options' );

// Videopack 5.0 Filter
add_filter( 'videopack_default_options', 'my_custom_options' );
```

> [!NOTE]
> If you have custom theme code or child plugins hooking into Videopack, update your hook names to use the `videopack_` prefix.

---

## 3. Deprecations & Removals

- **LIBAV / AVCONV Support Removed**: Legacy LIBAV support has been completely removed in favor of standard FFmpeg or client-side web browser processing.
- **Gallery Aspect Ratio Setting**: Removed obsolete manual aspect ratio overrides for galleries; layout heights are now dynamically determined by video dimensions or standard aspect ratios.

---

## 4. Poster/Thumbnail Metadata

Videopack 5.0 stores per-video settings (poster, encoding preferences, playback stats, etc.) in a single, unified `_videopack-meta` field instead of the many separate `_kgflashmediaplayer-*` fields 4.x used. You don't need to run anything: each video's old metadata is automatically read, converted, and cleaned up the next time that video's settings are loaded (in the Media Library, the block editor, or on a page where it plays) -- there's no bulk migration step and no risk of data loss from waiting.

**If you installed Videopack before version 4.0 (approximately April 2013)**: one specific field, the poster/thumbnail image, is worth a one-time check. From the plugin's very first release (1.0, October 2011) through version 3.2, the poster was saved correctly, but no code path set the video attachment's own WordPress Featured Image to match it -- that only started with version 4.0. If a video's poster was set during that window and the video's Edit screen hasn't been opened and saved since, its Featured Image was never set. Every version from 4.0 onward (including the current 4.10.x branch and every one of its releases) has reliably kept the two in sync, so this only applies to videos whose poster genuinely hasn't been touched since sometime before mid-2013.

If a video's poster looks correct in the Media Library but "Batch Generate Missing Thumbnails" keeps re-offering to regenerate it, that's the symptom -- opening that video's Edit screen and saving it again (even without changing anything) resolves it permanently by setting the Featured Image directly.
