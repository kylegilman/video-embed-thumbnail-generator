import wordpress from '@wordpress/eslint-plugin';

export default [
	{
		ignores: [ '**/build/**', '**/node_modules/**', '**/dist/**', 'package-lock.json' ],
	},
	...wordpress.configs.recommended,
	{
		rules: {
			'camelcase': 'off',
			'no-console': 'off',
			'@wordpress/no-unsafe-wp-apis': 'off',
			'import/no-extraneous-dependencies': 'off',
		},
	},
];
