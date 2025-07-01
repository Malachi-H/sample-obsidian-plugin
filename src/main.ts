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
	FileSystemAdapter,
} from "obsidian";
import "@total-typescript/ts-reset";
import "@total-typescript/ts-reset/dom";
// import { MySettingManager } from "@/SettingManager";
import { readFileSync } from "fs";
// import { shell } from "electron";
import fs from "fs";
import html2pdf from "html2pdf.js";

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
							this.exportHtmlToPdf(html);
						});
					}
					return true;
				}
			},
		});
	}

	async MarkdownToHTML(): Promise<string> {
		let inputFile = this.getCurrentFile();
		if (!inputFile) {
			new Notice("Could not determine the file path.");
			throw new Error("Could not determine the file path.");
		}
		let outputFile: string = this.replaceFileExtension(inputFile, "html");
		this.app.commands.executeCommandById(
			"obsidian-pandoc:pandoc-export-html",
		);
		const waitForFile = (
			timeoutMs: number,
			intervalMs: number,
		): Promise<void> =>
			new Promise((resolve, reject) => {
				const startTime = Date.now();
				const timer = setInterval(() => {
					if (fs.existsSync(outputFile)) {
						clearInterval(timer);
						resolve();
					} else if (Date.now() - startTime > timeoutMs) {
						clearInterval(timer);
						reject(new Error("Timed out waiting for HTML export"));
					}
				}, intervalMs);
			});
		try {
			await waitForFile(5000, 200);
		} catch (err) {
			if (err instanceof Error) {
				new Notice(err.message);
			}
			throw err;
		}
		if (!fs.existsSync(outputFile)) {
			new Notice("FILE DOES NOT EXIST!: " + outputFile);
			throw new Error("FILE DOES NOT EXIST!: " + outputFile);
		}
		const file = readFileSync(outputFile, "utf-8");
		return file;
	}

	async exportHtmlToPdf(html: string) {
		const blob = new Blob([html], { type: "text/html" });
		const url = URL.createObjectURL(blob);

		const iframe = document.createElement("iframe");
		iframe.src = url;
		document.body.appendChild(iframe);

		iframe.onload = () => {
			try {
				const doc = iframe.contentDocument!;
				this.resetStyles(doc);
				doc.body.style.backgroundColor = "red";

				html2pdf()
					.from(doc.body)
					.set({
						margin: 1,
						image: { type: "jpeg", quality: 1 },
						html2pdfcanvas: { scale: 3 },
					})
					.save("exported.pdf")
					.then(() => {
						iframe.remove();
						URL.revokeObjectURL(url);
						new Notice("PDF exported!");
					})
					.catch((err: any) => {
						iframe.remove();
						URL.revokeObjectURL(url);
						new Notice("PDF export failed: " + err.message);
						throw new Error("PDF EXPORT FAILED: " + err);
					});
			} catch (err) {
				iframe.remove();
				URL.revokeObjectURL(url);
				new Notice("Unexpected error: " + (err as Error).message);
				throw err;
			}
		};

		document.body.appendChild(iframe);
	}

	resetStyles(doc: Document) {
		const allElements = doc.body.querySelectorAll("*");

		// Reset all inline styles and computed styles to empty or defaults
		allElements.forEach((el: HTMLElement) => {
			// Clear inline style
			el.style.cssText = "";

			// Or, to override styles one-by-one, you could do:
			// el.style.setProperty("all", "unset");
			// el.style.setProperty("box-sizing", "border-box");
		});

		// Reset body styles explicitly
		doc.body.style.all = "revert";
		doc.body.style.background = "white";
		doc.body.style.color = "black";
		doc.body.style.fontFamily = "sans-serif";
		doc.body.style.margin = "2rem";
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
