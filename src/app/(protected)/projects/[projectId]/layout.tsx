"use client";

import Container from "@/components/Container/Container";
import { useParams, usePathname, useRouter } from "next/navigation";
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

	const pathName = usePathname();
	const paths = pathName.split("/");

	const [project, setProject] = useState<ProjectObj>();
	const [loading, setLoading] = useState(true);
	const [activePath, setActivePath] = useState<string>("");

	useEffect(() => {
		getServicesByProjectId();
	}, []);

	useEffect(() => {
		const services = project?.services;
		if (!services) return;

		services.forEach((service) => {
			let active = paths.includes(service.name);
			if (active) setActivePath(service.name);
		});
	}, [project]);

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
		setActivePath(service);
		router.push(`/projects/${params.projectId}/${service}`);
	};

	const createLink = (ind: number) => {
		let url = "/projects";
		if (ind == 1) {
			return url;
		}

		url = url + `/${params.projectId}`;
		if (ind == 2) {
			return url;
		}

		url = url + `/${activePath}`;
		if (ind == 3) {
			return url;
		}

		return "/projects";
	};

	let breadCrumbItems: React.JSX.Element[] = [];
	paths.forEach((path, ind) => {
		if (path === "") return;

		const link = createLink(ind);
		let element = (
			<Link href={link} key={`path-${path}`} className={styles.item}>
				{ind === 2 ? project.projectName : path}
			</Link>
		);

		// if (ind !== 4) 
		if (ind !== paths.length - 1){ 
breadCrumbItems.push(element);
breadCrumbItems.push(<p> / </p>);}
else {
			breadCrumbItems.push(
				<p key={`path-${path}`} className={styles.item}>
					{ind === 2 ? project.projectName : path}
				</p>
			);
		}
	});

	return (
		<Container type="normal" className={styles.project}>
			<div className={styles.nav}>
				<div className={styles.bread_crumb}>
					{/* <p> */}
					{/* <Link href="/projects">Projects</Link> /{" "}
						{project.projectName} / {activePath} */}
					{breadCrumbItems}
					{/* </p> */}
				</div>

				{project.services.length > 0 && (
					<select onChange={handleChange} value={activePath}>
						<option value="">
							{project.services.length === 0
								? "No services in this project"
								: "Select a service"}
						</option>

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
