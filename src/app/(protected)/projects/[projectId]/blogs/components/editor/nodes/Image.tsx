import React, { useEffect, useRef } from "react";
import {
	$getNodeByKey,
	$getSelection,
	$isNodeSelection,
	$setSelection,
	CLICK_COMMAND,
	COMMAND_PRIORITY_LOW,
	DRAGSTART_COMMAND,
	KEY_BACKSPACE_COMMAND,
	KEY_DELETE_COMMAND,
	KEY_ENTER_COMMAND,
	KEY_ESCAPE_COMMAND,
	SELECTION_CHANGE_COMMAND,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";

interface ImageProps {
	src: string;
	path: string;
	width: string;
	height: string;
	key: string;
}

export const Image = ({
	src,
	path,
	width,
	height,
	key: nodeKey,
}: ImageProps) => {
	const [editor] = useLexicalComposerContext();
	const imageRef = useRef<HTMLImageElement | null>(null);
	const [isSelected, setSelected, clearSelection] =
		useLexicalNodeSelection(nodeKey);

	useEffect(() => {
		return editor.registerCommand(
			CLICK_COMMAND,
			(payload) => {
				const event = payload;
				// to be implemented

				return false;
			},
			COMMAND_PRIORITY_LOW
		);
	}, [editor]);

	return (
		<img
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
