"use client";

import React, { useContext, useState } from "react";
import styles from "./create.module.scss";
import { useFile } from "@/components/FileInput/hooks/useFile";
import FileInput from "@/components/FileInput/FileInput";
import Loader from "@/components/Loader/Loader";
import { validateString } from "@/helpers/validation";
import { toast } from "react-toastify";
import { UserContext } from "@/components/AuthContext/authContext";
import { useParams } from "next/navigation";

const GalleryCreatePage = () => {
	const userWithRole = useContext(UserContext);
	const user = userWithRole ? userWithRole.user : null;

	const [file, setFile] = useFile();
	const [creating, setCreating] = useState<boolean>(false);
	const [albumName, setAlbumName] = useState<string>("");

	const params = useParams<{ projectId: string }>();

	const validateInput = () => {
		if (!validateString(albumName, 3)) {
			toast.error("Invalid album name. Name should be greater than 3");
			return false;
		}

		if (file.length === 0 || !file[0].file) {
			toast.error("Invalid media file selected!");
			return false;
		}

		return true;
	};

	const handleAlbumCreate = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!validateInput()) return;

		setCreating(true);

		const url = `${process.env.NEXT_PUBLIC_API}/services/gallery/${params.projectId}/albums`;
		const token = await user?.getIdToken();
		const headers = {
			Authorization: `Bearer ${token}`,
		};

		const formData = new FormData();
		formData.append("name", albumName);
		formData.append("cover", file[0].file);

		fetch(url, {
			method: "POST",
			headers,
			body: formData,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) throw new Error(res.message);

				toast.success("successfully created the album");
				setAlbumName("");
				setFile([]);
			})
			.catch((err) => {
				toast.error(err.message);
			})
			.finally(() => setCreating(false));
	};

	return (
		<div className={styles.create}>
			<h2>Create Album</h2>

			<form className={styles.form} onSubmit={handleAlbumCreate}>
				<div className={styles.input}>
					<label htmlFor="album-name">Album Name</label>
					<input
						type="text"
						id="album-name"
						placeholder="Album Name..."
						disabled={creating}
						required
						onChange={(e) => setAlbumName(e.target.value)}
						value={albumName}
					/>
				</div>

				<div className={styles.input}>
					<label>Album Cover</label>
					<FileInput
						files={file}
						setFiles={setFile}
						multiple={false}
						disabled={creating}
					/>
				</div>

				<div className={styles.action}>
					<button
						data-type="button"
						data-variant="secondary"
						disabled={
							creating ||
							albumName.length === 0 ||
							file.length === 0
						}
						data-load={creating}
					>
						{creating ? <Loader variant="small" /> : "Create"}
					</button>
				</div>
			</form>
		</div>
	);
};

export default GalleryCreatePage;
