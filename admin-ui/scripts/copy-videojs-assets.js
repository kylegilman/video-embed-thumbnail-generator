const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../node_modules/video.js/dist');
const destDir = path.resolve(__dirname, '../../video-js');

// Helper to copy a file
function copyFile(src, dest) {
	fs.copyFileSync(src, dest);
	console.log(`Copied ${path.relative(process.cwd(), src)} to ${path.relative(process.cwd(), dest)}`);
}

// Ensure destination directories exist
if (!fs.existsSync(destDir)) {
	fs.mkdirSync(destDir, { recursive: true });
}
const destLangDir = path.join(destDir, 'lang');
if (!fs.existsSync(destLangDir)) {
	fs.mkdirSync(destLangDir, { recursive: true });
}

// Copy css and js
copyFile(path.join(srcDir, 'video-js.min.css'), path.join(destDir, 'video-js.min.css'));
copyFile(path.join(srcDir, 'video.min.js'), path.join(destDir, 'video.min.js'));

// Copy all .js files from lang/
const srcLangDir = path.join(srcDir, 'lang');
if (fs.existsSync(srcLangDir)) {
	const files = fs.readdirSync(srcLangDir);
	files.forEach(file => {
		if (file.endsWith('.js')) {
			copyFile(path.join(srcLangDir, file), path.join(destLangDir, file));
		}
	});
}
