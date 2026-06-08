import {
    Button,
    Input,
    InputButton,
    useSnackbarQueue,
    validateAndGetFormValues,
} from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Form } from "react-aria-components";
import { useBoolean } from "usehooks-ts";
import z from "zod";
import { changePassword } from "@/firebase/auth/auth";
import { PasswordLength, type ValidationErrors } from "@/helpers/validation";
import styles from "./changePassword.module.css";

const ChangePasswordSchema = z
    .object({
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z
            .string()
            .min(8, "Password must be at least 8 characters"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const ChangePassword = () => {
    const { value: showPassword, toggle: togglePasswordVisibility } =
        useBoolean();
    const {
        value: showConfirmPassword,
        toggle: toggleConfirmPasswordVisibility,
    } = useBoolean();

    const {
        value: isChanging,
        setTrue: startChanging,
        setFalse: stopChaning,
    } = useBoolean();

    const [fieldErr, setFieldErr] = useState<ValidationErrors | undefined>(
        undefined
    );

    const snackBarQueue = useSnackbarQueue();

    const updatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const reset = e.currentTarget.reset;

        const result = validateAndGetFormValues(
            e.currentTarget,
            ChangePasswordSchema
        );
        if (!result.success) {
            setFieldErr(result.errors);
            return;
        }

        setFieldErr(undefined);
        startChanging();
        const err = await changePassword(result.data.password);
        stopChaning();

        if (err) {
            snackBarQueue.add({ supportingText: err.message });
            return;
        }

        reset();
        snackBarQueue.add(
            {
                supportingText: "Password changed successfully",
            },
            {
                timeout: 5000,
            }
        );
    };

    return (
        <div>
            <Form
                onSubmit={updatePassword}
                validationErrors={fieldErr}
                className={clsx(styles["form"])}
            >
                <Input
                    name="password"
                    placeholder="Password"
                    label="Password"
                    isRequired
                    type={showPassword ? "text" : "password"}
                    trailing={
                        <InputButton
                            onPress={togglePasswordVisibility}
                            icon={showPassword ? EyeOff : Eye}
                        />
                    }
                    minLength={PasswordLength}
                    isReadOnly={isChanging}
                />

                <Input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Password"
                    description="Both password should match"
                    label="Confirm Password"
                    isRequired
                    minLength={PasswordLength}
                    trailing={
                        <InputButton
                            onPress={toggleConfirmPasswordVisibility}
                            icon={showConfirmPassword ? EyeOff : Eye}
                        />
                    }
                    isReadOnly={isChanging}
                />

                <div>
                    <Button type="submit" isPending={isChanging}>
                        Update
                    </Button>
                </div>
            </Form>
        </div>
    );
};
