import React, { useContext, useMemo, useRef, useState } from "react";
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
import { error } from "console";

interface BlogItemProps {
	blog: Blog;
	setAllBlogs: React.Dispatch<React.SetStateAction<Blog[]>>;
}

const BlogItem = ({ blog, setAllBlogs }: BlogItemProps) => {
	const userWithRole = useContext(UserContext);
	const user = useMemo(() => {
		return userWithRole ? userWithRole.user : null;
	}, [userWithRole]);

	const params = useParams<{ projectId: string }>();

	const [isEdit, setIsEdit] = useState(false);
	const [blogDetails, setBlogDetails] = useState(() => {
		return {
			title: blog.title,
			summary: blog.summary ? blog.summary : "",
		};
	});
	const [updating, setUpdating] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const deleteConfirmRef = useRef<HTMLDialogElement | null>(null);

	let d = new Date(blog.createdAt);

	const handleInputChange = (
		e:
			| React.ChangeEvent<HTMLInputElement>
			| React.ChangeEvent<HTMLTextAreaElement>
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
		blogDetails.title === blog.title;

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
				setIsEdit(false);
			})
			.catch((err) => {
				toast.error(err.message);
			})
			.finally(() => {
				setUpdating(false);
			});
	};

	const handleClose = () => handleModalClose(deleteConfirmRef);
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

	return (
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
							onClick={handleClose}
							title="close"
							disabled={deleting}
						>
							<FontAwesomeIcon icon={faXmark} />
						</button>
					</div>

					<div className="delete-content">
						<p>Are you sure you want to delete?</p>

						<p>
							Deleting this will permanently remove this blog
							item. This action cannot be undone.
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

			<div className={styles.blog}>
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
						<h2 className={styles.title}>{blog.title}</h2>
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
			</div>
		</>
	);
};

export default BlogItem;
