"use client";

import React, { useContext, useRef, useState } from "react";

import styles from "./profile.module.scss";
import { UserContext } from "@/components/AuthContext/authContext";
import Container from "@/components/Container/Container";
import Loader from "@/components/Loader/Loader";
import { validateName } from "@/helpers/validation";
import ChangePassword from "./component/ChangePassword";
import { handleModalClose, lightDismiss } from "@/helpers/modal";
import { toast } from "react-toastify";

function Profile() {
	const userWithRole = useContext(UserContext);
	const user = userWithRole?.user;

	const [edit, setEdit] = useState<boolean>(false);
	const [name, setName] = useState(() => {
		return user?.displayName ? user.displayName : "";
	});
	const [updating, setUpdating] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const changePasswordRef = useRef<HTMLDialogElement | null>(null);

	let d = new Date();
	if (user?.metadata.creationTime) d = new Date(user.metadata.creationTime);

	const handleUpdate = async () => {
		if (!validateName(name)) {
			toast.error("invalid name");

			return;
		}

		let uid = user?.uid;
		if (!uid || !user) {
			toast.error("The user is invalid.");
			return;
		}

		setUpdating(true);
		// setError(null);
		// setMessage(null);
		let url = `${process.env.NEXT_PUBLIC_API}/user/${uid}`;
		let token = await user.getIdToken();
		fetch(url, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				name,
			}),
		})
			.then((res) => res.json())
			.then(async (res) => {
				if (res.error) {
					throw new Error(res.message);
				}

				await user?.reload();
				toast.success("User updated successfully");
				setEdit(false);
			})
			.catch((err) => {
				toast.error(err.message);
			})
			.finally(() => setUpdating(false));
	};

	return (
		<>
			<dialog
				ref={changePasswordRef}
				className={styles.modal_changePassword}
				onClick={lightDismiss}
			>
				<ChangePassword
					handleClose={() => handleModalClose(changePasswordRef)}
				/>
			</dialog>

			<div className={styles.profile}>
				<Container type="normal" className={styles.container}>
					<div>
						<button
							data-type="link"
							onClick={() => setEdit((prev) => !prev)}
							disabled={updating}
						>
							{edit ? "Cancel" : "Edit"}
						</button>
					</div>
					<table className={styles.table}>
						<tbody>
							<tr>
								<th>Name</th>
								<td>
									{edit ? (
										<input
											type="text"
											placeholder="name"
											value={name}
											onChange={(e) =>
												setName(e.target.value)
											}
											autoFocus
											disabled={updating}
										/>
									) : (
										user?.displayName
									)}
								</td>
							</tr>

							<tr>
								<th>Email</th>
								<td>{user?.email}</td>
							</tr>

							<tr>
								<th>Email Verified</th>
								<td>
									{user?.emailVerified ? "true" : "false"}
								</td>
							</tr>

							<tr>
								<th>Memeber Since</th>
								<td>{d.toDateString()}</td>
							</tr>
						</tbody>
					</table>

					{error && <p className="error">{error}</p>}
					{message && <p className="message">{message}</p>}

					{edit && (
						<div>
							<button
								data-type="button"
								data-variant="secondary"
								disabled={
									user?.displayName === name || updating
								}
								data-load={updating ? "true" : "false"}
								onClick={handleUpdate}
							>
								{updating ? (
									<Loader variant="small" />
								) : (
									"Update"
								)}
							</button>
						</div>
					)}

					<div>
						<button
							data-type="link"
							data-variant="secondary"
							disabled={updating}
							onClick={() =>
								changePasswordRef.current?.showModal()
							}
						>
							Change Password
						</button>
					</div>
				</Container>
			</div>
		</>
	);
}

export default Profile;
