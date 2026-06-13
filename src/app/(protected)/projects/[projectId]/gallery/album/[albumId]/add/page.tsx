"use client";

import {
    Button,
    Checkbox,
    IconButton,
    Toolbar,
    useSnackbarQueue,
} from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import { BadgePlus, ImageUp, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useContext } from "react";
import {
    FileTrigger,
    GridList,
    GridListItem,
    useListData,
    Virtualizer,
    WaterfallLayout,
} from "react-aria-components";
import { useBoolean } from "usehooks-ts";
import { v7 as uuidv7 } from "uuid";
import { UserContext } from "@/components/AuthContext/authContext";
import styles from "./add.module.css";

type AddPictureType = {
    id: string;
    file: File;
    url: string;
};

const Add = () => {
    const userWithRole = useContext(UserContext);
    const user = userWithRole ? userWithRole.user : null;

    const pictures = useListData<AddPictureType>({
        initialItems: [],
    });

    const {
        value: isUploading,
        setTrue: startUploading,
        setFalse: stopUploading,
    } = useBoolean();

    const params = useParams<{
        projectId: string;
        albumId: string;
    }>();
    const snackbarQueue = useSnackbarQueue();

    async function uploadPicture(
        picture: AddPictureType,
        token: string
    ): Promise<void> {
        const uploadURL = `${process.env.NEXT_PUBLIC_API}/services/gallery/${params.projectId}/album/${params.albumId}`;

        const formData = new FormData();
        formData.append("photo", picture.file);

        const res = await fetch(uploadURL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        const data = await res.json();

        if (!res.ok || data.error) {
            throw new Error(data.message ?? "Failed to upload image.");
        }

        URL.revokeObjectURL(picture.url);
        pictures.remove(picture.id);
    }

    async function* generateTasks(
        pictures: AddPictureType[],
        token: string
    ): AsyncGenerator<() => Promise<void>> {
        for (const picture of pictures) {
            yield async () => {
                await uploadPicture(picture, token);
            };
        }
    }
    async function runUploads(
        generator: AsyncGenerator<() => Promise<void>>,
        concurrent = 4
    ): Promise<number> {
        const running = new Set<Promise<void>>();
        let failedTasks = 0;

        for await (const task of generator) {
            const p = task()
                .catch(() => {
                    failedTasks++;
                })
                .finally(() => {
                    running.delete(p);
                });

            running.add(p);

            if (running.size >= concurrent) {
                await Promise.race(running);
            }
        }

        await Promise.all(running);
        return failedTasks;
    }
    const uploadAddedImages = async () => {
        if (pictures.items.length === 0) {
            snackbarQueue.add({
                supportingText: "No images added to upload.",
            });
            return;
        }

        startUploading();

        try {
            const token = await user?.getIdToken();

            if (!token) {
                snackbarQueue.add({
                    supportingText: "Try refreshing this page.",
                });
                return;
            }

            const failedTasks = await runUploads(
                generateTasks([...pictures.items], token),
                4
            );

            if (failedTasks === 0) {
                snackbarQueue.add(
                    {
                        supportingText: "Uploads completed.",
                    },
                    { timeout: 5000 }
                );
            } else {
                snackbarQueue.add({
                    supportingText: "Some images failed to upload.",
                });
            }
        } finally {
            stopUploading();
        }
    };

    const addFiles = (files: FileList | null) => {
        if (isUploading || !files) return;
        if (files.length === 0) return;

        for (const image of files) {
            const id = uuidv7();
            const url = URL.createObjectURL(image);

            pictures.append({ id, url, file: image });
        }
    };

    const selectedCount =
        pictures.selectedKeys === "all"
            ? pictures.items.length
            : pictures.selectedKeys.size;

    const allSelected =
        pictures.items.length > 0 && selectedCount === pictures.items.length;
    const isIndeterminate = selectedCount > 0 && !allSelected;

    return (
        <div className={clsx(styles["add"])}>
            <Virtualizer
                layout={WaterfallLayout}
                layoutOptions={{ maxColumns: 4 }}
            >
                <GridList
                    className={clsx(styles["image-container"])}
                    layout="grid"
                    aria-label="Pictures"
                    selectionMode="multiple"
                    selectedKeys={pictures.selectedKeys}
                    onSelectionChange={(keys) => {
                        if (isUploading) return;

                        pictures.setSelectedKeys(keys);
                    }}
                    renderEmptyState={() => {
                        return <div>No picture added</div>;
                    }}
                    items={pictures.items}
                >
                    {(picture) => (
                        <GridListItem
                            id={picture.id}
                            className={clsx(styles["image"])}
                        >
                            <Checkbox
                                slot="selection"
                                className={clsx(styles["selection"])}
                            />
                            <img
                                alt=""
                                src={picture.url}
                                width={200}
                                height={200}
                            />
                        </GridListItem>
                    )}
                </GridList>
            </Virtualizer>

            <Toolbar
                className={clsx(styles["toolbar"])}
                variant="floating"
                color="vibrant"
            >
                <div className={clsx(styles["selection-info"])}>
                    <Checkbox
                        isDisabled={isUploading}
                        containerStateLayer
                        isSelected={allSelected}
                        isIndeterminate={isIndeterminate}
                        onChange={(selected) => {
                            pictures.setSelectedKeys(
                                selected ? "all" : new Set()
                            );
                        }}
                    >
                        {`${selectedCount} / ${pictures.items.length}`}
                    </Checkbox>
                </div>

                <FileTrigger
                    allowsMultiple
                    acceptedFileTypes={["image/*"]}
                    onSelect={addFiles}
                >
                    <Button
                        isDisabled={isUploading}
                        color="text"
                        icon={BadgePlus}
                        tooltip="Add images"
                    />
                </FileTrigger>

                <IconButton
                    width="wide"
                    icon={ImageUp}
                    tooltip="Upload images"
                    onPress={uploadAddedImages}
                    isPending={isUploading}
                />

                <Button
                    isDisabled={isUploading}
                    color="text"
                    icon={Trash2}
                    onPress={() => {
                        pictures.removeSelectedItems();
                        if (pictures.selectedKeys === "all") {
                            for (const picture of pictures.items) {
                                URL.revokeObjectURL(picture.url);
                            }
                        } else {
                            for (const key of pictures.selectedKeys) {
                                const picture = pictures.getItem(key);

                                if (picture) {
                                    URL.revokeObjectURL(picture.url);
                                }
                            }
                        }
                    }}
                    tooltip="Remove selected items"
                />
            </Toolbar>
        </div>
    );
};

export default Add;
