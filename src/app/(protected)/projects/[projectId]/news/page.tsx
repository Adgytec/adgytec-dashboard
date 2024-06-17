"use client";

import { useParams, useRouter } from "next/navigation";
import React from "react";
import styles from "./news.module.scss";

const News = () => {
	const params = useParams<{ projectId: string }>();
	const router = useRouter();

	return <div className={styles.news}>News</div>;
};

export default News;
