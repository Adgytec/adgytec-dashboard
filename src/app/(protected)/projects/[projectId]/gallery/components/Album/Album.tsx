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
import { EllipsisVertical, FilePenLine, Image, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GridListItem, Text } from "react-aria-components";
import type { AlbumType } from "../../page";
import { DeleteAlbum } from "../DeleteAlbum";
import { EditAlbum } from "../EditAlbum/EditAlbum";
import { UpdateAlbumCover } from "../UpdateAlbumCover";
import styles from "./album.module.css";

export const Album: React.FC<{
    album: AlbumType;
}> = ({ album }) => {
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [updateCoverOpen, setUpdateCoverOpen] = useState(false);

    const { splashInfo, handlePress } = useSplash();
    const router = useRouter();

    return (
        <GridListItem
            className={clsx(styles["album"])}
            onPress={handlePress}
            onAction={() => {
                router.push(`gallery/album/${album.id}?name=${album.name}`);
            }}
        >
            {splashInfo && <Splash {...splashInfo} />}

            <div className={clsx(styles["cover"])}>
                <img
                    src={album.cover}
                    width={300}
                    height={204}
                    alt={album.name}
                />
            </div>

            <div className={clsx(styles["title"])}>
                <Text
                    slot="description"
                    className={clsx(
                        styles["name"],
                        typography.labelLargeEmphasized
                    )}
                    title={album.name}
                >
                    {album.name}
                </Text>

                <MenuTrigger>
                    <IconButton
                        color="standard"
                        icon={EllipsisVertical}
                        tooltip="Manage album"
                    />

                    <MenuPopover>
                        <Menu>
                            <MenuItem
                                leadingIcon={FilePenLine}
                                onAction={() => setEditOpen(true)}
                                label="Edit"
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

            <UpdateAlbumCover
                id={album.id}
                currentCover={album.cover}
                isOpen={updateCoverOpen}
                onOpenChange={setUpdateCoverOpen}
            />

            <EditAlbum
                id={album.id}
                currentName={album.name}
                isOpen={editOpen}
                onOpenChange={setEditOpen}
            />

            <DeleteAlbum
                id={album.id}
                isOpen={deleteOpen}
                onOpenChange={setDeleteOpen}
            />
        </GridListItem>
    );
};
