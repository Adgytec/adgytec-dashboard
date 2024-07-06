import React, { useContext } from "react";
import styles from "./nav.module.scss";
import Image from "next/image";
import Link from "next/link";
import { userRoles } from "@/helpers/type";
import { UserContext } from "../AuthContext/authContext";
import { usePathname } from "next/navigation";

const AdminLinks = () => {
	const pathname = usePathname();
	return (
		<>
			<div>
				<Link
					data-type="link"
					href="/admin/user"
					data-active={pathname === "/admin/user"}
				>
					Manage user
				</Link>
			</div>

			<div>
				<Link
					data-type="link"
					href="/admin/project"
					data-active={pathname === "/admin/project"}
				>
					Manage Project
				</Link>
			</div>
		</>
	);
};

const Nav = () => {
	const userWithRole = useContext(UserContext);
	const role = userWithRole?.role;

	const pathname = usePathname();

	// 0->super_admin, 1->admin, 2->user, 3->pending
	const roleEnum = () => {
		switch (role) {
			case userRoles.superAdmin:
				return 0;
			case userRoles.admin:
				return 1;
			case userRoles.user:
				return 2;
			default:
				return 2;
		}
	};

	return (
		<div className={styles.nav}>
			<div className={styles.logo}>
				<Link href="/">
					<Image
						src="/logo.svg"
						alt="adgytec"
						width={200}
						height={50}
					/>
				</Link>
			</div>

			<div className={styles.links}>
				{roleEnum() !== 2 && <AdminLinks />}

				<div>
					<Link
						data-type="link"
						href="/projects"
						data-active={pathname === "/projects"}
					>
						Projects
					</Link>
				</div>
			</div>
		</div>
	);
};

export default Nav;
