import * as Babel from "@babel/core";
import { NodePath, types as bt } from "@babel/core";
import { BehaviorAnalysisContext, ExtendedPluginObj, param2exp, makeLoggerExprGen, SerializedLoc } from "../index";

function getLocation(node: bt.Function, srcName: string): SerializedLoc { // TODO check if it is portable
    const loc = node.loc; // TODO look at this.file.opts.filename if it works
    if (loc) {
        return ((srcName[0] !== '/') ? srcName : srcName.split('/').slice(3).join('/')) + ':' + loc.start.line + ':' + loc.start.column + ':' + loc.end.line + ':' + loc.end.column;
    } else {
        console.error("current node don't possess a location")
        return ((srcName[0] !== '/') ? srcName : srcName.split('/').slice(3).join('/'))
    }
}

export default function ({ types: t }: typeof Babel, behaviorContext: BehaviorAnalysisContext): ExtendedPluginObj<{ counter: number, file: any }> {
    const fs = require("fs");
    const makeLoggerExpr = makeLoggerExprGen(';global.logger.push')//';window.logger'
    return {
        pre(state) {
            this.counter = 0
        },
        visitor: (behaviorContext.type === "extension"
            ? {
                // @ts-ignore
                "ArrowFunctionExpression|FunctionDeclaration|FunctionExpression|ObjectMethod|ClassMethod|ClassPrivateMethod"(
                    path: NodePath<bt.Function>) {
                    // @ts-ignore
                    const loc = getLocation(path.node, this.file.opts.filename)
                    console.log(this)

                    // @ts-ignore
                    this.counter++

                    // @ts-ignore
                    this.cache.push([loc, path]);
                }
            }
            : behaviorContext.type === "nodejs"
                ? {
                    ArrowFunctionExpression(path: NodePath<bt.ArrowFunctionExpression>) {
                        const loc = getLocation(path.node, this.file.opts.filename)
                        this.store(loc, path);
                        this.counter++
                        const v = makeLoggerExpr(
                            loc,
                            ...path.node.params.map(param2exp)
                        );
                        if (path.node.body.type === 'BlockStatement') {
                            path.node.body.body.unshift(v);
                        } else {
                            path.node.body = t.blockStatement([v, t.returnStatement(path.node.body)]);
                        }
                    },
                    // @ts-ignore
                    "FunctionDeclaration|FunctionExpression|ObjectMethod|ClassMethod|ClassPrivateMethod"(
                        path: NodePath<bt.FunctionDeclaration | bt.FunctionExpression | bt.ObjectMethod | bt.ClassMethod | bt.ClassPrivateMethod>) {
                        // @ts-ignore
                        const loc = getLocation(path.node, this.file.opts.filename)
                        // @ts-ignore
                        this.cache.push([loc, path]);
                        // @ts-ignore
                        this.counter++
                        // TODO check if another logger call in same block or children which doesn't go though function declarations
                        // TODO try to mark the outputed code so that it won't be instrumented 2 times
                        path.node.body.body.unshift(
                            makeLoggerExpr(
                                loc,
                                t.spreadElement(t.identifier('arguments'))
                            )
                        );
                    },
                }
                : behaviorContext.type === "browser"
                    ? {
                        // // @ts-ignore
                        // "ArrowFunctionExpression|FunctionDeclaration|FunctionExpression|ObjectMethod|ClassMethod|ClassPrivateMethod"(
                        //     path: NodePath<bt.Function>
                        //     ) {
                        //     const loc = getLocation(path.node, this.file.opts.filename)
                        //     console.log(this)
                        //     this.counter++
                        //     this.cache.push([loc, path]);
                        // }
                    } : {}),
        post(state) {
            console.log(this.counter)
        }
    };
}

