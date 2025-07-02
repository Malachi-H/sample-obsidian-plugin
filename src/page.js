document.addEventListener("DOMContentLoaded", () => {
	function censorSentenceBlocks(root = document.body) {
		const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
		const nodesToReplace = [];

		// 1) gather all text nodes (skip SCRIPT, STYLE, NOSCRIPT, HEADERs)
		while (walker.nextNode()) {
			const node = walker.currentNode;
			const parent = node.parentNode;
			if (
				!parent ||
				["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName) ||
				!/\w/.test(node.textContent)
			)
				continue;
			nodesToReplace.push(node);
		}

		// const sentenceRegex = /\b\w+(?:\s+\w+)*\b/;
		const word = /\w+\b/;

		for (const node of nodesToReplace) {
			const parent = node.parentNode;
			const text = node.textContent;
			const parts = text.split(new RegExp(`(${word.source})`, "g"));

			// grab the computed text colour once per node
			const fg = window.getComputedStyle(parent).color;

			for (const part of parts) {
				let newNode;
				if (word.test(part)) {
					const span = document.createElement("span");
					span.textContent = part; // real text => proper wrapping
					span.style.display = "inline";
					span.style.backgroundColor = fg; // use the parent’s actual text colour
					span.style.color = "transparent"; // hide the letters themselves
					span.style.whiteSpace = "normal"; // allow wrapping
					span.style.lineHeight = "1.5em";
					span.style.borderRadius = "0.2em";
					newNode = span;
				} else {
					newNode = document.createTextNode(part);
				}
				parent.insertBefore(newNode, node);
			}

			parent.removeChild(node);
		}
		document.querySelectorAll(".fileclass-icon svg").forEach((svg) => {
			svg.setAttribute("width", "15");
			svg.setAttribute("height", "15");
		});
	}

	// Usage:
	censorSentenceBlocks();
});
