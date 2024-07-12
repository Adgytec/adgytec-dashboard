import { Dispatch, SetStateAction, useState } from "react";
import { FileElement } from "../FileInput";

export function useFile(): [
	FileElement[],
	Dispatch<SetStateAction<FileElement[]>>
] {
	const [files, setFiles] = useState<FileElement[]>([]);

	return [files, setFiles];
}
