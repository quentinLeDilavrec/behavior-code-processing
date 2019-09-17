"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const instrumentation_1 = require("../lib/instrumentation");
exports.default = instrumentation_1.constructExtensionPlugin(require("./example_behavior_plugin_made_by_user").default, []);
// TODO require + hash + popup to ask for execution of behavior plugin for security reasons
