import { type Dispatch, type SetStateAction, useState } from "react";
import type { FileElement } from "../FileInput";

export function useFile(): [
    FileElement[],
    Dispatch<SetStateAction<FileElement[]>>,
] {
    const [files, setFiles] = useState<FileElement[]>([]);

    return [files, setFiles];
}
