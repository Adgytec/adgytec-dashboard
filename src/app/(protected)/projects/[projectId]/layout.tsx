"use client";

import Container from "@/components/Container/Container";
import { useParams, useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import styles from "./projectId.module.scss";
import { UserContext } from "@/components/AuthContext/authContext";
import Loader from "@/components/Loader/Loader";
import { toast } from "react-toastify";
import Link from "next/link";

interface ProjectObj {
	projectName: string;
	services: {
		id: string;
		name: string;
	}[];
}

const ProjectLayout = ({ children }: { children: React.ReactNode }) => {
	const userWithRole = useContext(UserContext);
	const user = userWithRole ? userWithRole.user : null;

	const params = useParams<{ projectId: string }>();
	const router = useRouter();
	const [project, setProject] = useState<ProjectObj>();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getServicesByProjectId();
	}, []);

	const getServicesByProjectId = async () => {
		const url = `${process.env.NEXT_PUBLIC_API}/client/projects/${params.projectId}/services`;
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

				setProject(res.data);
				if (res.data.services.length > 0) {
					const service = res.data.services[0].name;
					router.replace(`/projects/${params.projectId}/${service}`);
				}
			})
			.catch((err) => {
				toast.error(err.message);
			})
			.finally(() => setLoading(false));
	};

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

	if (!project) {
		return (
			<Container
				type="normal"
				style={{
					display: "grid",
					placeItems: "center",
					position: "absolute",
					inset: "0",
					background: "var(--bg-600)",
					borderRadius: "0.75em",
				}}
			>
				<h2>Something went wrong</h2>
			</Container>
		);
	}

	const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const service = e.target.value;
		router.push(`/projects/${params.projectId}/${service}`);
	};

	return (
		<Container type="normal" className={styles.project}>
			<div className={styles.nav}>
				<div className={styles.bread_crumb}>
					<p>
						<Link href="/projects">Projects</Link> /{" "}
						{project.projectName}
					</p>
				</div>

				{project.services.length > 0 && (
					<select
						onChange={handleChange}
						defaultValue={project.services[0].name}
					>
						{project.services.map((service) => {
							return (
								<option key={service.id} value={service.name}>
									{service.name}
								</option>
							);
						})}
					</select>
				)}
			</div>

			{children}
		</Container>
	);
};

export default ProjectLayout;
