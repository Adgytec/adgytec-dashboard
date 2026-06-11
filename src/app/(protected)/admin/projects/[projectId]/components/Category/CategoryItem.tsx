import {
    IconButton,
    Menu,
    MenuItem,
    MenuPopover,
    MenuTrigger,
    typography,
    useSnackbarQueue,
} from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import {
    BadgePlus,
    ClipboardPlus,
    Ellipsis,
    SquarePen,
    Trash2,
} from "lucide-react";
import { useState } from "react";
import { copyToClipboard } from "@/helpers/helpers";
import { AddCategory } from "../AddCategory";
import { DeleteCategory } from "../DeleteCategory";
import { UpdateCategory } from "../UpdateCategory";
import styles from "./category.module.css";
import type { CategoryType } from "./types";

export const CategoryItem: React.FC<{
    category: CategoryType;
    isRoot?: boolean;
}> = ({ category, isRoot = false }) => {
    const snackbarQueue = useSnackbarQueue();

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    return (
        <>
            <li>
                <div className={styles.details}>
                    <p className={clsx(typography.bodyLargeEmphasized)}>
                        {category.categoryName}
                    </p>

                    <div className={styles.action}>
                        <MenuTrigger>
                            <IconButton
                                size="extra-small"
                                color="standard"
                                icon={Ellipsis}
                                width="wide"
                            />

                            <MenuPopover>
                                <Menu>
                                    <MenuItem
                                        leadingIcon={BadgePlus}
                                        label="Add"
                                        onAction={() => setIsAddOpen(true)}
                                    />

                                    {!isRoot && (
                                        <>
                                            <MenuItem
                                                leadingIcon={SquarePen}
                                                label="Edit"
                                                onAction={() =>
                                                    setIsEditOpen(true)
                                                }
                                            />

                                            <MenuItem
                                                leadingIcon={Trash2}
                                                label="Delete"
                                                onAction={() =>
                                                    setIsDeleteOpen(true)
                                                }
                                            />

                                            <MenuItem
                                                leadingIcon={ClipboardPlus}
                                                label="Copy ID"
                                                onAction={() => {
                                                    copyToClipboard(
                                                        category.categoryId
                                                    );
                                                    snackbarQueue.add(
                                                        {
                                                            supportingText:
                                                                "Successfully copied category id to clipboard.",
                                                        },
                                                        { timeout: 5000 }
                                                    );
                                                }}
                                            />
                                        </>
                                    )}
                                </Menu>
                            </MenuPopover>
                        </MenuTrigger>
                    </div>
                </div>

                {category.subCategories.length > 0 && (
                    <ul>
                        {category.subCategories.map((item) => (
                            <CategoryItem
                                key={item.categoryId}
                                category={item}
                            />
                        ))}
                    </ul>
                )}
            </li>

            <AddCategory
                categoryID={category.categoryId}
                isOpen={isAddOpen}
                onOpenChange={setIsAddOpen}
            />
            <UpdateCategory
                category={category}
                isOpen={isEditOpen}
                onOpenChange={setIsEditOpen}
            />

            <DeleteCategory
                categoryID={category.categoryId}
                isOpen={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
            />
        </>
    );
};
