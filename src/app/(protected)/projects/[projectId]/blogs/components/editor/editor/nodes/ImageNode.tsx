import {
	$applyNodeReplacement,
	DOMConversion,
	DOMConversionMap,
	DOMExportOutput,
	DecoratorNode,
	EditorConfig,
	LexicalCommand,
	LexicalEditor,
	LexicalNode,
	SerializedLexicalNode,
	createCommand,
} from "lexical";
import React from "react";

class ImageNode extends DecoratorNode<JSX.Element> {
	__src;
	__path;

	static getType(): string {
		return "image";
	}

	static clone(node: ImageNode): ImageNode {
		return new ImageNode(node.__src, node.__path);
	}

	constructor(src: string, path: string) {
		super();
		this.__src = src;
		this.__path = path;
	}

	static importJSON(_serializedNode: SerializedImageNode): LexicalNode {
		const { src, path } = _serializedNode;
		return new ImageNode(src, path);
	}

	exportJSON(): SerializedImageNode {
		return {
			type: "image",
			src: this.__src,
			path: this.__path,
			version: 1,
		};
	}

	createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
		const span = document.createElement("span");
		return span;
	}

	updateDOM(
		_prevNode: unknown,
		_dom: HTMLElement,
		_config: EditorConfig
	): boolean {
		return false;
	}

	exportDOM(editor: LexicalEditor): DOMExportOutput {
		const img = document.createElement("img");
		img.setAttribute("src", this.__src);
		img.setAttribute("alt", "blog-image");
		img.setAttribute("data-path", this.__path);
		img.setAttribute("class", "editor-image");
		img.setAttribute("width", "200");
		img.setAttribute("height", "100");
		return { element: img };
	}

	getPath() {
		return this.__path;
	}

	static importDOM(): DOMConversionMap<any> | null {
		return {
			img: (node: HTMLElement): DOMConversion<HTMLElement> | null => {
				const src = node.getAttribute("src");
				const path = node.getAttribute("data-path");

				if (src && path)
					return {
						conversion: () => ({ node: new ImageNode(src, path) }),
						priority: 1,
					};

				return null;
			},
		};
	}

	decorate(editor: LexicalEditor, config: EditorConfig): JSX.Element {
		return (
			<img
				src={this.__src}
				data-key={this.__path}
				alt="blog-image"
				width="500"
				height="250"
				className="editor-image"
			/>
		);
	}
}

interface SerializedImageNode extends SerializedLexicalNode {
	src: string;
	path: string;
	version: number;
}

export const INSERT_IMAGE_COMMAND: LexicalCommand<{
	src: string;
	path: string;
}> = createCommand("INSERT_IMAGE_COMMAND");
export default ImageNode;

export function $createImageNode({ src, path }: { src: string; path: string }) {
	return $applyNodeReplacement(new ImageNode(src, path));
}
