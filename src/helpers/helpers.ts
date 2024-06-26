import { CopyToClipboard } from "./type";

export const copyToClipboard: CopyToClipboard = (text) => {
	navigator.clipboard.writeText(text);
};

export function generateRandomString(): string {
	const charset =
		"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let result = "";
	const charsetLength = charset.length;

	for (let i = 0; i < 10; i++) {
		const randomIndex = Math.floor(Math.random() * charsetLength);
		result += charset[randomIndex];
	}

	return result;
}
