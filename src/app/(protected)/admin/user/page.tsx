import React from "react";
import styles from "./user.module.scss";
import Container from "@/components/Container/Container";
import Link from "next/link";

const UserAdmin = () => {
	return (
		<Container type="normal" className={styles.user}>
			<div className={styles.create}>
				<Link
					data-type="link"
					data-variant="secondary"
					href="user/create"
				>
					Create
				</Link>
			</div>
		</Container>
	);
};

export default UserAdmin;
