"use client";

import { UserContext } from "@/components/AuthContext/authContext";
import Container from "@/components/Container/Container";
import Loader from "@/components/Loader/Loader";
import React, { useContext, useEffect, useState } from "react";
import styles from "./project.module.scss";
import { copyToClipboard } from "@/helpers/helpers";
import { toast } from "react-toastify";

interface ProjectDetailsProps {
	params: { projectId: string };
}

interface ProjectDetails {
	projectName: string;
	createdAt: string;
	publicToken: string;
	users: {
		id: string;
		name: string;
		email: string;
	}[];
}

const ProjectDetails = ({ params }: ProjectDetailsProps) => {
	const userWithRole = useContext(UserContext);
	const user = userWithRole ? userWithRole.user : null;

	const [details, setDetails] = useState<ProjectDetails>();
	const [loading, setLoading] = useState(true);
	const [show, setShow] = useState(false);

	useEffect(() => {
		getProjectDetail();
	}, [userWithRole, user]);

	const getProjectDetail = async () => {
		const url = `${process.env.NEXT_PUBLIC_API}/project/${params.projectId}`;
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

				setDetails(res.data);
			})
			.catch((err) => {
				console.error(err.message);
			})
			.finally(() => {
				setLoading(false);
			});
	};

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

	let d = new Date();
	if (details) d = new Date(details.createdAt);

	const handleClick = () => {
		setShow((prev) => !prev);
	};

	const handleCopy = () => {
		if (!details) return;

		copyToClipboard(details.publicToken);
		toast.success("Client token copied to clipboard");
	};

	return (
		<Container type="normal" className={styles.detail}>
			<div className={styles.table}>
				<table>
					<tbody>
						<tr>
							<th>Project</th>
							<td>{details?.projectName}</td>
						</tr>

						<tr>
							<th>Created At</th>
							<td>{d.toDateString()}</td>
						</tr>

						<tr>
							<th>Public Secret Token</th>
							<td
								style={{
									display: "flex",
									gap: "1em",
									alignItems: "center",
								}}
							>
								<span
									onClick={handleClick}
									style={{
										cursor: "pointer",
									}}
									title={show ? "hide" : "show"}
								>
									{show
										? details?.publicToken
										: "************"}
								</span>

								{show && (
									<button onClick={handleCopy}>Copy</button>
								)}
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			{details && details.users.length > 0 && (
				<div className={styles.users}>
					{details?.users.map((user) => {
						return (
							<div key={user.id}>
								<p>
									<strong>Name: </strong> {user.name}
								</p>

								<p>
									<strong>Email: </strong> {user.email}
								</p>
							</div>
						);
					})}
				</div>
			)}

			<div className={styles.action}>
				<button data-type="link" data-variant="error">
					Delete
				</button>
			</div>
		</Container>
	);
};

export default ProjectDetails;
