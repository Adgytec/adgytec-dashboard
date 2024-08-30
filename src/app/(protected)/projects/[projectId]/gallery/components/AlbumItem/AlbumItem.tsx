import React, { useContext, useMemo, useRef, useState } from "react";
import { Album } from "../../page";
import styles from "./albumItem.module.scss";
import { UserContext } from "@/components/AuthContext/authContext";
import { useFile } from "@/components/FileInput/hooks/useFile";
import { useParams } from "next/navigation";
import { handleEscModal, handleModalClose } from "@/helpers/modal";
import { toast } from "react-toastify";
import { validateString } from "@/helpers/validation";
import Loader from "@/components/Loader/Loader";
import { faTrashCan, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createPortal } from "react-dom";
import FileInput from "@/components/FileInput/FileInput";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import Container from "@/components/Container/Container";
import Link from "next/link";
import { trimStringWithEllipsis } from "@/helpers/helpers";

interface AlbumItemProps {
	album: Album;
	setAllAlbums: React.Dispatch<React.SetStateAction<Album[]>>;
}

const AlbumItem = ({ album, setAllAlbums }: AlbumItemProps) => {
	const userWithRole = useContext(UserContext);
	const user = useMemo(() => {
		return userWithRole ? userWithRole.user : null;
	}, [userWithRole]);

	const [cover, setCover] = useFile();
	const [coverError, setCoverError] = useState<null | string>(null);

	const params = useParams<{ projectId: string }>();

	const [isEdit, setIsEdit] = useState(false);
	const [updating, setUpdating] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [coverUpdating, setCoverUpdating] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [albumName, setAlbumName] = useState<string>(album.name);

	const deleteConfirmRef = useRef<HTMLDialogElement | null>(null);
	const updateCoverRef = useRef<HTMLDialogElement | null>(null);

	let d = new Date(album.createdAt);

	const handleClose = (
		ref: React.MutableRefObject<HTMLDialogElement | null>
	) => handleModalClose(ref);

	const validateInput = () => {
		if (!validateString(albumName, 3)) {
			toast.error("album name too short!");
			return false;
		}

		return true;
	};

	const handleUpdate = async () => {
		if (!validateInput()) return;

		setUpdating(true);
		const url = `${process.env.NEXT_PUBLIC_API}/services/gallery/${params.projectId}/albums/${album.id}/metadata`;
		const token = await user?.getIdToken();
		const headers = {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		};
		const body = JSON.stringify({
			name: albumName,
		});

		fetch(url, {
			method: "PATCH",
			headers,
			body,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) throw new Error(res.message);
				toast.success(res.message);
				album.name = albumName;
				setIsEdit(false);
			})
			.catch((err) => {
				toast.error(err.message);
			})
			.finally(() => {
				setUpdating(false);
			});
	};

	const handleDelete = async () => {
		setDeleting(true);
		setError(null);

		const url = `${process.env.NEXT_PUBLIC_API}/services/gallery/${params.projectId}/albums/${album.id}`;
		const token = await user?.getIdToken();
		const headers = {
			Authorization: `Bearer ${token}`,
		};

		fetch(url, {
			method: "DELETE",
			headers,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) throw new Error(res.message);

				setAllAlbums((prev) => {
					let temp = prev;

					return temp.toSpliced(
						temp.findIndex((b) => b.id === album.id),
						1
					);
				});
				toast.success("successfully deleted blog item");
			})
			.catch((err) => {
				setError(err.message);
			})
			.finally(() => setDeleting(false));
	};

	const handleCoverImage = async () => {
		if (!cover[0].file) {
			setCoverError("no file selected");
			return;
		}
		setCoverUpdating(true);
		setCoverError(null);
		const url = `${process.env.NEXT_PUBLIC_API}/services/gallery/${params.projectId}/albums/${album.id}/cover`;
		const token = await user?.getIdToken();
		const headers = {
			Authorization: `Bearer ${token}`,
		};

		const formData = new FormData();
		formData.append("cover", cover[0].file);

		fetch(url, {
			method: "PATCH",
			headers,
			body: formData,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) throw new Error(res.message);

				updateCoverRef.current?.close();
				toast.success("successfully updated album cover");
				if (cover[0].url) album.cover = cover[0].url;

				setCover([]);
			})
			.catch((err) => {
				setCoverError(err.message);
			})
			.finally(() => {
				setCoverUpdating(false);
			});
	};

	return (
		<>
			{createPortal(
				<>
					<dialog
						onKeyDown={handleEscModal}
						ref={deleteConfirmRef}
						className="delete-confirm"
					>
						<div className="delete-modal">
							<div className="modal-menu">
								<h2>Confirm Deletion</h2>

								<button
									data-type="link"
									onClick={() =>
										handleClose(deleteConfirmRef)
									}
									title="close"
									disabled={deleting}
								>
									<FontAwesomeIcon icon={faXmark} />
								</button>
							</div>

							<div className="delete-content">
								<p>Are you sure you want to delete?</p>

								<p>
									Deleting this will permanently remove this
									album and its images. This action cannot be
									undone.
								</p>
							</div>

							{error && <p className="error">{error}</p>}

							<div className="delete-action">
								<button
									data-type="link"
									disabled={deleting}
									onClick={() =>
										handleClose(deleteConfirmRef)
									}
								>
									Cancel
								</button>

								<button
									data-type="button"
									className={styles.delete}
									disabled={deleting}
									data-load={deleting}
									onClick={handleDelete}
									data-variant="error"
								>
									{deleting ? (
										<Loader variant="small" />
									) : (
										"Delete"
									)}
								</button>
							</div>
						</div>
					</dialog>

					<dialog ref={updateCoverRef}>
						<div className="modal">
							<div className="modal-menu">
								<h2>Update Album Cover</h2>

								<button
									data-type="link"
									onClick={() => handleClose(updateCoverRef)}
									title="close"
									disabled={coverUpdating}
								>
									<FontAwesomeIcon icon={faXmark} />
								</button>
							</div>

							<div className={styles.updateCover}>
								<label>Cover Image</label>

								<FileInput
									setFiles={setCover}
									multiple={false}
									disabled={coverUpdating}
									files={cover}
									id={album.id}
								/>
							</div>

							{coverError && (
								<p className="error">{coverError}</p>
							)}

							<div className="action">
								<button
									data-type="link"
									disabled={coverUpdating}
									onClick={() => handleClose(updateCoverRef)}
								>
									Cancel
								</button>

								<button
									data-type="button"
									disabled={coverUpdating || !cover.length}
									data-load={coverUpdating}
									onClick={handleCoverImage}
									data-variant="primary"
								>
									{coverUpdating ? (
										<Loader variant="small" />
									) : (
										"Update"
									)}
								</button>
							</div>
						</div>
					</dialog>
				</>,
				document.body
			)}

			<div className={styles.container}>
				<Container type="full" className={styles.detail}>
					<div className={styles.subContainer}>
						<div className={styles.image} data-edit={isEdit}>
							<img
								src={album.cover}
								alt={album.name}
								width={250}
								height={200}
							/>
							{isEdit && (
								<button
									data-type="link"
									data-variant="primary"
									disabled={updating}
									onClick={() =>
										updateCoverRef.current?.showModal()
									}
								>
									Update Cover
								</button>
							)}
						</div>

						<div className={styles.data}>
							<div className={styles.title}>
								{isEdit ? (
									<input
										type="text"
										placeholder="Album Name..."
										name="album-name"
										value={albumName}
										onChange={(e) =>
											setAlbumName(e.target.value)
										}
										disabled={updating}
									/>
								) : (
									<h2 className={styles.title}>
										<Link
											href={`gallery/album/${album.id}?name=${album.name}`}
											data-type="link"
										>
											{trimStringWithEllipsis(
												album.name,
												100
											)}
										</Link>
									</h2>
								)}
							</div>
							<p>{d.toDateString()}</p>
							{isEdit && (
								<div className={styles.update}>
									<button
										data-type="button"
										data-variant="secondary"
										disabled={
											albumName.length === 0 ||
											album.name === albumName ||
											updating
										}
										onClick={handleUpdate}
										data-load={updating}
									>
										{updating ? (
											<Loader variant="small" />
										) : (
											"Update"
										)}
									</button>
								</div>
							)}
						</div>
					</div>
				</Container>

				<div className={styles.action}>
					<button
						data-type="link"
						onClick={() => setIsEdit((prev) => !prev)}
						disabled={updating}
					>
						{isEdit ? (
							<FontAwesomeIcon icon={faXmark} />
						) : (
							<FontAwesomeIcon icon={faPenToSquare} />
						)}
					</button>
				</div>

				<div className={styles.action} data-delete>
					<button
						data-type="link"
						data-variant="error"
						disabled={updating}
						onClick={() => deleteConfirmRef.current?.showModal()}
					>
						<FontAwesomeIcon icon={faTrashCan} />
					</button>
				</div>
			</div>
		</>
	);
};

export default AlbumItem;
