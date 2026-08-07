# Developer Guide: Adding Settings via Add-ons

This guide explains how to correctly register and manage custom settings in Videopack from an add-on plugin (like Videopack Pro).

## The Settings Architecture

Videopack uses a centralized settings manager (`Videopack\Admin\Options`) that synchronizes data between the WordPress database, the React-based Admin UI, and the REST API.

### 1. Registering Default Values

To add a new setting, your add-on should hook into the `videopack_default_options` filter. This ensures that your setting is recognized by the base plugin and provided with a fallback value.

**Example:**
```php
add_filter( 'videopack_default_options', function( $defaults ) {
    $defaults['my_custom_setting'] = 'default_value';
    return $defaults;
} );
```

### 2. Defining the REST API Schema

The Videopack Admin UI relies on the WordPress REST API (`/wp/v2/settings`). For your custom setting to be visible and editable in the UI, you must define its schema via the `videopack_settings_schema` filter.

**Example:**
```php
add_filter( 'videopack_settings_schema', function( $schema, $defaults ) {
    $schema['my_custom_setting'] = array(
        'type'    => 'string',
        'default' => 'default_value',
    );
    return $schema;
}, 10, 2 );
```

> [!IMPORTANT]
> The base plugin automatically performs recursive sanitization based on this schema. If you define a setting as a `number`, the API will reject non-numeric strings automatically.

### 3. Timing and Hook Priorities

The base plugin registers its settings at `init` priority **20**. To ensure your settings are included in the schema:

1.  **Filters**: Register your `videopack_default_options` and `videopack_settings_schema` hooks at `init` priority **10** (default) or earlier.
2.  **Avoid rest_api_init**: Do not rely on `rest_api_init` for settings registration logic, as it often fires before the necessary filters have been applied.

### 4. Data Persistence

The base plugin implements a "corruption protection" layer. Any key present in the database that is **not** found in the defaults list will be stripped out during the `init` sequence (specifically at `init:15`). 

This is why step #1 (Registering Defaults) is critical—if you skip it, your data will be deleted from the database shortly after the plugin boots.

### 5. Dynamic Objects and Dictionaries

If your setting is an object with dynamic keys (e.g., a dictionary of values where the keys are not known in advance), you should use the `additionalProperties` keyword in your schema.

**Example:**
```php
$schema['my_dictionary'] = array(
    'type'                 => 'object',
    'additionalProperties' => array( 'type' => 'number' ),
);
```

> [!TIP]
> Whenever possible, it is better to **dynamically explicitly define** the properties in your schema by querying the same registries (like `Formats\Registry`) used for your defaults. This ensures that every key is recognized as a primary property, leading to more robust sanitization and better compatibility with the Admin UI.

### 6. Structural Alignment

Your schema must structure objects exactly as they appear in your defaults. If a default value is an associative array (key-value pairs), the schema type must be `object`. If the default value is a simple list (index-based array), the schema type must be `array`. 

> [!WARNING]
> If your default value is an empty associative array intended to be an object, cast it to an object in PHP: `(object) array()`. This ensures it is serialized as `{}` instead of `[]` in JSON, which is required for the REST API to validate it against an `object` schema.

## Checklist for New Settings

- [ ] Add the key and default value to the `videopack_default_options` filter.
- [ ] Add the type definition and schema to the `videopack_settings_schema` filter.
- [ ] For complex objects, use dynamic generation or `additionalProperties`.
- [ ] Ensure your hooks are registered at or before the `init` action.
- [ ] (Optional) Add a custom `sanitize_callback` via the `videopack_sanitize_options` filter if specialized validation is required.
