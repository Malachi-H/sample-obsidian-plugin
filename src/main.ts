import {
	App,
	Editor,
	EventRef,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import "@total-typescript/ts-reset";
import "@total-typescript/ts-reset/dom";
import { MySettingManager } from "@/SettingManager";
export default class MyPlugin extends Plugin {
	private eventRefs: EventRef[] = [];
	async onload() {
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: "export-censored-document",
			name: "Export Censored Document",
			checkCallback: (checking: boolean) => {
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					if (!checking) {
						// run code
					}
					return true;
				}
			},
		});
	}
	onunload() {
		super.onunload();
		// unload all event ref
		for (const eventRef of this.eventRefs) {
			this.app.workspace.offref(eventRef);
		}
	}
}
