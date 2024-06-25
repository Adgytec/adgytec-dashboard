import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { $getNodeByKey, NodeMutation, NodeKey } from "lexical";
import ImageNode from "../nodes/ImageNode";

interface NodeChangePluginProps {
	setRemovedImages: Dispatch<SetStateAction<string[]>>;
}

function NodeChangePlugin({ setRemovedImages }: NodeChangePluginProps): null {
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

						setRemovedImages((prev) => {
							let ind = prev.indexOf(path);
							if (ind === -1) return prev;

							return prev.toSpliced(ind, 1);
						});
					} else if (mutation === "destroyed") {
						setRemovedImages((prev) => {
							let path = imagesRef.current.get(nodeKey);
							console.log(path);

							if (!path) return prev;
							return [...prev, path];
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
