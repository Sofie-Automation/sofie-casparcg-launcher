/* eslint-disable n/no-unpublished-import */
import { generateEslintConfig } from '@sofie-automation/code-standard-preset/eslint/main.mjs'

const extendedRules = await generateEslintConfig({
	ignores: [
		'**/*.vue', // typescript-eslint doesn't understand .vue files
	],
})

extendedRules.push({
	files: ['src/renderer/**/*.js', 'src/**/*.vue'],
	settings: {
		node: {
			tryExtensions: ['.js', '.json', '.node', '.vue'],
		},
	},
	rules: {
		'n/no-missing-import': 'off', // Doesnt understand .vue file extensions
	},
})

export default extendedRules
