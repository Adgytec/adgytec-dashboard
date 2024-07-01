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
import ImageNode from "./nodes/ImageNode";
import ImagePlugin from "./plugins/ImagePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { $getRoot, $insertNodes } from "lexical";
import NodeChangePlugin from "./plugins/NodeChangePlugin";

import "../../../../../../../styles/abstract/_lexical.scss";
import {
	Dispatch,
	MutableRefObject,
	SetStateAction,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { useLexicalIsTextContentEmpty } from "@lexical/react/useLexicalIsTextContentEmpty";

import styles from "./editor.module.scss";
import { BlogDetails, NewImages } from "../../create/page";
import { handleModalClose, lightDismiss } from "@/helpers/modal";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TreeView } from "@lexical/react/LexicalTreeView";
import { toast } from "react-toastify";
import { UserContext } from "@/components/AuthContext/authContext";
import { validateString } from "@/helpers/validation";
import { useParams } from "next/navigation";
import Loader from "@/components/Loader/Loader";
import { BlogItem } from "../../[blogId]/page";

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
	content: string;
	deletedImages: string[];
	newImagesRef: MutableRefObject<NewImages[]>;
	setBlogItem: React.Dispatch<React.SetStateAction<BlogItem | null>>;
	setEdit: React.Dispatch<React.SetStateAction<boolean>>;
}
function EditorActions({
	content,
	newImagesRef,
	deletedImages,
	setBlogItem,
	setEdit,
}: EditorActionsProps) {
	const userWithRole = useContext(UserContext);
	const user = useMemo(() => {
		return userWithRole ? userWithRole.user : null;
	}, [userWithRole]);

	const [editor] = useLexicalComposerContext();
	const isEmpty = useLexicalIsTextContentEmpty(editor);

	const params = useParams<{ projectId: string; blogId: string }>();
	const previewRef = useRef<HTMLDialogElement | null>(null);
	const initContentRef = useRef<string | null>(null);
	const [previewContent, setPreviewContent] = useState<string>(content);

	const [updating, setUpdating] = useState(false);

	useEffect(() => {
		return editor.update(() => {
			const parser = new DOMParser();
			const dom = parser.parseFromString(content, "text/html");
			const nodes = $generateNodesFromDOM(editor, dom);

			// Select the root
			const root = $getRoot();
			root.select();
			root.clear();

			// Insert them at a selection.
			$insertNodes(nodes);
			initContentRef.current = $generateHtmlFromNodes(editor, null);
		});
	}, [editor, content]);

	const updateBlogContent = async (htmlString: string) => {
		const token = await user?.getIdToken();
		const headers = {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		};

		if (deletedImages.length > 0) {
			const deleteMediaURL = `${process.env.NEXT_PUBLIC_API}/services/blogs/${params.projectId}/${params.blogId}/media`;
			const body = JSON.stringify({
				paths: deletedImages,
			});

			fetch(deleteMediaURL, {
				method: "DELETE",
				headers,
				body,
			})
				.then((res) => {
					return res.json();
				})
				.then((res) => {
					if (res.error) throw new Error(res.message);

					console.log("successfully deleted unused media");
				})
				.catch((err) => {
					console.error(err.message);
				});
		}

		const url = `${process.env.NEXT_PUBLIC_API}/services/blogs/${params.projectId}/${params.blogId}/content`;
		const body = JSON.stringify({
			content: htmlString,
		});

		fetch(url, {
			method: "PATCH",
			headers,
			body,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) throw new Error(res.message);

				toast.success("successfully updated blog content");
				setBlogItem((prev) => {
					if (!prev) return prev;

					return {
						...prev,
						content: htmlString,
					};
				});
				setEdit(false);
			})
			.catch((err) => {
				toast.error(err.message);
			})
			.finally(() => setUpdating(false));
	};

	const handleEditorContent = () => {
		if (updating) return;

		editor.getEditorState().read(async () => {
			let htmlString = $generateHtmlFromNodes(editor, null);

			if (!validateString(htmlString, 200)) {
				toast.error("blog content too short!");
				return;
			}

			setUpdating(true);
			const validNewFiles = newImagesRef.current.filter(
				(img) => !img.isRemoved
			);

			if (validNewFiles.length === 0) {
				updateBlogContent(htmlString);
				return;
			}

			const formData = new FormData();
			const metaData = validNewFiles.map(({ path }) => {
				return { path };
			});
			formData.append("metadata", JSON.stringify(metaData));
			validNewFiles.forEach(({ file }, index) => {
				formData.append(`media_${index}`, file);
			});

			const addMediaURL = `${process.env.NEXT_PUBLIC_API}/services/blogs/${params.projectId}/${params.blogId}/media`;
			const token = await user?.getIdToken();
			const headers = {
				Authorization: `Bearer ${token}`,
			};

			fetch(addMediaURL, {
				method: "POST",
				headers,
				body: formData,
			})
				.then((res) => res.json())
				.then((res) => {
					if (res.error) throw new Error(res.message);
					console.log(res.message);

					updateBlogContent(htmlString);
				})
				.catch((err) => {
					toast.error(err.message);
					setUpdating(false);
				});
		});
	};

	const handlePreview = () => {
		editor.getEditorState().read(() => {
			const htmlString = $generateHtmlFromNodes(editor, null);
			setPreviewContent(htmlString);
			previewRef.current?.showModal();
		});
	};

	let obj = {
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
					disabled={updating}
					onClick={handlePreview}
				>
					Preview
				</button>

				<button
					data-type="button"
					data-variant="secondary"
					disabled={isEmpty || updating}
					onClick={handleEditorContent}
					data-load={updating}
				>
					{updating ? <Loader variant="small" /> : "Update"}
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

interface EditEditorProps {
	uuidRef: MutableRefObject<string | null>;
	content: string;
	setBlogItem: React.Dispatch<React.SetStateAction<BlogItem | null>>;
	setEdit: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function EditEditor({
	uuidRef,
	content,
	setBlogItem,
	setEdit,
}: EditEditorProps) {
	const newImagesRef = useRef<NewImages[]>([]);
	const [deletedImages, setDeletedImages] = useState<string[]>([]);

	return (
		<div className={styles.blogEditor}>
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

					<EditorActions
						deletedImages={deletedImages}
						newImagesRef={newImagesRef}
						content={content}
						setBlogItem={setBlogItem}
						setEdit={setEdit}
					/>
				</div>
			</LexicalComposer>
		</div>
	);
}
