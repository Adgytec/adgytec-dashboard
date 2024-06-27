import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	$createParagraphNode,
	$getNodeByKey,
	$getSelection,
	$isNodeSelection,
	$setSelection,
	BaseSelection,
	CLICK_COMMAND,
	COMMAND_PRIORITY_LOW,
	DRAGSTART_COMMAND,
	FORMAT_ELEMENT_COMMAND,
	KEY_BACKSPACE_COMMAND,
	KEY_DELETE_COMMAND,
	KEY_ENTER_COMMAND,
	KEY_ESCAPE_COMMAND,
	LexicalEditor,
	NodeSelection,
	RangeSelection,
	SELECTION_CHANGE_COMMAND,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { $isImageNode } from "./ImageNode";

import { mergeRegister } from "@lexical/utils";

interface ImageProps {
	src: string;
	path: string;
	width: string;
	height: string;
	nodeKey: string;
}

export const Image = ({ src, path, width, height, nodeKey }: ImageProps) => {
	const [editor] = useLexicalComposerContext();
	const imageRef = useRef<HTMLImageElement | null>(null);
	const [isSelected, setSelected, clearSelection] =
		useLexicalNodeSelection(nodeKey);

	const [selection, setSelection] = useState<
		RangeSelection | NodeSelection | null | Selection | BaseSelection
	>(null);
	const activeEditorRef = useRef<LexicalEditor | null>(null);

	const onDelete = useCallback(
		(event: KeyboardEvent) => {
			if (isSelected && $isNodeSelection($getSelection())) {
				event.preventDefault();
				const node = $getNodeByKey(nodeKey);
				if (node && $isImageNode(node)) {
					node.remove();
				}
				setSelected(false);
			}
			return false;
		},
		[isSelected, nodeKey, setSelected]
	);

	const onEnter = useCallback(
		(event: KeyboardEvent) => {
			const latestSelection = $getSelection();
			if (
				isSelected &&
				$isNodeSelection(latestSelection) &&
				latestSelection.getNodes().length === 1
			) {
				const node = $getNodeByKey(nodeKey);
				if (!node) return false;

				const newParagraphNode = $createParagraphNode();
				node.insertBefore(newParagraphNode);
			}

			return false;
		},
		[isSelected]
	);

	useEffect(() => {
		let isMounted = true;
		const unregister = mergeRegister(
			editor.registerUpdateListener(({ editorState }) => {
				if (isMounted) {
					setSelection(editorState.read(() => $getSelection()));
				}
			}),
			editor.registerCommand(
				SELECTION_CHANGE_COMMAND,
				(_, activeEditor) => {
					activeEditorRef.current = activeEditor;
					return false;
				},
				COMMAND_PRIORITY_LOW
			),
			editor.registerCommand(
				CLICK_COMMAND,
				(payload) => {
					const event = payload;

					if (event.target === imageRef.current) {
						if (event.shiftKey) {
							setSelected(!isSelected);
						} else {
							clearSelection();
							setSelected(true);
						}
						return true;
					}

					return false;
				},
				COMMAND_PRIORITY_LOW
			),
			editor.registerCommand(
				KEY_DELETE_COMMAND,
				onDelete,
				COMMAND_PRIORITY_LOW
			),
			editor.registerCommand(
				KEY_BACKSPACE_COMMAND,
				onDelete,
				COMMAND_PRIORITY_LOW
			),
			editor.registerCommand(
				KEY_ENTER_COMMAND,
				onEnter,
				COMMAND_PRIORITY_LOW
			)
		);
		return () => {
			isMounted = false;
			unregister();
		};
	}, [
		clearSelection,
		editor,
		isSelected,
		nodeKey,
		onDelete,
		onEnter,
		setSelected,
	]);

	return (
		<img
			style={{
				outline: `${
					isSelected ? "2px" : "0"
				} solid var(--accent-primary-active)`,

				padding: `${isSelected ? "0.1em" : "0"}`,
			}}
			src={src}
			data-path={path}
			width={width}
			height={height}
			alt="blog-image"
			className="editor-image"
			ref={imageRef}
		/>
	);
};
