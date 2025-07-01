import {
	// App,
	// Editor,
	EventRef,
	MarkdownView,
	// Modal,
	Notice,
	Plugin,
	// PluginSettingTab,
	// Setting,
	// FileSystemAdapter,
	TFile,
	normalizePath,
} from "obsidian";
import "@total-typescript/ts-reset";
import "@total-typescript/ts-reset/dom";
// import { MySettingManager } from "@/SettingManager";
// import { readFileSync, writeFileSync, unlinkSync } from "fs";
// import { shell } from "electron";
// import * as path from "path";
// import fs from "fs";
// import html2pdf from "html2pdf.js";

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
						this.MarkdownToHTML().then((html) => {
							this.SaveFile(this.buildHTMLDocument(html));
						});
					}
					return true;
				}
			},
		});
	}

	async MarkdownToHTML(): Promise<string> {
		let inputFile = this.getCurrentFilePath();
		if (!inputFile) {
			new Notice("Could not determine the file path.");
			throw new Error("Could not determine the file path.");
		}
		let outputFile: string = this.replaceFileExtension(inputFile, "html");
		console.log(outputFile);
		
		this.app.commands.executeCommandById(
			"obsidian-pandoc:pandoc-export-html",
		);
		const waitForFile = async (
			timeoutMs: number,
			intervalMs: number,
		): Promise<void> => {
			const startTime = Date.now();
			while (Date.now() - startTime < timeoutMs) {
				const exists = await this.app.vault.adapter.exists(normalizePath(outputFile));
				if (exists) return;
				await new Promise((r) => setTimeout(r, intervalMs));
			}
			throw new Error("Timed out waiting for HTML export");
		};
		try {
			await waitForFile(5000, 200);
		} catch (err) {
			if (err instanceof Error) {
				new Notice(err.message);
			}
			throw err;
		}

		const exists = await this.app.vault.adapter.exists(normalizePath(outputFile));
		if (!exists) {
			new Notice("FILE DOES NOT EXIST!: " + outputFile);
			throw new Error("FILE DOES NOT EXIST!: " + outputFile);
		}

		const file = await this.app.vault.adapter.read(normalizePath(outputFile));
		await this.app.vault.adapter.remove(normalizePath(outputFile));

		return file;
	}
	buildHTMLDocument(html: string): string {
		const customCss = `
			body { background: white; color: black; font-family: sans-serif; }
			h1 { font-size: 2em; }
		`;
		const customScript = `console.log('Custom script running!');`;
		const parser = new DOMParser();
		const doc = parser.parseFromString(html, "text/html");
		const newHead = doc.createElement("head");

		const title = doc.createElement("title");
		const style = doc.createElement("style");
		const script = doc.createElement("script");
		title.textContent = "Custom Page";
		style.textContent = customCss;
		script.textContent = customScript;
		newHead.appendChild(title);
		newHead.appendChild(style);
		newHead.appendChild(script);

		const oldHead = doc.querySelector("head");
		if (oldHead && oldHead.parentNode) {
			oldHead.parentNode.replaceChild(newHead, oldHead);
		}
		const newHtml = "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
		console.log(newHtml);

		return newHtml;
	}

	async SaveFile(content: string): Promise<void> {
		const filePath = `Daily Notes/${this.getCurrentFileName()}.html`;
		const existingFile = this.app.vault.getAbstractFileByPath(filePath);
		if (existingFile instanceof TFile) {
			// existingAbstractFile is now typed as TFile
			await this.app.vault.modify(existingFile, content);
		} else {
			await this.app.vault.create(filePath, content);
		}
	}

	replaceFileExtension(file: string, ext: string): string {
		// Source: https://stackoverflow.com/a/5953384/4642943
		let pos = file.lastIndexOf(".");
		return file.slice(0, pos < 0 ? file.length : pos) + "." + ext;
	}

	getCurrentFilePath(): string | null {
		const fileData = this.app.workspace.getActiveFile();
		if (!fileData) return null;
		return fileData.path;
	}

	getCurrentFileName(): string {
		let inputFile = this.getCurrentFilePath();
		if (!inputFile) {
			new Notice("Could not determine the file path.");
			throw new Error("Could not determine the file path.");
		}
		const fileName: string = inputFile.split(/[/\\]/).pop() ?? "";
		const dotIndex = fileName.lastIndexOf(".");
		return dotIndex !== -1 ? fileName.substring(0, dotIndex) : fileName;
	}

	onunload() {
		super.onunload();
		// unload all event ref
		for (const eventRef of this.eventRefs) {
			this.app.workspace.offref(eventRef);
		}
	}
}
