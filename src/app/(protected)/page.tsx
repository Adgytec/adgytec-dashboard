"use client";

import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { UserContext } from "@/components/AuthContext/authContext";
import styles from "./home.module.scss";
import Container from "@/components/Container/Container";

const AdminLinks = () => {
	return (
		<>
			<div>
				<Link href="/admin/user">Manage user</Link>
			</div>

			<div>
				<Link href="/admin/project">Manage Project</Link>
			</div>
		</>
	);
};

const Home = () => {
	const userWithRole = useContext(UserContext);
	const role = userWithRole?.role;

	// 0->super_admin, 1->admin, 2->user, 3->pending
	const roleEnum = () => {
		switch (role) {
			case "super_admin":
				return 0;
			case "admin":
				return 1;
			case "user":
				return 2;
			default:
				return 2;
		}
	};

	return (
		<div className={styles.home}>
			<Container type="normal" className={styles.container}>
				<h2>{role}</h2>

				<div className={styles.link}>
					{roleEnum() !== 2 && <AdminLinks />}

					<div>
						<Link href="/projects">Projects</Link>
					</div>
				</div>
			</Container>
		</div>
	);
};

export default Home;
