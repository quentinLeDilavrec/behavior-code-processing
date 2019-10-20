/**
 * Environment used to write traces on disk, while running test with jest
 */
/**
 * External dependencies
 */
import { Config } from '@jest/types';
import Environment from 'jest-environment-jsdom';
export default class BehaviorEnvironment extends Environment {
    output_dir: string;
    testPath: string;
    rootDir: string;
    constructor(config: {
        output_dir: string;
        root_dir: string;
    } & Config.ProjectConfig, context: any);
    setup(): Promise<void>;
    teardown(): Promise<void>;
    runScript(script: any): any;
}
