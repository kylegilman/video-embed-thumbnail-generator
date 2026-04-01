/**
 * Main entry point for the classic embed feature.
 */

import { createRoot } from '@wordpress/element';
import ClassicEmbed from './components/ClassicEmbed';
import './classic-embed.scss';

const initClassicEmbed = () => {
	const container = document.getElementById('videopack-classic-embed-root');
	if (container) {
		const config = window.videopack_classic_editor_config || {};
		const root = createRoot(container);
		root.render(
			<ClassicEmbed
				options={config.options || {}}
				postId={config.postId}
				activeTab={config.activeTab}
			/>
		);
	}
};

if (
	document.readyState === 'complete' ||
	document.readyState === 'interactive'
) {
	initClassicEmbed();
} else {
	document.addEventListener('DOMContentLoaded', initClassicEmbed);
}
