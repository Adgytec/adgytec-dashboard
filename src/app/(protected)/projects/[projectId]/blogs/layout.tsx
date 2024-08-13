"use client";

import React, { useMemo } from "react";
import styles from "./blogs.module.scss";
import { useParams } from "next/navigation";
import Container from "@/components/Container/Container";
import LinkHeader, { LinkItem } from "@/components/LinkHeader/LinkHeader";

interface BlogLayoutProps {
	children: React.ReactNode;
}

const BlogLayout = ({ children }: BlogLayoutProps) => {
	const params = useParams<{ projectId: string }>();
	const linkProps = useMemo(() => {
		return [
			{
				href: `/projects/${params.projectId}/blogs`,
				text: "Active Blogs",
			},
			{
				href: `/projects/${params.projectId}/blogs/create`,
				text: "Create New",
				view: ["editor", "metadata"],
			},
		] as LinkItem[];
	}, [params.projectId]);

	return (
		<div className={styles.layout}>
			<LinkHeader links={linkProps} />

			<Container>{children}</Container>
		</div>
	);
};

export default BlogLayout;
