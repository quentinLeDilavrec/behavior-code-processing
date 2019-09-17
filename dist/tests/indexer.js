"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../lib");
const vscode_1 = require("vscode");
const a = new lib_1.IndexerCollection(require("./example_behavior_plugin_made_by_user").default);
const b = a.get(vscode_1.Uri.parse("./something"));
b.setDocument;
