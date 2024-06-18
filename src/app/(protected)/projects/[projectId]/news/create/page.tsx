"use client";

import React, { useContext, useState } from "react";
import styles from "./create.module.scss";
import { toast } from "react-toastify";
import { validateString, validateURL } from "@/helpers/validation";
import Loader from "@/components/Loader/Loader";
import { UserContext } from "@/components/AuthContext/authContext";
import { useParams, useRouter } from "next/navigation";

type ValidateInput = (title: string, text: string, link: string) => boolean;

const CreateNews = () => {
	const userWithRole = useContext(UserContext);
	const user = userWithRole ? userWithRole.user : null;

	const params = useParams<{ projectId: string }>();
	const router = useRouter();

	const [filePreview, setFilepreview] = useState<string | null>(null);
	const [creating, setCreating] = useState(false);

	const validateInput: ValidateInput = (title, text, link) => {
		if (!validateString(title, 3)) {
			toast.error("Invalid title");
			return false;
		}

		if (!validateString(text, 3)) {
			toast.error("Invalid text");
			return false;
		}

		if (!validateURL(link)) {
			toast.error("Invalid link");
			return false;
		}

		return true;
	};

	const handleNewsCreate = async (data: FormData, form: HTMLFormElement) => {
		setCreating(true);

		const url = `${process.env.NEXT_PUBLIC_API}/services/news/${params.projectId}`;
		const token = await user?.getIdToken();
		const headers = {
			Authorization: `Bearer ${token}`,
		};

		fetch(url, {
			method: "POST",
			headers,
			body: data,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) throw new Error(res.message);

				toast.success("Successfully created news item");
				form.reset();
				setFilepreview(null);
			})
			.catch((err) => toast.error(err.message))
			.finally(() => setCreating(false));
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const form = e.target;

		if (!(form instanceof HTMLFormElement)) {
			return toast.error("Something is woring in our end");
		}

		const formData = new FormData(form);

		const data = Object.fromEntries(formData.entries());
		const { title, text, link } = data;
		if (!validateInput(title as string, text as string, link as string)) {
			return;
		}

		handleNewsCreate(formData, form);
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files;
		if (!file) {
			toast.error("Something went wrong while seleting file");
			return;
		}

		const url = URL.createObjectURL(file[0]);
		setFilepreview(url);
	};

	return (
		<div className={styles.create}>
			<div>
				<button data-type="link" onClick={() => router.back()}>
					Back
				</button>
			</div>

			<form onSubmit={handleSubmit}>
				<div className={styles.input}>
					<label htmlFor="title">Title</label>
					<input
						type="text"
						placeholder="Title..."
						id="title"
						required
						name="title"
						disabled={creating}
					/>
				</div>

				<div className={styles.input}>
					<label htmlFor="text">Text</label>
					<textarea
						placeholder="Text..."
						id="text"
						required
						name="text"
						disabled={creating}
					/>
				</div>

				<div className={styles.input}>
					<label htmlFor="link">Link</label>
					<input
						type="text"
						placeholder="Link..."
						id="link"
						required
						name="link"
						disabled={creating}
					/>
				</div>

				<div className={styles.input}>
					<label htmlFor="image">Cover Image</label>
					<input
						type="file"
						placeholder="File..."
						id="image"
						accept=".jpg, .jpeg, .png"
						required
						name="image"
						onChange={handleImageChange}
						disabled={creating}
					/>

					{filePreview && (
						<div className={styles.image_preview}>
							<img src={filePreview} alt="preview" />
						</div>
					)}
				</div>

				<div className={styles.action}>
					<button
						data-type="button"
						data-variant="primary"
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

export default CreateNews;
