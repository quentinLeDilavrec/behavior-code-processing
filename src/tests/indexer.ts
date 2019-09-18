import { IndexerCollection } from "..";
import { Uri } from "vscode";

const a = new IndexerCollection(require("./example_behavior_plugin_made_by_user").default)

const b = a.get(Uri.parse("./something"))

b.setDocument