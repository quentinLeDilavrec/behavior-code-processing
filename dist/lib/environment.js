"use strict";
/**
 * Environment used to write traces on disk, while running test with jest
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs_1 = require("fs");
const utils_1 = require("./utils");
const Environment = require("jest-environment-jsdom");
/**
 *
 * @param s array explore
 * @param c searched element
 * @param n number of c elements to see  (n-1 c element will be ignored)
 */
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
    // // eslint-disable-next-line no-useless-constructor
    constructor(config, x) {
        super(config, x);
        this.output_dir = config.output_dir;
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
                // @ts-ignore
                const testPath = this.global.jasmine.testPath;
                const outPath = path_1.join(this.output_dir, testPath.slice(nthOccIndex(testPath, '/', 4) + 1));
                fs_1.mkdirSync(path_1.dirname(outPath), { recursive: true });
                fs_1.writeFileSync(outPath, this.global.logger.map(utils_1.call2String).join(''), 'utf-8');
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
exports.BehaviorEnvironment = BehaviorEnvironment;
