"use client";

import {
    LinkIconButton,
    SearchField,
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
    Size,
    useAsyncList,
    Virtualizer,
} from "react-aria-components";
import { size } from "zod";
import { UserContext } from "@/components/AuthContext/authContext";
import Loader from "@/components/Loader/Loader";
import { getNow } from "@/helpers/helpers";
import { Album } from "./components/Album";
import { AlbumContext } from "./context";
import styles from "./gallery.module.css";

export interface AlbumType {
    id: string;
    name: string;
    cover: string;
    createdAt: string;
}

const GalleryPage = () => {
    const userWithRole = useContext(UserContext);
    const user = useMemo(() => {
        return userWithRole ? userWithRole.user : null;
    }, [userWithRole]);

    const params = useParams<{ projectId: string }>();
    const [search, setSearch] = useState<string>("");

    const snackbarQueue = useSnackbarQueue();

    const albums = useAsyncList<AlbumType, string | null>({
        async load({ cursor, signal, items }) {
            if (!user) {
                return {
                    items: [],
                    cursor: null,
                };
            }

            const token = await user?.getIdToken();
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API}/services/gallery/${params.projectId}/albums?cursor=${
                    cursor ?? getNow()
                }`,
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

            const existingIds = new Set(items.map((a) => a.id));

            const nextItems = json.data.albums.filter(
                (album: AlbumType) => !existingIds.has(album.id)
            );

            return {
                items: nextItems,
                cursor: json.data.pageInfo.nextPage
                    ? json.data.pageInfo.cursor
                    : null,
            };
        },
    });

    const filteredAlbums = useMemo(() => {
        if (!search) return albums.items;

        const value = search.toLowerCase();

        return albums.items.filter(
            (album) =>
                album.id.toLowerCase().includes(value) ||
                album.name.toLowerCase().includes(value)
        );
    }, [albums.items, search]);

    useEffect(() => {
        if (!albums.error) return;

        snackbarQueue.add({
            supportingText: albums.error.message,
        });
    }, [albums.error, snackbarQueue]);

    /* biome-ignore lint: reload album on project change */
    useEffect(() => {
        albums.reload();
    }, [params.projectId]);

    const removeAlbum = (id: string) => {
        albums.remove(id);
    };

    const updateAlbumName = (id: string, name: string) => {
        albums.update(id, (prev) => {
            return { ...prev, name };
        });
    };

    const updateAlbumCover = (id: string, cover: string) => {
        albums.update(id, (prev) => {
            return { ...prev, cover };
        });
    };

    return (
        <div className={styles.gallery}>
            <div className={styles["header"]}>
                <SearchField
                    className={clsx(styles["search"])}
                    aria-label="Album Search"
                    value={search}
                    onChange={setSearch}
                    placeholder="Search album"
                    isReadOnly={albums.loadingState === "loading"}
                />

                <LinkIconButton
                    href={`/projects/${params.projectId}/gallery/create`}
                    size="medium"
                    icon={BadgePlus}
                    color="tonal"
                    width="wide"
                    tooltip="Create Album"
                    render={(props) => {
                        if ("href" in props) {
                            return <Link {...props} />;
                        }
                        return <span {...props} />;
                    }}
                />
            </div>

            <AlbumContext
                value={{
                    removeAlbum,
                    updateAlbumCover,
                    updateAlbumName,
                    projectID: params.projectId,
                }}
            >
                <Virtualizer
                    layout={GridLayout}
                    layoutOptions={{
                        minItemSize: new Size(250, 260),
                        maxItemSize: new Size(Infinity, 260),
                        preserveAspectRatio: true,
                        maxColumns: 4,
                    }}
                >
                    <GridList
                        layout="grid"
                        aria-label="Albums"
                        renderEmptyState={() => {
                            if (albums.loadingState === "loading") {
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
                                    <p>
                                        No album found matching{" "}
                                        <span className="italic">
                                            <q>{search}</q>
                                        </span>
                                    </p>
                                );
                            }

                            return <h3>No albums exist for this project</h3>;
                        }}
                    >
                        <Collection items={filteredAlbums}>
                            {(album) => <Album album={album} />}
                        </Collection>

                        {!search && (
                            <GridListLoadMoreItem
                                onLoadMore={albums.loadMore}
                                isLoading={
                                    albums.loadingState === "loadingMore"
                                }
                            >
                                <Loader size={16} />
                            </GridListLoadMoreItem>
                        )}
                    </GridList>
                </Virtualizer>
            </AlbumContext>
        </div>
    );
};

export default GalleryPage;
