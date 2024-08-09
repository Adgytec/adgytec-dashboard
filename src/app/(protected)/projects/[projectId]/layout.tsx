"use client";

import Container from "@/components/Container/Container";
import { useParams, usePathname, useRouter } from "next/navigation";
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
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
	const user = useMemo(
		() => (userWithRole ? userWithRole.user : null),
		[userWithRole]
	);

	const params = useParams<{ projectId: string }>();
	const router = useRouter();

	const pathName = usePathname();
	const paths = useMemo(() => pathName.split("/"), [pathName]);

	const [project, setProject] = useState<ProjectObj>();
	const [loading, setLoading] = useState(true);
	const [activePath, setActivePath] = useState<string>("");

	const getServicesByProjectId = useCallback(async () => {
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
	}, [user, params.projectId]);

	useEffect(() => {
		getServicesByProjectId();
	}, [getServicesByProjectId]);

	useEffect(() => {
		const services = project?.services;
		if (!services) return;

		services.forEach((service) => {
			let active = paths.includes(service.name);
			if (active) setActivePath(service.name);
		});
	}, [project, paths]);

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
		if (ind === 4) return;

		const url = createLink(ind);

		if (ind !== paths.length - 1) {
			let element = (
				<Link
					href={url}
					className={styles.item}
					key={`path-${path}-index-${ind}`}
					data-type="link"
					data-variant="primary"
				>
					{ind === 2 ? project.projectName : path}
				</Link>
			);

			breadCrumbItems.push(element);
			if (ind !== 3)
				breadCrumbItems.push(<p key={`seperator-${ind}`}> / </p>);
		} else {
			breadCrumbItems.push(
				<p key={`path-${path}-index-${ind}`} className={styles.item}>
					{ind === 2 ? project.projectName : path}
				</p>
			);
		}
	});

	return (
		<div className={styles.project}>
			<Container>
				<div className={styles.nav}>
					<div className={styles.bread_crumb}>
						<Link
							href="/projects"
							className={styles.item}
							data-type="link"
						>
							projects
						</Link>
						/
						<Link
							href={`/projects/${params.projectId}`}
							className={styles.item}
							data-type="link"
							data-variant="primary"
						>
							{project.projectName.toLowerCase()}
						</Link>
					</div>
					{project.services.length > 0 && (
						<div className={styles.select}>
							<select onChange={handleChange} value={activePath}>
								<option value="">Select a service</option>
								{project.services.map((service) => {
									return (
										<option
											key={service.id}
											value={service.name}
										>
											{service.name}
										</option>
									);
								})}
							</select>
						</div>
					)}
				</div>
			</Container>

			<div>{children}</div>
		</div>
	);
};

export default ProjectLayout;
