import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey, type NodeKey, type NodeMutation } from "lexical";
import {
    type Dispatch,
    type MutableRefObject,
    type SetStateAction,
    useEffect,
    useRef,
} from "react";
import type { NewImages } from "../../../create/page";
import ImageNode from "../nodes/ImageNode";

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

                        const isNewImage = newImagesRef.current.some(
                            (image) => {
                                return image.path === path;
                            }
                        );

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
                    }
                    if (mutation === "destroyed") {
                        const path = imagesRef.current.get(nodeKey);
                        if (!path) return;

                        const isNewImage = newImagesRef.current.some(
                            (image) => {
                                return image.path === path;
                            }
                        );
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
    }, [editor, setDeletedImages, newImagesRef]);

    return null;
}

export default NodeChangePlugin;
