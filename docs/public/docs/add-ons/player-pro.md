# Videopack Player Pro

**Videopack Player Pro** is a premium extension that adds enterprise cloud processing and secure media distribution capabilities to Videopack.

---

## Key Features

### 1. AWS MediaConvert Cloud Transcoding
Instead of relying on server-side FFmpeg (which can consume high CPU resources on web hosts), Videopack Player Pro integrates seamlessly with AWS Elemental MediaConvert to generate multi-resolution H.264 / WebM files in the cloud.

- Automatic job dispatching upon video upload.
- Webhook notifications when transcoding completes.

### 2. Secure CDN Cookie Authentication
Protect your premium video files from direct unauthorized downloads or hotlinking.

- **Amazon CloudFront Cookie Auth**: Automatically issues signed CloudFront cookies to authorized users based on WordPress user roles or permissions.
- **Google Cloud CDN Cookie Auth**: Integrates with GCP CDN signed cookie validation.

---

## Integration Setup Guides

- [AWS CloudFront Cookie Authentication Guide](https://github.com/kylegilman/videopack-player-pro/blob/main/docs/aws-cloudfront-cookie-auth.md)
- [Google Cloud CDN Cookie Authentication Guide](https://github.com/kylegilman/videopack-player-pro/blob/main/docs/google-cloud-cdn-cookie-auth.md)
