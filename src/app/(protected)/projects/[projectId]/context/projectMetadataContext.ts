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
