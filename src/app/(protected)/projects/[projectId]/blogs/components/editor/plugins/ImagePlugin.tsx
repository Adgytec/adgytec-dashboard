import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $insertNodes } from "lexical";
import { useEffect } from "react";
import { $createImageNode, INSERT_IMAGE_COMMAND } from "../nodes/ImageNode";

interface Payload {
    src: string;
    path: string;
}
function ImagePlugin(): null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        return editor.registerCommand<Payload>(
            INSERT_IMAGE_COMMAND,
            (payload: Payload) => {
                editor.update(() => {
                    const imageNode = $createImageNode(payload);
                    $insertNodes([imageNode]);
                });
                return true;
            },
            0
        );
    }, [editor]);

    return null;
}

export default ImagePlugin;
