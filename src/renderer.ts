import * as path from "path";
import { MarkdownRenderer, MarkdownView } from "obsidian";
import MyPlugin from "./main";
export default async function render(
	plugin: MyPlugin,
	view: MarkdownView,
	inputFile: string,
	outputFormat: string,
	parentFiles: string[] = [],
): Promise<{ html: string; metadata: { [index: string]: string } }> {
	// Use Obsidian's markdown renderer to render to a hidden <div>
	const markdown = view.data;
	const wrapper = document.createElement("div");
	wrapper.style.display = "hidden";
	document.body.appendChild(wrapper);
	await MarkdownRenderer.renderMarkdown(
		markdown,
		wrapper,
		path.dirname(inputFile),
		view,
	);

	let html = wrapper.innerHTML;

	// If it's a top level note, make the HTML a standalone document - inject CSS, a <title>, etc.
	const metadata = getYAMLMetadata(markdown);
	metadata.title ??= fileBaseName(inputFile);
	if (parentFiles.length === 0) {
		html = await standaloneHTML(
			plugin.settings,
			html,
			metadata.title,
			plugin.vaultBasePath(),
		);
	}

	// Takes any file path like '/home/oliver/zettelkasten/Obsidian.md' and
	// takes the base name, in this case 'Obsidian'
	function fileBaseName(file: string): string {
		return path.basename(file, path.extname(file));
	}

	function getYAMLMetadata(markdown: string) {
		markdown = markdown.trim();
		if (markdown.startsWith("---")) {
			const trailing = markdown.substring(3);
			const frontmatter = trailing
				.substring(0, trailing.indexOf("---"))
				.trim();
			return YAML.parse(frontmatter);
		}
		return {};
	}

	return { html, metadata };
}
