import z from "zod";
import {
    userRoles,
    type ValdiateRole,
    type ValidateEmail,
    type ValidateName,
    type ValidateProjectName,
    type ValidateString,
    type ValidateURL,
} from "./type";

export type ValidationError = string | string[];
export type ValidationErrors = Record<string, ValidationError>;

export const validateEmail: ValidateEmail = (email) => {
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g;
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
    const regex = /^[a-zA-Z0-9\s\-_()]*$/;

    return projectName.length >= 3 && regex.test(projectName);
};

export const validateURL: ValidateURL = (url) => {
    const urlPattern =
        /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(:\d+)?(\/\S*)?$/;
    return urlPattern.test(url);
};

export const validateString: ValidateString = (str, length) => {
    return str.length >= length;
};
