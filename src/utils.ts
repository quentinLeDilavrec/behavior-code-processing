
import { types as t, NodePath } from "@babel/core";
import { SerializedLoc } from "./types";
import { Location, Uri, Range, Position } from "vscode";

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

export function serializeNodePath(uri: Uri, path: NodePath): SerializedLoc {
  if (path.node.loc === null)
    throw new Error("There is no location in this node.");

  return uri.toString(false) +
    ':' + path.node.loc.start.line +
    ':' + path.node.loc.start.column +
    ':' + path.node.loc.end.line +
    ':' + path.node.loc.end.column;
}

export function parseLoc(id: SerializedLoc): Location {
  const exploded = id.split(/:/g)
  if (exploded.length < 3) {
    throw new Error("no Range in " + id);
  }
  if (exploded.length = 3) {
    return new Location(
      Uri.file(exploded[0]),
      new Position(parseInt(exploded[1]), parseInt(exploded[2])));
  }
  if (exploded.length = 4) {
    return new Location(
      Uri.file(exploded[0] + ':' + exploded[1]),
      new Position(parseInt(exploded[2]), parseInt(exploded[3])));
  }
  if (exploded.length = 5) {
    return new Location(
      Uri.file(exploded[0]), new Range(
        new Position(parseInt(exploded[1]), parseInt(exploded[2])),
        new Position(parseInt(exploded[3]), parseInt(exploded[4]))));
  }
  if (exploded.length < 5) {
    throw new Error("missing Positions");
  }
  if (exploded.length > 6) {
    throw new Error("to much separator in " + id);
  }
  if (exploded.length = 6) {
    return new Location(
      Uri.file(exploded[0] + ':' + exploded[1]), new Range(
        new Position(parseInt(exploded[2]), parseInt(exploded[3])),
        new Position(parseInt(exploded[4]), parseInt(exploded[5]))));
  }
  return new Location(
    Uri.file(exploded[0]), new Range(
      new Position(parseInt(exploded[1]), parseInt(exploded[2])),
      new Position(parseInt(exploded[3]), parseInt(exploded[4]))));
}
export function serializeLoc(loc: Location): SerializedLoc {
  return (loc.uri.toString(false)
    + ':' + (loc.range.start.line)
    + ':' + (loc.range.start.character)
    + ':' + (loc.range.end.line)
    + ':' + (loc.range.end.character));
}

export function nodePath2Range(path: NodePath): Range {
  if (!path.node.loc) { throw new Error("no location in " + path); }
  return new Range(
    new Position(path.node.loc.start.line, path.node.loc.start.column),
    new Position(path.node.loc.end.line, path.node.loc.end.column));
}

import { InterceptedCall } from "./types";

function replacer(depth = Number.MAX_SAFE_INTEGER) {
  let objects: { keys: any; value: any; }[], stack: any[], keys: string[];
  return function (this: any, key: string, value: any | null) {
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
};

/**
 * transform a call into a string
 * @param call to a function contain function id and parameters
 * @param depth of the serialization of parameters
 */
export function call2String(call: InterceptedCall, depth = 0): string {
  return '' + call[0] + (call.length > 1 ? ' ' + JSON.stringify(call.slice(1), replacer(depth)) : '');
};