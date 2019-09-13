import { InterceptedCall } from "./type";

function replacer(depth = Number.MAX_SAFE_INTEGER) {
  let objects: { keys: any; value: any; }[], stack: any[], keys: string[];
  return function (this:any, key: string, value: any | null) {
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
export function call2String(call:InterceptedCall,depth=0):string {
  return '' + call[0] + (call.length > 1 ? ' ' + JSON.stringify(call.slice(1), replacer(depth)) : '');
};