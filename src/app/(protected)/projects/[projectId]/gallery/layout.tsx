"use client";

import LinkHeader, { LinkItem } from "@/components/LinkHeader/LinkHeader";
import { useParams } from "next/navigation";
import React, { useMemo } from "react";
import styles from "./gallery.module.scss";
import Container from "@/components/Container/Container";

interface GalleryLayoutProps {
	children: React.ReactNode;
}

const GalleryLayout = ({ children }: GalleryLayoutProps) => {
	const params = useParams<{ projectId: string }>();
	const linkProps = useMemo(() => {
		return [
			{
				href: `/projects/${params.projectId}/gallery`,
				text: "Active Albums",
			},
			{
				href: `/projects/${params.projectId}/gallery/create`,
				text: "Create New",
				// view: ["editor", "metadata"],
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

export default GalleryLayout;
