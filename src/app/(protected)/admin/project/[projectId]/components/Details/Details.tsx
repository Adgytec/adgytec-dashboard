import React, { useRef, useState } from "react";
import styles from "../../project.module.scss";
import Loader from "@/components/Loader/Loader";
import { handleModalClose, handleEscModal } from "@/helpers/modal";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { ProjectDetails } from "../../page";
import { copyToClipboard } from "@/helpers/helpers";

interface DetailsProps {
	projectId: string;
	user: User | null;
	details: ProjectDetails | null;
	handleManage: () => void;
}

const Details = ({ projectId, user, details, handleManage }: DetailsProps) => {
	const router = useRouter();

	const [show, setShow] = useState(false);

	const [deleting, setDeleting] = useState(false);
	const deleteConfirmRef = useRef<HTMLDialogElement | null>(null);
	const handleClose = () => handleModalClose(deleteConfirmRef);
	const [error, setError] = useState<string | null>(null);

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

	const handleDelete = async () => {
		const url = `${process.env.NEXT_PUBLIC_API}/project/${projectId}`;
		const token = await user?.getIdToken();
		const headers = {
			Authorization: `Bearer ${token}`,
		};

		setDeleting(true);
		setError(null);
		fetch(url, {
			method: "DELETE",
			headers,
		})
			.then((res) => {
				if (res.status === 200) {
					toast.success(
						`Successfully deleted project "${details?.projectName}"`
					);
					router.push("/admin/project");
					return;
				}

				return res.json();
			})
			.then((res) => {
				if (!res) return;

				if (res.error) throw new Error(res.message);
			})
			.catch((err) => {
				setError(err.message);
			})
			.finally(() => {
				setDeleting(false);
			});
	};

	return (
		<>
			<dialog
				onKeyDown={handleEscModal}
				ref={deleteConfirmRef}
				className="delete-confirm"
			>
				<div className="delete-modal">
					<div className="modal-menu">
						<h2>Confirm Project Deletion</h2>

						<button
							data-type="link"
							onClick={handleClose}
							title="close"
							disabled={deleting}
						>
							<FontAwesomeIcon icon={faXmark} />
						</button>
					</div>

					<div className="delete-content">
						<p>
							Are you sure you want to permanently delete the
							project{" "}
							<strong>&apos;{details?.projectName}&apos;</strong>?
							This action cannot be undone.
						</p>
					</div>

					{error && <p className="error">{error}</p>}

					<div className="delete-action">
						<button
							data-type="link"
							disabled={deleting}
							onClick={handleClose}
						>
							Cancel
						</button>

						<button
							data-type="button"
							className={styles.delete}
							disabled={deleting}
							data-load={deleting}
							onClick={handleDelete}
							data-variant="error"
						>
							{deleting ? <Loader variant="small" /> : "Delete"}
						</button>
					</div>
				</div>
			</dialog>

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
				<div className={styles.container}>
					<h2>Users</h2>
					{details.users.map((user) => {
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

			{details && details.services.length > 0 && (
				<div className={styles.container}>
					<h2>Services</h2>
					{details.services.map((service) => {
						return (
							<div key={service.id}>
								<p>
									<strong>Name: </strong> {service.name}
								</p>
							</div>
						);
					})}
				</div>
			)}

			<div className={styles.action}>
				<button
					data-type="link"
					data-variant="error"
					onClick={() => deleteConfirmRef.current?.showModal()}
				>
					Delete
				</button>

				<button
					data-type="link"
					data-variant="primary"
					onClick={handleManage}
				>
					manage
				</button>
			</div>
		</>
	);
};

export default Details;
