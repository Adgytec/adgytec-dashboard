"use client";

import React, { useContext, useEffect, useState } from "react";
import styles from "./UserList.module.scss";
import { UserContext } from "@/components/AuthContext/authContext";
import Loader from "@/components/Loader/Loader";
import UserElement from "../userElement/UserElement";
import { toast } from "react-toastify";
import { userRoles } from "@/helpers/type";

export interface userObj {
	name: string;
	email: string;
	role: string;
	userId: string;
	createdAt: string;
}

const UserList = () => {
	const userWithRole = useContext(UserContext);
	const user = userWithRole ? userWithRole.user : null;
	const role = userWithRole ? userWithRole.role : null;

	const [search, setSearch] = useState("");
	const [users, setUsers] = useState<userObj[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		(async function getUsers() {
			const url = `${process.env.NEXT_PUBLIC_API}/users`;
			const token = await user?.getIdToken();
			const headers = {
				Authorization: `Bearer ${token}`,
			};

			fetch(url, {
				headers,
			})
				.then((res) => res.json())
				.then((res) => {
					if (res.error) throw new Error(res.message);

					setUsers(res.data);
				})
				.catch((err) => {
					toast.error(err.message);
				})
				.finally(() => {
					setLoading(false);
				});
		})();
	}, [userWithRole, user]);

	let usersList: React.JSX.Element[] = [];
	users.forEach((user) => {
		const { userId, email, name, role: userRole } = user;

		if (
			role === userRoles.admin &&
			(userRole === userRoles.superAdmin || role === userRole)
		) {
			return;
		}
		let element = (
			<UserElement key={user.userId} user={user} setUsers={setUsers} />
		);

		if (search.length === 0) {
			usersList.push(element);
			return;
		}

		if (
			userId.toLowerCase().includes(search.toLowerCase()) ||
			email.toLowerCase().includes(search.toLowerCase()) ||
			name.toLowerCase().includes(search.toLowerCase()) ||
			userRole.toLowerCase().includes(search.toLowerCase())
		)
			usersList.push(element);
	});

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<h2>User Overview</h2>

				<input
					type="text"
					placeholder="Type to search..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					disabled={loading}
				/>
			</div>

			<div
				className={styles.users}
				data-load={loading}
				data-empty={users.length === 0 || usersList.length === 0}
			>
				{loading ? (
					<Loader />
				) : usersList.length === 0 || users.length === 0 ? (
					<h3>No users exist</h3>
				) : (
					<>
						<div className={styles.list}>
							<div className={styles.list_head}>
								<h4 className={styles.name}>Name</h4>
								<h4 className={styles.email}>Email</h4>
								<h4 className={styles.role}>Role</h4>
								<h4 className={styles.created}>Created At</h4>
								<h4 className={styles.edit}>Edit</h4>
								<h4 className={styles.delete}>Delete</h4>
							</div>

							{usersList}
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default UserList;
