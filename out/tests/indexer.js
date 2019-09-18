"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const vscode_1 = require("vscode");
const a = new __1.IndexerCollection(require("./example_behavior_plugin_made_by_user").default);
const b = a.get(vscode_1.Uri.parse("./something"));
b.setDocument;
//# sourceMappingURL=indexer.js.map