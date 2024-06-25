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
	const [manage, setManage] = useState(false);

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
				// console.error(err.message);
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
			<div
				style={{
					position: "absolute",
					inset: "0",
					display: "grid",
					placeItems: "center",
				}}
			>
				<Loader />
			</div>
		);
	}

	const handleManage = () => {
		setManage((prev) => !prev);
	};

	return (
		<Container type="normal" className={styles.detail}>
			<div>
				<button data-type="link" onClick={() => history.back()}>
					back
				</button>
			</div>

			{manage ? (
				<Manage
					handleManage={handleManage}
					getProjectDetail={getProjectDetail}
					users={details ? details.users : null}
					services={details ? details.services : null}
				/>
			) : (
				<Details
					projectId={params.projectId}
					user={user}
					details={details}
					handleManage={handleManage}
				/>
			)}
		</Container>
	);
};

export default ProjectDetails;
