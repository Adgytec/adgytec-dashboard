import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
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
import { $getRoot, $insertNodes } from "lexical";
import ImageNode from "./nodes/ImageNode";
import AutoLinkPlugin from "./plugins/AutoLinkPlugin";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import FloatingTextFormatToolbarPlugin from "./plugins/FloatingTextFormatPlugin";
import ImagePlugin from "./plugins/ImagePlugin";
import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentLevelPlugin";
import NodeChangePlugin from "./plugins/NodeChangePlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import EditorTheme from "./themes/EditorTheme";

import "../../../../../../../styles/abstract/_lexical.scss";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TreeView } from "@lexical/react/LexicalTreeView";
import { useLexicalIsTextContentEmpty } from "@lexical/react/useLexicalIsTextContentEmpty";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    type Dispatch,
    type MutableRefObject,
    type SetStateAction,
    useRef,
    useState,
} from "react";
import { handleModalClose, lightDismiss } from "@/helpers/modal";
import type { BlogDetails, NewImages } from "../../create/page";
import styles from "./editor.module.scss";

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

    const previewRef = useRef<HTMLDialogElement | null>(null);
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
            previewRef.current?.showModal();
        });
    };

    const obj = {
        __html: previewContent,
    };

    return (
        <>
            <dialog
                ref={previewRef}
                onClick={lightDismiss}
                className={styles.preview}
            >
                <div className={styles.content}>
                    <div className={`modal-menu ${styles.menu}`}>
                        <h2>Blog Preview</h2>

                        <button
                            data-type="link"
                            onClick={() => handleModalClose(previewRef)}
                            title="close"
                        >
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>

                    <div
                        dangerouslySetInnerHTML={obj}
                        className={styles.previewBody}
                    ></div>
                </div>
            </dialog>
            <div className={styles.action}>
                <button
                    data-type="link"
                    // disabled={isEmpty}
                    onClick={handlePreview}
                >
                    Preview
                </button>

                <button
                    data-type="button"
                    data-variant="secondary"
                    // disabled={isEmpty}
                    onClick={handleEditorContent}
                >
                    Next
                </button>
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
