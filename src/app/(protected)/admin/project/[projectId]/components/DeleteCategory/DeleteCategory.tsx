import {
    BottomSheet,
    BottomSheetModal,
    Button,
    ModalOverlay,
    typography,
    useSnackbarQueue,
} from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import { useContext } from "react";
import { Heading, Text } from "react-aria-components";
import { useBoolean } from "usehooks-ts";
import { UserContext } from "@/components/AuthContext/authContext";
import { useCategoryActions } from "../Category";
import styles from "./deleteCategory.module.css";

export const DeleteCategory: React.FC<{
    categoryID: string;
    isOpen: boolean;
    onOpenChange: (val: boolean) => void;
}> = ({ categoryID, isOpen, onOpenChange }) => {
    const { user } = useContext(UserContext) ?? {};

    const { deleteCategory, projectId } = useCategoryActions();
    const {
        value: isDeleting,
        setTrue: startDeleting,
        setFalse: stopDeleting,
    } = useBoolean();

    const snackbarQueue = useSnackbarQueue();

    if (!user) {
        return null;
    }

    const deleteCategoryByID = async (close: () => void) => {
        startDeleting();

        const url = `${process.env.NEXT_PUBLIC_API}/project/${projectId}/category/${categoryID}`;
        const token = await user?.getIdToken();
        const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };

        fetch(url, {
            method: "DELETE",
            headers,
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.error) throw new Error(res.message);

                deleteCategory(categoryID);
                snackbarQueue.add(
                    {
                        supportingText: "Category deleted successfully.",
                    },
                    {
                        timeout: 5000,
                    }
                );
            })
            .catch((err) => {
                snackbarQueue.add({ supportingText: err.message });
            })
            .finally(() => {
                stopDeleting();
                close();
            });
    };

    return (
        <ModalOverlay
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            isKeyboardDismissDisabled={isOpen}
        >
            <BottomSheetModal layout="detached">
                <BottomSheet className={clsx(styles["dialog"])}>
                    {({ close }) => (
                        <>
                            <Heading
                                slot="title"
                                className={clsx(typography.titleLarge)}
                            >
                                Delete Category?
                            </Heading>

                            <Text className={clsx(typography.bodyMedium)}>
                                This action cannot be undone. This category will
                                be permanently deleted.
                            </Text>

                            <div className={clsx(styles["actions"])}>
                                <Button
                                    slot="close"
                                    color="text"
                                    isDisabled={isDeleting}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    isPending={isDeleting}
                                    onPress={() => deleteCategoryByID(close)}
                                    className={clsx(styles["delete-confirm"])}
                                >
                                    Delete
                                </Button>
                            </div>
                        </>
                    )}
                </BottomSheet>
            </BottomSheetModal>
        </ModalOverlay>
    );
};
