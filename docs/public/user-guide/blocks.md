# Gutenberg Block Editor Integration

Videopack 5.0 introduces native WordPress Block Editor (Gutenberg) integration, featuring dynamic block components:

1. **Videopack Player Container / Player Block** (`videopack/player-container`, `videopack/player`)
2. **Videopack Collection Block** (`videopack/collection`)

---

## 🎬 1. Videopack Player Block

The **Videopack Player** block renders responsive HTML5 / Video.js video players directly inside your post content.

### Adding a Player Block
1. Open the Block Editor and click the `+` inserter icon.
2. Search for **Videopack Player** and select it.
3. Choose a video from your Media Library, upload a new file, or enter an external video URL.

### Block Markup Example
Gutenberg block markup uses standard HTML comments containing JSON attributes:

```html
<!-- wp:videopack/player-container {"id":123} -->
<div class="wp-block-videopack-player-container">
  <!-- wp:videopack/player {"id":123,"autoplay":false,"auto_res":true} /-->
</div>
<!-- /wp:videopack/player-container -->
```

### Live Video Player Demo
Below is a live example of the Videopack Player block:

<!-- wp:videopack/player-container {"id":123} -->
<div class="wp-block-videopack-player-container">
  <!-- wp:videopack/player {"id":123,"autoplay":false,"auto_res":true} /-->
</div>
<!-- /wp:videopack/player-container -->

---

## 🖼️ 2. Videopack Collection (Gallery) Block

The **Videopack Collection** block displays collections of videos in a responsive grid or list layout with lightbox video popups.

### Block Markup Example

```html
<!-- wp:videopack/collection {"gallery_source":"current","gallery_columns":3,"gallery_pagination":true} -->
<div class="wp-block-videopack-collection">
  <!-- wp:videopack/loop /-->
</div>
<!-- /wp:videopack/collection -->
```

### Live Gallery Demo
Below is a live example of the Videopack Collection block:

<!-- wp:videopack/collection {"gallery_source":"current","gallery_columns":3,"gallery_pagination":true} -->
<div class="wp-block-videopack-collection">
  <!-- wp:videopack/loop /-->
</div>
<!-- /wp:videopack/collection -->
