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
