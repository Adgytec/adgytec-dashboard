import {
    Divider,
    IconButton,
    ToggleIconButton,
    Toolbar,
} from "@adgytec/adgytec-web-ui-components";
import { $isCodeHighlightNode } from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
    $getSelection,
    $isRangeSelection,
    $isTextNode,
    COMMAND_PRIORITY_LOW,
    FORMAT_ELEMENT_COMMAND,
    FORMAT_TEXT_COMMAND,
    type LexicalEditor,
    SELECTION_CHANGE_COMMAND,
} from "lexical";
import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Bold,
    Code,
    Italic,
    Link,
    Strikethrough,
    Underline,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
    isStrikethrough,
    isUnderline,
    isCode,
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
    function mouseUpListener(_e: MouseEvent) {
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
    }, [mouseUpListener, mouseMoveListener]);

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
            rootElement?.contains(nativeSelection.anchorNode)
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
        <Toolbar
            style={{
                maxInlineSize:
                    "min(calc(100svb - calc(32 * var(--dp, 1px))), calc(640* var(--dp, 1px)))",
                overflowX: "auto",
                scrollbarWidth: "none",
            }}
            variant="floating"
            color="vibrant"
            ref={popupCharStylesEditorRef}
        >
            {editor.isEditable() && (
                <>
                    <ToggleIconButton
                        color="standard"
                        icon={Bold}
                        isSelected={isBold}
                        onChange={() => {
                            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
                        }}
                        tooltip="Bold"
                    />

                    <ToggleIconButton
                        color="standard"
                        icon={Italic}
                        isSelected={isItalic}
                        onChange={() => {
                            editor.dispatchCommand(
                                FORMAT_TEXT_COMMAND,
                                "italic"
                            );
                        }}
                        tooltip="Italic"
                    />

                    <ToggleIconButton
                        color="standard"
                        icon={Underline}
                        isSelected={isUnderline}
                        onChange={() => {
                            editor.dispatchCommand(
                                FORMAT_TEXT_COMMAND,
                                "underline"
                            );
                        }}
                        tooltip="Underline"
                    />

                    <ToggleIconButton
                        color="standard"
                        icon={Strikethrough}
                        isSelected={isStrikethrough}
                        onChange={() => {
                            editor.dispatchCommand(
                                FORMAT_TEXT_COMMAND,
                                "strikethrough"
                            );
                        }}
                        tooltip="Strikethrough"
                    />

                    <ToggleIconButton
                        color="standard"
                        icon={Code}
                        isSelected={isCode}
                        onChange={() => {
                            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
                        }}
                        tooltip="Code"
                    />

                    <ToggleIconButton
                        color="standard"
                        icon={Link}
                        isSelected={isLink}
                        onChange={insertLink}
                        tooltip="Link"
                    />

                    <Divider orientation="vertical" />
                    <IconButton
                        color="standard"
                        icon={AlignLeft}
                        onPress={() => {
                            editor.dispatchCommand(
                                FORMAT_ELEMENT_COMMAND,
                                "left"
                            );
                        }}
                        tooltip="Left Align"
                    />
                    <IconButton
                        color="standard"
                        icon={AlignCenter}
                        onPress={() => {
                            editor.dispatchCommand(
                                FORMAT_ELEMENT_COMMAND,
                                "center"
                            );
                        }}
                        tooltip="Center Align"
                    />
                    <IconButton
                        color="standard"
                        icon={AlignRight}
                        onPress={() => {
                            editor.dispatchCommand(
                                FORMAT_ELEMENT_COMMAND,
                                "right"
                            );
                        }}
                        tooltip="Right Align"
                    />
                    <IconButton
                        color="standard"
                        icon={AlignJustify}
                        onPress={() => {
                            editor.dispatchCommand(
                                FORMAT_ELEMENT_COMMAND,
                                "justify"
                            );
                        }}
                        tooltip="Justify Align"
                    />
                </>
            )}
        </Toolbar>
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
