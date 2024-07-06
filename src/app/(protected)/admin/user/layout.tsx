"use client";

import Container from "@/components/Container/Container";
import React from "react";
import styles from "./user.module.scss";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface UserLayoutProps {
	children: React.ReactNode;
}

const UserLayout = ({ children }: UserLayoutProps) => {
	const pathname = usePathname();
	return (
		<div className={styles.layout}>
			<Container type="normal">
				<h1>Manage User</h1>
			</Container>

			<div className={styles.options}>
				<Container type="normal" className={styles.links}>
					<Link
						href="/admin/user"
						data-active={pathname === "/admin/user"}
					>
						Active Users
					</Link>

					<Link
						href="/admin/user/create"
						data-active={pathname === "/admin/user/create"}
					>
						Create New
					</Link>
				</Container>
			</div>

			<Container type="normal">{children}</Container>
		</div>
	);
};

export default UserLayout;
