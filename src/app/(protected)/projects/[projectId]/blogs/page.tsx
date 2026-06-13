"use client";

import {
    LinkIconButton,
    SearchField,
    typography,
    useSnackbarQueue,
} from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import { BadgePlus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useContext, useEffect, useMemo, useState } from "react";
import {
    Collection,
    GridLayout,
    GridList,
    GridListLoadMoreItem,
    Heading,
    Size,
    useAsyncList,
    Virtualizer,
} from "react-aria-components";
import { UserContext } from "@/components/AuthContext/authContext";
import Loader from "@/components/Loader/Loader";
import { getNow } from "@/helpers/helpers";
import styles from "./blogs.module.css";
import BlogItem from "./components/blogItem/BlogItem";
import { BlogContext } from "./context";

interface CategoryDetail {
    id: string;
    name: string;
}

export interface Blog {
    title: string;
    summary?: string;
    author: string;
    blogId: string;
    createdAt: string;
    cover: string;
    category: CategoryDetail;
}

const BlogsPage = () => {
    const userWithRole = useContext(UserContext);
    const user = useMemo(() => {
        return userWithRole ? userWithRole.user : null;
    }, [userWithRole]);

    const params = useParams<{ projectId: string }>();
    const [search, setSearch] = useState<string>("");

    const snackbarQueue = useSnackbarQueue();

    const blogs = useAsyncList<Blog, string | null>({
        async load({ cursor, signal, items }) {
            if (!user) {
                return {
                    items: [],
                    cursor: null,
                };
            }

            const token = await user?.getIdToken();
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API}/services/blogs/${
                    params.projectId
                }?cursor=${cursor ?? getNow()}`,
                {
                    signal,
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const json = await res.json();

            if (json.error) {
                throw new Error(json.message);
            }

            const existingIds = new Set(items.map((b) => b.blogId));

            const nextItems = json.data.blogs.filter(
                (blog: Blog) => !existingIds.has(blog.blogId)
            );

            return {
                items: nextItems,
                cursor: json.data.pageInfo.nextPage
                    ? json.data.pageInfo.cursor
                    : null,
            };
        },
        getKey(item) {
            return item.blogId;
        },
    });

    const filteredBlogs = useMemo(() => {
        if (!search) return blogs.items;

        const value = search.toLowerCase();

        return blogs.items.filter(
            (blog) =>
                blog.blogId.toLowerCase().includes(value) ||
                blog.title.toLowerCase().includes(value) ||
                blog.author.toLowerCase().includes(value) ||
                blog.category.name.toLowerCase().includes(value)
        );
    }, [blogs.items, search]);

    useEffect(() => {
        if (!blogs.error) return;

        snackbarQueue.add({
            supportingText: blogs.error.message,
        });
    }, [blogs.error, snackbarQueue]);

    /* biome-ignore lint: reload blogs on project change */
    useEffect(() => {
        blogs.reload();
    }, [params.projectId]);

    const removeBlog = (id: string) => {
        blogs.remove(id);
        console.log(blogs.items);
    };

    const updateBlog = (id: string, updatedFields: Partial<Blog>) => {
        blogs.update(id, (prev) => {
            return { ...prev, ...updatedFields };
        });
    };

    return (
        <div className={styles.blogs}>
            <div className={styles["header"]}>
                <SearchField
                    className={clsx(styles["search"])}
                    aria-label="Blog Search"
                    value={search}
                    onChange={setSearch}
                    placeholder="Search blog"
                    isReadOnly={blogs.loadingState === "loading"}
                />

                <LinkIconButton
                    href={`/projects/${params.projectId}/blogs/create`}
                    size="medium"
                    icon={BadgePlus}
                    color="tonal"
                    width="wide"
                    tooltip="Create Blog"
                    render={(props) => {
                        if ("href" in props) {
                            return <Link {...props} />;
                        }
                        return <span {...props} />;
                    }}
                />
            </div>

            <BlogContext
                value={{
                    removeBlog,
                    updateBlog,
                    projectID: params.projectId,
                }}
            >
                <Virtualizer
                    layout={GridLayout}
                    layoutOptions={{
                        minItemSize: new Size(250, 360),
                        maxItemSize: new Size(Infinity, 360),
                        preserveAspectRatio: true,
                        maxColumns: 4,
                    }}
                >
                    <GridList
                        layout="grid"
                        aria-label="Blogs"
                        renderEmptyState={() => {
                            if (blogs.loadingState === "loading") {
                                return (
                                    <div
                                        style={{
                                            display: "grid",
                                            placeItems: "center",
                                            blockSize: "50svb",
                                        }}
                                    >
                                        <Loader />
                                    </div>
                                );
                            }

                            if (search) {
                                return (
                                    <p className={clsx(typography.titleMedium)}>
                                        No blog found matching{" "}
                                        <span className="italic">
                                            <q>{search}</q>
                                        </span>
                                    </p>
                                );
                            }

                            return (
                                <Heading
                                    className={clsx(typography.titleMedium)}
                                >
                                    No blogs exist for this project.
                                </Heading>
                            );
                        }}
                    >
                        <Collection items={filteredBlogs}>
                            {(blog) => (
                                <BlogItem key={blog.blogId} blog={blog} />
                            )}
                        </Collection>

                        {!search && (
                            <GridListLoadMoreItem
                                onLoadMore={blogs.loadMore}
                                isLoading={blogs.loadingState === "loadingMore"}
                            >
                                <Loader size={16} />
                            </GridListLoadMoreItem>
                        )}
                    </GridList>
                </Virtualizer>
            </BlogContext>
        </div>
    );
};

export default BlogsPage;
