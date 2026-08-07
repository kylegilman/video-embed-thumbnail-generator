# Videopack 5.0 REST API Reference

Videopack 5.0 exposes a full suite of custom REST API endpoints under the namespace `/videopack/v1/`. These endpoints power the React Admin UI and allow developers to interact programmatically with video encoding queues, settings, and thumbnail generation.

---

## Endpoints Summary

| Endpoint | Method | Description |
|---|---|---|
| `/videopack/v1/options` | `GET`, `POST` | Retrieve and update plugin settings schema & values |
| `/videopack/v1/jobs` | `GET`, `POST` | Query, create, or update background encoding jobs |
| `/videopack/v1/jobs/<id>` | `GET`, `DELETE` | Retrieve or cancel a specific encoding job |
| `/videopack/v1/ffmpeg/test` | `POST` | Execute FFmpeg path validation and test encode |
| `/videopack/v1/thumbnails/candidates` | `GET` | Fetch potential thumbnail frames for a video attachment |
| `/videopack/v1/thumbnails/save` | `POST` | Save a generated or selected thumbnail to attachment meta |

---

## 1. Options API

### GET `/wp-json/videopack/v1/options`
Returns the current plugin options combined with their REST schema definitions.

#### Response Example
```json
{
  "options": {
    "player_skin": "default",
    "ffmpeg_path": "/usr/bin/ffmpeg",
    "watermark_enabled": true
  },
  "schema": { ... }
}
```

### POST `/wp-json/videopack/v1/options`
Updates plugin settings with automatic schema sanitization.

---

## 2. Jobs Queue API

### GET `/wp-json/videopack/v1/jobs`
List all queued, active, or completed encoding jobs.

#### Parameters
- `status`: (Optional) Filter by `queued`, `processing`, `completed`, `failed`.
