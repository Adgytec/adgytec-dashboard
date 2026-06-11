"use client";

import { useSnackbarQueue } from "@adgytec/adgytec-web-ui-components";
import { useParams } from "next/navigation";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "@/components/AuthContext/authContext";
import Loader from "@/components/Loader/Loader";
import { CategoryItem as CategoryItemRenderer } from "./CategoryItem";
import styles from "./category.module.css";
import { type AddCategoryInput, CategoryContext } from "./context";
import type { CategoryItem, CategoryType } from "./types";

type AddHelper = (items: CategoryType[]) => CategoryType[];
type UpdateHelper = (items: CategoryType[]) => CategoryType[];

const Category = () => {
    const userWithRole = useContext(UserContext);
    const user = useMemo(
        () => (userWithRole ? userWithRole.user : null),
        [userWithRole]
    );

    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<CategoryType | null>(null);

    const snackbarQueue = useSnackbarQueue();

    const params = useParams<{ projectId: string }>();

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
                snackbarQueue.add({ supportingText: err.message });
            })
            .finally(() => setLoading(false));
    }, [user, params.projectId, snackbarQueue]);

    useEffect(() => {
        getCategory();
    }, [getCategory]);

    const addCategory = ({
        parentId,
        categoryId,
        categoryName,
    }: AddCategoryInput) => {
        addObject(parentId, {
            categoryId,
            categoryName,
            subCategories: [],
        });
    };

    const editCategory = ({ categoryId, categoryName }: CategoryItem) => {
        updateObject(categoryId, categoryName);
    };

    const deleteCategory = (categoryID: string) => {
        removeObject(categoryID);
    };

    const addObject = (parentId: string, newObj: CategoryType) => {
        const addHelper: AddHelper = (items) => {
            if (items.length === 0) return [];

            return items.map((item) => {
                if (item.categoryId === parentId) {
                    return {
                        ...item,
                        subCategories: [newObj, ...item.subCategories],
                    } as CategoryType;
                }
                return {
                    ...item,
                    subCategories: addHelper(item.subCategories),
                } as CategoryType;
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

    const removeObject = (id: string) => {
        const removeHelper = (items: CategoryType[]) => {
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

    return (
        <CategoryContext
            value={{
                addCategory,
                deleteCategory,
                editCategory,
                projectId: params.projectId,
            }}
        >
            <div className={styles.category}>
                {loading ? (
                    <div data-load="true">
                        <Loader />
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
                                <CategoryItemRenderer
                                    category={categories}
                                    isRoot
                                />
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </CategoryContext>
    );
};

export default Category;
