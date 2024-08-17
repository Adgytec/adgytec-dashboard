import React, {
	Dispatch,
	Fragment,
	MutableRefObject,
	SetStateAction,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import styles from "./details.module.scss";
import { toast } from "react-toastify";
import Image from "next/image";
import { BlogDetails, NewImages } from "../../create/page";
import { validateString } from "@/helpers/validation";
import { UserContext } from "@/components/AuthContext/authContext";
import { useParams, usePathname, useRouter } from "next/navigation";
import Loader from "@/components/Loader/Loader";
import Link from "next/link";
import { useFile } from "@/components/FileInput/hooks/useFile";
import FileInput from "@/components/FileInput/FileInput";
import {
	Category,
	ProjectMetadataContext,
} from "../../../context/projectMetadataContext";

interface DetailsProps {
	blogDetails: BlogDetails;
	setBlogDetails: Dispatch<SetStateAction<BlogDetails>>;
	newImagesRef: MutableRefObject<NewImages[]>;
	deletedImages: string[];
	uuidRef: MutableRefObject<string | null>;
}

type HandleCategories = (item: Category) => React.JSX.Element;

const Details = ({
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

	const projectMetadata = useContext(ProjectMetadataContext);

	const params = useParams<{ projectId: string }>();
	const pathName = usePathname();
	const [cover, setCover] = useFile();

	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [creating, setCreating] = useState<boolean>(false);

	const router = useRouter();

	useEffect(() => {
		if (cover.length !== 0) {
			setBlogDetails((prev) => {
				return { ...prev, cover: cover[0].file };
			});
		}
	}, [cover]);

	const validateBlog = (): boolean => {
		if (!validateString(blogDetails.content, 50)) {
			toast.error("blog content too short!");
			return false;
		}

		if (
			blogDetails.author.length > 0 &&
			!validateString(blogDetails.author, 3)
		) {
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

	const createBlog = async () => {
		// if (!blogDetails.cover) return;

		const token = await user?.getIdToken();
		const headers = {
			Authorization: `Bearer ${token}`,
		};

		const blogData = new FormData();
		blogData.append("title", blogDetails.title);
		if (blogDetails.cover) blogData.append("cover", blogDetails.cover);
		blogData.append("summary", blogDetails.summary);
		blogData.append("author", blogDetails.author);
		blogData.append("content", blogDetails.content);
		blogData.append("category", blogDetails.category);

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
				router.push(`/projects/${params.projectId}/blogs`);
			})
			.catch((err) => {
				toast.error(err.message);
			})
			.finally(() => setCreating(false));
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

		// if (!blogDetails.cover) {
		// 	toast.error("cover image requried for blog");
		// 	return;
		// }

		setCreating(true);
		const validNewFiles = newImagesRef.current.filter(
			(img) => !img.isRemoved
		);

		if (validNewFiles.length === 0) {
			createBlog();
			return;
		}

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

				// if (!blogDetails.cover) return;
				createBlog();
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
			| React.ChangeEvent<HTMLSelectElement>
	) => {
		let key = e.target.name;
		let value = e.target.value;

		setBlogDetails((prev) => {
			return { ...prev, [key]: value };
		});
	};

	let isCreateDisabled = !blogDetails.title || !blogDetails.content;

	const handleCategories: HandleCategories = ({
		categoryId,
		categoryName,
		subCategories,
	}) => {
		return (
			<Fragment key={categoryId}>
				<option value={categoryId}>{categoryName}</option>
				{subCategories.length > 0 &&
					subCategories.map((item) => handleCategories(item))}
			</Fragment>
		);
	};

	return (
		<div className={styles.details}>
			<form className={styles.form} onSubmit={handleSubmit}>
				<div className={styles.input}>
					<label htmlFor="title">Title</label>
					<input
						type="text"
						placeholder="Title for the blog..."
						value={blogDetails.title}
						onChange={handleInputChange}
						name="title"
						id="title"
						required
						disabled={creating}
					/>
				</div>

				<div className={styles.input}>
					<label htmlFor="author">Author</label>
					<input
						type="text"
						placeholder="Author for the blog..."
						value={blogDetails.author}
						onChange={handleInputChange}
						name="author"
						id="author"
						disabled={creating}
					/>
				</div>

				<div className={styles.input}>
					<label htmlFor="category">Category</label>

					<select
						id="category"
						name="category"
						onChange={handleInputChange}
						value={blogDetails.category}
						disabled={creating}
					>
						<option value={params.projectId}>default</option>

						{projectMetadata &&
							projectMetadata.categories.subCategories.length >
								0 &&
							projectMetadata.categories.subCategories.map(
								(item) => handleCategories(item)
							)}
					</select>
				</div>

				<div className={styles.input}>
					<label htmlFor="summary">Summary</label>
					<textarea
						name="summary"
						value={blogDetails.summary}
						onChange={handleInputChange}
						placeholder="Summary for the blog..."
						disabled={creating}
						id="summary"
					/>
				</div>

				<div className={styles.input}>
					<label>Cover Image</label>
					<FileInput
						setFiles={setCover}
						multiple={false}
						disabled={creating}
						image={blogDetails.cover}
						files={cover}
					/>
				</div>

				<div className={styles.actions}>
					<button
						data-type="link"
						data-variant="secondary"
						onClick={() => {
							router.back();
						}}
						disabled={creating}
						type="button"
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
