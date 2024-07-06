"use client";

import AuthProvider from "@/components/AuthContext/AuthProvider";
import Footer from "@/components/Footer/Footer";
import Header from "@/components/header/Header";
import styles from "./home.module.scss";
import Nav from "@/components/Nav/Nav";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function ProtectedLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const [expand, setExpand] = useState(false);
	const pathname = usePathname();

	const handleExpandClick = () => {
		if (expand) {
			setExpand(false);
		}
	};

	useEffect(() => {
		handleExpandClick();
	}, [pathname]);

	return (
		<AuthProvider>
			<div className={styles.layout}>
				<input
					type="checkbox"
					id="nav"
					checked={expand}
					onChange={(e) => setExpand(e.target.checked)}
				/>

				<div className={styles.nav}>
					<Nav />
				</div>

				<div className={styles.main} onClick={handleExpandClick}>
					<Header />

					<main className={styles.content}>{children}</main>
				</div>
			</div>
		</AuthProvider>
	);
}
