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
import { type CategoryItem, useCategoryActions } from "../Category";

const EditCategorySchema = z.object({
    categoryName: z.string(),
});

export const UpdateCategory: React.FC<{
    category: CategoryItem;
    isOpen: boolean;
    onOpenChange: (val: boolean) => void;
}> = ({ category, isOpen, onOpenChange }) => {
    const { user } = useContext(UserContext) ?? {};

    const { editCategory, projectId } = useCategoryActions();
    const formID = useId();
    const {
        value: isUpdating,
        setTrue: startUpdating,
        setFalse: stopUpdating,
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
            EditCategorySchema
        );
        if (!result.success) {
            setFieldErr(result.errors);
            return;
        }

        setFieldErr(undefined);
        setFormErr(null);

        const { categoryName } = result.data;

        startUpdating();

        const url = `${process.env.NEXT_PUBLIC_API}/project/${projectId}/category/${category.categoryId}`;
        const token = await user?.getIdToken();
        const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
        const body = JSON.stringify({
            categoryName,
        });

        fetch(url, {
            method: "PATCH",
            body,
            headers,
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.error) throw new Error(res.message);

                snackbarQueue.add(
                    { supportingText: "Successfully updated the category." },
                    { timeout: 5000 }
                );

                editCategory({
                    categoryId: category.categoryId,
                    categoryName,
                });
                close();
            })
            .catch((err) => {
                setFormErr(err.message);
            })
            .finally(stopUpdating);
    };

    return (
        <ModalOverlay
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            isKeyboardDismissDisabled={isUpdating}
        >
            <SideSheetModal>
                <SideSheet
                    headline="Edit Category"
                    actions={[
                        <Button
                            form={formID}
                            type="submit"
                            key="edit"
                            isPending={isUpdating}
                        >
                            Update
                        </Button>,
                        <Button
                            key="cancel"
                            isDisabled={isUpdating}
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
                                isReadOnly={isUpdating}
                                defaultValue={category.categoryName}
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
