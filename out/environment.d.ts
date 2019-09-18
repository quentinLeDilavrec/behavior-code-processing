/**
 * Environment used to write traces on disk, while running test with jest
 */
/**
 * External dependencies
 */
import { Config } from '@jest/types';
import Environment from 'jest-environment-jsdom';
export declare class BehaviorEnvironment extends Environment {
    output_dir: string;
    constructor(config: {
        output_dir: string;
    } & Config.ProjectConfig, x: any);
    setup(): Promise<void>;
    teardown(): Promise<void>;
    runScript(script: any): any;
}