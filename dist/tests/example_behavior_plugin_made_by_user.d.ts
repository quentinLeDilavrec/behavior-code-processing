import * as Babel from "@babel/core";
import { BehaviorAnalysisContext, ExtendedPluginObj } from "../lib/index";
export default function ({ types: t }: typeof Babel, behaviorContext: BehaviorAnalysisContext): ExtendedPluginObj<{
    counter: number;
    file: any;
}>;
