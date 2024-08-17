import React, { Fragment, useContext, useMemo, useRef, useState } from "react";
import styles from "./blogItem.module.scss";
import { Blog } from "../../page";
import Image from "next/image";
import { validateString } from "@/helpers/validation";
import { toast } from "react-toastify";
import { UserContext } from "@/components/AuthContext/authContext";
import { useParams } from "next/navigation";
import Loader from "@/components/Loader/Loader";
import { handleEscModal, handleModalClose } from "@/helpers/modal";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useFile } from "@/components/FileInput/hooks/useFile";
import FileInput, { FileElement } from "@/components/FileInput/FileInput";
import { createPortal } from "react-dom";
import Container from "@/components/Container/Container";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { trimStringWithEllipsis } from "@/helpers/helpers";
import {
	Category,
	ProjectMetadataContext,
} from "../../../context/projectMetadataContext";

interface BlogItemProps {
	blog: Blog;
	setAllBlogs: React.Dispatch<React.SetStateAction<Blog[]>>;
}

type HandleCategories = (item: Category) => React.JSX.Element;

const BlogItem = ({ blog, setAllBlogs }: BlogItemProps) => {
	const userWithRole = useContext(UserContext);
	const user = useMemo(() => {
		return userWithRole ? userWithRole.user : null;
	}, [userWithRole]);
	const projectMetadata = useContext(ProjectMetadataContext);

	const [cover, setCover] = useFile();
	const [coverError, setCoverError] = useState<null | string>(null);

	const params = useParams<{ projectId: string }>();

	const [isEdit, setIsEdit] = useState(false);
	const [blogDetails, setBlogDetails] = useState(() => {
		return {
			title: blog.title,
			summary: blog.summary ? blog.summary : "",
			category: blog.category.id,
			categoryName: blog.category.name,
		};
	});
	const [updating, setUpdating] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [coverUpdating, setCoverUpdating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const deleteConfirmRef = useRef<HTMLDialogElement | null>(null);
	const updateCoverRef = useRef<HTMLDialogElement | null>(null);

	let d = new Date(blog.createdAt);

	const handleInputChange = (
		e:
			| React.ChangeEvent<HTMLInputElement>
			| React.ChangeEvent<HTMLTextAreaElement>
			| React.ChangeEvent<HTMLSelectElement>
	) => {
		let key = e.target.name;
		let value = e.target.value;

		setBlogDetails((prev) => {
			return {
				...prev,
				[key]: value,
			};
		});
	};

	let isUpdateDisabled =
		blogDetails.summary === blog.summary &&
		blogDetails.title === blog.title &&
		blogDetails.category === blog.category.id;

	const validateInput = () => {
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

	const handleUpdate = async () => {
		if (!validateInput()) return;

		setUpdating(true);
		const url = `${process.env.NEXT_PUBLIC_API}/services/blogs/${params.projectId}/${blog.blogId}`;
		const token = await user?.getIdToken();
		const headers = {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		};
		const body = JSON.stringify({
			title: blogDetails.title,
			summary: blogDetails.summary,
			category: blogDetails.category,
		});

		fetch(url, {
			method: "PATCH",
			headers,
			body,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) throw new Error(res.message);
				toast.success(res.message);
				blog.title = blogDetails.title;
				blog.summary = blogDetails.summary;
				blog.category.id = blogDetails.category;
				blog.category.name = blogDetails.categoryName;
				setIsEdit(false);
			})
			.catch((err) => {
				toast.error(err.message);
			})
			.finally(() => {
				setUpdating(false);
			});
	};

	const handleClose = (
		ref: React.MutableRefObject<HTMLDialogElement | null>
	) => handleModalClose(ref);

	const handleDelete = async () => {
		setDeleting(true);
		setError(null);

		const url = `${process.env.NEXT_PUBLIC_API}/services/blogs/${params.projectId}/${blog.blogId}`;
		const token = await user?.getIdToken();
		const headers = {
			Authorization: `Bearer ${token}`,
		};

		fetch(url, {
			method: "DELETE",
			headers,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) throw new Error(res.message);

				setAllBlogs((prev) => {
					let temp = prev;

					return temp.toSpliced(
						temp.findIndex((b) => b.blogId === blog.blogId),
						1
					);
				});
				toast.success("successfully deleted blog item");
			})
			.catch((err) => {
				setError(err.message);
			})
			.finally(() => setDeleting(false));
	};

	const handleCoverImage = async () => {
		if (!cover[0].file) {
			setCoverError("no file selected");
			return;
		}
		setCoverUpdating(true);
		setCoverError(null);
		const url = `${process.env.NEXT_PUBLIC_API}/services/blogs/${params.projectId}/${blog.blogId}/cover`;
		const token = await user?.getIdToken();
		const headers = {
			Authorization: `Bearer ${token}`,
		};

		const formData = new FormData();
		formData.append("cover", cover[0].file);

		fetch(url, {
			method: "PATCH",
			headers,
			body: formData,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) throw new Error(res.message);

				updateCoverRef.current?.close();
				toast.success("successfully updated blog cover");
				if (cover[0].url) blog.cover = cover[0].url;

				setCover([]);
			})
			.catch((err) => {
				setCoverError(err.message);
			})
			.finally(() => {
				setCoverUpdating(false);
			});
	};

	const handleCategories: HandleCategories = ({
		categoryId,
		categoryName,
		subCategories,
	}) => {
		return (
			<Fragment key={blog.blogId + categoryId}>
				<option
					value={categoryId}
					onClick={() =>
						setBlogDetails((prev) => {
							return { ...prev, categoryName: categoryName };
						})
					}
				>
					{categoryName}
				</option>
				{subCategories.length > 0 &&
					subCategories.map((item) => handleCategories(item))}
			</Fragment>
		);
	};

	return (
		<>
			{createPortal(
				<>
					<dialog
						onKeyDown={handleEscModal}
						ref={deleteConfirmRef}
						className="delete-confirm"
					>
						<div className="delete-modal">
							<div className="modal-menu">
								<h2>Confirm Deletion</h2>

								<button
									data-type="link"
									onClick={() =>
										handleClose(deleteConfirmRef)
									}
									title="close"
									disabled={deleting}
								>
									<FontAwesomeIcon icon={faXmark} />
								</button>
							</div>

							<div className="delete-content">
								<p>Are you sure you want to delete?</p>

								<p>
									Deleting this will permanently remove this
									blog item. This action cannot be undone.
								</p>
							</div>

							{error && <p className="error">{error}</p>}

							<div className="delete-action">
								<button
									data-type="link"
									disabled={deleting}
									onClick={() =>
										handleClose(deleteConfirmRef)
									}
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
									{deleting ? (
										<Loader variant="small" />
									) : (
										"Delete"
									)}
								</button>
							</div>
						</div>
					</dialog>

					<dialog ref={updateCoverRef}>
						<div className="modal">
							<div className="modal-menu">
								<h2>Update Blog Cover</h2>

								<button
									data-type="link"
									onClick={() => handleClose(updateCoverRef)}
									title="close"
									disabled={coverUpdating}
								>
									<FontAwesomeIcon icon={faXmark} />
								</button>
							</div>

							<div className={styles.updateCover}>
								<label>Cover Image</label>

								<FileInput
									setFiles={setCover}
									multiple={false}
									disabled={coverUpdating}
									files={cover}
									id={blog.blogId}
								/>
							</div>

							{coverError && (
								<p className="error">{coverError}</p>
							)}

							<div className="action">
								<button
									data-type="link"
									disabled={coverUpdating}
									onClick={() => handleClose(updateCoverRef)}
								>
									Cancel
								</button>

								<button
									data-type="button"
									className={styles.delete}
									disabled={coverUpdating || !cover.length}
									data-load={coverUpdating}
									onClick={handleCoverImage}
									data-variant="primary"
								>
									{coverUpdating ? (
										<Loader variant="small" />
									) : (
										"Update"
									)}
								</button>
							</div>
						</div>
					</dialog>
				</>,
				document.body
			)}

			<div className={styles.container}>
				<Container type="full" className={styles.details}>
					<div className={styles.subContainer}>
						{blog.cover.length > 0 ? (
							<div className={styles.image} data-edit={isEdit}>
								<img
									src={blog.cover}
									alt={blog.title}
									width={250}
									height={200}
								/>
								{isEdit && (
									<button
										data-type="link"
										data-variant="primary"
										disabled={updating}
										onClick={() =>
											updateCoverRef.current?.showModal()
										}
									>
										Update Cover
									</button>
								)}
							</div>
						) : (
							<div>
								{isEdit ? (
									<button
										data-type="link"
										data-variant="primary"
										disabled={updating}
										onClick={() =>
											updateCoverRef.current?.showModal()
										}
									>
										Add Cover
									</button>
								) : (
									<p>No cover image</p>
								)}
							</div>
						)}
						<div className={styles.data}>
							<div className={styles.title}>
								{isEdit ? (
									<input
										type="text"
										placeholder="title..."
										name="title"
										value={blogDetails.title}
										onChange={handleInputChange}
										disabled={updating}
									/>
								) : (
									<h2 className={styles.title}>
										<Link
											href={`blogs/${blog.blogId}`}
											data-type="link"
										>
											{trimStringWithEllipsis(
												blog.title,
												50
											)}
										</Link>
									</h2>
								)}
							</div>
							<div className={styles.metadata}>
								{blog.author.length > 0 && <p>{blog.author}</p>}
								{isEdit ? (
									<select
										onChange={handleInputChange}
										name="category"
										value={blogDetails.category}
										disabled={updating}
									>
										<option value={params.projectId}>
											default
										</option>

										{projectMetadata &&
											projectMetadata.categories
												.subCategories.length > 0 &&
											projectMetadata.categories.subCategories.map(
												(item) => handleCategories(item)
											)}
									</select>
								) : (
									<p>{blog.category.name}</p>
								)}
								<p>{d.toDateString()}</p>
							</div>
							<div className={styles.summary}>
								{isEdit ? (
									<textarea
										name="summary"
										value={blogDetails.summary}
										onChange={handleInputChange}
										placeholder="Summary for the blog..."
										disabled={updating}
									/>
								) : (
									blog.summary && (
										<p className={styles.summary}>
											{trimStringWithEllipsis(
												blog.summary,
												200
											)}
										</p>
									)
								)}
							</div>
							{isEdit && (
								<div className={styles.update}>
									<button
										data-type="button"
										data-variant="secondary"
										disabled={isUpdateDisabled || updating}
										onClick={handleUpdate}
										data-load={updating}
									>
										{updating ? (
											<Loader variant="small" />
										) : (
											"Update"
										)}
									</button>
								</div>
							)}
						</div>
					</div>
				</Container>

				<div className={styles.action}>
					<button
						data-type="link"
						onClick={() => setIsEdit((prev) => !prev)}
						disabled={updating}
					>
						{isEdit ? (
							<FontAwesomeIcon icon={faXmark} />
						) : (
							<FontAwesomeIcon icon={faPenToSquare} />
						)}
					</button>
				</div>

				<div className={styles.action} data-delete>
					<button
						data-type="link"
						data-variant="error"
						disabled={updating}
						onClick={() => deleteConfirmRef.current?.showModal()}
					>
						<FontAwesomeIcon icon={faTrashCan} />
					</button>
				</div>
			</div>

			{/* <div className={styles.blog}>
				<div className={styles.manage}>
					<button
						data-type="link"
						onClick={() => setIsEdit((prev) => !prev)}
						disabled={updating}
					>
						{isEdit ? "Cancel" : "Edit"}
					</button>
				</div>

				<div className={styles.image}>
					<Image
						src={blog.cover}
						alt={blog.title}
						width={500}
						height={250}
					/>

					{isEdit && (
						<button
							data-type="link"
							data-variant="secondary"
							disabled={updating}
							onClick={() => updateCoverRef.current?.showModal()}
						>
							Update Cover
						</button>
					)}
				</div>

				<div>
					{isEdit ? (
						<input
							type="text"
							placeholder="title..."
							name="title"
							value={blogDetails.title}
							onChange={handleInputChange}
							disabled={updating}
						/>
					) : (
						<h2 className={styles.title}>
							<Link
								href={`blogs/${blog.blogId}`}
								data-type="link"
								data-variant="secondary"
							>
								{blog.title}
							</Link>
						</h2>
					)}
				</div>

				<div>
					{isEdit ? (
						<textarea
							name="summary"
							value={blogDetails.summary}
							onChange={handleInputChange}
							placeholder="Summary for the blog..."
							disabled={updating}
						/>
					) : (
						blog.summary && (
							<p className={styles.summary}>{blog.summary}</p>
						)
					)}
				</div>

				<div className={styles.details}>
					<p>{blog.author}</p>
					<p>{d.toDateString()}</p>
				</div>

				<div className={styles.actions}>
					{isEdit && (
						<button
							data-type="button"
							data-variant="secondary"
							disabled={isUpdateDisabled || updating}
							onClick={handleUpdate}
							data-load={updating}
						>
							{updating ? <Loader variant="small" /> : "Update"}
						</button>
					)}

					<button
						data-type="link"
						data-variant="error"
						disabled={updating}
						onClick={() => deleteConfirmRef.current?.showModal()}
					>
						Delete
					</button>
				</div>
			</div> */}
		</>
	);
};

export default BlogItem;
