import React from "react";
import { ProjectObj } from "../../page";
import styles from "./projectItem.module.scss";
import Link from "next/link";

interface ProjectItemProps {
	project: ProjectObj;
}

const ProjectItem = ({ project }: ProjectItemProps) => {
	let d = new Date(project.createdAt);

	return (
		<div className={styles.project}>
			<div>
				<Link
					href={`/projects/${project.projectId}`}
					data-type="link"
					data-variant="secondary"
				>
					{project.projectName}
				</Link>
			</div>
			<p>{d.toDateString()}</p>
		</div>
	);
};

export default ProjectItem;
