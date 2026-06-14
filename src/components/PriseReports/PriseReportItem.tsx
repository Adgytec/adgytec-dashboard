import {
    BottomSheet,
    BottomSheetModal,
    Button,
    IconButton,
    Input,
    Menu,
    MenuItem,
    MenuPopover,
    MenuTrigger,
    ModalOverlay,
    SideSheet,
    SideSheetModal,
    typography,
    useSnackbarQueue,
    validateAndGetFormValues,
} from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import { Edit, EllipsisVertical, Trash2 } from "lucide-react";
import { type FormEvent, useContext, useId, useMemo, useState } from "react";
import { Cell, Form, Heading, Row, Text } from "react-aria-components";
import { useBoolean } from "usehooks-ts";
import z from "zod";
import type { ValidationErrors } from "@/helpers/validation";
import { UserContext } from "../AuthContext/authContext";
import styles from "./prise-reports.module.css";
import type { PriseReportItemCompProps } from "./types";

const EditReportSchema = z.object({
    region: z.string().optional(),
    Territoire: z.string().optional(),
    "Site d'intervention": z.string().optional(),
    Infrastructures: z.string().optional(),
    Latitude: z.string().min(1, "Latitude is required"),
    Longitude: z.string().min(1, "Longitude is required"),
});

const PriseReportItemComp = ({
    item,
    projectId,
    ind,
    setReports,
}: PriseReportItemCompProps) => {
    const snackbarQueue = useSnackbarQueue();
    const editFormId = useId();

    const userWithRole = useContext(UserContext);
    const user = useMemo(() => {
        return userWithRole ? userWithRole.user : null;
    }, [userWithRole]);

    const {
        value: isDeleting,
        setTrue: startDeleting,
        setFalse: stopDeleting,
    } = useBoolean();

    const {
        value: isUpdating,
        setTrue: startUpdating,
        setFalse: stopUpdating,
    } = useBoolean();

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErr, setFieldErr] = useState<ValidationErrors | undefined>(
        undefined
    );

    const handleEdit = async (
        e: FormEvent<HTMLFormElement>,
        close: () => void
    ) => {
        e.preventDefault();

        const result = validateAndGetFormValues(
            e.currentTarget,
            EditReportSchema
        );
        if (!result.success) {
            setFieldErr(result.errors);
            return;
        }

        setError(null);
        setFieldErr(undefined);
        startUpdating();

        const body = JSON.stringify(result.data);

        const url = `${process.env.NEXT_PUBLIC_API}/services/prise-reports/${projectId}/${item.id}`;
        const token = await user?.getIdToken();
        const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };

        fetch(url, {
            method: "PATCH",
            headers,
            body,
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.error) throw new Error(res.message);
                setReports((prev) =>
                    prev.map((report) =>
                        report.id === item.id
                            ? {
                                  ...report,
                                  ...result.data,
                              }
                            : report
                    )
                );

                close();
                snackbarQueue.add({
                    supportingText: "Successfully updated record.",
                });
            })
            .catch((err) => {
                setError(err.message);
            })
            .finally(() => stopUpdating());
    };

    const handleDelete = async (close: () => void) => {
        setError(null);
        startDeleting();

        const url = `${process.env.NEXT_PUBLIC_API}/services/prise-reports/${projectId}/${item.id}`;
        const token = await user?.getIdToken();
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
                setReports((prev) => prev.filter((r) => r.id !== item.id));

                snackbarQueue.add({
                    supportingText: "Successfully deleted record.",
                });
                close();
            })
            .catch((err) => {
                setError(err.message);
            })
            .finally(() => {
                stopDeleting();
            });
    };

    return (
        <Row className={styles.tr}>
            <Cell className={styles.td}>{ind}</Cell>
            <Cell className={styles.td}>{item.Territoire || "-"}</Cell>
            <Cell className={styles.td}>
                {item["Site d'intervention"] || "-"}
            </Cell>
            <Cell className={styles.td}>{item.Infrastructures || "-"}</Cell>
            <Cell className={styles.td}>{item["Latitude"] || "-"}</Cell>
            <Cell className={styles.td}>{item["Longitude"] || "-"}</Cell>
            <Cell className={styles.td}>
                <MenuTrigger>
                    <IconButton
                        color="standard"
                        icon={EllipsisVertical}
                        tooltip="Manage report"
                        onPress={(e) => e.continuePropagation()}
                    />
                    <MenuPopover>
                        <Menu>
                            <MenuItem
                                leadingIcon={Edit}
                                onAction={() => setIsEditOpen(true)}
                                label="Edit"
                            />
                            <MenuItem
                                leadingIcon={Trash2}
                                onAction={() => setIsDeleteOpen(true)}
                                label="Delete"
                            />
                        </Menu>
                    </MenuPopover>
                </MenuTrigger>

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
                                        Confirm Report Deletion
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

                <ModalOverlay isOpen={isEditOpen} onOpenChange={setIsEditOpen}>
                    <SideSheetModal layout="detached">
                        <SideSheet
                            headline="Edit Report"
                            actions={[
                                <Button
                                    type="submit"
                                    key="Save"
                                    form={editFormId}
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
                                    id={editFormId}
                                    onSubmit={(e) => handleEdit(e, close)}
                                    className={styles["form"]}
                                    validationErrors={fieldErr}
                                >
                                    <Input
                                        label="Region"
                                        name="region"
                                        value={item.region}
                                        isReadOnly
                                    />
                                    <Input
                                        label="Territoire"
                                        name="Territoire"
                                        value={item.Territoire}
                                        isReadOnly
                                    />

                                    <Input
                                        label="Site d'intervention"
                                        name="Site d'intervention"
                                        value={item["Site d'intervention"]}
                                        isReadOnly
                                    />

                                    <Input
                                        label="Infrastructures"
                                        name="Infrastructures"
                                        value={item.Infrastructures}
                                        isReadOnly
                                    />

                                    <Input
                                        label="Latitude"
                                        name="Latitude"
                                        defaultValue={item.Latitude}
                                        isReadOnly={isUpdating}
                                    />

                                    <Input
                                        label="Longitude"
                                        name="Longitude"
                                        defaultValue={item.Longitude}
                                        isReadOnly={isUpdating}
                                    />

                                    {error && (
                                        <p
                                            className={clsx(
                                                styles.error,
                                                typography.bodySmall
                                            )}
                                        >
                                            {error}
                                        </p>
                                    )}
                                </Form>
                            )}
                        </SideSheet>
                    </SideSheetModal>
                </ModalOverlay>
            </Cell>
        </Row>
    );
};

export default PriseReportItemComp;
