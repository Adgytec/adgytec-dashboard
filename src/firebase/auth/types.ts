import { FirebaseError } from "firebase/app";
import { User, UserCredential } from "firebase/auth";

export type GetUser = () => User | null;

export type Signin = (
	email: string,
	password: string,
	remember: boolean
) => Promise<{ user: UserCredential | null; error: FirebaseError | null }>;

export type ResendEmailVerification = () => Promise<
	FirebaseError | null | Error
>;

export type SignoutUser = () => Promise<FirebaseError | null>;

export type ForgotPassword = (email: string) => Promise<FirebaseError | null>;

export type ChangePassword = (
	password: string
) => Promise<FirebaseError | null | Error>;
