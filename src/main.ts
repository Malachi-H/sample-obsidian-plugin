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
	FileSystemAdapter,
} from "obsidian";
import "@total-typescript/ts-reset";
import "@total-typescript/ts-reset/dom";
import { MySettingManager } from "@/SettingManager";

export default class MyPlugin extends Plugin {
	private eventRefs: EventRef[] = [];
	async onload() {
		this.addCommand({
			id: "export-censored-document",
			name: "Export Censored Document",
			checkCallback: (checking: boolean) => {
				const markdownView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					if (!checking) {
						this.startHTMLExport();
					}
					return true;
				}
			},
		});
	}

	async startHTMLExport(): Promise<void> {
		let inputFile = this.getCurrentFile();
		if (!inputFile) {
			new Notice("Could not determine the file path.");
			return;
		}
		new Notice(`Exporting ${inputFile} to HTML`);
		let outputFile: string = this.replaceFileExtension(inputFile, "html");
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		const { html, metadata } = await render(this, view, inputFile, format);
	}

	replaceFileExtension(file: string, ext: string): string {
		// Source: https://stackoverflow.com/a/5953384/4642943
		let pos = file.lastIndexOf(".");
		return file.slice(0, pos < 0 ? file.length : pos) + "." + ext;
	}

	getCurrentFile(): string | null {
		const fileData = this.app.workspace.getActiveFile();
		if (!fileData) return null;
		const adapter = this.app.vault.adapter;
		if (adapter instanceof FileSystemAdapter)
			return adapter.getFullPath(fileData.path);
		return null;
	}

	onunload() {
		super.onunload();
		// unload all event ref
		for (const eventRef of this.eventRefs) {
			this.app.workspace.offref(eventRef);
		}
	}
}
