"use client";

import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import styles from "./gallery.module.scss";
import { UserContext } from "@/components/AuthContext/authContext";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import AlbumItem from "./components/AlbumItem/AlbumItem";
import Loader from "@/components/Loader/Loader";
import Container from "@/components/Container/Container";
import { useIntersection } from "@/hooks/intersetion-observer/intersection-observer";
import { getNow } from "@/helpers/helpers";

export interface Album {
	id: string;
	name: string;
	cover: string;
	createdAt: string;
}

const LIMIT = 20;

const GalleryPage = () => {
	const userWithRole = useContext(UserContext);
	const user = useMemo(() => {
		return userWithRole ? userWithRole.user : null;
	}, [userWithRole]);

	const params = useParams<{ projectId: string }>();

	const [search, setSearch] = useState<string>("");
	const [allAlbums, setAllAlbums] = useState<Album[]>([]);
	const [loading, setLoading] = useState(true);
	const [allFetched, setAllFetched] = useState(false);

	const getAllAlbums = useCallback(
		async (cursor: string) => {
			if (allFetched) return;

			setLoading(true);

			const url = `${process.env.NEXT_PUBLIC_API}/services/gallery/${params.projectId}/albums?cursor=${cursor}`;
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
					let len = res.data.length;
					if (len < LIMIT) {
						setAllFetched(true);
					}
					setAllAlbums((prev) => {
						const newAlbums = res.data.filter(
							(album: Album) =>
								!prev.some(
									(existingAlbum) =>
										existingAlbum.id === album.id
								)
						);
						return [...prev, ...newAlbums];
					});
				})
				.catch((err) => {
					toast.error(err.message);
				})
				.finally(() => setLoading(false));
		},
		[user, params.projectId, allFetched]
	);

	const callback: IntersectionObserverCallback = useCallback(
		(entries, observer) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting && search.length == 0) {
					let lastInd = allAlbums.length;
					if (lastInd < LIMIT) return;

					let newCursor = new Date(
						allAlbums[lastInd - 1].createdAt
					).toISOString();
					getAllAlbums(newCursor);
				}
			});
		},
		[search, allAlbums, getAllAlbums]
	);

	const elementRef = useIntersection(
		callback,
		document.getElementById("content-root")
	);

	useEffect(() => {
		getAllAlbums(getNow());
	}, [getAllAlbums]);

	const elements: JSX.Element[] = [];
	allAlbums.forEach((album) => {
		const { id, name } = album;
		const element = (
			<AlbumItem key={id} album={album} setAllAlbums={setAllAlbums} />
		);

		if (search.length === 0) {
			elements.push(element);
			return;
		}

		if (
			id.toLowerCase().includes(search.toLowerCase()) ||
			name.toLowerCase().includes(search.toLowerCase())
		)
			elements.push(element);
	});

	return (
		<div className={styles.gallery}>
			<div className={styles.search} title="search albums by id or name">
				<h2>Album Overview</h2>

				<input
					type="text"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Type to search..."
				/>
			</div>

			<div
				className={styles.container}
				data-empty={allAlbums.length === 0 || elements.length === 0}
				data-load={loading && allAlbums.length === 0}
			>
				{loading && allAlbums.length === 0 ? (
					<Loader />
				) : allAlbums.length === 0 ? (
					<h3>No albums exist for this project</h3>
				) : elements.length === 0 ? (
					<p>
						There is no album with name{" "}
						<span className="italic">
							<q>{search}</q>
						</span>
					</p>
				) : (
					<Container type="full" className={styles.table}>
						<div className={styles.heading}>
							<h4>Details</h4>

							<h4>Edit</h4>

							<h4>Delete</h4>
						</div>

						{elements}

						<div
							style={{
								visibility: "hidden",
							}}
							ref={elementRef}
						></div>
					</Container>
				)}
			</div>

			{loading && allAlbums.length > 0 && <Loader variant="small" />}
		</div>
	);
};

export default GalleryPage;
