import {
    Button,
    Input,
    useSnackbarQueue,
    validateAndGetFormValues,
} from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import { Save } from "lucide-react";
import { useContext, useState } from "react";
import { Form } from "react-aria-components";
import { useBoolean } from "usehooks-ts";
import z from "zod";
import { UserContext } from "@/components/AuthContext/authContext";
import { NameMinLength, type ValidationErrors } from "@/helpers/validation";
import styles from "./editProfile.module.css";

const EditProfileSchema = z.object({
    name: z.string().min(NameMinLength),
});

export const EditUserProfile = () => {
    const {
        value: isUpdating,
        setTrue: startUpdating,
        setFalse: stopUpdating,
    } = useBoolean();

    const [fieldErr, setFieldErr] = useState<ValidationErrors | undefined>(
        undefined
    );

    const snackBarQueue = useSnackbarQueue();

    const { user } = useContext(UserContext) ?? {};
    if (!user) {
        return <div>Something went wrong. Please try again later.</div>;
    }

    const updateName = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const result = validateAndGetFormValues(
            e.currentTarget,
            EditProfileSchema
        );
        if (!result.success) {
            setFieldErr(result.errors);
            return;
        }

        setFieldErr(undefined);
        startUpdating();

        const url = `${process.env.NEXT_PUBLIC_API}/user/${user.uid}`;
        const token = await user.getIdToken();
        fetch(url, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: result.data.name,
            }),
        })
            .then((res) => res.json())
            .then(async (res) => {
                if (res.error) {
                    throw new Error(res.message);
                }

                await user?.reload();
                snackBarQueue.add(
                    {
                        supportingText: "User updated successfully.",
                    },
                    {
                        timeout: 5000,
                    }
                );
            })
            .catch((err) => {
                snackBarQueue.add({ supportingText: err.message });
            })
            .finally(stopUpdating);
    };

    return (
        <div>
            <Form onSubmit={updateName} className={clsx(styles["forms"])}>
                <Input
                    name="name"
                    label="Name"
                    isRequired
                    placeholder="Name"
                    defaultValue={user.displayName ?? ""}
                    minLength={NameMinLength}
                    isReadOnly={isUpdating}
                />

                <Input
                    name="email"
                    label="Email"
                    isReadOnly
                    value={user.email ?? ""}
                />

                <div>
                    <Button type="submit" icon={Save} isPending={isUpdating}>
                        Save
                    </Button>
                </div>
            </Form>
        </div>
    );
};
