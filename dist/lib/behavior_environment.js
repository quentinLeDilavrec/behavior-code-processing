"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Environment used to write traces on disk, while running test with jest
 */
const value_serialization_1 = require("./value_serialization");
// puppeteer_environment.js
// const NodeEnvironment = require( 'jest-environment-node' );
/**
 *  Here is how to integrate this to jest
 *  because its block commented revert * / to the normal thing after uncomment
 *

const glob = require( 'glob' ).sync;

// Finds all packages which are transpiled with Babel to force Jest to use their source code.
const transpiledPackageNames = glob( 'packages/* /src/index.js' )
    .map( ( fileName ) => fileName.split( '/' )[ 1 ] );

module.exports = {
    rootDir: '../../',
    moduleNameMapper: {
        [ `@wordpress\\/(${ transpiledPackageNames.join( '|' ) })$` ]: 'packages/$1/src',
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
        '<rootDir>/.* /build/',
        '<rootDir>/.* /build-module/',
        '<rootDir>/.+\.native\.js$',
    ],
    testEnvironment: '<rootDir>/behavior_environment.js',
};


 */
/**
 * External dependencies
 */
const Environment = require('jest-environment-jsdom');
const { join, dirname } = require('path');
const { writeFileSync, mkdirSync } = require('fs');
const dirName = '/tmp/behaviorlogs/'; // TODO make it a setting
function nthOccIndex(s, c, n) {
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
class BehaviorEnvironment extends Environment {
    // eslint-disable-next-line no-useless-constructor
    constructor(config, x) {
        super(config, x);
    }
    setup() {
        const _super = Object.create(null, {
            setup: { get: () => super.setup }
        });
        return __awaiter(this, void 0, void 0, function* () {
            this.global.logger = [];
            yield _super.setup.call(this);
        });
    }
    teardown() {
        const _super = Object.create(null, {
            teardown: { get: () => super.teardown }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (this.global.logger.length > 0) {
                const testPath = this.global.jasmine.testPath;
                const outPath = join(dirName, testPath.slice(nthOccIndex(testPath, '/', 4) + 1));
                mkdirSync(dirname(outPath), { recursive: true });
                writeFileSync(outPath, this.global.logger.map(value_serialization_1.call2String).join(''), 'utf-8');
                this.global.logger = [];
            }
            yield _super.teardown.call(this);
        });
    }
    runScript(script) {
        // this.global.logger = [];
        const tmp = super.runScript(script);
        // if ( this.global.logger.length > 0 ) {
        // }
        return tmp;
    }
}
module.exports = BehaviorEnvironment;
