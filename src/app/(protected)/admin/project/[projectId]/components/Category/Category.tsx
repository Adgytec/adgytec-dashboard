"use client";

import { UserContext } from "@/components/AuthContext/authContext";
import { useParams } from "next/navigation";
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	useRef,
} from "react";
import { toast } from "react-toastify";
import styles from "./category.module.scss";
import Loader from "@/components/Loader/Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { handleEscModal, handleModalClose } from "@/helpers/modal";

interface Category {
	categoryId: string;
	categoryName: string;
	subCategories: Category[];
}

type HandleCategories = (item: Category, level: number) => React.JSX.Element;
type AddHelper = (items: Category[]) => Category[];
type UpdateHelper = (items: Category[]) => Category[];

const Category = () => {
	const userWithRole = useContext(UserContext);
	const user = useMemo(
		() => (userWithRole ? userWithRole.user : null),
		[userWithRole]
	);

	const [loading, setLoading] = useState(true);
	const [categories, setCategories] = useState<Category | null>(null);

	const [manage, setManage] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [categoryName, setCategoryName] = useState<string>("");

	const params = useParams<{ projectId: string }>();

	const categoryIdRef = useRef<string | null>(null);
	const currentCategoryName = useRef<string>("");
	const addCategoryModal = useRef<HTMLDialogElement | null>(null);
	const updateCategoryModal = useRef<HTMLDialogElement | null>(null);
	const confirmDeleteModal = useRef<HTMLDialogElement | null>(null);

	const handleAddModalClose = () => handleModalClose(addCategoryModal);
	const handleUpdateModalClose = () => handleModalClose(updateCategoryModal);
	const handleConfirmDeleteClose = () => handleModalClose(confirmDeleteModal);

	const getCategory = useCallback(async () => {
		const url = `${process.env.NEXT_PUBLIC_API}/project/${params.projectId}/category`;
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

				setCategories(res.data.categories);
			})
			.catch((err) => {
				toast.error(err.message);
			})
			.finally(() => setLoading(false));
	}, [user, params.projectId]);

	useEffect(() => {
		getCategory();
	}, [getCategory]);

	const addObject = (parentId: string, newObj: Category) => {
		const addHelper: AddHelper = (items) => {
			if (items.length === 0) return [];

			return items.map((item) => {
				if (item.categoryId === parentId) {
					return {
						...item,
						subCategories: [newObj, ...item.subCategories],
					} as Category;
				}
				return {
					...item,
					subCategories: addHelper(item.subCategories),
				} as Category;
			});
		};

		setCategories((prevData) => {
			if (!prevData) return null;

			if (prevData.categoryId === parentId)
				return {
					...prevData,
					subCategories: [newObj, ...prevData.subCategories],
				};

			return {
				...prevData,
				subCategories: addHelper(prevData.subCategories),
			};
		});
	};

	const handleAdd = async () => {
		const parentId = categoryIdRef.current;

		if (!parentId) {
			toast.error("Something went wrong. Please refresh this page.");
			return;
		}

		if (categoryName.length === 0) {
			toast.error("Category name is requried");
			return;
		}

		setError(null);
		setManage(true);

		const url = `${process.env.NEXT_PUBLIC_API}/project/${params.projectId}/category`;
		const token = await user?.getIdToken();
		const headers = {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		};
		const body = JSON.stringify({
			parentId,
			categoryName,
		});

		fetch(url, {
			method: "POST",
			body,
			headers,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) throw new Error(res.message);

				categoryIdRef.current = null;
				handleAddModalClose();
				toast.success("successfully added new category");

				const newObj: Category = {
					categoryId: res.data.categoryId as string,
					categoryName,
					subCategories: [],
				};
				setCategoryName("");

				addObject(parentId, newObj);
			})
			.catch((err) => {
				setError(err.message);
				setTimeout(() => {
					setError(null);
				}, 5000);
			})
			.finally(() => {
				setManage(false);
			});
	};

	const updateObject = (id: string, newName: string) => {
		const updateHelper: UpdateHelper = (items) => {
			return items.map((item) => {
				if (item.categoryId === id) {
					return {
						...item,
						categoryName: newName,
					};
				}

				return {
					...item,
					subCategories: updateHelper(item.subCategories),
				};
			});
		};

		setCategories((prevData) => {
			if (!prevData) return null;

			return {
				...prevData,
				subCategories: updateHelper(prevData.subCategories),
			};
		});
	};

	const handleUpdate = async () => {
		const categoryId = categoryIdRef.current;

		if (!categoryId) {
			toast.error("Something went wrong. Please refresh this page.");
			return;
		}

		if (categoryName.length === 0) {
			toast.error("Category name is requried");
			return;
		}

		setManage(false);
		setError(null);

		const url = `${process.env.NEXT_PUBLIC_API}/project/${params.projectId}/category/${categoryId}`;
		const token = await user?.getIdToken();
		const headers = {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		};
		const body = JSON.stringify({
			categoryName,
		});

		fetch(url, {
			method: "PATCH",
			headers,
			body,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) throw new Error(res.message);

				categoryIdRef.current = null;
				currentCategoryName.current = "";
				handleUpdateModalClose();
				toast.success("successfully updated category");
				setCategoryName("");
				updateObject(categoryId, categoryName);
			})
			.catch((err) => {
				setError(err.message);

				setTimeout(() => {
					setError(null);
				}, 5000);
			})
			.finally(() => {
				setManage(false);
			});
	};

	const removeObject = (id: string) => {
		const removeHelper = (items: Category[]) => {
			let found = false; // To track if the item has been found and removed

			const result = items.filter((item) => {
				if (item.categoryId === id) {
					found = true;
					return false; // Remove this item
				}

				item.subCategories = removeHelper(item.subCategories);
				if (found) {
					return true; // If found, keep the rest unchanged
				}
				return true; // Keep this item
			});

			return result;
		};

		setCategories((prevData) => {
			if (!prevData) return null;

			return {
				...prevData,
				subCategories: removeHelper(prevData.subCategories),
			};
		});
	};

	const handleDelete = async () => {
		const categoryId = categoryIdRef.current;

		if (!categoryId) {
			toast.error("Something went wrong. Please refresh this page.");
			return;
		}

		setManage(false);
		setError(null);

		const url = `${process.env.NEXT_PUBLIC_API}/project/${params.projectId}/category/${categoryId}`;
		const token = await user?.getIdToken();
		const headers = {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		};

		fetch(url, {
			method: "DELETE",
			headers,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) throw new Error(res.message);

				categoryIdRef.current = null;
				handleConfirmDeleteClose();
				toast.success("successfully deleted category");

				removeObject(categoryId);
			})
			.catch((err) => {
				setError(err.message);

				setTimeout(() => {
					setError(null);
				}, 5000);
			})
			.finally(() => {
				setManage(false);
			});
	};

	const handleCategories: HandleCategories = (
		{ categoryId, categoryName, subCategories },
		level
	) => {
		return (
			<li key={categoryId} data-level={level}>
				<div className={styles.details}>
					<p>{categoryName}</p>

					<div className={styles.action}>
						<button
							data-type="link"
							data-variant="secondary"
							title="add"
							onClick={() => {
								categoryIdRef.current = categoryId;
								setCategoryName("");
								addCategoryModal.current?.showModal();
							}}
							disabled={manage}
						>
							<FontAwesomeIcon icon={faPlus} />
						</button>

						<button
							data-type="link"
							data-variant="secondary"
							title="update"
							onClick={() => {
								categoryIdRef.current = categoryId;
								setCategoryName(categoryName);
								currentCategoryName.current = categoryName;
								updateCategoryModal.current?.showModal();
							}}
							disabled={manage}
						>
							<FontAwesomeIcon icon={faPencil} />
						</button>

						<button
							data-type="link"
							data-variant="error"
							title="delete"
							onClick={() => {
								categoryIdRef.current = categoryId;
								confirmDeleteModal.current?.showModal();
							}}
							disabled={manage}
						>
							<FontAwesomeIcon icon={faTrashCan} />
						</button>
					</div>
				</div>

				{subCategories.length > 0 && (
					<ul>
						{subCategories.map((item) =>
							handleCategories(item, level + 1)
						)}
					</ul>
				)}
			</li>
		);
	};

	return (
		<>
			<dialog
				onKeyDown={handleEscModal}
				ref={confirmDeleteModal}
				className="delete-confirm"
			>
				<div className="delete-modal">
					<div className="modal-menu">
						<h2>Confirm Deletion</h2>

						<button
							data-type="link"
							onClick={handleConfirmDeleteClose}
							title="close"
							disabled={manage}
						>
							<FontAwesomeIcon icon={faXmark} />
						</button>
					</div>

					<div className="delete-content">
						<p>Are you sure you want to delete?</p>

						<p>
							Deleting this will permanently remove this item.
							This action cannot be undone.
						</p>
					</div>

					{error && <p className="error">{error}</p>}

					<div className="delete-action">
						<button
							data-type="link"
							disabled={manage}
							onClick={handleConfirmDeleteClose}
						>
							Cancel
						</button>

						<button
							data-type="button"
							className={styles.delete}
							disabled={manage}
							data-load={manage}
							onClick={handleDelete}
							data-variant="error"
						>
							{manage ? <Loader variant="small" /> : "Delete"}
						</button>
					</div>
				</div>
			</dialog>

			<dialog onKeyDown={handleEscModal} ref={addCategoryModal}>
				<div className="modal">
					<div className="modal-menu">
						<h2>Add Category</h2>

						<button
							data-type="link"
							onClick={handleAddModalClose}
							title="close"
							disabled={manage}
						>
							<FontAwesomeIcon icon={faXmark} />
						</button>
					</div>

					<div className={styles.modalContent}>
						<div className="input">
							<label htmlFor="category-name-add">
								Category Name
							</label>
							<input
								id="category-name-add"
								type="text"
								value={categoryName}
								onChange={(e) =>
									setCategoryName(e.target.value)
								}
								placeholder="Category Name..."
								disabled={manage}
								onKeyDown={(e) => {
									if (e.code === "Enter") {
										handleAdd();
									}
								}}
							/>
						</div>

						{error && <p className="error">{error}</p>}
					</div>

					<div className="action">
						<button
							data-type="link"
							disabled={manage}
							onClick={handleAddModalClose}
						>
							Cancel
						</button>

						<button
							data-type="button"
							data-variant="secondary"
							disabled={manage || categoryName.length === 0}
							data-load={manage}
							onClick={handleAdd}
						>
							{manage ? (
								<Loader variant="small" />
							) : (
								"Add Category"
							)}
						</button>
					</div>
				</div>
			</dialog>

			<dialog onKeyDown={handleEscModal} ref={updateCategoryModal}>
				<div className="modal">
					<div className="modal-menu">
						<h2>Update Category</h2>

						<button
							data-type="link"
							onClick={handleUpdateModalClose}
							title="close"
							disabled={manage}
						>
							<FontAwesomeIcon icon={faXmark} />
						</button>
					</div>

					<div className={styles.modalContent}>
						<div className="input">
							<label htmlFor="category-name-add">
								Category Name
							</label>
							<input
								id="category-name-add"
								type="text"
								value={categoryName}
								onChange={(e) =>
									setCategoryName(e.target.value)
								}
								placeholder="Category Name..."
								disabled={manage}
								onKeyDown={(e) => {
									if (e.code === "Enter") {
										handleUpdate();
									}
								}}
							/>
						</div>

						{error && <p className="error">{error}</p>}
					</div>

					<div className="action">
						<button
							data-type="link"
							disabled={manage}
							onClick={handleUpdateModalClose}
						>
							Cancel
						</button>

						<button
							data-type="button"
							data-variant="secondary"
							disabled={
								manage ||
								categoryName.length === 0 ||
								categoryName === currentCategoryName.current
							}
							data-load={manage}
							onClick={handleUpdate}
						>
							{manage ? (
								<Loader variant="small" />
							) : (
								"Update Category"
							)}
						</button>
					</div>
				</div>
			</dialog>

			<div className={styles.category}>
				{loading ? (
					<div data-load="true">
						<Loader variant="small" />
					</div>
				) : (
					<div
						className={styles.categoryList}
						data-empty={!categories}
					>
						{!categories ? (
							<p>No categories exist for the project.</p>
						) : (
							<ul>
								<li>
									<div className={styles.details}>
										<p>{categories.categoryName}</p>

										<div className={styles.action}>
											<button
												data-type="link"
												data-variant="secondary"
												title="add"
												onClick={() => {
													categoryIdRef.current =
														categories.categoryId;
													setCategoryName("");
													addCategoryModal.current?.showModal();
												}}
											>
												<FontAwesomeIcon
													icon={faPlus}
												/>
											</button>
										</div>
									</div>

									{categories.subCategories.length > 0 && (
										<ul>
											{categories.subCategories.map(
												(item) =>
													handleCategories(item, 0)
											)}
										</ul>
									)}
								</li>
							</ul>
						)}
					</div>
				)}
			</div>
		</>
	);
};

export default Category;
