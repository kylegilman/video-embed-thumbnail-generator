# Videopack Context & Data Flow System

This document explains how video metadata and design settings are propagated through the Videopack block tree.

## Architecture Overview

Videopack uses a hybrid context system to ensure that child blocks (like Title, View Count, or Watermark) can access video metadata regardless of their nesting depth or whether they are rendered inside a specialized player engine.

The system consists of five layers:

1. **The PHP Registry (`src/Admin/Ui.php`)**: Dynamically injects global attributes and context mappings into all Videopack blocks.
2. **The React Bridge (`useVideopackContext` hook)**: Resolves design tokens and generates a "shared context" object for manual propagation in the editor.
3. **The PHP Context Manager (`src/Frontend/Context_Manager.php`)**: Mirrors the React resolution logic on the PHP side for frontend rendering.
4. **The Shadow Provider (`VideopackContextBridge`)**: Manually relays context through internal overlays in the editor.
5. **The Sibling Bridge (`utils/VideopackContext.js`)**: A plain React Context, for the one case none of the above can handle — passing live state *sideways*, between sibling blocks.

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

## Layer 5: The Sibling Bridge (`utils/VideopackContext.js`)

Layers 1-4 all propagate context **down** a block tree — from a block to its own descendants. That covers most cases, but `Collection` renders `Loop` and `Pagination` as **siblings**, not ancestor/descendant: Pagination needs to know the `currentPage`/`totalPages` that Loop's own query resolved, and there is no WP block context path from one sibling to another, no matter how it's registered in `Ui.php` or bridged with `<VideopackContextBridge>`.

`utils/VideopackContext.js` solves exactly this one problem: it's a plain `createContext`/`useContext` pair (`VideopackProvider` / the hook it exports), wrapped around Collection's entire `<InnerBlocks>` tree so both Loop and Pagination — as well as anything else nested under Collection — can read the same `{ currentPage, totalPages, gallery_pagination, gallery_per_page, videos }` object regardless of where they sit in the tree.

```javascript
// blocks/collection/edit.js — Provider wraps Loop and Pagination as siblings
<VideopackProvider value={{ currentPage, totalPages: queryData.maxNumPages, videos, ... }}>
    <InnerBlocks allowedBlocks={ALLOWED_BLOCKS} template={dynamicTemplate} />
</VideopackProvider>
```

> [!IMPORTANT]
> **Naming collision**: the hook this module exports is also, confusingly, named `useVideopackContext` — the same name as the Layer 2 hook every other block imports. **Always alias the import** rather than the hook's own name. The established convention (see `loop/edit.js`, `pagination/edit.js`) is:
> ```javascript
> import { useVideopackContext as useVideopackData } from '../../utils/VideopackContext';
> import useVideopackContext from '../../hooks/useVideopackContext';
> ```
> Keep the plain `useVideopackContext` name attached to the Layer 2 hook (the one nearly every block uses) and give *this* one the alias — not the other way around. A block that imports both and gets the aliasing backwards reads as if it's calling the common design-resolution hook with no arguments, which is a confusing trap for the next person who has to debug it.

Use this mechanism only when a block genuinely needs state from a sibling, not a descendant — for anything flowing from parent to child, Layers 1-4 already cover it, and adding a second parallel channel for the same data is how the two channels quietly drift out of sync with each other.

---

## Debugging Context Issues

If a child block is missing data:
1. **Check the Registry**: Does `src/Admin/Ui.php` include the key in the `uses_context` array?
2. **Check the Parent**: Is the parent block using `<VideopackContextBridge>` to pass the context down?
3. **Verify Attributes**: If a block should be providing context automatically (e.g., a standalone `Title` block), ensure it actually has the attribute (like `id`) that `Ui.php` is looking for.
4. **Check for a sibling relationship**: If the block needing data is a *sibling* of the block that has it (not a descendant), Layers 1-4 cannot help — that's what Layer 5 (`utils/VideopackContext.js`) is for. Confirm the data is actually in the `VideopackProvider`'s `value` object, and that the alias convention above wasn't accidentally inverted.
