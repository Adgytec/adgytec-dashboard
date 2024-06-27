import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	Dispatch,
	MutableRefObject,
	SetStateAction,
	useEffect,
	useRef,
} from "react";
import { $getNodeByKey, NodeMutation, NodeKey } from "lexical";
import ImageNode from "../nodes/ImageNode";
import { NewImages } from "../Editor";

interface NodeChangePluginProps {
	setDeletedImages: Dispatch<SetStateAction<string[]>>;
	newImagesRef: MutableRefObject<NewImages[]>;
}

function NodeChangePlugin({
	setDeletedImages,
	newImagesRef,
}: NodeChangePluginProps): null {
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

						let isNewImage = newImagesRef.current.some((image) => {
							return image.path === path;
						});

						if (isNewImage) {
							newImagesRef.current = newImagesRef.current.map(
								(element) => {
									if (element.path === path) {
										return {
											...element,
											isRemoved: false,
										};
									}

									return element;
								}
							);
						} else {
							setDeletedImages((prev) =>
								prev.filter((el) => el !== path)
							);
						}
					} else if (mutation === "destroyed") {
						let path = imagesRef.current.get(nodeKey);
						if (!path) return;

						let isNewImage = newImagesRef.current.some((image) => {
							return image.path === path;
						});
						if (isNewImage) {
							newImagesRef.current = newImagesRef.current.map(
								(element) => {
									if (element.path === path) {
										return {
											...element,
											isRemoved: true,
										};
									}

									return element;
								}
							);
						} else {
							setDeletedImages((prev) => [...prev, path]);
						}
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
