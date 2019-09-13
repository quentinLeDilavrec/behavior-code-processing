
import * as Babel from "@babel/core";
import { SerializedLoc } from "./type";
import { NodePath } from "@babel/traverse";
import { BehaviorAnalysisContext, ExtendedPluginObj } from "./type";

// browser, nodejs, extension
export function constructNodejsPlugin<T>(pluginObjFct: ({ types: t }: typeof Babel, ctx: BehaviorAnalysisContext) => ExtendedPluginObj<T>, acc: [SerializedLoc, NodePath][]) {
    return function (b: typeof Babel): ExtendedPluginObj<T> {
        const pluginObj = pluginObjFct(b, { type: "nodejs" })
        const pre = pluginObj.pre, post = pluginObj.post
        pluginObj.pre = function () {
            this.cache = []
            !pre || pre.call(this, arguments)
        }
        pluginObj.post = function () {
            !post || post.call(this, arguments)
            console.log(this.cache)
            acc.push(...this.cache)
        }
        return pluginObj
    }
}
export function constructBrowsersPlugin<T>(pluginObjFct: ({ types: t }: typeof Babel, ctx: BehaviorAnalysisContext) => ExtendedPluginObj<T>, acc: [SerializedLoc, NodePath][]) {
    return function (b: typeof Babel): ExtendedPluginObj<T> {
        const pluginObj = pluginObjFct(b, { type: "browser" })
        const pre = pluginObj.pre, post = pluginObj.post
        pluginObj.pre = function () {
            this.cache = []
            !pre || pre.call(this, arguments)
        }
        pluginObj.post = function () {
            !post || post.call(this, arguments)
            console.log(this.cache)
            acc.push(...this.cache)
        }
        return pluginObj
    }
}
export function constructExtensionPlugin<T>(pluginObjFct: ({ types: t }: typeof Babel, ctx: BehaviorAnalysisContext) => ExtendedPluginObj<T>, acc: [SerializedLoc, NodePath][]) {
    return function (b: typeof Babel): ExtendedPluginObj<T> {
        const pluginObj = pluginObjFct(b, { type: "extension" })
        const pre = pluginObj.pre, post = pluginObj.post
        pluginObj.pre = function () {
            this.cache = []
            !pre || pre.call(this, arguments)
        }
        pluginObj.post = function () {
            !post || post.call(this, arguments)
            console.log(this.cache)
            acc.push(...this.cache)
        }
        return pluginObj
    }
}