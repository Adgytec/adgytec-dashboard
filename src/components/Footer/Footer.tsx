import React from "react";
import styles from "./footer.module.scss";
import Container from "../Container/Container";

function Footer() {
	return (
		<footer className={styles.footer}>
			<Container type="normal">
				<p className={styles.text}>
					© 2024 Adgytec All rights reserved.
				</p>
			</Container>
		</footer>
	);
}

export default Footer;
