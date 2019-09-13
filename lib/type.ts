export type FunctionName = string
export type ParameterValue = any
export type InterceptedCall = [FunctionName, ...ParameterValue[]]
export type SerializedLoc = string; // .*:[0-9]+:[0-9]+:[0-9]+:[0-9]+
/**
 * Basic context passed to BabelJs plugin extended for behavior analysis
 * the context type allow the used to control how files are instrumented (browser,nodejs)
 * or how sources files are extended with dynamic analysis
 */
export type BehaviorAnalysisContext = { type: 'browser' | 'nodejs' | 'extension' }

import { PluginObj } from "@babel/core";
import { NodePath } from "@babel/traverse";
/**
 * Extent the basic babel `PluginObject` with a cache that collect the id and path of instrumented pieces of code
 */
export type ExtendedPluginObj<T> = PluginObj<{ cache: [SerializedLoc, NodePath][] } & T>

import { types as t } from "@babel/core";

/**
 * Transform a parameter into an Expression
 * @param param parameter given to a function
 * @return the `Expression` that can be used to retrieve the value of the parameter while inside the function
 */
export function param2exp(param: t.Function['params'][0]): t.Expression;
export function param2exp(param: t.LVal | t.Expression): t.Expression;
export function param2exp(param: t.Function['params'][0] | t.LVal | t.Expression): t.Expression {
    if (t.isExpression(param)) {
        return param;
    } else if (t.isObjectPattern(param)) {
        const l: (t.ObjectProperty | t.SpreadElement)[] = [];
        param.properties.forEach((x) => {
            if (t.isObjectProperty(x)) {
                l.push(t.objectProperty(x.key, param2exp(x.value)));
            } else {
                l.push(t.spreadElement(param2exp(x.argument)));
            }
        });
        return t.objectExpression(l);
    } else if (t.isArrayPattern(param)) {
        return t.arrayExpression(param.elements.filter((x) => x !== null).map(param2exp));
    } else if (t.isRestElement(param)) {
        return param2exp(param.argument);
    } else if (t.isAssignmentPattern(param)) {
        return param2exp(param.left);
    } else if (t.isTSParameterProperty(param)) {
        return param2exp(param.parameter);
    } else {
        return param
    }
}

/**
 * 
 * @param pusher_identifier the identifer of the function used to log events
 * @param current_file location of the current file
 * @param parameters of the call
 */
export const makeLoggerExprGen = (pusher_identifier: string) =>
    (current_file: SerializedLoc, ...parameters: (t.Expression | t.SpreadElement)[]) => {
        return t.expressionStatement(
            t.callExpression(t.identifier(pusher_identifier), [
                t.arrayExpression([
                    t.stringLiteral(current_file),
                    ...parameters,
                ]),
            ])
        );
    }