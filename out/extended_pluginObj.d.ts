import { PluginObj } from "@babel/core";
import { NodePath } from "@babel/traverse";
import { SerializedLoc } from "./types";
/**
 * Extent the basic babel `PluginObject` with a cache that collect the id and path of instrumented pieces of code
 */
export declare type ExtendedPluginObj<T> = PluginObj<{
    store: (key: SerializedLoc, value: NodePath) => void;
} & T>;
