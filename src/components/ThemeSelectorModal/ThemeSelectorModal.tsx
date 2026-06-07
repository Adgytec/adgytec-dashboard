import {
    ModalOverlay,
    SideSheet,
    SideSheetModal,
    ThemeSelector,
} from "@adgytec/adgytec-web-ui-components";
import type { ReactNode } from "react";
import { DialogTrigger } from "react-aria-components";

export const ThemeSelectorModal: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    return (
        <DialogTrigger>
            {children}

            <ModalOverlay isDismissable>
                <SideSheetModal layout="detached">
                    <SideSheet headline="Select Theme">
                        <ThemeSelector />
                    </SideSheet>
                </SideSheetModal>
            </ModalOverlay>
        </DialogTrigger>
    );
};
