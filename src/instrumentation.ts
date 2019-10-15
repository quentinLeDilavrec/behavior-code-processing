
import * as Babel from "@babel/core";
import { SerializedLoc } from "./types";
import { NodePath } from "@babel/traverse";
import { BehaviorAnalysisContext } from "./types";
import { ExtendedPluginObj } from "./extended_pluginObj";


// browser, nodejs, extension
export function constructNodejsPlugin<T>(
    pluginObjFct: ({ types: t }: typeof Babel, ctx: BehaviorAnalysisContext) => ExtendedPluginObj<T>,
    end_of_instrumentation?:(accumulator:Map<SerializedLoc, NodePath>)=>void
) {
    const acc: Map<SerializedLoc, NodePath> = new Map()
    return function (b: typeof Babel): ExtendedPluginObj<T> {
        const pluginObj = pluginObjFct(b, { type: "nodejs" })
        const pre = pluginObj.pre, post = pluginObj.post
        pluginObj.pre = function () {
            this.store = function (key, value) { acc.set(key, value) }
            !pre || pre.call(this, arguments)
        }
        pluginObj.post = function () {
            !post || post.call(this, arguments);
            !end_of_instrumentation || end_of_instrumentation(acc);
        }
        return pluginObj
    }
}
export function constructBrowsersPlugin<T>(
    pluginObjFct: ({ types: t }: typeof Babel, ctx: BehaviorAnalysisContext) => ExtendedPluginObj<T>,
    acc: Map<SerializedLoc, NodePath> = new Map()) {
    return function (b: typeof Babel): ExtendedPluginObj<T> {
        const pluginObj = pluginObjFct(b, { type: "browser" })
        const pre = pluginObj.pre, post = pluginObj.post
        pluginObj.pre = function () {
            this.store = function (key, value) { acc.set(key, value) }
            !pre || pre.call(this, arguments)
        }
        // pluginObj.post = function () {
        //     !post || post.call(this, arguments)
        // }
        return pluginObj
    }
}
export function constructExtensionPlugin<T>(
    pluginObjFct: ({ types: t }: typeof Babel, ctx: BehaviorAnalysisContext) => ExtendedPluginObj<T>,
    acc: Map<SerializedLoc, NodePath> = new Map()) {
    return function (b: typeof Babel): ExtendedPluginObj<T> {
        const pluginObj = pluginObjFct(b, { type: "extension" })
        const pre = pluginObj.pre, post = pluginObj.post
        pluginObj.pre = function () {
            this.store = function (key, value) { acc.set(key, value) }
            !pre || pre.call(this, arguments)
        }
        // pluginObj.post = function () {
        //     !post || post.call(this, arguments)
        // }
        return pluginObj
    }
}