"use client";

import React from "react";
import styles from "./linkheader.module.scss";
import Link from "next/link";
import Container from "../Container/Container";
import { usePathname, useSearchParams } from "next/navigation";

export interface LinkItem {
	text: string;
	href: string;
	view?: string[];
}

interface LinkHeaderProps {
	links: LinkItem[];
}

const LinkHeader = ({ links }: LinkHeaderProps) => {
	const pathname = usePathname();
	const view = useSearchParams().get("view");

	return (
		<div className={styles.options}>
			<Container className={styles.links}>
				{links?.map((link) => {
					let temphref = link.href;
					let tempActive = pathname === link.href;

					if (link.view && link.view.length !== 0) {
						temphref += "?view=" + link.view[0];
						tempActive = link.view.includes(view ?? "");
					}

					return (
						<Link
							key={link.href}
							href={temphref}
							data-active={tempActive}
						>
							{link.text}
						</Link>
					);
				})}
			</Container>
		</div>
	);
};

export default LinkHeader;
