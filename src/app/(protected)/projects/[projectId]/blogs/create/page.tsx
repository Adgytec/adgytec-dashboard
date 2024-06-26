"use client";

import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
} from "react";
import styles from "../blogs.module.scss";
import Editor from "../components/editor/editor/Editor";
import { UserContext } from "@/components/AuthContext/authContext";
import { toast } from "react-toastify";

const CreateBlog = () => {
	const userWithRole = useContext(UserContext);
	const user = useMemo(() => {
		return userWithRole ? userWithRole.user : null;
	}, [userWithRole]);

	const uuidRef = useRef<string | null>(null);

	const generateUUID = useCallback(async () => {
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
				if (!uuidRef.current) {
					console.log(res.data.uuid);
					uuidRef.current = res.data.uuid;
				}
			})
			.catch((err) => {
				toast.error(err.message);
			});
	}, [user]);

	useEffect(() => {
		generateUUID();
	}, [generateUUID]);

	return (
		<div className={styles.editorParent}>
			<Editor uuidRef={uuidRef} />
		</div>
	);
};
5;
export default CreateBlog;
