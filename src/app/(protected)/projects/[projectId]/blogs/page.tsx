"use client";

import { UserContext } from "@/components/AuthContext/authContext";
import React, { useContext, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import styles from "./blogs.module.scss";
import Link from "next/link";

const Blogs = () => {
	const userWithRole = useContext(UserContext);
	const user = useMemo(() => {
		return userWithRole ? userWithRole.user : null;
	}, [userWithRole]);

	const generateUUID = async () => {
		const url = `${process.env.NEXT_PUBLIC_API}/uuid`;
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
				console.log(res.data.uuid);
			})
			.catch((err) => {
				toast.error(err.message);
			});
	};

	useEffect(() => {
		generateUUID();
	}, []);

	return (
		<div className={styles.blogs}>
			<div className={styles.link}>
				<Link
					href="blogs/create"
					data-type="link"
					data-variant="primary"
				>
					Create
				</Link>
			</div>
		</div>
	);
};

export default Blogs;
