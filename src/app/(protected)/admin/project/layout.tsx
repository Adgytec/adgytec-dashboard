import React from "react";
import styles from "./project.module.scss";
import Container from "@/components/Container/Container";

interface ProjectAdminLayoutProps {
	children: React.ReactNode;
}

const ProjectAdminLayout = ({ children }: ProjectAdminLayoutProps) => {
	return (
		<div className={styles.layout}>
			<div className={styles.heading}>
				<Container type="normal">
					<h1>Manage Projects</h1>
				</Container>
			</div>

			{children}
		</div>
	);
};

export default ProjectAdminLayout;
