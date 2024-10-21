import { CopyToClipboard } from "./type";

export const KEYLIMIT = 6;

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

export function trimStringWithEllipsis(str: string, maxLength = 400) {
	if (str.length > maxLength) {
		return str.slice(0, maxLength) + "...";
	}
	return str;
}

const istOffset = 5.5 * 60 * 60 * 1000;
export function getNow() {
	const now = new Date();
	const istDate = new Date(now.getTime() + istOffset);
	const istISOString = istDate.toISOString().slice(0, -1);

	return istISOString;
}

export const blurDataUrl = [
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8f5OhHgAHEAJZIKi0jAAAAABJRU5ErkJggg==",
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==",
];
