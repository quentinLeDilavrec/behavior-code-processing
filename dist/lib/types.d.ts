export declare type FunctionName = string;
export declare type ParameterValue = any;
export declare type InterceptedCall = [FunctionName, ...ParameterValue[]];
export declare type SerializedLoc = string;
/**
 * Basic context passed to BabelJs plugin extended for behavior analysis
 * the context type allow the used to control how files are instrumented (browser,nodejs)
 * or how sources files are extended with dynamic analysis
 */
export declare type BehaviorAnalysisContext = {
    type: 'browser' | 'nodejs' | 'extension';
};
import { PluginObj } from "@babel/core";
import { NodePath } from "@babel/traverse";
/**
 * Extent the basic babel `PluginObject` with a cache that collect the id and path of instrumented pieces of code
 */
export declare type ExtendedPluginObj<T> = PluginObj<{
    store: (key: SerializedLoc, value: NodePath) => void;
} & T>;
