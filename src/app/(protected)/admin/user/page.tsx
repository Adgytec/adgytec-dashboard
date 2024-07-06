"use client";

import React from "react";
import styles from "./user.module.scss";
import UserList from "./components/userList/UserList";

const UserAdmin = () => {
	return (
		<div className={styles.container}>
			<UserList />
		</div>
	);
};

export default UserAdmin;
