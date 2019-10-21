import * as Babel from "@babel/core";
import { NodePath } from "@babel/core";
import { BehaviorAnalysisContext, ExtendedPluginObj, SerializedLoc } from "../index";
export declare function constructNodejsPlugin<T>(pluginObjFct: ({ types: t }: typeof Babel, ctx: BehaviorAnalysisContext) => ExtendedPluginObj<T>, end_of_instrumentation?: (accumulator: Map<SerializedLoc, NodePath>) => void): (b: typeof Babel) => Babel.PluginObj<{
    store: (key: string, value: Babel.NodePath<Babel.types.Node>) => void;
} & T>;
/**
 *
 * @param pusher_identifier the identifer of the function used to log events
 * @param current_file location of the current file
 * @param parameters of the call
 */
export declare const makeLoggerExprGen: (pusher_identifier: string) => (current_file: string, ...parameters: (Babel.types.ArrayExpression | Babel.types.ArrowFunctionExpression | Babel.types.AssignmentExpression | Babel.types.AwaitExpression | Babel.types.BigIntLiteral | Babel.types.BinaryExpression | Babel.types.LogicalExpression | Babel.types.BindExpression | Babel.types.FunctionExpression | Babel.types.BooleanLiteral | Babel.types.CallExpression | Babel.types.ClassExpression | Babel.types.ConditionalExpression | Babel.types.DoExpression | Babel.types.Identifier | Babel.types.StringLiteral | Babel.types.NumericLiteral | Babel.types.NullLiteral | Babel.types.RegExpLiteral | Babel.types.MemberExpression | Babel.types.NewExpression | Babel.types.ObjectExpression | Babel.types.SequenceExpression | Babel.types.ParenthesizedExpression | Babel.types.ThisExpression | Babel.types.UnaryExpression | Babel.types.UpdateExpression | Babel.types.MetaProperty | Babel.types.Super | Babel.types.TaggedTemplateExpression | Babel.types.TemplateLiteral | Babel.types.YieldExpression | Babel.types.TypeCastExpression | Babel.types.JSXElement | Babel.types.JSXFragment | Babel.types.OptionalMemberExpression | Babel.types.PipelinePrimaryTopicReference | Babel.types.OptionalCallExpression | Babel.types.Import | Babel.types.TSAsExpression | Babel.types.TSTypeAssertion | Babel.types.TSNonNullExpression | Babel.types.SpreadElement)[]) => Babel.types.ExpressionStatement;
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
