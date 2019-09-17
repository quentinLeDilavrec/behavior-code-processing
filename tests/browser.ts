import {  constructExtensionPlugin } from "../lib/instrumentation";
export default constructExtensionPlugin(require("./example_behavior_plugin_made_by_user").default, new Map())