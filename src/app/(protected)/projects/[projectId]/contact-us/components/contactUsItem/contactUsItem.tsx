import {
    BottomSheet,
    BottomSheetModal,
    Button,
    IconButton,
    ModalOverlay,
    typography,
    useSnackbarQueue,
} from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import { Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import type React from "react";
import { useContext, useState } from "react";
import { Cell, Heading, Row, Text } from "react-aria-components";
import { useBoolean } from "usehooks-ts";
import { UserContext } from "@/components/AuthContext/authContext";
import styles from "../../contact-us.module.css";
import type { IContactUsItem } from "../../page";

interface ContactUsItemProps {
    data: IContactUsItem;
    onDelete: (key: string) => void;
}

const ContactUsItem = ({ data, onDelete }: ContactUsItemProps) => {
    const snackbarQueue = useSnackbarQueue();
    const userWithRole = useContext(UserContext);
    const myUser = userWithRole ? userWithRole.user : null;

    const createdAt = new Date(data.createdAt);
    const formItems = Object.entries(data.data);
    const params = useParams<{ projectId: string }>();

    const {
        value: isDeleting,
        setTrue: startDeleting,
        setFalse: stopDeleting,
    } = useBoolean();

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async (close: () => void) => {
        setError(null);
        startDeleting();

        const url = `${process.env.NEXT_PUBLIC_API}/services/contact-us/${params.projectId}/${data.id}`;
        const token = await myUser?.getIdToken();
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
                onDelete(data.id);
                snackbarQueue.add({
                    supportingText: "Successfully deleted record.",
                });
                close();
            })
            .catch((err) => {
                setError(err.message);
            })
            .finally(() => stopDeleting());
    };

    return (
        <Row className={styles.tr}>
            {formItems.map((item) => {
                return (
                    <Cell
                        key={`${data.id + item[0]}item`}
                        className={styles.td}
                    >
                        {item[1] as React.ReactNode}
                    </Cell>
                );
            })}

            <Cell className={styles.td}>{createdAt.toDateString()}</Cell>

            <Cell className={styles.td}>
                <IconButton
                    icon={Trash2}
                    color="standard"
                    tooltip="Delete submission"
                    onPress={() => setIsDeleteOpen(true)}
                />

                <ModalOverlay
                    isOpen={isDeleteOpen}
                    onOpenChange={setIsDeleteOpen}
                    isKeyboardDismissDisabled={isDeleting}
                >
                    <BottomSheetModal layout="detached">
                        <BottomSheet className={styles.dialog}>
                            {({ close }) => (
                                <>
                                    <Heading
                                        className={clsx(typography.titleLarge)}
                                    >
                                        Confirm Record Deletion
                                    </Heading>

                                    <Text
                                        className={clsx(typography.bodyMedium)}
                                    >
                                        Are you sure you want to delete this
                                        record? This action cannot be undone.
                                    </Text>

                                    {error && (
                                        <p className={styles.error}>{error}</p>
                                    )}

                                    <div className={styles.actions}>
                                        <Button
                                            slot="close"
                                            color="text"
                                            isDisabled={isDeleting}
                                        >
                                            Cancel
                                        </Button>

                                        <Button
                                            isPending={isDeleting}
                                            onPress={() => handleDelete(close)}
                                            className={styles["delete-confirm"]}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </>
                            )}
                        </BottomSheet>
                    </BottomSheetModal>
                </ModalOverlay>
            </Cell>
        </Row>
    );
};

export default ContactUsItem;
