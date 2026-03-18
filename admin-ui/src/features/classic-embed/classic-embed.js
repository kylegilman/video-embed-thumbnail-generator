/**
 * Main entry point for the classic embed feature.
 */

import { createRoot } from '@wordpress/element';
import ClassicEmbed from './components/ClassicEmbed';
import './classic-embed.scss';

document.addEventListener('DOMContentLoaded', () => {
	const container = document.getElementById('videopack-classic-embed-root');
	if (container) {
		const config = window.videopack_classic_embed_config || {};
		const root = createRoot(container);
		root.render(
			<ClassicEmbed
				options={config.options || {}}
				postId={config.postId}
				activeTab={config.activeTab}
			/>
		);
	}
});
