import {
  browserSessionPersistence,
  getAuth,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  browserLocalPersistence,
  connectAuthEmulator,
} from "firebase/auth";
import firebaseApp from "../config";
import {
  ChangePassword,
  ForgotPassword,
  GetUser,
  ResendEmailVerification,
  Signin,
  SignoutUser,
} from "./types";
import { FirebaseError } from "firebase/app";

export const auth = getAuth(firebaseApp);
if (process.env.NEXT_PUBLIC_ENV === "DEV") {
  // connectAuthEmulator(auth, "http://127.0.0.1:9099");
}

export const getUser: GetUser = () => {
  return auth.currentUser;
};

export const signin: Signin = async (email, password, remember) => {
  let user = null,
    error = null;

  try {
    if (remember) {
      await setPersistence(auth, browserLocalPersistence);
    } else {
      await setPersistence(auth, browserSessionPersistence);
    }

    user = await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    error = err as FirebaseError;
  }

  return { user, error };
};

export const resendEmailVerification: ResendEmailVerification = async () => {
  let error = null;
  let user = getUser();

  if (!user) {
    return new Error("can't find user");
  }

  try {
    await sendEmailVerification(user);
  } catch (err) {
    error = err as FirebaseError;
  }

  return error;
};

export const signoutUser: SignoutUser = async () => {
  let error = null;

  try {
    await signOut(auth);
  } catch (err) {
    error = err as FirebaseError;
  }

  return error;
};

export const forgotPassword: ForgotPassword = async (email) => {
  let error = null;

  try {
    await sendPasswordResetEmail(auth, email);
  } catch (err) {
    error = err as FirebaseError;
  }

  return error;
};

export const changePassword: ChangePassword = async (password) => {
  let error = null;
  let user = getUser();

  if (!user) {
    return new Error("can't find user");
  }

  try {
    await updatePassword(user, password);
  } catch (err) {
    error = err as FirebaseError;
  }

  return error;
};
