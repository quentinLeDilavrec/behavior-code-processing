"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@babel/core");
function param2exp(param) {
    if (core_1.types.isExpression(param)) {
        return param;
    }
    else if (core_1.types.isObjectPattern(param)) {
        const l = [];
        param.properties.forEach((x) => {
            if (core_1.types.isObjectProperty(x)) {
                l.push(core_1.types.objectProperty(x.key, param2exp(x.value)));
            }
            else {
                l.push(core_1.types.spreadElement(param2exp(x.argument)));
            }
        });
        return core_1.types.objectExpression(l);
    }
    else if (core_1.types.isArrayPattern(param)) {
        return core_1.types.arrayExpression(param.elements.filter((x) => x !== null).map(param2exp));
    }
    else if (core_1.types.isRestElement(param)) {
        return param2exp(param.argument);
    }
    else if (core_1.types.isAssignmentPattern(param)) {
        return param2exp(param.left);
    }
    else if (core_1.types.isTSParameterProperty(param)) {
        return param2exp(param.parameter);
    }
    else {
        return param;
    }
}
exports.param2exp = param2exp;
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
function replacer(depth = Number.MAX_SAFE_INTEGER) {
    let objects, stack, keys;
    return function (key, value) {
        //  very first iteration
        if (key === '') {
            keys = ['root'];
            objects = [{ keys: 'root', value }];
            stack = [];
            return value;
        }
        //  From the JSON.stringify's doc: "The object in which the key was found is
        //  provided as the replacer's this parameter."
        //  Thus one can control the depth
        while (stack.length && this !== stack[0]) {
            stack.shift();
            keys.pop();
        }
        // console.log( keys.join('.') );
        const type = typeof value;
        if (type === 'boolean' || type === 'number' || type === 'string') {
            return value;
        }
        if (type === 'function') {
            return `[Function, ${value.length + 1} args]`;
        }
        if (value === null) {
            return 'null';
        }
        if (!value) {
            return undefined;
        }
        if (stack.length >= depth) {
            if (Array.isArray(value)) {
                return `[Array(${value.length})]`;
            }
            return `[Object, ${Object.keys(value).length} entries]`;
        }
        const found = objects.find((o) => o.value === value);
        if (!found) {
            keys.push(key);
            stack.unshift(value);
            objects.push({ keys: keys.join('.'), value });
            return value;
        }
        // actually, here's the only place where the keys keeping is useful
        return `[Duplicate: ${found.keys}]`;
    };
}
;
/**
 * transform a call into a string
 * @param call to a function contain function id and parameters
 * @param depth of the serialization of parameters
 */
function call2String(call, depth = 0) {
    return '' + call[0] + (call.length > 1 ? ' ' + JSON.stringify(call.slice(1), replacer(depth)) : '');
}
exports.call2String = call2String;
;
//# sourceMappingURL=utils.js.map