"use client";

import { UserContext } from "@/components/AuthContext/authContext";
import Loader from "@/components/Loader/Loader";
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import Container from "@/components/Container/Container";
import styles from "./project.module.scss";
import { copyToClipboard } from "@/helpers/helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-regular-svg-icons";
import Link from "next/link";
import Users from "./components/Users/Users";
import Services from "./components/Services/Services";
import Image from "next/image";
import ManageUsers from "./components/Manage/ManageUsers/ManageUsers";

interface ProjectDetailsProps {
	params: { projectId: string };
}

export interface Users {
	userId: string;
	name: string;
	email: string;
}

export interface Services {
	id: string;
	name: string;
}

export interface ProjectDetails {
	projectName: string;
	createdAt: string;
	publicToken: string;
	users: Users[];
	services: Services[];
	cover: string;
}

const ProjectDetails = ({ params }: ProjectDetailsProps) => {
	const userWithRole = useContext(UserContext);
	const user = useMemo(
		() => (userWithRole ? userWithRole.user : null),
		[userWithRole]
	);

	const router = useRouter();

	const [details, setDetails] = useState<ProjectDetails | null>(null);
	const [loading, setLoading] = useState(true);
	const [isText, setIsText] = useState(false);

	const searchParams = useSearchParams();
	const view = searchParams.get("view");
	const manange = searchParams.get("manage");

	const getProjectDetail = useCallback(async () => {
		const url = `${process.env.NEXT_PUBLIC_API}/project/${params.projectId}`;
		const token = await user?.getIdToken();
		const headers = {
			Authorization: `Bearer ${token}`,
		};

		fetch(url, {
			method: "GET",
			headers,
		})
			.then((res) => {
				if (res.status === 404) {
					router.push("/admin/project");
				}
				return res.json();
			})
			.then((res) => {
				if (res.error) throw new Error(res.message);

				setDetails(res.data);
			})
			.catch((err) => {
				toast.error(err.message);
			})
			.finally(() => {
				setLoading(false);
			});
	}, [user, router, params.projectId]);

	useEffect(() => {
		getProjectDetail();
	}, [getProjectDetail]);

	if (loading) {
		return (
			<Container type="normal" className={styles.empty}>
				<Loader />
			</Container>
		);
	}

	if (!details) {
		return (
			<Container type="normal" className={styles.empty}>
				<h3>Project doesn&apos;t exist</h3>
			</Container>
		);
	}

	if (manange === "true" && view === "users") {
		return (
			<ManageUsers
				details={details}
				setDetails={setDetails}
				projectName={details.projectName}
			/>
		);
	}

	let createdAt = new Date(details.createdAt);

	const handleMouseOver = () => {
		setIsText(true);
	};

	const handleMouseOut = () => {
		setIsText(false);
	};

	const handleClick = () => {
		if (!isText) return;

		copyToClipboard(details.publicToken);
		toast.success("Client token copied to clipboard");
	};

	const handleInfo = () => {
		switch (view) {
			case "users":
				return <Users users={details.users} />;
			case "services":
				return <Services services={details.services} />;
			default:
				return <h3>Please select an option to view the details.</h3>;
		}
	};

	return (
		<div className={styles.container}>
			<Container type="normal" className={styles.project}>
				<div className={styles.back}>
					<Link data-type="link" href="/admin/project">
						Back
					</Link>
				</div>

				<div className={styles.details}>
					<div className={styles.image}>
						<label>Project Logo</label>

						<Image
							src={details.cover}
							alt={details.projectName}
							width={200}
							height={100}
						/>
					</div>

					<div className={styles.item}>
						<label>Project Name</label>

						<input
							type="text"
							value={details.projectName}
							disabled
						/>
					</div>

					<div className={styles.item_group}>
						<div className={styles.item}>
							<label>Created At</label>

							<input
								type="text"
								value={createdAt.toDateString()}
								disabled
							/>
						</div>

						<div className={styles.item}>
							<label>Public Secret Token</label>

							<input
								title="Click to copy"
								type={isText ? "text" : "password"}
								value={details.publicToken}
								disabled
								onMouseOver={handleMouseOver}
								onMouseOut={handleMouseOut}
							/>

							{/* <input
								title="Click to copy"
								type="text"
								value={details.publicToken}
								disabled
								onMouseOver={handleMouseOver}
								onMouseOut={handleMouseOut}
								data-hidden={!isText}
							/> */}

							{isText && (
								<button
									data-type="link"
									data-variant="primary"
									onClick={handleClick}
									className={styles.copy}
								>
									<FontAwesomeIcon icon={faCopy} />
								</button>
							)}
						</div>
					</div>
				</div>
			</Container>

			<div className={styles.metadata}>
				<div className={styles.options}>
					<Container type="normal" className={styles.links}>
						<Link href="?view=users" data-active={view === "users"}>
							Added Users
						</Link>

						<Link
							href="?view=services"
							data-active={view === "services"}
						>
							Added Services
						</Link>
					</Container>
				</div>
				<Container type="normal">
					<div className={styles.info}>{handleInfo()}</div>
				</Container>
			</div>
		</div>
	);
};

export default ProjectDetails;
