import React from "react";
import { Users } from "../../page";
import styles from "./users.module.scss";
import Link from "next/link";
import { useParams } from "next/navigation";

interface AddedUsersProps {
	users: Users[];
}

const AddedUsers = ({ users }: AddedUsersProps) => {
	const params = useParams<{ projectId: string }>();

	const userItems = users.map((user) => {
		return (
			<div className={styles.content} key={user.id}>
				<p data-key="Name">{user.name}</p>
				<p data-key="Email">{user.email}</p>
			</div>
		);
	});

	return (
		<div className={styles.users}>
			<div className={styles.action}>
				<Link
					href={`/admin/project/${params.projectId}/manage-users`}
					data-variant="primary"
					data-type="link"
				>
					Manage Users
				</Link>
			</div>

			<div className={styles.list}>
				<div className={styles.table}>
					<div className={styles.heading}>
						<h4>Name</h4>

						<h4>Email ID</h4>
					</div>

					{userItems}
				</div>
			</div>
		</div>
	);
};

export default AddedUsers;
