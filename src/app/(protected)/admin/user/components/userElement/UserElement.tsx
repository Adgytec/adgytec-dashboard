"use client";

import React, { useContext, useRef, useState } from "react";
import styles from "./userElement.module.scss";
import { userObj } from "../userList/UserList";
import { handleEscModal, handleModalClose } from "@/helpers/modal";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loader from "@/components/Loader/Loader";
import { userRoles } from "@/helpers/type";
import { UserContext } from "@/components/AuthContext/authContext";
import { validateName, validateRole } from "@/helpers/validation";
import { toast } from "react-toastify";

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
	const handleClose = () => handleModalClose(deleteConfirmRef);

	const [deleting, setDeleting] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
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
				// toast.error(err.message);
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
			// setError("invalid input");
			// setMessage(null);
			return;
		}

		setUpdating(true);
		// setError(null);
		// setMessage(null);

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

				// setMessage("user updated");
				toast.success("user updated");
				setUsers((prev) => {
					return prev.map((u) =>
						u.userId === user.userId ? { ...u, name, role } : u
					);
				});
				setIsEdit(false);
			})
			.catch((err) => {
				setError(err.message);
				// toast.error(err.message);
			})
			.finally(() => {
				setUpdating(false);
			});
	};

	return (
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
							onClick={handleClose}
							title="close"
							disabled={deleting}
						>
							<FontAwesomeIcon icon={faXmark} />
						</button>
					</div>

					<div className="delete-content">
						<p>Are you sure you want to delete this user?</p>

						<p>
							Deleting this user will permanently remove their
							account and all associated data. This action cannot
							be undone.
						</p>
					</div>

					{error && <p className="error">{error}</p>}

					<div className="delete-action">
						<button
							data-type="link"
							disabled={deleting}
							onClick={handleClose}
						>
							Cancel
						</button>

						<button
							data-type="button"
							className={styles.delete}
							disabled={deleting}
							data-load={deleting}
							onClick={handleDelete}
							data-variant="error"
						>
							{deleting ? <Loader variant="small" /> : "Delete"}
						</button>
					</div>
				</div>
			</dialog>

			<div className={styles.user}>
				<div className={styles.edit}>
					<button
						data-type="link"
						onClick={() => setIsEdit((prev) => !prev)}
						disabled={actionDisabled() || updating}
					>
						{isEdit ? "Cancel" : "Edit"}
					</button>
				</div>

				<p>
					<strong>Name:</strong>{" "}
					{isEdit ? (
						<input
							type="text"
							name="name"
							value={userInput.name}
							onChange={handleInputChange}
							placeholder="Name..."
							disabled={updating}
						/>
					) : (
						user.name
					)}
				</p>
				<p>
					<strong>Email:</strong> {user.email}
				</p>
				<p>
					<strong>Role:</strong>{" "}
					{isEdit ? (
						<select
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
										: val.key === userRoles.superAdmin;

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
					) : (
						user.role
					)}
				</p>
				<p>
					<strong>Created At:</strong> {d.toDateString()}
				</p>

				{isEdit && error && <p className="error">{error}</p>}
				{isEdit && message && <p className="message">{message}</p>}

				<div className={styles.action}>
					{isEdit && (
						<button
							data-type="button"
							data-variant="secondary"
							disabled={
								updating || actionDisabled() || updateDisabled()
							}
							data-load={updating}
							onClick={handleUpdate}
						>
							{updating ? <Loader variant="small" /> : "Update"}
						</button>
					)}

					<button
						data-type="link"
						data-variant="error"
						className={styles.delete}
						onClick={() => deleteConfirmRef.current?.showModal()}
						disabled={actionDisabled() || updating}
					>
						Delete
					</button>
				</div>
			</div>
		</>
	);
};

export default UserElement;
