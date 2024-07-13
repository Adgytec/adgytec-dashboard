import React from "react";
import { Users } from "../../page";
import styles from "./users.module.scss";
import Link from "next/link";

interface AddedUsersProps {
	users: Users[];
}

const AddedUsers = ({ users }: AddedUsersProps) => {
	const userItems = users.map((user) => {
		return (
			<div className={styles.content} key={user.userId}>
				<p data-key="Name">{user.name}</p>
				<p data-key="Email">{user.email}</p>
			</div>
		);
	});

	return (
		<div className={styles.users}>
			<div className={styles.action}>
				<Link
					href={`?view=users&manage=true`}
					data-variant="primary"
					data-type="link"
				>
					Manage Users
				</Link>
			</div>
			{users.length === 0 ? (
				<div data-empty="true">
					<h3>No users are added</h3>
				</div>
			) : (
				<div className={styles.list}>
					<div className={styles.table}>
						<div className={styles.heading}>
							<h4>Name</h4>

							<h4>Email ID</h4>
						</div>

						{userItems}
					</div>
				</div>
			)}
		</div>
	);
};

export default AddedUsers;
