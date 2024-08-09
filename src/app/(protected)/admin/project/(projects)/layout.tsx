"use client";

import React from "react";
import styles from "./projects.module.scss";
import { usePathname } from "next/navigation";
import Container from "@/components/Container/Container";
import Link from "next/link";

interface ProjectLayoutProps {
	children: React.ReactNode;
}

const ProjectsLayout = ({ children }: ProjectLayoutProps) => {
	const pathname = usePathname();

	return (
		<div className={styles.layout}>
			<div className={styles.options}>
				<Container className={styles.links}>
					<Link
						href="/admin/project"
						data-active={pathname === "/admin/project"}
					>
						Active Projects
					</Link>

					<Link
						href="/admin/project/create"
						data-active={pathname === "/admin/project/create"}
					>
						Create New
					</Link>
				</Container>
			</div>

			<Container>{children}</Container>
		</div>
	);
};

export default ProjectsLayout;
