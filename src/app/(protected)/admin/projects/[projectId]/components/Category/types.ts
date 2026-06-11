export interface CategoryItem {
    categoryId: string;
    categoryName: string;
}

export interface CategoryType extends CategoryItem {
    subCategories: CategoryType[];
}
