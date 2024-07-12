"use client";

import { UserContext } from "@/components/AuthContext/authContext";
import Loader from "@/components/Loader/Loader";
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Details from "./components/Details/Details";
import Container from "@/components/Container/Container";
import styles from "./project.module.scss";
import Manage from "./components/Manage/Manage";
import { copyToClipboard } from "@/helpers/helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-regular-svg-icons";

interface ProjectDetailsProps {
	params: { projectId: string };
}

export interface Users {
	id: string;
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
				<h3>Project doesn't exist</h3>
			</Container>
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

	return (
		<div className={styles.container}>
			<Container type="normal" className={styles.project}>
				<div className={styles.back}>
					<button data-type="link" onClick={() => history.back()}>
						Back
					</button>
				</div>

				<div className={styles.details}>
					<div className={styles.image}>
						<label>Project Logo</label>

						<img src={details.cover} alt={details.projectName} />
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
		</div>
	);
};

export default ProjectDetails;
