"use client";

import { UserContext } from "@/components/AuthContext/authContext";
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { toast } from "react-toastify";
import styles from "./blogs.module.scss";
import { useParams } from "next/navigation";
import BlogItem from "./components/blogItem/BlogItem";
import Loader from "@/components/Loader/Loader";
import Container from "@/components/Container/Container";
import { useIntersection } from "@/hooks/intersetion-observer/intersection-observer";
import { getNow } from "@/helpers/helpers";

interface CategroyDetail {
	id: string;
	name: string;
}

export interface Blog {
	title: string;
	summary?: string;
	author: string;
	blogId: string;
	createdAt: string;
	cover: string;
	category: CategroyDetail;
}

const LIMIT = 20;

const Blogs = () => {
	const userWithRole = useContext(UserContext);
	const user = useMemo(() => {
		return userWithRole ? userWithRole.user : null;
	}, [userWithRole]);

	const params = useParams<{ projectId: string }>();

	const [allBlogs, setAllBlogs] = useState<Blog[]>([]);
	const [search, setSearch] = useState<string>("");
	const [loading, setLoading] = useState(true);

	const [allFetched, setAllFetched] = useState(false);

	const getAllBlogs = useCallback(
		async (cursor: string) => {
			if (allFetched) return;

			setLoading(true);

			const url = `${process.env.NEXT_PUBLIC_API}/services/blogs/${params.projectId}?cursor=${cursor}`;
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
					let len = res.data.length;
					if (len < LIMIT) {
						setAllFetched(true);
					}
					setAllBlogs((prev) => {
						const newBlogs = res.data.filter(
							(blog: Blog) =>
								!prev.some(
									(existingBlog) =>
										existingBlog.blogId === blog.blogId
								)
						);
						return [...prev, ...newBlogs];
					});
				})
				.catch((err) => {
					toast.error(err.message);
				})
				.finally(() => setLoading(false));
		},
		[user, params.projectId, allFetched]
	);

	const callback: IntersectionObserverCallback = useCallback(
		(entries, observer) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting && search.length == 0) {
					let lastInd = allBlogs.length;
					if (lastInd < LIMIT) return;

					let newCursor = new Date(
						allBlogs[lastInd - 1].createdAt
					).toISOString();
					getAllBlogs(newCursor);
				}
			});
		},
		[search, allBlogs, getAllBlogs]
	);

	const elementRef = useIntersection(
		callback,
		document.getElementById("content-root")
	);

	useEffect(() => {
		getAllBlogs(getNow());
	}, [getAllBlogs]);

	const elements: JSX.Element[] = [];
	allBlogs.forEach((blog, ind) => {
		const { blogId, title, author, category } = blog;
		const element = (
			<BlogItem key={blogId} blog={blog} setAllBlogs={setAllBlogs} />
		);

		if (search.length === 0) {
			elements.push(element);
			return;
		}

		if (
			blogId.toLowerCase().includes(search.toLowerCase()) ||
			title.toLowerCase().includes(search.toLowerCase()) ||
			author.toLowerCase().includes(search.toLowerCase()) ||
			category.name.toLowerCase().includes(search.toLowerCase())
		)
			elements.push(element);
	});

	return (
		<div className={styles.blogs}>
			<div
				className={styles.search}
				title="search blogs by id, title or author"
			>
				<h2>Blog Overview</h2>

				<input
					type="text"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Type to search..."
				/>
			</div>

			{/* list all blogs */}
			<div
				className={styles.container}
				data-empty={allBlogs.length === 0 || elements.length === 0}
				data-load={loading && allBlogs.length === 0}
			>
				{loading && allBlogs.length === 0 ? (
					<Loader />
				) : allBlogs.length === 0 ? (
					<h3>No blogs exist for this project</h3>
				) : elements.length === 0 ? (
					<p>
						There is no blog with title{" "}
						<span className="italic">
							<q>{search}</q>
						</span>
					</p>
				) : (
					<Container type="full" className={styles.table}>
						<div className={styles.heading}>
							<h4>Details</h4>

							<h4>Edit</h4>

							<h4>Delete</h4>
						</div>

						{elements}

						<div
							style={{
								visibility: "hidden",
							}}
							ref={elementRef}
						></div>
					</Container>
				)}
			</div>

			{loading && allBlogs.length > 0 && <Loader variant="small" />}
		</div>
	);
};

export default Blogs;
