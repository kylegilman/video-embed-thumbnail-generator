import Pagination from './components/Pagination/Pagination';
import CollectionSettingsPanel from './components/InspectorControls/CollectionSettingsPanel';
import CompactColorPicker from './components/CompactColorPicker/CompactColorPicker';
import Thumbnails from './components/Thumbnails/Thumbnails';
import * as utils from './utils/utils';
import * as videoCapture from './utils/video-capture';
import * as icons from './assets/icon';

window.videopack = Object.assign(window.videopack || {}, {
	components: {
		...(window.videopack?.components || {}),
		Pagination,
		CollectionSettingsPanel,
		CompactColorPicker,
		Thumbnails,
	},
	utils: {
		...(window.videopack?.utils || {}),
		...utils,
		...videoCapture,
	},
	icons: {
		...(window.videopack?.icons || {}),
		...icons,
	},
});
