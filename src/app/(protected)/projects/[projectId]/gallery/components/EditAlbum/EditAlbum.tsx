import {
    Button,
    Input,
    ModalOverlay,
    SideSheet,
    SideSheetModal,
    TextArea,
    typography,
    useSnackbarQueue,
    validateAndGetFormValues,
} from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import { useContext, useId, useState } from "react";
import { Form } from "react-aria-components";
import { useBoolean } from "usehooks-ts";
import z from "zod";
import { UserContext } from "@/components/AuthContext/authContext";
import type { ValidationErrors } from "@/helpers/validation";
import { useAlbumActions } from "../../context";
import styles from "./editAlbum.module.css";

const EditAlbumSchema = z.object({
    name: z.string(),
});

export const EditAlbum: React.FC<{
    id: string;
    currentName: string;
    isOpen: boolean;
    onOpenChange: (val: boolean) => void;
}> = ({ id, currentName, isOpen, onOpenChange }) => {
    const formID = useId();

    const userWithRole = useContext(UserContext);
    const currentUser = userWithRole ? userWithRole.user : null;

    const { updateAlbumName, projectID } = useAlbumActions();
    const snackbarQueue = useSnackbarQueue();

    const [fieldErr, setFieldErr] = useState<ValidationErrors | undefined>(
        undefined
    );
    const [formErr, setFormErr] = useState<string | null>(null);

    const {
        value: isUpdating,
        setTrue: startUpdating,
        setFalse: stopUpdating,
    } = useBoolean();

    const editAlbum = async (
        e: React.FormEvent<HTMLFormElement>,
        close: () => void
    ) => {
        e.preventDefault();

        const result = validateAndGetFormValues(
            e.currentTarget,
            EditAlbumSchema
        );
        if (!result.success) {
            setFieldErr(result.errors);
            return;
        }

        const { name } = result.data;
        setFormErr(null);
        setFieldErr(undefined);

        startUpdating();
        const url = `${process.env.NEXT_PUBLIC_API}/services/gallery/${projectID}/albums/${id}/metadata`;
        const token = await currentUser?.getIdToken();
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };
        const body = JSON.stringify({
            name,
        });

        fetch(url, { method: "PATCH", headers, body })
            .then((res) => res.json())
            .then((res) => {
                if (res.error) throw new Error(res.message);

                updateAlbumName(id, name);
                snackbarQueue.add({ supportingText: "Updated album details." });
                close();
            })
            .catch((err) => {
                setFormErr(err.message);
            })
            .finally(() => {
                stopUpdating();
            });
    };

    return (
        <ModalOverlay
            isKeyboardDismissDisabled={isUpdating}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
        >
            <SideSheetModal layout="detached">
                <SideSheet
                    headline={`Edit Album Name`}
                    actions={[
                        <Button
                            type="submit"
                            key="Save"
                            form={formID}
                            isPending={isUpdating}
                        >
                            Save
                        </Button>,
                        <Button
                            key="cancel"
                            color="outlined"
                            slot="close"
                            isDisabled={isUpdating}
                        >
                            Cancel
                        </Button>,
                    ]}
                >
                    {({ close }) => (
                        <Form
                            onSubmit={(e) => editAlbum(e, close)}
                            className={clsx(styles["form"])}
                            validationErrors={fieldErr}
                            id={formID}
                        >
                            <TextArea
                                name="name"
                                defaultValue={currentName}
                                placeholder="Name"
                                label="Name"
                                isRequired
                                isReadOnly={isUpdating}
                                rows={5}
                            />

                            {formErr && (
                                <p
                                    className={clsx(
                                        "error-message",
                                        typography.bodySmall
                                    )}
                                >
                                    {formErr}
                                </p>
                            )}
                        </Form>
                    )}
                </SideSheet>
            </SideSheetModal>
        </ModalOverlay>
    );
};
