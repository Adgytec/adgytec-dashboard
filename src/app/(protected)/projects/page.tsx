"use client";

import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import styles from "./project.module.scss";
import Container from "@/components/Container/Container";
import Loader from "@/components/Loader/Loader";
import { UserContext } from "@/components/AuthContext/authContext";
import { toast } from "react-toastify";
import ProjectItem from "./components/ProjectItem/ProjectItem";

export interface ProjectObj {
	projectName: string;
	projectId: string;
	createdAt: string;
}

const Project = () => {
	const userWithRole = useContext(UserContext);
	const user = useMemo(
		() => (userWithRole ? userWithRole.user : null),
		[userWithRole]
	);

	const [projects, setProjects] = useState<ProjectObj[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [search, setSearch] = useState("");

	const fetchAllProjectForUser = useCallback(async () => {
		const url = `${process.env.NEXT_PUBLIC_API}/client/projects`;
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
				toast.error(err.message);
			})
			.finally(() => {
				setLoading(false);
			});
	}, [user]);

	useEffect(() => {
		fetchAllProjectForUser();
	}, [fetchAllProjectForUser]);

	if (loading) {
		return (
			<div
				style={{
					display: "grid",
					placeItems: "center",
					position: "absolute",
					inset: "0",
				}}
			>
				<Loader />
			</div>
		);
	}

	let elements: React.JSX.Element[] = [];
	projects.forEach((project) => {
		const { projectName: name, projectId: id, createdAt } = project;

		let item = <ProjectItem key={id} project={project} />;

		if (search.length === 0) {
			elements.push(item);
			return;
		}

		if (name.toLowerCase().includes(search.toLowerCase())) {
			elements.push(item);
		}
	});

	return (
		<Container type="normal" className={styles.projects}>
			{projects.length > 1 && (
				<div>
					<input
						type="text"
						placeholder="Search..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
			)}

			{projects.length === 0 ? (
				<h3>You are not assocaited with any project</h3>
			) : elements.length === 0 ? (
				"No project"
			) : (
				elements
			)}
		</Container>
	);
};

export default Project;
