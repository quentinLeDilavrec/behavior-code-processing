"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// browser, nodejs, extension
function constructNodejsPlugin(pluginObjFct, end_of_instrumentation) {
    const acc = new Map();
    return function (b) {
        const pluginObj = pluginObjFct(b, { type: "nodejs" });
        const pre = pluginObj.pre, post = pluginObj.post;
        pluginObj.pre = function () {
            this.store = function (key, value) { acc.set(key, value); };
            !pre || pre.call(this, arguments);
        };
        pluginObj.post = function () {
            !post || post.call(this, arguments);
            !end_of_instrumentation || end_of_instrumentation(acc);
        };
        return pluginObj;
    };
}
exports.constructNodejsPlugin = constructNodejsPlugin;
function constructBrowsersPlugin(pluginObjFct, acc = new Map()) {
    return function (b) {
        const pluginObj = pluginObjFct(b, { type: "browser" });
        const pre = pluginObj.pre, post = pluginObj.post;
        pluginObj.pre = function () {
            this.store = function (key, value) { acc.set(key, value); };
            !pre || pre.call(this, arguments);
        };
        // pluginObj.post = function () {
        //     !post || post.call(this, arguments)
        // }
        return pluginObj;
    };
}
exports.constructBrowsersPlugin = constructBrowsersPlugin;
function constructExtensionPlugin(pluginObjFct, acc = new Map()) {
    return function (b) {
        const pluginObj = pluginObjFct(b, { type: "extension" });
        const pre = pluginObj.pre, post = pluginObj.post;
        pluginObj.pre = function () {
            this.store = function (key, value) { acc.set(key, value); };
            !pre || pre.call(this, arguments);
        };
        // pluginObj.post = function () {
        //     !post || post.call(this, arguments)
        // }
        return pluginObj;
    };
}
exports.constructExtensionPlugin = constructExtensionPlugin;
//# sourceMappingURL=instrumentation.js.map