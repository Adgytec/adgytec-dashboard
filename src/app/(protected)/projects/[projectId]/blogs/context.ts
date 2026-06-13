import { createContext, useContext } from "react";
import type { Blog } from "./page";

export type BlogContextType = {
    removeBlog: (id: string) => void;
    updateBlog: (id: string, updatedFields: Partial<Blog>) => void;
    projectID: string;
};

export const BlogContext = createContext<BlogContextType | null>(null);

export function useBlogActions() {
    const ctx = useContext(BlogContext);
    if (!ctx) {
        throw new Error("useBlogActions should be used inside BlogContext");
    }

    return ctx;
}
