import React, { useEffect, useState } from "react";
import styles from "../../project.module.scss";
import { Users } from "../../page";
import { User as AuthUser } from "firebase/auth";
import { toast } from "react-toastify";
import Loader from "@/components/Loader/Loader";
import { useParams } from "next/navigation";

interface UserProps {
	addedUsers: Users[] | null;
	getProjectDetail: () => void;
	user: AuthUser | null;
}

export interface UserObj {
	name: string;
	email: string;
	role: string;
	userId: string;
	createdAt: string;
}

const User = ({ user, addedUsers, getProjectDetail }: UserProps) => {
	const [users, setUsers] = useState<UserObj[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [adding, setAdding] = useState("");
	const [removing, setRemoving] = useState("");

	const params = useParams<{ projectId: string }>();

	useEffect(() => {
		getAllUsers();
	}, []);

	const getAllUsers = async () => {
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
	};

	if (loading) {
		return (
			<div
				style={{
					height: "20rem",
					display: "grid",
					placeItems: "center",
				}}
			>
				<Loader />
			</div>
		);
	}

	const handleRemoveUser = async (userId: string) => {
		setRemoving(userId);
		const url = `${process.env.NEXT_PUBLIC_API}/project/${params.projectId}/user`;
		const token = await user?.getIdToken();
		const headers = {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		};
		const body = JSON.stringify({
			userId,
		});

		fetch(url, {
			method: "DELETE",
			headers,
			body,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) throw new Error(res.message);
				toast.success("successfully removed user from project");
				getProjectDetail();
			})
			.catch((err) => {
				toast.error(err.message);
			})
			.finally(() => setRemoving(""));
	};

	const handleAddUser = async (userId: string) => {
		setAdding(userId);
		const url = `${process.env.NEXT_PUBLIC_API}/project/${params.projectId}/user`;
		const token = await user?.getIdToken();
		const headers = {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		};
		const body = JSON.stringify({
			userId,
		});

		fetch(url, {
			method: "POST",
			headers,
			body,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) throw new Error(res.message);
				toast.success("successfully added user to project");
				getProjectDetail();
			})
			.catch((err) => {
				toast.error(err.message);
			})
			.finally(() => setAdding(""));
	};

	let elements: React.JSX.Element[] = [];
	users.forEach((user) => {
		if (addedUsers?.some((u) => u.id === user.userId)) {
			return;
		}

		const { email, name } = user;
		let element = (
			<div key={user.userId} className={styles.users_item}>
				<p>
					<strong>Name: </strong> {user.name}
				</p>
				<p>
					<strong>Email: </strong> {user.email}
				</p>

				<div>
					<button
						data-type="link"
						data-variant="secondary"
						disabled={adding.length > 0}
						data-load={adding === user.userId}
						onClick={() => handleAddUser(user.userId)}
					>
						{adding === user.userId ? (
							<Loader variant="small" />
						) : (
							"Add"
						)}
					</button>
				</div>
			</div>
		);

		if (search.length === 0) {
			elements.push(element);
			return;
		}

		if (
			email.toLowerCase().includes(search.toLowerCase()) ||
			name.toLowerCase().includes(search.toLowerCase())
		)
			elements.push(element);
	});

	return (
		<div className={styles.users}>
			<div className={styles.users_container}>
				<h3>Added users</h3>

				<div className={styles.users_list}>
					{addedUsers && addedUsers.length > 0 ? (
						<>
							{addedUsers.map((user) => {
								return (
									<div
										className={styles.users_item}
										key={user.id}
									>
										<p>
											<strong>Name: </strong> {user.name}
										</p>
										<p>
											<strong>Email: </strong>{" "}
											{user.email}
										</p>

										<div>
											<button
												data-type="link"
												data-variant="error"
												disabled={removing.length > 0}
												data-load={removing === user.id}
												onClick={() =>
													handleRemoveUser(user.id)
												}
											>
												{removing === user.id ? (
													<Loader variant="small" />
												) : (
													"Remove"
												)}
											</button>
										</div>
									</div>
								);
							})}
						</>
					) : (
						<p>No users added</p>
					)}
				</div>
			</div>

			<div className={styles.users_container}>
				<h3>Add users</h3>

				<div title="serach user based on email or name">
					<input
						type="text"
						placeholder="Search..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					></input>
				</div>

				<div className={styles.users_list}>
					{elements.length > 0 ? (
						<>{elements}</>
					) : (
						<p>No users to add</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default User;
