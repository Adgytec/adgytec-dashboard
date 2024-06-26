"use client";

import { UserContext } from "@/components/AuthContext/authContext";
import React, { useContext, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import styles from "./blogs.module.scss";
import Link from "next/link";

const Blogs = () => {
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
