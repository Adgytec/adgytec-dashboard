import {
    Button,
    Input,
    ModalOverlay,
    SideSheet,
    SideSheetModal,
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
import { useCategoryActions } from "../Category";

const AddCategorySchema = z.object({
    categoryName: z.string(),
});

export const AddCategory: React.FC<{
    categoryID: string;
    isOpen: boolean;
    onOpenChange: (val: boolean) => void;
}> = ({ categoryID: parentId, isOpen, onOpenChange }) => {
    const { user } = useContext(UserContext) ?? {};

    const { addCategory, projectId } = useCategoryActions();
    const formID = useId();
    const {
        value: isCreating,
        setTrue: startCreating,
        setFalse: stopCreating,
    } = useBoolean();

    const [fieldErr, setFieldErr] = useState<ValidationErrors | undefined>(
        undefined
    );
    const [formErr, setFormErr] = useState<string | null>(null);

    const snackbarQueue = useSnackbarQueue();

    if (!user) {
        return null;
    }

    const addNewCategory = async (
        e: React.FormEvent<HTMLFormElement>,
        close: () => void
    ) => {
        e.preventDefault();

        const result = validateAndGetFormValues(
            e.currentTarget,
            AddCategorySchema
        );
        if (!result.success) {
            setFieldErr(result.errors);
            return;
        }

        setFieldErr(undefined);
        setFormErr(null);

        const { categoryName } = result.data;

        startCreating();

        const url = `${process.env.NEXT_PUBLIC_API}/project/${projectId}/category`;
        const token = await user?.getIdToken();
        const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
        const body = JSON.stringify({
            parentId,
            categoryName,
        });

        fetch(url, {
            method: "POST",
            body,
            headers,
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.error) throw new Error(res.message);

                snackbarQueue.add(
                    { supportingText: "Successfully added new category." },
                    { timeout: 5000 }
                );

                addCategory({
                    parentId,
                    categoryId: res.data.categoryId as string,
                    categoryName,
                });
                close();
            })
            .catch((err) => {
                setFormErr(err.message);
            })
            .finally(stopCreating);
    };

    return (
        <ModalOverlay
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            isKeyboardDismissDisabled={isCreating}
        >
            <SideSheetModal>
                <SideSheet
                    headline="Add Category"
                    actions={[
                        <Button
                            form={formID}
                            key="create"
                            type="submit"
                            isPending={isCreating}
                        >
                            Create
                        </Button>,
                        <Button
                            key="cancel"
                            isDisabled={isCreating}
                            slot="close"
                            color="outlined"
                        >
                            Cancel
                        </Button>,
                    ]}
                >
                    {({ close }) => (
                        <Form
                            validationErrors={fieldErr}
                            id={formID}
                            onSubmit={(e) => addNewCategory(e, close)}
                            style={{
                                display: "grid",
                            }}
                        >
                            <Input
                                name="categoryName"
                                label="Category Name"
                                placeholder="Name"
                                type="text"
                                isRequired
                                isReadOnly={isCreating}
                            />

                            {formErr && (
                                <p
                                    className={clsx(
                                        typography.bodySmall,
                                        "error-message"
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
