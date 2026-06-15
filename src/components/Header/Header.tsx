import {
    AppBar,
    AppBarAction,
    AppBarAvatar,
    AppBarHeadline,
    Divider,
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
import { usePathname } from "next/navigation";
import { type ReactElement, useContext, useEffect, useState } from "react";
import { DialogTrigger } from "react-aria-components";
import { useMediaQuery } from "usehooks-ts";
import type { ProjectType } from "@/app/(protected)/admin/projects/(projects)/components/Project/types";
import { signoutUser } from "@/firebase/auth/auth";
import { useNavigationDocked } from "@/hooks/useNavigationDocked";
import { UserContext } from "../AuthContext/authContext";
import { Nav } from "../Nav";
import { ThemeSelectorModal } from "../ThemeSelectorModal";
import styles from "./header.module.css";

export const Header = ({ projects }: { projects?: ProjectType[] }) => {
    const handleSignout = async () => {
        await signoutUser();
    };

    const [isUserProject, setIsUserProject] = useState(false);
    const isNavigationDocked = useNavigationDocked();
    const smallViewport = useMediaQuery("(max-width: 22rem)");
    const user = useContext(UserContext);

    const pathName = usePathname();
    const [navModalOpen, setNavModalOpen] = useState(false);

    useEffect(() => {
        setNavModalOpen(false);

        if (pathName.startsWith("/projects/")) {
            setIsUserProject(true);
        } else setIsUserProject(false);
    }, [pathName]);

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
                        <Menu layout="standard" color="vibrant">
                            <MenuSection>
                                {user.user.displayName && (
                                    <MenuSectionHeader>
                                        {user.user.displayName}
                                    </MenuSectionHeader>
                                )}

                                <MenuItem
                                    href="/edit-profile"
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
                            <Divider />
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
            data-user-project={isUserProject || undefined}
            className={clsx(styles["header"])}
            leadingAction={
                isNavigationDocked ? undefined : (
                    <DialogTrigger
                        isOpen={navModalOpen}
                        onOpenChange={setNavModalOpen}
                    >
                        <AppBarAction icon={MenuIcon} />

                        <ModalOverlay isDismissable>
                            <SideSheetModal alignment="start">
                                <SideSheetDialog>
                                    <Nav projects={projects} />
                                </SideSheetDialog>
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
                        ADGYTEC DASHBOARD
                    </Link>
                </AppBarHeadline>
            }
        />
    );
};
