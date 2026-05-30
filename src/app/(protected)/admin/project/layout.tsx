import type React from "react";
import Container from "@/components/Container/Container";
import styles from "./project.module.scss";

interface ProjectAdminLayoutProps {
    children: React.ReactNode;
}

const ProjectAdminLayout = ({ children }: ProjectAdminLayoutProps) => {
    return (
        <div className={styles.layout}>
            <div className={styles.heading}>
                <Container>
                    <h1>Manage Projects</h1>
                </Container>
            </div>

            {children}
        </div>
    );
};

export default ProjectAdminLayout;
