import React, {
	Dispatch,
	MutableRefObject,
	SetStateAction,
	useState,
} from "react";
import styles from "./details.module.scss";
import { toast } from "react-toastify";
import Image from "next/image";
import { BlogDetails, NewImages } from "../../create/page";

interface DetailsProps {
	handlePrevious: () => void;
	blogDetails: BlogDetails;
	setBlogDetails: Dispatch<SetStateAction<BlogDetails>>;
	newImagesRef: MutableRefObject<NewImages[]>;
	deletedImages: string[];
}

const Details = ({
	handlePrevious,
	blogDetails,
	setBlogDetails,
	newImagesRef,
	deletedImages,
}: DetailsProps) => {
	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files) {
			toast.error("Something went wrong while seleting file");
			return;
		}

		const url = URL.createObjectURL(files[0]);
		setBlogDetails((prev) => {
			return {
				...prev,
				cover: files[0],
				imagePreview: url,
			};
		});
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const form = e.target;

		if (!(form instanceof HTMLFormElement)) {
			return toast.error("Something is wrong from our end");
		}

		// handle form validation
	};

	const handleInputChange = (
		e:
			| React.ChangeEvent<HTMLInputElement>
			| React.ChangeEvent<HTMLTextAreaElement>
	) => {
		let key = e.target.name;
		let value = e.target.value;

		setBlogDetails((prev) => {
			return { ...prev, [key]: value };
		});
	};

	let isCreateDisabled =
		!blogDetails.title ||
		!blogDetails.content ||
		!blogDetails.cover ||
		!blogDetails.author;

	return (
		<div className={styles.details}>
			<form className={styles.form} onSubmit={handleSubmit}>
				<div className={styles.input}>
					<label>Title</label>
					<input
						type="text"
						placeholder="Title for the blog..."
						value={blogDetails.title}
						onChange={handleInputChange}
						name="title"
						required
					/>
				</div>

				<div className={styles.input}>
					<label>Author</label>
					<input
						type="text"
						placeholder="Author for the blog..."
						value={blogDetails.author}
						onChange={handleInputChange}
						name="author"
						required
					/>
				</div>

				<div className={styles.input}>
					<label>Summary</label>
					<textarea
						name="summary"
						value={blogDetails.summary}
						onChange={handleInputChange}
						placeholder="Summary for the blog..."
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
					/>

					{blogDetails.imagePreview && (
						<div className={styles.image_preview}>
							<Image
								src={blogDetails.imagePreview}
								alt="preview"
								width={250}
								height={125}
							/>
						</div>
					)}
				</div>

				<div className={styles.actions}>
					<button
						data-type="link"
						data-variant="secondary"
						onClick={handlePrevious}
					>
						Previous
					</button>

					<button
						data-type="button"
						data-variant="secondary"
						type="submit"
						disabled={isCreateDisabled}
					>
						Create
					</button>
				</div>
			</form>
		</div>
	);
};

export default Details;
