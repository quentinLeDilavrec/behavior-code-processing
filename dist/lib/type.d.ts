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
    cache: [SerializedLoc, NodePath][];
} & T>;
import { types as t } from "@babel/core";
/**
 * Transform a parameter into an Expression
 * @param param parameter given to a function
 * @return the `Expression` that can be used to retrieve the value of the parameter while inside the function
 */
export declare function param2exp(param: t.Function['params'][0]): t.Expression;
export declare function param2exp(param: t.LVal | t.Expression): t.Expression;
/**
 *
 * @param pusher_identifier the identifer of the function used to log events
 * @param current_file location of the current file
 * @param parameters of the call
 */
export declare const makeLoggerExprGen: (pusher_identifier: string) => (current_file: string, ...parameters: (t.ArrayExpression | t.ArrowFunctionExpression | t.AssignmentExpression | t.AwaitExpression | t.BigIntLiteral | t.BinaryExpression | t.LogicalExpression | t.BindExpression | t.FunctionExpression | t.BooleanLiteral | t.CallExpression | t.ClassExpression | t.ConditionalExpression | t.DoExpression | t.Identifier | t.StringLiteral | t.NumericLiteral | t.NullLiteral | t.RegExpLiteral | t.MemberExpression | t.NewExpression | t.ObjectExpression | t.SequenceExpression | t.ParenthesizedExpression | t.ThisExpression | t.UnaryExpression | t.UpdateExpression | t.MetaProperty | t.Super | t.TaggedTemplateExpression | t.TemplateLiteral | t.YieldExpression | t.TypeCastExpression | t.JSXElement | t.JSXFragment | t.OptionalMemberExpression | t.PipelinePrimaryTopicReference | t.OptionalCallExpression | t.Import | t.TSAsExpression | t.TSTypeAssertion | t.TSNonNullExpression | t.SpreadElement)[]) => t.ExpressionStatement;
