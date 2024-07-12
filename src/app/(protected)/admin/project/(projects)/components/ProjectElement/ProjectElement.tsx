import React from "react";
import styles from "./projectElement.module.scss";
import Link from "next/link";
import { Project } from "../../page";

interface ProjectElementProps {
	project: Project;
}

function ProjectElement({ project }: ProjectElementProps) {
	let d = new Date(project.createdAt);

	return (
		<div className={styles.element}>
			<div className={styles.image}>
				<img src={project.cover} alt={project.projectName} />
			</div>

			<div className={styles.info}>
				<Link href={`project/${project.projectId}`} data-type="link">
					{project.projectName}
				</Link>

				<p className={styles.date}>Created at: {d.toDateString()}</p>
			</div>
		</div>
	);
}

export default ProjectElement;
