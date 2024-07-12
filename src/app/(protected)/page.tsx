"use client";

import React from "react";
import styles from "./home.module.scss";
import Container from "@/components/Container/Container";

const Home = () => {
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
