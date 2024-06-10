"use client";

import React, { useContext } from "react";

import styles from "./profile.module.scss";
import { UserContext } from "@/components/AuthContext/authContext";

function Profile() {
	const user = useContext(UserContext);
	console.log(user?.displayName);
	let d = new Date();
	if (user?.metadata.creationTime) d = new Date(user.metadata.creationTime);

	return (
		<div className={styles.profile}>
			<button data-type="link">Edit</button>
			{user?.displayName}
			{user?.email}
			{d.toDateString()}
			<button data-type="button" data-variant="secondary">
				Update password
			</button>
		</div>
	);
}

export default Profile;
