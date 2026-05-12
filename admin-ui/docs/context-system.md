# Videopack Context & Data Flow System

This document explains how video metadata and design settings are propagated through the Videopack block tree.

## Architecture Overview

Videopack uses a hybrid context system to ensure that child blocks (like Title, View Count, or Watermark) can access video metadata regardless of their nesting depth or whether they are rendered inside a specialized player engine.

The system consists of four layers:

1. **The PHP Registry (`src/Admin/Ui.php`)**: Dynamically injects global attributes and context mappings into all Videopack blocks.
2. **The React Bridge (`useVideopackContext` hook)**: Resolves design tokens and generates a "shared context" object for manual propagation in the editor.
3. **The PHP Context Manager (`src/Frontend/Context_Manager.php`)**: Mirrors the React resolution logic on the PHP side for frontend rendering.
4. **The Shadow Provider (`Engine/edit.js`)**: Manually relays context through internal overlays in the editor.

---

## Layer 1: The PHP Registry

The `Videopack\Admin\Ui::register_videopack_block_context` method filters the block metadata during registration.

### Universal attributes
Every block starting with `videopack/` automatically receives a set of shared attributes (e.g., `skin`, `title_color`, `pagination_color`).

### Context Mapping
The registry maps attributes to context keys (e.g., `id` -> `videopack/attachmentId`).

> [!IMPORTANT]
> **Strict PHP Registration**: To prevent Gutenberg from "shadowing" valid data with `undefined`, all `videopack/*` context keys have been removed from individual `block.json` files. `src/Admin/Ui.php` is now the **sole authority** for registering `usesContext` and `providesContext`. The registry defensively only claims to provide a context key if the block natively possesses the required attribute.

---

## Layer 2: The `useVideopackContext` Hook

This hook is the primary consumer of data for all Videopack blocks.

### Resolution Priority
When a block requests a value (e.g., `attachmentId`), the hook checks in this order:
1. **Local Attribute**: Does the block have its own `id` set?
2. **Context**: Is there a `videopack/attachmentId` provided by a parent?
3. **Discovery**: Can we find a video attachment linked to the current `postId`?

### Shared Context Bridge
The hook generates a `sharedContext` object containing all resolved values prefixed with `videopack/`. This object is intended to be passed into a `BlockContextProvider` by parent blocks.

---

## Layer 3: The PHP Context Manager

For frontend rendering where React hooks aren't available, `Videopack\Frontend\Context_Manager::resolve` provides identical resolution logic.

### Design Tokens & Tracking IDs
The context manager handles several critical keys:
- **Design Tokens**: `skin`, `hover_effect`, `title_position`, etc.
- **Tracking IDs**: `collectionId` and `instanceId`. These bridge the gap between pre-fetched metadata (in `Blocks::render_collection`) and the specific rendered elements (in `Blocks::render_thumbnail`).

### Metadata Cache Consistency
When rendering collections, Videopack uses a pre-fetch cache to optimize performance. However, block-level attributes can override collection-level defaults.

> [!TIP]
> **Force Refresh Pattern**: In `Blocks::render_thumbnail`, the system checks if local attributes (e.g., `hover_effect`) deviate from the cached metadata. If a mismatch is detected, it triggers a `force_refresh` to re-run the player preparation logic, ensuring that specific block settings (like "Sprite" previews) aren't swallowed by global "Trailer" defaults.

---

## Layer 4: The Shadow Provider (VideopackContextBridge)

Because complex blocks (like `PlayerContainer` or `Engine`) render inner blocks inside overlays, they must manually bridge the context. To eliminate boilerplate and prevent misconfiguration, we use the `<VideopackContextBridge>` React component.

```javascript
// Inside a parent block's edit.js
import VideopackContextBridge from '../../components/VideopackContextBridge';

return (
    <VideopackContextBridge attributes={attributes} context={context} overrides={{ 'videopack/isInsidePlayerOverlay': true }}>
        <InnerBlocks />
    </VideopackContextBridge>
);
```

### Avoiding Shadowing
Because `block.json` no longer statically defines `providesContext` for `videopack/*` keys, Gutenberg's native context propagation will never accidentally override the values explicitly provided by the `<VideopackContextBridge>`.

---

## Debugging Context Issues

If a child block is missing data:
1. **Check the Registry**: Does `src/Admin/Ui.php` include the key in the `uses_context` array?
2. **Check the Parent**: Is the parent block using `<VideopackContextBridge>` to pass the context down?
3. **Verify Attributes**: If a block should be providing context automatically (e.g., a standalone `Title` block), ensure it actually has the attribute (like `id`) that `Ui.php` is looking for.
