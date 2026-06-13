import { createContext } from "react";

export interface Category {
    categoryId: string;
    categoryName: string;
    subCategories: Category[];
}

export type ProjectMetadata = {
    categories: Category;
};

export const ProjectMetadataContext = createContext<ProjectMetadata | null>(
    null
);

export function flattenCategories(category: Category): Category[] {
    const result: Category[] = [];

    function walk(cat: Category) {
        result.push(cat);

        for (const sub of cat.subCategories) {
            walk(sub);
        }
    }

    walk(category);

    return result;
}
