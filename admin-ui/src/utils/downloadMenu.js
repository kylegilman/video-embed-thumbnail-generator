/**
 * Format a resolution value the same way as video-quality-selector.js res_label.
 *
 * @param {string|number} res Resolution value.
 * @return {string} Display label.
 */
export function formatDownloadResolutionLabel(res) {
	if (res === undefined || res === null || res === '') {
		return '';
	}
	const value = String(res);
	if (/^\d+$/.test(value)) {
		return `${value}p`;
	}
	return value;
}

/**
 * Build a download item from a player source entry.
 *
 * @param {Object} source Player source object.
 * @return {{label: string, src: string}|null} Menu item or null if not downloadable.
 */
function sourceToDownloadItem(source) {
	const resolution = source.resolution || source['data-res'];
	const src = source.src || source.url || '';
	if (!resolution || !src) {
		return null;
	}
	return {
		label: formatDownloadResolutionLabel(resolution),
		src,
	};
}

/**
 * Sort download items by resolution descending (matches quality selector).
 *
 * @param {Array} items Download items.
 * @return {Array} Sorted items.
 */
function sortDownloadItems(items) {
	return [...items].sort((a, b) => {
		const aNum = parseInt(String(a.label), 10);
		const bNum = parseInt(String(b.label), 10);
		if (Number.isNaN(aNum) || Number.isNaN(bNum)) {
			return 0;
		}
		return bNum - aNum;
	});
}

/**
 * Build download menu structure from player source_groups (same rules as quality selector).
 *
 * @param {Object} sourceGroups Grouped sources { codecId: { label, sources } }.
 * @return {{hasMultipleCodecs: boolean, groups: Array, flatItems: Array}} Menu structure.
 */
export function buildDownloadMenuFromSourceGroups(sourceGroups) {
	if (
		!sourceGroups ||
		typeof sourceGroups !== 'object' ||
		Array.isArray(sourceGroups)
	) {
		return { hasMultipleCodecs: false, groups: [], flatItems: [] };
	}

	const groupIds = Object.keys(sourceGroups);

	if (groupIds.length > 1) {
		const groups = groupIds
			.map((groupId) => {
				const group = sourceGroups[groupId] || {};
				const items = sortDownloadItems(
					(group.sources || [])
						.map(sourceToDownloadItem)
						.filter(Boolean)
				);
				return {
					id: groupId,
					label: group.label || groupId,
					items,
				};
			})
			.filter((group) => group.items.length > 0);

		return {
			hasMultipleCodecs: groups.length > 1,
			groups,
			flatItems: [],
		};
	}

	const flatItems = [];
	groupIds.forEach((groupId) => {
		const group = sourceGroups[groupId] || {};
		(group.sources || []).forEach((source) => {
			const item = sourceToDownloadItem(source);
			if (item) {
				flatItems.push(item);
			}
		});
	});

	return {
		hasMultipleCodecs: false,
		groups: [],
		flatItems: sortDownloadItems(flatItems),
	};
}

/**
 * Mock menu items for editor preview when no sources are loaded.
 *
 * @return {Array} Mock flat items.
 */
export function getMockDownloadMenuItems() {
	return [
		{ label: '1080p', src: '#' },
		{ label: '720p', src: '#' },
		{ label: '480p', src: '#' },
	];
}
