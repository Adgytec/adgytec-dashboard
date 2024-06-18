"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import styles from "./news.module.scss";
import Link from "next/link";
import Loader from "@/components/Loader/Loader";
import { UserContext } from "@/components/AuthContext/authContext";
import { toast } from "react-toastify";
import NewsItem from "./components/NewsItem";

export interface NewsObj {
	title: string;
	text: string;
	link: string;
	image: string;
	id: string;
	created_at: string;
}

const News = () => {
	const userWithRole = useContext(UserContext);
	const user = userWithRole ? userWithRole.user : null;

	const params = useParams<{ projectId: string }>();
	const [loading, setLoading] = useState(true);
	const [news, setNews] = useState<NewsObj[]>([]);

	useEffect(() => {
		getAllNews();
	}, []);

	const getAllNews = async () => {
		const url = `${process.env.NEXT_PUBLIC_API}/services/news/${params.projectId}`;
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

				setNews(res.data);
			})
			.catch((err) => {
				toast.error(err.message);
			})
			.finally(() => setLoading(false));
	};

	if (loading) {
		return (
			<div
				style={{
					display: "grid",
					placeItems: "center",
					position: "absolute",
					inset: "0",
				}}
			>
				<Loader />
			</div>
		);
	}

	return (
		<div className={styles.news}>
			<div className={styles.link}>
				<Link
					href="news/create"
					data-type="link"
					data-variant="primary"
				>
					Create
				</Link>
			</div>

			<div className={styles.list}>
				{news.length === 0 ? (
					<h3>No news in this project</h3>
				) : (
					news.map((n) => {
						return (
							<NewsItem key={n.id} news={n} setNews={setNews} />
						);
					})
				)}
			</div>
		</div>
	);
};

export default News;
