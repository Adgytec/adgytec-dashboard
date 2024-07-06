"use client";

import React, { useContext, useEffect, useMemo } from "react";
import styles from "./home.module.scss";
import Container from "@/components/Container/Container";
import { UserContext } from "@/components/AuthContext/authContext";
import { userRoles } from "@/helpers/type";
import { useRouter } from "next/navigation";

const Home = () => {
	const userWithRole = useContext(UserContext);
	const role = useMemo(() => {
		return userWithRole ? userWithRole.role : null;
	}, [userWithRole]);
	const router = useRouter();

	useEffect(() => {
		if (role === userRoles.user) {
			router.push("/projects");
		} else {
			router.push("/admin/user");
		}
	}, [role, router]);

	return (
		<div className={styles.home}>
			<Container type="normal" className={styles.container}>
				<h1> Welcome to the Adgytec Dashboard!</h1>

				<p>
					Here you can manage all your project content. Simply select
					an option from the navigation bar to get started.
				</p>
			</Container>
		</div>
	);
};

export default Home;
