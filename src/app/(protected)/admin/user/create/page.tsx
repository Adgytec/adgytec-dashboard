"use client";

import React, { useContext, useEffect, useState } from "react";
import styles from "./create.module.scss";
import Container from "@/components/Container/Container";
import { UserContext } from "@/components/AuthContext/authContext";
import Loader from "@/components/Loader/Loader";
import {
	validateEmail,
	validateName,
	validateRole,
} from "@/helpers/validation";
import { userRoles } from "@/helpers/type";
import { toast } from "react-toastify";

const defaultInputValues = {
	name: "",
	email: "",
	role: "",
};

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

const CreateUser = () => {
	const userWithRole = useContext(UserContext);
	const user = userWithRole ? userWithRole.user : null;
	const role = userWithRole ? userWithRole.role : null;

	const [userInput, setUserInput] = useState(defaultInputValues);

	const [creating, setCreating] = useState<boolean>(false);

	const validateInput = (name: string, email: string, role: string) => {
		return validateName(name) && validateEmail(email) && validateRole(role);
	};

	const handleBack = () => {
		window.history.back();
	};

	const handleReset = () => {
		// handle manually resetting form values
		setUserInput(defaultInputValues);
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

	const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const { name, email, role } = userInput;
		if (!validateInput(name, email, role)) {
			toast.error("Invalid input values");
			return;
		}

		setCreating(true);
		const url = `${process.env.NEXT_PUBLIC_API}/user`;
		const token = await user?.getIdToken();
		const body = JSON.stringify({
			name,
			email,
			role,
		});
		const headers = {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		};

		fetch(url, {
			method: "POST",
			headers,
			body,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) throw new Error(res.message);

				toast.success("Successfully created new user");
				handleReset();
			})
			.catch((err) => {
				toast.error(err.message);
			})
			.finally(() => {
				setCreating(false);
			});
	};

	return (
		<div className={styles.form}>
			<h2>Create New User</h2>

			<form onSubmit={handleCreateUser}>
				<div className={styles.input}>
					<label htmlFor="email">Email ID</label>
					<input
						type="email"
						value={userInput.email}
						onChange={handleInputChange}
						id="email"
						name="email"
						placeholder="Email..."
						required
						disabled={creating}
					/>
				</div>

				<div className={styles.inputGroup}>
					<div className={styles.input}>
						<label htmlFor="name">Name</label>
						<input
							type="text"
							value={userInput.name}
							onChange={handleInputChange}
							id="name"
							name="name"
							placeholder="Name..."
							required
							disabled={creating}
						/>
					</div>

					<div className={styles.select}>
						<label htmlFor="role">Role</label>

						<select
							id="role"
							name="role"
							required
							value={userInput.role}
							onChange={handleInputChange}
							disabled={creating}
						>
							<option value="" disabled>
								Choose One
							</option>

							{roles.map((val) => {
								let disabled =
									role === userRoles.superAdmin
										? false
										: role === val.key
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
					</div>
				</div>

				<div className={styles.action}>
					<button
						data-type="button"
						type="reset"
						disabled={creating}
						onClick={handleReset}
						data-variant="clear"
					>
						Reset
					</button>

					<button
						data-type="button"
						data-variant="secondary"
						type="submit"
						disabled={creating}
						data-load={creating ? "true" : "false"}
					>
						{creating ? <Loader variant="small" /> : "Create User"}
					</button>
				</div>
			</form>
		</div>
	);
};

export default CreateUser;
