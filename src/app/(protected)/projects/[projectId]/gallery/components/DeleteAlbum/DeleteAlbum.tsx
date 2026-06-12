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
import { useAlbumActions } from "../../context";
import styles from "./deleteAlbum.module.css";

export const DeleteAlbum: React.FC<{
    id: string;
    isOpen: boolean;
    onOpenChange: (val: boolean) => void;
}> = ({ id, isOpen, onOpenChange }) => {
    const userWithRole = useContext(UserContext);
    const currentUser = userWithRole ? userWithRole.user : null;

    const { removeAlbum, projectID } = useAlbumActions();
    const snackbarQueue = useSnackbarQueue();

    const {
        value: isDeleting,
        setTrue: startDeleting,
        setFalse: stopDeleting,
    } = useBoolean();

    const deleteAlbum = async (close: () => void) => {
        startDeleting();

        const url = `${process.env.NEXT_PUBLIC_API}/services/gallery/${projectID}/albums/${id}`;
        const token = await currentUser?.getIdToken();
        const headers = {
            Authorization: `Bearer ${token}`,
        };

        fetch(url, {
            method: "DELETE",
            headers,
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.error) throw new Error(res.message);

                removeAlbum(id);
                snackbarQueue.add(
                    {
                        supportingText: "Album deleted successfully.",
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
            isKeyboardDismissDisabled={isDeleting}
        >
            <BottomSheetModal layout="detached">
                <BottomSheet className={clsx(styles["dialog"])}>
                    {({ close }) => (
                        <>
                            <Heading className={clsx(typography.titleLarge)}>
                                Delete Album?
                            </Heading>

                            <Text className={clsx(typography.bodyMedium)}>
                                This action cannot be undone. This album will be
                                permanently deleted.
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
                                    onPress={() => deleteAlbum(close)}
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
