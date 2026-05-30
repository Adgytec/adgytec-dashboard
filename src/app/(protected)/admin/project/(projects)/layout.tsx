import type React from "react";
import Container from "@/components/Container/Container";
import LinkHeader from "@/components/LinkHeader/LinkHeader";
import styles from "./projects.module.scss";

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
