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
import Category from "./components/Category/Category";
import LinkHeader, { LinkItem } from "@/components/LinkHeader/LinkHeader";

interface ProjectDetailsProps {
	params: { projectId: string };
}

export interface Users {
	userId: string;
	name: string;
	email: string;
}

export interface Services {
	serviceId: string;
	serviceName: string;
	icon: string;
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

	const linkProps = useMemo(() => {
		return [
			{
				href: `/admin/project/${params.projectId}?view=users`,
				text: "Added Users",
				view: "users",
			},
			{
				href: `/admin/project/${params.projectId}?view=services`,
				text: "Added Services",
				view: "services",
			},
		] as LinkItem[];
	}, [params.projectId]);

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
			<Container className={styles.empty}>
				<Loader />
			</Container>
		);
	}

	if (!details) {
		return (
			<Container className={styles.empty}>
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
				return <Services details={details} setDetails={setDetails} />;
			default:
				return <h3>Please select an option to view the details.</h3>;
		}
	};

	return (
		<div className={styles.container}>
			<Container className={styles.project}>
				<div className={styles.back}>
					<Link data-type="link" href="/admin/project">
						Back
					</Link>
				</div>

				<div className={styles.details}>
					<h2>Details</h2>

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

				<div className={styles.category}>
					<h2>Category</h2>

					<Category />
				</div>
			</Container>

			<div className={styles.metadata}>
				<LinkHeader links={linkProps} />

				<Container>
					<div className={styles.info}>{handleInfo()}</div>
				</Container>
			</div>
		</div>
	);
};

export default ProjectDetails;
