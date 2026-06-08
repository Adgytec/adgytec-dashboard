import {
    IconButton,
    Menu,
    MenuItem,
    MenuPopover,
    MenuTrigger,
    typography,
} from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import { EllipsisVertical } from "lucide-react";
import { useState } from "react";
import { GridListItem, Text } from "react-aria-components";
import { DeleteUser } from "../DeleteUser";
import { EditUser } from "../EditUser";
import type { UserType } from "./types";
import styles from "./user.module.css";

export const User: React.FC<{ user: UserType }> = ({ user }) => {
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    return (
        <GridListItem className={clsx(styles["user"])}>
            <div className={clsx(styles["leading"])}>
                <Text className={clsx(styles["name"], typography.bodyLarge)}>
                    {user.name}
                </Text>

                <Text className={clsx(styles["info"], typography.bodyMedium)}>
                    <span>{user.email}</span>
                    <span className={clsx(typography.bodyMediumEmphasized)}>
                        {`[${user.role}]`}
                    </span>
                </Text>
            </div>

            <div className={clsx(styles["trailing"])}>
                <MenuTrigger>
                    <IconButton
                        color="standard"
                        icon={EllipsisVertical}
                        tooltip="Manage user"
                    />

                    <MenuPopover>
                        <Menu>
                            <MenuItem
                                onAction={() => setEditOpen(true)}
                                label="Edit"
                            />

                            <MenuItem
                                onAction={() => setDeleteOpen(true)}
                                label="Delete"
                            />
                        </Menu>
                    </MenuPopover>
                </MenuTrigger>
            </div>

            <EditUser
                isOpen={editOpen}
                onOpenChange={setEditOpen}
                user={user}
            />

            <DeleteUser
                isOpen={deleteOpen}
                onOpenChange={setDeleteOpen}
                userID={user.userId}
            />
        </GridListItem>
    );
};
