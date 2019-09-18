/**
 * Environment used to write traces on disk, while running test with jest 
 */

/**
 * External dependencies
 */
import { Config } from '@jest/types';
import { join, dirname } from 'path';
import { writeFileSync, mkdirSync } from 'fs';
import { call2String } from "./utils";
import Environment from 'jest-environment-jsdom';
/**
 * 
 * @param s array explore
 * @param c searched element 
 * @param n number of c elements to see  (n-1 c element will be ignored)
 */
function nthOccIndex<T>(s: T[], c: T, n: number) {
	let i = 0;
	let count = 0;
	while (true) {
		if (s[i] === c) {
			count++;
		}
		if (count === n) {
			return i;
		}
		if (i >= s.length) {
			return -1;
		}
		i++;
	}
}

export class BehaviorEnvironment extends Environment {
	output_dir:string;
	// // eslint-disable-next-line no-useless-constructor
	constructor(config: {output_dir:string}&Config.ProjectConfig, x: any) {
		super(config, x);
		this.output_dir=config.output_dir
	}

	async setup() {
		this.global.logger = [];
		await super.setup();
	}

	async teardown() {
		if (this.global.logger.length > 0) {
			// @ts-ignore
			const testPath = this.global.jasmine.testPath;
			const outPath = join(this.output_dir, testPath.slice(nthOccIndex(testPath, '/', 4) + 1));
			mkdirSync(dirname(outPath), { recursive: true });
			writeFileSync(
				outPath,
				this.global.logger.map(call2String).join(''),
				'utf-8');
			this.global.logger = [];
		}
		await super.teardown();
	}

	runScript(script: any) {
		// this.global.logger = [];
		const tmp = super.runScript(script);
		// if ( this.global.logger.length > 0 ) {
		// }
		return tmp;
	}
}
