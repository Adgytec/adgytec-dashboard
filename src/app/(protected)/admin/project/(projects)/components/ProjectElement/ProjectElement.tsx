import Link from "next/link";
import React from "react";
import type { Project } from "../../page";
import styles from "./projectElement.module.scss";

interface ProjectElementProps {
    project: Project;
}

function ProjectElement({ project }: ProjectElementProps) {
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
                <Link
                    href={`project/${project.projectId}?view=users`}
                    data-type="link"
                >
                    {project.projectName}
                </Link>

                <p className={styles.date}>Created at: {d.toDateString()}</p>
            </div>
        </div>
    );
}

export default ProjectElement;
