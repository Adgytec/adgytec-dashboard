"use client";

import React, { useContext, useEffect, useRef, useState } from "react";

import styles from "./profile.module.scss";
import { UserContext } from "@/components/AuthContext/authContext";
import Container from "@/components/Container/Container";
import Loader from "@/components/Loader/Loader";
import { validateName } from "@/helpers/validation";
import ChangePassword from "./component/ChangePassword";
import { handleModalClose, lightDismiss } from "@/helpers/modal";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

function Profile() {
	const userWithRole = useContext(UserContext);
	const user = userWithRole?.user;

	const router = useRouter();

	const [edit, setEdit] = useState<boolean>(false);
	const [name, setName] = useState(() => {
		return user?.displayName ? user.displayName : "";
	});
	const [updating, setUpdating] = useState(false);

	const changePasswordRef = useRef<HTMLDialogElement | null>(null);
	const nameRef = useRef<HTMLInputElement | null>(null);

	let d = new Date();
	if (user?.metadata.creationTime) d = new Date(user.metadata.creationTime);

	useEffect(() => {
		if (edit) nameRef.current?.focus();
	}, [edit]);

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
					<div className={styles.header}>
						<h1>{edit ? "Edit Profile" : "Profile"}</h1>

						<button
							data-type="link"
							onClick={() => setEdit((prev) => !prev)}
							disabled={updating}
						>
							{edit ? "Cancel" : "Edit"}
						</button>
					</div>

					<div className={styles.main}>
						<form>
							<div className={styles.input}>
								<label htmlFor="name">Name</label>
								<input
									id="name"
									type="text"
									disabled={!edit || updating}
									placeholder="name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									ref={nameRef}
								/>
							</div>

							<div className={styles.input}>
								<label>Email ID</label>
								<input
									type="email"
									value={user?.email ? user.email : ""}
									disabled
								/>
							</div>

							<div className={styles.inputGroup}>
								<div className={styles.input}>
									<label>Email Verified</label>
									<input
										type="text"
										value={
											user?.emailVerified
												? "true"
												: "false"
										}
										disabled
									/>
								</div>

								<div className={styles.input}>
									<label>Member Since</label>
									<input
										type="text"
										value={d.toDateString()}
										disabled
									/>
								</div>
							</div>
						</form>
					</div>

					<div className={styles.action}>
						<button
							data-type="button"
							data-variant="clear"
							disabled={updating}
							onClick={() => router.back()}
						>
							Go Back
						</button>

						{edit ? (
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
						) : (
							<button
								data-type="button"
								data-variant="secondary"
								onClick={() =>
									changePasswordRef.current?.showModal()
								}
							>
								Change Password
							</button>
						)}
					</div>
				</Container>
			</div>
		</>
	);
}

export default Profile;
