import {
    Button,
    ComboBox,
    ComboBoxPopover,
    ComboBoxTrigger,
    Input,
    ModalOverlay,
    SelectItem,
    SelectList,
    SideSheet,
    SideSheetModal,
    TextArea,
    typography,
    useSnackbarQueue,
    validateAndGetFormValues,
} from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import { useContext, useId, useMemo, useState } from "react";
import { Form } from "react-aria-components";
import { useBoolean } from "usehooks-ts";
import z from "zod";
import { UserContext } from "@/components/AuthContext/authContext";
import type { ValidationErrors } from "@/helpers/validation";
import {
    type Category,
    ProjectMetadataContext,
    flattenCategories,
} from "../../../context/projectMetadataContext";
import { useBlogActions } from "../../context";
import styles from "./editBlog.module.css";

const EditBlogSchema = z.object({
    title: z.string().min(3, "Blog title too short!"),
    summary: z.string().refine((val) => val.length === 0 || val.length >= 10, {
        message: "Blog summary too short! Minimum length is 10 characters.",
    }),
    category: z.string(),
});

const findCategoryName = (cat: Category, id: string): string | null => {
    if (cat.categoryId === id) return cat.categoryName;

    for (const sub of cat.subCategories) {
        const found = findCategoryName(sub, id);
        if (found) return found;
    }
    return null;
};

export const EditBlog: React.FC<{
    id: string;
    currentTitle: string;
    currentSummary: string;
    currentCategoryId: string;
    currentCategoryName: string;
    isOpen: boolean;
    onOpenChange: (val: boolean) => void;
}> = ({
    id,
    currentTitle,
    currentSummary,
    currentCategoryId,
    currentCategoryName,
    isOpen,
    onOpenChange,
}) => {
    const formID = useId();

    const userWithRole = useContext(UserContext);
    const currentUser = userWithRole ? userWithRole.user : null;
    const projectMetadata = useContext(ProjectMetadataContext);

    const flattenedCategories = useMemo(
        () =>
            projectMetadata
                ? flattenCategories(projectMetadata.categories)
                : [],
        [projectMetadata]
    );

    const { updateBlog, projectID } = useBlogActions();
    const snackbarQueue = useSnackbarQueue();

    const [category, setCategory] = useState({
        id: currentCategoryId,
        name: currentCategoryName,
    });

    const [fieldErr, setFieldErr] = useState<ValidationErrors | undefined>(
        undefined
    );
    const [formErr, setFormErr] = useState<string | null>(null);

    const {
        value: isUpdating,
        setTrue: startUpdating,
        setFalse: stopUpdating,
    } = useBoolean();

    const editBlog = async (
        e: React.FormEvent<HTMLFormElement>,
        close: () => void
    ) => {
        e.preventDefault();

        const result = validateAndGetFormValues(
            e.currentTarget,
            EditBlogSchema
        );
        if (!result.success) {
            setFieldErr(result.errors);
            return;
        }

        const { title, summary } = result.data;
        setFormErr(null);
        setFieldErr(undefined);

        startUpdating();
        const url = `${process.env.NEXT_PUBLIC_API}/services/blogs/${projectID}/${id}`;
        const token = await currentUser?.getIdToken();
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };
        const body = JSON.stringify({
            title,
            summary,
            category: category.id,
        });

        fetch(url, { method: "PATCH", headers, body })
            .then((res) => res.json())
            .then((res) => {
                if (res.error) throw new Error(res.message);

                updateBlog(id, {
                    title,
                    summary,
                    category: {
                        id: category.id,
                        name: category.name,
                    },
                });
                snackbarQueue.add(
                    { supportingText: "Updated blog details." },
                    { timeout: 5000 }
                );
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
                    headline={`Edit Blog Details`}
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
                            onSubmit={(e) => editBlog(e, close)}
                            className={clsx(styles["form"])}
                            validationErrors={fieldErr}
                            id={formID}
                        >
                            <Input
                                name="title"
                                defaultValue={currentTitle}
                                placeholder="Title"
                                label="Title"
                                isRequired
                                isReadOnly={isUpdating}
                            />

                            <TextArea
                                name="summary"
                                defaultValue={currentSummary}
                                placeholder="Summary"
                                label="Summary"
                                isReadOnly={isUpdating}
                                rows={5}
                            />

                            <ComboBox
                                label="Category"
                                name="category"
                                isDisabled={isUpdating}
                                value={category.id}
                                onChange={(key) => {
                                    const id = String(key);

                                    const selectedCategory =
                                        flattenedCategories.find(
                                            (cat) => cat.categoryId === id
                                        );

                                    setCategory({
                                        id,
                                        name:
                                            selectedCategory?.categoryName ??
                                            "default",
                                    });
                                }}
                            >
                                <ComboBoxTrigger placeholder="Select Category" />

                                <ComboBoxPopover>
                                    <SelectList items={flattenedCategories}>
                                        {(item) => (
                                            <SelectItem
                                                key={item.categoryId}
                                                id={item.categoryId}
                                                label={item.categoryName}
                                            />
                                        )}
                                    </SelectList>
                                </ComboBoxPopover>
                            </ComboBox>

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
