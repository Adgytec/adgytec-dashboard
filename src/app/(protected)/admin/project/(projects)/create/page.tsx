"use client";

import FileInput from "@/components/FileInput/FileInput";
import { useFile } from "@/components/FileInput/hooks/useFile";
import React, { useContext, useState } from "react";
import styles from "./create.module.scss";
import Loader from "@/components/Loader/Loader";
import { validateProjectName } from "@/helpers/validation";
import { toast } from "react-toastify";
import { UserContext } from "@/components/AuthContext/authContext";

const ProjectCreate = () => {
	const userWithRole = useContext(UserContext);
	const user = userWithRole ? userWithRole.user : null;

	const [cover, setCover] = useFile();
	const [creating, setCreating] = useState(false);
	const [projectName, setProjectName] = useState("");

	const validateInput = () => {
		if (!validateProjectName(projectName)) {
			toast.error("Invalid project name!");
			return false;
		}

		if (cover.length === 0 || !cover[0].file) {
			toast.error("Invalid media file selected!");
			return false;
		}

		return true;
	};

	const handleProjectCreate = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!validateInput()) {
			return;
		}

		setCreating(true);

		const url = `${process.env.NEXT_PUBLIC_API}/project`;
		const token = await user?.getIdToken();
		const headers = {
			Authorization: `Bearer ${token}`,
		};

		const formData = new FormData();
		formData.append("projectName", projectName);
		formData.append("cover", cover[0].file);

		fetch(url, {
			method: "POST",
			headers,
			body: formData,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) throw new Error(res.message);

				toast.success("successfully created the project");
				setProjectName("");
				setCover([]);
			})
			.catch((err) => {
				toast.error(err.message);
			})
			.finally(() => setCreating(false));
	};

	return (
		<div className={styles.container}>
			<div className={styles.title}>
				<h2>Create Project</h2>
			</div>

			<form className={styles.form} onSubmit={handleProjectCreate}>
				<div className={styles.input}>
					<label>Project Name</label>

					<input
						type="text"
						placeholder="Project Name..."
						value={projectName}
						onChange={(e) => setProjectName(e.target.value)}
						disabled={creating}
						required
					/>
				</div>

				<div className={styles.input}>
					<label>Upload Project Logo</label>

					<FileInput
						setFiles={setCover}
						multiple={false}
						disabled={creating}
					/>
				</div>

				<div className={styles.action}>
					<button
						data-type="button"
						data-variant="secondary"
						disabled={creating}
						data-load={creating}
						type="submit"
					>
						{creating ? <Loader variant="small" /> : "Create"}
					</button>
				</div>
			</form>
		</div>
	);
};

export default ProjectCreate;
