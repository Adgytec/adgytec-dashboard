"use client";

import React, { useEffect, useRef, useState } from "react";

import styles from "./login.module.scss";
import Loader from "@/components/Loader/Loader";
import { validateEmail } from "@/helpers/validation";
import {
	auth,
	resendEmailVerification,
	signin,
	signoutUser,
} from "@/firebase/auth/auth";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import EmailConfirmModal from "./components/EmailConfirmModal";
import ForgotPasswordModal from "./components/ForgotPasswordModal";
import Image from "next/image";
import { handleModalClose, lightDismiss } from "@/helpers/modal";
import { userRoles } from "@/helpers/type";

const inputReset = {
	email: "",
	password: "",
	remember: false,
};

const Login = () => {
	const [errMessage, setErrMessage] = useState<string | null>(null);
	const [userInput, setUserInput] = useState(inputReset);
	const [signingIn, setSigningIn] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(true);

	const emailConfirmRef = useRef<HTMLDialogElement | null>(null);
	const forgotPasswordRef = useRef<HTMLDialogElement | null>(null);

	const router = useRouter();

	useEffect(() => {
		const authState = onAuthStateChanged(auth, async (user) => {
			if (user) {
				if (!user.emailVerified) {
					await resendEmailVerification();
					emailConfirmRef.current?.showModal();
					await signoutUser();
					setLoading(false);
					return;
				}

				

			
					router.push("/");
				
			} else {
				setLoading(false);
			}
		});

		return () => authState();
	}, [router]);

	const handleInputValidation = (email: string, password: string) => {
		if (!email || !validateEmail(email)) {
			setErrMessage("Invalid email value.");
			return false;
		}

		if (!password) {
			setErrMessage("Invalid password value.");
			return false;
		}

		return true;
	};

	const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setSigningIn(true);

		const { email, password, remember } = userInput;
		if (!handleInputValidation(email, password)) {
			setSigningIn(false);
			return;
		}

		setErrMessage(null);
		let { error } = await signin(email, password, remember);

		if (error) {
			setSigningIn(false);
			if (error.code === "auth/invalid-credential") {
				setErrMessage(
					"The email or password you entered is incorrect. Please try again."
				);
			} else {
				setErrMessage(
					"We encountered an unexpected error on our end. Please try refreshing the page or come back later. "
				);
			}
			return;
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let key = e.target.name;
		let value: string | boolean = e.target.value;
		if (key === "remember") value = e.target.checked;

		setUserInput((prev) => ({ ...prev, [key]: value }));
	};

	if (loading) {
		return (
			<div
				style={{
					width: "calc(var(--vw) * 100)",
					height: "100vb",
					display: "grid",
					placeItems: "center",
				}}
			>
				<Loader />
			</div>
		);
	}

	return (
		<>
			<dialog
				onClick={lightDismiss}
				ref={emailConfirmRef}
				className={styles.modal_emailVerification}
			>
				<EmailConfirmModal
					handleClose={() => handleModalClose(emailConfirmRef)}
				/>
			</dialog>

			<dialog
				onClick={lightDismiss}
				ref={forgotPasswordRef}
				className={styles.modal_forgotPassword}
			>
				<ForgotPasswordModal
					handleClose={() => handleModalClose(forgotPasswordRef)}
				/>
			</dialog>

			<div className={styles.login}>
				<div className={styles.login_modal}>
					<div className={styles.logo}>
						<a href="https://adgytec.in" target="_blank">
							<Image
								src="/logo.svg"
								alt="adgytec"
								width="250"
								height="50"
							/>
						</a>
					</div>

					<div className={styles.form}>
						<form onSubmit={handleLogin}>
							<div className={styles.input}>
								<label htmlFor="email">Email ID</label>
								<input
									type="email"
									name="email"
									id="email"
									placeholder="Email..."
									value={userInput.email}
									onChange={handleInputChange}
									required
									disabled={signingIn}
								/>
							</div>

							<div className={styles.input}>
								<label htmlFor="password">Password</label>
								<input
									type="password"
									name="password"
									id="password"
									placeholder="Password..."
									value={userInput.password}
									onChange={handleInputChange}
									required
									disabled={signingIn}
								/>
							</div>

							<div className={styles.input_check}>
								<input
									type="checkbox"
									name="remember"
									id="remember"
									checked={userInput.remember}
									onChange={handleInputChange}
									disabled={signingIn}
								/>
								<label htmlFor="remember">Remember me</label>
							</div>

							<div className={styles.button}>
								<button
									data-type="button"
									data-variant="secondary"
									disabled={signingIn}
									type="submit"
									data-load={signingIn ? "true" : "false"}
								>
									{signingIn ? (
										<Loader variant="small" />
									) : (
										"Login"
									)}
								</button>
							</div>

							{errMessage && (
								<p className="error">{errMessage}</p>
							)}
						</form>
					</div>

					<div className={styles.link}>
						<button
							data-type="link"
							onClick={() =>
								forgotPasswordRef.current?.showModal()
							}
						>
							Forgot Password?
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default Login;
