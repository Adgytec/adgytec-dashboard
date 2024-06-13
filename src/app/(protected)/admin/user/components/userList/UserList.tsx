"use client";

import React, { useContext, useEffect, useState } from "react";
import styles from "./UserList.module.scss";
import { UserContext } from "@/components/AuthContext/authContext";
import Loader from "@/components/Loader/Loader";
import UserElement from "../userElement/UserElement";
import { toast } from "react-toastify";

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
					// console.error(err.message);
					toast.error(err.message);
				})
				.finally(() => {
					setLoading(false);
				});
		})();
	}, [userWithRole, user]);

	let elements: React.JSX.Element[] = [];
	users.forEach((user) => {
		const { userId, email, name, role: userRole } = user;
		let element = (
			<UserElement key={user.userId} user={user} setUsers={setUsers} />
		);

		if (search.length === 0) {
			elements.push(element);
			return;
		}

		if (
			userId.toLowerCase().includes(search.toLowerCase()) ||
			email.toLowerCase().includes(search.toLowerCase()) ||
			name.toLowerCase().includes(search.toLowerCase()) ||
			userRole.toLowerCase().includes(search.toLowerCase())
		)
			elements.push(element);
	});

	return (
		<div className={styles.container}>
			<div
				className={styles.search}
				title="search user by userid, email, name, or role"
			>
				<input
					type="text"
					placeholder="Search user..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
			</div>

			<div
				className={styles.user_list}
				data-load={loading}
				data-empty={users.length === 0 || elements.length === 0}
			>
				{loading && <Loader />}

				{!loading && (elements.length === 0 || users.length === 0) ? (
					<h3>No users exist</h3>
				) : (
					elements
				)}
			</div>
		</div>
	);
};

export default UserList;
