import {
    Button,
    Icon,
    IconButton,
    ModalOverlay,
    SideSheet,
    SideSheetModal,
    typography,
} from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import { Dot, EllipsisVertical } from "lucide-react";
import { DialogTrigger, GridListItem, Text } from "react-aria-components";
import type { UserType } from "./types";
import styles from "./user.module.css";

export const User: React.FC<{ user: UserType }> = ({ user }) => {
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
                <DialogTrigger>
                    <IconButton
                        color="standard"
                        icon={EllipsisVertical}
                        tooltip="Manage user"
                    />

                    <ModalOverlay>
                        <SideSheetModal layout="detached">
                            <SideSheet
                                headline={user.name}
                                actions={[
                                    <Button key="Save">Save</Button>,
                                    <Button
                                        key="cancel"
                                        color="outlined"
                                        slot="close"
                                    >
                                        Cancel
                                    </Button>,
                                ]}
                            ></SideSheet>
                        </SideSheetModal>
                    </ModalOverlay>
                </DialogTrigger>
            </div>
        </GridListItem>
    );
};
