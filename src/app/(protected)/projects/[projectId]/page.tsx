import Container from "@/components/Container/Container";
import styles from "./projectId.module.scss";

import React from "react";
import Image from "next/image";

const Project = ({ params }: { params: { projectId: string } }) => {
	return (
		<Container className={styles.home}>
			<h1> Welcome to the Adgytec Dashboard!👋</h1>

			<div className={styles.info}>
				<p>Select a service from the top right to proceed.</p>

				<p>
					If there are no services, please contact us at{" "}
					<a
						href="mailto:info@adgytec.in"
						data-type="link"
						data-variant="secondary"
					>
						info@adgytec.in
					</a>
				</p>
			</div>

			<div className={styles.image}>
				<Image
					src="/home.png"
					alt=""
					width={420}
					height={370}
					priority
				/>
			</div>
		</Container>
	);
};

export default Project;
