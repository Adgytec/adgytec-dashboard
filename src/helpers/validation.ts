import { ValidateEmail } from "./type";

export const validateEmail: ValidateEmail = (email) => {
	const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
	return emailRegex.test(email);
};
