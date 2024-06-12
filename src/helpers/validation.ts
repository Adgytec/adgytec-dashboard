import {
	userRoles,
	ValdiateRole,
	ValidateEmail,
	ValidateName,
	ValidateProjectName,
} from "./type";

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
	return (
		role === userRoles.superAdmin ||
		role === userRoles.admin ||
		role === userRoles.user
	);
};

export const validateProjectName: ValidateProjectName = (projectName) => {
	const regex = /^\b[A-Za-z0-9_]+(?:\s+[A-Za-z0-9_]+)*\b$/;
	return projectName.length >= 3 && regex.test(projectName);
};
