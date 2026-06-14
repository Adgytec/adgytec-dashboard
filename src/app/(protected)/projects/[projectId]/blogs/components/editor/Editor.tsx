import {
    ActionDialog,
    Button,
    Modal,
    ModalOverlay,
} from "@adgytec/adgytec-web-ui-components";

import "../../../../../../../styles/abstract/_lexical.scss";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { $generateHtmlFromNodes } from "@lexical/html";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { TRANSFORMERS } from "@lexical/markdown";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { usePathname, useRouter } from "next/navigation";
import {
    type Dispatch,
    type MutableRefObject,
    type SetStateAction,
    useRef,
    useState,
} from "react";
import { DialogTrigger } from "react-aria-components";
import type { BlogDetails, NewImages } from "../../create/page";
import styles from "./editor.module.css";
import ImageNode from "./nodes/ImageNode";
import AutoLinkPlugin from "./plugins/AutoLinkPlugin";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import FloatingTextFormatToolbarPlugin from "./plugins/FloatingTextFormatPlugin";
import ImagePlugin from "./plugins/ImagePlugin";
import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentLevelPlugin";
import NodeChangePlugin from "./plugins/NodeChangePlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import EditorTheme from "./themes/EditorTheme";

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

interface EditorActionsProps {
    setBlogDetails: Dispatch<SetStateAction<BlogDetails>>;
}

function EditorActions({ setBlogDetails }: EditorActionsProps) {
    const [editor] = useLexicalComposerContext();
    // const isEmpty = useLexicalIsTextContentEmpty(editor);
    const pathName = usePathname();
    const router = useRouter();

    const _previewRef = useRef<HTMLDialogElement | null>(null);
    const [previewContent, setPreviewContent] = useState<string>(
        "<p>No content to preview</p>"
    );

    const handleEditorContent = () => {
        editor.getEditorState().read(() => {
            const htmlString = $generateHtmlFromNodes(editor, null);

            setBlogDetails((prev) => {
                return {
                    ...prev,
                    content: htmlString,
                };
            });

            router.push(`${pathName}?view=metadata`);
        });
    };

    const handlePreview = () => {
        editor.getEditorState().read(() => {
            const htmlString = $generateHtmlFromNodes(editor, null);
            setPreviewContent(htmlString);
        });
    };

    const obj = {
        __html: previewContent,
    };

    return (
        <>
            <div className={styles.action}>
                <DialogTrigger>
                    <Button color="text" onPress={handlePreview}>
                        Preview
                    </Button>

                    <ModalOverlay>
                        <Modal>
                            <ActionDialog
                                heading="Preview"
                                style={{
                                    maxInlineSize:
                                        "calc(1200 * var(--dp, 1px))",
                                }}
                                actions={[
                                    <Button key="done" slot="close">
                                        Done
                                    </Button>,
                                ]}
                            >
                                <div
                                    dangerouslySetInnerHTML={obj}
                                    className={styles.previewBody}
                                ></div>
                            </ActionDialog>
                        </Modal>
                    </ModalOverlay>
                </DialogTrigger>

                <Button onClick={handleEditorContent}>Next</Button>
            </div>

            {/* <TreeView
				viewClassName="tree-view-output"
				timeTravelPanelClassName="debug-timetravel-panel"
				timeTravelButtonClassName="debug-timetravel-button"
				timeTravelPanelSliderClassName="debug-timetravel-panel-slider"
				timeTravelPanelButtonClassName="debug-timetravel-panel-button"
				treeTypeButtonClassName=""
				editor={editor}
			/> */}
        </>
    );
}

interface EditorProps {
    uuidRef: MutableRefObject<string | null>;
    setBlogDetails: Dispatch<SetStateAction<BlogDetails>>;
    newImagesRef: MutableRefObject<NewImages[]>;
    setDeletedImages: Dispatch<SetStateAction<string[]>>;
    hidden: boolean;
}

export default function Editor({
    uuidRef,
    setBlogDetails,
    newImagesRef,
    setDeletedImages,
    hidden,
}: EditorProps) {
    return (
        <div className={styles.blogEditor} data-hidden={hidden}>
            <LexicalComposer initialConfig={editorConfig}>
                <div className={`editor-container ${styles.container}`}>
                    <ToolbarPlugin
                        uuidRef={uuidRef}
                        newImagesRef={newImagesRef}
                    />

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
                        <NodeChangePlugin
                            setDeletedImages={setDeletedImages}
                            newImagesRef={newImagesRef}
                        />
                    </div>

                    <EditorActions setBlogDetails={setBlogDetails} />
                </div>
            </LexicalComposer>
        </div>
    );
}
