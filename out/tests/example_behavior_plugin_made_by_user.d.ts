import * as Babel from "@babel/core";
import { BehaviorAnalysisContext, ExtendedPluginObj } from "../index";
export declare function extendedPlugin({ types: t }: typeof Babel, behaviorContext: BehaviorAnalysisContext): ExtendedPluginObj<{
    counter: number;
    file: any;
}>;
declare const _default: (b: typeof Babel) => Babel.PluginObj<{
    store: (key: string, value: Babel.NodePath<Babel.types.Node>) => void;
} & {
    counter: number;
    file: any;
}>;
export default _default;
