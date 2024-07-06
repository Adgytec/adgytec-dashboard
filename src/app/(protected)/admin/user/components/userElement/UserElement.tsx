"use client";

import React, { useContext, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./userElement.module.scss";
import { userObj } from "../userList/UserList";
import { handleEscModal, handleModalClose } from "@/helpers/modal";
import { faTrashCan, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loader from "@/components/Loader/Loader";
import { userRoles } from "@/helpers/type";
import { UserContext } from "@/components/AuthContext/authContext";
import { validateName, validateRole } from "@/helpers/validation";
import { toast } from "react-toastify";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";

interface UserElementProps {
	user: userObj;
	setUsers: React.Dispatch<React.SetStateAction<userObj[]>>;
}

const roles = [
	{
		key: userRoles.user,
		displayValue: "User",
	},
	{
		key: userRoles.admin,
		displayValue: "Admin",
	},
	{
		key: userRoles.superAdmin,
		displayValue: "Super Admin",
	},
];

const UserElement = ({ user, setUsers }: UserElementProps) => {
	const userWithRole = useContext(UserContext);
	const myRole = userWithRole ? userWithRole.role : null;
	const myUser = userWithRole ? userWithRole.user : null;

	let d = new Date(user.createdAt);
	const deleteConfirmRef = useRef<HTMLDialogElement | null>(null);
	const editRef = useRef<HTMLDialogElement | null>(null);

	const handleDeleteModalClose = () => handleModalClose(deleteConfirmRef);
	const handleEditModalClose = () => handleModalClose(editRef);

	const [deleting, setDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [editError, setEditError] = useState<string | null>(null);

	const [isEdit, setIsEdit] = useState(false);
	const [userInput, setUserInput] = useState({
		name: user.name,
		role: user.role,
	});
	const [updating, setUpdating] = useState(false);

	const handleDelete = async () => {
		setDeleting(true);

		const url = `${process.env.NEXT_PUBLIC_API}/user/${user.userId}`;
		const token = await myUser?.getIdToken();
		const headers = {
			Authorization: `Bearer ${token}`,
		};

		fetch(url, {
			method: "DELETE",
			headers,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) throw new Error(res.message);

				setUsers((prev) => {
					let temp = prev;

					return temp.toSpliced(
						temp.findIndex((u) => u.userId === user.userId),
						1
					);
				});
				toast.success("successfully deleted user");
			})
			.catch((err) => {
				setError(err.message);
			})
			.finally(() => setDeleting(false));
	};

	let actionDisabled = () => {
		if (myRole === userRoles.superAdmin) return false;
		if (myRole === userRoles.user) return true;

		if (user.role === userRoles.superAdmin) return true;
		if (myRole === user.role) return true;

		return false;
	};

	let updateDisabled = () => {
		if (userInput.name === user.name && userInput.role === user.role)
			return true;

		return false;
	};

	const handleInputChange = (
		e:
			| React.ChangeEvent<HTMLSelectElement>
			| React.ChangeEvent<HTMLInputElement>
	) => {
		let key = e.target.name;
		let value = e.target.value;

		setUserInput((prev) => ({ ...prev, [key]: value }));
	};

	const validateInput = (name: string, role: string) => {
		return validateName(name) && validateRole(role);
	};

	const handleUpdate = async () => {
		const { name, role } = userInput;
		if (!validateInput(name, role)) {
			setEditError("Invalid user details");
			return;
		}

		setUpdating(true);
		setEditError(null);

		const url = `${process.env.NEXT_PUBLIC_API}/user/${user.userId}`;
		const token = await myUser?.getIdToken();
		const headers = {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		};
		const body = JSON.stringify({
			name,
			role,
		});

		fetch(url, { method: "PATCH", headers, body })
			.then((res) => res.json())
			.then((res) => {
				if (res.error) throw new Error(res.message);

				toast.success("user updated");
				editRef.current?.close();
				setUsers((prev) => {
					return prev.map((u) =>
						u.userId === user.userId ? { ...u, name, role } : u
					);
				});
				setIsEdit(false);
			})
			.catch((err) => {
				setEditError(err.message);
			})
			.finally(() => {
				setUpdating(false);
			});
	};

	return (
		<>
			{createPortal(
				<>
					<dialog
						onKeyDown={handleEscModal}
						ref={deleteConfirmRef}
						className="delete-confirm"
					>
						<div className="delete-modal">
							<div className="modal-menu">
								<h2>Confirm User Deletion</h2>

								<button
									data-type="link"
									onClick={handleDeleteModalClose}
									title="close"
									disabled={deleting}
								>
									<FontAwesomeIcon icon={faXmark} />
								</button>
							</div>

							<div className="delete-content">
								<p>
									Are you sure you want to delete this user?
								</p>

								<p>
									Deleting this user will permanently remove
									their account and all associated data. This
									action cannot be undone.
								</p>
							</div>

							{error && <p className="error">{error}</p>}

							<div className="delete-action">
								<button
									data-type="link"
									disabled={deleting}
									onClick={handleDeleteModalClose}
								>
									Cancel
								</button>

								<button
									data-type="button"
									className={styles.delete}
									disabled={deleting || actionDisabled()}
									data-load={deleting}
									onClick={handleDelete}
									data-variant="error"
								>
									{deleting ? (
										<Loader variant="small" />
									) : (
										"Delete"
									)}
								</button>
							</div>
						</div>
					</dialog>

					<dialog ref={editRef}>
						<div className="modal">
							<div className="modal-menu">
								<h2>Edit User Details</h2>

								<button
									data-type="link"
									onClick={handleEditModalClose}
									title="close"
									disabled={updating}
								>
									<FontAwesomeIcon icon={faXmark} />
								</button>
							</div>

							<div className={styles.modalContent}>
								<div className={styles.input}>
									<label htmlFor="name">Name</label>
									<input
										id="name"
										type="text"
										name="name"
										value={userInput.name}
										onChange={handleInputChange}
										placeholder="Name..."
										disabled={updating}
									/>
								</div>

								<div className={styles.input}>
									<label htmlFor="user-role">Role</label>
									<select
										id="user-role"
										value={userInput.role}
										disabled={updating}
										onChange={handleInputChange}
										name="role"
									>
										{roles.map((val) => {
											let disabled =
												myRole === userRoles.superAdmin
													? false
													: myRole === val.key
													? true
													: val.key ===
													  userRoles.superAdmin;

											return (
												<option
													key={val.key}
													disabled={disabled}
													value={val.key}
												>
													{val.displayValue}
												</option>
											);
										})}
									</select>
								</div>

								{editError && (
									<p className="error">{editError}</p>
								)}
							</div>

							<div className="action">
								<button
									data-type="link"
									disabled={updating}
									onClick={handleEditModalClose}
								>
									Cancel
								</button>

								<button
									data-type="button"
									data-variant="secondary"
									disabled={
										updating ||
										actionDisabled() ||
										updateDisabled()
									}
									data-load={updating}
									onClick={handleUpdate}
								>
									{updating ? (
										<Loader variant="small" />
									) : (
										"Update User"
									)}
								</button>
							</div>
						</div>
					</dialog>
				</>,
				document.body
			)}

			<div className={styles.userCard}>
				<table>
					<tbody>
						<tr>
							<th>Name</th>
							<td>{user.name}</td>
						</tr>

						<tr>
							<th>Email</th>
							<td>{user.email}</td>
						</tr>

						<tr>
							<th>Role</th>
							<td>{user.role}</td>
						</tr>

						<tr>
							<th>Created At</th>
							<td>{d.toDateString()}</td>
						</tr>

						<tr>
							<th>Edit</th>
							<td>
								<button
									data-type="link"
									onClick={() => editRef.current?.showModal()}
									disabled={actionDisabled()}
								>
									<FontAwesomeIcon icon={faPenToSquare} />
								</button>
							</td>
						</tr>

						<tr>
							<th>Delete</th>
							<td>
								<button
									data-type="link"
									onClick={() =>
										deleteConfirmRef.current?.showModal()
									}
									disabled={actionDisabled()}
									data-variant="error"
								>
									<FontAwesomeIcon icon={faTrashCan} />
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			{/* for making odd and even child background color */}
			<span style={{ display: "none" }}></span>

			<div className={styles.userTable}>
				<p className={styles.name}>{user.name}</p>

				<p className={styles.email}>{user.email}</p>

				<p className={styles.role}>{user.role}</p>

				<p className={styles.created}>{d.toDateString()}</p>

				<p className={styles.edit}>
					<button
						data-type="link"
						onClick={() => editRef.current?.showModal()}
						disabled={actionDisabled()}
					>
						<FontAwesomeIcon icon={faPenToSquare} />
					</button>
				</p>

				<p className={styles.delete}>
					<button
						data-type="link"
						onClick={() => deleteConfirmRef.current?.showModal()}
						disabled={actionDisabled()}
						data-variant="error"
					>
						<FontAwesomeIcon icon={faTrashCan} />
					</button>
				</p>
			</div>
		</>
	);
};

export default UserElement;
