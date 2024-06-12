export const userRoles = {
	superAdmin: "super_admin",
	admin: "admin",
	user: "user",
};

export type ValidateEmail = (email: string) => boolean;

export type ValidateName = (fullName: string) => boolean;

export type ValdiateRole = (role: string) => boolean;

export type ValidateProjectName = (projectName: string) => boolean;
