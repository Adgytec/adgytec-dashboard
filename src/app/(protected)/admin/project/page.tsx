"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import styles from "./project.module.scss";
import Container from "@/components/Container/Container";
import ModalCreateProject from "./components/ModalCreateProject";
import { handleEscModal, handleModalClose } from "@/helpers/modal";
import Loader from "@/components/Loader/Loader";
import { UserContext } from "@/components/AuthContext/authContext";
import ProjectElement from "./components/ProjectElement/ProjectElement";

export interface Project {
	projectId: string;
	projectName: string;
	createdAt: string;
}

const ProjectAdmin = () => {
	const userWithRole = useContext(UserContext);
	const user = userWithRole ? userWithRole.user : null;

	const createProjectRef = useRef<HTMLDialogElement | null>(null);

	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");

	useEffect(() => {
		getAllProjects();
	}, [userWithRole, user]);

	const getAllProjects = async () => {
		setLoading(true);
		const url = `${process.env.NEXT_PUBLIC_API}/projects`;
		const token = await user?.getIdToken();
		const headers = {
			Authorization: `Bearer ${token}`,
		};

		fetch(url, {
			method: "GET",
			headers,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) throw new Error(res.message);

				setProjects(res.data);
			})
			.catch((err) => {
				console.error(err.message);
			})
			.finally(() => {
				setLoading(false);
			});
	};

	let elements: React.JSX.Element[] = [];
	projects.forEach((project, ind) => {
		const { projectId, projectName } = project;
		let element = (
			<ProjectElement key={project.projectId} project={project} />
		);

		if (ind == 4) {
			console.log(project.createdAt);
		}

		if (search.length === 0) {
			elements.push(element);
			return;
		}

		if (
			projectId.toLowerCase().includes(search.toLowerCase()) ||
			projectName.toLowerCase().includes(search.toLowerCase())
		)
			elements.push(element);
	});

	return (
		<>
			<dialog
				ref={createProjectRef}
				className={styles.modal_create}
				onKeyDown={(e) => handleEscModal(e)}
			>
				<ModalCreateProject
					handleClose={() => handleModalClose(createProjectRef)}
					handleRefresh={getAllProjects}
				/>
			</dialog>

			<Container type="normal" className={styles.project}>
				<div className={styles.create}>
					<button
						data-type="button"
						data-variant="primary"
						onClick={() => createProjectRef.current?.showModal()}
					>
						Create new project
					</button>

					<button
						data-type="link"
						disabled={loading}
						onClick={getAllProjects}
					>
						Refresh
					</button>
				</div>

				<div className={styles.project_details}>
					<div
						className={styles.search}
						title="search project by project id or project name"
					>
						<input
							type="text"
							placeholder="Search project..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>

					<div
						className={styles.project_list}
						data-empty={
							projects.length === 0 || elements.length === 0
						}
						data-load={loading}
					>
						{loading && <Loader />}

						{!loading &&
						(elements.length === 0 || projects.length === 0) ? (
							<h3>No project exist</h3>
						) : (
							elements
						)}
					</div>
				</div>
			</Container>
		</>
	);
};

export default ProjectAdmin;
