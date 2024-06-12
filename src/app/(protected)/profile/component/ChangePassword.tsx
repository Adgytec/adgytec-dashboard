import React, { useState } from "react";
import styles from "../profile.module.scss";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loader from "@/components/Loader/Loader";
import { changePassword } from "@/firebase/auth/auth";
import { toast } from "react-toastify";

interface ChangePasswordProps {
	handleClose: () => void;
}

const ChangePassword = ({ handleClose }: ChangePasswordProps) => {
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const [updating, setUpdating] = useState<boolean>(false);
	const [userInput, setUserinput] = useState({
		password: "",
		confirm: "",
	});

	const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const { password, confirm } = userInput;
		if (password !== confirm) {
			setError("Password doesn't match");
			return;
		}

		setUpdating(true);
		const err = await changePassword(password);
		setUpdating(false);

		if (err) {
			// setMessage(null);
			setError(err.message);
			return;
		}

		toast.success("Password changed successfully");
		setUserinput({
			password: "",
			confirm: "",
		});
		// setTimeout(() => {
		// 	setMessage(null);
		// }, 6000);
	};

	const handleUserInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		let key = e.target.name;
		let val = e.target.value;

		if (key === "confirm") {
			if (val !== userInput.password) {
				setError("Password doens't match");
			} else {
				setError(null);
			}
		}

		setUserinput((prev) => {
			return {
				...prev,
				[key]: val,
			};
		});
	};

	return (
		<div className={styles.modal}>
			<div className="modal-menu">
				<h2>Update Password</h2>

				<button data-type="link" onClick={handleClose} title="close">
					<FontAwesomeIcon icon={faXmark} />
				</button>
			</div>

			<form className={styles.form} onSubmit={handleReset}>
				<div className={styles.input}>
					<label htmlFor="password">Password</label>
					<input
						type="password"
						id="password"
						name="password"
						placeholder="Password..."
						value={userInput.password}
						onChange={handleUserInput}
						required
						disabled={updating}
					/>
				</div>

				<div className={styles.input}>
					<label htmlFor="confirm">Confirm Password</label>
					<input
						type="password"
						id="confirm"
						name="confirm"
						placeholder="Confirm Password..."
						value={userInput.confirm}
						onChange={handleUserInput}
						required
						disabled={updating}
					/>
				</div>

				{error && <p className="error">{error}</p>}
				{message && <p className="message">{message}</p>}

				<div className={styles.button}>
					<button
						data-type="button"
						data-variant="secondary"
						type="submit"
						disabled={updating}
						data-load={updating ? "true" : "false"}
					>
						{updating ? <Loader variant="small" /> : "Update"}
					</button>

					<button
						type="reset"
						onClick={handleClose}
						disabled={updating}
						data-type="link"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	);
};

export default ChangePassword;
