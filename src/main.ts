import {
	EventRef,
	MarkdownView,
	Notice,
	Plugin,
	TFile,
	normalizePath,
} from "obsidian";
import "@total-typescript/ts-reset";
import "@total-typescript/ts-reset/dom";
import * as path from "path";

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
						this.main();
					}
					return true;
				}
			},
		});
	}
	async main() {
		const html = await this.MarkdownToHTML();
		const alteredDocuemnt = await this.buildHTMLDocument(html);
		const filePath = `Daily Notes/${this.getCurrentFileName()}.html`;
		await this.SaveFile(alteredDocuemnt, filePath);
		this.app.openWithDefaultApp(filePath);
		this.deleteFile(filePath);
	}

	async deleteFile(filePath: string) {
		const existingFile = this.app.vault.getAbstractFileByPath(
			normalizePath(filePath),
		);
		if (!existingFile) {
			new Notice("FAILED TO DELETE HTML FILE");
			throw new Error("FAILED TO DELETE HTML FILE");
		}

		await new Promise((r) => setTimeout(r, 1000));
		this.app.vault.delete(existingFile);
	}

	async MarkdownToHTML(): Promise<string> {
		let inputFile = this.getCurrentFilePath();
		if (!inputFile) {
			new Notice("Could not determine the file path.");
			throw new Error("Could not determine the file path.");
		}
		let outputFile: string = this.replaceFileExtension(inputFile, "html");

		let exists = await this.app.vault.adapter.exists(
			normalizePath(outputFile),
		);
		if (exists) {
			new Notice("NOTE: Overwriting Existing HTML file");
			await this.app.vault.adapter.remove(normalizePath(outputFile));
		}

		this.app.commands.executeCommandById(
			"obsidian-pandoc:pandoc-export-html",
		);
		const waitForFile = async (
			timeoutMs: number,
			intervalMs: number,
		): Promise<void> => {
			const startTime = Date.now();
			while (Date.now() - startTime < timeoutMs) {
				const exists = await this.app.vault.adapter.exists(
					normalizePath(outputFile),
				);
				if (exists) return;
				await new Promise((r) => setTimeout(r, intervalMs));
			}
			throw new Error("Timed out waiting for HTML export");
		};
		try {
			await waitForFile(60000, 200);
		} catch (err) {
			if (err instanceof Error) {
				new Notice(err.message);
			}
			throw err;
		}

		const file = await this.app.vault.adapter.read(
			normalizePath(outputFile),
		);
		await this.app.vault.adapter.remove(normalizePath(outputFile));

		return file;
	}

	async buildHTMLDocument(html: string): Promise<string> {
		const customHead = `
			<link rel="preconnect" href="https://fonts.googleapis.com">
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
			<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
		`;
		const cssPath = path.join(this.manifest.dir!, "src", "page.css");
		const customCss = await this.app.vault.adapter.read(
			normalizePath(cssPath),
		);
		const scriptPath = path.join(this.manifest.dir!, "src", "page.js");
		const customScript = await this.app.vault.adapter.read(
			normalizePath(scriptPath),
		);
		const parser = new DOMParser();
		const doc = parser.parseFromString(html, "text/html");

		const newHead = doc.createElement("head");
		const title = doc.createElement("title");
		const style = doc.createElement("style");
		const script = doc.createElement("script");
		title.textContent = "Censored Docuemnt";
		style.textContent = customCss;
		script.textContent = customScript;
		newHead.appendChild(title);
		newHead.appendChild(style);
		newHead.appendChild(script);
		const headFragment = parser.parseFromString(
			`<head>${customHead}</head>`,
			"text/html",
		);
		[...headFragment.head.childNodes].forEach((node) => {
			newHead.appendChild(node);
		});

		const oldHead = doc.querySelector("head");
		if (oldHead && oldHead.parentNode) {
			oldHead.parentNode.replaceChild(newHead, oldHead);
		}
		const newHtml = "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;

		return newHtml;
	}

	async SaveFile(content: string, filePath: string): Promise<void> {
		const existingFile = this.app.vault.getAbstractFileByPath(filePath);
		if (existingFile instanceof TFile) {
			await this.app.vault.modify(existingFile, content);
		} else {
			await this.app.vault.create(filePath, content);
		}
		new Notice("HTML File Saved");
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
