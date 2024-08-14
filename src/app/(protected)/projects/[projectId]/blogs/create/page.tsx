"use client";

import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import Editor from "../components/editor/Editor";
import { UserContext } from "@/components/AuthContext/authContext";
import { toast } from "react-toastify";
import Details from "../components/details/Details";
import {
	useParams,
	usePathname,
	useRouter,
	useSearchParams,
} from "next/navigation";

export type BlogDetails = {
	title: string;
	summary: string;
	cover: File | null;
	content: string;
	author: string;
	category: string;
};

export interface NewImages {
	path: string;
	file: File;
	isRemoved: boolean;
}

const CreateBlog = () => {
	const userWithRole = useContext(UserContext);
	const user = useMemo(() => {
		return userWithRole ? userWithRole.user : null;
	}, [userWithRole]);

	const params = useParams<{ projectId: string }>();
	const view = useSearchParams().get("view");
	const router = useRouter();
	const pathName = usePathname();

	const [blogDetails, setBlogDetails] = useState<BlogDetails>({
		title: "",
		summary: "",
		content: "",
		cover: null,
		author: "",
		category: params.projectId,
	});

	const newImagesRef = useRef<NewImages[]>([]);
	const [deletedImages, setDeletedImages] = useState<string[]>([]); // used when editing existing blog

	const uuidRef = useRef<string | null>(null);

	useEffect(() => {
		if (
			view === null ||
			(view !== "editor" && view !== "metadata") ||
			(view === "metadata" && blogDetails.content.length === 0)
		) {
			router.replace(`${pathName}?view=editor`);
		}
	}, [view, router, pathName, blogDetails.content.length]);

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
		<div>
			<Editor
				uuidRef={uuidRef}
				setBlogDetails={setBlogDetails}
				newImagesRef={newImagesRef}
				setDeletedImages={setDeletedImages}
				hidden={view !== "editor"}
			/>

			{view === "metadata" && (
				<div>
					<Details
						uuidRef={uuidRef}
						blogDetails={blogDetails}
						setBlogDetails={setBlogDetails}
						newImagesRef={newImagesRef}
						deletedImages={deletedImages}
					/>
				</div>
			)}
		</div>
	);
};
5;
export default CreateBlog;
