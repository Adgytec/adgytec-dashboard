import EditorTheme from "./themes/EditorTheme";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";

import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentLevelPlugin";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import AutoLinkPlugin from "./plugins/AutoLinkPlugin";
import FloatingTextFormatToolbarPlugin from "./plugins/FloatingTextFormatPlugin";
import ImageNode, { INSERT_IMAGE_COMMAND } from "./nodes/ImageNode";
import ImagePlugin from "./plugins/ImagePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { LexicalEditor } from "lexical";
import { $getRoot, $insertNodes } from "lexical";
import NodeChangePlugin from "./plugins/NodeChangePlugin";

import "../../../../../../../../styles/abstract/_lexical.scss";
import { useContext, useState } from "react";
import { UserContext } from "@/components/AuthContext/authContext";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";

function Placeholder() {
	return (
		<div className="editor-placeholder">Start creating your blog...</div>
	);
}

const editorConfig = {
	namespace: "blog editor",
	// The editor theme
	theme: EditorTheme,
	// Handling of errors during update
	onError(error: Error) {
		throw error;
	},
	// Any custom nodes go here
	nodes: [
		HeadingNode,
		ListNode,
		ListItemNode,
		QuoteNode,
		CodeNode,
		CodeHighlightNode,
		TableNode,
		TableCellNode,
		TableRowNode,
		AutoLinkNode,
		LinkNode,
		ImageNode,
	],
};

const htmlstring =
	'<p class="editor-paragraph" dir="ltr"><span style="white-space: pre-wrap;">sdafasfdasdf</span></p><h2 class="editor-heading-h2" dir="ltr"><span style="white-space: pre-wrap;">asdfasdfa</span></h2><p class="editor-paragraph" dir="ltr"><br></p><h1 class="editor-heading-h1" dir="ltr"><span style="white-space: pre-wrap;">asdfasdfasdf</span></h1><ul class="editor-list-ul"><li value="1" class="editor-listitem"><span style="white-space: pre-wrap;">asdfasdf</span></li><li value="2" class="editor-listitem"><span style="white-space: pre-wrap;">asdfaf</span></li></ul><p class="editor-paragraph"><br></p><ol class="editor-list-ol"><li value="1" class="editor-listitem"><span style="white-space: pre-wrap;">asdfasdfaf</span></li><li value="2" class="editor-listitem"><span style="white-space: pre-wrap;">asdfasdfsafasfdasdf</span></li></ol><blockquote class="editor-quote" dir="ltr"><span style="white-space: pre-wrap;">asdfasdfasdfasdfa</span></blockquote><p class="editor-paragraph" dir="ltr"><br></p><img src="https://images.unsplash.com/photo-1711741507611-f96052182ac8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="blog-image" data-path="/rohan-asdf" class="editor-image"><img src="https://images.unsplash.com/photo-1711741507611-f96052182ac8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="blog-image" data-path="/rohan" class="editor-image">';

const another =
	'<pre class="editor-code" spellcheck="false" data-highlight-language="javascript"><span style="white-space: pre-wrap;">#include </span><span class="editor-tokenOperator" style="white-space: pre-wrap;">&lt;</span><span style="white-space: pre-wrap;">iostream</span><span class="editor-tokenOperator" style="white-space: pre-wrap;">&gt;</span><br><br><span style="white-space: pre-wrap;">int </span><span class="editor-tokenFunction" style="white-space: pre-wrap;">main</span><span class="editor-tokenPunctuation" style="white-space: pre-wrap;">(</span><span class="editor-tokenPunctuation" style="white-space: pre-wrap;">)</span><span style="white-space: pre-wrap;"> </span><span class="editor-tokenPunctuation" style="white-space: pre-wrap;">{</span><br><span style="white-space: pre-wrap;">\t</span><span style="white-space: pre-wrap;">cout</span><span class="editor-tokenOperator" style="white-space: pre-wrap;">&lt;&lt;</span><span class="editor-tokenSelector" style="white-space: pre-wrap;">"rohan"</span><br><span class="editor-tokenPunctuation" style="white-space: pre-wrap;">}</span></pre>';

function Trial() {
	const [editor] = useLexicalComposerContext();

	const handleGenerate = () => {
		editor.update(() => {
			const editorState = editor.getEditorState();
			const jsonString = JSON.stringify(editorState);
			console.log("jsonString", jsonString);

			const htmlString = $generateHtmlFromNodes(editor, null);
			console.log(JSON.stringify(htmlString));
		});
	};

	const handlePopulate = () => {
		editor.update(() => {
			// In the browser you can use the native DOMParser API to parse the HTML string.
			const parser = new DOMParser();
			const dom = parser.parseFromString(htmlstring, "text/html");

			// Once you have the DOM instance it's easy to generate LexicalNodes.
			const nodes = $generateNodesFromDOM(editor, dom);

			// Select the root
			const root = $getRoot();
			root.select();
			root.clear();

			// Insert them at a selection.
			$insertNodes(nodes);
		});
	};

	return (
		<div
			style={{
				outline: "2px solid red",
				position: "relative",
				bottom: "-3em",
			}}
		>
			<button onClick={handleGenerate}>Show HTML</button>;
			<button onClick={handlePopulate}>Populate</button>
		</div>
	);
}

export default function Editor() {
	const userWithRole = useContext(UserContext);
	const params = useParams<{ projectId: string }>();

	const [newImages, setNewImages] = useState<string[]>([]);
	const [removedImages, setRemovedImages] = useState<string[]>([]);

	console.log(removedImages);

	const handleRemove = async () => {
		const url = `${process.env.NEXT_PUBLIC_API}/services/blogs/${params.projectId}/random-id/clean-up`;
		const token = await userWithRole?.user.getIdToken();
		const headers = {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		};

		const body = JSON.stringify({
			paths: newImages,
		});

		fetch(url, {
			method: "DELETE",
			headers,
			body,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) throw new Error(res.message);

				toast.success(res.message);
			})
			.catch((err) => {
				toast.error(err.message);
			});
	};

	return (
		<LexicalComposer initialConfig={editorConfig}>
			<div
				className="editor-container"
				style={{
					marginBlockEnd: "3em",
				}}
			>
				<ToolbarPlugin setNewImages={setNewImages} />
				<div className="editor-inner">
					<RichTextPlugin
						contentEditable={
							<ContentEditable className="editor-input" />
						}
						placeholder={<Placeholder />}
						ErrorBoundary={LexicalErrorBoundary}
					/>
					<HistoryPlugin />
					<AutoFocusPlugin />
					<CodeHighlightPlugin />
					<ListPlugin />
					<LinkPlugin />
					<AutoLinkPlugin />
					<ListMaxIndentLevelPlugin maxDepth={7} />
					<MarkdownShortcutPlugin transformers={TRANSFORMERS} />
					<FloatingTextFormatToolbarPlugin />
					<ImagePlugin />
					<NodeChangePlugin setRemovedImages={setRemovedImages} />
					{/* <Trial />
					<button onClick={handleRemove}>remove</button> */}
				</div>
			</div>
		</LexicalComposer>
	);
}
