# Videopack Unified Custom Hooks Reference

This is an automatically generated reference index of all custom actions and filters defined in the Videopack core plugin (both PHP and JavaScript/React admin environments) and the Videopack Pro add-on. These hooks allow you to customize, extend, or override core functionalities from your custom code snippets or add-on plugins.

Total Unique Hooks Found: **132**

## Table of Contents

- [embed_footer](#embed-footer) (`Action`) (Videopack Core)
- [embed_head](#embed-head) (`Action`) (Videopack Core)
- [videopack.contextKeys](#videopack-contextkeys) (`Filter`) (Videopack Core JS)
- [videopack.handle_format_checkbox](#videopack-handle-format-checkbox) (`Filter`) (Videopack Core JS)
- [videopack.playButtonElement](#videopack-playbuttonelement) (`Filter`) (Videopack Core JS)
- [videopack.settings.auto_encode_gif.disabled](#videopack-settings-auto-encode-gif-disabled) (`Filter`) (Videopack Core JS)
- [videopack.settings.codec_supported](#videopack-settings-codec-supported) (`Filter`) (Videopack Core JS)
- [videopack.settings.encoders](#videopack-settings-encoders) (`Filter`) (Videopack Core JS)
- [videopack.settings.tabs](#videopack-settings-tabs) (`Filter`) (Videopack Core JS)
- [videopack.utils.getQueue](#videopack-utils-getqueue) (`Filter`) (Videopack Core JS)
- [videopack.utils.getSettings](#videopack-utils-getsettings) (`Filter`) (Videopack Core JS)
- [videopack.utils.getVideoGallery](#videopack-utils-getvideogallery) (`Filter`) (Videopack Core JS)
- [videopack.utils.pre_getQueue](#videopack-utils-pre-getqueue) (`Filter`) (Videopack Core JS)
- [videopack.utils.pre_getSettings](#videopack-utils-pre-getsettings) (`Filter`) (Videopack Core JS)
- [videopack.utils.pre_getVideoGallery](#videopack-utils-pre-getvideogallery) (`Filter`) (Videopack Core JS)
- [videopack.utils.pre_testEncodeCommand](#videopack-utils-pre-testencodecommand) (`Filter`) (Videopack Core JS)
- [videopack_aac_encoders](#videopack-aac-encoders) (`Filter`) (Videopack Core)
- [videopack_admin_queue_page_after](#videopack-admin-queue-page-after) (`Action`) (Videopack Core)
- [videopack_allowed_query_var_atts](#videopack-allowed-query-var-atts) (`Filter`) (Videopack Core)
- [videopack_attachment_exists](#videopack-attachment-exists) (`Filter`) (Videopack Core)
- [videopack_attachment_inserted](#videopack-attachment-inserted) (`Action`) (Videopack Core)
- [videopack_attachment_meta](#videopack-attachment-meta) (`Filter`) (Videopack Core)
- [videopack_attachment_meta_defaults](#videopack-attachment-meta-defaults) (`Filter`) (Videopack Core)
- [videopack_aws_regional_transcoding_rates](#videopack-aws-regional-transcoding-rates) (`Filter`) (Videopack Pro)
- [videopack_batch_groups](#videopack-batch-groups) (`Filter`) (Videopack Core)
- [videopack_batch_permissions](#videopack-batch-permissions) (`Filter`) (Videopack Core)
- [videopack_batch_process_{$type}](#videopack-batch-process-{$type}) (`Filter`) (Videopack Core)
- [videopack_batch_types](#videopack-batch-types) (`Filter`) (Videopack Core)
- [videopack_block_attributes](#videopack-block-attributes) (`Filter`) (Videopack Core)
- [videopack_cancel_encoding](#videopack-cancel-encoding) (`Action`) (Videopack Core)
- [videopack_change_oembed_data](#videopack-change-oembed-data) (`Filter`) (Videopack Core)
- [videopack_check_cloud_job_status](#videopack-check-cloud-job-status) (`Action`) (Videopack Core)
- [videopack_check_if_can_queue](#videopack-check-if-can-queue) (`Filter`) (Videopack Core)
- [videopack_check_if_can_queue_attachment](#videopack-check-if-can-queue-attachment) (`Filter`) (Videopack Core)
- [videopack_compatible_extensions](#videopack-compatible-extensions) (`Filter`) (Videopack Core)
- [videopack_config_data](#videopack-config-data) (`Filter`) (Videopack Core)
- [videopack_default_options](#videopack-default-options) (`Filter`) (Videopack Core)
- [videopack_default_shortcode_atts](#videopack-default-shortcode-atts) (`Filter`) (Videopack Core)
- [videopack_default_skin](#videopack-default-skin) (`Filter`) (Videopack Core JS)
- [videopack_delete_format](#videopack-delete-format) (`Action`) (Videopack Core)
- [videopack_embed_method_options](#videopack-embed-method-options) (`Filter`) (Videopack Core JS)
- [videopack_exempt_cdns](#videopack-exempt-cdns) (`Filter`) (Videopack Core)
- [videopack_ffmpeg_exists](#videopack-ffmpeg-exists) (`Filter`) (Videopack Core)
- [videopack_file_download_logger_end](#videopack-file-download-logger-end) (`Action`) (Videopack Core)
- [videopack_file_download_logger_start](#videopack-file-download-logger-start) (`Filter`) (Videopack Core)
- [videopack_generate_encode_array](#videopack-generate-encode-array) (`Filter`) (Videopack Core)
- [videopack_generate_video_description](#videopack-generate-video-description) (`Filter`) (Videopack Core)
- [videopack_get_codecs](#videopack-get-codecs) (`Filter`) (Videopack Core)
- [videopack_get_options_manager](#videopack-get-options-manager) (`Filter`) (Videopack Core)
- [videopack_gifmode_atts](#videopack-gifmode-atts) (`Filter`) (Videopack Core)
- [videopack_grouped_sources](#videopack-grouped-sources) (`Filter`) (Videopack Core)
- [videopack_insert_shortcode_atts](#videopack-insert-shortcode-atts) (`Filter`) (Videopack Core)
- [videopack_job_completed](#videopack-job-completed) (`Action`) (Videopack Core)
- [videopack_mediaconvert_client_config](#videopack-mediaconvert-client-config) (`Filter`) (Videopack Pro)
- [videopack_options_for_rest](#videopack-options-for-rest) (`Filter`) (Videopack Core)
- [videopack_options_loaded](#videopack-options-loaded) (`Action`) (Videopack Core)
- [videopack_options_manager](#videopack-options-manager) (`Filter`) (Videopack Core)
- [videopack_play_button_html](#videopack-play-button-html) (`Filter`) (Videopack Core)
- [videopack_player_div_classes](#videopack-player-div-classes) (`Filter`) (Videopack Core)
- [videopack_player_script_handles](#videopack-player-script-handles) (`Filter`) (Videopack Core)
- [videopack_player_skin_options](#videopack-player-skin-options) (`Filter`) (Videopack Core JS)
- [videopack_player_style_handles](#videopack-player-style-handles) (`Filter`) (Videopack Core)
- [videopack_post_meta_schema](#videopack-post-meta-schema) (`Filter`) (Videopack Core)
- [videopack_post_save_thumb](#videopack-post-save-thumb) (`Filter`) (Videopack Core)
- [videopack_pre_insert_attachment](#videopack-pre-insert-attachment) (`Filter`) (Videopack Core)
- [videopack_pre_start_encode](#videopack-pre-start-encode) (`Filter`) (Videopack Core)
- [videopack_preferred_codecs](#videopack-preferred-codecs) (`Filter`) (Videopack Core)
- [videopack_pro_fs_loaded](#videopack-pro-fs-loaded) (`Action`) (Videopack Pro)
- [videopack_provides_context](#videopack-provides-context) (`Filter`) (Videopack Core)
- [videopack_queue_format](#videopack-queue-format) (`Action`) (Videopack Core)
- [videopack_remove_job](#videopack-remove-job) (`Action`) (Videopack Core)
- [videopack_resolution_l10n](#videopack-resolution-l10n) (`Filter`) (Videopack Core)
- [videopack_rest_attachment_formats_get](#videopack-rest-attachment-formats-get) (`Filter`) (Videopack Core)
- [videopack_rest_batch_process](#videopack-rest-batch-process) (`Filter`) (Videopack Core)
- [videopack_rest_batch_progress](#videopack-rest-batch-progress) (`Filter`) (Videopack Core)
- [videopack_rest_browser_thumbnail_progress](#videopack-rest-browser-thumbnail-progress) (`Filter`) (Videopack Core)
- [videopack_rest_clear_cache](#videopack-rest-clear-cache) (`Filter`) (Videopack Core)
- [videopack_rest_count_play](#videopack-rest-count-play) (`Filter`) (Videopack Core)
- [videopack_rest_defaults](#videopack-rest-defaults) (`Filter`) (Videopack Core)
- [videopack_rest_delete_format_by_id](#videopack-rest-delete-format-by-id) (`Filter`) (Videopack Core)
- [videopack_rest_ffmpeg_test](#videopack-rest-ffmpeg-test) (`Filter`) (Videopack Core)
- [videopack_rest_get_freemius_page_html](#videopack-rest-get-freemius-page-html) (`Filter`) (Videopack Core)
- [videopack_rest_get_thumbnail_candidates](#videopack-rest-get-thumbnail-candidates) (`Filter`) (Videopack Core)
- [videopack_rest_job_delete](#videopack-rest-job-delete) (`Filter`) (Videopack Core)
- [videopack_rest_job_get](#videopack-rest-job-get) (`Filter`) (Videopack Core)
- [videopack_rest_job_retry](#videopack-rest-job-retry) (`Filter`) (Videopack Core)
- [videopack_rest_jobs_clear](#videopack-rest-jobs-clear) (`Filter`) (Videopack Core)
- [videopack_rest_jobs_control](#videopack-rest-jobs-control) (`Filter`) (Videopack Core)
- [videopack_rest_jobs_create](#videopack-rest-jobs-create) (`Filter`) (Videopack Core)
- [videopack_rest_jobs_list](#videopack-rest-jobs-list) (`Filter`) (Videopack Core)
- [videopack_rest_presets_get](#videopack-rest-presets-get) (`Filter`) (Videopack Core)
- [videopack_rest_public_permission](#videopack-rest-public-permission) (`Filter`) (Videopack Core)
- [videopack_rest_register_url](#videopack-rest-register-url) (`Filter`) (Videopack Core)
- [videopack_rest_render_shortcode](#videopack-rest-render-shortcode) (`Filter`) (Videopack Core)
- [videopack_rest_thumb_generate](#videopack-rest-thumb-generate) (`Filter`) (Videopack Core)
- [videopack_rest_thumb_save](#videopack-rest-thumb-save) (`Filter`) (Videopack Core)
- [videopack_rest_thumb_save_all](#videopack-rest-thumb-save-all) (`Filter`) (Videopack Core)
- [videopack_rest_thumb_upload_save](#videopack-rest-thumb-upload-save) (`Filter`) (Videopack Core)
- [videopack_rest_update_settings](#videopack-rest-update-settings) (`Filter`) (Videopack Core)
- [videopack_rest_video_gallery](#videopack-rest-video-gallery) (`Filter`) (Videopack Core)
- [videopack_rest_video_player](#videopack-rest-video-player) (`Filter`) (Videopack Core)
- [videopack_rest_video_sources](#videopack-rest-video-sources) (`Filter`) (Videopack Core)
- [videopack_schema_integrated_with_seo](#videopack-schema-integrated-with-seo) (`Filter`) (Videopack Core)
- [videopack_send_to_editor_url](#videopack-send-to-editor-url) (`Filter`) (Videopack Core)
- [videopack_settings_schema](#videopack-settings-schema) (`Filter`) (Videopack Core)
- [videopack_settings_tabs](#videopack-settings-tabs) (`Filter`) (Videopack Core)
- [videopack_shared_attributes](#videopack-shared-attributes) (`Filter`) (Videopack Core)
- [videopack_shortcode_atts](#videopack-shortcode-atts) (`Filter`) (Videopack Core)
- [videopack_should_auto_encode_gif](#videopack-should-auto-encode-gif) (`Filter`) (Videopack Core)
- [videopack_skip_remote_metadata_fetch](#videopack-skip-remote-metadata-fetch) (`Filter`) (Videopack Core)
- [videopack_source_class](#videopack-source-class) (`Filter`) (Videopack Core)
- [videopack_source_get_download_url](#videopack-source-get-download-url) (`Filter`) (Videopack Core)
- [videopack_source_get_poster](#videopack-source-get-poster) (`Filter`) (Videopack Core)
- [videopack_source_get_url](#videopack-source-get-url) (`Filter`) (Videopack Core)
- [videopack_start_encode](#videopack-start-encode) (`Action`) (Videopack Core)
- [videopack_thumb_desc_type](#videopack-thumb-desc-type) (`Filter`) (Videopack Core)
- [videopack_thumb_exists](#videopack-thumb-exists) (`Filter`) (Videopack Core)
- [videopack_url_exists](#videopack-url-exists) (`Filter`) (Videopack Core)
- [videopack_url_to_id](#videopack-url-to-id) (`Filter`) (Videopack Core)
- [videopack_uses_context](#videopack-uses-context) (`Filter`) (Videopack Core)
- [videopack_video_codecs](#videopack-video-codecs) (`Filter`) (Videopack Core)
- [videopack_video_format_suffix](#videopack-video-format-suffix) (`Filter`) (Videopack Core)
- [videopack_video_formats](#videopack-video-formats) (`Filter`) (Videopack Core)
- [videopack_video_player](#videopack-video-player) (`Filter`) (Videopack Core)
- [videopack_video_player_classes](#videopack-video-player-classes) (`Filter`) (Videopack Core)
- [videopack_video_player_code](#videopack-video-player-code) (`Filter`) (Videopack Core)
- [videopack_video_player_data](#videopack-video-player-data) (`Filter`) (Videopack Core)
- [videopack_video_player_source_attributes](#videopack-video-player-source-attributes) (`Filter`) (Videopack Core)
- [videopack_video_player_sources](#videopack-video-player-sources) (`Filter`) (Videopack Core)
- [videopack_video_player_string_attributes](#videopack-video-player-string-attributes) (`Filter`) (Videopack Core)
- [videopack_video_player_tracks](#videopack-video-player-tracks) (`Filter`) (Videopack Core)
- [videopack_video_resolutions](#videopack-video-resolutions) (`Filter`) (Videopack Core)

---

## embed_footer

- **Type:** `Action`
- **Defined In:** Videopack Core (`src\Frontend\partials\embeddable-video.php` on line 72)

### Description

*No documentation block found in source file.*

---

## embed_head

- **Type:** `Action`
- **Defined In:** Videopack Core (`src\Frontend\partials\embeddable-video.php` on line 57)

### Description

*No documentation block found in source file.*

---

## videopack.contextKeys

- **Type:** `Filter`
- **Defined In:** Videopack Core JS (`hooks\useVideopackContext.js` on line 97)

### Description

import { useMemo } from '@wordpress/element'; import { useSelect } from '@wordpress/data'; import { getEffectiveValue, isTrue } from '../utils/context'; export { isTrue };  import { applyFilters } from '@wordpress/hooks';  const DEFAULT_CONTEXT_KEYS = [ 'skin', 'title_color', 'title_background_color', 'play_button_color', 'play_button_secondary_color', 'control_bar_bg_color', 'control_bar_color', 'pagination_color', 'pagination_background_color', 'pagination_active_bg_color', 'pagination_active_color', 'watermark', 'watermark_styles', 'watermark_align', 'watermark_valign', 'watermark_scale', 'watermark_x', 'watermark_y', 'watermark_link_to', 'align', 'gallery_per_page', 'gallery_source', 'gallery_id', 'gallery_category', 'gallery_tag', 'gallery_orderby', 'gallery_order', 'gallery_include', 'gallery_exclude', 'layout', 'columns', 'gallery_pagination', 'gallery_title', 'videos', 'enable_collection_video_limit', 'collection_video_limit', 'prioritizePostData', 'embed_method', 'isPreview', 'isStandalone', 'src', 'poster', 'title', 'caption', 'width', 'height', 'autoplay', 'controls', 'loop', 'muted', 'playsinline', 'preload', 'volume', 'auto_res', 'sources', 'source_groups', 'text_tracks', 'playback_rate', 'downloadlink', 'embedcode', 'embedlink', 'showCaption', 'showBackground', 'title_position', 'restartCount', 'duotone', 'style', 'loopDuotoneId', 'fixed_aspect', 'fullwidth', 'rotate', 'default_ratio', 'currentPage', 'totalPages', 'onPageChange', 'isInsideThumbnail', 'isInsidePlayerOverlay', 'isInsidePlayerContainer', 'isInsideTitleMeta', ];  export const VIDEOPACK_CONTEXT_KEYS = /** Filters the list of Gutenberg block context keys that the hook listens to.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `Array` | `contextKeys` | List of context key strings. |

---

## videopack.handle_format_checkbox

- **Type:** `Filter`
- **Defined In:** Videopack Core JS (`components\AdditionalFormats\AdditionalFormats.js` on line 390)

### Description

Filters the updated video formats list after checking/unchecking a checkbox.  Useful for extensions to perform custom validations or toggle other codecs accordingly.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `Object` | `` | updatedFormats Copy of the video formats state object. |
| `string` | `` | formatId       The resolution format ID that was changed. |
| `boolean` | `isChecked` |      True if format is checked, false otherwise. |

---

## videopack.playButtonElement

- **Type:** `Filter`
- **Defined In:** Videopack Core JS (`components\PlayButton\PlayButton.js` on line 30)

### Description

Filters the React element used to render the player play button.  Allowing full custom HTML/React play buttons for specific setups or styling extensions.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `Element|null` | `customButton` | Custom play button element, defaults to null. |
| `Object` | `` |      context      Context data including attributes, context, vpContext, and embed_method. |

---

## videopack.settings.auto_encode_gif.disabled

- **Type:** `Filter`
- **Defined In:** Videopack Core JS (`features\settings\components\EncodingSettings.js` on line 823)

### Description

*No description available.*

- **Since:** `5.0.0`

---

## videopack.settings.codec_supported

- **Type:** `Filter`
- **Defined In:** Videopack Core JS (`features\settings\components\EncodingSettings.js` on line 150)
- **Other Occurrences:**
  - Videopack Core JS (`features\settings\components\EncodingSettings.js` on line 393)

### Description

*No description available.*

- **Since:** `5.0.0`

---

## videopack.settings.encoders

- **Type:** `Filter`
- **Defined In:** Videopack Core JS (`features\settings\components\EncodingSettings.js` on line 74)

### Description

EncodingSettings component.  const EncodingSettings = ({ settings, changeHandlerFactory, ffmpegTest }) => { const { isNetworkActive } = videopack_config; const { app_path, encode, hide_video_formats, enable_custom_resolution, custom_resolution, error_email, ffmpeg_watermark, audio_bitrate, audio_channels, simultaneous_encodes, threads, nice, ffmpeg_exists, ffmpeg_error, auto_encode, auto_encode_gif, keep_gif_source, sample_rotate, auto_publish_post, active_encoder = 'ffmpeg', browser_encoder_assets_status = 'missing', } = settings;  const effectiveFfmpegExists = ( active_encoder !== 'ffmpeg' && ( !!videopack_config.isTranscodingServiceReady || !!videopack_config.is_pro ) ) || ffmpeg_exists === true || ffmpeg_exists === 'true' || ffmpeg_exists === 1 || ffmpeg_exists === '1';  const availableEncoders = /** Filters the list of available encoders in the dropdown list.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `Object` | `props` |                      Component props. |
| `Object` | `props.settings` |             Plugin settings. |
| `Object` | `props.changeHandlerFactory` | Factory for creating change handlers. |
| `Object` | `props.ffmpegTest` |           Results of the FFmpeg test. |
| `Array` | `encoders` | List of active encoder choices. |

---

## videopack.settings.tabs

- **Type:** `Filter`
- **Defined In:** Videopack Core JS (`features\settings\settings.js` on line 236)

### Description

Filters the active settings tabs array in the React Admin panel.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `Array` | `defaultTabs` | Array of tab objects. |

---

## videopack.utils.getQueue

- **Type:** `Filter`
- **Defined In:** Videopack Core JS (`api\jobs.js` on line 33)

### Description

Filters the list of encoding queue jobs retrieved from the server.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `Array` | `response` | Array of job objects. |

---

## videopack.utils.getSettings

- **Type:** `Filter`
- **Defined In:** Videopack Core JS (`api\settings.js` on line 47)

### Description

Filters the global settings object retrieved from the server.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `Object` | `settings` | Global settings options. |

---

## videopack.utils.getVideoGallery

- **Type:** `Filter`
- **Defined In:** Videopack Core JS (`api\gallery.js` on line 155)

### Description

Filters the list of media items returned for the video gallery.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `Object` | `response` | REST API response containing video list. |
| `Object` | `args` |     Query parameters used for fetching. |

---

## videopack.utils.pre_getQueue

- **Type:** `Filter`
- **Defined In:** Videopack Core JS (`api\jobs.js` on line 20)

### Description

Filters the queue listing before fetching from the REST API.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `undefined` | `pre` | Defaults to undefined. If a non-undefined value is returned, fetching is bypassed. |

---

## videopack.utils.pre_getSettings

- **Type:** `Filter`
- **Defined In:** Videopack Core JS (`api\settings.js` on line 22)

### Description

Filters the settings fetching process. Returning a non-undefined value bypasses the REST API call.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `undefined` | `pre` | Defaults to undefined. |

---

## videopack.utils.pre_getVideoGallery

- **Type:** `Filter`
- **Defined In:** Videopack Core JS (`api\gallery.js` on line 134)

### Description

Filters the video gallery query. Returning a non-undefined value bypasses the REST API call.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `undefined` | `pre` |  Defaults to undefined. |
| `Object` | `` |   args Query parameters. |

---

## videopack.utils.pre_testEncodeCommand

- **Type:** `Filter`
- **Defined In:** Videopack Core JS (`api\gallery.js` on line 220)

### Description

Filters the FFmpeg test command test response. Bypasses the REST API call if a non-undefined value is returned.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `undefined` | `pre` |        Defaults to undefined. |
| `string` | `` |   codec      The codec to test. |
| `string` | `` |   resolution Resolution to test. |
| `number` | `` |   rotate     Rotation angle. |

---

## videopack_aac_encoders

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\Formats\Codecs\Video_Codec.php` on line 277)

### Description

Filters the supported FFmpeg AAC audio encoders array.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `array` | `$aac_array` | List of encoder string identifiers (e.g. 'aac', 'libfdk_aac'). |

---

## videopack_admin_queue_page_after

- **Type:** `Action`
- **Defined In:** Videopack Core (`src\Admin\Screens.php` on line 261)

### Description

Fires after rendering the transcode queue management page in the admin tools panel.  Use this action to inject custom admin widgets, scripts, or debug info below the transcode job list tables.

- **Since:** `5.0.0`

---

## videopack_allowed_query_var_atts

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Frontend\Shortcode.php` on line 432)

### Description

Filter the allowed query variable attributes.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `array` | `$allowed_query_var_atts` | The allowed attributes. |

---

## videopack_attachment_exists

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Video_Source\Source_Attachment.php` on line 174)

### Description

Sets whether the video source exists.

- **Since:** `5.0.0`

---

## videopack_attachment_inserted

- **Type:** `Action`
- **Defined In:** Videopack Core (`src\Admin\Encode\Encode_Attachment.php` on line 2363)

### Description

*No documentation block found in source file.*

---

## videopack_attachment_meta

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\Attachment_Meta.php` on line 419)

### Description

Filters the complete metadata array loaded for a specific video attachment.  Allows add-ons to dynamically filter or add custom runtime properties to the attachment metadata before it is consumed by the player or editors.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `array` | `$meta_data` |     The complete attachment metadata array. |
| `int` | `` |  $attachment_id The attachment ID. |

---

## videopack_attachment_meta_defaults

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\Attachment_Meta.php` on line 152)

### Description

Filters the default metadata values assigned to a new video attachment.  Use this filter to inject additional custom metadata keys and default values managed by add-ons (such as cloud storage or playback settings).

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `array` | `$default_meta` | Associative array of default attachment metadata. |

---

## videopack_aws_regional_transcoding_rates

- **Type:** `Filter`
- **Defined In:** Videopack Pro (`src\Cloud\Transcoding_Controller.php` on line 722)

### Description

Filters the pricing rates for regional AWS transcoder jobs.  Allows overriding transcoding price metrics for specific AWS regions (e.g. for custom reporting or cost management dashboards).

- **Since:** `0.1.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `array` | `` | $rates  Associative array of pricing tier configuration values. |
| `string` | `$region` | The target AWS region string. |

---

## videopack_batch_groups

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\REST\Process_Controller.php` on line 119)
- **Other Occurrences:**
  - Videopack Core (`src\Admin\REST\Process_Controller.php` on line 195)

### Description

*No description available.*

- **Since:** `5.0.0`

---

## videopack_batch_permissions

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\REST\Process_Controller.php` on line 98)

### Description

*No description available.*

- **Since:** `5.0.0`

---

## videopack_batch_process_{$type}

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\REST\Process_Controller.php` on line 165)

### Description

*No description available.*

- **Since:** `5.0.0`

---

## videopack_batch_types

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\REST\Process_Controller.php` on line 28)

### Description

*No description available.*

- **Since:** `5.0.0`

---

## videopack_block_attributes

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Frontend\Shortcode.php` on line 338)

### Description

Filter the block attributes.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `array` | `$attributes` | The block attributes. |

---

## videopack_cancel_encoding

- **Type:** `Action`
- **Defined In:** Videopack Core (`src\Admin\Encode\Encode_Attachment.php` on line 1883)

### Description

Cancels an active encoding job.  public function cancel_encoding( int $job_id ) { $canceled      = false; $encode_format = $this->get_encode_format_by_job_id( (int) $job_id );  if ( ! $encode_format instanceof Encode_Format ) { return false; }  $can_cancel_own_job = ( (int) get_current_user_id() === (int) $encode_format->get_user_id() && current_user_can( 'encode_videos' ) );  if ( ! ( $can_cancel_own_job || current_user_can( 'edit_others_video_encodes' ) ) ) { $encode_format->set_error( (string) __( 'User does not have permission to cancel this encoding job.', 'video-embed-thumbnail-generator' ) ); $this->save_format( $encode_format ); return false; }  if ( ! (int) $encode_format->get_pid() || 'encoding' !== (string) $encode_format->get_status() ) { return false; }  $pid = (int) $encode_format->get_pid();  if ( '\\' !== DIRECTORY_SEPARATOR ) { if ( function_exists( 'posix_kill' ) && (bool) posix_kill( $pid, 0 ) ) { $canceled = (bool) posix_kill( $pid, SIGTERM ); if ( ! $canceled || ( $canceled && (bool) posix_kill( $pid, 0 ) ) ) { sleep( 1 ); if ( (bool) posix_kill( $pid, 0 ) ) { $canceled = (bool) posix_kill( $pid, SIGKILL ); if ( ! $canceled && (bool) posix_kill( $pid, 0 ) ) { $encode_format->set_error( (string) __( 'Failed to kill process with SIGTERM or SIGKILL.', 'video-embed-thumbnail-generator' ) ); } } else { $canceled = true; } } } elseif ( function_exists( 'posix_kill' ) && ! (bool) posix_kill( $pid, 0 ) ) { $canceled = true; /* translators: %d is the process ID. */ $encode_format->set_error( (string) sprintf( (string) __( 'Process %d not found or no permission to send cancel signal.', 'video-embed-thumbnail-generator' ), $pid ) ); } else { $encode_format->set_error( (string) __( 'posix_kill function not available to cancel process.', 'video-embed-thumbnail-generator' ) ); } } else { $check_pid_command = FFmpeg_Process::fromShellCommandline( (string) ( 'tasklist /NH /FI "PID eq ' . (int) $pid . '"' ) ); try { $check_pid_command->run(); if ( (bool) $check_pid_command->isSuccessful() && strpos( (string) $check_pid_command->getOutput(), (string) $pid ) !== false ) { $commandline  = (string) ( 'taskkill /F /T /PID ' . (int) $pid ); $kill_process = FFmpeg_Process::fromShellCommandline( $commandline ); try { $kill_process->run(); if ( (bool) $kill_process->isSuccessful() ) { $canceled = true; } else { /* translators: %s is the error output from taskkill. */ $encode_format->set_error( (string) sprintf( (string) __( 'Taskkill failed: %s', 'video-embed-thumbnail-generator' ), (string) $kill_process->getErrorOutput() ) ); } } catch ( \Exception $e ) { /* translators: %s is the exception message. */ $encode_format->set_error( (string) sprintf( (string) __( 'Exception during taskkill: %s', 'video-embed-thumbnail-generator' ), (string) $e->getMessage() ) ); } } else { $canceled = true; $encode_format->set_error( (string) __( 'Process not found via tasklist, assuming canceled.', 'video-embed-thumbnail-generator' ) ); } } catch ( \Exception $e ) { /* translators: %s is the exception message. */

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `int` | `$job_id` | The ID of the job to cancel. |

---

## videopack_change_oembed_data

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Frontend\Template.php` on line 166)

### Description

Filters the modified oEmbed data.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `array` | `` |        $data   The oEmbed data. |
| `\WP_Post|null` | `$post` |   The post object. |
| `int` | `` |          $width  The width. |
| `int` | `` |          $height The height. |

---

## videopack_check_cloud_job_status

- **Type:** `Action`
- **Defined In:** Videopack Core (`src\Admin\Encode\Encode_Queue_Controller.php` on line 693)

### Description

*No documentation block found in source file.*

---

## videopack_check_if_can_queue

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\Encode\Encode_Attachment.php` on line 1386)

### Description

*No description available.*

- **Since:** `5.0.0`

---

## videopack_check_if_can_queue_attachment

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\Encode\Encode_Attachment.php` on line 1370)

### Description

*No description available.*

- **Since:** `5.0.0`

---

## videopack_compatible_extensions

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Video_Source\Source.php` on line 572)
- **Other Occurrences:**
  - Videopack Pro (`src\Cloud\Aws.php` on line 376)
  - Videopack Pro (`src\Cloud\Google_Storage.php` on line 109)

### Description

Filter the list of Videopack-compatible video extensions.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `array` | `$compatible` | Array of compatible video extensions. |

---

## videopack_config_data

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\Ui.php` on line 521)

### Description

*No description available.*

- **Since:** `5.0.0`

---

## videopack_default_options

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\Options.php` on line 308)

### Description

*No description available.*

- **Since:** `5.0.0`

---

## videopack_default_shortcode_atts

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Frontend\Shortcode.php` on line 398)

### Description

Filter the default shortcode attributes.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `array` | `$default_atts` | The default attributes. |

---

## videopack_default_skin

- **Type:** `Filter`
- **Defined In:** Videopack Core JS (`features\settings\components\PlayerSettings.js` on line 428)

### Description

Filters the default skin applied when selecting a player method.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `string|undefined` | `default_skin` | Skin identifier. |
| `string` | `` |          value        The selected player method name. |

---

## videopack_delete_format

- **Type:** `Action`
- **Defined In:** Videopack Core (`src\Admin\Encode\Encode_Attachment.php` on line 2162)

### Description

*No documentation block found in source file.*

---

## videopack_embed_method_options

- **Type:** `Filter`
- **Defined In:** Videopack Core JS (`features\settings\components\PlayerSettings.js` on line 147)

### Description

/* global videopack_config */  import { useMemo } from '@wordpress/element'; import { __, _x, sprintf } from '@wordpress/i18n'; import { applyFilters } from '@wordpress/hooks'; import { BaseControl, CheckboxControl, Flex, FlexBlock, FlexItem, PanelBody, PanelRow, RadioControl, RangeControl, SelectControl, TextControl, ToggleControl, } from '@wordpress/components'; import { volumeUp, volumeDown } from '../../../assets/icon'; import PreviewIframe from '../../../components/PreviewIframe/PreviewIframe'; import CompactColorPicker from '../../../components/CompactColorPicker/CompactColorPicker'; import { getColorFallbacks } from '../../../utils/colors'; import VideopackTooltip from './VideopackTooltip'; import WatermarkSettingsPanel from '../../../components/WatermarkSettingsPanel/WatermarkSettingsPanel'; import useResolutions from '../../../hooks/useResolutions'; import { BlockPreview } from '../../../components/Preview'; import { TITLE_DOWNLOAD_BLOCK_ATTRS } from '../../../utils/titleDownloadBlock';  const PlayerSettings = ({ settings, setSettings, changeHandlerFactory }) => { const { embed_method, overlay_title, watermark, watermark_styles, watermark_link_to, watermark_url, align, resize, auto_res, enable_custom_resolution, custom_resolution, pixel_ratio, find_formats, fullwidth, width, height, legacy_dimensions, fixed_aspect, controls, playsinline, pauseothervideos, volume, preload, skin, embeddable, embedcode, downloadlink, inline, views, autoplay, loop, muted, gifmode, playback_rate, encode, right_click, click_download, play_button_color, play_button_secondary_color, control_bar_bg_color, control_bar_color, title_color, title_background_color, } = settings;  const currentResolutions = useResolutions( enable_custom_resolution, custom_resolution );  const changeGifmode = (value) => { setSettings((prevSettings) => ({ ...prevSettings, gifmode: value, autoplay: value, loop: value, muted: value, })); if (value) { setSettings((prevSettings) => ({ ...prevSettings, controls: false, embeddable: false, overlay_title: false, views: false, playsinline: true, })); } else { setSettings((prevSettings) => ({ ...prevSettings, controls: true, embeddable: true, })); } };  const handleCodecCheckboxChange = (codecId, isEnabled) => { const newEncode = JSON.parse(JSON.stringify(settings.encode || {})); const { codecs, resolutions } = videopack_config; const codecInfo = codecs.find((c) => c.id === codecId);  if (!newEncode[codecId]) { newEncode[codecId] = { resolutions: {} }; }  newEncode[codecId].enabled = !!isEnabled;  if (isEnabled && codecInfo) { // Set default quality settings when enabling a codec for the first time if (!newEncode[codecId].rate_control) { newEncode[codecId].rate_control = codecInfo.supported_rate_controls[0]; newEncode[codecId].crf = codecInfo.rate_control.crf.default; newEncode[codecId].vbr = codecInfo.rate_control.vbr.default; } }  if (!isEnabled) { if (!newEncode[codecId].resolutions) { newEncode[codecId].resolutions = {}; } resolutions.forEach((resolution) => { newEncode[codecId].resolutions[resolution.id] = false; }); } changeHandlerFactory.encode(newEncode); };  const embedMethodOptions = /** Filters the list of available embed player methods (e.g. Video.js, MediaElement).

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `Array` | `options` | Array of embed options containing value and label. |

---

## videopack_exempt_cdns

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Video_Source\Source_Attachment.php` on line 134)

### Description

Filter the list of CDN domains exempt from URL rewriting.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `array` | `$exempt_cdns` | Array of CDN domains. |

---

## videopack_ffmpeg_exists

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\Attachment_Processor.php` on line 112)
- **Other Occurrences:**
  - Videopack Core (`src\Admin\Attachment_Processor.php` on line 186)
  - Videopack Core (`src\Admin\Attachment_Processor.php` on line 312)
  - Videopack Core (`src\Admin\Screens.php` on line 230)
  - Videopack Core (`src\Admin\REST\Thumbnail_Controller.php` on line 67)
  - Videopack Pro (`src\Local_Encoding\AutoThumb.php` on line 86)
  - Videopack Pro (`src\Local_Encoding\AutoThumb.php` on line 226)

### Description

*No description available.*

- **Since:** `5.0.0`

---

## videopack_file_download_logger_end

- **Type:** `Action`
- **Defined In:** Videopack Core (`src\Frontend\Template.php` on line 382)

### Description

Action to end file download logging.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `mixed` | `$download_log` | The log identifier. |
| `bool` | `` | $complete     Whether the download was complete. |

---

## videopack_file_download_logger_start

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Frontend\Template.php` on line 344)

### Description

Filter to start file download logging.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `bool` | `` |  $log  Whether to log the download. |
| `string` | `$file` | The file path. |

---

## videopack_generate_encode_array

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\Encode\Encode_Attachment.php` on line 1119)

### Description

*No description available.*

- **Since:** `5.0.0`

---

## videopack_generate_video_description

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Frontend\Metadata.php` on line 238)

### Description

Filters the generated video description.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `string` | `$description` | The generated description. |
| `array` | `` | $query_atts  The video attributes. |

---

## videopack_get_codecs

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\Encode\Encode_Attachment.php` on line 1338)

### Description

*No description available.*

- **Since:** `5.0.0`

---

## videopack_get_options_manager

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Frontend\partials\embeddable-video.php` on line 26)
- **Other Occurrences:**
  - Videopack Pro (`src\Pro.php` on line 88)
  - Videopack Pro (`src\Ads\Ads.php` on line 48)
  - Videopack Pro (`src\Cloud\Cloud_Integration_Subscriber.php` on line 72)
  - Videopack Pro (`src\Cloud\Cloud_Integration_Subscriber.php` on line 117)
  - Videopack Pro (`src\Local_Encoding\Asset_Controller.php` on line 132)
  - Videopack Pro (`src\Local_Encoding\Asset_Controller.php` on line 172)
  - Videopack Pro (`src\Player\Player_Pro_Subscriber.php` on line 191)
  - Videopack Pro (`src\Player\Player_Pro_Subscriber.php` on line 242)

### Description

Filters to retrieve the central Videopack settings options manager instance.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `object|null` | `$options_manager` | Null by default, or the Options manager class. |

---

## videopack_gifmode_atts

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Frontend\Shortcode.php` on line 617)

### Description

Filter the GIF mode attributes.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `array` | `$gifmode_atts` | The attributes. |

---

## videopack_grouped_sources

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Frontend\Video_Players\Player.php` on line 453)

### Description

*No documentation block found in source file.*

---

## videopack_insert_shortcode_atts

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\Edit_Posts.php` on line 161)

### Description

Filters the shortcode attributes before building the Classic Editor video shortcode string.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `array` | `$shortcode_atts` |     Associative array of attribute name => value. |
| `int` | `` |  $attachment_id      The attachment ID. |
| `array` | `$videopack_postmeta` | The attachment's Videopack metadata. |

---

## videopack_job_completed

- **Type:** `Action`
- **Defined In:** Videopack Core (`src\Admin\Encode\Encode_Queue_Controller.php` on line 497)

### Description

*No documentation block found in source file.*

---

## videopack_mediaconvert_client_config

- **Type:** `Filter`
- **Defined In:** Videopack Pro (`src\Cloud\Transcoder\AWS_MediaConvert.php` on line 83)

### Description

Filters the default AWS MediaConvert client configuration array.  Allows overriding SDK config options, custom endpoints, retries, or AWS client handlers before MediaConvert connection boots.

- **Since:** `0.1.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `array` | `$config` | The AWS SDK client configuration options. |

---

## videopack_options_for_rest

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\Options.php` on line 518)

### Description

*No description available.*

- **Since:** `5.0.0`

---

## videopack_options_loaded

- **Type:** `Action`
- **Defined In:** Videopack Core (`src\Admin\Options.php` on line 350)

### Description

*No description available.*

- **Since:** `5.0.0`

---

## videopack_options_manager

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Videopack.php` on line 103)

### Description

Allows replacement of the Options class.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `Options` | `$options_manager` | The options manager instance. |

---

## videopack_play_button_html

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Frontend\Modular_Renderer.php` on line 1221)

### Description

*No documentation block found in source file.*

---

## videopack_player_div_classes

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Frontend\Video_Players\Player.php` on line 623)

### Description

Generates the HTML for the player div start tag.

- **Since:** `5.0.0`

---

## videopack_player_script_handles

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Frontend\Video_Players\Player.php` on line 215)

### Description

Returns the handles for player-specific scripts.

- **Since:** `5.0.0`

---

## videopack_player_skin_options

- **Type:** `Filter`
- **Defined In:** Videopack Core JS (`features\settings\components\PlayerSettings.js` on line 268)
- **Other Occurrences:**
  - Videopack Core JS (`features\settings\components\VideoCollectionSettings.js` on line 96)

### Description

/* global videopack_config */  import { useMemo } from '@wordpress/element'; import { __, _x, sprintf } from '@wordpress/i18n'; import { applyFilters } from '@wordpress/hooks'; import { BaseControl, CheckboxControl, Flex, FlexBlock, FlexItem, PanelBody, PanelRow, RadioControl, RangeControl, SelectControl, TextControl, ToggleControl, } from '@wordpress/components'; import { volumeUp, volumeDown } from '../../../assets/icon'; import PreviewIframe from '../../../components/PreviewIframe/PreviewIframe'; import CompactColorPicker from '../../../components/CompactColorPicker/CompactColorPicker'; import { getColorFallbacks } from '../../../utils/colors'; import VideopackTooltip from './VideopackTooltip'; import WatermarkSettingsPanel from '../../../components/WatermarkSettingsPanel/WatermarkSettingsPanel'; import useResolutions from '../../../hooks/useResolutions'; import { BlockPreview } from '../../../components/Preview'; import { TITLE_DOWNLOAD_BLOCK_ATTRS } from '../../../utils/titleDownloadBlock';  const PlayerSettings = ({ settings, setSettings, changeHandlerFactory }) => { const { embed_method, overlay_title, watermark, watermark_styles, watermark_link_to, watermark_url, align, resize, auto_res, enable_custom_resolution, custom_resolution, pixel_ratio, find_formats, fullwidth, width, height, legacy_dimensions, fixed_aspect, controls, playsinline, pauseothervideos, volume, preload, skin, embeddable, embedcode, downloadlink, inline, views, autoplay, loop, muted, gifmode, playback_rate, encode, right_click, click_download, play_button_color, play_button_secondary_color, control_bar_bg_color, control_bar_color, title_color, title_background_color, } = settings;  const currentResolutions = useResolutions( enable_custom_resolution, custom_resolution );  const changeGifmode = (value) => { setSettings((prevSettings) => ({ ...prevSettings, gifmode: value, autoplay: value, loop: value, muted: value, })); if (value) { setSettings((prevSettings) => ({ ...prevSettings, controls: false, embeddable: false, overlay_title: false, views: false, playsinline: true, })); } else { setSettings((prevSettings) => ({ ...prevSettings, controls: true, embeddable: true, })); } };  const handleCodecCheckboxChange = (codecId, isEnabled) => { const newEncode = JSON.parse(JSON.stringify(settings.encode || {})); const { codecs, resolutions } = videopack_config; const codecInfo = codecs.find((c) => c.id === codecId);  if (!newEncode[codecId]) { newEncode[codecId] = { resolutions: {} }; }  newEncode[codecId].enabled = !!isEnabled;  if (isEnabled && codecInfo) { // Set default quality settings when enabling a codec for the first time if (!newEncode[codecId].rate_control) { newEncode[codecId].rate_control = codecInfo.supported_rate_controls[0]; newEncode[codecId].crf = codecInfo.rate_control.crf.default; newEncode[codecId].vbr = codecInfo.rate_control.vbr.default; } }  if (!isEnabled) { if (!newEncode[codecId].resolutions) { newEncode[codecId].resolutions = {}; } resolutions.forEach((resolution) => { newEncode[codecId].resolutions[resolution.id] = false; }); } changeHandlerFactory.encode(newEncode); };  const embedMethodOptions = /** Filters the list of available embed player methods (e.g. Video.js, MediaElement).   applyFilters('videopack_embed_method_options', [ { value: 'Video.js', label: __('Video.js', 'video-embed-thumbnail-generator'), }, { value: 'WordPress Default', label: __('WordPress Default', 'video-embed-thumbnail-generator'), }, { value: 'None', label: __('None', 'video-embed-thumbnail-generator'), }, ]);  const preloadOptions = [ { value: 'auto', label: __('Auto', 'video-embed-thumbnail-generator'), }, { value: 'metadata', label: __('Metadata', 'video-embed-thumbnail-generator'), }, { value: 'none', label: _x('None', 'Preload value'), }, ];  const fixedAspectOptions = [ { value: 'false', label: __('None', 'video-embed-thumbnail-generator'), }, { value: 'true', label: __('All', 'video-embed-thumbnail-generator'), }, { value: 'vertical', label: __('Vertical Videos', 'video-embed-thumbnail-generator'), }, ];  const watermarkLinkOptions = [ { value: 'false', label: __('None', 'video-embed-thumbnail-generator'), }, { value: 'home', label: __('Home page', 'video-embed-thumbnail-generator'), }, { value: 'parent', label: __('Parent post', 'video-embed-thumbnail-generator'), }, { value: 'download', label: __('Download video', 'video-embed-thumbnail-generator'), }, { value: 'attachment', label: __( 'Video attachment page', 'video-embed-thumbnail-generator' ), }, { value: 'custom', label: __('Custom URL', 'video-embed-thumbnail-generator'), }, ];  const skinOptions = useMemo(() => { const options = [ { value: 'vjs-theme-videopack', label: __('Videopack', 'video-embed-thumbnail-generator'), }, { value: 'kg-video-js-skin', label: __( 'Videopack Classic', 'video-embed-thumbnail-generator' ), }, { value: 'default', label: __( 'Video.js default', 'video-embed-thumbnail-generator' ), }, { value: 'vjs-theme-city', label: __('City', 'video-embed-thumbnail-generator'), }, { value: 'vjs-theme-fantasy', label: __('Fantasy', 'video-embed-thumbnail-generator'), }, { value: 'vjs-theme-forest', label: __('Forest', 'video-embed-thumbnail-generator'), }, { value: 'vjs-theme-sea', label: __('Sea', 'video-embed-thumbnail-generator'), }, ];  return /** Filters the list of available player skins based on the selected embed method.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `Array` | `options` | Array of embed options containing value and label. |
| `Array` | `` | options      List of skin option structures. |
| `string` | `embed_method` | The selected player embed method. |

---

## videopack_player_style_handles

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Frontend\Video_Players\Player.php` on line 206)

### Description

Returns the handles for player-specific styles.

- **Since:** `5.0.0`

---

## videopack_post_meta_schema

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\Attachment_Meta.php` on line 940)

### Description

Filters the database schema mapping used for attachment postmeta storage.  Controls how settings/metadata fields map to direct postmeta database keys.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `array` | `$schema` | The active schema mapping dictionary. |

---

## videopack_post_save_thumb

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\FFmpeg_Thumbnails.php` on line 647)

### Description

Filters the final URL of the poster thumbnail after it is successfully saved to the media library.  Useful for modifying paths, offloading to CDNs, or storing custom thumbnail size versions.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `string` | `$final_poster_url` | The absolute URL to the saved poster thumbnail image. |
| `int` | `` |   $thumb_id         The attachment ID of the saved thumbnail image. |

---

## videopack_pre_insert_attachment

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\Encode\Encode_Attachment.php` on line 2417)

### Description

Orchestrates the insertion of an encoded format into the WordPress media library.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `\Videopack\Admin\Encode\Encode_Format` | `$encode_format` | The format object. |

---

## videopack_pre_start_encode

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\Encode\Encode_Attachment.php` on line 861)

### Description

*No description available.*

- **Since:** `5.0.0`

---

## videopack_preferred_codecs

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Video_Source\Source.php` on line 695)

### Description

Filter preferred video codecs for a mime type. Since multiple codecs can be available for a mime type, this filter can change or provide a preferred codec for a mime type.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `array` | `$preferred_codecs` | Array of preferred video codecs. |

---

## videopack_pro_fs_loaded

- **Type:** `Action`
- **Defined In:** Videopack Pro (`videopack-pro.php` on line 125)

### Description

Fires immediately after the Freemius SDK for Videopack Pro has been successfully loaded.  Use this action to run hook initialization routines or check license state specifically for the premium add-on plugin.

- **Since:** `0.1.0`

---

## videopack_provides_context

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\Ui.php` on line 276)

### Description

*No description available.*

- **Since:** `5.0.0`

---

## videopack_queue_format

- **Type:** `Action`
- **Defined In:** Videopack Core (`src\Admin\Encode\Encode_Attachment.php` on line 1512)
- **Other Occurrences:**
  - Videopack Core (`src\Admin\Encode\Encode_Attachment.php` on line 1593)

### Description

*No description available.*

- **Since:** `5.0.0`

---

## videopack_remove_job

- **Type:** `Action`
- **Defined In:** Videopack Core (`src\Admin\Encode\Encode_Queue_Controller.php` on line 1117)

### Description

Fires after an encoding job is removed from the queue.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `int` | `` |  $job_id The ID of the job being removed. |
| `array` | `$job` |    The raw job data (fetched before deletion). |

---

## videopack_resolution_l10n

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\Formats\Registry.php` on line 253)

### Description

Filters the localizable string name for a video resolution.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `string` | `$name` | The resolution string label. |

---

## videopack_rest_attachment_formats_get

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\REST\Attachment_Controller.php` on line 152)

### Description

Filters the REST response returning list of transcoded format video links.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `\WP_REST_Response` | `$response` | The REST response. |
| `\WP_REST_Request` | `` | $request  The REST request. |

---

## videopack_rest_batch_process

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\REST\Process_Controller.php` on line 179)

### Description

*No description available.*

- **Since:** `5.0.0`

---

## videopack_rest_batch_progress

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\REST\Process_Controller.php` on line 250)

### Description

*No description available.*

- **Since:** `5.0.0`

---

## videopack_rest_browser_thumbnail_progress

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\REST\Process_Controller.php` on line 230)

### Description

*No description available.*

- **Since:** `5.0.0`

---

## videopack_rest_clear_cache

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\REST\Settings_Controller.php` on line 134)

### Description

REST callback to clear transiet cache.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `\WP_REST_Request` | `$request` | The REST request object. |

---

## videopack_rest_count_play

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\REST\Public_Controller.php` on line 261)

### Description

REST callback to count play.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `\WP_REST_Request` | `$request` | The REST request object. |

---

## videopack_rest_defaults

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\REST\Settings_Controller.php` on line 121)

### Description

Filters the REST response listing all default settings.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `\WP_REST_Response` | `$response` | The REST response. |
| `\WP_REST_Request` | `` | $request  The REST request. |

---

## videopack_rest_delete_format_by_id

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\REST\Attachment_Controller.php` on line 184)

### Description

Filters the REST response after deleting a specific video format attachment.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `\WP_REST_Response` | `$response` | The REST response. |
| `\WP_REST_Request` | `` | $request  The REST request. |

---

## videopack_rest_ffmpeg_test

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\REST\Settings_Controller.php` on line 164)

### Description

Filters the REST response returning FFmpeg test diagnostic output.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `\WP_REST_Response` | `$response` | The REST response. |
| `\WP_REST_Request` | `` | $request  The REST request. |

---

## videopack_rest_get_freemius_page_html

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\REST\Settings_Controller.php` on line 198)

### Description

*No documentation block found in source file.*

---

## videopack_rest_get_thumbnail_candidates

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\REST\Thumbnail_Controller.php` on line 421)

### Description

Filters the REST response containing the list of videos that need thumbnails.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `\WP_REST_Response` | `$response` | The REST response. |
| `\WP_REST_Request` | `` | $request  The REST request. |

---

## videopack_rest_job_delete

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\REST\Job_Controller.php` on line 287)

### Description

Filters the REST response after successfully deleting a transcode job.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `\WP_REST_Response` | `$response` | The REST response. |
| `\WP_REST_Request` | `` | $request  The REST request. |

---

## videopack_rest_job_get

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\REST\Job_Controller.php` on line 257)

### Description

Filters the REST response for retrieving single transcode job details.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `\WP_REST_Response` | `$response` | The REST response. |
| `\WP_REST_Request` | `` | $request  The REST request. |

---

## videopack_rest_job_retry

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\REST\Job_Controller.php` on line 321)

### Description

Filters the REST response after successfully retrying a failed transcode job.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `\WP_REST_Response` | `$response` | The REST response. |
| `\WP_REST_Request` | `` | $request  The REST request. |

---

## videopack_rest_jobs_clear

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\REST\Job_Controller.php` on line 234)

### Description

Filters the REST response after clearing completed/all transcoding jobs.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `\WP_REST_Response` | `$response` | The REST response. |
| `\WP_REST_Request` | `` | $request  The REST request. |

---

## videopack_rest_jobs_control

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\REST\Job_Controller.php` on line 213)

### Description

Filters the REST response after controlling queue state (play/pause).

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `\WP_REST_Response` | `$response` | The REST response. |
| `\WP_REST_Request` | `` | $request  The REST request. |

---

## videopack_rest_jobs_create

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\REST\Job_Controller.php` on line 154)

### Description

Filters the REST response after successfully enqueuing transcoding jobs.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `\WP_REST_Response` | `$response` | The REST response. |
| `\WP_REST_Request` | `` | $request  The REST request. |

---

## videopack_rest_jobs_list

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\REST\Job_Controller.php` on line 187)

### Description

Filters the REST response listing active/completed transcoding jobs.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `\WP_REST_Response` | `$response` | The REST response. |
| `\WP_REST_Request` | `` | $request  The REST request. |

---

## videopack_rest_presets_get

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\REST\Public_Controller.php` on line 287)

### Description

Filters the REST response listing active resolution/codec presets.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `\WP_REST_Response` | `$response` | The REST response. |
| `\WP_REST_Request` | `` | $request  The REST request. |

---

## videopack_rest_public_permission

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\REST\Controller.php` on line 116)

### Description

Filters public access permission for Videopack public REST endpoints.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `bool` | `` |            $allowed Whether access is allowed. |
| `\WP_REST_Request` | `$request` | The REST request. |

---

## videopack_rest_register_url

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\REST\Attachment_Controller.php` on line 114)

### Description

Filters the REST response after registering an external video URL.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `\WP_REST_Response` | `$response` | The REST response. |
| `\WP_REST_Request` | `` | $request  The REST request. |

---

## videopack_rest_render_shortcode

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\REST\Public_Controller.php` on line 237)

### Description

REST callback to render shortcode.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `\WP_REST_Request` | `$request` | The REST request object. |

---

## videopack_rest_thumb_generate

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\REST\Thumbnail_Controller.php` on line 269)

### Description

Filters the REST response after successfully generating a temporary thumbnail.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `\WP_REST_Response` | `$response` | The REST response. |
| `\WP_REST_Request` | `` | $request  The REST request. |

---

## videopack_rest_thumb_save

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\REST\Thumbnail_Controller.php` on line 400)

### Description

Filters the REST response after successfully saving a single video thumbnail.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `\WP_REST_Response` | `$response` | The REST response. |
| `\WP_REST_Request` | `` | $request  The REST request. |

---

## videopack_rest_thumb_save_all

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\REST\Thumbnail_Controller.php` on line 317)

### Description

Filters the REST response after successfully saving all generated thumbnails.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `\WP_REST_Response` | `$response` | The REST response. |
| `\WP_REST_Request` | `` | $request  The REST request. |

---

## videopack_rest_thumb_upload_save

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\REST\Thumbnail_Controller.php` on line 358)

### Description

Filters the REST response after successfully saving an uploaded thumbnail.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `\WP_REST_Response` | `$response` | The REST response. |
| `\WP_REST_Request` | `` | $request  The REST request. |

---

## videopack_rest_update_settings

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\REST\Settings_Controller.php` on line 100)

### Description

REST callback to update plugin settings.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `\WP_REST_Request` | `$request` | The REST request object. |

---

## videopack_rest_video_gallery

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\REST\Public_Controller.php` on line 201)

### Description

REST callback for video gallery.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `\WP_REST_Request` | `$request` | The REST request object. |

---

## videopack_rest_video_player

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\REST\Public_Controller.php` on line 180)

### Description

*No documentation block found in source file.*

---

## videopack_rest_video_sources

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\REST\Public_Controller.php` on line 225)

### Description

REST callback for video sources.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `\WP_REST_Request` | `$request` | The REST request object. |

---

## videopack_schema_integrated_with_seo

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Frontend\Schema.php` on line 214)

### Description

Filter the SEO integration status.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `bool` | `` | $integrated Whether an SEO plugin was integrated. |
| `array` | `$videos` |     The collected video data. |

---

## videopack_send_to_editor_url

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\Edit_Posts.php` on line 125)

### Description

Filters the URL of the video to be inserted into the Classic Editor.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `string` | `$url` |           The URL of the video to be inserted. |
| `int` | `` |   $attachment_id The attachment ID. |

---

## videopack_settings_schema

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\Options.php` on line 775)

### Description

*No description available.*

- **Since:** `5.0.0`

---

## videopack_settings_tabs

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\Ui.php` on line 509)

### Description

*No description available.*

- **Since:** `5.0.0`

---

## videopack_shared_attributes

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\Ui.php` on line 234)

### Description

*No description available.*

- **Since:** `5.0.0`

---

## videopack_shortcode_atts

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Frontend\Shortcode.php` on line 496)

### Description

Filter the sanitized shortcode attributes.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `array` | `$query_atts` | The sanitized attributes. |

---

## videopack_should_auto_encode_gif

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\Attachment_Processor.php` on line 131)

### Description

*No description available.*

- **Since:** `5.0.0`

---

## videopack_skip_remote_metadata_fetch

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\Attachment_Meta.php` on line 391)

### Description

Filters whether to skip fetching metadata (like duration/dimensions) from a remote URL.  Returning true prevents remote network requests for external video links.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `bool` | `` |  $skip         True to skip remote fetching, false to perform it. |
| `int` | `` |   $post_id      The attachment ID. |
| `string` | `$external_url` | The external video file URL. |

---

## videopack_source_class

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Video_Source\Source_Factory.php` on line 64)

### Description

Allow modification of the source type or direct overriding of the instance creation for custom source types.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `Source|null` | `` |                               $video_source_instance The video source instance. |
| `mixed` | `` |                                     $source                The video source. |
| `array` | `` |                                     $options               The options array. |
| `\Videopack\Admin\Formats\Registry|null` | `$format_registry` |              The video formats registry. |
| `string` | `` |                                    $format                The video format. |
| `bool` | `` |                                      $exists                Whether the source exists. |
| `int|null` | `` |                                  $parent_id             The parent ID. |
| `string` | `` |                                    $source_type           The source type. |

---

## videopack_source_get_download_url

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Video_Source\Source.php` on line 344)

### Description

Returns the video download URL.

- **Since:** `5.0.0`

---

## videopack_source_get_poster

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Video_Source\Source_Attachment.php` on line 270)
- **Other Occurrences:**
  - Videopack Core (`src\Video_Source\Source_Attachment.php` on line 279)
  - Videopack Core (`src\Video_Source\Source_Attachment.php` on line 289)
  - Videopack Core (`src\Video_Source\Source_Attachment.php` on line 295)
  - Videopack Core (`src\Video_Source\Source_Attachment.php` on line 302)
  - Videopack Core (`src\Video_Source\Source_Attachment.php` on line 306)

### Description

Get the poster image URL for the video with fallbacks.  Order of priority: 1. poster_id in _videopack-meta 2. _thumbnail_id (featured image) on the attachment itself 3. legacy _kgflashmediaplayer-poster-id 4. poster URL in _videopack-meta 5. legacy _kgflashmediaplayer-poster URL

- **Since:** `5.0.0`

---

## videopack_source_get_url

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Video_Source\Source.php` on line 335)

### Description

Returns the video URL.

- **Since:** `5.0.0`

---

## videopack_start_encode

- **Type:** `Action`
- **Defined In:** Videopack Core (`src\Admin\Encode\Encode_Attachment.php` on line 947)

### Description

*No description available.*

- **Since:** `5.0.0`

---

## videopack_thumb_desc_type

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\FFmpeg_Thumbnails.php` on line 470)

### Description

Filters the description type suffix for a generated thumbnail file.  Default is 'thumbnail'. Allows customizing attachment description metadata.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `string` | `$desc_type` |       The thumbnail description type label. |
| `string` | `$filename_suffix` | The custom suffix appended to the thumbnail file name. |

---

## videopack_thumb_exists

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\FFmpeg_Thumbnails.php` on line 698)

### Description

Filters whether a thumbnail file actually exists on the filesystem.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `bool` | `` |  $exists True if the file exists, false otherwise. |
| `string` | `$path` |   The absolute filesystem path being checked. |

---

## videopack_url_exists

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Video_Source\Video_Source_Finder.php` on line 37)

### Description

Checks if a URL exists.  Uses a transient to cache the result for a day.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `string` | `$url` | The URL to check. |

---

## videopack_url_to_id

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\Attachment.php` on line 137)

### Description

Filters the attachment ID mapped from a given video URL.  This filter allows custom resolution logic when trying to match an external or local video file URL back to a media library attachment ID.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `int` | `` |   $post_id The detected attachment ID, or 0 if not found. |
| `string` | `$url` |     The video URL being queried. |

---

## videopack_uses_context

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\Ui.php` on line 369)

### Description

*No description available.*

- **Since:** `5.0.0`

---

## videopack_video_codecs

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\Formats\Registry.php` on line 66)

### Description

Filters the registered list of video codec class names.  Add-ons can use this filter to register custom video codecs.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `array` | `$codecs` | Array of fully-qualified codec class names. |

---

## videopack_video_format_suffix

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\Formats\Video_Format.php` on line 203)

### Description

Filters the filename suffix for a generated video format file.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `string` | `$suffix` |     The suffix string (e.g., '_h264_360p'). |
| `string` | `$codec` |      The video codec identifier. |
| `object` | `$resolution` | The resolution configuration object. |

---

## videopack_video_formats

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\Formats\Registry.php` on line 310)

### Description

Filters the complete registered list of output video formats.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `array` | `$video_formats` | Array of Video_Format objects. |

---

## videopack_video_player

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Frontend\Video_Players\Player_Factory.php` on line 52)

### Description

Filter the video player instance.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `Player` | `` |                                    $player       The video player instance. |
| `string` | `` |                                    $embed_method The embed method. |
| `array` | `` |                                     $options      Videopack options array. |
| `\Videopack\Admin\Formats\Registry|null` | `$registry` |     Videopack video formats registry. |

---

## videopack_video_player_classes

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Frontend\Video_Players\Player.php` on line 672)

### Description

Returns the HTML classes for the video element.

- **Since:** `5.0.0`

---

## videopack_video_player_code

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Frontend\Video_Players\Player.php` on line 659)
- **Other Occurrences:**
  - Videopack Core (`src\Frontend\Video_Players\Player.php` on line 613)
  - Videopack Pro (`src\Player\Video_Players\Player_Video_Js_10.php` on line 138)

### Description

Generates the HTML for the video element.

- **Since:** `5.0.0`

---

## videopack_video_player_data

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Frontend\Video_Players\Player.php` on line 567)

### Description

*No documentation block found in source file.*

---

## videopack_video_player_source_attributes

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Frontend\Video_Players\Player.php` on line 759)

### Description

Returns additional attributes for a source element.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `array` | `$source` | The source data. |

---

## videopack_video_player_sources

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Frontend\Video_Players\Player.php` on line 742)

### Description

Generates HTML source elements for the video.

- **Since:** `5.0.0`

---

## videopack_video_player_string_attributes

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Frontend\Video_Players\Player.php` on line 719)

### Description

Returns the string attributes for the video element.

- **Since:** `5.0.0`

---

## videopack_video_player_tracks

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Frontend\Video_Players\Player.php` on line 782)

### Description

Generates HTML track elements for the video.

- **Since:** `5.0.0`

---

## videopack_video_resolutions

- **Type:** `Filter`
- **Defined In:** Videopack Core (`src\Admin\Formats\Registry.php` on line 171)

### Description

Filters the registered list of video resolution objects/configurations.

- **Since:** `5.0.0`

### Parameters

| Type | Parameter Name | Description |
|---|---|---|
| `array` | `$resolutions` | Array of resolution instances or configurations. |

---
