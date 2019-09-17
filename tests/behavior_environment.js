
/**
 * Example of instantiation of an Environment used to write traces on disk, while running test with jest 
 */


// puppeteer_environment.js
// const NodeEnvironment = require( 'jest-environment-node' );

const glob = require('glob').sync;

// Finds all packages which are transpiled with Babel to force Jest to use their source code.
const transpiledPackageNames = glob('packages/*/src/index.js')
	.map((fileName) => fileName.split('/')[1]);

module.exports = {
	rootDir: '../../',
	moduleNameMapper: {
		[`@wordpress\\/(${transpiledPackageNames.join('|')})$`]: 'packages/$1/src',
	},
	preset: '@wordpress/jest-preset-default',
	setupFiles: [
		'<rootDir>/test/unit/config/gutenberg-phase.js',
	],
	testURL: 'http://localhost',
	testPathIgnorePatterns: [
		'/\.git/',
		'/node_modules/',
		'/packages/e2e-tests',
		'<rootDir>/.*/build/',
		'<rootDir>/.*/build-module/',
		'<rootDir>/.+\.native\.js$',
	],
	testEnvironment: '<rootDir>/behavior_environment.js', // NOTE here is the path to the Environment in charge of writing traces to disk you can load it with `require("behavior-code-processing").environment`
	testEnvironmentOptions: {
		output_dir: '/tmp/behaviorlogs/' // NOTE directory where traces will be saved
	},
};