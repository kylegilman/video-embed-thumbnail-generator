const { getWebpackEntryPoints } = require('@wordpress/scripts/utils');
const fs = require('fs');
const entryPoints = getWebpackEntryPoints();
fs.writeFileSync('entry-debug.json', JSON.stringify(entryPoints, null, 2));
console.log('Written to entry-debug.json');
