import { InterceptedCall } from "./type";
/**
 * transform a call into a string
 * @param call to a function contain function id and parameters
 * @param depth of the serialization of parameters
 */
export declare function call2String(call: InterceptedCall, depth?: number): string;
