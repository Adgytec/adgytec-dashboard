"use client";

import { UserContext } from "@/components/AuthContext/authContext";
import Loader from "@/components/Loader/Loader";
import { useParams } from "next/navigation";
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
// import { toast } from "react-toastify";
import BlogItem from "../components/blogItem/BlogItem";

import styles from "./blog.module.scss";
import Image from "next/image";

interface BlogItem {
	blogId: string;
	title: string;
	content: string;
	author: string;
	createdAt: string;
	updatedAt: string;
	cover: string;
}

const Blog = () => {
	const userWithRole = useContext(UserContext);
	const user = useMemo(() => {
		return userWithRole ? userWithRole.user : null;
	}, [userWithRole]);

	const params = useParams<{ projectId: string; blogId: string }>();
	const [blogItem, setBlogItem] = useState<BlogItem | null>(null);
	const [loading, setLoading] = useState(true);

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
			})
			.catch((err) => {
				// toast.error(err.message);
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
				<Image
					src={blogItem.cover}
					width="500"
					height="250"
					alt={blogItem.title}
				/>
				<h1>{blogItem?.title}</h1>

				<p>{blogItem?.author}</p>

				<p className={styles.date}>{createdAt.toDateString()}</p>
			</div>

			<div
				className={styles.content}
				dangerouslySetInnerHTML={blogHTML}
			></div>
		</div>
	);
};

export default Blog;
