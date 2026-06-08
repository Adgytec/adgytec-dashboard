import {
    BottomSheet,
    BottomSheetModal,
    Button,
    ModalOverlay,
    typography,
} from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import { Heading, Text } from "react-aria-components";
import { useUserAction } from "../Users";
import styles from "./deleteUser.module.css";

export const DeleteUser: React.FC<{
    userID: string;
    isOpen: boolean;
    onOpenChange: (val: boolean) => void;
}> = ({ userID, isOpen, onOpenChange }) => {
    const { onDeleteSuccess } = useUserAction();

    return (
        <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange}>
            <BottomSheetModal layout="detached">
                <BottomSheet className={clsx(styles["dialog"])}>
                    <Heading className={clsx(typography.titleLarge)}>
                        Delete User?
                    </Heading>

                    <Text className={clsx(typography.bodyMedium)}>
                        This action cannot be undone. The user account will be
                        permanently deleted.
                    </Text>

                    <div className={clsx(styles["actions"])}>
                        <Button slot="close" color="text">
                            Cancel
                        </Button>

                        <Button className={clsx(styles["delete-confirm"])}>
                            Delete
                        </Button>
                    </div>
                </BottomSheet>
            </BottomSheetModal>
        </ModalOverlay>
    );
};
