"use client";

import React from "react";
import styles from "./user.module.scss";
import Container from "@/components/Container/Container";
import Link from "next/link";
import UserList from "./components/userList/UserList";

const UserAdmin = () => {
	return (
		<Container type="normal" className={styles.user}>
			<div className={styles.create}>
				<Link
					data-type="link"
					data-variant="secondary"
					href="user/create"
				>
					Create new user
				</Link>
			</div>

			<div className={styles.list_container}>
				<UserList />
			</div>
		</Container>
	);
};

export default UserAdmin;
