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
import { Image } from "./Image";

class ImageNode extends DecoratorNode<JSX.Element> {
	__src;
	__path;
	__width;
	__height;

	static getType(): string {
		return "image";
	}

	static clone(node: ImageNode): ImageNode {
		return new ImageNode(
			node.__src,
			node.__path,
			node.__width,
			node.__height
		);
	}

	static importJSON(_serializedNode: SerializedImageNode): LexicalNode {
		const { src, path, width, height } = _serializedNode;
		return new ImageNode(src, path, width, height);
	}

	exportDOM(editor: LexicalEditor): DOMExportOutput {
		const img = document.createElement("img");
		img.setAttribute("src", this.__src);
		img.setAttribute("alt", "blog-image");
		img.setAttribute("data-path", this.__path);
		img.setAttribute("class", "editor-image");
		img.setAttribute("width", this.__width);
		img.setAttribute("height", this.__height);

		return { element: img };
	}

	static importDOM(): DOMConversionMap<any> | null {
		return null;
		return {
			img: (node: HTMLElement): DOMConversion<HTMLElement> | null => {
				if (node instanceof HTMLImageElement) {
					const path = node.getAttribute("data-path");
					let { src, width, height } = node;

					if (width === 0 || height === 0) {
						width = 500;
						height = 250;
					}

					if (src && path)
						return {
							conversion: () => ({
								node: new ImageNode(
									src,
									path,
									width.toString(),
									height.toString()
								),
							}),
							priority: 1,
						};
				}

				return null;
			},
		};
	}

	constructor(src: string, path: string, width: string, height: string) {
		super();
		this.__src = src;
		this.__path = path;

		this.__width = width || "inherit";
		this.__height = height || "inherit";
	}

	exportJSON(): SerializedImageNode {
		return {
			type: "image",
			src: this.__src,
			path: this.__path,
			height: this.__height === "inherit" ? "0" : this.__height,
			width: this.__width === "inherit" ? "0" : this.__width,
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

	getPath() {
		return this.__path;
	}

	setWidthAndHeight(width: string, height: string) {
		const writable = this.getWritable();

		writable.__width = width;
		writable.__height = height;
	}

	decorate(editor: LexicalEditor, config: EditorConfig): JSX.Element {
		// return (
		// 	<img
		// 		src={this.__src}
		// 		data-path={this.__path}
		// 		alt="blog-image"
		// 		width={this.__width}
		// 		height={this.__height}
		// 		className="editor-image"
		// 	/>
		// );

		return (
			<Image
				src={this.__src}
				path={this.__path}
				width={this.__width}
				height={this.__height}
				nodeKey={this.getKey()}
				alt="blog-image"
			/>
		);
	}

	isSelectable(): boolean {
		return true;
	}
}

interface SerializedImageNode extends SerializedLexicalNode {
	src: string;
	path: string;
	width: string;
	height: string;
	version: number;
}

export const INSERT_IMAGE_COMMAND: LexicalCommand<{
	src: string;
	path: string;
}> = createCommand("INSERT_IMAGE_COMMAND");
export default ImageNode;

export function $createImageNode({ src, path }: { src: string; path: string }) {
	return $applyNodeReplacement(new ImageNode(src, path, "500", "250"));
}

export function $isImageNode(node: LexicalNode): boolean {
	return node instanceof ImageNode;
}
