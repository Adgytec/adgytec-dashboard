import { ValdiateRole, ValidateEmail, ValidateName } from "./type";

export const validateEmail: ValidateEmail = (email) => {
	const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
	return emailRegex.test(email);
};

export const validateName: ValidateName = (fullName) => {
	// Regular expression to allow alphabetic characters, spaces, hyphens, and apostrophes
	const pattern = /^[a-zA-Z]+(?:[' -][a-zA-Z]+)*$/;
	return pattern.test(fullName) && fullName.length >= 3;
};

export const validateRole: ValdiateRole = (role) => {
	const superAdmin = "super_admin",
		admin = "admin",
		user = "user";

	return role === superAdmin || role === admin || role === user;
};
