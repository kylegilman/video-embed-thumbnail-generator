import { addFilter } from '@wordpress/hooks';
import * as utils from './utils/utils';
import * as videoCapture from './utils/video-capture';

addFilter('videopack.jsUtils', 'videopack-core/js-utils', (registry) => ({
	...registry,
	...utils,
	...videoCapture,
}));
