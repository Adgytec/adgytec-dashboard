import {
    AppBar,
    AppBarAction,
    AppBarAvatar,
    AppBarHeadline,
    ModalOverlay,
    SideSheetDialog,
    SideSheetModal,
} from "@adgytec/adgytec-web-ui-components";
import { Menu, Palette } from "lucide-react";
import { DialogTrigger } from "react-aria-components";
import { ThemeSelectorModal } from "../ThemeSelectorModal";

export const Header: React.FC<{ isNavigationDocked: boolean }> = ({
    isNavigationDocked,
}) => {
    return (
        <AppBar
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
            trailingActions={[
                <ThemeSelectorModal key="theme">
                    <AppBarAction icon={Palette} />
                </ThemeSelectorModal>,

                <AppBarAvatar key="avatar">R</AppBarAvatar>,
            ]}
            size={isNavigationDocked ? "small" : "medium"}
            alignment={isNavigationDocked ? "default" : "centered"}
            headline={<AppBarHeadline>Adgytec</AppBarHeadline>}
        />
    );
};
