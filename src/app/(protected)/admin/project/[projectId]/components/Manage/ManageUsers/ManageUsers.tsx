import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import styles from "./manageUsers.module.scss";
import Container from "@/components/Container/Container";
import { UserContext } from "@/components/AuthContext/authContext";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ProjectDetails, Users } from "../../../page";
import Loader from "@/components/Loader/Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";

export interface UserObj {
	name: string;
	email: string;
	role?: string;
	userId: string;
	createdAt?: string;
}

interface ManageUsersProps {
	setDetails: React.Dispatch<React.SetStateAction<ProjectDetails | null>>;
	projectName: string;
	details: ProjectDetails;
}

const ManageUsers = ({
	details,
	setDetails,
	projectName,
}: ManageUsersProps) => {
	const userWithRole = useContext(UserContext);
	const user = useMemo(
		() => (userWithRole ? userWithRole.user : null),
		[userWithRole]
	);

	const params = useParams<{ projectId: string }>();
	const router = useRouter();

	const [users, setUsers] = useState<UserObj[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [adding, setAdding] = useState("");
	const [removing, setRemoving] = useState("");

	const addedUsers = details.users;

	const getAllUsers = useCallback(async () => {
		const url = `${process.env.NEXT_PUBLIC_API}/users?role=user`;
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
	}, [user]);

	useEffect(() => {
		getAllUsers();
	}, [getAllUsers]);

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

				// remove from project details users[]
				// and add user to users
				const user = addedUsers.find((el) => el.userId === userId);
				if (!user) return;

				setDetails((prev) => {
					if (!prev) return null;

					prev.users = prev.users.filter((u) => u.userId !== userId);
					return prev;
				});
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

				// add user to project details users[]
				const user = users.find((el) => el.userId === userId);
				if (!user) return;

				setDetails((prev) => {
					if (!prev) return null;

					prev.users = [...prev.users, user];

					return prev;
				});
			})
			.catch((err) => {
				toast.error(err.message);
			})
			.finally(() => setAdding(""));
	};

	let usersToAdd: React.JSX.Element[] = [];
	users.forEach((user) => {
		if (addedUsers?.some((u) => u.userId === user.userId)) {
			return;
		}

		const { email, name } = user;
		let element = (
			<div key={user.userId} className={styles.item}>
				<p data-key="Name">{user.name}</p>
				<p data-key="Email ID">{user.email}</p>

				<p data-key="Add">
					<span>
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
								<FontAwesomeIcon icon={faSquarePlus} />
							)}
						</button>
					</span>
				</p>
			</div>
		);

		if (search.length === 0) {
			usersToAdd.push(element);
			return;
		}

		if (
			email.toLowerCase().includes(search.toLowerCase()) ||
			name.toLowerCase().includes(search.toLowerCase())
		)
			usersToAdd.push(element);
	});

	return (
		<Container type="normal" className={styles.container}>
			<div className={styles.header}>
				<h2>{projectName}</h2>

				<button data-type="link" onClick={() => router.back()}>
					Back
				</button>
			</div>

			<div className={styles.content}>
				<div className={styles.added}>
					<div className={styles.title}>
						<h3>Added Users</h3>
					</div>

					{addedUsers.length === 0 ? (
						<div className={styles.empty}>
							<h4>No users are added.</h4>
						</div>
					) : (
						<div className={styles.table}>
							<div className={styles.heading}>
								<h4>Name</h4>
								<h4>Email ID</h4>
								<h4>Remove</h4>
							</div>

							{addedUsers.map((user) => {
								return (
									<div
										className={styles.item}
										key={user.userId}
									>
										<p data-key="Name">{user.name}</p>
										<p data-key="Email ID">{user.email}</p>

										<p data-key="Remove">
											<span>
												<button
													data-type="link"
													data-variant="error"
													disabled={
														removing.length > 0
													}
													data-load={
														removing === user.userId
													}
													onClick={() =>
														handleRemoveUser(
															user.userId
														)
													}
												>
													{removing ===
													user.userId ? (
														<Loader variant="small" />
													) : (
														<FontAwesomeIcon
															icon={faTrashCan}
														/>
													)}
												</button>
											</span>
										</p>
									</div>
								);
							})}
						</div>
					)}
				</div>

				<div className={styles.toAdd}>
					<div className={styles.title}>
						<h3>Add Users</h3>

						<div className={styles.search}>
							<input
								type="text"
								placeholder="Type to search..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								disabled={loading}
							></input>
						</div>
					</div>

					{loading ? (
						<div data-load="true">
							<Loader variant="small" />
						</div>
					) : usersToAdd.length === 0 ? (
						<div className={styles.empty}>
							<h4>No user to add.</h4>
						</div>
					) : (
						<div className={styles.table}>
							<div className={styles.heading}>
								<h4>Name</h4>
								<h4>Email ID</h4>
								<h4>Add</h4>
							</div>

							{usersToAdd}
						</div>
					)}
				</div>
			</div>
		</Container>
	);
};

export default ManageUsers;
