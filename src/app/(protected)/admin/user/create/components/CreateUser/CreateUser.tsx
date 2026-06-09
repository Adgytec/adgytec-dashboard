"use client";

import {
    Button,
    Input,
    Select,
    SelectItem,
    SelectList,
    SelectPopover,
    SelectTrigger,
    typography,
    useSnackbarQueue,
    validateAndGetFormValues,
} from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import { useContext, useState } from "react";
import { Form, Heading } from "react-aria-components";
import { useBoolean } from "usehooks-ts";
import z from "zod";
import { UserContext } from "@/components/AuthContext/authContext";
import { userRoles } from "@/helpers/type";
import {
    NameMinLength,
    RoleSchema,
    roles,
    type ValidationErrors,
} from "@/helpers/validation";
import styles from "./createUser.module.css";

const CreateUserSchema = z.object({
    name: z.string().min(NameMinLength),
    email: z.email(),
    role: RoleSchema,
});

export const CreateUser = () => {
    const { user, role: currentUserRole } = useContext(UserContext) ?? {};

    const {
        value: isCreating,
        setTrue: startCreating,
        setFalse: stopCreating,
    } = useBoolean();

    const snackbarQueue = useSnackbarQueue();

    const [fieldErr, setFieldErr] = useState<ValidationErrors | undefined>(
        undefined
    );

    if (!user || !currentUserRole) {
        return <div>Something went wrong. Please try again later.</div>;
    }

    const createNewUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const reset = e.currentTarget.reset;
        const result = validateAndGetFormValues(
            e.currentTarget,
            CreateUserSchema
        );
        if (!result.success) {
            setFieldErr(result.errors);
            return;
        }

        const { name, role, email } = result.data;

        setFieldErr(undefined);
        startCreating();

        const url = `${process.env.NEXT_PUBLIC_API}/user`;
        const token = await user?.getIdToken();
        const body = JSON.stringify({
            name,
            email,
            role,
        });
        const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };

        fetch(url, {
            method: "POST",
            headers,
            body,
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.error) throw new Error(res.message);

                snackbarQueue.add(
                    {
                        supportingText: "User created successfully.",
                    },
                    { timeout: 5000 }
                );
                reset();
            })
            .catch((err) => {
                snackbarQueue.add({ supportingText: err.message });
            })
            .finally(() => {
                stopCreating();
            });
    };

    return (
        <div className={clsx(styles["container"])}>
            <Heading
                className={clsx(styles["heading"], typography.headlineMedium)}
            >
                Create User
            </Heading>

            <Form
                onSubmit={createNewUser}
                validationErrors={fieldErr}
                className={clsx(styles["form"])}
            >
                <Input
                    name="email"
                    label="Email"
                    placeholder="Email"
                    type="email"
                    isRequired
                    isReadOnly={isCreating}
                />

                <div className={clsx(styles["info"])}>
                    <Input
                        name="name"
                        label="Name"
                        placeholder="Name"
                        type="text"
                        minLength={NameMinLength}
                        isRequired
                        isReadOnly={isCreating}
                    />

                    <Select
                        label="Role"
                        placeholder="Role"
                        name="role"
                        isDisabled={isCreating}
                    >
                        <SelectTrigger />

                        <SelectPopover>
                            <SelectList items={roles}>
                                {(role) => {
                                    const disabled =
                                        currentUserRole === userRoles.superAdmin
                                            ? false
                                            : currentUserRole === role.key
                                              ? true
                                              : role.key ===
                                                userRoles.superAdmin;

                                    return (
                                        <SelectItem
                                            id={role.key}
                                            label={role.displayValue}
                                            isDisabled={disabled}
                                        />
                                    );
                                }}
                            </SelectList>
                        </SelectPopover>
                    </Select>
                </div>

                <div className={clsx(styles["action"])}>
                    <Button
                        type="reset"
                        isDisabled={isCreating}
                        color="outlined"
                    >
                        Reset
                    </Button>

                    <Button type="submit" isPending={isCreating}>
                        Create
                    </Button>
                </div>
            </Form>
        </div>
    );
};
