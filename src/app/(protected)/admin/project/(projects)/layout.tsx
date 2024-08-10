import React from "react";
import styles from "./projects.module.scss";
import { usePathname } from "next/navigation";
import Container from "@/components/Container/Container";
import Link from "next/link";
import LinkHeader from "@/components/LinkHeader/LinkHeader";

interface ProjectLayoutProps {
	children: React.ReactNode;
}

const linkProps = [
	{
		href: "/admin/project",
		text: "Active Projects",
	},
	{
		href: "/admin/project/create",
		text: "Create New",
	},
];

const ProjectsLayout = ({ children }: ProjectLayoutProps) => {
	return (
		<div className={styles.layout}>
			<LinkHeader links={linkProps} />

			<Container>{children}</Container>
		</div>
	);
};

export default ProjectsLayout;
