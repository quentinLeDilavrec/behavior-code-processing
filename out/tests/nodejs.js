"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const instrumentation_1 = require("../instrumentation");
const example_behavior_plugin_made_by_user_1 = __importDefault(require("./example_behavior_plugin_made_by_user"));
const dir = __dirname.split(/\//g).slice(0, -2).join('/');
// NOTE make sure that the instrumentation is done only one time.
// one could look a the ast to detect such double instrumentation but considering transformations in between each pass makes it non-trivial.
exports.default = (process.argv &&
    process.argv[1] !== dir + '/node_modules/.bin/babel' &&
    process.argv[1] !== dir + '/bin/packages/build.js' &&
    process.argv[1] !== dir + '/node_modules/worker-farm/lib/child/index.js' &&
    process.argv[1] !== dir + '/node_modules/jest-worker/build/workers/processChild.js' &&
    process.argv[1] !== dir + '/packages/scripts/scripts/test-unit-js.js') ?
    function () { return {}; } :
    instrumentation_1.constructNodejsPlugin(example_behavior_plugin_made_by_user_1.default);
//# sourceMappingURL=nodejs.js.map