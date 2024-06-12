import React from "react";
import styles from "./projectElement.module.scss";
import { Project } from "../../page";
import Link from "next/link";

interface ProjectElementProps {
	project: Project;
}

function ProjectElement({ project }: ProjectElementProps) {
	let d = new Date(project.createdAt);
	return (
		<div className={styles.element}>
			<Link href={`project/${project.projectId}`}>
				{project.projectName}
			</Link>
			<p>{d.toDateString()}</p>
		</div>
	);
}

export default ProjectElement;
