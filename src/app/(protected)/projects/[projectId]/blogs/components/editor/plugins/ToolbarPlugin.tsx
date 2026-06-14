import {
    Button,
    Divider,
    IconButton,
    Select,
    SelectItem,
    SelectList,
    SelectPopover,
    ToggleIconButton,
    Toolbar,
    useSnackbarQueue,
} from "@adgytec/adgytec-web-ui-components";
import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Bold,
    ChevronDown,
    Code,
    Heading1,
    Heading2,
    Image,
    Italic,
    Link,
    List,
    ListOrdered,
    Pilcrow,
    Quote,
    Redo2,
    Strikethrough,
    Underline,
    Undo2,
} from "lucide-react";

const blockTypeToIcon = {
    paragraph: Pilcrow,
    h1: Heading1,
    h2: Heading2,
    ul: List,
    ol: ListOrdered,
    quote: Quote,
    code: Code,
};

const supportedBlocks = [
    { key: "paragraph", name: "Normal", icon: Pilcrow },
    { key: "h1", name: "Large Heading", icon: Heading1 },
    { key: "h2", name: "Small Heading", icon: Heading2 },
    { key: "ul", name: "Bulleted List", icon: List },
    { key: "ol", name: "Numbered List", icon: ListOrdered },
    { key: "quote", name: "Quote", icon: Quote },
    { key: "code", name: "Code Block", icon: Code },
];

import {
    $createCodeNode,
    $isCodeNode,
    getCodeLanguages,
    getDefaultCodeLanguage,
} from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
    $isListNode,
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
    ListNode,
    REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    $createHeadingNode,
    $createQuoteNode,
    $isHeadingNode,
} from "@lexical/rich-text";
import {
    $isAtNodeEnd,
    $isParentElementRTL,
    $wrapNodes,
} from "@lexical/selection";
import { $getNearestNodeOfType, mergeRegister } from "@lexical/utils";
import {
    $createParagraphNode,
    $getNodeByKey,
    $getSelection,
    $isRangeSelection,
    type BaseSelection,
    CAN_REDO_COMMAND,
    CAN_UNDO_COMMAND,
    FORMAT_ELEMENT_COMMAND,
    FORMAT_TEXT_COMMAND,
    type LexicalEditor,
    REDO_COMMAND,
    SELECTION_CHANGE_COMMAND,
    UNDO_COMMAND,
} from "lexical";
import { useParams } from "next/navigation";
import {
    type MutableRefObject,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { SelectValue } from "react-aria-components";
import { createPortal } from "react-dom";

import { generateRandomString } from "@/helpers/helpers";
import type { NewImages } from "../../../create/page";
import { INSERT_IMAGE_COMMAND } from "../nodes/ImageNode";

const LowPriority = 1;

const supportedBlockTypes = new Set([
    "paragraph",
    "quote",
    "code",
    "h1",
    "h2",
    "ul",
    "ol",
]);

const _blockTypeToBlockName = {
    code: "Code Block",
    h1: "Large Heading",
    h2: "Small Heading",
    h3: "Heading",
    h4: "Heading",
    h5: "Heading",
    ol: "Numbered List",
    paragraph: "Normal",
    quote: "Quote",
    ul: "Bulleted List",
};

function positionEditorElement(editor: HTMLDivElement, rect: DOMRect | null) {
    if (rect === null) {
        editor.style.opacity = "0";
        editor.style.top = "-1000px";
        editor.style.left = "-1000px";
    } else {
        editor.style.opacity = "1";
        editor.style.top = `${
            rect.top + rect.height + window.pageYOffset + 10
        }px`;
        editor.style.left = `${
            rect.left +
            window.pageXOffset -
            editor.offsetWidth / 2 +
            rect.width / 2
        }px`;
    }
}

function FloatingLinkEditor({ editor }: { editor: LexicalEditor }) {
    const editorRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const mouseDownRef = useRef(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [isEditMode, setEditMode] = useState(false);
    const [lastSelection, setLastSelection] = useState<BaseSelection | null>(
        null
    );

    const updateLinkEditor = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            const node = getSelectedNode(selection);
            const parent = node.getParent();
            if ($isLinkNode(parent)) {
                setLinkUrl(parent.getURL());
            } else if ($isLinkNode(node)) {
                setLinkUrl(node.getURL());
            } else {
                setLinkUrl("");
            }
        }
        const editorElem = editorRef.current;
        const nativeSelection = window.getSelection();
        const activeElement = document.activeElement;

        if (editorElem === null) {
            return;
        }
        if (!nativeSelection) return;

        const rootElement = editor.getRootElement();
        if (
            selection !== null &&
            !nativeSelection.isCollapsed &&
            rootElement?.contains(nativeSelection.anchorNode)
        ) {
            const domRange = nativeSelection.getRangeAt(0);
            let rect: DOMRect;
            if (nativeSelection.anchorNode === rootElement) {
                let inner: HTMLElement | Element = rootElement;
                while (inner.firstElementChild != null) {
                    inner = inner.firstElementChild;
                }
                rect = inner.getBoundingClientRect();
            } else {
                rect = domRange.getBoundingClientRect();
            }

            if (!mouseDownRef.current) {
                positionEditorElement(editorElem, rect);
            }
            setLastSelection(selection);
        } else if (activeElement?.className !== "link-input") {
            positionEditorElement(editorElem, null);
            setLastSelection(null);
            setEditMode(false);
            setLinkUrl("");
        }

        return true;
    }, [editor]);

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    updateLinkEditor();
                });
            }),

            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                () => {
                    updateLinkEditor();
                    return true;
                },
                LowPriority
            )
        );
    }, [editor, updateLinkEditor]);

    useEffect(() => {
        editor.getEditorState().read(() => {
            updateLinkEditor();
        });
    }, [editor, updateLinkEditor]);

    useEffect(() => {
        if (isEditMode && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditMode]);

    return (
        <div ref={editorRef} className="link-editor">
            {isEditMode ? (
                <input
                    ref={inputRef}
                    className="link-input"
                    value={linkUrl}
                    onChange={(event) => {
                        setLinkUrl(event.target.value);
                    }}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            if (lastSelection !== null) {
                                if (linkUrl !== "") {
                                    editor.dispatchCommand(
                                        TOGGLE_LINK_COMMAND,
                                        linkUrl
                                    );
                                }
                                setEditMode(false);
                            }
                        } else if (event.key === "Escape") {
                            event.preventDefault();
                            setEditMode(false);
                        }
                    }}
                />
            ) : (
                <div className="link-input">
                    <a href={linkUrl} target="_blank" rel="noopener noreferrer">
                        {linkUrl}
                    </a>
                    <div
                        className="link-edit"
                        role="button"
                        tabIndex={0}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                            setEditMode(true);
                        }}
                    />
                </div>
            )}
        </div>
    );
}

function getSelectedNode(selection: any) {
    const anchor = selection.anchor;
    const focus = selection.focus;
    const anchorNode = selection.anchor.getNode();
    const focusNode = selection?.focus.getNode();
    if (anchorNode === focusNode) {
        return anchorNode;
    }
    const isBackward = selection?.isBackward();
    if (isBackward) {
        return $isAtNodeEnd(focus) ? anchorNode : focusNode;
    } else {
        return $isAtNodeEnd(anchor) ? focusNode : anchorNode;
    }
}

interface ToolbarPluginProps {
    uuidRef: MutableRefObject<string | null>;
    newImagesRef: MutableRefObject<NewImages[]>;
}

export default function ToolbarPlugin({
    uuidRef,
    newImagesRef,
}: ToolbarPluginProps) {
    const params = useParams<{ projectId: string }>();
    const snackbarQueue = useSnackbarQueue();

    const [editor] = useLexicalComposerContext();
    const toolbarRef = useRef<HTMLDivElement | null>(null);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [blockType, setBlockType] = useState("paragraph");
    const [selectedElementKey, setSelectedElementKey] = useState<string | null>(
        null
    );
    const handleBlockChange = (key: string) => {
        if (key === "paragraph") {
            if (blockType !== "paragraph") {
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        $wrapNodes(selection, () => $createParagraphNode());
                    }
                });
            }
        } else if (key === "h1") {
            if (blockType !== "h1") {
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        $wrapNodes(selection, () => $createHeadingNode("h1"));
                    }
                });
            }
        } else if (key === "h2") {
            if (blockType !== "h2") {
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        $wrapNodes(selection, () => $createHeadingNode("h2"));
                    }
                });
            }
        } else if (key === "ul") {
            if (blockType !== "ul") {
                editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, void "");
            } else {
                editor.dispatchCommand(REMOVE_LIST_COMMAND, void "");
            }
        } else if (key === "ol") {
            if (blockType !== "ol") {
                editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, void "");
            } else {
                editor.dispatchCommand(REMOVE_LIST_COMMAND, void "");
            }
        } else if (key === "quote") {
            if (blockType !== "quote") {
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        $wrapNodes(selection, () => $createQuoteNode());
                    }
                });
            }
        } else if (key === "code") {
            if (blockType !== "code") {
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        $wrapNodes(selection, () => $createCodeNode());
                    }
                });
            }
        }
    };
    const [codeLanguage, setCodeLanguage] = useState("");
    const [_isRTL, setIsRTL] = useState(false);
    const [isLink, setIsLink] = useState(false);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isStrikethrough, setIsStrikethrough] = useState(false);
    const [isCode, setIsCode] = useState(false);

    // my code
    const mediaRef = useRef<HTMLInputElement | null>(null);

    const updateToolbar = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();
            const element =
                anchorNode.getKey() === "root"
                    ? anchorNode
                    : anchorNode.getTopLevelElementOrThrow();
            const elementKey = element.getKey();
            const elementDOM = editor.getElementByKey(elementKey);
            if (elementDOM !== null) {
                setSelectedElementKey(elementKey);
                if ($isListNode(element)) {
                    const parentList = $getNearestNodeOfType(
                        anchorNode,
                        ListNode
                    );
                    const type = parentList
                        ? parentList.getTag()
                        : element.getTag();
                    setBlockType(type);
                } else {
                    const type = $isHeadingNode(element)
                        ? element.getTag()
                        : element.getType();
                    setBlockType(type);
                    if ($isCodeNode(element)) {
                        setCodeLanguage(
                            element.getLanguage() || getDefaultCodeLanguage()
                        );
                    }
                }
            }
            // Update text format
            setIsBold(selection.hasFormat("bold"));
            setIsItalic(selection.hasFormat("italic"));
            setIsUnderline(selection.hasFormat("underline"));
            setIsStrikethrough(selection.hasFormat("strikethrough"));
            setIsCode(selection.hasFormat("code"));
            setIsRTL($isParentElementRTL(selection));

            // Update links
            const node = getSelectedNode(selection);
            const parent = node.getParent();
            if ($isLinkNode(parent) || $isLinkNode(node)) {
                setIsLink(true);
            } else {
                setIsLink(false);
            }
        }
    }, [editor]);

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    updateToolbar();
                });
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                (_payload, _newEditor) => {
                    updateToolbar();
                    return false;
                },
                LowPriority
            ),
            editor.registerCommand(
                CAN_UNDO_COMMAND,
                (payload) => {
                    setCanUndo(payload);
                    return false;
                },
                LowPriority
            ),
            editor.registerCommand(
                CAN_REDO_COMMAND,
                (payload) => {
                    setCanRedo(payload);
                    return false;
                },
                LowPriority
            )
        );
    }, [editor, updateToolbar]);

    const codeLanguges = useMemo(() => getCodeLanguages(), []);
    const codeLanguageItems = useMemo(() => {
        return codeLanguges.map((lang) => ({
            key: lang,
            name: lang.charAt(0).toUpperCase() + lang.slice(1),
        }));
    }, [codeLanguges]);

    const handleCodeLanguageChange = useCallback(
        (value: string) => {
            editor.update(() => {
                if (selectedElementKey !== null) {
                    const node = $getNodeByKey(selectedElementKey);
                    if ($isCodeNode(node)) {
                        node.setLanguage(value);
                    }
                }
            });
        },
        [editor, selectedElementKey]
    );

    const insertLink = useCallback(() => {
        if (!isLink) {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://");
        } else {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        }
    }, [editor, isLink]);

    const insertMedia = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (!files) return;

            const acceptedType = [
                "image/png",
                "image/jpg",
                "image/jpeg",
                "image/webp",
                "image/svg+xml",
                "image/gif",
            ];

            let extension = files[0].type;

            if (!acceptedType.includes(extension)) {
                snackbarQueue.add({
                    supportingText:
                        "You need to select either '.png', '.jpg / .jpeg', '.webp', '.svg' or '.gif' images",
                });
                return;
            }
            extension = extension.replace(/(.*)\//g, "");

            if (extension === "svg+xml") extension = "svg";

            const src = URL.createObjectURL(files[0]);
            let path = `services/blogs/${params.projectId}/${
                uuidRef.current
            }/${generateRandomString()}.${extension}`;
            if (process.env.NEXT_PUBLIC_ENV === "DEV") {
                path = `dev/${path}`;
            }

            editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                src,
                path,
            });

            newImagesRef.current.push({
                path,
                file: files[0],
                isRemoved: false,
            });
        },
        [editor, newImagesRef, params.projectId, uuidRef, snackbarQueue.add]
    );

    const _CurrentBlockIcon =
        blockTypeToIcon[blockType as keyof typeof blockTypeToIcon] || Pilcrow;

    return (
        <Toolbar
            ref={toolbarRef}
            style={{
                justifyContent: "flex-start",
                overflowX: "auto",
                scrollbarWidth: "none",
            }}
        >
            <IconButton
                color="standard"
                icon={Undo2}
                isDisabled={!canUndo}
                onPress={() => {
                    editor.dispatchCommand(UNDO_COMMAND, void "");
                }}
                tooltip="Undo"
            />

            <IconButton
                color="standard"
                icon={Redo2}
                isDisabled={!canRedo}
                onPress={() => {
                    editor.dispatchCommand(REDO_COMMAND, void "");
                }}
                tooltip="Redo"
            />

            <Divider orientation="vertical" />

            {supportedBlockTypes.has(blockType) && (
                <>
                    <Select
                        aria-label="Formatting Options"
                        selectedKey={blockType}
                        onSelectionChange={(key) =>
                            handleBlockChange(key as string)
                        }
                        className="block-controls-select"
                    >
                        <Button
                            color="text"
                            shape="square"
                            iconPlacement="end"
                            icon={ChevronDown}
                        >
                            <SelectValue>
                                {({
                                    selectedText,
                                    isPlaceholder,
                                    defaultChildren,
                                }) =>
                                    isPlaceholder
                                        ? defaultChildren
                                        : selectedText
                                }
                            </SelectValue>
                        </Button>
                        <SelectPopover>
                            <SelectList items={supportedBlocks}>
                                {(item) => (
                                    <SelectItem
                                        id={item.key}
                                        label={item.name}
                                        leadingIcon={item.icon}
                                    />
                                )}
                            </SelectList>
                        </SelectPopover>
                    </Select>
                    <Divider orientation="vertical" />
                </>
            )}
            {blockType === "code" ? (
                <Select
                    aria-label="Code Language"
                    selectedKey={codeLanguage}
                    onSelectionChange={(key) =>
                        handleCodeLanguageChange(key as string)
                    }
                    className="code-language-select"
                >
                    <Button
                        color="text"
                        shape="square"
                        iconPlacement="end"
                        icon={ChevronDown}
                    >
                        <SelectValue>
                            {({
                                selectedText,
                                isPlaceholder,
                                defaultChildren,
                            }) =>
                                isPlaceholder ? defaultChildren : selectedText
                            }
                        </SelectValue>
                    </Button>
                    <SelectPopover>
                        <SelectList items={codeLanguageItems}>
                            {(item) => (
                                <SelectItem id={item.key} label={item.name} />
                            )}
                        </SelectList>
                    </SelectPopover>
                </Select>
            ) : (
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
                    <IconButton
                        color="standard"
                        icon={Image}
                        onPress={() => mediaRef.current?.click()}
                        tooltip="Insert Image"
                    />
                    <input
                        type="file"
                        accept=".jpg, .jpeg, .png, .webp, .gif, .svg"
                        style={{ display: "none" }}
                        ref={mediaRef}
                        onChange={insertMedia}
                    />
                    {isLink &&
                        createPortal(
                            <FloatingLinkEditor editor={editor} />,
                            document.body
                        )}
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
