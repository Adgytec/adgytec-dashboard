import React, { useContext, useState } from "react";
import styles from "../project.module.scss";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loader from "@/components/Loader/Loader";
import { validateProjectName } from "@/helpers/validation";
import { UserContext } from "@/components/AuthContext/authContext";
import { toast } from "react-toastify";

interface ModalCreateProjectProps {
	handleClose: () => void;
	handleRefresh: () => void;
}

const ModalCreateProject = ({
	handleClose,
	handleRefresh,
}: ModalCreateProjectProps) => {
	const userWithRole = useContext(UserContext);
	const user = userWithRole ? userWithRole.user : null;

	const [project, setProject] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const [creating, setCreating] = useState(false);

	const handleReset = () => {
		setError(null);
		// setMessage(null);
		setProject("");
	};

	const handleCancel = () => {
		handleReset();
		handleClose();
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!validateProjectName(project)) {
			setError("Invalid project name");
			// setMessage(null);
			// toast.error("Invalid project name");
			return;
		}

		setError(null);
		// setMessage(null);
		setCreating(true);

		const url = `${process.env.NEXT_PUBLIC_API}/project`;
		const token = await user?.getIdToken();
		const headers = {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		};
		const body = JSON.stringify({
			projectName: project,
		});

		fetch(url, {
			method: "POST",
			headers,
			body,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) throw new Error(res.message);
				// setMessage("Successfully created new project");
				toast.success("Successfully created new project");
				handleRefresh();
				handleCancel();
			})
			.catch((err) => {
				setError(err.message);
				// toast.error(err.message);
			})
			.finally(() => {
				setCreating(false);
			});
	};

	return (
		<div className={styles.container}>
			<div className="modal-menu">
				<h2>Create Project</h2>

				<button
					data-type="link"
					onClick={handleCancel}
					title="close"
					disabled={creating}
				>
					<FontAwesomeIcon icon={faXmark} />
				</button>
			</div>

			<form className={styles.form} onSubmit={handleSubmit}>
				<div className={styles.input}>
					<label htmlFor="project">Project Name</label>

					<input
						type="text"
						id="project"
						name="project"
						value={project}
						onChange={(e) => setProject(e.target.value)}
						disabled={creating}
						placeholder="Project Name..."
						required
					/>
				</div>

				{error && <p className="error">{error}</p>}
				{message && <p className="message">{message}</p>}

				<div className={styles.action}>
					<button
						type="button"
						data-type="link"
						disabled={creating}
						onClick={handleCancel}
					>
						Cancel
					</button>

					<button
						type="submit"
						data-type="button"
						data-variant="secondary"
						disabled={creating}
						data-load={creating}
					>
						{creating ? <Loader variant="small" /> : "Create"}
					</button>
				</div>
			</form>
		</div>
	);
};

export default ModalCreateProject;
