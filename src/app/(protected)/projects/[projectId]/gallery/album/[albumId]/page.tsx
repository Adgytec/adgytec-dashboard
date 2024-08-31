"use client";

import { useParams, useSearchParams } from "next/navigation";
import styles from "./album.module.scss";
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { UserContext } from "@/components/AuthContext/authContext";
import Loader from "@/components/Loader/Loader";
import { toast } from "react-toastify";
import { getNow } from "@/helpers/helpers";
import { useIntersection } from "@/hooks/intersetion-observer/intersection-observer";
import {
	handleEscModal,
	handleModalClose,
	lightDismiss,
} from "@/helpers/modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useFile } from "@/components/FileInput/hooks/useFile";
import FileInput from "@/components/FileInput/FileInput";
import Image from "next/image";
import Container from "@/components/Container/Container";

export interface Picture {
	id: string;
	image: string;
	createdAt: string;
}

interface AddedPicture {
	id: string;
	image: string;
}

const LIMIT = 20;
const UPLOAD_LIMIT = 5;

const AlbumPage = () => {
	const userWithRole = useContext(UserContext);
	const user = useMemo(() => {
		return userWithRole ? userWithRole.user : null;
	}, [userWithRole]);

	const params = useParams<{
		projectId: string;
		albumId: string;
	}>();
	const albumName = useSearchParams().get("name");

	const [images, setImages] = useFile();

	const [loading, setLoading] = useState(true);
	const [allPictures, setAllPictures] = useState<Picture[]>([]);
	const [addedPictures, setAddedPictures] = useState<AddedPicture[]>([]);
	const [allFetched, setAllFetched] = useState(false);

	const [adding, setAdding] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const activeUploadRef = useRef<number>(0);
	const currIndRef = useRef<number>(0);
	const [uploadStatus, setUploadStatus] = useState({
		success: 0,
		failed: 0,
	});

	const addImageModalRef = useRef<HTMLDialogElement | null>(null);
	const handleClose = () => handleModalClose(addImageModalRef);

	const callback: IntersectionObserverCallback = useCallback(
		(entries, observer) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					let lastInd = allPictures.length;
					if (lastInd < LIMIT) return;

					let newCursor = new Date(
						allPictures[lastInd - 1].createdAt
					).toISOString();
					getAllPictures(newCursor);
				}
			});
		},
		[allPictures]
	);

	const elementRef = useIntersection(
		callback,
		document.getElementById("content-root")
	);

	const getAllPictures = useCallback(
		async (cursor: string) => {
			if (allFetched) return;

			const url = `${process.env.NEXT_PUBLIC_API}/services/gallery/${params.projectId}/album/${params.albumId}?cursor=${cursor}`;
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

					setAllPictures((prev) => {
						const newPiectures = res.data.filter(
							(picture: Picture) =>
								!prev.some(
									(exitingPicture) =>
										exitingPicture.id === picture.id
								)
						);
						return [...prev, ...newPiectures];
					});
				})
				.catch((err) => {
					toast.error(err.message);
				})
				.finally(() => setLoading(false));
		},
		[user, params.projectId, params.albumId, allFetched]
	);

	useEffect(() => {
		getAllPictures(getNow());
	}, [getAllPictures]);

	const uploadImages = async () => {
		if (currIndRef.current >= images.length) {
			// all images are done
			if (activeUploadRef.current === 0) {
				setImages([]);
				setAdding(false);
				handleClose();

				if (uploadStatus.success > 0)
					toast.success("successfully added images to the album");
				else toast.error("failed to upload images");
			}
			return;
		}

		if (activeUploadRef.current >= UPLOAD_LIMIT) return;

		const url = `${process.env.NEXT_PUBLIC_API}/services/gallery/${params.projectId}/album/${params.albumId}`;
		const token = await user?.getIdToken();
		const headers = {
			Authorization: `Bearer ${token}`,
		};

		const len = images.length;

		while (
			activeUploadRef.current < UPLOAD_LIMIT &&
			currIndRef.current < len
		) {
			const file = images[currIndRef.current].file;
			const image = images[currIndRef.current].url;

			const formData = new FormData();
			formData.append("photo", file);

			activeUploadRef.current++;
			currIndRef.current++;

			fetch(url, {
				method: "POST",
				headers,
				body: formData,
			})
				.then((res) => res.json())
				.then((res) => {
					if (res.error) throw new Error(res.message);

					const id = res.data.id;
					setAddedPictures((prev) => [{ id, image }, ...prev]);
					setUploadStatus((prev) => {
						return { ...prev, success: prev.success + 1 };
					});
				})
				.catch((err) => {
					console.error("failed to upload one image");
					setUploadStatus((prev) => {
						return { ...prev, failed: prev.failed + 1 };
					});
				})
				.finally(() => {
					activeUploadRef.current--;

					uploadImages();
				});
		}
	};

	const handleAdd = () => {
		if (images.length === 0) {
			setError("Please select at least one image to add to this album.");
			return;
		}

		setError(null);
		setAdding(true);
		activeUploadRef.current = 0;
		currIndRef.current = 0;
		setUploadStatus({
			success: 0,
			failed: 0,
		});

		uploadImages();
	};

	return (
		<>
			<dialog
				ref={addImageModalRef}
				onKeyDown={(e) => {
					if (!adding) return;
					handleEscModal(e);
				}}
				onClick={(e) => {
					if (adding) return;
					lightDismiss(e);
				}}
				className={styles.modal}
			>
				<div className="modal">
					<div className="modal-menu">
						<h2>Add Images</h2>

						<button
							data-type="link"
							onClick={handleClose}
							title="close"
							// disabled={coverUpdating}
						>
							<FontAwesomeIcon icon={faXmark} />
						</button>
					</div>

					<div className={styles.addImages}>
						<label>Select Image</label>

						<FileInput
							setFiles={setImages}
							multiple={true}
							disabled={adding}
							files={images}
							id={params.albumId}
						/>

						{error && <p className="error">{error}</p>}
					</div>

					<div className="action">
						<button
							data-type="link"
							disabled={adding}
							onClick={handleClose}
						>
							Cancel
						</button>

						<button
							data-type="button"
							disabled={adding || images.length === 0}
							data-load={adding}
							onClick={handleAdd}
							data-variant="primary"
						>
							{adding ? <Loader variant="small" /> : "Add"}
						</button>
					</div>
				</div>
			</dialog>

			<div className={styles.album}>
				<div className={styles.heading}>
					<h2>{albumName}</h2>

					<button
						disabled={loading}
						data-type="button"
						data-variant="secondary"
						onClick={() => addImageModalRef.current?.showModal()}
					>
						Add
					</button>
				</div>

				<Container
					type="full"
					className={styles.container}
					data-load={loading}
					data-empty={
						allPictures.length === 0 && addedPictures.length === 0
					}
				>
					{loading ? (
						<Loader />
					) : allPictures.length === 0 &&
					  addedPictures.length === 0 ? (
						<h3>There are no photos here.</h3>
					) : (
						<>
							<div className={styles.action}>
								<button data-type="link" data-variant="primary">
									Manage
								</button>
							</div>

							<div className={styles.images}>
								{addedPictures.map((picture) => {
									return (
										<div key={picture.id}>
											<img src={picture.image} />
										</div>
									);
								})}

								{allPictures.map((picture) => {
									return (
										<div key={picture.id}>
											<Image
												width="730"
												height="640"
												src={picture.image}
												loading="lazy"
												onClick={() =>
													window.open(
														picture.image,
														"_blank"
													)
												}
												alt=""
											/>
										</div>
									);
								})}
							</div>

							<div ref={elementRef}></div>
						</>
					)}
				</Container>
			</div>
		</>
	);
};

export default AlbumPage;
