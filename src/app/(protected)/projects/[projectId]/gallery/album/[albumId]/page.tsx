"use client";

import {
    Button,
    Checkbox,
    LinkIconButton,
    Toolbar,
    typography,
    useSnackbarQueue,
} from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import { BadgePlus, OctagonX, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useContext, useEffect, useMemo, useRef } from "react";
import {
    Collection,
    GridList,
    GridListItem,
    GridListLoadMoreItem,
    Heading,
    Text,
    useAsyncList,
    Virtualizer,
    WaterfallLayout,
} from "react-aria-components";
import { Transition } from "react-transition-group";
import { useBoolean } from "usehooks-ts";
import { UserContext } from "@/components/AuthContext/authContext";
import Loader from "@/components/Loader/Loader";
import { getNow } from "@/helpers/helpers";
import styles from "./album.module.css";

export interface PictureType {
    id: string;
    image: string;
    createdAt: string;
}

// const LIMIT = 20;
// const UPLOAD_LIMIT = 5;
const SELECT_LIMIT = 50;

const AlbumPage = () => {
    const toolbarRef = useRef<HTMLDivElement>(null);

    const userWithRole = useContext(UserContext);
    const user = useMemo(() => {
        return userWithRole ? userWithRole.user : null;
    }, [userWithRole]);

    const {
        value: isDeleting,
        setTrue: startDeleting,
        setFalse: stopDeleting,
    } = useBoolean();

    const params = useParams<{
        projectId: string;
        albumId: string;
    }>();
    const albumName = useSearchParams().get("name");

    const snackbarQueue = useSnackbarQueue();

    const pictures = useAsyncList<PictureType, string | null>({
        async load({ cursor, signal, items }) {
            if (!user) {
                return {
                    items: [],
                    cursor: null,
                };
            }

            const token = await user.getIdToken();

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API}/services/gallery/${
                    params.projectId
                }/album/${params.albumId}?cursor=${cursor ?? getNow()}`,
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

            const existingIds = new Set(items.map((p) => p.id));

            const nextItems = json.data.photos.filter(
                (photo: PictureType) => !existingIds.has(photo.id)
            );

            return {
                items: nextItems,
                cursor: json.data.pageInfo.nextPage
                    ? json.data.pageInfo.cursor
                    : null,
            };
        },
    });

    useEffect(() => {
        if (!pictures.error) return;

        snackbarQueue.add({
            supportingText: pictures.error.message,
        });
    }, [pictures.error, snackbarQueue]);

    /* biome-ignore lint: reload pictures on project and album change */
    useEffect(() => {
        pictures.reload();
    }, [params.projectId, params.albumId]);

    const deleteSelectedImages = async () => {
        if (
            pictures.selectedKeys !== "all" &&
            pictures.selectedKeys.size === 0
        ) {
            snackbarQueue.add({ supportingText: "No image selected" });
            return;
        }

        let selectedIDs: string[];
        if (pictures.selectedKeys === "all") {
            selectedIDs = pictures.items.map((image) => image.id);
        } else {
            selectedIDs = Array.from(pictures.selectedKeys, (key) =>
                String(key)
            );
        }

        startDeleting();
        const url = `${process.env.NEXT_PUBLIC_API}/services/gallery/${params.projectId}/album/${params.albumId}`;
        const token = await user?.getIdToken();
        const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
        const body = JSON.stringify({
            id: selectedIDs,
        });

        fetch(url, {
            method: "DELETE",
            headers,
            body,
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.error) throw new Error(res.message);

                snackbarQueue.add(
                    { supportingText: "Successfully deleted selected images." },
                    { timeout: 5000 }
                );
                pictures.removeSelectedItems();
            })
            .catch((err) => {
                snackbarQueue.add({ supportingText: err.message });
            })
            .finally(stopDeleting);
    };

    const hasSelection =
        pictures.selectedKeys === "all" || pictures.selectedKeys.size > 0;

    return (
        <div className={clsx(styles["container"])}>
            <div className={clsx(styles["header"])}>
                <Heading className={clsx(typography.titleLarge)}>
                    {albumName}
                </Heading>

                <LinkIconButton
                    href={`${params.albumId}/add`}
                    icon={BadgePlus}
                    tooltip="Add Images"
                    color="tonal"
                    render={(props) => {
                        if ("href" in props) {
                            return <Link {...props} />;
                        }
                        return <span {...props} />;
                    }}
                />
            </div>

            <Transition
                nodeRef={toolbarRef}
                in={hasSelection}
                timeout={{
                    enter: 0,
                    exit: 150,
                }}
                mountOnEnter
                unmountOnExit
            >
                {(status) => {
                    return (
                        <Toolbar
                            ref={toolbarRef}
                            variant="floating"
                            className={clsx(styles["toolbar"])}
                            data-status={status}
                        >
                            <Button
                                color="text"
                                icon={OctagonX}
                                tooltip="Clear selection"
                                onPress={() =>
                                    pictures.removeKeysFromSelection("all")
                                }
                                isDisabled={isDeleting}
                            >
                                Clear
                            </Button>

                            <Button
                                color="text"
                                icon={Trash2}
                                tooltip="Delete Selected"
                                isPending={isDeleting}
                                onPress={deleteSelectedImages}
                            >
                                Delete
                            </Button>

                            <Text
                                className={clsx(
                                    styles["selection-count"],
                                    typography.labelLarge
                                )}
                            >
                                {pictures.selectedKeys === "all"
                                    ? "All"
                                    : pictures.selectedKeys.size}{" "}
                                selected
                            </Text>
                        </Toolbar>
                    );
                }}
            </Transition>

            <Virtualizer
                layout={WaterfallLayout}
                layoutOptions={{ maxColumns: 4 }}
            >
                <GridList
                    selectionMode="multiple"
                    selectedKeys={pictures.selectedKeys}
                    onSelectionChange={(keys) => {
                        if (isDeleting) return;

                        if (keys === "all") {
                            return;
                        }

                        const prevSize =
                            pictures.selectedKeys === "all"
                                ? Infinity
                                : pictures.selectedKeys.size;

                        const nextSize = keys.size;

                        const isAdding = nextSize > prevSize;

                        if (isAdding && nextSize > SELECT_LIMIT) {
                            snackbarQueue.add({
                                supportingText: `You can select at most ${SELECT_LIMIT} pictures.`,
                            });

                            return;
                        }

                        pictures.setSelectedKeys(keys);
                    }}
                    className={clsx(styles["image-container"])}
                    layout="grid"
                    aria-label="Pictures"
                    renderEmptyState={() => {
                        if (pictures.loadingState === "loading") {
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

                        return (
                            <Heading className={clsx(typography.titleMedium)}>
                                No pictures added.
                            </Heading>
                        );
                    }}
                >
                    <Collection items={pictures.items}>
                        {(picture) => (
                            <GridListItem
                                id={picture.id}
                                className={clsx(styles["image"])}
                                isDisabled={isDeleting}
                                onAction={() => {
                                    window.open(picture.image, "_blank");
                                }}
                            >
                                <Checkbox
                                    slot="selection"
                                    className={clsx(styles["selection"])}
                                />
                                <img
                                    alt=""
                                    src={picture.image}
                                    width={200}
                                    height={200}
                                />
                            </GridListItem>
                        )}
                    </Collection>

                    <GridListLoadMoreItem
                        onLoadMore={pictures.loadMore}
                        isLoading={pictures.loadingState === "loadingMore"}
                    >
                        <Loader size={16} />
                    </GridListLoadMoreItem>
                </GridList>
            </Virtualizer>
        </div>
    );
};

export default AlbumPage;
