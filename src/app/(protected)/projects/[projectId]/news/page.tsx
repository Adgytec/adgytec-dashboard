"use client";

import { useParams, useRouter } from "next/navigation";
import React from "react";

const News = () => {
	const params = useParams<{ projectId: string }>();
	const router = useRouter();

	return (
		<div>
			News
			<button onClick={() => router.back()}>Back</button>
		</div>
	);
};

export default News;
