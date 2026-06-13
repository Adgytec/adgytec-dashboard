import {
    Button,
    ComboBox,
    ComboBoxPopover,
    ComboBoxTrigger,
    IconButton,
    Input,
    SelectItem,
    SelectList,
    TextArea,
    useSnackbarQueue,
} from "@adgytec/adgytec-web-ui-components";
import { ImagePlus, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import type React from "react";
import {
    type Dispatch,
    type MutableRefObject,
    type SetStateAction,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { FileTrigger } from "react-aria-components";
import { UserContext } from "@/components/AuthContext/authContext";
import { validateString } from "@/helpers/validation";
import {
    flattenCategories,
    ProjectMetadataContext,
} from "../../../context/projectMetadataContext";
import type { BlogDetails, NewImages } from "../../create/page";
import styles from "./details.module.css";

interface DetailsProps {
    blogDetails: BlogDetails;
    setBlogDetails: Dispatch<SetStateAction<BlogDetails>>;
    newImagesRef: MutableRefObject<NewImages[]>;
    deletedImages: string[];
    uuidRef: MutableRefObject<string | null>;
}

const Details = ({
    blogDetails,
    setBlogDetails,
    newImagesRef,
    deletedImages,
    uuidRef,
}: DetailsProps) => {
    const snackbarQueue = useSnackbarQueue();

    const userWithRole = useContext(UserContext);
    const user = useMemo(() => {
        return userWithRole ? userWithRole.user : null;
    }, [userWithRole]);

    const projectMetadata = useContext(ProjectMetadataContext);
    const { categories } = projectMetadata ?? {};

    const flattenedCategories = useMemo(
        () =>
            projectMetadata
                ? flattenCategories(projectMetadata.categories)
                : [],
        [projectMetadata]
    );

    const params = useParams<{ projectId: string }>();
    const [creating, setCreating] = useState<boolean>(false);
    const router = useRouter();

    const [coverUrl, setCoverUrl] = useState<string | null>(null);

    useEffect(() => {
        if (blogDetails.cover) {
            const url = URL.createObjectURL(blogDetails.cover);
            setCoverUrl(url);
            return () => {
                URL.revokeObjectURL(url);
            };
        }
        setCoverUrl(null);
    }, [blogDetails.cover]);

    const validateBlog = (): boolean => {
        if (!validateString(blogDetails.content, 50)) {
            snackbarQueue.add({ supportingText: "blog content too short!" });
            return false;
        }

        if (
            blogDetails.author.length > 0 &&
            !validateString(blogDetails.author, 3)
        ) {
            snackbarQueue.add({ supportingText: "name too short" });
            return false;
        }

        if (!validateString(blogDetails.title, 3)) {
            snackbarQueue.add({ supportingText: "blog title too short!" });
            return false;
        }

        if (
            blogDetails.summary.length > 0 &&
            !validateString(blogDetails.summary, 10)
        ) {
            snackbarQueue.add({ supportingText: "blog summary too short!" });
            return false;
        }

        return true;
    };

    const createBlog = async () => {
        const url = `${process.env.NEXT_PUBLIC_API}/services/blogs/${params.projectId}/${uuidRef.current}`;
        const token = await user?.getIdToken();
        const headers = {
            Authorization: `Bearer ${token}`,
        };

        const blogData = new FormData();
        blogData.append("title", blogDetails.title);
        if (blogDetails.cover) blogData.append("cover", blogDetails.cover);
        blogData.append("summary", blogDetails.summary);
        blogData.append("author", blogDetails.author);
        blogData.append("content", blogDetails.content);
        blogData.append("category", blogDetails.category);

        fetch(url, {
            method: "POST",
            headers,
            body: blogData,
        })
            .then((res) => {
                return res.json();
            })
            .then((res) => {
                if (res.error) throw new Error(res.message);

                snackbarQueue.add({ supportingText: res.message });
                router.push(`/projects/${params.projectId}/blogs`);
            })
            .catch((err) => {
                snackbarQueue.add({ supportingText: err.message });
            })
            .finally(() => {
                setCreating(false);
            });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateBlog()) return;

        setCreating(true);

        const newImages = newImagesRef.current.filter((img) => !img.isRemoved);

        const uploadPromises = newImages.map((img) => {
            const addMediaURL = `${process.env.NEXT_PUBLIC_API}/services/blogs/${params.projectId}/${uuidRef.current}/media`;

            const formData = new FormData();
            formData.append("image", img.file);

            return user?.getIdToken().then((token) => {
                const headers = {
                    Authorization: `Bearer ${token}`,
                };

                return fetch(addMediaURL, {
                    method: "POST",
                    headers,
                    body: formData,
                }).then((res) => res.json());
            });
        });

        Promise.all(uploadPromises)
            .then((results) => {
                for (const res of results) {
                    if (res?.error) {
                        throw new Error(res.message);
                    }
                }

                if (deletedImages.length > 0) {
                    const deleteMediaURL = `${process.env.NEXT_PUBLIC_API}/services/blogs/${params.projectId}/${uuidRef.current}/media`;
                    const body = JSON.stringify({
                        urls: deletedImages,
                    });

                    return user?.getIdToken().then((token) => {
                        const headers = {
                            Authorization: `Bearer ${token}`,
                        };

                        return fetch(deleteMediaURL, {
                            method: "DELETE",
                            headers: {
                                ...headers,
                                "Content-Type": "application/json",
                            },
                            body,
                        })
                            .then((res) => {
                                return res.json();
                            })
                            .then((res) => {
                                if (res.error) throw new Error(res.message);

                                console.log(
                                    "successfully deleted unused media"
                                );
                            })
                            .catch((err) => {
                                console.error(err.message);
                            });
                    });
                }

                createBlog();
            })
            .catch((err) => {
                snackbarQueue.add({ supportingText: err.message });
                setCreating(false);
            });
    };

    const handleValueChange = (name: keyof BlogDetails, value: string) => {
        setBlogDetails((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const isCreateDisabled = !blogDetails.title || !blogDetails.content;

    return (
        <div className={styles.details}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <Input
                    name="title"
                    value={blogDetails.title}
                    onChange={(val) => handleValueChange("title", val)}
                    label="Title"
                    placeholder="Title for the blog..."
                    isRequired
                    isReadOnly={creating}
                />

                <Input
                    name="author"
                    value={blogDetails.author}
                    onChange={(val) => handleValueChange("author", val)}
                    label="Author"
                    placeholder="Author for the blog..."
                    isReadOnly={creating}
                />

                {categories && (
                    <ComboBox
                        label="Category"
                        name="category"
                        isDisabled={creating}
                        value={blogDetails.category}
                        onChange={(key) => {
                            const id = String(key);
                            setBlogDetails((prev) => ({
                                ...prev,
                                category: id,
                            }));
                        }}
                    >
                        <ComboBoxTrigger placeholder="Select Category" />

                        <ComboBoxPopover>
                            <SelectList items={flattenedCategories}>
                                {(item) => (
                                    <SelectItem
                                        key={item.categoryId}
                                        id={item.categoryId}
                                        label={item.categoryName}
                                    />
                                )}
                            </SelectList>
                        </ComboBoxPopover>
                    </ComboBox>
                )}

                <TextArea
                    name="summary"
                    value={blogDetails.summary}
                    onChange={(val) => handleValueChange("summary", val)}
                    placeholder="Summary for the blog..."
                    label="Summary"
                    isReadOnly={creating}
                    rows={5}
                />

                <div className={styles.input}>
                    <span>Cover Image</span>
                    <div className={styles["logo-preview"]}>
                        {!blogDetails.cover && (
                            <FileTrigger
                                acceptedFileTypes={["image/*"]}
                                onSelect={(files) => {
                                    if (!files) return;
                                    if (files.length < 1) return;

                                    const file = files.item(0);
                                    if (!file) return;

                                    setBlogDetails((prev) => ({
                                        ...prev,
                                        cover: file,
                                    }));
                                }}
                            >
                                <Button
                                    color="text"
                                    isDisabled={creating}
                                    icon={ImagePlus}
                                    className={styles["logo-selection"]}
                                >
                                    Add
                                </Button>
                            </FileTrigger>
                        )}

                        {blogDetails.cover && coverUrl && (
                            <IconButton
                                icon={Trash2}
                                color="tonal"
                                className={styles["logo-remove"]}
                                onPress={() => {
                                    setBlogDetails((prev) => ({
                                        ...prev,
                                        cover: null,
                                    }));
                                }}
                                isDisabled={creating}
                            />
                        )}

                        {blogDetails.cover && coverUrl && (
                            <img
                                src={coverUrl}
                                alt="Blog cover"
                                className={styles["logo"]}
                                height={120}
                            />
                        )}
                    </div>
                </div>

                <div className={styles.actions}>
                    <Button
                        color="outlined"
                        onPress={() => {
                            router.back();
                        }}
                        isDisabled={creating}
                    >
                        Previous
                    </Button>

                    <Button
                        type="submit"
                        isDisabled={isCreateDisabled || creating}
                        isPending={creating}
                    >
                        Create
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default Details;
