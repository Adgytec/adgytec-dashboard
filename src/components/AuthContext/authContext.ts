import { User } from "firebase/auth";
import { createContext } from "react";

export type UserWithRole = {
	user: User;
	role: string;
};

export const UserContext = createContext<UserWithRole | null>(null);
