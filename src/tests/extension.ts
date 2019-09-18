import {  constructExtensionPlugin } from "../instrumentation";
export default constructExtensionPlugin(require("./example_behavior_plugin_made_by_user").default, new Map())

// TODO require + hash + popup to ask for execution of behavior plugin for security reasons