import { CopyToClipboard } from "./type";

export const copyToClipboard: CopyToClipboard = (text) => {
	navigator.clipboard.writeText(text);
};
