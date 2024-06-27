import React, {
	Dispatch,
	MutableRefObject,
	SetStateAction,
	useContext,
	useMemo,
	useState,
} from "react";
import styles from "./details.module.scss";
import { toast } from "react-toastify";
import Image from "next/image";
import { BlogDetails, NewImages } from "../../create/page";
import { validateString } from "@/helpers/validation";
import { UserContext } from "@/components/AuthContext/authContext";
import { useParams } from "next/navigation";
import Loader from "@/components/Loader/Loader";

interface DetailsProps {
	handlePrevious: () => void;
	blogDetails: BlogDetails;
	setBlogDetails: Dispatch<SetStateAction<BlogDetails>>;
	newImagesRef: MutableRefObject<NewImages[]>;
	deletedImages: string[];
	uuidRef: MutableRefObject<string | null>;
}

const Details = ({
	handlePrevious,
	blogDetails,
	setBlogDetails,
	newImagesRef,
	deletedImages,
	uuidRef,
}: DetailsProps) => {
	const userWithRole = useContext(UserContext);
	const user = useMemo(() => {
		return userWithRole ? userWithRole.user : null;
	}, [userWithRole]);

	const params = useParams<{ projectId: string }>();

	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [creating, setCreating] = useState<boolean>(false);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files) {
			toast.error("Something went wrong while seleting file");
			return;
		}

		setBlogDetails((prev) => {
			return { ...prev, cover: files[0] };
		});
		const url = URL.createObjectURL(files[0]);
		setImagePreview(url);
	};

	const validateBlog = (): boolean => {
		if (!validateString(blogDetails.content, 200)) {
			toast.error("blog content too short!");
			return false;
		}

		if (!validateString(blogDetails.author, 3)) {
			toast.error("name too short");
			return false;
		}

		if (!validateString(blogDetails.title, 3)) {
			toast.error("blog title too short!");
			return false;
		}

		if (
			blogDetails.summary.length > 0 &&
			!validateString(blogDetails.summary, 10)
		) {
			toast.error("blog summary too short!");
			return false;
		}

		return true;
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const form = e.target;

		if (!(form instanceof HTMLFormElement)) {
			return toast.error("Something is wrong from our end");
		}

		// handle form validation
		if (!validateBlog()) {
			return;
		}

		if (!blogDetails.cover) {
			toast.error("cover image requried for blog");
			return;
		}

		setCreating(true);
		const validNewFiles = newImagesRef.current.filter(
			(img) => !img.isRemoved
		);

		const formData = new FormData();
		const metaData = validNewFiles.map(({ path }) => {
			return { path };
		});

		formData.append("metadata", JSON.stringify(metaData));
		validNewFiles.forEach(({ file }, index) => {
			formData.append(`media_${index}`, file);
		});

		// adding media to blogs
		const addMediaURL = `${process.env.NEXT_PUBLIC_API}/services/blogs/${params.projectId}/${uuidRef.current}/media`;
		const token = await user?.getIdToken();
		const headers = {
			Authorization: `Bearer ${token}`,
		};

		fetch(addMediaURL, {
			method: "POST",
			headers,
			body: formData,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) throw new Error(res.message);
				console.log(res.message);

				if (deletedImages.length > 0) {
					const deleteMediaURL = `${process.env.NEXT_PUBLIC_API}/services/blogs/${params.projectId}/${uuidRef.current}/media`;
					const body = JSON.stringify({
						paths: deletedImages,
					});

					fetch(deleteMediaURL, {
						method: "DELETE",
						headers: {
							...headers,
							"Content-Type": "application/json",
						},
						body,
					})
						.then((res) => {
							return res.json();
						})
						.then((res) => {
							if (res.error) throw new Error(res.message);

							console.log("successfully deleted unused media");
						})
						.catch((err) => {
							console.error(err.message);
						});
				}

				if (!blogDetails.cover) return;

				const blogData = new FormData();
				blogData.append("title", blogDetails.title);
				blogData.append("cover", blogDetails.cover);
				blogData.append("summary", blogDetails.summary);
				blogData.append("author", blogDetails.author);
				blogData.append("content", blogDetails.content);

				const createBlogURL = `${process.env.NEXT_PUBLIC_API}/services/blogs/${params.projectId}/${uuidRef.current}`;
				fetch(createBlogURL, {
					method: "POST",
					headers,
					body: blogData,
				})
					.then((res) => res.json())
					.then((res) => {
						if (res.error) throw new Error(res.message);

						toast.success("Successfully created blog");
					})
					.catch((err) => {
						toast.error(err.message);
					})
					.finally(() => setCreating(false));
			})
			.catch((err) => {
				toast.error(err.message);
				setCreating(false);
			});
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
						disabled={creating}
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
						disabled={creating}
					/>
				</div>

				<div className={styles.input}>
					<label>Summary</label>
					<textarea
						name="summary"
						value={blogDetails.summary}
						onChange={handleInputChange}
						placeholder="Summary for the blog..."
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

					{imagePreview && (
						<div className={styles.image_preview}>
							<Image
								src={imagePreview}
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
						disabled={creating}
					>
						Previous
					</button>

					<button
						data-type="button"
						data-variant="secondary"
						type="submit"
						disabled={isCreateDisabled || creating}
						data-load={creating}
					>
						{creating ? <Loader variant="small" /> : "Create"}
					</button>
				</div>
			</form>
		</div>
	);
};

export default Details;
