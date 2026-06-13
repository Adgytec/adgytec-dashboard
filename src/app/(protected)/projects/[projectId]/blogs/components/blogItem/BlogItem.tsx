import {
    IconButton,
    Menu,
    MenuItem,
    MenuPopover,
    MenuTrigger,
    Splash,
    typography,
    useSplash,
} from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import {
    BookOpen,
    EllipsisVertical,
    FilePenLine,
    Image,
    Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GridListItem, Text } from "react-aria-components";
import type { Blog } from "../../page";
import styles from "./blogItem.module.css";
import { DeleteBlog } from "./DeleteBlog";
import { EditBlog } from "./EditBlog";
import { UpdateBlogCover } from "./UpdateBlogCover";

export const BlogItem: React.FC<{
    blog: Blog;
}> = ({ blog }) => {
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [updateCoverOpen, setUpdateCoverOpen] = useState(false);

    const { splashInfo, handlePress } = useSplash();
    const router = useRouter();

    const d = new Date(blog.createdAt);

    return (
        <GridListItem
            className={clsx(styles["blogCard"])}
            data-has-cover={!!blog.cover}
            onPress={handlePress}
            onAction={() => {
                router.push(`blogs/${blog.blogId}`);
            }}
        >
            {splashInfo && <Splash {...splashInfo} />}

            {blog.cover && (
                <div className={clsx(styles["cover"])}>
                    <img
                        src={blog.cover}
                        width={300}
                        height={160}
                        alt={blog.title}
                    />
                </div>
            )}

            <div className={clsx(styles["content"])}>
                <div className={clsx(styles["meta"])}>
                    <span
                        className={clsx(
                            styles["category"],
                            typography.labelSmall
                        )}
                    >
                        {blog.category.name}
                    </span>
                    <span
                        className={clsx(styles["date"], typography.labelSmall)}
                    >
                        {d.toLocaleDateString()}
                    </span>
                </div>

                <Text
                    className={clsx(styles["title"], typography.titleMedium)}
                    title={blog.title}
                >
                    {blog.title}
                </Text>

                {blog.summary && (
                    <Text
                        slot="description"
                        className={clsx(
                            styles["summary"],
                            typography.bodySmall
                        )}
                        title={blog.summary}
                    >
                        {blog.summary}
                    </Text>
                )}

                <div className={clsx(styles["footer"])}>
                    {blog.author && (
                        <span
                            className={clsx(
                                styles["author"],
                                typography.labelSmall
                            )}
                        >
                            By {blog.author}
                        </span>
                    )}

                    <MenuTrigger>
                        <IconButton
                            color="standard"
                            icon={EllipsisVertical}
                            tooltip="Manage blog"
                            onPress={(e) => e.continuePropagation()}
                            className={clsx(styles["options"])}
                        />

                        <MenuPopover>
                            <Menu>
                                <MenuItem
                                    leadingIcon={BookOpen}
                                    onAction={() =>
                                        router.push(`blogs/${blog.blogId}`)
                                    }
                                    label="Read Blog"
                                />

                                <MenuItem
                                    leadingIcon={FilePenLine}
                                    onAction={() => setEditOpen(true)}
                                    label="Edit Details"
                                />

                                <MenuItem
                                    leadingIcon={Image}
                                    onAction={() => setUpdateCoverOpen(true)}
                                    label="Update Cover"
                                />

                                <MenuItem
                                    leadingIcon={Trash2}
                                    onAction={() => setDeleteOpen(true)}
                                    label="Delete"
                                />
                            </Menu>
                        </MenuPopover>
                    </MenuTrigger>
                </div>
            </div>

            <UpdateBlogCover
                id={blog.blogId}
                currentCover={blog.cover}
                isOpen={updateCoverOpen}
                onOpenChange={setUpdateCoverOpen}
            />

            <EditBlog
                id={blog.blogId}
                currentTitle={blog.title}
                currentSummary={blog.summary || ""}
                currentCategoryId={blog.category.id}
                currentCategoryName={blog.category.name}
                isOpen={editOpen}
                onOpenChange={setEditOpen}
            />

            <DeleteBlog
                id={blog.blogId}
                isOpen={deleteOpen}
                onOpenChange={setDeleteOpen}
            />
        </GridListItem>
    );
};

export default BlogItem;
