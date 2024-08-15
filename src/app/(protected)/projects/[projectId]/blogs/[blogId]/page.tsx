"use client";

import { UserContext } from "@/components/AuthContext/authContext";
import Loader from "@/components/Loader/Loader";
import { useParams } from "next/navigation";
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
// import { toast } from "react-toastify";
import BlogItem from "../components/blogItem/BlogItem";

import styles from "./blog.module.scss";
import Image from "next/image";
import EditEditor from "../components/editor/EditEditor";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faXmark } from "@fortawesome/free-solid-svg-icons";

export interface BlogItem {
	blogId: string;
	title: string;
	content: string;
	author: string;
	createdAt: string;
	updatedAt: string;
	cover: string;
	category: string;
}

const Blog = () => {
	const userWithRole = useContext(UserContext);
	const user = useMemo(() => {
		return userWithRole ? userWithRole.user : null;
	}, [userWithRole]);

	const params = useParams<{ projectId: string; blogId: string }>();
	const [blogItem, setBlogItem] = useState<BlogItem | null>(null);
	const [loading, setLoading] = useState(true);
	const [isEdit, setIsEdit] = useState(false);

	const uuidRef = useRef<string | null>(null);

	const getBlogItem = useCallback(async () => {
		const url = `${process.env.NEXT_PUBLIC_API}/services/blogs/${params.projectId}/${params.blogId}`;
		const token = await user?.getIdToken();
		const headers = {
			Authorization: `Bearer ${token}`,
		};

		fetch(url, {
			method: "GET",
			headers,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) throw new Error(res.message);

				setBlogItem(res.data);
				uuidRef.current = res.data.blogId;
			})
			.catch((err) => {
				toast.error(err.message);
			})
			.finally(() => setLoading(false));
	}, [user, params]);

	useEffect(() => {
		getBlogItem();
	}, [getBlogItem]);

	if (loading) {
		return (
			<div data-load="true">
				<Loader />
			</div>
		);
	}

	if (!blogItem) {
		return (
			<div data-empty="true">
				<p>Blog not found</p>
			</div>
		);
	}

	let blogHTML = {
		__html: blogItem ? blogItem.content : "blog not found",
	};

	let createdAt = new Date();
	if (blogItem?.createdAt) {
		createdAt = new Date(blogItem.createdAt);
	}

	let updatedAt = new Date();
	if (blogItem?.updatedAt) {
		updatedAt = new Date(blogItem.updatedAt);
	}

	return (
		<div className={styles.blog}>
			<div className={styles.metadata}>
				<img
					src={blogItem.cover}
					width="500"
					height="250"
					alt={blogItem.title}
				/>

				<h1>{blogItem.title}</h1>

				<div className={styles.more}>
					<p>{blogItem.author}</p>
					<p>{blogItem.category}</p>
					<p>{createdAt.toDateString()}</p>
				</div>
			</div>

			<div className={styles.action}>
				<button
					onClick={() => setIsEdit((prev) => !prev)}
					data-type="link"
					data-variant={isEdit ? "error" : "secondary"}
				>
					{isEdit ? (
						"Cancel"
					) : (
						<>
							Edit <FontAwesomeIcon icon={faPenToSquare} />
						</>
					)}
				</button>
			</div>

			{!isEdit ? (
				<div
					className={styles.content}
					dangerouslySetInnerHTML={blogHTML}
				></div>
			) : (
				<EditEditor
					setBlogItem={setBlogItem}
					uuidRef={uuidRef}
					content={blogItem.content}
					setEdit={setIsEdit}
				/>
			)}
		</div>
	);
};

export default Blog;
