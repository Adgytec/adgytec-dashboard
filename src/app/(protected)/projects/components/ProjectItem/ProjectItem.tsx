import Image from "next/image";
import Link from "next/link";
import React from "react";
import type { ProjectObj } from "../../page";
import styles from "./projectItem.module.scss";

interface ProjectItemProps {
    project: ProjectObj;
}

const ProjectItem = ({ project }: ProjectItemProps) => {
    const d = new Date(project.createdAt);

    return (
        <div className={styles.element}>
            <div className={styles.image}>
                <img
                    src={project.cover}
                    alt={project.projectName}
                    width={200}
                    height={100}
                />
            </div>

            <div className={styles.info}>
                <Link href={`projects/${project.projectId}`} data-type="link">
                    {project.projectName}
                </Link>

                <p className={styles.date}>Created at: {d.toDateString()}</p>
            </div>
        </div>
    );
};

export default ProjectItem;
