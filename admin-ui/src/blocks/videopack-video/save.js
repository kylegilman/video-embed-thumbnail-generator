/**
 * The save function defines the way in which the different attributes should
 * be combined into the final markup, which is then serialized by the block
 * editor into `post_content`.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/block-edit-save/#save
 *
 * @param {Object} props          The properties passed to the component.
 * @param {Object} props.attributes The block attributes.
 * @return {WPElement} Element to render.
 */
export default function save( { attributes } ) {
	// Returning null because this is a dynamic block.
	// The view is rendered on the server via a render_callback in PHP.
	return null;
}
