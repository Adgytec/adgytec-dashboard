import {
    AppBar,
    AppBarAction,
    AppBarAvatar,
    AppBarHeadline,
    ModalOverlay,
    Popover,
    SideSheetDialog,
    SideSheetModal,
    Tooltip,
    TooltipTrigger,
} from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import { Menu, Palette } from "lucide-react";
import { type ReactElement, useContext } from "react";
import { DialogTrigger } from "react-aria-components";
import { useMediaQuery } from "usehooks-ts";
import { useNavigationDocked } from "@/hooks/useNavigationDocked";
import { UserContext } from "../AuthContext/authContext";
import { ThemeSelectorModal } from "../ThemeSelectorModal";
import styles from "./header.module.css";

export const Header = () => {
    const isNavigationDocked = useNavigationDocked();
    const smallViewport = useMediaQuery("(max-width: 22rem)");
    const user = useContext(UserContext);

    const trailingActions: ReactElement[] = [
        <ThemeSelectorModal key="theme">
            <TooltipTrigger>
                <AppBarAction icon={Palette} />

                <Tooltip placement="bottom">Theme Options</Tooltip>
            </TooltipTrigger>
        </ThemeSelectorModal>,
    ];
    if (user) {
        trailingActions.push(
            <TooltipTrigger key="avatar">
                <DialogTrigger>
                    <AppBarAvatar>
                        {user?.user.displayName?.[0]?.toUpperCase()}
                    </AppBarAvatar>

                    <Popover>{user.user.uid}</Popover>
                </DialogTrigger>

                <Tooltip placement="bottom">{user.user.displayName}</Tooltip>
            </TooltipTrigger>
        );
    }

    const isAppBarMedium = smallViewport;
    return (
        <AppBar
            data-docked-navigation={isNavigationDocked || undefined}
            className={clsx(styles["header"])}
            leadingAction={
                isNavigationDocked ? undefined : (
                    <DialogTrigger>
                        <AppBarAction icon={Menu} />

                        <ModalOverlay isDismissable>
                            <SideSheetModal alignment="start">
                                <SideSheetDialog>nav render</SideSheetDialog>
                            </SideSheetModal>
                        </ModalOverlay>
                    </DialogTrigger>
                )
            }
            trailingActions={trailingActions}
            size={isAppBarMedium ? "medium" : "small"}
            alignment={isNavigationDocked ? "default" : "centered"}
            headline={<AppBarHeadline>Adgytec</AppBarHeadline>}
        />
    );
};
