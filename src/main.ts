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
import { readFileSync } from "fs";
import { shell } from "electron";
import fs from "fs";

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
						this.startHTMLExport().then((html_file) => {
							if (html_file) this.renderFile(html_file);
						});
					}
					return true;
				}
			},
		});
	}
	async renderFile(html_file: string) {
		await shell.openPath(html_file);
	}

	async startHTMLExport(): Promise<string> {
		let inputFile = this.getCurrentFile();
		if (!inputFile) {
			new Notice("Could not determine the file path.");
			throw new Error("Could not determine the file path.");
		}
		let outputFile: string = this.replaceFileExtension(inputFile, "html");
		let sucsess: Boolean = this.app.commands.executeCommandById(
			"obsidian-pandoc:pandoc-export-html",
		);
		if (!sucsess) {
			new Notice("EXPORT FAILED!!");
			throw new Error("EXPORT FAILED!!");
		}
		console.log(outputFile);
		if (!fs.existsSync(outputFile)) {
			new Notice("FILE DOES NOT EXIST!: " + outputFile);
			throw new Error("FILE DOES NOT EXIST!: " + outputFile);
		}
		const file = readFileSync(outputFile, "utf-8");
		console.log(file);
		return file;
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
