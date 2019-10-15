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
import { InterceptedCall } from "./types";
/**
 * transform a call into a string
 * @param call to a function contain function id and parameters
 * @param depth of the serialization of parameters
 */
export declare function call2String(call: InterceptedCall, depth?: number): string;
