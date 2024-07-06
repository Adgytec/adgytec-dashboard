"use client";

import React, { useContext } from "react";
import styles from "./header.module.scss";
import { UserContext } from "../AuthContext/authContext";
import Container from "../Container/Container";
import Image from "next/image";
import Link from "next/link";

import * as Popover from "@radix-ui/react-popover";
import { UserPopoverProps } from "./types";
import { signoutUser } from "@/firebase/auth/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

const UserPopover = ({ user }: UserPopoverProps) => {
	const handleSignout = async () => {
		await signoutUser();
	};

	return (
		<Popover.Root>
			<Popover.Trigger asChild>
				<button
					data-type="button"
					data-variant="primary"
					className={styles.trigger}
				>
					{user?.displayName && user.displayName[0].toUpperCase()}
				</button>
			</Popover.Trigger>

			<Popover.Portal>
				<Popover.Content
					sideOffset={10}
					className={styles.content}
					collisionPadding={{
						right: 10,
					}}
					// align="start"
				>
					<p>{user?.displayName}</p>

					<div>
						<Link
							data-type="link"
							href="/profile"
							data-variant="secondary"
						>
							Profile
						</Link>
					</div>

					<div>
						<button
							data-type="link"
							data-variant="error"
							onClick={handleSignout}
						>
							Sign out
						</button>
					</div>
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	);
};

const Header = () => {
	const userWithRole = useContext(UserContext);
	const user = userWithRole ? userWithRole.user : null;

	return (
		<nav className={styles.header}>
			<Container type="normal" className={styles.container}>
				<div id="hamburger" className={styles.action}>
					<label htmlFor="nav">
						<FontAwesomeIcon icon={faBars} />
					</label>
				</div>

				<div className={styles.logo}>
					<Link href="/">
						<Image
							src="/logo.svg"
							alt="adgytec"
							width="128"
							height="50"
						/>
					</Link>
				</div>

				<div className={styles.user}>
					<UserPopover user={user} />
				</div>
			</Container>
		</nav>
	);
};

export default Header;
