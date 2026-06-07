import {
    AppBar,
    AppBarAction,
    AppBarAvatar,
    AppBarHeadline,
    Menu,
    MenuItem,
    MenuPopover,
    MenuSection,
    MenuSectionHeader,
    MenuTrigger,
    ModalOverlay,
    SideSheetDialog,
    SideSheetModal,
    Tooltip,
    TooltipTrigger,
} from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import { Menu as MenuIcon, Palette } from "lucide-react";
import Link from "next/link";
import { type ReactElement, useContext } from "react";
import { DialogTrigger } from "react-aria-components";
import { useMediaQuery } from "usehooks-ts";
import { signoutUser } from "@/firebase/auth/auth";
import { useNavigationDocked } from "@/hooks/useNavigationDocked";
import { UserContext } from "../AuthContext/authContext";
import { ThemeSelectorModal } from "../ThemeSelectorModal";
import styles from "./header.module.css";

export const Header = () => {
    const handleSignout = async () => {
        await signoutUser();
    };

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
                <MenuTrigger>
                    <AppBarAvatar>
                        {user.user.displayName?.[0]?.toUpperCase()}
                    </AppBarAvatar>

                    <MenuPopover offset={-4}>
                        <Menu layout="grouped" color="vibrant">
                            <MenuSection>
                                {user.user.displayName && (
                                    <MenuSectionHeader>
                                        {user.user.displayName}
                                    </MenuSectionHeader>
                                )}

                                <MenuItem
                                    href="/profile"
                                    label="Edit Profile"
                                    render={({ className, ...props }) => {
                                        if ("href" in props) {
                                            return (
                                                <Link
                                                    className={clsx(
                                                        styles["link"],
                                                        className
                                                    )}
                                                    {...props}
                                                />
                                            );
                                        }

                                        return (
                                            <div
                                                className={clsx(className)}
                                                {...props}
                                            />
                                        );
                                    }}
                                />
                            </MenuSection>

                            <MenuSection>
                                <MenuItem
                                    onPress={handleSignout}
                                    label="Sign out"
                                />
                            </MenuSection>
                        </Menu>
                    </MenuPopover>
                </MenuTrigger>

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
                        <AppBarAction icon={MenuIcon} />

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
            headline={
                <AppBarHeadline>
                    <Link className={clsx(styles["link"])} href="/">
                        Adgytec
                    </Link>
                </AppBarHeadline>
            }
        />
    );
};
