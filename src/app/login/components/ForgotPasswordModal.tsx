import React, { useRef, useState } from "react";
import styles from "../login.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import Loader from "@/components/Loader/Loader";
import { validateEmail } from "@/helpers/validation";
import { forgotPassword } from "@/firebase/auth/auth";

interface ForgotPasswordModalProps {
	handleClose: () => void;
}

const ForgotPasswordModal = ({ handleClose }: ForgotPasswordModalProps) => {
	const [email, setEmail] = useState<string>("");
	const [sending, setSending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);

	const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setSending(true);
		if (!validateEmail(email)) {
			setError("The email address provided is not valid.");
			setMessage(null);
			setSending(false);
			return;
		}

		const err = await forgotPassword(email);
		setSending(false);
		if (err) {
			setError(err.message);
			setMessage(null);
			return;
		}

		setEmail("");
		setMessage(
			"Password reset email sent. Please check your inbox and follow the instructions to reset your password."
		);
		setError(null);

		setTimeout(() => {
			setMessage(null);
		}, 6000);
	};

	return (
		<div className={styles.container}>
			<div className={styles.menu}>
				<h2>Reset Password</h2>

				<button data-type="link" onClick={handleClose} title="close">
					<FontAwesomeIcon icon={faXmark} />
				</button>
			</div>

			<form className={styles.form} onSubmit={handleReset}>
				<div className={styles.input}>
					<label htmlFor="email">Email</label>
					<input
						type="email"
						id="email"
						name="email"
						placeholder="Email..."
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						disabled={sending}
					/>
				</div>

				{error && <p className="error">{error}</p>}
				{message && <p className="message">{message}</p>}

				<div className={styles.button}>
					<button
						data-type="button"
						data-variant="secondary"
						type="submit"
						disabled={sending}
					>
						{sending ? <Loader variant="small" /> : "Reset"}
					</button>

					<button
						type="reset"
						onClick={handleClose}
						disabled={sending}
						data-type="link"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	);
};

export default ForgotPasswordModal;
