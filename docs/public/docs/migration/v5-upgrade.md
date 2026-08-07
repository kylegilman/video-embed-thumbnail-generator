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
