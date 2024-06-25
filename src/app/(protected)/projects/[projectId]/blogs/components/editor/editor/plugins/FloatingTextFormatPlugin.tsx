import { $isCodeHighlightNode } from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
	$getSelection,
	$isRangeSelection,
	$isTextNode,
	COMMAND_PRIORITY_LOW,
	FORMAT_TEXT_COMMAND,
	LexicalEditor,
	SELECTION_CHANGE_COMMAND,
} from "lexical";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { getDOMRangeRect } from "./utils/getDOMRangeRect";
import { getSelectedNode } from "./utils/getSelectNode";
import { setFloatingElemPosition } from "./utils/setFloatingElemPosition";

interface TextFromatFloatingToolbarProps {
	editor: LexicalEditor;
	anchorElem: HTMLElement;
	isLink: boolean;
	isBold: boolean;
	isItalic: boolean;
	isStrikethrough: boolean;
	isSubscript: boolean;
	isSuperscript: boolean;
	isUnderline: boolean;
	isCode: boolean;
}

function TextFormatFloatingToolbar({
	editor,
	anchorElem,
	isLink,
	isBold,
	isItalic,
	isUnderline,
}: TextFromatFloatingToolbarProps) {
	const popupCharStylesEditorRef = useRef<HTMLDivElement | null>(null);

	const insertLink = useCallback(() => {
		if (!isLink) {
			editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://");
		} else {
			editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
		}
	}, [editor, isLink]);

	function mouseMoveListener(e: MouseEvent) {
		if (
			popupCharStylesEditorRef?.current &&
			(e.buttons === 1 || e.buttons === 3)
		) {
			popupCharStylesEditorRef.current.style.pointerEvents = "none";
		}
	}
	function mouseUpListener(e: MouseEvent) {
		if (popupCharStylesEditorRef?.current) {
			popupCharStylesEditorRef.current.style.pointerEvents = "auto";
		}
	}

	useEffect(() => {
		if (popupCharStylesEditorRef?.current) {
			document.addEventListener("mousemove", mouseMoveListener);
			document.addEventListener("mouseup", mouseUpListener);

			return () => {
				document.removeEventListener("mousemove", mouseMoveListener);
				document.removeEventListener("mouseup", mouseUpListener);
			};
		}
	}, [popupCharStylesEditorRef]);

	const updateTextFormatFloatingToolbar = useCallback(() => {
		const selection = $getSelection();

		const popupCharStylesEditorElem = popupCharStylesEditorRef.current;
		const nativeSelection = window.getSelection();

		if (popupCharStylesEditorElem === null) {
			return;
		}

		const rootElement = editor.getRootElement();
		if (
			selection !== null &&
			nativeSelection !== null &&
			!nativeSelection.isCollapsed &&
			rootElement !== null &&
			rootElement.contains(nativeSelection.anchorNode)
		) {
			const rangeRect = getDOMRangeRect(nativeSelection, rootElement);

			setFloatingElemPosition(
				rangeRect,
				popupCharStylesEditorElem,
				anchorElem
			);
		}
	}, [editor, anchorElem]);

	useEffect(() => {
		const scrollerElem = anchorElem.parentElement;

		const update = () => {
			editor.getEditorState().read(() => {
				updateTextFormatFloatingToolbar();
			});
		};

		window.addEventListener("resize", update);
		if (scrollerElem) {
			scrollerElem.addEventListener("scroll", update);
		}

		return () => {
			window.removeEventListener("resize", update);
			if (scrollerElem) {
				scrollerElem.removeEventListener("scroll", update);
			}
		};
	}, [editor, updateTextFormatFloatingToolbar, anchorElem]);

	useEffect(() => {
		editor.getEditorState().read(() => {
			updateTextFormatFloatingToolbar();
		});
		return mergeRegister(
			editor.registerUpdateListener(({ editorState }) => {
				editorState.read(() => {
					updateTextFormatFloatingToolbar();
				});
			}),

			editor.registerCommand(
				SELECTION_CHANGE_COMMAND,
				() => {
					updateTextFormatFloatingToolbar();
					return false;
				},
				COMMAND_PRIORITY_LOW
			)
		);
	}, [editor, updateTextFormatFloatingToolbar]);

	return (
		<div
			style={{
				display: "flex",
				background: "#fff",
				padding: 4,
				verticalAlign: "middle",
				position: "absolute",
				top: 0,
				left: 0,
				zIndex: 10,
				opacity: 0,
				backgroundColor: "#fff",
				boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.3)",
				borderRadius: 8,
				transition: "opacity 0.5s",
				height: 35,
				willChange: "transform",
			}}
			className="toolbar"
			ref={popupCharStylesEditorRef}
		>
			{editor.isEditable() && (
				<>
					<button
						onClick={() => {
							editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
						}}
						className={
							"toolbar-item spaced " + (isBold ? "active" : "")
						}
						style={{ alignItems: "center" }}
						aria-label="Format Bold"
					>
						<i className="format bold" />
					</button>

					<button
						style={{ alignItems: "center" }}
						onClick={() => {
							editor.dispatchCommand(
								FORMAT_TEXT_COMMAND,
								"italic"
							);
						}}
						className={
							"toolbar-item spaced " + (isItalic ? "active" : "")
						}
						aria-label="Format Italics"
					>
						<i className="format italic" />
					</button>

					<button
						style={{ alignItems: "center" }}
						onClick={() => {
							editor.dispatchCommand(
								FORMAT_TEXT_COMMAND,
								"underline"
							);
						}}
						className={
							"toolbar-item spaced " +
							(isUnderline ? "active" : "")
						}
						aria-label="Format Underline"
					>
						<i className="format underline" />
					</button>

					{/* <button
						onClick={() => {
							editor.dispatchCommand(
								FORMAT_TEXT_COMMAND,
								"strikethrough"
							);
						}}
						color={isStrikethrough ? "secondary" : undefined}
					>
						<StrikethroughSOutlinedIcon />
					</button> */}

					{/* <button
						onClick={() => {
							editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
						}}
						color={isCode ? "secondary" : undefined}
					>
						<CodeIcon />
					</button> */}

					<button
						style={{ alignItems: "center" }}
						onClick={insertLink}
						className={
							"toolbar-item spaced " + (isLink ? "active" : "")
						}
						aria-label="Insert Link"
					>
						<i className="format link" />
					</button>
				</>
			)}
		</div>
	);
}

function useFloatingTextFormatToolbar(
	editor: LexicalEditor,
	anchorElem: HTMLElement
) {
	const [isText, setIsText] = useState(false);
	const [isLink, setIsLink] = useState(false);
	const [isBold, setIsBold] = useState(false);
	const [isItalic, setIsItalic] = useState(false);
	const [isUnderline, setIsUnderline] = useState(false);
	const [isStrikethrough, setIsStrikethrough] = useState(false);
	const [isSubscript, setIsSubscript] = useState(false);
	const [isSuperscript, setIsSuperscript] = useState(false);
	const [isCode, setIsCode] = useState(false);

	const updatePopup = useCallback(() => {
		editor.getEditorState().read(() => {
			// Should not to pop up the floating toolbar when using IME input
			if (editor.isComposing()) {
				return;
			}
			const selection = $getSelection();
			const nativeSelection = window.getSelection();
			const rootElement = editor.getRootElement();

			if (
				nativeSelection !== null &&
				(!$isRangeSelection(selection) ||
					rootElement === null ||
					!rootElement.contains(nativeSelection.anchorNode))
			) {
				setIsText(false);
				return;
			}

			if (!$isRangeSelection(selection)) {
				return;
			}

			const node = getSelectedNode(selection);

			// Update text format
			setIsBold(selection.hasFormat("bold"));
			setIsItalic(selection.hasFormat("italic"));
			setIsUnderline(selection.hasFormat("underline"));
			setIsStrikethrough(selection.hasFormat("strikethrough"));
			setIsSubscript(selection.hasFormat("subscript"));
			setIsSuperscript(selection.hasFormat("superscript"));
			setIsCode(selection.hasFormat("code"));

			// Update links
			const parent = node.getParent();
			if ($isLinkNode(parent) || $isLinkNode(node)) {
				setIsLink(true);
			} else {
				setIsLink(false);
			}

			if (
				!$isCodeHighlightNode(selection.anchor.getNode()) &&
				selection.getTextContent() !== ""
			) {
				setIsText($isTextNode(node));
			} else {
				setIsText(false);
			}

			const rawTextContent = selection
				.getTextContent()
				.replace(/\n/g, "");
			if (!selection.isCollapsed() && rawTextContent === "") {
				setIsText(false);
				return;
			}
		});
	}, [editor]);

	useEffect(() => {
		document.addEventListener("selectionchange", updatePopup);
		return () => {
			document.removeEventListener("selectionchange", updatePopup);
		};
	}, [updatePopup]);

	useEffect(() => {
		return mergeRegister(
			editor.registerUpdateListener(() => {
				updatePopup();
			}),
			editor.registerRootListener(() => {
				if (editor.getRootElement() === null) {
					setIsText(false);
				}
			})
		);
	}, [editor, updatePopup]);

	if (!isText || isLink) {
		return null;
	}

	return createPortal(
		<TextFormatFloatingToolbar
			editor={editor}
			anchorElem={anchorElem}
			isLink={isLink}
			isBold={isBold}
			isItalic={isItalic}
			isStrikethrough={isStrikethrough}
			isSubscript={isSubscript}
			isSuperscript={isSuperscript}
			isUnderline={isUnderline}
			isCode={isCode}
		/>,
		anchorElem
	);
}

export default function FloatingTextFormatToolbarPlugin({
	anchorElem = document.body,
}) {
	const [editor] = useLexicalComposerContext();
	return useFloatingTextFormatToolbar(editor, anchorElem);
}
