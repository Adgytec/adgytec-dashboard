import {
    Button,
    Input,
    ModalOverlay,
    Select,
    SelectItem,
    SelectList,
    SelectPopover,
    SelectTrigger,
    SideSheet,
    SideSheetModal,
    typography,
    useSnackbarQueue,
    validateAndGetFormValues,
} from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import { type ReactNode, useContext, useId, useState } from "react";
import { DialogTrigger, Form } from "react-aria-components";
import { useBoolean } from "usehooks-ts";
import z from "zod";
import { UserContext } from "@/components/AuthContext/authContext";
import { userRoles } from "@/helpers/type";
import {
    NameMinLength,
    RoleSchema,
    type ValidationErrors,
} from "@/helpers/validation";
import type { UserType } from "../User";
import { useUserAction } from "../Users";
import styles from "./editUser.module.css";

const roles = [
    {
        key: userRoles.user,
        displayValue: "User",
    },
    {
        key: userRoles.admin,
        displayValue: "Admin",
    },
    {
        key: userRoles.superAdmin,
        displayValue: "Super Admin",
    },
];

const EditUserSchema = z.object({
    name: z.string().min(NameMinLength),
    role: RoleSchema,
});

export const EditUser: React.FC<{
    children: ReactNode;
    user: UserType;
}> = ({ children, user }) => {
    const { onEditSuccess } = useUserAction();

    const {
        value: isUpdating,
        setTrue: startUpdating,
        setFalse: stopUpdating,
    } = useBoolean();

    const formID = useId();
    const userWithRole = useContext(UserContext);
    const myRole = userWithRole ? userWithRole.role : null;
    const currentUser = userWithRole ? userWithRole.user : null;

    const snackbarQueue = useSnackbarQueue();
    const [fieldErr, setFieldErr] = useState<ValidationErrors | undefined>(
        undefined
    );
    const [formErr, setFormErr] = useState<string | null>(null);

    const updateUser = async (
        e: React.FormEvent<HTMLFormElement>,
        close: () => void
    ) => {
        e.preventDefault();

        const result = validateAndGetFormValues(
            e.currentTarget,
            EditUserSchema
        );
        if (!result.success) {
            setFieldErr(result.errors);
            return;
        }

        const { name, role } = result.data;
        setFormErr(null);
        setFieldErr(undefined);

        startUpdating();
        const url = `${process.env.NEXT_PUBLIC_API}/user/${user.userId}`;
        const token = await currentUser?.getIdToken();
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };
        const body = JSON.stringify({
            name,
            role,
        });

        fetch(url, { method: "PATCH", headers, body })
            .then((res) => res.json())
            .then((res) => {
                if (res.error) throw new Error(res.message);

                onEditSuccess({
                    id: user.userId,
                    name,
                    role,
                });
                snackbarQueue.add({ supportingText: "Updated user details." });
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
        <DialogTrigger>
            {children}

            <ModalOverlay>
                <SideSheetModal layout="detached">
                    <SideSheet
                        headline={`Edit User Profile`}
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
                                onSubmit={(e) => updateUser(e, close)}
                                className={clsx(styles["form"])}
                                validationErrors={fieldErr}
                                id={formID}
                            >
                                <Input
                                    name="name"
                                    type="text"
                                    defaultValue={user.name}
                                    placeholder="Name"
                                    label="Name"
                                    isRequired
                                    isReadOnly={isUpdating}
                                />

                                <Select
                                    label="Role"
                                    placeholder="Role"
                                    name="role"
                                    defaultValue={user.role}
                                    isRequired
                                    isDisabled={isUpdating}
                                >
                                    <SelectTrigger />

                                    <SelectPopover>
                                        <SelectList
                                            items={roles}
                                            color="vibrant"
                                        >
                                            {(role) => {
                                                const disabled =
                                                    myRole ===
                                                    userRoles.superAdmin
                                                        ? false
                                                        : myRole === role.key
                                                          ? true
                                                          : role.key ===
                                                            userRoles.superAdmin;

                                                return (
                                                    <SelectItem
                                                        isDisabled={disabled}
                                                        id={role.key}
                                                        label={
                                                            role.displayValue
                                                        }
                                                    />
                                                );
                                            }}
                                        </SelectList>
                                    </SelectPopover>
                                </Select>

                                {formErr && (
                                    <p
                                        className={clsx(
                                            styles["error-message"],
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
        </DialogTrigger>
    );
};
