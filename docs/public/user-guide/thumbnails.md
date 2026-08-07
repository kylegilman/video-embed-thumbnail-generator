# Generating Video Thumbnails & Watermarking

Videopack offers flexible options for creating video poster images (thumbnails) directly from your video files, whether or not your web host supports FFmpeg.

---

## 📽️ Method 1: In-Browser HTML5 Canvas Generator (No Server FFmpeg Required)

You do **not** need FFmpeg installed on your web server to generate video thumbnails. Videopack uses HTML5 Canvas technology directly in your browser.

[videopack id="browser_thumb_recording" title="In-Browser Thumbnail Generation Demo" autoplay="false"]

### Step-by-Step Instructions:
1. Open your WordPress **Media Library** and click on a video file.
2. Under the **Videopack Video Options** section, click **Generate Thumbnails**.
3. A video player window will open inside your browser. Play or scrub the video to your desired frame.
4. Click **Capture Frame**.
5. *(Optional)* Apply custom text or image watermarks directly onto the captured frame.
6. Click **Save Thumbnail**. The image is instantly saved to your Media Library and assigned as the video's poster.

---

## ⚙️ Method 2: Server-Side FFmpeg Auto-Generation

If your web server has FFmpeg installed:
- Videopack can automatically extract sample frames at regular intervals (e.g. 20%, 40%, 60%, 80% through the video) upon video upload.
- Automated background thumbnail creation runs when new attachments are uploaded.

---

## 🎨 Watermark Overlays

Videopack 5.0 supports client-side watermarking:
- Upload your logo or watermark PNG in **Videopack Settings > Watermark**.
- Configure position (Top-Left, Top-Right, Bottom-Left, Bottom-Right, Center) and opacity.
- Watermarks are rendered directly onto generated thumbnails without modifying original video streams.
