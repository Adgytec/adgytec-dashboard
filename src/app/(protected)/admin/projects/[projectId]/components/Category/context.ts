import { createContext, useContext } from "react";
import type { CategoryItem } from "./types";

export type AddCategoryInput = {
    parentId: string;
} & CategoryItem;

export type CategoryContextType = {
    addCategory: (params: AddCategoryInput) => void;
    deleteCategory: (categoryID: string) => void;
    editCategory: (params: CategoryItem) => void;
    projectId: string;
};

export const CategoryContext = createContext<CategoryContextType | null>(null);

export function useCategoryActions() {
    const ctx = useContext(CategoryContext);
    if (!ctx) {
        throw new Error(
            "useCategoryActions should be used inside Category component."
        );
    }
    return ctx;
}
