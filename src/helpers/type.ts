export const userRoles = {
	superAdmin: "super_admin",
	admin: "admin",
	user: "user",
};

export type ValidateEmail = (email: string) => boolean;

export type ValidateName = (fullName: string) => boolean;

export type ValdiateRole = (role: string) => boolean;

export type ValidateProjectName = (projectName: string) => boolean;

export type ValidateURL = (url: string) => boolean;

export type ValidateString = (str: string, length: number) => boolean;

export type CopyToClipboard = (text: string) => void;

export interface PageInfo {
	nextPage: boolean;
	cursor: string;
}
