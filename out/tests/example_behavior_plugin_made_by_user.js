"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@babel/core");
// TODO compile it as self contained (webpack?), caution with deps
// TODO remove duplicate param2exp and constructNodejsPlugin when webpack is configured
// least common ancestor path to all of instrumented functions in the codebase, as an absolute path
const lca_path = "";
if (lca_path === "") {
    throw new Error("Please give a path to the least common ancestor to all functions in the codebase (make traces independent from where the codebase lie on this computer), must be absolute");
}
function constructNodejsPlugin(pluginObjFct, end_of_instrumentation) {
    const acc = new Map();
    return function (b) {
        const pluginObj = pluginObjFct(b, { type: "nodejs" });
        const pre = pluginObj.pre, post = pluginObj.post;
        pluginObj.pre = function () {
            this.store = function (key, value) { acc.set(key, value); };
            !pre || pre.call(this, arguments);
        };
        pluginObj.post = function () {
            !post || post.call(this, arguments);
            !end_of_instrumentation || end_of_instrumentation(acc);
        };
        return pluginObj;
    };
}
exports.constructNodejsPlugin = constructNodejsPlugin;
function getLocation(node, srcName, lca_path) {
    const loc = node.loc; // TODO look at this.file.opts.filename if it works
    if (loc) {
        return srcName.slice(lca_path.length) + ':' + loc.start.line + ':' + loc.start.column + ':' + loc.end.line + ':' + loc.end.column;
    }
    else {
        console.error("current node don't possess a location");
        return srcName.slice(lca_path.length);
    }
}
/**
 *
 * @param pusher_identifier the identifer of the function used to log events
 * @param current_file location of the current file
 * @param parameters of the call
 */
exports.makeLoggerExprGen = (pusher_identifier) => (current_file, ...parameters) => {
    return core_1.types.expressionStatement(core_1.types.callExpression(core_1.types.identifier(pusher_identifier), [
        core_1.types.arrayExpression([
            core_1.types.stringLiteral(current_file),
            ...parameters,
        ]),
    ]));
};
function extendedPlugin({ types: t }, behaviorContext) {
    const makeLoggerExpr = exports.makeLoggerExprGen(behaviorContext.type === "browser" ? ';window.logger' : ';global.logger.push');
    function param2exp(param) {
        if (t.isExpression(param)) {
            return param;
        }
        else if (t.isObjectPattern(param)) {
            const l = [];
            param.properties.forEach((x) => {
                if (t.isObjectProperty(x)) {
                    l.push(t.objectProperty(x.key, param2exp(x.value)));
                }
                else {
                    l.push(t.spreadElement(param2exp(x.argument)));
                }
            });
            return t.objectExpression(l);
        }
        else if (t.isArrayPattern(param)) {
            return t.arrayExpression(param.elements.filter((x) => x !== null).map(param2exp));
        }
        else if (t.isRestElement(param)) {
            return param2exp(param.argument);
        }
        else if (t.isAssignmentPattern(param)) {
            return param2exp(param.left);
        }
        else if (t.isTSParameterProperty(param)) {
            return param2exp(param.parameter);
        }
        else {
            return param;
        }
    }
    return {
        pre(state) {
            this.counter = 0;
        },
        visitor: (behaviorContext.type === "extension"
            ? {
                // @ts-ignore
                Function(path) {
                    const loc = getLocation(path.node, 
                    // @ts-ignore
                    this.file.opts.filename, lca_path);
                    // @ts-ignore
                    this.store(loc, path);
                }
            }
            : behaviorContext.type === "nodejs"
                ? {
                    ArrowFunctionExpression(path) {
                        const loc = getLocation(path.node, this.file.opts.filename, lca_path);
                        this.store(loc, path);
                        this.counter++;
                        const v = makeLoggerExpr(loc, ...path.node.params.map(param2exp));
                        if (path.node.body.type === 'BlockStatement') {
                            path.node.body.body.unshift(v);
                        }
                        else {
                            path.node.body = t.blockStatement([v, t.returnStatement(path.node.body)]);
                        }
                    },
                    // @ts-ignore
                    "FunctionDeclaration|FunctionExpression|ObjectMethod|ClassMethod|ClassPrivateMethod"(path) {
                        // @ts-ignore
                        const loc = getLocation(path.node, this.file.opts.filename);
                        // @ts-ignore
                        this.store(loc, path);
                        // @ts-ignore
                        this.counter++;
                        // TODO check if another logger call in same block or children which doesn't go though function declarations
                        // TODO try to mark the outputed code so that it won't be instrumented 2 times
                        path.node.body.body.unshift(makeLoggerExpr(loc, t.spreadElement(t.identifier('arguments'))));
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
            console.log(this.counter);
        }
    };
}
exports.extendedPlugin = extendedPlugin;
// const dir = __dirname.split(/\//g).slice(0, -2).join('/');
// // NOTE make sure that the instrumentation is done only one time.
// // one could look a the ast to detect such double instrumentation but considering transformations in between each pass makes it non-trivial.
//  default (process.argv &&
//     process.argv[1] !== dir + '/node_modules/.bin/babel' &&
//     process.argv[1] !== dir + '/bin/packages/build.js' &&
//     process.argv[1] !== dir + '/node_modules/worker-farm/lib/child/index.js' &&
//     process.argv[1] !== dir + '/node_modules/jest-worker/build/workers/processChild.js' &&
//     process.argv[1] !== dir + '/packages/scripts/scripts/test-unit-js.js') ?
//     function () { return {}; } :
//     constructNodejsPlugin(extendedPlugin,(locations)=>{
//         console.log(locations.keys());
//     });
exports.default = constructNodejsPlugin(extendedPlugin, (locations) => {
    console.log(locations.keys());
});
//# sourceMappingURL=example_behavior_plugin_made_by_user.js.map