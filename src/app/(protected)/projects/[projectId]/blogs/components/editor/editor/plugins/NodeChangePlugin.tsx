import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { $getNodeByKey, NodeMutation, NodeKey } from "lexical";
import ImageNode from "../nodes/ImageNode";
import { NewImages } from "../Editor";

interface NodeChangePluginProps {
	setNewImages: Dispatch<SetStateAction<NewImages[]>>;
}

function NodeChangePlugin({ setNewImages }: NodeChangePluginProps): null {
	const [editor] = useLexicalComposerContext();
	const imagesRef = useRef<Map<string, string>>(new Map());

	useEffect(() => {
		const handleMutations = (mutations: Map<NodeKey, NodeMutation>) => {
			mutations.forEach((mutation, nodeKey) => {
				editor.getEditorState().read(() => {
					const node: ImageNode | null = $getNodeByKey(nodeKey);

					if (mutation === "created" && node) {
						const path = node.getPath();
						imagesRef.current.set(nodeKey, path);

						setNewImages((prev) => {
							return prev.map((element) => {
								if (element.path === path) {
									return {
										...element,
										isRemoved: false,
									};
								}

								return element;
							});
						});
					} else if (mutation === "destroyed") {
						let path = imagesRef.current.get(nodeKey);
						if (!path) return;

						setNewImages((prev) => {
							return prev.map((element) => {
								if (element.path === path) {
									return {
										...element,
										isRemoved: true,
									};
								}

								return element;
							});
						});
					}
				});
			});
		};

		const unregisterMutationListener = editor.registerMutationListener(
			ImageNode,
			handleMutations
		);

		return () => {
			unregisterMutationListener();
		};
	}, [editor]);

	return null;
}

export default NodeChangePlugin;
