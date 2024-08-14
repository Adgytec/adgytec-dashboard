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

	const getMetadataByProjectId = useCallback(async () => {
		const url = `${process.env.NEXT_PUBLIC_API}/client/projects/${params.projectId}/metadata`;
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
				console.log(res.data.categories);
				setProject(res.data);
			})
			.catch((err) => {
				toast.error(err.message);
			})
			.finally(() => setLoading(false));
	}, [user, params.projectId]);

	useEffect(() => {
		getMetadataByProjectId();
	}, [getMetadataByProjectId]);

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

	const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const service = e.target.value;
		setActivePath(service);
		router.push(`/projects/${params.projectId}/${service}`);
	};

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
						{project ? (
							<Link
								href={`/projects/${params.projectId}`}
								className={styles.item}
								data-type="link"
								data-variant="primary"
							>
								{project?.projectName.toLowerCase()}
							</Link>
						) : (
							<p data-variant="primary" data-type="link">
								Project not found
							</p>
						)}
					</div>
					{project && project.services.length > 0 && (
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

			{project ? (
				<div>{children}</div>
			) : (
				<Container>
					<div data-empty={true}>
						<h3>
							Oops, something went wrong! Give the page a refresh.
							If that doesn&apos;t work, let us know at{" "}
							<a
								href="mailto:info@adgytec.in"
								data-type="link"
								data-variant="primary"
							>
								info@adgytec.in
							</a>
						</h3>
					</div>
				</Container>
			)}
		</div>
	);
};

export default ProjectLayout;
